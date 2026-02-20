import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { redis } from '../config/redis';
import { AppError } from './errorHandler';
import { AuthRequest } from '../types';

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; jti?: string };

    if (payload.jti) {
      const isBlacklisted = await redis.exists(`blacklist:${payload.jti}`);
      if (isBlacklisted) return next(new AppError('Token has been revoked', 401));
    }

    req.userId = payload.userId;
    req.token = token;
    return next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError('Invalid or expired token', 401));
  }
};
