---
phase: 05-proxy-live-ai-golden-path-cache
verified: 2026-06-06T02:12:14Z
status: human_needed
score: 10/15
overrides_applied: 0
human_verification:
  - test: "SC1 / LIVE-01-03: Click 'Pull live data' on a working hotspot with ANTHROPIC_API_KEY set and web_search enabled"
    expected: "Real job listings, housing listings (rent or buy per profile), and a day-in-the-life narrative render in the city-detail panel within 8-20s"
    why_human: "Requires a real ANTHROPIC_API_KEY, web_search enabled in Anthropic Console org settings, and a running dev server. The proxy code path and wiring are verified; the live outcome cannot be tested by grep."
  - test: "SC2 DevTools half: open DevTools Network tab during a 'Pull live data' click"
    expected: "Zero requests to api.anthropic.com appear — all Anthropic calls go through /api/live only"
    why_human: "Browser DevTools inspection cannot be automated by the verifier."
  - test: "SC4 / FOUND-04: Two-scenario offline test — proxy-down (instant path) and Wi-Fi-off+proxy-up (timeout path)"
    expected: "Proxy-down (npm run preview): panels render golden-path instantly (<1s). Wi-Fi-off with vercel dev up: fallback eventually renders but may not be instant — api/live.ts has no maxRetries/timeout on Anthropic client. Confirm demo scenario and add maxRetries:0 if needed. No cached badge (D-08)."
    why_human: "Requires controlling the network interface and observing browser render timing. Note: no timeout or maxRetries set on new Anthropic() — instant fallback only guaranteed when proxy itself is unreachable."
  - test: "SC5 / LIVE-04: Confirm the offline/failure path in a browser (from SC4 test)"
    expected: "No crash, no error thrown to the UI, every panel shows content (golden-path data or empty array — never undefined/blank)"
    why_human: "Requires the real browser/network scenario from SC4; the code path is verified via 83/83 tests but the browser runtime behavior needs confirmation."
  - test: "SC6 / FOUND-04 font half (05-05 Task 3): Run 'npm run build && npm run preview', kill network, hard-reload"
    expected: "Headings render in Instrument Serif (serif, not system serif), Landing tagline in Instrument Serif ITALIC, body in Manrope (geometric sans, not Arial/Helvetica), scores in JetBrains Mono (monospace). No fonts.googleapis.com request in DevTools."
    why_human: "Visual font rendering with network off requires a human with a browser. The @font-face wiring is deterministically verified; whether the browser actually falls back to system fonts in the offline case is a visual runtime check."
  - test: "SC3 real capture (05-04 Task 2): Run capture script against live proxy with real key"
    expected: "demo-results.json overwritten with real captured listings (not placeholder stubs) for Austin, TX and London, UK; script completes without fromCache:true throw; usage.server_tool_use.web_search_requests > 0 confirming web_search fired"
    why_human: "Requires ANTHROPIC_API_KEY set in .env, web_search enabled in Console, and vercel dev running. The script and its guards are verified; the real execution needs a human with the key."
---

# Phase 05: Proxy, Live AI & Golden-Path Cache — Verification Report

**Phase Goal:** The live AI data layer works via a backend proxy that never exposes the API key, and the bundled golden-path cache has been tested as the actual offline fallback — confirmed to render instantly when the hotspot is killed.
**Verified:** 2026-06-06T02:12:14Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Live job listings, housing listings, and a day-in-the-life narrative render via the backend proxy (SC1) | ? HUMAN | Code path verified (api/live.ts, fetchCategoryLive wired, "Pull live data" button present); live outcome requires real key + network |
| 2 | DevTools shows zero direct api.anthropic.com calls from the client (SC2 DevTools half) | ? HUMAN | src/ and index.html contain no Anthropic SDK import or api.anthropic.com reference (grep confirmed); DevTools observation requires a browser |
| 3 | No API key in the client bundle — grep -r "sk-ant" dist/ returns nothing (SC2 build half) | VERIFIED | `npm run build` + `grep -rn "sk-ant" dist/` → NOT FOUND. Also `ANTHROPIC_API_KEY` not in dist/. |
| 4 | All Anthropic calls go through /api/live; key read via process.env only — never in client code (FOUND-03) | VERIFIED | `grep -rniE "api\.anthropic\.com|@anthropic-ai/sdk|ANTHROPIC_API_KEY|import\.meta\.env" src/ index.html` → no matches. api/live.ts uses `new Anthropic()` (process.env only); live-core.ts has zero SDK imports. |
| 5 | demo-results.json populated for 2 cities ("Austin, TX" and "London, UK") across all 4 categories (SC3 shape) | VERIFIED | `node -e` confirms top-level keys: jobs/housing_rent/housing_buy/dayinlife, each with "Austin, TX" and "London, UK" sub-keys. jobs Austin: array[4], dayinlife Austin: string, no url/image fields, source field present. City key is London, UK (D-06 resolved). |
| 6 | demo-results.json holds real captured data (SC3 real capture) | ? HUMAN | File holds valid-shaped placeholder stub from Plan 01. Real capture requires human action (Task 2 pending). Plan explicitly permits shipping on stub — deferred to pitch-prep. |
| 7 | Hotspot killed → panels render golden-path instantly, no spinner/blank (SC4 / FOUND-04) | ? HUMAN | Code verified: fetchCategoryLive resolves to `goldenPath[category]?.[city.name] ?? []` on any failure; AIList renders from state (no permanent stuck path). Browser runtime behavior requires human test. |
| 8 | On timeout/malformed response, UI falls back to golden-path without crashing (SC5 / LIVE-04) | VERIFIED | `npm test` → 83/83 pass including live-proxy.test.ts (mocked SDK throw → fromCache:true + golden-path items, HTTP 200) and live-fallback.test.ts (mocked fetch reject → golden-path resolved). api/live.ts catch returns serveFallback() at 200; fetchLive.js catch resolves to goldenPath. |
| 9 | Brand fonts self-hosted — no Google Fonts CDN in index.html or dist/ (SC6 automated half) | VERIFIED | `grep -rE "fonts\.(googleapis\|gstatic)\.com" index.html dist/` → NOT FOUND. index.html is 10 clean lines (no preconnect, no stylesheet link). 11 @fontsource imports in src/main.jsx (6 Manrope weights + 3 JetBrains weights + Instrument Serif 400 + 400-italic). @fontsource-variable: none. Bare family names confirmed: node_modules/@fontsource/manrope/400.css → 'Manrope' (not 'Manrope Variable'). |
| 10 | Brand fonts render correctly offline with zero network (SC6 visual / FOUND-04 font half) | ? HUMAN | Automated half verified above; visual rendering offline requires human browser test (05-05 Task 3 pending). |
| 11 | The golden-path cache file is valid-shaped with no url/image fields and correct types | VERIFIED | jobs[city]: array, housing_rent/housing_buy[city]: array (source field present), dayinlife[city]: string. `s.includes('"url"')` → false; `s.includes('"image"')` → false. |
| 12 | TypeScript compiles clean (root + scripts/) | VERIFIED | `npx tsc --noEmit` → clean; `npx tsc -p scripts/tsconfig.json --noEmit` → clean. |
| 13 | test suite: 83/83 green | VERIFIED | `npm test` confirms 10/10 test files, 83/83 tests passed. |
| 14 | LIVE-04 fallback uses full city.name key (no bare-token lookup) | VERIFIED | api/live.ts line 51: `goldenPath[category]?.[cityName] ?? []` where cityName is the full request body string. fetchLive.js: `goldenPath[category]?.[city.name] ?? []`. JSON keyed "Austin, TX"/"London, UK". No `cityName === 'Lisbon'` comparison (grep confirmed). |
| 15 | Deferred sections (nightlife/outdoors/food) removed from PotentialApp | VERIFIED | `grep -n "nightlife\|\"outdoors\"\|'food'" src/screens/PotentialApp.jsx` → no output. |

**Score:** 10/15 truths verified (5 require human testing — by design)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `data/golden-path/demo-results.json` | Offline fallback — valid-shaped stub for 2 cities, 4 categories | VERIFIED | jobs/housing_rent/housing_buy/dayinlife each with "Austin, TX" and "London, UK"; arrays for listings, string for dayinlife; no url/image |
| `data/golden-path/demo-profile.json` | Pinned demo persona with cities as full city.name strings | VERIFIED | profession: "Software Engineer", age: 28, housing: "rent", cities: ["Austin, TX", "London, UK"] |
| `tests/live-validation.test.ts` | GREEN test for validateItems (LIVE-01/02/03) | VERIFIED | imports from `../api/live-core`; passes in full suite (83/83) |
| `tests/live-fallback.test.ts` | GREEN test for fetchCategoryLive fallback (FOUND-04/LIVE-04) | VERIFIED | imports from `../src/lib/fetchLive`; uses city.name "Austin, TX"; passes |
| `tests/live-proxy.test.ts` | GREEN test for proxy handler fromCache fallback (LIVE-04) | VERIFIED | imports handler, mocks @anthropic-ai/sdk, uses "Austin, TX"; passes |
| `tsconfig.json` | resolveJsonModule:true | VERIFIED | `node -e` confirms `compilerOptions.resolveJsonModule === true` |
| `api/live-core.ts` | Pure exports: validateItems, buildPrompt, extractJSON, sanitizeInput | VERIFIED | All 4 functions exported; no SDK import; buildPrompt includes "source" instruction and "Do not include any URL/image field" |
| `api/live.ts` | Vercel handler — calls Anthropic web_search, validates, falls back to cache | VERIFIED | Default async handler; `new Anthropic()` inside try; goldenPath imported; messages.create call; sanitizeInput outside try; 405/400 guards present |
| `src/lib/fetchLive.js` | fetchCategoryLive with 20s timeout + golden-path fallback | VERIFIED | 20000ms timeout; goldenPath imported; `/api/live` POST; `city.name` key; null/undefined guard on data.items (WR-01 partial fix applied) |
| `src/screens/PotentialApp.jsx` | "Pull live data" button, parallel fan-out, D-10 source-text cards | VERIFIED | "Pull live data" present; fetchCategoryLive imported; pullLiveData fires concurrently (forEach); no "View listing"; no "coming_soon"; source rendered as text; Section header onClick is expand-only |
| `scripts/capture-golden-path.ts` | Re-runnable capture script (D-07) with fromCache guard | VERIFIED | reads demo-profile.json; fromCache:true throws; WR-02 merge fix applied (merge approach not overwrite); `npx tsc -p scripts/tsconfig.json --noEmit` clean |
| `scripts/tsconfig.json` | Isolated type-check for scripts/ | VERIFIED | extends root; include: ./*.ts; types: ["node"]; typeRoots pointing to nested @types |
| `package.json` | @anthropic-ai/sdk + @fontsource static packages | VERIFIED | @anthropic-ai/sdk: ^0.101.0; @fontsource/manrope: ^5.x; @fontsource/jetbrains-mono: ^5.x; @fontsource/instrument-serif: ^5.x; no @fontsource-variable entries |
| `src/main.jsx` | 11 @fontsource imports before ./index.css | VERIFIED | 11 @fontsource imports confirmed (6 Manrope + 3 JetBrains + 2 Instrument Serif incl. italic); imports precede index.css; no @fontsource-variable |
| `index.html` | No Google Fonts CDN references | VERIFIED | 10-line clean HTML; no preconnect, no stylesheet link for fonts.googleapis.com or fonts.gstatic.com |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `api/live.ts` | `@anthropic-ai/sdk` | `new Anthropic(); client.messages.create` | WIRED | `new Anthropic()` at line 58; `client.messages.create` at line 60 |
| `api/live.ts` | `data/golden-path/demo-results.json` | `import goldenPath` | WIRED | Line 10: `import goldenPath from '../data/golden-path/demo-results.json'` |
| `api/live.ts` | `api/live-core.ts` | `import { validateItems, buildPrompt, sanitizeInput, extractJSON }` | WIRED | Line 11: `import { validateItems, buildPrompt, extractJSON, sanitizeInput } from './live-core'` |
| `src/lib/fetchLive.js` | `data/golden-path/demo-results.json` | `import goldenPath` | WIRED | Line 13: `import goldenPath from '../../data/golden-path/demo-results.json'` |
| `src/screens/PotentialApp.jsx` | `/api/live` | `fetchCategoryLive POST` | WIRED | fetchCategoryLive imported at line 3; pullLiveData fires it at line 83 with city+category+profession |
| `src/screens/PotentialApp.jsx` | `src/lib/fetchLive.js` | `import { fetchCategoryLive }` | WIRED | Line 3: `import { fetchCategoryLive } from '../lib/fetchLive.js'` |
| `scripts/capture-golden-path.ts` | `http://localhost:3000/api/live` | `fetch per category×city, fromCache guard` | WIRED | Reads cities from demo-profile.json; POSTs to local proxy; throws on fromCache:true |
| `scripts/capture-golden-path.ts` | `data/golden-path/demo-results.json` | `merge + writeFileSync` | WIRED | Lines 95-105: merges existing file, writes on all-fromCache:false |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `src/screens/PotentialApp.jsx` | `cityAIData[key]` | `pullLiveData` → `fetchCategoryLive` → `/api/live` → Anthropic (or goldenPath fallback) | Yes — live: Anthropic web_search; offline: goldenPath JSON stub | FLOWING (offline path verified by tests; live path human-pending) |
| `api/live.ts` | `items` | `client.messages.create` → `extractJSON` → `validateItems` | Yes — uses web_search tool; falls back to goldenPath on failure | FLOWING (mocked fallback path verified; live path human-pending) |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build produces no sk-ant key | `grep -rn "sk-ant" dist/` | NOT FOUND | PASS |
| Build produces no ANTHROPIC_API_KEY | `grep -rn "ANTHROPIC_API_KEY" dist/` | NOT FOUND | PASS |
| No direct Anthropic calls from src/ | `grep -rniE "api\.anthropic\.com|@anthropic-ai/sdk" src/ index.html` | 0 matches | PASS |
| Test suite | `npm test` | 10/10 files, 83/83 tests | PASS |
| No Google Fonts CDN in index.html or dist/ | `grep -rE "fonts\.(googleapis\|gstatic)\.com" index.html dist/` | NOT FOUND | PASS |
| root tsc clean | `npx tsc --noEmit` | clean | PASS |
| scripts tsc clean | `npx tsc -p scripts/tsconfig.json --noEmit` | clean | PASS |
| demo-results.json city keys | `node -e` shape check | "Austin, TX", "London, UK" — both present, correct types | PASS |
| No bare-token Lisbon comparison | `grep "cityName === 'Lisbon'" api/live.ts` | NOT FOUND | PASS |
| @fontsource bare family names | `grep "font-family" node_modules/@fontsource/manrope/400.css` | 'Manrope' (not 'Manrope Variable') | PASS |
| npm run build | `npm run build` | built in 215ms, font woff2 in dist/assets/ | PASS |
| No @fontsource-variable in src/main.jsx | `grep "@fontsource-variable" src/main.jsx` | NOT FOUND | PASS |
| Live path SC1 (real API) | Requires ANTHROPIC_API_KEY + network | NOT RUN | SKIP |
| Offline render SC4 (hotspot kill) | Requires network kill + browser | NOT RUN | SKIP |
| SC6 offline font proof | Requires network kill + visual browser check | NOT RUN | SKIP |

---

### Probe Execution

Step 7c: SKIPPED — no probe-*.sh files found in scripts/. Phase uses inline verify commands and manual checkpoints documented in PLAN files.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| FOUND-03 | Plans 02, 04 | Server-side proxy handles all Anthropic API calls — no API key in client code | VERIFIED (automated) + HUMAN (DevTools) | `grep -rniE "api\.anthropic\.com|@anthropic-ai/sdk|ANTHROPIC_API_KEY" src/ index.html` → 0 matches; `grep -rn "sk-ant" dist/` → empty; api/live.ts uses process.env only |
| FOUND-04 | Plans 01, 03, 04, 05 | App runs end-to-end offline with bundled cache when no network available | VERIFIED (code) + HUMAN (browser) | fetchLive.js resolves to goldenPath on any failure; AIList renders; demo-results.json valid-shaped; fonts self-hosted (no CDN); browser runtime test pending |
| LIVE-01 | Plans 01, 02, 03 | Real current job listings via proxy | VERIFIED (code path) + HUMAN (live outcome) | api/live.ts buildPrompt for jobs, validateItems, items returned; "Pull live data" fires fetchCategoryLive for jobs; live outcome pending |
| LIVE-02 | Plans 01, 02, 03 | Real current housing listings | VERIFIED (code path) + HUMAN (live outcome) | housing_rent/housing_buy categories handled by proxy and client; profile.housing determines which is fetched |
| LIVE-03 | Plans 01, 02, 03 | AI-generated day-in-the-life narrative | VERIFIED (code path) + HUMAN (live outcome) | dayinlife handled as string category throughout; validateItems handles string shape |
| LIVE-04 | Plans 01, 02, 03 | Graceful fallback to golden-path on failure — no blank/broken state | VERIFIED | 83/83 tests including proxy fallback (mocked SDK throw → fromCache:true) and client fallback (mocked fetch reject → goldenPath resolved); never 5xx; never undefined |

All 6 required requirement IDs from plans (FOUND-03, FOUND-04, LIVE-01, LIVE-02, LIVE-03, LIVE-04) are accounted for. No orphaned requirements.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/fetchLive.js` | 51 | WR-01 partial: `data.items == null` check added but no shape validation (array vs string) on `items` before returning | Warning | A 200 where `items` is the wrong type (string when array expected, or vice versa) would propagate the wrong value. Fires only on proxy contract drift. WR-01 from code review was partially addressed. |
| `src/screens/PotentialApp.jsx` | 204 | IN-01: `data === "error"` dead branch (unreachable — pullLiveData never sets "error") | Info | Dead code; harmless. Sets a misleading expectation that errors produce a string sentinel. |
| `api/live-core.ts` | 9-11 | IN-02: LIVE_CATEGORIES allowlist includes nightlife/outdoors/food (D-09 deferred categories); a request for them reaches Anthropic and then fails validateItems | Info | Billable live calls for unshipped categories. UI never requests them (sections removed from PotentialApp), so it is not a current live risk. |
| `src/screens/PotentialApp.jsx` | 316 | IN-03: dayinlife renderItem prop is never invoked (AIList short-circuits strings at line 205) | Info | Dead prop; minor style inconsistency. |

No `TBD`, `FIXME`, or `XXX` debt markers found in any Phase 5 file.

---

### Human Verification Required

#### 1. SC1 / LIVE-01-03: Live wow moment — real listings stream on a working hotspot

**Test:** With vercel dev running and ANTHROPIC_API_KEY set in .env (web_search enabled in Anthropic Console org settings), open a city detail panel, click "Pull live data."
**Expected:** Real job listings for the selected profession, real housing listings (rent or buy per demo profile), and a day-in-the-life narrative render within 8-20s. Items have title/company/source (jobs) or price/beds/source (housing). No "cached"/"as of" badge (D-08).
**Why human:** Requires a real ANTHROPIC_API_KEY and network. `usage.server_tool_use.web_search_requests > 0` in the response confirms web_search fired (Pitfall 6 — it can silently no-op if org setting is off).

#### 2. SC2 DevTools half: Zero api.anthropic.com calls from browser

**Test:** With vercel dev running, open DevTools → Network, click "Pull live data."
**Expected:** Zero entries to api.anthropic.com; all entries hit /api/live (same-origin).
**Why human:** Browser DevTools inspection cannot be automated.

#### 3. SC4 / FOUND-04: Hotspot-kill instant offline render (two scenarios)

**Test — Scenario A (instant path, proxy down):** Run `npm run build && npm run preview` (static server, no serverless function). Kill network (DevTools Offline or Wi-Fi off). Click "Pull live data".
**Expected A:** All three panels render golden-path content within <1s. The client fetch hits a network error immediately, `fetchCategoryLive` resolves to `goldenPath[category][city.name]`, AIList renders without delay.

**Test — Scenario B (vercel dev running, Wi-Fi off):** `npm run dev:full` running, Wi-Fi disabled. Click "Pull live data".
**Expected B:** Client POSTs to `/api/live` (localhost, reachable). The proxy calls `new Anthropic()` which attempts `api.anthropic.com` (unreachable). `api/live.ts` sets no `timeout` or `maxRetries` on the Anthropic client, so the SDK may hold until its internal timeout before the catch block fires and returns `fromCache:true`. Panel eventually renders but may not be instantaneous.

**Action:** Confirm which scenario the on-stage demo uses. If vercel dev (Scenario B), add `maxRetries: 0` and a short `timeout` (e.g. 5000ms) to `new Anthropic()` in `api/live.ts` to guarantee instant fallback. No "cached" or "as of" badge in either scenario (D-08).
**Why human:** Requires controlling network and timing the render. The client fast-path is code-verified (live-fallback.test.ts); the proxy-SDK timeout behavior requires a real browser test to confirm.

#### 4. SC5 / LIVE-04: No crash on failure path

**Test:** Observe the same offline scenario as SC4, or test with a wrong/expired key.
**Expected:** No JavaScript error thrown to the UI, no crash, every panel shows valid content (golden-path data from demo-results.json for Austin, TX / London, UK).
**Why human:** Live runtime in a browser; all code paths have test coverage but the end-to-end browser runtime needs human confirmation.

#### 5. SC6 / FOUND-04 font half: Offline brand font rendering

**Test:** `npm run build && npm run preview`. Open preview URL. In DevTools → Network, confirm NO request to fonts.googleapis.com or fonts.gstatic.com (font woff2 served from local origin). Then kill network (DevTools → Offline or Wi-Fi off), hard-reload. Navigate to Landing and a Results screen.
**Expected:** Headings render in Instrument Serif (elegant serif — not a system serif), Landing tagline in Instrument Serif ITALIC, body text in Manrope (geometric sans — not Arial/Helvetica/system-ui), numeric scores in JetBrains Mono (monospace — not Courier).
**Why human:** Visual font rendering with network off requires a browser. The @font-face wiring is deterministically verified (bare family names confirmed in node_modules; no CDN in dist/); the actual rendered result needs visual confirmation.

#### 6. SC3 real capture (05-04 Task 2): Run the golden-path capture script

**Test:** Confirm/finalize demo-profile.json (profession, age, housing, cities). Set ANTHROPIC_API_KEY in .env. Enable web_search in Anthropic Console. Run `npm run dev:full` then `npx tsx scripts/capture-golden-path.ts`.
**Expected:** Script completes without `fromCache:true` throw; demo-results.json overwritten with real listings for both cities; file has real job titles, real housing prices, real narrative (not the placeholder stubs from Plan 01). Signal "captured" to mark complete, or "stub" to defer to pitch-prep.
**Why human:** Requires real API key, Console configuration, and a running dev server. The script itself is verified (tsc clean, fromCache guard present, merge approach applies WR-02 fix).

---

### Gaps Summary

No automated blockers. All deterministic criteria pass. The 5 human verification checkpoints are by-design manual items: two were explicitly designated `checkpoint:human-action` and `checkpoint:human-verify` in the plan (05-04 Tasks 2-3, 05-05 Task 3), and the others (SC2 DevTools, SC4 offline render, SC5 crash check) cannot be verified programmatically.

**Code review warnings not yet fully addressed:**
- WR-01: `fetchLive.js` has a partial fix (null check on `data.items`) but not the full shape validation (array vs string). Current proxy always returns correct shapes, so this is a latent risk on contract drift — not a current blocker.
- WR-01 partial: the `data === "error"` branch (IN-01) remains dead code; harmless.

The phase is structurally complete. All automated infrastructure is verified green. Human checkpoints are next.

---

_Verified: 2026-06-06T02:12:14Z_
_Verifier: Claude (gsd-verifier)_
