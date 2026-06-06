// ─────────────────────────────────────────────────────────────────
// Potential — Visa Screener Engine (Phase 7, VISA-01/VISA-02/VISA-03)
// Wave 0 STUB — makes visa.test.ts compile so the suite is RED on
// assertions, not on a missing module import error.
//
// ZERO network calls on the render path (D-01 / offline-mandatory).
// Authored-truth boundary (D-05): all visa facts are authored constants
// in shared/data/visa-pathways.ts — never LLM-invented.
//
// This stub exports the correct shape but returns [] (empty array) so:
//   - visa.test.ts imports resolve (no module-resolution error)
//   - Every assertion that checks pathway counts or grade values fails RED
//   - npx tsc --noEmit exits 0 (stub compiles under strict)
//
// Plan 03 replaces the [] stub body with real authored logic.
// ─────────────────────────────────────────────────────────────────

import type { Profile } from '../types.js';
import type { VisaPathway } from '../types.js';

// ── Local engine interfaces ───────────────────────────────────────────────────

export interface GradedFit {
  grade: 'strong' | 'possible' | 'long-shot';
  gatingFactor: string;           // named single factor shown in the fit badge
}

export interface VisaScreenerResult {
  pathway: VisaPathway;
  fit: GradedFit;
}

// ── Screener ─────────────────────────────────────────────────────────────────

/**
 * Returns ALL authored flagship VisaPathway results for the citizenship.
 * Falls back to GENERIC_SKELETON if no authored pathways exist for that citizenship.
 * matchedCountry is NOT a filter — used only to determine accent-border emphasis
 * (which column gets highlighted in the UI comparison grid).
 * Makes zero network calls — fully deterministic (D-01, D-02, offline-safe).
 *
 * @param profile       - User profile (citizenship, hasRemote, income, age, education)
 * @param matchedCountry - Top matched destination country — accent emphasis only
 * @returns               VisaScreenerResult[] with pathway + graded fit per pathway
 */
export function selectVisaPathways(
  profile: Profile,
  matchedCountry: string,   // accent-emphasis signal only — NOT a filter
): VisaScreenerResult[] {
  // Wave 0 stub: returns empty array so tests import cleanly and fail RED.
  // Plan 03 implements real logic: VISA_PATHWAYS[citizenship] ?? GENERIC_SKELETON.
  void profile;
  void matchedCountry;
  return [];
}
