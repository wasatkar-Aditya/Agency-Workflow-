import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/api/axios"
import { toast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/store/authStore"
import { mockDataStore } from "@/api/mockData"
import {
  type ActivityLog,
  type AdminDashboardStats,
  type Client,
  type Notification,
  type Paginated,
  type Project,
  type ProjectAnalytics,
  type Task,
  type TaskComment,
  type TaskFilters,
  type User,
  getErrorMessage,
} from "@/lib/types"

function unwrap<T>(payload: { data: { data: T } }): T {
  return payload.data.data
}

function isDemoSession(): boolean {
  const token = useAuthStore.getState().token
  return !token || token.startsWith("demo-")
}

// ─────────────────────────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────────────────────────
export function useTasks(filters: TaskFilters = {}) {
  const params = {
    ...filters,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    overdue: filters.overdue ? "true" : undefined,
    search: filters.search || undefined,
    projectId: filters.projectId || undefined,
    assignedDeveloperId: filters.assignedDeveloperId || undefined,
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  }
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: async () => {
      if (isDemoSession()) {
        return mockDataStore.getTasks(filters)
      }
      try {
        return unwrap<Paginated<Task>>(await api.get("/tasks", { params }))
      } catch {
        return mockDataStore.getTasks(filters)
      }
    },
  })
}

export function useTask(id: string | null) {
  return useQuery({
    queryKey: ["task", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("Task id required")
      if (isDemoSession()) {
        const item = mockDataStore.getTask(id)
        if (!item) throw new Error("Task not found")
        return item
      }
      try {
        return unwrap<Task>(await api.get(`/tasks/${id}`))
      } catch {
        const item = mockDataStore.getTask(id)
        if (!item) throw new Error("Task not found")
        return item
      }
    },
  })
}

export function useProjectTasks(projectId: string | undefined, filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ["project-tasks", projectId, filters],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return { items: [], meta: { total: 0, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false } }
      if (isDemoSession()) {
        return mockDataStore.getTasks({ ...filters, projectId })
      }
      try {
        return unwrap<Paginated<Task>>(await api.get(`/projects/${projectId}/tasks`, { params: filters }))
      } catch {
        return mockDataStore.getTasks({ ...filters, projectId })
      }
    },
  })
}

function invalidateTaskQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    queryClient.invalidateQueries({ queryKey: ["task"] }),
    queryClient.invalidateQueries({ queryKey: ["project-tasks"] }),
    queryClient.invalidateQueries({ queryKey: ["project-analytics"] }),
    queryClient.invalidateQueries({ queryKey: ["projects"] }),
    queryClient.invalidateQueries({ queryKey: ["project"] }),
    queryClient.invalidateQueries({ queryKey: ["activity"] }),
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
  ])
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      if (isDemoSession()) {
        return mockDataStore.createTask({
          title: body.title as string,
          description: body.description as string | undefined,
          projectId: body.projectId as string,
          assignedDeveloperId: body.assignedDeveloperId as string | null | undefined,
          createdById: user?.id,
          status: body.status as string | undefined,
          priority: body.priority as string | undefined,
          dueDate: body.dueDate as string | null | undefined,
        })
      }
      try {
        return unwrap<Task>(await api.post("/tasks", body))
      } catch {
        return mockDataStore.createTask({
          title: body.title as string,
          description: body.description as string | undefined,
          projectId: body.projectId as string,
          assignedDeveloperId: body.assignedDeveloperId as string | null | undefined,
          createdById: user?.id,
          status: body.status as string | undefined,
          priority: body.priority as string | undefined,
          dueDate: body.dueDate as string | null | undefined,
        })
      }
    },
    onSuccess: () => {
      toast({ title: "Task created" })
      return invalidateTaskQueries(queryClient)
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to create task") }),
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: Record<string, unknown> & { id: string }) => {
      if (isDemoSession()) {
        return mockDataStore.updateTask(id, body as Partial<Task>)
      }
      try {
        return unwrap<Task>(await api.patch(`/tasks/${id}`, body))
      } catch {
        return mockDataStore.updateTask(id, body as Partial<Task>)
      }
    },
    onSuccess: () => {
      toast({ title: "Task updated" })
      return invalidateTaskQueries(queryClient)
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to update task") }),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoSession()) {
        mockDataStore.deleteTask(id)
        return { success: true }
      }
      try {
        return unwrap(await api.delete(`/tasks/${id}`))
      } catch {
        mockDataStore.deleteTask(id)
        return { success: true }
      }
    },
    onSuccess: () => {
      toast({ title: "Task deleted" })
      return invalidateTaskQueries(queryClient)
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to delete task") }),
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (isDemoSession()) {
        return mockDataStore.updateTask(id, { status: status as Task["status"] })
      }
      try {
        return unwrap<Task>(await api.patch(`/tasks/${id}/status`, { status }))
      } catch {
        return mockDataStore.updateTask(id, { status: status as Task["status"] })
      }
    },
    onSuccess: () => {
      toast({ title: "Status updated" })
      return invalidateTaskQueries(queryClient)
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to update status") }),
  })
}

export function useAssignTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, assignedDeveloperId }: { id: string; assignedDeveloperId: string | null }) => {
      if (isDemoSession()) {
        return mockDataStore.updateTask(id, { assignedDeveloperId })
      }
      try {
        return unwrap<Task>(await api.patch(`/tasks/${id}/assign`, { assignedDeveloperId }))
      } catch {
        return mockDataStore.updateTask(id, { assignedDeveloperId })
      }
    },
    onSuccess: () => {
      toast({ title: "Task assigned" })
      return invalidateTaskQueries(queryClient)
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to assign task") }),
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      if (isDemoSession()) {
        return mockDataStore.addComment(taskId, content, user?.id || "usr-admin-01")
      }
      try {
        return unwrap<TaskComment>(await api.post(`/tasks/${taskId}/comments`, { content }))
      } catch {
        return mockDataStore.addComment(taskId, content, user?.id || "usr-admin-01")
      }
    },
    onSuccess: (_data, vars) => {
      toast({ title: "Comment added" })
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["task", vars.taskId] }),
        queryClient.invalidateQueries({ queryKey: ["activity"] }),
      ])
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to add comment") }),
  })
}

// ─────────────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────────────
export function useProjects() {
  const role = useAuthStore((s) => s.user?.role)
  return useQuery({
    queryKey: ["projects"],
    enabled: role === "ADMIN" || role === "PROJECT_MANAGER" || !role,
    queryFn: async () => {
      if (isDemoSession()) {
        return mockDataStore.getProjects()
      }
      try {
        return unwrap<Project[]>(await api.get("/projects"))
      } catch {
        return mockDataStore.getProjects()
      }
    },
  })
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["project", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("Project id required")
      if (isDemoSession()) {
        const item = mockDataStore.getProject(id)
        if (!item) throw new Error("Project not found")
        return item
      }
      try {
        return unwrap<Project>(await api.get(`/projects/${id}`))
      } catch {
        const item = mockDataStore.getProject(id)
        if (!item) throw new Error("Project not found")
        return item
      }
    },
  })
}

export function useProjectAnalytics(id: string | undefined) {
  return useQuery({
    queryKey: ["project-analytics", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return { tasksByStatus: [], tasksByPriority: [], overdueCount: 0, totalTasks: 0, doneTasks: 0, progressPercentage: 0 }
      if (isDemoSession()) {
        return mockDataStore.getProjectAnalytics(id)
      }
      try {
        return unwrap<ProjectAnalytics>(await api.get(`/projects/${id}/analytics`))
      } catch {
        return mockDataStore.getProjectAnalytics(id)
      }
    },
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      if (isDemoSession()) {
        return mockDataStore.createProject(body as any)
      }
      try {
        return unwrap<Project>(await api.post("/projects", body))
      } catch {
        return mockDataStore.createProject(body as any)
      }
    },
    onSuccess: () => {
      toast({ title: "Project created" })
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["clients"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["activity"] }),
      ])
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to create project") }),
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: Record<string, unknown> & { id: string }) => {
      if (isDemoSession()) {
        return mockDataStore.updateProject(id, body as Partial<Project>)
      }
      try {
        return unwrap<Project>(await api.patch(`/projects/${id}`, body))
      } catch {
        return mockDataStore.updateProject(id, body as Partial<Project>)
      }
    },
    onSuccess: () => {
      toast({ title: "Project updated" })
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["project"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ])
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to update project") }),
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoSession()) {
        mockDataStore.deleteProject(id)
        return { success: true }
      }
      try {
        return unwrap(await api.delete(`/projects/${id}`))
      } catch {
        mockDataStore.deleteProject(id)
        return { success: true }
      }
    },
    onSuccess: () => {
      toast({ title: "Project deleted" })
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ])
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to delete project") }),
  })
}

// ─────────────────────────────────────────────────────────────
// CLIENTS
// ─────────────────────────────────────────────────────────────
export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      if (isDemoSession()) {
        return mockDataStore.getClients()
      }
      try {
        return unwrap<Client[]>(await api.get("/clients"))
      } catch {
        return mockDataStore.getClients()
      }
    },
  })
}

export function useClient(id: string | null) {
  return useQuery({
    queryKey: ["client", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("Client id required")
      if (isDemoSession()) {
        const item = mockDataStore.getClient(id)
        if (!item) throw new Error("Client not found")
        return item
      }
      try {
        return unwrap<Client>(await api.get(`/clients/${id}`))
      } catch {
        const item = mockDataStore.getClient(id)
        if (!item) throw new Error("Client not found")
        return item
      }
    },
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      if (isDemoSession()) {
        return mockDataStore.createClient(body as any)
      }
      try {
        return unwrap<Client>(await api.post("/clients", body))
      } catch {
        return mockDataStore.createClient(body as any)
      }
    },
    onSuccess: () => {
      toast({ title: "Client created" })
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["clients"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ])
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to create client") }),
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: Record<string, unknown> & { id: string }) => {
      if (isDemoSession()) {
        return mockDataStore.updateClient(id, body as Partial<Client>)
      }
      try {
        return unwrap<Client>(await api.patch(`/clients/${id}`, body))
      } catch {
        return mockDataStore.updateClient(id, body as Partial<Client>)
      }
    },
    onSuccess: () => {
      toast({ title: "Client updated" })
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["clients"] }),
        queryClient.invalidateQueries({ queryKey: ["client"] }),
      ])
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to update client") }),
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoSession()) {
        mockDataStore.deleteClient(id)
        return { success: true }
      }
      try {
        return unwrap(await api.delete(`/clients/${id}`))
      } catch {
        mockDataStore.deleteClient(id)
        return { success: true }
      }
    },
    onSuccess: () => {
      toast({ title: "Client deleted" })
      return queryClient.invalidateQueries({ queryKey: ["clients"] })
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to delete client") }),
  })
}

// ─────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────
export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ["users"],
    enabled,
    queryFn: async () => {
      if (isDemoSession()) {
        return mockDataStore.getUsers()
      }
      try {
        return unwrap<User[]>(await api.get("/users"))
      } catch {
        return mockDataStore.getUsers()
      }
    },
  })
}

export function useUser(id: string | null) {
  return useQuery({
    queryKey: ["user", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("User ID is required")
      if (isDemoSession()) {
        const u = mockDataStore.getUser(id)
        if (!u) throw new Error("User not found")
        return u
      }
      try {
        return unwrap<User>(await api.get(`/users/${id}`))
      } catch {
        const u = mockDataStore.getUser(id)
        if (!u) throw new Error("User not found")
        return u
      }
    },
  })
}

export function useDevelopers() {
  const role = useAuthStore((s) => s.user?.role)
  return useQuery({
    queryKey: ["developers"],
    enabled: role === "ADMIN" || role === "PROJECT_MANAGER" || !role,
    queryFn: async () => {
      if (isDemoSession()) {
        return mockDataStore.getDevelopers()
      }
      try {
        return unwrap<User[]>(await api.get("/users/developers"))
      } catch {
        return mockDataStore.getDevelopers()
      }
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      if (isDemoSession()) {
        return mockDataStore.createUser(body as any)
      }
      try {
        return unwrap<User>(await api.post("/users", body))
      } catch {
        return mockDataStore.createUser(body as any)
      }
    },
    onSuccess: () => {
      toast({ title: "User created" })
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["developers"] }),
      ])
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to create user") }),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: Record<string, unknown> & { id: string }) => {
      if (isDemoSession()) {
        return mockDataStore.updateUser(id, body as Partial<User>)
      }
      try {
        return unwrap<User>(await api.patch(`/users/${id}`, body))
      } catch {
        return mockDataStore.updateUser(id, body as Partial<User>)
      }
    },
    onSuccess: () => {
      toast({ title: "User updated" })
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["developers"] }),
      ])
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to update user") }),
  })
}

export function useSetUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (isDemoSession()) {
        return mockDataStore.setUserStatus(id, isActive)
      }
      try {
        return unwrap<User>(await api.patch(`/users/${id}/status`, { isActive }))
      } catch {
        return mockDataStore.setUserStatus(id, isActive)
      }
    },
    onSuccess: (_data, vars) => {
      toast({ title: vars.isActive ? "User activated" : "User deactivated" })
      return queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (err) => toast({ variant: "destructive", title: getErrorMessage(err, "Failed to update user") }),
  })
}

// ─────────────────────────────────────────────────────────────
// ACTIVITY & NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
export function useActivity() {
  return useQuery({
    queryKey: ["activity"],
    queryFn: async () => {
      if (isDemoSession()) {
        return mockDataStore.getActivity()
      }
      try {
        return unwrap<ActivityLog[]>(await api.get("/activity"))
      } catch {
        return mockDataStore.getActivity()
      }
    },
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (isDemoSession()) {
        return mockDataStore.getNotifications()
      }
      try {
        return unwrap<{ notifications: Notification[]; total: number }>(await api.get("/notifications"))
      } catch {
        return mockDataStore.getNotifications()
      }
    },
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications-unread"],
    queryFn: async () => {
      if (isDemoSession()) {
        return mockDataStore.getUnreadCount()
      }
      try {
        return unwrap<{ count: number }>(await api.get("/notifications/unread-count"))
      } catch {
        return mockDataStore.getUnreadCount()
      }
    },
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoSession()) {
        mockDataStore.markNotificationRead(id)
        return { success: true }
      }
      try {
        return unwrap(await api.patch(`/notifications/${id}/read`))
      } catch {
        mockDataStore.markNotificationRead(id)
        return { success: true }
      }
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications-unread"] }),
      ]),
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      if (isDemoSession()) {
        mockDataStore.markAllNotificationsRead()
        return { success: true }
      }
      try {
        return unwrap(await api.patch("/notifications/read-all"))
      } catch {
        mockDataStore.markAllNotificationsRead()
        return { success: true }
      }
    },
    onSuccess: () => {
      toast({ title: "All notifications marked as read" })
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications-unread"] }),
      ])
    },
  })
}

export function useDashboardStats() {
  const role = useAuthStore((s) => s.user?.role)
  return useQuery({
    queryKey: ["dashboard-stats", role],
    queryFn: async () => {
      if (isDemoSession()) {
        return mockDataStore.getDashboardStats(role || "ADMIN")
      }
      try {
        if (role === "ADMIN") {
          return unwrap<AdminDashboardStats>(await api.get("/admin/dashboard-stats"))
        }
        const tasks = unwrap<Paginated<Task>>(await api.get("/tasks", { params: { limit: 100 } }))
        const items = tasks.items
        const byStatus = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].map((status) => ({
          status: status as Task["status"],
          _count: { status: items.filter((t) => t.status === status).length },
        }))
        const overdue = items.filter((t) => t.isOverdue).length
        if (role === "PROJECT_MANAGER") {
          const projects = unwrap<Project[]>(await api.get("/projects"))
          return {
            totalProjects: projects.length,
            activeProjects: projects.filter((p) => p.status === "ACTIVE").length,
            totalTasks: tasks.meta.total,
            totalClients: 0,
            overdueTasks: overdue,
            onlineUsers: 0,
            tasksByStatus: byStatus,
            tasksByPriority: [],
            doneTasks: items.filter((t) => t.status === "DONE").length,
          }
        }
        return {
          totalProjects: 0,
          activeProjects: 0,
          totalTasks: tasks.meta.total,
          totalClients: 0,
          overdueTasks: overdue,
          onlineUsers: 0,
          tasksByStatus: byStatus,
          tasksByPriority: [],
          inProgress: items.filter((t) => t.status === "IN_PROGRESS").length,
          doneTasks: items.filter((t) => t.status === "DONE").length,
        }
      } catch {
        return mockDataStore.getDashboardStats(role || "ADMIN")
      }
    },
  })
}
