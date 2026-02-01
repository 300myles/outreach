import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Campaign, Lead, SenderAccount, EmailLog } from "@/lib/models";
import { type NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import nodemailer from "nodemailer";
import "dotenv/config";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { leadIds, senderId } = await req.json();

    if (!leadIds?.length || !senderId) {
      return NextResponse.json(
        { message: "Missing leads or sender" },
        { status: 400 }
      );
    }

    const { id: paramId } = await context.params;

    await connectDB();

    const campaign = await Campaign.findOne({
      _id: new Types.ObjectId(paramId),
      user_id: session.user.id,
    });

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    const sender = await SenderAccount.findOne({
      _id: new Types.ObjectId(senderId),
      user_id: session.user.id,
    });

    if (!sender) {
      return NextResponse.json(
        { message: "Sender not found" },
        { status: 404 }
      );
    }

    const leads = await Lead.find({
      _id: { $in: leadIds.map((id: string) => new Types.ObjectId(id)) },
      user_id: session.user.id,
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: sender.smtp_host,
      port: sender.smtp_port,
      secure: sender.smtp_port === 465,
      auth: {
        user: sender.smtp_user,
        pass: sender.smtp_password,
      },
    });

    let sentCount = 0;
    const emails = [];

    // Send emails with delay
    for (const lead of leads) {
      try {
        const trackingId = new Types.ObjectId().toString();
        const trackingPixel = `<img src="${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }/api/tracking/open/${trackingId}" width="1" alt="" height="1" />`;

        const personalized = {
          subject: campaign.subject
            .replace(/\{\{business_name\}\}/g, lead.business_name)
            .replace(/\{\{city\}\}/g, lead.city || "")
            .replace(/\{\{name\}\}/g, lead.business_name)
            .replace(
              /\{\{social_link\}\}/g,
              `<a href=\"https://linktr.ee/kamsyemekaugwu/\" target=\"_blank\" style=\"text-decoration: underline;font-style: italic;font-weight: 600;\">View my work & socials</a>`
            )
            .replace(
              /\{\{your_name\}\}/g,
              '<div style="font-weight: 600;">Myles Kamsy Xavier (MKX)</div>'
            )
            .replace(
              /\{\{demo_link\}\}/g,
              '<a href="https://eatery-rouge.vercel.app/" target="_blank" style="text-decoration: underline;font-style: italic;font-weight: 600;">Restaurant Website Demo</a>'
            ),
          body: campaign.body
            .replace(/\{\{business_name\}\}/g, lead.business_name)
            .replace(/\{\{city\}\}/g, lead.city || "")
            .replace(/\{\{name\}\}/g, lead.business_name)
            .replace(
              /\{\{social_link\}\}/g,
              `<a href=\"https://linktr.ee/kamsyemekaugwu/\" target=\"_blank\" style="text-decoration: underline;font-style: italic;font-weight: 600;">View my work & socials</a>`
            )
            .replace(
              /\{\{your_name\}\}/g,
              '<div style="font-weight: 600;">Myles Kamsy Xavier (MKX)</div>'
            )
            .replace(
              /\{\{demo_link\}\}/g,
              '<a href="https://eatery-rouge.vercel.app/" target="_blank" style="text-decoration: underline;font-style: italic;font-weight: 600;">Restaurant Website Demo</a>'
            ),
        };

        await transporter.sendMail({
          from: sender.email,
          to: lead.email,
          subject: personalized.subject,
          html: `<div style="font-family: sans-serif;">
            ${personalized.body.replace(/\n/g, "<br/>")}
            ${trackingPixel}
          </div>`,
        });

        await EmailLog.create({
          user_id: session.user.id,
          campaign_id: campaign._id,
          lead_id: lead._id,
          sender_id: sender._id,
          recipient_email: lead.email,
          subject: personalized.subject,
          body: personalized.body,
          status: "sent",
          sent_at: Date.now(),
          tracking_id: trackingId,
        });

        // Update lead send count and status
        await Lead.updateOne(
          { _id: lead._id },
          { $inc: { send_count: 1 }, status: "contacted" }
        );

        emails.push({ leadId: lead._id, status: "sent" });
        sentCount++;

        // Delay between sends
        if (leads.length > 1) {
          console.log(
            `Waiting 2 seconds before sending next email...`,
            "leads count",
            leads.length
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error("Error sending to", lead.email, error);
        emails.push({ leadId: lead._id, status: "failed" });
      }
    }

    // Update campaign
    await Campaign.updateOne(
      { _id: campaign._id },
      {
        status: "sent",
        total_recipients: sentCount,
      }
    );

    return NextResponse.json({
      message: `Sent ${sentCount} emails`,
      sent: sentCount,
      failed: leadIds.length - sentCount,
    });
  } catch (error) {
    console.error("Send error:", error);
    return NextResponse.json(
      { message: "Failed to send", error: String(error) },
      { status: 500 }
    );
  }
}
