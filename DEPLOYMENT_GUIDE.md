# LegalAI BD v2.0 — Production Deployment & Cloud Setup Guide

This guide walks you through deploying **LegalAI BD v2.0** to production using **Vercel** for the frontend/API layer and **Neon** (or **Supabase**) for the managed serverless PostgreSQL database.

---

## 1. Cloud Architecture Overview

```
                      ┌─────────────────────────────────────┐
                      │     Clients (Web Browser / PWA)      │
                      └──────────────────┬──────────────────┘
                                         │ HTTPS (TLS 1.3)
                                         ▼
                      ┌─────────────────────────────────────┐
                      │        Vercel Edge & Serverless     │
                      │         (Next.js 16 App Router)     │
                      └──────────┬──────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
  ┌─────────────────────────────┐  ┌─────────────────────────────┐
  │   Managed PostgreSQL 16     │  │       Google Gemini API     │
  │    (Neon.tech / Supabase)   │  │   (v2.0 Flash / v1.5 Pro)   │
  └─────────────────────────────┘  └─────────────────────────────┘
```

---

## 2. Step 1: Provision Managed PostgreSQL Database

### Option A: Neon.tech (Recommended for Next.js)
1. Sign up or log in at [Neon Console](https://console.neon.tech).
2. Create a new project:
   - **Project Name:** `legalai-bd-prod`
   - **Postgres Version:** `16`
   - **Region:** `ap-southeast-1` (Singapore) for lowest latency to Bangladesh.
3. Once created, copy the **Connection string** (Direct connection):
   ```
   postgresql://legalai_owner:password@ep-cold-shadow-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### Option B: Supabase
1. Go to [Supabase](https://supabase.com) and create a new project.
2. Under **Project Settings -> Database**, copy the **URI Connection String** (Transaction pooler or direct mode on port 5432).
3. Ensure `?sslmode=require` is appended.

---

## 3. Step 2: Push Schema & Seed Initial Law Database

From your local machine or CI/CD terminal with the remote connection string:

```bash
# 1. Temporarily export or set the remote DATABASE_URL
export DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# 2. Sync schema to remote PostgreSQL (Creates 16 tables)
npx prisma db push

# 3. Seed authoritative Bangladesh Law Sections & default Admin Advocate
npx tsx prisma/seed.ts
```

*Verification:*
- 16 database tables created (`User`, `Case`, `LawSection`, `GeneratedDocument`, etc.).
- 24 authoritative Bangladesh Law Sections inserted (Penal Code 1860, CrPC 1898, CPC 1908, Specific Relief Act 1877, NI Act 1881).
- Demo administrator user initialized: `advocate@demo.bd`.

---

## 4. Step 3: Deploy to Vercel

### 4.1 Connect Repository
1. Push your latest code to your GitHub / GitLab repository.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New -> Project**.
3. Import your `legalai-bd` repository.

### 4.2 Configure Build & Output Settings
- **Framework Preset:** `Next.js`
- **Root Directory:** `./`
- **Build Command:** `next build` (or `npm run build`)
- **Install Command:** `npm install --legacy-peer-deps`

### 4.3 Configure Production Environment Variables
Under **Environment Variables** in the Vercel dashboard, add the following:

| Variable Name | Description | Example / Source |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_URL` | Production application URL | `https://your-domain.vercel.app` or `https://legalai.bd` |
| `AUTH_TRUST_HOST` | Trust proxy headers | `true` |
| `NEXTAUTH_SECRET` | NextAuth encryption secret | `openssl rand -base64 32` |
| `AUTH_SECRET` | Auth.js secret | Same as `NEXTAUTH_SECRET` |
| `GEMINI_API_KEY` | Google Gemini AI Key | From [Google AI Studio](https://aistudio.google.com/) |
| `BKASH_WEBHOOK_SECRET`| bKash MFS Webhook signature | Custom secure string |

### 4.4 Deploy
Click **Deploy**. Vercel will run the build, optimize pages, and assign your live production URL.

---

## 5. Step 4: Custom Domain & DNS Setup
1. In Vercel, navigate to **Settings -> Domains**.
2. Add your custom domain (e.g., `legalai.bd` and `www.legalai.bd`).
3. Set up DNS records with your registrar:
   - **A Record:** `@` -> `76.76.21.21`
   - **CNAME Record:** `www` -> `cname.vercel-dns.com`
4. Update `NEXTAUTH_URL` in Vercel to match your final domain.

---

## 6. Step 5: Post-Deployment Sanity Checklist

- [ ] Visit `https://your-domain/terms` — verify formal Bengali terms load with legal disclaimer.
- [ ] Visit `https://your-domain/privacy` — verify advocate-client privilege statement renders.
- [ ] Visit `https://your-domain/pricing` — verify FREE, PRO, CHAMBER cards render properly.
- [ ] Log in with `advocate@demo.bd` / `legal123`.
- [ ] Verify Case Workspace drafting and click **প্রিন্ট / PDF** to confirm server-side PDF generation.
- [ ] Press `Ctrl+K` to confirm Global Command Palette functionality.

---
*Prepared by LegalAI BD DevOps Team.*
