import { ISnapshotRepository, SnapshotResult } from '../../domain/repositories/ISnapshotRepository';

export class GetTodaySnapshotUseCase {
  constructor(private readonly snapshotRepository: ISnapshotRepository) {}

  async execute(userId: string): Promise<SnapshotResult | null> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return this.snapshotRepository.findByUserAndDate(userId, today);
  }
}
