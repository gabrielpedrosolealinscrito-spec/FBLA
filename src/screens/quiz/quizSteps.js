// ═══════════════════════════════════════════════════════════════════════════
// quizSteps.js — pure logic behind CenteredQuiz (Package 04)
// Extracted so the user-facing behavior is unit-testable WITHOUT rendering:
//   • buildSteps      — collapse consecutive same-group questions into one card
//                       (task 8 Finances) and define what the counter counts (task 3)
//   • pointToValue /  — 1–5 agree-scale bijection (task 2): clicking dot N must
//     valueToPoint       light dot N, and all 5 points must be reachable.
//   • deriveAge       — age from birthday (task 10)
//   • finalizeAnswers — inject derived/defaulted fields before synthesis
// ═══════════════════════════════════════════════════════════════════════════

// ── Steps (task 8 grouping + task 3 count) ───────────────────────────────────
// A "step" is one card. Consecutive questions sharing group.id collapse into a
// single group step; everything else is its own single step. The progress
// counter is steps.length — so it reflects the resolved visible set the user is
// actually clicking through, and advances by exactly one per Continue.
export function buildSteps(visible) {
  const steps = [];
  let i = 0;
  while (i < visible.length) {
    const q = visible[i];
    if (q.group) {
      const gid = q.group.id;
      const questions = [];
      while (i < visible.length && visible[i].group && visible[i].group.id === gid) {
        questions.push(visible[i]);
        i += 1;
      }
      steps.push({ type: 'group', id: gid, header: questions[0].group, questions });
    } else {
      steps.push({ type: 'single', id: q.id, question: q, questions: [q] });
      i += 1;
    }
  }
  return steps;
}

// ── 1–5 agree scale (task 2) ─────────────────────────────────────────────────
// Five UI points (0..4) map 1:1 to five stored tokens. The old code mapped 5
// points onto a 3-token model, so clicking "1" lit "2" and point 0/2 were dead.
// Trait answers are flavor-only (not read by synthesizer.ts / tension.ts), so a
// 5-token vocabulary is safe and loses no scoring information.
export const SCALE_TOKENS = [
  'strongly_disagree',
  'disagree',
  'neutral',
  'agree',
  'strongly_agree',
];
export const SCALE_LABELS = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree',
];
export const pointToValue = (i) => SCALE_TOKENS[i] ?? null;
export const valueToPoint = (v) => {
  const i = SCALE_TOKENS.indexOf(v);
  return i === -1 ? null : i;
};

// ── Age from birthday (task 10) ──────────────────────────────────────────────
// birthday is an ISO 'YYYY-MM-DD' string from <input type="date">.
export function deriveAge(birthday, now = new Date()) {
  if (!birthday) return null;
  const b = new Date(birthday);
  if (Number.isNaN(b.getTime())) return null;
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  if (age < 0 || age > 120) return null;
  return age;
}

// ── Finalize answers before synthesis ────────────────────────────────────────
// Injects fields the engine expects that aren't stored under their own visible
// question, so the (non-owned) synthesizer needs no changes:
//   • age           ← derived from birthday
//   • profession    ← free-text when "Other / not listed" was chosen (task 4)
//   • opennessToAbroad = 0 when the user did NOT opt into Going Global (task 18)
//     so non-global users get US-only results even though the slider was gated.
// Strips internal __flags. Pure — returns a new object.
export function finalizeAnswers(answers, { now } = {}) {
  const out = {};
  for (const [k, v] of Object.entries(answers)) {
    if (k.startsWith('__')) continue; // internal flags (__isGlobal, __birthdayKnown)
    out[k] = v;
  }
  const age = deriveAge(answers.birthday, now ?? new Date());
  if (age != null) out.age = age;

  if (answers.profession === '__other' && answers.professionOther) {
    out.profession = answers.professionOther;
  }

  if (answers.goingGlobalIntro !== 'include') {
    out.opennessToAbroad = 0; // US-only
  }
  return out;
}

// ── Answeredness (shared by canProceed + ranking required check) ─────────────
export function isAnswered(value) {
  if (value == null || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}
