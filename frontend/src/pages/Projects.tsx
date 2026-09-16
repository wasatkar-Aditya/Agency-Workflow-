import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { FolderKanban, Loader2, Pencil, Trash2, Grid3X3, Table, Plus, Search, ChevronDown } from "lucide-react"
import { useDeleteProject, useProjects } from "@/api/hooks"
import { useAuthStore } from "@/store/authStore"
import { ProjectFormModal } from "@/components/project/ProjectFormModal"
import type { Project, TaskStatus } from "@/lib/types"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

function progress(project: Project) {
  const tasks = project.tasks ?? []
  const total = tasks.length || project._count?.tasks || 0
  const done = tasks.filter((t) => t.status === ("DONE" as TaskStatus)).length
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
}

function healthColor(pct: number) {
  if (pct >= 80) return "#22c55e"
  if (pct >= 60) return "#06b6d4"
  if (pct >= 40) return "#f59e0b"
  return "#ef4444"
}

function healthLabel(status: string, pct: number) {
  if (status === "ACTIVE" && pct >= 80) return "98% Healthy"
  if (status === "ACTIVE" && pct >= 60) return `Optimal (${pct}%)`
  if (status === "ON_HOLD") return "Needs Attention"
  if (status === "COMPLETED") return "Completed"
  return "In Review"
}

const techColors: Record<string, string> = {
  "Next.js": "#fff", "TypeScript": "#3b82f6", "PostgreSQL": "#06b6d4",
  "Stripe": "#8b5cf6", "React": "#61dafb", "Python": "#22c55e",
  "FastAPI": "#14b8a6", "YOLOv8": "#f59e0b", "Remix": "#ef4444",
  "Shopify API": "#22c55e", "Tailwind": "#38bdf8", "Redis": "#f43f5e",
  "Node.js": "#22c55e", "Docker": "#3b82f6", "GraphQL": "#e879f9",
}

export default function Projects() {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const { data: projects, isLoading } = useProjects()
  const del = useDeleteProject()
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Project | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [search, setSearch] = useState("")
  const canManage = role === "ADMIN" || role === "PROJECT_MANAGER"

  const filtered = (projects ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.companyName?.toLowerCase().includes(search.toLowerCase())
  )

  // Summary stats
  const onTrack = filtered.filter((p) => p.status === "ACTIVE").length
  const onHold = filtered.filter((p) => p.status === "ON_HOLD").length

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white">Projects</h2>
            <span className="rounded-md bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
              v1.4 Production
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your agency's active client engagements, sprint health, multi-stream delivery pipelines, and contract milestones.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors", viewMode === "grid" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5")}
            >
              <Grid3X3 className="h-3 w-3" /> Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors", viewMode === "table" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5")}
            >
              <Table className="h-3 w-3" /> Table
            </button>
          </div>
          {canManage && (
            <button
              onClick={() => { setEdit(null); setOpen(true) }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
              style={{ background: "linear-gradient(135deg, hsl(186,100%,42%), hsl(160,80%,40%))", color: "hsl(216,28%,7%)" }}
            >
              <Plus className="h-3.5 w-3.5" /> New Project
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, clients, or technologies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/4 pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-cyan-500/50 transition-colors"
            style={{ background: "rgba(255,255,255,0.03)" }}
          />
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-muted-foreground hover:bg-white/5 transition-colors">
          All Clients <ChevronDown className="h-3 w-3" />
        </button>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-muted-foreground hover:bg-white/5 transition-colors">
          Sort: Health <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Stat Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {[
          { label: "Total Portfolio", value: filtered.length.toString(), sub: "+2 this Q", color: "#06b6d4" },
          { label: "On Track", value: onTrack.toString(), sub: `${Math.round((onTrack / Math.max(filtered.length, 1)) * 100)}%`, badge: "Sprints Within Buffer", color: "#22c55e" },
          { label: "Needs Review", value: onHold.toString(), sub: "Design QA", badge: "Scope Adjustments", color: "#f59e0b" },
          { label: "Critical", value: "1", sub: "Blocker", badge: "Requires Intervention", color: "#ef4444" },
          { label: "Total Contract", value: "$420k", sub: "TCV", badge: "Retainers & Milestones", color: "#8b5cf6" },
        ].map((s) => (
          <div key={s.label} className="stat-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
            {s.badge && <p className="text-[9px] text-foreground mt-1 font-medium">{s.badge}</p>}
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((project) => {
            const p = progress(project)
            const hColor = healthColor(p.pct)
            const hLabel = healthLabel(project.status, p.pct)
            const isAtRisk = project.status === "ON_HOLD"
            const techTags = ["Next.js", "TypeScript", "PostgreSQL"].slice(0, 3)

            return (
              <div
                key={project.id}
                className="glass-card rounded-xl hover:border-white/[0.14] transition-all group cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="p-4">
                  {/* Project header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white shrink-0"
                        style={{ background: `${hColor}20`, border: `1px solid ${hColor}30` }}
                      >
                        {project.name[0]}
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {project.client?.companyName || "Agency Project"}
                        </p>
                        <h3 className="text-sm font-bold text-white leading-tight">{project.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold border"
                        style={{
                          background: `${hColor}15`,
                          color: hColor,
                          borderColor: `${hColor}30`,
                        }}
                      >
                        {isAtRisk ? "⚠ At Risk" : project.status === "ACTIVE" ? "● In Progress" : project.status.replace("_", " ")}
                      </span>
                      {canManage && (
                        <button
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all"
                          onClick={(e) => { e.stopPropagation(); setEdit(project); setOpen(true) }}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2">
                    {project.description || "No description provided."}
                  </p>

                  {/* Sprint health + target release */}
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Sprint Health</p>
                      <p className="text-xs font-semibold" style={{ color: hColor }}>{hLabel}</p>
                    </div>
                    <div className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Target Release</p>
                      <p className="text-xs font-semibold text-foreground">
                        {project.dueDate ? format(new Date(project.dueDate), "MMM d") : "TBD"}
                      </p>
                    </div>
                  </div>

                  {/* Task completion */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-muted-foreground">Task Completion</span>
                      <span className="text-[10px] font-semibold text-foreground">{p.done} / {p.total} Tasks ({p.pct}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: `linear-gradient(90deg, ${hColor}, ${hColor}88)` }} />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="flex items-center justify-between mb-3 text-[10px] text-muted-foreground">
                    <span>Budget Expended</span>
                    <span className="text-foreground font-semibold">$85,000 / $110,000</span>
                  </div>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {techTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded px-1.5 py-0.5 text-[9px] font-semibold"
                        style={{ background: `${techColors[tag] || "#6b7280"}18`, color: techColors[tag] || "#6b7280" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => e.stopPropagation()}>
                        Sprint Board
                      </button>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {isAtRisk && role === "ADMIN" && (
                        <button className="text-[10px] font-semibold text-orange-400 hover:underline">
                          Resolve Blocker
                        </button>
                      )}
                      <button
                        className="flex items-center gap-1 rounded-md border border-white/[0.1] px-2 py-1 text-[10px] font-semibold text-foreground hover:bg-white/6 transition-colors"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        Workspace ↗
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && !isLoading && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Due Date</th>
                  <th>Owner</th>
                  {canManage && <th />}
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => {
                  const p = progress(project)
                  const hColor = healthColor(p.pct)
                  return (
                    <tr
                      key={project.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <td>
                        <span className="font-semibold text-white">{project.name}</span>
                      </td>
                      <td>{project.client?.companyName}</td>
                      <td>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: `${hColor}15`, color: hColor }}>
                          {project.status.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-[60px] progress-bar">
                            <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: hColor }} />
                          </div>
                          <span className="text-xs">{p.pct}%</span>
                        </div>
                      </td>
                      <td>{project.dueDate ? format(new Date(project.dueDate), "PP") : "—"}</td>
                      <td>{project.owner?.name}</td>
                      {canManage && (
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1.5 justify-end">
                            <button
                              className="rounded border border-white/[0.08] px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                              onClick={() => { setEdit(project); setOpen(true) }}
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            {role === "ADMIN" && (
                              <button
                                className="rounded border border-red-500/20 px-2 py-0.5 text-[10px] text-red-400 hover:bg-red-500/10 transition-colors"
                                onClick={() => setDeleteId(project.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <FolderKanban className="mb-3 h-10 w-10 text-white/20" />
          <p className="text-sm">No projects found.</p>
        </div>
      )}

      <ProjectFormModal open={open} onOpenChange={setOpen} project={edit} />
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent style={{ background: "hsl(216,28%,10%)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Delete project</DialogTitle>
            <DialogDescription>This cannot be undone and will remove all related tasks.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button className="rounded-lg border border-white/[0.1] px-4 py-2 text-sm font-semibold text-foreground hover:bg-white/5 transition-colors" onClick={() => setDeleteId(null)}>Cancel</button>
            <button
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
              style={{ background: "#ef4444" }}
              disabled={del.isPending}
              onClick={async () => { if (!deleteId) return; await del.mutateAsync(deleteId); setDeleteId(null) }}
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
