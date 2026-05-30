# Potential

**See where your life could look like — somewhere else.** A freemium web product that profiles who you are, matches you to real cities (US + international), shows what your money and life would actually look like there, and hands you a step-by-step roadmap to get there — including the immigration path.

Built for the **FBLA Collegiate Entrepreneurship Pitch Competition (2025–2026)**. Goal: place #1.

## Status

Early build. The first-pass prototype lives in `potential_v2.jsx` and is being rebuilt into a deployable app.

## How this repo is organized

Three parallel tracks meet at one shared contract. **Read [`STRUCTURE.md`](./STRUCTURE.md) before contributing.**

| Folder | What |
|--------|------|
| [`src/`](./src) | Frontend — React UI |
| [`shared/`](./shared) | The contract — types + pure engine + data |
| [`api/`](./api) | Backend — Vercel serverless functions (Anthropic proxy) |
| [`pitch/`](./pitch) | The business case + deck the judges score |
| [`.planning/`](./.planning) | Planning brain (project, requirements, roadmap, research) |

## Stack

Vite + React (frontend) · Vercel serverless functions (backend proxy) · Anthropic API w/ web search (live data layer) · deployed on Vercel.

## Run

_Toolchain is scaffolded in Phase 1 (`/gsd:plan-phase 1`). Setup instructions land here once it exists._
