import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db"
import { Lead, Campaign, SenderAccount, EmailLog } from "@/lib/models"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Users, Send, BarChart3, TrendingUp, AlertCircle } from "lucide-react"

async function getStats(userId: string) {
  try {
    await connectDB()

    // Use parallel queries for performance
    const [leadsCount, campaignsCount, sendersCount, emailsCount, sentEmailsCount] = await Promise.all([
      Lead.countDocuments({ user_id: userId }),
      Campaign.countDocuments({ user_id: userId }),
      SenderAccount.countDocuments({ user_id: userId }),
      EmailLog.countDocuments({ user_id: userId }),
      EmailLog.countDocuments({ user_id: userId, status: "sent" }),
    ])

    return {
      leads: leadsCount,
      campaigns: campaignsCount,
      senders: sendersCount,
      emails: emailsCount,
      sentEmails: sentEmailsCount,
    }
  } catch (error) {
    console.error("[v0] Stats error:", error)
    return { leads: 0, campaigns: 0, senders: 0, emails: 0, sentEmails: 0 }
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/login")
  }

  const userId = session.user.id
  const stats = await getStats(userId)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name}!</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leads}</div>
            <p className="text-xs text-muted-foreground mt-1">Contacts imported</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Send className="w-4 h-4" />
              Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.campaigns}</div>
            <p className="text-xs text-muted-foreground mt-1">Total campaigns</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Senders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.senders}</div>
            <p className="text-xs text-muted-foreground mt-1">Gmail accounts</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sentEmails}</div>
            <p className="text-xs text-muted-foreground mt-1">Emails sent</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emails}</div>
            <p className="text-xs text-muted-foreground mt-1">Total logs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-border/50 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Follow these steps to launch your first campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-medium">Import Leads</h4>
                <p className="text-sm text-muted-foreground">Upload your contact list as CSV or paste data</p>
                <Link href="/dashboard/leads">
                  <Button variant="link" size="sm" className="h-auto p-0 mt-2">
                    Go to Leads →
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-medium">Connect Gmail Senders</h4>
                <p className="text-sm text-muted-foreground">Add Gmail accounts to send from (max 90/day each)</p>
                <Link href="/dashboard/senders">
                  <Button variant="link" size="sm" className="h-auto p-0 mt-2">
                    Go to Senders →
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-medium">Create Campaign</h4>
                <p className="text-sm text-muted-foreground">Compose your email with templates and variables</p>
                <Link href="/dashboard/campaigns">
                  <Button variant="link" size="sm" className="h-auto p-0 mt-2">
                    Go to Campaigns →
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p>
                Use <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{"{{variables}}"}</code> to personalize
              </p>
            </div>
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p>Each Gmail account has a 90 email/day limit</p>
            </div>
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p>Emails are sent with a 2-second delay</p>
            </div>
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p>View all email logs in the Email Logs page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
