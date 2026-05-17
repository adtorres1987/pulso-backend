import { Router } from 'express';
import { PrismaMeRepository } from '../infrastructure/repositories/PrismaMeRepository';
import { GetMeUseCase } from '../application/use-cases/GetMeUseCase';
import { UpdateProfileUseCase } from '../application/use-cases/UpdateProfileUseCase';
import { ChangePasswordUseCase } from '../application/use-cases/ChangePasswordUseCase';
import { UploadAvatarUseCase } from '../application/use-cases/UploadAvatarUseCase';
import { MeController } from './MeController';
import { validateUpdateProfile, validateChangePassword } from './validators/me.validator';
import { authenticate } from '../../../middlewares/auth';
import { uploadImage } from '../../../middlewares/upload';

const router = Router();

const meRepository = new PrismaMeRepository();
const meController = new MeController(
  new GetMeUseCase(meRepository),
  new UpdateProfileUseCase(meRepository),
  new ChangePasswordUseCase(meRepository),
  new UploadAvatarUseCase(meRepository),
);

router.get('/', authenticate, meController.get);
router.patch('/', authenticate, validateUpdateProfile, meController.update);
router.patch('/password', authenticate, validateChangePassword, meController.password);
router.post('/avatar', authenticate, uploadImage, meController.avatar);

export default router;
