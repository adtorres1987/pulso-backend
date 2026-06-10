import { AppError } from '../../../../middlewares/errorHandler';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';

export class DeleteAccountUseCase {
  constructor(private readonly repo: IAccountRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const account = await this.repo.findByIdAndUser(id, userId);
    if (!account) throw new AppError('Account not found', 404);
    await this.repo.delete(id);
  }
}
