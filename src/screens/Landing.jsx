import { useEffect, useRef, useState } from "react";
import ambient from "../lib/ambientAudio.js";
import CompassLoader from "../components/CompassLoader.jsx";
import NavBar from "../components/NavBar.jsx";

// Top-nav destinations (hash routing, README §5). NavBar itself is owned by
// package 01; we mount it here against the frozen props (README §4).
const NAV_LINKS = [
  { label: "About", href: "#/about" },
  { label: "Pricing", href: "#/pricing" },
  { label: "FAQ", href: "#/faq" },
  { label: "Sign in", href: "#/login" },
];

// ═══════════════════════════════════════════════════════════════
// LANDING — cinematic night→dawn intro (ported from the prototype).
// Self-contained Canvas + CSS experience; markup is injected and the
// imperative animation/scroll/audio runs in a single effect with full
// cleanup. The final CTA ("See the other side") calls onEnter().
// ═══════════════════════════════════════════════════════════════

const MARKUP = `
<style>
  .lp *{margin:0;padding:0;box-sizing:border-box}
  html.lp-lock{scroll-behavior:smooth;scroll-snap-type:y mandatory}
  body.lp-lock-body{background:#070a11;overflow-x:hidden;-webkit-font-smoothing:antialiased}
  body.lp-locked{overflow:hidden;height:100vh}
  .lp{ --night-1:#070a11; --night-2:#0d1119; --dawn-top:#1c1a16; --dawn-mid:#3a2c1d; --dawn-glow:#caa05a;
    --gold:#e2b56b; --gold-soft:#d2a45a; --ivory:#f3ede1; --ivory-dim:rgba(243,237,225,.52); --ivory-faint:rgba(243,237,225,.22);
    --ease:cubic-bezier(.22,.61,.36,1); color:var(--ivory); font-family:'Manrope',sans-serif; cursor:default; }
  .lp .sky{position:fixed;inset:0;z-index:0;will-change:opacity}
  .lp .sky-night{background:radial-gradient(120% 80% at 50% 8%, #141b27 0%, var(--night-2) 38%, var(--night-1) 78%);opacity:1}
  .lp .sky-dawn{background:radial-gradient(80% 55% at 50% 86%, var(--dawn-glow) 0%, #6e4f2a 22%, var(--dawn-mid) 46%, var(--dawn-top) 74%, #0c0a08 100%);opacity:0}
  .lp .sun{position:fixed;left:50%;bottom:-12vh;width:60vw;height:60vw;transform:translateX(-50%) translateY(20vh);
    background:radial-gradient(circle, rgba(231,184,108,.55) 0%, rgba(231,184,108,.12) 36%, transparent 64%);z-index:0;opacity:0;pointer-events:none;filter:blur(6px);will-change:opacity,transform}
  .lp canvas#stage{position:fixed;inset:0;z-index:1;pointer-events:none}
  .lp .fog{position:fixed;inset:-20% -10%;z-index:2;pointer-events:none;opacity:0;mix-blend-mode:screen}
  .lp .fog span{position:absolute;border-radius:50%;filter:blur(60px);background:radial-gradient(circle, rgba(150,170,200,.18), transparent 70%);animation:lpdrift linear infinite}
  .lp .fog span:nth-child(1){width:60vw;height:38vw;left:-8vw;top:30vh;animation-duration:46s}
  .lp .fog span:nth-child(2){width:48vw;height:30vw;right:-6vw;top:48vh;animation-duration:62s;animation-direction:reverse}
  .lp .fog span:nth-child(3){width:70vw;height:40vw;left:18vw;top:62vh;animation-duration:78s}
  @keyframes lpdrift{0%{transform:translateX(-4vw) translateY(0)}50%{transform:translateX(6vw) translateY(-3vh)}100%{transform:translateX(-4vw) translateY(0)}}
  .lp .grain{position:fixed;inset:0;width:100%;height:100%;z-index:30;pointer-events:none;opacity:.05;mix-blend-mode:overlay}
  .lp .controls{position:fixed;right:30px;bottom:28px;z-index:25;display:flex;gap:12px}
  .lp .ctl{width:52px;height:52px;border-radius:50%;border:1px solid var(--ivory-faint);background:rgba(10,12,18,.35);backdrop-filter:blur(8px);color:var(--ivory-dim);display:grid;place-items:center;cursor:pointer;transition:.4s var(--ease)}
  .lp .ctl:hover{border-color:var(--gold);color:var(--gold);transform:translateY(-2px)}
  .lp .ctl svg{width:20px;height:20px}
  .lp .rail{position:fixed;right:38px;top:50%;transform:translateY(-50%);z-index:25;display:flex;flex-direction:column;gap:14px;opacity:0;transition:opacity 1s}
  .lp .rail i{width:6px;height:6px;border-radius:50%;background:var(--ivory-faint);transition:.5s}
  .lp .rail i.on{background:var(--gold);box-shadow:0 0 10px var(--gold)}
  /* Loader is now the shared brand CompassLoader, rendered as a React sibling
     of .lp (so .lp's innerHTML injection can't wipe it). No loader CSS here. */
  .lp .gate{position:relative;z-index:20;height:100vh;display:grid;place-items:center;text-align:center;scroll-snap-align:start;scroll-snap-stop:always}
  .lp .gate-inner{opacity:0;transform:translateY(18px);transition:1.4s var(--ease);transition-delay:.3s}
  .lp .gate-inner.in{opacity:1;transform:none}
  .lp .kicker{font-size:12.5px;letter-spacing:.42em;text-transform:uppercase;color:var(--gold-soft);font-weight:500;margin-bottom:26px}
  .lp .title{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(64px,13vw,184px);line-height:.92;letter-spacing:-.01em}
  .lp .tagline{font-family:'Instrument Serif',serif;font-style:italic;font-size:clamp(18px,2.4vw,30px);color:var(--ivory-dim);margin-top:14px}
  .lp .enter{margin-top:60px;display:inline-grid;place-items:center;position:relative;width:128px;height:128px;cursor:pointer;border-radius:50%}
  .lp .enter .ring{position:absolute;inset:0;border-radius:50%;border:1px solid var(--ivory-faint);transition:.6s var(--ease)}
  .lp .enter .ring.pulse{animation:lppulse 3.4s ease-out infinite}
  @keyframes lppulse{0%{transform:scale(1);opacity:.6}70%{transform:scale(1.35);opacity:0}100%{opacity:0}}
  .lp .enter span{font-size:13px;letter-spacing:.3em;text-transform:uppercase;color:var(--ivory);z-index:1;transition:.4s}
  .lp .enter:hover .ring{border-color:var(--gold);transform:scale(1.05)}
  .lp .enter:hover span{color:var(--gold)}
  .lp .hint{margin-top:30px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--ivory-faint);animation:lpbreathe 3s ease-in-out infinite}
  @keyframes lpbreathe{0%,100%{opacity:.3}50%{opacity:.7}}
  .lp .story{position:relative;z-index:20;display:none}
  .lp .story.show{display:block}
  .lp .scene{height:100vh;display:grid;place-items:center;padding:0 8vw;text-align:center;scroll-snap-align:start;scroll-snap-stop:always}
  .lp .line{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(30px,5.2vw,72px);line-height:1.12;max-width:16ch;margin:0 auto;opacity:0;transform:translateY(26px);transition:1.3s var(--ease)}
  .lp .line em{font-style:italic;color:var(--gold)}
  .lp .scene.in .line{opacity:1;transform:none}
  .lp .final .eyebrow{font-size:12.5px;letter-spacing:.4em;text-transform:uppercase;color:var(--gold-soft);margin-bottom:24px;display:block;opacity:0;transition:1.2s var(--ease)}
  .lp .final.in .eyebrow{opacity:1}
  /* Solid near-black scrim pill so the gold label stays legible over the
     bright dawn skyline glow behind this final scene (was a near-transparent
     fill that washed out against the light). */
  .lp .cta{margin-top:48px;display:inline-flex;align-items:center;gap:14px;padding:18px 40px;border:1px solid var(--gold);border-radius:100px;color:var(--gold);font-size:14px;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;background:rgba(8,10,14,.78);backdrop-filter:blur(8px);box-shadow:0 10px 34px rgba(0,0,0,.34);transition:.5s var(--ease);opacity:0;transform:translateY(20px)}
  .lp .final.in .cta{opacity:1;transform:none;transition-delay:.5s}
  .lp .cta:hover{background:var(--gold);color:#10100c;box-shadow:0 12px 40px rgba(226,181,107,.28);transform:translateY(-2px)}
  .lp .cta svg{width:18px;height:18px;transition:.4s}
  .lp .cta:hover svg{transform:translateX(5px)}
  .lp .cue{position:fixed;left:50%;bottom:30px;transform:translateX(-50%);z-index:24;text-align:center;color:var(--ivory-faint);opacity:0;transition:1s;pointer-events:none}
  .lp .cue.show{opacity:1}
  .lp .cue .arr{width:40px;height:40px;border:1px solid var(--ivory-faint);border-radius:50%;display:grid;place-items:center;margin:0 auto 10px;animation:lpbob 2.4s ease-in-out infinite}
  .lp .cue small{font-size:11px;letter-spacing:.24em;text-transform:uppercase}
  @keyframes lpbob{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}
  .lp .panel{position:fixed;right:30px;bottom:92px;z-index:26;width:236px;padding:20px;background:rgba(13,16,22,.82);backdrop-filter:blur(14px);border:1px solid var(--ivory-faint);border-radius:16px;opacity:0;transform:translateY(10px);pointer-events:none;transition:.4s var(--ease)}
  .lp .panel.open{opacity:1;transform:none;pointer-events:auto}
  .lp .panel h4{font-family:'Instrument Serif',serif;font-weight:400;font-size:19px;margin-bottom:14px}
  .lp .row{display:flex;align-items:center;justify-content:space-between;font-size:13px;color:var(--ivory-dim);padding:8px 0;font-weight:300}
  .lp .sw{width:40px;height:22px;border-radius:20px;background:rgba(255,255,255,.12);position:relative;cursor:pointer;transition:.3s;flex:none}
  .lp .sw.on{background:var(--gold)}
  .lp .sw::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:.3s}
  .lp .sw.on::after{left:21px}
  @media (prefers-reduced-motion: reduce){.lp *{animation:none!important}}
</style>
<div class="sky sky-night"></div>
<div class="sky sky-dawn" id="lpSkyDawn"></div>
<div class="sun" id="lpSun"></div>
<canvas id="stage"></canvas>
<div class="fog" id="lpFog"><span></span><span></span><span></span></div>
<svg class="grain"><filter id="lpn"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/></filter><rect width="100%" height="100%" filter="url(#lpn)"/></svg>
<div class="rail" id="lpRail"><i></i><i></i><i></i><i></i><i></i></div>
<div class="controls">
  <div class="ctl" id="lpSoundBtn" title="Ambient sound">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" id="lpSoundIcon"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M16 8c1.5 1.5 1.5 6.5 0 8" opacity=".5"/></svg>
  </div>
  <div class="ctl" id="lpGearBtn" title="Settings">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>
  </div>
</div>
<div class="panel" id="lpPanel">
  <h4>Experience</h4>
  <div class="row">Ambient sound <div class="sw" id="lpSwSound"></div></div>
  <div class="row">Reduced motion <div class="sw" id="lpSwMotion"></div></div>
  <div class="row" style="border-top:1px solid var(--ivory-faint);margin-top:6px;padding-top:14px;font-size:11px;line-height:1.5;color:var(--ivory-faint)">Prototype experience. Runs fully offline.</div>
</div>
<section class="gate">
  <div class="gate-inner" id="lpGateInner">
    <div class="kicker">A life simulator</div>
    <h1 class="title">Potential</h1>
    <div class="tagline">See the other side before you decide.</div>
    <div class="enter" id="lpEnterBtn"><div class="ring pulse"></div><div class="ring"></div><span>Enter</span></div>
    <div class="hint">Click enter to begin</div>
  </div>
</section>
<div class="story" id="lpStory">
  <section class="scene" data-i="1"><p class="line">There's a version of your life you <em>haven't met yet.</em></p></section>
  <section class="scene" data-i="2"><p class="line">A different city. Different work. <em>Different mornings.</em></p></section>
  <section class="scene" data-i="3"><p class="line">What if you could see it <em>before you choose?</em></p></section>
  <section class="scene final" data-i="4">
    <span class="eyebrow">This is Potential</span>
    <p class="line">We turn data into a window into the life that could be yours, and <em>the map to reach it.</em></p>
    <div class="cta" id="lpBeginBtn">See the other side<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
  </section>
</div>
<div class="cue" id="lpCue"><div class="arr"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 5v14M6 13l6 6 6-6"/></svg></div><small>Scroll to continue</small></div>
`;

export default function Landing({ onEnter }) {
  const ref = useRef(null);
  const onEnterRef = useRef(onEnter);
  onEnterRef.current = onEnter;

  // Loader lifecycle (CompassLoader is a React sibling of the .lp tree).
  const [loaded, setLoaded] = useState(false);
  const [loaderHiding, setLoaderHiding] = useState(false);
  const [showNav, setShowNav] = useState(false);
  // Gate the loader spin on the OS reduced-motion pref for now; swap to
  // useA11y().reduceMotion once package 03 lands (README §3).
  const [reduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const root = ref.current;
    root.innerHTML = MARKUP;
    document.documentElement.classList.add("lp-lock");
    document.body.classList.add("lp-lock-body", "lp-locked");
    window.scrollTo(0, 0);

    const q = (id) => root.querySelector(id);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let motionOff = reduced, running = true, raf = 0;

    // Loader lifecycle: the brand CompassLoader (a React sibling, see render)
    // holds, then fades while the gate is revealed, then unmounts. Reduced
    // motion shortens the hold and skips the gap so nothing lingers spinning.
    const LOAD_MS = motionOff ? 600 : 2000, FADE_MS = motionOff ? 200 : 1100;
    const loaderT1 = setTimeout(() => { setLoaderHiding(true); setShowNav(true); q("#lpGateInner").classList.add("in"); }, LOAD_MS);
    const loaderT2 = setTimeout(() => setLoaded(true), LOAD_MS + FADE_MS);

    // canvas
    const cv = q("#stage"), ctx = cv.getContext("2d");
    let W, H, dpr = Math.min(devicePixelRatio || 1, 2), stars = [], layers = [];
    function buildStars() { stars = []; const n = Math.round(innerWidth * innerHeight / 9000); for (let i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H * 0.82, r: (Math.random() * 1.3 + .3) * dpr, tw: Math.random() * Math.PI * 2, sp: .0008 + Math.random() * .0016, dx: (Math.random() - .5) * .02 * dpr }); }
    function buildSkyline() {
      layers = [];
      const defs = [{ shade: "#080b14", wlit: 0, scaleH: .55, gap: [3, 9], rim: .28 }, { shade: "#05070e", wlit: .06, scaleH: .82, gap: [5, 13], rim: .44 }, { shade: "#020306", wlit: .15, scaleH: 1.08, gap: [7, 17], rim: .62 }];
      for (const d of defs) {
        const bs = []; let x = -30 * dpr;
        while (x < W + 40 * dpr) {
          const w = (26 + Math.random() * 70) * dpr, h = (60 + Math.random() * 210) * d.scaleH * dpr, b = { x, w, h, roof: Math.random(), win: [] };
          if (d.wlit > 0) { const cols = Math.max(1, Math.floor(w / (10 * dpr))), rows = Math.max(1, Math.floor(h / (13 * dpr))); for (let c = 0; c < cols; c++) for (let r = 1; r < rows; r++) if (Math.random() < d.wlit) b.win.push([(c + .5) / cols, (r + .4) / rows]); }
          bs.push(b); x += w + (d.gap[0] + Math.random() * (d.gap[1] - d.gap[0])) * dpr;
        }
        layers.push({ ...d, bs });
      }
    }
    function resize() { W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px"; buildStars(); buildSkyline(); }
    resize();

    function drawBuilding(b, by) { ctx.fillRect(b.x, by, b.w, b.h); const r = b.roof, cx = b.x + b.w / 2; if (r < .22) ctx.fillRect(cx - .8 * dpr, by - 14 * dpr, 1.6 * dpr, 14 * dpr); else if (r < .46) ctx.fillRect(b.x + b.w * .22, by - 9 * dpr, b.w * .56, 9 * dpr); else if (r < .58) ctx.fillRect(b.x + b.w * .62, by - 11 * dpr, 4 * dpr, 11 * dpr); }

    const skyDawn = q("#lpSkyDawn"), sun = q("#lpSun"), fog = q("#lpFog"), rail = q("#lpRail"),
      railDots = [...rail.querySelectorAll("i")], cue = q("#lpCue"), scenes = [...root.querySelectorAll(".scene")];

    let prog = 0, targetProg = 0;
    function render() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      prog += (targetProg - prog) * (motionOff ? 1 : .07);
      if (Math.abs(targetProg - prog) < .0004) prog = targetProg;
      skyDawn.style.opacity = prog; fog.style.opacity = Math.sin(prog * Math.PI) * .8;
      const spv = Math.max(0, (prog - .4) / .6); sun.style.opacity = spv; sun.style.transform = `translateX(-50%) translateY(${(1 - spv) * 22}vh)`;
      for (const st of stars) { st.tw += st.sp * (motionOff ? 0 : 16); st.x += motionOff ? 0 : st.dx; if (st.x < 0) st.x = W; if (st.x > W) st.x = 0; const tw = .5 + Math.sin(st.tw) * .5, fade = 1 - prog, warm = prog, r = 243, g = Math.round(237 - warm * 70), b = Math.round(225 - warm * 150); ctx.globalAlpha = tw * fade * .9; ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 7); ctx.fill(); }
      if (prog > .4) { const a = Math.min(1, (prog - .4) / .5); let li = 0; for (const L of layers) { const lift = (1 - a) * (50 + li * 22) * dpr; ctx.globalAlpha = a; ctx.fillStyle = L.shade; for (const b of L.bs) drawBuilding(b, H - b.h + lift); ctx.globalAlpha = a * L.rim; ctx.fillStyle = "rgba(231,184,108,.6)"; for (const b of L.bs) ctx.fillRect(b.x, H - b.h + lift, b.w, 1.4 * dpr); if (L.wlit > 0) { ctx.globalAlpha = a * .9; ctx.fillStyle = "rgba(255,206,135,.85)"; for (const b of L.bs) { const by = H - b.h + lift; for (const w of b.win) ctx.fillRect(b.x + w[0] * b.w, by + w[1] * b.h, 1.5 * dpr, 2.1 * dpr); } } li++; } }
      ctx.globalAlpha = 1; raf = requestAnimationFrame(render);
    }
    raf = requestAnimationFrame(render);

    let started = false;
    function onScroll() { const max = document.documentElement.scrollHeight - innerHeight; targetProg = max > 0 ? Math.min(1, scrollY / max) : 0; const seg = Math.min(railDots.length - 1, Math.round(targetProg * (railDots.length - 1))); railDots.forEach((d, i) => d.classList.toggle("on", i <= seg)); cue.classList.toggle("show", started && targetProg < .12); }

    // slow, eased scroll into the first pane (native smooth + snap are too fast/abrupt)
    function smoothScrollTo(targetY, dur) {
      const startY = window.scrollY, dist = targetY - startY, t0 = performance.now();
      const html = document.documentElement, prevSnap = html.style.scrollSnapType, prevBeh = html.style.scrollBehavior;
      html.style.scrollSnapType = "none"; html.style.scrollBehavior = "auto"; // don't fight the tween
      function frame(now) {
        if (!running) { html.style.scrollSnapType = prevSnap; html.style.scrollBehavior = prevBeh; return; }
        const t = Math.min(1, (now - t0) / dur);
        const e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
        window.scrollTo(0, startY + dist * e);
        if (t < 1) requestAnimationFrame(frame);
        else { html.style.scrollSnapType = prevSnap; html.style.scrollBehavior = prevBeh; }
      }
      requestAnimationFrame(frame);
    }
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); }), { threshold: .4 });
    scenes.forEach(sc => io.observe(sc));

    function begin() {
      if (started) return; started = true;
      document.body.classList.remove("lp-locked"); q("#lpStory").classList.add("show"); rail.style.opacity = 1; startAudio();
      const sc = root.querySelector('.scene[data-i="1"]');
      const targetY = sc.getBoundingClientRect().top + window.scrollY;
      if (motionOff) window.scrollTo(0, targetY);
      else smoothScrollTo(targetY, 2000); // ~2s slow cinematic glide
      setTimeout(onScroll, 50);
    }
    q("#lpEnterBtn").addEventListener("click", begin);
    q("#lpBeginBtn").addEventListener("click", () => { const b = q("#lpBeginBtn"); b.style.transform = "scale(.96)"; setTimeout(() => { b.style.transform = ""; onEnterRef.current && onEnterRef.current(); }, 150); });

    // Ambient audio is an app-wide singleton (../lib/ambientAudio.js) so it keeps
    // playing seamlessly across screen changes — Landing only drives the controls.
    const startAudio = () => ambient.start();

    const soundBtn = q("#lpSoundBtn"), soundIcon = q("#lpSoundIcon"), swSound = q("#lpSwSound"), swMotion = q("#lpSwMotion");
    const syncSound = (on) => { swSound.classList.toggle("on", on); soundIcon.style.opacity = on ? 1 : .4; };
    syncSound(ambient.isEnabled()); swMotion.classList.toggle("on", motionOff);
    function setSound(on) { ambient.setEnabled(on); syncSound(on); }
    soundBtn.addEventListener("click", () => setSound(!ambient.isEnabled()));
    swSound.addEventListener("click", () => setSound(!ambient.isEnabled()));
    swMotion.addEventListener("click", () => { motionOff = !motionOff; swMotion.classList.toggle("on", motionOff); });
    const gearBtn = q("#lpGearBtn"), panel = q("#lpPanel");
    gearBtn.addEventListener("click", () => panel.classList.toggle("open"));

    const onKey = (e) => { if (e.key === "Enter") begin(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKey);

    return () => {
      running = false; cancelAnimationFrame(raf); clearTimeout(loaderT1); clearTimeout(loaderT2); io.disconnect();
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", resize); window.removeEventListener("keydown", onKey);
      // NB: ambient audio is intentionally NOT torn down here — it's an app-wide
      // singleton that must keep playing across screen changes.
      document.documentElement.classList.remove("lp-lock");
      document.body.classList.remove("lp-lock-body", "lp-locked");
      if (root) root.innerHTML = "";
    };
  }, []);

  return (
    <>
      <div className="lp" ref={ref} />
      {showNav && <NavBar links={NAV_LINKS} transparent />}
      {!loaded && <CompassLoader reduceMotion={reduceMotion} hiding={loaderHiding} />}
    </>
  );
}
