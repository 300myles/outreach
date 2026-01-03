import { auth } from "@/auth"
import { connectDB } from "@/lib/db"
import { User, Lead, Campaign, EmailLog } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"
import { Types } from "mongoose"

export async function GET(_req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const {userId} = await context.params;
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const userIdParsed = new Types.ObjectId(userId)

    const user = await User.findById(userIdParsed).lean()

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const [leadsCount, campaignsCount, emailsSent] = await Promise.all([
      Lead.countDocuments({ user_id: userId }),
      Campaign.countDocuments({ user_id: userId }),
      EmailLog.countDocuments({ user_id: userId }),
    ])

    return NextResponse.json({
      ...user,
      leads_count: leadsCount,
      campaigns_count: campaignsCount,
      emails_sent: emailsSent,
    })
  } catch (error) {
    console.error("Fetch user detail error:", error)
    return NextResponse.json({ message: "Failed to fetch user" }, { status: 500 })
  }
}
