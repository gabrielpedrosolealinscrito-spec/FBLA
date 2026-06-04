// ─────────────────────────────────────────────────────────────────
// Potential — US City Dataset (Phase 3, D-09/D-10/D-11/D-12)
// 28 curated US cities (+1 international: London). Typed to shared/types.ts City interface.
// 22 original (Phase 3) + 6 major anchors added 2026-06-03: LA, SF, Boston, DC, Houston, Philadelphia.
//
// costIndex: US-national-average=100 scale.
//   Derived from Numbeo (NYC=100 baseline) × 1.431 rescaling factor,
//   anchored at Austin=103. Do NOT mix raw Numbeo values (NYC=100)
//   with these values — the engine uses costIndex/100 as a US-avg
//   multiplier for salaries and expenses.
//
// Sources:
//   Rent:        Zumper May 2026  https://zumper.com/rent-research/national-rent-report
//   costIndex:   Numbeo 2026 (rescaled)  https://numbeo.com/cost-of-living/region_rankings_current.jsp?region=019
//   stateTax:    Tax Foundation 2026  https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/
//   walkScore/transitScore: Walk Score  https://walkscore.com/cities-and-neighborhoods/
//   safetyIndex: Numbeo 2025  https://numbeo.com/crime/region_rankings.jsp?region=021
//   jobGrowth:   BLS Metro Employment 2024-2025  https://bls.gov/web/metro/largemetro_oty_change.htm
//   summerHighF/winterLowF: CurrentResults/NOAA 30-yr normals  https://currentresults.com/Weather/US/
//   nearMountains/nearCoast: geographic judgment (60-min drive standard)
// ─────────────────────────────────────────────────────────────────
import type { City } from '../types.js';

export const CITIES_DATA: City[] = [
  // ── Original 12 cities (prototype values for display fields; RESEARCH table values for scoring fields) ──

  {
    name: "Austin, TX",
    country: "US",
    financialModelId: "us",
    emoji: "🎸",
    lat: 30.27,
    lng: -97.74,
    pop: "2.3M metro",
    climate: "Hot summers, mild winters",
    costIndex: 103,        // anchor point for Numbeo→US-avg rescaling
    medianRent: 1450,
    medianHome: 425000,
    avgTemp: 68,
    stateTax: 0,
    summerHighF: 97,
    winterLowF: 42,
    walkScore: 42,
    transitScore: 35,
    safetyIndex: 58,
    jobGrowth: 2.5,
    vibe: ["Creative", "Tech", "Outdoorsy", "Nightlife"],
    topIndustries: ["Tech", "Government", "Healthcare", "Music"],
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "Nashville, TN",
    country: "US",
    financialModelId: "us",
    emoji: "🎵",
    lat: 36.16,
    lng: -86.78,
    pop: "2.0M metro",
    climate: "Hot summers, mild winters",
    costIndex: 107,
    medianRent: 1500,
    medianHome: 400000,
    avgTemp: 59,
    stateTax: 0,
    summerHighF: 91,
    winterLowF: 30,
    walkScore: 29,
    transitScore: 22,
    safetyIndex: 70,
    jobGrowth: 2.5,
    vibe: ["Creative", "Nightlife", "Growing", "Affordable"],
    topIndustries: ["Healthcare", "Music", "Tech", "Tourism"],
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "Miami, FL",
    country: "US",
    financialModelId: "us",
    emoji: "🌴",
    lat: 25.76,
    lng: -80.19,
    pop: "6.1M metro",
    climate: "Tropical year-round",
    costIndex: 122,
    medianRent: 2590,
    medianHome: 520000,
    avgTemp: 77,
    stateTax: 0,
    summerHighF: 91,
    winterLowF: 61,
    walkScore: 77,
    transitScore: 57,
    safetyIndex: 47,
    jobGrowth: 2.5,
    vibe: ["Diverse", "Nightlife", "Tropical", "International"],
    topIndustries: ["Tourism", "Finance", "Real Estate", "Trade"],
    nearMountains: false,
    nearCoast: true,
    hasIntlAirport: true,
  },

  {
    name: "Denver, CO",
    country: "US",
    financialModelId: "us",
    emoji: "⛰️",
    lat: 39.74,
    lng: -104.99,
    pop: "2.9M metro",
    climate: "300 days sun, snowy winters",
    costIndex: 113,
    medianRent: 1580,
    medianHome: 520000,
    avgTemp: 50,
    stateTax: 4.40,
    summerHighF: 90,
    winterLowF: 18,
    walkScore: 61,
    transitScore: 45,
    safetyIndex: 52,
    jobGrowth: 1.8,
    vibe: ["Outdoorsy", "Tech", "Healthy", "Growing"],
    topIndustries: ["Tech", "Aerospace", "Healthcare", "Energy"],
    nearMountains: true,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "Pittsburgh, PA",
    country: "US",
    financialModelId: "us",
    emoji: "🏗️",
    lat: 40.44,
    lng: -79.99,
    pop: "2.4M metro",
    climate: "Four seasons, grey winters",
    costIndex: 99,
    medianRent: 1050,
    medianHome: 230000,
    avgTemp: 50,
    stateTax: 3.07,
    summerHighF: 83,
    winterLowF: 26,
    walkScore: 62,
    transitScore: 55,
    safetyIndex: 65,
    jobGrowth: 1.2,
    vibe: ["Affordable", "Tech", "Historic", "Growing"],
    topIndustries: ["Tech/AI", "Healthcare", "Education", "Robotics"],
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "Raleigh, NC",
    country: "US",
    financialModelId: "us",
    emoji: "🔬",
    lat: 35.78,
    lng: -78.64,
    pop: "1.4M metro",
    climate: "Mild winters, warm summers",
    costIndex: 96,
    medianRent: 1350,
    medianHome: 380000,
    avgTemp: 60,
    stateTax: 3.99,
    summerHighF: 91,
    winterLowF: 32,
    walkScore: 31,
    transitScore: 29,
    safetyIndex: 61,
    jobGrowth: 2.5,
    vibe: ["Tech", "Family", "Growing", "Affordable"],
    topIndustries: ["Tech", "Biotech", "Education", "Finance"],
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "Portland, OR",
    country: "US",
    financialModelId: "us",
    emoji: "🌲",
    lat: 45.52,
    lng: -122.68,
    pop: "2.5M metro",
    climate: "Rainy winters, dry summers",
    costIndex: 119,
    medianRent: 1400,
    medianHome: 475000,
    avgTemp: 53,
    stateTax: 9.90,
    summerHighF: 82,
    winterLowF: 37,
    walkScore: 67,
    transitScore: 49,
    safetyIndex: 43,
    jobGrowth: 1.0,
    vibe: ["Creative", "Outdoorsy", "Walkable", "Progressive"],
    topIndustries: ["Tech", "Outdoor/Athletic", "Creative", "Mfg"],
    nearMountains: true,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "Boise, ID",
    country: "US",
    financialModelId: "us",
    emoji: "🏔️",
    lat: 43.62,
    lng: -116.21,
    pop: "870K metro",
    climate: "Four seasons, dry summers",
    costIndex: 99,
    medianRent: 1100,
    medianHome: 390000,
    avgTemp: 51,
    stateTax: 5.80,
    summerHighF: 92,
    winterLowF: 24,
    walkScore: 39,
    transitScore: 23,
    safetyIndex: 70,
    jobGrowth: 2.0,
    vibe: ["Outdoorsy", "Growing", "Affordable", "Family"],
    topIndustries: ["Tech", "Agriculture", "Healthcare", "Mfg"],
    nearMountains: true,
    nearCoast: false,
    hasIntlAirport: false, // [ASSUMED — verify] BOI has no regular nonstop international routes
  },

  {
    name: "Salt Lake City, UT",
    country: "US",
    financialModelId: "us",
    emoji: "🏂",
    lat: 40.76,
    lng: -111.89,
    pop: "1.3M metro",
    climate: "Dry, snowy winters, warm summers",
    costIndex: 96,
    medianRent: 1300,
    medianHome: 460000,
    avgTemp: 52,
    stateTax: 4.50,
    summerHighF: 94,
    winterLowF: 24,
    walkScore: 57,
    transitScore: 39,
    safetyIndex: 66,
    jobGrowth: 2.5,
    vibe: ["Outdoorsy", "Tech", "Growing", "Family"],
    topIndustries: ["Tech", "Finance", "Outdoor Rec", "Healthcare"],
    nearMountains: true,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "Chicago, IL",
    country: "US",
    financialModelId: "us",
    emoji: "🏙️",
    lat: 41.88,
    lng: -87.63,
    pop: "9.4M metro",
    climate: "Cold winters, hot summers",
    costIndex: 109,
    medianRent: 1700,
    medianHome: 320000,
    avgTemp: 50,
    stateTax: 4.95,
    summerHighF: 85,
    winterLowF: 20,
    walkScore: 77,
    transitScore: 65,
    safetyIndex: 34,
    jobGrowth: 0.8,
    vibe: ["Diverse", "Nightlife", "Walkable", "Creative"],
    topIndustries: ["Finance", "Food/Bev", "Tech", "Manufacturing"],
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "San Diego, CA",
    country: "US",
    financialModelId: "us",
    emoji: "🏖️",
    lat: 32.72,
    lng: -117.16,
    pop: "3.3M metro",
    climate: "Mediterranean, mild year-round",
    costIndex: 119,
    medianRent: 2200,
    medianHome: 820000,
    avgTemp: 64,
    stateTax: 13.30,
    summerHighF: 75,
    winterLowF: 50,
    walkScore: 53,
    transitScore: 37,
    safetyIndex: 68,
    jobGrowth: 1.5,
    vibe: ["Outdoorsy", "Diverse", "Healthy", "Tropical"],
    topIndustries: ["Biotech", "Military", "Tourism", "Tech"],
    nearMountains: false,
    nearCoast: true,
    hasIntlAirport: true,
  },

  {
    name: "Seattle, WA",
    country: "US",
    financialModelId: "us",
    emoji: "🌧️",
    lat: 47.61,
    lng: -122.33,
    pop: "4.0M metro",
    climate: "Mild, rainy winters, dry summers",
    costIndex: 132,
    medianRent: 1974,
    medianHome: 750000,
    avgTemp: 53,
    stateTax: 0,
    summerHighF: 77,
    winterLowF: 38,
    walkScore: 74,
    transitScore: 60,
    safetyIndex: 46,
    jobGrowth: 1.5,
    vibe: ["Tech", "Outdoorsy", "Walkable", "Progressive"],
    topIndustries: ["Tech", "Aerospace", "Biotech", "Coffee/Retail"],
    nearMountains: true,
    nearCoast: true,
    hasIntlAirport: true,
  },

  // ── 10 new cities (Phase 3 additions) ──

  {
    name: "Minneapolis, MN",
    country: "US",
    financialModelId: "us",
    emoji: "❄️",
    lat: 44.98,
    lng: -93.27,
    pop: "3.7M metro",
    climate: "Very cold winters, warm summers",
    costIndex: 107,
    medianRent: 1330,
    medianHome: 310000,
    avgTemp: 45,
    // stateTax: MN has graduated brackets. 7.85% is the effective rate for the
    // demo salary range ($55K–$100K, MN 3rd bracket ~6.80%–7.85%). The top
    // marginal rate is 9.85%. Using 7.85% is more accurate for this band per
    // D-08 flat-% approximation and Pitfall 4 in 03-RESEARCH.md.
    stateTax: 7.85,
    summerHighF: 83,
    winterLowF: 9,   // Minneapolis always triggers "No extreme cold" (9 < 25 threshold)
    walkScore: 71,
    transitScore: 55,
    safetyIndex: 60,
    jobGrowth: 1.0,
    vibe: ["Arts", "Diverse", "Walkable", "Family"],
    topIndustries: ["Healthcare", "Finance", "Retail", "Tech"],
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "Phoenix, AZ",
    country: "US",
    financialModelId: "us",
    emoji: "☀️",
    lat: 33.45,
    lng: -112.07,
    pop: "5.0M metro",
    climate: "Desert, very hot summers",
    costIndex: 109,
    medianRent: 1200,
    medianHome: 350000,
    avgTemp: 75,
    stateTax: 2.50,
    summerHighF: 107,  // Phoenix always triggers "No extreme heat" (107 > 95 threshold)
    winterLowF: 44,
    walkScore: 41,
    transitScore: 36,
    safetyIndex: 47,
    jobGrowth: 2.0,
    vibe: ["Outdoorsy", "Growing", "Sunny", "Affordable"],
    topIndustries: ["Healthcare", "Real Estate", "Finance", "Mfg"],
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "Atlanta, GA",
    country: "US",
    financialModelId: "us",
    emoji: "🍑",
    lat: 33.75,
    lng: -84.39,
    pop: "6.2M metro",
    climate: "Hot humid summers, mild winters",
    costIndex: 112,
    medianRent: 1660,
    medianHome: 380000,
    avgTemp: 62,
    stateTax: 5.19,
    summerHighF: 90,
    winterLowF: 36,
    walkScore: 48,
    transitScore: 44,
    safetyIndex: 36,
    jobGrowth: 1.5,
    vibe: ["Diverse", "Growing", "Nightlife", "Creative"],
    topIndustries: ["Media/Film", "Tech", "Logistics", "Finance"],
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "Charlotte, NC",
    country: "US",
    financialModelId: "us",
    emoji: "🏦",
    lat: 35.23,
    lng: -80.84,
    pop: "2.7M metro",
    climate: "Mild winters, warm summers",
    costIndex: 103,
    medianRent: 1400,
    medianHome: 350000,
    avgTemp: 61,
    stateTax: 3.99,
    summerHighF: 90,
    winterLowF: 35,
    walkScore: 26,
    transitScore: 27,
    safetyIndex: 65,
    jobGrowth: 2.5,
    vibe: ["Growing", "Family", "Affordable", "Sports"],
    topIndustries: ["Finance", "Tech", "Healthcare", "Energy"],
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "Tampa, FL",
    country: "US",
    financialModelId: "us",
    emoji: "🌊",
    lat: 27.95,
    lng: -82.46,
    pop: "3.2M metro",
    climate: "Subtropical, hot and humid summers",
    costIndex: 99,
    medianRent: 1500,
    medianHome: 330000,
    avgTemp: 72,
    stateTax: 0,
    summerHighF: 91,
    winterLowF: 53,
    walkScore: 50,
    transitScore: 31,
    safetyIndex: 54,
    jobGrowth: 1.8,
    vibe: ["Outdoorsy", "Sunny", "Affordable", "Growing"],
    topIndustries: ["Healthcare", "Finance", "Tourism", "Tech"],
    nearMountains: false,
    nearCoast: true,
    hasIntlAirport: true,
  },

  {
    name: "Columbus, OH",
    country: "US",
    financialModelId: "us",
    emoji: "🏛️",
    lat: 39.96,
    lng: -82.99,
    pop: "2.1M metro",
    climate: "Four seasons, humid continental",
    costIndex: 106,
    medianRent: 1200,
    medianHome: 240000,
    avgTemp: 52,
    // Ohio 2026: graduated brackets; 3.99% is the effective rate for $40K–$120K earners
    // post-2025 reforms. [ASSUMED — verify OH 2026 rate] Source: Tax Foundation
    stateTax: 3.99,
    summerHighF: 85,
    winterLowF: 22,
    walkScore: 41,
    transitScore: 30,
    safetyIndex: 51,
    jobGrowth: 1.5,
    vibe: ["Affordable", "Growing", "Tech", "Family"],
    topIndustries: ["Education", "Healthcare", "Finance", "Mfg"],
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "Indianapolis, IN",
    country: "US",
    financialModelId: "us",
    emoji: "🏎️",
    lat: 39.77,
    lng: -86.16,
    pop: "2.1M metro",
    climate: "Four seasons, cold winters",
    costIndex: 100,
    medianRent: 1045,
    medianHome: 220000,
    avgTemp: 52,
    stateTax: 2.95,
    summerHighF: 85,
    winterLowF: 21,
    walkScore: 31,
    transitScore: 25,
    safetyIndex: 39,
    jobGrowth: 1.5,
    vibe: ["Affordable", "Sports", "Family", "Growing"],
    topIndustries: ["Healthcare", "Mfg", "Finance", "Logistics"],
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "San Antonio, TX",
    country: "US",
    financialModelId: "us",
    emoji: "🌮",
    lat: 29.42,
    lng: -98.49,
    pop: "2.6M metro",
    climate: "Hot and dry, mild winters",
    costIndex: 94,
    medianRent: 1100,
    medianHome: 240000,
    avgTemp: 68,
    stateTax: 0,
    summerHighF: 95,   // exactly at heatThresholdF (95 > 95 is false — does NOT trigger)
    winterLowF: 41,
    walkScore: 37,
    transitScore: 31,
    safetyIndex: 52,
    jobGrowth: 2.0,
    vibe: ["Affordable", "Diverse", "Historic", "Military"],
    topIndustries: ["Military/Defense", "Healthcare", "Tourism", "Mfg"],
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "Dallas, TX",
    country: "US",
    financialModelId: "us",
    emoji: "🤠",
    lat: 32.78,
    lng: -96.80,
    pop: "7.6M metro",
    climate: "Hot summers, mild winters",
    costIndex: 109,
    medianRent: 1400,
    medianHome: 330000,
    avgTemp: 66,
    stateTax: 0,
    summerHighF: 97,
    winterLowF: 32,
    walkScore: 46,
    transitScore: 39,
    safetyIndex: 49,
    jobGrowth: 1.8,
    vibe: ["Growing", "Business", "Diverse", "Sports"],
    topIndustries: ["Finance", "Tech", "Healthcare", "Energy"],
    nearMountains: false,
    nearCoast: false,
    hasIntlAirport: true,
  },

  {
    name: "Brooklyn/NYC, NY",
    country: "US",
    financialModelId: "us",
    emoji: "🌉",
    lat: 40.68,
    lng: -73.94,
    pop: "2.7M (Brooklyn) / 8.3M NYC",
    climate: "Four seasons, cold winters",
    costIndex: 143, // rescaled from prototype's 187 (overcalibrated). Numbeo NYC raw × 1.431 → ~143
    medianRent: 2800,
    medianHome: 850000,
    avgTemp: 55,
    // NY state: 10.9% is the top marginal bracket applicable to most demo salary levels.
    // NYC city tax (~3.9%) is omitted per D-08 flat-% approach — single-source state tax only.
    stateTax: 10.90,
    summerHighF: 85,
    winterLowF: 26,
    walkScore: 95,
    transitScore: 89,
    safetyIndex: 48,
    jobGrowth: 0.8,
    vibe: ["Creative", "Diverse", "Nightlife", "Walkable"],
    topIndustries: ["Finance", "Media", "Tech", "Fashion"],
    nearMountains: false,
    nearCoast: true,
    hasIntlAirport: true,
  },

  // ── 6 major US anchor cities (added 2026-06-03) ───────────────────────────
  // Sourcing follows the same chain as the original 22 (see header). costIndex
  // derived from Numbeo Cost-of-Living Index (excl. rent, NYC=100) × 1.431,
  // pulled in one consistent read of the US region-rankings table on 2026-06-03:
  //   SF 96.9 · DC 92.4 · Boston 88.9 · LA 84.8 · Philly 81.3 · Houston 65.3
  // (anchors in same table: Austin 71.3→103, NYC 100→143, San Diego 82.8→119).
  // Phase 11/12 optional fields (healthcareIndex, disasterRiskScore, childcare…)
  // intentionally omitted — Phase 12 populates them across ALL cities at once.
  // Several jobGrowth values are NEGATIVE here (real 2026 BLS data): DC -3.2
  // (federal workforce cuts), Boston -1.0, LA -0.3.

  {
    name: "Los Angeles, CA",
    country: "US",
    financialModelId: "us",
    emoji: "🎬",
    lat: 34.05,
    lng: -118.24,
    pop: "12.8M metro",
    climate: "Mediterranean, mild and dry year-round",
    costIndex: 121,        // Numbeo CoL 84.8 × 1.431
    medianRent: 2100,      // Zumper 1BR, May 2026
    medianHome: 890000,    // Zillow ZHVI LA County, Mar 2026
    avgTemp: 65,
    stateTax: 13.30,       // CA top marginal (matches San Diego convention)
    summerHighF: 84,       // Aug avg high (NOAA 1991-2020)
    winterLowF: 48,
    walkScore: 69,
    transitScore: 53,
    safetyIndex: 46,
    jobGrowth: -0.3,       // LA metro YoY, Apr 2026 (BLS, flat-to-negative)
    vibe: ["Creative", "Diverse", "Outdoorsy", "Nightlife"],
    topIndustries: ["Entertainment", "Trade", "Aerospace", "Tech"],
    nearMountains: true,   // San Gabriel / Santa Monica Mts within ~60 min
    nearCoast: true,
    hasIntlAirport: true,
  },

  {
    name: "San Francisco, CA",
    country: "US",
    financialModelId: "us",
    emoji: "🌁",
    lat: 37.77,
    lng: -122.42,
    pop: "4.6M metro",
    climate: "Cool, foggy summers; mild winters",
    costIndex: 139,        // Numbeo CoL 96.9 × 1.431 (highest US after NYC)
    medianRent: 3877,      // Zumper 1BR, Jun 2026 (runs above NYC's 1BR)
    medianHome: 1270000,   // Zillow ZHVI city, 2026
    avgTemp: 57,
    stateTax: 13.30,       // CA top marginal
    summerHighF: 70,       // Sep is warmest (fog effect); NOAA 1991-2020
    winterLowF: 46,
    walkScore: 89,
    transitScore: 77,
    safetyIndex: 40,
    jobGrowth: 0.6,        // SF-Oakland MSA YoY (BLS, AI-driven recovery)
    vibe: ["Tech", "Progressive", "Walkable", "Expensive"],
    topIndustries: ["Tech", "Finance", "Biotech", "Tourism"],
    nearMountains: false,  // no major range within ~60 min (Sierra ~2.5h)
    nearCoast: true,
    hasIntlAirport: true,
  },

  {
    name: "Boston, MA",
    country: "US",
    financialModelId: "us",
    emoji: "🎓",
    lat: 42.36,
    lng: -71.06,
    pop: "4.9M metro",
    climate: "Four seasons, cold snowy winters",
    costIndex: 127,        // Numbeo CoL 88.9 × 1.431
    medianRent: 2850,      // Zumper 1BR, May 2026
    medianHome: 780000,    // Zillow ZHVI city, Apr 2026
    avgTemp: 51,
    stateTax: 5.00,        // MA flat (4% surtax only >$1M, irrelevant here)
    summerHighF: 82,       // Jul avg high (NOAA 1991-2020, Logan)
    winterLowF: 23,        // Jan avg low — triggers "No extreme cold" (23 < 25)
    walkScore: 83,
    transitScore: 72,
    safetyIndex: 60,
    jobGrowth: -1.0,       // Boston-Cambridge MSA YoY, early 2026 (BLS)
    vibe: ["Historic", "Academic", "Walkable", "Sports"],
    topIndustries: ["Education", "Biotech", "Healthcare", "Finance"],
    nearMountains: false,  // Blue Hills are hills; real ranges ~2h
    nearCoast: true,
    hasIntlAirport: true,
  },

  {
    name: "Washington, DC",
    country: "US",
    financialModelId: "us",
    emoji: "🦅",
    lat: 38.91,
    lng: -77.04,
    pop: "6.3M metro",
    climate: "Four seasons, hot humid summers",
    costIndex: 132,        // Numbeo CoL 92.4 × 1.431
    medianRent: 2280,      // Zumper 1BR, May 2026
    medianHome: 620000,    // Zillow ZHVI city, 2026
    avgTemp: 58,
    // DC graduated income tax; 8.5% bracket covers $60K-$250K (the demo band).
    // Source: DC Office of Tax & Revenue. Same band-rate approach as MN/OH records.
    stateTax: 8.50,
    summerHighF: 90,       // Jul avg high (NOAA 1991-2020, DCA)
    winterLowF: 30,
    walkScore: 98,
    transitScore: 100,     // Metro — Walk Score "Rider's Paradise"
    safetyIndex: 40,
    jobGrowth: -3.2,       // Washington-Arlington MSA YoY, early 2026 — federal
                           // workforce cuts; largest % decline of any large metro (BLS)
    vibe: ["Political", "Historic", "Walkable", "Diverse"],
    topIndustries: ["Government", "Law", "Defense", "Tech"],
    nearMountains: false,  // Blue Ridge ~75 min (outside 60-min standard)
    nearCoast: false,      // Chesapeake borderline; open Atlantic ~2.5h
    hasIntlAirport: true,
  },

  {
    name: "Houston, TX",
    country: "US",
    financialModelId: "us",
    emoji: "🚀",
    lat: 29.76,
    lng: -95.37,
    pop: "7.8M metro",
    climate: "Hot humid summers, mild winters",
    costIndex: 93,         // Numbeo CoL 65.3 × 1.431 (below Austin — cheap metro)
    medianRent: 1130,      // Zumper 1BR, Jun 2026
    medianHome: 265000,    // Zillow ZHVI city, Apr 2026
    avgTemp: 70,
    stateTax: 0,           // Texas — no state income tax
    summerHighF: 94,       // Aug avg high (NOAA 1991-2020) — just under 95 heat threshold
    winterLowF: 46,
    walkScore: 47,
    transitScore: 36,
    safetyIndex: 37,
    jobGrowth: 0.2,        // Houston MSA YoY NSA, Feb 2026 (BLS) — soft labor year
    vibe: ["Diverse", "Affordable", "Foodie", "Sprawling"],
    topIndustries: ["Energy", "Healthcare", "Aerospace", "Trade"],
    nearMountains: false,
    nearCoast: true,       // Galveston Bay / Gulf ~50 min
    hasIntlAirport: true,
  },

  {
    name: "Philadelphia, PA",
    country: "US",
    financialModelId: "us",
    emoji: "🔔",
    lat: 39.95,
    lng: -75.17,
    pop: "6.2M metro",
    climate: "Four seasons, humid continental",
    costIndex: 116,        // Numbeo CoL 81.3 × 1.431
    medianRent: 1500,      // Zumper 1BR, 2026
    medianHome: 221000,    // Zillow ZHVI city, May 2026
    avgTemp: 56,
    // PA flat 3.07% (matches Pittsburgh). Philly's ~3.75% city wage tax omitted
    // by convention — same single-source state-only approach used for NYC.
    stateTax: 3.07,
    summerHighF: 86,       // Jul avg high (NOAA 1991-2020)
    winterLowF: 26,
    walkScore: 75,
    transitScore: 67,
    safetyIndex: 35,
    jobGrowth: 1.2,        // Philadelphia-Camden MSA YoY, year-end 2025 (BLS)
    vibe: ["Historic", "Walkable", "Affordable", "Sports"],
    topIndustries: ["Healthcare", "Education", "Finance", "Pharma"],
    nearMountains: false,  // Poconos ~75 min
    nearCoast: false,      // Jersey Shore ~75 min; Delaware River is tidal, not coast
    hasIntlAirport: true,
  },

  // ── International Cities (Phase 4, Plan 01 — UK walking proof) ──────────────
  //
  // International city records append the US-city dataset for MATCH-02 coverage.
  // All medianRent and medianHome values are stored in USD-canonical form so that
  // computeUSExpenses() (reused by country models) produces correct USD expense totals
  // without additional FX conversion inside expenses.
  //
  // stateTax = 0 for all international cities; country-level tax is handled entirely
  // by the registered FinancialModel (uk-2026, etc.) in financial.ts.
  //
  // summerHighF / winterLowF: sourced from WeatherAndClimate.com / TimeAndDate.com 30-yr normals
  // nearCoast: Thames estuary proximity + coastal rail access judgment
  // pop / climate: standard London metropolitan area / climate-type references
  //
  // Sources for London record:
  //   Rent: Numbeo London, upd. 30 May 2026  https://www.numbeo.com/cost-of-living/in/London
  //   medianHome: ONS/Land Registry London avg ~£550k -> ~$740k USD
  //   costIndex: derived from Numbeo overall index ~89.2 rescaled (DERIVED — verify)
  //   Software Engineer salary: theemployerofrecord 2026 (£45k-£80k range)
  //     https://theemployerofrecord.com/blog/services/average-software-engineer-salary-by-country
  //   FX: GBP/USD 1.347 (ECB/exchangerates.org.uk 2026-06-01)
  //
  {
    name: "London, UK",
    country: "UK",
    financialModelId: "uk-2026",
    emoji: "🎡",
    lat: 51.51,
    lng: -0.13,
    pop: "9.0M metro",                 // Greater London / London metro area standard reference
    climate: "Temperate maritime",     // Cfb climate classification; mild, rainy year-round
    costIndex: 165,                    // [DERIVED — verify] Numbeo overall index ~89.2 rescaled to US-avg scale
    medianRent: 3186,                  // USD-canonical: £2,367/mo x 1.347 GBP/USD (Numbeo London, May 2026)
    medianHome: 740000,                // USD-canonical: ONS/Land Registry avg ~£550k x 1.347 [VERIFY]
    avgTemp: 52,                       // WeatherAndClimate.com London annual avg ~52°F
    stateTax: 0,                       // No UK "state" tax; all tax handled by uk-2026 model
    summerHighF: 73,                   // London avg July high ~73°F (TimeAndDate.com 30-yr normals)
    winterLowF: 35,                    // London avg Jan low ~35°F (TimeAndDate.com 30-yr normals)
    walkScore: 85,                     // estimate — London urban walkability; Walk Score intl coverage limited
    transitScore: 90,                  // estimate — London Tube + bus network is world-class
    safetyIndex: 60,                   // Numbeo London safety index estimate (Numbeo 2025)
    jobGrowth: 1.8,                    // estimate — UK Metro employment growth 2024-2025 (verify vs ONS)
    vibe: ["Global", "Finance", "Diverse", "Culture", "Career"],
    topIndustries: ["Finance", "Tech", "Media", "Professional Services"],
    nearMountains: false,              // London is flat; no mountain range within 60-min drive
    nearCoast: true,                   // Thames estuary + coastal rail access within 60-min drive
    hasIntlAirport: true,              // Heathrow (LHR) + Gatwick (LGW); major international hub
  },
];
