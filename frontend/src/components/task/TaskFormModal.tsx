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
import { useCreateTask, useDevelopers, useProjects, useUpdateTask } from "@/api/hooks"
import type { Task } from "@/lib/types"

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
  assignedDeveloperId: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  dueDate: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function toLocalInput(iso?: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toIso(value?: string) {
  if (!value) return undefined
  return new Date(value).toISOString()
}

export function TaskFormModal({
  open,
  onOpenChange,
  task,
  defaultProjectId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  defaultProjectId?: string
}) {
  const { data: projects } = useProjects()
  const { data: developers } = useDevelopers()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      projectId: defaultProjectId || "",
      assignedDeveloperId: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
    },
  })

  useEffect(() => {
    if (open) {
      const defaultProj = task?.projectId || defaultProjectId || (projects && projects[0]?.id) || "prj-01"
      form.reset({
        title: task?.title ?? "",
        description: task?.description ?? "",
        projectId: defaultProj,
        assignedDeveloperId: task?.assignedDeveloperId ?? "",
        status: task?.status ?? "TODO",
        priority: task?.priority ?? "MEDIUM",
        dueDate: toLocalInput(task?.dueDate),
      })
    }
  }, [open, task, defaultProjectId, projects?.length])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        title: values.title,
        description: values.description || undefined,
        assignedDeveloperId: values.assignedDeveloperId || null,
        priority: values.priority,
        dueDate: toIso(values.dueDate) ?? null,
      }
      const resolvedProj = values.projectId || defaultProjectId || (projects && projects[0]?.id) || "prj-01"
      if (task) {
        await updateTask.mutateAsync({ id: task.id, ...payload })
      } else {
        await createTask.mutateAsync({
          ...payload,
          projectId: resolvedProj,
          status: values.status,
        })
      }
      onOpenChange(false)
    } catch (err: any) {
      form.setError("root", { message: err?.message || "Failed to save task" })
    }
  }

  const pending = createTask.isPending || updateTask.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} />
          </div>
          {!task && (
            <div className="space-y-2">
              <Label>Project</Label>
              <Select
                value={form.watch("projectId")}
                onValueChange={(v) => form.setValue("projectId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {(projects ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.projectId && (
                <p className="text-sm text-destructive">{form.formState.errors.projectId.message}</p>
              )}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(v) => form.setValue("priority", v as FormValues["priority"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v as FormValues["status"])}
                disabled={!!task}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select
              value={form.watch("assignedDeveloperId") || "unassigned"}
              onValueChange={(v) => form.setValue("assignedDeveloperId", v === "unassigned" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {(developers ?? []).map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="datetime-local" {...form.register("dueDate")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {task ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
