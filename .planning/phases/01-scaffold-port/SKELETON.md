# Walking Skeleton — Potential

**Phase:** 1
**Generated:** 2026-05-30

## Capability Proven End-to-End

A user can open the app, complete the 5-step profile quiz, see a ranked list of 12 city matches with match scores and financial projections, and expand a city detail — all running locally via `npm run dev` and deployed live to a Vercel URL that auto-deploys on every push to main.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Build tool | Vite 8 + @vitejs/plugin-react 6 | Fastest HMR for single-JSX-component port; prototype drops in almost as-is; no SSR complexity needed for a demo |
| UI framework | React 19 (plain JSX in src/) | Prototype already React; JSX files in src/ are not type-checked (keeps the port fast and the existing inline-style patterns intact) |
| Styling | Existing inline styles (Instrument Serif / Manrope / JetBrains Mono) | Phase 1 is a port, not a redesign; Tailwind migration is deferred to later if needed |
| Language split | TypeScript for shared/ and api/; plain JSX (.jsx) for src/ | Contract + engine must be type-safe; UI components are fast-moving and prototype-origin; tsc scope limited to shared/ + api/ |
| API backend | Vercel serverless functions in api/ | One deploy (no separate server process); Anthropic key lives as Vercel env var; convention-based routing (api/*.ts → /api/*) |
| Deployment | Vercel (git integration → auto-deploy on push to main) | One-command deploy story for pitch; free tier; static front + serverless back in one project |
| State management | React useState + component-local state | No routing needed yet (Phase 1 is a single SPA screen flow); no external store; AppContext deferred to Phase 2 when quiz output needs to flow to results |
| Data layer | Curated static arrays (CITIES_DATA inline in PotentialApp.jsx) | No DB needed for demo; city data is authored, not fetched; migration to shared/data/cities.ts happens in Phase 3 |
| Directory layout | src/ (React UI) / shared/ (contract + engine + data) / api/ (serverless) / pitch/ (pitch track) | Defined in STRUCTURE.md; three parallel tracks that meet at shared/types.ts |

## Stack Touched in Phase 1

- [x] Project scaffold (Vite 8 + React 19, package.json, vite.config.js, tsconfig.json)
- [x] Routing — single SPA step machine (step 0: landing, step 1: quiz, step 2: results/detail) — no react-router-dom yet (Phase 2+)
- [ ] Database — no DB in this project; data is static JSON (by design for demo)
- [x] UI — full quiz + results + city detail interactive flow wired and rendering
- [x] Deployment — Vercel live URL, auto-deploy on push to main, /api/health stub proven

## Deviations from STACK.md Recommendations

| STACK.md Recommendation | Phase 1 Choice | Reason |
|---|---|---|
| Tailwind CSS 4.1 | Inline styles (as-is from prototype) | Phase 1 is a port; no visual redesign; Tailwind deferred |
| shadcn/ui | Not installed | Same reason; deferred |
| Hono proxy server | Vercel serverless functions in api/ | Locked in 01-CONTEXT.md (D-04): one Vercel project, no separate server process |
| react-router-dom | Step machine (useState) | No multi-page routing needed until Phase 2; deferred |
| TanStack Query | Not installed | Needed for the cache/proxy layer in Phase 5; not relevant for Phase 1 |
| framer-motion | Not installed | Existing CSS transition animations in prototype are sufficient for Phase 1 |
| concurrently | Not needed | api/ runs as Vercel serverless (not a separate Node process); vercel dev handles both |

## Out of Scope (Deferred to Later Slices)

- Anthropic proxy and live AI data layer (Phase 5 — FOUND-03, LIVE-01..04)
- Quiz using shared/types.ts Profile contract (Phase 2 — QUIZ-01..05)
- Scoring engine + financial calculator extracted to shared/engine/ (Phase 3 — MATCH-01, FIN-01)
- International cities with country-correct financial models (Phase 4 — MATCH-02, FIN-02)
- Offline golden-path cache (Phase 5 — FOUND-04)
- Relocation roadmap (Phase 6 — ROAD-01..03)
- Visa concierge (Phase 7 — VISA-01..04)
- Freemium tier gate + DemoTierSwitcher (Phase 8 — TIER-01..03)
- AppContext / global state store (Phase 2+)
- react-router-dom (Phase 2+)
- Tailwind CSS / shadcn/ui (deferred indefinitely unless needed)
- Real API key / Anthropic integration (Phase 5)

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering these architectural decisions:

- Phase 2: User completes the quiz and submits a Profile object (including citizenship/immigration status) to a real AppContext store
- Phase 3: Ranked city results with income-adjusted financials run offline from static data (first fully demoable offline slice)
- Phase 4: International cities (Lisbon, Berlin, Toronto, London) added with country-correct financial models
- Phase 5: Server-side proxy in api/ (Vercel functions), live AI data via Anthropic web_search, golden-path offline cache
- Phase 6: Relocation roadmap (template-first, offline-readable, PDF export)
- Phase 7: Visa concierge (premium screener, pathway comparison, cited sources)
- Phase 8: Freemium tier gate UI + DemoTierSwitcher (all four tiers demonstrable in 60 seconds)
- Phase 9: Pitch business substance (market sizing, competitive positioning, financials)
- Phase 10: Pitch deck, rehearsal, protocol compliance
