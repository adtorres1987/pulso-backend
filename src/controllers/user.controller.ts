import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/response';

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
});

export const userController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.findAll();
      sendSuccess(res, users);
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSchema.parse(req.body);
      const user = await userService.create(data);
      sendSuccess(res, user, 201, 'User created');
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateSchema.parse(req.body);
      const user = await userService.update(req.params.id, data);
      sendSuccess(res, user, 200, 'User updated');
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.remove(req.params.id);
      sendSuccess(res, null, 204);
    } catch (err) {
      next(err);
    }
  },
};
