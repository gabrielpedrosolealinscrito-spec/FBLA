# Phase 11: Deep Profile — Context

**Gathered:** 2026-06-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 11 adds the **net-new, data-backed SCORED life-area categories** the quiz does not yet cover — healthcare, climate/natural-disaster risk, schools/childcare, demographics, parks/outdoors, and air connectivity — and introduces a **personality/values layer that infers how much each category matters** to the user.

It delivers this as **logic + a contract + a written UI spec**, not production UI: the durable artifact is the UI-agnostic `shared/quiz-engine/` + an extended `Profile` contract that a collaborator's frontend binds to.

**Owns:** the new scored-category capture (question sets), the upfront personality/values weighting mechanism, the extended `Profile` contract (extensible category-weight map + new captured fields), and the documented quiz contract + UI spec.

**Does NOT own:** scoring those categories against cities or sourcing the city data (Phase 12); Phase 2's existing soft-preference dimensions (left untouched while Phase 2 is in flight); the production quiz UI (collaborator builds it from the spec).

**Hard line:** Phase 11 captures preferences + inferred weights into an extended profile and specifies the UI; Phase 12 sources the city data and scores cities against that profile.
</domain>

<decisions>
## Implementation Decisions

### Phase scope & boundary (defining frame)
- **D-01:** Phase 11 builds the **net-new scored categories only**. Phase 2 is still WIP — do not reconcile with or modify its soft-preference dimensions now. Build the additional stuff that doesn't exist yet first.
- **D-02 (OPEN reconciliation):** The personality-quiz weighting (D-06) effectively **supersedes Phase 2's explicit `importanceRank` weight derivation**. Per the build-new-first steer, this stays open: when Phase 2 lands, decide whether the personality quiz **replaces** or **layers over** Phase 2's weight derivation. Flag for the planner; resolve at Phase 2 integration.
- **D-03:** Deliverable = **logic + contract + written UI spec**. Phase 11 ships `shared/` engine extensions, the extended `Profile` contract, a documented quiz contract, and a UI spec for the collaborator. **No production quiz UI from this phase.**

### Collaborator UI integration (architecture)
- **D-04:** The collaborator rebuilds the **whole app UI including the quiz**. Therefore `shared/quiz-engine/` is the **UI-agnostic source of truth**; the collaborator's UI is a consumer that binds to a documented contract (`getVisibleQuestions(answers)` → render `QuestionDef`s → `synthesizeProfile(answers)`; `detectTension(answers)`).
- **D-05 (coordination note for the in-flight Phase 2 session):** Phase 2's `src/screens/quiz/*` UI is **provisional** — the collaborator will replace it. Phase 2 should invest in the engine + a clean contract, not pixel polish.

### Personality/values weighting (defining mechanism)
- **D-06:** Category weights are **inferred from an upfront personality/values quiz**, not set by explicit sliders or ranking. Higher inferred priority → more influence on the final ranking ("likes lifestyle more → lifestyle counts more").
- **D-07:** Style = **hybrid** — tradeoff scenarios anchor the weights ("cheaper but car-dependent vs pricier but walkable") + trait statements for color/flavor.
- **D-08:** The answer→weight mapping must stay **explainable** ("you kept choosing lifestyle-over-cost, so lifestyle ×1.8"), never a black-box personality *type*. Carries Phase 3's honest-contribution principle; this is a hard Q&A-defensibility requirement (ties back to the founding "should someone trust this?" concern).
- **D-09:** Weighting model = **two-tier with a floor**. Practical factors (cost, safety, healthcare) keep a weight floor so they always matter; preference factors (lifestyle, nightlife...) swing freely above it. Prevents practically-absurd top picks (e.g. "you're broke, here's the priciest city because you like nightlife").
- **D-10:** Personality gate length = **adaptive**. ~5 core tradeoffs, adding more only where answers are ambiguous/conflicting — **reuses Phase 2's tension-detection engine (`tension.ts`)**. Explicit integration dependency on Phase 2.

### Flow & modules
- **D-11:** **Guided modular** flow. The personality result recommends which deep-dive modules to surface ("healthcare and schools look like they matter to you — go deeper?"); the user can add others.
- **D-12:** Module depth = **mixed by category**. Rich sub-questions for high-impact modules (healthcare: chronic conditions / dependents needing specialists; family: ages of kids); light (mostly importance + one qualifier) for lower-impact ones (parks, connectivity).
- **D-13:** **Skipped modules fall back to a neutral default weight** so scoring never breaks and skipping never strands a user (inherits Phase 3's never-empty principle).

### Categories & exclusions
- **D-14:** In-scope scored categories (Tier 1/2): **healthcare, climate/disaster risk, schools/childcare, demographics** (factual — e.g. foreign-born %, framed as a demographic statistic, NOT a "people like you" score), **parks/outdoors, connectivity**. The final set is gated by what `deep-category-data.md` can defensibly source.
- **D-15:** Tier-3 categories (**political/values fit, social/dating**) are **omitted entirely** from the quiz — deliberate out-of-scope due to undefensible data. (User made this defensibility call directly.) Revisit a factual-self-select treatment post-competition.

### Claude's Discretion
- Exact tradeoff-scenario content and trait statements; precise weight-floor values and swing range (tune against `scoring-weights.ts` in Phase 12); adaptive-trigger thresholds (reuse `tension.ts` heuristics); per-module sub-question wording; the exact shape of the extended weight map (replace the fixed `{cost,career,lifestyle,safety}` with an extensible map keyed by category). Keep everything structured and explainable.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The contract being extended
- `shared/types.ts` — the `Profile` interface. Extend with the new captured fields + an **extensible category-weight map** (replacing the fixed 4-factor `weights`). This is the frontend↔engine handshake AND the contract the collaborator's UI binds to.
- `shared/quiz-engine/questions.ts`, `resolver.ts`, `synthesizer.ts`, `tension.ts` — Phase 2's quiz engine being extended (config-driven questions, weight synthesis, `showIf` branching, tension detection). **Built during Phase 2 (in flight)** — read once Phase 2 lands; until then plan against the documented interface in the Phase 2 plans below.
- `.planning/phases/02-quiz-profile-capture/02-02-PLAN.md`, `02-03-PLAN.md`, `02-04-PLAN.md` — the quiz-engine interface to plan against: `QuestionDef[]`, `synthesizeProfile`, `getVisibleQuestions`/`clearHiddenAnswers`, `detectTension`.

### The scoring seam (Phase 12 target)
- `shared/engine/scoring.ts` (`rankToWeight`, ~lines 34–61) and `shared/engine/scoring-weights.ts` — the 4-factor weight seam Phase 12 widens. Phase 11's inferred-weight output must target an extended version of this; the two-tier floor (D-09) lives here. Honest-contribution principle (`scoreFactors`).

### Phase 2 locked decisions
- `.planning/phases/02-quiz-profile-capture/02-CONTEXT.md` — rebuild-not-bolt-on, config-driven questions, dealbreakers-as-hard-filters with never-empty/advisory guardrails, "Going Global" demo grouping, tension reconciliation. Phase 11 builds on these, does not contradict them.

### Sourced data
- `.planning/research/deep-category-data.md` — sourced + cited city data for the new categories (generated by a background research agent, 2026-06-02; Tier-3 excluded). Gates which modules are buildable; Phase 12 consumes it for scoring. Phase 11 uses it to know which categories have real data behind them.

### Project intent & scope
- `.planning/PROJECT.md` — locked decisions; "win #1 — pitch substance wins ties"; freemium funnel.
- `.planning/REQUIREMENTS.md` — Phase 11 requirements are TBD (define during planning; map to the QUIZ/MATCH families).
- `.planning/ROADMAP.md` — Phase 11 entry (depends on Phase 2) + Phase 12 entry (depends on Phase 11 + Phase 3).
- `STRUCTURE.md` — folder ownership, contract-first rule (`src/` JSX UI, `shared/` TS contract + logic).
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`shared/quiz-engine/*`** — config-driven question framework (`ALL_QUESTIONS: QuestionDef[]`, generic `showIf` branching, generic input types). Extend with new question sets; do not rebuild.
- **`shared/quiz-engine/tension.ts`** — reuse `detectTension` to drive the adaptive personality gate (D-10).
- **`shared/engine/scoring-weights.ts`** — single tunable config object; extend for new-category weights + the two-tier floor/swing.
- **`shared/engine/scoring.ts`** — honest contribution-bar pattern (`scoreFactors`) to mirror for explainable weighting (D-08).

### Established Patterns
- **Contract-first:** `shared/` is the source of truth; UI binds to it. Extend the contract in small announced commits.
- **Config-driven questions:** new categories = new `QuestionDef` entries, not new screens.
- **Honest-contribution scoring + dealbreaker never-empty/advisory guardrails** (Phase 3) — inherited by the neutral-default-for-skipped-module rule (D-13).

### Integration Points
- Extended `Profile` weight-map → Phase 12 scoring engine.
- Adaptive personality gate → Phase 2's `tension.ts`.
- Collaborator's whole-app UI → the documented quiz contract + UI spec this phase produces.
- `deep-category-data.md` → defines the buildable module set.
</code_context>

<specifics>
## Specific Ideas

- **Personality quiz as a "real insight" demo moment** — parallels Phase 2's "Going Global" moment. The product visibly figuring out what matters to the person is the stage moment that answers "should someone trust this?" on the UX side.
- **Explainable weighting as the trust anchor** — show the user (and judges) exactly why each category weight came out the way it did. No black-box personality type.
- **Two-tier floor as the anti-absurdity guard** — specifically chosen so the engine never recommends a practically-absurd top city a judge could attack in Q&A.
</specifics>

<deferred>
## Deferred Ideas

- **Tier-3 factual self-select** (political/values fit, social/dating presented as facts + user filter, no computed score) → post-competition.
- **Reconciling Phase 2's soft-preference dimensions** (motivation, work style, community/family needs, pace of life, risk tolerance, tradeoff tolerance) with Phase 11's personality weighting → after Phase 2 lands (the D-02 open item).
- **Whether the personality quiz replaces or layers over Phase 2's `importanceRank`** → resolve at Phase 2 integration (D-02).

None — discussion otherwise stayed within phase scope.
</deferred>

---

*Phase: 11-deep-profile-expand-the-quiz-with-sourced-life-area-categori*
*Context gathered: 2026-06-02*
