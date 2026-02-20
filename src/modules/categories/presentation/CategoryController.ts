import { NextFunction, Request, Response } from 'express';
import { GetAllCategoriesUseCase } from '../application/use-cases/GetAllCategoriesUseCase';
import { GetCategoryByIdUseCase } from '../application/use-cases/GetCategoryByIdUseCase';
import { CreateCategoryUseCase } from '../application/use-cases/CreateCategoryUseCase';
import { UpdateCategoryUseCase } from '../application/use-cases/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '../application/use-cases/DeleteCategoryUseCase';
import { sendSuccess } from '../../../utils/response';

export class CategoryController {
  constructor(
    private readonly getAllCategories: GetAllCategoriesUseCase,
    private readonly getCategoryById: GetCategoryByIdUseCase,
    private readonly createCategory: CreateCategoryUseCase,
    private readonly updateCategory: UpdateCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase,
  ) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.getAllCategories.execute();
      sendSuccess(res, categories);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.getCategoryById.execute(req.params.id);
      sendSuccess(res, category);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.createCategory.execute(req.body);
      sendSuccess(res, category, 201, 'Category created');
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.updateCategory.execute(req.params.id, req.body);
      sendSuccess(res, category, 200, 'Category updated');
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteCategory.execute(req.params.id);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  };
}
