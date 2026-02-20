import { AppError } from '../../../../middlewares/errorHandler';
import { IHabitRepository, HabitResult } from '../../domain/repositories/IHabitRepository';

export class GetHabitByIdUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(id: string, userId: string): Promise<HabitResult> {
    const habit = await this.habitRepository.findByIdAndUser(id, userId);
    if (!habit) throw new AppError('Habit not found', 404);
    return habit;
  }
}
