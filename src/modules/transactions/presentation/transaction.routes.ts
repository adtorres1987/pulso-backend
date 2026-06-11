import { Router } from 'express';
import { PrismaTransactionRepository } from '../infrastructure/repositories/PrismaTransactionRepository';
import { PrismaGroupRepository } from '../../groups/infrastructure/repositories/PrismaGroupRepository';
import { PrismaAppConfigRepository } from '../../app-config/infrastructure/repositories/PrismaAppConfigRepository';
import { GetAllTransactionsUseCase } from '../application/use-cases/GetAllTransactionsUseCase';
import { GetTransactionByIdUseCase } from '../application/use-cases/GetTransactionByIdUseCase';
import { CreateTransactionUseCase } from '../application/use-cases/CreateTransactionUseCase';
import { UpdateTransactionUseCase } from '../application/use-cases/UpdateTransactionUseCase';
import { DeleteTransactionUseCase } from '../application/use-cases/DeleteTransactionUseCase';
import { AddTransactionImageUseCase } from '../application/use-cases/AddTransactionImageUseCase';
import { RemoveTransactionImageUseCase } from '../application/use-cases/RemoveTransactionImageUseCase';
import { TransactionController } from './TransactionController';
import {
  validateCreateTransaction,
  validateTransactionFilters,
  validateUpdateTransaction,
} from './validators/transaction.validator';
import { authenticate } from '../../../middlewares/auth';
import { uploadImage } from '../../../middlewares/upload';

const router = Router();

const transactionRepository = new PrismaTransactionRepository();
const groupRepository = new PrismaGroupRepository();
const transactionController = new TransactionController(
  new GetAllTransactionsUseCase(transactionRepository),
  new GetTransactionByIdUseCase(transactionRepository),
  new CreateTransactionUseCase(transactionRepository),
  new UpdateTransactionUseCase(transactionRepository),
  new DeleteTransactionUseCase(transactionRepository, groupRepository),
  new AddTransactionImageUseCase(transactionRepository),
  new RemoveTransactionImageUseCase(transactionRepository),
  new PrismaAppConfigRepository(),
);

router.get('/export', authenticate, transactionController.exportCsv);
router.get('/', authenticate, validateTransactionFilters, transactionController.getAll);
router.get('/:id', authenticate, transactionController.getOne);
router.post('/', authenticate, uploadImage, validateCreateTransaction, transactionController.create);
router.patch('/:id', authenticate, uploadImage, validateUpdateTransaction, transactionController.update);
router.delete('/:id', authenticate, transactionController.remove);

router.post('/:id/images', authenticate, uploadImage, transactionController.uploadImage);
router.delete('/:id/images/:imageId', authenticate, transactionController.deleteImage);

export default router;
