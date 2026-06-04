---
phase: 1
reviewers: [claude]
reviewed_at: 2026-06-03T00:45:43Z
plans_reviewed: [01-01-PLAN.md, 01-02-PLAN.md, 01-03-PLAN.md]
independence_note: "Only `claude` CLI was installed; no cross-family reviewer (gemini/codex) available. Run in a fresh, context-free session — genuinely separate context, but same model family, so shared blind spots are possible. Not a true cross-AI review."
---

# Cross-AI Plan Review — Phase 1: Scaffold & Port

# Cross-AI Plan Review: Phase 1 — Scaffold & Port

## 1. Summary

These three plans are unusually disciplined for a scaffolding phase: tight scope, clean sequential dependency chain (01→02→03 via `depends_on` + waves), deterministic build gates, a real human-verify checkpoint as the parity arbiter, and correctly-anticipated platform gotchas (the Vercel `functions` runtime schema error, JSON's lack of comment support). They do achieve the four ROADMAP success criteria, and the summaries confirm they shipped. My concerns are not about whether the phase "worked" — it did — but about a handful of fragile spots that got lucky, one justification that's factually wrong and collides with a hard competition constraint (CDN fonts vs. "no internet at venue"), and a gap between the machine-checked gates and the truths they claim to prove.

## 2. Strengths

- **Dependency ordering is correct and explicit.** Waves + `depends_on` make 01→02→03 unambiguous; folder-ownership model means no cross-plan file collisions.
- **Deterministic gates over flaky ones.** Choosing `vite build` (exits 0) instead of backgrounding a dev server is the right call for automated verification.
- **The `! grep -q "api.anthropic.com"` chain gate** is a genuinely good security check — it fails the build if the broken/exposed fetch survives the port. Backed by a Network-tab check in the human checkpoint.
- **Platform footguns pre-empted.** The plan explicitly forbids a `functions` runtime block in `vercel.json` and explains why — that's exactly the error most first-time Vercel+TS deploys hit.
- **Honest scoping.** CITIES_DATA and the financial functions are deliberately left inline with a clear "this is Phase 3" rationale. No premature migration, no scope creep.
- **Secrets hygiene is real, not theatrical.** `.env` gitignored before first commit, `.env.example` committed, `grep sk-ant` gate in 03. Phase-1 attack surface is genuinely near-zero.

## 3. Concerns

**[MEDIUM] Google Fonts moved to `index.html` is justified as "offline resilience" — that's backwards, and it collides with the venue's hard constraint.** Plan 01 Task 1 Step 4 says moving the Google Fonts `<link>` out of the `useEffect` into `<head>` "prevents the flash on load and improves offline resilience." It prevents FOUT, yes — but a CDN `<link>` to `fonts.googleapis.com` is *not* offline-resilient; it still requires network. PROJECT.md lists "Internet Access: Not Provided" at the venue as a hard constraint, with hotspot as the only mitigation. If the hotspot drops mid-demo, Instrument Serif / Manrope / JetBrains Mono silently fall back to system fonts and the entire visual identity (a scored rubric item and the app's main "wow") degrades. The fix (self-host/bundle the fonts) is legitimately deferrable to the Phase 5 offline-cache work, but the plan's stated *reasoning* is wrong and could lull later phases into thinking fonts are already handled. Flag it as a known offline gap, don't bank it as "resilient."

**[MEDIUM] Plan 02 Step 2e (the useEffect surgery) is self-contradictory and risks dropping the entry animation.** The instruction first implies the font-link is "the only side effect," then says "remove the whole useEffect block," then says "the anim timeout can be moved to its own useEffect." If an executor reads "remove the whole block" literally, the fadeIn/`anim` state timeout dies with it and the landing screen loses its intended animated entrance — a visual regression the `vite build` gate cannot catch (it's not a build error). The only thing standing between this and a shipped regression is the human checkpoint. The step should have been written as two explicit edits: (a) delete the font-link append, (b) preserve the anim `setTimeout` in its own effect — with the before/after shown, not described.

**[MEDIUM] Plan 03's automated gate does not verify the truths it asserts.** `must_haves.truths` claims "App deploys and returns HTTP 200" and "`/api/health` returns `{ok:true,phase:1}`," but Task 3's `<verify>` is only `git log | grep -ci vercel`. The live-URL and health-endpoint checks live in `acceptance_criteria` and the human resume-signal, i.e. they're human-attested, never machine-verified. That's defensible because deploy requires Gabriel's Vercel account — but as written, a green automated gate proves nothing about the deploy actually working. At minimum the plan should instruct a `curl <url>/api/health | grep '"phase":1'` as part of the checkpoint evidence, not just "paste the URL."

**[LOW] React 19 + `StrictMode` over a React-18-era prototype.** `src/main.jsx` wraps the app in `StrictMode`, which double-invokes effects in dev. The prototype has timer-based effects (the anim `setTimeout`, and originally the AI fetch). React 19 also dropped function-component `defaultProps` and changed ref handling. None of this broke (summary confirms), but the plan never flags 19-vs-18 as a porting risk — it pins `react@19` and moves on. For a pure port labeled "no behavior change," jumping a major React version is a quiet risk that deserved a one-line acknowledgement.

**[LOW] Bleeding-edge major pins with no fallback.** `vite@8`, `@vitejs/plugin-react@6`, `react@19` are hard-pinned. It resolved fine, but pinning unreleased/just-released majors in a plan is a coin-flip; a `^` range or a "if 8 unavailable, use latest" fallback would have de-risked it.

**[LOW] `min_lines: 800` as an artifact check is a meaningless quality gate.** A faithful port and a broken copy-paste both clear 800 lines. The check implies parity assurance it can't provide. Harmless because the human checkpoint is the real gate, but it dresses up line-count as correctness.

**[LOW] ROADMAP criterion wording vs. implementation.** Success criterion #3 says the STACK decision must be a "STACK decision comment." The plan correctly notes JSON has no comments and uses a `"notes"` key instead — a fine adaptation, but a `"notes"` field is not a comment, so a strict reading of the criterion is satisfied only in spirit. Worth a one-word criterion update so future audits don't flag it.

## 4. Suggestions

1. **Rewrite Plan 02 Step 2e as two concrete edits** (delete font-link effect; keep anim `setTimeout` in its own effect), ideally with the exact before/after JSX, so the executor can't accidentally kill the animation.
2. **Add an offline-fonts TODO now, executed in Phase 5.** Self-host the three fonts (e.g. `@fontsource/*` or local `woff2` + `@font-face`) so the demo's visual identity survives a dropped hotspot. Correct the Plan 01 rationale from "offline resilience" to "prevents FOUT (still network-dependent until Phase 5 bundles fonts)."
3. **Strengthen Plan 03's checkpoint evidence**: require the human to paste `curl <url>/api/health` output, not just the URL, and make HTTP-200 on `/` an explicit pasted check. Consider a follow-up automated smoke test once the URL is known.
4. **Add a one-line React 19 porting note** to Plan 02 (defaultProps removed, StrictMode double-invoke) so any post-port flicker/double-timer is diagnosed fast instead of mystifying the human verifier.
5. **Replace `min_lines: 800`** with something meaningful or drop it — e.g. assert presence of each screen's sentinel (landing CTA text, all 5 quiz step markers, the `coming_soon` placeholder string) via grep, which actually correlates with "all screens ported."
6. **Loosen the version pins** to `^`-ranges with a recorded "as-resolved" note, so re-running the scaffold months later (or on a teammate's machine) doesn't fail on a yanked exact version.

## 5. Risk Assessment

**Overall: LOW–MEDIUM.**

Justification: This is a foundational, low-surface phase, and the plans are well-structured — clean ordering, real gates, a human parity checkpoint, and correct security hygiene. The phase demonstrably shipped. It lands at the top of LOW rather than squarely there because three of the findings are regression-or-constraint risks that the *automated* gates structurally cannot catch (animation drop, deploy/health truths, CDN-font fragility against a hard competition constraint), leaning entirely on human verification or deferred to later phases. None threaten the build; one (offline fonts) could quietly bite on stage if it's not tracked forward. Tighten Plan 02's effect surgery, log the offline-font gap explicitly, and make Plan 03's deploy evidence machine-checkable, and this is a clean LOW.

---

## Consensus Summary

Single-reviewer pass (fresh `claude` session), so "consensus" = this reviewer's prioritized takeaways. Phase 1 already shipped and met its ROADMAP success criteria; findings are about fragility and forward-tracking, not build failure.

### Top Concerns (priority order)
1. **[MEDIUM] CDN Google Fonts justified as "offline resilience" — backwards.** A `fonts.googleapis.com` `<link>` still needs network; it only fixes FOUT. Collides with the venue's hard "Internet Access: Not Provided" constraint. If the hotspot drops on stage, the app's whole visual identity (a scored rubric item) silently degrades to system fonts. Track as a known offline gap; self-host fonts in Phase 5. Fix the rationale wording so later phases don't bank fonts as "handled."
2. **[MEDIUM] Plan 02 Step 2e useEffect surgery is self-contradictory** — "remove the whole useEffect block" read literally kills the landing entry animation (`anim` setTimeout). A visual regression `vite build` cannot catch; only the human checkpoint stands in the way. Should be two explicit edits: delete font-link append, preserve anim timeout in its own effect.
3. **[MEDIUM] Plan 03's automated gate doesn't verify the truths it asserts** — `must_haves.truths` claims HTTP-200 deploy + `/api/health` returns `{ok:true,phase:1}`, but the only machine check is `git log | grep -ci vercel`. Make checkpoint evidence machine-checkable: `curl <url>/api/health | grep '"phase":1'`.

### Lower-severity / hygiene
- [LOW] React 19 + StrictMode over an 18-era prototype never flagged as a porting risk (double-invoked effects, dropped `defaultProps`).
- [LOW] Bleeding-edge exact pins (`vite@8`, `react@19`, `plugin-react@6`) with no fallback range.
- [LOW] `min_lines: 800` is a meaningless parity gate (a broken copy-paste clears it too).
- [LOW] ROADMAP criterion #3 says "STACK decision comment"; impl uses a JSON `"notes"` key (JSON has no comments) — satisfied in spirit; update the criterion wording.

### Overall Risk: LOW–MEDIUM
Foundational, low-surface phase; well-structured (clean ordering, real gates, human parity checkpoint, sound secrets hygiene) and it demonstrably shipped. Sits at the top of LOW because three findings are regression/constraint risks the automated gates structurally can't catch (animation drop, deploy/health truths, CDN-font fragility vs. a hard competition constraint). The offline-font gap is the one that could quietly bite on stage if not tracked forward.

### Divergent Views
N/A — single reviewer.
