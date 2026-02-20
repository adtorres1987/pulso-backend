import { redis } from '../../../../config/redis';
import { ITokenBlacklistService } from '../../domain/services/ITokenBlacklistService';

export class RedisTokenBlacklistService implements ITokenBlacklistService {
  async blacklist(jti: string, ttlSeconds: number): Promise<void> {
    await redis.set(`blacklist:${jti}`, '1', 'EX', ttlSeconds);
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    const result = await redis.exists(`blacklist:${jti}`);
    return result === 1;
  }
}
