import { useMemo, useState } from "react"
import { format } from "date-fns"
import { Inbox, Loader2, X, CheckSquare, Square, Filter, Download, Plus, SlidersHorizontal } from "lucide-react"
import { useDevelopers, useProjects, useTasks, useTask, useUpdateTaskStatus } from "@/api/hooks"
import { useAuthStore } from "@/store/authStore"
import { TaskFormModal } from "@/components/task/TaskFormModal"
import { DeleteTaskDialog } from "@/components/task/DeleteTaskDialog"
import type { Task, TaskPriority, TaskStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  TODO: { bg: "rgba(100,116,139,0.15)", text: "#94a3b8", dot: "#64748b" },
  IN_PROGRESS: { bg: "rgba(6,182,212,0.12)", text: "#06b6d4", dot: "#06b6d4" },
  IN_REVIEW: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa", dot: "#8b5cf6" },
  DONE: { bg: "rgba(34,197,94,0.12)", text: "#4ade80", dot: "#22c55e" },
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: "rgba(239,68,68,0.15)", text: "#f87171", border: "rgba(239,68,68,0.3)" },
  HIGH: { bg: "rgba(251,146,60,0.15)", text: "#fb923c", border: "rgba(251,146,60,0.3)" },
  MEDIUM: { bg: "rgba(6,182,212,0.12)", text: "#22d3ee", border: "rgba(6,182,212,0.25)" },
  LOW: { bg: "rgba(100,116,139,0.12)", text: "#94a3b8", border: "rgba(100,116,139,0.2)" },
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.TODO
  return (
    <span className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold"
      style={{ background: c.bg, color: c.text }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.dot }} />
      {status.replace(/_/g, " ")}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const c = PRIORITY_COLORS[priority] || PRIORITY_COLORS.LOW
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {priority === "CRITICAL" && "! "}{priority}
    </span>
  )
}

// Side panel for task detail
function TaskSidePanel({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const { data: task, isLoading } = useTask(taskId)
  const updateStatus = useUpdateTaskStatus()
  const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    )
  }
  if (!task) return null

  return (
    <div className="flex h-full flex-col overflow-hidden animate-slide-up">
      {/* Panel header */}
      <div className="flex items-start justify-between border-b border-white/[0.06] p-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-bold text-cyan-400 font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded">
              AF-{taskId.slice(-3).toUpperCase()}
            </span>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Branch: fix/{task.project?.name?.toLowerCase().replace(/\s+/g, "-") || "main"}-{task.id.slice(-4)}</span>
          </div>
        </div>
        <button onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Project info */}
        <div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
            <span className="font-semibold text-cyan-400">{task.project?.name}</span>
            <span>·</span>
            <span>Sprint 2</span>
            <span>·</span>
            <span className="font-mono text-[10px] bg-white/5 px-1 py-0.5 rounded">AF-{taskId.slice(-3).toUpperCase()}</span>
          </div>
          <h3 className="text-base font-bold text-white leading-snug">{task.title}</h3>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Assignee</p>
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-[9px] font-bold text-cyan-400">
                {task.assignedDeveloper?.name?.[0] || "?"}
              </div>
              <span className="text-xs font-medium text-foreground">{task.assignedDeveloper?.name || "Unassigned"}</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Due Date</p>
            <p className="text-xs font-semibold text-foreground">
              {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No due date"}
              {task.isOverdue && <span className="ml-1 text-red-400 text-[10px]">(Overdue)</span>}
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Cycle / Milestone</p>
            <p className="text-xs text-foreground">Milestone 2: Payment Rails</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Estimate</p>
            <p className="text-xs text-foreground">8 Story Points (~14 hrs)</p>
          </div>
        </div>

        {/* Change status */}
        <div>
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-2">Update Status</p>
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((s) => {
              const c = STATUS_COLORS[s]
              const isActive = task.status === s
              return (
                <button
                  key={s}
                  onClick={() => updateStatus.mutate({ id: task.id, status: s })}
                  className={cn("rounded px-2 py-1 text-[10px] font-semibold transition-all border", isActive ? "border-transparent" : "border-white/[0.06] hover:border-white/[0.12]")}
                  style={isActive ? { background: c.bg, color: c.text } : {}}
                >
                  {s.replace(/_/g, " ")}
                </button>
              )
            })}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-2">Technical Specification & Criteria</p>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-muted-foreground leading-relaxed">
              {task.description}
            </div>
          </div>
        )}

        {/* Checklist (mock) */}
        <div>
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-2">Acceptance Criteria</p>
          <div className="space-y-2">
            {[
              { done: true, text: "Persist processed event IDs in Redis with a 72-hour TTL to prevent replay attacks." },
              { done: true, text: "Wrap debit transactions in database atomic transaction blocks." },
              { done: false, text: "Implement exponential backoff retry queue (BullMQ) for downstream 5xx timeouts." },
              { done: false, text: "Write unit tests verifying simulated delayed payload scenarios." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                {item.done
                  ? <CheckSquare className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  : <Square className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                }
                <p className={cn("text-xs leading-snug", item.done ? "line-through text-muted-foreground" : "text-foreground")}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Activity & Commits</p>
            <span className="text-[9px] text-muted-foreground">{(task.comments ?? []).length} events</span>
          </div>
          <div className="space-y-2.5">
            {(task.comments ?? []).map((comment) => (
              <div key={comment.id} className="flex items-start gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[8px] font-bold text-foreground shrink-0">
                  {comment.user?.name?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold text-foreground">{comment.user?.name}</span>
                    <span className="text-[9px] text-muted-foreground">commented</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug">{comment.content}</p>
                </div>
              </div>
            ))}
            {(task.comments ?? []).length === 0 && (
              <p className="text-[11px] text-muted-foreground">No comments yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Panel footer */}
      <div className="border-t border-white/[0.06] p-4 flex gap-2">
        <button
          className="flex-1 rounded-lg border border-white/[0.1] py-2 text-xs font-semibold text-foreground hover:bg-white/5 transition-colors"
          onClick={() => updateStatus.mutate({ id: task.id, status: "IN_REVIEW" })}
        >
          Mark as In Review
        </button>
        <button className="flex-1 rounded-lg border border-cyan-500/30 py-2 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/10 transition-colors">
          ↗ Attach PR
        </button>
      </div>
    </div>
  )
}

export default function Tasks() {
  const { user } = useAuthStore()
  const canManage = user?.role !== "DEVELOPER"
  const [status, setStatus] = useState<TaskStatus | "">("")
  const [priority, setPriority] = useState<TaskPriority | "">("")
  const [search, setSearch] = useState("")
  const [projectId, setProjectId] = useState("")
  const [assignee, setAssignee] = useState("")
  const [overdue, setOverdue] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters = useMemo(
    () => ({
      status,
      priority,
      search,
      overdue,
      projectId: projectId || undefined,
      assignedDeveloperId: assignee || undefined,
      limit: 50,
    }),
    [status, priority, search, overdue, projectId, assignee]
  )

  const { data, isLoading, isError } = useTasks(filters)
  const { data: projects } = useProjects()
  const { data: developers } = useDevelopers()
  const tasks = data?.items ?? []

  // Top mini stats from filtered data
  const blocked = tasks.filter((t) => t.isOverdue).length
  const done = tasks.filter((t) => t.status === "DONE").length

  return (
    <div className="flex gap-4 h-full min-h-0 animate-slide-up">
      {/* Main task table */}
      <div className={cn("flex flex-col space-y-4 transition-all min-w-0", selectedId ? "flex-1" : "w-full")}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">Tasks</h2>
            <p className="text-sm text-muted-foreground">Track, prioritize, and complete client deliverables across all agency teams.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-muted-foreground hover:bg-white/5 transition-colors">
              <Download className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-muted-foreground hover:bg-white/5 transition-colors">
              <SlidersHorizontal className="h-3 w-3" />
            </button>
            {canManage && (
              <button
                onClick={() => { setEditTask(null); setFormOpen(true) }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{ background: "linear-gradient(135deg, hsl(186,100%,42%), hsl(160,80%,40%))", color: "hsl(216,28%,7%)" }}
              >
                <Plus className="h-3.5 w-3.5" /> New Task
              </button>
            )}
          </div>
        </div>

        {/* Mini stat bar */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Active Pipeline", value: tasks.length, sub: `+${Math.max(0, tasks.length - 30)} this week`, color: "#06b6d4" },
            { label: "Sprint Velocity", value: "94.2%", sub: "Sprint 24", color: "#22c55e" },
            { label: "Attention Needed", value: blocked, sub: blocked > 0 ? "Overdue" : "All clear", color: blocked > 0 ? "#ef4444" : "#22c55e" },
            { label: "Completed Releases", value: `${done}/32`, sub: "75%", color: "#8b5cf6" },
          ].map((s) => (
            <div key={s.label} className="stat-card p-3">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1 max-w-xs">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              placeholder="Filter tasks by title, tag..."
              className="w-full rounded-lg border border-white/[0.08] pl-7 pr-3 py-1.5 text-xs text-foreground outline-none transition-colors"
              style={{ background: "rgba(255,255,255,0.03)" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {[
            { label: `Status: ${status || "All (38)"}`, options: ["", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"], setValue: setStatus, value: status },
            { label: `Priority: ${priority || "All"}`, options: ["", "LOW", "MEDIUM", "HIGH", "CRITICAL"], setValue: setPriority, value: priority },
          ].map((f) => (
            <select
              key={f.label}
              className="rounded-lg border border-white/[0.08] px-2 py-1.5 text-xs text-foreground outline-none cursor-pointer"
              style={{ background: "rgba(255,255,255,0.03)" }}
              value={f.value}
              onChange={(e) => f.setValue(e.target.value as any)}
            >
              {f.options.map((o) => <option key={o} value={o}>{o || f.label.split(":")[0] + ": All"}</option>)}
            </select>
          ))}
          {canManage && (
            <>
              <select
                className="rounded-lg border border-white/[0.08] px-2 py-1.5 text-xs text-foreground outline-none cursor-pointer"
                style={{ background: "rgba(255,255,255,0.03)" }}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">Project: All</option>
                {(projects ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select
                className="rounded-lg border border-white/[0.08] px-2 py-1.5 text-xs text-foreground outline-none cursor-pointer"
                style={{ background: "rgba(255,255,255,0.03)" }}
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Assignee: All</option>
                {(developers ?? []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </>
          )}
          <button
            onClick={() => setOverdue((v) => !v)}
            className={cn("rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
              overdue ? "border-red-500/40 bg-red-500/10 text-red-400" : "border-white/[0.08] text-muted-foreground hover:bg-white/5"
            )}
          >
            Overdue
          </button>
          <div className="ml-auto text-[10px] text-muted-foreground">Sort: Due Date ↕</div>
        </div>

        {/* Task Table */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        )}
        {isError && <p className="text-sm text-red-400">Could not load tasks.</p>}

        {!isLoading && tasks.length > 0 && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-8"><input type="checkbox" className="accent-cyan-500" /></th>
                    <th>Task Title & Identifier</th>
                    <th>Project</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, idx) => {
                    const taskNum = String(idx + 100).padStart(3, "0")
                    const isSelected = selectedId === task.id
                    return (
                      <tr
                        key={task.id}
                        className={cn("cursor-pointer transition-colors", isSelected && "bg-cyan-500/5 border-l-2 border-l-cyan-400")}
                        onClick={() => setSelectedId(isSelected ? null : task.id)}
                      >
                        <td onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="accent-cyan-500" />
                        </td>
                        <td>
                          <div className="flex items-start gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[9px] font-mono text-muted-foreground">AF-{taskNum}</span>
                                <StatusBadge status={task.status} />
                              </div>
                              <p className={cn("text-xs font-semibold text-white truncate max-w-[240px]", task.isOverdue && "text-red-300")}>
                                {task.title}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4" }}>
                            {task.project?.name}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[8px] font-bold text-foreground">
                              {task.assignedDeveloper?.name?.[0] || "?"}
                            </div>
                            <span className="text-xs truncate max-w-[80px]">{task.assignedDeveloper?.name || "—"}</span>
                          </div>
                        </td>
                        <td><PriorityBadge priority={task.priority} /></td>
                        <td className={cn("text-xs", task.isOverdue && "text-red-400 font-semibold")}>
                          {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "—"}
                          {task.isOverdue && " (Overdue)"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2 text-[10px] text-muted-foreground">
              <span>Displaying {tasks.length} of {data?.meta.total ?? tasks.length} deliverables · Real-time sync: Active</span>
              <div className="flex gap-2">
                <button className="hover:text-foreground">Previous</button>
                <span>Page 1 / {Math.ceil((data?.meta.total ?? tasks.length) / 50)}</span>
                <button className="hover:text-foreground">Next</button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && tasks.length === 0 && (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Inbox className="mb-3 h-10 w-10 text-white/20" />
            <p className="text-sm">No tasks found.</p>
          </div>
        )}
      </div>

      {/* Side Panel */}
      {selectedId && (
        <div
          className="hidden lg:flex w-[400px] shrink-0 flex-col rounded-xl border border-white/[0.08] overflow-hidden"
          style={{ background: "rgba(13,20,33,0.95)" }}
        >
          <TaskSidePanel taskId={selectedId} onClose={() => setSelectedId(null)} />
        </div>
      )}

      <TaskFormModal open={formOpen} onOpenChange={setFormOpen} task={editTask} />
      <DeleteTaskDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} taskId={deleteId} />
    </div>
  )
}
