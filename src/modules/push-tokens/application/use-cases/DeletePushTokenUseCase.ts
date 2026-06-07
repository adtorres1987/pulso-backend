import { IPushTokenRepository } from '../../domain/repositories/IPushTokenRepository';

export class DeletePushTokenUseCase {
  constructor(private readonly repo: IPushTokenRepository) {}

  execute(token: string, userId: string): Promise<void> {
    return this.repo.deleteByToken(token, userId);
  }
}
