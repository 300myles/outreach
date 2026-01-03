import { auth } from "@/auth"
import { connectDB } from "@/lib/db"
import { SenderAccount } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { email, provider, smtp_host, smtp_port, smtp_user, smtp_password } = await req.json()

    await connectDB()

    const sender = await SenderAccount.create({
      user_id: session.user.id,
      email,
      provider: provider || "smtp",
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_password,
      is_active: true,
    })

    return NextResponse.json({ id: sender._id })
  } catch (error) {
    console.error("Add sender error:", error)
    return NextResponse.json({ message: "Failed" }, { status: 500 })
  }
}
