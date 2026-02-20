export interface HabitResult {
  id: string;
  name: string;
  frequency: string;
  active: boolean;
  createdAt: Date;
}

export interface HabitLogResult {
  id: string;
  date: Date;
  completed: boolean;
  createdAt: Date;
}

export interface CreateHabitData {
  userId: string;
  name: string;
  frequency: 'daily' | 'weekly';
}

export interface UpdateHabitData {
  name?: string;
  frequency?: 'daily' | 'weekly';
  active?: boolean;
}

export interface IHabitRepository {
  findAllByUser(userId: string, activeOnly?: boolean): Promise<HabitResult[]>;
  findByIdAndUser(id: string, userId: string): Promise<HabitResult | null>;
  create(data: CreateHabitData): Promise<HabitResult>;
  update(id: string, data: UpdateHabitData): Promise<HabitResult>;
  delete(id: string): Promise<void>;
  findLogsByHabit(habitId: string): Promise<HabitLogResult[]>;
  upsertLog(habitId: string, date: Date, completed: boolean): Promise<HabitLogResult>;
}
