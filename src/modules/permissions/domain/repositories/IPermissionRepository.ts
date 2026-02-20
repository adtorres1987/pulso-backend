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

export interface IPermissionRepository {
  findAll(): Promise<PermissionResult[]>;
  findById(id: string): Promise<PermissionResult | null>;
  actionExists(action: string): Promise<boolean>;
  create(data: CreatePermissionData): Promise<PermissionResult>;
  update(id: string, data: UpdatePermissionData): Promise<PermissionResult>;
  delete(id: string): Promise<void>;
}
