---
phase: 04-international-destinations-country-models
plan: 04
subsystem: engine
tags: [financial-model, tax, cities, vitest, typescript, tdd, intl]

# Dependency graph
requires:
  - phase: 04-international-destinations-country-models
    provides: FinancialModel.computeSalary + FINANCIAL_MODELS registry + USD canonicalization (04-01); openness soft multiplier (04-02)
provides:
  - pt-irs-2026, de-2026, ca-on-2026 country tax models + sourced local-salary datasets
  - Lisbon, Berlin, Toronto city records in CITIES_DATA (USD-canonical costs)
  - Full 4-city V3/V4 assertions — all golden-path intl cities rank + demote-not-strand at openness=0
affects: [results-ranking, city-detail, verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Each country model mirrors uk-2026: computeTax (local currency) + computeSalary (sourced local dataset) + computeExpenses (delegates to computeUSExpenses, since cities.ts costs are USD-canonical)"
    - "DE income tax uses a piecewise-linear approximation of the German polynomial (integral of a linearly-rising marginal 14%->42% above Grundfreibetrag, then flat 42%/45%) — sanctioned by RESEARCH within the ±7% band"
    - "New intl cities inherit dual-currency display (Plan 03) and the openness multiplier (Plan 02) for free via the financialModelId + country seam"

key-files:
  created: []
  modified:
    - shared/engine/financial.ts
    - shared/engine/financial.test.ts
    - shared/data/cities.ts
    - shared/engine/index.test.ts

key-decisions:
  - "Tolerance bands: PT ±5% (cleanly bracket-derived), DE ±7% (polynomial approximation), CA ±7% (Ontario surtax/health-premium approximation). Worked examples: PT €45k→~€2,470/mo, DE €65k→~€3,492/mo, CA C$95k→~C$5,766/mo"
  - "PT take-home uses the STANDARD ~34% IRS regime ONLY; NHR/IFICI 20%-flat is NOT computed (D-09) — surfaced via the Plan 03 tooltip instead. computeTax contains no IFICI/flat-rate math (grep-verified)"
  - "DE social security (~21.45%) treated as broadly deductible from the income-tax base (Vorsorgeaufwendungen approximation); Soli excluded (abolished for typical employees)"
  - "CA model layers federal brackets + Ontario (brackets + surtax + stepped Health Premium) + CPP/CPP2/EI, each capped per CRA T4032-ON 2026"

patterns-established:
  - "Country tax model = sourced bracket arrays + capped social contributions + sourced local-salary dataset, registered in FINANCIAL_MODELS keyed by financialModelId"

requirements-completed: [MATCH-02, FIN-02]

# Metrics
duration: 22min
completed: 2026-06-03
---

# Phase 04 Plan 04: Three Country Models + Full 4-City Integrity Summary

**Lisbon, Berlin, and Toronto land with country-correct tax models (pt-irs-2026 standard-regime IRS+SS, de-2026 progressive+SS, ca-on-2026 federal+Ontario+CPP/EI) and sourced local salaries — completing the four golden-path international cities, all of which rank and demote-but-never-strand at openness=0.**

## Performance

- **Duration:** ~22 min
- **Tasks:** 2 (TDD)
- **Files modified:** 4
- **Tests:** engine suite 66 / full suite 129 passing

## Accomplishments
- Three country tax models registered in `FINANCIAL_MODELS`, each returning LOCAL-currency figures (index.ts canonicalizes to USD), no US tax math:
  - **pt-irs-2026** — 11% employee SS + dedução específica (greater of €4,462 or actual SS) + 2026 IRS progressive brackets. STANDARD regime only, NO IFICI/NHR (D-09). €45k → ~€2,470/mo net (±5%)
  - **de-2026** — ~21.45% capped employee SS + Grundfreibetrag + piecewise-linear progressive income tax (Soli excluded). €65k → ~€3,492/mo net (±7%)
  - **ca-on-2026** — federal brackets + Ontario (brackets + surtax + stepped Health Premium) + CPP/CPP2/EI (all CRA-capped). C$95k → ~C$5,766/mo net (±7%)
- Sourced local-salary datasets `PT_LOCAL_SALARIES` / `DE_LOCAL_SALARIES` / `CA_LOCAL_SALARIES` with inline citations (each profession), non-remote path only (D-01/D-02)
- Lisbon/Berlin/Toronto records appended to `CITIES_DATA` — USD-canonical medianRent/medianHome, all Phase-3 City fields populated (Gap #8); CITIES_DATA now 26 cities (22 US + 4 intl)
- Full V3/V4 wave-completion: all four intl cities rank (V4), are present with matchScore > 0 at openness=0 (V3 never-strand), monotonic with openness, plausible USD salary bands, no NaN, scores in [0,99]

## Task Commits

TDD (test → feat) per task:

1. **Task 1: PT/DE/CA models + local salaries** — `5e858f1` (test/RED) → `9eb77c3` (feat/GREEN)
2. **Task 2: Lisbon/Berlin/Toronto records + full 4-city V3/V4** — `a6124a4` (test/RED) → `1a8d91c` (feat/GREEN)

## Files Created/Modified
- `shared/engine/financial.ts` — pt-irs-2026 / de-2026 / ca-on-2026 models + datasets, registered in FINANCIAL_MODELS
- `shared/engine/financial.test.ts` — PT/DE/CA V1 (banded) + V2 (no-US-math) fixtures
- `shared/data/cities.ts` — Lisbon, Berlin, Toronto records
- `shared/engine/index.test.ts` — all-4-intl V3 full + V4 wave-completion block

## Decisions Made
See frontmatter key-decisions: tolerance bands, D-09 PT standard-regime, DE SS-deductible approximation, CA layered model.

## Deviations from Plan
None — plan executed as written. DE income tax uses the RESEARCH-sanctioned piecewise-linear approximation (within ±7%).

## Issues Encountered
None blocking. The DE/CA models are approximations of complex real systems (RESEARCH Gaps #5/#6); they land within their documented tolerance bands but should be confirmed against authoritative calculators before the pitch (see below).

## [VERIFY] figures pending pre-pitch confirmation
- **DE net** — confirm €65k net against a German brutto-netto calculator (Steuerklasse I); piecewise-linear approx currently yields ~€3,492/mo (top of the ±7% band).
- **CA Ontario surtax + Health Premium** — stepped Health-Premium approximation and surtax thresholds (CRA T4032-ON 2026) need exact-figure confirmation (Gap #6).
- **costIndex / medianHome** — Lisbon/Berlin/Toronto costIndex and medianHome are [DERIVED — verify] from Numbeo/price-per-m² (Gaps #1/#2/#5).
- **PT take-home excludes IFICI** — confirmed: computeTax applies the standard regime only; IFICI is mentioned via the Plan 03 tooltip, never baked in (D-09).

## User Setup Required
None — pure data + functions, no new packages, no network (T-4-SC).

## Next Phase Readiness
- MATCH-02 (all four golden-path cities ranked) and FIN-02 (each country-correct + sourced) are met across the engine.
- The three new cities inherit dual-currency display + concept tooltips (Plan 03) automatically.
- Recommend a manual UAT pass + pre-pitch verification of the [VERIFY] figures above.

---
*Phase: 04-international-destinations-country-models*
*Completed: 2026-06-03*
