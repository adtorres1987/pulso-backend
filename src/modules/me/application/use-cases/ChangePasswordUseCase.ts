import bcrypt from 'bcryptjs';
import { AppError } from '../../../../middlewares/errorHandler';
import { IMeRepository } from '../../domain/repositories/IMeRepository';
import { ChangePasswordDto } from '../dtos/MeDto';

export class ChangePasswordUseCase {
  constructor(private readonly meRepository: IMeRepository) {}

  async execute(userId: string, dto: ChangePasswordDto): Promise<void> {
    const passwordHash = await this.meRepository.findPasswordHash(userId);
    if (!passwordHash) throw new AppError('User not found', 404);

    const valid = await bcrypt.compare(dto.currentPassword, passwordHash);
    if (!valid) throw new AppError('La contraseña actual es incorrecta', 400);

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.meRepository.updatePassword(userId, newHash);
  }
}
