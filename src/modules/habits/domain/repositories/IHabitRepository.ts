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

export interface PaginatedHabits {
  items: HabitResult[];
  total: number;
}

export interface PaginatedHabitLogs {
  items: HabitLogResult[];
  total: number;
}

export interface IHabitRepository {
  findAllByUser(userId: string, activeOnly: boolean | undefined, page: number, limit: number): Promise<PaginatedHabits>;
  findByIdAndUser(id: string, userId: string): Promise<HabitResult | null>;
  create(data: CreateHabitData): Promise<HabitResult>;
  update(id: string, data: UpdateHabitData): Promise<HabitResult>;
  delete(id: string): Promise<void>;
  findLogsByHabit(habitId: string, page: number, limit: number): Promise<PaginatedHabitLogs>;
  upsertLog(habitId: string, date: Date, completed: boolean): Promise<HabitLogResult>;
}
