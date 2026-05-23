import { IHabitRepository, PaginatedHabits } from '../../domain/repositories/IHabitRepository';

export class GetAllHabitsUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(userId: string, activeOnly: boolean | undefined, page: number, limit: number): Promise<PaginatedHabits> {
    return this.habitRepository.findAllByUser(userId, activeOnly, page, limit);
  }
}
