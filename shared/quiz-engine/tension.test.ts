// ─────────────────────────────────────────────────────────────────────────────
// shared/quiz-engine/tension.test.ts — RED stubs (Wave 0, Plan 02-01)
// Covers: QUIZ-01 — detectTension fires on conflicting priorities
//
// WARNING — STAGGERED-GREEN (import-RED by design):
//   This file has a top-level import of ./tension.js.
//   tension.js is NOT created until Plan 02-04.
//   This file IMPORT-ERRORS (fails to collect) through Plans 02-01, 02-02, 02-03.
//   A .skip cannot protect against a missing top-level import.
//   Therefore Plans 02-01/02/03 verify commands EXCLUDE this file.
//   Only Plan 02-04's gate runs the full shared/quiz-engine/ dir.
//   Do NOT run `npx vitest run shared/quiz-engine/` before Plan 04 is complete.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { detectTension } from './tension.js';

// ── QUIZ-01: detectTension behavior ──────────────────────────────────────────

describe('detectTension (QUIZ-01)', () => {
  it('returns a non-null TensionResult for nature + career conflict', () => {
    // nature + high career priority = the canonical conflict pair (02-RESEARCH lines 357–385)
    const conflictingAnswers = {
      lifestyleTags: ['outdoors', 'hiking'],
      importanceRank: ['career', 'cost', 'lifestyle', 'safety'], // career is rank-0
    };
    const result = detectTension(conflictingAnswers);
    expect(result).not.toBeNull();
  });

  it('returned TensionResult has afterId (string) and question (object with id)', () => {
    const conflictingAnswers = {
      lifestyleTags: ['outdoors', 'hiking'],
      importanceRank: ['career', 'cost', 'lifestyle', 'safety'],
    };
    const result = detectTension(conflictingAnswers);
    expect(typeof result!.afterId).toBe('string');
    expect(typeof result!.question).toBe('object');
    expect(typeof result!.question.id).toBe('string');
  });

  it('returns null when there is no detectable conflict', () => {
    // career-focused answers with no nature/outdoors tags — no conflict
    const nonConflictingAnswers = {
      lifestyleTags: ['startup', 'nightlife'],
      importanceRank: ['career', 'cost', 'lifestyle', 'safety'],
    };
    const result = detectTension(nonConflictingAnswers);
    expect(result).toBeNull();
  });

  it('returns null for empty answers (no crash on missing keys)', () => {
    // Defensive: unknown/absent answer keys must never throw, return null
    const result = detectTension({});
    expect(result).toBeNull();
  });

  it('returns null for non-conflicting lifestyle tags without career priority', () => {
    const safeAnswers = {
      lifestyleTags: ['outdoors', 'hiking'],
      importanceRank: ['lifestyle', 'cost', 'safety', 'career'], // career is rank-3
    };
    // Nature + low career priority = no conflict (they reinforce each other)
    const result = detectTension(safeAnswers);
    expect(result).toBeNull();
  });
});
