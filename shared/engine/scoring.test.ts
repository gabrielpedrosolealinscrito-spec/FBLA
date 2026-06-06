// MATCH-03: Unit tests for scoring engine — contribution-sum invariant (Pitfall 1)
//
// Two invariants tested:
//   1. Pre-clamp: BASE_SCORE + sum(scoreFactors.contributions) === rawScore (within 0.01)
//   2. Post-clamp (CR-01 regression guard): rawScore is in [0,99] so the pre-clamp
//      invariant equals the user-facing displayed score.
//
// CR-01 fix verification: with normalized personal weights [0,1], rawScore must be
// comfortably below 99 in normal operation, so clamp is never active and the
// per-factor score contributions reconcile with the displayed match badge exactly.

import { computeRawScore, BASE_SCORE } from './scoring.js';
import type { Profile, City } from '../types.js';

// Shared test fixture — single filer, no partner income, city-adjusted scoring
const testProfile: Profile = {
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
  opennessToAbroad: 0,
  lifestyleTags: ['outdoors', 'startup'],
  dealBreakers: [],
  importanceRank: ['cost', 'career', 'lifestyle', 'safety'],
  moveTimeline: '12mo',
};

const testCity: City = {
  name: 'Austin, TX',
  country: 'US',
  emoji: '🎸',
  lat: 30.27,
  lng: -97.74,
  costIndex: 103,
  medianRent: 1450,
  medianHome: 425000,
  avgTemp: 68,
  vibe: ['Creative', 'Tech', 'Outdoorsy', 'Nightlife'],
  walkScore: 42,
  transitScore: 35,
  safetyIndex: 58,
  jobGrowth: 2.5,
  topIndustries: ['Tech', 'Government', 'Healthcare', 'Music'],
  financialModelId: 'us',
  stateTax: 0,
  summerHighF: 97,
  winterLowF: 42,
  nearMountains: false,
  nearCoast: false,
  hasIntlAirport: true,
  pop: '2.3M metro',
  climate: 'Hot summers, mild winters',
};

describe('computeRawScore — contribution-sum invariant (MATCH-03)', () => {
  it('scoreFactors contributions sum with BASE_SCORE to equal rawScore within 0.01', () => {
    const result = computeRawScore(testProfile, testCity);
    const contributionSum = result.scoreFactors.reduce(
      (sum, f) => sum + f.contribution,
      0
    );
    // The invariant: BASE_SCORE + sum(contributions) ≈ rawScore
    expect(Math.abs((BASE_SCORE + contributionSum) - result.rawScore)).toBeLessThan(0.01);
  });

  it('returns scoreFactors array with at least one entry per factor (cost, career, lifestyle, safety)', () => {
    const result = computeRawScore(testProfile, testCity);
    const factorNames = result.scoreFactors.map((f) => f.factor.toLowerCase());
    expect(factorNames.some((n) => n.includes('cost'))).toBe(true);
    expect(factorNames.some((n) => n.includes('career'))).toBe(true);
    expect(factorNames.some((n) => n.includes('lifestyle') || n.includes('life'))).toBe(true);
    expect(factorNames.some((n) => n.includes('safety'))).toBe(true);
  });
});

describe('computeRawScore — CR-01 regression: score must be in-band so clamp is inert', () => {
  it('rawScore is in [0, 99] so the displayed matchScore equals the pre-clamp score', () => {
    const result = computeRawScore(testProfile, testCity);
    // CR-01: rawScore must be in [0,99] — if clamp fires, scoreFactors bars diverge from badge.
    expect(result.rawScore).toBeGreaterThanOrEqual(0);
    expect(result.rawScore).toBeLessThanOrEqual(99);
  });

  it('scoreFactors contributions sum to (displayed matchScore - BASE_SCORE) within 0.5', () => {
    const result = computeRawScore(testProfile, testCity);
    // Since rawScore ≤ 99, matchScore = Math.round(rawScore) = Math.round(rawScore).
    // The displayed matchScore is clamp(Math.round(rawScore), 0, 99).
    // With rawScore in-band, clamp is a no-op, so displayed = Math.round(rawScore).
    // scoreFactors must reconcile with the displayed value (MATCH-03 honesty contract).
    const contributionSum = result.scoreFactors.reduce((s, f) => s + f.contribution, 0);
    const displayedMatchScore = Math.min(99, Math.max(0, Math.round(result.rawScore)));
    expect(Math.abs(contributionSum - (displayedMatchScore - BASE_SCORE))).toBeLessThanOrEqual(0.5);
  });

  it('does not throw when lifestyleTags is undefined (crash guard, invariant 4)', () => {
    // Regression: scoring.ts line 80 used to access profile.lifestyleTags without a null guard.
    const sparseProfile = { ...testProfile, lifestyleTags: undefined as unknown as string[] };
    expect(() => computeRawScore(sparseProfile, testCity)).not.toThrow();
  });
});

// ── Phase 12 Wave-0 Tests ─────────────────────────────────────────────────────────
// Fixtures: extended city with all Phase 12 fields, city with no new fields, and
// profile variants for weight-gating tests (D-02, D-07, D-08, D-03/D-09).

// A fully-cited US city carrying all Phase 12 optional fields.
// Values chosen to produce a clear, non-edge contribution for each category.
const testCityWithAllFields: City = {
  ...testCity,
  // Healthcare (Numbeo): Pittsburgh-like value → (68.0-60)/15 = 0.533
  healthcareIndex: 68.0,
  // Schools (NAEP G8 %): CO-like value → (35-22)/16 = 0.8125
  schoolProficiencyPct: 35,
  // Childcare (CCAoA infant): TX-like value → (24000-11349)/14000 = 0.904
  childcareInfantAnnual: 11349,
  // Connectivity (log-scale): ~10.8M enplanements → log≈16.2 → (16.2-14.5)/3.5 = 0.486
  airportEnplanements: 10833443,
  // ParkScore: Minneapolis-like → (83.4-40)/50 = 0.868
  parkScore: 83.4,
};

// An international city with NO Phase 12 new-category fields (like Berlin/Toronto/London/Lisbon).
// This is the genuine-exclusion fixture (D-07).
const testCityNoNewData: City = {
  name: 'Berlin, Germany',
  country: 'Germany',
  emoji: '🐻',
  lat: 52.52,
  lng: 13.40,
  costIndex: 92,
  medianRent: 1434,
  medianHome: 571000,
  avgTemp: 50,
  vibe: ['Creative', 'Nightlife', 'Diverse', 'Startup'],
  walkScore: 75,
  transitScore: 85,
  safetyIndex: 65,
  jobGrowth: 2.5,
  topIndustries: ['Tech/Startups', 'Manufacturing', 'Media', 'Science'],
  financialModelId: 'de-2026',
  stateTax: 0,
  summerHighF: 74,
  winterLowF: 28,
  nearMountains: false,
  nearCoast: false,
  hasIntlAirport: true,
  pop: '3.7M city',
  climate: 'Temperate continental',
  // NO healthcareIndex, schoolProficiencyPct, childcareInfantAnnual, airportEnplanements, parkScore
};

// Profile with max categoryWeights (family user, all categories at WEIGHT_MAX_PREF=1.8)
const maxCategoryProfile: Profile = {
  ...testProfile,
  weights: { cost: 4, career: 4, lifestyle: 4, safety: 4 },
  categoryWeights: {
    healthcare:   1.8,
    schools:      1.8,
    childcare:    1.8,
    connectivity: 1.8,
    parks:        1.8,
  },
  lifestyleTags: ['outdoors', 'startup', 'nightlife', 'arts', 'walkable'],
};

// Profile with no kids — no categoryWeights at all (pre-Phase-11 backward-compat profile)
const noKidsProfile: Profile = { ...testProfile };

// Profile with empty categoryWeights (explicitly no preference for new categories)
const emptyWeightsProfile: Profile = { ...testProfile, categoryWeights: {} };

describe('computeRawScore — Phase 12: honest-contribution invariant after new factors', () => {
  it('BASE_SCORE + Σ(scoreFactors.contribution) === rawScore after all 9 factors', () => {
    const result = computeRawScore(maxCategoryProfile, testCityWithAllFields);
    const sum = result.scoreFactors.reduce((s, f) => s + f.contribution, 0);
    expect(Math.abs((BASE_SCORE + sum) - result.rawScore)).toBeLessThan(0.01);
  });

  it('scoreFactors has exactly 9 entries for a fully-cited city with max categoryWeights', () => {
    const result = computeRawScore(maxCategoryProfile, testCityWithAllFields);
    // 4 existing (cost, career, lifestyle, safety) + 5 new (healthcare, schools, childcare, connectivity, parks)
    expect(result.scoreFactors.length).toBe(9);
  });

  it('rawScore stays in [0, 99] with max categoryWeights on a fully-cited city (CR-01 after Phase 12)', () => {
    const result = computeRawScore(maxCategoryProfile, testCityWithAllFields);
    expect(result.rawScore).toBeGreaterThanOrEqual(0);
    expect(result.rawScore).toBeLessThanOrEqual(99);
  });
});

describe('computeRawScore — Phase 12: D-02 weight-gating (schools/childcare/healthcare)', () => {
  it('schools contribution === 0 when categoryWeights absent (no-kids — D-02)', () => {
    // Two-tier: absent schools → NEUTRAL_DEFAULT=0.5 → baselined=0 → personal=0 → contrib=0
    const result = computeRawScore(noKidsProfile, testCityWithAllFields);
    const schoolsFactor = result.scoreFactors.find(f => f.factor.toLowerCase().includes('school'));
    expect(schoolsFactor?.contribution ?? 0).toBe(0);
  });

  it('schools contribution === 0 when categoryWeights is empty object (no-kids — D-02)', () => {
    const result = computeRawScore(emptyWeightsProfile, testCityWithAllFields);
    const schoolsFactor = result.scoreFactors.find(f => f.factor.toLowerCase().includes('school'));
    expect(schoolsFactor?.contribution ?? 0).toBe(0);
  });

  it('childcare contribution === 0 when categoryWeights absent (no-kids — D-02)', () => {
    const result = computeRawScore(noKidsProfile, testCityWithAllFields);
    const childcareFactor = result.scoreFactors.find(f => f.factor.toLowerCase().includes('childcare'));
    expect(childcareFactor?.contribution ?? 0).toBe(0);
  });

  it('schools contribution > 0 and > no-kids when categoryWeights.schools = 1.8 (family user)', () => {
    const familyProfile: Profile = { ...testProfile, categoryWeights: { schools: 1.8, childcare: 1.8 } };
    const familyResult = computeRawScore(familyProfile, testCityWithAllFields);
    const nokidsResult = computeRawScore(noKidsProfile, testCityWithAllFields);
    const familySchools = familyResult.scoreFactors.find(f => f.factor.toLowerCase().includes('school'))?.contribution ?? 0;
    const nokidsSchools = nokidsResult.scoreFactors.find(f => f.factor.toLowerCase().includes('school'))?.contribution ?? 0;
    expect(nokidsSchools).toBe(0);            // strict D-02: no-kids = exactly zero
    expect(familySchools).toBeGreaterThan(0); // family user gets real contribution
  });

  it('healthcare contribution > 0 even when categoryWeights absent (practical tier floor)', () => {
    // Practical: NEUTRAL_DEFAULT=0.5 → personal = 0.5/1.5 = 0.333 → still contributes
    const result = computeRawScore(noKidsProfile, testCityWithAllFields);
    const healthcareFactor = result.scoreFactors.find(f => f.factor.toLowerCase().includes('health'));
    expect(healthcareFactor?.contribution ?? 0).toBeGreaterThan(0);
  });

  it('categoryPersonalWeight for healthcare with no weights returns > 0 (practical tier)', () => {
    // Indirect: verified via healthcare contribution > 0 for noKidsProfile above.
    // Direct confirmation: healthcare is practical, NEUTRAL_DEFAULT=0.5, personal = 0.5/1.5 > 0.
    const result1 = computeRawScore(noKidsProfile, testCityWithAllFields);
    const result2 = computeRawScore(emptyWeightsProfile, testCityWithAllFields);
    const hc1 = result1.scoreFactors.find(f => f.factor === 'Healthcare')?.contribution ?? 0;
    const hc2 = result2.scoreFactors.find(f => f.factor === 'Healthcare')?.contribution ?? 0;
    expect(hc1).toBeGreaterThan(0);
    expect(hc2).toBeGreaterThan(0);
  });
});

describe('computeRawScore — Phase 12: D-07 proxy and neutral exclusion', () => {
  it('parks contribution > 0 when parkScore absent but nearMountains=true (proxy)', () => {
    const cityNoParkScoreMountain: City = { ...testCity, nearMountains: true, nearCoast: false };
    const parksProfile: Profile = { ...testProfile, categoryWeights: { parks: 1.8 } };
    const result = computeRawScore(parksProfile, cityNoParkScoreMountain);
    const parksFactor = result.scoreFactors.find(f => f.factor.toLowerCase().includes('park'));
    // Proxy: 0.4 + 0.25 (nearMountains) = 0.65 → round(1.0×1.0×0.65×3) = round(1.95) = 2
    expect(parksFactor?.contribution ?? 0).toBeGreaterThan(0);
    expect(parksFactor?.dataLevel).toBe('proxy');
  });

  it('parks contribution > 0 when parkScore absent and no proxy signals (baseline floor)', () => {
    // Baseline proxy = 0.4 — never phantom-zero (D-07)
    const cityNoParkScore: City = { ...testCity, nearMountains: false, nearCoast: false, vibe: ['Creative', 'Tech'] };
    const parksProfile: Profile = { ...testProfile, categoryWeights: { parks: 1.8 } };
    const result = computeRawScore(parksProfile, cityNoParkScore);
    const parksFactor = result.scoreFactors.find(f => f.factor.toLowerCase().includes('park'));
    // Baseline: 0.4 → round(1.0×1.0×0.4×3) = round(1.2) = 1
    expect(parksFactor?.contribution ?? 0).toBeGreaterThan(0);
    expect(parksFactor?.dataLevel).toBe('proxy');
  });

  it('parks contribution > 0 when parkScore is present (city data)', () => {
    const parksProfile: Profile = { ...testProfile, categoryWeights: { parks: 1.8 } };
    const result = computeRawScore(parksProfile, testCityWithAllFields);
    const parksFactor = result.scoreFactors.find(f => f.factor.toLowerCase().includes('park'));
    expect(parksFactor?.contribution ?? 0).toBeGreaterThan(0);
    expect(parksFactor?.dataLevel).toBe('city');
  });

  it('D-07 genuine neutral exclusion: healthcare/schools/childcare/connectivity all contribution=0, dataLevel=none for no-data city', () => {
    // Berlin/Toronto/etc. have NO healthcareIndex/schoolProficiencyPct/childcareInfantAnnual/airportEnplanements
    // Even with max weights, contribution MUST be exactly 0 (null sentinel → genuine exclusion)
    const result = computeRawScore(maxCategoryProfile, testCityNoNewData);
    const healthcare = result.scoreFactors.find(f => f.factor === 'Healthcare');
    const schools = result.scoreFactors.find(f => f.factor.includes('Schools'));
    const childcare = result.scoreFactors.find(f => f.factor.includes('Childcare'));
    const connectivity = result.scoreFactors.find(f => f.factor === 'Air Connectivity');

    expect(healthcare?.contribution).toBe(0);
    expect(healthcare?.dataLevel).toBe('none');
    expect(schools?.contribution).toBe(0);
    expect(schools?.dataLevel).toBe('none');
    expect(childcare?.contribution).toBe(0);
    expect(childcare?.dataLevel).toBe('none');
    expect(connectivity?.contribution).toBe(0);
    expect(connectivity?.dataLevel).toBe('none');
  });

  it('D-07 exclusion: rawScore = BASE_SCORE + only applicable factors for no-data city', () => {
    // The excluded categories add exactly 0 to rawScore — not a nonzero midpoint
    const result = computeRawScore(maxCategoryProfile, testCityNoNewData);
    const sum = result.scoreFactors.reduce((s, f) => s + f.contribution, 0);
    expect(Math.abs((BASE_SCORE + sum) - result.rawScore)).toBeLessThan(0.01);
    // Excluded 0-markers add nothing — their contribution IS 0 in the sum
    const excludedContribs = ['Healthcare', 'Schools (state avg)', 'Childcare (state avg)', 'Air Connectivity']
      .map(name => result.scoreFactors.find(f => f.factor === name)?.contribution ?? -1);
    excludedContribs.forEach(c => expect(c).toBe(0));
  });

  it('D-07 parks still scores via proxy for a no-data (international) city', () => {
    // Berlin has nearMountains=false, nearCoast=false, vibe has no 'outdoorsy'
    // → proxy baseline 0.4 → round(1.0×1.0×0.4×3)=1 with parks=1.8 weight
    const parksProfile: Profile = { ...testProfile, categoryWeights: { parks: 1.8 } };
    const result = computeRawScore(parksProfile, testCityNoNewData);
    const parksFactor = result.scoreFactors.find(f => f.factor.toLowerCase().includes('park'));
    expect(parksFactor?.contribution ?? 0).toBeGreaterThan(0);
    expect(parksFactor?.dataLevel).toBe('proxy');
  });
});

describe('computeRawScore — Phase 12: D-08 state-average label', () => {
  it('schools entry carries dataLevel=state and factor string includes "state avg"', () => {
    const familyProfile: Profile = { ...testProfile, categoryWeights: { schools: 1.8 } };
    const result = computeRawScore(familyProfile, testCityWithAllFields);
    const schoolsFactor = result.scoreFactors.find(f => f.factor.toLowerCase().includes('school'));
    expect(schoolsFactor?.dataLevel).toBe('state');
    expect(schoolsFactor?.factor.toLowerCase()).toContain('state avg');
  });

  it('childcare entry carries dataLevel=state and factor string includes "state avg"', () => {
    const familyProfile: Profile = { ...testProfile, categoryWeights: { childcare: 1.8 } };
    const result = computeRawScore(familyProfile, testCityWithAllFields);
    const childcareFactor = result.scoreFactors.find(f => f.factor.toLowerCase().includes('childcare'));
    expect(childcareFactor?.dataLevel).toBe('state');
    expect(childcareFactor?.factor.toLowerCase()).toContain('state avg');
  });
});

describe('computeRawScore — Phase 12: D-03/D-09 display-only guard', () => {
  it('no scoreFactors entry references demographics or FEMA fields', () => {
    const result = computeRawScore(maxCategoryProfile, testCityWithAllFields);
    // None of these should appear in any factor name — D-03/D-09 compliance
    const forbidden = /foreign|median\s*age|married|fema|disaster/i;
    result.scoreFactors.forEach(f => {
      expect(forbidden.test(f.factor)).toBe(false);
    });
  });
});

describe('computeRawScore — Phase 12: crash guards', () => {
  it('does not throw when categoryWeights is absent (pre-Phase-11 profile)', () => {
    // Should gracefully degrade: preference categories → NEUTRAL_DEFAULT → contribution 0
    expect(() => computeRawScore(noKidsProfile, testCityWithAllFields)).not.toThrow();
  });

  it('does not throw when individual city fields are absent (neutral exclusion path)', () => {
    // testCity has no Phase 12 fields — should produce null sentinels, push markers, no crash
    expect(() => computeRawScore(testProfile, testCity)).not.toThrow();
  });

  it('does not throw when categoryWeights contains NaN (malformed quiz output)', () => {
    const malformedProfile: Profile = {
      ...testProfile,
      categoryWeights: { schools: NaN, healthcare: 1.2 },
    };
    // sanitizeProfile in index.ts handles NaN; direct computeRawScore also must not crash
    // (categoryPersonalWeight uses ?? NEUTRAL_DEFAULT and Math.max(0, raw))
    expect(() => computeRawScore(malformedProfile, testCityWithAllFields)).not.toThrow();
  });
});
