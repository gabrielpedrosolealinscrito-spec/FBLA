// ─────────────────────────────────────────────────────────────────
// Potential — Dealbreaker Penalty Layer (Phase 3, Plan 05)
// D-01: Triggered dealbreakers apply a heavy PENALTY — never delete the city.
// D-02: checkReconfirm compares raw vs penalized #1 and emits a fact-citing signal.
// D-11: Each dealbreaker maps to the correct concrete city field (summerHighF/winterLowF).
//       Thresholds imported from scoring-weights.ts (no inline magic numbers).
// T-3-08: Unknown dealbreaker strings are silently ignored (no crash, no penalty).
// ─────────────────────────────────────────────────────────────────

import {
  SCORING_WEIGHTS,
  heatThresholdF,
  coldThresholdF,
  transitMin,
  walkMin,
  safetyMin,
  jobGrowthMin,
} from './scoring-weights.js';
import type { City, Profile, MatchResult } from '../types.js';

// ── Exported Interfaces ───────────────────────────────────────────

/**
 * A dealbreaker that was triggered for a given city.
 * label  — the user-facing dealbreaker string (matches DEAL_BREAKERS exactly)
 * factLabel — the specific city fact that triggered it, e.g. "summer highs above 107°F"
 */
export interface TriggeredDealbreaker {
  label: string;
  factLabel: string;
}

/**
 * D-02 re-confirm signal: emitted when a dealbreaker penalty demotes the raw #1 city.
 * city       — the raw-#1 city that got demoted
 * dealbreaker — the label of the dealbreaker that caused the demotion
 * factLabel  — the specific city fact behind the dealbreaker
 */
export interface ReconfirmSignal {
  city: City;
  dealbreaker: string;
  factLabel: string;
}

// ── Helper: derive profession's industry category ─────────────────
// Looks up the profile's profession in PROFESSION_CATEGORIES (constants.js)
// and returns the category string, or null if not found.
// Used by the "Must have strong job market in my field" dealbreaker.
async function getProfessionCategory(profession: string): Promise<string | null> {
  // Dynamic import avoids a top-level require() of a .js constants file;
  // the job-market check is the only caller so the cost is acceptable.
  // Note: in practice this module is bundled so the import resolves synchronously.
  const { PROFESSION_CATEGORIES } = await import('../data/constants.js') as {
    PROFESSION_CATEGORIES: Record<string, string[]>;
  };
  for (const [category, professions] of Object.entries(PROFESSION_CATEGORIES)) {
    if (professions.includes(profession)) return category;
  }
  return null;
}

// ── getTriggeredDealbreakers ──────────────────────────────────────

/**
 * For each dealbreaker the user holds, test the mapped city field per D-11.
 * Returns only the triggered ones with a human factLabel citing the real city value.
 *
 * profile is optional: the job-market dealbreaker is skipped when profile is absent
 * (callers that only supply [city, dealBreakers] will still get correct results for
 *  all non-job-market dealbreakers — this covers the unit-test call shape).
 *
 * T-3-08: unknown strings in dealBreakers are silently ignored.
 * D-01: this function only IDENTIFIES triggers; score mutation is done by applyPenalties.
 *
 * IMPORTANT: this function must remain synchronous — the job-market check is
 * best-effort when PROFESSION_CATEGORIES is not pre-loaded. The async version
 * (getProfessionCategory) is only called by applyPenalties internally.
 * For synchronous callers (checkReconfirm, unit tests) the job-market check
 * uses the synchronous category resolution path below.
 */
export function getTriggeredDealbreakers(
  city: City,
  dealBreakers: string[],
  profile?: Profile,
): TriggeredDealbreaker[] {
  const triggered: TriggeredDealbreaker[] = [];

  for (const db of dealBreakers) {
    switch (db) {
      // D-11: "No extreme heat" → summerHighF STRICT greater-than
      // San Antonio summerHighF=95 must NOT trigger (threshold is 95, boundary is exclusive).
      case 'No extreme heat':
        if (city.summerHighF > heatThresholdF) {
          triggered.push({
            label: 'No extreme heat',
            factLabel: `summer highs above ${city.summerHighF}°F`,
          });
        }
        break;

      // D-11: "No extreme cold" → winterLowF STRICT less-than (threshold=25)
      case 'No extreme cold':
        if (city.winterLowF < coldThresholdF) {
          triggered.push({
            label: 'No extreme cold',
            factLabel: `winter lows as cold as ${city.winterLowF}°F`,
          });
        }
        break;

      // D-11: "Must have public transit" → transitScore < transitMin (40)
      case 'Must have public transit':
        if (city.transitScore < transitMin) {
          triggered.push({
            label: 'Must have public transit',
            factLabel: `transit score of only ${city.transitScore} (below ${transitMin})`,
          });
        }
        break;

      // D-11: "Must be walkable" → walkScore < walkMin (50)
      case 'Must be walkable':
        if (city.walkScore < walkMin) {
          triggered.push({
            label: 'Must be walkable',
            factLabel: `walk score of only ${city.walkScore} (below ${walkMin})`,
          });
        }
        break;

      // D-11: "No state income tax" → stateTax > 0
      case 'No state income tax':
        if (city.stateTax > 0) {
          triggered.push({
            label: 'No state income tax',
            factLabel: `${city.stateTax}% state income tax rate`,
          });
        }
        break;

      // D-11: "Must be near mountains" → !nearMountains
      // nearMountains = within ~60 min drive of a major mountain range (Pitfall 5)
      case 'Must be near mountains':
        if (!city.nearMountains) {
          triggered.push({
            label: 'Must be near mountains',
            factLabel: `no major mountain range within a 60-minute drive`,
          });
        }
        break;

      // D-11: "Must be near ocean/coast" → !nearCoast
      // nearCoast = within ~60 min drive of ocean/major coastal bay (Pitfall 5)
      case 'Must be near ocean/coast':
        if (!city.nearCoast) {
          triggered.push({
            label: 'Must be near ocean/coast',
            factLabel: `no ocean or major coast within a 60-minute drive`,
          });
        }
        break;

      // D-11: "Low crime only" → safetyIndex < safetyMin (55, Numbeo scale)
      case 'Low crime only':
        if (city.safetyIndex < safetyMin) {
          triggered.push({
            label: 'Low crime only',
            factLabel: `safety index of only ${city.safetyIndex} (below ${safetyMin} on Numbeo scale)`,
          });
        }
        break;

      // D-11: "Need international airport" → !hasIntlAirport
      case 'Need international airport':
        if (!city.hasIntlAirport) {
          triggered.push({
            label: 'Need international airport',
            factLabel: `no direct international flights from local airport`,
          });
        }
        break;

      // D-11: "Must have strong job market in my field"
      // Triggers when: jobGrowth < jobGrowthMin (2.0) OR profession's industry not in topIndustries
      // profile is optional here — job-market check is skipped when profile is absent
      case 'Must have strong job market in my field': {
        const jobGrowthWeak = city.jobGrowth < jobGrowthMin;
        // Industry check: synchronously look up profession category from PROFESSION_CATEGORIES.
        // We carry a small static copy of the category→profession map here to keep the function
        // synchronous. This avoids a dynamic import in a hot path and satisfies the unit-test
        // call shape (no profile arg). The full list is in shared/data/constants.js.
        let industryMismatch = false;
        if (profile) {
          const categoryMap: Record<string, string[]> = {
            'Design & Creative': ['Graphic Designer','UX/UI Designer','Interior Designer','Photographer','Video Editor','Animator','Art Director','Fashion Designer'],
            'Tech & Engineering': ['Software Engineer','Data Analyst','Data Scientist','DevOps Engineer','Mechanical Engineer','Civil Engineer','Electrical Engineer','IT Support'],
            'Business & Finance': ['Accountant','Financial Analyst','Marketing Manager','Project Manager','HR Manager','Business Analyst','Real Estate Agent','Insurance Agent'],
            'Healthcare': ['Registered Nurse','Dental Hygienist','Physical Therapist','Pharmacy Technician','Medical Assistant','Paramedic','Psychologist'],
            'Education & Social': ['Teacher (K-12)','College Professor','Social Worker','School Counselor','Librarian','Tutor / Instructor'],
            'Trades & Services': ['Electrician','Plumber','HVAC Technician','Welder','Auto Mechanic','Chef / Cook','Restaurant Manager','Barber / Cosmetologist'],
            'Media & Writing': ['Writer / Content Creator','Journalist','PR Specialist','Social Media Manager','Copywriter','Technical Writer'],
          };
          let professionCategory: string | null = null;
          for (const [category, professions] of Object.entries(categoryMap)) {
            if (professions.includes(profile.profession)) {
              professionCategory = category;
              break;
            }
          }
          // Industry mismatch: profession's category not in topIndustries
          if (professionCategory && !city.topIndustries.includes(professionCategory)) {
            industryMismatch = true;
          }
        }
        if (jobGrowthWeak || industryMismatch) {
          const reasons: string[] = [];
          if (jobGrowthWeak) reasons.push(`only ${city.jobGrowth}% job growth (below ${jobGrowthMin}%)`);
          if (industryMismatch) reasons.push(`top industries don't include your field`);
          triggered.push({
            label: 'Must have strong job market in my field',
            factLabel: reasons.join(' and '),
          });
        }
        break;
      }

      // T-3-08: unknown dealbreaker strings are silently ignored
      default:
        break;
    }
  }

  return triggered;
}

// ── applyPenalties ────────────────────────────────────────────────

/**
 * Subtracts SCORING_WEIGHTS.dealbreaker.penalty per triggered dealbreaker from
 * result.matchScore and appends a NEGATIVE scoreFactor entry for each trigger.
 *
 * D-01: NEVER removes or filters the result — the ranked list is always fully populated.
 * D-05: Each penalty appears as a real negative bar in the contribution breakdown.
 *
 * Note: this mutates and returns a NEW MatchResult object (defensive copy).
 */
export function applyPenalties(result: MatchResult, profile: Profile): MatchResult {
  const triggered = getTriggeredDealbreakers(result.city, profile.dealBreakers, profile);
  if (triggered.length === 0) return result;

  const { penalty } = SCORING_WEIGHTS.dealbreaker;
  const penaltyContributions = triggered.map((t) => ({
    factor: t.label,
    contribution: -penalty,  // signed negative — D-05 renders as a real negative bar
  }));

  const totalPenalty = triggered.length * penalty;
  const newScore = Math.min(99, Math.max(0, Math.round(result.matchScore - totalPenalty)));

  return {
    ...result,
    matchScore: newScore,
    scoreFactors: [...result.scoreFactors, ...penaltyContributions],
  };
}

// ── checkReconfirm ────────────────────────────────────────────────

/**
 * D-02: Compare penalized ranking vs raw ranking to detect demotion of the raw #1.
 *
 * PURE ENGINE FUNCTION — not UI side (Pitfall 2). The UI only reads the returned signal.
 *
 * Returns a ReconfirmSignal when:
 *   - penalizedRanking[0].city.name !== rawRanking[0].city.name  (demotion occurred)
 *   - AND a dealbreaker in profile.dealBreakers triggered on the raw-#1 city
 *
 * Returns null when:
 *   - penalized #1 === raw #1 (no demotion — no re-confirm needed)
 *   - OR no dealbreaker triggered on raw #1 (edge case — shouldn't happen in practice)
 */
export function checkReconfirm(
  penalizedRanking: MatchResult[],
  rawRanking: MatchResult[],
  profile: Profile,
): ReconfirmSignal | null {
  if (penalizedRanking.length === 0 || rawRanking.length === 0) return null;

  const penalizedTop = penalizedRanking[0];
  const rawTop = rawRanking[0];

  // Same city at #1 → no demotion, no re-confirm needed
  if (penalizedTop.city.name === rawTop.city.name) return null;

  // Find the dealbreaker that demoted the raw #1
  const triggered = getTriggeredDealbreakers(rawTop.city, profile.dealBreakers, profile);
  if (triggered.length === 0) return null;

  return {
    city: rawTop.city,
    dealbreaker: triggered[0].label,
    factLabel: triggered[0].factLabel,
  };
}
