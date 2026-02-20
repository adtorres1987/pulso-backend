import { IRoleRepository, RoleResult } from '../../domain/repositories/IRoleRepository';

export class GetAllRolesUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(): Promise<RoleResult[]> {
    return this.roleRepository.findAll();
  }
}
