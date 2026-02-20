import { AppError } from '../../../../middlewares/errorHandler';
import { IHabitRepository, HabitLogResult } from '../../domain/repositories/IHabitRepository';

export class GetHabitLogsUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(habitId: string, userId: string): Promise<HabitLogResult[]> {
    const habit = await this.habitRepository.findByIdAndUser(habitId, userId);
    if (!habit) throw new AppError('Habit not found', 404);
    return this.habitRepository.findLogsByHabit(habitId);
  }
}
