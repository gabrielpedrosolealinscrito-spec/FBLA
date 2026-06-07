# Phase 7: Visa Concierge — Pattern Map

**Mapped:** 2026-06-05
**Files analyzed:** 4 (3 new, 1 existing screen slot)
**Analogs found:** 4 / 4

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `shared/data/visa-pathways.ts` | data module | authored constants (batch) | `shared/data/roadmap-templates.ts` | exact role — flatter shape (no TemplateStep function indirection) |
| `shared/engine/visa.ts` | engine / utility | transform (pure, offline) | `shared/engine/roadmap.ts` | exact |
| `shared/engine/visa.test.ts` | test | unit | `shared/engine/roadmap.test.ts` | exact |
| `src/screens/Visa.jsx` | screen component | request-response (offline) | **SPLIT:** styling+grid → `PotentialApp.jsx` city-detail; content-loop+sources-as-text → `Roadmap.jsx` | split (see note) |

**Visa.jsx split rationale:** `Roadmap.jsx` uses a CSS-template-literal + className architecture with the gold palette (`--accent:#e2b56b`, `--bg:#070a11`) and `@media` queries. The Phase 7 UI-SPEC explicitly mandates the mint token system (`--accent:#6EE7B7`, `--bg:#08090C`), inline-style objects, and `auto-fit` grid with no `@media` breakpoints (Phase 2 D-01 lock). These are incompatible. The analog must be split: PotentialApp.jsx (inline css object + auto-fit grid + token definitions) for the styling shell; Roadmap.jsx (authored-content `.map` loop + sources-as-text pattern) for the section rendering discipline.

---

## Pattern Assignments

### `shared/data/visa-pathways.ts` (data module, authored constants)

**Primary analog:** `shared/data/roadmap-templates.ts`
**Secondary analog:** `shared/data/cities.ts` (simpler flat export shape; use for the `VISA_PATHWAYS` record pattern)

**Key shape difference vs. roadmap-templates.ts:** The roadmap data module uses a nested `Record<string, Record<string, RoadmapTemplate>>` (citizenship × destination) and `TemplateStep.detail` as a function that interpolates runtime context. `visa-pathways.ts` is FLAT — `Record<string, VisaPathway[]>` keyed by citizenship only, and all `VisaPathway` fields are plain strings/string arrays (no function indirection, no context object). Do not copy the `TemplateStep`/`RoadmapContext` function pattern.

**File header comment pattern** (`roadmap-templates.ts` lines 1–63):
```typescript
// ─────────────────────────────────────────────────────────────────
// Potential — [Module Name] (Phase X, D-NN/D-NN)
// [One-line description of what this file contains.]
//
// Sources:
//   [Figure 1 name] ([value]):
//     [Citation text with URL or authority]
//   [Figure 2 name] ...
// ─────────────────────────────────────────────────────────────────
```
Every authored numerical figure must have a corresponding Sources block entry citing the authority. All D8 and Express Entry figures in the research carry `checkpoint:human-verify` tags — the sources block must reflect those authority names.

**Import pattern** (`roadmap-templates.ts` line 65, `cities.ts` line 22):
```typescript
import type { VisaPathway } from '../types.js';
```
Note: `.js` extension is required (Vite + NodeNext resolution). Importing `VisaPathway` fills the locked contract at `shared/types.ts` lines 190–201. Do NOT redesign the contract.

**Exported constant pattern** (`roadmap-templates.ts` lines 147–136, `cities.ts` lines 24–25):
```typescript
// Named constant first, then the registry
export const PORTUGAL_D8: VisaPathway = { ... };
export const CANADA_EXPRESS_ENTRY: VisaPathway = { ... };
export const GENERIC_SKELETON: VisaPathway = { ... };

// Flat registry — citizenship key only (not citizenship × destination)
export const VISA_PATHWAYS: Record<string, VisaPathway[]> = {
  US: [PORTUGAL_D8, CANADA_EXPRESS_ENTRY],
};
```

Contrast with `roadmap-templates.ts` nested registry (lines 134–136):
```typescript
// roadmap-templates.ts NESTED (do NOT copy this shape for visa-pathways.ts):
export const ROADMAP_TEMPLATES: Record<string, Record<string, RoadmapTemplate>> = {
  US: {},
};
ROADMAP_TEMPLATES.US['US'] = US_DOMESTIC_TEMPLATE;
ROADMAP_TEMPLATES.US['UK'] = US_TO_UK_TEMPLATE;
```

**GENERIC_SKELETON pattern** — mirrors `GENERIC_TEMPLATE` from `roadmap-templates.ts` lines 147+: a real, honest fallback with no invented specifics. `destinationCountry: '[Country]'`, generic checklist headings, `officialSources` contains only the directive "verify at the official immigration authority for [Country]." Never a dead-end, never fake numbers (D-06 = Phase 6 D-07 mirror).

---

### `shared/engine/visa.ts` (engine utility, pure transform)

**Analog:** `shared/engine/roadmap.ts` (lines 1–147, all of it)

**File header comment pattern** (`roadmap.ts` lines 1–13):
```typescript
// ─────────────────────────────────────────────────────────────────
// Potential — [Engine name] (Phase X, REQ-NN/REQ-NN)
// Pure TypeScript: offline, deterministic [description].
// ZERO network calls on the render path.
//
// Invariants:
//   - [function] is a pure function: no mutation of inputs, no side effects.
//   - [constraint from decisions] ...
// ─────────────────────────────────────────────────────────────────
```

**Import pattern** (`roadmap.ts` lines 15–21):
```typescript
import type { Profile, MatchResult } from '../types.js';
import {
  VISA_PATHWAYS,
  GENERIC_SKELETON,
} from '../data/visa-pathways.js';
```
Note `.js` extension required.

**Pure function + fallback pattern** (`roadmap.ts` lines 75–95):
```typescript
// roadmap.ts: buildRoadmap — fallback on uncovered pair
export function buildRoadmap(profile: Profile, top: MatchResult): Roadmap {
  const tmpl =
    ROADMAP_TEMPLATES[profile.citizenship]?.[top.city.country] ?? GENERIC_TEMPLATE;
  // ... pure, no network calls
}
```

The visa screener equivalent:
```typescript
export function selectVisaPathways(
  profile: Profile,
  matchedCountry: string,  // accent-emphasis signal only — NOT a filter
): VisaScreenerResult[] {
  const citizenship = profile.citizenship || 'US';
  const pathways = VISA_PATHWAYS[citizenship];

  if (!pathways || pathways.length === 0) {
    // D-06: generic honest skeleton — never a dead-end
    return [{
      pathway: { ...GENERIC_SKELETON, destinationCountry: matchedCountry },
      fit: { grade: 'possible', gatingFactor: 'verify requirements at the official immigration authority' },
    }];
  }

  return pathways.map(pathway => ({
    pathway,
    fit: computeGradedFit(pathway, profile),
  }));
}
```

**JSDoc comment pattern** (`roadmap.ts` lines 44–58, 68–73):
```typescript
/**
 * [One-line summary].
 * [Offline/deterministic/no-network note if applicable].
 *
 * [Decision references in parentheses if relevant]
 *
 * @param profile - [description]
 * @param top     - [description]
 * @returns       - [description]
 */
```

**Helper function pattern** (`roadmap.ts` lines 32–36 `monthsToFund`): private helper functions that are pure computations go above the exported functions and carry JSDoc. For visa.ts: `gradeD8()` and `gradeExpressEntry()` are private helpers called from `computeGradedFit()`.

**Education string values** (confirmed from `shared/quiz-engine/questions.ts` lines 259–266): Phase 2 emits these exact `education` values:
- `'highschool'`, `'associates'`, `'bachelors'`, `'masters'`, `'doctorate'`, `'trade'`

`isPostSecondaryDegree()` must compare against these exact strings:
```typescript
function isPostSecondaryDegree(education: string): boolean {
  return ['associates', 'bachelors', 'masters', 'doctorate'].includes(education);
}
```
Do NOT compare against assumed strings like `'bachelor'` or `'Bachelor\'s Degree'` — the fixture in `roadmap.test.ts` line 24 uses `'bachelor'` (pre-Phase-2 fixture), but the live quiz emits `'bachelors'` (with trailing 's'). Use the questions.ts values.

**Exported interfaces pattern** (`roadmap.ts` uses types from `types.ts`; `visa.ts` needs local interfaces):
```typescript
// Interfaces not in shared/types.ts go at the top of visa.ts
export interface GradedFit {
  grade: 'strong' | 'possible' | 'long-shot';
  gatingFactor: string;
}

export interface VisaScreenerResult {
  pathway: VisaPathway;
  fit: GradedFit;
}
```

---

### `shared/engine/visa.test.ts` (test, unit)

**Analog:** `shared/engine/roadmap.test.ts` (all 296 lines)

**File header comment pattern** (`roadmap.test.ts` lines 1–7):
```typescript
// VISA-01 / VISA-02 / VISA-03 / VISA-04 / D-02 / D-06
// RED until shared/engine/visa.ts is implemented.
// These tests lock every Phase 7 engine behavior before implementation exists.
```

**Import pattern** (`roadmap.test.ts` lines 5–6):
```typescript
import { selectVisaPathways } from './visa.js';
import type { Profile } from '../types.js';
```

**Fixture pattern** (`roadmap.test.ts` lines 16–33): fixtures are plain `const` objects with the full Profile shape. For `visa.test.ts`, the minimal fixture needs `citizenship`, `hasRemote`, `income`, `age`, and `education` — the fields `computeGradedFit()` reads:
```typescript
const baseProfile: Profile = {
  profession: 'Software Engineer',
  hasRemote: true,
  income: 110000,
  savings: 25000,
  debt: 0,
  housing: 'rent',
  hasPartner: false,
  partnerIncome: 0,
  hasDependents: false,
  numDependents: 0,
  hasPets: false,
  age: 28,
  education: 'bachelors',  // exact Phase 2 value — not 'bachelor'
  currentCity: 'Austin, TX',
  citizenship: 'US',
  immigrationStatus: 'citizen',
  opennessToAbroad: 80,
  lifestyleTags: [],
  dealBreakers: [],
  importanceRank: ['cost', 'career', 'lifestyle', 'safety'],
  moveTimeline: '12mo',
};
```

**`describe` block structure** (`roadmap.test.ts` lines 165–295): one `describe` per behavioral group, one `it` per assertion:
```typescript
describe('selectVisaPathways — flagship model (VISA-01/VISA-02)', () => {
  it('returns BOTH Portugal D8 AND Canada EE for US citizen', () => { ... });
  it('matchedCountry does NOT filter results — both pathways returned for any city', () => { ... });
  it('returns generic skeleton for unlisted citizenship', () => { ... });
});

describe('computeGradedFit — D8 (VISA-01 D-03)', () => {
  it('grades Strong fit: hasRemote=true AND income >= threshold', () => { ... });
  it('grades Possible: hasRemote=true AND income < threshold', () => { ... });
  it('grades Long shot: hasRemote=false', () => { ... });
});

describe('computeGradedFit — Express Entry (VISA-01 D-03)', () => {
  it('grades Strong fit: age <= 35 AND post-secondary degree', () => { ... });
  it('grades Possible: age > 35 with degree', () => { ... });
  it('grades Long shot: age > 35 AND no post-secondary degree', () => { ... });
});

describe('VISA_PATHWAYS data integrity (VISA-03)', () => {
  it('every authored VisaPathway has non-empty officialSources[]', () => { ... });
  it('GENERIC_SKELETON officialSources contains verify directive', () => { ... });
});

describe('offline deterministic', () => {
  it('same inputs yield deeply-equal output on two consecutive calls', () => { ... });
});
```

**Assertion style** (`roadmap.test.ts` lines 166–178): use `expect(...).toBe(...)`, `expect(...).toHaveLength(...)`, `expect(...).not.toThrow()`, `expect(...).toMatch(/pattern/i)`. Do not use `toBeTruthy()` where `toBe(true)` is more precise.

---

### `src/screens/Visa.jsx` (screen component, offline request-response)

**SPLIT ANALOG — two sources, not one:**

#### Part A: Styling shell + token system + auto-fit grid
**Analog:** `src/screens/PotentialApp.jsx` city-detail section (lines 94–128 + 235–288)

The `css` object (lines 94–101) defines the token system all Phase 7 JSX inherits:
```javascript
const css = {
  "--bg":"#08090C","--surface":"#111318","--card":"#171B22","--card-hover":"#1C2029",
  "--border":"rgba(255,255,255,0.05)","--border-active":"rgba(255,255,255,0.12)",
  "--accent":"#6EE7B7","--accent2":"#FBBF24","--accent3":"#818CF8","--accent-dim":"rgba(110,231,183,0.08)",
  "--text":"#EEF2F7","--text2":"#8896AB","--text3":"#505C6F",
  "--neg":"#F87171","--pos":"#6EE7B7",
  fontFamily:"'Manrope', sans-serif", background:"var(--bg)", color:"var(--text)", minHeight:"100vh"
};
```

Core primitive style objects (lines 102–128):
```javascript
const heading = { fontFamily:"'Instrument Serif', serif" };
const mono = { fontFamily:"'JetBrains Mono', monospace" };
const label = {
  fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)",
  display:"block", marginBottom:8, fontWeight:600
};
const fadeIn = {
  opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(24px)",
  transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)"
};
const pill = (active) => ({
  padding:"8px 16px", borderRadius:10, border: active ? "1.5px solid var(--accent)" : "1px solid var(--border)",
  background: active ? "var(--accent-dim)" : "var(--card)", color: active ? "var(--accent)" : "var(--text2)",
  fontSize:13, cursor:"pointer", fontWeight: active ? 600 : 400, transition:"all 0.2s", fontFamily:"inherit",
  display:"inline-flex", alignItems:"center", gap:6
});
```

**`auto-fit` grid pattern** (`PotentialApp.jsx` line 272) — this IS the comparison-grid pattern the UI-SPEC mandates:
```javascript
// Financial Overview grid — same auto-fit pattern for pathway comparison
<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:10 }}>
```
For the pathway comparison table (2 columns, 300px minimum per the UI-SPEC):
```javascript
<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 16,
  marginBottom: 28,
}}>
```
No `@media` breakpoints — the inline-style architecture does not support them. The `auto-fit` collapse IS the responsive behavior.

**Screen container pattern** (`PotentialApp.jsx` line 243):
```javascript
<div style={{ maxWidth:700, margin:"0 auto", padding:"24px 24px 60px", ...fadeIn }}>
```
Phase 7 uses `maxWidth:720` (wider, per UI-SPEC for comparison table) — same pattern, different value.

**anim / fadeIn trigger pattern** (`PotentialApp.jsx` lines 29–30, 57–58):
```javascript
const [anim, setAnim] = useState(false);
// On mount or navigation:
useEffect(() => { setTimeout(() => setAnim(true), 80); }, []);
// goStep pattern for screen transitions:
const goStep = (s) => { setStep(s); setAnim(false); setTimeout(() => setAnim(true), 60); };
```
Visa.jsx uses `useEffect(() => { setTimeout(() => setAnim(true), 60); }, [])` on mount.

**Card pattern** (`PotentialApp.jsx` lines 270, 290):
```javascript
<div style={{ background:"var(--card)", borderRadius:16, border:"1px solid var(--border)", marginBottom:12 }}>
```

**Surface card pattern** (`PotentialApp.jsx` line 279):
```javascript
<div style={{ background:"var(--surface)", borderRadius:10, padding:"14px 16px", border:"1px solid var(--border)" }}>
```

#### Part B: Authored-content loop + sources-as-text discipline
**Analog:** `src/screens/Roadmap.jsx` lines 160–178

The `.map` over authored sections pattern:
```jsx
{roadmap.sections.map((section) => (
  <div key={section.id} className="rdm-section">
    <p className="rdm-section-title">
      {SECTION_ICONS[section.id] ?? ''} {section.title}
    </p>
    {section.steps.map((step, i) => (
      <div key={i} className="rdm-step">
        <p className="rdm-step-label">{step.label}</p>
        <p className="rdm-step-detail">{step.detail}</p>
        {/* Source name rendered as TEXT — never a clickable link (D-10) */}
        {step.sourceUrl && (
          <span className="rdm-step-source">Source: {step.sourceUrl}</span>
        )}
      </div>
    ))}
  </div>
))}
```

For Visa.jsx, translate this pattern to inline styles and use `pathway.officialSources.map()` rendered as `<span>` or `<p>` elements — never `<a href>`. Each `VisaPathway` field (requirements, pros, cons, documentChecklist, officialSources) maps over its string array.

#### Part C: Disclaimer banner
**Analog:** `src/screens/Quiz.jsx` lines 79–81 `.warn` block (CSS class version) + UI-SPEC §6 (inline-style version)

The Quiz.jsx CSS-class dealbreaker warning:
```css
.warn { margin-top:12px; background:var(--warn-dim); border:1px solid color-mix(in srgb,var(--warn) 22%,transparent); border-radius:12px; padding:12px 16px }
.warn b { display:block; font-size:13px; font-weight:600; color:var(--warn); margin-bottom:3px }
.warn span { font-size:13px; color:var(--dim); line-height:1.6 }
```

Translated to inline-style (Phase 7 must use inline — no className):
```javascript
// Disclaimer banner (VISA-04) — always rendered above pathway content
<div style={{
  background: "var(--warn-dim)",            // rgba(251,191,36,0.08)
  border: "1px solid rgba(251,191,36,0.15)",
  borderRadius: 12,
  padding: "12px 16px",
  marginBottom: 28,
}}>
  <div style={{ fontSize:13, fontWeight:600, color:"#FBBF24", marginBottom:4 }}>
    ⚠ Not legal advice.
  </div>
  <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>
    This is an informational assessment only. Consult a licensed immigration attorney before acting on this information.
  </div>
</div>
```
Note: `--warn-dim` is not defined as a CSS variable in the inline token system — use the raw `rgba(251,191,36,0.08)` value directly, matching the UI-SPEC.

#### Part D: Graded fit badge
**No direct codebase analog** — net-new component per UI-SPEC §1. Style from the UI-SPEC §1 style objects directly:

```javascript
// Grade → style mapping (inline styles, Phase 2 tokens)
const FIT_STYLES = {
  'strong': {
    background: "rgba(110,231,183,0.08)",     // --accent-dim
    border: "1px solid rgba(110,231,183,0.15)",
    color: "var(--accent)",                   // #6EE7B7
  },
  'possible': {
    background: "rgba(251,191,36,0.08)",      // --warn-dim
    border: "1px solid rgba(251,191,36,0.15)",
    color: "var(--accent2)",                  // #FBBF24
  },
  'long-shot': {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text2)",                    // #8896AB — NOT --neg (#F87171)
  },
};
const GRADE_ICONS = { 'strong': '✦', 'possible': '◐', 'long-shot': '○' };

// Badge wrapper (common for all grades):
const badgeBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
};
```

**UPL constraint:** Long shot badge MUST use `--text2` (neutral), never `--neg` (red). Red signals "denied/error" — the UPL boundary requires likelihood language, not determination language.

#### Part E: Attorney referral CTA
**Analog:** `PotentialApp.jsx` `btnPrimary` (line 114–118) — but use a secondary (non-accent) variant:
```javascript
// btnPrimary (PotentialApp.jsx line 114) — DO NOT copy this for the CTA:
const btnPrimary = {
  width:"100%", padding:"16px", background:"var(--accent)", color:"#08090C", border:"none",
  borderRadius:14, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
};

// Attorney CTA (secondary, non-functional placeholder — D-04):
<button style={{
  width: "100%",
  padding: "14px 16px",
  background: "var(--card)",
  border: "1px solid var(--border-active)",
  borderRadius: 14,
  fontSize: 15,
  fontWeight: 600,
  color: "var(--text2)",         // NOT --accent — secondary, not primary CTA
  cursor: "pointer",
  fontFamily: "inherit",
  letterSpacing: "0.03em",
  textAlign: "center",
}} onClick={() => {}}>  {/* Non-functional placeholder — D-04 */}
  Connect with a vetted immigration attorney
</button>
```

---

## Shared Patterns

### Token system (all JSX in Visa.jsx)
**Source:** `src/screens/PotentialApp.jsx` lines 94–101 (`css` object definition)
**Apply to:** Visa.jsx root container spread (`<div style={{ ...css, ... }}>` or CSS variable inheritance)

All Phase 7 color references use the `var(--token)` syntax pointing to these tokens. The tokens must be declared once on the root container as CSS custom properties via the spread pattern.

### Sources as styled text, never `<a>` links
**Source:** `src/screens/Roadmap.jsx` lines 169–173 (comment + implementation)
**Apply to:** `officialSources[]` rendering in Visa.jsx; "Data as of" stamp rendering
```jsx
{/* Source name rendered as TEXT — never a clickable link (D-10 / see-not-click) */}
{step.sourceUrl && (
  <span className="rdm-step-source">Source: {step.sourceUrl}</span>
)}
```
Translation for Visa.jsx (inline style):
```jsx
{pathway.officialSources.map((src, i) => (
  <p key={i} style={{ fontSize:11, color:"var(--text3)", lineHeight:1.5, margin:"2px 0" }}>{src}</p>
))}
```

### Offline-mandatory critical path
**Source:** `shared/engine/roadmap.ts` header comment + `buildRoadmap` signature (no async, no network)
**Apply to:** `selectVisaPathways()` in visa.ts — must be synchronous, no `fetch`, no `await`

### `?? GENERIC` fallback pattern (D-06)
**Source:** `shared/engine/roadmap.ts` lines 75–79
```typescript
const tmpl =
  ROADMAP_TEMPLATES[profile.citizenship]?.[top.city.country] ?? GENERIC_TEMPLATE;
```
**Apply to:** `selectVisaPathways()` — `VISA_PATHWAYS[citizenship] ?? undefined` → fallback to `GENERIC_SKELETON`

### Authored truth boundary (no LLM-invented fields)
**Source:** `shared/engine/roadmap.ts` lines 116–147 (`acceptEnrichment` + ROAD-02 comment)
**Apply to:** All VisaPathway authored fields. No `acceptEnrichment` equivalent needed for visa (prose-enrich is explicitly out of scope for v1 per D-05/deferred) — just note the boundary in the visa.ts file header.

### `.js` extension on TypeScript imports
**Source:** All files in `shared/` (e.g., `roadmap.ts` line 15: `from '../types.js'`)
**Apply to:** All imports in `visa-pathways.ts`, `visa.ts`, `visa.test.ts`

### `--warn-dim` inline value (not CSS variable name)
**Observation:** The mint token system declared in `PotentialApp.jsx` css object does NOT include `--warn-dim` or `--warn` as declared tokens (lines 94–101 only define the tokens shown). Quiz.jsx uses these as CSS class variables in its own CSS block (line 45: `--warn:#e2b56b; --warn-dim:rgba(226,181,107,.08)` — note: gold palette, wrong for Phase 7). Use the raw rgba values for Phase 7 inline styles.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| Graded fit badge (inline component in Visa.jsx) | sub-component | display | No existing fit/grade badge pattern in codebase — net-new per UI-SPEC §1. Use UI-SPEC style objects directly. |

---

## Metadata

**Analog search scope:** `shared/data/`, `shared/engine/`, `src/screens/`, `src/screens/PotentialApp.jsx`, `shared/quiz-engine/questions.ts`
**Files scanned:** 10 (roadmap-templates.ts, roadmap.ts, roadmap.test.ts, dealbreakers.test.ts, cities.ts, types.ts, PotentialApp.jsx, Roadmap.jsx, Quiz.jsx, questions.ts)
**Pattern extraction date:** 2026-06-05
