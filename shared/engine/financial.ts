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

// ── Portugal Financial Model (pt-irs-2026) ───────────────────────────────────
// Standard-regime IRS + 11% employee Social Security (EUR). No US math.
// D-09: the NHR/IFICI 20%-flat newcomer regime is NOT applied — standard ~34% only;
// the IFICI upside is surfaced via the Plan 03 "i" tooltip, never baked into take-home.
//
// Sources:
//   Employee SS 11%: PwC Portugal Budget 2026
//     https://www.pwc.pt/en/pwcinforfisco/statebudget/pit-and-social-security.html
//   IRS 2026 brackets + dedução específica (greater of EUR4,462 or actual SS):
//     PwC Tax Summaries — Portugal PIT
//     https://taxsummaries.pwc.com/portugal/individual/taxes-on-personal-income
//   PT local salaries: nextleveljobs.eu Portugal SWE 2026
//
// Worked example (EUR45,000 gross, single, standard regime):
//   SS 11% = EUR4,950; dedução = max(EUR4,462, EUR4,950) = EUR4,950 -> taxable EUR40,050
//   IRS bracket-stack ~= EUR10,412; total (SS+IRS) ~= EUR15,362; net ~= EUR29,638/yr = EUR2,470/mo (~34.1%).

const PT_SS_RATE = 0.11;                // employee Social Security, flat (PwC PT Budget 2026)
const PT_SPECIFIC_DEDUCTION_MIN = 4462; // dedução específica floor (greater of this or actual SS)

// IRS 2026 progressive brackets on taxable income (marginal). Source: PwC Tax Summaries PT.
const PT_IRS_BRACKETS: Array<{ limit: number; rate: number }> = [
  { limit: 7703,     rate: 0.1325 },
  { limit: 11623,    rate: 0.165 },
  { limit: 16472,    rate: 0.22 },
  { limit: 21321,    rate: 0.25 },
  { limit: 27146,    rate: 0.32 },
  { limit: 39791,    rate: 0.355 },
  { limit: 51997,    rate: 0.435 },
  { limit: 81199,    rate: 0.45 },
  { limit: Infinity, rate: 0.48 },
];

function computePTIncomeTax(taxableIncome: number): number {
  let tax = 0;
  let prev = 0;
  for (const b of PT_IRS_BRACKETS) {
    if (taxableIncome <= prev) break;
    tax += (Math.min(taxableIncome, b.limit) - prev) * b.rate;
    prev = b.limit;
  }
  return tax;
}

// PT local salary dataset — sourced annual medians in EUR (nextleveljobs.eu 2026).
const PT_LOCAL_SALARIES: Record<string, number> = {
  'Software Engineer': 42000,    // nextleveljobs.eu PT SWE 2026 (EUR35-45k median; EUR45-60k senior)
  'Financial Analyst': 32000,    // est. PT finance/analyst median
  'Data Analyst':      28000,    // est. PT data analyst median
  'Product Manager':   40000,    // est. PT product manager median
  'Marketing Manager': 28000,    // est. PT marketing professional median
  'Nurse':             20000,    // est. PT nurse median
  'Teacher':           20000,    // est. PT teacher median
  'Accountant':        26000,    // est. PT accountant median
  'Sales Representative': 22000, // est. PT sales representative median
  'Operations Manager':   34000, // est. PT operations manager median
};
const PT_SALARY_FALLBACK_EUR = 22000; // conservative PT median professional salary (EUR)

const PT_FINANCIAL_MODEL: FinancialModel = {
  id: 'pt-irs-2026',
  // Standard-regime IRS + 11% SS (EUR). No US math; NO IFICI/NHR flat rate (D-09).
  computeTax(grossIncome: number, _stateRate: number): number {
    const ss = Math.max(0, grossIncome) * PT_SS_RATE;
    const deduction = Math.max(PT_SPECIFIC_DEDUCTION_MIN, ss);
    const taxable = Math.max(0, grossIncome - deduction);
    return ss + computePTIncomeTax(taxable);
  },
  computeExpenses(profile: Profile, city: City): ExpenseBreakdown {
    return computeUSExpenses(profile, city);
  },
  computeSalary(profile: Profile, _city: City): number {
    return PT_LOCAL_SALARIES[profile.profession] ?? PT_SALARY_FALLBACK_EUR;
  },
};

// ── Germany Financial Model (de-2026) ────────────────────────────────────────
// Progressive income tax (Grundfreibetrag + rising marginal 14%->42%->45%) on income
// net of social security, plus ~20.6% employee social security (EUR). No US math.
// Soli NOT applied (largely abolished for typical employees — surfaced via tooltip only).
//
// Sources:
//   Grundfreibetrag EUR12,348 + progressive curve (14% from EUR12,348 -> 42% at EUR68,481
//     -> 45% above EUR277,826): taxravens Germany 2026
//   Employee SS ~20.6% (pension 9.3% + unemployment 1.3% [cap EUR101,400];
//     health 7.3%+~1.25% + care ~2.3% [cap EUR69,750]): deutsche-flagge 2026
//   DE local salaries: theemployerofrecord SWE by country 2026
//
// Worked example (EUR65,000 gross, single, Steuerklasse I):
//   SS ~= EUR13,943 (~21.45%); taxable (gross - SS) ~= EUR51,057; income tax ~= EUR9,157
//   total ~= EUR23,100; net ~= EUR41,900/yr ~= EUR3,492/mo (within RESEARCH EUR3,300-3,400 ±7%).
//   Income tax uses a piecewise-linear approximation of the German polynomial (RESEARCH-sanctioned, ±7%).

const DE_GRUNDFREIBETRAG = 12348;   // tax-free allowance, 2026 (taxravens)
const DE_TOP_OF_RISING = 68481;     // 42% marginal reached here (taxravens)
const DE_RATE_START = 0.14;         // marginal at Grundfreibetrag
const DE_RATE_TOP = 0.42;           // marginal at DE_TOP_OF_RISING
const DE_45_THRESHOLD = 277826;     // 45% marginal above here (taxravens)
const DE_RATE_RICH = 0.45;
// Employee social-security rates + contribution-assessment ceilings (deutsche-flagge 2026)
const DE_SS_PENSION_UNEMP = 0.106;  // pension 9.3% + unemployment 1.3%
const DE_SS_PENSION_UNEMP_CAP = 101400;
const DE_SS_HEALTH_CARE = 0.1085;   // health 7.3% + Zusatzbeitrag ~1.25% + long-term care ~2.3%
const DE_SS_HEALTH_CARE_CAP = 69750;

function computeDESocialSecurity(grossIncome: number): number {
  const g = Math.max(0, grossIncome);
  return Math.min(g, DE_SS_PENSION_UNEMP_CAP) * DE_SS_PENSION_UNEMP
       + Math.min(g, DE_SS_HEALTH_CARE_CAP) * DE_SS_HEALTH_CARE;
}

// Piecewise-linear marginal-rate approximation of the German income-tax curve.
function computeDEIncomeTax(taxableIncome: number): number {
  const t = Math.max(0, taxableIncome);
  if (t <= DE_GRUNDFREIBETRAG) return 0;
  const risingWidth = DE_TOP_OF_RISING - DE_GRUNDFREIBETRAG;
  if (t <= DE_TOP_OF_RISING) {
    const w = t - DE_GRUNDFREIBETRAG;
    const slope = (DE_RATE_TOP - DE_RATE_START) / risingWidth;
    return DE_RATE_START * w + 0.5 * slope * w * w;
  }
  const risingTax = DE_RATE_START * risingWidth + 0.5 * (DE_RATE_TOP - DE_RATE_START) * risingWidth;
  if (t <= DE_45_THRESHOLD) {
    return risingTax + (t - DE_TOP_OF_RISING) * DE_RATE_TOP;
  }
  return risingTax
       + (DE_45_THRESHOLD - DE_TOP_OF_RISING) * DE_RATE_TOP
       + (t - DE_45_THRESHOLD) * DE_RATE_RICH;
}

// DE local salary dataset — sourced annual medians in EUR (theemployerofrecord 2026).
const DE_LOCAL_SALARIES: Record<string, number> = {
  'Software Engineer': 65000,    // theemployerofrecord DE SWE 2026 (EUR50-80k)
  'Financial Analyst': 60000,    // est. DE finance/analyst median
  'Data Analyst':      55000,    // est. DE data analyst median
  'Product Manager':   72000,    // est. DE product manager median
  'Marketing Manager': 52000,    // est. DE marketing professional median
  'Nurse':             40000,    // est. DE nurse median
  'Teacher':           50000,    // est. DE teacher median
  'Accountant':        55000,    // est. DE accountant median
  'Sales Representative': 48000, // est. DE sales representative median
  'Operations Manager':   58000, // est. DE operations manager median
};
const DE_SALARY_FALLBACK_EUR = 48000; // conservative DE median professional salary (EUR)

const DE_FINANCIAL_MODEL: FinancialModel = {
  id: 'de-2026',
  computeTax(grossIncome: number, _stateRate: number): number {
    const ss = computeDESocialSecurity(grossIncome);
    // SS is broadly deductible for income-tax purposes (Vorsorgeaufwendungen) — approximated as fully deductible.
    const taxable = Math.max(0, grossIncome - ss);
    return ss + computeDEIncomeTax(taxable);
  },
  computeExpenses(profile: Profile, city: City): ExpenseBreakdown {
    return computeUSExpenses(profile, city);
  },
  computeSalary(profile: Profile, _city: City): number {
    return DE_LOCAL_SALARIES[profile.profession] ?? DE_SALARY_FALLBACK_EUR;
  },
};

// ── Canada (Ontario) Financial Model (ca-on-2026) ────────────────────────────
// Federal brackets + Ontario provincial (+ surtax + Health Premium) + CPP/CPP2 + EI (CAD).
// No US math.
//
// Sources:
//   Federal 2026 brackets + BPA C$16,452: Manulife 2026 tax rate card / CRA
//   Ontario brackets + surtax + Health Premium; CPP 5.95% (cap C$74,600, max C$4,230.45),
//     CPP2 4% (C$74,600-85,000, max C$416), EI 1.63% (cap C$68,900, max C$1,123.07):
//     CRA T4032-ON 2026
//   CA local salaries: theemployerofrecord 2026
//
// Worked example (C$95,000 gross, single, Toronto):
//   CPP+CPP2 ~= C$4,646; EI ~= C$1,123; federal ~= C$13,368; ON tax+surtax+health ~= C$6,665
//   total ~= C$25,802; net ~= C$69,198/yr ~= C$5,766/mo (~27%).
//   [VERIFY] Ontario surtax / Health Premium precision before the pitch (RESEARCH Gap #6).

const CA_FED_BRACKETS: Array<{ limit: number; rate: number }> = [
  { limit: 58523,    rate: 0.14 },
  { limit: 117045,   rate: 0.205 },
  { limit: 181440,   rate: 0.26 },
  { limit: 258482,   rate: 0.29 },
  { limit: Infinity, rate: 0.33 },
];
const CA_FED_BPA = 16452;     // federal Basic Personal Amount 2026 (Manulife/CRA)
const CA_FED_LOW_RATE = 0.14; // BPA credit valued at the lowest federal rate

const ON_BRACKETS: Array<{ limit: number; rate: number }> = [
  { limit: 52886,    rate: 0.0505 },
  { limit: 105775,   rate: 0.0915 },
  { limit: 150000,   rate: 0.1116 },
  { limit: 220000,   rate: 0.1216 },
  { limit: Infinity, rate: 0.1316 },
];
const ON_BPA = 12747;       // Ontario Basic Personal Amount 2026 (CRA T4032-ON)
const ON_LOW_RATE = 0.0505;
const ON_SURTAX_T1 = 5710;  // 20% Ontario surtax over this basic ON tax (CRA T4032-ON 2026)
const ON_SURTAX_T2 = 7307;  // additional 16% over this
const CA_CPP_MAX = 4230.45; // CPP max contribution 2026
const CA_CPP2_MAX = 416;    // CPP2 max contribution 2026
const CA_EI_MAX = 1123.07;  // EI max contribution 2026

function caBracketTax(income: number, brackets: Array<{ limit: number; rate: number }>): number {
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    if (income <= prev) break;
    tax += (Math.min(income, b.limit) - prev) * b.rate;
    prev = b.limit;
  }
  return tax;
}

function caFederalTax(income: number): number {
  const g = Math.max(0, income);
  return Math.max(0, caBracketTax(g, CA_FED_BRACKETS) - CA_FED_BPA * CA_FED_LOW_RATE);
}

function onHealthPremium(income: number): number {
  // Stepped approximation of the Ontario Health Premium (CRA T4032-ON). [VERIFY]
  if (income <= 20000) return 0;
  if (income <= 36000) return 300;
  if (income <= 48000) return 450;
  if (income <= 200000) return 750;
  return 900;
}

function onProvincialTax(income: number): number {
  const g = Math.max(0, income);
  const basic = Math.max(0, caBracketTax(g, ON_BRACKETS) - ON_BPA * ON_LOW_RATE);
  const surtax = Math.max(0, basic - ON_SURTAX_T1) * 0.20 + Math.max(0, basic - ON_SURTAX_T2) * 0.36;
  return basic + surtax + onHealthPremium(g);
}

function caPayrollContrib(income: number): number {
  const g = Math.max(0, income);
  // CPP 5.95% on 3,500-74,600 (max 4,230.45); CPP2 4% on 74,600-85,000 (max 416)
  const cpp = Math.min(CA_CPP_MAX, Math.max(0, Math.min(g, 74600) - 3500) * 0.0595);
  const cpp2 = Math.min(CA_CPP2_MAX, Math.max(0, Math.min(g, 85000) - 74600) * 0.04);
  // EI 1.63% on income up to 68,900 (max 1,123.07)
  const ei = Math.min(CA_EI_MAX, Math.min(g, 68900) * 0.0163);
  return cpp + cpp2 + ei;
}

// CA local salary dataset — sourced annual medians in CAD (theemployerofrecord 2026).
const CA_LOCAL_SALARIES: Record<string, number> = {
  'Software Engineer': 95000,    // theemployerofrecord CA SWE 2026 (avg ~C$90-100k)
  'Financial Analyst': 80000,    // est. CA finance/analyst median
  'Data Analyst':      75000,    // est. CA data analyst median
  'Product Manager':   105000,   // est. CA product manager median
  'Marketing Manager': 75000,    // est. CA marketing professional median
  'Nurse':             80000,    // est. CA nurse median
  'Teacher':           70000,    // est. CA teacher median
  'Accountant':        72000,    // est. CA accountant median
  'Sales Representative': 65000, // est. CA sales representative median
  'Operations Manager':   85000, // est. CA operations manager median
};
const CA_SALARY_FALLBACK_CAD = 65000; // conservative CA median professional salary (CAD)

const CA_FINANCIAL_MODEL: FinancialModel = {
  id: 'ca-on-2026',
  computeTax(grossIncome: number, _stateRate: number): number {
    return caFederalTax(grossIncome)
         + onProvincialTax(grossIncome)
         + caPayrollContrib(grossIncome);
  },
  computeExpenses(profile: Profile, city: City): ExpenseBreakdown {
    return computeUSExpenses(profile, city);
  },
  computeSalary(profile: Profile, _city: City): number {
    return CA_LOCAL_SALARIES[profile.profession] ?? CA_SALARY_FALLBACK_CAD;
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
  'pt-irs-2026': PT_FINANCIAL_MODEL,
  'de-2026': DE_FINANCIAL_MODEL,
  'ca-on-2026': CA_FINANCIAL_MODEL,
};
