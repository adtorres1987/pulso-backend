import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types';
import { GetAllGroupsUseCase } from '../application/use-cases/GetAllGroupsUseCase';
import { GetGroupByIdUseCase } from '../application/use-cases/GetGroupByIdUseCase';
import { CreateGroupUseCase } from '../application/use-cases/CreateGroupUseCase';
import { UpdateGroupUseCase } from '../application/use-cases/UpdateGroupUseCase';
import { DeleteGroupUseCase } from '../application/use-cases/DeleteGroupUseCase';
import { AddGroupMemberUseCase } from '../application/use-cases/AddGroupMemberUseCase';
import { RemoveGroupMemberUseCase } from '../application/use-cases/RemoveGroupMemberUseCase';
import { GetGroupExpensesUseCase } from '../application/use-cases/GetGroupExpensesUseCase';
import { CreateGroupExpenseUseCase } from '../application/use-cases/CreateGroupExpenseUseCase';
import { IncludeShareInPersonalUseCase } from '../application/use-cases/IncludeShareInPersonalUseCase';
import { sendSuccess } from '../../../utils/response';

export class GroupController {
  constructor(
    private readonly getAll: GetAllGroupsUseCase,
    private readonly getOne: GetGroupByIdUseCase,
    private readonly create: CreateGroupUseCase,
    private readonly update: UpdateGroupUseCase,
    private readonly remove: DeleteGroupUseCase,
    private readonly addMember: AddGroupMemberUseCase,
    private readonly removeMember: RemoveGroupMemberUseCase,
    private readonly getExpenses: GetGroupExpensesUseCase,
    private readonly createExpense: CreateGroupExpenseUseCase,
    private readonly includeShare: IncludeShareInPersonalUseCase,
  ) {}

  index = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.getAll.execute(req.userId!)); } catch (err) { next(err); }
  };

  show = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.getOne.execute(req.params.id, req.userId!)); } catch (err) { next(err); }
  };

  store = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.create.execute(req.body, req.userId!), 201, 'Group created'); } catch (err) { next(err); }
  };

  patch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.update.execute(req.params.id, req.body, req.userId!), 200, 'Group updated'); } catch (err) { next(err); }
  };

  destroy = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try { await this.remove.execute(req.params.id, req.userId!); sendSuccess(res, null, 204); } catch (err) { next(err); }
  };

  addMemberHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const member = await this.addMember.execute(req.params.id, req.userId!, req.body.userId);
      sendSuccess(res, member, 201, 'Member added');
    } catch (err) { next(err); }
  };

  removeMemberHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.removeMember.execute(req.params.id, req.userId!, req.params.userId);
      sendSuccess(res, null, 204);
    } catch (err) { next(err); }
  };

  indexExpenses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.getExpenses.execute(req.params.id, req.userId!)); } catch (err) { next(err); }
  };

  storeExpense = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const expense = await this.createExpense.execute(req.params.id, req.userId!, req.body);
      sendSuccess(res, expense, 201, 'Expense created');
    } catch (err) { next(err); }
  };

  includeShareInPersonal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const share = await this.includeShare.execute(req.params.id, req.params.expenseId, req.params.shareId, req.userId!);
      sendSuccess(res, share, 200, 'Share linked to personal transactions');
    } catch (err) { next(err); }
  };
}
