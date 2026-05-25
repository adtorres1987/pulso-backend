import { Router } from 'express';
import { PrismaDashboardRepository } from '../infrastructure/repositories/PrismaDashboardRepository';
import { GetDashboardUseCase } from '../application/use-cases/GetDashboardUseCase';
import { DashboardController } from './DashboardController';
import { authenticate } from '../../../middlewares/auth';

const router = Router();

const dashboardRepository = new PrismaDashboardRepository();
const dashboardController = new DashboardController(
  new GetDashboardUseCase(dashboardRepository),
);

router.get('/', authenticate, dashboardController.index);

export default router;
