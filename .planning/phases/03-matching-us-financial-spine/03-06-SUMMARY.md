---
phase: 03
plan: 06
subsystem: engine-orchestrator
tags: [engine, orchestrator, match-01, tdd, two-pass, d-01, d-02]
dependency_graph:
  requires: ["03-03", "03-04", "03-05"]
  provides: ["rankCities engine→UI boundary", "MATCH-01 integration point", "RankingOutput type"]
  affects: ["frontend Plan 07 (city-results UI)", "Phase 4 country model pluggability"]
tech_stack:
  added: []
  patterns: ["two-pass ranking (raw → penalized)", "pluggable FinancialModel registry", "clamp-round-clamp matchScore pipeline"]
key_files:
  created:
    - shared/engine/index.ts
  modified: []
decisions:
  - "rankCities never filters cities (D-01): results.length === CITIES_DATA.length always; penalties only"
  - "Two-pass D-02 flow: build rawRanking first, then penalize, then compare tops for reconfirmSignal"
  - "Financial model selected by city.financialModelId with FINANCIAL_MODELS.us fallback — Phase 4 extension point"
  - "Weight sanitization at entry (clamp [0,4]) rather than inside scoreCity — single validation choke point (T-3-11)"
  - "Re-clamp matchScore after penalties to guarantee 0–99 even on extreme penalty stacks"
  - "reconfirmSignal omitted from output object (not set to null) when no demotion — cleaner UI consumption"
metrics:
  duration: 8min
  completed: "2026-06-01"
  tasks: 1
  files: 1
---

# Phase 03 Plan 06: Engine Orchestrator (rankCities) Summary

## One-Liner

Two-pass city ranking orchestrator using TY2026 financial model registry, penalty-only D-01 dealbreakers, and fact-citing D-02 re-confirm signal.

## What Was Built

`shared/engine/index.ts` exports `rankCities(profile): RankingOutput` — the crisp engine→UI boundary that ties all Phase 3 modules together.

### Flow

1. Sanitize `Profile.weights` at entry (clamp to [0, 4], T-3-11).
2. Map `CITIES_DATA` → raw `MatchResult[]`: select financial model by `city.financialModelId` (fallback `FINANCIAL_MODELS.us`), compute `gross`, tax, `monthlyTakeHome`, `expenses`, `monthlySavings`, and `matchScore = clamp(round(rawScore), 0, 99)`.
3. Sort raw results descending → `rawRanking` (D-02 comparison baseline).
4. Apply `applyPenalties` to every result, re-clamp `matchScore` 0–99 → `penalizedResults`.
5. Sort penalized descending → `penalizedRanking` (UI result).
6. `checkReconfirm(penalizedRanking, rawRanking, profile)` → optional `reconfirmSignal`.
7. Return `{ results: penalizedRanking, reconfirmSignal? }`.

### Austin Reference (D-07) — Verified

- `estSalary`: `110000 × (103/100)` = 113300 ✓
- `monthlyTakeHome`: `(113300 − federalTax(113300) − fica(113300)) / 12` = 7378 ✓

## TDD Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED | (pre-existing — index.test.ts from Plan 01) | `index.ts` was missing, suite errored |
| GREEN | `498bf4f` | All 19 engine tests pass (4 files) |
| REFACTOR | None needed | Implementation was clean on first pass |

## Test Results

```
Test Files  4 passed (4)     ← financial + scoring + dealbreakers + index
     Tests  19 passed (19)
npx tsc --noEmit              ← exits 0
```

## Deviations from Plan

None — plan executed exactly as written.

## Threat Mitigations Applied

| Threat | Mitigation |
|--------|------------|
| T-3-11 (malformed weights) | `sanitizeProfile()` clamps weights [0,4] at `rankCities` entry |
| T-3-12 (empty result D-01) | No `.filter()` anywhere; `results.length === CITIES_DATA.length` always |
| T-3-13 (NaN matchScore) | `clamp(round(...), 0, 99)` applied twice: after raw scoring and after penalties |

## Commits

| Hash | Message |
|------|---------|
| `498bf4f` | `feat(03-06): implement rankCities orchestrator — full engine suite GREEN (MATCH-01)` |

## Self-Check: PASSED

- `shared/engine/index.ts` exists and exports `rankCities` ✓
- `npx vitest run shared/engine` → 19/19 GREEN ✓
- `npx tsc --noEmit` → exits 0 ✓
- Commit `498bf4f` verified in git log ✓
