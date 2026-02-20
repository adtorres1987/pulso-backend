import { NextFunction, Request, Response } from 'express';
import { RegisterUserUseCase } from '../application/use-cases/RegisterUserUseCase';
import { LoginUseCase } from '../application/use-cases/LoginUseCase';
import { RefreshTokenUseCase } from '../application/use-cases/RefreshTokenUseCase';
import { LogoutUseCase } from '../application/use-cases/LogoutUseCase';
import { RegisterUserDto } from '../application/dtos/RegisterUserDto';
import { LoginDto } from '../application/dtos/LoginDto';
import { sendSuccess } from '../../../utils/response';
import { AuthRequest } from '../../../types';

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as RegisterUserDto;
      const result = await this.registerUserUseCase.execute(dto);
      sendSuccess(res, result, 201, 'User registered successfully');
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as LoginDto;
      const result = await this.loginUseCase.execute(dto);
      sendSuccess(res, result, 200, 'Login successful');
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.refreshTokenUseCase.execute(req.token!);
      sendSuccess(res, result, 200, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.logoutUseCase.execute(req.token!);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  };
}
