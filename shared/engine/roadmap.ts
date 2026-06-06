// ─────────────────────────────────────────────────────────────────
// Potential — Relocation Roadmap Engine (Phase 6, ROAD-01/ROAD-02/ROAD-03)
// Pure TypeScript: offline, deterministic compiler that maps an authored
// RoadmapTemplate + real engine output (Profile + MatchResult) to the locked
// Roadmap contract. ZERO network calls on the render path (ROAD-03 / D-03).
//
// Invariants:
//   - buildRoadmap is a pure function: no mutation of inputs, no side effects.
//   - All financials read directly from MatchResult (never recomputed — D-01).
//   - monthlySavings <= 0 → monthsToFund = null (D-02 honest reframe, never clamped).
//   - Uncovered citizenship×country pair → GENERIC_TEMPLATE (D-07 never-dead-end).
//   - acceptEnrichment rejects any change to step count, label, or sourceUrl (D-05/ROAD-02).
// ─────────────────────────────────────────────────────────────────

import type { Profile, MatchResult, Roadmap } from '../types.js';
import {
  ROADMAP_TEMPLATES,
  GENERIC_TEMPLATE,
  TARGET_FUND_USD,
  type RoadmapContext,
} from '../data/roadmap-templates.js';

// ── Move-fund math (D-02) ─────────────────────────────────────────────────────

/**
 * Compute the number of months needed to save the relocation fund target.
 * Returns null when monthlySavings <= 0 — never clamp a negative to 0 or invent
 * a countdown. The caller (buildContext, then detail functions) surfaces reality.
 *
 * @param targetFundUSD - Target relocation fund in USD (from TARGET_FUND_USD)
 * @param monthlySavings - From MatchResult directly (can be negative — D-02)
 */
function monthsToFund(targetFundUSD: number, monthlySavings: number): number | null {
  if (monthlySavings <= 0) return null;
  return Math.ceil(targetFundUSD / monthlySavings);
}

// ── Context builder (D-01 — reads MatchResult directly, never recomputes) ─────

/**
 * Assemble the RoadmapContext passed to every TemplateStep.detail function.
 * All monetary figures come directly from the already-computed MatchResult —
 * the engine never re-derives savings, take-home, or expenses here (D-01).
 */
export function buildContext(profile: Profile, top: MatchResult): RoadmapContext {
  const targetFund = TARGET_FUND_USD[top.city.country] ?? TARGET_FUND_USD.default;
  return {
    cityName: top.city.name,
    profession: profile.profession,
    monthlySavings: top.monthlySavings,
    estSalary: top.estSalary,
    monthlyTakeHome: top.monthlyTakeHome,
    medianRent: top.city.medianRent,
    medianHome: top.city.medianHome,
    housing: profile.housing,
    monthsToFund: monthsToFund(targetFund, top.monthlySavings),
    targetFundUSD: targetFund,
  };
}

// ── Roadmap compiler (ROAD-01 / ROAD-03) ─────────────────────────────────────

/**
 * Compile a personalized Roadmap from a user's Profile and their top MatchResult.
 * Pure, offline, deterministic — no network calls (ROAD-03 / D-03).
 *
 * Resolution order (D-07):
 *   1. ROADMAP_TEMPLATES[profile.citizenship]?.[top.city.country]
 *   2. ?? GENERIC_TEMPLATE (always present — never throws, never dead-ends)
 *
 * @param profile - User profile (citizenship, profession, housing preference)
 * @param top     - Top MatchResult from the ranking engine (already computed)
 * @returns       - Locked Roadmap contract (cityName + 6 sections)
 */
export function buildRoadmap(profile: Profile, top: MatchResult): Roadmap {
  // D-07 fallback: resolve authored template or fall through to generic
  const tmpl =
    ROADMAP_TEMPLATES[profile.citizenship]?.[top.city.country] ?? GENERIC_TEMPLATE;

  const ctx = buildContext(profile, top);

  return {
    cityName: top.city.name,
    sections: tmpl.map((s) => ({
      id: s.id,
      title: s.title,
      steps: s.steps.map((st) => ({
        label: st.label,
        detail: st.detail(ctx),
        // Spread sourceUrl only when authored — keeps contract shape clean (index.ts pattern)
        ...(st.sourceUrl ? { sourceUrl: st.sourceUrl } : {}),
      })),
    })),
  };
}

// ── Enrich validator (ROAD-02 / D-05) ────────────────────────────────────────

/**
 * Validate and extract prose-polished detail strings from an LLM enrich payload.
 * Extends the validateItems throw-on-mismatch idiom from api/live-core.ts (D-05).
 *
 * Hard contract (ROAD-02 hard boundary — build-time ONLY, never on render path):
 *   - step count must match authored exactly (no insertion/deletion/reorder)
 *   - label, if present in llm payload, must be byte-identical to authored
 *   - sourceUrl, if present in llm payload, must be byte-identical to authored
 *   - only detail prose may differ (the only thing LLM is allowed to polish)
 *
 * On ANY violation: throw immediately. Caller keeps authored detail — the
 * function never silently ships an LLM mutation. Mirrors live.ts catch → serveFallback.
 *
 * @param authored - The original authored steps (source of truth)
 * @param llm      - Raw LLM response (unknown shape)
 * @returns        - Array of { detail } objects (one per authored step)
 */
export function acceptEnrichment(
  authored: { label: string; detail: string; sourceUrl?: string }[],
  llm: unknown
): { detail: string }[] {
  if (!Array.isArray(llm) || llm.length !== authored.length) {
    throw new Error(
      `enrich rejected: step count changed — expected ${authored.length}, got ${Array.isArray(llm) ? llm.length : 'non-array'} (D-05)`
    );
  }

  return authored.map((a, i) => {
    const e = llm[i] as Record<string, unknown>;

    if (typeof e?.detail !== 'string') {
      throw new Error(`enrich rejected: step ${i} missing string detail (D-05)`);
    }

    if (e.label !== undefined && e.label !== a.label) {
      throw new Error(
        `enrich rejected: step ${i} label mutated — authored "${a.label}", got "${String(e.label)}" (D-05)`
      );
    }

    if (e.sourceUrl !== undefined && e.sourceUrl !== a.sourceUrl) {
      throw new Error(
        `enrich rejected: step ${i} sourceUrl mutated — authored "${a.sourceUrl ?? '(none)'}", got "${String(e.sourceUrl)}" (D-05)`
      );
    }

    return { detail: e.detail };
  });
}
