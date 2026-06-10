import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../../../config/prisma';
import {
  CreateGroupData,
  CreateGroupExpenseData,
  GroupExpenseImageResult,
  GroupExpenseResult,
  GroupExpenseShareResult,
  GroupExpenseSummaryData,
  GroupMemberResult,
  GroupResult,
  IGroupRepository,
  MemberExpenseSummary,
  PaginatedGroupExpenses,
  PaginatedGroups,
  UpdateGroupExpenseData,
} from '../../domain/repositories/IGroupRepository';

const memberSelect = {
  id: true,
  userId: true,
  role: true,
  percentage: true,
  joinedAt: true,
  user: { select: { person: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
};

const groupInclude = {
  members: { select: memberSelect },
};

const shareSelect = {
  id: true,
  groupMemberId: true,
  amount: true,
  includeInPersonal: true,
  transactionId: true,
};

const imageSelect = { id: true, groupExpenseId: true, url: true, publicId: true, createdAt: true };

const expenseInclude = {
  shares: { select: shareSelect },
  images: { select: imageSelect, orderBy: { createdAt: 'asc' as const } },
};

const mapMember = (r: {
  id: string; userId: string; role: string; percentage: Decimal; joinedAt: Date;
  user: { person: { firstName: string; lastName: string; avatarUrl: string | null } | null } | null;
}): GroupMemberResult => ({
  id: r.id,
  userId: r.userId,
  role: r.role as GroupMemberResult['role'],
  percentage: parseFloat(r.percentage.toString()),
  joinedAt: r.joinedAt,
  person: r.user?.person ?? null,
});

const mapShare = (r: { id: string; groupMemberId: string; amount: Decimal; includeInPersonal: boolean; transactionId: string | null }): GroupExpenseShareResult => ({
  ...r,
  amount: r.amount.toString(),
});

const mapExpense = (r: {
  id: string; groupId: string; paidById: string; amount: Decimal;
  description: string; occurredAt: Date; createdAt: Date;
  shares: Array<{ id: string; groupMemberId: string; amount: Decimal; includeInPersonal: boolean; transactionId: string | null }>;
  images: Array<{ id: string; groupExpenseId: string; url: string; publicId: string; createdAt: Date }>;
}): GroupExpenseResult => ({
  ...r,
  amount: r.amount.toString(),
  shares: r.shares.map(mapShare),
  images: r.images,
});

const mapGroup = (r: {
  id: string; name: string; createdBy: string; createdAt: Date;
  members: Array<{ id: string; userId: string; role: string; percentage: Decimal; joinedAt: Date; user: { person: { firstName: string; lastName: string; avatarUrl: string | null } | null } | null }>;
}): GroupResult => ({ ...r, members: r.members.map(mapMember) });

export class PrismaGroupRepository implements IGroupRepository {
  async findAllByUser(userId: string, page = 1, limit = 20): Promise<PaginatedGroups> {
    const where = { deletedAt: null, members: { some: { userId } } };
    const [rows, total] = await prisma.$transaction([
      prisma.group.findMany({ where, include: groupInclude, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.group.count({ where }),
    ]);
    return { items: rows.map(mapGroup), total };
  }

  async findByIdAndUser(id: string, userId: string): Promise<GroupResult | null> {
    const row = await prisma.group.findFirst({
      where: { id, deletedAt: null, members: { some: { userId } } },
      include: groupInclude,
    });
    return row ? mapGroup(row) : null;
  }

  async create(data: CreateGroupData): Promise<GroupResult> {
    const row = await prisma.group.create({
      data: {
        name: data.name,
        createdBy: data.createdBy,
        members: { create: { userId: data.createdBy, role: 'owner' } },
      },
      include: groupInclude,
    });
    return mapGroup(row);
  }

  async update(id: string, name: string): Promise<GroupResult> {
    const row = await prisma.group.update({ where: { id }, data: { name }, include: groupInclude });
    return mapGroup(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.group.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async addMember(groupId: string, userId: string): Promise<GroupMemberResult> {
    const row = await prisma.groupMember.create({
      data: { groupId, userId, role: 'member' },
      select: memberSelect,
    });
    return mapMember(row);
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    await prisma.groupMember.deleteMany({ where: { groupId, userId } });
  }

  async updateMemberPercentage(groupId: string, userId: string, percentage: number): Promise<GroupMemberResult> {
    const row = await prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId } },
      data: { percentage },
      select: memberSelect,
    });
    return mapMember(row);
  }

  async findMember(groupId: string, userId: string): Promise<GroupMemberResult | null> {
    const row = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
      select: memberSelect,
    });
    return row ? mapMember(row) : null;
  }

  async createExpense(data: CreateGroupExpenseData): Promise<GroupExpenseResult> {
    const row = await prisma.groupExpense.create({
      data: {
        groupId: data.groupId,
        paidById: data.paidById,
        amount: data.amount,
        description: data.description,
        occurredAt: data.occurredAt,
        shares: { create: data.shares.map((s) => ({ groupMemberId: s.groupMemberId, amount: s.amount })) },
      },
      include: expenseInclude,
    });
    return mapExpense(row);
  }

  async findExpensesByGroup(groupId: string, page = 1, limit = 20, month?: string): Promise<PaginatedGroupExpenses> {
    const where: { groupId: string; occurredAt?: { gte: Date; lt: Date } } = { groupId };
    if (month) {
      const [y, m] = month.split('-').map(Number);
      where.occurredAt = { gte: new Date(y!, m! - 1, 1), lt: new Date(y!, m!, 1) };
    }
    const [rows, total] = await prisma.$transaction([
      prisma.groupExpense.findMany({ where, include: expenseInclude, orderBy: { occurredAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.groupExpense.count({ where }),
    ]);
    return { items: rows.map(mapExpense), total };
  }

  async findExpenseByIdAndGroup(expenseId: string, groupId: string): Promise<GroupExpenseResult | null> {
    const row = await prisma.groupExpense.findFirst({
      where: { id: expenseId, groupId },
      include: expenseInclude,
    });
    return row ? mapExpense(row) : null;
  }

  async updateExpense(expenseId: string, data: UpdateGroupExpenseData): Promise<GroupExpenseResult> {
    const row = await prisma.$transaction(async (tx) => {
      if (data.shares) {
        await tx.groupExpenseShare.deleteMany({ where: { groupExpenseId: expenseId } });
        await tx.groupExpenseShare.createMany({
          data: data.shares.map((s) => ({ groupExpenseId: expenseId, groupMemberId: s.groupMemberId, amount: s.amount })),
        });
      }
      return tx.groupExpense.update({
        where: { id: expenseId },
        data: {
          ...(data.amount !== undefined && { amount: data.amount }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.occurredAt !== undefined && { occurredAt: data.occurredAt }),
          ...(data.paidByUserId !== undefined && { paidById: data.paidByUserId }),
        },
        include: expenseInclude,
      });
    });
    return mapExpense(row);
  }

  async deleteExpense(expenseId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const shares = await tx.groupExpenseShare.findMany({
        where: { groupExpenseId: expenseId, transactionId: { not: null } },
        select: { transactionId: true },
      });
      const transactionIds = shares.map((s) => s.transactionId!);

      await tx.groupExpenseShare.deleteMany({ where: { groupExpenseId: expenseId } });

      if (transactionIds.length > 0) {
        await tx.transaction.deleteMany({ where: { id: { in: transactionIds } } });
      }

      await tx.groupExpense.delete({ where: { id: expenseId } });
    });
  }

  async getExpenseSummary(groupId: string, startDate: Date, endDate: Date): Promise<GroupExpenseSummaryData> {
    const [grouped, members] = await Promise.all([
      prisma.groupExpenseShare.groupBy({
        by: ['groupMemberId'],
        where: { groupExpense: { groupId, occurredAt: { gte: startDate, lt: endDate } } },
        _sum: { amount: true },
      }),
      prisma.groupMember.findMany({
        where: { groupId },
        select: {
          id: true,
          userId: true,
          percentage: true,
          user: { select: { person: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        },
      }),
    ]);

    const shareMap = new Map(
      grouped.map((g) => [g.groupMemberId, new Decimal(g._sum.amount ?? 0)]),
    );

    const total = grouped.reduce(
      (acc, g) => acc.add(g._sum.amount ?? new Decimal(0)),
      new Decimal(0),
    );

    const byMember: MemberExpenseSummary[] = members.map((m) => {
      const amount = shareMap.get(m.id) ?? new Decimal(0);
      const spendPct = total.isZero() ? new Decimal(0) : amount.div(total).mul(100);
      const responsibilityPct = new Decimal(m.percentage.toString());
      const expected = total.mul(responsibilityPct).div(100);
      const balance = amount.minus(expected);
      return {
        userId: m.userId,
        firstName: m.user?.person?.firstName ?? '',
        lastName: m.user?.person?.lastName ?? '',
        avatarUrl: m.user?.person?.avatarUrl ?? null,
        total: amount.toString(),
        percentage: spendPct.toDecimalPlaces(2).toString(),
        responsibilityPct: responsibilityPct.toString(),
        balance: balance.toDecimalPlaces(2).toString(),
      };
    });

    return { total: total.toString(), byMember };
  }

  async unlinkShareByTransactionId(transactionId: string): Promise<void> {
    await prisma.groupExpenseShare.updateMany({
      where: { transactionId },
      data: { includeInPersonal: false, transactionId: null },
    });
  }

  async includeShareInPersonal(shareId: string, transactionId: string): Promise<GroupExpenseShareResult> {
    const row = await prisma.groupExpenseShare.update({
      where: { id: shareId },
      data: { includeInPersonal: true, transactionId },
      select: shareSelect,
    });
    return mapShare(row);
  }

  async addExpenseImage(expenseId: string, url: string, publicId: string): Promise<GroupExpenseImageResult> {
    return prisma.groupExpenseImage.create({
      data: { groupExpenseId: expenseId, url, publicId },
      select: imageSelect,
    });
  }

  async removeExpenseImage(imageId: string): Promise<GroupExpenseImageResult> {
    return prisma.groupExpenseImage.delete({
      where: { id: imageId },
      select: imageSelect,
    });
  }
}
