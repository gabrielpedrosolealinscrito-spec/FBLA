# Phase 11: Deep Profile — Research

**Researched:** 2026-06-02
**Domain:** Quiz-engine extension, extensible weight-map contract, personality-informed weighting, adaptive question branching
**Confidence:** MEDIUM — engine interface inferred from Phase 2 plan docs (shared/quiz-engine/ does not exist on disk yet); scoring.ts and scoring-weights.ts read live from Phase 3 output; data-gating from deep-category-data.md (verified source document).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Phase 11 builds the **net-new scored categories only**. Do not reconcile with or modify Phase 2's soft-preference dimensions while Phase 2 is in flight.
- **D-02 (OPEN):** The personality-quiz weighting effectively supersedes Phase 2's `importanceRank` derivation. This stays OPEN — resolve at Phase 2 integration (replace vs. layer). Flag for the planner.
- **D-03:** Deliverable = **logic + contract + written UI spec**. Phase 11 ships `shared/` engine extensions, the extended `Profile` contract, a documented quiz contract, and a UI spec for the collaborator. No production quiz UI.
- **D-04:** Collaborator rebuilds the **whole app UI including the quiz**. `shared/quiz-engine/` is the UI-agnostic source of truth. Contract = `getVisibleQuestions(answers)` → render `QuestionDef[]` → `synthesizeProfile(answers)`; `detectTension(answers)`.
- **D-05 (coordination note):** Phase 2's `src/screens/quiz/*` UI is provisional — the collaborator replaces it. Phase 2 should invest in the engine + a clean contract, not pixel polish.
- **D-06:** Category weights are **inferred from an upfront personality/values quiz**, not set by explicit sliders or ranking.
- **D-07:** Style = **hybrid** — tradeoff scenarios anchor the weights + trait statements for color/flavor.
- **D-08:** The answer→weight mapping must stay **explainable** ("you kept choosing lifestyle-over-cost, so lifestyle ×1.8"). Hard Q&A-defensibility requirement. Never a black-box personality type.
- **D-09:** Weighting model = **two-tier with a floor**. Practical factors (cost, safety, healthcare) keep a weight floor so they always matter; preference factors (lifestyle, nightlife...) swing freely above it.
- **D-10:** Personality gate length = **adaptive**. ~5 core tradeoffs, adding more only where answers are ambiguous/conflicting — reuses Phase 2's tension-detection engine pattern.
- **D-11:** **Guided modular** flow. Personality result recommends which deep-dive modules to surface; user can add others.
- **D-12:** Module depth = **mixed by category**. Rich sub-questions for high-impact modules (healthcare: chronic conditions / dependents needing specialists; family: ages of kids); light (mostly importance + one qualifier) for lower-impact ones (parks, connectivity).
- **D-13:** **Skipped modules fall back to a neutral default weight** so scoring never breaks and skipping never strands a user.
- **D-14:** In-scope scored categories (Tier 1/2): healthcare, climate/disaster risk, schools/childcare, demographics (factual — e.g. foreign-born %, NOT a "people like you" score), parks/outdoors, connectivity. Final set gated by `deep-category-data.md`.
- **D-15:** Tier-3 categories (political/values fit, social/dating) are **omitted entirely** — undefensible data, deliberate out-of-scope.

### Claude's Discretion

Exact tradeoff-scenario content and trait statements; precise weight-floor values and swing range (tune against `scoring-weights.ts` in Phase 12); adaptive-trigger thresholds (reuse tension.ts heuristics); per-module sub-question wording; the exact shape of the extended weight map (replace the fixed `{cost,career,lifestyle,safety}` with an extensible map keyed by category). Keep everything structured and explainable.

### Deferred Ideas (OUT OF SCOPE)

- Tier-3 factual self-select (political/values fit, social/dating presented as facts + user filter) → post-competition.
- Reconciling Phase 2's soft-preference dimensions with Phase 11's personality weighting → after Phase 2 lands (D-02 open item).
- Whether the personality quiz replaces or layers over Phase 2's `importanceRank` → resolve at Phase 2 integration (D-02).
</user_constraints>

<phase_requirements>
## Phase Requirements

> Phase 11 requirements are not yet mapped in REQUIREMENTS.md. The following IDs are recommended for addition; the planner should formally add them.

| ID (proposed) | Description | Research Support |
|---------------|-------------|------------------|
| QUIZ-06 | User completes an upfront personality/values quiz (~5 core tradeoff scenarios, adaptive) that infers category-level weights | Hybrid tradeoff+trait pattern; tension.ts reuse |
| QUIZ-07 | Personality result recommends which deep-dive category modules to surface; user can add others | Guided-modular flow (D-11) |
| QUIZ-08 | User completes rich sub-questions for selected high-impact modules (healthcare, family/schools) and light sub-questions for lower-impact ones (parks, connectivity) | Module-depth split (D-12); data from deep-category-data.md |
| QUIZ-09 | Skipped modules fall back to a neutral default weight so scoring never breaks | Neutral-skip pattern (D-13) |
| MATCH-05 | Scoring engine receives an extended `Profile` with a `categoryWeights` map (additive to legacy `weights?`) + per-category explainability trace, allowing Phase 12 to consume new-category scores | Additive contract (see Architecture section); Phase 12 seam |

**Mapping note:** QUIZ-06 through QUIZ-09 belong to the QUIZ family (profile-capture additions). MATCH-05 belongs to the MATCH family (engine-contract addition). Phase 12 will consume MATCH-05's contract to produce category-scored rankings.
</phase_requirements>

---

## Summary

Phase 11 builds the data-backed life-area category capture layer that the current quiz entirely lacks — healthcare, climate/disaster risk, schools/childcare, demographics, parks/outdoors, and air connectivity — plus an upfront personality/values mechanism that infers how much each category matters to the user. The deliverable is three artifacts: (1) new `shared/quiz-engine/` modules (the personality gate + deep-dive module question sets), (2) an extended `Profile` contract in `shared/types.ts`, and (3) a documented quiz contract + UI spec for the collaborator who rebuilds the app UI.

The most critical technical decision is **how to extend the weight contract without breaking in-flight Phase 2 and landed Phase 3.** Phase 3's `scoring.ts` `rankToWeight` reads `profile.weights.cost/.career/.lifestyle/.safety` directly. Phase 2's in-flight `synthesizeProfile` emits those same four keys. D-02 leaves the replace-vs-layer question OPEN. Therefore the correct strategy is **additive**: introduce `profile.categoryWeights: Record<string, number>` as a new optional field (carrying all six new categories, and eventually the original four), leaving `profile.weights?: {cost, career, lifestyle, safety}` untouched until D-02 is resolved at Phase 2 integration. This is the safe path that lets Phase 11 ship without waiting on or modifying Phase 2/3.

The second critical concern is the **explainability contract**: Phase 3's `scoreFactors` pattern shows that every scored contribution must be recorded as a named factor with its contribution value. Phase 11's weight-inferences must emit an analogous structure — a `weightExplanations` field on the Profile — so the UI can show "you kept choosing lifestyle-over-cost, so lifestyle ×1.8." Without this as a first-class contract field, the collaborator cannot build the explainability UI (D-08) and judges cannot verify the product isn't a black box.

**Primary recommendation:** Build Phase 11 in two new modules — `shared/quiz-engine/personality.ts` (the ~5 tradeoff scenarios with adaptive follow-ups, mirroring `tension.ts`'s signal-or-null pattern) and `shared/quiz-engine/category-modules.ts` (the QuestionDef arrays for each life-area category) — both registered in `ALL_QUESTIONS` alongside Phase 2's existing questions. Extend `Profile` in `shared/types.ts` with `categoryWeights?: Record<string, number>`, `weightExplanations?: WeightExplanation[]`, and the new captured fields from each module. Write a UI spec document that documents the `getVisibleQuestions` / `synthesizeProfile` / `detectTension` contract so the collaborator can build the UI against it without reading the engine source.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Personality/tradeoff quiz questions | `shared/quiz-engine/personality.ts` | — | Pure TS config; UI-agnostic. Collaborator binds to `getVisibleQuestions` |
| Adaptive personality follow-ups | `shared/quiz-engine/personality.ts` (new `detectPersonalityTension`) | Reuses `tension.ts` pattern | Signal-or-null; injects questions after trigger, same invariant as Phase 2 |
| Deep-dive module question sets | `shared/quiz-engine/category-modules.ts` | — | Registered in `ALL_QUESTIONS`; gated by `showIf` tied to personalityResult |
| Category-weight synthesis | `shared/quiz-engine/synthesizer.ts` extension OR new `shared/quiz-engine/category-synthesizer.ts` | — | Pure function; emits `categoryWeights` + `weightExplanations` alongside (not replacing) `weights` |
| Extended `Profile` contract | `shared/types.ts` | — | Contract-first rule; change in small announced commits |
| Two-tier weight floor/swing | `shared/engine/scoring-weights.ts` (Phase 12 adds it) | `categoryWeights` carries the raw inferred values | Phase 11 designs the structure; Phase 12 applies the floor at scoring time |
| UI spec document | `.planning/phases/11-.../11-UI-SPEC.md` | — | Collaborator artifact; not production code |
| Production quiz UI | COLLABORATOR (binds to contract) | — | D-03: Phase 11 ships no production quiz UI |
| City scoring against new categories | Phase 12 | — | Hard boundary: Phase 11 captures; Phase 12 scores |

---

## Standard Stack

### No New Packages

Phase 11 installs **no new npm dependencies.** All implementation uses:

- **TypeScript** — existing `shared/` language
- **Phase 2's quiz-engine patterns** — `QuestionDef`, `showIf`, `getVisibleQuestions`, `clearHiddenAnswers`, `detectTension` (reused pattern, not edited)
- **`shared/types.ts`** — extended additively

[VERIFIED: codebase grep] — `shared/engine/` exists and uses no quiz-related external packages. `shared/quiz-engine/` does not exist on disk yet (ls returned exit 1); it will be created by Phase 2 execution.

**Package Legitimacy Audit:** Not applicable — zero new packages.

---

## Architecture Patterns

### The Additive Contract Extension (Critical)

**What:** Add `categoryWeights` and `weightExplanations` to `Profile` as new optional fields. Do NOT remove or rename `weights?: {cost, career, lifestyle, safety}`. Leave D-02 (replace vs. layer) to be resolved at Phase 2 integration.

**Why this matters:** Phase 3 `scoring.ts` line 38 reads `profile.weights.cost` directly. Phase 2's in-flight `synthesizeProfile` emits `weights: {cost, career, lifestyle, safety}`. Breaking either would block the demo. The additive approach lets all three phases coexist without waiting on each other.

**The safe migration shape:**

```typescript
// Source: shared/types.ts — additive extension (Phase 11)
// WeightExplanation — emitted by category-synthesizer for D-08 explainability
export interface WeightExplanation {
  category: string;           // e.g. "healthcare" | "lifestyle" | "cost"
  inferredWeight: number;     // 0–2 range (floor to swing); normalized for Phase 12
  floor?: number;             // minimum weight for this tier (practical factors only)
  explanation: string;        // human-readable: "You chose health over cost 3×, so healthcare ×1.6"
}

// Extended Profile fields (Phase 11 additions — additive, not replacing)
export interface Profile {
  // ... all existing fields unchanged ...

  // Phase 11: personality-inferred category weights
  // Keyed by category slug: "healthcare" | "climateRisk" | "schools" | "childcare"
  //   | "demographics" | "parks" | "connectivity"
  // Optional: absent until Phase 11 lands; Phase 12 checks for its presence
  categoryWeights?: Record<string, number>;

  // Phase 11: explainability trace — mirrors Phase 3's scoreFactors pattern (D-08)
  // One entry per category where weight was inferred
  weightExplanations?: WeightExplanation[];

  // Phase 11: new captured fields from category modules
  hasChronicCondition?: boolean;    // healthcare module
  needsSpecialistAccess?: boolean;  // healthcare module
  hasDependentsInSchool?: boolean;  // schools module (ages of kids)
  kidsAges?: string[];              // schools/childcare module
  disasterRiskConcern?: string;     // climateRisk module: "high" | "moderate" | "low"
  primaryHazardConcern?: string;    // climateRisk module: "hurricane" | "wildfire" | "flood" | etc.
  internationalTraveler?: boolean;  // connectivity module
  outdoorsFrequency?: string;       // parks module: "daily" | "weekend" | "occasional"
  demographicsMatters?: boolean;    // demographics module (explicit opt-in to view stat)

  // Phase 11: personality gate output — stored so the UI can show the tradeoffs
  personalityTradeoffs?: { scenario: string; choice: string }[];

  // Phase 2 compatibility — D-02 OPEN, do NOT touch until Phase 2 lands
  // Phase 2 emits this; Phase 3 reads it; Phase 11 leaves it as-is
  weights?: { cost: number; career: number; lifestyle: number; safety: number };
  tradeoffTolerance?: { dimension: string; preference: string }[];
}
```

[CITED: shared/types.ts — current Profile interface read directly]
[CITED: shared/engine/scoring.ts lines 34–61 — rankToWeight reads profile.weights]
[CITED: 02-02-PLAN.md — synthesizeProfile emits raw 1–4 weights on profile.weights]

### System Architecture Diagram

```
User answers
    |
    v
getVisibleQuestions(answers, ALL_QUESTIONS)
    |
    ├── [Phase 2 questions]  career, finances, background, lifestyle, priorities, dealbreakers, Going Global
    |
    ├── [Phase 11: Personality Gate]  ~5 tradeoff scenarios
    |       |
    |       +-- detectPersonalityTension(answers)  → injects adaptive follow-up (signal-or-null)
    |
    └── [Phase 11: Category Modules]  healthcare, climateRisk, schools, childcare,
                                       demographics, parks, connectivity
            |
            + showIf: module recommended by personality result OR user explicitly selected it
            + skipped module → neutral default weight (D-13: no NaN)

         synthesizeProfile(answers)
            |
            ├── synthesizeCategoryWeights(answers) → categoryWeights: Record<string, number>
            |                                         weightExplanations: WeightExplanation[]
            |
            └── [Phase 2 untouched] → weights: {cost, career, lifestyle, safety} (raw 1–4)

         Profile (extended)
            |
            └── Phase 12: scoring engine reads categoryWeights + existing weights
                           applies two-tier floor (practical) / swing (preference)
                           emits scoreFactors with new-category contributions
```

### Recommended New Module Structure

```
shared/
├── quiz-engine/              ← Phase 2 creates this; Phase 11 adds to it
│   ├── questions.ts          ← Phase 2 (ALL_QUESTIONS); Phase 11 adds personality + module questions
│   ├── resolver.ts           ← Phase 2 (getVisibleQuestions, clearHiddenAnswers); not edited
│   ├── synthesizer.ts        ← Phase 2; Phase 11 adds synthesizeCategoryWeights call or
│   │                            extracts to category-synthesizer.ts (separate module preferred)
│   ├── tension.ts            ← Phase 2 (detectTension for original pairs); not edited
│   ├── personality.ts        ← Phase 11 NEW: tradeoff scenarios + detectPersonalityTension()
│   └── category-modules.ts  ← Phase 11 NEW: QuestionDef[] for each life-area category
├── types.ts                  ← extended additively (WeightExplanation + new Profile fields)
└── engine/
    ├── scoring.ts            ← Phase 3 (do not edit in Phase 11; Phase 12 extends)
    └── scoring-weights.ts    ← Phase 3 (Phase 12 adds floor/swing config)
```

### Pattern 1: Personality Tradeoff Gate (D-07/D-08)

**What:** Five tradeoff QuestionDefs, each presenting a binary or three-way choice between categories. Answers accumulate a tally per category. `synthesizeCategoryWeights` converts tallies to weights.

**When to use:** Always shown first in the extended quiz flow; gates which modules get recommended.

**Tradeoff scenario examples (five core, Claude's discretion on wording):**

```typescript
// Source: [ASSUMED] — pattern derived from 16Personalities-style tradeoff design
// and Phase 2's detectTension hybrid approach

const PERSONALITY_QUESTIONS: QuestionDef[] = [
  {
    id: "tradeoff_cost_vs_lifestyle",
    type: "single_select",
    prompt: "You have two city options: one is affordable but has limited nightlife and culture. The other has great energy and things to do, but costs 30% more. Which do you lean toward?",
    options: [
      { value: "cost_wins", label: "I'd take the savings" },
      { value: "lifestyle_wins", label: "I'd pay for the experience" },
      { value: "balanced", label: "Depends — I'd want to see the numbers" },
    ],
  },
  {
    id: "tradeoff_safety_vs_career",
    type: "single_select",
    prompt: "A high-growth city for your career has higher crime rates and costs more. A quieter, safer city has fewer opportunities but lower stress. Which direction pulls you?",
    options: [
      { value: "safety_wins", label: "Safety and stability first" },
      { value: "career_wins", label: "Career growth is worth the tradeoff" },
      { value: "balanced", label: "I need both to feel right" },
    ],
  },
  {
    id: "tradeoff_healthcare",
    type: "single_select",
    prompt: "How important is it that your city has world-class hospitals and specialist access?",
    options: [
      { value: "healthcare_critical", label: "Very important — I have specific medical needs" },
      { value: "healthcare_moderate", label: "Important, but basic access is fine" },
      { value: "healthcare_low", label: "Not a priority for me right now" },
    ],
  },
  {
    id: "tradeoff_family_vs_mobility",
    type: "single_select",
    prompt: "If you had (or plan to have) kids, would school quality and childcare costs be major factors?",
    options: [
      { value: "family_critical", label: "Yes — this would be a top concern" },
      { value: "family_moderate", label: "Somewhat — one factor among many" },
      { value: "family_low", label: "Not in my situation right now" },
    ],
  },
  {
    id: "tradeoff_connectivity_vs_cost",
    type: "single_select",
    prompt: "How much does having a major international airport nearby matter to you?",
    options: [
      { value: "connectivity_critical", label: "A lot — I travel internationally often or plan to" },
      { value: "connectivity_moderate", label: "Nice to have, but not a dealmaker" },
      { value: "connectivity_low", label: "I don't travel much" },
    ],
  },
];
```

[ASSUMED] — Exact wording is Claude's discretion per D-07/CONTEXT.md. Pattern is informed by the Phase 2 tradeoff approach (detectTension) and 16Personalities-style competitor (cited in PROJECT.md and competition research).

### Pattern 2: Category-Weight Synthesis (D-08/D-09 — the two-tier model)

**What:** Convert personality tally → per-category weight with floor for practical factors.

**Two tiers:**
- **Practical tier** (cost, safety, healthcare): weight NEVER drops below `WEIGHT_FLOOR` (e.g., 0.3). These always matter regardless of personality. Prevents "broke user gets nightlife city" absurdity.
- **Preference tier** (lifestyle, nightlife, parks, connectivity, demographics): weight swings freely from 0 (unanswered/neutral) to `WEIGHT_MAX` (e.g., 1.8). User's choices fully determine this.

**Explainability trace (D-08):**

```typescript
// Source: [ASSUMED] — pattern mirrors Phase 3 scoreFactors (shared/engine/scoring.ts lines 128–162)
// The WeightExplanation interface must be in shared/types.ts

function synthesizeCategoryWeights(answers: Answers): {
  categoryWeights: Record<string, number>;
  weightExplanations: WeightExplanation[];
} {
  const tallies: Record<string, number> = {};
  const explanations: WeightExplanation[] = [];

  // Tally which categories the user favored across all tradeoff scenarios
  // Each tradeoff answer increments the winner's tally by 1
  if (answers["tradeoff_cost_vs_lifestyle"] === "cost_wins") tallies["cost"] = (tallies["cost"] ?? 0) + 1;
  if (answers["tradeoff_cost_vs_lifestyle"] === "lifestyle_wins") tallies["lifestyle"] = (tallies["lifestyle"] ?? 0) + 1;
  if (answers["tradeoff_healthcare"] === "healthcare_critical") tallies["healthcare"] = (tallies["healthcare"] ?? 0) + 2;
  // ... similar for each scenario ...

  const PRACTICAL_FLOOR = 0.3;   // Phase 12 tunes these via scoring-weights.ts
  const PRACTICAL_MAX   = 1.5;
  const PREFERENCE_MAX  = 1.8;
  const NEUTRAL_DEFAULT = 0.5;   // D-13: skipped modules fall back here

  const PRACTICAL_CATEGORIES = ["cost", "safety", "healthcare"];

  const categoryWeights: Record<string, number> = {};

  for (const cat of ALL_SCORED_CATEGORIES) {
    const tally = tallies[cat] ?? 0;
    const isPractical = PRACTICAL_CATEGORIES.includes(cat);
    const maxW = isPractical ? PRACTICAL_MAX : PREFERENCE_MAX;
    const floor = isPractical ? PRACTICAL_FLOOR : 0;

    // If module was skipped (no answers), use neutral default (D-13)
    const rawWeight = tally === 0 ? NEUTRAL_DEFAULT : Math.min(maxW, floor + tally * 0.3);
    categoryWeights[cat] = rawWeight;

    if (tally > 0) {
      explanations.push({
        category: cat,
        inferredWeight: rawWeight,
        floor: isPractical ? floor : undefined,
        explanation: `You chose ${cat}-focused options ${tally}×, so ${cat} weight = ${rawWeight.toFixed(1)}`,
      });
    }
  }

  return { categoryWeights, weightExplanations: explanations };
}
```

[ASSUMED] — Floor/max values are Claude's discretion (CONTEXT.md); tune against `scoring-weights.ts` in Phase 12.

**Tier membership — exported constant for Phase 12 (machine-readable, not just a hardcoded array):**

Phase 12 needs to know which categories are practical (floored) vs preference to apply D-09 at scoring time. This must be an exported constant in `shared/quiz-engine/personality.ts`, not a magic array buried inside the synthesizer:

```typescript
// Source: [ASSUMED] — Phase 12 reads this to apply floor/swing in its rankToWeight successor
// shared/quiz-engine/personality.ts
export const PRACTICAL_CATEGORIES = new Set(["cost", "safety", "healthcare"]);
export const PREFERENCE_CATEGORIES = new Set(["lifestyle", "parks", "connectivity", "demographics", "climateRisk", "schools", "childcare"]);

// Phase 12 usage:
// const isPractical = PRACTICAL_CATEGORIES.has(cat);
// const floor = isPractical ? PRACTICAL_FLOOR : 0;
```

[ASSUMED] — Category membership is a planning decision; the export pattern mirrors `SCORING_WEIGHTS` in `scoring-weights.ts`.

### Pattern 3: Adaptive Personality Follow-up (D-10 — reuse tension.ts pattern)

**What:** A `detectPersonalityTension(answers)` function mirroring Phase 2's `detectTension`. Returns `{ afterId: string; question: QuestionDef } | null`. The resolver's `getVisibleQuestions` already splices injected follow-ups at `afterId` — the same injection mechanism handles both Phase 2 tension and Phase 11 personality tension.

**Key invariant (from Phase 2 plan docs):** Injected questions must appear AT OR AFTER their trigger in the `answers` flow. Phase 11 personality questions trigger on earlier tradeoff answers — the trigger-before-injection invariant holds as long as the personality gate questions come before the module questions in `ALL_QUESTIONS`.

```typescript
// Source: [CITED: 02-04-PLAN.md — TensionResult interface and detectTension contract]
// Phase 11 creates a SIBLING function — does NOT edit tension.ts
export function detectPersonalityTension(answers: Answers): TensionResult | null {
  // Fire an adaptive follow-up when answers are ambiguous (e.g. "balanced" chosen twice)
  const balancedCount = Object.values(answers)
    .filter(v => v === "balanced").length;

  if (balancedCount >= 2) {
    return {
      afterId: "tradeoff_connectivity_vs_cost",   // last core tradeoff
      question: {
        id: "personality_tiebreaker",
        type: "single_select",
        prompt: "You picked 'depends' on several big tradeoffs. When it comes down to it, what matters most to your day-to-day happiness?",
        options: [
          { value: "financial_security", label: "Financial stability and savings" },
          { value: "life_quality", label: "Quality of life and experiences" },
          { value: "career_trajectory", label: "Career trajectory and opportunities" },
        ],
        required: true,
      },
    };
  }
  return null;
}
```

[CITED: 02-04-PLAN.md — TensionResult interface, detectTension signal-or-null pattern]
[ASSUMED] — Specific trigger conditions and follow-up content are Claude's discretion.

### Pattern 4: Neutral-Skip Default (D-13 — never-empty principle)

**What:** If a user skips a module entirely (no answers for that category's questions), `synthesizeCategoryWeights` emits `NEUTRAL_DEFAULT` (0.5) for that category. Phase 12's scoring engine sees a valid weight, not `undefined` or `NaN`. This mirrors Phase 3's never-empty floor for dealbreakers.

**Implementation check:** `categoryWeights[cat] = tally === 0 ? NEUTRAL_DEFAULT : computedWeight`. The synthesizer must never emit `undefined` for a registered category.

### Pattern 5: Trait Statements — Flavor Layer (D-07, non-weight-bearing)

**What:** D-07 specifies a HYBRID quiz style: tradeoff scenarios (Patterns 1–2) anchor the weights AND trait statements provide color/flavor. These are two distinct components of the personality gate.

**Critical distinction:** Trait statements are **non-weight-bearing** — they do NOT feed `categoryWeights`. They provide flavor text for the UI ("You're a pragmatic explorer — you want experiences without financial regret") and may optionally populate a `personalityProfile` field on the extended Profile for display purposes only.

**Why this matters for the planner:** A plan that builds only the tradeoff-scenario half of D-07 and skips trait statements is missing a locked decision. The trait statements need to be scoped (as QuestionDef entries of `type: "multi_select"` or `type: "agree_disagree"` format) and their output needs to be captured somewhere on the Profile — even if only as flavor metadata.

**Recommended implementation:**

```typescript
// Source: [ASSUMED] — agrees/disagrees pattern; D-07 is the locked constraint
// These are agree/disagree or scale QuestionDefs appended after tradeoff scenarios
// They do NOT increment categoryWeights tallies
const TRAIT_STATEMENT_QUESTIONS: QuestionDef[] = [
  {
    id: "trait_spontaneity",
    type: "single_select",
    prompt: ""I'd rather try a city I don't know much about than stay somewhere predictable."",
    options: [
      { value: "strongly_agree", label: "That's very me" },
      { value: "agree", label: "Somewhat" },
      { value: "disagree", label: "I prefer knowing what I'm getting into" },
    ],
    required: false,  // flavor only; skippable
  },
  // ... 3–5 more trait statements (Claude's discretion on content) ...
];
```

**Contract output:** Trait answers go to `personalityTradeoffs` (already in the proposed Profile extension) or a new `personalityFlavor?: Record<string, string>` field. Phase 12 does NOT read trait fields for scoring.

[ASSUMED] — Exact trait content is Claude's discretion (D-07). Shape mirrors agree/disagree patterns common in personality instruments.

### Anti-Patterns to Avoid

- **Editing Phase 2's tension.ts, synthesizer.ts, or resolver.ts.** D-01 is explicit: build new, don't modify. Create sibling modules.
- **Replacing profile.weights.** Phase 3's `rankToWeight` reads `profile.weights.cost` directly — renaming or removing it NaNs the existing scoring for the original four factors. The additive contract (`categoryWeights`) is safe; replacement is not until D-02 is resolved.
- **Pre-normalizing categoryWeights.** Same trap as Phase 2's synthesizer pitfall: if Phase 11 pre-normalizes before Phase 12 applies the floor/swing, the two-tier model double-shrinks. Emit raw inferred values; Phase 12 applies normalization within `rankToWeight`'s successor.
- **Black-box weight output.** Emitting `categoryWeights` without `weightExplanations` fails D-08. Both fields are part of the same contract; they ship together.
- **Scoring new categories in Phase 11.** Phase 11 captures. Phase 12 scores. Phase 11 must not add factor computation to `scoring.ts` or `scoring-weights.ts`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Branching question graph | Custom recursive state machine | Phase 2's `getVisibleQuestions(answers, ALL_QUESTIONS)` with `showIf` predicates | Already built, tested, and the collaborator's UI is already bound to this API |
| Tension detection / follow-up injection | Custom injection logic | Phase 2's `detectTension` pattern (signal-or-null + `afterId`) — replicate in `detectPersonalityTension` | Invariant already documented; resolver already splices at `afterId` |
| Explainability UI | Custom per-category prose in JSX | `weightExplanations: WeightExplanation[]` contract field | Collaborator builds the UI; the contract carries the data |
| Module skip handling | Guard clause scattered across synthesizer | Centralized `NEUTRAL_DEFAULT` in `synthesizeCategoryWeights` | One place to tune; prevents NaN in any downstream scoring |

---

## Data-Gated Module Set

From `deep-category-data.md` (all values verified from named sources on 2026-06-02):

| Category | Source | Geo Level | Cities Covered | Module Depth | Buildable? |
|----------|--------|-----------|----------------|--------------|------------|
| Healthcare | Numbeo Health Care Index | City | 22/22 | Rich (D-12) | Yes — 22/22 |
| Climate/Disaster Risk | FEMA NRI v1.20 | County | 22/22 | Light (D-12) | Yes, but use per-hazard sub-scores for discrimination (see Pitfall 3) |
| School quality | NAEP 2024 G8 Reading | State | 22/22 (18 states) | Rich (D-12) | Yes — with "state average" caveat in UI |
| Childcare cost | CCAoA 2024 Price of Care | State | 22/22 (infant; San Diego toddler = NR) | Rich (D-12) | Yes — with "state average" caveat |
| Demographics | Census ACS 2024 1-yr | City/county | 22/22 | Light (D-12, factual stat only) | Yes — foreignBornPct, medianAge, neverMarriedPct; neutral framing required (D-14) |
| Parks/Outdoors | TPL ParkScore 2026 | City | 7/22 (partial) | Light (D-12) | Partial — rely on existing nearMountains/nearCoast booleans for 15 missing cities |
| Air Connectivity | FAA CY2023 enplanements | Metro | 22/22 | Light (D-12) | Yes — faaHubClass + airportEnplanements |

**Tier-3 exclusions (D-15):** Political/values fit, social/dating — omitted entirely. No question sets, no captured fields, no scoring.

**Data caveats that must appear in the UI spec:**
1. Schools and childcare: state-level values — "state average, not city-specific." Cities in the same state (e.g., Austin/Dallas/San Antonio) share the same school score.
2. FEMA composite: barely discriminates among 22 large metros (88–99.97 range). Phase 12 should use per-hazard NRI sub-scores (hurricane, wildfire, flood) instead of the composite for meaningful differentiation.
3. Numbeo healthcare: crowdsourced; thin sample for Boise (36 contributors). Qualifies as "perceived access/quality."
4. ParkScore: 15/22 cities not confirmed — Parks module must gracefully fall back to nearMountains/nearCoast for unconfirmed cities.
5. Demographics foreignBornPct: must be framed as a neutral demographic statistic ("X% of residents were born outside the US") — NEVER as a "people like you" score (D-14, legal/positioning constraint).

[CITED: .planning/research/deep-category-data.md — all values verified with named government and authoritative sources]

---

## Common Pitfalls

### Pitfall 1: Replacing profile.weights Instead of Adding categoryWeights

**What goes wrong:** Phase 3 `scoring.ts` `rankToWeight` reads `profile.weights.cost`, `.career`, `.lifestyle`, `.safety` (lines 38–44). If Phase 11 renames or removes these fields, the existing 4-factor scoring collapses to NaN for every city on every run. The demo breaks completely.

**Why it happens:** D-CONTEXT says "replace the fixed 4-factor weights with an extensible map" — misread as a literal replace rather than the D-02-safe additive strategy.

**How to avoid:** Add `categoryWeights?: Record<string, number>` as a separate field. Leave `weights?` intact. State explicitly in the plan that D-02 (replace vs. layer) is deferred to Phase 2 integration.

**Warning signs:** Any plan task that deletes `weights` from `shared/types.ts` or modifies `rankToWeight` in `scoring.ts` in Phase 11.

### Pitfall 2: Emitting categoryWeights Without weightExplanations

**What goes wrong:** D-08 requires the collaborator's UI to show "you kept choosing lifestyle-over-cost, so lifestyle ×1.8." If `weightExplanations` is not a first-class contract field, the collaborator has no structured data to render this — they'd have to reverse-engineer the weights, which is not deterministic.

**Why it happens:** The synthesizer is built first, the UI spec is written after, and the designer fills in prose where the contract field should be.

**How to avoid:** Define `WeightExplanation` in `shared/types.ts` before writing the synthesizer. Both `categoryWeights` and `weightExplanations` are emitted by the same synthesizer call.

**Warning signs:** UI spec that says "show explanation text" but doesn't reference a `weightExplanations` field on the Profile.

### Pitfall 3: FEMA Composite Barely Discriminates

**What goes wrong:** Using the FEMA NRI composite score (`RISK_SPCTL`) for disaster-risk scoring produces near-identical scores across all 22 cities (88–99.97 range). The engine sees no meaningful difference between Denver and Miami for disaster risk, making the category useless as a differentiator.

**Why it happens:** The composite combines 18 hazard types with population exposure — large metros always score very high simply because more people + buildings are exposed.

**How to avoid:** Phase 11's `climateRisk` module should capture the user's *specific* hazard concern (hurricane, wildfire, flood, heat, etc.) via `primaryHazardConcern`. Phase 12 then uses per-hazard NRI sub-scores, not the composite.

**Warning signs:** Phase 12 using `disasterRiskScore` (composite) directly in scoring without sub-score mapping.

### Pitfall 4: Module Questions Injected Before Personality Gate Completes

**What goes wrong:** If category-module questions appear before the personality gate is done, the `showIf` logic for modules (which keys on personality result fields) reads undefined — modules either all show or all hide incorrectly.

**Why it happens:** `ALL_QUESTIONS` ordering bug — module questions appear before personality questions in the array.

**How to avoid:** Enforce ordering in `questions.ts`: personality gate questions first, then category-module questions. The trigger-before-injection invariant from Phase 2 applies here too.

**Warning signs:** `showIf: (a) => a["personalityPreference"] === "healthcare_critical"` where `personalityPreference` is defined by a question that appears later in `ALL_QUESTIONS`.

### Pitfall 5: Pre-Normalizing categoryWeights Before Phase 12 Applies Floor

**What goes wrong:** If `synthesizeCategoryWeights` emits weights already normalized to [0,1], Phase 12's floor/swing application (D-09) results in double-normalization. Practical factors never actually get a meaningful floor; preference factors are clamped wrong. The two-tier model silently breaks.

**Why it happens:** Mirrors Phase 2's "pre-normalize → double-shrink" pitfall documented in 02-02-PLAN.md.

**How to avoid:** Emit raw inferred values (e.g., 0.3–1.8 range). Phase 12 applies normalization via its successor to `rankToWeight`. Document the expected range in comments.

### Pitfall 6: Adding Scored Categories Without Recalibrating caps/BASE_SCORE (The Phase 3 BLOCKER Pattern)

**What goes wrong:** Phase 3's `scoring-weights.ts` caps (12,12,10,8) and `BASE_SCORE=50` are calibrated so the theoretical max rawScore = 90.4, making `clamp(rawScore, 0, 99)` permanently inert. When Phase 12 adds 7 new scored factors each with their own `maxContribution`, the new theoretical max rawScore blows past 99 — the clamp becomes active and fires on strong profiles. This desyncs the displayed `matchScore` badge from the sum of the `scoreFactors` contribution bars, re-triggering the exact Phase 3 BLOCKER that was caught in the code review (the one that caused MEMORY.md entry: "assert what the user sees").

**Why it happens:** The Phase 3 caps were set for 4 factors. Adding factors without reducing per-factor caps or BASE_SCORE violates the invariant: `BASE_SCORE + Σ(global[f] × maxContribution[f]) < 99`.

**How to avoid:** Phase 11's contract must carry per-category `maxContribution` placeholders or document them explicitly so Phase 12 is forced to recalibrate. The Phase 12 planner must: (a) decide the new factor cap distribution, (b) verify `BASE_SCORE + Σ(all caps, new + old) < 99`, and (c) run `scoring.test.ts` to confirm the contribution bars still reconcile with the badge. The test "assert what the user sees" (not a pre-clamp invariant) is the correct guard.

**Phase 11's role:** Phase 11 must document this as a Phase 12 hard requirement in the UI spec and in RESEARCH.md. Phase 11 does NOT implement scoring — but it can prevent Phase 12 from repeating the BLOCKER by naming it explicitly.

**Warning signs:** Any Phase 12 plan that adds new scored categories to `scoring-weights.ts` without a corresponding recalibration task for `BASE_SCORE` and all `maxContribution` caps.

---

## Code Examples

### Registering New Questions in ALL_QUESTIONS

```typescript
// Source: [CITED: 02-02-PLAN.md Task 1 — ALL_QUESTIONS QuestionDef pattern]
// Phase 11 appends its question arrays to ALL_QUESTIONS.
// shared/quiz-engine/questions.ts (Phase 2 creates this file)

import { PERSONALITY_QUESTIONS } from './personality.js';
import { CATEGORY_MODULE_QUESTIONS } from './category-modules.js';

export const ALL_QUESTIONS: QuestionDef[] = [
  // ... Phase 2's existing questions (career, finances, background, etc.) ...
  ...PERSONALITY_QUESTIONS,       // Phase 11: upfront personality gate
  ...CATEGORY_MODULE_QUESTIONS,   // Phase 11: deep-dive modules (gated by showIf)
];
```

### Module showIf — Guided Recommendation (D-11)

```typescript
// Source: [CITED: 02-04-PLAN.md — showIf predicate pattern; 11-CONTEXT.md D-11]
// A module is shown if: (a) personality result recommends it, OR (b) user opted in
{
  id: "healthcare_chronic_condition",
  type: "single_select",
  groupHeader: { label: "Healthcare", subtext: "Your health needs, your city." },
  prompt: "Do you or a close dependent manage a chronic condition requiring regular specialist care?",
  options: [
    { value: "yes_specialist", label: "Yes — specialist access is critical" },
    { value: "yes_basic", label: "Yes, but basic care is usually enough" },
    { value: "no", label: "No — general access is fine" },
  ],
  showIf: (a) =>
    a["tradeoff_healthcare"] === "healthcare_critical" ||
    a["moduleSelected_healthcare"] === true,
  required: false,   // skipped → neutral default via synthesizeCategoryWeights
}
```

[CITED: 02-02-PLAN.md — QuestionDef type including showIf, groupHeader, options, required]
[ASSUMED] — Exact question content is Claude's discretion.

### City Schema Extensions (Phase 12 will populate; Phase 11 defines)

```typescript
// Source: [CITED: .planning/research/deep-category-data.md — Proposed schema additions]
// Phase 11 adds these optional fields to the City interface in shared/types.ts.
// Phase 12 populates all 22 cities' data files.

export interface City {
  // ... existing Phase 3 fields unchanged ...

  // Phase 11 additions (all optional so existing data remains valid)
  healthcareIndex?: number;         // Numbeo Health Care Index, ~0–100, higher=better
  disasterRiskScore?: number;       // FEMA NRI composite percentile (barely discriminates — see pitfall)
  disasterRiskRating?: string;      // "Relatively High" | "Very High" etc.
  schoolProficiencyPct?: number;    // NAEP G8 Reading % at/above Proficient (state-level)
  childcareInfantAnnual?: number;   // CCAoA center-based infant care, $/yr (state value)
  childcareToddlerAnnual?: number;  // CCAoA center-based toddler care, $/yr (state value)
  foreignBornPct?: number;          // % foreign-born — factual stat, NOT fit score (D-14)
  medianAge?: number;               // years, ACS 2024
  neverMarriedPct?: number;         // % never-married 15+, ACS 2024
  parkScoreRank?: number;           // TPL ParkScore rank (7/22 confirmed)
  parkScore?: number;               // TPL ParkScore 0–100 (7/22 confirmed)
  faaHubClass?: 'Large' | 'Medium' | 'Small' | 'Nonhub';
  airportEnplanements?: number;     // CY2023 annual enplanements
}
```

[CITED: .planning/research/deep-category-data.md — Proposed schema additions section]

---

## Runtime State Inventory

This is a greenfield extension phase (new modules + new contract fields). No rename/refactor. Section skipped.

---

## Validation Architecture

> `nyquist_validation: true` in `.planning/config.json` — section required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (confirmed from Phase 2/3 plans: `npx vitest run`) |
| Config file | `vitest.config.ts` or `vite.config.ts` (Phase 2 established this) |
| Quick run command | `npx vitest run shared/quiz-engine/personality.test.ts shared/quiz-engine/category-modules.test.ts --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QUIZ-06 | detectPersonalityTension returns non-null when ≥2 "balanced" answers; null otherwise; null on empty answers | unit | `npx vitest run shared/quiz-engine/personality.test.ts -t "detectPersonalityTension"` | ❌ Wave 0 |
| QUIZ-06 | synthesizeCategoryWeights emits categoryWeights + weightExplanations with correct tier floors | unit | `npx vitest run shared/quiz-engine/personality.test.ts -t "synthesizeCategoryWeights"` | ❌ Wave 0 |
| QUIZ-07 | Module question showIf returns true when personality recommends it, false when not | unit | `npx vitest run shared/quiz-engine/category-modules.test.ts -t "showIf"` | ❌ Wave 0 |
| QUIZ-08 | Healthcare-module and schools-module questions appear for users who chose those tradeoffs | unit | `npx vitest run shared/quiz-engine/category-modules.test.ts` | ❌ Wave 0 |
| QUIZ-09 | synthesizeCategoryWeights emits NEUTRAL_DEFAULT for skipped modules (no tally) — never undefined | unit | `npx vitest run shared/quiz-engine/personality.test.ts -t "neutral skip"` | ❌ Wave 0 |
| MATCH-05 | Extended Profile with categoryWeights present passes `npx tsc --noEmit` — additive contract does not break existing types | type-check | `npx tsc --noEmit -p tsconfig.json` | ❌ Wave 0 |
| MATCH-05 | Full Phase 3 scoring suite still passes after Profile extension (no NaN regressions) | regression | `npx vitest run shared/engine/ --reporter=verbose` | ✅ (Phase 3 created these) |

**Critical regression test:** The Phase 3 engine suite (`shared/engine/scoring.test.ts`, `financial.test.ts`, `index.test.ts`) must remain green after Phase 11 extends `Profile`. This is the additive-contract guard — if it breaks, Phase 11 has violated D-01.

### Sampling Rate

- **Per task commit:** `npx vitest run shared/quiz-engine/personality.test.ts shared/quiz-engine/category-modules.test.ts`
- **Per wave merge:** `npx vitest run shared/engine/ shared/quiz-engine/ --reporter=verbose` + `npx tsc --noEmit`
- **Phase gate:** Full suite green + UI spec document complete before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `shared/quiz-engine/personality.test.ts` — covers QUIZ-06, QUIZ-09 (detectPersonalityTension, synthesizeCategoryWeights, neutral skip)
- [ ] `shared/quiz-engine/category-modules.test.ts` — covers QUIZ-07, QUIZ-08 (showIf, module question presence)
- [ ] `shared/types.ts` — add `WeightExplanation` interface before tests reference it

---

## Open Questions

1. **D-02: Replace vs. Layer for Phase 2's importanceRank**
   - What we know: Phase 2's `synthesizeProfile` emits `weights: {cost, career, lifestyle, safety}` (raw 1–4); Phase 3's `rankToWeight` reads it. Phase 11's `synthesizeCategoryWeights` would also produce category weights for the original four factors.
   - What's unclear: After Phase 2 lands, does the personality quiz replace Phase 2's importanceRank derivation (cleaner) or layer on top of it (safer)?
   - Recommendation: Resolve at Phase 2 integration. For Phase 11, document both `weights` (Phase 2 legacy) and `categoryWeights` (Phase 11) as first-class fields. The planner should add a note to CONTEXT.md that this question must be answered before Phase 2 is marked complete.

2. **Precise floor/swing values for two-tier model**
   - What we know: D-09 says practical factors get a floor; preference factors swing freely. "Tune against scoring-weights.ts in Phase 12" is in CONTEXT.md.
   - What's unclear: Exact numeric floor (0.2? 0.3? 0.4?) and swing max (1.5? 1.8?) can't be set correctly without seeing how Phase 12 normalizes in its `rankToWeight` successor.
   - Recommendation: Phase 11 chooses provisional values (e.g., floor=0.3, max=1.8) and documents them as "Phase 12 tunable." Phase 12's `scoring-weights.ts` carries the source-of-truth constants (same pattern as existing `SCORING_WEIGHTS` object).

3. **ParkScore gap for 15/22 cities**
   - What we know: TPL ParkScore 2026 only confirmed for 7 cities. `nearMountains`/`nearCoast` already exist as booleans on `City`.
   - What's unclear: Whether to make parkScore a required scoring input or a supplemental modifier.
   - Recommendation: Keep parks module LIGHT (D-12). Phase 12 falls back to `nearMountains`/`nearCoast` for the 15 missing cities. UI spec should note the gap explicitly.

4. **FEMA per-hazard NRI sub-scores not yet sourced**
   - What we know: FEMA NRI composite barely discriminates among 22 large metros. Per-hazard sub-scores (hurricane, wildfire, flood) would work much better. But `deep-category-data.md` only sourced the composite.
   - What's unclear: Phase 12 needs to source per-hazard data; Phase 11's `climateRisk` module should capture `primaryHazardConcern` so Phase 12 can map to the right sub-score.
   - Recommendation: Phase 11 captures `primaryHazardConcern` (hurricane | wildfire | flood | heat | tornado | "any"). Phase 12 sources the sub-scores. This is a Phase 12 research item, not a Phase 11 blocker.

---

## Environment Availability

Phase 11 is purely code/config changes to `shared/` TypeScript modules and a planning document. No external tools, services, or CLIs beyond the existing project toolchain are required.

Existing toolchain (confirmed from Phase 2/3 plan docs):
- `npx vitest` — test runner (installed, Phase 3 confirmed working)
- `npx tsc --noEmit` — type checking (confirmed working)
- `npm run build` — Vite build (confirmed working)

Section: SKIPPED (no new external dependencies).

---

## Security Domain

Phase 11 captures preference data and infers weights entirely client-side (same trust boundary as Phase 2 — no network egress). No new security surface is introduced beyond Phase 2's threat model.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | `maxLength` on any free-text fields; `showIf` predicates treat all answer values as untrusted strings; `synthesizeCategoryWeights` uses guard discipline (unknown answer keys → null/neutral, never crash) |
| V2 Authentication | no | No auth change in Phase 11 |
| V3 Session Management | no | Client-only state; no session tokens |
| V4 Access Control | no | No privilege-level changes |
| V6 Cryptography | no | No crypto operations |

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Sparse/unknown answer keys in synthesizeCategoryWeights | Tampering | Guard discipline: `tallies[cat] ?? 0`; unknown keys → neutral default, never throw |
| foreignBornPct framing as "people like you" | Information Disclosure (product-legal risk) | Neutral factual framing in UI spec; contract field named `foreignBornPct` (not `diversityScore`); D-14 constraint enforced |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Explicit slider/ranking per category | Inferred from tradeoff scenarios | Phase 11 (this phase) | More natural; avoids "importance ranking" UX that forces users into artificial tradeoffs on arbitrary scales |
| Fixed 4-factor weight seam | Extensible `categoryWeights` record | Phase 11 (additive) | Phase 12 and future phases can add categories without engine rewrites |
| FEMA composite for disaster risk | Per-hazard NRI sub-scores (Phase 12) | Phase 11 designs; Phase 12 implements | Composite barely discriminates large metros; sub-scores provide meaningful differentiation |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `shared/quiz-engine/` does not exist on disk; plan against Phase 2 plan doc interfaces | Standard Stack, Architecture | If Phase 2 has already partially landed, some module interfaces may differ from the plan docs |
| A2 | `QuestionDef` has `{id, type, prompt, options, showIf?, groupHeader?, required?, min?, max?, step?, autoAdvance?}` shape | Code Examples | If Phase 2 ships a different shape, Phase 11's question definitions need adjustment |
| A3 | Resolver's `getVisibleQuestions` splices injected follow-ups at `afterId` without changes | Architecture | If Phase 2's resolver changes the injection API, `detectPersonalityTension` must adapt |
| A4 | Vitest is the test runner (confirmed from Phase 2/3 plan docs) | Validation Architecture | If test tooling changed, test commands are wrong |
| A5 | Two-tier floor values (0.3 floor, 1.8 max) are provisional — Phase 12 tunes them | Pattern 2 | If Phase 12's scoring normalization uses a different scale, values need recalibration |
| A6 | Tradeoff scenario wording is Claude's discretion (D-07) | Pattern 1 | Content is a planner decision; any wording is provisional until Gabriel reviews |

---

## Sources

### Primary (HIGH confidence)

- `shared/types.ts` — Profile interface, City interface (read directly; all field citations verified)
- `shared/engine/scoring.ts` — `rankToWeight` lines 34–61, `computeRawScore` pattern (read directly)
- `shared/engine/scoring-weights.ts` — `SCORING_WEIGHTS`, floor/max values, `PERSONAL_WEIGHT_SCALE` (read directly)
- `.planning/phases/11-.../11-CONTEXT.md` — all locked decisions D-01 through D-15 (read directly)
- `.planning/research/deep-category-data.md` — all 7 category tables, coverage gaps, proposed schema additions (read directly; underlying sources are government/authoritative)

### Secondary (MEDIUM confidence)

- `.planning/phases/02-quiz-profile-capture/02-02-PLAN.md` — QuestionDef shape, synthesizeProfile contract, ALL_QUESTIONS pattern
- `.planning/phases/02-quiz-profile-capture/02-03-PLAN.md` — showIf branching, clearHiddenAnswers, resolver invariant
- `.planning/phases/02-quiz-profile-capture/02-04-PLAN.md` — TensionResult interface, detectTension signal-or-null, tradeoffTolerance synthesis
- (MEDIUM: these are plan docs, not live code; `shared/quiz-engine/` dir confirmed absent on disk)

### Tertiary (LOW confidence)

- 16Personalities-style tradeoff quiz design — pattern is cited in PROJECT.md as a known competitor/model; specific wording is [ASSUMED] per D-07 Claude's discretion

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all existing tools confirmed from Phase 3
- Profile contract extension shape: HIGH — read live from shared/types.ts and scoring.ts
- Quiz-engine interface (QuestionDef, TensionResult): MEDIUM — from Phase 2 plan docs; shared/quiz-engine/ not yet on disk
- Tradeoff scenario content: LOW — Claude's discretion (ASSUMED per D-07)
- Two-tier floor values: LOW — provisional; Phase 12 tunes

**Research date:** 2026-06-02
**Valid until:** Phase 2 lands (shared/quiz-engine/ will then be verifiable); weight values valid until Phase 12 calibrates scoring-weights.ts
