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
//
//   US domestic template — authored figures (Plan 03):
//     Tech sector salary context (US): BLS Occupational Employment Statistics,
//     "Software Developers, Quality Assurance Analysts, and Testers", May 2023
//     median $130,160/yr. https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm
//     US job market growth (tech): BLS OOH "Software Developers" 2022-32 projected
//     growth 25% (much faster than average).
//     https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm
//     Texas income tax: no state income tax per Texas Comptroller.
//     https://comptroller.texas.gov/taxes/
//     Address change — IRS Form 8822:
//     https://www.irs.gov/forms-pubs/about-form-8822
//     USPS mail forwarding:
//     https://www.usps.com/manage/mail-forwarding.htm
//
//   UK (London) international template — authored figures (Plan 03):
//     Skilled Worker visa (UK): GOV.UK official guidance — salary threshold
//     £38,700/yr (general threshold as of April 2024; confirm current on gov.uk),
//     application fee £719–£1,420 depending on duration (as of 2024).
//     https://www.gov.uk/skilled-worker-visa
//     Global Talent visa (UK): GOV.UK official guidance — no salary threshold;
//     requires endorsement from a designated body; no cap on numbers.
//     https://www.gov.uk/global-talent
//     London tech market context: Tech Nation "State of the Nation 2023" —
//     London is Europe's largest tech hub, tech sector employs 500K+.
//     https://technation.io/report2023/
//     London median rent (USD): cities.ts record — $3,186/month (2024 estimate).
//     London median home (USD): cities.ts record — $740,000 (2024 estimate).
//     NHS registration: NHS England "Registering with a GP surgery."
//     https://www.nhs.uk/using-the-nhs/nhs-services/gps/how-to-register-with-a-gp-practice/
//     BRP (Biometric Residence Permit): GOV.UK guidance.
//     https://www.gov.uk/biometric-residence-permits
//     UK bank account for new arrivals: GOV.UK "Open a bank account."
//     https://www.gov.uk/government/publications/banking-for-new-residents
//     Passport validity: US passport typically 10 years; UK entry requires
//     validity for duration of stay (check gov.uk/check-uk-visa for latest).
//     https://www.gov.uk/check-uk-visa
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

// ── Template registry — populated by US_DOMESTIC_TEMPLATE and US_TO_UK_TEMPLATE below ─

/**
 * Outer key: profile.citizenship (e.g. 'US').
 * Inner key: city.country (e.g. 'US', 'UK').
 * Plan 02 ships an empty US bucket; Plan 03 authors the two persona pairs.
 * The registry is mutated after the templates are declared (declaration ordering).
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

// ── US Domestic Template (Plan 03 — ROAD-01/ROAD-02) ─────────────────────────
//
// US-citizen → top US match. A domestic move requires no visa; the visa section
// is light but still carries the immutable UPL line (VISA-04) + Premium teaser.
// All authored figures are cited in the Sources block above.

const US_DOMESTIC_TEMPLATE: RoadmapTemplate = [
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
          return `Based on your projected $${ctx.monthlySavings.toLocaleString()}/month of savings, your ~$${ctx.targetFundUSD.toLocaleString()} domestic move fund is reachable in about ${ctx.monthsToFund} month${ctx.monthsToFund === 1 ? '' : 's'} — covering first month + deposit, movers, and a 3-month emergency buffer. Start a dedicated savings transfer now so the fund builds automatically.`;
        },
      },
      {
        label: 'Planning milestones',
        detail: (ctx) => {
          if (ctx.monthsToFund === null) {
            return `Set milestones once the deficit is resolved. A realistic plan: 1) stabilize cash flow, 2) build a 3-month emergency buffer, 3) add a move-fund line item once savings turn positive.`;
          }
          const phase1 = Math.max(1, Math.floor(ctx.monthsToFund / 3));
          const phase2 = Math.max(phase1 + 1, Math.floor(ctx.monthsToFund * 2 / 3));
          return `Suggested ${ctx.monthsToFund}-month plan for your move to ${ctx.cityName}: months 1-${phase1} research neighborhoods and compare job listings; months ${phase1 + 1}-${phase2} secure an employment offer or confirm remote arrangement; final month book movers, secure housing, and file admin paperwork.`;
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
            return `Target domestic relocation fund: $${ctx.targetFundUSD.toLocaleString()} (first + last month deposit, movers, 3-month emergency buffer). With the current deficit, focus on closing the gap before earmarking move funds.`;
          }
          return `Target domestic relocation fund: $${ctx.targetFundUSD.toLocaleString()} — covers first + last month deposit, moving logistics, and a 3-month emergency reserve. At $${ctx.monthlySavings.toLocaleString()}/month saved, you reach this in ${ctx.monthsToFund} month${ctx.monthsToFund === 1 ? '' : 's'}. Automate a dedicated transfer so the fund grows without manual discipline.`;
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
          `${ctx.profession} roles in ${ctx.cityName}: search LinkedIn, Indeed, and Glassdoor with city-specific filters. The US tech sector (BLS 2023) reports a median salary of ~$130,000/year for software professionals nationwide — your projected figure of $${ctx.estSalary.toLocaleString()}/year reflects the local market. Post salary ranges are shifting: apply to roles that list compensation openly and use those as your negotiating floor.`,
        sourceUrl: 'https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm',
      },
      {
        label: 'Network before you arrive',
        detail: (ctx) =>
          `Find ${ctx.profession} meetups, professional associations, and LinkedIn connections in ${ctx.cityName} at least 60 days before your move. A local referral compresses time-to-offer by weeks. Remote first-round interviews are now standard — start applying before relocating. If you have a remote arrangement, confirm your employer's multi-state payroll setup and any state-tax implications for ${ctx.cityName}.`,
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
            return `Median rent in ${ctx.cityName}: $${ctx.medianRent.toLocaleString()}/month. Budget for first month + security deposit (typically 1-2 months rent = $${(ctx.medianRent * 2).toLocaleString()} upfront). Search 60-90 days before your target move date and use Zillow, Apartments.com, or local property managers. Confirm lease terms and pet/parking policies before signing.`;
          }
          return `Median home price in ${ctx.cityName}: $${ctx.medianHome.toLocaleString()}. A conventional 20% down payment would be $${Math.round(ctx.medianHome * 0.2).toLocaleString()}. Factor in inspection, closing costs (~2-5%), and a 3-6 month emergency reserve before committing. Get pre-approved before making offers in competitive markets.`;
        },
      },
      {
        label: 'Neighborhood research',
        detail: (ctx) =>
          `Before signing a lease or offer in ${ctx.cityName}, visit the neighborhood at different times of day. Use Walk Score and transit maps to validate commute assumptions against your actual workplace location. Short-term furnished rentals (30-60 days) let you validate the area before a long-term commitment — especially useful when relocating without a prior local visit.`,
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
          `Get at least 3 quotes for your domestic move to ${ctx.cityName}. Declutter before quoting — movers price by weight and volume. Ship books and non-essentials via USPS Media Mail or a freight carrier. Book moving trucks or full-service movers 4-8 weeks in advance, especially for summer moves (peak season).`,
      },
      {
        label: 'Admin checklist — domestic move',
        detail: (_ctx) =>
          `Key admin steps for a US domestic move: (1) File IRS Form 8822 to update your address with the IRS. (2) Submit a USPS change-of-address form (usps.com) — mail forwarding lasts 12 months. (3) Notify your bank, employer HR/payroll, and subscription services. (4) Transfer your driver's license and vehicle registration within the state's required window — typically 30-90 days of establishing residency. (5) Transfer healthcare coverage before your old plan lapses; confirm in-network providers in the new city. (6) Update voter registration in your new state.`,
        sourceUrl: 'https://www.irs.gov/forms-pubs/about-form-8822',
      },
    ],
  },
  {
    id: 'visa',
    title: 'Visa & Immigration',
    steps: [
      {
        label: 'Visa requirement — domestic move',
        detail: (_ctx) =>
          `A US citizen moving within the United States does not require a visa — freedom of movement between states is unrestricted. No immigration filings are needed for a domestic relocation. This is informational only and not legal advice. If your situation involves employer sponsorship, international travel, or dual-citizenship considerations, consult a licensed attorney who handles immigration matters for guidance specific to your situation. Potential Premium includes a full visa concierge for international moves with pathway comparison and document checklists.`,
      },
    ],
  },
];

// Assign the domestic template to the US.US slot in the registry
ROADMAP_TEMPLATES.US.US = US_DOMESTIC_TEMPLATE;

// ── US → UK (London) International Template (Plan 03 — ROAD-01/ROAD-02) ──────
//
// US-citizen → London, UK. The visa section's headline pathway is the UK
// Skilled Worker visa or Global Talent visa — official GOV.UK routes, cited to
// gov.uk. UK routes ONLY — not a Lisbon roadmap (see 06-RESEARCH Pitfall 1
// and the hard constraint in 06-03-PLAN.md).
// UPL line is immutable and identical to all other templates (VISA-04 / D-08).
// All authored figures cited in the Sources block above.

const US_TO_UK_TEMPLATE: RoadmapTemplate = [
  {
    id: 'timeline',
    title: 'Move Timeline',
    steps: [
      {
        label: 'Savings runway to fund your international move',
        detail: (ctx) => {
          if (ctx.monthsToFund === null) {
            return `Your projected budget shows a monthly deficit at current expenses for ${ctx.cityName}. Before setting a move date, close the gap: either increase income or reduce ongoing costs so that monthly savings are positive. An international relocation requires a larger upfront fund — use the Financial section below for specific levers.`;
          }
          return `Based on your projected $${ctx.monthlySavings.toLocaleString()}/month of savings, your ~$${ctx.targetFundUSD.toLocaleString()} international relocation fund for ${ctx.cityName} is reachable in about ${ctx.monthsToFund} month${ctx.monthsToFund === 1 ? '' : 's'} — covering visa fees, international shipping, first month + deposit, and a 3-month emergency buffer. International moves carry more uncertainty; build the full fund before committing to a move date.`;
        },
      },
      {
        label: 'Planning milestones',
        detail: (ctx) => {
          if (ctx.monthsToFund === null) {
            return `Set milestones once the deficit is resolved. For an international move: 1) stabilize cash flow, 2) build a 3-month emergency buffer, 3) research UK visa options and initiate the application process once savings turn positive.`;
          }
          const phase1 = Math.max(1, Math.floor(ctx.monthsToFund / 3));
          const phase2 = Math.max(phase1 + 1, Math.floor(ctx.monthsToFund * 2 / 3));
          return `Suggested ${ctx.monthsToFund}-month plan for your international move to ${ctx.cityName}: months 1-${phase1} research UK visa pathways (Skilled Worker / Global Talent), secure a job offer if required, and begin your visa application; months ${phase1 + 1}-${phase2} arrange international shipping, open a UK bank account remotely if possible, and secure temporary housing; final month complete BRP biometrics appointment, book flights, and close domestic obligations.`;
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
            return `Projected take-home in ${ctx.cityName}: $${ctx.monthlyTakeHome.toLocaleString()}/month (USD equivalent). Current expense estimate leaves a deficit — expenses exceed income at this location. Review each expense category and identify reductions before committing to an international move date.`;
          }
          return `Projected take-home in ${ctx.cityName}: $${ctx.monthlyTakeHome.toLocaleString()}/month (USD equivalent). Estimated expenses leave $${ctx.monthlySavings.toLocaleString()}/month in savings. International relocations require a larger cash reserve — protect this margin and target a minimum 6-month buffer before your move date.`;
        },
      },
      {
        label: 'International move fund target',
        detail: (ctx) => {
          if (ctx.monthsToFund === null) {
            return `Target international relocation fund: $${ctx.targetFundUSD.toLocaleString()} (visa fees, international shipping, first + last month deposit in ${ctx.cityName}, flights, and 3-month emergency buffer). With the current deficit, focus on closing the gap before earmarking move funds.`;
          }
          return `Target international relocation fund: $${ctx.targetFundUSD.toLocaleString()} — covers UK visa application fees, international shipping or storage, first + last month deposit in ${ctx.cityName}, transatlantic flights, and a 3-month emergency reserve. At $${ctx.monthlySavings.toLocaleString()}/month saved, you reach this in ${ctx.monthsToFund} month${ctx.monthsToFund === 1 ? '' : 's'}. Currency risk is real — consider converting a portion to GBP when your fund is near target.`;
        },
      },
    ],
  },
  {
    id: 'jobs',
    title: 'Job Market & Career',
    steps: [
      {
        label: 'Research the London market',
        detail: (ctx) =>
          `${ctx.profession} roles in ${ctx.cityName}: London is Europe's largest tech hub, home to 500K+ tech workers across finance, fintech, and enterprise software (Tech Nation 2023). Search LinkedIn, CWJobs, and Hired with a UK location filter. Your projected UK salary of $${ctx.estSalary.toLocaleString()}/year (USD equivalent) reflects the local market; note that UK offers are typically quoted in GBP and your take-home depends on UK income tax and National Insurance contributions. Many US tech employers have a London office — an internal transfer may simplify your visa path.`,
        sourceUrl: 'https://technation.io/report2023/',
      },
      {
        label: 'Network before you arrive',
        detail: (ctx) =>
          `Find ${ctx.profession} meetups, conferences, and LinkedIn connections in ${ctx.cityName} at least 90 days before your move — international job searches take longer. Tech communities like Silicon Roundabout (East London) host regular meetups. Remote first-round interviews are standard; many London companies are comfortable hiring US candidates who are visa-eligible. Secure your job offer before applying for a Skilled Worker visa, as most UK work routes require an employer sponsor with a valid sponsorship licence.`,
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
            return `Median rent in ${ctx.cityName}: $${ctx.medianRent.toLocaleString()}/month (USD equivalent). London landlords typically require a 5-week deposit plus one month in advance — budget ~$${Math.round(ctx.medianRent * 2.25).toLocaleString()} upfront (USD equivalent). Search Rightmove, Zoopla, or SpareRoom. Book temporary furnished accommodation (Airbnb or serviced apartment) for your first 30-60 days so you can view properties in person before signing.`;
          }
          return `Median home price in ${ctx.cityName}: $${ctx.medianHome.toLocaleString()} (USD equivalent). London's market is competitive; a 10-20% deposit is standard. As a US buyer without UK credit history, you may face higher mortgage rates initially — some buyers rent for 12-24 months to build UK credit before purchasing. Factor in Stamp Duty Land Tax (SDLT) and legal fees (~2-4% of purchase price).`;
        },
      },
      {
        label: 'Neighborhood research',
        detail: (ctx) =>
          `Before signing a lease in ${ctx.cityName}, research neighborhoods by Tube/Overground zone — Zone 1-2 commands a significant premium but cuts commute time. Explore areas like Shoreditch (tech cluster), Brixton, Peckham, or East London for a balance of cost and access. Use the TfL Journey Planner and Rightmove's commute-time filter. Short-term furnished accommodation in your target area for the first month is the most reliable way to validate a neighborhood before committing to a 12-month tenancy.`,
      },
    ],
  },
  {
    id: 'logistics',
    title: 'Logistics & Practical Steps',
    steps: [
      {
        label: 'International moving logistics',
        detail: (ctx) =>
          `For your move to ${ctx.cityName}: (1) Passport — ensure it is valid for the full duration of your planned UK stay; renew early if needed. (2) International shipping — get quotes from at least 3 international freight companies (sea freight takes 4-6 weeks; air freight is faster but costly). Declutter aggressively — ship only what is worth the cost. (3) Flights — book transatlantic flights (typically US East Coast → Heathrow) 4-8 weeks in advance. (4) Storage — consider keeping a US storage unit for the first 6 months until you confirm your London arrangements.`,
      },
      {
        label: 'UK arrival admin checklist',
        detail: (_ctx) =>
          `Key admin steps on or after arrival in the UK: (1) BRP (Biometric Residence Permit) — collect from the designated Post Office within 10 days of arrival; your visa letter will specify the location. (2) NHS registration — register with a local GP surgery through the NHS website; as a visa holder your access to NHS care depends on paying the Immigration Health Surcharge (IHS) as part of your visa application. (3) UK bank account — HSBC, Barclays, and Monzo all offer accounts to new UK residents; Monzo/Starling can be opened before arrival via app. (4) National Insurance Number (NI) — apply at your local DWP office or online once you have a UK address; required for employment. (5) USPS mail forwarding — set up international mail forwarding before you leave the US.`,
        sourceUrl: 'https://www.gov.uk/biometric-residence-permits',
      },
    ],
  },
  {
    id: 'visa',
    title: 'Visa & Immigration',
    steps: [
      {
        label: 'UK work visa pathway — Skilled Worker or Global Talent',
        detail: (_ctx) =>
          `The two primary UK work routes for a US professional: (1) Skilled Worker visa — requires a job offer from a UK employer with a Home Office-approved sponsorship licence. The general salary threshold is approximately £38,700/year (as of April 2024; confirm current figures at gov.uk). Application fees range approximately £719-£1,420 depending on visa duration (2024 rates; confirm current on gov.uk). Processing typically takes 3-8 weeks for an out-of-country application. (2) Global Talent visa — no job offer required; requires an endorsement from a designated body such as Tech Nation (for digital technology) or the British Academy. Suited for recognized leaders or emerging talent in their field. Both routes require a valid passport, biometric enrollment, and may require an English language test. This is informational only and not legal advice. Consult a licensed attorney who handles UK immigration matters for guidance specific to your situation. Potential Premium includes a full visa concierge with UK pathway comparison, eligibility screening, and document checklists.`,
        sourceUrl: 'https://www.gov.uk/skilled-worker-visa',
      },
    ],
  },
];

// Assign the UK template to the US.UK slot in the registry
ROADMAP_TEMPLATES.US.UK = US_TO_UK_TEMPLATE;
