// ─────────────────────────────────────────────────────────────────
// Potential — Personality / Values Gate (Phase 11, Plan 02)
// D-06: Category weights INFERRED from tradeoff scenarios — not sliders/ranking.
// D-07: Hybrid style — tradeoff scenarios anchor weights, trait statements add flavor.
// D-08: Explainable output — every inferred weight has a matching WeightExplanation.
// D-09: Two-tier floor — practical factors (healthcare, safety) keep WEIGHT_FLOOR;
//       preference factors swing freely above 0.
// D-10: Adaptive gate — detectPersonalityTension adds a follow-up when >=2 "balanced".
// D-13: Neutral-skip — synthesizeCategoryWeights NEVER emits undefined/NaN; skipped
//       modules fall back to NEUTRAL_DEFAULT.
//
// WEIGHT CONTRACT (load-bearing, mirrors 02-02-PLAN.md pitfall note):
//   synthesizeCategoryWeights emits RAW inferred values in [WEIGHT_FLOOR..WEIGHT_MAX].
//   Phase 12 normalizes via its rankToWeight successor.
//   DO NOT pre-normalize here — double-shrink breaks the two-tier model (Pitfall 5).
// ─────────────────────────────────────────────────────────────────

import type { WeightExplanation } from '../types.js';
import {
  ALL_SCORED_CATEGORIES,
  TRADEOFF_COST_VS_LIFESTYLE,
  TRADEOFF_SAFETY_VS_CAREER,
  TRADEOFF_HEALTHCARE,
  TRADEOFF_FAMILY,
  TRADEOFF_CONNECTIVITY,
  MODULE_IMPORTANCE_PREFIX,
  FAMILY_CATEGORIES,
} from './keys.js';
import type { QuestionDef, QuestionOption, Answers } from './questions.js';

// ── Tier Constants (SP-3 — single source of truth; no magic numbers in function bodies) ──

/**
 * PRACTICAL_CATEGORIES — factors that always matter regardless of personality.
 *
 * These carry WEIGHT_FLOOR so practical cities are never absurd picks for broke users.
 * PLANNER NOTE (D-02 OPEN): `cost` is intentionally EXCLUDED from this set — Phase 3
 * reads profile.weights.cost directly from the legacy `weights?` field, and including
 * `cost` in categoryWeights before D-02 is resolved risks double-counting. The D-02
 * reconciliation ("replace vs. layer") happens at Phase 2 integration. `career` is
 * assigned to PREFERENCE_CATEGORIES below, PROVISIONALLY — do NOT resolve D-02 here.
 *
 * The two Sets below are the Phase-12 floor/swing registry over ALL factors (legacy +
 * new). They are DISTINCT from ALL_SCORED_CATEGORIES (new-only; what synthesizeCategoryWeights
 * iterates). An executor must NOT trim these Sets to match ALL_SCORED_CATEGORIES.
 */
export const PRACTICAL_CATEGORIES = new Set(["healthcare", "safety"]);

/**
 * PREFERENCE_CATEGORIES — factors whose weights swing freely above 0.
 *
 * `"career"` is explicitly a member here, provisionally (D-02 OPEN).
 * `"cost"` is kept OUT of categoryWeights pending D-02 (see PRACTICAL_CATEGORIES note).
 */
export const PREFERENCE_CATEGORIES = new Set([
  "lifestyle",
  "career",      // EXPLICITLY assigned here — provisional per D-02 (do NOT remove)
  "parks",
  "connectivity",
  "demographics",
  "climateRisk",
  "schools",
  "childcare",
]);

/** Minimum weight for practical-tier categories. Phase 12 tunes in scoring-weights.ts. */
export const WEIGHT_FLOOR = 0.3;

/** Ceiling for practical-tier inferred weights. Phase 12 tunable. */
export const WEIGHT_MAX_PRAC = 1.5;

/** Ceiling for preference-tier inferred weights. Phase 12 tunable. */
export const WEIGHT_MAX_PREF = 1.8;

/**
 * NEUTRAL_DEFAULT — fallback weight when a module is skipped entirely (D-13).
 *
 * synthesizeCategoryWeights emits this for any ALL_SCORED_CATEGORIES key with no
 * answer signal. Phase 12 scoring always sees a valid finite number; never undefined/NaN.
 */
export const NEUTRAL_DEFAULT = 0.5;

/**
 * IMPORTANCE_TALLY_INCREMENT — tally increment for a "high" importance answer.
 *
 * Load-bearing value: a single "high" importance answer MUST push the inferred weight
 * strictly above NEUTRAL_DEFAULT (the QUIZ-09 forcing test). With step=0.3:
 *   floor=0 → 0 + 1*0.3 = 0.3 < 0.5 (FAILS the forcing test, D-13 contract broken)
 *   floor=0 → 0 + 2*0.3 = 0.6 > 0.5 (passes — single high-importance is visible)
 * Therefore high-importance must contribute >=2 tally units.
 * This constant documents that choice explicitly (MEMORY.md lesson: assert what user sees).
 */
export const IMPORTANCE_TALLY_INCREMENT = 2;

/** Per-tally step when computing raw weight from tally count. */
export const WEIGHT_STEP = 0.3;

// ── PERSONALITY_QUESTIONS — 5 Core Tradeoff Scenarios (D-07) ─────────────────────

/**
 * PERSONALITY_QUESTIONS — the 5 core single_select tradeoff scenarios.
 *
 * Question IDs exactly match keys.ts TRADEOFF_* constants (they are the same strings).
 * The "balanced"/"depends" option provides the ambiguity signal detectPersonalityTension keys on.
 * These are the weight-bearing questions — answers increment per-category tallies in
 * synthesizeCategoryWeights.
 * Non-weight-bearing flavor is in TRAIT_QUESTIONS below (D-07 hybrid, D-08 explainability).
 */
export const PERSONALITY_QUESTIONS: QuestionDef[] = [
  {
    id: TRADEOFF_COST_VS_LIFESTYLE,   // 'tradeoff_cost_vs_lifestyle'
    type: 'single_select',
    kicker: 'WHAT MATTERS',
    prompt: "You're choosing between two cities. One is affordable but quieter — limited dining, culture, and nightlife. The other has great energy and experiences, but costs 30% more to live. Which way do you lean?",
    required: true,
    autoAdvance: true,
    options: [
      { value: 'cost_wins',      label: "I'd take the savings" },
      { value: 'lifestyle_wins', label: "I'd pay for the experience" },
      { value: 'balanced',       label: "Depends — I'd want to see the tradeoff" },
    ],
  },
  {
    id: TRADEOFF_SAFETY_VS_CAREER,   // 'tradeoff_safety_vs_career'
    type: 'single_select',
    kicker: 'WHAT MATTERS',
    prompt: 'A high-growth city has strong career momentum — but higher crime and cost. A calmer, safer city has fewer opportunities but lower stress. What pulls you more?',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'safety_wins', label: 'Safety and stability come first' },
      { value: 'career_wins', label: 'Career growth is worth the tradeoff' },
      { value: 'balanced',    label: 'I need both to feel right about it' },
    ],
  },
  {
    id: TRADEOFF_HEALTHCARE,   // 'tradeoff_healthcare'
    type: 'single_select',
    kicker: 'WHAT MATTERS',
    prompt: 'How important is it that your city has strong hospitals and easy access to specialists?',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'healthcare_critical', label: 'Very important — I have specific health needs' },
      { value: 'healthcare_moderate', label: 'Important, but basic access would work' },
      { value: 'healthcare_low',      label: "Not a priority for me right now" },
    ],
  },
  {
    id: TRADEOFF_FAMILY,   // 'tradeoff_family_vs_mobility'
    type: 'single_select',
    kicker: 'WHAT MATTERS',
    prompt: "If you have (or plan to have) kids, how much would school quality and childcare costs affect your city choice?",
    required: true,
    autoAdvance: true,
    options: [
      { value: 'family_critical', label: "A top concern — I'd filter heavily on this" },
      { value: 'family_moderate', label: 'One factor among many' },
      { value: 'family_low',      label: "Not in my situation right now" },
    ],
  },
  {
    id: TRADEOFF_CONNECTIVITY,   // 'tradeoff_connectivity_vs_cost'
    type: 'single_select',
    kicker: 'WHAT MATTERS',
    prompt: 'How much does having a major international airport within reach matter to you?',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'connectivity_critical', label: 'A lot — I travel internationally or plan to' },
      { value: 'connectivity_moderate', label: 'Nice to have, but not a dealmaker' },
      { value: 'connectivity_low',      label: "I don't travel much" },
    ],
  },
];

// ── TRAIT_QUESTIONS — Flavor Layer (D-07, non-weight-bearing) ────────────────────

/**
 * TRAIT_QUESTIONS — agree/disagree statements that capture personality flavor.
 *
 * CRITICAL: These are NON-WEIGHT-BEARING. Trait answers feed personalityFlavor on
 * the Profile only — they NEVER increment categoryWeights tallies (D-07 + D-08).
 * Marking them required:false makes them skippable without breaking scoring.
 */
export const TRAIT_QUESTIONS: QuestionDef[] = [
  {
    id: 'trait_spontaneity',
    type: 'single_select',
    kicker: 'A LITTLE ABOUT YOU',
    prompt: `"I'd rather try a city I don't know much about than stay somewhere predictable."`,
    required: false,
    autoAdvance: true,
    options: [
      { value: 'strongly_agree', label: "That's very me" },
      { value: 'agree',          label: 'Somewhat' },
      { value: 'disagree',       label: "I prefer knowing what I'm getting into" },
    ],
  },
  {
    id: 'trait_financial_priority',
    type: 'single_select',
    kicker: 'A LITTLE ABOUT YOU',
    prompt: `"I'd rather live somewhere affordable and build savings than stretch for a more exciting city."`,
    required: false,
    autoAdvance: true,
    options: [
      { value: 'strongly_agree', label: 'Absolutely — savings first' },
      { value: 'agree',          label: 'Mostly, but experience matters too' },
      { value: 'disagree',       label: 'Life is too short to optimize for savings alone' },
    ],
  },
  {
    id: 'trait_outdoor_drive',
    type: 'single_select',
    kicker: 'A LITTLE ABOUT YOU',
    prompt: '"Having parks, trails, or nature nearby would meaningfully improve my daily life."',
    required: false,
    autoAdvance: true,
    options: [
      { value: 'strongly_agree', label: "Yes — I'm outside a lot" },
      { value: 'agree',          label: 'Nice to have' },
      { value: 'disagree',       label: "I'm mostly indoors" },
    ],
  },
  {
    id: 'trait_community_openness',
    type: 'single_select',
    kicker: 'A LITTLE ABOUT YOU',
    prompt: '"I actively want to live somewhere with people from diverse backgrounds and countries."',
    required: false,
    autoAdvance: true,
    options: [
      { value: 'strongly_agree', label: "Yes — it matters a lot to me" },
      { value: 'agree',          label: "It's a nice quality" },
      { value: 'disagree',       label: "It's not something I focus on" },
    ],
  },
];

// ── PersonalityTensionResult ─────────────────────────────────────────────────────

/**
 * PersonalityTensionResult — the signal emitted when the adaptive follow-up fires.
 *
 * afterId: the last core tradeoff question's id (resolver splices the injected question
 *          immediately after this question in the visible flow).
 * question: the tiebreaker QuestionDef to inject.
 */
export interface PersonalityTensionResult {
  afterId: string;
  question: QuestionDef;
}

// ── detectPersonalityTension (D-10 — signal-or-null, mirrors checkReconfirm discipline) ──

/**
 * detectPersonalityTension — returns a follow-up injection signal when answers are ambiguous.
 *
 * Fires when the user chose "balanced" (or "depends") on >=2 core tradeoff questions.
 * Guards: empty/unknown answers → null, never throws.
 *
 * Returns: PersonalityTensionResult | null
 */
export function detectPersonalityTension(answers: Answers): PersonalityTensionResult | null {
  // Guard: empty answers → no tension possible (mirrors checkReconfirm's early-return guard)
  if (Object.keys(answers).length === 0) return null;

  // Tally "balanced" answers across all core tradeoff keys
  const tradeoffKeys = [
    TRADEOFF_COST_VS_LIFESTYLE,
    TRADEOFF_SAFETY_VS_CAREER,
    TRADEOFF_HEALTHCARE,
    TRADEOFF_FAMILY,
    TRADEOFF_CONNECTIVITY,
  ];

  let balancedCount = 0;
  for (const key of tradeoffKeys) {
    const val = answers[key];
    if (val === 'balanced' || val === 'depends') {
      balancedCount++;
    }
  }

  // Fire follow-up when >=2 tradeoffs are ambiguous
  if (balancedCount >= 2) {
    const tiebreakerQuestion: QuestionDef = {
      id: 'personality_tiebreaker',
      type: 'single_select',
      kicker: 'WHAT MATTERS',
      prompt: "You picked 'depends' on several big tradeoffs. When it comes down to it, what matters most to your day-to-day happiness?",
      required: true,
      autoAdvance: true,
      options: [
        { value: 'financial_security', label: 'Financial stability and being able to save' },
        { value: 'life_quality',       label: 'Quality of life — experiences, environment' },
        { value: 'career_trajectory',  label: 'Career opportunities and professional growth' },
      ],
    };

    return {
      afterId: TRADEOFF_CONNECTIVITY,  // inject after the last core tradeoff
      question: tiebreakerQuestion,
    };
  }

  return null;
}

// ── synthesizeCategoryWeights (D-06/D-08/D-09/D-13) ─────────────────────────────

/**
 * synthesizeCategoryWeights — infers per-category weights from quiz answers.
 *
 * Reads BOTH:
 *   (i)  tradeoff answer keys (e.g. tradeoff_healthcare = 'healthcare_critical')
 *   (ii) per-category importance keys `${MODULE_IMPORTANCE_PREFIX}${cat}` for every
 *        cat in ALL_SCORED_CATEGORIES — LOAD-BEARING for categories without a tradeoff
 *        (climateRisk, parks, demographics): their importance key is their ONLY weight
 *        signal. A synthesizer reading tradeoff keys only would strand them at NEUTRAL_DEFAULT.
 *
 * Returns: { categoryWeights, weightExplanations } — always BOTH, never one without the other (D-08).
 *
 * NOTE: weights are raw values in [WEIGHT_FLOOR..WEIGHT_MAX], NOT pre-normalized.
 * Phase 12 normalizes via its rankToWeight successor. Pre-normalizing causes double-shrink (Pitfall 5).
 */
export function synthesizeCategoryWeights(answers: Answers): {
  categoryWeights: Record<string, number>;
  weightExplanations: WeightExplanation[];
} {
  // ── Step 1: Build per-category tally from all answer signals ────────────────
  const tallies: Record<string, number> = {};

  /** Increment a category's tally (guard: ?? 0 prevents NaN on first increment). */
  const inc = (cat: string, amount: number = 1): void => {
    tallies[cat] = (tallies[cat] ?? 0) + amount;
  };

  // ── Tradeoff signals ─────────────────────────────────────────────────────────

  // cost_vs_lifestyle → cost or lifestyle (cost is NOT in ALL_SCORED_CATEGORIES but
  // its tally is harmlessly discarded; lifestyle is in PREFERENCE_CATEGORIES)
  const costLifestyle = answers[TRADEOFF_COST_VS_LIFESTYLE];
  if (costLifestyle === 'lifestyle_wins') inc('lifestyle');
  // 'cost_wins' would inc('cost') — cost is excluded from categoryWeights pending D-02

  // safety_vs_career → safety or career
  const safetyCareer = answers[TRADEOFF_SAFETY_VS_CAREER];
  if (safetyCareer === 'safety_wins')  inc('safety');
  if (safetyCareer === 'career_wins')  inc('career');

  // healthcare → healthcare (practical; a critical answer signals high priority)
  const healthcare = answers[TRADEOFF_HEALTHCARE];
  if (healthcare === 'healthcare_critical') inc('healthcare', 2);  // critical = strong signal
  if (healthcare === 'healthcare_moderate') inc('healthcare', 1);

  // family → maps onto BOTH schools AND childcare (FAMILY_CATEGORIES — explicit mapping, D-06)
  const family = answers[TRADEOFF_FAMILY];
  if (family === 'family_critical') {
    for (const cat of FAMILY_CATEGORIES) inc(cat, 2);  // critical = strong signal to both
  }
  if (family === 'family_moderate') {
    for (const cat of FAMILY_CATEGORIES) inc(cat, 1);
  }

  // connectivity → connectivity
  const connectivity = answers[TRADEOFF_CONNECTIVITY];
  if (connectivity === 'connectivity_critical') inc('connectivity', 2);
  if (connectivity === 'connectivity_moderate') inc('connectivity', 1);

  // ── Module-importance signals (the ONLY weight path for tradeoff-less categories) ──
  // Reads ${MODULE_IMPORTANCE_PREFIX}${cat} for every cat in ALL_SCORED_CATEGORIES.
  // Without this block, climateRisk/parks/demographics would be permanently stranded at
  // NEUTRAL_DEFAULT regardless of how strongly the user expressed interest.
  for (const cat of ALL_SCORED_CATEGORIES) {
    const importanceKey = `${MODULE_IMPORTANCE_PREFIX}${cat}`;
    const importanceVal = answers[importanceKey];
    if (importanceVal === 'high') {
      // A single "high" importance answer MUST push weight strictly > NEUTRAL_DEFAULT.
      // With WEIGHT_STEP=0.3 and NEUTRAL_DEFAULT=0.5:
      //   +1 → 0+0.3=0.3 < 0.5  (fails the forcing test — QUIZ-09 contract broken)
      //   +2 → 0+0.6=0.6 > 0.5  (passes)
      // IMPORTANCE_TALLY_INCREMENT=2 documents this choice (see constant above).
      inc(cat, IMPORTANCE_TALLY_INCREMENT);
    } else if (importanceVal === 'moderate') {
      inc(cat, 1);
    }
    // 'low' and missing keys → no increment (neutral default applies)
  }

  // ── Step 2: Convert tallies → raw weights + WeightExplanation entries ────────
  const categoryWeights: Record<string, number> = {};
  const weightExplanations: WeightExplanation[] = [];

  for (const cat of ALL_SCORED_CATEGORIES) {
    const tally = tallies[cat] ?? 0;
    const isPractical = PRACTICAL_CATEGORIES.has(cat);
    const maxW = isPractical ? WEIGHT_MAX_PRAC : WEIGHT_MAX_PREF;
    const floor = isPractical ? WEIGHT_FLOOR : 0;

    if (tally === 0) {
      // No signal for this category — emit NEUTRAL_DEFAULT (D-13 never-undefined/NaN guard)
      categoryWeights[cat] = NEUTRAL_DEFAULT;
      // No WeightExplanation emitted for neutral/skipped categories (no inference made)
    } else {
      const rawWeight = Math.min(maxW, floor + tally * WEIGHT_STEP);
      categoryWeights[cat] = rawWeight;
      weightExplanations.push({
        category: cat,
        inferredWeight: rawWeight,
        floor: isPractical ? floor : undefined,
        explanation: `You chose ${cat}-focused options ${tally === 1 ? '1 time' : `${tally} times`}, so ${cat} weight = ${rawWeight.toFixed(2)} (${isPractical ? 'practical floor ' + floor : 'preference, freely swings'})`,
      });
    }
  }

  // D-08 contract: both fields always returned together from this single call
  return { categoryWeights, weightExplanations };
}
