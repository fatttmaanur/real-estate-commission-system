export const TRANSACTION_STAGES = [
  'agreement',
  'earnest_money',
  'title_deed',
  'completed',
] as const;

export type TransactionStage = (typeof TRANSACTION_STAGES)[number];

export const STAGE_TRANSITIONS: Record<TransactionStage, TransactionStage[]> = {
  agreement: ['earnest_money'],
  earnest_money: ['title_deed'],
  title_deed: ['completed'],
  completed: [],
};
