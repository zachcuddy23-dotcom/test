'use strict';
// ---------------------------------------------------------------------------
// Text & windows
// ---------------------------------------------------------------------------
function setFont(size = 16) { ctx.font = `${size}px ${FONT}`; ctx.textBaseline = 'top'; }
function text(str, x, y, color = '#fff', size = 16, align = 'left') {
  setFont(size); ctx.textAlign = align;
  ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillText(str, x + 2, y + 2);
  ctx.fillStyle = color; ctx.fillText(str, x, y);
  ctx.textAlign = 'left';
}
function textW(str, size = 16) { setFont(size); return ctx.measureText(str).width; }
function wrapText(str, maxW, size = 16) {
  const out = [];
  for (const para of String(str).split('\n')) {
    const words = para.split(' '); let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (textW(t, size) > maxW && line) { out.push(line); line = w; } else line = t;
    }
    out.push(line);
  }
  return out;
}
function drawWindow(x, y, w, h, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#2a3aa8'); g.addColorStop(1, '#0c1660');
  ctx.fillStyle = g; roundRect(x + 3, y + 3, w - 6, h - 6, 6); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#e8e8f0'; roundRect(x + 3, y + 3, w - 6, h - 6, 6); ctx.stroke();
  ctx.lineWidth = 2; ctx.strokeStyle = '#6a6a88'; roundRect(x + 7, y + 7, w - 14, h - 14, 4); ctx.stroke();
  ctx.restore();
}
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
const HAND = (() => { // pixel-art pointing glove
  const rows = [
    '..########......',
    '.#wwwwwwww#.....',
    '#wwwwwwwwww####.',
    '#wwwwwwwwwwwwww#',
    '#wwwwwww#######.',
    '#wwwwwwwww#.....',
    '#wwwwwww##......',
    '#gwwwwwwww#.....',
    '.#gggwww##......',
    '..######........'];
  const c = mkCanvas(16, 10), x = c.getContext('2d');
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') { x.fillStyle = ch === '#' ? '#202030' : ch === 'w' ? '#ffffff' : '#a0a0b8'; x.fillRect(i, j, 1, 1); } }));
  return c;
})();
function drawCursor(x, y, blink) {
  if (blink && Math.floor(Game.frame / 8) % 2) return;
  const bob = Math.floor(Game.frame / 10) % 2 ? 2 : 0;
  ctx.drawImage(HAND, x - 34 + bob, y - 2, 32, 20);
}
function bar(x, y, w, h, frac, col) {
  ctx.fillStyle = '#101018'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = col; ctx.fillRect(x + 1, y + 1, Math.max(0, (w - 2) * clamp(frac, 0, 1)), h - 2);
}

// ---------------------------------------------------------------------------
// List menu widget
// ---------------------------------------------------------------------------
class ListMenu {
  constructor(items, o = {}) {
    this.items = items; this.x = o.x || 0; this.y = o.y || 0; this.w = o.w || 300; this.cols = o.cols || 1;
    this.rowH = o.rowH || 36; this.rows = o.rows || 8; this.index = o.index || 0; this.scroll = 0; this.pad = o.pad == null ? 48 : o.pad;
    this.onMove = o.onMove; this.window = o.window !== false; this.h = o.h; this.title = o.title; this.size = o.size || 16;
    this.clampIndex();
  }
  clampIndex() { this.index = clamp(this.index, 0, Math.max(0, this.items.length - 1)); }
  get cur() { return this.items[this.index]; }
  update() {
    const n = this.items.length; if (!n) { if (Input.cancel()) { Audio2.sfx('cancel'); return { cancel: true }; } return null; }
    const old = this.index, c = this.cols;
    if (Input.rep('down')) this.index = this.index + c < n ? this.index + c : this.index % c;
    if (Input.rep('up')) this.index = this.index - c >= 0 ? this.index - c : Math.min(n - 1, (Math.ceil(n / c) - 1) * c + this.index % c);
    if (c > 1 && Input.rep('right')) this.index = Math.min(n - 1, this.index + 1);
    if (c > 1 && Input.rep('left')) this.index = Math.max(0, this.index - 1);
    if (old !== this.index) { Audio2.sfx('cursor'); if (this.onMove) this.onMove(this.cur, this.index); }
    const row = Math.floor(this.index / c);
    if (row < this.scroll) this.scroll = row;
    if (row >= this.scroll + this.rows) this.scroll = row - this.rows + 1;
    if (Input.ok()) {
      if (this.items[this.index].disabled) { Audio2.sfx('error'); return null; }
      Audio2.sfx('ok'); return { select: this.items[this.index], index: this.index };
    }
    if (Input.cancel()) { Audio2.sfx('cancel'); return { cancel: true }; }
    return null;
  }
  height() { return this.h || (Math.min(this.rows, Math.ceil(this.items.length / this.cols)) * this.rowH + 40 + (this.title ? 30 : 0)); }
  draw(active = true) {
    const h = this.height();
    if (this.window) drawWindow(this.x, this.y, this.w, h);
    let oy = this.y + 22;
    if (this.title) { text(this.title, this.x + 24, oy, '#ffe070', this.size); oy += 30; }
    const colW = (this.w - this.pad - 20) / this.cols;
    for (let i = this.scroll * this.cols; i < Math.min(this.items.length, (this.scroll + this.rows) * this.cols); i++) {
      const it = this.items[i], r = Math.floor(i / this.cols) - this.scroll, cc = i % this.cols;
      const x = this.x + this.pad + cc * colW, y = oy + r * this.rowH;
      if (it.icon) it.icon(x, y);
      text(it.text, x + (it.icon ? 26 : 0), y, it.disabled ? '#8088a8' : (it.color || '#fff'), this.size);
      if (it.right != null) text(String(it.right), x + colW - 10, y, it.disabled ? '#8088a8' : '#fff', this.size, 'right');
      if (i === this.index) drawCursor(x, y, !active);
    }
    const totalRows = Math.ceil(this.items.length / this.cols);
    if (this.scroll > 0) text('▲', this.x + this.w - 30, this.y + 12, '#fff', 12);
    if (this.scroll + this.rows < totalRows) text('▼', this.x + this.w - 30, this.y + h - 26, '#fff', 12);
  }
}

// ---------------------------------------------------------------------------
// Image assets (embedded as data URIs in assets.js)
// ---------------------------------------------------------------------------
const IMG = {};
function loadAssets() {
  const ps = [];
  for (const [k, src] of Object.entries(ASSETS)) {
    ps.push(new Promise(res => { const im = new Image(); im.onload = () => { IMG[k] = im; res(); }; im.onerror = () => res(); im.src = src; }));
  }
  return Promise.all(ps);
}
// recolor via HSL shift (cached)
const _recolorCache = {};
function recolored(key, tint) {
  if (!tint) return IMG[key];
  const ck = key + JSON.stringify(tint);
  if (_recolorCache[ck]) return _recolorCache[ck];
  const im = IMG[key]; const c = mkCanvas(im.width, im.height), x = c.getContext('2d');
  x.drawImage(im, 0, 0);
  try {
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      if (!p[i + 3]) continue;
      let [h, s, l] = rgb2hsl(p[i], p[i + 1], p[i + 2]);
      if (s < 0.08 && !tint.all) { l = clamp(l * (tint.l || 1), 0, 1); }
      else { h = (h + (tint.h || 0) / 360 + 1) % 1; s = clamp(s * (tint.s || 1), 0, 1); l = clamp(l * (tint.l || 1), 0, 1); }
      const [r, g, b] = hsl2rgb(h, s, l); p[i] = r; p[i + 1] = g; p[i + 2] = b;
    }
    x.putImageData(d, 0, 0);
  } catch (e) { /* tainted canvas: fall back to original colors */ }
  return (_recolorCache[ck] = c);
}
function rgb2hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h, s, l]; }
function hsl2rgb(h, s, l) { if (!s) { const v = Math.round(l * 255); return [v, v, v]; } const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; const f = t => { t = (t + 1) % 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }; return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255)]; }
// white silhouette version (for hit flashes)
const _flashCache = new Map();
function flashed(img, color = '#fff') {
  const k = img; if (_flashCache.has(k)) return _flashCache.get(k);
  const c = mkCanvas(img.width, img.height), x = c.getContext('2d');
  x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  _flashCache.set(k, c); return c;
}

// ---------------------------------------------------------------------------
// Pixel painter used by tile & chibi generators
// ---------------------------------------------------------------------------
function painter(c) {
  const x = c.getContext('2d');
  return {
    x,
    p(i, j, col) { if (!col) return; x.fillStyle = col; x.fillRect(i, j, 1, 1); },
    r(i0, j0, i1, j1, col) { if (!col) return; x.fillStyle = col; x.fillRect(Math.min(i0, i1), Math.min(j0, j1), Math.abs(i1 - i0) + 1, Math.abs(j1 - j0) + 1); },
    circ(cx, cy, rad, col) { x.fillStyle = col; for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) if (i * i + j * j <= rad * rad + rad * 0.8) x.fillRect(cx + i, cy + j, 1, 1); },
  };
}
function outline(c, col = '#141018') {
  const x = c.getContext('2d'), w = c.width, h = c.height;
  const d = x.getImageData(0, 0, w, h), p = d.data, a = i => p[i * 4 + 3] > 0;
  const add = [];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const k = j * w + i; if (a(k)) continue;
    if ((i > 0 && a(k - 1)) || (i < w - 1 && a(k + 1)) || (j > 0 && a(k - w)) || (j < h - 1 && a(k + w))) add.push(k);
  }
  x.fillStyle = col; for (const k of add) x.fillRect(k % w, Math.floor(k / w), 1, 1);
}
function shade(hex, f) { // f<1 darker, f>1 lighter
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (f < 1) { r *= f; g *= f; b *= f; } else { r += (255 - r) * (f - 1); g += (255 - g) * (f - 1); b += (255 - b) * (f - 1); }
  return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}
