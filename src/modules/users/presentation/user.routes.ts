import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { prisma } from '../../../config/prisma';
import { sendSuccess } from '../../../utils/response';
import { AppError } from '../../../middlewares/errorHandler';
import { AuthRequest } from '../../../types';

const router = Router();

router.get('/lookup', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const email = (req.query.email as string | undefined)?.trim().toLowerCase();
    if (!email) throw new AppError('email query param is required', 400);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        person: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    if (!user) throw new AppError('User not found', 404);

    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
});

export default router;
