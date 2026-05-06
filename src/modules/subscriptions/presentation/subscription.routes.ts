import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { PrismaSubscriptionRepository } from '../infrastructure/repositories/PrismaSubscriptionRepository';
import { GetMySubscriptionUseCase } from '../application/use-cases/GetMySubscriptionUseCase';
import { CancelSubscriptionUseCase } from '../application/use-cases/CancelSubscriptionUseCase';
import { SubscriptionController } from './SubscriptionController';

const router = Router();
const repo = new PrismaSubscriptionRepository();
const controller = new SubscriptionController(
  new GetMySubscriptionUseCase(repo),
  new CancelSubscriptionUseCase(repo),
);

router.get('/me', authenticate, controller.getMine);
router.delete('/me', authenticate, controller.cancel);

export default router;
