import { Request, Response, NextFunction } from 'express';
import { GetAllAppConfigUseCase } from '../application/use-cases/GetAllAppConfigUseCase';
import { GetAppConfigByKeyUseCase } from '../application/use-cases/GetAppConfigByKeyUseCase';
import { CreateAppConfigUseCase } from '../application/use-cases/CreateAppConfigUseCase';
import { UpdateAppConfigUseCase } from '../application/use-cases/UpdateAppConfigUseCase';
import { DeleteAppConfigUseCase } from '../application/use-cases/DeleteAppConfigUseCase';
import { sendSuccess } from '../../../utils/response';

export class AppConfigController {
  constructor(
    private readonly getAll: GetAllAppConfigUseCase,
    private readonly getOne: GetAppConfigByKeyUseCase,
    private readonly create: CreateAppConfigUseCase,
    private readonly update: UpdateAppConfigUseCase,
    private readonly remove: DeleteAppConfigUseCase,
  ) {}

  index = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.getAll.execute()); } catch (err) { next(err); }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.getOne.execute(req.params.key)); } catch (err) { next(err); }
  };

  store = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.create.execute(req.body), 201, 'Config created'); } catch (err) { next(err); }
  };

  patch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.update.execute(req.params.key, req.body), 200, 'Config updated'); } catch (err) { next(err); }
  };

  destroy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { await this.remove.execute(req.params.key); sendSuccess(res, null, 204); } catch (err) { next(err); }
  };
}
