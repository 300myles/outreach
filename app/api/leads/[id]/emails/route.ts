import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { EmailLog } from "@/lib/models";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: paramId } = await context.params;

    await connectDB();

    const emails = await EmailLog.find({
      lead_id: paramId,
      user_id: session.user.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ emails });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching lead emails" },
      { status: 500 }
    );
  }
}
