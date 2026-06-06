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
// i – VI – III – VII voicings (Am – F – C – G): contemplative, dawn-leaning
const CHORDS = [[45, 60, 64, 69], [41, 57, 60, 65], [48, 64, 67, 72], [43, 59, 62, 67]];
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
  voices.forEach((v, i) => {
    const f = NOTE(notes[i % notes.length]);
    v.a.frequency.setTargetAtTime(f, t, 1.8); v.b.frequency.setTargetAtTime(f, t, 1.8);
    v.vg.gain.setTargetAtTime(v.base * .55, t, 1.0);   // dip
    v.vg.gain.setTargetAtTime(v.base, t + 2.4, 2.2);   // swell back
  });
  if (subOsc) subOsc.frequency.setTargetAtTime(NOTE(notes[0] - 12), t, 2.2);
}

function shimmer() {
  if (!actx || actx.state === "closed") return;
  const chord = CHORDS[chordIx];
  const m = chord[1 + Math.floor(Math.random() * (chord.length - 1))] + 24; // 2 octaves up
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
  // space
  reverb = makeReverb(); const wet = actx.createGain(); wet.gain.value = .85; reverb.connect(wet); wet.connect(master);
  // pad: voices -> filter -> bus -> (dry + reverb send)
  padFilter = actx.createBiquadFilter(); padFilter.type = "lowpass"; padFilter.frequency.value = 760; padFilter.Q.value = .7;
  const bus = actx.createGain(); bus.gain.value = .55; padFilter.connect(bus); bus.connect(master); bus.connect(reverb);
  // slow filter sweep for movement
  const fl = actx.createOscillator(), fg = actx.createGain(); fl.frequency.value = .035; fg.gain.value = 430; fl.connect(fg); fg.connect(padFilter.frequency); fl.start();
  // sub drone for body/warmth
  subOsc = actx.createOscillator(); const sg = actx.createGain(); subOsc.type = "sine"; subOsc.frequency.value = NOTE(CHORDS[0][0] - 12); sg.gain.value = .11; subOsc.connect(sg); sg.connect(master); subOsc.start();
  // four detuned pad voices
  voices = CHORDS[0].map((m, i) => {
    const vg = actx.createGain(); vg.gain.value = 0; vg.connect(padFilter);
    const a = actx.createOscillator(), b = actx.createOscillator();
    a.type = "triangle"; b.type = "sine"; a.frequency.value = NOTE(m); b.frequency.value = NOTE(m); a.detune.value = -6; b.detune.value = 7;
    a.connect(vg); b.connect(vg); a.start(); b.start();
    const lfo = actx.createOscillator(), lg = actx.createGain(); lfo.frequency.value = .05 + i * .021; lg.gain.value = .03; lfo.connect(lg); lg.connect(vg.gain); lfo.start();
    const base = [.17, .13, .12, .11][i]; vg.gain.setTargetAtTime(base, actx.currentTime, 2.6);
    return { a, b, vg, base };
  });
  // drift through the progression + sparse shimmer
  chordTimer = setInterval(() => { chordIx = (chordIx + 1) % CHORDS.length; setChord(CHORDS[chordIx]); }, 11000);
  shimmerTimer = setTimeout(shimmer, 3500 + Math.random() * 3500);
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
  stop() { clearInterval(chordTimer); clearTimeout(shimmerTimer); if (actx) { try { actx.close(); } catch (e) {} } actx = null; master = null; built = false; voices = []; },
};

export default ambient;
