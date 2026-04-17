import { AppError } from '../../../../middlewares/errorHandler';
import {
  AdminUserResult,
  IAdminUserRepository,
  UpdateAdminUserData,
} from '../../domain/repositories/IAdminUserRepository';
import { UpdateAdminUserDto } from '../dtos/AdminUserDto';

export class UpdateClientUserUseCase {
  constructor(private readonly adminUserRepository: IAdminUserRepository) {}

  async execute(id: string, dto: UpdateAdminUserDto): Promise<AdminUserResult> {
    const user = await this.adminUserRepository.findClientUserById(id);
    if (!user) throw new AppError('User not found', 404);

    const data: UpdateAdminUserData = {
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.birthDate !== undefined && { birthDate: dto.birthDate }),
      ...(dto.country !== undefined && { country: dto.country }),
      ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
    };

    return this.adminUserRepository.updateClientUser(id, data);
  }
}
