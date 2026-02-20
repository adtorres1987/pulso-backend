import { NextFunction, Request, Response } from 'express';
import { CreateSnapshotSchema, UpdateSnapshotSchema } from '../../application/dtos/SnapshotDto';

export const validateCreateSnapshot = (req: Request, res: Response, next: NextFunction) => {
  const result = CreateSnapshotSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateUpdateSnapshot = (req: Request, res: Response, next: NextFunction) => {
  const result = UpdateSnapshotSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};
