import { NextFunction, Request, Response } from 'express';
import { GetAllRolesUseCase } from '../application/use-cases/GetAllRolesUseCase';
import { GetRoleByIdUseCase } from '../application/use-cases/GetRoleByIdUseCase';
import { CreateRoleUseCase } from '../application/use-cases/CreateRoleUseCase';
import { UpdateRoleUseCase } from '../application/use-cases/UpdateRoleUseCase';
import { DeleteRoleUseCase } from '../application/use-cases/DeleteRoleUseCase';
import { sendSuccess } from '../../../utils/response';

export class RoleController {
  constructor(
    private readonly getAllRoles: GetAllRolesUseCase,
    private readonly getRoleById: GetRoleByIdUseCase,
    private readonly createRole: CreateRoleUseCase,
    private readonly updateRole: UpdateRoleUseCase,
    private readonly deleteRole: DeleteRoleUseCase,
  ) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await this.getAllRoles.execute();
      sendSuccess(res, roles);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = await this.getRoleById.execute(req.params.id);
      sendSuccess(res, role);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = await this.createRole.execute(req.body);
      sendSuccess(res, role, 201, 'Role created');
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = await this.updateRole.execute(req.params.id, req.body);
      sendSuccess(res, role, 200, 'Role updated');
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteRole.execute(req.params.id);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  };
}
