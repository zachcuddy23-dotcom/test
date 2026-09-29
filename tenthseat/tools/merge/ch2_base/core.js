'use strict';
// ---------------------------------------------------------------------------
// Core: canvas, loop, input, scenes, timers, helpers
// ---------------------------------------------------------------------------
const W = 960, H = 640, TS = 48; // screen size, world tile size on screen
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const FONT = '"Press Start 2P", "Courier New", monospace';

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(Math.random() * a.length)];
function wpick(list) {
  let t = 0; for (const e of list) t += (e.w || 1);
  let r = Math.random() * t;
  for (const e of list) { r -= (e.w || 1); if (r < 0) return e; }
  return list[list.length - 1];
}
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return c; }
// deterministic PRNG for textures
function srand(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 10000) / 10000; }; }

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
const Input = {
  held: {}, pressed: {}, t: {},
  keymap: {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    KeyZ: 'a', Space: 'a', Enter: 'a', KeyX: 'b', Backspace: 'b', Escape: 'menu', KeyC: 'menu', Tab: 'menu', ShiftLeft: 'run', ShiftRight: 'run',
  },
  down(btn) { if (!this.held[btn]) { this.pressed[btn] = true; this.t[btn] = 0; } this.held[btn] = true; },
  up(btn) { this.held[btn] = false; },
  hit(btn) { return !!this.pressed[btn]; },
  rep(btn) { return !!this.pressed[btn] || (this.held[btn] && this.t[btn] > 16 && this.t[btn] % 5 === 0); },
  ok() { return this.hit('a'); },
  cancel() { return this.hit('b') || this.hit('menu'); },
  dir() { for (const d of ['up', 'down', 'left', 'right']) if (this.held[d]) return d; return null; },
  endFrame() { this.pressed = {}; for (const k in this.held) if (this.held[k]) this.t[k] = (this.t[k] || 0) + 1; },
  clear() { this.pressed = {}; },
};
window.addEventListener('keydown', e => {
  const b = Input.keymap[e.code];
  if (b) { e.preventDefault(); if (!e.repeat) Input.down(b); }
  Audio2.unlock();
});
window.addEventListener('keyup', e => { const b = Input.keymap[e.code]; if (b) Input.up(b); });
window.addEventListener('blur', () => { Input.held = {}; });

// ---------------------------------------------------------------------------
// Scenes, timers, fades
// ---------------------------------------------------------------------------
const Game = {
  scenes: [], timers: [], frame: 0, fade: 0, fadeColor: '#000', flash: 0, state: null, busy: 0, shake: 0,
  push(s) { this.scenes.push(s); if (s.enter) s.enter(); return s; },
  pop(s) { const i = s ? this.scenes.lastIndexOf(s) : this.scenes.length - 1; if (i >= 0) { const [r] = this.scenes.splice(i, 1); if (r.leave) r.leave(); } },
  top() { return this.scenes[this.scenes.length - 1]; },
  replaceAll(s) { while (this.scenes.length) this.pop(); this.push(s); },
};
function wait(n) { return new Promise(res => Game.timers.push({ t: n, res })); }
function tween(frames, fn) { return new Promise(res => Game.timers.push({ t: frames, n: frames, fn, res })); }
async function fadeOut(n = 20, color = '#000') { Game.fadeColor = color; const s = Game.fade; await tween(n, k => Game.fade = s + (1 - s) * k); Game.fade = 1; }
async function fadeIn(n = 20) { const s = Game.fade; await tween(n, k => Game.fade = s * (1 - k)); Game.fade = 0; }

function update() {
  Game.frame++;
  for (let i = Game.timers.length - 1; i >= 0; i--) {
    const t = Game.timers[i]; t.t--;
    if (t.fn) t.fn(1 - t.t / t.n);
    if (t.t <= 0) { Game.timers.splice(i, 1); t.res(); }
  }
  const top = Game.top();
  if (top && top.update) top.update();
  if (Game.flash > 0) Game.flash--;
  if (Game.shake > 0) Game.shake--;
  Input.endFrame();
}
function render() {
  ctx.save();
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (Game.shake > 0) ctx.translate(rnd(-6, 6), rnd(-4, 4));
  // draw from last opaque scene
  let start = 0;
  for (let i = Game.scenes.length - 1; i >= 0; i--) if (Game.scenes[i].opaque) { start = i; break; }
  for (let i = start; i < Game.scenes.length; i++) {
    const s = Game.scenes[i];
    if (s.draw) s.draw();
    if (s.overFade) continue;
  }
  ctx.restore();
  if (Game.fade > 0) { ctx.globalAlpha = clamp(Game.fade, 0, 1); ctx.fillStyle = Game.fadeColor; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  for (const s of Game.scenes) if (s.drawOver) s.drawOver();
  if (Game.flash > 0) { ctx.globalAlpha = Game.flash / 12; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
let lastT = 0, acc = 0;
// Errors are logged (see the Debug menu) instead of freezing the game.
Game.errors = [];
function logError(where, e) {
  const msg = `${where}: ${e && e.message || e}`;
  if (!Game.errors.length || Game.errors[Game.errors.length - 1].msg !== msg) Game.errors.push({ msg, stack: e && e.stack, t: Date.now() });
  if (Game.errors.length > 40) Game.errors.shift();
  console.error(where, e);
}
let stuckT = 0;
function watchdog() {
  // If the map is idle but the screen is still faded out, bring the picture back.
  const f = Game.field, top = Game.top();
  if (f && top === f && !f.busy && !f.moving && Game.fade > 0.05) { if (++stuckT > 90) { Game.fade = 0; stuckT = 0; logError('watchdog', 'screen was stuck faded; restored'); } }
  else stuckT = 0;
}
function loop(t) {
  requestAnimationFrame(loop);
  if (!lastT) lastT = t;
  acc += Math.min(100, t - lastT); lastT = t;
  let steps = 0;
  while (acc >= 1000 / 60 && steps < 4) {
    try { update(); } catch (e) { logError('update', e); Input.endFrame(); }
    try { watchdog(); } catch (e) { }
    acc -= 1000 / 60; steps++;
  }
  if (steps) { try { render(); } catch (e) { logError('render', e); ctx.restore && ctx.restore(); } }
}
window.addEventListener('error', e => logError('script', e.error || e.message));
window.addEventListener('unhandledrejection', e => logError('async', e.reason));

// ---------------------------------------------------------------------------
// Audio: tiny WebAudio synth for sfx and chiptune music
// ---------------------------------------------------------------------------
const Audio2 = {
  ac: null, master: null, musicGain: null, sfxGain: null, muted: false, track: null, nextT: 0, step: 0, timer: null,
  unlock() {
    if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
    try {
      this.ac = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ac.createGain(); this.master.gain.value = this.muted ? 0 : 0.5; this.master.connect(this.ac.destination);
      this.musicGain = this.ac.createGain(); this.musicGain.gain.value = 0.35; this.musicGain.connect(this.master);
      this.sfxGain = this.ac.createGain(); this.sfxGain.gain.value = 0.6; this.sfxGain.connect(this.master);
      if (this.want) this.music(this.want, true);
    } catch (e) { this.ac = null; }
  },
  toggleMute() { this.muted = !this.muted; if (this.master) this.master.gain.value = this.muted ? 0 : 0.5; return this.muted; },
  tone(freq, dur, type = 'square', vol = 0.3, t0 = 0, slide = 0, dest) {
    if (!this.ac) return;
    const t = (t0 || this.ac.currentTime);
    const o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest || this.sfxGain); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol = 0.3, t0 = 0, hp = 800) {
    if (!this.ac) return;
    const t = t0 || this.ac.currentTime;
    const len = Math.floor(this.ac.sampleRate * dur), buf = this.ac.createBuffer(1, len, this.ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = this.ac.createBufferSource(); s.buffer = buf;
    const f = this.ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
    const g = this.ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.sfxGain); s.start(t);
  },
  sfx(name) {
    if (!this.ac) return;
    const n = this.ac.currentTime;
    switch (name) {
      case 'cursor': this.tone(880, 0.05, 'square', 0.12); break;
      case 'ok': this.tone(660, 0.06, 'square', 0.15); this.tone(990, 0.08, 'square', 0.15, n + 0.05); break;
      case 'cancel': this.tone(440, 0.08, 'square', 0.12, 0, 0.6); break;
      case 'error': this.tone(160, 0.15, 'square', 0.2); break;
      case 'hit': this.noise(0.12, 0.4, 0, 400); this.tone(180, 0.1, 'square', 0.2, 0, 0.5); break;
      case 'crit': this.noise(0.2, 0.5, 0, 300); this.tone(300, 0.2, 'sawtooth', 0.25, 0, 0.3); break;
      case 'miss': this.tone(1200, 0.08, 'triangle', 0.1, 0, 0.5); break;
      case 'slash': this.noise(0.1, 0.25, 0, 2500); break;
      case 'fire': this.noise(0.5, 0.35, 0, 200); this.tone(120, 0.4, 'sawtooth', 0.15, 0, 2); break;
      case 'dark': this.tone(220, 0.5, 'sawtooth', 0.2, 0, 0.3); this.tone(110, 0.6, 'square', 0.12, n + 0.05, 0.5); break;
      case 'wind': this.noise(0.6, 0.25, 0, 1500); break;
      case 'heal': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.2, n + i * 0.06)); break;
      case 'status': this.tone(600, 0.3, 'triangle', 0.2, 0, 0.4); this.tone(300, 0.3, 'triangle', 0.2, n + 0.1, 2); break;
      case 'enc': for (let i = 0; i < 6; i++) this.tone(200 + i * 120, 0.06, 'square', 0.15, n + i * 0.04); break;
      case 'die': this.noise(0.4, 0.3, 0, 600); this.tone(400, 0.4, 'square', 0.15, 0, 0.2); break;
      case 'chest': [392, 523, 659, 784].forEach((f, i) => this.tone(f, 0.12, 'square', 0.15, n + i * 0.07)); break;
      case 'stairs': [600, 500, 400, 300].forEach((f, i) => this.tone(f, 0.07, 'square', 0.12, n + i * 0.05)); break;
      case 'buy': this.tone(1318, 0.08, 'square', 0.15); this.tone(1760, 0.12, 'square', 0.15, n + 0.08); break;
      case 'run': [700, 600, 500, 400, 300].forEach((f, i) => this.tone(f, 0.05, 'square', 0.12, n + i * 0.03)); break;
      case 'bump': this.tone(90, 0.06, 'square', 0.12); break;
      case 'levelup': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, 0.14, 'square', 0.16, n + i * 0.09)); break;
      case 'ready': this.tone(1318, 0.05, 'square', 0.08); this.tone(1760, 0.06, 'square', 0.08, n + 0.05); break;
      case 'cast': [880, 1175, 1480].forEach((f, i) => this.tone(f, 0.08, 'triangle', 0.12, n + i * 0.04)); break;
      case 'ice': [2000, 1600, 2400, 1800].forEach((f, i) => this.tone(f, 0.12, 'triangle', 0.1, n + i * 0.05)); this.noise(0.3, 0.12, 0, 4000); break;
      case 'bolt': this.noise(0.25, 0.45, 0, 1200); this.tone(60, 0.3, 'sawtooth', 0.3, 0, 0.5); break;
      case 'water': this.noise(0.5, 0.25, 0, 300); this.tone(300, 0.4, 'sine', 0.2, 0, 0.4); break;
      case 'holy': [1047, 1319, 1568, 2093].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.12, n + i * 0.05)); break;
      case 'save': [523, 784, 1047, 1568].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.14, n + i * 0.1)); break;
      case 'surprise': this.tone(880, 0.08, 'square', 0.14); this.tone(1320, 0.12, 'square', 0.14, n + 0.07); break;
      case 'boom': this.noise(0.8, 0.6, 0, 100); this.tone(80, 0.8, 'sawtooth', 0.3, 0, 0.3); break;
    }
  },
  // ------------------------------------------------------------- music
  music(name, force) {
    this.want = name;
    if (!this.ac) return;
    if (this.track && this.track.name === name && !force) return;
    this.track = name ? Object.assign({ name }, MUSIC[name]) : null;
    this.step = 0; this.nextT = this.ac.currentTime + 0.05;
    if (!this.timer) this.timer = setInterval(() => this.pump(), 50);
  },
  pump() {
    if (!this.ac || !this.track) return;
    const tr = this.track, spb = 60 / tr.bpm / 4; // 16th notes
    while (this.nextT < this.ac.currentTime + 0.2) {
      for (const v of tr.voices) {
        const len = v.seq.length;
        if (!tr.loop && this.step >= len) continue;
        const ev = v.seq[this.step % len];
        if (ev && ev !== '.' && ev !== '-') {
          let dur = 1; while (v.seq[(this.step + dur) % len] === '-' && dur < len) dur++;
          const f = noteFreq(ev);
          if (v.type === 'noise') this.noiseAt(this.nextT, v.vol);
          else this.tone(f, spb * dur * 0.95, v.type, v.vol, this.nextT, 0, this.musicGain);
        }
      }
      this.step++; this.nextT += spb;
      if (!tr.loop && this.step >= tr.voices[0].seq.length) { this.track = null; break; }
    }
  },
  noiseAt(t, vol) { if (!this.ac) return; const len = Math.floor(this.ac.sampleRate * 0.05), buf = this.ac.createBuffer(1, len, this.ac.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; const s = this.ac.createBufferSource(); s.buffer = buf; const g = this.ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05); s.connect(g); g.connect(this.musicGain); s.start(t); },
};
const NOTE_IDX = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
function noteFreq(n) { const m = /^([A-G]#?)(\d)$/.exec(n); if (!m) return 440; const midi = NOTE_IDX[m[1]] + (+m[2] + 1) * 12; return 440 * Math.pow(2, (midi - 69) / 12); }
