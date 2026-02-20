import { AppError } from '../../../../middlewares/errorHandler';
import { IInvestmentProfileRepository } from '../../domain/repositories/IInvestmentProfileRepository';

export class DeleteInvestmentProfileUseCase {
  constructor(private readonly investmentProfileRepository: IInvestmentProfileRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const profile = await this.investmentProfileRepository.findByIdAndUser(id, userId);
    if (!profile) throw new AppError('Investment profile not found', 404);
    await this.investmentProfileRepository.delete(id);
  }
}
