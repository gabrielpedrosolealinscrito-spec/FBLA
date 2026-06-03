---
phase: 04-international-destinations-country-models
plan: 03
subsystem: ui
tags: [react, jsx, dual-currency, fx, tooltip, sourcing, intl]

# Dependency graph
requires:
  - phase: 04-international-destinations-country-models
    provides: fx.ts (FX_RATES, FX_AS_OF, DATA_AS_OF, currencyForCountry), USD-canonical MatchResult (04-01)
  - phase: 03
    provides: CityDetail.jsx financial surface + ResultsView helpers (css/heading/mono/fmtFull)
provides:
  - InfoTooltip.jsx — reusable tappable "i" affordance (explanation + source, offline)
  - Intl-aware CityDetail rendering — dual-currency figures + dated stamps + country-concept tooltips
affects: [04-04, results-detail-view]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Display layer reads USD-canonical MatchResult and converts BACK to local for intl (local = usd / FX_RATES[currency]); US cities render USD-only (no conversion, no stamp) — strict no-regression branch on c.country === 'US'"
    - "Dated sourcing stamps read fx.ts constants (DATA_AS_OF / FX_AS_OF), never inline date literals, so the SC#4 stamp can't drift"
    - "Country tax concepts surfaced via a single reusable InfoTooltip keyed by city.country (UK/Portugal/Germany/Canada)"

key-files:
  created:
    - src/screens/results/InfoTooltip.jsx
  modified:
    - src/screens/results/CityDetail.jsx

key-decisions:
  - "USD->local display conversion: money(usd) = isIntl ? `${symbol}${round(usd/rate)} (${fmtFull(round(usd))})` : fmtFull(usd). Currency symbols: GBP £, EUR €, CAD C$, USD $"
  - "ExpenseBreakdown parametrized with an fmtMoney prop so itemized rows + total inherit dual-currency for intl; US default formatter is byte-identical to the prior `$${val.toLocaleString()}` output (no regression)"
  - "D-09 honored in the NHR/IFICI tooltip copy: standard-regime take-home is shown; IFICI 20%-flat is described as an un-baked upside (eligibility varies), not computed into the figures"

patterns-established:
  - "InfoTooltip(label, explanation, source): click-toggle popover, touch-friendly, offline, dark-theme inline styles; source accepts a string or { text, url } link"

requirements-completed: [FIN-02]

# Metrics
duration: 12min
completed: 2026-06-03
---

# Phase 04 Plan 03: Financially-Honest Intl City Detail Summary

**International city detail now renders every figure local-primary with USD in parentheses, carries visible "data as of" / "FX rate as of" sourcing stamps read from the fx.ts constants, and exposes tappable "i" tooltips (with citations) on country-specific tax concepts — US cities untouched.**

## Performance

- **Duration:** ~12 min
- **Tasks:** 2 (type: execute)
- **Files modified:** 2 (1 created, 1 modified)
- **Tests:** full suite 114 passing (no engine-import breakage from the new fx.ts import in CityDetail)

## Accomplishments
- `InfoTooltip.jsx` — reusable, touch-friendly (click-toggle) "i" affordance showing a plain-language explanation + source citation (string or link); offline, dark-theme inline styles (D-10)
- `CityDetail.jsx` intl branch (`c.country !== 'US'`): financial tiles (est. salary, take-home, savings, median rent/home) and the full ExpenseBreakdown (rows + total) render dual-currency — local primary, USD in parentheses — converting the USD-canonical values via `FX_RATES[currencyForCountry(c.country)]` (D-03)
- Visible sourcing strip on intl financial content: "data as of {DATA_AS_OF}" + "FX rate as of {FX_AS_OF}", both read from fx.ts constants (SC#4, D-04); the FX label carries an InfoTooltip explaining the fixed-offline-rate rationale + ECB source
- Country tax-concept tooltips wired by country: UK National Insurance (active on London now); Portugal NHR/IFICI, Germany solidarity surcharge, Canada provincial tax (activate when Plan 04 lands those cities) — each with sourced citations
- US-city path is unchanged: USD-only figures, no conversion, no stamp, no tooltip (verified — the default expense formatter is byte-identical to the prior output)

## Task Commits

1. **Task 1: reusable InfoTooltip affordance** — `cda848a` (feat)
2. **Task 2: dual-currency + dated stamps + concept tooltips on intl CityDetail** — `3c187eb` (feat)

## Files Created/Modified
- `src/screens/results/InfoTooltip.jsx` — created: tappable "i" popover (explanation + source), offline
- `src/screens/results/CityDetail.jsx` — intl dual-currency rendering, sourcing strip, country-concept tooltips; `ExpenseBreakdown` now takes an `fmtMoney` prop; US path preserved

## Decisions Made
See frontmatter key-decisions: USD→local conversion helper, ExpenseBreakdown fmtMoney parametrization, D-09 NHR/IFICI mentioned-not-computed tooltip copy.

## Deviations from Plan
None — plan executed as written at the intended FUNCTIONAL level. Per the objective, this is NOT pixel-polished: visual/interaction refinement of the tooltip and sourcing strip is the friend's separate frontend pass (UI-SPEC intentionally absent for this phase).

## Issues Encountered
None. (A live node smoke of the dual-currency math was skipped because raw node can't resolve the engine's `.ts` import graph without vite; the underlying engine value is test-guaranteed in the £-equivalent band and the display formula `round(usd/rate)` is verified by inspection. Visual confirmation is the plan's manual UAT step.)

## User Setup Required
None — pure React view + existing fx.ts import, no new packages, no network (T-4-05 / T-4-SC).

## Next Phase Readiness
- PT/DE/CA concept tooltips and dual-currency are wired and will light up automatically once Plan 04 adds Lisbon/Berlin/Toronto.
- **Manual UAT (per VALIDATION.md):** open an international city detail and confirm local-primary/USD-paren figures, the dated stamps, and tappable "i" affordances with source text. Final visual polish is the frontend pass.

---
*Phase: 04-international-destinations-country-models*
*Completed: 2026-06-03*
