import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ResetPasswordDto } from '../dtos/ResetPasswordDto';
import { AppError } from '../../../../middlewares/errorHandler';

export class ResetPasswordUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    const record = await this.userRepository.findPasswordResetToken(dto.token);

    if (!record || record.expiresAt < new Date()) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.updatePassword(record.userId, passwordHash);
    await this.userRepository.deletePasswordResetToken(dto.token);
  }
}
