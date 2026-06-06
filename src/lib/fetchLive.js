// src/lib/fetchLive.js
// Client-side fetch + golden-path fallback for live AI data.
// Pure async function — no React, importable by both app and tests.
//
// FOUND-04 / LIVE-04: on ANY failure (network error, non-200, AbortError, timeout,
// JSON parse failure) resolves to the bundled golden-path items for the city+category.
// Never resolves to undefined or "coming_soon".
//
// City-key contract: city.name is the FULL string ("Austin, TX" / "London, UK").
// That exact string is the POST body cityName AND the goldenPath lookup key.
// Do NOT strip the state/country suffix.

import goldenPath from '../../data/golden-path/demo-results.json';

// 20s timeout — web_search at max_uses:3 can take 8-20s (Pitfall 2: 7s always aborts live path).
const LIVE_TIMEOUT_MS = 20000;

/**
 * Fetch live AI data for a city+category from /api/live.
 * Falls back to the bundled golden-path cache on any failure (LIVE-04).
 *
 * @param {object} city - City object with a `name` property (full "City, ST" string)
 * @param {string} category - "jobs" | "housing_rent" | "housing_buy" | "dayinlife"
 * @param {string} profession - User's profession string (forwarded verbatim to proxy)
 * @returns {Promise<Array|string>} Resolves to items array (jobs/housing) or string (dayinlife)
 */
export async function fetchCategoryLive(city, category, profession) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LIVE_TIMEOUT_MS);

  try {
    const res = await fetch('/api/live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        cityName: city.name,
        profession,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      // Non-200 response — fall through to golden-path
      return goldenPath[category]?.[city.name] ?? [];
    }

    const data = await res.json();
    // A 200 with a malformed body (missing/null items) must not produce a blank
    // panel — honor the never-undefined contract and fall through to golden-path.
    if (data == null || data.items == null) {
      return goldenPath[category]?.[city.name] ?? [];
    }
    return data.items;
  } catch {
    // Network error, AbortError, timeout, or JSON parse failure — serve golden-path
    return goldenPath[category]?.[city.name] ?? [];
  } finally {
    clearTimeout(timeoutId);
  }
}
