# Phase 7: Visa Concierge - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-05
**Phase:** 07-visa-concierge
**Areas discussed:** Screener inputs, Eligibility output & UPL line, Pathway set to author, Surface & comparison UX

---

## Screener inputs

| Option | Description | Selected |
|--------|-------------|----------|
| Silent, zero extra Qs | Run entirely off existing Profile; instant pathways + fit. Frictionless, coarser matching. | ✓ |
| 3–4 visa-specific Qs | Short premium mini-screener (funds, degree, job offer, remote income). Sharper, more friction. | |
| Hybrid: infer + confirm | Pre-fill from Profile, ask only 1–2 visa-gating facts. | |

**User's choice:** Silent, zero extra questions.
**Notes:** Frictionless "magic" prioritized for the Premium tier; fully deterministic + offline.

### Follow-up: what drives which pathways surface?

| Option | Description | Selected |
|--------|-------------|----------|
| Citizenship + destination | Surface pathways for citizenship→destination; profession/finances feed checklist + notes, never filter. | ✓ |
| Also pre-filter on fit | Hide/down-rank pathways the Profile clearly fails. Sharper but can hide an actually-open route. | |
| You decide | Defer to research/planning. | |

**User's choice:** Citizenship + destination.
**Notes:** No pathway hidden on a fit guess the Profile can't fully verify — stays honest.

---

## Eligibility output & UPL line

| Option | Description | Selected |
|--------|-------------|----------|
| Graded likelihood | Strong fit / Possible / Long shot + named gating factor; framed informational. Judge-impressive. | ✓ |
| Neutral, no fit claim | Facts only, no qualify/disqualify. Safest on UPL, flatter. | |
| Binary eligible/not | Hard qualify/don't. Strongest claim, highest UPL risk. | |

**User's choice:** Graded likelihood.
**Notes:** Frames as informational assessment, not a legal determination — defensible in Q&A.

### Follow-up: attorney-referral CTA (VISA-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Generic referral CTA | "Consult a licensed attorney" + placeholder referral button. Satisfies VISA-04, small build. | ✓ |
| Affiliate-framed CTA | Same CTA framed as the affiliate-revenue hook from the business model. | |
| You decide | Defer to planning. | |

**User's choice:** Generic referral CTA (placeholder, non-functional).
**Notes:** Affiliate wiring deferred to post-pitch monetization.

---

## Pathway set to author

| Option | Description | Selected |
|--------|-------------|----------|
| The 2 required only | Portugal D8 + Canada Express Entry, deep + citation-perfect. Tightest scope, lowest risk. | ✓ |
| 2 required + US-inbound | Add O-1A/H-1B (founder's lived edge). Different direction, more citation load. | |
| Citizenship-keyed set | Small matrix for more personas. Most flexible, most authoring/citation work. | |

**User's choice:** The 2 required only.
**Notes:** Pinned to the Phase 5/6 golden-path (Lisbon/Portugal). US-inbound deferred.

### Follow-up: off-script destination handling

| Option | Description | Selected |
|--------|-------------|----------|
| Generic honest skeleton | Real generic scaffold, no invented specifics, points to official source. Never dead-ends. | ✓ |
| Steer to covered routes | Surface the 2 authored as "fully mapped." Can feel like bait-and-switch. | |
| Honest "not yet mapped" | Clear coming-soon + general category + source. Truthful, least impressive. | |

**User's choice:** Generic honest skeleton.
**Notes:** Direct mirror of Phase 6 D-07 fallback roadmap.

---

## Surface & comparison UX

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated screen, side-by-side | Full Visa screen; true side-by-side comparison columns + fit badge per column. | ✓ |
| Dedicated screen, stacked cards | Same screen, expandable cards. Easier responsive, less at-a-glance. | |
| You decide | Defer layout to UI-phase. | |

**User's choice:** Dedicated screen, side-by-side comparison.
**Notes:** Reached from the Phase 6 roadmap visa teaser + results. Column responsiveness on a laptop-width demo screen left to UI-phase.

---

## Claude's Discretion

- Comparison-table column layout + responsiveness; fit-badge visual treatment.
- Navigation/entry-point wiring from roadmap teaser + results into the Visa screen.
- Per-figure citation density + how attributions attach to each datum.
- `VISA_PATHWAYS` data module location under `shared/data/` + screener helper shape.
- Gating-factor logic deriving Strong/Possible/Long-shot from the Profile (author thresholds from official sources, don't LLM them).

## Deferred Ideas

- US-inbound pathway (O-1A / H-1B) — founder's expertise; v2/fast-follow.
- Citizenship-keyed pathway matrix — post-pitch scaling.
- Affiliate-wired attorney referral — post-pitch monetization.
- Live-AI prose enrich on visa framing — facts stay authored regardless.
- Real-time visa-policy-change tracking — future Premium/B2B (already in REQUIREMENTS.md).
