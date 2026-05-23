import { TransactionType } from '@prisma/client';
import { prisma } from '../../../../config/prisma';
import {
  CategoryResult,
  CreateCategoryData,
  ICategoryRepository,
  PaginatedCategories,
  UpdateCategoryData,
} from '../../domain/repositories/ICategoryRepository';

const categorySelect = {
  id: true,
  userId: true,
  name: true,
  icon: true,
  type: true,
  isSystem: true,
};

export class PrismaCategoryRepository implements ICategoryRepository {
  // Returns global categories + user's own categories (if userId provided)
  async findAll(userId?: string, page = 1, limit = 10): Promise<PaginatedCategories> {
    const where = {
      deletedAt: null,
      OR: [{ userId: null }, ...(userId ? [{ userId }] : [])] as object[],
    };
    const [items, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        select: categorySelect,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<CategoryResult | null> {
    return prisma.category.findFirst({ where: { id, deletedAt: null }, select: categorySelect });
  }

  // Used to verify ownership when a user edits/deletes their own category
  async findByIdForUser(id: string, userId: string): Promise<CategoryResult | null> {
    return prisma.category.findFirst({ where: { id, userId, deletedAt: null }, select: categorySelect });
  }

  async existsByName(name: string, userId?: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.category.count({
      where: {
        name: { equals: name, mode: 'insensitive' },
        deletedAt: null,
        // Check conflict against globals OR against the same user's categories
        OR: [{ userId: null }, ...(userId ? [{ userId }] : [])],
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  async create(data: CreateCategoryData): Promise<CategoryResult> {
    return prisma.category.create({
      data: {
        userId: data.userId ?? null,
        name: data.name,
        icon: data.icon,
        type: data.type as TransactionType,
        isSystem: data.isSystem ?? false,
      },
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
