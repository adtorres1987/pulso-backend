import { NextFunction, Request, Response } from 'express';
import { CreateCategorySchema, UpdateCategorySchema } from '../../application/dtos/CategoryDto';

export const validateCreateCategory = (req: Request, res: Response, next: NextFunction) => {
  const result = CreateCategorySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateUpdateCategory = (req: Request, res: Response, next: NextFunction) => {
  const result = UpdateCategorySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};
