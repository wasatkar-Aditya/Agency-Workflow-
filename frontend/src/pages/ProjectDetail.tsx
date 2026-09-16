import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { Loader2, ArrowLeft, Pencil, Plus, Circle, GitBranch, Activity } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useActivity, useProject, useProjectAnalytics } from "@/api/hooks"
import { joinProjectRoom, leaveProjectRoom } from "@/api/socket"
import { TaskFormModal } from "@/components/task/TaskFormModal"
import { TaskDetailModal } from "@/components/task/TaskDetailModal"
import { ProjectFormModal } from "@/components/project/ProjectFormModal"
import { useAuthStore } from "@/store/authStore"
import type { TaskStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

const STATUS_COLORS: Record<string, string> = {
  TODO: "#64748b",
  IN_PROGRESS: "#06b6d4",
  IN_REVIEW: "#8b5cf6",
  DONE: "#22c55e",
}

const DONUT_COLORS = ["#64748b", "#06b6d4", "#8b5cf6", "#22c55e"]

function healthColor(pct: number) {
  if (pct >= 80) return "#22c55e"
  if (pct >= 60) return "#06b6d4"
  if (pct >= 40) return "#f59e0b"
  return "#ef4444"
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const { data: project, isLoading } = useProject(id)
  const { data: analytics } = useProjectAnalytics(id)
  const { data: activity } = useActivity()
  const [formOpen, setFormOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TaskStatus>("TODO")

  useEffect(() => {
    if (!id) return
    joinProjectRoom(id)
    return () => leaveProjectRoom(id)
  }, [id])

  if (isLoading || !project) {
    return (
      <div className="flex h-full items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  const tasks = project.tasks ?? []
  const chartData = (analytics?.tasksByStatus ?? []).map((row) => ({
    name: String(row.status).replace("_", " "),
    value: row._count.status,
  }))
  const pct = analytics?.progressPercentage ?? 0
  const hColor = healthColor(pct)

  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status)
  const projectActivity = (activity ?? []).filter((a) => a.projectId === project.id)

  const canManage = role === "ADMIN" || role === "PROJECT_MANAGER"

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Breadcrumb + header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Projects
            </button>
            <span className="text-muted-foreground text-[11px]">/</span>
            <span className="text-[11px] text-foreground font-medium">{project.name}</span>
          </div>
          <h2 className="text-2xl font-bold text-white">{project.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{project.description || "No description provided."}</p>
        </div>
        {canManage && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
            >
              <Pencil className="h-3 w-3" /> Edit
            </button>
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{ background: "linear-gradient(135deg, hsl(186,100%,42%), hsl(160,80%,40%))", color: "hsl(216,28%,7%)" }}
            >
              <Plus className="h-3.5 w-3.5" /> Quick-add Task
            </button>
          </div>
        )}
      </div>

      {/* Meta cards row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Client", value: project.client?.companyName || "—", color: "#06b6d4" },
          { label: "Owner", value: project.owner?.name || "—", color: "#8b5cf6" },
          { label: "Status", value: project.status.replace("_", " "), color: hColor },
          { label: "Due Date", value: project.dueDate ? format(new Date(project.dueDate), "MMM d, yyyy") : "No due date", color: "#f59e0b" },
        ].map((m) => (
          <div key={m.label} className="stat-card p-3">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{m.label}</p>
            <p className="text-sm font-bold truncate" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Progress Donut */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Progress</h3>
            <span className="text-lg font-bold" style={{ color: hColor }}>{pct}%</span>
          </div>
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={chartData.length ? chartData : [{ name: "TODO", value: 1 }]}
                  dataKey="value" nameKey="name"
                  innerRadius={48} outerRadius={68} paddingAngle={3}
                >
                  {(chartData.length ? chartData : [{ name: "TODO", value: 1 }]).map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(216,28%,10%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute pointer-events-none text-center">
              <p className="text-2xl font-bold text-white">{pct}%</p>
              <p className="text-[9px] uppercase text-muted-foreground">Done</p>
            </div>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-1 mt-2">
            {(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as TaskStatus[]).map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: DONUT_COLORS[i] }} />
                <span className="text-[9px] text-muted-foreground">{s.replace("_", " ")}</span>
                <span className="ml-auto text-[9px] font-semibold text-foreground">{byStatus(s).length}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Activity */}
        <div className="glass-card rounded-xl lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Project Activity</h3>
            <span className="ml-auto badge-live">LIVE</span>
          </div>
          <div className="divide-y divide-white/[0.04] max-h-[220px] overflow-y-auto">
            {projectActivity.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-muted-foreground">No project activity yet.</p>
            )}
            {projectActivity.slice(0, 12).map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground leading-snug">{a.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Tabs */}
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-white/[0.06] overflow-x-auto">
          {(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as TaskStatus[]).map((s) => {
            const count = byStatus(s).length
            const color = STATUS_COLORS[s]
            const isActive = activeTab === s
            return (
              <button
                key={s}
                onClick={() => setActiveTab(s)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2",
                  isActive ? "border-b-transparent" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                style={isActive ? { borderBottomColor: color, color } : {}}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                {s.replace("_", " ")}
                <span className={cn(
                  "ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                  isActive ? "text-white" : "bg-white/6 text-muted-foreground"
                )}
                  style={isActive ? { background: `${color}25`, color } : {}}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Task grid for active tab */}
        <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {byStatus(activeTab).map((task, idx) => {
            const taskNum = String(100 + idx).padStart(3, "0")
            return (
              <div
                key={task.id}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.04] transition-all"
                onClick={() => setTaskId(task.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-mono text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
                    AF-{taskNum}
                  </span>
                  {task.priority === "CRITICAL" && (
                    <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                      CRITICAL
                    </span>
                  )}
                  {task.isOverdue && (
                    <span className="text-[9px] font-bold text-red-400">Overdue</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-white leading-snug mb-2">{task.title}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[8px] font-bold text-foreground">
                      {task.assignedDeveloper?.name?.[0] || "?"}
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                      {task.assignedDeveloper?.name || "Unassigned"}
                    </span>
                  </div>
                  {task.dueDate && (
                    <span className={cn("text-[9px]", task.isOverdue ? "text-red-400" : "text-muted-foreground")}>
                      {format(new Date(task.dueDate), "MMM d")}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
          {byStatus(activeTab).length === 0 && (
            <div className="col-span-full flex flex-col items-center py-10 text-muted-foreground">
              <Circle className="mb-2 h-8 w-8 text-white/10" />
              <p className="text-sm">No tasks in this column.</p>
              {canManage && (
                <button
                  onClick={() => setFormOpen(true)}
                  className="mt-2 text-xs text-cyan-400 hover:underline"
                >
                  + Add task
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Branch commit mock for devs */}
      {role === "DEVELOPER" && (
        <div className="glass-card rounded-xl">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Project Branches</h3>
          </div>
          <div className="p-4 text-xs text-muted-foreground">
            Connect your Git repository to see branch activity here.
          </div>
        </div>
      )}

      <ProjectFormModal open={editOpen} onOpenChange={setEditOpen} project={project} />
      <TaskFormModal open={formOpen} onOpenChange={setFormOpen} defaultProjectId={project.id} />
      <TaskDetailModal open={!!taskId} onOpenChange={(o) => !o && setTaskId(null)} taskId={taskId} />
    </div>
  )
}
