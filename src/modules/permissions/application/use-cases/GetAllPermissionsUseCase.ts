import { IPermissionRepository, PermissionResult } from '../../domain/repositories/IPermissionRepository';

export class GetAllPermissionsUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(): Promise<PermissionResult[]> {
    return this.permissionRepository.findAll();
  }
}
