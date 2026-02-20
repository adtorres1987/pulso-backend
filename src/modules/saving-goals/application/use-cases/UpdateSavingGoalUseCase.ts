import { AppError } from '../../../../middlewares/errorHandler';
import { ISavingGoalRepository, SavingGoalResult } from '../../domain/repositories/ISavingGoalRepository';
import { UpdateSavingGoalDto } from '../dtos/SavingGoalDto';

export class UpdateSavingGoalUseCase {
  constructor(private readonly savingGoalRepository: ISavingGoalRepository) {}

  async execute(id: string, userId: string, dto: UpdateSavingGoalDto): Promise<SavingGoalResult> {
    const goal = await this.savingGoalRepository.findByIdAndUser(id, userId);
    if (!goal) throw new AppError('Saving goal not found', 404);
    return this.savingGoalRepository.update(id, dto);
  }
}
