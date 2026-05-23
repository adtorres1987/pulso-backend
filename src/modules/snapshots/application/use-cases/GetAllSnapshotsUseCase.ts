import { ISnapshotRepository, PaginatedSnapshots } from '../../domain/repositories/ISnapshotRepository';

export class GetAllSnapshotsUseCase {
  constructor(private readonly snapshotRepository: ISnapshotRepository) {}

  async execute(userId: string, page: number, limit: number): Promise<PaginatedSnapshots> {
    return this.snapshotRepository.findAllByUser(userId, page, limit);
  }
}
