---
phase: 12-multi-dimensional-scoring-extend-the-scoring-engine-and-city
plan: "03"
subsystem: scoring-engine
tags: [scoring, multi-dimensional, weight-gating, proxy, D-07, D-02, D-08, tdd]
dependency_graph:
  requires: ["12-01", "12-02"]
  provides: ["categoryPersonalWeight", "5-factorScores", "9-factor-computeRawScore", "categoryWeights-clamp", "wave-0-tests"]
  affects: ["shared/engine/scoring.ts", "shared/engine/index.ts", "shared/engine/scoring.test.ts"]
tech_stack:
  patterns: ["two-tier-weight-normalization", "null-sentinel-genuine-exclusion", "proxy-fallback", "honest-contribution-invariant"]
key_files:
  modified:
    - shared/engine/scoring.ts
    - shared/engine/index.ts
    - shared/engine/scoring.test.ts
decisions:
  - "NaN guard added inside categoryPersonalWeight (defence-in-depth over sanitizeProfile entry point) — Rule 2 auto-add"
  - "parksFactorScore takes single arg (city only, not city+profile) — profile param not needed since weight-gating is at contribution level, not inside the factorScore"
  - "D-07 exclusion: null sentinel → push {contribution:0, dataLevel:'none'} marker; invariant (L166 reduce) remains intact"
metrics:
  duration: "~30min"
  completed: "2026-06-03"
  tasks_completed: 3
  files_changed: 3
  tests_added: 21
  tests_total: 144
---

# Phase 12 Plan 03: Scoring Engine Multi-Dimensional Extension Summary

**One-liner:** 5 new factorScore functions + two-tier categoryPersonalWeight + 9-factor computeRawScore with genuine null-sentinel exclusion (D-07), practical-tier healthcare floor (D-02), state-average labels (D-08), D-04 seam TODO, and categoryWeights NaN/Infinity clamp at engine entry.

## What Was Built

### Task 1 — CityScore.dataLevel? + categoryPersonalWeight + 5 factorScore functions (`scoring.ts`)

- Extended `CityScore.scoreFactors` with `dataLevel?: 'city' | 'state' | 'proxy' | 'none' | 'display-only'` (5-member union matching `MatchResult` in `types.ts` exactly)
- Imported `WEIGHT_MAX_PREF`, `WEIGHT_MAX_PRAC`, `NEUTRAL_DEFAULT` from `scoring-weights.ts` (no inline literals)
- Added `categoryPersonalWeight(profile, slug, isPractical)`: two-tier normalizer — practical tier retains floor (`raw / WEIGHT_MAX_PRAC`); preference tier baseline-subtracts neutral (`(raw - NEUTRAL_DEFAULT) / 1.3`) so absent/skipped categories map to exactly 0
- NaN guard inside `categoryPersonalWeight`: non-finite values fall back to `NEUTRAL_DEFAULT` before any math
- Added 5 factor functions:
  - `healthcareFactorScore(city)`: `(index - 60) / 15`; returns `null` when field absent
  - `schoolsFactorScore(city)`: `(pct - 22) / 16`; returns `null` when field absent
  - `childcareFactorScore(city)`: `(24000 - cost) / 14000` (lower-is-better); returns `null` when absent
  - `connectivityFactorScore(city)`: `(log(enplanements) - 14.5) / 3.5` (log-scale); returns `null` when absent
  - `parksFactorScore(city)`: `(parkScore - 40) / 50` when present; else proxy `0.4 + 0.25*nearMountains + 0.2*nearCoast + 0.15*outdoorsy`; NEVER returns null (D-07 phantom-zero prohibition)
- All factorScores wrapped in `Math.max(0, Math.min(1, ...))` clamp shell

Commit: `6ce6f5b`

### Task 2 — 5 contribution blocks + sanitize categoryWeights (`scoring.ts` + `index.ts`)

- 5 new contribution blocks in `computeRawScore` (after safety block, before rawScore reduce line L166)
- Null-sentinel exclusion pattern: `if (factorScore !== null) push scored entry; else push {contribution: 0, dataLevel: 'none'}` — never a nonzero midpoint
- Label assignments: Healthcare→`dataLevel:'city'`; Schools/Childcare→`dataLevel:'state'`; Connectivity→`dataLevel:'city'`; Parks→`city` or `proxy` per `parkScore` presence
- D-04 seam TODO comment at injection point for Phase 5 live-AI tier
- `sanitizeProfile` in `index.ts`: clamps `categoryWeights` entries to `[0, WEIGHT_MAX_PREF]`; `Number.isFinite` guard maps NaN/Infinity to `NEUTRAL_DEFAULT` (plain `clamp` does not neutralize NaN)
- Honest-contribution invariant (L166 `rawScore = BASE_SCORE + scoreFactors.reduce(...)`) unchanged

Commit: `bdc22af`

### Task 3 — Wave-0 unit tests (`scoring.test.ts`)

21 new tests across 6 describe blocks covering all plan invariants:

- **Honest-contribution invariant:** BASE + Σ(contributions) = rawScore < 0.01; 9 entries for fully-cited city; rawScore ≤ 99 with max weights
- **D-02 weight-gating:** schools=0 for absent/empty categoryWeights; childcare=0 for no-kids; schools > 0 for family user at 1.8; healthcare > 0 at practical floor (even no weights)
- **D-07 proxy:** parks > 0 with nearMountains, with no proxy signals (baseline 0.4), with parkScore
- **D-07 genuine exclusion:** Berlin (no new-category fields) → healthcare/schools/childcare/connectivity all `contribution===0, dataLevel==='none'` even with max weights; rawScore = BASE + only applicable factors; parks still > 0 via proxy
- **D-08 state label:** schools and childcare entries carry `dataLevel==='state'` and factor string includes `'(state avg)'`
- **D-03/D-09 display-only guard:** regex asserts no factor name matches `foreign|median age|married|fema|disaster`
- **Crash guards:** no throw on absent categoryWeights, absent city fields, NaN weights

Commit: `c315f0a`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] NaN guard inside `categoryPersonalWeight`**
- **Found during:** Task 2 analysis (advisor review)
- **Issue:** `Math.max(0, NaN) === NaN` — the plain clamp inside `categoryPersonalWeight` propagates NaN into contributions if a profile with NaN weights bypasses `sanitizeProfile` (e.g., calling `computeRawScore` directly in tests)
- **Fix:** Added `Number.isFinite(rawLookup) ? rawLookup : NEUTRAL_DEFAULT` guard at the top of `categoryPersonalWeight`, before any arithmetic. `sanitizeProfile` in `index.ts` is the primary entry point, but defence-in-depth ensures no NaN propagation in any call path.
- **Files modified:** `shared/engine/scoring.ts`
- **Commit:** `c315f0a` (included in Task 3 commit alongside tests)

**2. [Rule 1 - Stale Pattern] RESEARCH.md `return 0.5` midpoints rejected**
- **Found during:** Pre-task advisor review
- **Issue:** RESEARCH.md §Pattern 1 shows `return 0.5` for undefined fields — contradicts the plan's `<behavior>` block and the `<critical_d07_correction>` which mandates `return null` (genuine exclusion)
- **Fix:** Implemented `return null` sentinel for healthcare/schools/childcare/connectivity when field is undefined, matching the plan's stated behavior exactly
- **Files modified:** `shared/engine/scoring.ts`

**3. [Rule 1 - Type Union Gap] PATTERNS.md `dataLevel` missing `'none'` member**
- **Found during:** Pre-task advisor review
- **Issue:** PATTERNS.md (L257) shows a 4-member union without `'none'`; the actual `MatchResult` in `types.ts` has a 5-member union including `'none'`
- **Fix:** Extended `CityScore` interface with the full 5-member union matching `MatchResult` exactly, including `'none'`
- **Files modified:** `shared/engine/scoring.ts`

## Verification Results

### Test suite

```
Test Files  10 passed (10)
     Tests  144 passed (144)  (was 123; +21 new)
  Duration  ~900ms
```

### tsc --noEmit

Clean (no output) — all three commits.

### Acceptance criteria

- `grep -c 'FactorScore' shared/engine/scoring.ts` = 24 (increased by 10 fn references; was 8)
- `categoryPersonalWeight` defined; imports `WEIGHT_MAX_PREF` (no inline `1.8`)
- Schools contribution === 0 for noKidsProfile (D-02 two-tier baseline): PASS
- Healthcare contribution > 0 for noKidsProfile (practical floor): PASS
- `grep -c 'D-04' shared/engine/scoring.ts` = 4 (seam TODO present)
- sanitizeProfile clamps `{schools: 999}` → ≤ 1.8; `{schools: NaN}` → no NaN in contribution
- rawScore reduce line (L166) unchanged

## Known Stubs

None — all 5 categories are fully wired to their factorScore functions and cityWeights.

Note: `testCityNoNewData` uses a Berlin fixture with `financialModelId: 'de-2026'`. `computeRawScore` does not call the financial model (that's `buildRawResult` in `index.ts`), so this works correctly for scoring tests.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes beyond what the plan's threat register covers (T-12-05 through T-12-08, all mitigated).

## Self-Check: PASSED

- `shared/engine/scoring.ts` — exists and modified
- `shared/engine/index.ts` — exists and modified
- `shared/engine/scoring.test.ts` — exists and modified
- Commits 6ce6f5b, bdc22af, c315f0a — all present in git log
