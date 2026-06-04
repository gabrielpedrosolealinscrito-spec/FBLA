---
phase: 12-multi-dimensional-scoring-extend-the-scoring-engine-and-city
plan: "04"
subsystem: engine-testing
tags: [clamp-gate, d-05, blocker, test, scoring]
dependency_graph:
  requires: ["12-01", "12-02", "12-03"]
  provides: ["D-05 clamp BLOCKER gate asserted on rankCities output"]
  affects: ["shared/engine/index.test.ts"]
tech_stack:
  added: []
  patterns: ["rankCities black-box gate", "dynamic SCORING_WEIGHTS budget check"]
key_files:
  created: []
  modified:
    - shared/engine/index.test.ts
decisions:
  - "Assert displayed matchScore from rankCities() output, NOT computeRawScore() — closes the false-comfort gap (memory: test-assert-user-facing-output)"
  - "Static budget computed dynamically via Object.keys(SCORING_WEIGHTS.global) so it stays honest if caps are retuned"
  - "Record cast (SCORING_WEIGHTS.normalization as Record<string, number>) used to avoid tsc error on as-const object with dynamic key lookup"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-03"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 1
---

# Phase 12 Plan 04: D-05 Clamp BLOCKER Gate Summary

One-liner: D-05 clamp gate asserted on post-clamp `rankCities()` output via a maxProfile exercising all 9 scoring factors at ceiling values, paired with a dynamic static budget proof that the bound is structural.

## Task Completed

### Task 1: Add the clamp BLOCKER gate + static budget assertion to index.test.ts

**Commit:** `8c79289`
**Files:** `shared/engine/index.test.ts`

Added a new `describe` block (`rankCities — D-05 clamp BLOCKER gate (Phase 12)`) containing two tests:

**Test 1 — Clamp BLOCKER gate (D-05 runtime):**
- Defines `maxProfile` by spreading `swEngineerProfile` and overriding:
  - `weights: { cost: 4, career: 4, lifestyle: 4, safety: 4 }` (legacy 4 factors at max)
  - `categoryWeights: { healthcare: 1.8, schools: 1.8, childcare: 1.8, connectivity: 1.8, parks: 1.8 }` (all Phase 12 categories at WEIGHT_MAX_PREF=1.8)
  - `lifestyleTags: ['outdoors','nightlife','arts','walkable','diversity','family','startup']` (full set to hit lifestyleFactorScore ceiling)
- Calls `rankCities(maxProfile)` and asserts:
  - `results.length === CITIES_DATA.length` (D-01 never-filter)
  - Every `r.matchScore < 99` (strict, D-05 — displayd post-clamp score)
  - Every `r.matchScore >= 0`
- This is the authoritative fix for the false-comfort pattern: the gate asserts `results[].matchScore` from `rankCities()`, never `computeRawScore().rawScore`.

**Test 2 — Static budget assertion:**
- Imports `SCORING_WEIGHTS` and `BASE_SCORE` from `scoring-weights.js`
- Dynamically computes `BASE_SCORE + Σ(global[slug] × normalization[slug+'MaxContribution'])` over all 9 slugs
- Asserts the sum is `< 95`
- Actual computed value: 94.28 (50 + 8.4 + 8.4 + 7.0 + 4.48 + 4 + 3 + 3 + 3 + 3)
- Proves the runtime gate passes because the budget is structurally bounded, not because of which cities happen to have data

**Pre-existing tests retained:** The L54-60 `clamps all matchScores to the 0-99 range (integers)` test (using `swEngineerProfile`) remains untouched as a guard.

## Verification Results

```
npm test -- shared/engine/index.test.ts
  Tests: 35 passed (35)   [new: +2 in the new describe block]

npm test (full suite)
  Test Files: 10 passed (10)
  Tests:      146 passed (146)

npx tsc --noEmit
  (no output — clean)
```

## Clamp Gate Empirical Result

Strongest profile (`maxProfile` with all 9 factors at max) across all `CITIES_DATA` cities: **every displayed `matchScore < 99`. Gate PASSES.**

Static budget value: **94.28** (< 95 target). Structural bound confirmed.

## Deviations from Plan

None — plan executed exactly as written.

One TypeScript-specific adjustment made (not a deviation, a compile correctness requirement):
- Used `(SCORING_WEIGHTS.normalization as Record<string, number>)` for dynamic key lookup on the `as const` object — prevents a tsc error that would have fired otherwise. Anticipated in advisor consultation before writing.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes. This plan is test-only (`index.test.ts` additions). No new threat surface.

## Self-Check: PASSED

- FOUND: `shared/engine/index.test.ts`
- FOUND: commit `8c79289`
