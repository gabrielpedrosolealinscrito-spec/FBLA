---
phase: 03-matching-us-financial-spine
verified: 2026-06-02T14:30:00Z
status: human_needed
score: 4/4
overrides_applied: 0
human_verification:
  - test: "Run the app on battery (no network), complete the 5-step quiz for a Software Engineer, and confirm the results screen shows a ranked list of 22 US cities with personalized scores."
    expected: "Non-empty ranked list loads instantly, scores differ by profile, #1 city is not always Austin."
    why_human: "End-to-end offline battery run cannot be verified by grep or test runner — requires opening the app in a browser with network disabled."
  - test: "Click any city card in the results list and expand the 'Why this score' section."
    expected: "Signed contribution bars appear for Cost, Career, Lifestyle, Safety. Bars sum visually to the displayed match score badge. Dealbreaker penalties (if any) appear as red negative bars, not asterisks."
    why_human: "Visual rendering of signed contribution bars and badge reconciliation is not verifiable by tests."
  - test: "Set 'No extreme heat' as a dealbreaker, then pick a profile where Phoenix (summerHighF=107) would otherwise rank highly. Complete quiz."
    expected: "A 'Dealbreaker alert' overlay appears citing Phoenix's specific heat fact. 'No, it's fine' button re-ranks and promotes Phoenix. 'Yes, still a dealbreaker' dismisses the overlay and keeps Phoenix demoted."
    why_human: "D-02 re-confirm user interaction (overlay rendering, keep/lift behavior, and re-rank outcome) requires browser interaction."
  - test: "After landing on results, cycle through all four sort pills: 'Best match', 'Most savings', 'Top salary', 'Lowest cost'."
    expected: "List reorders correctly for each sort key with no blank/crash state."
    why_human: "Sort pill interaction and visual reorder is a UI behavior that grep cannot verify."
  - test: "WR-02 exposure: select only 'Food Scene', 'Gyms & Fitness', 'LGBTQ+ Friendly', or 'Peace & Quiet' lifestyle tags (none others). Run quiz."
    expected: "A well-ranked list still appears. NOTE: these 4 tags currently have zero scoring weight (WR-02 open warning — no engine branch handles them). Confirm the result is a ranked list, not a crash, but be aware Lifestyle contribution for these-only users will be 0."
    why_human: "Whether the 0-contribution case is acceptable product behavior vs. a user-facing bug requires product judgment, not automation."
---

# Phase 3: Matching & US Financial Spine — Verification Report

**Phase Goal:** Users receive a ranked list of US city matches with a full income-adjusted financial breakdown, running entirely offline on battery — the first end-to-end demoable slice.
**Verified:** 2026-06-02T14:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Users receive a ranked list of US cities scored against their profile | VERIFIED | `rankCities()` returns sorted `MatchResult[]` for all 22 CITIES_DATA entries; 32/32 tests green including sort-order, never-empty, and clamping assertions |
| 2 | Results carry a full income-adjusted financial breakdown (salary, take-home, itemized expenses, savings) | VERIFIED | `financial.ts` implements TY2026 progressive brackets + FICA + cost-indexed expenses; `CityDetail.jsx` renders all FIN-01 fields (estSalary, monthlyTakeHome, monthlySavings, expenses itemized); Austin reference: estSalary=113300, monthlyTakeHome=7378 passes exactly |
| 3 | Matching actually personalizes (CR-01 fix) — different profiles produce different #1 cities | VERIFIED | `rankToWeight()` normalizes personal weights to [0,1] via `PERSONAL_WEIGHT_SCALE=4`; theoretical max rawScore=90.4 (clamp always inert); test "produces at least 8 distinct matchScores across 22 cities" and "#1 city differs between cost-first and lifestyle-first profile" both assert real differentiated outcomes with distinct profile fixtures and pass |
| 4 | Flow runs offline — no network calls introduced | VERIFIED | No `fetch(` or `api.anthropic` in any results component or in PotentialApp outside the Phase 5 AI stub; `vite build` exits 0 at 74KB gzip |

**Score:** 4/4 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `shared/engine/financial.ts` | TY2026 brackets, computeUSTax, FINANCIAL_MODELS registry | VERIFIED | Exports `computeFederalTax`, `computeUSTax`, `computeSalary`, `computeUSExpenses`, `FINANCIAL_MODELS`; IRS sources cited in comments |
| `shared/engine/scoring.ts` | Two-layer D-04 scoring with honest contribution collection | VERIFIED | Exports `computeRawScore` / `scoreCity`; PERSONAL_WEIGHT_SCALE normalization present; invariant: BASE_SCORE + sum(contributions) == rawScore |
| `shared/engine/scoring-weights.ts` | All coefficients in one config object + BASE_SCORE | VERIFIED | SCORING_WEIGHTS with global/dealbreaker/lifestyle/normalization; PERSONAL_WEIGHT_SCALE=4; BASE_SCORE=50; thresholds exported |
| `shared/engine/dealbreakers.ts` | 10 dealbreakers mapped to correct city fields; penalty-not-delete; checkReconfirm pure | PARTIAL | 9/10 map correctly to concrete city fields. The job-market dealbreaker has a vocabulary mismatch: the inline `categoryMap` uses keys like `"Tech & Engineering"` but `city.topIndustries` contains short labels like `"Tech"`, `"Finance"` — the `includes()` check never matches. This means `industryMismatch=true` for all 22 cities for any profession, so the "Must have strong job market" dealbreaker triggers near-universally via the `\|\|` branch. Not tested in `dealbreakers.test.ts` (heat/cold/reconfirm covered; job-market absent). Non-blocking: all cities take equal -30, so order is preserved and no crash occurs. See WR-NEW below. |
| `shared/engine/index.ts` | rankCities orchestrator; never-empty; two-pass D-02 flow | VERIFIED | Two-pass flow present; NEVER filters cities out; returns `{ results, reconfirmSignal? }` |
| `shared/data/cities.ts` | 22 typed US cities with all dealbreaker fields | VERIFIED | 22 `name:` entries; all cities have `summerHighF`, `winterLowF`, `nearMountains`, `nearCoast`, `hasIntlAirport`, `stateTax`, `financialModelId: "us"` |
| `shared/types.ts` | City extended with 8 Phase 3 fields; Profile.weights optional | VERIFIED | `summerHighF`, `winterLowF`, `nearMountains`, `nearCoast`, `hasIntlAirport`, `stateTax`, `pop`, `climate` present; `weights?` optional field present |
| `src/screens/results/ResultsView.jsx` | Ranked list + 4 MATCH-04 sort keys | VERIFIED | 138 lines; exports `sortResults` pure helper; 4 sort options using `r.estSalary`, `r.monthlySavings`, `r.city.costIndex` (correct MatchResult field paths) |
| `src/screens/results/CityDetail.jsx` | Contribution bars + financial breakdown on expand | VERIFIED | 228 lines; `ContributionBars` renders `scoreFactors` with var(--pos)/var(--neg); `ExpenseBreakdown` renders all itemized fields; D-06 Section collapsible pattern used |
| `src/screens/results/ReconfirmOverlay.jsx` | D-02 overlay with keep/lift actions | VERIFIED | 105 lines; reads `signal.city.name` + `signal.factLabel`; exposes `onKeep`/`onLift`; amber warning accent present |
| `src/screens/PotentialApp.jsx` (wired) | rankCities called at quiz completion; deprecated logic removed | VERIFIED | `rankCities(profile)` called at line 165; `setResults(ranked)` + `setReconfirmSignal`; no `const getMatchScore`; no `= totalSal * 0.22`; no inline CITIES_DATA array |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `shared/engine/scoring.ts` | `shared/engine/scoring-weights.ts` | `import SCORING_WEIGHTS, BASE_SCORE, PERSONAL_WEIGHT_SCALE` | WIRED | Line 9: `import { SCORING_WEIGHTS, BASE_SCORE, PERSONAL_WEIGHT_SCALE } from './scoring-weights.js'` |
| `shared/engine/dealbreakers.ts` | `shared/engine/scoring-weights.ts` | `import penalty + thresholds` | WIRED | Lines 10-18: imports `SCORING_WEIGHTS`, `heatThresholdF`, `coldThresholdF`, `transitMin`, `walkMin`, `safetyMin`, `jobGrowthMin` |
| `shared/engine/index.ts` | `shared/data/cities.ts` | `import CITIES_DATA` | WIRED | Line 20: `import { CITIES_DATA } from '../data/cities.js'` |
| `shared/engine/index.ts` | `shared/engine/financial.ts` | `FINANCIAL_MODELS[city.financialModelId]` | WIRED | Line 21: `import { FINANCIAL_MODELS, computeSalary }`; Line 64: model selection with `?? FINANCIAL_MODELS['us']` fallback |
| `shared/engine/financial.ts` | `shared/data/constants.js` | `import BASE_SALARIES` | WIRED | Line 16: `import { BASE_SALARIES } from '../data/constants.js'` |
| `shared/data/cities.ts` | `shared/types.ts` | `import type { City }` | WIRED | Line 21: `import type { City } from '../types.js'` |
| `src/screens/PotentialApp.jsx` | `shared/engine/index.ts` | `rankCities(profile)` | WIRED | Lines 3, 165: import + call at quiz completion; onLift re-calls at line 396 |
| `src/screens/results/ResultsView.jsx` | `MatchResult[]` | props | WIRED | Props `{ results, sortBy, setSortBy, onSelectCity }` typed and used; `sortResults` uses `r.estSalary`, `r.monthlySavings`, `r.city.costIndex` |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `ResultsView.jsx` | `results` prop | `rankCities(profile)` via `setResults` in PotentialApp | Yes — engine computes from CITIES_DATA + financial model | FLOWING |
| `CityDetail.jsx` | `result` prop (selectedCity) | `results[i]` selected via `onSelectCity` callback | Yes — full MatchResult with scoreFactors + expenses | FLOWING |
| `CityDetail.jsx` `ContributionBars` | `result.scoreFactors` | `scoreCity()` in engine — literal additive terms | Yes — MATCH-03 invariant: BASE_SCORE + sum(contributions) = rawScore | FLOWING |
| `ReconfirmOverlay.jsx` | `signal` prop | `checkReconfirm(penalizedRanking, rawRanking, profile)` in engine | Yes — pure engine function, null when no demotion | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 32/32 engine + UI tests pass | `npx vitest run --reporter=verbose` | 32 passed, 0 failed | PASS |
| CR-01: at least 8 distinct scores | index.test.ts assertion `distinctScores >= 8` | PASSES | PASS |
| CR-01: #1 differs by profile | index.test.ts: `costFirstProfile` (importanceRank: cost/safety/career/lifestyle + startup tag) vs `lifestyleFirstProfile` (lifestyle/career/cost/safety + beach/diversity/nightlife/walkable tags) — asserts `results[0].city.name` inequality | PASSES — distinct profiles, real inequality assertion | PASS |
| Austin reference: estSalary=113300, monthlyTakeHome=7378 | index.test.ts assertions | Both pass within ±2 tolerance | PASS |
| TypeScript strict clean | `npx tsc --noEmit` | Exit 0, no output | PASS |
| Vite production build | `npx vite build` | Exit 0, 74KB gzip | PASS |
| No avgTemp in dealbreakers | `grep -c avgTemp shared/engine/dealbreakers.ts` | 0 | PASS |
| No .filter() in dealbreakers | `grep -c '.filter(' shared/engine/dealbreakers.ts` | 0 | PASS |
| No deprecated inline getMatchScore | `grep -c 'const getMatchScore' src/screens/PotentialApp.jsx` | 0 | PASS |
| No fetch calls in results components | `grep -c 'fetch(' src/screens/results/*.jsx` | 0 across all 3 files | PASS |
| No fetch calls in PotentialApp (outside stub) | `grep 'fetch\|api.anthropic' src/screens/PotentialApp.jsx` | Only AI stub path at line 73 (`console.info("[Phase 1]...`) | PASS |
| PERSONAL_WEIGHT_SCALE normalization present | scoring.ts line 36 | `Math.min(4, Math.max(0, v)) / PERSONAL_WEIGHT_SCALE` | PASS |
| Theoretical max rawScore <= 99 | `50 + (1.0×12 + 1.0×12 + 1.0×10 + 0.8×8)` | 90.4 — clamp always inert | PASS |

---

## Probe Execution

No probe scripts found under `scripts/*/tests/`. Phase goal verified via Vitest + tsc + vite build above.

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| MATCH-01 | 03-01, 03-05, 03-06 | User receives a ranked list of matched cities scored against their profile | SATISFIED | `rankCities()` returns sorted `MatchResult[]`; never-empty (D-01); two-pass dealbreaker flow (D-02); integration tests green |
| MATCH-03 | 03-04, 03-07 | User can see why a city scored as it did | SATISFIED | `scoreCity()` produces honest signed contributions (literal additive terms, not post-hoc); `CityDetail.jsx` renders contribution bars with var(--pos)/var(--neg); MATCH-03 invariant test green |
| MATCH-04 | 03-07 | User can sort/filter the ranked list (match, savings, salary, cost) | SATISFIED | `sortResults()` pure helper exports 4 keys using correct `r.estSalary`, `r.monthlySavings`, `r.city.costIndex` field paths; `ResultsView.test.jsx` GREEN for all 4 sort keys |
| FIN-01 | 03-03, 03-07 | User sees income-adjusted financial projection: salary, take-home after taxes, itemized expenses, monthly savings | SATISFIED | TY2026 progressive brackets + FICA + state%; `computeUSExpenses` NaN-guarded; Austin reference calc matches D-07 exactly; `CityDetail.jsx` renders 4-tile financial summary + itemized expense breakdown |

No orphaned requirements found: REQUIREMENTS.md traceability table maps MATCH-01, MATCH-03, MATCH-04, FIN-01 all to Phase 3.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `shared/data/cities.ts` | 239 | `// [ASSUMED — verify] BOI has no regular nonstop international routes` | INFO | Data flag, not code — explicitly annotated per plan instructions. Non-blocking. |
| `shared/data/cities.ts` | 505 | `// [ASSUMED — verify OH 2026 rate]` | INFO | Same — data annotation per plan. Non-blocking. |
| `shared/engine/dealbreakers.ts` | 49-60 | Dead async `getProfessionCategory` function (WR-01) | WARNING | Dead code, never called. Inline `categoryMap` duplicate of constants.js PROFESSION_CATEGORIES. Non-blocking for demo; creates drift risk when new professions are added. |
| `shared/engine/dealbreakers.ts` | 194-211 | Job-market dealbreaker vocabulary mismatch: `categoryMap` uses `"Tech & Engineering"` etc., but `city.topIndustries` has `"Tech"`, `"Finance"` — `includes()` never matches (WR-NEW) | WARNING | `industryMismatch` is true for all 22 cities for all recognized professions, causing "Must have strong job market in my field" to trigger everywhere via the `jobGrowthWeak \|\| industryMismatch` branch. Non-blocking: all cities take equal −30, ranking order is preserved, no crash. Compounds WR-05: when a user holds this dealbreaker alongside another, the re-confirm overlay may cite the industry-mismatch factLabel as the demotion reason even though it is spurious. Fix: change `city.topIndustries.includes(professionCategory)` to use the short industry labels (e.g., map `"Tech & Engineering"` → `"Tech"`, `"Business & Finance"` → `"Finance"`) or import a lookup table. Not tested — `dealbreakers.test.ts` has no job-market test case. |
| `shared/engine/scoring.ts` | 89-126 | 4 lifestyle tags with zero scoring weight: `foodie`, `fitness`, `lgbtq`, `quiet` (WR-02) | WARNING | A user selecting only those tags gets lifestyle contribution=0 with no indication. Non-blocking — cost/career/safety still differentiate the ranking; app never crashes. Product quality gap for those tag users. |
| `shared/engine/dealbreakers.ts` | 247-264 | `applyPenalties` penalizes the already-clamped score, not raw (WR-04) | INFO | Largely mooted by CR-01 fix — rawScore now caps at 90.4, so "clamped" and "raw" are identical in normal operation. Penalty math is now effectively correct. No user-visible impact at current score range. |
| `shared/engine/dealbreakers.ts` | 296-303 | `checkReconfirm` always cites first triggered dealbreaker; `onLift` in PotentialApp removes only that one (WR-05) | WARNING | Multi-dealbreaker edge: user clicks "show me X as #1" but X may remain demoted by a second uncleaned dealbreaker. Compounded by WR-NEW: if the job-market dealbreaker is held, the re-confirm copy may cite a spurious industry-mismatch reason. Demo risk if reviewer tests multiple dealbreakers. Non-blocking for typical single-dealbreaker demo path. |
| `src/screens/PotentialApp.jsx` | 16-17 | `fmt`/`fmtFull` duplicated here and in ResultsView.jsx (IN-02) | INFO | Drift risk only. Non-blocking. |

**No TBD/FIXME/XXX debt markers found** in any phase-3-modified file. The `[ASSUMED — verify]` annotations are documented data flags per plan instructions, not code debt markers — they are non-blocking.

---

## Human Verification Required

### 1. Offline-on-battery end-to-end run

**Test:** Open the app in a browser with network disabled (or in airplane mode). Complete the full 5-step quiz for a Software Engineer profile. Confirm results load.
**Expected:** Results screen appears instantly with 22 ranked US cities. No network errors. No blank state.
**Why human:** Battery/offline test requires a real device and browser, not automation.

### 2. Contribution bars visual rendering (MATCH-03)

**Test:** Complete quiz, click any high-ranked city, expand "Why this score" section.
**Expected:** Signed contribution bars appear for Cost, Career, Lifestyle, Safety factors with green (positive) and red (negative) coloring. Dealbreaker penalties (if triggered) show as real red negative bars with the signed number. The sum of contributions + 50 (BASE_SCORE) should visually reconcile with the match score badge.
**Why human:** Visual rendering of contribution bars and badge reconciliation is not verifiable by unit tests.

### 3. D-02 re-confirm overlay interaction (WR-05 exposure check)

**Test:** Add "No extreme heat" as a dealbreaker. Set importanceRank to cost-first (Phoenix's low cost should pull it near #1 raw). Complete quiz.
**Expected:** The re-confirm overlay appears citing Phoenix's summerHighF fact. "No, it's fine" button re-ranks and Phoenix appears at or near #1. "Yes, still a dealbreaker" dismisses and Phoenix remains demoted.
**Why human:** UI overlay interaction and re-rank outcome require browser testing. Also validates WR-05 (single-dealbreaker path works; multi-dealbreaker path is the edge case).

### 4. MATCH-04 sort cycling

**Test:** From results screen, click all four sort pills in sequence: Best match, Most savings, Top salary, Lowest cost.
**Expected:** List reorders correctly for each key with no crash or blank state.
**Why human:** Sort pill interaction and visual list reorder require browser testing.

### 5. WR-02 lifestyle tag coverage (product judgment needed)

**Test:** Select only tags from the unscored set: "Food Scene" (foodie), "Gyms & Fitness" (fitness), "LGBTQ+ Friendly" (lgbtq), "Peace & Quiet" (quiet). Complete quiz.
**Expected:** Results appear (no crash). NOTE: Lifestyle factor contribution will be 0 for all cities with this tag selection because the engine has no scoring branches for these 4 tags. The ranking will be driven by cost/career/safety only.
**Why human:** Whether to accept 0 lifestyle contribution for these users or add scoring branches (WR-02 fix) is a product call, not a code correctness issue.

---

## Gaps Summary

No BLOCKER gaps found. All 4 phase must-haves are VERIFIED in the codebase. Six non-blocking WARNINGs are open (CR-01 was the only BLOCKER, now resolved):

- **WR-01** (dead async `getProfessionCategory` + duplicated categoryMap): Polish item. Non-blocking.
- **WR-02** (4 unscored lifestyle tags): Product gap for users selecting only foodie/fitness/lgbtq/quiet. Non-blocking for demo; routed to human verification for product judgment.
- **WR-03** (`monthlyTakeHome` not floored at 0): Low-income edge case. Non-blocking for demo salary range.
- **WR-04** (penalties on clamped score): Effectively mooted by CR-01 — rawScores now stay below 99, making clamped=raw. Non-blocking.
- **WR-05** (re-confirm lifts only first dealbreaker): Demo risk on multi-dealbreaker profiles. Single-dealbreaker path (most users) is correct. Routed to human verification.
- **WR-NEW** (job-market dealbreaker vocabulary mismatch): `city.topIndustries` short labels never match `categoryMap` full keys. Dealbreaker triggers for all 22 cities when held. Non-blocking — all cities take equal penalty, ranking preserved. Fix requires aligning the two vocabularies.

Phase goal is achieved for the stated demo scope. `human_needed` status reflects items requiring browser/interactive verification before declaring the demoable slice production-ready.

---

_Verified: 2026-06-02T14:30:00Z_
_Verifier: Claude (gsd-verifier)_
