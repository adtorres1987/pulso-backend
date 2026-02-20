import { IRoleRepository, RoleResult } from '../../domain/repositories/IRoleRepository';
import { AppError } from '../../../../middlewares/errorHandler';

export class GetRoleByIdUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string): Promise<RoleResult> {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }
}
