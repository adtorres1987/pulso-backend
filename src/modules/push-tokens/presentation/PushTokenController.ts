import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../../types';
import { sendSuccess } from '../../../utils/response';
import { UpsertPushTokenUseCase } from '../application/use-cases/UpsertPushTokenUseCase';
import { DeletePushTokenUseCase } from '../application/use-cases/DeletePushTokenUseCase';

export class PushTokenController {
  constructor(
    private readonly upsertToken: UpsertPushTokenUseCase,
    private readonly deleteToken: DeletePushTokenUseCase,
  ) {}

  register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, platform } = req.body as { token: string; platform: string };
      const result = await this.upsertToken.execute(req.userId!, token, platform ?? 'unknown');
      sendSuccess(res, result, 200, 'Push token registered');
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteToken.execute(req.params.token, req.userId!);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  };
}
