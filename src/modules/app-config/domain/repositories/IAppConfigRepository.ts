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

export interface IAppConfigRepository {
  findAll(): Promise<AppConfigResult[]>;
  findByKey(key: string): Promise<AppConfigResult | null>;
  upsert(key: string, value: string): Promise<AppConfigResult>;
  getValueAsNumber(key: string, fallback: number): Promise<number>;
}
