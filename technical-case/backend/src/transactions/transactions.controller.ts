import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import {
  AgentEarningsResponseDto,
  BreakdownResponseDto,
  DeleteTransactionResponseDto,
  TransactionResponseDto,
} from './dto/transaction-response.dto';
import { Transaction } from './schemas/transaction.schema';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly service: TransactionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async create(@Body() dto: CreateTransactionDto): Promise<Transaction> {
    this.logger.debug(`Creating transaction: ${JSON.stringify(dto)}`);
    return this.service.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all transactions' })
  @ApiOkResponse({ type: TransactionResponseDto, isArray: true })
  async findAll(): Promise<Transaction[]> {
    this.logger.debug('Fetching all transactions');
    return this.service.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a transaction by id' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findOne(@Param('id') id: string): Promise<Transaction | null> {
    this.logger.debug(`Fetching transaction: ${id}`);
    return this.service.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<Transaction | null> {
    this.logger.debug(`Updating transaction ${id}: ${JSON.stringify(dto)}`);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiOkResponse({ type: DeleteTransactionResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async remove(
    @Param('id') id: string,
  ): Promise<{ message: string; deletedId: string }> {
    this.logger.debug(`Deleting transaction: ${id}`);
    return this.service.remove(id);
  }

  @Get(':id/breakdown')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get commission breakdown for a transaction' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiOkResponse({ type: BreakdownResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async getBreakdown(@Param('id') id: string): Promise<{
    transactionId: string;
    breakdown: Record<string, { amount: number; role: string }>;
    total: number;
  }> {
    this.logger.debug(`Getting breakdown for transaction: ${id}`);
    return this.service.getBreakdown(id);
  }

  @Get('agent/:agentName/earnings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get total earnings for an agent' })
  @ApiParam({ name: 'agentName', example: 'john' })
  @ApiOkResponse({ type: AgentEarningsResponseDto })
  async getAgentEarnings(@Param('agentName') agentName: string): Promise<{
    agentName: string;
    totalEarnings: number;
    transactionCount: number;
  }> {
    this.logger.debug(`Getting earnings for agent: ${agentName}`);
    return this.service.getAgentEarnings(agentName);
  }
}
