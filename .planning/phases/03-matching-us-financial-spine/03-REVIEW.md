---
phase: 03-matching-us-financial-spine
reviewed: 2026-06-01T21:45:00Z
depth: standard
files_reviewed: 21
files_reviewed_list:
  - shared/types.ts
  - shared/data/cities.ts
  - shared/engine/scoring-weights.ts
  - shared/engine/financial.ts
  - shared/engine/financial.test.ts
  - shared/engine/scoring.ts
  - shared/engine/scoring.test.ts
  - shared/engine/dealbreakers.ts
  - shared/engine/dealbreakers.test.ts
  - shared/engine/index.ts
  - shared/engine/index.test.ts
  - src/screens/PotentialApp.jsx
  - src/screens/results/ResultsView.jsx
  - src/screens/results/ResultsView.test.jsx
  - src/screens/results/CityDetail.jsx
  - src/screens/results/ReconfirmOverlay.jsx
  - src/test-setup.js
  - vite.config.js
  - tsconfig.json
  - package.json
  - shared/data/constants.js
findings:
  critical: 1
  warning: 6
  info: 4
  total: 11
status: cr01_resolved
---

# Phase 3: Code Review Report

**Reviewed:** 2026-06-01T21:45:00Z
**Depth:** standard
**Files Reviewed:** 21
**Status:** issues_found

## Summary

The phase builds a pure-TypeScript US matching engine (federal/state/FICA tax math, config-driven scoring, dealbreaker penalties, ranking orchestrator) plus a React results UI. The financial math is correct and well-sourced (Austin reference calc reproduces exactly: estSalary 113,300, federal 16,096, FICA 8,667, take-home 7,378/mo). The NaN guards, never-empty contract, and sort helpers are sound. All 26 unit tests pass.

However, there is a **degenerate-ranking BLOCKER** that the unit tests cannot catch and that breaks the product's headline feature. The scoring `maxContribution` caps (20/20/20/12) are sized as if the personal weight is ~1, but `rankToWeight` emits weights of 1–4. Every cap is therefore multiplied by up to 4×, so `rawScore` routinely reaches 150–328 against a [0,99] band. After `clamp(..., 0, 99)`, **20 of 22 cities tie at 99** for the standard profile, and the "#1 personalized match" collapses to `CITIES_DATA` array order (Austin, index 0) regardless of what the user actually prioritized. This was confirmed by running the real engine across multiple profiles, not just the formula. The passing `scoring.test.ts` invariant validates the *pre-clamp* sum — the exact quantity the UI does not display — so it provides false comfort.

Secondary issues: a dead async function with a duplicated profession-category map that can silently drift from the source of truth, several lifestyle tags that the scoring engine silently ignores, and minor UI/quality items.

## Critical Issues

### CR-01: Scoring weights overflow the score band — ranking saturates, "#1 match" is determined by array order, not fit [RESOLVED — commit b619721]

**File:** `shared/engine/scoring.ts:130-155`, `shared/engine/scoring-weights.ts:45-50`, `shared/engine/index.ts:82`

**Issue:**
The two-layer formula is `contribution = global[f] × personal[f] × factorScore × maxContribution[f]`.
- `personal[f]` comes from `rankToWeight`, which returns **1–4** (rank 0→4, 1→3, 2→2, 3→1; or clamped `Profile.weights` in [0,4]).
- `maxContribution[f]` is 20/20/20/12 — sized as if `personal[f] ≈ 1`.

So a single factor contributes up to `1.0 × 4 × 1 × 20 = 80` points. With `BASE_SCORE = 50` already consuming half the band, `rawScore` reaches ~328 in the worst case and 150+ in the common case. `index.ts:82` then does `matchScore = clamp(Math.round(rawScore), 0, 99)`.

Empirical engine run (standard Software Engineer profile, default `importanceRank`):
```
99 Austin, TX        99 Salt Lake City   99 Atlanta
99 Nashville         99 San Diego        99 Charlotte
99 Miami             99 Seattle          99 Tampa
99 Denver            99 Minneapolis      99 Columbus
99 Pittsburgh        99 Phoenix          99 Indianapolis
99 Raleigh           ...                 99 San Antonio
99 Portland                              99 Dallas
99 Boise             96 Chicago          67 Brooklyn/NYC
--- 20 of 22 cities tie at 99; #1 = Austin (CITIES_DATA index 0)
```
A teacher/family/safety-first profile and a career-first profile **also** return Austin as #1 with 17–18 cities tied at 99. The result is identical regardless of user priorities. Only an explicit `weights:{cost:1,career:1,lifestyle:1,safety:1}` produces a real spread (#1 Salt Lake City, 0 ties) — but the current quiz never emits `Profile.weights`, so the live path always uses the 1–4 `rankToWeight` fallback. The "personalized matching" feature is non-functional on the path users actually hit.

Knock-on effects:
- `CityDetail` "Why this score" bars sum (with BASE_SCORE) to 150+ while the badge shows 99% — the disclosure feature is internally inconsistent (this is the very "Pitfall 1" the code claims to defend against; the guard only holds pre-clamp).
- Dealbreaker penalties are applied to the *clamped* 99 (`applyPenalties` reads `result.matchScore`), so a city with rawScore 151 → 99 → 99−30 = 69. The penalty fights 50+ points of invisible headroom, weakening D-01/D-02 demotion behavior.
- `scoring.test.ts` passes because it asserts on the pre-clamp `rawScore`, never on the user-facing `matchScore`.

**Fix applied (commit b619721):** `rankToWeight` now divides raw [1,4] weights by `PERSONAL_WEIGHT_SCALE=4` (exported from `scoring-weights.ts`), normalizing personal weights to [0.25,1.0]. Normalization caps reduced to (12,12,10,8): `sum(global × cap) = 40.4 → theoretical max rawScore = 90.4`. Clamp is always inert in normal operation. `lifestyleTags ?? []` crash guard added. Six new regression tests added: rawScore in-band, scoreFactors sum honesty, crash guard, ≥8 distinct scores, #1 varies by importanceRank. 32/32 tests green.

## Warnings

### WR-01: `getProfessionCategory` is dead code; profession-category map is duplicated and can silently drift

**File:** `shared/engine/dealbreakers.ts:49-60` (dead fn) and `194-202` (duplicated map)

**Issue:** The async `getProfessionCategory` helper is never called (grep confirms: only its own definition + a comment reference it). Its doc comment claims "`getProfessionCategory` is only called by `applyPenalties` internally" — this is false; `applyPenalties` calls the synchronous `getTriggeredDealbreakers`, which carries a **second, inline hardcoded copy** of the category→profession map (lines 194-202). Two copies of the same data, neither of which is the source of truth (`PROFESSION_CATEGORIES` in `constants.js`). When a profession is added to `constants.js`, the "strong job market in my field" dealbreaker silently goes stale.

**Fix:** Delete the dead `getProfessionCategory` function. Import `PROFESSION_CATEGORIES` from `constants.js` at the top of the module and use it directly for the synchronous lookup, removing the inline `categoryMap` literal. One source of truth.

### WR-02: Four lifestyle tags are silently ignored by the scoring engine

**File:** `shared/engine/scoring.ts:79-115` vs `shared/data/constants.js:28-43`

**Issue:** `LIFESTYLE_TAGS` defines `foodie`, `fitness`, `lgbtq`, and `quiet`, but `lifestyleFactorScore` has no branch for any of them. A user who selects only those tags (allowed — the quiz requires only ≥1 tag) gets a lifestyle contribution of 0 with no indication. The feature presents choices that have no effect on results.

**Fix:** Add scoring branches for the missing tags (e.g. `foodie` → vibe match on a "Foodie"/"Food" vibe, `quiet` → inverse of population/nightlife), or remove the unscored tags from `LIFESTYLE_TAGS`. At minimum document the intentional no-op.

### WR-03: `monthlyTakeHome` can be negative and is not floored; downstream display assumes positive

**File:** `shared/engine/index.ts:74-78`

**Issue:** `monthlyTakeHome = Math.round((gross - tax) / 12)`. For a low-income profile in a high-tax city the combined federal+state+FICA can approach or exceed gross at the margins (no cap on `stateRate`, e.g. San Diego 13.30%); `gross` may also be 0 if `hasRemote` is true and `income` is 0. The value flows into `monthlySavings = monthlyTakeHome - expenses.total` and is rendered with `fmtFull` (which calls `.toLocaleString()`). A negative or zero take-home is not validated.

**Fix:** Clamp or validate: `const monthlyTakeHome = Math.max(0, Math.round((gross - tax) / 12));` and document that monthlySavings is intentionally allowed to be negative (it already is, per the type comment), while take-home should never be negative.

### WR-04: `applyPenalties` penalizes the already-clamped score, not the raw score

**File:** `shared/engine/dealbreakers.ts:247-264`, `shared/engine/index.ts:122-130`

**Issue:** `applyPenalties` computes `newScore = clamp(result.matchScore - totalPenalty, 0, 99)` where `result.matchScore` was already clamped to 99 in `buildRawResult`. Because of CR-01 the true raw score is often 150+, so subtracting a 30-point penalty from the clamped 99 understates the demotion the design intended, and `index.ts:128` then clamps a second time (redundant double `Math.round`/`clamp`). Even after CR-01 is fixed, penalizing the clamped value rather than the pre-clamp `rawScore` is the wrong order of operations for D-02 demotion fidelity.

**Fix:** Carry the pre-clamp `rawScore` through `MatchResult` (or apply penalties before the final clamp in the orchestrator), subtract the penalty from the raw score, then clamp once at the end. Remove the redundant re-clamp in `index.ts:128` once penalties are applied pre-clamp.

### WR-05: `checkReconfirm` always reports the first triggered dealbreaker, which may not be the one that caused demotion

**File:** `shared/engine/dealbreakers.ts:296-303`

**Issue:** When the raw #1 is demoted, the signal reports `triggered[0].label` / `triggered[0].factLabel`. If the user holds multiple dealbreakers that all trigger on the raw-#1 city, the overlay cites an arbitrary one (array order of `profile.dealBreakers`), not necessarily the most significant or the actual cause. The `ReconfirmOverlay.onLift` handler in `PotentialApp.jsx:394` then removes only `reconfirmSignal.dealbreaker`, so re-ranking may still leave the city demoted by the other triggers — the user clicks "show me X as #1" and X does not become #1.

**Fix:** Either lift all triggered dealbreakers for that city on "No, it's fine," or surface the full triggered set in the signal and let the UI remove all of them. At minimum, after the lift re-rank, verify the city actually reached #1 and message accordingly.

### WR-06: Unbounded `stateRate` in `computeUSTax` — no validation against malformed city data

**File:** `shared/engine/financial.ts:74-81`

**Issue:** `state = grossIncome * (stateRate / 100)` accepts any `stateRate`. The engine sanitizes `Profile.weights` (T-3-11) and guards `costIndex<=0` (T-3-04) but applies no bounds to `stateTax`. A bad data row (e.g. `stateTax: 130`) would silently zero or negate take-home with no guard. Cities are currently curated, but the financial model is a public, pluggable interface (`FinancialModel`) intended for Phase 4 country extension, where unvalidated rates are more likely.

**Fix:** Clamp/validate: `const safeRate = Math.min(100, Math.max(0, stateRate));` in `computeUSTax`, mirroring the defensive posture elsewhere in the engine.

## Info

### IN-01: `PotentialApp.jsx` imports the engine with a `.ts` extension while every other import uses `.js`

**File:** `src/screens/PotentialApp.jsx:3`

**Issue:** `import { rankCities } from '../../shared/engine/index.ts';`. Inconsistent with line 2 (`constants.js`) and all engine-internal imports (`./scoring.js`, etc.). `vite build` was run and succeeds (Vite resolves the `.ts`), so this is cosmetic/consistency only, but it is a footgun if the build toolchain changes.

**Fix:** Import from `'../../shared/engine/index.js'` (or extensionless) to match the rest of the codebase.

### IN-02: `fmtFull`/`fmt` will render `$NaN`/`$undefined` if passed a non-number

**File:** `src/screens/results/ResultsView.jsx:30-31`, `src/screens/PotentialApp.jsx:16-17`

**Issue:** `fmtFull = (n) => $${n.toLocaleString()}` throws/produces `$undefined` if `n` is undefined. Engine output is well-typed today so this is latent, but the formatter is also duplicated across two files (PotentialApp + ResultsView) — drift risk.

**Fix:** Guard: `const fmtFull = (n) => $${Number(n || 0).toLocaleString()};` and import the single copy from `ResultsView.jsx` into `PotentialApp.jsx` rather than redefining.

### IN-03: `toggleArr` default `max = 99` is a magic number; lifestyle/dealbreaker selection is effectively unbounded

**File:** `src/screens/PotentialApp.jsx:63-70`

**Issue:** `max = 99` is an arbitrary cap with no named constant. Lifestyle tags and dealbreakers are added via `toggleArr` with the default, so there is no real product limit. Harmless but undocumented.

**Fix:** Name the constant or pass an explicit, intentional max per call site.

### IN-04: `setTimeout`-driven animation flags lack cleanup; can fire after unmount

**File:** `src/screens/PotentialApp.jsx:55-60, 421, 501`

**Issue:** `goStep`/`goProfile` and the mount effect use bare `setTimeout(() => setAnim(true), …)` with no `clearTimeout` on unmount/re-navigation. React 19 warns less aggressively, but rapid navigation can set state on a stale render. Low impact (state-only, no subscription leak).

**Fix:** Store timer IDs and clear them in the `useEffect` cleanup / before scheduling the next one.

---

_Reviewed: 2026-06-01T21:45:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
