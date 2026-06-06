---
phase: 07-visa-concierge
plan: 02
subsystem: data
tags: [visa, typescript, data-module, immigration, portugal-d8, canada-express-entry]

# Dependency graph
requires:
  - phase: 07-01
    provides: VisaPathway interface (shared/types.ts lines 189–201), visa-engine stub, selectVisaPathways stub
provides:
  - VISA_PATHWAYS flat registry (Record<string, VisaPathway[]>) keyed by citizenship
  - PORTUGAL_D8 VisaPathway constant — D8 Digital Nomad / Remote Work Visa, AIMA-cited, income + fee + checklist authored
  - CANADA_EXPRESS_ENTRY VisaPathway constant — FSW via Express Entry, IRCC-cited, CRS + LICO + fees authored
  - GENERIC_SKELETON honest fallback with no invented numbers
  - 26 data-integrity tests (visa-pathways.test.ts) — GREEN against authored data, no engine dependency
  - Human-verified figures: AIMA + IRCC confirmed by user 2026-06-06; no corrections requested
affects: [07-03, 07-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Direct-import data tests (visa-pathways.test.ts imports from ./visa-pathways.js, not the engine) — VISA-03 Nyquist gate"
    - "Flat VISA_PATHWAYS registry shape: Record<string, VisaPathway[]> keyed by citizenship — NOT the nested Record<string, Record<string, ...>> shape"
    - "All authored figures carry officialSources[] with a 'Data as of: 2026-06-05' string — T-07-02 tampering mitigation"

key-files:
  created:
    - shared/data/visa-pathways.ts
    - shared/data/visa-pathways.test.ts
  modified: []

key-decisions:
  - "Human-verify checkpoint passed 2026-06-06 — AIMA/IRCC figures confirmed, no corrections applied"
  - "CRS job-offer bonus absent from CANADA_EXPRESS_ENTRY (removed March 25, 2025) — test asserts this invariant"
  - "VISA_PATHWAYS flat shape (not nested) matches PATTERNS.md and the Plan 03 engine contract"

patterns-established:
  - "Pattern: Direct-import data-integrity tests that go GREEN as soon as the data module exists, before engine wiring"
  - "Pattern: officialSources[] always contains a 'Data as of' string — enforced by test"

requirements-completed: [VISA-02, VISA-03]

# Metrics
duration: 20min
completed: 2026-06-06
---

# Phase 7 Plan 02: Visa-Pathways Data Module Summary

**VISA_PATHWAYS registry with Portugal D8 and Canada Express Entry — fully cited VisaPathway constants authored from RESEARCH.md, human-verified against AIMA and IRCC, 26 data-integrity tests GREEN**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-06-06T10:00:00Z
- **Completed:** 2026-06-06T10:12:56Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 2

## Accomplishments

- Authored `shared/data/visa-pathways.ts`: PORTUGAL_D8 (D8 Digital Nomad, income threshold €3,680/mo, €170 AIMA + €90–110 consulate fees, 4–9 month processing, 12-item checklist, AIMA/MNE/Finanças sources cited), CANADA_EXPRESS_ENTRY (FSW, CRS ~480–550+, CAD $15,263 LICO, CAD $1,590 government fees, 6–8 month post-ITA timeline, 10-item checklist, IRCC sources cited), GENERIC_SKELETON (honest fallback, no invented numbers), and the flat VISA_PATHWAYS registry
- Authored 26 data-integrity tests in `visa-pathways.test.ts` importing directly from the data module (not the engine), covering: registry shape, required fields non-empty, officialSources data-as-of string present, no removed CRS job-offer bonus, GENERIC_SKELETON verify-at-source discipline — all GREEN immediately
- Human-verify checkpoint passed: user confirmed figures against AIMA, IRCC fee list (April 30, 2026 update), and Portuguese consulate sources — no corrections requested

## Task Commits

Each task was committed atomically:

1. **Task 1: Author visa-pathways.ts** - `8f427c7` (feat)
2. **Task 2: Data-integrity tests** - `ccf8536` (test)
3. **Task 3: Human-verify checkpoint** - approved by user 2026-06-06, no code changes

## Files Created/Modified

- `shared/data/visa-pathways.ts` — PORTUGAL_D8 + CANADA_EXPRESS_ENTRY + GENERIC_SKELETON + flat VISA_PATHWAYS registry, every figure carrying officialSources + "Data as of: 2026-06-05" string
- `shared/data/visa-pathways.test.ts` — 26 direct-import data-integrity tests (VISA-03 Nyquist gate), GREEN against authored data without engine dependency

## Decisions Made

- Human-verify checkpoint passed with no corrections — all figures (D8 income threshold, AIMA fees, Canada LICO, IRCC fees, FX rates) confirmed against official authorities by user on 2026-06-06
- CRS job-offer bonus absent from CANADA_EXPRESS_ENTRY (removed March 25, 2025) — enforced by test assertion `joined.match(/job[ -]?offer.*point/i)` returning null
- Flat `Record<string, VisaPathway[]>` shape maintained throughout — matches PATTERNS.md line 58–62 and the Plan 03 engine contract

## Deviations from Plan

None — plan executed exactly as written. Human-verify checkpoint satisfied by user approval with no figure corrections required.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Known Stubs

`GENERIC_SKELETON` is an intentional honest placeholder with `processingTime: 'Verify at official source'` and `feeRangeUSD: 'Verify at official source'`. This is by design (D-06 honest fallback) and enforced by test. Plan 03 engine will use authored pathways for US citizens; GENERIC_SKELETON serves unmatched citizenship keys.

## Threat Flags

No new threat surface introduced. Data module is static TypeScript constants with zero network calls. T-07-02 (stale figures) mitigated via officialSources + data-as-of string (tested) + human-verify checkpoint now passed.

## Next Phase Readiness

- `shared/data/visa-pathways.ts` is ready for Plan 03 engine wiring — `selectVisaPathways` can look up `VISA_PATHWAYS[profile.citizenship]` directly
- All visa data exports are named and typed correctly against the VisaPathway interface
- Plan 03 engine tests (currently RED on stub) can now be driven GREEN using the authored data

---
*Phase: 07-visa-concierge*
*Completed: 2026-06-06*
