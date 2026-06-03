// ─────────────────────────────────────────────────────────────────
// ResultsView.test.jsx — MATCH-04 sort-order tests
// Tests the pure sortResults() helper directly (no DOM render).
// ─────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { sortResults } from './ResultsView.jsx';

// ── Minimal MatchResult fixture (3 cities) ────────────────────────
const makeResult = (name, matchScore, monthlySavings, estSalary, costIndex) => ({
  city: {
    name, country: "US", emoji: "🏙️", lat: 0, lng: 0,
    costIndex, medianRent: 1000, medianHome: 300000, avgTemp: 60,
    vibe: [], walkScore: 50, transitScore: 30, safetyIndex: 70,
    jobGrowth: 2.0, topIndustries: [], financialModelId: "us",
    stateTax: 0, summerHighF: 90, winterLowF: 35,
    nearMountains: false, nearCoast: false, hasIntlAirport: true,
    pop: "1M", climate: "Mild",
  },
  matchScore,
  scoreFactors: [],
  estSalary,
  monthlyTakeHome: Math.round(estSalary * 0.7 / 12),
  expenses: {
    rent: 1000, food: 400, transport: 250, utilities: 160,
    insurance: 350, personal: 300, childcare: 0, pets: 0, debtPay: 0,
    total: 2460,
  },
  monthlySavings,
});

const FIXTURE = [
  makeResult("CityA", 75, 800,  80000, 110),  // best savings, mid salary, mid cost
  makeResult("CityB", 90, 200,  60000,  85),  // best match, low savings, lowest cost, lowest salary
  makeResult("CityC", 60, 400, 100000, 140),  // worst match, mid savings, highest salary, highest cost
];

describe("sortResults — MATCH-04", () => {
  it("sort by match: highest matchScore first", () => {
    const sorted = sortResults(FIXTURE, "match");
    expect(sorted[0].city.name).toBe("CityB");  // matchScore 90
    expect(sorted[1].city.name).toBe("CityA");  // matchScore 75
    expect(sorted[2].city.name).toBe("CityC");  // matchScore 60
  });

  it("sort by savings: highest monthlySavings first", () => {
    const sorted = sortResults(FIXTURE, "savings");
    expect(sorted[0].city.name).toBe("CityA");  // monthlySavings 800
    expect(sorted[1].city.name).toBe("CityC");  // monthlySavings 400
    expect(sorted[2].city.name).toBe("CityB");  // monthlySavings 200
  });

  it("sort by salary: highest estSalary first", () => {
    const sorted = sortResults(FIXTURE, "salary");
    expect(sorted[0].city.name).toBe("CityC");  // estSalary 100000
    expect(sorted[1].city.name).toBe("CityA");  // estSalary 80000
    expect(sorted[2].city.name).toBe("CityB");  // estSalary 60000
  });

  it("sort by cost: lowest city.costIndex first", () => {
    const sorted = sortResults(FIXTURE, "cost");
    expect(sorted[0].city.name).toBe("CityB");  // costIndex 85
    expect(sorted[1].city.name).toBe("CityA");  // costIndex 110
    expect(sorted[2].city.name).toBe("CityC");  // costIndex 140
  });

  it("uses r.estSalary (MatchResult field) not r.salary", () => {
    // Verify the helper reads estSalary, not a flat salary field
    const withSalaryField = { ...FIXTURE[2], salary: 999999 }; // red herring
    const sorted = sortResults([...FIXTURE.slice(0, 2), withSalaryField], "salary");
    expect(sorted[0].estSalary).toBe(100000); // still sorts on estSalary
  });

  it("uses r.city.costIndex (MatchResult wraps city)", () => {
    // Ensure the helper navigates city.costIndex, not a flat costIndex
    const sorted = sortResults(FIXTURE, "cost");
    expect(sorted[0].city.costIndex).toBe(85);
  });

  it("does not mutate the input array", () => {
    const input = [...FIXTURE];
    const original0 = input[0].city.name;
    sortResults(input, "savings");
    expect(input[0].city.name).toBe(original0);
  });
});
