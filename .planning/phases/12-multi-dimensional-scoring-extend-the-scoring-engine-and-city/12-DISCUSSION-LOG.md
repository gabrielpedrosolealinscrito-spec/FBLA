# Phase 12: Multi-Dimensional Scoring - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-03
**Phase:** 12-multi-dimensional-scoring-extend-the-scoring-engine-and-city
**Areas discussed:** Scoring vs display split, Score stability, Missing-data behavior, Disaster-risk treatment

---

## Scoring vs display split

### Q1 — Which new categories should MOVE the match score?

| Option | Description | Selected |
|--------|-------------|----------|
| Healthcare | Numbeo Health Care Index, 22/22, gated by healthcare weight + module flags | ✓ |
| Schools (K-12) | NAEP G8 reading, state-level; meaningful only for users with kids | ✓ |
| Childcare cost | CCAoA $/yr, state-level; bites only for young-kids users | ✓ |
| Air connectivity | FAA hub class, 22/22; "can I fly home" — relevant for immigrant audience | ✓ |

**User's choice:** All four, plus free-text: "Much more as well, especially dependent on what the person chooses. like active lifestyle gym, country clubs, parks matters as well."
**Notes:** Reframed the principle to "score everything the person weights, where defensible cited data exists." Flagged that gyms/country-clubs have no sourced data.

### Q2 — How to handle lifestyle facets with no sourced data (gyms, country clubs)?

| Option | Description | Selected |
|--------|-------------|----------|
| Defer, score parks/outdoors now | Score outdoors via ParkScore + nearMountains/nearCoast; defer amenities | |
| Approximate via lifestyle tags | Soft proxy via existing vibe tags / walkScore | |
| Source amenity data in-phase | Pull real amenity dataset; expands scope | |
| AI research at results-time | (User's idea) research live rather than a static DB | ✓ |

**User's choice:** Free-text: "Can't we make this 'research' part something that an AI would run at the results based on results rather than having a DB?"
**Notes:** Routed to the existing Phase 5 live-AI layer. Flagged the defensibility tradeoff (AI-guessed numbers vs. cited data).

### Q3 — How do AI-researched amenity scores relate to the cited match score?

| Option | Description | Selected |
|--------|-------------|----------|
| Separate labeled layer | Cited data = headline; AI amenities = labeled enrichment beside it | ✓ |
| Folded into one score | AI categories feed the same number; raises Q&A risk | |
| Just build the seam, decide later | Engine accepts injected scores; placement decided in Phase 5 | |

**User's choice:** "Yeah, do it separate where the ai PART would be extra, a new tier."
**Notes:** "New tier" aligns with the Plus/premium tier (live AI = paid layer). Phase 12 builds the seam; Phase 5 fills it.

---

## Score stability

### Q1 — Constraint on recalibration when new dimensions shift existing scores?

| Option | Description | Selected |
|--------|-------------|----------|
| Rankings can shift freely | Let new dimensions change order + numbers; most honest | ✓ |
| Numbers shift, top picks stay | Recalibrate so known strong cities stay near top | |
| Pin specific demo cities | Fixed demo anchors must land predictably | |

**User's choice:** Rankings can shift freely.
**Notes:** Honesty over demo-stability. The clamp BLOCKER (BASE_SCORE + Σ caps < 99, assert displayed score) remains a locked constraint; recalibration math is planner's discretion.

---

## Missing-data behavior

### Q1 — Behavior when a city lacks a datum for a scored category?

| Option | Description | Selected |
|--------|-------------|----------|
| Proxy fallback, then neutral | Best proxy first (parks → nearMountains/nearCoast); else exclude from that city's score | ✓ |
| Neutral, no proxy | Missing = excluded, no proxy used | |
| Hide the category entirely | Drop category from UI for affected cities | |

**User's choice:** Proxy fallback, then neutral.

### Q2 — How to handle state-level schools/childcare data?

| Option | Description | Selected |
|--------|-------------|----------|
| Score it, label "state average" | Feeds score (cross-state signal), labeled clearly | ✓ |
| Display only, don't score | Context only; loses cross-state signal | |
| You decide | Planner picks, default to score-with-labeling | |

**User's choice:** Score it, label "state average."

---

## Disaster-risk treatment

### Q1 — How to treat FEMA disaster risk (composite barely discriminates)?

| Option | Description | Selected |
|--------|-------------|----------|
| Re-source per-hazard, then score | Pull FEMA per-hazard sub-scores; expands scope | |
| Composite as display-only | Labeled FEMA context, doesn't move score; zero extra sourcing | ✓ |
| Drop disaster from scoring | Don't score or prominently display | |

**User's choice:** Composite as display-only.
**Notes:** `disasterRiskConcern` quiz field won't drive a weighted score this cycle (at most a future soft filter).

---

## Claude's Discretion

- Exact recalibration math for the clamp constraint (proportional renorm vs. shrink-caps vs. lower BASE_SCORE).
- Final WEIGHT_FLOOR / two-tier swing values.
- Per-category [0,1] normalization formulas.
- Exact shape of the external-injection seam for the live-AI tier.
- Whether childcare folds into the financial model vs. the match score (defaults to match score).

## Deferred Ideas

- Live-AI amenity research (gyms, country clubs, niche amenities) as a premium/Plus extra tier → Phase 5.
- FEMA per-hazard sub-score re-sourcing → deferred this cycle.
- `disasterRiskConcern` as a soft filter/sort → future.
- D-02 open reconciliation (Phase 11 personality weighting vs. Phase 2 importanceRank) → resolve at Phase 2 integration.
