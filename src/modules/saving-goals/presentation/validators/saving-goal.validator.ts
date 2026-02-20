import { NextFunction, Request, Response } from 'express';
import { CreateSavingGoalSchema, DepositSchema, UpdateSavingGoalSchema } from '../../application/dtos/SavingGoalDto';

export const validateCreateSavingGoal = (req: Request, res: Response, next: NextFunction) => {
  const result = CreateSavingGoalSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateUpdateSavingGoal = (req: Request, res: Response, next: NextFunction) => {
  const result = UpdateSavingGoalSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateDeposit = (req: Request, res: Response, next: NextFunction) => {
  const result = DepositSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};
