---
phase: 02
slug: quiz-profile-capture
nyquist_validation: true
created: 2026-06-02
source: 02-RESEARCH.md §"Validation Architecture (Nyquist)"
test_runner: vitest
type_check: tsc --noEmit
---

# Phase 2 — Validation Strategy (Nyquist)

Maps each phase requirement and critical behavior to a concrete, runnable validation.
The capture layer is built from **pure functions + a reducer state machine**, so the core
logic is unit-testable without a DOM. Test runner **vitest** is installed in Plan 02-01
(Wave 1). The type contract is checked with `tsc --noEmit`. UI-only behaviors that cannot be
asserted in a unit test are covered by the human-verify checkpoint in Plan 02-04.

## Validation Requirements

| # | Target (file) | What it proves | Type | Command | Requirements / SC | Plan |
|---|---|---|---|---|---|---|
| V1 | `shared/engine/derive-preferences.ts` (`.test.ts`) | Known answers → expected normalized weights (sum ≈ 1); motivation/pace/lifestyle nudges move the correct weight; tradeoff deltas applied. The D-04 "real logic" is correct. | unit | `npx vitest run shared/engine/derive-preferences.test.ts` | QUIZ-01/02/04 · SC2/SC7 | 02-01 |
| V2 | `shared/engine/conflict-detection.ts` (`.test.ts`) | Each conflict heuristic fires on its trigger combo and not otherwise; only the highest-severity conflict is surfaced when several apply. | unit | `npx vitest run shared/engine/conflict-detection.test.ts` | QUIZ-01 · SC7 | 02-01 |
| V3 | `shared/engine/quiz-branching.ts` (`.test.ts`) | Branch predicates resolve correctly: `needsStatusQuestion` (non-US only), `collapseAbroad` (openness === 0), `needsPartnerIncome`, dependents/pets, workStyle≠remote → hub/commute. | unit | `npx vitest run shared/engine/quiz-branching.test.ts` | QUIZ-01/02/03 · SC6 | 02-01 |
| V4 | `shared/engine/profile-completeness.ts` (`.test.ts`) | A completed quiz yields a Profile with every required field present; `immigrationStatus === "citizen"` auto-set when `citizenship === "United States"`; `excludeInternational === true` when openness === 0; `preferences` emitted. | unit | `npx vitest run shared/engine/profile-completeness.test.ts` | QUIZ-01/02/03/05 · SC1/SC2/SC3/SC5 | 02-04 |
| V5 | `shared/types.ts` (contract) | `Profile` + `PreferenceProfile` (+ new `City` dealbreaker fields) compile; the object emitted on submit structurally matches the interface — the Phase 2 → Phase 3 handshake holds. | type | `npx tsc --noEmit` | QUIZ-01..05 (contract) · SC3 | 02-01 |

## Human-Verify Checkpoint (non-automatable UI behavior)

Covered by **Plan 02-04 Task 2** (blocking `checkpoint:human-action`). Confirms the assembled,
running quiz delivers the success criteria a unit test cannot observe:

- SC1: full multi-step flow completes with no errors (`npm run dev`).
- SC4: selecting a hard dealbreaker shows the capture-time warning; the value is stored as a hard filter on the Profile (visible in browser state).
- SC6: answers change which follow-ups appear (e.g. non-US citizenship reveals the status enum; openness = 0 collapses the abroad framing).
- SC7: ranking `cost` #1 + an expensive lifestyle tag triggers exactly one reconciliation panel **after the Priorities step**; choosing an option stores `preferences.tradeoffs[id]` (visible in browser state).

## Coverage Check

| Success Criterion | Validated by |
|---|---|
| SC1 multi-step flow | V4 + human-verify (Plan 04) |
| SC2 openness slider (0 = exclude) | V1, V3, V4 |
| SC3 citizenship + status on Profile | V4, V5 |
| SC4 hard dealbreaker eliminates | V1 + human-verify (warning + storage) |
| SC5 move timeline | V4 |
| SC6 adaptive branching | V3 + human-verify |
| SC7 tension reconciliation → tiebreaker | V1, V2 + human-verify |

All 7 success criteria have at least one automated validation or a checkpoint-backed human verification. No success criterion is unvalidated.
