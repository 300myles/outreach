import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Campaign, EmailLog } from "@/lib/models";
import { type NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const campaign = await Campaign.findOne({
      _id: new Types.ObjectId(id),
      user_id: session.user.id,
    }).lean();

    if (!campaign) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // Get stats from email logs
    const stats = await EmailLog.aggregate([
      { $match: { campaign_id: new Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          delivered: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          opened: { $sum: { $cond: [{ $eq: ["$status", "opened"] }, 1, 0] } },
          clicked: { $sum: { $cond: [{ $eq: ["$status", "clicked"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        },
      },
    ]);

    // Get email details
    const emails = await EmailLog.find({ campaign_id: new Types.ObjectId(id) })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      campaign,
      stats: stats[0] || {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        failed: 0,
      },
      emails,
    });
  } catch (error) {
    console.error("Campaign details error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
