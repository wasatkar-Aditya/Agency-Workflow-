import { useState } from "react"
import { format } from "date-fns"
import { Loader2, ShieldOff, Plus, Search } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useSetUserStatus, useUsers } from "@/api/hooks"
import { UserFormModal } from "@/components/user/UserFormModal"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"

const roleColors: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: "rgba(239,68,68,0.12)", text: "#f87171" },
  PROJECT_MANAGER: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa" },
  DEVELOPER: { bg: "rgba(6,182,212,0.12)", text: "#22d3ee" },
}

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "PM",
  DEVELOPER: "Dev",
}

export default function Users() {
  const role = useAuthStore((s) => s.user?.role)
  const { data: users, isLoading } = useUsers(role === "ADMIN")
  const setStatus = useSetUserStatus()
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<User | null>(null)
  const [search, setSearch] = useState("")

  if (role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center py-16 text-muted-foreground animate-slide-up">
        <ShieldOff className="mb-3 h-10 w-10 text-white/20" />
        <p className="text-sm">You do not have access to user management.</p>
      </div>
    )
  }

  const filtered = (users ?? []).filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const active = filtered.filter((u) => u.isActive).length
  const devs = filtered.filter((u) => u.role === "DEVELOPER").length
  const pms = filtered.filter((u) => u.role === "PROJECT_MANAGER").length

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Team</h2>
          <p className="text-sm text-muted-foreground">Manage agency team members, roles, and access permissions.</p>
        </div>
        <button
          onClick={() => { setEdit(null); setOpen(true) }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0"
          style={{ background: "linear-gradient(135deg, hsl(186,100%,42%), hsl(160,80%,40%))", color: "hsl(216,28%,7%)" }}
        >
          <Plus className="h-3.5 w-3.5" /> New User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Members", value: filtered.length, color: "#06b6d4" },
          { label: "Active", value: active, color: "#22c55e" },
          { label: "Developers", value: devs, color: "#8b5cf6" },
          { label: "Project Managers", value: pms, color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} className="stat-card p-3">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          placeholder="Search team members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-white/[0.08] pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors"
          style={{ background: "rgba(255,255,255,0.03)" }}
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      )}

      {/* User table */}
      {!isLoading && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Capacity</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const rc = roleColors[u.role] || roleColors.DEVELOPER
                  const cap = u.role === "DEVELOPER" ? Math.floor(Math.random() * 40 + 60) : Math.floor(Math.random() * 30 + 50)
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold"
                              style={{ background: `${rc.text}18`, color: rc.text }}
                            >
                              {u.name[0]}
                            </div>
                            <span className={cn(
                              "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background",
                              u.isActive ? "bg-emerald-400" : "bg-gray-600"
                            )} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">{u.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs">{u.email}</td>
                      <td>
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                          style={{ background: rc.bg, color: rc.text }}
                        >
                          {roleLabels[u.role] || u.role}
                        </span>
                      </td>
                      <td>
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          u.isActive ? "health-optimal" : "health-attention"
                        )}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-xs text-muted-foreground">
                        {u.createdAt ? format(new Date(u.createdAt), "PP") : "—"}
                      </td>
                      <td>
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <div className="flex-1 progress-bar">
                            <div className="h-full rounded-full" style={{ width: `${cap}%`, background: cap >= 90 ? "#ef4444" : cap >= 75 ? "#f59e0b" : "#22c55e" }} />
                          </div>
                          <span className="text-[10px] font-semibold w-8 text-right" style={{ color: cap >= 90 ? "#f87171" : cap >= 75 ? "#fb923c" : "#4ade80" }}>
                            {cap}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex justify-end gap-1.5">
                          <button
                            className="rounded border border-white/[0.08] px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                            onClick={() => { setEdit(u); setOpen(true) }}
                          >
                            Edit
                          </button>
                          <button
                            className={cn(
                              "rounded border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                              u.isActive
                                ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                                : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                            )}
                            onClick={() => setStatus.mutate({ id: u.id, isActive: !u.isActive })}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UserFormModal open={open} onOpenChange={setOpen} user={edit} />
    </div>
  )
}
