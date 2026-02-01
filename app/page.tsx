import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Zap,
  Target,
  MessageSquare,
  BarChart3,
  Search,
  Send,
  ArrowRight,
  Database,
  Eye,
  TrendingUp,
} from 'lucide-react'
import { aiScraper, campaignAnalytics, campaignBuilder, leadManagement, outReachHero } from '@/constants/images'

export default async function HomePage() {

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-background" />
            </div>
            <span className="text-lg font-bold tracking-tight">OutreachAI</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#modules" className="text-muted-foreground hover:text-foreground transition-colors">
              Modules
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 w-fit">
                <p className="text-sm font-medium text-primary">AI-powered B2B lead generation</p>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tight text-balance">
                Find leads faster. Send better emails. Close more deals.
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Outreach AI replaces manual lead scraping, spreadsheet-based outreach, and fragmented tools with
                AI-driven lead discovery and smart campaign orchestration for founders, agencies, and service providers.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
                <Link href="/auth/register">
                  <Button size="lg" className="gap-2">
                    Start Free Trial <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                No credit card required • 7-day free trial • Full platform access
              </p>
            </div>

            <div className="relative hidden md:block h-125 bg-white">
              <Image
                src={outReachHero}
                alt="AI-powered lead discovery"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules Section */}
      <section id="modules" className="border-b border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold">Five Integrated Modules</h2>
              <p className="text-xl text-muted-foreground">
                Each module feeds the next, creating a seamless workflow from discovery to conversion.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* AI Business Scraper */}
              <div className="p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">AI Business Scraper</h3>
                    <p className="text-sm text-muted-foreground mt-1">Discover high-quality leads automatically</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">
                  Input business category and location. AI interprets listings, extracts official websites, detects
                  contact info, and confirms relevance. Every scrape is timestamped and repeatable.
                </p>
                <div className="relative h-[200px] rounded-lg bg-muted">
                  <Image src={aiScraper} alt="AI scraper module" fill className="object-cover rounded-lg" />
                </div>
              </div>

              {/* Lead Management Engine */}
              <div className="p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Lead Management Engine</h3>
                    <p className="text-sm text-muted-foreground mt-1">Turn raw data into actionable leads</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">
                  Deduplication, email validation, domain matching, and smart tagging. Track lead states from new to
                  converted. AI suggests outreach angles and matches leads to best templates.
                </p>
                <div className="relative h-[200px] rounded-lg bg-muted">
                  <Image src={leadManagement} alt="Lead management" fill className="object-cover rounded-lg" />
                </div>
              </div>

              {/* Campaign Builder */}
              <div className="p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Send className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Campaign Builder</h3>
                    <p className="text-sm text-muted-foreground mt-1">Create multi-step outreach workflows</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">
                  Build email sequences with personalization tokens. Set timing, delays, and follow-ups. Auto-stop on
                  reply. Built-in throttling for deliverability. Supporting email with SMS and LinkedIn coming soon.
                </p>
                <div className="relative h-[200px] rounded-lg bg-muted">
                  <Image src={campaignBuilder} alt="Campaign builder" fill className="object-cover rounded-lg" />
                </div>
              </div>

              {/* Email Generator */}
              <div className="p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">AI Email Generator</h3>
                    <p className="text-sm text-muted-foreground mt-1">Generate high-converting messages automatically</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">
                  AI writes cold outreach, follow-ups, and partnership pitches. Rewrite per industry. Adjust tone.
                  Insert business insights. You maintain full control—approve or edit all outputs. Lock brand voice.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span> Multiple personalization tokens
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span> Industry-specific variations
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span> Spam filter avoidance
                  </li>
                </ul>
              </div>

              {/* Analytics & Tracking */}
              <div className="md:col-span-2 p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Campaign Execution & Analytics</h3>
                    <p className="text-sm text-muted-foreground mt-1">Send safely and measure everything</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-muted-foreground mb-4">
                      Email scheduling, rate limiting, auto follow-ups, bounce handling. Track sent, opened, replied,
                      booked, and converted. Get AI insights on best performing templates and optimal send times.
                    </p>
                    <div className="relative h-[250px] rounded-lg bg-muted">
                      <Image src={campaignAnalytics} alt="Analytics" fill className="object-cover rounded-lg" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Eye className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">Open Rate Tracking</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Real-time open detection and click tracking across all campaigns
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">Performance Insights</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI-powered recommendations for improving open and reply rates
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">Conversion Tracking</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Track full customer journey from lead to close
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-b border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold">How Outreach AI Works</h2>
              <p className="text-xl text-muted-foreground">From discovery to conversion in one platform</p>
            </div>

            <div className="grid md:grid-cols-5 gap-4">
              {[
                {
                  step: '1',
                  title: 'Discover',
                  description: 'AI scrapes business data from Maps, websites, directories',
                },
                {
                  step: '2',
                  title: 'Validate',
                  description: 'Emails are verified and leads are deduplicated and enriched',
                },
                {
                  step: '3',
                  title: 'Personalize',
                  description: 'AI generates tailored emails for each lead and industry',
                },
                {
                  step: '4',
                  title: 'Send',
                  description: 'Campaigns execute with rate limiting and optimal timing',
                },
                {
                  step: '5',
                  title: 'Measure',
                  description: 'Track opens, replies, and conversions with live analytics',
                },
              ].map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                    <div className="text-3xl font-bold text-primary mb-3">{item.step}</div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {index < 4 && (
                    <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-primary" />
                      <div className="w-8 h-[2px] bg-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-b border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold">Built for Growth</h2>
              <p className="text-xl text-muted-foreground">Designed for founders, agencies, and service providers</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'AI-Driven Discovery',
                  description:
                    'Find high-quality leads faster with AI that understands context and business relevance.',
                },
                {
                  title: 'Smart Personalization',
                  description:
                    'Every email is tailored to the recipient with industry-specific insights and tone matching.',
                },
                {
                  title: 'Multi-Step Workflows',
                  description:
                    'Create sophisticated outreach sequences with auto follow-ups, timing, and conditional logic.',
                },
                {
                  title: 'Real-Time Analytics',
                  description:
                    'Track every metric that matters—opens, replies, conversions. Get AI-powered improvements.',
                },
                {
                  title: 'Full Control',
                  description:
                    'You maintain brand voice and approval authority. AI is a copilot, not a replacement.',
                },
                {
                  title: 'Data Ethics First',
                  description:
                    'Public data only. GDPR-aware. No login scraping. No captcha bypassing. User-controlled.',
                },
              ].map((feature) => (
                <div key={feature.title} className="p-6 rounded-lg border border-border bg-card">
                  <h3 className="font-bold mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b border-border py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to scale your outreach?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join founders and agencies who are closing more deals with smarter, faster outreach.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2">
                Start Your Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-foreground rounded-lg flex items-center justify-center">
                  <Zap className="w-3 h-3 text-background" />
                </div>
                <span className="font-bold">OutreachAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered B2B lead generation and cold outreach automation for founders and agencies.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#modules" className="hover:text-foreground transition-colors">
                    Modules
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 OutreachAI. All rights reserved. Built with AI for outreach.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
