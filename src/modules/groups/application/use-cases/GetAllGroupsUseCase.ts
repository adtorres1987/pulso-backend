import { GroupResult, IGroupRepository } from '../../domain/repositories/IGroupRepository';

export class GetAllGroupsUseCase {
  constructor(private readonly repo: IGroupRepository) {}
  execute(userId: string): Promise<GroupResult[]> { return this.repo.findAllByUser(userId); }
}
