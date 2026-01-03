import { connectDB } from "@/lib/db"
import { Campaign } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, subject, body, template_type } = await req.json()

    await connectDB()

    const campaign = await Campaign.create({
      user_id: session.user.id,
      business_name: name,
      name,
      subject,
      body,
      template_type: template_type || "custom",
      status: "draft",
      total_recipients: 0,
    })

    return NextResponse.json({ id: campaign._id })
  } catch (error) {
    console.error("Campaign error:", error)
    return NextResponse.json({ message: "Failed" }, { status: 500 })
  }
}
