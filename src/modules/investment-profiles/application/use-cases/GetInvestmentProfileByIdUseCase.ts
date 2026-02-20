import { AppError } from '../../../../middlewares/errorHandler';
import { IInvestmentProfileRepository, InvestmentProfileResult } from '../../domain/repositories/IInvestmentProfileRepository';

export class GetInvestmentProfileByIdUseCase {
  constructor(private readonly investmentProfileRepository: IInvestmentProfileRepository) {}

  async execute(id: string, userId: string): Promise<InvestmentProfileResult> {
    const profile = await this.investmentProfileRepository.findByIdAndUser(id, userId);
    if (!profile) throw new AppError('Investment profile not found', 404);
    return profile;
  }
}
