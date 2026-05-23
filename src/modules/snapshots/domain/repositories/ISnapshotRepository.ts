export interface SnapshotResult {
  id: string;
  date: Date;
  mood: string | null;
  reflection: string | null;
  consciousScore: number | null;
  createdAt: Date;
}

export interface CreateSnapshotData {
  userId: string;
  date: Date;
  mood?: 'calm' | 'stressed' | 'confident' | 'neutral';
  reflection?: string;
  consciousScore?: number;
}

export interface UpdateSnapshotData {
  mood?: 'calm' | 'stressed' | 'confident' | 'neutral';
  reflection?: string;
  consciousScore?: number;
}

export interface PaginatedSnapshots {
  items: SnapshotResult[];
  total: number;
}

export interface ISnapshotRepository {
  findAllByUser(userId: string, page: number, limit: number): Promise<PaginatedSnapshots>;
  findByUserAndDate(userId: string, date: Date): Promise<SnapshotResult | null>;
  findByIdAndUser(id: string, userId: string): Promise<SnapshotResult | null>;
  create(data: CreateSnapshotData): Promise<SnapshotResult>;
  update(id: string, data: UpdateSnapshotData): Promise<SnapshotResult>;
}
