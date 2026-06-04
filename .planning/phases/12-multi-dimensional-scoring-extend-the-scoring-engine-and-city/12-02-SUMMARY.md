---
phase: 12-multi-dimensional-scoring-extend-the-scoring-engine-and-city
plan: "02"
subsystem: scoring-engine
tags: [scoring, caps, budget, types, phase-12]
dependency_graph:
  requires: [12-01]
  provides: [scoring-weights-recalibrated, dataLevel-type-contract]
  affects: [shared/engine/scoring.ts, shared/engine/scoring-weights.ts, shared/types.ts]
tech_stack:
  added: []
  patterns: [proportional-renorm, two-tier-weight-constants, optional-union-extension]
key_files:
  created: []
  modified:
    - shared/engine/scoring-weights.ts
    - shared/types.ts
decisions:
  - "Option A proportional renorm: existing 4 caps × 0.7 creates 28-pt budget; 5 new caps share the remaining 16 pts"
  - "Static budget: BASE(50) + 44.28 = 94.28 < 95 (D-05 clamp BLOCKER resolved by math)"
  - "WEIGHT_MAX_PREF/PRAC/NEUTRAL_DEFAULT exported from scoring-weights.ts with values matching personality.ts exactly (1.8/1.5/0.5)"
  - "dataLevel union includes 'none' (Plan task 2 requirement) and 'display-only' (D-04 seam)"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-04T04:40:18Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase 12 Plan 02: Scoring Budget Recalibration + dataLevel Type Contract Summary

Recalibrated `SCORING_WEIGHTS` from a 40.4-pt to a 44.28-pt global-weighted cap sum (max raw 94.28), resolving the D-05 clamp BLOCKER by math before Plan 03 wires the contribution formulas.

## What Was Done

**Task 1 — Recalibrate caps (scoring-weights.ts):** Applied Research §Pattern 3 Option A (proportional renorm):
- Existing 4 caps scaled × 0.7: cost/career 12→8.4, lifestyle 10→7.0, safety 8→5.6
- Added 5 new global slugs (all 1.0): `healthcare`, `schools`, `childcare`, `connectivity`, `parks`
- Added 5 new normalization caps: `healthcareMaxContribution: 4`; `schools/childcare/connectivity/parksMaxContribution: 3` each
- Exported `WEIGHT_MAX_PREF = 1.8`, `WEIGHT_MAX_PRAC = 1.5`, `NEUTRAL_DEFAULT = 0.5` — exact parity with `personality.ts` on `reconcile/v1`
- Updated docstring to reflect 94.28 budget and two-tier weight constants

**Task 2 — dataLevel? field (types.ts):** Extended `MatchResult.scoreFactors` element type from `{ factor; contribution }` to include optional `dataLevel?: 'city' | 'state' | 'proxy' | 'none' | 'display-only'`. Optional field — zero fixture ripple under strict:true.

## Acceptance Criteria Results

| Criterion | Result |
|-----------|--------|
| `grep -c 'MaxContribution'` returns 9 | 9 (verified) |
| WEIGHT_MAX_PREF exported = 1.8 | PASS |
| WEIGHT_MAX_PRAC exported = 1.5 | PASS |
| NEUTRAL_DEFAULT exported = 0.5 | PASS |
| Parity with personality.ts | PASS (confirmed by direct read) |
| Static budget 50 + 44.28 = 94.28 < 95 | PASS (node -e verified) |
| `as const` retained | PASS |
| `grep -c "dataLevel" shared/types.ts` >= 1 | 1 (verified) |
| Union contains all 5 literals | PASS |
| `npx tsc --noEmit` clean | PASS (no output) |
| `npm test` 123/123 green | PASS |

## Commits

| Task | Commit | Files |
|------|--------|-------|
| Task 1: Recalibrate caps + weight constants | `97d42b5` | `shared/engine/scoring-weights.ts` |
| Task 2: dataLevel? on MatchResult.scoreFactors | `480b1c1` | `shared/types.ts` |

## Deviations from Plan

None — plan executed exactly as written.

- The `WEIGHT_MAX_PREF/PRAC/NEUTRAL_DEFAULT` values in `personality.ts` were re-confirmed (1.8/1.5/0.5) before implementation, matching the plan's prerequisite exactly.
- The `dataLevel` union uses 5 values including `'none'` as specified in Task 2 (the RESEARCH Pattern 4 predated the `'none'` addition; plan is authoritative).

## Known Stubs

None. This plan is pure config/type declaration — no data wiring or UI rendering paths involved.

## Threat Flags

None. Changes are config constants and a type extension; no new network endpoints, auth paths, or schema changes at trust boundaries introduced.

## Self-Check

- [x] `shared/engine/scoring-weights.ts` modified — file exists
- [x] `shared/types.ts` modified — file exists
- [x] Commit `97d42b5` exists: `git log --oneline | grep 97d42b5` → "feat(12-02): recalibrate scoring caps..."
- [x] Commit `480b1c1` exists: `git log --oneline | grep 480b1c1` → "feat(12-02): add dataLevel?..."

## Self-Check: PASSED
