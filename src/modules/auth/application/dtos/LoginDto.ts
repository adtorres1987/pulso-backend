import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export interface LoginResponseDto {
  token: string;
  user: {
    id: string;
    email: string;
    language: string;
    timezone: string;
    role: string | null;
  };
}
