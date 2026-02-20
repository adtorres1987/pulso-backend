import { AppError } from '../../../../middlewares/errorHandler';
import { IHabitRepository, HabitLogResult } from '../../domain/repositories/IHabitRepository';
import { LogHabitDto } from '../dtos/HabitDto';

export class LogHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(habitId: string, userId: string, dto: LogHabitDto): Promise<HabitLogResult> {
    const habit = await this.habitRepository.findByIdAndUser(habitId, userId);
    if (!habit) throw new AppError('Habit not found', 404);
    return this.habitRepository.upsertLog(habitId, dto.date, dto.completed);
  }
}
