# Phase 7: Visa Concierge - Context

**Gathered:** 2026-06-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the **Premium-tier visa concierge**: a silent eligibility screener that maps the user's existing Profile to likely visa pathways, a side-by-side pathway comparison for **Portugal D8 + Canada Express Entry**, per-pathway document checklists and cost/timeline figures **cited to official government sources** (AIMA, IRCC), and a UPL ("not legal advice") disclaimer + attorney-referral CTA on all immigration content. Delivers VISA-01..04.

Fills the already-locked `VisaPathway` contract (`shared/types.ts` lines 189–204). The contract shape is fixed; Phase 7 decides HOW to populate it, how the screener surfaces pathways, how fit is signaled within the UPL boundary, and how the comparison renders — not the type shape.

**Tier note:** the concierge is the **Premium** differentiator. The Plus-tier roadmap (Phase 6) already ships a short visa *teaser* that funnels here (Phase 6 D-08). The tier *gate* / paywall / unlock UI is **Phase 8's** job — Phase 7 builds the concierge surface itself, not the gating.

**Owns:** the authored `VisaPathway` content for the 2 required pathways, the silent screener logic that surfaces pathways from the Profile, the graded fit-signal computation, the dedicated Visa screen (side-by-side comparison + checklists + sources + disclaimer/CTA), and the off-script generic-skeleton fallback.

**Does NOT own:** the tier gate / paywall (Phase 8), the Plus-tier roadmap surface incl. its short visa teaser (Phase 6, already built — Phase 7 is the deep Premium build the teaser points to), the live-AI city data layer (Phase 5), the Profile capture (Phase 2 — Phase 7 *reads* `citizenship`/`immigrationStatus`/profession/finances, never re-collects them).

</domain>

<decisions>
## Implementation Decisions

### Screener inputs (VISA-01)
- **D-01: Silent screener — zero extra questions.** The eligibility screener runs entirely off the existing Profile (`citizenship`, `immigrationStatus`, profession, income/savings already captured in Phase 2). The user clicks into the concierge and instantly sees their pathways + fit — no visa-specific mini-quiz. Frictionless "magic" appropriate to a Premium tier; fully deterministic and offline-safe.
- **D-02: Pathways surface by citizenship + destination.** Which pathways appear is driven by the user's citizenship into their matched destination country/countries. Profession and finances do **not** filter pathways in or out — they instead feed the document checklist and "you'll need to show X" notes (e.g. proof-of-funds, remote-income evidence). No pathway is hidden on a fit guess the Profile can't fully verify — consistent with the project honesty boundary.

### Eligibility output & UPL framing (VISA-01 / VISA-04)
- **D-03: Graded likelihood fit signal.** Each surfaced pathway is tagged **Strong fit / Possible / Long shot** with the single gating factor named (e.g. "your remote income likely clears the D8 minimum", "Express Entry favors a younger applicant with a degree"). Framed explicitly as an **informational assessment, not a legal determination** — this is the judge-impressive "wow" while staying on the informational side of the UPL line. NOT a binary "you qualify/you don't" (too close to a legal determination), NOT a flat no-signal list.
- **D-04: Generic attorney-referral CTA + visible disclaimer (VISA-04).** All immigration content displays a visible "not legal advice — consult a licensed immigration attorney" disclaimer and an attorney-referral CTA. The CTA is a **generic, non-functional placeholder** for the demo ("Connect with a vetted immigration attorney") — satisfies VISA-04 with no real partner integration and minimal build. (Affiliate-revenue wiring of this CTA is a post-pitch/business-model concern, not built here.)

### Pathway set to author (VISA-02 / VISA-03)
- **D-05: Author the 2 required pathways only — deeply + citation-perfect.** Portugal D8 and Canada Express Entry, fully authored (requirements, processing time, fee range, document checklist, official sources), for the demo persona's outbound move. Tightest scope, every figure verifiable, no thin/uncited pathway. Pins to the same persona + international destination (Lisbon/Portugal) as the Phase 5 golden-path cache and Phase 6 roadmap. NOT a broad citizenship-keyed matrix (authoring/citation risk), NOT a US-inbound O-1A/H-1B pathway for v1 (different direction than the outbound demo persona; deferred — see Deferred Ideas).
- **D-06: Off-script destinations → generic honest skeleton.** When a user's matched destination has no authored pathway (judge picks an off-script persona), render a real, generic pathway scaffold — visa-category type, typical document-checklist headings, "verify current fees/timeline at [official source]" — with **no invented specifics and no fake numbers**. Never dead-ends, stays honest. Direct mirror of Phase 6 D-07's generic-but-honest fallback roadmap.

### Surface & comparison UX (VISA-02)
- **D-07: Dedicated Visa screen, side-by-side comparison.** A full `Visa` screen (already named in the `src/` scaffold) reached from the Phase 6 roadmap's visa teaser **and** from results. Pathways render as a **true side-by-side comparison** (columns: visa type, requirements, processing time, fee range, pros/cons) with the graded fit badge (D-03) per column, plus the per-pathway document checklist + cited sources and the disclaimer/CTA (D-04). NOT stacked cards. (Exact column responsiveness on a laptop-width demo screen + visual treatment are UI-phase concerns.)

### Carried-forward defaults (locked, not re-discussed)
- **Authored truth only for legal/visa facts — never LLM-invented.** Inherits Phase 6 D-05 / ROAD-02 hard boundary: every requirement, fee, timeline, checklist item, and source is authored. No live-AI generation of visa facts. (An optional prose-smoothing enrich on non-factual framing *could* reuse Phase 5 infra, but is out of scope for v1 unless trivially free — facts stay authored regardless.)
- **Sources render as styled text, never clickable `<a>` links.** Inherits Phase 5 D-10 + the competition see-not-click rule. `officialSources` shown as source name/text.
- **"Data as of [date]" labeling (VISA-03).** Cited figures carry a visible "data as of [authoring date]" label, since the authored data is a point-in-time snapshot. The date is the authoring date.
- **Offline-mandatory render.** The concierge makes zero network calls on its critical path — fully deterministic, demo-safe on a dead hotspot, like the Phase 6 roadmap.

### Claude's Discretion (defer to UI-phase / research / planning)
- Comparison-table column layout + responsiveness on a battery laptop screen, and the visual treatment of the graded fit badge.
- Exact navigation/entry-point wiring from the roadmap visa teaser and results into the Visa screen.
- Per-figure citation density and how source attributions are visually attached to each datum.
- Where the authored `VISA_PATHWAYS` data module lives under `shared/data/` and the screener's interpolation/selection helper shape.
- Exact gating-factor logic that derives the Strong/Possible/Long-shot grade per pathway from the Profile (research the D8 income threshold + Express Entry CRS signals; author the thresholds, don't LLM them).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The contract being filled (the spine of this phase)
- `shared/types.ts` §"Visa concierge" (lines 189–204) — `VisaPathway` (`destinationCountry`, `visaType`, `requirements[]`, `processingTime`, `feeRangeUSD`, `pros[]`, `cons[]`, `documentChecklist[]`, `officialSources[]`). **The shape is LOCKED — populate it, do not redesign.** The trailing comment encodes VISA-03 (every figure cited to official source) and VISA-04 (informational only, never legal advice).
- `shared/types.ts` §"Profile" (lines ~52–56) — `citizenship`, `immigrationStatus`, `opennessToAbroad`; plus profession + income/savings fields. These are the silent-screener inputs (D-01/D-02). The screener READS these; Phase 2 owns capture.
- `shared/types.ts` §"Freemium tiers" (line ~204+) — `Tier` (`free|basic|plus|premium`): the concierge is the `premium` differentiator; gating is Phase 8.
- `shared/quiz-engine/questions.ts` lines 393–423 — the `citizenship` + `immigrationStatus` questions (the latter `showIf citizenship !== "US"`); subtext already says "Required for visa pathway recommendations." Confirms the Profile carries what the silent screener needs.

### Direct upstream dependency (Phase 6 — the teaser that funnels here)
- `.planning/phases/06-relocation-roadmap/06-CONTEXT.md` — **D-08** (Plus roadmap's short visa teaser → points to THIS Premium concierge; do not duplicate the deep build into Phase 6), **D-05** (LLM touches prose only, never legal/visa facts — the authored-truth boundary Phase 7 inherits), **D-07** (generic-but-honest offline fallback — mirrored here as D-06), **D-06** (golden-path persona + Lisbon pin — Phase 7 authors the same pair).

### Citation + offline + see-not-click patterns Phase 7 inherits
- `.planning/phases/05-proxy-live-ai-golden-path-cache/05-CONTEXT.md` — **D-10** (sources as text, never clickable links), D-08 (offline fallback visually invisible), D-01/D-02 (offline-safe golden path). The concierge is fully authored/offline, but the source-rendering + offline-demo discipline carries forward.

### Scope & requirements
- `.planning/ROADMAP.md` §"Phase 7: Visa Concierge" — goal + 4 success criteria (the verification target); `Depends on: Phase 6`; `UI hint: yes`.
- `.planning/REQUIREMENTS.md` — **VISA-01** (eligibility screener → pathways), **VISA-02** (comparison ≥ Portugal D8 + Canada Express Entry: type, requirements, time, fee, pros/cons), **VISA-03** (per-pathway doc checklist + cost/timeline, every figure cited to official source + "data as of [date]"), **VISA-04** (UPL boundary — informational only, attorney-referral CTA).
- `.planning/PROJECT.md` — win-#1 lens; demo constraints (no venue internet → hotspot, see-not-click links, battery-only); **Premium = immigration concierge leveraging founder's real F-1→OPT→O-1A/H-1B expertise** (the authenticity edge behind this phase).
- `STRUCTURE.md` — repo layout + contract-first rule (`shared/` = TS contract + authored data; `src/` = JSX UI).
- `src/README.md` — names the `Visa` screen in `src/screens/`; "never call `api.anthropic.com` directly"; port `potential_v2.jsx` visual identity.
- `.planning/phases/01-scaffold-port/01-CONTEXT.md` — locked stack/deploy (Vite + React, TS for `shared/`+`api/`, Vercel auto-deploy on `main`).

### Official source authorities (for the authored pathway data — VISA-03)
- **Portugal D8 (digital-nomad/remote-work visa):** AIMA (Agência para a Integração, Migrações e Asilo) / Portuguese consular sources — author income threshold, fees, processing time, document list from these.
- **Canada Express Entry:** IRCC (Immigration, Refugees and Citizenship Canada) — CRS factors, fees, processing time, document checklist.
- (Researcher should pull current figures from these `.gov`/official authorities and tag each with "data as of [date]".)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`VisaPathway` / `Tier` contract** (`shared/types.ts`) — already locked; implement against it, no contract design needed.
- **`Profile` + Phase 2 quiz output** — supplies `citizenship`, `immigrationStatus`, profession, income/savings the silent screener (D-01) reads entirely offline. No new capture.
- **`MatchResult` / matched destination** (Phase 3/4) — supplies the destination country the screener keys pathways against (D-02).
- **`src/screens/Visa.jsx` slot** — the dedicated screen is already named in the `src/` scaffold (D-07).
- **Phase 6 roadmap visa teaser** — the existing Plus-tier upsell hook that links into this concierge (Phase 6 D-08); Phase 7 is the link target.

### Established Patterns
- **Template-first / authored-truth, no invented legal facts** — the project-wide honesty boundary (Phase 6 D-05, ROAD-02, scoring engine). Visa facts are authored, never LLM-generated.
- **Generic-but-honest offline fallback** (Phase 6 D-07) — reused as D-06 for off-script destinations.
- **Source-as-text, never clickable** (Phase 5 D-10 + see-not-click rule).
- **Offline-mandatory critical path** (Phase 5/6) — concierge makes zero network calls.
- **Contract-first** (`STRUCTURE.md`): authored `VISA_PATHWAYS` data + screener logic in `shared/` (TS); Visa screen + comparison UI in `src/` (JSX).

### Integration Points
- New authored `VISA_PATHWAYS` data module (likely `shared/data/`), consumed by a screener helper that selects pathways by `Profile.citizenship` + matched destination and computes the graded fit (D-03).
- `src/screens/Visa.jsx` — side-by-side comparison surface, reachable from the Phase 6 roadmap teaser + results.
- Disclaimer/CTA component (D-04) rendered on all immigration content — may be a reusable component shared with Phase 6's visa teaser.

</code_context>

<specifics>
## Specific Ideas

- **Silent screener as the Premium "magic" moment** (D-01): clicking into the concierge and instantly seeing graded pathways — no extra quiz — is the premium-feeling payoff, and it's fully deterministic/offline so it never fails on stage.
- **Graded fit + named gating factor is the judge-impressive wow** (D-03): "Strong fit — your remote income likely clears the D8 minimum" reads as the tool *knowing the user's situation*, while "informational assessment, not a legal determination" keeps it defensible in Q&A — the exact founder-expertise angle that makes Premium authentic.
- **Citation-perfect on 2 pathways beats shallow on many** (D-05): the rubric scores citation quality directly; two deeply-sourced pathways (AIMA, IRCC) is more defensible than a broad thin matrix.
- **Off-script never dead-ends** (D-06): a judge picking an unexpected persona still gets a usable, honest skeleton — the same anti-dead-end discipline as the roadmap.

</specifics>

<deferred>
## Deferred Ideas

- **US-inbound pathway (O-1A / H-1B)** — Gabriel's real lived expertise; strong authenticity hook, but a different direction than the outbound demo persona and adds USCIS authoring/citation load. Deferred from v1 (could be a fast follow / post-pitch pathway, or added if a US-inbound persona becomes part of the demo script).
- **Citizenship-keyed pathway matrix** — authoring relevant routes for many citizenship×destination pairs. Same "more data" scaling story as the city dataset and the roadmap matrix; post-pitch.
- **Affiliate-wired attorney referral** — the generic CTA (D-04) is a placeholder; turning it into the live affiliate-revenue hook (the business model's recurring engine) is a monetization build, not a demo requirement.
- **Live-AI prose enrich on visa framing** — facts stay authored regardless (D-05 boundary); an optional prose-smoothing pass reusing Phase 5 infra is post-v1 if ever, and must never touch legal/visa facts.
- **Real-time visa-policy-change tracking** — already noted in REQUIREMENTS.md as a future Premium add-on / B2B value; out of scope here.

### Reviewed Todos (not folded)
None — no pending todos matched this phase.

</deferred>

---

*Phase: 07-visa-concierge*
*Context gathered: 2026-06-05*
