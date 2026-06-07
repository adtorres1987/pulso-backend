import { prisma } from '../../../../config/prisma';
import { IPushTokenRepository, PushTokenData } from '../../domain/repositories/IPushTokenRepository';

function toData(row: { id: string; userId: string; token: string; platform: string }): PushTokenData {
  return { id: row.id, userId: row.userId, token: row.token, platform: row.platform };
}

export class PrismaPushTokenRepository implements IPushTokenRepository {
  async upsert(userId: string, token: string, platform: string): Promise<PushTokenData> {
    const row = await prisma.pushToken.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, platform },
    });
    return toData(row);
  }

  async deleteByToken(token: string, userId: string): Promise<void> {
    await prisma.pushToken.deleteMany({ where: { token, userId } });
  }

  async findAllByUserId(userId: string): Promise<PushTokenData[]> {
    const rows = await prisma.pushToken.findMany({ where: { userId } });
    return rows.map(toData);
  }

  async findAllActiveTokens(): Promise<PushTokenData[]> {
    const rows = await prisma.pushToken.findMany();
    return rows.map(toData);
  }
}
