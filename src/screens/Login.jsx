import { useState } from "react";
import { useAuth } from "../lib/auth.jsx";

// ═══════════════════════════════════════════════════════════════
// LOGIN — sign in + create account (package 01, screen N1).
//
// Wired to useAuth() (README §2): signIn, signUp, signInWithGoogle. Sign-up
// captures NAME + BIRTHDAY (birthday, not age — feeds profiles per package 00).
// On success, returns to the app (hash = '') which re-renders the tree.
//
// Auth is currently the package-01 localStorage STUB; when package 00 lands its
// Supabase-backed useAuth this screen needs no change — same contract.
//
// Brand: gold-on-near-black, Instrument Serif headings, Manrope body, the
// counter-rotating compass motif. No emojis (README §6).
// ═══════════════════════════════════════════════════════════════

// ── Compass geometry (mirrors Pricing.jsx — a single shared visual motif) ──
const C = 100;
const round = (n) => Number(n).toFixed(2);
const RING = "#8a6a38";
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
function point(angleDeg, len, half) {
  const a = (angleDeg - 90) * Math.PI / 180;
  const ax = Math.cos(a), ay = Math.sin(a), px = -ay, py = ax;
  const tip = `${round(C + ax * len)},${round(C + ay * len)}`;
  const bl = `${round(C + px * half)},${round(C + py * half)}`;
  const br = `${round(C - px * half)},${round(C - py * half)}`;
  return { light: `${tip} ${bl} ${C},${C}`, dark: `${tip} ${br} ${C},${C}` };
}
const LIGHT = "#efdca9", DARK = "#c89a4f", LIGHT2 = "#e7c987", DARK2 = "#b07f3a";
const BACK_PTS = [45, 135, 225, 315].map((ang) => point(ang, 40, 7));
const FRONT_PTS = [[0, 66], [90, 58], [180, 60], [270, 58]].map(([ang, len]) => point(ang, len, 10));

const CSS = `
.lg{ --night-1:#070a11; --night-2:#0d1119; --panel:#10141d; --gold:#e2b56b; --gold-soft:#d2a45a;
  --ivory:#f3ede1; --ivory-dim:rgba(243,237,225,.56); --ivory-faint:rgba(243,237,225,.22);
  --line:rgba(243,237,225,.10); --err:#e0916b; --ease:cubic-bezier(.22,.61,.36,1);
  position:relative;min-height:100vh;background:var(--night-1);color:var(--ivory);
  font-family:'Manrope',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;
  display:flex;flex-direction:column;align-items:center;justify-content:center;padding:96px 24px 60px}
.lg *{margin:0;padding:0;box-sizing:border-box}
.lg .sky{position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(120% 90% at 50% -10%, #141b27 0%, var(--night-2) 40%, var(--night-1) 80%)}
.lg .glow{position:fixed;left:50%;top:6vh;width:60vw;height:50vh;transform:translateX(-50%);
  background:radial-gradient(circle at 50% 40%, rgba(226,181,107,.12) 0%, rgba(226,181,107,.03) 38%, transparent 64%);
  z-index:0;pointer-events:none;filter:blur(10px)}

.lg .card{position:relative;z-index:10;width:100%;max-width:412px;
  background:linear-gradient(180deg,var(--panel) 0%,var(--night-2) 100%);
  border:1px solid var(--line);border-radius:22px;padding:40px 34px 34px;
  box-shadow:0 40px 90px -50px rgba(0,0,0,.9);
  animation:lg-fade .6s var(--ease) both}
@keyframes lg-fade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}

.lg .home{display:block;margin:0 auto 14px;background:none;border:none;cursor:pointer;
  font-family:'Instrument Serif',serif;font-size:20px;letter-spacing:.5px;color:var(--ivory-dim);
  transition:color .3s var(--ease)}
.lg .home:hover{color:var(--ivory)}
.lg .home small{font-style:italic;opacity:.6;font-size:12px;margin-left:1px}
.lg .mark{display:flex;justify-content:center;margin-bottom:8px}
.lg .mark svg{width:60px;height:60px;opacity:.92;filter:drop-shadow(0 6px 24px rgba(226,181,107,.22))}
.lg .mark .ring{transform-box:fill-box;transform-origin:center;animation:lg-cw 120s linear infinite}
.lg .mark .rose{transform-box:fill-box;transform-origin:center;animation:lg-ccw 72s linear infinite}
@keyframes lg-cw{to{transform:rotate(360deg)}}
@keyframes lg-ccw{to{transform:rotate(-360deg)}}

.lg h1{font-family:'Instrument Serif',serif;font-weight:400;font-size:32px;text-align:center;letter-spacing:-.01em;line-height:1.05}
.lg .sub{text-align:center;font-size:13px;color:var(--ivory-dim);font-weight:300;margin-top:8px;margin-bottom:26px}

.lg .field{margin-bottom:14px}
.lg label{display:block;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--ivory-dim);font-weight:500;margin-bottom:7px}
.lg input{width:100%;padding:13px 16px;border-radius:12px;
  background:rgba(255,255,255,.03);border:1px solid var(--line);color:var(--ivory);
  font-family:'Manrope';font-size:14px;font-weight:300;transition:.3s var(--ease)}
.lg input::placeholder{color:var(--ivory-faint)}
.lg input:focus{outline:none;border-color:var(--gold-soft);background:rgba(255,255,255,.05)}
.lg .row2{display:flex;gap:12px}
.lg .row2 .field{flex:1}

.lg .err{background:rgba(224,145,107,.10);border:1px solid rgba(224,145,107,.32);
  color:var(--err);font-size:12.5px;font-weight:300;line-height:1.4;
  border-radius:10px;padding:10px 13px;margin-bottom:14px}
.lg .notice{background:rgba(226,181,107,.10);border:1px solid rgba(226,181,107,.32);
  color:var(--gold-soft);font-size:12.5px;font-weight:300;line-height:1.4;
  border-radius:10px;padding:10px 13px;margin-bottom:14px}

.lg .submit{width:100%;margin-top:6px;padding:14px 18px;border-radius:100px;cursor:pointer;
  font-family:'Manrope';font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;
  background:var(--gold);border:1px solid var(--gold);color:#15110a;transition:.4s var(--ease)}
.lg .submit:hover{box-shadow:0 14px 40px -12px rgba(226,181,107,.55);transform:translateY(-1px)}
.lg .submit:disabled{opacity:.55;cursor:default;transform:none;box-shadow:none}

.lg .divider{display:flex;align-items:center;gap:14px;margin:22px 0;color:var(--ivory-faint);
  font-size:10.5px;letter-spacing:.16em;text-transform:uppercase}
.lg .divider::before,.lg .divider::after{content:"";flex:1;height:1px;background:var(--line)}

.lg .google{width:100%;padding:13px 18px;border-radius:100px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:10px;
  font-family:'Manrope';font-size:13px;font-weight:500;
  background:transparent;border:1px solid var(--ivory-faint);color:var(--ivory);transition:.4s var(--ease)}
.lg .google:hover{border-color:var(--gold);color:var(--gold);background:rgba(226,181,107,.05)}
.lg .google svg{width:17px;height:17px;flex:none}

.lg .toggle{text-align:center;margin-top:22px;font-size:13px;color:var(--ivory-dim);font-weight:300}
.lg .toggle button{background:none;border:none;color:var(--gold);cursor:pointer;
  font-family:'Manrope';font-size:13px;font-weight:500;padding:0 0 0 4px}
.lg .toggle button:hover{text-decoration:underline}
.lg .legal{text-align:center;margin-top:20px;font-size:11px;line-height:1.5;color:var(--ivory-faint);font-weight:300}

@media (prefers-reduced-motion: reduce){.lg *{animation:none!important}}
`;

function CompassMark() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <g className="ring">
        <circle cx="100" cy="100" r="94" fill="none" stroke={RING} strokeWidth=".9" />
        <circle cx="100" cy="100" r="70" fill="none" stroke={RING} strokeWidth=".9" opacity=".85" />
        {TICKS.map((t) => (
          <line key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={RING} strokeWidth={t.w} />
        ))}
      </g>
      <g className="rose">
        {BACK_PTS.map((p, i) => (
          <g key={`b${i}`}><polygon points={p.light} fill={LIGHT2} /><polygon points={p.dark} fill={DARK2} /></g>
        ))}
        {FRONT_PTS.map((p, i) => (
          <g key={`f${i}`}><polygon points={p.light} fill={LIGHT} /><polygon points={p.dark} fill={DARK} /></g>
        ))}
        <circle cx="100" cy="100" r="8.5" fill="#caa15a" />
        <circle cx="100" cy="100" r="2.8" fill="#0a0d14" />
      </g>
    </svg>
  );
}

export default function Login() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  const goApp = () => { window.location.hash = ""; };

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setNotice("");
    if (isSignup && !name.trim()) { setError("Please tell us your name."); return; }
    if (isSignup && !birthday) { setError("Please enter your birthday."); return; }
    setBusy(true);
    const res = isSignup
      ? await signUp(email, password, { name: name.trim(), birthday })
      : await signIn(email, password);
    setBusy(false);
    if (res.error) { setError(res.error); return; }
    // signUp can succeed without a session when email confirmation is on — don't
    // bounce to a logged-out app; tell the user to confirm first.
    if (res.needsConfirmation) {
      setNotice("Account created. Check your email to confirm, then sign in.");
      setMode("signin"); setPassword("");
      return;
    }
    goApp();
  };

  const google = async () => {
    setError(""); setNotice("");
    setBusy(true);
    const { error: err } = await signInWithGoogle();
    setBusy(false);
    if (err) { setError(err); return; }
    // OAuth redirects away; this only runs if it returned without redirecting.
    goApp();
  };

  const swap = () => { setMode(isSignup ? "signin" : "signup"); setError(""); setNotice(""); };

  return (
    <div className="lg">
      <style>{CSS}</style>
      <div className="sky" />
      <div className="glow" />

      <div className="card">
        <button className="home" type="button" onClick={goApp}>Potential <small>°</small></button>
        <div className="mark"><CompassMark /></div>
        <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="sub">
          {isSignup
            ? "Start mapping the life that could be yours."
            : "Sign in to pick up where you left off."}
        </p>

        {error && <div className="err" role="alert">{error}</div>}
        {notice && <div className="notice" role="status">{notice}</div>}

        <form onSubmit={submit}>
          {isSignup && (
            <div className="row2">
              <div className="field">
                <label htmlFor="lg-name">Name</label>
                <input id="lg-name" type="text" autoComplete="name" placeholder="Your name"
                  value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="lg-bday">Birthday</label>
                <input id="lg-bday" type="date" autoComplete="bday"
                  value={birthday} onChange={(e) => setBirthday(e.target.value)} />
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="lg-email">Email</label>
            <input id="lg-email" type="email" autoComplete="email" placeholder="you@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="lg-pass">Password</label>
            <input id="lg-pass" type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "Choose a password" : "Your password"}
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button className="submit" type="submit" disabled={busy}>
            {busy ? "One moment…" : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="divider">or</div>

        <button className="google" type="button" onClick={google} disabled={busy}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          Continue with Google
        </button>

        <p className="toggle">
          {isSignup ? "Already have an account?" : "New to Potential?"}
          <button type="button" onClick={swap}>{isSignup ? "Sign in" : "Create one"}</button>
        </p>

        {isSignup && (
          <p className="legal">
            We use your birthday to tailor your results. We never sell your data.
          </p>
        )}
      </div>
    </div>
  );
}
