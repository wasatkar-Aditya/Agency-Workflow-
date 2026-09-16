export type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER"
export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED"
export type ClientStatus = "ACTIVE" | "INACTIVE"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatarUrl?: string | null
  isActive?: boolean
  createdAt?: string
}

export interface Client {
  id: string
  name: string
  companyName: string
  email: string
  phone?: string | null
  status: ClientStatus
  createdAt?: string
  _count?: { projects: number }
  projects?: { id: string; name: string; status: ProjectStatus }[]
}

export interface Project {
  id: string
  name: string
  description?: string | null
  clientId: string
  ownerId: string
  status: ProjectStatus
  startDate?: string | null
  dueDate?: string | null
  client?: { id: string; name: string; companyName: string }
  owner?: { id: string; name: string; email: string; avatarUrl?: string | null }
  _count?: { tasks: number }
  tasks?: { id: string; status: TaskStatus; title?: string; priority?: TaskPriority; dueDate?: string | null; isOverdue?: boolean; assignedDeveloper?: { id: string; name: string; avatarUrl?: string | null } | null }[]
}

export interface Task {
  id: string
  title: string
  description?: string | null
  projectId: string
  assignedDeveloperId?: string | null
  createdById: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string | null
  completedAt?: string | null
  isOverdue: boolean
  project: { id: string; name: string; ownerId: string }
  assignedDeveloper: { id: string; name: string; email?: string; avatarUrl?: string | null } | null
  createdBy?: { id: string; name: string; email?: string; avatarUrl?: string | null } | null
  comments?: TaskComment[]
  activityLogs?: ActivityLog[]
}

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
  user?: { id: string; name: string; email?: string; avatarUrl?: string | null } | null
}

export interface ActivityLog {
  id: string
  actorId: string
  projectId?: string | null
  taskId?: string | null
  eventType: string
  message: string
  createdAt: string
  metadata?: Record<string, unknown> | null
  actor?: { id: string; name: string; email?: string; avatarUrl?: string | null } | null
  project?: { id: string; name: string } | null
  task?: { id: string; title: string } | null
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  projectId?: string | null
  taskId?: string | null
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
}

export interface TaskFilters {
  status?: TaskStatus | ""
  priority?: TaskPriority | ""
  overdue?: boolean
  projectId?: string
  assignedDeveloperId?: string
  search?: string
  page?: number
  limit?: number
}

export interface AdminDashboardStats {
  totalProjects: number
  activeProjects: number
  totalTasks: number
  totalClients: number
  overdueTasks: number
  onlineUsers: number
  tasksByStatus: { status: TaskStatus; _count: { status: number } }[]
  tasksByPriority: { priority: TaskPriority; _count: { priority: number } }[]
}

export interface ProjectAnalytics {
  tasksByStatus: { status: TaskStatus; _count: { status: number } }[]
  tasksByPriority: { priority: TaskPriority; _count: { priority: number } }[]
  overdueCount: number
  totalTasks: number
  doneTasks: number
  progressPercentage: number
}

export function getErrorMessage(err: unknown, fallback = "Something went wrong") {
  const axiosErr = err as { response?: { data?: { error?: { message?: string } } } }
  return axiosErr.response?.data?.error?.message || fallback
}
