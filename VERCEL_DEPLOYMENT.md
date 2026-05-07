# Vercel Deployment Guide for ClubHub

## Prerequisites
1. GitHub account (already done ✓)
2. Vercel account (free at https://vercel.com)
3. PostgreSQL database URL

## Step 1: Set Up Database on Vercel Postgres

### Option A: Using Vercel Postgres (Recommended)
1. Go to https://vercel.com/dashboard
2. Click on your ClubHub project (or create a new one)
3. Go to **Storage** → **Create Database** → **Postgres**
4. Copy the connection string

### Option B: Using Supabase (Free PostgreSQL)
1. Go to https://supabase.com
2. Create new project
3. In Project Settings → Database, copy the "Connection string"
4. Replace `[YOUR-PASSWORD]` with your actual password

### Option C: Using PlanetScale (Free MySQL)
1. Go to https://planetscale.com
2. Create new database
3. Copy the connection string

## Step 2: Update Prisma Schema

Your current schema uses SQLite. Change it to PostgreSQL:

**File: `prisma/schema.prisma`**

Replace:
```
datasource db {
  provider = "sqlite"
}
```

With:
```
datasource db {
  provider = "postgresql"
}
```

## Step 3: Push Local Changes to GitHub

```bash
# Add all changes
git add .

# Commit
git commit -m "Configure Vercel deployment and switch to PostgreSQL"

# Push to GitHub
git push origin main
```

## Step 4: Deploy to Vercel

### Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Search for your GitHub repo **"ClubHub"**
4. Click **Import**
5. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your Vercel domain (will be shown after first deploy)
   - Add any other env vars (.env.example shows all options)
6. Click **Deploy**

### Via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts
```

## Step 5: Run Database Migrations

After first deployment, your database schema needs to be set up:

1. In Vercel dashboard, go to your project
2. Go to **Deployments** → Latest deployment
3. Click **Functions** tab
4. OR run locally and push:

```bash
# Locally:
npx prisma migrate deploy

# This will create all tables from schema.prisma
```

## Step 6: Verify Deployment

1. Open your Vercel deployment URL
2. Check that:
   - App loads without errors
   - Can access pages
   - Database operations work (create posts, etc.)
3. Check logs: **Vercel Dashboard** → **Deployments** → **Functions**

## Troubleshooting

### Error: "better-sqlite3 is not available"
✅ **Fixed by switching to PostgreSQL** (done in Step 2)

### Error: "Database connection refused"
- Check DATABASE_URL is correct
- Verify database allows connections from Vercel IPs
- For PostgreSQL: check firewall rules

### Error: "Prisma Client is not available"
Run in Vercel Functions tab or after deployment:
```bash
npx prisma generate
```

### Deployment takes too long
- Check `next.config.ts` for optimization issues
- Build locally to test: `npm run build`
- Check output size

## Environment Variables Needed

Copy from `.env.example` and set in Vercel:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random 32-char secret

**Email (Nodemailer):**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

**SMS (Twilio):**
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

**AI (LangChain):**
- `NEXT_PUBLIC_GROQ_API_KEY` (or other AI API keys)

## After Deployment

### Custom Domain (Optional)
1. Go to Vercel Project Settings → **Domains**
2. Add your custom domain
3. Follow DNS setup instructions

### Enable CI/CD
- Vercel automatically deploys on GitHub push
- Set up branch deployments in **Settings** → **Git**

### Database Backups
For PostgreSQL:
- **Vercel Postgres**: Built-in backups
- **Supabase**: Automated backups in settings
- **PlanetScale**: Daily backups available

## Development

After deployment, continue development locally:

```bash
# Create local PostgreSQL for dev (optional)
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Or use production DATABASE_URL for local dev (not recommended)

# Run migrations
npx prisma migrate deploy

# Dev server
npm run dev
```

## Git Workflow

```bash
# Development
npm run dev

# Test build
npm run build
npm start

# Push to GitHub (auto-deploys to Vercel)
git add .
git commit -m "Your message"
git push origin main
```

---

**Need help?** Check Vercel docs: https://vercel.com/docs/frameworks/nextjs
