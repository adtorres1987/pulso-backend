import { IInvestmentProfileRepository, PaginatedInvestmentProfiles } from '../../domain/repositories/IInvestmentProfileRepository';

export class GetAllInvestmentProfilesUseCase {
  constructor(private readonly investmentProfileRepository: IInvestmentProfileRepository) {}

  async execute(userId: string, page: number, limit: number): Promise<PaginatedInvestmentProfiles> {
    return this.investmentProfileRepository.findAllByUser(userId, page, limit);
  }
}
