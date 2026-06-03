# Phase 2: Quiz & Profile Capture - Research

**Researched:** 2026-05-30
**Domain:** Adaptive quiz state machine, rule-based profile synthesis, Vite + React, Framer Motion transitions, competitor filter UX
**Confidence:** HIGH (codebase read directly; competitor research MEDIUM — web search, cross-verified)

---

> **Framing note:** The orchestrator's `additional_context` block described a "Founder Profile" app with archetype types (Builder, Connector, etc.) and Next.js + localStorage. That is template boilerplate unrelated to this project. The actual project is **Potential** — a relocation/city-matching app. All research below is grounded in the actual repo files. Planner should discard any orchestrator framing referencing archetypes, idea generation, or SSR.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Treat this phase as a **rebuild of the capture layer**, not a bolt-on. The prototype quiz is reference, not a base to extend.
- **D-02:** Richer + adaptive. Add deeper capture dimensions beyond the prototype's career/finances/background/lifestyle/priorities: **motivation to move, work style, community/family needs, pace of life, risk tolerance, and tradeoff tolerance.**
- **D-03:** **Conditional / branching follow-ups** — questions adapt based on prior answers, including detecting conflicting priorities (see Tension). Linear prototype → smart tree.
- **D-04:** **Output = structured preference profile.** Phase 2 turns answers into weights / tradeoff tolerances / derived attributes. Phase 3 consumes the profile to score cities. The "real logic" lives in the profile, not the matcher.
- **D-05:** This **expands `shared/types.ts` `Profile`** significantly. Planner extends the contract (new dimension fields + a derived-weights/preference structure). Reconcile in-component prototype state with the TS contract as part of the rebuild.
- **D-06:** Make the international angle a **visible demo moment** — a "Going Global" grouping for openness-to-abroad + citizenship/status + move timeline.
- **D-07:** Primary market = US citizens. Capture flips to what a US citizen faces moving abroad.
- **D-08:** Citizenship = curated shortlist (US + ~10 common destination-relevant citizenships + "Other"), defaults to US, stored as a structured value. Required: Phase 6 keys `ROADMAP_TEMPLATES[citizenship][country]`.
- **D-09:** `immigrationStatus` auto-sets to `"citizen"` for US citizens (question not shown). Only non-US citizens see a short status enum.
- **D-10:** Slider format is **locked** (0–100, per `shared/types.ts`). Bottom (0) = hard-exclude international.
- **D-11:** Dealbreakers are **hard filters** that eliminate cities — but advisory, never stranding the user. Four guardrails: capture-time warning (Phase 2), never-empty floor (Phase 3), advisory override (Phase 3), and all current prototype dealbreakers must be wired (none inert).
- **D-12:** Wire **all** current dealbreakers. The 4 currently listed but unimplemented in `getMatchScore` (mountains, ocean, international airport, strong job market) must not stay as no-ops.
- **D-13 (research directive):** Research how Nomad List, WhereNext, Teleport handled hard filters vs advisory matching — findings documented below.
- **D-14:** When the quiz detects **conflicting priorities** (e.g. loves nature + wants career growth), ask one reconciling follow-up and store the answer as a tiebreaker/weight on the preference profile.
- **D-15:** Phase 3 uses that tiebreaker to rank balancing cities. Live-search reconciliation is Phase 5.
- **D-16:** Capture a move timeline field (`6mo` / `12mo` / `2yr+` / `exploring — no timeline`) inside the "Going Global" grouping.

### Claude's Discretion

- Exact enum string values (status enum, timeline buckets), the precise shortlist of ~10 citizenships, and the internal shape of the derived-weights structure — planner finalizes against Phase 3/6/7 needs, keeping everything structured.

### Deferred Ideas (OUT OF SCOPE)

- PLUS/MINUS per-country analysis → Phase 4 + Phase 7.
- Cultural-analysis add-on product → Phase 9.
- Live-search reconciliation of competing priorities → Phase 5.
- Full schema-driven adaptive quiz engine (config-driven question architecture, dynamic ordering) — considered and **not chosen** for Phase 2.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QUIZ-01 | User completes a multi-step profile quiz covering career, finances, background, lifestyle, priorities, and dealbreakers | Adaptive question graph pattern + extended Profile shape below |
| QUIZ-02 | User sets an explicit "openness to living abroad" input that influences results | 0–100 slider locked in `shared/types.ts`; 0 = hard-exclude international |
| QUIZ-03 | User declares citizenship and current immigration status | Citizenship shortlist + auto-status pattern (D-08/D-09) |
| QUIZ-04 | User applies hard dealbreaker filters that eliminate non-matching destinations | Hard filter + advisory guardrails pattern (D-11/D-12) |
| QUIZ-05 | User sets a target move timeline (or "exploring / no timeline") | Move timeline enum in "Going Global" grouping (D-16) |
</phase_requirements>

---

## Summary

Phase 2 rebuilds the existing 5-step linear prototype quiz into an adaptive, branching instrument that produces a richer `Profile` object consumed by Phase 3's scoring engine. The prototype in `PotentialApp.jsx` is visual reference only — its `profile` state shape, `upd`/`toggleArr` helpers, progress bar primitives, and inline-style CSS tokens are all reusable, but the question flow and state contract are being replaced.

The three core technical problems are: (1) how to model a branching question graph without reaching for a full adaptive engine (rejected in Deferred); (2) how to extend `shared/types.ts` `Profile` with new dimensions and a derived-weights structure that Phase 3 can score against; and (3) how to render one-question-per-card transitions without introducing Framer Motion as a dependency if it adds more risk than value for the demo timeline.

**Primary recommendation:** Model questions as a typed array of `QuestionDef` objects with an optional `showIf(answers)` predicate and build a pure `getVisibleQuestions(answers, allQuestions)` resolver. This is the lightweight middle between "just render all questions linearly" and "full config-driven engine." Add a pure `detectTension(answers)` function that fires when the profile contains known conflicting signals and inserts one reconciling follow-up. Both functions are pure and unit-testable. The quiz component is thin — it calls these functions, drives `currentIndex` state, and renders the current question card.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Quiz question rendering + navigation | Browser / Client (`src/screens/`) | — | Pure UI; no server required |
| Adaptive branching logic (`getVisibleQuestions`) | Browser / Client (`src/screens/quiz/` or `shared/quiz-engine/`) | — | Pure function, no network; extracting to `shared/` makes it unit-testable |
| Profile synthesis (`synthesizeWeights`) | Browser / Client | — | Deterministic rule-based transform; runs at quiz submit; pure function |
| Tension detection (`detectTension`) | Browser / Client | — | Pure function over answers |
| `Profile` contract extension | `shared/types.ts` | — | Contract layer shared by Phase 3 engine; owned jointly per STRUCTURE.md |
| Quiz state persistence for re-take | Browser / Client (React context, `useState`) | — | No cross-session persistence required this phase; re-take = reset state + confirm dialog |
| Dealbreaker capture-time warning | Browser / Client | — | UI concern only; enforcement logic in Phase 3 |

---

## Standard Stack

### What is actually installed (package.json, verified today)

| Package | Version | Status |
|---------|---------|--------|
| react | ^19.2.6 | Installed |
| react-dom | ^19.2.6 | Installed |
| vite | ^8.0.14 | Installed (dev) |
| @vitejs/plugin-react | ^6.0.2 | Installed (dev) |

**Framer Motion is NOT installed.** [VERIFIED: npm view] The prototype uses CSS transitions via inline `opacity`/`transform` + a `setTimeout`/`setAnim` pattern. Phase 1 locked "port inline styles as-is, no redesign."

**No test runner is installed.** No vitest, jest, or any test framework in package.json.

### Recommendation: Add for this phase

| Library | Registry Version | Purpose | Decision |
|---------|-----------------|---------|----------|
| framer-motion | 12.40.0 [VERIFIED: npm registry] | Direction-aware card transitions (AnimatePresence) | Optional — see "Framer Motion vs CSS pattern" below |
| vitest | 4.1.7 [VERIFIED: npm registry] | Test runner for pure quiz logic functions | Required (nyquist_validation is enabled; pure functions are easily testable) |
| @testing-library/react | 16.3.2 [VERIFIED: npm registry] | Component testing for quiz navigation | Required alongside vitest |
| @testing-library/jest-dom | latest | Jest-dom matchers with vitest | Required (vitest supports jest-dom matchers) |
| @testing-library/user-event | latest | Simulate user interactions | Recommended |

**Installation (if adopting all):**
```bash
npm install framer-motion
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Add to `vite.config.js`:
```js
/// <reference types="vitest" />
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
  }
})
```

### Framer Motion vs CSS-transition pattern

The prototype uses:
```js
const [anim, setAnim] = useState(false);
const goProfile = (s) => { setProfileStep(s); setAnim(false); setTimeout(() => setAnim(true), 60); };
const fadeIn = {
  opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(24px)",
  transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)"
};
```

This produces a fade-up per question. It works and requires no new dependency.

**Adding Framer Motion** enables direction-aware transitions (slide left on Next, slide right on Back) via `AnimatePresence` + `custom` prop:

```jsx
// Source: https://sinja.io/blog/direction-aware-animations-in-framer-motion
const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

<AnimatePresence custom={direction} mode="wait">
  <motion.div
    key={currentQuestionId}
    custom={direction}
    variants={variants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    {/* question card */}
  </motion.div>
</AnimatePresence>
```

**Recommendation:** Use Framer Motion. The direction-aware transition is the adaptive quiz's most visible UX proof point — pressing Back should feel like going back, not just fading. The package is already listed in STACK.md as a planned dependency. The install is single-line and has zero configuration. If the demo timeline is tight, the CSS-transition pattern is an acceptable fallback.

## Package Legitimacy Audit

| Package | Registry | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----------|-------------|-----------|-------------|
| framer-motion | npm | ~12M/wk [ASSUMED] | github.com/motiondivision/motion [ASSUMED] | Could not run — slopcheck install blocked by sandbox | Flagged [ASSUMED] — planner must add checkpoint:human-verify before install |
| vitest | npm | ~20M/wk [ASSUMED] | github.com/vitest-dev/vitest [ASSUMED] | Could not run | Flagged [ASSUMED] — planner must add checkpoint:human-verify before install |
| @testing-library/react | npm | ~15M/wk [ASSUMED] | github.com/testing-library/react-testing-library [ASSUMED] | Could not run | Flagged [ASSUMED] — planner must add checkpoint:human-verify before install |

**Packages flagged as suspicious [SUS]:** none
**Packages removed due to slopcheck [SLOP] verdict:** none

*slopcheck could not be installed (sandbox restriction). All three packages are tagged [ASSUMED]. Planner MUST gate each install behind a `checkpoint:human-verify` task before executing `npm install`. The packages are well-established in the ecosystem but provenance rule requires this gate when slopcheck cannot run.*

---

## Architecture Patterns

### System Architecture Diagram

```
User (phone/laptop)
        |
        v
  QuizShell.jsx (step state, direction state, progress indicator)
        |
        |-- getVisibleQuestions(answers, ALL_QUESTIONS)  [pure fn, shared/quiz-engine/]
        |        |
        |        |-- showIf(answers) predicate per QuestionDef
        |        |-- detectTension(answers) → optional tension Q injected
        |
        v
  Question Card (renders current QuestionDef based on type)
    SingleSelect / MultiSelect / Slider / FreeText
        |
        v
  answers state (Record<questionId, AnswerValue>)
        |
        v
  synthesizeProfile(answers) [pure fn, shared/quiz-engine/]
        |
        v
  Extended Profile{} → AppContext → Phase 3 scoring engine
```

### Recommended Project Structure

```
src/screens/quiz/
├── QuizShell.jsx          # Main quiz component: step state, direction, submit
├── QuestionCard.jsx       # Routes question type → correct input component
├── inputs/
│   ├── SingleSelect.jsx   # Pill buttons (one active)
│   ├── MultiSelect.jsx    # Pill buttons (multiple active, toggleArr pattern)
│   ├── SliderInput.jsx    # Range input, accentColor, live value display
│   └── FreeText.jsx       # Input with inputStyle
└── ProgressBar.jsx        # Segmented progress (matches prototype's bar pattern)

shared/quiz-engine/        # Pure TS — testable without React
├── questions.ts           # ALL_QUESTIONS: QuestionDef[] (the question graph)
├── resolver.ts            # getVisibleQuestions(answers, questions): QuestionDef[]
├── tension.ts             # detectTension(answers): TensionQuestion | null
└── synthesizer.ts         # synthesizeProfile(answers): ExtendedProfile

shared/types.ts            # Extended with new Profile fields (D-05)
```

### Pattern 1: Typed Question Graph

**What:** Questions are a flat array of `QuestionDef` objects. Branching is expressed as an optional `showIf(answers)` predicate, not a tree. The resolver filters the array in sequence on every answer change, producing the current visible list.

**Why not a tree:** Trees require recursive traversal and make "how many steps remain?" hard to compute for the progress indicator. A flat array with predicates is simpler, produces a clean step count, supports back navigation trivially, and is the lightweight option the team chose (deferred: "full schema-driven adaptive engine").

**When to use:** Any quiz with conditional follow-ups that don't require complex multi-path branching.

**Load-bearing invariant:** This pattern is correct only if every conditional/injected question appears *at or after* its trigger question in `ALL_QUESTIONS`. The `currentIndex` into the recomputed `visibleQuestions` array stays aligned because questions cannot reveal earlier than their trigger. Planner must enforce this when adding questions: never write a `showIf` whose condition depends on a question that appears *later* in the array. If complex reverse-dependencies are needed, switch to tracking current position by question `id` (a visited-id history stack) rather than a numeric index.

```typescript
// shared/quiz-engine/questions.ts
// Source: established React adaptive quiz pattern — [ASSUMED], no single canonical source

export type QuestionType = "single-select" | "multi-select" | "slider" | "free-text";

export interface QuestionDef {
  id: string;
  type: QuestionType;
  prompt: string;
  subtext?: string;
  options?: { value: string; label: string }[];  // single/multi-select
  min?: number; max?: number; step?: number;      // slider
  minLabel?: string; maxLabel?: string;           // slider labels
  required?: boolean;
  showIf?: (answers: Answers) => boolean;         // undefined = always show
}

export type Answers = Record<string, string | string[] | number>;

export const ALL_QUESTIONS: QuestionDef[] = [
  {
    id: "profession",
    type: "single-select",
    prompt: "What do you do for work?",
    options: [/* profession list from constants.js */],
    required: true,
  },
  {
    id: "hasRemote",
    type: "single-select",
    prompt: "Can you work fully remote?",
    options: [{ value: "yes", label: "Yes, fully remote" }, { value: "no", label: "No, I need to be on-site" }],
  },
  // ... finances, background, lifestyle, priorities, dealbreakers
  {
    id: "opennessToAbroad",
    type: "slider",
    prompt: "How open are you to living outside the US?",
    subtext: "Slide to 0 to only see US cities.",
    min: 0, max: 100, step: 5,
    minLabel: "US only", maxLabel: "Anywhere in the world",
  },
  {
    id: "citizenship",
    type: "single-select",
    prompt: "What's your citizenship?",
    options: CITIZENSHIP_SHORTLIST,  // US default, ~10 others, "Other"
  },
  {
    id: "immigrationStatus",
    type: "single-select",
    prompt: "What's your current immigration status?",
    options: [
      { value: "pr", label: "Permanent Resident (Green Card)" },
      { value: "work_visa", label: "Work visa" },
      { value: "student", label: "Student visa" },
      { value: "other", label: "Other" },
    ],
    showIf: (a) => a["citizenship"] !== "US",  // D-09: not shown for US citizens
  },
  {
    id: "moveTimeline",
    type: "single-select",
    prompt: "When are you thinking of making a move?",
    options: [
      { value: "6mo", label: "In the next 6 months" },
      { value: "12mo", label: "Within a year" },
      { value: "2yr+", label: "2+ years out" },
      { value: "exploring", label: "Just exploring, no timeline" },
    ],
  },
  // Tension follow-up — injected by detectTension(), not statically defined
];
```

### Pattern 2: Flat Resolver + Tension Injection

```typescript
// shared/quiz-engine/resolver.ts
export function getVisibleQuestions(
  answers: Answers,
  all: QuestionDef[]
): QuestionDef[] {
  const base = all.filter(q => !q.showIf || q.showIf(answers));
  const tension = detectTension(answers);
  if (tension) {
    // Insert tension question after the last answered question that caused it
    const insertAt = base.findIndex(q => q.id === tension.afterId) + 1;
    const result = [...base];
    result.splice(insertAt, 0, tension.question);
    return result;
  }
  return base;
}
```

```typescript
// shared/quiz-engine/tension.ts
// Known tension pairs: nature-loving + career-growth, low-cost + walkable/transit
export interface TensionResult {
  afterId: string;  // inject after this question id
  question: QuestionDef;
}

export function detectTension(answers: Answers): TensionResult | null {
  const lifestyle = answers["lifestyleTags"] as string[] | undefined ?? [];
  const rank = answers["importanceRank"] as string[] | undefined ?? [];

  // Example: outdoors-focused + career-first = known conflict
  const lovesNature = lifestyle.includes("outdoors") || lifestyle.includes("snow");
  const careerFirst = rank[0] === "career" || rank[1] === "career";
  const costFirst = rank[0] === "cost";

  if (lovesNature && careerFirst) {
    return {
      afterId: "importanceRank",
      question: {
        id: "tiebreaker_nature_vs_career",
        type: "single-select",
        prompt: "Nature access and top career markets often don't overlap. If you had to lean one way, which wins?",
        subtext: "This helps us rank cities that try to balance both.",
        options: [
          { value: "nature", label: "Nature first — I'll find the career opportunities" },
          { value: "career", label: "Career first — I'll find outdoor escapes nearby" },
          { value: "balanced", label: "Balanced — I want both, even if neither is perfect" },
        ],
      },
    };
  }

  // Add more known tension pairs here
  return null;
}
```

### Pattern 3: Profile Synthesis (Rule-Based Weights)

**What:** After quiz submit, a pure `synthesizeProfile(answers)` function maps raw answers to the extended `Profile` object. This is where "logic lives in the profile, not the matcher" (D-04).

**How weights work:** Phase 3 needs weights, not just raw answers. The synthesizer performs deterministic transforms:
- `importanceRank` → `weights: { cost: number, career: number, lifestyle: number, safety: number }` (e.g. rank 0 → weight 4, rank 3 → weight 1)
- Tiebreaker answers → `tradeoffTolerance: { dimension: string, preference: "a" | "b" | "balanced" }[]`
- `opennessToAbroad = 0` → included in the profile as a hard-exclusion signal that Phase 3 reads

```typescript
// shared/quiz-engine/synthesizer.ts
// [ASSUMED] — no canonical source; standard deterministic mapping pattern

export function synthesizeProfile(answers: Answers): ExtendedProfile {
  const rank = (answers["importanceRank"] as string[]) ?? ["cost", "career", "lifestyle", "safety"];
  const weights = {
    cost:      rankToWeight(rank.indexOf("cost")),
    career:    rankToWeight(rank.indexOf("career")),
    lifestyle: rankToWeight(rank.indexOf("lifestyle")),
    safety:    rankToWeight(rank.indexOf("safety")),
  };

  const tradeoffTolerance: TradeoffEntry[] = [];
  if (answers["tiebreaker_nature_vs_career"]) {
    tradeoffTolerance.push({
      dimension: "nature_vs_career",
      preference: answers["tiebreaker_nature_vs_career"] as "nature" | "career" | "balanced",
    });
  }

  return {
    // existing prototype fields
    profession: String(answers["profession"] ?? ""),
    hasRemote: answers["hasRemote"] === "yes",
    income: Number(answers["income"] ?? 55000),
    // ... rest of existing fields

    // new dimensions (D-02)
    motivationToMove: String(answers["motivationToMove"] ?? ""),
    workStyle: String(answers["workStyle"] ?? ""),
    communityNeeds: (answers["communityNeeds"] as string[]) ?? [],
    paceOfLife: String(answers["paceOfLife"] ?? "moderate"),
    riskTolerance: Number(answers["riskTolerance"] ?? 50),

    // QUIZ-02, QUIZ-03, QUIZ-05
    opennessToAbroad: Number(answers["opennessToAbroad"] ?? 50),
    citizenship: String(answers["citizenship"] ?? "US"),
    immigrationStatus: answers["citizenship"] === "US" ? "citizen" : String(answers["immigrationStatus"] ?? ""),
    moveTimeline: String(answers["moveTimeline"] ?? "exploring"),

    // QUIZ-04
    dealBreakers: (answers["dealBreakers"] as string[]) ?? [],

    // Derived (D-04)
    weights,
    tradeoffTolerance,
  };
}

function rankToWeight(index: number): number {
  // rank 0 (top priority) → weight 4, rank 3 (lowest) → weight 1
  return [4, 3, 2, 1][index] ?? 1;
}
```

### Pattern 4: `shared/types.ts` Extension (D-05)

The current `Profile` in `shared/types.ts` already has: `profession`, `hasRemote`, `income`, `savings`, `debt`, `housing`, `hasPartner`, `partnerIncome`, `hasDependents`, `numDependents`, `hasPets`, `age`, `education`, `currentCity`, `citizenship`, `immigrationStatus`, `opennessToAbroad`, `lifestyleTags`, `dealBreakers`, `importanceRank`, `moveTimeline`.

**New fields to add** (planner finalizes exact names):

```typescript
// Additions to Profile in shared/types.ts
// D-02: deeper dimensions
motivationToMove: string;          // e.g. "career_growth" | "cost_of_living" | "adventure" | "family" | "lifestyle"
workStyle: string;                 // e.g. "office" | "hybrid" | "remote"
communityNeeds: string[];          // e.g. ["family_friendly", "expat_community", "lgbtq_friendly"]
paceOfLife: string;                // e.g. "fast_urban" | "moderate" | "slow_relaxed"
riskTolerance: number;             // 0–100 slider: 0 = risk-averse, 100 = high tolerance

// D-04: derived weights + tiebreaker (planner finalizes structure)
weights: {
  cost: number;      // 1–4, derived from importanceRank
  career: number;
  lifestyle: number;
  safety: number;
};
tradeoffTolerance: {
  dimension: string;               // "nature_vs_career", "urban_vs_suburban", etc.
  preference: "a" | "b" | "balanced";
}[];
```

**Off-contract prototype fields to reconcile (D-05 notes):**
- `profile.name` — not in `types.ts`; planner decides keep or drop (not required for matching; could be UX personalization)
- `profile.customProfession` — fold into `profession` field; drop `customProfession`
- `profile.petType` — not in `types.ts`; Phase 3 doesn't score on it; planner decides keep or drop
- `profile.color` — drop (was per-profession color for UI; doesn't belong in the data contract)

### Anti-Patterns to Avoid

- **Embedding branching logic as React `if/else` in JSX:** Makes question set untestable. Move all logic to `shared/quiz-engine/` pure functions.
- **Storing derived weights as computed-on-the-fly inside the scoring engine:** Phase 3 should receive a fully synthesized profile. Synthesis happens once at quiz submit, not per-city scoring loop.
- **Calling `synthesizeProfile` on every answer change:** Synthesis is expensive if all 12 cities are immediately re-scored. Call once on submit; scoring is Phase 3's concern anyway.
- **Re-using `anim`/`setTimeout` for direction-aware transitions:** The CSS fade-up trick has no direction concept. For forward/back to feel directional, you need Framer Motion or a custom CSS class-swap approach. If not using Framer Motion, acknowledge the limitation.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Direction-aware card transitions | Custom CSS class-swap + transition timing | Framer Motion `AnimatePresence` + `custom` prop | Managing mount/unmount + direction + spring physics in raw CSS requires 100+ lines and is brittle. AnimatePresence handles unmount animation correctly. |
| Test runner | Any custom test infra | vitest | Zero config with Vite; reuses vite.config.js; Jest-compatible API. Not worth building custom. |
| Form validation for each question type | Custom per-type validators | Simple inline `canProceed` predicate per `QuestionDef` | The prototype's `canProceed` array pattern is sufficient; don't reach for a form library. |

**Key insight:** The adaptive logic itself (branching, tension detection, synthesis) is simple enough to hand-roll as pure TypeScript functions. Don't reach for a state-machine library (XState, etc.) — that's the "full config-driven engine" that was explicitly rejected. The complexity ceiling here is a flat array + a few predicate functions.

---

## Competitor Research: Hard Filters vs Advisory Matching (D-13)

**Teleport (acquired/enterprise, formerly teleport.org)** [CITED: lifetips.alibaba.com/teleport]:
Teleport used a **two-phase approach**: first users weighted preferences by importance, then baseline data (profession, salary) was added to forecast costs. Filters covered 20+ parameters. Results showed a **bar graph** with per-preference color coding showing how closely a city matched each criterion. The platform also calculated a "budget difference" vs the user's current city — surfacing the trade-off directly in the result card. **Key lesson:** Showing *why* a city scored as it did (the scoreFactors breakdown) was the product's differentiator, not just the ranking. Teleport did not expose "hard exclude" as a separate filter tier — all weights were soft (contribution to score), not eliminators.

**Nomad List (nomadlist.com)** [CITED: novad.app/vs/nomadlist, nomadvibe.co]:
Nomad List uses a **spreadsheet-style filter panel** with 50+ parameters. Users report UX friction ("fighting with 50 filters"). The filter UI is not advisory — it can easily produce zero results with aggressive combination. No empty-state guardrail is documented. **Key lesson from competitor failure:** Nomad List's power-user filter approach is exhausting for casual users. Our advisory design (dealbreaker warning, never-empty floor) is differentiated.

**Novad (novad.app)** [CITED: novad.app]:
Newer entrant using **emotional / vibe-based onboarding** ("how do you want to feel — calm, inspired, adventurous?") rather than hard data inputs. This is the opposite extreme from Nomad List. Matches on mood, not measurable criteria. **Key lesson:** Emotional matching alone risks poor credibility with a judge audience. Our hybrid (data-first + structured preferences + advisory) is the right middle.

**Advisory pattern (what we should adopt):**

Based on the competitor landscape, the recommended approach for Phase 2 is:
1. **Capture-time warning when dealbreakers are selected:** "Dealbreakers remove cities entirely — the more you add, the fewer options remain." (Inline contextual, not a modal.)
2. **Never expose an empty result (Phase 3 concern, captured here for planning context):** If all cities are eliminated, relax the most marginal dealbreaker and surface: "Your [X] dealbreaker removed all matches. We've softened it to show your closest options — reconsider?"
3. **Advisory override for near-misses (Phase 3):** If a dealbreaker eliminated the city that would have ranked #1, surface it: "Austin would have been your top match — your [No extreme heat] dealbreaker removed it."

These guardrails are the answer to judges asking "what happens when someone adds too many filters?" — it never breaks.

---

## Common Pitfalls

### Pitfall 1: Questions out of sync with `shared/types.ts`
**What goes wrong:** A question collects a field that isn't in the `Profile` type, or a type field has no corresponding question. Phase 3 scoring reads `undefined`.
**Why it happens:** The quiz is built UI-first; the type contract update is forgotten.
**How to avoid:** Extend `shared/types.ts` first (D-05 says this), then write the questions. TypeScript will catch missing fields in `synthesizeProfile`.
**Warning signs:** Any `profile.someField` in `shared/engine/scoring.ts` that would be `undefined` for a user who completed the new quiz.

### Pitfall 2: The tension question breaks step count / progress
**What goes wrong:** The progress bar shows "4 of 8" but a tension question is injected, making the total 9. The count jumps.
**Why it happens:** Progress is `currentIndex / total` where `total` is computed at mount, not dynamically.
**How to avoid:** Compute `visibleQuestions = getVisibleQuestions(answers, ALL_QUESTIONS)` on every answer change. Progress bar uses `visibleQuestions.length`, not a static constant. Accept that the total may shift by one when a tension question appears.

### Pitfall 3: Back navigation leaves stale answers
**What goes wrong:** User answers Q4, Q5 appears (showIf passes), user goes back to Q4 and changes their answer so Q5's condition now fails — but Q5's answer is still in the `answers` state. Phase 3 reads a value that was answered for a question the user never saw again.
**How to avoid:** When navigating back and changing an answer that causes a previously-visible question to become hidden, clear its answer. Add a `clearHiddenAnswers(newAnswers, allQuestions)` step after each answer update:
```ts
function clearHiddenAnswers(answers: Answers, all: QuestionDef[]): Answers {
  const visible = new Set(getVisibleQuestions(answers, all).map(q => q.id));
  return Object.fromEntries(Object.entries(answers).filter(([id]) => visible.has(id)));
}
```

### Pitfall 4: Slider renders as full-width on narrow phones but thumb is hard to tap
**What goes wrong:** Default HTML range input thumb is 16px on many mobile browsers. Fat-finger miss rate is high.
**Why it happens:** The prototype's sliders use `accentColor` only; no thumb size customization.
**How to avoid:** Add CSS to increase thumb hit area:
```css
input[type="range"]::-webkit-slider-thumb { width: 28px; height: 28px; }
input[type="range"]::-moz-range-thumb { width: 28px; height: 28px; }
```

### Pitfall 5: `immigrationStatus` missing for US citizens breaks Phase 6
**What goes wrong:** `synthesizeProfile` only sets `immigrationStatus` for non-US paths. US citizens get `undefined`. Phase 6 keying `ROADMAP_TEMPLATES[citizenship][country]` fails to match.
**Why it happens:** D-09 says "auto-set to 'citizen' for US" but the implementation forgets to run the auto-set.
**How to avoid:** In `synthesizeProfile`, always set: `immigrationStatus: answers["citizenship"] === "US" ? "citizen" : answers["immigrationStatus"]`. This is the exact implementation D-09 requires.

### Pitfall 6: Dealbreaker warning copy is passive and ignored
**What goes wrong:** A small gray label saying "note: dealbreakers remove cities" is ignored. User adds 6 dealbreakers, gets 0 results in Phase 3, confused.
**Why it happens:** Inline contextual warnings are easy to skim.
**How to avoid:** Make the warning reactive — it intensifies as more dealbreakers are added. 1–2 selected: no warning. 3+: yellow inline message. 4+: orange with count of currently-eliminated cities from a quick preview computation.

---

## Code Examples

### QuizShell navigation with direction tracking

```jsx
// src/screens/quiz/QuizShell.jsx
// [ASSUMED] — standard direction-aware quiz pattern; no single canonical source

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion"; // if using Framer Motion
import { getVisibleQuestions, clearHiddenAnswers } from "../../shared/quiz-engine/resolver";
import { ALL_QUESTIONS } from "../../shared/quiz-engine/questions";
import { synthesizeProfile } from "../../shared/quiz-engine/synthesizer";

export function QuizShell({ onComplete }) {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  const visible = getVisibleQuestions(answers, ALL_QUESTIONS);
  const currentQuestion = visible[currentIndex];

  const handleAnswer = (questionId, value) => {
    const next = clearHiddenAnswers({ ...answers, [questionId]: value }, ALL_QUESTIONS);
    setAnswers(next);
  };

  const goNext = () => {
    setDirection(1);
    if (currentIndex < visible.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      onComplete(synthesizeProfile(answers));
    }
  };

  const goBack = () => {
    setDirection(-1);
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  const canProceed = !currentQuestion.required || answers[currentQuestion.id] != null;

  return (
    <div style={css}>
      {/* Progress bar — reuse prototype's segmented pattern */}
      <ProgressBar current={currentIndex + 1} total={visible.length} onBack={goBack} />

      {/* Card transition */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={currentQuestion.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <QuestionCard
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(v) => handleAnswer(currentQuestion.id, v)}
          />
        </motion.div>
      </AnimatePresence>

      <button onClick={goNext} disabled={!canProceed} style={canProceed ? btnPrimary : btnDisabled}>
        {currentIndex < visible.length - 1 ? "Continue →" : "Show Me My Potential →"}
      </button>
    </div>
  );
}

const slideVariants = {
  enter: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
};
```

### "Going Global" grouping (D-06 demo moment)

The three questions `opennessToAbroad`, `citizenship`, `immigrationStatus` (conditional), and `moveTimeline` should be visually grouped under a "Going Global" section header. This is a UI concern in `QuestionCard.jsx` or via a `group` field on `QuestionDef`:

```typescript
// In QuestionDef, add optional grouping metadata
groupHeader?: {
  label: string;
  subtext?: string;
};
```

Then for the `opennessToAbroad` question:
```typescript
{
  id: "opennessToAbroad",
  type: "slider",
  groupHeader: {
    label: "Going Global",
    subtext: "Tell us how far you'd go — literally.",
  },
  prompt: "How open are you to living outside the US?",
  // ...
}
```

The group header renders above the first question in the group and persists across the group's questions. This creates the "visible demo moment" D-06 calls for.

### Reusable primitives from PotentialApp.jsx

The following can be imported or copied verbatim — they are the visual identity:

```js
// CSS token object (copy into QuizShell.jsx or extract to shared/ui-tokens.js)
const css = {
  "--bg":"#08090C","--surface":"#111318","--card":"#171B22",
  "--border":"rgba(255,255,255,0.05)","--border-active":"rgba(255,255,255,0.12)",
  "--accent":"#6EE7B7","--accent2":"#FBBF24","--accent3":"#818CF8","--accent-dim":"rgba(110,231,183,0.08)",
  "--text":"#EEF2F7","--text2":"#8896AB","--text3":"#505C6F",
  "--neg":"#F87171","--pos":"#6EE7B7",
  fontFamily:"'Manrope', sans-serif", background:"var(--bg)", color:"var(--text)", minHeight:"100vh"
};

// Pill button style (single-select, multi-select options)
const pill = (active) => ({
  padding:"8px 16px", borderRadius:10,
  border: active ? "1.5px solid var(--accent)" : "1px solid var(--border)",
  background: active ? "var(--accent-dim)" : "var(--card)",
  color: active ? "var(--accent)" : "var(--text2)",
  fontSize:13, cursor:"pointer", fontWeight: active ? 600 : 400,
  transition:"all 0.2s", fontFamily:"inherit",
  display:"inline-flex", alignItems:"center", gap:6
});

// Range input (slider) — add thumb size override in index.css
const sliderStyle = { width:"100%", accentColor:"#6EE7B7" };

// Primary button
const btnPrimary = {
  width:"100%", padding:"16px", background:"var(--accent)", color:"#08090C",
  border:"none", borderRadius:14, fontSize:15, fontWeight:700,
  cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.03em"
};

// Input field
const inputStyle = {
  width:"100%", padding:"14px 16px", background:"var(--card)",
  border:"1px solid var(--border)", borderRadius:12,
  color:"var(--text)", fontSize:15, fontFamily:"inherit", boxSizing:"border-box"
};

// Label style
const label = {
  fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em",
  color:"var(--text2)", display:"block", marginBottom:8, fontWeight:600
};

// toggleArr helper — copy directly
const toggleArr = (key, val, max = 99) => {
  setAnswers(prev => {
    const arr = (prev[key] as string[]) ?? [];
    if (arr.includes(val)) return { ...prev, [key]: arr.filter(x => x !== val) };
    if (arr.length >= max) return prev;
    return { ...prev, [key]: [...arr, val] };
  });
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Framer Motion 4–6 `motion.AnimatePresence` import path | Framer Motion 11+ is now published as `motion` package separately; `framer-motion` package continues as alias | 2024 | `import { AnimatePresence, motion } from "framer-motion"` still works on 12.x |
| Vitest required separate `globals: true` config | vitest 4.x still requires `globals: true` to avoid importing `describe`/`it` in every file | Current | Add to vite.config.js test config |

**Deprecated/outdated:**
- `framer-motion` `positionTransition` prop: replaced by `layout` prop. Do not use.
- The prototype's `setTimeout(() => setAnim(true), 60)` transition pattern: works fine for fade-up, but has no direction concept. Replace for the quiz card if Framer Motion is adopted.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite dev server | ✓ | (already running — Phase 1 complete) | — |
| npm | Package install | ✓ | (already running) | — |
| framer-motion | Direction-aware transitions | ✗ (not installed) | — | CSS fade-up pattern from prototype |
| vitest | Test runner (nyquist) | ✗ (not installed) | — | None — required for nyquist_validation |

**Missing dependencies with no fallback:**
- `vitest` + `@testing-library/react` — required by `nyquist_validation: true`. Planner must include install task in Wave 0.

**Missing dependencies with fallback:**
- `framer-motion` — CSS transition fallback exists (prototype pattern). Recommend installing; acceptable to skip if time-constrained.

---

## Runtime State Inventory

N/A — no persistence. Quiz state lives entirely in React context (`useState`). No database, localStorage, or OS-registered state is touched by this phase. Re-taking the quiz resets in-memory state only. No migration or data cleanup required.

---

## Validation Architecture

Nyquist validation is enabled (`workflow.nyquist_validation: true` in `.planning/config.json`).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.1.7 (not yet installed) |
| Config file | `vite.config.js` (add `test` block) |
| Quick run command | `npx vitest run shared/quiz-engine/ --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QUIZ-01 | `getVisibleQuestions` returns correct question sequence | unit | `npx vitest run shared/quiz-engine/resolver.test.ts` | ❌ Wave 0 |
| QUIZ-01 | `synthesizeProfile` maps answers to Profile correctly | unit | `npx vitest run shared/quiz-engine/synthesizer.test.ts` | ❌ Wave 0 |
| QUIZ-01 | QuizShell renders first question on mount | component | `npx vitest run src/screens/quiz/QuizShell.test.jsx` | ❌ Wave 0 |
| QUIZ-01 | QuizShell advances to next question on answer + Continue | component | (same file) | ❌ Wave 0 |
| QUIZ-01 | Back navigation goes to previous question | component | (same file) | ❌ Wave 0 |
| QUIZ-02 | opennessToAbroad slider captured in synthesized Profile | unit | `synthesizer.test.ts` | ❌ Wave 0 |
| QUIZ-03 | US citizen → immigrationStatus auto-set to "citizen" | unit | `synthesizer.test.ts` | ❌ Wave 0 |
| QUIZ-03 | Non-US citizen → immigrationStatus question shown | unit | `resolver.test.ts` (showIf predicate) | ❌ Wave 0 |
| QUIZ-04 | Dealbreaker selections captured in Profile.dealBreakers | unit | `synthesizer.test.ts` | ❌ Wave 0 |
| QUIZ-05 | moveTimeline captured in synthesized Profile | unit | `synthesizer.test.ts` | ❌ Wave 0 |
| QUIZ-01 | `detectTension` fires on nature+career combination | unit | `npx vitest run shared/quiz-engine/tension.test.ts` | ❌ Wave 0 |
| QUIZ-01 | Tension question injected at correct position | unit | `resolver.test.ts` | ❌ Wave 0 |
| QUIZ-01 | Stale hidden answers are cleared on back+change | unit | `resolver.test.ts` (clearHiddenAnswers) | ❌ Wave 0 |

### Sampling Rate
- Per task commit: `npx vitest run shared/quiz-engine/ --reporter=verbose`
- Per wave merge: `npx vitest run --reporter=verbose`
- Phase gate: full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `shared/quiz-engine/resolver.test.ts` — covers QUIZ-01/03 showIf + tension injection + clearHiddenAnswers
- [ ] `shared/quiz-engine/synthesizer.test.ts` — covers QUIZ-01/02/03/04/05 Profile output
- [ ] `shared/quiz-engine/tension.test.ts` — covers tension detection pairs
- [ ] `src/screens/quiz/QuizShell.test.jsx` — covers navigation, direction, submit callback
- [ ] `src/test-setup.js` — vitest + jest-dom global setup
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`

---

## Security Domain

`security_enforcement` is not explicitly set to `false` in config — treated as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in this phase |
| V3 Session Management | No | Quiz state in React context (in-memory) |
| V4 Access Control | No | No access control needed for quiz |
| V5 Input Validation | Yes | Free-text field (profession custom input, currentCity) — sanitize before storing in Profile |
| V6 Cryptography | No | No secrets handled |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via free-text input rendered in results | Tampering | React's JSX escapes by default. Never use `dangerouslySetInnerHTML` with user input. |
| Oversized free-text input | DoS (local) | Add `maxLength={200}` to free-text inputs. localStorage has no real concern here (state is in-memory). |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | framer-motion weekly downloads ~12M/wk | Package Legitimacy Audit | Cosmetic only — the package's legitimacy is not in question |
| A2 | vitest weekly downloads ~20M/wk | Package Legitimacy Audit | Cosmetic only |
| A3 | @testing-library/react weekly downloads ~15M/wk | Package Legitimacy Audit | Cosmetic only |
| A4 | `clearHiddenAnswers` is the right UX for back-navigation stale answers | Pattern 2 (resolver) | If wrong, Phase 3 may read answers from questions the user reversed; risk is scoring inaccuracy |
| A5 | 5–7 question buckets (prototype) maps to ~8–12 actual QuestionDef nodes after branching expansion | Pattern 1 (question graph) | If the actual question count is higher, progress bar UX may feel longer than expected; adjustable |
| A6 | Tension pair (nature-loving + career-first) is the primary demo-moment conflict | tension.ts example | Only one tension pair shown; planner should define additional pairs for risk tolerance + cost-sensitive, etc. |

---

## Open Questions (RESOLVED)

> All five resolved during planning (Phase 02 plan-check, 2026-06-02). Each carries an adopted Recommendation the plans implement; none gate execution.

1. **RESOLVED — `shared/quiz-engine/` ownership: frontend or backend track?** (frontend-owned this phase)
   - What we know: STRUCTURE.md assigns `shared/engine/` to the backend track; quiz logic is pure TS.
   - What's unclear: The quiz resolver and synthesizer are pure functions that the frontend quiz component needs at build time. Backend track may not move fast enough.
   - Recommendation: Treat `shared/quiz-engine/` as frontend-owned for this phase (it contains no API calls, no Node.js-only imports). Announce the addition in a small commit per STRUCTURE.md's contract-first rule.

2. **RESOLVED — Exact question list and branching rules (beyond the prototype's 5 steps)** (planner defines `ALL_QUESTIONS` in 02-02; arbitrary count supported)
   - What we know: D-02 specifies 6 new dimensions (motivation, work style, community/family, pace, risk tolerance, tradeoff tolerance). The prototype had ~18 distinct inputs across 5 steps.
   - What's unclear: The exact ordering, grouping, and which new dimensions trigger branching vs. are static.
   - Recommendation: Planner defines the full `ALL_QUESTIONS` array in the first task. The code pattern above supports arbitrary question count — this is a content decision, not a code architecture decision.

3. **RESOLVED — Re-takeable quiz — does resetting state need a confirm dialog? [ASSUMED — not in real CONTEXT.md]** ("Start Over" behind a confirm; no modal lib)
   - What we know: The contaminated orchestrator framing mentioned "re-takeable with confirm-before-discard." The actual 02-CONTEXT.md does not explicitly specify this. It is a reasonable UX default.
   - What's unclear: Is this a button in the results screen ("Retake Quiz → confirm modal → reset state") or from within the quiz?
   - Recommendation: Add "Edit Profile" button in results screen (already exists in prototype: `goStep(1); setProfileStep(0)`) — replace with "Start Over" that clears `answers` state behind a confirm. Simple browser `confirm()` is sufficient; no modal library needed.

4. **RESOLVED — Framer Motion: install or skip?** (install, gated, in 02-01)
   - What we know: Not installed. CSS transition fallback exists. Framer Motion enables direction-aware transitions.
   - Recommendation: Install. The direction-aware slide transition is visible proof of quiz quality. Single `npm install framer-motion` command. No configuration. Net cost: 5 minutes.

5. **RESOLVED — Orchestrator framing mismatch (for orchestrator's awareness)** (research used actual repo; awareness note only)
   - The `additional_context` passed to this research agent described a "Founder Profile / archetype / Next.js / localStorage / idea gen" app. This does not match the actual project (Potential — relocation/city-matching on Vite+React). Research was conducted against the actual repo. If the orchestrator's template is parameterized from a different project, it may need updating.

---

## Sources

### Primary (HIGH confidence)
- `/Users/leal/FBLA/FBLA/src/screens/PotentialApp.jsx` — direct code read; prototype patterns, CSS tokens, existing quiz flow
- `/Users/leal/FBLA/FBLA/shared/types.ts` — existing Profile interface; extension targets
- `/Users/leal/FBLA/FBLA/shared/data/constants.js` — PROFESSION_CATEGORIES, LIFESTYLE_TAGS, DEAL_BREAKERS
- `/Users/leal/FBLA/FBLA/package.json` — confirmed installed packages (React 19, Vite 8; no Framer Motion, no test runner)
- `/Users/leal/FBLA/FBLA/.planning/phases/02-quiz-profile-capture/02-CONTEXT.md` — locked decisions D-01 through D-16
- npm registry — framer-motion@12.40.0, vitest@4.1.7, @testing-library/react@16.3.2 [ASSUMED] (versions confirmed via npm view this session; packages tagged [ASSUMED] per role rule — slopcheck could not run)

### Secondary (MEDIUM confidence)
- [sinja.io — Direction-aware animations in Framer Motion](https://sinja.io/blog/direction-aware-animations-in-framer-motion) — AnimatePresence custom prop pattern; confirmed against framer.com docs
- [lifetips.alibaba.com — Teleport city matching](https://lifetips.alibaba.com/tech-efficiency/teleport-helps-you-find-a-better-city-to-live-and-work) — Teleport's two-phase filter+score approach
- [novad.app vs Nomad List](https://novad.app/vs/nomadlist) — Nomad List's 50-filter UX vs emotional matching; competitor landscape
- [vitest.dev guide](https://vitest.dev/guide/browser/component-testing) — component testing pattern

### Tertiary (LOW confidence)
- WebSearch results on Nomad List empty-state UX — generalized from filter UX literature; specific Nomad List empty-state behavior not directly documented

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — package.json read directly; npm registry verified
- Architecture patterns: HIGH — grounded in codebase analysis + established React patterns
- Competitor research: MEDIUM — web search cross-referenced with multiple sources; Teleport is acquired/deprecated so no live product to verify
- Pitfalls: HIGH — most are directly derived from prototype code analysis

**Research date:** 2026-05-30
**Valid until:** 2026-06-30 (Framer Motion version may update; other findings are stable)
