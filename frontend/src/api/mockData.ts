import type {
  ActivityLog,
  AdminDashboardStats,
  Client,
  Notification,
  Paginated,
  Project,
  ProjectAnalytics,
  Task,
  TaskComment,
  TaskFilters,
  User,
} from "@/lib/types"

const STORAGE_KEY = "agencyflow_mock_store_v2"

interface MockDatabase {
  users: User[]
  clients: Client[]
  projects: Project[]
  tasks: Task[]
  activityLogs: ActivityLog[]
  notifications: Notification[]
}

const initialUsers: User[] = [
  {
    id: "usr-admin-01",
    name: "Alex Admin",
    email: "admin@agencyflow.dev",
    role: "ADMIN",
    avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=AA&backgroundColor=4f46e5",
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "usr-pm-01",
    name: "Priya Sharma",
    email: "priya@agencyflow.dev",
    role: "PROJECT_MANAGER",
    avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=PS&backgroundColor=0ea5e9",
    isActive: true,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: "usr-pm-02",
    name: "Marco Rossi",
    email: "marco@agencyflow.dev",
    role: "PROJECT_MANAGER",
    avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=MR&backgroundColor=8b5cf6",
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "usr-dev-01",
    name: "Amit Patel",
    email: "amit@agencyflow.dev",
    role: "DEVELOPER",
    avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=AP&backgroundColor=10b981",
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "usr-dev-02",
    name: "Sarah Chen",
    email: "sarah@agencyflow.dev",
    role: "DEVELOPER",
    avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=SC&backgroundColor=f59e0b",
    isActive: true,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "usr-dev-03",
    name: "Rahul Verma",
    email: "rahul@agencyflow.dev",
    role: "DEVELOPER",
    avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=RV&backgroundColor=ef4444",
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
]

const initialClients: Client[] = [
  {
    id: "clt-01",
    name: "John Miller",
    companyName: "TechNova Solutions",
    email: "contact@technova.com",
    phone: "+1 (555) 234-5678",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    _count: { projects: 2 },
  },
  {
    id: "clt-02",
    name: "Elena Rostova",
    companyName: "Apex Retail Group",
    email: "elena@apexretail.io",
    phone: "+1 (555) 876-5432",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
    _count: { projects: 1 },
  },
  {
    id: "clt-03",
    name: "Marcus Vance",
    companyName: "Nexus Health Systems",
    email: "marcus@nexushealth.org",
    phone: "+1 (555) 432-1098",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    _count: { projects: 1 },
  },
  {
    id: "clt-04",
    name: "Samantha Wright",
    companyName: "Orbit Financial AI",
    email: "sam@orbitai.finance",
    phone: "+1 (555) 998-1122",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    _count: { projects: 1 },
  },
]

const initialProjects: Project[] = [
  {
    id: "prj-01",
    name: "Finora Mobile Banking v2.0",
    description: "Next-generation biometric auth, real-time ledger sync, and ACH transfer engine for iOS and Android.",
    clientId: "clt-04",
    ownerId: "usr-pm-01",
    status: "ACTIVE",
    startDate: new Date(Date.now() - 20 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    client: { id: "clt-04", name: "Samantha Wright", companyName: "Orbit Financial AI" },
    owner: { id: "usr-pm-01", name: "Priya Sharma", email: "priya@agencyflow.dev", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=PS&backgroundColor=0ea5e9" },
    _count: { tasks: 4 },
  },
  {
    id: "prj-02",
    name: "Khet Jivan AI Crop Diagnostic Engine",
    description: "Multi-spectral drone imagery processing pipeline using PyTorch & FastAPI microservices.",
    clientId: "clt-01",
    ownerId: "usr-admin-01",
    status: "ACTIVE",
    startDate: new Date(Date.now() - 15 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 45 * 86400000).toISOString(),
    client: { id: "clt-01", name: "John Miller", companyName: "TechNova Solutions" },
    owner: { id: "usr-admin-01", name: "Alex Admin", email: "admin@agencyflow.dev", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=AA&backgroundColor=4f46e5" },
    _count: { tasks: 3 },
  },
  {
    id: "prj-03",
    name: "Atlas CRM Enterprise Suite",
    description: "Custom sales funnel analytics, lead automation webhooks, and Zendesk API integration.",
    clientId: "clt-02",
    ownerId: "usr-pm-02",
    status: "PLANNING",
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    client: { id: "clt-02", name: "Elena Rostova", companyName: "Apex Retail Group" },
    owner: { id: "usr-pm-02", name: "Marco Rossi", email: "marco@agencyflow.dev", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=MR&backgroundColor=8b5cf6" },
    _count: { tasks: 2 },
  },
  {
    id: "prj-04",
    name: "Nova Commerce Multi-Vendor Portal",
    description: "Headless Shopify storefront with Next.js 15, Algolia instant search, and Stripe Connect.",
    clientId: "clt-03",
    ownerId: "usr-pm-01",
    status: "ON_HOLD",
    startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 20 * 86400000).toISOString(),
    client: { id: "clt-03", name: "Marcus Vance", companyName: "Nexus Health Systems" },
    owner: { id: "usr-pm-01", name: "Priya Sharma", email: "priya@agencyflow.dev", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=PS&backgroundColor=0ea5e9" },
    _count: { tasks: 2 },
  },
]

const initialTasks: Task[] = [
  {
    id: "tsk-01",
    title: "Implement Biometric FaceID & TouchID Auth Flow",
    description: "Configure Secure Enclave key generation and fallback PIN authorization handlers.",
    projectId: "prj-01",
    assignedDeveloperId: "usr-dev-01",
    createdById: "usr-pm-01",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    completedAt: null,
    isOverdue: false,
    project: { id: "prj-01", name: "Finora Mobile Banking v2.0", ownerId: "usr-pm-01" },
    assignedDeveloper: { id: "usr-dev-01", name: "Amit Patel", email: "amit@agencyflow.dev", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=AP&backgroundColor=10b981" },
    createdBy: { id: "usr-pm-01", name: "Priya Sharma", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=PS&backgroundColor=0ea5e9" },
    comments: [
      {
        id: "cmt-01",
        taskId: "tsk-01",
        userId: "usr-pm-01",
        content: "Please ensure iOS 18 compatibility with the new biometric privacy manifest.",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        user: { id: "usr-pm-01", name: "Priya Sharma", email: "priya@agencyflow.dev", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=PS&backgroundColor=0ea5e9" },
      },
    ],
  },
  {
    id: "tsk-02",
    title: "Design PostgreSQL Schema for Multi-Currency Ledger",
    description: "Write Prisma schema with double-entry accounting constraints and optimistic concurrency locks.",
    projectId: "prj-01",
    assignedDeveloperId: "usr-dev-02",
    createdById: "usr-pm-01",
    status: "DONE",
    priority: "HIGH",
    dueDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    isOverdue: false,
    project: { id: "prj-01", name: "Finora Mobile Banking v2.0", ownerId: "usr-pm-01" },
    assignedDeveloper: { id: "usr-dev-02", name: "Sarah Chen", email: "sarah@agencyflow.dev", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=SC&backgroundColor=f59e0b" },
    createdBy: { id: "usr-pm-01", name: "Priya Sharma", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=PS&backgroundColor=0ea5e9" },
    comments: [],
  },
  {
    id: "tsk-03",
    title: "Setup WebSocket Real-Time Balance Stream",
    description: "Build Socket.IO cluster gateway with Redis adapter for horizontal scaling.",
    projectId: "prj-01",
    assignedDeveloperId: "usr-dev-03",
    createdById: "usr-admin-01",
    status: "IN_REVIEW",
    priority: "HIGH",
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    completedAt: null,
    isOverdue: false,
    project: { id: "prj-01", name: "Finora Mobile Banking v2.0", ownerId: "usr-pm-01" },
    assignedDeveloper: { id: "usr-dev-03", name: "Rahul Verma", email: "rahul@agencyflow.dev", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=RV&backgroundColor=ef4444" },
    createdBy: { id: "usr-admin-01", name: "Alex Admin", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=AA&backgroundColor=4f46e5" },
    comments: [],
  },
  {
    id: "tsk-04",
    title: "ACH Transfer Failure Rollback Webhook",
    description: "Write idempotent retry queues with exponential backoff on Plaid payment failure webhooks.",
    projectId: "prj-01",
    assignedDeveloperId: "usr-dev-01",
    createdById: "usr-pm-01",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: new Date(Date.now() + 8 * 86400000).toISOString(),
    completedAt: null,
    isOverdue: false,
    project: { id: "prj-01", name: "Finora Mobile Banking v2.0", ownerId: "usr-pm-01" },
    assignedDeveloper: { id: "usr-dev-01", name: "Amit Patel", email: "amit@agencyflow.dev", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=AP&backgroundColor=10b981" },
    createdBy: { id: "usr-pm-01", name: "Priya Sharma", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=PS&backgroundColor=0ea5e9" },
    comments: [],
  },
  {
    id: "tsk-05",
    title: "YOLOv8 Plant Disease Inference Pipeline",
    description: "Optimize ONNX model quantizations for sub-50ms browser WASM inference.",
    projectId: "prj-02",
    assignedDeveloperId: "usr-dev-02",
    createdById: "usr-admin-01",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    dueDate: new Date(Date.now() + 6 * 86400000).toISOString(),
    completedAt: null,
    isOverdue: false,
    project: { id: "prj-02", name: "Khet Jivan AI Crop Diagnostic Engine", ownerId: "usr-admin-01" },
    assignedDeveloper: { id: "usr-dev-02", name: "Sarah Chen", email: "sarah@agencyflow.dev", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=SC&backgroundColor=f59e0b" },
    createdBy: { id: "usr-admin-01", name: "Alex Admin", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=AA&backgroundColor=4f46e5" },
    comments: [],
  },
  {
    id: "tsk-06",
    title: "GeoTIFF Drone Orthomosaic Tiler Service",
    description: "Slice massive 2GB GeoTIFF drone maps into Slippy map raster tiles.",
    projectId: "prj-02",
    assignedDeveloperId: "usr-dev-03",
    createdById: "usr-admin-01",
    status: "TODO",
    priority: "HIGH",
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    completedAt: null,
    isOverdue: true,
    project: { id: "prj-02", name: "Khet Jivan AI Crop Diagnostic Engine", ownerId: "usr-admin-01" },
    assignedDeveloper: { id: "usr-dev-03", name: "Rahul Verma", email: "rahul@agencyflow.dev", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=RV&backgroundColor=ef4444" },
    createdBy: { id: "usr-admin-01", name: "Alex Admin", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=AA&backgroundColor=4f46e5" },
    comments: [],
  },
]

const initialActivityLogs: ActivityLog[] = [
  {
    id: "act-01",
    actorId: "usr-pm-01",
    projectId: "prj-01",
    taskId: "tsk-01",
    eventType: "task.created",
    message: "Priya Sharma created task 'Implement Biometric FaceID & TouchID Auth Flow'",
    metadata: {},
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    actor: { id: "usr-pm-01", name: "Priya Sharma", email: "priya@agencyflow.dev", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=PS&backgroundColor=0ea5e9" },
  },
  {
    id: "act-02",
    actorId: "usr-dev-02",
    projectId: "prj-01",
    taskId: "tsk-02",
    eventType: "task.status_changed",
    message: "Sarah Chen marked 'Design PostgreSQL Schema for Multi-Currency Ledger' as DONE",
    metadata: {},
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    actor: { id: "usr-dev-02", name: "Sarah Chen", email: "sarah@agencyflow.dev", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=SC&backgroundColor=f59e0b" },
  },
  {
    id: "act-03",
    actorId: "usr-admin-01",
    projectId: "prj-02",
    taskId: null,
    eventType: "project.created",
    message: "Alex Admin launched new project 'Khet Jivan AI Crop Diagnostic Engine'",
    metadata: {},
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    actor: { id: "usr-admin-01", name: "Alex Admin", email: "admin@agencyflow.dev", avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=AA&backgroundColor=4f46e5" },
  },
]

const initialNotifications: Notification[] = [
  {
    id: "notif-01",
    userId: "usr-admin-01",
    type: "TASK_ASSIGNED",
    title: "New Project Assignment",
    message: "You were assigned as owner for Khet Jivan AI Crop Diagnostic Engine.",
    projectId: "prj-02",
    taskId: "tsk-05",
    isRead: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "notif-02",
    userId: "usr-admin-01",
    type: "TASK_OVERDUE",
    title: "Overdue Task Alert",
    message: "Task 'GeoTIFF Drone Orthomosaic Tiler Service' is past its scheduled deadline.",
    projectId: "prj-02",
    taskId: "tsk-06",
    isRead: false,
    createdAt: new Date(Date.now() - 5400000).toISOString(),
  },
]

function getStore(): MockDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.projects?.length && parsed?.users?.length && parsed?.clients?.length) {
        return parsed
      }
    }
  } catch {
    /* ignore */
  }

  const initial: MockDatabase = {
    users: initialUsers,
    clients: initialClients,
    projects: initialProjects,
    tasks: initialTasks,
    activityLogs: initialActivityLogs,
    notifications: initialNotifications,
  }
  saveStore(initial)
  return initial
}

function saveStore(db: MockDatabase) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    /* ignore */
  }
}

export const mockDataStore = {
  // ─── PROJECTS ─────────────────────────────────────────
  getProjects(): Project[] {
    const db = getStore()
    return db.projects.map((p) => {
      const client = db.clients.find((c) => c.id === p.clientId)
      const owner = db.users.find((u) => u.id === p.ownerId)
      const tasks = db.tasks.filter((t) => t.projectId === p.id)
      return {
        ...p,
        client: client ? { id: client.id, name: client.name, companyName: client.companyName } : p.client,
        owner: owner ? { id: owner.id, name: owner.name, email: owner.email, avatarUrl: owner.avatarUrl } : p.owner,
        tasks: tasks.map((t) => ({
          id: t.id,
          status: t.status,
          title: t.title,
          priority: t.priority,
          dueDate: t.dueDate,
          isOverdue: t.isOverdue,
          assignedDeveloper: t.assignedDeveloper,
        })),
        _count: { tasks: tasks.length },
      }
    })
  },

  getProject(id: string): Project | undefined {
    const projects = this.getProjects()
    const found = projects.find((p) => p.id === id)
    if (!found) return undefined
    const db = getStore()
    const tasks = db.tasks.filter((t) => t.projectId === id)
    return {
      ...found,
      tasks: tasks as any,
    }
  },

  createProject(data: { name: string; description?: string; clientId?: string; ownerId?: string; status?: string; dueDate?: string; startDate?: string }): Project {
    const db = getStore()
    let clientId = data.clientId
    if (!clientId && db.clients.length > 0) {
      clientId = db.clients[0].id
    } else if (!clientId) {
      // Create a default client if none exist
      const defaultClient = this.createClient({ name: "Acme Enterprise", companyName: "Acme Corp", email: "contact@acme.corp" })
      clientId = defaultClient.id
    }

    let ownerId = data.ownerId
    if (!ownerId && db.users.length > 0) {
      ownerId = db.users[0].id
    }

    const client = db.clients.find((c) => c.id === clientId)
    const owner = db.users.find((u) => u.id === ownerId)

    const newProject: Project = {
      id: `prj-${Date.now()}`,
      name: data.name,
      description: data.description || null,
      clientId: clientId || "clt-01",
      ownerId: ownerId || "usr-admin-01",
      status: (data.status as Project["status"]) || "PLANNING",
      startDate: data.startDate || new Date().toISOString(),
      dueDate: data.dueDate || null,
      client: client ? { id: client.id, name: client.name, companyName: client.companyName } : { id: "clt-01", name: "Client", companyName: "Client Company" },
      owner: owner ? { id: owner.id, name: owner.name, email: owner.email, avatarUrl: owner.avatarUrl } : { id: "usr-admin-01", name: "Admin", email: "admin@agencyflow.dev" },
      tasks: [],
      _count: { tasks: 0 },
    }

    db.projects.unshift(newProject)

    // Add activity log
    db.activityLogs.unshift({
      id: `act-${Date.now()}`,
      actorId: ownerId || "usr-admin-01",
      projectId: newProject.id,
      taskId: null,
      eventType: "project.created",
      message: `${owner?.name || "User"} created project "${newProject.name}"`,
      metadata: {},
      createdAt: new Date().toISOString(),
      actor: owner ? { id: owner.id, name: owner.name, email: owner.email, avatarUrl: owner.avatarUrl } : undefined,
    })

    saveStore(db)
    return newProject
  },

  updateProject(id: string, data: Partial<Project>): Project {
    const db = getStore()
    const idx = db.projects.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error("Project not found")

    const existing = db.projects[idx]
    const updated = { ...existing, ...data }
    db.projects[idx] = updated
    saveStore(db)
    return updated
  },

  deleteProject(id: string): void {
    const db = getStore()
    db.projects = db.projects.filter((p) => p.id !== id)
    db.tasks = db.tasks.filter((t) => t.projectId !== id)
    saveStore(db)
  },

  getProjectAnalytics(id: string): ProjectAnalytics {
    const db = getStore()
    const tasks = db.tasks.filter((t) => t.projectId === id)
    const byStatus = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].map((st) => ({
      status: st as Task["status"],
      _count: { status: tasks.filter((t) => t.status === st).length },
    }))
    const byPriority = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((pr) => ({
      priority: pr as Task["priority"],
      _count: { priority: tasks.filter((t) => t.priority === pr).length },
    }))
    const doneTasks = tasks.filter((t) => t.status === "DONE").length
    const totalTasks = tasks.length
    return {
      tasksByStatus: byStatus,
      tasksByPriority: byPriority,
      overdueCount: tasks.filter((t) => t.isOverdue).length,
      totalTasks,
      doneTasks,
      progressPercentage: totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0,
    }
  },

  // ─── CLIENTS ──────────────────────────────────────────
  getClients(): Client[] {
    const db = getStore()
    return db.clients.map((c) => {
      const projectCount = db.projects.filter((p) => p.clientId === c.id).length
      return {
        ...c,
        _count: { projects: projectCount },
      }
    })
  },

  getClient(id: string): Client | undefined {
    return this.getClients().find((c) => c.id === id)
  },

  createClient(data: { name: string; companyName: string; email: string; phone?: string; status?: string }): Client {
    const db = getStore()
    const newClient: Client = {
      id: `clt-${Date.now()}`,
      name: data.name,
      companyName: data.companyName,
      email: data.email,
      phone: data.phone || null,
      status: (data.status as Client["status"]) || "ACTIVE",
      createdAt: new Date().toISOString(),
      _count: { projects: 0 },
    }
    db.clients.unshift(newClient)
    saveStore(db)
    return newClient
  },

  updateClient(id: string, data: Partial<Client>): Client {
    const db = getStore()
    const idx = db.clients.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error("Client not found")
    const updated = { ...db.clients[idx], ...data }
    db.clients[idx] = updated
    saveStore(db)
    return updated
  },

  deleteClient(id: string): void {
    const db = getStore()
    db.clients = db.clients.filter((c) => c.id !== id)
    saveStore(db)
  },

  // ─── TASKS ────────────────────────────────────────────
  getTasks(filters: TaskFilters = {}): Paginated<Task> {
    const db = getStore()
    let items = db.tasks.map((t) => {
      const prj = db.projects.find((p) => p.id === t.projectId)
      const dev = db.users.find((u) => u.id === t.assignedDeveloperId)
      const creator = db.users.find((u) => u.id === t.createdById)
      return {
        ...t,
        project: prj ? { id: prj.id, name: prj.name, ownerId: prj.ownerId } : t.project,
        assignedDeveloper: dev ? { id: dev.id, name: dev.name, email: dev.email, avatarUrl: dev.avatarUrl } : null,
        createdBy: creator ? { id: creator.id, name: creator.name, avatarUrl: creator.avatarUrl } : null,
      }
    })

    if (filters.status) {
      items = items.filter((t) => t.status === filters.status)
    }
    if (filters.priority) {
      items = items.filter((t) => t.priority === filters.priority)
    }
    if (filters.overdue) {
      items = items.filter((t) => t.isOverdue)
    }
    if (filters.projectId) {
      items = items.filter((t) => t.projectId === filters.projectId)
    }
    if (filters.assignedDeveloperId) {
      items = items.filter((t) => t.assignedDeveloperId === filters.assignedDeveloperId)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      )
    }

    const page = filters.page || 1
    const limit = filters.limit || 20
    const total = items.length
    const totalPages = Math.ceil(total / limit) || 1
    const start = (page - 1) * limit
    const paged = items.slice(start, start + limit)

    return {
      items: paged,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  },

  getTask(id: string): Task | undefined {
    const paginated = this.getTasks()
    const task = paginated.items.find((t) => t.id === id) || getStore().tasks.find((t) => t.id === id)
    if (!task) return undefined
    const db = getStore()
    const prj = db.projects.find((p) => p.id === task.projectId)
    const dev = db.users.find((u) => u.id === task.assignedDeveloperId)
    const creator = db.users.find((u) => u.id === task.createdById)
    return {
      ...task,
      project: prj ? { id: prj.id, name: prj.name, ownerId: prj.ownerId } : task.project,
      assignedDeveloper: dev ? { id: dev.id, name: dev.name, email: dev.email, avatarUrl: dev.avatarUrl } : null,
      createdBy: creator ? { id: creator.id, name: creator.name, avatarUrl: creator.avatarUrl } : null,
    }
  },

  createTask(data: {
    title: string
    description?: string
    projectId: string
    assignedDeveloperId?: string | null
    createdById?: string
    status?: string
    priority?: string
    dueDate?: string | null
  }): Task {
    const db = getStore()
    let projectId = data.projectId
    if (!projectId && db.projects.length > 0) {
      projectId = db.projects[0].id
    }
    const prj = db.projects.find((p) => p.id === projectId)
    const dev = db.users.find((u) => u.id === data.assignedDeveloperId)
    const createdById = data.createdById || "usr-admin-01"
    const creator = db.users.find((u) => u.id === createdById)

    const newTask: Task = {
      id: `tsk-${Date.now()}`,
      title: data.title,
      description: data.description || null,
      projectId: projectId || "prj-01",
      assignedDeveloperId: data.assignedDeveloperId || null,
      createdById,
      status: (data.status as Task["status"]) || "TODO",
      priority: (data.priority as Task["priority"]) || "MEDIUM",
      dueDate: data.dueDate || null,
      completedAt: data.status === "DONE" ? new Date().toISOString() : null,
      isOverdue: false,
      project: prj ? { id: prj.id, name: prj.name, ownerId: prj.ownerId } : { id: "prj-01", name: "Project", ownerId: "usr-admin-01" },
      assignedDeveloper: dev ? { id: dev.id, name: dev.name, email: dev.email, avatarUrl: dev.avatarUrl } : null,
      createdBy: creator ? { id: creator.id, name: creator.name, avatarUrl: creator.avatarUrl } : null,
      comments: [],
      activityLogs: [],
    }

    db.tasks.unshift(newTask)

    // Add activity log
    db.activityLogs.unshift({
      id: `act-${Date.now()}`,
      actorId: createdById,
      projectId: newTask.projectId,
      taskId: newTask.id,
      eventType: "task.created",
      message: `${creator?.name || "User"} created task "${newTask.title}"`,
      metadata: {},
      createdAt: new Date().toISOString(),
      actor: creator ? { id: creator.id, name: creator.name, email: creator.email, avatarUrl: creator.avatarUrl } : undefined,
    })

    saveStore(db)
    return newTask
  },

  updateTask(id: string, data: Partial<Task>): Task {
    const db = getStore()
    const idx = db.tasks.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error("Task not found")

    const existing = db.tasks[idx]
    const isDone = data.status === "DONE"
    const updated: Task = {
      ...existing,
      ...data,
      completedAt: isDone ? (existing.completedAt || new Date().toISOString()) : (data.status ? null : existing.completedAt),
      isOverdue: isDone ? false : existing.isOverdue,
    }
    db.tasks[idx] = updated
    saveStore(db)
    return updated
  },

  deleteTask(id: string): void {
    const db = getStore()
    db.tasks = db.tasks.filter((t) => t.id !== id)
    saveStore(db)
  },

  addComment(taskId: string, content: string, userId: string): TaskComment {
    const db = getStore()
    const task = db.tasks.find((t) => t.id === taskId)
    if (!task) throw new Error("Task not found")

    const user = db.users.find((u) => u.id === userId) || {
      id: userId,
      name: "Admin User",
      email: "admin@agencyflow.dev",
      role: "ADMIN" as const,
      avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=Admin&backgroundColor=06b6d4",
    }

    const comment: TaskComment = {
      id: `cmt-${Date.now()}`,
      taskId,
      userId,
      content,
      createdAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    }

    if (!task.comments) task.comments = []
    task.comments.push(comment)

    saveStore(db)
    return comment
  },

  // ─── USERS ────────────────────────────────────────────
  getUsers(): User[] {
    return getStore().users
  },

  getUser(id: string): User | undefined {
    return getStore().users.find((u) => u.id === id)
  },

  getDevelopers(): User[] {
    return getStore().users.filter((u) => u.role === "DEVELOPER")
  },

  createUser(data: { name: string; email: string; password?: string; role?: User["role"]; avatarUrl?: string }): User {
    const db = getStore()
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role || "DEVELOPER",
      avatarUrl: data.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=06b6d4`,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    db.users.push(newUser)
    saveStore(db)
    return newUser
  },

  updateUser(id: string, data: Partial<User>): User {
    const db = getStore()
    const idx = db.users.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error("User not found")
    const updated = { ...db.users[idx], ...data }
    db.users[idx] = updated
    saveStore(db)
    return updated
  },

  setUserStatus(id: string, isActive: boolean): User {
    return this.updateUser(id, { isActive })
  },

  // ─── ACTIVITY & NOTIFICATIONS ─────────────────────────
  getActivity(): ActivityLog[] {
    const db = getStore()
    return db.activityLogs.map((a) => {
      const actor = db.users.find((u) => u.id === a.actorId)
      return {
        ...a,
        actor: actor ? { id: actor.id, name: actor.name, email: actor.email, avatarUrl: actor.avatarUrl } : a.actor,
      }
    })
  },

  getNotifications(): { notifications: Notification[]; total: number } {
    const db = getStore()
    return { notifications: db.notifications, total: db.notifications.length }
  },

  getUnreadCount(): { count: number } {
    const db = getStore()
    const count = db.notifications.filter((n) => !n.isRead).length
    return { count }
  },

  markNotificationRead(id: string): void {
    const db = getStore()
    const notif = db.notifications.find((n) => n.id === id)
    if (notif) notif.isRead = true
    saveStore(db)
  },

  markAllNotificationsRead(): void {
    const db = getStore()
    db.notifications.forEach((n) => (n.isRead = true))
    saveStore(db)
  },

  getDashboardStats(_role: User["role"] = "ADMIN"): AdminDashboardStats {
    const db = getStore()
    const tasks = db.tasks
    const projects = db.projects
    const clients = db.clients

    const byStatus = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].map((st) => ({
      status: st as Task["status"],
      _count: { status: tasks.filter((t) => t.status === st).length },
    }))

    const byPriority = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((pr) => ({
      priority: pr as Task["priority"],
      _count: { priority: tasks.filter((t) => t.priority === pr).length },
    }))

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === "ACTIVE").length,
      totalTasks: tasks.length,
      totalClients: clients.length,
      overdueTasks: tasks.filter((t) => t.isOverdue).length,
      onlineUsers: Math.min(db.users.length, 4),
      tasksByStatus: byStatus,
      tasksByPriority: byPriority,
    }
  },
}
