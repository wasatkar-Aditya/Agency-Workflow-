import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Building2,
  Activity,
  Bell,
  Settings,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { cn } from "@/lib/utils"

export interface SidebarLinkItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const navLinks: SidebarLinkItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/team", label: "Team", icon: Users },
  { to: "/clients", label: "Clients", icon: Building2 },
  { to: "/live-activity", label: "Activity", icon: Activity },
  { to: "/notifications", label: "Notifications", icon: Bell, badge: "3" },
  { to: "/users", label: "Settings", icon: Settings },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuthStore()

  const displayName = user?.name || "Aditya Wasatkar"
  const displayRole = user?.role === "ADMIN" ? "Admin" : user?.role === "PROJECT_MANAGER" ? "Project Manager" : "Developer"

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[230px] flex-col transition-transform duration-300 md:static md:translate-x-0",
        "border-r border-[#30353D] bg-[#151719]",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-5 border-b border-[#30353D]/50">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/30 shadow-[0_0_15px_rgba(255,122,0,0.25)]">
          {/* Stylized Delta / Triangle AgencyFlow Logo */}
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 fill-[#FF7A00]"
          >
            <path d="M12 2.5L2 20.5h20L12 2.5zm0 4.8l6.5 11.7H5.5L12 7.3z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            Agency<span className="text-[#FF7A00]">Flow</span>
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-180",
                isActive
                  ? "bg-[#FF7A00]/15 text-[#FF7A00] font-semibold border-l-[3px] border-[#FF7A00] shadow-[0_0_20px_rgba(255,122,0,0.08)]"
                  : "text-[#A6ADB8] hover:text-white hover:bg-white/[0.04]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <link.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors duration-180",
                      isActive ? "text-[#FF7A00]" : "text-[#707985] group-hover:text-[#FF7A00]"
                    )}
                  />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span
                    className={cn(
                      "flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold",
                      isActive
                        ? "bg-[#FF7A00] text-white"
                        : "bg-[#FF5C5C] text-white"
                    )}
                  >
                    {link.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom User Profile */}
      <div className="shrink-0 border-t border-[#30353D] p-3 m-2 rounded-xl bg-[#1A1D21] border transition-colors hover:border-[#FF7A00]/40 cursor-pointer active:scale-[0.98]">
        <NavLink to="/users" onClick={onClose} className="flex items-center gap-3">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
              alt={displayName}
              className="h-9 w-9 rounded-full object-cover border border-[#30353D]"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#35D07F] ring-2 ring-[#1A1D21]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{displayName}</p>
            <p className="truncate text-[10px] text-[#707985] font-medium">{displayRole}</p>
          </div>
        </NavLink>
      </div>
    </aside>
  )
}
