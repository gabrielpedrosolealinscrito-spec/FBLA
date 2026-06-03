# Phase 2: Quiz & Profile Capture - Pattern Map

**Mapped:** 2026-06-02
**Files analyzed:** 13 (8 new, 5 modified)
**Analogs found:** 12 / 13 (Framer Motion transition has no in-repo analog — research-only)

> The repo already contains the **Phase 3 engine** (`shared/engine/*` TS + colocated `.test.ts`)
> and the **Phase 3 results UI** (`src/screens/results/*` JSX + `.test.jsx`). These are the
> direct structural twins for everything Phase 2 builds. Map to the **real files**, not the
> `[ASSUMED]` snippets in 02-RESEARCH.md — the research code is illustrative; the engine/results
> files are the conventions of record.

---

## File Classification

| New/Modified File | New/Mod | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|---------|------|-----------|----------------|---------------|
| `shared/quiz-engine/questions.ts` | new | data/config | transform | `shared/data/cities.ts` (typed data array) | role-match |
| `shared/quiz-engine/resolver.ts` | new | service (pure) | transform | `shared/engine/index.ts` (pure orchestrator) | exact |
| `shared/quiz-engine/tension.ts` | new | service (pure) | event-driven (signal) | `shared/engine/dealbreakers.ts` `checkReconfirm` | exact |
| `shared/quiz-engine/synthesizer.ts` | new | service (pure) | transform | `shared/engine/scoring.ts` `rankToWeight` | exact |
| `shared/quiz-engine/*.test.ts` | new | test | — | `shared/engine/scoring.test.ts` | exact |
| `src/screens/quiz/QuizShell.jsx` | new | component (container) | request-response (state machine) | `src/screens/PotentialApp.jsx` step===1 block + `src/screens/results/ResultsView.jsx` | role-match |
| `src/screens/quiz/QuestionCard.jsx` | new | component (router) | request-response | `src/screens/PotentialApp.jsx` `profileStep === N && (…)` blocks (render-by-current-state) | role-match |
| `src/screens/quiz/inputs/*.jsx` | new | component (leaf) | request-response | `PotentialApp.jsx` pill/slider/input primitives | role-match |
| `src/screens/quiz/ProgressBar.jsx` | new | component (leaf) | — | `PotentialApp.jsx` lines 182–186 progress bar | role-match |
| `src/screens/quiz/QuizShell.test.jsx` | new | test | — | `src/screens/results/ResultsView.test.jsx` | exact |
| `shared/types.ts` | **mod** | contract | — | itself (extend `Profile` in place) | self |
| `src/screens/PotentialApp.jsx` | **mod** | integration seam | request-response | itself (step===1 → mount QuizShell) | self |
| `package.json` + `index.css` | **mod** | config | — | existing (framer-motion install + range-thumb CSS) | self |

> **Component→file note (UI-SPEC has 13 components, NOT 13 files):** most UI-SPEC inventory items
> are sub-sections of the files above. Top Bar → `ProgressBar.jsx`; Question Header / Going Global
> group header / Tension callout / Dealbreaker warning / Idle sprite / Loader → rendered *inside*
> `QuestionCard.jsx` (or `QuizShell.jsx`). Single/Multi-Select/Slider/FreeText → `inputs/*.jsx`.
> Do not mint one file per UI-SPEC component.

---

## Shared Patterns

These apply across multiple new files. Get them right once.

### SP-1: `.js` import extensions in TS files (LOAD-BEARING)
**Source:** `shared/engine/scoring.ts` lines 9–10, `scoring.test.ts` line 12
**Apply to:** every new `shared/quiz-engine/*.ts` and `*.test.ts`

Despite being TypeScript, modules import sibling/parent modules with a **`.js` extension** (ESM + `moduleResolution: "bundler"` in `tsconfig.json`). This is the single easiest convention to get wrong.
```typescript
// scoring.ts
import { SCORING_WEIGHTS, BASE_SCORE, PERSONAL_WEIGHT_SCALE } from './scoring-weights.js';
import type { Profile, City } from '../types.js';
```
```typescript
// scoring.test.ts
import { computeRawScore, BASE_SCORE } from './scoring.js';
import type { Profile, City } from '../types.js';
```
So new files do: `import { ALL_QUESTIONS } from './questions.js'`, `import type { Profile } from '../types.js'`, etc. Importing `.js` from `.js` constants is fine too (e.g. `dealbreakers.ts` dynamic-imports `'../data/constants.js'`).

### SP-2: Module header comment block
**Source:** every `shared/engine/*.ts` (e.g. `scoring.ts` lines 1–7, `index.ts` lines 1–17)
**Apply to:** all new `shared/quiz-engine/*.ts`

Each engine module opens with a boxed `─` comment naming the module, its phase/plan, the governing decisions (D-xx), and key invariants. Replicate this voice for `questions.ts` / `resolver.ts` / `tension.ts` / `synthesizer.ts` (cite D-02/D-03/D-04 + the resolver "trigger-before-injection" invariant from 02-RESEARCH Pattern 1).

### SP-3: Pure functions, exported, named for their test
**Source:** `scoring.ts` line 134 (`computeRawScore`) + line 172 alias `scoreCity`; `dealbreakers.ts` exports `getTriggeredDealbreakers`/`applyPenalties`/`checkReconfirm`
**Apply to:** `resolver.ts`, `tension.ts`, `synthesizer.ts`

Logic is pure, deterministic, side-effect-free, and the public function name is exactly what the test imports. Provide an alias export when the plan interface name differs from the internal name (see `scoreCity = computeRawScore`).

### SP-4: Signal-or-null return shape
**Source:** `dealbreakers.ts` `checkReconfirm` lines 282–304 (returns `ReconfirmSignal | null`)
**Apply to:** `tension.ts` `detectTension(answers): TensionResult | null`

Tension detection mirrors `checkReconfirm` exactly: compute conditions, return a typed signal object when fired, return `null` otherwise. Export the result interface alongside the function.

### SP-5: Design tokens copied verbatim into each src component
**Source:** `src/screens/results/ResultsView.jsx` lines 8–31 (`css`, `mono`, `pill`, `fmt` exported consts); `CityDetail.jsx` line 8 (imports tokens from `ResultsView.jsx` rather than re-declaring)
**Apply to:** `QuizShell.jsx`, `QuestionCard.jsx`, `inputs/*.jsx`, `ProgressBar.jsx`

`ResultsView.jsx` exports a `css` token object + style helpers at module top and spreads `{...css}` onto the root; `CityDetail.jsx` then **imports** those tokens from the sibling (`import { css, heading, mono, fmtFull } from './ResultsView.jsx'`) instead of duplicating — follow that: have one quiz file own the tokens (or a `shared/ui-tokens.js`) and import elsewhere. **However:** 02-UI-SPEC overrides the prototype token values (border `0.06` not `0.05`; `border-active 0.14`; `accent-dim 0.10`; adds `--cta-shadow #3fbb8c`, `--pixel`, `--body`; retires Instrument Serif). Use the **UI-SPEC `:root` block (02-UI-SPEC.md lines 130–146)** as the source of truth for token *values*, the `ResultsView.jsx`→`CityDetail.jsx` pattern for *where they live and how they're shared*.

### SP-6: Colocated tests, vitest globals, `import from './x.js'`
**Source:** `scoring.test.ts`, `ResultsView.test.jsx`, `vite.config.js` lines 10–14, `src/test-setup.js`
**Apply to:** all new test files

- Test lives next to source: `resolver.ts` ↔ `resolver.test.ts`; `QuizShell.jsx` ↔ `QuizShell.test.jsx`.
- `vite.config.js` already has `test: { environment:'jsdom', globals:true, setupFiles:['./src/test-setup.js'] }` — **no config change needed**.
- TS engine tests import from `'./x.js'` and `describe/it/expect` are global (note `ResultsView.test.jsx` line 6 still explicitly imports them from `'vitest'` — either works; engine tests rely on globals).
- jsdom + jest-dom matchers are wired via `src/test-setup.js`. Run: `npx vitest run shared/quiz-engine/ --reporter=verbose`.

---

## Pattern Assignments

### `shared/quiz-engine/synthesizer.ts` (service, transform)

**Analog:** `shared/engine/scoring.ts` — specifically `rankToWeight` (lines 34–61), which is the canonical weight-derivation logic the synthesizer mirrors and feeds.

**Weight derivation (copy this exact mapping — lines 46–60):**
```typescript
// importanceRank → numeric weight; rank 0 → 4 … rank 3 → 1 (then engine normalizes /4)
const rank = profile.importanceRank;
const raw = (cat: string): number => {
  const i = rank.indexOf(cat);
  if (i === 0) return 4;
  if (i === 1) return 3;
  if (i === 2) return 2;
  return 1; // rank 3 or missing
};
```
`synthesizeProfile` should emit `Profile.weights` using **this same 4/3/2/1 scale** (raw 1–4, NOT normalized) — `scoring.ts` lines 34–45 normalize `Profile.weights` to `[0,1]` on the engine side and `index.ts` `sanitizeProfile` (lines 45–56) clamps to `[0,4]` at entry. The contract is: **Phase 2 emits raw 1–4 weights; Phase 3 normalizes.** Do not pre-normalize in the synthesizer or weights double-shrink.

**Immigration auto-derive (Pitfall 5 — D-09):** always set, never leave undefined:
```typescript
immigrationStatus: answers["citizenship"] === "US" ? "citizen" : String(answers["immigrationStatus"] ?? ""),
```

**Defensive defaults:** `scoring.ts` uses `profile.lifestyleTags ?? []` (line 91). Mirror with `?? ""` / `?? []` / `?? 50` for every synthesized field so a sparse `answers` object never produces `undefined` on a required `Profile` field.

---

### `shared/quiz-engine/tension.ts` (service, signal)

**Analog:** `shared/engine/dealbreakers.ts` `checkReconfirm` (lines 282–304).

**Signal-or-null shape (mirror exactly):**
```typescript
export interface TensionResult {       // ↔ ReconfirmSignal
  afterId: string;
  question: QuestionDef;
}
export function detectTension(answers: Answers): TensionResult | null {
  // read answers, test known conflict pairs, return signal or null
}
```
**Switch/guard discipline:** `getTriggeredDealbreakers` (lines 88–231) uses a `switch` with an explicit `default: break` to silently ignore unknown inputs (T-3-08). Apply the same defensive stance: unknown/absent answer keys → no tension, never a crash. Read `02-RESEARCH.md` lines 357–385 for the concrete nature-vs-career pair; planner adds more pairs (Assumption A6).

---

### `shared/quiz-engine/resolver.ts` (service, pure orchestrator)

**Analog:** `shared/engine/index.ts` (lines 112–142) — the pure multi-pass orchestrator.

`getVisibleQuestions(answers, ALL_QUESTIONS)` composes the smaller pure fns (filter `showIf` → call `detectTension` → splice injection) the same way `rankCities` composes `buildRawResult` → `applyPenalties` → `checkReconfirm`. Also house `clearHiddenAnswers` here (02-RESEARCH Pitfall 3, lines 545–551).
**Invariant to document in the header (SP-2):** every conditional/injected question must appear at-or-after its trigger in `ALL_QUESTIONS` (02-RESEARCH Pattern 1 "load-bearing invariant", lines 250).

---

### `shared/quiz-engine/questions.ts` (typed data array)

**Analog:** `shared/data/cities.ts` — `export const CITIES_DATA: City[] = [...]` (a typed, exported, static data array consumed by the engine).

Same shape: define the `QuestionDef` / `Answers` / `QuestionType` interfaces (02-RESEARCH lines 256–270), then `export const ALL_QUESTIONS: QuestionDef[] = [...]`. Option sets pull from `shared/data/constants.js` (`PROFESSION_CATEGORIES`, `LIFESTYLE_TAGS`, `DEAL_BREAKERS`) — import them; do not re-type the lists. `DEAL_BREAKERS` strings MUST match `dealbreakers.ts` `getTriggeredDealbreakers` `case` labels **byte-for-byte** (e.g. `"Must be near ocean/coast"`), or Phase 3 silently no-ops them (T-3-08).

---

### `shared/quiz-engine/*.test.ts` (unit tests)

**Analog:** `shared/engine/scoring.test.ts` (lines 1–60).

Full typed fixture pattern: declare a complete `const testProfile: Profile = {...}` / `const testCity: City = {...}` literal (lines 16–60), import the function under test `from './x.js'`, assert. For `synthesizer.test.ts` build a representative `answers` object and assert each `Profile` field. **Critical fixture ripple — see "Contract Extension Constraint" below: these literal fixtures break if new `Profile` fields are required.**

---

### `src/screens/quiz/QuizShell.jsx` (container component)

**Analogs:** (1) the integration seam in `src/screens/PotentialApp.jsx` step===1 (lines 150–172) for state-machine + handoff; (2) `src/screens/results/ResultsView.jsx` for the src-component token/style structure.

**State-machine + helpers to port (PotentialApp.jsx lines 59–70):**
```javascript
const upd = (k, v) => setProfile(p => ({ ...p, [k]: v }));
const toggleArr = (key, val, max = 99) => { /* lines 63–70 — copy verbatim */ };
```
Adapt to `answers`-keyed state (research lines 588–615). `canProceed` derives from `currentQuestion.required` (PotentialApp uses a per-step `canProceed` array, lines 152–158 — the QuizShell version is per-question).

**Transitions:** the prototype uses CSS `fadeIn` + `setAnim` (lines 97–100, 59–60). 02-UI-SPEC + research mandate **Framer Motion `AnimatePresence`** for direction-aware slides instead — see "No Analog Found" (this is the one new dependency with no in-repo precedent).

---

### `src/screens/quiz/QuestionCard.jsx` + `inputs/*.jsx` + `ProgressBar.jsx`

**Analog:** `src/screens/PotentialApp.jsx` `profileStep === N && (…)` conditional blocks (lines 190, 220, 275, 312) — the verified render-by-current-state pattern. QuestionCard switches on `question.type` the same way PotentialApp switches on `profileStep`: one branch renders the matching input. (Note: `CityDetail.jsx` was evaluated and **rejected** as the analog — it is an expand/collapse `Section` list keyed on `expandedSection === id`, not a type→component router.)

**Primitives to extract from `PotentialApp.jsx`:**
- Pill (single/multi-select): `pill(active)` lines 91–96 (but use UI-SPEC pill anatomy §4/§5 for the pixel-art selected state — `box-shadow: 3px 3px 0`, icon chip, check mark).
- Slider: `<input type="range" ... accentColor:"#6EE7B7" />` lines 226/281; debt uses `#F87171`. Add 28px thumb CSS in `index.css` (UI-SPEC §6, Pitfall 4).
- FreeText: `inputStyle` lines 107–110 + `maxLength={200}` (ASVS V5).
- ProgressBar: segmented bar lines 182–186 + step counter line 186; UI-SPEC §2 upgrades to per-visible-question segments with mint(done)/amber(current) and `04/07` counter format.

---

### `shared/types.ts` (MODIFIED — contract extension, D-05)

**Analog:** itself. Extend the existing `Profile` interface in place (lines 12–42). New fields per 02-RESEARCH Pattern 4 (lines 459–479): `motivationToMove`, `workStyle`, `communityNeeds[]`, `paceOfLife`, `riskTolerance`, and a `tradeoffTolerance[]` structure. `weights?` already exists (line 39) — keep optional. **Announce the change in a small commit** (contract-first rule, STRUCTURE.md + file header lines 4–6).

---

### `src/screens/PotentialApp.jsx` (MODIFIED — integration seam)

**Analog:** itself. The current `step===1` block renders the inline 5-step quiz and, on final step, calls the engine and advances (lines 160–172):
```javascript
const { results: ranked, reconfirmSignal: signal } = rankCities(profile);
setResults(ranked); setReconfirmSignal(signal || null);
setSelectedCity(null); setSortBy("match"); setExpandedSection(null);
goStep(2);
```
**The rebuild:** replace the inline quiz JSX with `<QuizShell onComplete={(profile) => { ... }} />`, where `onComplete` runs **exactly this existing handoff** (call `rankCities`, set results, `goStep(2)`). `QuizShell` owns capture + `synthesizeProfile`; `PotentialApp` keeps owning the `rankCities`→results→`goStep(2)` wiring. Do not duplicate the engine call inside QuizShell.

---

## Contract Extension Constraint (ripple from `shared/types.ts`)

**`strict: true` (tsconfig) + adding *required* fields to `Profile` breaks every existing typed fixture.** `scoring.test.ts` (lines 16–38) and other engine tests declare full `const testProfile: Profile = {...}` literals. Two options for the planner:
1. **Make new `Profile` fields optional** (`motivationToMove?: string`, etc.) — mirrors the existing `weights?` pattern (types.ts line 39), zero fixture churn, but `synthesizeProfile` must still always populate them.
2. **Make them required** and update every existing fixture literal in `shared/engine/*.test.ts`.

Recommend option 1 for new dimension fields (Phase 3 already defends with `?? []` / `?? 50` defaults), unless a field is genuinely required by downstream keying. Flag for planner decision.

---

## No Analog Found

| File / Concern | Role | Data Flow | Reason |
|----------------|------|-----------|--------|
| Framer Motion `AnimatePresence` direction-aware transition (in `QuizShell.jsx`) | component motion | — | **Not installed** (package.json confirms no framer-motion). The only in-repo transition is the CSS `fadeIn`/`setAnim` pattern (`PotentialApp.jsx` lines 97–100, 59–60), which has **no direction concept**. The `AnimatePresence` snippet in 02-RESEARCH (lines 145–172) / 02-UI-SPEC Motion Contract is **research-only, not a codebase pattern**. Planner must gate `npm install framer-motion` behind a `checkpoint:human-verify` (02-RESEARCH Package Legitimacy Audit). CSS `fadeIn` is the no-install fallback analog. |
| `shared/quiz-engine/` directory itself | — | — | New sibling to `shared/engine/`. No directory exists yet, but `shared/engine/` is the exact structural precedent (TS modules + `.test.ts` + `.gitkeep`). Announce the addition per contract-first rule (Open Question 1: treat as frontend-owned for this phase). |

---

## Metadata

**Analog search scope:** `shared/` (types, data, engine), `src/screens/` (PotentialApp, results/ — ResultsView, CityDetail), `api/`, root config (vite.config.js, tsconfig.json, package.json), `src/test-setup.js`
**Files scanned:** 13 read in full or targeted; engine + results are the load-bearing twins
**Key conventions of record:** `.js` import extensions in TS (SP-1); boxed module headers (SP-2); pure signal-or-null fns (SP-4); token-share via sibling import + UI-SPEC values (SP-5); colocated vitest tests, no config change needed (SP-6)
**Pattern extraction date:** 2026-06-02
