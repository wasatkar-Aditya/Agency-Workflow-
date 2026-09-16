import { prisma } from '../config/database';
import { hashPassword } from '../utils/tokens';
import { ConflictError, NotFoundError } from '../errors/AppError';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { createUserSchema, updateUserSchema } from '../validators/schemas';

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

const userSelect = {
  id: true, name: true, email: true, role: true,
  avatarUrl: true, isActive: true, createdAt: true, updatedAt: true,
} as const;

export class UserService {
  async findAll() {
    return prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...userSelect,
        assignedTasks: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            isOverdue: true,
            project: { select: { id: true, name: true } },
          },
        },
        ownedProjects: {
          take: 10,
          select: { id: true, name: true, status: true, dueDate: true },
        },
        _count: {
          select: {
            assignedTasks: true,
            ownedProjects: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async create(data: CreateUserInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('A user with this email already exists');

    const passwordHash = await hashPassword(data.password);
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        avatarUrl: data.avatarUrl,
      },
      select: userSelect,
    });
  }

  async update(id: string, data: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User');

    if (data.email && data.email !== user.email) {
      const conflict = await prisma.user.findUnique({ where: { email: data.email } });
      if (conflict) throw new ConflictError('Email already in use');
    }

    return prisma.user.update({ where: { id }, data, select: userSelect });
  }

  async setStatus(id: string, isActive: boolean) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User');
    return prisma.user.update({ where: { id }, data: { isActive }, select: userSelect });
  }

  async getDevelopers() {
    return prisma.user.findMany({
      where: { role: Role.DEVELOPER, isActive: true },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
  }
}

export const userService = new UserService();
