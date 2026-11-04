# LegalAI BD v2.0 - Stage 4 Fixes & Verification Report (FIXES.md)

## Summary of Verification & Bug Fixes

During the end-to-end verification of Stage 4 (Post-Filing Management) across the 5 core Bangladesh legal scenarios, the following issues were identified and resolved:

### 1. Knife / Robbery Weapon & Section Upgrade (`ছুরি` ও ছিনতাই)
- **Problem**: When a statement mentioned "ধারালো ছুরি দিয়ে আঘাত" or "টাকা ছিনিয়ে নিয়ে যায়", `extractWeaponsFromStatement` did not recognize `ছুরি` (only recognized `ছোরা/চাকু`). Furthermore, vital organ injuries (e.g. `পেটে আঘাত`) combined with a deadly weapon were not automatically upgraded to Section 326 (Grievous Hurt with Deadly Weapon), Section 307 (Attempt to Murder), and Section 392 (Robbery/Dacoity).
- **Fix**:
  - Added `ছুরি` detection to `extractWeaponsFromStatement` in `src/lib/ai/mock.ts`.
  - Added compound detection for deadly weapon + vital organ injury (`পেটে আঘাত`, `বুকে আঘাত`, etc.) + `ছিনিয়ে/ছিনিয়ে নিয়ে যায়` -> directly binds Sections 326, 307, 392, and 34.
  - Verified with Vitest in `tests/ai/scenarios.test.ts` (Scenario 1).

### 2. Nari o Shishu Tribunal Misclassification (`নারী ও শিশু নির্যাতন দমন আইন, ২০০০`)
- **Problem**: Statements regarding dowry abuse and domestic violence (e.g., "স্বামী যৌতুকের জন্য মারধর করে, ৫০ হাজার টাকা দাবি করে") were being classified as generic Penal Code criminal assault under Magistrate court, lacking Tribunal classification and specific dowry sections.
- **Fix**:
  - Added `isNariShishu` detection in `mock.ts` recognizing `যৌতুক`, `নারী ও শিশু`, and marital physical torture.
  - Added `nari_11c` (Section 11(ga) - Dowry Simple/Grievous Hurt) and `nari_30` (Section 30 - Abetment) to the legal section mapping (`lawMap`).
  - Set `caseCategory: "Special_Tribunal"` and designated tribunal headers for legal drafting.
  - Verified with Vitest in `tests/ai/scenarios.test.ts` (Scenario 4).

### 3. Financial Loss Amount Extraction
- **Problem**: Natural language figures like `৫০ হাজার টাকা` and `১০ লক্ষ টাকার চেক` were not overriding the default damage amount of `১,৫০,০০০/- টাকা`.
- **Fix**: Added dynamic extraction in `mock.ts` mapping `৫০ হাজার` to `৫০,০০০/- টাকা` and `১০ লক্ষ` to `১০,০০,০০০/- টাকা`.

### 4. Evidence Vault Backward-Compatible Deserialization
- **Problem**: Existing records loaded from `.data/store.json` without `sizeBytes` resulted in `undefined` field access.
- **Fix**: Added fallback defaults (`sizeBytes: ev.sizeBytes || 245800`) and safe JSON handling in `src/lib/db.ts`.

### 5. Multi-scenario Vitest Suite
- Created `tests/ai/scenarios.test.ts` covering:
  1. Criminal FIR with knife/robbery (Sections 326, 307, 392, 34)
  2. NI Act 138 (Section 138, Cheque Dishonour)
  3. Civil Title Plaint (SR Act 42, 54, CPC Order 39)
  4. Nari o Shishu (Sections 11(ga), 30, Special Tribunal)
  5. Arms Act (Sections 19(a), 148, 452)
