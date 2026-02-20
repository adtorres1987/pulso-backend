import { Router } from 'express';
import { PrismaPermissionRepository } from '../infrastructure/repositories/PrismaPermissionRepository';
import { GetAllPermissionsUseCase } from '../application/use-cases/GetAllPermissionsUseCase';
import { GetPermissionByIdUseCase } from '../application/use-cases/GetPermissionByIdUseCase';
import { CreatePermissionUseCase } from '../application/use-cases/CreatePermissionUseCase';
import { UpdatePermissionUseCase } from '../application/use-cases/UpdatePermissionUseCase';
import { DeletePermissionUseCase } from '../application/use-cases/DeletePermissionUseCase';
import { PermissionController } from './PermissionController';
import { validateCreatePermission, validateUpdatePermission } from './validators/permission.validator';
import { authenticate } from '../../../middlewares/auth';

const router = Router();

// Dependency injection (manual)
const permissionRepository = new PrismaPermissionRepository();
const permissionController = new PermissionController(
  new GetAllPermissionsUseCase(permissionRepository),
  new GetPermissionByIdUseCase(permissionRepository),
  new CreatePermissionUseCase(permissionRepository),
  new UpdatePermissionUseCase(permissionRepository),
  new DeletePermissionUseCase(permissionRepository),
);

router.get('/', authenticate, permissionController.getAll);
router.get('/:id', authenticate, permissionController.getOne);
router.post('/', authenticate, validateCreatePermission, permissionController.create);
router.patch('/:id', authenticate, validateUpdatePermission, permissionController.update);
router.delete('/:id', authenticate, permissionController.remove);

export default router;
