import { NextFunction, Request, Response } from 'express';
import { CreateInvestmentProfileSchema, UpdateInvestmentProfileSchema } from '../../application/dtos/InvestmentProfileDto';

export const validateCreateInvestmentProfile = (req: Request, res: Response, next: NextFunction) => {
  const result = CreateInvestmentProfileSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateUpdateInvestmentProfile = (req: Request, res: Response, next: NextFunction) => {
  const result = UpdateInvestmentProfileSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};
