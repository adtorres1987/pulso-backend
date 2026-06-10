import { z } from 'zod';

const accountTypeEnum = z.enum(['cash', 'debit', 'credit', 'savings']);

export const CreateAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: accountTypeEnum,
  initialBalance: z.number().default(0),
  currency: z.string().length(3).default('MXN'),
  isDefault: z.boolean().default(false),
});

export const UpdateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: accountTypeEnum.optional(),
  initialBalance: z.number().optional(),
  currency: z.string().length(3).optional(),
  isDefault: z.boolean().optional(),
});

export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;
