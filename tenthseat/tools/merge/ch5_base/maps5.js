'use strict';
// ---------------------------------------------------------------------------
// Chapter Five maps: "The Open Sky".
// Miasma flies. The whole world opens: Thalemyr (Tides of Knowledge) and Zalakir (the Unclaimed Wilds)
// join Aurelion, Ashkar and the Frostreach, and places you could SEE in Chapters One to Four but never
// reach (ringed by mountains, reefs, lava or a frozen lake) can finally be landed on.
// The Veilstorm seals Godsfall Crater in Zalakir: that is the final chapter.
//
// World tiles added here:  x reef (no ship, no walking)   w Veilstorm (not even Miasma)   u jungle   v savanna   z chasm
//   places: I library  O masked city  F sky ruin  J barrow  R storm landing  c camp  q Godsfall (sealed)  Y hourglass  b bloom grove  e powder vault
// A place with sky: true can only be reached by flying (tools/check/validate.js knows).
// ---------------------------------------------------------------------------
Object.assign(THEMES, {
  tideworld: { grass: '#4aa07a', path: '#c8c098', floor: '#b8b08a', floor2: '#aca47e', water: '#2a7ab8' },
  wildworld: { grass: '#6a9a3a', path: '#c8a070', floor: '#b89a68', floor2: '#ac8e5c', water: '#2a6aa8' },
  sephara: { wall: '#7a8a94', wallDark: '#3a444c', floor: '#d8d4c4', floor2: '#ccc8b8', grass: '#4aa07a', roof: '#2a6a8a', bwall: '#e8e4d4', timber: '#4a5a64', path: '#c8c098', water: '#2a7ab8', carpet: '#2a5a8a', wood: '#6a5a44' },
  library: { wall: '#5a4a6a', wallDark: '#2a2034', floor: '#6a5a4a', floor2: '#625244', grass: '#3a5a4a', carpet: '#4a2a6a', water: '#2a3a6a', wood: '#5a3a28', path: '#6a5a4a' },
  orrery: { wall: '#2a2a4a', wallDark: '#0e0e22', floor: '#3a3a5a', floor2: '#343454', grass: '#2a3a4a', carpet: '#6a5a20', water: '#1a2a5a', wood: '#4a3a28', path: '#3a3a5a' },
  masks: { wall: '#4a2a4a', wallDark: '#1e0e1e', floor: '#5a4a5a', floor2: '#524252', grass: '#3a4a3a', roof: '#6a1a3a', bwall: '#7a6a7a', timber: '#2a1a2a', path: '#6a5a6a', water: '#1a2a4a', carpet: '#8a1a3a', wood: '#3a2a2a' },
  chapel: { wall: '#2a2234', wallDark: '#0a0812', floor: '#2e2840', floor2: '#2a243a', grass: '#1e2a2a', carpet: '#3a1a5a', water: '#10102a', wood: '#2a2030', path: '#2e2840' },
  camp: { wall: '#7a5a3a', wallDark: '#3a2a1a', floor: '#c8a070', floor2: '#bc9464', grass: '#6a9a3a', roof: '#8a3a2a', bwall: '#c8b08a', timber: '#5a3a20', path: '#c8a070', water: '#2a6aa8', carpet: '#8a3a2a', wood: '#6a4424' },
  jungle: { wall: '#3a5a2a', wallDark: '#14240e', floor: '#4a6a34', floor2: '#44622e', grass: '#3a7a2a', mud: '#4a3a24', water: '#2a5a5a', wood: '#4a3a20', path: '#6a6a40' },
  barrow: { wall: '#4a5a6a', wallDark: '#1a2230', floor: '#5a6a7a', floor2: '#546474', grass: '#3a5a5a', carpet: '#2a3a6a', water: '#2a3a6a', wood: '#4a4a4a', path: '#6a7a8a' },
  storm: { wall: '#3a2a4a', wallDark: '#120a1a', floor: '#4a3e54', floor2: '#44384e', grass: '#2a2a3a', carpet: '#5a1a6a', water: '#2a1a4a', wood: '#3a2a2a', path: '#5a4a64' },
  bloomgrove: { wall: '#4a6a3a', wallDark: '#1e2e16', floor: '#6a8a4a', floor2: '#628244', grass: '#5a9a4a', mud: '#5a4a3a', water: '#4a8ac8', wood: '#5a4030', path: '#a8a070' },
  hourglass: { wall: '#8aa0b8', wallDark: '#3a4a60', floor: '#d8e4f0', floor2: '#ccd8e6', grass: '#e0eaf4', water: '#6a9ac8', wood: '#6a6a7a', path: '#b8c8da', carpet: '#5a6a9a' },
  hoard: { wall: '#6a4a2a', wallDark: '#2a1a0a', floor: '#7a5a3a', floor2: '#725234', grass: '#5a6a3a', carpet: '#a07a20', water: '#2a4a7a', wood: '#5a3a1a', path: '#8a6a44' },
});

// ------------------------------------------------------------------ world tile art
const _zigzag = (P, y, col) => { for (let x = 0; x < 16; x++) P.p(x, y + (x % 4 < 2 ? 0 : 1), col); };
Object.assign(TILE_ART, {
  reef(P, th, rng, f) {
    TILE_ART.ocean(P, th, rng, f);
    for (const [x, y] of [[2, 3], [9, 2], [5, 9], [12, 10], [1, 13]]) { P.r(x, y + 1, x + 2, y + 2, '#5a5048'); P.p(x + 1, y, '#8a8070'); P.p(x, y + 2, '#3a3028'); }
    P.p((3 + f * 4) % 16, 6, '#e8f4ff'); P.p((11 + f * 3) % 16, 13, '#e8f4ff');
  },
  veilstorm(P, th, rng, f) {
    P.r(0, 0, 15, 15, '#1a0a2a');
    for (let i = 0; i < 7; i++) { const y = (i * 5 + f * 2) % 16, x = (i * 7 + f * 3) % 16; P.r(x, y, Math.min(15, x + 4), y, i % 2 ? '#5a2a8a' : '#3a1a5a'); }
    if (f % 4 === 1) { P.r(7, 0, 7, 5, '#e0c0ff'); P.r(8, 5, 8, 10, '#e0c0ff'); P.r(7, 10, 7, 15, '#b080ff'); }
    P.p((f * 5) % 16, 3, '#c080ff'); P.p((f * 7 + 4) % 16, 12, '#8040c0');
  },
  jungle(P, th, rng) {
    speckle(P, rng, '#2e6a22', 26, ['#245a1a', '#3a7a2a']);
    drawTree(P, 4, 4, 4, '#2a8a3a'); drawTree(P, 12, 5, 4, '#3a9a2a'); drawTree(P, 7, 11, 4, '#2a8a3a');
    P.p(2, 12, '#e06a2a'); P.p(13, 12, '#e0c02a');
  },
  savanna(P, th, rng) {
    speckle(P, rng, '#b8a04a', 26, ['#a08a3a', '#c8b05a']);
    for (let i = 0; i < 4; i++) { const x = 1 + Math.floor(rng() * 13), y = 2 + Math.floor(rng() * 12); P.p(x, y, '#7a6a2a'); P.p(x + 1, y - 1, '#7a6a2a'); }
  },
  chasm(P, th, rng) {
    P.r(0, 0, 15, 15, '#120a10'); P.r(0, 0, 15, 2, '#6a4a3a'); P.r(0, 3, 15, 3, '#3a2a24');
    for (let i = 0; i < 5; i++) P.p(Math.floor(rng() * 16), 6 + Math.floor(rng() * 9), '#2a1a2a');
  },
  library(P, th, rng) {
    TILE_ART.grass(P, th, rng);
    P.r(2, 4, 13, 14, '#c8c0a8'); P.r(1, 3, 14, 4, '#3a4a8a'); P.r(4, 0, 11, 3, '#3a4a8a'); P.r(7, 0, 8, 0, '#ffe070');
    for (const x of [3, 6, 9, 12]) P.r(x, 6, x, 13, '#8a8270'); P.r(6, 10, 9, 14, '#2a2030'); P.p(7, 1, '#ffe070'); P.p(8, 2, '#ffe070');
  },
  maskcity(P, th, rng, f) {
    TILE_ART.grass(P, th, rng);
    const h = (x, y, c) => { P.r(x, y + 2, x + 4, y + 7, '#5a4a5a'); P.r(x - 1, y, x + 5, y + 2, c); P.p(x + 2, y + 4, f % 2 ? '#ffe070' : '#ffb030'); };
    h(1, 1, '#6a1a3a'); h(9, 2, '#3a1a5a'); h(5, 8, '#6a1a3a');
    P.r(12, 10, 14, 12, '#f0f0f0'); P.p(12, 11, '#1a1a1a'); P.p(14, 11, '#1a1a1a'); P.r(13, 12, 14, 13, '#e04040');
  },
  skyruin(P, th, rng, f) {
    TILE_ART.grass(P, th, rng);
    P.r(3, 10, 12, 14, '#c8c0b0'); P.r(4, 4, 5, 10, '#d8d0c0'); P.r(10, 3, 11, 10, '#d8d0c0'); P.r(3, 3, 12, 4, '#b8b0a0');
    P.r(7, 6 + (f % 2), 8, 8 + (f % 2), '#a0e0ff'); P.p(7, 5, '#ffffff');
  },
  barrow(P, th, rng) {
    TILE_ART.jungle(P, th, rng);
    P.r(3, 6, 12, 15, '#5a6a7a'); P.r(5, 4, 10, 6, '#5a6a7a'); P.r(6, 9, 9, 15, '#0a0a14'); P.p(7, 7, '#c8d8ff'); P.p(8, 7, '#c8d8ff'); P.r(4, 6, 11, 6, '#8a9aaa');
  },
  stormgate(P, th, rng, f) {
    TILE_ART.savanna(P, th, rng);
    P.r(3, 3, 4, 15, '#4a3a5a'); P.r(11, 3, 12, 15, '#4a3a5a'); P.r(2, 2, 13, 3, '#5a4a6a');
    P.r(5, 4, 10, 15, f % 2 ? '#7a3ac0' : '#5a2a9a'); P.p(7, 8, '#e0c0ff'); P.p(8, 11, '#e0c0ff');
  },
  camp(P, th, rng, f) {
    TILE_ART.savanna(P, th, rng);
    const tent = (x, y, c) => { for (let j = 0; j < 5; j++) P.r(x + 2 - Math.floor(j / 2), y + j, x + 2 + Math.floor(j / 2), y + j, c); P.p(x + 2, y + 4, '#2a1a10'); };
    tent(1, 2, '#c84a2a'); tent(9, 1, '#e0c070'); tent(5, 8, '#c84a2a');
    P.r(11, 11, 12, 12, f % 2 ? '#ffb030' : '#ff6010'); P.p(11, 10, '#ffe070');
  },
  crater(P, th, rng, f) {
    P.r(0, 0, 15, 15, '#120a1a'); P.circ(8, 8, 6, '#2a1a3a'); P.circ(8, 8, 3, f % 2 ? '#c080ff' : '#8040c0'); P.p(8, 8, '#ffffff');
  },
  hourglassshrine(P, th, rng, f) {
    P.r(0, 0, 15, 15, '#9ac8e8'); P.r(0, 14, 15, 15, '#6a9ac0');
    P.r(4, 1, 11, 2, '#e8f4ff'); P.r(4, 13, 11, 14, '#e8f4ff');
    for (let j = 3; j < 13; j++) { const half = Math.abs(8 - j) < 1 ? 1 : Math.floor(Math.abs(7.5 - j) * 0.7) + 1; P.r(8 - half, j, 7 + half, j, '#c8e0f4'); }
    P.r(7, 4 + (f % 3), 8, 6, '#ffffff'); P.r(6, 11, 9, 12, '#ffffff');
  },
  bloomgrove(P, th, rng, f) {
    TILE_ART.grass(P, th, rng);
    P.r(7, 8, 8, 15, '#6a4a2a'); P.circ(8, 6, 5, '#3a8a3a'); P.circ(7, 5, 3, '#5aaa4a');
    for (const [x, y] of [[4, 5], [11, 4], [8, 2], [6, 8]]) P.p(x, y, f % 2 ? '#ff80d0' : '#ffd0f0');
  },
  powdervault(P, th, rng, f) {
    TILE_ART.ashplain(P, th, rng);
    P.r(2, 6, 13, 14, '#4a4a44'); P.r(3, 4, 12, 6, '#5a5a54'); P.r(6, 9, 9, 14, '#1a1410'); P.r(6, 8, 9, 8, '#e0b030');
    P.p(4, 5, '#c03020'); P.p(11, 5, '#c03020'); P.p(7 + (f % 2), 2, '#a0a0a0');
  },
});
Object.assign(WORLD_TILES, {
  x: { art: 'reef', solid: true, anim: 4 }, w: { art: 'veilstorm', solid: true, noFly: true, anim: 4 },
  u: { art: 'jungle', enc: 1.5 }, v: { art: 'savanna', enc: 1 }, z: { art: 'chasm', solid: true },
  I: { art: 'library', place: true }, O: { art: 'maskcity', place: true, anim: 2 }, F: { art: 'skyruin', place: true, anim: 2 }, J: { art: 'barrow', place: true },
  R: { art: 'stormgate', place: true, anim: 2 }, c: { art: 'camp', place: true, anim: 2 }, q: { art: 'crater', place: true, anim: 2 },
  Y: { art: 'hourglassshrine', place: true, anim: 3 }, b: { art: 'bloomgrove', place: true, anim: 2 }, e: { art: 'powdervault', place: true, anim: 2 },
});

// ------------------------------------------------------------------ interior tile art
Object.assign(TILE_ART, {
  bookshelf(P, th, rng) { P.r(0, 0, 15, 15, '#4a3020'); for (const y of [1, 6, 11]) { P.r(1, y, 14, y + 3, '#2a1a10'); for (let x = 1; x < 15; x += 2) P.r(x, y + (rng() < 0.3 ? 1 : 0), x, y + 3, pick(['#8a2a2a', '#2a5a8a', '#6a8a2a', '#c8a040', '#6a3a8a'])); } P.r(0, 5, 15, 5, '#6a4a30'); P.r(0, 10, 15, 10, '#6a4a30'); P.r(0, 15, 15, 15, '#6a4a30'); },
  starplate(P, th, rng, f) { TILE_ART.floor(P, th, rng, 0, 0); P.circ(8, 8, 6, '#4a4a7a'); P.circ(8, 8, 4, '#2a2a4a'); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 - Math.PI / 2; P.p(8 + Math.round(Math.cos(a) * 5), 8 + Math.round(Math.sin(a) * 5), f % 2 ? '#ffe070' : '#c8a040'); } P.p(8, 8, '#a0a0ff'); },
  starlit(P, th, rng, f) { TILE_ART.floor(P, th, rng, 0, 0); P.circ(8, 8, 6, '#c8a040'); P.circ(8, 8, 4, '#ffe070'); P.circ(8, 8, 2, '#ffffff'); if (f % 2) { P.p(1, 1, '#ffe070'); P.p(14, 3, '#ffe070'); P.p(2, 13, '#ffe070'); } },
  stargate(P, th, rng, f) { P.r(0, 0, 15, 15, '#0e0e22'); for (let i = 0; i < 8; i++) P.p((i * 5 + f) % 16, (i * 7) % 16, '#ffe070'); P.r(0, 0, 15, 0, '#4a4a7a'); P.r(0, 15, 15, 15, '#4a4a7a'); },
  maskwall(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 0); P.r(0, 0, 15, 15, th.wall); P.r(4, 3, 11, 10, '#f0e8e0'); P.r(5, 5, 6, 6, '#1a1a1a'); P.r(9, 5, 10, 6, '#1a1a1a'); P.r(6, 8, 9, 9, '#c02040'); P.r(4, 3, 7, 10, '#f8f0e8'); },
  lanternless(P, th, rng, f) { TILE_ART.floor(P, th, rng, 0, 0); P.r(7, 6, 8, 15, '#3a3040'); P.r(5, 2, 10, 7, '#1a1420'); P.r(6, 3, 9, 6, f % 2 ? '#2a1a3a' : '#3a2a5a'); },
  stormfloor(P, th, rng, f) { speckle(P, rng, th.floor, 20, [shade(th.floor, 0.8), shade(th.floor, 1.2)]); if (f % 4 === 0) { P.r(3, 0, 3, 6, '#c080ff'); P.r(4, 6, 4, 11, '#c080ff'); } },
  bonepile(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 0); for (let i = 0; i < 6; i++) { const x = 1 + Math.floor(rng() * 11), y = 3 + Math.floor(rng() * 10); P.r(x, y, x + 3, y, '#e8e0d0'); P.p(x, y - 1, '#e8e0d0'); P.p(x + 3, y + 1, '#e8e0d0'); } },
  goldpile(P, th, rng, f) { TILE_ART.floor(P, th, rng, 0, 0); for (let j = 0; j < 9; j++) P.r(8 - Math.floor(j * 0.8) - 1, 6 + j, 8 + Math.floor(j * 0.8), 6 + j, j % 2 ? '#c8a020' : '#e8c040'); P.p(6, 8, '#fff8c0'); P.p(10, 11, '#fff8c0'); if (f % 2) P.p(8, 6, '#ffffff'); },
  brazier(P, th, rng, f) { TILE_ART.floor(P, th, rng, 0, 0); P.r(5, 9, 10, 14, '#3a2a24'); P.r(4, 8, 11, 9, '#5a4a40'); P.r(7, 14, 8, 15, '#2a1a14'); },
  brazierlit(P, th, rng, f) { TILE_ART.brazier(P, th, rng, f); P.r(6, 4 + (f % 2), 9, 8, '#ff7020'); P.r(7, 2 + (f % 2), 8, 6, '#ffd060'); P.p(7, 1, '#fff0a0'); },
  rootwall(P, th, rng) { P.r(0, 0, 15, 15, '#3a2a1a'); for (let i = 0; i < 6; i++) { const x = Math.floor(rng() * 14); P.r(x, 0, x + 1, 15, '#5a3e24'); P.p(x + 2, Math.floor(rng() * 16), '#2a6a2a'); } },
  blight(P, th, rng) { speckle(P, rng, '#4a3a3a', 26, ['#3a2a2a', '#5a3a4a', '#6a2a4a']); for (let i = 0; i < 3; i++) P.p(Math.floor(rng() * 16), Math.floor(rng() * 16), '#a040a0'); },
  seedbed(P, th, rng, f) { TILE_ART.grass(P, th, rng); P.circ(8, 9, 5, '#6a4a2a'); P.circ(8, 9, 3, '#4a3018'); if (f % 2) P.p(8, 8, '#a0ff80'); },
  sapling(P, th, rng, f) { TILE_ART.seedbed(P, th, rng, 0); P.r(8, 3, 8, 9, '#4a8a2a'); P.r(5, 3, 7, 5, '#6aca4a'); P.r(9, 2, 11, 4, '#6aca4a'); P.p(8, 1, f % 2 ? '#ff80d0' : '#ffd0f0'); },
  clockface(P, th, rng, f) { P.r(0, 0, 15, 15, th.floor); P.circ(8, 8, 7, '#e8f0f8'); P.circ(8, 8, 6, '#b8c8da'); P.r(8, 3, 8, 8, '#3a4a60'); const a = f * Math.PI / 2; P.r(8, 8, 8 + Math.round(Math.cos(a) * 4), 8 + Math.round(Math.sin(a) * 4), '#5a6a9a'); },
  vine(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 0); for (const x of [2, 7, 12]) { P.r(x, 0, x, 15, '#2a6a2a'); P.p(x + 1, 4, '#4a9a3a'); P.p(x - 1, 9, '#4a9a3a'); } },
  powderkeg(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 0); P.r(4, 4, 11, 14, '#7a4a2a'); P.r(4, 6, 11, 6, '#3a3a3a'); P.r(4, 12, 11, 12, '#3a3a3a'); P.r(7, 2, 8, 4, '#2a2a2a'); P.p(8, 1, '#ff8030'); },
});
// interior tiles: only symbols no earlier chapter uses (digits stay NPCs, chest letters are per map)
Object.assign(IN_TILES, {
  '(': { art: 'bookshelf', solid: true }, ')': { art: 'starplate' }, '/': { art: 'stargate', solid: true, anim: 2 }, '\\': { art: 'maskwall', solid: true },
  ';': { art: 'lanternless', solid: true, anim: 2 }, ':': { art: 'stormfloor', anim: 4 }, '"': { art: 'bonepile', solid: true },
  '?': { art: 'goldpile', solid: true, anim: 2 }, '`': { art: 'brazier', solid: true }, '\'': { art: 'rootwall', solid: true },
  '-': { art: 'blight', enc: 1.6 }, 'n': { art: 'vine', solid: true }, 'V': { art: 'clockface', solid: true, anim: 4 }, 'C': { art: 'powderkeg', solid: true },
});

// ------------------------------------------------------------------ the dragon in the sky (the player, while flying)
const SKYDRAGON = (() => {
  const mk = up => {
    const c = mkCanvas(32, 32), P = painter(c);
    const body = '#c8321e', dark = '#8a1e12', belly = '#e8a060', bone = '#e8dcc8', wing = '#5e5048', wingL = '#7a6a5e';
    // wings
    if (up) { for (let j = 0; j < 9; j++) { P.r(2 + j, 4 + j, 12, 4 + j, j % 3 ? wing : wingL); P.r(19, 4 + j, 29 - j, 4 + j, j % 3 ? wing : wingL); } }
    else { for (let j = 0; j < 7; j++) { P.r(1 + j, 12 + j, 12, 12 + j, j % 3 ? wing : wingL); P.r(19, 12 + j, 30 - j, 12 + j, j % 3 ? wing : wingL); } }
    // tail
    for (let j = 0; j < 8; j++) P.r(15 - Math.floor(j / 3), 22 + j, 16 - Math.floor(j / 3), 22 + j, j % 2 ? dark : body);
    P.r(11, 29, 13, 31, dark);
    // body and neck
    P.r(12, 10, 19, 23, body); P.r(14, 12, 17, 22, belly); P.r(13, 5, 18, 10, body);
    // head
    P.r(12, 1, 19, 6, body); P.r(13, 0, 18, 1, dark); P.p(13, 3, '#ffd040'); P.p(18, 3, '#ffd040');
    P.r(11, 0, 11, 2, bone); P.p(10, 0, bone); P.r(20, 0, 20, 2, bone); P.p(21, 0, bone);
    // a tiny rider with orange hair
    P.r(14, 13, 17, 15, '#1e1e24'); P.r(14, 11, 17, 12, '#ff6a1a');
    outline(c);
    return c;
  };
  return [mk(true), mk(false)];
})();
function drawSkyDragon(x, y, dir) {
  const fr = Math.floor(Game.frame / 12) % 2, bob = Math.sin(Game.frame / 14) * 4, s = 3;
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x, y + 18, 34, 12, 0, 0, Math.PI * 2); ctx.fill();
  const img = SKYDRAGON[fr], w = img.width * s, h = img.height * s;
  ctx.save(); ctx.translate(Math.round(x), Math.round(y - 30 + bob));
  const rot = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 }[dir] || 0;
  ctx.rotate(rot); ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore();
}

Object.assign(MUSIC, {
  sky: { bpm: 128, loop: true, voices: [
    { type: 'square', vol: 0.09, seq: mel('D5:4 A4:2 D5:2 F#5:4 E5:2 D5:2  E5:4 C#5:2 E5:2 A5:8  G5:4 F#5:2 E5:2 F#5:4 D5:4  B4:4 C#5:4 E5:8  D5:4 A4:2 D5:2 F#5:4 A5:4  B5:4 A5:2 G5:2 F#5:4 E5:4  G5:4 F#5:2 E5:2 D5:2 E5:2 F#5:4  D5:16') },
    { type: 'triangle', vol: 0.2, seq: bass('D A Bm G D A G A') },
    { type: 'sine', vol: 0.04, seq: pad('D A Bm G D A G A') },
  ] },
  thalemyr: { bpm: 96, loop: true, voices: [
    { type: 'triangle', vol: 0.2, seq: mel('G4:4 B4:4 D5:6 C5:2  B4:4 A4:4 G4:8  F4:4 A4:4 C5:6 B4:2  A4:16  G4:4 B4:4 D5:6 E5:2  F5:4 E5:4 D5:8  C5:4 B4:4 A4:4 F4:4  G4:16') },
    { type: 'sine', vol: 0.06, seq: arp('G G F F G G F G').map((n, i) => (i % 2 ? '.' : n)) },
  ] },
  zalakir: { bpm: 110, loop: true, voices: [
    { type: 'square', vol: 0.07, seq: mel('A4:2 A4:2 C5:2 E5:4 D5:2 C5:2 A4:2  G4:4 A4:2 C5:2 D5:8  E5:2 E5:2 G5:2 A5:4 G5:2 E5:2 D5:2  C5:4 D5:4 A4:8') },
    { type: 'triangle', vol: 0.2, seq: bass('Am G Am Em') },
    { type: 'noise', vol: 0.05, seq: drums(4, 'x..x..x.x..x..x.') },
  ] },
  library: { bpm: 72, loop: true, voices: [
    { type: 'triangle', vol: 0.18, seq: mel('E5:4 D5:4 C5:4 B4:4  A4:8 E4:8  F4:4 A4:4 C5:4 E5:4  D5:16  C5:4 B4:4 A4:4 G4:4  F4:8 A4:8  B4:4 C5:4 D5:4 B4:4  E5:16') },
    { type: 'sine', vol: 0.05, seq: arp('Am Am F F Dm Dm Em Em').map((n, i) => (i % 2 ? '.' : n)) },
  ] },
  masks: { bpm: 118, loop: true, voices: [
    { type: 'square', vol: 0.07, seq: mel('E5:3 D#5:1 E5:4 B4:4 C5:4  D5:3 C5:1 B4:4 A4:8  C5:3 B4:1 C5:4 G4:4 A4:4  B4:3 A4:1 G#4:4 E4:8') },
    { type: 'triangle', vol: 0.18, seq: bass('Am Em Am E') },
  ] },
  veil: { bpm: 58, loop: true, voices: [
    { type: 'sine', vol: 0.18, seq: mel('D5:8 C5:4 A#4:4  A4:16  G4:8 A#4:4 A4:4  F4:16  D5:8 E5:4 F5:4  E5:8 C5:8  D5:4 C5:4 A#4:4 A4:4  D4:16') },
    { type: 'triangle', vol: 0.05, seq: pad('Dm Bb Gm Dm Dm C Bb Dm') },
  ] },
  storm: { bpm: 144, loop: true, voices: [
    { type: 'sawtooth', vol: 0.06, seq: mel('D4:2 D4:2 F4:2 D4:2 G#4:4 F4:2 D4:2  C4:2 C4:2 D#4:2 C4:2 G4:4 D#4:2 C4:2  A#3:2 A#3:2 D4:2 F4:2 A#4:4 A4:2 G4:2  A4:4 C#5:4 E5:4 A5:4') },
    { type: 'triangle', vol: 0.2, seq: bass('Dm Cm Bb A') },
    { type: 'noise', vol: 0.05, seq: drums(4, 'x.x.x.x.x.x.xxxx') },
  ] },
});

// ------------------------------------------------------------------ the old maps get new places you could see but never reach
const _patch = (rows, y, x, str) => { rows[y] = rows[y].slice(0, x) + str + rows[y].slice(x + str.length); };
// Aurelion: Heartbloom Hollow, a valley ringed by mountains, south of the Goldengrove road
[['^^^^^^^', 26], ['^^,.,^^', 27], ['^,.b.,^', 28], ['^^,.,^^', 29], ['^^^^^^^', 30]].forEach(([s, y]) => _patch(WORLD.rows, y, 24, s));
// Aurelion: an islet behind a reef, far to the north-east. Twenty years ago, a red dragon lived there.
[['~xxx~', 1], ['x.M.x', 2], ['~xxx~', 3]].forEach(([s, y]) => _patch(WORLD.rows, y, 52, s));
WORLD.places['27,28'] = { map: 'bloom1', sky: true };
WORLD.places['54,2'] = { map: 'hoard', sky: true };
WORLD.skyIn = [50, 19];
// the Frostreach: the Stilled Hourglass, in the middle of the frozen lake
_patch(MAPS.frostreach.rows, 13, 24, 'Y');
MAPS.frostreach.places['24,13'] = { map: 'hourglass1', sky: true };
MAPS.frostreach.skyIn = [16, 18];
// Ashkar: the Ashen Crown (a volcanic islet in the north-west sea) and Brakka's master's powder vault, ringed by lava
[['xxxxx', 2], ['xoZox', 3], ['xxxxx', 4]].forEach(([s, y]) => _patch(MAPS.ashkar.rows, y, 4, s));
[['jjjjj', 19], ['jaeaj', 20], ['jjjjj', 21]].forEach(([s, y]) => _patch(MAPS.ashkar.rows, y, 40, s));
MAPS.ashkar.places['6,3'] = { map: () => allyRoute() ? 'cradle1' : 'forge1', sky: true, check: async () => crownGate() };
MAPS.ashkar.places['42,20'] = { map: 'vault', sky: true };
MAPS.ashkar.skyIn = [24, 28];

// ------------------------------------------------------------------ Thalemyr, the Tides of Knowledge
MAPS.thalemyr = {
  world: true, theme: 'tideworld', music: 'thalemyr', name: 'Thalemyr', home: 'sephara', skyIn: [14, 20],
  rows: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~ss^^^^^^ss~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~ss^^^^^^^^^^^ss~~~~~~~~~~~~~~~~~xxx~~~~",
    "~~~~~~~s^^^^^^^.I.^^^^^^s~~~~~~~~~~~~~~~xx.xx~~~",
    "~~~~~~s^^^^^^^^.g.^^^^^^^s~~~~~~~~~~~~~~x.F.x~~~",
    "~~~~~s.^^^^^ff..g..ff^^^^^s~~~~~~~~~~~~~xx.xx~~~",
    "~~~~s...ff^ffff.g.ffff^^...s~~~~~~~~~~~~~xxx~~~~",
    "~~~s....ffffff..g..ffff.....s~~~~~~~~~~~~~~~~~~~",
    "~~~s...fffff...gg...ff.......s~~~~~~~~~~~~~~~~~~",
    "~~s.....ff....gg..............s~~~~~~~~~~~~~~~~~",
    "~~s..........gg........,,,....s~~~~~~~~~~~~~~~~~",
    "~~s.....^^...g........,,,,,....s~~~~~~~~~~~~~~~~",
    "~~~s...^^^...g.........,,,.....s~~~~~~~~~~~~~~~~",
    "~~~s....^....g..ff.............s~~~~~~~~~~~~~~~~",
    "~~~~s........g.ffff...........s~~~~~~~~~~~~~~~~~",
    "~~~~s........g..ff...........s~~~~~~~~~~~~~~~~~~",
    "~~~~~s.......g..............s~~~~~~sssss~~~~~~~~",
    "~~~~~~s....T.g.............s~~~~ss.....ss~~~~~~~",
    "~~~~~~~s....gg...........ss~~~~s....,,...s~~~~~~",
    "~~~~~~~~ss..............s~~~~~s...,,,,,...s~~~~~",
    "~~~~~~~~~~ss.ss.ss.sssss~~~~~s....,,O,,....s~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~s.....,,,.....s~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~s....ff.......s~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~s..ffff.....s~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~s...ff....s~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ss.....ss~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~sssss~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  places: {
    '11,18': { map: 'sephara', at: [13, 14, 'up'] },
    '16,4': { map: 'astrilion1' },
    '36,21': { map: 'ebonport', sky: true },
    '42,5': { map: 'starfall', sky: true },
  },
  zone(x, y, t) { if (t === '~') return 'sea'; if (x >= 29) return 'masklands'; return 'tides'; },
  bg(x, y, t) { if (t === 's') return 'beach'; if (t === 'f') return 'forest'; if (x >= 29) return 'meadow'; return 'tidecliff'; },
};

// ------------------------------------------------------------------ Zalakir, the Unclaimed Wilds
MAPS.zalakir = {
  world: true, theme: 'wildworld', music: 'zalakir', name: 'Zalakir', home: 'rimward', skyIn: [9, 16],
  tint: () => flag('ch5done') ? 'rgba(40,10,60,0.12)' : null,
  rows: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~sssss~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~ss.uuuu.ss~~~~~~~~~~~~sssssss~~~~~~~~~~~~~~~~",
    "~~~~~~s..uuuuuuu..s~~~~~~~sss.vvvvv.sss~~~~~~~~~~~~~",
    "~~~~~s..uuuuJuuuu..s~~~~~s..vvvvvvvvv..ss~~~~~~~~~~~",
    "~~~~s..uuuuu.uuuuu..sssss..vvvvzzzvvvvv..s~~~~~~~~~~",
    "~~~~s.uuuuuu.uuuuuu.......vvvvz^^^zvvvvvv.s~~~~~~~~~",
    "~~~s..uuuuu...uuuuu.....vvvvvvz^F^zvvvvvvv.s~~~~~~~~",
    "~~~s..uuuu.....uuu....vvvvvvvvz^.^zvvvvvvvv.s~~~~~~~",
    "~~~s...uu.......u....vvvvvvvvvvzzzvvvvvvvvvv.s~~~~~~",
    "~~~s..............vvvvvvvvvvvvvvvvvvvvwwwwwvv.s~~~~~",
    "~~~~s...........vvvvvvvvvvvvvvvvvvvvwwwwwwwwv.s~~~~~",
    "~~~~s..c......vvvvvvvvv^^vvvvvvvvvvwwwz.zwwwv.s~~~~~",
    "~~~~s.......vvvvvvvvvv^^^^vvvvvvvvRwwz.q.zwwwvs~~~~~",
    "~~~~~s....vvvvvvvvvvv^^^^vvvvvvvvvvwwwz.zwwwvvs~~~~~",
    "~~~~~s...vvvvvvvvvvvvv^^vvvvvvvvvvvvwwwwwwwwvvs~~~~~",
    "~~~~~s..vvvvvvv..vvvvvvvvvvvvvvvvvvvvwwwwwvvvs~~~~~~",
    "~~~~~~s.vvvvvv....vvvvvvvvvvvvvvvvvvvvvvvvvvs~~~~~~~",
    "~~~~~~s..vvvv......vvvvvvvzzzzzvvvvvvvvvvvs~~~~~~~~~",
    "~~~~~~~s...........vvvvvzzz...zzzvvvvvvvvs~~~~~~~~~~",
    "~~~~~~~~s...uuu.....vvvzz...F...zzvvvvvs~~~~~~~~~~~~",
    "~~~~~~~~s..uuuuu.....vvvz.......zvvvvvs~~~~~~~~~~~~~",
    "~~~~~~~~~s..uuu......vvvzz.....zzvvvvs~~~~~~~~~~~~~~",
    "~~~~~~~~~~s.........vvvvvzzzzzzzvvvvs~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~ss.....vvvvvvvvvvvvvvvvss~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~sss.....vvvvvvvvvvsss~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~ssssss..vvvvss~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~ssssss~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  places: {
    '7,13': { map: 'rimward', at: [12, 13, 'up'] },
    '12,5': { map: 'barrows1' },
    '34,14': { map: 'rim1', check: async () => rimGate() },
    '39,14': { map: 'rim1', sky: true, sealed: true, check: async () => { await say(null, "Godsfall Crater. The Veilstorm swallows it whole."); return false; } },
    '32,8': { map: 'skynest', sky: true },
    '28,21': { map: 'echoes', sky: true },
  },
  zone(x, y, t) { if (t === '~') return 'sea'; if (t === 'u') return 'skyreach'; if (x >= 30 && y >= 8 && y <= 18) return 'stormrim'; return 'wilds'; },
  bg(x, y, t) { if (t === 'u') return 'jungle'; if (t === 's') return 'beach'; if (x >= 30 && y >= 8 && y <= 18) return 'stormplain'; return 'savanna'; },
};

// ------------------------------------------------------------------ interiors
// orrery puzzle: Myndra's seven-pointed star, drawn without lifting the pen (every third point, clockwise)
const ORRERY = [[12, 4], [17, 6], [18, 10], [15, 13], [9, 13], [6, 10], [7, 6]];
const ORRERY_ORDER = [0, 3, 6, 2, 5, 1, 4];
// lit things drawn over the map (braziers, star plates)
function glowAt(x, y, cx, cy, col = 'rgba(255,224,112,0.55)') {
  const sx = x * TS - cx + TS / 2, sy = y * TS - cy + TS / 2, r = 20 + Math.sin(Game.frame / 8 + x) * 3;
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
}
Object.assign(MAPS, {
  // ---- Thalemyr ----
  sephara: {
    name: 'Sephara, Port of Scholars', theme: 'sephara', music: 'town2', under: '.', exitArt: 'path', worldId: 'thalemyr', back: [11, 19], start: [13, 14, 'up'],
    rows: [
      "tttttttttttttttttttttttttttt",
      "t..........................t",
      "t.RRRRR...RRRRRRR....RRRRR.t",
      "t.RRRRR...RRRRRRR....RRRRR.t",
      "t.bbWbb...bbbbHbb....bbNbb.t",
      "t.............,............t",
      "t,,,,,,,,,,,,,,,,,,,,,,,,,,t",
      "t......1......,.....2......t",
      "t.RRRRR.......,......RRRRR.t",
      "t.RRRRR....O..,..L...RRRRR.t",
      "t.bbAbb.......,......bbIbb.t",
      "t.......3.....,.....4......t",
      "t..==........,,......5..6..t",
      "t~~==~~~......,.....7......t",
      "t~~~~~~~......,............t",
      "tttttttttttttXXttttttttttttt",
    ],
    shops: 'sephara',
    npcs: {
      1: { look: 'scholar', move: 'wander', talk: [() => flag('ch5star') ? "The Unwritten is gone? The books in the west wing are remembering their own words again. One of them sneezed." : "Pages in the Great Library are going blank. Whole shelves. Like someone is reading the words OUT of them."] },
      2: { look: 'sailor', talk: [() => "No ship has come back from the south since the storm rose. We send them anyway. Scholars are stubborn."] },
      3: { look: 'child', move: 'wander', talk: [() => "Is that a DRAGON on the cliff?! Is she yours? Does she bite? Can I ride her? Does she like fish?"] },
      4: { look: 'oracle', name: 'Star-Reader', talk: [() => flag('ch5star') ? "Myndra's eye is open again. Faintly. You did that." : "Myndra the Arcane Sage keeps her eye on the Great Library, north, past the cliffs. The eye has been closing. Gods blink when they are tired."] },
      5: { look: 'merchant', talk: [() => "Ebonport? Across the strait, south-east. The City of Masks. Everybody there lies, but they lie BEAUTIFULLY."] },
      6: { look: 'merchant', name: 'Bench Keeper', talk: [async () => hearthBench()], show: () => !!(S().bench || []).length },
      7: { look: 'woman', act: 'sweep', talk: [() => "Thalara's tide and Myndra's ink. That's Sephara. Wet books and wise fish."] },
    },
    signs: { '11,9': () => say(null, "A fountain shaped like an open eye inside a seven-pointed star. Coins in the water, and one very small note: 'please keep looking'.") },
  },
  astrilion1: {
    name: 'Astrilion, the Great Library - The Stacks', theme: 'library', music: 'library', under: '.', exitArt: 'floor', worldId: 'thalemyr', back: [16, 5], start: [12, 14, 'up'], enc: 'stacks', encRate: 0.05, bg: 'library',
    rows: [
      "#########################",
      "#(((((((((((>(((((((((((#",
      "#Q....(......(......(..V#",
      "#.((((.((((.((((.((((...#",
      "#.(..........(......(((.#",
      "#.(.((((((.(.(.((((.....#",
      "#...(....(.(...(..(((((.#",
      "#.((((.(.(.((((((.......#",
      "#......(.(......(.((((((#",
      "#(((((.(.((((((.(.(.....#",
      "#....(.(......(.(.(.(((.#",
      "#.((.(.((((((.(...(...(.#",
      "#.(..(......(.((((((.(..#",
      "#.(.((((.((.(......(.(L.#",
      "#..........(...........R#",
      "############XX###########",
    ],
    warps: { '>': { map: 'astrilion2', at: '<' } },
    chests: { Q: { id: 'c5_as1a', item: 'starquill' }, V: { id: 'c5_as1b', item: 'inkdraught', n: 3 }, R: { id: 'c5_as1c', item: 'sagecirclet' } },
    steps: { '11,13': () => libraryMoment(), '13,14': () => libraryMoment() },
  },
  astrilion2: {
    name: 'Astrilion - The Orrery of Seven Stars', theme: 'orrery', music: 'library', under: '.', exitArt: 'floor', start: [12, 15, 'up'], enc: 'stacks', encRate: 0.025, bg: 'library',
    rows: [
      "#########################",
      "############>############",
      "#.........GGGGG.........#",
      "#.......................#",
      "#...........)...........#",
      "#.......................#",
      "#......).........).....Q#",
      "#.......................#",
      "#.......................#",
      "#........(..a..(........#",
      "#.....)...........).....#",
      "#.......................#",
      "#.......................#",
      "#........).....).......V#",
      "#.......................#",
      "############<############",
    ],
    tileOverride: c => c === 'G' ? (flag('ch5orrery') ? IN_TILES._ : { art: 'stargate', solid: true, anim: 2 }) : null,
    overlay(cx, cy) { const lit = S().flags.orreryLit || 0; for (let i = 0; i < lit; i++) { const [x, y] = ORRERY[ORRERY_ORDER[i]]; glowAt(x, y, cx, cy); } if (flag('ch5orrery')) for (const [x, y] of ORRERY) glowAt(x, y, cx, cy, 'rgba(160,180,255,0.35)'); },
    warps: { '<': { map: 'astrilion1', at: '>' }, '>': { map: 'astrilion3', at: '<' } },
    chests: { Q: { id: 'c5_as2a', item: 'starfallrod' }, V: { id: 'c5_as2b', item: 'inkdraught', n: 2 } },
    signs: { '12,9': () => orreryHint(), '9,9': () => orreryHint(), '15,9': () => orreryHint() },
    steps: Object.fromEntries(ORRERY.map(([x, y], i) => [x + ',' + y, () => orreryStep(i)])),
  },
  astrilion3: {
    name: 'Astrilion - The Unwritten Wing', theme: 'library', music: () => flag('ch5star') ? 'library' : 'sorrow', under: '.', exitArt: 'floor', start: [10, 12, 'up'], bg: 'library',
    rows: [
      "######################",
      "#(((((((.aa.(((((((((#",
      "#(......._......(...(#",
      "#(......._.........L(#",
      "#(.......1..........(#",
      "#(.......____.......(#",
      "#(...k...____...k...(#",
      "#(...k...____...k...(#",
      "#(.......____.......(#",
      "#(.......____.......(#",
      "#(...Q...____...V...(#",
      "#(.......____.......(#",
      "#(........<.........(#",
      "######################",
    ],
    warps: { '<': { map: 'astrilion2', at: '>' } },
    npcs: { 1: { enemy: 'unwritten', scale: 0.34, name: 'The Unwritten', show: () => !flag('ch5unwritten'), talk: [async () => unwrittenEvent()] } },
    chests: { Q: { id: 'c5_as3a', item: 'eyeofmyndra' }, V: { id: 'c5_as3b', item: 'megatonic', n: 4 } },
    signs: { '9,1': () => myndraAltar(), '10,1': () => myndraAltar() },
    steps: { '9,6': () => unwrittenEvent(), '10,6': () => unwrittenEvent(), '11,6': () => unwrittenEvent(), '12,6': () => unwrittenEvent() },
  },
  ebonport: {
    name: 'Ebonport, the City of Masks', theme: 'masks', music: 'masks', under: ',', exitArt: 'path', worldId: 'thalemyr', back: [36, 22], start: [14, 16, 'up'],
    rows: [
      "##############################",
      "#,,,,,,,,,,,,,>,,,,,,,,,,,,,,#",
      "#,RRRRR,,,,,,,2,,,,,,,RRRRRR,#",
      "#,RRRRR,,RRRRRRRRRRR,,RRRRRR,#",
      "#,bbWbb,,RRRRRRRRRRR,,bbbIbb,#",
      "#,,,,,,,,bbbbbNbbbbb,,,,,,,,,#",
      "#,,,1,,,,,,,,,,,,,,,,,,,,3,,,#",
      "#,RRRRR,,,,,,,O,,,,,,,,RRRRR,#",
      "#,RRRRR,,,L,,,,,,,,,,,,RRRRR,#",
      "#,bbAbb,,,,,,,,,,,,,8,,bbHbb,#",
      "#,,,,,,,,4,,,,,,,,,,,,,,,,,,,#",
      "#,RRRRRRR,,,,,,,,,,,,RRRRRRR,#",
      "#,bbbbbbb,,,,5,,,6,,,bbbbbbb,#",
      "#,,,,,,,,,,,,,,,,,,,,,,,7,,,,#",
      "#~~~~~~,,,,,,,,,,,,,,,,~~~~~~#",
      "#~~~~~~~,,,,,,,,,,,,,,~~~~~~~#",
      "#~~~~~~~~,,,,,,,,,,,,~~~~~~~~#",
      "##############XX##############",
    ],
    shops: 'ebonport',
    warps: { '>': { map: 'ebonport2', at: '<' } },
    npcs: {
      1: { look: 'merchant', name: 'Mask-Seller Quill', talk: [async () => maskSeller()] },
      2: { look: 'kargath', name: 'Gate Warden', fixed: true, show: () => !hasKey('masks'), talk: [async () => gateWarden()] },
      3: { look: 'oracle', name: 'Masked Fortune-Teller', talk: [() => "Malakar's faithful wear two faces: one smiling, one burning. Everyone in Ebonport is lying to you. Including me. Especially me."] },
      4: { look: 'man', name: 'Masked Dancer', act: 'dance', talk: [() => "Dance with me! No? Then at least LIE to me about how good I am."] },
      5: { look: 'woman', name: 'Masked Gossip', talk: [() => flag('ch5veil') ? "The lanterns in the old chapel are lit again. Black lanterns. They're beautiful. Don't tell anyone I said that." : "There's a chapel under the city where they keep the lanterns dark. Nobody goes there. Everybody goes there."] },
      6: { look: 'child', move: 'wander', talk: [() => "My mask is a fox. My brother's mask is ALSO a fox. We are both very sneaky."] },
      7: { look: 'sailor', talk: [() => "A grey-scarfed girl came through a week ago with a woman made of white robes. Everybody pretended not to see them. That's what you do here."], show: () => flag('veraiGone4') && !flag('veraiBack') },
      8: { look: 'hollowwoman', name: 'Unlit Lantern-Keeper', talk: [async () => unlitKeeper()] },
    },
    signs: { '14,7': () => say(null, "A statue of Malakar, the Betrayer Flame: half his mask smiles, half of it burns. Somebody has hung a black, unlit lantern from his hand.") },
  },
  ebonport2: {
    name: 'Ebonport - The Under-streets', theme: 'masks', music: 'masks', under: '.', exitArt: 'floor', start: [2, 14, 'up'], bg: 'masks',
    rows: [
      "##########################",
      "#.......#..........#....>#",
      "#.#####.#.########.#.###.#",
      "#.#...#......#.....#.#...#",
      "#.#.#.######.#.#####.#.#.#",
      "#...#........#.......#...#",
      "###.##########.#######...#",
      "#......1...............2.#",
      "#.#######.##.#########...#",
      "#.#.....#.##.#.......#...#",
      "#.#.###.#....#.#####.###.#",
      "#...#Q..#.##...#..V#.....#",
      "#####.###.####.#.###.#####",
      "#.......3.............L..#",
      "#<.......................#",
      "##########################",
    ],
    warps: { '<': { map: 'ebonport', at: '>' }, '>': { map: 'ebonport3', at: '<' } },
    chests: { Q: { id: 'c5_eb2a', item: 'shadowsilk' }, V: { id: 'c5_eb2b', item: 'thunderjar', n: 3 } },
    npcs: {
      1: { look: 'kargath', name: 'Mask Warden', patrol: ['right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'left', 'left', 'left', 'left', 'left', 'left', 'left', 'left', 'left', 'left'], sight: 4, pace: 24, onSpot: n => wardenSpotted(n), talk: [] },
      2: { look: 'kargath', name: 'Mask Warden', patrol: ['left', 'left', 'left', 'left', 'left', 'left', 'right', 'right', 'right', 'right', 'right', 'right'], sight: 4, pace: 30, onSpot: n => wardenSpotted(n), talk: [] },
      3: { look: 'kargath', name: 'Mask Warden', patrol: ['right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'left', 'left', 'left', 'left', 'left', 'left', 'left', 'left'], sight: 3, pace: 26, onSpot: n => wardenSpotted(n), talk: [] },
    },
  },
  ebonport3: {
    name: 'Ebonport - The Chapel of the Veiled Night', theme: 'chapel', music: 'veil', under: '.', exitArt: 'floor', start: [10, 13, 'up'], bg: 'chapel',
    rows: [
      "#####################",
      "#;;;;;;;;.aa.;;;;;;;#",
      "#;.......___.......;#",
      "#;.......___.......;#",
      "#;..o....___....o..;#",
      "#;.......___.......;#",
      "#;.......1_2.......;#",
      "#;..o....___....o..;#",
      "#;.......___.......;#",
      "#;.Q.....___.....V.;#",
      "#;.......___.......;#",
      "#;......L___.......;#",
      "#;.......___.......;#",
      "#;........<........;#",
      "#####################",
    ],
    warps: { '<': { map: 'ebonport2', at: '>' } },
    npcs: {
      1: { enemy: 'maskedregent', scale: 0.32, name: 'The Masked Regent', show: () => !flag('ch5regent'), talk: [async () => chapelEvent()] },
      2: { look: 'verai', name: 'Verai', show: () => flag('veraiGone4') && !flag('veraiBack') && !flag('ch5veil') && !flag('ch5vvActor'), talk: [async () => chapelEvent()] },
    },
    chests: { Q: { id: 'c5_eb3a', item: 'nyxianrod' }, V: { id: 'c5_eb3b', item: 'veilmantle' } },
    signs: { '10,1': () => nyxiaAltar(), '11,1': () => nyxiaAltar() },
    steps: { '9,8': () => chapelEvent(), '10,8': () => chapelEvent(), '11,8': () => chapelEvent() },
  },
  starfall: {
    name: 'Starfall Isle', theme: 'orrery', music: 'library', under: '.', exitArt: 'floor', worldId: 'thalemyr', back: [42, 6], start: [7, 8, 'up'], bg: 'library', skyBack: true,
    rows: [
      "##############",
      "#....a..a....#",
      "#.)........).#",
      "#....____....#",
      "#.Q..____..V.#",
      "#....____....#",
      "#.)........).#",
      "#............#",
      "#.....L......#",
      "#######XX#####",
    ],
    chests: { Q: { id: 'c5_sf1', item: 'astralcharm' }, V: { id: 'c5_sf2', item: 'starmail' } },
    signs: { '5,1': () => say(null, "Carved into the altar: 'Myndra fell here as a star, before she was a god. She said the view was worth the fall.'"), '8,1': () => say(null, "A second inscription, newer, scratched in a hurry: 'The storm is made of somebody's night. Nights can be borrowed. -S.'") },
  },
  // ---- Zalakir ----
  rimward: {
    name: 'Rimward, the Pilgrim Camp', theme: 'camp', music: 'zalakir', under: 'g', exitArt: 'path', worldId: 'zalakir', back: [7, 14], start: [12, 13, 'up'],
    rows: [
      "tttttttttttttttttttttttttt",
      "tggggggggggggggggggggggggt",
      "tgRRRRgggRRRRRgggggRRRRggt",
      "tgbWbbgggbbNbbgggggbIbbggt",
      "tgggggggg,,,,,,ggggggggggt",
      "tgg1ggggg,gggg,ggg2ggggggt",
      "tgRRRRggg,gOgg,gggggRRRRgt",
      "tgbAbbggg,gggg,ggLggbbHbgt",
      "tggggggg3,,,,,,ggggggggggt",
      "tgggg4ggggg,ggggggg5ggg6gt",
      "tgggggggggg,gg7ggggggggggt",
      "tgggggggggg,,ggggggggggggt",
      "tggggggggg,,gggggggg8ggggt",
      "tggggggggg,,ggggggggggggtt",
      "ttttttttttXXtttttttttttttt",
    ],
    shops: 'rimward',
    npcs: {
      1: { look: 'elder', name: 'Pilgrim Elder', talk: [() => "Godsfall Crater is where the first gods fell out of the sky. Faith out here belongs to nobody. Whoever gets there first and shouts loudest... well. That's what the woman in white is counting on."] },
      2: { look: 'halfling', name: 'Cartographer', talk: [() => "I've mapped the whole Veilstorm. It's a circle. That's it. That's the map. A big purple circle with 'NO' written in it."] },
      3: { look: 'dawnguard', name: 'Hallorn', show: () => flag('hallornSpared'), talk: [async () => hallornRimward()] },
      4: { look: 'lunawolf', name: 'Moonhollow Scout', show: () => flag('hallornKept'), talk: [async () => scoutRimward()] },
      5: { look: 'man', move: 'wander', talk: [() => "We came to pray to whichever god answers first. Nobody's answered. The storm keeps eating the prayers."] },
      6: { look: 'merchant', name: 'Bench Keeper', talk: [async () => hearthBench()], show: () => !!(S().bench || []).length },
      7: { look: 'child', move: 'wander', talk: [() => "My mum says there are wolf ghosts in the jungle up north. GOOD wolf ghosts. They howl at bad people."] },
      8: { look: 'woman', act: 'pray', talk: [() => flag('ch5done') ? "The storm closed over the crater like a fist. Whatever she's doing in there, she isn't done." : "I pray to the empty seat. Somebody should."] },
    },
    signs: { '11,6': () => say(null, "A campfire ringed with offerings to ten different gods. Someone has added an eleventh pile, for 'whoever is listening'.") },
  },
  barrows1: {
    name: 'The Moonfang Barrows - Skyreach Path', theme: 'jungle', music: 'moonhollow', under: 'g', exitArt: 'path', worldId: 'zalakir', back: [12, 6], start: [11, 14, 'up'], enc: 'skyreach', encRate: 0.05, bg: 'jungle',
    rows: [
      "tttttttttttttttttttttttt",
      "tttttttttt,>,ttttttttttt",
      "ttgggtttgg,,,ggtttggQttt",
      "ttgtggggggg,ggggggggtttt",
      "tggtgttttt,,ttttgtggggtt",
      "tgggggggg,,ggggtgtttggtt",
      "ttttttgg,,gggtgggggtggtt",
      "tggggtgg,ttttttttgtggggt",
      "tgVtggggg,,ggggggggttgtt",
      "tgttttttgt,ttttttgggggtt",
      "tgggggggg,,gggggtgtttggt",
      "ttttgtttt,tttgggggggtggt",
      "tggggggg,,ggggttttgggggt",
      "tggtttt,,gggggggggttLggt",
      "tggggg,,ggggggtgggggggtt",
      "tttttttttttXXttttttttttt",
    ],
    warps: { '>': { map: 'barrows2', at: '<' } },
    chests: { Q: { id: 'c5_br1a', item: 'moonwater', n: 4 }, V: { id: 'c5_br1b', item: 'lunarhelm' } },
    steps: { '10,9': () => barrowsMoment(), '9,10': () => barrowsMoment(), '10,10': () => barrowsMoment() },
  },
  barrows2: {
    name: 'The Moonfang Barrows - Hall of First Moons', theme: 'barrow', music: () => flag('ch5barrows') ? 'moonhollow' : 'sorrow', under: '.', exitArt: 'floor', start: [11, 13, 'up'], bg: 'barrow',
    rows: [
      "########################",
      "#J.J.J.J.J.aa.J.J.J.J.J#",
      "#......................#",
      "#..e..............e....#",
      "#.........1............#",
      "#.J.J...........J.J.J..#",
      "#......................#",
      "#..e....____......e....#",
      "#.......____...........#",
      "#.Q.....____........V..#",
      "#.......____...........#",
      "#.....L.____...........#",
      "#.......____...........#",
      "#..........<...........#",
      "########################",
    ],
    warps: { '<': { map: 'barrows1', at: '>' } },
    npcs: { 1: { enemy: 'firstmoonfang', scale: 0.34, name: 'The First Moonfang', show: () => !flag('ch5barrows'), talk: [async () => barrowsTrial()] } },
    chests: { Q: { id: 'c5_br2a', item: 'eclipsefang' }, V: { id: 'c5_br2b', item: 'moonmothermantle' } },
    signs: { '11,1': () => barrowsAltar(), '12,1': () => barrowsAltar() },
    steps: { '9,6': () => barrowsTrial(), '10,6': () => barrowsTrial(), '11,6': () => barrowsTrial(), '12,6': () => barrowsTrial() },
  },
  skynest: {
    name: 'Skyreach Mesa - An Old Nest', theme: 'nest', music: 'sky', under: '.', exitArt: 'path', worldId: 'zalakir', back: [32, 9], start: [8, 8, 'up'], bg: 'summit',
    rows: [
      "^^^^^^^^^^^^^^^^",
      "^^...........^^^",
      "^...Q.....?...^^",
      "^..?...........^",
      "^.......?......^",
      "^......____....^",
      "^.V....____..R.^",
      "^......____....^",
      "^^..........L.^^",
      "^^^^^^^^XX^^^^^^",
    ],
    chests: { Q: { id: 'c5_sn1', item: 'skyscaleclaws' }, V: { id: 'c5_sn2', item: 'phoenixtear', n: 3 }, R: { id: 'c5_sn3', gold: 12000 } },
    signs: { '10,2': () => nestSign(), '3,3': () => nestSign(), '8,4': () => nestSign() },
  },
  echoes: {
    name: 'The Rift of Echoes', theme: 'storm', music: 'veil', under: ':', exitArt: 'floor', worldId: 'zalakir', back: [28, 22], start: [9, 9, 'up'], bg: 'stormplain', skyBack: true,
    rows: [
      "^^^^^^^^^^^^^^^^^^",
      "^^::::::::::::::^^",
      "^:::1::::::::2:::^",
      "^::::::::::::::::^",
      "^:::^^::::::^^:::^",
      "^:Q::::::3:::::V:^",
      "^:::^^::::::^^:::^",
      "^::::::::::::::::^",
      "^:::::::L::::::::^",
      "^^:::::::::::::::^",
      "^^^^^^^^XX^^^^^^^^",
    ],
    chests: { Q: { id: 'c5_ec1', item: 'echoband' }, V: { id: 'c5_ec2', item: 'skyelixir', n: 2 } },
    npcs: {
      1: { look: 'shade', name: 'An Echo', talk: [() => "(A woman's voice, warm, older than the mountains.) \"...if they forget me, let it be gently. Let my night go to someone who will be kind with it.\""] },
      2: { look: 'shade', name: 'An Echo', talk: [() => "(A young woman's voice, sharp with grief.) \"I was promised a seat. I was PROMISED. A bird took it out of my hands.\""] },
      3: { look: 'shade', name: 'An Echo', talk: [async () => echoCenter()] },
    },
  },
  rim1: {
    name: 'The Rim of Godsfall - Storm Road', theme: 'storm', music: 'storm', under: ':', exitArt: 'floor', worldId: 'zalakir', back: [33, 14], start: [2, 13, 'right'], enc: 'stormrim', encRate: 0.045, bg: 'stormplain',
    rows: [
      "^^^^^^^^^^^^^^^^^^^^^^^^^^",
      "^^^^^^^^^^^^^^^^^^^^^^>^^^",
      "^:::::::^^^^:::::::::::::^",
      "^::^^^::::^^::^^^^^^^^::^^",
      "^::^Q^^^::::::^::::::^::^^",
      "^:::::^^^^^^^^^::^^::^::^^",
      "^^^^::::::::::::::^::::::^",
      "^:::::^^^^^^^^^^^^^^^^^::^",
      "^::^::::::::::::::::::^::^",
      "^::^^^^^^^^^^^^^:::^^^^::^",
      "^:::::::::V^^^^^:::::::::^",
      "^^^^^^^^:::::::::^^^^^^^^^",
      "^L::::::::^^^^^::::::::::^",
      "X:::::::::^^^^^^^^^^^^^^^^",
      "^^^^^^^^^^^^^^^^^^^^^^^^^^",
    ],
    warps: { '>': { map: 'rim2', at: '<' } },
    chests: { Q: { id: 'c5_rm1a', item: 'megaelixir', n: 2 }, V: { id: 'c5_rm1b', item: 'stormguard' } },
    steps: { '8,12': () => rimMoment(), '8,13': () => rimMoment() },
  },
  rim2: {
    name: 'The Rim of Godsfall - The Eye', theme: 'storm', music: 'storm', under: ':', exitArt: 'floor', start: [11, 13, 'up'], bg: 'stormplain',
    rows: [
      "^^^^^^^^^^^^^^^^^^^^^^",
      "^wwwwwwwwwwwwwwwwwwww^",
      "^ww::::::::::::::::ww^",
      "^w::::::::1:::::::::w^",
      "^w::::::::::::::::::w^",
      "^w:::o::::____::::o:w^",
      "^w::::::::____::::::w^",
      "^w::::::::____::::::w^",
      "^w:::o::::____::::o:w^",
      "^w::::::::____::::::w^",
      "^w::L:::::____::::::w^",
      "^ww:::::::____:::::ww^",
      "^www::::::____::::www^",
      "^^^^^^^^^^^<^^^^^^^^^^",
    ],
    warps: { '<': { map: 'rim1', at: '>' } },
    npcs: { 1: { enemy: 'stormherald', scale: 0.34, name: 'The Storm Herald', show: () => !flag('ch5herald'), talk: [async () => eyeEvent()] } },
    steps: { '10,6': () => eyeEvent(), '11,6': () => eyeEvent() },
  },
});

// fire / valve puzzles: four (or three) things to light, then the sealed way opens
const CRADLE_BRAZIERS = [[3, 4], [18, 4], [3, 11], [18, 11]];
const FORGE_VALVES = [[2, 3], [19, 3], [10, 10]];
Object.assign(MAPS, {
  // ---- the Ashen Crown, ally route: the phoenix cradle ----
  cradle1: {
    name: 'The Ashen Crown - Phoenix Cradle', theme: 'caldera', music: 'phoenix', under: 'U', exitArt: 'floor', worldId: 'ashkar', back: [5, 3], start: [10, 14, 'up'], enc: 'cradle', encRate: 0.05, bg: 'caldera', embers: () => true,
    rows: [
      "######################",
      "##########>###########",
      "#DDDDDDDD.GG.DDDDDDDD#",
      "#UUUUUUUU.UU.UUUUUUUU#",
      "#UU`UUUUUUUUUUUUUU`UU#",
      "#UUUUUUDDDUUDDDUUUUUU#",
      "#UUDDUUUUUUUUUUUUDDUU#",
      "#UUUUUUUUUQUUUUUUUUUU#",
      "#DDDDUUUUUUUUUUUUDDDD#",
      "#UUUUUUUDDUUDDUUUUUUU#",
      "#UUUUUUUUUUUUUUUUUUUU#",
      "#UU`UUUUUUUUUUUUUU`UU#",
      "#UUUUUUUUVUUUUUUUUUUU#",
      "#UUUUUULUUUUUUUUUUUUU#",
      "#UUUUUUUUUUUUUUUUUUUU#",
      "##########XX##########",
    ],
    tileOverride: c => c === 'G' ? (flag('ch5braziers') ? IN_TILES.U : { art: 'lavaflow', solid: true, anim: 4 }) : null,
    overlay(cx, cy) { CRADLE_BRAZIERS.forEach(([x, y], i) => { if (flag('cradleB' + i)) glowAt(x, y, cx, cy, 'rgba(255,140,40,0.6)'); }); },
    warps: { '>': { map: 'cradle2', at: '<' } },
    chests: { Q: { id: 'c5_cr1a', item: 'emberplume', n: 4 }, V: { id: 'c5_cr1b', item: 'cinderhelm' } },
    signs: Object.fromEntries(CRADLE_BRAZIERS.map(([x, y], i) => [x + ',' + y, () => lightBrazier(i)])),
  },
  cradle2: {
    name: 'The Ashen Crown - The Nest of the First Flame', theme: 'caldera', music: () => flag('ch5flame') ? 'phoenix' : 'sorrow', under: 'U', exitArt: 'floor', start: [10, 12, 'up'], bg: 'caldera', embers: () => true,
    rows: [
      "######################",
      "#DDDDDDDD.aa.DDDDDDDD#",
      "#DUUUUUUUUUUUUUUUUUUD#",
      "#DUUUUUUUU1UUUUUUUUUD#",
      "#DUUUUUUU____UUUUUUUD#",
      "#DUUoUUUU____UUUUoUUD#",
      "#DUUUUUUU____UUUUUUUD#",
      "#DUUUUUUU____UUUUUUUD#",
      "#DUUQUUUU____UUUUVUUD#",
      "#DUUUUUUU____UUUUUUUD#",
      "#DUUUULUU____UUUUUUUD#",
      "#DUUUUUUU____UUUUUUUD#",
      "#DUUUUUUUU<UUUUUUUUUD#",
      "######################",
    ],
    warps: { '<': { map: 'cradle1', at: '>' } },
    npcs: { 1: { enemy: 'gutterqueen', scale: 0.34, name: 'The Gutter Queen', show: () => !flag('ch5gutter'), talk: [async () => cradleEvent()] } },
    chests: { Q: { id: 'c5_cr2a', item: 'phoenixtear', n: 3 }, V: { id: 'c5_cr2b', item: 'ashenrobe' } },
    signs: { '9,1': () => cradleNest(), '10,1': () => cradleNest(), '11,1': () => cradleNest() },
    steps: { '9,6': () => cradleEvent(), '10,6': () => cradleEvent(), '11,6': () => cradleEvent() },
  },
  // ---- the Ashen Crown, rival route: Sonia's Unseated reforge the Anvil into a crown ----
  forge1: {
    name: 'The Ashen Crown - The Unseated Forge', theme: 'forge', music: 'forge', under: '.', exitArt: 'floor', worldId: 'ashkar', back: [5, 3], start: [10, 14, 'up'], enc: 'unseatedforge', encRate: 0.05, bg: 'forge', embers: () => true,
    rows: [
      "######################",
      "##########>###########",
      "#........GGGG........#",
      "#.`................`.#",
      "#....DDDDD..DDDDD....#",
      "#....D...D..D...D....#",
      "#.Q..D...D..D...D..V.#",
      "#....DDDDD..DDDDD....#",
      "#....................#",
      "#.oo..oo..CC..oo..oo.#",
      "#.........`..........#",
      "#..CC............CC..#",
      "#......L.............#",
      "#....................#",
      "#....................#",
      "##########XX##########",
    ],
    tileOverride: c => c === 'G' ? (flag('ch5valves') ? IN_TILES['.'] : { art: 'lavaflow', solid: true, anim: 4 }) : null,
    overlay(cx, cy) { FORGE_VALVES.forEach(([x, y], i) => { if (flag('forgeV' + i)) glowAt(x, y, cx, cy, 'rgba(120,180,255,0.5)'); }); },
    warps: { '>': { map: 'forge2', at: '<' } },
    chests: { Q: { id: 'c5_fg1a', item: 'megaelixir', n: 2 }, V: { id: 'c5_fg1b', item: 'forgemail' } },
    signs: Object.fromEntries(FORGE_VALVES.map(([x, y], i) => [x + ',' + y, () => turnValve(i)])),
  },
  forge2: {
    name: 'The Ashen Crown - The Crowning Floor', theme: 'forge', music: () => flag('ch5flame') ? 'forge' : 'keep', under: '.', exitArt: 'floor', start: [10, 12, 'up'], bg: 'forge', embers: () => true,
    rows: [
      "#####################",
      "#oDDDDDDD.aa.DDDDDDo#",
      "#...................#",
      "#.........1.........#",
      "#........___........#",
      "#..o.....___.....o..#",
      "#........___........#",
      "#........___........#",
      "#..Q.....___.....V..#",
      "#........___........#",
      "#....L...___........#",
      "#........___........#",
      "#.........<.........#",
      "#####################",
    ],
    warps: { '<': { map: 'forge1', at: '>' } },
    npcs: { 1: { enemy: 'anvilcrowned', scale: 0.34, name: 'The Anvil-Crowned', show: () => !flag('ch5crowned'), talk: [async () => forgeEvent()] } },
    chests: { Q: { id: 'c5_fg2a', item: 'phoenixtear', n: 3 }, V: { id: 'c5_fg2b', item: 'unseatedhelm' } },
    signs: { '10,1': () => forgeAnvil(), '11,1': () => forgeAnvil() },
    steps: { '9,6': () => forgeEvent(), '10,6': () => forgeEvent(), '11,6': () => forgeEvent() },
  },
  // ---- Brakka's master's powder vault (Ashkar, ringed by lava) ----
  vault: {
    name: 'Old Gruntle\'s Powder Vault', theme: 'forge', music: 'forge', under: '.', exitArt: 'floor', worldId: 'ashkar', back: [41, 20], start: [10, 12, 'up'], bg: 'forge', skyBack: true,
    rows: [
      "######################",
      "#CC..C....aa....C..CC#",
      "#C..................C#",
      "#....pp....1....pp...#",
      "#.C................C.#",
      "#....CC........CC....#",
      "#.Q................V.#",
      "#....pp........pp....#",
      "#.C........k.......C.#",
      "#......L.............#",
      "#.CC..............CC.#",
      "#....................#",
      "#...............R....#",
      "##########XX##########",
    ],
    npcs: { 1: { enemy: 'vaultcolossus', scale: 0.32, name: 'Vault Colossus', show: () => !flag('ch5vault'), talk: [async () => vaultEvent()] } },
    chests: { Q: { id: 'c5_vt1', item: 'thunderwife' }, V: { id: 'c5_vt2', item: 'gunnergoggles' }, R: { id: 'c5_vt3', item: 'megatonic', n: 4 } },
    signs: { '10,1': () => vaultLetter(), '11,1': () => vaultLetter(), '11,8': () => vaultLetter() },
    steps: { '10,5': () => vaultEvent(), '11,5': () => vaultEvent(), '10,6': () => vaultEvent(), '11,6': () => vaultEvent() },
  },
  // ---- Aurelion: Heartbloom Hollow, where Elaris's last seed can be planted ----
  bloom1: {
    name: 'Heartbloom Hollow - The Blighted Valley', theme: 'bloomgrove', music: 'vale', under: 'g', exitArt: 'path', worldId: 'world', back: [27, 29], start: [12, 14, 'up'], enc: 'blight', encRate: 0.055, bg: 'vale',
    rows: [
      "''''''''''''''''''''''''",
      "'''''''''''>''''''''''''",
      "'gggtgggg--,--ggggtgggQ'",
      "'gFFgggg---,---gggggggg'",
      "'gggg''''-,,-''''tggt-g'",
      "'tgg-------,----ggggg-g'",
      "'gg--''''',,'''''-gg--g'",
      "'g--'gggg-,----g'-----g'",
      "'g-'ggFg--,-ttg''''---g'",
      "'g-gg'''---,----gg''-gg'",
      "'g--ggg--,,,----ggg'-gg'",
      "'gg---g-,,---''---gg--g'",
      "'gV'---,,--gg--''-ggg-g'",
      "'gg'--,,--gggg--L-----g'",
      "'ggg--,,----gggg--ggggg'",
      "'''''''''''XX'''''''''''",
    ],
    warps: { '>': { map: 'bloom2', at: '<' } },
    chests: { Q: { id: 'c5_bl1a', item: 'heartdew', n: 3 }, V: { id: 'c5_bl1b', item: 'thornmail' } },
    steps: { '11,9': () => bloomMoment(), '10,10': () => bloomMoment(), '11,10': () => bloomMoment() },
  },
  bloom2: {
    name: 'Heartbloom Hollow - The Seedbed', theme: 'bloomgrove', music: () => flag('ch5seed') ? 'vale' : 'sorrow', under: 'g', exitArt: 'path', start: [10, 12, 'up'], bg: 'vale',
    rows: [
      "'''''''''''''''''''''",
      "'FFFFFgg.WW.ggFFFFFF'",
      "'Fgggggggggggggggggg'",
      "'ggggggggg1ggggggggg'",
      "'gggggggg---gggggggg'",
      "'ggtgggg-----ggggtgg'",
      "'ggggggg-----ggggggg'",
      "'ggggggg-----ggggggg'",
      "'ggQggggg---ggggVggg'",
      "'ggggggggggggggggggg'",
      "'gggLggggggggggggggg'",
      "'ggggggggggggggggggg'",
      "'ggggggggg<ggggggggg'",
      "'''''''''''''''''''''",
    ],
    tileOverride: c => c === 'W' ? (flag('ch5seed') ? { art: 'sapling', solid: true, anim: 2 } : { art: 'seedbed', solid: true, anim: 2 }) : c === '-' && flag('ch5graft') ? IN_TILES.g : null,
    warps: { '<': { map: 'bloom1', at: '>' } },
    npcs: { 1: { enemy: 'blightgraft', scale: 0.34, name: 'The Blight Graft', show: () => !flag('ch5graft'), talk: [async () => graftEvent()] } },
    chests: { Q: { id: 'c5_bl2a', item: 'heartwoodstaff' }, V: { id: 'c5_bl2b', item: 'embracecharm' } },
    signs: { '9,1': () => seedbed(), '10,1': () => seedbed() },
    steps: { '9,6': () => graftEvent(), '10,6': () => graftEvent(), '11,6': () => graftEvent() },
  },
  // ---- Aurelion: Miasma's old hoard, behind the reef ----
  hoard: {
    name: 'A Dragon\'s Hoard (Twenty Years Dusty)', theme: 'hoard', music: 'cave', under: '.', exitArt: 'floor', worldId: 'world', back: [53, 2], start: [11, 12, 'up'], bg: 'summit', skyBack: true,
    rows: [
      "########################",
      "#??.....?...?.....?????#",
      "#?..Q.......1......??..#",
      "#..........___.........#",
      "#.?........_____.....?.#",
      "#.........._____.......#",
      "#..?.......___.....V...#",
      "#......?...........?...#",
      "#.R..............?.....#",
      "#........k.....L.......#",
      "#??.......?.......??...#",
      "#?.....................#",
      "#?...S.................#",
      "##########XX############",
    ],
    npcs: { 1: { enemy: 'goldscale', scale: 0.32, name: 'Goldscale', show: () => !flag('ch5hoard'), talk: [async () => hoardEvent()] } },
    chests: { Q: { id: 'c5_hd1', item: 'oldskytalons' }, V: { id: 'c5_hd2', item: 'dragonmail' }, R: { id: 'c5_hd3', gold: 30000 }, S: { id: 'c5_hd4', item: 'babyblanket' } },
    signs: { '9,9': () => hoardShelf() },
    steps: { '10,5': () => hoardEvent(), '11,5': () => hoardEvent(), '12,5': () => hoardEvent(), '13,5': () => hoardEvent() },
  },
  // ---- the Frostreach: the Stilled Hourglass of Kryos, the Pale Watcher ----
  hourglass1: {
    name: 'The Stilled Hourglass - The Falling Sand', theme: 'hourglass', music: 'frost', under: '.', exitArt: 'floor', worldId: 'frostreach', back: [24, 13], start: [10, 12, 'up'], enc: 'hourglass', encRate: 0.04, bg: 'icecave', skyBack: true,
    rows: [
      "yyy>yyyyyyyyyyyyyyyy",
      "yiiiiiyyiiiyiiiyiyiy",
      "yiyiii.yiiiiiiiiiiyy",
      "yiiiiyyiiiiiiiiiiiiy",
      "yyiiiyiiyiiiiiiiiiiy",
      "yiiiiiiiiiiiiiiiyiiy",
      "yiiiiiiiiiiiiiyiiy.y",
      "yiiiyiiiiiiiiyiiiiiy",
      "yiiiiiyiiiiiiyiiiiiy",
      "yiii.iiiiiiiiiiiiiiy",
      "yiiyyiiiiiiiiiyiiyyy",
      "yiiiiiiiiiiiiiiiiiiy",
      "y..................y",
      "yyyyyyyyyyXyyyyyyyyy",
    ],
    warps: { '>': { map: 'hourglass2', at: '<' } },
    steps: { '9,12': () => hourglassMoment(), '11,12': () => hourglassMoment() },
  },
  hourglass2: {
    name: 'The Stilled Hourglass - The Narrow Waist', theme: 'hourglass', music: 'frost', under: '.', exitArt: 'floor', start: [11, 13, 'up'], enc: 'hourglass', encRate: 0.035, bg: 'icecave',
    rows: [
      "yyyyyyyyyyyyyyy>yyyyyy",
      "yiiiiiiyiiiiiiiiiiiiyy",
      "yiiy.iiyiiiiiiiiiyiiiy",
      "yiiiiyiiyiyiiyiiiiiiiy",
      "yiiiiiiiiiiiiiyiiiiiyy",
      "yiiyiiiiiiiiiiiy.iyiyy",
      "yiiiyiiiiiiyiiiiiiyiyy",
      "yiiiiiiiiiiiiiiiiiiiiy",
      "yiiiyiiiyiiiiiiiyyiiiy",
      "yiiiyiiiiiiyiiiiiiiiyy",
      "yiiiiiiiiiiiiiiiiyyyiy",
      "yi.iiiiiiiiyiiiiiiyiiy",
      "yiiiiiiiiiiiiiiiiiiiiy",
      "y..........<.........y",
      "yyyyyyyyyyyyyyyyyyyyyy",
    ],
    warps: { '<': { map: 'hourglass1', at: '>' }, '>': { map: 'hourglass3', at: '<' } },
  },
  hourglass3: {
    name: 'The Stilled Hourglass - Where the Sand Stops', theme: 'hourglass', music: () => flag('ch5hour') ? 'frost' : 'sorrow', under: '.', exitArt: 'floor', start: [9, 12, 'up'], bg: 'icecave',
    rows: [
      "yyyyyyyyyyyyyyyyyyy",
      "yV.V.V..aa..V.V.V.y",
      "y.................y",
      "y........1........y",
      "y.......___.......y",
      "y..V....___....V..y",
      "y.......___.......y",
      "y..Q....___....R..y",
      "y.......___.......y",
      "y...L...___.......y",
      "y.......___.......y",
      "y.................y",
      "y........<........y",
      "yyyyyyyyyyyyyyyyyyy",
    ],
    warps: { '<': { map: 'hourglass2', at: '>' } },
    npcs: { 1: { enemy: 'hourwarden', scale: 0.32, name: 'The Hourwarden', show: () => !flag('ch5hour'), talk: [async () => hourglassEvent()] } },
    chests: { Q: { id: 'c5_hg3a', item: 'winteroath' }, R: { id: 'c5_hg3b', item: 'palecrown' } },
    signs: { '8,1': () => kryosAltar(), '9,1': () => kryosAltar() },
    steps: { '8,5': () => hourglassEvent(), '9,5': () => hourglassEvent(), '10,5': () => hourglassEvent() },
  },
});
