---
phase: "03"
plan: "04"
subsystem: "shared/engine"
tags: ["scoring", "tdd", "match-03", "two-layer-formula", "contribution-sum-invariant"]
dependency_graph:
  requires: ["03-01", "03-02"]
  provides: ["computeRawScore", "scoreCity", "CityScore", "BASE_SCORE re-export"]
  affects: ["shared/engine/index.ts (Plan 06)", "shared/engine/dealbreakers.ts (Plan 05)"]
tech_stack:
  added: []
  patterns:
    - "D-04 two-layer formula: global[f] × personal[f] × normalizedFactorScore × maxContribution[f]"
    - "Pitfall 1 guard: rawScore derived from stored rounded contributions, not independently accumulated"
    - "T-3-06 clamp: personal weights clamped to [0,4] at engine entry"
key_files:
  created:
    - shared/engine/scoring.ts
  modified: []
decisions:
  - "Export computeRawScore (test-facing name) and scoreCity (plan interface alias) from same implementation"
  - "rawScore = BASE_SCORE + reduce(scoreFactors.contribution) — NOT independent accumulation — to satisfy 0.01 invariant"
  - "Lifestyle normalization ceiling = tagVibeBonus × 2 (16 points) so moderate matches ~0.5, strong multi-tag ~1.0"
  - "Profile.weights fallback: importanceRank index 0→4, 1→3, 2→2, missing/3→1 (matches Phase 2 rankToWeight spec)"
metrics:
  duration: "~10 min"
  completed: "2026-06-02T02:11:34Z"
  tasks: 1
  files: 1
---

# Phase 03 Plan 04: Two-Layer Scoring Engine (MATCH-03) Summary

Two-layer config-driven scoring engine producing honest signed contribution bars: `computeRawScore(profile, city)` emits `rawScore` and `scoreFactors[]` where `BASE_SCORE + sum(contributions) === rawScore` within 0.01. MATCH-03 RED test turned GREEN.

## What Was Built

`shared/engine/scoring.ts` implements the D-04 scoring formula for the four factors (cost, career, lifestyle, safety). Each factor score is normalized to [0,1], then multiplied by `global[f] × personal[f] × maxContribution[f]`. Contributions are rounded and stored; `rawScore` is derived from the stored rounded values (not accumulated separately), guaranteeing the MATCH-03 invariant.

### Key Functions

- `computeRawScore(profile, city)` — primary export (test-facing name from Plan 01 RED test)
- `scoreCity` — alias for plan interface compatibility
- `rankToWeight(profile)` — honors `profile.weights` with [0,4] clamp; falls back to `importanceRank` index derivation (Phase 2 not yet merged)
- Per-factor normalizers: `costFactorScore`, `careerFactorScore`, `safetyFactorScore`, `lifestyleFactorScore` — all clamp output to [0,1]

### Invariant Guarantee (Pitfall 1 Guard)

```typescript
const rawScore = BASE_SCORE + scoreFactors.reduce((s, f) => s + f.contribution, 0);
```
By deriving `rawScore` from the *same stored rounded contributions* rather than a parallel accumulator, the sum invariant holds identically with no floating-point drift.

## Test Results

```
npx vitest run shared/engine/scoring.test.ts
  Test Files  1 passed (1)
      Tests   2 passed (2)

npx tsc --noEmit -p tsconfig.json
  (clean — 0 errors)

grep gate (inline coefficients): 0
```

## Deviations from Plan

### Auto-fixed Issues

None.

### Notes

The plan's `scoreCity` function name is the export alias. The RED test (Plan 01) imports `computeRawScore`, which is the primary export. Both names are exported; neither the test nor `scoring-weights.ts` was modified.

The `tsc --noEmit` gate was pre-confirmed clean. Sibling test files (`dealbreakers.test.ts`, `index.test.ts`) were intentionally RED-only and not touched — they remain RED per plan design.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes. The `T-3-06` clamp (personal weights to [0,4]) is implemented in `rankToWeight`. The `T-3-07` invariant is unit-tested.

## Known Stubs

None. The module is fully wired: it reads from `SCORING_WEIGHTS` (Plan 02), accepts typed `Profile` and `City` interfaces, and returns `CityScore`. No hardcoded empty values or placeholder paths.

## Self-Check

- [x] `shared/engine/scoring.ts` created and exports `computeRawScore`, `scoreCity`, `BASE_SCORE`
- [x] Commit `b8caf1e` exists
- [x] `npx vitest run shared/engine/scoring.test.ts` — 2/2 PASS
- [x] `npx tsc --noEmit` — clean
