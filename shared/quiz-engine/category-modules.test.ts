// ─────────────────────────────────────────────────────────────────────────────
// shared/quiz-engine/category-modules.test.ts — RED stubs (Wave 1, Phase 11 Plan 01)
// Covers: QUIZ-07 — module showIf predicates (guided-modular flow, D-11)
//         QUIZ-08 — module question presence and contract guard (kicker, required)
//
// STAGGERED-GREEN DISCIPLINE:
//   This file has a top-level import of ./category-modules.js.
//   category-modules.js is NOT created until Wave 2 (Plan 11-03).
//   This file IMPORT-ERRORS (fails to collect) until Plan 11-03 lands.
//   A .skip cannot protect against a missing top-level import.
//   Wave 1 verify commands EXCLUDE this file:
//     npx vitest run shared/engine/   ← correct Wave 1 gate
//   Do NOT run `npx vitest run shared/quiz-engine/` this wave — tension.test.ts
//   and personality.test.ts also import-error by design.
//   CRITICAL: this file must NOT import ./tension.js (absent on disk — would fail-collect).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { CATEGORY_MODULE_QUESTIONS } from './category-modules.js';
import { TRADEOFF_HEALTHCARE, MODULE_SELECTED_PREFIX } from './keys.js';

// ── QUIZ-07: showIf predicates — guided-modular flow (D-11) ─────────────────

describe('CATEGORY_MODULE_QUESTIONS — healthcare showIf (QUIZ-07)', () => {
  it('healthcare module question showIf returns true when tradeoff_healthcare is healthcare_critical', () => {
    const q = CATEGORY_MODULE_QUESTIONS.find((q) => q.id === 'healthcare_chronic_condition')!;
    expect(q).toBeDefined();
    expect(q.showIf!({ [TRADEOFF_HEALTHCARE]: 'healthcare_critical' })).toBe(true);
  });

  it('healthcare module question showIf returns false when tradeoff_healthcare is healthcare_low', () => {
    const q = CATEGORY_MODULE_QUESTIONS.find((q) => q.id === 'healthcare_chronic_condition')!;
    expect(q.showIf!({ [TRADEOFF_HEALTHCARE]: 'healthcare_low' })).toBe(false);
  });

  it('healthcare module question showIf returns false for empty answers', () => {
    const q = CATEGORY_MODULE_QUESTIONS.find((q) => q.id === 'healthcare_chronic_condition')!;
    expect(q.showIf!({})).toBe(false);
  });

  it('healthcare module question showIf returns true when moduleSelected_healthcare flag is true', () => {
    // User explicitly opted into healthcare module even without personality recommendation (D-11)
    const q = CATEGORY_MODULE_QUESTIONS.find((q) => q.id === 'healthcare_chronic_condition')!;
    expect(q.showIf!({ [`${MODULE_SELECTED_PREFIX}healthcare`]: true })).toBe(true);
  });
});

// ── QUIZ-08: module question contract guards ──────────────────────────────────

describe('CATEGORY_MODULE_QUESTIONS — contract guards (QUIZ-08)', () => {
  it('every entry has a non-empty kicker string (QuestionDef strict-mode contract)', () => {
    // kicker is REQUIRED in QuestionDef — checked at build time via tsconfig strict:true
    for (const q of CATEGORY_MODULE_QUESTIONS) {
      expect(typeof q.kicker).toBe('string');
      expect(q.kicker.length).toBeGreaterThan(0);
    }
  });

  it('every entry has required: false (skipped → neutral default via synthesizeCategoryWeights, D-13)', () => {
    // All module questions must be optional — skipping a module falls back to NEUTRAL_DEFAULT,
    // never breaks scoring or strands the user.
    for (const q of CATEGORY_MODULE_QUESTIONS) {
      expect(q.required).toBe(false);
    }
  });

  it('CATEGORY_MODULE_QUESTIONS is a non-empty array', () => {
    expect(Array.isArray(CATEGORY_MODULE_QUESTIONS)).toBe(true);
    expect(CATEGORY_MODULE_QUESTIONS.length).toBeGreaterThan(0);
  });

  it('every entry has an id string', () => {
    for (const q of CATEGORY_MODULE_QUESTIONS) {
      expect(typeof q.id).toBe('string');
      expect(q.id.length).toBeGreaterThan(0);
    }
  });

  it('every entry has a showIf predicate (module questions are always conditionally gated)', () => {
    for (const q of CATEGORY_MODULE_QUESTIONS) {
      expect(typeof q.showIf).toBe('function');
    }
  });
});
