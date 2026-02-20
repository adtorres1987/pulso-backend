import { z } from 'zod';

export const CreateSavingGoalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  targetDate: z.string().date().optional().transform((v) => (v ? new Date(v) : undefined)),
});

export const UpdateSavingGoalSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  targetDate: z.string().date().optional().transform((v) => (v ? new Date(v) : undefined)),
});

export const DepositSchema = z.object({
  amount: z.number().positive(),
});

export type CreateSavingGoalDto = z.infer<typeof CreateSavingGoalSchema>;
export type UpdateSavingGoalDto = z.infer<typeof UpdateSavingGoalSchema>;
export type DepositDto = z.infer<typeof DepositSchema>;
