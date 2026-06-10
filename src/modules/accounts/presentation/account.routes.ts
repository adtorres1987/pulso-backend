import { Router } from 'express';
import { PrismaAccountRepository } from '../infrastructure/repositories/PrismaAccountRepository';
import { ListAccountsUseCase } from '../application/use-cases/ListAccountsUseCase';
import { CreateAccountUseCase } from '../application/use-cases/CreateAccountUseCase';
import { UpdateAccountUseCase } from '../application/use-cases/UpdateAccountUseCase';
import { DeleteAccountUseCase } from '../application/use-cases/DeleteAccountUseCase';
import { AccountController } from './AccountController';
import { authenticate } from '../../../middlewares/auth';
import { validateCreateAccount, validateUpdateAccount } from './validators/account.validator';

const router = Router();

const accountRepository = new PrismaAccountRepository();
const controller = new AccountController(
  new ListAccountsUseCase(accountRepository),
  new CreateAccountUseCase(accountRepository),
  new UpdateAccountUseCase(accountRepository),
  new DeleteAccountUseCase(accountRepository),
);

router.get('/', authenticate, controller.getAll);
router.post('/', authenticate, validateCreateAccount, controller.create);
router.patch('/:id', authenticate, validateUpdateAccount, controller.update);
router.delete('/:id', authenticate, controller.remove);

export default router;
