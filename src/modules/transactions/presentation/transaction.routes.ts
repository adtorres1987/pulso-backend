import { Router } from 'express';
import { PrismaTransactionRepository } from '../infrastructure/repositories/PrismaTransactionRepository';
import { GetAllTransactionsUseCase } from '../application/use-cases/GetAllTransactionsUseCase';
import { GetTransactionByIdUseCase } from '../application/use-cases/GetTransactionByIdUseCase';
import { CreateTransactionUseCase } from '../application/use-cases/CreateTransactionUseCase';
import { UpdateTransactionUseCase } from '../application/use-cases/UpdateTransactionUseCase';
import { DeleteTransactionUseCase } from '../application/use-cases/DeleteTransactionUseCase';
import { TransactionController } from './TransactionController';
import {
  validateCreateTransaction,
  validateTransactionFilters,
  validateUpdateTransaction,
} from './validators/transaction.validator';
import { authenticate } from '../../../middlewares/auth';

const router = Router();

const transactionRepository = new PrismaTransactionRepository();
const transactionController = new TransactionController(
  new GetAllTransactionsUseCase(transactionRepository),
  new GetTransactionByIdUseCase(transactionRepository),
  new CreateTransactionUseCase(transactionRepository),
  new UpdateTransactionUseCase(transactionRepository),
  new DeleteTransactionUseCase(transactionRepository),
);

router.get('/', authenticate, validateTransactionFilters, transactionController.getAll);
router.get('/:id', authenticate, transactionController.getOne);
router.post('/', authenticate, validateCreateTransaction, transactionController.create);
router.patch('/:id', authenticate, validateUpdateTransaction, transactionController.update);
router.delete('/:id', authenticate, transactionController.remove);

export default router;
