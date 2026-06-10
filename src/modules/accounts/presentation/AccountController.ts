import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../../types';
import { ListAccountsUseCase } from '../application/use-cases/ListAccountsUseCase';
import { CreateAccountUseCase } from '../application/use-cases/CreateAccountUseCase';
import { UpdateAccountUseCase } from '../application/use-cases/UpdateAccountUseCase';
import { DeleteAccountUseCase } from '../application/use-cases/DeleteAccountUseCase';
import { sendSuccess } from '../../../utils/response';

export class AccountController {
  constructor(
    private readonly listAccounts: ListAccountsUseCase,
    private readonly createAccount: CreateAccountUseCase,
    private readonly updateAccount: UpdateAccountUseCase,
    private readonly deleteAccount: DeleteAccountUseCase,
  ) {}

  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accounts = await this.listAccounts.execute(req.userId!);
      sendSuccess(res, accounts);
    } catch (err) { next(err); }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const account = await this.createAccount.execute(req.userId!, req.body);
      sendSuccess(res, account, 201, 'Account created');
    } catch (err) { next(err); }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const account = await this.updateAccount.execute(req.params.id!, req.userId!, req.body);
      sendSuccess(res, account, 200, 'Account updated');
    } catch (err) { next(err); }
  };

  remove = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteAccount.execute(req.params.id!, req.userId!);
      sendSuccess(res, null, 200, 'Account deleted');
    } catch (err) { next(err); }
  };
}
