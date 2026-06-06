---
status: partial
phase: 05-proxy-live-ai-golden-path-cache
source: [05-VERIFICATION.md]
started: 2026-06-05
updated: 2026-06-05
---

## Current Test

[awaiting human testing]

## Tests

### 1. SC1 / LIVE-01..03 — Live wow moment (real network + key)
expected: With `ANTHROPIC_API_KEY` set in `.env` and web_search enabled in the Anthropic Console org settings, run `npm run dev:full` on a working hotspot, open a Plus-tier city detail, click "Pull live data" — real job listings, housing listings, and a day-in-the-life narrative stream into their panels (8-20s is normal for web_search).
result: [pending]

### 2. SC2 — No direct Anthropic call from the client (DevTools)
expected: During the "Pull live data" click, the DevTools Network tab shows ZERO requests to `api.anthropic.com` — every Anthropic call routes through `/api/live`. (Automated half already verified: `grep -r "sk-ant" dist/` is empty and `src/` makes no direct Anthropic call.)
result: [pending]

### 3. SC4 / FOUND-04 — Instant offline render when the hotspot is killed
expected: With `vercel dev` running, disable Wi-Fi / kill the hotspot, click "Pull live data" — panels render golden-path content INSTANTLY, no spinner, no blank state, no "cached"/"as of" badge. (The `maxRetries: 0` fix on the Anthropic client makes the "proxy up, Anthropic unreachable" case fail fast instead of stalling on SDK retries.)
result: [pending]

### 4. SC5 / LIVE-04 — Failure path never crashes
expected: On the offline/failure path nothing crashes and every panel shows content (golden-path). No error surfaces to the UI. (Fallback logic is covered by green unit tests; this confirms it in a real browser.)
result: [pending]

### 5. SC6 / FOUND-04 — Brand fonts render offline (no system fallback)
expected: `npm run build && npm run preview`; in DevTools confirm no font request to fonts.googleapis.com/gstatic.com. Then go offline and hard-reload: headings render in Instrument Serif (tagline in Instrument Serif *italic*), body in Manrope, numbers in JetBrains Mono — NOT system defaults.
result: [pending]

### 6. SC3 — Real golden-path capture (overwrite the stub)
expected: With a real key + `vercel dev` running, `npx tsx scripts/capture-golden-path.ts` completes with no `fromCache:true` throw and overwrites `data/golden-path/demo-results.json` with real listings for the pinned persona × 2 cities (Austin, TX + London, UK). OR consciously ship on the valid stub and defer real capture to pitch-prep.
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
