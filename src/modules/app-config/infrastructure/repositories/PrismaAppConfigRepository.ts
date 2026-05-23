import { prisma } from '../../../../config/prisma';
import { AppConfigResult, CreateAppConfigData, IAppConfigRepository, UpdateAppConfigData } from '../../domain/repositories/IAppConfigRepository';

export class PrismaAppConfigRepository implements IAppConfigRepository {
  async findAll(): Promise<AppConfigResult[]> {
    return prisma.appConfig.findMany({ orderBy: { key: 'asc' } });
  }

  async findByKey(key: string): Promise<AppConfigResult | null> {
    return prisma.appConfig.findUnique({ where: { key } });
  }

  async create(data: CreateAppConfigData): Promise<AppConfigResult> {
    return prisma.appConfig.create({ data });
  }

  async upsert(key: string, value: string): Promise<AppConfigResult> {
    return prisma.appConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async update(key: string, data: UpdateAppConfigData): Promise<AppConfigResult> {
    return prisma.appConfig.update({ where: { key }, data });
  }

  async delete(key: string): Promise<void> {
    await prisma.appConfig.delete({ where: { key } });
  }

  async getValueAsNumber(key: string, fallback: number): Promise<number> {
    const record = await prisma.appConfig.findUnique({ where: { key } });
    if (!record) return fallback;
    const num = Number(record.value);
    return Number.isFinite(num) ? num : fallback;
  }
}
