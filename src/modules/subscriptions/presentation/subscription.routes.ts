import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { PrismaSubscriptionRepository } from '../infrastructure/repositories/PrismaSubscriptionRepository';
import { PrismaSubscriptionPlanRepository } from '../../subscription-plans/infrastructure/repositories/PrismaSubscriptionPlanRepository';
import { PrismaMeRepository } from '../../me/infrastructure/repositories/PrismaMeRepository';
import { GetMySubscriptionUseCase } from '../application/use-cases/GetMySubscriptionUseCase';
import { CancelSubscriptionUseCase } from '../application/use-cases/CancelSubscriptionUseCase';
import { CreateCheckoutSessionUseCase } from '../application/use-cases/CreateCheckoutSessionUseCase';
import { SubscriptionController } from './SubscriptionController';

const router = Router();

const repo = new PrismaSubscriptionRepository();
const planRepo = new PrismaSubscriptionPlanRepository();
const meRepo = new PrismaMeRepository();

const controller = new SubscriptionController(
  new GetMySubscriptionUseCase(repo),
  new CancelSubscriptionUseCase(repo),
  new CreateCheckoutSessionUseCase(repo, planRepo, meRepo),
);

router.get('/me', authenticate, controller.getMine);
router.delete('/me', authenticate, controller.cancel);
router.post('/checkout', authenticate, controller.checkout);

export default router;
