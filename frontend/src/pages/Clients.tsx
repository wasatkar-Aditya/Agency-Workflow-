import { useState } from "react"
import { Building2, Loader2, Pencil, Trash2, Plus, Search, TrendingUp } from "lucide-react"
import { useClient, useClients, useDeleteClient } from "@/api/hooks"
import { useAuthStore } from "@/store/authStore"
import { ClientFormModal } from "@/components/client/ClientFormModal"
import type { Client } from "@/lib/types"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

const industryColors: Record<string, string> = {
  ACTIVE: "#22c55e",
  INACTIVE: "#64748b",
}

export default function Clients() {
  const role = useAuthStore((s) => s.user?.role)
  const canManage = role === "ADMIN" || role === "PROJECT_MANAGER"
  const { data: clients, isLoading } = useClients()
  const [formOpen, setFormOpen] = useState(false)
  const [edit, setEdit] = useState<Client | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const { data: detail } = useClient(expanded)
  const del = useDeleteClient()

  const filtered = (clients ?? []).filter((c) =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const active = filtered.filter((c) => c.status === "ACTIVE").length
  const inactive = filtered.filter((c) => c.status === "INACTIVE").length

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Clients</h2>
          <p className="text-sm text-muted-foreground">Manage client accounts, retainers, and project relationships.</p>
        </div>
        {canManage && (
          <button
            onClick={() => { setEdit(null); setFormOpen(true) }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(186,100%,42%), hsl(160,80%,40%))", color: "hsl(216,28%,7%)" }}
          >
            <Plus className="h-3.5 w-3.5" /> New Client
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Clients", value: filtered.length, color: "#06b6d4" },
          { label: "Active Retainers", value: active, color: "#22c55e" },
          { label: "Inactive", value: inactive, color: "#64748b" },
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
          placeholder="Search clients..."
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

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((client) => {
          const color = industryColors[client.status] || "#06b6d4"
          const isExpanded = expanded === client.id

          return (
            <div key={client.id} className="glass-card rounded-xl overflow-hidden hover:border-white/[0.12] transition-all">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shrink-0"
                      style={{ background: `${color}20`, border: `1px solid ${color}30` }}
                    >
                      {client.companyName[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{client.companyName}</h3>
                      <p className="text-[11px] text-muted-foreground">{client.name}</p>
                    </div>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold border shrink-0"
                    style={{ background: `${color}15`, color, borderColor: `${color}30` }}
                  >
                    {client.status}
                  </span>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Email</p>
                    <p className="text-[11px] text-foreground truncate">{client.email}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Phone</p>
                    <p className="text-[11px] text-foreground">{client.phone || "—"}</p>
                  </div>
                </div>

                {/* Project count + MRR */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[11px] font-semibold text-foreground">{client._count?.projects ?? 0} Active Projects</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400">+18.4% MRR</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : client.id)}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    {isExpanded ? "Hide projects ↑" : "View projects ↓"}
                  </button>
                  {canManage && (
                    <div className="flex gap-1.5">
                      <button
                        className="flex items-center gap-1 rounded border border-white/[0.08] px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                        onClick={() => { setEdit(client); setFormOpen(true) }}
                      >
                        <Pencil className="h-2.5 w-2.5" /> Edit
                      </button>
                      <button
                        className="flex items-center gap-1 rounded border border-red-500/20 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/10 transition-colors"
                        onClick={() => setDeleteId(client.id)}
                      >
                        <Trash2 className="h-2.5 w-2.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Expanded projects */}
                {isExpanded && (
                  <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-1.5">
                    {(detail?.projects ?? []).map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs">
                        <span className="text-foreground font-medium">{p.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4" }}>
                          {p.status.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                    {(detail?.projects ?? []).length === 0 && (
                      <p className="text-xs text-muted-foreground">No projects yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Building2 className="mb-3 h-10 w-10 text-white/20" />
          <p className="text-sm">No clients found.</p>
        </div>
      )}

      <ClientFormModal open={formOpen} onOpenChange={setFormOpen} client={edit} />
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent style={{ background: "hsl(216,28%,10%)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Delete client</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button className="rounded-lg border border-white/[0.1] px-4 py-2 text-sm font-semibold text-foreground hover:bg-white/5 transition-colors" onClick={() => setDeleteId(null)}>Cancel</button>
            <button
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
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
