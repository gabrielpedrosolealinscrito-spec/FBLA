# Phase 4 Research — International Destinations & Country Financial Models

**Compiled:** 2026-06-01 · **Consolidated for planning:** 2026-06-02 · **For:** Phase 4 (MATCH-02, FIN-02)
**Status:** Sourced draft, citation-first. Consolidated from `.planning/research/phase-04-intl-cities.md` and grounded against the live engine seams (`shared/engine/financial.ts`, `shared/engine/index.ts`, `shared/types.ts`). `[DERIVED — verify]` / `[VERIFY]` markers are preserved as pre-pitch verification items — do not treat them as final.

**FX rates used (ECB reference, 1 June 2026):** EUR/USD = 1.1646 · CAD/USD = 0.7242 (USD/CAD 1.3809) · GBP/USD = 1.347 (confirmed — 2026 avg 1.348, late-May range 1.337–1.351, [exchangerates.org.uk GBP/USD 2026](https://www.exchangerates.org.uk/GBP-USD-spot-exchange-rates-history-2026.html)) — [ECB euro reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html). Verify spot rates the morning of the pitch (D-04: rate is hardcoded + dated, runs offline).

> **costIndex normalization note.** The app's US cities use a `costIndex` where US national average ≈ 100 and NYC/Brooklyn = 187. Numbeo publishes a different index (New York = 100). The `costIndex` values below are **derived estimates** anchored primarily to the precisely-sourced 1-bedroom city-centre rents (the dominant cost driver), cross-checked against Numbeo cost-of-living levels. Treat each `costIndex` as approximate and labeled **[DERIVED — verify]**; every rent/salary/tax figure beneath it is independently sourced.

---

## Engine Integration Map (how this research maps to the code seams)

The planner extends Phase 3's seams; it does **not** rewrite the US spine. Concrete seams, verified in code:

### 1. Register four country models — `shared/engine/financial.ts`
- `FinancialModel` interface (`financial.ts:138`): `{ id, computeTax(grossIncome, stateRate), computeExpenses(profile, city) }`. `FINANCIAL_MODELS` registry (`financial.ts:160`) currently holds only `us`. Phase 4 appends `pt-irs-2026`, `de-2026`, `ca-on-2026`, `uk-2026` (D-08). Per-city `financialModelId` already wired (`types.ts:80`); `buildRawResult` already dispatches `FINANCIAL_MODELS[city.financialModelId] ?? FINANCIAL_MODELS['us']` (`index.ts:64`), so adding cities + models "just works" through the dispatch.
- **Claude's Discretion (CONTEXT):** one file per country vs a single `country-models.ts`. `types.ts:80` comment already points at `shared/engine/country-models`.

### 2. ⚠ Salary branch — the one real interface decision (D-01, FIN-02)
- **The interface has NO salary method.** `buildRawResult` computes salary *outside* the model: `salaryBase = profile.hasRemote ? profile.income : computeSalary(profile, city)` (`index.ts:67`), where `computeSalary` = `BASE_SALARIES[profession] × costIndex/100` (`financial.ts:91`). For foreign cities this is exactly the "US salary on a foreign cost index → inflated savings" gotcha D-01 forbids.
- **Two ways to satisfy D-01 (planner picks one):**
  - **(A) Extend `FinancialModel` with `computeSalary(profile, city)`** — US model delegates to today's `computeSalary`; country models return a sourced local median by profession. Cleanest, keeps "salary logic lives in the model" symmetric with tax/expenses. Touches the interface only (not `shared/types.ts`).
  - **(B) Branch in `buildRawResult`** on country/`financialModelId` before `computeSalary` — smaller diff, but scatters salary logic across the engine.
- Either way: **non-remote foreign salary = sourced local dataset keyed by profession** (storage shape = Claude's Discretion, must be sourced/cited per Phase 3 D-12). **Remote (`hasRemote=true`) keeps `profile.income` regardless of city** — already true at `index.ts:67` (D-02). The local-salary data applies only to the non-remote path.

### 3. ⚠ Openness multiplier — soft, never filter (D-05, MATCH-02)
- **Code/CONTEXT contradiction to resolve:** the `rankCities` docstring (`index.ts:109`) says *"opennessToAbroad === 0 is US-only … Phase 4 will add country filtering before this function if needed."* **CONTEXT D-05 overrides this:** openness is a **soft multiplier on international cities' scores, NEVER a filter** (upholds Phase 3 D-01 "never strand the user"). The planner must implement the multiplier (in `buildRawResult`/`scoreCity`, applied to international cities only) and **delete/rewrite the misleading "filtering" comment**.
- Normalize `opennessToAbroad` → a 0–1 factor: 0 = intl heavily demoted but still visible; max = full weight (optional slight boost). Coefficients live in tunable config (Phase 3 D-03), not inline.
- **Defensive normalizer (D-06):** `types.ts:39` documents `opennessToAbroad` as a `0–100 slider`, but Phase 2 (concurrent) wants a **1–5 button scale**. Do NOT hardcode a literal 0–100 divisor — normalize whatever range Phase 2 ships. If Phase 2 changes the type's range, that is a coordinated `shared/types.ts` commit between the two sessions.
- **Invariant:** result-set size stays `CITIES_DATA.length` (D-01 — `rankCities` never filters); the two-pass D-02 flow + `clamp`/`sanitizeProfile` must keep holding with intl cities present.

### 4. Dual-currency display + dated FX — `src/screens/results/CityDetail.jsx` (D-03, D-04, SC#4)
- `MatchResult` figures are single numbers (USD-canonical today); `City` has **no `currency` field** (`types.ts:63`). Cheapest MVP path that avoids a frozen-contract change: **derive currency from `city.country`** (Portugal/Germany→EUR, Canada→CAD, UK→GBP, else USD) and apply a hardcoded, dated FX table at the **display layer**. Local primary, USD in parentheses (e.g. `€3,200/mo ($3,470)`).
- Keep engine math in one canonical currency; convert for display only. Visible **"FX rate as of [date]"** + **"data as of [date]"** stamps on intl content (SC#4). No `/api`/network this phase (offline-on-battery; live FX is Phase 5).

### 5. "i" info tooltips — `CityDetail.jsx` (D-10, frontend)
- Reusable tappable "i" affordance → short plain-language explanation **+ source/citation** for uncommon country-specific concepts: Portugal NHR/IFICI, Germany solidarity surcharge, UK National Insurance, Canada provincial tax, and the "data as of" stamp. This is where international citations live on-screen. Likely the friend's frontend pass per the division of labor.

### 6. Append city records — `shared/data/cities.ts`
- Append the 4 records below to `CITIES_DATA` (`country` != "US", non-"us" `financialModelId`). Note: `City` requires Phase-3 fields not in the original research stubs — `stateTax` (set 0 for non-US; country tax handled by the model), `summerHighF`, `winterLowF`, `nearMountains`, `nearCoast`, `hasIntlAirport`, `pop`, `climate`. The planner must populate these per city (sourced where shown on screen). Follow the `cities.ts` header sourcing conventions.

---

## Lisbon, Portugal 🇵🇹

```js
{ name: "Lisbon, Portugal", country: "Portugal", emoji: "🚋", lat: 38.72, lng: -9.14,
  costIndex: 95 /* [DERIVED — verify] */, medianRent: 1630 /* USD, €1,400 1BR centre */, medianHome: 480000 /* USD, derived — verify */,
  avgTemp: 63, vibe: ["Coastal","Creative","Sunny","International","Affordable-EU"],
  walkScore: 75 /* est */, transitScore: 72 /* est */, safetyIndex: 80, jobGrowth: 2.0 /* est */,
  topIndustries: ["Tech/Startups","Tourism","Finance","Renewables"], financialModelId: "pt-irs-2026" }
```

| Field | Value | Source |
|---|---|---|
| Rent, 1BR city centre | €1,400/mo ≈ $1,630 | [Numbeo Lisbon, upd. 1 Jun 2026](https://www.numbeo.com/cost-of-living/in/Lisbon) |
| Rent, 1BR outside centre | €1,023/mo ≈ $1,191 | [Numbeo Lisbon](https://www.numbeo.com/cost-of-living/in/Lisbon) |
| Single-person monthly (excl. rent) | ≈ €736 | [Numbeo Lisbon](https://www.numbeo.com/cost-of-living/in/Lisbon) |
| Software engineer gross/yr | €35k–45k median; €45k–60k senior; €70k–100k+ at international cos. | [nextleveljobs.eu Portugal SWE 2026](https://nextleveljobs.eu/blog/software-engineer-salary/portugal) |
| Safety | Portugal #7 Global Peace Index (very safe) | [Global Peace Index](https://www.visionofhumanity.org/maps/) — verify rank |
| medianHome | Derived from ~€5,500/m² centre × ~75 m² ≈ €412k ≈ $480k | **[VERIFY]** Numbeo price/m² |

---

## Berlin, Germany 🇩🇪

```js
{ name: "Berlin, Germany", country: "Germany", emoji: "🐻", lat: 52.52, lng: 13.40,
  costIndex: 92 /* [DERIVED — verify] */, medianRent: 1434 /* USD, €1,231 1BR centre */, medianHome: 571000 /* USD, derived — verify */,
  avgTemp: 50, vibe: ["Creative","Nightlife","Diverse","Startup","Affordable-capital"],
  walkScore: 75 /* est */, transitScore: 85 /* est, U/S-Bahn */, safetyIndex: 65, jobGrowth: 2.5 /* est */,
  topIndustries: ["Tech/Startups","Manufacturing/Auto","Media","Science"], financialModelId: "de-2026" }
```

| Field | Value | Source |
|---|---|---|
| Rent, 1BR city centre | €1,231/mo ≈ $1,434 | [Numbeo Berlin, upd. 1 Jun 2026](https://www.numbeo.com/cost-of-living/in/Berlin) |
| Cost vs NYC (excl. rent) | ~29.9% cheaper than New York | [Numbeo Berlin](https://www.numbeo.com/cost-of-living/in/Berlin) |
| Software engineer gross/yr | €50k–80k; senior €65k–110k TC; FAANG Berlin €120k–160k w/ equity | [theemployerofrecord SWE salary by country 2026](https://theemployerofrecord.com/blog/services/average-software-engineer-salary-by-country) |
| medianHome | Derived ~€7,000/m² × 70 m² ≈ €490k ≈ $571k | **[VERIFY]** |
| Note | Strong tenant protections + Mietpreisbremse rent control; tight supply | context |

---

## Toronto, Canada 🇨🇦

```js
{ name: "Toronto, Canada", country: "Canada", emoji: "🍁", lat: 43.65, lng: -79.38,
  costIndex: 115 /* [DERIVED — verify] */, medianRent: 1810 /* USD, C$2,500 1BR centre */, medianHome: 760000 /* USD, derived — verify */,
  avgTemp: 48, vibe: ["Diverse","Finance","Tech","Multicultural","Walkable"],
  walkScore: 80 /* est */, transitScore: 78 /* est, TTC */, safetyIndex: 75, jobGrowth: 2.0 /* est */,
  topIndustries: ["Finance","Tech","Film/Media","Healthcare"], financialModelId: "ca-on-2026" }
```

| Field | Value | Source |
|---|---|---|
| Rent, 1BR city centre | C$2,500/mo ≈ $1,810 | [Numbeo Toronto, upd. 30 May 2026](https://www.numbeo.com/cost-of-living/in/Toronto) |
| Single renter, all-in monthly | ≈ C$4,071 | [Numbeo Toronto](https://www.numbeo.com/cost-of-living/in/Toronto) |
| Software engineer gross/yr | C$80k entry → C$120k senior; avg ~C$90k–100k | [theemployerofrecord 2026](https://theemployerofrecord.com/blog/services/average-software-engineer-salary-by-country) |
| medianHome | TRREB avg ~C$1.0M metro; condo ~C$680k → ~$760k USD blended | **[VERIFY]** TRREB monthly report |

---

## London, United Kingdom 🇬🇧

```js
{ name: "London, UK", country: "UK", emoji: "🎡", lat: 51.51, lng: -0.13,
  costIndex: 165 /* [DERIVED — verify] */, medianRent: 3186 /* USD, £2,367 1BR centre */, medianHome: 740000 /* USD, derived — verify */,
  avgTemp: 52, vibe: ["Global","Finance","Diverse","Culture","Career"],
  walkScore: 85 /* est */, transitScore: 90 /* est, Tube */, safetyIndex: 60, jobGrowth: 1.8 /* est */,
  topIndustries: ["Finance","Tech","Media","Professional Services"], financialModelId: "uk-2026" }
```

| Field | Value | Source |
|---|---|---|
| Rent, 1BR city centre | £2,367/mo ≈ $3,186 (alt. £2,190) | [Numbeo London, upd. 30 May 2026](https://www.numbeo.com/cost-of-living/in/London) |
| Numbeo overall index | ≈ 89.2 | [Numbeo London](https://www.numbeo.com/cost-of-living/in/London) |
| Software engineer gross/yr | £45k–80k; senior/Big Tech/HFT far higher | [theemployerofrecord 2026](https://theemployerofrecord.com/blog/services/average-software-engineer-salary-by-country) |
| medianHome | ONS/Land Registry London avg ~£550k → ~$740k USD | **[VERIFY]** ONS House Price Index |

---

# Country Financial Models (FIN-02 — no US tax math on foreign salaries)

Each model: tax-free allowance → progressive income tax → mandatory social contributions → worked net example. **Worked examples are illustrative single-filer estimates**; real liability depends on credits, filing class, and special regimes. Verify brackets against the cited authority before the pitch. These worked examples are the validation fixtures (see Validation Architecture below).

## `pt-irs-2026` — Portugal
- **Social Security (employee):** flat **11%** of gross, deducted at source. [PwC Portugal Budget 2026](https://www.pwc.pt/en/pwcinforfisco/statebudget/pit-and-social-security.html)
- **IRS 2026 progressive brackets** (taxable income): 13.25% ≤€7,703 · 16.5% €7,704–11,623 · 22% €11,624–16,472 · 25% €16,473–21,321 · 32% €21,322–27,146 · 35.5% €27,147–39,791 · 43.5% €39,792–51,997 · 45% €51,998–81,199 · 48% >€81,199. Solidarity surcharge 2.5–5% over €80k/€250k. [PwC Tax Summaries — Portugal PIT](https://taxsummaries.pwc.com/portugal/individual/taxes-on-personal-income)
- **Big lever for this app's users:** IFICI / NHR 2.0 — a **20% flat IRS rate** on qualifying professions for new tax residents. Many D8 digital nomads qualify. [countrytaxcalc Portugal IFICI](https://www.countrytaxcalc.com/tax-calculator/portugal/)
- **Specific-deduction rule (correction):** the *dedução específica* is the **greater of €4,462 or actual social-security contributions** — at €45k, SS (€4,950) is higher, so **€4,950** is deducted, not €4,462. Also note Portuguese salaries are typically paid over **14 instalments/year** (12 months + holiday + Christmas bonuses), so a quoted "monthly salary" annualises at ×14, not ×12.
- **Worked example — €45,000 gross, single (standard regime):** SS 11% = €4,950 → taxable €40,050 → IRS (bracket-stack) ≈ €10,412. **Net €29,638/yr = €2,470/mo ≈ $2,876** (≈ €2,117 across 14 instalments). Effective burden **34.1%** (SS+IRS).
- **Worked example — same €45,000 under IFICI / NHR 2.0 (20% flat):** SS €4,950 + IRS 20% × €40,050 = €8,010. **Net €32,040/yr = €2,670/mo ≈ $3,109.** Effective burden **28.8%**. The IFICI advantage scales with income — ~€2,400/yr saved at €45k but **~€10,950/yr at €100k** (standard 39.7% vs IFICI 28.8%). **Strategic decision for the product: which regime does the app display?** CONTEXT D-09 locks this: **special/newcomer regimes (NHR/IFICI) are NOT computed into take-home** — the model uses the **standard ~34% regime** and the IFICI upside is *mentioned via the D-10 "i" info affordance*, not baked into the math (avoids a stale-eligibility gotcha in Q&A). *[Confirm IFICI profession eligibility wording for the tooltip.]*

## `de-2026` — Germany
- **Grundfreibetrag (tax-free):** €12,348 (2026). [taxravens Germany 2026](https://taxravens.com/en/blog/germany-personal-taxation)
- **Income tax:** continuous progressive formula 14% (from €12,348) rising to 42% at €68,481, 45% above €277,826. [taxravens](https://taxravens.com/en/blog/germany-personal-taxation) · cross-check [OECD Taxing Wages 2026 — Germany](https://www.oecd.org/en/publications/taxing-wages-2026_3a5169ef-en/full-report/germany_8f4270cd.html)
- **Solidarity surcharge (Soli):** largely abolished for typical employees (only above a high threshold) — surface as a D-10 "i" concept; do not assume it applies to the worked example.
- **Employee social security (~20.6%):** pension 9.3% (cap €101,400) · unemployment 1.3% (cap €101,400) · health 7.3% + ~1.25% Zusatzbeitrag (cap €69,750) · long-term care ~2.3–2.4% childless surcharge (cap €69,750). [deutsche-flagge social security 2026](https://www.deutsche-flagge.de/en/crew-social-security/social-security/contributions-and-notfications/current-contributions-and-operands-of-social-security)
- **Worked example — €65,000 gross, single, Steuerklasse I, no church tax:** SS ≈ €13,950 (~21.4%); income tax via Grundfreibetrag + progressive curve. Net per German brutto-netto calculators ≈ **€3,300–3,400/mo ≈ $3,850–3,960**, total burden ~38%. [how-to-germany calculator](https://www.how-to-germany.com/income-tax-calculator/) *[Confirm exact net with calculator at pitch.]* For an implementable model, a piecewise-linear approximation of the income-tax polynomial is acceptable if it lands within the validation tolerance band.

## `ca-on-2026` — Canada (Ontario)
- **Federal brackets 2026:** 14% ≤$58,523 · 20.5% to $117,045 · 26% to $181,440 · 29% to $258,482 · 33% above. Basic Personal Amount $16,452. [Manulife 2026 tax rate card](https://www.manulifeim.com/retail/ca/en/viewpoints/tax-planning/2026-tax-rate-card-for-canada) · [CRA rates](https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html)
- **Ontario provincial:** 5.05% → 13.16% across brackets (~$52,886 / $105,775 / $150k / $220k) **plus** Ontario surtax (20% / 36%) and Ontario Health Premium. **[VERIFY exact 2026 ON brackets/surtax]** [CRA T4032-ON 2026](https://www.canada.ca/content/dam/cra-arc/migration/cra-arc/tx/bsnss/tpcs/pyrll/t4032/2026/t4032-on-1-26e.pdf)
- **CPP:** 5.95% on $3,500–$74,600 (max $4,230.45) + **CPP2** 4% on $74,600–$85,000 (max $416). **EI:** 1.63% to $68,900 (max $1,123.07). [CRA T4032-ON 2026](https://www.canada.ca/content/dam/cra-arc/migration/cra-arc/tx/bsnss/tpcs/pyrll/t4032/2026/t4032-on-1-26e.pdf)
- **Worked example — C$95,000 gross, single, Toronto:** CPP+CPP2 ≈ $4,646; EI ≈ $1,123; federal tax ≈ $13,370; Ontario tax+surtax+health premium ≈ $6,700. Total ≈ $25,840. **Net ≈ C$69,160/yr = C$5,763/mo ≈ $4,174.** Effective burden ~27%. *[Ontario surtax/health-premium precision — verify.]*

## `uk-2026` — United Kingdom (England)
- **Personal allowance:** £12,570 (tapered away between £100k–£125,140). [HoC Library: rates & allowances 2025/26](https://commonslibrary.parliament.uk/research-briefings/cbp-10237/)
- **Income tax bands:** 20% £12,571–50,270 · 40% £50,271–125,140 · 45% >£125,140. [GOV.UK rates & thresholds 2025–26](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026)
- **Employee National Insurance:** 8% on £242–£967/wk (£12,570–£50,270), 2% above. [GOV.UK rates & thresholds](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026)
- **Worked example — £60,000 gross, single:** income tax £11,432 (basic £7,540 + higher £3,892); NI £3,211 (£3,016 + £195). **Net £45,357/yr = £3,780/mo ≈ $5,088.** Effective burden ~24.4%. *(Cleanly bracket-derived — the highest-confidence model of the four.)*

---

## MVP Vertical-Slice Recommendation (ROADMAP `Mode: mvp`)

This phase is MVP/vertical-slice. The thinnest end-to-end proof is **one country fully wired through every layer**, then the other three as parallel data+model additions through the same proven seam:

- **Slice 1 (the walking proof): UK / London end-to-end** — `uk-2026` is the cleanest, fully bracket-derived model (no calculator dependency, no surtax ambiguity). Wire: append London to `cities.ts` → register `uk-2026` in `FINANCIAL_MODELS` → salary branch (sourced local salary on non-remote path) → dual-currency display + dated FX + "data as of" stamp on `CityDetail` → confirm London appears in ranked results with a country-correct net. This proves the registry dispatch, the salary branch, the openness multiplier, and the display transform in one slice.
- **Slices 2–4: Portugal, Germany, Canada** — each is now just `cities.ts` record + a registered model + worked-example fixture, riding the seam Slice 1 proved. (Germany/Canada carry the most verification risk per Gaps #5/#6.)
- **Cross-cutting (lands with Slice 1, reused by all):** the `opennessToAbroad` soft-multiplier + defensive normalizer (D-05/D-06), the hardcoded dated FX table (D-04), and the reusable "i" info-tooltip component (D-10).

---

## Validation Architecture

Testable assertions the plans must make verifiable (basis for VALIDATION.md / Nyquist Dimension-8). Frame each as a unit/integration assertion or an observable behavior, not prose.

### V1 — Per-country financial-model correctness (FIN-02, D-08)
Each country model's **worked example becomes a unit-test fixture**: gross income in → expected annual tax / monthly take-home out.
- Fixtures: PT €45,000 → net ≈ €29,638/yr (€2,470/mo); DE €65,000 → net ≈ €3,300–3,400/mo; CA C$95,000 → net ≈ C$5,763/mo; UK £60,000 → net ≈ £3,780/mo.
- **Tolerance:** assert within a band, not exact equality — figures are sourced estimates and some models approximate a continuous formula. Suggested **±3% on annual take-home** for UK (bracket-exact), **±5–7%** for DE/CA (calculator/surtax approximations). Document the chosen band per model.
- Assert each model is reached via `FINANCIAL_MODELS[financialModelId]` dispatch (not the US fallback) for its city.

### V2 — No-US-math invariant (FIN-02, D-01) — *the headline assertion*
- Assert foreign cities do **NOT** route through `computeUSTax`/`computeFederalTax`.
- Assert non-remote foreign salary comes from the **sourced local dataset**, NOT `BASE_SALARIES × costIndex/100` (`computeSalary`). A regression test: a non-remote profile in Lisbon must not produce a US-scale gross. This is the assertion that defends against the "you're paying a Lisbon dev a New York salary" gotcha.
- Assert remote (`hasRemote=true`) profile keeps `profile.income` in every city, US and foreign alike (D-02).

### V3 — Openness soft-multiplier (MATCH-02, D-05/D-06)
- At `opennessToAbroad = 0` (min): all 4 intl cities are **still present** in results (demoted, not removed) — assert result-set size == `CITIES_DATA.length` and intl cities have a score > 0.
- At max openness: intl cities receive full weight (no demotion penalty).
- Monotonicity: a given intl city's score is non-decreasing as openness rises.
- **Normalizer is scale-defensive:** feed it both a 0–100 value and a 1–5 value (D-06) and assert it produces a sane 0–1 factor for each — no assumption of a literal 0–100 divisor.

### V4 — Ranking integrity with intl cities present (SC#1, Phase 3 D-01/D-02)
- Assert all four golden-path cities (Lisbon, Berlin, Toronto, London) appear in `rankCities()` output alongside US cities.
- Assert the two-pass D-02 flow + `clamp`/`sanitizeProfile` still hold (no NaN, matchScore in [0,99]) with intl cities in the set.
- The misleading "country filtering" comment at `index.ts:109` is removed/corrected (D-05 = never filter).

### V5 — Sourcing + "data as of" (SC#3, SC#4, D-03/D-04/D-10)
- Assert every intl figure (salary, rent, costIndex, tax bracket, FX rate) has a source reference documented in the codebase (Phase 3 D-12 standard).
- Assert a visible **"data as of [date]"** stamp and **"FX rate as of [date]"** label render on international financial content (observable in `CityDetail`).
- Assert dual-currency rendering: local currency primary, USD in parentheses, on every intl monetary figure (D-03).

### V6 — Offline constraint
- Assert no `/api`/network calls are introduced by this phase (FX is hardcoded — D-04); the demo runs offline on battery.

---

## Sources
- Numbeo (cost of living, rents): [Lisbon](https://www.numbeo.com/cost-of-living/in/Lisbon) · [Berlin](https://www.numbeo.com/cost-of-living/in/Berlin) · [Toronto](https://www.numbeo.com/cost-of-living/in/Toronto) · [London](https://www.numbeo.com/cost-of-living/in/London)
- Tax authorities / summaries: [PwC Portugal PIT](https://taxsummaries.pwc.com/portugal/individual/taxes-on-personal-income) · [PwC Portugal Budget 2026](https://www.pwc.pt/en/pwcinforfisco/statebudget/pit-and-social-security.html) · [OECD Taxing Wages — Germany 2026](https://www.oecd.org/en/publications/taxing-wages-2026_3a5169ef-en/full-report/germany_8f4270cd.html) · [deutsche-flagge DE social security 2026](https://www.deutsche-flagge.de/en/crew-social-security/social-security/contributions-and-notfications/current-contributions-and-operands-of-social-security) · [CRA T4032-ON 2026](https://www.canada.ca/content/dam/cra-arc/migration/cra-arc/tx/bsnss/tpcs/pyrll/t4032/2026/t4032-on-1-26e.pdf) · [Manulife 2026 rate card](https://www.manulifeim.com/retail/ca/en/viewpoints/tax-planning/2026-tax-rate-card-for-canada) · [GOV.UK rates 2025–26](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026) · [HoC Library 2025/26](https://commonslibrary.parliament.uk/research-briefings/cbp-10237/)
- Salaries: [The Employer of Record — SWE salary by country 2026](https://theemployerofrecord.com/blog/services/average-software-engineer-salary-by-country) · [nextleveljobs.eu Portugal](https://nextleveljobs.eu/blog/software-engineer-salary/portugal)
- FX: [ECB euro reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)

## Gaps / low-confidence figures (firm up before pitch)
1. **costIndex (all 4 cities)** — derived from rent, not a clean Numbeo-NY index. Recommend pulling Numbeo "Cost of Living Plus Rent Index (NY=100)" per city and applying the documented ×1.87 anchor.
2. **medianHome (all 4)** — derived from €/$ per-m² estimates; replace with a single authoritative source each (ONS for London, TRREB for Toronto, Numbeo €/m² for Lisbon/Berlin).
3. **walkScore / transitScore** — WalkScore.com is US-centric; values are estimates. Either source WalkScore intl pages or relabel as a qualitative transit rating.
4. **jobGrowth** — placeholder estimates; source from OECD/Eurostat/StatsCan regional employment if a number is shown on screen.
5. **Germany worked example** relies on a net-calculator result rather than a hand computation (German income-tax formula is a continuous polynomial). Re-run the calculator live to confirm; pick the validation tolerance band accordingly (V1).
6. **Ontario surtax + Health Premium** — confirm exact 2026 figures; they materially affect the Toronto net.
7. **GBP/USD = 1.347 — CONFIRMED** against direct 2026 history (avg 1.348, late-May range 1.337–1.351). Re-check spot rate on pitch day only.
8. **Phase-3 City fields for intl records** — `summerHighF`/`winterLowF`/`nearMountains`/`nearCoast`/`hasIntlAirport`/`pop`/`climate`/`stateTax` must be populated for the 4 new records; source any that surface on screen.

---

*Phase: 04-international-destinations-country-models*
*Consolidated: 2026-06-02 from `.planning/research/phase-04-intl-cities.md` + live engine seams*

## RESEARCH COMPLETE
