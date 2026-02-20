import { z } from 'zod';

const transactionTypeEnum = z.enum(['expense', 'income']);

export const CreateCategorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1).optional(),
  type: transactionTypeEnum,
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  icon: z.string().min(1).optional(),
  type: transactionTypeEnum.optional(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
