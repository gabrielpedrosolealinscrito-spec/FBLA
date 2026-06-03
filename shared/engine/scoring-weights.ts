// ─────────────────────────────────────────────────────────────────
// Potential — Scoring Weights Config (Phase 3)
// ALL scoring magic numbers live here. Edit these to tune the engine.
// Read by: shared/engine/scoring.ts, shared/engine/dealbreakers.ts
// D-03: No scoring constant may be inlined elsewhere.
// ─────────────────────────────────────────────────────────────────

/**
 * Single tunable config object for the entire scoring engine.
 * Structure by concern: global factor weights, dealbreaker penalty,
 * lifestyle bonuses, and per-factor normalization caps.
 *
 * D-04 formula (CR-01 fixed):
 *   personalWeight[f] = rankToWeight(profile)[f] / PERSONAL_WEIGHT_SCALE   → [0,1]
 *   contribution[f]   = global[f] × personalWeight[f] × factorScore(f) × normalization.maxContribution[f]
 *   rawScore          = BASE_SCORE + Σ(contribution[f])
 *
 *   Because personalWeight is in [0,1] and factorScore is in [0,1]:
 *     max contribution per factor ≤ global[f] × maxContribution[f]
 *     theoretical max rawScore = 50 + 12 + 12 + 10 + 0.8×8 = 90.4
 *     → clamp(rawScore, 0, 99) is always a no-op in the normal range
 *
 *   penalizedScore = rawScore − (triggeredCount × dealbreaker.penalty)
 *   finalScore     = clamp(Math.round(penalizedScore), 0, 99)
 */
export const SCORING_WEIGHTS = {
  // Global factor weights — how much each factor contributes in general.
  // Multiply personal weights (Profile.weights) — effective weight = global × personal.
  // Scale these to tune relative factor dominance.
  global: {
    cost:      1.0,
    career:    1.0,
    lifestyle: 1.0,
    safety:    0.8,
  },

  // Dealbreaker penalties — subtracted from raw score before clamping.
  dealbreaker: {
    penalty: 30,  // points deducted per triggered dealbreaker
  },

  // Per-tag lifestyle bonuses
  lifestyle: {
    tagVibeBonus:  8,    // max bonus when a lifestyle tag matches a city vibe
    walkBonus:     0.08, // walkScore × this per lifestyle point (walkable tag)
    startupBonus:  1.2,  // jobGrowth × this for "startup" tag
  },

  // Factor normalization — keep factor scores on a consistent scale before weighting.
  // Each factor is normalized 0–1, then multiplied by its maxContribution cap.
  // personal weights are normalized to [0,1] via PERSONAL_WEIGHT_SCALE before
  // this multiplication, so maxContribution IS the maximum additive contribution
  // from that factor (when personal=1, global=1, factorScore=1).
  // Sum: 12 + 12 + 10 + 0.8×8 = 40.4 → theoretical max rawScore = 90.4 (safely below 99)
  normalization: {
    costMaxContribution:      12,  // max additive points from cost factor
    careerMaxContribution:    12,
    lifestyleMaxContribution: 10,
    safetyMaxContribution:     8,
  },
  // ── OPENNESS multiplier (Phase 4, MATCH-02 / D-05) ──
  // Soft multiplier on INTERNATIONAL cities' rawScore (US cities unaffected).
  // openness=0 -> minMultiplier (demoted, never stranded - D-01);
  // full openness -> maxMultiplier. Centralized here per D-03 (no inline magic
  // numbers in index.ts).
  openness: {
    minMultiplier: 0.35, // demotion floor for intl scores at zero openness — visible but clearly demoted
    maxMultiplier: 1.0,  // full weight at max openness (no boost)
  },
} as const;

// ── Personal weight normalization scale ───────────────────────────
// rankToWeight returns raw weights in [1,4] (rank 0→4, 1→3, 2→2, 3→1).
// Dividing by PERSONAL_WEIGHT_SCALE normalizes to [0.25, 1.0].
// This ensures maxContribution caps mean what they say (CR-01 fix).
export const PERSONAL_WEIGHT_SCALE = 4;

// ── Dealbreaker thresholds ────────────────────────────────────────
// Recalibrated from prototype (which used avgTemp < 45 / > 72).
// These use summerHighF / winterLowF (NOAA avg daily high/low) — D-11.
// Source: 03-RESEARCH.md D-11 Dealbreaker Field Mapping table.

export const heatThresholdF  = 95;   // summerHighF >  heatThresholdF triggers "No extreme heat"
export const coldThresholdF  = 25;   // winterLowF  < coldThresholdF triggers "No extreme cold"
export const transitMin      = 40;   // transitScore < transitMin triggers "Must have public transit"
export const walkMin         = 50;   // walkScore   < walkMin   triggers "Must be walkable"
export const safetyMin       = 55;   // safetyIndex < safetyMin triggers "Low crime only"
export const jobGrowthMin    = 2.0;  // jobGrowth   < jobGrowthMin triggers "Must have strong job market in my field"

// ── Base score ────────────────────────────────────────────────────
// Every city starts at BASE_SCORE before factor contributions are added.
// D-05 invariant: BASE_SCORE + sum(scoreFactors.contributions) === rawScore (pre-penalty)
export const BASE_SCORE = 50;
