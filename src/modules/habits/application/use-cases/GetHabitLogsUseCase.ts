import { AppError } from '../../../../middlewares/errorHandler';
import { IHabitRepository, PaginatedHabitLogs } from '../../domain/repositories/IHabitRepository';

export class GetHabitLogsUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(habitId: string, userId: string, page: number, limit: number): Promise<PaginatedHabitLogs> {
    const habit = await this.habitRepository.findByIdAndUser(habitId, userId);
    if (!habit) throw new AppError('Habit not found', 404);
    return this.habitRepository.findLogsByHabit(habitId, page, limit);
  }
}
