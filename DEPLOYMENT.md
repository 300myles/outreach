# Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Neon PostgreSQL account (free tier: 3 projects, 10GB storage)
- Gmail account (for testing email sending)

## Step-by-Step Deployment

### 1. Database Setup

#### Create Neon Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string (looks like `postgresql://user:password@host/database`)
4. Run the schema migration:
   - Open Neon dashboard → SQL Editor
   - Copy content from `scripts/01-init-schema.sql`
   - Execute the SQL

### 2. GitHub Setup

1. Fork or clone this repository
2. Push code to your GitHub repository
3. Make note of your repo URL

### 3. Vercel Deployment

#### Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure project settings

#### Set Environment Variables

In Vercel project settings, add:

\`\`\`
DATABASE_URL=<your-neon-connection-string>
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.vercel.app
\`\`\`

Optional (for Gmail OAuth):
\`\`\`
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>
\`\`\`

#### Deploy

1. Click "Deploy"
2. Wait for build and deployment to complete
3. Your app will be live at `https://your-project.vercel.app`

### 4. First Time Setup

1. Visit your deployed app
2. Create an account
3. Log in with credentials: `test@example.com` / `demo123` (demo user)
4. Or register a new account
5. Start importing leads!

## Gmail SMTP Setup (Optional)

For production email sending via Gmail:

1. Enable 2-Factor Authentication on your Gmail account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate an app-specific password
4. In your sender account setup, use:
   - Email: your@gmail.com
   - App Password: (from step 3)
   - SMTP Host: smtp.gmail.com
   - SMTP Port: 587

## Monitoring

### Check Logs

In Vercel dashboard:
- Click your project
- Go to "Deployments"
- Click the latest deployment
- View logs

### Database Monitoring

In Neon dashboard:
- View query performance
- Monitor storage usage
- Check connection status

## Scaling

For higher traffic:

1. **Database**: Upgrade Neon plan (Pro plan: 50 projects, unlimited storage)
2. **Compute**: Vercel automatically scales (Pro plan: $20/month)
3. **Email Service**: Consider Resend or SendGrid for higher limits

## Troubleshooting

### Database Connection Failed

- Check `DATABASE_URL` is correct in Vercel env vars
- Ensure database is running in Neon
- Verify IP whitelist (Neon has automatic allowlisting for Vercel)

### Authentication Issues

- Generate new `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- Ensure `NEXTAUTH_URL` matches your deployed domain
- Clear browser cookies and try again

### Email Sending Failed

- Verify SMTP credentials are correct
- Check if Gmail account has 2FA enabled
- Use app-specific password, not main password
- Ensure IP is not blocked by Gmail

## Custom Domain

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to `https://your-domain.com`

## Backup & Recovery

### Database Backups

Neon automatically backs up daily. To export:

1. In Neon dashboard, click "Backups"
2. Download backup or restore from point-in-time

### Code Backups

- Keep your GitHub repository updated
- Vercel automatically keeps deployment history

## Performance Tips

1. **Optimize Queries**: Use database indexes (included in schema)
2. **Cache Strategy**: Leverage Next.js caching
3. **CDN**: Vercel CDN included automatically
4. **Image Optimization**: Next.js Image component with CDN

## Cost Breakdown (Estimate)

- **Vercel**: Free tier (5 deployments/month), or Pro ($20/month)
- **Neon**: Free tier (3 projects, 10GB), or Pro ($15/month)
- **Total**: $0-35/month for MVP

## Support

- Vercel: [vercel.com/support](https://vercel.com/support)
- Neon: [neon.tech/docs](https://neon.tech/docs)
- GitHub Issues: [Create issue on repo](https://github.com/your-repo/issues)
