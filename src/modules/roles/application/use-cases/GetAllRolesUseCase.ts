import { IRoleRepository, PaginatedRoles } from '../../domain/repositories/IRoleRepository';

export class GetAllRolesUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(page: number, limit: number): Promise<PaginatedRoles> {
    return this.roleRepository.findAll(page, limit);
  }
}
