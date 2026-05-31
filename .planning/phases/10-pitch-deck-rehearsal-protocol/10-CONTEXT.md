# Phase 10: Pitch — Deck, Rehearsal & Protocol - Context

**Gathered:** 2026-05-31
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase produces the **presentation layer** of the pitch — turning the Phase 9 business-substance docs and the Phase 8 product demo into a rehearsed, timed, protocol-safe live performance. Specifically: the slide-by-slide deck content (PITCH-07), the ≥15-question Q&A bank (PITCH-08), and the protocol compliance checklist (PITCH-09), all authored as source-of-truth content under `pitch/deck/` and `pitch/`.

GSD authors the **content** (deck outline + speaker notes, Q&A bank, rehearsal/timing plan, protocol checklist). The actual Canva slide-building and rehearsing-aloud are human actions the team executes against these artifacts.

**Phase split (decided this session):** Phase 10 has a hard dependency on Phase 8 (live demo + fallback), and the product track is only at Phase 2. So the phase divides into:
- **Author-now (unblocked):** deck outline+notes, Q&A bank, protocol checklist — none require the live demo.
- **Rehearse-later (gated on Phase 8):** the three timed hotspot run-throughs landing 8:30–9:00 (success criterion 3) and final demo-slot timing — cannot complete until the demo exists.

</domain>

<decisions>
## Implementation Decisions

### Deck deliverable depth
- **D-01:** GSD authors an **outline + speaker notes** deck (NOT a full word-for-word script). Slide-by-slide: headline + key visuals + claim/number/source bullets, plus talking-point speaker notes the presenters flesh into their own voice. Chosen for faster production and more natural delivery; fits the two-presenter team.
- **D-02:** **Source attributions are source-tag-only** per claim bullet (not pre-scripted phrasing). Presenters phrase the audible attribution live in their own words; the citation source is flagged on each quantitative claim so none gets dropped. Backed by the Phase 9 hybrid claim/number/source tables as the rehearsal reference. (Note: success criterion 1 requires *audible source attributions for every quantitative claim* — every scored claim bullet MUST carry its source tag.)

### Time budget across the arc
- **D-03:** **Fix the business arc, float the demo.** Budget the eight non-demo arc sections (problem → market → solution → differentiation → model → financials → marketing → ask) to a stable **~6:00 total** — knowable now from the Phase 9 docs.
- **D-04:** The **live demo gets a flexible slot with a ~2:30 planning target**, explicitly marked compressible to ~1:30 and expandable to ~3:00. This yields a 7:30–9:00 envelope before the demo is even built, so the deck needs no rework when timing firms up. Rationale: 4 of 6 scored rubric dimensions are business substance (demo proves the product is real, it doesn't need to carry the score), and every extra second of live demo is extra exposure to a hotspot/API failure mid-pitch.
- **D-05:** Hard cap is ≤10:00 (PITCH-07); target band for the three timed run-throughs is **8:30–9:00** (success criterion 3).

### Q&A bank & rehearsal
- **D-06:** Q&A bank = **15+ entries as bullets + source tag** (question + 2–4 talking-point bullets + source tag(s)), consistent with the source-tag-only deck style. Must cover: data accuracy, CAC/LTV, legal-advice avoidance, competitive moat, API-failure resilience, and the "wasn't Teleport doing this?" question.
- **D-07:** Q&A is **routed by domain** but both presenters rehearse the full bank so either can field anything: visa/legal-advice and demo/API-resilience → Gabriel; market/financials/CAC-LTV/Teleport → Luke.

### Presenters & rehearsal structure
- **D-08:** **Two-person team — Luke and Gabriel** (team-with-handoffs). Deck speaker notes carry **speaker labels + explicit handoff cues**.
- **D-09:** Split is **soft-narrative vs hard-numbers**:
  - **Luke** — intro, problem/market/solution framing, business & pricing model, marketing/growth, the ask.
  - **Gabriel** — financials (CAC/LTV/break-even), legalities (legal-advice avoidance + visa/immigration concierge), data-defense in Q&A.
  - **Demo** — assumed driven by Gabriel (technical/visa-adjacent live-AI hotspot); the one handoff to confirm at rehearsal.
- **D-10:** Rehearsal (gated on Phase 8) = solo/paired timed run-throughs on phone hotspot + a mock-judge drilling the Q&A bank; the section split can be rebalanced then.

### Protocol compliance (PITCH-09)
- **D-11:** Authored now as a verification checklist (unblocked): within time, no judge-clicked links/QR on any device screen, no external speakers, max two devices (one facing judges), runs on battery, nothing physical left with judges, dress code met. Verified at rehearsal.

### Claude's Discretion
- Exact slide count and per-slide visual treatment, the precise wording of speaker-note talking points, the specific 15+ Q&A questions chosen beyond the mandated topics, and the internal section-by-section sub-timing within the ~6:00 business arc — left to the researcher/planner, provided every quantitative claim carries a source tag and the arc order is preserved.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pitch source content (what the deck/Q&A is built FROM — read first)
- `pitch/market-research.md` — PITCH-01/02: bottom-up TAM→SAM→SOM + competitive positioning (Nomad List / WhereNext / Teleport→Topia) + three differentiators. Source of market/problem/differentiation slides + Q&A.
- `pitch/business-model.md` — PITCH-03/04/06: run-based pricing ($0.99/$9.99/$29.99, no subscription), value prop, conversion funnel, four marketing channels with per-channel CAC. Source of business-model/pricing/marketing slides (Luke's sections).
- `pitch/financials/model.csv` + `pitch/financials/summary.md` — PITCH-05: 24-month base-case model, per-channel CAC, LTV by tier, break-even ~Month 3–4. Source of financials slides + Q&A defense (Gabriel's sections).
- `pitch/README.md` — rubric→doc mapping + non-negotiables (cite everything; verify visa figures against official gov sources).
- `pitch/deck/README.md` — `pitch/deck/` is the deck source-of-truth target (Canva exports + this phase's outline/notes land here).

### Phase 9 decisions feeding the deck format
- `.planning/phases/09-pitch-business-substance/09-CONTEXT.md` — hybrid claim/number/source table format (D-01) chosen specifically to drop into Canva + the Q&A bank. The 7 founder-verify flags (F1–F7) on live-source confirmation must be cleared before pitch day.

### Project decisions & requirements
- `.planning/PROJECT.md` §Key Decisions — revised pricing, 16P analog, visa-concierge moat, Plus-as-upsell, "win #1" priority lens, deck-built-in-Canva, hotspot demo + golden-path fallback.
- `.planning/REQUIREMENTS.md` — PITCH-07 (deck/presentation), PITCH-08 (Q&A bank), PITCH-09 (protocol checklist).
- `.planning/ROADMAP.md` §Phase 10 — success criteria + narrative arc; §Phase 8 — demo + fallback this phase depends on.

### Competition rules (rubric, protocol, source-citation requirement — scored directly)
- `Entrepreneurship Pitch Competition.pdf` (repo root) — 120-point rubric, Sources row scored directly, protocol checklist (links/QR, devices, battery, time, dress code), 10-min + 5-min Q&A structure.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- This is a content/presentation phase — no application code is produced. Authoring targets: `pitch/deck/` (outline + speaker notes), `pitch/` (Q&A bank, protocol checklist, rehearsal plan).
- Phase 9 outputs (`pitch/market-research.md`, `pitch/business-model.md`, `pitch/financials/`) are the source material; their hybrid claim/number/source tables map directly to slide bullets and Q&A source tags.

### Established Patterns
- Three-track repo structure gives the pitch track its own `pitch/` folder; Phase 10 commits land in `pitch/` and `.planning/`.
- Deck built in **Canva**; raw content/sources stay in `pitch/` as the source of truth (PROJECT decision).

### Integration Points
- **Depends on Phase 8** (live demo + confirmed fallback) for the timed run-throughs and final demo-slot timing — currently unbuilt (product track at Phase 2). The author-now / rehearse-later split (see Phase Boundary) is the structural response.
- Source-tag-only attribution (D-02) leans on the Phase 9 tables; if those tables move/change, the deck source tags must stay in sync.

</code_context>

<specifics>
## Specific Ideas

- **Two named presenters: Luke and Gabriel**, split soft-narrative (Luke) vs hard-numbers/legalities (Gabriel). This drives speaker labels + handoff cues throughout the deck notes.
- The **"wasn't Teleport doing this?" rebuttal** and the **legal-advice-avoidance** answer are the highest-stakes Q&A items — both must be airtight; the Teleport answer ties to the B2B "scaling story" and the legal answer to the "not legal advice — consult an attorney" disclaimer + Gabriel's lived immigration expertise.
- Founder (Gabriel) lived immigration expertise (F-1 → OPT → O-1A/H-1B) makes the visa concierge segment and its Q&A authentic and defensible — he owns that section.

</specifics>

<deferred>
## Deferred Ideas

- **Three timed hotspot run-throughs (8:30–9:00) + final demo-slot timing** — NOT deferred out of the phase, but **gated on Phase 8**. Tracked as the rehearse-later half of Phase 10; cannot start until the live demo exists.
- **Demo ownership confirmation** (assumed Gabriel) — resolve at rehearsal once the demo is built.
- **Full word-for-word script** — considered and declined in favor of outline + notes (D-01); could be revisited per-slide for the highest-stakes moments if rehearsal exposes fumbling.
- **Pre-written attribution phrasing / dedicated sources cheat-sheet** — considered (D-02) and declined in favor of source-tag-only; the Phase 9 tables serve as the memorization reference.

None of the above expand Phase 10 scope — discussion stayed within deck/Q&A/rehearsal/protocol.

</deferred>

---

*Phase: 10-pitch-deck-rehearsal-protocol*
*Context gathered: 2026-05-31*
