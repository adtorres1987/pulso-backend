import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../../types';
import { GetMeUseCase } from '../application/use-cases/GetMeUseCase';
import { UpdateProfileUseCase } from '../application/use-cases/UpdateProfileUseCase';
import { ChangePasswordUseCase } from '../application/use-cases/ChangePasswordUseCase';
import { sendSuccess } from '../../../utils/response';

export class MeController {
  constructor(
    private readonly getMe: GetMeUseCase,
    private readonly updateProfile: UpdateProfileUseCase,
    private readonly changePassword: ChangePasswordUseCase,
  ) {}

  get = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.getMe.execute(req.userId!);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.updateProfile.execute(req.userId!, req.body);
      sendSuccess(res, user, 200, 'Profile updated');
    } catch (err) {
      next(err);
    }
  };

  password = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.changePassword.execute(req.userId!, req.body);
      sendSuccess(res, null, 200, 'Contraseña actualizada correctamente');
    } catch (err) {
      next(err);
    }
  };
}
