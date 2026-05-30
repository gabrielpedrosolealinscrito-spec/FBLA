// ───────────────────────────────────────────────────────────
// Potential — Shared Contract
// The handshake between frontend (src/) and backend (api/, shared/engine/).
// PROVISIONAL: this is the starting contract. It will be finalized in
// Phase 1 (Scaffold & Port). Change it in small, announced commits.
// Source of truth for the domain: .planning/REQUIREMENTS.md
// ───────────────────────────────────────────────────────────

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
  // Timeline (QUIZ-05)
  moveTimeline: string;          // e.g. "6mo" | "12mo" | "exploring"
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
  scoreFactors: { factor: string; contribution: number }[]; // MATCH-03 "why"
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
