# Phase 11: Deep Profile - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-02
**Phase:** 11-deep-profile-expand-the-quiz-with-sourced-life-area-categori
**Areas discussed:** Collaborator UI integration, Phase 11 UI deliverable, Phase 2 boundary, Priority/weighting UX, Depth & flow, Tier-3 handling, Personality-quiz style, Module flow, Weighting strength, Hard filters, Gate length, Module depth

---

## Collaborator UI integration

| Option | Description | Selected |
|--------|-------------|----------|
| Whole app incl. quiz | Collaborator rebuilds the actual screens including quiz UI; high conflict risk with Phase 2 session | ✓ |
| Landing + styling only | Marketing/landing + polish; quiz screens stay Phase 2's | |
| Design system / components | Reusable components we wire the quiz into | |
| Not sure yet | Define contract defensively | |

**User's choice:** Whole app incl. quiz
**Notes:** Drives the decision that `shared/quiz-engine/` is the UI-agnostic source of truth and the collaborator binds to a documented contract. Phase 2's `src/screens/quiz/*` UI is provisional.

---

## Phase 11 UI deliverable

| Option | Description | Selected |
|--------|-------------|----------|
| Logic + contract + spec | Engine + contract + written UI spec for the collaborator; zero throwaway UI code | ✓ |
| Logic + interim UI | Also build functional-but-unpolished screens; collaborator repolishes later | |
| Logic only, UI live w/ friend | Engine + contract only, pair in real time | |

**User's choice:** Logic + contract + spec
**Notes:** Cleanest division of labor (Gabriel owns backend logic, collaborator owns frontend).

---

## Phase 2 boundary (family/community overlap)

| Option | Description | Selected |
|--------|-------------|----------|
| P2 prefs drive P11 weights | Reuse Phase 2 soft dimensions as importance weights on new factors | |
| Fully separate | Phase 11 asks its own importance questions per category | |

**User's choice:** Free-text — "Phase 2 is still WIP, let's work on the additional stuff that doesn't exist first."
**Notes:** Build net-new categories first; defer reconciliation with Phase 2's soft dimensions until Phase 2 lands.

---

## Priority/weighting UX

| Option | Description | Selected |
|--------|-------------|----------|
| Per-category importance | Each category gets a not-important → must-have control | |
| Pick your top 5 | Select the handful that matter, weight those | |
| Grouped ranking | Rank within groups | |

**User's choice:** Free-text — "a personality quiz at first to figure out what matters most... based on what matters more it will weight stuff differently. If the person likes lifestyle more, then lifestyle category will have more weight in the final output."
**Notes:** This is the defining decision — weights are *inferred* from an upfront personality/values quiz, not set explicitly.

---

## Depth & flow

| Option | Description | Selected |
|--------|-------------|----------|
| Progressive | Fast core → results → refine | |
| Long quiz upfront | Full depth before any result | |
| Modular self-directed | User picks which life-areas to go deep on | ✓ |

**User's choice:** Modular self-directed
**Notes:** Composed with the personality quiz into a "guided modular" flow (personality result surfaces relevant modules).

---

## Tier-3 handling

| Option | Description | Selected |
|--------|-------------|----------|
| Factual + self-select | Present facts, user filters; no computed score | |
| Omit entirely | Leave political/social out, documented out-of-scope | ✓ |
| Capture, don't score | Store stance, no surface/score yet | |

**User's choice:** Omit entirely
**Notes:** User made the defensibility call directly. Revisitable post-competition.

---

## Personality-quiz style

| Option | Description | Selected |
|--------|-------------|----------|
| Tradeoff scenarios | Forced-choice scenarios that reveal valued categories | |
| Trait statements | Agree/disagree personality-test style | |
| Hybrid | Tradeoff scenarios anchor weights + trait statements for color | ✓ |

**User's choice:** Hybrid

---

## Module flow

| Option | Description | Selected |
|--------|-------------|----------|
| Guided modular | Inferred priorities surface relevant modules; user can add others | ✓ |
| Pure self-directed | Personality sets weights; user freely picks modules | |

**User's choice:** Guided modular

---

## Weighting strength

| Option | Description | Selected |
|--------|-------------|----------|
| Two-tier with a floor | Practical factors (cost/safety/healthcare) keep a floor; preferences swing above | ✓ |
| Capped swing | All weights bounded range, no special protection | |
| Unbounded | A preference can fully dominate | |

**User's choice:** Two-tier with a floor
**Notes:** Anti-absurdity guard against "broke but recommended the priciest city."

---

## Hard filters

| Option | Description | Selected |
|--------|-------------|----------|
| Any can be a dealbreaker | New categories can hard-exclude, inheriting guardrails | |
| Selective | Only safety-critical get hard filters | |
| Weight-only | New categories shape score but never hard-exclude | ✓ |

**User's choice:** Weight-only
**Notes:** Dealbreakers stay Phase 2's existing set; keeps the never-strand surface small.

---

## Gate length

| Option | Description | Selected |
|--------|-------------|----------|
| Short (~5-7) | Fast to first result, depth in modules | |
| Adaptive | ~5 core + more where ambiguous; reuses Phase 2 tension engine | ✓ |
| Medium (~10-12) | Richer weights, more drop-off risk | |

**User's choice:** Adaptive
**Notes:** Explicit integration dependency on Phase 2's `tension.ts`.

---

## Module depth

| Option | Description | Selected |
|--------|-------------|----------|
| Mixed by category | Rich for high-impact (healthcare, family), light for the rest | ✓ |
| Rich everywhere | Every module deep | |
| Light everywhere | 1-2 questions per module | |

**User's choice:** Mixed by category

---

## Claude's Discretion

- Exact tradeoff-scenario content and trait statements
- Weight-floor values and swing range (tune in Phase 12 against `scoring-weights.ts`)
- Adaptive-trigger thresholds (reuse `tension.ts` heuristics)
- Per-module sub-question wording
- Extended weight-map shape (extensible map keyed by category, replacing fixed 4-factor)

## Deferred Ideas

- Tier-3 factual self-select (post-competition)
- Reconciling Phase 2's soft-preference dimensions with Phase 11's personality weighting (after Phase 2 lands)
- Whether the personality quiz replaces or layers over Phase 2's `importanceRank` (resolve at Phase 2 integration)
