# Phase 3: Matching & US Financial Spine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-01
**Phase:** 03-matching-us-financial-spine
**Areas discussed:** Dealbreaker guardrails, Financial model fidelity, Score explanation, City dataset

---

## Dealbreaker guardrails

### Q1 — Never-empty behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Relax weakest dealbreaker, tell them | Auto-relax the most-eliminating dealbreaker, show closest + banner | |
| Show all cities ranked, dealbreakers as heavy penalty | Dealbreakers never hard-eliminate; big score penalty; list always full | ✓ |
| Show empty state with a fix prompt | Honest "no matches" + relax button | |

**User's choice:** Heavy penalty, never hard-delete.
**Notes:** Structurally guarantees the user is never stranded — no "relax the weakest" hack needed.

### Q2 — Advisory override (near-miss)

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — surface near-misses ("reconsider?") | "Austin would've been #1, your dealbreaker removed it. Reconsider?" | |
| Only surface when the list is empty | Intervene only at zero-results | |
| Never surface | Honor the filter silently | |
| **Other (user-authored)** | Interactive fact-citing re-confirm | ✓ |

**User's choice:** Free-text — don't say "reconsider"; ask conversationally with the concrete fact: *"Based on your answers Austin would be your top match. Austin's highest temperature is above 100°F. Is that still a dealbreaker for you?"*
**Notes:** Reconciles Q1+Q2 — penalty model + an interactive re-confirm that lifts the penalty if the user says the dealbreaker no longer applies. Requires city data to carry the specific fact (e.g. summerHighF), not just avgTemp. Captured as D-02.

---

## Financial model fidelity

### Q1 — Federal income tax

| Option | Description | Selected |
|--------|-------------|----------|
| Real 2025 federal brackets | Progressive brackets + standard deduction, pure offline TS | ✓ |
| Keep flat 22% | Fast effective-rate approximation | |
| Flat with per-band effective rate | Lookup of effective rates by income range | |

**User's choice:** Real progressive federal brackets + standard deduction.
**Notes:** Researcher must source the currently-applicable IRS table — don't hardcode a guess. Captured as D-07.

### Q2 — Model depth

| Option | Description | Selected |
|--------|-------------|----------|
| Bracket fed + flat state% + real FICA + cost-indexed expenses | Best accuracy-per-effort | ✓ |
| Maximal (state brackets, FICA cap, per-category expenses) | Most defensible, most build | |
| Document assumptions, keep prototype math | Cheapest, transparency over precision | |

**User's choice:** Bracketed fed + flat state% + real FICA 7.65% + cost-indexed expenses.
**Notes:** Maximal depth deferred post-pitch. Captured as D-08.

---

## Score explanation

### Q1 — "Why it scored" format

| Option | Description | Selected |
|--------|-------------|----------|
| Contribution bars, signed | Per-factor signed points (Cost +12 … dealbreaker −20) | ✓ |
| Ranked factor list, no bars | Ordered helped/hurt list | |
| One-line natural-language summary | Friendly sentence, hides math | |

**User's choice:** Signed contribution bars — **with the added requirement** that all weights/coefficients be centralized and easily tunable.
**Notes:** Major architectural ask: scoring magic numbers must live in one config so post-test tuning ("lifestyle outscoring cost") is a one-line change. Also noted the two-layer weighting (global config × per-person quiz weights) and that the "questionnaire to rank priorities" is already Phase 2's job. Captured as D-03, D-04, D-05.

### Q2 — Disclosure

| Option | Description | Selected |
|--------|-------------|----------|
| On expand | Score+city in list; breakdown+financials on tap | ✓ |
| Always visible on each card | Top factors inline | |
| Separate "why" view | Dedicated per-city screen | |

**User's choice:** On expand (matches SC2; reuses prototype `expandedSection`).
**Notes:** Captured as D-06.

---

## City dataset

### Q1 — Data home

| Option | Description | Selected |
|--------|-------------|----------|
| shared/data/cities.ts, typed to contract | Move out of JSX, add country + financialModelId | ✓ |
| Keep inline in component | Fastest, blocks engine import | |
| JSON loaded at runtime | Flexible, loses type-safety | |

**User's choice:** Move to `shared/data/cities.ts`, typed; expand well beyond 12.
**Notes:** Captured as D-09.

### Q2 — Coverage + dealbreaker facts

| Option | Description | Selected |
|--------|-------------|----------|
| Keep 12, enrich with dealbreaker facts | Quality over quantity | |
| Expand to ~20-25 cities | Wider, more impressive | ✓ |
| Keep 12, derive facts from existing fields | No new fields | |

**User's choice:** Expand to ~20-25; also floated "all cities / by state."

### Q3 (reconcile) — Scale vs timeline

| Option | Description | Selected |
|--------|-------------|----------|
| ~20-25 curated now, "all cities" deferred | Demoable + defensible; engine count-agnostic | ✓ |
| Go big now — dataset/API for many cities | Impressive, turns phase into data-engineering | |

**User's choice:** ~20-25 curated now; "all US cities via dataset/API" deferred post-pitch. Captured as D-10 + deferred idea.

### Q4 (reconcile) — Sourcing

| Option | Description | Selected |
|--------|-------------|----------|
| Researcher sources real, cited numbers | Attributable figures, judge-defensible | ✓ |
| Reasonable estimates, flagged approximate | Faster, weaker under scrutiny | |

**User's choice:** Researcher sources real, cited numbers + enriched dealbreaker-fact fields. Captured as D-11, D-12.

---

## Claude's Discretion

- Exact `shared/engine/` module layout
- Starting coefficient values in the scoring config (tunable by design)
- Sort/filter UI mechanics (MATCH-04)
- The specific ~20-25 cities chosen for geographic/cost spread

## Deferred Ideas

- Scale to "all US cities" via real dataset/API → post-pitch
- Maximal financial model (state brackets, FICA cap, per-category expenses) → post-pitch
- International cities + country financial models (FIN-02) → Phase 4
- Live-search reconciliation using tradeoffTolerance → Phase 5
