import { z } from 'zod';

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export const CreateBudgetSchema = z.object({
  categoryId: z.string().uuid().optional(),
  amount: z.number().positive(),
  month: z.string().regex(MONTH_REGEX, 'month must be YYYY-MM'),
});

export const UpdateBudgetSchema = z.object({
  amount: z.number().positive(),
});

export type CreateBudgetDto = z.infer<typeof CreateBudgetSchema>;
export type UpdateBudgetDto = z.infer<typeof UpdateBudgetSchema>;
