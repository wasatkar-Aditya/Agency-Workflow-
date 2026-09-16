import { useState, useRef, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bell, X, Check } from "lucide-react"
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from "@/api/hooks"
import { cn } from "@/lib/utils"

export function NotificationDropdown() {
  const { data: unread } = useUnreadCount()
  const { data } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllRead()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const count = unread?.count ?? 3
  const items = data?.notifications ?? []

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const typeColors: Record<string, string> = {
    TASK_ASSIGNED: "#FF7A00",
    TASK_STATUS_CHANGED: "#F5B942",
    TASK_OVERDUE: "#FF5C5C",
    TASK_COMPLETED: "#35D07F",
    PROJECT_UPDATED: "#60A5FA",
    PROJECT_CREATED: "#FF7A00",
    GENERAL: "#A6ADB8",
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#A6ADB8] hover:bg-[#20242A] hover:text-white transition-colors"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute 1 top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF5C5C] px-1 text-[9px] font-bold text-white leading-none">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-[#30353D] bg-[#1A1D21] shadow-2xl overflow-hidden animate-slide-up"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#30353D] px-4 py-3 bg-[#151719]">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#FF7A00]" />
              <span className="text-xs font-semibold text-white">Notifications</span>
              {count > 0 && (
                <span className="rounded-full bg-[#FF7A00]/20 border border-[#FF7A00]/30 px-1.5 py-0.5 text-[10px] font-bold text-[#FF7A00]">
                  {count}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {count > 0 && (
                <button
                  onClick={() => markAll.mutate()}
                  className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold text-[#FF7A00] hover:bg-[#FF7A00]/10 transition-colors"
                >
                  <Check className="h-3 w-3" /> All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="h-5 w-5 flex items-center justify-center rounded text-[#707985] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#30353D]/50">
            {items.length === 0 ? (
              <div className="p-3 space-y-2">
                {[
                  { title: "Task #42 is overdue", desc: "Mobile App Development", time: "2h ago", color: "#FF5C5C" },
                  { title: "New comment on your task", desc: "Website Redesign", time: "3h ago", color: "#FF7A00" },
                  { title: "Project updated", desc: "Branding & Design", time: "5h ago", color: "#707985" },
                  { title: "You were assigned a new task", desc: "API Integration", time: "6h ago", color: "#60A5FA" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white leading-snug">{item.title}</p>
                      <p className="text-[10px] text-[#A6ADB8] mt-0.5">{item.desc}</p>
                      <p className="text-[9px] text-[#707985] mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              items.map((n) => {
                const dotColor = typeColors[n.type] || typeColors.GENERAL
                return (
                  <button
                    key={n.id}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors",
                      !n.isRead && "bg-[#FF7A00]/[0.04]"
                    )}
                    onClick={() => { if (!n.isRead) markRead.mutate(n.id) }}
                  >
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: dotColor }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-semibold text-white leading-snug">{n.title}</span>
                        {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A00] shrink-0 mt-1" />}
                      </div>
                      <p className="text-[10px] text-[#A6ADB8] mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                      <p className="text-[9px] text-[#707985] mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#30353D] px-4 py-2.5 text-center bg-[#151719]">
            <button className="text-xs font-medium text-[#FF7A00] hover:text-[#FF8F2B] transition-colors">
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
