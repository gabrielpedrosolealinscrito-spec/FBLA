# Phase 12: Multi-Dimensional Scoring - Context

**Gathered:** 2026-06-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 12 **populates the new life-area city data** (from the cited `deep-category-data.md`) and **extends the scoring engine to consume Phase 11's `categoryWeights`** against that data, producing honest, explainable contributions. It is the **sourced-data scoring spine**: cited, offline, defensible.

**Owns:**
- Populating the optional new `City` fields in `shared/data/cities.ts` from `deep-category-data.md` (healthcare, FEMA disaster, schools, childcare, demographics, parks, air connectivity).
- Extending `shared/engine/scoring.ts` to score the new categories against `Profile.categoryWeights`, emitting them as additional honest `scoreFactors`.
- Extending `shared/engine/scoring-weights.ts` with new per-category caps + the two-tier floor (tuning Phase 11's provisional `WEIGHT_FLOOR`), and **recalibrating BASE_SCORE + caps so the displayed score stays < 99** (the Phase 3 clamp BLOCKER).
- A documented engine **seam** so a future live-AI layer can inject externally-researched category scores as a separate tier without re-architecting.

**Does NOT own:**
- The personality/category quiz or weight inference (Phase 11 — already landed in `types.ts`).
- Live-AI amenity research (gyms, country clubs, niche amenities) — that is Phase 5's live-AI layer / Plus tier. Phase 12 only builds the seam it plugs into.
- The production quiz/results UI (collaborator builds from the spec; Phase 12 is engine + data).
- FEMA per-hazard re-sourcing (deferred — see decisions).

**Hard line:** Phase 12 scores cities using **cited, offline data only**. Anything AI-estimated at runtime is a separate, labeled tier and is out of this phase's scope.
</domain>

<decisions>
## Implementation Decisions

### Scoring vs. display split
- **D-01:** Score every new category the user weights via `categoryWeights` — **but only where defensible cited data exists.** Cited-data scoring is the headline match number.
- **D-02:** Scored categories this phase: **healthcare, schools (K-12), childcare cost, air connectivity** — each gated by the user's expressed category weight (so schools/childcare only bite for users who flagged kids; weight ~0 → ~0 contribution). Plus **parks/outdoors** (with proxy, see D-07). Existing 4 factors (cost, career, lifestyle, safety) remain.
- **D-03:** **Demographics is display-only** (`foreignBornPct`, `medianAge`, `neverMarriedPct`) — neutral factual statistics, **never** a fit/"people like you" score (carries Phase 11 D-14/D-15; product/legal positioning).
- **D-04 (architecture seam):** Amenity categories with **no sourced dataset** (gyms, country clubs, niche amenities) are NOT baked into a static DB. Instead they are **researched live at results-time by the AI layer** and surfaced as a **separate, clearly-labeled extra/premium tier** — never silently folded into the cited headline score. Phase 12's job is only to make the engine **extensible**: `categoryWeights` is already keyed by arbitrary slug and `scoreFactors` is an open list, so externally-injected category scores plug in cleanly. The live research itself = Phase 5 (live-AI) + ties to the Plus tier.

### Score stability (the clamp BLOCKER)
- **D-05 (LOCKED HARD CONSTRAINT — the Phase 3 BLOCKER):** Adding new scored caps MUST keep `BASE_SCORE + Σ(all maxContribution caps) < 99` so `clamp(score, 0, 99)` never fires on strong profiles and the badge never desyncs from the contribution bars. **Tests MUST assert the user-facing DISPLAYED score, not a pre-clamp internal invariant** (a pre-clamp assertion previously gave false comfort while the displayed score was broken — see `test-assert-user-facing-output` memory). The *how* (proportional renorm vs. shrink-caps vs. lower BASE_SCORE) is the planner's discretion.
- **D-06:** **Rankings can shift freely.** The new dimensions are real signal — let them change both absolute numbers and order. Honesty over demo-stability. No demo cities are pinned; Gabriel re-confirms the demo narrative against the new results.

### Missing / partial data behavior
- **D-07:** **Proxy fallback, then neutral exclusion.** For a missing datum: use the best available proxy first (parks → `nearMountains`/`nearCoast` + existing "outdoors" lifestyle tag, which cover all 22 cities); only when no proxy exists, **exclude that category from THAT city's score** (neither rewarded nor punished — never a phantom zero). Display shows the proxy or a "limited data" marker. (Inherits Phase 3's never-empty / advisory principle.)
- **D-08:** **State-level data scores, labeled "state average."** Schools (NAEP G8) and childcare (CCAoA) are state-level — they discriminate across states, not within one. They feed the score, but every surfaced value and contribution is **explicitly labeled "state average"**, never mistaken for city-specific. (San Diego toddler childcare is "NR" → falls under D-07 neutral exclusion for that cell.)

### Disaster-risk treatment
- **D-09:** **FEMA composite is display-only.** The composite NRI barely discriminates these 22 metros (all ~88–99.97), so it does **not** move the score — surfaced as labeled context ("FEMA National Risk Index: Relatively High"). **No per-hazard re-sourcing this cycle.** Consequence: the `disasterRiskConcern` quiz field (captured in Phase 11) does not drive a weighted score here; at most a future soft filter/sort.

### Claude's Discretion
- Exact recalibration math for the clamp constraint (D-05) — proportional renorm of all caps vs. shrinking existing caps vs. lowering BASE_SCORE — planner's call, as long as displayed score < 99 and the honest-contribution invariant (`BASE_SCORE + Σ contributions === rawScore`) holds.
- Final `WEIGHT_FLOOR` / two-tier swing values (Phase 11 left them provisional — tune in `scoring-weights.ts`).
- Per-category normalization formulas (each new category → [0,1] factor score) — mirror the existing `costFactorScore`/`safetyFactorScore` pattern.
- Exact shape of the external-injection seam for D-04 (how a live-AI tier hands category scores to the engine).
- Whether childcare folds into the financial model vs. the match score (D-02 keeps it in the match score by default; planner may revisit if the contribution math argues otherwise).
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The sourced data (what gets populated + its caveats)
- `.planning/research/deep-category-data.md` — cited city data for all 7 new categories + the "Proposed schema additions" block + "Coverage gaps". **Data caveats that are binding decisions:** state-level repeats must be labeled "state average" (D-08); ParkScore covers only 7/22 cities → proxy fallback (D-07); FEMA composite barely discriminates → display-only (D-09); `foreignBornPct` is a neutral factual stat (D-03); NYC/Brooklyn geography is county/metro-level, keep the note.

### The scoring seam (what Phase 12 extends)
- `shared/engine/scoring.ts` — `computeRawScore` / `scoreCity`; the 4-factor honest-contribution pattern to mirror for new categories. `scoreFactors` is the open list new categories append to.
- `shared/engine/scoring-weights.ts` — `SCORING_WEIGHTS` (global, normalization caps), `BASE_SCORE` (=50), `PERSONAL_WEIGHT_SCALE`. **The clamp BLOCKER lives here** (current max raw = 90.4; new caps must keep it < 99 — D-05). Add the two-tier floor here.
- `shared/types.ts` — `City` interface already carries all new optional fields (healthcare, disaster, school, childcare, demographics, parks, FAA); `Profile` already carries `categoryWeights: Record<string, number>`, `weightExplanations`, and module/personality fields. **The contract is landed; Phase 12 populates + consumes it.**
- `shared/data/cities.ts` — the 22-city dataset; new fields are currently **unpopulated** (0 occurrences). Phase 12 populates them from `deep-category-data.md`.

### Phase 11 handoff (the upstream that defines this phase)
- `.planning/phases/11-deep-profile-expand-the-quiz-with-sourced-life-area-categori/11-CONTEXT.md` — the Phase 11→12 hard line, two-tier floor (D-09 there), explainability requirement (D-08 there), neutral-demographics (D-14).
- `.planning/phases/11-deep-profile-expand-the-quiz-with-sourced-life-area-categori/11-04-PLAN.md` §"Phase 12 HARD requirements" (Task 2 / lines ~164–170) — the carried-forward BLOCKER (clamp/BASE_SCORE), provisional weight-floor tuning, parks fallback + FEMA per-hazard as Phase 12 items, the D-02 open reconciliation.
- `.planning/phases/11-deep-profile-expand-the-quiz-with-sourced-life-area-categori/11-RESEARCH.md` — Pitfall 6 (clamp/BASE_SCORE), Data-Gated Module Set caveats, architecture diagram.

### Project intent & structure
- `.planning/PROJECT.md` — "win #1 — pitch substance wins ties"; the honest-contribution / "should someone trust this?" anchor that justifies cited-data-only scoring.
- `STRUCTURE.md` — contract-first rule (`shared/` TS contract + logic; `src/` JSX UI).

> **Branch note:** Phase 12 is NOT listed in this branch's (`integrate/quiz-engine`) ROADMAP.md — it's defined on `main` / `phase-4-intl`, and the Phase 11 + merge work is consolidated on `reconcile/v1`. The working tree here is self-consistent for planning (data + scoring + types + Phase 11 artifacts all present). Confirm which branch Phase 12 executes on before implementing.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shared/engine/scoring.ts` `computeRawScore` — the two-layer formula `contribution = global[f] × personal[f] × factorScore[f] × maxContribution[f]`, with `rawScore = BASE_SCORE + Σ(rounded contributions)`. Mirror this exactly for each new category; do not invent a parallel mechanism.
- `shared/engine/scoring-weights.ts` — single tunable config; all new caps + the two-tier floor go here (D-03: no scoring constant inlined elsewhere).
- `Profile.categoryWeights: Record<string, number>` + `Profile.weightExplanations` — the MATCH-05 seam Phase 11 built specifically for this phase to consume.
- Proxy fields already present for D-07: `nearMountains`, `nearCoast`, and the lifestyle "outdoors" tag path in `lifestyleFactorScore`.

### Established Patterns
- **Honest contribution invariant:** `BASE_SCORE + Σ(scoreFactors.contribution) === rawScore`. New factors MUST preserve it (Pitfall 1 guard — derive rawScore from stored rounded contributions, never accumulate separately).
- **Per-factor [0,1] normalization** before weighting (see `costFactorScore`, `safetyFactorScore`) — every new category needs one.
- **Config-driven, contract-first:** `shared/` is the source of truth; the collaborator's UI binds to `scoreFactors` + the labeled values.
- **Never-empty / neutral-default guardrails** (Phase 3) — extended by D-07's exclude-when-missing rule.

### Integration Points
- `categoryWeights` (Phase 11 output) → Phase 12 scoring inputs.
- New `scoreFactors` entries → the collaborator's "why this city" contribution UI (must carry "state average" / "limited data" / FEMA-context labels per D-08/D-07/D-09).
- The D-04 external-injection seam → Phase 5 live-AI tier / Plus-tier amenities.
</code_context>

<specifics>
## Specific Ideas

- **Cited-data-only as the trust moment:** every number that moves the score traces to a federal/named source. This is the Q&A-defensibility spine — the answer to "should someone trust this?" The live-AI amenity tier is deliberately walled off so a judge can't conflate a guessed number with a cited one.
- **AI amenity research as a premium tier (Gabriel's idea):** rather than a static amenities DB, the live-AI layer researches gyms/country-clubs/niche amenities at results-time as an *extra* tier — both more flexible and a natural Plus-tier upsell.
</specifics>

<deferred>
## Deferred Ideas

- **Live-AI amenity research** (gyms, country clubs, niche amenities) at results-time as a labeled premium/Plus extra tier → **Phase 5** (live-AI layer). Phase 12 only builds the engine seam.
- **FEMA per-hazard sub-score re-sourcing** (hurricane/wildfire/quake/flood) to make disaster risk a real scored input → deferred this cycle (composite is display-only per D-09).
- **`disasterRiskConcern` as a soft filter/sort signal** → possible future use; not scored in Phase 12.
- **D-02 open reconciliation** (whether Phase 11's personality weighting replaces or layers over Phase 2's `importanceRank` weight derivation) → resolve at Phase 2 integration; not a Phase 12 decision but noted so it isn't lost.

</deferred>

---

*Phase: 12-multi-dimensional-scoring-extend-the-scoring-engine-and-city*
*Context gathered: 2026-06-03*
