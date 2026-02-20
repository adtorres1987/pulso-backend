import { IHabitRepository, HabitResult } from '../../domain/repositories/IHabitRepository';
import { CreateHabitDto } from '../dtos/HabitDto';

export class CreateHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(userId: string, dto: CreateHabitDto): Promise<HabitResult> {
    return this.habitRepository.create({ userId, ...dto });
  }
}
