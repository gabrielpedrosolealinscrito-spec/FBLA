---
phase: 03-matching-us-financial-spine
plan: "03"
subsystem: shared/engine
tags: [financial-model, tdd, tax, fica, expenses, registry]
dependency_graph:
  requires: ["03-01", "03-02"]
  provides: ["shared/engine/financial.ts"]
  affects: ["shared/engine/index.ts", "Phase 4 country models"]
tech_stack:
  added: []
  patterns: ["progressive-bracket-iteration", "pluggable-registry", "pure-ts-functions"]
key_files:
  created:
    - shared/engine/financial.ts
  modified: []
decisions:
  - "TY2026 single-filer brackets applied to household income — documented simplification (MFJ deferred)"
  - "FICA applied as flat 7.65%; SS wage cap deferred per D-08 (minimal error in demo salary range)"
  - "costIndex<=0 guard uses fallback idx=1 (T-3-04) rather than throwing — matches V5 NaN-propagation mitigation"
metrics:
  duration: 8min
  completed: "2026-06-01"
  tasks: 1
  files: 1
---

# Phase 03 Plan 03: US Financial Model Summary

**One-liner:** TY2026 progressive federal tax + flat state % + FICA 7.65% + cost-indexed expense breakdown implemented as pure TS with pluggable `FINANCIAL_MODELS` registry; all 6 FIN-01 unit tests GREEN.

## What Was Built

`shared/engine/financial.ts` — the US financial model spine for Phase 3.

Key exports:
- `computeFederalTax(grossIncome)` — TY2026 single-filer brackets with $16,100 standard deduction (OBBBA-amended). Verified: `computeFederalTax(110000) === 15370`.
- `computeUSTax(grossIncome, stateRate)` — federal + flat state % + FICA 7.65%.
- `computeSalary(profile, city)` — `BASE_SALARIES[profession] ?? 55000` × `costIndex/100`, rounded.
- `computeUSExpenses(profile, city)` — cost-indexed monthly breakdown (rent, food, transport, utilities, insurance, personal, childcare, pets, debtPay, total); `costIndex <= 0` guarded (T-3-04).
- `FinancialModel` interface + `US_FINANCIAL_MODEL` + `FINANCIAL_MODELS` registry — pluggable hook for Phase 4 country models.

## Test Results

```
npx vitest run shared/engine/financial.test.ts
 Test Files  1 passed (1)
      Tests  6 passed (6)
```

All 6 FIN-01 assertions pass including bracket math check (±1), zero-income edge, standard-deduction edge, state tax additive test, positive-tax sanity, and NaN guard for `costIndex=0`.

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Implement financial.ts — TDD GREEN | 3d0a969 | shared/engine/financial.ts |

## Deviations from Plan

None — plan executed exactly as written. The implementation follows D-08 module interface verbatim, bracket array from RESEARCH D-07, expense port from PATTERNS.md, and all threat mitigations (T-3-04, T-3-05) applied as specified.

## Known Stubs

None. `computeUSExpenses` uses live `city.medianRent`/`medianHome` and `profile.*` values — no hardcoded placeholders.

## Threat Flags

None new. T-3-04 (NaN propagation via costIndex=0) and T-3-05 (negative grossIncome) are both mitigated as specified in the threat register.

## Self-Check: PASSED

- [x] `shared/engine/financial.ts` exists and exports all required symbols
- [x] Commit `3d0a969` exists: `feat(03-03): implement US financial model — TY2026 progressive brackets GREEN`
- [x] `npx vitest run shared/engine/financial.test.ts` → 6 passed, 0 failed
- [x] `npx tsc --noEmit -p tsconfig.json` → exits 0
- [x] Decisions recorded to STATE.md (3 decisions via `state.add-decision --summary`)

### Non-blocking State Handler Notes

- `state.update-progress` → "Progress field not found" — STATE.md lacks a progress-bar field; pre-existing format difference, not regression.
- `state.record-session` → "No session fields found" — same root cause. Both are out-of-scope from plan success criteria.
