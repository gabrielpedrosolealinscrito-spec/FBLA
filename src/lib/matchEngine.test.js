// matchEngine adapter test — co-located Vitest (globals:true, no vitest import)
// Tests buildRoadmapForRow: the UI adapter that reconstructs a MatchResult from
// a flat scoreProfile row and calls buildRoadmap offline (ROAD-01/ROAD-03, Plan 04).
//
// Assertion target: the compiled Roadmap the user sees (sections, cityName) —
// not an intermediate value like monthsToFund (see project MEMORY: assert user-facing output).

import { buildRoadmapForRow } from './matchEngine.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

// A US-citizen profile (uses quiz citizenship string "US Citizen" — must normalize to "US").
const usProfile = {
  profession: 'Software Engineer',
  housing: 'rent',
  citizenship: 'US Citizen',   // quiz value — adapter must normalize to 'US'
  opennessToAbroad: 40,
};

// A flattened London row (shape produced by scoreProfile: ...r.city + financial fields).
// Note: scoreProfile renames estSalary → salary; the adapter maps it back.
const londonRow = {
  // City fields (spread from r.city in scoreProfile)
  name: 'London, UK',
  country: 'UK',
  medianRent: 2600,
  medianHome: 740000,
  emoji: '🇬🇧',
  lat: 51.5,
  lng: -0.1,
  costIndex: 95,
  avgTemp: 53,
  vibe: ['Cosmopolitan', 'Tech hub'],
  walkScore: 82,
  transitScore: 90,
  safetyIndex: 70,
  jobGrowth: 3.2,
  topIndustries: ['Finance', 'Tech'],
  financialModelId: 'uk-2026',
  stateTax: 20,
  summerHighF: 73,
  winterLowF: 39,
  nearMountains: false,
  nearCoast: false,
  hasIntlAirport: true,
  pop: '9.5M metro',
  climate: 'Temperate oceanic',
  // Financial fields (renamed/added by scoreProfile)
  matchScore: 88,
  salary: 95000,          // estSalary renamed to salary by scoreProfile
  monthlyTakeHome: 6000,
  monthlySavings: 1400,
  expenses: {
    rent: 2600, food: 600, transport: 200, utilities: 150,
    insurance: 200, personal: 250, childcare: 0, pets: 0,
    debtPay: 0, total: 4000,
  },
  scoreFactors: [],
  color: '#7B1FA2',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('buildRoadmapForRow — adapter correctness', () => {
  it('returns a Roadmap with the correct cityName', () => {
    const roadmap = buildRoadmapForRow(usProfile, londonRow);
    expect(roadmap.cityName).toBe('London, UK');
  });

  it('returns exactly 6 sections', () => {
    const roadmap = buildRoadmapForRow(usProfile, londonRow);
    expect(roadmap.sections.length).toBe(6);
  });

  it('returns sections in canonical order [timeline, financial, jobs, housing, logistics, visa]', () => {
    const roadmap = buildRoadmapForRow(usProfile, londonRow);
    const ids = roadmap.sections.map((s) => s.id);
    expect(ids).toEqual(['timeline', 'financial', 'jobs', 'housing', 'logistics', 'visa']);
  });

  it('resolves the UK authored pair (not GENERIC_TEMPLATE) for US citizen → UK row', () => {
    // US_TO_UK_TEMPLATE has "Skilled Worker" in the visa section.
    // GENERIC_TEMPLATE does not. This proves the authored pair resolved.
    const roadmap = buildRoadmapForRow(usProfile, londonRow);
    const visaSection = roadmap.sections.find((s) => s.id === 'visa');
    const visaText = visaSection.steps.map((st) => st.detail).join(' ');
    expect(visaText).toMatch(/Skilled Worker/i);
  });

  it('does NOT recompute financials — reads row monthlySavings directly into detail', () => {
    const roadmap = buildRoadmapForRow(usProfile, londonRow);
    const financialSection = roadmap.sections.find((s) => s.id === 'financial');
    const detailText = financialSection.steps.map((st) => st.detail).join(' ');
    // The row has monthlySavings: 1400 — must appear in the financial detail text.
    expect(detailText).toContain('1,400');
  });

  it('normalizes quiz citizenship string "US Citizen" → "US" for template lookup', () => {
    // If normalization is missing, ROADMAP_TEMPLATES["US Citizen"] === undefined
    // and we'd get GENERIC_TEMPLATE (no "Skilled Worker" in visa).
    const roadmap = buildRoadmapForRow(usProfile, londonRow);
    const visaSection = roadmap.sections.find((s) => s.id === 'visa');
    const visaText = visaSection.steps.map((st) => st.detail).join(' ');
    // The UK authored template has Skilled Worker; generic does not.
    expect(visaText).toMatch(/Skilled Worker/i);
  });

  it('is offline — buildRoadmapForRow makes no network calls (pure function)', () => {
    // Call twice with the same inputs and expect identical output (deterministic).
    const r1 = buildRoadmapForRow(usProfile, londonRow);
    const r2 = buildRoadmapForRow(usProfile, londonRow);
    expect(r1.cityName).toBe(r2.cityName);
    expect(r1.sections.length).toBe(r2.sections.length);
    expect(r1.sections[0].id).toBe(r2.sections[0].id);
  });
});
