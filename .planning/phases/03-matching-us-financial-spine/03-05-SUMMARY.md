---
phase: 03-matching-us-financial-spine
plan: 05
subsystem: shared/engine
tags: [dealbreakers, scoring, tdd, pure-functions]
dependency_graph:
  requires: [03-01, 03-02]
  provides: [dealbreakers.ts with getTriggeredDealbreakers + checkReconfirm]
  affects: [shared/engine/index.ts (03-06 imports applyPenalties + checkReconfirm)]
tech_stack:
  added: []
  patterns: [for-of-with-push instead of filter, strict-boundary comparisons, optional-profile parameter]
key_files:
  created: [shared/engine/dealbreakers.ts]
  modified: []
decisions:
  - "profile parameter on getTriggeredDealbreakers is optional (profile?: Profile) — test calls it with 2 args; job-market check guards with if (profile)"
  - "Strict > 95 heat threshold — San Antonio summerHighF=95 does not trigger (exclusive boundary)"
  - "No .filter() anywhere — triggered list built with for-of + push to satisfy D-01 grep acceptance criterion"
  - "Job-market category map inlined in dealbreakers.ts (copied from constants.js) to keep getTriggeredDealbreakers synchronous; avoids dynamic import in hot path"
metrics:
  duration: 8min
  completed: "2026-06-02"
  tasks: 1
  files: 1
---

# Phase 3 Plan 5: Dealbreaker Penalty Layer Summary

Implemented `shared/engine/dealbreakers.ts` — all 10 DEAL_BREAKERS mapped to concrete city fields per D-11, with heavy penalty-not-delete enforcement (D-01) and pure-engine D-02 re-confirm logic.

## One-liner

D-01/D-02 dealbreaker layer: 10 field-mapped checks with strict-boundary thresholds, -30pt penalty per trigger (never delete), and pure `checkReconfirm` that cites the real city fact when a dealbreaker demotes the raw #1.

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Implement dealbreakers.ts | ffc2f9d | shared/engine/dealbreakers.ts |

## Verification Results

- `npx vitest run shared/engine/dealbreakers.test.ts`: **6/6 GREEN**
- `grep -c avgTemp shared/engine/dealbreakers.ts`: **0** (no avgTemp references)
- `grep -c '.filter(' shared/engine/dealbreakers.ts`: **0** (no filter calls)
- `npx tsc --noEmit -p tsconfig.json`: **exits 0**
- Heat threshold: `city.summerHighF > heatThresholdF` (strict `>`, San Antonio at 95 does not trigger)
- All thresholds imported from `scoring-weights.ts` — no inline 95/25/30

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Optional `profile` parameter on `getTriggeredDealbreakers`**
- **Found during:** Task 1 — pre-implementation review of test call sites
- **Issue:** The plan's `<interfaces>` block declares `getTriggeredDealbreakers(city, dealBreakers, profile)` with 3 required params, but every call in `dealbreakers.test.ts` uses only 2 args. A required `profile` would fail `tsc --noEmit` on the test file.
- **Fix:** Made `profile?: Profile` optional; job-market dealbreaker check guards with `if (profile)` before accessing `profile.profession`
- **Files modified:** shared/engine/dealbreakers.ts
- **Commit:** ffc2f9d

None beyond the signature fix — plan executed as written.

## Known Stubs

None. No stub patterns in dealbreakers.ts — all 10 dealbreakers are fully wired to real city fields with real threshold comparisons.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes. The threat mitigations from the plan's threat register are all applied:
- T-3-08 (unknown dealbreaker strings): handled by `default: break` in switch — silently ignored
- T-3-09 (re-confirm as UI-side): `checkReconfirm` is a pure engine function, not UI logic
- T-3-10 (empty ranking after penalties): `applyPenalties` never calls `.filter()`; ranking always full

## Self-Check: PASSED
