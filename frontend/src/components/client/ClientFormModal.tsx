import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateClient, useUpdateClient } from "@/api/hooks"
import type { Client } from "@/lib/types"

const schema = z.object({
  name: z.string().min(2),
  companyName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
})

type FormValues = z.infer<typeof schema>

export function ClientFormModal({
  open,
  onOpenChange,
  client,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
}) {
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", companyName: "", email: "", phone: "", status: "ACTIVE" },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: client?.name ?? "",
        companyName: client?.companyName ?? "",
        email: client?.email ?? "",
        phone: client?.phone ?? "",
        status: client?.status ?? "ACTIVE",
      })
    }
  }, [open, client, form])

  const pending = createClient.isPending || updateClient.isPending

  const onSubmit = async (values: FormValues) => {
    const payload = { ...values, phone: values.phone || undefined }
    if (client) await updateClient.mutateAsync({ id: client.id, ...payload })
    else await createClient.mutateAsync(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "New Client"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company</Label>
            <Input id="companyName" {...form.register("companyName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Contact name</Label>
            <Input id="name" {...form.register("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} />
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
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {client ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
