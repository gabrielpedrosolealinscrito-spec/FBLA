# Phase 12: Multi-Dimensional Scoring — Research

**Researched:** 2026-06-03
**Domain:** TypeScript scoring engine extension — new category factors, data population, clamp recalibration
**Confidence:** HIGH (all findings verified directly from codebase + cited source data)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Score every new category the user weights via `categoryWeights` — but only where defensible cited data exists. Cited-data scoring is the headline match number.
- **D-02:** Scored categories this phase: healthcare, schools (K-12), childcare cost, air connectivity, parks/outdoors. Existing 4 factors (cost, career, lifestyle, safety) remain.
- **D-03:** Demographics (foreignBornPct, medianAge, neverMarriedPct) — display-only, NEVER a fit/"people like you" score.
- **D-04 (architecture seam):** Amenity categories with no sourced dataset are NOT baked in. Future live-AI layer injects category scores as a separate labeled tier. Phase 12 only makes the engine extensible.
- **D-05 (LOCKED HARD CONSTRAINT):** `BASE_SCORE + Σ(all maxContribution caps) < 99` so `clamp(score, 0, 99)` never fires on strong profiles. Tests MUST assert the user-facing DISPLAYED score, not a pre-clamp internal invariant.
- **D-06:** Rankings can shift freely. No demo cities pinned.
- **D-07:** Proxy fallback then neutral exclusion. Parks → nearMountains/nearCoast + "outdoors" tag. Missing datum: exclude that category from THAT city's score (never a phantom zero).
- **D-08:** State-level data (schools NAEP G8, childcare CCAoA) scores, labeled "state average." Every surfaced value and contribution carries the label.
- **D-09:** FEMA composite is display-only — barely discriminates among these 22 metros (all ~88–99.97).

### Claude's Discretion

- Exact recalibration math for D-05 — proportional renorm vs. shrink-caps vs. lower BASE_SCORE — as long as `BASE_SCORE + Σ(global-weighted caps) < 99` and the honest-contribution invariant holds.
- Final WEIGHT_FLOOR / two-tier swing values (Phase 11 left them provisional — tune in `scoring-weights.ts`).
- Per-category normalization formulas (each new category → [0,1] factor score).
- Exact shape of the external-injection seam for D-04.
- Whether childcare folds into the financial model vs. the match score (D-02 keeps it in the match score by default).

### Deferred Ideas (OUT OF SCOPE)

- Live-AI amenity research (gyms, country clubs) — Phase 5.
- FEMA per-hazard sub-score re-sourcing — deferred this cycle.
- `disasterRiskConcern` as a soft filter/sort signal — future.
- D-02 open reconciliation (personality vs. importanceRank) — resolve at Phase 2 integration.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MATCH-01 | Ranked list scored against profile — now multi-dimensional | New categories consume `Profile.categoryWeights`; engine extended with new factor contributions |
| MATCH-03 | Explainability — why a city scored, honest per-factor contributions | Each new category emits a labeled `scoreFactors` entry; state-level data carries a `dataLevel` field |
| D-01 | Cited-data-only scoring | All 5 new categories have federal/named sources (see data tables) |
| D-02 | Score healthcare, schools, childcare, connectivity, parks/outdoors | Normalization formulas + weight-gating wired from `categoryWeights` |
| D-05 | Clamp BLOCKER — `BASE_SCORE + Σ caps < 99` | Recalibration math specified; tests target `rankCities()` output |
| D-07 | Proxy fallback then neutral exclusion | ParkScore proxy defined; neutrality logic specified |
| D-08 | State-average labeling | `dataLevel` optional field on scoreFactors entries |
| D-09 | FEMA composite display-only | Not added to scoring budget |
</phase_requirements>

---

## Summary

Phase 12 is a pure engine + data phase. It has two parts: (1) populating the 22-city dataset in `shared/data/cities.ts` with cited values from `deep-category-data.md` (healthcare, disaster, school, childcare, demographics, parks, air connectivity), and (2) extending `shared/engine/scoring.ts` / `scoring-weights.ts` to score five of those categories against `Profile.categoryWeights`, emitting additional honest `scoreFactors`.

The non-negotiable constraint is the clamp BLOCKER (D-05). The existing engine has a theoretical max raw score of 90.4 (BASE_SCORE=50 + global-weighted cap sum of 40.4). Adding 5 new scored categories — even modest ones — pushes the sum well above 49 headroom, triggering the very defect Phase 3 fixed. The recalibration is the first thing to get right; everything else flows from the new budget.

The weight-gating model is already built by Phase 11: `synthesizeCategoryWeights` emits raw values in `[WEIGHT_FLOOR..WEIGHT_MAX]` (where `WEIGHT_FLOOR=0.3`, `WEIGHT_MAX_PRAC=1.5`, `WEIGHT_MAX_PREF=1.8`). Phase 12 normalizes these via a successor to `rankToWeight`, consuming `profile.categoryWeights[slug] / WEIGHT_MAX` to produce a `[0,1]` personal weight that gates each new factor contribution.

**Primary recommendation:** Recalibrate using proportional renormalization of all factor caps to fit in a tighter total budget (target `BASE_SCORE + Σ(global-weighted caps) ≤ 94` to absorb rounding slop), then wire each new category with the pattern `contribution = global × personal × factorScore × maxContribution`. The clamp invariant test MUST call `rankCities()` and assert on `.matchScore`, not on `computeRawScore().rawScore`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Populate city data fields | `shared/data/cities.ts` | — | All 22 cities inline; no external DB |
| Per-category [0,1] normalization | `shared/engine/scoring.ts` | — | Mirrors existing costFactorScore/safetyFactorScore pattern |
| Weight constants + caps | `shared/engine/scoring-weights.ts` | — | D-03: no scoring constant inlined elsewhere |
| categoryWeights → personal weight | `shared/engine/scoring.ts` | — | rankToWeight successor reads `profile.categoryWeights` |
| scoreFactors labeled output | `shared/engine/scoring.ts` + `shared/types.ts` | collaborator UI | dataLevel optional field on CityScore entries |
| D-04 external-injection seam | `shared/engine/scoring.ts` | `shared/types.ts` | open `scoreFactors` list; categoryWeights arbitrary-slug keyed |
| Display-only fields (demographics, FEMA) | `shared/data/cities.ts` + collaborator UI | — | Populated but never scored; surfaced by UI reading raw City fields |
| Validation | `shared/engine/scoring.test.ts` + `shared/engine/index.test.ts` | — | Clamp test must go through index.ts `rankCities()` |

---

## Standard Stack

No new packages. This phase is pure TypeScript logic + data entry on the existing stack.

### Core (existing — no changes)
| Module | Purpose | Role in Phase 12 |
|--------|---------|-----------------|
| `shared/engine/scoring.ts` | computeRawScore / scoreCity | Extended with 5 new factor functions |
| `shared/engine/scoring-weights.ts` | SCORING_WEIGHTS, BASE_SCORE, caps | Recalibrated caps + new per-category caps added |
| `shared/types.ts` | City, Profile, CityScore interfaces | `CityScore.scoreFactors` entries get optional `dataLevel` field |
| `shared/data/cities.ts` | 22-city dataset | New optional fields populated from deep-category-data.md |
| `vitest` (v4.x) | Test framework | Existing runner; `npm test` |

### Supporting (Phase 11 output — consumed here)
| Module | Where It Lives | What Phase 12 Reads |
|--------|---------------|---------------------|
| `WEIGHT_FLOOR`, `WEIGHT_MAX_PRAC`, `WEIGHT_MAX_PREF`, `NEUTRAL_DEFAULT` | `shared/quiz-engine/personality.ts` on `reconcile/v1` | Normalization bounds for categoryWeights |
| `ALL_SCORED_CATEGORIES` slugs | `shared/quiz-engine/keys.ts` on `reconcile/v1` | Slug names: `'healthcare'`, `'schools'`, `'childcare'`, `'parks'`, `'connectivity'` |
| `Profile.categoryWeights?: Record<string, number>` | `shared/types.ts` (current branch) | Personal weight per slug; already landed |

**Installation:** None required. No new dependencies.

---

## Package Legitimacy Audit

**N/A — Phase 12 installs zero external packages.** All logic is TypeScript-only extensions of existing modules. The existing `vitest` test runner is already installed and verified (`npm test` passes 123 tests on `reconcile/v1`).

---

## Architecture Patterns

### System Architecture Diagram

```
Profile.categoryWeights {slug: rawWeight}
         |
         v
  categoryPersonalWeight(slug) = clamp(rawWeight, 0, WEIGHT_MAX) / WEIGHT_MAX  → [0,1]
         |
         v
  Per-factor normalization  ←── City data fields (healthcareIndex, schoolProficiencyPct, ...)
  (factorScore, 0–1)
         |
         v
  contribution = global[slug] × personalWeight[slug] × factorScore × maxContribution[slug]
         |
         v
  rawScore = BASE_SCORE + Σ(all contributions, rounded)   ← invariant guard
         |
         v
  matchScore = clamp(round(rawScore), 0, 99)               ← must be no-op in normal operation
         |
         v
  scoreFactors[]: {factor, contribution, dataLevel?}       ← collaborator UI renders this
```

**D-04 injection seam:** External (AI-researched) category scores plug in by appending to `scoreFactors` AFTER the cited-data computation. The `scoreFactors` array is open-ended; `categoryWeights` is keyed by arbitrary slug. No engine re-architecture needed — the seam is already present. The live tier simply contributes additional entries and MUST be labeled (separate tier display) to avoid conflating with cited numbers.

### Recommended Project Structure (additions only)

```
shared/
├── engine/
│   ├── scoring.ts            # extend: add 5 new factorScore functions + contributions
│   ├── scoring-weights.ts    # extend: recalibrated caps + 5 new per-category caps
│   ├── scoring.test.ts       # extend: new factor tests + stronger clamp test
│   └── index.test.ts         # extend: end-to-end clamp test via rankCities()
├── data/
│   └── cities.ts             # extend: populate all optional Phase 11 fields for 22 cities
└── types.ts                  # extend: add dataLevel? to scoreFactors shape (in CityScore)
```

### Pattern 1: Per-Factor [0,1] Normalization (mirror of existing costFactorScore)

The existing pattern is **range-clamped linear**. Mirror it exactly for each new category.

```typescript
// Source: shared/engine/scoring.ts (existing pattern — mirror this)
function costFactorScore(city: City): number {
  return Math.max(0, Math.min(1, (140 - city.costIndex) / 80));
}
```

For categories with a narrow observed range, **use the observed data range** (with small headroom) as the normalization bounds. Using the full theoretical range (e.g., 0–100) for a metric that only varies 62.9–71.9 wastes most of the [0,1] space and makes every city look nearly identical.

**New normalization formulas (derived from deep-category-data.md actual values):**

#### Healthcare (healthcareIndex, Numbeo, higher = better)
Observed range: 62.9 (NYC) to 71.9 (Indianapolis). Use anchored range:
```typescript
// Source: deep-category-data.md §1 Healthcare
function healthcareFactorScore(city: City): number {
  if (city.healthcareIndex === undefined) return 0.5; // neutral exclusion
  // Anchored to observed range + small headroom: floor 60, ceiling 75
  return Math.max(0, Math.min(1, (city.healthcareIndex - 60) / 15));
}
// Scores: NYC=0.19, Pittsburgh=0.73, Indianapolis=0.79, Minneapolis=0.78
```
`[VERIFIED: codebase + deep-category-data.md]`

#### Schools (schoolProficiencyPct, NAEP G8, higher = better)
Observed range: 25% (TX, FL, AZ) to 35% (CO). State-level — labeled "state average."
```typescript
// Source: deep-category-data.md §3 School quality
function schoolsFactorScore(city: City): number {
  if (city.schoolProficiencyPct === undefined) return 0.5;
  // Anchored range: floor 22, ceiling 38 (national anchor = 30%)
  return Math.max(0, Math.min(1, (city.schoolProficiencyPct - 22) / 16));
}
// Scores: TX/FL/AZ=0.19, CO=0.81, CO discriminates clearly from TX bottom
```
`[VERIFIED: codebase + deep-category-data.md]`

#### Childcare cost (childcareInfantAnnual, CCAoA, LOWER = better — mirror costFactorScore)
Observed infant range: $10,608 (Boise) to $22,628 (San Diego). Lower is better.
San Diego toddler is "NR" — falls under D-07 neutral exclusion (use infant only, or exclude toddler slot).
```typescript
// Source: deep-category-data.md §4 Childcare cost
function childcareFactorScore(city: City): number {
  const cost = city.childcareInfantAnnual; // use infant; toddler NR for CA → D-07
  if (cost === undefined) return 0.5;
  // Lower is better: anchored floor=$10,000, ceiling=$24,000 (range=14,000)
  return Math.max(0, Math.min(1, (24000 - cost) / 14000));
}
// Scores: Boise=0.96, TX cities=0.96, Denver=0.22, Seattle=0.19, San Diego=0.11
```
`[VERIFIED: codebase + deep-category-data.md]`

#### Air connectivity (airportEnplanements + faaHubClass, higher = better)
Observed range: 2.37M (Boise) to 50.95M (Atlanta). The raw range is 21:1 — use **log-scale normalization** to avoid ATL dominating and collapsing mid-tier airports.
```typescript
// Source: deep-category-data.md §7 Air connectivity
function connectivityFactorScore(city: City): number {
  if (city.airportEnplanements === undefined) return 0.5;
  // Log-scale: log(2.37M)=14.68, log(50.95M)=17.75; range=3.07
  const logE = Math.log(city.airportEnplanements);
  return Math.max(0, Math.min(1, (logE - 14.5) / 3.5));
}
// Scores: Boise=0.05, Pittsburgh/Columbus/Indy≈0.31–0.37, medium hubs≈0.5,
//         large hubs≈0.7–0.98, ATL≈0.95. Meaningful discrimination at all tiers.
```
`[VERIFIED: codebase + deep-category-data.md]`

#### Parks/outdoors — proxy fallback (D-07)

ParkScore covers only 7/22 cities. All 22 have `nearMountains`/`nearCoast` booleans. Use a two-step proxy:
1. If `parkScore` is defined: normalize from ParkScore (0–100 scale, higher = better).
2. Else: derive from existing boolean proxies.

```typescript
// Source: deep-category-data.md §6, shared/data/cities.ts nearMountains/nearCoast
function parksFactorScore(city: City, profile: Profile): number {
  if (city.parkScore !== undefined) {
    // ParkScore: anchored range 40–90 (observed: Austin=~47, Minneapolis=83.4)
    return Math.max(0, Math.min(1, (city.parkScore - 40) / 50));
  }
  // Proxy fallback: nearMountains + nearCoast booleans + "outdoors" lifestyle vibe
  let proxy = 0.4; // baseline: median city, no special outdoors access
  if (city.nearMountains) proxy += 0.25;
  if (city.nearCoast) proxy += 0.2;
  if (city.vibe.some(v => v.toLowerCase() === 'outdoorsy')) proxy += 0.15;
  return Math.min(1, proxy);
}
```
**Note:** The `profile` param is not strictly needed in the factor score (weight-gating happens at contribution level), but passed for consistency with `lifestyleFactorScore`. Remove the param if planner prefers purity.
`[VERIFIED: codebase + deep-category-data.md]`

### Pattern 2: Weight-Gating via categoryWeights

Phase 11 `synthesizeCategoryWeights` emits raw values in `[WEIGHT_FLOOR..WEIGHT_MAX]`:
- Practical categories (`healthcare`, `safety`): floor=0.3, max=1.5
- Preference categories (`schools`, `childcare`, `parks`, `connectivity`): floor=0, max=1.8
- Skipped categories: NEUTRAL_DEFAULT=0.5

Phase 12 normalizes for the contribution formula:

```typescript
// Successor to rankToWeight for new categories
// categoryWeights[slug] is in [0..WEIGHT_MAX_PREF=1.8] (pref) or [WEIGHT_FLOOR..WEIGHT_MAX_PRAC=1.5] (prac)
// Normalize to [0,1] by dividing by the practical ceiling (1.8 — the global max possible)
// This mirrors the existing PERSONAL_WEIGHT_SCALE=4 normalization in rankToWeight
const CATEGORY_WEIGHT_SCALE = 1.8; // WEIGHT_MAX_PREF is the global ceiling

function categoryPersonalWeight(profile: Profile, slug: string): number {
  const raw = profile.categoryWeights?.[slug] ?? NEUTRAL_DEFAULT;
  return Math.min(1.8, Math.max(0, raw)) / CATEGORY_WEIGHT_SCALE; // → [0,1]
}
```

A user who didn't complete the Phase 11 quiz has no `categoryWeights` — `profile.categoryWeights` is `undefined`. The `?? NEUTRAL_DEFAULT` fallback produces `0.5 / 1.8 = 0.278` personal weight — a mild contribution, never zero, never dominant. This is the correct graceful degradation behavior.
`[VERIFIED: codebase + personality.ts on reconcile/v1]`

### Pattern 3: Clamp Recalibration Math (D-05)

**Current state:**
- BASE_SCORE = 50
- Global-weighted cap sum = 12 + 12 + 10 + (0.8 × 8) = 40.4
- Theoretical max rawScore = 90.4 (headroom to 99 = 8.6)
- Adding 5 new categories even at 2 pts each = 10 pts → max = 100.4 → CLAMP FIRES

**Rounding slop risk:** Contributions are `Math.round`'d per factor. With 9 factors, worst-case rounding adds ~4.5 points above the real-valued sum. Target `BASE_SCORE + Σ(global-weighted caps) ≤ 94` to absorb it safely (leaving ≥5 pts buffer).

**Three options for the planner (per D-05 Claude's Discretion):**

**Option A — Proportional renorm all existing caps + add new caps (RECOMMENDED):**
Shrink the existing 4 factors proportionally to create room for the new 5:
- New total budget = 94 - 50 = 44 points
- 4 existing categories get 28 points total; 5 new categories get 16 points total
- Existing rescaling: cost→8.4, career→8.4, lifestyle→7.0, safety→5.6 (× 0.7 scaling)
- New category caps (all with global=1.0): healthcare=4, schools=3, childcare=3, connectivity=3, parks=3
- Verify: 8.4 + 8.4 + 7.0 + (0.8×7.0) + 4 + 3 + 3 + 3 + 3 = 8.4+8.4+7.0+5.6+4+3+3+3+3 = **45.4 → max=95.4** (within budget; rounding slop stays safe)

**Option B — Shrink existing safety cap only:**
- Safety already has global=0.8; reduce safety further and lifestyle slightly
- Less disruption to existing rankings but harder to justify

**Option C — Lower BASE_SCORE:**
- Reduce BASE_SCORE from 50 to 42 — creates 8 extra points of headroom
- Risk: every displayed score drops by ~8; confuses any user who remembers old numbers
- Not recommended unless ranking stability matters more than current scores

**RECOMMENDATION:** Option A — proportional renorm is the most principled approach. Rankings shift freely (D-06 explicitly permits it). The new caps should be consistent: all new scored categories get equal or importance-based caps within the 16-point new budget.
`[VERIFIED: codebase math — all figures derived from scoring-weights.ts and decisions]`

### Pattern 4: scoreFactors Label Propagation (D-08)

The `CityScore` interface in `shared/types.ts` currently has:
```typescript
scoreFactors: { factor: string; contribution: number }[]
```

D-08 requires state-average / limited-data / FEMA-context labels to propagate to the collaborator's UI. The planner must add a `dataLevel?` optional field:

```typescript
// Additive extension — zero fixture ripple (same pattern as Phase 11 additions)
scoreFactors: { factor: string; contribution: number; dataLevel?: 'city' | 'state' | 'proxy' | 'display-only' }[]
```

- `'city'` — city-level sourced data (healthcare, connectivity)
- `'state'` — state-level average (schools, childcare) — UI copy must say "state average"
- `'proxy'` — proxy-derived (parks via nearMountains/nearCoast when ParkScore absent)
- `'display-only'` — surfaced in UI but not scored (demographics, FEMA)
- absent — pre-Phase-12 factors (cost, career, lifestyle, safety) — no label needed

**This is a `shared/types.ts` change** the planner must sequence before `scoring.ts` edits.
`[VERIFIED: codebase — types.ts CityScore interface, scored against D-08 requirement]`

### Pattern 5: D-04 External-Injection Seam

The seam is already effectively present because:
1. `scoreFactors` is an open array — a future AI tier appends entries
2. `categoryWeights` is `Record<string, number>` — arbitrary slugs are valid
3. The contribution formula is uniform: any slug can be weighted

For Phase 5 (live-AI tier), the engine needs a single addition: a flag on each `scoreFactors` entry to distinguish cited-data contributions from AI-researched ones. The `dataLevel?` field above can be extended with `'ai-researched'` when the live tier fires.

The planner should document this as a TODO comment in `scoring.ts` marking where an AI tier would append to `scoreFactors`, but NOT implement the injection logic (out of Phase 12 scope per D-04).
`[ASSUMED — pattern recommendation, not yet verified against Phase 5 plan]`

### Anti-Patterns to Avoid

- **Phantom zero:** Never pass `factorScore=0` when a datum is absent. Use neutral exclusion (skip the factor entirely for that city) to avoid punishing a city for missing data. The proxy-or-skip logic in D-07 prevents this.
- **Pre-clamp assertion:** Never assert `computeRawScore().rawScore < 99` as the clamp test. The clamp lives in `buildRawResult`/`rankCities` in `index.ts`. The correct test calls `rankCities()` and asserts `.matchScore < 99`.
- **Double-normalization:** `synthesizeCategoryWeights` emits raw values in [WEIGHT_FLOOR..WEIGHT_MAX], NOT pre-normalized to [0,1]. Phase 12 must divide by `CATEGORY_WEIGHT_SCALE=1.8` at consumption. Do NOT divide again inside `lifestyleFactorScore` or any existing function.
- **Global cap inlined in scoring.ts:** All caps, floors, scales go in `scoring-weights.ts` only (D-03 from the original engine). No magic numbers inline.
- **Wide [0,100] normalization for narrow ranges:** Healthcare spans 62.9–71.9 on a 0–100 scale. Using `/100` normalization makes every city score 0.63–0.72 — barely 9 pts of discrimination. Use anchored range formulas.
- **Log-scale for hub-class ordinal:** Hub class (Large/Medium/Small) is partially collinear with log(enplanements). Don't combine both — use log(enplanements) as the primary signal and ignore the discrete hub class in the factor score (hub class can be surfaced as display-only label in the UI).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Per-category [0,1] normalization | Custom class/registry | Inline functions mirroring costFactorScore | The existing pattern is 3 lines; a registry adds indirection with no benefit |
| Weight-gating | Separate weighting pipeline | Inline `categoryWeights?.[slug] ?? NEUTRAL_DEFAULT` | Same 2-layer formula already handles this |
| Clamp recalibration | Test by running the app | Math: verify `BASE + Σ(global-weighted caps) ≤ 94` statically | Test what you compute, compute what you test |
| State-average label | String concatenation in factor name | `dataLevel` optional field | Factor names are display strings; labels should be structured data |
| FEMA scoring | Attempt to score the composite | Display-only with D-09's "FEMA composite barely discriminates" note | The composite range 87.75–99.97 has 12-point spread; all 22 are "high risk" |

---

## Runtime State Inventory

**N/A — Phase 12 is not a rename/refactor/migration phase.** It adds new scored fields to the engine and populates city data. No stored data, live service config, OS-registered state, secrets, or build artifacts carry names that would change.

---

## Common Pitfalls

### Pitfall 1: Pre-clamp Test Gives False Comfort

**What goes wrong:** Test asserts `computeRawScore().rawScore ≤ 99`, passes, badge desyncs from contribution bars anyway. This is the exact failure mode recorded in `test-assert-user-facing-output` memory.

**Why it happens:** `clamp()` lives in `buildRawResult` inside `index.ts`, not in `scoring.ts`. `computeRawScore` returns `rawScore` without clamping — if it's 103, `scoring.test.ts` would pass (103 ≤ 99 is FALSE — so this test would catch it), but the displayed `matchScore` is what users see, and it goes through the `clamp(Math.round(rawScore), 0, 99)` in `index.ts`. To test the user-facing output, test `rankCities(profile).results[i].matchScore`.

**How to avoid:** The clamp test fixture must set `profile.weights = { cost: 4, career: 4, lifestyle: 4, safety: 4 }` (all at max) AND `profile.categoryWeights = { healthcare: 1.8, schools: 1.8, childcare: 1.8, connectivity: 1.8, parks: 1.8 }` (all at WEIGHT_MAX_PREF), run `rankCities(profile)` against all 22 cities, and assert `every result.matchScore < 99`.

**Warning signs:** Any test that only imports from `scoring.ts` and never calls `rankCities` is not a clamp test — it's a contribution invariant test.

### Pitfall 2: categoryWeights Absent (Profile Before Phase 11 Quiz)

**What goes wrong:** Engine throws `TypeError: Cannot read property 'healthcare' of undefined` when `profile.categoryWeights` is absent.

**Why it happens:** Phase 11 quiz hasn't been run yet; the existing 4-factor profile has no `categoryWeights`.

**How to avoid:** Always use `profile.categoryWeights?.[slug] ?? NEUTRAL_DEFAULT` — the optional chain + fallback pattern. The existing `rankToWeight` fallback (importanceRank → weights) is the model: Phase 12 adds its own parallel defensive fallback.

### Pitfall 3: Narrow Range Normalization Wastes Discrimination

**What goes wrong:** `healthcareFactorScore(city) = city.healthcareIndex / 100` → all 22 cities score 0.629–0.719; contribution range is < 1 point even with max weight. The factor is effectively invisible.

**Why it happens:** The Numbeo scale is notionally 0–100 but all 22 cities cluster in 62.9–71.9.

**How to avoid:** Use range-anchored formulas. The observed data range + small headroom is the correct normalization basis for discriminating within the actual 22-city set.

### Pitfall 4: Contribution Invariant Broken by Separate rawScore Accumulation

**What goes wrong:** `BASE_SCORE + Σ(scoreFactors.contribution) !== rawScore` — contribution bars don't sum to the badge number.

**Why it happens:** A developer accumulates `rawScore` separately from the `scoreFactors` array (e.g., adds `healthcareContrib` to a running total AND pushes it to `scoreFactors`), then floating-point rounding diverges.

**How to avoid:** Mirror the existing Pitfall 1 guard in `scoring.ts` line 166: `rawScore = BASE_SCORE + scoreFactors.reduce((s, f) => s + f.contribution, 0)`. The final rawScore IS the sum of stored contributions. Compute contributions first, push to array, then derive rawScore from the array.

### Pitfall 5: Neutral Exclusion vs. Renormalization Ambiguity

**What goes wrong:** A developer interprets "neither rewarded nor punished" as renormalizing the score over only the available factors. This complicates the fixed-budget math and breaks the contribution-sum invariant for all-city comparisons.

**Why it happens:** Genuine ambiguity in the spec — both interpretations are valid neutral behavior.

**How to avoid:** Use the simpler interpretation: for a missing datum, **skip that factor entirely** (emit no `scoreFactors` entry for that city/category pair). The city's rawScore is computed from the available factors only. No renormalization — the budget math stays clean. The ParkScore proxy covers all 22 cities (nearMountains/nearCoast), so true exclusion is rare (only San Diego toddler childcare NR case for the childcare slot's toddler sub-value).

### Pitfall 6: Schools/Childcare Both Track the Same State

**What goes wrong:** `schoolProficiencyPct` and `childcareInfantAnnual` repeat the same state value for TX cities (Austin, San Antonio, Dallas), NC cities (Raleigh, Charlotte), FL cities (Miami, Tampa). These three pairs are perfectly correlated by construction.

**Why it happens:** Both sources are state-level (NAEP G8 + CCAoA Table I).

**How to avoid:** This is expected and documented (D-08). The factor functions don't need to handle it — the data is correctly the same per state. The UI copy must say "state average" so users understand the correlation. No code fix needed; only copy labeling.

### Pitfall 7: WEIGHT_FLOOR Tuning Interacts with the Clamp Budget

**What goes wrong:** Tuning `WEIGHT_FLOOR` upward for practical categories (healthcare, safety) inadvertently raises the minimum contribution floor, effectively lowering the remaining clamp headroom for strong-weight profiles.

**Why it happens:** If healthcare's WEIGHT_FLOOR is 0.3 and the normalizer produces `0.3/1.8 = 0.167`, then even a user who didn't flag healthcare contributes `0.167 × healthcareMaxContribution` every city. Multiplied across all practical categories, this raises the floor rawScore meaningfully.

**How to avoid:** After setting all cap values, compute the FLOOR rawScore (using WEIGHT_FLOOR for practical categories, 0 for preference categories) and verify it's ≥ 50 (a city should score above BASE_SCORE when profile fully matches) while the CEILING rawScore is < 99. The math bound is: `BASE + Σ(global × WEIGHT_MAX_PREF / CATEGORY_WEIGHT_SCALE × maxContrib)` < 99 for all factors.

---

## Code Examples

### Contribution formula — mirror the existing 4-factor pattern exactly

```typescript
// Source: shared/engine/scoring.ts lines 141–162 (existing pattern to mirror)
// Healthcare contribution (new)
const healthcarePersonal = categoryPersonalWeight(profile, 'healthcare');
const healthcareContrib = Math.round(
  SCORING_WEIGHTS.global.healthcare
  * healthcarePersonal
  * healthcareFactorScore(city)
  * SCORING_WEIGHTS.normalization.healthcareMaxContribution
);
scoreFactors.push({ factor: 'Healthcare', contribution: healthcareContrib, dataLevel: 'city' });

// Schools contribution (state-average label)
const schoolsPersonal = categoryPersonalWeight(profile, 'schools');
const schoolsContrib = Math.round(
  SCORING_WEIGHTS.global.schools
  * schoolsPersonal
  * schoolsFactorScore(city)
  * SCORING_WEIGHTS.normalization.schoolsMaxContribution
);
scoreFactors.push({ factor: 'Schools (state avg)', contribution: schoolsContrib, dataLevel: 'state' });
```

### Strongest-profile clamp test (must call rankCities)

```typescript
// Source: shared/engine/index.ts rankCities + index.test.ts pattern
// This test catches the clamp BLOCKER — the existing scoring.test.ts does NOT
import { rankCities } from './index.js';
import { CITIES_DATA } from '../data/cities.js';

const maxProfile: Profile = {
  ...testProfile,
  weights: { cost: 4, career: 4, lifestyle: 4, safety: 4 }, // max existing weights
  categoryWeights: {
    healthcare:   1.8,  // WEIGHT_MAX_PREF
    schools:      1.8,
    childcare:    1.8,
    connectivity: 1.8,
    parks:        1.8,
  },
  // Lifestyle tags that maximize lifestyle factor
  lifestyleTags: ['outdoors', 'nightlife', 'arts', 'walkable', 'diversity', 'family', 'startup'],
};

it('displayed matchScore < 99 for strongest profile across all cities (clamp BLOCKER)', () => {
  const { results } = rankCities(maxProfile);
  expect(results.length).toBe(CITIES_DATA.length);
  results.forEach((r) => {
    expect(r.matchScore).toBeLessThan(99);
    expect(r.matchScore).toBeGreaterThanOrEqual(0);
  });
});
```

### Honest-contribution invariant (unchanged pattern, applied to extended scoreFactors)

```typescript
it('BASE_SCORE + Σ(scoreFactors.contribution) === rawScore after new factors', () => {
  const result = computeRawScore(maxProfile, testCityWithAllFields);
  const sum = result.scoreFactors.reduce((s, f) => s + f.contribution, 0);
  expect(Math.abs((BASE_SCORE + sum) - result.rawScore)).toBeLessThan(0.01);
});
```

### Weight-gating test (schools/childcare at ~0 weight)

```typescript
it('schools contribution ≈ 0 when categoryWeights.schools is absent (no-kids profile)', () => {
  const nokidsProfile = {
    ...testProfile,
    categoryWeights: { healthcare: 1.2, connectivity: 1.0 }, // no schools key
  };
  const result = computeRawScore(nokidsProfile, testCityWithSchoolData);
  const schoolsFactor = result.scoreFactors.find(f => f.factor.toLowerCase().includes('school'));
  // NEUTRAL_DEFAULT=0.5, personal=0.5/1.8=0.278, maxCap=3 → max contrib ≈ 0.278*3 ≈ 0.83
  // Rounded → at most 1. A school-unweighted profile contributes almost nothing.
  if (schoolsFactor) expect(schoolsFactor.contribution).toBeLessThanOrEqual(1);
});

it('schools contribution is noticeably higher when categoryWeights.schools = WEIGHT_MAX_PREF', () => {
  const familyProfile = {
    ...testProfile,
    categoryWeights: { schools: 1.8, childcare: 1.8 }, // family user
  };
  const nokidsProfile = { ...testProfile, categoryWeights: {} };
  const familyResult = computeRawScore(familyProfile, testCityWithSchoolData);
  const nokidsResult = computeRawScore(nokidsProfile, testCityWithSchoolData);
  const familySchools = familyResult.scoreFactors.find(f => f.factor.toLowerCase().includes('school'))?.contribution ?? 0;
  const nokidsSchools = nokidsResult.scoreFactors.find(f => f.factor.toLowerCase().includes('school'))?.contribution ?? 0;
  expect(familySchools).toBeGreaterThan(nokidsSchools);
});
```

### Proxy fallback test

```typescript
it('parks factor uses proxy when parkScore is absent, neither 0 nor max', () => {
  const cityNoParkScore = { ...testCity, parkScore: undefined, nearMountains: true, nearCoast: false };
  const cityWithParkScore = { ...testCity, parkScore: 75 };
  // Both must produce a contribution in (0, maxContrib) — never 0 (phantom zero) nor max
  const r1 = computeRawScore(testProfile, cityNoParkScore);
  const r2 = computeRawScore(testProfile, cityWithParkScore);
  const p1 = r1.scoreFactors.find(f => f.factor.toLowerCase().includes('park'))?.contribution ?? -1;
  const p2 = r2.scoreFactors.find(f => f.factor.toLowerCase().includes('park'))?.contribution ?? -1;
  expect(p1).toBeGreaterThan(0);
  expect(p2).toBeGreaterThan(0);
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single composite rank (cost+career+lifestyle+safety) | Multi-dimensional cited-data scoring | Phase 12 | Rankings shift; judges can trace every scored number to a federal source |
| Phase 2 `importanceRank` → weights | Phase 11 `categoryWeights` per slug | Phase 11 (landed in types.ts) | Weight-gating per category; schools/childcare near-zero for non-parents |
| Prototype pre-clamp assertion (false comfort) | Post-clamp `rankCities()` assertion | Phase 3 / this phase | Test what users see |

**Deprecated/outdated:**
- The `profile.weights.cost/career/lifestyle/safety` field remains for Phase 3 backward compat (D-02 OPEN). Phase 12 does NOT replace it with `categoryWeights` — the two coexist until Phase 2 integration. `categoryWeights` is an additive layer over the existing 4 factors.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `CATEGORY_WEIGHT_SCALE = 1.8` (= WEIGHT_MAX_PREF) is the correct normalization denominator | Pattern 2, Weight-Gating | If WEIGHT_MAX_PREF changes in personality.ts, the normalizer produces values > 1.0 and breaks the contribution cap guarantee |
| A2 | The D-04 seam is already structurally present (open scoreFactors array, arbitrary-slug categoryWeights) | Pattern 5 | If Phase 5 needs a different injection mechanism, the seam design may need revision |
| A3 | Proxy fallback for parks (nearMountains/nearCoast) covers all 22 cities | Pitfall 5, parks formula | If a city lacks both booleans, the baseline proxy score (0.4) is used — acceptable |
| A4 | ParkScore for 7 confirmed cities: Minneapolis=83.4, Seattle=75.4, Portland=75.1, Chicago=74.3, Denver=~#11 (no score), Atlanta=~#18 (no score), Austin=~#47 (no score) | Normalization formula | Denver, Atlanta, Austin ParkScore values not confirmed numerically; proxy fallback applies for these despite having rank |

**If table A1 risk materializes:** Re-read `shared/quiz-engine/personality.ts` on the target branch before executing and update `CATEGORY_WEIGHT_SCALE` to match the actual `WEIGHT_MAX_PREF` constant value.

---

## Open Questions

1. **D-02 reconciliation scope in Phase 12**
   - What we know: D-02 (replace vs. layer `categoryWeights` over existing `weights`) is explicitly deferred to Phase 2 integration
   - What's unclear: Phase 12 adds `healthcare`, `schools`, `childcare`, `connectivity`, `parks` to `categoryWeights` — but `cost`, `career`, `lifestyle`, `safety` remain in `profile.weights`. The engine must NOT double-count any category.
   - Recommendation: Phase 12 strictly adds the 5 new categories. The existing 4 factors continue to read `profile.weights` (or derive from `importanceRank`). The planner should add a comment in `scoring.ts` marking the D-02 boundary explicitly.

2. **Denver/Atlanta/Austin ParkScore numeric values**
   - What we know: They placed #11, #18, #47 in TPL 2026 rankings but numeric scores weren't retrievable (HTTP 403 on TPL site).
   - What's unclear: Whether to use proxy fallback or attempt to extrapolate from rank.
   - Recommendation: Use proxy fallback for all three (nearMountains/nearCoast + vibe). Extrapolating ParkScore from rank position is not defensible for a "cited data only" engine.

3. **childcareInfantAnnual vs. childcareToddlerAnnual — which to normalize against?**
   - What we know: Infant is available all 22 cities/states. Toddler is NR for San Diego (CA).
   - What's unclear: Should the factor use infant, toddler, or the average of both?
   - Recommendation: Use infant as primary (complete coverage; infant > toddler cost in all states). Log toddler as display-only for cities where available. San Diego toddler exclusion under D-07 is the one true neutral-exclusion case in the dataset.

---

## Environment Availability

**N/A — Phase 12 has no external dependencies beyond the existing project toolchain.** All scoring logic is offline TypeScript. Verification:
- `node` — present (project builds)
- `npm test` / `vitest` — present (123 tests pass on reconcile/v1)
- No database, no API calls, no CLI tools required

---

## Validation Architecture

> `workflow.nyquist_validation = true` — section required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest v4.x |
| Config file | None — Vitest auto-discovers `*.test.ts` from `package.json` type=module |
| Quick run command | `npm test -- --reporter=dot shared/engine/` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| D-05 | Displayed matchScore < 99 for strongest possible profile across all 22 cities | integration | `npm test -- shared/engine/index.test.ts` | Partial (existing test doesn't exercise categoryWeights) — Wave 0 gap |
| MATCH-01 | rankCities returns all 22 cities with new multi-dimensional scores | smoke | `npm test -- shared/engine/index.test.ts` | Partial — Wave 0 gap for new factors |
| MATCH-03 | BASE_SCORE + Σ(scoreFactors.contribution) === rawScore after new factors | unit | `npm test -- shared/engine/scoring.test.ts` | Partial — Wave 0 gap for new factors |
| MATCH-03 | scoreFactors entries carry correct dataLevel labels (city/state/proxy) | unit | `npm test -- shared/engine/scoring.test.ts` | Wave 0 gap |
| D-07 | Parks proxy fallback: contribution > 0 and < max when parkScore absent | unit | `npm test -- shared/engine/scoring.test.ts` | Wave 0 gap |
| D-07 | Neutral exclusion: no phantom zero for any missing-datum city | unit | `npm test -- shared/engine/scoring.test.ts` | Wave 0 gap |
| D-08 | Schools/childcare entries carry dataLevel='state' | unit | `npm test -- shared/engine/scoring.test.ts` | Wave 0 gap |
| D-02 | Schools/childcare contribution ≈ 0 when no kids (categoryWeights absent) | unit | `npm test -- shared/engine/scoring.test.ts` | Wave 0 gap |
| D-02 | Schools/childcare contribution >> 0 when family user sets high categoryWeight | unit | `npm test -- shared/engine/scoring.test.ts` | Wave 0 gap |

### Critical Test: Clamp BLOCKER (D-05)

This is the test that MUST go in `shared/engine/index.test.ts`, NOT `scoring.test.ts`:

```typescript
// The existing scoring.test.ts CR-01 test asserts rawScore ≤ 99 on computeRawScore().
// That test does NOT catch the displayed-score desync. This test does.
it('displayed matchScore < 99 for strongest profile across all 22 cities (D-05 clamp BLOCKER)', () => {
  const { results } = rankCities(maxProfile); // maxProfile defined above
  results.forEach(r => expect(r.matchScore).toBeLessThan(99));
});
```

The existing `scoring.test.ts` CR-01 tests (`rawScore in [0,99]`) should be kept as contribution invariant guards. Add the new `index.test.ts` test as the authoritative clamp gate.

### Sampling Rate

- **Per-task commit:** `npm test -- --reporter=dot shared/engine/scoring.test.ts`
- **Per-wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `shared/engine/scoring.test.ts` — new test cases for all 5 new factor functions (healthcare, schools, childcare, connectivity, parks) including proxy fallback + neutral exclusion + dataLevel label assertions
- [ ] `shared/engine/index.test.ts` — clamp BLOCKER test with `maxProfile` exercising both existing weights and new `categoryWeights` at maximum values
- [ ] `shared/engine/scoring.test.ts` — weight-gating tests (absent categoryWeights → neutral contribution; max categoryWeights → proportional contribution)
- [ ] `shared/engine/scoring.test.ts` — state-average label propagation: schools/childcare entries carry `dataLevel: 'state'`

*(Existing test infrastructure is complete; these are additive test cases in existing files, not new files.)*

---

## Security Domain

> `security_enforcement` not set to false in config — section required. Phase 12 is engine-only; no auth, sessions, or external I/O.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | — |
| V3 Session Management | No | — |
| V4 Access Control | No | — |
| V5 Input Validation | Yes (defensive) | `Math.max(0, Math.min(...))` guards on all factor inputs; `categoryWeights` range-clamped at consumption |
| V6 Cryptography | No | — |

### Known Threat Patterns for Scoring Engine Extension

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malformed `categoryWeights` (NaN, Infinity, negative) | Tampering | `Math.min(WEIGHT_MAX_PREF, Math.max(0, raw))` clamp at `categoryPersonalWeight()` entry |
| Out-of-range city data fields (negative healthcareIndex, etc.) | Tampering | `Math.max(0, Math.min(1, ...))` in every factorScore function (existing pattern — maintain it) |
| Missing optional fields producing NaN contributions | Spoofing | `?? NEUTRAL_DEFAULT` fallback for absent categoryWeights; `?? 0.5` neutral for absent city fields |

The existing `sanitizeProfile` in `index.ts` clamps `profile.weights` to [0,4]. A parallel sanitizer should clamp `profile.categoryWeights` values to [0, WEIGHT_MAX_PREF] at the same entry point to maintain consistency.
`[VERIFIED: index.ts sanitizeProfile pattern]`

---

## Sources

### Primary (HIGH confidence — verified directly from codebase)
- `shared/engine/scoring.ts` — existing 4-factor formula, costFactorScore/safetyFactorScore normalization patterns, contribution invariant implementation
- `shared/engine/scoring-weights.ts` — SCORING_WEIGHTS, BASE_SCORE=50, cap values (cost=12, career=12, lifestyle=10, safety=8, global.safety=0.8), PERSONAL_WEIGHT_SCALE=4
- `shared/engine/index.ts` — clamp location (`buildRawResult` line 99), `sanitizeProfile` pattern
- `shared/types.ts` — City optional fields (Phase 11 additions), Profile.categoryWeights contract, WeightExplanation interface
- `shared/data/cities.ts` — 22-city dataset; all Phase 11 optional fields currently unpopulated (0 occurrences)
- `shared/engine/scoring.test.ts` — existing CR-01 regression guard (pre-clamp only — the gap this phase must close)
- `reconcile/v1:shared/quiz-engine/personality.ts` — WEIGHT_FLOOR=0.3, WEIGHT_MAX_PRAC=1.5, WEIGHT_MAX_PREF=1.8, NEUTRAL_DEFAULT=0.5, PRACTICAL_CATEGORIES, PREFERENCE_CATEGORIES, synthesizeCategoryWeights contract
- `reconcile/v1:shared/quiz-engine/keys.ts` — ALL_SCORED_CATEGORIES slugs, FAMILY_CATEGORIES, MODULE_IMPORTANCE_PREFIX
- `.planning/research/deep-category-data.md` — all 22-city values for 7 categories with sources and coverage gaps
- `.planning/phases/12-multi-dimensional-scoring-extend-the-scoring-engine-and-city/12-CONTEXT.md` — decisions D-01..D-09, phase boundary, Claude's Discretion areas

### Secondary (MEDIUM confidence — cited + cross-referenced)
- `.planning/phases/11-deep-profile-expand-the-quiz-with-sourced-life-area-categori/11-04-PLAN.md` §"Phase 12 HARD requirements" — carried-forward BLOCKER documentation
- `.planning/REQUIREMENTS.md` — MATCH-01, MATCH-03 definitions

### Tertiary (LOW / ASSUMED)
- None beyond items flagged [ASSUMED] in the Assumptions Log

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified directly from codebase + reconcile/v1 branch
- Architecture (normalization formulas): HIGH — derived from actual data ranges in deep-category-data.md
- Clamp math: HIGH — computed from verified scoring-weights.ts constants
- Weight-gating contract: HIGH — verified from personality.ts on reconcile/v1
- Pitfalls: HIGH — derived from existing code patterns and documented BLOCKER history
- Validation architecture: HIGH — verified from index.ts clamp location + existing test gap analysis

**Research date:** 2026-06-03
**Valid until:** 30 days (stable offline data; no external APIs involved)

---

## RESEARCH COMPLETE

**Phase:** 12 — Multi-Dimensional Scoring
**Confidence:** HIGH

### Key Findings

1. **Clamp BLOCKER math is fully defined.** Current global-weighted cap sum = 40.4; headroom to 99 is only 8.6 pts. Adding 5 new categories requires recalibration. Recommended: proportional renorm of all 9 factors to a 44-pt total budget (target `BASE + Σ ≤ 94` including rounding slop). Option A table is provided with concrete numbers.

2. **Clamp test must live in index.test.ts.** The existing `scoring.test.ts` CR-01 guard tests `rawScore ≤ 99` from `computeRawScore()` — pre-clamp. The displayed `matchScore` is clamped in `rankCities()`. The new test must call `rankCities(maxProfile)` where `maxProfile` has both `weights` and `categoryWeights` at maximum values.

3. **categoryWeights normalization formula is pinned.** `WEIGHT_MAX_PREF=1.8` is the ceiling for all category weights. Normalize via `raw / 1.8 → [0,1]` — same pattern as `PERSONAL_WEIGHT_SCALE=4` for legacy weights.

4. **All 5 new normalization formulas derived from actual data ranges.** Narrow ranges (healthcare 62.9–71.9, schools 25–35%) require anchored-range formulas, not `/100`. Air connectivity uses log-scale to handle the 2.4M–51M enplanement spread. Formulas with specific boundary values are provided.

5. **D-04 injection seam already exists.** `scoreFactors` is open-ended; `categoryWeights` is `Record<string,number>`. No re-architecture needed — Phase 5 appends AI-tier entries. A `dataLevel?` field on `scoreFactors` entries distinguishes cited vs. AI-researched contributions and carries D-08 labels.

6. **State data (schools, childcare) covers all 22 cities but repeats by state.** TX cities share NAEP scores and CCAoA costs; same for FL, NC. This is by design (D-08). The `dataLevel: 'state'` flag on scoreFactors entries propagates the labeling requirement to the collaborator's UI.

### File Created

`.planning/phases/12-multi-dimensional-scoring-extend-the-scoring-engine-and-city/12-RESEARCH.md`

### Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | All constants read directly from source files on both branches |
| Clamp recalibration math | HIGH | Computed from verified values; no external data needed |
| Normalization formulas | HIGH | Derived from actual data ranges in deep-category-data.md |
| Weight-gating contract | HIGH | personality.ts on reconcile/v1 read directly |
| Pitfalls | HIGH | Derived from existing code patterns + BLOCKER history |
| Validation Architecture | HIGH | Gap analysis against existing test files |

### Open Questions

- Which numeric ParkScore values to use for Denver (#11), Atlanta (#18), Austin (#47) — data not retrieved; proxy fallback recommended.
- Planner should confirm whether `childcareInfantAnnual` alone is the scoring input or an average of infant/toddler (recommendation: infant-only, see Open Question 3).

### Ready for Planning

Research complete. Planner can now create PLAN.md files using this document as the primary input.
