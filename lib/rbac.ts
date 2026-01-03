import type { Session } from "next-auth"

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "admin"
}

export function isUser(session: Session | null): boolean {
  return !!session?.user
}

export function requireRole(session: Session | null, role: "admin" | "user") {
  if (role === "admin" && !isAdmin(session)) {
    return false
  }
  if (role === "user" && !isUser(session)) {
    return false
  }
  return true
}
