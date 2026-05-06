import { GroupResult, IGroupRepository } from '../../domain/repositories/IGroupRepository';
import { CreateGroupDto } from '../dtos/GroupDto';

export class CreateGroupUseCase {
  constructor(private readonly repo: IGroupRepository) {}
  execute(dto: CreateGroupDto, userId: string): Promise<GroupResult> {
    return this.repo.create({ name: dto.name, createdBy: userId });
  }
}
