import { NextFunction, Request, Response } from 'express';
import { CreateRecurringTransactionSchema, UpdateRecurringTransactionSchema } from '../../application/dtos/RecurringTransactionDto';

export function validateCreate(req: Request, res: Response, next: NextFunction): void {
  const result = CreateRecurringTransactionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  req.body = result.data;
  next();
}

export function validateUpdate(req: Request, res: Response, next: NextFunction): void {
  const result = UpdateRecurringTransactionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  req.body = result.data;
  next();
}
