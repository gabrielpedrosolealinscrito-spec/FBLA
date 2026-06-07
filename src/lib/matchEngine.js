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
import { buildRoadmap } from '../../shared/engine/roadmap.js';

// Per-city accent colors — visual parity with the original prototype palette.
// Cities beyond the original 12 fall back to a deterministic palette slot.
const CITY_COLORS = {
  'Austin, TX': '#E8712B', 'Brooklyn/NYC, NY': '#7B1FA2', 'Denver, CO': '#1565C0',
  'Miami, FL': '#00ACC1', 'Pittsburgh, PA': '#F9A825', 'Raleigh, NC': '#00897B',
  'Portland, OR': '#558B2F', 'Boise, ID': '#2E7D32', 'Nashville, TN': '#D84315',
  'Salt Lake City, UT': '#5C6BC0', 'Chicago, IL': '#C62828', 'San Diego, CA': '#0288D1',
};
const PALETTE = ['#C9A24B', '#E8712B', '#1565C0', '#00897B', '#7B1FA2', '#558B2F', '#0288D1', '#D84315', '#5C6BC0', '#C62828'];

// ── Citizenship normalization ──────────────────────────────────────────────────
// The quiz emits human-readable citizenship strings (e.g. "US Citizen", "British")
// that don't match the ROADMAP_TEMPLATES registry keys (e.g. "US", "UK").
// This map normalizes quiz values → template keys (Rule 2: correctness requirement —
// without it, all live roadmaps silently fall back to GENERIC_TEMPLATE).
const CITIZENSHIP_KEY = {
  'US Citizen': 'US',
  'Canadian': 'CA',
  'British': 'UK',
  'Australian': 'AU',
  'EU Citizen': 'EU',
  'Indian': 'IN',
  'Mexican': 'MX',
  'Filipino': 'PH',
  'Brazilian': 'BR',
  'Nigerian': 'NG',
};

/**
 * Compile a personalized relocation roadmap from a flattened UI result row.
 *
 * The UI's result rows are produced by scoreProfile (see below) which spreads
 * `...r.city` — so the row IS the city plus the financial fields at the top
 * level. This adapter reconstructs the MatchResult nesting that buildRoadmap
 * expects, then calls it. Pure, offline, no network calls (ROAD-03).
 *
 * @param {object} profile - the quiz profile (citizenship, profession, housing)
 * @param {object} row     - a scored result row from scoreProfile()
 *   Shape: { name, country, medianRent, medianHome, ...cityFields,
 *            matchScore, salary, monthlyTakeHome, monthlySavings,
 *            expenses, scoreFactors }
 * @returns {Roadmap} - { cityName: string, sections: [...] } (locked contract)
 */
export function buildRoadmapForRow(profile, row) {
  // Reconstruct the MatchResult nesting from the flattened row.
  // The row already IS the city (scoreProfile spreads `...r.city`), so
  // `city: row` gives buildRoadmap access to all City fields.
  // Map `salary` back to `estSalary` (scoreProfile renamed it on flatten).
  const top = {
    city: row,
    matchScore: row.matchScore,
    estSalary: row.salary,
    monthlyTakeHome: row.monthlyTakeHome,
    monthlySavings: row.monthlySavings,
    expenses: row.expenses,
    scoreFactors: row.scoreFactors,
  };

  // Normalize the quiz citizenship string to the template registry key.
  // Falls back to the original value so unknown citizenships still resolve
  // via GENERIC_TEMPLATE (D-07 never-dead-end).
  const normalizedProfile = {
    ...profile,
    citizenship: CITIZENSHIP_KEY[profile.citizenship] ?? profile.citizenship,
  };

  return buildRoadmap(normalizedProfile, top);
}

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
