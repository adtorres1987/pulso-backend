import { ISavingGoalRepository, PaginatedSavingGoals } from '../../domain/repositories/ISavingGoalRepository';

export class GetAllSavingGoalsUseCase {
  constructor(private readonly savingGoalRepository: ISavingGoalRepository) {}

  async execute(userId: string, page: number, limit: number): Promise<PaginatedSavingGoals> {
    return this.savingGoalRepository.findAllByUser(userId, page, limit);
  }
}
