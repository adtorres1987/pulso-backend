import { AppError } from '../../../../middlewares/errorHandler';
import { ISavingGoalRepository, SavingGoalResult } from '../../domain/repositories/ISavingGoalRepository';

export class GetSavingGoalByIdUseCase {
  constructor(private readonly savingGoalRepository: ISavingGoalRepository) {}

  async execute(id: string, userId: string): Promise<SavingGoalResult> {
    const goal = await this.savingGoalRepository.findByIdAndUser(id, userId);
    if (!goal) throw new AppError('Saving goal not found', 404);
    return goal;
  }
}
