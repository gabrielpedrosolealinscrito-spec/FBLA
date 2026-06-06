// ─────────────────────────────────────────────────────────────────
// Potential — Relocation Roadmap Templates (Phase 6, D-01/D-02/D-05/D-07)
// Authoring types + GENERIC_TEMPLATE + targetFundUSD relocation-cost constants.
// Plan 03 appends per-persona pairs (US.US, US.UK) to ROADMAP_TEMPLATES.
//
// Authoring type ≠ contract type (RESEARCH Pattern 1):
//   TemplateStep.detail is a function (ctx: RoadmapContext) => string.
//   buildRoadmap() in shared/engine/roadmap.ts evaluates detail(ctx) to a plain
//   string and assembles the locked Roadmap/RoadmapSection contract. Do NOT edit
//   shared/types.ts — the 6-section contract (lines 179-187) is locked.
//
// Sources:
//   Domestic US move cost (TARGET_FUND_USD.US = $5,000):
//     Moving.com "Average Cost of Moving" 2025 — full-service local/intrastate
//     median $880-$2,500; plus first+last month deposit ($1,800-$3,600 median rent)
//     + 3-month emergency buffer. Conservative round figure.
//     https://www.moving.com/tips/average-cost-of-hiring-movers/
//   International relocation UK (TARGET_FUND_USD.UK = $12,000):
//     International move cost: $5,000-$15,000 (Statista 2024 range);
//     UK first+deposit + 3-mo emergency at London median rent ($3,186/mo USD).
//     Flights BOS/NYC→LHR ~$700-$1,200 return. Conservative midpoint.
//     https://www.statista.com/statistics/1274001/moving-abroad-average-cost/
//   Default international (TARGET_FUND_USD.default = $10,000):
//     Conservative blended estimate for unlisted destinations. No single URL;
//     derived from domestic + typical international buffer premium.
// ─────────────────────────────────────────────────────────────────

import type { RoadmapSection } from '../types.js';

// ── Authoring context — passed to every TemplateStep.detail function ──────────

/**
 * Runtime context assembled from Profile + MatchResult by buildContext() in roadmap.ts.
 * All numbers sourced directly from the engine's MatchResult (never recomputed — D-01).
 * monthlySavings can be negative (D-02 honesty boundary).
 */
export interface RoadmapContext {
  cityName: string;
  profession: string;
  monthlySavings: number;       // can be negative (D-02)
  estSalary: number;
  monthlyTakeHome: number;
  medianRent: number;
  medianHome: number;
  housing: 'rent' | 'buy';
  monthsToFund: number | null;  // null when monthlySavings <= 0 (D-02)
  targetFundUSD: number;
}

// ── SectionId — derives the 6 locked ids from the contract (ROAD-01) ─────────

export type SectionId = RoadmapSection['id'];

// ── Authoring types (separate from the locked Roadmap/RoadmapSection contract) ─

/**
 * A single authored step. label and sourceUrl are IMMUTABLE authored truth (ROAD-02 / D-05).
 * detail is a function so it can interpolate ctx numbers and branch on null (D-02).
 */
export interface TemplateStep {
  label: string;          // IMMUTABLE — acceptEnrichment rejects any mutation
  detail: (ctx: RoadmapContext) => string;
  sourceUrl?: string;     // IMMUTABLE — acceptEnrichment rejects any mutation
}

/** One of the 6 ordered sections in a roadmap template. */
export interface TemplateSection {
  id: SectionId;
  title: string;
  steps: TemplateStep[];
}

/** An ordered array of exactly 6 TemplateSections for a citizenship×destination pair. */
export type RoadmapTemplate = TemplateSection[];

// ── Relocation-cost fund constants (Assumptions A2, cited above) ──────────────

/**
 * Per-destination conservative relocation-fund estimate in USD.
 * Covers first+last month deposit + moving costs + 3-month emergency buffer.
 * Cited in the Sources block above. Plan 03 may refine per-persona values.
 */
export const TARGET_FUND_USD: Record<string, number> = {
  US: 5000,       // domestic move; source: moving.com + median deposit calc
  UK: 12000,      // international relocation to London; source: Statista + London deposit
  default: 10000, // conservative fallback for unlisted destinations
};

// ── Template registry — Plan 03 appends US.US and US.UK entries here ─────────

/**
 * Outer key: profile.citizenship (e.g. 'US').
 * Inner key: city.country (e.g. 'US', 'UK').
 * Plan 02 ships an empty US bucket; Plan 03 authors the two persona pairs.
 */
export const ROADMAP_TEMPLATES: Record<string, Record<string, RoadmapTemplate>> = {
  US: {},
};

// ── GENERIC_TEMPLATE — honest 6-section fallback (D-07) ──────────────────────
//
// Used for any citizenship×country pair not in ROADMAP_TEMPLATES (via ?? GENERIC_TEMPLATE).
// Contains real, generic guidance that is truthful and useful without inventing
// country-specific procedural or legal steps.
// The negative-savings reframe (D-02) lives in timeline and financial steps:
//   when ctx.monthsToFund === null (savings <= 0), return honest deficit text;
//   otherwise return the threaded countdown.

export const GENERIC_TEMPLATE: RoadmapTemplate = [
  {
    id: 'timeline',
    title: 'Move Timeline',
    steps: [
      {
        label: 'Savings runway to fund your move',
        detail: (ctx) => {
          if (ctx.monthsToFund === null) {
            return `Your projected budget shows a monthly deficit at current expenses in ${ctx.cityName}. Before setting a move date, close the gap: either increase income or reduce ongoing costs so that monthly savings are positive. Use the Financial section below for specific levers.`;
          }
          return `At your projected savings of $${ctx.monthlySavings.toLocaleString()}/month, you need approximately ${ctx.monthsToFund} month${ctx.monthsToFund === 1 ? '' : 's'} to build the recommended $${ctx.targetFundUSD.toLocaleString()} relocation fund (first month + deposit + moving costs + 3-month buffer). Start the clock now.`;
        },
      },
      {
        label: 'Planning milestones',
        detail: (ctx) => {
          if (ctx.monthsToFund === null) {
            return `Set milestones once the deficit is resolved. A realistic plan: 1) stabilize cash flow, 2) build a 3-month emergency buffer, 3) add a move-fund line item once savings turn positive.`;
          }
          return `Suggested timeline for your ${ctx.monthsToFund}-month runway: months 1-${Math.max(1, Math.floor(ctx.monthsToFund / 3))} research neighborhoods and job market; months ${Math.max(2, Math.floor(ctx.monthsToFund / 3) + 1)}-${Math.max(2, Math.floor(ctx.monthsToFund * 2 / 3))} secure employment offer or remote arrangement; final month secure housing and schedule the move.`;
        },
      },
    ],
  },
  {
    id: 'financial',
    title: 'Financial Preparation',
    steps: [
      {
        label: 'Monthly budget snapshot',
        detail: (ctx) => {
          if (ctx.monthsToFund === null) {
            return `Projected take-home in ${ctx.cityName}: $${ctx.monthlyTakeHome.toLocaleString()}/month. Current expense estimate leaves a deficit — expenses exceed income at this location. Review each expense category and identify reductions before committing to a move date.`;
          }
          return `Projected take-home in ${ctx.cityName}: $${ctx.monthlyTakeHome.toLocaleString()}/month. Estimated expenses leave $${ctx.monthlySavings.toLocaleString()}/month in savings. Protect this margin — it is your runway to fund the move and build reserves.`;
        },
      },
      {
        label: 'Move fund target',
        detail: (ctx) => {
          if (ctx.monthsToFund === null) {
            return `Target relocation fund: $${ctx.targetFundUSD.toLocaleString()} (first + last month deposit, moving costs, 3-month emergency). With the current deficit, focus on closing the gap before earmarking move funds.`;
          }
          return `Target relocation fund: $${ctx.targetFundUSD.toLocaleString()} — covers first + last month deposit, moving logistics, and a 3-month emergency buffer. At $${ctx.monthlySavings.toLocaleString()}/month saved, you reach this in ${ctx.monthsToFund} month${ctx.monthsToFund === 1 ? '' : 's'}. Automate a dedicated transfer so the fund is sequestered.`;
        },
      },
    ],
  },
  {
    id: 'jobs',
    title: 'Job Market & Career',
    steps: [
      {
        label: 'Research the local market',
        detail: (ctx) =>
          `${ctx.profession} roles in ${ctx.cityName}: search LinkedIn, Indeed, and local job boards with city-specific filters. Note the range of posted salaries relative to your projected estimate of $${ctx.estSalary.toLocaleString()}/year — adjust your negotiating floor accordingly.`,
      },
      {
        label: 'Network before you arrive',
        detail: (ctx) =>
          `Find ${ctx.profession} meetups, professional associations, and LinkedIn connections in ${ctx.cityName} at least 60 days before your move date. A local referral compresses time-to-offer by weeks. Remote first-round interviews are now standard — start applying before relocating.`,
      },
    ],
  },
  {
    id: 'housing',
    title: 'Housing',
    steps: [
      {
        label: 'Housing cost baseline',
        detail: (ctx) => {
          if (ctx.housing === 'rent') {
            return `Median rent in ${ctx.cityName}: $${ctx.medianRent.toLocaleString()}/month. Budget for first month + security deposit (typically 1-2 months rent = $${(ctx.medianRent * 2).toLocaleString()} upfront). Search 60-90 days before your target move date.`;
          }
          return `Median home price in ${ctx.cityName}: $${ctx.medianHome.toLocaleString()}. A conventional 20% down payment would be $${Math.round(ctx.medianHome * 0.2).toLocaleString()}. Factor in inspection, closing costs (~2-5%), and 3-6 months emergency reserve before committing.`;
        },
      },
      {
        label: 'Neighborhood research',
        detail: (ctx) =>
          `Before signing a lease or offer in ${ctx.cityName}, visit the neighborhood at different times of day. Use Walk Score and transit maps to verify commute assumptions. Short-term furnished rentals for the first 30-60 days let you validate the neighborhood without a long-term commitment.`,
      },
    ],
  },
  {
    id: 'logistics',
    title: 'Logistics & Practical Steps',
    steps: [
      {
        label: 'Moving logistics',
        detail: (ctx) =>
          `Get at least 3 quotes for your move to ${ctx.cityName}. Declutter before quoting — movers price by weight and volume. Ship books and non-essentials via USPS Media Mail or freight. For international moves, factor in customs documentation and potential import duties.`,
      },
      {
        label: 'Admin checklist',
        detail: (_ctx) =>
          `Update your address with the IRS (Form 8822), USPS (mail forwarding), your bank, employer, and any subscriptions. Transfer driver's license and vehicle registration within the legally required window (typically 30-90 days after establishing residency). Transfer healthcare coverage before the move.`,
      },
    ],
  },
  {
    id: 'visa',
    title: 'Visa & Immigration',
    steps: [
      {
        label: 'Immigration & visa',
        detail: (_ctx) =>
          `This is informational only and not legal advice. Visa and immigration requirements vary significantly by citizenship, destination country, and individual circumstances. Consult a licensed attorney who handles immigration matters for guidance specific to your situation. For destinations outside your home country, research the relevant government immigration portal for entry, work authorization, and residency options. Potential Premium includes a full visa concierge with pathway comparison and document checklists.`,
      },
    ],
  },
];
