import { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, Zap } from "lucide-react"
import { useAuthStore } from "./store/authStore"
import api from "./api/axios"
import { disconnectSocket, initSocket } from "./api/socket"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { AppLayout } from "./components/layout/AppLayout"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Tasks from "./pages/Tasks"
import Projects from "./pages/Projects"
import ProjectDetail from "./pages/ProjectDetail"
import Clients from "./pages/Clients"
import Users from "./pages/Users"
import LiveActivity from "./pages/LiveActivity"
import Team from "./pages/Team"
import NotFound from "./pages/NotFound"

function LoadingScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3" style={{ background: "hsl(216, 28%, 7%)" }}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 animate-glow-pulse">
        <Zap className="h-6 w-6 text-gray-900" />
      </div>
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
        <span className="text-sm text-muted-foreground font-medium">Loading AgencyFlow…</span>
      </div>
    </div>
  )
}

function App() {
  const { setAuth, logout, setLoading, isAuthenticated, isLoading, token } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    const checkAuth = async () => {
      const currentToken = useAuthStore.getState().token
      if (!currentToken) {
        setLoading(false)
        return
      }

      // If demo session, preserve authenticated state
      if (currentToken.startsWith("demo-")) {
        setLoading(false)
        return
      }

      try {
        const { data } = await api.get("/auth/me")
        if (data.success) {
          setAuth(data.data, currentToken)
        } else {
          logout()
        }
      } catch (err: any) {
        // Only log out if backend actively rejects the token with 401
        if (err?.response?.status === 401) {
          logout()
        }
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [setAuth, logout, setLoading])

  useEffect(() => {
    if (isAuthenticated && token) {
      initSocket(token, queryClient)
    } else {
      disconnectSocket()
    }
    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated, token, queryClient])

  if (isLoading) return <LoadingScreen />

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Core routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />

        {/* Projects — Admin + PM only */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute roles={["ADMIN", "PROJECT_MANAGER"]}>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute roles={["ADMIN", "PROJECT_MANAGER"]}>
              <ProjectDetail />
            </ProtectedRoute>
          }
        />

        {/* Clients — Admin + PM only */}
        <Route
          path="/clients"
          element={
            <ProtectedRoute roles={["ADMIN", "PROJECT_MANAGER"]}>
              <Clients />
            </ProtectedRoute>
          }
        />

        {/* Users/Settings — Admin only */}
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        {/* Live Activity — all roles */}
        <Route path="/live-activity" element={<LiveActivity />} />

        {/* Team — Admin + PM only */}
        <Route
          path="/team"
          element={
            <ProtectedRoute roles={["ADMIN", "PROJECT_MANAGER"]}>
              <Team />
            </ProtectedRoute>
          }
        />

        {/* Notifications — redirect to dashboard for now */}
        <Route path="/notifications" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
