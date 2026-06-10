import { NextFunction, Request, Response } from 'express';
import { CreateAccountSchema, UpdateAccountSchema } from '../../application/dtos/AccountDto';

export const validateCreateAccount = (req: Request, res: Response, next: NextFunction) => {
  const result = CreateAccountSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateUpdateAccount = (req: Request, res: Response, next: NextFunction) => {
  const result = UpdateAccountSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};
