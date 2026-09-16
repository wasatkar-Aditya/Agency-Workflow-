import { useActivity } from "@/api/hooks"
import { formatDistanceToNow } from "date-fns"
import { Radio, RefreshCw } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const eventTypeColors: Record<string, { bg: string; text: string; dot: string }> = {
  TASK_ASSIGNED: { bg: "rgba(6,182,212,0.12)", text: "#06b6d4", dot: "#06b6d4" },
  TASK_STATUS_CHANGED: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa", dot: "#8b5cf6" },
  TASK_CREATED: { bg: "rgba(34,197,94,0.12)", text: "#4ade80", dot: "#22c55e" },
  TASK_COMPLETED: { bg: "rgba(34,197,94,0.15)", text: "#4ade80", dot: "#22c55e" },
  PROJECT_UPDATED: { bg: "rgba(251,146,60,0.12)", text: "#fb923c", dot: "#f59e0b" },
  PROJECT_CREATED: { bg: "rgba(20,184,166,0.12)", text: "#2dd4bf", dot: "#14b8a6" },
  TASK_OVERDUE: { bg: "rgba(239,68,68,0.12)", text: "#f87171", dot: "#ef4444" },
  GENERAL: { bg: "rgba(100,116,139,0.12)", text: "#94a3b8", dot: "#64748b" },
}

const eventTypes = ["All", "TASK_ASSIGNED", "TASK_STATUS_CHANGED", "TASK_CREATED", "TASK_COMPLETED", "PROJECT_UPDATED", "TASK_OVERDUE"]

export default function LiveActivity() {
  const { data: activity, refetch, isLoading } = useActivity()
  const [filter, setFilter] = useState("All")

  const filtered = (activity ?? []).filter((a) => filter === "All" || a.eventType === filter)

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white">Live Activity</h2>
            <span className="badge-live">REALTIME</span>
          </div>
          <p className="text-sm text-muted-foreground">Real-time feed of all agency activity — tasks, projects, deployments, and team actions.</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-white/5 transition-colors shrink-0"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {eventTypes.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "rounded-full px-3 py-1 text-[10px] font-semibold border transition-colors",
              filter === t
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                : "border-white/[0.06] text-muted-foreground hover:bg-white/5"
            )}
          >
            {t === "All" ? t : t.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Activity feed */}
      <div className="glass-card rounded-xl divide-y divide-white/[0.04]">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <Radio className="mb-3 h-8 w-8 text-white/20" />
            <p className="text-sm">No activity yet.</p>
          </div>
        )}
        {filtered.map((item, i) => {
          const ec = eventTypeColors[item.eventType] || eventTypeColors.GENERAL
          return (
            <div key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
              {/* Event dot + line */}
              <div className="flex flex-col items-center shrink-0 mt-1">
                <div className="h-2 w-2 rounded-full" style={{ background: ec.dot }} />
                {i < filtered.length - 1 && <div className="w-px flex-1 mt-1 min-h-[20px]" style={{ background: `${ec.dot}30` }} />}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span
                        className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                        style={{ background: ec.bg, color: ec.text }}
                      >
                        {item.eventType.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-foreground leading-snug">{item.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
