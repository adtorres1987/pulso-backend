import { Router } from 'express';
import { PrismaMeRepository } from '../infrastructure/repositories/PrismaMeRepository';
import { GetMeUseCase } from '../application/use-cases/GetMeUseCase';
import { UpdateProfileUseCase } from '../application/use-cases/UpdateProfileUseCase';
import { ChangePasswordUseCase } from '../application/use-cases/ChangePasswordUseCase';
import { MeController } from './MeController';
import { validateUpdateProfile, validateChangePassword } from './validators/me.validator';
import { authenticate } from '../../../middlewares/auth';

const router = Router();

const meRepository = new PrismaMeRepository();
const meController = new MeController(
  new GetMeUseCase(meRepository),
  new UpdateProfileUseCase(meRepository),
  new ChangePasswordUseCase(meRepository),
);

router.get('/', authenticate, meController.get);
router.patch('/', authenticate, validateUpdateProfile, meController.update);
router.patch('/password', authenticate, validateChangePassword, meController.password);

export default router;
