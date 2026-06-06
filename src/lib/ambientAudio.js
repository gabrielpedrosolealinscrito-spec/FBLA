// ═══════════════════════════════════════════════════════════════
// AMBIENT AUDIO — app-wide music player (singleton).
//
// Lives OUTSIDE the React tree so the track plays seamlessly across
// every screen change (Landing → Quiz → Results) instead of restarting
// when a component unmounts. Plays an mp3 via Web Audio (decoded once,
// looped gaplessly) with smooth gain fades. The AudioContext is created
// lazily on the first user gesture (Landing's "Enter" / the sound
// toggle); enabled state is remembered in localStorage.
// ═══════════════════════════════════════════════════════════════

const TRACK = "/ambient-civilization-fallen.mp3";
const LEVEL = 0.5;
const FADE = 1.6; // seconds

let actx = null, master = null, source = null, buffer = null, loading = null;
let playing = false;
let enabled = (() => { try { return localStorage.getItem("potential.sound") !== "off"; } catch (e) { return true; } })();

function ensureCtx() {
  if (actx) return;
  actx = new (window.AudioContext || window.webkitAudioContext)();
  master = actx.createGain(); master.gain.value = 0; master.connect(actx.destination);
}

function load() {
  if (buffer) return Promise.resolve(buffer);
  if (loading) return loading;
  loading = fetch(TRACK)
    .then((r) => r.arrayBuffer())
    .then((b) => actx.decodeAudioData(b))
    .then((buf) => { buffer = buf; return buf; })
    .catch((e) => { loading = null; throw e; });
  return loading;
}

function ramp(v) { if (master && actx) master.gain.linearRampToValueAtTime(v, actx.currentTime + FADE); }

function startSource() {
  if (playing || !buffer) return;
  source = actx.createBufferSource();
  source.buffer = buffer; source.loop = true; // gapless loop
  source.connect(master); source.start();
  playing = true;
}

const ambient = {
  // Begin (or resume) the music. Must be called from a user gesture the
  // first time so the browser allows the AudioContext to run.
  start() {
    if (!enabled) return;
    ensureCtx();
    if (actx.state === "suspended") actx.resume();
    load().then(() => { if (enabled) { startSource(); ramp(LEVEL); } }).catch(() => {});
  },
  setEnabled(on) {
    enabled = on;
    try { localStorage.setItem("potential.sound", on ? "on" : "off"); } catch (e) {}
    if (on) {
      ensureCtx();
      if (actx.state === "suspended") actx.resume();
      load().then(() => { if (enabled) { startSource(); ramp(LEVEL); } }).catch(() => {});
    } else {
      ramp(0); // fade out, leave the source running so re-enabling is instant
    }
  },
  toggle() { this.setEnabled(!enabled); return enabled; },
  isEnabled() { return enabled; },
  // Full teardown (not used during normal navigation; tab close handles it).
  stop() { if (source) { try { source.stop(); } catch (e) {} source = null; } playing = false; if (actx) { try { actx.close(); } catch (e) {} } actx = null; master = null; },
};

export default ambient;
