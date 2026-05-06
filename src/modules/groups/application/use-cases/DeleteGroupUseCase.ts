import { AppError } from '../../../../middlewares/errorHandler';
import { IGroupRepository } from '../../domain/repositories/IGroupRepository';

export class DeleteGroupUseCase {
  constructor(private readonly repo: IGroupRepository) {}
  async execute(id: string, userId: string): Promise<void> {
    const group = await this.repo.findByIdAndUser(id, userId);
    if (!group) throw new AppError('Group not found', 404);
    const member = group.members.find((m) => m.userId === userId);
    if (member?.role !== 'owner') throw new AppError('Only the group owner can delete the group', 403);
    return this.repo.delete(id);
  }
}
