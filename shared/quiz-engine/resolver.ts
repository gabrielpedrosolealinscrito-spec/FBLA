// ─────────────────────────────────────────────────────────────────────────────
// shared/quiz-engine/resolver.ts — Phase 2 Plan 02
// D-03: Conditional/branching follow-ups — questions adapt based on prior answers.
// Invariant: every conditional question MUST appear at-or-after its trigger in
// ALL_QUESTIONS (trigger-before-injection). The resolver reads the array in
// order; it NEVER re-orders questions — only filters or splices after the trigger.
//
// Plan 02 (this file): getVisibleQuestions filters on showIf ONLY.
// Plan 04 (tension seam): detectTension call + splice injection of tension follow-ups
// is left as a commented seam below. Un-comment in Plan 04 Task 1.
// ─────────────────────────────────────────────────────────────────────────────

import type { QuestionDef, Answers } from './questions.js';

import { detectTension } from './tension.js';

// ── getVisibleQuestions ───────────────────────────────────────────────────────
/**
 * Returns the ordered subset of questions the user should currently see,
 * based on their current answers.
 *
 * Rules (Plan 02 — showIf only):
 *   1. A question with no `showIf` is always visible.
 *   2. A question with `showIf` is visible iff `showIf(answers)` returns true.
 *
 * Plan 04 seam: after filtering, call detectTension(answers) and splice any
 * returned TensionResult question immediately after its trigger question.
 */
export function getVisibleQuestions(
  answers: Answers,
  all: QuestionDef[],
): QuestionDef[] {
  const visible = all.filter((q) => {
    if (!q.showIf) return true;
    try {
      return q.showIf(answers);
    } catch {
      // Defensive: a broken showIf predicate must never crash the quiz.
      return false;
    }
  });

  // ── Plan 04 tension injection (D-14) ─────────────────────────────────────
  // detectTension returns a TensionResult when a known conflict fires; the
  // follow-up question is spliced immediately after its trigger question.
  // Invariant: the trigger question (afterId) must appear in ALL_QUESTIONS
  // before any injected follow-up (trigger-before-injection guarantee).
  const tension = detectTension(answers);
  if (tension) {
    const triggerIdx = visible.findIndex((q) => q.id === tension.afterId);
    if (triggerIdx >= 0) {
      visible.splice(triggerIdx + 1, 0, tension.question);
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  return visible;
}

// ── clearHiddenAnswers ────────────────────────────────────────────────────────
/**
 * Returns a new answers object with stale answers removed.
 * An answer is stale if its question id is present in `all` but that question
 * is no longer visible (hidden by showIf after a prior answer changed).
 *
 * Answers for ids that do NOT appear in `all` (e.g. future `tension_*` answers
 * injected by Plan 04) are preserved so they are not silently dropped.
 */
export function clearHiddenAnswers(answers: Answers, all: QuestionDef[]): Answers {
  const visible = getVisibleQuestions(answers, all);
  const visibleIds = new Set(visible.map((q) => q.id));
  const allIds = new Set(all.map((q) => q.id));

  const cleaned: Answers = {};
  for (const [key, value] of Object.entries(answers)) {
    // Keep the answer if: question is visible OR not in ALL_QUESTIONS at all
    if (visibleIds.has(key) || !allIds.has(key)) {
      cleaned[key] = value;
    }
    // Drop if: question exists in ALL_QUESTIONS but is currently hidden
  }
  return cleaned;
}
