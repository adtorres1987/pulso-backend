import { IRoleRepository, RoleResult } from '../../domain/repositories/IRoleRepository';
import { UpdateRoleDto } from '../dtos/RoleDto';
import { AppError } from '../../../../middlewares/errorHandler';

export class UpdateRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string, dto: UpdateRoleDto): Promise<RoleResult> {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new AppError('Role not found', 404);

    return this.roleRepository.update(id, dto);
  }
}
