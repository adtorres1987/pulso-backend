import bcrypt from 'bcryptjs';
import { AppError } from '../../../../middlewares/errorHandler';
import { IAdminUserRepository } from '../../domain/repositories/IAdminUserRepository';
import { ResetPasswordAdminDto } from '../dtos/AdminUserDto';

export class ResetClientUserPasswordUseCase {
  constructor(private readonly adminUserRepository: IAdminUserRepository) {}

  async execute(id: string, dto: ResetPasswordAdminDto): Promise<void> {
    const user = await this.adminUserRepository.findClientUserById(id);
    if (!user) throw new AppError('User not found', 404);

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.adminUserRepository.resetPassword(id, hashedPassword);
  }
}
