---
phase: 5
slug: proxy-live-ai-golden-path-cache
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-03
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from 05-RESEARCH.md "Validation Architecture". The live proxy path
> (Anthropic + web_search) is NOT unit-tested against the network — all
> automated tests run against pure functions (`validateItems`) and mocked
> `fetch` / mocked SDK, so the suite stays fast and offline-deterministic.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.8 (already installed) |
| **Config file** | none at root — vitest reads from package.json / vite.config.js defaults |
| **Quick run command** | `npm test` (= `vitest run`) |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5–15 seconds (pure functions + mocks, no network) |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test` + manual smoke (`npm run dev:full` = `vercel dev`, then `curl /api/live` with a real key)
- **Before `/gsd:verify-work`:** Full suite green + manual smoke of the "Pull live data" button in BOTH states (live hotspot + killed hotspot/offline)
- **Max feedback latency:** ~15 seconds (automated suite)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-T1 (GREEN; stub 01-T3) | 05-02 | 2 | LIVE-01, LIVE-02 | T-5-key / — | Malformed/non-conforming LLM output is rejected before return; proxy never emits unvalidated data | unit | `npm test` (`tests/live-validation.test.ts`) | ❌ W0 (01-T3) | ⬜ pending |
| 02-T1 (GREEN; stub 01-T3) | 05-02 | 2 | LIVE-03 | — | `validateItems('dayinlife', …)` accepts a narrative string, rejects an array | unit | `npm test` (`tests/live-validation.test.ts`) | ❌ W0 (01-T3) | ⬜ pending |
| 02-T2 (GREEN; stub 01-T3) | 05-02 | 2 | LIVE-04 | T-5-leak / — | On SDK error or validation failure the proxy returns `fromCache: true` with golden-path items, never a 5xx with a raw error | unit | `npm test` (`tests/live-proxy.test.ts`) | ❌ W0 (01-T3) | ⬜ pending |
| 03-T1 (GREEN; stub 01-T3) | 05-03 | 2 | FOUND-04, LIVE-04 | — | `fetchCategoryLive` with a `fetch` that throws/timeouts renders bundled golden-path data, no blank/spinner-stuck state | unit | `npm test` (`tests/live-fallback.test.ts`) | ❌ W0 (01-T3) | ⬜ pending |
| 04-T3 (manual checkpoint) | 05-04 | 3 | FOUND-03 | T-5-key | `ANTHROPIC_API_KEY` never appears in the client bundle; all Anthropic calls go through `/api/*` | manual | DevTools Network tab: zero calls to `api.anthropic.com`; `grep` built `dist/` for the key returns nothing | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*The 3 Wave 0 test files are created RED in 05-01 Task 3 and turn GREEN as 05-02/05-03 implement the exported targets (`validateItems`, the `/api/live` handler, `fetchCategoryLive`). `wave_0_complete` flips true once those files exist and pass during execution.*

---

## Wave 0 Requirements

- [ ] `tests/live-validation.test.ts` — `validateItems(category, raw)` for jobs/housing (valid + malformed fixtures) and dayinlife (string accepted, array rejected) — covers LIVE-01, LIVE-02, LIVE-03
- [ ] `tests/live-fallback.test.ts` — `fetchCategoryLive` with mocked `fetch` that throws/times out → asserts golden-path render — covers FOUND-04, LIVE-04
- [ ] `tests/live-proxy.test.ts` — proxy handler with mocked `@anthropic-ai/sdk` `messages.create` that throws → asserts `fromCache: true` + golden-path items — covers LIVE-04
- [ ] `data/golden-path/demo-results.json` — present (can be a minimal valid stub conforming to `LiveDataResponse<T>` until the capture script runs) so both client and proxy imports resolve and tests have a fixture

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No API key / no direct Anthropic calls from client | FOUND-03 | Requires inspecting a running browser session + built bundle | Run `npm run build`; `grep -r "sk-ant" dist/` returns nothing. Run `npm run dev:full`, open DevTools Network, click "Pull live data" — all calls hit `/api/*`, zero hit `api.anthropic.com` |
| Instant offline render on killed hotspot | FOUND-04, SC4 | Real network-kill behavior + visual "no spinner/blank" timing | With `vercel dev` running, disable Wi-Fi, click "Pull live data" — panels render golden-path content instantly, no spinner, no blank state |
| Live "wow moment" over hotspot | LIVE-01/02/03, SC1 | Real Anthropic web_search latency (8–20s) + content quality | On a working hotspot with web_search enabled in Console, click "Pull live data" — real listings stream into each category panel |
| Cache visually indistinguishable from live | D-08, SC4/SC5 | Subjective visual parity | Compare live render vs offline render side by side — no "cached"/"as of" badge, identical layout |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (3 test files + golden-path stub)
- [x] No watch-mode flags (`vitest run`, not `vitest`)
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-03 (plan-checker VERIFICATION PASSED, 0 blockers)
