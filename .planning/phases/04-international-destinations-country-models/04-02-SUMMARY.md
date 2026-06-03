---
phase: 04-international-destinations-country-models
plan: 02
subsystem: engine
tags: [scoring, openness, multiplier, vitest, typescript, tdd, intl]

# Dependency graph
requires:
  - phase: 04-international-destinations-country-models
    provides: London city record + uk-2026 model + USD canonicalization (04-01 seam)
  - phase: 03
    provides: centralized SCORING_WEIGHTS tunable config (D-03)
provides:
  - normalizeOpenness(raw) — scale-defensive 0-1 normalizer (0-100 slider OR 1-5 scale, NaN-safe)
  - OPENNESS.minMultiplier/maxMultiplier coefficients in scoring-weights.ts (D-03)
  - Soft openness multiplier applied to international cities' scores in buildRawResult (MATCH-02, D-05)
affects: [04-04, results-ranking]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Openness is a SOFT MULTIPLIER on intl city rawScore (applied before clamp in buildRawResult), never a filter — mirrors the dealbreaker = penalty-not-delete philosophy (D-05)"
    - "Scale-defensive input normalization: detect 1-5 vs 0-100 by magnitude (raw<=5 => 1-5 scale), clamp to [0,1], NaN/undefined => safe default 1 (D-06)"

key-files:
  created: []
  modified:
    - shared/engine/index.ts
    - shared/engine/scoring-weights.ts
    - shared/engine/index.test.ts

key-decisions:
  - "minMultiplier = 0.35 — demotion floor for intl scores at openness=0: clearly demoted (~1/3 weight) yet always present and > 0 (never stranded, D-01)"
  - "maxMultiplier = 1.0 — full weight at max openness, no boost above US baseline (D-05)"
  - "normalizeOpenness scale heuristic: raw<=5 read as 1-5 button scale ((clamp(raw,1,5)-1)/4); raw>5 read as 0-100 slider (raw/100). Accepts the 5-vs-6 discontinuity inherent to dual-scale detection (per plan normalizer_contract)"
  - "NaN/undefined openness => 1.0 (full openness): a malformed signal must not silently hide intl options; the minMultiplier floor still guarantees presence regardless"

patterns-established:
  - "opennessMultiplier(profile, city): US cities identity x1; intl interpolated minMultiplier..maxMultiplier by normalizeOpenness(profile.opennessToAbroad)"

requirements-completed: [MATCH-02]

# Metrics
duration: 5min
completed: 2026-06-03
---

# Phase 04 Plan 02: Openness Soft Multiplier Summary

**opennessToAbroad activated as a soft, scale-defensive multiplier that demotes international cities at low openness toward a 0.35 floor (never stranding them) and gives full weight at high openness — US cities untouched.**

## Performance

- **Duration:** ~5 min
- **Tasks:** 2 (TDD)
- **Files modified:** 3
- **Tests:** full engine suite 51 passing (was 38 after 04-01; +13 new openness tests)

## Accomplishments
- `normalizeOpenness(raw)` — scale-defensive 0-1 factor: reads a 0-100 slider OR a 1-5 button scale by magnitude, clamps to [0,1], monotonic within each scale, NaN/undefined → safe default 1 (D-06)
- `OPENNESS` coefficients (`minMultiplier 0.35`, `maxMultiplier 1.0`) centralized in `scoring-weights.ts` (D-03 — no inline magic numbers in index.ts)
- Soft multiplier wired into `buildRawResult`: international cities' `rawScore` is scaled by `opennessMultiplier(profile, city)` before clamp, so both passes and `checkReconfirm` inherit it; US cities are identity (×1)
- Demote-but-never-strand proven on London: present and scored > 0 at openness=0, strictly demoted vs max openness, monotonic across levels, result set stays `CITIES_DATA.length` (D-01)
- Rewrote the misleading "Phase 4 will add country filtering" docstring at the `rankCities` header — openness is explicitly a soft multiplier, never a filter (D-05)

## Task Commits

TDD (test → feat) per task:

1. **Task 1: normalizeOpenness + OPENNESS config** — `879b9cf` (test/RED) → `6520343` (feat/GREEN)
2. **Task 2: wire soft multiplier + fix docstring** — `8ff0e0e` (test/RED) → `aef2952` (feat/GREEN)

## Files Created/Modified
- `shared/engine/index.ts` — `normalizeOpenness` export, `opennessMultiplier` helper, multiplier wired into `buildRawResult`, corrected `rankCities` docstring
- `shared/engine/scoring-weights.ts` — `openness` config block (minMultiplier/maxMultiplier, D-03)
- `shared/engine/index.test.ts` — V3 normalizer block (7 tests) + V3 mechanism block (6 tests, incl. strict-demotion)

## Decisions Made
- minMultiplier 0.35 / maxMultiplier 1.0 (see frontmatter key-decisions)
- NaN/undefined openness → full openness (1.0), documented in the normalizer JSDoc

## Deviations from Plan
None — plan executed exactly as written. Added one strict-demotion test beyond the listed behaviors so the mechanism block is genuinely RED before wiring (the never-strand/monotonic invariants pass trivially on an unwired engine; strict demotion is what distinguishes wired from no-op).

## Issues Encountered
None.

## User Setup Required
None — pure config + engine logic, no new packages (D-05 / T-4-SC).

## Next Phase Readiness
- Mechanism proven on London (the only intl city present). **Deferred to Plan 04 wave-completion:** the full V3 "all four intl cities present and demoted at openness=0" assertion, once Lisbon/Berlin/Toronto land.
- D-07 honored: ranking uses opennessToAbroad only; no citizenship/visa logic in the matching/financial layer (deferred to Phase 7).

---
*Phase: 04-international-destinations-country-models*
*Completed: 2026-06-03*
