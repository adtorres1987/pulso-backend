import { IPermissionRepository, PermissionResult } from '../../domain/repositories/IPermissionRepository';
import { CreatePermissionDto } from '../dtos/PermissionDto';
import { AppError } from '../../../../middlewares/errorHandler';

export class CreatePermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(dto: CreatePermissionDto): Promise<PermissionResult> {
    const exists = await this.permissionRepository.actionExists(dto.action);
    if (exists) throw new AppError(`Permission '${dto.action}' already exists`, 409);

    return this.permissionRepository.create(dto);
  }
}
