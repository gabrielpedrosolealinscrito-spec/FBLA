// ─────────────────────────────────────────────────────────────────
// Potential — FX Rate Table (Phase 4, D-04)
// Hardcoded, sourced, dated FX rates for the four Phase-4 currencies.
// NO network/fetch — offline-only per demo constraint (V6).
//
// Source: ECB euro reference rates + exchangerates.org.uk (GBP/USD)
//   https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html
//   https://www.exchangerates.org.uk/GBP-USD-spot-exchange-rates-history-2026.html
//
// As of: 2026-06-01
//
// This file is the SINGLE source of truth imported by both the engine
// (financial model USD canonicalization) and the display layer (Plan 03 dual-currency).
// ─────────────────────────────────────────────────────────────────

/** Rate as-of date (ECB reference, 1 June 2026). D-04 dated stamp source. */
export const FX_AS_OF = "2026-06-01";

/**
 * Sourcing date for all salary/rent/tax datasets used in Phase 4.
 * SC#4: the "data as of [date]" display stamp MUST read this constant —
 * never inline a literal so the stamp can't drift from the actual sourcing date.
 * Value: 2026-06-01 (matches FX_AS_OF; both compiled from 1 June 2026 sources).
 */
export const DATA_AS_OF = "2026-06-01";

/**
 * FX rates: local-currency -> USD multiplier.
 * Multiply an amount in the keyed currency by the rate to get USD.
 *
 * Sources:
 *   EUR/USD 1.1646 -- ECB euro reference rate, 2026-06-01
 *   GBP/USD 1.347  -- exchangerates.org.uk 2026 avg (late-May range 1.337-1.351); confirmed
 *   CAD/USD 0.7242 -- ECB reference (USD/CAD 1.3809 inverted), 2026-06-01
 *   USD/USD 1      -- identity; included so toUSD is a no-op on the US path
 */
export const FX_RATES: Record<string, number> = {
  EUR: 1.1646, // ECB reference rate, 2026-06-01
  GBP: 1.347,  // exchangerates.org.uk 2026 avg, confirmed late-May range
  CAD: 0.7242, // ECB reference (USD/CAD 1.3809 inverted), 2026-06-01
  USD: 1,      // identity -- US path, no conversion needed
};

/**
 * Derive the local currency code from the city's country string.
 * Derives without adding a `currency` field to the frozen City type (D-03).
 *
 * @param country - Value of City.country (e.g. "UK", "Portugal", "Canada", "US")
 * @returns ISO 4217 currency code for FX_RATES lookup
 */
export function currencyForCountry(country: string): "EUR" | "GBP" | "CAD" | "USD" {
  switch (country) {
    case "UK":
      return "GBP";
    case "Portugal":
    case "Germany":
      return "EUR";
    case "Canada":
      return "CAD";
    default:
      return "USD";
  }
}

/**
 * Convert an amount in local currency to USD using the hardcoded FX table.
 * Returns the original amount if the currency is not in FX_RATES (safe fallback).
 *
 * @param amountLocal - Amount denominated in the given currency
 * @param currency    - ISO 4217 code (e.g. "GBP", "EUR", "CAD", "USD")
 * @returns Amount in USD
 */
export function toUSD(amountLocal: number, currency: string): number {
  const rate = FX_RATES[currency] ?? 1;
  return amountLocal * rate;
}
