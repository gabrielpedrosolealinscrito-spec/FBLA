---
phase: 12-multi-dimensional-scoring-extend-the-scoring-engine-and-city
verified: 2026-06-04T05:08:36Z
status: passed
score: 8/8
overrides_applied: 0
---

# Phase 12: Multi-Dimensional Scoring — Verification Report

**Phase Goal:** Populate the new life-area city data from `deep-category-data.md` and extend the scoring engine to consume `Profile.categoryWeights` against that data, producing honest, explainable, cited-data-only contributions — while keeping the DISPLAYED score below the clamp ceiling. Engine + data only.

**Verified:** 2026-06-04T05:08:36Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Test Suite Result

```
Test Files  10 passed (10)
     Tests  146 passed (146)
  Start at  00:00:35
  Duration  895ms
```

TypeScript: `tsc --noEmit` exits 0, no errors.

---

## Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | D-05 BLOCKER: displayed `matchScore < 99` for strongest profile (max weights + max categoryWeights) across all cities, asserted via `rankCities()` post-clamp output | VERIFIED | `index.test.ts` "D-05 clamp BLOCKER gate" calls `rankCities(maxProfile)`, asserts `results.length === CITIES_DATA.length` and `r.matchScore < 99` for every result. Structural budget test: `BASE_SCORE(50) + 44.28 = 94.28 < 95`. Both tests pass. |
| 2 | Honest-contribution invariant: `BASE_SCORE + Σ(scoreFactors.contribution) === rawScore` after all 9 factors | VERIFIED | `scoring.test.ts` "Phase 12: honest-contribution invariant" asserts `abs((BASE_SCORE + sum) - rawScore) < 0.01`. `rawScore` is derived directly from `scoreFactors.reduce(...)`, not accumulated separately (Pitfall-1 guard at scoring.ts:333). Test passes. |
| 3 | D-02 weight-gating: schools/childcare contribution === 0 for no-categoryWeights profile; > 0 for family profile; healthcare > 0 even without categoryWeights (practical floor) | VERIFIED | `scoring.test.ts` "D-02 weight-gating" suite: 6 tests all pass. Preference tier: `NEUTRAL_DEFAULT(0.5)` baseline-subtracted → personal weight 0 → contribution 0. Practical tier: `NEUTRAL_DEFAULT/WEIGHT_MAX_PRAC = 0.333 > 0`. |
| 4 | D-07 genuine exclusion: no-cited-data city (Berlin/London/Lisbon/Toronto) yields `contribution === 0` + `dataLevel === 'none'` for healthcare/schools/childcare/connectivity; parks still scores via proxy; no 0.5 midpoint anywhere | VERIFIED | `scoring.test.ts` "D-07 genuine neutral exclusion" asserts contribution=0 and dataLevel='none' for all 4 excluded categories on `testCityNoNewData` (Berlin fixture with no Phase 12 fields). Parks proxy confirmed separately. No `0.5` midpoint exists in scoring.ts; `NEUTRAL_DEFAULT=0.5` is a *weight* constant that baseline-subtracts to 0 contribution for preference categories — confirmed by grep. |
| 5 | D-03/D-09 display-only guard: demographics and FEMA fields never appear as a scored scoreFactors contribution | VERIFIED | (a) `scoring.test.ts` "D-03/D-09 display-only guard" asserts no factor name matches `/foreign|median age|married|fema|disaster/i`. (b) Direct grep of scoring.ts, index.ts, dealbreakers.ts for `foreignBorn|medianAge|neverMarried|disasterRisk|faaHubClass|nriScore|fema` returns zero matches — forbidden fields are never read by the scoring engine at the source level. |
| 6 | D-08 state labeling: schools/childcare entries carry `dataLevel: 'state'` and factor string includes "state avg" | VERIFIED | `scoring.test.ts` "D-08 state-average label": 2 tests verify `schoolsFactor.dataLevel === 'state'` and factor name contains "state avg"; same for childcare. scoring.ts lines 280/294 emit `'Schools (state avg)'` / `'Childcare (state avg)'` with `dataLevel: 'state'`. |
| 7 | D-01 cited-data-only: no scored contribution traces to a non-cited or invented value | VERIFIED | Spot-checked 5 scored categories against `deep-category-data.md`: Austin healthcare 64.8 ✓, Denver schools 35 ✓, Denver childcare 20978 ✓, Denver connectivity 37863967 ✓, Minneapolis parkScore 83.4 ✓. San Diego `childcareInfantAnnual: 22628` (CCAoA), toddler omitted with comment `// CCAoA source says "NR"` ✓. All 22 US cities populated; 4 international cities have no Phase 12 fields (correctly excluded). |
| 8 | Full suite green + tsc clean | VERIFIED | 146/146 tests pass across 10 test files. `tsc --noEmit` exits 0. |

**Score:** 8/8 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `shared/engine/scoring.ts` | 5 new factor functions + `categoryPersonalWeight` | VERIFIED | Functions present and substantive: `healthcareFactorScore`, `schoolsFactorScore`, `childcareFactorScore`, `connectivityFactorScore`, `parksFactorScore`, `categoryPersonalWeight`. All wired into `computeRawScore`. |
| `shared/engine/scoring-weights.ts` | New caps for 5 categories + two-tier floor constants | VERIFIED | `healthcareMaxContribution: 4`, `schoolsMaxContribution: 3`, `childcareMaxContribution: 3`, `connectivityMaxContribution: 3`, `parksMaxContribution: 3`. `WEIGHT_MAX_PREF: 1.8`, `WEIGHT_MAX_PRAC: 1.5`, `NEUTRAL_DEFAULT: 0.5`. Legacy caps renormed ×0.7. |
| `shared/data/cities.ts` | All 22 US cities populated with Phase 12 fields from cited sources | VERIFIED | `healthcareIndex`, `schoolProficiencyPct`, `childcareInfantAnnual`, `airportEnplanements` each appear 22 times (all US cities). `parkScore` appears for 3 cities (Minneapolis 83.4, Seattle 75.4 est implied, Portland 75.1); remainder use proxy. Display-only fields `disasterRiskScore`/`disasterRiskRating`/`foreignBornPct`/`medianAge`/`neverMarriedPct` populated but not scored. |
| `shared/engine/index.test.ts` | D-05 clamp BLOCKER gate using `rankCities(maxProfile)` | VERIFIED | Present at lines 279–343: two tests — runtime assertion (all cities < 99) and structural budget proof (`theoreticalMax < 95`). `maxProfile` correctly sets both `weights: {cost:4,career:4,...}` AND `categoryWeights: {healthcare:1.8,...}`. |
| `shared/engine/scoring.test.ts` | Phase 12 Wave-0 test cases | VERIFIED | Present at lines 114–373: honest-contribution (9 factors), D-02 weight-gating, D-07 proxy+exclusion, D-08 state label, D-03/D-09 guard, crash guards. 26 tests all pass. |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `Profile.categoryWeights` | `computeRawScore` contribution formulas | `categoryPersonalWeight(profile, slug, isPractical)` | WIRED | scoring.ts line 136; called for all 5 new factors in `computeRawScore`. |
| 5 new factor functions | `scoreFactors` array | push in `computeRawScore` | WIRED | Lines 257–325 in scoring.ts. Each category: null sentinel → `{contribution:0, dataLevel:'none'}`; valid data → `{contribution: round(...), dataLevel:'city'|'state'|'proxy'}`. |
| `SCORING_WEIGHTS.normalization` | Per-factor caps | imported in scoring.ts | WIRED | `scoring.ts:9` imports `SCORING_WEIGHTS`; all 5 new `MaxContribution` constants used. |
| `CITIES_DATA` Phase 12 fields | Factor score functions | `city.healthcareIndex` etc. | WIRED | Factor functions check `city.fieldName === undefined` for null sentinel; `parksFactorScore` falls back to `nearMountains`/`nearCoast`/`vibe`. |
| `rankCities(maxProfile)` | D-05 clamp BLOCKER gate | `index.test.ts` | WIRED | Test calls `rankCities()` (the full pipeline including `buildRawResult` → `clamp`), not `computeRawScore` directly. |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `computeRawScore` → Healthcare contribution | `city.healthcareIndex` | `shared/data/cities.ts` Numbeo values | Yes — Numbeo Healthcare Index per city, verified spot-check Austin=64.8 | FLOWING |
| `computeRawScore` → Schools contribution | `city.schoolProficiencyPct` | `shared/data/cities.ts` NAEP state values | Yes — NAEP G8 Reading %, verified Denver=35 | FLOWING |
| `computeRawScore` → Childcare contribution | `city.childcareInfantAnnual` | `shared/data/cities.ts` CCAoA values | Yes — CCAoA $/yr, verified Denver=20978 | FLOWING |
| `computeRawScore` → Connectivity contribution | `city.airportEnplanements` | `shared/data/cities.ts` FAA values | Yes — FAA CY2023 enplanements, verified Denver=37,863,967 | FLOWING |
| `computeRawScore` → Parks contribution | `city.parkScore` (or proxy) | `shared/data/cities.ts` TPL/proxy | Yes — TPL ParkScore where available (3 cities); proxy `nearMountains`/`nearCoast`/`vibe` for remainder | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Evidence | Status |
|----------|----------|--------|
| All 26 city count in `rankCities` output (22 US + 4 intl) | `index.test.ts`: `results.length === CITIES_DATA.length` passes | PASS |
| maxProfile displayed score < 99 across all cities | `index.test.ts` D-05 BLOCKER gate: every `r.matchScore < 99` — confirmed 26 cities | PASS |
| Static budget: max rawScore 94.28 < 95 | `index.test.ts` structural proof: `theoreticalMax = 94.28 < 95` — headroom ≥ 4.72 pts before 99 clamp | PASS |
| Schools contribution === 0 for childless profile | `scoring.test.ts`: noKidsProfile → schools contrib 0 | PASS |
| Healthcare contribution > 0 without categoryWeights (practical floor) | `scoring.test.ts`: noKidsProfile → healthcare contrib > 0 | PASS |
| Berlin (no Phase 12 data) → excluded categories contribution 0, dataLevel 'none' | `scoring.test.ts` D-07 genuine exclusion | PASS |
| Parks proxy baseline > 0 for Berlin (no parkScore, no mountains, no coast) | `scoring.test.ts` D-07 parks proxy for intl city | PASS |
| D-05 regression-proof mechanism | The load-bearing proof is the **static budget test** (`BASE_SCORE + Σ(global × maxContribution) = 94.28`). Since `personalWeight ∈ [0,1]` and `factorScore ∈ [0,1]`, and worst-case rounding over 9 factors ≤ 4.5 pts, no profile can reach 99 regardless of input data. The runtime test confirms; the budget test guarantees it structurally. | PASS |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `shared/engine/scoring.ts` | 327 | `TODO (D-04 / Phase 5 live-AI seam)` | Info | Sanctioned architectural seam marker. CONTEXT.md explicitly defines the live-AI amenity tier as Phase 5 scope. The TODO names a formal forward reference (`D-04 / Phase 5`). Not incomplete work — this is the intentional extension point. No action required. |
| `shared/data/cities.ts` | 913, 943, 973, 1003 | `[DERIVED — verify]` on intl `costIndex`/`medianHome` | Info | Phase 4 display fields only; not Phase 12 scope; no scored contribution reads these fields. |

**No BLOCKER anti-patterns found.** The `TODO` marker is Warning/Info per gate spec (`TBD`/`FIXME`/`XXX` are blockers; `TODO` is Warning). This one explicitly names its forward reference.

---

## Requirements Coverage

| Invariant | Source | Status | Evidence |
|-----------|--------|--------|---------|
| D-01 Cited-data-only scoring | 12-CONTEXT.md | SATISFIED | 22 US cities populated from Numbeo/NAEP/CCAoA/FAA/TPL. Intl cities have no Phase 12 fields → genuine exclusion. No runtime estimation. |
| D-02 Weight-gating (schools/childcare/healthcare floor) | 12-CONTEXT.md | SATISFIED | Two-tier `categoryPersonalWeight`: preference → 0 at NEUTRAL_DEFAULT; practical → floor. 6 tests pass. |
| D-03 Demographics display-only | 12-CONTEXT.md | SATISFIED | `foreignBornPct`/`medianAge`/`neverMarriedPct` present in cities.ts but not read by any scoring function. |
| D-04 Live-AI seam | 12-CONTEXT.md | SATISFIED | `scoreFactors` is an open list; `categoryWeights` is `Record<string, number>`. Seam comment at scoring.ts:327. Live-AI fill is Phase 5. |
| D-05 Clamp BLOCKER | 12-CONTEXT.md | SATISFIED | Static budget: 94.28 < 95. Runtime test via `rankCities(maxProfile)` green. |
| D-07 Proxy/neutral exclusion | 12-CONTEXT.md | SATISFIED | Null sentinel → contribution 0 + dataLevel 'none'. Parks proxy floor 0.4 (never phantom-zero). |
| D-08 State labeling | 12-CONTEXT.md | SATISFIED | `'Schools (state avg)'` / `'Childcare (state avg)'` with `dataLevel: 'state'`. 2 tests verify. |
| D-09 FEMA display-only | 12-CONTEXT.md | SATISFIED | `disasterRiskScore`/`disasterRiskRating` in cities.ts; `faaHubClass` in cities.ts. None read by scoring engine (verified by grep). |

---

## Human Verification Required

One manual item noted in VALIDATION.md (non-blocking, informational):

**Demo-narrative sanity after ranking shift (D-06):** Gabriel should re-run the demo profile against the new multi-dimensional scores and confirm the surfaced "why this city" contributions read honestly and the narrative still lands. Rankings may have shifted freely (honesty over demo-stability per D-06). This is a subjective judgment check and is the only item in VALIDATION.md marked manual-only. It does not block the phase goal (engine + data).

---

## Gaps Summary

No gaps. All 8 must-have truths verified. Full test suite green (146/146). TypeScript clean. Cited data values spot-checked against `deep-category-data.md` for all 5 scored categories. Forbidden fields never read by the scoring engine (verified at source level). D-05 structurally guaranteed by the scoring budget, not just by runtime margin.

---

_Verified: 2026-06-04T05:08:36Z_
_Verifier: Claude (gsd-verifier)_
