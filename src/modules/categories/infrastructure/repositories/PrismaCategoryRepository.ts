import { TransactionType } from '@prisma/client';
import { prisma } from '../../../../config/prisma';
import {
  CategoryResult,
  CreateCategoryData,
  ICategoryRepository,
  UpdateCategoryData,
} from '../../domain/repositories/ICategoryRepository';

const categorySelect = {
  id: true,
  name: true,
  icon: true,
  type: true,
  isSystem: true,
};

export class PrismaCategoryRepository implements ICategoryRepository {
  async findAll(): Promise<CategoryResult[]> {
    return prisma.category.findMany({
      where: { deletedAt: null },
      select: categorySelect,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<CategoryResult | null> {
    return prisma.category.findFirst({ where: { id, deletedAt: null }, select: categorySelect });
  }

  async create(data: CreateCategoryData): Promise<CategoryResult> {
    return prisma.category.create({
      data: { name: data.name, icon: data.icon, type: data.type as TransactionType },
      select: categorySelect,
    });
  }

  async update(id: string, data: UpdateCategoryData): Promise<CategoryResult> {
    return prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.type !== undefined && { type: data.type as TransactionType }),
      },
      select: categorySelect,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
