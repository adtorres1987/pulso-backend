import { IInvestmentProfileRepository, InvestmentProfileResult } from '../../domain/repositories/IInvestmentProfileRepository';
import { CreateInvestmentProfileDto } from '../dtos/InvestmentProfileDto';

export class CreateInvestmentProfileUseCase {
  constructor(private readonly investmentProfileRepository: IInvestmentProfileRepository) {}

  async execute(userId: string, dto: CreateInvestmentProfileDto): Promise<InvestmentProfileResult> {
    return this.investmentProfileRepository.create({ userId, ...dto });
  }
}
