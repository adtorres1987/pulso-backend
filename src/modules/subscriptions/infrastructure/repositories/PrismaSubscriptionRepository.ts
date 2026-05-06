import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../../../config/prisma';
import {
  CreateSubscriptionData,
  ISubscriptionRepository,
  SubscriptionResult,
} from '../../domain/repositories/ISubscriptionRepository';

const subscriptionInclude = {
  plan: {
    select: { id: true, name: true, priceAmount: true, currency: true, intervalDays: true },
  },
};

const toResult = (raw: {
  id: string;
  userId: string;
  planId: string;
  status: string;
  trialEndsAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  discountPercent: Decimal;
  cancelledAt: Date | null;
  createdAt: Date;
  plan: { id: string; name: string; priceAmount: Decimal; currency: string; intervalDays: number };
}): SubscriptionResult => ({
  ...raw,
  status: raw.status as SubscriptionResult['status'],
  discountPercent: raw.discountPercent.toString(),
  plan: { ...raw.plan, priceAmount: raw.plan.priceAmount.toString() },
});

export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  async findByUserId(userId: string): Promise<SubscriptionResult | null> {
    const row = await prisma.subscription.findUnique({ where: { userId }, include: subscriptionInclude });
    return row ? toResult(row) : null;
  }

  async create(data: CreateSubscriptionData): Promise<SubscriptionResult> {
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + data.trialDays * 86400_000);
    const row = await prisma.subscription.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        status: 'trial',
        trialEndsAt,
        currentPeriodStart: now,
        currentPeriodEnd: trialEndsAt,
      },
      include: subscriptionInclude,
    });
    return toResult(row);
  }

  async activate(userId: string): Promise<SubscriptionResult> {
    const sub = await prisma.subscription.findUniqueOrThrow({ where: { userId } });
    const now = new Date();
    const plan = await prisma.subscriptionPlan.findUniqueOrThrow({ where: { id: sub.planId } });
    const newPeriodEnd = new Date(now.getTime() + plan.intervalDays * 86400_000);
    const row = await prisma.subscription.update({
      where: { userId },
      data: { status: 'active', currentPeriodStart: now, currentPeriodEnd: newPeriodEnd, cancelledAt: null },
      include: subscriptionInclude,
    });
    return toResult(row);
  }

  async cancel(userId: string): Promise<SubscriptionResult> {
    const row = await prisma.subscription.update({
      where: { userId },
      data: { status: 'cancelled', cancelledAt: new Date() },
      include: subscriptionInclude,
    });
    return toResult(row);
  }

  async applyGroupDiscount(userId: string, discountPercent: number): Promise<void> {
    await prisma.subscription.updateMany({
      where: { userId, status: { in: ['trial', 'active'] } },
      data: { discountPercent },
    });
  }

  async countActiveGroupMembers(groupId: string): Promise<number> {
    return prisma.groupMember.count({
      where: {
        groupId,
        user: { subscription: { status: { in: ['trial', 'active'] } } },
      },
    });
  }

  async syncGroupDiscounts(groupId: string, discountPercent: number, minMembers: number): Promise<void> {
    const activeCount = await this.countActiveGroupMembers(groupId);
    const shouldApply = activeCount >= minMembers;
    const members = await prisma.groupMember.findMany({ where: { groupId }, select: { userId: true } });
    await prisma.subscription.updateMany({
      where: { userId: { in: members.map((m) => m.userId) }, status: { in: ['trial', 'active'] } },
      data: { discountPercent: shouldApply ? discountPercent : 0 },
    });
  }
}
