import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { JwtPayload, SocketUser } from '../types';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { Role } from '@prisma/client';

let io: SocketIOServer;

// Map of userId -> Set of socketIds for presence tracking
const onlineUsers = new Map<string, Set<string>>();

export function initSocketIO(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.cors.frontendUrl,
      credentials: true,
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    },
  });

  // ─── Authentication middleware ───────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth['token'] as string |undefined ??
        (socket.handshake.headers.authorization?.split(' ')[1]);

      if (!token) return next(new Error('Authentication required'));

      const payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) return next(new Error('User not found or inactive'));

      (socket as any).user = { userId: user.id, role: user.role, socketId: socket.id };
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // ─── Connection handler ──────────────────────────────────
  io.on('connection', async (socket: Socket) => {
    const socketUser = (socket as any).user as SocketUser;
    const { userId, role } = socketUser;

    logger.info(`Socket connected: ${userId} (${role})`);

    // Always join user's private room
    await socket.join(`user:${userId}`);

    // Admin joins global feed
    if (role === Role.ADMIN) {
      await socket.join('global:activity');
    }

    // Track presence
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Broadcast presence if first connection
    if (onlineUsers.get(userId)!.size === 1) {
      io.emit('presence.user_online', { userId });
    }

    // ─── Client events ───────────────────────────────────
    socket.on('join:project', async (projectId: string) => {
      try {
        // Verify user is authorized to join this project room
        const authorized = await canJoinProjectRoom(userId, role, projectId);
        if (authorized) {
          await socket.join(`project:${projectId}`);
          socket.emit('room:joined', { room: `project:${projectId}` });
          logger.debug(`${userId} joined project:${projectId}`);
        } else {
          socket.emit('room:error', { message: 'Not authorized to join this project room' });
        }
      } catch (err) {
        socket.emit('room:error', { message: 'Error joining project room' });
      }
    });

    socket.on('leave:project', async (projectId: string) => {
      await socket.leave(`project:${projectId}`);
    });

    // ─── Disconnection ───────────────────────────────────
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${userId}`);

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('presence.user_offline', { userId });
        }
      }
    });
  });

  logger.info('Socket.IO initialized');
  return io;
}

export function getSocketIO(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export function getOnlineUsers(): string[] {
  return Array.from(onlineUsers.keys());
}

// ─── Authorization ─────────────────────────────────────────
async function canJoinProjectRoom(
  userId: string,
  role: Role,
  projectId: string
): Promise<boolean> {
  if (role === Role.ADMIN) return true;

  if (role === Role.PROJECT_MANAGER) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });
    return project?.ownerId === userId;
  }

  // Developer: must have a task assigned in this project
  const task = await prisma.task.findFirst({
    where: { projectId, assignedDeveloperId: userId },
    select: { id: true },
  });
  return !!task;
}
