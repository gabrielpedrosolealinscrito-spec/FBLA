---
phase: 07-visa-concierge
plan: 01
subsystem: shared/engine
tags: [visa, tdd, red-scaffold, engine, wave-0]
dependency_graph:
  requires: []
  provides: [shared/engine/visa.test.ts, shared/engine/visa.ts]
  affects: [Plans 02-03 (data authoring + engine implementation)]
tech_stack:
  added: []
  patterns: [RED test scaffold mirroring roadmap.test.ts, compiling stub pattern]
key_files:
  created:
    - shared/engine/visa.test.ts
    - shared/engine/visa.ts
  modified: []
decisions:
  - Exercised gradeD8/gradeExpressEntry via selectVisaPathways output only (not as named imports — they are private helpers)
  - Used toBeDefined() + non-null assertion (!) to keep tsc green while asserting on stub-empty results
  - Income fixtures set well away from boundary (110k/30k vs ~48.5k threshold) to avoid forward-coupling brittleness
  - Two deterministic tests (toEqual + not.toThrow) pass against stub — expected correct behavior per roadmap.test.ts analog
metrics:
  duration: 12min
  completed: 2026-06-06
  tasks_completed: 2
  files_created: 2
---

# Phase 7 Plan 01: RED Test Scaffold for Visa Screener Engine — Summary

**One-liner:** Wave 0 RED suite locking selectVisaPathways flagship model, D8/Express Entry graded-fit thresholds, and VISA-03 data integrity, with a compiling stub that flips module errors to assertion failures.

## What Was Built

**Task 1 — shared/engine/visa.test.ts (RED):** 14-test suite mirroring roadmap.test.ts. Imports only `{ selectVisaPathways }` from `./visa.js` and `type { Profile }` from `../types.js`. Locked behaviors:

- `selectVisaPathways — flagship model (VISA-01/VISA-02)`: Returns both Portugal D8 + Canada EE (length 2) for US citizen; matchedCountry='UK' still returns both (non-filtering invariant); unlisted citizenship 'XX' returns skeleton (length 1) with destinationCountry set to matchedCountry.
- `computeGradedFit — D8 (VISA-01 D-03)`: Strong fit at income=110k + hasRemote=true; Possible at income=30k + hasRemote=true; Long-shot at hasRemote=false.
- `computeGradedFit — Express Entry (VISA-01 D-03)`: Strong fit at age=28 + 'bachelors'; Possible at age=45 + 'bachelors'; Long-shot at age=45 + 'highschool'.
- `VISA_PATHWAYS data integrity (VISA-03)`: officialSources non-empty array; feeRangeUSD and processingTime non-empty strings; skeleton has non-empty officialSources.
- `offline deterministic`: toEqual on two consecutive calls; not.toThrow for all six fixtures.

**Task 2 — shared/engine/visa.ts (stub):** Compiling stub exporting GradedFit, VisaScreenerResult interfaces and selectVisaPathways() returning []. File header documents Wave 0 boundary, authored-truth constraint (D-05), and zero-network invariant.

## Verification Results

- `npm test` runs 14 visa.test.ts tests, 12 failing on AssertionError (RED, not module error)
- 2 tests passing: `offline deterministic` (toEqual [] === []) and `does not throw` — expected, matches roadmap.test.ts analog behavior
- `npx tsc --noEmit` exits 0 (stub + test compile under strict)
- `grep -c "education: 'bachelor'," shared/engine/visa.test.ts` returns 0 — no pre-Phase-2 string

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- `shared/engine/visa.ts` `selectVisaPathways()` returns `[]` — intentional Wave 0 stub. Plan 03 implements real grading logic.

## Threat Flags

None — pure TypeScript test/stub files, no rendered output, no network calls, no security-relevant surface introduced.

## Self-Check

- [x] `shared/engine/visa.test.ts` exists and contains `import { selectVisaPathways } from './visa.js'`
- [x] `shared/engine/visa.ts` exists and exports `selectVisaPathways`, `GradedFit`, `VisaScreenerResult`
- [x] Task 1 commit `44aec5e` exists in git log
- [x] Task 2 commit `1a7ffc0` exists in git log
- [x] `npx tsc --noEmit` exits 0
- [x] 12 tests RED on assertions, 0 module-resolution errors

## Self-Check: PASSED
