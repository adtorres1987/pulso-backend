import { ISnapshotRepository, SnapshotResult } from '../../domain/repositories/ISnapshotRepository';

export class GetAllSnapshotsUseCase {
  constructor(private readonly snapshotRepository: ISnapshotRepository) {}

  async execute(userId: string): Promise<SnapshotResult[]> {
    return this.snapshotRepository.findAllByUser(userId);
  }
}
