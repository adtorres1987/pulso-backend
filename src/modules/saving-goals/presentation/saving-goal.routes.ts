import { Router } from 'express';
import { PrismaSavingGoalRepository } from '../infrastructure/repositories/PrismaSavingGoalRepository';
import { GetAllSavingGoalsUseCase } from '../application/use-cases/GetAllSavingGoalsUseCase';
import { GetSavingGoalByIdUseCase } from '../application/use-cases/GetSavingGoalByIdUseCase';
import { CreateSavingGoalUseCase } from '../application/use-cases/CreateSavingGoalUseCase';
import { UpdateSavingGoalUseCase } from '../application/use-cases/UpdateSavingGoalUseCase';
import { DepositSavingGoalUseCase } from '../application/use-cases/DepositSavingGoalUseCase';
import { DeleteSavingGoalUseCase } from '../application/use-cases/DeleteSavingGoalUseCase';
import { SavingGoalController } from './SavingGoalController';
import {
  validateCreateSavingGoal,
  validateDeposit,
  validateUpdateSavingGoal,
} from './validators/saving-goal.validator';
import { authenticate } from '../../../middlewares/auth';

const router = Router();

const savingGoalRepository = new PrismaSavingGoalRepository();
const savingGoalController = new SavingGoalController(
  new GetAllSavingGoalsUseCase(savingGoalRepository),
  new GetSavingGoalByIdUseCase(savingGoalRepository),
  new CreateSavingGoalUseCase(savingGoalRepository),
  new UpdateSavingGoalUseCase(savingGoalRepository),
  new DepositSavingGoalUseCase(savingGoalRepository),
  new DeleteSavingGoalUseCase(savingGoalRepository),
);

router.get('/', authenticate, savingGoalController.getAll);
router.get('/:id', authenticate, savingGoalController.getOne);
router.post('/', authenticate, validateCreateSavingGoal, savingGoalController.create);
router.patch('/:id', authenticate, validateUpdateSavingGoal, savingGoalController.update);
router.patch('/:id/deposit', authenticate, validateDeposit, savingGoalController.deposit);
router.delete('/:id', authenticate, savingGoalController.remove);

export default router;
