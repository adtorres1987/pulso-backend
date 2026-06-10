import { IAccountRepository, AccountResult, CreateAccountData } from '../../domain/repositories/IAccountRepository';

export class CreateAccountUseCase {
  constructor(private readonly repo: IAccountRepository) {}

  async execute(userId: string, data: Omit<CreateAccountData, 'userId'>): Promise<AccountResult> {
    return this.repo.create({ ...data, userId });
  }
}
