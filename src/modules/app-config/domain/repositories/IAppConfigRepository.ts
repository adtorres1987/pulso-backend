export const APP_CONFIG_KEYS = {
  TRIAL_DAYS: 'trial_days',
  GROUP_DISCOUNT_PERCENT: 'group_discount_percent',
} as const;

export type AppConfigKey = (typeof APP_CONFIG_KEYS)[keyof typeof APP_CONFIG_KEYS];

export interface AppConfigResult {
  key: string;
  value: string;
  description: string | null;
  updatedAt: Date;
}

export interface CreateAppConfigData {
  key: string;
  value: string;
  description?: string;
}

export interface UpdateAppConfigData {
  value?: string;
  description?: string;
}

export interface IAppConfigRepository {
  findAll(): Promise<AppConfigResult[]>;
  findByKey(key: string): Promise<AppConfigResult | null>;
  create(data: CreateAppConfigData): Promise<AppConfigResult>;
  upsert(key: string, value: string): Promise<AppConfigResult>;
  update(key: string, data: UpdateAppConfigData): Promise<AppConfigResult>;
  delete(key: string): Promise<void>;
  getValueAsNumber(key: string, fallback: number): Promise<number>;
}
