import { prisma } from '../config/database';
import { NotificationType } from '@prisma/client';
import { getSocketIO } from '../websocket/socket';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string;
  taskId?: string;
  activityLogId?: string;
}

export class NotificationService {
  async create(input: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        projectId: input.projectId,
        taskId: input.taskId,
        activityLogId: input.activityLogId,
      },
    });

    // Broadcast to user's private room
    try {
      const io = getSocketIO();
      io.to(`user:${input.userId}`).emit('notification.created', notification);

      // Update unread count
      const unreadCount = await this.getUnreadCount(input.userId);
      io.to(`user:${input.userId}`).emit('notification.unread_count_updated', { count: unreadCount });
    } catch {
      // Socket.IO may not be initialized yet
    }

    return notification;
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { notifications, total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}

export const notificationService = new NotificationService();
