import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { authorize } from '../../../middlewares/authorize';
import { PrismaAppConfigRepository } from '../infrastructure/repositories/PrismaAppConfigRepository';
import { GetAllAppConfigUseCase } from '../application/use-cases/GetAllAppConfigUseCase';
import { UpdateAppConfigUseCase } from '../application/use-cases/UpdateAppConfigUseCase';
import { AppConfigController } from './AppConfigController';
import { validateUpdateAppConfig } from './validators/app-config.validator';

const router = Router();

const repo = new PrismaAppConfigRepository();
const controller = new AppConfigController(
  new GetAllAppConfigUseCase(repo),
  new UpdateAppConfigUseCase(repo),
);

router.get('/', authenticate, authorize(['admin', 'super_admin']), controller.getConfig);
router.patch('/:key', authenticate, authorize(['admin', 'super_admin']), validateUpdateAppConfig, controller.updateConfig);

export default router;
