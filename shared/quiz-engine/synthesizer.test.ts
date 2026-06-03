// ─────────────────────────────────────────────────────────────────────────────
// shared/quiz-engine/synthesizer.test.ts — RED stubs (Wave 0, Plan 02-01)
// Covers: QUIZ-01/02/03/04/05 — synthesizeProfile maps answers to Profile
//
// STAGGERED-GREEN DISCIPLINE:
//   - synthesizer.js is created in Plan 02 → this file is RED now
//   - tradeoffTolerance case is it.skip (Plan 04 adds that field's population)
//   - NO top-level import of ./tension.js
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { synthesizeProfile } from './synthesizer.js';

// ── Representative answers fixture ───────────────────────────────────────────
// importanceRank: ["career","cost","lifestyle","safety"]
// rank-0 (career) → raw weight 4, rank-1 (cost) → 3, rank-2 (lifestyle) → 2, rank-3 (safety) → 1
// Phase 2 emits RAW 1–4; Phase 3 engine normalizes to [0,1]. Do NOT pre-normalize.
const baseAnswers: Record<string, unknown> = {
  profession: 'Software Engineer',
  hasRemote: true,
  income: 110000,
  savings: 20000,
  debt: 0,
  housing: 'rent',
  hasPartner: false,
  partnerIncome: 0,
  hasDependents: false,
  numDependents: 0,
  hasPets: false,
  age: 28,
  education: 'bachelor',
  currentCity: 'Austin, TX',
  citizenship: 'US',
  // immigrationStatus intentionally absent for US citizen — auto-derived
  opennessToAbroad: 65,
  lifestyleTags: ['outdoors', 'startup'],
  dealBreakers: ['Must be near ocean/coast'],
  importanceRank: ['career', 'cost', 'lifestyle', 'safety'],
  moveTimeline: '12mo',
  motivationToMove: 'career',
  workStyle: 'remote',
  communityNeeds: ['arts', 'outdoors'],
  paceOfLife: 'fast',
  riskTolerance: 70,
};

// ── QUIZ-01 / QUIZ-03: Basic Profile mapping ──────────────────────────────────

describe('synthesizeProfile — basic Profile mapping (QUIZ-01)', () => {
  it('maps string fields from answers directly to Profile', () => {
    const profile = synthesizeProfile(baseAnswers);
    expect(profile.profession).toBe('Software Engineer');
    expect(profile.housing).toBe('rent');
    expect(profile.education).toBe('bachelor');
    expect(profile.currentCity).toBe('Austin, TX');
  });

  it('maps numeric fields from answers to Profile', () => {
    const profile = synthesizeProfile(baseAnswers);
    expect(profile.income).toBe(110000);
    expect(profile.savings).toBe(20000);
    expect(profile.age).toBe(28);
  });

  it('maps boolean fields from answers to Profile', () => {
    const profile = synthesizeProfile(baseAnswers);
    expect(profile.hasRemote).toBe(true);
    expect(profile.hasPartner).toBe(false);
    expect(profile.hasDependents).toBe(false);
    expect(profile.hasPets).toBe(false);
  });
});

// ── QUIZ-03: Immigration auto-derive (D-09) ───────────────────────────────────

describe('synthesizeProfile — immigrationStatus auto-derive (QUIZ-03, D-09)', () => {
  it('sets immigrationStatus to "citizen" when citizenship is US', () => {
    const profile = synthesizeProfile({ ...baseAnswers, citizenship: 'US' });
    expect(profile.citizenship).toBe('US');
    expect(profile.immigrationStatus).toBe('citizen');
  });

  it('preserves explicit immigrationStatus for non-US citizens', () => {
    const nonUsAnswers = {
      ...baseAnswers,
      citizenship: 'Brazil',
      immigrationStatus: 'work_visa',
    };
    const profile = synthesizeProfile(nonUsAnswers);
    expect(profile.citizenship).toBe('Brazil');
    expect(profile.immigrationStatus).toBe('work_visa');
  });

  it('defaults immigrationStatus to empty string for non-US with no status answer', () => {
    const noStatusAnswers = { ...baseAnswers, citizenship: 'Germany' };
    delete (noStatusAnswers as Record<string, unknown>).immigrationStatus;
    const profile = synthesizeProfile(noStatusAnswers);
    expect(profile.immigrationStatus).toBe('');
  });
});

// ── QUIZ-02: opennessToAbroad slider ─────────────────────────────────────────

describe('synthesizeProfile — opennessToAbroad (QUIZ-02)', () => {
  it('captures opennessToAbroad slider value in synthesized Profile', () => {
    const profile = synthesizeProfile(baseAnswers);
    expect(profile.opennessToAbroad).toBe(65);
  });

  it('defaults opennessToAbroad to 50 when absent from answers', () => {
    const noSlider = { ...baseAnswers };
    delete (noSlider as Record<string, unknown>).opennessToAbroad;
    const profile = synthesizeProfile(noSlider);
    expect(profile.opennessToAbroad).toBe(50);
  });
});

// ── QUIZ-04: dealBreakers ─────────────────────────────────────────────────────

describe('synthesizeProfile — dealBreakers (QUIZ-04)', () => {
  it('captures dealBreaker selections in Profile.dealBreakers array', () => {
    const profile = synthesizeProfile(baseAnswers);
    expect(profile.dealBreakers).toContain('Must be near ocean/coast');
  });

  it('defaults dealBreakers to empty array when absent', () => {
    const noDb = { ...baseAnswers };
    delete (noDb as Record<string, unknown>).dealBreakers;
    const profile = synthesizeProfile(noDb);
    expect(Array.isArray(profile.dealBreakers)).toBe(true);
    expect(profile.dealBreakers).toHaveLength(0);
  });
});

// ── QUIZ-05: moveTimeline ─────────────────────────────────────────────────────

describe('synthesizeProfile — moveTimeline (QUIZ-05)', () => {
  it('captures moveTimeline in the synthesized Profile', () => {
    const profile = synthesizeProfile(baseAnswers);
    expect(profile.moveTimeline).toBe('12mo');
  });

  it('defaults moveTimeline to empty string when absent', () => {
    const noTimeline = { ...baseAnswers };
    delete (noTimeline as Record<string, unknown>).moveTimeline;
    const profile = synthesizeProfile(noTimeline);
    expect(typeof profile.moveTimeline).toBe('string');
  });
});

// ── QUIZ-01: Raw 1–4 weights from importanceRank ─────────────────────────────
// Phase 2 emits raw 1–4. Phase 3 normalizes to [0,1] via PERSONAL_WEIGHT_SCALE.
// CRITICAL: assert raw values, NOT [0,1]. rank-0 → 4, rank-1 → 3, rank-2 → 2, rank-3 → 1.

describe('synthesizeProfile — raw importanceRank weights (QUIZ-01)', () => {
  it('derives raw weights: rank-0 (career) → 4, rank-1 (cost) → 3', () => {
    // importanceRank: ['career', 'cost', 'lifestyle', 'safety']
    const profile = synthesizeProfile(baseAnswers);
    expect(profile.weights).toBeDefined();
    expect(profile.weights!.career).toBe(4);
    expect(profile.weights!.cost).toBe(3);
  });

  it('derives raw weights: rank-2 (lifestyle) → 2, rank-3 (safety) → 1', () => {
    const profile = synthesizeProfile(baseAnswers);
    expect(profile.weights!.lifestyle).toBe(2);
    expect(profile.weights!.safety).toBe(1);
  });

  it('handles any permutation of importanceRank correctly', () => {
    const altAnswers = {
      ...baseAnswers,
      importanceRank: ['safety', 'lifestyle', 'career', 'cost'],
    };
    const profile = synthesizeProfile(altAnswers);
    expect(profile.weights!.safety).toBe(4);
    expect(profile.weights!.lifestyle).toBe(3);
    expect(profile.weights!.career).toBe(2);
    expect(profile.weights!.cost).toBe(1);
  });
});

// ── Phase-2 dimension fields ──────────────────────────────────────────────────

describe('synthesizeProfile — Phase-2 dimension fields (D-02)', () => {
  it('captures motivationToMove, workStyle, paceOfLife from answers', () => {
    const profile = synthesizeProfile(baseAnswers);
    expect(profile.motivationToMove).toBe('career');
    expect(profile.workStyle).toBe('remote');
    expect(profile.paceOfLife).toBe('fast');
  });

  it('captures communityNeeds array from answers', () => {
    const profile = synthesizeProfile(baseAnswers);
    expect(profile.communityNeeds).toContain('arts');
    expect(profile.communityNeeds).toContain('outdoors');
  });

  it('captures riskTolerance number from answers', () => {
    const profile = synthesizeProfile(baseAnswers);
    expect(profile.riskTolerance).toBe(70);
  });
});

// ── QUIZ-01: tradeoffTolerance tension answers (it.skip — Plan 04) ───────────
// tradeoffTolerance population is implemented in Plan 04 (tension reconciliation).
// Un-skip in Plan 04 Task 1 once synthesizer reads resolved tension answers.
// NOTE: no top-level import of ./tension.js here.

describe('synthesizeProfile — tradeoffTolerance (Plan 04)', () => {
  it('maps resolved tension answers to tradeoffTolerance on Profile', () => {
    const answersWithTension = {
      ...baseAnswers,
      'tension_nature_vs_career': 'a', // "a" = nature wins
    };
    const profile = synthesizeProfile(answersWithTension);
    expect(Array.isArray(profile.tradeoffTolerance)).toBe(true);
    const entry = profile.tradeoffTolerance!.find(
      (t) => t.dimension === 'nature_vs_career',
    );
    expect(entry).toBeDefined();
    expect(entry!.preference).toBe('a');
  });
});
