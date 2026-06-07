import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { PrismaPushTokenRepository } from '../infrastructure/repositories/PrismaPushTokenRepository';
import { UpsertPushTokenUseCase } from '../application/use-cases/UpsertPushTokenUseCase';
import { DeletePushTokenUseCase } from '../application/use-cases/DeletePushTokenUseCase';
import { PushTokenController } from './PushTokenController';

const router = Router();

const repo = new PrismaPushTokenRepository();
const controller = new PushTokenController(
  new UpsertPushTokenUseCase(repo),
  new DeletePushTokenUseCase(repo),
);

router.post('/', authenticate, controller.register);
router.delete('/:token', authenticate, controller.remove);

export default router;
