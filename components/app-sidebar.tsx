"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Mail, Users, Send, BarChart3, LogOut, Search, Shield } from "lucide-react"

interface User {
  id?: string
  name?: string | null
  email?: string | null
  role?: string
}

interface AppSidebarProps {
  user: User
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/dashboard/leads", label: "Leads", icon: Users },
    { href: "/dashboard/scraper", label: "Business Scraper", icon: Search },
    { href: "/dashboard/campaigns", label: "Campaigns", icon: Send },
    { href: "/dashboard/senders", label: "Gmail Senders", icon: Mail },
    { href: "/dashboard/emails", label: "Email Logs", icon: BarChart3 },
    ...(user.role === "admin" ? [{ href: "/dashboard/admin", label: "Admin Panel", icon: Shield }] : []),
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <Mail className="w-5 h-5 text-primary" />
          <span>OutreachAI</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive(item.href) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-3 space-y-2">
        <div className="text-sm">
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-transparent"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
