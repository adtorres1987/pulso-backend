import { AppError } from '../../../../middlewares/errorHandler';
import { ISnapshotRepository, SnapshotResult } from '../../domain/repositories/ISnapshotRepository';
import { UpdateSnapshotDto } from '../dtos/SnapshotDto';

export class UpdateTodaySnapshotUseCase {
  constructor(private readonly snapshotRepository: ISnapshotRepository) {}

  async execute(userId: string, dto: UpdateSnapshotDto): Promise<SnapshotResult> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const snapshot = await this.snapshotRepository.findByUserAndDate(userId, today);
    if (!snapshot) throw new AppError("No snapshot found for today. Create one first.", 404);

    return this.snapshotRepository.update(snapshot.id, dto);
  }
}
