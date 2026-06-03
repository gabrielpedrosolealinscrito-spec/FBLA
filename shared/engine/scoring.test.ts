// MATCH-03: Unit tests for scoring engine — contribution-sum invariant (Pitfall 1)
//
// Two invariants tested:
//   1. Pre-clamp: BASE_SCORE + sum(scoreFactors.contributions) === rawScore (within 0.01)
//   2. Post-clamp (CR-01 regression guard): rawScore is in [0,99] so the pre-clamp
//      invariant equals the user-facing displayed score.
//
// CR-01 fix verification: with normalized personal weights [0,1], rawScore must be
// comfortably below 99 in normal operation, so clamp is never active and the
// contribution bars in CityDetail reconcile with the badge exactly.

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
