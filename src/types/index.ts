import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  token?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
