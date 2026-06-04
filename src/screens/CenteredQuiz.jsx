import { useState, useMemo, useRef, useEffect } from "react";
import { ALL_QUESTIONS } from "../../shared/quiz-engine/questions.js";
import { getVisibleQuestions, clearHiddenAnswers } from "../../shared/quiz-engine/resolver.js";
import { synthesizeProfile } from "../../shared/quiz-engine/synthesizer.js";

// ═══════════════════════════════════════════════════════════════
// CenteredQuiz — data-driven, single-question-at-a-time, centered.
// Reads the full engine question set (ALL_QUESTIONS) through the
// resolver, so every Phase-11 question (personality, traits, deep
// category modules) shows up automatically — no hardcoded list.
//
// Design goals (per Gabriel): no sidebar, everything centered, big
// easy-to-tap options, profession as a searchable select, agree-style
// statements on a 1–5 scale. onComplete(profile) hands the engine
// Profile to the parent for scoring (synthesizeProfile → rankCities).
// ═══════════════════════════════════════════════════════════════

const CSS = `
.cq{ --bg:#0a0b0f; --bg2:#10121a; --card:rgba(255,255,255,.04); --card2:rgba(255,255,255,.07);
  --border:rgba(255,255,255,.10); --border2:rgba(255,255,255,.22);
  --accent:#e5b567; --accent-ink:#13100a; --accent-dim:rgba(229,181,103,.12);
  --glow:rgba(229,181,103,.45);
  --ink:#f4f1ea; --dim:rgba(244,241,234,.60); --faint:rgba(244,241,234,.34);
  --neg:#e0816a;
  --serif:'Instrument Serif',Georgia,serif; --mono:'JetBrains Mono',monospace;
  --ease:cubic-bezier(.22,.61,.36,1);
  font-family:'Manrope',system-ui,sans-serif; color:var(--ink);
  min-height:100vh; background:var(--bg);
  background-image:radial-gradient(130% 90% at 50% -20%, var(--bg2), var(--bg) 62%);
  -webkit-font-smoothing:antialiased; display:flex; flex-direction:column; }

.cq .topbar{ position:sticky; top:0; z-index:5; display:flex; align-items:center; gap:16px;
  padding:20px clamp(18px,5vw,48px); background:linear-gradient(var(--bg),rgba(10,11,15,.0)); }
.cq .backbtn{ background:none; border:1px solid var(--border); color:var(--dim); border-radius:10px;
  width:38px; height:38px; cursor:pointer; font-size:16px; transition:.2s var(--ease); flex:none; }
.cq .backbtn:hover{ color:var(--accent); border-color:var(--border2); }
.cq .backbtn:disabled{ opacity:.25; cursor:default; }
.cq .track{ flex:1; height:4px; border-radius:4px; background:var(--card2); overflow:hidden; }
.cq .track > div{ height:100%; background:var(--accent); box-shadow:0 0 10px -1px var(--glow);
  border-radius:4px; transition:width .5s var(--ease); }
.cq .counter{ font-family:var(--mono); font-size:12.5px; color:var(--faint); white-space:nowrap; flex:none; }

.cq .stage{ flex:1; display:flex; align-items:flex-start; justify-content:center;
  padding:clamp(24px,6vh,70px) clamp(18px,5vw,48px) 120px; }
.cq .card{ width:100%; max-width:600px; text-align:center; }
.cq .card.in{ animation:rise .5s var(--ease); }
@keyframes rise{ from{opacity:0; transform:translateY(18px)} to{opacity:1; transform:none} }

.cq .kicker{ font-family:var(--mono); font-size:12px; letter-spacing:.22em; text-transform:uppercase;
  color:var(--accent); margin-bottom:18px; }
.cq .prompt{ font-family:var(--serif); font-weight:400; font-size:clamp(28px,4.6vw,40px); line-height:1.12;
  letter-spacing:-.01em; margin:0 auto; max-width:18ch; }
.cq .prompt.statement{ font-style:italic; max-width:24ch; }
.cq .sub{ color:var(--dim); font-size:15px; line-height:1.6; margin:14px auto 0; max-width:42ch; font-weight:300; }

.cq .body{ margin-top:38px; display:flex; flex-direction:column; gap:11px; }

/* stacked option buttons */
.cq .opt{ font-family:inherit; font-size:16px; color:var(--ink); background:var(--card);
  border:1px solid var(--border); border-radius:14px; padding:18px 22px; cursor:pointer;
  transition:.18s var(--ease); display:flex; align-items:center; gap:14px; text-align:left; }
.cq .opt:hover{ border-color:var(--border2); background:var(--card2); transform:translateY(-1px); }
.cq .opt.on{ border:1.5px solid var(--accent); background:var(--accent-dim); color:var(--ink);
  box-shadow:0 0 26px -10px var(--glow); }
.cq .opt .ic{ width:30px; height:30px; border-radius:9px; background:var(--bg2); border:1px solid var(--border);
  display:grid; place-items:center; font-size:16px; flex:none; }
.cq .opt.on .ic{ border-color:var(--accent); color:var(--accent); background:var(--accent-dim); }
.cq .opt .lbl{ flex:1; }
.cq .opt .chk{ color:var(--accent); font-family:var(--mono); opacity:0; transition:.15s; }
.cq .opt.on .chk{ opacity:1; }
.cq .opt.dis{ opacity:.4; cursor:not-allowed; }

/* 1–5 agree scale */
.cq .scale{ display:flex; gap:10px; justify-content:center; margin-top:6px; }
.cq .dot{ flex:1; max-width:96px; aspect-ratio:1; border-radius:50%; border:1.5px solid var(--border);
  background:var(--card); color:var(--dim); font-family:var(--mono); font-size:17px; cursor:pointer;
  transition:.18s var(--ease); display:grid; place-items:center; }
.cq .dot:hover{ border-color:var(--border2); transform:scale(1.06); }
.cq .dot.on{ border-color:var(--accent); background:var(--accent-dim); color:var(--accent);
  box-shadow:0 0 24px -8px var(--glow); transform:scale(1.06); }
.cq .scalelabels{ display:flex; justify-content:space-between; margin-top:14px;
  font-size:13px; color:var(--faint); }

/* searchable select */
.cq .combo{ position:relative; text-align:left; }
.cq .combo input{ width:100%; box-sizing:border-box; font-family:inherit; font-size:16px; color:var(--ink);
  background:var(--card); border:1px solid var(--border); border-radius:14px; padding:18px 22px;
  transition:.18s var(--ease); }
.cq .combo input:focus{ outline:none; border-color:var(--accent); box-shadow:0 0 24px -10px var(--glow); }
.cq .combo input::placeholder{ color:var(--faint); }
.cq .menu{ margin-top:8px; max-height:320px; overflow:auto; border:1px solid var(--border);
  border-radius:14px; background:var(--bg2); }
.cq .menu .it{ padding:14px 20px; cursor:pointer; font-size:15px; color:var(--dim);
  border-bottom:1px solid var(--border); transition:.12s; }
.cq .menu .it:last-child{ border-bottom:none; }
.cq .menu .it:hover,.cq .menu .it.hi{ background:var(--card2); color:var(--ink); }
.cq .menu .it.on{ color:var(--accent); }
.cq .menu .grouphdr{ padding:10px 20px 6px; font-family:var(--mono); font-size:11px; letter-spacing:.14em;
  text-transform:uppercase; color:var(--faint); }

/* slider */
.cq .sliderval{ font-family:var(--serif); font-size:38px; color:var(--accent); margin-bottom:8px;
  text-shadow:0 0 22px var(--glow); }
.cq input[type=range]{ -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:6px;
  cursor:pointer; background:linear-gradient(90deg,var(--accent) var(--p,50%),var(--card2) var(--p,50%)); }
.cq input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:24px; height:24px; border-radius:50%;
  background:var(--accent); box-shadow:0 0 0 5px var(--accent-dim),0 0 18px -2px var(--glow); cursor:pointer; }
.cq .ends{ display:flex; justify-content:space-between; font-size:13px; color:var(--faint); margin-top:10px; }
.cq .note{ font-size:13px; color:var(--neg); background:rgba(224,129,106,.09); border-radius:10px;
  padding:9px 14px; margin-top:16px; display:inline-block; }
.cq .warn{ margin-top:18px; background:rgba(229,181,103,.08); border:1px solid rgba(229,181,103,.28);
  border-radius:12px; padding:13px 16px; font-size:13.5px; color:var(--dim); line-height:1.5; }

/* text input */
.cq input[type=text].ti{ width:100%; box-sizing:border-box; font-family:inherit; font-size:17px;
  color:var(--ink); background:var(--card); border:1px solid var(--border); border-radius:14px;
  padding:18px 22px; text-align:center; transition:.18s var(--ease); }
.cq input[type=text].ti:focus{ outline:none; border-color:var(--accent); box-shadow:0 0 24px -10px var(--glow); }

/* footer CTA */
.cq .footer{ position:fixed; bottom:0; left:0; right:0; display:flex; justify-content:center;
  padding:18px; background:linear-gradient(rgba(10,11,15,0),var(--bg) 40%); }
.cq .cta{ font-family:inherit; font-size:16px; font-weight:700; letter-spacing:.02em; color:var(--accent-ink);
  background:var(--accent); border:none; border-radius:14px; padding:16px 44px; cursor:pointer;
  transition:.2s var(--ease); box-shadow:0 8px 30px -8px var(--glow); }
.cq .cta:hover{ transform:translateY(-2px); filter:brightness(1.05); }
.cq .cta:disabled{ background:var(--card2); color:var(--faint); box-shadow:none; cursor:not-allowed; transform:none; }
.cq .skip{ background:none; border:none; color:var(--faint); font-family:inherit; font-size:14px;
  cursor:pointer; align-self:center; margin-left:14px; }
.cq .skip:hover{ color:var(--accent); }

/* done */
.cq .done .prompt{ max-width:22ch; }
.cq .summary{ margin:30px auto 0; max-width:520px; display:grid; grid-template-columns:1fr 1fr; gap:1px;
  background:var(--border); border:1px solid var(--border); border-radius:16px; overflow:hidden; }
.cq .srow{ background:var(--bg); padding:15px 18px; text-align:left; }
.cq .srow .k{ font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--faint); margin-bottom:5px; }
.cq .srow .v{ font-size:15px; color:var(--ink); }

@media(prefers-reduced-motion:reduce){ .cq *{ animation:none!important; transition:none!important } }
`;

// ── 1–5 agree scale: map UI point (0..4) ↔ engine value (3-option model) ──
const SCALE_LABELS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];
const pointToValue = (i) => (i <= 1 ? "disagree" : i === 2 ? "agree" : "strongly_agree");
const valueToPoint = (v) => (v === "disagree" ? 1 : v === "agree" ? 3 : v === "strongly_agree" ? 4 : null);

const isStatement = (q) => q.id?.startsWith("trait_");
const isMoney = (id) => ["income", "savings", "debt", "partnerIncome"].includes(id);
const fmtMoney = (n) => "$" + Number(n).toLocaleString();

function Combo({ question, value, onAnswer }) {
  const opts = question.options ?? [];
  const selected = opts.find((o) => o.value === value);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return opts;
    return opts.filter((o) => o.label.toLowerCase().includes(q));
  }, [query, opts]);

  return (
    <div className="combo">
      <input
        type="text"
        placeholder={selected ? selected.label : "Type to search…"}
        value={open ? query : selected ? selected.label : query}
        onFocus={() => { setOpen(true); setQuery(""); }}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
      />
      {open && (
        <div className="menu">
          {filtered.length === 0 && <div className="it">No match — keep typing</div>}
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

export default function CenteredQuiz({ onComplete, onExit }) {
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const stageKey = useRef(0);

  const visible = useMemo(() => getVisibleQuestions(answers, ALL_QUESTIONS), [answers]);
  const total = visible.length;
  const q = visible[Math.min(idx, total - 1)];

  const setAnswer = (id, val) => {
    setAnswers((prev) => clearHiddenAnswers({ ...prev, [id]: val }, ALL_QUESTIONS));
  };

  const raw = answers[q?.id];
  const answered =
    raw != null && raw !== "" && !(Array.isArray(raw) && raw.length === 0);
  const canProceed = !q?.required || answered;
  const isLast = idx >= total - 1;

  const finish = () => {
    const profile = synthesizeProfile(answers);
    // keep the raw importanceRank array for the results display (synthesizer emits weights)
    if (Array.isArray(answers.importanceRank)) profile.importanceRank = answers.importanceRank;
    setDone(true);
    onComplete(profile);
  };

  const next = () => {
    if (!canProceed) return;
    if (isLast) { finish(); return; }
    stageKey.current += 1;
    setIdx((i) => i + 1);
  };
  const back = () => {
    if (idx === 0) { onExit?.(); return; }
    stageKey.current += 1;
    setIdx((i) => i - 1);
  };

  // auto-advance for single-select questions flagged autoAdvance
  const autoNext = (id, val) => {
    setAnswer(id, val);
    if (q.autoAdvance && !isLast) {
      setTimeout(() => { stageKey.current += 1; setIdx((i) => i + 1); }, 180);
    }
  };

  if (!q) return null;

  const renderInput = () => {
    // 1–5 agree scale for trait statements
    if (isStatement(q)) {
      const point = valueToPoint(raw);
      return (
        <div>
          <div className="scale">
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                className={`dot ${point === i ? "on" : ""}`}
                onClick={() => autoNext(q.id, pointToValue(i))}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="scalelabels">
            <span>{SCALE_LABELS[0]}</span>
            <span>{SCALE_LABELS[4]}</span>
          </div>
        </div>
      );
    }

    switch (q.type) {
      case "slider": {
        const min = q.min ?? 0, max = q.max ?? 100, step = q.step ?? 1;
        const v = raw != null ? Number(raw) : Math.round((min + max) / 2);
        const pct = ((v - min) / (max - min)) * 100;
        const display = isMoney(q.id) ? fmtMoney(v) : String(v);
        return (
          <div>
            <div className="sliderval">{display}</div>
            <input
              type="range" min={min} max={max} step={step} value={v}
              style={{ "--p": pct + "%" }}
              onChange={(e) => setAnswer(q.id, Number(e.target.value))}
            />
            <div className="ends">
              <span>{q.minLabel ?? (isMoney(q.id) ? fmtMoney(min) : min)}</span>
              <span>{q.maxLabel ?? (isMoney(q.id) ? fmtMoney(max) : max)}</span>
            </div>
            {q.id === "opennessToAbroad" && v === 0 && (
              <div className="note">International cities won't appear in your results.</div>
            )}
          </div>
        );
      }
      case "free_text":
        return (
          <input
            type="text" className="ti" value={typeof raw === "string" ? raw : ""}
            placeholder={q.subtext ?? "Type your answer…"} maxLength={200}
            onChange={(e) => setAnswer(q.id, e.target.value.slice(0, 200))}
          />
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
            {max < 99 && (
              <p className="sub" style={{ marginTop: 0 }}>
                Pick up to {max}{sel.length > 0 ? ` — ${sel.length} selected` : ""}
              </p>
            )}
            {(q.options ?? []).map((o) => {
              const on = sel.includes(o.value);
              const dis = atMax && !on;
              return (
                <button key={o.value} className={`opt ${on ? "on" : ""} ${dis ? "dis" : ""}`}
                  onClick={() => !dis && toggle(o.value)}>
                  {o.icon && <span className="ic">{o.icon}</span>}
                  <span className="lbl">{o.label}</span>
                  <span className="chk">✓</span>
                </button>
              );
            })}
            {q.id === "dealBreakers" && sel.length >= 3 && (
              <div className="warn">Dealbreakers are hard filters — they remove cities entirely. {sel.length} is a lot.</div>
            )}
          </div>
        );
      }
      case "single_select":
      case "boolean":
      default: {
        const opts = q.options ?? [];
        // many options → searchable select
        if (opts.length > 8) return <Combo question={q} value={raw} onAnswer={setAnswer} />;
        return (
          <div className="body" style={{ marginTop: 0 }}>
            {opts.map((o) => (
              <button key={o.value} className={`opt ${raw === o.value ? "on" : ""}`}
                onClick={() => autoNext(q.id, o.value)}>
                {o.icon && <span className="ic">{o.icon}</span>}
                <span className="lbl">{o.label}</span>
                <span className="chk">✓</span>
              </button>
            ))}
          </div>
        );
      }
    }
  };

  // ── done summary ──
  if (done) {
    const p = synthesizeProfile(answers);
    const hh = (Number(answers.income) || 0) + (answers.hasPartner === "true" || answers.hasPartner === true ? Number(answers.partnerIncome) || 0 : 0);
    return (
      <div className="cq">
        <style>{CSS}</style>
        <div className="stage">
          <div className="card done in">
            <div className="kicker">Profile captured</div>
            <h1 className="prompt">We've got your <em>shape</em>.</h1>
            <p className="sub">Everything below feeds the matching engine — your cities, your real numbers.</p>
            <div className="summary">
              <div className="srow"><div className="k">Work</div><div className="v">{p.profession || "—"}{p.hasRemote ? " · remote" : ""}</div></div>
              <div className="srow"><div className="k">Household income</div><div className="v">{fmtMoney(hh)}</div></div>
              <div className="srow"><div className="k">Openness to abroad</div><div className="v">{p.opennessToAbroad ?? "—"}</div></div>
              <div className="srow"><div className="k">Lifestyle picks</div><div className="v">{(p.lifestyleTags || []).length} selected</div></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cq">
      <style>{CSS}</style>

      <div className="topbar">
        <button className="backbtn" onClick={back} disabled={idx === 0 && !onExit} aria-label="Back">←</button>
        <div className="track"><div style={{ width: `${((idx + 1) / total) * 100}%` }} /></div>
        <div className="counter">{String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
      </div>

      <div className="stage">
        <div className="card in" key={stageKey.current}>
          <div className="kicker">{q.kicker}</div>
          <h1 className={`prompt ${isStatement(q) ? "statement" : ""}`}>{q.prompt}</h1>
          {q.subtext && !isStatement(q) && <p className="sub">{q.subtext}</p>}
          <div className="body">{renderInput()}</div>
        </div>
      </div>

      <div className="footer">
        <button className="cta" onClick={next} disabled={!canProceed}>
          {isLast ? "Show me my matches →" : "Continue →"}
        </button>
        {!q.required && !answered && !isLast && (
          <button className="skip" onClick={next}>Skip</button>
        )}
      </div>
    </div>
  );
}
