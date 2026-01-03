import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const isLoggedIn = !!token
  const userRole = token?.role

  const publicRoutes = ["/auth/login", "/auth/register", "/"]
  if (publicRoutes.includes(pathname)) return NextResponse.next()

  if (!isLoggedIn) return NextResponse.redirect(new URL("/auth/login", req.url))

  if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
