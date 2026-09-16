import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { useActivity, useDashboardStats, useProjects } from "@/api/hooks"
import { formatDistanceToNow, format } from "date-fns"
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from "recharts"
import {
  Folder, CheckSquare, AlertTriangle, ExternalLink,
  Plus, ChevronRight, MoreVertical,
  Calendar, UserPlus, BarChart3, Sun,
  Users, Timer, Play, Pause
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Shared Colors ───────────────────────────────────
const ORANGE = "#FF7A00"
const STATUS_GREEN = "#35D07F"
const STATUS_AMBER = "#F5B942"

// ── Metric Card Component ───────────────────────────
function MetricCard({
  title,
  value,
  trend,
  trendPositive = true,
  icon: Icon,
  badgeIcon: BadgeIcon,
  onClick,
  onBadgeClick,
}: {
  title: string
  value: React.ReactNode
  trend: string
  trendPositive?: boolean
  icon: React.ComponentType<{ className?: string }>
  badgeIcon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
  onBadgeClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-[#30353D] bg-[#1A1D21] p-5 transition-all duration-200",
        "hover:border-[#FF7A00]/40 hover:bg-[#20242A] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]",
        "min-h-[180px] h-[180px] w-full shrink-0",
        onClick && "cursor-pointer active:scale-[0.98] active:-translate-y-0"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/25 transition-transform group-hover:scale-105">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-[#A6ADB8] tracking-wide">{title}</span>
        </div>
        {BadgeIcon && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onBadgeClick?.()
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#30353D] bg-[#20242A] text-[#707985] group-hover:text-[#FF7A00] group-hover:border-[#FF7A00]/30 transition-colors hover:bg-[#262B32]"
          >
            <BadgeIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
          <span className={cn(trendPositive ? "text-[#35D07F]" : "text-[#FF5C5C]")}>
            {trend}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Notifications Card ──────────────────────────────
function NotificationsCard({ navigate }: { navigate: (path: string) => void }) {
  const notifications = [
    {
      id: 1,
      title: "Task #42 is overdue",
      project: "Mobile App Development",
      time: "2h ago",
      iconBg: "bg-[#FF5C5C]/15 border-[#FF5C5C]/30 text-[#FF5C5C]",
      type: "alert",
      link: "/tasks?filter=overdue"
    },
    {
      id: 2,
      title: "New comment on your task",
      project: "Website Redesign",
      time: "3h ago",
      iconBg: "bg-[#FF7A00]/15 border-[#FF7A00]/30 text-[#FF7A00]",
      type: "comment",
      link: "/tasks"
    },
    {
      id: 3,
      title: "Project updated",
      project: "Branding & Design",
      time: "5h ago",
      iconBg: "bg-[#60A5FA]/15 border-[#60A5FA]/30 text-[#60A5FA]",
      type: "update",
      link: "/projects"
    },
    {
      id: 4,
      title: "You were assigned a new task",
      project: "API Integration",
      time: "6h ago",
      iconBg: "bg-[#35D07F]/15 border-[#35D07F]/30 text-[#35D07F]",
      type: "assign",
      link: "/tasks"
    },
  ]

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#30353D] bg-[#1A1D21] p-5 transition-all duration-200 hover:border-[#FF7A00]/30 min-h-[180px] h-[180px] shrink-0 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-[#30353D]/50">
        <h3 className="text-sm font-semibold text-white">Notifications</h3>
        <button
          onClick={() => navigate("/live-activity")}
          className="text-xs font-semibold text-[#FF7A00] hover:text-[#FF8F2B] transition-colors shrink-0"
        >
          View all
        </button>
      </div>

      <div className="mt-3 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.link)}
            className="group flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-[#20242A] transition-colors cursor-pointer active:scale-[0.98] active:-translate-y-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold", item.iconBg)}>
                {item.type === "alert" && <AlertTriangle className="h-4 w-4" />}
                {item.type === "comment" && <CheckSquare className="h-4 w-4" />}
                {item.type === "update" && <Folder className="h-4 w-4" />}
                {item.type === "assign" && <Users className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate group-hover:text-[#FF7A00] transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-[#A6ADB8] truncate">{item.project}</span>
                  <span className="text-[10px] text-[#707985] shrink-0">{item.time}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#707985] group-hover:text-white shrink-0 transition-transform group-hover:translate-x-0.5" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Project Overview Chart ──────────────────────────
const projectChartData = [
  { month: "Jan", value: 14 },
  { month: "Feb", value: 22 },
  { month: "Mar", value: 18 },
  { month: "Apr", value: 28 },
  { month: "May", value: 24 },
  { month: "Jun", value: 34 },
  { month: "Jul", value: 28 },
  { month: "Aug", value: 38 },
  { month: "Sep", value: 44 },
]

function ProjectOverviewChart() {
  const [period, setPeriod] = useState("Last 7 days")

  return (
    <div className="rounded-xl border border-[#30353D] bg-[#1A1D21] p-5 transition-all duration-200 hover:border-[#FF7A00]/30 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Project Overview</h3>
        </div>
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="appearance-none rounded-lg border border-[#30353D] bg-[#20242A] px-3 py-1.5 pr-7 text-xs font-medium text-[#A6ADB8] hover:text-white hover:border-[#FF7A00]/40 transition-colors cursor-pointer outline-none"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Quarter</option>
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#707985]">
            ▼
          </span>
        </div>
      </div>

      <div className="h-[210px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="orangeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ORANGE} stopOpacity={0.28} />
                <stop offset="95%" stopColor={ORANGE} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#707985", fontSize: 11 }}
              axisLine={{ stroke: "#30353D" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#707985", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              ticks={[0, 10, 20, 30, 40, 50]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1D21",
                borderColor: "#30353D",
                borderRadius: "8px",
                color: "#F5F7FA",
                fontSize: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
              itemStyle={{ color: ORANGE }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={ORANGE}
              strokeWidth={2.5}
              fill="url(#orangeAreaGrad)"
              dot={{ r: 3.5, fill: ORANGE, stroke: "#1A1D21", strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: "#FFFFFF", stroke: ORANGE, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Tasks By Status Chart ───────────────────────────
const defaultStatusData = [
  { name: "To Do", value: 12, color: "#FF7A00" },
  { name: "In Progress", value: 16, color: "#F5B942" },
  { name: "In Review", value: 8, color: "#E65100" },
  { name: "Done", value: 13, color: "#282D34" },
]

function TasksByStatusChart({ stats, navigate }: { stats?: any, navigate?: (path: string) => void }) {
  const dynamicData = stats?.tasksByStatus?.length
    ? stats.tasksByStatus.map((s: any, idx: number) => ({
        name: String(s.status).replace("_", " "),
        value: s._count.status,
        color: [ORANGE, STATUS_AMBER, "#E65100", STATUS_GREEN][idx % 4],
      }))
    : defaultStatusData

  const totalTasks = dynamicData.reduce((acc: number, item: any) => acc + item.value, 0) || 48

  return (
    <div
      onClick={() => navigate?.("/tasks")}
      className="rounded-xl border border-[#30353D] bg-[#1A1D21] p-5 transition-all duration-200 hover:border-[#FF7A00]/30 flex flex-col justify-between cursor-pointer active:scale-[0.98] active:-translate-y-0"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">Tasks by Status</h3>
        <ExternalLink className="h-3.5 w-3.5 text-[#707985] hover:text-[#FF7A00] transition-colors cursor-pointer" />
      </div>

      <div className="flex items-center justify-center gap-4 py-2">
        {/* Donut Chart with Center Text */}
        <div className="relative flex h-[160px] w-[160px] items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dynamicData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                stroke="none"
              >
                {dynamicData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute text-center pointer-events-none">
            <span className="text-2xl font-bold text-white leading-none block">{totalTasks}</span>
            <span className="text-[10px] uppercase font-semibold text-[#707985] tracking-wider">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs">
          {dynamicData.map((item: any) => (
            <div key={item.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-[#A6ADB8] font-medium">{item.name}</span>
              </div>
              <span className="font-semibold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Recent Projects Component ───────────────────────
function RecentProjectsCard({ navigate }: { navigate: (path: string) => void }) {
  const { data: realProjects } = useProjects()

  const defaultProjects = [
    {
      id: "p1",
      name: "Website Redesign",
      client: "Client: Acme Corp",
      ratio: "5/8",
      progress: 62.5,
    },
    {
      id: "p2",
      name: "Mobile App Development",
      client: "Client: TechSolutions",
      ratio: "3/10",
      progress: 30,
    },
    {
      id: "p3",
      name: "Branding & Design",
      client: "Client: Creative Studio",
      ratio: "7/12",
      progress: 58.3,
    },
    {
      id: "p4",
      name: "API Integration",
      client: "Client: NextGen",
      ratio: "4/8",
      progress: 50,
    },
  ]

  const projects = realProjects && realProjects.length > 0
    ? realProjects.slice(0, 4).map((p: any, idx: number) => ({
        id: p.id,
        name: p.name,
        client: p.client?.companyName ? `Client: ${p.client.companyName}` : defaultProjects[idx % 4].client,
        ratio: defaultProjects[idx % 4].ratio,
        progress: p.status === "COMPLETED" ? 100 : p.status === "ACTIVE" ? 65 : 40,
      }))
    : defaultProjects

  return (
    <div className="rounded-xl border border-[#30353D] bg-[#1A1D21] p-5 transition-all duration-200 hover:border-[#FF7A00]/30 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-[#30353D]/50">
        <h3 className="text-sm font-semibold text-white">Recent Projects</h3>
        <button
          onClick={() => navigate("/projects")}
          className="text-xs font-semibold text-[#FF7A00] hover:text-[#FF8F2B] transition-colors"
        >
          View all
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/projects`)}
            className="group flex items-center justify-between gap-4 rounded-lg p-2.5 hover:bg-[#20242A] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-[160px] sm:min-w-[200px]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/25 transition-transform group-hover:scale-105">
                <Folder className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate group-hover:text-[#FF7A00] transition-colors">
                  {p.name}
                </p>
                <p className="text-[11px] text-[#707985] truncate">{p.client}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-xs justify-end">
              <div className="h-1.5 w-24 sm:w-32 bg-[#282D34] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF9B38] rounded-full transition-all duration-500"
                  style={{ width: `${p.progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-[#A6ADB8] w-8 text-right tabular-nums">
                {p.ratio}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Live Activity Feed ──────────────────────────────
function LiveActivityCard({ navigate }: { navigate: (path: string) => void }) {
  const { data: realActivity } = useActivity()

  const defaultActivities = [
    {
      id: "1",
      name: "Rahul Sharma",
      action: "completed a task",
      time: "2m ago",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "2",
      name: "Priya Patel",
      action: "commented on Project Update",
      time: "5m ago",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "3",
      name: "Aman Joshi",
      action: "created a new task",
      time: "12m ago",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "4",
      name: "Sneha Kulkarni",
      action: "uploaded a file",
      time: "18m ago",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
    },
  ]

  const activities = realActivity && realActivity.length > 0
    ? realActivity.slice(0, 4).map((a: any, idx: number) => ({
        id: String(a.id || idx),
        name: a.user?.name || defaultActivities[idx % 4].name,
        action: a.message || defaultActivities[idx % 4].action,
        time: a.createdAt ? formatDistanceToNow(new Date(a.createdAt), { addSuffix: true }) : defaultActivities[idx % 4].time,
        avatar: defaultActivities[idx % 4].avatar,
      }))
    : defaultActivities

  return (
    <div className="rounded-xl border border-[#30353D] bg-[#1A1D21] p-5 transition-all duration-200 hover:border-[#FF7A00]/30 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-[#30353D]/50">
        <h3 className="text-sm font-semibold text-white">Live Activity</h3>
        <button
          onClick={() => navigate("/live-activity")}
          className="text-xs font-semibold text-[#FF7A00] hover:text-[#FF8F2B] transition-colors"
        >
          View all
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {activities.map((act) => (
          <div
            key={act.id}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-[#20242A] transition-colors"
          >
            <img
              src={act.avatar}
              alt={act.name}
              className="h-8 w-8 rounded-full object-cover border border-[#30353D]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#F5F7FA] leading-tight truncate">
                <span className="font-semibold text-white">{act.name}</span>{" "}
                <span className="text-[#A6ADB8]">{act.action}</span>
              </p>
              <p className="text-[10px] text-[#707985] mt-0.5">{act.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Team Members Component ──────────────────────────
function TeamMembersCard({ navigate }: { navigate: (path: string) => void }) {
  const members = [
    {
      id: 1,
      name: "Rahul Sharma",
      role: "Frontend Developer",
      status: "Online",
      statusColor: "#35D07F",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      name: "Priya Patel",
      role: "Backend Developer",
      status: "Online",
      statusColor: "#35D07F",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      name: "Aman Joshi",
      role: "UI/UX Designer",
      status: "Away",
      statusColor: "#FF7A00",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: 4,
      name: "Sneha Kulkarni",
      role: "Project Manager",
      status: "Online",
      statusColor: "#35D07F",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
    },
  ]

  return (
    <div className="rounded-xl border border-[#30353D] bg-[#1A1D21] p-5 transition-all duration-200 hover:border-[#FF7A00]/30 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-[#30353D]/50">
        <h3 className="text-sm font-semibold text-white">Team Members</h3>
        <button
          onClick={() => navigate("/team")}
          className="text-xs font-semibold text-[#FF7A00] hover:text-[#FF8F2B] transition-colors"
        >
          View all
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {members.map((m) => (
          <div
            key={m.id}
            className="group flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-[#20242A] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={m.avatar}
                alt={m.name}
                className="h-8 w-8 rounded-full object-cover border border-[#30353D]"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                <p className="text-[10px] text-[#707985] truncate">{m.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#A6ADB8]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: m.statusColor }}
                />
                <span className="hidden sm:inline">{m.status}</span>
              </div>
              <button className="text-[#707985] hover:text-white p-1 transition-colors">
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Task Distribution Bar Chart ─────────────────────
const taskDistributionData = [
  { day: "Mon", primary: 12, comparison: 4 },
  { day: "Tue", primary: 15, comparison: 6 },
  { day: "Wed", primary: 10, comparison: 3 },
  { day: "Thu", primary: 14, comparison: 5 },
  { day: "Fri", primary: 18, comparison: 7 },
  { day: "Sat", primary: 6, comparison: 2 },
  { day: "Sun", primary: 13, comparison: 3 },
]

function TaskDistributionChart() {
  return (
    <div className="rounded-xl border border-[#30353D] bg-[#1A1D21] p-5 transition-all duration-200 hover:border-[#FF7A00]/30 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Task Distribution</h3>
      </div>

      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={taskDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: "#707985", fontSize: 11 }}
              axisLine={{ stroke: "#30353D" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#707985", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              ticks={[0, 5, 10, 15, 20]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1D21",
                borderColor: "#30353D",
                borderRadius: "8px",
                color: "#F5F7FA",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="comparison" fill="#282D34" radius={[4, 4, 0, 0]} stackId="a" />
            <Bar dataKey="primary" fill={ORANGE} radius={[4, 4, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Upcoming Deadlines ──────────────────────────────
function UpcomingDeadlinesCard({ navigate }: { navigate: (path: string) => void }) {
  const deadlines = [
    {
      id: 1,
      title: "Landing Page Design",
      category: "Web Design",
      due: "Today",
      badgeColor: "text-[#FF5C5C]",
      iconColor: "bg-[#FF5C5C]/15 border-[#FF5C5C]/30 text-[#FF5C5C]",
    },
    {
      id: 2,
      title: "API Documentation",
      category: "API Integration",
      due: "Tomorrow",
      badgeColor: "text-[#FF7A00]",
      iconColor: "bg-[#FF7A00]/15 border-[#FF7A00]/30 text-[#FF7A00]",
    },
    {
      id: 3,
      title: "User Testing",
      category: "Mobile App",
      due: "18 Sep",
      badgeColor: "text-[#A6ADB8]",
      iconColor: "bg-[#282D34] border-[#30353D] text-[#A6ADB8]",
    },
    {
      id: 4,
      title: "Database Migration",
      category: "Backend",
      due: "20 Sep",
      badgeColor: "text-[#A6ADB8]",
      iconColor: "bg-[#282D34] border-[#30353D] text-[#A6ADB8]",
    },
  ]

  return (
    <div className="rounded-xl border border-[#30353D] bg-[#1A1D21] p-5 transition-all duration-200 hover:border-[#FF7A00]/30 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-[#30353D]/50">
        <h3 className="text-sm font-semibold text-white">Upcoming Deadlines</h3>
        <button
          onClick={() => navigate("/tasks")}
          className="text-xs font-semibold text-[#FF7A00] hover:text-[#FF8F2B] transition-colors"
        >
          View all
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {deadlines.map((d) => (
          <div
            key={d.id}
            onClick={() => navigate("/tasks")}
            className="group flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-[#20242A] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold", d.iconColor)}>
                <Calendar className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate group-hover:text-[#FF7A00] transition-colors">
                  {d.title}
                </p>
                <p className="text-[10px] text-[#707985] truncate">{d.category}</p>
              </div>
            </div>
            <span className={cn("text-xs font-semibold shrink-0", d.badgeColor)}>
              {d.due}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Quick Actions Component ─────────────────────────
function QuickActionsCard({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="rounded-xl border border-[#30353D] bg-[#1A1D21] p-5 transition-all duration-200 hover:border-[#FF7A00]/30 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Primary Action Button: Create Project */}
        <button
          onClick={() => navigate("/projects")}
          className="flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FF9100] p-4 text-white shadow-[0_4px_16px_rgba(255,122,0,0.25)] transition-all duration-180 hover:brightness-110 hover:-translate-y-0.5 cursor-pointer"
        >
          <Folder className="h-5 w-5 fill-white/20" />
          <span className="text-xs font-bold">Create Project</span>
        </button>

        {/* Secondary Action: Add Task */}
        <button
          onClick={() => navigate("/tasks")}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#30353D] bg-[#20242A] p-4 text-[#A6ADB8] transition-all duration-180 hover:border-[#FF7A00]/40 hover:text-white hover:-translate-y-0.5 cursor-pointer"
        >
          <CheckSquare className="h-5 w-5 text-[#707985]" />
          <span className="text-xs font-semibold">Add Task</span>
        </button>

        {/* Secondary Action: Invite Member */}
        <button
          onClick={() => navigate("/team")}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#30353D] bg-[#20242A] p-4 text-[#A6ADB8] transition-all duration-180 hover:border-[#FF7A00]/40 hover:text-white hover:-translate-y-0.5 cursor-pointer"
        >
          <UserPlus className="h-5 w-5 text-[#707985]" />
          <span className="text-xs font-semibold">Invite Member</span>
        </button>

        {/* Secondary Action: View Reports */}
        <button
          onClick={() => navigate("/live-activity")}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#30353D] bg-[#20242A] p-4 text-[#A6ADB8] transition-all duration-180 hover:border-[#FF7A00]/40 hover:text-white hover:-translate-y-0.5 cursor-pointer"
        >
          <BarChart3 className="h-5 w-5 text-[#707985]" />
          <span className="text-xs font-semibold">View Reports</span>
        </button>
      </div>
    </div>
  )
}

// ── Motivational / Productivity Card ────────────────
function MotivationalCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#30353D] bg-[#1A1D21] p-5 flex flex-col items-center justify-center text-center transition-all duration-200 hover:border-[#FF7A00]/40">
      {/* Mountain Illustration Artwork */}
      <div className="relative flex h-24 w-full items-center justify-center">
        <svg
          viewBox="0 0 160 90"
          className="h-24 w-40 drop-shadow-[0_0_20px_rgba(255,122,0,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Radial Glow */}
          <circle cx="80" cy="45" r="40" fill="url(#sunGlow)" />
          
          {/* Mountain Silhouettes */}
          <polygon points="80,18 45,78 115,78" fill="#1C1816" stroke="#FF7A00" strokeWidth="0.75" />
          <polygon points="80,18 68,78 115,78" fill="url(#mountainGradRight)" />
          <polygon points="80,18 45,78 68,78" fill="url(#mountainGradLeft)" />
          
          {/* Summit Flag */}
          <line x1="80" y1="18" x2="80" y2="7" stroke="#FF7A00" strokeWidth="1.5" />
          <polygon points="80,7 92,11 80,15" fill="#FF7A00" />

          {/* Glowing Stars / Particles */}
          <circle cx="48" cy="22" r="1" fill="#FFA544" />
          <circle cx="112" cy="26" r="1.2" fill="#FFA544" />
          <circle cx="35" cy="40" r="0.8" fill="#FF7A00" />
          <circle cx="125" cy="44" r="0.8" fill="#FF7A00" />
          <circle cx="70" cy="10" r="1" fill="#FFFFFF" />

          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FF7A00" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="mountainGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#151719" />
            </linearGradient>
            <linearGradient id="mountainGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF9100" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#20242A" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="mt-2 space-y-1">
        <h4 className="text-sm font-bold text-white leading-snug">
          Small steps every day<br />build big results.
        </h4>
        <p className="text-xs text-[#A6ADB8] font-medium">
          Keep pushing! 🚀
        </p>
      </div>
    </div>
  )
}

// ── Admin Dashboard (Main Reference Image UI) ────────
function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: stats } = useDashboardStats()

  const displayName = user?.name ? user.name.split(" ")[0] : "Aditya"
  const formattedDate = format(new Date(), "EEE, d MMM yyyy")

  return (
    <div className="space-y-6 animate-slide-up">
      {/* 1. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] shadow-[0_0_20px_rgba(255,122,0,0.15)]">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Good morning, {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-[#A6ADB8] mt-0.5">
              Here’s what’s happening with your agency today.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <span className="text-xs font-medium text-[#707985] hidden md:inline">
            {formattedDate}
          </span>
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2 rounded-lg bg-[#FF7A00] px-4 py-2 text-xs font-bold text-white shadow-[0_4px_16px_rgba(255,122,0,0.3)] transition-all duration-180 hover:bg-[#FF8F2B] hover:shadow-[0_6px_20px_rgba(255,122,0,0.4)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Cards & Notifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Total Projects"
          value={stats?.totalProjects ?? 12}
          trend="↑ 2 this week"
          trendPositive={true}
          icon={Folder}
          badgeIcon={ExternalLink}
          onClick={() => navigate("/projects")}
          onBadgeClick={() => navigate("/projects")}
        />
        <MetricCard
          title="Total Tasks"
          value={stats?.totalTasks ?? 48}
          trend="↑ 6 this week"
          trendPositive={true}
          icon={CheckSquare}
          badgeIcon={AlertTriangle}
          onClick={() => navigate("/tasks")}
          onBadgeClick={() => navigate("/tasks?filter=overdue")}
        />
        <MetricCard
          title="Overdue Tasks"
          value={stats?.overdueTasks ?? 4}
          trend="↑ 2 less than last week"
          trendPositive={false}
          icon={AlertTriangle}
          badgeIcon={Users}
          onClick={() => navigate("/tasks?filter=overdue")}
          onBadgeClick={() => navigate("/team")}
        />
        <NotificationsCard navigate={navigate} />
      </div>

      {/* 3. Middle Section: Charts & Lists Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Project Overview Line/Area Chart (Spans 2 columns) */}
        <div className="xl:col-span-2">
          <ProjectOverviewChart />
        </div>

        {/* Tasks by Status Donut Chart (Spans 1 column) */}
        <div className="xl:col-span-1">
          <TasksByStatusChart stats={stats} navigate={navigate} />
        </div>

        {/* Team Members Card (Spans 1 column) */}
        <div className="xl:col-span-1">
          <TeamMembersCard navigate={navigate} />
        </div>
      </div>

      {/* 4. Projects & Live Activity Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Recent Projects (Spans 2 columns) */}
        <div className="xl:col-span-2">
          <RecentProjectsCard navigate={navigate} />
        </div>

        {/* Live Activity (Spans 2 columns on desktop or 1 & 1) */}
        <div className="xl:col-span-2">
          <LiveActivityCard navigate={navigate} />
        </div>
      </div>

      {/* 5. Bottom Grid: Task Distribution, Deadlines, Quick Actions, Motivation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <TaskDistributionChart />
        <UpcomingDeadlinesCard navigate={navigate} />
        <QuickActionsCard navigate={navigate} />
        <MotivationalCard />
      </div>
    </div>
  )
}

// ── PM Dashboard (Graphite + Orange Styled) ──────────
function PMDashboard() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF7A00] mb-1">
            <span className="h-2 w-2 rounded-full bg-[#FF7A00] animate-pulse" />
            PM Command Center · Live Sync Active
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Your Projects, Your Progress.</h1>
          <p className="text-xs text-[#A6ADB8] mt-1">Managing assigned client accounts and team deliverables this sprint.</p>
        </div>
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 rounded-lg bg-[#FF7A00] px-4 py-2 text-xs font-bold text-white shadow-[0_4px_16px_rgba(255,122,0,0.3)] hover:bg-[#FF8F2B] transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Milestone</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <RecentProjectsCard navigate={navigate} />
        <TasksByStatusChart navigate={navigate} />
        <UpcomingDeadlinesCard navigate={navigate} />
        <QuickActionsCard navigate={navigate} />
      </div>
    </div>
  )
}

// ── Dev Dashboard (Graphite + Orange Styled) ─────────
function DevDashboard() {
  const navigate = useNavigate()
  const [timerRunning, setTimerRunning] = useState(false)
  const [time] = useState("24:52")

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF7A00] mb-1">
            <span className="h-2 w-2 rounded-full bg-[#35D07F] animate-pulse" />
            Developer Worklist
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Active Sprint Deliverables</h1>
          <p className="text-xs text-[#A6ADB8] mt-1">Focus on high-priority assigned tickets and local pull requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Pomodoro Focus Card */}
        <div className="rounded-xl border border-[#30353D] bg-[#1A1D21] p-5 flex flex-col items-center justify-between text-center">
          <div className="flex items-center justify-between w-full mb-3">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-[#FF7A00]" />
              <span className="text-xs font-semibold text-white">Pomodoro Focus</span>
            </div>
            <span className="text-[10px] font-bold text-[#707985]">SESSION #3</span>
          </div>

          <div className="my-4">
            <div className="text-4xl font-bold text-white font-mono tracking-wider">{time}</div>
            <p className="text-[10px] uppercase text-[#707985] tracking-widest mt-1">Deep Work Mode</p>
          </div>

          <button
            onClick={() => setTimerRunning((v) => !v)}
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-[#30353D] bg-[#20242A] py-2 text-xs font-semibold text-white hover:border-[#FF7A00]/40 transition-colors"
          >
            {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-[#FF7A00]" />}
            {timerRunning ? "Pause Session" : "Resume Session"}
          </button>
        </div>

        <UpcomingDeadlinesCard navigate={navigate} />
        <TaskDistributionChart />
        <MotivationalCard />
      </div>
    </div>
  )
}

// ── Main Dashboard Export ────────────────────────────
export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  if (role === "PROJECT_MANAGER") return <PMDashboard />
  if (role === "DEVELOPER") return <DevDashboard />
  return <AdminDashboard />
}
