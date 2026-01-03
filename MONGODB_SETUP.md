# MongoDB Setup Guide

This email outreach SaaS uses MongoDB Atlas as the primary database.

## Prerequisites

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster (M0 tier is sufficient for development)
3. Get your connection string from the "Connect" button in MongoDB Atlas

## Environment Setup

1. Copy `.env.example` to `.env.local`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

2. Update `MONGODB_URI` in `.env.local` with your MongoDB Atlas connection string:
\`\`\`
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
\`\`\`

## Database Collections

The application automatically creates the following MongoDB collections:

- **users** - User accounts and authentication
- **leads** - Contact leads for outreach campaigns
- **campaigns** - Email campaign configurations
- **sender_accounts** - Gmail/SMTP sender configurations
- **email_logs** - Email sending history and tracking
- **scraper_jobs** - Background scraper job tracking
- **scraped_leads** - Results from business data scraping

## Getting Your MongoDB Connection String

1. Go to MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
2. Log in to your account
3. Click "Connect" on your cluster
4. Select "Drivers" connection method
5. Choose Node.js driver
6. Copy the connection string and replace `<password>` with your database password
7. Paste into `.env.local` as `MONGODB_URI`

## First Run

On the first run of the application:
1. The app will automatically connect to MongoDB
2. Create a test account with:
   - Email: `test@example.com`
   - Password: `demo123`
3. You can then start uploading leads and creating campaigns

## Features with MongoDB

All features are fully supported:
- User authentication and role management
- Lead management (CRUD operations)
- Email campaign creation and sending
- Multi-account SMTP/Gmail support
- Email tracking and analytics
- Business data scraping with Serper.dev
- Admin dashboard with user management
