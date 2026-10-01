'use strict';
// ---------------------------------------------------------------------------
// Chapter Five: "The Open Sky", the semi-finale.
//
// Everyone finally looks at Miasma. Miasma finally remembers she is a dragon. She flies the party
// anywhere (world map: Z to take off and land), the Sky Chart shows the whole of Cael'Brithar,
// and the world opens: Thalemyr and Zalakir, plus places from Chapters One to Four you could
// see but never reach. Only Godsfall Crater stays sealed, inside the Veilstorm. That is the final chapter.
//
// Three keys open the Veilstorm's edge (the Rim of Godsfall):
//   starchart   Astrilion, Myndra's Great Library (Thalemyr)
//   nightlantern Ebonport, the City of Masks: Nyxia's last faithful, and Verai
//   livingflame (Ashkar's ally: rekindle him in his cradle) / crownember (rival: retake the Anvil from Sonia's forge)
// Optional, flight only: Heartbloom Hollow (Elaris -> Bloomwarden), the Stilled Hourglass (Kryos -> Timewarden),
//   the Moonfang Barrows (Luna), Miasma's old hoard, Gruntle's powder vault (Brakka), Starfall Isle,
//   Skyreach Mesa, the Rift of Echoes. Every hero gets an ultimate weapon and a new innate skill.
//
// Choices from earlier chapters change this one:
//   Verai stayed (veraiGone4 unset): Ebonport is about whether she carries Nyxia's night or becomes it (veraiNyxia).
//   Verai left: she is in Ebonport for her mother. Her goodwill (veraiWill), the Chapter Four reach (veraiReach),
//     and what Raine says now decide whether she comes home (veraiBack) or stays lost (veraiLost5).
//   Ashkar's ally: he is guttering in his cradle; the pendant choice (ashkarRisen / ashkarDim).
//   Ashkar's rival: Sonia's Unseated are forging the Anvil into a crown; give it back (ashkarMended) or keep it (anvilKept).
//   Hallorn spared / kept, Luna's trust and the Accord show up in Rimward and the Barrows.
//   At the Rim, someone takes Sonia's blow for Raine: Ashkar, if he is on your side (ashkarFell);
//   otherwise Odeaon (odeaonFell). The Tenth Seat, or a father, is lost going into the final chapter.
//
// Flags: ch5start, skyWings, ch5lib, ch5orrery (+orreryLit), ch5unwritten, ch5star, ch5veil, ch5regent, veraiNyxia,
//   veraiBack, veraiLost5, cradleB0-3, ch5braziers, ch5gutter, ch5valves (+forgeV0-2), ch5crowned, ch5flame,
//   ch5graft, ch5seed (+seedVow), ch5hour (+kryosGlimpse), ch5barrows, ch5hoard, ch5vault, ch5rim, ch5herald, ch5done.
// ---------------------------------------------------------------------------
Object.assign(NPC_FACES, { 'Myndra': 'face_myndra', 'Kryos': 'face_kryos', 'Mask-Seller Quill': 'face_quill', 'The Masked Regent': 'face_regent', 'Old Gruntle (letter)': 'face_gruntle' });
const MYN = 'Myndra', KRY = 'Kryos';

// ------------------------------------------------------------------ helpers
// a hero who travels with the group (party or bench) steps into the scene either way
function heroHere(id) { return !!member(id) || (S().bench || []).some(m => m.id === id); }
function castHero(cast, id) {
  if (cast[id]) return cast[id];
  if (!heroHere(id)) return null;
  const st = S();
  const n = (F().actors || []).length, spot = [[-1, 1], [1, 1], [-2, 1], [2, 1], [0, 2]][n % 5];
  return (cast[id] = F().spawn({ id, look: HEROES[id].look, name: HEROES[id].name, x: st.x + spot[0], y: st.y + spot[1], dir: 'up' }));
}
function anyMember(id) { return member(id) || (S().bench || []).find(m => m.id === id); }
function giveBonus(id, skill) { const m = anyMember(id); if (!m) return false; m.bonus = m.bonus || []; if (!m.bonus.includes(skill)) m.bonus.push(skill); return true; }
function groupLevel() { const all = [...S().party, ...(S().bench || [])]; return Math.round(all.reduce((s, m) => s + m.lvl, 0) / Math.max(1, all.length)); }
// banked experience from the old level cap of 30 pays out now
function catchUpLevels() { for (const m of [...S().party, ...(S().bench || []), ...Object.values(S().away || {})]) gainExp(m, 0); }
function returnFromAway(id) {
  const st = S(), m = st.away && st.away[id]; if (!m) return null;
  delete st.away[id];
  const lv = Math.max(m.lvl, groupLevel()); if (lv > m.lvl) gainExp(m, Math.max(0, EXP_TABLE[lv] - m.exp));
  m.hp = stats(m).mhp; m.mp = stats(m).mmp; m.status = {};
  st.bench = st.bench || []; st.bench.push(m); ensureInParty(id);
  return m;
}
function sendAway(id, when) {
  const st = S(), m = anyMember(id); if (!m) return;
  st.party = st.party.filter(x => x !== m); st.bench = (st.bench || []).filter(x => x !== m);
  st.away = st.away || {}; st.away[id] = m; st.flags[id + 'GoneWhen'] = when;
  if (!st.party.length && st.bench.length) st.party.push(st.bench.shift());
  while (st.party.length < 4 && st.bench.length) st.party.push(st.bench.shift());
}
async function bossFight(enemy, bg, o = {}) {
  healParty();
  const r = await startBattle({ enemies: Array.isArray(enemy) ? enemy : [enemy], boss: true, bg, music: o.music || 'boss', noRun: true, ...o });
  return r === 'win' || r === 'scripted';
}
function flameKeyHeld() { return hasKey('livingflame') || hasKey('crownember'); }
function keysHeld() { return [hasKey('starchart'), hasKey('nightlantern'), flameKeyHeld()].filter(Boolean).length; }

// ------------------------------------------------------------------ flight
function flightOk() {
  const st = S(), f = F();
  if (!flag('skyWings') || !f || !f.map.world || f.scripted) return false;
  if (!st.flying) { f.run(() => takeOff()); return true; }
  f.run(() => landHere()); return true;
}
async function takeOff() {
  const st = S();
  if (st.onShip && F().map.id === 'world') { st.ship = { x: st.x, y: st.y }; st.onShip = false; }
  Audio2.sfx('wind'); Game.shake = 6;
  st.flying = true; Audio2.music('sky');
  if (!flag('ch5flownOnce')) { setFlag('ch5flownOnce'); await say(MI(), pick(["Hold on to something. Not my horns. ANYTHING but the horns.", "Up we go! Nobody look down. Actually, do look down, it's gorgeous."])); }
}
async function landHere() {
  const st = S(), f = F(), k = st.x + ',' + st.y, place = f.map.places[k];
  if (place) {
    if (place.sealed) { await say(null, "Godsfall Crater, under the Veilstorm. Even Miasma can't get through. Not yet."); return; }
    Audio2.sfx('wind');
    await f.enterPlace(place);
    return;
  }
  const c = f.tileAt(st.x, st.y), t = f.tileDef(c);
  if (!t.solid && !t.sea) { st.flying = false; Audio2.sfx('bump'); Game.shake = 4; Audio2.music(musicFor(f.map)); return; }
  const i = await ask(null, "Nowhere to land here.", ['Open the Sky Chart', 'Keep flying']);
  if (i === 0) await openSkyChart();
}
async function stormBump() {
  await say(null, pick(["The Veilstorm throws Miasma back like a leaf. Somewhere inside it, the sky is screaming.", "Purple lightning. Miasma banks hard. \"NOPE. Not without a plan.\""]));
}

// ------------------------------------------------------------------ the Sky Chart: the whole of Cael'Brithar
const SKY_LANDS = [
  { id: 'frostreach', name: 'The Frostreach', x: 470, y: 74 },
  { id: 'thalemyr', name: 'Thalemyr', x: 60, y: 150 },
  { id: 'world', name: 'Aurelion', x: 640, y: 200 },
  { id: 'ashkar', name: 'Ashkar', x: 150, y: 360 },
  { id: 'zalakir', name: 'Zalakir', x: 520, y: 380 },
];
const SKY_SCALE = 4, _skyCache = {}, _avgCol = {};
function tileAvg(c, tiles, theme) {
  const t = tiles[c]; if (!t) return '#000';
  const k = (t.art || '') + theme; if (_avgCol[k]) return _avgCol[k];
  let col = t.sea ? '#2a5ab8' : '#5aa83e';
  try {
    const im = tileImg(t.art, theme, 0, 0), d = im.getContext('2d').getImageData(0, 0, 16, 16).data; let r = 0, g = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    const n = d.length / 4; col = `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`;
  } catch (e) { }
  return (_avgCol[k] = col);
}
function landCanvas(id) {
  if (_skyCache[id]) return _skyCache[id];
  const m = prepMap(id), c = mkCanvas(m.w * SKY_SCALE, m.h * SKY_SCALE), x = c.getContext('2d');
  for (let ty = 0; ty < m.h; ty++) for (let tx = 0; tx < m.w; tx++) {
    let ch = m._grid[ty][tx];
    if (m.gates && m.gates[ch]) ch = m.gates[ch][flag(m.gates[ch][0]) ? 1 : 2];
    if (id === 'world' && ch === 'B') ch = flag('bridge') ? 'B' : 'r';
    if (id === 'world' && ch === 'G') ch = flag('pass') ? 'g' : '^';
    if (ch === '~') continue;
    x.fillStyle = tileAvg(ch, WORLD_TILES, m.theme || 'world'); x.fillRect(tx * SKY_SCALE, ty * SKY_SCALE, SKY_SCALE, SKY_SCALE);
  }
  return (_skyCache[id] = c);
}
class SkyChartScene {
  constructor(res, o = {}) {
    this.res = res; this.o = o; this.t = 0; this.opaque = true;
    const cur = SKY_LANDS.findIndex(l => l.id === S().map);
    this.i = cur >= 0 ? cur : 2;
    this.from = cur;
    this.reveal = o.reveal ? 0 : -1;
  }
  enter() { FULLSCREEN.enter.call(this); Audio2.music('sky'); }
  leave() { FULLSCREEN.leave.call(this); }
  update() {
    this.t++;
    if (this.reveal >= 0) {
      this.rt = (this.rt || 0) + 1;
      if (this.rt > 170 || (Input.ok() && this.rt > 20)) { this.reveal++; this.rt = 0; }
      if (this.reveal >= 6) { Game.pop(this); this.res(null); return; }
      this.i = Math.min(this.reveal, SKY_LANDS.length - 1);
      return;
    }
    const d = Input.hit('left') || Input.hit('up') ? -1 : Input.hit('right') || Input.hit('down') ? 1 : 0;
    if (d) { this.i = (this.i + d + SKY_LANDS.length) % SKY_LANDS.length; Audio2.sfx('cursor'); }
    if (Input.ok()) { Audio2.sfx('ok'); Game.pop(this); this.res(SKY_LANDS[this.i].id); }
    else if (Input.cancel()) { Audio2.sfx('cancel'); Game.pop(this); this.res(null); }
  }
  draw() {
    // the sea, with a chart grid
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#16305a'); g.addColorStop(1, '#0c1c3a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(160,200,255,0.10)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.fillStyle = 'rgba(200,230,255,0.25)'; for (const [a, b] of CINE_R) ctx.fillRect((a * W + this.t * 0.4 * (b + 0.3)) % W, b * H, 14, 1);
    SKY_LANDS.forEach((L, i) => {
      const im = landCanvas(L.id), sel = i === this.i;
      ctx.save(); ctx.globalAlpha = this.reveal >= 0 && i > this.reveal ? 0.25 : 1;
      if (sel) { ctx.shadowColor = 'rgba(255,224,112,0.9)'; ctx.shadowBlur = 22; }
      ctx.drawImage(im, L.x, L.y); ctx.restore();
      const m = prepMap(L.id);
      // places: gold dots; places only a dragon can reach blink until you have been there
      for (const [k, p] of Object.entries(m.places)) {
        const [px, py] = k.split(',').map(Number), sx = L.x + px * SKY_SCALE + 2, sy = L.y + py * SKY_SCALE + 2;
        const pm = typeof p.map === 'function' ? null : (p.map || p);
        if (p.sealed) continue;
        if (p.sky && !(S().seen || {})[pm] && Math.floor(this.t / 20) % 2) { ctx.fillStyle = '#80e0ff'; ctx.fillRect(sx - 3, sy - 3, 6, 6); text('?', sx + 4, sy - 12, '#80e0ff', 10); }
        else { ctx.fillStyle = '#ffe070'; ctx.fillRect(sx - 2, sy - 2, 4, 4); }
      }
      // Godsfall: the Veilstorm turns over the crater
      if (L.id === 'zalakir') {
        const cx = L.x + 39.5 * SKY_SCALE, cy = L.y + 14.5 * SKY_SCALE;
        for (let r = 0; r < 4; r++) { ctx.strokeStyle = `rgba(${170 - r * 20},${80 + r * 10},255,${0.7 - r * 0.12})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 14 + r * 6 + Math.sin(this.t / 10 + r) * 2, this.t / (20 - r * 3), this.t / (20 - r * 3) + 4.2); ctx.stroke(); }
        text('Godsfall', cx, cy + 40, '#c8a0ff', 10, 'center');
      }
      text(L.name, L.x + im.width / 2, L.y + im.height + 18, sel ? '#ffe070' : '#c8d8f0', sel ? 14 : 12, 'center');
      if (i === this.from && Math.floor(this.t / 15) % 2) { const sx = L.x + S().x * SKY_SCALE, sy = L.y + S().y * SKY_SCALE; ctx.fillStyle = '#ff5a40'; ctx.fillRect(sx - 4, sy - 4, 9, 9); }
    });
    // compass rose
    ctx.save(); ctx.translate(880, 560); ctx.fillStyle = 'rgba(255,224,112,0.7)';
    for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(6, 0); ctx.lineTo(-6, 0); ctx.fill(); }
    ctx.restore(); text('N', 880, 508, '#ffe070', 12, 'center');
    text('THE SKY CHART OF CAEL\'BRITHAR', W / 2, 30, '#ffe070', 16, 'center');
    if (this.reveal >= 0) {
      const caps = ['The Frostreach, where Raine burned and a dragon remembered she was one.', 'Thalemyr, the Tides of Knowledge. Myndra\'s Great Library, and Ebonport, the City of Masks.', 'Aurelion, the Bastion of Light. Home, for some of you. Not all of it is as walled-in as it looked.', 'Ashkar, the Dominion of Flame and Ash. A phoenix\'s country.', 'Zalakir, the Unclaimed Wilds. And at its heart, the Veilstorm.', 'Godsfall Crater. That is where Sonia is going. Not yet.'];
      const cap = caps[Math.min(this.reveal, caps.length - 1)];
      drawWindow(60, H - 92, W - 120, 64); text(cap, W / 2, H - 52, '#fff', 13, 'center');
    } else {
      drawWindow(60, H - 92, W - 120, 64);
      const L = SKY_LANDS[this.i];
      text(L.id === S().map ? `${L.name}: you are here.  (Z: stay, X: back)` : `Fly to ${L.name}?  (arrows: choose, Z: fly, X: back)`, W / 2, H - 52, '#fff', 13, 'center');
      text('Blue ? marks: places only a dragon can reach.', W / 2, 54, '#80e0ff', 10, 'center');
    }
  }
}
function skyChart(o) { return new Promise(res => Game.push(new SkyChartScene(res, o))); }
async function openSkyChart() {
  const st = S(), id = await skyChart();
  if (!id) { if (!st.flying) return; const f = F(); st.x = clamp(st.x, 0, f.map.w - 1); st.y = clamp(st.y, 0, f.map.h - 1); return; }
  if (id === st.map) return;
  const m = prepMap(id), [x, y] = m.skyIn || [Math.floor(m.w / 2), Math.floor(m.h / 2)];
  st.flying = true;
  if (st.onShip) { st.onShip = false; }
  Audio2.sfx('wind');
  await fadeOut(30, '#ffffff');
  F().enterMap(id, x, y, 'down');
  await fadeIn(30);
  if (!flag('seen_' + id)) { setFlag('seen_' + id); F().banner = 150; }
}

// ------------------------------------------------------------------ backdrops for the new places
const _cineBg4 = drawCineBg;
drawCineBg = function (bg, t, k) {
  const g = (a, b) => { const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(1, b); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); };
  if (bg === 'sky') {
    g('#2a6ad0', '#c8e8ff');
    for (const [a, b, c] of CINE_R) { const x = ((a * W * 1.4 - t * (2 + c * 4)) % (W + 200) + W + 200) % (W + 200) - 100, y = 80 + b * 420; ctx.fillStyle = `rgba(255,255,255,${0.35 + c * 0.4})`; ctx.fillRect(x, y, 60 + c * 120, 10 + c * 14); ctx.fillRect(x + 20, y - 8, 40 + c * 60, 8); }
    return;
  }
  if (bg === 'storm') {
    g('#0a0414', '#3a1a5a');
    for (const [a, b] of CINE_R) { ctx.fillStyle = 'rgba(160,100,255,0.25)'; ctx.fillRect((a * W + t * 3) % W, b * H, 40, 2); }
    if (t % 50 < 4) { ctx.fillStyle = 'rgba(230,200,255,0.8)'; ctx.fillRect(0, 0, W, H); }
    return;
  }
  if (bg === 'library') { g('#140c18', '#4a3a5a'); ctx.fillStyle = '#2a1a20'; for (let i = 0; i < 12; i++) ctx.fillRect(i * 84, 120, 60, 400); ctx.fillStyle = 'rgba(255,224,112,0.4)'; for (const [a, b] of CINE_R) ctx.fillRect(a * W, b * H - (t * 0.3 % 40), 2, 2); return; }
  _cineBg4(bg, t, k);
};
const BG5 = {
  tidecliff(x, P) { P.grad(0, 60, '#4a90d8', '#d8f0ff'); P.hills(44, 8, '#3a6a6a', 1); P.grad(58, 70, '#2a7ab8', '#4a9ad8'); P.ground(70, '#4aa07a', '#2a6a4a', true); },
  jungle(x, P) { P.grad(0, 70, '#1a3a1a', '#4a8a3a'); for (let i = 0; i < 34; i++) P.tree(Math.round(P.R() * 240), 40 + P.R() * 24, 18 + P.R() * 18, i % 2 ? '#2a6a2a' : '#3a8a2a', '#4a3a20'); P.ground(68, '#3a6a2a', '#1a3a14', true); },
  savanna(x, P) { P.grad(0, 60, '#e8a050', '#fff0c0'); P.hills(46, 6, '#a07a3a', 2); P.ground(58, '#c8a84a', '#8a6a2a', true); x.fillStyle = '#5a4a2a'; for (const tx of [40, 170]) { x.fillRect(tx, 34, 3, 24); x.fillRect(tx - 12, 32, 28, 4); } },
  stormplain(x, P) { P.grad(0, 64, '#0e0618', '#5a2a8a'); x.fillStyle = '#e0c0ff'; x.fillRect(150, 0, 2, 20); x.fillRect(152, 20, 2, 18); x.fillRect(150, 38, 2, 14); P.hills(50, 8, '#2a1a34', 3); P.ground(62, '#3a2a44', '#1a1222', true); },
  masks(x, P) { P.grad(0, 70, '#0e0a1a', '#3a1a3a'); for (let i = 0; i < 8; i++) { const bx = i * 30 + 4; x.fillStyle = '#1a101a'; x.fillRect(bx, 34 - (i % 3) * 6, 24, 40); x.fillStyle = i % 2 ? '#ffb030' : '#ffe070'; x.fillRect(bx + 8, 44 - (i % 3) * 6, 3, 4); } P.ground(72, '#3a2a3a', '#1a101a', true); },
  chapel(x, P) { P.grad(0, 72, '#06040c', '#1e1430'); for (let i = 0; i < 7; i++) P.pillar(10 + i * 36, 6, 74, '#2a2238'); x.fillStyle = '#000'; for (let i = 0; i < 6; i++) { x.fillRect(26 + i * 36, 20, 6, 8); } P.ground(74, '#2a2234', '#100c18', true); },
  barrow(x, P) { P.grad(0, 72, '#0a1220', '#2a3a5a'); for (let i = 0; i < 6; i++) P.pillar(14 + i * 42, 8, 74, '#4a5a6a'); x.fillStyle = 'rgba(200,220,255,0.3)'; x.fillRect(110, 6, 20, 70); P.ground(74, '#4a5a6a', '#1a2230', true); },
};
const _battleBg4 = battleBg;
battleBg = function (name) {
  if (!BG5[name] || IMG['bg_' + name]) return _battleBg4(name);
  if (_bgCache[name]) return _bgCache[name];
  const w = 240, h = 108, c = mkCanvas(w, h), x = c.getContext('2d'), R = srand(name.length * 777 + name.charCodeAt(0));
  const P = {
    R,
    grad(y0, y1, a, b) { for (let y = y0; y < y1; y++) { x.fillStyle = mix(a, b, (y - y0) / Math.max(1, y1 - y0 - 1)); x.fillRect(0, y, w, 1); } },
    hills(base, amp, col, seed) { x.fillStyle = col; for (let i = 0; i < w; i++) { const hh = base + Math.sin(i * 0.05 + seed) * amp + Math.sin(i * 0.13 + seed * 2) * amp * 0.4; x.fillRect(i, hh, 1, h - hh); } },
    ground(y0, a, b, lines) { this.grad(y0, h, a, b); if (lines) for (let i = 0; i < 6; i++) { const y = y0 + Math.round(Math.pow(i / 6, 1.6) * (h - y0)); x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(0, y, w, 1); } },
    tree(tx, ty, s, col, trunk) { x.fillStyle = trunk; x.fillRect(tx - 1, ty, 2, s); x.fillStyle = col; for (let j = 0; j < s; j++) { const ww = Math.round((s - j) * 0.6); x.fillRect(tx - ww / 2, ty - s + j * 0.8, ww, 1); } },
    pillar(px, top, bot, col) { x.fillStyle = col; x.fillRect(px, top, 8, bot - top); x.fillStyle = shade(col, 1.3); x.fillRect(px, top, 2, bot - top); },
  };
  BG5[name](x, P);
  const big = mkCanvas(W, FIELD_H + 8), bx = big.getContext('2d'); bx.imageSmoothingEnabled = false; bx.drawImage(c, 0, 0, w, h, 0, 0, W, FIELD_H + 8);
  return (_bgCache[name] = big);
};

// ------------------------------------------------------------------ opening
async function chapter5Opening() {
  if (flag('ch5start')) return;
  setFlag('ch5start');
  catchUpLevels();
  const f = F(), st = S(); st.onShip = false; st.flying = false;
  f.enterMap('wrendeck', 8, 5, 'up'); Game.fade = 1;
  await cinema([
    { dur: 260, bg: 'seats', music: 'title', layers: [
      { text: 'CHAPTER FIVE', x: W / 2, y: 220, size: 30, color: '#ffe070', glow: 'rgba(255,200,80,0.8)', fadeIn: 30 },
      { text: 'THE OPEN SKY', x: W / 2, y: 280, size: 20, color: '#a8d8ff', fadeIn: 70 },
    ] },
    { dur: 220, bg: 'storm', music: 'sonia', sub: 'A week after the drowned sanctuary', caption: 'In the south, a storm the colour of a bruise rises over the Unclaimed Wilds. It does not move. It does not end.' },
    { dur: 200, bg: 'river', music: 'sea', caption: 'Ships that sail toward it do not come back. The sea roads close one by one.' },
  ], { skipAll: false });
  Game.fade = 0;
  await scene(async cast => {
    const { raine, miasma } = cast, odeaon = castHero(cast, 'odeaon'), luna = castHero(cast, 'luna'), brakka = castHero(cast, 'brakka');
    const verai = flag('veraiGone4') ? null : castHero(cast, 'verai');
    await say('Wren Crew', "Captain. A bird from Thalemyr. Wet, angry, and wearing a tiny spectacles.");
    await say(null, "The letter is written in perfect, panicked handwriting.");
    await say('The Letter', "\"From the Archive of Astrilion, Great Library of Myndra. The storm in the south is made of stolen faith. Our pages are going blank. Come quickly. The sea is closed. Come BY AIR. -The Archivists\"");
    if (raine) await raine.question();
    await say(R(), "By air.");
    if (brakka) { await say(BR(), "I've built three flying machines. Two exploded. The third is in a tree. A very tall tree. It's still in it."); await brakka.sweat(); }
    if (odeaon) await say(ODE(), "The storm's ring covers every sea road south and west. Nothing that floats is getting through.");
    if (luna) await say('Luna', "So we need something with wings. Something big. Something that could carry, oh, six people and a lot of meat...");
    await say(null, "One by one, slowly, everybody on the deck turns to look at Miasma.");
    if (miasma) {
      for (const a of [raine, odeaon, luna, brakka, verai]) if (a) a.face(miasma);
      await wait(30);
      await say(MI(), "...What?");
      await wait(40);
      await say(MI(), "What are you all looking at? Is there something on my face? Is it the fish? I said I'd share the fish.");
      if (verai) await say(VE(), "Miasma. You have wings.");
      else await say(R(), "Miasma. You have wings.");
      await miasma.surprise();
      await say(MI(), "...OH.");
      await say(MI(), "OH! I'm a DRAGON!");
      await say(R(), "You FORGOT you could fly?!");
      await say(MI(), "I spent twenty years pretending to be a girl with decorative wings! You stop thinking about it! It's like, do you think about your elbows? NO.");
      if (odeaon) { await say(ODE(), "You flew me to the top of the Wyrmspire once."); await say(MI(), "That was a DATE, Odeaon. Not a FERRY SERVICE."); await odeaon.laugh(2); }
      if (luna) { await say('Luna', "Can you carry all of us? I'm heavier than I look. I'm a LOT heavier now, honestly. It's the fur."); }
      if (verai) { await say(VE(), "Could you fly high enough to see all of it? The whole world? I've never seen the whole world."); await verai.heart(); await say(MI(), "Sweetheart, I can show you the edges."); }
      else { await say(R(), "Could we fly fast enough to catch her?"); await say(MI(), "Kid... we can fly fast enough to catch anybody."); }
      if (allyRoute()) await say(MI(), "A phoenix used to do the flying around here. He's not well. So. Somebody has to.");
      else await say(MI(), "And the phoenix can keep his ravens. We've got our own wings now.");
    }
  });
  await cinema([
    { dur: 200, bg: 'sky', music: 'phoenix', flash: 18, shake: 14, sfx: 'roar', caption: 'Miasma climbs onto the rail, takes a breath, and stops pretending.', layers: [{ img: 'miasma', x: W / 2, y: 540, s: 1.2, to: { s: 2.2 }, fadeIn: 10 }] },
    { dur: 220, bg: 'sky', shake: 8, sfx: 'wind', caption: 'Red wings, wide as the Wren\'s own sails. Bone horns. Gold eyes. A dragon of the Old Sky.', layers: [{ img: 'miasma', x: W / 2, y: 560, s: 2.2, silhouette: '#a01e10', to: { s: 3.2 } }] },
    { dur: 200, bg: 'sky', music: 'sky', caption: 'The Wren nearly capsizes. The crew cheers anyway. Six people climb onto one very smug dragon.', layers: [{ img: 'miasma', x: 300, y: 560, s: 2.6, silhouette: '#a01e10', to: { x: 1100, y: 200 }, linear: true }] },
  ], { skipAll: false });
  giveKey('skywings'); setFlag('skyWings');
  await notify("Miasma can fly! On any world map, press Z to take off. Press Z again to land, or to fly into a town.", 'levelup');
  await skyChart({ reveal: true });
  await scene(async () => {
    await say(MI(), "Well? Where first? I can go anywhere. ANYWHERE. Except into that storm. That storm can stay where it is.");
    await say(R(), "The Library in Thalemyr, first. They know what the storm is.");
    if (allyRoute()) await say(R(), "And Ashkar. He's guttering. If he dies, nobody's holding the Tenth Seat at all.");
    else await say(R(), "And Sonia's people are working the Anvil somewhere in Ashkar. The volcano islet off the north-west coast. We get it back.");
    if (flag('veraiGone4')) await say(R(), "...And if Verai's out there, we find her.");
  });
  await tip("Fly off the edge of any world map (or press Z over open sea) to open the Sky Chart and cross to another land. Blue ? marks on the chart are places only a dragon can reach: some of them were on your maps all along.");
  await tip("To reach Godsfall, you need three things: Myndra's Star Chart (Astrilion, Thalemyr), Nyxia's Lantern (Ebonport, Thalemyr), and " + (allyRoute() ? "a flame that won't go out (Ashkar's cradle, the volcanic islet north-west of Ashkar)." : "the fire of Sonia's half-made crown (her forge, the volcanic islet north-west of Ashkar)."));
  st.ship = { x: 55, y: 19 }; st.flying = true;
  f.enterMap('world', 52, 19, 'left');
  Audio2.music('sky');
}

// ------------------------------------------------------------------ Thalemyr: Astrilion, the Great Library
async function libraryMoment() {
  if (flag('ch5lib')) return;
  setFlag('ch5lib');
  await scene(async cast => {
    const { raine } = cast, verai = flag('veraiGone4') ? null : castHero(cast, 'verai'), brakka = castHero(cast, 'brakka');
    await say(null, "Shelves go up into the dark further than any ladder. Some of the books are open. Some of the open books are blank, all the way through.");
    if (verai) { await say(VE(), "It's so quiet. Not library-quiet. Empty-quiet. Like the words got up and left."); await verai.sad(); }
    if (brakka) await say(BR(), "Who builds a library where the books eat the words? That's just a big expensive box of paper.");
    await say(R(), "Something's reading the faith out of them. Let's find it before it finishes the shelf.");
  });
  await tip("The way up is through the Orrery. Myndra's star has seven points. Read the plaque by the central altar.");
}
async function orreryHint() {
  if (flag('ch5orrery')) return say(null, "Seven stars, joined by one unbroken line. The Orrery hums, satisfied.");
  await say(null, "A brass plaque: \"Myndra drew her star without once lifting the pen. Begin at the Eye, the highest point. Then always skip two, and always go clockwise.\"");
  await say(null, "Seven star plates are set into the floor in a ring.");
}
async function orreryStep(i) {
  if (flag('ch5orrery')) return;
  const lit = num('orreryLit');
  if (ORRERY_ORDER[lit] === i) {
    addFlag('orreryLit'); Audio2.sfx('heal');
    if (lit + 1 === ORRERY.length) {
      setFlag('ch5orrery'); Game.flash = 16; Audio2.sfx('holy');
      await say(null, "The seventh star lights. Light runs between all seven plates, one unbroken line, and the star-gate to the north dissolves into dust.");
    }
    return;
  }
  if (lit === 0 && i !== ORRERY_ORDER[0]) return;   // just walking across: nothing happens until you begin at the Eye
  S().flags.orreryLit = i === ORRERY_ORDER[0] ? 1 : 0;
  Audio2.sfx('error');
  await say(null, i === ORRERY_ORDER[0] ? "The stars go dark... and the Eye lights again. Start over." : "Wrong star. The lights go out with a sound like a disappointed sigh.");
}
async function unwrittenEvent() {
  if (flag('ch5unwritten')) return;
  const f = F();
  if (f._unwrittenBusy) return; f._unwrittenBusy = true;
  try {
    await scene(async cast => {
      const { raine } = cast;
      await say(null, "Something tall and white stoops over the reading tables, peeling the ink off a page with a long, careful finger. Then it eats the ink.");
      await say('The Unwritten', "Mm. Myndra, Myndra, Myndra. Every story about her tastes like dust and cleverness. The woman in white pays me by the shelf.");
      raine.face('up');
      await say(R(), "Put the book down.");
      await say('The Unwritten', "You're in a book too, little crescent. A short one. Let me have it.");
    });
    if (!(await bossFight('unwritten', 'library'))) return;
    setFlag('ch5unwritten');
    await myndraScene();
  } finally { f._unwrittenBusy = false; }
}
async function myndraScene() {
  const f = F();
  Game.flash = 20; Audio2.sfx('holy'); Audio2.music('vale');
  await scene(async cast => {
    const { raine, miasma } = cast, verai = flag('veraiGone4') ? null : castHero(cast, 'verai'), luna = castHero(cast, 'luna');
    await say(null, "Words pour back into the books like birds coming home. Above the altar, an enormous eye opens inside a seven-pointed star. It is very tired. It is also, somehow, smiling.");
    await say(MYN, "Oh, good. You're real. I read about you. Raine Cudlar, who never asked why, until she did.");
    await say(MYN, "Listen quickly; I am half-erased. Sonia is not trying to take a seat. She is going to Godsfall, where the first gods fell, where faith belongs to nobody.");
    await say(MYN, "With our reliquaries she will pull the faithful of the Ten into herself. Not the Tenth god. The ONLY god.");
    await say(R(), "And the storm?");
    await say(MYN, "The storm is made of a stolen night. Nyxia's. The goddess Ashkar's spark erased. Sonia keeps it spinning around the crater like a wall.");
    await say(MYN, "Only Nyxia's night can open Nyxia's night. Her last faithful hide in Ebonport, the City of Masks, across the strait.");
    if (verai) {
      Game.shake = 8;
      await say(MYN, "...Ah. And here is a little of it now, standing in my library, with smoke in her hair.");
      await verai.surprise();
      await say(VE(), "Me?");
      await say(MYN, "Your smoke, child. It is a piece of Nyxia. The last piece. Your mother put it in you, to keep it safe from the bird. Or to keep it safe for herself. I cannot read her that well.");
      await verai.tremble(30);
      if (miasma) await say(MI(), "Hey. Whatever's in her, she's ours. Just so everybody in this library is clear.");
    } else {
      await say(MYN, "Sonia's daughter carries the last piece of that night. Her smoke. Wherever she is now, the storm is listening to her.");
      await raine.sad();
    }
    if (luna) await say('Luna', "Then we need three things. A way to see the knot, a night to open it, and... something that burns long enough to walk through.");
    await say(MYN, "Clever wolf. The first, I can give you.");
    giveKey('starchart'); await notify("Received Myndra's Star Chart!", 'levelup');
    await say(MYN, "Go. I will hold my eye open as long as I can. I have read the end of a great many stories. I would like to read yours.");
  });
  setFlag('ch5star');
  if (S().chests && !S().chests.c5_as3a) await tip("Myndra's altar room has treasure on both sides. Don't leave the Eye of Myndra behind.");
}
async function myndraAltar() {
  if (!flag('ch5star')) return say(null, "An altar, an eye carved into a star. The eye is shut.");
  await say(MYN, "Still here. Still reading. Go and give me a good ending.");
}

// ------------------------------------------------------------------ Thalemyr: Ebonport, the City of Masks
async function maskSeller() {
  if (hasKey('masks')) return say('Mask-Seller Quill', "You wear them so well! Well. Most of you. The dragon keeps eating hers.");
  await say('Mask-Seller Quill', "No face, no passage, darlings. The Under-streets are only for the masked. Masks are six thousand gold. Or...");
  await say('Mask-Seller Quill', "Or you tell me a lie good enough to make me cry. Malakar's faithful pay in lies, too.");
  const opts = ['Pay 6000 gold'], who = ['gold'];
  if (heroHere('miasma')) { opts.push('Let Miasma lie'); who.push('miasma'); }
  if (heroHere('luna')) { opts.push('Let Luna lie'); who.push('luna'); }
  opts.push('Not now');
  const c = await ask(null, "How do you pay?", opts), pick2 = who[c];
  if (!pick2) return;
  if (pick2 === 'gold') { if (S().gold < 6000) return say('Mask-Seller Quill', "Ah. Poor AND honest. Come back when you're one of those things less."); S().gold -= 6000; }
  else if (pick2 === 'miasma') { await say(MI(), "...I've never once been in love."); await say(null, "Quill takes off her own mask and dabs her eyes."); await say('Mask-Seller Quill', "Oh, that one HURT you to say. Beautiful. Take them, take them."); }
  else { await say('Luna', "I am a completely ordinary human knight with normal ears."); await say(null, "Luna's ears are standing straight up. Her tail is wagging."); await say('Mask-Seller Quill', "That is the WORST lie I have ever heard. It's adorable. I'm crying anyway. Take them."); }
  giveKey('masks'); await notify("Received Malakar's Masks!", 'chest');
}
async function gateWarden() { await say('Gate Warden', "Bare faces stay up top. The Under-streets are for the masked. Quill sells masks by the west gate."); }
async function unlitKeeper() {
  if (flag('ch5veil')) return say('Unlit Lantern-Keeper', "Our lanterns are dark again, the way she liked them. Thank you.");
  await say('Unlit Lantern-Keeper', "We are the Unlit. We still pray to Nyxia, the Veiled Night. Quietly. In Ebonport, everyone pretends not to see us. That is how we live.");
  if (flag('veraiGone4') && !flag('veraiBack')) await say('Unlit Lantern-Keeper', "A girl came, with Nyxia's smoke in her hair, and the Masked Regent bowed to her. They went down to our chapel. They are taking our night away, one lantern at a time.");
  else if (heroHere('verai')) await say('Unlit Lantern-Keeper', "...You. Child with the smoke. Oh. Oh, she's IN you. Please, come down to the chapel. The Regent is selling our lanterns to the woman in white.");
}
async function wardenSpotted(n) {
  await say('Mask Warden', pick(["You! Your mask is on upside down!", "Halt! That is a DRAGON wearing a mask!", "Intruders! In the name of Malakar! Who would also have done this!"]));
  const r = await startBattle({ enemies: ['maskwarden', 'maskdancer'], bg: 'masks' });
  if (r === 'win') { n.out = true; await notify('The wardens are down.', null); }
  else if (r === 'run') { await F().warp(F().map.id, F().map.start[0], F().map.start[1], F().map.start[2]); }
}
async function ebonChapelEvent() {
  if (flag('ch5veil')) return;
  const f = F();
  if (f._chapelBusy) return; f._chapelBusy = true;
  try {
    if (flag('veraiGone4') && !flag('veraiBack')) await chapelVeraiGone();
    else await chapelVeraiHere();
  } finally { f._chapelBusy = false; }
}
async function chapelVeraiHere() {
  await scene(async cast => {
    const { raine } = cast, verai = castHero(cast, 'verai');
    await say(null, "At the altar, a man in a gilded half-mask is stacking black lanterns into crates. Each one hums. Each one is a little piece of a night.");
    await say('The Masked Regent', "The Unlit's prayers, boxed and ready for the lady in white. Malakar teaches that every faith can be sold. I've simply found a buyer.");
    if (verai) { await say(VE(), "Those aren't yours to sell."); await say('The Masked Regent', "Ah. The vessel herself. The lady said you'd be along. She said to bring you too, if you came quietly. You won't, will you."); }
  });
  if (!(await bossFight('maskedregent', 'chapel'))) return;
  setFlag('ch5regent');
  await scene(async cast => {
    const { raine, miasma } = cast, verai = castHero(cast, 'verai');
    await say(null, "The crates break. Black lanterns roll across the floor and, one by one, they open, and darkness pours out of them like warm water. The Unlit creep out of the pews.");
    await say(null, "The darkness gathers around Verai. It is not cold. It feels, oddly, like being tucked in.");
    await say('A Voice in the Dark', "...little one. You kept me. All this time, you kept me. I could be again, through you. A goddess of the night, with a seat to take back.");
    if (verai) { await verai.tremble(40); verai.face(raine); }
    const c = await ask(R(), "(Verai is looking at you. So is the dark.)", ['"You\'re Verai. Whatever\'s in you is yours."', '"If being Nyxia stops Sonia... maybe you should."', '"What do YOU want, Verai?"']);
    addFlag('veraiWill', [1, -2, 2][c]); S().flags.chapelChoice = c;
    if (c === 1 && num('veraiWill') < 4) {
      await say(VE(), "...Maybe you're right. Maybe that's what I'm for. Everybody's always known what I'm for except me.");
      await say(null, "Verai opens her arms. The whole night of the chapel pours into her, and her eyes go dark all the way through, like a starless sky.");
      S().flags.veraiNyxia = 'vessel';
      if (miasma) await say(MI(), "...Kid. That was the wrong thing to say.");
      await raine.sad();
    } else {
      await say(VE(), c === 2 ? "...Nobody's ever asked me that before. Not like they wanted the answer." : "...Mine. Okay. Mine.");
      await say(VE(), "I'll carry her. I'll keep her warm. But I won't BE her. I'm Verai. I chose that name.");
      await say('A Voice in the Dark', "...Then carry me kindly, little one. That is all I ever asked of anyone.");
      S().flags.veraiNyxia = 'carry';
      if (verai) await verai.heart();
    }
    await say('Unlit Lantern-Keeper', "One lantern stays with you. Nyxia's Lantern. It sheds darkness instead of light. Her storm will know it.");
    giveKey('nightlantern'); await notify("Received Nyxia's Lantern!", 'levelup');
  });
  if (giveBonus('verai', 'nyxheart')) await notify("Verai learned Nyx's Heart!", 'levelup');
  await unlockNightveil();
  setFlag('ch5veil');
}
async function chapelVeraiGone() {
  const f = F();
  setFlag('ch5vvActor');   // the Verai at the altar becomes an actor for the rest of the chapel
  const vv = f.spawn({ id: 'vv', look: 'verai', name: 'Verai', x: 11, y: 6, dir: 'down' });
  let back = false;
  await scene(async cast => {
    const { raine, miasma } = cast, luna = castHero(cast, 'luna');
    await say(null, "At the altar, Verai stands with her hands in a black lantern, pulling darkness out of it like thread. Behind her, a man in a gilded half-mask stacks the empty lanterns into crates.");
    await raine.surprise();
    await say(R(), "Verai!");
    vv.face(raine);
    await say(VE(), "...Raine. Of course it's you. Of course you'd come all the way here.");
    await say(VE(), "Mother needs the night. All of it, every scrap Nyxia's faithful still have. The storm eats it. That's what I'm for, apparently. Collecting.");
    await say('The Masked Regent', "Shall I remove them, my lady?");
    await say(VE(), "Not yet.");
    // her goodwill, the reach in Chapter Four, and what Raine says now
    let score = num('veraiWill');
    if (flag('veraiReach')) score += S().flags.veraiReachChoice === 1 ? 2 : 1;
    if (luna) score += 0;
    const c = await ask(R(), "(What do you say to her?)", ['"Come home, Verai."', '"You don\'t have to come back. Just don\'t let her use you."', '"I\'m not leaving without you. Even if you won\'t come."']);
    score += [0, 2, 1][c]; S().flags.chapelChoice = c; S().flags.veraiScore5 = score;
    if (c === 0) await say(VE(), "Home. You keep saying that word like it's a place you can just walk back into.");
    else if (c === 1) { await say(VE(), "..."); await say(VE(), "That's the first time anybody's told me I don't HAVE to do something."); }
    else await say(VE(), "You're so stubborn. You were always so stubborn.");
    if (score >= 4) {
      back = true;
      await say(null, "Verai looks down at the lantern in her hands. The darkness in it is curled up like a sleeping animal. It looks scared.");
      await say(VE(), "...They're scared of her. Of Mother. Of ME.");
      await say(VE(), "Regent. Put the lanterns down.");
      await say('The Masked Regent', "My lady, your mother was very clear—");
      await say(VE(), "My mother lied to them too. PUT THEM DOWN.");
      if (miasma) await say(MI(), "Ohhh, she's got the voice. She's got the MOM voice.");
    } else {
      await say(VE(), "Regent. Keep them busy.");
      await say(null, "Verai lifts the lantern, and steps back into the dark.");
    }
  });
  if (back) {
    f.despawn(vv);
    const m = returnFromAway('verai');
    setFlag('veraiBack'); S().flags.veraiBackWhen = 'ebonport';
    if (m) await notify('Verai has returned to the party!', 'levelup');
    if (!(await bossFight('maskedregent', 'chapel'))) return;
    setFlag('ch5regent');
    await scene(async cast => {
      const { raine } = cast, verai = castHero(cast, 'verai');
      await say(null, "The crates split. Black lanterns roll across the floor and open, and the darkness pours out of them, warm as bathwater, and gathers around Verai.");
      await say('A Voice in the Dark', "...little one. You came back for us.");
      await say(VE(), "I came back for me. You can come too. I'll carry you. I won't BE you.");
      await say('A Voice in the Dark', "That is all I ever asked of anyone.");
      if (verai) { verai.face(raine); await say(VE(), "Raine... I'm sorry. About the reflection. About all of it."); }
      await say(R(), "You came back. That's all I wanted to hear.");
      if (verai) await verai.heart();
      S().flags.veraiNyxia = 'carry';
      await say('Unlit Lantern-Keeper', "Take Nyxia's Lantern. It sheds darkness instead of light. Her storm will know it.");
      giveKey('nightlantern'); await notify("Received Nyxia's Lantern!", 'levelup');
    });
    if (giveBonus('verai', 'nyxheart')) await notify("Verai learned Nyx's Heart!", 'levelup');
  } else {
    if (!(await bossFight('maskedregent', 'chapel'))) return;
    setFlag('ch5regent');
    await scene(async cast => {
      const { raine } = cast;
      vv.face(raine);
      await say(VE(), "...You beat him. Fine. Then I'll do it myself.");
    });
    healParty();
    await startBattle({ enemies: ['veiledherald'], boss: true, bg: 'chapel', music: 'sonia', noRun: true, cantLose: true, turnLimit: 7 });
    await scene(async cast => {
      const { raine, miasma } = cast;
      await say(null, "Verai's smoke stops an inch from Raine's face. It shakes. It doesn't go any further.");
      await say(VE(), "...I can't. I CAN'T. Why can't I.");
      await say(R(), "Because you're still you.");
      await say(VE(), "Don't. Don't say things like that to me.");
      await say(null, "She takes most of the lanterns into the dark with her. Not all of them.");
      f.despawn(vv);
      setFlag('veraiLost5');
      if (miasma) await say(MI(), "She held back, kid. She HELD BACK. That's not nothing.");
      await say('Unlit Lantern-Keeper', "She left one. On purpose, I think. Nyxia's Lantern. It sheds darkness instead of light. Her storm will know it.");
      giveKey('nightlantern'); await notify("Received Nyxia's Lantern!", 'levelup');
    });
  }
  await unlockNightveil();
  setFlag('ch5veil');
}
async function unlockNightveil() {
  await say('Unlit Lantern-Keeper', "One more thing. We were Nyxia's healers, once. Night is when wounds close. Take what we know.");
  openJob('nightveil'); await notify('New job: Nightveil (Nyxia, the Veiled Night)!', 'levelup');
  await tip("Nightveil is a healer whose medicine is shadow: Shadow Mend, Dusk Veil (regen), Night Cradle, a cure for every ailment, and a full revive. Anyone can take it up, so a party without Verai still has a healer.");
}
async function nyxiaAltar() {
  if (!flag('ch5veil')) return say(null, "An altar to Nyxia. Her symbol is a veil drawn over the moon. Someone has scratched it out, and someone else has carefully drawn it back in.");
  await say(null, "The altar is warm, the way a bed is warm after somebody has just got out of it.");
}

// ------------------------------------------------------------------ Ashkar: the Ashen Crown (route dungeon)
async function crownGate() {
  if (!flag('ch5start')) { await say(null, "A smoking volcanic islet, ringed by reefs. Even the gulls go around."); return false; }
  return true;
}
async function lightBrazier(i) {
  if (flag('cradleB' + i)) return say(null, "The brazier burns steady.");
  if (!hasKey('phoenixember')) return say(null, "A cold brazier in the shape of an open beak. It wants a phoenix's fire.");
  setFlag('cradleB' + i); Audio2.sfx('fire'); Game.flash = 6;
  const n = [0, 1, 2, 3].filter(k => flag('cradleB' + k)).length;
  await say(null, n < 4 ? `Raine holds the Phoenix Ember to the brazier. It catches with a sound like a sigh. (${n} of 4)` : "The fourth brazier catches. The lava across the north stair hisses, crusts over, and goes black and solid.");
  if (n === 4) setFlag('ch5braziers');
}
async function turnValve(i) {
  if (flag('forgeV' + i)) return say(null, "The quench-valve is open. Cold water roars through it.");
  setFlag('forgeV' + i); Audio2.sfx('wind'); Game.shake = 6;
  const n = [0, 1, 2].filter(k => flag('forgeV' + k)).length;
  if (heroHere('brakka') && n === 1) await say(BR(), "Quench-valves! Oh, these are Kharak Yr made. I KNOW these. Turn all three and the slag channel freezes solid.");
  await say(null, n < 3 ? `The valve groans open. Somewhere, water hits hot iron. (${n} of 3)` : "The third valve opens. A wall of steam, a scream of cooling metal, and the slag channel to the north turns to black glass.");
  if (n === 3) setFlag('ch5valves');
}
async function cradleEvent() {
  if (flag('ch5gutter')) return;
  const f = F();
  if (f._cradleBusy) return; f._cradleBusy = true;
  try {
    await scene(async cast => {
      const { raine } = cast;
      await say(null, "The nest at the top of the volcano is a bowl of grey ash. Something enormous and smoky is crouched over it, breathing in the last warm air.");
      await say('The Gutter Queen', "Ahh. More warmth. The bird is nearly out. We were going to have him for supper. You'll do for dessert.");
      await say(R(), "Get away from him.");
    });
    if (!(await bossFight('gutterqueen', 'caldera', { music: 'final' }))) return;
    setFlag('ch5gutter');
    await cradleNest();
  } finally { f._cradleBusy = false; }
}
async function cradleNest() {
  if (!flag('ch5gutter')) return say(null, "Under the ash, something is still, barely, warm.");
  if (flag('ch5flame')) return say(ASH, flag('ashkarRisen') ? "Go on, little crescent. I'll be right behind you. Probably on fire." : "Still burning. Small. But still burning.");
  await scene(async cast => {
    const { raine, miasma } = cast;
    await say(null, "Raine digs into the ash with both hands. Under it, curled up small as a sparrow, grey at every edge, is Ashkar.");
    await say(ASH, "...Little crescent. You came all this way to watch a candle go out? Romantic.");
    await say(R(), "Shut up. Here.");
    await say(null, "Raine presses the Phoenix Ember against his chest. He flares, a little. Not enough.");
    await say(ASH, "It's my own coal, and it isn't enough. I spent too much in that drowned garden.");
    Game.shake = 4;
    await say(null, "Around Raine's neck, the crescent pendant is glowing. It's warm. It always was, a little. A coal from a god's own hearth.");
    if (miasma) await say(MI(), "...That pendant was his before it was mine, kid. And mine before it was yours.");
    const c = await ask(R(), "(The pendant is warm against your chest.)", ['Give the pendant back to him.', 'Keep it. He\'ll have to burn small.']);
    if (c === 0) {
      await say(null, "Raine lifts the pendant over her head for the first time since she was a baby, and sets it in the ash.");
      Game.flash = 30; Audio2.sfx('fire'); Audio2.music('phoenix');
      await say(null, "Fire. All at once. A column of it, gold and crimson, and in the middle of it, wings.");
      await say(ASH, "OH, that's better. That's MUCH better. I'd forgotten what I felt like!");
      await say(ASH, "You gave a god his heart back, little crescent. Nobody's ever given me anything back.");
      setFlag('ashkarRisen'); setFlag('pendantGiven');
      await say(ASH, "Here. A crescent for a crescent.");
      addItem('phoenixcrescent'); await notify('Received the Phoenix Crescent!', 'levelup');
      if (giveBonus('raine', 'emberheart')) await notify('Raine learned Ember Heart!', 'levelup');
    } else {
      await say(R(), "I'm keeping it. Sorry. It's the only thing I have that she gave me.");
      if (miasma) await miasma.heart();
      await say(ASH, "...Ha. Fair. Fair! A god can't argue with sentiment. I'll burn small. Small and stubborn. Like you.");
      setFlag('ashkarDim');
      addItem('phoenixcrescent'); await notify('Received the Phoenix Crescent!', 'levelup');
      if (giveBonus('raine', 'crescentflare')) await notify('Raine learned Crescent Flare!', 'levelup');
    }
    await say(ASH, "And this, for the storm. A flame that won't go out. I've decided not to.");
    giveKey('livingflame'); await notify('Received the Living Flame!', 'levelup');
  });
  setFlag('ch5flame');
}
async function forgeEvent() {
  if (flag('ch5crowned')) return;
  const f = F();
  if (f._forgeBusy) return; f._forgeBusy = true;
  try {
    await scene(async cast => {
      const { raine } = cast, brakka = castHero(cast, 'brakka');
      await say(null, "Grimnar's Anvil sits at the centre of the forge floor. Hammered around it, half-finished, is a crown of black iron. Something huge is wearing the crown. It is not enjoying it.");
      await say('The Anvil-Crowned', "Sonia promised me a crown. I only have to wear it... until she's ready... it BURNS...");
      if (brakka) await say(BR(), "Oh, that's disgusting. You're putting a god's anvil in a HAT?");
    });
    if (!(await bossFight('anvilcrowned', 'forge', { music: 'final' }))) return;
    setFlag('ch5crowned');
    await forgeAnvil();
  } finally { f._forgeBusy = false; }
}
async function forgeAnvil() {
  if (!flag('ch5crowned')) return say(null, "The Anvil sits inside the half-made crown, glowing like a sunset.");
  if (flag('ch5flame')) return say(null, flag('ashkarMended') ? "Where the Anvil sat, a single phoenix feather is burning, very politely." : "The floor still remembers the shape of the Anvil.");
  await scene(async cast => {
    const { raine } = cast, brakka = castHero(cast, 'brakka');
    await say(null, "The crown cracks apart. Raine lifts Grimnar's Anvil free. It is heavy, and hot, and furious, and hers again.");
    giveKey('anvilshard2'); await notify("Retook Grimnar's Anvil!", 'levelup');
    Game.flash = 20; Audio2.sfx('fire');
    await say(null, "The forge roof bursts inward. Wings of fire. A man made of flame lands on the anvil-stand, and every coal in the room bows to him.");
    await say(ASH, "Little crescent. You took my Anvil away from me once. Then you lost it to HER. And now here you are with it again.");
    await say(ASH, "Well? Do I get it back this time, or do we fight about it?");
    const c = await ask(R(), "(Ashkar is holding out his hand.)", ['Give the Anvil to Ashkar.', 'Keep it. Brakka can work with this.']);
    if (c === 0) {
      takeKey('anvilshard2');
      await say(ASH, "...Huh. You actually did it.");
      await say(ASH, "You know, I've been angry at you for so long I forgot WHY. It was this, wasn't it. It was always this.");
      setFlag('ashkarMended');
      await say(ASH, "Here. An apology. Don't tell anyone a god apologized. It's bad for business.");
      addItem('kindledge'); await notify('Received the Kindled Edge!', 'levelup');
      if (giveBonus('raine', 'crescentflare')) await notify('Raine learned Crescent Flare!', 'levelup');
      await say(ASH, "When you walk into that storm, call me. I'll be there. Loudly.");
    } else {
      await say(R(), "I'm keeping it. Sonia stole it twice. Nobody's taking it again.");
      await say(ASH, "Nobody. Including me. I SEE.");
      await say(ASH, "Fine. Keep it. And don't call me when the sky falls on you, little crescent.");
      setFlag('anvilKept');
      await say(null, "He's gone in a gout of flame. The forge is very quiet.");
      if (brakka) { await say(BR(), "...So. I CAN work with this. Give me a night."); await say(null, "Brakka works all night. In the morning there is an axe on the anvil-stand, black as a grave and sharp as grief."); }
      else await say(null, "Raine runs her thumb along a sliver of the Anvil that has split off. It is sharper than any blade she's ever held. Brakka will know what to do with it.");
      addItem('grimnaredge'); await notify("Received Grimnar's Edge!", 'levelup');
      if (giveBonus('raine', 'anvilstrike')) await notify('Raine learned Anvil Strike!', 'levelup');
    }
    await say(null, "In the ruins of the crown, one ember is still glowing. It burns violet at the edges, where the storm has touched it.");
    giveKey('crownember'); await notify("Received the Crown's Ember!", 'levelup');
  });
  setFlag('ch5flame');
}

// ------------------------------------------------------------------ optional: Heartbloom Hollow (Elaris)
async function bloomMoment() {
  if (flag('ch5bloomIn')) return;
  setFlag('ch5bloomIn');
  await scene(async cast => {
    const { raine } = cast, luna = castHero(cast, 'luna');
    await say(null, "A hidden valley, ringed by mountains, that nobody has walked in for a hundred years. It should be beautiful. Something purple and wet is growing over everything.");
    if (hasKey('elarisseed')) await say(null, "In Raine's pack, Elaris's Last Seed is beating faster.");
    if (luna) await say('Luna', "It smells like the drowned garden. Like grief. And like... Sonia's perfume.");
  });
}
async function graftEvent() {
  if (flag('ch5graft')) return;
  const f = F();
  if (f._graftBusy) return; f._graftBusy = true;
  try {
    await say(null, "A swollen root-thing is sucking the valley dry, its tendrils sunk into the very spot the seed is beating toward.");
    if (!(await bossFight('blightgraft', 'vale'))) return;
    setFlag('ch5graft');
    await say(null, "The graft shrivels. Where its roots tear free, tiny white flowers open across the whole valley floor.");
  } finally { f._graftBusy = false; }
}
async function seedbed() {
  if (flag('ch5seed')) return say(null, "A sapling, no taller than Raine's knee, with one pink flower. When you lean close, it hums.");
  if (!flag('ch5graft')) return say(null, "A bed of dark, soft earth. Something is clinging to it.");
  if (!hasKey('elarisseed')) return say(null, "A bed of dark, soft earth, waiting for something.");
  await scene(async cast => {
    const { raine } = cast, verai = flag('veraiGone4') && !flag('veraiBack') ? null : castHero(cast, 'verai'), luna = castHero(cast, 'luna');
    await say(null, "Raine kneels and presses Elaris's Last Seed into the earth. It is warm. It has a heartbeat. The whole valley seems to lean in to listen.");
    const c = await ask(R(), "(What do you whisper to the seed?)", ['"Grow into a home for anyone who has to hide."', '"Grow into a garden for everyone."', '"Come back, Elaris."']);
    S().flags.seedVow = ['refuge', 'garden', 'elaris'][c];
    takeKey('elarisseed'); Game.flash = 14; Audio2.sfx('heal'); setFlag('ch5seed');
    await say(null, "A green shoot breaks the soil. Then a stem. Then, very carefully, one pink flower.");
    if (c === 0) { await say('Elaris', "...A home for the hidden. Yes. I know some wolves who would like that."); if (luna) await luna.heart(); }
    else if (c === 1) await say('Elaris', "...For everyone. Even the ones who don't deserve it. That was always the hard part. I'll try.");
    else { await say('Elaris', "...I can't come back, little one. Not as I was. But something will grow here that remembers me. Maybe that's enough."); if (verai) await verai.sad(); }
    await say('Elaris', "Take my thorns and my petals. Love is a job, too. It always was.");
  });
  openJob('bloomwarden'); await notify('New job: Bloomwarden (Elaris, the Serene Bloom)!', 'levelup');
}

// ------------------------------------------------------------------ optional: the Stilled Hourglass (Kryos)
async function hourglassMoment() {
  if (flag('ch5hourIn')) return;
  setFlag('ch5hourIn');
  await say(null, "Inside the frozen lake: a tower of ice shaped like an hourglass. The sand inside it is falling upward, very slowly.");
  await tip("Ice: once you start sliding you won't stop until something stops you. The plain floor in the middle of the ice is somewhere to catch your breath.");
}
async function hourglassEvent() {
  if (flag('ch5hour')) return;
  const f = F();
  if (f._hourBusy) return; f._hourBusy = true;
  try {
    await say('The Hourwarden', "The Pale Watcher keeps the last hour of the world in this room. You are early.");
    if (!(await bossFight('hourwarden', 'icecave'))) return;
    setFlag('ch5hour');
    await kryosScene();
  } finally { f._hourBusy = false; }
}
async function kryosScene() {
  await scene(async cast => {
    const { raine, odeaon } = cast, od = odeaon || castHero(cast, 'odeaon');
    Game.flash = 12; Audio2.sfx('holy');
    await say(null, "The air goes perfectly still. Every snowflake in the room stops falling. A voice like ice cracking on a deep lake:");
    await say(KRY, "I am Kryos, the Pale Watcher. Winter, and the grave, and the hours. I have been watching Sonia count. She is very nearly finished counting.");
    if (od) {
      await say(KRY, "High Knight. You were here once, twenty winters ago, on the mountain, the night you took the child. You made an oath in the snow. I kept the blade you swore it on.");
      await say(null, "For one frozen moment the room is a mountainside at night. A red dragon, crying. A knight holding a baby with orange hair. Then it's gone.");
      await od.tremble(30);
      await say(ODE(), "...I remember the cold. I don't remember it being so beautiful.");
      if (giveBonus('odeaon', 'winterward')) await notify('Odeaon learned Winter Ward!', 'levelup');
    }
    const c = await ask(KRY, "Little crescent. Do you want to know how this ends?", ['"Yes. Show me."', '"No. We\'ll find out."']);
    if (c === 0) {
      setFlag('kryosGlimpse');
      await say(KRY, "I see a seat. I see someone you love sitting in it. I do not see who stands up again.");
      await raine.surprise();
    } else await say(KRY, "Good. Neither do I. That has not happened to me in a very long time. I find I like it.");
    await say(KRY, "Take my hours. Spend them well. They are the only coin I have ever had.");
  });
  openJob('timewarden'); await notify('New job: Timewarden (Kryos, the Pale Watcher)!', 'levelup');
}
async function kryosAltar() { await say(null, flag('ch5hour') ? "The hourglass on the altar is upright. The sand is falling the right way again. Slowly." : "An hourglass on its side. The sand inside is frozen mid-fall."); }

// ------------------------------------------------------------------ optional: the Moonfang Barrows (Luna)
async function barrowsMoment() {
  if (flag('ch5barrowsIn')) return;
  setFlag('ch5barrowsIn');
  await scene(async cast => {
    const luna = castHero(cast, 'luna');
    await say(null, "Somewhere deep in the jungle, a howl. Then another. Not hunting howls. Calling.");
    if (luna) { await say('Luna', "...They're saying 'come home'. I've never been here. How can I be coming home?"); await luna.question(); }
  });
}
async function barrowsTrial() {
  if (flag('ch5barrows')) return;
  const f = F();
  if (f._barrowBusy) return; f._barrowBusy = true;
  try {
    await scene(async cast => {
      const luna = castHero(cast, 'luna');
      await say('The First Moonfang', "Cub. You wore a helmet for eight years. You took it off for one village. Show me you can stand without it.");
      if (luna) await say('Luna', "...I can. I'm standing right here.");
      else await say(null, "The great silver wolf looks past you, toward the jungle, as if waiting for someone who isn't here.");
    });
    if (!(await bossFight('firstmoonfang', 'barrow'))) return;
    setFlag('ch5barrows');
    await barrowsAltar();
  } finally { f._barrowBusy = false; }
}
async function barrowsAltar() {
  if (!flag('ch5barrows')) return say(null, "A stone altar carved with a moon, and under it, very small, a knight's helmet.");
  if (flag('ch5barrowsDone')) return say(null, "The altar is warm. Somebody has left a strip of meat on it. Probably Luna.");
  setFlag('ch5barrowsDone');
  await scene(async cast => {
    const { raine } = cast, luna = castHero(cast, 'luna');
    await say('The First Moonfang', "Good. Now listen. Moonfangs came from these wilds. The temples drove us north, into the birch woods, and taught you to be ashamed.");
    await say('The First Moonfang', "You stopped being ashamed. In front of everyone. That is the bravest thing any of us has done in three hundred years.");
    if (luna) {
      if (num('lunaTrust') >= 2) await say('Luna', "I had help. They knew before I told them. They trusted me before I was ready to be trusted.");
      else await say('Luna', "I... didn't do it very gracefully. I bit a man. A bit.");
      if (hasKey('accord')) await say('The First Moonfang', "And you carry a promise in your pack. The Two Moons Accord. Make them keep it.");
      await luna.heart();
      if (giveBonus('luna', 'firstmoon')) await notify('Luna learned First Moon!', 'levelup');
    }
    await say('The First Moonfang', "My fang, and my mantle. They were always yours. They were waiting for you to be ready.");
  });
}

// ------------------------------------------------------------------ optional: Miasma's old hoard
async function hoardEvent() {
  if (flag('ch5hoard')) return;
  const f = F();
  if (f._hoardBusy) return; f._hoardBusy = true;
  try {
    await scene(async cast => {
      const { miasma, raine } = cast;
      await say(null, "A cave full of gold. Mountains of it. And on top, curled up like a cat on a radiator, a gilded lizard the size of a barn.");
      if (miasma) { await say(MI(), "...Is that. Is that a SQUATTER. In my HOARD?"); await miasma.angry(); await say('Goldscale', "Finders keepers! The red one isn't coming back!"); await say(MI(), "The red one CAME BACK."); }
      else await say('Goldscale', "MINE. All of it.");
    });
    if (!(await bossFight('goldscale', 'summit'))) return;
    setFlag('ch5hoard');
    await scene(async cast => {
      const { miasma, raine } = cast;
      if (!miasma) return;
      await say(MI(), "Okay. Okay. Nobody touch anything. Especially the big chest at the back. That one's... personal.");
      if (raine) { await say(R(), "Miasma, what's in the chest?"); await say(MI(), "...Kid stuff. Your stuff. From before. I couldn't throw it out and I couldn't look at it, so it went in the hoard."); await raine.sad(); }
      if (giveBonus('miasma', 'oldskyroar')) await notify('Miasma learned Old Sky Roar!', 'levelup');
    });
  } finally { f._hoardBusy = false; }
}
async function hoardShelf() { await say(null, "A ledge of small things in the gold: a carved wooden dragon, a single tiny boot, a rattle shaped like a fish. All of it dusted. All of it twenty years old."); }

// ------------------------------------------------------------------ optional: Old Gruntle's powder vault (Brakka)
async function vaultEvent() {
  if (flag('ch5vault')) return;
  const f = F();
  if (f._vaultBusy) return; f._vaultBusy = true;
  try {
    if (heroHere('brakka')) await say(BR(), "Old Gruntle's vault. My master. He said if I ever found it, I'd better bring a LOT of friends. Ah. That'd be why.");
    if (!(await bossFight('vaultcolossus', 'forge'))) return;
    setFlag('ch5vault');
    await vaultLetter();
  } finally { f._vaultBusy = false; }
}
async function vaultLetter() {
  if (!flag('ch5vault')) return say(null, "A letter on the shelf, sealed with soot. The Colossus is standing very close to it.");
  await say('Old Gruntle (letter)', "\"Brakka. If you're reading this, you got past my Colossus, so you're as good as I always said. Better. Don't tell anyone I said that.\"");
  await say('Old Gruntle (letter)', "\"The Thunderwife's in the chest. She's yours. She was always going to be yours. Use her to make something LOUD and GOOD. -G.\"");
  if (heroHere('brakka') && !flag('ch5vaultRead')) { setFlag('ch5vaultRead'); await say(BR(), "...Sooty old fool. Dust in my eyes. Big dust. It's a dusty vault."); if (giveBonus('brakka', 'thunderclap')) await notify('Brakka learned Thunderclap!', 'levelup'); }
}

// ------------------------------------------------------------------ small places
async function skynestSign() {
  if (heroHere('miasma')) await say(MI(), "Not mine. My cousin Vesk's. She always did have terrible taste in coins. Take whatever you like, she owes me.");
  else await say(null, "A pile of old coins in a dragon's nest. The owner hasn't been back in years.");
}
async function echoCenter() {
  await say('An Echo', "(The voice is a phoenix's, young and frightened and greedy.) \"Just one spark. One. Nobody will even notice. I could be SOMEBODY.\"");
  await say(null, "Then a sound like a candle being blown out, very far away, and a woman screaming a name.");
  if (allyRoute() && flag('ashkarRisen')) await say(R(), "...He knows. He knows what it cost. That's why he's like he is.");
  else if (flag('ashkarMended')) await say(R(), "He was scared. Before he was a god, he was just scared.");
}
async function hallornRimward() {
  if (flag('ch5hallorn')) return say('Hallorn', "Solanthia is changing. Slowly. Like ice in spring.");
  setFlag('ch5hallorn');
  await say('Hallorn', "...The wolf-knight's friends. Before you ask, I'm not here to cleanse anything. I'm here because I went home and TOLD them. About Moonhollow. About the knight who spared me.");
  await say('Hallorn', "Solanthia's new council read the Two Moons Accord. All ten years of her letters. They signed it.");
  if (heroHere('luna')) await say('Luna', "...They signed it?");
  await say('Hallorn', "Here. Temple salt, blessed. Call it a down payment on an apology.");
  addItem('sylarasun', 3); await notify('Received Sunsalt x3!', 'chest');
}
async function scoutRimward() {
  if (flag('ch5scout')) return say('Moonhollow Scout', "Pip says hello. Pip says hello a LOT.");
  setFlag('ch5scout');
  await say('Moonhollow Scout', "Grandmother Hesk sent me to find you. Hallorn is still with us. He chops wood now. He carved Pip a wolf. It's a terrible wolf. Pip sleeps with it every night.");
  await say('Moonhollow Scout', "And this. Moonhollow spring water. For the Knight.");
  addItem('moonwater', 4); await notify('Received Moonwater x4!', 'chest');
}

// ------------------------------------------------------------------ the Rim of Godsfall
async function rimGate() {
  if (flag('ch5done')) { await say(null, "The Veilstorm has closed over the Rim like a fist. Whatever Sonia is doing in there, she isn't done. (The final chapter.)"); return false; }
  const n = keysHeld();
  if (n < 3) {
    await say(null, "The Veilstorm's edge. Purple lightning walks along it like a guard.");
    await say(null, `You have ${n} of the 3 things you need: ${hasKey('starchart') ? '' : "Myndra's Star Chart (Astrilion). "}${hasKey('nightlantern') ? '' : "Nyxia's Lantern (Ebonport). "}${flameKeyHeld() ? '' : (allyRoute() ? 'The Living Flame (Ashkar\'s cradle).' : 'The Crown\'s Ember (Sonia\'s forge).')}`);
    return false;
  }
  if (!flag('ch5rimOpen')) {
    setFlag('ch5rimOpen');
    await cinema([
      { dur: 200, bg: 'storm', music: 'storm', caption: 'Raine unrolls Myndra\'s Star Chart. On it, the storm is a knot, and one thread is drawn in gold.' },
      { dur: 200, bg: 'storm', sfx: 'dark', caption: 'Nyxia\'s Lantern opens. Darkness pours out of it, and the storm\'s own darkness parts around it, like it recognizes a sister.' },
      { dur: 200, bg: 'storm', sfx: 'fire', flash: 16, caption: (hasKey('livingflame') ? 'The Living Flame' : 'The Crown\'s Ember') + ' burns at the front of the party. The lightning will not touch it.' },
    ], { skipAll: false });
  }
  return true;
}
async function rimMoment() {
  if (flag('ch5rim')) return;
  setFlag('ch5rim');
  await scene(async cast => {
    const { raine, miasma } = cast, odeaon = castHero(cast, 'odeaon'), verai = flag('veraiGone4') && !flag('veraiBack') ? null : castHero(cast, 'verai');
    await say(null, "Inside the storm's edge, the air tastes like copper and old prayers. Somewhere below, the crater is breathing.");
    if (miasma) await say(MI(), "I can't fly in here. The wind's all wrong. It's like flying through somebody's nightmare. We walk from here.");
    if (verai) await say(VE(), flag('veraiNyxia') === 'vessel' ? "...It knows me. The storm. It wants me to come closer. It's so loud." : "I can hear Nyxia in the wind. She's not angry. She's sad.");
    if (odeaon) await say(ODE(), "Stay close. Whatever's at the Eye, we meet it together.");
  });
}
async function eyeEvent() {
  if (flag('ch5herald')) return;
  const f = F();
  if (f._eyeBusy) return; f._eyeBusy = true;
  try {
    await scene(async cast => {
      const { raine } = cast;
      await say(null, "The Eye of the storm. A ring of stone over the crater. Beyond it, deep down, a throne made of light is rising out of the dark.");
      await say('The Storm Herald', "She is almost a god of everything. You are almost too late. Almost.");
      await say(R(), "Almost is enough.");
    });
    if (!(await bossFight('stormherald', 'stormplain', { music: 'final' }))) return;
    setFlag('ch5herald');
    await soniaAtTheRim();
  } finally { f._eyeBusy = false; }
}
async function soniaAtTheRim() {
  const f = F();
  const so = f.spawn({ id: 'sonia', look: 'vesper', name: 'Sonia', x: 11, y: 3, dir: 'down', alpha: 0 });
  let vv = null;
  Audio2.music('sonia');
  await scene(async cast => {
    const { raine } = cast;
    await so.fadeIn(40);
    if (flag('veraiLost5') || (flag('veraiGone4') && !flag('veraiBack'))) { vv = f.spawn({ id: 'vv', look: 'verai', name: 'Verai', x: 13, y: 3, dir: 'down', alpha: 0 }); await vv.fadeIn(30); }
    await say('Sonia', "Captain. You keep arriving. It's almost a talent.");
    await say('Sonia', "Do you know what's down there? Every prayer anyone ever said to a god that didn't answer. Unclaimed. Waiting. Mine, in a moment.");
    await say(R(), "Not if we stop you.");
    await say('Sonia', "Oh, Captain. You can't stop the sky from falling. You can only choose who it lands on.");
  });
  healParty();
  await startBattle({ enemies: ['sonia5'], boss: true, bg: 'stormplain', music: 'final', noRun: true, cantLose: true, turnLimit: 6 });
  // someone takes the blow for Raine
  const ashkarHere = allyRoute() ? (flag('ashkarRisen') || flag('ashkarDim')) : flag('ashkarMended');
  await scene(async cast => {
    const { raine, miasma } = cast, od = cast.odeaon || castHero(cast, 'odeaon');
    await say(null, "Sonia raises one hand. The Dawnheart and the Heartseed burn in it like two small suns. The whole storm bends toward Raine.");
    await say('Sonia', "Goodbye, Captain.");
    Game.flash = 30; Game.shake = 30; Audio2.sfx('boom');
    if (ashkarHere) {
      await say(null, "And a phoenix hits the light head-on.");
      const ak = f.spawn({ id: 'ashkar', look: 'ashkarman', name: 'Ashkar', x: Math.round(raine.x), y: Math.round(raine.y) - 1, dir: 'up' });
      await say(ASH, "Told you I'd be there. Loudly.");
      await say('Sonia', "YOU. Bird. Thief. You took my seat.");
      await say(ASH, "I did. I'm sorry. I've been sorry for a long time. That's why I'm going to give it back.");
      Game.flash = 40; Audio2.sfx('fire');
      await say(null, "Ashkar wraps the light around himself like a cloak, and falls. Down past the Rim, into the crater, burning all the way, like a star going the wrong direction.");
      await ak.fadeOut(40); f.despawn(ak);
      await raine.kneel();
      await say(R(), "ASHKAR!");
      setFlag('ashkarFell');
      if (miasma) await say(MI(), "...He gave her the seat. He fell into it so it would be EMPTY. Oh, you stupid, stupid bird.");
    } else if (od) {
      await say(null, "And a knight steps in front of it.");
      await say(ODE(), "Not her. You don't get her.");
      Game.flash = 40;
      await say(null, "The light takes Odeaon off his feet, and over the Rim, and down, into the storm. His shield spins away, ringing, and stops at Raine's feet.");
      await raine.kneel();
      await say(R(), "FATHER!");
      if (miasma) { await miasma.tremble(40); await say(MI(), "No. No, no, no. ODEAON!"); }
      sendAway('odeaon', 'rim');
      setFlag('odeaonFell');
    } else {
      await say(null, "Raine is thrown across the Rim. When she can see again, she is still alive. She doesn't know why. Neither does Sonia.");
    }
    if (vv) {
      vv.face(raine);
      await say(null, "Beside her mother, Verai has her hand half-raised, as if she'd started to reach for Raine and stopped.");
      await say('Sonia', "Come, little night. We have a throne to sit in.");
      await say(VE(), "...Yes, Mother.");
    }
    await say('Sonia', "When I come out of that crater, Captain, there won't be ten gods. There'll be one. Try to be there. I'd like you to see it.");
    if (vv) { await vv.fadeOut(30); f.despawn(vv); }
    await so.fadeOut(40);
  });
  so.alpha = 0; f.despawn(so);
  await chapter5End();
}

// ------------------------------------------------------------------ the end of Chapter Five
async function chapter5End() {
  const f = F(), st = S();
  await cinema([
    { dur: 220, bg: 'storm', music: 'sorrow', shake: 16, caption: 'The Veilstorm closes over Godsfall like a fist. Down in the crater, a throne of light finishes rising.' },
    { dur: 200, bg: 'sky', caption: 'Miasma carries everyone out on her back, flying low and slow, and does not say a single word the whole way.' },
  ], { skipAll: false });
  f.enterMap('rimward', 12, 13, 'up'); Game.fade = 0;
  await scene(async cast => {
    const { raine, miasma } = cast, luna = castHero(cast, 'luna'), verai = flag('veraiGone4') && !flag('veraiBack') ? null : castHero(cast, 'verai'), brakka = castHero(cast, 'brakka');
    await say(null, "Rimward, by the pilgrims' fire. Nobody is eating. Even Luna.");
    if (flag('odeaonFell')) {
      await say(null, "Raine sits with her father's shield across her knees.");
      if (miasma) { await say(MI(), "He's not dead. He's NOT. The storm took him, it didn't — he's not dead until I see it."); await say(R(), "...Then we go and see it."); }
    } else if (flag('ashkarFell')) {
      await say(null, "There is a single phoenix feather in the fire. It isn't burning. It's just glowing, very softly.");
      await say(R(), "The Tenth Seat is empty now. He did it on purpose.");
      if (miasma) await say(MI(), "He wanted it empty when she got there. So she'd have to fight for it. So we'd have a chance.");
    }
    if (verai && flag('veraiNyxia') === 'vessel') { await say(null, "Verai sits a little apart from the fire. Her eyes are still dark all the way through. She keeps looking south."); }
    else if (verai) { await say(VE(), "I can still hear Nyxia. She's not scared anymore. I think... she thinks we can win."); }
    else await say(null, "Raine has a strip of grey scarf around her wrist. She keeps touching it.");
    if (brakka) await say(BR(), "So. A god-throne in a hole, a storm on top, and a woman with three reliquaries. I've had worse Tuesdays. I can't remember them, but I've had them.");
    if (luna) await say('Luna', "We go in. Together. All of us who are left, and we bring back the ones who aren't.");
    await say(R(), "We go in.");
  });
  Audio2.music(null);
  await fadeOut(60);
  await cinema([
    { dur: 240, bg: 'void', music: 'sonia', caption: 'At the bottom of Godsfall Crater, Sonia climbs the steps of a throne made of every unanswered prayer in the world.', layers: [{ img: 'b_sonia', x: W / 2, y: 610, s: 1.3 }] },
    flag('ashkarFell')
      ? { dur: 220, bg: 'seats', caption: 'In the ring of the Ten, the Tenth Flame goes out. For the first time since the world was young, a seat is truly empty.' }
      : { dur: 220, bg: 'seats', caption: 'In the ring of the Ten, the flames lean toward the south, the way candles lean toward an open door.' },
  ], { skipAll: false });
  await crawl([
    'Miasma remembered she could fly. The whole world opened.',
    'Myndra\'s eye is open. Nyxia\'s night ' + (flag('veraiNyxia') === 'vessel' ? 'lives in Verai now, all of it.' : flag('veraiNyxia') === 'carry' ? 'is carried, kindly, by Verai.' : 'is spread between a girl and a storm.'),
    flag('veraiBack') ? 'Verai came home. Her choice.' : flag('veraiLost5') ? 'Verai is beside her mother, on the steps of a throne. She almost reached back.' : 'Verai stayed. Every step of the way.',
    allyRoute() ? (flag('ashkarRisen') ? 'Raine gave a god his heart back.' : 'Raine kept the pendant, and a god burned small.') : (flag('ashkarMended') ? 'Raine gave back the Anvil, and a god apologized.' : 'Raine kept the Anvil. Ashkar did not come.'),
    flag('ashkarFell') ? 'The Tenth Flame fell into Godsfall, so the seat would be empty when she got there.' : flag('odeaonFell') ? 'High Knight Odeaon fell into the storm in his daughter\'s place.' : 'Nobody fell. Nobody understands why.',
    flag('ch5seed') ? 'In a hidden valley, Elaris\'s seed is growing.' : 'Somewhere in Raine\'s pack, a seed is still beating.',
    'Sonia is climbing the steps.',
  ], { speed: 0.7 });
  await cinema([
    { dur: 330, bg: 'seats', sfx: 'holy', flash: 14, layers: [
      { text: 'END OF CHAPTER FIVE', x: W / 2, y: 210, size: 36, color: '#ffe070', glow: 'rgba(255,200,80,0.8)', fadeIn: 40 },
      { text: 'THE OPEN SKY', x: W / 2, y: 270, size: 18, color: '#a8d8ff', fadeIn: 80 },
      { text: 'Next: The Final Chapter - The Tenth Seat', x: W / 2, y: 360, size: 12, color: '#a8a8d0', fadeIn: 140 },
    ] },
  ], { skipAll: false });
  setFlag('ch5done');
  await saveScreen(null, Math.floor(st.playTime / 60), 'CHAPTER FIVE COMPLETE', [
    'Miasma flies. The world is open.',
    flag('veraiBack') ? 'Verai came home.' : flag('veraiLost5') ? 'Verai is with Sonia.' : flag('veraiNyxia') === 'vessel' ? 'Verai became Nyxia\'s vessel.' : 'Verai carries Nyxia\'s night.',
    flag('ashkarFell') ? 'Ashkar fell. The Tenth Seat is empty.' : flag('odeaonFell') ? 'Odeaon fell into the storm.' : 'Everyone made it out.',
    `Jobs found: ${['bloomwarden', 'timewarden', 'nightveil'].filter(j => st.jobsOpen.includes(j)).length} of 3 new.`,
  ], 'The Final Chapter will continue from this file. Godsfall waits.');
  st.flying = true;
  f.enterMap('zalakir', 7, 12, 'down');
  await fadeIn(40);
  Audio2.music('sky');
}
