import {
  AdminUserFilters,
  AdminUserListResult,
  IAdminUserRepository,
} from '../../domain/repositories/IAdminUserRepository';
import { AdminUserFiltersDto } from '../dtos/AdminUserDto';

export class ListClientUsersUseCase {
  constructor(private readonly adminUserRepository: IAdminUserRepository) {}

  async execute(dto: AdminUserFiltersDto): Promise<AdminUserListResult> {
    const filters: AdminUserFilters = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };

    return this.adminUserRepository.findClientUsers(filters, dto.page, dto.limit);
  }
}
