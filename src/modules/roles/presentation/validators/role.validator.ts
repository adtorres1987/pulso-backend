import { NextFunction, Request, Response } from 'express';
import { CreateRoleSchema, UpdateRoleSchema } from '../../application/dtos/RoleDto';

export const validateCreateRole = (req: Request, res: Response, next: NextFunction) => {
  const result = CreateRoleSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateUpdateRole = (req: Request, res: Response, next: NextFunction) => {
  const result = UpdateRoleSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};
