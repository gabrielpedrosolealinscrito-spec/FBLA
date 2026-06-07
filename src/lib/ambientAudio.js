// ═══════════════════════════════════════════════════════════════
// AMBIENT AUDIO — app-wide music player (singleton).
//
// Lives OUTSIDE the React tree so the track plays seamlessly across
// every screen change (Landing → Quiz → Results) instead of restarting
// when a component unmounts. Plays an mp3 via Web Audio (decoded once,
// looped gaplessly) with smooth gain fades. The AudioContext is created
// lazily on the first user gesture (Landing's "Enter" / the sound
// toggle).
//
// SINGLE SOURCE OF TRUTH for mute + volume (wishlist package 03, §3).
// This singleton holds the live audio state (`_muted`, `_volume`); it is
// the "device". `src/lib/a11y.jsx` (AccessibilityProvider) is the settings
// store that MIRRORS this into React and PERSISTS it (Supabase profiles.prefs
// when logged in, localStorage otherwise). There is no second mute state:
//   • the ProfilePopup volume/mute controls call useA11y → ambient setters
//   • Landing's imperative speaker toggle calls ambient.setEnabled directly
//   • both flow through the SAME _muted/_volume here and notify() listeners,
//     so AccessibilityProvider re-mirrors and re-persists either way.
// Initial values are read from the a11y localStorage key so the singleton
// has the right default BEFORE React mounts (Landing may start audio first).
// ═══════════════════════════════════════════════════════════════

const TRACK = "/ambient-civilization-fallen.mp3";
const DEFAULT_VOLUME = 0.5;
const FADE = 1.6;       // seconds — mute/unmute cross-fade
const VOL_RAMP = 0.08;  // seconds — live volume-slider response

let actx = null, master = null, source = null, buffer = null, loading = null;
let playing = false;

// Read the initial mute/volume the AccessibilityProvider persisted last session
// (key `potential.a11y`), with a migration fallback to the old standalone
// `potential.sound` toggle. a11y owns writes; this is read-only at module load.
function readInitial() {
  try {
    const raw = localStorage.getItem("potential.a11y");
    if (raw) {
      const p = JSON.parse(raw);
      return {
        muted: typeof p.muted === "boolean" ? p.muted : false,
        volume: typeof p.volume === "number" ? p.volume : DEFAULT_VOLUME,
      };
    }
    const legacy = localStorage.getItem("potential.sound"); // pre-package-03
    return { muted: legacy === "off", volume: DEFAULT_VOLUME };
  } catch (e) {
    return { muted: false, volume: DEFAULT_VOLUME };
  }
}

let { muted: _muted, volume: _volume } = readInitial();

// Listeners (AccessibilityProvider.subscribe) are notified on every state change
// so the React mirror stays in sync even when Landing toggles imperatively.
const listeners = new Set();
function notify() { listeners.forEach((fn) => { try { fn(); } catch (e) {} }); }

function targetGain() { return _muted ? 0 : _volume; }

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

function ramp(v, time = FADE) {
  if (master && actx) master.gain.linearRampToValueAtTime(v, actx.currentTime + time);
}

function startSource() {
  if (playing || !buffer) return;
  source = actx.createBufferSource();
  source.buffer = buffer; source.loop = true; // gapless loop
  source.connect(master); source.start();
  playing = true;
}

// Spin up the AudioContext + buffer and fade in to the current volume. Must be
// triggered from a user gesture the first time so the browser allows playback.
function spinUp() {
  ensureCtx();
  if (actx.state === "suspended") actx.resume();
  load().then(() => { if (!_muted) { startSource(); ramp(targetGain()); } }).catch(() => {});
}

const ambient = {
  // Begin (or resume) the music. No-op while muted.
  start() {
    if (_muted) return;
    spinUp();
  },

  // ── Primary state API (driven by AccessibilityProvider / useA11y) ──
  setMuted(m) {
    m = Boolean(m);
    if (m === _muted) return;
    _muted = m;
    if (_muted) ramp(0);          // fade out, keep the source running
    else spinUp();                // fade back in
    notify();
  },
  isMuted() { return _muted; },

  setVolume(v) {
    v = Math.max(0, Math.min(1, Number(v)));
    if (!Number.isFinite(v) || v === _volume) return;
    _volume = v;
    if (!_muted) ramp(targetGain(), VOL_RAMP); // live, snappy adjust
    notify();
  },
  getVolume() { return _volume; },

  // ── Back-compat facade (Landing's imperative speaker toggle, pre-package-02) ──
  // enabled === !muted — routes through the SAME single mute state above.
  setEnabled(on) { this.setMuted(!on); },
  isEnabled() { return !_muted; },
  toggle() { this.setMuted(!_muted); return !_muted; },

  // Subscribe to mute/volume changes. Returns an unsubscribe fn.
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  // Full teardown (not used during normal navigation; tab close handles it).
  stop() {
    if (source) { try { source.stop(); } catch (e) {} source = null; }
    playing = false;
    if (actx) { try { actx.close(); } catch (e) {} }
    actx = null; master = null;
  },
};

export default ambient;
