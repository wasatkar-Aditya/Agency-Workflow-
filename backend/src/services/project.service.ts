import { prisma } from '../config/database';
import { ForbiddenError, NotFoundError } from '../errors/AppError';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../types';
import { z } from 'zod';
import { createProjectSchema, updateProjectSchema } from '../validators/schemas';
import { activityService } from './activity.service';

type CreateProjectInput = z.infer<typeof createProjectSchema>;
type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

const projectInclude = {
  client: { select: { id: true, name: true, companyName: true } },
  owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
  _count: { select: { tasks: true } },
  tasks: { select: { id: true, status: true } },
} as const;

export class ProjectService {
  async findAll(user: AuthenticatedUser) {
    const where = user.role === Role.ADMIN ? {} : { ownerId: user.id };
    return prisma.project.findMany({
      where,
      include: projectInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, user: AuthenticatedUser) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        ...projectInclude,
        tasks: {
          include: {
            assignedDeveloper: { select: { id: true, name: true, avatarUrl: true } },
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        },
      },
    });
    if (!project) throw new NotFoundError('Project');
    this.assertAccess(project, user);
    return project;
  }

  async create(data: CreateProjectInput, actor: AuthenticatedUser) {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        clientId: data.clientId,
        ownerId: data.ownerId,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: projectInclude,
    });

    await activityService.log({
      actorId: actor.id,
      projectId: project.id,
      eventType: 'project.created',
      message: `${actor.name} created project "${project.name}"`,
      metadata: { projectId: project.id },
    });

    return project;
  }

  async update(id: string, data: UpdateProjectInput, actor: AuthenticatedUser) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundError('Project');
    this.assertAccess(project, actor);

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : data.startDate,
        dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate,
      },
      include: projectInclude,
    });

    await activityService.log({
      actorId: actor.id,
      projectId: id,
      eventType: 'project.updated',
      message: `${actor.name} updated project "${updated.name}"`,
      metadata: { changes: data },
    });

    return updated;
  }

  async delete(id: string, actor: AuthenticatedUser) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundError('Project');
    // Only Admin can delete
    if (actor.role !== Role.ADMIN) throw new ForbiddenError('Only admins can delete projects');
    await prisma.project.delete({ where: { id } });
  }

  async getAnalytics(id: string, user: AuthenticatedUser) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundError('Project');
    this.assertAccess(project, user);

    const tasks = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId: id },
      _count: { status: true },
    });

    const byPriority = await prisma.task.groupBy({
      by: ['priority'],
      where: { projectId: id },
      _count: { priority: true },
    });

    const overdueCount = await prisma.task.count({
      where: { projectId: id, isOverdue: true, status: { not: 'DONE' } },
    });

    const totalTasks = await prisma.task.count({ where: { projectId: id } });
    const doneTasks = await prisma.task.count({ where: { projectId: id, status: 'DONE' } });

    return {
      tasksByStatus: tasks,
      tasksByPriority: byPriority,
      overdueCount,
      totalTasks,
      doneTasks,
      progressPercentage: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    };
  }

  private assertAccess(project: { ownerId: string }, user: AuthenticatedUser) {
    if (user.role === Role.ADMIN) return;
    if (user.role === Role.PROJECT_MANAGER && project.ownerId !== user.id) {
      throw new ForbiddenError('You do not have access to this project');
    }
    if (user.role === Role.DEVELOPER) {
      throw new ForbiddenError('Developers cannot access project management');
    }
  }
}

export const projectService = new ProjectService();
