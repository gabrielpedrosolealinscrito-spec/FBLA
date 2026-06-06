// ═══════════════════════════════════════════════════════════════
// AMBIENT AUDIO — app-wide generative soundscape (singleton).
//
// Lives OUTSIDE the React tree so the music plays seamlessly across
// every screen change (Landing → Quiz → Results) instead of dying when
// a component unmounts. The AudioContext is created lazily on the first
// user gesture (Landing's "Enter" / the sound toggle), then persists for
// the life of the tab. Enabled state is remembered in localStorage.
//
// The bed: a warm 4-voice pad drifting through an Am–F–C–G progression,
// a sub for body, convolution reverb for space, a slow filter sweep, and
// sparse panned shimmer tones. Fully synthesized — no audio assets.
// ═══════════════════════════════════════════════════════════════

const NOTE = (m) => 440 * Math.pow(2, (m - 69) / 12); // midi -> Hz
// Ambient harmony: a constant low A pedal anchors everything (never changes
// key) while four upper voices drift slowly through lush sus / extended colors.
// Thirds are mostly omitted (sus2/sus4/add9/11) for an open, mode-agnostic,
// hypnotic quality; voice 3 holds a high A as an upper pedal for continuity.
const PEDAL = 33; // A1 — the held drone
const VOICINGS = [
  [64, 71, 76, 81], // Asus2 / add9     E4  B4  E5  A5
  [62, 67, 71, 81], // A11 (Em over A)  D4  G4  B4  A5
  [64, 69, 74, 81], // Aadd9 / sus4     E4  A4  D5  A5
  [64, 72, 74, 81], // Am9 (lush)       E4  C5  D5  A5
];
const LEVEL = 0.32;

let actx = null, master = null, reverb = null, padFilter = null;
let voices = [], subOsc = null, chordIx = 0;
let chordTimer = 0, shimmerTimer = 0, built = false;
let enabled = (() => { try { return localStorage.getItem("potential.sound") !== "off"; } catch (e) { return true; } })();

function makeReverb() {
  const len = Math.floor(actx.sampleRate * 3.4), buf = actx.createBuffer(2, len, actx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  const c = actx.createConvolver(); c.buffer = buf; return c;
}

function setChord(notes) {
  const t = actx.currentTime;
  // Long, overlapping glides — the voices morph into the next color rather than
  // stepping to it. The pedal (subOsc) deliberately never moves.
  voices.forEach((v, i) => {
    const f = NOTE(notes[i % notes.length]);
    v.a.frequency.setTargetAtTime(f, t, 3.6); v.b.frequency.setTargetAtTime(f, t, 3.6);
    v.vg.gain.setTargetAtTime(v.base * .72, t, 2.2);   // gentle breath
    v.vg.gain.setTargetAtTime(v.base, t + 4.5, 3.2);
  });
}

function shimmer() {
  if (!actx || actx.state === "closed") return;
  const chord = VOICINGS[chordIx];
  const m = chord[Math.floor(Math.random() * chord.length)] + 12; // an octave above the voicing
  const osc = actx.createOscillator(), g = actx.createGain();
  osc.type = "sine"; osc.frequency.value = NOTE(m); g.gain.value = 0; osc.connect(g);
  if (actx.createStereoPanner) { const p = actx.createStereoPanner(); p.pan.value = Math.random() * 1.6 - .8; g.connect(p); p.connect(reverb); p.connect(master); }
  else { g.connect(reverb); g.connect(master); }
  const t = actx.currentTime;
  g.gain.linearRampToValueAtTime(.05, t + 1.3);
  g.gain.exponentialRampToValueAtTime(.0008, t + 6);
  osc.start(t); osc.stop(t + 6.5);
  shimmerTimer = setTimeout(shimmer, 5000 + Math.random() * 7000);
}

function build() {
  if (built) return;
  actx = new (window.AudioContext || window.webkitAudioContext)();
  master = actx.createGain(); master.gain.value = 0; master.connect(actx.destination);
  // space — long, washy reverb tail for texture
  reverb = makeReverb(); const wet = actx.createGain(); wet.gain.value = .95; reverb.connect(wet); wet.connect(master);
  // pad: voices -> filter -> bus -> (dry + reverb send)
  padFilter = actx.createBiquadFilter(); padFilter.type = "lowpass"; padFilter.frequency.value = 720; padFilter.Q.value = .7;
  const bus = actx.createGain(); bus.gain.value = .55; padFilter.connect(bus); bus.connect(master); bus.connect(reverb);
  // very slow filter sweep — timbral movement without harmonic movement
  const fl = actx.createOscillator(), fg = actx.createGain(); fl.frequency.value = .025; fg.gain.value = 480; fl.connect(fg); fg.connect(padFilter.frequency); fl.start();
  // fixed low pedal/drone — the anchor; it never changes
  subOsc = actx.createOscillator(); const sg = actx.createGain(); subOsc.type = "sine"; subOsc.frequency.value = NOTE(PEDAL); sg.gain.value = .12; subOsc.connect(sg); sg.connect(master); subOsc.start();
  // four detuned pad voices
  voices = VOICINGS[0].map((m, i) => {
    const vg = actx.createGain(); vg.gain.value = 0; vg.connect(padFilter);
    const a = actx.createOscillator(), b = actx.createOscillator();
    a.type = "triangle"; b.type = "sine"; a.frequency.value = NOTE(m); b.frequency.value = NOTE(m); a.detune.value = -7; b.detune.value = 8;
    a.connect(vg); b.connect(vg); a.start(); b.start();
    const lfo = actx.createOscillator(), lg = actx.createGain(); lfo.frequency.value = .03 + i * .017; lg.gain.value = .028; lfo.connect(lg); lg.connect(vg.gain); lfo.start();
    const base = [.17, .13, .12, .11][i]; vg.gain.setTargetAtTime(base, actx.currentTime, 3.5);
    return { a, b, vg, base };
  });
  // drift slowly + organically through the voicings (no metronomic cadence) + sparse shimmer
  const advance = () => { chordIx = (chordIx + 1) % VOICINGS.length; setChord(VOICINGS[chordIx]); chordTimer = setTimeout(advance, 18000 + Math.random() * 9000); };
  chordTimer = setTimeout(advance, 20000 + Math.random() * 8000);
  shimmerTimer = setTimeout(shimmer, 4000 + Math.random() * 4000);
  built = true;
}

function ramp(v) { if (master && actx) master.gain.linearRampToValueAtTime(v, actx.currentTime + 1.6); }

const ambient = {
  // Begin (or resume) the soundscape. Must be called from a user gesture
  // the first time so the browser allows the AudioContext to run.
  start() {
    if (!enabled) return;
    build();
    if (actx.state === "suspended") actx.resume();
    ramp(LEVEL);
  },
  setEnabled(on) {
    enabled = on;
    try { localStorage.setItem("potential.sound", on ? "on" : "off"); } catch (e) {}
    if (on) { build(); if (actx.state === "suspended") actx.resume(); ramp(LEVEL); }
    else { ramp(0); }
  },
  toggle() { this.setEnabled(!enabled); return enabled; },
  isEnabled() { return enabled; },
  // Full teardown (not used during normal navigation; tab close handles it).
  stop() { clearTimeout(chordTimer); clearTimeout(shimmerTimer); if (actx) { try { actx.close(); } catch (e) {} } actx = null; master = null; built = false; voices = []; },
};

export default ambient;
