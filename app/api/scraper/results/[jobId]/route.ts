import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { ScrapedLead, Lead } from "@/lib/models";
import { type NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const results = await ScrapedLead.find({
      scraper_job_id: new Types.ObjectId(jobId),
      user_id: session.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(results);
  } catch (error) {
    console.error("Fetch results error:", error);
    return NextResponse.json(
      { message: "Failed to fetch results" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { selectedIds } = await req.json();

    if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
      return NextResponse.json(
        { message: "No results selected" },
        { status: 400 }
      );
    }

    await connectDB();

    // Add selected scraped leads to user's leads table
    for (const id of selectedIds) {
      const scrapedLead = await ScrapedLead.findOne({
        _id: new Types.ObjectId(id),
        user_id: session.user.id,
      });

      if (scrapedLead) {
        await Lead.create({
          user_id: session.user.id,
          name: scrapedLead.name,
          email: scrapedLead.email,
          phone: scrapedLead.phone,
          company: scrapedLead.company,
          website: scrapedLead.website,
          industry: scrapedLead.industry,
          location: scrapedLead.location,
          notes: scrapedLead.notes,
          status: "new",
        });

        // Mark as imported
        await ScrapedLead.updateOne(
          { _id: scrapedLead._id },
          { imported: true }
        );
      }
    }

    return NextResponse.json({ message: "Leads imported successfully" });
  } catch (error) {
    console.error("Import leads error:", error);
    return NextResponse.json(
      { message: "Failed to import leads" },
      { status: 500 }
    );
  }
}
