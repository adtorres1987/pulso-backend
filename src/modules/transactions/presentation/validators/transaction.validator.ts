import { NextFunction, Request, Response } from 'express';
import { CreateTransactionSchema, TransactionFiltersSchema, UpdateTransactionSchema } from '../../application/dtos/TransactionDto';

export const validateCreateTransaction = (req: Request, res: Response, next: NextFunction) => {
  const result = CreateTransactionSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateUpdateTransaction = (req: Request, res: Response, next: NextFunction) => {
  const result = UpdateTransactionSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateTransactionFilters = (req: Request, res: Response, next: NextFunction) => {
  const result = TransactionFiltersSchema.safeParse(req.query);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.query = result.data as Record<string, string>;
  return next();
};
