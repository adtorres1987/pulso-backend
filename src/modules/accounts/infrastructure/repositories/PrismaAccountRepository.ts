import { Decimal } from '@prisma/client/runtime/library';
import { TransactionType } from '@prisma/client';
import { prisma } from '../../../../config/prisma';
import {
  AccountResult,
  AccountType,
  CreateAccountData,
  IAccountRepository,
  UpdateAccountData,
} from '../../domain/repositories/IAccountRepository';

const accountSelect = {
  id: true,
  userId: true,
  name: true,
  type: true,
  initialBalance: true,
  currency: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
};

async function computeBalance(id: string, initialBalance: Decimal): Promise<string> {
  const [income, expense] = await prisma.$transaction([
    prisma.transaction.aggregate({ where: { accountId: id, type: TransactionType.income }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { accountId: id, type: TransactionType.expense }, _sum: { amount: true } }),
  ]);
  const inc = income._sum.amount ?? new Decimal(0);
  const exp = expense._sum.amount ?? new Decimal(0);
  return new Decimal(initialBalance).add(inc).sub(exp).toString();
}

function toResult(r: {
  id: string; userId: string; name: string; type: string;
  initialBalance: Decimal; currency: string; isDefault: boolean;
  createdAt: Date; updatedAt: Date;
}, currentBalance: string): AccountResult {
  return {
    id: r.id,
    userId: r.userId,
    name: r.name,
    type: r.type as AccountType,
    initialBalance: r.initialBalance.toString(),
    currentBalance,
    currency: r.currency,
    isDefault: r.isDefault,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export class PrismaAccountRepository implements IAccountRepository {
  async findAllByUser(userId: string): Promise<AccountResult[]> {
    const rows = await prisma.account.findMany({
      where: { userId },
      select: accountSelect,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    return Promise.all(
      rows.map(async (r) => toResult(r, await computeBalance(r.id, r.initialBalance))),
    );
  }

  async findByIdAndUser(id: string, userId: string): Promise<AccountResult | null> {
    const r = await prisma.account.findFirst({ where: { id, userId }, select: accountSelect });
    if (!r) return null;
    return toResult(r, await computeBalance(r.id, r.initialBalance));
  }

  async create(data: CreateAccountData): Promise<AccountResult> {
    if (data.isDefault) {
      await prisma.account.updateMany({ where: { userId: data.userId }, data: { isDefault: false } });
    }
    const r = await prisma.account.create({
      data: {
        userId: data.userId,
        name: data.name,
        type: data.type,
        initialBalance: data.initialBalance ?? 0,
        currency: data.currency ?? 'MXN',
        isDefault: data.isDefault ?? false,
      },
      select: accountSelect,
    });
    return toResult(r, await computeBalance(r.id, r.initialBalance));
  }

  async update(id: string, data: UpdateAccountData): Promise<AccountResult> {
    if (data.isDefault) {
      const acc = await prisma.account.findUnique({ where: { id }, select: { userId: true } });
      if (acc) {
        await prisma.account.updateMany({ where: { userId: acc.userId }, data: { isDefault: false } });
      }
    }
    const r = await prisma.account.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.initialBalance !== undefined && { initialBalance: data.initialBalance }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
      select: accountSelect,
    });
    return toResult(r, await computeBalance(r.id, r.initialBalance));
  }

  async delete(id: string): Promise<void> {
    await prisma.account.delete({ where: { id } });
  }
}
