// ─────────────────────────────────────────────────────────────────
// Potential — CityBreakdown ("Editorial Dossier" full breakdown)
// Ported from the Austin – Full Breakdown.html mockup (Direction A) into a
// data-driven React screen. Cinematic hero (score ring + compass rose),
// asymmetric money column, fit-dimension card, day-in-life + live teaser.
//
// Honest-data policy (judged-pitch integrity):
//   • salary / take-home / expenses / savings / vibe / pop / climate / rank
//     come straight from the engine row — never fabricated.
//   • the "fit" card renders the engine's REAL scoreFactors (Cost / Career /
//     Lifestyle / Safety …) normalized to bars — not invented 0–100 scores.
//   • tagline / tax note are DERIVED from real fields (stateTax, savings, eff rate).
//   • day-in-life prose + live chips are templated from real facts and are
//     placeholders for the Phase-5 live-AI layer (no fabricated counts).
//
// Fonts (Instrument Serif / Manrope / JetBrains Mono) load globally via
// index.html — no @import here (avoids a duplicate CDN call).
// Props: { result, results, profile, onBack, tier, onUnlock, onRoadmap, onVisa }
//   tier/onUnlock/onRoadmap/onVisa are the Phase 6/7/8 graft — the two "next
//   steps" CTAs (relocation roadmap, visa concierge) are tier-gated via LockGate.
//   They render only when their callbacks are provided, so the breakdown still
//   works standalone (e.g. the ?dev=breakdown shortcut without app state).
// ─────────────────────────────────────────────────────────────────

import LockGate from '../components/LockGate.jsx';

const money = (n) => "$" + Math.round(Math.abs(n)).toLocaleString("en-US");

// Engine factor name → display label for the fit card.
const FIT_LABELS = {
  Cost: "Cost of living",
  Career: "Career & jobs",
  Lifestyle: "Lifestyle",
  Safety: "Safety",
};

// Derived one-line tagline from real, defensible signals.
function deriveTagline(c) {
  if (c.stateTax === 0) return "No state income tax and a deep market, so your money goes furthest here.";
  if (c.monthlySavings >= 1500) return "Strong pay against a manageable cost of living, with real room to save every month.";
  if (c.monthlySavings < 0) return "A vibrant fit, though the monthly math runs tight against local costs.";
  return "A balanced fit for your profile: solid pay, livable costs, and a pace that suits you.";
}

// Compass-rose deco (matches ResultsMap aesthetic).
function Rose({ size = 118 }) {
  const cx = size / 2, R = size / 2 - 2;
  const spokes = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4, r1 = i % 2 ? R * 0.5 : R * 0.24;
    spokes.push(
      <line key={i} x1={cx + Math.sin(a) * r1} y1={cx - Math.cos(a) * r1}
        x2={cx + Math.sin(a) * R} y2={cx - Math.cos(a) * R} />
    );
  }
  return (
    <svg className="rose" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={cx} cy={cx} r={R} /><circle cx={cx} cy={cx} r={R * 0.5} />{spokes}
      <circle className="dot" cx={cx} cy={cx} r={2.5} />
    </svg>
  );
}

// Circular score ring.
function ScoreRing({ score, size = 92, sw = 8 }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  const nFont = Math.round(size * 0.3), uFont = Math.max(8, Math.round(size * 0.075));
  const gid = `goldgrad-${size}`;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#EFD2A0" /><stop offset="1" stopColor="#D2A45A" />
          </linearGradient>
        </defs>
        <circle className="track" cx={size / 2} cy={size / 2} r={r} strokeWidth={sw} />
        <circle className="prog" cx={size / 2} cy={size / 2} r={r} strokeWidth={sw}
          stroke={`url(#${gid})`} strokeDasharray={c.toFixed(1)} strokeDashoffset={off.toFixed(1)} />
      </svg>
      <div className="cap">
        <div className="n" style={{ fontSize: nFont }}>{score}</div>
        <div className="u" style={{ fontSize: uFont, marginTop: 3 }}>match</div>
      </div>
    </div>
  );
}

export default function CityBreakdown({ result, results, profile, onBack, tier = "free", onUnlock, onRoadmap, onVisa }) {
  if (!result) return null;
  const c = result;
  const housing = profile?.housing || "rent";
  const score = Math.round(c.matchScore);

  // engine name is the full "City, ST" / "City, Country" string — split for the
  // serif hero (big city name + smaller italic region), matching the mockup.
  const ci = c.name.lastIndexOf(", ");
  const cityName = ci > 0 ? c.name.slice(0, ci) : c.name;
  const cityRegion = ci > 0 ? c.name.slice(ci + 2) : "";

  // ── rank within the ranked list (engine guarantees the ordering) ──
  const list = results || [];
  const rank = Math.max(1, list.findIndex((r) => r.name === c.name) + 1 || 1);
  const of = list.length || 1;

  // ── expenses → labeled / colored rows (real engine numbers) ──
  const exp = c.expenses || {};
  const rows = [
    { label: housing === "rent" ? "Rent · 1 bedroom" : "Mortgage est.", val: exp.rent, color: "#E2B56B" },
    { label: "Food & groceries", val: exp.food, color: "#EFD2A0" },
    { label: "Debt payments", val: exp.debtPay, color: "#E0816A" },
    { label: "Health insurance", val: exp.insurance, color: "#C99A5B" },
    { label: "Personal / misc", val: exp.personal, color: "#D9A06C" },
    { label: "Transportation", val: exp.transport, color: "#B5784A" },
    { label: "Utilities", val: exp.utilities, color: "#8A6F4E" },
    { label: "Childcare", val: exp.childcare, color: "#8A5E2E" },
    { label: "Pet expenses", val: exp.pets, color: "#8FD6A8" },
  ].filter((r) => r.val > 0);
  const expTotal = exp.total || rows.reduce((s, r) => s + r.val, 0);

  // ── fit card from REAL scoreFactors (signed contributions) ──
  const factors = (c.scoreFactors || []).filter((f) => Math.abs(f.contribution) >= 0.5);
  const maxAbs = Math.max(1, ...factors.map((f) => Math.abs(f.contribution)));

  // ── derived tax note (effective rate vs real take-home) ──
  const annualTax = Math.max(0, c.salary - c.monthlyTakeHome * 12);
  const effRate = c.salary > 0 ? Math.round((annualTax / c.salary) * 100) : 0;
  const taxNote = `Eff. tax ~${effRate}% · State ${c.stateTax === 0 ? "$0" : c.stateTax + "%"}`;
  const salarySub = profile?.hasRemote
    ? "Remote, income travels with you"
    : c.stateTax === 0 ? "No state income tax" : `${c.stateTax}% state income tax`;

  // ── day-in-life + pull (templated from real facts; Phase-5 live AI replaces) ──
  const climateLead = (c.climate || "").split("·")[0].trim().toLowerCase();
  const positive = c.monthlySavings >= 0;
  const dayLine = positive
    ? `${profile?.hasRemote ? "You wake unhurried, no commute, just your own rhythm" : "Your commute is short and the day finds its rhythm fast"}. The ${climateLead || "easy"} weather pulls you outside by afternoon, and with about ${money(c.monthlySavings)}/mo left after every expense, ${c.name} on a Friday isn't a splurge. It's just Friday.`
    : `${c.name} runs a little tighter month to month, with rent and costs asking more of the budget, but the ${climateLead || "local"} days and the life around them are the trade you'd be making.`;
  const pull = positive
    ? "The first month here, the math finally works in your favor."
    : "It asks a little more of the budget, but it gives the days back to you.";

  // ── live teaser chips (honest descriptors, no fabricated counts) ──
  const live = [
    { n: profile?.profession ? `${profile.profession}` : "Local", label: "roles & openings" },
    { n: "1-bed", label: "apartment listings" },
    { n: "Curated", label: "restaurants & bars" },
    { n: "Nearby", label: "trails & outdoors" },
  ];

  const top1 = profile?.importanceRank?.[0] || "cost";
  const top2 = profile?.importanceRank?.[1] || "career";

  return (
    <div className="bd lay-ed">
      <style>{CSS}</style>

      <div className="bd-top">
        <button className="bd-back" onClick={onBack}>← All cities</button>
        <span className="bd-wm">Potential<span className="d">°</span></span>
      </div>

      {/* ── Hero ── */}
      <div className="hero">
        <div className="glow" />
        <Rose size={118} />
        <div className="rank">
          <span className="lbl">Match {String(rank).padStart(2, "0")} of {of}</span>
          <span className="line" />
          <span className="lbl lbl-dim" style={{ whiteSpace: "nowrap" }}>{c.pop} · {c.climate}</span>
        </div>
        <h1>{cityName}{cityRegion && <span className="st"> {cityRegion}</span>}</h1>
        <p className="tag">{deriveTagline(c)}</p>
        <div className="chips">
          {(c.vibe || []).map((v, i) => (
            <span key={v} className={"chip" + (i === 1 ? " gold" : "")}>{v}</span>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="body">
        {/* Money column */}
        <div className="money">
          <div className="headrow">
            <div className="stat th">
              <div className="v">{money(c.monthlyTakeHome)}</div>
              <div className="k">Monthly take-home</div>
              <div className="s">{taxNote}</div>
            </div>
            <div className="stat" style={{ textAlign: "right" }}>
              <div className="v" style={{ fontSize: 30, color: "var(--ivory)" }}>{money(c.salary)}</div>
              <div className="k">Est. annual salary</div>
              <div className="s">{salarySub}</div>
            </div>
          </div>

          <div className="lbl" style={{ marginBottom: 13 }}>Where your money goes · per month</div>
          <div className="ebar">
            {rows.map((r, i) => (
              <i key={i} style={{ flex: `${r.val} 0 0`, background: r.color }} />
            ))}
          </div>
          <div style={{ height: 16 }} />
          <table className="elist">
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td><span className="sw" style={{ background: r.color }} />{r.label}</td>
                  <td className="amt">{money(r.val)}</td>
                </tr>
              ))}
              <tr className="tot">
                <td>Total monthly cost</td>
                <td className="amt">{money(expTotal)}</td>
              </tr>
            </tbody>
          </table>

          <div className="save-hi" style={positive ? null : NEG_HI}>
            <div>
              <div className="lbl" style={{ color: positive ? "var(--pos)" : "var(--neg)", marginBottom: 6 }}>
                {positive ? "Left to save" : "Monthly shortfall"}
              </div>
              <div style={{ fontSize: 13, color: "var(--ivory-dim)" }}>After every monthly expense</div>
            </div>
            <div className="stat" style={{ textAlign: "right" }}>
              <div className={"v " + (positive ? "pos" : "neg")}>
                {positive ? "+" : "−"}{money(c.monthlySavings)}
              </div>
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="side">
          <div className="card fitcard">
            <div className="fithead">
              <ScoreRing score={score} size={92} sw={8} />
              <div>
                <div className="lbl" style={{ marginBottom: 6 }}>Why {c.name} fits</div>
                <div style={{ fontSize: 13.5, color: "var(--ivory-dim)", lineHeight: 1.5 }}>
                  Weighted to what you ranked first: {top1}, then {top2}.
                </div>
              </div>
            </div>
            <div className="dim">
              {factors.length === 0 && (
                <div style={{ fontSize: 13, color: "var(--ivory-faint)" }}>No score factors available.</div>
              )}
              {factors.map((f, i) => {
                const pos = f.contribution >= 0;
                const w = (Math.abs(f.contribution) / maxAbs) * 100;
                return (
                  <div className="dim-row" key={i}>
                    <div className="dh">
                      <span className="dn">{FIT_LABELS[f.factor] || f.factor}</span>
                      <span className="dv" style={pos ? null : { color: "var(--neg)" }}>
                        {pos ? "+" : "−"}{Math.round(Math.abs(f.contribution))}
                      </span>
                    </div>
                    <div className="dt">
                      <div className="df" style={{ width: `${w}%`, background: pos ? undefined : "var(--neg)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card daycard">
            <div className="lbl" style={{ marginBottom: 14 }}>A day in your life</div>
            <p className="prose">{dayLine}</p>
            <p className="pull">“{pull}”</p>
          </div>
        </div>
      </div>

      {/* ── Next steps: Phase 6/7 entry CTAs (tier-gated via LockGate) ── */}
      {(onRoadmap || onVisa) && (
        <div className="bd-next">
          <span className="lbl lbl-dim">Your next steps</span>
          <div className="bd-ctas">
            {onRoadmap && (
              <LockGate tier={tier} requiredTier="plus" lockedLabel="Unlock Relocation Roadmap" onUnlock={onUnlock}>
                <button className="bd-cta" onClick={onRoadmap}>
                  <span className="bd-cta-k">Relocation roadmap →</span>
                  <span className="bd-cta-d">Your personalized 6-step plan to actually move to {cityName}.</span>
                </button>
              </LockGate>
            )}
            {onVisa && (
              <LockGate tier={tier} requiredTier="premium" lockedLabel="Unlock Visa Concierge" onUnlock={onUnlock}>
                <button className="bd-cta" onClick={onVisa}>
                  <span className="bd-cta-k">Visa concierge →</span>
                  <span className="bd-cta-d">Compare the immigration pathways that fit your profile.</span>
                </button>
              </LockGate>
            )}
          </div>
        </div>
      )}

      {/* ── Foot: live-data teaser ── */}
      <div className="foot">
        <span className="lbl lbl-dim">⚡ Live data, powered by AI search</span>
        <div className="live">
          {live.map((l, i) => (
            <div className="lc" key={i}>
              <span className="ic" />
              <span><b>{l.n}</b> {l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const NEG_HI = {
  background: "linear-gradient(100deg, rgba(224,129,106,.10), rgba(224,129,106,.02))",
  border: "1px solid rgba(224,129,106,.22)",
};

const CSS = `
.bd{
  --night-900:#050710; --night-800:#070A11; --night-700:#0D1119; --night-600:#10141D; --night-560:#141B27;
  --gold-500:#E2B56B; --gold-600:#D2A45A; --gold-700:#CAA05A; --gold-300:#EFD2A0; --gold-glow:rgba(226,181,107,.30);
  --amber-mid:#6E4F2A;
  --ivory:#F3EDE1; --ivory-dim:rgba(243,237,225,.62); --ivory-faint:rgba(243,237,225,.34); --ivory-ghost:rgba(243,237,225,.10);
  --pos:#8FD6A8; --neg:#E0816A;
  --serif:'Instrument Serif',Georgia,serif; --sans:'Manrope',system-ui,sans-serif; --mono:'JetBrains Mono',ui-monospace,monospace;
  --ease:cubic-bezier(.22,.61,.36,1);
  position:relative;min-height:100vh;font-family:var(--sans);color:var(--ivory);
  background:radial-gradient(125% 90% at 50% -8%, #131A26 0%, #0D1119 38%, #070A11 74%, #050710 100%);
  -webkit-font-smoothing:antialiased;overflow-x:hidden;
}
.bd *{box-sizing:border-box}
.bd ::selection{background:var(--gold-500);color:var(--night-800)}

.bd-top{display:flex;align-items:center;justify-content:space-between;padding:20px clamp(22px,5.5vw,84px);
  border-bottom:1px solid var(--ivory-ghost);position:relative;z-index:5}
.bd-back{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ivory-dim);
  background:none;border:none;display:inline-flex;align-items:center;gap:8px;cursor:pointer;transition:color .2s var(--ease)}
.bd-back:hover{color:var(--gold-500)}
.bd-wm{font-family:var(--serif);font-size:22px;letter-spacing:.3px;opacity:.92}
.bd-wm .d{color:var(--gold-500);font-style:italic}

.lbl{font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-500);font-weight:500}
.lbl-dim{color:var(--ivory-faint)}

.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{font-family:var(--mono);font-size:11px;letter-spacing:.04em;color:var(--ivory-dim);white-space:nowrap;
  background:rgba(243,237,225,.04);border:1px solid var(--ivory-ghost);border-radius:100px;padding:6px 13px}
.chip.gold{color:var(--gold-300);border-color:rgba(226,181,107,.3);background:rgba(226,181,107,.07)}

.ring{position:relative;display:grid;place-items:center;flex:none}
.ring svg{transform:rotate(-90deg);overflow:visible}
.ring .track{fill:none;stroke:rgba(243,237,225,.1)}
.ring .prog{fill:none;stroke-linecap:round;filter:drop-shadow(0 0 7px rgba(226,181,107,.5))}
.ring .cap{position:absolute;text-align:center}
.ring .cap .n{font-family:var(--mono);font-weight:600;color:var(--gold-500);line-height:1}
.ring .cap .u{font-family:var(--mono);text-transform:uppercase;letter-spacing:.16em;color:var(--ivory-faint)}

.stat .v{font-family:var(--mono);font-weight:600;letter-spacing:-.02em;line-height:1}
.stat .k{font-family:var(--mono);font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--ivory-faint);margin-top:8px}
.stat .s{font-size:12px;color:var(--ivory-dim);margin-top:4px}
.v.pos{color:var(--pos)} .v.neg{color:var(--neg)}

.ebar{display:flex;height:12px;border-radius:6px;overflow:hidden;background:rgba(243,237,225,.05)}
.ebar > i{display:block;min-width:2px;transition:flex-basis .4s var(--ease)}
.elist{width:100%;border-collapse:collapse}
.elist td{padding:9px 0;border-bottom:1px solid var(--ivory-ghost);font-size:13.5px;color:var(--ivory-dim);vertical-align:middle}
.elist tr:last-child td{border-bottom:none}
.elist .sw{width:9px;height:9px;border-radius:3px;display:inline-block;margin-right:10px;vertical-align:middle}
.elist .amt{font-family:var(--mono);font-size:13.5px;color:var(--ivory);text-align:right;font-weight:500;white-space:nowrap}
.elist .tot td{border-top:1.5px solid var(--ivory-ghost);border-bottom:none;padding-top:13px;
  font-weight:700;color:var(--ivory);text-transform:uppercase;letter-spacing:.05em;font-size:12.5px}
.elist .tot .amt{font-size:16px;color:var(--gold-500)}

.dim{display:flex;flex-direction:column;gap:14px}
.dim-row .dh{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
.dim-row .dn{font-size:13px;color:var(--ivory-dim);white-space:nowrap}
.dim-row .dv{font-family:var(--mono);font-size:12px;color:var(--gold-300)}
.dim-row .dt{height:5px;border-radius:3px;background:rgba(243,237,225,.08);overflow:hidden}
.dim-row .df{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--gold-700),var(--gold-300))}

.card{background:var(--night-600);border:1px solid var(--ivory-ghost);border-radius:18px}

.prose{font-size:15px;line-height:1.62;color:var(--ivory-dim);text-wrap:pretty}
.pull{font-family:var(--serif);font-style:italic;font-size:23px;line-height:1.3;color:var(--ivory);text-wrap:balance}

.live{display:flex;flex-wrap:wrap;gap:10px}
.live .lc{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--ivory-dim);
  background:rgba(243,237,225,.03);border:1px solid var(--ivory-ghost);border-radius:12px;padding:11px 15px}
.live .lc b{color:var(--ivory);font-weight:600}
.live .lc .ic{width:7px;height:7px;border-radius:50%;background:var(--gold-500);box-shadow:0 0 8px var(--gold-glow);flex:none}

.glow{position:absolute;left:50%;transform:translateX(-50%);pointer-events:none;
  background:radial-gradient(50% 70% at 50% 100%,rgba(226,181,107,.20),rgba(138,94,46,.07) 45%,transparent 72%)}
.rose{position:absolute;pointer-events:none;opacity:.5}
.rose circle,.rose line{stroke:rgba(226,181,107,.4);fill:none;stroke-width:.8}
.rose .dot{fill:rgba(226,181,107,.5);stroke:none}

/* ── Editorial Dossier layout — full-bleed, padding scales with viewport ── */
.lay-ed{width:100%}
.lay-ed .hero{position:relative;padding:clamp(40px,5vw,68px) clamp(22px,5.5vw,84px) 44px;overflow:hidden;
  background:radial-gradient(120% 80% at 80% -10%,#141B27,transparent 60%)}
.lay-ed .hero .glow{bottom:-60%;width:90%;height:150%}
.lay-ed .hero .rose{top:28px;right:clamp(20px,5vw,72px)}
.lay-ed .rank{display:flex;align-items:center;gap:14px;margin-bottom:20px;flex-wrap:wrap}
.lay-ed .rank .line{height:1px;width:46px;background:rgba(226,181,107,.4)}
.lay-ed h1{font-family:var(--serif);font-weight:400;font-size:clamp(58px,11vw,104px);line-height:.9;letter-spacing:-.02em;position:relative;z-index:2}
.lay-ed h1 .st{color:var(--ivory-faint);font-style:italic;font-size:.6em}
.lay-ed .tag{font-size:19px;color:var(--ivory-dim);max-width:30ch;margin:20px 0 24px;line-height:1.5;text-wrap:balance;position:relative;z-index:2}
.lay-ed .body{display:grid;grid-template-columns:1.55fr 1fr;gap:clamp(28px,3vw,52px);padding:clamp(32px,3.5vw,48px) clamp(22px,5.5vw,84px) 34px}
.lay-ed .money .headrow{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:26px;flex-wrap:wrap}
.lay-ed .money .th .v{font-size:clamp(44px,9vw,62px)}
.lay-ed .save-hi{display:flex;align-items:center;justify-content:space-between;gap:16px;
  background:linear-gradient(100deg,rgba(143,214,168,.1),rgba(143,214,168,.02));
  border:1px solid rgba(143,214,168,.22);border-radius:16px;padding:20px 24px;margin-top:26px}
.lay-ed .save-hi .v{font-size:34px}
.lay-ed .side > *+*{margin-top:22px}
.lay-ed .fitcard{padding:24px}
.lay-ed .fithead{display:flex;align-items:center;gap:18px;margin-bottom:22px}
.lay-ed .daycard{padding:26px 26px 28px}
.lay-ed .pull{margin:18px 0 0;padding-top:18px;border-top:1px solid var(--ivory-ghost)}
.lay-ed .foot{padding:24px clamp(22px,5.5vw,84px) 44px;border-top:1px solid var(--ivory-ghost);
  display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}

/* ── Next-steps CTAs (Phase 6/7 graft) — editorial-dossier styling ── */
.lay-ed .bd-next{padding:8px clamp(22px,5.5vw,84px) 4px}
.lay-ed .bd-next .lbl{display:block;margin-bottom:14px}
.lay-ed .bd-ctas{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.bd-cta{display:flex;flex-direction:column;align-items:flex-start;gap:7px;width:100%;text-align:left;
  background:var(--night-600);border:1px solid var(--ivory-ghost);border-radius:18px;padding:22px 24px;cursor:pointer;
  font-family:var(--sans);color:var(--ivory);transition:border-color .2s var(--ease),background .2s var(--ease)}
.bd-cta:hover{border-color:var(--gold-500);background:var(--night-560)}
.bd-cta-k{font-family:var(--serif);font-size:23px;line-height:1.05}
.bd-cta-d{font-size:13.5px;color:var(--ivory-dim);line-height:1.5}

@media(max-width:860px){
  .lay-ed .bd-ctas{grid-template-columns:1fr}
  .lay-ed .body{grid-template-columns:1fr;gap:22px;padding:28px 22px 26px}
  .lay-ed .hero{padding:36px 22px 30px}
  .lay-ed .hero .rose{top:18px;right:14px;width:84px;height:84px}
  .lay-ed .foot{padding:22px 22px 34px}
  .bd-top{padding:16px 22px}
}
@media(max-width:480px){
  .lay-ed .hero .rose{display:none}
  .lay-ed .tag{font-size:17px}
  .lay-ed .save-hi{flex-wrap:wrap}
  .lay-ed .save-hi .v{font-size:30px}
}
`;
