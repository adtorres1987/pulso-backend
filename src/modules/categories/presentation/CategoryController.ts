import { NextFunction, Request, Response } from 'express';
import { GetAllCategoriesUseCase } from '../application/use-cases/GetAllCategoriesUseCase';
import { GetCategoryByIdUseCase } from '../application/use-cases/GetCategoryByIdUseCase';
import { CreateCategoryUseCase } from '../application/use-cases/CreateCategoryUseCase';
import { UpdateCategoryUseCase } from '../application/use-cases/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '../application/use-cases/DeleteCategoryUseCase';
import { sendSuccess } from '../../../utils/response';
import { AuthRequest } from '../../../types';

export class CategoryController {
  constructor(
    private readonly getAllCategories: GetAllCategoriesUseCase,
    private readonly getCategoryById: GetCategoryByIdUseCase,
    private readonly createCategory: CreateCategoryUseCase,
    private readonly updateCategory: UpdateCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase,
  ) {}

  // Returns globals + user's own categories
  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const result = await this.getAllCategories.execute(req.userId!, page, limit);
      sendSuccess(res, { ...result, page, limit });
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

  // Admin: creates global category (no userId)
  createGlobal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.createCategory.execute(req.body, undefined, true);
      sendSuccess(res, category, 201, 'Category created');
    } catch (err) {
      next(err);
    }
  };

  // User: creates own category (scoped to userId)
  createOwn = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.createCategory.execute(req.body, req.userId!);
      sendSuccess(res, category, 201, 'Category created');
    } catch (err) {
      next(err);
    }
  };

  // Admin: can update any category
  updateGlobal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.updateCategory.execute(req.params.id, req.body);
      sendSuccess(res, category, 200, 'Category updated');
    } catch (err) {
      next(err);
    }
  };

  // User: can only update their own categories
  updateOwn = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.updateCategory.execute(req.params.id, req.body, req.userId!);
      sendSuccess(res, category, 200, 'Category updated');
    } catch (err) {
      next(err);
    }
  };

  // Admin: can delete any category
  removeGlobal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteCategory.execute(req.params.id);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  };

  // User: can only delete their own categories
  removeOwn = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteCategory.execute(req.params.id, req.userId!);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  };
}
