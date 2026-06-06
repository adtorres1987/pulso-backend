import { z } from 'zod';

const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const frequencyEnum = z.enum(['daily', 'weekly', 'monthly', 'yearly']);
const transactionTypeEnum = z.enum(['expense', 'income']);
const emotionTagEnum = z.enum(['need', 'impulse', 'emotional']);

export const CreateRecurringTransactionSchema = z.object({
  type: transactionTypeEnum,
  amount: z.number().positive(),
  categoryId: z.string().uuid().optional(),
  note: z.string().min(1).optional(),
  emotionTag: emotionTagEnum.optional(),
  frequency: frequencyEnum,
  startDate: z.string().regex(DATE_REGEX, 'startDate must be YYYY-MM-DD'),
  endDate: z.string().regex(DATE_REGEX, 'endDate must be YYYY-MM-DD').optional(),
});

export const UpdateRecurringTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  note: z.string().min(1).nullable().optional(),
  emotionTag: emotionTagEnum.nullable().optional(),
  frequency: frequencyEnum.optional(),
  endDate: z.string().regex(DATE_REGEX).nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateRecurringTransactionDto = z.infer<typeof CreateRecurringTransactionSchema>;
export type UpdateRecurringTransactionDto = z.infer<typeof UpdateRecurringTransactionSchema>;
