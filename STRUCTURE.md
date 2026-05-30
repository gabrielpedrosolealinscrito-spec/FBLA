# Repo Structure & Collaboration Map — Potential

This repo is built by **three parallel tracks** (frontend, backend, pitch) that work async and meet at one shared contract. Read this before touching anything.

> Full project context: `.planning/PROJECT.md` · Requirements: `.planning/REQUIREMENTS.md` · Roadmap: `.planning/ROADMAP.md`

---

## Folder map & ownership

```
/
├── src/         FRONTEND track   — React UI (screens, components, styles)
├── shared/      CONTRACT (shared) — types + pure engine + data. Both code tracks depend on this.
├── api/         BACKEND track    — Vercel serverless functions (Anthropic proxy, live data)
├── pitch/       PITCH track      — business model, financials, market research, deck assets
├── .planning/   GSD planning     — shared brain (PROJECT, REQUIREMENTS, ROADMAP, research, workstreams)
└── potential_v2.jsx  prototype to port into src/, then delete
```

| Folder | Owner track | Don't edit unless you're... |
|--------|-------------|------------------------------|
| `src/` | **frontend** | frontend |
| `api/` | **backend** | backend |
| `shared/engine/`, `shared/data/` | **backend** | backend |
| `shared/types.ts` | **shared** (coordinate) | either code track — change in small, announced commits |
| `pitch/` | **pitch** | pitch |
| `.planning/workstreams/<your-track>/` | your track | your track only |

## The one rule: contract-first

`shared/types.ts` is the handshake between frontend and backend. **Agree on the types before building against them.**
- Backend implements `/api` endpoints and `shared/engine` functions that return these shapes.
- Frontend imports the types and renders them; it never reaches `api.anthropic.com` directly.
- Changing a type? Make it a tiny, standalone commit with a clear message so the other track can pull it fast.

This is what lets three people/AIs work at once without stepping on each other.

## Git flow (3 people committing)

- **One branch per track**: `frontend`, `backend`, `pitch`. Work there, push your branch, open a PR into `main`, merge.
- Always `git pull` before starting a session.
- Because the tracks live in different folders, merge conflicts should be rare — the only shared file is `shared/types.ts`.
- Everyone needs **write access** to `github.com/gabrielpedrosolealinscrito-spec/FBLA` (add each collaborator in repo Settings → Collaborators).

## GSD workstreams

Each track has an isolated planning space so plans/state don't collide:
- `/gsd:workstreams switch frontend` (or `backend` / `pitch`) sets your active track.
- Then `/gsd:plan-phase N` plans into that track's space.

## Deploy

- Hosted on **Vercel**. `src/` → static build; `api/` → serverless functions; Anthropic key is a Vercel env var (never client-side).
- `git push` to `main` → auto-deploy → live URL.

## Presentation

- Slides built in **Canva**. Raw material (talking points, sourced claims, financials) lives in `pitch/` so the deck and the live demo never drift.
- The live app demo IS part of the presentation (laptop screen, no projector). The deck wraps around it.

## How the roadmap maps to tracks

Product phases (ROADMAP Phases 1–8) are vertical slices — **frontend and backend each own their part of the same phase**, meeting at the contract. Phase 1 (scaffold) comes first and sets up this structure + the initial contract; after that, frontend and backend run async. Pitch (Phases 9–10) runs in parallel the whole time.
