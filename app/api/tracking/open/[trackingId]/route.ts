import { connectDB } from "@/lib/db"
import { EmailLog, Campaign } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_req: NextRequest,  context: { params: Promise<{ trackingId: string }> }) {
  const { trackingId } = await context.params
  console.log("Tracking email open for ID:", trackingId)

  try {
    await connectDB()

    // Find the email log by tracking ID
    const log = await EmailLog.findOne({ tracking_id: trackingId })

    if (log && log.status !== "opened") {
      await EmailLog.updateOne(
        { _id: log._id },
        {
          status: "opened",
          $inc: { opened_count: 1 },
          opened_at: new Date(),
        },
      )

      if (log.campaign_id) {
        await Campaign.updateOne({ _id: log.campaign_id }, { $inc: { opened_count: 1 } })
      }
    }

    // Return a 1x1 transparent GIF
    const buffer = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64")

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    })
  } catch (error) {
    console.error("[v0] Tracking error:", error)
    return new NextResponse(null, { status: 500 })
  }
}
