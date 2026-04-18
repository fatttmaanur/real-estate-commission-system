import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TRANSACTION_STAGES } from '../constants/transaction.constants';
import type { TransactionStage } from '../constants/transaction.constants';

export class CreateTransactionDto {
  @ApiProperty({ example: 'prop-123' })
  @IsNotEmpty()
  @IsString()
  propertyId: string;

  @ApiProperty({ example: 'john' })
  @IsNotEmpty()
  @IsString()
  listingAgent: string;

  @ApiProperty({ example: 'jane' })
  @IsNotEmpty()
  @IsString()
  sellingAgent: string;

  @ApiProperty({ example: 10000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Service fee cannot be negative' })
  serviceFee: number;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional({ example: 'prop-123' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({ example: 'john' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  listingAgent?: string;

  @ApiPropertyOptional({ example: 'jane' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  sellingAgent?: string;

  @ApiPropertyOptional({ example: 12000 })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Service fee cannot be negative' })
  serviceFee?: number;

  @ApiPropertyOptional({
    enum: TRANSACTION_STAGES,
    example: 'earnest_money',
  })
  @IsOptional()
  @IsEnum(TRANSACTION_STAGES, {
    message:
      'Stage must be one of: agreement, earnest_money, title_deed, completed',
  })
  stage?: TransactionStage;
}
