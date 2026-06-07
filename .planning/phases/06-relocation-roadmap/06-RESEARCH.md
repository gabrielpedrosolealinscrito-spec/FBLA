# Phase 6: Relocation Roadmap - Research

**Researched:** 2026-06-05
**Domain:** Authored-template content system + render-time personalization + print-to-PDF + optional build-time LLM prose-enrich
**Confidence:** HIGH (template/render/fallback/PDF grounded in this codebase) · MEDIUM (enrich-bake reuse, depends on Phase 5 capture script that is not yet on this branch)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01: Fully threaded with the user's real engine output.** Template steps interpolate actual per-user numbers the engine already computes — `monthlySavings` drives a real move-fund timeline; `jobs` names the user's profession + the city's salary figure; `housing` uses their rent-vs-buy preference + the city's real rent/buy numbers. Reuses `MatchResult` + `Profile` already on hand offline.
- **D-02: Negative/zero savings → honest reframe, never a faked timeline.** When projected `monthlySavings <= 0` for the top city, the financial/timeline section does NOT invent or clamp a timeline. It surfaces reality ("at your projected income this city runs a monthly deficit") and pivots to closing the income/expense gap before moving.
- **D-03: Pre-baked offline roadmap is the critical path.** Roadmap = authored templates + render-time interpolation of local engine numbers. The default/offline render makes **zero network calls** — fully deterministic, demo-safe on a dead hotspot. Number-threading (D-01) needs no LLM.
- **D-04: Optional prose-enrich layer, off the critical path, reusing Phase 5 infrastructure.** An optional LLM layer may polish the *prose* of authored steps. It MUST reuse the Phase 5 `/api` proxy + golden-path cache + sanitize layer — **no new backend**. The capture script runs the enrich **once at build time** and bakes the polished prose into the golden-path cache, so even offline the demo shows the enriched version. A live re-enrich is an optional on-stage flourish, never required.
- **D-05: LLM touches `detail` prose ONLY.** The enrich layer may rewrite the `detail` text of a step. It MUST NOT invent, reorder, or alter authored `label`s, procedural steps, legal/visa facts, or `sourceUrl`s (ROAD-02 hard boundary). Authored procedural truth is immutable; only its phrasing may be smoothed.
- **D-06: Author the demo persona → BOTH golden-path cities.** Author full roadmaps for the persona's citizenship → the #1 US match (domestic move, lighter visa section) AND the international city (the visa "wow"). Pin to the **same persona + city pair as the Phase 5 golden-path cache.**
- **D-07: Uncovered pairs → generic-but-honest offline fallback roadmap.** Any citizenship×destination outside the authored set renders a real, generic skeleton (still offline, still 6 sections, no invented procedural/legal steps). Not a "coming soon" lock, not blank — a usable generic plan.
- **D-08: Visa section = short authored summary + UPL line + Premium upsell teaser.** Holds: the headline pathway for that citizenship→country, 2-3 key facts (rough timeline/cost), the UPL "informational only, not legal advice" framing (inherits VISA-04), and a teaser pointing to the full Premium concierge. The deep eligibility screener / pathway comparison / document checklists stay in Phase 7.
- **PDF export = `window.print()` + print CSS** (ROAD-03). Zero-dependency, offline, battery-safe, no see-not-click risk.
- **Sources render as styled text, not clickable links.** `sourceUrl?` exists in the contract but is NOT rendered as an `<a>` (inherits Phase 5 D-10 + competition see-not-click rule). Source *name* shown as text.
- **Offline render is mandatory** (ROAD-03): no live call on the roadmap's critical path. The optional enrich (D-04) is the only online touch and it is non-blocking + cached.

### Claude's Discretion
- **Where the roadmap surfaces** — dedicated `Roadmap` screen vs a section inside the results detail; navigation from results. (UI-phase + planner.)
- Exact `ROADMAP_TEMPLATES` module layout / file location under `shared/data/` and the render-time interpolation helper's shape.
- Section ordering / visual treatment within the 6 fixed sections, PDF print-stylesheet fidelity, per-step citation density.
- The prose-enrich prompt design + sanitize schema (reuse/extend the Phase 5 patterns).

### Deferred Ideas (OUT OF SCOPE)
- **Full visa concierge** (eligibility screener, multi-pathway comparison, per-pathway document checklists) → **Phase 7** (Premium).
- **Tier gate / paywall / unlock UI** — roadmap is Plus-tier, but gating it is **Phase 8**. Phase 6 builds the surface only.
- **Authoring roadmaps for many citizenship×country pairs** — Phase 6 authors the demo persona's pairs + a generic fallback. Scaling the matrix is post-pitch.
- **Live (not cached) prose-enrich as a routine feature** — kept optional + capture-baked for the demo.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ROAD-01 | Step-by-step roadmap for top city: timeline, financial prep, job-search, housing, logistics (+visa) | Authoring type `RoadmapTemplate` with 6 sections, each `steps[]`; `buildRoadmap()` compiles to the locked `Roadmap` contract; threads `MatchResult`/`Profile` numbers (D-01). See Architecture Patterns. |
| ROAD-02 | Template-first; LLM-enriched for prose only; no invented procedural/legal steps | Authored `RoadmapTemplate` is the source of truth; enrich touches `detail` ONLY behind a strict preservation validator (D-05). See "Optional prose-enrich" + Security Domain. |
| ROAD-03 | Readable offline + exportable as PDF | `buildRoadmap()` is a pure function of local engine output — zero network on render (D-03); PDF via `window.print()` + print CSS (locked). See "Offline render" + "PDF export". |
| VISA-04 (inherited) | UPL boundary: informational only, "consult a licensed attorney" framing | Visa section carries a fixed authored UPL line + Premium teaser (D-08). See Security/UPL note. |
</phase_requirements>

## Summary

Phase 6 fills the already-locked `Roadmap`/`RoadmapSection` contract (`shared/types.ts` lines 178-187) for the user's top city. The work is **content authoring + a small pure-function render layer**, not framework integration. Three independently-shippable concerns: (1) author `ROADMAP_TEMPLATES` for the demo persona's two golden-path pairs + one generic fallback; (2) a `buildRoadmap(template, matchResult, profile)` compiler that threads real engine numbers into each step's `detail` with **zero network calls** (ROAD-03); (3) a print stylesheet so `window.print()` produces a clean PDF. A fourth, optional concern reuses Phase 5's capture script + sanitize layer to bake LLM-polished prose into `detail` at build time — never on the render path, and only behind a strict validator that preserves every authored `label`/`sourceUrl`/step-order (D-05).

**The single most important planning finding:** the international golden-path city that is actually buildable is **London, UK**, not Lisbon. `cities.ts` contains only US cities + London; `FINANCIAL_MODELS` registers only `us` and `uk-2026`; the Phase 5 `demo-profile.json` cities are `["Austin, TX", "London, UK"]`. Lisbon would require a Portugal city + a `pt-2026` financial model that **do not exist** and whose creation is Phase 4 country-model scope, not Phase 6. CONTEXT.md never *locked* Lisbon — both Phase 5 D-06 and Phase 6's open dependency say "Lisbon is the working assumption — confirm against the demo script," and D-06 binds Phase 6 to the *same pair as the Phase 5 cache*. The binding constraint (pin to Phase 5) and the buildable constraint (only us/uk models) **agree on London**. The cascade: the visa section's headline pathway for a London roadmap is a UK pathway (e.g. Skilled Worker / Global Talent), **not** Portugal D8 — the planner must not author a Portugal D8 summary for a London roadmap.

**Primary recommendation:** Author `ROADMAP_TEMPLATES['US'][destinationCountry]` as a *separate authoring type* whose `detail` is a function `(ctx) => string`; compile it to the locked contract (where `detail` is a plain `string`) via a pure `buildRoadmap()`; render offline; PDF via print CSS. Treat the international pair as **London/UK** and surface the Lisbon assumption as a demo-script-owner confirmation, not a silently-resolved decision. Keep the prose-enrich strictly optional and capture-baked — it depends on a Phase 5 capture script not yet present on this branch.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `ROADMAP_TEMPLATES` authored content (6 sections × steps) | `shared/data/` (TS, backend-owned) | — | `shared/README.md`: "data/ holds roadmap templates (backend-owned)". Pure static content, no network, importable by both tracks. |
| `buildRoadmap()` render-time interpolation (threads numbers) | `shared/engine/` (pure fn) | `shared/data/` (reads templates) | Pure deterministic function of `Profile`+`MatchResult`+static templates = zero network = offline-safe (FOUND-04 / ROAD-03), mirrors `rankCities()`. |
| Move-fund timeline math + negative-savings reframe | `shared/engine/` (pure fn) | — | Reads `monthlySavings` from `MatchResult`; no recomputation, no LLM (D-01/D-02/D-03). |
| Roadmap UI surface (screen vs detail-section) | `src/` (JSX, frontend-owned) | — | Frontend imports the compiled `Roadmap` and renders; placement is UI-phase discretion. |
| PDF export | `src/` (print CSS + `window.print()`) | — | Browser-native, zero dependency, offline, battery-safe (locked default). |
| Optional prose-enrich (build-time bake) | `scripts/` + `api/` (Phase 5 reuse) | `data/golden-path/` | Reuses Phase 5 proxy + capture script + sanitize layer; never on render path (D-04). |
| Visa-section content + UPL line + Premium teaser | `shared/data/` (authored) | `src/` (renders teaser CTA) | Authored summary only; deep concierge is Phase 7 (D-08). |

## Standard Stack

This phase adds **no new runtime dependencies.** Everything needed is already in the repo.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript (existing) | tsconfig `strict: true` | `ROADMAP_TEMPLATES` + `buildRoadmap()` types | Contract-first rule; `shared/` is TS. `[VERIFIED: STRUCTURE.md, shared/README.md]` |
| React 19 (existing) | `^19.2.6` | Roadmap UI surface | Already the UI stack. `[VERIFIED: package.json]` |
| Vite 8 (existing) | `^8.0.14` | Build / dev | Already the toolchain. `[VERIFIED: package.json]` |
| Vitest 4 (existing) | `^4.1.8` | Unit tests for `buildRoadmap()` + enrich validator | Already the test runner; engine is fully unit-tested. `[VERIFIED: package.json, shared/engine/*.test.ts]` |
| `window.print()` (browser-native) | n/a | PDF export | Zero dependency, offline, no see-not-click risk (locked). `[CITED: developer.mozilla.org/en-US/docs/Web/API/Window/print]` |
| `@anthropic-ai/sdk` (existing) | `^0.101.0` | OPTIONAL prose-enrich only, build-time | Reuses Phase 5 proxy; not on the render path. `[VERIFIED: package.json, api/live.ts]` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `window.print()` + print CSS | `react-to-print`, `jspdf`, `html2pdf`, Puppeteer | All add a dependency and/or a build step; some embed clickable links (see-not-click violation); jspdf/html2pdf produce lower-fidelity text. Locked default is correct — do NOT add a PDF library. |
| Function-interpolation `detail: (ctx) => string` | Token placeholders `"...{{monthlySavings}}..."` + regex replace | Token replacement is stringly-typed, silently no-ops on typos, can't do conditional logic (the D-02 reframe needs an `if`), and doesn't match the pure-function engine style. Function interpolation is type-safe. |

**Installation:** None required. No `npm install` for this phase.

## Package Legitimacy Audit

> Not applicable — this phase installs **no external packages**. All capabilities use existing repo dependencies (verified in `package.json`) plus browser-native `window.print()`. No slopcheck run needed.

## Architecture Patterns

### System Architecture Diagram

```
                    ┌─────────────────────────────────────────────┐
   Profile  ───────►│  rankCities(profile)  [shared/engine, EXISTS]│
   (from quiz)      │  → RankingOutput.results: MatchResult[]      │
                    └───────────────┬─────────────────────────────┘
                                    │ results[0] = top city (MatchResult)
                                    │ profile.citizenship, profile.housing
                                    ▼
        ┌──────────────────────────────────────────────────────────────┐
        │  buildRoadmap(matchResult, profile)   [shared/engine — NEW]   │
        │                                                               │
        │   key = (profile.citizenship, matchResult.city.country)       │
        │   tmpl = ROADMAP_TEMPLATES[key.citizenship]?.[key.country]    │
        │            ?? GENERIC_TEMPLATE          (D-07 fallback)        │
        │                                                               │
        │   ctx = { monthlySavings, profession, estSalary, medianRent,  │
        │           medianHome, housing, cityName, monthsToFund, ... }  │
        │                                                               │
        │   for each section/step:                                       │
        │     detail = step.detail(ctx)   ← function interpolation       │
        │              (D-02 reframe lives inside the timeline/financial │
        │               step's function: if savings<=0 → honest text)   │
        │                                                               │
        │   → Roadmap (LOCKED contract: detail is now a plain string)   │
        └───────────────┬──────────────────────────────────────────────┘
                        │  ZERO network calls (ROAD-03 / D-03)
                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │  Roadmap UI surface  [src/ — JSX]                             │
        │   renders 6 sections; sourceUrl shown as TEXT not <a> (D-10)  │
        │   [Export PDF] button → window.print()                        │
        │   @media print stylesheet → clean paginated PDF (ROAD-03)     │
        └──────────────────────────────────────────────────────────────┘

   ─ ─ ─ ─ ─ OPTIONAL, BUILD-TIME ONLY (D-04), never on render path ─ ─ ─ ─ ─
        ┌──────────────────────────────────────────────────────────────┐
        │  scripts/capture-golden-path (Phase 5, NOT on this branch yet)│
        │   → for authored persona steps, call /api enrich (proxy)      │
        │   → enrich-sanitize: KEEP label/sourceUrl/order, polish detail │
        │   → bake enriched detail into golden-path cache (offline-safe) │
        └──────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure
```
shared/
├── data/
│   ├── cities.ts                  # EXISTS — city facts threaded by buildRoadmap
│   └── roadmap-templates.ts       # NEW — ROADMAP_TEMPLATES + GENERIC_TEMPLATE
├── engine/
│   ├── roadmap.ts                 # NEW — buildRoadmap(), monthsToFund(), ctx assembly
│   └── roadmap.test.ts            # NEW — Wave 0 RED tests (offline determinism, D-02 reframe, fallback)
src/
└── screens/ (or components/)
    ├── Roadmap.jsx                # NEW — UI surface (placement = UI-phase discretion)
    └── roadmap-print.css          # NEW — @media print stylesheet (or co-located styles)
```

### Pattern 1: Authoring type ≠ contract type (function-interpolation compiler)
**What:** Define a *separate* authoring shape `RoadmapTemplate` whose step `detail` is a function `(ctx: RoadmapContext) => string`. A pure `buildRoadmap()` compiles it down to the **locked** `Roadmap` contract, where `detail` is a plain `string`. The contract in `shared/types.ts` is never changed.
**When to use:** Always — this is the spine of the phase.
**Example:**
```typescript
// shared/data/roadmap-templates.ts  (authoring type — NOT the locked contract)
// Source: pattern derived from this codebase's pure-engine style (shared/engine/index.ts)
import type { Profile, MatchResult, RoadmapSection } from '../types';

export interface RoadmapContext {
  cityName: string;
  profession: string;
  monthlySavings: number;     // from MatchResult — CAN be negative (D-02)
  estSalary: number;
  monthlyTakeHome: number;
  medianRent: number;
  medianHome: number;
  housing: 'rent' | 'buy';
  monthsToFund: number | null; // null when savings <= 0 (D-02)
  targetFundUSD: number;       // authored relocation-cost target (see Assumptions A2)
}

export type SectionId = RoadmapSection['id']; // 'timeline'|'financial'|'jobs'|'housing'|'logistics'|'visa'

export interface TemplateStep {
  label: string;                          // authored, IMMUTABLE (D-05)
  detail: (ctx: RoadmapContext) => string; // interpolates real numbers, no LLM (D-01/D-03)
  sourceUrl?: string;                     // authored, IMMUTABLE, rendered as TEXT (D-10)
}
export interface TemplateSection { id: SectionId; title: string; steps: TemplateStep[]; }
export type RoadmapTemplate = TemplateSection[]; // exactly the 6 sections, in order

// ROADMAP_TEMPLATES[citizenship][destinationCountry]
export const ROADMAP_TEMPLATES: Record<string, Record<string, RoadmapTemplate>> = {
  US: {
    US: US_DOMESTIC_TEMPLATE,   // #1 US match (lighter visa section)
    UK: US_TO_UK_TEMPLATE,      // international "wow" — London is the built intl city
  },
};
export const GENERIC_TEMPLATE: RoadmapTemplate = /* honest generic skeleton (D-07) */;
```
```typescript
// shared/engine/roadmap.ts  (the compiler — pure, offline)
import type { Profile, MatchResult, Roadmap } from '../types';
import { ROADMAP_TEMPLATES, GENERIC_TEMPLATE, RoadmapContext } from '../data/roadmap-templates';

export function buildRoadmap(profile: Profile, top: MatchResult): Roadmap {
  const tmpl =
    ROADMAP_TEMPLATES[profile.citizenship]?.[top.city.country] ?? GENERIC_TEMPLATE; // D-07
  const ctx = buildContext(profile, top);
  return {
    cityName: top.city.name,
    sections: tmpl.map((s) => ({
      id: s.id,
      title: s.title,
      steps: s.steps.map((st) => ({
        label: st.label,                 // copied verbatim
        detail: st.detail(ctx),          // interpolated string (contract shape)
        ...(st.sourceUrl ? { sourceUrl: st.sourceUrl } : {}),
      })),
    })),
  };
}
```
**Why this beats token-replacement:** type-safe (a typo'd field is a compile error), supports the conditional D-02 reframe inside a step function, and keeps the locked contract (`detail: string`) untouched.

### Pattern 2: Lookup-with-fallback (mirror the existing `live.ts` idiom)
**What:** `ROADMAP_TEMPLATES[citizenship]?.[country] ?? GENERIC_TEMPLATE`.
**Why:** This is the *exact* optional-chaining-with-default pattern already shipped in `api/live.ts` (`gpRecord[category]?.[cityName] ?? []`). Use the same idiom for consistency. Guarantees the app never dead-ends if a judge picks an off-script city (D-07).
```typescript
// Source: api/live.ts line 51 (established pattern in this repo)
const fallbackItems = gpRecord[category]?.[cityName] ?? [];
```

### Pattern 3: Move-fund timeline + honest reframe (D-01 / D-02)
**What:** `monthsToFund = ceil(targetFundUSD / monthlySavings)` when `monthlySavings > 0`; otherwise `null` and the step renders the honest deficit reframe — never a faked or clamped countdown.
**Example:**
```typescript
// Source: D-01/D-02; targetFundUSD is an authored constant (see Assumptions A2)
function buildContext(profile: Profile, top: MatchResult): RoadmapContext {
  const monthlySavings = top.monthlySavings; // CAN be negative
  const targetFundUSD = TARGET_FUND_USD;     // authored relocation-cost estimate
  const monthsToFund = monthlySavings > 0 ? Math.ceil(targetFundUSD / monthlySavings) : null;
  return { /* ...city + profile fields... */, monthlySavings, monthsToFund, targetFundUSD };
}

// inside the timeline/financial step's detail function:
detail: (ctx) =>
  ctx.monthsToFund !== null
    ? `Based on your projected $${ctx.monthlySavings.toLocaleString()}/mo of savings, your `
      + `~$${ctx.targetFundUSD.toLocaleString()} move fund is reachable in about `
      + `${ctx.monthsToFund} months.`
    : `At your projected income, ${ctx.cityName} runs a monthly deficit. Before setting a move date, `
      + `focus on closing the income/expense gap — a higher salary, lower target rent, or remote income `
      + `would turn this into a fundable timeline.`,
```
> The marquee moment (CONTEXT specifics): "based on your $X/mo savings, your move fund lands in ~N months" is the personalization wow. Assert the **rendered string** in tests, not the intermediate `monthsToFund` — see MEMORY: "Test the user-facing output" (a prior phase got false comfort asserting a pre-clamp internal value while the displayed number was broken).

### Anti-Patterns to Avoid
- **Changing `shared/types.ts`.** The 6-section `Roadmap`/`RoadmapSection` shape is LOCKED. Add the *authoring* type in `shared/data/`, compile down to the contract. Do not touch the contract file.
- **Authoring a Portugal D8 visa section for the London roadmap.** Destination drives the headline pathway. London ⇒ UK pathway. (See City Resolution finding.)
- **Recomputing financials in the roadmap.** Read `MatchResult.monthlySavings`/`estSalary`/`expenses` directly — never re-derive (D-01: "no recomputation needed").
- **Clamping a negative timeline to 0 or hiding it.** D-02 mandates the honest reframe.
- **Rendering `sourceUrl` as `<a href>`.** See-not-click rule (D-10) — render the source *name* as text.
- **Adding a PDF library.** Locked default is `window.print()`.
- **Making the enrich layer a render dependency.** It is build-time-only and offline-baked (D-04).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF generation | A PDF renderer / `jspdf` / Puppeteer pipeline | `window.print()` + `@media print` CSS | Browser-native, offline, zero dep, no clickable-link risk (locked). |
| Number → currency formatting | Custom `$1,400` formatter | `Number.prototype.toLocaleString()` (or existing engine formatters) | Built-in, locale-correct, already used elsewhere. |
| LLM output parsing/validation (enrich) | A new parser/sanitizer from scratch | Extend the Phase 5 `extractJSON` / `validateItems` / `sanitizeInput` pattern in `api/live-core.ts` | Phase 5 already solved fenced-JSON extraction + shape validation; the enrich validator is a stricter sibling, not a rewrite (D-04). |
| Capture/bake-to-cache mechanism | A new build script | Phase 5 `scripts/capture-golden-path` (D-07) | D-04 explicitly reuses it; do not build a second capture path. |
| Top-city selection | Re-sorting / re-ranking | `rankCities(profile).results[0]` | Engine already returns the ranked list. |

**Key insight:** This phase is **authoring + a thin pure compiler**, not infrastructure. Every hard problem (ranking, financials, LLM parsing, caching) is already solved upstream. The new code is small; the *content* (authored steps with real sourced facts) is the deliverable.

## Runtime State Inventory

> Not a rename/refactor/migration phase. Section omitted — N/A (greenfield content + render code).

## Common Pitfalls

### Pitfall 1: Authoring the wrong international city (Lisbon vs London)
**What goes wrong:** CONTEXT.md repeatedly says "Lisbon"; a planner authors a `US→Portugal` template + Portugal D8 visa section. But there is no Lisbon city and no `pt-2026` financial model, so `buildRoadmap` falls through to `GENERIC_TEMPLATE` and the financials/visa are wrong or generic — defeating the "wow."
**Why it happens:** "Lisbon" appears as a working assumption in CONTEXT but was never reconciled against the actual codebase.
**How to avoid:** Author the international pair as **US→UK (London)** to match `cities.ts`, `FINANCIAL_MODELS` (`uk-2026`), and the Phase 5 `demo-profile.json`. Confirm with the demo-script owner before authoring (Open Question 1).
**Warning signs:** Any reference to "Portugal D8" in a London roadmap; `buildRoadmap` returning the generic template for the rehearsed persona.

### Pitfall 2: Enrich silently mutating authored facts (ROAD-02 boundary breach)
**What goes wrong:** The LLM "polishes" prose but reorders steps, drops a `sourceUrl`, or rewrites a procedural fact — violating the immutable-truth boundary (D-05/ROAD-02), which is also a credibility/Q&A risk on visa/legal content.
**Why it happens:** A generic "rewrite this nicely" prompt + a loose validator that only checks JSON-parses.
**How to avoid:** A **dedicated enrich validator** (distinct from Phase 5's `validateItems`) that asserts, per step: same step *count*, same step *order*, byte-identical `label`, byte-identical `sourceUrl`. On ANY violation, **reject and fall back to the authored `detail`** (never ship the LLM version). Polish `detail` only. See Security Domain.
**Warning signs:** Enriched roadmap has a different number of steps, or a `label` differs from the authored template.

### Pitfall 3: A network call sneaking onto the render path (ROAD-03 breach)
**What goes wrong:** A well-meaning "re-enrich on view" or a fetch in the Roadmap screen makes the offline render depend on the hotspot — the demo dies on a dead connection.
**Why it happens:** Conflating the optional live-enrich flourish with the default render.
**How to avoid:** `buildRoadmap()` is a pure function with zero imports that touch `fetch`/`/api`. Add a Wave-0 test that builds a roadmap with no network and asserts a fully-populated 6-section result. The only online touch is the build-time bake (D-04), which writes to a file, not the render.
**Warning signs:** Any `fetch`/`await`/`/api` reference inside `shared/engine/roadmap.ts` or the default render of the Roadmap screen.

### Pitfall 4: Print stylesheet leaking SPA chrome / breaking pagination
**What goes wrong:** `window.print()` dumps the whole SPA (nav, buttons, other screens) or splits a section awkwardly across pages.
**Why it happens:** No `@media print` rules; the print root isn't isolated.
**How to avoid:** Standard print CSS: hide everything except the roadmap (`@media print { .no-print { display: none } }` or a print-root + sibling hide); `page-break-inside: avoid` (modern: `break-inside: avoid`) on each section; remove fixed/sticky positioning in print; set a sane print font size. MEDIUM confidence — tune against the real layout. See PDF export below.
**Warning signs:** PDF shows the nav bar / "Pull live data" button; a section's heading is orphaned at a page bottom.

### Pitfall 5: Asserting the wrong invariant in tests
**What goes wrong:** A test asserts `monthsToFund === 8` (internal) and passes, but the rendered `detail` string is malformed — false comfort.
**Why it happens:** Testing a pre-render intermediate instead of the user-facing output (documented in MEMORY for this project).
**How to avoid:** Assert the compiled `Roadmap.sections[...].steps[...].detail` string the user actually sees.

## Code Examples

### Building the roadmap from engine output (offline, deterministic)
```typescript
// Source: composed from shared/engine/index.ts (rankCities) + the buildRoadmap pattern above
import { rankCities } from '../shared/engine';
import { buildRoadmap } from '../shared/engine/roadmap';

const { results } = rankCities(profile);
const top = results[0];                 // #1 match (could be any US city — engine decides)
const roadmap = buildRoadmap(profile, top); // pure, no network → safe offline (ROAD-03)
```

### Enrich validator (build-time, preserves authored truth — D-05)
```typescript
// Source: extends the Phase 5 validation idiom in api/live-core.ts (validateItems)
// Returns enriched detail strings ONLY if every authored invariant is preserved;
// otherwise the caller keeps the authored detail (never ships the LLM version).
interface EnrichedStep { label: string; detail: string; sourceUrl?: string }

export function acceptEnrichment(
  authored: { label: string; detail: string; sourceUrl?: string }[],
  llm: unknown,
): { detail: string }[] {
  if (!Array.isArray(llm) || llm.length !== authored.length) {
    throw new Error('enrich rejected: step count changed (D-05)');
  }
  return authored.map((a, i) => {
    const e = llm[i] as Partial<EnrichedStep>;
    if (typeof e?.detail !== 'string') throw new Error('enrich rejected: missing detail');
    if (e.label !== undefined && e.label !== a.label)
      throw new Error('enrich rejected: label mutated (D-05)');
    if (e.sourceUrl !== undefined && e.sourceUrl !== a.sourceUrl)
      throw new Error('enrich rejected: sourceUrl mutated (D-05)');
    return { detail: e.detail }; // polished prose ONLY
  });
}
```

### Print CSS skeleton (PDF export)
```css
/* Source: standard print-stylesheet practice (MDN @media print) — tune to layout */
@media print {
  /* hide app chrome: nav, export button, other screens */
  .app-nav, .no-print, button { display: none !important; }
  /* isolate the roadmap */
  .roadmap-print-root { position: static; width: 100%; }
  /* keep each of the 6 sections intact across page breaks */
  .roadmap-section { break-inside: avoid; page-break-inside: avoid; }
  /* drop dark theme for ink/readability */
  body { background: #fff; color: #000; }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `page-break-inside: avoid` | `break-inside: avoid` (keep both for support) | CSS Fragmentation L3 | Use both properties for cross-browser pagination. `[CITED: MDN break-inside]` |
| PDF via heavy client libs | Browser `window.print()` → "Save as PDF" | Long stable | Zero-dep, offline, sufficient for a demo export (locked). `[CITED: MDN Window.print]` |
| Token-string templating | Type-safe function interpolation | n/a (project style) | Matches this repo's pure-function engine; compile errors instead of silent no-ops. `[ASSUMED]` (idiom judgment) |

**Deprecated/outdated:** None relevant — the phase adds no new external tooling.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | International golden-path city is **London/UK**, not Lisbon | Summary, Pitfall 1, Open Q1 | If demo script truly needs Lisbon, a Phase 4 Portugal city + `pt-2026` model must be built first (out of Phase 6 scope) — would block the international roadmap. Confidence is HIGH that London is *what's buildable now*; the residual risk is purely a demo-script decision. |
| A2 | An authored `targetFundUSD` relocation-cost constant exists (e.g. flights + deposit + buffer) to drive `monthsToFund` | Pattern 3 | If unsourced/wrong, the marquee timeline number is misleading. Author it as a sourced, conservative estimate per destination; tag the source in the step. `[ASSUMED]` until sourced. |
| A3 | The visa headline pathway for US→UK is a UK work/talent route (Skilled Worker / Global Talent), cited to GOV.UK | D-08 note, Pitfall 1 | Wrong pathway = credibility risk in Q&A. Author from official GOV.UK sources (VISA-04). Do not invent figures. |
| A4 | Demo persona profession/age/housing = `Software Engineer / 28 / rent` (from `demo-profile.json`, marked provisional) | Coverage | Persona is explicitly provisional and gates authoring + capture. Confirm before authoring persona-specific steps (Open Q2). |
| A5 | The #1 US match for the finalized persona is what `rankCities()` returns (not assumed to be Austin) | Pattern 1, Code Examples | Authoring the US roadmap against the wrong city = generic fallback at demo. Run the engine for the pinned persona and author against the actual `results[0]`. |
| A6 | Phase 5 `scripts/capture-golden-path` will be on the working branch before the enrich-bake runs | Don't Hand-Roll, Env Availability | It is NOT present on this branch today (`scripts/` is empty). Enrich-bake (D-04) cannot run until it lands. Enrich is optional, so this does not block ROAD-01..03. |

## Open Questions (RESOLVED)

> Dispositioned at plan-phase 2026-06-05 by the orchestrator/user before planning. All three are resolved for Phase 6's purposes.

1. **Lisbon vs London for the international golden-path roadmap. — RESOLVED: London/UK.**
   - What we know: `cities.ts` has only US + London/UK; `FINANCIAL_MODELS` = {us, uk-2026}; `demo-profile.json` cities = Austin + London. CONTEXT calls Lisbon a "working assumption — confirm against the demo script." `[VERIFIED: cities.ts, financial.ts, demo-profile.json]`
   - **RESOLVED:** User confirmed **London/UK** (the buildable, Phase-5-pinned pair). Lisbon/Portugal is explicitly OUT of Phase 6 scope (would require a Phase 4 Portugal city + `pt-2026` model). The visa-section headline is a UK pathway, not Portugal D8. Locked in Plan 03.

2. **Demo persona finalization (shared blocker with Phase 5). — RESOLVED as provisional; does not block Plans 01-04.**
   - What we know: `demo-profile.json` is marked provisional (`Software Engineer / 28 / rent`).
   - **RESOLVED:** Persona remains provisional, but this only gates the OPTIONAL Plan 05 (enrich bake) and the demo narrative. Plans 02-04 are persona-independent (`US.US`/`US.UK` keyed by destination *country*; `buildRoadmap` resolves the top city via `rankCities().results[0]`). Build the compiler + generic fallback + authored content first; pin the persona before the optional bake.

3. **Roadmap UI placement — RESOLVED: Plan 04 dedicated screen.**
   - Claude's discretion / UI-phase. **RESOLVED:** Plan 04 builds a dedicated `Roadmap.jsx` screen reachable from results/city-detail (UI-SPEC was intentionally skipped; follows `src/screens/*` conventions). Not a research blocker.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| TypeScript / Vite / Vitest / React | All Phase 6 code | ✓ | per package.json | — |
| `window.print()` | PDF export | ✓ (browser-native) | n/a | — |
| `@anthropic-ai/sdk` + `/api` proxy | OPTIONAL enrich only | ✓ (Phase 5) | `^0.101.0` | Skip enrich; render authored `detail` (default) |
| `scripts/capture-golden-path` | OPTIONAL enrich-bake (D-04) | ✗ on this branch | — | Skip the bake; authored prose ships as-is (ROAD-01..03 unaffected) |
| Lisbon city + `pt-2026` financial model | A Lisbon roadmap (only if demo needs it) | ✗ | — | Use London/UK (built); else Phase 4 work |

**Missing dependencies with no fallback:** None block ROAD-01/02/03 — the critical path (authored templates + offline render + PDF) needs nothing missing.
**Missing dependencies with fallback:**
- `scripts/capture-golden-path` absent → the optional enrich-bake cannot run; the authored prose renders directly (offline, correct). This is acceptable because D-04 is explicitly optional.
- Lisbon/Portugal model absent → use London/UK as the international city.

## Validation Architecture

> `nyquist_validation: true` in config → section included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4 (`^4.1.8`) `[VERIFIED: package.json]` |
| Config file | Vitest via Vite; tests co-located `shared/engine/*.test.ts` `[VERIFIED: ls shared/engine]` |
| Quick run command | `npx vitest run shared/engine/roadmap.test.ts` |
| Full suite command | `npm test` (`vitest run`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ROAD-01 | `buildRoadmap` returns all 6 sections in order with non-empty threaded steps for a covered pair | unit | `npx vitest run shared/engine/roadmap.test.ts -t "covered pair"` | ❌ Wave 0 |
| ROAD-01 | Threaded numbers appear in `detail` (savings, profession, rent/buy) — assert the rendered string | unit | `npx vitest run shared/engine/roadmap.test.ts -t "threads numbers"` | ❌ Wave 0 |
| ROAD-01/D-07 | Uncovered pair → `GENERIC_TEMPLATE` (6 sections, no invented procedural steps) | unit | `npx vitest run shared/engine/roadmap.test.ts -t "fallback"` | ❌ Wave 0 |
| ROAD-01/D-02 | `monthlySavings <= 0` → honest deficit reframe, NO numeric timeline | unit | `npx vitest run shared/engine/roadmap.test.ts -t "negative savings"` | ❌ Wave 0 |
| ROAD-03 | `buildRoadmap` is pure: no network, deterministic, fully populated offline | unit | `npx vitest run shared/engine/roadmap.test.ts -t "offline deterministic"` | ❌ Wave 0 |
| ROAD-02/D-05 | `acceptEnrichment` rejects mutated label/sourceUrl/order/count; accepts polished detail | unit | `npx vitest run shared/engine/roadmap.test.ts -t "enrich preserves authored"` | ❌ Wave 0 |
| ROAD-03 (PDF) | Print CSS hides chrome, sections don't split | manual | Visual check: `window.print()` preview | manual-only (browser print preview not unit-testable) |
| VISA-04 | Visa section contains the UPL line + Premium teaser, no legal-advice phrasing | unit | `npx vitest run shared/engine/roadmap.test.ts -t "visa UPL"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run shared/engine/roadmap.test.ts`
- **Per wave merge:** `npm test` (full suite — keep the existing 123 green)
- **Phase gate:** Full suite green before `/gsd:verify-work`; manual PDF print-preview check recorded.

### Wave 0 Gaps
- [ ] `shared/engine/roadmap.test.ts` — RED tests covering ROAD-01/02/03 + D-02 + D-05 + D-07 + VISA-04
- [ ] Test fixtures: a covered persona (`citizenship: 'US'`, top city US + London/UK) and an uncovered pair; a negative-savings `MatchResult`
- [ ] No framework install needed (Vitest present)

## Security Domain

> `security_enforcement` not disabled in config → section included. This phase's surface is narrow (one optional LLM touchpoint at build time + UPL content).

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth in this phase. |
| V3 Session Management | no | No sessions. |
| V4 Access Control | no | Tier gate is Phase 8, not here. |
| V5 Input Validation | yes (enrich only) | Reuse/extend Phase 5 `sanitizeInput` + `extractJSON` + a stricter enrich validator (`acceptEnrichment`) that preserves authored label/sourceUrl/order (D-05). Default render takes no external input. |
| V6 Cryptography | no | No secrets handled in Phase 6 code; the Anthropic key stays server-side in the Phase 5 proxy. |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| LLM rewrites/invents procedural/legal/visa facts (enrich) | Tampering | Strict preservation validator; reject → fall back to authored `detail` (D-05/ROAD-02). |
| Malformed LLM JSON during bake | DoS / Tampering | Reuse Phase 5 `extractJSON` (throws → fall back to authored prose). Build-time only; never affects render. |
| Unauthorized Practice of Law in visa copy | Information disclosure / liability | Fixed authored UPL line ("informational only, not legal advice; consult a licensed attorney") + Premium-referral teaser, never personalized legal advice (VISA-04 / D-08). UPL line is authored, immutable, and never enrich-eligible. |
| Clickable source links on stage | (competition rule) | Render `sourceUrl` as source *name* text, never `<a>` (D-10). |

## Sources

### Primary (HIGH confidence)
- `shared/types.ts` (lines 178-187 Roadmap contract; 31-96 Profile; 98-157 City/MatchResult) — the locked contract being filled. `[VERIFIED]`
- `shared/engine/index.ts` (`rankCities`, `buildRawResult`, `RankingOutput`) — top-city + `MatchResult` source. `[VERIFIED]`
- `shared/engine/financial.ts` (`FINANCIAL_MODELS = {us, uk-2026}`, `FinancialModel`) — confirms no Portugal model. `[VERIFIED]`
- `shared/data/cities.ts` — only US cities + London/UK; no Lisbon/Portugal/Berlin/Toronto. `[VERIFIED]`
- `api/live.ts` + `api/live-core.ts` — Phase 5 proxy, fallback idiom, `extractJSON`/`validateItems`/`sanitizeInput` patterns the enrich extends. `[VERIFIED]`
- `data/golden-path/demo-profile.json` — persona = SWE/28/rent, cities = Austin + London. `[VERIFIED]`
- `data/golden-path/demo-results.json` — cache keyed `[category][cityName]`. `[VERIFIED]`
- `STRUCTURE.md`, `shared/README.md` — folder ownership, contract-first, "data/ holds roadmap templates". `[VERIFIED]`
- `.planning/phases/06-relocation-roadmap/06-CONTEXT.md`, `05-...-CONTEXT.md`, `REQUIREMENTS.md`, `api/README.md`, `package.json`, `.planning/config.json`. `[VERIFIED]`

### Secondary (MEDIUM confidence)
- MDN `Window.print()` and `@media print` / `break-inside` — print-to-PDF approach + pagination control. `[CITED: developer.mozilla.org]`

### Tertiary (LOW confidence)
- None. (City conflict resolved against primary codebase sources, not web search.)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new deps; all verified in package.json.
- Architecture (template/compiler/fallback/offline): HIGH — grounded in this repo's existing engine + `live.ts` idioms.
- Number-threading + D-02 reframe: HIGH — reads existing `MatchResult.monthlySavings`.
- City resolution (London not Lisbon): HIGH that London is what's buildable; the residual is a demo-script decision (Open Q1).
- PDF print CSS: MEDIUM — standard practice, tune against real layout.
- Enrich-bake reuse: MEDIUM — depends on the Phase 5 capture script not yet present on this branch (optional, non-blocking).

**Research date:** 2026-06-05
**Valid until:** ~2026-07-05 (stable; revisit if the demo persona/city is re-pinned or a Portugal model is added)
