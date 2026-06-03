import { useState } from "react";
import { PROFESSION_CATEGORIES, LIFESTYLE_TAGS, DEAL_BREAKERS } from '../../shared/data/constants.js';

// ═══════════════════════════════════════════════════════════════
// QUIZ — Phase 2 Profile Capture (Split/sidebar, gold cinematic)
// Content from 02-UI-SPEC.md. Produces a profile compatible with the
// scoring engine (lifestyleTags ids, importanceRank cost/career/...,
// DEAL_BREAKERS strings) plus the new Phase-2 fields. onComplete(profile)
// hands off to the parent for scoring → results.
// ═══════════════════════════════════════════════════════════════

const EDU = [["highschool","High School"],["associates","Associate's"],["bachelors","Bachelor's"],["masters","Master's"],["doctorate","Doctorate"],["trade","Trade / Vocational"]];
const CITIZEN = ["US Citizen","Canadian","British","Australian","EU Citizen","Indian","Mexican","Filipino","Brazilian","Nigerian","Other"];
const IMMIG = ["US Citizen","Permanent Resident","Work Visa (H-1B / O-1 / etc.)","Student Visa","Other / Not in US"];
const TIMELINE = ["Within 6 months","6–12 months","1–2 years","2+ years","Just exploring"];
const MOTIV = ["Better career opportunities","Lower cost of living","Adventure / experience abroad","Better quality of life","Family reasons","Climate / nature","Political / social environment","Just curious"];
const WORK = ["Fully remote","Hybrid (office + remote)","On-site / in-person","Self-employed / freelance","Job-hunting / between roles"];
const COMMUNITY = ["Very important","Somewhat important","I'm ready for a fresh start"];
const PACE = ["Fast-paced / hustle","Balanced","Laid-back / slow"];
const RISK = ["I like stability and predictability","I can handle some uncertainty","I thrive in change"];
const RANK_LABELS = { cost:"💰 Affordability", career:"💼 Career growth", lifestyle:"🎭 Lifestyle & culture", safety:"🛡️ Safety & stability" };
const CONFLICT_PAIRS = [["cost","lifestyle"],["career","lifestyle"],["cost","career"]];

const STEP_META = [
  { id:"career", short:"Career", h:"What do you do?", sub:"It sets your salary range and the job matches we'll surface." },
  { id:"finances", short:"Finances", h:"Your finances", sub:"Be honest — this is what makes the numbers real." },
  { id:"background", short:"Background", h:"A bit about you", sub:"These sharpen your matches and your real numbers." },
  { id:"global", short:"Going Global", h:"Going Global", sub:"This shapes whether international cities appear in your matches — and which visa pathways open up." },
  { id:"lifestyle", short:"Lifestyle", h:"Your ideal life", sub:"Pick everything that matters — at least one." },
  { id:"motivations", short:"Motivations", h:"What drives you?", sub:"This helps us find places that match who you actually are, not just what you earn." },
  { id:"priorities", short:"Priorities", h:"Priorities & dealbreakers", sub:"What matters most — and what's truly non-negotiable." },
];

const money = (n) => "$" + (+n).toLocaleString();
const opennessLabel = (v) => v == 0 ? "Not at all" : v <= 30 ? "A little curious" : v <= 70 ? "Definitely open" : "Ready to go";

const CSS = `
.qz{ --bg:#070a11; --bg2:#0d1119; --card:rgba(255,255,255,.035); --card2:rgba(255,255,255,.06);
  --border:rgba(243,237,225,.12); --border2:rgba(243,237,225,.24);
  --accent:#e2b56b; --accent-ink:#13100a; --accent-dim:rgba(226,181,107,.13);
  --glow:rgba(226,181,107,.6); --glow-sel:rgba(226,181,107,.3);
  --ink:#f3ede1; --dim:rgba(243,237,225,.56); --faint:rgba(243,237,225,.30);
  --neg:#e0816a; --warn:#e2b56b; --warn-dim:rgba(226,181,107,.08);
  --serif:'Instrument Serif',serif; --mono:'JetBrains Mono',monospace; --ease:cubic-bezier(.22,.61,.36,1);
  font-family:'Manrope',sans-serif; color:var(--ink); min-height:100vh; background:var(--bg);
  background-image:radial-gradient(120% 80% at 50% -10%, var(--bg2), var(--bg) 60%); -webkit-font-smoothing:antialiased;
  .lab{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--dim);font-weight:600;margin-bottom:9px}
  .lab .val{font-family:var(--mono);text-transform:none;letter-spacing:0;color:var(--accent);font-weight:600;text-shadow:0 0 7px var(--glow-sel)}
  .lab .val.neg{color:var(--neg)}
  .req{color:var(--accent);margin-left:2px}
  .field{margin-bottom:24px}
  .cat{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);font-weight:600;margin:14px 0 8px}
  .cat:first-child{margin-top:0}
  .pills{display:flex;flex-wrap:wrap;gap:8px}
  .pill{font-family:inherit;font-size:13px;color:var(--dim);background:var(--card);border:1px solid var(--border);border-radius:10px;padding:8px 16px;cursor:pointer;transition:.2s var(--ease);display:inline-flex;align-items:center;gap:6px}
  .pill:hover{color:var(--ink);border-color:var(--border2)}
  .pill.on{color:var(--accent);border:1.5px solid var(--accent);background:var(--accent-dim);font-weight:600;box-shadow:0 0 7px -4px var(--glow-sel)}
  .pill.dis{opacity:.4;cursor:not-allowed}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .tile{font-family:inherit;font-size:13.5px;color:var(--dim);background:var(--card);border:1px solid var(--border);border-radius:12px;padding:13px 14px;cursor:pointer;transition:.2s var(--ease);display:flex;align-items:center;gap:9px;text-align:left}
  .tile:hover{color:var(--ink);border-color:var(--border2)}
  .tile.on{color:var(--accent);border:1.5px solid var(--accent);background:var(--accent-dim);box-shadow:0 0 7px -4px var(--glow-sel)}
  .togrow{display:flex;align-items:center;justify-content:space-between;gap:12px}
  input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:5px;border-radius:6px;margin:9px 0;cursor:pointer;background:linear-gradient(90deg, var(--accent) var(--p,40%), var(--card2) var(--p,40%))}
  input[type=range].neg{background:linear-gradient(90deg, var(--neg) var(--p,40%), var(--card2) var(--p,40%))}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px var(--accent-dim), 0 0 14px -2px var(--glow);cursor:pointer;transition:transform .15s}
  input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.12)}
  input[type=range].neg::-webkit-slider-thumb{background:var(--neg);box-shadow:0 0 0 4px rgba(224,129,106,.18)}
  input[type=range]::-moz-range-track{background:transparent;height:5px;border-radius:6px}
  input[type=range]::-moz-range-thumb{width:18px;height:18px;border:none;border-radius:50%;background:var(--accent);box-shadow:0 0 14px -2px var(--glow)}
  input[type=range].neg::-moz-range-thumb{background:var(--neg)}
  .ends{display:flex;justify-content:space-between;font-size:11px;color:var(--faint);margin-top:2px}
  input[type=text]{width:100%;font-family:inherit;font-size:15px;color:var(--ink);background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;transition:.2s var(--ease);box-sizing:border-box}
  input[type=text]:focus{outline:none;border-color:var(--border2)}
  input[type=text]::placeholder{color:var(--faint)}
  .annot{font-size:12px;color:var(--neg);background:rgba(224,129,106,.08);padding:6px 12px;border-radius:8px;margin-top:8px;display:inline-block}
  .warn{margin-top:12px;background:var(--warn-dim);border:1px solid color-mix(in srgb,var(--warn) 22%,transparent);border-radius:12px;padding:12px 16px}
  .warn b{display:block;font-size:13px;font-weight:600;color:var(--warn);margin-bottom:3px}
  .warn span{font-size:13px;color:var(--dim);line-height:1.6}
  .hint{font-size:13px;color:var(--faint);margin-top:8px}
  .ranklist{display:flex;flex-direction:column;gap:8px}
  .rank{display:flex;align-items:center;gap:11px}
  .rank .n{font-family:var(--mono);font-size:12px;color:var(--accent);width:18px;text-shadow:0 0 6px var(--glow-sel)}
  .rank .rbody{flex:1;display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--card);border:1px solid var(--border);border-radius:11px;font-size:14px}
  .arrow{background:none;border:1px solid var(--border);border-radius:7px;color:var(--dim);cursor:pointer;padding:2px 8px;font-size:12px}
  .arrow:hover{border-color:var(--accent);color:var(--accent)}
  .acc{border-left:3px solid var(--accent);padding-left:16px}
  .q{font-family:var(--serif);font-weight:400;letter-spacing:-.01em;line-height:1.06}
  .qsub{color:var(--dim);font-size:14px;font-weight:300;line-height:1.6;margin-top:6px}
  .cta{font-family:inherit;font-size:15px;font-weight:600;letter-spacing:.03em;color:var(--accent);background:var(--accent-dim);border:1px solid color-mix(in srgb,var(--accent) 40%,transparent);border-radius:14px;padding:16px 28px;cursor:pointer;transition:.3s var(--ease);box-shadow:0 0 22px -6px var(--glow), inset 0 0 14px -8px var(--glow)}
  .cta:hover{transform:translateY(-1px);background:color-mix(in srgb,var(--accent) 16%,transparent);border-color:color-mix(in srgb,var(--accent) 70%,transparent);color:var(--ink);box-shadow:0 6px 30px -6px var(--glow), inset 0 0 16px -6px var(--glow)}
  .cta:disabled{color:var(--faint);background:var(--card);border-color:var(--border);box-shadow:none;cursor:not-allowed;transform:none}
  .ghost{background:none;border:none;color:var(--faint);font-family:inherit;font-size:13px;cursor:pointer}
  .ghost:hover{color:var(--accent)}
  .count{font-family:var(--mono);font-size:12px;color:var(--faint)}
  .split{display:grid;grid-template-columns:300px 1fr;min-height:100vh}
  .rail{border-right:1px solid var(--border);padding:38px 28px;position:sticky;top:0;align-self:start;height:100vh;overflow:auto}
  .rail .brand{font-family:var(--serif);font-size:24px;letter-spacing:.5px;margin-bottom:30px}
  .rail .brand small{font-style:italic;opacity:.55;font-size:14px}
  .rail h3{font-family:var(--serif);font-size:24px;margin-bottom:6px}
  .rail .railsub{font-size:13px;color:var(--dim);line-height:1.6;margin-bottom:24px}
  .steplist{display:flex;flex-direction:column;gap:2px}
  .sitem{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:10px;color:var(--dim);font-size:14px;transition:.2s}
  .sitem.click{cursor:pointer}
  .sitem.click:hover{background:var(--card)}
  .sitem.on{color:var(--ink);background:var(--card)}
  .sitem .dot{width:22px;height:22px;border-radius:50%;border:1px solid var(--border2);display:grid;place-items:center;font-family:var(--mono);font-size:11px;flex:none}
  .sitem.on .dot{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);font-weight:600;box-shadow:0 0 8px -5px var(--glow-sel)}
  .sitem.done .dot{background:var(--accent-dim);color:var(--accent);border-color:var(--accent);box-shadow:0 0 7px -5px var(--glow-sel)}
  .railfoot{margin-top:26px;font-family:var(--mono);font-size:11px;color:var(--faint)}
  .pane{padding:64px 56px 60px;max-width:620px;width:100%;animation:qzfade .5s var(--ease)}
  .q.step{font-size:32px;margin-top:8px}
  .fields{margin-top:28px}
  .foot{margin-top:34px;display:flex;gap:14px;align-items:center}
  .foot .grow{flex:1}
  .summary{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);border:1px solid var(--border);border-radius:16px;overflow:hidden;margin:26px 0}
  .srow{background:var(--bg);padding:14px 18px}
  .srow .k{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--faint);margin-bottom:4px}
  .srow .v{font-size:14px;color:var(--ink)}
  .srow .v.mono{font-family:var(--mono);color:var(--accent)}
}
@keyframes qzfade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media(max-width:760px){
  .qz .split{grid-template-columns:1fr}
  .qz .rail{position:static;height:auto;border-right:none;border-bottom:1px solid var(--border);padding:22px}
  .qz .rail h3,.qz .rail .railsub{display:none}
  .qz .steplist{flex-direction:row;overflow:auto;gap:6px}
  .qz .sitem span:not(.dot){display:none}
  .qz .pane{padding:36px 22px 60px}
}
@media(prefers-reduced-motion:reduce){.qz *{animation:none!important;transition:none!important}}
`;

const sp = (v, min, max) => ({ "--p": ((v - min) / (max - min) * 100) + "%" });

// ── render helpers at MODULE scope (not inside Quiz) so React never remounts
//    them on state change — this keeps slider drags smooth ──
function Pill({ on, dis, onClick, children }) {
  return <button className={`pill ${on ? "on" : ""} ${dis ? "dis" : ""}`} onClick={dis ? undefined : onClick}>{children}</button>;
}
function Slider({ label, valueText, neg, min, max, step, value, onChange, ends }) {
  return (
    <div className="field">
      <span className="lab">{label} <span className={`val ${neg ? "neg" : ""}`}>{valueText}</span></span>
      <input type="range" className={neg ? "neg" : ""} min={min} max={max} step={step} value={value} style={sp(value, min, max)} onChange={e => onChange(+e.target.value)} />
      {ends && <div className="ends"><span>{ends[0]}</span><span>{ends[1]}</span></div>}
    </div>
  );
}
function Toggle({ label, on, onToggle, children }) {
  return (
    <div className="field">
      <div className="togrow"><span className="lab" style={{ margin: 0 }}>{label}</span>
        <button className={`pill ${on ? "on" : ""}`} onClick={onToggle}>{on ? "✓ Yes" : "No"}</button></div>
      {on && <div style={{ marginTop: 14 }}>{children}</div>}
    </div>
  );
}

export default function Quiz({ onComplete, onExit }) {
  const [s, setS] = useState({
    profession:"", customProfession:"", hasRemote:false,
    income:60000, savings:15000, debt:0, housing:"", hasPartner:false, partnerIncome:0, hasDependents:false, numDependents:1,
    age:28, education:"", currentCity:"", hasPets:false, petType:"",
    opennessToAbroad:40, citizenship:"US Citizen", immigrationStatus:"citizen", moveTimeline:"",
    lifestyleTags:[], motivations:[], workStyle:"", communityImportance:"", pace:"", riskTolerance:"",
    importanceRank:["cost","career","lifestyle","safety"], dealBreakers:[], tiebreaker:null,
  });
  const [idx, setIdx] = useState(0);
  const [view, setView] = useState("quiz"); // quiz | reconcile | done
  const [conflict, setConflict] = useState(null);

  const set = (k, v) => setS(p => ({ ...p, [k]: v }));
  const setPill = (k, v) => setS(p => ({ ...p, [k]: p[k] === v ? "" : v, ...(k === "citizenship" ? { immigrationStatus: v === "US Citizen" ? "citizen" : "" } : {}) }));
  const toggle = (k) => setS(p => ({ ...p, [k]: !p[k] }));
  const toggleArr = (k, v, max) => setS(p => {
    const arr = p[k]; const i = arr.indexOf(v);
    if (i >= 0) return { ...p, [k]: arr.filter(x => x !== v) };
    if (max && arr.length >= max) return p;
    return { ...p, [k]: [...arr, v] };
  });
  const moveRank = (i, dir) => setS(p => { const r = [...p.importanceRank]; const j = dir === "up" ? i - 1 : i + 1; [r[i], r[j]] = [r[j], r[i]]; return { ...p, importanceRank: r }; });

  const STEPS = STEP_META;
  const isLast = idx === STEPS.length - 1;
  const valid = () => {
    const id = STEPS[idx].id;
    if (id === "career") return !!(s.profession || s.customProfession.trim());
    if (id === "global") return !!s.citizenship;
    if (id === "lifestyle") return s.lifestyleTags.length >= 1;
    return true;
  };
  const reqMsg = () => {
    const id = STEPS[idx].id;
    if (id === "career" && !valid()) return "Pick a field or write your own to continue.";
    if (id === "lifestyle" && !valid()) return "Pick at least one to continue.";
    return "";
  };

  const detectConflict = () => {
    const top2 = s.importanceRank.slice(0, 2);
    for (const pair of CONFLICT_PAIRS) if (top2.includes(pair[0]) && top2.includes(pair[1])) return pair;
    return null;
  };

  const buildProfile = () => ({
    profession: s.profession || s.customProfession.trim(), customProfession: s.customProfession.trim(), hasRemote: s.hasRemote,
    income: s.income, savings: s.savings, debt: s.debt, housing: s.housing || "rent",
    hasPartner: s.hasPartner, partnerIncome: s.hasPartner ? s.partnerIncome : 0,
    hasDependents: s.hasDependents, numDependents: s.hasDependents ? s.numDependents : 0,
    age: s.age, education: s.education, currentCity: s.currentCity.trim(), hasPets: s.hasPets, petType: s.hasPets ? s.petType : "",
    lifestyleTags: [...s.lifestyleTags], dealBreakers: [...s.dealBreakers], importanceRank: [...s.importanceRank],
    // Phase-2 additions (consumed by matching/visa later)
    opennessToAbroad: s.opennessToAbroad, citizenship: s.citizenship, immigrationStatus: s.immigrationStatus, moveTimeline: s.moveTimeline,
    motivations: [...s.motivations], workStyle: s.workStyle, communityImportance: s.communityImportance, pace: s.pace, riskTolerance: s.riskTolerance,
    tiebreaker: s.tiebreaker,
  });

  const finish = () => { const p = buildProfile(); console.log("[Potential] Profile captured →", p); setView("done"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const next = () => {
    if (!valid()) return;
    if (!isLast) { setIdx(idx + 1); setView("quiz"); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const c = detectConflict();
    if (c && !s.tiebreaker) { setConflict(c); setView("reconcile"); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else finish();
  };
  const back = () => {
    if (view === "done") { setView("quiz"); setIdx(STEPS.length - 1); return; }
    if (view === "reconcile") { setView("quiz"); setIdx(STEPS.length - 1); return; }
    if (idx > 0) { setIdx(idx - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else if (onExit) onExit();
  };
  const goto = (i) => { setView("quiz"); setIdx(i); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const stepBody = () => {
    const id = STEPS[idx].id;
    if (id === "career") return (<>
      <div className="field"><span className="lab">What's your field? <span className="req">*</span></span>
        {Object.entries(PROFESSION_CATEGORIES).map(([cat, profs]) => (
          <div key={cat}><div className="cat">{cat}</div>
            <div className="pills">{profs.map(p => <Pill key={p} on={s.profession === p} onClick={() => setPill("profession", p)}>{p}</Pill>)}</div></div>
        ))}</div>
      <div className="field"><span className="lab">Or write your own</span>
        <input type="text" value={s.customProfession} placeholder="e.g. Marine Biologist" onChange={e => set("customProfession", e.target.value)} /></div>
      <Toggle label="Can you work fully remote?" on={s.hasRemote} onToggle={() => toggle("hasRemote")} />
    </>);
    if (id === "finances") return (<>
      <Slider label="Annual income" valueText={money(s.income)} min={20000} max={250000} step={5000} value={s.income} onChange={v => set("income", v)} ends={["$20K", "$250K"]} />
      <Slider label="Savings available" valueText={money(s.savings)} min={0} max={200000} step={2500} value={s.savings} onChange={v => set("savings", v)} />
      <Slider label="Total debt" valueText={money(s.debt)} neg={s.debt > 0} min={0} max={200000} step={2500} value={s.debt} onChange={v => set("debt", v)} />
      <div className="field"><span className="lab">Housing</span><div className="pills">
        <Pill on={s.housing === "rent"} onClick={() => setPill("housing", "rent")}>🏢 Renting</Pill>
        <Pill on={s.housing === "buy"} onClick={() => setPill("housing", "buy")}>🏠 Buying</Pill></div></div>
      <Toggle label="Partner or spouse?" on={s.hasPartner} onToggle={() => toggle("hasPartner")}>
        <Slider label="Partner's income" valueText={money(s.partnerIncome)} min={0} max={200000} step={5000} value={s.partnerIncome} onChange={v => set("partnerIncome", v)} />
      </Toggle>
      <Toggle label="Kids or dependents?" on={s.hasDependents} onToggle={() => toggle("hasDependents")}>
        <div className="pills">{[1, 2, 3, 4].map(n => <Pill key={n} on={s.numDependents === n} onClick={() => set("numDependents", n)}>{n}</Pill>)}</div>
      </Toggle>
    </>);
    if (id === "background") return (<>
      <Slider label="Age" valueText={s.age} min={18} max={70} step={1} value={s.age} onChange={v => set("age", v)} />
      <div className="field"><span className="lab">Education</span><div className="pills">
        {EDU.map(([k, l]) => <Pill key={k} on={s.education === k} onClick={() => setPill("education", k)}>{l}</Pill>)}</div></div>
      <div className="field"><span className="lab">Where do you live now?</span>
        <input type="text" value={s.currentCity} placeholder="e.g. Springfield, MO" onChange={e => set("currentCity", e.target.value)} /></div>
      <Toggle label="Pets?" on={s.hasPets} onToggle={() => toggle("hasPets")}>
        <div className="pills">{["Dog", "Cat", "Both", "Other"].map(t => <Pill key={t} on={s.petType === t} onClick={() => setPill("petType", t)}>{t}</Pill>)}</div>
      </Toggle>
    </>);
    if (id === "global") return (
      <div className="acc">
        <Slider label="Open to living abroad" valueText={opennessLabel(s.opennessToAbroad)} min={0} max={100} step={5} value={s.opennessToAbroad} onChange={v => set("opennessToAbroad", v)} />
        {s.opennessToAbroad == 0 && <div className="annot" style={{ marginTop: -14, marginBottom: 14 }}>🚫 International cities excluded from your results</div>}
        <div className="field"><span className="lab">Citizenship <span className="req">*</span></span>
          <div className="pills">{CITIZEN.map(c => <Pill key={c} on={s.citizenship === c} onClick={() => setPill("citizenship", c)}>{c}</Pill>)}</div>
          {s.citizenship && s.citizenship !== "US Citizen" && (
            <div className="field" style={{ marginTop: 18 }}><span className="lab">Current immigration status (US)</span>
              <div className="pills">{IMMIG.map(i => <Pill key={i} on={s.immigrationStatus === i} onClick={() => setPill("immigrationStatus", i)}>{i}</Pill>)}</div></div>
          )}</div>
        <div className="field" style={{ marginBottom: 0 }}><span className="lab">When are you thinking of moving?</span>
          <div className="pills">{TIMELINE.map(t => <Pill key={t} on={s.moveTimeline === t} onClick={() => setPill("moveTimeline", t)}>{t}</Pill>)}</div></div>
      </div>
    );
    if (id === "lifestyle") return (
      <div className="field"><span className="lab">What pulls you? <span className="req">*</span></span>
        <div className="grid2">{LIFESTYLE_TAGS.map(tag => (
          <button key={tag.id} className={`tile ${s.lifestyleTags.includes(tag.id) ? "on" : ""}`} onClick={() => toggleArr("lifestyleTags", tag.id)}>
            <span>{tag.icon}</span> {tag.label}</button>
        ))}</div></div>
    );
    if (id === "motivations") return (<>
      <div className="field"><span className="lab">Why are you thinking about moving? (max 3)</span>
        <div className="pills">{MOTIV.map(m => { const on = s.motivations.includes(m); const dis = !on && s.motivations.length >= 3;
          return <Pill key={m} on={on} dis={dis} onClick={() => toggleArr("motivations", m, 3)}>{m}</Pill>; })}</div></div>
      <div className="field"><span className="lab">How do you work?</span><div className="pills">{WORK.map(w => <Pill key={w} on={s.workStyle === w} onClick={() => setPill("workStyle", w)}>{w}</Pill>)}</div></div>
      <div className="field"><span className="lab">Staying close to family / community?</span><div className="pills">{COMMUNITY.map(c => <Pill key={c} on={s.communityImportance === c} onClick={() => setPill("communityImportance", c)}>{c}</Pill>)}</div></div>
      <div className="field"><span className="lab">Preferred pace of life</span><div className="pills">{PACE.map(p => <Pill key={p} on={s.pace === p} onClick={() => setPill("pace", p)}>{p}</Pill>)}</div></div>
      <div className="field"><span className="lab">How do you feel about uncertainty?</span><div className="pills">{RISK.map(r => <Pill key={r} on={s.riskTolerance === r} onClick={() => setPill("riskTolerance", r)}>{r}</Pill>)}</div></div>
    </>);
    if (id === "priorities") return (<>
      <div className="field"><span className="lab">Rank what matters most</span><div className="ranklist">
        {s.importanceRank.map((it, i) => (
          <div className="rank" key={it}><span className="n">#{i + 1}</span>
            <div className="rbody"><span>{RANK_LABELS[it]}</span><span>
              {i > 0 && <button className="arrow" onClick={() => moveRank(i, "up")}>↑</button>}{" "}
              {i < s.importanceRank.length - 1 && <button className="arrow" onClick={() => moveRank(i, "down")}>↓</button>}</span></div></div>
        ))}</div></div>
      <div className="field" style={{ marginBottom: 0 }}><span className="lab">Hard dealbreakers</span>
        <div className="pills">{DEAL_BREAKERS.map(d => <Pill key={d} on={s.dealBreakers.includes(d)} onClick={() => toggleArr("dealBreakers", d)}>{s.dealBreakers.includes(d) ? "🚫 " : ""}{d}</Pill>)}</div>
        {s.dealBreakers.length >= 1 && <div className="warn"><b>Dealbreakers are hard filters.</b>
          <span>Cities that don't match will be removed from your results entirely — not just ranked lower. Add only true non-negotiables.</span></div>}</div>
    </>);
    return null;
  };

  // ── rail ──
  const rail = (
    <aside className="rail">
      <div className="brand">Potential <small>°</small></div>
      <h3>Build your profile</h3>
      <p className="railsub">A few honest steps. The more real your answers, the sharper your matches.</p>
      <div className="steplist">
        {STEPS.map((st, i) => {
          const done = view !== "quiz" || i < idx; const cur = view === "quiz" && i === idx;
          const clickable = done || i <= idx;
          return (
            <div key={st.id} className={`sitem ${cur ? "on" : ""} ${done && !cur ? "done" : ""} ${clickable ? "click" : ""}`} onClick={clickable ? () => goto(i) : undefined}>
              <span className="dot">{done && !cur ? "✓" : i + 1}</span><span>{st.short}</span>
            </div>
          );
        })}
      </div>
      <div className="railfoot">{view === "done" ? "profile captured ✓" : `step ${Math.min(idx + 1, STEPS.length)} / ${STEPS.length}`}</div>
    </aside>
  );

  // ── pane ──
  let pane;
  if (view === "reconcile") {
    const [A, B] = conflict;
    pane = (
      <div className="pane" key="reconcile">
        <div className="count">Almost there</div>
        <div style={{ borderLeft: "3px solid var(--accent)", background: "var(--card)", border: "1px solid var(--border2)", borderRadius: 16, padding: 22, marginTop: 14 }}>
          <span className="lab">We noticed something</span>
          <div className="q" style={{ fontSize: 24 }}>You love {RANK_LABELS[A].replace(/^\S+\s/, "").toLowerCase()} and {RANK_LABELS[B].replace(/^\S+\s/, "").toLowerCase()}.</div>
          <p className="qsub">These sometimes pull in different directions. If you had to lean one way, which wins?</p>
          <div className="pills" style={{ marginTop: 18, gap: 10 }}>
            {[A, B].map(d => <button key={d} className="pill" style={{ flex: 1, justifyContent: "center", padding: 14 }}
              onClick={() => { set("tiebreaker", { choice: d, pair: conflict }); setTimeout(finish, 0); }}>{RANK_LABELS[d]}</button>)}
          </div>
          <p className="hint" style={{ marginTop: 14 }}>This helps us rank cities that balance both — and flag the ones that can't.</p>
        </div>
        <div className="foot"><button className="ghost" onClick={back}>← Back</button><span className="grow" />
          <button className="ghost" style={{ textDecoration: "underline" }} onClick={() => { set("tiebreaker", null); setTimeout(finish, 0); }}>Skip — I'm equally pulled both ways</button></div>
      </div>
    );
  } else if (view === "done") {
    const p = buildProfile(); const hh = p.income + (p.hasPartner ? p.partnerIncome : 0);
    const Row = ({ k, v, mono }) => <div className="srow"><div className="k">{k}</div><div className={`v ${mono ? "mono" : ""}`}>{v}</div></div>;
    pane = (
      <div className="pane" key="done">
        <div className="count">Profile captured</div>
        <h2 className="q step">We've got your <em style={{ fontStyle: "italic", color: "var(--accent)" }}>shape</em>.</h2>
        <p className="qsub">Everything below feeds the matching engine — your cities, your real numbers, your roadmap.</p>
        <div className="summary">
          <Row k="Work" v={(p.customProfession || p.profession || "—") + (p.hasRemote ? " · remote" : "")} />
          <Row k="Household income" v={money(hh)} mono />
          <Row k="Home" v={p.housing === "buy" ? "Buying" : "Renting"} />
          <Row k="Openness to abroad" v={opennessLabel(p.opennessToAbroad)} />
          <Row k="Citizenship · status" v={p.citizenship + (p.immigrationStatus && p.immigrationStatus !== "citizen" ? " · " + p.immigrationStatus : "")} />
          <Row k="Top priority" v={RANK_LABELS[p.importanceRank[0]]} />
          <Row k="Move timeline" v={p.moveTimeline || "—"} />
          <Row k="Hard dealbreakers" v={p.dealBreakers.length || "none"} />
          <Row k="Tiebreaker" v={p.tiebreaker ? RANK_LABELS[p.tiebreaker.choice] : "none needed"} />
          <Row k="Lifestyle picks" v={`${p.lifestyleTags.length} selected`} />
        </div>
        <div className="foot"><button className="ghost" onClick={() => { setView("quiz"); setIdx(0); }}>↺ Start over</button><span className="grow" />
          <button className="cta" onClick={() => onComplete(p)}>Show Me My Potential →</button></div>
      </div>
    );
  } else {
    const st = STEPS[idx]; const ok = valid(); const rm = reqMsg();
    pane = (
      <div className="pane" key={st.id}>
        <div className="count">Step {idx + 1} of {STEPS.length}</div>
        <h2 className="q step">{st.h}</h2>{st.sub && <p className="qsub">{st.sub}</p>}
        <div className="fields">{stepBody()}</div>
        {!ok && rm && <p className="hint">{rm}</p>}
        <div className="foot">
          <button className="ghost" onClick={back}>← Back</button>
          <span className="grow" />
          <button className="cta" onClick={next} disabled={!ok}>{isLast ? "Show Me My Potential →" : "Continue →"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="qz">
      <style>{CSS}</style>
      <div className="split">{rail}<div className="pane-wrap">{pane}</div></div>
    </div>
  );
}
