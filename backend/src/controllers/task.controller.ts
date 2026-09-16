import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  assignTaskSchema,
  taskQuerySchema,
  createCommentSchema,
} from '../validators/schemas';
import { successResponse } from '../utils/tokens';
import { TaskFilters } from '../types';

export class TaskController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = taskQuerySchema.parse(req.query);
      const filters: TaskFilters = {
        ...query,
        overdue: query.overdue === 'true' ? true : query.overdue === 'false' ? false : undefined,
      };
      const result = await taskService.findAll(req.user!, filters);
      res.json(successResponse(result));
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(successResponse(await taskService.findById(req.params['id']!, req.user!)));
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createTaskSchema.parse(req.body);
      const task = await taskService.create(body, req.user!);
      res.status(201).json(successResponse(task, 'Task created'));
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = updateTaskSchema.parse(req.body);
      res.json(successResponse(await taskService.update(req.params['id']!, body, req.user!), 'Task updated'));
    } catch (err) { next(err); }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = updateTaskStatusSchema.parse(req.body);
      res.json(successResponse(await taskService.updateStatus(req.params['id']!, status, req.user!), 'Status updated'));
    } catch (err) { next(err); }
  }

  async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { assignedDeveloperId } = assignTaskSchema.parse(req.body);
      res.json(successResponse(await taskService.assign(req.params['id']!, assignedDeveloperId, req.user!), 'Task assigned'));
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await taskService.delete(req.params['id']!, req.user!);
      res.json(successResponse(null, 'Task deleted'));
    } catch (err) { next(err); }
  }

  async addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content } = createCommentSchema.parse(req.body);
      const comment = await taskService.addComment(req.params['id']!, content, req.user!);
      res.status(201).json(successResponse(comment, 'Comment added'));
    } catch (err) { next(err); }
  }

  async getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(successResponse(await taskService.getComments(req.params['id']!, req.user!)));
    } catch (err) { next(err); }
  }

  async getProjectTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = taskQuerySchema.parse(req.query);
      const filters: TaskFilters = {
        ...query,
        overdue: query.overdue === 'true' ? true : undefined,
      };
      const result = await taskService.getProjectTasks(req.params['id']!, req.user!, filters);
      res.json(successResponse(result));
    } catch (err) { next(err); }
  }
}

export const taskController = new TaskController();
