// ─────────────────────────────────────────────────────────────────────────────
// shared/quiz-engine/questions.ts — Phase 2 Plan 02
// D-02: Richer/adaptive capture dimensions (career, finances, background,
//       lifestyle, priorities, dealbreakers, Going Global: openness/citizenship/
//       immigration/moveTimeline).
// D-04: Output = structured preference profile — every field the financial
//       model and ranking engine consume must be captured here.
// D-08: Citizenship shortlist — US default + ~10 destination-relevant entries.
// D-12: All 10 DEAL_BREAKERS wired byte-exact from constants.js.
// Invariant: conditional/injected questions MUST appear after their trigger in
// ALL_QUESTIONS (resolver trigger-before-injection guarantee).
// ─────────────────────────────────────────────────────────────────────────────

import {
  DEAL_BREAKERS,
  PROFESSION_CATEGORIES,
  LIFESTYLE_TAGS,
} from '../data/constants.js';

// ── Phase 11: personality + category-module question sets ─────────────────────
// LOAD-BEARING ORDERING INVARIANT (Phase 11, Pitfall 4): PERSONALITY_QUESTIONS
// and TRAIT_QUESTIONS MUST come before CATEGORY_MODULE_QUESTIONS in ALL_QUESTIONS.
// Module showIf predicates key on personality answer values (e.g.
// tradeoff_healthcare === 'healthcare_critical'). If modules appear first, those
// answer keys are undefined at showIf evaluation time — all modules would
// either show incorrectly or hide entirely.
// Phase 11 Plan 02 (personality.ts) / Phase 11 Plan 03 (category-modules.ts).
import { PERSONALITY_QUESTIONS, TRAIT_QUESTIONS } from './personality.js';
import { CATEGORY_MODULE_QUESTIONS } from './category-modules.js';

// ── Types ─────────────────────────────────────────────────────────────────────

export type QuestionType =
  | 'single_select'
  | 'multi_select'
  | 'slider'
  | 'free_text'
  | 'boolean';

export interface QuestionOption {
  value: string;
  label: string;
  icon?: string;
}

export interface GroupHeader {
  label: string;
  subtext: string;
}

export interface QuestionDef {
  id: string;
  type: QuestionType;
  kicker: string;
  prompt: string;
  subtext?: string;
  required?: boolean;
  autoAdvance?: boolean;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  maxSelect?: number;
  groupHeader?: GroupHeader;
  showIf?: (answers: Record<string, unknown>) => boolean;
}

export type Answers = Record<string, unknown>;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Flatten PROFESSION_CATEGORIES into QuestionOption[] preserving category order. */
function buildProfessionOptions(): QuestionOption[] {
  const opts: QuestionOption[] = [];
  for (const profs of Object.values(PROFESSION_CATEGORIES as Record<string, string[]>)) {
    for (const p of profs) {
      opts.push({ value: p, label: p });
    }
  }
  return opts;
}

/** Map LIFESTYLE_TAGS to QuestionOption[]. */
function buildLifestyleOptions(): QuestionOption[] {
  return (LIFESTYLE_TAGS as { id: string; label: string; icon: string }[]).map(
    (t) => ({ value: t.id, label: t.label, icon: t.icon }),
  );
}

/** Map DEAL_BREAKERS (string[]) to QuestionOption[]. Byte-exact — no retyping. */
function buildDealBreakerOptions(): QuestionOption[] {
  return (DEAL_BREAKERS as string[]).map((d) => ({ value: d, label: d }));
}

// ── Question Registry ─────────────────────────────────────────────────────────

export const ALL_QUESTIONS: QuestionDef[] = [
  // ── CAREER ────────────────────────────────────────────────────────────────
  {
    id: 'profession',
    type: 'single_select',
    kicker: 'CAREER',
    prompt: 'What do you do?',
    subtext: 'This determines salary estimates and job matches.',
    required: true,
    autoAdvance: false,
    options: buildProfessionOptions(),
  },
  {
    id: 'hasRemote',
    type: 'single_select',
    kicker: 'CAREER',
    prompt: 'Can you work fully remote?',
    subtext: 'Remote workers get a job-market bonus in every city.',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'true', label: 'Yes — fully remote' },
      { value: 'false', label: 'No — I go into an office or field' },
    ],
  },
  {
    id: 'workStyle',
    type: 'single_select',
    kicker: 'CAREER',
    prompt: 'How do you prefer to work?',
    subtext: 'Shapes city recommendations around your daily rhythm.',
    autoAdvance: true,
    options: [
      { value: 'remote', label: 'Fully remote — anywhere' },
      { value: 'hybrid', label: 'Hybrid — a few days in-office' },
      { value: 'office', label: 'Office / on-site' },
    ],
  },

  // ── FINANCES ──────────────────────────────────────────────────────────────
  {
    id: 'income',
    type: 'slider',
    kicker: 'FINANCES',
    prompt: 'Current annual income',
    subtext: 'Used to calculate take-home pay city by city.',
    required: true,
    min: 20000,
    max: 250000,
    step: 5000,
    minLabel: '$20K',
    maxLabel: '$250K',
  },
  {
    id: 'savings',
    type: 'slider',
    kicker: 'FINANCES',
    prompt: 'Savings available for the move',
    min: 0,
    max: 200000,
    step: 2500,
    minLabel: '$0',
    maxLabel: '$200K',
  },
  {
    id: 'debt',
    type: 'slider',
    kicker: 'FINANCES',
    prompt: 'Total debt (student loans, car, etc.)',
    min: 0,
    max: 200000,
    step: 2500,
    minLabel: '$0',
    maxLabel: '$200K',
  },
  {
    id: 'housing',
    type: 'single_select',
    kicker: 'FINANCES',
    prompt: 'Housing preference',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'rent', label: 'Renting' },
      { value: 'buy', label: 'Buying' },
    ],
  },
  {
    id: 'hasPartner',
    type: 'single_select',
    kicker: 'FINANCES',
    prompt: 'Do you have a partner or spouse?',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    ],
  },
  {
    id: 'partnerIncome',
    type: 'slider',
    kicker: 'FINANCES',
    prompt: "Partner's annual income",
    min: 0,
    max: 200000,
    step: 5000,
    minLabel: '$0',
    maxLabel: '$200K',
    showIf: (a) => a['hasPartner'] === 'true' || a['hasPartner'] === true,
  },
  {
    id: 'hasDependents',
    type: 'single_select',
    kicker: 'FINANCES',
    prompt: 'Kids or other dependents?',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    ],
  },
  {
    id: 'numDependents',
    type: 'single_select',
    kicker: 'FINANCES',
    prompt: 'How many dependents?',
    autoAdvance: true,
    options: [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4+', label: '4+' },
    ],
    showIf: (a) => a['hasDependents'] === 'true' || a['hasDependents'] === true,
  },
  {
    id: 'hasPets',
    type: 'single_select',
    kicker: 'FINANCES',
    prompt: 'Pets?',
    subtext: 'Pet-friendly housing costs differ city by city.',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    ],
  },

  // ── ABOUT YOU (Background) ────────────────────────────────────────────────
  {
    id: 'age',
    type: 'slider',
    kicker: 'ABOUT YOU',
    prompt: 'Your age',
    subtext: 'Affects financial projections and peer-group city comparisons.',
    required: true,
    min: 18,
    max: 70,
    step: 1,
    minLabel: '18',
    maxLabel: '70',
  },
  {
    id: 'education',
    type: 'single_select',
    kicker: 'ABOUT YOU',
    prompt: 'Highest level of education',
    autoAdvance: true,
    options: [
      { value: 'highschool', label: 'High School' },
      { value: 'associates', label: "Associate's" },
      { value: 'bachelors', label: "Bachelor's" },
      { value: 'masters', label: "Master's" },
      { value: 'doctorate', label: 'Doctorate' },
      { value: 'trade', label: 'Trade / Vocational' },
    ],
  },
  {
    id: 'currentCity',
    type: 'free_text',
    kicker: 'ABOUT YOU',
    prompt: 'Where do you live now?',
    subtext: 'e.g. Springfield, MO',
  },
  {
    id: 'motivationToMove',
    type: 'single_select',
    kicker: 'ABOUT YOU',
    prompt: 'What is your biggest reason to move?',
    autoAdvance: true,
    options: [
      { value: 'career', label: 'Career — better job market or opportunities' },
      { value: 'lifestyle', label: 'Lifestyle — climate, pace, scene' },
      { value: 'adventure', label: 'Adventure — exploring something new' },
      { value: 'family', label: 'Family — closer to or building one' },
      { value: 'cost', label: 'Cost — my money goes further elsewhere' },
    ],
  },
  {
    id: 'paceOfLife',
    type: 'single_select',
    kicker: 'ABOUT YOU',
    prompt: 'What pace of life fits you?',
    autoAdvance: true,
    options: [
      { value: 'fast', label: 'Fast — always something going on' },
      { value: 'moderate', label: 'Moderate — busy but breathing room' },
      { value: 'slow', label: 'Slow — peace, space, unhurried' },
    ],
  },
  {
    id: 'riskTolerance',
    type: 'slider',
    kicker: 'ABOUT YOU',
    prompt: 'How comfortable are you with uncertainty?',
    subtext: 'This calibrates bold vs. safe city recommendations.',
    min: 0,
    max: 100,
    step: 5,
    minLabel: 'Very cautious',
    maxLabel: 'High risk-taker',
  },
  {
    id: 'communityNeeds',
    type: 'multi_select',
    kicker: 'ABOUT YOU',
    prompt: 'What does your community look like?',
    subtext: 'Pick everything that matters — we weight each one.',
    maxSelect: 4,
    options: [
      { value: 'arts', label: 'Arts & culture' },
      { value: 'outdoors', label: 'Outdoors / nature' },
      { value: 'family-friendly', label: 'Family-friendly' },
      { value: 'diversity', label: 'Diverse & international' },
      { value: 'lgbtq', label: 'LGBTQ+ affirming' },
      { value: 'faith', label: 'Faith community' },
      { value: 'startup', label: 'Entrepreneurial / startup' },
      { value: 'quiet', label: 'Peace and quiet' },
    ],
  },

  // ── LIFESTYLE ─────────────────────────────────────────────────────────────
  {
    id: 'lifestyleTags',
    type: 'multi_select',
    kicker: 'LIFESTYLE',
    prompt: 'What do you do for fun?',
    subtext: 'Pick up to 5 — we weight every city match around what you choose.',
    required: true,
    maxSelect: 5,
    options: buildLifestyleOptions(),
  },

  // ── PRIORITIES ────────────────────────────────────────────────────────────
  {
    id: 'importanceRank',
    type: 'multi_select',
    kicker: 'PRIORITIES',
    prompt: 'Rank what matters most in a city',
    // Selection ORDER = rank: first selected = rank 0 = weight 4.
    // synthesizer.ts uses the array order to derive 4/3/2/1 raw weights.
    // Rule 1 fix: changed from single_select (emits string) to multi_select
    // (emits string[]) so synthesizeProfile receives the correct contract.
    subtext: 'Select all four in order of importance — first pick = highest priority.',
    required: true,
    maxSelect: 4,
    options: [
      { value: 'career', label: 'Career — job market and opportunities' },
      { value: 'cost', label: 'Cost — affordable housing and low expenses' },
      { value: 'lifestyle', label: 'Lifestyle — vibe, scene, things to do' },
      { value: 'safety', label: 'Safety — low crime, stable neighborhoods' },
    ],
  },
  {
    id: 'dealBreakers',
    type: 'multi_select',
    kicker: 'PRIORITIES',
    prompt: 'Hard dealbreakers',
    subtext: 'These remove cities entirely — choose carefully.',
    maxSelect: 10,
    options: buildDealBreakerOptions(),
  },

  // ── GOING GLOBAL ──────────────────────────────────────────────────────────
  {
    id: 'opennessToAbroad',
    type: 'slider',
    kicker: 'GOING GLOBAL',
    prompt: 'How open are you to living outside the US?',
    subtext: 'Slide to 0 to only see US cities.',
    required: true,
    min: 0,
    max: 100,
    step: 5,
    minLabel: 'US only',
    maxLabel: 'Anywhere in the world',
    groupHeader: {
      label: 'GOING GLOBAL',
      subtext: 'Tell us how far you’d go — literally.',
    },
  },
  {
    id: 'citizenship',
    type: 'single_select',
    kicker: 'GOING GLOBAL',
    prompt: 'What is your citizenship?',
    subtext: 'Required for visa pathway recommendations.',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'US', label: 'United States' },
      { value: 'Canada', label: 'Canada' },
      { value: 'UK', label: 'United Kingdom' },
      { value: 'Germany', label: 'Germany' },
      { value: 'France', label: 'France' },
      { value: 'Brazil', label: 'Brazil' },
      { value: 'Mexico', label: 'Mexico' },
      { value: 'India', label: 'India' },
      { value: 'China', label: 'China' },
      { value: 'Australia', label: 'Australia' },
      { value: 'Portugal', label: 'Portugal' },
      { value: 'Other', label: 'Other' },
    ],
  },
  {
    id: 'immigrationStatus',
    type: 'single_select',
    kicker: 'GOING GLOBAL',
    prompt: 'What is your current US immigration status?',
    subtext: 'This shapes which visa pathways are available to you.',
    autoAdvance: true,
    // Hidden for US citizens — auto-derived as "citizen" (D-09)
    showIf: (a) => a["citizenship"] !== "US",
    options: [
      { value: 'permanent_resident', label: 'Permanent Resident (Green Card)' },
      { value: 'work_visa', label: 'Work Visa (H-1B, L-1, O-1…)' },
      { value: 'student_visa', label: 'Student Visa (F-1)' },
      { value: 'tourist_visa', label: 'Tourist / Visitor Visa (B-1/B-2)' },
      { value: 'no_status', label: 'No current US status' },
      { value: 'citizen_other', label: 'Citizen of another country living abroad' },
    ],
  },
  {
    id: 'moveTimeline',
    type: 'single_select',
    kicker: 'GOING GLOBAL',
    prompt: 'When are you thinking of moving?',
    required: true,
    autoAdvance: true,
    options: [
      { value: '6mo', label: 'Within 6 months' },
      { value: '12mo', label: 'Within a year' },
      { value: '2yr+', label: 'In 2+ years' },
      { value: 'exploring', label: 'Just exploring — no timeline' },
    ],
  },

  // ── Phase 11: Personality Gate (MUST precede category modules) ──────────────
  // D-06: Weights inferred from tradeoff scenarios, not explicit sliders/ranking.
  // D-07: Hybrid — tradeoff scenarios anchor weights; trait statements add flavor.
  // D-10: Adaptive — detectPersonalityTension injects a tiebreaker if >=2 "balanced".
  // ORDERING INVARIANT: All personality questions must precede CATEGORY_MODULE_QUESTIONS
  // so module showIf predicates find already-answered keys (trigger-before-injection).
  ...PERSONALITY_QUESTIONS,   // 5 core tradeoff scenarios — weight-bearing (D-06/D-08)
  ...TRAIT_QUESTIONS,         // 4 agree/disagree trait statements — flavor only (D-07)

  // ── Phase 11: Deep-Dive Category Modules (AFTER personality gate) ───────────
  // D-11: Guided-modular — modules shown when personality recommended them OR user
  //       explicitly opted in via moduleSelected_{category}.
  // D-13: required:false throughout — skipped modules fall back to NEUTRAL_DEFAULT
  //       in synthesizeCategoryWeights; scoring never breaks or strands a user.
  // showIf predicates read tradeoff_* keys answered above — ordering invariant holds.
  ...CATEGORY_MODULE_QUESTIONS,  // healthcare, family/schools, climateRisk, demographics, parks, connectivity
];
