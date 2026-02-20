import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../../types';
import { GetAllSavingGoalsUseCase } from '../application/use-cases/GetAllSavingGoalsUseCase';
import { GetSavingGoalByIdUseCase } from '../application/use-cases/GetSavingGoalByIdUseCase';
import { CreateSavingGoalUseCase } from '../application/use-cases/CreateSavingGoalUseCase';
import { UpdateSavingGoalUseCase } from '../application/use-cases/UpdateSavingGoalUseCase';
import { DepositSavingGoalUseCase } from '../application/use-cases/DepositSavingGoalUseCase';
import { DeleteSavingGoalUseCase } from '../application/use-cases/DeleteSavingGoalUseCase';
import { sendSuccess } from '../../../utils/response';

export class SavingGoalController {
  constructor(
    private readonly getAllSavingGoals: GetAllSavingGoalsUseCase,
    private readonly getSavingGoalById: GetSavingGoalByIdUseCase,
    private readonly createSavingGoal: CreateSavingGoalUseCase,
    private readonly updateSavingGoal: UpdateSavingGoalUseCase,
    private readonly depositSavingGoal: DepositSavingGoalUseCase,
    private readonly deleteSavingGoal: DeleteSavingGoalUseCase,
  ) {}

  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const goals = await this.getAllSavingGoals.execute(req.userId!);
      sendSuccess(res, goals);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const goal = await this.getSavingGoalById.execute(req.params.id, req.userId!);
      sendSuccess(res, goal);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const goal = await this.createSavingGoal.execute(req.userId!, req.body);
      sendSuccess(res, goal, 201, 'Saving goal created');
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const goal = await this.updateSavingGoal.execute(req.params.id, req.userId!, req.body);
      sendSuccess(res, goal, 200, 'Saving goal updated');
    } catch (err) {
      next(err);
    }
  };

  deposit = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const goal = await this.depositSavingGoal.execute(req.params.id, req.userId!, req.body);
      sendSuccess(res, goal, 200, 'Deposit added');
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteSavingGoal.execute(req.params.id, req.userId!);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  };
}
