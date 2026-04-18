import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  STAGE_TRANSITIONS,
  TransactionStage,
} from './constants/transaction.constants';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  private calculateBreakdown(
    serviceFee: number,
    listingAgent: string,
    sellingAgent: string,
  ): Record<string, { amount: number; role: string }> {
    const agencyShare = serviceFee * 0.5;
    const breakdown: Record<string, { amount: number; role: string }> = {
      agency: {
        amount: agencyShare,
        role: 'agency',
      },
    };

    if (listingAgent === sellingAgent) {
      breakdown[listingAgent] = {
        amount: serviceFee * 0.5,
        role: 'listing and selling agent',
      };
    } else {
      breakdown[listingAgent] = {
        amount: serviceFee * 0.25,
        role: 'listing agent',
      };
      breakdown[sellingAgent] = {
        amount: serviceFee * 0.25,
        role: 'selling agent',
      };
    }

    return breakdown;
  }

  private validateStageTransition(
    currentStage: TransactionStage,
    newStage: TransactionStage,
  ): boolean {
    if (currentStage === newStage) {
      return true;
    }

    return STAGE_TRANSITIONS[currentStage]?.includes(newStage) ?? false;
  }

  private isValidMongoId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  private normalizeBreakdown(
    breakdown:
      | Map<string, number | { amount: number; role: string }>
      | Record<string, number | { amount: number; role: string }>,
  ): Record<string, { amount: number; role: string }> {
    const normalizeEntry = (
      value: number | { amount: number; role: string },
      key: string,
    ) =>
      typeof value === 'number'
        ? {
            amount: value,
            role: key === 'agency' ? 'agency' : 'agent',
          }
        : value;

    if (breakdown instanceof Map) {
      return Object.fromEntries(
        Array.from(breakdown.entries(), ([key, value]) => [key, normalizeEntry(value, key)]),
      );
    }

    return Object.entries(breakdown).reduce(
      (acc, [key, value]) => {
        acc[key] = normalizeEntry(value, key);
        return acc;
      },
      {} as Record<string, { amount: number; role: string }>,
    );
  }

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    if (!dto.propertyId?.trim()) {
      throw new BadRequestException('Property ID cannot be empty');
    }

    if (!dto.listingAgent?.trim() || !dto.sellingAgent?.trim()) {
      throw new BadRequestException('Agent names cannot be empty');
    }

    const breakdown = this.calculateBreakdown(
      dto.serviceFee,
      dto.listingAgent,
      dto.sellingAgent,
    );

    const newTransaction = new this.transactionModel({
      ...dto,
      breakdown,
      stage: 'agreement',
    });

    return newTransaction.save();
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionModel.find().exec();
  }

  async findOne(id: string): Promise<Transaction | null> {
    if (!this.isValidMongoId(id)) {
      throw new BadRequestException(`Invalid transaction ID format: ${id}`);
    }

    const transaction = await this.transactionModel.findById(id).exec();

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async update(
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction | null> {
    if (!this.isValidMongoId(id)) {
      throw new BadRequestException(`Invalid transaction ID format: ${id}`);
    }

    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (dto.propertyId !== undefined && !dto.propertyId.trim()) {
      throw new BadRequestException('Property ID cannot be empty');
    }

    if (
      (dto.listingAgent !== undefined && !dto.listingAgent.trim()) ||
      (dto.sellingAgent !== undefined && !dto.sellingAgent.trim())
    ) {
      throw new BadRequestException('Agent names cannot be empty');
    }

    const needsBreakdownRecalculation =
      dto.serviceFee !== undefined ||
      dto.listingAgent !== undefined ||
      dto.sellingAgent !== undefined;

    if (needsBreakdownRecalculation) {
      const serviceFee = dto.serviceFee ?? transaction.serviceFee;
      const listingAgent = dto.listingAgent ?? transaction.listingAgent;
      const sellingAgent = dto.sellingAgent ?? transaction.sellingAgent;

      const newBreakdown = this.calculateBreakdown(
        serviceFee,
        listingAgent,
        sellingAgent,
      );

      Object.assign(dto, { breakdown: newBreakdown });
    }

    return this.transactionModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<{ message: string; deletedId: string }> {
    if (!this.isValidMongoId(id)) {
      throw new BadRequestException(`Invalid transaction ID format: ${id}`);
    }

    const deletedTransaction = await this.transactionModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedTransaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return {
      message: 'Transaction deleted successfully',
      deletedId: id,
    };
  }

  async getBreakdown(id: string): Promise<{
    transactionId: string;
    breakdown: Record<string, { amount: number; role: string }>;
    total: number;
  }> {
    const transaction = await this.findOne(id);

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const breakdown = this.normalizeBreakdown(
      transaction.breakdown as
        | Map<string, { amount: number; role: string }>
        | Record<string, { amount: number; role: string }>,
    );
    const total = Object.values(breakdown).reduce(
      (sum, value) => sum + value.amount,
      0,
    );

    return {
      transactionId: id,
      breakdown,
      total,
    };
  }

  async getAgentEarnings(agentName: string): Promise<{
    agentName: string;
    totalEarnings: number;
    transactionCount: number;
  }> {
    const transactions = await this.transactionModel.find().exec();

    let totalEarnings = 0;
    let transactionCount = 0;

    for (const tx of transactions) {
      const breakdown = this.normalizeBreakdown(
        tx.breakdown as
          | Map<string, { amount: number; role: string }>
          | Record<string, { amount: number; role: string }>,
      );
      if (breakdown?.[agentName]) {
        totalEarnings += breakdown[agentName].amount;
        transactionCount++;
      }
    }

    return {
      agentName,
      totalEarnings,
      transactionCount,
    };
  }
}
