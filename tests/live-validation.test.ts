// Wave 0 RED test — locks the validateItems contract for Plan 02 (api/live-core.ts).
// This file imports from api/live-core.ts which does NOT exist yet.
// These tests are RED (module-not-found) until Plan 02 ships validateItems.
// Do NOT attempt to make them green in this plan (05-01).
import { describe, it, expect } from 'vitest';
import { validateItems } from '../api/live-core';

// ── JobListing fixtures ──
const validJob = {
  title: 'Software Engineer',
  company: 'Acme Corp',
  salary: '$120,000/yr',
  desc: 'Build great things.',
  source: 'Indeed',
};

const jobMissingSource = {
  title: 'Software Engineer',
  company: 'Acme Corp',
};

// ── HousingListing fixtures ──
const validHousing = {
  neighborhood: 'East Austin',
  price: '$1,850/mo',
  beds: '2BR',
  sqft: '900 sqft',
  feature: 'Pool and gym',
  source: 'Zillow',
};

// ── validateItems — jobs ──
describe('validateItems — jobs', () => {
  it('returns the array when all items are valid JobListings', () => {
    const result = validateItems('jobs', [validJob]);
    expect(result).toEqual([validJob]);
  });

  it('throws when a job listing is missing the source field', () => {
    expect(() => validateItems('jobs', [jobMissingSource])).toThrow();
  });

  it('throws when input is a string instead of an array', () => {
    expect(() => validateItems('jobs', 'not an array')).toThrow();
  });
});

// ── validateItems — housing_rent ──
describe('validateItems — housing_rent', () => {
  it('returns the array when all items are valid HousingListings', () => {
    const result = validateItems('housing_rent', [validHousing]);
    expect(result).toEqual([validHousing]);
  });

  it('throws when a housing listing is missing the source field', () => {
    expect(() =>
      validateItems('housing_rent', [{ neighborhood: 'South Congress', price: '$1,800/mo', beds: '1BR' }])
    ).toThrow();
  });
});

// ── validateItems — dayinlife (Pitfall 7) ──
describe('validateItems — dayinlife', () => {
  it('returns the string when input is a narrative string', () => {
    const narrative = 'It is 7am and the September sun is already glowing.';
    const result = validateItems('dayinlife', narrative);
    expect(result).toBe(narrative);
  });

  it('throws when input is an array (Pitfall 7 — array is wrong shape for dayinlife)', () => {
    expect(() => validateItems('dayinlife', [])).toThrow();
  });

  it('throws when input is a non-string non-array (e.g. null)', () => {
    expect(() => validateItems('dayinlife', null)).toThrow();
  });
});
