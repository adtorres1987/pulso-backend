import { ISavingGoalRepository, SavingGoalResult } from '../../domain/repositories/ISavingGoalRepository';

export class GetAllSavingGoalsUseCase {
  constructor(private readonly savingGoalRepository: ISavingGoalRepository) {}

  async execute(userId: string): Promise<SavingGoalResult[]> {
    return this.savingGoalRepository.findAllByUser(userId);
  }
}
