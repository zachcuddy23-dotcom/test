'use strict';
// ---------------------------------------------------------------------------
// HD-2D: the "pixel diorama" look. Pixel sprites stay pixel sprites; depth
// comes from the camera and the light instead.
//   - tilted camera (far rows shrink, near rows swell), stronger while flying
//   - depth of field (top and bottom of the screen go soft, like tilt-shift)
//   - real lights: torches, lanterns, lava, altars light up dark places
//   - soft shadows: walls cast onto floors, everyone stands on a shadow
//   - bloom, light shafts, floating dust and a colour grade per place
// Config > Visuals switches between HD-2D and Classic.
// ---------------------------------------------------------------------------
const HD2D = {
  on() { const st = Game.state; return !(st && st.cfg && st.cfg.visual === 'classic'); },
  hasFilter: typeof ctx.filter === 'string',
  _c: {},
  canvas(key, w, h, read) {
    let c = this._c[key];
    if (!c || c.width !== w || c.height !== h) {
      c = document.createElement('canvas'); c.width = w; c.height = h;
      c.x = c.getContext('2d', read ? { willReadFrequently: true } : undefined);
      this._c[key] = c;
    }
    return c;
  },
};

// Moods: amb = light level multiplied over the scene (255 = full daylight);
// grade = soft-light colour wash; rays = sun shafts; motes = dust colour; k = camera tilt
const HD_MOOD = {
  day: { amb: null, grade: 'rgba(255,214,150,0.22)', rays: true, motes: '#fff6d0', k: 0.16 },
  indoor: { amb: [214, 200, 184], grade: 'rgba(255,200,140,0.22)', rays: false, motes: '#ffe8b0', k: 0.14 },
  holy: { amb: [236, 226, 206], grade: 'rgba(255,230,170,0.28)', rays: true, motes: '#fff4c0', k: 0.14 },
  dark: { amb: [102, 94, 126], grade: 'rgba(120,110,200,0.20)', rays: false, motes: '#c8d0ff', k: 0.15 },
  fire: { amb: [130, 84, 70], grade: 'rgba(255,110,40,0.24)', rays: false, motes: '#ffb050', k: 0.15 },
  ice: { amb: [150, 176, 210], grade: 'rgba(150,200,255,0.24)', rays: false, motes: '#ffffff', k: 0.15 },
  deep: { amb: [84, 116, 136], grade: 'rgba(60,160,190,0.24)', rays: true, motes: '#a0f0ff', k: 0.15 },
  void: { amb: [94, 76, 126], grade: 'rgba(160,80,220,0.24)', rays: false, motes: '#e0a0ff', k: 0.16 },
  snow: { amb: [236, 240, 250], grade: 'rgba(190,220,255,0.20)', rays: true, motes: '#ffffff', k: 0.16 },
  dusk: { amb: [196, 170, 168], grade: 'rgba(255,140,90,0.22)', rays: true, motes: '#ffd0a0', k: 0.16 },
};
const HD_THEME = {
  world: 'day', wildworld: 'day', tideworld: 'day', town: 'day', solanthia: 'day', elf: 'day', vale: 'day', jungle: 'day',
  bloomgrove: 'day', heartgarden: 'day', hollow: 'day', silver: 'day', camp: 'dusk', wrendeck: 'day', sephara: 'day', nest: 'day',
  barge: 'dusk', storm: 'dark', moonhollow: 'dark', ashworld: 'dusk', frostworld: 'snow', snowtown: 'snow', snowpeak: 'snow',
  house: 'indoor', castle: 'indoor', tower: 'indoor', clinic: 'indoor', library: 'indoor', masks: 'indoor', hourglass: 'indoor', orrery: 'indoor',
  temple2: 'holy', chapel: 'holy', throne: 'holy', seatring: 'holy', prayers: 'holy',
  temple: 'dark', fen: 'dark', keep: 'dark', necro: 'dark', barrow: 'dark', undercity: 'dark', hoard: 'dark', ashen: 'dusk', emberport: 'dusk',
  forge: 'fire', caldera: 'fire', icecave: 'ice', drowned: 'deep', drownedsun: 'deep', godsdeep: 'void', godsfall: 'void', nightcore: 'void',
};
function hdMood(map) {
  if (!map) return HD_MOOD.day;
  if (map.hdMood) return HD_MOOD[typeof map.hdMood === 'function' ? map.hdMood() : map.hdMood] || HD_MOOD.day;
  return HD_MOOD[HD_THEME[map.theme]] || (map.world ? HD_MOOD.day : HD_MOOD.indoor);
}

// What glows: tile art -> [r, g, b, radius in tiles, flicker]
const HD_LIGHTS = {
  torch: [255, 170, 80, 3.4, 1], lantern: [255, 200, 110, 3, 1], altar: [255, 220, 140, 2.6, 0], lavaflow: [255, 110, 40, 2.4, 1],
  fountain: [140, 210, 255, 2, 0], veilcage: [190, 120, 255, 2.4, 1], shopdoor: [255, 190, 110, 1.8, 0], bloom: [255, 170, 220, 1.2, 0],
  lighthouse: [255, 240, 170, 4, 1], volcano: [255, 110, 40, 3, 1], cinderthrone: [255, 90, 60, 3, 1], ruin: [170, 140, 255, 1.6, 1], bell: [255, 230, 150, 1.6, 0],
};
const HD_WALLS = new Set(['wall', 'bwall', 'cliff', 'roof', 'mountain', 'keep', 'fortress']);

// ---- shadows -------------------------------------------------------------
HD2D.shadowStrips = (() => {
  const mk = (w, h, vertical) => {
    const c = mkCanvas(w, h), x = c.getContext('2d');
    const g = vertical ? x.createLinearGradient(0, 0, 0, h) : x.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(10,6,20,0.42)'); g.addColorStop(1, 'rgba(10,6,20,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h); return c;
  };
  const face = (() => { // the lit top edge and shaded front of a wall block
    const c = mkCanvas(TS, TS), x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, TS);
    g.addColorStop(0, 'rgba(255,240,210,0.16)'); g.addColorStop(0.12, 'rgba(255,240,210,0)'); g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,6,24,0.34)');
    x.fillStyle = g; x.fillRect(0, 0, TS, TS); return c;
  })();
  return { top: mk(TS, 18, true), left: mk(10, TS, false), face };
})();
// Called right after the floor tiles: walls get a lit top and a shaded face, and
// throw a soft shadow down and to the right onto whatever is below them.
HD2D.tileShadows = function (f, x0, y0, x1, y1, cx, cy) {
  const S = this.shadowStrips, cast = (x, y) => { const c = f.tileAt(x, y); if (c == null) return false; const t = f.tileDef(c); return t.solid && !t.sea && t.art !== 'water' && t.art !== 'river' && t.art !== 'ocean' && t.art !== 'void' && t.art !== 'lavaflow'; };
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const c = f.tileAt(x, y); if (c == null) continue;
    const t = f.tileDef(c), sx = x * TS - cx, sy = y * TS - cy;
    if (t.solid) { if (HD_WALLS.has(t.art) && !cast(x, y + 1)) ctx.drawImage(S.face, sx, sy); continue; }
    if (cast(x, y - 1)) ctx.drawImage(S.top, sx, sy);
    if (cast(x - 1, y)) ctx.drawImage(S.left, sx, sy);
  }
};
HD2D.blob = function (x, y, r = 17) {
  ctx.fillStyle = 'rgba(12,8,24,0.32)'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.38, 0, 0, Math.PI * 2); ctx.fill();
};

// ---- light -----------------------------------------------------------------
HD2D.light = function (f, x0, y0, x1, y1, cx, cy) {
  const mood = hdMood(f.map), lights = [];
  for (let y = y0 - 3; y <= y1 + 3; y++) for (let x = x0 - 3; x <= x1 + 3; x++) {
    const c = f.tileAt(x, y); if (c == null) continue;
    const L = HD_LIGHTS[f.tileDef(c).art]; if (L) lights.push([x * TS - cx + TS / 2, y * TS - cy + TS / 2, L, x * 7 + y * 13]);
  }
  const t = Game.frame, fl = (L, seed) => L[4] ? 0.88 + 0.08 * Math.sin(t / 6 + seed) + 0.04 * Math.sin(t / 2.3 + seed * 3) : 1;
  if (mood.amb) {
    const w = W / 2, h = H / 2, lm = HD2D.canvas('light', w, h), x = lm.x;
    x.globalCompositeOperation = 'source-over'; x.fillStyle = `rgb(${mood.amb})`; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'lighter';
    const glow = (px, py, r, col, a) => { const g = x.createRadialGradient(px / 2, py / 2, 0, px / 2, py / 2, r / 2); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.fillRect(px / 2 - r / 2, py / 2 - r / 2, r, r); };
    // the party always carries a little light into dark places
    if (!f.hidePlayer) { const [px, py] = f.playerPos(); const dark = 255 - Math.min(...mood.amb); if (dark > 40) glow(px * TS - cx + TS / 2, py * TS - cy + TS / 2, 230, '255,226,170', 0.55 * dark / 255 + 0.25); }
    for (const [px, py, L, s] of lights) glow(px, py, L[3] * TS * 2 * fl(L, s), `${L[0]},${L[1]},${L[2]}`, 0.9);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.imageSmoothingEnabled = true;
    ctx.drawImage(lm, 0, 0, W, H); ctx.restore();
  }
  // a warm halo on every light source, day or night
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [px, py, L, s] of lights) {
    const r = TS * (0.7 + L[3] * 0.25) * fl(L, s), g = ctx.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, `rgba(${L[0]},${L[1]},${L[2]},0.30)`); g.addColorStop(1, `rgba(${L[0]},${L[1]},${L[2]},0)`);
    ctx.fillStyle = g; ctx.fillRect(px - r, py - r, r * 2, r * 2);
  }
  ctx.restore();
};

// ---- atmosphere: sun shafts and floating dust ------------------------------------
HD2D.motes = Array.from({ length: 46 }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, z: Math.random(), s: i * 1.7 }));
HD2D.atmosphere = function (mood) {
  const t = Game.frame;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (mood.rays) for (let i = 0; i < 4; i++) {
    const bx = ((i * 290 + t * 0.15) % (W + 400)) - 200, a = 0.045 + 0.025 * Math.sin(t / 90 + i * 2);
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(255,236,190,${a})`); g.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx + 90 + i * 20, 0); ctx.lineTo(bx + 330 + i * 20, H); ctx.lineTo(bx + 200, H); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = mood.motes;
  for (const m of this.motes) {
    m.y -= 0.12 + m.z * 0.25; m.x += Math.sin((t + m.s * 40) / 70) * 0.3;
    if (m.y < -4) { m.y = H + 4; m.x = Math.random() * W; }
    ctx.globalAlpha = (0.25 + 0.45 * m.z) * (0.6 + 0.4 * Math.sin(t / 25 + m.s));
    const r = 0.8 + m.z * 1.8; ctx.beginPath(); ctx.arc(m.x, m.y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};

// ---- screen passes -------------------------------------------------------------
HD2D.snapshot = function () { const b = this.canvas('snap', W, H); b.x.globalCompositeOperation = 'copy'; b.x.drawImage(canvas, 0, 0); return b; };
// Tilted camera: rows near the top are distant (narrow, squashed), rows near the bottom close.
HD2D.tilt = function (k) {
  if (k <= 0) return;
  const src = this.snapshot(), ln = Math.log(1 + k), band = 2;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.globalCompositeOperation = 'source-over';
  for (let y = 0; y < H; y += band) {
    const g0 = H * Math.log(1 + k * y / H) / ln, g1 = H * Math.log(1 + k * (y + band) / H) / ln;
    const s = 1 + k * (y + band / 2) / H, sw = W / s;
    ctx.drawImage(src, (W - sw) / 2, g0, sw, Math.max(0.5, g1 - g0), 0, y, W, band);
  }
  ctx.restore();
};
// where a world row ends up on screen after the tilt (for things drawn after it)
HD2D.tiltY = function (y, k) { if (!k) return y; const ln = Math.log(1 + k); return H * (Math.exp(y / H * ln) - 1) / k; };
HD2D.blurInto = function (key, src, px) {
  const c = this.canvas(key, W, H);
  c.x.globalCompositeOperation = 'copy';
  if (this.hasFilter) { c.x.filter = `blur(${px}px)`; c.x.drawImage(src, 0, 0); c.x.filter = 'none'; }
  else { const q = this.canvas(key + 'q', W >> 2, H >> 2); q.x.imageSmoothingEnabled = true; q.x.globalCompositeOperation = 'copy'; q.x.drawImage(src, 0, 0, q.width, q.height); c.x.imageSmoothingEnabled = true; c.x.drawImage(q, 0, 0, W, H); }
  return c;
};
HD2D.masks = {};
HD2D.mask = function (top, bot) {
  const key = top + ':' + bot; if (this.masks[key]) return this.masks[key];
  const c = mkCanvas(W, H), x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(top, 'rgba(0,0,0,0)'); g.addColorStop(bot, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
  x.fillStyle = g; x.fillRect(0, 0, W, H); return (this.masks[key] = c);
};
// Depth of field: everything outside the focus band goes soft.
HD2D.dof = function (px, top = 0.3, bot = 0.8) {
  const b = this.blurInto('dof', canvas, px);
  b.x.globalCompositeOperation = 'destination-in'; b.x.drawImage(this.mask(top, bot), 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(b, 0, 0); ctx.restore();
};
// Bloom: only the brightest pixels spill light.
HD2D.bloom = function (strength = 0.6, cut = 190) {
  const w = 160, h = Math.round(160 * H / W), s = this.canvas('bloomS', w, h, true);
  s.x.imageSmoothingEnabled = true; s.x.globalCompositeOperation = 'copy'; s.x.drawImage(canvas, 0, 0, w, h);
  const d = s.x.getImageData(0, 0, w, h), p = d.data, span = 255 - cut;
  for (let i = 0; i < p.length; i += 4) {
    const l = Math.max(p[i], p[i + 1], p[i + 2]) * 0.5 + (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) * 0.5, k = l > cut ? (l - cut) / span : 0;
    p[i] *= k; p[i + 1] *= k; p[i + 2] *= k;
  }
  s.x.putImageData(d, 0, 0);
  const b = this.canvas('bloomB', w * 2, h * 2); b.x.globalCompositeOperation = 'copy'; b.x.imageSmoothingEnabled = true;
  if (this.hasFilter) b.x.filter = 'blur(5px)'; b.x.drawImage(s, 0, 0, w * 2, h * 2); b.x.filter = 'none';
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = strength; ctx.imageSmoothingEnabled = true;
  ctx.drawImage(b, 0, 0, W, H); ctx.restore();
};
HD2D.vig = null;
HD2D.grade = function (mood) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (mood.grade) { ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = mood.grade; ctx.fillRect(0, 0, W, H); }
  if (!this.vig) {
    const c = mkCanvas(W, H), x = c.getContext('2d'), g = x.createRadialGradient(W / 2, H * 0.48, H * 0.32, W / 2, H * 0.5, W * 0.62);
    g.addColorStop(0, 'rgba(8,4,18,0)'); g.addColorStop(1, 'rgba(8,4,18,0.55)'); x.fillStyle = g; x.fillRect(0, 0, W, H); this.vig = c;
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(this.vig, 0, 0);
  ctx.restore();
};

// ---- the field, start to finish ------------------------------------------------
HD2D.fieldK = function (f) {
  const m = hdMood(f.map);
  if (f.map.world) return S().flying ? 0.42 : 0.22;
  return m.k;
};
HD2D.fieldPost = function (f) {
  const mood = hdMood(f.map), k = this.fieldK(f);
  this.atmosphere(mood);
  this.tilt(k);
  this.dof(f.map.world && S().flying ? 3.5 : 2.5, f.map.world && S().flying ? 0.38 : 0.26, 0.82);
  const dim = mood.amb && Math.min(...mood.amb) < 200;
  this.bloom(dim ? 0.7 : 0.35, dim ? 150 : 244);
  this.grade(mood);
};

// ---- battles ---------------------------------------------------------------------
HD2D._bg = {};
// The backdrop is the distance: soften it, sharpest where the fighters stand.
HD2D.battleBg = function (name) {
  if (this._bg[name]) return this._bg[name];
  const src = battleBg(name), c = mkCanvas(src.width, src.height), x = c.getContext('2d');
  x.drawImage(src, 0, 0);
  const b = mkCanvas(src.width, src.height), bx = b.getContext('2d');
  if (this.hasFilter) { bx.filter = 'blur(3px)'; bx.drawImage(src, 0, 0); }
  else { const q = mkCanvas(src.width >> 2, src.height >> 2), qx = q.getContext('2d'); qx.imageSmoothingEnabled = true; qx.drawImage(src, 0, 0, q.width, q.height); bx.imageSmoothingEnabled = true; bx.drawImage(q, 0, 0, src.width, src.height); }
  const g = bx.createLinearGradient(0, 0, 0, src.height); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.5, 'rgba(0,0,0,0.85)'); g.addColorStop(0.72, 'rgba(0,0,0,0)');
  bx.globalCompositeOperation = 'destination-in'; bx.fillStyle = g; bx.fillRect(0, 0, src.width, src.height);
  x.drawImage(b, 0, 0);
  // a little haze where the ground meets the sky, so the fighters stand forward of it
  const hz = x.createLinearGradient(0, src.height * 0.3, 0, src.height * 0.62); hz.addColorStop(0, 'rgba(255,240,220,0)'); hz.addColorStop(0.6, 'rgba(255,240,220,0.10)'); hz.addColorStop(1, 'rgba(255,240,220,0)');
  x.fillStyle = hz; x.fillRect(0, 0, src.width, src.height);
  return (this._bg[name] = c);
};
const HD_BATTLE_MOOD = { deepwood: 'dark', burning: 'fire', river: 'dark', sanctum: 'void', ashplains: 'dusk', lava: 'fire', forge: 'fire', grave: 'dark', volcano: 'fire', caldera: 'fire', port2: 'dusk', snowfield: 'snow', icecave: 'ice', summit: 'snow', undercity: 'dark', drowned: 'deep', library: 'indoor', fey: 'void', temple: 'holy', tower: 'holy' };
HD2D.battlePost = function (b) {
  const mood = HD_MOOD[HD_BATTLE_MOOD[b.bg]] || HD_MOOD.day;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, FIELD_H + 8); ctx.clip(); this.atmosphere(mood); ctx.restore();
  this.bloom(0.45, 225);
  this.grade(mood);
};
