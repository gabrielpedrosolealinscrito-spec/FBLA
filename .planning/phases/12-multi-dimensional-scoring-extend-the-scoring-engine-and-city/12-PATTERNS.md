# Phase 12: Multi-Dimensional Scoring — Pattern Map

**Mapped:** 2026-06-03
**Files analyzed:** 6 (5 modified; 0 created)
**Analogs found:** 6 / 6 (all within-file analogs; this phase extends existing files only)

---

## File Classification

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `shared/engine/scoring.ts` | service | transform (batch, per-city) | `costFactorScore` / `safetyFactorScore` / `lifestyleFactorScore` / contribution blocks (same file) | exact |
| `shared/engine/scoring-weights.ts` | config | — | existing `global` + `normalization` blocks + `PERSONAL_WEIGHT_SCALE` (same file) | exact |
| `shared/types.ts` | contract | — | `CityScore.scoreFactors` in `scoring.ts` L16-19; `MatchResult.scoreFactors` in `types.ts` L152 | exact |
| `shared/data/cities.ts` | data | — | Austin city literal (L27-52): same object shape, add optional fields | exact |
| `shared/engine/scoring.test.ts` | test | — | contribution-sum invariant block (L67-86) + CR-01 regression block (L88-112) | exact |
| `shared/engine/index.test.ts` | test | — | clamp + range block (L53-60) in existing `rankCities` suite | exact |

---

## Pattern Assignments

### `shared/engine/scoring.ts` — new factor functions

This file gets 5 new `*FactorScore` functions and 1 new `categoryPersonalWeight` function,
plus 5 new contribution blocks inside `computeRawScore`. All are **intra-file analogs**.

---

#### `childcareFactorScore` — analog: `costFactorScore` (lines 69-71)

Lower-is-better, `(hi - x) / range` shape. Direct copy of the cost pattern.

**Analog** (`scoring.ts` lines 69-71):
```typescript
function costFactorScore(city: City): number {
  return Math.max(0, Math.min(1, (140 - city.costIndex) / 80));
}
```

**Mirror pattern for childcare:**
- Signature: `(city: City): number`
- Direction: lower cost → higher score (same as `costFactorScore`)
- Field: `city.childcareInfantAnnual` (already typed optional in `types.ts` L132)
- Neutral fallback: `if (city.childcareInfantAnnual === undefined) return 0.5;`
- Normalization bounds from RESEARCH.md §Pattern 1 (observed range, not `0–100`)

---

#### `healthcareFactorScore` — analog: `safetyFactorScore` (line 81-83) shape + `costFactorScore` anchored range

Higher-is-better with anchored range (not `/100`). `safetyFactorScore` is structurally simpler (`index/100`); use `costFactorScore`'s anchored `(hi - lo)` form, but in the positive direction.

**Analog** (`scoring.ts` lines 81-83):
```typescript
function safetyFactorScore(city: City): number {
  return city.safetyIndex / 100;
}
```

**Analog range clamping** (`scoring.ts` lines 69-71 — same two-bound form):
```typescript
return Math.max(0, Math.min(1, (city.costIndex - lo) / range));
```

**Mirror pattern for healthcare:**
- Signature: `(city: City): number`
- Direction: higher index → higher score
- Field: `city.healthcareIndex` (already typed optional in `types.ts` L127)
- Neutral fallback: `if (city.healthcareIndex === undefined) return 0.5;`
- Must use anchored range (observed 62.9–71.9); NOT `/100` (see RESEARCH.md Pitfall 3)

---

#### `schoolsFactorScore` — analog: `healthcareFactorScore` above (identical shape, different field)

Higher-is-better, anchored range.

**Mirror pattern:**
- Signature: `(city: City): number`
- Field: `city.schoolProficiencyPct` (already typed optional in `types.ts` L130)
- Neutral fallback: `return 0.5;` when undefined
- Anchored range from RESEARCH.md §Pattern 1

---

#### `connectivityFactorScore` — analog: `costFactorScore` (lines 69-71), wrapping `Math.log()`

Same `Math.max(0, Math.min(1, ...))` clamp shell; the inner expression uses `Math.log(enplanements)` rather than a linear field. The 21:1 raw range requires log-scale.

**Analog clamp shell** (`scoring.ts` lines 69-71):
```typescript
return Math.max(0, Math.min(1, (140 - city.costIndex) / 80));
```

**Mirror pattern for connectivity:**
- Signature: `(city: City): number`
- Field: `city.airportEnplanements` (already typed optional in `types.ts` L139)
- Neutral fallback: `return 0.5;` when undefined
- Inner expression: `(Math.log(city.airportEnplanements) - lo) / range` per RESEARCH.md §Pattern 1

---

#### `parksFactorScore` — analog: `lifestyleFactorScore` (lines 89-126)

This is the only new factor function that takes `(city, profile)` and uses `city.vibe`. The analog for the two-argument signature, proxy vibe check, and fallback accumulator is `lifestyleFactorScore`.

**Key analog lines within `lifestyleFactorScore`:**

*Two-argument signature* (`scoring.ts` line 89):
```typescript
function lifestyleFactorScore(city: City, profile: Profile): number {
```

*`vibe` string match pattern* (`scoring.ts` lines 96-100):
```typescript
if (tags.includes('outdoors') || tags.includes('snow')) {
  rawLifestyle += city.vibe.some(v => v.toLowerCase() === 'outdoorsy') ? tagVibeBonus : 0;
}
```

*`nearMountains` / `nearCoast` precedent:* these fields are already used as implicit lifestyle signals and are present on all 22 cities. The proxy fallback for parks reads them directly from `city.nearMountains` and `city.nearCoast`.

*Null guard for profile field* (`scoring.ts` line 91):
```typescript
const tags = profile.lifestyleTags ?? [];
```

**Mirror pattern for parks:**
- Signature: `(city: City): number` (profile param not strictly needed since weight-gating is at contribution level — planner's discretion whether to include it; `lifestyleFactorScore` is the justification if included)
- Primary path: `city.parkScore` → normalized via `Math.max(0, Math.min(1, ...))` (RESEARCH.md §Pattern 1)
- Fallback path: `city.nearMountains` / `city.nearCoast` / `city.vibe.some(v => v.toLowerCase() === 'outdoorsy')` — literal precedent in `lifestyleFactorScore` line 100
- Field: `city.parkScore` (already typed optional in `types.ts` L137)
- MUST NOT return `0` for cities without `parkScore` (D-07 phantom-zero anti-pattern)

---

#### `categoryPersonalWeight` — analog: `rankToWeight`'s `norm()` closure (lines 34-36)

The existing personal-weight normalization pattern is the `norm` inner function in `rankToWeight`. `categoryPersonalWeight` is a parallel normalizer for `categoryWeights` entries, using the two-tier formula from RESEARCH.md §Pattern 2.

**Analog** (`scoring.ts` lines 34-36):
```typescript
const norm = (v: number): number =>
  Math.min(PERSONAL_WEIGHT_SCALE, Math.max(0, v)) / PERSONAL_WEIGHT_SCALE;
```

**Mirror pattern for `categoryPersonalWeight`:**
- Signature: `(profile: Profile, slug: string, isPractical: boolean): number`
- Reads: `profile.categoryWeights?.[slug] ?? NEUTRAL_DEFAULT` — note the `??` fallback pattern for missing `categoryWeights` (D-02 graceful degradation, same `??` guard as `profile.lifestyleTags ?? []` at line 91)
- Two-tier formula from RESEARCH.md §Pattern 2 (preference: baseline-subtract neutral; practical: retain floor)
- All constants (`WEIGHT_MAX_PREF`, `WEIGHT_MAX_PRAC`, `NEUTRAL_DEFAULT`) come from `scoring-weights.ts` — same module as `PERSONAL_WEIGHT_SCALE`

---

#### 5 new contribution blocks in `computeRawScore` — analog: Cost block (lines 140-144)

Each new category gets a contribution block identical in structure to the existing cost/career/lifestyle/safety blocks.

**Analog** (`scoring.ts` lines 140-144):
```typescript
const costContrib = Math.round(
  global.cost * personal.cost * costFactorScore(city) * normalization.costMaxContribution
);
scoreFactors.push({ factor: 'Cost', contribution: costContrib });
```

**Mirror pattern for each new category:**
```typescript
const <slug>Contrib = Math.round(
  SCORING_WEIGHTS.global.<slug>
  * categoryPersonalWeight(profile, '<slug>', <isPractical>)
  * <slug>FactorScore(city)
  * SCORING_WEIGHTS.normalization.<slug>MaxContribution
);
scoreFactors.push({ factor: '<Display Label>', contribution: <slug>Contrib, dataLevel: '<level>' });
```

- `dataLevel` field is new on the push (see Types section below for the two-location type change required)
- `'Healthcare'` → `dataLevel: 'city'`; `'Schools (state avg)'` → `dataLevel: 'state'`; `'Childcare (state avg)'` → `dataLevel: 'state'`; `'Connectivity'` → `dataLevel: 'city'`; parks city/proxy → `dataLevel: 'city'` or `'proxy'`
- State-level factors must use the label suffix `(state avg)` in the `factor` string (D-08)

**Invariant guard — MUST NOT change** (`scoring.ts` line 166):
```typescript
const rawScore = BASE_SCORE + scoreFactors.reduce((s, f) => s + f.contribution, 0);
```
New contributions are appended to `scoreFactors` before this line; the reduce picks them up automatically. Do not accumulate `rawScore` separately.

---

### `shared/engine/scoring-weights.ts` — new constants

All new constants mirror existing constant blocks in the same file.

**Analog: `global` block** (`scoring-weights.ts` lines 30-35):
```typescript
global: {
  cost:      1.0,
  career:    1.0,
  lifestyle: 1.0,
  safety:    0.8,
},
```

**Mirror pattern:** add 5 new slugs to `global` (all `1.0` for new categories unless the planner proportional-renorms to a lower effective global; RESEARCH.md Option A recommendation keeps global=1.0 and adjusts `maxContribution` caps only).

**Analog: `normalization` block** (`scoring-weights.ts` lines 55-60):
```typescript
normalization: {
  costMaxContribution:      12,
  careerMaxContribution:    12,
  lifestyleMaxContribution: 10,
  safetyMaxContribution:     8,
},
```

**Mirror pattern:** add 5 new `*MaxContribution` entries. RESEARCH.md §Pattern 3 Option A recommends recalibrating all 9 cap values so `BASE_SCORE + Σ(global × maxContribution) ≤ 94` — existing 4 shrink proportionally, new 5 added at 3–4 pts each. The `as const` on the object means this is the only file to edit; TypeScript propagates the literal types.

**Analog: `PERSONAL_WEIGHT_SCALE`** (`scoring-weights.ts` line 67):
```typescript
export const PERSONAL_WEIGHT_SCALE = 4;
```

**Mirror pattern:** add parallel category-weight constants as named exports:
```typescript
export const WEIGHT_MAX_PREF = 1.8;    // ceiling for preference categories
export const WEIGHT_MAX_PRAC = 1.5;    // ceiling for practical categories
export const NEUTRAL_DEFAULT = 0.5;    // synthesizer emits this for skipped categories
```

These replace any inline literals in `categoryPersonalWeight`. The `WEIGHT_MAX_PREF` value must match `personality.ts` on `reconcile/v1` (verified: 1.8) — read that file before editing if there is any doubt (RESEARCH.md Assumption A1 warning).

**Docstring to update** (`scoring-weights.ts` lines 19-24): the existing theoretical-max comment cites `50 + 12 + 12 + 10 + 0.8×8 = 90.4`. After recalibration, update to reflect the new budget total.

---

### `shared/types.ts` — `dataLevel?` field in TWO locations

> **Critical sequencing note (advisor flag):** `scoreFactors` is typed in two separate places. A `.push({ ..., dataLevel })` in `scoring.ts` will be a compile error unless BOTH locations are updated first.

**Location 1 — `CityScore` interface in `scoring.ts` (lines 16-19):**
```typescript
export interface CityScore {
  rawScore: number;
  scoreFactors: { factor: string; contribution: number }[];
}
```

**Location 2 — `MatchResult` in `types.ts` (line 152):**
```typescript
scoreFactors: { factor: string; contribution: number }[];
```

**Mirror pattern for both (additive, zero fixture ripple):**
```typescript
scoreFactors: { factor: string; contribution: number; dataLevel?: 'city' | 'state' | 'proxy' | 'display-only' }[];
```

`dataLevel?` is optional — existing fixtures compile unchanged under `strict:true`. Pre-Phase-12 factors (cost, career, lifestyle, safety) emit no `dataLevel`; new factors emit one of the four literal values (RESEARCH.md §Pattern 4).

**Planner sequencing requirement:** edit `types.ts` (Location 2) AND the `CityScore` interface inside `scoring.ts` (Location 1) BEFORE adding `.push({ ..., dataLevel })` calls to `computeRawScore`. Otherwise TypeScript will reject the push.

---

### `shared/data/cities.ts` — populating optional Phase 11 fields

**Analog: Austin city literal** (`cities.ts` lines 27-52):
```typescript
{
  name: "Austin, TX",
  country: "US",
  financialModelId: "us",
  // ...required fields...
  nearMountains: false,
  nearCoast: false,
  hasIntlAirport: true,
  // Phase 11 optional fields go here (after hasIntlAirport, end of each object):
  // healthcareIndex?: number
  // disasterRiskScore?: number
  // disasterRiskRating?: string
  // schoolProficiencyPct?: number
  // childcareInfantAnnual?: number
  // childcareToddlerAnnual?: number
  // foreignBornPct?: number
  // medianAge?: number
  // neverMarriedPct?: number
  // parkScoreRank?: number
  // parkScore?: number
  // faaHubClass?: 'Large' | 'Medium' | 'Small' | 'Nonhub'
  // airportEnplanements?: number
},
```

All 13 optional field names are already declared in `types.ts` (lines 127-139). Phase 12 populates them with values from `.planning/research/deep-category-data.md`. Cities without a given value simply omit the key (D-07 neutral exclusion — never set `undefined` explicitly; just omit the key). State-level fields (`schoolProficiencyPct`, `childcareInfantAnnual`, `childcareToddlerAnnual`) repeat the same state value across cities in the same state — that is correct by design (D-08).

**Contract confirmed:** all Phase 11 City optional fields are present in `types.ts` (L127-139) with correct types. Zero schema changes needed for the city data population.

---

### `shared/engine/scoring.test.ts` — new test cases

**Analog: contribution-sum invariant test** (`scoring.test.ts` lines 67-76):
```typescript
it('scoreFactors contributions sum with BASE_SCORE to equal rawScore within 0.01', () => {
  const result = computeRawScore(testProfile, testCity);
  const contributionSum = result.scoreFactors.reduce(
    (sum, f) => sum + f.contribution,
    0
  );
  expect(Math.abs((BASE_SCORE + contributionSum) - result.rawScore)).toBeLessThan(0.01);
});
```

New tests mirror this structure but use an extended `testCity` fixture with Phase 12 optional fields populated, and an extended `testProfile` fixture with `categoryWeights` set.

**Analog: factor-presence test** (`scoring.test.ts` lines 78-85):
```typescript
it('returns scoreFactors array with at least one entry per factor ...', () => {
  const result = computeRawScore(testProfile, testCity);
  const factorNames = result.scoreFactors.map((f) => f.factor.toLowerCase());
  expect(factorNames.some((n) => n.includes('cost'))).toBe(true);
  // ...
});
```

New tests mirror this pattern to assert the 5 new factor names appear in `scoreFactors` when the corresponding city fields are populated and `categoryWeights` are non-neutral.

**Analog: crash guard / null-safe test** (`scoring.test.ts` lines 107-111):
```typescript
it('does not throw when lifestyleTags is undefined ...', () => {
  const sparseProfile = { ...testProfile, lifestyleTags: undefined as unknown as string[] };
  expect(() => computeRawScore(sparseProfile, testCity)).not.toThrow();
});
```

New tests mirror this pattern to assert:
- No throw when `categoryWeights` is absent (pre-Phase-11 profile)
- No throw when individual city fields are absent (neutral exclusion path)

The specific test cases (weight-gating, proxy fallback, state-average label, D-02 compliance) are fully specified in RESEARCH.md §Code Examples — planner transcribes those directly.

---

### `shared/engine/index.test.ts` — clamp BLOCKER test

**Analog: existing clamp + range block** (`index.test.ts` lines 53-60):
```typescript
it('clamps all matchScores to the 0–99 range (integers)', () => {
  const output = rankCities(swEngineerProfile);
  output.results.forEach((result) => {
    expect(result.matchScore).toBeGreaterThanOrEqual(0);
    expect(result.matchScore).toBeLessThanOrEqual(99);
    expect(Number.isInteger(result.matchScore)).toBe(true);
  });
});
```

**New clamp BLOCKER test mirrors this but with `maxProfile`:**
- Uses `rankCities(maxProfile)` where `maxProfile` has both `weights` at max AND `categoryWeights` at `WEIGHT_MAX_PREF` for all 5 new slugs
- Asserts `matchScore < 99` (not `<= 99`) — strict bound per D-05
- Covers all cities in the result set (same `.forEach` shape)
- **MUST live in `index.test.ts`, not `scoring.test.ts`** — because `clamp()` runs in `buildRawResult` (L99) inside `index.ts`, not in `scoring.ts`. The existing `scoring.test.ts` CR-01 test (`rawScore <= 99`) is NOT the clamp gate for the displayed score.

The full `maxProfile` fixture and test body are specified in RESEARCH.md §Code Examples — planner copies them directly.

---

## Shared Patterns

### Honest-contribution invariant guard (apply to all new contribution blocks)

**Source:** `scoring.ts` line 166
```typescript
const rawScore = BASE_SCORE + scoreFactors.reduce((s, f) => s + f.contribution, 0);
```

**Apply to:** `computeRawScore` — the rawScore derivation line must not change. New contributions are pushed to `scoreFactors` before this line. The reduce catches them. Do not accumulate `rawScore` in a separate variable alongside `scoreFactors.push()` — that is Pitfall 4.

---

### `Math.max(0, Math.min(1, ...))` clamp shell (apply to every new factorScore function)

**Source:** `scoring.ts` line 70
```typescript
return Math.max(0, Math.min(1, (140 - city.costIndex) / 80));
```

**Apply to:** `healthcareFactorScore`, `schoolsFactorScore`, `childcareFactorScore`, `connectivityFactorScore`, `parksFactorScore` (primary path). Every factor score is `[0,1]`-bounded by this shell. Never omit the outer clamp.

---

### `?? default` null guard (apply to every new optional field read)

**Source:** `scoring.ts` line 91 (`profile.lifestyleTags ?? []`) and `rankToWeight` fallback pattern (lines 38-60)

**Apply to:**
- `profile.categoryWeights?.[slug] ?? NEUTRAL_DEFAULT` in `categoryPersonalWeight`
- `city.healthcareIndex`, `city.schoolProficiencyPct`, etc. — undefined check before normalization

---

### `as const` on `SCORING_WEIGHTS` — keep intact

**Source:** `scoring-weights.ts` line 61
```typescript
} as const;
```

When adding new fields to `global` and `normalization`, the object remains `as const`. TypeScript will infer literal number types for all caps. Do not remove `as const`.

---

## No Analog Found

No files in this phase lack analogs. All new functions are intra-file extensions of existing patterns.

---

## Critical Sequencing Note for Planner

The two-location type change creates a compile dependency:

1. **First:** Add `dataLevel?` to `CityScore` in `scoring.ts` (L16-19) AND to `MatchResult` in `types.ts` (L152)
2. **Then:** Add `.push({ ..., dataLevel })` calls in `computeRawScore`

Reversing this order causes a TypeScript compile error on the `.push` calls (excess property check under `strict:true`).

Similarly, add `WEIGHT_MAX_PREF`, `WEIGHT_MAX_PRAC`, `NEUTRAL_DEFAULT` to `scoring-weights.ts` before writing `categoryPersonalWeight` in `scoring.ts` — otherwise the import will fail.

---

## Metadata

**Analog search scope:** `shared/engine/` (scoring.ts, scoring-weights.ts, index.ts, *.test.ts), `shared/types.ts`, `shared/data/cities.ts`
**Files scanned:** 6
**Pattern extraction date:** 2026-06-03
