import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { ScrapedLead, Lead } from "@/lib/models";
import { type NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import {
  isValidEmailFormat,
  hasMXRecord,
  isValidWebsite,
} from "@/lib/validators";

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

    const { selectedIds, revalidate = false } = await req.json();

    if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
      return NextResponse.json(
        { message: "No results selected" },
        { status: 400 }
      );
    }

    await connectDB();

    const errors: string[] = [];
    let processedCount = 0;

    for (const id of selectedIds) {
      const scrapedLead = await ScrapedLead.findOne({
        _id: new Types.ObjectId(id),
        user_id: session.user.id,
      });

      if (!scrapedLead) continue;

      // 🔎 Email validation
      const emailValid =
        scrapedLead.email &&
        isValidEmailFormat(scrapedLead.email) &&
        (await hasMXRecord(scrapedLead.email));

      // 🌐 Website validation
      const websiteValid =
        scrapedLead.website &&
        (await isValidWebsite(scrapedLead.website));

      // 🧠 Confidence score
      const confidence =
        emailValid && websiteValid
          ? 95
          : emailValid || websiteValid
          ? 65
          : 25;

      // 🔁 REVALIDATE MODE
      if (revalidate === true) {
        scrapedLead.validation_status =
          emailValid && websiteValid ? "valid" : "invalid";

        scrapedLead.ai_confidence_score = confidence;
        scrapedLead.last_validated_at = new Date();

        await scrapedLead.save();

        if (!emailValid || !websiteValid) {
          errors.push(`${scrapedLead.name}: failed revalidation`);
        }

        processedCount++;
        continue;
      }

      // ⛔ IMPORT MODE — block invalid
      if (!emailValid) {
        errors.push(`${scrapedLead.name}: invalid email`);
        continue;
      }

      if (!websiteValid) {
        errors.push(`${scrapedLead.name}: invalid website`);
        continue;
      }

      // ✅ Import as Lead
      await Lead.create({
        user_id: session.user.id,
        name: scrapedLead.name,
        business_name: scrapedLead.name,
        email: scrapedLead.email,
        phone: scrapedLead.phone,
        company: scrapedLead.name,
        website: scrapedLead.website,
        industry: scrapedLead.industry,
        location: scrapedLead.location,
        notes: scrapedLead.description,
        status: "new",
      });

      scrapedLead.imported = true;
      scrapedLead.ai_confidence_score = confidence;
      scrapedLead.last_validated_at = new Date();

      await scrapedLead.save();

      processedCount++;
    }

    if (processedCount === 0) {
      return NextResponse.json(
        { message: "No leads processed", errors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: revalidate
        ? `Revalidated ${processedCount} leads`
        : `Imported ${processedCount} leads`,
      errors,
    });
  } catch (error) {
    console.error("Import/Revalidate leads error:", error);
    return NextResponse.json(
      { message: "Operation failed" },
      { status: 500 }
    );
  }
}
