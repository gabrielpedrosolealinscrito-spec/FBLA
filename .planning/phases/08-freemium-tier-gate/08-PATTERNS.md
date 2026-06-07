# Phase 8: Freemium Tier Gate - Pattern Map

**Mapped:** 2026-06-06
**Files analyzed:** 7 (2 logic/contract, 4 new components, 1 host screen modified)
**Analogs found:** 6 / 7 (visa section + D-01 "why" block = no analog)

> **Read-the-codebase corrections to RESEARCH.md.** RESEARCH.md's SECTIONS manifest references files that do **not exist** (`CityDetail.jsx`, `FinancialDetail`, `LiveAISection`) and assumes `Roadmap.jsx` is unbuilt — both wrong on this branch. It also implies the D-01 "why" paywall has real content to blur — it does not. This map points the planner at the **actual** locations. See "Reality Corrections" below before planning.

---

## Reality Corrections (planner MUST read first)

| RESEARCH.md claim | Actual codebase state | Consequence for planner |
|-------------------|------------------------|--------------------------|
| Gate wraps `CityDetail.jsx` via a `SECTIONS` manifest | **No `CityDetail.jsx` exists.** City detail is an inline block inside `src/screens/PotentialApp.jsx`, the `if (step === 2 && selectedCity)` branch (lines ~183-379). | The gate wraps **inline JSX blocks in PotentialApp.jsx**, not a separate file. Either extract those blocks first or wrap them in place. |
| `SECTIONS` entries: `Component: FinancialDetail`, `Component: LiveAISection` | **No such components exist.** Financials = inline block `PotentialApp.jsx:269-325`; Live-AI = inline block `PotentialApp.jsx:327-375`. | These are NOT `Component: null` (frosted-skeleton) cases — they are real, rendered content. Gate them as **blur-real-content**, not skeleton. |
| `roadmap → Component: null` (not built) | **`src/screens/Roadmap.jsx` exists and is wired.** Mounted as a full-screen takeover via `showRoadmap` state (`PotentialApp.jsx:153-162`), not an inline section. | Roadmap is a real analog, not a skeleton. Gate it at the **"View relocation roadmap" CTA** (`PotentialApp.jsx:256-267`) / `showRoadmap` branch, or blur the takeover. |
| `visa → Component: null` (not built) | **True — no visa screen exists.** Only `VisaPathway` type at `shared/types.ts:179-201`. | Genuine frosted-skeleton / "No Analog" case. |
| (D-01) Gate the #1 city **"why" / match-reasoning** for Free | **No "why" block renders anywhere.** City detail (`PotentialApp.jsx:244-375`) = hero + vibe tags (`:253`, generic city descriptors, NOT per-profile reasoning) + financials + expenses + AI sections. There is no "which of your profile factors drove this match" content. | **Second skeleton / no-analog case** — and it's D-01's centerpiece paywall. There is no real "why" block to blur. Planner must EITHER author a new match-reasoning block first, OR gate it as a frosted-skeleton. Do NOT write a task assuming a real "why" block exists to blur. |
| `src/components/` has existing components | **Empty** (only `.gitkeep`). | All 4 components are 100% greenfield — no in-folder sibling to copy. Pull style idioms from `src/screens/`. |
| `src/lib/tierGate.ts` is a fine alternative home for `canAccess` | `src/lib/` is all `.js` (matchEngine, fetchLive); `tsconfig.json` includes only `shared/**` + `api/**`. A `.ts` in `src/lib/` falls **outside type-checking**. | Put `canAccess` / `TIER_FEATURES` in **`shared/types.ts`** (or sibling `shared/tierGate.ts`) — the typed contract layer. See Shared Patterns. |

### ⚠ Theme-scope hazard (load-bearing for every new component)

`var(--accent)` is **screen-scoped**, not global. Two conflicting themes exist:

- **Gold theme** (UI-SPEC mandate): `ResultsMap.jsx` `.rm` scope, `Landing.jsx` `.lp` scope, `Roadmap.jsx` `.rdm` scope → `--accent:#e2b56b`, `--bg:#070a11`, `--card:rgba(255,255,255,.04)`.
- **Green theme** (the integration host): `PotentialApp.jsx` root `css` object (lines 94-101) → `--accent:#6EE7B7`, `--bg:#08090C`.

A component inherits whichever ancestor scope it mounts under. **RunsBadge mounts in PotentialApp's city-detail header → it would inherit `--accent:#6EE7B7` (green), directly violating UI-SPEC's gold mandate.** Same risk for any LockGate/PricingModal mounted inside PotentialApp's tree.

**Planner rule:** New Phase 8 components must **hardcode gold literals** (`#e2b56b`, `rgba(226,181,107,…)`, `#070a11`, `#f3ede1`) — exactly as RESEARCH.md's Pattern 2/6 code already does — and must **not** rely on `var(--accent)` resolving correctly. RESEARCH's RunsBadge/DemoTierSwitcher example code uses `var(--accent)` in one place; that is a bug under the green host scope. Override to literals.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `shared/types.ts` (extend) | model / contract | transform (pure) | `shared/types.ts` itself (Tier union :204) + `src/lib/matchEngine.js` (pure-fn idiom) | exact (same file) |
| `src/components/LockGate.jsx` (+`FrostedSkeleton`) | component | event-driven (gate) | `ResultsMap.jsx` (blur/overlay/scoped-CSS) + `Landing.jsx` `.panel` overlay | role + idiom match |
| `src/components/DemoTierSwitcher.jsx` | component | event-driven | `ResultsMap.jsx` `.pill` / `.sorts` segmented control (:45-48,116-120) | exact idiom |
| `src/components/PricingModal.jsx` | component | event-driven (overlay) | `Landing.jsx` `.panel` + body scroll-lock (`lp-locked`) + `ResultsMap.jsx` scoped `<style>` media query | role + idiom match |
| `src/components/RunsBadge.jsx` | component | request-response (read-only display) | `ResultsMap.jsx` `.row .sc` mono chip (:71) | exact idiom |
| `src/screens/PotentialApp.jsx` (extend) | host screen / store | event-driven | `PotentialApp.jsx` itself (step/state/mount-point idiom) + `Landing.jsx` window-listener pattern | exact (same file) |
| Logic tests + component tests | test | — | `src/lib/matchEngine.test.js` (logic) / no analog (component render) | partial |

---

## Pattern Assignments

### `shared/types.ts` — extend (model / contract, pure transform)

**Analog:** the file itself + `src/lib/matchEngine.js` pure-function idiom.

**Where to add:** append after the `Tier` union, which is currently the **last line** of the file (`shared/types.ts:204`):
```typescript
// ── Freemium tiers (TIER-01..03) ──
export type Tier = "free" | "basic" | "plus" | "premium";   // line 204 (file ends here)
```

**Add (per RESEARCH Pattern 1 + Pitfall 5), in this same file:**
```typescript
const TIER_ORDER: Record<Tier, number> = { free: 0, basic: 1, plus: 2, premium: 3 };
export const canAccess = (active: Tier, required: Tier): boolean =>
  TIER_ORDER[active] >= TIER_ORDER[required];

// rank cutoff per tier (D-01/D-12): free=1, basic=3, plus/premium=all
export const TIER_FEATURES = {
  rankShowUpTo: { free: 1, basic: 3, plus: Infinity, premium: Infinity },
} as const;

export const TIER_RUNS_MAP: Record<Tier, string | null> = {
  free: null,
  basic: "Basic · 1 of 1 run",
  plus: "Plus · 2 of 3 runs left",
  premium: "Premium · unlimited",
};
```

**Why here, not `src/lib/tierGate.ts`:** `tsconfig.json` includes only `shared/**` + `api/**`; `src/lib/` is `.js`-only. A `.ts` gate in `src/lib/` would not be type-checked and breaks the established "TS at contract layer, JSX in `src/`" split (stated in `tsconfig.json` notes and CONTEXT.md Established Patterns). If a sibling file is preferred for separation, use `shared/tierGate.ts` (still inside the tsconfig include glob).

**Import convention** (verified from `PotentialApp.jsx:2-7`): `src/` imports peers via relative specifiers (`'./Quiz.jsx'`, `'../lib/matchEngine.js'`); there is no path alias. For importing from `shared/`, use a relative path **without** the `.ts` extension — `import { canAccess } from '../../shared/types'` — and let Vite resolve it. Nothing in `src/` currently imports a `.ts` extension explicitly, and a literal `.ts` specifier can fail Vite resolution; match the extensionless convention for the contract layer.

---

### `src/components/LockGate.jsx` + `FrostedSkeleton` (component, event-driven gate)

**Analog:** `ResultsMap.jsx` (blur idiom, scoped CSS, inline SVG) + `Landing.jsx` `.panel` overlay.

**Scoped-CSS-in-component idiom** — the project's media-query / keyframe pattern is a `<style>{CSS}` tag inside the component, NOT a `.css` file (`ResultsMap.jsx:30-76,108`; `Roadmap.jsx` header comment makes this explicit):
```jsx
const CSS = `.rm{ ... @media(max-width:560px){ ... } }`;   // ResultsMap.jsx:30
return (<div className="rm"><style>{CSS}</style> ... </div>); // :107-108
```

**Blur — use `filter:blur()` on the content wrapper, NOT `backdrop-filter`.** Both exist in-repo but do different things (RESEARCH Pattern 3, verified):
- `backdrop-filter:blur(12px)` blurs what is BEHIND — used for glass headers: `ResultsMap.jsx:37` (`.top`), `Landing.jsx:35` (`.ctl`), `Landing.jsx:84` (`.panel`).
- `filter:blur(8px)` blurs the ELEMENT ITSELF — this is what LockGate needs on locked content. Precedent for `filter:blur` on an element: `Landing.jsx:23` (`.sun{...filter:blur(6px)}`), `Landing.jsx:26` (`.fog span{filter:blur(60px)}`).

**Inline padlock SVG** — matches the inline-SVG icon idiom (no icon library). Map-pin precedent at `ResultsMap.jsx:97-101`; control-icon precedent `Landing.jsx:104-107`. Stroke color **hardcode** `rgba(226,181,107,0.9)` (do not use `var(--accent)` — green-scope hazard).

**`prefers-reduced-motion` guard** (already the project convention) — `Landing.jsx:156`:
```javascript
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```
Honor it for the blur-dissolve (D-09): if reduced, snap to unlocked, skip the `filter`/`opacity` transition. `Landing.jsx:92` also has the CSS-level guard `@media (prefers-reduced-motion: reduce){.lp *{animation:none!important}}`.

**`will-change` precedent** for the compositor-eligible transition: `Landing.jsx:19,23` (`will-change:opacity` / `opacity,transform`). Add `will-change:filter` on transition start, remove after ~450ms.

**FrostedSkeleton** — no in-repo skeleton exists; build per RESEARCH Code Examples (static widths `[85,70,90,60]`). Card chrome should match the gold card idiom: `background:rgba(255,255,255,.04)` (`--card`), `border:1px solid rgba(243,237,225,.12)` (`--border`), `border-radius:14`. **Used for the visa section AND the D-01 "why" block** (both lack real content — see Reality Corrections). Hardcode the literals — do not inherit `var(--card)` from PotentialApp (green scope = `#171B22`).

---

### `src/components/DemoTierSwitcher.jsx` (component, event-driven)

**Analog:** `ResultsMap.jsx` `.pill` segmented control (exact idiom).

**Segmented-pill pattern** — active/inactive button styling (`ResultsMap.jsx:45-48` CSS, `:116-120` render):
```jsx
// CSS (ResultsMap.jsx:46-48)
.pill{font-family:inherit;font-size:13px;color:var(--dim);background:var(--card);border:1px solid var(--border);border-radius:100px;padding:7px 14px;cursor:pointer;transition:.2s}
.pill.on{color:var(--accent);border:1.5px solid var(--accent);background:var(--accent-dim);font-weight:600}
// render (ResultsMap.jsx:117-119)
{[["match","Best match"],...].map(([k,l]) => (
  <button key={k} className={`pill ${sortBy===k?"on":""}`} onClick={()=>setSortBy(k)}>{l}</button>
))}
```
RESEARCH's DemoTierSwitcher example reproduces this with inline styles and a fixed-bottom floating wrapper. **Hardcode gold** (`#e2b56b`, `rgba(226,181,107,0.13)`) per theme hazard. Floating-overlay backdrop precedent: `Landing.jsx:35` (`backdrop-filter:blur(8px)` on a fixed control).

**Visibility gate** (D-05): `if (!visible) return null;` — driven by `presenterMode` state lifted to PotentialApp (see host file). Responsive label abbreviation (UI-SPEC) via scoped `<style>` media query.

---

### `src/components/PricingModal.jsx` (component, event-driven overlay)

**Analog:** `Landing.jsx` `.panel` overlay + body scroll-lock; `ResultsMap.jsx` scoped-`<style>` media query.

**Overlay panel idiom** (`Landing.jsx:84-85`):
```css
.lp .panel{position:fixed;...background:rgba(13,16,22,.82);backdrop-filter:blur(14px);border:1px solid var(--ivory-faint);border-radius:16px;opacity:0;transform:translateY(10px);pointer-events:none;transition:.4s var(--ease)}
.lp .panel.open{opacity:1;transform:none;pointer-events:auto}
```
Entry/exit = `opacity` + `transform:translateY` transition on an `.open` class. RESEARCH Pattern 6 uses `backdrop-filter` on the modal CARD only and a plain `rgba` dim layer (GPU-safe) — keep that.

**Body scroll-lock** — reuse the EXISTING class `lp-locked` (`Landing.jsx:15` defines `body.lp-locked{overflow:hidden;height:100vh}`; `:152` adds, `:278` removes). RESEARCH Pattern 6 / UI-SPEC both call for reusing `lp-locked` — do NOT invent a new class:
```javascript
document.body.classList.add("lp-locked");    // open
document.body.classList.remove("lp-locked"); // close + cleanup
```

**Responsive grid** via scoped `<style>` `@media(max-width:520px)` (matches `ResultsMap.jsx:74` `@media(max-width:560px)` idiom). Plus card gets `order:-1` on mobile.

**Copy is locked by UI-SPEC** (Copywriting Contract): OQ-1 resolved → **include** "30-day money-back guarantee" in the trust footer. Basic = "Top 3 cities fully revealed" (D-12). TIERS_CONFIG + TESTIMONIALS arrays per RESEARCH Pattern 6, updated to those copy values. **Hardcode gold literals** throughout (RESEARCH's Pattern 6 already does).

---

### `src/components/RunsBadge.jsx` (component, read-only display)

**Analog:** `ResultsMap.jsx` `.row .sc` mono chip (exact idiom).

**Mono accent chip** (`ResultsMap.jsx:71`):
```css
.row .sc{font-family:var(--mono);font-size:11px;color:var(--accent);background:var(--accent-dim);padding:1px 7px;border-radius:6px;margin-left:8px}
```
RunsBadge is this chip at header scale: `font-family:'JetBrains Mono',monospace; font-size:11px; color:#e2b56b; background:rgba(226,181,107,0.13); padding:3px 10px; border-radius:6px`. Reads `TIER_RUNS_MAP[tier]`; `if (!label) return null` for free. **Hardcode gold** — this is the component most at risk from the green host scope (it mounts in PotentialApp's city-detail header, lines ~237-241).

---

### `src/screens/PotentialApp.jsx` — extend (host screen / state owner)

**Analog:** the file itself + `Landing.jsx` window-listener pattern.

**Lift state** to the existing top-level `useState` block (`PotentialApp.jsx:27-50` is the precedent — `step`, `profile`, `results`, `selectedCity`, `showRoadmap`, etc. all live here, prop-drilled; **zero React Context in the codebase**):
```jsx
const [tier, setTier] = useState("free");
const [presenterMode, setPresenterMode] = useState(false);
const [modalOpen, setModalOpen] = useState(false);
```

**Mount overlays outside the `if (step===N)` screen switches.** PotentialApp returns early per step (`:133,138,153,167,183`) and ends `return null` (`:381`). DemoTierSwitcher / PricingModal must render on top of every step — wrap the screen switch in a fragment, or render the overlays before each early return. RESEARCH State Architecture section covers this.

**Presenter gesture listener at root** (RESEARCH Pattern 4 / Pitfall 2). Pattern is derived from `Landing.jsx:268-271,275` (window listener inside `useEffect` with cleanup) — BUT it must live in **PotentialApp's** `useEffect([],[])` (the mount effect at `:53-55` is the precedent slot) so it survives step changes. Landing's listener unmounts with Landing; the presenter gesture must not. Use corner triple-tap (click + touchstart) per D-05.

**Gating the inline sections** (the real work — see Reality Corrections):
- Wrap financials block (`:269-325`) and live-AI block (`:327-375`) in `<LockGate requiredTier="basic"/"plus">` — blur-real-content mode.
- Gate the "View relocation roadmap" CTA (`:256-267`) / `showRoadmap` for `requiredTier="plus"`.
- Add the visa section as a `<LockGate requiredTier="premium">` with `children={null}` → FrostedSkeleton (no real content).
- Add the D-01 "why" / match-reasoning block: either author it (then blur-real-content for Free) or gate as `children={null}` → FrostedSkeleton. **No real "why" content exists today** — this is a build decision the planner must make explicit.
- Rank-gate the city list cutoff in **`ResultsMap.jsx`** (reads `TIER_FEATURES.rankShowUpTo[tier]`, renders top-N normally then a blurred-stack-with-count) — NOT in LockGate. ResultsMap owns sort/render order (`:80-87,133-141`).
- Pass `tier` as a prop to `ResultsMap` (extend its signature at `:78`).

---

## Shared Patterns

### Tier gate logic (single source of truth)
**Source:** `shared/types.ts` (extend, after :204) — `canAccess`, `TIER_FEATURES`, `TIER_RUNS_MAP`.
**Apply to:** LockGate (section gating), ResultsMap (rank gating), RunsBadge (label lookup), PricingModal (current-tier comparison).
**Idiom:** pure, typed, exhaustively unit-testable (mirrors `src/lib/matchEngine.js` pure-function style).

### Gold theme literals (NOT `var(--accent)`)
**Source:** `ResultsMap.jsx:31-34` / `Roadmap.jsx:17-19` token block (gold scope).
**Apply to:** every new component — hardcode `#e2b56b` / `rgba(226,181,107,…)` / `#070a11` / `#f3ede1` / `rgba(255,255,255,.04)`. Do not inherit CSS vars, because the integration host (`PotentialApp.jsx:94-101`) defines a conflicting **green** `--accent`.
```
--bg:#070a11  --card:rgba(255,255,255,.04)  --border:rgba(243,237,225,.12)
--accent:#e2b56b  --accent-dim:rgba(226,181,107,.13)  --ink:#f3ede1
--serif:'Instrument Serif',serif  --mono:'JetBrains Mono',monospace  --sans:'Manrope',sans-serif
```

### Scoped-CSS-in-component (no `.css` files)
**Source:** `ResultsMap.jsx:30-76,108`, `Roadmap.jsx` (explicit comment), `Landing.jsx:10-93`.
**Apply to:** any component needing `@media` / `@keyframes` (LockGate, DemoTierSwitcher, PricingModal). Inline `style={{}}` objects for everything else (the `PotentialApp.jsx:94-128` style-object idiom).

### Body scroll-lock (reuse existing class)
**Source:** `Landing.jsx:15` (`body.lp-locked{overflow:hidden;height:100vh}`), add/remove `:152,278`.
**Apply to:** PricingModal open/close. Reuse `lp-locked`; do not create a new class.

### Blur: `filter` vs `backdrop-filter`
**Source:** RESEARCH Pattern 3; in-repo at `ResultsMap.jsx:37`, `Landing.jsx:23,26,35,84`.
**Apply to:** LockGate locked content → `filter:blur(8px)`. Glass panels → `backdrop-filter`.

### Fonts (already globally loaded — no per-component import)
**Source:** `src/main.jsx` imports all `@fontsource/*` weights globally; `index.html` has no font links.
**Apply to:** reference by family name only (`'Instrument Serif'`, `'Manrope'`, `'JetBrains Mono'`). Available weights: Manrope 300-800, JetBrains Mono 400/500/600, Instrument Serif 400 + 400-italic. UI-SPEC's weight-600 requirement is covered (Manrope 600 + JetBrains Mono 600 loaded). **Do not** rely on Manrope 700 for anything new beyond what's loaded.

---

## No Analog Found

| File / concern | Role | Data Flow | Reason |
|----------------|------|-----------|--------|
| Visa Concierge section (inside LockGate `children={null}`) | component | — | No visa screen exists (only `VisaPathway` type at `shared/types.ts:179-201`). Genuine frosted-skeleton case. |
| D-01 #1-city **"why" / match-reasoning** block | component | — | **No "why" content renders anywhere** (`PotentialApp.jsx:244-375` has hero/vibe-tags/financials/expenses/AI only). D-01's centerpiece paywall has nothing real to blur. Planner must author the block or gate it as frosted-skeleton — same as visa. |
| `FrostedSkeleton` | component | — | No existing skeleton/loading-placeholder component. Build per RESEARCH Code Examples (static widths, gold card chrome). The closest loading idiom is the spinner at `PotentialApp.jsx:213-218`, but that's a spinner, not a skeleton. |
| Component-render tests (`LockGate`/`DemoTierSwitcher`/`RunsBadge`/`PricingModal`) | test | — | **No `.test.jsx`/`.test.tsx` exists anywhere.** `src/test-setup.js:6` references a `ResultsView.test.jsx` that does not exist. Setup is ready (`@testing-library/jest-dom` + `@testing-library/react` installed, jsdom env, `matchMedia` already mocked at `test-setup.js:13-30` → LockGate's reduced-motion check works in jsdom), but there is no render-test file to copy. Greenfield. |

**Logic tests DO have an analog:** `src/lib/matchEngine.test.js` (co-located `.test.js`, `globals:true`, no vitest import — `:9` imports the unit under test directly) for `canAccess`/`rankGate`. `tests/*.test.ts` (e.g. `tests/live-fallback.test.ts:12` imports `{ describe, it, expect, vi }` explicitly) for TS-side contract tests. Either location works; co-located matches the matchEngine precedent. Run with `npm test` (`vitest run`).

---

## Metadata

**Analog search scope:** `shared/`, `src/screens/`, `src/components/` (empty), `src/lib/`, `tests/`, root config (`vite.config.js`, `tsconfig.json`, `package.json`, `index.html`, `src/main.jsx`, `src/test-setup.js`).
**Files scanned:** 12 (3 read in full: ResultsMap.jsx, Landing.jsx, PotentialApp.jsx; Roadmap.jsx + types.ts read in part; config/test files grepped).
**Pattern extraction date:** 2026-06-06
**Key divergences from RESEARCH.md:** SECTIONS manifest references nonexistent files; `Roadmap.jsx` is built (gold theme, full-screen takeover w/ `onBack`); `src/components/` empty; `var(--accent)` is green in the host scope; D-01 "why" paywall has no real content to blur.
