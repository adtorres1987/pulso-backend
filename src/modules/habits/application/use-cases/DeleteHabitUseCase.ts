import { AppError } from '../../../../middlewares/errorHandler';
import { IHabitRepository } from '../../domain/repositories/IHabitRepository';

export class DeleteHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const habit = await this.habitRepository.findByIdAndUser(id, userId);
    if (!habit) throw new AppError('Habit not found', 404);
    await this.habitRepository.delete(id);
  }
}
