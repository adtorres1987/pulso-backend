import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { RegisterUserSchema } from '../../application/dtos/RegisterUserDto';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const result = RegisterUserSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return res.status(422).json({ success: false, errors });
  }

  req.body = result.data;
  return next();
};
