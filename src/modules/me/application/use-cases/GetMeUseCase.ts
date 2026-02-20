import { AppError } from '../../../../middlewares/errorHandler';
import { IMeRepository, MeResult } from '../../domain/repositories/IMeRepository';

export class GetMeUseCase {
  constructor(private readonly meRepository: IMeRepository) {}

  async execute(userId: string): Promise<MeResult> {
    const user = await this.meRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }
}
