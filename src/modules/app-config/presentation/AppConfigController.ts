import { Request, Response, NextFunction } from 'express';
import { GetAllAppConfigUseCase } from '../application/use-cases/GetAllAppConfigUseCase';
import { UpdateAppConfigUseCase } from '../application/use-cases/UpdateAppConfigUseCase';
import { sendSuccess } from '../../../utils/response';

export class AppConfigController {
  constructor(
    private readonly getAll: GetAllAppConfigUseCase,
    private readonly update: UpdateAppConfigUseCase,
  ) {}

  getConfig = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = await this.getAll.execute();
      sendSuccess(res, config);
    } catch (err) {
      next(err);
    }
  };

  updateConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = await this.update.execute(req.params.key, req.body);
      sendSuccess(res, config, 200, 'Config updated');
    } catch (err) {
      next(err);
    }
  };
}
