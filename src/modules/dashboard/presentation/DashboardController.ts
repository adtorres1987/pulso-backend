import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../../types';
import { GetDashboardUseCase } from '../application/use-cases/GetDashboardUseCase';
import { AppError } from '../../../middlewares/errorHandler';
import { sendSuccess } from '../../../utils/response';

export class DashboardController {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  index = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const now = new Date();
      const defaultMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
      const month = (req.query.month as string) || defaultMonth;

      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        throw new AppError('Invalid month format. Use YYYY-MM (e.g. 2026-05)', 400);
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

      const result = await this.getDashboardUseCase.execute(req.userId!, month, page, limit);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };
}
