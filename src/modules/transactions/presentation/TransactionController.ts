import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../../types';
import { GetAllTransactionsUseCase } from '../application/use-cases/GetAllTransactionsUseCase';
import { GetTransactionByIdUseCase } from '../application/use-cases/GetTransactionByIdUseCase';
import { CreateTransactionUseCase } from '../application/use-cases/CreateTransactionUseCase';
import { UpdateTransactionUseCase } from '../application/use-cases/UpdateTransactionUseCase';
import { DeleteTransactionUseCase } from '../application/use-cases/DeleteTransactionUseCase';
import { sendSuccess } from '../../../utils/response';
import { TransactionFilters } from '../domain/repositories/ITransactionRepository';

export class TransactionController {
  constructor(
    private readonly getAllTransactions: GetAllTransactionsUseCase,
    private readonly getTransactionById: GetTransactionByIdUseCase,
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly updateTransaction: UpdateTransactionUseCase,
    private readonly deleteTransaction: DeleteTransactionUseCase,
  ) {}

  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: TransactionFilters = req.query as TransactionFilters;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const result = await this.getAllTransactions.execute(req.userId!, filters, page, limit);
      sendSuccess(res, { ...result, page, limit });
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await this.getTransactionById.execute(req.params.id, req.userId!);
      sendSuccess(res, transaction);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await this.createTransaction.execute(req.userId!, req.body);
      sendSuccess(res, transaction, 201, 'Transaction created');
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await this.updateTransaction.execute(req.params.id, req.userId!, req.body);
      sendSuccess(res, transaction, 200, 'Transaction updated');
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteTransaction.execute(req.params.id, req.userId!);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  };
}
