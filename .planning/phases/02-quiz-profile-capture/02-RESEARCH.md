# Phase 2: Quiz & Profile Capture — Research

**Researched:** 2026-06-01
**Researcher:** Claude (inline — gsd-phase-researcher sub-agent timed out; research conducted directly with the same source mandate)
**Phase requirements:** QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05

---

## User Constraints (from CONTEXT.md)

These are LOCKED decisions the plan must honor. Research operates inside them, not around them.

- **D-01 — Rebuild, not extend.** The prototype's 5-step quiz is *reference only*. Build a real, deeper, adaptive instrument with logic behind it.
- **D-02 — Deeper dimensions.** Beyond career/finances/background/lifestyle/priorities, capture **motivation to move, work style, community/family needs, pace of life, risk tolerance, tradeoff tolerance.**
- **D-03 — Branching.** Conditional follow-ups; smart tree, not a linear sequence.
- **D-04 — Output = structured preference profile.** Raw answers **+ derived weights + tradeoff tolerances**. "The real logic lives in the profile, not the matcher." Phase 3 scores against it.
- **D-05 — Extends `shared/types.ts` `Profile`** with new dimension fields + a derived-preference structure.
- **D-06 — "Going Global" grouping** (openness-to-abroad + citizenship + status + timeline) as a visible demo moment.
- **D-07/08/09 — US-first immigration capture.** Citizenship = structured shortlist (~10 + Other), **defaults to US**; `immigrationStatus` auto-set to `"citizen"` for US citizens (question hidden); only non-US users see a short status enum.
- **D-10 — Openness slider 0–100**, `0` = hard-exclude international entirely.
- **D-11/12/13 — Dealbreakers are hard filters** with a capture-time warning; **wire all** dealbreakers (4 are currently inert); research competitor filter UX.
- **D-14/15 — Tension reconciliation.** Detect conflicting priorities, ask ONE reconciling follow-up, store as a tiebreaker/weight.
- **D-16 — Move timeline buckets.**
- **Lock (Phase 1):** port-don't-redesign visual identity; inline-style dark theme; TS for `shared/`, JSX for `src/`.

---

## Summary

The strongest external signal comes from **Teleport** (the acquired-and-shut-down competitor whose exit anchors our pitch): its onboarding was a **two-step** flow — pick the life-quality terms that matter, then enter baseline data (profession, salary) to forecast money — and it deliberately **refused to make users weight each factor** because per-factor weighting causes cognitive overload and *worse* results. This is the central design lesson and it independently validates CONTEXT **D-04**: capture *what matters* + *rank* + *forced trade-offs*, then **derive** the weights. Don't ask users to be their own algorithm.

The recommended instrument is **~6 grouped steps** kept to a perceived ~8–10 questions via **branching** (research: branching makes a 20-question survey "feel like eight" and lifts completion up to 45%). Weight derivation should use **best-worst / forced-choice logic** (MaxDiff family) for the priority ranking and the reconciliation follow-ups — forced trade-offs avoid the "everything is important" scale bias that plagues rating scales and yield clean 0–100 weights that sum to 1. The deeper dimensions (D-02) map cleanly onto the **person-environment-fit** domains the satisfaction literature identifies (stimulation↔peacefulness = *pace of life*; interaction↔solitude + homogeneity↔heterogeneity = *community/family needs*; autonomy/goals = *motivation to move*).

The phase's real deliverable is not screens — it's a **`Profile.preferences`** structure: normalized weights + tradeoff resolutions + the Going-Global fields, emitted from a **pure, testable derivation function in `shared/`** so Phase 3 consumes a clean contract and the math is re-derivable on stage in 60 seconds.

---

## Architectural Responsibility Map

| Concern | Owner | Notes |
|---|---|---|
| Quiz UI / flow / step machine | **Phase 2** (`src/screens/`) | Reuse UI-SPEC primitives (pills, sliders, progress). Recommend `useReducer` over scattered `useState` — the profile is now large. |
| Branching / adaptive logic | **Phase 2** (`src/`) | Simple `if-then` rules over answers (NOT a schema-driven engine — CONTEXT rejected that). |
| Option sets (professions, lifestyle, dealbreakers, citizenship, timeline, motivations) | **Phase 2** (`shared/data/constants.js`) | Extend existing sets; add new ones. |
| `Profile` contract + `preferences` structure | **Phase 2** (`shared/types.ts`) | The frontend↔engine handshake. Small announced commits. |
| **Derive-weights function** (answers → normalized weights + tradeoffs) | **Phase 2** (`shared/`, e.g. `shared/engine/derive-preferences.ts`) | Pure, unit-testable. THIS is "the real logic lives in the profile." |
| City scoring against the profile | **Phase 3** | Hard line: P2 emits weighted profile; P3 scores cities. |
| Never-empty / advisory-override dealbreaker guardrails | **Phase 3** | P2 captures hard filters + warns at capture; P3 must never return zero cities. |
| International cities (to make openness/abroad testable) | **Phase 4** | SC2 only verifiable downstream; P2 confirms value captured + passed. |
| `ROADMAP_TEMPLATES[citizenship][country]` | **Phase 6** | Consumes `citizenship`. |
| Visa eligibility / `VisaPathway` | **Phase 7** | Consumes `citizenship` + `immigrationStatus`. |

---

## Recommended Instrument (the deeper quiz)

Six grouped steps. Each field below names its **elicitation method** and its **downstream consumer**. Perceived length stays ~8–10 via branching.

### Step 1 — Why now? (Motivation — NEW, the keystone)
- **`motivations`** — multi-select, pick up to 3 from: *Save more money · Advance my career · Lower cost of living · Adventure & new culture · Be near family · Safety & stability · Lifestyle upgrade · Remote-work freedom.*
  - **Method:** capped multi-select (forces prioritization, avoids "select all").
  - **Consumer:** Phase 3 — **seeds the derived weight emphasis** (e.g. "save money" → +cost weight; "career" → +jobGrowth weight; "adventure" → +openness interpretation). Personalizes Phase 4/6/7 copy.
  - **Why first:** motivation is the cheapest, highest-signal predictor and frames every later question. Maps to the *autonomy/goals* driver in person-environment-fit research.

### Step 2 — Work & money
- **`profession`** (structured pick + custom), **`hasRemote`** → Phase 3 salary (`BASE_SALARIES`) + job-market weight; remote widens geography.
- **`workStyle`** (NEW) — `remote | hybrid | onsite`; **branch:** if not remote → **`industryHubImportance`** (low/med/high) and **`commuteTolerance`** → Phase 3 job-market weight + density.
- **`income`, `savings`, `debt`, `housing`** (rent/buy) → Phase 3 financial model (FIN-01).
- **`hasPartner`** → branch **`partnerIncome`**; **`hasDependents`** → branch **`numDependents`** (+ auto-bump schools/safety weight); **`hasPets`** → branch **`petType`** → Phase 3 expense model.

### Step 3 — You & your rhythm
- **`age`, `education`, `currentCity`** → Phase 3 baseline (Teleport-style "vs. where you live now" compare) + salary adjustment.
- **`paceOfLife`** (NEW) — slider *Slow & peaceful ↔ Fast & high-energy* → Phase 3 vibe/density match. (P-E fit: stimulation↔peacefulness.)
- **`communityNeeds`** (NEW) — slider/pick *Tight-knit & familiar ↔ Big & diverse* + **`familyProximity`** importance → Phase 3 diversity/community vibe; feeds the "Far from family" dealbreaker conflict. (P-E fit: interaction↔solitude, homogeneity↔heterogeneity.)
- **`riskTolerance`** (NEW) — slider *Play it safe ↔ Embrace the unknown* → modulates how aggressively bold/abroad matches surface; informs Phase 5/7 framing.

### Step 4 — Your ideal life (lifestyle)
- **`lifestyleTags`** — the existing 14-tag grid (≥1 required) → Phase 3 vibe match. Feeds conflict detection (e.g. nightlife/startup vs. cost).

### Step 5 — Going Global (D-06, the demo moment)
- **`opennessToAbroad`** — slider 0–100, **`0` = exclude international entirely**, living label ("Set in my country → Anywhere on earth") → Phase 3 international weight (testable Phase 4).
- **`citizenship`** — structured shortlist, **defaults to US** → Phase 6 `ROADMAP_TEMPLATES`, Phase 7 pathways.
- **`immigrationStatus`** — **auto `"citizen"` for US**; **branch:** non-US → short enum → Phase 7.
- **`moveTimeline`** — buckets → Phase 6 urgency, Phase 7.
- **Branch:** if `opennessToAbroad === 0`, collapse/skip abroad-specific framing but still capture citizenship (default US) so the contract stays populated for domestic roadmaps.

### Step 6 — Priorities & deal-breakers
- **`importanceRank`** — reorder the 4 pillars (cost/career/lifestyle/safety) → base weights via rank-order. Keep 4 top-level for demo clarity; finer weights derive from Steps 1–4.
- **`dealBreakers`** — hard filters, **all 10 wired**, **capture-time warning** ("these can remove a lot of good options") → Phase 3 elimination + guardrails.
- **Tension reconciliation** (D-14) — see below.

---

## QUIZ-02 — Openness to Abroad — Findings
- Slider format locked (D-10). `0` = hard exclude; mid/high weight international up. Behavior only testable once Phase 4 ships international cities; Phase 2 verifies the value is **captured + passed**.
- **Recommendation:** add a `riskTolerance` cross-check — high openness + low risk tolerance is a (soft) signal to surface "easier" abroad options first (English-speaking / strong-expat-infra), a Phase 4/5 hook. Capture both here; consume later.

## QUIZ-03 — Citizenship & Immigration — Findings
- **Citizenship shortlist (recommend ~10 + Other), default US:** United States · Canada · United Kingdom · Germany · India · China · Philippines · Mexico · Brazil · Nigeria · Other. Rationale: largest US-immigrant-origin populations + the destination-country passports relevant to Phase 4 golden-path cities (Portugal/Germany/Canada/UK). Planner finalizes against Phase 6/7 template coverage; unsupported combos fall back to a generic roadmap downstream.
- **Status enum (non-US only):** `citizen` (auto for US) · `permanent_resident` · `work_visa` · `student_visa` · `other`. Keep neutral, minimal, non-judgmental wording. Store structured.
- **SC3 satisfied** even though most users (US) never see the status question — every user *declares citizenship*; status is auto-derived for US, explicitly declared by non-US.

## QUIZ-04 — Dealbreakers as Hard Filters — Findings
- **Competitor lesson (Teleport):** users pick what matters; the system avoids overloading them with per-factor weighting. Apply the same restraint — dealbreakers are a *small* set of binary hard filters, not a weighting matrix.
- **Wire all 10** (D-12). Today `getMatchScore` only handles 6; "near mountains," "near ocean/coast," "international airport," "strong job market in field" are selectable no-ops — none should stay inert (this requires matching `City` attributes to exist; flag as a Phase 3 contract need).
- **Capture-time warning** (D-11) at the dealbreaker step. The never-empty floor + advisory-override ("your X dealbreaker removed your best fit — reconsider?") are **Phase 3** guardrails; Phase 2 only warns + captures.
- Some dealbreakers imply a needed `City` field (airport, coast, mountains, no-state-income-tax). **Open question for Phase 3 contract** (see below).

## QUIZ-05 — Move Timeline — Findings
- **Recommend buckets:** `asap` (≤6 mo) · `6_12mo` · `1_2yr` · `2yr_plus` · `exploring` (no timeline). 5 options; "exploring" is the no-pressure default. → Phase 6 roadmap urgency sequencing, Phase 7 processing-time relevance.

## QUIZ-01 / SC6 / SC7 — Adaptive Flow + Tension Reconciliation — Findings

**Branching (SC6).** Use simple, pre-mapped `if-then` rules (research best practice; CONTEXT D-03). Concrete branches: partner→income, dependents→count, pets→type, workStyle≠remote→hub/commute, citizenship≠US→status enum, openness=0→collapse abroad framing. This keeps perceived length ~8–10 even with the deeper dimension set.

**Tension reconciliation (SC7, D-14)** — the adaptive showcase. Use **forced-choice (best-worst) phrasing** to resolve, which the MaxDiff literature shows beats rating scales and produces a clean weight delta.
- **Conflict-detection heuristics (rule set, evaluated after Step 6):**
  1. `importanceRank[0]==='cost'` **AND** lifestyle/motivation implies expensive (nightlife, startup, "lifestyle upgrade") → *budget vs. vibrancy*.
  2. `opennessToAbroad ≥ 65` **AND** (`'Be near family'` motivation OR high `familyProximity` OR "far from family" dealbreaker) → *abroad vs. roots*.
  3. `motivations` includes both `'Save more money'` **AND** `'Advance my career'` while `importanceRank` can't rank both top → *money vs. career runway*.
  4. `paceOfLife` high (fast) **AND** `lifestyleTags` includes `quiet`/`outdoors` heavily → *energy vs. calm*.
- **Mechanic:** detect → ask **one** reconciling forced-choice ("When these pull apart, which leans?") → store as `preferences.tradeoffs[conflictId] = 'a'|'b'` and apply a weight delta. Show **at most one** reconciliation to protect flow (pick highest-severity). Phase 3 uses the tiebreaker to rank cities that *balance* the competing priorities; the live-search reconciliation is Phase 5.

---

## The Derived Preference Profile (D-04 — the core deliverable)

Extend `shared/types.ts`:

```ts
// added to Profile (raw capture)
motivations: string[];
workStyle: "remote" | "hybrid" | "onsite";
industryHubImportance?: "low" | "med" | "high";
commuteTolerance?: number;
paceOfLife: number;          // 0..100  slow↔fast
communityScale: number;      // 0..100  tight-knit↔big-diverse
familyProximity: number;     // 0..100  importance
riskTolerance: number;       // 0..100
// derived (the real logic)
preferences: PreferenceProfile;

export interface PreferenceProfile {
  weights: {                 // normalized 0..1, sum ≈ 1 (MaxDiff-style)
    cost: number; career: number; lifestyle: number; safety: number;
    climate: number; community: number; pace: number; international: number;
  };
  tradeoffs: Record<string, "a" | "b">;   // resolved conflicts -> weight deltas
  hardFilters: string[];                   // dealbreakers as filters
  excludeInternational: boolean;           // opennessToAbroad === 0
}
```

**Derivation method (`shared/engine/derive-preferences.ts`, pure + tested):**
1. **Base weights** from `importanceRank` via rank-order (e.g. 0.40 / 0.27 / 0.20 / 0.13), the simple, defensible split.
2. **Nudges** from `motivations`, `paceOfLife`, `communityScale`, `lifestyleTags`, `opennessToAbroad` (additive deltas, capped).
3. **Tradeoff deltas** from reconciliation answers.
4. **Normalize** to sum 1 (the MaxDiff 0–100→0–1 convention). Keep the math linear and transparent — re-derivable on stage in 60 seconds (mirrors the pitch's "re-derive in 60s" stance).

---

## Validation Architecture (Nyquist)

Pure functions + a state machine → highly testable. Recommended validation requirements for the plan:

| Test | Target | Asserts |
|---|---|---|
| `derive-preferences` unit | `shared/engine/derive-preferences.ts` | known answers → expected normalized weights (sum≈1); motivation/pace nudges move the right weight. |
| conflict-detection unit | branching/reconcile logic | each heuristic fires on its trigger combo and not otherwise; only highest-severity surfaces. |
| branching unit | step machine | given answers, expected follow-ups show/hide (partner→income, citizenship≠US→status, openness=0→collapse). |
| Profile completeness | quiz submit | every required field present; `immigrationStatus` auto-`citizen` for US; `excludeInternational` set when openness=0. |
| contract/type | `shared/types.ts` | `Profile`+`PreferenceProfile` compile; emitted object matches the interface (the P2→P3 handshake). |

---

## Don't Hand-Roll
- **Weight derivation** — use the simple rank-order + additive-nudge + normalize recipe above; **do not** invent a black-box scorer. Transparency is a pitch asset.
- **Adaptive engine** — do NOT build a schema/config-driven question engine (CONTEXT explicitly rejected it for build-cost). Plain `if-then` branches in a reducer.
- **UI primitives** — reuse the existing inline-style `pill`/`slider`/`label`/progress primitives (UI-SPEC, port-don't-redesign). The cinematic prototype in `sketches/` is visual reference only; its *question content* is the shallow set being replaced.
- **State** — prefer one `useReducer` for the now-large profile over a dozen `useState` calls.

## Common Pitfalls
- **Per-factor weighting overload** (Teleport's stated failure mode) — derive weights; never ask users to tune them.
- **Survey fatigue** — without branching, the deeper dimension set balloons; branching must hold perceived length to ~8–10.
- **Rating-scale "everything is important" bias** — prefer pick-top / rank / forced-choice over Likert grids.
- **Inert captures** — every field must have a named consumer; the 4 dead dealbreakers are the cautionary example.
- **Dealbreakers wiping results** — real risk; mitigated in Phase 3 (never-empty + advisory). Phase 2 must warn at capture.
- **Sensitive immigration questions** — keep minimal, neutral, US-fast-path; store structured, never free-text for status.
- **Contract drift** — `src/` prototype state carries extras (`name`, `customProfession`, `color`) not in `types.ts`; reconcile explicitly (keep `customProfession` folded into `profession`; drop `color`).

## Open Questions (for the planner / Phase 3 contract)
1. **`City` attribute gaps:** wiring all dealbreakers needs `City` fields for airport / coast / mountains / state-income-tax. Define these on the `City` contract now (populated Phase 3/4) or scope a subset of hard filters for Phase 2? **Recommend:** define the fields in the contract now; Phase 3 populates.
2. **Citizenship shortlist final 10** — confirm against Phase 6 `ROADMAP_TEMPLATES` coverage so we don't offer citizenships with no downstream template (generic fallback acceptable?).
3. **Priority pillars: keep 4 or expand to 6** (adding climate/community)? Recommend keep 4 visible + derive finer weights, to protect demo clarity.

## Assumptions Log
- A-1: Primary user = US citizen (CONTEXT D-07). Citizenship defaults US; status auto-`citizen`. [from CONTEXT]
- A-2: ~6 grouped steps / ~8–10 perceived questions is the right depth-vs-fatigue balance. [survey-design research; ASSUMED for this audience]
- A-3: Linear rank-order base weights (0.40/0.27/0.20/0.13) are acceptable vs. full MaxDiff elicitation. [ASSUMED — full MaxDiff is too heavy for a 9-question consumer quiz; best-worst logic reserved for the reconciliation step]
- A-4: Deeper dimensions (motivation/pace/community/risk) measurably improve match quality. [grounded in person-environment-fit literature; not A/B-validated]

## Sources
- [Teleport case study — onboarding & match-score design](http://digitalwaveriding.com/teleport-case-study/)
- [Smithsonian — how Teleport's "where should you live" works](https://www.smithsonianmag.com/innovation/where-should-you-live-app-will-tell-you-180962588/)
- [Nomads.com (formerly Nomad List)](https://nomads.com/)
- [MaxDiff / best-worst scaling — Displayr](https://www.displayr.com/what-is-maxdiff/)
- [Best–worst scaling — Wikipedia](https://en.wikipedia.org/wiki/Best%E2%80%93worst_scaling)
- [Survey branching / conditional logic best practices — Qualaroo](https://qualaroo.com/features/question-branching/)
- [Skip logic & survey abandonment — Qualaroo](https://qualaroo.com/blog/skip-logic-survey/)
- [16Personalities / forced-choice methodology — Soultrace](https://soultrace.app/en/blog/16-personalities-test)
- [Person-Environment Fit & residential satisfaction — Kahana et al. (SAGE)](https://journals.sagepub.com/doi/10.1177/0013916503035003007)
- [Person-Environment Fit on residential satisfaction & well-being (ResearchGate)](https://www.researchgate.net/publication/371721738)
- [How to decide where to live — Redfin (factor taxonomy)](https://www.redfin.com/blog/how-to-decide-where-to-live/)

## Metadata
- Phase: 02-quiz-profile-capture
- Requirements: QUIZ-01..05
- Consumes: CONTEXT.md (D-01..D-16), UI-SPEC.md, REQUIREMENTS.md, shared/types.ts, shared/data/constants.js, src/screens/PotentialApp.jsx
- Produced for: gsd-planner (Phase 2 PLAN.md)
- Research mode: inline (sub-agent timeout fallback), bounded web research (6 queries)
