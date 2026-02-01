import mongoose from "mongoose"
import "dotenv/config";

// User Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
)

// Lead Schema
const leadSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    business_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: String,
    company: String,
    city: String,
    status: {
      type: String,
      enum: ["new", "contacted", "interested", "converted", "rejected"],
      default: "new",
    },
    send_count: {
      type: Number,
      default: 0,
    },
    notes: String,
    industry: String,
    location: String,
  },
  { timestamps: true },
)

// Campaign Schema
const campaignSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    business_name: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    template_type: {
      type: String,
      enum: ["custom", "cold_outreach", "follow_up", "partnership"],
      default: "custom",
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "failed"],
      default: "draft",
    },
    total_recipients: {
      type: Number,
      default: 0,
    },
    sent_count: {
      type: Number,
      default: 0,
    },
    opened_count: {
      type: Number,
      default: 0,
    },
    clicked_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

// Sender Account Schema (Gmail/SMTP)
const senderAccountSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    smtp_host: String,
    smtp_port: Number,
    smtp_user: String,
    smtp_password: String,
    is_active: {
      type: Boolean,
      default: true,
    },
    daily_sent_count: {
      type: Number,
      default: 0,
    },
    daily_limit: {
      type: Number,
      default: 90,
    },
    last_reset_date: Date,
  },
  { timestamps: true },
)

// Email Log Schema
const emailLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    campaign_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
    },
    lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SenderAccount",
    },
    recipient_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: String,
    body: String,
    status: {
      type: String,
      enum: ["sent", "delivered", "opened", "clicked", "failed", "bounced"],
      default: "sent",
    },
    tracking_id: String,
    opened_at: Date,
    sent_at: Date,
    clicked_at: Date,
    failed_reason: String,
  },
  { timestamps: true },
)

// Scraper Job Schema
const scraperJobSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    country: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },
    total_results: {
      type: Number,
      default: 0,
    },
    progress: {
      type: Number,
      default: 0,
    },
    error_message: String,
  },
  { timestamps: true },
)

// Scraped Lead Schema (temporary storage before import)
// const scrapedLeadSchema = new mongoose.Schema(
//   {
//     scraper_job_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "ScraperJob",
//       required: true,
//     },
//     user_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     business_name: {
//       type: String,
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     email: String,
//     phone: String,
//     company: String,
//     website: String,
//     industry: String,
//     location: String,
//     notes: String,
//     imported: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true },
// )

const scrapedLeadSchema = new mongoose.Schema({
  scraper_job_id: { type: mongoose.Schema.Types.ObjectId, ref: "ScraperJob" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  email: String, // Primary email
  secondary_emails: [String], // Extra emails found
  phone: String,
  website: String,
  location: String,
  industry: String,
  
  // New AI-Enriched Fields
  description: String,
  social_links: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  stats: {
    estimated_traffic: String,
    employee_count: String,
    years_in_business: String
  },
  ai_confidence_score: Number, // 0-100% how sure the AI is about the email
  
  imported: { type: Boolean, default: false },
}, { timestamps: true });

const isDev = process.env.NODE_ENV === "development"

if (isDev) {
  Object.keys(mongoose.models).forEach((model) => {
    delete mongoose.models[model]
  })
}

// Create models
export const User = mongoose.models.User || mongoose.model("User", userSchema)
export const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema)
export const Campaign = mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema)
export const SenderAccount = mongoose.models.SenderAccount || mongoose.model("SenderAccount", senderAccountSchema)
export const EmailLog = mongoose.models.EmailLog || mongoose.model("EmailLog", emailLogSchema)
export const ScraperJob = mongoose.models.ScraperJob || mongoose.model("ScraperJob", scraperJobSchema)
export const ScrapedLead = mongoose.models.ScrapedLead || mongoose.model("ScrapedLead", scrapedLeadSchema)
