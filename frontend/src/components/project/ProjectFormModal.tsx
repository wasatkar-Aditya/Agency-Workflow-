import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClients, useCreateProject, useUpdateProject, useUsers } from "@/api/hooks"
import { useAuthStore } from "@/store/authStore"
import type { Project } from "@/lib/types"

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  clientId: z.string().min(1, "Client is required"),
  ownerId: z.string().min(1, "Owner is required"),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]),
  dueDate: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function toLocalDate(iso?: string | null) {
  if (!iso) return ""
  return iso.slice(0, 16)
}

export function ProjectFormModal({
  open,
  onOpenChange,
  project,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
}) {
  const { user } = useAuthStore()
  const isAdmin = user?.role === "ADMIN"
  const { data: clients } = useClients()
  const { data: users } = useUsers(isAdmin)
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  
  const clientList = clients && clients.length > 0 ? clients : [
    { id: "clt-01", name: "John Miller", companyName: "TechNova Solutions", email: "contact@technova.com", status: "ACTIVE" as const },
    { id: "clt-02", name: "Elena Rostova", companyName: "Apex Retail Group", email: "elena@apexretail.io", status: "ACTIVE" as const },
  ]

  const owners = isAdmin
    ? (users && users.length > 0 ? users.filter((u) => u.role === "ADMIN" || u.role === "PROJECT_MANAGER") : [
        { id: user?.id || "usr-admin-01", name: user?.name || "Alex Admin", email: user?.email || "admin@agencyflow.dev", role: "ADMIN" as const },
      ])
    : user
      ? [user]
      : [{ id: "usr-admin-01", name: "Alex Admin", email: "admin@agencyflow.dev", role: "ADMIN" as const }]

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      clientId: "",
      ownerId: user?.id ?? "",
      status: "PLANNING",
      dueDate: "",
    },
  })

  useEffect(() => {
    if (open) {
      const defaultClientId = project?.clientId || clientList[0]?.id || ""
      const defaultOwnerId = project?.ownerId || user?.id || owners[0]?.id || ""

      form.reset({
        name: project?.name ?? "",
        description: project?.description ?? "",
        clientId: defaultClientId,
        ownerId: defaultOwnerId,
        status: project?.status ?? "ACTIVE",
        dueDate: toLocalDate(project?.dueDate),
      })
    }
  }, [open, project, user?.id, clientList.length, owners.length])

  const pending = createProject.isPending || updateProject.isPending

  const onSubmit = async (values: FormValues) => {
    try {
      const dueDate = values.dueDate ? new Date(values.dueDate).toISOString() : undefined
      const resolvedClientId = values.clientId || clientList[0]?.id || "clt-01"
      const resolvedOwnerId = values.ownerId || user?.id || owners[0]?.id || "usr-admin-01"

      if (project) {
        await updateProject.mutateAsync({
          id: project.id,
          name: values.name,
          description: values.description || null,
          clientId: resolvedClientId,
          ownerId: resolvedOwnerId,
          status: values.status,
          dueDate: dueDate ?? null,
        })
      } else {
        await createProject.mutateAsync({
          name: values.name,
          description: values.description || undefined,
          clientId: resolvedClientId,
          ownerId: resolvedOwnerId,
          status: values.status,
          dueDate,
        })
      }
      onOpenChange(false)
    } catch (err: any) {
      form.setError("root", { message: err?.message || "Failed to save project" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" placeholder="e.g. Mobile Banking Redesign" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Project deliverables, tech stack, and objectives..." {...form.register("description")} />
          </div>
          <div className="space-y-2">
            <Label>Client *</Label>
            <Select value={form.watch("clientId")} onValueChange={(v) => form.setValue("clientId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clientList.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.clientId && (
              <p className="text-sm text-destructive">{form.formState.errors.clientId.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Owner *</Label>
              <Select
                value={form.watch("ownerId")}
                onValueChange={(v) => form.setValue("ownerId", v)}
                disabled={!isAdmin && owners.length <= 1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.ownerId && (
                <p className="text-sm text-destructive">{form.formState.errors.ownerId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v as FormValues["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="datetime-local" {...form.register("dueDate")} />
          </div>

          {form.formState.errors.root && (
            <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold">
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {project ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
