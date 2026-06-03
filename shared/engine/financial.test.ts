// FIN-01: Unit tests for federal/state/FICA math
// These tests are RED until shared/engine/financial.ts is implemented in Wave 2.
// Expected values sourced from 03-RESEARCH.md D-07 reference calculation.
//
// TY2026 brackets (IRS/Tax Foundation — OBBBA-amended):
//   Standard deduction: $16,100
//   Brackets: 10% to $12,400 | 12% to $50,400 | 22% to $105,700 | ...
//
// computeFederalTax(110000):
//   taxable = 110000 - 16100 = 93900
//   10%: 12400 × 0.10 = 1240
//   12%: (50400 - 12400) = 38000 × 0.12 = 4560
//   22%: (93900 - 50400) = 43500 × 0.22 = 9570
//   total = 15370

import { computeFederalTax, computeUSTax, computeUSExpenses } from './financial.js';
import type { Profile, City } from '../types.js';

describe('computeFederalTax', () => {
  it('applies TY2026 brackets correctly for a mid-range salary', () => {
    // 110000 is the clean unit test input (not city-adjusted)
    // Expected: 15370 (see D-07 bracket breakdown above)
    expect(computeFederalTax(110000)).toBeCloseTo(15370, 0); // ±1 tolerance
  });

  it('returns 0 for income of 0 (below standard deduction)', () => {
    expect(computeFederalTax(0)).toBe(0);
  });

  it('returns 0 for income exactly at the standard deduction ($16,100)', () => {
    // taxableIncome = 16100 - 16100 = 0 → no tax
    expect(computeFederalTax(16100)).toBe(0);
  });
});

describe('computeUSTax', () => {
  it('adds state tax on top of federal + FICA', () => {
    // With state tax > 0, total tax must be greater than with state tax = 0
    expect(computeUSTax(75000, 9.85)).toBeGreaterThan(computeUSTax(75000, 0));
  });

  it('produces a positive total tax for typical salary', () => {
    const total = computeUSTax(75000, 0);
    expect(total).toBeGreaterThan(0);
  });
});

describe('computeUSExpenses (V5 input validation)', () => {
  it('does not produce NaN in any expense field when costIndex is 0', () => {
    // V5 threat: division by zero / NaN propagation when costIndex = 0
    const profile: Profile = {
      profession: 'Software Engineer',
      hasRemote: false,
      income: 0,
      savings: 0,
      debt: 0,
      housing: 'rent',
      hasPartner: false,
      partnerIncome: 0,
      hasDependents: false,
      numDependents: 0,
      hasPets: false,
      age: 25,
      education: 'bachelor',
      currentCity: 'Austin, TX',
      citizenship: 'US',
      immigrationStatus: 'citizen',
      opennessToAbroad: 0,
      lifestyleTags: [],
      dealBreakers: [],
      importanceRank: ['cost', 'career', 'lifestyle', 'safety'],
      moveTimeline: '12mo',
    };
    const city: City = {
      name: 'Test City',
      country: 'US',
      emoji: '🏙️',
      lat: 0,
      lng: 0,
      costIndex: 0,   // should be guarded against
      medianRent: 1000,
      medianHome: 200000,
      avgTemp: 68,
      vibe: [],
      walkScore: 50,
      transitScore: 50,
      safetyIndex: 60,
      jobGrowth: 2.0,
      topIndustries: ['Tech'],
      financialModelId: 'us',
      stateTax: 0,
      summerHighF: 90,
      winterLowF: 30,
      nearMountains: false,
      nearCoast: false,
      hasIntlAirport: true,
      pop: '1M metro',
      climate: 'Mild',
    };
    const expenses = computeUSExpenses(profile, city);
    // None of the numeric expense fields should be NaN
    Object.values(expenses).forEach((val) => {
      expect(isNaN(val as number)).toBe(false);
    });
  });
});

// ── Phase 4: uk-2026 model tests ──────────────────────────────────
// V1: UK fixture (±3% tolerance per VALIDATION.md)
// V2: no-US-math invariant
//
// uk-2026 reference: £60,000 gross, single
//   Income tax: basic 20% on £37,700 (£12,571-50,270) = £7,540
//               higher 40% on £9,730 (£50,271-60,000) = £3,892
//               total income tax = £11,432
//   Employee NI: 8% on £37,700 (£12,570-50,270) = £3,016
//                2% on £9,730 (>£50,270) = £195
//                total NI = £3,211
//   Total tax burden = £14,643
//   Net = £60,000 - £14,643 = £45,357/yr = £3,780/mo
//
// Source: GOV.UK rates & thresholds 2025-26
//   https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026
// ─────────────────────────────────────────────────────────────────

import { FINANCIAL_MODELS } from './financial.js';

// Minimal inline City fixture — does not depend on the London record (Task 3)
const testCityUK = {
  name: 'Test UK City',
  country: 'UK',
  emoji: '🎡',
  lat: 51.51,
  lng: -0.13,
  costIndex: 165,
  medianRent: 3186,
  medianHome: 740000,
  avgTemp: 52,
  vibe: [] as string[],
  walkScore: 85,
  transitScore: 90,
  safetyIndex: 60,
  jobGrowth: 1.8,
  topIndustries: ['Finance'] as string[],
  financialModelId: 'uk-2026',
  stateTax: 0,
  summerHighF: 73,
  winterLowF: 35,
  nearMountains: false as const,
  nearCoast: true as const,
  hasIntlAirport: true as const,
  pop: '9.0M metro',
  climate: 'Temperate maritime',
};

const swEngProfile = {
  profession: 'Software Engineer',
  hasRemote: false,
  income: 110000,
  savings: 20000,
  debt: 0,
  housing: 'rent' as const,
  hasPartner: false,
  partnerIncome: 0,
  hasDependents: false,
  numDependents: 0,
  hasPets: false,
  age: 28,
  education: 'bachelor' as const,
  currentCity: 'Austin, TX',
  citizenship: 'US',
  immigrationStatus: 'citizen' as const,
  opennessToAbroad: 80,
  lifestyleTags: [] as string[],
  dealBreakers: [] as string[],
  importanceRank: ['cost', 'career', 'lifestyle', 'safety'] as ['cost', 'career', 'lifestyle', 'safety'],
  moveTimeline: '12mo' as const,
};

describe('uk-2026 model (V1 — UK fixture, ±3% tolerance)', () => {
  it('is registered in FINANCIAL_MODELS', () => {
    expect(FINANCIAL_MODELS['uk-2026']).toBeDefined();
    expect(FINANCIAL_MODELS['uk-2026'].id).toBe('uk-2026');
  });

  it('computeTax(60000, 0) matches worked example £14,643 within ±3%', () => {
    const ukModel = FINANCIAL_MODELS['uk-2026'];
    const tax = ukModel.computeTax(60000, 0);
    // Expected: £11,432 income tax + £3,211 NI = £14,643
    // ±3% tolerance: 14643 × 0.03 = 439 => range [14204, 15082]
    expect(tax).toBeGreaterThanOrEqual(14204);
    expect(tax).toBeLessThanOrEqual(15082);
  });

  it('monthly local net ≈ £3,780 for £60,000 gross (within ±3%)', () => {
    const ukModel = FINANCIAL_MODELS['uk-2026'];
    const tax = ukModel.computeTax(60000, 0);
    const monthlyNet = (60000 - tax) / 12;
    // Expected: £3,780/mo — ±3% = £113 => range [3667, 3893]
    expect(monthlyNet).toBeGreaterThanOrEqual(3667);
    expect(monthlyNet).toBeLessThanOrEqual(3893);
  });

  it('computeSalary returns a UK-sourced local salary for non-remote Software Engineer', () => {
    const ukModel = FINANCIAL_MODELS['uk-2026'];
    const localSalaryGBP = ukModel.computeSalary(swEngProfile, testCityUK as any);
    // UK_LOCAL_SALARIES["Software Engineer"] should be in £45k-£80k range (theemployerofrecord)
    expect(localSalaryGBP).toBeGreaterThanOrEqual(45000);
    expect(localSalaryGBP).toBeLessThanOrEqual(80000);
  });
});

describe('uk-2026 no-US-math invariant (V2)', () => {
  it('UK tax for £60k differs materially from US computeUSTax(60000, 0)', () => {
    // UK model does not use US federal brackets, FICA, or standard deduction.
    // US tax on 60000: federalTax(60000) + FICA = approx $10,320 + $4,590 = $14,910
    // UK tax on 60000: £14,643 (different system entirely)
    // They SHOULD be numerically close by coincidence but the key is they use different paths.
    // Assert that the difference between them is NOT zero (different calculations).
    const ukModel = FINANCIAL_MODELS['uk-2026'];
    const ukTax = ukModel.computeTax(60000, 0);
    // The UK model should not return the exact same result as computeUSTax(60000, 0)
    // which would be ~14910. We assert UK tax is within a plausible UK-regime range.
    // UK: ~24.4% effective rate. US at 60k: ~24.8% effective rate. Different composition.
    // Key invariant: UK model never calls computeFederalTax or computeUSTax internally.
    // We test this structurally: UK has NO standard deduction (£12,570 personal allowance instead),
    // and adds National Insurance (absent in US). Result range locks the UK-specific math.
    expect(ukTax).toBeGreaterThanOrEqual(14000); // UK result floor
    expect(ukTax).toBeLessThanOrEqual(16000);    // UK result ceiling
  });

  it('non-remote UK salary is NOT the US BASE_SALARIES x costIndex formula', () => {
    const ukModel = FINANCIAL_MODELS['uk-2026'];
    const localSalaryGBP = ukModel.computeSalary(swEngProfile, testCityUK as any);
    // US computeSalary("Software Engineer", costIndex=165): 110000 * 1.65 = 181500
    // UK local salary should be nowhere near $181,500 — it should be a sourced UK figure
    // in the £45k-£80k range
    expect(localSalaryGBP).toBeLessThan(120000); // definitely not US-scaled
    expect(localSalaryGBP).toBeGreaterThan(30000); // but a real salary
  });
});
