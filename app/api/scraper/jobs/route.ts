import { auth } from "@/auth"
import { connectDB } from "@/lib/db"
import { ScraperJob } from "@/lib/models"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const jobs = await ScraperJob.find({ user_id: session.user.id }).sort({ createdAt: -1 }).limit(50).lean()

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Fetch jobs error:", error)
    return NextResponse.json({ message: "Failed to fetch jobs" }, { status: 500 })
  }
}
