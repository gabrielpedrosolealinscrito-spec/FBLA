# Phase 7 Research — Visa Concierge Pathways

**Compiled:** 2026-06-01 · **For:** Phase 7 (VISA-01..04) · **Status:** Sourced draft, citation-first

> **UPL boundary (VISA-04).** Everything here is **general program information, not legal advice.** The app must present it as informational only, frame pathways as "general eligibility criteria," and carry a persistent "consult a licensed immigration attorney" line plus an attorney-referral CTA. Never tell an individual user what they personally qualify for or should file.

**FX (ECB, 1 Jun 2026):** EUR/USD 1.1646 · CAD/USD 0.7242. [ECB](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)

---

## Pathway 1 — Portugal D8 (Digital Nomad / Remote-Work Residence Visa)

```js
{ destinationCountry: "Portugal",
  visaType: "D8 — Digital Nomad / Remote-Work Residence Visa",
  requirements: [
    "Remote income from outside Portugal ≥ 4× Portuguese minimum wage (2026: €920 → €3,680/mo)",
    "+50% of threshold per accompanying spouse, +30% per dependent child",
    "Savings ≥ €11,040 (≈12× minimum wage)",
    "Employment contract / freelance contracts proving remote work",
    "Clean criminal record (apostilled background check)",
    "Valid health insurance covering Portugal",
    "Proof of accommodation in Portugal",
    "Portuguese tax number (NIF)"
  ],
  processingTime: "Consulate visa 30–60 days; full residence card ~4–7 months incl. AIMA appointment",
  feeRangeUSD: "~$370–450 in government/service fees (D visa €110 + VFS ~€40 + AIMA permit ~€170/person); excludes insurance, translations, legal help",
  pros: [
    "EU residence + Schengen free travel",
    "Path to permanent residency / citizenship after 5 years",
    "Relatively low income bar vs other EU options",
    "Family reunification allowed",
    "Possible IFICI/NHR 2.0 20% flat tax for qualifying professions"
  ],
  cons: [
    "AIMA appointment backlogs (90–120 days in Lisbon/Porto)",
    "Must continuously maintain the income threshold",
    "Portuguese tax residency = worldwide income taxation unless IFICI applies",
    "Rising Lisbon rents erode the cost advantage",
    "Bureaucratic, document-heavy process"
  ],
  documentChecklist: [
    "Valid passport (6+ months)",
    "Completed national visa application form",
    "2 passport photos",
    "Proof of remote income (3 months bank statements + employment/freelance contract)",
    "Proof of savings ≥ €11,040",
    "Apostilled criminal background check",
    "Travel + health insurance",
    "Proof of accommodation in Portugal",
    "Portuguese NIF (tax number)",
    "Proof of fee payment"
  ],
  officialSources: [
    "https://aima.gov.pt",
    "https://vistos.mne.gov.pt",
    "https://www.gov.pt"
  ] }
```

| Detail | Figure | Source |
|---|---|---|
| Min. monthly income | €3,680 (4× €920 min wage, 2026) — assessed at wage in force at AIMA appointment | min wage confirmed: [Decree-Law 139/2025 (Garrigues)](https://www.garrigues.com/en_GB/new/portugal-minimum-monthly-wage-increases-2026) · [Get Golden Visa D8 2026](https://getgoldenvisa.com/portugal-digital-nomad-visa) · [imin-portugal D8 2026](https://imin-portugal.com/blog/portugal-digital-nomad-visa/) |
| Savings requirement | ≥ €11,040 | [Global Citizen Solutions D8](https://www.globalcitizensolutions.com/portugal-digital-nomad-visa/) |
| Government/service fees | D visa €110 + VFS ~€40 + AIMA permit ~€160–170/person | [imin-portugal costs 2026](https://imin-portugal.com/blog/portugal-digital-nomad-visa/) |
| Processing time | Consulate 30–60 days; full card ~4–7 months | [Global Citizen Solutions D8](https://www.globalcitizensolutions.com/portugal-digital-nomad-visa/) |

---

## Pathway 2 — Canada Express Entry (Federal Economic PR)

```js
{ destinationCountry: "Canada",
  visaType: "Express Entry — Federal economic PR (FSW / CEC / FST, ranked by CRS)",
  requirements: [
    "Create an Express Entry profile (free) and enter the pool",
    "Meet one program's minimums: FSW (CLB 7 all abilities + 67/100 FSW points), CEC (CLB 7 for TEER 0/1 or CLB 5 for TEER 2/3 + 1yr Canadian skilled experience), FST (CLB 5 speak/listen, CLB 4 read/write)",
    "Comprehensive Ranking System (CRS) score at or above the draw cut-off",
    "Language test (IELTS/CELPIP for English, TEF/TCF for French)",
    "Educational Credential Assessment (ECA) for foreign education",
    "Proof of settlement funds (unless CEC or valid job offer)"
  ],
  processingTime: "IRCC 6-month service standard for most complete PR applications after an Invitation to Apply",
  feeRangeUSD: "Single applicant ~C$1,675 incl. biometrics ≈ ~$1,213 USD govt fees; ~C$2,300–3,000+ all-in with language test, ECA, medical, police certs",
  pros: [
    "Direct permanent residence (not a temporary permit)",
    "~6-month standard processing",
    "Includes spouse + dependent children",
    "Path to citizenship in ~3 years",
    "No employer sponsorship required",
    "Provincial healthcare access on landing"
  ],
  cons: [
    "Competitive CRS cut-offs (475–510 in early 2026; >500 strong)",
    "Proposed 2026 reforms may reweight selection (income/job-offer, unified CLB 6) — not finalized",
    "Upfront cost/time of tests, ECA, medical",
    "Proof-of-funds requirement (unless CEC/job offer)"
  ],
  documentChecklist: [
    "Valid passport",
    "Language test results (IELTS/CELPIP or TEF/TCF)",
    "Educational Credential Assessment (ECA) report",
    "Proof of skilled work experience (reference letters)",
    "Proof of settlement funds",
    "Police certificates",
    "Upfront medical exam (IRCC panel physician)",
    "Digital photo + biometrics"
  ],
  officialSources: [
    "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html",
    "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html",
    "https://ircc.canada.ca/english/information/fees/fees.asp"
  ] }
```

| Detail | Figure | Source |
|---|---|---|
| Principal processing + RPRF | C$990 + C$600 = **C$1,590** (as of 30 Apr 2026) | [IRCC fee list](https://ircc.canada.ca/english/information/fees/fees.asp) · [VG Immigration: Apr 30 2026 increase](https://vgis.ca/canada-pr-fees-increase-april-30-2026-what-you-need-to-know/) |
| Biometrics | C$85/person (max C$170/family) | [IRCC fee list](https://ircc.canada.ca/english/information/fees/fees.asp) |
| Spouse / dependent child | C$990 / C$270 | [CIC News cost breakdown](https://www.cicnews.com/2025/11/how-much-does-it-cost-to-immigrate-through-express-entry-1162232.html) |
| Language minimums | FSW/CEC(TEER0-1) CLB 7; CEC(TEER2-3) CLB 5; FST CLB 5/4 | [IRCC FSW](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html) |
| CRS cut-offs early 2026 | 475–510 general; competitive >500 | [CIC News](https://www.cicnews.com/2026/04/breaking-express-entry-overhaul-eligibility-and-crs-selection-details-revealed-for-proposed-changes-0474005.html) |

---

## Comparison Table (screener-ready)

| | Portugal D8 | Canada Express Entry |
|---|---|---|
| Type | Remote-work residence visa | Permanent residence (economic) |
| Key bar | Income ≥ €3,680/mo + €11,040 savings | CRS ≥ draw cut-off (~500), CLB 7 |
| Govt fees | ~$370–450 | ~$1,213 (single, +tests/ECA all-in ~$2,300+) |
| Timeline | ~4–7 months | ~6 months post-ITA |
| Best for | Remote earners wanting EU lifestyle + Schengen | Skilled pros wanting permanent immigration + citizenship |
| Tax note | PT tax residency; possible 20% IFICI flat | Canadian tax residency; full PR rights |
| Status outcome | Temporary residence → PR after 5 yrs | Immediate PR |

## "Coming soon" pathways (mention only, not built out)
- **Germany — Opportunity Card (Chancenkarte) / EU Blue Card** — points-based job-seeker / skilled-worker route. [Make it in Germany](https://www.make-it-in-germany.com/en/visa-residence/types/opportunity-card)
- **UK — Skilled Worker / Global Talent** — employer-sponsored or talent-endorsed routes. [GOV.UK Skilled Worker](https://www.gov.uk/skilled-worker-visa) · [GOV.UK Global Talent](https://www.gov.uk/global-talent)
- **Canada — Provincial Nominee Programs (PNP)** — province-specific streams that add 600 CRS points. [IRCC PNP](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html)

## Eligibility-screener mapping sketch (informational heuristics, VISA-01)
Route signals from the captured Profile (citizenship, immigration status, income, savings, remote-work flag, profession, age, education) to a *suggested* pathway to learn about — never a determination:
- **EU/EEA citizen** → free movement to Lisbon/Berlin (no visa needed); surface that, skip D8.
- **Non-EU + remote income ≥ €3,680/mo + savings ≥ €11,040** → surface **Portugal D8** as primary.
- **Skilled professional (TEER 0/1) + strong English/French + degree (ECA-able) + age < 35** → surface **Canada Express Entry** (strong CRS factors).
- **High savings + location-independent income, lifestyle-driven** → weight D8.
- **Wants permanent immigration / citizenship path / family settlement** → weight Express Entry.
- **Neither threshold met** → show "coming soon" routes + attorney-referral CTA, no false encouragement.

Each screener output must end with: *"Informational only — not legal advice. Eligibility is determined by the relevant government authority; consult a licensed immigration attorney."*

---

## Sources
- Portugal D8: [Get Golden Visa](https://getgoldenvisa.com/portugal-digital-nomad-visa) · [imin-portugal](https://imin-portugal.com/blog/portugal-digital-nomad-visa/) · [Global Citizen Solutions](https://www.globalcitizensolutions.com/portugal-digital-nomad-visa/) · official: [AIMA](https://aima.gov.pt) · [Portuguese MFA visas](https://vistos.mne.gov.pt)
- Canada Express Entry: [IRCC Express Entry](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html) · [CRS criteria](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html) · [FSW](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html) · [IRCC fee list](https://ircc.canada.ca/english/information/fees/fees.asp) · [CIC News fees](https://www.cicnews.com/2025/11/how-much-does-it-cost-to-immigrate-through-express-entry-1162232.html) · [CIC News 2026 reforms](https://www.cicnews.com/2026/04/breaking-express-entry-overhaul-eligibility-and-crs-selection-details-revealed-for-proposed-changes-0474005.html)

## Gaps / verify-before-pitch
1. **Portugal min wage 2026 = €920 — CONFIRMED** via Decree-Law 139/2025 (gazetted 29 Dec 2025). The D8 threshold (4× = €3,680/mo) and savings (12× = €11,040) are therefore traceable to a government decree, not just aggregators. ✅
2. **AIMA permit fee (~€160–170)** is from aggregators; confirm on aima.gov.pt.
3. **Canada fees** are post-30-Apr-2026 increase — confirm current values directly on the IRCC fee list (they change without much notice).
4. **2026 Express Entry reforms** (unified CLB 6, income/job-offer reweighting) are **proposed, not law** as of compile date — present current rules as authoritative and flag reforms as "proposed."
5. All figures cite reputable aggregators where an official page wasn't directly fetched; before the pitch, open the official AIMA/IRCC/GOV.UK pages and screenshot the exact figures for the Q&A binder.
