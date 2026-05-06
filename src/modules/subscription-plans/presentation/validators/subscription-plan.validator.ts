import { Request, Response, NextFunction } from 'express';
import { CreateSubscriptionPlanSchema, UpdateSubscriptionPlanSchema } from '../../application/dtos/SubscriptionPlanDto';

export const validateCreateSubscriptionPlan = (req: Request, res: Response, next: NextFunction): void => {
  const result = CreateSubscriptionPlanSchema.safeParse(req.body);
  if (!result.success) { res.status(422).json({ success: false, fieldErrors: result.error.flatten().fieldErrors }); return; }
  req.body = result.data; next();
};

export const validateUpdateSubscriptionPlan = (req: Request, res: Response, next: NextFunction): void => {
  const result = UpdateSubscriptionPlanSchema.safeParse(req.body);
  if (!result.success) { res.status(422).json({ success: false, fieldErrors: result.error.flatten().fieldErrors }); return; }
  req.body = result.data; next();
};
