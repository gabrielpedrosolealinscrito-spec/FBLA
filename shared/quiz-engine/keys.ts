// ─────────────────────────────────────────────────────────────────
// Potential — Quiz Engine: Cross-Plan Answer-Key Constants (Phase 11, Plan 01)
// D-14: Category set gated by defensible sourced data (deep-category-data.md)
// D-15: Tier-3 categories (political/values fit, social/dating) intentionally excluded
//
// CONTRACT SURFACE: These strings are shared by personality.ts (plan 02) and
// category-modules.ts (plan 03). Changing any constant here is a contract change
// that requires updating both consumers.
// ─────────────────────────────────────────────────────────────────

// ── Scored Category Slugs ────────────────────────────────────────────────────

/**
 * ALL_SCORED_CATEGORIES — the buildable Phase 11 category slugs.
 *
 * Source: .planning/research/deep-category-data.md (verified 2026-06-02).
 * Tier-3 categories (political/values fit, dating/social) are omitted per D-15 —
 * their data is undefensible.
 *
 * This array is the loop target in synthesizeCategoryWeights (plan 02) and the
 * iteration reference in personality.test.ts's neutral-skip guard.
 */
export const ALL_SCORED_CATEGORIES: string[] = [
  'healthcare',    // Numbeo Health Care Index — 22/22 cities
  'climateRisk',   // FEMA NRI per-hazard sub-scores — 22/22 cities
  'schools',       // NAEP G8 Reading proficiency % — state-level, 22/22 cities
  'childcare',     // CCAoA center-based care cost — state-level, 22/22 cities
  'demographics',  // Census ACS 2024 (foreignBornPct, medianAge, neverMarriedPct) — D-14 neutral stat only
  'parks',         // TPL ParkScore 2026 — partial (7/22); falls back to nearMountains/nearCoast
  'connectivity',  // FAA CY2023 enplanements + hub classification — 22/22 cities
];

// ── Tradeoff Question Answer-Key IDs ────────────────────────────────────────

/**
 * Core tradeoff scenario question IDs — the answer keys plan 02 (synthesizeCategoryWeights)
 * reads to tally per-category evidence.
 *
 * These are the QUESTION IDs in category-modules.ts (plan 03). Changing any of these
 * strings requires updating the corresponding QuestionDef id AND the synthesizer logic.
 */
export const TRADEOFF_COST_VS_LIFESTYLE    = 'tradeoff_cost_vs_lifestyle';
export const TRADEOFF_SAFETY_VS_CAREER     = 'tradeoff_safety_vs_career';
export const TRADEOFF_HEALTHCARE           = 'tradeoff_healthcare';
export const TRADEOFF_FAMILY               = 'tradeoff_family_vs_mobility';
export const TRADEOFF_CONNECTIVITY         = 'tradeoff_connectivity_vs_cost';

// ── Module Flag Prefixes ─────────────────────────────────────────────────────

/**
 * MODULE_SELECTED_PREFIX — prefix for explicit module opt-in flags.
 *
 * When a user opts into a module that wasn't personality-recommended, the answer
 * key is `moduleSelected_{category}` (e.g. `moduleSelected_healthcare`).
 * Both category-modules.ts showIf predicates and the synthesizer read this prefix.
 */
export const MODULE_SELECTED_PREFIX = 'moduleSelected_';

/**
 * MODULE_IMPORTANCE_PREFIX — prefix for per-category importance question answer keys.
 *
 * LOAD-BEARING: Categories without a personality tradeoff (climateRisk, parks,
 * demographics) have no other weight signal. Their importance question
 * (`importance_{category}`, e.g. `importance_climateRisk`) IS their only weight
 * input. Without this prefix those categories would be stuck at NEUTRAL_DEFAULT.
 *
 * synthesizeCategoryWeights (plan 02) reads BOTH tradeoff keys AND importance keys.
 */
export const MODULE_IMPORTANCE_PREFIX = 'importance_';

// ── Family Category Mapping ──────────────────────────────────────────────────

/**
 * FAMILY_CATEGORIES — the two categories that share the tradeoff_family_vs_mobility signal.
 *
 * The single TRADEOFF_FAMILY answer maps onto both 'schools' and 'childcare'.
 * plan 02 iterates this list explicitly — no invented mapping.
 */
export const FAMILY_CATEGORIES: string[] = ['schools', 'childcare'];
