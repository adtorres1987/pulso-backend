import { z } from 'zod';

export const UpdateAppConfigSchema = z.object({
  value: z.string().min(1),
});

export type UpdateAppConfigDto = z.infer<typeof UpdateAppConfigSchema>;
