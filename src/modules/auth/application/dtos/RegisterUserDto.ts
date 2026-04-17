import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  language: z.enum(['es', 'en']).default('es'),
  timezone: z.string().min(1, 'Timezone is required'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['super_admin', 'admin', 'support', 'user']).optional(),
});

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;

export interface RegisterUserResponseDto {
  id: string;
  email: string;
  language: string;
  timezone: string;
  role: string | null;
  person: {
    firstName: string;
    lastName: string;
  };
}
