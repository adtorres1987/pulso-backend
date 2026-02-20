import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../../types';
import { GetAllInvestmentProfilesUseCase } from '../application/use-cases/GetAllInvestmentProfilesUseCase';
import { GetInvestmentProfileByIdUseCase } from '../application/use-cases/GetInvestmentProfileByIdUseCase';
import { CreateInvestmentProfileUseCase } from '../application/use-cases/CreateInvestmentProfileUseCase';
import { UpdateInvestmentProfileUseCase } from '../application/use-cases/UpdateInvestmentProfileUseCase';
import { DeleteInvestmentProfileUseCase } from '../application/use-cases/DeleteInvestmentProfileUseCase';
import { sendSuccess } from '../../../utils/response';

export class InvestmentProfileController {
  constructor(
    private readonly getAllInvestmentProfiles: GetAllInvestmentProfilesUseCase,
    private readonly getInvestmentProfileById: GetInvestmentProfileByIdUseCase,
    private readonly createInvestmentProfile: CreateInvestmentProfileUseCase,
    private readonly updateInvestmentProfile: UpdateInvestmentProfileUseCase,
    private readonly deleteInvestmentProfile: DeleteInvestmentProfileUseCase,
  ) {}

  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profiles = await this.getAllInvestmentProfiles.execute(req.userId!);
      sendSuccess(res, profiles);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.getInvestmentProfileById.execute(req.params.id, req.userId!);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.createInvestmentProfile.execute(req.userId!, req.body);
      sendSuccess(res, profile, 201, 'Investment profile created');
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.updateInvestmentProfile.execute(req.params.id, req.userId!, req.body);
      sendSuccess(res, profile, 200, 'Investment profile updated');
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteInvestmentProfile.execute(req.params.id, req.userId!);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  };
}
