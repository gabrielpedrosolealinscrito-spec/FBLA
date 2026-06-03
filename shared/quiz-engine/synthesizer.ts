// ─────────────────────────────────────────────────────────────────────────────
// shared/quiz-engine/synthesizer.ts — Phase 2 Plan 02
// D-04: Output = structured preference profile.
// D-09: immigrationStatus always set — auto-derived for US citizens, explicitly
//       declared for non-US citizens, never undefined.
//
// WEIGHT CONTRACT (load-bearing):
//   synthesizeProfile emits Profile.weights as RAW 1–4 (rank0→4, rank1→3,
//   rank2→2, rank3→1). The engine's rankToWeight() in scoring.ts normalizes
//   to [0,1] by dividing by PERSONAL_WEIGHT_SCALE=4. Index.ts sanitizeProfile
//   clamps weights to [0,4] at entry. If the synthesizer pre-normalizes,
//   weights DOUBLE-SHRINK and all scoring breaks. DO NOT normalize here.
//
// DEFENSIVE DEFAULTS:
//   Every required Profile field must be present even if the user skipped a
//   question. Use ?? with typed defaults for all fields.
// ─────────────────────────────────────────────────────────────────────────────

import type { Profile, Housing } from '../types.js';
import type { Answers } from './questions.js';

// ── Raw weight derivation ─────────────────────────────────────────────────────
// Mirror of scoring.ts rankToWeight inner `raw()` logic (lines 48–54).
// Returns RAW 1–4 — the engine normalizes; do NOT divide here.
function rawWeight(
  rank: string[],
  cat: string,
): number {
  const i = rank.indexOf(cat);
  if (i === 0) return 4;
  if (i === 1) return 3;
  if (i === 2) return 2;
  return 1; // rank 3 or missing
}

// ── tradeoffTolerance builder (D-14) ─────────────────────────────────────────
/**
 * Collects all tension_* answer keys and maps them to the tradeoffTolerance
 * structure. dimension = key with "tension_" prefix stripped. preference is
 * copied through directly ("a" | "b" | "balanced") — option values on the
 * injected tiebreaker questions are authored to match the type's union.
 *
 * Returns [] when no tiebreaker answers are present in the answers map.
 */
function buildTradeoffTolerance(
  answers: Answers,
): NonNullable<Profile['tradeoffTolerance']> {
  const TENSION_PREFIX = 'tension_';
  const result: NonNullable<Profile['tradeoffTolerance']> = [];

  for (const [key, value] of Object.entries(answers)) {
    if (!key.startsWith(TENSION_PREFIX)) continue;
    if (typeof value !== 'string') continue;
    const pref = value as 'a' | 'b' | 'balanced';
    if (pref !== 'a' && pref !== 'b' && pref !== 'balanced') continue;
    result.push({
      dimension: key.slice(TENSION_PREFIX.length),
      preference: pref,
    });
  }

  return result;
}

// ── synthesizeProfile ─────────────────────────────────────────────────────────
/**
 * Converts quiz answers into a typed Profile.
 *
 * - weights: raw 1–4 (Phase 3 normalizes to [0,1]).
 * - immigrationStatus: always set (D-09 ternary).
 * - tradeoffTolerance: emitted as [] — Plan 04 fills from tension answers.
 * - All required fields defended with ?? defaults so sparse answers never
 *   produce undefined on a required Profile field.
 */
export function synthesizeProfile(answers: Answers): Profile {
  // ── importanceRank → raw weights ──────────────────────────────────────────
  const importanceRank = (answers['importanceRank'] as string[]) ?? [];
  const weights = {
    cost:      rawWeight(importanceRank, 'cost'),
    career:    rawWeight(importanceRank, 'career'),
    lifestyle: rawWeight(importanceRank, 'lifestyle'),
    safety:    rawWeight(importanceRank, 'safety'),
  };

  // ── immigrationStatus auto-derive (D-09) ──────────────────────────────────
  const citizenship = String(answers['citizenship'] ?? 'US');
  const immigrationStatus: string =
    citizenship === 'US'
      ? 'citizen'
      : String(answers['immigrationStatus'] ?? '');

  // ── Coerce boolean answers (stored as string "true"/"false" from SingleSelect) ──
  const boolAnswer = (key: string, fallback: boolean): boolean => {
    const v = answers[key];
    if (typeof v === 'boolean') return v;
    if (v === 'true') return true;
    if (v === 'false') return false;
    return fallback;
  };

  return {
    // Career
    profession: String(answers['profession'] ?? ''),
    hasRemote:  boolAnswer('hasRemote', false),

    // Finances
    income:        Number(answers['income']        ?? 55000),
    savings:       Number(answers['savings']       ?? 0),
    debt:          Number(answers['debt']          ?? 0),
    housing:       ((answers['housing'] as Housing) ?? 'rent'),
    hasPartner:    boolAnswer('hasPartner', false),
    partnerIncome: Number(answers['partnerIncome'] ?? 0),
    hasDependents: boolAnswer('hasDependents', false),
    numDependents: Number(answers['numDependents'] ?? 0),
    hasPets:       boolAnswer('hasPets', false),

    // Background
    age:         Number(answers['age']         ?? 28),
    education:   String(answers['education']   ?? ''),
    currentCity: String(answers['currentCity'] ?? ''),

    // Immigration
    citizenship,
    immigrationStatus,

    // Preferences
    opennessToAbroad: Number(answers['opennessToAbroad'] ?? 50),
    lifestyleTags:    (answers['lifestyleTags'] as string[]) ?? [],
    dealBreakers:     (answers['dealBreakers']  as string[]) ?? [],
    importanceRank:   importanceRank,
    weights,

    // Timeline
    moveTimeline: String(answers['moveTimeline'] ?? ''),

    // Phase-2 dimension fields (D-02, D-05)
    motivationToMove: String(answers['motivationToMove'] ?? ''),
    workStyle:        String(answers['workStyle']        ?? ''),
    communityNeeds:   (answers['communityNeeds'] as string[]) ?? [],
    paceOfLife:       String(answers['paceOfLife']       ?? ''),
    riskTolerance:    Number(answers['riskTolerance']    ?? 50),

    // Tradeoff tolerance — D-14/D-15: collect all tension_* answers and push
    // each as a { dimension, preference } entry. dimension = key.slice(8)
    // ("tension_" is 8 chars → e.g. "tension_nature_vs_career" → "nature_vs_career").
    // preference is copied through directly — option values are "a"|"b"|"balanced".
    // Emits [] when no tiebreaker answers are present.
    tradeoffTolerance: buildTradeoffTolerance(answers),
  };
}
