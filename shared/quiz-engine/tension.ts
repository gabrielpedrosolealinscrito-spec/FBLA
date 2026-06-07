// ─────────────────────────────────────────────────────────────────────────────
// shared/quiz-engine/tension.ts — Phase 2 Plan 04
// D-14: Tension detection — conflicting priorities surface a reconciling follow-up.
// D-15: Tiebreaker stored as tradeoffTolerance on the Profile so Phase 3 can rank
//       balanced cities.
//
// Shape: detectTension(answers): TensionResult | null
//   → mirrors checkReconfirm's signal-or-null shape (dealbreakers.ts lines 282–304)
//
// Guard discipline: unknown/absent answer keys → null, never throw.
//   (cf. getTriggeredDealbreakers default: break — dealbreakers.ts lines 81–180)
//
// Invariant: every tension question id uses the "tension_" prefix so the resolver
// test can assert `q.id.startsWith('tension_')`.
// ─────────────────────────────────────────────────────────────────────────────

import type { QuestionDef, Answers } from './questions.js';

// ── TensionResult ─────────────────────────────────────────────────────────────

export interface TensionResult {
  /** The id of the question AFTER which the follow-up is spliced. */
  afterId: string;
  /** The reconciling follow-up question to inject. */
  question: QuestionDef;
}

// ── Tension question definitions ──────────────────────────────────────────────

/**
 * Pair 1 (primary, D-14 / 02-RESEARCH lines 357–385):
 *   Nature lover (lifestyleTags includes "outdoors" or "snow") AND
 *   career-first (importanceRank[0] or [1] === "career")
 *   → tiebreaker: nature vs career.
 *
 * Option values are literally "a" / "b" / "balanced" so synthesizer can
 * copy-through to Profile.tradeoffTolerance.preference directly.
 */
const TENSION_NATURE_VS_CAREER: QuestionDef = {
  id: 'tension_nature_vs_career',
  type: 'single_select',
  kicker: 'PRIORITIES',
  prompt: 'Nature or career, when they conflict, which wins?',
  subtext:
    'Cities that are great for outdoor lifestyles often have fewer high-growth career hubs. ' +
    'Your answer helps us rank cities that balance both.',
  autoAdvance: true,
  options: [
    { value: 'a', label: 'Nature wins - lifestyle first' },
    { value: 'b', label: 'Career wins - opportunity first' },
    { value: 'balanced', label: 'Find the balance - rank cities that offer both' },
  ],
};

/**
 * Pair 2 (Assumption A6):
 *   Cost-focused (importanceRank[0] === "cost") AND
 *   walkable/transit lifestyle (lifestyleTags includes "walkable")
 *   → tiebreaker: cost vs walkability/amenity.
 *
 * Walkable urban areas tend to carry a cost premium. When someone ranks cost
 * first AND tags walkable as a lifestyle need, the conflict is real.
 */
const TENSION_COST_VS_AMENITY: QuestionDef = {
  id: 'tension_cost_vs_amenity',
  type: 'single_select',
  kicker: 'PRIORITIES',
  prompt: 'Walkability usually costs more, so how do you break the tie?',
  subtext:
    'Walkable, transit-rich cities tend to have higher rents. ' +
    'Your pick shapes how we weight affordability vs. urban access.',
  autoAdvance: true,
  options: [
    { value: 'a', label: 'Cost wins - I will take a car-dependent city to save money' },
    { value: 'b', label: 'Walkability wins - I will pay for the convenience' },
    { value: 'balanced', label: 'Somewhere in between - moderate density, moderate cost' },
  ],
};

// ── detectTension ─────────────────────────────────────────────────────────────

/**
 * Detects the first fired conflict pair and returns a TensionResult to inject,
 * or null if no conflict is detected.
 *
 * Guard discipline: missing/non-array answer keys are treated as empty arrays;
 * the function NEVER throws on sparse or unknown answer maps.
 *
 * Priority: nature_vs_career fires first (primary pair, D-14 canonical example).
 * cost_vs_amenity fires only when nature_vs_career does not.
 */
export function detectTension(answers: Answers): TensionResult | null {
  const lifestyleTags: string[] = Array.isArray(answers['lifestyleTags'])
    ? (answers['lifestyleTags'] as string[])
    : [];
  const importanceRank: string[] = Array.isArray(answers['importanceRank'])
    ? (answers['importanceRank'] as string[])
    : [];

  // ── Pair 1: nature (outdoors or snow) + high career priority ─────────────
  const hasNatureTag =
    lifestyleTags.includes('outdoors') || lifestyleTags.includes('snow');
  const careerHighPriority =
    importanceRank[0] === 'career' || importanceRank[1] === 'career';

  if (hasNatureTag && careerHighPriority) {
    return {
      afterId: 'importanceRank',
      question: TENSION_NATURE_VS_CAREER,
    };
  }

  // ── Pair 2: cost-first + walkable lifestyle ───────────────────────────────
  const costFirst = importanceRank[0] === 'cost';
  const hasWalkableTag = lifestyleTags.includes('walkable');

  if (costFirst && hasWalkableTag) {
    return {
      afterId: 'importanceRank',
      question: TENSION_COST_VS_AMENITY,
    };
  }

  return null;
}
