// ─────────────────────────────────────────────────────────────────────────────
// shared/quiz-engine/resolver.test.ts — RED stubs (Wave 0, Plan 02-01)
// Covers: QUIZ-01 (getVisibleQuestions, clearHiddenAnswers) + QUIZ-03 (showIf)
//
// STAGGERED-GREEN DISCIPLINE:
//   - resolver.js is created in Plan 02 → this file is RED now (module absent)
//   - tension-injection case is it.skip (tension.js not until Plan 04)
//   - NO top-level import of ./tension.js (a .skip cannot save a missing import)
//   - Un-skip the tension-injection case in Plan 04 Task 1
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { getVisibleQuestions, clearHiddenAnswers } from './resolver.js';
import type { Profile } from '../types.js';

// ── Minimal question fixture ──────────────────────────────────────────────────
// Real questions come from questions.ts (Plan 02). We define a minimal inline
// fixture here so resolver.test.ts has no forward import of questions.js.
type ShowIfFn = (answers: Record<string, unknown>) => boolean;
interface MinimalQuestion {
  id: string;
  required?: boolean;
  showIf?: ShowIfFn;
}

const Q_CITIZENSHIP: MinimalQuestion = { id: 'citizenship', required: true };
const Q_IMMIGRATION_STATUS: MinimalQuestion = {
  id: 'immigrationStatus',
  showIf: (answers) => answers['citizenship'] !== 'US',
};
const Q_PROFESSION: MinimalQuestion = { id: 'profession', required: true };
const Q_OPENNESS: MinimalQuestion = { id: 'opennessToAbroad', required: true };
// Plan 04: importanceRank needed so the tension injection seam can find its trigger
const Q_IMPORTANCE_RANK: MinimalQuestion = { id: 'importanceRank', required: true };

const FIXTURE_QUESTIONS = [
  Q_CITIZENSHIP,
  Q_IMMIGRATION_STATUS,
  Q_PROFESSION,
  Q_OPENNESS,
  Q_IMPORTANCE_RANK,
] as unknown as Parameters<typeof getVisibleQuestions>[1];

// ── QUIZ-03: showIf filtering ─────────────────────────────────────────────────

describe('getVisibleQuestions — showIf (QUIZ-03)', () => {
  it('hides immigrationStatus question when citizenship is US', () => {
    const answers = { citizenship: 'US' };
    const visible = getVisibleQuestions(answers, FIXTURE_QUESTIONS);
    const ids = visible.map((q: { id: string }) => q.id);
    expect(ids).not.toContain('immigrationStatus');
    expect(ids).toContain('citizenship');
  });

  it('shows immigrationStatus question when citizenship is not US', () => {
    const answers = { citizenship: 'Brazil' };
    const visible = getVisibleQuestions(answers, FIXTURE_QUESTIONS);
    const ids = visible.map((q: { id: string }) => q.id);
    expect(ids).toContain('immigrationStatus');
  });

  it('shows all unconditional questions regardless of answers', () => {
    const answers = { citizenship: 'US' };
    const visible = getVisibleQuestions(answers, FIXTURE_QUESTIONS);
    const ids = visible.map((q: { id: string }) => q.id);
    expect(ids).toContain('profession');
    expect(ids).toContain('opennessToAbroad');
  });
});

// ── Package 04: tierGate (Going-Global gate, task 18) ─────────────────────────

describe('getVisibleQuestions — tierGate:global (task 18)', () => {
  const GATED = [
    { id: 'profession', required: true },
    { id: 'goingGlobalIntro', required: true },
    { id: 'opennessToAbroad', tierGate: 'global', showIf: (a: Record<string, unknown>) => a['goingGlobalIntro'] === 'include' },
    { id: 'citizenship', tierGate: 'global', showIf: (a: Record<string, unknown>) => a['goingGlobalIntro'] === 'include' },
  ] as unknown as Parameters<typeof getVisibleQuestions>[1];

  it('hides global-gated questions for a non-global tier even when they opt in', () => {
    // include chosen, but __isGlobal not set → still hidden (resolver gate).
    const visible = getVisibleQuestions({ goingGlobalIntro: 'include' }, GATED);
    const ids = visible.map((q: { id: string }) => q.id);
    expect(ids).toContain('goingGlobalIntro');
    expect(ids).not.toContain('opennessToAbroad');
    expect(ids).not.toContain('citizenship');
  });

  it('shows global-gated questions only when __isGlobal AND opted in', () => {
    const visible = getVisibleQuestions(
      { __isGlobal: true, goingGlobalIntro: 'include' },
      GATED,
    );
    const ids = visible.map((q: { id: string }) => q.id);
    expect(ids).toContain('opennessToAbroad');
    expect(ids).toContain('citizenship');
  });

  it('hides gated questions for a global user who did NOT opt in (chose skip)', () => {
    const visible = getVisibleQuestions(
      { __isGlobal: true, goingGlobalIntro: 'skip' },
      GATED,
    );
    const ids = visible.map((q: { id: string }) => q.id);
    expect(ids).not.toContain('opennessToAbroad');
    expect(ids).toContain('goingGlobalIntro');
  });
});

// ── QUIZ-01: clearHiddenAnswers ───────────────────────────────────────────────

describe('clearHiddenAnswers (QUIZ-01)', () => {
  it('removes answers for questions hidden by showIf after a prior answer changes', () => {
    // User answered immigrationStatus='work_visa' when citizenship='Brazil',
    // then changed citizenship to 'US'. clearHiddenAnswers should strip
    // the stale immigrationStatus answer.
    const answers = { citizenship: 'US', immigrationStatus: 'work_visa' };
    const cleaned = clearHiddenAnswers(answers, FIXTURE_QUESTIONS);
    expect(cleaned).not.toHaveProperty('immigrationStatus');
    expect(cleaned.citizenship).toBe('US');
  });

  it('preserves answers for questions that are visible', () => {
    const answers = { citizenship: 'Brazil', immigrationStatus: 'work_visa', profession: 'Engineer' };
    const cleaned = clearHiddenAnswers(answers, FIXTURE_QUESTIONS);
    expect(cleaned.immigrationStatus).toBe('work_visa');
    expect(cleaned.profession).toBe('Engineer');
  });
});

// ── QUIZ-01: Tension injection position (it.skip — Plan 04) ──────────────────
// Tension detection (detectTension from tension.js) is implemented in Plan 04.
// Un-skip this case in Plan 04 Task 1 once tension.js exists.
// NOTE: no top-level import of ./tension.js here — a .skip cannot protect
// against a missing module at collection time.

describe('getVisibleQuestions — tension injection position (QUIZ-01)', () => {
  it('injects a tension follow-up question immediately after its trigger question', () => {
    // To be un-skipped in Plan 04 once detectTension is implemented.
    // Assert: given answers that trigger a nature+career conflict,
    // getVisibleQuestions returns the tension question at index
    // (triggerIndex + 1) in the visible sequence.
    //
    // Implementation note: this test asserts ONLY against getVisibleQuestions
    // output (module from Plan 02). It does NOT import ./tension.js directly.
    // The resolver internally calls detectTension and splices the result.
    const conflictingAnswers = {
      lifestyleTags: ['outdoors', 'hiking'],
      importanceRank: ['career', 'cost', 'lifestyle', 'safety'],
    };
    // Once resolver.js calls detectTension internally and injects the question:
    const visible = getVisibleQuestions(conflictingAnswers, FIXTURE_QUESTIONS);
    // The injected tension question should appear right after the trigger
    const tensionIdx = visible.findIndex((q: { id: string }) => q.id.startsWith('tension_'));
    expect(tensionIdx).toBeGreaterThan(-1);
  });
});
