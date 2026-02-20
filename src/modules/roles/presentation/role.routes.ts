import { Router } from 'express';
import { PrismaRoleRepository } from '../infrastructure/repositories/PrismaRoleRepository';
import { GetAllRolesUseCase } from '../application/use-cases/GetAllRolesUseCase';
import { GetRoleByIdUseCase } from '../application/use-cases/GetRoleByIdUseCase';
import { CreateRoleUseCase } from '../application/use-cases/CreateRoleUseCase';
import { UpdateRoleUseCase } from '../application/use-cases/UpdateRoleUseCase';
import { DeleteRoleUseCase } from '../application/use-cases/DeleteRoleUseCase';
import { RoleController } from './RoleController';
import { validateCreateRole, validateUpdateRole } from './validators/role.validator';
import { authenticate } from '../../../middlewares/auth';
import { authorize } from '../../../middlewares/authorize';

const router = Router();

// Dependency injection (manual)
const roleRepository = new PrismaRoleRepository();
const roleController = new RoleController(
  new GetAllRolesUseCase(roleRepository),
  new GetRoleByIdUseCase(roleRepository),
  new CreateRoleUseCase(roleRepository),
  new UpdateRoleUseCase(roleRepository),
  new DeleteRoleUseCase(roleRepository),
);

const adminOnly = authorize(['admin', 'super_admin']);

router.get('/', authenticate, adminOnly, roleController.getAll);
router.get('/:id', authenticate, adminOnly, roleController.getOne);
router.post('/', authenticate, adminOnly, validateCreateRole, roleController.create);
router.patch('/:id', authenticate, adminOnly, validateUpdateRole, roleController.update);
router.delete('/:id', authenticate, adminOnly, roleController.remove);

export default router;
