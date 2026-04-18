import { ApiProperty } from '@nestjs/swagger';
import type { TransactionStage } from '../constants/transaction.constants';

export class TransactionResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ example: 'prop-123' })
  propertyId: string;

  @ApiProperty({ example: 'john' })
  listingAgent: string;

  @ApiProperty({ example: 'jane' })
  sellingAgent: string;

  @ApiProperty({ example: 10000 })
  serviceFee: number;

  @ApiProperty({ example: 'agreement' })
  stage: TransactionStage;

  @ApiProperty({
    example: {
      agency: { amount: 5000, role: 'agency' },
      john: { amount: 2500, role: 'listing agent' },
      jane: { amount: 2500, role: 'selling agent' },
    },
    additionalProperties: {
      type: 'object',
      properties: {
        amount: { type: 'number' },
        role: { type: 'string' },
      },
    },
  })
  breakdown: Record<string, { amount: number; role: string }>;

  @ApiProperty({ example: '2026-04-17T12:00:00.000Z' })
  createdAt?: Date;

  @ApiProperty({ example: '2026-04-17T12:00:00.000Z' })
  updatedAt?: Date;
}

export class DeleteTransactionResponseDto {
  @ApiProperty({ example: 'Transaction deleted successfully' })
  message: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  deletedId: string;
}

export class BreakdownResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  transactionId: string;

  @ApiProperty({
    example: {
      agency: { amount: 5000, role: 'agency' },
      john: { amount: 2500, role: 'listing agent' },
      jane: { amount: 2500, role: 'selling agent' },
    },
    additionalProperties: {
      type: 'object',
      properties: {
        amount: { type: 'number' },
        role: { type: 'string' },
      },
    },
  })
  breakdown: Record<string, { amount: number; role: string }>;

  @ApiProperty({ example: 10000 })
  total: number;
}

export class AgentEarningsResponseDto {
  @ApiProperty({ example: 'john' })
  agentName: string;

  @ApiProperty({ example: 7500 })
  totalEarnings: number;

  @ApiProperty({ example: 3 })
  transactionCount: number;
}
