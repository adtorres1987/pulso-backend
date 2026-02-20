import { AppError } from '../../../../middlewares/errorHandler';
import { IHabitRepository, HabitResult } from '../../domain/repositories/IHabitRepository';
import { UpdateHabitDto } from '../dtos/HabitDto';

export class UpdateHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(id: string, userId: string, dto: UpdateHabitDto): Promise<HabitResult> {
    const habit = await this.habitRepository.findByIdAndUser(id, userId);
    if (!habit) throw new AppError('Habit not found', 404);
    return this.habitRepository.update(id, dto);
  }
}
