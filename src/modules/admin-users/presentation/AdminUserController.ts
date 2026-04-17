import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../../types';
import { ListClientUsersUseCase } from '../application/use-cases/ListClientUsersUseCase';
import { GetClientUserByIdUseCase } from '../application/use-cases/GetClientUserByIdUseCase';
import { UpdateClientUserUseCase } from '../application/use-cases/UpdateClientUserUseCase';
import { ResetClientUserPasswordUseCase } from '../application/use-cases/ResetClientUserPasswordUseCase';
import { sendSuccess } from '../../../utils/response';
import { AdminUserFiltersDto } from '../application/dtos/AdminUserDto';

type RequestWithParsedQuery = AuthRequest & { parsedQuery?: AdminUserFiltersDto };

export class AdminUserController {
  constructor(
    private readonly listClientUsers: ListClientUsersUseCase,
    private readonly getClientUserById: GetClientUserByIdUseCase,
    private readonly updateClientUser: UpdateClientUserUseCase,
    private readonly resetClientUserPassword: ResetClientUserPasswordUseCase,
  ) {}

  getAll = async (req: RequestWithParsedQuery, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.parsedQuery!;
      const result = await this.listClientUsers.execute(filters);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.getClientUserById.execute(req.params.id);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.updateClientUser.execute(req.params.id, req.body);
      sendSuccess(res, user, 200, 'User updated');
    } catch (err) {
      next(err);
    }
  };

  resetPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.resetClientUserPassword.execute(req.params.id, req.body);
      sendSuccess(res, null, 200, 'Contraseña actualizada correctamente');
    } catch (err) {
      next(err);
    }
  };
}
