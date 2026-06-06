import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { PrismaBudgetRepository } from '../infrastructure/repositories/PrismaBudgetRepository';
import { GetAllBudgetsUseCase } from '../application/use-cases/GetAllBudgetsUseCase';
import { CreateBudgetUseCase } from '../application/use-cases/CreateBudgetUseCase';
import { UpdateBudgetUseCase } from '../application/use-cases/UpdateBudgetUseCase';
import { DeleteBudgetUseCase } from '../application/use-cases/DeleteBudgetUseCase';
import { BudgetController } from './BudgetController';
import { validateCreateBudget, validateUpdateBudget } from './validators/budget.validator';

const router = Router();

const budgetRepository = new PrismaBudgetRepository();
const budgetController = new BudgetController(
  new GetAllBudgetsUseCase(budgetRepository),
  new CreateBudgetUseCase(budgetRepository),
  new UpdateBudgetUseCase(budgetRepository),
  new DeleteBudgetUseCase(budgetRepository),
);

router.get('/', authenticate, budgetController.getAll);
router.post('/', authenticate, validateCreateBudget, budgetController.create);
router.patch('/:id', authenticate, validateUpdateBudget, budgetController.update);
router.delete('/:id', authenticate, budgetController.remove);

export default router;
