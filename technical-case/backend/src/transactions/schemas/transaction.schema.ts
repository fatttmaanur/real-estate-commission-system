// src/transactions/schemas/transaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TRANSACTION_STAGES } from '../constants/transaction.constants';
import type { TransactionStage } from '../constants/transaction.constants';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true, versionKey: false })
export class Transaction {
  @Prop({ required: true })
  propertyId: string;

  @Prop({ required: true })
  listingAgent: string;

  @Prop({ required: true })
  sellingAgent: string;

  @Prop({ required: true })
  serviceFee: number;

  @Prop({
    type: String,
    enum: TRANSACTION_STAGES,
    default: 'agreement',
  })
  stage: TransactionStage;

  @Prop({ type: Object, default: {} })
  breakdown: Record<string, { amount: number; role: string }>;

  createdAt?: Date;

  updatedAt?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
