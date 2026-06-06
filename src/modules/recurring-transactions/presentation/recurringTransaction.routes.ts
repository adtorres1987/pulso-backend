import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { PrismaRecurringTransactionRepository } from '../infrastructure/repositories/PrismaRecurringTransactionRepository';
import { GetAllRecurringTransactionsUseCase } from '../application/use-cases/GetAllRecurringTransactionsUseCase';
import { CreateRecurringTransactionUseCase } from '../application/use-cases/CreateRecurringTransactionUseCase';
import { UpdateRecurringTransactionUseCase } from '../application/use-cases/UpdateRecurringTransactionUseCase';
import { DeleteRecurringTransactionUseCase } from '../application/use-cases/DeleteRecurringTransactionUseCase';
import { RecurringTransactionController } from './RecurringTransactionController';
import { validateCreate, validateUpdate } from './validators/recurringTransaction.validator';

const router = Router();

const repo = new PrismaRecurringTransactionRepository();
const controller = new RecurringTransactionController(
  new GetAllRecurringTransactionsUseCase(repo),
  new CreateRecurringTransactionUseCase(repo),
  new UpdateRecurringTransactionUseCase(repo),
  new DeleteRecurringTransactionUseCase(repo),
);

router.get('/', authenticate, controller.list);
router.post('/', authenticate, validateCreate, controller.create);
router.patch('/:id', authenticate, validateUpdate, controller.update);
router.delete('/:id', authenticate, controller.remove);

export default router;
