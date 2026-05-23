import { Request, Response, NextFunction } from 'express';
import { CreateAppConfigSchema, UpdateAppConfigSchema } from '../../application/dtos/AppConfigDto';

export const validateCreateAppConfig = (req: Request, res: Response, next: NextFunction): void => {
  const result = CreateAppConfigSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ success: false, fieldErrors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
};

export const validateUpdateAppConfig = (req: Request, res: Response, next: NextFunction): void => {
  const result = UpdateAppConfigSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ success: false, fieldErrors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
};
