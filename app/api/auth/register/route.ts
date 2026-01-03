import { connectDB } from "@/lib/db"
import { User } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    // Check if user exists
    const existing = await User.findOne({ email })

    if (existing) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 })
    }

    // Create new user
    const user = new User({
      email,
      name,
      password_hash: password, // In production, use bcrypt
      role: "user",
    })

    await user.save()

    return NextResponse.json({ message: "User created successfully" })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
