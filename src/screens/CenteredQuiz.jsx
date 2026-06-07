import { useState, useMemo, useRef, useEffect } from "react";
import { ALL_QUESTIONS } from "../../shared/quiz-engine/questions.js";
import { getVisibleQuestions, clearHiddenAnswers } from "../../shared/quiz-engine/resolver.js";
import { synthesizeProfile } from "../../shared/quiz-engine/synthesizer.js";
import {
  buildSteps,
  pointToValue,
  valueToPoint,
  SCALE_LABELS,
  finalizeAnswers,
  isAnswered,
} from "./quiz/quizSteps.js";
// ── Auth + tier: the REAL package-00 hooks (merged on main). The quiz consumes
// only user/profile from useAuth and { isGlobal } from useTier, so the account
// check and Going-Global gate reflect the actual logged-in user. <AuthProvider>
// is mounted in main.jsx (package 00).
import { useAuth } from "../lib/auth.jsx";
import { useTier } from "../lib/tier.js";
// ── Still stubbed (dependency not merged): useA11y (package 03 a11y not landed)
// and quiz_sessions save/resume (package-00 db.js exposes the supabase client
// but no quiz_sessions helper yet). _contracts-stub.js is the single swap-point;
// see its header for the one-line swap when those land.
import {
  useA11y,
  saveQuizSession,
  loadQuizSession,
  clearQuizSession,
} from "./quiz/_contracts-stub.js";

// ═══════════════════════════════════════════════════════════════
// CenteredQuiz — data-driven, centered. Package 04 overhaul:
//  • bugs: dropdown close, 1–5 scale bijection, stable step count
//  • UX: money inputs, finances grouped, rankings, birthday, wide
//    prompts, auto-continue toggle, back-edit, "Other" + explain
//  • gating: pre-quiz account + disclaimer popups, save/resume,
//    Going-Global tier gate
// Brand (README §6): no general/Unicode emoji — inline-SVG line icons.
// ═══════════════════════════════════════════════════════════════

// ── inline-SVG line icons (no emoji glyphs, per README §6) ──
const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
);
const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
);
const ArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8, verticalAlign: "-2px" }}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
);
const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
const MuteIcon = ({ muted }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H2v6h4l5 4z" />
    {muted
      ? <path d="m22 9-6 6M16 9l6 6" />
      : <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />}
  </svg>
);

const CSS = `
.cq{ --bg:#0a0b0f; --bg2:#10121a; --card:rgba(255,255,255,.04); --card2:rgba(255,255,255,.07);
  --border:rgba(255,255,255,.10); --border2:rgba(255,255,255,.22);
  --accent:#e5b567; --accent-ink:#13100a; --accent-dim:rgba(229,181,103,.12);
  --glow:rgba(229,181,103,.45); --go:#3fb37f; --go-ink:#06241a;
  --ink:#f4f1ea; --dim:rgba(244,241,234,.60); --faint:rgba(244,241,234,.34);
  --neg:#e0816a;
  --serif:'Instrument Serif',Georgia,serif; --mono:'JetBrains Mono',monospace;
  --ease:cubic-bezier(.22,.61,.36,1);
  font-family:'Manrope',system-ui,sans-serif; color:var(--ink);
  min-height:100vh; background:var(--bg);
  background-image:radial-gradient(130% 90% at 50% -20%, var(--bg2), var(--bg) 62%);
  -webkit-font-smoothing:antialiased; display:flex; flex-direction:column; }

.cq .topbar{ position:sticky; top:0; z-index:5; display:flex; align-items:center; gap:14px;
  padding:18px clamp(18px,5vw,48px); background:linear-gradient(var(--bg),rgba(10,11,15,.0)); flex-wrap:wrap; }
.cq .backbtn{ background:none; border:1px solid var(--border); color:var(--dim); border-radius:10px;
  width:38px; height:38px; cursor:pointer; transition:.2s var(--ease); flex:none; display:grid; place-items:center; }
.cq .backbtn:hover{ color:var(--accent); border-color:var(--border2); }
.cq .backbtn:disabled{ opacity:.25; cursor:default; }
.cq .track{ flex:1; min-width:120px; height:4px; border-radius:4px; background:var(--card2); overflow:hidden; }
.cq .track > div{ height:100%; background:var(--accent); box-shadow:0 0 10px -1px var(--glow);
  border-radius:4px; transition:width .5s var(--ease); }
.cq .counter{ font-family:var(--mono); font-size:12.5px; color:var(--faint); white-space:nowrap; flex:none; }
.cq .tools{ display:flex; align-items:center; gap:8px; flex:none; }
.cq .tbtn{ background:none; border:1px solid var(--border); color:var(--dim); border-radius:9px;
  height:32px; padding:0 11px; cursor:pointer; transition:.18s var(--ease); display:inline-flex; align-items:center;
  gap:6px; font-family:var(--mono); font-size:11px; letter-spacing:.04em; }
.cq .tbtn:hover{ color:var(--accent); border-color:var(--border2); }
.cq .tbtn.icon{ width:32px; padding:0; justify-content:center; }
.cq .tbtn.on{ color:var(--accent); border-color:var(--accent); background:var(--accent-dim); }
.cq .savemsg{ font-family:var(--mono); font-size:11px; color:var(--go); }

.cq .stage{ flex:1; display:flex; align-items:flex-start; justify-content:center;
  padding:clamp(24px,6vh,70px) clamp(18px,5vw,48px) 130px; }
.cq .card{ width:100%; max-width:640px; text-align:center; }
.cq .card.in{ animation:rise .5s var(--ease); }
@keyframes rise{ from{opacity:0; transform:translateY(18px)} to{opacity:1; transform:none} }

.cq .kicker{ font-family:var(--mono); font-size:12px; letter-spacing:.22em; text-transform:uppercase;
  color:var(--accent); margin-bottom:18px; }
.cq .prompt{ font-family:var(--serif); font-weight:400; font-size:clamp(28px,4.6vw,40px); line-height:1.14;
  letter-spacing:-.01em; margin:0 auto; max-width:22ch; }
.cq .prompt.wide{ max-width:34ch; }
.cq .prompt.statement{ font-style:italic; max-width:26ch; }
.cq .sub{ color:var(--dim); font-size:15px; line-height:1.6; margin:14px auto 0; max-width:46ch; font-weight:300; }

.cq .body{ margin-top:34px; display:flex; flex-direction:column; gap:11px; text-align:left; }

/* grouped questions on one card */
.cq .grp{ display:flex; flex-direction:column; gap:26px; margin-top:32px; text-align:left; }
.cq .grp .field > .qlabel{ font-family:var(--serif); font-size:21px; line-height:1.2; margin-bottom:12px; }

/* stacked option buttons */
.cq .opt{ font-family:inherit; font-size:16px; color:var(--ink); background:var(--card);
  border:1px solid var(--border); border-radius:14px; padding:18px 22px; cursor:pointer;
  transition:.18s var(--ease); display:flex; align-items:center; gap:14px; text-align:left; width:100%; }
.cq .opt:hover{ border-color:var(--border2); background:var(--card2); transform:translateY(-1px); }
.cq .opt.on{ border:1.5px solid var(--accent); background:var(--accent-dim); color:var(--ink);
  box-shadow:0 0 26px -10px var(--glow); }
.cq .opt .lbl{ flex:1; }
.cq .opt .chk{ color:var(--accent); opacity:0; transition:.15s; display:inline-flex; }
.cq .opt.on .chk{ opacity:1; }
.cq .opt.dis{ opacity:.4; cursor:not-allowed; }

/* ranking rows */
.cq .rankrow{ font-family:inherit; font-size:16px; color:var(--ink); background:var(--card);
  border:1px solid var(--border); border-radius:14px; padding:14px 18px; cursor:pointer;
  transition:.16s var(--ease); display:flex; align-items:center; gap:14px; width:100%; text-align:left; }
.cq .rankrow:hover{ border-color:var(--border2); background:var(--card2); }
.cq .rankrow.on{ border:1.5px solid var(--accent); background:var(--accent-dim); box-shadow:0 0 24px -12px var(--glow); }
.cq .rankrow.dis{ opacity:.4; cursor:not-allowed; }
.cq .rankbadge{ width:30px; height:30px; flex:none; border-radius:9px; border:1px solid var(--border);
  display:grid; place-items:center; font-family:var(--mono); font-size:14px; color:var(--faint); }
.cq .rankrow.on .rankbadge{ border-color:var(--accent); color:var(--accent-ink); background:var(--accent); font-weight:700; }
.cq .rankrow .lbl{ flex:1; }

/* 1–5 agree scale */
.cq .scale{ display:flex; gap:10px; justify-content:center; margin-top:6px; }
.cq .dot{ flex:1; max-width:96px; aspect-ratio:1; border-radius:50%; border:1.5px solid var(--border);
  background:var(--card); color:var(--dim); font-family:var(--mono); font-size:17px; cursor:pointer;
  transition:.18s var(--ease); display:grid; place-items:center; }
.cq .dot:hover{ border-color:var(--border2); transform:scale(1.06); }
.cq .dot.on{ border-color:var(--accent); background:var(--accent-dim); color:var(--accent);
  box-shadow:0 0 24px -8px var(--glow); transform:scale(1.06); }
.cq .scalelabels{ display:flex; justify-content:space-between; margin-top:14px; font-size:13px; color:var(--faint); }

/* searchable select */
.cq .combo{ position:relative; text-align:left; }
.cq .combo input{ width:100%; box-sizing:border-box; font-family:inherit; font-size:16px; color:var(--ink);
  background:var(--card); border:1px solid var(--border); border-radius:14px; padding:18px 22px; transition:.18s var(--ease); }
.cq .combo input:focus{ outline:none; border-color:var(--accent); box-shadow:0 0 24px -10px var(--glow); }
.cq .combo input::placeholder{ color:var(--faint); }
.cq .menu{ margin-top:8px; max-height:320px; overflow:auto; border:1px solid var(--border); border-radius:14px; background:var(--bg2); }
.cq .menu .it{ padding:14px 20px; cursor:pointer; font-size:15px; color:var(--dim); border-bottom:1px solid var(--border); transition:.12s; }
.cq .menu .it:last-child{ border-bottom:none; }
.cq .menu .it:hover,.cq .menu .it.hi{ background:var(--card2); color:var(--ink); }
.cq .menu .it.on{ color:var(--accent); }

/* money input */
.cq .money{ }
.cq .moneyrow{ display:flex; align-items:stretch; gap:10px; }
.cq .stepbtn{ flex:none; width:52px; border:1px solid var(--border); background:var(--card); color:var(--accent);
  border-radius:12px; font-size:24px; cursor:pointer; transition:.16s var(--ease); }
.cq .stepbtn:hover{ border-color:var(--accent); background:var(--accent-dim); }
.cq .moneyfield{ flex:1; display:flex; align-items:center; background:var(--card); border:1px solid var(--border);
  border-radius:12px; padding:0 18px; transition:.18s var(--ease); }
.cq .moneyfield:focus-within{ border-color:var(--accent); box-shadow:0 0 24px -12px var(--glow); }
.cq .moneyfield .dollar{ font-family:var(--serif); font-size:30px; color:var(--accent); margin-right:6px; }
.cq .moneyfield input{ flex:1; min-width:0; background:none; border:none; outline:none; color:var(--ink);
  font-family:var(--serif); font-size:30px; padding:14px 0; }

/* slider */
.cq .sliderval{ font-family:var(--serif); font-size:38px; color:var(--accent); margin-bottom:8px; text-align:center; text-shadow:0 0 22px var(--glow); }
.cq input[type=range]{ -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:6px;
  cursor:pointer; background:linear-gradient(90deg,var(--accent) var(--p,50%),var(--card2) var(--p,50%)); }
.cq input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:24px; height:24px; border-radius:50%;
  background:var(--accent); box-shadow:0 0 0 5px var(--accent-dim),0 0 18px -2px var(--glow); cursor:pointer; }
.cq .ends{ display:flex; justify-content:space-between; font-size:13px; color:var(--faint); margin-top:10px; }
.cq .note{ font-size:13px; color:var(--neg); background:rgba(224,129,106,.09); border-radius:10px; padding:9px 14px; margin-top:16px; display:inline-block; }
.cq .warn{ margin-top:18px; background:rgba(229,181,103,.08); border:1px solid rgba(229,181,103,.28); border-radius:12px; padding:13px 16px; font-size:13.5px; color:var(--dim); line-height:1.5; }

/* date + text input */
.cq input[type=date],.cq input[type=text].ti{ width:100%; box-sizing:border-box; font-family:inherit; font-size:17px;
  color:var(--ink); background:var(--card); border:1px solid var(--border); border-radius:14px; padding:18px 22px;
  text-align:center; transition:.18s var(--ease); color-scheme:dark; }
.cq input[type=date]:focus,.cq input[type=text].ti:focus{ outline:none; border-color:var(--accent); box-shadow:0 0 24px -10px var(--glow); }

/* Going-Global gate */
.cq .gate{ margin-top:30px; display:flex; flex-direction:column; align-items:center; gap:18px; }
.cq .gate .lockicon{ width:64px; height:64px; border-radius:50%; display:grid; place-items:center; color:var(--accent);
  border:1px solid var(--border2); background:var(--accent-dim); }
.cq .gate .gatetext{ color:var(--dim); font-size:15px; line-height:1.6; max-width:42ch; }
.cq .gateskip{ background:none; border:1px solid var(--border); color:var(--faint); font-family:inherit; font-size:14px;
  border-radius:12px; padding:13px 22px; cursor:pointer; transition:.18s var(--ease); }
.cq .gateskip:hover{ color:var(--dim); border-color:var(--border2); }

/* footer CTA */
.cq .footer{ position:fixed; bottom:0; left:0; right:0; display:flex; justify-content:center; align-items:center;
  padding:18px; background:linear-gradient(rgba(10,11,15,0),var(--bg) 40%); }
.cq .cta{ font-family:inherit; font-size:16px; font-weight:700; letter-spacing:.02em; color:var(--accent-ink);
  background:var(--accent); border:none; border-radius:14px; padding:16px 40px; cursor:pointer;
  transition:.2s var(--ease); box-shadow:0 8px 30px -8px var(--glow); display:inline-flex; align-items:center; }
.cq .cta:hover{ transform:translateY(-2px); filter:brightness(1.05); }
.cq .cta:disabled{ background:var(--card2); color:var(--faint); box-shadow:none; cursor:not-allowed; transform:none; }
.cq .cta.green{ background:var(--go); color:var(--go-ink); box-shadow:0 8px 30px -8px rgba(63,179,127,.5); }
.cq .skip{ background:none; border:none; color:var(--faint); font-family:inherit; font-size:14px; cursor:pointer; margin-left:14px; }
.cq .skip:hover{ color:var(--accent); }

/* modal */
.cq .scrim{ position:fixed; inset:0; z-index:30; background:rgba(6,7,10,.78); backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center; padding:24px; }
.cq .modal{ width:100%; max-width:440px; background:var(--bg2); border:1px solid var(--border2); border-radius:20px;
  padding:34px 30px; text-align:center; box-shadow:0 30px 80px -20px rgba(0,0,0,.7); }
.cq .modal .mkicker{ font-family:var(--mono); font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:var(--accent); margin-bottom:14px; }
.cq .modal h2{ font-family:var(--serif); font-weight:400; font-size:30px; margin:0 0 14px; line-height:1.15; }
.cq .modal p{ color:var(--dim); font-size:14.5px; line-height:1.65; margin:0 0 12px; }
.cq .modal .actions{ margin-top:24px; display:flex; flex-direction:column; gap:10px; }
.cq .modal .ghost{ background:none; border:1px solid var(--border); color:var(--dim); font-family:inherit; font-size:14px;
  border-radius:12px; padding:13px; cursor:pointer; transition:.18s var(--ease); }
.cq .modal .ghost:hover{ color:var(--ink); border-color:var(--border2); }
.cq .modal .cta{ width:100%; justify-content:center; }

/* done */
.cq .done .prompt{ max-width:22ch; }
.cq .summary{ margin:30px auto 0; max-width:520px; display:grid; grid-template-columns:1fr 1fr; gap:1px;
  background:var(--border); border:1px solid var(--border); border-radius:16px; overflow:hidden; }
.cq .srow{ background:var(--bg); padding:15px 18px; text-align:left; }
.cq .srow .k{ font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--faint); margin-bottom:5px; }
.cq .srow .v{ font-size:15px; color:var(--ink); }

@media(prefers-reduced-motion:reduce){ .cq *{ animation:none!important; transition:none!important } }
`;

const isStatement = (q) => q.id?.startsWith("trait_");
const isMoney = (id) => ["income", "savings", "debt", "partnerIncome"].includes(id);
const fmtMoney = (n) => "$" + Number(n || 0).toLocaleString();
const widePrompt = (q) => q.type === "ranking" || q.type === "global_gate" || (q.prompt || "").length > 38;

const go = (hash) => { window.location.hash = hash; };

// ── searchable select with outside-click close (task 1) ──
function Combo({ question, value, onAnswer }) {
  const opts = question.options ?? [];
  const selected = opts.find((o) => o.value === value);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDocDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return opts;
    return opts.filter((o) => o.label.toLowerCase().includes(q));
  }, [query, opts]);

  return (
    <div className="combo" ref={ref}>
      <input
        type="text"
        placeholder={selected ? selected.label : "Type to search…"}
        value={open ? query : selected ? selected.label : query}
        onFocus={() => { setOpen(true); setQuery(""); }}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
      />
      {open && (
        <div className="menu">
          {filtered.length === 0 && <div className="it">No match, keep typing</div>}
          {filtered.map((o) => (
            <div
              key={o.value}
              className={`it ${o.value === value ? "on" : ""}`}
              onMouseDown={(e) => { e.preventDefault(); onAnswer(question.id, o.value); setOpen(false); }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── money input (task 7) ──
function MoneyInput({ question, value, onAnswer }) {
  const min = question.min ?? 0, max = question.max ?? 1000000, step = question.step ?? 1000;
  const v = value != null && value !== "" ? Number(value) : min;
  const commit = (n) => {
    let x = Number.isFinite(n) ? n : min;
    x = Math.max(0, Math.min(max, x));
    onAnswer(question.id, x);
  };
  return (
    <div className="money">
      <div className="moneyrow">
        <button type="button" className="stepbtn" onClick={() => commit(v - step)} aria-label="Decrease">−</button>
        <div className="moneyfield">
          <span className="dollar">$</span>
          <input
            type="text" inputMode="numeric" aria-label={question.prompt}
            value={Number(v).toLocaleString()}
            onChange={(e) => { const d = e.target.value.replace(/[^0-9]/g, ""); commit(d ? Number(d) : 0); }}
            onBlur={() => { if (v < min) commit(min); }}
          />
        </div>
        <button type="button" className="stepbtn" onClick={() => commit(v + step)} aria-label="Increase">+</button>
      </div>
      <div className="ends">
        <span>{question.minLabel ?? fmtMoney(min)}</span>
        <span>{question.maxLabel ?? fmtMoney(max)}</span>
      </div>
    </div>
  );
}

// ── ranking (tasks 11/12) ──
function Ranking({ question, value, onAnswer }) {
  const ranked = Array.isArray(value) ? value : [];
  const max = question.maxSelect ?? 5;
  const toggle = (val) => {
    if (ranked.includes(val)) onAnswer(question.id, ranked.filter((x) => x !== val));
    else if (ranked.length < max) onAnswer(question.id, [...ranked, val]);
  };
  return (
    <div className="body" style={{ marginTop: 0 }}>
      <p className="sub" style={{ marginTop: 0, textAlign: "center" }}>
        {ranked.length}/{max} ranked{ranked.length >= max ? ", tap a number to re-pick" : ""}
      </p>
      {(question.options ?? []).map((o) => {
        const r = ranked.indexOf(o.value);
        const on = r >= 0;
        const dis = !on && ranked.length >= max;
        return (
          <button key={o.value} type="button" className={`rankrow ${on ? "on" : ""} ${dis ? "dis" : ""}`}
            onClick={() => !dis && toggle(o.value)}>
            <span className="rankbadge">{on ? r + 1 : ""}</span>
            <span className="lbl">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Going-Global gate (task 18) ──
function GlobalGate({ question, value, isGlobal, onChoose }) {
  if (isGlobal) {
    return (
      <div className="body" style={{ marginTop: 0 }}>
        <button type="button" className={`opt ${value === "include" ? "on" : ""}`} onClick={() => onChoose("include")}>
          <span className="lbl">Yes, include international matches</span><span className="chk"><Check /></span>
        </button>
        <button type="button" className={`opt ${value === "skip" ? "on" : ""}`} onClick={() => onChoose("skip")}>
          <span className="lbl">No, show me US cities only</span><span className="chk"><Check /></span>
        </button>
      </div>
    );
  }
  return (
    <div className="gate">
      <div className="lockicon"><LockIcon /></div>
      <p className="gatetext">
        Going Global unlocks international cities, visa pathways, and relocation roadmaps.
        It's part of the <strong>Global</strong> plan.
      </p>
      <button type="button" className="cta" onClick={() => go("#/pricing/global")}>Unlock Going Global<ArrowRight /></button>
      <button type="button" className="gateskip" onClick={() => onChoose("skip")}>I don't want to go global, US cities only</button>
    </div>
  );
}

// ── pre-quiz / resume modals (tasks 16, 17, 6) ──
function Modal({ children }) {
  return <div className="scrim"><div className="modal">{children}</div></div>;
}

const seedAnswers = (profile, isGlobal) => {
  const a = { __isGlobal: isGlobal };
  if (profile?.birthday) { a.birthday = profile.birthday; a.__birthdayKnown = true; }
  return a;
};

export default function CenteredQuiz({ onComplete, onExit }) {
  const { user, profile } = useAuth();
  const { isGlobal } = useTier();
  const { muted, setMuted } = useA11y();

  const savedSession = useRef(loadQuizSession());
  const [answers, setAnswers] = useState(() => seedAnswers(profile, isGlobal));
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [autoContinue, setAutoContinue] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");
  const stageKey = useRef(0);

  // Gate flow: resume? → account (if guest) → disclaimer → quiz
  const [gate, setGate] = useState(() => {
    const s = savedSession.current;
    if (s && !s.completed && s.answers) return "resume";
    return user ? "disclaimer" : "account";
  });

  // Keep the resolver's tier flag in sync if tier flips mid-session (demo switcher).
  useEffect(() => {
    setAnswers((prev) =>
      prev.__isGlobal === isGlobal ? prev : clearHiddenAnswers({ ...prev, __isGlobal: isGlobal }, ALL_QUESTIONS),
    );
  }, [isGlobal]);

  const visible = useMemo(() => getVisibleQuestions(answers, ALL_QUESTIONS), [answers]);
  const steps = useMemo(() => buildSteps(visible), [visible]);
  const total = steps.length;
  const step = steps[Math.min(idx, Math.max(0, total - 1))];

  const setAnswer = (id, val) => {
    setAnswers((prev) => clearHiddenAnswers({ ...prev, [id]: val }, ALL_QUESTIONS));
  };

  const stepAnswered = step ? step.questions.every((q) => !q.required || isAnswered(answers[q.id])) : false;
  const canProceed = stepAnswered;
  const isLast = idx >= total - 1;

  const finish = () => {
    const finalA = finalizeAnswers(answers);
    const p = synthesizeProfile(finalA);
    if (Array.isArray(finalA.importanceRank)) p.importanceRank = finalA.importanceRank;
    clearQuizSession();
    setDone(true);
    onComplete(p);
  };

  const goNext = () => { stageKey.current += 1; setIdx((i) => i + 1); };
  const next = () => {
    if (!canProceed) return;
    if (isLast) { finish(); return; }
    goNext();
  };
  const back = () => {
    if (idx === 0) { onExit?.(); return; }
    stageKey.current += 1;
    setIdx((i) => i - 1);
  };

  // auto-advance only when the user has left Auto-continue on AND the question opts in
  const autoNext = (id, val) => {
    setAnswer(id, val);
    if (autoContinue && step?.type === "single" && step.question.autoAdvance && !isLast) {
      setTimeout(goNext, 180);
    }
  };

  const chooseGlobal = (val) => {
    setAnswer("goingGlobalIntro", val);
    if (!isLast) setTimeout(goNext, 180);
  };

  const handleSave = () => {
    if (!user) { setSaveMsg(""); go("#/login"); return; }
    saveQuizSession({ answers, step: idx });
    setSaveMsg("Saved. Come back anytime.");
    setTimeout(() => setSaveMsg(""), 4000);
  };

  // ── gate modals ──────────────────────────────────────────────────────────
  if (gate === "resume") {
    return (
      <div className="cq"><style>{CSS}</style>
        <Modal>
          <div className="mkicker">Welcome back</div>
          <h2>Pick up where you left off?</h2>
          <p>We saved your answers from last time. Resume, or start fresh.</p>
          <div className="actions">
            <button className="cta" onClick={() => {
              const s = savedSession.current;
              setAnswers({ ...(s.answers || {}), __isGlobal: isGlobal });
              setIdx(s.step || 0);
              setGate("quiz");
            }}>Resume<ArrowRight /></button>
            <button className="ghost" onClick={() => { clearQuizSession(); setGate(user ? "disclaimer" : "account"); }}>
              Start over
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  if (gate === "account") {
    return (
      <div className="cq"><style>{CSS}</style>
        <Modal>
          <div className="mkicker">Before we start</div>
          <h2>Save your results: make an account</h2>
          <p>Logging in lets you save your progress, come back later, and keep your matches. You can also continue as a guest.</p>
          <div className="actions">
            <button className="cta" onClick={() => go("#/login")}>Log in or sign up<ArrowRight /></button>
            <button className="ghost" onClick={() => setGate("disclaimer")}>Continue as guest</button>
          </div>
        </Modal>
      </div>
    );
  }

  if (gate === "disclaimer") {
    return (
      <div className="cq"><style>{CSS}</style>
        <Modal>
          <div className="mkicker">A quick honest note</div>
          <h2>Answer honestly. It's how the matches get good.</h2>
          <p>The more truthful and complete your answers, the more accurate your city matches and money estimates. Take your time.</p>
          <p style={{ color: "var(--faint)", fontSize: 13 }}>
            Potential is a moving-assistance and exploration tool, <strong>not financial, legal, or immigration advice.</strong> Verify big decisions with a professional.
          </p>
          <div className="actions">
            <button className="cta green" onClick={() => setGate("quiz")}>I understand</button>
          </div>
        </Modal>
      </div>
    );
  }

  // ── done summary ──
  if (done) {
    const finalA = finalizeAnswers(answers);
    const p = synthesizeProfile(finalA);
    const hh = (Number(finalA.income) || 0) + (finalA.hasPartner === "true" || finalA.hasPartner === true ? Number(finalA.partnerIncome) || 0 : 0);
    return (
      <div className="cq"><style>{CSS}</style>
        <div className="stage">
          <div className="card done in">
            <div className="kicker">Profile captured</div>
            <h1 className="prompt">We've got your <em>shape</em>.</h1>
            <p className="sub">Everything below feeds the matching engine: your cities, your real numbers.</p>
            <div className="summary">
              <div className="srow"><div className="k">Work</div><div className="v">{p.profession || "-"}{p.hasRemote ? " · remote" : ""}</div></div>
              <div className="srow"><div className="k">Household income</div><div className="v">{fmtMoney(hh)}</div></div>
              <div className="srow"><div className="k">Openness to abroad</div><div className="v">{p.opennessToAbroad ?? "-"}</div></div>
              <div className="srow"><div className="k">Lifestyle picks</div><div className="v">{(p.lifestyleTags || []).length} ranked</div></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!step) return null;

  // ── input renderer (per question) ──
  const renderInput = (q) => {
    if (isStatement(q)) {
      const point = valueToPoint(answers[q.id]);
      return (
        <div>
          <div className="scale">
            {[0, 1, 2, 3, 4].map((i) => (
              <button key={i} type="button" className={`dot ${point === i ? "on" : ""}`} onClick={() => autoNext(q.id, pointToValue(i))}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="scalelabels"><span>{SCALE_LABELS[0]}</span><span>{SCALE_LABELS[4]}</span></div>
        </div>
      );
    }

    const raw = answers[q.id];

    if (q.type === "global_gate") {
      return <GlobalGate question={q} value={raw} isGlobal={isGlobal} onChoose={chooseGlobal} />;
    }
    if (q.type === "ranking") {
      return <Ranking question={q} value={raw} onAnswer={setAnswer} />;
    }
    if (q.type === "date") {
      return (
        <input type="date" value={typeof raw === "string" ? raw : ""} max="2010-12-31" min="1930-01-01"
          onChange={(e) => setAnswer(q.id, e.target.value)} />
      );
    }
    if (q.type === "slider" && isMoney(q.id)) {
      return <MoneyInput question={q} value={raw} onAnswer={setAnswer} />;
    }

    switch (q.type) {
      case "slider": {
        const min = q.min ?? 0, max = q.max ?? 100, stepN = q.step ?? 1;
        const v = raw != null ? Number(raw) : Math.round((min + max) / 2);
        const pct = ((v - min) / (max - min)) * 100;
        return (
          <div>
            <div className="sliderval">{String(v)}</div>
            <input type="range" min={min} max={max} step={stepN} value={v} style={{ "--p": pct + "%" }}
              onChange={(e) => setAnswer(q.id, Number(e.target.value))} />
            <div className="ends">
              <span>{q.minLabel ?? min}</span><span>{q.maxLabel ?? max}</span>
            </div>
          </div>
        );
      }
      case "free_text":
        return (
          <input type="text" className="ti" value={typeof raw === "string" ? raw : ""}
            placeholder={q.subtext ?? "Type your answer…"} maxLength={200}
            onChange={(e) => setAnswer(q.id, e.target.value.slice(0, 200))} />
        );
      case "multi_select": {
        const sel = Array.isArray(raw) ? raw : [];
        const max = q.maxSelect ?? 99;
        const atMax = sel.length >= max;
        const toggle = (val) => {
          if (sel.includes(val)) setAnswer(q.id, sel.filter((x) => x !== val));
          else if (!atMax) setAnswer(q.id, [...sel, val]);
        };
        return (
          <div className="body" style={{ marginTop: 0 }}>
            {max < 99 && <p className="sub" style={{ marginTop: 0, textAlign: "center" }}>Pick up to {max}{sel.length > 0 ? `, ${sel.length} selected` : ""}</p>}
            {(q.options ?? []).map((o) => {
              const on = sel.includes(o.value);
              const dis = atMax && !on;
              return (
                <button key={o.value} type="button" className={`opt ${on ? "on" : ""} ${dis ? "dis" : ""}`} onClick={() => !dis && toggle(o.value)}>
                  <span className="lbl">{o.label}</span><span className="chk"><Check /></span>
                </button>
              );
            })}
            {q.id === "dealBreakers" && sel.length >= 3 && (
              <div className="warn">Dealbreakers are hard filters that remove cities entirely. {sel.length} is a lot.</div>
            )}
          </div>
        );
      }
      case "single_select":
      case "boolean":
      default: {
        const opts = q.options ?? [];
        if (opts.length > 8) return <Combo question={q} value={raw} onAnswer={setAnswer} />;
        return (
          <div className="body" style={{ marginTop: 0 }}>
            {opts.map((o) => (
              <button key={o.value} type="button" className={`opt ${raw === o.value ? "on" : ""}`} onClick={() => autoNext(q.id, o.value)}>
                <span className="lbl">{o.label}</span><span className="chk"><Check /></span>
              </button>
            ))}
          </div>
        );
      }
    }
  };

  // ── card body: single question or grouped finances ──
  const renderCard = () => {
    if (step.type === "group") {
      return (
        <>
          <div className="kicker">{step.questions[0].kicker}</div>
          <h1 className="prompt wide">{step.header.label}</h1>
          {step.header.subtext && <p className="sub">{step.header.subtext}</p>}
          <div className="grp">
            {step.questions.map((q) => (
              <div className="field" key={q.id}>
                <div className="qlabel">{q.prompt}</div>
                {renderInput(q)}
              </div>
            ))}
          </div>
        </>
      );
    }
    const q = step.question;
    return (
      <>
        <div className="kicker">{q.kicker}</div>
        <h1 className={`prompt ${isStatement(q) ? "statement" : ""} ${widePrompt(q) ? "wide" : ""}`}>{q.prompt}</h1>
        {q.subtext && !isStatement(q) && q.type !== "global_gate" && <p className="sub">{q.subtext}</p>}
        <div className="body">{renderInput(q)}</div>
      </>
    );
  };

  const allRequiredAnswered = canProceed;
  const showSkip = step.type === "single" && !step.question.required && !isAnswered(answers[step.question.id]) && !isLast;

  return (
    <div className="cq">
      <style>{CSS}</style>

      <div className="topbar">
        <button className="backbtn" onClick={back} disabled={idx === 0 && !onExit} aria-label="Back"><ArrowLeft /></button>
        <div className="track"><div style={{ width: `${total ? ((idx + 1) / total) * 100 : 0}%` }} /></div>
        <div className="counter">{String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
        <div className="tools">
          {saveMsg && <span className="savemsg">{saveMsg}</span>}
          <button className="tbtn icon" onClick={() => setMuted(!muted)} aria-label={muted ? "Unmute" : "Mute"} title={muted ? "Unmute" : "Mute"}>
            <MuteIcon muted={muted} />
          </button>
          <button className={`tbtn ${autoContinue ? "on" : ""}`} onClick={() => setAutoContinue((v) => !v)} title="Auto-advance after each pick">
            Auto-continue {autoContinue ? "on" : "off"}
          </button>
          <button className="tbtn" onClick={handleSave} title="Save and finish later">Save</button>
        </div>
      </div>

      <div className="stage">
        <div className="card in" key={stageKey.current}>{renderCard()}</div>
      </div>

      <div className="footer">
        <button className="cta" onClick={next} disabled={!allRequiredAnswered}>
          {isLast ? "Show me my matches" : "Continue"}<ArrowRight />
        </button>
        {showSkip && <button className="skip" onClick={next}>Skip</button>}
      </div>
    </div>
  );
}
