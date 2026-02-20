import { RoleType } from '@prisma/client';
import { IRoleRepository, RoleResult } from '../../domain/repositories/IRoleRepository';
import { CreateRoleDto } from '../dtos/RoleDto';
import { AppError } from '../../../../middlewares/errorHandler';

export class CreateRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(dto: CreateRoleDto): Promise<RoleResult> {
    const exists = await this.roleRepository.nameExists(dto.name as RoleType);
    if (exists) throw new AppError(`Role '${dto.name}' already exists`, 409);

    return this.roleRepository.create({
      name: dto.name as RoleType,
      description: dto.description,
    });
  }
}
