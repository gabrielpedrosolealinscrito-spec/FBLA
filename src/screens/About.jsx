import NavBar from "../components/NavBar.jsx";

// ═══════════════════════════════════════════════════════════════
// ABOUT — what Potential is and why it exists (package 01).
// Mounts the shared NavBar (solid). Brand: gold-on-near-black, Instrument
// Serif headings, Manrope body, inline line-icons. No emojis (README §6).
// ═══════════════════════════════════════════════════════════════

const CSS = `
.ab{ --night-1:#070a11; --night-2:#0d1119; --panel:#10141d; --gold:#e2b56b; --gold-soft:#d2a45a;
  --ivory:#f3ede1; --ivory-dim:rgba(243,237,225,.62); --ivory-faint:rgba(243,237,225,.30);
  --line:rgba(243,237,225,.10); --ease:cubic-bezier(.22,.61,.36,1);
  position:relative;min-height:100vh;background:var(--night-1);color:var(--ivory);
  font-family:'Manrope',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.ab *{margin:0;padding:0;box-sizing:border-box}
.ab .sky{position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(120% 90% at 50% -10%, #141b27 0%, var(--night-2) 40%, var(--night-1) 80%)}
.ab .glow{position:fixed;left:50%;top:2vh;width:70vw;height:50vh;transform:translateX(-50%);
  background:radial-gradient(circle at 50% 40%, rgba(226,181,107,.10) 0%, rgba(226,181,107,.03) 38%, transparent 64%);
  z-index:0;pointer-events:none;filter:blur(10px)}
.ab .wrap{position:relative;z-index:10;max-width:760px;margin:0 auto;padding:140px 28px 100px}

.ab .kicker{font-size:11.5px;letter-spacing:.32em;text-transform:uppercase;color:var(--gold-soft);
  font-weight:500;text-align:center;margin-bottom:20px}
.ab h1{font-family:'Instrument Serif',serif;font-weight:400;letter-spacing:-.015em;
  font-size:clamp(40px,7vw,72px);line-height:1.02;text-align:center}
.ab h1 em{font-style:italic;color:var(--gold)}
.ab .lede{font-size:clamp(16px,2.1vw,19px);line-height:1.6;color:var(--ivory-dim);font-weight:300;
  text-align:center;max-width:60ch;margin:26px auto 0}

.ab .section{margin-top:64px}
.ab h2{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(24px,3.4vw,34px);
  letter-spacing:-.01em;margin-bottom:18px}
.ab h2 em{font-style:italic;color:var(--gold)}
.ab p{font-size:15.5px;line-height:1.7;color:var(--ivory-dim);font-weight:300}
.ab p + p{margin-top:14px}
.ab strong{color:var(--ivory);font-weight:500}

.ab .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:40px}
.ab .step{background:linear-gradient(180deg,var(--panel) 0%,var(--night-2) 100%);
  border:1px solid var(--line);border-radius:18px;padding:26px 22px}
.ab .step .ic{width:38px;height:38px;color:var(--gold);margin-bottom:16px}
.ab .step .ic svg{width:100%;height:100%}
.ab .step h3{font-family:'Instrument Serif',serif;font-weight:400;font-size:20px;margin-bottom:8px}
.ab .step p{font-size:13.5px;line-height:1.55}

.ab .note{margin-top:56px;border:1px solid var(--line);border-radius:16px;padding:24px 26px;
  background:rgba(255,255,255,.02)}
.ab .note h4{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold-soft);
  font-weight:600;margin-bottom:10px}
.ab .note p{font-size:13.5px;line-height:1.6}

.ab .cta{margin-top:64px;text-align:center}
.ab .cta a{display:inline-flex;align-items:center;gap:12px;padding:16px 36px;border-radius:100px;
  border:1px solid var(--gold);color:var(--gold);font-size:13px;letter-spacing:.14em;text-transform:uppercase;
  font-weight:600;text-decoration:none;background:rgba(226,181,107,.04);transition:.4s var(--ease)}
.ab .cta a:hover{background:var(--gold);color:#10100c;transform:translateY(-2px);
  box-shadow:0 14px 40px -12px rgba(226,181,107,.5)}

@media (max-width:640px){.ab .steps{grid-template-columns:1fr}}
`;

export default function About() {
  return (
    <div className="ab">
      <style>{CSS}</style>
      <div className="sky" />
      <div className="glow" />
      <NavBar />

      <main className="wrap">
        <div className="kicker">About Potential</div>
        <h1>See the other side <em>before you decide.</em></h1>
        <p className="lede">
          Potential is a life simulator. Tell it who you are and what you want, and it shows you the
          cities where your money, your work, and your days would actually look different, then hands
          you the map to get there.
        </p>

        <section className="section">
          <h2>Why we built it</h2>
          <p>
            Most people choose where to live by accident: a job offer, a partner, a city they happened
            to visit. The biggest decision about your life is usually the least researched. The numbers
            that matter, like what you'd take home, what rent really costs, and what's left at the end of the
            month, are scattered across a dozen tabs and rarely add up to a clear picture.
          </p>
          <p>
            <strong>Potential puts the whole picture in one place.</strong> It models your finances and
            your life in real cities, ranks the ones that fit, and for those ready to move, lays out the
            relocation and immigration path step by step.
          </p>
        </section>

        <section className="section">
          <h2>How it <em>works</em></h2>
          <div className="steps">
            <div className="step">
              <div className="ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h3>Profile</h3>
              <p>A short quiz captures your work, income, lifestyle, and what you're optimizing for.</p>
            </div>
            <div className="step">
              <div className="ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="12" cy="12" r="9" /><path d="M14.5 9.5l-2 5-5 2 2-5 5-2z" /><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <h3>Match</h3>
              <p>We score real US and international cities against you and rank your best fits.</p>
            </div>
            <div className="step">
              <div className="ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" /><path d="M9 3v15M15 6v15" />
                </svg>
              </div>
              <h3>Roadmap</h3>
              <p>For your top cities: the financial breakdown, and a step-by-step plan to get there.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>Built for the move that matters</h2>
          <p>
            Whether you're weighing a city two states over or a country across an ocean, the harder the
            decision, the more it pays to see it first. Potential is for the person who wants the other
            life on the table, measured rather than imagined, before they commit to it.
          </p>
        </section>

        <div className="note">
          <h4>An honest note</h4>
          <p>
            Potential is a planning tool, not financial, tax, immigration, or legal advice. Our numbers
            are estimates built to inform your thinking, so verify anything that drives a real decision
            with a qualified professional.
          </p>
        </div>

        <div className="cta">
          <a href="#/faq">Read the FAQ</a>
        </div>
      </main>
    </div>
  );
}
