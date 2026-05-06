import { AppError } from '../../../../middlewares/errorHandler';
import { GroupResult, IGroupRepository } from '../../domain/repositories/IGroupRepository';
import { UpdateGroupDto } from '../dtos/GroupDto';

export class UpdateGroupUseCase {
  constructor(private readonly repo: IGroupRepository) {}
  async execute(id: string, dto: UpdateGroupDto, userId: string): Promise<GroupResult> {
    const group = await this.repo.findByIdAndUser(id, userId);
    if (!group) throw new AppError('Group not found', 404);
    const member = group.members.find((m) => m.userId === userId);
    if (member?.role !== 'owner') throw new AppError('Only the group owner can update the group', 403);
    return this.repo.update(id, dto.name);
  }
}
