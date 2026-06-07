import NavBar from "../components/NavBar.jsx";

// ═══════════════════════════════════════════════════════════════
// FAQ — package 01. Covers the four required topics: what Potential is,
// premium vs free, data/privacy, and the "not financial advice" line.
// Brand: gold-on-near-black, Instrument Serif headings, Manrope body,
// line-icon chevrons (native <details>). No emojis (README §6).
// ═══════════════════════════════════════════════════════════════

const FAQS = [
  {
    q: "What is Potential?",
    a: "Potential is a life simulator. You answer a short quiz about your work, income, and what you " +
       "want from daily life, and it matches you to real cities, in the US and internationally, where " +
       "your finances and lifestyle would actually look different. For your best-fit cities it shows the " +
       "full money breakdown and a step-by-step relocation roadmap, including the immigration path.",
  },
  {
    q: "What's the difference between free and premium?",
    a: "The free run gives you your single best-fit city with a complete financial snapshot: take-home, " +
       "expenses, and savings. Paid tiers unlock the full ranked list (US and international), live AI " +
       "insights on jobs, housing, and a day in the life, your personalized relocation roadmap, and the " +
       "immigration and visa concierge. Paid runs are one-time and never expire, with no subscription.",
  },
  {
    q: "What does international (\"Going Global\") add?",
    a: "Going Global opens up international cities and the questions that make those matches meaningful: " +
       "visa eligibility, cost-of-living conversion, and the relocation path abroad. You can see the " +
       "minimum plan required for international results on the Going Global pricing page.",
  },
  {
    q: "What do you do with my data?",
    a: "Your answers power your matches and nothing else. We don't sell your personal data. Your quiz " +
       "responses and results are tied to your account so you can save and resume; you can sign out at " +
       "any time. We ask for your birthday (not just your age) only to tailor your results accurately.",
  },
  {
    q: "How accurate are the numbers?",
    a: "We model cost of living, take-home pay, housing, and savings from real data sources and your " +
       "profile. They're well-researched estimates meant to make the comparison between cities honest and " +
       "useful, not penny-exact guarantees. Treat them as a strong starting point for your own diligence.",
  },
  {
    q: "Is this financial or immigration advice?",
    a: "No. Potential is a planning tool, not financial, tax, immigration, or legal advice. Nothing here " +
       "is a recommendation to make a specific financial or relocation decision. Before you act on " +
       "anything that matters, confirm it with a qualified professional in that field.",
  },
];

const CSS = `
.fq{ --night-1:#070a11; --night-2:#0d1119; --panel:#10141d; --gold:#e2b56b; --gold-soft:#d2a45a;
  --ivory:#f3ede1; --ivory-dim:rgba(243,237,225,.62); --ivory-faint:rgba(243,237,225,.30);
  --line:rgba(243,237,225,.10); --ease:cubic-bezier(.22,.61,.36,1);
  position:relative;min-height:100vh;background:var(--night-1);color:var(--ivory);
  font-family:'Manrope',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.fq *{margin:0;padding:0;box-sizing:border-box}
.fq .sky{position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(120% 90% at 50% -10%, #141b27 0%, var(--night-2) 40%, var(--night-1) 80%)}
.fq .glow{position:fixed;left:50%;top:2vh;width:70vw;height:46vh;transform:translateX(-50%);
  background:radial-gradient(circle at 50% 40%, rgba(226,181,107,.09) 0%, rgba(226,181,107,.03) 38%, transparent 64%);
  z-index:0;pointer-events:none;filter:blur(10px)}
.fq .wrap{position:relative;z-index:10;max-width:720px;margin:0 auto;padding:140px 28px 100px}

.fq .kicker{font-size:11.5px;letter-spacing:.32em;text-transform:uppercase;color:var(--gold-soft);
  font-weight:500;text-align:center;margin-bottom:18px}
.fq h1{font-family:'Instrument Serif',serif;font-weight:400;letter-spacing:-.015em;
  font-size:clamp(40px,7vw,68px);line-height:1.02;text-align:center}
.fq h1 em{font-style:italic;color:var(--gold)}
.fq .intro{text-align:center;font-size:15px;color:var(--ivory-dim);font-weight:300;margin:22px auto 0;max-width:52ch;line-height:1.6}

.fq .list{margin-top:48px;display:flex;flex-direction:column;gap:12px}
.fq details{background:linear-gradient(180deg,var(--panel) 0%,var(--night-2) 100%);
  border:1px solid var(--line);border-radius:14px;overflow:hidden;transition:border-color .3s var(--ease)}
.fq details[open]{border-color:rgba(226,181,107,.30)}
.fq summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;
  gap:16px;padding:20px 22px;font-family:'Instrument Serif',serif;font-size:19px;font-weight:400;color:var(--ivory)}
.fq summary::-webkit-details-marker{display:none}
.fq summary .chev{flex:none;width:18px;height:18px;color:var(--gold-soft);transition:transform .3s var(--ease)}
.fq details[open] summary .chev{transform:rotate(180deg)}
.fq .answer{padding:0 22px 22px;font-size:14.5px;line-height:1.7;color:var(--ivory-dim);font-weight:300}

.fq .cta{margin-top:52px;text-align:center}
.fq .cta a{display:inline-flex;align-items:center;gap:12px;padding:15px 34px;border-radius:100px;
  border:1px solid var(--gold);color:var(--gold);font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;
  font-weight:600;text-decoration:none;background:rgba(226,181,107,.04);transition:.4s var(--ease)}
.fq .cta a:hover{background:var(--gold);color:#10100c;transform:translateY(-2px);box-shadow:0 14px 40px -12px rgba(226,181,107,.5)}

@media (prefers-reduced-motion: reduce){.fq *{transition:none!important}}
`;

export default function FAQ() {
  return (
    <div className="fq">
      <style>{CSS}</style>
      <div className="sky" />
      <div className="glow" />
      <NavBar />

      <main className="wrap">
        <div className="kicker">Questions</div>
        <h1>Frequently <em>asked</em></h1>
        <p className="intro">
          Everything worth knowing before your first run. Still curious? Take a free run and see for
          yourself.
        </p>

        <div className="list">
          {FAQS.map((f, i) => (
            <details key={i} open={i === 0}>
              <summary>
                {f.q}
                <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p className="answer">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="cta">
          <a href="#/pricing">See pricing</a>
        </div>
      </main>
    </div>
  );
}
