import { z } from 'zod';

export const CreateRoleSchema = z.object({
  name: z.enum(['super_admin', 'admin', 'support', 'user']),
  description: z.string().min(1).optional(),
});

export const UpdateRoleSchema = z.object({
  description: z.string().min(1).optional(),
});

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;
