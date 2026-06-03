// ─────────────────────────────────────────────────────────────────
// Potential — CityDetail (Phase 3, Plan 07; Phase 4, Plan 03)
// Expand-to-reveal: contribution bars (MATCH-03/D-05/D-06) + financials (FIN-01).
// Phase 4: international cities render dual-currency (local primary, USD parens),
// dated "data as of" / "FX rate as of" stamps (D-03/D-04, SC#4), and tappable
// "i" tooltips on country-specific tax concepts (D-10). US cities unchanged.
// Props: { result: MatchResult, expandedSection, setExpandedSection, profile }
// No network/fetch calls — fully offline.
// ─────────────────────────────────────────────────────────────────

import { css, heading, mono, fmtFull } from './ResultsView.jsx';
import InfoTooltip from './InfoTooltip.jsx';
import { FX_RATES, FX_AS_OF, DATA_AS_OF, currencyForCountry } from '../../../shared/engine/fx.ts';

// ── Currency symbols for dual-currency display (D-03) ─────────────
const CURRENCY_SYMBOL = { GBP: "£", EUR: "€", CAD: "C$", USD: "$" };

// ── Country-specific tax concepts → D-10 "i" tooltips ─────────────
// Plain-language explanation + source citation for uncommon concepts.
// UK is active now (London); PT/DE/CA activate once Plan 04 lands those cities.
const COUNTRY_CONCEPTS = {
  UK: {
    label: "National Insurance",
    explanation:
      "A UK payroll tax separate from income tax: employees pay 8% on earnings between £12,570 and £50,270/yr and 2% above. It funds the NHS and state pension and is already reflected in the take-home shown.",
    source: {
      text: "GOV.UK — NI rates & thresholds 2025/26",
      url: "https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026",
    },
  },
  Portugal: {
    label: "NHR / IFICI",
    explanation:
      "Figures use Portugal's standard progressive income tax (IRS). New residents in qualifying professions may instead get the IFICI / NHR 2.0 regime — a 20% flat rate — a potential upside this app does not bake into take-home because eligibility varies.",
    source: {
      text: "PwC Tax Summaries — Portugal IRS",
      url: "https://taxsummaries.pwc.com/portugal/individual/taxes-on-personal-income",
    },
  },
  Germany: {
    label: "Solidarity surcharge",
    explanation:
      "Germany's 'Soli' is a 5.5% surcharge on income tax, but since 2021 it applies only to high earners — most employees pay none, so it is not added to these figures.",
    source: {
      text: "PwC Tax Summaries — Germany",
      url: "https://taxsummaries.pwc.com/germany/individual/taxes-on-personal-income",
    },
  },
  Canada: {
    label: "Provincial tax",
    explanation:
      "Canada adds provincial income tax on top of federal. Ontario layers 5.05%–13.16% across brackets plus a surtax and a health premium, so Toronto take-home reflects combined federal + Ontario tax.",
    source: {
      text: "CRA T4032-ON 2026 payroll tables",
      url: "https://www.canada.ca/en/revenue-agency.html",
    },
  },
};

// ── Section collapsible (PotentialApp.jsx lines 518–532) ──────────
function Section({ id, icon, title, expandedSection, setExpandedSection, children }) {
  const open = expandedSection === id;
  return (
    <div style={{
      background:"var(--card)", borderRadius:16, border:"1px solid var(--border)",
      marginBottom:12, overflow:"hidden"
    }}>
      <button
        onClick={() => setExpandedSection(open ? null : id)}
        style={{
          width:"100%", padding:"18px 20px", background:"none", border:"none",
          color:"var(--text)", display:"flex", justifyContent:"space-between",
          alignItems:"center", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:600,
        }}
      >
        <span>{icon} {title}</span>
        <span style={{
          color:"var(--text3)", fontSize:18, transition:"transform 0.2s",
          transform: open ? "rotate(180deg)" : "none",
        }}>▾</span>
      </button>
      {open && (
        <div style={{ padding:"0 20px 20px", borderTop:"1px solid var(--border)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Contribution bars (D-05) ──────────────────────────────────────
// Signed bars: positive = var(--pos) green, negative = var(--neg) red.
// Dealbreaker penalty shown as a real negative bar with its signed number.
// Width normalized by max absolute contribution (never divides by total).
// T-3-14: guards empty scoreFactors.
function ContributionBars({ scoreFactors }) {
  if (!scoreFactors || scoreFactors.length === 0) {
    return <p style={{ color:"var(--text3)", fontSize:13, padding:"12px 0" }}>No score factors available.</p>;
  }

  const maxAbs = Math.max(1, ...scoreFactors.map(f => Math.abs(f.contribution)));

  return (
    <div>
      {/* Stacked visual bar — proportional to absolute contribution */}
      <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", marginBottom:14, background:"var(--surface)" }}>
        {scoreFactors.map((f, i) => {
          const pct = (Math.abs(f.contribution) / maxAbs) * (100 / scoreFactors.length);
          const color = f.contribution >= 0 ? "var(--pos)" : "var(--neg)";
          return (
            <div key={i} style={{ width:`${pct}%`, background:color, minWidth:2, flex:"none" }} />
          );
        })}
      </div>

      {/* Factor rows */}
      {scoreFactors.map((f, i) => {
        const isNeg = f.contribution < 0;
        const contribColor = isNeg ? "var(--neg)" : "var(--pos)";
        const dotColor = isNeg ? "var(--neg)" : "var(--pos)";
        const sign = f.contribution >= 0 ? "+" : "";
        return (
          <div key={i} style={{
            display:"flex", justifyContent:"space-between", padding:"6px 0",
            borderBottom: i < scoreFactors.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:2, background:dotColor, flexShrink:0 }} />
              <span style={{ fontSize:13, color:"var(--text2)" }}>{f.factor}</span>
            </div>
            <span style={{ ...mono, fontSize:13, fontWeight:600, color:contribColor }}>
              {sign}{f.contribution}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Expense breakdown (FIN-01) ────────────────────────────────────
// Itemized rows from result.expenses. T-3-14: guards null/undefined expenses.
// fmtMoney formats each USD amount: US → "$X"; intl → "local (US$)" dual-currency.
function ExpenseBreakdown({ expenses, housing, fmtMoney }) {
  if (!expenses) {
    return <p style={{ color:"var(--text3)", fontSize:13, padding:"12px 0" }}>No expense data available.</p>;
  }

  const items = [
    { label: housing === "buy" ? "Mortgage est." : "Rent (1BR)", val: expenses.rent, color:"#6EE7B7" },
    { label:"Food & Groceries",  val:expenses.food,      color:"#FBBF24" },
    { label:"Transportation",    val:expenses.transport,  color:"#818CF8" },
    { label:"Utilities",         val:expenses.utilities,  color:"#FB923C" },
    { label:"Health Insurance",  val:expenses.insurance,  color:"#60A5FA" },
    { label:"Personal / Misc",   val:expenses.personal,   color:"#F472B6" },
  ];
  if (expenses.childcare > 0) items.push({ label:"Childcare", val:expenses.childcare, color:"#A78BFA" });
  if (expenses.pets > 0)      items.push({ label:"Pet expenses", val:expenses.pets,  color:"#34D399" });
  if (expenses.debtPay > 0)   items.push({ label:"Debt payments", val:expenses.debtPay, color:"#F87171" });

  const total = expenses.total || 1;

  return (
    <>
      {/* Stacked bar */}
      <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", marginBottom:14 }}>
        {items.map((it, i) => (
          <div key={i} style={{ width:`${(it.val / total) * 100}%`, background:it.color, minWidth:2 }} />
        ))}
      </div>

      {/* Labeled rows */}
      {items.map((it, i) => (
        <div key={i} style={{
          display:"flex", justifyContent:"space-between", padding:"5px 0",
          borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:it.color }} />
            <span style={{ fontSize:13, color:"var(--text2)" }}>{it.label}</span>
          </div>
          <span style={{ ...mono, fontSize:13, fontWeight:600 }}>{fmtMoney(it.val)}</span>
        </div>
      ))}

      {/* Total */}
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:10, paddingTop:10, borderTop:"2px solid var(--border)" }}>
        <span style={{ fontSize:13, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>Total</span>
        <span style={{ ...mono, fontSize:16, fontWeight:700 }}>{fmtMoney(expenses.total)}/mo</span>
      </div>
    </>
  );
}

// ── Main CityDetail component ─────────────────────────────────────
/**
 * Props:
 *   result           — MatchResult from rankCities()
 *   expandedSection  — string | null (controlled by parent)
 *   setExpandedSection — state setter
 *   profile          — Profile (used for housing pref label)
 */
export default function CityDetail({ result, expandedSection, setExpandedSection, profile }) {
  if (!result) return null;

  const r = result;
  const c = r.city;
  const housing = profile?.housing || "rent";
  const savingsColor = r.monthlySavings >= 0 ? "var(--pos)" : "var(--neg)";
  const savingsSign  = r.monthlySavings >= 0 ? "+" : "";

  const sectionProps = { expandedSection, setExpandedSection };

  // ── Phase 4 dual-currency setup (D-03) ──────────────────────────
  // MatchResult/City monetary fields are USD-canonical (locked in 04-01).
  // For international cities, convert each USD figure BACK to local for the
  // primary display and show USD in parentheses; US cities render USD only.
  const isIntl = c.country !== 'US';
  const currency = currencyForCountry(c.country);
  const fxRate = FX_RATES[currency] ?? 1;
  const symbol = CURRENCY_SYMBOL[currency] ?? "$";
  const concept = COUNTRY_CONCEPTS[c.country];

  // money(usd): US → "$74,085"; intl → "£55,000 ($74,085)" (local primary, USD parens)
  const money = (usd) => {
    if (!isIntl) return fmtFull(usd);
    const local = Math.round(usd / fxRate);
    return `${symbol}${local.toLocaleString()} (${fmtFull(Math.round(usd))})`;
  };

  return (
    <div>
      {/* City hero */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:8 }}>
        <span style={{ fontSize:48 }}>{c.emoji}</span>
        <div>
          <h2 style={{ ...heading, fontSize:36, margin:0, lineHeight:1.1 }}>{c.name}</h2>
          <p style={{ color:"var(--text3)", fontSize:13, margin:"4px 0 0" }}>{c.pop} · {c.climate}</p>
        </div>
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:28, flexWrap:"wrap" }}>
        {c.vibe.map(v => (
          <span key={v} style={{
            fontSize:11, color:"var(--text2)", background:"var(--card)",
            padding:"4px 12px", borderRadius:6, border:"1px solid var(--border)"
          }}>{v}</span>
        ))}
      </div>

      {/* Financial summary tile grid (FIN-01) — always visible */}
      <div style={{ background:"var(--card)", borderRadius:16, padding:22, border:"1px solid var(--border)", marginBottom:12 }}>
        <h3 style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)", marginBottom:16, fontWeight:700 }}>
          Financial Overview
        </h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:10 }}>
          {[
            { icon:"💼", lbl:"Est. Salary",
              val:money(r.estSalary),
              sub:c.stateTax === 0 ? "No state tax!" : `${c.stateTax}% state tax` },
            { icon:"🏠", lbl:"Monthly Take-Home", val:money(r.monthlyTakeHome) },
            { icon:"📊", lbl:"Monthly Savings",
              val:`${savingsSign}${money(Math.abs(r.monthlySavings))}`,
              sub:r.monthlySavings >= 0 ? "After all expenses" : "Over budget",
              color:savingsColor },
            { icon:"🏡", lbl:housing === "rent" ? "Median 1BR Rent" : "Median Home Price",
              val:housing === "rent" ? `${money(c.medianRent)}/mo` : money(c.medianHome) },
          ].map((s, i) => (
            <div key={i} style={{ background:"var(--surface)", borderRadius:10, padding:"14px 16px", border:"1px solid var(--border)" }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontSize:20, ...mono, fontWeight:700, lineHeight:1.1, color:s.color || "var(--text)" }}>{s.val}</div>
              <div style={{ fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginTop:4 }}>{s.lbl}</div>
              {s.sub && <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* International sourcing strip (D-03/D-04, SC#4) — intl cities only */}
        {isIntl && (
          <div style={{
            marginTop:16, paddingTop:14, borderTop:"1px solid var(--border)",
            display:"flex", flexWrap:"wrap", alignItems:"center", rowGap:8, columnGap:16,
            fontSize:11, color:"var(--text3)",
          }}>
            <span>Figures in {currency}, USD in parentheses.</span>
            <span>data as of {DATA_AS_OF}</span>
            <span style={{ display:"inline-flex", alignItems:"center" }}>
              FX rate as of {FX_AS_OF}
              <InfoTooltip
                label="FX rate"
                explanation={`Currency is converted at a fixed rate stored in the app (no live lookup), so results stay stable offline. Rate as of ${FX_AS_OF}.`}
                source={{
                  text: "ECB euro reference rates",
                  url: "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html",
                }}
              />
            </span>
            {concept && (
              <span style={{ display:"inline-flex", alignItems:"center" }}>
                {concept.label}
                <InfoTooltip
                  label={concept.label}
                  explanation={concept.explanation}
                  source={concept.source}
                />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Section: Why this score — D-06 disclosure-on-expand */}
      <Section id="why-score" icon="📊" title="Why this score" {...sectionProps}>
        <div style={{ paddingTop:12 }}>
          <p style={{ fontSize:12, color:"var(--text3)", marginBottom:12, lineHeight:1.5 }}>
            Each factor shows how much it added (green) or subtracted (red) from your match score.
          </p>
          <ContributionBars scoreFactors={r.scoreFactors} />
        </div>
      </Section>

      {/* Section: Financials — D-06 disclosure-on-expand */}
      <Section id="financials" icon="💰" title="Monthly Expenses" {...sectionProps}>
        <div style={{ paddingTop:12 }}>
          <ExpenseBreakdown
            expenses={r.expenses}
            housing={housing}
            fmtMoney={(v) => money(v)}
          />
        </div>
      </Section>
    </div>
  );
}
