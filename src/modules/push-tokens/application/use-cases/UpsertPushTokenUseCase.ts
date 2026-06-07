import { IPushTokenRepository, PushTokenData } from '../../domain/repositories/IPushTokenRepository';

export class UpsertPushTokenUseCase {
  constructor(private readonly repo: IPushTokenRepository) {}

  execute(userId: string, token: string, platform: string): Promise<PushTokenData> {
    return this.repo.upsert(userId, token, platform);
  }
}
