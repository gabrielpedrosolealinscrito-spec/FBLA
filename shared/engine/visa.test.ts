// VISA-01 / VISA-02 / VISA-03 / D-03 / D-06
// RED until shared/engine/visa.ts is implemented in Plan 03.
// These tests lock every Phase 7 engine behavior before implementation exists.

import { selectVisaPathways } from './visa.js';
import type { Profile } from '../types.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const baseProfile: Profile = {
  profession: 'Software Engineer',
  hasRemote: true,
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
  education: 'bachelors',         // exact Phase 2 value — not 'bachelor'
  currentCity: 'Austin, TX',
  citizenship: 'US',
  immigrationStatus: 'citizen',
  opennessToAbroad: 80,
  lifestyleTags: [],
  dealBreakers: [],
  importanceRank: ['cost', 'career', 'lifestyle', 'safety'],
  moveTimeline: '12mo',
};

// Low-income fixture: remote but clearly below D8 threshold (~$30k vs ~$48.5k)
const lowIncomeProfile: Profile = {
  ...baseProfile,
  income: 30000,
};

// No-remote fixture: fails D8 primary gate (hasRemote=false)
const noRemoteProfile: Profile = {
  ...baseProfile,
  hasRemote: false,
};

// Older profile with degree: possible for Express Entry (age > 35)
const olderWithDegreeProfile: Profile = {
  ...baseProfile,
  age: 45,
  education: 'bachelors',
};

// Older profile without post-secondary: long shot for Express Entry
const olderNoPostSecondaryProfile: Profile = {
  ...baseProfile,
  age: 45,
  education: 'highschool',
};

// Unlisted citizenship: returns generic skeleton (D-06)
const unknownCitizenshipProfile: Profile = {
  ...baseProfile,
  citizenship: 'XX',
};

// Real quiz value: the capture layer (Quiz.jsx) emits the human-readable label
// "US Citizen", NOT the registry code "US". Locks the normalization so the wired
// flow surfaces the authored pathways instead of the skeleton (VISA-02 regression).
const realQuizUSProfile: Profile = {
  ...baseProfile,
  citizenship: 'US Citizen',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('selectVisaPathways — flagship model (VISA-01/VISA-02)', () => {
  it('returns BOTH Portugal D8 AND Canada EE for US citizen (length 2)', () => {
    const results = selectVisaPathways(baseProfile, 'UK');
    expect(results).toHaveLength(2);
    const countries = results.map((r) => r.pathway.destinationCountry);
    expect(countries).toContain('Portugal');
    expect(countries).toContain('Canada');
  });

  it('matchedCountry does NOT filter — passing matchedCountry="UK" still returns both pathways (length 2)', () => {
    const resultsUK = selectVisaPathways(baseProfile, 'UK');
    const resultsPortugal = selectVisaPathways(baseProfile, 'Portugal');
    const resultsCanada = selectVisaPathways(baseProfile, 'Canada');
    expect(resultsUK).toHaveLength(2);
    expect(resultsPortugal).toHaveLength(2);
    expect(resultsCanada).toHaveLength(2);
  });

  it('normalizes the real quiz label "US Citizen" → returns both pathways (length 2), not skeleton', () => {
    const results = selectVisaPathways(realQuizUSProfile, 'UK');
    expect(results).toHaveLength(2);
    const countries = results.map((r) => r.pathway.destinationCountry);
    expect(countries).toContain('Portugal');
    expect(countries).toContain('Canada');
  });

  it('returns generic skeleton (length 1) for unlisted citizenship "XX"', () => {
    const results = selectVisaPathways(unknownCitizenshipProfile, 'Germany');
    expect(results).toHaveLength(1);
    // Skeleton destination should reflect the passed matchedCountry
    expect(results[0].pathway.destinationCountry).toBe('Germany');
  });
});

describe('computeGradedFit — D8 (VISA-01 D-03)', () => {
  it('Strong fit: hasRemote=true AND income >= D8 threshold (110k)', () => {
    const results = selectVisaPathways(baseProfile, 'Portugal');
    const d8 = results.find((r) => r.pathway.destinationCountry === 'Portugal');
    expect(d8).toBeDefined();
    expect(d8!.fit.grade).toBe('strong');
    expect(d8!.fit.gatingFactor.trim().length).toBeGreaterThan(0);
  });

  it('Possible: hasRemote=true AND income clearly below D8 threshold (30k)', () => {
    const results = selectVisaPathways(lowIncomeProfile, 'Portugal');
    const d8 = results.find((r) => r.pathway.destinationCountry === 'Portugal');
    expect(d8).toBeDefined();
    expect(d8!.fit.grade).toBe('possible');
    expect(d8!.fit.gatingFactor.trim().length).toBeGreaterThan(0);
  });

  it('Long shot: hasRemote=false (D8 requires non-Portuguese client income)', () => {
    const results = selectVisaPathways(noRemoteProfile, 'Portugal');
    const d8 = results.find((r) => r.pathway.destinationCountry === 'Portugal');
    expect(d8).toBeDefined();
    expect(d8!.fit.grade).toBe('long-shot');
    expect(d8!.fit.gatingFactor.trim().length).toBeGreaterThan(0);
    // Long shot is NOT the same grade as strong — it is a likelihood signal, not a rejection
    expect(d8!.fit.grade).not.toBe('strong');
  });
});

describe('computeGradedFit — Express Entry (VISA-01 D-03)', () => {
  it('Strong fit: age <= 35 AND post-secondary degree ("bachelors")', () => {
    const results = selectVisaPathways(baseProfile, 'Canada');
    const ee = results.find((r) => r.pathway.destinationCountry === 'Canada');
    expect(ee).toBeDefined();
    expect(ee!.fit.grade).toBe('strong');
    expect(ee!.fit.gatingFactor.trim().length).toBeGreaterThan(0);
  });

  it('Possible: age > 35 with a post-secondary degree', () => {
    const results = selectVisaPathways(olderWithDegreeProfile, 'Canada');
    const ee = results.find((r) => r.pathway.destinationCountry === 'Canada');
    expect(ee).toBeDefined();
    expect(ee!.fit.grade).toBe('possible');
    expect(ee!.fit.gatingFactor.trim().length).toBeGreaterThan(0);
  });

  it('Long shot: age > 35 AND no post-secondary (highschool)', () => {
    const results = selectVisaPathways(olderNoPostSecondaryProfile, 'Canada');
    const ee = results.find((r) => r.pathway.destinationCountry === 'Canada');
    expect(ee).toBeDefined();
    expect(ee!.fit.grade).toBe('long-shot');
    expect(ee!.fit.gatingFactor.trim().length).toBeGreaterThan(0);
    // Long shot is NOT strong — likelihood signal, not a rejection determination
    expect(ee!.fit.grade).not.toBe('strong');
  });
});

describe('VISA_PATHWAYS data integrity (VISA-03)', () => {
  it('every returned pathway.officialSources is a non-empty array', () => {
    const results = selectVisaPathways(baseProfile, 'Portugal');
    expect(results).toHaveLength(2);
    results.forEach((r) => {
      expect(Array.isArray(r.pathway.officialSources)).toBe(true);
      expect(r.pathway.officialSources.length).toBeGreaterThan(0);
      r.pathway.officialSources.forEach((src) => {
        expect(typeof src).toBe('string');
        expect(src.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('every returned pathway has a non-empty feeRangeUSD and processingTime', () => {
    const results = selectVisaPathways(baseProfile, 'UK');
    expect(results).toHaveLength(2);
    results.forEach((r) => {
      expect(r.pathway.feeRangeUSD.trim().length).toBeGreaterThan(0);
      expect(r.pathway.processingTime.trim().length).toBeGreaterThan(0);
    });
  });

  it('generic skeleton for unlisted citizenship has non-empty officialSources', () => {
    const results = selectVisaPathways(unknownCitizenshipProfile, 'Germany');
    expect(results).toHaveLength(1);
    expect(results[0].pathway.officialSources.length).toBeGreaterThan(0);
  });
});

describe('offline deterministic', () => {
  it('two consecutive calls with identical inputs return deeply-equal output', () => {
    const result1 = selectVisaPathways(baseProfile, 'UK');
    const result2 = selectVisaPathways(baseProfile, 'UK');
    expect(result1).toEqual(result2);
  });

  it('selectVisaPathways does not throw for any fixture', () => {
    expect(() => selectVisaPathways(baseProfile, 'UK')).not.toThrow();
    expect(() => selectVisaPathways(lowIncomeProfile, 'Portugal')).not.toThrow();
    expect(() => selectVisaPathways(noRemoteProfile, 'Canada')).not.toThrow();
    expect(() => selectVisaPathways(olderWithDegreeProfile, 'UK')).not.toThrow();
    expect(() => selectVisaPathways(olderNoPostSecondaryProfile, 'UK')).not.toThrow();
    expect(() => selectVisaPathways(unknownCitizenshipProfile, 'Germany')).not.toThrow();
  });
});
