export type GroupMemberRole = 'owner' | 'member';

export interface GroupResult {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  members: GroupMemberResult[];
}

export interface GroupMemberResult {
  id: string;
  userId: string;
  role: GroupMemberRole;
  joinedAt: Date;
  person: { firstName: string; lastName: string; avatarUrl: string | null } | null;
}

export interface MemberExpenseSummary {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  total: string;
  percentage: string;
}

export interface GroupExpenseSummaryData {
  total: string;
  byMember: MemberExpenseSummary[];
}

export interface GroupExpenseSummaryResult {
  month: string;
  total: string;
  byMember: MemberExpenseSummary[];
}

export interface GroupExpenseResult {
  id: string;
  groupId: string;
  paidById: string;
  amount: string;
  description: string;
  occurredAt: Date;
  createdAt: Date;
  shares: GroupExpenseShareResult[];
}

export interface GroupExpenseShareResult {
  id: string;
  groupMemberId: string;
  amount: string;
  includeInPersonal: boolean;
  transactionId: string | null;
}

export interface CreateGroupData {
  name: string;
  createdBy: string;
}

export interface CreateGroupExpenseData {
  groupId: string;
  paidById: string;
  amount: number;
  description: string;
  occurredAt: Date;
  shares: Array<{ groupMemberId: string; amount: number }>;
}

export interface UpdateGroupExpenseData {
  amount?: number;
  description?: string;
  occurredAt?: Date;
  paidByUserId?: string;
  shares?: Array<{ groupMemberId: string; amount: number }>;
}

export interface PaginatedGroups {
  items: GroupResult[];
  total: number;
}

export interface PaginatedGroupExpenses {
  items: GroupExpenseResult[];
  total: number;
}

export interface IGroupRepository {
  findAllByUser(userId: string, page: number, limit: number): Promise<PaginatedGroups>;
  findByIdAndUser(id: string, userId: string): Promise<GroupResult | null>;
  create(data: CreateGroupData): Promise<GroupResult>;
  update(id: string, name: string): Promise<GroupResult>;
  delete(id: string): Promise<void>;
  addMember(groupId: string, userId: string): Promise<GroupMemberResult>;
  removeMember(groupId: string, userId: string): Promise<void>;
  findMember(groupId: string, userId: string): Promise<GroupMemberResult | null>;
  createExpense(data: CreateGroupExpenseData): Promise<GroupExpenseResult>;
  findExpensesByGroup(groupId: string, page: number, limit: number, month?: string): Promise<PaginatedGroupExpenses>;
  findExpenseByIdAndGroup(expenseId: string, groupId: string): Promise<GroupExpenseResult | null>;
  updateExpense(expenseId: string, data: UpdateGroupExpenseData): Promise<GroupExpenseResult>;
  deleteExpense(expenseId: string): Promise<void>;
  includeShareInPersonal(shareId: string, transactionId: string): Promise<GroupExpenseShareResult>;
  unlinkShareByTransactionId(transactionId: string): Promise<void>;
  getExpenseSummary(groupId: string, startDate: Date, endDate: Date): Promise<GroupExpenseSummaryData>;
}
