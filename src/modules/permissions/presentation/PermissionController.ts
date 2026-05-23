import { NextFunction, Request, Response } from 'express';
import { GetAllPermissionsUseCase } from '../application/use-cases/GetAllPermissionsUseCase';
import { GetPermissionByIdUseCase } from '../application/use-cases/GetPermissionByIdUseCase';
import { CreatePermissionUseCase } from '../application/use-cases/CreatePermissionUseCase';
import { UpdatePermissionUseCase } from '../application/use-cases/UpdatePermissionUseCase';
import { DeletePermissionUseCase } from '../application/use-cases/DeletePermissionUseCase';
import { sendSuccess } from '../../../utils/response';

export class PermissionController {
  constructor(
    private readonly getAllPermissions: GetAllPermissionsUseCase,
    private readonly getPermissionById: GetPermissionByIdUseCase,
    private readonly createPermission: CreatePermissionUseCase,
    private readonly updatePermission: UpdatePermissionUseCase,
    private readonly deletePermission: DeletePermissionUseCase,
  ) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const result = await this.getAllPermissions.execute(page, limit);
      sendSuccess(res, { ...result, page, limit });
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permission = await this.getPermissionById.execute(req.params.id);
      sendSuccess(res, permission);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permission = await this.createPermission.execute(req.body);
      sendSuccess(res, permission, 201, 'Permission created');
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permission = await this.updatePermission.execute(req.params.id, req.body);
      sendSuccess(res, permission, 200, 'Permission updated');
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deletePermission.execute(req.params.id);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  };
}
