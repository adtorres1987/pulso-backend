import { prisma } from '../../../../config/prisma';
import { AppConfigResult, IAppConfigRepository } from '../../domain/repositories/IAppConfigRepository';

export class PrismaAppConfigRepository implements IAppConfigRepository {
  async findAll(): Promise<AppConfigResult[]> {
    return prisma.appConfig.findMany({ orderBy: { key: 'asc' } });
  }

  async findByKey(key: string): Promise<AppConfigResult | null> {
    return prisma.appConfig.findUnique({ where: { key } });
  }

  async upsert(key: string, value: string): Promise<AppConfigResult> {
    return prisma.appConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getValueAsNumber(key: string, fallback: number): Promise<number> {
    const record = await prisma.appConfig.findUnique({ where: { key } });
    if (!record) return fallback;
    const num = Number(record.value);
    return Number.isFinite(num) ? num : fallback;
  }
}
