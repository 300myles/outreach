"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mail, Calendar, User, Eye } from "lucide-react"

interface EmailLog {
  _id: string
  recipient_email: string
  subject: string
  body: string
  status: string
  sent_at: string
  opened_at?: string
  clicked_at?: string
  tracking_id?: string
}

export function EmailPreviewModal({
  log,
  isOpen,
  onClose,
}: {
  log: EmailLog | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!log) return null

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case "opened":
  //       return <CheckCircle2 className="w-4 h-4 text-blue-500" />
  //     case "sent":
  //       return <CheckCircle2 className="w-4 h-4 text-green-500" />
  //     case "failed":
  //       return <AlertCircle className="w-4 h-4 text-red-500" />
  //     default:
  //       return <Clock className="w-4 h-4 text-muted-foreground" />
  //   }
  // }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border-border/50">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Details
            </DialogTitle>
            <Badge variant={log.status === "opened" ? "default" : "secondary"} className="capitalize">
              {log.status}
            </Badge>
          </div>
          <DialogDescription>Historical record of email sent to {log.recipient_email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-xs bg-muted/30 p-3 rounded-lg border border-border/50">
            <div className="space-y-2">
              <p className="flex items-center gap-2 font-medium">
                <Calendar className="w-3 h-3" /> Sent: {new Date(log.sent_at).toLocaleString()}
              </p>
              {log.opened_at && (
                <p className="flex items-center gap-2 font-medium text-blue-600">
                  <Eye className="w-3 h-3" /> Opened: {new Date(log.opened_at).toLocaleString()}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <User className="w-3 h-3" /> To: {log.recipient_email}
              </p>
              <p className="truncate text-muted-foreground">ID: {log._id}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Subject</h4>
            <div className="p-3 bg-background border border-border/50 rounded-md text-sm">{log.subject}</div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Content</h4>
            <ScrollArea className="h-[250px] p-4 bg-background border border-border/50 rounded-md">
              <div
                className="text-sm prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: log.body.replace(/\n/g, "<br/>") }}
              />
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
