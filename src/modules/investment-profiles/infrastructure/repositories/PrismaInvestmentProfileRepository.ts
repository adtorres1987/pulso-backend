import { InvestmentStrategy } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../../../config/prisma';
import {
  CreateInvestmentProfileData,
  IInvestmentProfileRepository,
  InvestmentProfileResult,
  PaginatedInvestmentProfiles,
  UpdateInvestmentProfileData,
} from '../../domain/repositories/IInvestmentProfileRepository';

const profileSelect = {
  id: true,
  strategy: true,
  monthlyAmount: true,
  expectedReturn: true,
  createdAt: true,
};

const toResult = (raw: {
  id: string;
  strategy: InvestmentStrategy;
  monthlyAmount: Decimal;
  expectedReturn: Decimal;
  createdAt: Date;
}): InvestmentProfileResult => ({
  ...raw,
  monthlyAmount: raw.monthlyAmount.toString(),
  expectedReturn: raw.expectedReturn.toString(),
});

export class PrismaInvestmentProfileRepository implements IInvestmentProfileRepository {
  async findAllByUser(userId: string, page = 1, limit = 20): Promise<PaginatedInvestmentProfiles> {
    const where = { userId };
    const [rows, total] = await prisma.$transaction([
      prisma.investmentProfile.findMany({ where, select: profileSelect, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.investmentProfile.count({ where }),
    ]);
    return { items: rows.map(toResult), total };
  }

  async findByIdAndUser(id: string, userId: string): Promise<InvestmentProfileResult | null> {
    const row = await prisma.investmentProfile.findFirst({ where: { id, userId }, select: profileSelect });
    return row ? toResult(row) : null;
  }

  async create(data: CreateInvestmentProfileData): Promise<InvestmentProfileResult> {
    const row = await prisma.investmentProfile.create({
      data: {
        userId: data.userId,
        strategy: data.strategy as InvestmentStrategy,
        monthlyAmount: data.monthlyAmount,
        expectedReturn: data.expectedReturn,
      },
      select: profileSelect,
    });
    return toResult(row);
  }

  async update(id: string, data: UpdateInvestmentProfileData): Promise<InvestmentProfileResult> {
    const row = await prisma.investmentProfile.update({
      where: { id },
      data: {
        ...(data.strategy !== undefined && { strategy: data.strategy as InvestmentStrategy }),
        ...(data.monthlyAmount !== undefined && { monthlyAmount: data.monthlyAmount }),
        ...(data.expectedReturn !== undefined && { expectedReturn: data.expectedReturn }),
      },
      select: profileSelect,
    });
    return toResult(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.investmentProfile.delete({ where: { id } });
  }
}
