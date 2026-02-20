import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, message?: string) => {
  const body: ApiResponse<T> = { success: true, data, message };
  return res.status(statusCode).json(body);
};

export const sendError = (res: Response, error: string, statusCode = 400) => {
  const body: ApiResponse = { success: false, error };
  return res.status(statusCode).json(body);
};
