import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { authorize } from '../../../middlewares/authorize';
import { requireSubscription } from '../../../middlewares/requireSubscription';
import { PrismaCategoryRepository } from '../infrastructure/repositories/PrismaCategoryRepository';
import { GetAllCategoriesUseCase } from '../application/use-cases/GetAllCategoriesUseCase';
import { GetCategoryByIdUseCase } from '../application/use-cases/GetCategoryByIdUseCase';
import { CreateCategoryUseCase } from '../application/use-cases/CreateCategoryUseCase';
import { UpdateCategoryUseCase } from '../application/use-cases/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '../application/use-cases/DeleteCategoryUseCase';
import { CategoryController } from './CategoryController';
import { validateCreateCategory, validateUpdateCategory } from './validators/category.validator';

const router = Router();

const repo = new PrismaCategoryRepository();
const controller = new CategoryController(
  new GetAllCategoriesUseCase(repo),
  new GetCategoryByIdUseCase(repo),
  new CreateCategoryUseCase(repo),
  new UpdateCategoryUseCase(repo),
  new DeleteCategoryUseCase(repo),
);

const adminAuth = [authenticate, authorize(['admin', 'super_admin'])];
const userAuth = [authenticate, requireSubscription];

// All authenticated users see globals + their own
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getOne);

// Admin manages global categories (must be before /:id to avoid route conflict)
router.post('/admin', ...adminAuth, validateCreateCategory, controller.createGlobal);
router.patch('/admin/:id', ...adminAuth, validateUpdateCategory, controller.updateGlobal);
router.delete('/admin/:id', ...adminAuth, controller.removeGlobal);

// Subscribed users manage their own categories
router.post('/', ...userAuth, validateCreateCategory, controller.createOwn);
router.patch('/:id', ...userAuth, validateUpdateCategory, controller.updateOwn);
router.delete('/:id', ...userAuth, controller.removeOwn);

export default router;
