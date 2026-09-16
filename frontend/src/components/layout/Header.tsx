import { useState, useRef, useEffect } from "react"
import { Menu, Search, MessageSquare, ChevronDown, LogOut, User, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { NotificationDropdown } from "@/components/layout/NotificationDropdown"
import api from "@/api/axios"
import { disconnectSocket } from "@/api/socket"
import { toast } from "@/components/ui/use-toast"

export function Header({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const displayName = user?.name ? user.name.split(" ")[0] : "Aditya"
  const userRole = user?.role === "ADMIN" ? "Admin" : user?.role === "PROJECT_MANAGER" ? "Project Manager" : "Developer"

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    if (showUserMenu) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showUserMenu])

  const handleLogout = async () => {
    try { await api.post("/auth/logout") } catch { /* ignore */ }
    disconnectSocket()
    logout()
    toast({ title: "Logged out" })
    navigate("/login")
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#30353D] bg-[#101214] px-6 gap-4">
      {/* Mobile Menu Button */}
      <button
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#A6ADB8] hover:bg-[#1A1D21] hover:text-white transition-colors md:hidden"
        onClick={onMenu}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search Input Bar */}
      <div className="relative flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-[#707985] pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects, tasks, or clients..."
            className="w-full rounded-lg border border-[#30353D] bg-[#1A1D21] py-2 pl-10 pr-20 text-xs text-[#F5F7FA] placeholder-[#707985] transition-all focus:border-[#FF7A00] focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
          />
          <div className="absolute right-2.5 flex items-center gap-1 rounded bg-[#20242A] px-1.5 py-0.5 border border-[#30353D] text-[10px] font-medium text-[#707985] pointer-events-none">
            <span>Ctrl</span>
            <span>+</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <NotificationDropdown />

        {/* Message / Chat Icon */}
        <button
          onClick={() => navigate("/live-activity")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A6ADB8] hover:bg-[#1A1D21] hover:text-white transition-colors"
          title="Messages & Activity"
        >
          <MessageSquare className="h-4 w-4" />
        </button>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-[#30353D]" />

        {/* User Profile Trigger */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-[#1A1D21] transition-colors"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover border border-[#30353D]"
              />
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#35D07F] ring-2 ring-[#101214]" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">{displayName}</span>
              <span className="text-[10px] text-[#707985] font-medium leading-tight">{userRole}</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#707985] transition-transform" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-[#30353D] bg-[#1A1D21] py-1.5 shadow-2xl animate-slide-up">
              <div className="border-b border-[#30353D] px-3.5 py-2.5">
                <p className="text-xs font-semibold text-white">{user?.name || "Aditya Wasatkar"}</p>
                <p className="text-[10px] text-[#707985] truncate">{user?.email || "aditya@agencyflow.io"}</p>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    navigate("/users")
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-[#A6ADB8] hover:bg-[#20242A] hover:text-white transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-[#707985]" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    navigate("/users")
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-[#A6ADB8] hover:bg-[#20242A] hover:text-white transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-[#707985]" />
                  Settings
                </button>
              </div>

              <div className="border-t border-[#30353D] p-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#FF5C5C] hover:bg-[#FF5C5C]/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
