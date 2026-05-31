# Phase 2: Quiz & Profile Capture - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-30
**Phase:** 02-quiz-profile-capture
**Areas discussed:** Immigration taxonomy, Quiz flow/rebuild, Openness=0 behavior, Hard dealbreakers, Tension capture

---

## Area selection

User selected all 4 proposed areas plus added a 5th via free text: capturing "challenges that the person wants to avoid" and an adaptive quiz that detects tension between competing preferences (e.g. nature-lover who also wants career growth). Folded in as the Tension area.

---

## Immigration & citizenship taxonomy

### Citizenship capture

| Option | Description | Selected |
|--------|-------------|----------|
| Full country dropdown | All ~195 countries, stored as code | |
| Curated shortlist + Other | US + common citizenships + Other | ✓ |
| US citizen yes/no + country | Single yes/no | |

### Status enum granularity

| Option | Description | Selected |
|--------|-------------|----------|
| Detailed, pathway-aware | Citizen / PR / Work visa / Student / Other / None | (reframed) |
| Lean 5-value enum | Simpler 5 values | |
| You decide labels | Lock principle, planner finalizes | |

**User's choice:** Reframed the whole area. Market = US citizens (primary). Citizenship = shortlist of US + most common destination countries US citizens go to. Immigration status: US citizens have no visa restrictions on themselves — the valuable angle is **destination-side**: what restrictions/cultural/federal difficulties Americans face moving to a given country. Wants a **PLUS/MINUS analysis per country**, possibly a **cultural-analysis add-on product**.

**Notes:** Resolved with a follow-up — Phase 2 keeps capture light: citizenship picker (default US), `immigrationStatus` auto="citizen" for US, short enum only for non-US. PLUS/MINUS + cultural analysis routed downstream (Phase 4 data, Phase 7 `VisaPathway` pros/cons, Phase 9 business-model add-on).

### Capture weight (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| Citizenship picker, status auto | Default US, status auto="citizen", enum only for non-US | ✓ |
| Always ask both | Explicit status for everyone | |
| Drop status entirely | Citizenship only, hardcode citizen | |

---

## Quiz flow / rebuild

| Option | Description | Selected |
|--------|-------------|----------|
| New "Going Global" step | One dedicated step; tradeoffs fold into Priorities | (superseded) |
| Fold into existing steps | No new step, stay at 5 | |
| Two new steps | Separate abroad + tradeoffs steps | |

**User's choice:** Superseded the step-layout question — wants to **restructure/rebuild the quiz to be deeper with actual logic**. "Almost rebuilding the base." The prototype is a good first pass to show the idea, but needs real logic behind it.

**Notes:** Resolved with two follow-ups:

### Quiz depth

| Option | Description | Selected |
|--------|-------------|----------|
| Richer + adaptive | Deeper dimensions + branching follow-ups + tension detection | ✓ |
| Richer, still linear | Deeper dimensions, no branching | |
| Full adaptive engine | Config/schema-driven weighting engine | |

### Logic line

| Option | Description | Selected |
|--------|-------------|----------|
| Profile carries weights, matching=P3 | Phase 2 emits weighted preference profile; P3 scores | ✓ |
| Pull matching into Phase 2 | Build scoring here too | |
| Capture only, no derived weights | Raw answers only, all interpretation in P3 | |

---

## Openness=0 behavior

| Option | Description | Selected |
|--------|-------------|----------|
| 0 = exclude international | Hard filter at slider bottom | ✓ |
| 0 = heavy down-weight, still visible | Roadmap's locked default | |

**User's choice:** 0 = exclude international.
**Notes:** Slider format itself was locked (SC2 + types.ts) and not re-asked.

---

## Hard dealbreakers

| Option | Description | Selected |
|--------|-------------|----------|
| Two explicit tiers, user chooses | Hard deal-breakers vs soft preferences | (informed) |
| Designer-fixed split | We decide hard vs soft | |
| All selected are hard | Every dealbreaker eliminates | |

**User's choice:** Hard filters that count, BUT with advisory guardrails — never let the user remove all options. Warn that dealbreakers may remove good options. Tool is advisory: if a dealbreaker excludes what would be a perfect match, advise against the dealbreaker. Requested competitor research on how similar products handle this. Must be safe against an empty result set.

**Notes:** Captured as hard filters + 4 guardrails (capture warning P2; never-empty floor P3; advisory override P3; research directive). Capture-vs-consume split recorded so Phase 3 inherits matching guardrails.

---

## Tension capture

| Option | Description | Selected |
|--------|-------------|----------|
| Ask reconciling question, store tiebreaker | Detect tension → follow-up → weight on profile | ✓ |
| Flag tension, store both equally | Push to results screen | |
| One global tradeoff-tolerance question | Single rigid→flexible question | |

**User's choice:** Ask a reconciling question, store a tiebreaker weight on the preference profile.
**Notes:** Phase 3 ranks balancing cities; Phase 5 does the live-search reconciliation.

---

## Claude's Discretion

- Exact enum strings (status, timeline buckets), the ~10-citizenship shortlist, and the internal derived-weights structure — planner finalizes against Phase 3/6/7 needs.

## Deferred Ideas

- PLUS/MINUS per-country analysis → Phase 4 + Phase 7.
- Cultural-analysis add-on product → Phase 9 (business model).
- Live-search reconciliation of competing priorities → Phase 5.
- Full schema-driven adaptive quiz engine → considered, not chosen (build-cost vs pitch-prep risk); revisit post-competition.
