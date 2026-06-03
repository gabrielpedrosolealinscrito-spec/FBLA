---
phase: 04-international-destinations-country-models
plan: 01
subsystem: engine
tags: [financial-model, fx, vitest, typescript, tdd, intl]

# Dependency graph
requires:
  - phase: 01-scaffold-port
    provides: rankCities() engine, FINANCIAL_MODELS registry, MatchResult shape, BASE_SALARIES
  - phase: 03
    provides: centralized tunable scoring-weights config
provides:
  - Dated FX table (fx.ts) + toUSD helper — single source of truth for engine + display
  - FinancialModel interface owning computeSalary (D-01) so non-remote foreign salaries come from sourced local data, not BASE_SALARIES×costIndex
  - uk-2026 country model (UK income-tax bands + National Insurance) registered via FINANCIAL_MODELS
  - London city record in cities.ts (USD-denominated rent/costs like US cities)
  - USD-canonical conversion inside the engine so mixed US+intl MatchResult fields sort correctly (MATCH-04)
affects: [04-02, 04-03, 04-04, results-ranking, city-detail]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Country financial models implement a shared FinancialModel interface (computeSalary + tax), dispatched via FINANCIAL_MODELS registry keyed by city.financialModel"
    - "Engine converts local-currency salary/take-home to canonical USD via dated fx.ts BEFORE values enter MatchResult; display layer (Plan 03) converts USD back to local for presentation"
    - "D-02 salary branch: hasRemote=true keeps profile.income; non-remote path uses sourced local salary dataset"

key-files:
  created:
    - shared/engine/fx.ts
  modified:
    - shared/engine/financial.ts
    - shared/engine/financial.test.ts
    - shared/engine/index.ts
    - shared/engine/index.test.ts
    - shared/data/cities.ts

key-decisions:
  - "MatchResult numeric fields (estSalary, monthlyTakeHome, monthlySavings) are canonical USD — required because ResultsView sortResults compares them directly across the combined US+intl list (MATCH-04) and computeExpenses reads USD medianRent"
  - "uk-2026 matches US model depth (progressive national brackets + primary social contribution = National Insurance) via the interface + registry — no rewrite of the US spine (D-08)"
  - "FX rates hardcoded + dated in fx.ts (D-04) — no network call, no new package install"

patterns-established:
  - "FinancialModel.computeSalary: salary ownership moved into the model so each country sources its own local salary (D-01)"
  - "Single dated FX source (fx.ts) shared by engine math and future display conversion"

requirements-completed: [MATCH-02, FIN-02]

# Metrics
duration: 9min
completed: 2026-06-02
---

# Phase 04 Plan 01: London End-to-End Seam Summary

**London wired into rankCities() end-to-end: uk-2026 model (UK bands + National Insurance) computes local take-home, FinancialModel now owns salary (D-01), and a dated FX table canonicalizes every intl MatchResult to USD so the mixed US+intl ranked list sorts correctly.**

## Performance

- **Duration:** ~9 min (22:32:22 → 22:41:17 CDT, 2026-06-02)
- **Started:** 2026-06-02T22:32:22-05:00
- **Completed:** 2026-06-02T22:41:17-05:00
- **Tasks:** 3
- **Files modified:** 6 (1 created, 5 modified)

## Accomplishments
- Dated FX table (`fx.ts`) + `toUSD` helper — single source of truth for engine math and display conversion (D-04)
- `FinancialModel` interface now owns `computeSalary` (D-01): non-remote foreign movers get a sourced UK local salary instead of `BASE_SALARIES × costIndex`; remote movers (hasRemote=true) keep `profile.income` (D-02)
- `uk-2026` model with UK progressive income-tax bands + National Insurance, registered in `FINANCIAL_MODELS`, matching US model depth without rewriting the US spine (D-08)
- London city record added to `cities.ts`; London now appears in `rankCities()` output alongside US cities (MATCH-02)
- Engine converts London's local-currency salary/take-home to canonical USD before populating `MatchResult`, so `sortResults` (MATCH-04) ranks the mixed US+intl list correctly

## Task Commits

Each task committed atomically (TDD: test → feat):

1. **Task 1: Dated FX table (fx.ts)** — `f4c34d1` (feat)
2. **Task 2: uk-2026 model + FinancialModel.computeSalary interface** — `339a8a0` (test/RED) → `28a11b3` (feat/GREEN, V1+V2)
3. **Task 3: London integration + USD canonicalization** — `1e97051` (test/RED) → `44d4595` (feat/GREEN, V4)

## Files Created/Modified
- `shared/engine/fx.ts` — created: hardcoded dated `FX_RATES` + `toUSD` helper
- `shared/engine/financial.ts` — `FinancialModel` interface gains `computeSalary`; `uk-2026` model (UK bands + NI) added to `FINANCIAL_MODELS`
- `shared/engine/financial.test.ts` — V1 UK fixture + V2 "no US math for intl" invariant
- `shared/engine/index.ts` — salary dispatch through the model, USD canonicalization of MatchResult numeric fields
- `shared/engine/index.test.ts` — V4 ranking-integrity tests for London in the mixed list
- `shared/data/cities.ts` — London city record (USD-denominated costs)

## Decisions Made
None beyond the locked plan decisions (D-01 salary ownership, D-02 remote branch, D-04 dated FX, D-08 model parity). Followed plan as specified.

## Deviations from Plan

None — plan executed exactly as written. All 3 tasks landed with the planned TDD RED→GREEN sequence.

## Issues Encountered

The executor process hit an account-wide session limit immediately after committing the final GREEN task (`44d4595`), before it could write this SUMMARY.md or advance STATE/ROADMAP. The code work was fully committed and intact. This SUMMARY was reconstructed during safe-resume close-out from the committed plan, commit history, and a green test run (`npx vitest run shared/engine` → 4 files, 38 tests passed) confirming V1/V2/V4 hold.

## User Setup Required

None — no external service configuration required (FX rates hardcoded, vitest already present, no new packages).

## Next Phase Readiness
- The seam is proven: registry dispatch, salary branch, USD canonicalization all green. Wave 2 (04-02 openness multiplier, 04-03 intl detail UI) and Wave 3 (04-04 Lisbon/Berlin/Toronto + full 4-city assertions) can ride it.
- Engine suite: 4 files / 38 tests passing, no Phase 3 regressions.

---
*Phase: 04-international-destinations-country-models*
*Completed: 2026-06-02*
