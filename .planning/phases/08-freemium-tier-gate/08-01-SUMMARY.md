---
phase: 08
plan: 01
subsystem: freemium-tier-gate
tags: [tier-gate, tdd, contract, types, tests, pitch-docs]
dependency_graph:
  requires: []
  provides:
    - shared/types.ts canAccess + TIER_FEATURES + TIER_RUNS_MAP contract
    - shared/tierGate.test.ts 20-assertion GREEN logic suite
    - tests/lock-gate.test.tsx RED gate (Wave 1 closes)
    - tests/demo-switcher.test.tsx RED gate (Wave 2 closes)
    - tests/runs-badge.test.tsx RED gate (Wave 2 closes)
    - pitch/business-model.md D-10/D-12 synced
    - pitch/qa-bank.md D-12 synced
  affects:
    - src/components/LockGate.jsx (Wave 1 - test gate target)
    - src/components/DemoTierSwitcher.jsx (Wave 2 - test gate target)
    - src/components/RunsBadge.jsx (Wave 2 - test gate target)
tech_stack:
  added: []
  patterns:
    - pure-function contract in shared/types.ts (TIER_ORDER + canAccess)
    - as const TIER_FEATURES for exhaustive type checking
    - Wave-0 RED scaffold: component tests import missing modules as phase gate
key_files:
  created:
    - shared/tierGate.test.ts
    - tests/lock-gate.test.tsx
    - tests/demo-switcher.test.tsx
    - tests/runs-badge.test.tsx
  modified:
    - shared/types.ts
    - pitch/business-model.md
    - pitch/qa-bank.md
decisions:
  - canAccess placed in shared/types.ts (not src/lib/) — tsconfig includes only shared/** + api/**
  - TIER_RUNS_MAP is a plain Record with static label strings (not a struct with runsLeft/runsTotal)
  - Component RED tests use real @testing-library/react assertions — not empty stubs
  - 30-day money-back guarantee added to business-model.md (OQ-1 resolved to Option A)
metrics:
  duration: 15min
  completed: 2026-06-06
  tasks: 3
  files: 7
---

# Phase 8 Plan 01: Tier-Gate Contract + Wave-0 Test Scaffold Summary

**One-liner:** Pure canAccess/TIER_FEATURES/TIER_RUNS_MAP contract in shared/types.ts, 20-assertion GREEN logic suite, three RED component gates for Waves 1–2, and pitch doc internal-consistency fixes (D-10/D-12).

---

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Extend shared/types.ts with tier-gate contract | 8e53f64 | shared/types.ts |
| 2 | Write Wave-0 test scaffold (logic GREEN, components RED) | b6d44ba | shared/tierGate.test.ts, tests/lock-gate.test.tsx, tests/demo-switcher.test.tsx, tests/runs-badge.test.tsx |
| 3 | Sync pitch docs to demo copy | 3b7dab2 | pitch/business-model.md, pitch/qa-bank.md |

---

## Test Results (Wave 0)

### Logic tests — GREEN (expected)

```
npm test -- shared/tierGate.test.ts

 Test Files  1 passed (1)
      Tests  20 passed (20)
```

- 16 `canAccess` tier-pair assertions all pass
- 4 `rankGate` `TIER_FEATURES.rankShowUpTo` assertions all pass

### Component tests — RED (expected and correct)

```
npm test -- tests/lock-gate.test.tsx tests/demo-switcher.test.tsx tests/runs-badge.test.tsx

 Failed Suites 3

Error: Failed to resolve import "../src/components/LockGate.jsx" ...
Error: Failed to resolve import "../src/components/DemoTierSwitcher.jsx" ...
Error: Failed to resolve import "../src/components/RunsBadge.jsx" ...
```

The three component test files fail with `Failed to resolve import` (module-not-found) — this is the designed outcome. The components do not exist yet; Waves 1–2 create them, which will turn these gates GREEN.

**The full `npm test` exits non-zero because of these three expected-RED files. This is success for this plan, not failure.**

---

## Contracts Delivered

### canAccess (shared/types.ts)

```typescript
const TIER_ORDER: Record<Tier, number> = { free: 0, basic: 1, plus: 2, premium: 3 };
export const canAccess = (active: Tier, required: Tier): boolean =>
  TIER_ORDER[active] >= TIER_ORDER[required];
```

### TIER_FEATURES (shared/types.ts)

```typescript
export const TIER_FEATURES = {
  rankShowUpTo: { free: 1, basic: 3, plus: Infinity, premium: Infinity },
} as const;
```

### TIER_RUNS_MAP (shared/types.ts)

```typescript
export const TIER_RUNS_MAP: Record<Tier, string | null> = {
  free: null,
  basic: "Basic · 1 of 1 run",
  plus: "Plus · 2 of 3 runs left",
  premium: "Premium · unlimited",
};
```

---

## Pitch Doc Changes

### business-model.md
- **Line 42 (pricing table):** Basic description changed from "Single most optimal city + complete financial snapshot" to "Top 3 cities fully revealed (name + why + core financials for each)" per D-12.
- **Line 48 (note):** "No money-back guarantee at launch" replaced with "Potential offers a 30-day money-back guarantee (per OQ-1 / D-10)" — OQ-1 resolved to Option A (add guarantee, align docs).
- **Conversion ladder (~line 120):** "$0.99 Basic — full financial snapshot for the #1 city" updated to "top 3 cities fully revealed (name + why + core financials)" per D-12.

### qa-bank.md
- **Q9 answer:** Added top-3-cities framing: "Basic ($0.99) unlocks top 3 cities fully — name, 'why it matched,' and core financials for each." Previously Q9 had no Basic feature description (it focused on the $0.99 psychology). No stale "#1 city" copy existed to remove.

---

## Deviations from Plan

None — plan executed exactly as written. The intentional RED outcome for the three component test files is documented in the critical_note, the plan tasks, and this SUMMARY.

---

## TDD Gate Compliance

This plan is contract-first by design: `feat(08-01)` lands the contract (shared/types.ts), then `test(08-01)` lands the full test suite. The normal TDD order (test RED → implementation GREEN) is intentionally inverted for the logic contract (canAccess is a 3-line pure function verifiable by inspection before tests). The three component tests ARE the RED gate that Waves 1–2 close — so the overall phase follows RED/GREEN correctly at the wave level, not just the plan level.

No TDD gate violations: both commits exist in the log, behavior is well-specified in the test files.

---

## Known Stubs

None. No UI is rendered in this plan. All deliverables are typed contracts, test files, or text document corrections.

---

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. `canAccess` and `TIER_FEATURES` are pure in-memory typed constants. No new threat surface beyond what is documented in the plan's threat_model (T-08-01/T-08-02/T-08-05).

---

## Self-Check

Files created:
- shared/tierGate.test.ts: FOUND
- tests/lock-gate.test.tsx: FOUND
- tests/demo-switcher.test.tsx: FOUND
- tests/runs-badge.test.tsx: FOUND

Commits:
- 8e53f64 (feat: tier-gate contract): FOUND
- b6d44ba (test: wave-0 scaffold): FOUND
- 3b7dab2 (docs: pitch docs sync): FOUND

## Self-Check: PASSED
