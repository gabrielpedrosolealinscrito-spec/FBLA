// ─────────────────────────────────────────────────────────────────
// Potential — Visa Screener Engine (Phase 7, VISA-01/VISA-02/VISA-03)
// Pure TypeScript: offline, deterministic screener that maps a Profile to
// authored flagship VisaPathway entries with a graded fit signal.
//
// Authored-truth boundary (D-05): all visa facts live in
// shared/data/visa-pathways.ts — never LLM-invented.
// ZERO network calls on the render path (D-01 / offline-mandatory).
// Full determinism: no Date, no Math.random, no network — D-03.
// ─────────────────────────────────────────────────────────────────

import type { Profile } from '../types.js';
import type { VisaPathway } from '../types.js';
import { VISA_PATHWAYS, GENERIC_SKELETON } from '../data/visa-pathways.js';

// ── Local engine interfaces ───────────────────────────────────────────────────

export interface GradedFit {
  grade: 'strong' | 'possible' | 'long-shot';
  gatingFactor: string;           // named single factor shown in the fit badge
}

export interface VisaScreenerResult {
  pathway: VisaPathway;
  fit: GradedFit;
}

// ── Threshold constants (D-03 — [ASSUMED] verify at authoring) ────────────────

/** Portugal D8 income floor: 4× Portuguese minimum wage (Jan 2026). [ASSUMED] — verify at authoring */
const D8_MIN_MONTHLY_EUR = 3680;

/** Conservative EUR/USD rate — deliberately below spot so a stale favorable rate
 *  cannot trigger a false 'strong'. [ASSUMED] — verify at authoring */
const EUR_USD_CONSERVATIVE = 1.10;

/** Resulting annual USD threshold for the D8 remote-income gate. */
const D8_MIN_ANNUAL_USD = D8_MIN_MONTHLY_EUR * EUR_USD_CONSERVATIVE * 12; // 48,576

// ── Private helpers ───────────────────────────────────────────────────────────

/**
 * Returns true when the education value is post-secondary.
 * Uses the confirmed Phase 2 question strings (see questions.ts 260–265).
 */
function isPostSecondaryDegree(education: string): boolean {
  return ['associates', 'bachelors', 'masters', 'doctorate'].includes(education);
}

/**
 * Grade a profile's fit for the Portugal D8 Digital Nomad visa.
 * Logic per RESEARCH §Gating-Factor Logic (D-03 Graded Fit Thresholds):
 *   strong   — hasRemote AND income >= D8_MIN_ANNUAL_USD
 *   possible — hasRemote AND income < D8_MIN_ANNUAL_USD
 *   long-shot — !hasRemote (primary gate fails)
 */
function gradeD8(profile: Profile): GradedFit {
  if (!profile.hasRemote) {
    return {
      grade: 'long-shot',
      gatingFactor:
        'D8 requires remote income from non-Portuguese clients; local employment does not qualify',
    };
  }
  if (profile.income >= D8_MIN_ANNUAL_USD) {
    return {
      grade: 'strong',
      gatingFactor:
        'your remote income likely clears the D8 minimum',
    };
  }
  const requiredApprox = Math.round(D8_MIN_ANNUAL_USD / 1000) * 1000;
  return {
    grade: 'possible',
    gatingFactor:
      `your remote income is below the ~$${requiredApprox.toLocaleString()}/yr D8 threshold; income increase or official verification required`,
  };
}

/**
 * Grade a profile's fit for Canada Express Entry (FSW) — simplified informational heuristic.
 * CLB language scores are not captured; gatingFactor text reflects that explicitly (UPL boundary).
 * Logic per RESEARCH §Gating-Factor Logic:
 *   strong   — age <= 35 AND post-secondary
 *   possible — post-secondary OR age <= 29
 *   long-shot — neither condition met
 */
function gradeExpressEntry(profile: Profile): GradedFit {
  const postSecondary = isPostSecondaryDegree(profile.education);
  if (profile.age <= 35 && postSecondary) {
    return {
      grade: 'strong',
      gatingFactor:
        'Express Entry favors your age and education; language scores will be the swing factor',
    };
  }
  if (postSecondary || profile.age <= 29) {
    const reason = postSecondary
      ? `age ${profile.age} is above the peak scoring bracket; language scores will be the swing factor`
      : `no post-secondary credential captured; language scores will be the swing factor`;
    return {
      grade: 'possible',
      gatingFactor: reason,
    };
  }
  return {
    grade: 'long-shot',
    gatingFactor:
      'Express Entry CRS scores weight both age and post-secondary education; language scores will be the swing factor',
  };
}

/**
 * Dispatch to the correct grading function based on destination country.
 * Unknown destinations (e.g. skeleton) return a neutral 'possible'.
 */
function computeGradedFit(pathway: VisaPathway, profile: Profile): GradedFit {
  switch (pathway.destinationCountry) {
    case 'Portugal':
      return gradeD8(profile);
    case 'Canada':
      return gradeExpressEntry(profile);
    default:
      return {
        grade: 'possible',
        gatingFactor:
          'verify eligibility at the official immigration authority for this destination',
      };
  }
}

// ── Screener ─────────────────────────────────────────────────────────────────

/**
 * Returns ALL authored flagship VisaPathway results for the citizenship.
 * Falls back to GENERIC_SKELETON (with destinationCountry set to matchedCountry)
 * when no authored pathways exist for the citizenship — never a dead-end (D-06).
 *
 * matchedCountry is NOT a filter — it flows only into the skeleton fallback label.
 * Both D8 and Express Entry are always returned for US citizens regardless of
 * which destination country was matched (flagship model, VISA-02).
 *
 * Makes zero network calls — fully deterministic (D-01, D-03, offline-mandatory).
 *
 * @param profile        - User profile (citizenship, hasRemote, income, age, education)
 * @param matchedCountry - Top matched destination country — skeleton label only, NOT a filter
 * @returns                VisaScreenerResult[] with pathway + graded fit per pathway
 */
export function selectVisaPathways(
  profile: Profile,
  matchedCountry: string,   // accent-emphasis / skeleton-label signal only — NOT a filter
): VisaScreenerResult[] {
  const citizenship = profile.citizenship || 'US';
  const pathways = VISA_PATHWAYS[citizenship];

  if (!pathways || pathways.length === 0) {
    // D-06 honest skeleton: show the skeleton for the matched country, never a dead-end
    const skeletonPathway: VisaPathway = { ...GENERIC_SKELETON, destinationCountry: matchedCountry };
    return [
      {
        pathway: skeletonPathway,
        fit: { grade: 'possible', gatingFactor: 'verify eligibility at the official immigration authority for this destination' },
      },
    ];
  }

  return pathways.map((pathway) => ({
    pathway,
    fit: computeGradedFit(pathway, profile),
  }));
}
