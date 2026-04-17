import { AppError } from '../../../../middlewares/errorHandler';
import { AdminUserResult, IAdminUserRepository } from '../../domain/repositories/IAdminUserRepository';

export class GetClientUserByIdUseCase {
  constructor(private readonly adminUserRepository: IAdminUserRepository) {}

  async execute(id: string): Promise<AdminUserResult> {
    const user = await this.adminUserRepository.findClientUserById(id);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }
}
