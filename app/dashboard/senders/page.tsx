"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Loader, Trash2, CheckCircle, AlertCircle } from "lucide-react"

interface SenderAccount {
  _id: number
  email: string
  provider: string
  is_active: boolean
  created_at: string
}

export default function SendersPage() {
  const { toast } = useToast()
  const [senders, setSenders] = useState<SenderAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualEmail, setManualEmail] = useState("")
  const [manualPassword, setManualPassword] = useState("")
  const [manualSmtpHost, setManualSmtpHost] = useState("smtp.gmail.com")

  useEffect(() => {
    fetchSenders()
  }, [])

  const fetchSenders = async () => {
    try {
      const response = await fetch("/api/senders")
      if (response.ok) {
        const data = await response.json()
        setSenders(data.senders)
      }
    } catch (error) {
      console.error("Error fetching senders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGmailOAuth = async () => {
    // In production, this would redirect to Google OAuth
    toast({
      title: "Gmail OAuth",
      description: "Redirect to Google OAuth flow. (Demo mode)",
    })
  }

  const handleAddManualSender = async () => {
    if (!manualEmail || !manualPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/senders/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: manualEmail,
          provider: "smtp",
          smtp_host: manualSmtpHost,
          smtp_port: 587,
          smtp_user: manualEmail,
          smtp_password: manualPassword,
        }),
      })

      if (!response.ok) throw new Error("Failed to add")

      toast({ title: "Success", description: "Gmail sender added" })
      setManualEmail("")
      setManualPassword("")
      setShowManualEntry(false)
      await fetchSenders()
    } catch (error) {
      toast({ title: "Error", description: "Failed to add sender", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSender = async (id: number) => {
    if (!confirm("Remove this sender account?")) return
    try {
      const response = await fetch(`/api/senders/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Success", description: "Sender removed" })
        await fetchSenders()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gmail Senders</h1>
          <p className="text-muted-foreground">Connect and manage your Gmail accounts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGmailOAuth} className="gap-2">
            <Plus className="w-4 h-4" />
            Connect Gmail OAuth
          </Button>
          <Button variant="outline" onClick={() => setShowManualEntry(!showManualEntry)} className="gap-2">
            <Plus className="w-4 h-4" />
            Manual SMTP
          </Button>
        </div>
      </div>

      {showManualEntry && (
        <Card className="border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Add SMTP Account</CardTitle>
            <CardDescription>For Gmail: use your email and app password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="your-email@gmail.com"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>App Password</Label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                value={manualPassword}
                onChange={(e) => setManualPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                For Gmail: Generate an app-specific password in Google Account settings
              </p>
            </div>
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input value={manualSmtpHost} onChange={(e) => setManualSmtpHost(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddManualSender} disabled={loading} className="gap-2">
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                Add Sender
              </Button>
              <Button variant="outline" onClick={() => setShowManualEntry(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Connected Accounts ({senders.length})</CardTitle>
          <CardDescription>Your verified Gmail senders</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-4 h-4 animate-spin" />
            </div>
          ) : senders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No senders connected yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>Email</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {senders.map((sender) => (
                    <TableRow key={sender._id} className="border-border/50 hover:bg-muted/30">
                      <TableCell className="font-medium">{sender.email}</TableCell>
                      <TableCell className="capitalize">{sender.provider}</TableCell>
                      <TableCell>
                        {sender.is_active ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSender(sender._id)}
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

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Sending Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Each Gmail account can send up to <strong>90 emails per day</strong>
          </p>
          <p>
            Emails are sent with a <strong>2 second delay</strong> between each message
          </p>
          <p>Failed sends are automatically retried</p>
        </CardContent>
      </Card>
    </div>
  )
}
