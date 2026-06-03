// ─────────────────────────────────────────────────────────────────
// matchEngine — UI ↔ engine adapter
//
// Bridges the quiz Profile to the real, tested scoring engine
// (shared/engine: two-pass scoring + dealbreaker penalties + per-country
// financial models) and maps the engine's MatchResult[] back to the flat
// city shape the results list and city-detail view render.
//
// This REPLACES the prototype inline scoring that previously lived in
// PotentialApp.jsx (getMatchScore / getSalary / getExpenses / getSavings).
// One source of truth now: list scores and detail breakdowns come from the
// same engine call, so the numbers can never disagree.
// ─────────────────────────────────────────────────────────────────
import { rankCities } from '../../shared/engine/index.js';

// Per-city accent colors — visual parity with the original prototype palette.
// Cities beyond the original 12 fall back to a deterministic palette slot.
const CITY_COLORS = {
  'Austin, TX': '#E8712B', 'Brooklyn/NYC, NY': '#7B1FA2', 'Denver, CO': '#1565C0',
  'Miami, FL': '#00ACC1', 'Pittsburgh, PA': '#F9A825', 'Raleigh, NC': '#00897B',
  'Portland, OR': '#558B2F', 'Boise, ID': '#2E7D32', 'Nashville, TN': '#D84315',
  'Salt Lake City, UT': '#5C6BC0', 'Chicago, IL': '#C62828', 'San Diego, CA': '#0288D1',
};
const PALETTE = ['#C9A24B', '#E8712B', '#1565C0', '#00897B', '#7B1FA2', '#558B2F', '#0288D1', '#D84315', '#5C6BC0', '#C62828'];

/**
 * Score a quiz profile against every city and return UI-ready rows.
 * @param {object} profile - the profile emitted by the quiz onComplete(p)
 * @returns {Array<object>} flat city rows: { ...city, matchScore, salary,
 *   monthlyTakeHome, monthlySavings, expenses, scoreFactors, color }
 *   sorted by matchScore desc (engine guarantees the ordering).
 */
export function scoreProfile(profile) {
  const { results } = rankCities(profile);
  // opennessToAbroad === 0 means "US only"; any openness above that includes
  // international destinations (Phase 4 — e.g. London via the uk-2026 model).
  const usOnly = (profile.opennessToAbroad ?? 0) === 0;
  return results
    .filter((r) => (usOnly ? r.city.country === 'US' : true))
    .map((r, i) => ({
      ...r.city,
      matchScore: r.matchScore,
      salary: r.estSalary,
      monthlyTakeHome: r.monthlyTakeHome,
      monthlySavings: r.monthlySavings,
      expenses: r.expenses,
      scoreFactors: r.scoreFactors,
      color: r.city.color ?? CITY_COLORS[r.city.name] ?? PALETTE[i % PALETTE.length],
    }));
}
