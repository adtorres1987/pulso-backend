import { IPermissionRepository, PermissionResult } from '../../domain/repositories/IPermissionRepository';
import { UpdatePermissionDto } from '../dtos/PermissionDto';
import { AppError } from '../../../../middlewares/errorHandler';

export class UpdatePermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(id: string, dto: UpdatePermissionDto): Promise<PermissionResult> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) throw new AppError('Permission not found', 404);

    if (dto.action && dto.action !== permission.action) {
      const exists = await this.permissionRepository.actionExists(dto.action);
      if (exists) throw new AppError(`Permission '${dto.action}' already exists`, 409);
    }

    return this.permissionRepository.update(id, dto);
  }
}
