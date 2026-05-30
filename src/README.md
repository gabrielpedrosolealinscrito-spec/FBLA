# `src/` — Frontend track

React UI for Potential. **Owned by the frontend track.**

```
src/
├── screens/      Landing · Quiz · Results · CityDetail · Roadmap · Visa · Paywall
├── components/   reusable UI (cards, pills, tier gate, progress, etc.)
└── styles/       theme (dark; Instrument Serif / Manrope / JetBrains Mono)
```

**Rules**
- Import domain types from `../shared/types.ts`. Never invent your own shapes.
- Never call `api.anthropic.com` directly. Call your own `/api/*` endpoints (backend track owns those).
- Reference design: the existing `potential_v2.jsx` prototype — port its visual identity, don't regress it.

Scaffolded in ROADMAP Phase 1. Quiz = Phase 2; Results/financials = Phase 3; etc.
