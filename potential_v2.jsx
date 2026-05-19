import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════
// POTENTIAL — Life Simulator v2
// Deep profile + AI-powered real data
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

const PROFESSION_CATEGORIES = {
  "Design & Creative": ["Graphic Designer","UX/UI Designer","Interior Designer","Photographer","Video Editor","Animator","Art Director","Fashion Designer"],
  "Tech & Engineering": ["Software Engineer","Data Analyst","Data Scientist","DevOps Engineer","Mechanical Engineer","Civil Engineer","Electrical Engineer","IT Support"],
  "Business & Finance": ["Accountant","Financial Analyst","Marketing Manager","Project Manager","HR Manager","Business Analyst","Real Estate Agent","Insurance Agent"],
  "Healthcare": ["Registered Nurse","Dental Hygienist","Physical Therapist","Pharmacy Technician","Medical Assistant","Paramedic","Psychologist"],
  "Education & Social": ["Teacher (K-12)","College Professor","Social Worker","School Counselor","Librarian","Tutor / Instructor"],
  "Trades & Services": ["Electrician","Plumber","HVAC Technician","Welder","Auto Mechanic","Chef / Cook","Restaurant Manager","Barber / Cosmetologist"],
  "Media & Writing": ["Writer / Content Creator","Journalist","PR Specialist","Social Media Manager","Copywriter","Technical Writer"],
};

const BASE_SALARIES = {
  "Graphic Designer":55000,"UX/UI Designer":82000,"Interior Designer":56000,"Photographer":42000,"Video Editor":52000,"Animator":65000,"Art Director":95000,"Fashion Designer":58000,
  "Software Engineer":110000,"Data Analyst":72000,"Data Scientist":105000,"DevOps Engineer":115000,"Mechanical Engineer":80000,"Civil Engineer":75000,"Electrical Engineer":82000,"IT Support":52000,
  "Accountant":65000,"Financial Analyst":78000,"Marketing Manager":80000,"Project Manager":85000,"HR Manager":78000,"Business Analyst":75000,"Real Estate Agent":62000,"Insurance Agent":55000,
  "Registered Nurse":72000,"Dental Hygienist":78000,"Physical Therapist":82000,"Pharmacy Technician":38000,"Medical Assistant":36000,"Paramedic":45000,"Psychologist":85000,
  "Teacher (K-12)":52000,"College Professor":78000,"Social Worker":48000,"School Counselor":55000,"Librarian":52000,"Tutor / Instructor":40000,
  "Electrician":58000,"Plumber":56000,"HVAC Technician":52000,"Welder":48000,"Auto Mechanic":46000,"Chef / Cook":38000,"Restaurant Manager":52000,"Barber / Cosmetologist":35000,
  "Writer / Content Creator":50000,"Journalist":48000,"PR Specialist":60000,"Social Media Manager":55000,"Copywriter":58000,"Technical Writer":72000,
};

const LIFESTYLE_TAGS = [
  { id:"nightlife", label:"Nightlife & Bars", icon:"🍸" },
  { id:"outdoors", label:"Hiking & Nature", icon:"🥾" },
  { id:"arts", label:"Arts & Museums", icon:"🎨" },
  { id:"foodie", label:"Food Scene", icon:"🍜" },
  { id:"fitness", label:"Gyms & Fitness", icon:"💪" },
  { id:"family", label:"Family-Friendly", icon:"👨‍👩‍👧" },
  { id:"walkable", label:"Walkable / Transit", icon:"🚶" },
  { id:"diversity", label:"Cultural Diversity", icon:"🌍" },
  { id:"music", label:"Live Music", icon:"🎶" },
  { id:"beach", label:"Beach / Water", icon:"🏄" },
  { id:"snow", label:"Snow Sports", icon:"🏂" },
  { id:"startup", label:"Startup Scene", icon:"🚀" },
  { id:"lgbtq", label:"LGBTQ+ Friendly", icon:"🏳️‍🌈" },
  { id:"quiet", label:"Peace & Quiet", icon:"🌿" },
];

const DEAL_BREAKERS = [
  "No extreme cold", "No extreme heat", "Must have public transit",
  "Must be walkable", "No state income tax", "Must be near mountains",
  "Must be near ocean/coast", "Low crime only", "Need international airport",
  "Must have strong job market in my field"
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

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
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

  // ── Scoring ──
  const getSalary = (city) => {
    const base = BASE_SALARIES[profile.profession] || 55000;
    return Math.round(base * (city.costIndex / 100));
  };
  const getTakeHome = (city) => {
    const sal = profile.hasRemote ? profile.income : getSalary(city);
    const totalSal = sal + (profile.hasPartner ? profile.partnerIncome : 0);
    const fed = totalSal * 0.22;
    const state = totalSal * (city.stateTax / 100);
    const fica = totalSal * 0.0765;
    return Math.round((totalSal - fed - state - fica) / 12);
  };
  const getExpenses = (city) => {
    const m = city.costIndex / 100;
    const rent = profile.housing === "rent" ? city.medianRent : Math.round(city.medianHome * 0.006);
    const food = Math.round((profile.hasDependents ? 600 + profile.numDependents * 200 : 400) * m);
    const transport = Math.round(250 * m);
    const utilities = Math.round(160 * m);
    const insurance = Math.round(350 * m);
    const personal = Math.round(300 * m);
    const childcare = profile.hasDependents ? Math.round(800 * profile.numDependents * m) : 0;
    const pets = profile.hasPets ? Math.round(100 * m) : 0;
    const debtPay = Math.round(profile.debt * 0.01);
    const total = rent + food + transport + utilities + insurance + personal + childcare + pets + debtPay;
    return { rent, food, transport, utilities, insurance, personal, childcare, pets, debtPay, total };
  };
  const getSavings = (city) => getTakeHome(city) - getExpenses(city).total;

  const getMatchScore = (city) => {
    let score = 50;
    const tags = profile.lifestyleTags;
    const rank = profile.importanceRank;

    // Weight by importance rank
    const w = (cat) => { const i = rank.indexOf(cat); return i === 0 ? 4 : i === 1 ? 3 : i === 2 ? 2 : 1; };

    // Cost
    score += (140 - city.costIndex) * 0.2 * w("cost");

    // Career
    score += city.jobGrowth * 2 * w("career");
    if (profile.hasRemote) score += 8 * w("career"); // remote = less dependent on local jobs

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
    const db = profile.dealBreakers;
    if (db.includes("No extreme cold") && city.avgTemp < 45) score -= 25;
    if (db.includes("No extreme heat") && city.avgTemp > 72) score -= 25;
    if (db.includes("Must have public transit") && city.transitScore < 40) score -= 25;
    if (db.includes("Must be walkable") && city.walkScore < 50) score -= 25;
    if (db.includes("No state income tax") && city.stateTax > 0) score -= 30;
    if (db.includes("Low crime only") && city.safetyIndex < 70) score -= 20;

    return Math.min(99, Math.max(5, Math.round(score)));
  };

  // ── AI Fetch ──
  const fetchCityAI = useCallback(async (city, category) => {
    const key = `${city.name}_${category}`;
    if (cityAIData[key] || aiLoading[key]) return;
    setAiLoading(prev => ({ ...prev, [key]: true }));

    const profLabel = profile.profession || "professional";
    const prompts = {
      jobs: `Search for 6 current job openings for "${profLabel}" in ${city.name}. For each, return: title, company, salary range if available, a one-line description, and the URL to the job listing. Return ONLY valid JSON array like: [{"title":"...","company":"...","salary":"...","desc":"...","url":"..."}]. No markdown, no preamble.`,
      housing_rent: `Search for current apartment rental listings in ${city.name}. Find 5 specific real apartments/units available now on sites like apartments.com, zillow, or similar. For each return: the building or complex name, neighborhood, bedrooms, price per month, one notable feature, an image URL of the listing or building if available, and the URL to the actual listing. Return ONLY valid JSON array like: [{"name":"...","neighborhood":"...","beds":"...","price":"...","feature":"...","image":"...","url":"..."}]. No markdown.`,
      housing_buy: `Search for current homes for sale in ${city.name} under $${Math.round(getSalary(city) * 5).toLocaleString()} on zillow, redfin, or realtor.com. Find 5 specific listings. Return ONLY valid JSON array like: [{"address":"...","neighborhood":"...","beds":"...","price":"...","sqft":"...","feature":"...","image":"...","url":"..."}]. No markdown.`,
      nightlife: `Search for the top 6 most popular nightlife spots, bars, and clubs in ${city.name} right now. For each return: name, type (bar/club/lounge/brewery), neighborhood, what it's known for in one sentence, the venue's website or Google Maps URL, and an image URL if available. Return ONLY valid JSON array like: [{"name":"...","type":"...","neighborhood":"...","known_for":"...","url":"...","image":"..."}]. No markdown.`,
      outdoors: `Search for the top 6 outdoor activities and nature spots near ${city.name}. Include hiking trails, parks, lakes, mountains. For each return: name, type, distance from downtown, a one-line description, a URL (AllTrails link, official site, or Google Maps), and an image URL if available. Return ONLY valid JSON array like: [{"name":"...","type":"...","distance":"...","desc":"...","url":"...","image":"..."}]. No markdown.`,
      food: `Search for 6 highly-rated and popular restaurants in ${city.name} across different cuisines. For each return: name, cuisine, price range ($-$$$$), neighborhood, what makes it special, the restaurant's website or Yelp/Google URL, and an image URL if available. Return ONLY valid JSON array like: [{"name":"...","cuisine":"...","price":"...","neighborhood":"...","special":"...","url":"...","image":"..."}]. No markdown.`,
      dayinlife: `Write a vivid, specific "A Day in the Life" narrative for a ${profile.age}-year-old ${profLabel} earning about ${fmt(getSalary(city))}/year living in ${city.name}. Include: morning routine, commute, work, lunch spot (name a real place), after-work activity (name a real place), evening plans, and how they feel about their life there. Make it 200 words, second person ("You wake up..."). Return ONLY the narrative text, no JSON, no markdown.`,
    };

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompts[category] }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(i => i.type === "text" ? i.text : "").filter(Boolean).join("\n") || "";
      let parsed;
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        parsed = text;
      }
      setCityAIData(prev => ({ ...prev, [key]: parsed }));
    } catch (err) {
      setCityAIData(prev => ({ ...prev, [key]: "error" }));
    } finally {
      setAiLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [profile, cityAIData, aiLoading]);

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
  // LANDING
  // ═══════════════════════════════════════════
  if (step === 0) return (
    <div style={{ ...css, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center" }}>
      <div style={fadeIn}>
        <div style={{ width:48, height:48, border:"2px solid var(--accent)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px", fontSize:22, color:"var(--accent)", transform:"rotate(45deg)" }}>
          <span style={{ transform:"rotate(-45deg)" }}>◆</span>
        </div>
        <h1 style={{ ...heading, fontSize:"clamp(48px,10vw,72px)", fontWeight:400, lineHeight:1, marginBottom:12, background:"linear-gradient(135deg, #EEF2F7 20%, #6EE7B7 60%, #FBBF24 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          potential
        </h1>
        <p style={{ fontSize:19, color:"var(--text2)", lineHeight:1.6, maxWidth:460, margin:"0 auto 8px", fontWeight:300 }}>
          See what your life could look like — somewhere else.
        </p>
        <p style={{ fontSize:13, color:"var(--text3)", lineHeight:1.6, maxWidth:400, margin:"0 auto 44px" }}>
          Build your profile. Explore real cities. Real jobs. Real apartments. Real places. Personalized to who you actually are.
        </p>
        <button onClick={() => goStep(1)} style={{ ...btnPrimary, width:"auto", padding:"16px 56px", borderRadius:40, boxShadow:"0 0 60px rgba(110,231,183,0.15)" }}>
          Start Exploring
        </button>
        <div style={{ marginTop:56, display:"flex", gap:28, justifyContent:"center", flexWrap:"wrap" }}>
          {["12 cities","Real job listings","Live housing data","AI day-in-the-life"].map(t => (
            <span key={t} style={{ fontSize:11, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.1em" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  // PROFILE (multi-step)
  // ═══════════════════════════════════════════
  if (step === 1) {
    const totalSteps = 5;
    const canProceed = [
      () => profile.profession !== "",
      () => true,
      () => true,
      () => profile.lifestyleTags.length >= 1,
      () => true,
    ][profileStep]?.() ?? true;

    const nextProfile = () => {
      if (profileStep < totalSteps - 1) goProfile(profileStep + 1);
      else {
        const scored = CITIES_DATA.map(c => ({ ...c, matchScore: getMatchScore(c), salary: getSalary(c), monthlySavings: getSavings(c) }));
        setResults(scored);
        goStep(2);
      }
    };

    return (
      <div style={{ ...css, padding:"32px 24px" }}>
        <div style={{ maxWidth:560, margin:"0 auto", ...fadeIn }}>
          {/* Progress */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:36 }}>
            <button onClick={() => profileStep > 0 ? goProfile(profileStep - 1) : goStep(0)} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>←</button>
            <div style={{ flex:1, display:"flex", gap:4 }}>
              {Array.from({length:totalSteps}).map((_,i) => (
                <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= profileStep ? "var(--accent)" : "var(--border)", transition:"all 0.3s" }} />
              ))}
            </div>
            <span style={{ fontSize:12, color:"var(--text3)", ...mono }}>{profileStep + 1}/{totalSteps}</span>
          </div>

          {/* STEP 0: Career */}
          {profileStep === 0 && (
            <div>
              <h2 style={{ ...heading, fontSize:32, marginBottom:4 }}>What do you do?</h2>
              <p style={{ color:"var(--text3)", fontSize:14, marginBottom:32 }}>This determines salary estimates and job matches.</p>
              {Object.entries(PROFESSION_CATEGORIES).map(([cat, profs]) => (
                <div key={cat} style={sectionGap}>
                  <div style={label}>{cat}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {profs.map(p => (
                      <button key={p} onClick={() => upd("profession", p)} style={pill(profile.profession === p)}>{p}</button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={sectionGap}>
                <label style={label}>Or type your own</label>
                <input value={profile.customProfession} onChange={e => { upd("customProfession", e.target.value); upd("profession", e.target.value); }} placeholder="e.g. Marine Biologist" style={inputStyle} />
              </div>
              <div style={sectionGap}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <label style={{ ...label, marginBottom:0 }}>Can you work fully remote?</label>
                  <button onClick={() => upd("hasRemote", !profile.hasRemote)} style={{ ...pill(profile.hasRemote), padding:"6px 16px" }}>
                    {profile.hasRemote ? "✓ Yes" : "No"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Finances */}
          {profileStep === 1 && (
            <div>
              <h2 style={{ ...heading, fontSize:32, marginBottom:4 }}>Your finances</h2>
              <p style={{ color:"var(--text3)", fontSize:14, marginBottom:32 }}>Be honest — this is what makes the results real.</p>
              <div style={sectionGap}>
                <label style={label}>Current annual income — <span style={{ ...mono, color:"var(--accent)" }}>{fmtFull(profile.income)}</span></label>
                <input type="range" min={20000} max={250000} step={5000} value={profile.income} onChange={e => upd("income", +e.target.value)} style={{ width:"100%", accentColor:"#6EE7B7" }} />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text3)", marginTop:4 }}>
                  <span>$20K</span><span>$250K</span>
                </div>
              </div>
              <div style={sectionGap}>
                <label style={label}>Savings available — <span style={{ ...mono, color:"var(--accent)" }}>{fmtFull(profile.savings)}</span></label>
                <input type="range" min={0} max={200000} step={2500} value={profile.savings} onChange={e => upd("savings", +e.target.value)} style={{ width:"100%", accentColor:"#6EE7B7" }} />
              </div>
              <div style={sectionGap}>
                <label style={label}>Total debt (student loans, car, etc.) — <span style={{ ...mono, color: profile.debt > 0 ? "var(--neg)" : "var(--text3)" }}>{fmtFull(profile.debt)}</span></label>
                <input type="range" min={0} max={200000} step={2500} value={profile.debt} onChange={e => upd("debt", +e.target.value)} style={{ width:"100%", accentColor:"#F87171" }} />
              </div>
              <div style={sectionGap}>
                <label style={label}>Housing preference</label>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={() => upd("housing","rent")} style={{ ...pill(profile.housing === "rent"), flex:1, justifyContent:"center", padding:14 }}>🏢 Renting</button>
                  <button onClick={() => upd("housing","buy")} style={{ ...pill(profile.housing === "buy"), flex:1, justifyContent:"center", padding:14 }}>🏠 Buying</button>
                </div>
              </div>
              <div style={sectionGap}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <label style={{ ...label, marginBottom:0 }}>Do you have a partner/spouse?</label>
                  <button onClick={() => upd("hasPartner", !profile.hasPartner)} style={{ ...pill(profile.hasPartner), padding:"6px 16px" }}>{profile.hasPartner ? "✓ Yes" : "No"}</button>
                </div>
                {profile.hasPartner && (
                  <div>
                    <label style={label}>Partner's annual income — <span style={{ ...mono, color:"var(--accent)" }}>{fmtFull(profile.partnerIncome)}</span></label>
                    <input type="range" min={0} max={200000} step={5000} value={profile.partnerIncome} onChange={e => upd("partnerIncome", +e.target.value)} style={{ width:"100%", accentColor:"#6EE7B7" }} />
                  </div>
                )}
              </div>
              <div style={sectionGap}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <label style={{ ...label, marginBottom:0 }}>Kids / Dependents?</label>
                  <button onClick={() => upd("hasDependents", !profile.hasDependents)} style={{ ...pill(profile.hasDependents), padding:"6px 16px" }}>{profile.hasDependents ? "✓ Yes" : "No"}</button>
                </div>
                {profile.hasDependents && (
                  <div style={{ display:"flex", gap:8 }}>
                    {[1,2,3,4].map(n => (
                      <button key={n} onClick={() => upd("numDependents", n)} style={{ ...pill(profile.numDependents === n), padding:"10px 18px" }}>{n}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Background */}
          {profileStep === 2 && (
            <div>
              <h2 style={{ ...heading, fontSize:32, marginBottom:4 }}>A bit more about you</h2>
              <p style={{ color:"var(--text3)", fontSize:14, marginBottom:32 }}>These details sharpen your matches.</p>
              <div style={sectionGap}>
                <label style={label}>Your age — <span style={{ ...mono, color:"var(--accent)" }}>{profile.age}</span></label>
                <input type="range" min={18} max={70} value={profile.age} onChange={e => upd("age", +e.target.value)} style={{ width:"100%", accentColor:"#6EE7B7" }} />
              </div>
              <div style={sectionGap}>
                <label style={label}>Education</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {[["highschool","High School"],["associates","Associate's"],["bachelors","Bachelor's"],["masters","Master's"],["doctorate","Doctorate"],["trade","Trade/Vocational"]].map(([k,l]) => (
                    <button key={k} onClick={() => upd("education", k)} style={pill(profile.education === k)}>{l}</button>
                  ))}
                </div>
              </div>
              <div style={sectionGap}>
                <label style={label}>Where do you live now?</label>
                <input value={profile.currentCity} onChange={e => upd("currentCity", e.target.value)} placeholder="e.g. Springfield, MO" style={inputStyle} />
              </div>
              <div style={sectionGap}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: profile.hasPets ? 12 : 0 }}>
                  <label style={{ ...label, marginBottom:0 }}>Pets?</label>
                  <button onClick={() => upd("hasPets", !profile.hasPets)} style={{ ...pill(profile.hasPets), padding:"6px 16px" }}>{profile.hasPets ? "✓ Yes" : "No"}</button>
                </div>
                {profile.hasPets && (
                  <div style={{ display:"flex", gap:8 }}>
                    {["Dog","Cat","Both","Other"].map(t => (
                      <button key={t} onClick={() => upd("petType", t)} style={pill(profile.petType === t)}>{t}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Lifestyle */}
          {profileStep === 3 && (
            <div>
              <h2 style={{ ...heading, fontSize:32, marginBottom:4 }}>Your ideal lifestyle</h2>
              <p style={{ color:"var(--text3)", fontSize:14, marginBottom:32 }}>Pick everything that matters to you (at least 1).</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {LIFESTYLE_TAGS.map(tag => {
                  const active = profile.lifestyleTags.includes(tag.id);
                  return (
                    <button key={tag.id} onClick={() => toggleArr("lifestyleTags", tag.id)} style={{
                      ...pill(active), padding:"14px 16px", textAlign:"left", borderRadius:12
                    }}>
                      <span style={{ fontSize:18 }}>{tag.icon}</span> {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Priorities & Dealbreakers */}
          {profileStep === 4 && (
            <div>
              <h2 style={{ ...heading, fontSize:32, marginBottom:4 }}>Priorities & deal-breakers</h2>
              <p style={{ color:"var(--text3)", fontSize:14, marginBottom:32 }}>What matters most? What's non-negotiable?</p>
              <div style={sectionGap}>
                <label style={label}>Rank what matters most (tap to reorder)</label>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {profile.importanceRank.map((item, i) => {
                    const labels = { cost:"💰 Affordability", career:"💼 Career Growth", lifestyle:"🎭 Lifestyle & Culture", safety:"🛡️ Safety & Stability" };
                    return (
                      <div key={item} style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ ...mono, fontSize:12, color:"var(--text3)", width:20 }}>#{i+1}</span>
                        <div style={{ flex:1, padding:"12px 16px", background:"var(--card)", border:"1px solid var(--border)", borderRadius:10, color:"var(--text)", fontSize:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <span>{labels[item]}</span>
                          <div style={{ display:"flex", gap:4 }}>
                            {i > 0 && <button onClick={() => { const r = [...profile.importanceRank]; [r[i],r[i-1]] = [r[i-1],r[i]]; upd("importanceRank", r); }} style={{ background:"none", border:"1px solid var(--border)", borderRadius:6, color:"var(--text3)", cursor:"pointer", padding:"2px 8px", fontSize:14 }}>↑</button>}
                            {i < 3 && <button onClick={() => { const r = [...profile.importanceRank]; [r[i],r[i+1]] = [r[i+1],r[i]]; upd("importanceRank", r); }} style={{ background:"none", border:"1px solid var(--border)", borderRadius:6, color:"var(--text3)", cursor:"pointer", padding:"2px 8px", fontSize:14 }}>↓</button>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={sectionGap}>
                <label style={label}>Deal-breakers (optional)</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {DEAL_BREAKERS.map(db => (
                    <button key={db} onClick={() => toggleArr("dealBreakers", db)} style={{ ...pill(profile.dealBreakers.includes(db)), fontSize:12 }}>
                      {profile.dealBreakers.includes(db) ? "🚫 " : ""}{db}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop:32 }}>
            <button onClick={nextProfile} disabled={!canProceed} style={canProceed ? btnPrimary : btnDisabled}>
              {profileStep < totalSteps - 1 ? "Continue →" : "Show Me My Potential →"}
            </button>
          </div>
        </div>
      </div>
    );
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
