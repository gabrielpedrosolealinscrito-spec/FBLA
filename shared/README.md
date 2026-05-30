# `shared/` — The contract (both code tracks depend on this)

```
shared/
├── types.ts      THE handshake — Profile, City, MatchResult, Roadmap, VisaPathway, Tier...
├── engine/       pure functions: scoring + financial models (backend-owned, fully testable)
│   └── country-models/   country-correct tax/cost models (FIN-02): US, Portugal, Germany, Canada, UK
└── data/         city data, visa pathway content, roadmap templates (backend-owned)
```

**Ownership**
- `types.ts` — **shared**. Either code track may change it, but in small, announced commits (it's the one file both tracks read).
- `engine/` and `data/` — **backend track**.

**Why pure functions matter:** scoring + financials are deterministic functions of `Profile` + static `data/`. They run with **zero network**, which is what makes the offline demo (FOUND-04) possible. Keep side effects out of `engine/`.
