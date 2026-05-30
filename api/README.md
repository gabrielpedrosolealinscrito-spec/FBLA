# `api/` — Backend track (Vercel serverless functions)

Server-side functions. **Owned by the backend track.** This is where the Anthropic API key lives (as a Vercel env var) — **never** in client code.

**Responsibilities**
- Anthropic proxy for the live-AI layer (LIVE-01..04): jobs, housing, day-in-the-life, etc. Frontend calls these endpoints; this function calls Anthropic with `web_search` and returns typed `LiveDataResponse`.
- Robust parsing + fallback: on API/parse failure, serve the bundled golden-path cache and set `fromCache: true` (FOUND-04 / LIVE-04). Never return a broken/blank state — the demo runs on stage.

**Rules**
- Return shapes from `../shared/types.ts`.
- Validate and sanitize LLM output before returning (assume it can be malformed).
- Keep secrets in env vars. The `.env` file is gitignored; document required keys in `.env.example`.

Built in ROADMAP Phase 5 (Proxy, Live AI & Golden-Path Cache).
