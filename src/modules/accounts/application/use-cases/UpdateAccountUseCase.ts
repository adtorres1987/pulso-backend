import { AppError } from '../../../../middlewares/errorHandler';
import { IAccountRepository, AccountResult, UpdateAccountData } from '../../domain/repositories/IAccountRepository';

export class UpdateAccountUseCase {
  constructor(private readonly repo: IAccountRepository) {}

  async execute(id: string, userId: string, data: UpdateAccountData): Promise<AccountResult> {
    const account = await this.repo.findByIdAndUser(id, userId);
    if (!account) throw new AppError('Account not found', 404);
    return this.repo.update(id, data);
  }
}
