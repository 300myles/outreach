"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, Loader, Trash2, Download, Mail } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { EmailPreviewModal } from "@/components/email-preview-modal"

interface Lead {
  _id: string
  name: string
  email: string
  phone: string
  company: string
  status: string
  send_count: number
  created_at: string
}

export default function LeadsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [leads, setLeads] = useState<Lead[]>([])
  const [fetchingLeads, setFetchingLeads] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [leadEmails, setLeadEmails] = useState<any[]>([])
  const [fetchingEmails, setFetchingEmails] = useState(false)
  const [isEmailHistoryOpen, setIsEmailHistoryOpen] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/leads")
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads)
      }
    } catch (error) {
      console.error("Error fetching leads:", error)
    } finally {
      setFetchingLeads(false)
    }
  }

  const handleUpload = async () => {
    if (!csvText.trim()) {
      toast({ title: "Error", description: "Please enter lead data", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/leads/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: csvText }),
      })

      if (!response.ok) throw new Error("Upload failed")

      const result = await response.json()
      toast({
        title: "Success",
        description: `Imported ${result.count} leads`,
      })
      setCsvText("")
      await fetchLeads()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload leads",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLead = async (id: string) => {
    try {
      const response = await fetch(`/api/leads/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Success", description: "Lead deleted" })
        await fetchLeads()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
    }
  }

  const fetchLeadEmails = async (lead: Lead) => {
    setSelectedLead(lead)
    setIsEmailHistoryOpen(true)
    setFetchingEmails(true)
    try {
      const response = await fetch(`/api/leads/${lead._id}/emails`)
      if (response.ok) {
        const data = await response.json()
        setLeadEmails(data.emails)
      }
    } catch (error) {
      console.error("Error fetching emails:", error)
    } finally {
      setFetchingEmails(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "interested":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leads</h1>
        <p className="text-muted-foreground">Import and manage your contact list</p>
      </div>

      <Card className="border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Upload Leads</CardTitle>
          <CardDescription>Paste CSV data or upload a file with your leads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Paste CSV Data</Label>
            <Textarea
              placeholder="restaurant_name,email,phone,city&#10;Burger King,contact@burgerking.com,555-1234,New York"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="h-32 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Columns: restaurant_name, email, phone, city, website (optional), notes (optional)
            </p>
          </div>
          <Button onClick={handleUpload} disabled={loading} className="gap-2">
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            <Upload className="w-4 h-4" />
            Import Leads
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Leads ({leads.length})</CardTitle>
            <CardDescription>All imported contacts</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {fetchingLeads ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-4 h-4 animate-spin" />
            </div>
          ) : leads.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No leads yet. Import some to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Sends</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead._id} className="border-border/50 hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{lead.name}</span>
                          <span className="text-xs text-muted-foreground">{lead.company}</span>
                        </div>
                      </TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell className="text-sm">{lead.phone}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>{lead.status || "new"}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchLeadEmails(lead)}
                          className="gap-2 hover:bg-muted"
                        >
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs">{lead.send_count || 0}</span>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLead(lead._id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEmailHistoryOpen} onOpenChange={setIsEmailHistoryOpen}>
        <DialogContent className="sm:max-w-[500px] border-border/50 max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Email History</DialogTitle>
            <DialogDescription>Messages sent to {selectedLead?.email}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {fetchingEmails ? (
              <div className="flex justify-center py-8">
                <Loader className="w-6 h-6 animate-spin" />
              </div>
            ) : leadEmails.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No emails sent to this lead yet.</p>
            ) : (
              <div className="space-y-3">
                {leadEmails.map((email) => (
                  <button
                    key={email._id}
                    onClick={() => setSelectedEmail(email)}
                    className="w-full text-left p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold truncate flex-1 pr-2">{email.subject}</span>
                      <Badge variant="outline" className="text-[9px] h-4">
                        {email.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(email.createdAt).toLocaleString()}
                      </span>
                      <Mail className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EmailPreviewModal log={selectedEmail} isOpen={!!selectedEmail} onClose={() => setSelectedEmail(null)} />
    </div>
  )
}
