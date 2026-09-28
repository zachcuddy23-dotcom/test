// Headless harness: loads the game scripts with a stubbed DOM/canvas so logic can be tested in node.
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..', '..');
function stubCtx() {
  return new Proxy({}, { get: (t, k) => { if (k === 'measureText') return s => ({ width: String(s).length * 16 }); if (k === 'createLinearGradient') return () => ({ addColorStop() {} }); if (k === 'getImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }); if (k in t) return t[k]; return () => {}; }, set: (t, k, v) => { t[k] = v; return true; } });
}
function mkEl() { return { width: 16, height: 16, getContext: () => stubCtx(), addEventListener() {}, classList: { add() {} }, querySelectorAll: () => [], style: {} }; }
const ctx = {
  console, Math, JSON, Promise, setTimeout, clearTimeout, setInterval, clearInterval, Uint8ClampedArray, Array, Object, Map, Set, String, Number, Error,
  document: { getElementById: () => mkEl(), createElement: () => mkEl(), fonts: { load: () => Promise.resolve() }, body: { classList: { add() {} } } },
  window: { addEventListener() {}, matchMedia: () => ({ matches: false }) },
  Image: class { set src(v) { this.width = 100; this.height = 120; setTimeout(() => this.onload && this.onload()); } },
  localStorage: { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } },
  requestAnimationFrame: () => {},
};
ctx.window.AudioContext = undefined; ctx.globalThis = ctx;
vm.createContext(ctx);
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/src="(js\/[^"]+)"/g)].map(m => m[1]);
let src = '';
for (const f of files) src += fs.readFileSync(path.join(root, f), 'utf8').replace(/^'use strict';/, '') + '\n';
src = src.replace(/^\(async function boot\(\)[\s\S]*?\}\)\(\);/m, '');
vm.runInContext(src + '\nthis.__ok=true; for (const k of ["MAPS","WORLD","IN_TILES","WORLD_TILES","ENEMIES","JOBS","SKILLS","ITEMS","EQUIP","HEROES","SHOPS","FORMATIONS","Game","INNATE","KEY_ITEMS","JOB_ORDER","JP_TABLE","EXP_TABLE","Input","IMG","MUSIC","LOOKS"]) this[k]=eval(k);', ctx, { filename: 'game.js' });
module.exports = ctx;
