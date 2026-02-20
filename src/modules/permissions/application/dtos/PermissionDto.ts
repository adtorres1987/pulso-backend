import { z } from 'zod';

const actionRegex = /^[a-z_]+:[a-z_]+$/;

export const CreatePermissionSchema = z.object({
  action: z
    .string()
    .regex(actionRegex, "Action must follow 'resource:operation' format (e.g. users:read)"),
  description: z.string().min(1).optional(),
});

export const UpdatePermissionSchema = z.object({
  action: z
    .string()
    .regex(actionRegex, "Action must follow 'resource:operation' format")
    .optional(),
  description: z.string().min(1).optional(),
});

export type CreatePermissionDto = z.infer<typeof CreatePermissionSchema>;
export type UpdatePermissionDto = z.infer<typeof UpdatePermissionSchema>;
