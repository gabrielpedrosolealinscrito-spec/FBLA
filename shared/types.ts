// ───────────────────────────────────────────────────────────
// Potential — Shared Contract
// The handshake between frontend (src/) and backend (api/, shared/engine/).
// PROVISIONAL: this is the starting contract. It will be finalized in
// Phase 1 (Scaffold & Port). Change it in small, announced commits.
// Source of truth for the domain: .planning/REQUIREMENTS.md
//
// Phase 2 extension (D-05, 2026-06-02): Added 6 optional dimension fields
// to Profile — motivationToMove, workStyle, communityNeeds, paceOfLife,
// riskTolerance, tradeoffTolerance. All optional to avoid fixture ripple
// (tsconfig strict:true). Phase 3 defends with ?? defaults at consumption.
//
// Phase 11 extension (MATCH-05, 2026-06-02): Added WeightExplanation interface
// and additive optional fields to Profile (categoryWeights, weightExplanations,
// module-captured fields) and City (Phase 12 data fields). All optional — zero
// fixture ripple under strict:true. The `weights?` field is intentionally retained;
// D-02 (replace vs. layer with categoryWeights) stays OPEN until Phase 2 integration.
// ───────────────────────────────────────────────────────────

// ── WeightExplanation — Phase 11 (MATCH-05 explainability contract) ──
// Emitted by synthesizeCategoryWeights (plan 02).
// Mirrors Phase 3's scoreFactors {factor, contribution}[] explainability pattern (D-08).
// Both categoryWeights and weightExplanations ship together — never one without the other.
export interface WeightExplanation {
  category: string;         // e.g. "healthcare" | "climateRisk" | "parks"
  inferredWeight: number;   // raw value in [WEIGHT_FLOOR..WEIGHT_MAX] range, NOT pre-normalized
  floor?: number;           // present for practical tier only (cost, safety, healthcare)
  explanation: string;      // e.g. "You chose healthcare-focused options 2×, so healthcare weight = 1.2"
}

// ── Profile (output of the quiz, input to the engine) ──
export type Housing = "rent" | "buy";

export interface Profile {
  // Career
  profession: string;
  hasRemote: boolean;
  // Finances
  income: number;
  savings: number;
  debt: number;
  housing: Housing;
  hasPartner: boolean;
  partnerIncome: number;
  hasDependents: boolean;
  numDependents: number;
  hasPets: boolean;
  // Background
  age: number;
  education: string;
  currentCity: string;
  // Immigration (QUIZ-03 — keyed by the visa roadmap)
  citizenship: string;
  immigrationStatus: string;
  // Preferences
  opennessToAbroad: number;      // QUIZ-02: 0–100 slider
  lifestyleTags: string[];
  dealBreakers: string[];        // QUIZ-04: hard filters
  importanceRank: string[];      // ["cost","career","lifestyle","safety"]
  // Phase 2 emits this; if absent the engine derives it from importanceRank
  weights?: { cost: number; career: number; lifestyle: number; safety: number };
  // Timeline (QUIZ-05)
  moveTimeline: string;          // e.g. "6mo" | "12mo" | "exploring"
  // ── Phase 2 dimension fields (D-05, D-02) — ALL OPTIONAL ──
  // Optional so existing engine test fixtures (scoring.test.ts etc.) compile
  // unchanged under strict:true. synthesizeProfile always populates these;
  // Phase 3 engine defends downstream with ?? defaults.
  motivationToMove?: string;     // e.g. "career" | "lifestyle" | "adventure" | "family"
  workStyle?: string;            // e.g. "remote" | "hybrid" | "office"
  communityNeeds?: string[];     // e.g. ["arts", "outdoors", "family-friendly"]
  paceOfLife?: string;           // e.g. "fast" | "moderate" | "slow"
  riskTolerance?: number;        // 0–100 slider; 0=very conservative, 100=high risk
  tradeoffTolerance?: {          // tension reconciliation answers (D-14)
    dimension: string;           // e.g. "nature_vs_career"
    preference: "a" | "b" | "balanced";
  }[];
  // ── Phase 11 additions (additive, NOT replacing existing fields) ─────────
  // categoryWeights + weightExplanations are the MATCH-05 seam for Phase 12 scoring.
  // Do NOT remove or rename `weights?` above — Phase 3 scoring.ts line ~38 reads
  // profile.weights.cost directly; Phase 2 synthesizer emits it.
  // D-02 (replace vs. layer) stays OPEN until Phase 2 integration.
  categoryWeights?: Record<string, number>;    // keyed by category slug: "healthcare" | "climateRisk" | ...
  weightExplanations?: WeightExplanation[];    // D-08 explainability trace — ships with categoryWeights
  // Phase 11: module-captured fields from deep-dive category questions (all optional)
  hasChronicCondition?: boolean;               // healthcare module
  needsSpecialistAccess?: boolean;             // healthcare module — specialist access required
  hasDependentsInSchool?: boolean;             // schools module
  kidsAges?: string[];                         // schools/childcare module — ages of dependents
  disasterRiskConcern?: string;               // climateRisk module: "high" | "moderate" | "low"
  primaryHazardConcern?: string;              // climateRisk module: "hurricane" | "wildfire" | "flood" | "heat" | "tornado" | "any"
  internationalTraveler?: boolean;            // connectivity module
  outdoorsFrequency?: string;                 // parks module: "daily" | "weekend" | "occasional"
  demographicsMatters?: boolean;              // demographics module — explicit opt-in to view stat (D-14)
  personalityTradeoffs?: { scenario: string; choice: string }[];  // personality gate output (stored for UI)
  personalityFlavor?: Record<string, string>; // D-07 trait statements — non-weight-bearing, flavor only
}

// ── City / destination ──
export interface City {
  name: string;
  country: string;               // "US" | "Portugal" | "Germany" | "Canada" | "UK" ...
  emoji: string;
  lat: number;
  lng: number;
  costIndex: number;
  medianRent: number;
  medianHome: number;
  avgTemp: number;
  vibe: string[];
  walkScore: number;
  transitScore: number;
  safetyIndex: number;
  jobGrowth: number;
  topIndustries: string[];
  // International cities need a country-correct financial model (FIN-02)
  financialModelId: string;      // -> shared/engine/country-models
  // Phase 3 additions — D-11 dealbreaker fields
  stateTax: number;              // flat state income tax % (0 = no state tax)
  summerHighF: number;           // NOAA avg daily high in hottest month (°F)
  winterLowF: number;            // NOAA avg daily low in coldest month (°F)
  nearMountains: boolean;        // within ~60 min drive of major mountain range
  nearCoast: boolean;            // within ~60 min drive of ocean/major coastal bay
  hasIntlAirport: boolean;       // has direct international routes
  pop: string;                   // display: metro population label
  climate: string;               // display: climate description string
  // ── Phase 11 additions — all optional (Phase 12 populates city data files) ──
  healthcareIndex?: number;              // Numbeo Health Care Index, ~0–100, higher = better
  disasterRiskScore?: number;           // FEMA NRI composite percentile (barely discriminates large metros — see Pitfall 3 in 11-RESEARCH.md)
  disasterRiskRating?: string;          // e.g. "Relatively High" | "Very High"
  schoolProficiencyPct?: number;        // NAEP G8 Reading % at/above Proficient (state-level average)
  childcareInfantAnnual?: number;       // CCAoA center-based infant care, $/yr (state-level)
  childcareToddlerAnnual?: number;      // CCAoA center-based toddler care, $/yr (state-level)
  foreignBornPct?: number;             // % foreign-born — D-14 neutral factual stat, NOT a fit/diversity score
  medianAge?: number;                   // years, ACS 2024
  neverMarriedPct?: number;             // % never-married 15+, ACS 2024
  parkScoreRank?: number;               // TPL ParkScore rank (7/22 cities confirmed; falls back to nearMountains/nearCoast)
  parkScore?: number;                   // TPL ParkScore 0–100 (7/22 confirmed)
  faaHubClass?: 'Large' | 'Medium' | 'Small' | 'Nonhub';  // FAA airport classification
  airportEnplanements?: number;        // CY2023 annual enplanements
}

// ── Match result (engine output, FIN-01) ──
export interface ExpenseBreakdown {
  rent: number; food: number; transport: number; utilities: number;
  insurance: number; personal: number; childcare: number; pets: number;
  debtPay: number; total: number;
}

export interface MatchResult {
  city: City;
  matchScore: number;            // 0–99
  scoreFactors: { factor: string; contribution: number; dataLevel?: 'city' | 'state' | 'proxy' | 'none' | 'display-only' }[]; // MATCH-03 "why"; dataLevel labels data provenance (D-08)
  estSalary: number;
  monthlyTakeHome: number;
  expenses: ExpenseBreakdown;
  monthlySavings: number;        // can be negative
}

// ── Live AI layer (Plus tier, served via /api proxy — LIVE-01..04) ──
export type LiveCategory =
  | "jobs" | "housing_rent" | "housing_buy"
  | "nightlife" | "outdoors" | "food" | "dayinlife";

export interface LiveDataRequest {
  category: LiveCategory;
  cityName: string;
  profession?: string;
  age?: number;
}

export interface LiveDataResponse<T = unknown> {
  category: LiveCategory;
  cityName: string;
  fromCache: boolean;            // true when served from the offline golden-path cache (LIVE-04)
  items: T;                      // array of listings, or a narrative string for "dayinlife"
}

// ── Relocation roadmap (Plus, ROAD-01..03) ──
export interface RoadmapSection {
  id: "timeline" | "financial" | "jobs" | "housing" | "logistics" | "visa";
  title: string;
  steps: { label: string; detail: string; sourceUrl?: string }[];
}
export interface Roadmap {
  cityName: string;
  sections: RoadmapSection[];
}

// ── Visa concierge (Premium, VISA-01..04) ──
export interface VisaPathway {
  destinationCountry: string;
  visaType: string;              // e.g. "Portugal D8" | "Canada Express Entry"
  requirements: string[];
  processingTime: string;
  feeRangeUSD: string;
  pros: string[];
  cons: string[];
  documentChecklist: string[];
  officialSources: string[];     // VISA-03: every figure cited to an official .gov source
  // UPL boundary (VISA-04): informational only, never legal advice
}

// ── Freemium tiers (TIER-01..03) ──
export type Tier = "free" | "basic" | "plus" | "premium";
