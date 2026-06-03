// MATCH-01 (D-02): Unit tests for dealbreaker evaluation and re-confirm signal logic
// These tests are RED until shared/engine/dealbreakers.ts is implemented in Wave 2.
//
// Key correctness requirements from 03-RESEARCH.md D-11:
//   - Dealbreakers use summerHighF / winterLowF, NOT avgTemp
//   - "No extreme heat" threshold = 95°F (summerHighF > 95 triggers)
//   - "No extreme cold" threshold = 25°F (winterLowF < 25 triggers)
//   - Phoenix summerHighF = 107 → ALWAYS triggers "No extreme heat"
//   - Minneapolis winterLowF = 9 → ALWAYS triggers "No extreme cold"
//
// D-02 re-confirm: signal present when dealbreaker demotes raw #1; null when top stays same

import { getTriggeredDealbreakers, checkReconfirm } from './dealbreakers.js';
import type { Profile, City, MatchResult } from '../types.js';

const baseProfile: Profile = {
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
  lifestyleTags: [],
  dealBreakers: ['No extreme heat'],
  importanceRank: ['cost', 'career', 'lifestyle', 'safety'],
  moveTimeline: '12mo',
};

const phoenixCity: City = {
  name: 'Phoenix, AZ',
  country: 'US',
  emoji: '☀️',
  lat: 33.45,
  lng: -112.07,
  costIndex: 109,
  medianRent: 1200,
  medianHome: 350000,
  avgTemp: 75,   // avgTemp would NOT trigger the old threshold of >72 for a clear fail
  vibe: ['Outdoorsy'],
  walkScore: 41,
  transitScore: 36,
  safetyIndex: 47,
  jobGrowth: 2.0,
  topIndustries: ['Healthcare', 'Real Estate', 'Finance'],
  financialModelId: 'us',
  stateTax: 2.5,
  summerHighF: 107,  // this is the field that MUST trigger the dealbreaker
  winterLowF: 44,
  nearMountains: false,
  nearCoast: false,
  hasIntlAirport: true,
  pop: '5M metro',
  climate: 'Desert, very hot summers',
};

const austinCity: City = {
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
  summerHighF: 97,  // above 95°F threshold — also triggers "No extreme heat"
  winterLowF: 42,
  nearMountains: false,
  nearCoast: false,
  hasIntlAirport: true,
  pop: '2.3M metro',
  climate: 'Hot summers, mild winters',
};

const coolCity: City = {
  name: 'Pittsburgh, PA',
  country: 'US',
  emoji: '🌉',
  lat: 40.44,
  lng: -79.99,
  costIndex: 99,
  medianRent: 1050,
  medianHome: 220000,
  avgTemp: 52,
  vibe: ['Arts', 'Sports'],
  walkScore: 62,
  transitScore: 55,
  safetyIndex: 65,
  jobGrowth: 1.2,
  topIndustries: ['Healthcare', 'Education', 'Tech'],
  financialModelId: 'us',
  stateTax: 3.07,
  summerHighF: 83,  // below 95°F — should NOT trigger heat dealbreaker
  winterLowF: 26,
  nearMountains: false,
  nearCoast: false,
  hasIntlAirport: true,
  pop: '2.4M metro',
  climate: 'Four seasons, humid continental',
};

describe('getTriggeredDealbreakers', () => {
  it('flags Phoenix for "No extreme heat" using summerHighF (107 > 95)', () => {
    const triggered = getTriggeredDealbreakers(phoenixCity, ['No extreme heat']);
    const labels = triggered.map((t) => t.label);
    expect(labels).toContain('No extreme heat');
  });

  it('does not flag Pittsburgh for "No extreme heat" (summerHighF 83 <= 95)', () => {
    const triggered = getTriggeredDealbreakers(coolCity, ['No extreme heat']);
    const labels = triggered.map((t) => t.label);
    expect(labels).not.toContain('No extreme heat');
  });

  it('includes factLabel with the specific fact (e.g. references summerHighF value)', () => {
    const triggered = getTriggeredDealbreakers(phoenixCity, ['No extreme heat']);
    expect(triggered.length).toBeGreaterThan(0);
    // factLabel must be a non-empty string describing the real fact
    expect(triggered[0].factLabel.length).toBeGreaterThan(0);
  });

  it('returns empty array when user has no matching dealbreakers', () => {
    const triggered = getTriggeredDealbreakers(phoenixCity, []);
    expect(triggered).toHaveLength(0);
  });
});

describe('checkReconfirm (D-02)', () => {
  // Helper to build a minimal MatchResult
  const makeResult = (city: City, score: number): MatchResult => ({
    city,
    matchScore: score,
    scoreFactors: [],
    estSalary: 100000,
    monthlyTakeHome: 6000,
    expenses: {
      rent: 1200, food: 400, transport: 250, utilities: 160,
      insurance: 350, personal: 300, childcare: 0, pets: 0, debtPay: 0, total: 2660,
    },
    monthlySavings: 3340,
  });

  it('returns a signal when a dealbreaker demotes the raw #1 match', () => {
    // Raw ranking: Phoenix #1 (score 80), Pittsburgh #2 (score 60)
    // Penalized ranking: Pittsburgh #1 (score 70), Phoenix #2 (score 50 after penalty)
    const rawRanking = [makeResult(phoenixCity, 80), makeResult(coolCity, 60)];
    const penalizedRanking = [makeResult(coolCity, 70), makeResult(phoenixCity, 50)];
    const profileWithDealbreaker: Profile = { ...baseProfile, dealBreakers: ['No extreme heat'] };

    const signal = checkReconfirm(penalizedRanking, rawRanking, profileWithDealbreaker);
    expect(signal).not.toBeNull();
    expect(signal!.city.name).toBe('Phoenix, AZ');
    expect(signal!.dealbreaker).toBe('No extreme heat');
  });

  it('returns null when penalized #1 equals raw #1 (no demotion)', () => {
    // Raw ranking: Austin #1, Phoenix #2
    // Penalized ranking: Austin #1 (still), Phoenix #2
    const rawRanking = [makeResult(austinCity, 75), makeResult(phoenixCity, 60)];
    const penalizedRanking = [makeResult(austinCity, 75), makeResult(phoenixCity, 40)];
    const profileNoDealbreaker: Profile = { ...baseProfile, dealBreakers: [] };

    const signal = checkReconfirm(penalizedRanking, rawRanking, profileNoDealbreaker);
    expect(signal).toBeNull();
  });
});
