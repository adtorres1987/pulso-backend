import { z } from 'zod';

export const CreateGroupSchema = z.object({
  name: z.string().min(1).max(100),
});

export const UpdateGroupSchema = z.object({
  name: z.string().min(1).max(100),
});

export const AddMemberSchema = z.object({
  userId: z.string().uuid(),
});

export const CreateGroupExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  occurredAt: z.coerce.date(),
  shares: z
    .array(z.object({ groupMemberId: z.string().uuid(), amount: z.number().positive() }))
    .min(1),
});

export type CreateGroupDto = z.infer<typeof CreateGroupSchema>;
export type UpdateGroupDto = z.infer<typeof UpdateGroupSchema>;
export type AddMemberDto = z.infer<typeof AddMemberSchema>;
export type CreateGroupExpenseDto = z.infer<typeof CreateGroupExpenseSchema>;
