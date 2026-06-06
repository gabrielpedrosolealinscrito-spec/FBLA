# Phase 7: Visa Concierge — Research

**Researched:** 2026-06-05
**Domain:** Immigration visa pathways (Portugal D8, Canada Express Entry) + authored-data module + silent screener logic
**Confidence:** MEDIUM — official government sites returned 403; all figures cross-verified against 3+ independent immigration guides/attorneys whose content is consistent and recent (March–June 2026). Planner must mark each raw figure with a "verify at [authority]" checkpoint before shipping.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01: Silent screener — zero extra questions.** Runs entirely off existing Profile fields; user clicks in and instantly sees pathways + fit. Fully deterministic and offline-safe.
- **D-02: Pathways surface by citizenship + destination.** Driven by `Profile.citizenship` + matched destination country. Profession and finances feed document notes, not pathway filtering.
- **D-03: Graded likelihood fit signal.** Strong fit / Possible / Long shot, with single named gating factor. Framed as informational assessment, not legal determination.
- **D-04: Generic attorney-referral CTA + visible disclaimer.** "Not legal advice — consult a licensed immigration attorney." CTA is a non-functional placeholder for demo.
- **D-05: Author 2 required pathways only — deeply + citation-perfect.** Portugal D8 and Canada Express Entry, every figure verifiable. No broad matrix.
- **D-06: Off-script destinations → generic honest skeleton.** No invented specifics, no fake numbers. Mirrors Phase 6 D-07 fallback.
- **D-07: Dedicated Visa screen, side-by-side comparison.** True 2-column comparison (not stacked cards); graded fit badge per column; per-pathway checklist + cited sources + disclaimer/CTA.
- **Authored truth only — never LLM-invented.** Inherits Phase 6 D-05 / ROAD-02. All visa facts authored.
- **Sources as styled text, never `<a>` links.** Inherits Phase 5 D-10.
- **"Data as of [date]" labeling on all cited figures.** Point-in-time snapshot.
- **Offline-mandatory critical path.** Zero network calls on the concierge render path.

### Claude's Discretion

- Comparison-table column layout + responsiveness (handled by UI-SPEC: auto-fit grid, no media query).
- Navigation/entry-point wiring from roadmap teaser and results.
- Per-figure citation density and how source attributions attach visually.
- Where `VISA_PATHWAYS` data module lives under `shared/data/` and the screener helper shape.
- Exact gating-factor logic deriving Strong/Possible/Long-shot from Profile (research thresholds, author them, don't LLM them).

### Deferred Ideas (OUT OF SCOPE)

- US-inbound pathway (O-1A / H-1B)
- Citizenship-keyed pathway matrix
- Affiliate-wired attorney referral
- Live-AI prose enrich on visa framing
- Real-time visa-policy-change tracking
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VISA-01 | Eligibility screener mapping profile to likely visa pathways | Screener design: D-01/D-02; citizenship+destination-keyed VISA_PATHWAYS; graded-fit thresholds documented below |
| VISA-02 | Side-by-side comparison for Portugal D8 + Canada Express Entry (type, requirements, time, fee, pros/cons) | Full figures researched and documented; VisaPathway contract already locked in shared/types.ts |
| VISA-03 | Per-pathway document checklist + cost/timeline with every figure cited to official source + "data as of" | Document checklists + fee/time figures + source authorities documented; FX-dated USD conversions provided |
| VISA-04 | UPL boundary — informational only, attorney-referral CTA | Disclaimer copy + CTA design in UI-SPEC; UPL framing discipline documented in this research |
</phase_requirements>

---

## Summary

Phase 7 is a **data-authoring and UI-wiring phase**, not a library-addition phase. There are zero new npm packages — the entire deliverable is: (1) an authored `VISA_PATHWAYS` TypeScript data module in `shared/data/`, (2) a pure screener/grading helper in `shared/engine/`, and (3) the `src/screens/Visa.jsx` screen rendering the UI-SPEC contract. The critical path is getting the authored figures right, not architecture.

The primary technical complication is the **demo destination mismatch** (see Open Questions Q-1): the live golden-path cache and the only authored Phase 6 roadmap currently target London/UK, not Lisbon/Portugal. CONTEXT D-05 pins Phase 7 to Lisbon/Portugal, but the screener is keyed to `matchedDestination.country`, which for the current demo persona resolves to `"UK"` — not `"Portugal"`. This means the authored Portugal D8 pathway will NOT surface for the scripted demo unless either (a) the demo persona's top international city is changed to Lisbon, or (b) the screener is designed to show all citizenship-relevant pathways regardless of top-matched destination. The planner must surface this conflict as a gated decision before authoring content.

All Portugal D8 figures use the 4× Portuguese minimum wage formula (€920/month × 4 = €3,680/month as of January 2026). All Canada Express Entry government fees reflect the April 30, 2026 IRCC increase. USD conversions use dated exchange rates (EUR/USD 1.164, CAD/USD 0.719, both as of June 5, 2026) and must be re-verified at authoring time.

**Primary recommendation:** Author the `VISA_PATHWAYS` data module first (Wave 0), gate all authored figures behind a `checkpoint:human-verify` task against AIMA and IRCC official pages, then wire the screener helper and Visa screen. Resolve the destination-mismatch open question before any content authoring.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| VISA_PATHWAYS authored data | shared/data/ (TS) | — | Contract-first rule: data lives in shared/, same as roadmap-templates.ts and cities.ts |
| Screener selection helper | shared/engine/ (TS) | — | Pure function, deterministic, testable offline; mirrors buildRoadmap() pattern |
| Graded-fit computation | shared/engine/ (TS) | — | Deterministic threshold logic belongs in the engine layer, not JSX |
| Visa screen + comparison UI | src/screens/Visa.jsx | — | JSX UI layer; reads from shared data + engine helper |
| Disclaimer/CTA component | src/screens/Visa.jsx | — | Inline component; no network calls; Phase 2 dealbreaker-banner pattern |
| Off-script generic skeleton | shared/data/ (TS constant) | src/screens/Visa.jsx | Constant defined in data module; rendered conditionally by Visa.jsx |

---

## Standard Stack

**No new packages.** This phase is purely authored data + pure TS logic + JSX UI. The entire stack is inherited.

### Inherited Stack (no changes)

| Asset | Purpose | Owner |
|-------|---------|-------|
| `shared/types.ts` VisaPathway | Locked contract — populate, do not redesign | shared |
| `shared/data/roadmap-templates.ts` | Pattern mirror for VISA_PATHWAYS data module | shared |
| `shared/engine/roadmap.ts` | Pattern mirror for screener helper (pure function + context object) | shared |
| `src/screens/Visa.jsx` | Named screen slot already in scaffold — implement here | frontend |
| Vitest (`npm test`) | Test runner — inline with vite.config.js test block | dev |
| Inline JSX style objects | All UI — no tailwind, no shadcn, inherited Phase 2 lock | frontend |

### Package Legitimacy Audit

> Not applicable — zero new packages installed in this phase.

**All packages:** inherited from prior phases; no install step in Phase 7.

---

## Architecture Patterns

### System Architecture Diagram

```
Profile (citizenship, income, hasRemote, destination)
         │
         ▼
  selectVisaPathways(profile, matchedDestination)   ← shared/engine/visa.ts
         │  keys VISA_PATHWAYS[citizenship][country]
         │  or → GENERIC_SKELETON if no authored pair
         │
         ▼
  [VisaPathway[], GradedFit[]]
         │
         ▼
  Visa.jsx (src/screens/)
    ├── DisclaimerBanner (UPL, always rendered)
    ├── PathwayComparisonGrid (2-column auto-fit)
    │     ├── PathwayColumn (Portugal D8)
    │     │     ├── FitBadge (Strong fit / Possible / Long shot)
    │     │     ├── Requirements list
    │     │     ├── ProcessingTime (JetBrains Mono)
    │     │     ├── FeeRange (JetBrains Mono, accent2)
    │     │     ├── Pros / Cons lists
    │     │     └── SourceAttribution + DataAsOf stamp
    │     └── PathwayColumn (Canada Express Entry)
    ├── DocumentChecklistSection (per pathway, surface card)
    └── AttorneyReferralCTA (non-functional placeholder)
```

No network calls on this path — fully deterministic and offline-safe.

### Recommended Module Structure

```
shared/data/
├── visa-pathways.ts        # VISA_PATHWAYS registry + GENERIC_SKELETON constant
│                           # mirrors roadmap-templates.ts pattern
cities.ts                   # existing
roadmap-templates.ts        # existing

shared/engine/
├── visa.ts                 # selectVisaPathways() + computeGradedFit()
│                           # mirrors roadmap.ts buildRoadmap() pattern
roadmap.ts                  # existing

src/screens/
├── Visa.jsx                # named slot — implement here
│   (Roadmap.jsx)           # existing — reference for screen pattern
```

### Pattern 1: VISA_PATHWAYS Data Module (mirrors roadmap-templates.ts)

```typescript
// shared/data/visa-pathways.ts
import type { VisaPathway } from '../types.js';

// Data as of: 2026-06-05 (authoring date)
// Verify at: AIMA (aima.gov.pt) + vistos.mne.gov.pt before shipping
export const PORTUGAL_D8: VisaPathway = {
  destinationCountry: 'Portugal',
  visaType: 'Portugal D8 — Digital Nomad / Remote Work Visa',
  requirements: [
    'Proof of remote income ≥ €3,680/month (4× Portuguese minimum wage, Jan 2026)',
    'Employment contract or service agreements with non-Portuguese clients',
    'Health insurance with ≥ €30,000 coverage (Schengen-compliant)',
    'Criminal record certificate (apostilled, < 90 days old)',
    'Proof of accommodation in Portugal (12-month lease, Finanças-registered)',
    'NIF (Portuguese tax number) — obtainable before arrival via consulate',
    'Portuguese or foreign bank account showing income history',
  ],
  processingTime: '4–9 months total (consulate: 4–8 weeks; AIMA appointment: 90–120 days backlog; card: 2–6 weeks)',
  feeRangeUSD: '$120–$330 (consulate visa ~€110; AIMA residence permit ~€170; EUR/USD 1.164 Jun 2026)',
  pros: [
    'No Portuguese employer required — remote income from non-PT clients qualifies',
    'Schengen Area travel with residence permit',
    'Path to permanent residency (5 years) and citizenship (5 years)',
    'NHR tax regime may apply (verify current eligibility)',
    'Lower cost of living vs. US or UK despite income threshold',
  ],
  cons: [
    'AIMA appointment backlogs: 400,000+ cases reported in 2026; total timeline 4–9 months',
    'Income threshold resets annually with Portuguese minimum wage (verify at each appointment)',
    'Savings of ≥ €11,040 (12× minimum wage) also required — not just monthly income',
    'Accommodation must be pre-secured for the visa application',
    'Portugal-sourced income does NOT count toward the 4× minimum-wage threshold',
  ],
  documentChecklist: [
    'Completed D8 national visa application form',
    'Valid passport (≥ 6 months validity, 2+ blank pages)',
    'Two recent passport photos (4.5 × 3.5 cm)',
    'Remote work proof: employment contract / freelance service agreements with foreign clients',
    'Bank statements (last 3 months) showing regular income deposits',
    'Proof of savings: ≥ €11,040 in bank (12× minimum wage)',
    'Criminal record certificate: apostilled + certified translation, issued < 90 days',
    'Health insurance certificate: ≥ €30,000 coverage, Schengen-compliant',
    '12-month rental lease registered at Portal das Finanças (or equivalent accommodation proof)',
    'NIF registration certificate (Portuguese tax number)',
    'Cover / motivation letter in English or Portuguese',
    'Fee payment confirmation (consulate visa fee: ~€110)',
  ],
  officialSources: [
    'AIMA — Agência para a Integração, Migrações e Asilo (aima.gov.pt): residence permit authorization, fees, appointment scheduling',
    'Ministério dos Negócios Estrangeiros / vistos.mne.gov.pt: national visa D8 requirements and consular process',
    'Portal das Finanças (portaldasfinancas.gov.pt): NIF registration, rental-lease Finanças registration',
    'Data as of: 2026-06-05 — verify current minimum wage and AIMA fee schedule before authoring final content',
  ],
};

export const CANADA_EXPRESS_ENTRY: VisaPathway = {
  destinationCountry: 'Canada',
  visaType: 'Canada Express Entry — Federal Skilled Worker (FSW)',
  requirements: [
    'CRS (Comprehensive Ranking System) score competitive for current draw cutoff (~480–550+ for general draws as of 2025–2026)',
    'At least 1 year skilled work experience in an eligible NOC TEER 0, 1, 2, or 3 occupation',
    'Language: IELTS or CELPIP (English) or TEF/TCF (French) at minimum CLB 7',
    'Education: post-secondary credential assessed by a designated ECA organization',
    'Proof of settlement funds: CAD $15,263 for a single applicant (2026 LICO table)',
    'No valid Canadian job offer required (job offer points removed March 25, 2025)',
  ],
  processingTime: '6–8 months post-ITA (Invitation to Apply); 60-day window to submit complete PR application after ITA',
  feeRangeUSD: '~$1,140 government fees (CAD $1,590: processing $990 + RPRF $600; CAD/USD 0.719 Jun 2026) — excludes ECA ($200–300 CAD), language tests ($300–350 CAD), biometrics ($85 CAD)',
  pros: [
    'No employer sponsorship required for FSW pathway',
    'Direct permanent residence (not a temporary visa) — immediate right to live and work',
    'Family members included in one application',
    'Universal public healthcare (provincial) once PR is issued',
    'Pathway to Canadian citizenship (3 years as PR)',
  ],
  cons: [
    'CRS score requirement is high: general draws typically require 480–550+ (post-job-offer-points removal, March 2025)',
    'Remote work for foreign companies does NOT count as Canadian work experience for CRS points',
    'Education Credential Assessment required for non-Canadian degrees (adds $200–300 CAD cost and 3–5 months)',
    'Language tests (IELTS/CELPIP) must be taken and results valid — additional cost and timeline',
    'Proof of settlement funds (CAD $15,263 single) must be liquid and not borrowed',
  ],
  documentChecklist: [
    'Valid passport or travel document',
    'Language test results: IELTS / CELPIP (English) or TEF / TCF (French) — within validity period',
    'Educational Credential Assessment (ECA) report from a designated organization (WES, etc.)',
    'Proof of work experience: employment reference letters, pay stubs, contracts (NOC-aligned)',
    'Proof of settlement funds: bank letter or statements showing CAD $15,263+ (single applicant)',
    'Police clearance certificate(s): for every country lived in ≥ 6 consecutive months since age 18',
    'Medical examination results (to be done after receiving ITA, from IRCC-approved physician)',
    'Birth certificate',
    'Marriage / divorce documents (if applicable)',
    'Recent passport-sized photographs (applicant and dependents)',
  ],
  officialSources: [
    'IRCC — Immigration, Refugees and Citizenship Canada (canada.ca/express-entry): CRS criteria, eligibility, draw history',
    'IRCC fee list (ircc.canada.ca/english/information/fees/fees.asp): processing fee CAD $990 + RPRF CAD $600 — increased April 30, 2026',
    'IRCC proof of funds (canada.ca/express-entry/documents/proof-funds): CAD $15,263 single applicant (2026 LICO table)',
    'Data as of: 2026-06-05 — verify current draw cutoffs and proof-of-funds table at canada.ca before authoring final content',
  ],
};

export const GENERIC_SKELETON: VisaPathway = {
  destinationCountry: '[Country]',
  visaType: 'Work Visa — [Country]',
  requirements: ['Verify current requirements at the official immigration authority for [Country]'],
  processingTime: 'Verify at official source',
  feeRangeUSD: 'Verify at official source',
  pros: ['International work authorization', 'Potential path to residency'],
  cons: ['Requirements, fees, and timelines vary — verify at official source'],
  documentChecklist: [
    'Valid passport (minimum 6 months validity beyond intended stay)',
    'Proof of remote income or employment contract',
    'Health insurance documentation',
    'Bank statements / proof of funds',
    'Criminal background check (apostilled)',
    'Completed visa application form',
  ],
  officialSources: [
    'Verify current fees, processing times, and requirements at the official immigration authority for [Country].',
    'DATA AS OF: 2026-06 — GENERIC SKELETON — VERIFY LOCALLY',
  ],
};

export const VISA_PATHWAYS: Record<string, Record<string, VisaPathway[]>> = {
  US: {
    Portugal: [PORTUGAL_D8],
    Canada: [CANADA_EXPRESS_ENTRY],
  },
};
```

[ASSUMED] — exact field content above is a draft scaffold for the planner. The authoritative figures within it are tagged in the Figures section below.

### Pattern 2: Screener + Graded Fit Helper (mirrors roadmap.ts)

```typescript
// shared/engine/visa.ts

export interface GradedFit {
  grade: 'strong' | 'possible' | 'long-shot';
  gatingFactor: string;  // named single factor shown in the badge
}

export interface VisaScreenerResult {
  pathway: VisaPathway;
  fit: GradedFit;
}

/**
 * Returns 0–N screener results for the given citizenship × destination.
 * Falls back to GENERIC_SKELETON if no authored pathways exist.
 * Makes zero network calls — fully deterministic (D-01, D-02, offline-safe).
 */
export function selectVisaPathways(
  profile: Profile,
  matchedCountry: string,
): VisaScreenerResult[] { ... }

/**
 * Pure function: derives graded fit from Profile fields against pathway thresholds.
 * Must NOT call an LLM. All thresholds are authored constants (D-05 boundary).
 */
function computeGradedFit(pathway: VisaPathway, profile: Profile): GradedFit { ... }
```

### Anti-Patterns to Avoid

- **Generating visa facts via LLM at render time.** All facts are authored constants. The LLM boundary is D-05: prose smoothing only, never factual fields.
- **Rendering source URLs as `<a href>` elements.** Phase 5 D-10 + see-not-click demo rule. Display source authority names as styled text.
- **Making `Profile.education` a binary "has degree"** without confirming the actual string values Phase 2 emits. CRS degree check depends on this.
- **Hiding the "Long shot" badge behind `--neg` (red).** UPL discipline: "Long shot" is a likelihood signal, not a rejection. Use `--text2` per UI-SPEC.
- **Performing FX conversion at render time.** `feeRangeUSD` in the VisaPathway contract is a pre-authored string. FX was applied at authoring time with a dated note.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Visa income/fee data | LLM prompt at runtime | Authored TS constants in shared/data/ | Authored-truth boundary (D-05); offline-safe; citation-perfect |
| Graded fit labels | Free-text LLM judgment | Deterministic threshold logic in shared/engine/ | Reproducible, demo-safe, no hallucination risk |
| Exchange rate conversion | Live FX API call | Pre-authored USD string with dated FX note in feeRangeUSD field | Zero network calls on critical path; FX applied once at authoring |
| Attorney referral network | Real partner API | Non-functional CTA placeholder | D-04: out of scope for v1; post-pitch affiliate wiring |
| Separate visa API endpoint | New api/ endpoint | No new backend | All data is bundled; no server needed |

---

## Authored Figures — Portugal D8

> All figures below are tagged with source and confidence. The planner MUST include a `checkpoint:human-verify` task for each figure before the authoring task ships, pointing to the official authority.

### Income Threshold

| Figure | Value | Source | Confidence |
|--------|-------|--------|------------|
| Portuguese minimum wage (2026) | €920/month (from Jan 2026) | [CITED: multiple immigration guides consistent on this figure; verify at INE.pt or Código do Trabalho decree] | MEDIUM |
| D8 income multiplier | 4× minimum wage | [CITED: globalcitizensolutions.com, liveinpt.com, citizenremote.com — all consistent; rule derives from AIMA practice, not a single published decree URL] | MEDIUM |
| D8 monthly income minimum (2026) | €3,680/month | [CITED: computed 4 × €920; consistent across multiple 2026 guides] | MEDIUM |
| D8 annual income minimum (2026) | €44,160 | [CITED: derived] | MEDIUM |
| D8 monthly income in USD (Jun 2026) | ~$4,284/month | [ASSUMED: EUR/USD 1.164 Jun 5 2026; verify FX at authoring time] | LOW |
| D8 savings requirement | ≥ €11,040 (12× minimum wage) | [CITED: liveinpt.com, globalcitizensolutions.com — consistent; verify at AIMA] | MEDIUM |
| Savings in USD (Jun 2026) | ~$12,851 | [ASSUMED: FX-derived] | LOW |

**Critical note:** AIMA applies the minimum wage at the time of your appointment date, not the application date. If an annual wage increase occurs between filing and appointment, the threshold may be higher. Author the data module with the current figure and a visible "verify at AIMA at your appointment date" note.

**Unit-mismatch alert for graded-fit logic:** `Profile.income` is in **USD/year**. The D8 minimum is in **EUR/month**. The screener must annualize and convert: `profile.income >= (D8_MONTHLY_EUR * EUR_USD_RATE * 12)`. Use a conservative EUR/USD constant in the authored data (e.g. 1.10) so the threshold does not ping as "Strong fit" on a stale favorable exchange rate. Flag this as an `[ASSUMED]` constant that the implementer should verify.

### Visa Fees

| Figure | Value | Source | Confidence |
|--------|-------|--------|------------|
| Consulate D8 visa fee | €90–€110 | [CITED: liveinpt.com cites €110; citizenremote.com cites €90–€120; Jobbatical: €110 from 2025 increase] | MEDIUM |
| AIMA residence permit fee | ~€170 | [CITED: liveinpt.com, globalcitizensolutions.com — consistent post-March 2026 revision] | MEDIUM |
| Total government fees (single applicant) | ~€280 (visa + permit) | [CITED: derived from above] | MEDIUM |
| Total government fees in USD (Jun 2026) | ~$326 | [ASSUMED: FX-derived] | LOW |
| VFS/BLS service fee (if applicable) | ~€40 | [CITED: liveinpt.com] | LOW |
| feeRangeUSD string for VisaPathway | "$120–$330 in government fees (consulate visa ~€90–110 + AIMA permit ~€170; EUR/USD 1.164 Jun 2026 — verify at authoring)" | [ASSUMED: range captures variation; verify current fees at AIMA and your consulate] | LOW |

**Authority to verify:** AIMA fee schedule PDF (linked from aima.gov.pt); your specific consulate's fee page (US consulates in Portugal may have slightly different amounts).

### Processing Time

| Figure | Value | Source | Confidence |
|--------|-------|--------|------------|
| Consulate review | 4–8 weeks in practice (legal max: 60 working days = ~90 calendar days) | [CITED: liveinpt.com, globalcitizensolutions.com — consistent] | MEDIUM |
| AIMA appointment wait (Lisbon/Porto) | 90–120 days (up to 4 months) | [CITED: globalcitizensolutions.com; confirmed by 400K+ backlog reports] | MEDIUM |
| Residence card production after appointment | 2–6 weeks | [CITED: citizenremote.com, liveinpt.com] | MEDIUM |
| Total end-to-end | 4–9 months | [CITED: consistent range across guides] | MEDIUM |

### Document Checklist (D8)

Verified consistent across globalcitizensolutions.com, liveinpt.com, citizenremote.com:

1. Completed D8 national visa application form
2. Valid passport (≥ 6 months validity, 2+ blank pages)
3. Two recent passport photos (4.5 × 3.5 cm)
4. Remote work proof: employment contract / freelance agreements with **non-Portuguese** clients
5. Bank statements (last 3 months) showing income deposits
6. Proof of savings: ≥ €11,040 (some consulates accept ≥ 3 months' income history; AIMA requires savings evidence)
7. Criminal record certificate: apostilled + certified translation, issued within 90 days
8. Health insurance: ≥ €30,000 coverage, Schengen-compliant
9. 12-month rental lease registered at Portal das Finanças (or equivalent accommodation proof)
10. NIF (Portuguese tax number) — obtainable pre-arrival via consulate or a Finanças representative
11. Cover / motivation letter (English or Portuguese)
12. Fee payment confirmation

**Checklist confidence:** MEDIUM — items 1–12 are consistent across 3+ guides. Item specifics (apostille requirements, exact savings documentation) vary by consulate; flag as "verify at your specific Portuguese consulate."

### Official Source Authorities to Cite in VisaPathway.officialSources

- **AIMA (aima.gov.pt):** Residence permit authorization, AIMA fee schedule, appointment scheduling
- **MNE / vistos.mne.gov.pt:** National visa D8 requirements and consular process (Ministério dos Negócios Estrangeiros)
- **Portal das Finanças (portaldasfinancas.gov.pt):** NIF registration, rental-lease Finanças registration

Do NOT invent specific URL paths (per package provenance rule applied to URLs). Name the authority and its domain. The implemented `officialSources[]` strings must be display text, not clickable links.

---

## Authored Figures — Canada Express Entry

### CRS Score Factors (gating-factor data for D-03 graded-fit badge)

[CITED: moving2canada.com, gofarglobal.com, ircc.com — consistent; official IRCC page returned 403]

**Job offer points removed March 25, 2025** — this is confirmed by multiple recent sources and is a major change. Do not author any "50–200 point job offer bonus" language.

| Factor | Maximum Points (no spouse) | Key signals for graded-fit note |
|--------|---------------------------|----------------------------------|
| Age | 110 (ages 20–29) | 30→105, 32→94, 40→50, 45+→0 |
| Education | 150 (PhD) | Bachelor = 120, Master = 135 |
| First official language | 136 (CLB 10+) | CLB 9+ strongly favors score |
| Canadian work experience | 80 | Remote foreign employment does NOT count |
| Skill transferability | 100 (additional, needs combos) | Foreign WE + language = up to 50 |
| Provincial nomination | 600 | Most powerful lever but requires province |
| **Competitive general draw cut-off (2026)** | **~480–550+ CRS** | Category draws (healthcare, French) often lower: 379–435 |

**Favors high score:** age 20–29, bachelor's or higher degree (with valid ECA), CLB 9+ in IELTS/CELPIP, any prior Canadian work experience.

**Hurts score:** age 30+ (linear decline), no post-secondary credential, CLB 7 only, zero Canadian work experience.

**Key constraint for demo persona:** Remote work for a foreign company does NOT count as Canadian work experience. A US-based software engineer working remotely for a US company earns 0 Canadian WE points under CRS. This is a material "gating factor" for the fit badge.

### Government Fees (Canada Express Entry)

[CITED: cicnews.com April 2026 article on IRCC fee increase; IRCC fee list page — returns 403 to scraper but fee amounts consistent across 3 sources]

| Fee | Amount (CAD) | Amount (USD Jun 2026) | Source |
|-----|--------------|-----------------------|--------|
| Application processing fee (principal applicant) | $990 | ~$712 | [CITED: IRCC effective April 30, 2026; cicnews.com] |
| Right of Permanent Residence Fee (RPRF) | $600 | ~$431 | [CITED: IRCC effective April 30, 2026; cicnews.com] |
| **Total government fees (single applicant)** | **$1,590 CAD** | **~$1,143 USD** | [CITED: derived; USD at CAD/USD 0.719 Jun 5 2026] |
| Biometrics | $85 CAD | ~$61 USD | [CITED: IRCC fee list (consistent across sources)] |
| ECA report | $200–$300 CAD | ~$144–$216 | [CITED: WES and other designated organizations] |
| Language test (IELTS) | $300–$350 CAD | ~$216–$252 | [ASSUMED: ranges from IELTS pricing] |
| Medical exam | $150–$450 CAD | ~$108–$324 | [ASSUMED: range; varies by physician] |

`feeRangeUSD` authored string: `"~$1,140 government fees (CAD $1,590 = processing $990 + RPRF $600; CAD/USD 0.719 Jun 2026); excludes ECA, language test, biometrics"`

### Proof of Funds (Canada — settlement funds, NOT the PR fee)

[CITED: libertyimmigration.ca (April 2026), onthemovecanada.com — both consistent on LICO-based figures; official IRCC page returns 403]

| Family Size | CAD Required | USD (Jun 2026) |
|-------------|-------------|----------------|
| 1 | $15,263 | ~$10,974 |
| 2 | $19,001 | ~$13,667 |
| 3 | $23,360 | ~$16,806 |

Source: IRCC Low Income Cut-Off (LICO) table, updated July 2025. **Flag for planner: verify at canada.ca/express-entry/documents/proof-funds before authoring.**

### Processing Time (Canada Express Entry)

| Stage | Duration | Source |
|-------|----------|--------|
| ITA submission window | 60 days after receiving ITA | [CITED: IRCC standard; consistent across all sources] |
| IRCC PR processing (post-ITA) | 6–8 months (service standard 6 months; actual ~7 months as of March 2026) | [CITED: immigration.ca, y-axis.co.uk — consistent] |

### Document Checklist (Canada Express Entry, post-ITA)

[CITED: iccimmigration.ca, moving2canada.com — consistent]

1. Valid passport or travel document
2. Language test results (IELTS, CELPIP for English; TEF, TCF for French) — must be within validity period
3. Educational Credential Assessment (ECA) report from a designated organization (e.g. WES)
4. Proof of work experience: employment reference letters, pay stubs, contracts (NOC-aligned)
5. Proof of settlement funds: bank letter or statements showing ≥ CAD $15,263 (single applicant)
6. Police clearance certificate(s): every country lived in ≥ 6 consecutive months since age 18
7. Medical examination results (to be done only after receiving ITA; IRCC-approved physician)
8. Birth certificate
9. Marriage / divorce documents (if applicable)
10. Recent passport-sized photographs (applicant and dependents)

**Note:** After receiving an ITA, IRCC generates a **personalized checklist** in the online account. The list above covers the standard required documents; individual situations may add requirements.

**Checklist confidence:** MEDIUM — consistent across multiple reputable immigration sites; verify at canada.ca/express-entry/documents.

### Official Source Authorities to Cite in VisaPathway.officialSources

- **IRCC — canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry:** CRS criteria, eligibility, draw history
- **IRCC fee list — ircc.canada.ca/english/information/fees/fees.asp:** Government fees (processing + RPRF), updated April 30, 2026
- **IRCC proof of funds — canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds:** Settlement fund requirements (LICO table)

---

## Gating-Factor Logic (D-03 Graded Fit Thresholds)

These are the deterministic thresholds the planner will author in `shared/engine/visa.ts`. No LLM involvement.

### Portugal D8 Gating Logic

```typescript
// Constants (all [ASSUMED] — verify at authoring time)
const D8_MIN_MONTHLY_EUR = 3680;   // 4× €920 minimum wage, Jan 2026
const EUR_USD_CONSERVATIVE = 1.10; // conservative rate — do NOT use current spot to avoid false "Strong fit"
const D8_MIN_ANNUAL_USD = D8_MIN_MONTHLY_EUR * EUR_USD_CONSERVATIVE * 12; // ~$48,576

function gradeD8(profile: Profile): GradedFit {
  const hasRemote = profile.hasRemote;
  const meetsIncome = profile.income >= D8_MIN_ANNUAL_USD;

  if (hasRemote && meetsIncome) {
    return {
      grade: 'strong',
      gatingFactor: 'your remote income likely clears the D8 minimum',
    };
  }
  if (hasRemote && !meetsIncome) {
    return {
      grade: 'possible',
      gatingFactor: `your income may be below the D8 minimum (~$${Math.round(D8_MIN_ANNUAL_USD/1000)}k/yr required)`,
    };
  }
  // !hasRemote — D8 requires non-Portuguese employer/client income
  return {
    grade: 'long-shot',
    gatingFactor: 'D8 requires remote income from non-Portuguese clients; local employment does not qualify',
  };
}
```

**Key unit-mismatch:** `Profile.income` is USD/year; D8 minimum is EUR/month. Annualize and convert at a **conservative** EUR/USD constant (1.10 suggested — lower than current spot of 1.164, so the bar is set conservatively). Do not use live FX — this is an authored threshold. `[ASSUMED]` — implementer should verify the conservative rate is still reasonable.

**Profile.education dependency:** D8 does not have an education requirement, so `profile.education` is not used for D8 grading. ✓

### Canada Express Entry Gating Logic

Express Entry CRS is multi-factor and cannot be computed with full accuracy from the Profile fields alone (age, education, language proficiency, Canadian work experience, spouse factors). The graded-fit badge is a **simplified heuristic** designed for informational signal, not a full CRS calculator.

```typescript
function gradeExpressEntry(profile: Profile): GradedFit {
  const age = profile.age;
  const hasPostSecondary = isPostSecondaryDegree(profile.education); // NOTE: depends on Phase 2 education string values
  const hasCanadianWE = false; // [ASSUMED]: US remote workers have 0 Canadian WE by default
  // CLB language not captured in Profile — not a blocker, just unknown; score heuristic without it

  // High-probability strong fit: young + degree (high CRS baseline)
  if (age <= 35 && hasPostSecondary) {
    return {
      grade: 'strong',
      gatingFactor: 'Express Entry favors your age and education level; language scores will be the swing factor',
    };
  }
  // Possible: older with degree, or young without
  if (hasPostSecondary || age <= 29) {
    return {
      grade: 'possible',
      gatingFactor: age > 35
        ? 'Express Entry CRS points decline after 30 — a strong IELTS score and ECA will matter most'
        : 'a post-secondary degree assessed by an ECA organization will strengthen your CRS score',
    };
  }
  // Long shot: older, no degree, no Canadian WE
  return {
    grade: 'long-shot',
    gatingFactor: 'Express Entry scores decline after 35 and require a strong language test and verified credentials',
  };
}
```

**Critical dependency:** `isPostSecondaryDegree(profile.education)` requires knowing the exact string values Phase 2 emits for `education`. The planner MUST include a task to (a) read the Phase 2 education question options from `shared/quiz-engine/questions.ts` and (b) write `isPostSecondaryDegree()` against those exact strings. Do not guess.

**Known CRS limitation:** CLB language score is not captured in Profile. The graded-fit note must honestly say "language scores will be the swing factor" rather than computing them — this is within the UPL informational framing.

---

## UPL Boundary — Framing Discipline

The "Unauthorized Practice of Law" boundary is maintained by:

1. **Graded fit is a likelihood signal, not a determination.** Language: "your remote income *likely* clears the D8 minimum" (not "you qualify"). "Express Entry *favors* your age and education" (not "you will be approved").

2. **Disclaimer is always visible.** Per UI-SPEC: "Not legal advice. This is an informational assessment only. Consult a licensed immigration attorney before acting on this information." Rendered at the top of the Visa screen, before any pathway content.

3. **Never "Long shot" = "rejected".** "Long shot" means the named gating factor is unfavorable, not that a determination has been made. Badge uses `--text2` (neutral), not `--neg` (red = error/denied).

4. **All content is informational, not advisory.** "Here are the typical documents required" not "you must submit these documents to qualify."

5. **Attorney CTA always present.** A non-functional placeholder CTA after all content, reinforcing "consult a professional" even when fit signals are positive.

These five disciplines, consistently applied, keep Phase 7 on the informational side of UPL for a demo context. Q&A defense: "We inform — we never practice law. Every screen shows the disclaimer and attorney referral."

---

## Common Pitfalls

### Pitfall 1: Demo Destination Mismatch (CRITICAL — Open Question Q-1)
**What goes wrong:** The screener surfaces pathways keyed to `matchedDestination.country`. The current demo golden-path persona has London/UK as the top international match. Portugal D8 is authored for country `"Portugal"`. If the demo persona's matched destination is UK, the Portugal D8 pathway will not surface — the visa "wow" falls to the generic skeleton.
**Why it happens:** Phase 5 golden-path and Phase 6 roadmap templates were authored for US→UK (London) first. Phase 7 CONTEXT pins to Lisbon, but the actual matched city data does not yet include Lisbon.
**How to avoid:** The planner must surface this as a blocking decision before content authoring. Options: (a) add Lisbon to `cities.ts` so it can appear as a match; (b) change the screener to show all citizenship-eligible pathways regardless of matched destination (drops the citizenship×destination scoping); (c) wire the demo persona to produce Portugal as a top match.
**Warning signs:** Checking `shared/data/cities.ts` — only London/UK is in the international cities. No Lisbon record exists as of research date.

### Pitfall 2: Profile.education String Values Unknown
**What goes wrong:** `computeGradedFit()` for Express Entry needs to check if `profile.education` represents a post-secondary degree. Phase 2 education question strings are not yet final (Phase 2 not executed).
**Why it happens:** Phase 2 is planned but not complete; education question options are in `shared/quiz-engine/questions.ts` but the exact emitted strings need to be confirmed.
**How to avoid:** Read `shared/quiz-engine/questions.ts` education question before authoring the `isPostSecondaryDegree()` helper. Write it against the actual option values.
**Warning signs:** `isPostSecondaryDegree()` that compares against assumed strings like "bachelor" when Phase 2 emits "Bachelor's Degree (4-year)".

### Pitfall 3: FX Rate in the feeRangeUSD String
**What goes wrong:** `feeRangeUSD` is an authored string. If FX is baked in at a stale rate, judges or users see misleading USD figures.
**Why it happens:** The VisaPathway contract stores a pre-converted USD string. The EUR/USD and CAD/USD rates shift over time.
**How to avoid:** Author `feeRangeUSD` as a range with the FX date embedded: e.g. `"$120–$330 gov fees (EUR/USD 1.164, Jun 2026)"`. This communicates transparency. The "data as of" label on the Visa screen also covers this.

### Pitfall 4: LLM Inventing Visa Facts
**What goes wrong:** Any pathway that asks an LLM to generate fees, document requirements, or processing times risks hallucinated figures that fail Q&A scrutiny.
**Why it happens:** Phase 5's optional prose-enrich pattern makes this tempting. But D-05 is absolute: LLM touches prose detail only, never factual labels, steps, fees, or timelines.
**How to avoid:** All `VisaPathway` fields are authored TS constants. The optional prose-enrich (if ever applied to visa) may only touch non-factual framing strings, and `acceptEnrichment()` must reject mutations to factual fields. For Phase 7 v1, no prose enrich at all — too high a risk surface.

### Pitfall 5: AIMA Appointment-Time Threshold Reset
**What goes wrong:** The D8 income minimum resets to 4× the minimum wage at the time of the AIMA appointment. If the Portuguese minimum wage increases between now and when a user applies, the threshold is higher.
**Why it happens:** AIMA policy applies the current-at-appointment rate, not the rate at application time.
**How to avoid:** Author the minimum figure with a visible note: "AIMA applies the minimum wage at the time of your appointment. If minimum wage increases between your application and appointment, the threshold will be higher. Verify at AIMA before your appointment." This keeps the content honest and within UPL bounds.

### Pitfall 6: clickable `<a>` elements in officialSources
**What goes wrong:** Rendering `officialSources[]` items as `<a href="...">` elements violates Phase 5 D-10 (see-not-click) and the competition rule.
**Why it happens:** Natural instinct to link citations.
**How to avoid:** `officialSources[]` stores display-text strings (authority name + description). Visa.jsx renders them as `<span>` or `<p>`, never `<a>`. The UI-SPEC explicitly documents this.

---

## Code Examples

### Existing Pattern to Mirror: roadmap-templates.ts → visa-pathways.ts

```typescript
// roadmap-templates.ts pattern (existing — mirror this for visa-pathways.ts)
export const ROADMAP_TEMPLATES: Record<string, Record<string, RoadmapTemplate>> = {
  US: {},
};
ROADMAP_TEMPLATES.US['US'] = US_DOMESTIC_TEMPLATE;
ROADMAP_TEMPLATES.US['UK'] = US_TO_UK_TEMPLATE;

// visa-pathways.ts — apply same keying pattern
export const VISA_PATHWAYS: Record<string, Record<string, VisaPathway[]>> = {
  US: {},
};
VISA_PATHWAYS.US['Portugal'] = [PORTUGAL_D8];
VISA_PATHWAYS.US['Canada'] = [CANADA_EXPRESS_ENTRY];
```

Outer key = `profile.citizenship`; inner key = `city.country`. For Canada: city.country would need to be `"Canada"` — verify against `cities.ts` when Lisbon and Toronto records are added.

### Screener Selection (mirrors buildRoadmap pattern)

```typescript
// shared/engine/visa.ts
export function selectVisaPathways(
  profile: Profile,
  matchedCountry: string,
): VisaScreenerResult[] {
  const citizenship = profile.citizenship || 'US';
  const citizenshipPathways = VISA_PATHWAYS[citizenship] ?? {};
  const pathways = citizenshipPathways[matchedCountry];

  if (!pathways || pathways.length === 0) {
    // D-06: generic honest skeleton — never a dead-end
    return [{
      pathway: { ...GENERIC_SKELETON, destinationCountry: matchedCountry },
      fit: { grade: 'possible', gatingFactor: 'verify requirements at the official immigration authority' },
    }];
  }

  return pathways.map(pathway => ({
    pathway,
    fit: computeGradedFit(pathway, profile),
  }));
}
```

### Test Pattern (mirrors roadmap.test.ts)

```typescript
// shared/engine/visa.test.ts
describe('selectVisaPathways', () => {
  it('returns Portugal D8 for US citizen, Portugal destination', () => { ... });
  it('returns Canada EE for US citizen, Canada destination', () => { ... });
  it('returns generic skeleton for unlisted citizenship×destination', () => { ... });
  it('grades Strong fit for hasRemote=true AND income >= D8 minimum', () => { ... });
  it('grades Long shot for hasRemote=false', () => { ... });
  it('grades Strong fit for age ≤ 35 with post-secondary degree (Express Entry)', () => { ... });
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SEF (Serviço de Estrangeiros e Fronteiras) handles D8 | AIMA (Agência para a Integração, Migrações e Asilo) replaced SEF | October 2023 | Cite AIMA, not SEF, in all source attributions |
| Express Entry job offer = 50–200 bonus CRS points | Job offer points removed from CRS | March 25, 2025 | Do NOT mention job offer points in authored content; it's a common outdated claim |
| IRCC PR fees: processing $950 + RPRF $575 | Processing $990 + RPRF $600 | April 30, 2026 | Use updated figures; do not use 2024/2025 cached fee amounts |
| Portugal minimum wage €870 (2025) → D8 threshold €3,480 | Minimum wage €920 (2026) → D8 threshold €3,680 | January 2026 | Update all income threshold figures from 2025 values |

---

## Open Questions

1. **[BLOCKING — must resolve before authoring content] Demo persona destination: Portugal or UK?**
   - What we know: The golden-path cache (`data/golden-path/demo-results.json`) shows London/UK as the scripted demo international destination. `shared/data/cities.ts` has only London/UK as an international city. CONTEXT D-05 pins Phase 7 to Portugal/D8. The screener keys pathways to `matchedDestination.country`. For the demo to surface Portugal D8, the matched destination must be `"Portugal"`.
   - What's unclear: Has the demo script been updated to use Lisbon? Will Lisbon be added to `cities.ts` before Phase 7 ships? Or should the screener surface all citizenship-eligible pathways regardless of matched destination?
   - Recommendation: The planner should surface this as a Wave 0 decision task. Option A (add Lisbon) is the cleanest demo path and required for Phase 4 anyway. Option B (show all pathways regardless of destination) degrades the "magic" of destination-keyed concierge. Option C (change screener to use citizenship only) is workable but changes D-02.

2. **What exact string values does `Profile.education` hold?**
   - What we know: `shared/quiz-engine/questions.ts` contains the education question. The screener's `isPostSecondaryDegree()` helper needs to match against these exact values.
   - What's unclear: Phase 2 has not been executed. The education question options are in the questions file but the exact emitted string values need to be confirmed.
   - Recommendation: The planner should include a task at the start of engine authoring to read `shared/quiz-engine/questions.ts` education question options and author `isPostSecondaryDegree()` against them.

3. **Should Toronto and Lisbon be added to `cities.ts` in this phase or a prior phase?**
   - What we know: REQUIREMENTS.md states the golden path includes Lisbon, Berlin, Toronto, London — "fully-built visa pathways for Premium demo: Portugal D8 + Canada Express Entry." Lisbon = Canada EE? No — Lisbon = D8. Toronto = Canada EE. Neither is in `cities.ts` yet.
   - What's unclear: Phase 4 (International Destinations) was supposed to add all 4 international cities. It hasn't shipped yet (Status: not started).
   - Recommendation: Explicitly flag that Phase 7 cannot surface the authored pathways without matching international city records in `cities.ts`. If Phases 2–4 remain unexecuted, Phase 7 should at minimum stub Lisbon and Toronto as minimal City records, or the planner should note the hard dependency on Phase 4.

---

## Environment Availability

Step 2.6: No external tool dependencies beyond existing project stack. All visa data is authored as TS constants. No new CLI tools, databases, or external services needed.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Vitest | Unit tests for screener engine | ✓ | ^4.1.8 (from package.json) | — |
| Node.js | Build + test | ✓ | (inherited from project) | — |
| No new dependencies | — | — | — | — |

---

## Validation Architecture

nyquist_validation: true (from .planning/config.json)

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.8 |
| Config file | vite.config.js (inline `test:` block) |
| Quick run command | `npm test` (vitest run) |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VISA-01 | selectVisaPathways returns Portugal D8 for US+Portugal | unit | `npm test -- --reporter=verbose shared/engine/visa.test.ts` | ❌ Wave 0 |
| VISA-01 | selectVisaPathways returns Canada EE for US+Canada | unit | same | ❌ Wave 0 |
| VISA-01 | Generic skeleton returned for unlisted citizenship×destination | unit | same | ❌ Wave 0 |
| VISA-01 | gradeD8: Strong fit when hasRemote=true AND income≥threshold | unit | same | ❌ Wave 0 |
| VISA-01 | gradeD8: Long shot when hasRemote=false | unit | same | ❌ Wave 0 |
| VISA-01 | gradeExpressEntry: Strong fit for age≤35 + post-secondary | unit | same | ❌ Wave 0 |
| VISA-02 | VisaPathway objects satisfy shared/types.ts VisaPathway interface | type-check | `npx tsc --noEmit` | ❌ Wave 0 |
| VISA-03 | Every authored figure has officialSources[] non-empty | unit | same | ❌ Wave 0 |
| VISA-04 | Visa.jsx renders disclaimer banner (manual verify in browser) | manual | n/a | ❌ Wave 3 |

### Sampling Rate

- **Per task commit:** `npm test` (full suite — fast, < 10s)
- **Per wave merge:** `npm test` + `npx tsc --noEmit`
- **Phase gate:** All green + human-verify visa figures checkpoint passed

### Wave 0 Gaps

- [ ] `shared/engine/visa.test.ts` — RED tests for VISA-01 selectVisaPathways + graded fit
- [ ] `shared/engine/visa.ts` — stub to make tests compile (all tests RED)
- [ ] `checkpoint:human-verify` — verify Portugal D8 figures at AIMA/vistos.mne.gov.pt and Canada EE figures at IRCC before green-lighting content authoring

---

## Security Domain

> security_enforcement: not explicitly set in config.json → treating as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase 8 (tier gate) — not Phase 7 |
| V3 Session Management | No | Out of scope for this phase |
| V4 Access Control | No | Phase 8 (tier gate) — not Phase 7 |
| V5 Input Validation | Minimal | Profile fields are read-only inputs to screener; validate citizenship and destination strings against known keys before registry lookup |
| V6 Cryptography | No | No secrets, no network calls in Phase 7 |

### Known Threat Patterns for this Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Attorney CTA misrepresentation | Spoofing | CTA is generic, non-functional, non-identifiable placeholder; no attorney name or real referral |
| UPL violation | Legal risk | Disclaimer always rendered; graded-fit language is hedged ("likely", "favors"); never "you qualify" |
| Stale visa data presented as current | Tampering | "Data as of [date]" label always rendered per VISA-03; checkpoint:human-verify task before ship |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Portuguese minimum wage is €920/month as of January 2026 → D8 threshold €3,680/month | Authored Figures — D8 Income | Content is wrong; threshold may be different; verify at INE.pt or official State Budget decree |
| A2 | D8 income multiplier is 4× (AIMA practice — not in a single published decree) | Authored Figures — D8 Income | Threshold wrong; some consulates may apply slightly different multipliers |
| A3 | AIMA residence permit fee is ~€170 post-March 2026 revision | Authored Figures — D8 Fees | Fee amount wrong; verify at aima.gov.pt fee schedule PDF |
| A4 | Consulate D8 visa fee is €90–€110 | Authored Figures — D8 Fees | Range wrong; some consulates may differ |
| A5 | EUR/USD 1.164 and CAD/USD 0.719 as of June 5, 2026 | USD conversions throughout | USD amounts stale if FX moves; authoring team should re-verify FX at the day of authoring |
| A6 | Canada EE proof of funds for single applicant: CAD $15,263 (2026 LICO) | Authored Figures — Canada | Amount wrong; verify at canada.ca/express-entry/documents/proof-funds |
| A7 | Canada EE processing fee $990 + RPRF $600 = $1,590 CAD (April 30, 2026) | Authored Figures — Canada Fees | Amount wrong if further changes since April; verify at ircc.canada.ca/english/information/fees/fees.asp |
| A8 | Job offer points removed from Express Entry CRS as of March 25, 2025 | CRS Factors | If partially reinstated, authored "pros" and gating-factor notes may be misleading |
| A9 | Profile.hasRemote is the primary D8 screener gate | Gating-Factor Logic | If Phase 2 emits hasRemote differently, or if D8 applies to employees of foreign companies, gate logic may need revision |
| A10 | isPostSecondaryDegree() can be derived from existing Phase 2 education question values | Gating-Factor Logic | Education string values from Phase 2 quiz unknown until Phase 2 is read; helper may be authored against wrong strings |
| A11 | VISA_PATHWAYS outer key = profile.citizenship (e.g. "US"), inner key = city.country (e.g. "Portugal", "Canada") | Module Structure | City records for Portugal and Canada not yet in cities.ts; these country strings must match when added |
| A12 | Lisbon and Toronto are NOT yet in cities.ts — Phase 7 cannot surface authored pathways without them | Open Questions | Demo persona will match to UK (London) not Portugal or Canada; pathway "wow" fails silently |

---

## Sources

### Primary (MEDIUM confidence — official sites returned 403; content verified via multiple consistent secondary sources)

- AIMA (aima.gov.pt) — authority for D8 residence permit; fee schedule; appointment process [403 to scraper; named as authority]
- vistos.mne.gov.pt — Portuguese MNE consular visa requirements [certificate error to scraper; named as authority]
- IRCC canada.ca/express-entry — CRS criteria, processing times [403 to scraper; named as authority]
- ircc.canada.ca/english/information/fees/fees.asp — official fee list, confirmed amounts via WebFetch [CITED]
- cicnews.com — "Canada hikes permanent resident fees" April 2026 article confirming fee increase [CITED: WebFetch confirmed $990 processing + $600 RPRF effective April 30, 2026]

### Secondary (MEDIUM confidence — consistent immigration law firms / vetted guides)

- globalcitizensolutions.com — Portugal D8 comprehensive guide June 2026 [WebFetch verified]
- liveinpt.com — Portugal D8 guide 2026 [WebFetch verified]
- libertyimmigration.ca — Canada Express Entry proof of funds 2026 [WebFetch verified]
- y-axis.co.uk — Canada Express Entry fees and checklist [WebFetch verified]
- iccimmigration.ca — Canada Express Entry ITA document checklist [WebFetch verified]
- gofarglobal.com — CRS age points table [WebFetch verified]
- moving2canada.com — CRS factors and job offer removal March 2025 [WebFetch verified]

### Tertiary (LOW confidence — flagged for validation)

- EUR/USD 1.164 and CAD/USD 0.719 exchange rates (June 5, 2026) [WebSearch; volatile; must re-verify at authoring time]
- D8 savings requirement €11,040 [cited by multiple guides; no direct AIMA source URL confirmed]
- D8 processing time 4–9 months [range from multiple guides; AIMA appointment backlog figures unverified against official statistics]

---

## Metadata

**Confidence breakdown:**

- Portugal D8 figures: MEDIUM — consistent across 3+ immigration law/guide sources, government pages not directly scraped (403/cert error). All figures must be `checkpoint:human-verify` before authoring.
- Canada Express Entry fees: MEDIUM-HIGH — IRCC fee list page WebFetched (returned data), confirmed via CICNews April 2026 article on fee increase.
- Canada Express Entry CRS factors: MEDIUM — official IRCC page returned 403; figures consistent across multiple recent (2025–2026) sources.
- Architecture patterns: HIGH — entirely derived from existing codebase patterns (roadmap-templates.ts, roadmap.ts, types.ts).
- UPL framing: HIGH — based on CONTEXT D-03/D-04 decisions and standard legal informational framing.

**Research date:** 2026-06-05
**Valid until:** 30 days (visa policy stable but FX and minimum wage multipliers can shift; IRCC fees now confirmed for April 2026 increase)
