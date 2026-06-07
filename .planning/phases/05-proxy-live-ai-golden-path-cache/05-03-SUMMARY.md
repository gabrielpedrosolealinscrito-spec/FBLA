---
phase: 05
plan: 03
subsystem: live-ai-layer
tags: [tdd-green, client-fetch, golden-path-fallback, potentialapp-rewire, D-10, parallel-fan-out]
dependency_graph:
  requires:
    - "05-01: tests/live-fallback.test.ts RED contract + golden-path JSON keyed Austin TX / London UK"
    - "05-02: api/live.ts POST handler returning { items: [...] } on res.ok"
  provides:
    - "src/lib/fetchLive.js: fetchCategoryLive(city, category, profession) with 20s timeout + LIVE-04 fallback"
    - "src/screens/PotentialApp.jsx: Pull live data button, parallel fan-out, D-10 source-text cards"
    - "tests/live-fallback.test.ts: GREEN (was RED in Plan 01)"
    - "Full test suite: 10/10 files, 83/83 tests GREEN"
  affects:
    - "Plan 04: capture script + manual smoke checkpoint can now target /api/live via fetchCategoryLive"
    - "PotentialApp: nightlife/outdoors/food sections removed; button-triggered parallel fetch model live"
tech_stack:
  added:
    - "src/lib/fetchLive.js: pure async JS module, no new deps"
  patterns:
    - "20s AbortController timeout (not 7s — web_search at max_uses:3 takes 8-20s, Pitfall 2)"
    - "goldenPath[category]?.[city.name] ?? [] — full city.name verbatim lookup (city-key contract)"
    - "D-04/D-05: parallel forEach fan-out — each category updates state independently"
    - "D-10: source rendered as text, no url anchor, no image block"
    - "D-09: only 3 shipped categories fired (jobs, housing_*, dayinlife); nightlife/outdoors/food removed"
    - "AIList null before first pull — no blank/stuck state (FOUND-04/SC4)"
key_files:
  created:
    - "src/lib/fetchLive.js"
  modified:
    - "src/screens/PotentialApp.jsx"
decisions:
  - "20s AbortController timeout in fetchLive.js — 7s reliably aborts live web_search path (Pitfall 2 from RESEARCH)"
  - "AIList returns null (not a hint text) before first pull — prevents permanent stuck state with new button model"
  - "pullLiveData uses forEach+async to fire categories in parallel — not Promise.all, so one failure/slow never blocks others"
metrics:
  duration: "~15min"
  completed: "2026-06-05"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 05 Plan 03: Client Fetch + PotentialApp Rewire — Summary

**One-liner:** fetchCategoryLive with 20s timeout and golden-path fallback (LIVE-04) wired into PotentialApp via a single "Pull live data" button that fans out to jobs/housing/dayinlife concurrently, with D-10 source-text cards and nightlife/outdoors/food sections removed.

---

## Tasks Completed

| Task | Commit | Status | Key Deliverable |
|------|--------|--------|-----------------|
| 1: src/lib/fetchLive.js — fetch + fallback | 2fe592d | Done | fetchCategoryLive, 20s timeout, live-fallback.test.ts GREEN |
| 2: PotentialApp.jsx rewire | 887680a | Done | Pull live data button, parallel fan-out, D-10 cards, build clean |

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Verification Results

### Automated (GREEN)

```
npm test -- tests/live-fallback.test.ts  → 1 passed (4 tests)
npm test (full suite)                    → 10 passed (83 tests)
npm run build                            → dist/assets/index-DVx7rMhX.js 290.95 kB, built in 90ms
grep "Pull live data"                    → FOUND
grep "fetchCategoryLive"                 → FOUND
! grep "View listing"                    → CONFIRMED absent
! grep "coming_soon"                     → CONFIRMED absent
```

### Acceptance Criteria

- [x] src/lib/fetchLive.js exports fetchCategoryLive
- [x] tests/live-fallback.test.ts exits 0 (was RED in Plan 01) — 4/4 tests pass
- [x] Golden-path lookup key is full city.name (`goldenPath[category]?.[city.name]`) — no suffix stripping
- [x] AbortController timeout is 20000ms
- [x] No React/JSX in fetchLive.js (pure async)
- [x] "Pull live data" button present; onClick fires jobs + housing_* + dayinlife concurrently
- [x] Section header onClick no longer calls a fetch (expand toggle only)
- [x] No "View listing" anchor in file
- [x] No "coming_soon" branch in file
- [x] Job and housing card renderers render source as text
- [x] ItemCard no longer accepts/renders url or image
- [x] nightlife/outdoors/food Sections removed
- [x] npm run build exits 0

---

## Known Stubs

None in the files created/modified by this plan. The golden-path data in `data/golden-path/demo-results.json` remains placeholder content (tracked in Plan 01 summary). The capture script (Plan 04) replaces it with real proxy output before pitch day.

---

## Threat Surface Scan

No new network endpoints or auth paths introduced. The `fetchCategoryLive` module calls the same-origin `/api/live` (planned boundary T-5-key). All listing fields rendered as React text children — never dangerouslySetInnerHTML; url/image removed entirely (T-5-xss mitigated). AIList always resolves to golden-path or [] — no blank/stuck panel (T-5-blank mitigated).

---

## Self-Check: PASSED

Files exist:
- src/lib/fetchLive.js: FOUND
- src/screens/PotentialApp.jsx: FOUND (modified)

Commits exist:
- 2fe592d: FOUND (feat(05-03): fetchCategoryLive)
- 887680a: FOUND (feat(05-03): rewire PotentialApp)
