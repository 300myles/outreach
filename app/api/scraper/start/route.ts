import { auth } from "@/auth"
import { connectDB } from "@/lib/db"
import { ScraperJob, ScrapedLead } from "@/lib/models"
import { scrapeBusinessData } from "@/lib/scraper"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchQuery, location } = await req.json()

    if (!searchQuery || !location) {
      return NextResponse.json({ message: "Search query and location required" }, { status: 400 })
    }

    const apiKey = process.env.SERPER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ message: "Scraper API not configured" }, { status: 500 })
    }

    await connectDB()

    // Create scraper job
    const job = await ScraperJob.create({
      user_id: session.user.id,
      industry: searchQuery,
      location,
      status: "running",
    })

    // Start scraping (non-blocking)
    performScraping(job._id.toString(), session.user.id, searchQuery, location, apiKey)

    return NextResponse.json({ jobId: job._id })
  } catch (error) {
    console.error("Scraper error:", error)
    return NextResponse.json({ message: "Scraping failed" }, { status: 500 })
  }
}

async function performScraping(jobId: string, userId: string, searchQuery: string, location: string, apiKey: string) {
  try {
    const results = await scrapeBusinessData(searchQuery, location, apiKey)

    await connectDB()

    // Process and store results
    if (results.places) {
      for (const place of results.places.slice(0, 20)) {
        await ScrapedLead.create({
          scraper_job_id: jobId,
          user_id: userId,
          name: place.title,
          phone: place.phone || "",
          website: place.website || "",
          location,
          industry: searchQuery,
        })
      }
    }

    // Update job status
    await ScraperJob.updateOne(
      { _id: jobId },
      {
        status: "completed",
        total_results: results.places?.length || 0,
      },
    )
  } catch (error) {
    console.error("Scraping process error:", error)
    await ScraperJob.updateOne(
      { _id: jobId },
      {
        status: "failed",
        error_message: String(error),
      },
    )
  }
}
