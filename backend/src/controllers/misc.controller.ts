import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service';
import { notificationService } from '../services/notification.service';
import { successResponse } from '../utils/tokens';
import { paginationSchema } from '../validators/schemas';
import { triggerOverdueCheck } from '../jobs/overdue.job';
import { getOnlineUsers } from '../websocket/socket';
import { prisma } from '../config/database';

export class ActivityController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cursor } = req.query;
      const activities = await activityService.findAll(req.user!, cursor as string | undefined);
      res.json(successResponse(activities));
    } catch (err) { next(err); }
  }

  async getMissed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const since = req.query['since'] as string ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const events = await activityService.getMissedEvents(req.user!, since);
      res.json(successResponse(events));
    } catch (err) { next(err); }
  }
}

export class NotificationController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = paginationSchema.parse(req.query);
      const result = await notificationService.findAll(req.user!.id, page, limit);
      res.json(successResponse(result));
    } catch (err) { next(err); }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await notificationService.getUnreadCount(req.user!.id);
      res.json(successResponse({ count }));
    } catch (err) { next(err); }
  }

  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markRead(req.params['id']!, req.user!.id);
      res.json(successResponse(null, 'Notification marked as read'));
    } catch (err) { next(err); }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markAllRead(req.user!.id);
      res.json(successResponse(null, 'All notifications marked as read'));
    } catch (err) { next(err); }
  }
}

export class AdminController {
  async triggerOverdueJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await triggerOverdueCheck();
      res.json(successResponse(result, 'Overdue job triggered'));
    } catch (err) { next(err); }
  }

  async getOnlineUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userIds = getOnlineUsers();
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, role: true, avatarUrl: true },
      });
      res.json(successResponse(users));
    } catch (err) { next(err); }
  }

  async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalProjects, activeProjects, totalTasks, totalClients,
        tasksByStatus, tasksByPriority, overdueTasks
      ] = await Promise.all([
        prisma.project.count(),
        prisma.project.count({ where: { status: 'ACTIVE' } }),
        prisma.task.count(),
        prisma.client.count(),
        prisma.task.groupBy({ by: ['status'], _count: { status: true } }),
        prisma.task.groupBy({ by: ['priority'], _count: { priority: true } }),
        prisma.task.count({ where: { isOverdue: true, status: { not: 'DONE' } } }),
      ]);

      res.json(successResponse({
        totalProjects, activeProjects, totalTasks, totalClients,
        tasksByStatus, tasksByPriority, overdueTasks,
        onlineUsers: getOnlineUsers().length,
      }));
    } catch (err) { next(err); }
  }
}

export const activityController = new ActivityController();
export const notificationController = new NotificationController();
export const adminController = new AdminController();
