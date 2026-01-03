import { auth } from "@/auth"
import { connectDB } from "@/lib/db"
import { Lead } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10)
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function parseCSV(text: string) {
  const lines = text
    .trim()
    .split("\n")
    .filter((line) => line.trim())
    
  if (lines.length < 1) return []

  // const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const leads = []

  for (let i = 0; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    if (values.length >= 2) {
      const lead: Record<string, string> = {}

      lead.name = values[0] || ""
      lead.business_name = values[0] || ""
        lead.email = values[1] || ""
        lead.phone = values[2] || ""
        lead.city = values[3] || ""
        lead.website = values[4] || ""
        lead.notes = values[5] || ""

      console.log("Parsed lead:", lead)

      // Normalize and validate
      if (lead.email && validateEmail(lead.email)) {
        lead.email = normalizeEmail(lead.email)
        lead.phone = normalizePhone(lead.phone || "")
        leads.push(lead)
      }
    }
  }

  return leads
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { data } = await req.json()

    await connectDB()

    const leads = parseCSV(data)
    console.log("Total leads to import:", leads.length)
    let count = 0

    for (const lead of leads) {
      try {
        await Lead.create({
          user_id: session.user.id,
          email: lead.email,
          name: lead.business_name || "",
          website: lead.website || "",
          business_name: lead.business_name || "",
          notes: lead.notes || "",
          city: lead.city || "",
          company: lead.city || "",
          phone: lead.phone || "",
          status: "new",
        })
        count++
      } catch (error) {
        console.error("Error inserting lead:", error)
      }
    }

    return NextResponse.json({ count, message: `Imported ${count} leads` })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: "Upload failed" }, { status: 500 })
  }
}
