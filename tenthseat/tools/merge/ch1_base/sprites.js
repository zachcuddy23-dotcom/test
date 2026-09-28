'use strict';
// ---------------------------------------------------------------------------
// Chibi field sprites (16x22 art + 1px outline) generated from a "look"
// ---------------------------------------------------------------------------
const LOOKS = {
  miasma: { skin: '#f2c8a4', hair: '#c8321e', eyes: '#e8a020', top: '#3e6a2e', sleeve: '#3e6a2e', bottom: 'dress', bottomCol: '#3e6a2e', hem: '#c87a30', boots: '#3a2a22', belt: '#b0282a', hairStyle: 'long', horns: '#3a2e28', wings: '#5e5048', gloves: '#2a2020' },
  verai: { skin: '#b87a4a', hair: '#201a16', eyes: '#3a2010', top: '#5a6e24', sleeve: '#6a4222', bottom: 'dress', bottomCol: '#5a6e24', under: '#6a4222', boots: '#6a4222', belt: '#6a4222', hairStyle: 'volume', smoke: true, scarf: '#3a3a42' },
  raine: { skin: '#f8d0b0', hair: '#ff6a1a', eyes: '#2aa040', top: '#f0ece6', sleeve: '#1e1e24', bottom: 'pants', bottomCol: '#3a5a98', boots: '#1a1a1e', belt: '#6a4020', hairStyle: 'spiky', coat: '#1e1e24', pendant: '#e0b030' },
  luna: { skin: '#e8d0c0', hair: '#c8d0e8', eyes: '#ffd040', top: '#b8c0d0', sleeve: '#b8c0d0', bottom: 'pants', bottomCol: '#8890a8', boots: '#5a5a6a', hairStyle: 'short', hat: 'helm', hatCol: '#c8d0e0', cape: '#3a4a8a', belt: '#d0a840' },
  lunawolf: { skin: '#c8d0e8', hair: '#e8ecf8', eyes: '#ffd040', top: '#b8c0d0', sleeve: '#b8c0d0', bottom: 'pants', bottomCol: '#8890a8', boots: '#5a5a6a', hairStyle: 'spiky', ears: true, cape: '#3a4a8a', belt: '#d0a840' },
  odeaon: { skin: '#e8b890', hair: '#d8d0c0', eyes: '#3a60a0', top: '#d8dce8', sleeve: '#d8dce8', bottom: 'pants', bottomCol: '#a8acc0', boots: '#6a6a7a', hairStyle: 'short', beard: '#d8d0c0', cape: '#2a3a8a', belt: '#d0a840' },
  vesper: { skin: '#b0b0c8', hair: '#f0f0f4', eyes: '#ffc040', top: '#f0e8d8', sleeve: '#f0e8d8', bottom: 'robe', bottomCol: '#f0e8d8', hem: '#d0a030', boots: '#a08030', hairStyle: 'long', ears: true, hat: 'halo', belt: '#d0a030' },
  warden: { skin: '#f0c8a0', hair: '#6a4a2a', eyes: '#303030', top: '#f0e8d0', sleeve: '#f0e8d0', bottom: 'pants', bottomCol: '#5a5a6a', boots: '#3a3030', hairStyle: 'short', hat: 'helm', hatCol: '#d0a840', belt: '#8a6a30', coat: '#2a2a34' },
  tamsin: { skin: '#e0a880', hair: '#2a1e18', eyes: '#302010', top: '#f0e8d0', sleeve: '#2a2a34', bottom: 'pants', bottomCol: '#5a5a6a', boots: '#2a2020', hairStyle: 'bun', coat: '#2a2a34', belt: '#d0a840' },
  dawnguard: { skin: '#f0c8a0', hair: '#c8a060', eyes: '#303050', top: '#e8e8f0', sleeve: '#e8e8f0', bottom: 'pants', bottomCol: '#c8c8d8', boots: '#8a8a9a', hairStyle: 'short', hat: 'helm', hatCol: '#e8e8f0', cape: '#d0a030' },
  priest: { skin: '#f0c8a8', hair: '#c8a060', eyes: '#302010', top: '#fff8e8', sleeve: '#fff8e8', bottom: 'robe', bottomCol: '#fff8e8', hem: '#e0b030', boots: '#c0a060', hairStyle: 'short', hat: 'hood', hatCol: '#e0c060' },
  oracle: { skin: '#c89070', hair: '#1a1420', eyes: '#8060c0', top: '#4a3a6a', sleeve: '#4a3a6a', bottom: 'robe', bottomCol: '#3a2a5a', boots: '#2a2030', hairStyle: 'long', hat: 'hood', hatCol: '#2a2040' },
  elder: { skin: '#b88060', hair: '#d8d0e0', eyes: '#302010', top: '#5a4a6a', sleeve: '#5a4a6a', bottom: 'robe', bottomCol: '#4a3a5a', boots: '#3a2a2a', hairStyle: 'bun', scarf: '#3a3a42' },
  man: { skin: '#e8b890', hair: '#5a3a1a', eyes: '#302010', top: '#5a8ac0', sleeve: '#5a8ac0', bottom: 'pants', bottomCol: '#6a5030', boots: '#4a3020', hairStyle: 'short', belt: '#4a3020' },
  woman: { skin: '#f0c8a8', hair: '#8a4a2a', eyes: '#302010', top: '#c86a4a', sleeve: '#c86a4a', bottom: 'dress', bottomCol: '#e0c8a0', boots: '#6a4a2a', hairStyle: 'bun' },
  hollowman: { skin: '#b87a4a', hair: '#1a1410', eyes: '#302010', top: '#5a6e24', sleeve: '#6a4222', bottom: 'pants', bottomCol: '#6a4222', boots: '#4a3020', hairStyle: 'short', scarf: '#3a3a42' },
  hollowwoman: { skin: '#a86a3a', hair: '#1a1410', eyes: '#302010', top: '#6a4222', sleeve: '#6a4222', bottom: 'dress', bottomCol: '#5a6e24', boots: '#4a3020', hairStyle: 'long', smoke: true },
  oldman: { skin: '#e8c0a0', hair: '#d0d0d0', eyes: '#302010', top: '#7a6a50', sleeve: '#7a6a50', bottom: 'robe', bottomCol: '#6a5a40', boots: '#4a3a2a', hairStyle: 'bald', beard: '#e0e0e0' },
  child: { skin: '#f8d0b0', hair: '#c89040', eyes: '#302010', top: '#50a050', sleeve: '#50a050', bottom: 'pants', bottomCol: '#4060a0', boots: '#6a3a1a', hairStyle: 'short', small: true },
  halfling: { skin: '#f0c090', hair: '#8a5a2a', eyes: '#302010', top: '#e0c050', sleeve: '#e0c050', bottom: 'pants', bottomCol: '#6a8a3a', boots: '#6a4a2a', hairStyle: 'short', small: true, belt: '#6a4a2a' },
  merchant: { skin: '#e8b890', hair: '#3a2a1a', eyes: '#302010', top: '#e0c050', sleeve: '#e0c050', bottom: 'pants', bottomCol: '#6a4a2a', boots: '#4a3020', hairStyle: 'short', hat: 'bandana', hatCol: '#3a6a3a', belt: '#4a3020' },
  sailor: { skin: '#e0b088', hair: '#e0c070', eyes: '#302010', top: '#f0f0f0', stripe: '#3050a0', sleeve: '#f0f0f0', bottom: 'pants', bottomCol: '#3050a0', boots: '#3a2a20', hairStyle: 'short' },
  grell: { skin: '#8aa070', hair: '#3a3a3a', eyes: '#302010', top: '#e8e0d0', sleeve: '#1e2a4a', bottom: 'pants', bottomCol: '#3a2a20', boots: '#2a1c14', hairStyle: 'bald', beard: '#8a8a8a', coat: '#1e2a4a', belt: '#6a3a1a' },
  scholar: { skin: '#f0c8a0', hair: '#c8c8d0', eyes: '#303030', top: '#4a5ab0', sleeve: '#4a5ab0', bottom: 'robe', bottomCol: '#4a5ab0', boots: '#3a2a5a', hairStyle: 'short', hat: 'wizard', hatCol: '#3a4a9a', beard: '#d8d8e0' },
  elf: { skin: '#f4dcc0', hair: '#f0e8a0', eyes: '#2a8040', top: '#c070b0', sleeve: '#c070b0', bottom: 'robe', bottomCol: '#a05090', boots: '#5a4a2a', hairStyle: 'long', ears: true },
  shade: { skin: '#120c1c', hair: '#2a2238', eyes: '#c060ff', top: '#2a2238', sleeve: '#2a2238', bottom: 'robe', bottomCol: '#2a2238', boots: '#2a2238', hairStyle: 'short', hat: 'hood', hatCol: '#2a2238' },
};
const _chibiCache = {};
// Field sprite override: assets/field_<look>.png, a sheet of 3 columns (stand, step A, step B)
// by 4 rows (down, up, left, right). Any cell size works; it is drawn at 54x72.
function chibi(lookKey, dir = 'down', frame = 0, extra) {
  const k = lookKey + dir + frame + (extra || '');
  if (_chibiCache[k]) return _chibiCache[k];
  const sheet = typeof lookKey === 'string' && typeof IMG !== 'undefined' && IMG['field_' + lookKey];
  if (sheet) {
    const cw = sheet.width / 3, chh = sheet.height / 4, row = { down: 0, up: 1, left: 2, right: 3 }[dir] || 0;
    const c = mkCanvas(cw, chh); c.getContext('2d').drawImage(sheet, (frame % 3) * cw, row * chh, cw, chh, 0, 0, cw, chh);
    return (_chibiCache[k] = c);
  }
  const L = typeof lookKey === 'string' ? LOOKS[lookKey] : lookKey;
  const c = mkCanvas(18, 24), P = painter(c);
  const mirror = dir === 'left';
  drawChibi(P, L, mirror ? 'right' : dir, frame, extra);
  outline(c);
  let out = c;
  if (mirror) { out = mkCanvas(18, 24); const x = out.getContext('2d'); x.translate(18, 0); x.scale(-1, 1); x.drawImage(c, 0, 0); }
  return (_chibiCache[k] = out);
}
function drawChibi(P0, L, dir, f, extra) {
  const P = { p: (x, y, c) => P0.p(x + 1, y + 1, c), r: (a, b, c2, d, col) => P0.r(a + 1, b + 1, c2 + 1, d + 1, col) };
  const sk = L.skin, skD = shade(sk, 0.8), hr = L.hair, hrD = shade(hr, 0.7), hrL = shade(hr, 1.35);
  const top = L.top, topD = shade(top, 0.75), bc = L.bottomCol, bcD = shade(bc, 0.72);
  const sleeping = extra === 'sleep';
  const down = dir === 'down', up = dir === 'up', side = dir === 'right';
  // ---------- back layers
  if (L.wings && !up) {
    const w = L.wings, wd = shade(w, 0.65);
    if (side) { for (let y = 5; y <= 15; y++) { const x0 = Math.max(0, 5 - Math.floor((y - 4) * 0.6)); P.r(x0, y, 5, y, y % 3 === 0 ? wd : w); } P.r(4, 4, 6, 5, wd); }
    else for (const s of [0, 1]) {
      const X = x => s ? 15 - x : x;
      const rows = { 6: [3, 3], 7: [2, 3], 8: [1, 3], 9: [0, 3], 10: [0, 3], 11: [0, 3], 12: [0, 3], 13: [0, 2], 14: [0, 1], 15: [0, 0] };
      for (const [y, [a, b]] of Object.entries(rows)) for (let x = a; x <= b; x++) P.p(X(x), +y, (x + +y) % 3 === 0 ? wd : w);
      P.p(X(3), 5, wd); P.p(X(2), 5, wd);
    }
  }
  if (L.cape && !side) P.r(3, 12, 12, 19, shade(L.cape, 0.85));
  if (L.cape && side) P.r(3, 12, 6, 19, shade(L.cape, 0.85));
  if (L.hairStyle === 'long' && !up) { if (side) P.r(3, 5, 6, 16, hrD); else { P.r(2, 5, 3, 16, hrD); P.r(12, 5, 13, 16, hrD); } }
  if (L.hairStyle === 'volume' && !up) { if (side) { P.r(1, 3, 7, 18, hrD); } else { P.r(1, 3, 14, 18, hrD); P.r(0, 6, 15, 15, hrD); } }
  // ---------- legs
  const small = L.small ? 1 : 0;
  const legs = (xs, y0) => {
    for (const [x, lift] of xs) {
      const col = L.bottom === 'pants' ? bc : sk;
      P.r(x, y0 - lift, x + 1, 19 - lift, col);
      P.r(x, 20 - lift, x + 1, 21 - lift, L.boots);
    }
  };
  if (side) {
    if (f === 0) legs([[6, 0], [8, 0]], 17);
    else if (f === 1) legs([[5, 0], [9, 1]], 17);
    else legs([[6, 1], [8, 0]], 17);
  } else {
    const l1 = f === 1 ? 1 : 0, l2 = f === 2 ? 1 : 0;
    legs([[5, l1], [9, l2]], 17);
  }
  // ---------- body
  const bx0 = side ? 5 : 4, bx1 = side ? 10 : 11;
  P.r(bx0, 12, bx1, 17, top); P.r(bx1, 12, bx1, 17, topD);
  if (L.stripe) for (let y = 13; y <= 17; y += 2) P.r(bx0, y, bx1, y, L.stripe);
  if (L.bottom === 'dress' || L.bottom === 'robe') {
    const bot = L.bottom === 'robe' ? 20 : 19;
    for (let y = 15; y <= bot; y++) { const wd = y > 16 ? 1 : 0; P.r(bx0 - wd, y, bx1 + wd, y, bc); P.p(bx1 + wd, y, bcD); }
    if (L.under) P.r(bx0 - 1, bot, bx1 + 1, bot, L.under);
    if (L.hem) P.r(bx0 - 1, bot, bx1 + 1, bot, L.hem);
    if (!side && L.hem) P.r(7, 16, 8, bot - 1, shade(bc, 0.8));
  } else {
    P.r(bx0, 17, bx1, 17, bc);
  }
  if (L.belt) P.r(bx0, 15, bx1, 15, L.belt);
  if (L.coat) {
    const co = L.coat, coL = shade(co, 1.6);
    if (down) { P.r(4, 12, 6, 19, co); P.r(9, 12, 11, 19, co); P.p(6, 13, coL); P.p(9, 13, coL); P.r(4, 19, 4, 19, coL); }
    else if (up) { P.r(4, 12, 11, 19, co); P.r(7, 16, 8, 19, shade(co, 1.3)); }
    else { P.r(5, 12, 8, 19, co); P.p(8, 13, coL); }
  }
  if (L.pendant && down) { P.p(7, 13, L.pendant); P.p(8, 14, L.pendant); }
  if (L.scarf) { if (side) P.r(5, 11, 10, 13, L.scarf); else P.r(4, 11, 11, 13, L.scarf); P.p(side ? 6 : 5, 12, shade(L.scarf, 1.3)); }
  if (L.beard && !up) { if (side) P.r(8, 9, 11, 13, L.beard); else P.r(5, 9, 10, 13, L.beard); }
  // ---------- arms
  const arm = L.sleeve || top, hand = L.gloves || sk;
  if (side) {
    const hx = f === 1 ? 9 : f === 2 ? 6 : 7;
    P.r(7, 12, 8, 15, arm); P.r(hx, 16, hx + 1, 16, hand); P.r(Math.min(hx, 7), 15, Math.max(hx + 1, 8), 15, arm);
  } else {
    const s1 = f === 1 ? -1 : 0, s2 = f === 2 ? -1 : 0;
    P.r(3, 12, 3, 16 + s1, arm); P.p(3, 17 + s1, hand);
    P.r(12, 12, 12, 16 + s2, arm); P.p(12, 17 + s2, hand);
    if (L.coat) { P.r(3, 12, 3, 16 + s1, L.coat); P.r(12, 12, 12, 16 + s2, L.coat); }
  }
  // ---------- head
  const eye = '#1a1018';
  if (up) {
    P.r(3, 2, 12, 11, hr); P.r(4, 1, 11, 1, hr); P.r(3, 9, 12, 11, hrD); P.r(5, 3, 7, 3, hrL);
    if (L.ears) { P.p(2, 7, sk); P.p(13, 7, sk); }
    if (L.hairStyle === 'long') P.r(3, 11, 12, 16, hrD), P.r(4, 11, 11, 15, hr);
    if (L.hairStyle === 'volume') { P.r(1, 5, 14, 18, hr); P.r(0, 8, 15, 15, hrD); P.r(4, 6, 4, 12, shade(hr, 1.3)); P.r(10, 8, 10, 14, shade(hr, 1.3)); }
    if (L.hairStyle === 'spiky') { P.r(3, 11, 12, 14, hr); P.p(4, 15, hr); P.p(8, 15, hr); P.p(11, 15, hr); }
    if (L.hairStyle === 'bun') P.r(6, 0, 9, 2, hrD);
    if (L.wings) { const w = L.wings, wd = shade(w, 0.65); for (const s of [0, 1]) { const X = x => s ? 15 - x : x; const rows = { 5: [2, 4], 6: [1, 4], 7: [0, 4], 8: [0, 4], 9: [0, 3], 10: [0, 3], 11: [0, 3], 12: [0, 2], 13: [0, 1], 14: [0, 0] }; for (const [y, [a, b]] of Object.entries(rows)) for (let x = a; x <= b; x++) P.p(X(x), +y, (x + +y) % 3 === 0 ? wd : w); } }
  } else if (down) {
    P.r(4, 5, 11, 10, sk); P.r(5, 11, 10, 11, sk); P.r(11, 6, 11, 10, skD);
    if (sleeping) { P.r(5, 8, 6, 8, skD); P.r(9, 8, 10, 8, skD); }
    else { P.r(5, 7, 6, 7, eye); P.r(9, 7, 10, 7, eye); P.p(5, 8, L.eyes); P.p(6, 8, eye); P.p(9, 8, L.eyes); P.p(10, 8, eye); }
    P.p(7, 10, skD); P.p(8, 10, skD);
    if (L.ears) { P.p(2, 7, sk); P.p(3, 7, sk); P.p(13, 7, sk); P.p(12, 7, sk); P.p(1, 6, sk); P.p(14, 6, sk); }
    if (L.hairStyle !== 'bald') {
      P.r(3, 2, 12, 4, hr); P.r(4, 1, 11, 1, hr); P.r(5, 2, 8, 2, hrL);
      for (const x of [4, 5, 7, 8, 10, 11]) P.p(x, 5, hr);
      P.p(4, 6, hr); P.p(11, 6, hr); P.p(7, 6, hrD);
      P.r(3, 5, 3, 10, hr); P.r(12, 5, 12, 10, hr); P.p(3, 11, hrD); P.p(12, 11, hrD);
    } else { P.r(4, 2, 11, 4, sk); P.r(5, 1, 10, 1, sk); P.r(3, 5, 3, 8, hr); P.r(12, 5, 12, 8, hr); P.p(6, 2, shade(sk, 1.2)); }
    if (L.hairStyle === 'bun') P.r(6, 0, 9, 1, hrD);
    if (L.hairStyle === 'volume') { P.r(2, 3, 3, 14, hr); P.r(12, 3, 13, 14, hr); P.r(1, 7, 1, 16, hrD); P.r(14, 7, 14, 16, hrD); }
    if (L.hairStyle === 'long') { P.r(2, 5, 2, 12, hr); P.r(13, 5, 13, 12, hr); }
  } else { // side (right)
    P.r(7, 5, 11, 10, sk); P.r(7, 11, 10, 11, sk); P.p(12, 8, sk);
    if (sleeping) P.r(9, 8, 10, 8, skD); else { P.p(10, 7, eye); P.p(9, 7, eye); P.p(10, 8, L.eyes); P.p(9, 8, eye); }
    P.p(11, 10, skD);
    if (L.hairStyle !== 'bald') {
      P.r(4, 2, 11, 4, hr); P.r(5, 1, 10, 1, hr); P.r(3, 3, 7, 11, hr); P.r(6, 2, 9, 2, hrL); P.p(9, 5, hr); P.p(11, 5, hr); P.p(10, 5, hr); P.r(3, 9, 5, 11, hrD);
    } else { P.r(4, 2, 11, 4, sk); P.r(5, 1, 10, 1, sk); P.r(4, 5, 6, 8, hr); }
    if (L.ears) { P.p(7, 7, sk); P.p(6, 6, sk); P.p(5, 5, sk); }
    if (L.hairStyle === 'volume') P.r(1, 4, 5, 16, hr);
    if (L.hairStyle === 'bun') P.r(3, 1, 5, 3, hrD);
  }
  if (L.hairStyle === 'spiky') {
    for (const [x, y] of [[4, 0], [7, -1 + 1], [10, 0], [2, 3], [13, 3], [2, 7], [13, 7], [5, 0], [11, 1]]) P.p(side ? Math.min(12, x) : x, y, hr);
    P.p(3, 1, hrL); P.p(12, 1, hrL); P.p(8, 0, hrL);
    if (!up) { P.r(2, 5, 2, 13, hr); P.r(13, 5, 13, 13, hr); P.p(1, 9, hr); P.p(14, 9, hr); }
  }
  // ---------- headwear
  if (L.horns) {
    const h = L.horns, hl = shade(h, 1.6);
    if (side) { P.p(8, 2, h); P.p(8, 1, h); P.p(7, 0, hl); P.p(6, 0, h); }
    else { P.p(3, 3, h); P.p(2, 2, h); P.p(2, 1, hl); P.p(3, 0, h); P.p(12, 3, h); P.p(13, 2, h); P.p(13, 1, hl); P.p(12, 0, h); }
  }
  if (L.hat === 'crown') { P.r(5, 0, 10, 2, '#e0b030'); P.p(5, -1 + 1, '#e0b030'); P.p(6, 0, '#fff0a0'); P.p(8, 1, '#c02030'); }
  if (L.hat === 'tiara') { P.r(5, 2, 10, 2, '#e8c040'); P.p(7, 1, '#e8c040'); P.p(8, 1, '#60c0ff'); }
  if (L.hat === 'helm') { const hc = L.hatCol || '#8a90a8'; P.r(3, 1, 12, 6, hc); P.r(4, 0, 11, 0, hc); P.r(4, 1, 6, 2, shade(hc, 1.4)); if (!up && !side) P.r(4, 6, 11, 6, shade(hc, 0.6)); if (side) P.r(4, 1, 7, 9, hc); if (up) P.r(3, 1, 12, 9, hc); }
  if (L.hat === 'tricorn') { P.r(1, 1, 14, 3, '#15151a'); P.r(4, 0, 11, 0, '#15151a'); P.p(7, 1, '#e0b030'); P.p(8, 1, '#e0b030'); }
  if (L.hat === 'bandana') { const hc = L.hatCol || '#b83030'; P.r(3, 2, 12, 4, hc); P.p(3, 5, hc); P.p(2, 5, hc); P.p(6, 3, shade(hc, 1.4)); }
  if (L.hat === 'wizard') { const hc = L.hatCol || '#3a4a9a'; P.r(2, 3, 13, 4, hc); P.r(4, 1, 11, 2, hc); P.r(6, -1 + 1, 9, 0, hc); P.p(7, 2, '#f0e060'); }
  if (L.hat === 'hood') { const hc = L.hatCol; P.r(3, 1, 12, 4, hc); P.r(2, 3, 3, 12, hc); P.r(12, 3, 13, 12, hc); if (up) P.r(3, 1, 12, 12, hc); if (side) P.r(3, 1, 7, 12, hc); }
  if (L.hat === 'halo') { const g = '#f0c030'; P.r(3, -1 + 1, 12, 0, g); P.p(2, 1, g); P.p(13, 1, g); P.p(7, -1 + 1, '#fff8c0'); P.p(1, 0, g); P.p(14, 0, g); }
  if (L.smoke) {
    const s = 'rgba(70,70,82,0.85)', s2 = 'rgba(40,40,50,0.9)';
    for (const [x, y] of [[0, 4], [15, 5], [0, 12], [15, 11], [1, 17], [14, 17], [0, 17]]) P.p(x, y, s);
    P.p(15, 4, s2); P.p(0, 3, s2); P.p(15, 12, s2);
  }
}
// small object sprites (16x16)
const OBJ = (() => {
  const mk = fn => { const c = mkCanvas(16, 16); fn(painter(c)); return c; };
  return {
    chest: mk(P => { P.r(1, 5, 14, 14, '#7a4a20'); P.r(1, 5, 14, 8, '#a0662c'); P.r(1, 4, 14, 4, '#3a2410'); P.r(1, 9, 14, 9, '#e0b030'); P.r(7, 8, 8, 11, '#e0b030'); P.r(1, 15, 14, 15, '#3a2410'); P.r(0, 5, 0, 14, '#3a2410'); P.r(15, 5, 15, 14, '#3a2410'); P.p(7, 10, '#3a2410'); }),
    chestOpen: mk(P => { P.r(1, 8, 14, 14, '#7a4a20'); P.r(1, 2, 14, 7, '#5a3418'); P.r(2, 7, 13, 9, '#1a0c04'); P.r(1, 11, 14, 11, '#e0b030'); P.r(1, 15, 14, 15, '#3a2410'); P.r(0, 2, 0, 14, '#3a2410'); P.r(15, 2, 15, 14, '#3a2410'); }),
    ship: mk(P => { P.r(1, 10, 14, 13, '#7a4a20'); P.r(2, 14, 13, 14, '#5a3418'); P.r(0, 9, 15, 9, '#a0662c'); P.r(7, 0, 8, 9, '#5a3418'); P.r(3, 1, 12, 7, '#f0f0e8'); P.r(3, 7, 12, 7, '#c8c8c0'); P.r(9, 0, 12, 1, '#c03030'); P.r(4, 11, 5, 12, '#e0b030'); P.r(10, 11, 11, 12, '#e0b030'); }),
    sparkle: mk(P => { P.r(7, 2, 8, 13, '#fff8c0'); P.r(2, 7, 13, 8, '#fff8c0'); P.r(6, 6, 9, 9, '#ffffff'); }),
  };
})();
