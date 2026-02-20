import { AppError } from '../../../../middlewares/errorHandler';
import { IMeRepository, MeResult, UpdateProfileData } from '../../domain/repositories/IMeRepository';

export class UpdateProfileUseCase {
  constructor(private readonly meRepository: IMeRepository) {}

  async execute(userId: string, data: UpdateProfileData): Promise<MeResult> {
    const user = await this.meRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return this.meRepository.updateProfile(userId, data);
  }
}
