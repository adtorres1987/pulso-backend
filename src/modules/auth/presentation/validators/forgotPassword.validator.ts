import { NextFunction, Request, Response } from 'express';
import { ForgotPasswordSchema } from '../../application/dtos/ForgotPasswordDto';

export const validateForgotPassword = (req: Request, res: Response, next: NextFunction) => {
  const result = ForgotPasswordSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return res.status(422).json({ success: false, errors });
  }
  req.body = result.data;
  return next();
};
