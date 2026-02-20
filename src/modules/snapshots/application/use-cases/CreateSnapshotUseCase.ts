import { AppError } from '../../../../middlewares/errorHandler';
import { ISnapshotRepository, SnapshotResult } from '../../domain/repositories/ISnapshotRepository';
import { CreateSnapshotDto } from '../dtos/SnapshotDto';

export class CreateSnapshotUseCase {
  constructor(private readonly snapshotRepository: ISnapshotRepository) {}

  async execute(userId: string, dto: CreateSnapshotDto): Promise<SnapshotResult> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const existing = await this.snapshotRepository.findByUserAndDate(userId, today);
    if (existing) throw new AppError('A snapshot for today already exists', 409);

    return this.snapshotRepository.create({ userId, date: today, ...dto });
  }
}
