import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteTask } from "@/api/hooks"

export function DeleteTaskDialog({
  open,
  onOpenChange,
  taskId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string | null
}) {
  const del = useDeleteTask()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The task will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!taskId || del.isPending}
            onClick={async () => {
              if (!taskId) return
              await del.mutateAsync(taskId)
              onOpenChange(false)
            }}
          >
            {del.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
