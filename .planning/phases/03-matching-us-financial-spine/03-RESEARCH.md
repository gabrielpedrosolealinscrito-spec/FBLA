# Phase 3: Matching & US Financial Spine — Research

**Researched:** 2026-06-01
**Domain:** Scoring engine (pure TS), US financial/tax model, curated city dataset, ranked-results UI
**Confidence:** HIGH for tax math (IRS-cited); MEDIUM for city dataset (sourced, spot-verified); HIGH for engine architecture (verified against existing codebase)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Dealbreakers are a **heavy score penalty, NOT a hard delete.** The ranked list is always fully populated. No city is ever removed entirely.
- **D-02:** Interactive dealbreaker re-confirmation. When a dealbreaker demotes the would-be #1 match, surface a conversational re-confirm citing the *specific fact* behind the dealbreaker. The mechanism requires computing the ranking both without and with dealbreaker penalties and comparing the #1 in each pass.
- **D-03:** All scoring magic numbers in ONE tunable config (`shared/engine/scoring-weights.ts`). No constants scattered inline.
- **D-04:** Two separate weighting layers, multiplied, never conflated: (1) global factor weights from the config, (2) per-person priority weights from `Profile.weights{cost,career,lifestyle,safety}` emitted by Phase 2's `synthesizeProfile`. Final formula: `Σ (globalWeight[factor] × personalWeight[factor] × cityScore[factor]) − dealbreakerPenalties`, clamped 0–99.
- **D-05:** Score explanation = signed contribution bars (Teleport-style): each factor with its signed point contribution. Contract already supports it: `MatchResult.scoreFactors: {factor, contribution}[]`.
- **D-06:** Disclosure on expand. Ranked list shows score + city; tapping a card reveals contribution breakdown + financial detail.
- **D-07:** Real progressive federal income tax brackets + standard deduction (replaces flat 22%). Pure offline TS. Researched and cited below.
- **D-08:** Model depth: bracketed federal + flat state % + real FICA 7.65% + cost-indexed expenses. Deferred: state brackets, SS wage cap, per-category researched expense models.
- **D-09:** Move city data into `shared/data/cities.ts`, typed to the `City` contract. Add `country: "US"` and `financialModelId`.
- **D-10:** Expand to ~20–25 curated US cities.
- **D-11:** Enrich each city with `summerHighF`/`winterLowF` and concrete fields for every dealbreaker.
- **D-12:** Real, cited numbers for all cities.

### Claude's Discretion

- Exact engine module layout under `shared/engine/`
- Precise starting coefficient values (tunable per D-03)
- Sort/filter UI mechanics (MATCH-04)
- Specific city set chosen for spread

### Deferred Ideas (OUT OF SCOPE)

- Scale to all US cities via dataset/API — post-pitch
- Maximal financial model (state brackets, SS wage cap) — post-pitch
- International cities + FIN-02 country models — Phase 4
- Live-search reconciliation using `tradeoffTolerance` — Phase 5
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MATCH-01 | User receives a ranked list of matched cities scored against their profile | Scoring engine architecture (D-03/D-04), city dataset (D-10/D-11/D-12), dealbreaker model (D-01/D-02) |
| MATCH-03 | User can see why a city scored as it did | `scoreFactors` contract already defined; engine must emit additive contributions natively |
| MATCH-04 | User can sort/filter the ranked list (match, savings, salary, cost) | Extend existing `sortBy` state in results view; four sort keys |
| FIN-01 | User sees income-adjusted financial projection per city | Federal tax engine (D-07), FICA (D-08), cost-indexed expenses, D-08 model depth |
</phase_requirements>

---

## Summary

Phase 3 converts the Phase 2 `Profile` into a ranked `MatchResult[]` list, each with real income-adjusted financials, entirely offline. The three core deliverables are: (1) a pure-TS scoring engine in `shared/engine/` that consumes `Profile.weights` and city data to produce ranked results with signed `scoreFactors`, (2) a US financial model using real TY2026 IRS brackets + flat state tax + FICA, and (3) a curated, cited 22-city US dataset replacing the prototype's inline 12-city CITIES_DATA.

The key architectural risk is ensuring `scoreFactors` are computed as the actual additive terms (not a post-hoc heuristic) so the contribution bar UI displays honest numbers that sum to the final score. The D-02 re-confirm mechanism requires a pure function that compares the raw ranking (no penalties) to the penalized ranking — this must be implemented as a separate, testable operation at the engine boundary.

**Primary recommendation:** Build `shared/engine/` as four narrow pure-TS modules — `scoring.ts` (factor scores + weighting), `dealbreakers.ts` (penalty computation + D-02 re-confirm logic), `financial.ts` (tax + expense calculations), and `index.ts` (orchestrates all three, returns `MatchResult[]`). Scoring weights live in `shared/engine/scoring-weights.ts`. City data lives in `shared/data/cities.ts`. No library dependencies; pure functions throughout.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Scoring engine (factor scores, weighting, clamping) | Backend / Shared (`shared/engine/`) | — | Pure TS, no React dependency; must be unit-testable in isolation |
| Dealbreaker penalty + D-02 re-confirm logic | Backend / Shared (`shared/engine/`) | — | Two-pass ranking (penalized vs raw) is a pure function over city data + profile |
| Federal/state/FICA tax calculation | Backend / Shared (`shared/engine/`) | — | Pure math; pluggable by `financialModelId` so Phase 4 can append country models |
| City dataset | Backend / Shared (`shared/data/`) | — | Contract-first; imported by both engine and UI |
| Ranked-results UI + sort/filter (MATCH-04) | Browser / Client (`src/screens/`) | — | Extends existing `sortBy` state and results list; purely presentational |
| Score explanation (contribution bars, D-05/D-06) | Browser / Client (`src/screens/`) | — | Renders `MatchResult.scoreFactors[]`; visual detail owned by UI-phase |
| Dealbreaker re-confirm UX (D-02) | Browser / Client (`src/screens/`) | — | Renders modal/card when engine signals re-confirm needed; engine computes the trigger |

---

## Critical Contract Gap: City Type Needs New Fields

The current `shared/types.ts` `City` interface is **missing fields required by this phase.** The prototype's `CITIES_DATA` has `stateTax` inline but it is **not in the typed `City` interface**. The following fields must be added in a small, announced commit before engine implementation:

| Field | Type | Purpose | Dealbreaker It Enables |
|-------|------|---------|----------------------|
| `stateTax` | `number` (%) | State income tax rate, flat % | "No state income tax" |
| `summerHighF` | `number` (°F) | Avg high temp in hottest month (NOAA definition) | "No extreme heat" |
| `winterLowF` | `number` (°F) | Avg low temp in coldest month (NOAA definition) | "No extreme cold" |
| `nearMountains` | `boolean` | Within ~1 hr of major mountain range | "Must be near mountains" |
| `nearCoast` | `boolean` | Within ~1 hr of ocean/major coastal water | "Must be near ocean/coast" |
| `hasIntlAirport` | `boolean` | Has a major international airport (direct intl routes) | "Need international airport" |
| `topIndustries` | `string[]` | Already in prototype but not in types.ts — needed for job-field matching | "Must have strong job market in my field" |
| `pop` | `string` | Display only — metro population label | Display |
| `climate` | `string` | Display description | Display |

The `avgTemp` field remains for general display but is **explicitly insufficient** for the heat/cold dealbreaker checks — D-11 specifies `summerHighF`/`winterLowF` precisely for this reason. The engine must use the new fields for dealbreaker evaluation, never `avgTemp`.

**Action for planner:** Wave 0 must include a task to add these fields to `shared/types.ts` before engine or dataset tasks begin.

---

## Engine Input Contract (Profile.weights)

**Status of Phase 2 `Profile.weights`:** Phase 2's `synthesizeProfile` function (documented in 02-RESEARCH Pattern 3) derives `weights: { cost, career, lifestyle, safety }` from `importanceRank` using a `rankToWeight` function (rank 0 → weight 4, rank 1 → 3, rank 2 → 2, rank 3 → 1). This field is planned for `shared/types.ts` as part of Phase 2's execution but is **not yet in the current `types.ts`** (the current interface only has `importanceRank: string[]`).

**Engine dependency:** The Phase 3 engine must consume `Profile.weights`. Two options:
1. **Preferred:** Phase 2 execution lands `weights` in `types.ts` before Phase 3 begins.
2. **Fallback (if Phase 2 not merged):** Engine derives weights from `importanceRank` using the same `rankToWeight` fn — `{ cost: rankToWeight(rank.indexOf('cost')), ... }`.

The planner must sequence Phase 2 type changes before Phase 3 engine tasks, or build the fallback derivation into the engine entry point with a clear comment.

---

## Standard Stack

### Core (No New Libraries for Engine)

The engine is pure TypeScript with zero library dependencies. No scoring framework exists that is worth pulling for this use case.

| Component | Approach | Location |
|-----------|----------|----------|
| Scoring engine | Pure TS functions | `shared/engine/` |
| Financial model | Pure TS functions | `shared/engine/financial.ts` |
| City data | Typed TS constants | `shared/data/cities.ts` |
| Type contract | `shared/types.ts` | existing + new fields |

### Testing (Wave 0 Gap)

No test runner is currently installed (verified: `package.json` has no vitest, jest, or any test framework). The scoring engine and financial model are ideal unit test targets.

| Library | Version | Purpose | Disposition |
|---------|---------|---------|-------------|
| vitest | 4.1.8 [VERIFIED: npm registry] | Test runner for pure engine + financial functions | Required |
| @testing-library/react | 16.3.2 [VERIFIED: npm registry] | Component testing for results/sort UI | Required |
| @testing-library/jest-dom | latest | DOM matchers with vitest | Required |

**Installation (Wave 0):**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `vite.config.js` (or `vite.config.ts`):
```js
/// <reference types="vitest" />
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
  }
})
```

---

## Package Legitimacy Audit

> This phase adds no new runtime packages. vitest and testing-library packages are dev-only.

| Package | Registry | Age | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-------------|-----------|-------------|
| vitest | npm | 3+ yrs | github.com/vitest-dev/vitest | Could not run (sandbox) | [ASSUMED] — planner must add checkpoint:human-verify before install |
| @testing-library/react | npm | 7+ yrs | github.com/testing-library/react-testing-library | Could not run (sandbox) | [ASSUMED] — planner must add checkpoint:human-verify before install |
| @testing-library/jest-dom | npm | 6+ yrs | github.com/testing-library/jest-dom | Could not run (sandbox) | [ASSUMED] — planner must add checkpoint:human-verify before install |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged [SUS]:** none

*slopcheck unavailable (sandbox). All tagged [ASSUMED]. These are well-established packages in the ecosystem (vitest is the official Vite test runner; testing-library packages are the React testing standard), but provenance rule requires the planner gate each install behind a `checkpoint:human-verify` task.*

---

## D-07: Real Federal Income Tax — TY2026 IRS Brackets

### Which Tax Year Applies

**Tax year 2026** (income earned going forward) is the defensible choice for a relocation projection tool. The pitch models "what your finances would look like if you moved" — that's prospective, not retrospective. Using TY2025 (filed in 2026) would understate future tax by a small margin; TY2026 is the honest answer. State this choice explicitly if a judge asks.

### Legislative Context

The One Big Beautiful Bill Act (OBBBA), signed in July 2025, made permanent the TCJA's seven-rate structure that was scheduled to sunset after 2025. It also applied an additional 4% inflation adjustment to the bottom two brackets (10%, 12%) and a 2.3% adjustment to higher brackets. The TCJA sunset concern is resolved — TY2026 brackets are settled. [CITED: IRS newsroom OBBBA article + Tax Foundation 2026 brackets]

### TY2026 Federal Brackets — Single Filer

[CITED: IRS newsroom / Tax Foundation https://taxfoundation.org/data/all/federal/2026-tax-brackets/]

| Rate | On Taxable Income Over | Up To |
|------|----------------------|-------|
| 10% | $0 | $12,400 |
| 12% | $12,400 | $50,400 |
| 22% | $50,400 | $105,700 |
| 24% | $105,700 | $201,775 |
| 32% | $201,775 | $256,225 |
| 35% | $256,225 | $640,600 |
| 37% | $640,600 | — |

**Standard deduction (single filer, TY2026):** $16,100 [CITED: IRS TY2026 adjustments release + Tax Foundation]

**Taxable income formula:** `grossIncome − $16,100 = taxableIncome`

### FICA Rates — TY2026

[CITED: IRS Topic 751 https://www.irs.gov/taxtopics/tc751]

| Component | Employee Rate | Notes |
|-----------|---------------|-------|
| Social Security | 6.2% | Wage cap $184,500 for 2026 |
| Medicare | 1.45% | No wage cap |
| **Combined FICA** | **7.65%** | Per D-08, apply flat 7.65% (SS wage cap deferred) |

D-08 explicitly defers the SS wage cap. Applying flat 7.65% to all income is a documented simplification. For the demo's salary range ($35K–$120K for most professions in BASE_SALARIES), the SS cap ($184,500) is rarely hit, so the error is minimal. Note this simplification in a code comment.

### Dual-Income Simplification (Important Judge Risk)

The prototype applies single filer brackets to `income + partnerIncome`. D-07 says "single filer is the demo default." Two options for the planner:
1. **Simple (recommended):** Apply single brackets to the combined household income. Add a visible note in the UI: "Tax estimate uses single-filer brackets. Married-filing-jointly rates may differ." This is a transparent simplification.
2. **Full:** Add MFJ bracket table. MFJ 2026 thresholds are approximately double the single-filer thresholds for most brackets. Post-pitch refinement.

Document the simplification choice in a code comment. If a judge asks: "Our demo uses single-filer brackets for simplicity; in a full version we'd apply MFJ brackets for couples."

### Reference Tax Calculation (Software Engineer, Austin TX)

For engine testing against bracket boundaries:
- BASE_SALARIES["Software Engineer"] = $110,000
- City-adjusted salary = $110,000 × (103/100) = **$113,300** (Austin costIndex = 103)
- Standard deduction: −$16,100
- Taxable income: $113,300 − $16,100 = $97,200
- Federal tax: (12,400 × 10%) + (38,000 × 12%) + (46,800 × 22%) = $1,240 + $4,560 + $10,296 = **$16,096**
- FICA: $113,300 × 7.65% = $8,667
- State (TX, 0%): $0
- Monthly take-home: ($113,300 − $16,096 − $8,667) / 12 = **$7,378/mo**

*Use this as the unit test expectation for `computeMatchResult` on Austin with a Software Engineer profile.*

---

## D-08: Financial Model in Pure TS

### Module Interface (Pluggable by financialModelId)

```typescript
// shared/engine/financial.ts

export interface FinancialModel {
  id: string;                          // matches City.financialModelId
  computeTax(grossIncome: number, stateRate: number): number;  // annual tax
  computeExpenses(profile: Profile, city: City): ExpenseBreakdown;
}

// US model — registered as financialModelId = "us"
export const US_FINANCIAL_MODEL: FinancialModel = {
  id: "us",
  computeTax: computeUSTax,
  computeExpenses: computeUSExpenses,
};

// Registry pattern — Phase 4 appends country models here
export const FINANCIAL_MODELS: Record<string, FinancialModel> = {
  "us": US_FINANCIAL_MODEL,
  // "canada": CANADA_MODEL,   // Phase 4
  // "portugal": PORTUGAL_MODEL,  // Phase 4
};
```

### Federal Tax Function (Bracketed)

```typescript
// shared/engine/financial.ts
const STANDARD_DEDUCTION_SINGLE_2026 = 16100;

const FEDERAL_BRACKETS_2026: Array<{ limit: number; rate: number }> = [
  { limit: 12400,   rate: 0.10 },
  { limit: 50400,   rate: 0.12 },
  { limit: 105700,  rate: 0.22 },
  { limit: 201775,  rate: 0.24 },
  { limit: 256225,  rate: 0.32 },
  { limit: 640600,  rate: 0.35 },
  { limit: Infinity, rate: 0.37 },
];

// Source: IRS TY2026 inflation adjustments (OBBBA-amended)
// https://taxfoundation.org/data/all/federal/2026-tax-brackets/
export function computeFederalTax(grossIncome: number): number {
  const taxableIncome = Math.max(0, grossIncome - STANDARD_DEDUCTION_SINGLE_2026);
  let tax = 0;
  let prev = 0;
  for (const bracket of FEDERAL_BRACKETS_2026) {
    if (taxableIncome <= prev) break;
    const inBracket = Math.min(taxableIncome, bracket.limit) - prev;
    tax += inBracket * bracket.rate;
    prev = bracket.limit;
  }
  return tax;
}

export function computeUSTax(grossIncome: number, stateRate: number): number {
  const federal = computeFederalTax(grossIncome);
  const state = grossIncome * (stateRate / 100);
  const fica = grossIncome * 0.0765;  // flat — SS cap deferred per D-08
  return federal + state + fica;
}
```

### Expense Model

The prototype's expense model is sound. Port it unchanged, keeping the `costIndex / 100` multiplier as the cost-of-living scaler. The `debtPay = debt * 0.01` rule (1% of total debt monthly) is a simplification but defensible for demo.

```typescript
// From prototype (PotentialApp.jsx lines 88-101) — port directly to shared/engine/
export function computeUSExpenses(profile: Profile, city: City): ExpenseBreakdown {
  const m = city.costIndex / 100;
  const rent = profile.housing === "rent" ? city.medianRent : Math.round(city.medianHome * 0.006);
  const food = Math.round((profile.hasDependents ? 600 + profile.numDependents * 200 : 400) * m);
  const transport = Math.round(250 * m);
  const utilities = Math.round(160 * m);
  const insurance = Math.round(350 * m);
  const personal = Math.round(300 * m);
  const childcare = profile.hasDependents ? Math.round(800 * profile.numDependents * m) : 0;
  const pets = profile.hasPets ? Math.round(100 * m) : 0;
  const debtPay = Math.round(profile.debt * 0.01);
  const total = rent + food + transport + utilities + insurance + personal + childcare + pets + debtPay;
  return { rent, food, transport, utilities, insurance, personal, childcare, pets, debtPay, total };
}
```

---

## D-03/D-04: Scoring Engine Architecture

### Scoring Weights Config (Centralized)

```typescript
// shared/engine/scoring-weights.ts
// ALL magic numbers live here. Edit these to tune scoring.

export const SCORING_WEIGHTS = {
  // Global factor weights — how much each factor contributes in general
  // These multiply personal weights (Profile.weights) — so effective weight = global × personal
  global: {
    cost:      1.0,  // scale these to tune relative factor dominance
    career:    1.0,
    lifestyle: 1.0,
    safety:    0.8,
  },

  // Dealbreaker penalties (subtracted from raw score, before clamp)
  dealbreaker: {
    penalty: 30,   // points deducted per triggered dealbreaker
  },

  // Per-tag lifestyle bonuses (score added when city vibes match user tag)
  lifestyle: {
    tagVibeBonus: 8,    // max bonus when a lifestyle tag matches a city vibe
    walkBonus: 0.08,    // walkScore × this per lifestyle point
    startupBonus: 1.2,  // jobGrowth × this for "startup" tag
  },

  // Factor normalization — keep city factor scores on a consistent scale before weighting
  normalization: {
    costMaxContribution: 20,     // max raw points from cost factor
    careerMaxContribution: 20,
    lifestyleMaxContribution: 20,
    safetyMaxContribution: 12,
  },
} as const;
```

### Score Formula (D-04)

```
rawScore = 50  (base)
  + globalWeight.cost × personalWeight.cost × costFactorScore(city)
  + globalWeight.career × personalWeight.career × careerFactorScore(city)
  + globalWeight.lifestyle × personalWeight.lifestyle × lifestyleFactorScore(city, profile)
  + globalWeight.safety × personalWeight.safety × safetyFactorScore(city)

penalizedScore = rawScore − Σ(triggeredDealbreakers × SCORING_WEIGHTS.dealbreaker.penalty)

finalScore = clamp(Math.round(penalizedScore), 0, 99)
```

### Per-Factor Normalization (Key Design Decision)

To make contributions comparable and additive, each factor must produce a score on a consistent, bounded scale before weighting. Recommendation: normalize each factor to a 0–1 scale, then multiply by the factor's `maxContribution` cap:

```typescript
// Cost factor: lower cost = higher score
// Scale: US national average = 100. costIndex 60 (very cheap) → 1.0; costIndex 140 (expensive) → 0.0; baseline 100 → 0.5
// Example: Austin 103 → 0.46, San Antonio 94 → 0.575, Seattle 132 → 0.10, NYC 143 → 0.0 (clamped)
function costFactorScore(city: City): number {
  return Math.max(0, Math.min(1, (140 - city.costIndex) / 80));
}

// Career factor: higher jobGrowth + remote bonus
function careerFactorScore(city: City, profile: Profile): number {
  const growthScore = Math.min(1, city.jobGrowth / 5.0);  // 5% growth = full score
  const remoteBonus = profile.hasRemote ? 0.3 : 0;
  return Math.min(1, growthScore + remoteBonus);
}

// Safety factor: city.safetyIndex is 0-100 (Numbeo)
function safetyFactorScore(city: City): number {
  return city.safetyIndex / 100;
}

// Lifestyle factor: computed from tag matches (see full implementation below)
```

Then: `contribution[factor] = global[factor] × personal[factor] × factorScore × maxContribution[factor]`

This ensures `scoreFactors` entries are the *actual* additive terms — they literally sum to `rawScore − 50` — so the contribution bar UI displays honest numbers.

### D-02 Dealbreaker Re-Confirm Logic

```typescript
// shared/engine/dealbreakers.ts

export interface ReconfirmSignal {
  city: City;
  dealbreaker: string;
  factLabel: string;  // e.g. "summer highs above 97°F" — the real fact
}

export function checkReconfirm(
  penalizedRanking: MatchResult[],
  rawRanking: MatchResult[],   // same cities, no penalty applied
  profile: Profile
): ReconfirmSignal | null {
  const penalizedTop = penalizedRanking[0];
  const rawTop = rawRanking[0];
  if (penalizedTop.city.name === rawTop.city.name) return null; // same city, no re-confirm needed
  
  // Determine which dealbreaker demoted rawTop
  const triggered = getTriggeredDealbreakers(rawTop.city, profile.dealBreakers);
  if (triggered.length === 0) return null;
  
  return {
    city: rawTop.city,
    dealbreaker: triggered[0].label,
    factLabel: triggered[0].factLabel,  // e.g. "summer highs above 97°F"
  };
}
```

**Re-confirm copy template (D-02):**
> "Based on your answers, **[City]** would be your top match. But [City]'s [factLabel]. Is that still a dealbreaker for you?"

---

## D-10/D-11/D-12: Curated 22-City US Dataset

### Recommended City Set (Geographic + Cost Spread)

Rationale: 22 cities provides "comprehensive" stage presence without scale risk. Selection balances: Sun Belt (growth), Rust Belt (affordability), Pacific Northwest, Mountain West, Southeast, Midwest, Northeast, and two Texas anchors. The prototype's 12 cities are included; 10 are new additions.

### Dealbreaker Field Mapping (Complete)

Every dealbreaker in `DEAL_BREAKERS` maps to a City field:

| Dealbreaker | City Field(s) | Threshold | Source |
|------------|---------------|-----------|--------|
| "No extreme cold" | `winterLowF` | < 25°F triggers penalty | NOAA avg Jan low |
| "No extreme heat" | `summerHighF` | > 95°F triggers penalty | NOAA avg July high |
| "Must have public transit" | `transitScore` | < 40 triggers penalty | Walk Score |
| "Must be walkable" | `walkScore` | < 50 triggers penalty | Walk Score |
| "No state income tax" | `stateTax` | > 0 triggers penalty | Tax Foundation |
| "Must be near mountains" | `nearMountains` | false triggers penalty | Geographic definition |
| "Must be near ocean/coast" | `nearCoast` | false triggers penalty | Geographic definition |
| "Low crime only" | `safetyIndex` | < 55 triggers penalty (Numbeo scale) | Numbeo 2025 |
| "Need international airport" | `hasIntlAirport` | false triggers penalty | Practical routing |
| "Must have strong job market in my field" | `jobGrowth` + `topIndustries` | jobGrowth < 2.0 OR profession's industry not in topIndustries | BLS data |

**Note on threshold calibration:** The prototype used `avgTemp < 45` for cold and `> 72` for heat — these thresholds were poorly calibrated (Austin avgTemp 68 doesn't trigger heat despite 97°F July highs). The new `summerHighF`/`winterLowF` fields fix this. Re-calibrate thresholds in `scoring-weights.ts`.

### 22-City Dataset with Cited Figures

**Sources key:**
- Rent: Zumper (May 2026), confirmed via national report + city pages [CITED: zumper.com/rent-research/national-rent-report]
- State tax: Tax Foundation 2026 state rates [CITED: taxfoundation.org/data/all/state/state-income-tax-rates-2026/]
- costIndex: Derived from Numbeo Cost of Living Index 2026 [CITED: numbeo.com current rankings], then rescaled from Numbeo's NYC=100 baseline to a US-national-average=100 baseline (using Austin as anchor: Numbeo 72 → prototype 103, ratio 1.431). This scale is required by the `getSalary` and `getExpenses` formulas which use `costIndex/100` as a US-average multiplier.
- Walk/Transit Score: Walk Score city rankings [CITED: walkscore.com/cities-and-neighborhoods/]
- Safety Index: Numbeo 2025 Safety Index [CITED: numbeo.com/crime/region_rankings.jsp?region=021]
- jobGrowth: BLS Metropolitan Employment data 2024-2025 [CITED: bls.gov/web/metro/largemetro_oty_change.htm]
- summerHighF / winterLowF: CurrentResults.com (derived from NOAA normals) [CITED: currentresults.com/Weather/US/]

**Climate metric definition:** `summerHighF` = average daily high temperature in the hottest month (typically July or August). `winterLowF` = average daily low temperature in the coldest month (typically January). Source: CurrentResults.com using NOAA 30-year normals.

| City | State | costIndex | medianRent | stateTax | walkScore | transitScore | safetyIndex | jobGrowth | summerHighF | winterLowF | nearMountains | nearCoast | hasIntlAirport | financialModelId |
|------|-------|-----------|------------|----------|-----------|--------------|-------------|-----------|-------------|------------|---------------|-----------|----------------|-----------------|
| Austin, TX | TX | 103 | 1,450 | 0 | 42 | 35 | 58 | 2.5 | 97 | 42 | false | false | true | us |
| Nashville, TN | TN | 107 | 1,500 | 0 | 29 | 22 | 70 | 2.5 | 91 | 30 | false | false | true | us |
| Miami, FL | FL | 122 | 2,590 | 0 | 77 | 57 | 47 | 2.5 | 91 | 61 | false | true | true | us |
| Denver, CO | CO | 113 | 1,580 | 4.40 | 61 | 45 | 52 | 1.8 | 90 | 18 | true | false | true | us |
| Pittsburgh, PA | PA | 99 | 1,050 | 3.07 | 62 | 55 | 65 | 1.2 | 83 | 26 | false | false | true | us |
| Raleigh, NC | NC | 96 | 1,350 | 3.99 | 31 | 29 | 61 | 2.5 | 91 | 32 | false | false | true | us |
| Portland, OR | OR | 119 | 1,400 | 9.90 | 67 | 49 | 43 | 1.0 | 82 | 37 | true | false | true | us |
| Boise, ID | ID | 99 | 1,100 | 5.80 | 39 | 23 | 70 | 2.0 | 92 | 24 | true | false | false | us |
| Salt Lake City, UT | UT | 96 | 1,300 | 4.50 | 57 | 39 | 66 | 2.5 | 94 | 24 | true | false | true | us |
| Chicago, IL | IL | 109 | 1,700 | 4.95 | 77 | 65 | 34 | 0.8 | 85 | 20 | false | false | true | us |
| San Diego, CA | CA | 119 | 2,200 | 13.30 | 53 | 37 | 68 | 1.5 | 75 | 50 | false | true | true | us |
| Seattle, WA | WA | 132 | 1,974 | 0 | 74 | 60 | 46 | 1.5 | 77 | 38 | true | true | true | us |
| Minneapolis, MN | MN | 107 | 1,330 | 9.85 | 71 | 55 | 60 | 1.0 | 83 | 9 | false | false | true | us |
| Phoenix, AZ | AZ | 109 | 1,200 | 2.50 | 41 | 36 | 47 | 2.0 | 107 | 44 | false | false | true | us |
| Atlanta, GA | GA | 112 | 1,660 | 5.19 | 48 | 44 | 36 | 1.5 | 90 | 36 | false | false | true | us |
| Charlotte, NC | NC | 103 | 1,400 | 3.99 | 26 | 27 | 65 | 2.5 | 90 | 35 | false | false | true | us |
| Tampa, FL | FL | 99 | 1,500 | 0 | 50 | 31 | 54 | 1.8 | 91 | 53 | false | true | true | us |
| Columbus, OH | OH | 106 | 1,200 | 3.99 | 41 | 30 | 51 | 1.5 | 85 | 22 | false | false | true | us |
| Indianapolis, IN | IN | 100 | 1,045 | 2.95 | 31 | 25 | 39 | 1.5 | 85 | 21 | false | false | true | us |
| San Antonio, TX | TX | 94 | 1,100 | 0 | 37 | 31 | 52 | 2.0 | 95 | 41 | false | false | true | us |
| Dallas, TX | TX | 109 | 1,400 | 0 | 46 | 39 | 49 | 1.8 | 97 | 32 | false | false | true | us |
| Brooklyn/NYC, NY | NY | 143 | 2,800 | 10.90 | 95 | 89 | 48 | 0.8 | 85 | 26 | false | true | true | us |

**Notes on specific entries:**
- Austin costIndex = 103: matches prototype exactly (used as the anchor for Numbeo→US-avg rescaling). Rent from prototype ($1,450) cross-checked against 2025 market data; Zumper April 2026 Austin median 1BR ~$1,380 — $1,450 is a reasonable midpoint.
- NYC stateTax: 10.9% represents NY state top bracket applicable at most salary levels (NYC city tax would add ~3.9% but is omitted per D-08 flat-% approach; note in code).
- Phoenix `summerHighF` = 107°F (July avg high per CurrentResults). Extreme heat dealbreaker should trigger at 95°F threshold. Phoenix will always trigger "No extreme heat."
- Minneapolis `winterLowF` = 9°F (January avg low). Extreme cold dealbreaker should trigger at 25°F threshold. Minneapolis always triggers "No extreme cold."
- Boise `hasIntlAirport` = false (BOI has no nonstop international routes other than seasonal Canada). [ASSUMED — verify at execution time]
- Ohio income tax rate: OH has a graduated rate; for flat-% approximation per D-08, 3.99% is the effective rate for most $40K-$120K earners post-2025 reforms. [ASSUMED — planner should verify current OH rate for 2026]

**Fields NOT yet in the dataset that the planner must populate at execution time:**
- `medianHome` — needed for "buy" housing mode. Port from prototype for existing 12 cities; research new 10.
- `topIndustries` — needed for job-field dealbreaker. Prototype has all 12; research new 10.
- `vibe` — needed for lifestyle scoring. Prototype has all 12; assign for new 10 (planner's discretion per CONTEXT.md).
- `lat`, `lng`, `emoji` — display fields, no algorithmic use.

---

## D-03: Scoring Engine Module Layout

### Recommended File Structure

```
shared/
├── types.ts                     # Extended with new City fields (contract change)
├── data/
│   ├── constants.js             # existing: BASE_SALARIES, DEAL_BREAKERS, etc.
│   └── cities.ts                # NEW: typed City[] replacing inline CITIES_DATA
└── engine/
    ├── scoring-weights.ts       # D-03: all magic numbers (global weights, penalties, bonuses)
    ├── financial.ts             # D-07/D-08: computeUSTax, computeUSExpenses, FINANCIAL_MODELS registry
    ├── scoring.ts               # D-04: per-factor scores + two-layer weighting
    ├── dealbreakers.ts          # D-01/D-02: penalty computation + re-confirm signal
    └── index.ts                 # Orchestrator: rankCities(profile) → { results, reconfirm? }

src/screens/results/
    ├── ResultsView.jsx          # Ranked list with sort pills (MATCH-04)
    └── CityDetail.jsx           # Expanded card with contribution bars + financial (D-05/D-06)
```

### Engine Orchestrator Interface

```typescript
// shared/engine/index.ts
export interface RankingOutput {
  results: MatchResult[];                 // penalized, sorted by matchScore desc
  reconfirmSignal?: ReconfirmSignal;      // present if D-02 re-confirm should show
}

export function rankCities(profile: Profile): RankingOutput {
  const model = FINANCIAL_MODELS[/* each city's */ city.financialModelId] ?? US_FINANCIAL_MODEL;

  const rawResults = CITIES_DATA
    .filter(city => profile.opennessToAbroad === 0 ? city.country === "US" : true)
    .map(city => computeMatchResult(city, profile, model));

  const rawRanking = [...rawResults].sort((a, b) => b.matchScore - a.matchScore);

  // Apply dealbreaker penalties
  const penalizedResults = rawResults.map(r => applyPenalties(r, profile));
  const penalizedRanking = [...penalizedResults].sort((a, b) => b.matchScore - a.matchScore);

  const reconfirmSignal = checkReconfirm(penalizedRanking, rawRanking, profile);

  return { results: penalizedRanking, reconfirmSignal };
}
```

---

## MATCH-04: Sort/Filter Pattern

The prototype already has `sortBy` state and a working sort implementation. Extend it:

```javascript
// Existing in PotentialApp.jsx (lines 449-455) — port to ResultsView.jsx
const sorted = [...results].sort((a, b) => {
  if (sortBy === "match") return b.matchScore - a.matchScore;
  if (sortBy === "savings") return b.monthlySavings - a.monthlySavings;
  if (sortBy === "salary") return b.estSalary - a.estSalary;    // use MatchResult.estSalary
  if (sortBy === "cost") return a.city.costIndex - b.city.costIndex;
  return 0;
});
```

The four sort keys (`match`, `savings`, `salary`, `cost`) are already named correctly against the `MatchResult` shape. The sort pill UI exists in the prototype. This is a direct port with a field name update (`salary` → `estSalary` to match the typed contract).

**Filter (optional this phase):** The CONTEXT.md does not specify a filter UI beyond the dealbreaker re-confirm UX. No country filter is needed yet (all cities are US). A future phase may add country filter when international cities arrive.

---

## D-05/D-06: Score Explanation (Contribution Bars)

### Engine Output Shape

`MatchResult.scoreFactors: { factor: string; contribution: number }[]` is already in the contract. The engine must populate it as the actual additive terms:

```typescript
const scoreFactors = [
  { factor: "Cost",      contribution: costContribution },      // e.g. +12
  { factor: "Career",    contribution: careerContribution },    // e.g. +8
  { factor: "Lifestyle", contribution: lifestyleContribution }, // e.g. +6
  { factor: "Safety",    contribution: safetyContribution },    // e.g. +4
  // Dealbreaker entries appear only if triggered:
  { factor: "No extreme heat", contribution: -30 },             // always negative
];
```

Verification: `50 (base) + sum(contributions) === rawScore` (before clamp). This is a testable invariant.

### UI Pattern (Light Research — Owned by UI-Phase)

The signed-contribution-bar pattern shows each factor as a horizontal bar, color-coded positive (green/mint) or negative (red). The dealbreaker penalty appears as a real negative bar, not just an asterisk. Teleport's original UI used this exact pattern — it was their credibility differentiator. The exact visual implementation is deferred to the UI-phase pass for this surface. Engine output shape is fixed now; visual rendering is separate.

---

## Architecture Patterns

### System Architecture Diagram

```
User (completes Phase 2 quiz)
        |
        v
  Profile (from shared/types.ts)
  { profession, income, weights, dealBreakers, opennessToAbroad, ... }
        |
        v
  shared/engine/index.ts  rankCities(profile)
        |
        |-- shared/data/cities.ts  CITIES_DATA: City[]
        |
        |-- per-city loop:
        |   |-- financial.ts  computeTax(salary, stateRate)
        |   |-- financial.ts  computeExpenses(profile, city)
        |   |-- scoring.ts    factorScores → weighted contributions
        |   |-- dealbreakers.ts  penalties (pass 1: raw; pass 2: penalized)
        |
        v
  RankingOutput { results: MatchResult[], reconfirmSignal? }
        |
        v
  src/screens/results/ResultsView.jsx
        |-- Sort pills (MATCH-04): match / savings / salary / cost
        |-- City cards: name, score, salary, monthlySavings
        |-- Tap → CityDetail.jsx
              |-- scoreFactors[] → signed contribution bars (D-05)
              |-- ExpenseBreakdown → expense list (FIN-01)
              |-- D-02 re-confirm: shown as overlay if reconfirmSignal present
```

### Anti-Patterns to Avoid

- **Scattered magic numbers:** Do not write `score += 0.2 * ...` inline. All coefficients live in `scoring-weights.ts`.
- **Post-hoc score explanation:** Do not compute `scoreFactors` separately from the scoring loop. Collect contributions *inside* the same loop that produces `matchScore` — they must be identical arithmetic.
- **Hard delete on dealbreaker:** D-01 is explicit: penalties only, never `filter()` cities out.
- **`avgTemp` for heat/cold checks:** Use `summerHighF`/`winterLowF`. `avgTemp` blends seasons and produces wrong dealbreaker signals (Austin avgTemp 68 ≠ 97°F July high).
- **Applying single brackets to household income without a note:** Fine as a simplification but must be commented and surfaced in UI for dual-income users.

---

## Common Pitfalls

### Pitfall 1: scoreFactors Don't Sum to matchScore

**What goes wrong:** `scoreFactors` are computed separately from `matchScore` as a "visualization layer," producing different numbers.
**Why it happens:** Engineer decouples "display logic" from "scoring logic" for cleanliness, then they drift.
**How to avoid:** Collect `contributions[]` inside the same loop that builds `rawScore`. The formula is: `rawScore = BASE_SCORE + contributions.reduce((s, c) => s + c.contribution, 0)`. Unit test: assert `Math.abs(rawScore - (BASE_SCORE + sum(contributions))) < 0.01`.
**Warning signs:** Contribution bars don't visually add up; judges notice the displayed score doesn't match the sum.

### Pitfall 2: D-02 Re-Confirm Logic Is UI-Side Only

**What goes wrong:** Re-confirm is computed in the React component by comparing sorted results arrays in a `useEffect`, leading to a flaky comparison that breaks on re-renders.
**Why it happens:** The "compare raw vs penalized ranking" feels like display logic.
**How to avoid:** The re-confirm signal is an engine output (part of `RankingOutput`). The engine computes both rankings and compares `rawRanking[0].city.name !== penalizedRanking[0].city.name`. The UI only reads the signal; it doesn't re-compute it.

### Pitfall 3: costIndex Scale Mismatch

**What goes wrong:** `getSalary = base × costIndex/100` and `getExpenses` multiply all costs by `costIndex/100`. If Numbeo's raw NYC=100 values are used (Austin=72), every salary and expense is understated by ~30% relative to US averages.
**Why it happens:** Engineer uses Numbeo values directly without rescaling.
**How to avoid:** The city dataset in this research uses US-national-average=100 scale (Numbeo values × 1.431, anchored at Austin=103). At execution time, the cities.ts file must include a comment documenting this scale. Never mix raw Numbeo values with prototype-scaled values in the same dataset.
**Warning signs:** Software Engineer salary in Austin computes as ~$79K instead of ~$113K; or an "expensive" city like NYC shows costIndex near 100 instead of 143+.

### Pitfall 4: State Tax Rate Choice for Multi-Bracket States

**What goes wrong:** The engine applies a top marginal rate (e.g., Minnesota 9.85%) to all income, overtaxing lower earners.
**Why it happens:** D-08 says "flat state %" but some states (MN, OR, CA) have graduated brackets.
**How to avoid:** Per D-08, use the rate that applies to the middle of the demo's salary range (~$55K-$100K) as the flat approximation. For Minnesota at $75K, the applicable bracket is ~7.85%, not 9.85%. Add a code comment. The values in the city dataset should reflect this approximation, not the top marginal rate. (Note: the dataset above uses 9.85% for Minneapolis — planner should revise to ~7.85% for a $75K income scenario, or accept the overestimate as conservative.)

### Pitfall 5: Near-Mountains / Near-Coast Are Booleans, Not Distance-Accurate

**What goes wrong:** "Must be near mountains" is ambiguous — does Denver (in the city) count, or only cities with mountains visible from downtown?
**How to avoid:** Define the standard once in a code comment: "nearMountains = true if a major mountain range is within a 60-minute drive of the city center." Apply this definition consistently. Same for nearCoast: "within 60 minutes of ocean/major coastal bay." These are judgment calls — document them so a judge asking "how did you define 'near mountains'?" gets a real answer.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tax bracket computation | Custom recursive loop | Iterative loop against bracket array (provided above) | Already ~15 lines — the pattern is standard and provided |
| Cost-of-living comparison | Custom scraper/API | Numbeo index (static) | Offline-first; 30-year normals are stable |
| City scoring library | npm package | Pure TS functions | No scoring library matches this domain; all are either ML-based or too generic |
| Test framework | Hand-rolled asserts | vitest | Already the Vite-native choice; zero config for Vite projects |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.1.8 (Wave 0 install required) |
| Config file | `vite.config.js` — add `test: { environment: 'jsdom', globals: true }` |
| Quick run command | `npx vitest run --reporter=dot` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FIN-01 | `computeFederalTax(110000)` = $15,370 ± $1 (bracket arithmetic) | unit | `vitest run shared/engine/financial.test.ts` | ❌ Wave 0 |
| FIN-01 | `computeFederalTax(0)` = $0 (edge: below standard deduction) | unit | same | ❌ Wave 0 |
| FIN-01 | `computeFederalTax(16100)` = $0 (exactly at standard deduction) | unit | same | ❌ Wave 0 |
| FIN-01 | `computeUSTax(75000, 9.85)` < `computeUSTax(75000, 0)` (state tax adds correctly) | unit | same | ❌ Wave 0 |
| MATCH-01 | `rankCities(profile)` returns ≥ 1 result for any valid profile (never empty) | unit | `vitest run shared/engine/index.test.ts` | ❌ Wave 0 |
| MATCH-01 | All results clamped 0–99 | unit | same | ❌ Wave 0 |
| MATCH-03 | `sum(scoreFactors.contributions) + BASE_SCORE ≈ matchScore` (pre-penalty) | unit | same | ❌ Wave 0 |
| MATCH-01 (D-02) | Re-confirm signal present when dealbreaker demotes raw #1 | unit | `vitest run shared/engine/dealbreakers.test.ts` | ❌ Wave 0 |
| MATCH-01 (D-02) | Re-confirm signal absent when penalized #1 === raw #1 | unit | same | ❌ Wave 0 |
| MATCH-04 | Sort by "savings" puts highest `monthlySavings` first | unit | `vitest run src/screens/results/ResultsView.test.jsx` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run --reporter=dot` (< 5 seconds for pure functions)
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `shared/engine/financial.test.ts` — covers FIN-01 bracket math (test against IRS reference calculation)
- [ ] `shared/engine/index.test.ts` — covers MATCH-01 never-empty, clamping, full flow
- [ ] `shared/engine/dealbreakers.test.ts` — covers D-02 re-confirm signal logic
- [ ] `src/screens/results/ResultsView.test.jsx` — covers MATCH-04 sort behavior
- [ ] `src/test-setup.js` — vitest + jest-dom setup
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] `vite.config.js` test block added

---

## Security Domain

> `security_enforcement` is absent from config.json — treating as enabled.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | no auth this phase |
| V3 Session Management | no | no session this phase |
| V4 Access Control | no | no access control this phase |
| V5 Input Validation | yes | Profile values from quiz (sliders, selects) — constrain numeric inputs to valid ranges in engine entry point; do not let malformed `costIndex` or `stateTax` produce NaN |
| V6 Cryptography | no | no crypto this phase |

**Threat pattern specific to this phase:**

| Pattern | Risk | Mitigation |
|---------|------|-----------|
| NaN propagation in financial calculations | Division by zero if `city.costIndex = 0`; NaN spreads through expense chain | Guard: `if (city.costIndex <= 0) costIndex = 1;` in engine entry |
| Score clamping bypass | Client can pass malformed Profile with weights > 4 | Engine validates: clamp all weights to [0, 4] range at entry |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Engine tests, Vite build | ✓ | (project already running) | — |
| npm | Package install | ✓ | (project already running) | — |
| vitest | Unit testing | ✗ (not installed) | — | Manual assertion script (weak fallback) |

**Missing with no viable fallback:**
- vitest: required for Nyquist validation; must be installed in Wave 0 before any engine tests can run.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Boise `hasIntlAirport` = false (BOI has limited international) | City Dataset | Low risk — easily corrected at execution time |
| A2 | Ohio 2026 income tax effective rate ~3.99% for demo salary range | City Dataset | Low risk — flat approximation per D-08; may need adjustment |
| A3 | Minneapolis stateTax 9.85% in dataset — this is the top rate, not the effective rate for $55-100K salaries (Pitfall 4) | City Dataset | Medium risk — overtaxes Minneapolis by ~2%, making it appear less competitive. Planner should decide to use effective rate (~7.85%) or top marginal with a note. |
| A4 | `nearMountains`/`nearCoast` definitions are judgment calls (60-min drive standard) | Dealbreaker Mapping | Low risk — consistent application matters more than exact distance |
| A5 | costIndex values are Numbeo-derived, rescaled to US-avg=100 (Austin=103 anchor, ratio 1.431). Relative ordering is from Numbeo; absolute scale is prototype-compatible. | City Dataset | Low risk — anchor point and rescaling formula documented. Planner must use the rescaled values in this table, not raw Numbeo. If Numbeo data is used raw by mistake, all salaries and expenses will be ~30% understated. |
| A6 | `Profile.weights` will be landed by Phase 2 execution before Phase 3 engine tasks | Engine Input Contract | High risk — if Phase 2 hasn't merged `weights` into types.ts, the engine must fall back to deriving from `importanceRank`. Planner must check Phase 2 status. |
| A7 | TY2026 brackets are final and settled (OBBBA signed July 2025) | Tax Data | Very low risk — cited from IRS + Tax Foundation |

---

## Open Questions (RESOLVED)

1. **Phase 2 `weights` merge status**
   - What we know: Phase 2 RESEARCH documents the `synthesizeProfile` fn and `weights` shape. Phase 2 plan/execute status unknown.
   - What's unclear: Has Phase 2 been executed? Is `weights` in `types.ts` yet?
   - Recommendation: Planner checks git log / Phase 2 status before sequencing engine tasks. Add fallback derivation as a documented code path.
   - **RESOLVED (planning):** Plan 03-02 Task 2 makes `Profile.weights` **optional** in `shared/types.ts`, and Plan 03-04 implements `rankToWeight(profile)` with the `profile.weights ?? {derived-from-importanceRank}` fallback (index 0→4, 1→3, 2→2, 3→1). The engine works whether or not Phase 2 has merged `weights` — no sequencing dependency on Phase 2 remains.

2. **costIndex scale — RESOLVED**
   - Decision: Use US-national-average = 100 scale (same as prototype). Numbeo data (NYC=100 baseline) was rescaled using Austin as anchor (Numbeo 72 → prototype 103, ratio 1.431). All 22 cities in this dataset use the rescaled values.
   - Why this matters: `getSalary = base × costIndex/100` and `getExpenses` multiply by `costIndex/100`. If costIndex=72 (Numbeo Austin), a $110K base produces $79,200 salary — wrong. With costIndex=103, it produces $113K — correct for a US-avg anchored scale.
   - Action: At execution time, verify that cities.ts adds a comment "// costIndex: US-national-average=100 scale. Derived from Numbeo (NYC=100) × 1.431 rescaling factor."
   - Note: Brooklyn/NYC (143) is higher than the prototype's 187 — the prototype overcalibrated NYC. 143 is defensible given actual rent data ($2,800/mo) and the `getSalary` formula.

3. **Minneapolis effective state tax rate**
   - What we know: MN top rate is 9.85%; $55-100K earners are taxed at 7.85% (3rd bracket).
   - What's unclear: Does D-08's "flat state %" mean top marginal or effective?
   - Recommendation: Use effective rate for the demo's salary range (~7.85% for Minneapolis). This is more defensible than the top rate. Add a comment in the cities.ts entry.
   - **RESOLVED (planning):** Plan 03-02 Task 4 sets Minneapolis `stateTax: 7.85` in `shared/data/cities.ts` (the effective rate for the demo's salary range) with an inline comment noting it is the effective, not top-marginal, rate.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat 22% federal tax (prototype) | Progressive TY2026 brackets | This phase (D-07) | Take-home calculations become defensible in Q&A |
| Inline CITIES_DATA in JSX | `shared/data/cities.ts` typed export | This phase (D-09) | Engine and UI share one source; Phase 4 can append |
| Magic numbers scattered in getMatchScore | Centralized `scoring-weights.ts` | This phase (D-03) | One-line tuning; unit-testable |
| `avgTemp` for dealbreaker checks | `summerHighF`/`winterLowF` from NOAA normals | This phase (D-11) | Accurate heat/cold signals; "Austin hits 97°F+" is a real fact |
| No test framework | vitest + testing-library | Wave 0 of this phase | Engine and financial math testable at bracket boundaries |

**Deprecated/outdated:**
- `getTakeHome` flat-22% logic in PotentialApp.jsx: replaced by `computeUSTax` in `shared/engine/financial.ts`.
- Inline `CITIES_DATA` array in PotentialApp.jsx: replaced by `shared/data/cities.ts`.
- `getMatchScore` with scattered coefficients: replaced by modular engine with `scoring-weights.ts`.

---

## Sources

### Primary (HIGH confidence)

- IRS TY2026 inflation adjustments (OBBBA-amended) — federal brackets, standard deduction — https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill
- Tax Foundation 2026 Federal Tax Brackets — bracket table, OBBBA context — https://taxfoundation.org/data/all/federal/2026-tax-brackets/
- IRS Topic 751 — FICA rates (Social Security 6.2%, Medicare 1.45%) — https://www.irs.gov/taxtopics/tc751
- Tax Foundation 2026 State Income Tax Rates — state rates including no-tax states — https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/
- Existing codebase: `shared/types.ts`, `shared/data/constants.js`, `src/screens/PotentialApp.jsx` — contract shapes, existing algorithms

### Secondary (MEDIUM confidence)

- Zumper National Rent Report (May 2026) — 1BR median rents by city — https://www.zumper.com/rent-research/national-rent-report
- Numbeo Cost of Living Index (2026, current) — raw costIndex values (NYC=100), rescaled to US-avg=100 for this dataset — https://www.numbeo.com/cost-of-living/region_rankings_current.jsp?region=019
- Numbeo 2025 Safety Index — safetyIndex values — https://www.numbeo.com/crime/region_rankings.jsp?title=2025&displayColumn=1&region=021
- Walk Score city rankings — walkScore, transitScore — https://www.walkscore.com/cities-and-neighborhoods/
- CurrentResults.com (NOAA 30-yr normals) — summerHighF (July avg high), winterLowF (Jan avg low) — https://www.currentresults.com/Weather/US/average-city-temperatures-in-july.php
- BLS Metropolitan Employment data 2024-2025 — jobGrowth percentages — https://www.bls.gov/news.release/metro.nr0.htm

### Tertiary (LOW confidence / ASSUMED)

- Some individual city rent figures (Charlotte, Columbus, Phoenix, Indianapolis) — cross-sourced from Zumper search results summaries; verify at execution time.
- `nearMountains`/`nearCoast` boolean assignments — geographic judgment calls; document standard at execution time.
- Minneapolis effective state tax rate (~7.85%) vs top rate (9.85%) — verify against MN DOR for the specific income bands.

---

## Metadata

**Confidence breakdown:**
- Federal tax brackets: HIGH — cited directly from IRS + Tax Foundation, OBBBA context confirmed
- FICA rates: HIGH — stable rates confirmed from IRS Topic 751
- Engine architecture: HIGH — derived from existing codebase and locked decisions
- City dataset: MEDIUM — primary sources cited, spot values verified; some cities from summary data (LOW for those — flag in dataset comments)
- State tax rates: HIGH for zero-tax and flat-rate states; MEDIUM for graduated-bracket approximations

**Research date:** 2026-06-01
**Valid until:** Tax data stable for TY2026 (expires ~Oct 2026 when TY2027 adjustments release). Rent data: 30-day freshness. Safety/walkability: 90-day freshness.
