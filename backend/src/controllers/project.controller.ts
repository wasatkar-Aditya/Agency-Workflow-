import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { createProjectSchema, updateProjectSchema, paginationSchema } from '../validators/schemas';
import { successResponse } from '../utils/tokens';
import { activityService } from '../services/activity.service';

export class ProjectController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(successResponse(await projectService.findAll(req.user!)));
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(successResponse(await projectService.findById(req.params['id']!, req.user!)));
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createProjectSchema.parse(req.body);
      const project = await projectService.create(body, req.user!);
      res.status(201).json(successResponse(project, 'Project created'));
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = updateProjectSchema.parse(req.body);
      res.json(successResponse(await projectService.update(req.params['id']!, body, req.user!), 'Project updated'));
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await projectService.delete(req.params['id']!, req.user!);
      res.json(successResponse(null, 'Project deleted'));
    } catch (err) { next(err); }
  }

  async getActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cursor } = req.query;
      const activities = await activityService.findAll(req.user!, cursor as string | undefined);
      res.json(successResponse(activities));
    } catch (err) { next(err); }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(successResponse(await projectService.getAnalytics(req.params['id']!, req.user!)));
    } catch (err) { next(err); }
  }
}

export const projectController = new ProjectController();
