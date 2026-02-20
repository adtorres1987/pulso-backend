import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../../../config/env';
import { IJwtService, JwtPayload, JwtSignPayload } from '../../domain/services/IJwtService';
import { AppError } from '../../../../middlewares/errorHandler';

export class JwtService implements IJwtService {
  sign(payload: JwtSignPayload): string {
    return jwt.sign({ ...payload, jti: crypto.randomUUID() }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  verify(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }
  }
}
