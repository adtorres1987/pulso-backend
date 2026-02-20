import { IRoleRepository } from '../../domain/repositories/IRoleRepository';
import { AppError } from '../../../../middlewares/errorHandler';

export class DeleteRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new AppError('Role not found', 404);

    await this.roleRepository.delete(id);
  }
}
