import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../../types';
import { GetAllTransactionsUseCase } from '../application/use-cases/GetAllTransactionsUseCase';
import { GetTransactionByIdUseCase } from '../application/use-cases/GetTransactionByIdUseCase';
import { CreateTransactionUseCase } from '../application/use-cases/CreateTransactionUseCase';
import { UpdateTransactionUseCase } from '../application/use-cases/UpdateTransactionUseCase';
import { DeleteTransactionUseCase } from '../application/use-cases/DeleteTransactionUseCase';
import { AddTransactionImageUseCase } from '../application/use-cases/AddTransactionImageUseCase';
import { RemoveTransactionImageUseCase } from '../application/use-cases/RemoveTransactionImageUseCase';
import { sendSuccess } from '../../../utils/response';
import { TransactionFilters } from '../domain/repositories/ITransactionRepository';
import { AppError } from '../../../middlewares/errorHandler';
import { APP_CONFIG_KEYS, IAppConfigRepository } from '../../app-config/domain/repositories/IAppConfigRepository';

export class TransactionController {
  constructor(
    private readonly getAllTransactions: GetAllTransactionsUseCase,
    private readonly getTransactionById: GetTransactionByIdUseCase,
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly updateTransaction: UpdateTransactionUseCase,
    private readonly deleteTransaction: DeleteTransactionUseCase,
    private readonly addTransactionImage: AddTransactionImageUseCase,
    private readonly removeTransactionImage: RemoveTransactionImageUseCase,
    private readonly configRepo: IAppConfigRepository,
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

  uploadImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) throw new AppError('No image provided', 400);
      const image = await this.addTransactionImage.execute(req.params.id, req.userId!, req.file.buffer);
      sendSuccess(res, image, 201, 'Image uploaded');
    } catch (err) {
      next(err);
    }
  };

  deleteImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.removeTransactionImage.execute(req.params.imageId, req.params.id, req.userId!);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  };

  exportCsv = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: TransactionFilters = {};
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(`${req.query.endDate as string}T23:59:59`);

      const maxRows = await this.configRepo.getValueAsNumber(APP_CONFIG_KEYS.CSV_EXPORT_MAX_ROWS, 10000);
      const { items } = await this.getAllTransactions.execute(req.userId!, filters, 1, maxRows);

      const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
      const header = 'Date,Type,Category,Amount,Note,Emotion';
      const rows = items.map((tx) => [
        new Date(tx.occurredAt).toISOString().slice(0, 10),
        tx.type,
        tx.category?.name ?? '',
        (tx.type === 'expense' ? '-' : '') + parseFloat(tx.amount).toFixed(2),
        escape(tx.note ?? ''),
        tx.emotionTag ?? '',
      ].join(','));

      const filename = `pulso_${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send([header, ...rows].join('\n'));
    } catch (err) {
      next(err);
    }
  };
}
