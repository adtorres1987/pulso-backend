import { z } from 'zod';

export const AdminUserFiltersSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().min(1).optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform((v) => {
      const n = v ? parseInt(v, 10) : 20;
      return Math.min(100, Math.max(1, n));
    }),
});

export const UpdateAdminUserSchema = z.object({
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  birthDate: z
    .string()
    .date()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  country: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
});

export const ResetPasswordAdminSchema = z
  .object({
    newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma la contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type AdminUserFiltersDto = z.infer<typeof AdminUserFiltersSchema>;
export type UpdateAdminUserDto = z.infer<typeof UpdateAdminUserSchema>;
export type ResetPasswordAdminDto = z.infer<typeof ResetPasswordAdminSchema>;
