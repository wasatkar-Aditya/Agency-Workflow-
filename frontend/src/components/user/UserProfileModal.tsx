import { useState } from "react"
import { format } from "date-fns"
import {
  Mail,
  Copy,
  Check,
  Calendar,
  Briefcase,
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit3,
  Power,
  FolderKanban,
  Sparkles,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/store/authStore"
import { useSetUserStatus, useTasks } from "@/api/hooks"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"

const roleColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  ADMIN: {
    bg: "rgba(239, 68, 68, 0.12)",
    text: "#f87171",
    border: "rgba(239, 68, 68, 0.3)",
    glow: "rgba(239, 68, 68, 0.25)",
  },
  PROJECT_MANAGER: {
    bg: "rgba(139, 92, 246, 0.12)",
    text: "#a78bfa",
    border: "rgba(139, 92, 246, 0.3)",
    glow: "rgba(139, 92, 246, 0.25)",
  },
  DEVELOPER: {
    bg: "rgba(6, 182, 212, 0.12)",
    text: "#22d3ee",
    border: "rgba(6, 182, 212, 0.3)",
    glow: "rgba(6, 182, 212, 0.25)",
  },
}

const availColors: Record<string, string> = {
  "Available": "#22c55e",
  "In Meeting": "#f59e0b",
  "Focus Mode": "#8b5cf6",
  "AFK": "#64748b",
  "Offline": "#374151",
}

interface UserProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  availability?: string
  workloadCap?: number
  currentProject?: string
  onEdit?: (user: User) => void
}

export function UserProfileModal({
  open,
  onOpenChange,
  user,
  availability = "Available",
  workloadCap = 75,
  currentProject = "Finora",
  onEdit,
}: UserProfileModalProps) {
  const currentUserRole = useAuthStore((s) => s.user?.role)
  const isAdmin = currentUserRole === "ADMIN"
  const setStatus = useSetUserStatus()
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  // Fetch tasks assigned to this user
  const { data: userTasksData } = useTasks(
    user?.id ? { assignedDeveloperId: user.id } : {}
  )

  if (!user) return null

  const assignedTasks = userTasksData?.items ?? []
  const rc = roleColors[user.role] || roleColors.DEVELOPER
  const avColor = availColors[availability] || "#22c55e"

  const inProgressCount = assignedTasks.filter((t) => t.status === "IN_PROGRESS").length
  const completedCount = assignedTasks.filter((t) => t.status === "DONE").length
  const overdueCount = assignedTasks.filter((t) => t.isOverdue).length

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(user.email)
    setCopiedEmail(true)
    toast({ title: "Email copied to clipboard" })
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id)
    setCopiedId(true)
    toast({ title: "Member ID copied to clipboard" })
    setTimeout(() => setCopiedId(false), 2000)
  }

  const getCapacityStatus = (cap: number) => {
    if (cap >= 90) return { label: "Critical Load", desc: "Near full capacity, rebalance load", color: "#f87171" }
    if (cap >= 75) return { label: "Heavy Duty", desc: "Active on primary sprint tasks", color: "#fb923c" }
    return { label: "Optimal Band", desc: "Available for new assignments", color: "#4ade80" }
  }

  const capStatus = getCapacityStatus(workloadCap)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-white/[0.12] bg-[#0c131f]/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{user.name} Profile</DialogTitle>
        </DialogHeader>

        {/* Decorative Top Accent Banner */}
        <div
          className="h-24 w-full relative overflow-hidden flex items-end px-6 pb-2"
          style={{
            background: `linear-gradient(135deg, ${rc.text}22 0%, rgba(15, 23, 42, 0.8) 100%)`,
            borderBottom: `1px solid ${rc.border}`,
          }}
        >
          {/* Subtle Cyber Grid lines */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-3 right-5 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border shadow-sm"
              style={{
                background: `${avColor}18`,
                color: avColor,
                borderColor: `${avColor}35`,
              }}
            >
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ background: avColor }}
              />
              {availability}
            </span>
          </div>
        </div>

        {/* Dialog Content Body */}
        <div className="px-6 pb-6 pt-0 space-y-6">
          {/* User Identity Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 gap-4">
            <div className="flex items-end gap-4">
              {/* Avatar with Glow Ring */}
              <div className="relative">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-2xl border-2 border-[#0c131f]"
                  style={{
                    background: `linear-gradient(135deg, ${rc.text}33, ${rc.text}15)`,
                    boxShadow: `0 0 24px ${rc.glow}`,
                  }}
                >
                  {user.name[0]}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#0c131f]"
                  style={{ background: avColor }}
                />
              </div>

              {/* Name & Badges */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">{user.name}</h3>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                      user.isActive
                        ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                        : "text-muted-foreground border-white/10 bg-white/5"
                    )}
                  >
                    {user.isActive ? "● Active Squad" : "○ Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                    style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}
                  >
                    <Shield className="h-3 w-3" />
                    {user.role.replace("_", " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ID: <span className="font-mono text-[11px]">{user.id.slice(0, 12)}</span>
                  </span>
                  <button
                    onClick={handleCopyId}
                    title="Copy Member ID"
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    {copiedId ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions for Admin */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(user)}
                    className="h-8 gap-1.5 border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
                    Edit Profile
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate({ id: user.id, isActive: !user.isActive })}
                  className={cn(
                    "h-8 gap-1.5 text-xs font-semibold border",
                    user.isActive
                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                  )}
                >
                  <Power className="h-3.5 w-3.5" />
                  {user.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Email Card */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-cyan-400" /> Email Address
              </span>
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <a
                  href={`mailto:${user.email}`}
                  className="text-xs font-medium text-white hover:text-cyan-400 truncate transition-colors"
                >
                  {user.email}
                </a>
                <button
                  onClick={handleCopyEmail}
                  className="shrink-0 text-muted-foreground hover:text-white transition-colors"
                  title="Copy email"
                >
                  {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Current Project Card */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FolderKanban className="h-3 w-3 text-purple-400" /> Assigned Project
              </span>
              <p className="text-xs font-semibold text-cyan-300 truncate pt-0.5">
                {currentProject}
              </p>
            </div>

            {/* Member Since Card */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-emerald-400" /> Member Since
              </span>
              <p className="text-xs font-medium text-white truncate pt-0.5">
                {user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Squad Veteran"}
              </p>
            </div>
          </div>

          {/* Workload Capacity & Squad Health Card */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">Workload Capacity & Rotation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono" style={{ color: capStatus.color }}>
                  {workloadCap}%
                </span>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold border"
                  style={{
                    background: `${capStatus.color}15`,
                    color: capStatus.color,
                    borderColor: `${capStatus.color}35`,
                  }}
                >
                  {capStatus.label}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${workloadCap}%`,
                  background:
                    workloadCap >= 90
                      ? "linear-gradient(90deg, #ef4444, #f87171)"
                      : workloadCap >= 75
                      ? "linear-gradient(90deg, #f59e0b, #fb923c)"
                      : "linear-gradient(90deg, #22c55e, #4ade80)",
                  boxShadow: `0 0 10px ${capStatus.color}40`,
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">{capStatus.desc}</p>
          </div>

          {/* Assigned Sprint Tasks Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">Assigned Sprint Tasks</span>
                <span className="text-[10px] rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 font-semibold">
                  {assignedTasks.length}
                </span>
              </div>

              {/* Task Mini Counters */}
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 text-amber-400">
                  <Clock className="h-3 w-3" /> {inProgressCount} in progress
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> {completedCount} done
                </span>
                {overdueCount > 0 && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="flex items-center gap-1 text-red-400">
                      <AlertTriangle className="h-3 w-3" /> {overdueCount} overdue
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Task list preview */}
            {assignedTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.08] p-6 text-center space-y-1">
                <Briefcase className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                <p className="text-xs text-muted-foreground">No active tasks directly assigned right now.</p>
                <p className="text-[10px] text-muted-foreground/60">This member is ready for next duty sprint assignment.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {assignedTasks.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors gap-3"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-xs font-medium text-white truncate">{t.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="text-cyan-400 font-medium">{t.project?.name}</span>
                        {t.dueDate && (
                          <span>Due: {format(new Date(t.dueDate), "MMM dd")}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                          t.status === "DONE" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                          t.status === "IN_PROGRESS" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                          t.status === "TODO" && "bg-slate-500/10 text-slate-300 border border-slate-500/20",
                          t.status === "IN_REVIEW" && "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        )}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[9px] font-bold",
                          t.priority === "CRITICAL" && "bg-red-500/20 text-red-400",
                          t.priority === "HIGH" && "bg-orange-500/20 text-orange-400",
                          t.priority === "MEDIUM" && "bg-yellow-500/20 text-yellow-400",
                          t.priority === "LOW" && "bg-blue-500/20 text-blue-400"
                        )}
                      >
                        {t.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Close */}
          <div className="flex items-center justify-end pt-2 border-t border-white/[0.06]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
