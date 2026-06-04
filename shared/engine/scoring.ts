// ─────────────────────────────────────────────────────────────────
// Potential — City Scoring Engine (Phase 3, Plan 04)
// D-04: Two-layer config-driven scoring with honest contribution collection.
// Contributions are the LITERAL additive terms: BASE_SCORE + sum(contributions) === rawScore.
// No dealbreaker penalties applied here — that is dealbreakers.ts (D-02 two-pass).
// All coefficients come from SCORING_WEIGHTS. No magic numbers inline.
// ─────────────────────────────────────────────────────────────────

import { SCORING_WEIGHTS, BASE_SCORE, PERSONAL_WEIGHT_SCALE, WEIGHT_MAX_PREF, WEIGHT_MAX_PRAC, NEUTRAL_DEFAULT } from './scoring-weights.js';
import type { Profile, City } from '../types.js';

// Re-export BASE_SCORE so scoring.test.ts can import it from this module.
export { BASE_SCORE } from './scoring-weights.js';

// ── Output Shape ──────────────────────────────────────────────────
export interface CityScore {
  rawScore: number;
  scoreFactors: { factor: string; contribution: number; dataLevel?: 'city' | 'state' | 'proxy' | 'none' | 'display-only' }[];
}

// ── Weight Derivation ─────────────────────────────────────────────
// Phase 2's synthesizeProfile emits Profile.weights. If it hasn't merged yet,
// fall back to deriving weights from importanceRank: rank 0 → 4, 1 → 3, 2 → 2, 3 → 1.
// This fallback mirrors the Phase 2 rankToWeight logic exactly.
//
// CR-01 fix: normalize all returned weights to [0, 1] by dividing by
// PERSONAL_WEIGHT_SCALE (= 4). This ensures maxContribution caps mean what they say:
// max contribution per factor = global[f] × 1.0 × 1.0 × maxContribution[f].
// Theoretical max rawScore = BASE_SCORE + sum(global[f] × maxContribution[f]) = 90.4
// → clamp(rawScore, 0, 99) is always a no-op in normal operation.
//
// T-3-06: Clamp raw values to [0, 4] before normalizing (prevents amplification from
//         out-of-range quiz-derived values).
function rankToWeight(profile: Profile): { cost: number; career: number; lifestyle: number; safety: number } {
  const norm = (v: number): number =>
    Math.min(PERSONAL_WEIGHT_SCALE, Math.max(0, v)) / PERSONAL_WEIGHT_SCALE;

  if (profile.weights) {
    return {
      cost:      norm(profile.weights.cost),
      career:    norm(profile.weights.career),
      lifestyle: norm(profile.weights.lifestyle),
      safety:    norm(profile.weights.safety),
    };
  }
  // Fallback: derive from importanceRank (Phase 2 not yet merged)
  const rank = profile.importanceRank;
  const raw = (cat: string): number => {
    const i = rank.indexOf(cat);
    if (i === 0) return 4;
    if (i === 1) return 3;
    if (i === 2) return 2;
    return 1; // rank 3 or missing
  };
  return {
    cost:      norm(raw('cost')),
    career:    norm(raw('career')),
    lifestyle: norm(raw('lifestyle')),
    safety:    norm(raw('safety')),
  };
}

// ── Per-Factor Normalization ──────────────────────────────────────
// Each factor is normalized to [0, 1] before weighting.
// Formulas from 03-RESEARCH.md D-04 Per-Factor Normalization.

// Cost: lower costIndex = higher score.
// Scale: US national average = 100. costIndex 60 → 1.0; costIndex 140 → 0.0.
function costFactorScore(city: City): number {
  return Math.max(0, Math.min(1, (140 - city.costIndex) / 80));
}

// Career: higher jobGrowth + remote bonus. 5% growth = full score.
function careerFactorScore(city: City, profile: Profile): number {
  const growthScore = Math.min(1, city.jobGrowth / 5.0);
  const remoteBonus = profile.hasRemote ? 0.3 : 0;
  return Math.min(1, growthScore + remoteBonus);
}

// Safety: safetyIndex is 0–100 (Numbeo scale).
function safetyFactorScore(city: City): number {
  return city.safetyIndex / 100;
}

// Lifestyle: tag/vibe matches normalized to [0, 1].
// Ported from prototype getMatchScore (PotentialApp.jsx lines 310–317).
// tagVibeBonus and other constants come from SCORING_WEIGHTS.lifestyle.
// The raw accumulator is then clamped to [0, 1] before weighting.
function lifestyleFactorScore(city: City, profile: Profile): number {
  // Crash guard (invariant 4): default to [] if lifestyleTags is absent on a sparse profile.
  const tags = profile.lifestyleTags ?? [];
  const { tagVibeBonus, walkBonus, startupBonus } = SCORING_WEIGHTS.lifestyle;

  let rawLifestyle = 0;

  if (tags.includes('nightlife') || tags.includes('music')) {
    rawLifestyle += city.vibe.some(v => v.toLowerCase() === 'nightlife') ? tagVibeBonus : 0;
  }
  if (tags.includes('outdoors') || tags.includes('snow')) {
    rawLifestyle += city.vibe.some(v => v.toLowerCase() === 'outdoorsy') ? tagVibeBonus : 0;
  }
  if (tags.includes('arts')) {
    rawLifestyle += city.vibe.some(v => v.toLowerCase() === 'creative') ? tagVibeBonus : 0;
  }
  if (tags.includes('walkable')) {
    rawLifestyle += city.walkScore * walkBonus;
  }
  if (tags.includes('diversity')) {
    rawLifestyle += city.vibe.some(v => v.toLowerCase() === 'diverse') ? tagVibeBonus : 0;
  }
  if (tags.includes('family')) {
    rawLifestyle += city.safetyIndex * walkBonus;
  }
  if (tags.includes('beach')) {
    rawLifestyle += city.vibe.some(v => v.toLowerCase() === 'tropical') ? tagVibeBonus : 0;
  }
  if (tags.includes('startup')) {
    rawLifestyle += city.jobGrowth * startupBonus;
  }

  // The raw accumulator's practical ceiling is one tagVibeBonus (8) per matched tag.
  // Normalize against a reasonable ceiling (tagVibeBonus × 2 = 16) so moderate matches
  // score around 0.5 and strong multi-tag matches approach 1.0. Clamp to [0, 1].
  const ceiling = tagVibeBonus * 2;
  return Math.max(0, Math.min(1, rawLifestyle / ceiling));
}

// ── Phase 12: Category Personal Weight ───────────────────────────
// Two-tier normalization for categoryWeights entries (D-02 compliant).
// Practical categories (healthcare) retain a floor so they always contribute.
// Preference categories (schools/childcare/connectivity/parks) subtract the neutral
// baseline so a skipped/absent weight (NEUTRAL_DEFAULT=0.5) maps to exactly 0.
// All constants come from scoring-weights.ts (D-03: no magic numbers inline).
//
// Analog: rankToWeight's norm() closure (L34-36) but two-tier.
function categoryPersonalWeight(profile: Profile, slug: string, isPractical: boolean): number {
  // T-12-05/T-12-07: guard NaN/Infinity before any math — non-finite falls back to NEUTRAL_DEFAULT.
  // (sanitizeProfile in index.ts also clamps at engine entry, but this defensive guard
  //  prevents NaN propagation if categoryPersonalWeight is ever called directly.)
  const rawLookup = profile.categoryWeights?.[slug] ?? NEUTRAL_DEFAULT;
  const raw = Number.isFinite(rawLookup) ? rawLookup : NEUTRAL_DEFAULT;
  const clamped = Math.max(0, raw);
  if (isPractical) {
    // Practical: retain floor — healthcare always contributes something.
    // Range [0..WEIGHT_MAX_PRAC], normalize to [0..1].
    return Math.min(WEIGHT_MAX_PRAC, clamped) / WEIGHT_MAX_PRAC;
  } else {
    // Preference: baseline-subtract neutral so NEUTRAL_DEFAULT → 0.
    // Range [NEUTRAL_DEFAULT..WEIGHT_MAX_PREF=1.8]; neutral=0.5 → 0; max=1.8 → 1.
    const baselined = Math.max(0, clamped - NEUTRAL_DEFAULT);
    const range = WEIGHT_MAX_PREF - NEUTRAL_DEFAULT; // 1.3
    return Math.min(1, baselined / range);
  }
}

// ── Phase 12: New Category Factor Score Functions ──────────────────
// Analogs: costFactorScore (lower-is-better/anchored), safetyFactorScore (higher-is-better),
//          lifestyleFactorScore (proxy fallback).
// All scored values wrapped in Math.max(0, Math.min(1, ...)) — never omit the clamp shell.
// healthcare/schools/childcare/connectivity return null when city field is undefined
// (no proxy exists → genuine neutral exclusion; contribution 0, dataLevel 'none').
// parksFactorScore NEVER returns null — proxy floor 0.4 covers every city (D-07).

// Healthcare: higher Numbeo Healthcare Index = better.
// Anchored range (observed: 62.9–71.9) with headroom: floor 60, ceiling 75.
// Source: deep-category-data.md §1 Healthcare (NAEP / Numbeo Healthcare Index).
function healthcareFactorScore(city: City): number | null {
  if (city.healthcareIndex === undefined) return null; // no proxy → genuine exclusion
  return Math.max(0, Math.min(1, (city.healthcareIndex - 60) / 15));
}

// Schools: higher NAEP G8 Reading proficiency % = better. State-level data (D-08).
// Anchored range (observed: 25–35%) with headroom: floor 22, ceiling 38.
// Source: deep-category-data.md §3 School quality.
function schoolsFactorScore(city: City): number | null {
  if (city.schoolProficiencyPct === undefined) return null; // no proxy → genuine exclusion
  return Math.max(0, Math.min(1, (city.schoolProficiencyPct - 22) / 16));
}

// Childcare: LOWER infant annual cost = better (analog: costFactorScore lower-is-better).
// State-level data (D-08). Source: deep-category-data.md §4 CCAoA infant annual cost.
// Anchored: floor $10,000, ceiling $24,000 (range = 14,000).
function childcareFactorScore(city: City): number | null {
  if (city.childcareInfantAnnual === undefined) return null; // no proxy → genuine exclusion
  return Math.max(0, Math.min(1, (24000 - city.childcareInfantAnnual) / 14000));
}

// Air Connectivity: higher FAA enplanements = better.
// Log-scale normalization: observed range 2.37M–50.95M (21:1 raw) → log normalizes cleanly.
// Source: deep-category-data.md §7 Air connectivity.
function connectivityFactorScore(city: City): number | null {
  if (city.airportEnplanements === undefined) return null; // no proxy → genuine exclusion
  const logE = Math.log(city.airportEnplanements);
  return Math.max(0, Math.min(1, (logE - 14.5) / 3.5));
}

// Parks & Outdoors: TPL ParkScore (higher = better) with proxy fallback.
// Proxy: nearMountains + nearCoast booleans + 'outdoorsy' vibe string (all cities have these).
// Proxy floor = 0.4 — never 0 (D-07 phantom-zero prohibition). Never returns null.
// Source: deep-category-data.md §6 Parks + cities.ts nearMountains/nearCoast.
function parksFactorScore(city: City): number {
  if (city.parkScore !== undefined) {
    // ParkScore: anchored range 40–90 (observed: Minneapolis=83.4, Seattle=75.4; floor=40)
    return Math.max(0, Math.min(1, (city.parkScore - 40) / 50));
  }
  // Proxy fallback — analog: lifestyleFactorScore vibe pattern (L96-120)
  let proxy = 0.4; // baseline: median city, no special outdoors access
  if (city.nearMountains) proxy += 0.25;
  if (city.nearCoast) proxy += 0.2;
  if (city.vibe.some(v => v.toLowerCase() === 'outdoorsy')) proxy += 0.15;
  return Math.min(1, proxy);
}

// ── Main Export ───────────────────────────────────────────────────
// computeRawScore — name expected by scoring.test.ts (Plan 01 RED).
// D-04 two-layer formula: contribution = global[f] × personal[f] × factorScore × maxContribution[f]
// INVARIANT: BASE_SCORE + sum(scoreFactors.contribution) === rawScore (within floating-point)
// Pitfall 1 guard: rawScore is derived from the stored rounded contributions, not accumulated
// independently, so the invariant cannot drift.
export function computeRawScore(profile: Profile, city: City): CityScore {
  const personal = rankToWeight(profile);
  const { global, normalization } = SCORING_WEIGHTS;

  const scoreFactors: { factor: string; contribution: number; dataLevel?: 'city' | 'state' | 'proxy' | 'none' | 'display-only' }[] = [];

  // Cost factor
  const costContrib = Math.round(
    global.cost * personal.cost * costFactorScore(city) * normalization.costMaxContribution
  );
  scoreFactors.push({ factor: 'Cost', contribution: costContrib });

  // Career factor
  const careerContrib = Math.round(
    global.career * personal.career * careerFactorScore(city, profile) * normalization.careerMaxContribution
  );
  scoreFactors.push({ factor: 'Career', contribution: careerContrib });

  // Lifestyle factor
  const lifestyleContrib = Math.round(
    global.lifestyle * personal.lifestyle * lifestyleFactorScore(city, profile) * normalization.lifestyleMaxContribution
  );
  scoreFactors.push({ factor: 'Lifestyle', contribution: lifestyleContrib });

  // Safety factor
  const safetyContrib = Math.round(
    global.safety * personal.safety * safetyFactorScore(city) * normalization.safetyMaxContribution
  );
  scoreFactors.push({ factor: 'Safety', contribution: safetyContrib });

  // ── Phase 12 New Categories ───────────────────────────────────────────────────
  // Each category: null factorScore → genuine exclusion (contribution 0, dataLevel 'none').
  // D-07: never emit a nonzero midpoint for missing-data cities; the 0 marker adds nothing
  // to rawScore (honest-contribution invariant intact) and lets the UI show "core data only."
  // D-03/D-09: NO entry references demographics or FEMA fields.

  // Healthcare (practical tier — always contributes a floor, even when not explicitly weighted)
  const healthcareFS = healthcareFactorScore(city);
  if (healthcareFS !== null) {
    const healthcareContrib = Math.round(
      SCORING_WEIGHTS.global.healthcare
      * categoryPersonalWeight(profile, 'healthcare', true)
      * healthcareFS
      * SCORING_WEIGHTS.normalization.healthcareMaxContribution
    );
    scoreFactors.push({ factor: 'Healthcare', contribution: healthcareContrib, dataLevel: 'city' });
  } else {
    // No cited datum, no proxy → display-only neutral exclusion marker (D-07)
    scoreFactors.push({ factor: 'Healthcare', contribution: 0, dataLevel: 'none' });
  }

  // Schools — state-average label (D-08); preference tier
  const schoolsFS = schoolsFactorScore(city);
  if (schoolsFS !== null) {
    const schoolsContrib = Math.round(
      SCORING_WEIGHTS.global.schools
      * categoryPersonalWeight(profile, 'schools', false)
      * schoolsFS
      * SCORING_WEIGHTS.normalization.schoolsMaxContribution
    );
    scoreFactors.push({ factor: 'Schools (state avg)', contribution: schoolsContrib, dataLevel: 'state' });
  } else {
    scoreFactors.push({ factor: 'Schools (state avg)', contribution: 0, dataLevel: 'none' });
  }

  // Childcare — state-average label (D-08); preference tier
  const childcareFS = childcareFactorScore(city);
  if (childcareFS !== null) {
    const childcareContrib = Math.round(
      SCORING_WEIGHTS.global.childcare
      * categoryPersonalWeight(profile, 'childcare', false)
      * childcareFS
      * SCORING_WEIGHTS.normalization.childcareMaxContribution
    );
    scoreFactors.push({ factor: 'Childcare (state avg)', contribution: childcareContrib, dataLevel: 'state' });
  } else {
    scoreFactors.push({ factor: 'Childcare (state avg)', contribution: 0, dataLevel: 'none' });
  }

  // Air Connectivity — city-level data; preference tier
  const connectivityFS = connectivityFactorScore(city);
  if (connectivityFS !== null) {
    const connectivityContrib = Math.round(
      SCORING_WEIGHTS.global.connectivity
      * categoryPersonalWeight(profile, 'connectivity', false)
      * connectivityFS
      * SCORING_WEIGHTS.normalization.connectivityMaxContribution
    );
    scoreFactors.push({ factor: 'Air Connectivity', contribution: connectivityContrib, dataLevel: 'city' });
  } else {
    scoreFactors.push({ factor: 'Air Connectivity', contribution: 0, dataLevel: 'none' });
  }

  // Parks & Outdoors — city or proxy; preference tier; ALWAYS scores (parksFactorScore never null)
  const parksFS = parksFactorScore(city);
  const parksContrib = Math.round(
    SCORING_WEIGHTS.global.parks
    * categoryPersonalWeight(profile, 'parks', false)
    * parksFS
    * SCORING_WEIGHTS.normalization.parksMaxContribution
  );
  scoreFactors.push({
    factor: 'Parks & Outdoors',
    contribution: parksContrib,
    dataLevel: city.parkScore !== undefined ? 'city' : 'proxy',
  });

  // TODO (D-04 / Phase 5 live-AI seam): externally-researched category scores append here as
  // additional scoreFactors entries with dataLevel: 'display-only' (the reserved seam member)
  // — separate labeled tier, never folded into cited numbers.

  // rawScore is the SUM of stored (rounded) contributions — this is the Pitfall 1 guard.
  // Do NOT accumulate rawScore separately; the invariant holds because rawScore IS this sum.
  const rawScore = BASE_SCORE + scoreFactors.reduce((s, f) => s + f.contribution, 0);

  return { rawScore, scoreFactors };
}

// scoreCity — alias for plan interface compatibility.
export const scoreCity = computeRawScore;
