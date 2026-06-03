# Phase 3: Matching & US Financial Spine - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Turn the quiz's preference `Profile` into a **ranked list of US city matches**, each with an **income-adjusted financial breakdown**, running **entirely offline on battery** — the first end-to-end demoable slice (quiz → results → city detail with financials). Delivers MATCH-01, MATCH-03, MATCH-04, FIN-01.

**Owns:** the scoring engine (`shared/engine/`), the tunable scoring-weights config, the US financial model (real tax math), the curated US city dataset, the ranked-results UI + sort/filter, the per-city score explanation, and the dealbreaker re-confirmation UX.

**Does NOT own:** the quiz itself (Phase 2 — produces the `Profile` this phase consumes), international cities + country-specific financial models (Phase 4), live AI city data / live-search reconciliation (Phase 5), relocation roadmap (Phase 6), visa concierge (Phase 7). The hard line: **Phase 2 turns answers into a weighted preference profile; Phase 3 scores US cities against it, fully offline.**
</domain>

<decisions>
## Implementation Decisions

### Dealbreaker model (MATCH-01, builds on Phase 2 D-11)
- **D-01:** Dealbreakers are a **heavy score penalty, NOT a hard delete.** The ranked list is always fully populated — the user is **never stranded** (this solves Phase 2's deferred "never-empty floor" structurally; no "relax the weakest filter" hack is needed). This is a deliberate change from the literal "eliminate" reading of QUIZ-04 — the penalty is large enough to demote dealbroken cities far down the list, but they remain visible and recoverable.
- **D-02:** **Interactive dealbreaker re-confirmation (the signature advisory moment).** When a dealbreaker demotes what WOULD have been the user's #1 match, surface a concrete, conversational re-confirm using the *specific fact* behind the dealbreaker — NOT a vague "reconsider." Example copy:
  > "Based on your answers, **Austin** would be your top match. But Austin's summer highs are above 100°F. Is that still a dealbreaker for you?"
  - If the user answers **No (it's fine)** → the penalty for that dealbreaker lifts and the city can reclaim its true rank.
  - If **Yes (still a dealbreaker)** → the city stays demoted.
  - Mechanically: compute the would-be ranking *without* dealbreaker penalties, compare its #1 to the penalized #1; if they differ because of a dealbreaker, trigger the re-confirm for that specific city + dealbreaker, citing the real city fact.

### Scoring architecture (MATCH-03 — config-driven & tunable)
- **D-03:** **All scoring magic numbers live in ONE tunable config** (e.g. `shared/engine/scoring-weights.ts`): base factor coefficients (cost/career/lifestyle/safety), the dealbreaker penalty size, and any per-tag bonuses. The prototype's flaw is that constants like `* 0.2`, `* 0.08`, `-25` are scattered inline through `getMatchScore` — Phase 3 centralizes them so post-demo tuning ("lifestyle is overpowering cost") is a one-constant change, not a logic hunt. This also makes the engine cleanly unit-testable (Nyquist).
- **D-04:** **Two separate weighting layers, multiplied, never conflated:**
  1. *Global factor weights* — the tunable config (D-03): how much each factor matters in general.
  2. *Per-person priority weights* — the `weights{cost,career,lifestyle,safety}` already derived by the Phase 2 quiz from `importanceRank`. Phase 3 **consumes** this as a multiplier; it does NOT re-capture priorities. (This is the "lifestyle #1 for a teenager, cost #1 for a single mom" personalization — already handled upstream.)
  - Final score shape ≈ `Σ (globalWeight[factor] × personalWeight[factor] × cityScore[factor]) − dealbreakerPenalties`, clamped to 0–99.
- **D-05:** **Score explanation = signed contribution bars** (Teleport-style): each factor shown with its signed point contribution — e.g. `Cost +12, Career +8, Lifestyle +6, Safety +3, No-extreme-heat −20`. Research found this transparency (not the ranking itself) was Teleport's actual differentiator. The contract already supports it: `MatchResult.scoreFactors: {factor, contribution}[]`.
- **D-06:** **Disclosure = on expand.** The ranked list shows match score + city; tapping a card reveals the contribution breakdown + financial detail (SC2 "user can expand any city match"). Prototype already has `expandedSection` state to reuse.

### Financial model fidelity (FIN-01 — judge-defensible)
- **D-07:** **Real progressive federal income tax brackets + standard deduction** (replaces the prototype's flat 22%). Pure offline TS (~30 lines). A judge asking "how did you get take-home?" gets a real answer. **Research directive:** source the *currently applicable* IRS brackets + standard deduction for the relevant tax year — do NOT hardcode a guessed table.
- **D-08:** **Model depth:** bracketed federal + **flat state %** (the city's `stateTax` field — acceptable since most states are flat-ish for a demo) + **real FICA 7.65%** + **cost-indexed expenses** (scale by `costIndex` as the prototype does). This is the best accuracy-per-effort tier for a pitch. Deferred: state brackets, Social Security wage cap, per-category researched expense models (post-pitch refinement).

### City dataset (MATCH-01, FIN-01)
- **D-09:** **Move city data out of JSX into `shared/data/cities.ts`**, typed to the `City` contract. Both the engine and the UI import it. Add the contract fields the prototype's inline data lacks: `country: "US"` and `financialModelId` (so Phase 4 can append international cities cleanly).
- **D-10:** **Expand to ~20–25 curated US cities** (from the prototype's 12) — good geographic + cost spread that reads as "comprehensive" on stage without scale risk.
- **D-11:** **Enrich each city with the specific fields each dealbreaker checks**, so the D-02 re-confirm can cite a real number — e.g. `summerHighF` / `winterLowF` (so "Austin hits 100°F+" is a real fact, not derived from `avgTemp`). Map every dealbreaker to a concrete city field it tests against.
- **D-12:** **Real, cited numbers for the new cities.** The Phase 3 researcher sources attributable figures (rent, taxes, climate, safety, job growth) + the enriched dealbreaker-fact fields from public sources, consistent with the pitch's "sourced, defensible" standard. A judge probing a specific city's rent has an answer.

### Claude's Discretion
- Exact engine module layout under `shared/engine/`, the precise scoring formula coefficients' starting values (tunable per D-03), sort/filter UI mechanics (MATCH-04: by match/savings/salary/cost — prototype has `sortBy` state to extend), and the specific set of ~20-25 cities chosen for spread.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The contract being consumed/extended
- `shared/types.ts` — `Profile` (engine INPUT, finalized by Phase 2: `weights{cost,career,lifestyle,safety}`, `tradeoffTolerance[]`, `dealBreakers[]`, `opennessToAbroad`, `importanceRank`), `City`, `MatchResult` (`scoreFactors`, `ExpenseBreakdown`), `Housing`. **Phase 3's frozen input is the Profile contract Phase 2 emits.**
- `shared/data/constants.js` — `BASE_SALARIES`, `PROFESSION_CATEGORIES`, `DEAL_BREAKERS`, `LIFESTYLE_TAGS`. The engine reads salaries + dealbreaker definitions from here.

### The prototype being rebuilt into the engine (reference, not a base)
- `src/screens/PotentialApp.jsx` — working reference implementation: `getMatchScore` (lines ~104-142, additive heuristic with scattered magic numbers — centralize per D-03), `getSalary`/`getTakeHome`/`getExpenses`/`getSavings` (lines ~76-102, flat-tax financial math — upgrade per D-07/D-08), inline `CITIES_DATA` (lines ~11-24, 12 US cities — move + expand + enrich per D-09/D-10/D-11), `sortBy`/`expandedSection`/`results` state (extend for MATCH-04 + D-06).

### Phase 2 handshake (the upstream producer of this phase's input)
- `.planning/phases/02-quiz-profile-capture/02-CONTEXT.md` — D-04 (output = structured preference profile), D-05 (Profile extension), D-11 (dealbreaker guardrails deferred to Phase 3 — this phase honors them), D-14/D-15 (tradeoffTolerance tiebreaker the engine may read for ranking balance).
- `.planning/phases/02-quiz-profile-capture/02-RESEARCH.md` — Pattern 4 (the finalized `Profile` field list + derived `weights` shape the engine consumes); competitor research on Teleport contribution-bar transparency (informs D-05).

### Project intent & scope
- `.planning/PROJECT.md` — "win #1 — pitch substance wins ties"; offline-on-battery as a demo constraint.
- `.planning/REQUIREMENTS.md` — MATCH-01, MATCH-03, MATCH-04, FIN-01 (this phase); FIN-02 (international, Phase 4) for forward-compat in the financial model interface.
- `.planning/ROADMAP.md` — Phase 3 goal + 5 success criteria; slice boundaries (P4 intl, P5 live AI).
- `STRUCTURE.md` — repo layout, contract-first rule (`shared/` = TS contract + engine + data; `src/` = JSX UI).

### Carried-forward stack
- `.planning/phases/01-scaffold-port/01-CONTEXT.md` — Vite + React, TS for `shared/`, inline-style dark theme, port-don't-redesign (NOTE: superseded for the *quiz* by Phase 2 DD-03 indie-pixel, but Phase 3's results/detail UI is a separate surface — planner + UI-phase decide its visual treatment).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`getMatchScore`, `getSalary`, `getTakeHome`, `getExpenses`, `getSavings`** (`PotentialApp.jsx`) — working algorithms to port into `shared/engine/` as pure, testable TS functions. Logic is sound; the magic numbers need centralizing (D-03) and the tax math needs upgrading (D-07).
- **`CITIES_DATA`** (12 US cities, inline) — the seed dataset to move, expand, and enrich (D-09/10/11).
- **`importanceRank` → weight function `w(cat)`** (lines ~110) — the prototype's rank-to-weight (rank0→4 … rank3→1). Phase 2 now produces derived `weights{}` directly; engine consumes those.
- **Results UI state** — `results`, `sortBy`, `selectedCity`, `expandedSection` already exist in the prototype to extend for MATCH-04 sort/filter and D-06 expand-to-reveal.

### Established Patterns
- **Contract-first** (`STRUCTURE.md`): engine reads/writes types from `shared/types.ts`; `MatchResult` is the engine→UI boundary. Announce contract changes in small commits.
- **Offline-only this phase:** no network, no `/api` calls (live AI is Phase 5). `fetchCityAI` is stubbed in the prototype — leave it stubbed.
- **Inline-style dark theme** — results/detail UI inherits the existing visual tokens (mint/amber/indigo on near-black). Whether it adopts Phase 2's indie-pixel direction is a UI-phase decision for this phase's surface.

### Integration Points
- **Engine INPUT:** `Profile` from the Phase 2 quiz (the frozen handshake).
- **Engine OUTPUT:** `MatchResult[]` → ranked results UI.
- **Forward-compat:** `City.financialModelId` + a pluggable financial-model interface so Phase 4 can add country models without rewriting the US spine. FIN-02 (international financials) is out of scope but the interface should not preclude it.

</code_context>

<specifics>
## Specific Ideas

- **Dealbreaker re-confirm copy pattern (D-02):** conversational, fact-citing, second-person — "Based on your answers, Austin would be your top match. But Austin's summer highs are above 100°F. Is that still a dealbreaker for you?" This is a marquee pitch moment showing the tool *reasoning with* the user, not dogmatically filtering.
- **Tunability as a testing affordance (D-03):** Gabriel explicitly wants to run tests, observe bad recommendations, and fix by adjusting weights — the config must make "lifestyle is scoring too high vs cost" a one-line change.
- **Contribution bars as credibility (D-05):** signed per-factor points make the score legible and judge-defensible — the dealbreaker penalty is visible as a real negative number.

</specifics>

<deferred>
## Deferred Ideas

- **Scale to "all US cities" via a real dataset/API** (Gabriel's bigger vision) — defer to post-pitch. The engine is written to be city-count-agnostic, so scaling later is "just more data." Phase 3 ships ~20-25 curated, cited cities.
- **Maximal financial model** — state tax brackets, Social Security wage cap, per-category researched expense models. Post-pitch refinement; D-08 ships the high-value subset.
- **International cities + country-specific financial models (FIN-02)** → Phase 4. Keep `financialModelId` + a pluggable model interface so the US spine doesn't block it.
- **Live-search reconciliation of competing priorities** (using `tradeoffTolerance`) → Phase 5 live AI. Phase 3 may use `tradeoffTolerance` for static ranking of balancing cities, but does not do live search.

### Reviewed Todos (not folded)
None — no pending todos matched this phase.

</deferred>

---

*Phase: 03-matching-us-financial-spine*
*Context gathered: 2026-06-01*
