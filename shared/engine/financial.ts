// ─────────────────────────────────────────────────────────────────
// Potential — US Financial Model (Phase 3, FIN-01) + Phase 4 Country Models
// Pure TypeScript: TY2026 progressive federal brackets + state + FICA + cost-indexed expenses.
// Pluggable via FinancialModel interface; registered in FINANCIAL_MODELS for Phase 4 extension.
//
// Sources:
//   Federal brackets: IRS TY2026 inflation adjustments (OBBBA-amended)
//     https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026
//   Tax Foundation 2026 brackets:
//     https://taxfoundation.org/data/all/federal/2026-tax-brackets/
//   FICA rates: IRS Topic 751
//     https://www.irs.gov/taxtopics/tc751
//
// Phase 4 additions (uk-2026):
//   UK income tax bands + NI: GOV.UK rates & thresholds 2025-26
//     https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026
//   UK personal allowance: HoC Library CBP-10237
//     https://commonslibrary.parliament.uk/research-briefings/cbp-10237/
//   UK local salaries: theemployerofrecord 2026
//     https://theemployerofrecord.com/blog/services/average-software-engineer-salary-by-country
// ─────────────────────────────────────────────────────────────────

import type { Profile, City, ExpenseBreakdown } from '../types.js';
import { BASE_SALARIES } from '../data/constants.js';

// ── Federal Tax (TY2026, single filer) ──────────────────────────

// Standard deduction for single filer, TY2026 (OBBBA-amended)
// Source: IRS TY2026 adjustments + Tax Foundation
const STANDARD_DEDUCTION_SINGLE_2026 = 16100;

// TY2026 single-filer progressive brackets (OBBBA-amended, settled July 2025)
// Source: IRS newsroom + Tax Foundation https://taxfoundation.org/data/all/federal/2026-tax-brackets/
// Each entry: taxable income UP TO `limit` (exclusive) at `rate`.
// Infinity sentinel marks the top bracket (no upper bound).
const FEDERAL_BRACKETS_2026: Array<{ limit: number; rate: number }> = [
  { limit: 12400,    rate: 0.10 },
  { limit: 50400,    rate: 0.12 },
  { limit: 105700,   rate: 0.22 },
  { limit: 201775,   rate: 0.24 },
  { limit: 256225,   rate: 0.32 },
  { limit: 640600,   rate: 0.35 },
  { limit: Infinity, rate: 0.37 },
];

/**
 * Compute federal income tax for a single filer (TY2026 brackets + standard deduction).
 * Applies progressive bracket arithmetic; never returns a negative value.
 *
 * @param grossIncome - Annual gross income before deductions
 * @returns Annual federal income tax owed
 */
export function computeFederalTax(grossIncome: number): number {
  // Guard: negative gross income treated as zero (T-3-05 input validation)
  const taxableIncome = Math.max(0, grossIncome - STANDARD_DEDUCTION_SINGLE_2026);
  let tax = 0;
  let prev = 0;
  for (const bracket of FEDERAL_BRACKETS_2026) {
    if (taxableIncome <= prev) break;
    const inBracket = Math.min(taxableIncome, bracket.limit) - prev;
    tax += inBracket * bracket.rate;
    prev = bracket.limit;
  }
  return tax;
}

/**
 * Compute total US annual tax burden: federal brackets + flat state % + FICA.
 *
 * Simplifications (documented per D-08):
 * - FICA applied as flat 7.65% to all income; SS wage cap ($184,500) deferred.
 *   For the demo salary range ($35K-$120K), the cap is rarely hit -- error is minimal.
 * - Single-filer brackets applied to household income (including partner income if present).
 *
 * @param grossIncome - Annual gross income (household total)
 * @param stateRate   - Flat state income tax rate as a percentage (e.g. 9.85 for 9.85%)
 * @returns Total annual tax owed (federal + state + FICA)
 */
export function computeUSTax(grossIncome: number, stateRate: number): number {
  const federal = computeFederalTax(grossIncome);
  const state = grossIncome * (stateRate / 100);
  // FICA: Social Security 6.2% + Medicare 1.45% = 7.65% flat
  const fica = grossIncome * 0.0765;
  return federal + state + fica;
}

/**
 * Compute city-adjusted salary for a given profession (US path only).
 * Uses BASE_SALARIES[profession] as the national baseline, scaled by costIndex/100.
 * International models use their own computeSalary via the FinancialModel interface (D-01).
 *
 * @param profile - User profile (profession used)
 * @param city    - Target city (costIndex used as US-avg multiplier)
 * @returns Estimated annual salary, rounded to nearest dollar
 */
export function computeSalary(profile: Profile, city: City): number {
  const base = (BASE_SALARIES as Record<string, number>)[profile.profession] ?? 55000;
  return Math.round(base * (city.costIndex / 100));
}

/**
 * Compute monthly cost-indexed expense breakdown.
 * Ported from prototype getExpenses() (PotentialApp.jsx lines 88-101).
 * All line items scaled by `m = costIndex / 100` (US-national-average multiplier).
 *
 * International models reuse this for cost-indexed expenses -- cities.ts stores medianRent
 * in USD-canonical values (e.g. London medianRent = $3,186 USD), so this produces
 * correct USD expense totals for international cities without additional conversion.
 *
 * Input validation (T-3-04 NaN propagation guard, V5):
 *   If city.costIndex <= 0, falls back to idx=1 to prevent NaN propagation.
 *
 * @param profile - User profile (housing, dependents, pets, debt)
 * @param city    - Target city (costIndex, medianRent, medianHome)
 * @returns Itemized monthly expense breakdown
 */
export function computeUSExpenses(profile: Profile, city: City): ExpenseBreakdown {
  // T-3-04 guard: costIndex=0 or negative would produce NaN. Fall back to costIndex=1.
  const idx = city.costIndex > 0 ? city.costIndex : 1;
  const m = idx / 100;

  const rent = profile.housing === 'rent'
    ? city.medianRent
    : Math.round(city.medianHome * 0.006);
  const food = Math.round((profile.hasDependents ? 600 + profile.numDependents * 200 : 400) * m);
  const transport = Math.round(250 * m);
  const utilities = Math.round(160 * m);
  const insurance = Math.round(350 * m);
  const personal = Math.round(300 * m);
  const childcare = profile.hasDependents ? Math.round(800 * profile.numDependents * m) : 0;
  const pets = profile.hasPets ? Math.round(100 * m) : 0;
  const debtPay = Math.round(profile.debt * 0.01);
  const total = rent + food + transport + utilities + insurance + personal + childcare + pets + debtPay;

  return { rent, food, transport, utilities, insurance, personal, childcare, pets, debtPay, total };
}

// ── FinancialModel interface + registry ────────────────────────────────────────

/**
 * Pluggable financial model interface.
 * Phase 4 appends country models (UK, Portugal, Germany, Canada) to FINANCIAL_MODELS
 * without touching the US spine.
 *
 * Phase 4 extension: computeSalary added so each model owns its salary logic (D-01 option A).
 * US model delegates to the standalone computeSalary(); country models return sourced local medians.
 */
export interface FinancialModel {
  /** Matches City.financialModelId */
  id: string;
  /** Returns total annual tax for a given gross income and state/country rate */
  computeTax(grossIncome: number, stateRate: number): number;
  /** Returns itemized monthly expense breakdown */
  computeExpenses(profile: Profile, city: City): ExpenseBreakdown;
  /**
   * Returns annual gross salary in LOCAL currency for a non-remote mover (D-01, Phase 4).
   * US model: delegates to BASE_SALARIES x costIndex (existing computeSalary).
   * Country models: return sourced local median by profession (D-01, FIN-02).
   * Caller (buildRawResult) handles USD canonicalization via fx.ts toUSD for non-US cities.
   */
  computeSalary(profile: Profile, city: City): number;
}

/** US financial model -- registered as financialModelId = "us" */
export const US_FINANCIAL_MODEL: FinancialModel = {
  id: 'us',
  computeTax: computeUSTax,
  computeExpenses: computeUSExpenses,
  computeSalary: computeSalary,
};

// ── UK Financial Model (uk-2026) ─────────────────────────────────────────────
// Progressive UK income tax bands + employee National Insurance (2025-26).
// No US math: does NOT call computeFederalTax, computeUSTax, or use US brackets/FICA.
//
// Sources:
//   Income tax bands: GOV.UK rates & thresholds 2025-26
//     https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026
//   Personal allowance £12,570: HoC Library CBP-10237
//     https://commonslibrary.parliament.uk/research-briefings/cbp-10237/
//   Employee NI: GOV.UK rates & thresholds 2025-26 (8% £12,570-£50,270; 2% above)
//
// Worked example (£60,000 gross, single):
//   Income tax: 20% x £37,700 (£12,571-50,270) = £7,540
//               40% x £9,730 (£50,271-60,000) = £3,892
//               Total income tax = £11,432
//   Employee NI: 8% x £37,700 = £3,016; 2% x £9,730 = £195; Total NI = £3,211
//   Total tax burden: £14,643 / Net: £45,357/yr = £3,780/mo (~24.4% effective burden)
//
// NHR/IFICI and other special regimes are NOT in scope (D-09); standard resident rates only.
// computeExpenses delegates to computeUSExpenses -- cities.ts stores medianRent in USD.

// UK personal allowance, 2025-26
// Source: HoC Library CBP-10237 https://commonslibrary.parliament.uk/research-briefings/cbp-10237/
const UK_PERSONAL_ALLOWANCE = 12570;

// UK employee NI thresholds, 2025-26 (annual equivalents £242/wk and £967/wk)
// Source: GOV.UK rates & thresholds 2025-26
const UK_NI_PRIMARY_THRESHOLD = 12570;
const UK_NI_UPPER_EARNINGS_LIMIT = 50270;

/**
 * Compute UK income tax using progressive bands (no US math).
 * Personal allowance tapering (£100k-£125,140) not applied -- well below that range for app users.
 * Source: GOV.UK rates & thresholds 2025-26
 */
function computeUKIncomeTax(grossIncome: number): number {
  const abovePA = Math.max(0, grossIncome - UK_PERSONAL_ALLOWANCE);
  let tax = 0;
  // Basic rate 20%: income from PA to £50,270 (band width £37,700)
  const basicBandWidth = 50270 - UK_PERSONAL_ALLOWANCE; // £37,700
  const inBasicBand = Math.min(abovePA, basicBandWidth);
  tax += inBasicBand * 0.20;
  // Higher rate 40%: income from £50,270 to £125,140
  const inHigherBand = Math.min(Math.max(0, abovePA - basicBandWidth), 125140 - 50270);
  tax += inHigherBand * 0.40;
  // Additional rate 45%: income above £125,140
  const additionalThresholdAbovePA = 125140 - UK_PERSONAL_ALLOWANCE;
  const inAdditionalBand = Math.max(0, abovePA - additionalThresholdAbovePA);
  tax += inAdditionalBand * 0.45;
  return tax;
}

/**
 * Compute employee National Insurance.
 * 8% between Primary Threshold and Upper Earnings Limit; 2% above UEL.
 * Source: GOV.UK rates & thresholds 2025-26
 */
function computeUKNI(grossIncome: number): number {
  if (grossIncome <= UK_NI_PRIMARY_THRESHOLD) return 0;
  const inMainBand = Math.min(grossIncome, UK_NI_UPPER_EARNINGS_LIMIT) - UK_NI_PRIMARY_THRESHOLD;
  const aboveUEL = Math.max(0, grossIncome - UK_NI_UPPER_EARNINGS_LIMIT);
  return inMainBand * 0.08 + aboveUEL * 0.02;
}

// UK local salary dataset -- sourced annual medians in GBP for non-remote movers (D-01, FIN-02).
// Source: theemployerofrecord.com SWE salary by country 2026
//   https://theemployerofrecord.com/blog/services/average-software-engineer-salary-by-country
// Applied only on non-remote path (D-02); remote movers keep profile.income (USD).
const UK_LOCAL_SALARIES: Record<string, number> = {
  'Software Engineer': 55000,    // Source: theemployerofrecord 2026 UK SWE range £45k-£80k; median ~£55k
  'Financial Analyst': 55000,    // Source: estimated UK median finance/analyst £50k-£70k range
  'Data Analyst':      50000,    // Source: estimated UK median data analyst £40k-£60k range
  'Product Manager':   65000,    // Source: estimated UK median product manager £55k-£85k range
  'Marketing Manager': 45000,    // Source: estimated UK median marketing professional £35k-£55k range
  'Nurse':             38000,    // Source: NHS band 5-7 UK nurse salary ~£28k-£43k; midpoint ~£38k
  'Teacher':           35000,    // Source: UK teacher pay scale (main/upper) ~£30k-£47k range
  'Accountant':        50000,    // Source: estimated UK median accountant £40k-£60k range
  'Sales Representative': 38000, // Source: estimated UK median sales representative £30k-£50k range
  'Operations Manager':   48000, // Source: estimated UK median operations manager £35k-£55k range
};

/** Fallback for professions not in UK_LOCAL_SALARIES: conservative UK median professional salary (GBP) */
const UK_SALARY_FALLBACK_GBP = 45000;

/** UK financial model -- registered as financialModelId = "uk-2026" */
const UK_FINANCIAL_MODEL: FinancialModel = {
  id: 'uk-2026',

  /**
   * UK total annual tax: income tax bands + employee National Insurance (GBP).
   * Does NOT use computeFederalTax, computeUSTax, or US FICA (V2 no-US-math invariant).
   * _stateRate accepted for interface compatibility but unused (UK has no "state" tax layer).
   */
  computeTax(grossIncome: number, _stateRate: number): number {
    return computeUKIncomeTax(grossIncome) + computeUKNI(grossIncome);
  },

  /**
   * Expense breakdown using cost-indexed USD expenses.
   * Delegates to computeUSExpenses because cities.ts stores medianRent in USD.
   * London medianRent = $3,186 USD (£2,367 x 1.347 GBP/USD); expense structure is USD-canonical.
   */
  computeExpenses(profile: Profile, city: City): ExpenseBreakdown {
    return computeUSExpenses(profile, city);
  },

  /**
   * Annual gross salary in GBP for a non-remote mover to a UK city.
   * Returns sourced UK local median by profession (not BASE_SALARIES x costIndex -- D-01).
   * Caller (buildRawResult, index.ts) converts GBP -> USD via toUSD before MatchResult.
   */
  computeSalary(profile: Profile, _city: City): number {
    return UK_LOCAL_SALARIES[profile.profession] ?? UK_SALARY_FALLBACK_GBP;
  },
};

/**
 * Registry of financial models keyed by financialModelId.
 * Phase 4 adds country models here without touching US spine:
 *   "uk-2026": UK_FINANCIAL_MODEL (this plan)
 *   "pt-irs-2026", "de-2026", "ca-on-2026": Plans 02-04
 */
export const FINANCIAL_MODELS: Record<string, FinancialModel> = {
  us: US_FINANCIAL_MODEL,
  'uk-2026': UK_FINANCIAL_MODEL,
};
