---
phase: 11-deep-profile-expand-the-quiz-with-sourced-life-area-categori
plan: 01
subsystem: api
tags: [typescript, quiz-engine, types, contract, tdd, vitest]

requires:
  - phase: 03-matching-and-us-financial-spine
    provides: scoring.ts rankToWeight reads profile.weights — must remain intact (D-02)
  - phase: 02-quiz-profile-capture
    provides: QuestionDef/Answers types, quiz-engine/ module structure, tension.test.ts staggered-green pattern

provides:
  - WeightExplanation interface in shared/types.ts (MATCH-05 Phase 12 seam)
  - Additive Profile extension: categoryWeights, weightExplanations, 11 module-captured optional fields
  - Additive City extension: 14 optional Phase 12 data fields (healthcare, climate, schools, demographics, parks, connectivity)
  - shared/quiz-engine/keys.ts: ALL_SCORED_CATEGORIES (7 buildable slugs), 5 tradeoff consts, MODULE_SELECTED_PREFIX, MODULE_IMPORTANCE_PREFIX, FAMILY_CATEGORIES
  - RED test scaffolds: personality.test.ts (QUIZ-06, QUIZ-09) and category-modules.test.ts (QUIZ-07, QUIZ-08)

affects:
  - phase 11 plan 02 (personality.ts — synthesizeCategoryWeights must match these types and keys)
  - phase 11 plan 03 (category-modules.ts — QuestionDef arrays must satisfy test scaffold assertions)
  - phase 12 (scoring engine reads categoryWeights from Profile; City fields populated for 22 cities)

tech-stack:
  added: []
  patterns:
    - "Additive-only contract extension: new optional fields added before closing brace with announcement comment"
    - "Staggered-green RED scaffold: import-RED header + top-level import of absent implementation file"
    - "Cross-plan constant file (keys.ts): single source of truth for answer-key strings shared across plans"
    - "Module importance prefix pattern: MODULE_IMPORTANCE_PREFIX ensures tradeoff-less categories have a weight signal"

key-files:
  created:
    - shared/quiz-engine/keys.ts
    - shared/quiz-engine/personality.test.ts
    - shared/quiz-engine/category-modules.test.ts
  modified:
    - shared/types.ts

key-decisions:
  - "WeightExplanation added before Profile in types.ts — plans 02/03 reference it as a return type before Profile is declared"
  - "MODULE_IMPORTANCE_PREFIX exported from keys.ts — load-bearing for tradeoff-less categories (climateRisk, parks, demographics) to have a weight signal beyond NEUTRAL_DEFAULT"
  - "NEUTRAL_DEFAULT imported from ./personality.js in test (not hardcoded 0.5) — if plan 02 changes the constant, the forcing test stays honest"
  - "Forcing test assertion is strict > NEUTRAL_DEFAULT (never >= or dropped) — guards MEMORY.md 'assert what the user sees' lesson"
  - "Requirements QUIZ-06..09 are scaffolded (RED) not complete — only MATCH-05 is fully satisfied by this plan; QUIZ-06..09 go green in plans 02/03"

patterns-established:
  - "SP-1: .js import extensions in all shared/quiz-engine/*.ts files (ESM + bundler moduleResolution)"
  - "SP-2: Boxed module header comment in new quiz-engine modules"
  - "SP-4: Staggered-green test discipline — Wave 1 gate is shared/engine/ only, never shared/quiz-engine/"

requirements-completed: [MATCH-05]

duration: 20min
completed: 2026-06-02
---

# Phase 11 Plan 01: Deep Profile Foundation Summary

**WeightExplanation interface + additive Profile/City contract extension + keys.ts constants module + two RED test scaffolds pinning QUIZ-06/07/08/09 assertions against personality.ts and category-modules.ts**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-06-02T22:30:00Z
- **Completed:** 2026-06-02T22:40:00Z
- **Tasks:** 3
- **Files modified:** 4 (1 modified, 3 created)

## Accomplishments

- Extended `shared/types.ts` additively with `WeightExplanation` interface and 11 optional Profile fields + 14 optional City fields; `weights?` untouched; `tsc --noEmit` clean; all 31 engine tests green
- Created `shared/quiz-engine/keys.ts` as the single source of truth for the 7 buildable category slugs (ALL_SCORED_CATEGORIES), 5 tradeoff answer-key constants, MODULE_SELECTED_PREFIX, MODULE_IMPORTANCE_PREFIX, and FAMILY_CATEGORIES — plans 02/03 bind to identical strings
- Created two RED scaffolds (`personality.test.ts`, `category-modules.test.ts`) encoding QUIZ-06/07/08/09 assertions; both import from `./keys.js` (not `./tension.js`); staggered-green headers; Wave 1 gate (`shared/engine/`) remains green

## Task Commits

1. **Task 1: Extend shared/types.ts additively** - `775761e` (feat)
2. **Task 2: Create shared/quiz-engine/keys.ts** - `439274e` (feat)
3. **Task 3: Create RED test scaffolds** - `476a90e` (test)

## Files Created/Modified

- `shared/types.ts` - WeightExplanation interface + Phase 11 additive Profile fields + City fields
- `shared/quiz-engine/keys.ts` - Cross-plan answer-key constants: ALL_SCORED_CATEGORIES, tradeoff consts, prefix consts, FAMILY_CATEGORIES
- `shared/quiz-engine/personality.test.ts` - RED scaffold for detectPersonalityTension + synthesizeCategoryWeights + neutral-skip loop + forcing test for tradeoff-less categories
- `shared/quiz-engine/category-modules.test.ts` - RED scaffold for CATEGORY_MODULE_QUESTIONS showIf predicates + contract guards

## Decisions Made

- `NEUTRAL_DEFAULT` is imported from `./personality.js` in the test (not hardcoded 0.5). When Wave 2 plan 02 implements personality.ts, the test's forcing assertion stays calibrated against the real constant.
- Forcing test (h) uses strict `>` comparison, not `>=`. Per plan spec and the MEMORY.md lesson: if the synthesizer emits exactly NEUTRAL_DEFAULT for a high-importance answer, the test correctly goes RED and points to a bug in plan 02's synthesizer.
- Requirements QUIZ-06..09 are marked scaffolded-pending; only MATCH-05 is marked complete in this plan. These behaviors cannot be verified until Wave 2 implementations land. Marking them complete now would be a traceability lie.
- The financial.test.ts uk-2026 failures observed mid-run were pre-existing Phase 04 RED scaffolds (commit `339a8a0`); final verification showed 31/31 passing (test isolation resolved itself on re-run).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Mid-execution: `npx vitest run shared/engine/` briefly showed 6 failures (uk-2026 RED tests from Phase 04 Plan 01). Confirmed pre-existing by checking git log. Final run showed all 31 tests passing. No change required.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `shared/types.ts` contract is stable: plan 02 (personality.ts) can reference `WeightExplanation` and `categoryWeights` immediately
- `shared/quiz-engine/keys.ts` is the binding contract: plan 02 imports `ALL_SCORED_CATEGORIES`, tradeoff consts, `MODULE_IMPORTANCE_PREFIX`; plan 03 imports tradeoff consts + `MODULE_SELECTED_PREFIX`
- RED scaffolds are excluded from Wave 1 gate and will import-error until Wave 2 plans land — by design
- Phase 12 may consume City optional fields once populated; no scoring engine changes needed in Phase 11

## Known Stubs

None — this plan creates contracts and tests, no data-rendering stubs.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundary changes. All new fields are optional and read-only contract extensions.

## Self-Check: PASSED

- FOUND: shared/types.ts
- FOUND: shared/quiz-engine/keys.ts
- FOUND: shared/quiz-engine/personality.test.ts
- FOUND: shared/quiz-engine/category-modules.test.ts
- FOUND: .planning/phases/11-deep-profile-expand-the-quiz-with-sourced-life-area-categori/11-01-SUMMARY.md
- Commits verified: 775761e, 439274e, 476a90e all present in git log

---
*Phase: 11-deep-profile-expand-the-quiz-with-sourced-life-area-categori*
*Completed: 2026-06-02*
