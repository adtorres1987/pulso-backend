import { NextFunction, Request, Response } from 'express';
import {
  AdminUserFiltersSchema,
  ResetPasswordAdminSchema,
  UpdateAdminUserSchema,
} from '../../application/dtos/AdminUserDto';

export const validateAdminUserFilters = (req: Request, res: Response, next: NextFunction) => {
  const result = AdminUserFiltersSchema.safeParse(req.query);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  (req as Request & { parsedQuery?: unknown }).parsedQuery = result.data;
  return next();
};

export const validateUpdateAdminUser = (req: Request, res: Response, next: NextFunction) => {
  const result = UpdateAdminUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateResetAdminUserPassword = (req: Request, res: Response, next: NextFunction) => {
  const result = ResetPasswordAdminSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};
