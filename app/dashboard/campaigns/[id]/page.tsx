"use client"

import { Suspense, useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader, Send, Eye, LinkIcon, AlertCircle, Search, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CampaignDetail {
  id: number
  name: string
  subject: string
  status: string
  total_recipients: number
  created_at: string
  started_at: string
  completed_at: string
}

interface CampaignStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  failed: number
}

interface EmailDetail {
  _id: number
  recipient_email: string
  subject: string
  status: string
  sent_at: string
  opened_at: string | null
  clicked_at: string | null
  open_count: number
  click_count: number
}

interface Lead {
  _id: string
  name: string
  email: string
  status: string
  send_count: number
  company: string
}

function CampaignDetailContent() {
  const params = useParams()
  const { toast } = useToast()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [emails, setEmails] = useState<EmailDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [selectedSenderId, setSelectedSenderId] = useState("")
  const [senders, setSenders] = useState<any[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sendCountFilter, setSendCountFilter] = useState("all")
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  useEffect(() => {
    fetchCampaignDetails()
    fetchSenders()
    fetchLeads()
  }, [campaignId])

  const fetchCampaignDetails = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`)
      if (response.ok) {
        const data = await response.json()
        setCampaign(data.campaign)
        setStats(data.stats)
        setEmails(data.emails)
      }
    } catch (error) {
      console.error("Error fetching campaign:", error)
      toast({
        title: "Error",
        description: "Failed to load campaign details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSenders = async () => {
    try {
      const response = await fetch("/api/senders")
      if (response.ok) {
        const data = await response.json()
        setSenders(data.senders)
      }
    } catch (error) {
      console.error("Error fetching senders:", error)
      toast({
        title: "Error",
        description: "Failed to load sender accounts.",
        variant: "destructive",
      })
    }
  }

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/leads")
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads)
      }
    } catch (error) {
      console.error("Error fetching leads:", error)
      toast({
        title: "Error",
        description: "Failed to load leads.",
        variant: "destructive",
      })
    }
  }

  const handleSendCampaign = async () => {
    if (!selectedSenderId || selectedLeads.length === 0) return

    setSending(true)
    setIsConfirmOpen(false)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: selectedSenderId,
          leadIds: selectedLeads,
        }),
      })

      if (response.ok) {
        await fetchCampaignDetails()
        setSelectedLeads([])
        toast({
          title: "Success",
          description: "Campaign is being sent to selected leads.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to send campaign.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending campaign:", error)
      toast({
        title: "Error",
        description: "Failed to send campaign.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) || lead.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    const matchesSendCount =
      sendCountFilter === "all" ||
      (sendCountFilter === "0" && (lead.send_count || 0) === 0) ||
      (sendCountFilter === "1+" && (lead.send_count || 0) > 0)

    return matchesSearch && matchesStatus && matchesSendCount
  })

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map((l) => l._id))
    }
  }

  const toggleSelectLead = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter((item) => item !== id))
    } else {
      setSelectedLeads([...selectedLeads, id])
    }
  }

  if (loading) {
    return null
  }

  if (!campaign) {
    return <div>Campaign not found</div>
  }

  const openRate = stats && stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : 0
  const clickRate = stats && stats.opened > 0 ? ((stats.clicked / stats.opened) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">{campaign.name}</h1>
          <Badge className="capitalize">{campaign.status}</Badge>
        </div>
        <p className="text-muted-foreground">{campaign.subject}</p>
      </div>

      {campaign.status === "draft" && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Ready to Send?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Select a Gmail sender to send this campaign:</p>
              <div className="flex gap-2">
                <Select value={selectedSenderId} onValueChange={setSelectedSenderId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose Gmail sender..." />
                  </SelectTrigger>
                  <SelectContent>
                    {senders.map((sender) => (
                      <SelectItem key={sender._id} value={sender._id.toString()}>
                        {sender.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSendCampaign} disabled={!selectedSenderId || sending} className="gap-2">
                  {sending && <Loader className="w-4 h-4 animate-spin" />}
                  <Send className="w-4 h-4" />
                  Send Campaign
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-5 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.sent || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.delivered || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Opened</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.opened || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{openRate}% open rate</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Clicked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.clicked || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{clickRate}% click rate</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats?.failed || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Target Audience</CardTitle>
              <CardDescription>Select leads to receive this campaign</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedSenderId} onValueChange={setSelectedSenderId}>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="Sender account..." />
                </SelectTrigger>
                <SelectContent>
                  {senders.map((sender) => (
                    <SelectItem key={sender._id} value={sender._id.toString()}>
                      {sender.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!selectedSenderId || selectedLeads.length === 0 || sending} className="gap-2 h-9">
                    {sending && <Loader className="w-4 h-4 animate-spin" />}
                    <Send className="w-4 h-4" />
                    Send to {selectedLeads.length} leads
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-border/50">
                  <DialogHeader>
                    <DialogTitle>Confirm Campaign Send</DialogTitle>
                    <DialogDescription>
                      You are about to send this email to {selectedLeads.length} leads using {selectedSenderId}. This
                      action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendCampaign} className="gap-2">
                      Confirm and Send
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <div className="flex items-center gap-2">
                  <Filter className="w-3 h-3" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sendCountFilter} onValueChange={setSendCountFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Send Count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Send Count</SelectItem>
                <SelectItem value="0">Never Sent (0)</SelectItem>
                <SelectItem value="1+">Sent at least once</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Sends</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No leads found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead._id} className="border-border/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.includes(lead._id)}
                          onCheckedChange={() => toggleSelectLead(lead._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{lead.name}</span>
                          <span className="text-xs text-muted-foreground">{lead.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] h-5 capitalize">
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm">{lead.send_count || 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Email Details</CardTitle>
          <CardDescription>Individual email status and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead className="text-center">Opens</TableHead>
                  <TableHead className="text-center">Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((email) => (
                  <TableRow key={email._id} className="border-border/50 hover:bg-muted/30">
                    <TableCell className="font-medium text-sm">{email.recipient_email}</TableCell>
                    <TableCell>
                      <Badge variant={email.status === "sent" ? "default" : "outline"}>{email.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(email.sent_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {email.open_count > 0 && <Eye className="w-4 h-4 text-blue-600" />}
                        <span className="text-sm">{email.open_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {email.click_count > 0 && <LinkIcon className="w-4 h-4 text-green-600" />}
                        <span className="text-sm">{email.click_count || 0}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CampaignDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <CampaignDetailContent />
    </Suspense>
  )
}
