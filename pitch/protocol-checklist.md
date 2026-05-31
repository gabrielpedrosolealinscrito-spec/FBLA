# Protocol Compliance Checklist (PITCH-09)

**Purpose:** Binary day-of pre-competition checklist for the FBLA Entrepreneurship Pitch.  
**Type:** Day-of pre-competition verification — every item is YES or NO. Any NO blocks competition entry.  
**Day-of process:** The non-presenting partner (the one who is NOT setting up the devices) runs through this checklist item by item while the other presenter sets up. Both partners must sign off before entering the competition room.

> **CRITICAL RULE:** This checklist is the last action before entering the competition room. One unchecked box (one QR code, one leave-behind, one uncharged device) drops the Protocol Adherence rubric row from 10 points to 0. There are no partial points.

---

## Pre-Competition (authored now; verify the day before and morning of competition)

### Timing

- [ ] Full run-through with demo timed on phone hotspot: clock reads between 8:30 and 9:00
- [ ] Hard cap: clock never exceeded 10:00 in any rehearsal run (any run over 10:00 must be corrected before competition)
- [ ] Marketing section (Slide 11) is the designated safe-compress zone — both presenters know to cut it from ~0:45 to ~0:30 if running long after the demo
- [ ] Demo slot hard-cut rule memorized: if the clock reads 8:00 and the demo is still running, transition immediately to Slide 8 (Business Model) regardless of demo state

### Device Rules

- [ ] Maximum two devices total brought into the competition room (laptop/tablet/phone/laptop-sized monitor — any combination)
- [ ] Only ONE device faces the judges (the presentation/demo laptop); the second device, if used, faces the presenters only
- [ ] Both devices tested on battery power for the full 10-minute duration before competition day
- [ ] Both devices run entirely on battery during the pitch — all chargers and power cables are unplugged before entering the competition room
- [ ] No external speakers connected to any device (built-in device speakers only, or no audio at all)

### Links, QR Codes, and URLs

- [ ] Zero QR codes on any slide or on any device screen visible to judges — every slide reviewed for QR codes, every screen checked
- [ ] Zero URLs formatted as clickable hyperlinks on any slide (plain-text display only; do not hyperlink any URL that appears on slides)
- [ ] Judges will not be asked to scan, click, follow, or otherwise interact with any digital element during the presentation
- [ ] Demo uses the golden-path scripted flow only — no live judge-accessible URLs, no prompts to judges to visit a site

### Physical Materials

- [ ] No printed materials, handouts, one-pagers, leave-behinds, or business cards brought into the competition room with the intent to give to judges
- [ ] Nothing is left with judges after the presentation (no USB drives, no paper, no printed slides, no cards)
- [ ] Neither presenter approaches or makes contact with the judge table at any point during setup or during the presentation

### Setup and Conduct

- [ ] No interaction with judges during the setup period (before the presentation officially begins)
- [ ] Presentation is aligned to the assigned topic: Entrepreneurship Pitch — new business venture (Potential — a place-matching and relocation-planning product)
- [ ] No food, beverages, or live animals brought into the competition room

### Content Compliance

- [ ] Every quantitative claim in the deck has an audible source attribution — the source-attribution cue appears in the speaker notes for each claim bullet (e.g., "According to the US Census Bureau's Current Population Survey…") so the Sources rubric row is satisfied during live delivery (ties to `pitch/deck/deck-outline.md` speaker notes)
- [ ] All visa/immigration-concierge content visible in the demo or referenced in the pitch carries the "not legal advice — consult a licensed immigration attorney" framing; this disclaimer is visible on every visa-concierge screen
- [ ] No claim asserts that Potential guarantees visa eligibility, legal outcomes, or data accuracy beyond the cited source dates
- [ ] All F1–F7 founder-verify flags reviewed (see Founder-Verify Flags section below); any HIGH-priority flag still unresolved is either dropped for its stated proxy or qualified with "approximately" + the derivation method

### Dress Code

- [ ] Both presenters (Luke and Gabriel) are in business professional attire: suit or blazer, collared shirt or blouse, dress shoes — FBLA standard
- [ ] No casual wear on competition day: no jeans, no sneakers, no t-shirts, no athleisure

---

## At Rehearsal (items that require live testing — Phase 8-gated; do not tick until Phase 8 is Complete)

> **NOTE:** These items cannot be meaningfully verified without a live demo, a competition laptop, a phone hotspot, and both presenters in the room. They are listed here so they can be ticked off immediately once the Phase 8 rehearsal runs. Do not pre-tick these.

- [ ] Golden-path fallback deliberately triggered by killing the hotspot mid-demo — confirmed renders instantly with no spinner and no blank state (the cached golden-path output appears immediately)
- [ ] Demo slot timed on the actual competition laptop using a phone hotspot, with both presenters present — actual clock time recorded (target: ~2:30; acceptable range: 1:30–3:00)
- [ ] Both presenters have run the full Q&A bank aloud at least once, not just read it silently — any fumble noted for re-rehearsal
- [ ] Clock verification: three independent full timed run-throughs all land between 8:30 and 9:00; none exceeds 10:00

---

## Rehearse-Later Specification (Phase 8-Gated)

> **PRECONDITION: Phase 8 must be Complete (live demo + DemoTierSwitcher cycling all four tiers + golden-path fallback confirmed) before any item below runs. These items are NOT executed in this planning pass.**

The items below are fully specified so execution is a simple check-off the moment Phase 8 ships. No further planning or authoring work is required at that time — only running through this list in order.

### Pre-Conditions (all three must be TRUE before rehearse-later begins)

1. Phase 8 is verified Complete: live demo works end-to-end, DemoTierSwitcher cycles all four tiers (Free / Basic / Plus / Premium), and golden-path fallback renders instantly on hotspot kill
2. Demo golden-path script is written: specific profile inputs → specific city result(s) → specific outputs shown to judges (the exact scripted run, not free-form exploration)
3. Demo hard-cut timing rule is agreed and memorized: default is to transition to Slide 8 at 8:00 on the clock regardless of demo state; both presenters accept this as non-negotiable

### Rehearse-Later Task List

| Task | Who | Notes |
|------|-----|-------|
| Time the demo on the competition laptop on phone hotspot | Gabriel (assumed demo driver) | Record min/avg/max clock times. Target: ~2:30. Acceptable: 1:30–3:00. If >3:00 in any run, tighten the golden-path script. |
| Confirm demo-slot length → update deck-outline.md timing table | Both | If demo runs ~2:30, total target is ~8:30 — ideal. If demo runs ~2:00, redistribute the 30s to the marketing section. |
| Solo run-through #1 (Luke): Luke delivers all his sections aloud with stopwatch | Luke | Luke's sections: Slides 1–6 (narrative arc), Slide 8 (Business Model), Slide 11 (Marketing), Slide 12 (Ask). Target: ~3:30. Note where he runs slow. |
| Solo run-through #1 (Gabriel): Gabriel delivers all his sections aloud with stopwatch | Gabriel | Gabriel's sections: Slides 9–10 (Financials) + demo section timing check. Target: ~2:30. |
| Full paired run-through #1 with demo: clock the complete pitch | Both | Target: 8:30–9:00. If >9:00, apply the cut rule: compress Marketing from 0:45 to 0:30. |
| Full paired run-through #2: timed on phone hotspot (actual demo conditions, not WiFi) | Both | Must be on hotspot. Record the actual clock. Confirm golden-path fallback by deliberately killing the hotspot at a demo midpoint. |
| Full paired run-through #3: timed; mock judge drills Q&A bank immediately after | Both + mock judge | The mock judge asks at least 15 of the 20 Q&A-bank questions in random order, including the six hardest: Q1 (data accuracy), Q2 (CAC/LTV), Q3 (legal advice), Q5 (API failure), Q6 (Teleport), Q11 (year 1 revenue). Every fumble is noted for re-rehearsal. |
| Verify protocol checklist items requiring live testing (battery, fallback, both-devices) | Both | Kill hotspot mid-run to confirm fallback. Confirm both devices are on battery. Tick the At-Rehearsal items above. |
| Final protocol checklist sign-off | Both | Every checkbox in this document ticked. Any NO must be resolved before competition entry. |

### Handoff Cue Confirmation

Confirm these three handoff moments feel natural and unscripted in the paired run-throughs:

1. **Slide 6 → Demo** (Luke → Gabriel): Luke closes the differentiators slide, cues the demo: "Let's see it in action." Gabriel takes the laptop and drives the demo.
2. **Demo → Slide 8** (Gabriel → Luke): Gabriel closes the demo, bridges to business model: "Now that you've seen the product, let me walk you through the business behind it." Luke takes slide control.
3. **Slide 10 → Slide 11** (Gabriel → Luke): Gabriel closes Financials with the LTV:CAC summary: "The unit economics work. Now how do we reach those 2 million addressable users?" Luke takes over for the Marketing slide.

---

## Founder-Verify Flags (Pitch-Day Claim-Accuracy Risk)

The following seven flags (F1–F7) were surfaced during Phase 9 research. Each represents a quantitative claim in the deck that was authored from a source that may have changed, or that requires live-source verification before pitch day. Any flag still open at pitch day is a claim-accuracy risk.

**Risk-mitigation rule:** If a flag cannot be verified before pitch day, the presenter must either (a) drop the specific unverified number and replace with the verified proxy cited in the Action column, or (b) qualify the claim with "approximately" and cite the derivation method rather than stating a precise number. Do not leave a stale specific number in the deck.

**Open question:** The competition date is not yet confirmed in planning docs. This drives the urgency for the F3 and F4 re-check windows. Luke and Gabriel should confirm state-level and NLC competition dates immediately; all rehearsal deadlines and founder-verify re-checks back-calculate from those dates.

| Flag | Claim | Used In | Priority | Action |
|------|-------|---------|----------|--------|
| F1 | International migration-interest % for 22–35 cohort | Slide 3 (Market — supplemental proof point) | MEDIUM | Gallup World Poll or MBO Partners proxy; if no clean number found, omit this specific % and cite the 17M digital nomads figure (MBO Partners 2023) instead |
| F2 | Exact Census CPS year/count for mover data (11M, ~27–28M movers) | Slide 3 (TAM) | LOW | Confirm the specific CPS year from `pitch/market-research.md` §2 footnotes; fluctuation of ±500K does not materially affect the argument |
| F3 | Anthropic API pricing (~$0.06/run for Haiku + web search tool) | Slide 9 (Financials — API COGS claim) | **HIGH — re-verify within 2 weeks of pitch day** | Screenshot `anthropic.com/pricing` within 2 weeks of competition; if pricing changed, update `pitch/financials/model.csv` and the Slide 9 claim bullet before competition |
| F4 | 16Personalities pricing ($9/credit, $29 career suite, no consumer subscription) | Slide 8 (Business model analog) | **HIGH if >30 days since last check** | Re-verify at `16personalities.com/premium`; if pricing changed, switch to Truity ($9–$19 reports, one-time) as the fallback analog |
| F5 | Reddit community member counts (r/IWantOut 476K, r/digitalnomad 2.3M, r/SameGrassButGreener 290K) | Slide 11 (Marketing) | LOW | Check the day before competition; fluctuations of ±20% do not materially affect the argument; update slide bullet if counts have materially changed |
| F6 | WhereNext pricing tiers ($15/$29/$49/$79) | Slide 4 (Competitive Landscape) | MEDIUM | Re-verify at `getwherenext.com` before pitch (within 1 week of competition) |
| F7 | "People relocate 2–3× in their 20s–30s" (LTV repeat-factor rationale) | Slide 10 (LTV:CAC) and Q&A Q2, Q8 | MEDIUM | Census ACS lifetime mobility data or BLS migration tables for 25–34 cohort; fallback: cite the 16–18%/year annual mobility rate from Census CPS instead of the lifetime relocation-frequency figure |
