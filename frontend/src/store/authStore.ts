import { create } from "zustand"

interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER"
  avatarUrl?: string | null
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  setLoading: (isLoading: boolean) => void
  setToken: (token: string) => void
}

const STORAGE_KEY = "agencyflow-auth"

function loadPersisted(): Pick<AuthState, "user" | "token" | "isAuthenticated"> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { user: null, token: null, isAuthenticated: false }
    const parsed = JSON.parse(raw) as { user: User; token: string }
    if (parsed?.user && parsed?.token) {
      return { user: parsed.user, token: parsed.token, isAuthenticated: true }
    }
  } catch {
    /* ignore */
  }
  return { user: null, token: null, isAuthenticated: false }
}

const persisted = loadPersisted()

export const useAuthStore = create<AuthState>((set) => ({
  user: persisted.user,
  token: persisted.token,
  isAuthenticated: persisted.isAuthenticated,
  isLoading: true,
  setAuth: (user, token) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
    set({ user, token, isAuthenticated: true, isLoading: false })
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
  },
  setLoading: (isLoading) => set({ isLoading }),
  setToken: (token) => {
    const user = useAuthStore.getState().user
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
    }
    set({ token })
  },
}))
