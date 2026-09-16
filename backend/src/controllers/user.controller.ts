import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { createUserSchema, updateUserSchema } from '../validators/schemas';
import { successResponse } from '../utils/tokens';

export class UserController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.findAll();
      res.json(successResponse(users));
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.findById(req.params['id']!);
      res.json(successResponse(user));
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createUserSchema.parse(req.body);
      const user = await userService.create(body);
      res.status(201).json(successResponse(user, 'User created successfully'));
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = updateUserSchema.parse(req.body);
      const user = await userService.update(req.params['id']!, body);
      res.json(successResponse(user, 'User updated successfully'));
    } catch (err) { next(err); }
  }

  async setStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'isActive must be a boolean' } });
        return;
      }
      const user = await userService.setStatus(req.params['id']!, isActive);
      res.json(successResponse(user, `User ${isActive ? 'activated' : 'deactivated'} successfully`));
    } catch (err) { next(err); }
  }

  async getDevelopers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const devs = await userService.getDevelopers();
      res.json(successResponse(devs));
    } catch (err) { next(err); }
  }
}

export const userController = new UserController();
