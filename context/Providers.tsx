"use client"

import { ReactNode } from "react"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/ui/analytics"

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
      <Analytics />
    </SessionProvider>
  )
}
