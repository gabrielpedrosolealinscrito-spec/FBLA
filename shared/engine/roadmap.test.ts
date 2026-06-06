// ROAD-01 / ROAD-02 / ROAD-03 / D-02 / D-05 / D-07 / VISA-04
// RED until shared/engine/roadmap.ts is implemented in Wave 1/2.
// These tests lock every Phase 6 engine behavior before implementation exists.

import { buildRoadmap, acceptEnrichment } from './roadmap.js';
import type { Profile, MatchResult } from '../types.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const profile: Profile = {
  profession: 'Software Engineer',
  hasRemote: false,
  income: 110000,
  savings: 25000,
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
  immigrationStatus: 'citizen',
  opennessToAbroad: 80,
  lifestyleTags: [],
  dealBreakers: [],
  importanceRank: ['cost', 'career', 'lifestyle', 'safety'],
  moveTimeline: '12mo',
};

// Covered pair: US citizen → UK (London). Positive monthly savings.
const topUK: MatchResult = {
  city: {
    name: 'London, UK',
    country: 'UK',
    emoji: '🎡',
    lat: 51.51,
    lng: -0.13,
    costIndex: 165,
    medianRent: 3186,
    medianHome: 740000,
    avgTemp: 52,
    vibe: [],
    walkScore: 85,
    transitScore: 90,
    safetyIndex: 60,
    jobGrowth: 1.8,
    topIndustries: ['Finance', 'Tech'],
    financialModelId: 'uk-2026',
    stateTax: 0,
    summerHighF: 73,
    winterLowF: 35,
    nearMountains: false,
    nearCoast: true,
    hasIntlAirport: true,
    pop: '9.0M metro',
    climate: 'Temperate maritime',
  },
  matchScore: 82,
  scoreFactors: [{ factor: 'career', contribution: 0.4 }],
  estSalary: 95000,
  monthlyTakeHome: 6300,
  expenses: {
    rent: 3186, food: 700, transport: 200, utilities: 150,
    insurance: 100, personal: 200, childcare: 0, pets: 0,
    debtPay: 0, total: 4536,
  },
  monthlySavings: 1400,
};

// Covered pair: US → US (Austin). Positive monthly savings.
const topUS: MatchResult = {
  city: {
    name: 'Austin, TX',
    country: 'US',
    emoji: '🤠',
    lat: 30.27,
    lng: -97.74,
    costIndex: 110,
    medianRent: 1800,
    medianHome: 450000,
    avgTemp: 68,
    vibe: [],
    walkScore: 45,
    transitScore: 35,
    safetyIndex: 55,
    jobGrowth: 3.5,
    topIndustries: ['Tech', 'Healthcare'],
    financialModelId: 'us',
    stateTax: 0,
    summerHighF: 98,
    winterLowF: 38,
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
    pop: '2.3M metro',
    climate: 'Subtropical',
  },
  matchScore: 76,
  scoreFactors: [{ factor: 'cost', contribution: 0.3 }],
  estSalary: 120000,
  monthlyTakeHome: 7800,
  expenses: {
    rent: 1800, food: 600, transport: 300, utilities: 120,
    insurance: 150, personal: 200, childcare: 0, pets: 0,
    debtPay: 0, total: 3170,
  },
  monthlySavings: 2200,
};

// Negative-savings fixture for D-02 honest reframe.
const topNegativeSavings: MatchResult = {
  ...topUK,
  monthlySavings: -500,
};

// Uncovered pair: US → Germany (no authored template). For D-07 fallback.
const topGermany: MatchResult = {
  city: {
    name: 'Berlin, Germany',
    country: 'Germany',
    emoji: '🇩🇪',
    lat: 52.52,
    lng: 13.41,
    costIndex: 115,
    medianRent: 2200,
    medianHome: 520000,
    avgTemp: 50,
    vibe: [],
    walkScore: 85,
    transitScore: 92,
    safetyIndex: 72,
    jobGrowth: 2.1,
    topIndustries: ['Tech', 'Manufacturing'],
    financialModelId: 'us',
    stateTax: 0,
    summerHighF: 77,
    winterLowF: 27,
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
    pop: '3.8M metro',
    climate: 'Continental',
  },
  matchScore: 70,
  scoreFactors: [{ factor: 'lifestyle', contribution: 0.25 }],
  estSalary: 85000,
  monthlyTakeHome: 5500,
  expenses: {
    rent: 2200, food: 550, transport: 180, utilities: 130,
    insurance: 100, personal: 180, childcare: 0, pets: 0,
    debtPay: 0, total: 3340,
  },
  monthlySavings: 900,
};

// Expected section IDs in the required order (ROAD-01)
const EXPECTED_SECTION_IDS = ['timeline', 'financial', 'jobs', 'housing', 'logistics', 'visa'];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('buildRoadmap — covered pair (ROAD-01)', () => {
  it('covered pair: returns 6 sections in canonical order with non-empty steps', () => {
    const roadmap = buildRoadmap(profile, topUK);
    expect(roadmap.cityName).toBe(topUK.city.name);
    expect(roadmap.sections).toHaveLength(6);
    expect(roadmap.sections.map((s) => s.id)).toEqual(EXPECTED_SECTION_IDS);
    // Every section must have at least one step with a non-empty detail
    roadmap.sections.forEach((section) => {
      expect(section.steps.length).toBeGreaterThan(0);
      section.steps.forEach((step) => {
        expect(typeof step.detail).toBe('string');
        expect(step.detail.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('threads numbers: profession appears in jobs section, savings figure in timeline/financial detail', () => {
    const roadmap = buildRoadmap(profile, topUK);
    // Jobs section must reference the profession string (user-facing compiled detail)
    const jobsSection = roadmap.sections.find((s) => s.id === 'jobs');
    expect(jobsSection).toBeDefined();
    const jobsDetailText = jobsSection!.steps.map((s) => s.detail).join(' ');
    expect(jobsDetailText).toContain(profile.profession);
    // Timeline or financial section must reference the formatted savings figure
    const savingsStr = topUK.monthlySavings.toLocaleString();
    const timelineSection = roadmap.sections.find((s) => s.id === 'timeline');
    const financialSection = roadmap.sections.find((s) => s.id === 'financial');
    const financialTimelineText = [
      ...(timelineSection?.steps ?? []),
      ...(financialSection?.steps ?? []),
    ].map((s) => s.detail).join(' ');
    expect(financialTimelineText).toContain(savingsStr);
  });
});

describe('buildRoadmap — fallback (D-07)', () => {
  it('fallback: uncovered pair returns 6 sections without throwing, with non-empty steps', () => {
    // Germany is outside the authored template set → must use GENERIC_TEMPLATE
    let roadmap: ReturnType<typeof buildRoadmap> | undefined;
    expect(() => { roadmap = buildRoadmap(profile, topGermany); }).not.toThrow();
    expect(roadmap).toBeDefined();
    expect(roadmap!.sections).toHaveLength(6);
    expect(roadmap!.sections.map((s) => s.id)).toEqual(EXPECTED_SECTION_IDS);
    roadmap!.sections.forEach((section) => {
      expect(section.steps.length).toBeGreaterThan(0);
      section.steps.forEach((step) => {
        expect(step.detail.trim().length).toBeGreaterThan(0);
      });
    });
  });
});

describe('buildRoadmap — negative savings reframe (D-02)', () => {
  it('negative savings: timeline/financial detail contains deficit reframe, not a faked months countdown', () => {
    const roadmap = buildRoadmap(profile, topNegativeSavings);
    expect(roadmap.sections).toHaveLength(6);
    const timelineSection = roadmap.sections.find((s) => s.id === 'timeline');
    const financialSection = roadmap.sections.find((s) => s.id === 'financial');
    const combinedText = [
      ...(timelineSection?.steps ?? []),
      ...(financialSection?.steps ?? []),
    ].map((s) => s.detail).join(' ');
    // Must acknowledge the deficit honestly
    expect(combinedText).toMatch(/deficit/i);
    // Must NOT contain a fabricated "N months" countdown when savings is negative
    expect(combinedText).not.toMatch(/\d+\s*months/i);
  });
});

describe('buildRoadmap — offline deterministic (ROAD-03)', () => {
  it('offline deterministic: same inputs yield deeply-equal output on two consecutive calls', () => {
    const result1 = buildRoadmap(profile, topUS);
    const result2 = buildRoadmap(profile, topUS);
    expect(result1).toEqual(result2);
  });
});

describe('acceptEnrichment — enrich preserves authored (ROAD-02 / D-05)', () => {
  // Authored steps used as baseline
  const authored = [
    { label: 'Step A', detail: 'Original detail A', sourceUrl: 'https://example.com/a' },
    { label: 'Step B', detail: 'Original detail B' },
  ];

  it('enrich preserves authored: accepts llm array of same length with polished detail, preserving label/sourceUrl', () => {
    const llm = [
      { label: 'Step A', detail: 'Polished detail A', sourceUrl: 'https://example.com/a' },
      { label: 'Step B', detail: 'Polished detail B' },
    ];
    const result = acceptEnrichment(authored, llm);
    expect(result).toHaveLength(2);
    expect(result[0].detail).toBe('Polished detail A');
    expect(result[1].detail).toBe('Polished detail B');
  });

  it('enrich preserves authored: throws when llm array has different length', () => {
    const llmShort = [{ label: 'Step A', detail: 'Polished detail A' }];
    expect(() => acceptEnrichment(authored, llmShort)).toThrow();
  });

  it('enrich preserves authored: throws when llm mutates a step label', () => {
    const llmMutatedLabel = [
      { label: 'MUTATED LABEL', detail: 'Polished detail A', sourceUrl: 'https://example.com/a' },
      { label: 'Step B', detail: 'Polished detail B' },
    ];
    expect(() => acceptEnrichment(authored, llmMutatedLabel)).toThrow();
  });

  it('enrich preserves authored: throws when llm mutates a sourceUrl', () => {
    const llmMutatedUrl = [
      { label: 'Step A', detail: 'Polished detail A', sourceUrl: 'https://MUTATED.com/a' },
      { label: 'Step B', detail: 'Polished detail B' },
    ];
    expect(() => acceptEnrichment(authored, llmMutatedUrl)).toThrow();
  });
});

describe('buildRoadmap — visa UPL boundary (VISA-04)', () => {
  it('visa UPL: visa section contains informational-only disclaimer and licensed attorney reference', () => {
    const roadmap = buildRoadmap(profile, topUK);
    const visaSection = roadmap.sections.find((s) => s.id === 'visa');
    expect(visaSection).toBeDefined();
    const visaText = visaSection!.steps.map((s) => s.detail).join(' ');
    // Must contain UPL disclaimer language
    expect(visaText).toMatch(/informational only|not legal advice/i);
    expect(visaText).toMatch(/licensed attorney/i);
    // Must NOT contain personalized legal-advice phrasing
    expect(visaText).not.toMatch(/you (are|will be) eligible/i);
    expect(visaText).not.toMatch(/we (recommend|advise) you/i);
  });
});
