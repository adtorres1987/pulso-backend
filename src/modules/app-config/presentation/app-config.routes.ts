import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { authorize } from '../../../middlewares/authorize';
import { PrismaAppConfigRepository } from '../infrastructure/repositories/PrismaAppConfigRepository';
import { GetAllAppConfigUseCase } from '../application/use-cases/GetAllAppConfigUseCase';
import { GetAppConfigByKeyUseCase } from '../application/use-cases/GetAppConfigByKeyUseCase';
import { CreateAppConfigUseCase } from '../application/use-cases/CreateAppConfigUseCase';
import { UpdateAppConfigUseCase } from '../application/use-cases/UpdateAppConfigUseCase';
import { DeleteAppConfigUseCase } from '../application/use-cases/DeleteAppConfigUseCase';
import { AppConfigController } from './AppConfigController';
import { validateCreateAppConfig, validateUpdateAppConfig } from './validators/app-config.validator';

const router = Router();

const repo = new PrismaAppConfigRepository();
const controller = new AppConfigController(
  new GetAllAppConfigUseCase(repo),
  new GetAppConfigByKeyUseCase(repo),
  new CreateAppConfigUseCase(repo),
  new UpdateAppConfigUseCase(repo),
  new DeleteAppConfigUseCase(repo),
);

const auth = [authenticate, authorize(['admin', 'super_admin'])];

router.get('/', ...auth, controller.index);
router.get('/:key', ...auth, controller.show);
router.post('/', ...auth, validateCreateAppConfig, controller.store);
router.patch('/:key', ...auth, validateUpdateAppConfig, controller.patch);
router.delete('/:key', ...auth, controller.destroy);

export default router;
