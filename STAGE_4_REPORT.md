# LegalAI BD v2.0 — Stage 4: Post-Filing Management Implementation Report

**Date:** 2026-11-04  
**Project:** LegalAI BD v2.0 (Legal-Tech SaaS for Bangladeshi Advocates)  
**Environment:** Next.js 16 (App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL / File-backed Store  
**Server Port:** 3010 (Reverse proxy on Laragon port 8010)

---

## 1. Executive Summary

All components of **Stage 4 (Post-Filing Management)** have been completely built, integrated, tested, and verified end-to-end:
1. **Limitation Calculator Engine:** Built around *The Limitation Act, 1908* and special Bangladesh statutes with dynamic status alerting (SAFE, APPROACHING, CRITICAL, EXPIRED, NO_DEADLINE).
2. **Hearing Tracker / Court Diary:** Full court diary system for hearing management, order sheet recording, cause list tracking, and Bangladesh court vacation / holiday awareness.
3. **Evidence Vault:** Secure evidence storage and management with strict file size/MIME validation, fact-mapping to case ingredients, and OCR stubbing.
4. **End-to-End Verification of 5 Legal Scenarios:** Verified with dedicated Vitest tests in `tests/ai/scenarios.test.ts` and all fixes documented in `FIXES.md`.
5. **Advocate Dashboard & Case Navigation:** Enhanced dashboard with 4 core stats cards, upcoming 7-day hearing schedule, urgent limitation alerts banner, and streamlined case sub-tabs (`/case/[id]`, `/case/[id]/hearings`, `/case/[id]/evidence`).
6. **Zero TypeScript Errors & 100% Test Pass Rate:** 44 Vitest tests passing (exceeding target of ≥30 from baseline of 21) with zero TypeScript build errors (`next build`).

---

## 2. Detailed Task Deliverables

### Task 1: Limitation Calculator Engine
- **Module:** `src/lib/law/limitation.ts`
  - Defines `LIMITATION_RULES` covering:
    - `CIVIL_POSSESSION_RECOVERY` (SR Act 1877, Section 9 — 180 days)
    - `CIVIL_DECLARATION_TITLE` (Limitation Act 1908, Art 120/113 — 1095 days / 3 years)
    - `CIVIL_MONEY_SUIT` (Limitation Act 1908, Art 113/64 — 1095 days)
    - `CRIMINAL_FIR` (CrPC 1898, Section 154 — 0 days, delay requires explanation)
    - `NI_ACT_138_NOTICE` (NI Act 1881, Section 138(b) — 30 days)
    - `NI_ACT_138_FILING` (NI Act 1881, Section 138(c) — 30 days)
    - `NARI_SHISHU_COMPLAINT` (Nari o Shishu 2000, Section 11/30 — 0 days)
    - `CIVIL_APPEAL` (CPC 1908, Order 41 Rule 1 — 90 days)
    - `CRIMINAL_APPEAL` (CrPC 1898, Section 408 — 60 days)
  - `calculateDeadline(caseType, triggerDate, now?)`: Computes days remaining, expiration status, and provides legal guidance including Section 5 condonation notes when time-barred.
- **Prisma & Storage Schema:**
  - Added `limitationTriggerDate`, `limitationDeadline`, and `limitationCaseType` to `Case` model in `prisma/schema.prisma`, `src/lib/ai/schemas.ts`, and `src/lib/db.ts`.
- **API Endpoints:**
  - `GET /api/cases/[id]/limitation`: Returns current case calculation and available statutory rules.
  - `POST /api/cases/[id]/limitation`: Updates case limitation rule and trigger date, persists to store, and logs audit.
- **UI Components:**
  - `src/components/workspace/LimitationCard.tsx`: Interactive countdown badge with visual status pill, date selector, rule dropdown, and guidance notes.
  - Embedded into `src/components/workspace/InterrogationPanel.tsx`.
- **Vitest Unit Tests:**
  - `tests/unit/limitation.test.ts` (7 passing tests).

---

### Task 2: Hearing Tracker / Court Diary
- **Prisma & Storage Schema:**
  - Added `judgeName String?` to `model Hearing` in `prisma/schema.prisma`, `src/lib/ai/schemas.ts`, and `src/lib/db.ts`.
- **API Endpoints:**
  - `GET /api/cases/[id]/hearings`: List all hearings for a case sorted chronologically.
  - `POST /api/cases/[id]/hearings`: Record new hearing with purpose, judge name, outcome, order sheet notes, and next hearing date.
  - `PATCH /api/cases/[id]/hearings/[hid]`: Update existing hearing and order sheet notes.
  - `DELETE /api/cases/[id]/hearings/[hid]`: Remove hearing record.
  - `GET /api/hearings/upcoming`: Retrieve upcoming hearings across cases for 7 or 30 days window.
- **UI Components & Pages:**
  - `src/components/workspace/HearingTimeline.tsx`: Chronological hearing timeline with visual status badges ("আজকের শুনানি", "আসন্ন তারিখ", "সম্পন্ন"), inline order sheet editor, and deletion.
  - `src/app/case/[id]/hearings/page.tsx`: Dedicated case court diary page with unified navigation sub-tabs.
  - `src/app/calendar/page.tsx`: Full Court Calendar & Cause List (দৈনিক কার্যতালিকা) with Supreme Court & District Court holidays.
- **Vitest Unit Tests:**
  - `tests/unit/hearing.test.ts` (5 passing tests).

---

### Task 3: Evidence Vault
- **Storage Subsystem:**
  - `src/lib/storage.ts`: Handles file uploads into `public/uploads/[caseId]/`, validates allowed MIME types (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.docx`, `.doc`), enforces 10MB limit, and deletes stored files cleanly.
- **Prisma & Storage Schema:**
  - Updated `model EvidenceFile` with `sizeBytes Int @default(0)` and `factMapping Json @default("{}")`.
- **API Endpoints:**
  - `GET /api/cases/[id]/evidence`: List uploaded evidence files.
  - `POST /api/cases/[id]/evidence`: Multipart `FormData` or JSON file upload handler.
  - `PATCH /api/cases/[id]/evidence/[eid]`: Update fact mapping and metadata.
  - `DELETE /api/cases/[id]/evidence/[eid]`: Delete file from filesystem and database.
  - `POST /api/cases/[id]/evidence/[eid]/ocr`: OCR stub endpoint returning `{ ok: true, data: { ocrTextBn: "OCR will be added in Stage 5" } }`.
- **UI Components & Pages:**
  - `src/components/workspace/EvidenceVault.tsx`: File upload dropzone, fact-tagging dropdown, file metadata preview, OCR trigger, and view links.
  - `src/app/case/[id]/evidence/page.tsx`: Dedicated case evidence management page with sub-tabs.
- **Vitest Unit Tests:**
  - `tests/unit/evidence.test.ts` (6 passing tests).

---

### Task 4: End-to-End Verification of 5 Legal Scenarios
Verified and ensured automated handling for all 5 core scenarios:
1. **Criminal FIR with knife/robbery:** `গতকাল রাতে রহিম ও করিম ধারালো ছুরি দিয়ে আমার পেটে আঘাত করে ৫০ হাজার টাকা ছিনিয়ে নিয়ে যায়`  
   → Sections: 326 (Deadly weapon grievous hurt), 307 (Attempt to murder), 392 (Robbery), 34. Accused: Rahim, Karim.
2. **NI Act 138 (Cheque Dishonour):** `জহিরুল ১০ লক্ষ টাকার চেক দিয়েছে, অপর্যাপ্ত তহবিলে ডিজঅনার হয়েছে, লিগ্যাল নোটিশ পাঠিয়েছি`  
   → Section 138, financial loss extracted as 10,00,000/- BDT.
3. **Civil Title Plaint:** `কুদ্দুস তালুকদার আমার পৈতৃক জমি দখল করে অবৈধ স্থাপনা বানাচ্ছে`  
   → Sections: SR Act 42 (Title), 54 (Permanent Injunction), CPC Order 39. Category: Civil.
4. **Nari o Shishu 11/30:** `স্বামী যৌতুকের জন্য মারধর করে, ৫০ হাজার টাকা দাবি করে`  
   → Sections: 11(ga) (Torture for dowry), 30 (Abetment). Category: Special_Tribunal.
5. **Arms Act 19a/148/452:** `মোতালেব পিস্তল উঁচিয়ে আমার বাড়ি দখল করেছে`  
   → Sections: Arms Act 19(a), 148, 452, 506, 34. Category: Criminal.
- Fixes documented in `FIXES.md`.
- Vitest suite: `tests/ai/scenarios.test.ts` (5 passing tests).

---

### Task 5: Advocate Dashboard & Case Navigation
- **Dashboard (`/` and `/dashboard`):**
  - **4 Stats Cards:**
    1. মোট নথিভুক্ত মামলা (Total Cases)
    2. খসড়া অপেক্ষমাণ (Pending Drafts / Interviewing)
    3. আসন্ন শুনানি (Upcoming Hearings 7d)
    4. জরুরি তামাদি (Urgent Limitations 30d)
  - **Urgent Limitations Warning Banner:** Prominently alerts advocates if any case has a deadline within 7 days or is time-barred.
  - **Upcoming Hearings (7d) Quick Widget:** Direct links to hearing diary entries.
- **Unified Case Navigation Sub-Tabs:**
  - `মামলার খসড়া ও ইন্টারোগেশন` (`/case/[id]`)
  - `কোর্ট ডায়েরি ও শুনানি` (`/case/[id]/hearings`)
  - `প্রমাণপত্র ও এভিডেন্স ভল্ট` (`/case/[id]/evidence`)

---

## 3. Verification & Build Metrics

| Metric | Baseline (Stage 3) | Stage 4 Target | Stage 4 Achieved |
| :--- | :---: | :---: | :---: |
| **Vitest Tests Passing** | 21 | ≥ 30 | **44** |
| **Test Suites** | 5 | ≥ 8 | **9** |
| **TypeScript Build Errors** | 0 | 0 | **0** (`next build` succeeded) |
| **Production Server Status** | Port 3010 | Port 3010 | **Online & Serving HTTP 200** |

All tests passed in 331ms with 0 failures:
- `tests/unit/limitation.test.ts` (7 tests)
- `tests/unit/hearing.test.ts` (5 tests)
- `tests/unit/evidence.test.ts` (6 tests)
- `tests/ai/scenarios.test.ts` (5 tests)
- `tests/ai/golden.test.ts` (5 tests)
- `tests/unit/upgradeRules.test.ts` (4 tests)
- `tests/unit/bijoyConverter.test.ts` (4 tests)
- `tests/unit/completeness.test.ts` (4 tests)
- `tests/unit/guards.test.ts` (4 tests)
