// lib/stats.ts
import { connectDB } from "@/lib/db"
import { Lead, EmailLog, SenderAccount, Campaign } from "@/lib/models"

export async function getStats(userId: string) {
  await connectDB()

  const [leads, campaigns, senders, emails] = await Promise.all([
    Lead.find({ userId }).lean(),
    Campaign.find({ userId }).lean(),
    SenderAccount.find({ userId }).lean(),
    EmailLog.find({ userId }).lean(),
  ])

  const sentEmails = emails.filter(e => e.status === "sent").length

  return {
    leads: leads.length,
    campaigns: campaigns.length,
    senders: senders.length,
    emails: emails.length,
    sentEmails,
  }
}
