import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from './errorHandler';
import { AuthRequest } from '../types';

export const requireSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const sub = await prisma.subscription.findUnique({ where: { userId: req.userId! } });

  if (!sub) {
    return next(new AppError('No active subscription', 403));
  }

  const now = new Date();

  if (sub.status === 'trial' && sub.trialEndsAt > now) {
    return next();
  }

  if (sub.status === 'active' && sub.currentPeriodEnd > now) {
    return next();
  }

  // Trial expired — mark as expired automatically
  if (sub.status === 'trial' && sub.trialEndsAt <= now) {
    await prisma.subscription.update({ where: { userId: req.userId! }, data: { status: 'expired' } });
  }

  next(new AppError('Subscription required. Your trial or plan has expired.', 403));
};
