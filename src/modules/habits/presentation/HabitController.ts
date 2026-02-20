import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../../types';
import { GetAllHabitsUseCase } from '../application/use-cases/GetAllHabitsUseCase';
import { GetHabitByIdUseCase } from '../application/use-cases/GetHabitByIdUseCase';
import { CreateHabitUseCase } from '../application/use-cases/CreateHabitUseCase';
import { UpdateHabitUseCase } from '../application/use-cases/UpdateHabitUseCase';
import { DeleteHabitUseCase } from '../application/use-cases/DeleteHabitUseCase';
import { GetHabitLogsUseCase } from '../application/use-cases/GetHabitLogsUseCase';
import { LogHabitUseCase } from '../application/use-cases/LogHabitUseCase';
import { sendSuccess } from '../../../utils/response';

export class HabitController {
  constructor(
    private readonly getAllHabits: GetAllHabitsUseCase,
    private readonly getHabitById: GetHabitByIdUseCase,
    private readonly createHabit: CreateHabitUseCase,
    private readonly updateHabit: UpdateHabitUseCase,
    private readonly deleteHabit: DeleteHabitUseCase,
    private readonly getHabitLogs: GetHabitLogsUseCase,
    private readonly logHabit: LogHabitUseCase,
  ) {}

  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activeOnly = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
      const habits = await this.getAllHabits.execute(req.userId!, activeOnly);
      sendSuccess(res, habits);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const habit = await this.getHabitById.execute(req.params.id, req.userId!);
      sendSuccess(res, habit);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const habit = await this.createHabit.execute(req.userId!, req.body);
      sendSuccess(res, habit, 201, 'Habit created');
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const habit = await this.updateHabit.execute(req.params.id, req.userId!, req.body);
      sendSuccess(res, habit, 200, 'Habit updated');
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteHabit.execute(req.params.id, req.userId!);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  };

  getLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const logs = await this.getHabitLogs.execute(req.params.id, req.userId!);
      sendSuccess(res, logs);
    } catch (err) {
      next(err);
    }
  };

  log = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const log = await this.logHabit.execute(req.params.id, req.userId!, req.body);
      sendSuccess(res, log, 200, 'Habit logged');
    } catch (err) {
      next(err);
    }
  };
}
