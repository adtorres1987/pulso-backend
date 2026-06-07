import { EmotionTag, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../../../config/prisma';
import {
  CreateTransactionData,
  ITransactionRepository,
  PaginatedTransactions,
  TransactionFilters,
  TransactionResult,
  UpdateTransactionData,
} from '../../domain/repositories/ITransactionRepository';

const transactionSelect = {
  id: true,
  amount: true,
  type: true,
  emotionTag: true,
  note: true,
  occurredAt: true,
  createdAt: true,
  categoryId: true,
  category: { select: { id: true, name: true, icon: true } },
};

const toResult = (raw: {
  id: string;
  amount: Decimal;
  type: TransactionType;
  emotionTag: EmotionTag | null;
  note: string | null;
  occurredAt: Date;
  createdAt: Date;
  categoryId: string | null;
  category: { id: string; name: string; icon: string | null } | null;
}): TransactionResult => ({
  ...raw,
  amount: raw.amount.toString(),
});

export class PrismaTransactionRepository implements ITransactionRepository {
  async findAllByUser(userId: string, filters: TransactionFilters, page = 1, limit = 20): Promise<PaginatedTransactions> {
    const where = {
      userId,
      ...(filters.type && { type: filters.type as TransactionType }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.emotionTag && { emotionTag: filters.emotionTag as EmotionTag }),
      ...(filters.startDate || filters.endDate
        ? {
            occurredAt: {
              ...(filters.startDate && { gte: filters.startDate }),
              ...(filters.endDate && { lte: filters.endDate }),
            },
          }
        : {}),
      ...(filters.minAmount || filters.maxAmount
        ? {
            amount: {
              ...(filters.minAmount && { gte: parseFloat(filters.minAmount) }),
              ...(filters.maxAmount && { lte: parseFloat(filters.maxAmount) }),
            },
          }
        : {}),
      ...(filters.search && {
        OR: [
          { note: { contains: filters.search, mode: 'insensitive' as const } },
          { category: { name: { contains: filters.search, mode: 'insensitive' as const } } },
        ],
      }),
    };
    const [rows, total] = await prisma.$transaction([
      prisma.transaction.findMany({ where, select: transactionSelect, orderBy: { occurredAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.transaction.count({ where }),
    ]);
    return { items: rows.map(toResult), total };
  }

  async findByIdAndUser(id: string, userId: string): Promise<TransactionResult | null> {
    const row = await prisma.transaction.findFirst({ where: { id, userId }, select: transactionSelect });
    return row ? toResult(row) : null;
  }

  async create(data: CreateTransactionData): Promise<TransactionResult> {
    const row = await prisma.transaction.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        type: data.type as TransactionType,
        emotionTag: data.emotionTag as EmotionTag | undefined,
        note: data.note,
        occurredAt: data.occurredAt,
        categoryId: data.categoryId,
        dailySnapshotId: data.dailySnapshotId,
      },
      select: transactionSelect,
    });
    return toResult(row);
  }

  async update(id: string, data: UpdateTransactionData): Promise<TransactionResult> {
    const row = await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.type !== undefined && { type: data.type as TransactionType }),
        ...(data.emotionTag !== undefined && { emotionTag: data.emotionTag as EmotionTag }),
        ...(data.note !== undefined && { note: data.note }),
        ...(data.occurredAt !== undefined && { occurredAt: data.occurredAt }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      },
      select: transactionSelect,
    });
    return toResult(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({ where: { id } });
  }
}
