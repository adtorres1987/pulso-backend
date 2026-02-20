import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../../types';
import { GetAllSnapshotsUseCase } from '../application/use-cases/GetAllSnapshotsUseCase';
import { GetTodaySnapshotUseCase } from '../application/use-cases/GetTodaySnapshotUseCase';
import { CreateSnapshotUseCase } from '../application/use-cases/CreateSnapshotUseCase';
import { UpdateTodaySnapshotUseCase } from '../application/use-cases/UpdateTodaySnapshotUseCase';
import { sendSuccess } from '../../../utils/response';

export class SnapshotController {
  constructor(
    private readonly getAllSnapshots: GetAllSnapshotsUseCase,
    private readonly getTodaySnapshot: GetTodaySnapshotUseCase,
    private readonly createSnapshot: CreateSnapshotUseCase,
    private readonly updateTodaySnapshot: UpdateTodaySnapshotUseCase,
  ) {}

  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const snapshots = await this.getAllSnapshots.execute(req.userId!);
      sendSuccess(res, snapshots);
    } catch (err) {
      next(err);
    }
  };

  getToday = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const snapshot = await this.getTodaySnapshot.execute(req.userId!);
      sendSuccess(res, snapshot);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const snapshot = await this.createSnapshot.execute(req.userId!, req.body);
      sendSuccess(res, snapshot, 201, 'Snapshot created');
    } catch (err) {
      next(err);
    }
  };

  updateToday = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const snapshot = await this.updateTodaySnapshot.execute(req.userId!, req.body);
      sendSuccess(res, snapshot, 200, 'Snapshot updated');
    } catch (err) {
      next(err);
    }
  };
}
