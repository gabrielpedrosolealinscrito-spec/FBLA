import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// RESULTS MAP — the whole page is one cinematic full-bleed map, in an
// engraved sepia-gold "antique cartography" style (ref: Getty
// "Persepolis Reimagined"). The US relief is a bundled, pre-toned
// plate-carrée raster (public/us-relief.jpg: duotone gradient-map,
// dark seas, gold coastline glow) cropped to exactly the projection
// bbox below, so gilded site-markers placed by lat/lng sit on the
// correct terrain. Offline — no map tiles. onSelect(city)/onEdit().
// ═══════════════════════════════════════════════════════════════

// bbox MUST match the crop of public/us-relief.jpg
const LNG0 = -125.5, LNG1 = -66, LAT0 = 19.0, LAT1 = 52.0;
const pctL = (lng) => (lng - LNG0) / (LNG1 - LNG0) * 100;
const pctT = (lat) => (LAT1 - lat) / (LAT1 - LAT0) * 100;

// faint engraved water labels, placed by lat/lng like the city markers
const SEAS = [
  { t: "PACIFIC OCEAN", lng: -123.5, lat: 30, rot: -66 },
  { t: "ATLANTIC OCEAN", lng: -68, lat: 34, rot: 64 },
  { t: "GULF OF MEXICO", lng: -90, lat: 23.5, rot: 0 },
];

const CSS = `
.rm{ --bg:#1a1208; --ink:#ddc9a6; --dim:rgba(221,201,166,.62); --faint:rgba(221,201,166,.34);
  --accent:#d4a855; --accent-soft:#e6c882; --glow:rgba(212,168,85,.55);
  --border:rgba(212,168,85,.22); --border2:rgba(212,168,85,.48);
  --serif:'Instrument Serif',serif; --label:'Cormorant Garamond',serif; --mono:'JetBrains Mono',monospace; --ease:cubic-bezier(.22,.61,.36,1);
  font-family:'Manrope',sans-serif; color:var(--ink); background:#1a1208; -webkit-font-smoothing:antialiased;

  /* ── the page is one full-screen cinematic map ── */
  .hero{position:relative;width:100%;height:100vh;min-height:480px;overflow:hidden;background:#1a1208}
  .relief{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;display:block;
    filter:contrast(1.05) brightness(.9) saturate(.95)}
  /* candlelight glow at center — warm, faint */
  .tone{position:absolute;inset:0;pointer-events:none;mix-blend-mode:soft-light;background:
    radial-gradient(75% 65% at 50% 46%, rgba(212,168,85,.12), transparent 62%)}
  .haze{position:absolute;inset:0;pointer-events:none;filter:blur(3px);background:
    radial-gradient(50% 42% at 86% 90%, rgba(212,168,85,.07), transparent 72%)}
  /* strong dark vignette — frames the map like an old cartographic print */
  .vig{position:absolute;inset:0;pointer-events:none;background:
    radial-gradient(120% 120% at 50% 46%, transparent 34%, rgba(20,14,6,.5) 70%, rgba(10,7,3,.97) 100%);
    box-shadow:inset 0 0 160px 48px rgba(10,7,3,.72)}

  /* ocean/sea labels — italic, flowing with the water, near-white, widest tracking */
  .sea{position:absolute;transform:translate(-50%,-50%) rotate(var(--r));white-space:nowrap;font-family:var(--label);
    font-style:italic;font-weight:300;text-transform:uppercase;letter-spacing:.42em;font-size:8.5px;line-height:1.7;
    color:#E8E4DC;opacity:.62;text-shadow:0 0 8px rgba(180,120,40,.4);pointer-events:none;z-index:2}

  .mk{position:absolute;transform:translate(-50%,-50%);z-index:4;cursor:pointer}
  .mk:hover,.mk.hot{z-index:12}
  .mk svg{display:block;overflow:visible;filter:drop-shadow(0 0 6px rgba(180,120,40,.45))}
  .mk .ring{fill:none;stroke:var(--accent);stroke-width:1.2;opacity:.8}
  .mk .dot{fill:var(--accent)}
  .mk .tick{stroke:var(--accent);stroke-width:1.2;opacity:.9}
  .mk:hover .ring,.mk.hot .ring{opacity:1}
  .mk.best svg{filter:drop-shadow(0 0 14px var(--glow))}
  .pulse{position:absolute;left:50%;top:50%;width:8px;height:8px;border-radius:50%;transform:translate(-50%,-50%);background:rgba(212,168,85,.5);animation:rmpulse 2.8s var(--ease) infinite;pointer-events:none}
  @keyframes rmpulse{0%{box-shadow:0 0 0 0 rgba(212,168,85,.5)}70%{box-shadow:0 0 0 28px rgba(212,168,85,0)}100%{box-shadow:0 0 0 0 rgba(212,168,85,0)}}
  /* city labels — engraved on parchment: secondary cities faded & cool, best match amber-gold */
  .lab{position:absolute;left:50%;top:13px;transform:translateX(-50%);white-space:nowrap;text-align:center;pointer-events:none;
    font-family:var(--label);font-weight:300;text-transform:uppercase;letter-spacing:.26em;font-size:9.5px;line-height:1.7;
    color:#9A8A72;text-shadow:0 0 8px rgba(180,120,40,.4)}
  .mk.best .lab{font-size:12.5px;letter-spacing:.28em;font-weight:400;color:var(--accent)}
  .lab .sc{display:block;margin-top:2px;font-family:var(--label);font-weight:300;letter-spacing:.2em;font-size:9px;color:var(--accent);
    opacity:0;transition:.2s;text-shadow:0 0 8px rgba(180,120,40,.4)}
  .mk:hover .lab .sc,.mk.hot .lab .sc,.mk.best .lab .sc{opacity:1}

  /* ── floating chrome over the map ── */
  .top{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;gap:16px;
    padding:24px 32px;z-index:30;background:linear-gradient(180deg, rgba(26,18,8,.7), transparent)}
  .brand{font-family:var(--serif);font-size:24px;letter-spacing:.5px;text-shadow:0 1px 8px rgba(0,0,0,.6)}
  .brand small{font-style:italic;opacity:.55;font-size:13px}
  .edit{font-family:inherit;font-size:13px;color:var(--ink);background:rgba(20,14,7,.45);border:1px solid var(--border2);border-radius:100px;padding:9px 18px;cursor:pointer;transition:.2s;backdrop-filter:blur(6px)}
  .edit:hover{color:var(--accent);border-color:var(--accent);background:rgba(20,14,7,.7)}

  .overlay{position:absolute;left:0;right:0;bottom:0;z-index:20;padding:72px 32px 32px;text-align:center;
    background:linear-gradient(0deg, rgba(26,18,8,.94), rgba(26,18,8,.55) 48%, transparent)}
  .h{font-family:var(--serif);font-weight:400;font-size:42px;letter-spacing:.3px;color:var(--accent-soft);text-shadow:0 2px 18px rgba(0,0,0,.8);margin:0}
  .sub{color:var(--dim);font-size:14px;margin:6px 0 0;text-shadow:0 1px 6px rgba(0,0,0,.7)}
  @media(max-width:560px){ .h{font-size:30px} .overlay{padding:52px 18px 24px} .top{padding:18px} .lab{font-size:11.5px;letter-spacing:2px} .sea{font-size:12px;letter-spacing:5px} }
}
`;

export default function ResultsMap({ results, profile, onSelect, onEdit }) {
  const [hot, setHot] = useState(null);
  const list = results || [];
  const bestName = [...list].sort((a, b) => b.matchScore - a.matchScore)[0]?.name;

  const Marker = ({ c }) => {
    const best = c.name === bestName;
    return (
      <div className={`mk ${best ? "best" : ""} ${hot === c.name ? "hot" : ""}`}
        style={{ left: pctL(c.lng) + "%", top: pctT(c.lat) + "%" }}
        onMouseEnter={() => setHot(c.name)} onMouseLeave={() => setHot(null)} onClick={() => onSelect(c)}>
        {best && <span className="pulse" />}
        <svg width={best ? 30 : 22} height={best ? 30 : 22} viewBox="0 0 30 30">
          <circle className="ring" cx="15" cy="15" r={best ? 11 : 9} />
          {[0, 90, 180, 270].map(a => {
            const r1 = best ? 11 : 9, r2 = r1 + 3.5, rad = a * Math.PI / 180;
            return <line key={a} className="tick"
              x1={15 + r1 * Math.cos(rad)} y1={15 + r1 * Math.sin(rad)}
              x2={15 + r2 * Math.cos(rad)} y2={15 + r2 * Math.sin(rad)} />;
          })}
          <circle className="dot" cx="15" cy="15" r={best ? 3.4 : 2.6} />
        </svg>
        <span className="lab">{c.name.split(",")[0]}<span className="sc">{c.matchScore}% match</span></span>
      </div>
    );
  };

  return (
    <div className="rm">
      <style>{CSS}</style>
      <section className="hero">
        <img className="relief" src="/us-relief.jpg" alt="" draggable="false" />
        <div className="tone" />
        <div className="haze" />
        <div className="vig" />
        {SEAS.map(s => (
          <span key={s.t} className="sea" style={{ left: pctL(s.lng) + "%", top: pctT(s.lat) + "%", "--r": s.rot + "deg" }}>{s.t}</span>
        ))}
        {list.map(c => <Marker key={c.name} c={c} />)}

        <div className="top">
          <div className="brand">Potential <small>°</small></div>
          <button className="edit" onClick={onEdit}>Edit profile</button>
        </div>

        <div className="overlay">
          <h2 className="h">Your matches, mapped</h2>
          <p className="sub">{profile.profession || "Your profile"}{profile.hasRemote ? " · remote" : ""} · {list.length} cities · tap a marker to explore</p>
        </div>
      </section>
    </div>
  );
}
