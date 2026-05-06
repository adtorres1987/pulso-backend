import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../../../config/prisma';
import {
  CreateSubscriptionPlanData,
  ISubscriptionPlanRepository,
  SubscriptionPlanResult,
  UpdateSubscriptionPlanData,
} from '../../domain/repositories/ISubscriptionPlanRepository';

const planSelect = {
  id: true,
  name: true,
  description: true,
  priceAmount: true,
  currency: true,
  intervalDays: true,
  isActive: true,
  stripePriceId: true,
  createdAt: true,
};

const toResult = (raw: {
  id: string;
  name: string;
  description: string | null;
  priceAmount: Decimal;
  currency: string;
  intervalDays: number;
  isActive: boolean;
  stripePriceId: string | null;
  createdAt: Date;
}): SubscriptionPlanResult => ({
  id: raw.id,
  name: raw.name,
  description: raw.description,
  priceAmount: raw.priceAmount.toString(),
  currency: raw.currency,
  intervalDays: raw.intervalDays,
  isActive: raw.isActive,
  stripePriceId: raw.stripePriceId,
  createdAt: raw.createdAt,
});

export class PrismaSubscriptionPlanRepository implements ISubscriptionPlanRepository {
  async findAll(): Promise<SubscriptionPlanResult[]> {
    const rows = await prisma.subscriptionPlan.findMany({ select: planSelect, orderBy: { createdAt: 'asc' } });
    return rows.map(toResult);
  }

  async findById(id: string): Promise<SubscriptionPlanResult | null> {
    const row = await prisma.subscriptionPlan.findUnique({ where: { id }, select: planSelect });
    return row ? toResult(row) : null;
  }

  async findActiveDefault(): Promise<SubscriptionPlanResult | null> {
    const row = await prisma.subscriptionPlan.findFirst({ where: { isActive: true }, select: planSelect, orderBy: { createdAt: 'asc' } });
    return row ? toResult(row) : null;
  }

  async create(data: CreateSubscriptionPlanData): Promise<SubscriptionPlanResult> {
    const row = await prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description,
        priceAmount: data.priceAmount,
        currency: data.currency ?? 'USD',
        intervalDays: data.intervalDays ?? 30,
        stripePriceId: data.stripePriceId,
      },
      select: planSelect,
    });
    return toResult(row);
  }

  async update(id: string, data: UpdateSubscriptionPlanData): Promise<SubscriptionPlanResult> {
    const row = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priceAmount !== undefined && { priceAmount: data.priceAmount }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.intervalDays !== undefined && { intervalDays: data.intervalDays }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.stripePriceId !== undefined && { stripePriceId: data.stripePriceId }),
      },
      select: planSelect,
    });
    return toResult(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.subscriptionPlan.delete({ where: { id } });
  }
}
