import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../../types';
import { sendSuccess } from '../../../utils/response';
import { GetAllRecurringTransactionsUseCase } from '../application/use-cases/GetAllRecurringTransactionsUseCase';
import { CreateRecurringTransactionUseCase } from '../application/use-cases/CreateRecurringTransactionUseCase';
import { UpdateRecurringTransactionUseCase } from '../application/use-cases/UpdateRecurringTransactionUseCase';
import { DeleteRecurringTransactionUseCase } from '../application/use-cases/DeleteRecurringTransactionUseCase';

export class RecurringTransactionController {
  constructor(
    private readonly getAll: GetAllRecurringTransactionsUseCase,
    private readonly createOne: CreateRecurringTransactionUseCase,
    private readonly updateOne: UpdateRecurringTransactionUseCase,
    private readonly deleteOne: DeleteRecurringTransactionUseCase,
  ) {}

  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.getAll.execute(req.userId!);
      sendSuccess(res, items);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.createOne.execute(req.userId!, req.body);
      sendSuccess(res, item, 201, 'Recurring transaction created');
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.updateOne.execute(req.params.id, req.userId!, req.body);
      sendSuccess(res, item, 200, 'Recurring transaction updated');
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteOne.execute(req.params.id, req.userId!);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  };
}
