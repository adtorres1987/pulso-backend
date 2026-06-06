import { NextFunction, Request, Response } from 'express';
import { CreateBudgetSchema, UpdateBudgetSchema } from '../../application/dtos/BudgetDto';

export const validateCreateBudget = (req: Request, res: Response, next: NextFunction) => {
  const result = CreateBudgetSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateUpdateBudget = (req: Request, res: Response, next: NextFunction) => {
  const result = UpdateBudgetSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};
