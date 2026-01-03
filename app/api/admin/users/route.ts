import { auth } from "@/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const users = await User.find().sort({ createdAt: -1 }).lean()

    return NextResponse.json(users)
  } catch (error) {
    console.error("Fetch users error:", error)
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 })
  }
}
