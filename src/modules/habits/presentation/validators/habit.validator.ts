import { NextFunction, Request, Response } from 'express';
import { CreateHabitSchema, LogHabitSchema, UpdateHabitSchema } from '../../application/dtos/HabitDto';

export const validateCreateHabit = (req: Request, res: Response, next: NextFunction) => {
  const result = CreateHabitSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateUpdateHabit = (req: Request, res: Response, next: NextFunction) => {
  const result = UpdateHabitSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateLogHabit = (req: Request, res: Response, next: NextFunction) => {
  const result = LogHabitSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};
