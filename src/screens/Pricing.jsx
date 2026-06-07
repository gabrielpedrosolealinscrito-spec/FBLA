// ═══════════════════════════════════════════════════════════════
// PRICING — "Start now, upgrade later" (ported from sketches/pricing-upgrade.html)
// Run-based, one-time tiers (business-model D-05). Layout modeled on the
// NEWFLUX/ViewFlux reference, re-skinned in the Potential gold palette.
// Centerpiece is a two-layer compass (rose + tick ring) that counter-rotates.
// Reached at #/pricing via the hash router in App.jsx. Fonts load from index.html.
// CTAs route into the free quiz flow for now — checkout lands in Phase 8.
// ═══════════════════════════════════════════════════════════════

// ── Tiers (business-model D-05 — still subject to change) ──
const TIERS = [
  { name: 'Basic', runs: '1 run', price: '0.99', cta: 'Choose Basic', solid: false, feature: false,
    feats: ['Your single best-fit city', 'Complete financial snapshot', 'Take-home · expenses · savings'] },
  { name: 'Plus', runs: '3 runs', price: '9.99', cta: 'Choose Plus', solid: true, feature: true,
    feats: ['Full ranked list, US & international', 'Live-AI: jobs, housing, day-in-the-life', 'Personalized relocation roadmap'] },
  { name: 'Premium', runs: 'Unlimited runs', price: '29.99', cta: 'Choose Premium', solid: false, feature: false,
    feats: ['Everything in Plus', 'Immigration & visa concierge', 'Pathways, checklists & referrals'] },
];

// ── Compass geometry (computed once at module scope) ──
const C = 100;
const round = (n) => Number(n).toFixed(2);
const RING = '#8a6a38';

// outer double ring + 72 tick marks (cardinals longer/thicker)
const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = (i / 72) * Math.PI * 2 - Math.PI / 2;
  const cardinal = i % 18 === 0;
  const r1 = 72, r2 = cardinal ? 87 : 78;
  return {
    x1: round(C + Math.cos(a) * r1), y1: round(C + Math.sin(a) * r1),
    x2: round(C + Math.cos(a) * r2), y2: round(C + Math.sin(a) * r2),
    w: cardinal ? 1.5 : 0.7, key: i,
  };
});

// one rose point → two triangle faces (light + dark) for the two-tone look
function point(angleDeg, len, half) {
  const a = (angleDeg - 90) * Math.PI / 180;
  const ax = Math.cos(a), ay = Math.sin(a), px = -ay, py = ax;
  const tip = `${round(C + ax * len)},${round(C + ay * len)}`;
  const bl = `${round(C + px * half)},${round(C + py * half)}`;
  const br = `${round(C - px * half)},${round(C - py * half)}`;
  return { light: `${tip} ${bl} ${C},${C}`, dark: `${tip} ${br} ${C},${C}` };
}
const LIGHT = '#efdca9', DARK = '#c89a4f', LIGHT2 = '#e7c987', DARK2 = '#b07f3a';
const BACK_PTS = [45, 135, 225, 315].map((ang) => point(ang, 40, 7));        // intercardinal (shorter)
const FRONT_PTS = [[0, 66], [90, 58], [180, 60], [270, 58]].map(([ang, len]) => point(ang, len, 10)); // cardinal, N longest

const CSS = `
.pp{ --night-1:#070a11; --night-2:#0d1119; --panel:#10141d; --gold:#e2b56b; --gold-soft:#d2a45a;
  --ivory:#f3ede1; --ivory-dim:rgba(243,237,225,.56); --ivory-faint:rgba(243,237,225,.20);
  --line:rgba(243,237,225,.10); --ease:cubic-bezier(.22,.61,.36,1);
  position:relative; min-height:100vh; background:var(--night-1); color:var(--ivory);
  font-family:'Manrope',sans-serif; -webkit-font-smoothing:antialiased; overflow-x:hidden; }
.pp *{margin:0;padding:0;box-sizing:border-box}
.pp .sky{position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(120% 90% at 50% -10%, #141b27 0%, var(--night-2) 40%, var(--night-1) 80%)}
.pp .glow{position:fixed;left:50%;top:8vh;width:70vw;height:60vh;transform:translateX(-50%);
  background:radial-gradient(circle at 50% 40%, rgba(226,181,107,.14) 0%, rgba(226,181,107,.04) 36%, transparent 64%);
  z-index:0;pointer-events:none;filter:blur(10px)}
.pp .grain{position:fixed;inset:0;width:100%;height:100%;z-index:40;pointer-events:none;opacity:.045;mix-blend-mode:overlay}

.pp .nav{position:relative;z-index:25;display:flex;align-items:center;justify-content:space-between;
  max-width:1120px;margin:0 auto;padding:30px 32px}
.pp .brand{font-family:'Instrument Serif',serif;font-size:25px;letter-spacing:.5px;color:var(--ivory);
  text-decoration:none;background:none;border:none;cursor:pointer}
.pp .brand small{font-style:italic;opacity:.6;font-size:14px;margin-left:1px}
.pp .nav-links{display:flex;gap:34px;align-items:center}
.pp .nav-links a{font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ivory-dim);
  text-decoration:none;transition:.35s var(--ease)}
.pp .nav-links a:hover{color:var(--gold)}
.pp .nav-links a.active{color:var(--gold-soft)}

.pp .wrap{position:relative;z-index:10;max-width:1120px;margin:0 auto;padding:40px 32px 90px}

.pp .hero{position:relative;text-align:center;margin:34px 0 0;height:300px}
.pp .hero h1{font-family:'Instrument Serif',serif;font-weight:400;letter-spacing:-.015em;
  font-size:clamp(52px,9vw,108px);line-height:.96;position:relative;z-index:3}
.pp .hero h1 .l1{display:block;color:var(--ivory)}
.pp .hero h1 .l2{display:block;font-style:italic;color:var(--gold)}
.pp .hero .tagline{position:relative;z-index:3;margin:18px auto 0;max-width:44ch;
  font-size:14px;line-height:1.6;color:var(--ivory-dim);font-weight:300}
.pp .geo{margin-top:6px;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--ivory-faint);font-weight:500}
.pp .geo.intl{color:var(--gold-soft)}

.pp .compass{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);
  width:320px;height:320px;z-index:2;opacity:.92;pointer-events:none;
  filter:drop-shadow(0 8px 44px rgba(226,181,107,.22))}
.pp .compass .ring,.pp .compass .rose{transform-box:fill-box;transform-origin:center}
.pp .compass .ring{animation:pp-spin-cw 120s linear infinite}
.pp .compass .rose{animation:pp-spin-ccw 72s linear infinite}
@keyframes pp-spin-cw{to{transform:rotate(360deg)}}
@keyframes pp-spin-ccw{to{transform:rotate(-360deg)}}

.pp .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:18px;align-items:end}
.pp .card{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;
  padding:38px 28px 32px;border-radius:20px;
  background:linear-gradient(180deg,var(--panel) 0%,var(--night-2) 100%);
  border:1px solid var(--line);opacity:1;
  animation:pp-fade .7s var(--ease) both;
  transition:border-color .4s,box-shadow .4s,transform .4s var(--ease)}
.pp .card:nth-child(1){animation-delay:.05s}
.pp .card:nth-child(2){animation-delay:.16s}
.pp .card:nth-child(3){animation-delay:.27s}
@keyframes pp-fade{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
.pp .card:hover{border-color:rgba(226,181,107,.32);transform:translateY(-5px)}

.pp .card.feature{padding-top:52px;padding-bottom:40px;
  background:linear-gradient(180deg,#1a1710 0%,#120f0b 100%);
  border-color:rgba(226,181,107,.45);box-shadow:0 30px 80px -30px rgba(226,181,107,.42)}
.pp .card.feature:hover{border-color:var(--gold)}
.pp .badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);
  padding:6px 16px;border-radius:100px;background:var(--gold);color:#15110a;
  font-size:10px;letter-spacing:.18em;text-transform:uppercase;font-weight:600;white-space:nowrap;
  box-shadow:0 8px 24px -6px rgba(226,181,107,.6)}

.pp .tier-name{font-family:'Instrument Serif',serif;font-size:27px;font-weight:400;letter-spacing:.3px}
.pp .runs{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold-soft);font-weight:500;margin-top:8px}
.pp .runs.x{color:var(--ivory-faint)}
.pp .feats{list-style:none;display:flex;flex-direction:column;gap:11px;margin:22px 0 26px}
.pp .feats li{font-size:13px;font-weight:300;color:var(--ivory-dim);line-height:1.4}
.pp .feature .feats li{color:var(--ivory)}
.pp .price{display:flex;align-items:flex-start;justify-content:center;gap:2px;margin-top:auto}
.pp .price .cur{font-size:22px;color:var(--ivory-dim);margin-top:8px}
.pp .price .amt{font-family:'Instrument Serif',serif;font-size:56px;line-height:.9;font-weight:400}
.pp .feature .price .amt{color:var(--gold)}
.pp .per{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ivory-faint);margin-top:8px}

.pp .pick{margin-top:24px;width:100%;padding:13px 18px;border-radius:100px;cursor:pointer;
  font-family:'Manrope';font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;font-weight:500;
  background:transparent;border:1px solid var(--ivory-faint);color:var(--ivory);transition:.45s var(--ease)}
.pp .pick:hover{border-color:var(--gold);color:var(--gold);background:rgba(226,181,107,.05)}
.pp .pick.solid{background:var(--gold);border-color:var(--gold);color:#15110a;font-weight:600}
.pp .pick.solid:hover{box-shadow:0 14px 40px -12px rgba(226,181,107,.55);transform:translateY(-1px);background:var(--gold)}

.pp .free{margin-top:64px;text-align:center}
.pp .free h2{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(26px,3.6vw,40px);letter-spacing:-.01em}
.pp .free h2 em{font-style:italic;color:var(--gold)}
.pp .free p{font-size:13.5px;color:var(--ivory-dim);font-weight:300;margin-top:12px}
.pp .form{display:flex;justify-content:center;gap:10px;margin-top:28px;flex-wrap:wrap}
.pp .form input{width:300px;max-width:80vw;padding:15px 20px;border-radius:100px;
  background:rgba(255,255,255,.03);border:1px solid var(--line);color:var(--ivory);
  font-family:'Manrope';font-size:14px;font-weight:300;transition:.35s var(--ease)}
.pp .form input::placeholder{color:var(--ivory-faint)}
.pp .form input:focus{outline:none;border-color:var(--gold-soft);background:rgba(255,255,255,.05)}
.pp .form button{padding:15px 30px;border-radius:100px;border:none;cursor:pointer;
  background:var(--gold);color:#15110a;font-family:'Manrope';font-weight:600;font-size:12.5px;
  letter-spacing:.12em;text-transform:uppercase;transition:.45s var(--ease)}
.pp .form button:hover{box-shadow:0 14px 40px -12px rgba(226,181,107,.55);transform:translateY(-1px)}
.pp .micro{margin-top:22px;font-size:11px;letter-spacing:.04em;color:var(--ivory-faint);font-weight:300}

@media (max-width:880px){
  .pp .grid{grid-template-columns:1fr;gap:16px;align-items:stretch}
  .pp .card.feature{order:-1}
  .pp .compass{width:220px;height:220px}
  .pp .hero{height:230px}
}
@media (prefers-reduced-motion: reduce){
  .pp *{animation:none!important;transition:none!important}
}
`;

// ── Going-global variant copy (#/pricing/global) ──
// DISPLAY-ONLY: surfaces the minimum plan required for international results so
// package 04's global gate can link straight here. The real §1 'global' tier
// gate is package 05's job — this page enforces nothing. International results
// unlock at the Plus tier (its "US & international" ranked list); Basic is
// US-only. Tier display copy stays in sync with PricingModal.jsx by intent.
const COPY = {
  default: { l1: 'Start now,', l2: 'upgrade later.', tagline: null },
  global: {
    l1: 'Going global.', l2: 'the world, mapped.',
    tagline: 'International cities unlock at Plus, the minimum plan for going global.',
  },
};

export default function Pricing({ variant = 'default' }) {
  const isGlobal = variant === 'global';
  const copy = isGlobal ? COPY.global : COPY.default;

  // No checkout yet (Phase 8) — every CTA starts the free run by returning to the app.
  const startRun = () => { window.location.hash = ''; };

  return (
    <div className="pp">
      <style>{CSS}</style>
      <div className="sky" />
      <div className="glow" />
      <svg className="grain"><filter id="ppNoise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" /></filter><rect width="100%" height="100%" filter="url(#ppNoise)" /></svg>

      <nav className="nav">
        <button className="brand" onClick={startRun}>Potential <small>°</small></button>
        <div className="nav-links">
          <a href="#/about">About</a>
          <a href="#/faq">FAQ</a>
          <a href="#/pricing" className="active">Pricing</a>
          <a href="#/login">Login</a>
        </div>
      </nav>

      <main className="wrap">
        <section className="hero">
          <svg className="compass" viewBox="0 0 200 200" aria-hidden="true">
            <g className="ring">
              <circle cx="100" cy="100" r="94" fill="none" stroke={RING} strokeWidth=".9" />
              <circle cx="100" cy="100" r="70" fill="none" stroke={RING} strokeWidth=".9" opacity=".85" />
              {TICKS.map((t) => (
                <line key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={RING} strokeWidth={t.w} />
              ))}
            </g>
            <g className="rose">
              {BACK_PTS.map((p, i) => (
                <g key={`b${i}`}>
                  <polygon points={p.light} fill={LIGHT2} />
                  <polygon points={p.dark} fill={DARK2} />
                </g>
              ))}
              {FRONT_PTS.map((p, i) => (
                <g key={`f${i}`}>
                  <polygon points={p.light} fill={LIGHT} />
                  <polygon points={p.dark} fill={DARK} />
                </g>
              ))}
              <circle cx="100" cy="100" r="8.5" fill="#caa15a" />
              <circle cx="100" cy="100" r="2.8" fill="#0a0d14" />
            </g>
          </svg>
          <h1>
            <span className="l1">{copy.l1}</span>
            <span className="l2">{copy.l2}</span>
          </h1>
          {copy.tagline && <p className="tagline">{copy.tagline}</p>}
        </section>

        <section className="grid">
          {TIERS.map((t) => {
            const runsClass = t.runs.includes('run') && !t.runs.includes('Unlimited') ? 'runs' : 'runs x';
            // Global variant only: which tiers reach international cities. Plus is
            // the first to ("US & international"), so it's the minimum global plan.
            const intl = t.feats.some((f) => /international/i.test(f)) || t.name === 'Premium';
            const badge = isGlobal ? (t.feature ? 'Minimum for international' : null) : (t.feature ? 'Most popular' : null);
            return (
              <article key={t.name} className={`card${t.feature ? ' feature' : ''}`}>
                {badge && <div className="badge">{badge}</div>}
                <div className="tier-name">{t.name}</div>
                <div className={runsClass}>{t.runs}</div>
                {isGlobal && <div className={`geo${intl ? ' intl' : ''}`}>{intl ? 'US + International' : 'US cities only'}</div>}
                <ul className="feats">{t.feats.map((f) => <li key={f}>{f}</li>)}</ul>
                <div className="price"><span className="cur">$</span><span className="amt">{t.price}</span></div>
                <div className="per">one-time</div>
                <button className={`pick${t.solid ? ' solid' : ''}`} onClick={startRun}>{t.cta}</button>
              </article>
            );
          })}
        </section>

        <section className="free">
          <h2>Start with a <em>free</em> run. No card required.</h2>
          <p>Take the quiz and see your #1 match city today, then unlock the rest whenever you're ready.</p>
          <form className="form" onSubmit={(e) => { e.preventDefault(); startRun(); }}>
            <input type="email" placeholder="you@email.com" aria-label="Email" />
            <button type="submit">Start free</button>
          </form>
          <p className="micro">Your runs never expire · One-time payment, no subscription</p>
        </section>
      </main>
    </div>
  );
}
