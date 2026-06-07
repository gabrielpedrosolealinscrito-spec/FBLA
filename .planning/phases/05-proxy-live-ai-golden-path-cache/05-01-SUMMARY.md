---
phase: 05
plan: 01
subsystem: live-ai-layer
tags: [tdd-red, golden-path, anthropic-sdk, offline-fallback, test-contracts]
dependency_graph:
  requires: []
  provides:
    - "@anthropic-ai/sdk installed as prod dep (unblocks api/live.ts compile in Plan 02)"
    - "resolveJsonModule:true in tsconfig.json (unblocks JSON import in api/live.ts)"
    - "data/golden-path/demo-results.json (offline fallback fixture for Plans 02-04 and LIVE-04)"
    - "data/golden-path/demo-profile.json (provisional demo persona for capture script)"
    - "tests/live-validation.test.ts RED contract for validateItems (Plan 02)"
    - "tests/live-proxy.test.ts RED contract for /api/live handler (Plan 02)"
    - "tests/live-fallback.test.ts RED contract for fetchCategoryLive (Plan 03)"
  affects:
    - "Plans 02-04: module contracts are now pinned by the RED tests"
    - "tsconfig.json: resolveJsonModule added (api/ + shared/ TypeScript compile)"
    - "package.json: @anthropic-ai/sdk 0.101.0 added as prod dep"
tech_stack:
  added:
    - "@anthropic-ai/sdk 0.101.0 (prod dep, api/-only)"
    - "resolveJsonModule:true (tsconfig.json compilerOptions)"
    - "data/golden-path/ directory with demo-results.json and demo-profile.json"
    - "tests/ directory with three Wave 0 vitest test files"
  patterns:
    - "City-key contract: full city.name strings (e.g. 'Austin, TX') as golden-path JSON keys"
    - "RED-first Wave 0 TDD: test files lock module signatures before modules exist"
    - "Single-source fallback fixture: same JSON imported by proxy (Plan 02) and client (Plan 03)"
key_files:
  created:
    - "data/golden-path/demo-results.json"
    - "data/golden-path/demo-profile.json"
    - "tests/live-validation.test.ts"
    - "tests/live-proxy.test.ts"
    - "tests/live-fallback.test.ts"
  modified:
    - "package.json (+@anthropic-ai/sdk)"
    - "package-lock.json"
    - "tsconfig.json (+resolveJsonModule)"
decisions:
  - "Use full city.name strings as golden-path JSON keys ('Austin, TX'/'Lisbon, Portugal') — load-bearing, matches runtime proxy/client lookup goldenPath[category][city.name]"
  - "golden-path job/housing values are arrays of 3-4 items; dayinlife is a single narrative string (satisfies validateItems contract shapes)"
  - "No url or image fields in golden-path JSON (D-08/D-10: identical offline/live render, no live-link anchor)"
  - "live-proxy.test.ts imports golden-path fixture directly for assertions (avoids divergent literals that would produce wrong-RED)"
  - "Provisional demo persona: Software Engineer / age 28 / housing:rent (per D-06 guidance; must be finalized before capture script)"
metrics:
  duration: "~20min"
  completed: "2026-06-05"
  tasks_completed: 3
  files_created: 5
  files_modified: 3
---

# Phase 05 Plan 01: SDK Foundation, Golden-Path Cache & Wave 0 RED Tests — Summary

**One-liner:** @anthropic-ai/sdk installed, resolveJsonModule enabled, valid-shaped offline fallback fixture keyed by full city.name strings, and three Wave 0 vitest test files committed RED to lock the validateItems/handler/fetchCategoryLive contracts before Wave 2 implements them.

---

## Tasks Completed

| Task | Commit | Status | Key Deliverable |
|------|--------|--------|-----------------|
| 1: Add SDK dep + resolveJsonModule | 568bb36 | Done | package.json + tsconfig.json |
| 2: Create golden-path cache + demo persona | 4063c83 | Done | data/golden-path/demo-results.json + demo-profile.json |
| 3: Author Wave 0 RED test files | 3ecbd3a | Done | tests/live-{validation,proxy,fallback}.test.ts |

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Wave 0 RED Confirmation

`npm test` run after Task 3 commit confirms:

```
Test Files  3 failed | 7 passed (10)
      Tests  68 passed (68)
```

The three new suites fail at **collection time** (import-not-resolved), not at test execution:

- `tests/live-validation.test.ts`: `Failed to resolve import "../api/live-core" from "tests/live-validation.test.ts". Does the file exist?`
- `tests/live-proxy.test.ts`: `Failed to resolve import "../api/live" from "tests/live-proxy.test.ts". Does the file exist?`
- `tests/live-fallback.test.ts`: `Failed to resolve import "../src/lib/fetchLive" from "tests/live-fallback.test.ts". Does the file exist?`

This is the correct RED state. The 7 pre-existing suites (68 tests) remain green — the Wave 0 test files have no collateral impact.

---

## Known Stubs

**demo-results.json — provisional placeholder data (D-07 capture-script open dependency)**

| File | Nature | Reason |
|------|--------|--------|
| data/golden-path/demo-results.json | Hand-authored placeholder job/housing/dayinlife content | Will be replaced by `scripts/capture-golden-path.ts` calling the real proxy before pitch day (D-07). The shape is production-correct; the content is fabricated. |
| data/golden-path/demo-profile.json | Provisional persona (Software Engineer, age 28, housing:rent) | Must be finalized against the rehearsed demo script before capture script runs (D-06/D-07 open dependency). |

The placeholder data fulfills LIVE-04 (fallback renders non-blank content) and lets the Wave 0 tests import a real fixture. It is not the pitch-day cache — that is generated by the capture script (Plan 04).

---

## CRITICAL FLAG: Lisbon vs London City Key Mismatch

**This is a blocker for the international-city fallback path (SC4/SC5/LIVE-04).**

The plan mandates golden-path keys `"Austin, TX"` and `"Lisbon, Portugal"` (D-06 working assumption). However, inspection of `shared/data/cities.ts` reveals:

- The only international city in the dataset is `"London, UK"` (cities.ts header: "28 curated US cities (+1 international: London)")
- There is NO `"Lisbon, Portugal"` entry in the cities data
- The CONTEXT.md (D-06) explicitly calls Lisbon a "working assumption" pending confirmation against the demo script

**Impact:** At runtime, `goldenPath[category][city.name]` for the international city will look up `goldenPath[category]["London, UK"]` — which will be `undefined` — and fall through to `[]` (empty array). The offline fallback for the international city will render blank, violating FOUND-04/SC4/LIVE-04.

**Action required before Plans 02-04 or the capture script runs:**
1. Either add a `"Lisbon, Portugal"` city entry to `shared/data/cities.ts`
2. Or update the golden-path keys to `"London, UK"` (and re-pin the demo-profile.json cities)
3. Or confirm the intended international city and reconcile

This plan correctly follows the plan spec (uses "Lisbon, Portugal" as specified), but the mismatch is flagged here so it is not lost.

---

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. The golden-path JSON is authored, committed content (no runtime input). The @anthropic-ai/sdk is a production dep added to the repo supply chain — verified Approved in the Plan's Package Legitimacy Audit (official @anthropics npm org, confirmed via npm view + official Anthropic docs).

---

## Self-Check: PASSED

Files exist:
- data/golden-path/demo-results.json: FOUND
- data/golden-path/demo-profile.json: FOUND
- tests/live-validation.test.ts: FOUND
- tests/live-proxy.test.ts: FOUND
- tests/live-fallback.test.ts: FOUND

Commits exist:
- 568bb36: FOUND (chore: SDK + resolveJsonModule)
- 4063c83: FOUND (feat: golden-path cache)
- 3ecbd3a: FOUND (test: Wave 0 RED tests)
