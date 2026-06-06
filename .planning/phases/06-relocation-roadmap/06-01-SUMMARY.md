---
phase: "06"
plan: "01"
subsystem: "shared/engine"
tags: [tdd, red-tests, roadmap, contract, wave-0]
dependency_graph:
  requires: []
  provides: ["shared/engine/roadmap.test.ts — Wave 0 RED contract for ROAD-01/02/03 + D-02/D-05/D-07 + VISA-04"]
  affects: ["shared/engine/roadmap.ts (Wave 1 implementation must satisfy these tests)"]
tech_stack:
  added: []
  patterns: ["RED test file with globals:true (no vitest import)", ".js suffix on relative TS imports", "User-facing detail string assertions (not intermediate values)"]
key_files:
  created: ["shared/engine/roadmap.test.ts"]
  modified: []
decisions:
  - "Assert compiled roadmap.sections[..].steps[..].detail string, never intermediate monthsToFund (06-PATTERNS.md + project MEMORY)"
  - "negative savings test asserts 'deficit' presence and absence of /\\d+ months/ pattern to allow legitimate prose while blocking faked countdown"
  - "visa UPL test checks for /informational only|not legal advice/i AND /licensed attorney/i presence; blocks /you (are|will be) eligible/i and /we (recommend|advise) you/i"
  - "enrich preserves authored split into 4 it() blocks to test accept + three distinct rejection cases separately"
metrics:
  duration: "12min"
  completed_date: "2026-06-06"
  tasks: 1
  files: 1
---

# Phase 06 Plan 01: Author Wave 0 RED Test Suite Summary

**One-liner:** Vitest RED contract locking all Phase 6 roadmap engine behaviors via 10 unit tests across 5 describe blocks before any implementation exists.

## What Was Built

Created `shared/engine/roadmap.test.ts` — the Wave 0 RED test suite that locks every Phase 6 engine behavior before `shared/engine/roadmap.ts` is implemented. Imports `buildRoadmap` and `acceptEnrichment` from `./roadmap.js` (intentionally unresolved = RED state). All 7 canonical `-t` test name substrings from `06-VALIDATION.md` are honored verbatim.

### Test Coverage

| Test (it title contains) | Requirement | Description |
|--------------------------|-------------|-------------|
| "covered pair" | ROAD-01 | 6 sections in canonical order; every step has non-empty detail |
| "threads numbers" | ROAD-01 | profession in jobs detail; savings figure in timeline/financial detail |
| "fallback" | ROAD-01/D-07 | uncovered pair → GENERIC_TEMPLATE; 6 sections, no throw |
| "negative savings" | D-02 | deficit reframe; no fabricated "N months" countdown |
| "offline deterministic" | ROAD-03 | two identical calls return deeply-equal output |
| "enrich preserves authored" | ROAD-02/D-05 | accept valid; throw on length mismatch, label mutation, sourceUrl mutation |
| "visa UPL" | VISA-04 | informational-only + licensed attorney text; no personalized legal-advice phrasing |

### Fixture Set

- `profile`: US citizen, Software Engineer, rent, full required Profile fields
- `topUK`: covered MatchResult (London, UK), `monthlySavings: 1400` (positive)
- `topUS`: covered MatchResult (Austin, TX), `monthlySavings: 2200` (positive)
- `topNegativeSavings`: spread of topUK with `monthlySavings: -500`
- `topGermany`: uncovered MatchResult (Berlin, Germany) — outside authored template set

## Verification Results

```
npx vitest run shared/engine/roadmap.test.ts
→ RED (import unresolved, as expected) ✓

npm test
→ Test Files  1 failed | 10 passed (11)
→ Tests  83 passed (83)
→ Only the new roadmap suite is RED; existing 83 tests unaffected ✓
```

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan authors tests only; no implementation stubs created.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes. Test authoring only.

## Self-Check: PASSED

- [x] `shared/engine/roadmap.test.ts` exists
- [x] Commit `064fdea` verified in git log
- [x] All 7 canonical it() substrings present (grep confirms)
- [x] Suite is RED: "Failed to resolve import './roadmap.js'"
- [x] Existing 83 tests unaffected (npm test passes)
- [x] No vitest import statement in test file (globals:true)
- [x] All relative imports use .js suffix
- [x] No assertion on bare `monthsToFund` (grep confirms none)
