<div align="center">

# ⚖️ LegalAI BD v3.0
### Production-Grade Enterprise Legal-Tech SaaS for Bangladesh Advocates
**AI Intake • Dynamic Interrogation • Court Document Drafting • Precedent Engine • Contract Reviewer • Bail Predictor • Mock Trial Simulator**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Vitest](https://img.shields.io/badge/Vitest-119%20Unit%20Tests%20Passing-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-29%20E2E%20Tests%20Passing-2EAD33?style=for-the-badge&logo=playwright)](https://playwright.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](#)

</div>

---

## 🌟 Executive Overview

**LegalAI BD v3.0** is an enterprise-grade AI legal operating system engineered specifically for advocates of the District Courts and the Supreme Court of Bangladesh. It automates the full lifecycle of legal practice—from oral client statement intake to court-admissible petitions, limitation tracking, precedent search, deed audits, and bail outcome predictions.

### 🏆 Key Capabilities (v3.0)

#### 1. Core Practice Management & Drafting
- **Bengali Voice & Text Intake:** Real-time Web Speech (`bn-BD`) voice transcription and unstructured narrative intake with automatic PII redaction.
- **Dynamic Legal Interrogation (Ingredient Graph):** Evaluates statutory elements under the Penal Code 1860, CrPC 1898, CPC 1908, NI Act 1881, and Specific Relief Act 1877 to compute a real-time Completeness Score (`0% - 100%`).
- **34 Court-Standard Draft Templates:** Instant generation of Thana FIRs, General Diaries (GD), C.R. Petitions, Bail Applications (CrPC 497/498), Civil Plaints, Injunction Applications (Order 39 CPC), and Legal Notices.
- **Unicode ⇄ Bijoy (SutonnyMJ ANSI) Converter:** Instant bi-directional translation for legacy court printers and typing requirements.
- **Server-Side PDF & DOCX Export:** Generates pristine judicial documents with embedded Kalpurush fonts and court-admissible letterheads.
- **Evidence Vault & Tesseract OCR:** Secure evidence file upload and automated Bengali OCR text extraction.

#### 2. Tier 1: Daily Essentials (`/court-essentials` & `/court-fee/tr4`)
- **হাজিরা স্লিপ (Hazira Slip):** Daily attendance slip for accused persons in Magistrate & Sessions Courts.
- **সময় প্রার্থনার দরখাস্ত (Time Petition):** Petitions under Section 344 CrPC or Order 17 CPC with automatic date tracking.
- **ওকালতনামা (Vakalatnama):** Formal power of attorney auto-populated with the advocate's Bar Council ID.
- **টিআর-৪ চালান (TR-4 Treasury Challan):** Printable treasury challan for court fees bank submission.
- **স্বয়ংক্রিয় এসএমএস রিমাইন্ডার (SMS Reminders):** Instant SMS reminder dispatch to clients with database audit logs.

#### 3. Tier 2: Advanced AI Research (`/precedent` & `/contract-review`)
- **Supreme Court Precedent Engine:** Fast search across landmark Bangladesh Supreme Court decisions (DLR, BLC, AD/HCD) with one-click citation copy.
- **Smart Deed & Contract Reviewer:** Deep legal audit of deeds (বিক্রয় কবলা, বায়নাপত্র, হেবা দলিল, চুক্তিপত্র) highlighting Risk Badges (Low/Medium/High), missing statutory clauses, unfair terms, and advocate strategy.

#### 4. Tier 3: AI Outcome Prediction & Trial Simulator (`/bail-predictor` & `/mock-trial`)
- **AI Bail Outcome Predictor:** Probability estimation (0-100%) grounded in landmark precedent **51 DLR (AD) 1 (BLAST vs Bangladesh)**, highlighting legal grounds, custody factors, and filing strategies.
- **Mock Trial & Witness Simulator:** Interactive Bengali cross-examination chamber with active objections for leading questions and contradictory statements.

---

## 🏛️ System Architecture Business Logic Gates

| Constraint | Rule | Legal Context |
| :--- | :--- | :--- |
| **1. Strict Address Disputed Gate** | `addressDisputed === false` strictly enforced. `null`, `undefined`, or `true` blocks civil plaint drafting. | Order 6 & 7 CPC — Plaint cannot be filed if service address is contested. |
| **2. Real Database Evidence Check** | Verifies `POSTAL_RECEIPT` exists in Prisma DB for the specific case. Rejects synthetic boolean flags. | S. 138 NI Act — Mandatory proof of legal notice delivery by registered post with A/D. |
| **3. NI Act 2026 Pecuniary Jurisdiction** | Check amount `> 5,00,000 BDT` ➔ **Joint Sessions Judge** (`বিজ্ঞ যুগ্ম দায়রা জজ আদালত`). Amount `<= 5,00,000 BDT` ➔ **Chief Judicial Magistrate** (`বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত`). | The Negotiable Instruments Act, 2026 (Act 65/2026), Section 141(C). |
| **4. Holiday Extension Flag** | If limitation expires on Friday, Saturday, or official court holiday, system flags `NEEDS_LAWYER_REVIEW_FOR_HOLIDAY_EXTENSION: true`. | Section 4 Limitation Act 1908 — Requires advocate discretion regarding court closure. |

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16.4 (App Router & Turbopack)](https://nextjs.org/)
- **Language:** TypeScript 5.0 (Strict Typing)
- **Database & ORM:** PostgreSQL 16 ([Neon Serverless Postgres](https://neon.tech/)) + [Prisma ORM 6.4](https://www.prisma.io/)
- **Authentication:** [NextAuth.js v5 (Auth.js Beta)](https://authjs.dev/) with Session & Cookie RBAC
- **Styling & UI:** Tailwind CSS v4, Lucide Icons, cmdk (Command Palette), Strict Light Theme
- **Document Generation:** `docx` (Word OpenXML), `puppeteer` (Headless Chromium Server-Side PDF)
- **OCR Engine:** Tesseract.js (Bengali language support)
- **Testing:** Vitest (119 Unit Tests) + Playwright (29 End-to-End Browser Tests)

---

## ☁️ Deployment Instructions (Vercel + Neon PostgreSQL)

Follow this verified production deployment guide to launch LegalAI BD v3.0 to Vercel with a Neon serverless PostgreSQL database.

### Step 1: Provision Neon PostgreSQL Database
1. Go to [Neon.tech](https://neon.tech/) and create a free or Pro project.
2. Select the **Singapore (ap-southeast-1)** region for optimal latency to Bangladesh.
3. In your Neon dashboard, copy the **Connection string** (select **Pooled connection** for serverless scaling):
   ```text
   postgresql://legalai_owner:YourPassword@ep-cool-cloud-123456-pooler.ap-southeast-1.aws.neon.tech/legalai?sslmode=require
   ```

### Step 2: Push Repository to GitHub
Ensure all latest commits are pushed to your remote repository:
```bash
git push origin main
```

### Step 3: Connect Project to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/) and click **"Add New" ➔ "Project"**.
2. Select your `legalai-bd` repository.
3. Framework Preset: **Next.js** (auto-detected).
4. Build and Output Settings:
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install`
   - **Output Directory:** `.next`

### Step 4: Configure Vercel Environment Variables
Add the following required environment variables in the Vercel **Project Settings ➔ Environment Variables** section:

| Variable Name | Required | Example / Recommended Value | Purpose |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@ep-xyz-pooler.ap-southeast-1.aws.neon.tech/legalai?sslmode=require` | Neon PostgreSQL pooled connection URL |
| `NEXTAUTH_URL` | **Yes** | `https://your-domain.vercel.app` (or custom domain) | Base URL for auth redirects |
| `AUTH_TRUST_HOST` | **Yes** | `true` | Allows NextAuth v5 to run behind Vercel reverse proxy |
| `NEXTAUTH_SECRET` | **Yes** | `32+ character random string` (e.g. run `openssl rand -base64 32`) | JWT and session cookie encryption |
| `AUTH_SECRET` | **Yes** | Same value as `NEXTAUTH_SECRET` | Required for Auth.js v5 beta |
| `GEMINI_API_KEY` | **Optional** | `AIzaSy...` (from Google AI Studio) | Powers AI draft analysis and outcome prediction |
| `OPENAI_API_KEY` | **Optional** | `sk-...` | Optional fallback LLM provider |
| `BKASH_WEBHOOK_SECRET` | **Optional** | `whsec_...` | For automated bKash subscription callbacks |

### Step 5: Sync Schema & Seed Neon Database
From your local development machine, run the schema push and idempotent seed script targeting your production Neon database:

```bash
# On Linux/macOS:
export DATABASE_URL="postgresql://user:pass@ep-xyz-pooler.ap-southeast-1.aws.neon.tech/legalai?sslmode=require"

# On Windows PowerShell:
$env:DATABASE_URL="postgresql://user:pass@ep-xyz-pooler.ap-southeast-1.aws.neon.tech/legalai?sslmode=require"

# 1. Push Prisma schema to Neon PostgreSQL:
npm run db:push

# 2. Seed official Bangladesh law sections, precedents, and demo advocate:
npm run db:seed
```

### Step 6: Deploy & Verify
1. Click **Deploy** in Vercel.
2. Once the deployment finishes, navigate to `https://your-domain.vercel.app`.
3. Log in with the pre-seeded credentials:
   - **Lead Advocate:** `advocate@demo.bd` / `legal123`
   - **Junior Advocate:** `junior@demo.bd` / `legal123`
   - **Platform Owner (Super Admin):** `owner@legalai.bd` / `legal123`

---

## 🔒 Security & Data Integrity Audit

- **Zero Hardcoded Secrets:** Validated via automated git secret scanner; all API keys and secrets resolve strictly from environment variables.
- **RBAC API Gate:** All `/api/*` data routes enforce strict session token authentication returning `401 Unauthorized` for unauthenticated requests.
- **Privacy Protection:** Client phone numbers, addresses, and identifying case facts are sanitized before transmission to AI models.
- **Client Privilege & Ethics:** All pages strictly reflect the Bangladesh Bar Council Canons of Professional Conduct.

---

## 🧪 Automated Testing Suite

```bash
# Run 119 Unit & Integration Tests (Vitest)
npm test

# Run 29 Browser End-to-End Automation Tests (Playwright)
npx playwright test
```

---

## ⚖️ Legal Disclaimer

**LegalAI BD** is an assistive software tool created to enhance professional drafting efficiency for licensed advocates. Output generated by this system does **not** constitute formal legal advice. In compliance with the Bangladesh Bar Council Canons of Professional Conduct, all draft petitions, plaints, and notices must be independently scrutinized, verified, and signed by an Advocate of the Supreme Court or District Courts of Bangladesh prior to court submission.

---

## 📄 License
Copyright © 2026 LegalAI BD. All Rights Reserved.
