import { useState, useEffect, useCallback, useRef } from "react";
import { PROFESSION_CATEGORIES, BASE_SALARIES, LIFESTYLE_TAGS, DEAL_BREAKERS } from '../../shared/data/constants.js';
import Landing from './Landing.jsx';
import Quiz from './Quiz.jsx';

// ═══════════════════════════════════════════
// POTENTIAL — Life Simulator v2
// Ported from prototype into src/screens/
// Fonts load via index.html (no useEffect).
// AI fetch stubbed — live data arrives Phase 5.
// ═══════════════════════════════════════════

const CITIES_DATA = [
  { name: "Austin, TX", emoji: "🎸", color: "#E8712B", lat: 30.27, lng: -97.74, pop: "2.3M metro", climate: "Hot summers, mild winters", costIndex: 103, stateTax: 0, medianRent: 1450, medianHome: 425000, avgTemp: 68, vibe: ["Creative","Tech","Outdoorsy","Nightlife"], walkScore: 41, transitScore: 32, safetyIndex: 72, jobGrowth: 4.2, topIndustries: ["Tech","Government","Healthcare","Music"] },
  { name: "Brooklyn, NY", emoji: "🌉", color: "#7B1FA2", lat: 40.68, lng: -73.94, pop: "2.7M", climate: "Four seasons, cold winters", costIndex: 187, stateTax: 10.9, medianRent: 2800, medianHome: 850000, avgTemp: 55, vibe: ["Creative","Diverse","Nightlife","Walkable"], walkScore: 95, transitScore: 89, safetyIndex: 65, jobGrowth: 2.1, topIndustries: ["Finance","Media","Tech","Fashion"] },
  { name: "Denver, CO", emoji: "⛰️", color: "#1565C0", lat: 39.74, lng: -104.99, pop: "2.9M metro", climate: "300 days sun, snowy winters", costIndex: 112, stateTax: 4.4, medianRent: 1600, medianHome: 520000, avgTemp: 50, vibe: ["Outdoorsy","Tech","Healthy","Growing"], walkScore: 60, transitScore: 45, safetyIndex: 68, jobGrowth: 3.1, topIndustries: ["Tech","Aerospace","Healthcare","Energy"] },
  { name: "Miami, FL", emoji: "🌴", color: "#00ACC1", lat: 25.76, lng: -80.19, pop: "6.1M metro", climate: "Tropical year-round", costIndex: 123, stateTax: 0, medianRent: 2100, medianHome: 520000, avgTemp: 77, vibe: ["Diverse","Nightlife","Tropical","International"], walkScore: 78, transitScore: 57, safetyIndex: 62, jobGrowth: 3.5, topIndustries: ["Tourism","Finance","Real Estate","Trade"] },
  { name: "Pittsburgh, PA", emoji: "🏗️", color: "#F9A825", lat: 40.44, lng: -79.99, pop: "2.4M metro", climate: "Four seasons, grey winters", costIndex: 82, stateTax: 3.07, medianRent: 1050, medianHome: 230000, avgTemp: 50, vibe: ["Affordable","Tech","Historic","Growing"], walkScore: 62, transitScore: 52, safetyIndex: 74, jobGrowth: 2.4, topIndustries: ["Tech/AI","Healthcare","Education","Robotics"] },
  { name: "Raleigh, NC", emoji: "🔬", color: "#00897B", lat: 35.78, lng: -78.64, pop: "1.4M metro", climate: "Mild winters, warm summers", costIndex: 95, stateTax: 4.5, medianRent: 1350, medianHome: 380000, avgTemp: 60, vibe: ["Tech","Family","Growing","Affordable"], walkScore: 30, transitScore: 17, safetyIndex: 78, jobGrowth: 4.5, topIndustries: ["Tech","Biotech","Education","Finance"] },
  { name: "Portland, OR", emoji: "🌲", color: "#558B2F", lat: 45.52, lng: -122.68, pop: "2.5M metro", climate: "Rainy winters, dry summers", costIndex: 108, stateTax: 9.9, medianRent: 1400, medianHome: 475000, avgTemp: 53, vibe: ["Creative","Outdoorsy","Walkable","Progressive"], walkScore: 65, transitScore: 51, safetyIndex: 64, jobGrowth: 2.0, topIndustries: ["Tech","Outdoor/Athletic","Creative","Mfg"] },
  { name: "Boise, ID", emoji: "🏔️", color: "#2E7D32", lat: 43.62, lng: -116.21, pop: "870K metro", climate: "Four seasons, dry summers", costIndex: 94, stateTax: 5.8, medianRent: 1100, medianHome: 390000, avgTemp: 51, vibe: ["Outdoorsy","Growing","Affordable","Family"], walkScore: 38, transitScore: 16, safetyIndex: 81, jobGrowth: 3.8, topIndustries: ["Tech","Agriculture","Healthcare","Mfg"] },
  { name: "Nashville, TN", emoji: "🎵", color: "#D84315", lat: 36.16, lng: -86.78, pop: "2.0M metro", climate: "Hot summers, mild winters", costIndex: 97, stateTax: 0, medianRent: 1500, medianHome: 400000, avgTemp: 59, vibe: ["Creative","Nightlife","Growing","Affordable"], walkScore: 28, transitScore: 22, safetyIndex: 70, jobGrowth: 3.9, topIndustries: ["Healthcare","Music","Tech","Tourism"] },
  { name: "Salt Lake City, UT", emoji: "🏂", color: "#5C6BC0", lat: 40.76, lng: -111.89, pop: "1.3M metro", climate: "Dry, snowy winters, warm summers", costIndex: 99, stateTax: 4.65, medianRent: 1300, medianHome: 460000, avgTemp: 52, vibe: ["Outdoorsy","Tech","Growing","Family"], walkScore: 57, transitScore: 39, safetyIndex: 76, jobGrowth: 4.0, topIndustries: ["Tech","Finance","Outdoor Rec","Healthcare"] },
  { name: "Chicago, IL", emoji: "🏙️", color: "#C62828", lat: 41.88, lng: -87.63, pop: "9.4M metro", climate: "Cold winters, hot summers", costIndex: 107, stateTax: 4.95, medianRent: 1700, medianHome: 320000, avgTemp: 50, vibe: ["Diverse","Nightlife","Walkable","Creative"], walkScore: 78, transitScore: 65, safetyIndex: 58, jobGrowth: 1.8, topIndustries: ["Finance","Food/Bev","Tech","Manufacturing"] },
  { name: "San Diego, CA", emoji: "🏖️", color: "#0288D1", lat: 32.72, lng: -117.16, pop: "3.3M metro", climate: "Mediterranean, mild year-round", costIndex: 146, stateTax: 13.3, medianRent: 2200, medianHome: 820000, avgTemp: 64, vibe: ["Outdoorsy","Diverse","Healthy","Tropical"], walkScore: 51, transitScore: 35, safetyIndex: 73, jobGrowth: 2.6, topIndustries: ["Biotech","Military","Tourism","Tech"] },
];

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

  // ── Scoring (accept an explicit profile so a freshly-submitted quiz can score
  //    before React state settles; default to current profile for the results UI) ──
  const getSalary = (city, prof = profile) => {
    const base = BASE_SALARIES[prof.profession] || 55000;
    return Math.round(base * (city.costIndex / 100));
  };
  const getTakeHome = (city, prof = profile) => {
    const sal = prof.hasRemote ? prof.income : getSalary(city, prof);
    const totalSal = sal + (prof.hasPartner ? prof.partnerIncome : 0);
    const fed = totalSal * 0.22;
    const state = totalSal * (city.stateTax / 100);
    const fica = totalSal * 0.0765;
    return Math.round((totalSal - fed - state - fica) / 12);
  };
  const getExpenses = (city, prof = profile) => {
    const m = city.costIndex / 100;
    const rent = prof.housing === "rent" ? city.medianRent : Math.round(city.medianHome * 0.006);
    const food = Math.round((prof.hasDependents ? 600 + prof.numDependents * 200 : 400) * m);
    const transport = Math.round(250 * m);
    const utilities = Math.round(160 * m);
    const insurance = Math.round(350 * m);
    const personal = Math.round(300 * m);
    const childcare = prof.hasDependents ? Math.round(800 * prof.numDependents * m) : 0;
    const pets = prof.hasPets ? Math.round(100 * m) : 0;
    const debtPay = Math.round(prof.debt * 0.01);
    const total = rent + food + transport + utilities + insurance + personal + childcare + pets + debtPay;
    return { rent, food, transport, utilities, insurance, personal, childcare, pets, debtPay, total };
  };
  const getSavings = (city, prof = profile) => getTakeHome(city, prof) - getExpenses(city, prof).total;

  const getMatchScore = (city, prof = profile) => {
    let score = 50;
    const tags = prof.lifestyleTags;
    const rank = prof.importanceRank;

    // Weight by importance rank
    const w = (cat) => { const i = rank.indexOf(cat); return i === 0 ? 4 : i === 1 ? 3 : i === 2 ? 2 : 1; };

    // Cost
    score += (140 - city.costIndex) * 0.2 * w("cost");

    // Career
    score += city.jobGrowth * 2 * w("career");
    if (prof.hasRemote) score += 8 * w("career"); // remote = less dependent on local jobs

    // Lifestyle
    if (tags.includes("nightlife") || tags.includes("music")) score += (city.vibe.includes("Nightlife") ? 12 : 0) * w("lifestyle") * 0.3;
    if (tags.includes("outdoors") || tags.includes("snow")) score += (city.vibe.includes("Outdoorsy") ? 12 : 0) * w("lifestyle") * 0.3;
    if (tags.includes("arts")) score += (city.vibe.includes("Creative") ? 10 : 0) * w("lifestyle") * 0.3;
    if (tags.includes("walkable")) score += city.walkScore * 0.1 * w("lifestyle");
    if (tags.includes("diversity")) score += (city.vibe.includes("Diverse") ? 10 : 0) * w("lifestyle") * 0.3;
    if (tags.includes("family")) score += city.safetyIndex * 0.08 * w("lifestyle");
    if (tags.includes("beach")) score += (city.vibe.includes("Tropical") ? 14 : 0) * w("lifestyle") * 0.3;
    if (tags.includes("startup")) score += city.jobGrowth * 1.5 * w("lifestyle");

    // Safety
    score += city.safetyIndex * 0.08 * w("safety");

    // Deal breakers
    const db = prof.dealBreakers;
    if (db.includes("No extreme cold") && city.avgTemp < 45) score -= 25;
    if (db.includes("No extreme heat") && city.avgTemp > 72) score -= 25;
    if (db.includes("Must have public transit") && city.transitScore < 40) score -= 25;
    if (db.includes("Must be walkable") && city.walkScore < 50) score -= 25;
    if (db.includes("No state income tax") && city.stateTax > 0) score -= 30;
    if (db.includes("Low crime only") && city.safetyIndex < 70) score -= 20;

    return Math.min(99, Math.max(5, Math.round(score)));
  };

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
      const scored = CITIES_DATA.map(c => ({ ...c, matchScore: getMatchScore(c, p), salary: getSalary(c, p), monthlySavings: getSavings(c, p) }));
      setResults(scored);
      goStep(2);
    };
    return <Quiz onComplete={handleComplete} onExit={() => goStep(0)} />;
  }


  // ═══════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════
  if (step === 2 && !selectedCity) {
    const sorted = [...results].sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      if (sortBy === "savings") return b.monthlySavings - a.monthlySavings;
      if (sortBy === "salary") return b.salary - a.salary;
      if (sortBy === "cost") return a.costIndex - b.costIndex;
      return 0;
    });

    return (
      <div style={{ ...css, padding:0 }}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ color:"var(--accent)", fontSize:18 }}>◆</span>
            <span style={{ ...heading, fontSize:20 }}>potential</span>
          </div>
          <button onClick={() => { goStep(1); setProfileStep(0); }} style={{ background:"var(--card)", border:"1px solid var(--border)", color:"var(--text2)", padding:"6px 14px", borderRadius:8, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>Edit Profile</button>
        </div>
        <div style={{ maxWidth:700, margin:"0 auto", padding:"24px 24px 60px", ...fadeIn }}>
          <h2 style={{ ...heading, fontSize:30, marginBottom:4 }}>Your matches</h2>
          <p style={{ color:"var(--text3)", fontSize:13, marginBottom:20 }}>
            {profile.profession} · {fmtFull(profile.income)}/yr{profile.hasRemote ? " · Remote" : ""}{profile.hasPartner ? " · Dual income" : ""}
          </p>
          <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
            {[["match","Best match"],["savings","Most savings"],["salary","Top salary"],["cost","Lowest cost"]].map(([k,l]) => (
              <button key={k} onClick={() => setSortBy(k)} style={pill(sortBy === k)}>{l}</button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {sorted.map((city, i) => (
              <div key={city.name} onClick={() => { setSelectedCity(city); setAnim(false); setTimeout(() => setAnim(true), 60); }} style={{
                background:"var(--card)", borderRadius:14, padding:"18px 20px", cursor:"pointer",
                border:"1px solid var(--border)", transition:"all 0.15s",
                display:"grid", gridTemplateColumns:"auto 1fr auto", alignItems:"center", gap:16,
              }}>
                <div style={{ fontSize:34, width:44, textAlign:"center" }}>{city.emoji}</div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:3 }}>
                    <span style={{ fontSize:16, fontWeight:700 }}>{city.name}</span>
                    <span style={{ fontSize:11, color:city.color, fontWeight:700, background:`${city.color}15`, padding:"2px 8px", borderRadius:6, ...mono }}>{city.matchScore}%</span>
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {city.vibe.slice(0,3).map(v => <span key={v} style={{ fontSize:10, color:"var(--text3)", background:"var(--surface)", padding:"2px 8px", borderRadius:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>{v}</span>)}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:15, ...mono, fontWeight:600 }}>{fmt(city.salary)}<span style={{ fontSize:10, color:"var(--text3)", fontWeight:400 }}>/yr</span></div>
                  <div style={{ fontSize:13, ...mono, color: city.monthlySavings >= 0 ? "var(--pos)" : "var(--neg)", fontWeight:600 }}>
                    {city.monthlySavings >= 0 ? "+" : ""}{fmt(Math.abs(city.monthlySavings))}<span style={{ fontSize:10, fontWeight:400 }}>/mo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // CITY DETAIL
  // ═══════════════════════════════════════════
  if (step === 2 && selectedCity) {
    const c = selectedCity;
    const salary = getSalary(c);
    const takeHome = getTakeHome(c);
    const expenses = getExpenses(c);
    const savings = getSavings(c);
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
