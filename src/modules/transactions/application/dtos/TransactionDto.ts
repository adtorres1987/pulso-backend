import { z } from 'zod';

const transactionTypeEnum = z.enum(['expense', 'income']);
const emotionTagEnum = z.enum(['need', 'impulse', 'emotional']);

export const CreateTransactionSchema = z.object({
  amount: z.number().positive(),
  type: transactionTypeEnum,
  emotionTag: emotionTagEnum.optional(),
  note: z.string().min(1).optional(),
  occurredAt: z.string().datetime().transform((v) => new Date(v)),
  categoryId: z.string().uuid().optional(),
  dailySnapshotId: z.string().uuid().optional(),
});

export const UpdateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  type: transactionTypeEnum.optional(),
  emotionTag: emotionTagEnum.optional(),
  note: z.string().min(1).optional(),
  occurredAt: z.string().datetime().optional().transform((v) => (v ? new Date(v) : undefined)),
  categoryId: z.string().uuid().optional(),
});

export const TransactionFiltersSchema = z.object({
  type: transactionTypeEnum.optional(),
  categoryId: z.string().uuid().optional(),
  emotionTag: emotionTagEnum.optional(),
  startDate: z.string().date().optional().transform((v) => (v ? new Date(v) : undefined)),
  endDate: z.string().date().optional().transform((v) => (v ? new Date(v) : undefined)),
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;
export type TransactionFiltersDto = z.infer<typeof TransactionFiltersSchema>;
