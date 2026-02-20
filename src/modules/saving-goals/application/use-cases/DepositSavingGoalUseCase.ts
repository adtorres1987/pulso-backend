import { AppError } from '../../../../middlewares/errorHandler';
import { ISavingGoalRepository, SavingGoalResult } from '../../domain/repositories/ISavingGoalRepository';
import { DepositDto } from '../dtos/SavingGoalDto';

export class DepositSavingGoalUseCase {
  constructor(private readonly savingGoalRepository: ISavingGoalRepository) {}

  async execute(id: string, userId: string, dto: DepositDto): Promise<SavingGoalResult> {
    const goal = await this.savingGoalRepository.findByIdAndUser(id, userId);
    if (!goal) throw new AppError('Saving goal not found', 404);
    return this.savingGoalRepository.deposit(id, dto.amount);
  }
}
