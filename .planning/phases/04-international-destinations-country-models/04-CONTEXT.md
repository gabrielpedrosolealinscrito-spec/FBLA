# Phase 4: International Destinations & Country Models - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Make **Lisbon, Berlin, Toronto, and London** appear in the ranked results alongside US cities, each with a **country-correct financial model** (no US tax/salary math applied to foreign salaries) and **sourced, cited data**, with a visible **"data as of [date]"** timestamp on international financial content. Delivers MATCH-02 + FIN-02.

**Owns:** the four international city records in `shared/data/cities.ts`; per-country financial models (tax + expenses) registered through the existing `FinancialModel` interface; a sourced local-salary data structure for non-remote movers; activation of `opennessToAbroad` in the scoring engine (currently a no-op); the international city-detail display (dual currency, "data as of", "i" info tooltips for uncommon tax concepts).

**Does NOT own:** the quiz / openness input control (Phase 2 — produces `Profile`, incl. the openness value); citizenship->visa-feasibility logic (Phase 7 visa concierge); live AI city data (Phase 5); roadmap (Phase 6). The hard line: **Phase 4 makes international cities rank correctly and show financially-correct, sourced numbers offline. It does not decide whether a person can legally move there (Phase 7) and does not build the quiz inputs (Phase 2).**

**Parallel-work note:** This phase is being executed concurrently with Phase 2 (Quiz) on a separate git branch (`phase-4-intl`), flat mode, shared root `.planning/`. `shared/types.ts` is the one shared/frozen surface — any change is a small, announced, coordinated commit.
</domain>

<decisions>
## Implementation Decisions

### International salary basis (FIN-02)
- **D-01:** **Non-remote movers use real, sourced local median salary by profession × city** — researched and cited like rent (Phase 3 D-12 standard). Do NOT reuse the US `computeSalary` (US `BASE_SALARIES × costIndex/100`) for foreign cities: a low foreign cost index against a full US salary **inflates foreign savings** and hands a judge an easy "you're paying a Lisbon dev a New York salary" gotcha. The international financial models supply their own salary logic via a local-salary dataset.
- **D-02:** **Remote workers (`hasRemote = true`) keep their stated US/remote income regardless of city.** This is already how `buildRawResult` works (`profile.income` on the `hasRemote` path) and matches digital-nomad reality. Local-salary data applies only to the non-remote path.
- **Data/contract implication (for planner):** a new per-city (or per-country) local-salary structure keyed by profession is needed. `computeSalary` (or the model's salary step) must branch: US = base × costIndex; international = local sourced salary. Exact storage shape is planner's discretion, but it must stay consistent with the `City`/`Profile` contract and be sourced/cited.

### Currency display (FIN-02, SC#4)
- **D-03:** **Dual currency — local primary, USD secondary.** Every international figure (salary, rent, take-home, itemized expenses) shows local currency first (e.g. `€3,200/mo`) with USD in parentheses (`$3,470`). Authentic to the destination AND apples-to-apples comparable for a US-based user against US cities.
- **D-04:** **FX rate is hardcoded, sourced, and dated.** A fixed rate per currency (EUR/GBP/CAD), cited to a source (e.g. ECB), with a visible "rate as of [date]" label. Runs offline on battery (demo constraint); satisfies SC#4's "data as of [date]". Live FX is Phase 5 territory and an offline risk; even a future live path needs this bundled fallback.

### Openness weighting (MATCH-02, activates QUIZ-02)
- **D-05:** **The engine normalizes `opennessToAbroad` to a 0–1 factor and applies it as a SOFT MULTIPLIER on international cities' scores.** 0 = international cities heavily demoted but still visible; high = full weight (optional slight boost). **Never filters/strands** — upholds Phase 3 D-01 (never strand the user) and mirrors the dealbreaker = penalty-not-delete philosophy. Today `opennessToAbroad` is captured but a no-op (`shared/engine/index.ts:109`); Phase 4 wires it in.
- **D-06 (coordination):** The **input control** for openness (currently spec'd as a 0–100 slider in the contract) is a **Phase 2 quiz-UI decision** — the user wants a discrete **1–5 button scale** and standardized input components across the quiz. The Phase 4 engine must **normalize whatever scale Phase 2 finalizes** to its internal 0–1 factor, so the control can change without breaking the math. **If Phase 2 changes `Profile.opennessToAbroad` from `0–100` to a 1–5 scale, that is an announced, coordinated `shared/types.ts` change** between the two parallel sessions. Build the normalizer defensively (don't assume a literal 0–100 range).

### Citizenship in the matching layer
- **D-07:** **Deferred to Phase 7.** Phase 4 ranking is driven by `opennessToAbroad` only. No citizenship/immigration -> visa-feasibility logic enters the matching or financial layer here; that belongs to the Phase 7 visa concierge. Keeps scope clean and avoids pre-empting/duplicating Phase 7.

### Country tax model fidelity (FIN-02)
- **D-08:** **Per-country models match the US model's depth** — progressive national brackets + the primary social contribution, registered via the existing `FinancialModel` interface and `FINANCIAL_MODELS` registry (Phase 3 extension point — no US-spine rewrite):
  - **Portugal** -> progressive IRS + Social Security
  - **Germany** -> progressive income tax + solidarity surcharge (+ primary social contributions)
  - **Canada (Toronto)** -> federal + Ontario provincial
  - **UK (London)** -> income tax bands + National Insurance
  Standard resident rates. Best accuracy-per-effort, parallel to FIN-01, judge-defensible. All figures sourced/cited (Phase 3 D-12 standard).
- **D-09:** **Special / newcomer regimes are NOT computed into take-home.** Portugal's NHR/IFICI ("NHR 2.0", narrowed 2024–25) is **mentioned, not baked into the math** — this avoids a stale-eligibility-number gotcha in Q&A while keeping the selling point visible (surfaced via the D-10 info affordance).

### Uncommon-concept disclosure ("i" info pattern) — Phase 4 UI affordance
- **D-10:** **Anything country-specific that is not common knowledge gets a tappable "i" info button** -> a short plain-language explanation **plus its source/citation**. Applies to: Portugal NHR/IFICI, Germany solidarity surcharge, UK National Insurance, Canada provincial tax, and the "data as of [date]" stamp. Reusable tooltip on the international city-detail surface. This is where citations live for international content, satisfying the "everything sourced" standard. (Frontend execution — likely the friend's pass per the division of labor.)

### Claude's Discretion
- Exact engine module layout for the country models (e.g. one file per country under `shared/engine/` vs a single `country-models.ts`), the precise local-salary data shape/storage, the openness-multiplier curve/coefficients (tunable, consistent with Phase 3 D-03 config centralization), and the specific sourced figures for the four cities (subject to the sourced/cited standard).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The contract being extended (FROZEN — coordinate changes)
- `shared/types.ts` — `City` (`country`, `financialModelId`, all intl-ready fields — already present), `Profile.opennessToAbroad` (currently `// 0–100 slider`; see D-06 coordination), `MatchResult`/`ExpenseBreakdown`. **Treat as frozen; any change is a small announced commit coordinated with the Phase 2 session.**

### The engine extension points (already built for Phase 4 by Phase 3)
- `shared/engine/financial.ts` — `FinancialModel` interface, `FINANCIAL_MODELS` registry (US registered; Phase 4 appends country models), `computeSalary` (US base × costIndex — D-01 says international must NOT use this), `computeUSTax`/`computeUSExpenses` as the depth template to mirror per D-08.
- `shared/engine/index.ts` — `buildRawResult` already dispatches the financial model via `FINANCIAL_MODELS[city.financialModelId]` (line ~64) and keeps remote income on the `hasRemote` path (line ~67). `rankCities` `opennessToAbroad` no-op note at **line ~109** is the exact seam D-05 fills. `clamp`/`sanitizeProfile`/two-pass D-02 flow must keep working with intl cities present.
- `shared/data/cities.ts` — the 22 US-city dataset to **append** the 4 international cities to (with `country` != "US" and a non-"us" `financialModelId`); header documents the sourcing/costIndex conventions to follow.
- `shared/data/constants.js` — `BASE_SALARIES` (US baseline; international salaries come from the new local-salary structure, not this).

### Phase 3 decisions this phase honors
- `.planning/phases/03-matching-us-financial-spine/03-CONTEXT.md` — D-01 (never filter/strand -> D-05 soft multiplier), D-08 (model depth -> D-08 here mirrors it), D-09 (`financialModelId` so Phase 4 appends cleanly), D-12 (real cited numbers), D-03 (centralized tunable config).

### Project intent & scope
- `.planning/REQUIREMENTS.md` — MATCH-02, FIN-02 (this phase); "sourced, defensible" standard.
- `.planning/ROADMAP.md` — Phase 4 goal + 4 success criteria (the 4 cities are fixed; SC#4 = "data as of [date]" timestamp).
- `.planning/PROJECT.md` — "win #1 — pitch substance wins ties"; offline-on-battery demo constraint.

### UI surface (intl display)
- `src/screens/results/CityDetail.jsx` — where dual-currency figures (D-03), the "data as of" stamp (D-04/SC#4), and the "i" info tooltips (D-10) render for international cities.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`FinancialModel` interface + `FINANCIAL_MODELS` registry** (`financial.ts`) — purpose-built extension point; register `portugal`/`germany`/`canada`/`uk` models without touching the US spine.
- **`buildRawResult` model dispatch** (`index.ts:64`) — already selects model by `city.financialModelId` and falls back to US; adding cities + models "just works" through it.
- **`hasRemote` income path** (`index.ts:67`) — already implements D-02 (remote keeps US income).
- **`CITIES_DATA`** (`cities.ts`) — typed, sourced, header-documented dataset to append four city records to.
- **Two-pass D-02 ranking + `clamp`/`sanitizeProfile`** (`index.ts`) — must continue to hold with intl cities in the set.

### Established Patterns
- **Contract-first** — engine reads/writes `shared/types.ts`; announce contract changes in small commits (doubly important during parallel Phase 2 work).
- **Sourced/cited data** (Phase 3 D-12) — every new figure (salary, rent, tax, FX rate) carries an attributable source; `cities.ts` header is the template.
- **Offline-only for this phase** — no `/api`/network (live layer is Phase 5). Hardcoded FX rate (D-04) preserves this.
- **Config-centralized magic numbers** (Phase 3 D-03) — openness multiplier coefficients live in tunable config, not inline.

### Integration Points
- **Engine INPUT:** `Profile` (incl. `opennessToAbroad`) from the Phase 2 quiz.
- **Engine OUTPUT:** `MatchResult[]` with intl cities ranked + country-correct financials -> results UI / `CityDetail`.
- **Cross-phase seam:** `Profile.opennessToAbroad` scale (D-06) is the shared contract point with the concurrent Phase 2 session.

</code_context>

<specifics>
## Specific Ideas

- **"i" info-button pattern (D-10):** click/tap (or drag) an "i" affordance next to any uncommon country-specific concept (NHR/IFICI, solidarity surcharge, National Insurance, provincial tax, "data as of") to reveal a short plain-language explanation + source. The user wants this standardized for "anything different / not common knowledge."
- **Standardized input components (routed to Phase 2):** the user wants discrete, consistent inputs across the quiz — e.g. a **1–5 button scale** for openness instead of a 0–100 slider, and reusable select-style controls "across the board."
- **Inflated-savings gotcha (D-01):** the explicit reason to source real local salaries — avoid full-US-salary × low-foreign-cost producing fake savings.

</specifics>

<deferred>
## Deferred Ideas

- **Openness input control = 1–5 buttons + standardized quiz input components** -> **Phase 2** (quiz UI / UI-SPEC). Right idea, wrong phase. Carries a `shared/types.ts` coordination note (D-06).
- **Citizenship -> visa-feasibility ranking influence** -> **Phase 7** (visa concierge). Phase 4 ranking uses openness only (D-07).
- **Computing NHR/IFICI (or other special regimes) into take-home** -> deliberately avoided (D-09); could revisit post-pitch if eligibility rules are pinned down and a "do you qualify?" screener exists.
- **Live FX rates** -> **Phase 5** live layer (still needs the D-04 hardcoded fallback).
- **Expanded international city database (20+ cities)** -> v2 / post-competition (per REQUIREMENTS.md v2).

### Reviewed Todos (not folded)
None — no pending todos matched this phase.

</deferred>

---

*Phase: 04-international-destinations-country-models*
*Context gathered: 2026-06-02*
