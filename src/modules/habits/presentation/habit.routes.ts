import { Router } from 'express';
import { PrismaHabitRepository } from '../infrastructure/repositories/PrismaHabitRepository';
import { GetAllHabitsUseCase } from '../application/use-cases/GetAllHabitsUseCase';
import { GetHabitByIdUseCase } from '../application/use-cases/GetHabitByIdUseCase';
import { CreateHabitUseCase } from '../application/use-cases/CreateHabitUseCase';
import { UpdateHabitUseCase } from '../application/use-cases/UpdateHabitUseCase';
import { DeleteHabitUseCase } from '../application/use-cases/DeleteHabitUseCase';
import { GetHabitLogsUseCase } from '../application/use-cases/GetHabitLogsUseCase';
import { LogHabitUseCase } from '../application/use-cases/LogHabitUseCase';
import { HabitController } from './HabitController';
import { validateCreateHabit, validateLogHabit, validateUpdateHabit } from './validators/habit.validator';
import { authenticate } from '../../../middlewares/auth';

const router = Router();

const habitRepository = new PrismaHabitRepository();
const habitController = new HabitController(
  new GetAllHabitsUseCase(habitRepository),
  new GetHabitByIdUseCase(habitRepository),
  new CreateHabitUseCase(habitRepository),
  new UpdateHabitUseCase(habitRepository),
  new DeleteHabitUseCase(habitRepository),
  new GetHabitLogsUseCase(habitRepository),
  new LogHabitUseCase(habitRepository),
);

router.get('/', authenticate, habitController.getAll);
router.get('/:id', authenticate, habitController.getOne);
router.post('/', authenticate, validateCreateHabit, habitController.create);
router.patch('/:id', authenticate, validateUpdateHabit, habitController.update);
router.delete('/:id', authenticate, habitController.remove);
router.get('/:id/logs', authenticate, habitController.getLogs);
router.post('/:id/logs', authenticate, validateLogHabit, habitController.log);

export default router;
