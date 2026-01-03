import { auth } from "@/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"
import { Types } from "mongoose"

export async function PUT(req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const {userId} = await context.params;
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, role } = await req.json()

    await connectDB()

    await User.updateOne({ _id: new Types.ObjectId(userId) }, { name, role })

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const {userId} = await context.params;
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const result = await User.deleteOne({ _id: new Types.ObjectId(userId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 })
  }
}
