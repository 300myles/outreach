import { auth } from "@/auth"
import { connectDB } from "@/lib/db"
import { ScraperJob, ScrapedLead } from "@/lib/models"
import { performDeepScraping } from "@/lib/ai-scraper" // Importing our modified non-AI version
import { type NextRequest, NextResponse } from "next/server"
import "dotenv/config";

// Configuration
const DAILY_LIMIT = 100;

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchQuery, country, location } = await req.json()
    const apiKey = process.env.SERPER_API_KEY
    
    // REMOVED GEMINI KEY CHECK
    if (!apiKey) {
      return NextResponse.json({ message: "Server misconfiguration: Missing SERPER_API_KEY" }, { status: 500 })
    }

    await connectDB()

    // 1. CHECK DAILY LIMIT
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayStats = await ScraperJob.aggregate([
      { 
        $match: { 
          user_id: session.user.id, 
          created_at: { $gte: startOfDay } 
        } 
      },
      { $group: { _id: null, total_leads: { $sum: "$total_results" } } }
    ]);

    const leadsToday = todayStats[0]?.total_leads || 0;

    if (leadsToday >= DAILY_LIMIT) {
      return NextResponse.json(
        { message: `Daily limit reached (${leadsToday}/${DAILY_LIMIT} leads). Please try again tomorrow.` }, 
        { status: 429 }
      );
    }

    // 2. CREATE JOB ENTRY
    const job = await ScraperJob.create({
      user_id: session.user.id,
      industry: searchQuery,
      location,
      country,
      status: "running",
    })

    // 3. TRIGGER BACKGROUND WORKER (Fire and Forget)
    runBackgroundScraping(job._id.toString(), session.user.id, searchQuery, location, country, apiKey)
      .catch(console.error);

    return NextResponse.json({ 
      jobId: job._id, 
      message: "Scraping started", 
      remaining_quota: DAILY_LIMIT - leadsToday 
    })

  } catch (error) {
    console.error("Scraper Init Error:", error);
    return NextResponse.json({ message: "Failed to start scraper" }, { status: 500 })
  }
}

/**
 * The Worker Function
 */
async function runBackgroundScraping(jobId: string, userId: string, query: string, location: string, country: string, key: string) {
  try {
    // RUN DEEP SCRAPER (Now Regex-based, not AI)
    const results = await performDeepScraping(query, location, country, key);

    await connectDB();

    // Store Results
    const validLeads = results.filter(r => r.name); 
    
    if (validLeads.length > 0) {
      const dbOperations = validLeads.map(lead => ({
        scraper_job_id: jobId,
        user_id: userId,
        name: lead.name,
        phone: lead.phone,
        website: lead.website,
        email: lead.email,
        secondary_emails: lead.secondary_emails,
        location: lead.address,
        industry: query,
        description: lead.description,
        stats: lead.stats,
        // Calculate dynamic confidence score (Calculated in lib/ai-scraper now)
        ai_confidence_score: lead.ai_confidence_score
      }));

      await ScrapedLead.insertMany(dbOperations);
    }

    // Mark Complete
    await ScraperJob.updateOne(
      { _id: jobId },
      { 
        status: "completed", 
        total_results: validLeads.length,
        completed_at: new Date()
      }
    );

  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    await ScraperJob.updateOne(
      { _id: jobId },
      { status: "failed", error_message: String(error) }
    );
  }
}