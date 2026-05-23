import { IPermissionRepository, PaginatedPermissions } from '../../domain/repositories/IPermissionRepository';

export class GetAllPermissionsUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(page: number, limit: number): Promise<PaginatedPermissions> {
    return this.permissionRepository.findAll(page, limit);
  }
}
