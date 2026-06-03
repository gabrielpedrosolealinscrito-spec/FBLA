---
phase: 03-matching-us-financial-spine
plan: 01
subsystem: test-infrastructure
tags: [vitest, testing, tdd, engine, red-baseline]
dependency_graph:
  requires: []
  provides: [vitest-runner, engine-test-contracts, tdd-red-baseline]
  affects: [shared/engine/financial.ts, shared/engine/scoring.ts, shared/engine/dealbreakers.ts, shared/engine/index.ts]
tech_stack:
  added: [vitest@4.1.8, "@testing-library/react@16.3.2", "@testing-library/jest-dom", jsdom]
  patterns: [tdd-red-first, globals-vitest, jsdom-environment]
key_files:
  created:
    - src/test-setup.js
    - shared/engine/financial.test.ts
    - shared/engine/scoring.test.ts
    - shared/engine/dealbreakers.test.ts
    - shared/engine/index.test.ts
  modified:
    - vite.config.js
    - package.json
    - package-lock.json
decisions:
  - "vitest installed as devDependency only (not runtime) behind human-verified package legitimacy gate"
  - "computeFederalTax(110000)=15370 (clean unit input) and Austin integration (estSalary=113300, monthlyTakeHome=7378) are distinct test values — never crossed"
  - "RED state confirmed by unresolved import errors for engine modules that don't exist yet"
  - "summerHighF/winterLowF used for dealbreaker checks, NOT avgTemp (D-11)"
metrics:
  duration: "12min"
  completed: "2026-06-02T01:51:39Z"
  tasks: 3
  files: 8
---

# Phase 03 Plan 01: Test Infrastructure + Engine RED Scaffolds Summary

**One-liner:** vitest 4.x installed dev-only with jsdom config; four RED engine test files encoding TY2026 IRS brackets, contribution-sum invariant, Phoenix heat dealbreaker, and Austin D-07 integration figures.

---

## What Was Built

Wave 0 test infrastructure for the Phase 3 engine. No engine code was written — this plan creates the failing test baseline that Waves 2-3 turn GREEN.

### Task 1: Install vitest + testing-library (commit c83f839)

- `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- Node guard verified: all four packages in devDependencies, none in runtime dependencies
- Human legitimacy gate cleared before install (packages verified on npmjs.com)

### Task 2: Configure vitest in vite.config.js (commit 6aa7a71)

- Added `/// <reference types="vitest" />` triple-slash to vite.config.js
- Added `test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.js'] }`
- Kept existing `plugins: [react()]` and `server: { port: 5173 }` intact
- Created `src/test-setup.js` importing `@testing-library/jest-dom`
- `npx vitest run` executes and exits "No test files found" (expected; config valid)

### Task 3: Four RED test scaffolds (commit 19cb366)

**shared/engine/financial.test.ts (FIN-01)**
- `computeFederalTax(110000)` === 15370 ±1 (TY2026 bracket arithmetic: taxable=93900)
- `computeFederalTax(0)` === 0, `computeFederalTax(16100)` === 0 (standard deduction edge cases)
- `computeUSTax(75000, 9.85)` > `computeUSTax(75000, 0)` (state tax adds)
- V5 NaN guard: costIndex=0 must not produce NaN in any expense field

**shared/engine/scoring.test.ts (MATCH-03)**
- Contribution-sum invariant: `BASE_SCORE(50) + sum(contributions) === rawScore` within 0.01
- Locks that scoreFactors are actual additive terms, not post-hoc heuristic (Pitfall 1)

**shared/engine/dealbreakers.test.ts (MATCH-01/D-02)**
- Phoenix `summerHighF=107` triggers "No extreme heat" at 95°F threshold (uses summerHighF, not avgTemp)
- Pittsburgh `summerHighF=83` does NOT trigger (correct negative)
- `checkReconfirm` returns signal when penalty demotes raw #1; returns null when #1 unchanged

**shared/engine/index.test.ts (MATCH-01 — MVP happy-path e2e stand-in)**
- `rankCities(profile).results.length >= 1` (D-01: never empty)
- All results clamped to [0, 99] integers
- Results sorted by matchScore descending
- Austin integration: `estSalary ≈ 113300`, `monthlyTakeHome ≈ 7378` (city-adjusted; tolerance ±2)

---

## RED State Verification

```
npx vitest run shared/engine
→ 4 FAIL (all: "Failed to resolve import ./financial.js|./scoring.js|./dealbreakers.js|./index.js")
→ Tests: 0 run (no tests collected — modules absent prevents collection)
→ verify grep: "RED-as-expected"
```

The RED state is correct: failures are caused by unresolved engine module imports, not test syntax errors. All four test files were collected and attempted.

---

## Deviations from Plan

None — plan executed exactly as written.

The package legitimacy gate (Task 1) was pre-cleared by the human before this continuation agent ran. No additional deviations required.

---

## Known Stubs

None — this plan creates test files only, no implementation stubs.

---

## Threat Flags

None — no new network endpoints, auth paths, or schema changes introduced. The package legitimacy T-3-SC threat was mitigated by the human-verified checkpoint.

---

## Self-Check: PASSED

Files exist:
- FOUND: src/test-setup.js
- FOUND: shared/engine/financial.test.ts
- FOUND: shared/engine/scoring.test.ts
- FOUND: shared/engine/dealbreakers.test.ts
- FOUND: shared/engine/index.test.ts
- FOUND: vite.config.js (modified)

Commits exist:
- c83f839: chore(03-01): install vitest + testing-library as devDependencies
- 6aa7a71: chore(03-01): configure vitest test block and create test-setup
- 19cb366: test(03-01): write RED engine test scaffolds for all four modules
