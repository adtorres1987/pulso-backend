import { NextFunction, Response } from 'express';
import { RoleType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from './errorHandler';
import { AuthRequest } from '../types';

export const authorize = (allowedRoles: RoleType[]) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { role: { select: { name: true } } },
      });

      if (!user?.role || !allowedRoles.includes(user.role.name)) {
        return next(new AppError('Forbidden', 403));
      }

      return next();
    } catch {
      return next(new AppError('Forbidden', 403));
    }
  };
};
