import { RoleType } from '@prisma/client';
import { prisma } from '../../../../config/prisma';
import {
  CreateRoleData,
  IRoleRepository,
  PaginatedRoles,
  RoleResult,
  UpdateRoleData,
} from '../../domain/repositories/IRoleRepository';

const roleSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  permissions: {
    select: { permission: { select: { action: true } } },
  },
};

const toRoleResult = (raw: {
  id: string;
  name: RoleType;
  description: string | null;
  createdAt: Date;
  permissions: { permission: { action: string } }[];
}): RoleResult => ({
  id: raw.id,
  name: raw.name,
  description: raw.description,
  createdAt: raw.createdAt,
  permissions: raw.permissions.map((rp) => rp.permission.action),
});

export class PrismaRoleRepository implements IRoleRepository {
  async findAll(page = 1, limit = 20): Promise<PaginatedRoles> {
    const where = { deletedAt: null };
    const [roles, total] = await prisma.$transaction([
      prisma.role.findMany({ where, select: roleSelect, orderBy: { createdAt: 'asc' }, skip: (page - 1) * limit, take: limit }),
      prisma.role.count({ where }),
    ]);
    return { items: roles.map(toRoleResult), total };
  }

  async findById(id: string): Promise<RoleResult | null> {
    const role = await prisma.role.findFirst({
      where: { id, deletedAt: null },
      select: roleSelect,
    });
    return role ? toRoleResult(role) : null;
  }

  async nameExists(name: RoleType): Promise<boolean> {
    const count = await prisma.role.count({ where: { name, deletedAt: null } });
    return count > 0;
  }

  async create(data: CreateRoleData): Promise<RoleResult> {
    const role = await prisma.role.create({
      data: { name: data.name, description: data.description },
      select: roleSelect,
    });
    return toRoleResult(role);
  }

  async update(id: string, data: UpdateRoleData): Promise<RoleResult> {
    const role = await prisma.role.update({
      where: { id },
      data: { description: data.description },
      select: roleSelect,
    });
    return toRoleResult(role);
  }

  async delete(id: string): Promise<void> {
    await prisma.role.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
