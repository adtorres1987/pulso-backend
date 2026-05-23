import { IGroupRepository, PaginatedGroups } from '../../domain/repositories/IGroupRepository';

export class GetAllGroupsUseCase {
  constructor(private readonly repo: IGroupRepository) {}
  execute(userId: string, page: number, limit: number): Promise<PaginatedGroups> {
    return this.repo.findAllByUser(userId, page, limit);
  }
}
