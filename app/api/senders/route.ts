import { auth } from "@/auth"
import { connectDB } from "@/lib/db"
import { SenderAccount } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const senders = await SenderAccount.find({ user_id: session.user.id }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ senders })
  } catch (error) {
    console.error("Fetch senders error:", error)
    return NextResponse.json({ message: "Failed" }, { status: 500 })
  }
}
