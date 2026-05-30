# Phase 1: Scaffold & Port - Context

**Gathered:** 2026-05-30
**Status:** Ready for planning
**Source:** Direct capture (decisions from new-project + structure setup)

<domain>
## Phase Boundary

Foundational phase. Turn the existing single-file React prototype into a real, deployable Vite + React app with the collaborative folder structure already scaffolded, and ship it live to Vercel. This is the Walking Skeleton: the thinnest end-to-end slice (app renders → deploys → live URL) that every later phase builds on. It runs BEFORE the frontend/backend split — after Phase 1 merges, the three tracks work async.

Delivers: FOUND-01 (branches reconciled — already done manually), FOUND-02 (builds/runs locally + ports prototype with no visual regression). Note: FOUND-03 (server proxy) and FOUND-04 (offline cache) are Phase 5, NOT here — Phase 1 stubs the `api/` dir but does not build the proxy.
</domain>

<decisions>
## Implementation Decisions (LOCKED)

### Stack
- **Build tool:** Vite (latest). React (latest). No Next.js — research confirmed Vite ports the prototype with minimal restructuring; Next would be a rewrite.
- **Language:** **TypeScript for `shared/` and `api/`** (the typed contract + engine + proxy). **Plain JSX (.jsx) for React components in `src/`.** `shared/types.ts` is already written in TS and is the contract.
- **Styling:** Port the prototype's existing inline-style dark theme as-is for now (Instrument Serif / Manrope / JetBrains Mono via Google Fonts). Do NOT redesign. A styling-system decision (e.g. Tailwind) can come later; Phase 1 must not regress the existing visual identity.

### Deployment
- **Deploy to Vercel in this phase.** Phase 1 ends with a live URL that auto-deploys on every push to `main`.
- Frontend = Vercel static build of the Vite app. `api/` folder is created (Vercel serverless convention) but endpoints are stubbed — the real Anthropic proxy is Phase 5.
- Anthropic API key is NOT introduced in Phase 1 (no live calls yet). Add `.env.example` documenting future env vars; ensure `.env` is gitignored.

### Porting
- Move `potential_v2.jsx` into `src/` (e.g. `src/screens/` + extract data/constants), wire it as the app's main view, then delete the root `potential_v2.jsx`.
- The prototype's broken client-side `fetch` to `api.anthropic.com` must be DISABLED/stubbed during the port (it doesn't work and exposes keys). Live data is wired in Phase 5 via `api/`. The AI sections can show a "coming soon"/placeholder state for now.
- Pull the prototype from git history if needed: it's at repo root after the branch reconcile.

### Structure (already scaffolded — conform to it)
- `src/` frontend · `shared/` contract+engine+data · `api/` backend stubs · `pitch/` pitch track. See `STRUCTURE.md`.
- Components import types from `shared/types.ts`. Never call `api.anthropic.com` from the client.

### Walking Skeleton acceptance
The thinnest end-to-end proof: `npm run dev` runs the ported app locally with no console errors and no visual regression vs the prototype, AND the app is deployed to a live Vercel URL that updates on push.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Stack & architecture
- `.planning/research/STACK.md` — Vite + React versions, the Hono-vs-Vercel proxy pattern, the broken-fetch fix, data sources
- `.planning/research/ARCHITECTURE.md` — component boundaries, build order, the offline/proxy design (proxy itself is Phase 5)
- `STRUCTURE.md` — repo layout, folder ownership, contract-first rule, git flow, Vercel
- `shared/types.ts` — the provisional frontend↔backend contract to finalize/confirm

### What we're building
- `.planning/PROJECT.md` — project context + locked decisions (incl. Vercel, 3-track, contract-first)
- `.planning/ROADMAP.md` — Phase 1 scope + how later phases depend on it
- `potential_v2.jsx` — the prototype being ported (visual source of truth; do not regress it)

**Deviation from research:** STACK.md recommends a standalone Hono proxy. We are using **Vercel serverless functions in `/api`** instead (one deploy, key as Vercel env var). Apply this substitution wherever STACK.md says "Hono server."
</canonical_refs>

<specifics>
## Specific Ideas
- Keep the prototype's visual identity pixel-faithful; this is a port, not a redesign.
- `api/` gets a trivial stub endpoint (e.g. health check) so the Vercel functions wiring is proven, but no Anthropic integration yet.
- Confirm `shared/types.ts` compiles and is importable from both `src/` and `api/`.
</specifics>

<deferred>
## Deferred Ideas
- Anthropic proxy + live data + offline golden-path cache → Phase 5 (FOUND-03, FOUND-04, LIVE-*)
- Quiz/profile capture → Phase 2
- Tailwind or any styling-system migration → later, only if needed
- Real env vars / API keys → Phase 5
</deferred>

---

*Phase: 01-scaffold-port*
*Context gathered: 2026-05-30 via direct capture*
