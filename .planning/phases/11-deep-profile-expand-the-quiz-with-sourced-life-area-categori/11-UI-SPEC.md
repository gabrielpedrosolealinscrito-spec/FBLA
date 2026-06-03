# Phase 11 UI Spec — Quiz Engine Contract & Visual Render Guide

**Version:** 1.0 (Phase 11 Plan 04)
**Audience:** Collaborator rebuilding the whole-app UI
**Engine source of truth:** `shared/quiz-engine/` (UI-agnostic TypeScript)
**Status:** Contract-complete; production UI not included in this phase

---

## 1. Purpose and Boundary (D-03 / D-04 / D-05)

Phase 11 ships **logic + contract + this written spec**. It does NOT ship production UI.

The collaborator's job is to **rebuild the entire app UI** (including the quiz) to consume the engine
as a documented contract. The current `src/screens/Quiz.jsx` found in origin/main is **PROVISIONAL
and hardcoded** — it uses a hand-rolled `STEP_META` switch, an inline `CONFLICT_PAIRS` array, and
manual field capture per step. This `Quiz.jsx` implementation is to be **discarded and rebuilt**
from scratch against this contract (D-04, D-05). Do not bolt new questions onto the existing
hardcoded architecture.

The `shared/quiz-engine/` directory is the **UI-agnostic source of truth**. The collaborator's
UI is a *consumer* that binds to the contract described in this document. The quiz UI should have
no hardcoded question content; all questions are driven by `ALL_QUESTIONS` via `getVisibleQuestions`.

### Deliverables Phase 11 provides

| Artifact | Location |
|----------|----------|
| Answer-key constants | `shared/quiz-engine/keys.ts` |
| Extended Profile + City contract | `shared/types.ts` |
| Personality gate + weight synthesizer | `shared/quiz-engine/personality.ts` |
| Deep-dive category module questions | `shared/quiz-engine/category-modules.ts` |
| ALL_QUESTIONS registration | `shared/quiz-engine/questions.ts` |
| This contract spec | `.planning/phases/11-.../11-UI-SPEC.md` |

### What Phase 11 does NOT provide

- Production quiz UI (collaborator builds it from this spec)
- City data for new categories (Phase 12 sources it)
- Scoring against new categories (Phase 12 implements it)

---

## 2. The Contract to Consume (D-04)

The collaborator's UI interacts with the engine through exactly four exported functions.
Every function lives in `shared/quiz-engine/` and is UI-agnostic (no JSX, no React).

### 2.1 `getVisibleQuestions(answers, all)` — the render loop

```typescript
import { getVisibleQuestions } from './shared/quiz-engine/resolver.js';
import { ALL_QUESTIONS }        from './shared/quiz-engine/questions.js';

// Call on every answer change — returns the ordered QuestionDef[] to render now.
const visibleQuestions: QuestionDef[] = getVisibleQuestions(answers, ALL_QUESTIONS);
```

**Signature:** `getVisibleQuestions(answers: Answers, all: QuestionDef[]): QuestionDef[]`

The function accepts both arguments — `answers` (the live answer map, keyed by `QuestionDef.id`)
and `all` (the full `ALL_QUESTIONS` array). Pass both; do not call with one argument.

**What it returns:** The ordered subset of questions visible to the user at this point. A question
is included if:
- It has no `showIf` predicate (always visible), OR
- Its `showIf(answers)` returns `true`.

Phase 2's `detectTension` call is already wired in `resolver.ts` and splices any tension
follow-up inline. The collaborator does not need to call `detectTension` directly.

**Render loop:** Call `getVisibleQuestions` on every answer change. Render the returned array
step-by-step (split-rail layout, one `QuestionDef` per screen — see Section 3). Persist each
answer keyed by `QuestionDef.id` in a local answers map (`Record<string, unknown>`).

### 2.2 QuestionDef fields the UI consumes

```typescript
interface QuestionDef {
  id: string;               // answer key; unique across ALL_QUESTIONS
  type: QuestionType;       // 'single_select' | 'multi_select' | 'slider' |
                            //   'free_text' | 'boolean'
  kicker: string;           // section label (e.g. 'WHAT MATTERS', 'HEALTHCARE')
  prompt: string;           // question body text (render in Instrument Serif)
  subtext?: string;         // supporting copy (render in Manrope dim)
  required?: boolean;       // if false, allow skip
  autoAdvance?: boolean;    // advance to next question without CTA tap on single_select
  options?: QuestionOption[]; // for single_select / multi_select
  min?: number;             // for slider
  max?: number;             // for slider
  step?: number;            // for slider
  minLabel?: string;        // slider endpoint label
  maxLabel?: string;        // slider endpoint label
  maxSelect?: number;       // multi_select max selections
  groupHeader?: GroupHeader; // section break — render a header card before the question
  showIf?: (answers) => boolean; // handled by getVisibleQuestions; UI does NOT call this
}
```

The `groupHeader` field signals a module boundary. When present, render a full-width header
card (Instrument Serif label + Manrope subtext, accent border) before the question row.

### 2.3 `synthesizeProfile(answers)` — primary profile builder

```typescript
import { synthesizeProfile } from './shared/quiz-engine/synthesizer.js';

const profile: Profile = synthesizeProfile(answers);
```

Called once on quiz completion. Produces the Phase 2 `Profile` (income, weights, citizenship,
lifestyle tags, dealbreakers, tradeoffTolerance, etc.). This is the profile `rankCities` consumes.

### 2.4 `synthesizeCategoryWeights(answers)` — Phase 11 extension

```typescript
import { synthesizeCategoryWeights } from './shared/quiz-engine/personality.js';

const { categoryWeights, weightExplanations } = synthesizeCategoryWeights(answers);
// Merge onto the profile for Phase 12 consumption:
// profile.categoryWeights = categoryWeights;
// profile.weightExplanations = weightExplanations;
```

Called alongside `synthesizeProfile`. Returns:

- `categoryWeights: Record<string, number>` — per-category inferred weights for the 7 new
  scored categories (`healthcare`, `climateRisk`, `schools`, `childcare`, `demographics`,
  `parks`, `connectivity`). Raw values in `[0.3 .. 1.8]` — Phase 12 normalizes.
- `weightExplanations: WeightExplanation[]` — the explainability trace (see Section 5).

**D-02 NOTE (OPEN):** `synthesizeProfile` emits `profile.weights.{cost, career, lifestyle, safety}`
(raw 1–4) which Phase 3 uses for existing scoring. `synthesizeCategoryWeights` adds NEW fields
(`categoryWeights`, `weightExplanations`) alongside but does NOT replace the legacy `weights`
field. The question of whether the personality quiz replaces or layers Phase 2's `importanceRank`
derivation is deferred to Phase 2 integration (D-02 OPEN — see Section 8).

### 2.5 Tension detectors — post-quiz signal-or-null

```typescript
import { detectTension }            from './shared/quiz-engine/tension.js';
import { detectPersonalityTension } from './shared/quiz-engine/personality.js';
```

Both return a result object or `null`.

- `detectTension(answers)` — Phase 2. Detects conflicts between stated lifestyle preferences
  and priority ranking (e.g., "outdoors" + career-first). Used by `getVisibleQuestions` to inject
  Phase 2 tiebreaker questions. The collaborator may call it separately to conditionally surface
  the "We noticed something" reconcile card after quiz completion.

- `detectPersonalityTension(answers)` — Phase 11. Detects when the user chose "balanced" on
  ≥2 core tradeoff scenarios. Returns a `PersonalityTensionResult` (`afterId` + `question`) or
  `null`. This signal is available for the UI to surface a personality summary card:
  "You kept things balanced — here's what that means for your city matches."

Live tension injection is **already active in `resolver.ts`** (Phase 2's responsibility, D-01).
`detectTension` is called inside `getVisibleQuestions` and splices the tiebreaker question inline
when it fires. The collaborator renders whatever `getVisibleQuestions` returns; they do NOT need
to hand-wire conflicts or call `detectTension` themselves during the question flow.

---

## 3. Visual Language (Gold-Cinematic)

The established visual language comes from `origin/main:src/screens/Quiz.jsx` and
`origin/main:src/screens/Landing.jsx`. The collaborator rebuilds the quiz UI in this language.
Do not invent new design tokens; use the values below.

### 3.1 Design Tokens

```css
/* Color palette */
--accent:     #e2b56b;            /* gold — CTAs, selected state, progress */
--accent-dim: rgba(226,181,107,.13); /* selected card background */
--glow:       rgba(226,181,107,.6);  /* glow effect on accent */
--glow-sel:   rgba(226,181,107,.3);
--bg:         #070a11;            /* page background — near-black */
--bg2:        #0d1119;            /* card layer */
--card:       rgba(255,255,255,.035);
--ink:        #f3ede1;            /* primary text — ivory */
--dim:        rgba(243,237,225,.56); /* secondary text */
--faint:      rgba(243,237,225,.30); /* tertiary / disabled */
--border:     rgba(243,237,225,.12);
--border2:    rgba(243,237,225,.24); /* hovered / selected border */

/* Typography */
--serif: 'Instrument Serif', serif;      /* headings, question prompts */
--mono:  'JetBrains Mono', monospace;    /* numeric values, IDs */
--body:  'Manrope', sans-serif;          /* all UI body copy */
```

### 3.2 Split-Rail Step Layout

The quiz uses a **split-rail layout** (`grid-template-columns: 300px 1fr`):

- **Left rail (`.rail`):** Sticky brand header ("Potential") + `STEP_LIST` of quiz section
  kickers, with a dot indicator (filled gold = active, dim = incomplete, check = done).
  Kickers map to `QuestionDef.kicker` groups: CAREER, FINANCES, ABOUT YOU, LIFESTYLE,
  PRIORITIES, GOING GLOBAL, WHAT MATTERS (Phase 11), HEALTHCARE, FAMILY & SCHOOLS, etc.
- **Right pane (`.pane`):** The active question. Animate in with `qzfade` on step change.

### 3.3 Input Primitives

Map `QuestionDef.type` to these UI treatments:

| type | Visual treatment |
|------|-----------------|
| `single_select` with `options` ≤ 4 | Choice tiles (`.tile`) in a 2-col grid — border-radius 12px, accent border on selected |
| `single_select` with `options` > 4 | Pill row (`.pill`) — inline flex-wrap, accent fill on selected |
| `multi_select` | Pill row with multi-select tracking; dim `.dis` on pills past `maxSelect` |
| `slider` | Range input with CSS gradient — accent fills the filled side, `JetBrains Mono` value display |
| `free_text` | Text input — ivory-border, placeholder in `--faint` |
| `boolean` | Tile pair (Yes / No) |

### 3.4 Tradeoff Scenario Presentation (Personality Gate)

Phase 11's `PERSONALITY_QUESTIONS` are single-select choice tiles with a distinct kicker
`WHAT MATTERS`. These are the weight-bearing tradeoff questions. Render them as **choice tile pairs**
(2-col grid), not pill rows — the tradeoff framing (one city vs. another) suits a tile layout.

The `"balanced"/"depends"` option is a third tile that should be visually distinct (dimmer by
default, full accent if selected) to signal that it's a "pass" option that may trigger an
adaptive follow-up.

### 3.5 Trait Statement Presentation (Non-Weight-Bearing)

Phase 11's `TRAIT_QUESTIONS` (`kicker: 'A LITTLE ABOUT YOU'`) are agree/disagree statements.
Render them as a three-option pill row (strongly agree / agree / disagree). These are skippable
(`required: false`) and do not affect weights.

### 3.6 Module Entry Points (Guided Flow)

Before the first question of each category module (detected by `QuestionDef.groupHeader`),
render a **module header card**:

- Label in Instrument Serif (e.g., `HEALTHCARE`)
- Subtext from `groupHeader.subtext` in Manrope dim
- Optional data-caveat annotation (see Section 7)

The `groupHeader` card establishes the context ("Your health needs, your city.") and surfaces
the data-source caveat in a low-key way — not a legal disclaimer, just honest framing.

### 3.7 "We noticed something" Reconcile Card

This card surfaces when `detectTension(answers)` or `detectPersonalityTension(answers)` returns
non-null, after the quiz answer stream has passed the trigger question. It uses the existing
visual treatment from `Quiz.jsx` — a `.warn` card with gold border, bold header, and dim body.

The card is **driven by the engine's tension output**, not by hardcoded `CONFLICT_PAIRS`.
The collaborator calls `detectTension` / `detectPersonalityTension` and renders the card based
on the returned signal. They do NOT re-implement the conflict detection logic.

### 3.8 Done — Summary Grid

After `synthesizeProfile` + `synthesizeCategoryWeights` return, show the "done" summary grid:

- City match scores (from `rankCities`)
- Profile snapshot (income, weights)
- `weightExplanations` rendered as plain sentences (Section 5)
- CTA to the results/city-detail view

The summary grid uses the `.summary` / `.srow` styles from `Quiz.jsx`:
`grid-template-columns: 1fr 1fr`, `background: --border` (grid lines), `.srow .v.mono` for
numeric values in `JetBrains Mono`.

---

## 4. Reconcile Moment — Engine-Driven, Not Hardcoded (D-01)

The existing `Quiz.jsx` hard-codes `CONFLICT_PAIRS` to detect conflicts between career/lifestyle
priority choices. The rebuilt UI **removes all hardcoded conflict detection**.

The engine exposes:

```typescript
detectTension(answers)            // Phase 2: career/lifestyle/safety signal
detectPersonalityTension(answers) // Phase 11: balanced-tradeoff signal
```

**Live injection (active):** `detectTension` is called inside `getVisibleQuestions` and splices
the tiebreaker question inline when a conflict fires. When the user reaches the tension trigger
answer, `getVisibleQuestions` automatically returns the tiebreaker question in the next position.
The collaborator renders whatever `getVisibleQuestions` returns — no special injection logic needed.

**Reconcile card (post-quiz):** If either tension detector returns non-null after quiz completion,
surface the "We noticed something" card before or alongside the summary grid. Use the signal's
content (or a generic framing) — never the hardcoded `CONFLICT_PAIRS` strings.

Live tension injection is **already implemented in `resolver.ts`** (Phase 2's work, D-01).
Phase 11 does not modify `resolver.ts` — the injection is Phase 2's logic and it is active today.
`detectPersonalityTension` is a sibling function (Phase 11) available for post-quiz summary cards
but is NOT wired into `getVisibleQuestions` — the collaborator calls it separately if needed.

---

## 5. Explainability Surface — `weightExplanations` (D-08)

The collaborator MUST render `profile.weightExplanations` on the results screen. This is the
trust anchor for the product: judges and users should be able to see exactly why each category
was weighted the way it was.

**Render format:** One sentence per `WeightExplanation` entry:

> "You chose healthcare-focused options 2 times, so healthcare weight = 1.20"
> "You chose career-focused options 1 time, so career weight = 0.90"

Or equivalently:

> "You chose [category]-focused options [tally], so [category] × [weight]"

You can style the weight value as a `JetBrains Mono` token (same as a numeric value elsewhere).

**Interface:**

```typescript
interface WeightExplanation {
  category: string;        // e.g. "healthcare" | "lifestyle" | "connectivity"
  inferredWeight: number;  // raw value in [WEIGHT_FLOOR .. WEIGHT_MAX]
  floor?: number;          // present for practical tier (healthcare, safety)
  explanation: string;     // pre-built human-readable sentence (use this directly)
}
```

**Never present a black-box personality type.** The product does not output "You are an Adventurer"
or "Type INTJ." Every category weight is explainable from specific answer choices. The
`explanation` field is the sentence the user sees; it must trace back to choices they made.

Categories with no signal (skipped modules) receive `NEUTRAL_DEFAULT` (0.5) and no
`WeightExplanation` entry — do not render a "0 choices" explanation for skipped categories.

---

## 6. Guided-Modular Flow (D-11 / D-12 / D-13)

### 6.1 Module Recommendation

After the personality gate questions are answered, the engine's `showIf` predicates on category
module questions determine which modules are visible. The personality gate result recommends
modules by:

- `tradeoff_healthcare === 'healthcare_critical'` → surfaces Healthcare module
- `tradeoff_family_vs_mobility === 'family_critical'` → surfaces Family & Schools module
- `tradeoff_connectivity_vs_cost === 'connectivity_critical'` → surfaces Connectivity module

Climate risk, demographics, and parks modules are **opt-in only** — they have no tradeoff
anchor, so they appear only when `moduleSelected_{category} === true` is in the answers map.

### 6.2 Module Opt-In Toggle

The collaborator should provide a **module selection panel** (accessible after the personality
gate) where the user can explicitly toggle modules:

```
moduleSelected_climateRisk  → true/false
moduleSelected_demographics → true/false
moduleSelected_parks        → true/false
```

Set these in the answers map; `getVisibleQuestions` will then include those module questions.
The toggle can use the pill or tile primitive with an on/off state.

### 6.3 Neutral Skip — Never Breaks (D-13)

All module questions are `required: false`. If a user skips a module entirely (or never opts in),
`synthesizeCategoryWeights` emits `NEUTRAL_DEFAULT` (0.5) for that category. The scoring engine
always receives a valid finite number; scoring never produces `NaN` or crashes from a missing weight.

The collaborator should make it clear that skipping is allowed: the skip CTA ("Skip this section")
should be visible alongside the module header card, not buried.

### 6.4 Module Depth

| Module | Depth | Data source |
|--------|-------|-------------|
| Healthcare | Rich | Numbeo Health Care Index (22/22 cities) |
| Family & Schools | Rich | NAEP 2024 + CCAoA 2024 (state-level) |
| Climate / Risk | Light | FEMA NRI v1.20 (per-hazard sub-scores) |
| Demographics | Light | Census ACS 2024 (neutral factual) |
| Parks / Outdoors | Light | TPL ParkScore 2026 (partial coverage) |
| Connectivity | Light | FAA CY2023 enplanements + hub class |

---

## 7. Data Caveats — Surface These in the UI

These caveats are non-negotiable. They must appear in question subtext or module header
`groupHeader.subtext`. They exist because the underlying data sources have real limitations
that a judge or user could challenge.

### 7.1 Schools and Childcare — State Average, Not City-Specific

School quality (NAEP 2024 G8 Reading) and childcare cost (CCAoA 2024) are **state averages**.
Cities in the same state share the same score — Austin, Dallas, and San Antonio all get Texas's
NAEP score.

**Where to surface:** The Family & Schools module header already has this text:
> "School and childcare data are state averages, not city-specific — cities in the same state share the same score."

Preserve this subtext in the header card.

### 7.2 Climate Risk — primaryHazardConcern, Not Composite

The FEMA NRI composite score barely discriminates among large metros (range 88–99.97). Phase 12
uses `primaryHazardConcern` to map to per-hazard sub-scores (hurricane, wildfire, flood, heat,
tornado).

**What to surface:** The climate module captures `climate_primary_hazard` (the user's specific
concern). The engine uses `primaryHazardConcern` as the Phase 12 mapping key. Do not display or
describe the composite FEMA score directly in the UI — show per-hazard context only.

### 7.3 Demographics — Neutral Factual Stat, NEVER "people like you"

`foreignBornPct` is a Census ACS demographic count. It is a factual statistic about the city's
composition. It is **never presented as a similarity score, a cultural-fit metric, or a
"people like you" indicator**.

This is a hard constraint (D-14). Any UI framing that presents `foreignBornPct` as measuring
how well the city "matches" the user's background violates D-14 and must not be implemented.

**Correct framing:** "X% of residents were born outside the US" — neutral, factual, informational.
**Prohibited framing:** "cities with people like you", "cultural match score", "community fit".

The demographics module `groupHeader.subtext` already reads:
> "Factual Census data — we show you the statistic, not a 'fit score'."

Preserve this framing across any UI layer that displays the demographic statistic.

### 7.4 ParkScore Coverage Gap

TPL ParkScore 2026 is confirmed for only 7 of 22 cities. Phase 12 falls back to the existing
`nearMountains`/`nearCoast` boolean fields on `City` for the remaining 15 cities.

**Where to surface:** Parks module `groupHeader.subtext` already documents this:
> "Park scores from the Trust for Public Land — falls back to mountain/coast proximity where city data is unavailable."

### 7.5 Healthcare — Crowdsourced Index

Numbeo Health Care Index is crowdsourced. Boise has approximately 36 contributors, making its
score less reliable than higher-traffic cities. Surface as a general disclosure if surfacing raw
healthcare index scores, not as a specific warning per city.

---

## 8. Phase 12 Hard Requirements (Do Not Lose)

Phase 11 carries these requirements forward explicitly so they are not lost between phases.
Phase 12 MUST address all of them before marking itself complete.

### 8.1 BASE_SCORE + Clamp Recalibration — BLOCKER (Pitfall 6)

Phase 3's `scoring-weights.ts` is calibrated so that:
```
BASE_SCORE (50) + Σ(global[f] × maxContribution[f]) = ~90.4
```
This ensures `clamp(rawScore, 0, 99)` is permanently inert — the clamp never fires in the
normal range, so the displayed `matchScore` badge reconciles with the `scoreFactors`
contribution bars.

When Phase 12 adds 7 new scored categories (healthcare, climateRisk, schools, childcare,
demographics, parks, connectivity), each with a `maxContribution`, the theoretical max rawScore
will exceed 99. The clamp becomes active and fires on strong profiles. This desyncs the badge
from the bars — the exact Phase 3 BLOCKER caught in the code review (MEMORY.md: "assert what
the user sees").

**Phase 12 MUST:**
1. Decide new per-factor cap distribution across all 11 factors (4 existing + 7 new)
2. Verify `BASE_SCORE + Σ(all caps, old + new) < 99`
3. Run `scoring.test.ts` asserting the **user-facing displayed score** (not a pre-clamp
   invariant) reconciles with the contribution bar sum
4. Do NOT add factors to `scoring-weights.ts` without completing steps 1–3 first

### 8.2 D-02 OPEN — Replace vs. Layer

The personality quiz in Phase 11 infers `categoryWeights` for the 7 new categories. It also
has signals for `safety` and `career` which overlap with Phase 2's `importanceRank` derivation.

Phase 2's `synthesizeProfile` emits `profile.weights.{cost, career, lifestyle, safety}` (raw 1–4);
Phase 3's `rankToWeight` reads those values directly. Phase 11 does NOT change this.

The open question: after Phase 2 lands, does the personality quiz **replace** Phase 2's
`importanceRank`-derived weights (cleaner, one weighting mechanism) or **layer** on top of them
(safer, additive, D-02 deferred)? This must be resolved at Phase 2 integration before Phase 2
is marked complete. The answer changes how Phase 12's `rankToWeight` successor aggregates all
weight inputs.

### 8.3 Two-Tier Floor Values — Provisional

`WEIGHT_FLOOR` (0.3), `WEIGHT_MAX_PRAC` (1.5), `WEIGHT_MAX_PREF` (1.8), `NEUTRAL_DEFAULT` (0.5)
are exported from `personality.ts` as Phase-12-tunable constants. Phase 12 should verify these
values produce sensible score distributions before finalizing. Tune in `scoring-weights.ts`.

### 8.4 ParkScore Fallback + FEMA Per-Hazard Sourcing

Both are Phase 12 research/implementation items:

- **Parks:** source per-city ParkScore for the 15 missing cities or confirm `nearMountains` /
  `nearCoast` is sufficient for discrimination.
- **FEMA per-hazard:** source per-hazard NRI sub-scores (hurricane, wildfire, flood, heat,
  tornado) and map from `primaryHazardConcern` to the correct sub-score column. Do NOT use
  the FEMA composite `RISK_SPCTL` for scoring — it barely discriminates among large metros.

---

## 9. Full Engine Flow (Architecture Reference)

```
User opens quiz
    │
    ▼
getVisibleQuestions(answers, ALL_QUESTIONS)
    │
    ├── Phase 2 questions (career, finances, background, lifestyle, priorities, Going Global)
    │
    ├── Phase 11: Personality Gate (WHAT MATTERS kicker)
    │       5 tradeoff scenarios (weight-bearing)
    │       4 trait statements (flavor only, non-weight-bearing)
    │           │
    │           └── detectPersonalityTension(answers)
    │                   → injects tiebreaker if >=2 "balanced" (signal-or-null)
    │
    └── Phase 11: Category Modules (shown by showIf on personality answers)
            Healthcare module     (rich — 3 questions)
            Family & Schools      (rich — 4 questions)
            Climate / Risk        (light — 2 questions)
            Demographics          (light — 2 questions)
            Parks / Outdoors      (light — 2 questions)
            Connectivity          (light — 2 questions)
            └── All required:false → skipped = NEUTRAL_DEFAULT weight (D-13)

User completes quiz → synthesizeProfile(answers) + synthesizeCategoryWeights(answers)
    │
    ├── synthesizeProfile → Profile.weights (raw 1–4) + all Phase 2 fields
    │
    └── synthesizeCategoryWeights →
            categoryWeights: Record<string, number>   // [0.3 .. 1.8] raw
            weightExplanations: WeightExplanation[]    // explainability trace (D-08)

Extended Profile → Phase 12 scoring engine
    rankCities(profile) reads:
        profile.weights.{cost, career, lifestyle, safety}  ← Phase 2/3 legacy
        profile.categoryWeights.{healthcare, ...}          ← Phase 11 new
        profile.weightExplanations                         ← rendered in summary UI
```

---

## 10. Integration Checklist for the Collaborator

Before marking the quiz UI complete, verify:

- [ ] `getVisibleQuestions(answers, ALL_QUESTIONS)` is called on every answer update (not cached)
- [ ] `clearHiddenAnswers(answers, ALL_QUESTIONS)` is called when navigating backwards
- [ ] All `QuestionDef.id` values are used as answer keys (not display text)
- [ ] `synthesizeProfile` AND `synthesizeCategoryWeights` are both called on completion
- [ ] `weightExplanations` are rendered — not omitted or shown as debug JSON
- [ ] `foreignBornPct` (if shown) is framed as "people like you" prohibition wording is absent
- [ ] State-average caveat is visible for schools/childcare module
- [ ] `primaryHazardConcern` answer is captured (enables Phase 12 per-hazard scoring)
- [ ] All module questions are `required:false` with an accessible skip CTA
- [ ] Phase 12 clamp/BASE_SCORE task is tracked in Phase 12's plan (D-02 open item recorded)

---

## 11. Scope Boundaries

| In scope for Phase 11 | Deferred |
|-----------------------|----------|
| `shared/quiz-engine/` engine extensions | Production quiz UI (collaborator) |
| Extended `Profile` + `City` contract | City data for new categories (Phase 12) |
| `synthesizeCategoryWeights` | Scoring new categories (Phase 12) |
| `detectPersonalityTension` | Two-tier floor tuning (Phase 12) |
| This spec document | D-02 reconciliation (Phase 2 integration) |
| ALL_QUESTIONS registration (questions.ts) | FEMA per-hazard sub-scores (Phase 12 research) |

---

*Phase 11, Plan 04 — Contract complete. Engine source of truth: `shared/quiz-engine/`.*
*Phase 12 dependencies: BASE_SCORE/clamp recalibration BLOCKER, D-02 resolution, floor tuning.*
