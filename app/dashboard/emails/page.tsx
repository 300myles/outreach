"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Loader, Mail } from "lucide-react"

interface EmailLog {
  _id: number
  recipient_email: string
  subject: string
  sender_email: string
  status: string
  sent_at: string
  open_count: number
  click_count: number
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    fetchEmails()
    const interval = setInterval(fetchEmails, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchEmails = async () => {
    try {
      const response = await fetch("/api/emails")
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails)
      }
    } catch (error) {
      console.error("Error fetching emails:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-900"
      case "delivered":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900"
      case "opened":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900"
      case "clicked":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900"
    }
  }

  const filteredEmails = emails.filter((email) => {
    const matchesSearch = email.recipient_email.includes(searchTerm) || email.subject.includes(searchTerm)
    const matchesFilter = filterStatus === "all" || email.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Logs</h1>
        <p className="text-muted-foreground">Track all sent emails and their delivery status</p>
      </div>

      <Card className="border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Email History ({filteredEmails.length})</CardTitle>
          <CardDescription>Monitor email sending activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Search by email or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-4 h-4 animate-spin" />
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Mail className="w-12 h-12 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No emails found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Opens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmails.map((email) => (
                    <TableRow key={email._id} className="border-border/50 hover:bg-muted/30">
                      <TableCell className="font-medium text-sm">{email.recipient_email}</TableCell>
                      <TableCell className="max-w-xs truncate">{email.subject}</TableCell>
                      <TableCell className="text-sm">{email.sender_email}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(email.status)}>{email.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(email.sent_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">{email.open_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
