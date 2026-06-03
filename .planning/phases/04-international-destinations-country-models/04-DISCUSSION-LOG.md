# Phase 4: International Destinations & Country Models - Discussion Log

**Date:** 2026-06-02
**Mode:** discuss (default, interactive)

> Human-reference record of the discuss-phase session. Decisions live in 04-CONTEXT.md (the downstream-consumed artifact). This log captures what was asked and chosen.

## Gray areas selected for discussion
User selected all four: Intl salary basis, Currency display, Openness weighting, Tax model depth.

## Area 1 — International salary basis
- **Q: Salary for a non-remote person abroad?** Options: Real local salaries (rec) / Country multiplier / Local salary bands.
  - **Chosen:** Real local salaries — researched, sourced per profession×city. (-> D-01)
- **Q: Remote workers (hasRemote) abroad?** Options: Keep US/remote income (rec) / Blend toward local.
  - **Chosen:** Keep US/remote income — already implemented in buildRawResult. (-> D-02)

## Area 2 — Currency display
- **Q: How to display intl figures?** Options: Dual local+USD (rec) / USD-normalized / Local only.
  - **Chosen:** Dual — local primary, USD secondary. (-> D-03)
- **Q: FX rate source (offline)?** Options: Hardcoded+sourced+dated (rec) / Live FX later.
  - **Chosen:** Hardcoded, sourced, dated (locked by Claude after user redirected to a Phase 2 topic; only sane offline choice). (-> D-04)

## Area 3 — Openness weighting
- **Q: How should opennessToAbroad move intl cities?** Options: Soft multiplier (rec) / Threshold gate / Flat additive swing.
  - **User response (freeform):** prefers a discrete 1–5 button scale over a slider ("hard to put on a specific number"); wants standardized input components across the quiz.
  - **Resolution:** Input control (1–5 buttons + standardized inputs) is a Phase 2 UI decision -> routed to Phase 2. Phase 4 engine behavior locked as: normalize to 0–1, soft multiplier, never strand. Coordination note: scale change = announced shared/types.ts change. (-> D-05, D-06)
- **Q: Does citizenship affect Phase 4 ranking/financials?** Options: Defer to Phase 7 (rec) / Light signal now.
  - **Chosen:** Defer to Phase 7. (-> D-07)

## Area 4 — Tax model depth
- **Q: How deep per-country tax models?** Options: Match US depth (rec) / Flat effective rate / Match US depth + more.
  - **Chosen:** Match US depth per country, standard resident rates, via existing FinancialModel registry. (-> D-08)
- **Q: Surface Portugal NHR/IFICI newcomer regime?** Options: Show clearly caveated (rec) / Standard rates only / Mention don't compute.
  - **User response (freeform):** mention but don't compute; add an "i" info button on anything "different"/not common knowledge that explains it on click/drag.
  - **Resolution:** NHR/IFICI mentioned, not in the math (D-09). Generalized to a reusable "i" info-tooltip pattern (explanation + source) for all uncommon country-specific concepts. (-> D-09, D-10)

## Deferred / routed
- Openness input = 1–5 buttons + standardized quiz inputs -> Phase 2 (UI-SPEC), with a shared/types.ts coordination note.
- Citizenship -> visa feasibility -> Phase 7.
- NHR/IFICI computed into take-home -> deliberately avoided.
- Live FX -> Phase 5.
- Expanded intl city DB -> v2.

## Side thread (not a Phase 4 decision)
User flagged the concurrent Phase 2 session: confirm it builds an adaptive/extensible quiz (per its own D-02/D-03), while keeping the 4 scoring factors (cost/career/lifestyle/safety) fixed per the locked Profile.weights contract. Directive routed to that session directly (separate worktree; not auditable from this branch).
