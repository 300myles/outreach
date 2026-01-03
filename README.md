# OutreachAI - Email Outreach SaaS

A full-featured email outreach platform for managing leads, creating campaigns, and sending emails through multiple Gmail accounts.

## Features

- **Lead Management**: Import leads via CSV, JSON, or paste. Auto-validate and normalize data.
- **Email Campaigns**: Create campaigns with rich text, templates, and variable personalization.
- **Multi-Account Sending**: Connect multiple Gmail accounts with SMTP support.
- **Rate Limiting**: Safe sending with 2-second delays and 90 emails/day per account.
- **Email Tracking**: Track delivery, opens, clicks, and engagement.
- **Dashboard Analytics**: Real-time campaign performance metrics.
- **Beautiful UI**: Glossy design inspired by Vercel Dashboard and SpaceX aesthetics.

## Tech Stack

- **Frontend**: Next.js 16 with React 19.2
- **Database**: PostgreSQL (Neon)
- **Authentication**: NextAuth v5
- **Email Sending**: Nodemailer + Gmail SMTP
- **UI**: ShadCN Components + Tailwind CSS v4
- **Styling**: Tailwind CSS with glassmorphism

## Environment Variables

\`\`\`env
DATABASE_URL=postgresql://user:password@host/database
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
\`\`\`

## Getting Started

### 1. Install Dependencies

\`\`\`bash
npm install
# or
pnpm install
\`\`\`

### 2. Set Up Database

Run the database schema migration:

\`\`\`bash
npm run db:init
\`\`\`

Or execute the SQL from `scripts/01-init-schema.sql` directly in your Neon console.

### 3. Configure Environment

Copy `.env.example` to `.env.local` and fill in your values:

- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- Gmail SMTP credentials (optional for demo)

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

For testing without Gmail OAuth:
- **Email**: `test@example.com`
- **Password**: `demo123`

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Leads
- `GET /api/leads` - Get all leads for user
- `POST /api/leads/upload` - Upload/import leads
- `DELETE /api/leads/[id]` - Delete lead

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns/create` - Create campaign
- `GET /api/campaigns/[id]` - Get campaign details
- `DELETE /api/campaigns/[id]` - Delete campaign
- `POST /api/campaigns/[id]/send` - Send campaign

### Senders
- `GET /api/senders` - Get Gmail senders
- `POST /api/senders/add` - Add sender account
- `DELETE /api/senders/[id]` - Remove sender

### Email Logs
- `GET /api/emails` - Get email logs

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

\`\`\`bash
vercel
\`\`\`

### Database Setup on Vercel

1. Create a Neon PostgreSQL database
2. Add `DATABASE_URL` to Vercel environment variables
3. Run migrations in Neon console using `scripts/01-init-schema.sql`

### Gmail SMTP Configuration

For production email sending:

1. Use Gmail App Passwords (not your main password)
2. Generate at: https://myaccount.google.com/apppasswords
3. Store securely in environment variables

## Usage

1. **Sign Up**: Create an account
2. **Import Leads**: Upload CSV with contact information
3. **Connect Gmail**: Add SMTP sender accounts
4. **Create Campaign**: Compose email with templates and variables
5. **Send**: Select recipients and sender, then send
6. **Track**: Monitor opens, clicks, and engagement

## Performance Limits

- **Gmail Accounts**: 90 emails per day per account
- **Send Delay**: 2 seconds between emails
- **Batch Size**: Recommended 100-500 emails per campaign
- **Database**: Optimized for 10K+ leads per user

## Security

- All passwords hashed with bcrypt (production)
- SMTP credentials encrypted at rest
- Row-level access control by user
- NextAuth session management
- HTTPS required in production

## Future Enhancements

- Gmail OAuth integration
- AI-powered email suggestions
- Advanced analytics and reporting
- SMS sending support
- Webhook integrations
- Team collaboration features
- Email template marketplace
- A/B testing

## License

MIT

## Support

For issues or questions, please open a GitHub issue or contact support.
