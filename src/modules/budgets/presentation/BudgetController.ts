import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../../types';
import { sendSuccess } from '../../../utils/response';
import { GetAllBudgetsUseCase } from '../application/use-cases/GetAllBudgetsUseCase';
import { CreateBudgetUseCase } from '../application/use-cases/CreateBudgetUseCase';
import { UpdateBudgetUseCase } from '../application/use-cases/UpdateBudgetUseCase';
import { DeleteBudgetUseCase } from '../application/use-cases/DeleteBudgetUseCase';

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export class BudgetController {
  constructor(
    private readonly getAllBudgets: GetAllBudgetsUseCase,
    private readonly createBudget: CreateBudgetUseCase,
    private readonly updateBudget: UpdateBudgetUseCase,
    private readonly deleteBudget: DeleteBudgetUseCase,
  ) {}

  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const month = (req.query.month as string) || currentMonth();
      const budgets = await this.getAllBudgets.execute(req.userId!, month);
      sendSuccess(res, budgets);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const budget = await this.createBudget.execute(req.userId!, req.body);
      sendSuccess(res, budget, 201, 'Budget created');
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const budget = await this.updateBudget.execute(req.params.id, req.userId!, req.body);
      sendSuccess(res, budget, 200, 'Budget updated');
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteBudget.execute(req.params.id, req.userId!);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  };
}
