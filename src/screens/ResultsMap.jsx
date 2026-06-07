import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

// ═══════════════════════════════════════════════════════════════
// RESULTS MAP — interactive night/gold map of the matched US cities.
// Real state geometry via d3.geoAlbersUsa + us-atlas (states-albers-10m,
// served locally from /public). Pan/zoom, antique compass rose, engraved
// sea labels, gilded city markers, slide-in detail panel. The SVG map is
// built imperatively with D3; chrome + panel are React. Reads engine-
// scored rows; onSelect(row) opens the full city detail. Ported from the
// "Results Map (standalone)" design. Offline (atlas bundled).
// onSelect(city) / onEdit().
// ═══════════════════════════════════════════════════════════════

const W = 975, H = 610;
const ATLAS_URL = "/us-states-albers-10m.json";

const STATE_ABBR = {
  Alabama:"AL",Alaska:"AK",Arizona:"AZ",Arkansas:"AR",California:"CA",Colorado:"CO",Connecticut:"CT",
  Delaware:"DE",Florida:"FL",Georgia:"GA",Hawaii:"HI",Idaho:"ID",Illinois:"IL",Indiana:"IN",Iowa:"IA",
  Kansas:"KS",Kentucky:"KY",Louisiana:"LA",Maine:"ME",Maryland:"MD",Massachusetts:"MA",Michigan:"MI",
  Minnesota:"MN",Mississippi:"MS",Missouri:"MO",Montana:"MT",Nebraska:"NE",Nevada:"NV","New Hampshire":"NH",
  "New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND",Ohio:"OH",
  Oklahoma:"OK",Oregon:"OR",Pennsylvania:"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD",
  Tennessee:"TN",Texas:"TX",Utah:"UT",Vermont:"VT",Virginia:"VA",Washington:"WA","West Virginia":"WV",
  Wisconsin:"WI",Wyoming:"WY","District of Columbia":"DC",
};

const fmt = (n) => "$" + Math.round(Math.abs(n || 0)).toLocaleString("en-US");
const parseCity = (name) => { const i = name.lastIndexOf(", "); return i > 0 ? [name.slice(0, i), name.slice(i + 2)] : [name, ""]; };
const noteFor = (c, rank) =>
  c.save >= 0
    ? `Ranks #${rank} on your list, about ${fmt(c.save)}/mo left to save on a ${fmt(c.takeHome)} take-home.`
    : `Ranks #${rank} on your list, strong on fit, but rent runs the month about ${fmt(c.save)}/mo short.`;

const CSS = `
.rm{
  --night-900:#050710; --night-800:#070A11; --night-700:#0D1119;
  --gold-500:#E2B56B; --gold-300:#EFD2A0;
  --ivory:#F3EDE1; --ivory-dim:rgba(243,237,225,.56); --ivory-faint:rgba(243,237,225,.30); --ivory-ghost:rgba(243,237,225,.12);
  --positive:#8FD6A8; --negative:#E0816A;
  --serif:'Instrument Serif',Georgia,serif; --sans:'Manrope',system-ui,sans-serif; --mono:'JetBrains Mono',ui-monospace,monospace;
  --ease:cubic-bezier(.22,.61,.36,1);
  position:fixed;inset:0;background:var(--night-900);color:var(--ivory);font-family:var(--sans);-webkit-font-smoothing:antialiased;overflow:hidden;
  button{font-family:inherit;cursor:pointer}

  .stage{position:absolute;inset:0;overflow:hidden;cursor:grab;
    background:radial-gradient(120% 84% at 50% 6%, #131A26 0%, var(--night-700) 40%, var(--night-800) 78%, var(--night-900) 100%)}
  .stage.drag{cursor:grabbing}
  .map{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}

  .grat{stroke:rgba(243,237,225,.05);stroke-width:.6}
  .state{fill:rgba(226,181,107,.035);stroke:rgba(226,181,107,.17);stroke-width:.6;stroke-linejoin:round;transition:fill .3s var(--ease)}
  .state.lit{fill:rgba(226,181,107,.10)}
  .nation{fill:none;stroke:rgba(226,181,107,.5);stroke-width:1.2;stroke-linejoin:round;filter:drop-shadow(0 0 7px rgba(226,181,107,.28))}
  .deco{stroke:rgba(226,181,107,.16);fill:none;stroke-width:.7}
  .deco-dot{fill:rgba(226,181,107,.22)}
  .sea{font-family:var(--serif);font-style:italic;fill:#E8E4DC;opacity:.34;font-size:13px;letter-spacing:5px;text-transform:uppercase;text-anchor:middle;pointer-events:none}

  .mk{cursor:pointer}
  .mk .ring{fill:none;stroke:var(--gold-500);stroke-width:1.1;opacity:.62;transition:opacity .2s var(--ease)}
  .mk .dot{fill:var(--gold-500)}
  .mk .tick{stroke:var(--gold-500);stroke-width:1.1;opacity:.85}
  .mk .lab{font-family:var(--mono);fill:#A7977C;font-size:9px;letter-spacing:2.2px;text-transform:uppercase;text-anchor:middle;paint-order:stroke;stroke:rgba(7,10,17,.55);stroke-width:2.4px}
  /* always-on match % chip — plate keeps it legible over any terrain/line */
  .mk .scbg{fill:rgba(7,10,17,.82);stroke:rgba(226,181,107,.3);stroke-width:.8}
  .mk .sc{font-family:var(--mono);fill:var(--gold-500);font-size:8.4px;letter-spacing:.4px;text-anchor:middle;dominant-baseline:central}
  .mk:hover .ring,.mk.hot .ring{opacity:1}
  .mk:hover .lab,.mk.hot .lab{fill:var(--ivory)}
  .mk:hover .scbg,.mk.hot .scbg{stroke:rgba(226,181,107,.65)}
  .mk.best .ring{stroke-width:1.3;opacity:.95}
  .mk.best .lab{fill:var(--gold-500);font-size:11px;letter-spacing:2.6px}
  .mk.best .sc{font-size:9px;font-weight:500}
  .mk.best .scbg{stroke:rgba(226,181,107,.55)}
  .mk.best{filter:drop-shadow(0 0 10px rgba(226,181,107,.5))}
  .mk.sel .ring{opacity:1;stroke-width:1.5}
  .mk.sel{filter:drop-shadow(0 0 11px rgba(226,181,107,.6))}
  .pulse{fill:none;stroke:var(--gold-500);stroke-width:1.3;animation:rmpulse 2.9s var(--ease) infinite}
  @keyframes rmpulse{0%{r:5px;opacity:.55}80%{r:24px;opacity:0}100%{r:24px;opacity:0}}

  .dawn{position:absolute;left:50%;bottom:-34%;transform:translateX(-50%);width:150%;height:96%;pointer-events:none;z-index:2;
    background:radial-gradient(50% 60% at 50% 100%, rgba(226,181,107,.20) 0%, rgba(138,94,46,.10) 32%, rgba(58,44,29,.04) 54%, transparent 72%)}
  .vig{position:absolute;inset:0;pointer-events:none;z-index:3;
    background:radial-gradient(122% 120% at 50% 42%, transparent 38%, rgba(5,7,16,.42) 74%, rgba(5,7,16,.92) 100%);box-shadow:inset 0 0 150px 40px rgba(5,7,16,.6)}
  .stars{position:absolute;inset:0;pointer-events:none;z-index:1}
  .stars i{position:absolute;width:2px;height:2px;border-radius:50%;background:var(--ivory);animation:tw 5s ease-in-out infinite}
  @keyframes tw{0%,100%{opacity:.05}50%{opacity:.28}}

  .compass{display:inline-block;position:relative;line-height:0;width:34px;height:34px;flex:none}
  .cmp-layer{position:absolute;inset:0}
  .cmp-layer>svg{width:100%;height:100%;display:block;overflow:visible}
  @keyframes cmpA{to{transform:rotate(360deg)}}
  @keyframes cmpB{to{transform:rotate(-360deg)}}
  .cmp-ticks{animation:cmpB 90s linear infinite}
  .cmp-star{animation:cmpA 42s linear infinite}
  @media (prefers-reduced-motion:reduce){.cmp-ticks,.cmp-star{animation:none}}

  .chrome{position:absolute;inset:0;z-index:20;pointer-events:none}
  .chrome>*{pointer-events:auto}
  .top{position:absolute;top:0;left:0;right:0;display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:26px 34px;background:linear-gradient(180deg, rgba(7,10,17,.72), transparent)}
  .idblock{display:flex;align-items:center;gap:14px}
  .wm{font-family:var(--serif);font-size:30px;line-height:1;letter-spacing:.3px;color:var(--ivory)}
  .wm .deg{color:var(--gold-500)}
  .meta{font-family:var(--mono);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--ivory-dim);margin-top:7px;white-space:nowrap}
  .meta b{color:var(--gold-500);font-weight:500}
  .edit{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--ivory-dim);background:rgba(13,17,25,.5);border:1px solid var(--ivory-ghost);border-radius:100px;padding:10px 18px;backdrop-filter:blur(8px);transition:.2s var(--ease)}
  .edit:hover{color:var(--gold-500);border-color:var(--gold-500)}
  .hint{position:absolute;left:34px;bottom:30px;font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--ivory-faint);text-shadow:0 1px 6px rgba(5,7,16,.7);white-space:nowrap}
  .hint b{color:var(--ivory-dim);font-weight:400}
  .zoom{position:absolute;right:34px;bottom:30px;display:flex;flex-direction:column;gap:8px}
  .zb{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;border:1px solid var(--ivory-ghost);background:rgba(13,17,25,.55);backdrop-filter:blur(8px);color:var(--ivory-dim);font-size:19px;line-height:1;transition:.2s var(--ease)}
  .zb:hover{color:var(--gold-500);border-color:var(--gold-500);background:rgba(20,27,39,.7)}
  .zb.reset svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.6}

  .loading{position:absolute;inset:0;display:grid;place-items:center;z-index:25;font-family:var(--mono);font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--ivory-faint)}

  .panel{position:absolute;top:0;right:0;bottom:0;width:392px;max-width:88vw;z-index:40;background:linear-gradient(180deg, var(--night-700), var(--night-800));border-left:1px solid var(--ivory-ghost);box-shadow:-30px 0 80px rgba(5,7,16,.6);transform:translateX(100%);transition:transform .5s var(--ease);display:flex;flex-direction:column;padding:30px 32px 32px;overflow-y:auto}
  .panel.open{transform:translateX(0)}
  .panel .x{align-self:flex-end;width:34px;height:34px;display:grid;place-items:center;border-radius:50%;border:1px solid var(--ivory-ghost);background:none;color:var(--ivory-dim);font-size:16px;transition:.2s var(--ease)}
  .panel .x:hover{color:var(--gold-500);border-color:var(--gold-500)}
  .panel .rank{font-family:var(--mono);font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--gold-500);margin-top:6px}
  .panel h2{font-family:var(--serif);font-weight:400;font-size:46px;line-height:1;letter-spacing:-.01em;margin-top:10px}
  .panel h2 .st{color:var(--ivory-dim);font-style:italic}
  .scorerow{display:flex;align-items:baseline;gap:12px;margin-top:18px}
  .scorebig{font-family:var(--mono);font-size:34px;color:var(--gold-500);letter-spacing:-1px;white-space:nowrap}
  .scorebig .pct{font-size:18px;color:var(--ivory-dim);margin-left:2px}
  .bestbadge{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--night-800);background:var(--gold-500);border-radius:100px;padding:4px 10px}
  .bar{height:4px;border-radius:3px;background:var(--ivory-ghost);margin-top:16px;overflow:hidden}
  .bar>i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,var(--gold-300),var(--gold-500))}
  .note{font-size:15px;line-height:1.55;color:var(--ivory-dim);margin-top:22px}
  .stats{margin-top:26px;border-top:1px solid var(--ivory-ghost)}
  .srow{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid var(--ivory-ghost)}
  .srow .k{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ivory-faint)}
  .srow .v{font-family:var(--mono);font-size:18px;color:var(--ivory)}
  .srow .v.pos{color:var(--positive)}.srow .v.neg{color:var(--negative)}
  .srow .v small{color:var(--ivory-faint);font-size:11px;margin-left:1px}
  .acts{margin-top:auto;padding-top:26px;display:flex;flex-direction:column;gap:10px}
  .btn{display:flex;align-items:center;justify-content:center;gap:8px;font-family:var(--sans);font-weight:600;font-size:14px;border-radius:12px;padding:14px;border:1px solid transparent;transition:.2s var(--ease)}
  .btn.primary{background:var(--gold-500);color:var(--night-800)}
  .btn.primary:hover{background:var(--gold-300)}
  .btn.ghost{background:none;border-color:var(--ivory-ghost);color:var(--ivory-dim)}
  .btn.ghost:hover{color:var(--ivory);border-color:var(--ivory-faint)}

  @media(max-width:620px){
    .top{padding:18px}.wm{font-size:24px}.meta{font-size:9.5px;letter-spacing:.14em}
    .hint{left:18px;bottom:20px;font-size:9.5px}.zoom{right:16px;bottom:18px}.panel{padding:24px 22px}
  }
}
`;

function makeStars() {
  let r = 7; const rnd = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
  return Array.from({ length: 40 }, () => ({ left: rnd() * 100, top: rnd() * 46, delay: rnd() * 5 }));
}

function Compass() {
  return (
    <span className="compass" aria-hidden="true">
      <span className="cmp-layer cmp-ticks">
        <svg viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(226,181,107,.4)" strokeWidth="1" />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i * Math.PI) / 12, r1 = i % 6 === 0 ? 12 : 15, r2 = 18;
            return <line key={i} x1={20 + Math.sin(a) * r1} y1={20 - Math.cos(a) * r1}
              x2={20 + Math.sin(a) * r2} y2={20 - Math.cos(a) * r2} stroke="rgba(226,181,107,.55)" strokeWidth="1" />;
          })}
        </svg>
      </span>
      <span className="cmp-layer cmp-star">
        <svg viewBox="0 0 40 40">
          {[0, 90, 180, 270].map((deg) => {
            const a = (deg * Math.PI) / 180;
            const tx = 20 + Math.sin(a) * 13, ty = 20 - Math.cos(a) * 13;
            const lx = 20 + Math.cos(a) * 4, ly = 20 + Math.sin(a) * 4, rx = 20 - Math.cos(a) * 4, ry = 20 - Math.sin(a) * 4;
            return <path key={deg} d={`M${lx} ${ly} L${tx} ${ty} L${rx} ${ry} Z`}
              fill={deg === 0 ? "var(--gold-500)" : "rgba(226,181,107,.5)"} />;
          })}
          <circle cx="20" cy="20" r="2.4" fill="var(--gold-500)" />
        </svg>
      </span>
    </span>
  );
}

export default function ResultsMap({ results, profile, onSelect, onEdit }) {
  const svgRef = useRef(null);
  const stageRef = useRef(null);
  const zoomApi = useRef(null);
  const [active, setActive] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const stars = useMemo(makeStars, []);

  const cities = useMemo(() => (results || [])
    .filter((r) => r.lat != null && r.lng != null)
    .map((r) => { const [name, st] = parseCity(r.name);
      return { row: r, name, st, lat: r.lat, lng: r.lng, score: Math.round(r.matchScore),
        takeHome: r.monthlyTakeHome, rent: r.medianRent, save: r.monthlySavings }; }),
    [results]);
  const ranked = useMemo(() => [...cities].sort((a, b) => b.score - a.score), [cities]);
  const bestName = ranked[0]?.name;
  const rankOf = useMemo(() => Object.fromEntries(ranked.map((c, i) => [c.name, i + 1])), [ranked]);

  useEffect(() => {
    if (!cities.length) return;
    let cancelled = false;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const gZoom = svg.append("g");

    const gGrat = gZoom.append("g");
    for (let i = 1; i < 8; i++) gGrat.append("line").attr("class", "grat").attr("x1", i * W / 8).attr("y1", 0).attr("x2", i * W / 8).attr("y2", H);
    for (let i = 1; i < 6; i++) gGrat.append("line").attr("class", "grat").attr("x1", 0).attr("y1", i * H / 6).attr("x2", W).attr("y2", i * H / 6);

    const gStates = gZoom.append("g");
    const gNation = gZoom.append("g");
    const gDeco = gZoom.append("g");
    const gSeas = gZoom.append("g");
    const gPins = gZoom.append("g");

    [["Pacific Ocean", 118, 372, -64], ["Atlantic Ocean", 872, 300, 62], ["Gulf of Mexico", 560, 572, 0]]
      .forEach(([t, x, y, rot]) => gSeas.append("text").attr("class", "sea").attr("x", x).attr("y", y)
        .attr("transform", `rotate(${rot} ${x} ${y})`).text(t));

    (function () {
      const cx = 872, cy = 438, R = 46, g = gDeco.append("g").attr("opacity", .9);
      g.append("circle").attr("class", "deco").attr("cx", cx).attr("cy", cy).attr("r", R);
      g.append("circle").attr("class", "deco").attr("cx", cx).attr("cy", cy).attr("r", R * .64);
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r1 = i % 2 ? R * .64 : R * .30, r2 = R;
        g.append("line").attr("class", "deco").attr("x1", cx + Math.sin(a) * r1).attr("y1", cy - Math.cos(a) * r1)
          .attr("x2", cx + Math.sin(a) * r2).attr("y2", cy - Math.cos(a) * r2); }
      [0, 90, 180, 270].forEach((deg) => { const a = deg * Math.PI / 180;
        const tx = cx + Math.sin(a) * R * .9, ty = cy - Math.cos(a) * R * .9;
        const lx = cx + Math.cos(a) * 5, ly = cy + Math.sin(a) * 5, rx = cx - Math.cos(a) * 5, ry = cy - Math.sin(a) * 5;
        g.append("path").attr("class", "deco").attr("d", `M${lx} ${ly} L${tx} ${ty} L${rx} ${ry}`); });
      g.append("circle").attr("class", "deco-dot").attr("cx", cx).attr("cy", cy).attr("r", 3);
    })();

    const projection = d3.geoAlbersUsa().scale(1300).translate([W / 2, H / 2]);
    const geoPath = d3.geoPath();
    const litStates = new Set(cities.map((c) => c.st));
    const setHot = (name) => gPins.selectAll(".mk").classed("hot", function () { return this.getAttribute("data-city") === name; });

    function buildPins() {
      cities.forEach((c) => {
        const xy = projection([c.lng, c.lat]); if (!xy) return;
        const best = c.name === bestName;
        const g = gPins.append("g").attr("class", "mk" + (best ? " best" : "")).attr("data-city", c.name)
          .attr("transform", `translate(${xy[0]},${xy[1]})`);
        const inner = g.append("g").attr("class", "mkInner");
        const rr = best ? 9 : 6.5;
        if (best) inner.append("circle").attr("class", "pulse").attr("cx", 0).attr("cy", 0).attr("r", 5);
        inner.append("circle").attr("class", "ring").attr("cx", 0).attr("cy", 0).attr("r", rr);
        if (best) [0, 90, 180, 270].forEach((deg) => { const a = deg * Math.PI / 180;
          inner.append("line").attr("class", "tick").attr("x1", Math.sin(a) * rr).attr("y1", -Math.cos(a) * rr)
            .attr("x2", Math.sin(a) * (rr + 4)).attr("y2", -Math.cos(a) * (rr + 4)); });
        inner.append("circle").attr("class", "dot").attr("cx", 0).attr("cy", 0).attr("r", best ? 2.6 : 2.1);
        inner.append("text").attr("class", "lab").attr("x", 0).attr("y", rr + 13).text((c.name + (c.st ? ", " + c.st : "")).toUpperCase());
        // always-on match % with a legibility plate sized to the text
        const sw = inner.append("g").attr("class", "scwrap").attr("transform", `translate(0,${rr + 25})`);
        const sct = sw.append("text").attr("class", "sc").attr("x", 0).attr("y", 0).text(c.score + "%");
        const bb = sct.node().getBBox();
        sw.insert("rect", "text.sc").attr("class", "scbg")
          .attr("x", bb.x - 5).attr("y", bb.y - 2).attr("width", bb.width + 10).attr("height", bb.height + 4).attr("rx", 4);
        g.on("mouseenter", () => setHot(c.name)).on("mouseleave", () => setHot(null))
          .on("click", (e) => { e.stopPropagation(); setActive(c); });
      });
    }

    const zoom = d3.zoom().scaleExtent([1, 7]).translateExtent([[-60, -60], [W + 60, H + 60]])
      .on("start", () => stageRef.current && stageRef.current.classList.add("drag"))
      .on("end", () => stageRef.current && stageRef.current.classList.remove("drag"))
      .on("zoom", (ev) => {
        gZoom.attr("transform", ev.transform);
        gPins.selectAll(".mkInner").attr("transform", `scale(${1 / ev.transform.k})`);
        gSeas.attr("opacity", Math.max(0, 1 - (ev.transform.k - 1) * .7));
      });
    svg.call(zoom).on("dblclick.zoom", null);
    svg.on("click", () => setActive(null));
    zoomApi.current = { svg, zoom };

    d3.json(ATLAS_URL).then((us) => {
      if (cancelled) return;
      const drop = new Set(["02", "15", "72"]);
      const feats = topojson.feature(us, us.objects.states).features.filter((s) => !drop.has(s.id));
      gStates.selectAll("path").data(feats).join("path")
        .attr("class", (d) => "state" + (litStates.has(STATE_ABBR[d.properties.name]) ? " lit" : "")).attr("d", geoPath);
      const outline = topojson.merge(us, us.objects.states.geometries.filter((g) => !drop.has(g.id)));
      gNation.append("path").attr("class", "nation").attr("d", geoPath(outline));
      buildPins();
      setLoaded(true);
    }).catch(() => { if (!cancelled) setFailed(true); });

    return () => { cancelled = true; svg.on(".zoom", null).on("click", null); svg.selectAll("*").remove(); };
  }, [cities, bestName]);

  useEffect(() => {
    const svg = svgRef.current && d3.select(svgRef.current);
    if (svg) svg.selectAll(".mk").classed("sel", function () { return this.getAttribute("data-city") === (active && active.name); });
  }, [active]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setActive(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const zoomBy = (k) => zoomApi.current && zoomApi.current.svg.transition().duration(300).call(zoomApi.current.zoom.scaleBy, k);
  const zoomReset = () => zoomApi.current && zoomApi.current.svg.transition().duration(450).call(zoomApi.current.zoom.transform, d3.zoomIdentity);

  const meta = `${profile?.profession || "Your profile"}${profile?.hasRemote ? " · Remote" : ""} · ${cities.length} cities · Drag to explore`;
  const a = active, pos = a && a.save >= 0, best = a && a.name === bestName;

  return (
    <div className="rm">
      <style>{CSS}</style>
      <div className="stage" ref={stageRef}>
        <div className="stars">{stars.map((s, i) => <i key={i} style={{ left: s.left + "%", top: s.top + "%", animationDelay: s.delay + "s" }} />)}</div>
        <svg ref={svgRef} className="map" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-label="Map of your matched US cities" />
        <div className="dawn" />
        <div className="vig" />
      </div>

      <div className="chrome">
        <div className="top">
          <div className="idblock">
            <Compass />
            <div>
              <div className="wm">Potential<span className="deg">°</span></div>
              <div className="meta">{meta}</div>
            </div>
          </div>
          <button className="edit" onClick={onEdit}>Edit profile</button>
        </div>
        <div className="hint"><b>Scroll</b> to zoom · <b>Drag</b> to pan · <b>Tap</b> a city</div>
        <div className="zoom">
          <button className="zb" aria-label="Zoom in" onClick={() => zoomBy(1.6)}>+</button>
          <button className="zb" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.6)}>−</button>
          <button className="zb reset" aria-label="Reset view" onClick={zoomReset}>
            <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      <aside className={"panel" + (a ? " open" : "")} aria-hidden={a ? "false" : "true"}>
        {a && (
          <>
            <button className="x" aria-label="Close" onClick={() => setActive(null)}>✕</button>
            <div className="rank">Match {String(rankOf[a.name] || 0).padStart(2, "0")} of {cities.length}</div>
            <h2>{a.name} <span className="st">{a.st}</span></h2>
            <div className="scorerow">
              <div className="scorebig">{a.score}<span className="pct">% match</span></div>
              {best && <span className="bestbadge">Best match</span>}
            </div>
            <div className="bar"><i style={{ width: a.score + "%" }} /></div>
            <p className="note">{noteFor(a, rankOf[a.name])}</p>
            <div className="stats">
              <div className="srow"><span className="k">Take-home / mo</span><span className="v">{fmt(a.takeHome)}</span></div>
              <div className="srow"><span className="k">Median rent / mo</span><span className="v">{fmt(a.rent)}</span></div>
              <div className="srow"><span className="k">Left to save / mo</span><span className={"v " + (pos ? "pos" : "neg")}>{pos ? "+" : "−"}{fmt(a.save)}<small>/mo</small></span></div>
            </div>
            <div className="acts">
              <button className="btn primary" onClick={() => onSelect(a.row)}>See full breakdown →</button>
              <button className="btn ghost" onClick={() => setActive(null)}>Back to map</button>
            </div>
          </>
        )}
      </aside>

      {!loaded && <div className="loading">{failed ? "Could not load map data" : "Plotting your cities…"}</div>}
    </div>
  );
}
