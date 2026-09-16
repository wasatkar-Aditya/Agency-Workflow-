import { useState } from "react"
import { useUsers } from "@/api/hooks"
import { useAuthStore } from "@/store/authStore"
import { Loader2, Users, ShieldOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserProfileModal } from "@/components/user/UserProfileModal"
import { UserFormModal } from "@/components/user/UserFormModal"
import type { User } from "@/lib/types"

const roleColors: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: "rgba(239,68,68,0.12)", text: "#f87171" },
  PROJECT_MANAGER: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa" },
  DEVELOPER: { bg: "rgba(6,182,212,0.12)", text: "#22d3ee" },
}

const availabilityOptions = ["Available", "In Meeting", "Focus Mode", "AFK", "Offline"] as const
type Availability = typeof availabilityOptions[number]

const availColors: Record<Availability, string> = {
  "Available": "#22c55e",
  "In Meeting": "#f59e0b",
  "Focus Mode": "#8b5cf6",
  "AFK": "#64748b",
  "Offline": "#374151",
}

// Mock per-user state for demo
const mockAvailability: Availability[] = ["Available", "Focus Mode", "In Meeting", "Available", "AFK"]
const mockCap = [98, 75, 80, 65, 45, 90]
const mockProjects = ["Finora", "Khet Jivan AI", "Atlas CRM", "Nova Commerce", "Finora"]

export default function Team() {
  const role = useAuthStore((s) => s.user?.role)
  const { data: users, isLoading } = useUsers(role === "ADMIN" || role === "PROJECT_MANAGER")

  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<{
    user: User
    availability: Availability
    cap: number
    project: string
  } | null>(null)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)

  if (role === "DEVELOPER") {
    return (
      <div className="flex flex-col items-center py-16 text-muted-foreground animate-slide-up">
        <ShieldOff className="mb-3 h-10 w-10 text-white/20" />
        <p className="text-sm">Team management is not available for your role.</p>
      </div>
    )
  }

  const all = users ?? []
  const online = all.filter((u) => u.isActive).length
  const devs = all.filter((u) => u.role === "DEVELOPER").length
  const avgCap = mockCap.slice(0, all.length).reduce((s, c) => s + c, 0) / Math.max(all.length, 1)

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Online Squad</h2>
          <p className="text-sm text-muted-foreground">Current duty rotation — team availability, workload capacity, and active project assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-live">LIVE</span>
          <span className="text-[11px] text-muted-foreground">{online} online</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Members", value: all.length, color: "#06b6d4" },
          { label: "Online Now", value: online, color: "#22c55e" },
          { label: "Developers", value: devs, color: "#8b5cf6" },
          { label: "Avg Capacity", value: `${Math.round(avgCap)}%`, color: avgCap >= 85 ? "#ef4444" : "#f59e0b" },
        ].map((s) => (
          <div key={s.label} className="stat-card p-3">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      )}

      {/* Team grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((u, i) => {
          const rc = roleColors[u.role] || roleColors.DEVELOPER
          const cap = mockCap[i % mockCap.length]
          const availability = mockAvailability[i % mockAvailability.length]
          const avColor = availColors[availability]
          const project = mockProjects[i % mockProjects.length]

          return (
            <div key={u.id} className="glass-card rounded-xl p-4 hover:border-white/[0.14] transition-all">
              {/* Avatar + name */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold"
                      style={{ background: `${rc.text}18`, color: rc.text }}
                    >
                      {u.name[0]}
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background"
                      style={{ background: avColor }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{u.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ background: rc.bg, color: rc.text }}>
                        {u.role.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-semibold border"
                  style={{ background: `${avColor}15`, color: avColor, borderColor: `${avColor}30` }}
                >
                  {availability}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Current Project</span>
                  <span className="font-semibold text-cyan-400">{project}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground truncate max-w-[140px]">{u.email}</span>
                </div>

                {/* Capacity bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Workload Capacity</span>
                    <span className="text-[10px] font-bold" style={{ color: cap >= 90 ? "#f87171" : cap >= 75 ? "#fb923c" : "#4ade80" }}>
                      {cap}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${cap}%`,
                        background: cap >= 90
                          ? "linear-gradient(90deg, #ef4444, #f87171)"
                          : cap >= 75
                          ? "linear-gradient(90deg, #f59e0b, #fb923c)"
                          : "linear-gradient(90deg, #22c55e, #4ade80)"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className={cn("text-[10px] font-medium", u.isActive ? "text-emerald-400" : "text-muted-foreground")}>
                  {u.isActive ? "● Active" : "○ Inactive"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember({ user: u, availability, cap, project })
                    setProfileModalOpen(true)
                  }}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer transition-colors font-semibold"
                >
                  View Profile →
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {!isLoading && all.length === 0 && (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Users className="mb-3 h-10 w-10 text-white/20" />
          <p className="text-sm">No team members found.</p>
        </div>
      )}

      {/* Squad Member Profile Modal */}
      <UserProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        user={selectedMember ? (all.find((m) => m.id === selectedMember.user.id) || selectedMember.user) : null}
        availability={selectedMember?.availability}
        workloadCap={selectedMember?.cap}
        currentProject={selectedMember?.project}
        onEdit={(usr) => {
          setProfileModalOpen(false)
          setUserToEdit(usr)
          setEditModalOpen(true)
        }}
      />

      {/* Admin User Edit Modal */}
      <UserFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        user={userToEdit}
      />
    </div>
  )
}
