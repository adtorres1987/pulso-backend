import { AppError } from '../../../../middlewares/errorHandler';
import { GroupResult, IGroupRepository } from '../../domain/repositories/IGroupRepository';

export class GetGroupByIdUseCase {
  constructor(private readonly repo: IGroupRepository) {}
  async execute(id: string, userId: string): Promise<GroupResult> {
    const group = await this.repo.findByIdAndUser(id, userId);
    if (!group) throw new AppError('Group not found', 404);
    return group;
  }
}
