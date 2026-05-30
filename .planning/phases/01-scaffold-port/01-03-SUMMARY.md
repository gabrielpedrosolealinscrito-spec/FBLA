---
phase: 01-scaffold-port
plan: 03
subsystem: infra
tags: [vercel, vite, serverless, deployment, api]

# Dependency graph
requires:
  - phase: 01-02
    provides: src/screens/PotentialApp.jsx ported prototype and api/health.ts serverless stub
provides:
  - Live Vercel deployment at https://fbla-ruddy.vercel.app (auto-deploys on push to main)
  - vercel.json with Vite build config (no runtime block — Vercel auto-detects api/*.ts)
  - Vercel CLI (vercel) installed as devDependency; dev:full script added to package.json
  - Walking skeleton proven end-to-end: local npm run dev + live public URL + /api/health 200
affects:
  - All subsequent phases that deploy new api/ functions or require the live URL for integration testing

# Tech tracking
tech-stack:
  added: [vercel (CLI + hosting), vercel.json config]
  patterns:
    - api/*.ts files auto-detected by Vercel as serverless Node functions (no runtime declaration in vercel.json)
    - vercel.json minimal config: buildCommand + outputDirectory + framework only
    - dev:full script uses vercel dev to serve both Vite frontend and api/ functions locally

key-files:
  created:
    - vercel.json
  modified:
    - .gitignore (confirmed .vercel entry present)
    - package.json (vercel devDependency + dev:full script)
    - .planning/STATE.md (live URL + walking skeleton recorded)

key-decisions:
  - "No 'functions' runtime block in vercel.json — Vercel auto-detects api/*.ts, adding a runtime declaration triggers a schema error"
  - "Deployment Protection disabled on Vercel project to allow public HTTP 200 at / and /api/health without authentication headers"
  - "dev:full = vercel dev for local full-stack (frontend + api/); existing dev = vite for frontend-only work"

patterns-established:
  - "Pattern: vercel.json three-field config (buildCommand, outputDirectory, framework) — do not add runtime blocks"
  - "Pattern: api/*.ts exports default handler(req, res) — Vercel file-system routing maps directly to /api/<name>"

requirements-completed: [FOUND-02]

# Metrics
duration: 10min
completed: 2026-05-30
---

# Phase 1 Plan 03: Vercel Deploy Summary

**vercel.json minimal config + Vercel CLI installed; Vite app + api/health.ts deployed live at https://fbla-ruddy.vercel.app with auto-deploy on push to main**

## Performance

- **Duration:** ~10 min (Task 1 committed by prior session; Task 3 this session)
- **Started:** 2026-05-30
- **Completed:** 2026-05-30T23:30:00Z
- **Tasks:** 3 (Task 1 auto, Task 2 human-action checkpoint, Task 3 auto)
- **Files modified:** 5

## Accomplishments

- vercel.json written with minimal three-field config; Vercel correctly auto-detects api/health.ts as serverless function
- Live URL https://fbla-ruddy.vercel.app returns HTTP 200 with the dark-theme Vite app
- /api/health returns {"ok":true,"phase":1} confirming serverless function wiring end-to-end
- Every push to main triggers an auto-deploy (8 deployments tracked across the session)
- No API key (sk-ant-) present in any committed .ts/.js/.json file

## Task Commits

Each task was committed atomically:

1. **Task 1: Write vercel.json, update .gitignore, install Vercel CLI** - `83c6655` (feat)
2. **Task 2: Link Vercel project and trigger first deploy** - human-action checkpoint (user deployed via Vercel Dashboard; disabled Deployment Protection for public access)
3. **Task 3: Commit vercel config and record live URL in STATE.md** - this session (docs)

**Plan metadata:** committed in this session (docs)

## Files Created/Modified

- `vercel.json` - Vite build config for Vercel (buildCommand: vite build, outputDirectory: dist, framework: vite)
- `.gitignore` - .vercel entry confirmed present (added in Plan 01-01 Task 1 Step 9)
- `package.json` - vercel devDependency added; dev:full script (vercel dev) added
- `package-lock.json` - lockfile updated for vercel CLI install
- `.planning/STATE.md` - live URL and walking skeleton status recorded

## Decisions Made

- No "functions" block in vercel.json: Vercel auto-detects api/*.ts files as serverless Node functions. Adding a bare runtime declaration causes "Function Runtimes must have a valid version" schema error. Three fields only.
- dev:full = vercel dev: This serves both Vite frontend and api/ serverless functions locally on the same port. The existing "dev": "vite" script retained for frontend-only work (faster, no Vercel runtime overhead).

## Deviations from Plan

### Notes (not bugs — user decisions)

**1. Deployment Protection disabled**
- **During:** Task 2 (Vercel project setup)
- **Situation:** Vercel projects have Deployment Protection enabled by default, which requires an Authorization header to access the live URL. This blocked public HTTP 200 verification.
- **Resolution:** User disabled Deployment Protection in Vercel Dashboard -> Project -> Settings -> Deployment Protection. The live URL is now publicly accessible without auth headers.
- **Security note:** Acceptable for Phase 1 (no secrets in the deployed code; /api/health returns only static JSON). Future phases adding authenticated routes should revisit this setting.
- **Impact:** None on plan goals — public access was the intended state for the walking skeleton proof.

---

**Total deviations:** 0 code deviations. 1 configuration note (Deployment Protection disabled — user decision, documented above).

## Issues Encountered

- Deployment Protection on Vercel blocked initial HTTP 200 verification. User resolved by disabling it in the dashboard. No code changes required.

## User Setup Required

Completed by user during Task 2 checkpoint:
- Vercel account connected to GitHub repo
- Project linked to main branch with auto-deploy enabled
- Deployment Protection disabled for public access
- Live URL confirmed: https://fbla-ruddy.vercel.app

## Next Phase Readiness

- Walking skeleton proven: local npm run dev works, live Vercel URL returns the app, /api/health confirms serverless function wiring
- Auto-deploy confirmed — every push to main is live within ~1 minute
- Phase 1 complete: all 3 plans done; Phase 2 (Quiz & Profile Capture) can begin
- No blockers. ANTHROPIC_API_KEY not present in any committed file (confirmed by grep scan).

---
*Phase: 01-scaffold-port*
*Completed: 2026-05-30*
