import { NextFunction, Request, Response } from 'express';
import { ChangePasswordSchema, UpdateProfileSchema } from '../../application/dtos/MeDto';

export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
  const result = UpdateProfileSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateChangePassword = (req: Request, res: Response, next: NextFunction) => {
  const result = ChangePasswordSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};
