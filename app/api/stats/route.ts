import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Lead, EmailLog, SenderAccount, Campaign } from "@/lib/models"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    await connectDB()

    // Run queries in parallel for speed
    const [leads, campaigns, senders, emails] = await Promise.all([
      Lead.find({ userId: session.user.id }).lean(),
      Campaign.find({ userId: session.user.id }).lean(),
      SenderAccount.find({ userId: session.user.id }).lean(),
      EmailLog.find({ userId: session.user.id }).lean(),
    ])

    const sentEmails = emails.filter((e: { status: string }) => e.status === "sent").length

    return NextResponse.json({
      success: true,
      stats: {
        leads: leads.length,
        campaigns: campaigns.length,
        senders: senders.length,
        emails: emails.length,
        sentEmails,
      },
    })
  } catch (error) {
    console.error("Stats API Error:", error)
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    )
  }
}
