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

router.get('/', authenticate, roleController.getAll);
router.get('/:id', authenticate, roleController.getOne);
router.post('/', authenticate, validateCreateRole, roleController.create);
router.patch('/:id', authenticate, validateUpdateRole, roleController.update);
router.delete('/:id', authenticate, roleController.remove);

export default router;
