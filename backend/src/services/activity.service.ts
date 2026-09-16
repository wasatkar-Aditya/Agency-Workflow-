import { prisma } from '../config/database';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../types';
import { getSocketIO } from '../websocket/socket';

interface LogActivityInput {
  actorId: string;
  projectId?: string;
  taskId?: string;
  eventType: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export class ActivityService {
  async log(input: LogActivityInput) {
    const activity = await prisma.activityLog.create({
      data: {
        actorId: input.actorId,
        projectId: input.projectId,
        taskId: input.taskId,
        eventType: input.eventType,
        message: input.message,
        metadata: (input.metadata ?? {}) as object,
      },
      include: {
        actor: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });

    // Broadcast via Socket.IO
    try {
      const io = getSocketIO();
      // Emit to global admin room
      io.to('global:activity').emit('activity.created', activity);
      // Emit to project room if applicable
      if (input.projectId) {
        io.to(`project:${input.projectId}`).emit('activity.created', activity);
      }
    } catch {
      // Socket.IO may not be initialized yet (e.g., during seeding)
    }

    return activity;
  }

  async findAll(user: AuthenticatedUser, cursor?: string) {
    const where = this.buildWhereForUser(user);
    const take = 50;

    const activities = await prisma.activityLog.findMany({
      where,
      include: {
        actor: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    return activities;
  }

  async getMissedEvents(user: AuthenticatedUser, since: string) {
    const sinceDate = new Date(since);
    const where = this.buildWhereForUser(user);

    return prisma.activityLog.findMany({
      where: { ...where, createdAt: { gt: sinceDate } },
      include: {
        actor: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
  }

  private buildWhereForUser(user: AuthenticatedUser) {
    if (user.role === Role.ADMIN) return {};

    if (user.role === Role.PROJECT_MANAGER) {
      return { project: { ownerId: user.id } };
    }

    // Developer: only activity on their assigned tasks
    return {
      OR: [
        { task: { assignedDeveloperId: user.id } },
        { actorId: user.id },
      ],
    };
  }
}

export const activityService = new ActivityService();
