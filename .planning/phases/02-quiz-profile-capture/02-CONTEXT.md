# Phase 2: Quiz & Profile Capture - Context

**Gathered:** 2026-05-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild the profile-capture layer into a **real, deeper, adaptive quiz** — not an extension of the prototype's 5-step demo. The existing quiz in `src/screens/PotentialApp.jsx` was a first-pass "show the idea" prototype; this phase replaces it with a richer instrument backed by actual logic.

The quiz must capture every field downstream phases key off, and produce a **structured preference profile** (raw answers + derived weights + tradeoff tolerances) as its output. Delivers QUIZ-01..05.

**Owns:** the quiz UI/flow, the adaptive/branching logic, validation, and the expanded `Profile` contract (the capture layer + the preference profile it emits).

**Does NOT own:** city scoring/ranking (Phase 3), international city data (Phase 4), live AI search (Phase 5). The hard line: **Phase 2 turns answers into a weighted preference profile; Phase 3 scores cities against it.**
</domain>

<decisions>
## Implementation Decisions

### Quiz rebuild (the defining decision)
- **D-01:** Treat this phase as a **rebuild of the capture layer**, not a bolt-on. The prototype quiz is reference, not a base to extend. Build "something for real with actual logic behind it."
- **D-02:** **Richer + adaptive.** Add deeper capture dimensions beyond the prototype's career/finances/background/lifestyle/priorities: **motivation to move, work style, community/family needs, pace of life, risk tolerance, and tradeoff tolerance.**
- **D-03:** **Conditional / branching follow-ups** — questions adapt based on prior answers, including detecting conflicting priorities (see Tension). Linear prototype → smart tree.
- **D-04:** **Output = structured preference profile.** Phase 2 turns answers into weights / tradeoff tolerances / derived attributes carried on the `Profile`. Phase 3 consumes that profile to score cities. The "real logic" lives in the profile, not the matcher.
- **D-05:** This **expands `shared/types.ts` `Profile`** significantly. Planner extends the contract (new dimension fields + a derived-weights/preference structure). Reconcile the in-component prototype state with the TS contract as part of the rebuild.
- **D-06 (design note):** Make the international angle a **visible demo moment** — a "Going Global" grouping for openness-to-abroad + citizenship/status + move timeline. Onboarding is the product; this is a differentiator on stage.

### Immigration & citizenship capture (QUIZ-03)
- **D-07:** **Primary market = US citizens.** Capture flips from "what restrictions are on you" (≈none for US citizens) to "what a US citizen faces moving abroad."
- **D-08:** **Citizenship** = curated **shortlist** (US + ~10 common destination-relevant citizenships + "Other"), **defaults to US**, stored as a **structured value** (not free text). Required: Phase 6 keys `ROADMAP_TEMPLATES[citizenship][country]` and Phase 7 maps pathways off it. Unsupported combos fall back to a generic roadmap downstream.
- **D-09:** **`immigrationStatus`** auto-sets to `"citizen"` for US citizens (question not shown). Only non-US citizens see a short status enum. Keeps the flow fast for the core market while keeping the contract populated. **SC3 note:** every user *declares citizenship*; status is *auto-derived* for US citizens and explicitly declared by non-US citizens — this satisfies QUIZ-03 / SC3 even though the majority path never sees a status question.

### Openness to abroad (QUIZ-02)
- **D-10:** Slider format is **locked** (0–100, per SC2 + `types.ts`). Bottom of slider (**0) = hard-exclude international** entirely; mid/high values weight international up. (The scoring math itself defers to Phase 3.) **SC2 note:** exclusion is the strongest form of "weight down," so this satisfies SC2's "weight international up or down." Behavior is **not testable until Phase 4** introduces international cities — verifying SC2 in Phase 2 can only confirm the value is captured + passed to the engine.

### Dealbreakers (QUIZ-04)
- **D-11:** Dealbreakers are **hard filters** that eliminate cities — satisfying QUIZ-04's "eliminate, not just soft-weight." But the tool is **advisory and must never strand the user.** Guardrails:
  - **Capture-time warning (Phase 2):** tell the user dealbreakers can remove a lot of good options.
  - **Never-empty floor (Phase 3):** matching must never return zero cities — relax/surface rather than wipe the list.
  - **Advisory override (Phase 3):** if a dealbreaker eliminated what would otherwise be the top match, surface it — "your X dealbreaker removed your best fit; reconsider?"
- **D-12:** Wire **all** current dealbreakers. The prototype lists 10 in `DEAL_BREAKERS` but `getMatchScore` only handles 6 — "Must be near mountains", "Must be near ocean/coast", "Need international airport", "Must have strong job market in my field" are currently selectable no-ops. None should stay inert.
- **D-13 (research directive):** Before finalizing dealbreaker/filter UX, research how comparable products (Nomad List, WhereNext, Teleport legacy) handle hard filters vs advisory matching. Don't reinvent badly.

### Tension / tradeoff reconciliation (the adaptive payoff)
- **D-14:** When the quiz detects **conflicting priorities** (e.g. loves nature + wants career growth), **ask one reconciling follow-up** ("these pull apart — if you had to lean, which wins?") and **store the answer as a tiebreaker/weight** on the preference profile.
- **D-15:** Phase 3 uses that tiebreaker to rank cities that **balance** competing priorities. The "proactively search the city to reconcile" experience is **Phase 5** (live AI) — not built here.

### Move timeline (QUIZ-05)
- **D-16:** Capture a move timeline field (e.g. `6mo` / `12mo` / `2yr+` / `exploring — no timeline`) inside the "Going Global" grouping. Straightforward field; no open decision.

### Claude's Discretion
- Exact enum string values (status enum, timeline buckets), the precise shortlist of ~10 citizenships, and the internal shape of the derived-weights structure — planner finalizes against Phase 3/6/7 needs, keeping everything structured.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The contract being extended
- `shared/types.ts` — the `Profile` interface (and `Housing`, `Tier`, etc.). Phase 2 extends `Profile` with the new dimensions + a derived preference/weights structure. This is the frontend↔engine handshake.
- `shared/data/constants.js` — `PROFESSION_CATEGORIES`, `BASE_SALARIES`, `LIFESTYLE_TAGS`, `DEAL_BREAKERS`. The quiz's existing option sets; the rebuild expands/replaces these.

### The prototype being rebuilt (reference, not a base)
- `src/screens/PotentialApp.jsx` — current 5-step quiz (`step`/`profileStep` state, `upd`/`toggleArr` helpers, `getMatchScore` showing current soft-dealbreaker handling). Visual identity to preserve; capture logic to replace.

### Project intent & scope
- `.planning/PROJECT.md` — locked decisions; core value "win #1 — pitch substance wins ties"; immigration concierge as premium differentiator.
- `.planning/REQUIREMENTS.md` — QUIZ-01..05 (this phase) and how Profile fields feed MATCH/FIN/ROAD/VISA downstream.
- `.planning/ROADMAP.md` — Phase 2 goal + success criteria; the slice boundaries (P3 matching, P4 intl, P5 live AI, P6 roadmap, P7 visa).
- `STRUCTURE.md` — repo layout, folder ownership, contract-first rule (`src/` JSX, `shared/` TS contract+data).

### Carried-forward stack decisions
- `.planning/phases/01-scaffold-port/01-CONTEXT.md` — locked: Vite + React, TS for `shared/`+`api/` / JSX for `src/`, port-don't-redesign visual identity, inline-style dark theme.
- `.planning/research/STACK.md`, `.planning/research/ARCHITECTURE.md` — Phase 1 research (component boundaries, build order).
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`PotentialApp.jsx` quiz scaffolding** — `step`/`profileStep` state machine, progress bar, `goProfile`/`goStep` transitions, `upd(k,v)` and `toggleArr(key,val,max)` helpers, and the styled primitives (`pill`, `inputStyle`, `btnPrimary`, `fadeIn`, `label`, sliders). Reuse the visual/interaction primitives; replace the question content + flow logic.
- **`constants.js` option sets** — professions, base salaries, lifestyle tags, dealbreakers. Extend/restructure for the deeper dimensions.

### Established Patterns
- **Contract-first:** `src/` imports types from `shared/types.ts`; the Profile is the boundary. Extend the contract in small announced commits.
- **In-component profile state diverges from the contract:** prototype `profile` useState carries extras NOT in `types.ts` — `name`, `customProfession`, `petType`, `color`. Reconcile during the rebuild: decide keep-or-drop for each (record the decision so the planner isn't guessing — likely keep `customProfession` folded into `profession`, keep pet detail, drop `color`).
- **Dealbreakers currently soft:** `getMatchScore` applies `-25`/`-30` penalties — Phase 2 reclassifies dealbreakers as hard filters and Phase 3 inherits the never-empty/advisory guardrails.
- **Styling:** inline-style dark theme (Instrument Serif / Manrope / JetBrains Mono via `index.html`). No redesign; preserve identity (Phase 1 lock).

### Integration Points
- Quiz `Profile` output → Phase 3 `shared/engine/` scoring (MATCH-01).
- `citizenship` + `immigrationStatus` → Phase 6 `ROADMAP_TEMPLATES[citizenship][country]` and Phase 7 eligibility screener / `VisaPathway`.
- `opennessToAbroad` → Phase 3 weighting + (at 0) international exclusion; international cities themselves arrive Phase 4.
</code_context>

<specifics>
## Specific Ideas

- **"Going Global" demo moment:** group abroad-openness + citizenship/status + move timeline into a visible, narratively distinct step that showcases the international/visa differentiator on stage.
- **Advisory-not-dogmatic tool:** the product's stance is "best advice." A dealbreaker that would exclude a perfect-fit city should trigger a "you excluded your best match — reconsider?" surface (Phase 3), never a silent empty result.
- **Tension reconciliation as the adaptive showcase:** the quiz noticing "you want nature AND career growth — which leans?" is the moment that proves "real logic," and sets up Phase 5's live-search reconciliation.
</specifics>

<deferred>
## Deferred Ideas

- **PLUS/MINUS per-country analysis** (federal requirements for Americans, cultural differences, "unhidden rules," difficulty of the move) → **Phase 4** (country data sourcing) + **Phase 7** (`VisaPathway.pros[]`/`cons[]`, cited to gov sources). Not a Phase 2 capture concern beyond the personalization hook below.
- **Cultural-analysis add-on product** → **Phase 9** (business model / tier line). Capture as a revenue/positioning idea.
- **Personalization hook:** the cultural/PLUS-MINUS content above gets personalized by the Phase 2 capture of motivation + community/family needs + tradeoff tolerance + concerns. Phase 2 captures the *inputs*; the destination-side analysis is built downstream.
- **Live-search reconciliation** (proactively searching a city to reconcile competing priorities) → **Phase 5** (live AI layer).
- **Full schema-driven adaptive engine** (config-driven question architecture, dynamic ordering) → considered and **not chosen** for Phase 2 (build-cost risk vs pitch-prep time). Could revisit post-competition if the adaptive tree proves valuable.

### Reviewed Todos (not folded)
None — no pending todos matched this phase.
</deferred>

---

*Phase: 02-quiz-profile-capture*
*Context gathered: 2026-05-30*
