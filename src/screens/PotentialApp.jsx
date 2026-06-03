import { useState, useEffect, useCallback, useRef } from "react";
import { scoreProfile } from '../lib/matchEngine.js';
import Landing from './Landing.jsx';
import Quiz from './Quiz.jsx';
import ResultsMap from './ResultsMap.jsx';

// ═══════════════════════════════════════════
// POTENTIAL — Life Simulator v2
// Ported from prototype into src/screens/
// Fonts load via index.html (no useEffect).
// AI fetch stubbed — live data arrives Phase 5.
// ═══════════════════════════════════════════

// City data + scoring now come from the real engine (shared/engine via
// src/lib/matchEngine.js). The old inline CITIES_DATA array and prototype
// scoring were removed in the engine graft.

const fmt = (n) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n/1000)}K` : `$${n}`;
const fmtFull = (n) => `$${n.toLocaleString()}`;

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function Potential() {
  const [step, setStep] = useState(0);
  const [profileStep, setProfileStep] = useState(0);
  const [anim, setAnim] = useState(false);
  const [profile, setProfile] = useState({
    name: "", age: 28, profession: "", customProfession: "",
    income: 55000, savings: 15000, debt: 0,
    housing: "rent", // rent | buy
    hasPartner: false, partnerIncome: 0,
    hasDependents: false, numDependents: 0,
    hasRemote: false, // fully remote?
    hasPets: false, petType: "",
    education: "bachelors",
    lifestyleTags: [],
    dealBreakers: [],
    currentCity: "",
    importanceRank: ["cost", "career", "lifestyle", "safety"],
  });
  const [results, setResults] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityAIData, setCityAIData] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [sortBy, setSortBy] = useState("match");
  const [expandedSection, setExpandedSection] = useState(null);

  // Animate on mount — fonts load from index.html, no font useEffect needed
  useEffect(() => {
    setTimeout(() => setAnim(true), 80);
  }, []);

  const goStep = (s) => { setStep(s); setAnim(false); setTimeout(() => setAnim(true), 60); };
  const goProfile = (s) => { setProfileStep(s); setAnim(false); setTimeout(() => setAnim(true), 60); };

  const upd = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const toggleArr = (key, val, max = 99) => {
    setProfile(p => {
      const arr = p[key];
      if (arr.includes(val)) return { ...p, [key]: arr.filter(x => x !== val) };
      if (arr.length >= max) return p;
      return { ...p, [key]: [...arr, val] };
    });
  };

  // Scoring lives in the real engine now — see src/lib/matchEngine.js
  // (scoreProfile → shared/engine rankCities). handleComplete calls it once;
  // both the results list and the city detail read from those scored rows.

  // ── AI Fetch — stubbed for Phase 1; live data wired in Phase 5 ──
  const fetchCityAI = useCallback(async (city, category) => {
    const key = `${city.name}_${category}`;
    if (cityAIData[key]) return;
    console.info("[Phase 1] Live AI data is coming in Phase 5");
    setCityAIData(prev => ({ ...prev, [key]: "coming_soon" }));
  }, [cityAIData]);

  // ── CSS ──
  const css = {
    "--bg":"#08090C","--surface":"#111318","--card":"#171B22","--card-hover":"#1C2029",
    "--border":"rgba(255,255,255,0.05)","--border-active":"rgba(255,255,255,0.12)",
    "--accent":"#6EE7B7","--accent2":"#FBBF24","--accent3":"#818CF8","--accent-dim":"rgba(110,231,183,0.08)",
    "--text":"#EEF2F7","--text2":"#8896AB","--text3":"#505C6F",
    "--neg":"#F87171","--pos":"#6EE7B7",
    fontFamily:"'Manrope', sans-serif", background:"var(--bg)", color:"var(--text)", minHeight:"100vh"
  };
  const heading = { fontFamily:"'Instrument Serif', serif" };
  const mono = { fontFamily:"'JetBrains Mono', monospace" };
  const pill = (active) => ({
    padding:"8px 16px", borderRadius:10, border: active ? "1.5px solid var(--accent)" : "1px solid var(--border)",
    background: active ? "var(--accent-dim)" : "var(--card)", color: active ? "var(--accent)" : "var(--text2)",
    fontSize:13, cursor:"pointer", fontWeight: active ? 600 : 400, transition:"all 0.2s", fontFamily:"inherit",
    display:"inline-flex", alignItems:"center", gap:6
  });
  const fadeIn = {
    opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(24px)",
    transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)"
  };
  const btnPrimary = {
    width:"100%", padding:"16px", background:"var(--accent)", color:"#08090C", border:"none",
    borderRadius:14, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
    letterSpacing:"0.03em"
  };
  const btnDisabled = { ...btnPrimary, background:"var(--card)", color:"var(--text3)", cursor:"not-allowed" };
  const inputStyle = {
    width:"100%", padding:"14px 16px", background:"var(--card)", border:"1px solid var(--border)",
    borderRadius:12, color:"var(--text)", fontSize:15, fontFamily:"inherit", boxSizing:"border-box"
  };
  const label = {
    fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)",
    display:"block", marginBottom:8, fontWeight:600
  };
  const sectionGap = { marginBottom: 28 };

  // ═══════════════════════════════════════════
  // LANDING (cinematic, ported prototype)
  // ═══════════════════════════════════════════
  if (step === 0) return <Landing onEnter={() => goStep(1)} />;

  // ═══════════════════════════════════════════
  // QUIZ (Phase 2 — gold split-sidebar capture)
  // ═══════════════════════════════════════════
  if (step === 1) {
    const handleComplete = (p) => {
      setProfile(prev => ({ ...prev, ...p }));
      const scored = scoreProfile(p); // real tested engine (shared/engine) — was inline prototype scoring
      setResults(scored);
      goStep(2);
    };
    return <Quiz onComplete={handleComplete} onExit={() => goStep(0)} />;
  }


  // ═══════════════════════════════════════════
  // RESULTS — cinematic map with a pin per city
  // ═══════════════════════════════════════════
  if (step === 2 && !selectedCity) {
    return (
      <ResultsMap
        results={results}
        profile={profile}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onSelect={(city) => { setSelectedCity(city); setAnim(false); setTimeout(() => setAnim(true), 60); }}
        onEdit={() => { goStep(1); setProfileStep(0); }}
      />
    );
  }

  // ═══════════════════════════════════════════
  // CITY DETAIL
  // ═══════════════════════════════════════════
  if (step === 2 && selectedCity) {
    const c = selectedCity;
    // c is a scored row from results (see matchEngine.scoreProfile) — read the
    // engine's numbers directly so list and detail can never disagree.
    const salary = c.salary;
    const takeHome = c.monthlyTakeHome;
    const expenses = c.expenses;
    const savings = c.monthlySavings;
    const homeAfford = salary * 5;

    const Section = ({ id, icon, title, children }) => {
      const open = expandedSection === id;
      return (
        <div style={{ background:"var(--card)", borderRadius:16, border:"1px solid var(--border)", marginBottom:12, overflow:"hidden" }}>
          <button onClick={() => { setExpandedSection(open ? null : id); if (!open) fetchCityAI(c, id); }} style={{
            width:"100%", padding:"18px 20px", background:"none", border:"none", color:"var(--text)",
            display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:600
          }}>
            <span>{icon} {title}</span>
            <span style={{ color:"var(--text3)", fontSize:18, transition:"transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
          </button>
          {open && <div style={{ padding:"0 20px 20px", borderTop:"1px solid var(--border)" }}>{children}</div>}
        </div>
      );
    };

    const AIList = ({ dataKey, renderItem }) => {
      const key = `${c.name}_${dataKey}`;
      const data = cityAIData[key];
      const loading = aiLoading[key];
      if (loading) return (
        <div style={{ padding:"20px 0", textAlign:"center" }}>
          <div style={{ display:"inline-block", width:20, height:20, border:"2px solid var(--border)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ fontSize:13, color:"var(--text3)", marginTop:10 }}>Searching for real listings...</p>
        </div>
      );
      if (!data) return <p style={{ color:"var(--text3)", fontSize:13, padding:"12px 0" }}>Tap to load real data</p>;
      if (data === "error") return <p style={{ color:"var(--neg)", fontSize:13 }}>Failed to load — try again</p>;
      if (data === "coming_soon") return (
        <p style={{ color:"var(--text3)", fontSize:14, lineHeight:1.7 }}>
          Live AI data arrives in Phase 5. This section will show real job listings, apartments, and a personalized day-in-the-life narrative.
        </p>
      );
      if (typeof data === "string") return <p style={{ color:"var(--text2)", fontSize:14, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{data}</p>;
      if (!Array.isArray(data)) return <p style={{ color:"var(--text3)", fontSize:13 }}>No results found</p>;
      return <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>{data.map((item, i) => renderItem(item, i))}</div>;
    };

    const ItemCard = ({ children, url, image }) => (
      <div style={{ background:"var(--surface)", borderRadius:12, border:"1px solid var(--border)", overflow:"hidden" }}>
        {image && (
          <div style={{ width:"100%", height:140, overflow:"hidden", position:"relative" }}>
            <img src={image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
              onError={(e) => { e.target.style.display = "none"; e.target.parentElement.style.display = "none"; }} />
          </div>
        )}
        <div style={{ padding:"14px 16px" }}>
          {children}
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" style={{
              display:"inline-flex", alignItems:"center", gap:5, marginTop:10, fontSize:12, fontWeight:600,
              color:"var(--accent)", textDecoration:"none", padding:"5px 12px", borderRadius:6,
              background:"var(--accent-dim)", border:"1px solid rgba(110,231,183,0.15)", transition:"all 0.15s"
            }}>
              View listing ↗
            </a>
          )}
        </div>
      </div>
    );

    return (
      <div style={{ ...css, padding:0 }}>
        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={() => { setSelectedCity(null); setExpandedSection(null); setAnim(false); setTimeout(() => setAnim(true), 60); }} style={{ background:"none", border:"none", color:"var(--text2)", cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>← All cities</button>
          <span style={{ ...heading, fontSize:18, color:"var(--text3)" }}>potential</span>
        </div>

        <div style={{ maxWidth:700, margin:"0 auto", padding:"24px 24px 60px", ...fadeIn }}>
          {/* Hero */}
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:8 }}>
            <span style={{ fontSize:48 }}>{c.emoji}</span>
            <div>
              <h2 style={{ ...heading, fontSize:36, margin:0, lineHeight:1.1 }}>{c.name}</h2>
              <p style={{ color:"var(--text3)", fontSize:13, margin:"4px 0 0" }}>{c.pop} · {c.climate}</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:6, marginBottom:28, flexWrap:"wrap" }}>
            {c.vibe.map(v => <span key={v} style={{ fontSize:11, color:"var(--text2)", background:"var(--card)", padding:"4px 12px", borderRadius:6, border:"1px solid var(--border)" }}>{v}</span>)}
          </div>

          {/* Financial Summary */}
          <div style={{ background:"var(--card)", borderRadius:16, padding:22, border:"1px solid var(--border)", marginBottom:12 }}>
            <h3 style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)", marginBottom:16, fontWeight:700 }}>💰 Financial Overview</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:10 }}>
              {[
                { icon:"💼", lbl:"Est. Salary", val:fmtFull(salary), sub: c.stateTax === 0 ? "No state tax!" : `${c.stateTax}% state tax` },
                { icon:"🏠", lbl:"Monthly Take-Home", val:fmtFull(takeHome) },
                { icon:"📊", lbl:"Monthly Savings", val:`${savings >= 0 ? "+" : ""}${fmtFull(Math.abs(savings))}`, sub: savings >= 0 ? "After all expenses" : "⚠️ Over budget" },
                { icon:"🏡", lbl: profile.housing === "rent" ? "Median 1BR Rent" : "Median Home Price", val: profile.housing === "rent" ? `${fmtFull(c.medianRent)}/mo` : fmtFull(c.medianHome) },
              ].map((s, i) => (
                <div key={i} style={{ background:"var(--surface)", borderRadius:10, padding:"14px 16px", border:"1px solid var(--border)" }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{s.icon}</div>
                  <div style={{ fontSize:20, ...mono, fontWeight:700, lineHeight:1.1, color: s.lbl === "Monthly Savings" ? (savings >= 0 ? "var(--pos)" : "var(--neg)") : "var(--text)" }}>{s.val}</div>
                  <div style={{ fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginTop:4 }}>{s.lbl}</div>
                  {s.sub && <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{s.sub}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div style={{ background:"var(--card)", borderRadius:16, padding:22, border:"1px solid var(--border)", marginBottom:12 }}>
            <h3 style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)", marginBottom:14, fontWeight:700 }}>📋 Monthly Expenses</h3>
            {(() => {
              const items = [
                { label: profile.housing === "rent" ? "Rent (1BR)" : "Mortgage est.", val: expenses.rent, color:"#6EE7B7" },
                { label:"Food & Groceries", val:expenses.food, color:"#FBBF24" },
                { label:"Transportation", val:expenses.transport, color:"#818CF8" },
                { label:"Utilities", val:expenses.utilities, color:"#FB923C" },
                { label:"Health Insurance", val:expenses.insurance, color:"#60A5FA" },
                { label:"Personal / Misc", val:expenses.personal, color:"#F472B6" },
              ];
              if (expenses.childcare > 0) items.push({ label:`Childcare (${profile.numDependents} kid${profile.numDependents > 1 ? "s" : ""})`, val:expenses.childcare, color:"#A78BFA" });
              if (expenses.pets > 0) items.push({ label:"Pet expenses", val:expenses.pets, color:"#34D399" });
              if (expenses.debtPay > 0) items.push({ label:"Debt payments", val:expenses.debtPay, color:"#F87171" });
              return (
                <>
                  <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", marginBottom:14 }}>
                    {items.map((it,i) => <div key={i} style={{ width:`${(it.val/expenses.total)*100}%`, background:it.color, minWidth:2 }} />)}
                  </div>
                  {items.map((it,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:8, height:8, borderRadius:2, background:it.color }} />
                        <span style={{ fontSize:13, color:"var(--text2)" }}>{it.label}</span>
                      </div>
                      <span style={{ ...mono, fontSize:13, fontWeight:600 }}>${it.val.toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:10, paddingTop:10, borderTop:"2px solid var(--border)" }}>
                    <span style={{ fontSize:13, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>Total</span>
                    <span style={{ ...mono, fontSize:16, fontWeight:700 }}>${expenses.total.toLocaleString()}/mo</span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* ── AI-Powered Sections ── */}
          <div style={{ marginTop:8 }}>
            <p style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text3)", marginBottom:12, fontWeight:600 }}>
              ⚡ Live data — powered by AI search
            </p>

            <Section id="dayinlife" icon="📖" title="A Day in Your Life">
              <AIList dataKey="dayinlife" renderItem={(text) => <p style={{ color:"var(--text2)", fontSize:14, lineHeight:1.8 }}>{text}</p>} />
            </Section>

            <Section id="jobs" icon="💼" title={`${profile.profession} Jobs Available Now`}>
              <AIList dataKey="jobs" renderItem={(job, i) => (
                <ItemCard key={i} url={job.url}>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:2, color:"var(--text)" }}>{job.title}</div>
                  <div style={{ fontSize:13, color:"var(--accent)", fontWeight:600 }}>{job.company}</div>
                  {job.salary && job.salary !== "Not listed" && <div style={{ ...mono, fontSize:13, color:"var(--accent2)", marginTop:6, fontWeight:600 }}>{job.salary}</div>}
                  {job.desc && <div style={{ fontSize:12, color:"var(--text3)", marginTop:6, lineHeight:1.5 }}>{job.desc}</div>}
                </ItemCard>
              )} />
            </Section>

            <Section id={profile.housing === "rent" ? "housing_rent" : "housing_buy"} icon="🏠" title={profile.housing === "rent" ? "Apartments for Rent" : "Homes for Sale"}>
              <AIList dataKey={profile.housing === "rent" ? "housing_rent" : "housing_buy"} renderItem={(h, i) => (
                <ItemCard key={i} url={h.url} image={h.image}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontWeight:700, fontSize:15, color:"var(--text)" }}>{h.name || h.address || h.neighborhood}</span>
                    <span style={{ ...mono, fontSize:15, fontWeight:700, color:"var(--accent)", whiteSpace:"nowrap", marginLeft:8 }}>{h.price}</span>
                  </div>
                  {h.neighborhood && h.name && <div style={{ fontSize:12, color:"var(--text2)", marginTop:2 }}>{h.neighborhood}</div>}
                  <div style={{ fontSize:12, color:"var(--text2)", marginTop:4 }}>{h.beds} bed{h.sqft ? ` · ${h.sqft} sqft` : ""}</div>
                  {h.feature && <div style={{ fontSize:12, color:"var(--text3)", marginTop:6 }}>✦ {h.feature}</div>}
                </ItemCard>
              )} />
            </Section>

            <Section id="nightlife" icon="🍸" title="Nightlife & Bars">
              <AIList dataKey="nightlife" renderItem={(n, i) => (
                <ItemCard key={i} url={n.url} image={n.image}>
                  <div style={{ fontWeight:700, fontSize:15, color:"var(--text)" }}>{n.name}</div>
                  <div style={{ fontSize:12, color:"var(--accent)", marginTop:3, fontWeight:500 }}>{n.type} · {n.neighborhood}</div>
                  {n.known_for && <div style={{ fontSize:12, color:"var(--text3)", marginTop:6, lineHeight:1.5 }}>{n.known_for}</div>}
                </ItemCard>
              )} />
            </Section>

            <Section id="outdoors" icon="🥾" title="Outdoor Activities & Nature">
              <AIList dataKey="outdoors" renderItem={(o, i) => (
                <ItemCard key={i} url={o.url} image={o.image}>
                  <div style={{ fontWeight:700, fontSize:15, color:"var(--text)" }}>{o.name}</div>
                  <div style={{ fontSize:12, color:"var(--accent)", marginTop:3, fontWeight:500 }}>{o.type} · {o.distance}</div>
                  {o.desc && <div style={{ fontSize:12, color:"var(--text3)", marginTop:6, lineHeight:1.5 }}>{o.desc}</div>}
                </ItemCard>
              )} />
            </Section>

            <Section id="food" icon="🍜" title="Best Restaurants">
              <AIList dataKey="food" renderItem={(f, i) => (
                <ItemCard key={i} url={f.url} image={f.image}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontWeight:700, fontSize:15, color:"var(--text)" }}>{f.name}</span>
                    <span style={{ fontSize:12, color:"var(--accent2)", ...mono, fontWeight:600 }}>{f.price}</span>
                  </div>
                  <div style={{ fontSize:12, color:"var(--text2)", marginTop:3 }}>{f.cuisine} · {f.neighborhood}</div>
                  {f.special && <div style={{ fontSize:12, color:"var(--text3)", marginTop:6, fontStyle:"italic", lineHeight:1.5 }}>{f.special}</div>}
                </ItemCard>
              )} />
            </Section>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
