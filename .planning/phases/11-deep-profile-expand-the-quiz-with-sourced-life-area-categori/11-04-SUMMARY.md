---
phase: 11-deep-profile-expand-the-quiz-with-sourced-life-area-categori
plan: 04
subsystem: quiz-engine
tags: [quiz-engine, questions, personality, category-modules, ui-spec, contract, phase-12-handoff]

# Dependency graph
requires:
  - phase: 11-02
    provides: "PERSONALITY_QUESTIONS, TRAIT_QUESTIONS, synthesizeCategoryWeights, detectPersonalityTension"
  - phase: 11-03
    provides: "CATEGORY_MODULE_QUESTIONS (healthcare/family/climate/demographics/parks/connectivity)"
  - phase: 02-quiz-profile-capture
    provides: "ALL_QUESTIONS array in questions.ts, QuestionDef interface, resolver, synthesizer"
provides:
  - "ALL_QUESTIONS registered with Phase 11 personality + module questions (append-only, questions.ts)"
  - "11-UI-SPEC.md — collaborator-facing contract spec in gold-cinematic visual language (D-03)"
  - "Phase 12 hard requirements carried forward (BASE_SCORE/clamp BLOCKER, D-02 open, floor tuning)"
affects:
  - phase-12-multi-dimensional-scoring
  - collaborator-ui-rebuild
  - phase-02-integration

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Append-only ALL_QUESTIONS spread: personality FIRST then modules (ordering invariant)"
    - "UI spec as collaborator handshake: getVisibleQuestions(answers, all) two-arg contract"
    - "Phase 12 BLOCKER carried in spec: BASE_SCORE + Σ(caps) < 99 assertion required"

key-files:
  created:
    - ".planning/phases/11-.../11-UI-SPEC.md — 577-line collaborator quiz UI contract + Phase 12 handoff"
  modified:
    - "shared/quiz-engine/questions.ts — append-only spread of PERSONALITY + TRAIT + CATEGORY_MODULE questions"

key-decisions:
  - "questions.ts registration is APPEND-ONLY — no Phase 2 question modified, reordered, or deleted"
  - "Spread order: PERSONALITY_QUESTIONS -> TRAIT_QUESTIONS -> CATEGORY_MODULE_QUESTIONS (Pitfall 4 invariant)"
  - "UI-SPEC documents getVisibleQuestions(answers, all) two-argument signature (confirmed from resolver.ts)"
  - "UI-SPEC explicitly prohibits 'people like you' framing for foreignBornPct (D-14 hard constraint)"
  - "UI-SPEC carries Phase 12 BASE_SCORE/clamp BLOCKER as named hard requirement — not lost between phases"
  - "D-02 (replace vs. layer) documented as open at Phase 2 integration — Phase 11 does not resolve it"

patterns-established:
  - "Append-only import+spread pattern for extending ALL_QUESTIONS across phase boundaries"
  - "Phase 12 BLOCKER naming pattern in UI spec — carries forward phase-boundary hard requirements"

requirements-completed: [QUIZ-06, QUIZ-07, QUIZ-08, QUIZ-09, MATCH-05]

# Metrics
duration: 35min
completed: 2026-06-03
---

# Phase 11 Plan 04: Quiz Registration + UI Spec Summary

**Append-only spread of PERSONALITY + TRAIT + CATEGORY_MODULE questions into ALL_QUESTIONS, plus 577-line collaborator-facing quiz UI contract carrying the gold-cinematic visual language and Phase 12 BASE_SCORE/clamp BLOCKER**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-06-03T08:00:00Z
- **Completed:** 2026-06-03T08:25:00Z
- **Tasks:** 2 of 2
- **Files modified:** 2

## Accomplishments

- Registered Phase 11 personality gate and category module questions into `ALL_QUESTIONS` with the correct ordering invariant (personality before modules) — additive only, no Phase 2 questions touched
- Created `11-UI-SPEC.md` (577 lines): full collaborator-facing contract covering the engine API, gold-cinematic visual language tokens, explainability surface, data caveats, and Phase 12 hard requirements
- Confirmed no Phase 2 regression: resolver.test.ts + synthesizer.test.ts (25 tests) and personality/category-modules/engine (86 tests) all green

## Task Commits

1. **Task 1: Append-only registration of Phase 11 questions into ALL_QUESTIONS** — `73ab356` (feat)
2. **Task 2: Write 11-UI-SPEC.md** — `812fb29` (docs)

**Plan metadata:** (see below — SUMMARY + STATE commit)

## Files Created/Modified

- `shared/quiz-engine/questions.ts` — added imports for PERSONALITY_QUESTIONS, TRAIT_QUESTIONS from `./personality.js` and CATEGORY_MODULE_QUESTIONS from `./category-modules.js`; spread all three into ALL_QUESTIONS in the correct order with load-bearing ordering invariant comment
- `.planning/phases/11-.../11-UI-SPEC.md` — 577-line collaborator-facing quiz UI contract + Phase 12 handoff spec

## Decisions Made

- **getVisibleQuestions(answers, all)** — UI-SPEC documents the two-argument signature confirmed from reading `resolver.ts` directly (not the research doc's assumed one-arg form)
- **Phase 12 BLOCKER named explicitly** — BASE_SCORE + clamp recalibration documented as a hard requirement in the spec with the exact invariant `BASE_SCORE + Σ(caps) < 99` so it is not lost between phases
- **D-02 stays OPEN** — Phase 11 does not resolve replace-vs-layer; documented in spec Section 8.2 for Phase 2 integration to address

## Deviations from Plan

### Infrastructure Deviation: Worktree Restoration Required

- **Found during:** Task 1 setup
- **Issue:** The intended worktree at `/Users/leal/FBLA/FBLA-phase4-wt` was absent (pruned/removed between sessions). The initial verify command returned `phase-4-intl` but the directory was gone by the time the first edit was attempted. The main repo checkout at `/Users/leal/FBLA/FBLA` was on `integrate/quiz-engine` — a concurrent integration branch — and could not be switched.
- **Fix:** Used `git worktree prune && git worktree add /Users/leal/FBLA/FBLA-phase4-wt phase-4-intl` to recreate the worktree. Symlinked `node_modules` from the main repo to enable vitest and tsc in the worktree context.
- **Impact:** No code impact; all plan work executed on the correct branch. Node_modules symlink is not committed (appears in `git status --short` as `??`; should not be tracked).

**NOTE FOR USER:** The `integrate/quiz-engine` branch on the main checkout appears to be an active integration session (commits grafting the scoring engine onto main). The Phase 11 work lives on `phase-4-intl`. Confirm whether `phase-4-intl` is still the intended target before Phase 12, or whether the integration work on `integrate/quiz-engine` supersedes it.

### Code Deviations from Plan

None — plan executed exactly as specified. Both `questions.ts` edits (imports + spreads) and the spec creation followed the plan precisely.

## Issues Encountered

- **Out-of-scope tsc error:** `api/health.ts(2,52): error TS2307: Cannot find module '@vercel/node'` — pre-existing on `phase-4-intl`, unrelated to this plan. Not fixed (out-of-scope per deviation rules).

## Known Stubs

None — Phase 11 Plan 04 is specification + wiring only. No data flows to UI from this plan directly.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes at trust boundaries introduced in this plan.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

Phase 11 is complete. Phase 12 (Multi-Dimensional Scoring) can now proceed with:

- `profile.categoryWeights` + `profile.weightExplanations` available from `synthesizeCategoryWeights`
- All 7 category module questions registered and producing answer signals
- `primaryHazardConcern` captured for per-hazard FEMA sub-score mapping
- Phase 12 BLOCKERS documented in `11-UI-SPEC.md` Section 8:
  1. **BASE_SCORE + Σ(caps) < 99** must be verified before adding scored categories
  2. **D-02** (replace vs. layer) must be resolved at Phase 2 integration
  3. Two-tier floor values `WEIGHT_FLOOR` / `WEIGHT_MAX_*` are provisional — tune in `scoring-weights.ts`

---
*Phase: 11-deep-profile-expand-the-quiz-with-sourced-life-area-categori*
*Completed: 2026-06-03*
