---
phase: 05
plan: 02
subsystem: live-ai-layer
tags: [tdd-green, anthropic-proxy, vercel-serverless, golden-path-fallback, input-validation]
dependency_graph:
  requires:
    - "05-01: @anthropic-ai/sdk installed, resolveJsonModule enabled, RED tests locked"
    - "data/golden-path/demo-results.json: keyed by Austin, TX / London, UK"
  provides:
    - "api/live-core.ts: validateItems, buildPrompt, extractJSON, sanitizeInput — pure, testable"
    - "api/live.ts: POST /api/live Vercel handler — web_search proxy + LIVE-04 fallback"
    - "tests/live-validation.test.ts: GREEN (was RED in Plan 01)"
    - "tests/live-proxy.test.ts: GREEN (was RED in Plan 01)"
  affects:
    - "Plans 03-04: proxy is live — client fetchLive and capture script can now target /api/live"
    - "Resolves STATE.md Lisbon/London blocker: suffix map handles UK→GB; golden-path JSON already keyed London, UK"
tech_stack:
  added:
    - "api/live-core.ts: pure TypeScript module, no new deps"
    - "api/live.ts: Vercel serverless handler using @anthropic-ai/sdk 0.101.0 (installed in Plan 01)"
  patterns:
    - "sanitizeInput outside try/catch — unknown category → 400 before any Anthropic call (V5)"
    - "countryFor(cityName) suffix-map for ISO alpha-2 derivation (no cityName==='Lisbon' comparison)"
    - "LIVE-04: catch-all returns goldenPath[category][cityName] ?? [] at HTTP 200, never 5xx"
    - "new Anthropic() inside try — missing key at runtime falls back to cache instead of crashing"
key_files:
  created:
    - "api/live-core.ts"
    - "api/live.ts"
  modified: []
decisions:
  - "sanitizeInput runs outside try/catch so unknown category → 400 (not fromCache:true silently)"
  - "new Anthropic() inside try block to make missing ANTHROPIC_API_KEY a LIVE-04 cache event at runtime"
  - "as unknown as Anthropic.Tool cast for web_search_20250305 — SDK types don't natively expose the tool config shape; cast is a known type-safety gap documented below"
  - "max_tokens:2048 — 1024 truncates JSON → parse failure → always cache (defeats D-04)"
  - "Resolved Lisbon/London blocker: golden-path JSON already keyed London, UK; countryFor maps UK→GB correctly"
metrics:
  duration: "~25min"
  completed: "2026-06-05"
  tasks_completed: 2
  files_created: 2
  files_modified: 1
---

# Phase 05 Plan 02: Vercel Proxy + Live-Core Pure Module — Summary

**One-liner:** Pure core module (validateItems/buildPrompt/extractJSON/sanitizeInput) and Vercel serverless proxy (api/live.ts) with Anthropic web_search_20250305 and golden-path LIVE-04 fallback — turning tests/live-validation.test.ts and tests/live-proxy.test.ts GREEN.

---

## Tasks Completed

| Task | Commit | Status | Key Deliverable |
|------|--------|--------|-----------------|
| 1: api/live-core.ts — pure core | 3dcfe9c | Done | validateItems + buildPrompt + extractJSON + sanitizeInput |
| 2: api/live.ts — proxy handler | 22f3592 | Done | POST /api/live with web_search + LIVE-04 fallback |
| Cleanup: remove dead eslint comment | 5ac141f | Done | api/live.ts cosmetic |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript error on tools array cast**
- **Found during:** Task 2 (npx tsc --noEmit gate)
- **Issue:** `Parameters<typeof client.messages.create>[0]['tools'][0]` cast failed — `tools` is optional in the SDK type, so indexing `[0]` on `ToolUnion[] | undefined` is invalid.
- **Fix:** Used `as unknown as Anthropic.Tool` cast. This is a known type-safety gap (see Known Gaps below).
- **Files modified:** api/live.ts
- **Commit:** 22f3592

---

## Known Gaps / Deferred Items

### Live Smoke — Deferred to Plan 04 Checkpoint

The `fromCache:false` (live) path has NOT been tested against a real Anthropic key in this plan. Two pre-conditions are unverified:

1. `ANTHROPIC_API_KEY` — must be set in `.env` / Vercel env vars before `npm run dev:full`
2. `web_search` must be enabled in Anthropic Console by org admin (RESEARCH Pitfall 6 / Open Q2)

The plan output explicitly defers manual smoke to Plan 04 (capture script checkpoint). The capture script throws on `fromCache:true`, which is the verification gate. This plan delivers the *server-side* validated-response capability; "user sees real listings" (LIVE-01/02/03) requires Plan 03 client wiring + a live smoke with a valid key.

### Type-Safety Gap — `as unknown as Anthropic.Tool` cast

`api/live.ts` line 75 uses `as unknown as Anthropic.Tool` to cast the `web_search_20250305` tool config. The `@anthropic-ai/sdk` TypeScript types don't natively expose the web search tool's shape at compile time; the cast bypasses that check. If the tool config fields (`type`, `name`, `max_uses`, `user_location`) are misspelled, tsc will not catch it — only a runtime call would. The Plan 04 live smoke is the verification gate. If live smoke returns unexpected results or a 400 from Anthropic, inspect this cast first.

### STATE.md Lisbon/London Blocker — Resolved

The STATE.md blocker about Lisbon/London mismatch is now resolved at the code level:
- `data/golden-path/demo-results.json` is already keyed `"Austin, TX"` and `"London, UK"` (updated in Plan 01 after the flag was raised)
- `countryFor("London, UK")` → splits on `", "` → suffix `"UK"` → map `COUNTRY_BY_SUFFIX.UK = 'GB'` → returns `"GB"` (ISO alpha-2 for United Kingdom, correct)
- The suffix map covers all Phase-4 international cities without a `cityName === 'Lisbon'` comparison

STATE.md should be updated to remove the blocker entry.

---

## Verification Results

### Automated (GREEN)

```
npm test -- tests/live-validation.test.ts  → 1 passed (8 tests) ✓
npm test -- tests/live-proxy.test.ts        → 1 passed (3 tests) ✓
npx tsc --noEmit                            → clean ✓
! grep "cityName === 'Lisbon'" api/live.ts  → no match ✓
```

### Full Suite State

```
Test Files  1 failed | 9 passed (10)
      Tests  79 passed (79)
```

`tests/live-fallback.test.ts` remains RED — correct, it targets `src/lib/fetchLive` (Plan 03 scope, not built yet). The 9 pre-existing suites are unaffected.

### Acceptance Criteria Checklist

- [x] api/live-core.ts exports validateItems, buildPrompt, extractJSON, sanitizeInput
- [x] `npm test -- tests/live-validation.test.ts` exits 0 (GREEN)
- [x] buildPrompt output contains "source" and instructs no URL/image (grep confirmed line 95, 108-109, 118-119, 128-129 of live-core.ts)
- [x] sanitizeInput accepts "Austin, TX" (comma+space allowed via `[a-zA-Z0-9 ,.\-'()]+` charset)
- [x] No import of `@anthropic-ai/sdk` or `@vercel/node` in live-core.ts
- [x] api/live.ts exports default async handler typed via @vercel/node
- [x] `npm test -- tests/live-proxy.test.ts` exits 0 (GREEN — mocked SDK throw → fromCache:true + golden-path items)
- [x] `npx tsc --noEmit` passes
- [x] No `cityName === 'Lisbon'` comparison in api/live.ts
- [x] Golden-path fallback lookup key is full cityName (goldenPath[category]?.[cityName] ?? [])
- [x] Handler reads key only via `new Anthropic()` (process.env); no res.json() includes ANTHROPIC_API_KEY
- [x] Non-POST → 405; unknown category → 400 before any SDK call

---

## Threat Surface Scan

No new network endpoints beyond `/api/live` (planned), no new auth paths, no new file access patterns, no schema changes. The T-5-* threats from the plan's threat model are mitigated:

| Threat ID | Mitigation Verified |
|-----------|-------------------|
| T-5-key | ANTHROPIC_API_KEY only appears in comments in live.ts; new Anthropic() reads from process.env; no res.json() path includes it (grep confirmed) |
| T-5-inject | sanitizeInput: category ∈ LiveCategory allowlist; cityName/profession length ≤100 + charset constrained (comma allowed for "City, ST") |
| T-5-llm | validateItems runs before every res.json(); bad shape throws → golden-path fallback; raw LLM text never reaches client |
| T-5-leak | catch block calls serveFallback() at 200; error details/stack/key never serialized |

---

## Self-Check: PASSED

Files exist:
- api/live-core.ts: FOUND
- api/live.ts: FOUND

Commits exist:
- 3dcfe9c: FOUND (feat(05-02): live-core.ts)
- 22f3592: FOUND (feat(05-02): live.ts)
- 5ac141f: FOUND (refactor(05-02): cleanup)
