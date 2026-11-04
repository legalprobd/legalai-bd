<div align="center">

# ⚖️ LegalAI BD v2.0
### Production-Ready Legal-Tech SaaS for Advocates in Bangladesh
**AI-Powered Intake • Dynamic Legal Interrogation • Court Document Drafting • Case Limitation & Hearing Vault**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Vitest-90%20Unit%20Tests%20Passing-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-23%20E2E%20Tests%20Passing-2EAD33?style=for-the-badge&logo=playwright)](https://playwright.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](#)

</div>

---

## 🌟 Executive Overview

**LegalAI BD** is an enterprise-grade Legal-Tech SaaS engineered specifically for Advocates of the District Courts and the Supreme Court of Bangladesh. It automates the complex legal drafting lifecycle from messy Bengali client oral statements into strictly formatted, court-admissible petitions in seconds.

### 🏆 Key Capabilities
- **Bengali Voice & Text Intake:** Real-time Web Speech (`bn-BD`) voice transcription and unstructured narrative intake with PII sanitization.
- **Dynamic Legal Interrogation (Ingredient Graph):** Evaluates legal elements under the Penal Code 1860, CrPC 1898, CPC 1908, NI Act (2026 amendments), and Specific Relief Act 1877 to calculate a real-time mathematical Completeness Score (`0% - 100%`).
- **34 Court-Standard Draft Templates:** Instant generation of Thana FIRs, General Diaries (GD), C.R. Petitions, Bail Applications (CrPC 497/498), Civil Plaints, Injunction Applications (Order 39 CPC), and Legal Notices.
- **Unicode ⇄ Bijoy (SutonnyMJ ANSI) Converter:** Instant bi-directional translation for legacy court printers and typing requirements.
- **Server-Side PDF & DOCX Export:** Generates pristine A4/Legal judicial documents with embedded Kalpurush fonts and court-admissible letterheads.
- **Evidence Vault & Tesseract OCR:** Secure evidence file upload and automated Bengali OCR text extraction.
- **RAG Live Legal Citation:** Real-time search of official Bangladesh law databases (`bdlaws.minlaw.gov.bd` & `supremecourt.gov.bd`).
- **Strict Limitation & Jurisdiction Engine:** Deterministic calculation under the Limitation Act 1908 with automatic weekend/holiday lawyer review flags and NI Act 2026 pecuniary jurisdiction gates.

---

## 🏛️ System Architect Business Logic Gates

LegalAI BD v2.0 enforces 4 non-negotiable legal architecture constraints:

| Constraint | Rule | Legal Context |
| :--- | :--- | :--- |
| **1. Strict Address Disputed Gate** | `addressDisputed === false` strictly enforced. `null`, `undefined`, or `true` blocks civil plaint drafting. | Order 6 & 7 CPC — Plaint cannot be filed if service address is contested. |
| **2. Real Database Evidence Check** | Verifies `POSTAL_RECEIPT` exists in Prisma DB for the specific case. Rejects synthetic boolean flags. | S. 138 NI Act — Mandatory proof of legal notice delivery by registered post with A/D. |
| **3. NI Act 2026 Pecuniary Jurisdiction** | Check amount `> 5,00,000 BDT` ➔ **Joint Sessions Judge** (`বিজ্ঞ যুগ্ম দায়রা জজ আদালত`). Amount `<= 5,00,000 BDT` ➔ **Chief Judicial Magistrate** (`বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত`). | The Negotiable Instruments Act, 2026 (Act 65/2026), Section 141(C). |
| **4. Holiday Extension Flag** | If limitation expires on Friday, Saturday, or official court holiday, system flags `NEEDS_LAWYER_REVIEW_FOR_HOLIDAY_EXTENSION: true`. | Section 4 Limitation Act 1908 — Requires advocate discretion regarding court closure. |

---

## 🛠️ Tech Stack & Architecture

- **Framework:** [Next.js 16 (App Router & Turbopack)](https://nextjs.org/)
- **Language:** TypeScript 5.0 (Strict Typing)
- **Database & ORM:** PostgreSQL 16 + [Prisma ORM 6.4](https://www.prisma.io/)
- **Authentication:** [NextAuth.js v5 (Auth.js Beta)](https://authjs.dev/) with Session & Cookie RBAC
- **Styling & UI:** Tailwind CSS v4, Lucide Icons, cmdk (Command Palette), Next-Themes (Dark/Light mode)
- **Document Generation:** `docx` (Word OpenXML), `puppeteer` (Headless Chromium Server-Side PDF)
- **OCR Engine:** Tesseract.js (Bengali language support)
- **Testing:** Vitest (90 Unit/Integration Tests) + Playwright (23 End-to-End Browser Tests)

---

## 🚀 Quickstart: Local Development Setup

### 1. Prerequisites
- Node.js 20.x or 22.x LTS
- PostgreSQL 15+ running locally (or remote Neon / Supabase instance)
- npm or pnpm

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/legalai-bd.git
cd legalai-bd
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/legalai?schema=public"
NEXTAUTH_URL="http://localhost:3010"
AUTH_TRUST_HOST="true"
NEXTAUTH_SECRET="super-secret-random-32-byte-key"
AUTH_SECRET="super-secret-random-32-byte-key"
GEMINI_API_KEY="" # Optional: Free key from Google AI Studio
```

### 4. Database Setup & Seeding
Push the schema to PostgreSQL and seed official Bangladesh law sections & demo cases:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 5. Run Tests
Verify all 113 automated tests pass cleanly:
```bash
# Unit & Integration Tests (90 passing)
npm test

# End-to-End Browser Automation Tests (23 passing)
npx playwright test
```

### 6. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3010](http://localhost:3010) in your browser.
- **Demo Advocate Credentials:** `advocate@demo.bd` / `legal123`
- **Junior Advocate Credentials:** `junior@demo.bd` / `legal123`

---

## ☁️ Deployment to Vercel (Step-by-Step)

Follow these steps to deploy LegalAI BD v2.0 to production on Vercel:

### Step 1: Push Repository to GitHub
1. Create a new private repository on GitHub (e.g., `legalai-bd`).
2. Link your local repository and push:
```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/legalai-bd.git
git branch -M main
git push -u origin main
```

### Step 2: Provision a Cloud PostgreSQL Database
Choose any managed PostgreSQL provider (e.g., [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)):
1. Create a new PostgreSQL database instance in the Singapore (`sin1`) or Asia region for lowest latency.
2. Copy the pooled connection string (e.g., `postgresql://user:password@ep-xyz-pooler.ap-southeast-1.neon.tech/neondb?sslmode=require`).

### Step 3: Import Project into Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/) and click **"Add New Project"**.
2. Select your `legalai-bd` repository from GitHub.
3. Framework Preset will auto-detect as **Next.js**.
4. Set Build Command: `npm run build`.
5. Set Install Command: `npm install`.

### Step 4: Add Environment Variables in Vercel
In the Vercel **Environment Variables** configuration tab, add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | Managed PostgreSQL connection string |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | Your Vercel production URL |
| `AUTH_TRUST_HOST` | `true` | Allows NextAuth to run behind Vercel reverse proxy |
| `NEXTAUTH_SECRET` | Generate using `openssl rand -base64 32` | 32-byte production session encryption secret |
| `AUTH_SECRET` | Same as `NEXTAUTH_SECRET` | Required for NextAuth v5 |
| `GEMINI_API_KEY` | `AIzaSy...` | Google AI Studio API key |
| `SERPER_API_KEY` | Optional | For live RAG web search on BD laws |
| `BKASH_WEBHOOK_SECRET`| Optional | Secret for subscription billing webhook |

### Step 5: Migrate and Seed Production Database
Once Vercel finishes the initial build, sync the PostgreSQL schema and seed the law sections:
```bash
# In your local terminal, point DATABASE_URL to your production DB:
export DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Push Prisma schema to production PostgreSQL:
npx prisma db push

# Seed 20+ Bangladesh Law sections and default advocate chamber:
npx tsx prisma/seed.ts
```

Your production SaaS is now live and fully operational! 🚀

---

## 🔒 Security & Data Integrity

- **PII Redaction:** Automatically scrubs personal identifiable information before sending prompts to LLM providers.
- **Zero Secrets Hardcoded:** Validated via automated CI script `scripts/check-secrets.ts`.
- **Role-Based Access Control (RBAC):** Admin routes (`/admin`) and Chamber Settings (`/settings`) are guarded by NextAuth middleware and server-side session checks.
- **Stateless AI Routing:** Graceful fallback to deterministic Bangladeshi legal rule engine when offline or if external AI limits are reached.

---

## ⚖️ Legal Disclaimer

**LegalAI BD** is an assistive software tool created to enhance professional drafting efficiency for licensed advocates. Output generated by this system does **not** constitute formal legal advice. In compliance with the Bangladesh Bar Council Canons of Professional Conduct, all draft petitions, plaints, and notices must be independently scrutinized, verified, and signed by an Advocate of the Supreme Court or District Courts of Bangladesh prior to court submission.

---

## 📄 License
Copyright © 2026 LegalAI BD. All Rights Reserved.
