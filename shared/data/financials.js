// ─────────────────────────────────────────────────────────────────
// Potential — Financial Model (single source of truth)
// Mirrors pitch/financials/model.csv (24-month base case) and the
// headline metrics in pitch/financials/summary.md.
//
// Consumed by:
//   • the in-app Financials screen (src/screens/...)
//   • the pitch deck visuals (Slides 9 & 10 — see pitch/deck/deck-outline.md)
//
// If model.csv changes, update MONTHLY[] here and the derived metrics
// below stay re-derivable in ~60 seconds (D-08). Plain .js — shared/data
// is backend-owned, no TS annotations yet.
// ─────────────────────────────────────────────────────────────────

// 24-month P&L. One row per month. Values mirror model.csv exactly.
// rev   = total revenue that month (all tiers, one-time purchases)
// cogs  = API cost of goods sold (runs × $0.06)
// mkt   = marketing spend that month
// net   = monthly net income (rev − cogs − hosting − mkt − startup in M1)
// cum   = cumulative net (running sum of net) — break-even = first cum > 0
export const MONTHLY = [
  // month, freeUsers, paidUsers, rev,     cogs,  mkt,   net,      cum
  { m: 1,  free: 500,  paid: 25,  rev: 221.75,  cogs: 3.00,  mkt: 50,  net: -851.25, cum: -851.25 },
  { m: 2,  free: 700,  paid: 35,  rev: 287.65,  cogs: 4.02,  mkt: 50,  net: 213.63,  cum: -637.62 },
  { m: 3,  free: 900,  paid: 45,  rev: 391.55,  cogs: 5.34,  mkt: 50,  net: 316.21,  cum: -321.41 },
  { m: 4,  free: 1100, paid: 55,  rev: 457.45,  cogs: 6.36,  mkt: 100, net: 331.09,  cum: 9.68 },
  { m: 5,  free: 1300, paid: 65,  rev: 561.35,  cogs: 7.68,  mkt: 100, net: 433.67,  cum: 443.35 },
  { m: 6,  free: 1500, paid: 75,  rev: 627.25,  cogs: 8.70,  mkt: 100, net: 498.55,  cum: 941.90 },
  { m: 7,  free: 1750, paid: 123, rev: 1030.77, cogs: 14.28, mkt: 200, net: 796.49,  cum: 1738.39 },
  { m: 8,  free: 2000, paid: 140, rev: 1188.60, cogs: 16.38, mkt: 200, net: 952.22,  cum: 2690.61 },
  { m: 9,  free: 2250, paid: 158, rev: 1347.42, cogs: 18.54, mkt: 200, net: 1108.88, cum: 3799.49 },
  { m: 10, free: 2500, paid: 175, rev: 1476.25, cogs: 20.40, mkt: 200, net: 1235.85, cum: 5035.34 },
  { m: 11, free: 2750, paid: 193, rev: 1644.07, cogs: 22.62, mkt: 200, net: 1401.45, cum: 6436.79 },
  { m: 12, free: 3000, paid: 210, rev: 1772.90, cogs: 24.48, mkt: 200, net: 1528.42, cum: 7965.21 },
  { m: 13, free: 3150, paid: 252, rev: 2143.48, cogs: 29.52, mkt: 350, net: 1743.96, cum: 9709.17 },
  { m: 14, free: 3300, paid: 264, rev: 2249.36, cogs: 30.96, mkt: 350, net: 1848.40, cum: 11557.57 },
  { m: 15, free: 3450, paid: 276, rev: 2335.24, cogs: 32.22, mkt: 350, net: 1933.02, cum: 13490.59 },
  { m: 16, free: 3600, paid: 288, rev: 2441.12, cogs: 33.66, mkt: 350, net: 2037.46, cum: 15528.05 },
  { m: 17, free: 3750, paid: 300, rev: 2547.00, cogs: 35.10, mkt: 350, net: 2141.90, cum: 17669.95 },
  { m: 18, free: 3900, paid: 312, rev: 2652.88, cogs: 36.54, mkt: 350, net: 2246.34, cum: 19916.29 },
  { m: 19, free: 4050, paid: 324, rev: 2758.76, cogs: 37.98, mkt: 500, net: 2200.78, cum: 22117.07 },
  { m: 20, free: 4200, paid: 336, rev: 2844.64, cogs: 39.24, mkt: 500, net: 2285.40, cum: 24402.47 },
  { m: 21, free: 4350, paid: 348, rev: 2950.52, cogs: 40.68, mkt: 500, net: 2389.84, cum: 26792.31 },
  { m: 22, free: 4500, paid: 360, rev: 3056.40, cogs: 42.12, mkt: 500, net: 2494.28, cum: 29286.59 },
  { m: 23, free: 4650, paid: 372, rev: 3162.28, cogs: 43.56, mkt: 500, net: 2598.72, cum: 31885.31 },
  { m: 24, free: 4800, paid: 384, rev: 3268.16, cogs: 45.00, mkt: 500, net: 2703.16, cum: 34588.47 },
];

// Pricing tiers (D-05 — LOCKED). See business-model.md §2.
export const TIERS = [
  { id: 'basic',   name: 'Basic',   price: 0.99,  runs: '1 run',         mixPct: 50, ltv: 1.30,  margin: 94 },
  { id: 'plus',    name: 'Plus',    price: 9.99,  runs: '3 runs',        mixPct: 35, ltv: 14,    margin: 99, badge: 'Most popular' },
  { id: 'premium', name: 'Premium', price: 29.99, runs: 'Unlimited',     mixPct: 15, ltv: 45,    margin: 99 },
];

// Conversion ramp (assumptions A-1..A-3). Free → any paid purchase.
export const CONVERSION_RAMP = [
  { months: '1-6',   rate: 5, basis: 'SaaS freemium floor (FirstPageSage/Userpilot 2-5%)' },
  { months: '7-12',  rate: 7, basis: 'SEO content ramp lifts higher-intent traffic' },
  { months: '13-24', rate: 8, basis: 'Established brand + community; still below 8-12% ceiling' },
];

// Headline metrics for the deck slides and the in-app summary band.
// Each carries its source so it survives judge Q&A.
export const METRICS = {
  breakEvenMonth: 4,                 // first month cum > 0 (model.csv: +$9.68)
  breakEvenCum: 9.68,
  breakEvenPaidUsers: 160,           // cumulative paid users at M4
  startupCost: 1000,                 // one-time (A-11)
  hostingMonthly: 20,                // Vercel Pro (A-8)
  apiCogsPerRun: 0.06,               // Haiku + 1 web search (A-6, CITED)
  cogsPctOfRevenue: 1.4,             // API COGS as % of revenue (~<2%)
  grossMarginPlusRun: 98,            // $3.33 rev / $0.06 cogs per Plus run (D-11)
  blendedRevPerPaidUser: [10, 12],   // 50/35/15 tier mix
  blendedLtv: [13, 15],
  blendedCac: [8, 12],
  ltvCacRatio: 1.4,                  // intentionally lean — one-time model defense
  finalCum: 34588.47,                // cumulative net at M24
};

// ── Derived helpers (keep visuals dumb; compute here) ──────────────

/** Break-even row, or undefined if model never turns positive. */
export const breakEvenRow = () => MONTHLY.find((r) => r.cum >= 0);

/** Min/max of any numeric field across all months (for chart scaling). */
export const extent = (key) => {
  const vals = MONTHLY.map((r) => r[key]);
  return { min: Math.min(...vals), max: Math.max(...vals) };
};

/** LTV:CAC ratio as a number, using midpoints of the blended ranges. */
export const ltvCacMidpoint = () => {
  const ltv = (METRICS.blendedLtv[0] + METRICS.blendedLtv[1]) / 2;
  const cac = (METRICS.blendedCac[0] + METRICS.blendedCac[1]) / 2;
  return ltv / cac;
};
