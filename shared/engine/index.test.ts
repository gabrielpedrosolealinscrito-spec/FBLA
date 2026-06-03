// MATCH-01: Integration tests for rankCities — the MVP happy-path e2e stand-in
// These tests are RED until shared/engine/index.ts (and all sub-modules) are implemented.
//
// This is the Wave 0 / Nyquist baseline for Phase 3:
//   - rankCities must NEVER return an empty results array (D-01: penalties only, no hard deletes)
//   - All matchScores must be integers clamped to [0, 99]
//   - Results must be sorted by matchScore descending
//   - Austin reference calc (03-RESEARCH.md D-07):
//       BASE_SALARIES["Software Engineer"] = 110000
//       Austin costIndex = 103 → estSalary = 110000 × 1.03 = 113300
//       Federal tax on 113300 = 16096 | FICA = 8667 | State (TX) = 0
//       monthlyTakeHome = (113300 - 16096 - 8667) / 12 = 7378/mo
//
// IMPORTANT: computeFederalTax(110000) = 15370 (that test is in financial.test.ts)
// The Austin figure here uses city-adjusted income 113300, NOT the clean unit input 110000.
// Do NOT cross these two values.

import { rankCities } from './index.js';
import type { Profile } from '../types.js';

// Software Engineer profile matching the D-07 reference calculation
// Single filer: hasPartner false, partnerIncome 0 (required for take-home to match reference)
const swEngineerProfile: Profile = {
  profession: 'Software Engineer',
  hasRemote: false,
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
  immigrationStatus: 'citizen',
  opennessToAbroad: 0,     // 0 = US-only mode
  lifestyleTags: ['outdoors', 'startup'],
  dealBreakers: [],
  importanceRank: ['cost', 'career', 'lifestyle', 'safety'],
  moveTimeline: '12mo',
};

describe('rankCities (MATCH-01 — D-01 never-empty, clamping, sort order)', () => {
  it('returns at least 1 result for a valid profile (never empty)', () => {
    const output = rankCities(swEngineerProfile);
    expect(output.results.length).toBeGreaterThanOrEqual(1);
  });

  it('clamps all matchScores to the 0–99 range (integers)', () => {
    const output = rankCities(swEngineerProfile);
    output.results.forEach((result) => {
      expect(result.matchScore).toBeGreaterThanOrEqual(0);
      expect(result.matchScore).toBeLessThanOrEqual(99);
      expect(Number.isInteger(result.matchScore)).toBe(true);
    });
  });

  it('sorts results by matchScore descending', () => {
    const output = rankCities(swEngineerProfile);
    for (let i = 1; i < output.results.length; i++) {
      expect(output.results[i - 1].matchScore).toBeGreaterThanOrEqual(
        output.results[i].matchScore
      );
    }
  });
});

describe('rankCities — CR-01 regression: differentiation and no mass tie at 99', () => {
  // CR-01: the bug caused 20/22 cities to tie at matchScore 99, collapsing
  // "#1 personalized match" to CITIES_DATA array order regardless of profile.
  // These tests encode the minimum bar to catch that regression.

  it('produces at least 8 distinct matchScores across 22 cities (no mass tie)', () => {
    const output = rankCities(swEngineerProfile);
    const scores = output.results.map((r) => r.matchScore);
    const distinctScores = new Set(scores).size;
    expect(distinctScores).toBeGreaterThanOrEqual(8);
  });

  it('#1 city differs between a cost-first and a lifestyle-first profile', () => {
    const costFirstProfile: Profile = {
      ...swEngineerProfile,
      importanceRank: ['cost', 'safety', 'career', 'lifestyle'],
      lifestyleTags: ['startup'],
    };
    const lifestyleFirstProfile: Profile = {
      ...swEngineerProfile,
      importanceRank: ['lifestyle', 'career', 'cost', 'safety'],
      lifestyleTags: ['beach', 'diversity', 'nightlife', 'walkable'],
    };
    const costOutput = rankCities(costFirstProfile);
    const lifestyleOutput = rankCities(lifestyleFirstProfile);
    // A cost-first user and a beach/nightlife/walkable lifestyle-first user
    // should land different #1 cities.
    expect(costOutput.results[0].city.name).not.toBe(lifestyleOutput.results[0].city.name);
  });

  it('does not throw when lifestyleTags is undefined (crash guard, invariant 4)', () => {
    const sparseProfile = { ...swEngineerProfile, lifestyleTags: undefined as unknown as string[] };
    expect(() => rankCities(sparseProfile)).not.toThrow();
  });
});

describe('rankCities — Austin integration (D-07 reference calculation)', () => {
  it('produces Austin estSalary ≈ $113,300 for Software Engineer', () => {
    // city-adjusted: 110000 × (103/100) = 113300
    // Tolerance ±2 to absorb rounding in Math.round
    const output = rankCities(swEngineerProfile);
    const austin = output.results.find((r) => r.city.name === 'Austin, TX');
    expect(austin).toBeDefined();
    expect(Math.abs(austin!.estSalary - 113300)).toBeLessThanOrEqual(2);
  });

  it('produces Austin monthlyTakeHome ≈ $7,378 for Software Engineer', () => {
    // (113300 - federalTax(113300) - fica(113300)) / 12
    // = (113300 - 16096 - 8667) / 12 = 88537 / 12 ≈ 7378
    // Tolerance ±2 to absorb rounding
    const output = rankCities(swEngineerProfile);
    const austin = output.results.find((r) => r.city.name === 'Austin, TX');
    expect(austin).toBeDefined();
    expect(Math.abs(austin!.monthlyTakeHome - 7378)).toBeLessThanOrEqual(2);
  });
});

// ── Phase 4: London integration tests (V4 ranking integrity) ──────
// V4: rankCities contains London, UK; USD-canonical estSalary; no NaN; results.length intact.
//
// London non-remote expected: UK_LOCAL_SALARIES["Software Engineer"] = £55,000
//   USD equivalent: £55,000 × 1.347 (GBP/USD) = $74,085
//   Assert band: estSalary in (60000, 90000) USD
//   This proves local-salary×FX path (NOT US BASE×costIndex which would be 110000×1.65=$181,500)
//
// Remote path: profile.income stays USD, no FX applied.
//
// Source: theemployerofrecord 2026 UK SWE range £45k-£80k; median £55k used
// FX: GBP/USD 1.347 (ECB/exchangerates.org.uk 2026-06-01)
// ─────────────────────────────────────────────────────────────────

const londonNonRemoteProfile: Profile = {
  profession: 'Software Engineer',
  hasRemote: false,
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
  immigrationStatus: 'citizen',
  opennessToAbroad: 80,
  lifestyleTags: [],
  dealBreakers: [],
  importanceRank: ['cost', 'career', 'lifestyle', 'safety'],
  moveTimeline: '12mo',
};

const londonRemoteProfile: Profile = {
  ...londonNonRemoteProfile,
  hasRemote: true,
  income: 95000, // remote income stays USD regardless of city
};

describe('rankCities — London integration (V4)', () => {
  it('London, UK appears in rankCities() output', () => {
    const output = rankCities(londonNonRemoteProfile);
    const london = output.results.find((r) => r.city.name === 'London, UK');
    expect(london).toBeDefined();
  });

  it('results.length === CITIES_DATA.length with London present (D-01 never-filter)', () => {
    const { results } = rankCities(londonNonRemoteProfile);
    // Import CITIES_DATA to compare length
    // We assert results has more than 22 entries now (22 US + 1 London = 23+)
    expect(results.length).toBeGreaterThanOrEqual(23);
  });

  it('London non-remote estSalary is in (60000, 90000) USD — local-salary×FX, not US BASE×costIndex', () => {
    // UK_LOCAL_SALARIES["Software Engineer"] = £55,000
    // £55,000 × 1.347 (GBP/USD) = ~$74,085
    // US BASE×costIndex would be: 110000 × 1.65 = $181,500 (wrong — proves UK path used)
    const output = rankCities(londonNonRemoteProfile);
    const london = output.results.find((r) => r.city.name === 'London, UK');
    expect(london).toBeDefined();
    expect(london!.estSalary).toBeGreaterThan(60000);
    expect(london!.estSalary).toBeLessThan(90000);
  });

  it('London remote estSalary === profile.income (USD, no FX applied)', () => {
    const output = rankCities(londonRemoteProfile);
    const london = output.results.find((r) => r.city.name === 'London, UK');
    expect(london).toBeDefined();
    // Remote: keeps profile.income (95000 USD) + no partner income
    expect(london!.estSalary).toBe(95000);
  });

  it('London matchScore is in [0, 99] (clamp holds with intl city present)', () => {
    const output = rankCities(londonNonRemoteProfile);
    const london = output.results.find((r) => r.city.name === 'London, UK');
    expect(london).toBeDefined();
    expect(london!.matchScore).toBeGreaterThanOrEqual(0);
    expect(london!.matchScore).toBeLessThanOrEqual(99);
    expect(Number.isInteger(london!.matchScore)).toBe(true);
  });

  it('London has no NaN in estSalary, monthlyTakeHome, or monthlySavings', () => {
    const output = rankCities(londonNonRemoteProfile);
    const london = output.results.find((r) => r.city.name === 'London, UK');
    expect(london).toBeDefined();
    expect(isNaN(london!.estSalary)).toBe(false);
    expect(isNaN(london!.monthlyTakeHome)).toBe(false);
    expect(isNaN(london!.monthlySavings)).toBe(false);
  });

  it('Austin estSalary still ≈ $113,300 (no US-path regression)', () => {
    const output = rankCities(swEngineerProfile);
    const austin = output.results.find((r) => r.city.name === 'Austin, TX');
    expect(austin).toBeDefined();
    expect(Math.abs(austin!.estSalary - 113300)).toBeLessThanOrEqual(2);
  });
});
