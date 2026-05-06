import { Request, Response, NextFunction } from 'express';
import { GetAllSubscriptionPlansUseCase } from '../application/use-cases/GetAllSubscriptionPlansUseCase';
import { GetSubscriptionPlanByIdUseCase } from '../application/use-cases/GetSubscriptionPlanByIdUseCase';
import { CreateSubscriptionPlanUseCase } from '../application/use-cases/CreateSubscriptionPlanUseCase';
import { UpdateSubscriptionPlanUseCase } from '../application/use-cases/UpdateSubscriptionPlanUseCase';
import { DeleteSubscriptionPlanUseCase } from '../application/use-cases/DeleteSubscriptionPlanUseCase';
import { sendSuccess } from '../../../utils/response';

export class SubscriptionPlanController {
  constructor(
    private readonly getAll: GetAllSubscriptionPlansUseCase,
    private readonly getOne: GetSubscriptionPlanByIdUseCase,
    private readonly create: CreateSubscriptionPlanUseCase,
    private readonly update: UpdateSubscriptionPlanUseCase,
    private readonly remove: DeleteSubscriptionPlanUseCase,
  ) {}

  index = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.getAll.execute()); } catch (err) { next(err); }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.getOne.execute(req.params.id)); } catch (err) { next(err); }
  };

  store = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.create.execute(req.body), 201, 'Plan created'); } catch (err) { next(err); }
  };

  patch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { sendSuccess(res, await this.update.execute(req.params.id, req.body), 200, 'Plan updated'); } catch (err) { next(err); }
  };

  destroy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { await this.remove.execute(req.params.id); sendSuccess(res, null, 204); } catch (err) { next(err); }
  };
}
