// VISA-02 / VISA-03 / D-05 / D-06
// Direct-import data-integrity tests for shared/data/visa-pathways.ts.
// These tests go GREEN immediately — no engine dependency (Plan 03 not needed).
// This file cannot live in Plan 01 (the data module did not exist yet).
//
// Gates:
//   VISA-02: both Portugal D8 and Canada EE exist with all required fields
//   VISA-03: every figure cited to an official source + "data as of" stamp present
//   D-05: no LLM-invented job-offer CRS bonus (removed March 2025)
//   D-06: GENERIC_SKELETON has no invented fee numbers

import {
  VISA_PATHWAYS,
  PORTUGAL_D8,
  CANADA_EXPRESS_ENTRY,
  GENERIC_SKELETON,
} from './visa-pathways.js';

// ── VISA_PATHWAYS registry ────────────────────────────────────────────────────

describe('VISA_PATHWAYS registry (VISA-02)', () => {
  it('US key exists and has exactly 2 authored pathways', () => {
    expect(Array.isArray(VISA_PATHWAYS.US)).toBe(true);
    expect(VISA_PATHWAYS.US).toHaveLength(2);
  });

  it('US pathways include Portugal D8 and Canada Express Entry', () => {
    const destinations = VISA_PATHWAYS.US.map((p) => p.destinationCountry);
    expect(destinations).toContain('Portugal');
    expect(destinations).toContain('Canada');
  });
});

// ── Portugal D8 — field completeness ─────────────────────────────────────────

describe('PORTUGAL_D8 — field completeness (VISA-02)', () => {
  it('destinationCountry is "Portugal"', () => {
    expect(PORTUGAL_D8.destinationCountry).toBe('Portugal');
  });

  it('visaType is non-empty', () => {
    expect(PORTUGAL_D8.visaType.trim().length).toBeGreaterThan(0);
  });

  it('requirements is a non-empty array', () => {
    expect(Array.isArray(PORTUGAL_D8.requirements)).toBe(true);
    expect(PORTUGAL_D8.requirements.length).toBeGreaterThan(0);
  });

  it('processingTime is a non-empty string', () => {
    expect(PORTUGAL_D8.processingTime.trim().length).toBeGreaterThan(0);
  });

  it('feeRangeUSD is a non-empty string', () => {
    expect(PORTUGAL_D8.feeRangeUSD.trim().length).toBeGreaterThan(0);
  });

  it('pros is a non-empty array', () => {
    expect(Array.isArray(PORTUGAL_D8.pros)).toBe(true);
    expect(PORTUGAL_D8.pros.length).toBeGreaterThan(0);
  });

  it('cons is a non-empty array', () => {
    expect(Array.isArray(PORTUGAL_D8.cons)).toBe(true);
    expect(PORTUGAL_D8.cons.length).toBeGreaterThan(0);
  });

  it('documentChecklist has more than 0 items', () => {
    expect(Array.isArray(PORTUGAL_D8.documentChecklist)).toBe(true);
    expect(PORTUGAL_D8.documentChecklist.length).toBeGreaterThan(0);
  });
});

// ── Portugal D8 — VISA-03 source citation ────────────────────────────────────

describe('PORTUGAL_D8 — official sources and data-as-of (VISA-03)', () => {
  it('officialSources is a non-empty array', () => {
    expect(Array.isArray(PORTUGAL_D8.officialSources)).toBe(true);
    expect(PORTUGAL_D8.officialSources.length).toBeGreaterThan(0);
  });

  it('at least one officialSources entry matches /data as of/i', () => {
    const hasDataAsOf = PORTUGAL_D8.officialSources.some((src) =>
      /data as of/i.test(src),
    );
    expect(hasDataAsOf).toBe(true);
  });
});

// ── Canada Express Entry — field completeness ─────────────────────────────────

describe('CANADA_EXPRESS_ENTRY — field completeness (VISA-02)', () => {
  it('destinationCountry is "Canada"', () => {
    expect(CANADA_EXPRESS_ENTRY.destinationCountry).toBe('Canada');
  });

  it('visaType is non-empty', () => {
    expect(CANADA_EXPRESS_ENTRY.visaType.trim().length).toBeGreaterThan(0);
  });

  it('requirements is a non-empty array', () => {
    expect(Array.isArray(CANADA_EXPRESS_ENTRY.requirements)).toBe(true);
    expect(CANADA_EXPRESS_ENTRY.requirements.length).toBeGreaterThan(0);
  });

  it('processingTime is a non-empty string', () => {
    expect(CANADA_EXPRESS_ENTRY.processingTime.trim().length).toBeGreaterThan(0);
  });

  it('feeRangeUSD is a non-empty string', () => {
    expect(CANADA_EXPRESS_ENTRY.feeRangeUSD.trim().length).toBeGreaterThan(0);
  });

  it('pros is a non-empty array', () => {
    expect(Array.isArray(CANADA_EXPRESS_ENTRY.pros)).toBe(true);
    expect(CANADA_EXPRESS_ENTRY.pros.length).toBeGreaterThan(0);
  });

  it('cons is a non-empty array', () => {
    expect(Array.isArray(CANADA_EXPRESS_ENTRY.cons)).toBe(true);
    expect(CANADA_EXPRESS_ENTRY.cons.length).toBeGreaterThan(0);
  });

  it('documentChecklist has more than 0 items', () => {
    expect(Array.isArray(CANADA_EXPRESS_ENTRY.documentChecklist)).toBe(true);
    expect(CANADA_EXPRESS_ENTRY.documentChecklist.length).toBeGreaterThan(0);
  });
});

// ── Canada Express Entry — VISA-03 source citation ────────────────────────────

describe('CANADA_EXPRESS_ENTRY — official sources and data-as-of (VISA-03)', () => {
  it('officialSources is a non-empty array', () => {
    expect(Array.isArray(CANADA_EXPRESS_ENTRY.officialSources)).toBe(true);
    expect(CANADA_EXPRESS_ENTRY.officialSources.length).toBeGreaterThan(0);
  });

  it('at least one officialSources entry matches /data as of/i', () => {
    const hasDataAsOf = CANADA_EXPRESS_ENTRY.officialSources.some((src) =>
      /data as of/i.test(src),
    );
    expect(hasDataAsOf).toBe(true);
  });
});

// ── D-05: no removed job-offer CRS bonus mentioned ───────────────────────────

describe('D-05: no job-offer CRS bonus (removed March 25, 2025)', () => {
  it('authored pathway content does not mention job-offer CRS bonus', () => {
    // Join all authored text fields and check for the forbidden pattern.
    // The removed bonus must not appear anywhere in the data module.
    const allAuthoredText = [
      ...PORTUGAL_D8.requirements,
      ...PORTUGAL_D8.cons,
      ...PORTUGAL_D8.pros,
      ...PORTUGAL_D8.documentChecklist,
      ...PORTUGAL_D8.officialSources,
      ...CANADA_EXPRESS_ENTRY.requirements,
      ...CANADA_EXPRESS_ENTRY.cons,
      ...CANADA_EXPRESS_ENTRY.pros,
      ...CANADA_EXPRESS_ENTRY.documentChecklist,
      ...CANADA_EXPRESS_ENTRY.officialSources,
    ].join('\n');

    // Must NOT contain "job offer" followed (within the same line) by "point"
    expect(allAuthoredText).not.toMatch(/job[ -]?offer.*point/i);
  });
});

// ── GENERIC_SKELETON — honest fallback (D-06) ────────────────────────────────

describe('GENERIC_SKELETON — honest fallback (D-06)', () => {
  it('officialSources contains a verify-at-source directive', () => {
    expect(Array.isArray(GENERIC_SKELETON.officialSources)).toBe(true);
    expect(GENERIC_SKELETON.officialSources.length).toBeGreaterThan(0);
    const hasVerifyDirective = GENERIC_SKELETON.officialSources.some((src) =>
      /verify/i.test(src),
    );
    expect(hasVerifyDirective).toBe(true);
  });

  it('feeRangeUSD is the exact verify-at-source sentinel (no invented number)', () => {
    expect(GENERIC_SKELETON.feeRangeUSD).toBe('Verify at official source');
  });

  it('processingTime is the exact verify-at-source sentinel (no invented timeline)', () => {
    expect(GENERIC_SKELETON.processingTime).toBe('Verify at official source');
  });
});
