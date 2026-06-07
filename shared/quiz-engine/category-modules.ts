// ─────────────────────────────────────────────────────────────────
// Potential — Deep-Dive Category Modules (Phase 11, Plan 03)
// D-11: Guided-modular flow — showIf gates every question on personality result
//       OR explicit user opt-in (moduleSelected_{category} === true).
// D-12: Module depth mixed by category — rich sub-questions for healthcare and
//       family/schools/childcare; light (importance + one qualifier) for
//       climateRisk, demographics, parks, connectivity.
// D-14/D-15: Tier-3 categories (values fit, relationship matching) are entirely
//       absent — undefensible data per user decision.
//
// SHOWIF INVARIANT: Every showIf predicate reads ONLY keys owned by personality.ts
// questions (earlier in ALL_QUESTIONS). The trigger-before-injection invariant from
// Phase 2's resolver holds — category-module questions must come AFTER personality
// gate questions in ALL_QUESTIONS registration.
//
// ALL QUESTIONS: required: false — skipping a module falls back to NEUTRAL_DEFAULT
// in synthesizeCategoryWeights (D-13: never breaks scoring, never strands user).
// ─────────────────────────────────────────────────────────────────

import type { QuestionDef } from './questions.js';
import {
  TRADEOFF_HEALTHCARE,
  TRADEOFF_FAMILY,
  TRADEOFF_CONNECTIVITY,
  MODULE_SELECTED_PREFIX,
} from './keys.js';

// ── Shared option sets (machine-stable values) ────────────────────────────────

const IMPORTANCE_OPTIONS = [
  { value: 'high',     label: 'Very important - major factor in my decision' },
  { value: 'moderate', label: 'Somewhat important - nice to have' },
  { value: 'low',      label: 'Not a priority for me right now' },
];

// ── RICH MODULE: Healthcare ───────────────────────────────────────────────────
//
// Data source: Numbeo Health Care Index (22/22 cities covered).
// Note: Numbeo is crowdsourced; Boise has thin sample (~36 contributors).
// Module gated on tradeoff_healthcare === 'healthcare_critical' OR user opt-in.
// Importance question is the weight signal synthesizeCategoryWeights reads.

const healthcareShowIf = (a: Record<string, unknown>): boolean =>
  a[TRADEOFF_HEALTHCARE] === 'healthcare_critical' ||
  a[`${MODULE_SELECTED_PREFIX}healthcare`] === true;

const HEALTHCARE_MODULE: QuestionDef[] = [
  {
    id: 'healthcare_chronic_condition',
    type: 'single_select',
    kicker: 'HEALTHCARE',
    prompt: 'Do you or a close dependent manage a chronic condition or need regular specialist care?',
    groupHeader: {
      label: 'HEALTHCARE',
      subtext: 'Your health needs, your city.',
    },
    required: false,
    showIf: healthcareShowIf,
    options: [
      { value: 'yes_specialist', label: 'Yes - specialist access is critical' },
      { value: 'yes_basic',      label: 'Yes, but basic care is usually enough' },
      { value: 'no',             label: 'No - general access is fine' },
    ],
  },
  {
    id: 'healthcare_specialist_type',
    type: 'single_select',
    kicker: 'HEALTHCARE',
    prompt: 'What kind of specialist access matters most?',
    required: false,
    showIf: healthcareShowIf,
    options: [
      { value: 'oncology',        label: 'Oncology / cancer care' },
      { value: 'cardiology',      label: 'Cardiology / heart' },
      { value: 'pediatric',       label: 'Pediatric specialists' },
      { value: 'mental_health',   label: 'Mental health / psychiatry' },
      { value: 'general_enough',  label: 'Any major medical center is fine' },
    ],
  },
  {
    id: 'importance_healthcare',
    type: 'single_select',
    kicker: 'HEALTHCARE',
    prompt: 'Overall, how much does healthcare quality affect your city ranking?',
    required: false,
    showIf: healthcareShowIf,
    options: IMPORTANCE_OPTIONS,
  },
];

// ── RICH MODULE: Family / Schools / Childcare ─────────────────────────────────
//
// Data sources:
//   Schools:   NAEP 2024 G8 Reading proficiency % (state-level average).
//   Childcare: CCAoA 2024 Price of Care (state-level; San Diego toddler = NR).
//
// ⚠ CAVEAT: School and childcare data are STATE AVERAGES, not city-specific.
// Cities in the same state (e.g. Austin/Dallas/San Antonio) share the same score.
// This caveat must be shown in the UI subtext.
//
// FAMILY_CATEGORIES = ['schools', 'childcare'] — both carry their own importance
// question because Phase 12 scores them as separate categories. Two weight signals.
//
// Module gated on tradeoff_family_vs_mobility === 'family_critical' OR user opt-in.

const familyShowIf = (a: Record<string, unknown>): boolean =>
  a[TRADEOFF_FAMILY] === 'family_critical' ||
  a[`${MODULE_SELECTED_PREFIX}schools`] === true;

const FAMILY_MODULE: QuestionDef[] = [
  {
    id: 'family_dependents_in_school',
    type: 'single_select',
    kicker: 'FAMILY & SCHOOLS',
    prompt: 'Do you have (or plan to have) school-age children whose education would factor into your city choice?',
    groupHeader: {
      label: 'FAMILY & SCHOOLS',
      subtext: 'School and childcare data are state averages, not city-specific, so cities in the same state share the same score.',
    },
    required: false,
    showIf: familyShowIf,
    options: [
      { value: 'yes_now',    label: 'Yes - I have school-age kids now' },
      { value: 'yes_future', label: "Not yet, but I'm planning for it" },
      { value: 'no',         label: "No - not relevant to my situation" },
    ],
  },
  {
    id: 'family_kids_ages',
    type: 'multi_select',
    kicker: 'FAMILY & SCHOOLS',
    prompt: "What age ranges apply to your children (or planned children)?",
    required: false,
    showIf: familyShowIf,
    options: [
      { value: 'infant',    label: 'Infant (0-1)' },
      { value: 'toddler',   label: 'Toddler (2-4)' },
      { value: 'elementary', label: 'Elementary (5-10)' },
      { value: 'middle',    label: 'Middle school (11-13)' },
      { value: 'high',      label: 'High school (14-18)' },
    ],
  },
  {
    id: 'importance_schools',
    type: 'single_select',
    kicker: 'FAMILY & SCHOOLS',
    prompt: 'How much does school quality affect your city ranking?',
    required: false,
    showIf: familyShowIf,
    options: IMPORTANCE_OPTIONS,
  },
  {
    id: 'importance_childcare',
    type: 'single_select',
    kicker: 'FAMILY & SCHOOLS',
    prompt: 'How much does childcare cost and availability affect your city ranking?',
    required: false,
    showIf: familyShowIf,
    options: IMPORTANCE_OPTIONS,
  },
];

// ── LIGHT MODULE: Climate / Disaster Risk ─────────────────────────────────────
//
// Data source: FEMA NRI v1.20 (county-level; 22/22 cities covered).
//
// PITFALL: The FEMA composite score barely discriminates among large metros
// (range 88–99.97) — large cities always expose more people. Phase 12 MUST
// use per-hazard NRI sub-scores (hurricane, wildfire, flood, heat, tornado)
// mapped from primaryHazardConcern, NOT the composite disasterRiskScore.
// This primaryHazardConcern capture is what enables that per-hazard mapping.
//
// No tradeoff question anchors climateRisk — importance_climateRisk is the
// ONLY weight signal synthesizeCategoryWeights has for this category.

const climateRiskShowIf = (a: Record<string, unknown>): boolean =>
  a[`${MODULE_SELECTED_PREFIX}climateRisk`] === true;

const CLIMATE_RISK_MODULE: QuestionDef[] = [
  {
    id: 'climate_primary_hazard',
    type: 'single_select',
    kicker: 'CLIMATE & RISK',
    prompt: 'Which natural hazard concerns you most when choosing a city?',
    groupHeader: {
      label: 'CLIMATE & RISK',
      subtext: "We map your concern to city-level risk data from FEMA's National Risk Index.",
    },
    required: false,
    showIf: climateRiskShowIf,
    options: [
      { value: 'hurricane', label: 'Hurricane or coastal storm' },
      { value: 'wildfire',  label: 'Wildfire' },
      { value: 'flood',     label: 'Flooding' },
      { value: 'heat',      label: 'Extreme heat' },
      { value: 'tornado',   label: 'Tornado / severe wind' },
      { value: 'any',       label: 'Any - just show me overall risk' },
    ],
  },
  {
    id: 'importance_climateRisk',
    type: 'single_select',
    kicker: 'CLIMATE & RISK',
    prompt: 'How much does natural disaster / climate risk affect your city ranking?',
    required: false,
    showIf: climateRiskShowIf,
    options: IMPORTANCE_OPTIONS,
  },
];

// ── LIGHT MODULE: Demographics ────────────────────────────────────────────────
//
// Data source: Census ACS 2024 1-yr estimates (foreignBornPct, medianAge,
// neverMarriedPct — city or county level; 22/22 cities covered).
//
// D-14 NEUTRAL FRAMING REQUIREMENT (hard constraint):
// The foreignBornPct statistic is a factual demographic count — it is NEVER
// presented as a "people like you" similarity score or a cultural-fit metric.
// The question below is framed as a data-preference opt-in only.
// Any future change that turns this into a fit/diversity score violates D-14
// and must be escalated — NOT implemented silently.
//
// No tradeoff question anchors demographics — importance_demographics is the
// ONLY weight signal synthesizeCategoryWeights has for this category.

const demographicsShowIf = (a: Record<string, unknown>): boolean =>
  a[`${MODULE_SELECTED_PREFIX}demographics`] === true;

const DEMOGRAPHICS_MODULE: QuestionDef[] = [
  {
    id: 'demographics_opt_in',
    type: 'single_select',
    kicker: 'DEMOGRAPHICS',
    prompt: 'Would you like to see the share of residents born outside the US for each city?',
    groupHeader: {
      label: 'DEMOGRAPHICS',
      subtext: "Factual Census data. We show you the statistic, not a 'fit score'.",
    },
    required: false,
    showIf: demographicsShowIf,
    options: [
      { value: 'yes', label: 'Yes - show me that statistic' },
      { value: 'no',  label: 'No - not relevant to me' },
    ],
  },
  {
    id: 'importance_demographics',
    type: 'single_select',
    kicker: 'DEMOGRAPHICS',
    prompt: 'How much does demographic composition affect your city ranking?',
    required: false,
    showIf: demographicsShowIf,
    options: IMPORTANCE_OPTIONS,
  },
];

// ── LIGHT MODULE: Parks / Outdoors ────────────────────────────────────────────
//
// Data source: TPL ParkScore 2026 (7/22 cities confirmed).
// Phase 12 MUST fall back to existing nearMountains / nearCoast boolean fields
// on City for the 15/22 cities without a confirmed ParkScore — do not leave
// those cities unscored on this dimension.
//
// No tradeoff question anchors parks — importance_parks is the ONLY weight
// signal synthesizeCategoryWeights has for this category.

const parksShowIf = (a: Record<string, unknown>): boolean =>
  a[`${MODULE_SELECTED_PREFIX}parks`] === true;

const PARKS_MODULE: QuestionDef[] = [
  {
    id: 'parks_outdoors_frequency',
    type: 'single_select',
    kicker: 'OUTDOORS',
    prompt: 'How often do you use parks, trails, or outdoor green space?',
    groupHeader: {
      label: 'OUTDOORS',
      subtext: "Park scores from the Trust for Public Land. They fall back to mountain/coast proximity where city data is unavailable.",
    },
    required: false,
    showIf: parksShowIf,
    options: [
      { value: 'daily',      label: 'Daily - it is part of my routine' },
      { value: 'weekend',    label: 'Most weekends' },
      { value: 'occasional', label: 'Occasionally' },
    ],
  },
  {
    id: 'importance_parks',
    type: 'single_select',
    kicker: 'OUTDOORS',
    prompt: 'How much do parks and outdoor access affect your city ranking?',
    required: false,
    showIf: parksShowIf,
    options: IMPORTANCE_OPTIONS,
  },
];

// ── LIGHT MODULE: Connectivity ────────────────────────────────────────────────
//
// Data source: FAA CY2023 enplanements + hub classification (22/22 cities covered).
// Gated on tradeoff_connectivity_vs_cost === 'connectivity_critical' OR user opt-in.
// Captures whether the user is an international traveler so Phase 12 can weight
// international routes (not just domestic hub class).

const connectivityShowIf = (a: Record<string, unknown>): boolean =>
  a[TRADEOFF_CONNECTIVITY] === 'connectivity_critical' ||
  a[`${MODULE_SELECTED_PREFIX}connectivity`] === true;

const CONNECTIVITY_MODULE: QuestionDef[] = [
  {
    id: 'connectivity_international_traveler',
    type: 'single_select',
    kicker: 'CONNECTIVITY',
    prompt: 'Do you travel internationally, or plan to?',
    groupHeader: {
      label: 'CONNECTIVITY',
      subtext: "Airport hub data from FAA annual enplanements.",
    },
    required: false,
    showIf: connectivityShowIf,
    options: [
      { value: 'yes_frequent',  label: 'Yes - multiple times per year' },
      { value: 'yes_sometimes', label: 'Occasionally - once a year or less' },
      { value: 'no',            label: 'Rarely or never' },
    ],
  },
  {
    id: 'importance_connectivity',
    type: 'single_select',
    kicker: 'CONNECTIVITY',
    prompt: 'How much does airport connectivity affect your city ranking?',
    required: false,
    showIf: connectivityShowIf,
    options: IMPORTANCE_OPTIONS,
  },
];

// ── CATEGORY_MODULE_QUESTIONS — the exported registry ────────────────────────
//
// Order: rich modules first (healthcare, family), then light modules.
// ALL questions are required:false and gated by showIf — skipped modules
// fall back to NEUTRAL_DEFAULT in synthesizeCategoryWeights (D-13).
//
// Phase 12 note on BASE_SCORE recalibration (Pitfall 6):
// Phase 3's scoring.ts caps are calibrated for 4 factors (max rawScore ≈ 90.4).
// Adding 7 new scored categories in Phase 12 will push rawScore past 99 unless
// per-factor maxContribution caps are reduced. Phase 12 MUST recalibrate
// BASE_SCORE + Σ(caps) < 99 and run the "assert what the user sees" test.

export const CATEGORY_MODULE_QUESTIONS: QuestionDef[] = [
  ...HEALTHCARE_MODULE,
  ...FAMILY_MODULE,
  ...CLIMATE_RISK_MODULE,
  ...DEMOGRAPHICS_MODULE,
  ...PARKS_MODULE,
  ...CONNECTIVITY_MODULE,
];
