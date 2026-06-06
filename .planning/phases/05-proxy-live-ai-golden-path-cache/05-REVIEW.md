---
phase: 05-proxy-live-ai-golden-path-cache
reviewed: 2026-06-05T00:00:00Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - api/live-core.ts
  - api/live.ts
  - src/lib/fetchLive.js
  - src/screens/PotentialApp.jsx
  - scripts/capture-golden-path.ts
  - src/main.jsx
  - index.html
  - .env.example
  - package.json
  - tsconfig.json
  - scripts/tsconfig.json
  - data/golden-path/demo-results.json
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-06-05
**Depth:** standard
**Files Reviewed:** 12
**Status:** issues_found

## Summary

The Phase 5 live-AI layer is well-structured and the named security focus areas hold up under scrutiny:

- **FOUND-03 (key never in client) — CLEAN, verified empirically.** `grep -ri "anthropic" src/ index.html` returns only a README guideline comment; no SDK import, no `api.anthropic.com` call, and no `import.meta.env`/`VITE_` key reference anywhere in `src/`. The key is constructed exclusively via `new Anthropic()` inside `api/live.ts` (server-side, `process.env`). `.env*` is gitignored; `.env.example` ships only a placeholder.
- **Input sanitization — CLEAN.** `sanitizeInput` runs outside the try/catch in `api/live.ts`, enforces a `LiveCategory` allowlist (returns 400 on miss, not a billable call), and constrains `cityName`/`profession` to a tight charset with a 100-char cap. Unknown category → 400 before any Anthropic call.
- **Golden-path fallback never throws — CLEAN.** Both `api/live.ts` (`serveFallback`) and `src/lib/fetchLive.js` use `?? []` terminal fallbacks and bare `catch {}`. The proxy never returns 5xx and never serializes error/stack/env detail to the client.
- **No direct client → Anthropic calls — CLEAN** (see FOUND-03 above).

The code is cleaner than a worst-case review assumes — there are no Critical findings. The two Warnings are robustness gaps that fire only under proxy misbehavior or script misuse, but both contradict an explicit contract in the code's own comments, so they should be fixed.

## Warnings

### WR-01: `fetchCategoryLive` returns `undefined` on a 200 with a malformed body — blank panel, violates D-02 + own docstring

**File:** `src/lib/fetchLive.js:43-49`
**Issue:** On a 200 response the function does `const data = await res.json(); return data.items;` with no check that `items` exists or has the right type. A 200 whose body is valid JSON but missing `items` (e.g. `{}`, an error envelope, or a future proxy refactor) returns `undefined`. Downstream in `PotentialApp.jsx`, `AIList` hits `if (!data) return null` (line 203) → the panel renders blank. This directly contradicts this file's own docstring ("Never resolves to undefined or 'coming_soon'", lines 5-7) and D-02 ("malformed response → fallback, no path leads to blank state"). It is WARNING rather than BLOCKER only because the current proxy always includes `items`, so it requires proxy misbehavior or a contract drift to fire.
**Fix:** Validate the body shape before returning; fall through to golden-path otherwise.
```javascript
const data = await res.json();
const items = data?.items;
const ok = category === 'dayinlife'
  ? typeof items === 'string'
  : Array.isArray(items);
if (!ok) return goldenPath[category]?.[city.name] ?? [];
return items;
```

### WR-02: Capture script overwrites the whole file with only the persona's housing category — silent data loss on re-run

**File:** `scripts/capture-golden-path.ts:41-50, 88-89`
**Issue:** `categories` is built as `['jobs', housingCategory, 'dayinlife']` where `housingCategory` is the single value derived from the persona's `housing` field. The script then builds `result` fresh and `fs.writeFileSync` overwrites `demo-results.json` wholesale. The committed `demo-results.json` contains BOTH `housing_rent` and `housing_buy` blocks. Re-running the capture with `housing: "rent"` (the current `demo-profile.json` value) writes a file with no `housing_buy` key at all — permanently deleting the buy listings for both cities. Any future demo using a `buy` profile then falls back to `[]` (empty panel), voiding SC4/SC5 for that category. This is a latent data-loss-on-regen: the script is described as "re-runnable before pitch day," which is exactly when this fires.
**Fix:** Either capture both housing categories regardless of persona, or merge into the existing file instead of overwriting.
```typescript
// Merge approach — preserve categories not captured this run:
const existing = fs.existsSync(outputPath)
  ? JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
  : {};
const merged = { ...existing, ...result };
fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2) + '\n');
```
Or capture `['jobs', 'housing_rent', 'housing_buy', 'dayinlife']` so a full snapshot is always written.

## Info

### IN-01: Dead error branch in `AIList` — `data === "error"` is now unreachable

**File:** `src/screens/PotentialApp.jsx:204`
**Issue:** `if (data === "error") return <p>Failed to load — try again</p>;` can never execute. The only writer of `cityAIData` is `pullLiveData`, which sets state to the return of `fetchCategoryLive`. That function returns either a validated array/string or `goldenPath[...] ?? []` — never the literal string `"error"`. The error-rendering path is dead code inherited from the pre-Phase-5 client. Combined with WR-01, a real failure currently shows a blank panel, not this message.
**Fix:** Either remove the dead branch, or wire `fetchCategoryLive` to surface a sentinel the UI can render when even the golden-path lookup is empty. Removing is the cleaner choice given D-02's "never blank" contract is met by the cache.

### IN-02: Allowlist is broader than the shipped category set (D-09) — deferred categories trigger billable calls then fail

**File:** `api/live-core.ts:9-11`
**Issue:** `LIVE_CATEGORIES` includes `nightlife`, `outdoors`, `food`, which D-09 explicitly defers ("Ship 3 categories only"). A request for one of these passes `sanitizeInput`, reaches `buildPrompt`'s `default` branch, fires a real (billable) Anthropic web_search call, then almost always fails `validateItems` (the default prompt asks for "a JSON array" but the response shape is unconstrained) → empty `[]` fallback. The allowlist matches the type union rather than the shipped surface, so the proxy spends money on categories the UI never requests.
**Fix:** Narrow the runtime allowlist to the shipped set, independent of the broader type:
```typescript
const LIVE_CATEGORIES: ReadonlySet<string> = new Set([
  'jobs', 'housing_rent', 'housing_buy', 'dayinlife',
]);
```
Re-add the deferred categories when their renderers and prompts ship.

### IN-03: `dayinlife` renderItem in PotentialApp is never invoked (minor dead code)

**File:** `src/screens/PotentialApp.jsx:316`
**Issue:** `<AIList dataKey="dayinlife" renderItem={(text) => <p>...</p>} />` passes a `renderItem`, but `AIList` short-circuits string data at line 205 (`if (typeof data === "string") return <p ...>{data}</p>`) before ever reaching the `data.map(renderItem)` path. The `dayinlife` `renderItem` is therefore never called. Harmless, but misleading — the inline paragraph style at 205 (lineHeight 1.7) wins over the renderItem style (lineHeight 1.8), so the prop is both dead and a style red herring.
**Fix:** Drop the `renderItem` prop for the dayinlife section, or document that string categories ignore it.

### IN-04: `extractJSON` greedy-after-first-fence can mis-slice multi-block LLM output

**File:** `api/live-core.ts:88`
**Issue:** `text.match(/```(?:json)?\s*([\s\S]*?)```/)` is non-greedy and grabs the FIRST fenced block. If the model emits explanatory prose containing an earlier stray fenced block (despite the system prompt forbidding prose), the parser captures the wrong block, `JSON.parse` throws, and the request silently falls back to cache — a live "wow moment" lost to a model formatting quirk. Low likelihood given the system prompt, and the fallback is safe (never blank, never errors), so this is Info, not Warning.
**Fix:** Prefer the last fenced block, or scan for the first `[`/`"` to last balanced delimiter. At minimum, if the first fenced parse throws, retry on `text.trim()` before giving up:
```typescript
const matches = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)];
const candidate = matches.length ? matches[matches.length - 1][1].trim() : text.trim();
return JSON.parse(candidate);
```

---

_Reviewed: 2026-06-05_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
