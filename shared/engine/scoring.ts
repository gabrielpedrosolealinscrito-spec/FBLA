// ─────────────────────────────────────────────────────────────────
// Potential — City Scoring Engine (Phase 3, Plan 04)
// D-04: Two-layer config-driven scoring with honest contribution collection.
// Contributions are the LITERAL additive terms: BASE_SCORE + sum(contributions) === rawScore.
// No dealbreaker penalties applied here — that is dealbreakers.ts (D-02 two-pass).
// All coefficients come from SCORING_WEIGHTS. No magic numbers inline.
// ─────────────────────────────────────────────────────────────────

import { SCORING_WEIGHTS, BASE_SCORE, PERSONAL_WEIGHT_SCALE } from './scoring-weights.js';
import type { Profile, City } from '../types.js';

// Re-export BASE_SCORE so scoring.test.ts can import it from this module.
export { BASE_SCORE } from './scoring-weights.js';

// ── Output Shape ──────────────────────────────────────────────────
export interface CityScore {
  rawScore: number;
  scoreFactors: { factor: string; contribution: number }[];
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

// ── Main Export ───────────────────────────────────────────────────
// computeRawScore — name expected by scoring.test.ts (Plan 01 RED).
// D-04 two-layer formula: contribution = global[f] × personal[f] × factorScore × maxContribution[f]
// INVARIANT: BASE_SCORE + sum(scoreFactors.contribution) === rawScore (within floating-point)
// Pitfall 1 guard: rawScore is derived from the stored rounded contributions, not accumulated
// independently, so the invariant cannot drift.
export function computeRawScore(profile: Profile, city: City): CityScore {
  const personal = rankToWeight(profile);
  const { global, normalization } = SCORING_WEIGHTS;

  const scoreFactors: { factor: string; contribution: number }[] = [];

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

  // rawScore is the SUM of stored (rounded) contributions — this is the Pitfall 1 guard.
  // Do NOT accumulate rawScore separately; the invariant holds because rawScore IS this sum.
  const rawScore = BASE_SCORE + scoreFactors.reduce((s, f) => s + f.contribution, 0);

  return { rawScore, scoreFactors };
}

// scoreCity — alias for plan interface compatibility.
export const scoreCity = computeRawScore;
