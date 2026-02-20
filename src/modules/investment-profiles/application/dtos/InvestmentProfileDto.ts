import { z } from 'zod';

const strategyEnum = z.enum(['conservative', 'balanced', 'long_term']);

export const CreateInvestmentProfileSchema = z.object({
  strategy: strategyEnum,
  monthlyAmount: z.number().positive(),
  expectedReturn: z.number().min(0).max(100),
});

export const UpdateInvestmentProfileSchema = z.object({
  strategy: strategyEnum.optional(),
  monthlyAmount: z.number().positive().optional(),
  expectedReturn: z.number().min(0).max(100).optional(),
});

export type CreateInvestmentProfileDto = z.infer<typeof CreateInvestmentProfileSchema>;
export type UpdateInvestmentProfileDto = z.infer<typeof UpdateInvestmentProfileSchema>;
