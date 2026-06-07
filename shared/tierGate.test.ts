// Wave 0 logic tests — GREEN this wave.
// Tests the canAccess() and TIER_FEATURES.rankShowUpTo contract from shared/types.ts.
// All 16 tier-pair canAccess assertions + 4 rankGate assertions.

import { describe, it, expect } from 'vitest';
import { canAccess, TIER_FEATURES } from './types';

describe('canAccess', () => {
  // Free tier (rank 0) — can only access "free" required
  it('free can access free', () => {
    expect(canAccess('free', 'free')).toBe(true);
  });
  it('free cannot access basic', () => {
    expect(canAccess('free', 'basic')).toBe(false);
  });
  it('free cannot access plus', () => {
    expect(canAccess('free', 'plus')).toBe(false);
  });
  it('free cannot access premium', () => {
    expect(canAccess('free', 'premium')).toBe(false);
  });

  // Basic tier (rank 1)
  it('basic can access free', () => {
    expect(canAccess('basic', 'free')).toBe(true);
  });
  it('basic can access basic', () => {
    expect(canAccess('basic', 'basic')).toBe(true);
  });
  it('basic cannot access plus', () => {
    expect(canAccess('basic', 'plus')).toBe(false);
  });
  it('basic cannot access premium', () => {
    expect(canAccess('basic', 'premium')).toBe(false);
  });

  // Plus tier (rank 2)
  it('plus can access free', () => {
    expect(canAccess('plus', 'free')).toBe(true);
  });
  it('plus can access basic', () => {
    expect(canAccess('plus', 'basic')).toBe(true);
  });
  it('plus can access plus', () => {
    expect(canAccess('plus', 'plus')).toBe(true);
  });
  it('plus cannot access premium', () => {
    expect(canAccess('plus', 'premium')).toBe(false);
  });

  // Premium tier (rank 3) — can access everything below global
  it('premium can access free', () => {
    expect(canAccess('premium', 'free')).toBe(true);
  });
  it('premium can access basic', () => {
    expect(canAccess('premium', 'basic')).toBe(true);
  });
  it('premium can access plus', () => {
    expect(canAccess('premium', 'plus')).toBe(true);
  });
  it('premium can access premium', () => {
    expect(canAccess('premium', 'premium')).toBe(true);
  });

  // Global tier (rank 4) — top of the order, added by Package 00.
  it('global can access premium', () => {
    expect(canAccess('global', 'premium')).toBe(true);
  });
  it('global can access free', () => {
    expect(canAccess('global', 'free')).toBe(true);
  });
  it('global can access global', () => {
    expect(canAccess('global', 'global')).toBe(true);
  });
  it('premium cannot access global', () => {
    expect(canAccess('premium', 'global')).toBe(false);
  });
});

describe('rankGate', () => {
  it('free tier rankShowUpTo is 1', () => {
    expect(TIER_FEATURES.rankShowUpTo.free).toBe(1);
  });
  it('basic tier rankShowUpTo is 3', () => {
    expect(TIER_FEATURES.rankShowUpTo.basic).toBe(3);
  });
  it('plus tier rankShowUpTo is Infinity', () => {
    expect(TIER_FEATURES.rankShowUpTo.plus).toBe(Infinity);
  });
  it('premium tier rankShowUpTo is Infinity', () => {
    expect(TIER_FEATURES.rankShowUpTo.premium).toBe(Infinity);
  });
});
