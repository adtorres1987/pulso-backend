import { AppError } from '../../../../middlewares/errorHandler';
import { ISavingGoalRepository } from '../../domain/repositories/ISavingGoalRepository';

export class DeleteSavingGoalUseCase {
  constructor(private readonly savingGoalRepository: ISavingGoalRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const goal = await this.savingGoalRepository.findByIdAndUser(id, userId);
    if (!goal) throw new AppError('Saving goal not found', 404);
    await this.savingGoalRepository.delete(id);
  }
}
