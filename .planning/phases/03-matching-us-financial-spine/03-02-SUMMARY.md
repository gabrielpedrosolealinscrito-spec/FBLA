---
phase: "03"
plan: "02"
subsystem: "shared/types + shared/engine + shared/data"
tags: [contract, city-dataset, scoring-weights, typescript, wave-1]
dependency_graph:
  requires: ["03-01 (vitest + RED tests)"]
  provides: ["City contract with 8 new fields", "Profile.weights optional field", "SCORING_WEIGHTS tunable config", "CITIES_DATA 22-city typed dataset"]
  affects: ["shared/engine/financial.ts (Wave 2)", "shared/engine/scoring.ts (Wave 2)", "shared/engine/dealbreakers.ts (Wave 2)", "shared/engine/index.ts (Wave 2)"]
tech_stack:
  added: []
  patterns: ["contract-first typed exports", "as const tunable config", "US-avg=100 costIndex scale"]
key_files:
  created:
    - shared/engine/scoring-weights.ts
    - shared/data/cities.ts
  modified:
    - tsconfig.json
    - shared/types.ts
decisions:
  - "Minneapolis stateTax=7.85 (effective rate for demo salary band $55K-$100K), not 9.85 top marginal (Pitfall 4)"
  - "Profile.weights is optional so Plan 01 RED test fixtures compile without Phase 2 having executed"
  - "allowJs: true + exclude test files in tsconfig — unblocks .ts imports of constants.js and isolates RED test compile errors from tsc gate"
  - "Boise hasIntlAirport=false [ASSUMED] and Columbus stateTax=3.99 [ASSUMED] flagged inline"
  - "Brooklyn/NYC costIndex=143 (corrected from prototype's overcalibrated 187)"
metrics:
  duration: "18min"
  completed: "2026-06-02"
  tasks: 4
  files: 4
---

# Phase 03 Plan 02: Contract-First Foundation Summary

Contract-first foundation: City interface extended with 8 dealbreaker fields, SCORING_WEIGHTS tunable config created, and 22-city typed US dataset with cited figures deployed.

## What Was Built

**Task 1 — tsconfig.json**
Added `allowJs: true` (enables `.ts` files to import `constants.js` without TS7016) and `exclude: ["**/*.test.ts", "node_modules"]` (isolates RED test files from `tsc --noEmit` gate). All existing compiler options preserved.

**Task 2 — shared/types.ts**
Extended `City` interface with 8 new fields after `financialModelId`:
- `stateTax: number` — flat state income tax %, 0 = no state tax
- `summerHighF: number` — NOAA avg daily high in hottest month (°F)
- `winterLowF: number` — NOAA avg daily low in coldest month (°F)
- `nearMountains: boolean` — within ~60 min drive of major mountain range
- `nearCoast: boolean` — within ~60 min drive of ocean/major coastal bay
- `hasIntlAirport: boolean` — has direct international routes
- `pop: string` — display metro population label
- `climate: string` — display climate description

Added optional `Profile.weights?: { cost: number; career: number; lifestyle: number; safety: number }` with a comment noting Phase 2 emits this; engine derives from `importanceRank` if absent.

**Task 3 — shared/engine/scoring-weights.ts**
Created tunable config with:
- `SCORING_WEIGHTS as const` with `global/dealbreaker/lifestyle/normalization` sections
- Recalibrated dealbreaker thresholds: `heatThresholdF=95`, `coldThresholdF=25`, `transitMin=40`, `walkMin=50`, `safetyMin=55`, `jobGrowthMin=2.0`
- `BASE_SCORE=50` exported for D-05 invariant: `BASE_SCORE + sum(contributions) === rawScore`

**Task 4 — shared/data/cities.ts**
22 typed US cities exported as `CITIES_DATA: City[]`:
- All 22 cities have `country: "US"`, `financialModelId: "us"`, and all 8 new Phase 3 fields
- Austin `costIndex: 103` preserved as the Numbeo→US-avg rescaling anchor
- Minneapolis `stateTax: 7.85` (effective rate for demo salary band, inline comment explains)
- Brooklyn/NYC `costIndex: 143` (corrected from prototype's overcalibrated 187)
- Header comment documents the US-avg=100 scale, rescaling formula, and per-field source key
- `color` field dropped (prototype-only, not in City contract)

## Deviations from Plan

None — plan executed exactly as written. All four tasks completed sequentially, each committed individually. No bugs found, no architectural decisions required.

## Assumed / Flagged Values

Two entries carry `// [ASSUMED — verify]` inline comments:
1. **Boise, ID** `hasIntlAirport: false` — BOI has no regular nonstop international routes; verify at judgment time
2. **Columbus, OH** `stateTax: 3.99` — Ohio 2026 graduated brackets; 3.99% is effective rate for $40K–$120K earners post-2025 reforms; verify against OH DOR for 2026

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes at trust boundaries. This plan is static typed data + config, fully offline, author-controlled. No threat flags to add beyond the plan's documented T-3-02 (static city data) and T-3-03 (costIndex scale, mitigated by header comment in cities.ts).

## Known Stubs

None — all 22 cities have real values for all fields. `topIndustries` and `vibe` for the 10 new cities are planner-assigned (per plan discretion), not hardcoded empty arrays. No stub patterns present.

## Handoff Notes for Wave 2

- **`scoring.ts` must re-export `BASE_SCORE`**: `scoring.test.ts` (Plan 01 RED) imports `BASE_SCORE` from `./scoring.js`. `BASE_SCORE` is defined in `scoring-weights.ts`. Wave 2's `scoring.ts` must either re-export it or the test will fail at import. Note this before Task 3 of Wave 2 (scoring.ts implementation).
- **`summerHighF > 95` vs `>= 95`**: San Antonio has `summerHighF: 95`. The threshold check in `dealbreakers.ts` must use `> 95` (strict greater than) to match the research definition — San Antonio sits exactly at the boundary and should NOT trigger the heat dealbreaker.
- **`Profile.weights` fallback**: All four RED test fixtures omit `weights` and use only `importanceRank`. Wave 2 engine must implement the `rankToWeight` fallback (`rank 0 → 4, 1 → 3, 2 → 2, 3 → 1`) when `profile.weights` is absent.

## Self-Check: PASSED

All files verified present:
- shared/types.ts
- tsconfig.json
- shared/engine/scoring-weights.ts
- shared/data/cities.ts
- .planning/phases/03-matching-us-financial-spine/03-02-SUMMARY.md

All task commits verified:
- d5844c8: chore(03-02): tsconfig allowJs + test exclude
- fcdc908: feat(03-02): City/Profile contract extensions
- ff3f833: feat(03-02): scoring-weights.ts created
- acfedc0: feat(03-02): 22-city dataset created
