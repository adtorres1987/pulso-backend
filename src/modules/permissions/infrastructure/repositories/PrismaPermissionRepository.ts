import { prisma } from '../../../../config/prisma';
import {
  CreatePermissionData,
  IPermissionRepository,
  PermissionResult,
  UpdatePermissionData,
} from '../../domain/repositories/IPermissionRepository';

const permissionSelect = {
  id: true,
  action: true,
  description: true,
  createdAt: true,
};

export class PrismaPermissionRepository implements IPermissionRepository {
  async findAll(): Promise<PermissionResult[]> {
    return prisma.permission.findMany({
      select: permissionSelect,
      orderBy: { action: 'asc' },
    });
  }

  async findById(id: string): Promise<PermissionResult | null> {
    return prisma.permission.findUnique({
      where: { id },
      select: permissionSelect,
    });
  }

  async actionExists(action: string): Promise<boolean> {
    const count = await prisma.permission.count({ where: { action } });
    return count > 0;
  }

  async create(data: CreatePermissionData): Promise<PermissionResult> {
    return prisma.permission.create({
      data: { action: data.action, description: data.description },
      select: permissionSelect,
    });
  }

  async update(id: string, data: UpdatePermissionData): Promise<PermissionResult> {
    return prisma.permission.update({
      where: { id },
      data: { action: data.action, description: data.description },
      select: permissionSelect,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.permission.delete({ where: { id } });
  }
}
