import { prisma } from '../config/database';
import { Prisma, Role } from '@prisma/client';
import { NotFoundError, ForbiddenError, BadRequestError } from '../errors/AppError';
import { AuthenticatedUser, TaskFilters } from '../types';
import { paginationMeta } from '../utils/tokens';
import { activityService } from './activity.service';
import { notificationService } from './notification.service';
import { z } from 'zod';
import { createTaskSchema, updateTaskSchema } from '../validators/schemas';

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

const taskInclude = {
  project: { select: { id: true, name: true, ownerId: true } },
  assignedDeveloper: { select: { id: true, name: true, email: true, avatarUrl: true } },
  createdBy: { select: { id: true, name: true, avatarUrl: true } },
} as const;

export class TaskService {
  async findAll(user: AuthenticatedUser, filters: TaskFilters) {
    const where = await this.buildWhereClause(user, filters);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'desc';

    const orderBy: Prisma.TaskOrderByWithRelationInput[] = [];
    if (sortBy === 'priority') {
      // Custom priority ordering: CRITICAL > HIGH > MEDIUM > LOW
      orderBy.push({ priority: sortOrder });
    } else {
      orderBy.push({ [sortBy]: sortOrder } as Prisma.TaskOrderByWithRelationInput);
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({ where, include: taskInclude, skip, take: limit, orderBy }),
      prisma.task.count({ where }),
    ]);

    return { items: tasks, meta: paginationMeta(page, limit, total) };
  }

  async findById(id: string, user: AuthenticatedUser) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        ...taskInclude,
        comments: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' },
        },
        activityLogs: {
          include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!task) throw new NotFoundError('Task');
    await this.assertTaskAccess(task, user);
    return task;
  }

  async create(data: CreateTaskInput, actor: AuthenticatedUser) {
    // PM can only create tasks in their own projects
    if (actor.role === Role.PROJECT_MANAGER) {
      const project = await prisma.project.findUnique({ where: { id: data.projectId } });
      if (!project || project.ownerId !== actor.id) {
        throw new ForbiddenError('You can only create tasks in your own projects');
      }
    }

    // Verify assignee is a developer if provided
    if (data.assignedDeveloperId) {
      const dev = await prisma.user.findUnique({ where: { id: data.assignedDeveloperId } });
      if (!dev || dev.role !== Role.DEVELOPER) {
        throw new BadRequestError('Assigned user must be an active developer');
      }
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        assignedDeveloperId: data.assignedDeveloperId,
        createdById: actor.id,
        status: data.status ?? 'TODO',
        priority: data.priority ?? 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: taskInclude,
    });

    await activityService.log({
      actorId: actor.id,
      projectId: task.projectId,
      taskId: task.id,
      eventType: 'task.created',
      message: `${actor.name} created task "${task.title}"`,
      metadata: { taskId: task.id, projectId: task.projectId },
    });

    if (task.assignedDeveloperId) {
      await notificationService.create({
        userId: task.assignedDeveloperId,
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned',
        message: `You have been assigned to "${task.title}"`,
        taskId: task.id,
        projectId: task.projectId,
      });
    }

    return task;
  }

  async update(id: string, data: UpdateTaskInput, actor: AuthenticatedUser) {
    const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (!task) throw new NotFoundError('Task');
    await this.assertTaskAccess(task, actor, true);

    const previousAssignee = task.assignedDeveloperId;

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate,
      },
      include: taskInclude,
    });

    await activityService.log({
      actorId: actor.id,
      projectId: task.projectId,
      taskId: id,
      eventType: 'task.updated',
      message: `${actor.name} updated task "${updated.title}"`,
      metadata: { changes: data },
    });

    // New assignment notification
    if (data.assignedDeveloperId && data.assignedDeveloperId !== previousAssignee) {
      await notificationService.create({
        userId: data.assignedDeveloperId,
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned',
        message: `You have been assigned to "${updated.title}"`,
        taskId: id,
        projectId: task.projectId,
      });
    }

    return updated;
  }

  async updateStatus(id: string, status: string, actor: AuthenticatedUser) {
    const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (!task) throw new NotFoundError('Task');
    await this.assertTaskAccess(task, actor);

    const isCompleting = status === 'DONE' && task.status !== 'DONE';

    const updated = await prisma.task.update({
      where: { id },
      data: {
        status: status as any,
        completedAt: isCompleting ? new Date() : (status !== 'DONE' ? null : task.completedAt),
        isOverdue: status === 'DONE' ? false : task.isOverdue,
      },
      include: taskInclude,
    });

    await activityService.log({
      actorId: actor.id,
      projectId: task.projectId,
      taskId: id,
      eventType: 'task.status_changed',
      message: `${actor.name} changed "${task.title}" status to ${status.replace('_', ' ')}`,
      metadata: { from: task.status, to: status },
    });

    if (isCompleting && task.assignedDeveloperId) {
      await notificationService.create({
        userId: task.project.ownerId,
        type: 'TASK_COMPLETED',
        title: 'Task Completed',
        message: `"${task.title}" has been marked as Done`,
        taskId: id,
        projectId: task.projectId,
      });
    }

    return updated;
  }

  async assign(id: string, assignedDeveloperId: string | null, actor: AuthenticatedUser) {
    const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (!task) throw new NotFoundError('Task');
    await this.assertTaskAccess(task, actor, true);

    if (assignedDeveloperId) {
      const dev = await prisma.user.findUnique({ where: { id: assignedDeveloperId } });
      if (!dev || dev.role !== Role.DEVELOPER) {
        throw new BadRequestError('Assigned user must be a developer');
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { assignedDeveloperId },
      include: taskInclude,
    });

    await activityService.log({
      actorId: actor.id,
      projectId: task.projectId,
      taskId: id,
      eventType: 'task.assigned',
      message: assignedDeveloperId
        ? `${actor.name} assigned "${task.title}" to ${updated.assignedDeveloper?.name}`
        : `${actor.name} unassigned "${task.title}"`,
      metadata: { assignedDeveloperId },
    });

    if (assignedDeveloperId) {
      await notificationService.create({
        userId: assignedDeveloperId,
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned',
        message: `You have been assigned to "${task.title}"`,
        taskId: id,
        projectId: task.projectId,
      });
    }

    return updated;
  }

  async delete(id: string, actor: AuthenticatedUser) {
    const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (!task) throw new NotFoundError('Task');
    await this.assertTaskAccess(task, actor, true);
    await prisma.task.delete({ where: { id } });
  }

  async getProjectTasks(projectId: string, user: AuthenticatedUser, filters: TaskFilters) {
    return this.findAll(user, { ...filters, projectId });
  }

  async addComment(taskId: string, content: string, actor: AuthenticatedUser) {
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
    if (!task) throw new NotFoundError('Task');
    await this.assertTaskAccess(task, actor);

    const comment = await prisma.taskComment.create({
      data: { taskId, userId: actor.id, content },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await activityService.log({
      actorId: actor.id,
      projectId: task.projectId,
      taskId,
      eventType: 'task.comment_added',
      message: `${actor.name} commented on "${task.title}"`,
      metadata: { commentId: comment.id },
    });

    return comment;
  }

  async getComments(taskId: string, user: AuthenticatedUser) {
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
    if (!task) throw new NotFoundError('Task');
    await this.assertTaskAccess(task, user);

    return prisma.taskComment.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async buildWhereClause(user: AuthenticatedUser, filters: TaskFilters): Promise<Prisma.TaskWhereInput> {
    const where: Prisma.TaskWhereInput = {};

    // Role-based scoping
    if (user.role === Role.DEVELOPER) {
      where.assignedDeveloperId = user.id;
    } else if (user.role === Role.PROJECT_MANAGER) {
      where.project = { ownerId: user.id };
    }

    // Filters
    if (filters.status) where.status = filters.status as any;
    if (filters.priority) where.priority = filters.priority as any;
    if (filters.projectId) {
      // Only apply if user has access to this project
      if (user.role !== Role.DEVELOPER) {
        where.projectId = filters.projectId;
      }
    }
    if (filters.assignedDeveloperId && user.role !== Role.DEVELOPER) {
      where.assignedDeveloperId = filters.assignedDeveloperId;
    }
    if (filters.overdue === true) where.isOverdue = true;
    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) where.dueDate.gte = new Date(filters.dueDateFrom);
      if (filters.dueDateTo) where.dueDate.lte = new Date(filters.dueDateTo);
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async assertTaskAccess(
    task: { assignedDeveloperId: string | null; project: { ownerId: string } },
    user: AuthenticatedUser,
    requirePMOrAdmin = false
  ) {
    if (user.role === Role.ADMIN) return;

    if (user.role === Role.PROJECT_MANAGER) {
      if (task.project.ownerId !== user.id) {
        throw new ForbiddenError('You do not have access to this task');
      }
      return;
    }

    // Developer
    if (requirePMOrAdmin) {
      throw new ForbiddenError('Only Project Managers or Admins can perform this action');
    }
    if (task.assignedDeveloperId !== user.id) {
      throw new ForbiddenError('You do not have access to this task');
    }
  }
}

export const taskService = new TaskService();
