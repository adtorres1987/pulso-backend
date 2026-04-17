import { Router } from 'express';
import { PrismaAdminUserRepository } from '../infrastructure/repositories/PrismaAdminUserRepository';
import { ListClientUsersUseCase } from '../application/use-cases/ListClientUsersUseCase';
import { GetClientUserByIdUseCase } from '../application/use-cases/GetClientUserByIdUseCase';
import { UpdateClientUserUseCase } from '../application/use-cases/UpdateClientUserUseCase';
import { ResetClientUserPasswordUseCase } from '../application/use-cases/ResetClientUserPasswordUseCase';
import { AdminUserController } from './AdminUserController';
import {
  validateAdminUserFilters,
  validateResetAdminUserPassword,
  validateUpdateAdminUser,
} from './validators/admin-user.validator';
import { authenticate } from '../../../middlewares/auth';
import { authorize } from '../../../middlewares/authorize';

const router = Router();

// Dependency injection (manual)
const adminUserRepository = new PrismaAdminUserRepository();
const adminUserController = new AdminUserController(
  new ListClientUsersUseCase(adminUserRepository),
  new GetClientUserByIdUseCase(adminUserRepository),
  new UpdateClientUserUseCase(adminUserRepository),
  new ResetClientUserPasswordUseCase(adminUserRepository),
);

const adminOnly = authorize(['admin', 'super_admin']);
const superAdminOnly = authorize(['super_admin']);

router.get('/', authenticate, adminOnly, validateAdminUserFilters, adminUserController.getAll);
router.get('/:id', authenticate, adminOnly, adminUserController.getOne);
router.patch('/:id', authenticate, adminOnly, validateUpdateAdminUser, adminUserController.update);
router.patch(
  '/:id/password',
  authenticate,
  superAdminOnly,
  validateResetAdminUserPassword,
  adminUserController.resetPassword,
);

export default router;
