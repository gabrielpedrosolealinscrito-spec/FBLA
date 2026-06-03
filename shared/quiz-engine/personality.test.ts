// ─────────────────────────────────────────────────────────────────────────────
// shared/quiz-engine/personality.test.ts — RED stubs (Wave 1, Phase 11 Plan 01)
// Covers: QUIZ-06 — detectPersonalityTension + synthesizeCategoryWeights
//         QUIZ-09 — neutral skip (never undefined/NaN for any scored category)
//
// STAGGERED-GREEN DISCIPLINE:
//   This file has a top-level import of ./personality.js.
//   personality.js is NOT created until Wave 2 (Plan 11-02).
//   This file IMPORT-ERRORS (fails to collect) until Plan 11-02 lands.
//   A .skip cannot protect against a missing top-level import.
//   Wave 1 verify commands EXCLUDE this file:
//     npx vitest run shared/engine/   ← correct Wave 1 gate
//   Do NOT run `npx vitest run shared/quiz-engine/` this wave — tension.test.ts
//   and this file both import-error by design.
//   CRITICAL: this file must NOT import ./tension.js (absent on disk — would fail-collect).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { detectPersonalityTension, synthesizeCategoryWeights, NEUTRAL_DEFAULT } from './personality.js';
import { ALL_SCORED_CATEGORIES, TRADEOFF_HEALTHCARE, TRADEOFF_CONNECTIVITY, MODULE_IMPORTANCE_PREFIX } from './keys.js';

// ── QUIZ-06: detectPersonalityTension behavior ───────────────────────────────

describe('detectPersonalityTension (QUIZ-06)', () => {
  it('returns non-null when ≥2 "balanced" answers are present', () => {
    // Two "balanced" answers triggers the adaptive follow-up question
    const ambiguousAnswers = {
      tradeoff_cost_vs_lifestyle: 'balanced',
      tradeoff_safety_vs_career: 'balanced',
    };
    const result = detectPersonalityTension(ambiguousAnswers);
    expect(result).not.toBeNull();
  });

  it('returned result has afterId (string) and question (object with string id)', () => {
    const ambiguousAnswers = {
      tradeoff_cost_vs_lifestyle: 'balanced',
      tradeoff_safety_vs_career: 'balanced',
    };
    const result = detectPersonalityTension(ambiguousAnswers);
    expect(typeof result!.afterId).toBe('string');
    expect(typeof result!.question).toBe('object');
    expect(typeof result!.question.id).toBe('string');
  });

  it('returns null when no ambiguity (all decisive answers)', () => {
    // All decisive — no "balanced" choices, so no follow-up needed
    const decisiveAnswers = {
      tradeoff_cost_vs_lifestyle: 'cost_wins',
      tradeoff_safety_vs_career: 'career_wins',
      [TRADEOFF_HEALTHCARE]: 'healthcare_low',
      tradeoff_family_vs_mobility: 'family_low',
      [TRADEOFF_CONNECTIVITY]: 'connectivity_low',
    };
    const result = detectPersonalityTension(decisiveAnswers);
    expect(result).toBeNull();
  });

  it('returns null for {} empty answers (no crash on missing keys)', () => {
    // Defensive guard: unknown/absent keys must never throw
    const result = detectPersonalityTension({});
    expect(result).toBeNull();
  });
});

// ── QUIZ-06: synthesizeCategoryWeights — output shape ───────────────────────

describe('synthesizeCategoryWeights — output shape (QUIZ-06)', () => {
  it('emits BOTH categoryWeights and weightExplanations together (D-08 — never one without the other)', () => {
    const answers = { [TRADEOFF_HEALTHCARE]: 'healthcare_critical' };
    const result = synthesizeCategoryWeights(answers);
    expect(result.categoryWeights).toBeDefined();
    expect(result.weightExplanations).toBeDefined();
    expect(Array.isArray(result.weightExplanations)).toBe(true);
  });

  it('healthcare-favoring answer raises healthcare weight above NEUTRAL_DEFAULT', () => {
    const answers = { [TRADEOFF_HEALTHCARE]: 'healthcare_critical' };
    const result = synthesizeCategoryWeights(answers);
    expect(result.categoryWeights['healthcare']).toBeGreaterThan(NEUTRAL_DEFAULT);
  });

  it('healthcare-favoring answer adds a matching weightExplanations entry', () => {
    const answers = { [TRADEOFF_HEALTHCARE]: 'healthcare_critical' };
    const result = synthesizeCategoryWeights(answers);
    const entry = result.weightExplanations.find((e) => e.category === 'healthcare');
    expect(entry).toBeDefined();
    expect(entry!.inferredWeight).toBeGreaterThan(NEUTRAL_DEFAULT);
    expect(typeof entry!.explanation).toBe('string');
    expect(entry!.explanation.length).toBeGreaterThan(0);
  });

  // FORCING TEST (guard for MEMORY.md "assert what the user sees" lesson):
  // Categories without a personality tradeoff (climateRisk, parks, demographics)
  // must still get a real weight above NEUTRAL_DEFAULT when the user expresses
  // importance via their `importance_{category}` question answer.
  // The assertion is strictly ">" — if it is "≥" or dropped, the synthesizer
  // increment/step (plan 02) is wrong, NOT this test.
  it('high importance_climateRisk answer raises climateRisk weight strictly ABOVE NEUTRAL_DEFAULT', () => {
    const answers = { [`${MODULE_IMPORTANCE_PREFIX}climateRisk`]: 'high' };
    const result = synthesizeCategoryWeights(answers);
    // Strict ">" is intentional — NEUTRAL_DEFAULT is the no-signal fallback; a
    // high-importance answer must produce measurably more than the fallback.
    expect(result.categoryWeights['climateRisk']).toBeGreaterThan(NEUTRAL_DEFAULT);
  });

  it('high importance_parks answer raises parks weight strictly ABOVE NEUTRAL_DEFAULT', () => {
    const answers = { [`${MODULE_IMPORTANCE_PREFIX}parks`]: 'high' };
    const result = synthesizeCategoryWeights(answers);
    expect(result.categoryWeights['parks']).toBeGreaterThan(NEUTRAL_DEFAULT);
  });
});

// ── QUIZ-09: neutral skip — never undefined/NaN for any scored category ──────

describe('synthesizeCategoryWeights — neutral skip (QUIZ-09)', () => {
  it('emits NEUTRAL_DEFAULT for every scored category when answers are empty (D-13)', () => {
    // No answers → every category gets the neutral fallback weight
    const result = synthesizeCategoryWeights({});
    for (const cat of ALL_SCORED_CATEGORIES) {
      expect(result.categoryWeights[cat]).toBeDefined();
      expect(typeof result.categoryWeights[cat]).toBe('number');
      // isNaN check is the canonical QUIZ-09 guard (asserts what the user sees)
      expect(isNaN(result.categoryWeights[cat])).toBe(false);
      expect(Number.isFinite(result.categoryWeights[cat])).toBe(true);
    }
  });

  it('weightExplanations is a defined array even when answers are empty', () => {
    const result = synthesizeCategoryWeights({});
    expect(Array.isArray(result.weightExplanations)).toBe(true);
  });
});
