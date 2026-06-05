// Wave 0 RED test — locks the fetchCategoryLive contract for Plan 03 (src/lib/fetchLive.js).
// This file imports from src/lib/fetchLive.js which does NOT exist yet.
// These tests are RED (module-not-found) until Plan 03 ships fetchCategoryLive.
// Do NOT attempt to make them green in this plan (05-01).
//
// FOUND-04 / LIVE-04 contract: when global fetch rejects/throws,
// fetchCategoryLive must resolve to the bundled golden-path items for that
// city+category — never undefined, never blank, never 'coming_soon'.
// The mocked city object has name: "Austin, TX" (full city.name string),
// and the resolved items must equal goldenPath[category]["Austin, TX"].

import { describe, it, expect, vi, beforeEach } from 'vitest';
import goldenPath from '../data/golden-path/demo-results.json';
import { fetchCategoryLive } from '../src/lib/fetchLive';

// Minimal city mock — name must be the full city.name string "Austin, TX"
// matching the golden-path lookup key (city-key contract, load-bearing).
const mockCity = {
  name: 'Austin, TX',
  country: 'US',
};

// Minimal profile mock for profession
const mockProfile = {
  profession: 'Software Engineer',
  age: 28,
  housing: 'rent' as const,
};

describe('fetchCategoryLive — FOUND-04/LIVE-04 bundled fallback', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.restoreAllMocks();
  });

  it('resolves to the bundled golden-path jobs when fetch throws (network error)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const items = await fetchCategoryLive(mockCity, 'jobs', mockProfile);

    // Must equal the golden-path fixture for this city+category — not undefined, not blank.
    // City key is "Austin, TX" (full string) matching the golden-path JSON structure.
    expect(items).toEqual(goldenPath.jobs['Austin, TX']);
  });

  it('resolves to bundled golden-path housing_rent when fetch returns a non-200 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({}),
      })
    );

    const items = await fetchCategoryLive(mockCity, 'housing_rent', mockProfile);

    expect(items).toEqual(goldenPath.housing_rent['Austin, TX']);
  });

  it('resolves to bundled golden-path dayinlife string when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Timeout')));

    const items = await fetchCategoryLive(mockCity, 'dayinlife', mockProfile);

    // dayinlife golden-path is a string, not an array
    expect(typeof items).toBe('string');
    expect(items).toBe(goldenPath.dayinlife['Austin, TX']);
  });

  it('never resolves to undefined or null on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('abort')));

    const items = await fetchCategoryLive(mockCity, 'jobs', mockProfile);

    expect(items).not.toBeNull();
    expect(items).not.toBeUndefined();
  });
});
