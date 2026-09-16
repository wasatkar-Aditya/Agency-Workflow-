import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { JwtPayload, AuthenticatedUser } from '../types';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { prisma } from '../config/database';
import { Role } from '@prisma/client';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticateUser(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedError('Authentication token required');

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Access token expired');
      }
      throw new UnauthorizedError('Invalid access token');
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, isActive: true },
    });

    if (!user) throw new UnauthorizedError('User not found');
    if (!user.isActive) throw new ForbiddenError('Account is deactivated');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles: Role[]) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    if (!_req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(_req.user.role)) {
      next(new ForbiddenError(`This action requires one of the following roles: ${roles.join(', ')}`));
      return;
    }
    next();
  };
}

export const requireAdmin = requireRole(Role.ADMIN);
export const requireProjectManager = requireRole(Role.PROJECT_MANAGER);
export const requireAdminOrPM = requireRole(Role.ADMIN, Role.PROJECT_MANAGER);

export async function requireProjectOwnership(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    // Admin bypasses ownership check
    if (user.role === Role.ADMIN) { next(); return; }

    const projectId = req.params['id'] ?? req.params['projectId'] ?? req.body?.projectId;
    if (!projectId) { next(new ForbiddenError('Project ID required')); return; }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });
    if (!project) { next(new ForbiddenError('Project not found')); return; }
    if (project.ownerId !== user.id) {
      next(new ForbiddenError('You do not own this project'));
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireTaskAccess(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const taskId = req.params['id'];

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { ownerId: true } } },
    });

    if (!task) { next(new ForbiddenError('Task not found')); return; }

    if (user.role === Role.ADMIN) { next(); return; }

    if (user.role === Role.PROJECT_MANAGER) {
      if (task.project.ownerId !== user.id) {
        next(new ForbiddenError('You do not have access to this task'));
        return;
      }
      next(); return;
    }

    // Developer: must be the assignee
    if (task.assignedDeveloperId !== user.id) {
      next(new ForbiddenError('You do not have access to this task'));
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}
