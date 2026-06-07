import { useState, useEffect, useCallback, useRef } from "react";
import { scoreProfile } from '../lib/matchEngine.js';
import Landing from './Landing.jsx';
import Quiz from './CenteredQuiz.jsx';
import ResultsMap from './ResultsMap.jsx';
import CityBreakdown from './CityBreakdown.jsx';

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

  // ── Review shortcut — skip Landing + Quiz while iterating on the results UI ──
  // Visit  /?dev=breakdown  to jump to a city's full-breakdown page, or
  //        /?dev=results    to jump to the results map.
  // Fires in prod too (for phone review of the deployed site), but ONLY behind
  // the explicit ?dev= param — normal visitors never trigger it.
  // TEMPORARY scaffolding — delete before the competition demo / launch.
  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get("dev");
    if (target !== "breakdown" && target !== "results") return;
    const devProfile = { ...profile, profession: profile.profession || "Software Engineer" };
    const scored = scoreProfile(devProfile);
    if (!scored.length) return;
    setProfile(devProfile);
    setResults(scored);
    if (target === "breakdown") setSelectedCity(scored[0]);
    setStep(2);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── CSS — gold cinematic palette (matches ResultsMap / Landing / Pricing) ──
  // Token keys are unchanged so every existing var(--…) reference re-skins in place.
  const css = {
    "--bg":"#050710","--surface":"#0D1119","--card":"#10141D","--card-hover":"#161B26",
    "--border":"rgba(243,237,225,0.10)","--border-active":"rgba(226,181,107,0.40)",
    "--accent":"#E2B56B","--accent2":"#EFD2A0","--accent3":"#C99A5B","--accent-dim":"rgba(226,181,107,0.10)",
    "--text":"#F3EDE1","--text2":"rgba(243,237,225,0.62)","--text3":"rgba(243,237,225,0.38)",
    "--neg":"#E0816A","--pos":"#8FD6A8",
    fontFamily:"'Manrope', sans-serif",
    background:"radial-gradient(125% 90% at 50% -8%, #131A26 0%, #0D1119 38%, #070A11 74%, #050710 100%)",
    color:"var(--text)", minHeight:"100vh"
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
    return (
      <CityBreakdown
        result={selectedCity}
        results={results}
        profile={profile}
        onBack={() => { setSelectedCity(null); setExpandedSection(null); setAnim(false); setTimeout(() => setAnim(true), 60); }}
      />
    );
  }

  return null;
}
