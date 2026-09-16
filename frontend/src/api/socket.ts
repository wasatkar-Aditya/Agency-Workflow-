import { io, type Socket } from "socket.io-client"
import type { QueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "")

let socket: Socket | null = null

export function initSocket(token: string, queryClient: QueryClient) {
  disconnectSocket()
  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
    transports: ["websocket", "polling"],
  })

  socket.on("notification.created", (notification: { title?: string; message?: string }) => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] })
    queryClient.invalidateQueries({ queryKey: ["notifications-unread"] })
    toast({
      title: notification.title || "Notification",
      description: notification.message,
    })
  })

  socket.on("activity.created", () => {
    queryClient.invalidateQueries({ queryKey: ["activity"] })
  })

  socket.on("presence.user_online", () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
  })

  socket.on("presence.user_offline", () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
  })

  socket.on("task.overdue", (payload: { title?: string }) => {
    toast({
      variant: "destructive",
      title: "Task overdue",
      description: payload.title ? `"${payload.title}" is overdue` : "A task is overdue",
    })
    queryClient.invalidateQueries({ queryKey: ["tasks"] })
  })
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}

export function joinProjectRoom(projectId: string) {
  socket?.emit("join:project", projectId)
}

export function leaveProjectRoom(projectId: string) {
  socket?.emit("leave:project", projectId)
}

export function getSocket() {
  return socket
}
