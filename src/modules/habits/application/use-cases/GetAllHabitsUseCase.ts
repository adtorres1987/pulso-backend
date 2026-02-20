import { IHabitRepository, HabitResult } from '../../domain/repositories/IHabitRepository';

export class GetAllHabitsUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(userId: string, activeOnly?: boolean): Promise<HabitResult[]> {
    return this.habitRepository.findAllByUser(userId, activeOnly);
  }
}
