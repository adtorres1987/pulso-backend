import { ISavingGoalRepository, SavingGoalResult } from '../../domain/repositories/ISavingGoalRepository';
import { CreateSavingGoalDto } from '../dtos/SavingGoalDto';

export class CreateSavingGoalUseCase {
  constructor(private readonly savingGoalRepository: ISavingGoalRepository) {}

  async execute(userId: string, dto: CreateSavingGoalDto): Promise<SavingGoalResult> {
    return this.savingGoalRepository.create({ userId, ...dto });
  }
}
