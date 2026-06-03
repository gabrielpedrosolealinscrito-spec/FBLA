---
phase: 11-deep-profile-expand-the-quiz-with-sourced-life-area-categori
plan: 02
subsystem: api
tags: [typescript, quiz-engine, personality, weights, tdd, vitest]

requires:
  - phase: 11-deep-profile-expand-the-quiz-with-sourced-life-area-categori
    provides: keys.ts (ALL_SCORED_CATEGORIES, tradeoff consts, MODULE_IMPORTANCE_PREFIX, FAMILY_CATEGORIES), WeightExplanation type, personality.test.ts RED scaffold
  - phase: 03-matching-and-us-financial-spine
    provides: dealbreakers.checkReconfirm signal-or-null guard discipline; scoring contribution-array pattern (analogs)

provides:
  - shared/quiz-engine/personality.ts — the personality/values gate
  - PERSONALITY_QUESTIONS (5 tradeoff scenarios, ids === keys.ts TRADEOFF_* consts)
  - TRAIT_QUESTIONS (non-weight-bearing flavor layer, D-07)
  - detectPersonalityTension (adaptive follow-up, signal-or-null, D-10)
  - synthesizeCategoryWeights (explainable + floored + neutral-safe, raw weights, D-06/08/09/13)
  - Tier constants: PRACTICAL_CATEGORIES, PREFERENCE_CATEGORIES, WEIGHT_FLOOR, WEIGHT_MAX_PRAC, WEIGHT_MAX_PREF, NEUTRAL_DEFAULT

affects:
  - phase 11 plan 04 (questions.ts integration assembles PERSONALITY_QUESTIONS + TRAIT_QUESTIONS into the flow)
  - phase 12 (scoring engine consumes categoryWeights + weightExplanations; normalizes raw weights via rankToWeight successor)

tech-stack:
  added: []
  patterns:
    - "Signal-or-null guard discipline (mirrors dealbreakers.checkReconfirm): empty-answers guard returns null first; never throws on unknown keys"
    - "Two-tier weight floor: practical categories (healthcare, safety) carry WEIGHT_FLOOR; preference categories swing freely from 0"
    - "Raw-weights contract: synthesizeCategoryWeights emits floor..max values, never pre-normalized (Phase 12 normalizes)"
    - "Ship-together return (D-08): categoryWeights and weightExplanations emitted from one call"

key-files:
  created:
    - shared/quiz-engine/personality.ts
  modified: []

key-decisions:
  - "cost kept OUT of categoryWeights (excluded to avoid double-counting profile.weights.cost) pending D-02; documented in PLANNER-NOTE comment"
  - "career provisionally assigned to PREFERENCE_CATEGORIES (explicit Set literal member) — D-02 not resolved here"
  - "High-importance answer increments tally by >=2 (with step) so a SINGLE high-importance answer pushes a tradeoff-less category strictly ABOVE NEUTRAL_DEFAULT — satisfies the forcing test without weakening the assertion (MEMORY.md 'assert what the user sees' lesson honored)"
  - "tradeoff_family_vs_mobility === family_critical raises BOTH schools and childcare via FAMILY_CATEGORIES"
  - "PRACTICAL/PREFERENCE Sets are the all-factor floor/swing registry (legacy + new), distinct from ALL_SCORED_CATEGORIES (new-only, what synthesizeCategoryWeights iterates) — not trimmed to match"

patterns-established:
  - "Personality gate INFERS category weights from tradeoff scenarios + per-category importance (D-06) — no sliders/ranking"
  - "Adaptive tension follow-up fires when >=2 'balanced'/'depends' answers across core tradeoffs (D-10)"

requirements-completed: [QUIZ-06, QUIZ-09]

duration: ~17min (impl) + restore after branch-collision
completed: 2026-06-03
---

# Phase 11 Plan 02: Personality / Values Gate Summary

**`personality.ts` — tradeoff + trait QuestionDefs, `detectPersonalityTension` (adaptive follow-up), and `synthesizeCategoryWeights` (explainable, two-tier floored, neutral-safe, raw weights). Turns the RED `personality.test.ts` scaffold GREEN (QUIZ-06, QUIZ-09).**

## Performance

- **Duration:** ~17 min implementation; additional restore/recommit after a branch collision (see Issues)
- **Completed:** 2026-06-03
- **Tasks:** 2
- **Files modified:** 1 created

## Accomplishments

- Created `shared/quiz-engine/personality.ts` (420 lines): 5 tradeoff `PERSONALITY_QUESTIONS` (ids match keys.ts), 3-5 non-weight-bearing `TRAIT_QUESTIONS`, all tier constants
- `detectPersonalityTension`: empty-answers guard returns null first; fires a tiebreaker follow-up when >=2 core tradeoffs answered "balanced"/"depends"; never throws on unknown keys
- `synthesizeCategoryWeights`: reads BOTH tradeoff keys and per-category `MODULE_IMPORTANCE_PREFIX` keys for every ALL_SCORED_CATEGORIES member (tradeoff-less climateRisk/parks/demographics get a real weight signal); maps family→{schools,childcare}; emits categoryWeights + weightExplanations together (D-08); two-tier floor (D-09); NEUTRAL_DEFAULT fallback never undefined/NaN (D-13); raw weights, not normalized
- Verification: **personality.test.ts 11/11 GREEN**; plan-scoped gate (personality + `shared/engine/`) **49/49 GREEN** — no Phase 3 regression

## Task Commits

1. **Task 1 + Task 2 (combined restore):** `bf3e217` (feat) — personality.ts implementation restored from validated backup and recommitted on phase-4-intl after branch collision

## Files Created/Modified

- `shared/quiz-engine/personality.ts` — personality/values gate (tradeoff + trait QuestionDefs, tier constants, detectPersonalityTension, synthesizeCategoryWeights)

## Decisions Made

- `cost` excluded from categoryWeights (double-count avoidance vs `profile.weights.cost`) pending D-02; `career` provisionally PREFERENCE — both documented in PLANNER-NOTE, D-02 intentionally NOT resolved.
- Increment/step calibrated so one high-importance answer clears NEUTRAL_DEFAULT strictly (forcing test honest, assertion never weakened).

## Deviations from Plan

- **Execution context, not logic:** Plan ran under a branch collision. The shared checkout was switched to `integrate/quiz-engine` mid-execution by a parallel session (commit `71b8d6b`), which wiped the uncommitted `personality.ts`. The validated file (11/11 GREEN) was preserved to OneDrive, then restored and committed in the dedicated `phase-4-intl` worktree (`/Users/leal/FBLA/FBLA-phase4-wt`). Logic matches the plan exactly; only the commit path deviated.

## Issues Encountered

- **Branch collision (resolved):** parallel `integrate/quiz-engine` session switched the shared checkout and deleted the Phase 11 quiz-engine scaffolds *on its own branch only*. `phase-4-intl` (this worktree) was untouched. Resolved by working in the `phase-4-intl` worktree and recommitting the validated file. No data lost; no other workstream's files touched.

## User Setup Required

None.

## Next Phase Readiness

- `personality.ts` exports are stable for plan 04's `questions.ts` integration (PERSONALITY_QUESTIONS, TRAIT_QUESTIONS, detectPersonalityTension).
- Phase 12 can consume `synthesizeCategoryWeights` output (categoryWeights + weightExplanations) and normalize the raw weights.
- Plan 03 (category-modules.ts) is independent of this file — both depend only on 11-01.

## Known Stubs

None.

## Threat Flags

None — T-11-03/04/05 mitigations implemented (input clamps, empty-answers guard, two-tier range clamp); no new packages (T-11-SC accept).

## Self-Check: PASSED

- FOUND: shared/quiz-engine/personality.ts
- FOUND: .planning/phases/11-deep-profile-expand-the-quiz-with-sourced-life-area-categori/11-02-SUMMARY.md
- Tests: personality.test.ts 11/11 GREEN; personality + shared/engine/ 49/49 GREEN
- Commit verified: bf3e217 present in git log (phase-4-intl)

---
*Phase: 11-deep-profile-expand-the-quiz-with-sourced-life-area-categori*
*Completed: 2026-06-03*
