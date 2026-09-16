import { z } from 'zod';
import { TaskStatus, TaskPriority, ProjectStatus, Role, ClientStatus } from '@prisma/client';

// ─────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  role: z.nativeEnum(Role).optional(),
});

// ─────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────
export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.nativeEnum(Role),
  avatarUrl: z.string().url().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  role: z.nativeEnum(Role).optional(),
});

// ─────────────────────────────────────────────────────
// CLIENTS
// ─────────────────────────────────────────────────────
export const createClientSchema = z.object({
  name: z.string().min(2).max(100),
  companyName: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  status: z.nativeEnum(ClientStatus).optional(),
});

export const updateClientSchema = createClientSchema.partial();

// ─────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────
export const createProjectSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  clientId: z.string().cuid(),
  ownerId: z.string().cuid(),
  status: z.nativeEnum(ProjectStatus).optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  clientId: z.string().cuid().optional(),
  ownerId: z.string().cuid().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  startDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

// ─────────────────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────────────────
export const createTaskSchema = z.object({
  title: z.string().min(2).max(300),
  description: z.string().max(5000).optional(),
  projectId: z.string().cuid(),
  assignedDeveloperId: z.string().cuid().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(300).optional(),
  description: z.string().max(5000).optional().nullable(),
  assignedDeveloperId: z.string().cuid().optional().nullable(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export const assignTaskSchema = z.object({
  assignedDeveloperId: z.string().cuid().nullable(),
});

// ─────────────────────────────────────────────────────
// QUERY PARAMS
// ─────────────────────────────────────────────────────
export const taskQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
  overdue: z.enum(['true', 'false']).optional(),
  projectId: z.string().cuid().optional(),
  assignedDeveloperId: z.string().cuid().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'status', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ─────────────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────────────
export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});
