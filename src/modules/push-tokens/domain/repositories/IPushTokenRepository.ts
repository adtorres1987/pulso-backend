export interface PushTokenData {
  id: string;
  userId: string;
  token: string;
  platform: string;
}

export interface IPushTokenRepository {
  upsert(userId: string, token: string, platform: string): Promise<PushTokenData>;
  deleteByToken(token: string, userId: string): Promise<void>;
  findAllByUserId(userId: string): Promise<PushTokenData[]>;
  findAllActiveTokens(): Promise<PushTokenData[]>;
}
