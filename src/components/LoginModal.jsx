import { useState, useEffect, useRef } from "react";
import { useAuth } from "../lib/auth.jsx";
import Compass from "./Compass.jsx";

// ═══════════════════════════════════════════════════════════════
// LOGIN MODAL — sign in / create account as a dismissable popup that overlays
// the current page (not a route that navigates away). Triggered by App.jsx when
// the hash is #/login; closing (× / backdrop / Esc / success) returns to the
// page the user was on. Same useAuth() contract as before (README §2).
//
// Brand: gold-on-near-black, Instrument Serif headings, Manrope body, shared
// <Compass> motif. No emojis (README §6).
// ═══════════════════════════════════════════════════════════════

const CSS = `
.lgm{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;
  padding:24px;--gold:#e2b56b;--gold-soft:#d2a45a;--panel:#10141d;--night-2:#0d1119;
  --ivory:#f3ede1;--ivory-dim:rgba(243,237,225,.56);--ivory-faint:rgba(243,237,225,.22);
  --line:rgba(243,237,225,.10);--err:#e0916b;--ease:cubic-bezier(.22,.61,.36,1);
  font-family:'Manrope',sans-serif;-webkit-font-smoothing:antialiased;
  background:rgba(5,7,12,.66);backdrop-filter:blur(6px);
  animation:lgm-bg .3s var(--ease) both}
@keyframes lgm-bg{from{opacity:0}to{opacity:1}}
.lgm *{margin:0;padding:0;box-sizing:border-box}

.lgm-card{position:relative;width:100%;max-width:412px;max-height:calc(100vh - 48px);overflow-y:auto;
  background:linear-gradient(180deg,var(--panel) 0%,var(--night-2) 100%);
  border:1px solid var(--line);border-radius:22px;padding:40px 34px 34px;
  box-shadow:0 40px 90px -40px rgba(0,0,0,.95);
  animation:lgm-pop .4s var(--ease) both}
@keyframes lgm-pop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}

.lgm-x{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:100px;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--ivory-dim);
  transition:.3s var(--ease)}
.lgm-x:hover{color:var(--ivory);border-color:var(--gold-soft);background:rgba(226,181,107,.06)}
.lgm-x svg{width:15px;height:15px}

.lgm .mark{display:flex;justify-content:center;margin:2px 0 8px}
.lgm .mark .cmp{opacity:.92;filter:drop-shadow(0 6px 24px rgba(226,181,107,.22))}
.lgm h1{font-family:'Instrument Serif',serif;font-weight:400;font-size:30px;text-align:center;letter-spacing:-.01em;line-height:1.05}
.lgm .sub{text-align:center;font-size:13px;color:var(--ivory-dim);font-weight:300;margin-top:8px;margin-bottom:24px}

.lgm .field{margin-bottom:14px}
.lgm label{display:block;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--ivory-dim);font-weight:500;margin-bottom:7px}
.lgm input{width:100%;padding:13px 16px;border-radius:12px;
  background:rgba(255,255,255,.03);border:1px solid var(--line);color:var(--ivory);
  font-family:'Manrope';font-size:14px;font-weight:300;transition:.3s var(--ease)}
.lgm input::placeholder{color:var(--ivory-faint)}
.lgm input:focus{outline:none;border-color:var(--gold-soft);background:rgba(255,255,255,.05)}
.lgm .row2{display:flex;gap:12px}
.lgm .row2 .field{flex:1}

.lgm .err{background:rgba(224,145,107,.10);border:1px solid rgba(224,145,107,.32);
  color:var(--err);font-size:12.5px;font-weight:300;line-height:1.4;border-radius:10px;padding:10px 13px;margin-bottom:14px}
.lgm .notice{background:rgba(226,181,107,.10);border:1px solid rgba(226,181,107,.32);
  color:var(--gold-soft);font-size:12.5px;font-weight:300;line-height:1.4;border-radius:10px;padding:10px 13px;margin-bottom:14px}

.lgm .submit{width:100%;margin-top:6px;padding:14px 18px;border-radius:100px;cursor:pointer;
  font-family:'Manrope';font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;
  background:var(--gold);border:1px solid var(--gold);color:#15110a;transition:.4s var(--ease)}
.lgm .submit:hover{box-shadow:0 14px 40px -12px rgba(226,181,107,.55);transform:translateY(-1px)}
.lgm .submit:disabled{opacity:.55;cursor:default;transform:none;box-shadow:none}

.lgm .divider{display:flex;align-items:center;gap:14px;margin:22px 0;color:var(--ivory-faint);
  font-size:10.5px;letter-spacing:.16em;text-transform:uppercase}
.lgm .divider::before,.lgm .divider::after{content:"";flex:1;height:1px;background:var(--line)}

.lgm .google{width:100%;padding:13px 18px;border-radius:100px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:10px;
  font-family:'Manrope';font-size:13px;font-weight:500;
  background:transparent;border:1px solid var(--ivory-faint);color:var(--ivory);transition:.4s var(--ease)}
.lgm .google:hover{border-color:var(--gold);color:var(--gold);background:rgba(226,181,107,.05)}
.lgm .google svg{width:17px;height:17px;flex:none}

.lgm .toggle{text-align:center;margin-top:22px;font-size:13px;color:var(--ivory-dim);font-weight:300}
.lgm .toggle button{background:none;border:none;color:var(--gold);cursor:pointer;
  font-family:'Manrope';font-size:13px;font-weight:500;padding:0 0 0 4px}
.lgm .toggle button:hover{text-decoration:underline}
.lgm .legal{text-align:center;margin-top:20px;font-size:11px;line-height:1.5;color:var(--ivory-faint);font-weight:300}

@media (prefers-reduced-motion: reduce){.lgm,.lgm *{animation:none!important}}
`;

export default function LoginModal({ onClose }) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const backdropRef = useRef(null);

  const isSignup = mode === "signup";

  // Esc closes; lock body scroll while open.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prevOverflow; };
  }, [onClose]);

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
    // close into a logged-out state; tell the user to confirm first.
    if (res.needsConfirmation) {
      setNotice("Account created. Check your email to confirm, then sign in.");
      setMode("signin"); setPassword("");
      return;
    }
    onClose(); // success — dismiss and stay on the page the user was on
  };

  const google = async () => {
    setError(""); setNotice("");
    setBusy(true);
    const { error: err } = await signInWithGoogle();
    setBusy(false);
    if (err) { setError(err); return; }
    onClose(); // OAuth redirects away; this only runs if it returned without redirecting.
  };

  const swap = () => { setMode(isSignup ? "signin" : "signup"); setError(""); setNotice(""); };

  const onBackdrop = (e) => { if (e.target === backdropRef.current) onClose(); };

  return (
    <div className="lgm" ref={backdropRef} onMouseDown={onBackdrop} role="dialog" aria-modal="true" aria-label="Sign in">
      <style>{CSS}</style>
      <div className="lgm-card">
        <button className="lgm-x" type="button" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="mark"><Compass size={56} tickDur={120} starDur={72} /></div>
        <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="sub">
          {isSignup ? "Start mapping the life that could be yours." : "Sign in to pick up where you left off."}
        </p>

        {error && <div className="err" role="alert">{error}</div>}
        {notice && <div className="notice" role="status">{notice}</div>}

        <form onSubmit={submit}>
          {isSignup && (
            <div className="row2">
              <div className="field">
                <label htmlFor="lgm-name">Name</label>
                <input id="lgm-name" type="text" autoComplete="name" placeholder="Your name"
                  value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="lgm-bday">Birthday</label>
                <input id="lgm-bday" type="date" autoComplete="bday"
                  value={birthday} onChange={(e) => setBirthday(e.target.value)} />
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="lgm-email">Email</label>
            <input id="lgm-email" type="email" autoComplete="email" placeholder="you@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="lgm-pass">Password</label>
            <input id="lgm-pass" type="password"
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
          <p className="legal">We use your birthday to tailor your results. We never sell your data.</p>
        )}
      </div>
    </div>
  );
}
