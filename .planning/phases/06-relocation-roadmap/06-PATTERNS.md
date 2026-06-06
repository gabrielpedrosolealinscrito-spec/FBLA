# Phase 6: Relocation Roadmap - Pattern Map

**Mapped:** 2026-06-05
**Files analyzed:** 6 (5 new, 1 optional)
**Analogs found:** 5 / 6 (1 has no on-branch analog)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `shared/data/roadmap-templates.ts` | data (authored content + authoring type) | transform (static, read-only) | `shared/data/cities.ts` | role-match (data module) |
| `shared/engine/roadmap.ts` | engine (pure compiler) | transform / request-response (in→out, zero network) | `shared/engine/index.ts` (`rankCities`/`buildRawResult`) | exact (pure engine fn over Profile+MatchResult) |
| `shared/engine/roadmap.test.ts` | test | transform | `shared/engine/financial.test.ts` (+ `index.test.ts`) | exact (co-located engine vitest) |
| `src/screens/Roadmap.jsx` | component (screen) + PDF export | request-response (render) | `src/screens/ResultsMap.jsx` | role-match (results-consuming screen) |
| `src/screens/Roadmap.jsx` `@media print` block | config (print stylesheet) | n/a | `ResultsMap.jsx` inline `<style>{CSS}</style>` (lines 30-76) | role-match — **inline, NOT a separate `.css` file** |
| `api/` enrich validator (`acceptEnrichment`) — OPTIONAL | utility (validator) | request-response (build-time only) | `api/live-core.ts` (`validateItems`) | role-match (stricter sibling) |

## Pattern Assignments

### `shared/engine/roadmap.ts` (engine, pure compiler)

**Analog:** `shared/engine/index.ts`

**Imports pattern** (`index.ts` lines 19-25) — `type` imports from `../types.js`, data from `../data/*.js`, sibling engine modules with `.js` suffix. **New `roadmap.ts` MUST use the `.js` suffix on every relative TS import** (silent-failure trap if omitted):
```typescript
import type { Profile, City, MatchResult } from '../types.js';
import { CITIES_DATA } from '../data/cities.js';
import { FINANCIAL_MODELS } from './financial.js';
```
→ roadmap.ts: `import type { Profile, MatchResult, Roadmap } from '../types.js';`
   `import { ROADMAP_TEMPLATES, GENERIC_TEMPLATE } from '../data/roadmap-templates.js';`

**Pure-function-over-Profile pattern** (`index.ts` lines 63-110, `buildRawResult`) — reads `MatchResult` fields directly (`monthlySavings`, `estSalary`, `expenses`), never re-derives, never calls `fetch`/`/api`. `buildRoadmap(profile, top)` mirrors this exactly: pure, deterministic, offline (ROAD-03 / D-03). Note `index.ts` line 95 reads `monthlySavings = monthlyTakeHome - expenses.total` — the roadmap must READ `top.monthlySavings`, not recompute (D-01 anti-pattern).

**Lookup-with-fallback idiom** — TWO analog sources in this repo, both `?? default`:
```typescript
// shared/engine/index.ts line 65 (engine)
const model = FINANCIAL_MODELS[city.financialModelId] ?? FINANCIAL_MODELS['us'];
// api/live.ts line 51 (api) — optional-chained nested lookup
const fallbackItems = gpRecord[category]?.[cityName] ?? [];
```
→ D-07 fallback: `ROADMAP_TEMPLATES[profile.citizenship]?.[top.city.country] ?? GENERIC_TEMPLATE`

**Clamp/guard helper pattern** (`index.ts` lines 37-39) — small local `clamp()` helper, NaN-safe via round+clamp. The move-fund math is the analog: `monthsToFund = monthlySavings > 0 ? Math.ceil(targetFundUSD / monthlySavings) : null` (D-02 honest reframe — return `null`, never clamp a negative to 0 or fake a countdown).

**Compile-down-to-contract pattern** — `buildRawResult` returns the locked `MatchResult` shape (lines 101-110: explicit object literal, optional fields spread conditionally). `buildRoadmap` returns the locked `Roadmap` (`shared/types.ts` 184-187), spreading `sourceUrl` only when present:
```typescript
...(st.sourceUrl ? { sourceUrl: st.sourceUrl } : {}),
```
This mirrors `index.ts` line 157 `...(signal !== null ? { reconfirmSignal: signal } : {})`.

---

### `shared/data/roadmap-templates.ts` (data, authored content + authoring type)

**Analog:** `shared/data/cities.ts`

**Module-header + sourcing pattern** (`cities.ts` lines 1-22) — block comment header naming phase/decision IDs, then a `Sources:` block citing each authored figure to a real URL. The authored `targetFundUSD` (A2), visa pathway facts (A3), and any per-step `sourceUrl` MUST follow this sourced-comment convention (ROAD-02: authored truth, cited).

**Typed-const-array shape** (`cities.ts` lines 22-24, `export const CITIES_DATA: City[] = [...]`) — the authored data is a typed const exported for both tracks. → `export const ROADMAP_TEMPLATES: Record<string, Record<string, RoadmapTemplate>>` and `export const GENERIC_TEMPLATE: RoadmapTemplate`.

**Authoring type ≠ contract type** (RESEARCH Pattern 1) — define `RoadmapTemplate`/`TemplateStep`/`RoadmapContext` HERE (authoring shape, `detail: (ctx) => string`); the compiler in `roadmap.ts` flattens to the locked `Roadmap` (`detail: string`). **Do NOT edit `shared/types.ts`** — the 6-section contract (`shared/types.ts` 179-187) is locked. `SectionId = RoadmapSection['id']` derives the 6 ids from the contract.

**International pair = US→UK (London), NOT Lisbon/Portugal.** `cities.ts` line 3 header and the dataset contain only US cities + London; `FINANCIAL_MODELS` = `{us, uk-2026}`. Author `ROADMAP_TEMPLATES.US.UK` with a UK pathway (Skilled Worker / Global Talent, GOV.UK-cited), never a Portugal D8 section.

---

### `shared/engine/roadmap.test.ts` (test)

**Analog:** `shared/engine/financial.test.ts` (+ `index.test.ts`)

**Test-file conventions:**
- `globals: true` (`vite.config.js` line 18) → use `describe`/`it`/`expect` WITHOUT imports (see `financial.test.ts` — no vitest import).
- Relative imports use `.js` suffix: `financial.test.ts` line 16 `from './financial.js'`; `index.test.ts` line 18 `from './index.js'`. → `import { buildRoadmap } from './roadmap.js';`
- RED-test header comment naming the requirement + "RED until ... implemented" (`financial.test.ts` lines 1-3).
- Typed fixtures: `financial.test.ts` lines 50-70 build a full `Profile` literal with all required fields. Reuse this fixture shape; add a negative-`monthlySavings` `MatchResult` fixture for the D-02 test.

**Assert the user-facing output** (RESEARCH Pitfall 5 + project MEMORY): assert the compiled `roadmap.sections[..].steps[..].detail` string the user sees — NOT the intermediate `monthsToFund`. A prior phase got false comfort asserting a pre-clamp internal value while the displayed number was broken.

Test map (RESEARCH §Validation): covered-pair 6 sections in order · numbers threaded into `detail` · uncovered→GENERIC · negative savings→deficit reframe (no number) · offline/deterministic · visa UPL line present · (if built) `acceptEnrichment` preserves label/sourceUrl/order.

---

### `src/screens/Roadmap.jsx` (component / screen + PDF export)

**Analog:** `src/screens/ResultsMap.jsx`

**Screen shape** (`ResultsMap.jsx` lines 78, 106-145) — default-export function component taking `{ results, profile, ... }` props; pull the top city from `results` (the engine's ranked list). Roadmap consumes `buildRoadmap(profile, results[0])`. Wired in `src/App.jsx` (`import Potential from './screens/...'`); placement (dedicated screen vs CityDetail section) is UI-phase discretion (D-discretion).

**Inline co-located styling — print CSS goes HERE, not in a separate file** (`ResultsMap.jsx` lines 30-76 `const CSS = \`...\``, rendered line 108 `<style>{CSS}</style>`). The repo convention is a CSS template literal inside the JSX. **DIVERGENCE FLAG:** RESEARCH §Recommended Structure proposed `src/screens/roadmap-print.css` as a separate file — that contradicts the actual repo convention. The planner should add the `@media print` block to the screen's inline `<style>` CSS string (matching ResultsMap), NOT author an orphan `.css` file.

**`@media print` rules** (RESEARCH Code Examples + Pitfall 4) inside the inline CSS: hide app chrome (the `.top`/`.edit`/buttons like `ResultsMap` line 37-41), `break-inside: avoid` + `page-break-inside: avoid` per roadmap section, drop the dark theme (`background:#fff;color:#000`) for ink. `ResultsMap` already shows a `@media(max-width:560px)` block (line 74) — the `@media print` block sits alongside it.

**PDF export = `window.print()`** (locked) — a `[Export PDF]` button (styled like `ResultsMap` `.edit`/`.pill` buttons) calls `window.print()`. No PDF library.

**Source-as-text, never `<a>`** (D-10 / see-not-click) — render `step.sourceUrl` / source name as styled text, never a clickable link. `ResultsMap` uses no `<a>` tags — follow that.

---

## Shared Patterns

### Lookup-with-fallback (`?? default`)
**Source:** `shared/engine/index.ts` line 65 AND `api/live.ts` line 51
**Apply to:** `buildRoadmap` template resolution (D-07 generic fallback)
```typescript
const tmpl = ROADMAP_TEMPLATES[profile.citizenship]?.[top.city.country] ?? GENERIC_TEMPLATE;
```

### `.js` import suffix in `shared/` TS
**Source:** `shared/engine/index.ts` lines 19-24, `shared/engine/index.test.ts` line 18
**Apply to:** every relative import in `roadmap.ts` and `roadmap.test.ts` (silent-failure trap if omitted under the project's module resolution).

### Conditional optional-field spread into the locked contract
**Source:** `shared/engine/index.ts` line 157
**Apply to:** spreading `sourceUrl` only when authored (keeps `Roadmap` contract clean):
```typescript
...(st.sourceUrl ? { sourceUrl: st.sourceUrl } : {})
```

### Sourced-authored-data comment convention
**Source:** `shared/data/cities.ts` lines 1-22 (`Sources:` block)
**Apply to:** `roadmap-templates.ts` — cite `targetFundUSD`, visa facts, and any `sourceUrl` to real URLs (ROAD-02).

### Assert user-facing output in tests
**Source:** project MEMORY ("Test the user-facing output") + RESEARCH Pitfall 5
**Apply to:** `roadmap.test.ts` — assert the rendered `detail` string, not `monthsToFund`.

### LLM-output validation (OPTIONAL enrich only)
**Source:** `api/live-core.ts` lines 55-91 (`validateItems` + `extractJSON`), `api/live.ts` lines 49-102 (try → `serveFallback`)
**Apply to:** `acceptEnrichment` (build-time validator). It is a STRICTER sibling of `validateItems`: assert same step count + order, byte-identical `label` + `sourceUrl`, polish `detail` only (D-05). On ANY violation, throw → caller keeps authored `detail` — mirrors `live.ts`'s "throw → fall back to cache" (line 98-102 `catch { serveFallback() }`). Default render takes NO external input; this never touches the render path.

```typescript
// extends api/live-core.ts validateItems idiom (throw-on-mismatch)
export function acceptEnrichment(authored, llm): { detail: string }[] {
  if (!Array.isArray(llm) || llm.length !== authored.length)
    throw new Error('enrich rejected: step count changed (D-05)');
  return authored.map((a, i) => {
    const e = llm[i];
    if (typeof e?.detail !== 'string') throw new Error('enrich rejected: missing detail');
    if (e.label !== undefined && e.label !== a.label) throw new Error('enrich rejected: label mutated');
    if (e.sourceUrl !== undefined && e.sourceUrl !== a.sourceUrl) throw new Error('enrich rejected: sourceUrl mutated');
    return { detail: e.detail };
  });
}
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `scripts/capture-golden-path` (enrich-bake hook) | script (build-time) | batch | `scripts/` is EMPTY on this branch (confirmed `ls`). Phase 5's capture script is not yet present (A6). The enrich-bake (D-04) cannot run until it lands. OPTIONAL + non-blocking — ROAD-01/02/03 ship without it; authored prose renders directly. Planner: do NOT treat this as critical-path. |

**Note on the print stylesheet:** not "no analog" but a **convention divergence** — RESEARCH's proposed standalone `roadmap-print.css` should instead be an inline `@media print` block in `Roadmap.jsx` (per `ResultsMap.jsx` inline-`<style>` convention). Listed under the screen's Pattern Assignment above.

## Metadata

**Analog search scope:** `shared/engine/`, `shared/data/`, `src/screens/`, `api/`, `scripts/`
**Files scanned:** `index.ts`, `index.test.ts`, `financial.test.ts`, `cities.ts`, `live.ts`, `live-core.ts`, `ResultsMap.jsx`, `types.ts`, `App.jsx`, `vite.config.js`
**Pattern extraction date:** 2026-06-05
