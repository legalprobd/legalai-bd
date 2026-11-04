# BATCH 5.1: Template Provenance & Statutory Source Audit

**Audit Date:** 2026-11-04  
**Auditor:** Senior Full-Stack AI Engineer & QA Lead  
**Scope:** All 34 BD Court Document Templates (`DraftDocTypeEnum`) in LegalAI BD v2.0  
**Honest Lawyer Review Status:** **PENDING** (None of the templates have received formal Bar Council / Senior Advocate sign-off for live court filing).

---

## 1. Statutory Provenance of All 34 Court Document Templates

| # | Template Key (`docType`) | Bengali Document Name | Primary Legal Authority / Statutory Source | Lawyer Review Status |
|---|---------------------------|-----------------------|--------------------------------------------|----------------------|
| 1 | `FIR` | থানার এজাহার (FIR) | CrPC 1898, Sec 154; Police Regulations Bengal (PRB) 1943 Rule 243 | **Lawyer Review: PENDING** |
| 2 | `GD` | সাধারণ ডায়েরি (GD) | The Police Act, 1861, Sec 44; PRB 1943 Rule 377; CrPC Sec 155 | **Lawyer Review: PENDING** |
| 3 | `CR_PETITION` | নালিশি সি.আর. মামলার আরজি | CrPC 1898, Sec 190(1)(a) & Sec 200 (Complaint) | **Lawyer Review: PENDING** |
| 4 | `BAIL_PETITION` | জামিনের দরখাস্ত | CrPC 1898, Sec 496 (Bailable) & Sec 497 (Non-Bailable) | **Lawyer Review: PENDING** |
| 5 | `ANTICIPATORY_BAIL` | আগাম জামিনের আবেদন | CrPC 1898, Sec 498 (High Court Division / Sessions Court) | **Lawyer Review: PENDING** |
| 6 | `NARAJI` | নারাজি দরখাস্ত (Protest Petition) | CrPC 1898, Sec 173 read with Sec 190 & 200 | **Lawyer Review: PENDING** |
| 7 | `QUASHMENT_561A` | কোয়াশমেন্ট পিটিশন | CrPC 1898, Sec 561A (Inherent power of High Court Division) | **Lawyer Review: PENDING** |
| 8 | `REVISION` | ফৌজদারি/দেওয়ানি রিভিশন | CrPC 1898, Sec 435, 439 & 439A / CPC 1908 Sec 115 | **Lawyer Review: PENDING** |
| 9 | `CRIMINAL_APPEAL` | ফৌজদারি আপিল | CrPC 1898, Sec 408 & Sec 410 | **Lawyer Review: PENDING** |
| 10 | `COMPLAINT_DISMISSAL` | মামলা খারিজের আবেদন | CrPC 1898, Sec 203 & Sec 247 | **Lawyer Review: PENDING** |
| 11 | `TIME_PETITION` | সময়ের আবেদন (Time Petition) | CrPC 1898, Sec 344 / CPC 1908 Order 17 Rule 1 | **Lawyer Review: PENDING** |
| 12 | `CROSS_EXAM_QUESTIONS` | জেরা প্রশ্নমালা (Cross-Examination) | Evidence Act 1872, Sec 137, 138, 145, 146 | **Lawyer Review: PENDING** |
| 13 | `PLAINT` | দেওয়ানি আরজি (Civil Plaint) | CPC 1908, Order 7 Rule 1 & Section 26 | **Lawyer Review: PENDING** |
| 14 | `WRITTEN_STATEMENT` | লিখিত জবাব (Written Statement) | CPC 1908, Order 8 Rule 1 | **Lawyer Review: PENDING** |
| 15 | `INJUNCTION_TEMP` | অস্থায়ী নিষেধাজ্ঞার দরখাস্ত | CPC 1908, Order 39 Rules 1-2 & Section 151 | **Lawyer Review: PENDING** |
| 16 | `INJUNCTION_PERMANENT` | চিরস্থায়ী নিষেধাজ্ঞার আরজি | Specific Relief Act 1877, Sections 53, 54 & 55 | **Lawyer Review: PENDING** |
| 17 | `EXECUTION_PETITION` | জারি মোকদ্দমার আবেদন | CPC 1908, Order 21 Rule 11 & Section 38 | **Lawyer Review: PENDING** |
| 18 | `AFFIDAVIT` | হলফনামা (Affidavit) | CPC 1908, Order 19 Rule 1; Civil Rules & Orders Vol-I | **Lawyer Review: PENDING** |
| 19 | `POWER_OF_ATTORNEY` | আমমোক্তারনামা | The Power of Attorney Act 2012; POA Rules 2015 | **Lawyer Review: PENDING** |
| 20 | `VAKALATNAMA` | ওকালতনামা | Legal Practitioners & Bar Council Act 1972, CRO Vol-I | **Lawyer Review: PENDING** |
| 21 | `AMENDMENT_PETITION` | আরজি/জবাব সংশোধনের দরখাস্ত | CPC 1908, Order 6 Rule 17 | **Lawyer Review: PENDING** |
| 22 | `DIVORCE_PLAINT` | বিবাহ বিচ্ছেদ / তালাকে তৌফিজ | Dissolution of Muslim Marriages Act 1939; Family Courts Act 2023 | **Lawyer Review: PENDING** |
| 23 | `DOWER_RECOVERY` | দেনমোহর আদায়ের মোকদ্দমা | Family Courts Act 2023, Section 4; MFLO 1961 Section 10 | **Lawyer Review: PENDING** |
| 24 | `MAINTENANCE` | খোরপোষ মোকদ্দমা | Family Courts Act 2023, Section 4; CrPC Sec 488; MFLO Sec 9 | **Lawyer Review: PENDING** |
| 25 | `CUSTODY` | সন্তানের অভিভাবকত্ব ও জিম্মা | Guardians and Wards Act 1890, Sec 7, 17; Family Courts Act 2023 | **Lawyer Review: PENDING** |
| 26 | `RESTITUTION_CONJUGAL` | দাম্পত্য অধিকার পুনরুদ্ধার | Family Courts Act 2023, Section 4 | **Lawyer Review: PENDING** |
| 27 | `ARTHA_RIN_PLAINT` | অর্থ ঋণ মোকদ্দমার আরজি | Artha Rin Adalat Ain 2003, Sections 5 & 6 | **Lawyer Review: PENDING** |
| 28 | `ARTHA_RIN_WRITTEN` | অর্থ ঋণ লিখিত জবাব | Artha Rin Adalat Ain 2003, Section 13 | **Lawyer Review: PENDING** |
| 29 | `LABOUR_COMPLAINT` | শ্রম আদালত নালিশি আবেদন | Bangladesh Labour Act 2006, Sections 33 & 213 | **Lawyer Review: PENDING** |
| 30 | `CYBER_COMPLAINT` | সাইবার ট্রাইব্যুনাল নালিশ | Cyber Security Act 2023, Sections 24, 25, 29 | **Lawyer Review: PENDING** |
| 31 | `LEGAL_NOTICE` | লিগ্যাল নোটিশ | NI Act 1881 Sec 138(b) / TP Act 1882 Sec 106 / CPC Sec 80 | **Lawyer Review: PENDING** |
| 32 | `DAMAGE_INVENTORY` | ক্ষতির বিবরণী ও ফর্দ | CPC 1908, Order 7 Rule 14 & Evidence Act 1872 | **Lawyer Review: PENDING** |
| 33 | `WITNESS_LIST` | সাক্ষীদের নাম ও তালিকা | CPC 1908 Order 16 Rule 1 / CrPC 1898 Sec 204(1A) | **Lawyer Review: PENDING** |
| 34 | `NAME_CORRECTION_AFFIDAVIT` | নাম সংশোধন হলফনামা | The Notaries Ordinance 1961, Section 8 | **Lawyer Review: PENDING** |

---

## 2. Engineer's Independent Finding
* All 34 template structures conform to the structural requirements of standard Bangladesh civil and criminal procedure forms.
* **CRITICAL DISCLAIMER:** LegalAI BD v2.0 serves strictly as an assistive tool for licensed advocates. **None of the generated documents are certified for direct court submission without review and physical signature by an enrolled advocate of the Bangladesh Bar Council.**
