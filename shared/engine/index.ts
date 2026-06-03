// ─────────────────────────────────────────────────────────────────
// Potential — Engine Orchestrator (Phase 3, Plan 06 / MATCH-01)
// rankCities: two-pass scoring + dealbreaker pipeline → RankingOutput
//
// Architecture:
//   Pass 1 (raw):      scoreCity + financial model → unpenalized MatchResult[]
//   Pass 2 (penalized): applyPenalties → penalized MatchResult[]
//   D-02 signal:       checkReconfirm compares raw #1 vs penalized #1
//
// Invariants (MATCH-01):
//   - results.length === CITIES_DATA.length (never empty, never filtered — D-01)
//   - every matchScore ∈ [0, 99] integer after both passes
//   - results sorted by matchScore descending
//
// Security (T-3-11): weights clamped to [0,4] at entry; costIndex guard is
//   inside computeUSExpenses (T-3-04). NaN-safe via round + clamp.
// ─────────────────────────────────────────────────────────────────

import type { Profile, City, MatchResult } from '../types.js';
import { CITIES_DATA } from '../data/cities.js';
import { FINANCIAL_MODELS } from './financial.js';
import { toUSD, currencyForCountry } from './fx.js';
import { scoreCity } from './scoring.js';
import { applyPenalties, checkReconfirm } from './dealbreakers.js';
import type { ReconfirmSignal } from './dealbreakers.js';

// ── Public interface ─────────────────────────────────────────────

export interface RankingOutput {
  results: MatchResult[];
  reconfirmSignal?: ReconfirmSignal;
}

// ── Helpers ──────────────────────────────────────────────────────

/** Clamp n to [min, max] inclusive. */
function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Sanitize Profile weights at engine entry (T-3-11).
 * Clamps each weight to [0, 4] — prevents score amplification from
 * malformed quiz output. Returns a shallow copy with clamped weights.
 */
function sanitizeProfile(profile: Profile): Profile {
  if (!profile.weights) return profile;
  return {
    ...profile,
    weights: {
      cost:      clamp(profile.weights.cost,      0, 4),
      career:    clamp(profile.weights.career,    0, 4),
      lifestyle: clamp(profile.weights.lifestyle, 0, 4),
      safety:    clamp(profile.weights.safety,    0, 4),
    },
  };
}

/**
 * Compute a raw (un-penalized) MatchResult for one city.
 * Financial model selected by city.financialModelId (Phase 4 extension point).
 */
function buildRawResult(profile: Profile, city: City): MatchResult {
  // Select financial model — fall back to US model for unknown IDs
  const model = FINANCIAL_MODELS[city.financialModelId] ?? FINANCIAL_MODELS['us'];

  // Gross income: city-adjusted salary (or remote fixed) + optional partner income
  // Non-remote path: dispatch to model.computeSalary() so each country model returns
  // a sourced local-currency salary (D-01 option A). US model delegates to BASE_SALARIES
  // x costIndex; uk-2026 returns a sourced GBP salary from UK_LOCAL_SALARIES.
  const currency = currencyForCountry(city.country);
  const localSalaryBase = profile.hasRemote
    ? profile.income                       // remote: already USD — no FX needed (D-02)
    : model.computeSalary(profile, city);  // local: in local currency (GBP for UK, etc.)

  // USD canonicalization: convert local salary to USD so MatchResult.estSalary is
  // comparable across the mixed US+intl list (MATCH-04 sort — all USD-canonical).
  // Remote path: profile.income is already USD; toUSD(x, "USD") = identity (rate=1).
  // US path: currencyForCountry("US") = "USD" -> rate=1 -> identity, no change to US math.
  const salaryBaseUSD = profile.hasRemote
    ? localSalaryBase                      // remote: already USD
    : toUSD(localSalaryBase, currency);    // non-remote: local -> USD
  const gross = salaryBaseUSD + (profile.hasPartner ? profile.partnerIncome : 0);

  // Tax: model computes in LOCAL currency (GBP for UK). Convert tax to USD for net.
  const localTax = model.computeTax(
    profile.hasRemote ? profile.income : localSalaryBase, // tax on local gross
    city.stateTax
  );
  const taxUSD = profile.hasRemote ? localTax : toUSD(localTax, currency);
  const monthlyTakeHome = Math.round((gross - taxUSD) / 12);

  // Expenses and savings
  const expenses = model.computeExpenses(profile, city);
  const monthlySavings = monthlyTakeHome - expenses.total;

  // Scoring (D-04 two-layer config-driven formula)
  const { rawScore, scoreFactors } = scoreCity(profile, city);
  const matchScore = clamp(Math.round(rawScore), 0, 99);

  return {
    city,
    matchScore,
    scoreFactors,
    estSalary: gross,
    monthlyTakeHome,
    expenses,
    monthlySavings,
  };
}

// ── Main export ──────────────────────────────────────────────────

/**
 * Engine→UI boundary: rank every city for the given profile.
 *
 * Two-pass D-02 flow:
 *   1. Build raw MatchResults (all cities, no penalties).
 *   2. Sort raw by matchScore desc → rawRanking.
 *   3. Apply dealbreaker penalties → penalizedResults.
 *   4. Sort penalized by matchScore desc → penalizedRanking.
 *   5. Call checkReconfirm to detect raw-#1 demotion → reconfirmSignal.
 *   6. Return { results: penalizedRanking, reconfirmSignal }.
 *
 * D-01: NEVER filter cities out — the result set is always CITIES_DATA.length.
 * opennessToAbroad === 0 is US-only; all current cities are US, so no-op now
 * (Phase 4 will add country filtering before this function if needed).
 */
export function rankCities(profile: Profile): RankingOutput {
  // Sanitize at entry (T-3-11)
  const p = sanitizeProfile(profile);

  // Pass 1: build raw results for every city (no filter — D-01)
  const rawResults: MatchResult[] = CITIES_DATA.map((city) => buildRawResult(p, city));

  // Raw ranking (sorted desc) — used only by checkReconfirm for D-02 comparison
  const rawRanking = [...rawResults].sort((a, b) => b.matchScore - a.matchScore);

  // Pass 2: apply dealbreaker penalties, re-clamp matchScore
  const penalizedResults: MatchResult[] = rawResults.map((result) => {
    const penalized = applyPenalties(result, p);
    // Re-clamp after penalty subtraction (T-3-11 + T-3-13)
    return {
      ...penalized,
      matchScore: clamp(Math.round(penalized.matchScore), 0, 99),
    };
  });

  // Penalized ranking (sorted desc) — the final UI result
  const penalizedRanking = [...penalizedResults].sort((a, b) => b.matchScore - a.matchScore);

  // D-02 re-confirm signal (null when no demotion)
  const signal = checkReconfirm(penalizedRanking, rawRanking, p);

  return {
    results: penalizedRanking,
    ...(signal !== null ? { reconfirmSignal: signal } : {}),
  };
}
