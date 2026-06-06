---
phase: 07-visa-concierge
plan: 03
subsystem: visa-engine
tags: [typescript, visa, screener, deterministic, pure-function, graded-fit]

requires:
  - phase: 07-01
    provides: Wave 0 stub (visa.ts + visa.test.ts RED suite in place)
  - phase: 07-02
    provides: Authored VISA_PATHWAYS + GENERIC_SKELETON constants in shared/data/visa-pathways.ts

provides:
  - Real selectVisaPathways implementation — flagship model returning all authored pathways for citizenship
  - gradeD8 — deterministic strong/possible/long-shot from hasRemote + income vs D8_MIN_ANNUAL_USD
  - gradeExpressEntry — simplified heuristic from age + isPostSecondaryDegree; language-score UPL boundary maintained
  - isPostSecondaryDegree — exact Phase 2 education strings (associates/bachelors/masters/doctorate)
  - GENERIC_SKELETON fallback for unlisted citizenships with destinationCountry=matchedCountry (D-06)
  - All 14 Wave 0 visa.test.ts assertions GREEN; tsc --noEmit clean

affects: [07-04, visa-concierge UI, any consumer of selectVisaPathways/GradedFit/VisaScreenerResult]

tech-stack:
  added: []
  patterns:
    - "helper-above-export ordering: private helpers (isPostSecondaryDegree, gradeD8, gradeExpressEntry, computeGradedFit) declared before exported function"
    - "switch-dispatch on pathway.destinationCountry for country-specific grading logic"
    - "ASSUMED threshold constants with JSDoc comment — verify at authoring before production use"
    - "Spread GENERIC_SKELETON to override destinationCountry only (preserves officialSources and all other fields)"
    - "Offline-mandatory: no async/await/fetch anywhere in the screener"

key-files:
  created: []
  modified:
    - shared/engine/visa.ts

key-decisions:
  - "D8_MIN_ANNUAL_USD = 3680 * 1.10 * 12 = 48,576 — conservative EUR_USD_CONSERVATIVE (1.10) prevents false strong on stale favorable rate"
  - "computeGradedFit dispatches on pathway.destinationCountry; unknown destinations return neutral possible (D-06)"
  - "matchedCountry never filters — only flows into the GENERIC_SKELETON fallback label (VISA-02 flagship model)"
  - "Express Entry grade uses isPostSecondaryDegree OR age<=29 as the possible gate, not strictly post-secondary only"
  - "Gating-factor text uses likelihood language throughout ('likely clears', 'favors', 'will be the swing factor') — UPL boundary (VISA-04)"

patterns-established:
  - "Offline deterministic screener: authored constants + switch dispatch, no network, no Date/random"
  - "Skeleton spread pattern: { ...GENERIC_SKELETON, destinationCountry: matchedCountry } preserves all non-overridden fields"

requirements-completed: [VISA-01]

duration: 8min
completed: 2026-06-06
---

# Phase 7 Plan 03: Visa Screener Engine Summary

**Deterministic graded-fit screener mapping Profile to D8/Express Entry pathways via authored thresholds — 14/14 Wave 0 tests GREEN, tsc clean**

## Performance

- **Duration:** 8 min
- **Started:** 2026-06-06T10:19:00Z
- **Completed:** 2026-06-06T10:27:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Replaced Wave 0 stub (returning []) with real selectVisaPathways flagship model
- gradeD8 uses D8_MIN_ANNUAL_USD ($48,576) with conservative EUR/USD constant to prevent false strong grades on stale FX
- gradeExpressEntry uses age≤35 + post-secondary heuristic; maintains explicit UPL disclaimer in gatingFactor text
- GENERIC_SKELETON fallback spreads with destinationCountry=matchedCountry so skeleton tests (officialSources, destinationCountry) pass
- All 14 visa.test.ts assertions pass; TypeScript strict-mode clean

## Task Commits

1. **Task 1: Implement selectVisaPathways + computeGradedFit (turn Wave 0 GREEN)** - `861eba3` (feat)

## Files Created/Modified
- `shared/engine/visa.ts` - Real screener replacing stub; gradeD8 + gradeExpressEntry + isPostSecondaryDegree + computeGradedFit + selectVisaPathways

## Decisions Made
- `EUR_USD_CONSERVATIVE = 1.10` (plan-specified) — below spot so a stale favorable rate cannot cause a false 'strong' grade
- Express Entry `possible` gate: `postSecondary || age<=29` — catches the case where someone has no degree but is young enough that other CRS factors may compensate
- Gating-factor text in all grades avoids "you qualify" language; uses "likely", "favors", "swing factor" to satisfy T-07-05 (UPL boundary)

## Deviations from Plan

None — plan executed exactly as written. One minor comment text adjusted: removed an in-comment `'bachelor'` reference to satisfy the `grep -c "'bachelor'"` acceptance check (plan requires 0; the note was informational only).

## Issues Encountered
None.

## User Setup Required
None — no external service configuration required.

## Known Stubs
None. All graded-fit values are computed from real authored thresholds and real Profile fields. GENERIC_SKELETON feeRangeUSD/processingTime read "Verify at official source" — this is intentional authored content (D-06 honest skeleton), not a stub.

## Next Phase Readiness
- `selectVisaPathways` is ready for Plan 04 (UI rendering of visa concierge panel)
- All Wave 0 tests GREEN; GradedFit/VisaScreenerResult interfaces exported for consumer use
- No blockers

---
*Phase: 07-visa-concierge*
*Completed: 2026-06-06*
