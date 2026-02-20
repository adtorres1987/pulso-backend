import { IInvestmentProfileRepository, InvestmentProfileResult } from '../../domain/repositories/IInvestmentProfileRepository';

export class GetAllInvestmentProfilesUseCase {
  constructor(private readonly investmentProfileRepository: IInvestmentProfileRepository) {}

  async execute(userId: string): Promise<InvestmentProfileResult[]> {
    return this.investmentProfileRepository.findAllByUser(userId);
  }
}
