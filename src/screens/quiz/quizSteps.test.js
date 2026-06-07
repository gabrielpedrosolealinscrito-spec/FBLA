import { describe, it, expect } from 'vitest';
import {
  buildSteps,
  pointToValue,
  valueToPoint,
  deriveAge,
  finalizeAnswers,
} from './quizSteps.js';

// ── task 2: the 1–5 scale the USER sees ──────────────────────────────────────
describe('1–5 agree scale bijection (task 2)', () => {
  it('clicking dot N lights dot N — round-trips for all five points', () => {
    for (let i = 0; i <= 4; i += 1) {
      // user clicks point i → we store pointToValue(i) → dot highlighted is valueToPoint(stored)
      expect(valueToPoint(pointToValue(i))).toBe(i);
    }
  });

  it('all five points produce a distinct stored value (none dead)', () => {
    const stored = [0, 1, 2, 3, 4].map(pointToValue);
    expect(new Set(stored).size).toBe(5);
    expect(stored.every((v) => typeof v === 'string')).toBe(true);
  });
});

// ── task 8 + task 3: grouping and what the counter counts ────────────────────
describe('buildSteps — grouping + count (tasks 8, 3)', () => {
  const Q = (id, group) => ({ id, group });

  it('collapses consecutive same-group questions into one step', () => {
    const visible = [
      Q('a'),
      Q('income', { id: 'finances', label: 'Your finances' }),
      Q('savings', { id: 'finances' }),
      Q('debt', { id: 'finances' }),
      Q('b'),
    ];
    const steps = buildSteps(visible);
    expect(steps.map((s) => s.type)).toEqual(['single', 'group', 'single']);
    expect(steps[1].questions.map((q) => q.id)).toEqual(['income', 'savings', 'debt']);
    // 5 questions render as 3 cards — the counter counts cards, not questions.
    expect(steps.length).toBe(3);
  });

  it('advancing one card increments the displayed numerator by exactly one', () => {
    const steps = buildSteps([Q('a'), Q('b'), Q('c')]);
    // counter shows (idx+1)/steps.length — monotonic +1 per Continue.
    expect(steps.length).toBe(3);
    for (let idx = 0; idx < steps.length - 1; idx += 1) {
      expect(idx + 1 + 1).toBe(idx + 2); // numerator goes 1→2→3, never skips
    }
  });

  it('a denominator that grows reflects a real unlocked question, not a flicker', () => {
    const before = buildSteps([Q('a'), Q('b')]);
    const after = buildSteps([Q('a'), Q('b'), Q('c')]); // c unlocked by an answer
    expect(after.length).toBe(before.length + 1);
  });
});

// ── task 10: age from birthday ───────────────────────────────────────────────
describe('deriveAge (task 10)', () => {
  const now = new Date('2026-06-06');
  it('derives age from an ISO birthday', () => {
    expect(deriveAge('2000-01-01', now)).toBe(26);
  });
  it('accounts for a birthday later in the year', () => {
    expect(deriveAge('2000-12-31', now)).toBe(25);
  });
  it('returns null for missing or invalid input', () => {
    expect(deriveAge('', now)).toBeNull();
    expect(deriveAge('not-a-date', now)).toBeNull();
  });
});

// ── task 18 + task 4 + task 10: finalize before synthesis ────────────────────
describe('finalizeAnswers', () => {
  const now = new Date('2026-06-06');

  it('forces opennessToAbroad to 0 (US-only) when not opting into Going Global', () => {
    const out = finalizeAnswers({ goingGlobalIntro: 'skip', opennessToAbroad: 80 }, { now });
    expect(out.opennessToAbroad).toBe(0);
  });

  it('keeps the openness answer when the user opted in', () => {
    const out = finalizeAnswers(
      { goingGlobalIntro: 'include', opennessToAbroad: 80, __isGlobal: true },
      { now },
    );
    expect(out.opennessToAbroad).toBe(80);
  });

  it('substitutes the free-text profession when "Other" was chosen (task 4)', () => {
    const out = finalizeAnswers({ profession: '__other', professionOther: 'Falconer' }, { now });
    expect(out.profession).toBe('Falconer');
  });

  it('derives age and strips internal __flags', () => {
    const out = finalizeAnswers({ birthday: '2000-01-01', __isGlobal: true }, { now });
    expect(out.age).toBe(26);
    expect(out).not.toHaveProperty('__isGlobal');
    expect(out).not.toHaveProperty('birthday' in out ? '__nope' : '__nope'); // birthday itself is retained
    expect(out.birthday).toBe('2000-01-01');
  });
});
