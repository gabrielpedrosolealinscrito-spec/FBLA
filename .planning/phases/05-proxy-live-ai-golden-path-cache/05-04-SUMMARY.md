---
phase: 05-proxy-live-ai-golden-path-cache
plan: 04
subsystem: api
tags: [capture-script, golden-path, typescript, tsx, web-search, anthropic]
dependency_graph:
  requires:
    - "05-02: api/live.ts proxy at localhost:3000/api/live"
    - "05-03: client wiring (demo-profile.json cities drive capture keys)"
    - "data/golden-path/demo-profile.json: persona + cities the script reads"
  provides:
    - "scripts/capture-golden-path.ts: re-runnable real-proxy snapshot generator (D-07)"
    - "scripts/tsconfig.json: isolated type-check for scripts/ without polluting root tsc"
    - ".env.example: ANTHROPIC_API_KEY + web_search Console prerequisite documented"
  affects:
    - "Task 2 (human-action): run the real capture with key + dev server"
    - "Task 3 (human-verify): SC1-SC5 end-of-phase manual verification"
tech_stack:
  added:
    - "scripts/capture-golden-path.ts: pure Node/fetch script, no new deps (run via npx tsx)"
    - "scripts/tsconfig.json: isolated tsconfig extending root"
  patterns:
    - "fromCache guard: capture throws and never writes on fromCache:true — prevents stale snapshot"
    - "Data-driven city list: cities read from demo-profile.json, not hardcoded — re-pin is a data edit"
    - "typeRoots pointing to nested @types/node under @vercel/node — @types/node not at root"
key_files:
  created:
    - "scripts/capture-golden-path.ts"
    - "scripts/tsconfig.json"
  modified:
    - ".env.example"
key_decisions:
  - "typeRoots in scripts/tsconfig.json points to @vercel/node/node_modules/@types to resolve @types/node v20 (not installed at root)"
  - "Housing category derived from demo-profile.json.housing at runtime: rent->housing_rent, else housing_buy — so re-capture with a buy persona just works"
  - "Task 2 and Task 3 are PENDING HUMAN: require real ANTHROPIC_API_KEY + web_search enabled in Anthropic Console + vercel dev running"

requirements-completed: []

duration: ~15min
completed: 2026-06-05
---

# Phase 05 Plan 04: Golden-Path Capture Script (Task 1 Complete) — Summary

**Re-runnable capture script (scripts/capture-golden-path.ts) reads demo-profile.json for persona + cities, POSTs each category x city to the local proxy, throws on any fromCache:true response to prevent stale snapshots, and writes byte-identical-keyed output to demo-results.json.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-06-05T00:00:00Z
- **Completed:** 2026-06-05
- **Tasks:** 1/3 (Tasks 2-3 PENDING HUMAN)
- **Files modified:** 3

## Accomplishments

- Task 1 complete: capture script + scripts/tsconfig.json built and type-checked in isolation
- Automated verify command passes: `npx tsc -p scripts/tsconfig.json --noEmit`, `npx tsc --noEmit`, `fromCache` guard present, `demo-profile` read, no bare-token city list
- .env.example updated with ANTHROPIC_API_KEY + "enable web search in Console" note (Pitfall 6)

## Task Commits

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | scripts/capture-golden-path.ts + scripts/tsconfig.json + .env.example | 3f6ea72 | Done |
| 2 | Run real capture (human-action) | — | PENDING HUMAN |
| 3 | SC1-SC5 end-of-phase verification (human-verify) | — | PENDING HUMAN |

## Files Created/Modified

- `scripts/capture-golden-path.ts` — re-runnable real-proxy snapshot generator; reads persona + cities from demo-profile.json; fromCache guard; writes to data/golden-path/demo-results.json
- `scripts/tsconfig.json` — extends root tsconfig, includes ./*.ts, types=["node"], lib=["ES2022"], typeRoots pointing to nested @types/node; scripts/ type-checks in isolation without polluting root
- `.env.example` — added ANTHROPIC_API_KEY note + "enable web search in Console" prerequisite

## Decisions Made

1. **typeRoots to nested @types/node**: `@types/node` is not installed at root level — it's nested under `@vercel/node/node_modules/@types/node` (v20.11.0). `scripts/tsconfig.json` uses `typeRoots` pointing there to resolve `fetch` + `fs` types. This is the minimal fix without adding a new package to devDependencies.

2. **Housing category derived at runtime from demo-profile.json**: `profile.housing === 'rent'` → `housing_rent`, else `housing_buy`. Current demo persona is `rent`. A future re-pin of the persona to a buy preference just works with no code edit.

3. **3 categories captured, not 4**: D-09 ships only `jobs`, the persona-matched `housing_*`, and `dayinlife`. The existing `demo-results.json` stub has both `housing_rent` AND `housing_buy`. A real re-capture with persona=rent will write only `housing_rent` — this drops the `housing_buy` block from demo-results.json. That is correct and intentional (persona is rent; buy data is legacy stub). Flagged here so it is not read as data loss.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] typeRoots for nested @types/node**
- **Found during:** Task 1 (scripts/tsconfig.json creation)
- **Issue:** `@types/node` is not at root `node_modules/@types/` — only nested under `@vercel/node/node_modules/@types/`. Plain `types: ["node"]` without `typeRoots` would fail to resolve `fetch`/`fs` types.
- **Fix:** Added `typeRoots` in `scripts/tsconfig.json` pointing to the nested location and root `@types`. Verified with `npx tsc -p scripts/tsconfig.json --noEmit` passing clean.
- **Files modified:** scripts/tsconfig.json
- **Verification:** Both tsc commands pass with no output.
- **Committed in:** 3f6ea72 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - Blocking)
**Impact on plan:** Single blocking type-resolution issue, self-contained fix in scripts/tsconfig.json. No scope creep.

## Pending Human Tasks

### Task 2 (checkpoint:human-action — blocking)

**What:** Run the real capture against live Anthropic API.

**Requires:**
1. Confirm/finalize `data/golden-path/demo-profile.json` against the rehearsed demo script
2. Set `ANTHROPIC_API_KEY` in `.env`
3. Enable web_search in Anthropic Console org settings
4. Run `npm run dev:full` (vercel dev) in one terminal
5. Run `npx tsx scripts/capture-golden-path.ts` in another

**Resume signal:** Type "captured" once demo-results.json holds real data, or "stub" to ship on the valid stub.

**Note:** Current demo-results.json already holds a well-structured stub for Austin, TX and London, UK covering jobs, housing_rent, housing_buy, and dayinlife. The stub is valid-shaped and will serve as the offline fallback even before a real capture run.

### Task 3 (checkpoint:human-verify — blocking)

**What:** SC1-SC5 end-of-phase manual verification.

**Requires:**
1. SC1/LIVE-01..03: real listings stream on a working hotspot
2. SC2/FOUND-03: DevTools shows zero api.anthropic.com calls; `grep -r "sk-ant" dist/` returns nothing
3. SC4/FOUND-04: hotspot-kill renders golden-path instantly, no spinner/no blank, no cache badge
4. SC5/LIVE-04: no crash on failure path
5. `npm test` exits 0

**Resume signal:** Type "verified" with SC1-SC5 results.

## Issues Encountered

None beyond the typeRoots deviation documented above.

## Verification Results

### Automated (GREEN — Task 1)

```
npx tsc -p scripts/tsconfig.json --noEmit    → clean (capture script type-checks)
npx tsc --noEmit                             → clean (root — api/ + shared/ unaffected)
grep -q "fromCache" scripts/capture-golden-path.ts   → found
grep -q "demo-profile" scripts/capture-golden-path.ts → found
! grep -qE "\['Austin', ?'Lisbon'\]|..." scripts/capture-golden-path.ts → not found (pass)
```

Full plan verify command: PASSED.

### Pending (Tasks 2-3)

- Real live capture (human-action): PENDING
- SC1-SC5 manual verification (human-verify): PENDING

## Known Stubs

`data/golden-path/demo-results.json` currently holds a valid-shaped stub (not real captured data). The capture script exists to overwrite it with real data at Task 2. Until then, the offline fallback path (SC4/FOUND-04) works on this stub — it is the correct shape and key structure.

## Threat Surface Scan

No new network endpoints or auth paths introduced. The capture script is a dev-time tool that:
- Calls the local proxy (no direct Anthropic calls from scripts/)
- Writes to a local file only when all responses are fromCache:false (T-5-stale mitigation confirmed)

| Threat ID | Mitigation Verified |
|-----------|---------------------|
| T-5-stale | scripts/capture-golden-path.ts throws on fromCache:true; writeFileSync only reached when all fromCache:false |

## Next Phase Readiness

- Capture script ready; awaiting human Task 2 (real capture run) and Task 3 (SC1-SC5 sign-off)
- All automated infrastructure (proxy, client wiring, golden-path stub) in place
- Phase 05 can ship on the valid stub if Task 2 is deferred to pitch-prep

---
*Phase: 05-proxy-live-ai-golden-path-cache*
*Completed: 2026-06-05 (Task 1 only; Tasks 2-3 PENDING HUMAN)*

## Self-Check: PASSED

Files exist:
- scripts/capture-golden-path.ts: FOUND
- scripts/tsconfig.json: FOUND
- .env.example (modified): FOUND

Commits exist:
- 3f6ea72: FOUND (feat(05-04): golden-path capture script + scripts/tsconfig.json)
