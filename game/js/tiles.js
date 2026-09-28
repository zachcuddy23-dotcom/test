'use strict';
// ---------------------------------------------------------------------------
// Procedural 16x16 tile art, cached per (art, theme, variant, frame)
// ---------------------------------------------------------------------------
const THEMES = {
  world: { grass: '#5aa83e' },
  town: { wall: '#8e887c', wallDark: '#4e4a44', floor: '#c8b088', floor2: '#bca47c', grass: '#5aa83e', roof: '#b44a36', bwall: '#e4d4b4', timber: '#6a4a30', path: '#cdb48a', water: '#3a78c8', carpet: '#a82838', wood: '#8a5a30' },
  castle: { wall: '#7a809a', wallDark: '#3e4458', floor: '#9ea4b8', floor2: '#8e94a8', grass: '#5aa83e', carpet: '#b02838', water: '#3a78c8', wood: '#7a4a28', path: '#9ea4b8' },
  temple: { wall: '#74503e', wallDark: '#3a2620', floor: '#6e625a', floor2: '#645850', grass: '#4a7a36', carpet: '#6a2020', water: '#3a58a0', wood: '#5a3a28', path: '#6e625a' },
  fen: { wall: '#4a5e3e', wallDark: '#26321e', floor: '#5e5e46', floor2: '#56563e', grass: '#3e6a34', mud: '#5e4a2e', water: '#2e5a52', wood: '#5a4428', path: '#5e5e46' },
  keep: { wall: '#443a56', wallDark: '#1e1828', floor: '#564c6a', floor2: '#4c425e', carpet: '#6e1a4e', grass: '#3a5a36', water: '#2a3a6a', wood: '#4a3048', path: '#564c6a' },
  elf: { wall: '#7a6a4a', wallDark: '#3e3424', floor: '#b8a070', floor2: '#ac9464', grass: '#4aa048', roof: '#3e8a44', bwall: '#c49a62', timber: '#6a4a2a', path: '#c2aa7a', water: '#3a88c0', carpet: '#3a7a5a', wood: '#8a6038' },
  house: { wall: '#8a6a44', wallDark: '#4a3622', floor: '#a88050', floor2: '#9c7446', grass: '#5aa83e', carpet: '#3a7a5a', wood: '#6a4424', path: '#a88050' },
};
const _tileCache = {};
function tileImg(art, theme, variant = 0, frame = 0) {
  const k = art + '|' + theme + '|' + variant + '|' + frame;
  let c = _tileCache[k]; if (c) return c;
  c = mkCanvas(16, 16); const P = painter(c), th = THEMES[theme] || THEMES.town;
  const rng = srand(variant * 7919 + art.length * 131 + 17);
  (TILE_ART[art] || TILE_ART.void)(P, th, rng, frame, variant);
  return (_tileCache[k] = c);
}
function speckle(P, rng, base, n, cols) { P.r(0, 0, 15, 15, base); for (let i = 0; i < n; i++) P.p(Math.floor(rng() * 16), Math.floor(rng() * 16), cols[Math.floor(rng() * cols.length)]); }
function drawTree(P, cx, cy, r, dark = '#2a6a2a') {
  P.r(cx - 1, cy + r - 1, cx, cy + r + 2, '#5a3a20');
  P.circ(cx, cy, r, '#16381a'); P.circ(cx, cy, r - 1, dark); P.circ(cx - 1, cy - 1, r - 2, shade(dark, 1.25)); P.p(cx - 2, cy - 2, shade(dark, 1.6));
}
const TILE_ART = {
  void(P) { P.r(0, 0, 15, 15, '#000'); },
  grass(P, th, rng) {
    const g = th.grass || '#5aa83e';
    speckle(P, rng, g, 26, [shade(g, 0.82), shade(g, 1.15)]);
    for (let i = 0; i < 3; i++) { const x = 1 + Math.floor(rng() * 13), y = 2 + Math.floor(rng() * 12); P.p(x, y, shade(g, 0.7)); P.p(x + 2, y, shade(g, 0.7)); P.p(x + 1, y + 1, shade(g, 0.7)); }
  },
  forest(P, th, rng) {
    TILE_ART.grass(P, th, rng);
    drawTree(P, 4, 5, 4, '#2e7a30'); drawTree(P, 12, 4, 4, '#2a7030'); drawTree(P, 8, 10, 4, '#2e7a30');
  },
  mountain(P, th, rng) {
    TILE_ART.grass(P, th, rng);
    const pk = 8, dark = '#141018';
    for (let y = 1; y <= 15; y++) {
      const half = Math.floor((y - 1) * 0.55) + 1;
      for (let x = pk - half; x <= pk + half; x++) {
        if (x < 0 || x > 15) continue;
        let c = x < pk ? '#a08868' : '#7a6448';
        if (y < 5) c = x < pk ? '#f4f4f8' : '#c8cce0';
        if (x === pk - half || x === pk + half) c = dark;
        P.p(x, y, c);
      }
    }
    P.p(pk, 0, dark); P.p(pk - 2, 8, '#6a5438'); P.p(pk + 3, 11, '#5a4430'); P.p(pk - 4, 12, '#8a7050');
  },
  ocean(P, th, rng, f) {
    P.r(0, 0, 15, 15, '#2a5ab8');
    const cols = ['#3a70d0', '#1e4a9c'];
    for (let i = 0; i < 6; i++) { const y = (i * 5 + 1) % 16, x = (i * 7 + f * 2) % 16; P.r(x, y, Math.min(15, x + 3), y, cols[0]); P.p((x + 8) % 16, (y + 2) % 16, cols[1]); }
    if (f % 2) P.p((f * 5) % 16, 7, '#a8c8f0');
  },
  river(P, th, rng, f) {
    P.r(0, 0, 15, 15, '#3a78d0');
    for (let i = 0; i < 5; i++) { const x = (i * 5 + 2) % 16, y = (i * 7 + f * 3) % 16; P.r(x, y, x, Math.min(15, y + 3), '#6aa0e8'); }
  },
  bridge(P, th, rng, f) {
    TILE_ART.river(P, th, rng, f);
    P.r(0, 2, 15, 13, '#8a5a30');
    for (let x = 0; x < 16; x += 3) P.r(x, 2, x, 13, '#5a3a1e');
    P.r(0, 1, 15, 2, '#c08a50'); P.r(0, 13, 15, 14, '#c08a50'); P.r(0, 3, 15, 3, '#3a2410'); P.r(0, 15, 15, 15, '#2a4a8a');
  },
  sand(P, th, rng) { speckle(P, rng, '#e2cc8c', 22, ['#cdb676', '#f0dca0']); },
  swamp(P, th, rng) {
    speckle(P, rng, '#4e5e36', 30, ['#3e4e2a', '#5e6e40']);
    P.r(3, 5, 7, 7, '#2e4a3e'); P.r(9, 10, 13, 12, '#2e4a3e'); P.p(4, 5, '#4a7a6a'); P.p(10, 10, '#4a7a6a');
    P.r(11, 2, 11, 5, '#7a8a3a'); P.r(13, 3, 13, 6, '#7a8a3a'); P.r(2, 11, 2, 14, '#7a8a3a');
  },
  town(P, th, rng) {
    TILE_ART.grass(P, th, rng);
    const house = (x, y, roof) => { P.r(x, y + 3, x + 5, y + 7, '#e4d4b4'); P.r(x - 1, y + 1, x + 6, y + 3, roof); P.r(x, y, x + 5, y, shade(roof, 0.7)); P.r(x + 2, y + 5, x + 3, y + 7, '#5a3a20'); P.r(x - 1, y + 8, x + 6, y + 8, '#20301a'); };
    house(1, 1, '#b44a36'); house(9, 3, '#b44a36'); house(4, 7, '#c86440');
  },
  port(P, th, rng) {
    TILE_ART.grass(P, th, rng);
    const house = (x, y, roof) => { P.r(x, y + 3, x + 5, y + 7, '#e4d4b4'); P.r(x - 1, y + 1, x + 6, y + 3, roof); P.r(x + 2, y + 5, x + 3, y + 7, '#5a3a20'); P.r(x - 1, y + 8, x + 6, y + 8, '#20301a'); };
    house(1, 1, '#3a5ab0'); house(8, 2, '#3a5ab0'); P.r(9, 12, 15, 13, '#8a5a30'); P.r(1, 11, 6, 14, '#e4d4b4'); P.r(0, 10, 7, 11, '#2a4a9a');
  },
  castle(P, th, rng) {
    TILE_ART.grass(P, th, rng);
    const st = '#b8bccc', dk = '#6a6e80';
    P.r(2, 5, 13, 14, st); P.r(1, 2, 4, 14, st); P.r(11, 2, 14, 14, st);
    for (let x = 1; x <= 14; x += 2) { P.p(x, 1, st); } P.r(1, 1, 4, 1, st); P.r(11, 1, 14, 1, st);
    P.r(0, 0, 0, 0, '#000'); P.r(2, 0, 3, 0, '#c02030'); P.r(12, 0, 13, 0, '#c02030');
    P.r(4, 14, 11, 14, dk); P.r(6, 9, 9, 14, '#3a2a20'); P.r(6, 9, 9, 9, dk);
    P.p(2, 6, dk); P.p(13, 6, dk); P.p(2, 10, dk); P.p(13, 10, dk); P.r(1, 15, 14, 15, '#20301a');
  },
  temple(P, th, rng) {
    speckle(P, rng, '#3e5a2e', 20, ['#2e4a22', '#4e6a3a']);
    const st = '#a89a88', dk = '#5a5048';
    P.r(1, 4, 14, 5, st); P.r(3, 2, 12, 3, st); P.r(6, 1, 9, 1, st);
    for (const x of [2, 6, 9, 13]) { P.r(x, 6, x + 1, 13, st); P.p(x + 1, 7, dk); P.p(x, 11, dk); }
    P.r(1, 14, 14, 15, dk); P.r(10, 5, 12, 5, '#3e5a2e'); P.r(13, 9, 14, 13, '#3e5a2e'); P.p(14, 12, st);
  },
  elfvillage(P, th, rng) {
    TILE_ART.grass(P, { grass: '#4aa048' }, rng);
    drawTree(P, 3, 4, 3, '#2e7a30'); drawTree(P, 13, 12, 3, '#2e7a30');
    const hut = (x, y) => { P.r(x, y + 3, x + 5, y + 7, '#c49a62'); P.r(x - 1, y, x + 6, y + 3, '#3e8a44'); P.r(x, y - 1, x + 5, y - 1, '#2a6a30'); P.r(x + 2, y + 5, x + 3, y + 7, '#4a2a18'); };
    hut(8, 2); hut(2, 9);
  },
  cave(P, th, rng) {
    TILE_ART.mountain(P, th, rng);
    P.r(5, 9, 10, 15, '#101010'); P.r(6, 8, 9, 8, '#101010'); P.r(4, 10, 4, 15, '#3a2a1e'); P.r(11, 10, 11, 15, '#3a2a1e');
  },
  keep(P, th, rng) {
    speckle(P, rng, '#3e5a36', 20, ['#2e4a2a', '#4e6a42']);
    const st = '#4e4462', dk = '#2a2236', hi = '#6e6488';
    P.r(3, 5, 12, 14, st); P.r(1, 1, 4, 14, st); P.r(11, 1, 14, 14, st); P.r(6, 3, 9, 14, st);
    P.p(2, 0, st); P.p(12, 0, st); P.p(7, 2, st); P.p(8, 1, '#b040ff');
    P.r(1, 1, 1, 14, hi); P.r(6, 3, 6, 14, hi);
    P.r(6, 10, 9, 14, '#0a0610'); P.p(2, 5, '#e0a0ff'); P.p(13, 5, '#e0a0ff'); P.r(1, 15, 14, 15, dk);
  },
  // ---- interior
  wallTop(P, th, rng) { speckle(P, rng, th.wallDark, 14, [shade(th.wallDark, 0.8), shade(th.wallDark, 1.15)]); },
  wallFace(P, th, rng) {
    const w = th.wall, m = shade(w, 0.65);
    P.r(0, 0, 15, 15, w);
    for (let y = 0; y < 16; y += 4) { P.r(0, y + 3, 15, y + 3, m); const o = (y / 4) % 2 ? 4 : 0; for (let x = o; x < 16; x += 8) P.r(x, y, x, y + 2, m); }
    P.r(0, 0, 15, 0, shade(w, 1.25));
    for (let i = 0; i < 6; i++) P.p(Math.floor(rng() * 16), Math.floor(rng() * 16), shade(w, 1.12));
  },
  torch(P, th, rng, f) {
    TILE_ART.wallFace(P, th, rng);
    P.r(7, 8, 8, 12, '#4a3020'); P.r(6, 7, 9, 8, '#6a4a30');
    const fl = f % 2 ? ['#ffe060', '#ff8020'] : ['#fff0a0', '#ff6010'];
    P.r(6, 3, 9, 6, fl[1]); P.r(7, 2 + (f % 2), 8, 6, fl[0]); P.p(7, 1, fl[1]);
  },
  floor(P, th, rng, f, v) {
    const a = th.floor, b = th.floor2;
    P.r(0, 0, 15, 15, (v % 2) ? a : b);
    P.r(0, 15, 15, 15, shade(a, 0.8)); P.r(15, 0, 15, 15, shade(a, 0.8));
    for (let i = 0; i < 5; i++) P.p(Math.floor(rng() * 15), Math.floor(rng() * 15), shade(a, 0.9));
  },
  planks(P, th, rng) {
    const a = th.floor; P.r(0, 0, 15, 15, a);
    for (let y = 3; y < 16; y += 4) P.r(0, y, 15, y, shade(a, 0.72));
    for (let y = 0; y < 16; y += 4) { const x = Math.floor(rng() * 14) + 1; P.r(x, y, x, y + 2, shade(a, 0.78)); }
  },
  path(P, th, rng) { speckle(P, rng, th.path || th.floor, 18, [shade(th.path || th.floor, 0.88), shade(th.path || th.floor, 1.08)]); },
  mud(P, th, rng) { speckle(P, rng, th.mud || '#5e4a2e', 30, [shade(th.mud || '#5e4a2e', 0.8), shade(th.mud || '#5e4a2e', 1.15)]); P.r(4, 6, 7, 7, '#3e3020'); P.r(10, 11, 12, 12, '#3e3020'); },
  tree(P, th, rng) { TILE_ART.grass(P, th, rng); drawTree(P, 8, 7, 6, '#2e7a30'); },
  water(P, th, rng, f) {
    const w = th.water || '#3a78c8'; P.r(0, 0, 15, 15, w);
    for (let i = 0; i < 4; i++) { const y = (i * 4 + 1) % 16, x = (i * 5 + f * 2) % 16; P.r(x, y, Math.min(15, x + 3), y, shade(w, 1.3)); }
  },
  roof(P, th, rng, f, v) {
    const r = th.roof || '#b44a36'; P.r(0, 0, 15, 15, r);
    for (let y = 1; y < 16; y += 3) { P.r(0, y, 15, y, shade(r, 0.72)); const o = (y % 2) ? 2 : 5; for (let x = o; x < 16; x += 6) P.p(x, y + 1, shade(r, 0.8)); }
    if (v & 1) P.r(0, 0, 15, 1, shade(r, 1.3));
    if (v & 2) P.r(0, 14, 15, 15, shade(r, 0.5));
  },
  bwall(P, th, rng, f, v) {
    const b = th.bwall || '#e4d4b4', t = th.timber || '#6a4a30';
    P.r(0, 0, 15, 15, b); P.r(0, 0, 15, 1, t); P.r(0, 14, 15, 15, t); P.r(0, 0, 1, 15, t); P.r(14, 0, 15, 15, t);
    if (v % 2) { P.r(5, 4, 10, 9, '#3a2a20'); P.r(6, 5, 9, 8, '#8ab8e0'); P.r(7, 5, 8, 8, '#3a2a20'); P.r(6, 6, 9, 6, '#3a2a20'); }
  },
  door(P, th, rng, f, v) {
    TILE_ART.bwall(P, th, rng, 0, 0);
    P.r(4, 4, 11, 15, '#3a2410'); P.r(5, 5, 10, 15, '#7a4a24'); P.r(7, 5, 8, 15, '#5a3418'); P.p(9, 10, '#f0c040');
  },
  shopdoor(P, th, rng, f, v) {
    TILE_ART.door(P, th, rng);
    P.r(3, 0, 12, 5, '#5a3418'); P.r(4, 1, 11, 4, '#e8d8a0');
    const ic = { W: [[7, 1], [7, 2], [8, 1], [8, 2], [6, 3], [9, 3], [7, 4], [8, 4], [5, 3], [10, 3]], A: [[5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [5, 2], [10, 2], [6, 3], [9, 3], [7, 4], [8, 4], [7, 2], [8, 2], [7, 3], [8, 3]], I: [[7, 1], [8, 1], [6, 2], [9, 2], [6, 3], [7, 3], [8, 3], [9, 3], [7, 4], [8, 4]], M: [[7, 1], [8, 1], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [7, 3], [8, 3], [6, 4], [9, 4]], N: [[5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [5, 3], [10, 3], [5, 1], [10, 4], [5, 4]], H: [[7, 1], [8, 1], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [7, 3], [8, 3], [7, 4], [8, 4]] }[['W', 'A', 'I', 'M', 'N', 'H'][v]] || [];
    const col = ['#606878', '#3a5ab0', '#c03040', '#8a40c0', '#3a3a3a', '#d02020'][v];
    for (const [x, y] of ic) P.p(x, y, col);
  },
  counter(P, th, rng) { TILE_ART.planks(P, th, rng); P.r(0, 3, 15, 12, '#7a4a24'); P.r(0, 3, 15, 5, '#b07a40'); P.r(0, 12, 15, 12, '#3a2410'); },
  carpet(P, th) { const c = th.carpet; P.r(0, 0, 15, 15, c); P.r(0, 0, 15, 15, c); for (let y = 1; y < 16; y += 4) for (let x = (y % 8 === 1) ? 1 : 3; x < 16; x += 4) P.p(x, y, shade(c, 1.2)); },
  pillar(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 0); P.r(4, 1, 11, 15, '#d8d4c8'); P.r(4, 1, 5, 15, '#f4f0e8'); P.r(10, 1, 11, 15, '#9a968c'); P.r(3, 0, 12, 1, '#b8b4a8'); P.r(3, 14, 12, 15, '#9a968c'); },
  throne(P, th) { TILE_ART.carpet(P, th); P.r(3, 1, 12, 14, '#c89a30'); P.r(4, 2, 11, 9, '#a02030'); P.r(3, 10, 12, 12, '#a02030'); P.r(2, 9, 3, 14, '#c89a30'); P.r(12, 9, 13, 14, '#c89a30'); P.p(7, 0, '#f0d060'); P.p(8, 0, '#f0d060'); },
  bed(P, th, rng) { TILE_ART.planks(P, th, rng); P.r(2, 1, 13, 15, '#6a4424'); P.r(3, 2, 12, 5, '#f4f4f4'); P.r(3, 6, 12, 14, '#3a6aa8'); P.r(3, 6, 12, 7, '#5a8ac8'); },
  fence(P, th, rng) { TILE_ART.grass(P, th, rng); P.r(0, 6, 15, 7, '#9a6a3a'); P.r(0, 11, 15, 12, '#9a6a3a'); for (const x of [1, 7, 13]) P.r(x, 3, x + 1, 14, '#7a4a24'); },
  flowers(P, th, rng) { TILE_ART.grass(P, th, rng); for (let i = 0; i < 7; i++) { const x = 1 + Math.floor(rng() * 13), y = 1 + Math.floor(rng() * 13); P.p(x, y, pick(['#ff6080', '#ffe040', '#ffffff', '#a060ff'])); P.p(x, y + 1, '#2a6a20'); } },
  stairsDown(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 0); for (let i = 0; i < 5; i++) { const c = shade('#808080', 1 - i * 0.17); P.r(1 + i, 2 + i * 2, 14 - i, 3 + i * 2, c); } P.r(6, 12, 9, 14, '#000'); },
  stairsUp(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 0); for (let i = 0; i < 6; i++) { P.r(1, 14 - i * 2, 14, 15 - i * 2, shade('#c0c0c8', 1 - i * 0.07)); P.r(1, 15 - i * 2, 14, 15 - i * 2, '#606068'); } },
  shelf(P, th, rng) { P.r(0, 0, 15, 15, '#5a3418'); P.r(1, 1, 14, 14, '#3a2010'); for (const y of [1, 6, 11]) { for (let x = 1; x < 15; x += 2) P.r(x, y, x, y + 3, pick(['#a03030', '#3050a0', '#30803a', '#c0a040', '#804080'])); P.r(1, y + 4, 14, y + 4, '#7a4a24'); } },
  table(P, th, rng) { TILE_ART.planks(P, th, rng); P.r(1, 3, 14, 11, '#8a5a30'); P.r(1, 3, 14, 4, '#b07a40'); P.r(2, 12, 3, 14, '#5a3418'); P.r(12, 12, 13, 14, '#5a3418'); P.r(6, 5, 8, 7, '#f0f0f0'); },
  dock(P, th, rng, f) { TILE_ART.water(P, { water: '#2a5ab8' }, rng, f); P.r(0, 0, 15, 15, '#9a6a3a'); for (let x = 3; x < 16; x += 4) P.r(x, 0, x, 15, '#5a3a1e'); P.p(1, 4, '#3a2410'); P.p(9, 11, '#3a2410'); },
  rubble(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 1); for (const [x, y, r] of [[5, 9, 4], [11, 6, 3], [10, 12, 2]]) { P.circ(x, y, r, '#5a5048'); P.circ(x - 1, y - 1, r - 1, '#8a8078'); } },
  altar(P, th, rng, f) { TILE_ART.floor(P, th, rng, 0, 0); P.r(1, 5, 14, 14, '#9a8e80'); P.r(1, 5, 14, 7, '#c8bcae'); P.r(1, 14, 14, 14, '#4a4038'); const g = f % 2 ? '#ff7040' : '#ffa060'; P.r(6, 1, 9, 4, g); P.r(7, 0, 8, 4, '#ffe0a0'); },
  statue(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 0); P.r(4, 12, 11, 15, '#8a8a90'); P.r(5, 5, 10, 12, '#b0b0b8'); P.circ(8, 4, 2, '#b0b0b8'); P.r(5, 5, 5, 12, '#d0d0d8'); },
  barrel(P, th, rng) { TILE_ART.path(P, th, rng); P.r(4, 3, 11, 14, '#8a5a30'); P.r(3, 5, 12, 12, '#8a5a30'); P.r(3, 5, 12, 5, '#3a3a3a'); P.r(3, 11, 12, 11, '#3a3a3a'); P.r(5, 3, 6, 14, '#aa7a48'); },
  fountain(P, th, rng, f) { TILE_ART.path(P, th, rng); P.r(0, 2, 15, 15, '#9a9aa4'); P.r(2, 4, 13, 13, '#3a78c8'); P.r(2, 4 + (f % 2), 13, 4 + (f % 2), '#8ac0f0'); P.r(7, 1, 8, 8, '#c8e8ff'); P.p(6 + (f % 2) * 3, 3, '#ffffff'); },
  reeds(P, th, rng) { TILE_ART.mud(P, th, rng); for (const x of [3, 6, 11, 13]) { P.r(x, 4, x, 12, '#6a7a2a'); P.p(x, 3, '#8a6a3a'); } },
};

// ---------------------------------------------------------------------------
// Tile definitions: char -> { art, solid, ... }
// ---------------------------------------------------------------------------
const WORLD_TILES = {
  '~': { art: 'ocean', solid: true, sea: true, anim: 4 },
  '.': { art: 'grass', enc: 1 }, 's': { art: 'sand', enc: 0.6 }, 'f': { art: 'forest', enc: 1.5 }, '^': { art: 'mountain', solid: true },
  ',': { art: 'swamp', enc: 1.5 }, 'r': { art: 'river', solid: true, anim: 4 }, 'B': { art: 'bridge', anim: 4 },
  'T': { art: 'town', place: true }, 'C': { art: 'castle', place: true }, 'A': { art: 'temple', place: true }, 'P': { art: 'port', place: true },
  'L': { art: 'elfvillage', place: true }, 'M': { art: 'cave', place: true }, 'K': { art: 'keep', place: true },
};
const IN_TILES = {
  ' ': { art: 'void', solid: true }, '#': { art: 'wall', solid: true }, '*': { art: 'torch', solid: true, anim: 2 },
  '.': { art: 'floor' }, ',': { art: 'path' }, 'g': { art: 'grass' }, 't': { art: 'tree', solid: true }, 'w': { art: 'water', solid: true, anim: 4 },
  '~': { art: 'water', solid: true, anim: 4, sea: true }, '+': { art: 'door' }, 'b': { art: 'bwall', solid: true }, 'R': { art: 'roof', solid: true },
  'c': { art: 'counter', solid: true, counter: true }, '_': { art: 'carpet' }, 'o': { art: 'pillar', solid: true }, 'T': { art: 'throne', solid: true },
  'u': { art: 'bed', solid: true }, 'f': { art: 'fence', solid: true }, 'F': { art: 'flowers' }, '>': { art: 'stairsDown', stairs: 'down' }, '<': { art: 'stairsUp', stairs: 'up' },
  'k': { art: 'shelf', solid: true }, '$': { art: 'table', solid: true }, '=': { art: 'dock', anim: 4 }, '^': { art: 'rubble', solid: true }, 'm': { art: 'mud' },
  'a': { art: 'altar', solid: true, anim: 2 }, 'e': { art: 'statue', solid: true }, 'p': { art: 'barrel', solid: true }, 'X': { art: 'exit', exit: true },
  's': { art: 'sand' }, 'O': { art: 'fountain', solid: true, anim: 2 }, 'r': { art: 'reeds' }, 'P': { art: 'planks' },
  'W': { art: 'shopdoor', v: 0, shop: 'weapon' }, 'A': { art: 'shopdoor', v: 1, shop: 'armor' }, 'I': { art: 'shopdoor', v: 2, shop: 'item' },
  'M': { art: 'shopdoor', v: 3, shop: 'magic' }, 'N': { art: 'shopdoor', v: 4, shop: 'inn' }, 'H': { art: 'shopdoor', v: 5, shop: 'clinic' },
};
