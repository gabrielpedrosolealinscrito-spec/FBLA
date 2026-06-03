import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// RESULTS MAP — cinematic gold map of matched cities. Each city is a
// glowing pin placed by lat/lng (equirectangular projection over a
// faint continental-US outline). Click a pin (or list row) to open the
// city detail. Offline — no map tiles. onSelect(city) / onEdit().
// ═══════════════════════════════════════════════════════════════

const W = 1000, H = 560;
const LNG0 = -125.5, LNG1 = -66, LAT0 = 24, LAT1 = 49.8;
const projX = (lng) => (lng - LNG0) / (LNG1 - LNG0) * W;
const projY = (lat) => (LAT1 - lat) / (LAT1 - LAT0) * H;
const pctL = (lng) => (projX(lng) / W) * 100;
const pctT = (lat) => (projY(lat) / H) * 100;
const fmt = (n) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;

// coarse continental-US border as [lng,lat] — drawn with the same projection
// as the pins, so markers always sit in correct relative positions.
const US = [
  [-124.7,48.4],[-124.2,46.3],[-124.4,43.0],[-124.2,40.4],[-122.4,37.8],[-120.6,34.5],[-117.3,32.7],
  [-114.8,32.5],[-111.0,31.3],[-108.2,31.8],[-106.5,31.8],[-103.0,29.0],[-99.5,27.5],[-97.4,25.9],
  [-96.5,28.5],[-93.8,29.7],[-89.2,29.2],[-87.5,30.4],[-84.0,30.1],[-82.8,27.8],[-80.1,25.2],
  [-81.4,30.7],[-80.9,32.0],[-78.9,33.9],[-75.9,36.9],[-76.0,38.0],[-74.0,40.5],[-71.1,41.5],[-70.7,43.1],[-67.0,44.9],
  [-69.2,47.4],[-71.5,45.0],[-76.9,43.3],[-79.0,43.3],[-82.5,41.7],[-83.0,46.0],[-90.0,46.7],[-95.2,49.0],
  [-104.0,49.0],[-114.0,49.0],[-123.0,49.0],
];
const usPath = "M " + US.map(([lng, lat]) => `${projX(lng).toFixed(1)} ${projY(lat).toFixed(1)}`).join(" L ") + " Z";

const CSS = `
.rm{ --bg:#070a11; --bg2:#0d1119; --card:rgba(255,255,255,.04); --border:rgba(243,237,225,.12); --border2:rgba(243,237,225,.24);
  --accent:#e2b56b; --accent-ink:#13100a; --accent-dim:rgba(226,181,107,.13); --glow:rgba(226,181,107,.6); --glow-sel:rgba(226,181,107,.3);
  --ink:#f3ede1; --dim:rgba(243,237,225,.56); --faint:rgba(243,237,225,.3); --pos:#8fd6a8; --neg:#e0816a;
  --serif:'Instrument Serif',serif; --mono:'JetBrains Mono',monospace; --ease:cubic-bezier(.22,.61,.36,1);
  font-family:'Manrope',sans-serif; color:var(--ink); min-height:100vh; background:var(--bg);
  background-image:radial-gradient(120% 80% at 50% -10%, var(--bg2), var(--bg) 60%); -webkit-font-smoothing:antialiased;
  .top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 28px;border-bottom:1px solid var(--border);position:sticky;top:0;background:color-mix(in srgb,var(--bg) 82%,transparent);backdrop-filter:blur(12px);z-index:20}
  .brand{font-family:var(--serif);font-size:22px;letter-spacing:.5px}
  .brand small{font-style:italic;opacity:.55;font-size:13px}
  .edit{font-family:inherit;font-size:13px;color:var(--dim);background:var(--card);border:1px solid var(--border);border-radius:10px;padding:8px 14px;cursor:pointer;transition:.2s}
  .edit:hover{color:var(--accent);border-color:var(--accent)}
  .wrap{max-width:1180px;margin:0 auto;padding:30px 24px 80px}
  .h{font-family:var(--serif);font-size:30px}
  .sub{color:var(--dim);font-size:13px;margin:4px 0 18px}
  .sorts{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
  .pill{font-family:inherit;font-size:13px;color:var(--dim);background:var(--card);border:1px solid var(--border);border-radius:100px;padding:7px 14px;cursor:pointer;transition:.2s}
  .pill:hover{color:var(--ink);border-color:var(--border2)}
  .pill.on{color:var(--accent);border:1.5px solid var(--accent);background:var(--accent-dim);font-weight:600;box-shadow:0 0 7px -4px var(--glow-sel)}
  .stage{position:relative;width:100%;aspect-ratio:1000/560;border:1px solid var(--border);border-radius:20px;overflow:hidden;
    background:radial-gradient(120% 100% at 50% 0%, #14110c 0%, #0c0d12 55%, #08090e 100%);box-shadow:inset 0 0 80px rgba(0,0,0,.6)}
  .stage svg.map{position:absolute;inset:0;width:100%;height:100%;display:block}
  .grat{stroke:rgba(243,237,225,.05);stroke-width:1}
  .coast{fill:rgba(226,181,107,.045);stroke:rgba(226,181,107,.35);stroke-width:1.4;stroke-linejoin:round;filter:drop-shadow(0 0 8px rgba(226,181,107,.18))}
  .pin{position:absolute;transform:translate(-50%,-100%);z-index:2;cursor:pointer;transition:filter .2s, z-index 0s}
  .pin:hover,.pin.hot{z-index:9}
  .pin .mk{display:block;width:26px;height:34px;filter:drop-shadow(0 6px 10px rgba(0,0,0,.5)) drop-shadow(0 0 8px var(--glow-sel))}
  .pin.best .mk{width:34px;height:44px;filter:drop-shadow(0 6px 12px rgba(0,0,0,.6)) drop-shadow(0 0 12px var(--glow))}
  .pin:hover .mk{filter:drop-shadow(0 8px 14px rgba(0,0,0,.6)) drop-shadow(0 0 14px var(--glow))}
  .pin .lab{position:absolute;left:50%;top:-6px;transform:translateX(-50%) translateY(-100%);white-space:nowrap;
    background:rgba(10,12,18,.8);border:1px solid var(--border2);border-radius:8px;padding:4px 9px;font-size:11.5px;display:flex;align-items:center;gap:7px;backdrop-filter:blur(6px);pointer-events:none;opacity:0;transition:.18s}
  .pin:hover .lab,.pin.best .lab,.pin.hot .lab{opacity:1}
  .pin .lab b{font-weight:600}
  .pin .lab .sc{font-family:var(--mono);color:var(--accent)}
  .pulse{position:absolute;left:50%;bottom:0;width:10px;height:10px;border-radius:50%;transform:translate(-50%,50%);background:rgba(226,181,107,.5);animation:rmpulse 2.6s ease-out infinite}
  @keyframes rmpulse{0%{box-shadow:0 0 0 0 rgba(226,181,107,.4)}70%{box-shadow:0 0 0 16px rgba(226,181,107,0)}100%{box-shadow:0 0 0 0 rgba(226,181,107,0)}}
  .legend{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;margin-top:22px}
  .row{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:12px 14px;cursor:pointer;transition:.18s}
  .row:hover,.row.hot{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 7%,transparent)}
  .row .em{font-size:24px;width:30px;text-align:center}
  .row .nm{font-size:14px;font-weight:600}
  .row .sc{font-family:var(--mono);font-size:11px;color:var(--accent);background:var(--accent-dim);padding:1px 7px;border-radius:6px;margin-left:8px}
  .row .mo{text-align:right;font-family:var(--mono);font-size:13px}
  .row .mo .sv{font-weight:600}
  @media(max-width:560px){ .h{font-size:24px} .wrap{padding:20px 16px 70px} }
}
`;

export default function ResultsMap({ results, profile, sortBy, setSortBy, onSelect, onEdit }) {
  const [hot, setHot] = useState(null);
  const sorted = [...results].sort((a, b) => {
    if (sortBy === "match") return b.matchScore - a.matchScore;
    if (sortBy === "savings") return b.monthlySavings - a.monthlySavings;
    if (sortBy === "salary") return b.salary - a.salary;
    if (sortBy === "cost") return a.costIndex - b.costIndex;
    return 0;
  });
  const bestName = [...results].sort((a, b) => b.matchScore - a.matchScore)[0]?.name;

  const Pin = ({ c }) => {
    const best = c.name === bestName;
    return (
      <div className={`pin ${best ? "best" : ""} ${hot === c.name ? "hot" : ""}`}
        style={{ left: pctL(c.lng) + "%", top: pctT(c.lat) + "%" }}
        onMouseEnter={() => setHot(c.name)} onMouseLeave={() => setHot(null)} onClick={() => onSelect(c)}>
        {best && <span className="pulse" />}
        <div className="lab"><b>{c.name}</b><span className="sc">{c.matchScore}%</span></div>
        <svg className="mk" viewBox="0 0 24 34">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 8.5 12 22 12 22s12-13.5 12-22C24 5.4 18.6 0 12 0z"
            fill="var(--accent)" stroke="#13100a" strokeWidth="1" />
          <circle cx="12" cy="12" r="4.4" fill="#13100a" />
        </svg>
      </div>
    );
  };

  return (
    <div className="rm">
      <style>{CSS}</style>
      <div className="top">
        <div className="brand">Potential <small>°</small></div>
        <button className="edit" onClick={onEdit}>Edit profile</button>
      </div>
      <div className="wrap">
        <h2 className="h">Your matches, mapped</h2>
        <p className="sub">{profile.profession || "Your profile"}{profile.hasRemote ? " · remote" : ""} · {results.length} cities · tap a pin to explore</p>
        <div className="sorts">
          {[["match", "Best match"], ["savings", "Most savings"], ["salary", "Top salary"], ["cost", "Lowest cost"]].map(([k, l]) => (
            <button key={k} className={`pill ${sortBy === k ? "on" : ""}`} onClick={() => setSortBy(k)}>{l}</button>
          ))}
        </div>

        <div className="stage">
          <svg className="map" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            {/* graticule */}
            {Array.from({ length: 7 }, (_, i) => { const lng = -120 + i * 10; const x = projX(lng); return <line key={"v" + i} className="grat" x1={x} y1="0" x2={x} y2={H} />; })}
            {Array.from({ length: 6 }, (_, i) => { const lat = 25 + i * 5; const y = projY(lat); return <line key={"h" + i} className="grat" x1="0" y1={y} x2={W} y2={y} />; })}
            <path className="coast" d={usPath} />
          </svg>
          {results.map(c => <Pin key={c.name} c={c} />)}
        </div>

        <div className="legend">
          {sorted.map(c => (
            <div key={c.name} className={`row ${hot === c.name ? "hot" : ""}`}
              onMouseEnter={() => setHot(c.name)} onMouseLeave={() => setHot(null)} onClick={() => onSelect(c)}>
              <span className="em">{c.emoji}</span>
              <span><span className="nm">{c.name}</span><span className="sc">{c.matchScore}%</span></span>
              <span className="mo"><span className="sv" style={{ color: c.monthlySavings >= 0 ? "var(--pos)" : "var(--neg)" }}>{c.monthlySavings >= 0 ? "+" : ""}{fmt(Math.abs(c.monthlySavings))}</span><span style={{ color: "var(--faint)", fontSize: 10 }}>/mo</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
