import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  birthDate: z.string().date().optional().transform((v) => (v ? new Date(v) : undefined)),
  country: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
