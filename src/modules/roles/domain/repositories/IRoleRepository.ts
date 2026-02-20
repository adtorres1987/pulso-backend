import { RoleType } from '@prisma/client';

export interface RoleResult {
  id: string;
  name: RoleType;
  description: string | null;
  createdAt: Date;
  permissions: string[];
}

export interface CreateRoleData {
  name: RoleType;
  description?: string;
}

export interface UpdateRoleData {
  description?: string;
}

export interface IRoleRepository {
  findAll(): Promise<RoleResult[]>;
  findById(id: string): Promise<RoleResult | null>;
  nameExists(name: RoleType): Promise<boolean>;
  create(data: CreateRoleData): Promise<RoleResult>;
  update(id: string, data: UpdateRoleData): Promise<RoleResult>;
  delete(id: string): Promise<void>;
}
