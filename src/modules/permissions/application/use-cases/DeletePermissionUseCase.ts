import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository';
import { AppError } from '../../../../middlewares/errorHandler';

export class DeletePermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(id: string): Promise<void> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) throw new AppError('Permission not found', 404);

    await this.permissionRepository.delete(id);
  }
}
