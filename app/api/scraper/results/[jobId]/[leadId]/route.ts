import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { ScrapedLead } from "@/lib/models";
import {
  isValidEmailFormat,
  hasMXRecord,
  isValidWebsite,
} from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ jobId: string, leadId: string }> }
) {
  try {
    const { jobId, leadId } = await context.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { email, website } = await req.json();

    if (!email && !website) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 }
      );
    }

    await connectDB();

    const scrapedLead = await ScrapedLead.findOne({
      _id: new Types.ObjectId(leadId),
      scraper_job_id: new Types.ObjectId(jobId),
      user_id: session.user.id,
    });

    if (!scrapedLead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {};

    // ✅ EMAIL LOGIC
    if (!scrapedLead.email && email) {
      if (!isValidEmailFormat(email)) {
        return NextResponse.json(
          { message: "Invalid email format" },
          { status: 400 }
        );
      }

      const hasMX = await hasMXRecord(email);
      if (!hasMX) {
        return NextResponse.json(
          { message: "Email domain does not exist" },
          { status: 400 }
        );
      }

      updates.email = email;
    }

    // ✅ WEBSITE LOGIC
    if (!scrapedLead.website && website) {
      const validSite = await isValidWebsite(website);
      if (!validSite) {
        return NextResponse.json(
          { message: "Website is unreachable or invalid" },
          { status: 400 }
        );
      }

      updates.website = website.startsWith("http")
        ? website
        : `https://${website}`;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "No fields were updated" },
        { status: 200 }
      );
    }

    // AI confidence logic
    if (updates.website && !updates.email && !scrapedLead.email) {
      updates.ai_confidence_score = 30;
    }

    if (
      (updates.email || scrapedLead.email) &&
      (updates.website || scrapedLead.website)
    ) {
      updates.ai_confidence_score = 95;
    }

    await ScrapedLead.updateOne({ _id: scrapedLead._id }, { $set: updates });

    return NextResponse.json({
      message: "Scraped lead updated",
      updated: updates,
    });
  } catch (error) {
    console.error("Update scraped lead error:", error);
    return NextResponse.json(
      { message: "Failed to update scraped lead" },
      { status: 500 }
    );
  }
}
