import { IAccountRepository, AccountResult } from '../../domain/repositories/IAccountRepository';

export class ListAccountsUseCase {
  constructor(private readonly repo: IAccountRepository) {}

  async execute(userId: string): Promise<AccountResult[]> {
    return this.repo.findAllByUser(userId);
  }
}
