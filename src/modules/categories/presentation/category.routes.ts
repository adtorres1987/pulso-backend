import { Router } from 'express';
import { PrismaCategoryRepository } from '../infrastructure/repositories/PrismaCategoryRepository';
import { GetAllCategoriesUseCase } from '../application/use-cases/GetAllCategoriesUseCase';
import { GetCategoryByIdUseCase } from '../application/use-cases/GetCategoryByIdUseCase';
import { CreateCategoryUseCase } from '../application/use-cases/CreateCategoryUseCase';
import { UpdateCategoryUseCase } from '../application/use-cases/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '../application/use-cases/DeleteCategoryUseCase';
import { CategoryController } from './CategoryController';
import { validateCreateCategory, validateUpdateCategory } from './validators/category.validator';
import { authenticate } from '../../../middlewares/auth';
import { authorize } from '../../../middlewares/authorize';

const router = Router();

const categoryRepository = new PrismaCategoryRepository();
const categoryController = new CategoryController(
  new GetAllCategoriesUseCase(categoryRepository),
  new GetCategoryByIdUseCase(categoryRepository),
  new CreateCategoryUseCase(categoryRepository),
  new UpdateCategoryUseCase(categoryRepository),
  new DeleteCategoryUseCase(categoryRepository),
);

const adminOnly = authorize(['admin', 'super_admin']);

router.get('/', authenticate, categoryController.getAll);
router.get('/:id', authenticate, categoryController.getOne);
router.post('/', authenticate, adminOnly, validateCreateCategory, categoryController.create);
router.patch('/:id', authenticate, adminOnly, validateUpdateCategory, categoryController.update);
router.delete('/:id', authenticate, adminOnly, categoryController.remove);

export default router;
