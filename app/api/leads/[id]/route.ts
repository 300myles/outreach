import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Lead } from "@/lib/models";
import { type NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

export async function DELETE(
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

    const result = await Lead.deleteOne({
      _id: new Types.ObjectId(id),
      user_id: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
