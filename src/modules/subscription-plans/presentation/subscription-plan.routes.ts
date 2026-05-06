import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { authorize } from '../../../middlewares/authorize';
import { PrismaSubscriptionPlanRepository } from '../infrastructure/repositories/PrismaSubscriptionPlanRepository';
import { GetAllSubscriptionPlansUseCase } from '../application/use-cases/GetAllSubscriptionPlansUseCase';
import { GetSubscriptionPlanByIdUseCase } from '../application/use-cases/GetSubscriptionPlanByIdUseCase';
import { CreateSubscriptionPlanUseCase } from '../application/use-cases/CreateSubscriptionPlanUseCase';
import { UpdateSubscriptionPlanUseCase } from '../application/use-cases/UpdateSubscriptionPlanUseCase';
import { DeleteSubscriptionPlanUseCase } from '../application/use-cases/DeleteSubscriptionPlanUseCase';
import { SubscriptionPlanController } from './SubscriptionPlanController';
import { validateCreateSubscriptionPlan, validateUpdateSubscriptionPlan } from './validators/subscription-plan.validator';

const router = Router();
const repo = new PrismaSubscriptionPlanRepository();
const controller = new SubscriptionPlanController(
  new GetAllSubscriptionPlansUseCase(repo),
  new GetSubscriptionPlanByIdUseCase(repo),
  new CreateSubscriptionPlanUseCase(repo),
  new UpdateSubscriptionPlanUseCase(repo),
  new DeleteSubscriptionPlanUseCase(repo),
);

const adminAuth = [authenticate, authorize(['admin', 'super_admin'])];

router.get('/', ...adminAuth, controller.index);
router.get('/:id', ...adminAuth, controller.show);
router.post('/', ...adminAuth, validateCreateSubscriptionPlan, controller.store);
router.patch('/:id', ...adminAuth, validateUpdateSubscriptionPlan, controller.patch);
router.delete('/:id', ...adminAuth, controller.destroy);

export default router;
