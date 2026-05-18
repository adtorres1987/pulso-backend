import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { PrismaSubscriptionPlanRepository } from '../infrastructure/repositories/PrismaSubscriptionPlanRepository';
import { sendSuccess } from '../../../utils/response';

const router = Router();
const repo = new PrismaSubscriptionPlanRepository();

router.get('/', authenticate, async (_req, res, next) => {
  try {
    const plans = await repo.findAll();
    sendSuccess(res, plans.filter((p) => p.isActive));
  } catch (err) {
    next(err);
  }
});

export default router;
