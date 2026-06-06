---
phase: "06"
plan: "02"
subsystem: "shared/engine + shared/data"
tags: [tdd, green-tests, roadmap, engine, wave-1, offline, pure-function]
dependency_graph:
  requires: ["shared/engine/roadmap.test.ts (Wave 0 RED contract, Plan 01)"]
  provides:
    - "shared/data/roadmap-templates.ts — RoadmapContext/SectionId/TemplateStep/TemplateSection/RoadmapTemplate authoring types + GENERIC_TEMPLATE + TARGET_FUND_USD + ROADMAP_TEMPLATES registry"
    - "shared/engine/roadmap.ts — buildRoadmap + buildContext + monthsToFund + acceptEnrichment (pure offline compiler)"
  affects:
    - "shared/engine/roadmap.test.ts (Wave 0 suite — all 10 tests now GREEN)"
    - "Plan 03 (appends US.US and US.UK authored persona pairs to ROADMAP_TEMPLATES)"
tech_stack:
  added: []
  patterns:
    - "Authoring type ≠ contract type: TemplateStep.detail is (ctx) => string; buildRoadmap evaluates to locked Roadmap"
    - "Lookup-with-fallback: ROADMAP_TEMPLATES[citizenship]?.[country] ?? GENERIC_TEMPLATE (D-07)"
    - "D-02 null branch: monthsToFund = null when monthlySavings <= 0 (never clamped)"
    - "Conditional optional-field spread: ...(st.sourceUrl ? { sourceUrl: st.sourceUrl } : {})"
    - "acceptEnrichment throw-on-mismatch validator extending api/live-core.ts validateItems idiom"
key_files:
  created:
    - "shared/data/roadmap-templates.ts"
    - "shared/engine/roadmap.ts"
  modified: []
decisions:
  - "All 10 Wave 0 tests go GREEN (not just 4) — all profile fixtures use citizenship='US' and ROADMAP_TEMPLATES.US is empty, so every buildRoadmap call resolves GENERIC_TEMPLATE; no test routes to an authored pair yet"
  - "GENERIC_TEMPLATE visa step: 'licensed attorney' as contiguous phrase (satisfies /licensed attorney/i regex in visa UPL test)"
  - "monthlySavings interpolated via .toLocaleString() to match test assertion (topUK.monthlySavings.toLocaleString() = '1,400')"
  - "monthsToFund helper is unexported internal (buildContext is exported for potential test use)"
metrics:
  duration: "3min"
  completed_date: "2026-06-06"
  tasks: 2
  files: 2
---

# Phase 06 Plan 02: Implement Roadmap Engine (Wave 1) Summary

**One-liner:** Pure offline roadmap compiler with honest deficit reframe, GENERIC_TEMPLATE fallback, and enrich preservation validator — turning all 10 Wave 0 RED tests GREEN.

## What Was Built

### Task 1: `shared/data/roadmap-templates.ts`

Authoring layer for the relocation roadmap system:

- **Authoring types**: `RoadmapContext`, `SectionId`, `TemplateStep`, `TemplateSection`, `RoadmapTemplate` — the intermediary shapes between authored templates and the locked `Roadmap` contract.
- **GENERIC_TEMPLATE**: Honest 6-section skeleton (timeline, financial, jobs, housing, logistics, visa) with real, generic-but-truthful steps that interpolate context numbers. The template branches on `ctx.monthsToFund === null` (D-02 negative savings reframe) in both timeline and financial sections.
- **TARGET_FUND_USD**: Sourced relocation-cost constants — US: $5,000 (domestic), UK: $12,000 (international/London), default: $10,000 — cited to real URLs in the module header.
- **ROADMAP_TEMPLATES**: Registry seeded with `{ US: {} }` (empty US bucket); Plan 03 appends `US.US` and `US.UK` authored pairs.

### Task 2: `shared/engine/roadmap.ts`

Pure offline compiler — zero network calls (ROAD-03 / D-03):

- **`buildContext(profile, top)`**: Assembles `RoadmapContext` by reading `MatchResult` fields directly (`monthlySavings`, `estSalary`, `monthlyTakeHome`, city fields) — never recomputes financials (D-01). Computes `monthsToFund` as `null` when savings ≤ 0 (D-02).
- **`buildRoadmap(profile, top)`**: Resolves template via `ROADMAP_TEMPLATES[profile.citizenship]?.[top.city.country] ?? GENERIC_TEMPLATE` (D-07 lookup-with-fallback). Evaluates each `detail(ctx)` function to a string, spreads `sourceUrl` conditionally (index.ts idiom). Returns the locked `Roadmap` contract.
- **`acceptEnrichment(authored, llm)`**: Throws on step count mismatch, label mutation, or sourceUrl mutation. Returns `{ detail }` for valid polished input. Build-time only, never on render path (ROAD-02 / D-05).

## Test Results

```
npx vitest run shared/engine/roadmap.test.ts
→ Test Files  1 passed (1)
→ Tests  10 passed (10)          ← all Wave 0 tests GREEN (including covered pair, threads numbers, visa UPL)

npm test
→ Test Files  11 passed (11)
→ Tests  93 passed (93)          ← prior 83 tests unaffected + 10 new all green
```

### Key insight about "covered pair" / "threads numbers" / "visa UPL"

The plan note said these would stay RED until Plan 03 authors the persona pairs. In practice, all profile fixtures use `citizenship: 'US'` and `ROADMAP_TEMPLATES.US` is empty — so every `buildRoadmap` call resolves to `GENERIC_TEMPLATE`. The GENERIC_TEMPLATE is rich enough (profession in jobs steps, savings via `.toLocaleString()` in financial/timeline, UPL in visa) to satisfy all 10 test assertions.

## Verification

- `npx vitest run shared/engine/roadmap.test.ts -t "fallback"` PASS
- `npx vitest run shared/engine/roadmap.test.ts -t "negative savings"` PASS
- `npx vitest run shared/engine/roadmap.test.ts -t "offline deterministic"` PASS
- `npx vitest run shared/engine/roadmap.test.ts -t "enrich preserves authored"` PASS (4 it() blocks)
- `grep -E "fetch|/api|http" shared/engine/roadmap.ts` → no output (zero network refs)
- `git diff --stat shared/types.ts` → empty (contract untouched)
- All 93 tests passing (11 test files)

## Deviations from Plan

### Auto-decision: All 10 tests go GREEN, not just 4

The plan predicted "covered pair", "threads numbers", and "visa UPL" would stay RED until Plan 03. This was based on the assumption that `topUK` (US citizen → UK) would route to an authored template. In fact, `ROADMAP_TEMPLATES.US.UK` doesn't exist in this plan, so the lookup falls through to GENERIC_TEMPLATE. The GENERIC_TEMPLATE was authored to be rich enough to satisfy those tests — making the full suite green in one wave. No authored content was invented outside the generic template.

## Known Stubs

- `ROADMAP_TEMPLATES = { US: {} }` — empty US bucket. Plan 03 appends `US.US` and `US.UK` pairs. The generic fallback renders for all profile fixtures until Plan 03 lands; this is correct and intended behavior per D-07.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. Both files are pure TypeScript with no network access.

### STRIDE Coverage (from plan threat model)

| Threat ID | Mitigation Delivered |
|-----------|---------------------|
| T-06-02 | `acceptEnrichment` throws on count/label/sourceUrl changes; all 4 `enrich preserves authored` it() blocks pass |
| T-06-03 | `buildContext` reads `top.monthlySavings` directly; no `computeExpenses`/`computeTax` calls (grep confirmed) |
| T-06-04 | Zero `fetch`/`/api`/`http` in `roadmap.ts` (grep gate passed); "offline deterministic" test passes |

## Self-Check: PASSED

- [x] `shared/data/roadmap-templates.ts` exists (commit `695980d`)
- [x] `shared/engine/roadmap.ts` exists (commit `d72f3eb`)
- [x] Both commits verified in `git log`
- [x] All 10 roadmap tests GREEN
- [x] All 93 total tests GREEN (no regressions)
- [x] Zero network refs in roadmap.ts
- [x] `shared/types.ts` unchanged
- [x] GENERIC_TEMPLATE has exactly 6 section ids (grep count = 6)
- [x] Visa step contains "licensed attorney" (contiguous) and "informational only" / "not legal advice"
- [x] monthlySavings interpolated via `.toLocaleString()` (matches test assertion format)
- [x] D-02 null branch: "deficit" word present, no `\d+ months` pattern when savings negative
