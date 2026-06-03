# Phase 3: Matching & US Financial Spine — Pattern Map

**Mapped:** 2026-06-01
**Files analyzed:** 14 new/modified files
**Analogs found:** 9 / 14 (files with at least a partial codebase analog)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `shared/types.ts` (modified) | model/contract | — | itself (existing interfaces) | exact — extend in place |
| `shared/data/cities.ts` | data | — | `shared/data/constants.js` (module shape) + `CITIES_DATA` lines 11–24 in `PotentialApp.jsx` (record shape) | role-match |
| `shared/engine/scoring-weights.ts` | config | — | `shared/data/constants.js` (named-export pattern only) | partial — tuning-knob structure is novel |
| `shared/engine/financial.ts` | service | transform | `getSalary`/`getTakeHome`/`getExpenses`/`getSavings` in `PotentialApp.jsx` lines 76–102 | role-match (closure → pure-params transformation required) |
| `shared/engine/scoring.ts` | service | transform | `getMatchScore` in `PotentialApp.jsx` lines 104–142 | role-match (closure → pure-params transformation required) |
| `shared/engine/dealbreakers.ts` | service | transform | dealbreaker block inside `getMatchScore` lines 133–141 | partial — re-confirm signal is novel |
| `shared/engine/index.ts` | service | request-response | `nextProfile` callback lines 232–239 (map over cities, set results) | partial — two-pass + signal output is novel |
| `src/screens/results/ResultsView.jsx` | component | request-response | Results section of `PotentialApp.jsx` lines 448–505, sort logic lines 449–455 | role-match |
| `src/screens/results/CityDetail.jsx` | component | request-response | City detail section of `PotentialApp.jsx` lines 510–730, `Section` component lines 518–532 | role-match |
| `shared/engine/financial.test.ts` | test | — | none — no test framework installed | no analog |
| `shared/engine/index.test.ts` | test | — | none | no analog |
| `shared/engine/dealbreakers.test.ts` | test | — | none | no analog |
| `src/screens/results/ResultsView.test.jsx` | test | — | none | no analog |
| `src/test-setup.js` | config | — | none — vitest not installed yet | no analog |

---

## Pattern Assignments

### `shared/types.ts` (model/contract — extend in place)

**Analog:** itself

**Existing `City` interface** (lines 43–61) — the base to extend with new fields:

```typescript
// shared/types.ts lines 43–61 — EXISTING (do not remove any field)
export interface City {
  name: string;
  country: string;
  emoji: string;
  lat: number;
  lng: number;
  costIndex: number;
  medianRent: number;
  medianHome: number;
  avgTemp: number;
  vibe: string[];
  walkScore: number;
  transitScore: number;
  safetyIndex: number;
  jobGrowth: number;
  topIndustries: string[];
  financialModelId: string;
}
```

**Fields to ADD to `City`** (after line 60, before the closing brace) — required by engine + dealbreaker checks:

```typescript
  // Phase 3 additions — D-11 dealbreaker fields
  stateTax: number;          // flat state income tax % (0 = no state tax)
  summerHighF: number;       // NOAA avg daily high in hottest month (°F)
  winterLowF: number;        // NOAA avg daily low in coldest month (°F)
  nearMountains: boolean;    // within ~60 min drive of major mountain range
  nearCoast: boolean;        // within ~60 min drive of ocean/major coastal bay
  hasIntlAirport: boolean;   // has direct international routes
  pop: string;               // display: metro population label
  climate: string;           // display: climate description string
```

**Existing `Profile` interface** (lines 12–40) — check for `weights` field before engine task starts:

```typescript
// shared/types.ts lines 12–40 — EXISTING
export interface Profile {
  profession: string;
  hasRemote: boolean;
  income: number;
  savings: number;
  debt: number;
  housing: Housing;
  hasPartner: boolean;
  partnerIncome: number;
  hasDependents: boolean;
  numDependents: number;
  hasPets: boolean;
  age: number;
  education: string;
  currentCity: string;
  citizenship: string;
  immigrationStatus: string;
  opennessToAbroad: number;
  lifestyleTags: string[];
  dealBreakers: string[];
  importanceRank: string[];  // ["cost","career","lifestyle","safety"]
  moveTimeline: string;
  // NOTE: Phase 2 should add: weights: { cost: number; career: number; lifestyle: number; safety: number }
  // If absent, engine must derive from importanceRank using rankToWeight fallback
}
```

**Existing `MatchResult` interface** (lines 70–78) — already has `scoreFactors`, no changes needed:

```typescript
// shared/types.ts lines 70–78 — ALREADY CORRECT, do not change
export interface MatchResult {
  city: City;
  matchScore: number;
  scoreFactors: { factor: string; contribution: number }[];
  estSalary: number;
  monthlyTakeHome: number;
  expenses: ExpenseBreakdown;
  monthlySavings: number;
}
```

---

### `shared/data/cities.ts` (data module)

**Analog 1 — module structure:** `shared/data/constants.js` (lines 1–6)

```javascript
// constants.js pattern: header comment + named exports, plain .js, no default export
// ─────────────────────────────────────────────────────────────────
// Potential — Shared Static Constants
// Extracted from prototype; used by src/screens/PotentialApp.jsx
// and will be consumed by shared/engine/ in Phase 3 (MATCH-01).
// Plain .js — shared/data is backend-owned, no TS annotations yet.
// ─────────────────────────────────────────────────────────────────

export const SOME_CONSTANT = { ... };
```

**Key module conventions from `constants.js`:**
- Block-comment header identifying the file, source, and consumers
- Named exports only (no default export)
- `cities.ts` is TypeScript (unlike constants.js) because it must be typed to the `City` contract

**Analog 2 — record shape:** `CITIES_DATA` in `PotentialApp.jsx` (lines 11–24)

```javascript
// PotentialApp.jsx lines 11–24 — prototype seed shape (12 cities, inline in JSX)
const CITIES_DATA = [
  { name: "Austin, TX", emoji: "🎸", color: "#E8712B", lat: 30.27, lng: -97.74,
    pop: "2.3M metro", climate: "Hot summers, mild winters",
    costIndex: 103, stateTax: 0, medianRent: 1450, medianHome: 425000, avgTemp: 68,
    vibe: ["Creative","Tech","Outdoorsy","Nightlife"],
    walkScore: 41, transitScore: 32, safetyIndex: 72, jobGrowth: 4.2,
    topIndustries: ["Tech","Government","Healthcare","Music"] },
  // ... 11 more cities
];
```

**Target shape for `cities.ts`** — typed export, adds Phase 3 fields, drops `color` (display-only, not in contract). The Austin entry below is ILLUSTRATIVE SHAPE ONLY — use exact values from the 22-city table in 03-RESEARCH.md, not these numbers:

```typescript
// shared/data/cities.ts — target module shape (illustrative — see 03-RESEARCH.md for all 22 cities' values)
// ─────────────────────────────────────────────────────────────────
// Potential — US City Dataset (Phase 3)
// 22 curated US cities. Typed to shared/types.ts City interface.
// costIndex: US-national-average=100 scale (Numbeo NYC=100 × 1.431 rescaling, Austin=103 anchor)
// Sources: Zumper May 2026, Numbeo 2026, Walk Score, CurrentResults/NOAA, BLS, Tax Foundation
// ─────────────────────────────────────────────────────────────────
import type { City } from '../types.js';

export const CITIES_DATA: City[] = [
  {
    name: "Austin, TX",
    country: "US",
    financialModelId: "us",
    emoji: "🎸",
    lat: 30.27, lng: -97.74,
    pop: "2.3M metro",
    climate: "Hot summers, mild winters",
    costIndex: 103,
    medianRent: 1450, medianHome: 425000,
    avgTemp: 68, summerHighF: 97, winterLowF: 42,
    stateTax: 0,
    walkScore: 42, transitScore: 35, safetyIndex: 58,  // use RESEARCH table values, not prototype
    jobGrowth: 2.5,
    vibe: ["Creative","Tech","Outdoorsy","Nightlife"],
    topIndustries: ["Tech","Government","Healthcare","Music"],
    nearMountains: false, nearCoast: false, hasIntlAirport: true,
  },
  // ... 21 more — use EXACT values from 03-RESEARCH.md 22-city table
];
```

**Fields present in prototype but NOT in `City` contract** — `color` is prototype-only; omit from cities.ts. The `pop` and `climate` strings are display-only; add to `City` interface as noted above.

---

### `shared/engine/scoring-weights.ts` (config — tunable knobs)

**Closest analog:** `shared/data/constants.js` (named-export pattern)

**What to copy — module structural pattern only** (lines 1–6 of constants.js):

```javascript
// Header comment pattern from constants.js:
// ─────────────────────────────────────────────────────────────────
// [File name] — [one-line purpose]
// [who reads/writes it and why]
// ─────────────────────────────────────────────────────────────────
export const SOME_THING = { ... };
```

**No codebase analog for the tuning-knob pattern itself.** Use research-derived shape (03-RESEARCH.md "D-03/D-04: Scoring Engine Architecture" section). Key points for planner:
- Single `SCORING_WEIGHTS` object exported as `const ... as const`
- Nested by concern: `global`, `dealbreaker`, `lifestyle`, `normalization`
- Every coefficient that appears inline in `getMatchScore` (lines 104–141 of PotentialApp.jsx) gets a named slot here — specifically: `0.2` (cost multiplier, line 113), `2` (jobGrowth career multiplier, line 116), `0.08` (safety multiplier, line 130), `25`/`30` (dealbreaker penalties, lines 134–140)

---

### `shared/engine/financial.ts` (service, transform)

**Analog:** `getSalary`, `getTakeHome`, `getExpenses`, `getSavings` in `PotentialApp.jsx` lines 76–102

**IMPORTANT transformation:** These functions read `profile` and `city` from React closure. The engine versions take both as explicit parameters. Copy the arithmetic body, not the function signature.

**Salary logic** (line 76–78) — port directly, signature change only:

```javascript
// PotentialApp.jsx lines 76–78 — COPY ARITHMETIC, CHANGE SIGNATURE
// Prototype (closure):
const getSalary = (city) => {
  const base = BASE_SALARIES[profile.profession] || 55000;
  return Math.round(base * (city.costIndex / 100));
};

// Engine target (pure params):
export function computeSalary(profile: Profile, city: City): number {
  const base = BASE_SALARIES[profile.profession] ?? 55000;
  return Math.round(base * (city.costIndex / 100));
}
```

**Take-home logic** (lines 80–87) — port structure, REPLACE line 83 with bracketed federal tax:

```javascript
// PotentialApp.jsx lines 80–87 — PORT STRUCTURE, REPLACE TAX LINE
const getTakeHome = (city) => {
  const sal = profile.hasRemote ? profile.income : getSalary(city);
  const totalSal = sal + (profile.hasPartner ? profile.partnerIncome : 0);
  const fed = totalSal * 0.22;          // <-- DEPRECATED: replace with computeFederalTax(totalSal)
  const state = totalSal * (city.stateTax / 100);
  const fica = totalSal * 0.0765;       // <-- KEEP: real FICA per D-08
  return Math.round((totalSal - fed - state - fica) / 12);
};
// NOTE: city.stateTax is in CITIES_DATA inline but not yet in City interface — add to types.ts first
```

**Expense logic** (lines 88–101) — port verbatim with signature change:

```javascript
// PotentialApp.jsx lines 88–101 — PORT VERBATIM (arithmetic is correct per RESEARCH D-08)
const getExpenses = (city) => {
  const m = city.costIndex / 100;
  const rent = profile.housing === "rent" ? city.medianRent : Math.round(city.medianHome * 0.006);
  const food = Math.round((profile.hasDependents ? 600 + profile.numDependents * 200 : 400) * m);
  const transport = Math.round(250 * m);
  const utilities = Math.round(160 * m);
  const insurance = Math.round(350 * m);
  const personal = Math.round(300 * m);
  const childcare = profile.hasDependents ? Math.round(800 * profile.numDependents * m) : 0;
  const pets = profile.hasPets ? Math.round(100 * m) : 0;
  const debtPay = Math.round(profile.debt * 0.01);
  const total = rent + food + transport + utilities + insurance + personal + childcare + pets + debtPay;
  return { rent, food, transport, utilities, insurance, personal, childcare, pets, debtPay, total };
};
```

**The `FinancialModel` interface and `FINANCIAL_MODELS` registry have no codebase analog** — use the research-derived shape from 03-RESEARCH.md "D-08: Financial Model in Pure TS" section. This is the forward-compat hook for Phase 4.

---

### `shared/engine/scoring.ts` (service, transform)

**Analog:** `getMatchScore` in `PotentialApp.jsx` lines 104–142

**IMPORTANT transformation:** Same closure → pure-params transformation as financial.ts.

**Full prototype scoring function** (lines 104–142) — copy arithmetic, restructure for:
1. Explicit `profile: Profile, city: City` params
2. Move all magic numbers to `SCORING_WEIGHTS` imports
3. Collect contributions array while accumulating score (so scoreFactors = actual additive terms)

```javascript
// PotentialApp.jsx lines 104–142 — full scoring body to port
const getMatchScore = (city) => {
  let score = 50;                                      // BASE_SCORE → keep as named constant
  const tags = profile.lifestyleTags;
  const rank = profile.importanceRank;

  // Weight derivation from importanceRank (fallback if Profile.weights absent)
  const w = (cat) => { const i = rank.indexOf(cat); return i === 0 ? 4 : i === 1 ? 3 : i === 2 ? 2 : 1; };

  // Cost factor — magic numbers 140 and 0.2 → move to SCORING_WEIGHTS
  score += (140 - city.costIndex) * 0.2 * w("cost");

  // Career factor — 2 and 8 → move to SCORING_WEIGHTS
  score += city.jobGrowth * 2 * w("career");
  if (profile.hasRemote) score += 8 * w("career");

  // Lifestyle factor — 0.3, 0.1, 0.08 etc → move to SCORING_WEIGHTS
  if (tags.includes("nightlife") || tags.includes("music")) score += (city.vibe.includes("Nightlife") ? 12 : 0) * w("lifestyle") * 0.3;
  if (tags.includes("outdoors") || tags.includes("snow")) score += (city.vibe.includes("Outdoorsy") ? 12 : 0) * w("lifestyle") * 0.3;
  if (tags.includes("arts")) score += (city.vibe.includes("Creative") ? 10 : 0) * w("lifestyle") * 0.3;
  if (tags.includes("walkable")) score += city.walkScore * 0.1 * w("lifestyle");
  if (tags.includes("diversity")) score += (city.vibe.includes("Diverse") ? 10 : 0) * w("lifestyle") * 0.3;
  if (tags.includes("family")) score += city.safetyIndex * 0.08 * w("lifestyle");
  if (tags.includes("beach")) score += (city.vibe.includes("Tropical") ? 14 : 0) * w("lifestyle") * 0.3;
  if (tags.includes("startup")) score += city.jobGrowth * 1.5 * w("lifestyle");

  // Safety factor — 0.08 → move to SCORING_WEIGHTS
  score += city.safetyIndex * 0.08 * w("safety");

  // Dealbreakers — penalties applied here in prototype; move to dealbreakers.ts in engine
  // (lines 133–141 — see dealbreakers.ts pattern below)

  return Math.min(99, Math.max(5, Math.round(score)));
};
```

**Critical engine difference:** Do NOT apply dealbreaker penalties in scoring.ts. The scoring module returns the raw (un-penalized) factor contributions. Penalties are applied by `dealbreakers.ts` as a separate pass (required by D-02 two-pass comparison).

**Contribution collection pattern** — add alongside each `score +=`:

```typescript
// Engine pattern (not in prototype): collect contribution while scoring
const contributions: { factor: string; contribution: number }[] = [];
const costContrib = (140 - city.costIndex) * SCORING_WEIGHTS.global.cost * personalWeight.cost;
contributions.push({ factor: "Cost", contribution: Math.round(costContrib) });
score += costContrib;
// ... same for career, lifestyle, safety
```

---

### `shared/engine/dealbreakers.ts` (service, transform)

**Analog:** Dealbreaker block in `getMatchScore`, `PotentialApp.jsx` lines 133–141

```javascript
// PotentialApp.jsx lines 133–141 — the penalty conditions to port
const db = profile.dealBreakers;
if (db.includes("No extreme cold") && city.avgTemp < 45) score -= 25;     // avgTemp → winterLowF, threshold to recalibrate
if (db.includes("No extreme heat") && city.avgTemp > 72) score -= 25;     // avgTemp → summerHighF, threshold to recalibrate
if (db.includes("Must have public transit") && city.transitScore < 40) score -= 25;
if (db.includes("Must be walkable") && city.walkScore < 50) score -= 25;
if (db.includes("No state income tax") && city.stateTax > 0) score -= 30;
if (db.includes("Low crime only") && city.safetyIndex < 70) score -= 20;
// Prototype is MISSING: "Must be near mountains", "Must be near ocean/coast", "Need international airport",
// "Must have strong job market in my field" — these must be added using the new City fields
```

**Three changes from prototype:**
1. `avgTemp` → `summerHighF`/`winterLowF` with recalibrated thresholds (95°F heat, 25°F cold per RESEARCH)
2. Missing dealbreakers filled in using `nearMountains`, `nearCoast`, `hasIntlAirport`, `topIndustries`
3. Penalties become a separate returned value (not inline mutation of score) so the two-pass D-02 comparison works

**Re-confirm signal — no codebase analog.** Use research-derived shape from 03-RESEARCH.md "D-02 Dealbreaker Re-Confirm Logic" section. The `ReconfirmSignal` interface and `checkReconfirm()` function are novel to this phase.

---

### `shared/engine/index.ts` (service, request-response — orchestrator)

**Closest analog:** `nextProfile` callback in `PotentialApp.jsx` lines 232–239 — the moment the prototype scores all cities and sets results:

```javascript
// PotentialApp.jsx lines 232–239 — the "compute results" trigger
const nextProfile = () => {
  if (profileStep < totalSteps - 1) goProfile(profileStep + 1);
  else {
    const scored = CITIES_DATA.map(c => ({
      ...c,
      matchScore: getMatchScore(c),
      salary: getSalary(c),
      monthlySavings: getSavings(c)
    }));
    setResults(scored);
    goStep(2);
  }
};
```

**Engine version differences** (the analog is too weak to copy directly — reference only):
- Returns `RankingOutput` not void; does not set React state
- Runs two passes: raw scores (no penalty) then penalized scores
- Compares the two ranked lists to emit `reconfirmSignal`
- Filters by `opennessToAbroad === 0` (US-only mode)

**Use the research-derived `rankCities()` interface** from 03-RESEARCH.md "Engine Orchestrator Interface" section for the function signature.

---

### `src/screens/results/ResultsView.jsx` (component, request-response)

**Analog:** Results section of `PotentialApp.jsx` lines 448–505

**Sort state pattern** (lines 54, 449–455) — exact copy target:

```javascript
// PotentialApp.jsx line 54 — state declaration
const [sortBy, setSortBy] = useState("match");

// PotentialApp.jsx lines 449–455 — sort implementation (port directly)
const sorted = [...results].sort((a, b) => {
  if (sortBy === "match") return b.matchScore - a.matchScore;
  if (sortBy === "savings") return b.monthlySavings - a.monthlySavings;
  if (sortBy === "salary") return b.salary - a.salary;   // NOTE: rename to b.estSalary per MatchResult contract
  if (sortBy === "cost") return a.costIndex - b.costIndex;  // NOTE: a.city.costIndex in typed MatchResult
  return 0;
});
```

**Sort pill UI pattern** (lines 472–475) — copy pill button group:

```jsx
// PotentialApp.jsx lines 472–475 — sort pill rendering
<div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
  {[["match","Best match"],["savings","Most savings"],["salary","Top salary"],["cost","Lowest cost"]].map(([k,l]) => (
    <button key={k} onClick={() => setSortBy(k)} style={pill(sortBy === k)}>{l}</button>
  ))}
</div>
```

**City card pattern** (lines 477–500) — the ranked list item:

```jsx
// PotentialApp.jsx lines 477–500 — city card (port, update field names to MatchResult contract)
{sorted.map((city, i) => (
  <div key={city.name} onClick={() => { setSelectedCity(city); ... }} style={{
    background:"var(--card)", borderRadius:14, padding:"18px 20px", cursor:"pointer",
    border:"1px solid var(--border)",
    display:"grid", gridTemplateColumns:"auto 1fr auto", alignItems:"center", gap:16,
  }}>
    <div style={{ fontSize:34, width:44, textAlign:"center" }}>{city.emoji}</div>
    <div>
      <span style={{ fontSize:16, fontWeight:700 }}>{city.name}</span>
      <span style={{ ...mono, ...}}>{city.matchScore}%</span>
      {/* vibe pills */}
    </div>
    <div style={{ textAlign:"right" }}>
      <div style={{ ...mono }}>{city.salary}/yr</div>       {/* → city.estSalary */}
      <div style={{ color: city.monthlySavings >= 0 ? "var(--pos)" : "var(--neg)" }}>
        {city.monthlySavings >= 0 ? "+" : ""}{city.monthlySavings}/mo
      </div>
    </div>
  </div>
))}
```

**CSS design tokens** (lines 153–160) — identical to prototype, inherit directly:

```javascript
// PotentialApp.jsx lines 153–160 — token object to copy unchanged
const css = {
  "--bg":"#08090C","--surface":"#111318","--card":"#171B22","--card-hover":"#1C2029",
  "--border":"rgba(255,255,255,0.05)","--border-active":"rgba(255,255,255,0.12)",
  "--accent":"#6EE7B7","--accent2":"#FBBF24","--accent3":"#818CF8","--accent-dim":"rgba(110,231,183,0.08)",
  "--text":"#EEF2F7","--text2":"#8896AB","--text3":"#505C6F",
  "--neg":"#F87171","--pos":"#6EE7B7",
  fontFamily:"'Manrope', sans-serif", background:"var(--bg)", color:"var(--text)", minHeight:"100vh"
};
```

---

### `src/screens/results/CityDetail.jsx` (component, request-response)

**Analog:** City detail section + components in `PotentialApp.jsx` lines 510–730

**Expand/collapse `Section` component** (lines 518–532) — copy pattern for D-06 expand-to-reveal:

```jsx
// PotentialApp.jsx lines 518–532 — Section collapsible component (copy for score explanation + financials)
const [expandedSection, setExpandedSection] = useState(null);  // line 55

const Section = ({ id, icon, title, children }) => {
  const open = expandedSection === id;
  return (
    <div style={{ background:"var(--card)", borderRadius:16, border:"1px solid var(--border)", marginBottom:12, overflow:"hidden" }}>
      <button onClick={() => setExpandedSection(open ? null : id)} style={{
        width:"100%", padding:"18px 20px", background:"none", border:"none", color:"var(--text)",
        display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer",
        fontFamily:"inherit", fontSize:14, fontWeight:600
      }}>
        <span>{icon} {title}</span>
        <span style={{ color:"var(--text3)", fontSize:18, transition:"transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
      </button>
      {open && <div style={{ padding:"0 20px 20px", borderTop:"1px solid var(--border)" }}>{children}</div>}
    </div>
  );
};
```

**Expense breakdown stacked bar + row list** (lines 622–657) — copy as the pattern for scoreFactors contribution bars (D-05):

```jsx
// PotentialApp.jsx lines 638–653 — stacked bar + labeled row pattern
// Apply to scoreFactors: each factor is a colored bar segment + label + contribution number
<div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", marginBottom:14 }}>
  {items.map((it,i) => <div key={i} style={{ width:`${(it.val/expenses.total)*100}%`, background:it.color, minWidth:2 }} />)}
</div>
{items.map((it,i) => (
  <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none" }}>
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ width:8, height:8, borderRadius:2, background:it.color }} />
      <span style={{ fontSize:13, color:"var(--text2)" }}>{it.label}</span>
    </div>
    <span style={{ ...mono, fontSize:13, fontWeight:600 }}>${it.val.toLocaleString()}</span>
  </div>
))}
```

**Adaptation for D-05 contribution bars:** Replace `it.val` with `it.contribution`; use `var(--pos)` for positive contributions and `var(--neg)` for negative (dealbreaker penalties). The dealbreaker entry uses `contribution: -30` — show as a real negative bar, not an asterisk.

**Financial summary grid** (lines 601–619) — copy 4-tile grid for city hero financials:

```jsx
// PotentialApp.jsx lines 601–619 — financial summary tile grid
<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:10 }}>
  {[
    { icon:"💼", lbl:"Est. Salary", val: fmtFull(salary) },
    { icon:"🏠", lbl:"Monthly Take-Home", val: fmtFull(takeHome) },
    { icon:"📊", lbl:"Monthly Savings", val: `${savings >= 0 ? "+" : ""}${fmtFull(Math.abs(savings))}` },
    { icon:"🏡", lbl: profile.housing === "rent" ? "Median 1BR Rent" : "Median Home Price",
      val: profile.housing === "rent" ? `${fmtFull(c.medianRent)}/mo` : fmtFull(c.medianHome) },
  ].map((s, i) => (
    <div key={i} style={{ background:"var(--surface)", borderRadius:10, padding:"14px 16px", border:"1px solid var(--border)" }}>
      <div style={{ fontSize:18, marginBottom:4 }}>{s.icon}</div>
      <div style={{ fontSize:20, ...mono, fontWeight:700 }}>{s.val}</div>
      <div style={{ fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginTop:4 }}>{s.lbl}</div>
    </div>
  ))}
</div>
```

**D-02 re-confirm UX — no codebase analog.** The overlay/modal that fires when `reconfirmSignal` is present is a new UX surface. Planner should use the dark-card pattern (`background:"var(--card)", borderRadius:16, border:"1px solid var(--border)"`) with amber accent (`var(--accent2)`) for the warning state, consistent with existing token usage.

---

## Shared Patterns

### Design Token Object
**Source:** `PotentialApp.jsx` lines 153–160
**Apply to:** All new JSX components in `src/screens/results/`

Copy the `css` token object verbatim. Do not introduce new CSS variables or a separate stylesheet — inline-style dark theme is the project convention. Components access tokens via `style={{ color:"var(--accent)" }}` etc.

### Pill Button Component
**Source:** `PotentialApp.jsx` lines 163–167

```javascript
// Copy this pill factory function into each screen file that needs toggleable buttons
const pill = (active) => ({
  padding:"8px 16px", borderRadius:10,
  border: active ? "1.5px solid var(--accent)" : "1px solid var(--border)",
  background: active ? "var(--accent-dim)" : "var(--card)",
  color: active ? "var(--accent)" : "var(--text2)",
  fontSize:13, cursor:"pointer", fontWeight: active ? 600 : 400, transition:"all 0.2s",
  fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:6
});
```

**Apply to:** Sort pills in `ResultsView.jsx`, any filter controls.

### Monospace + Heading Shorthand
**Source:** `PotentialApp.jsx` lines 161–162

```javascript
const heading = { fontFamily:"'Instrument Serif', serif" };
const mono = { fontFamily:"'JetBrains Mono', monospace" };
```

**Apply to:** All numeric displays (salary, savings, score) use `mono`; section headings use `heading`.

### Number Formatters
**Source:** `PotentialApp.jsx` lines 26–27

```javascript
const fmt = (n) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n/1000)}K` : `$${n}`;
const fmtFull = (n) => `$${n.toLocaleString()}`;
```

**Apply to:** All currency displays in `ResultsView.jsx` and `CityDetail.jsx`. Copy as module-level functions.

### Constants Import Pattern
**Source:** `PotentialApp.jsx` line 2

```javascript
import { PROFESSION_CATEGORIES, BASE_SALARIES, LIFESTYLE_TAGS, DEAL_BREAKERS } from '../../shared/data/constants.js';
```

**Apply to:** `shared/engine/financial.ts` imports `BASE_SALARIES` from `'../data/constants.js'`. `shared/engine/scoring.ts` imports `LIFESTYLE_TAGS` for vibe matching. `shared/data/cities.ts` imports `City` type from `'../types.js'`.

### Named-Export Module Pattern
**Source:** `shared/data/constants.js` lines 1–6

All new `shared/` modules follow: header block comment + named exports only + no default export. TypeScript files add type annotations; the structural pattern is the same.

---

## No Analog Found

Files with no close codebase match — planner must use RESEARCH.md patterns directly:

| File | Role | Data Flow | Reason | Research Section to Use |
|------|------|-----------|--------|------------------------|
| `shared/engine/scoring-weights.ts` | config | — | No tunable-config pattern exists; `constants.js` is static data, not knobs | 03-RESEARCH.md "D-03/D-04: Scoring Engine Architecture" → `SCORING_WEIGHTS` object |
| `shared/engine/financial.ts` (`FinancialModel` interface + registry) | service interface | — | Pluggable interface + registry pattern has no analog | 03-RESEARCH.md "D-08: Financial Model in Pure TS" → `FinancialModel` + `FINANCIAL_MODELS` |
| `shared/engine/dealbreakers.ts` (`ReconfirmSignal` + `checkReconfirm`) | service | — | Two-pass re-confirm signal is novel | 03-RESEARCH.md "D-02 Dealbreaker Re-Confirm Logic" |
| `shared/engine/index.ts` (two-pass orchestrator) | orchestrator | — | `nextProfile` analog is a React callback, not a pure function with dual ranking + signal output | 03-RESEARCH.md "Engine Orchestrator Interface" |
| `shared/engine/financial.test.ts` | test | — | No test framework installed; no test files exist | 03-RESEARCH.md "Validation Architecture" + vitest docs |
| `shared/engine/index.test.ts` | test | — | same | same |
| `shared/engine/dealbreakers.test.ts` | test | — | same | same |
| `src/screens/results/ResultsView.test.jsx` | test | — | same | same |
| `src/test-setup.js` | config | — | vitest not installed; no setup files exist | 03-RESEARCH.md "Standard Stack → Testing" + vitest/testing-library docs |
| D-02 re-confirm overlay in `CityDetail.jsx` | component | — | No modal/overlay component exists | Use `var(--accent2)` amber token + dark-card pattern from existing tokens |

---

## Transformation Rules (Critical — Planner Must Flag to Executor)

These are non-obvious changes required when porting from the prototype analog:

| From (Prototype) | To (Engine) | Why |
|------------------|-------------|-----|
| `profile.profession` read from closure | `profile: Profile` explicit param | Pure function, no React dependency |
| `city.avgTemp < 45` (cold dealbreaker) | `city.winterLowF < 25` | RESEARCH D-11: avgTemp blends seasons, gives wrong signals |
| `city.avgTemp > 72` (heat dealbreaker) | `city.summerHighF > 95` | Same — Austin avgTemp 68 misses 97°F July highs |
| `fed = totalSal * 0.22` | `computeFederalTax(grossIncome)` | D-07: bracketed TY2026 IRS rates replace flat 22% |
| `score -= 25/30` inline | `SCORING_WEIGHTS.dealbreaker.penalty` | D-03: no inline magic numbers |
| Penalties applied inside `getMatchScore` | Separate `dealbreakers.ts` pass | D-02: two-pass comparison requires un-penalized scores |
| `city.salary` in sorted results | `city.estSalary` | MatchResult contract field name |
| `a.costIndex` in sort | `a.city.costIndex` | MatchResult wraps city: `{ city: City, ... }` |
| `costIndex: 187` for Brooklyn (prototype) | `costIndex: 143` | RESEARCH rescaled — prototype overcalibrated NYC |
| No contribution tracking | `contributions[]` collected alongside `score +=` | D-05 requires scoreFactors = actual additive terms |

---

## Metadata

**Analog search scope:** `shared/` (3 files), `src/screens/PotentialApp.jsx` (734 lines, fully read)
**Files scanned:** 6 (`shared/types.ts`, `shared/data/constants.js`, `src/screens/PotentialApp.jsx`, `vite.config.js`, `tsconfig.json`, `package.json`)
**Pattern extraction date:** 2026-06-01
**Skills directory:** absent (`.claude/` contains only worktrees and `settings.local.json`)
