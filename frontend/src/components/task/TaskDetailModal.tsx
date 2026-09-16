import { useState } from "react"
import { format } from "date-fns"
import { Loader2, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAddComment, useAssignTask, useDevelopers, useTask, useUpdateTaskStatus } from "@/api/hooks"
import { useAuthStore } from "@/store/authStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const

export function TaskDetailModal({
  open,
  onOpenChange,
  taskId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string | null
}) {
  const { data: task, isLoading } = useTask(open ? taskId : null)
  const { user } = useAuthStore()
  const updateStatus = useUpdateTaskStatus()
  const addComment = useAddComment()
  const assign = useAssignTask()
  const { data: developers } = useDevelopers()
  const [comment, setComment] = useState("")
  const canManage = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task?.title || "Task"}</DialogTitle>
        </DialogHeader>
        {isLoading || !task ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">{task.description || "No description"}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{task.status.replace("_", " ")}</Badge>
              <Badge variant="secondary">{task.priority}</Badge>
              <Badge variant="outline">{task.project.name}</Badge>
              {task.isOverdue && <Badge variant="destructive">Overdue</Badge>}
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Assignee:</span>{" "}
                {task.assignedDeveloper?.name || "Unassigned"}
              </div>
              <div>
                <span className="text-muted-foreground">Due:</span>{" "}
                {task.dueDate ? format(new Date(task.dueDate), "PPp") : "None"}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Change status</Label>
              <Select
                value={task.status}
                onValueChange={(status) => updateStatus.mutate({ id: task.id, status })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {canManage && (
              <div className="space-y-2">
                <Label>Assign developer</Label>
                <Select
                  value={task.assignedDeveloperId || "unassigned"}
                  onValueChange={(v) =>
                    assign.mutate({
                      id: task.id,
                      assignedDeveloperId: v === "unassigned" ? null : v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
            )}

            <Separator />
            <div>
              <h4 className="mb-3 text-sm font-semibold">Comments</h4>
              <div className="max-h-48 space-y-3 overflow-y-auto">
                {(task.comments ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                )}
                {(task.comments ?? []).map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={c.user?.avatarUrl || undefined} />
                      <AvatarFallback>{c.user?.name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {c.user?.name}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {format(new Date(c.createdAt), "PPp")}
                        </span>
                      </div>
                      <p className="text-sm">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!comment.trim()) return
                  addComment.mutate(
                    { taskId: task.id, content: comment.trim() },
                    { onSuccess: () => setComment("") }
                  )
                }}
              >
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[60px]"
                />
                <Button type="submit" disabled={addComment.isPending || !comment.trim()}>
                  {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">Activity</h4>
              <div className="max-h-32 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                {(task.activityLogs ?? []).map((a) => (
                  <div key={a.id}>
                    {a.message} · {format(new Date(a.createdAt), "PPp")}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
