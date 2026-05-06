import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../../../config/prisma';
import {
  CreateGroupData,
  CreateGroupExpenseData,
  GroupExpenseResult,
  GroupExpenseShareResult,
  GroupMemberResult,
  GroupResult,
  IGroupRepository,
} from '../../domain/repositories/IGroupRepository';

const memberSelect = { id: true, userId: true, role: true, joinedAt: true };

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

const expenseInclude = { shares: { select: shareSelect } };

const mapMember = (r: { id: string; userId: string; role: string; joinedAt: Date }): GroupMemberResult => ({
  ...r,
  role: r.role as GroupMemberResult['role'],
});

const mapShare = (r: { id: string; groupMemberId: string; amount: Decimal; includeInPersonal: boolean; transactionId: string | null }): GroupExpenseShareResult => ({
  ...r,
  amount: r.amount.toString(),
});

const mapExpense = (r: {
  id: string; groupId: string; paidById: string; amount: Decimal;
  description: string; occurredAt: Date; createdAt: Date;
  shares: Array<{ id: string; groupMemberId: string; amount: Decimal; includeInPersonal: boolean; transactionId: string | null }>;
}): GroupExpenseResult => ({
  ...r,
  amount: r.amount.toString(),
  shares: r.shares.map(mapShare),
});

const mapGroup = (r: {
  id: string; name: string; createdBy: string; createdAt: Date;
  members: Array<{ id: string; userId: string; role: string; joinedAt: Date }>;
}): GroupResult => ({ ...r, members: r.members.map(mapMember) });

export class PrismaGroupRepository implements IGroupRepository {
  async findAllByUser(userId: string): Promise<GroupResult[]> {
    const rows = await prisma.group.findMany({
      where: { deletedAt: null, members: { some: { userId } } },
      include: groupInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapGroup);
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

  async findExpensesByGroup(groupId: string): Promise<GroupExpenseResult[]> {
    const rows = await prisma.groupExpense.findMany({
      where: { groupId },
      include: expenseInclude,
      orderBy: { occurredAt: 'desc' },
    });
    return rows.map(mapExpense);
  }

  async includeShareInPersonal(shareId: string, transactionId: string): Promise<GroupExpenseShareResult> {
    const row = await prisma.groupExpenseShare.update({
      where: { id: shareId },
      data: { includeInPersonal: true, transactionId },
      select: shareSelect,
    });
    return mapShare(row);
  }
}
