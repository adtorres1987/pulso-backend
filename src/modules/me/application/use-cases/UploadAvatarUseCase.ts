import { cloudinaryService } from '../../../../services/cloudinary.service';
import { AppError } from '../../../../middlewares/errorHandler';
import { IMeRepository, MeResult } from '../../domain/repositories/IMeRepository';

export class UploadAvatarUseCase {
  constructor(private readonly meRepository: IMeRepository) {}

  async execute(userId: string, buffer: Buffer): Promise<MeResult> {
    const user = await this.meRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const { url } = await cloudinaryService.upload(buffer, 'avatars', `user_${userId}`);
    return this.meRepository.updateProfile(userId, { avatarUrl: url });
  }
}
