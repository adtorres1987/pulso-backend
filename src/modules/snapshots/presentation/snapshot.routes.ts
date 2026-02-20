import { Router } from 'express';
import { PrismaSnapshotRepository } from '../infrastructure/repositories/PrismaSnapshotRepository';
import { GetAllSnapshotsUseCase } from '../application/use-cases/GetAllSnapshotsUseCase';
import { GetTodaySnapshotUseCase } from '../application/use-cases/GetTodaySnapshotUseCase';
import { CreateSnapshotUseCase } from '../application/use-cases/CreateSnapshotUseCase';
import { UpdateTodaySnapshotUseCase } from '../application/use-cases/UpdateTodaySnapshotUseCase';
import { SnapshotController } from './SnapshotController';
import { validateCreateSnapshot, validateUpdateSnapshot } from './validators/snapshot.validator';
import { authenticate } from '../../../middlewares/auth';

const router = Router();

const snapshotRepository = new PrismaSnapshotRepository();
const snapshotController = new SnapshotController(
  new GetAllSnapshotsUseCase(snapshotRepository),
  new GetTodaySnapshotUseCase(snapshotRepository),
  new CreateSnapshotUseCase(snapshotRepository),
  new UpdateTodaySnapshotUseCase(snapshotRepository),
);

router.get('/', authenticate, snapshotController.getAll);
router.get('/today', authenticate, snapshotController.getToday);
router.post('/', authenticate, validateCreateSnapshot, snapshotController.create);
router.patch('/today', authenticate, validateUpdateSnapshot, snapshotController.updateToday);

export default router;
