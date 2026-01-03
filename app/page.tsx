
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Users, BarChart3 } from "lucide-react"
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth()
    if (!session?.user) {
      redirect("/auth/login")
    }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-slate-50 dark:to-slate-900 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">OutreachAI</span>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <p className="text-sm font-medium text-primary">🚀 Email Outreach Made Simple</p>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-balance">
            Send <span className="text-primary">Targeted Emails</span> at Scale
          </h1>

          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Upload leads, compose campaigns, and send emails through multiple Gmail accounts. Track every interaction
            with our intelligent dashboard.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
              <Users className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">Lead Management</h3>
              <p className="text-sm text-muted-foreground">
                Import leads via CSV, JSON, or paste. Auto-validate and normalize data instantly.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
              <Mail className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">Email Campaigns</h3>
              <p className="text-sm text-muted-foreground">
                Rich text editor with templates, variables, and preview. Send from multiple Gmail accounts.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
              <BarChart3 className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">Analytics & Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Track open rates, clicks, and delivery status. Monitor sends per Gmail account.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 OutreachAI. Built with Next.js & Vercel.</p>
        </div>
      </footer>
    </div>
  )
}
