# Phase 6: Relocation Roadmap - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-05
**Phase:** 6-relocation-roadmap
**Areas discussed:** Personalization depth, Generation timing, Coverage + fallback, Visa-section depth

---

## Personalization depth

| Option | Description | Selected |
|--------|-------------|----------|
| Fully threaded | Template steps interpolate the user's actual engine numbers (savings→timeline, profession→jobs, housing pref→housing) | ✓ |
| Lightly threaded | Mostly generic per-pair; slots in a few headline personal facts | |
| Generic per-pair | Pure authored template, no per-user numbers | |

**User's choice:** Fully threaded (→ D-01)
**Notes:** Marquee pitch moment; engine already computes the data per user, available offline.

### Follow-up: negative/zero savings handling

| Option | Description | Selected |
|--------|-------------|----------|
| Honest reframe | No faked timeline; show the income/expense gap to close, pivot the step | ✓ |
| Generic fallback step | Swap in a generic move-fund step when savings ≤ 0 | |
| Assume a savings floor | Clamp to a small positive savings so a timeline always renders | |

**User's choice:** Honest reframe (→ D-02)
**Notes:** Consistent with the project-wide honesty boundary (Phase 12 D-01/D-07); a faked countdown is a Q&A liability.

---

## Generation timing

| Option | Description | Selected |
|--------|-------------|----------|
| Fully pre-baked, no LLM | Authored templates + render-time interpolation; zero network/LLM | |
| Optional live prose-enrich | Pre-baked offline default + optional LLM prose polish when hotspot is alive | ✓ |

**User's choice:** Optional live prose-enrich (→ D-03/D-04/D-05)
**Notes:** Critical path stays offline/deterministic; the enrich is an optional, non-blocking polish layer.

### Follow-up: enrich wiring

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse P5 proxy + bake into cache | Reuse Phase 5 /api proxy+cache+sanitize; capture script bakes polished prose into golden-path so offline shows the good version; LLM touches prose only | ✓ |
| Live-only enrich, no cache bake | Enrich live, fall back to raw authored prose offline | |
| Let research decide | Capture intent, defer mechanism | |

**User's choice:** Reuse P5 proxy + bake into cache (→ D-04/D-05)
**Notes:** No new backend; capture-time bake means the demo always shows polished prose even offline; live re-enrich is an on-stage flourish.

---

## Coverage + fallback

| Option | Description | Selected |
|--------|-------------|----------|
| Both demo cities + graceful fallback | Author persona → #1 US match AND Lisbon; uncovered pairs get a generic-but-real offline roadmap | ✓ |
| Intl wow pair only + fallback | Author only persona→Lisbon; all else generic fallback | |
| Both cities, hide if uncovered | Author both; hide/lock roadmap for uncovered pairs | |

**User's choice:** Both demo cities + graceful fallback (→ D-06/D-07)
**Notes:** Pins to the same persona+pair as the Phase 5 golden-path cache; app never dead-ends off-script.

---

## Visa-section depth

| Option | Description | Selected |
|--------|-------------|----------|
| Summary + Premium upsell teaser | Short authored visa summary + UPL line + pointer to Phase 7 Premium concierge | ✓ |
| Summary only, no upsell framing | Same summary, no Premium pointer | |
| Defer visa section entirely to P7 | Locked/'unlock with Premium' placeholder in P6 | |

**User's choice:** Summary + Premium upsell teaser (→ D-08)
**Notes:** Drives the Plus→Premium funnel; no duplication of Phase 7's deep build; inherits the VISA-04 UPL framing.

---

## Claude's Discretion

- Where the roadmap surfaces — dedicated `Roadmap` screen vs section in `CityDetail` (offered as a discussion option; user chose "I'm ready for context" and left it to the UI-phase + planner).
- `ROADMAP_TEMPLATES` module layout / location, the interpolation helper shape.
- Section ordering / visual treatment, PDF print-stylesheet fidelity, per-step citation density.
- Prose-enrich prompt + sanitize schema (reuse/extend Phase 5).

## Carried-forward defaults (stated, not re-discussed; user did not override)

- PDF export = `window.print()` + print CSS.
- Sources render as styled text, not clickable links (Phase 5 D-10 + see-not-click rule).
- Offline render mandatory (ROAD-03); enrich is the only online touch and is non-blocking + cached.
- Visa section inherits the UPL "informational only" framing (VISA-04).

## Deferred Ideas

- Full visa concierge (eligibility screener, pathway comparison, doc checklists, citations) → Phase 7 (Premium).
- Tier gate / paywall / unlock UI → Phase 8.
- Scaling the authored citizenship×country matrix beyond the demo pairs → post-pitch.
- Routine per-view live prose-enrich → post-pitch.
- **Open dependency:** the rehearsed demo persona's citizenship + #1 US city must be finalized before authoring the persona roadmaps and running the capture-time bake (shared blocker with Phase 5; Lisbon is the working intl assumption).
