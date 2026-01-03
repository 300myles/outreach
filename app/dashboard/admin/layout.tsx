import { auth } from "@/auth"
import { redirect } from "next/navigation"
import type React from "react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return <>{children}</>
}
