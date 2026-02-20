import { IPermissionRepository, PermissionResult } from '../../domain/repositories/IPermissionRepository';
import { AppError } from '../../../../middlewares/errorHandler';

export class GetPermissionByIdUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(id: string): Promise<PermissionResult> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) throw new AppError('Permission not found', 404);
    return permission;
  }
}
