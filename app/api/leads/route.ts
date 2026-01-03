import { auth } from "@/auth"
import { connectDB } from "@/lib/db"
import { Lead } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const leads = await Lead.find({ user_id: session.user.id }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ leads })
  } catch (error) {
    console.error("Fetch leads error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 })
  }
}
