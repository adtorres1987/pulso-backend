import { NextFunction, Request, Response } from 'express';
import { CreatePermissionSchema, UpdatePermissionSchema } from '../../application/dtos/PermissionDto';

export const validateCreatePermission = (req: Request, res: Response, next: NextFunction) => {
  const result = CreatePermissionSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateUpdatePermission = (req: Request, res: Response, next: NextFunction) => {
  const result = UpdatePermissionSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};
