import { Router } from 'express';
import { PrismaDashboardRepository } from '../infrastructure/repositories/PrismaDashboardRepository';
import { GetDashboardUseCase } from '../application/use-cases/GetDashboardUseCase';
import { GetCategoryTrendUseCase } from '../application/use-cases/GetCategoryTrendUseCase';
import { DashboardController } from './DashboardController';
import { authenticate } from '../../../middlewares/auth';

const router = Router();

const dashboardRepository = new PrismaDashboardRepository();
const dashboardController = new DashboardController(
  new GetDashboardUseCase(dashboardRepository),
  new GetCategoryTrendUseCase(dashboardRepository),
);

router.get('/', authenticate, dashboardController.index);
router.get('/category-trend', authenticate, dashboardController.categoryTrend);

export default router;
