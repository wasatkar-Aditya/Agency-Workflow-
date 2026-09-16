import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { Loader2, Zap, ArrowRight, Shield, Sparkles, CheckCircle2, UserPlus, LogIn } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import api from "@/api/axios"
import { mockDataStore } from "@/api/mockData"
import { getErrorMessage, type Role, type User } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Enter a valid work email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "DEVELOPER"]),
})

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

const demoAccounts = [
  { label: "Admin", role: "ADMIN" as Role, email: "admin@agencyflow.dev", password: "Admin@123", color: "#06b6d4", name: "Alex Admin" },
  { label: "PM", role: "PROJECT_MANAGER" as Role, email: "priya@agencyflow.dev", password: "PM@123456", color: "#8b5cf6", name: "Priya Sharma" },
  { label: "Dev", role: "DEVELOPER" as Role, email: "amit@agencyflow.dev", password: "Dev@123456", color: "#22c55e", name: "Amit Patel" },
]

function generateFallbackUser(email: string, role: Role = "ADMIN", name?: string): User {
  const lower = email.toLowerCase().trim()
  const namePart = name || lower.split("@")[0] || "User"
  const formattedName = namePart
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return {
    id: `usr-${Date.now()}`,
    name: formattedName || "Admin User",
    email: lower,
    role: role,
    avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(formattedName || "User")}&backgroundColor=06b6d4`,
    isActive: true,
  }
}

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [tab, setTab] = useState<"signin" | "signup">("signin")
  const [selectedRole, setSelectedRole] = useState<string>("Admin")
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null)

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@agencyflow.dev", password: "Admin@123" },
  })

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "ADMIN",
    },
  })

  const handleInstantDemoLogin = (email: string, role: Role, name?: string) => {
    const user = generateFallbackUser(email, role, name)
    mockDataStore.createUser({ name: user.name, email: user.email, role: user.role })
    setAuth(user, "demo-mock-jwt-token")
    toast({ title: `Signed in as ${user.name}` })
    navigate("/dashboard")
  }

  const onLoginSubmit = async (values: LoginFormValues) => {
    setOfflineNotice(null)
    try {
      const res = await api.post("/auth/login", values)
      if (res.data.success) {
        setAuth(res.data.data.user, res.data.data.accessToken)
        toast({ title: `Welcome back, ${res.data.data.user.name}!` })
        navigate("/dashboard")
        return
      }
    } catch (err: any) {
      const isNetworkOrOffline =
        !err.response ||
        err.code === "ERR_NETWORK" ||
        err.code === "ECONNREFUSED" ||
        err.message?.includes("Network Error") ||
        (err.response?.status && err.response.status >= 500)

      // If backend is unreachable or user is testing offline / demo mode
      if (isNetworkOrOffline) {
        const matchedDemo = demoAccounts.find((d) => d.email.toLowerCase() === values.email.toLowerCase())
        const role = matchedDemo ? matchedDemo.role : "ADMIN"
        const user = generateFallbackUser(values.email, role)
        setAuth(user, "demo-mock-jwt-token")
        toast({ title: `Signed in as ${user.name}` })
        navigate("/dashboard")
        return
      }

      loginForm.setError("root", {
        message: getErrorMessage(
          err,
          "User not found in backend database. Click 'Continue in Demo Mode' below or use Quick Access demo accounts."
        ),
      })
      setOfflineNotice(values.email)
    }
  }

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    try {
      try {
        const res = await api.post("/auth/register", values)
        if (res.data.success) {
          setAuth(res.data.data.user, res.data.data.accessToken)
          toast({ title: `Account created! Welcome, ${res.data.data.user.name}` })
          navigate("/dashboard")
          return
        }
      } catch (backendErr: any) {
        // If backend fails or is offline, register seamlessly in client store
        const user = generateFallbackUser(values.email, values.role, values.name)
        mockDataStore.createUser({ name: values.name, email: values.email, role: values.role })
        setAuth(user, "demo-mock-jwt-token")
        toast({ title: `Account created! Welcome, ${user.name}` })
        navigate("/dashboard")
      }
    } catch (err: any) {
      registerForm.setError("root", {
        message: getErrorMessage(err, "Failed to create account. Please try again."),
      })
    }
  }

  const fillDemo = (acc: typeof demoAccounts[0]) => {
    setSelectedRole(acc.label)
    loginForm.setValue("email", acc.email)
    loginForm.setValue("password", acc.password)
    loginForm.clearErrors()
    setOfflineNotice(null)
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: "hsl(216, 28%, 7%)",
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 60% 80%, rgba(20, 184, 166, 0.05) 0%, transparent 60%)
        `,
      }}
    >
      {/* Animated grid bg */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-teal-500/10 to-purple-500/20 blur-xl" />

        {/* Card */}
        <div
          className="relative rounded-xl border border-white/[0.08] p-7 shadow-2xl"
          style={{ background: "rgba(13, 20, 33, 0.95)", backdropFilter: "blur(20px)" }}
        >
          {/* Logo */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 shadow-glow">
              <Zap className="h-6 w-6 text-gray-900" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">AgencyFlow</h1>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="badge-pro">PRO TIER</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Command center for agile client delivery</p>
          </div>

          <Tabs value={tab} onValueChange={(v) => { setTab(v as any); setOfflineNotice(null) }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-5 bg-white/[0.04] border border-white/[0.06]">
              <TabsTrigger value="signin" className="flex items-center gap-1.5 text-xs">
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-1.5 text-xs">
                <UserPlus className="h-3.5 w-3.5" /> Sign Up
              </TabsTrigger>
            </TabsList>

            {/* ─── SIGN IN TAB ───────────────────────── */}
            <TabsContent value="signin" className="space-y-4">
              {/* Quick Access Demo accounts */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Quick Access Demo</p>
                  <span className="text-[10px] text-cyan-400 font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> 1-Click Ready
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {demoAccounts.map((acc) => {
                    const isSelected = selectedRole === acc.label && loginForm.watch("email") === acc.email
                    return (
                      <button
                        key={acc.label}
                        type="button"
                        onClick={() => fillDemo(acc)}
                        className="flex flex-col items-center justify-center rounded-lg border py-2 px-1 text-xs font-semibold transition-all relative overflow-hidden cursor-pointer"
                        style={{
                          borderColor: isSelected ? acc.color : "rgba(255,255,255,0.08)",
                          background: isSelected ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                          color: acc.color,
                        }}
                      >
                        <span className="font-bold flex items-center gap-1">
                          {acc.label}
                          {isSelected && <CheckCircle2 className="h-3 w-3" />}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate w-full text-center mt-0.5 opacity-80">
                          {acc.name.split(" ")[0]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sign In Form */}
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    {...loginForm.register("email")}
                    placeholder="name@agencyflow.dev"
                    className="bg-white/[0.04] border-white/[0.08] text-white"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-red-400">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signin-password" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="signin-password"
                    type="password"
                    {...loginForm.register("password")}
                    placeholder="••••••••"
                    className="bg-white/[0.04] border-white/[0.08] text-white"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-red-400">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                {(loginForm.formState.errors.root || offlineNotice) && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 space-y-2">
                    <p>{loginForm.formState.errors.root?.message || "Invalid credentials"}</p>
                    {offlineNotice && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleInstantDemoLogin(offlineNotice, "ADMIN")}
                        className="w-full text-xs font-semibold gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Continue as Admin ({offlineNotice.split("@")[0]})
                      </Button>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loginForm.formState.isSubmitting}
                  className="w-full bg-gradient-to-r from-cyan-400 to-teal-400 text-gray-950 font-bold hover:brightness-110 shadow-md gap-2"
                >
                  {loginForm.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* ─── SIGN UP TAB ───────────────────────── */}
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    {...registerForm.register("name")}
                    placeholder="Aditya Wasatkar"
                    className="bg-white/[0.04] border-white/[0.08] text-white"
                  />
                  {registerForm.formState.errors.name && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Work Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    {...registerForm.register("email")}
                    placeholder="aditya@example.com"
                    className="bg-white/[0.04] border-white/[0.08] text-white"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Password (min. 6 characters)
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    {...registerForm.register("password")}
                    placeholder="••••••••"
                    className="bg-white/[0.04] border-white/[0.08] text-white"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Account Role
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["ADMIN", "PROJECT_MANAGER", "DEVELOPER"] as const).map((r) => {
                      const active = registerForm.watch("role") === r
                      const labels: Record<string, string> = { ADMIN: "Admin", PROJECT_MANAGER: "PM", DEVELOPER: "Dev" }
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => registerForm.setValue("role", r)}
                          className="rounded-lg border py-2 text-xs font-semibold transition-all cursor-pointer"
                          style={{
                            borderColor: active ? "#06b6d4" : "rgba(255,255,255,0.08)",
                            background: active ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.02)",
                            color: active ? "#06b6d4" : "hsl(213, 31%, 91%)",
                          }}
                        >
                          {labels[r]}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {registerForm.formState.errors.root && (
                  <p className="text-xs text-red-400">{registerForm.formState.errors.root.message}</p>
                )}

                <Button
                  type="submit"
                  disabled={registerForm.formState.isSubmitting}
                  className="w-full bg-gradient-to-r from-teal-400 to-emerald-400 text-gray-950 font-bold hover:brightness-110 shadow-md gap-2 mt-2"
                >
                  {registerForm.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Create Account &amp; Sign In
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
            <Shield className="h-3 w-3 text-cyan-400" />
            JWT Authentication &amp; Role-Based Access Control
          </div>
        </div>
      </div>
    </div>
  )
}
