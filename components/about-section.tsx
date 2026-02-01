import Image from 'next/image'
import { CheckCircle } from 'lucide-react'

export function AboutSection() {
  return (
    <div className="space-y-16">
      {/* Main About Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl font-bold mb-8">About OutreachAI</h2>
        <p className="text-xl text-muted-foreground leading-relaxed mb-8">
          OutreachAI combines premium design, deep reliability, and intelligent automation to set a new standard for email outreach—locally and globally. We&apos;re building the world&apos;s most powerful yet user-friendly platform for sales teams and growth professionals.
        </p>
      </div>

      {/* Mission, Vision, Values */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
          <h3 className="text-2xl font-bold mb-4">Mission</h3>
          <p className="text-muted-foreground leading-relaxed">
            Empower every sales team to send intelligent, personalized email campaigns that convert—without complexity.
          </p>
        </div>

        <div className="p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
          <h3 className="text-2xl font-bold mb-4">Vision</h3>
          <p className="text-muted-foreground leading-relaxed">
            Become the most trusted and rewarding platform for email outreach across Africa and the world.
          </p>
        </div>

        <div className="p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
          <h3 className="text-2xl font-bold mb-4">Values</h3>
          <p className="text-muted-foreground leading-relaxed">
            User-first. Transparent. Reliable. Performance-driven. We obsess over quality and user success.
          </p>
        </div>
      </div>

      {/* Founding Story */}
      <div className="max-w-4xl mx-auto p-12 rounded-2xl border border-border bg-card">
        <h3 className="text-3xl font-bold mb-6">Founding Story</h3>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Founded in 2024, OutreachAI was born from a simple observation: traditional email outreach tools are clunky, unreliable, and expensive. We noticed sales teams wasting hours on manual work and getting locked into poor contracts.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          We built OutreachAI to fix this. By combining intelligent automation, multi-account support, and real-time analytics, we&apos;re making email outreach faster, smarter, and more profitable for everyone from solo entrepreneurs to enterprise teams.
        </p>
      </div>

      {/* Why Choose Us */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-3xl font-bold mb-12 text-center">Why Choose OutreachAI</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            'Premium UI built for power users',
            'Deep reliability with 99.9% uptime',
            'Intelligent automation saves hours',
            'Track every interaction in real-time',
            'Multi-account sending at scale',
            'Data-driven insights and analytics',
          ].map((item) => (
            <div key={item} className="flex gap-4 items-start">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <p className="text-lg text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
