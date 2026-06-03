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

import { rankCities, normalizeOpenness } from './index.js';
import type { Profile } from '../types.js';
import { CITIES_DATA } from '../data/cities.js';

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


// ── Phase 4 (04-02): openness normalizer — V3 scale-defensive (D-06) ──
describe('normalizeOpenness (V3 scale-defensive — D-06)', () => {
  it('maps 0 to exactly 0 (zero-openness floor input)', () => {
    expect(normalizeOpenness(0)).toBe(0);
  });

  it('reads a 0-100 slider scale: 100 -> ~1, 80 -> ~0.8', () => {
    expect(normalizeOpenness(100)).toBeGreaterThanOrEqual(0.99);
    expect(Math.abs(normalizeOpenness(80) - 0.8)).toBeLessThanOrEqual(0.01);
  });

  it('reads a 1-5 button scale: 1 -> ~0, 3 -> ~0.5, 5 -> ~1', () => {
    expect(normalizeOpenness(1)).toBeLessThanOrEqual(0.01);
    expect(Math.abs(normalizeOpenness(3) - 0.5)).toBeLessThanOrEqual(0.01);
    expect(normalizeOpenness(5)).toBeGreaterThanOrEqual(0.99);
  });

  it('always returns a value in [0,1] across mixed/garbage inputs', () => {
    [-5, 0, 1, 2, 3, 4, 5, 10, 50, 80, 100, 150].forEach((v) => {
      const r = normalizeOpenness(v);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(1);
    });
  });

  it('is monotonic non-decreasing within the 1-5 scale', () => {
    for (let v = 1; v < 5; v++) {
      expect(normalizeOpenness(v + 1)).toBeGreaterThanOrEqual(normalizeOpenness(v));
    }
  });

  it('is monotonic non-decreasing within the 0-100 scale', () => {
    for (let v = 6; v < 100; v += 10) {
      expect(normalizeOpenness(v + 10)).toBeGreaterThanOrEqual(normalizeOpenness(v));
    }
  });

  it('returns a safe default in [0,1] for NaN/undefined (documented: full openness = 1)', () => {
    expect(normalizeOpenness(NaN)).toBe(1);
    expect(normalizeOpenness(undefined as unknown as number)).toBe(1);
  });
});


// ── Phase 4 (04-02): openness soft multiplier — V3 mechanism (MATCH-02, D-05) ──
// London is the lone intl probe until Plan 04 adds Lisbon/Berlin/Toronto; the full
// 4-city "all present at openness=0" assertion is completed in Plan 04 wave-completion.
describe('rankCities — openness soft multiplier (V3 mechanism — MATCH-02, D-05)', () => {
  const at = (openness: number): Profile => ({ ...londonNonRemoteProfile, opennessToAbroad: openness });
  const london = (openness: number) =>
    rankCities(at(openness)).results.find((r) => r.city.name === 'London, UK');

  it('London is present and scored > 0 at openness=0 (demoted, never stranded — D-01)', () => {
    const l = london(0);
    expect(l).toBeDefined();
    expect(l!.matchScore).toBeGreaterThan(0);
  });

  it('is STRICTLY demoted at openness=0 vs max openness (multiplier actually applied)', () => {
    expect(london(0)!.matchScore).toBeLessThan(london(100)!.matchScore);
  });

  it("London's score is monotonic non-decreasing across openness 0 -> 50 -> 100", () => {
    const s0 = london(0)!.matchScore;
    const s50 = london(50)!.matchScore;
    const s100 = london(100)!.matchScore;
    expect(s50).toBeGreaterThanOrEqual(s0);
    expect(s100).toBeGreaterThanOrEqual(s50);
  });

  it('a US city matchScore is unchanged across openness levels (multiplier is intl-only)', () => {
    const austin0 = rankCities(at(0)).results.find((r) => r.city.name === 'Austin, TX')!;
    const austin100 = rankCities(at(100)).results.find((r) => r.city.name === 'Austin, TX')!;
    expect(austin100.matchScore).toBe(austin0.matchScore);
  });

  it('result set stays CITIES_DATA.length at openness 0 and max (never filters — D-01)', () => {
    expect(rankCities(at(0)).results.length).toBe(CITIES_DATA.length);
    expect(rankCities(at(100)).results.length).toBe(CITIES_DATA.length);
  });

  it('all matchScores stay integer in [0,99] with no NaN at openness=0', () => {
    rankCities(at(0)).results.forEach((r) => {
      expect(Number.isInteger(r.matchScore)).toBe(true);
      expect(r.matchScore).toBeGreaterThanOrEqual(0);
      expect(r.matchScore).toBeLessThanOrEqual(99);
      expect(isNaN(r.matchScore)).toBe(false);
    });
  });
});


// ── Phase 4 (04-04): all four intl cities — V3 full + V4 wave-completion ──────
// Completes the V3 assertion deferred by 04-02: with all four golden-path intl
// cities present, all four must demote-but-never-strand at openness=0 (D-05/D-01).
describe('rankCities — all 4 intl cities (V3 full + V4)', () => {
  const at = (openness) => ({ ...londonNonRemoteProfile, opennessToAbroad: openness });
  const INTL = ['London, UK', 'Lisbon, Portugal', 'Berlin, Germany', 'Toronto, Canada'];
  const find = (out, name) => out.results.find((r) => r.city.name === name);

  it('V4: all four intl cities appear in ranked output alongside US cities', () => {
    const out = rankCities(at(80));
    INTL.forEach((name) => expect(find(out, name)).toBeDefined());
  });

  it('V3 full: at openness=0 all four intl cities are present with matchScore > 0 (never stranded)', () => {
    const out = rankCities(at(0));
    expect(out.results.length).toBe(CITIES_DATA.length);
    INTL.forEach((name) => {
      const city = find(out, name);
      expect(city).toBeDefined();
      expect(city.matchScore).toBeGreaterThan(0);
    });
  });

  it('V3 monotonic: each intl city matchScore is non-decreasing as openness rises 0 -> 50 -> 100', () => {
    INTL.forEach((name) => {
      const s0 = find(rankCities(at(0)), name).matchScore;
      const s50 = find(rankCities(at(50)), name).matchScore;
      const s100 = find(rankCities(at(100)), name).matchScore;
      expect(s50).toBeGreaterThanOrEqual(s0);
      expect(s100).toBeGreaterThanOrEqual(s50);
    });
  });

  it('each intl estSalary sits in a plausible USD band (local-salary x FX)', () => {
    const out = rankCities(at(80));
    INTL.forEach((name) => {
      const city = find(out, name);
      expect(city.estSalary).toBeGreaterThan(30000);
      expect(city.estSalary).toBeLessThan(160000);
    });
  });

  it('no NaN in financial fields; matchScore integer in [0,99] with all four intl cities present', () => {
    const out = rankCities(at(0));
    out.results.forEach((r) => {
      expect(Number.isInteger(r.matchScore)).toBe(true);
      expect(r.matchScore).toBeGreaterThanOrEqual(0);
      expect(r.matchScore).toBeLessThanOrEqual(99);
      [r.estSalary, r.monthlyTakeHome, r.monthlySavings, r.expenses.total].forEach((v) =>
        expect(isNaN(v)).toBe(false)
      );
    });
  });
});
