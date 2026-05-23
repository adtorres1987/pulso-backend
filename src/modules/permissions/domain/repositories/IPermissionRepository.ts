export interface PermissionResult {
  id: string;
  action: string;
  description: string | null;
  createdAt: Date;
}

export interface CreatePermissionData {
  action: string;
  description?: string;
}

export interface UpdatePermissionData {
  action?: string;
  description?: string;
}

export interface PaginatedPermissions {
  items: PermissionResult[];
  total: number;
}

export interface IPermissionRepository {
  findAll(page: number, limit: number): Promise<PaginatedPermissions>;
  findById(id: string): Promise<PermissionResult | null>;
  actionExists(action: string): Promise<boolean>;
  create(data: CreatePermissionData): Promise<PermissionResult>;
  update(id: string, data: UpdatePermissionData): Promise<PermissionResult>;
  delete(id: string): Promise<void>;
}
