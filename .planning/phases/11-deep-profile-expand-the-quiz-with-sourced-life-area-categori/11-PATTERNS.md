# Phase 11: Deep Profile — Pattern Map

**Mapped:** 2026-06-02
**Files analyzed:** 6 (4 new, 2 modified)
**Analogs found:** 6 / 6 (all have live-code analogs; Phase 2 engine files are not yet on disk — cited via `.test.ts` contracts and plan docs)

> **Architectural finding:** Phase 11 introduces no net-new architectural shapes. Every new
> module mirrors an existing `shared/engine/` or `shared/quiz-engine/` convention that is
> already verified on this branch: signal-or-null, scoreFactors contribution array,
> const-export config object, typed data array, and colocated staggered-green tests.
> The planner can build Phase 11 entirely by extending the established patterns below.

---

## File Classification

| New/Modified File | New/Mod | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|---------|------|-----------|----------------|---------------|
| `shared/quiz-engine/personality.ts` | new | service (pure) | transform + signal | `shared/engine/scoring.ts` (`scoreFactors`, lines 134–168) + `shared/engine/dealbreakers.ts` (`checkReconfirm`, lines 282–304) + `shared/engine/scoring-weights.ts` (config export pattern) | exact |
| `shared/quiz-engine/category-modules.ts` | new | data/config | transform | `shared/quiz-engine/resolver.test.ts` (`FIXTURE_QUESTIONS` + `showIf` fixture, lines 19–39) for the `QuestionDef`+`showIf` shape; ARRAY pattern from Phase 2's `questions.ts` design (02-02-PLAN.md) | contract-only / role-match |
| `shared/quiz-engine/personality.test.ts` | new | test | — | `shared/quiz-engine/tension.test.ts` (staggered-green discipline, import-RED header, signal-or-null assertions) + `shared/engine/scoring.test.ts` (fixture pattern) | exact |
| `shared/quiz-engine/category-modules.test.ts` | new | test | — | `shared/quiz-engine/resolver.test.ts` (showIf filtering pattern, lines 43–66) | exact |
| `shared/types.ts` | **mod** | contract | — | itself (extend `Profile` + `City` in place, additively) | self |
| `shared/engine/scoring-weights.ts` | **mod (Phase 12 only — DO NOT edit in Phase 11)** | config | — | itself | self |

> **Phase boundary reminder:** `shared/engine/scoring-weights.ts` is listed for completeness
> because Phase 12 extends it for the two-tier floor/swing. Phase 11 MUST NOT edit it.
> Phase 11 only reads it to understand the config-export pattern.

> **Phase 2 in-flight note:** `shared/quiz-engine/resolver.ts`, `synthesizer.ts`, `tension.ts`,
> and `questions.ts` are NOT on disk (Phase 2 mid-TDD). Do not cite line numbers from those files.
> Their contracts are specified in `*.test.ts` files and plan docs (02-0x-PLAN.md).
> Phase 11 must NOT edit those files (D-01) — build sibling modules only.

---

## Shared Patterns

These apply across all new Phase 11 files.

### SP-1: `.js` import extensions in TS files (LOAD-BEARING)
**Source:** `shared/engine/scoring.ts` lines 9–10; `shared/engine/scoring-weights.ts` line 1
**Apply to:** every new `shared/quiz-engine/*.ts` and `*.test.ts`

```typescript
// scoring.ts lines 9-10
import { SCORING_WEIGHTS, BASE_SCORE, PERSONAL_WEIGHT_SCALE } from './scoring-weights.js';
import type { Profile, City } from '../types.js';
```

New files must use `.js` extensions on all sibling and parent imports despite being TypeScript
(ESM + `moduleResolution: "bundler"`). This is the single most common convention violation.

### SP-2: Boxed module header comment
**Source:** `shared/engine/scoring.ts` lines 1–7; `shared/engine/scoring-weights.ts` lines 1–6
**Apply to:** `personality.ts`, `category-modules.ts`

```typescript
// ─────────────────────────────────────────────────────────────────
// Potential — [Module Name] (Phase 11, Plan XX)
// D-XX: [Governing decision(s)]
// [Key invariant, one line]
// ─────────────────────────────────────────────────────────────────
```

### SP-3: Const-export config object (single source of truth for tunables)
**Source:** `shared/engine/scoring-weights.ts` lines 26–61 (`SCORING_WEIGHTS`, `PERSONAL_WEIGHT_SCALE`, `BASE_SCORE`)
**Apply to:** `personality.ts` (`PRACTICAL_CATEGORIES`, `PREFERENCE_CATEGORIES`, floor/swing constants)

Magic numbers must NOT be inlined in function bodies. Group them in an exported const
at module top so Phase 12 can read and extend them without opening the function body.

### SP-4: Staggered-green test discipline
**Source:** `shared/quiz-engine/tension.test.ts` lines 1–13 (import-RED warning header + staggered-green note)
**Apply to:** `personality.test.ts`, `category-modules.test.ts`

```typescript
// ─────────────────────────────────────────────────────────────────────────────
// shared/quiz-engine/personality.test.ts — RED stubs (Wave 0, Phase 11)
// Covers: QUIZ-06 — detectPersonalityTension, synthesizeCategoryWeights
//
// STAGGERED-GREEN DISCIPLINE:
//   This file has a top-level import of ./personality.js.
//   personality.js is NOT created until Wave 1.
//   This file IMPORT-ERRORS (fails to collect) until Wave 1.
//   Wave 0 verify commands EXCLUDE this file.
// ─────────────────────────────────────────────────────────────────────────────
```

---

## Pattern Assignments

### `shared/quiz-engine/personality.ts` (service, transform + signal)

This file has THREE distinct function concerns, each with its own live-code analog.

---

#### `detectPersonalityTension` function

**Analog:** `shared/engine/dealbreakers.ts` `checkReconfirm`, lines 282–304

The `checkReconfirm` function is the exact live implementation of the signal-or-null shape
that Phase 2's PATTERNS.md (SP-4) designated for `detectTension`. `detectPersonalityTension`
is a sibling function following the same contract.

**Signal-or-null interface shape** (from `dealbreakers.ts` lines 39–43 + `checkReconfirm` lines 282–304):
```typescript
// dealbreakers.ts lines 39-43 — the canonical signal-or-null interface
export interface ReconfirmSignal {
  city: City;
  dealbreaker: string;
  factLabel: string;
}

// dealbreakers.ts lines 282-286 — function signature
export function checkReconfirm(
  penalizedRanking: MatchResult[],
  rawRanking: MatchResult[],
  profile: Profile,
): ReconfirmSignal | null {
  if (penalizedRanking.length === 0 || rawRanking.length === 0) return null;
  // ...
  return null;  // or the signal
}
```

**Phase 11 version to copy from** (`tension.test.ts` lines 31–38 specify the `TensionResult` contract):
```typescript
// shared/quiz-engine/tension.test.ts lines 31-38 — TensionResult interface contract
// result is non-null; afterId is string; question is object with id (string)
expect(typeof result!.afterId).toBe('string');
expect(typeof result!.question).toBe('object');
expect(typeof result!.question.id).toBe('string');
```

Phase 11's `detectPersonalityTension` must export a `PersonalityTensionResult` interface
and a function returning `PersonalityTensionResult | null`:
```typescript
// Pattern: mirror TensionResult from 02-04-PLAN.md interfaces section
export interface PersonalityTensionResult {
  afterId: string;        // id of the last core tradeoff question
  question: QuestionDef;  // the adaptive follow-up to inject
}
export function detectPersonalityTension(answers: Answers): PersonalityTensionResult | null {
  // Guard discipline: unknown/absent keys → null, never throw
  // (same as dealbreakers.ts checkReconfirm line 287: "if ... return null")
  if (Object.keys(answers).length === 0) return null;
  // ... trigger on ≥2 "balanced" choices
  return null;  // or the signal
}
```

**Guard discipline** (from `dealbreakers.ts` lines 287–293 — unknown inputs return null):
```typescript
// dealbreakers.ts lines 287-293 — guard pattern to mirror
if (penalizedRanking.length === 0 || rawRanking.length === 0) return null;
const penalizedTop = penalizedRanking[0];
const rawTop = rawRanking[0];
if (penalizedTop.city.name === rawTop.city.name) return null;
```

---

#### `synthesizeCategoryWeights` function

**Analog:** `shared/engine/scoring.ts` `computeRawScore`, lines 134–168

The `computeRawScore` pattern is the live proof that "iterate over factors, compute
contribution per factor, collect into array, sum into scalar" is the project-correct
approach. `synthesizeCategoryWeights` mirrors this for the weight-inference direction.

> **Placement is the planner's call.** RESEARCH.md offered three options: inside Phase 2's
> `synthesizer.ts` (blocked by D-01 — cannot edit in-flight), a new `category-synthesizer.ts`,
> or consolidated into `personality.ts`. This document uses `personality.ts` throughout for
> consistency. The `scoreFactors` analog holds regardless of which file the function lands in.

**scoreFactors contribution pattern** (from `scoring.ts` lines 134–168):
```typescript
// scoring.ts lines 134-168 — the contribution-array pattern to mirror
export function computeRawScore(profile: Profile, city: City): CityScore {
  const personal = rankToWeight(profile);
  const { global, normalization } = SCORING_WEIGHTS;

  const scoreFactors: { factor: string; contribution: number }[] = [];

  const costContrib = Math.round(
    global.cost * personal.cost * costFactorScore(city) * normalization.costMaxContribution
  );
  scoreFactors.push({ factor: 'Cost', contribution: costContrib });

  // ... one push per factor ...

  const rawScore = BASE_SCORE + scoreFactors.reduce((s, f) => s + f.contribution, 0);
  return { rawScore, scoreFactors };
}
```

**Phase 11 parallel:** Replace `scoreFactors: {factor, contribution}[]` with
`weightExplanations: WeightExplanation[]`. Replace `rawScore` with
`categoryWeights: Record<string, number>`. Both emitted from the same function call
(D-08 — they ship together, never separately).

**SCORING_WEIGHTS export shape** to mirror for the category config
(`scoring-weights.ts` lines 26–61):
```typescript
// scoring-weights.ts lines 26-61 — single tunable config object
export const SCORING_WEIGHTS = {
  global: { cost: 1.0, career: 1.0, lifestyle: 1.0, safety: 0.8 },
  dealbreaker: { penalty: 30 },
  lifestyle: { tagVibeBonus: 8, walkBonus: 0.08, startupBonus: 1.2 },
  normalization: {
    costMaxContribution: 12,
    careerMaxContribution: 12,
    lifestyleMaxContribution: 10,
    safetyMaxContribution: 8,
  },
} as const;

export const PERSONAL_WEIGHT_SCALE = 4;
export const BASE_SCORE = 50;
```

**Phase 11 parallel constants to export from `personality.ts`**
(same pattern, Phase 12 reads them):
```typescript
// personality.ts — export category config for Phase 12 consumption
// PLANNER NOTE: Tier membership for the original four factors (cost, career, lifestyle,
// safety) is PROVISIONAL — D-02 (replace vs. layer) is OPEN. If D-02 resolves to
// 'layer', assign each original factor to one of these sets. 'career' falls in
// neither tier currently — planner must assign it before Phase 12 consumes this.
// The sets below cover Phase 11's new categories only, pending D-02 resolution.
export const PRACTICAL_CATEGORIES = new Set(["cost", "safety", "healthcare"]);
export const PREFERENCE_CATEGORIES = new Set([
  "lifestyle", "parks", "connectivity", "demographics", "climateRisk", "schools", "childcare"
]);
// Provisional values — Phase 12 tunes in scoring-weights.ts
export const WEIGHT_FLOOR     = 0.3;   // practical categories never drop below this
export const WEIGHT_MAX_PRAC  = 1.5;   // practical categories ceiling
export const WEIGHT_MAX_PREF  = 1.8;   // preference categories ceiling
export const NEUTRAL_DEFAULT  = 0.5;   // D-13: skipped module fallback (never undefined/NaN)
```


> **Tier membership caveat (D-02 OPEN):** The sets above cover Phase 11's new categories
> only. `"cost"` already lives on `profile.weights.cost` (Phase 3 path); including it in
> `PRACTICAL_CATEGORIES` before D-02 is resolved risks double-weighting. `"career"` is
> not assigned to either tier — the planner must finalize all six legacy + new factor
> tier assignments at Phase 2 integration, before Phase 12 scoring consumes these sets.

**Critical anti-pattern to avoid** (from `scoring-weights.ts` comment lines 53–54):
```
// theoretical max rawScore = 50 + 12 + 12 + 10 + 0.8×8 = 90.4
// → clamp(rawScore, 0, 99) is always a no-op in the normal range
```
Phase 11's `synthesizeCategoryWeights` must NOT pre-normalize weights to [0,1].
Emit raw inferred values in the [WEIGHT_FLOOR .. WEIGHT_MAX] range.
Phase 12 normalizes via its `rankToWeight` successor — pre-normalizing causes
double-shrink (same pitfall as documented in 02-02-PLAN.md synthesizer section).

---

#### Exports and module shape

**Analog:** `shared/engine/scoring.ts` lines 9–13 (imports) + line 172 (alias export)

```typescript
// scoring.ts lines 9-13 — import convention + re-export pattern
import { SCORING_WEIGHTS, BASE_SCORE, PERSONAL_WEIGHT_SCALE } from './scoring-weights.js';
import type { Profile, City } from '../types.js';
export { BASE_SCORE } from './scoring-weights.js';

// scoring.ts line 172 — alias export for interface compatibility
export const scoreCity = computeRawScore;
```

---

### `shared/quiz-engine/category-modules.ts` (data/config, typed QuestionDef array)

**Primary analog:** `shared/quiz-engine/resolver.test.ts` lines 19–39 — the only live code
that demonstrates the `QuestionDef` interface shape with a `showIf` predicate.

**`QuestionDef` shape + `showIf` predicate** (from `resolver.test.ts` lines 19–39):
```typescript
// resolver.test.ts lines 19-39 — MinimalQuestion fixture defines the shape contract
type ShowIfFn = (answers: Record<string, unknown>) => boolean;
interface MinimalQuestion {
  id: string;
  required?: boolean;
  showIf?: ShowIfFn;
}

const Q_IMMIGRATION_STATUS: MinimalQuestion = {
  id: 'immigrationStatus',
  showIf: (answers) => answers['citizenship'] !== 'US',
};
```

**Phase 11 parallel** — module question with `showIf` keyed on personality result:
```typescript
// category-modules.ts — showIf pattern for guided-modular flow (D-11)
// Question is visible when personality gate recommended the module OR user opted in
{
  id: "healthcare_chronic_condition",
  type: "single_select",
  showIf: (answers) =>
    answers["tradeoff_healthcare"] === "healthcare_critical" ||
    answers["moduleSelected_healthcare"] === true,
  required: false,   // skipped → NEUTRAL_DEFAULT via synthesizeCategoryWeights
}
```

**CRITICAL: `showIf` must read answers from EARLIER questions in `ALL_QUESTIONS`.**
The personality gate questions must appear before category-module questions in `ALL_QUESTIONS`.
This is the same trigger-before-injection invariant as Phase 2's resolver (02-02-PLAN.md,
"load-bearing invariant": every conditional question appears at-or-after its trigger).

**Array registration pattern** (from `02-02-PLAN.md` — questions.ts design):
```typescript
// questions.ts (Phase 2, not yet on disk) — Phase 11 appends to this array
// Source: 02-02-PLAN.md artifacts section
import { PERSONALITY_QUESTIONS, TRAIT_QUESTIONS } from './personality.js';
import { CATEGORY_MODULE_QUESTIONS } from './category-modules.js';

export const ALL_QUESTIONS: QuestionDef[] = [
  // ... Phase 2's existing questions (career, finances, background, etc.) ...
  ...PERSONALITY_QUESTIONS,     // Phase 11: upfront personality gate (MUST come first)
  ...TRAIT_QUESTIONS,           // Phase 11: trait statements (non-weight-bearing)
  ...CATEGORY_MODULE_QUESTIONS, // Phase 11: deep-dive modules (showIf keys on personality)
];
```

**`groupHeader` field shape** — from `02-02-PLAN.md` artifact entry for `questions.ts`:
```typescript
// QuestionDef shape per 02-02-PLAN.md (Assumption A2 — not yet verifiable on disk):
// {
//   id: string
//   type: QuestionType
//   prompt: string
//   options?: { value: string; label: string }[]
//   showIf?: (answers: Answers) => boolean
//   groupHeader?: { label: string; subtext?: string }
//   required?: boolean
//   min?: number; max?: number; step?: number
//   autoAdvance?: boolean
// }
```
Match quality for this shape: MEDIUM (from plan doc, not live source).

---

### `shared/quiz-engine/personality.test.ts` (unit test)

**Primary analog:** `shared/quiz-engine/tension.test.ts` (all 67 lines — staggered-green
structure, signal-or-null assertions, empty-answers guard test)

**Test structure to copy** (from `tension.test.ts` lines 1–13 + 21–66):
```typescript
// tension.test.ts lines 1-13 — staggered-green discipline header
// tension.test.ts lines 21-31 — non-null result for conflict case
it('returns a non-null TensionResult for nature + career conflict', () => {
  const conflictingAnswers = { lifestyleTags: ['outdoors'], importanceRank: ['career', ...] };
  const result = detectTension(conflictingAnswers);
  expect(result).not.toBeNull();
});

// tension.test.ts lines 32-38 — shape assertion (afterId string, question object with id)
it('returned TensionResult has afterId (string) and question (object with id)', () => {
  expect(typeof result!.afterId).toBe('string');
  expect(typeof result!.question).toBe('object');
  expect(typeof result!.question.id).toBe('string');
});

// tension.test.ts lines 52-56 — empty answers guard
it('returns null for empty answers (no crash on missing keys)', () => {
  const result = detectTension({});
  expect(result).toBeNull();
});
```

**Secondary analog:** `shared/engine/scoring.test.ts` — fixture pattern for
`synthesizeCategoryWeights` tests (complete `answers` object with all tradeoff fields set).

**Critical test assertions for Phase 11 (QUIZ-09 — neutral skip, never undefined):**
```typescript
// Must assert this for every category slug in ALL_SCORED_CATEGORIES
it('emits NEUTRAL_DEFAULT for a skipped module — never undefined', () => {
  const result = synthesizeCategoryWeights({});  // no answers
  for (const cat of ALL_SCORED_CATEGORIES) {
    expect(result.categoryWeights[cat]).toBeDefined();
    expect(typeof result.categoryWeights[cat]).toBe('number');
    expect(isNaN(result.categoryWeights[cat])).toBe(false);
  }
});
```

**Critical test assertion for D-08 (weightExplanations must accompany categoryWeights):**
```typescript
it('emits weightExplanations alongside categoryWeights — never one without the other', () => {
  const answers = { tradeoff_healthcare: 'healthcare_critical' };
  const result = synthesizeCategoryWeights(answers);
  expect(result.categoryWeights).toBeDefined();
  expect(result.weightExplanations).toBeDefined();
  expect(Array.isArray(result.weightExplanations)).toBe(true);
});
```

---

### `shared/quiz-engine/category-modules.test.ts` (unit test)

**Analog:** `shared/quiz-engine/resolver.test.ts` `showIf` suite, lines 43–66

**Test structure to copy** (from `resolver.test.ts` lines 43–66):
```typescript
// resolver.test.ts lines 43-50 — showIf hidden when condition not met
it('hides immigrationStatus question when citizenship is US', () => {
  const answers = { citizenship: 'US' };
  const visible = getVisibleQuestions(answers, FIXTURE_QUESTIONS);
  const ids = visible.map((q: { id: string }) => q.id);
  expect(ids).not.toContain('immigrationStatus');
});

// resolver.test.ts lines 52-57 — showIf visible when condition met
it('shows immigrationStatus question when citizenship is not US', () => {
  const answers = { citizenship: 'Brazil' };
  const visible = getVisibleQuestions(answers, FIXTURE_QUESTIONS);
  const ids = visible.map((q: { id: string }) => q.id);
  expect(ids).toContain('immigrationStatus');
});
```

**Phase 11 parallel** — test the module `showIf` predicates directly against the
exported `CATEGORY_MODULE_QUESTIONS` array (without calling `getVisibleQuestions`,
since that function is in Phase 2's not-yet-on-disk `resolver.ts`):
```typescript
// Test the showIf predicate directly
it('shows healthcare module when tradeoff_healthcare is healthcare_critical', () => {
  const q = CATEGORY_MODULE_QUESTIONS.find(q => q.id === 'healthcare_chronic_condition')!;
  expect(q.showIf!({ tradeoff_healthcare: 'healthcare_critical' })).toBe(true);
});
it('hides healthcare module when tradeoff_healthcare is not critical', () => {
  const q = CATEGORY_MODULE_QUESTIONS.find(q => q.id === 'healthcare_chronic_condition')!;
  expect(q.showIf!({ tradeoff_healthcare: 'healthcare_low' })).toBe(false);
});
```

---

### `shared/types.ts` (MODIFIED — additive contract extension)

**Analog:** itself. Extend in place — same approach as Phase 2's extension
(see `types.ts` lines 47–59: `motivationToMove?`, `workStyle?`, etc. were all added
as optional fields with an announcement comment at the top).

**Phase 2 extension announcement pattern** (from `types.ts` lines 7–11):
```typescript
// ── Phase 2 extension announcement pattern to follow ──
// Phase 2 extension (D-05, 2026-06-02): Added 6 optional dimension fields
// to Profile — motivationToMove, workStyle, communityNeeds, paceOfLife,
// riskTolerance, tradeoffTolerance. All optional to avoid fixture ripple
// (tsconfig strict:true). Phase 3 defends with ?? defaults at consumption.
```

**Fields to add — additive ONLY** (from `types.ts` current state — lines 17–60 and RESEARCH.md):

For `Profile` (after line 59, before closing `}`):
```typescript
// ── Phase 11: personality-inferred category weights ───────────────
// categoryWeights and weightExplanations are Phase 11 additions.
// Do NOT remove or rename profile.weights — Phase 3 scoring.ts line 38
// reads profile.weights.cost directly; Phase 2 synthesizer emits it.
// D-02 (replace vs. layer) stays OPEN until Phase 2 integration.
categoryWeights?: Record<string, number>;    // keyed by category slug
weightExplanations?: WeightExplanation[];    // D-08 explainability trace
// Phase 11: module-captured fields (all optional — missing → neutral default)
hasChronicCondition?: boolean;
needsSpecialistAccess?: boolean;
hasDependentsInSchool?: boolean;
kidsAges?: string[];
disasterRiskConcern?: string;
primaryHazardConcern?: string;
internationalTraveler?: boolean;
outdoorsFrequency?: string;
demographicsMatters?: boolean;
personalityTradeoffs?: { scenario: string; choice: string }[];
personalityFlavor?: Record<string, string>; // D-07 trait statements (non-weight-bearing)
```

For `City` (after line 90 `hasIntlAirport`, before closing `}`):
```typescript
// ── Phase 11 additions — all optional (Phase 12 populates data files) ──
healthcareIndex?: number;
disasterRiskScore?: number;
disasterRiskRating?: string;
schoolProficiencyPct?: number;
childcareInfantAnnual?: number;
childcareToddlerAnnual?: number;
foreignBornPct?: number;       // D-14: neutral factual stat, NOT a fit/diversity score
medianAge?: number;
neverMarriedPct?: number;
parkScoreRank?: number;
parkScore?: number;
faaHubClass?: 'Large' | 'Medium' | 'Small' | 'Nonhub';
airportEnplanements?: number;
```

New `WeightExplanation` interface to add BEFORE `Profile` interface (required by D-08):
```typescript
// WeightExplanation — emitted by synthesizeCategoryWeights (Phase 11)
// Mirrors Phase 3's scoreFactors {factor, contribution}[] explainability pattern
export interface WeightExplanation {
  category: string;        // e.g. "healthcare" | "lifestyle" | "cost"
  inferredWeight: number;  // raw value in [WEIGHT_FLOOR..WEIGHT_MAX] range
  floor?: number;          // present for practical tier only
  explanation: string;     // "You chose healthcare-focused options 2×, so healthcare weight = 1.2"
}
```

**Contract extension constraint** (from Phase 2 PATTERNS.md "Contract Extension Constraint"):
All new `Profile` and `City` fields MUST be optional (`?`). `tsconfig strict:true` is active;
adding required fields breaks every existing typed fixture in `shared/engine/*.test.ts`.
`scoring.test.ts` declares a full `const testProfile: Profile = {...}` literal — it must
continue to compile unchanged.

---

## No Analog Found

There are no files in Phase 11 without a live-code analog.

The one area with partial coverage is the `QuestionDef` full interface shape (including
`groupHeader`, `autoAdvance`, `type: QuestionType`). `resolver.test.ts` defines a
`MinimalQuestion` interface (lines 19–24) but intentionally omits most fields.
The authoritative shape is in `02-02-PLAN.md` artifacts and is flagged as Assumption A2
in 11-RESEARCH.md (MEDIUM confidence). The planner should verify against live `questions.ts`
once Phase 2 lands and before writing `category-modules.ts` questions.

**Phase 12 items scoped OUT of Phase 11** (planner reminder per D-14 from CONTEXT.md):
- Adding factor computation to `scoring.ts` or `scoring-weights.ts` — Phase 12 only
- Sourcing FEMA per-hazard sub-scores — Phase 12 research item
- Two-tier floor application at scoring time — Phase 12 extends `scoring-weights.ts`

---

## Metadata

**Analog search scope:** `shared/engine/` (scoring.ts, scoring-weights.ts, dealbreakers.ts),
`shared/types.ts`, `shared/quiz-engine/*.test.ts` (on-disk), `.planning/phases/02-*/02-0x-PLAN.md`
**Files read:** 10 (scoring.ts, scoring-weights.ts, dealbreakers.ts, types.ts,
tension.test.ts, synthesizer.test.ts, resolver.test.ts, 02-02-PLAN.md, 02-04-PLAN.md,
02-PATTERNS.md)
**Pattern extraction date:** 2026-06-02
**Branch:** phase-4-intl
