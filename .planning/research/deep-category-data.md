# Potential — Deep Category Data (Cited Research)

**Purpose:** Source new-category data for the 22 US cities already in `shared/data/cities.ts`, with a real, named source + URL for every quantitative value. This is a **planning / research document only** — no code or types were modified. The later wiring phase will decide which fields to add (see "Proposed schema additions").

**Gathered:** 2026-06-02 by research pass (Claude). All values below were pulled from a source page actually fetched during this session. Where a value could not be retrieved from a fetched source, it is left blank and listed under **Coverage gaps** — nothing is silently estimated.

**Canonical city list (do not add/drop):** Austin TX, Nashville TN, Miami FL, Denver CO, Pittsburgh PA, Raleigh NC, Portland OR, Boise ID, Salt Lake City UT, Chicago IL, San Diego CA, Seattle WA, Minneapolis MN, Phoenix AZ, Atlanta GA, Charlotte NC, Tampa FL, Columbus OH, Indianapolis IN, San Antonio TX, Dallas TX, Brooklyn/NYC NY.

**Geography levels vary by source and are stated per category.** Three different enumeration levels are used: city-proper (Numbeo, Census place, ParkScore), county (FEMA NRI), and state (childcare, school). The dataset's existing `pop` fields are *metro*; ParkScore/Numbeo/Census place values are *city-proper*; this is a real mismatch and is flagged in the relevant notes.

---

## Category coverage summary

| Category | Source | Geo level | Cities covered | Defensibility |
|---|---|---|---|---|
| 1. Healthcare (cost/quality proxy) | Numbeo Health Care Index | City | 22 / 22 | Medium — crowdsourced |
| 2. Natural-disaster risk | FEMA National Risk Index | County | 22 / 22 | High — federal, authoritative |
| 3. School quality | NAEP 2024 Grade 8 Reading (NCES state snapshots) | State | 22 / 22 (18 states) | High — federal, defensible |
| 4. Childcare cost | Child Care Aware of America | State | 22 / 22 (18 states) | High — named annual report |
| 5. Demographics (foreign-born %, median age, never-married %) | US Census ACS 2024 1-yr (via Census Reporter) | City / county | 22 / 22 | High — federal ACS |
| 6. Outdoors / parks | Trust for Public Land ParkScore 2026 | City | 7 / 22 (partial) | High source; limited city set |
| 7. Air connectivity | FAA CY2023 enplanements + hub class | Metro airport | 22 / 22 | High — federal FAA data |

---

## 1. Healthcare — Numbeo Health Care Index (city-level)

**Defensibility note:** Numbeo's Health Care Index is a 0–100+ composite of user-reported perceptions of healthcare skill/competency, equipment, speed, cost, and convenience. Higher = better-perceived care. **Caveat a judge will raise: it is crowdsourced**, not a clinical-outcomes measure, and small metros rest on thin samples (Boise's index is built on only 36 contributors). It is city-level and directly cross-comparable, which is why it is used here over County Health Rankings (the latter ranks counties only *within* their own state and is not nationally comparable). Treat as a soft "perceived access/quality" signal, not a hard outcome. Values current as of Nov–Dec 2025 updates; index uses the trailing 5 years of responses.

| City | Numbeo Health Care Index (higher = better) | Source |
|---|---|---|
| Austin, TX | 64.8 | Numbeo |
| Nashville, TN | 63.8 | Numbeo |
| Miami, FL | 63.0 | Numbeo |
| Denver, CO | 68.1 | Numbeo |
| Pittsburgh, PA | 71.0 | Numbeo |
| Raleigh, NC | 65.2 | Numbeo |
| Portland, OR | 65.4 | Numbeo |
| Boise, ID | 64.5 | Numbeo (36 contributors — thin) |
| Salt Lake City, UT | 66.9 | Numbeo |
| Chicago, IL | 64.8 | Numbeo |
| San Diego, CA | 67.1 | Numbeo |
| Seattle, WA | 66.8 | Numbeo |
| Minneapolis, MN | 71.7 | Numbeo |
| Phoenix, AZ | 66.0 | Numbeo |
| Atlanta, GA | 65.9 | Numbeo |
| Charlotte, NC | 67.9 | Numbeo |
| Tampa, FL | 66.2 | Numbeo |
| Columbus, OH | 68.6 | Numbeo |
| Indianapolis, IN | 71.9 | Numbeo |
| San Antonio, TX | 66.8 | Numbeo |
| Dallas, TX | 66.7 | Numbeo |
| Brooklyn/NYC, NY | 62.9 (New York) | Numbeo |

**References:**
- Numbeo Health Care Index by city (current), updated continuously: https://www.numbeo.com/health-care/rankings_current.jsp
- Verification — Boise city page (Index 64.52, 36 contributors, last update 1 Dec 2025): https://www.numbeo.com/health-care/in/Boise
- Verification — Indianapolis city page (Index 71.85, last update 23 Nov 2025): https://www.numbeo.com/health-care/in/Indianapolis

---

## 2. Natural-disaster risk — FEMA National Risk Index (county-level)

**Defensibility note:** The single most defensible category. FEMA's National Risk Index (NRI) composite Risk Index score is a 0–100 **percentile** (a county's rank relative to all US counties), combining 18 natural-hazard types with Expected Annual Loss, Social Vulnerability, and Community Resilience. Higher = more risk. Data: **NRI version 1.20, December 2025**. Values below are pulled live from FEMA's official ArcGIS feature service (`RISK_SCORE` = `RISK_SPCTL`, the national percentile). **Important caveat to state proactively:** because the score is partly driven by *exposure* (population and built value), every large metro scores high — these 22 cities cluster between ~88 and ~99.97, so the composite barely discriminates among them. For product use, the per-hazard sub-scores (e.g., hurricane, wildfire, heat) would discriminate better than the composite. Geography = principal county of each city (stated below); Brooklyn = Kings County.

| City | Principal county | FEMA NRI Risk Score (0–100 pctile, higher = riskier) | Rating | Source |
|---|---|---|---|---|
| Austin, TX | Travis County, TX | 97.74 | Relatively High | FEMA NRI |
| Nashville, TN | Davidson County, TN | 97.17 | Relatively High | FEMA NRI |
| Miami, FL | Miami-Dade County, FL | 99.62 | Very High | FEMA NRI |
| Denver, CO | Denver County, CO | 95.23 | Relatively High | FEMA NRI |
| Pittsburgh, PA | Allegheny County, PA | 98.09 | Relatively High | FEMA NRI |
| Raleigh, NC | Wake County, NC | 95.55 | Relatively High | FEMA NRI |
| Portland, OR | Multnomah County, OR | 98.47 | Relatively High | FEMA NRI |
| Boise, ID | Ada County, ID | 87.75 | Relatively Moderate | FEMA NRI |
| Salt Lake City, UT | Salt Lake County, UT | 98.57 | Relatively High | FEMA NRI |
| Chicago, IL | Cook County, IL | 99.97 | Very High | FEMA NRI |
| San Diego, CA | San Diego County, CA | 99.71 | Very High | FEMA NRI |
| Seattle, WA | King County, WA | 99.68 | Very High | FEMA NRI |
| Minneapolis, MN | Hennepin County, MN | 98.31 | Relatively High | FEMA NRI |
| Phoenix, AZ | Maricopa County, AZ | 99.87 | Very High | FEMA NRI |
| Atlanta, GA | Fulton County, GA | 95.80 | Relatively High | FEMA NRI |
| Charlotte, NC | Mecklenburg County, NC | 97.07 | Relatively High | FEMA NRI |
| Tampa, FL | Hillsborough County, FL | 98.82 | Relatively High | FEMA NRI |
| Columbus, OH | Franklin County, OH | 98.06 | Relatively High | FEMA NRI |
| Indianapolis, IN | Marion County, IN | 97.49 | Relatively High | FEMA NRI |
| San Antonio, TX | Bexar County, TX | 99.43 | Relatively High | FEMA NRI |
| Dallas, TX | Dallas County, TX | 99.65 | Very High | FEMA NRI |
| Brooklyn/NYC, NY | Kings County, NY | 99.27 | Relatively High | FEMA NRI |

**References:**
- FEMA National Risk Index landing / methodology: https://hazards.fema.gov/nri/
- FEMA NRI data set + version documentation (v1.20, Dec 2025): https://www.fema.gov/about/openfema/data-sets/national-risk-index-data
- Live source for the values above — FEMA NRI Counties ArcGIS feature service (fields `COUNTY, STATE, RISK_SCORE, RISK_RATNG, RISK_SPCTL`): https://services.arcgis.com/XG15cJAlne2vxtgt/arcgis/rest/services/National_Risk_Index_Counties/FeatureServer/0

---

## 3. School quality — NAEP 2024 Grade 8 Reading (state-level)

**Defensibility note:** Source is **NAEP / The Nation's Report Card 2024 assessment**, the most defensible K-12 proficiency measure (federal, sampled, comparable across states). Metric = **% of Grade 8 public-school students at or above the NAEP Proficient level in Reading** (2024). Values were extracted from the official NCES **per-state Grade 8 Reading Snapshot PDFs** (`pdftotext`, raw text, exact sentence "...performed at or above the NAEP Proficient level was N percent in 2024"). This is **state-level, not city-level** — same limitation as childcare; every city in a state shares the state value. National anchor: 30% of US 8th-graders at/above Proficient in reading (2024). Caveats a judge could raise: (a) NAEP Proficient is a deliberately high bar (lower than pass rates on state tests), so absolute numbers look low across the board; (b) state-level masks within-state district variation; (c) Reading only here — Math could be added from the parallel Math snapshots. Cross-check: CA 28% and NY 31% match independent NCES snapshot reporting.

| City | State | NAEP G8 Reading % at/above Proficient (2024) | Source |
|---|---|---|---|
| Austin, TX | Texas | 25 | NCES NAEP 2024 TX snapshot |
| San Antonio, TX | Texas | 25 | NCES NAEP 2024 TX snapshot |
| Dallas, TX | Texas | 25 | NCES NAEP 2024 TX snapshot |
| Nashville, TN | Tennessee | 31 | NCES NAEP 2024 TN snapshot |
| Miami, FL | Florida | 25 | NCES NAEP 2024 FL snapshot |
| Tampa, FL | Florida | 25 | NCES NAEP 2024 FL snapshot |
| Denver, CO | Colorado | 35 | NCES NAEP 2024 CO snapshot |
| Pittsburgh, PA | Pennsylvania | 31 | NCES NAEP 2024 PA snapshot |
| Raleigh, NC | North Carolina | 27 | NCES NAEP 2024 NC snapshot |
| Charlotte, NC | North Carolina | 27 | NCES NAEP 2024 NC snapshot |
| Portland, OR | Oregon | 27 | NCES NAEP 2024 OR snapshot |
| Boise, ID | Idaho | 32 | NCES NAEP 2024 ID snapshot |
| Salt Lake City, UT | Utah | 31 | NCES NAEP 2024 UT snapshot |
| Chicago, IL | Illinois | 33 | NCES NAEP 2024 IL snapshot |
| San Diego, CA | California | 28 | NCES NAEP 2024 CA snapshot |
| Seattle, WA | Washington | 31 | NCES NAEP 2024 WA snapshot |
| Minneapolis, MN | Minnesota | 28 | NCES NAEP 2024 MN snapshot |
| Phoenix, AZ | Arizona | 25 | NCES NAEP 2024 AZ snapshot |
| Atlanta, GA | Georgia | 31 | NCES NAEP 2024 GA snapshot |
| Columbus, OH | Ohio | 32 | NCES NAEP 2024 OH snapshot |
| Indianapolis, IN | Indiana | 33 | NCES NAEP 2024 IN snapshot |
| Brooklyn/NYC, NY | New York | 31 | NCES NAEP 2024 NY snapshot |

**References:**
- NCES NAEP 2024 Reading State Snapshot Reports, Grade 8 (per-state PDFs; URL pattern `.../stt2024/pdf/2024220<ST>8.pdf`). Examples used: Texas https://nces.ed.gov/nationsreportcard/subject/publications/stt2024/pdf/2024220TX8.pdf ; California https://nces.ed.gov/nationsreportcard/subject/publications/stt2024/pdf/2024220CA8.pdf ; New York https://nces.ed.gov/nationsreportcard/subject/publications/stt2024/pdf/2024220NY8.pdf
- NAEP 2024 Reading, Grade 8 results landing: https://www.nationsreportcard.gov/reports/reading/2024/g4_8/?grade=8
- NAEP State & District Snapshots index: https://nces.ed.gov/nationsreportcard/snapshots/

---

## 4. Childcare cost — Child Care Aware of America (state-level)

**Defensibility note:** Source is the **Child Care Aware of America (CCAoA) "2024 Price of Care: Child Care Affordability Analysis," Table I** (full-time center-based child care by state). Values are **state-level, not city-level** — every city in a given state shares the state value (so all 3 TX cities = the TX figure, both NC cities = NC, both FL cities = FL). $/year. Report is titled "2024" but the underlying prices come from CCAoA's **January 2025 survey** of state Child Care Resource & Referral networks (some states from their most recent Market Rate Survey); cite both. Caveat: state averages hide large metro-vs-rural variation, so the city-level precision is limited. California toddler price was "NR" (not reported); infant is available.

| City | State | Infant center-based ($/yr) | Toddler center-based ($/yr) | Source |
|---|---|---|---|---|
| Austin, TX | Texas | 11,349 | 10,921 | CCAoA Table I |
| San Antonio, TX | Texas | 11,349 | 10,921 | CCAoA Table I |
| Dallas, TX | Texas | 11,349 | 10,921 | CCAoA Table I |
| Nashville, TN | Tennessee | 13,126 | 12,063 | CCAoA Table I |
| Miami, FL | Florida | 13,011 | 11,461 | CCAoA Table I |
| Tampa, FL | Florida | 13,011 | 11,461 | CCAoA Table I |
| Denver, CO | Colorado | 20,978 | 17,479 | CCAoA Table I |
| Pittsburgh, PA | Pennsylvania | 14,910 | 14,180 | CCAoA Table I |
| Raleigh, NC | North Carolina | 12,370 | 11,694 | CCAoA Table I |
| Charlotte, NC | North Carolina | 12,370 | 11,694 | CCAoA Table I |
| Portland, OR | Oregon | 19,500 | 17,368 | CCAoA Table I |
| Boise, ID | Idaho | 10,608 | 9,996 | CCAoA Table I |
| Salt Lake City, UT | Utah | 14,160 | 11,328 | CCAoA Table I |
| Chicago, IL | Illinois | 19,807 | 18,736 | CCAoA Table I |
| San Diego, CA | California | 22,628 | NR (not reported) | CCAoA Table I |
| Seattle, WA | Washington | 21,348 | 19,236 | CCAoA Table I |
| Minneapolis, MN | Minnesota | 20,421 | 18,042 | CCAoA Table I |
| Phoenix, AZ | Arizona | 15,964 | 13,390 | CCAoA Table I |
| Atlanta, GA | Georgia | 11,066 | 10,537 | CCAoA Table I |
| Columbus, OH | Ohio | 13,780 | 12,376 | CCAoA Table I |
| Indianapolis, IN | Indiana | 16,478 | 16,002 | CCAoA Table I |
| Brooklyn/NYC, NY | New York | 20,439 | 18,661 | CCAoA Table I |

**References:**
- CCAoA, 2024 Price of Care: Child Care Affordability Analysis (Table I, center-based by state; price source = Jan 2025 survey): https://info.childcareaware.org/hubfs/Affordability_Analysis_2024.pdf
- CCAoA price & supply landing page: https://www.childcareaware.org/price-landscape24/

---

## 5. Demographics — US Census ACS 2024 1-year (city-level; Brooklyn = Kings County)

**Defensibility note:** Source is the US Census Bureau American Community Survey (ACS) **2024 1-year estimates**, accessed via Census Reporter (which republishes ACS with table citations back to the Bureau). All values are **city-proper (Census "place")**, except **Brooklyn/NYC = Kings County** (county-level, the borough). Three metrics:
- **Foreign-born %** — share of residents born outside the US (ACS data profile). Framed strictly as a factual demographic statistic for the product's international-user context — NOT a "people like you" score.
- **Median age** — years (ACS DP05).
- **% never-married** — never-married share of the population 15+ (ACS table **B12001**, computed as (male never married + female never married) ÷ total 15+). Computed by hand from raw ACS estimates, not model-summarized, after an initial batch read produced inconsistent values.

Caveat for judges: 1-year ACS estimates carry margins of error (shown small for these large places, ±1–2 pts on foreign-born); city-proper boundaries differ from the metro `pop` figures already in the dataset.

| City (place) | Foreign-born % | Median age (yrs) | Never-married % (15+) | Source |
|---|---|---|---|---|
| Austin, TX | 21.6 | 34.8 | 44.5 | ACS 2024 1-yr |
| Nashville-Davidson, TN | 15.6 | 34.6 | 43.4 | ACS 2024 1-yr |
| Miami, FL | 56.9 | 38.8 | 41.7 | ACS 2024 1-yr |
| Denver, CO | 16.1 | 35.6 | 44.3 | ACS 2024 1-yr |
| Pittsburgh, PA | 8.9 | 34.5 | 52.9 | ACS 2024 1-yr |
| Raleigh, NC | 14.9 | 34.2 | 45.9 | ACS 2024 1-yr |
| Portland, OR | 12.9 | 39.0 | 43.6 | ACS 2024 1-yr |
| Boise City, ID | 8.3 | 40.0 | 36.6 | ACS 2024 1-yr |
| Salt Lake City, UT | 15.5 | 32.6 | 51.8 | ACS 2024 1-yr |
| Chicago, IL | 22.0 | 35.9 | 50.7 | ACS 2024 1-yr |
| San Diego, CA | 26.7 | 36.6 | 41.7 | ACS 2024 1-yr |
| Seattle, WA | 19.9 | 35.4 | 47.6 | ACS 2024 1-yr |
| Minneapolis, MN | 13.9 | 33.8 | 53.7 | ACS 2024 1-yr |
| Phoenix, AZ | 19.4 | 35.4 | 41.1 | ACS 2024 1-yr |
| Atlanta, GA | 10.2 | 34.5 | 53.2 | ACS 2024 1-yr |
| Charlotte, NC | 19.7 | 34.5 | 45.1 | ACS 2024 1-yr |
| Tampa, FL | 19.0 | 35.8 | 43.2 | ACS 2024 1-yr |
| Columbus, OH | 15.3 | 33.5 | 46.9 | ACS 2024 1-yr |
| Indianapolis (balance), IN | 14.9 | 34.6 | 40.2 | ACS 2024 1-yr |
| San Antonio, TX | 17.0 | 34.9 | 41.3 | ACS 2024 1-yr |
| Dallas, TX | 24.5 | 33.2 | 45.8 | ACS 2024 1-yr |
| Brooklyn/NYC, NY (Kings County) | 35.7 | 36.9 | 46.1 | ACS 2024 1-yr |

Never-married raw inputs (for audit; B12001 totals / male-never-married / female-never-married): Austin 848,811 / 206,406 / 171,624; Denver 622,244 / 147,508 / 128,347; Miami 415,456 / 91,820 / 81,594; Pittsburgh 270,423 / 70,775 / 72,293; Nashville 582,847 / 124,495 / 128,296; Raleigh 418,590 / 100,806 / 91,141; Portland 555,175 / 130,275 / 111,564; Boise 205,648 / 40,305 / 34,888; Salt Lake City 190,594 / 54,728 / 43,948; Chicago 2,306,743 / 584,507 / 586,099; San Diego 1,201,217 / 271,541 / 228,878; Seattle 688,528 / 173,738 / 153,966; Minneapolis 358,884 / 97,328 / 95,528; Phoenix 1,360,200 / 304,566 / 254,396; Atlanta 448,186 / 117,038 / 121,506; Charlotte 766,134 / 171,701 / 173,510; Tampa 349,409 / 80,979 / 70,012; Columbus 759,998 / 184,695 / 171,405; Indianapolis 708,557 / 144,918 / 140,156; San Antonio 1,234,707 / 269,203 / 240,778; Dallas 1,071,267 / 266,546 / 224,556; Kings County 2,146,588 / 478,426 / 511,301.

**References:**
- Census Reporter (republishes Census ACS with table citations); profiles used, e.g. Austin: http://censusreporter.org/profiles/16000US4805000-austin-tx/ ; Kings County: http://censusreporter.org/profiles/05000US36047-kings-county-ny/
- Never-married computed from ACS table B12001 via Census Reporter data API, e.g.: https://api.censusreporter.org/1.0/data/show/latest?table_ids=B12001&geo_ids=16000US4805000
- Underlying source of record: US Census Bureau, ACS 2024 1-year estimates (tables DP02 foreign-born, DP05 median age, B12001 marital status), https://data.census.gov

---

## 6. Outdoors / parks — Trust for Public Land ParkScore 2026 (city-level, PARTIAL)

**Defensibility note:** Source is the **Trust for Public Land (TPL) ParkScore 2026** index, which ranks the **100 most populous US cities** on park access, acreage, investment, amenities, and equity (overall ParkScore 0–100; rank 1 = best). City-level. **Only a subset of the 22 was confirmed this session** — TPL's own pages returned access errors (HTTP 403), so values below come from the TPL 2026 press release and official city/agency releases that cite it. Several mid-size metros either are outside TPL's tracked set or were not surfaced; those are explicit gaps. The dataset already carries `nearMountains`/`nearCoast` booleans, which cover the "natural outdoors" angle independently of ParkScore (urban park access).

| City | ParkScore 2026 rank | Overall ParkScore | Source |
|---|---|---|---|
| Minneapolis, MN | 3 | 83.4 | TPL 2026 press release |
| Seattle, WA | 8 | 75.4 | TPL 2026 press release |
| Portland, OR | 9 | 75.1 | TPL 2026 press release |
| Chicago, IL | 10 | 74.3 | TPL 2026 press release |
| Denver, CO | 11 | — | TPL 2026 (via reporting) |
| Atlanta, GA | 18 | — | City of Atlanta (citing TPL 2026) |
| Austin, TX | 47 | — | TPL 2026 press release |
| Nashville, Miami, Pittsburgh, Raleigh, Boise, Salt Lake City, San Diego, Phoenix, Charlotte, Tampa, Columbus, Indianapolis, San Antonio, Dallas, Brooklyn/NYC | — | — | **GAP — not confirmed this session** |

**References:**
- TPL ParkScore 2026 rankings landing: https://www.tpl.org/parkscore/rankings
- TPL ParkScore 2026 press release (DC #1; Minneapolis 3rd, Seattle 8th, Portland 9th, Chicago 10th, Austin 47th): https://www.tpl.org/media-room/parkscore-2026-rankings-trust-for-public-land-names-washington-dc-best-big-city-park-system-irvine-takes-2nd-followed-by-minneapolis-and-saint-paul-chicago-returns-to-parkscore-top-10-as-tex
- City of Atlanta, "Climbs to 18th Nationally in 2026 ParkScore Index": https://www.atlantaga.gov/Home/Components/News/News/15728/632
- Denver Gazette reporting on Denver's 2026 ParkScore (#11): https://www.denvergazette.com/outtherecolorado/2026/05/27/annual-parkscore-report-indicates-surprising-colorado-city-is-lacking-in-terms-of-green-space/

---

## 7. Air connectivity — FAA CY2023 enplanements + hub classification (metro primary airport)

**Defensibility note:** Source is FAA Calendar Year 2023 passenger boarding (enplanement) data, with the FAA hub classification (Large ≥1% of US enplanements; Medium 0.25–1%; Small 0.05–0.25%). CY2023 had 31 Large-hub airports nationally. Values below were read from Wikipedia's "List of the busiest airports in the United States," which tabulates the FAA CY2023 enplanements and labels each airport's hub class (FAA-sourced); the primary FAA pages (faa.gov) blocked direct fetch (HTTP 403). One label to flag: **San Diego (SAN)** is shown with 12.19M enplanements — well above the ~1% Large-hub floor (~8.5M) — so it is a **Large hub** by the FAA threshold despite a transcription that read "Medium"; the enplanement figure is the load-bearing, sourced value. Geography = the metro's primary commercial airport.

| City | Primary airport | CY2023 enplanements | FAA hub class | Source |
|---|---|---|---|---|
| Austin, TX | AUS (Austin-Bergstrom) | 10,833,443 | Large | FAA CY2023 (via Wikipedia) |
| Nashville, TN | BNA (Nashville Intl) | 11,227,243 | Large | FAA CY2023 |
| Miami, FL | MIA (Miami Intl) | 24,717,048 | Large | FAA CY2023 |
| Denver, CO | DEN (Denver Intl) | 37,863,967 | Large | FAA CY2023 |
| Pittsburgh, PA | PIT (Pittsburgh Intl) | 4,493,052 | **Medium** | FAA CY2023 |
| Raleigh, NC | RDU (Raleigh-Durham) | 7,119,040 | Medium | FAA CY2023 |
| Portland, OR | PDX (Portland Intl) | 8,123,054 | Medium | FAA CY2023 |
| Boise, ID | BOI (Boise Air Terminal) | 2,369,164 | Medium | FAA CY2023 |
| Salt Lake City, UT | SLC (Salt Lake City Intl) | 12,905,368 | Large | FAA CY2023 |
| Chicago, IL | ORD (O'Hare Intl) | 35,843,104 | Large | FAA CY2023 |
| San Diego, CA | SAN (San Diego Intl) | 12,190,183 | Large (>1% floor; see note) | FAA CY2023 |
| Seattle, WA | SEA (Seattle-Tacoma) | 24,594,210 | Large | FAA CY2023 |
| Minneapolis, MN | MSP (Minneapolis-St Paul) | 17,019,128 | Large | FAA CY2023 |
| Phoenix, AZ | PHX (Sky Harbor Intl) | 23,880,504 | Large | FAA CY2023 |
| Atlanta, GA | ATL (Hartsfield-Jackson) | 50,950,068 | Large | FAA CY2023 |
| Charlotte, NC | CLT (Charlotte Douglas) | 25,896,224 | Large | FAA CY2023 |
| Tampa, FL | TPA (Tampa Intl) | 11,677,632 | Large | FAA CY2023 |
| Columbus, OH | CMH (John Glenn Columbus) | 4,095,189 | Medium | FAA CY2023 |
| Indianapolis, IN | IND (Indianapolis Intl) | 4,788,376 | Medium | FAA CY2023 |
| San Antonio, TX | SAT (San Antonio Intl) | 5,336,684 | Medium | FAA CY2023 |
| Dallas, TX | DFW (Dallas-Fort Worth) | 39,246,212 | Large | FAA CY2023 |
| Brooklyn/NYC, NY | JFK (primary intl gateway) | 30,804,355 | Large | FAA CY2023 |

Note: NYC is served by three Large-hub airports — JFK (30.8M, above), LaGuardia/LGA (16.17M, Large), and Newark/EWR (~22.8M, Large). JFK is used as the representative international gateway; the metro is unambiguously top-tier for air connectivity.

**References:**
- Wikipedia, "List of the busiest airports in the United States" (FAA CY2023 enplanements + hub class): https://en.wikipedia.org/wiki/List_of_the_busiest_airports_in_the_United_States
- FAA Airport Categories (hub-class thresholds): https://www.faa.gov/airports/planning_capacity/categories
- FAA CY2023 enplanement data of record (source behind the figures; blocked direct fetch): https://www.faa.gov/airports/planning_capacity/passenger_allcargo_stats/passenger/cy23_commercial_service_enplanements

---

## Coverage gaps (explicit)

**Fully missing categories:** None. All seven categories have at least partial coverage; School quality was filled from NCES NAEP 2024 Grade 8 Reading state snapshot PDFs (state-level).

**Per-cell gaps:**
- **Childcare — California toddler (San Diego):** "NR" (not reported) in CCAoA Table I. Infant value present ($22,628).
- **ParkScore — 15 of 22 cities not confirmed:** Nashville, Miami, Pittsburgh, Raleigh, Boise, Salt Lake City, San Diego, Phoenix, Charlotte, Tampa, Columbus, Indianapolis, San Antonio, Dallas, Brooklyn/NYC. TPL's own ranking pages returned HTTP 403; only cities named in the 2026 press release / official city releases were captured. Note: some of these (Boise, Salt Lake City, Raleigh) may fall outside TPL's 100-city set entirely — to be confirmed when TPL's full table is accessible. `nearMountains`/`nearCoast` already cover the natural-outdoors dimension for all cities.

**No gaps in:** Healthcare (22/22), FEMA NRI (22/22), Childcare infant cost (22/22 via 18 states), School — NAEP G8 Reading (22/22 via 18 states), Demographics — all three metrics (22/22), Air connectivity (22/22).

**Access notes (for reproducibility):** faa.gov, census.gov, tpl.org, and several mirror sites returned HTTP 403 to automated fetch. FEMA values were obtained from FEMA's own ArcGIS REST service; Census values from Census Reporter (which cites ACS tables); FAA values from the Wikipedia busiest-airports table (which cites FAA CY2023). All are traceable to the federal source of record.

---

## Proposed schema additions (for the wiring phase — do NOT implement here)

Suggested new optional fields on the `City` interface in `shared/types.ts`. All optional so existing 22-city data and the engine remain valid until populated. Units stated.

```ts
// Healthcare (Numbeo Health Care Index, city-level, ~0–100, higher = better-perceived)
healthcareIndex?: number;          // Numbeo Health Care Index

// Natural-disaster risk (FEMA NRI composite, county-level, 0–100 percentile, higher = riskier)
disasterRiskScore?: number;        // FEMA National Risk Index score (RISK_SPCTL)
disasterRiskRating?: string;       // FEMA rating bucket, e.g. "Relatively High" | "Very High"

// School quality (NAEP 2024 G8 Reading, state-level, % at/above Proficient)
schoolProficiencyPct?: number;     // NAEP G8 Reading % at/above Proficient (state-level proxy)

// Childcare (CCAoA, state-level, USD/year)
childcareInfantAnnual?: number;    // center-based infant care, $/yr (state value)
childcareToddlerAnnual?: number;   // center-based toddler care, $/yr (state value)

// Demographics (Census ACS, city-level except NYC=Kings County)
foreignBornPct?: number;           // % foreign-born (factual demographic stat, NOT a fit score)
medianAge?: number;                // years
neverMarriedPct?: number;          // % never-married, population 15+

// Outdoors / parks (TPL ParkScore, city-level) — partial coverage
parkScoreRank?: number;            // ParkScore rank, 1 = best (out of ~100)
parkScore?: number;                // ParkScore overall, 0–100

// Air connectivity (FAA, metro primary airport)
faaHubClass?: 'Large' | 'Medium' | 'Small' | 'Nonhub';  // FAA hub classification
airportEnplanements?: number;      // CY2023 annual enplanements (primary airport)
```

**Notes for the wiring phase:**
- State-level fields (childcare, school) repeat across same-state cities — fine, but UI copy should say "state average" not "city."
- FEMA NRI composite barely discriminates among these 22 big metros (all ~88–99.97); if disaster risk is to be a *scoring* input, pull per-hazard NRI sub-scores rather than the composite.
- `foreignBornPct` must be presented as a neutral demographic statistic, never as a "people like you" match score (product/legal positioning).
- Brooklyn/NYC demographics + FEMA are Kings-County-level; ParkScore/airport are NYC-metro-level. Keep the geography note if these are surfaced to users.
