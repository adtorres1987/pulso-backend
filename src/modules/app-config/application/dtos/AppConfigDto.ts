import { z } from 'zod';

export const CreateAppConfigSchema = z.object({
  key: z.string().min(1).regex(/^[a-z0-9_]+$/, 'Key must be lowercase letters, numbers, or underscores'),
  value: z.string().min(1),
  description: z.string().optional(),
});

export const UpdateAppConfigSchema = z.object({
  value: z.string().min(1).optional(),
  description: z.string().optional(),
}).refine((d) => d.value !== undefined || d.description !== undefined, {
  message: 'At least one of value or description must be provided',
});

export type CreateAppConfigDto = z.infer<typeof CreateAppConfigSchema>;
export type UpdateAppConfigDto = z.infer<typeof UpdateAppConfigSchema>;
