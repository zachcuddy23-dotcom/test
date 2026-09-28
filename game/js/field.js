'use strict';
// ---------------------------------------------------------------------------
// Field (map exploration) scene
// ---------------------------------------------------------------------------
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
function prepMap(id) {
  const def = id === 'world' ? WORLD : MAPS[id];
  if (def._grid) return def;
  def.id = id;
  def.h = def.rows.length; def.w = def.rows[0].length;
  def._grid = def.rows.map(r => r.split(''));
  def._npcs = []; def._chests = []; def._marks = {};
  for (let y = 0; y < def.h; y++) for (let x = 0; x < def.w; x++) {
    const c = def._grid[y][x];
    if (!def.world && /[0-9]/.test(c) && def.npcs && def.npcs[c]) {
      def._npcs.push({ key: c, x, y });
      def._grid[y][x] = (def.underAt && def.underAt[c]) || def.under || '.';
    } else if (!def.world && def.chests && def.chests[c]) {
      def._chests.push({ ...def.chests[c], x, y });
      def._grid[y][x] = (def.underAt && def.underAt[c]) || def.under || '.';
    } else if ('<>'.includes(c)) def._marks[c] = [x, y];
  }
  return def;
}
class FieldScene {
  constructor() { this.opaque = true; this.busy = 0; this.moving = null; this.banner = 0; this.encSafe = 4; this.animF = 0; this.npcs = []; }
  enterMap(id, x, y, dir) {
    const st = S();
    this.map = prepMap(id); st.map = id; st.x = x; st.y = y; if (dir) st.dir = dir;
    this.tiles = this.map.world ? WORLD_TILES : IN_TILES;
    this.npcs = (this.map._npcs || []).map(n => ({ ...n, def: this.map.npcs[n.key], hx: n.x, hy: n.y, dir: this.map.npcs[n.key].dir || 'down', t: rnd(60, 200), mv: null }));
    this.banner = this.map.world ? 0 : 150;
    this.encSafe = 3;
    Audio2.music(st.onShip ? 'sea' : this.map.music);
  }
  tileAt(x, y) { if (x < 0 || y < 0 || x >= this.map.w || y >= this.map.h) return null; return this.map._grid[y][x]; }
  tileDef(c) {
    if (this.map.world && c === 'B' && !flag('vhalen')) return WORLD_TILES.r;
    return this.tiles[c] || { solid: true };
  }
  visibleNpcs() { return this.npcs.filter(n => !n.def.show || n.def.show()); }
  npcAt(x, y) { return this.visibleNpcs().find(n => n.x === x && n.y === y || (n.mv && n.mv.tx === x && n.mv.ty === y)); }
  chestAt(x, y) { return (this.map._chests || []).find(c => c.x === x && c.y === y); }
  blocked(x, y, forNpc) {
    const c = this.tileAt(x, y);
    if (c == null) return !this.map.world && !forNpc ? false : true; // walking off an interior edge = exit
    const t = this.tileDef(c);
    if (forNpc && (t.shop || t.exit || t.stairs || c === '+')) return true;
    if (t.solid) return true;
    if (this.npcAt(x, y)) return true;
    if (this.chestAt(x, y)) return true;
    return false;
  }
  // -------------------------------------------------------------- update
  update() {
    const st = S();
    st.playTime++;
    this.animF = Math.floor(Game.frame / 16);
    if (this.banner > 0) this.banner--;
    this.updateNpcs();
    if (this.moving) { this.stepMove(); return; }
    if (this.busy) return;
    if (Input.hit('menu') || Input.hit('b')) { this.run(async () => { await openMenu(); }); return; }
    if (Input.ok()) { this.interact(); return; }
    const d = Input.dir();
    if (d) this.tryMove(d);
  }
  run(fn) { this.busy++; Input.clear(); Promise.resolve().then(fn).catch(e => console.error(e)).finally(() => { this.busy--; Input.clear(); }); }
  tryMove(d) {
    const st = S(); st.dir = d;
    const [dx, dy] = DIRS[d], nx = st.x + dx, ny = st.y + dy;
    const speed = st.onShip ? 6 : (Input.held.run ? 6 : 10);
    if (this.map.world) {
      const c = this.tileAt(nx, ny); if (c == null) return;
      const t = this.tileDef(c);
      if (st.onShip) {
        if (t.sea) return this.startMove(nx, ny, speed);
        if (!t.solid && !t.place) { st.ship = { x: st.x, y: st.y }; st.onShip = false; Audio2.music(this.map.music); return this.startMove(nx, ny, 10); }
        return;
      }
      if (st.ship && st.ship.x === nx && st.ship.y === ny) { st.onShip = true; Audio2.music('sea'); return this.startMove(nx, ny, 10); }
      if (t.solid) { if (this.bumpT !== Game.frame - 1) Audio2.sfx('bump'); this.bumpT = Game.frame; return; }
      return this.startMove(nx, ny, speed);
    }
    if (this.blocked(nx, ny)) { this.bumpT = Game.frame; return; }
    this.startMove(nx, ny, speed);
  }
  startMove(nx, ny, speed) { const st = S(); this.moving = { fx: st.x, fy: st.y, tx: nx, ty: ny, t: 0, n: speed }; this.stepCount = (this.stepCount || 0) + 1; }
  stepMove() {
    const m = this.moving; m.t++;
    if (m.t >= m.n) { const st = S(); st.x = m.tx; st.y = m.ty; this.moving = null; this.arrive(); }
  }
  playerPos() { const st = S(); if (this.moving) { const k = this.moving.t / this.moving.n; return [this.moving.fx + (this.moving.tx - this.moving.fx) * k, this.moving.fy + (this.moving.ty - this.moving.fy) * k]; } return [st.x, st.y]; }
  // -------------------------------------------------------------- arrival
  arrive() {
    const st = S(); st.steps++;
    // poison ticks
    for (const m of st.party) if (alive(m) && m.status.poison && m.hp > 1) m.hp--;
    const c = this.tileAt(st.x, st.y);
    if (this.map.world) {
      const place = this.map.places[st.x + ',' + st.y];
      if (place && !st.onShip) { this.run(() => this.enterPlace(place.map)); return; }
      if (c === 'B' && !flag('prologue')) { this.run(() => bridgePrologue()); return; }
      this.maybeEncounter(this.map.zone(st.x, st.y, c), this.tileDef(c).enc || (st.onShip ? 0.7 : 0), this.map.bg(st.x, st.y, c));
      return;
    }
    if (c == null) { this.run(() => this.leaveMap()); return; }
    const t = this.tileDef(c);
    if (t.exit) { this.run(() => this.leaveMap()); return; }
    if (t.shop) { this.run(async () => { await openShop(t.shop, this.map.shops); st.y += 1; st.dir = 'down'; }); return; }
    if (c === '+' && this.map.doors && this.map.doors[st.x + ',' + st.y]) { const d = this.map.doors[st.x + ',' + st.y]; this.run(() => this.warp(d.map, d.x, d.y, d.dir)); return; }
    if (t.stairs && this.map.warps && this.map.warps[c]) {
      const w = this.map.warps[c], tm = prepMap(w.map), [tx, ty] = tm._marks[w.at];
      this.run(async () => { Audio2.sfx('stairs'); await this.warp(w.map, tx, ty, st.dir); }); return;
    }
    if (this.map.enc) this.maybeEncounter(this.map.enc, 1, this.map.bg);
  }
  maybeEncounter(zone, mult, bg) {
    if (!mult || !FORMATIONS[zone]) return;
    if (this.encSafe > 0) { this.encSafe--; return; }
    const base = this.map.world ? 0.05 : (this.map.encRate || 0.06);
    if (Math.random() < base * mult) {
      this.encSafe = 4;
      const f = wpick(FORMATIONS[zone]); const ens = [];
      for (const [id, a, b] of f.e) for (let i = rnd(a, b); i > 0; i--) ens.push(id);
      this.run(() => startBattle({ enemies: ens.slice(0, 6), bg }));
    }
  }
  async enterPlace(id) {
    const m = prepMap(id); Audio2.sfx('stairs');
    await fadeOut(12); this.enterMap(id, m.start[0], m.start[1], m.start[2]); await fadeIn(12);
  }
  async leaveMap() {
    if (this.map.exitTo) { const e = this.map.exitTo; return this.warp(e.map, e.x, e.y, e.dir); }
    const [bx, by] = this.map.back || [S().x, S().y];
    await fadeOut(12); this.enterMap('world', bx, by, 'down'); await fadeIn(12);
  }
  async warp(id, x, y, dir) { await fadeOut(12); this.enterMap(id, x, y, dir); await fadeIn(12); }
  // -------------------------------------------------------------- interaction
  interact() {
    const st = S(), [dx, dy] = DIRS[st.dir];
    let tx = st.x + dx, ty = st.y + dy;
    if (!this.map.world && this.tileDef(this.tileAt(tx, ty) || ' ').counter) { tx += dx; ty += dy; }
    const npc = this.npcAt(tx, ty);
    if (npc) { this.run(() => this.talk(npc)); return; }
    const ch = this.chestAt(tx, ty);
    if (ch) { this.run(() => this.openChest(ch)); return; }
  }
  async talk(npc) {
    const opp = { up: 'down', down: 'up', left: 'right', right: 'left' };
    npc.dir = opp[S().dir];
    const d = npc.def, name = d.name || null;
    for (const t of d.talk) {
      const r = await t(npc);
      if (r === null) return; // handled
      if (typeof r === 'string') { await say(name, r); return; }
      if (r === undefined && t.constructor.name === 'AsyncFunction') return;
    }
  }
  async openChest(ch) {
    if (S().chests[ch.id]) { await say(null, 'The chest is empty.'); return; }
    if (ch.guard && !(await crownGuard(ch))) return;
    S().chests[ch.id] = true; Audio2.sfx('chest');
    if (ch.gold) { S().gold += ch.gold; await notify(`Found ${ch.gold} gold!`); }
    else if (ch.key) { giveKey(ch.key); await notify(`Found the ${KEY_ITEMS[ch.key].name}!`); }
    else { addItem(ch.item); await notify(`Found ${itemInfo(ch.item).name}!`); }
  }
  updateNpcs() {
    for (const n of this.npcs) {
      if (n.mv) { n.mv.t++; if (n.mv.t >= 16) { n.x = n.mv.tx; n.y = n.mv.ty; n.mv = null; } continue; }
      if (n.def.move !== 'wander' || this.busy) continue;
      if (--n.t > 0) continue;
      n.t = rnd(80, 220);
      const d = pick(Object.keys(DIRS)), [dx, dy] = DIRS[d], nx = n.x + dx, ny = n.y + dy;
      n.dir = d;
      const st = S(), pp = this.moving ? [this.moving.tx, this.moving.ty] : [st.x, st.y];
      if (Math.abs(nx - n.hx) > 2 || Math.abs(ny - n.hy) > 2) continue;
      if ((nx === st.x && ny === st.y) || (nx === pp[0] && ny === pp[1])) continue;
      if (this.blocked(nx, ny, true)) continue;
      n.mv = { tx: nx, ty: ny, t: 0 };
    }
  }
  // -------------------------------------------------------------- draw
  tileArt(c, x, y) {
    const t = this.tileDef(c); let art = t.art, v = 0;
    const th = this.map.world ? 'world' : this.map.theme;
    if (art === 'wall') { const b = this.tileAt(x, y + 1); art = (b == null || b === '#' || b === ' ' || b === '*') ? 'wallTop' : 'wallFace'; }
    else if (art === 'exit') { art = this.map.exitArt || 'path'; }
    if (art === 'roof') { const a = this.tileAt(x, y - 1), b = this.tileAt(x, y + 1); v = (a !== 'R' ? 1 : 0) | (b && b !== 'R' ? 2 : 0); }
    else if (art === 'floor') v = (x + y) % 2;
    else if (art === 'grass' || art === 'path' || art === 'sand' || art === 'forest' || art === 'swamp') v = (x * 7 + y * 13) % 4;
    else if (art === 'bwall') v = (x % 3 === 1) ? 1 : 0;
    else if (t.v != null) v = t.v;
    const frame = t.anim ? this.animF % t.anim : 0;
    return tileImg(art, th, v, frame);
  }
  draw() {
    const st = S(), [px, py] = this.playerPos();
    let cx = px * TS + TS / 2 - W / 2, cy = py * TS + TS / 2 - H / 2;
    const mw = this.map.w * TS, mh = this.map.h * TS;
    if (!this.map.world || true) {
      cx = mw <= W ? (mw - W) / 2 : clamp(cx, 0, mw - W);
      cy = mh <= H ? (mh - H) / 2 : clamp(cy, 0, mh - H);
    }
    cx = Math.round(cx); cy = Math.round(cy);
    const x0 = Math.floor(cx / TS), y0 = Math.floor(cy / TS), x1 = Math.ceil((cx + W) / TS), y1 = Math.ceil((cy + H) / TS);
    const bgFill = this.map.world ? '#2a5ab8' : '#000';
    ctx.fillStyle = bgFill; ctx.fillRect(0, 0, W, H);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const c = this.tileAt(x, y); if (c == null) continue;
      const sx = x * TS - cx, sy = y * TS - cy;
      ctx.drawImage(this.tileArt(c, x, y), sx, sy, TS, TS);
      if (this.map.world && c === '~') this.foam(x, y, sx, sy);
    }
    // objects
    const objs = [];
    for (const ch of this.map._chests || []) objs.push({ y: ch.y, draw: () => ctx.drawImage(S().chests[ch.id] ? OBJ.chestOpen : OBJ.chest, ch.x * TS - cx, ch.y * TS - cy, TS, TS) });
    if (this.map.world && st.ship && !st.onShip) objs.push({ y: st.ship.y, draw: () => ctx.drawImage(OBJ.ship, st.ship.x * TS - cx, st.ship.y * TS - cy + Math.sin(Game.frame / 20) * 2, TS, TS) });
    for (const n of this.visibleNpcs()) {
      let nx = n.x, ny = n.y; if (n.mv) { const k = n.mv.t / 16; nx += (n.mv.tx - n.x) * k; ny += (n.mv.ty - n.y) * k; }
      const sleeping = n.def.sleep && n.def.sleep();
      const fr = n.mv ? (Math.floor(n.mv.t / 8) % 2 ? 1 : 2) : 0;
      objs.push({ y: ny, draw: () => {
        const img = chibi(n.def.look, sleeping ? 'down' : n.dir, fr, sleeping ? 'sleep' : '');
        if (sleeping) { ctx.save(); ctx.beginPath(); ctx.rect(nx * TS - cx - 6, ny * TS - cy - 30, TS + 12, 48); ctx.clip(); ctx.drawImage(img, nx * TS - cx - 3, ny * TS - cy - 18, 54, 72); ctx.restore(); if (Math.floor(Game.frame / 30) % 2) text('z', nx * TS - cx + 40, ny * TS - cy - 30, '#fff', 12); }
        else ctx.drawImage(img, nx * TS - cx - 3, ny * TS - cy - 24, 54, 72);
      } });
    }
    // player
    const lead = st.party.find(alive) || st.party[0];
    objs.push({ y: py + 0.01, draw: () => {
      if (st.onShip) { ctx.drawImage(OBJ.ship, px * TS - cx, py * TS - cy + Math.sin(Game.frame / 20) * 2, TS, TS); return; }
      let fr = 0; if (this.moving) { const k = this.moving.t / this.moving.n; fr = k < 0.5 ? ((this.stepCount % 2) ? 1 : 2) : 0; }
      ctx.drawImage(chibi(HEROES[lead.id].look, st.dir, fr), px * TS - cx - 3, py * TS - cy - 24, 54, 72);
    } });
    objs.sort((a, b) => a.y - b.y).forEach(o => o.draw());
    if (this.banner > 0) {
      const a = Math.min(1, this.banner / 30); ctx.globalAlpha = a;
      const w = textW(this.map.name) + 80; drawWindow((W - w) / 2, 24, w, 70); text(this.map.name, W / 2, 50, '#fff', 16, 'center'); ctx.globalAlpha = 1;
    }
  }
  foam(x, y, sx, sy) {
    const land = (a, b) => { const c = this.tileAt(a, b); return c != null && c !== '~'; };
    ctx.fillStyle = 'rgba(200,230,255,0.55)';
    const f = (Game.frame >> 4) % 2 ? 3 : 4;
    if (land(x, y - 1)) ctx.fillRect(sx, sy, TS, f);
    if (land(x, y + 1)) ctx.fillRect(sx, sy + TS - f, TS, f);
    if (land(x - 1, y)) ctx.fillRect(sx, sy, f, TS);
    if (land(x + 1, y)) ctx.fillRect(sx + TS - f, sy, f, TS);
  }
}
async function warpTo(id, x, y, dir) { Game.field.enterMap(id, x, y, dir); }

// ---------------------------------------------------------------------------
// Title / intro / prologue / ending scenes
// ---------------------------------------------------------------------------
class CrawlScene {
  constructor(lines, res, o = {}) { this.lines = lines; this.res = res; this.t = 0; this.opaque = true; this.title = o.title; this.speed = o.speed || 0.5; }
  update() {
    this.t++;
    const total = this.lines.length * 34 + 700;
    if ((Input.ok() && this.t > 30) || this.t * this.speed > total) { Game.pop(this); this.res(); }
  }
  draw() {
    drawStars();
    const y0 = H - this.t * this.speed + 40;
    if (this.title) { text(this.title, W / 2, y0 - 90, '#ffe070', 28, 'center'); }
    this.lines.forEach((l, i) => { const y = y0 + i * 34; if (y > -40 && y < H) text(l, W / 2, y, '#e8e8ff', 16, 'center'); });
    text('Z: skip', W - 20, H - 30, '#6a6a8a', 12, 'right');
  }
}
function crawl(lines, o) { return new Promise(res => Game.push(new CrawlScene(lines, res, o))); }
const STARS = Array.from({ length: 120 }, () => [Math.random() * W, Math.random() * H, Math.random()]);
function drawStars() {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#02030c'); g.addColorStop(1, '#141040');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const [x, y, b] of STARS) { const tw = 0.5 + 0.5 * Math.sin(Game.frame / 30 + b * 10); ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * b * tw})`; ctx.fillRect(x, y, b > 0.8 ? 3 : 2, b > 0.8 ? 3 : 2); }
}
async function bridgePrologue() {
  setFlag('prologue');
  Audio2.music('prelude');
  await fadeOut(30);
  await crawl([
    'The Cinder Bridge is whole again.',
    '',
    'Beyond it, the old roads lead east,',
    'to salt winds and restless seas.',
    '',
    'Four Crystals once kept the world in balance.',
    'One by one, their light is fading,',
    'and a black miasma spreads in its place.',
    '',
    'The seers spoke of three shadows',
    'who would carry a shard of night',
    'into the heart of the dark,',
    'and bring back the dawn.',
    '',
    'A dragon-blooded freelancer.',
    'A gentle mage wrapped in smoke.',
    'A rogue alchemist who wears the moon.',
    '',
    'Their journey begins now.',
  ], { title: 'SHARDS OF THE DAWN' });
  await fadeIn(30);
  Audio2.music(Game.field.map.music);
}
async function chapterEnd() {
  Audio2.music('prelude');
  await fadeOut(60);
  const st = S(), t = Math.floor(st.playTime / 60);
  await crawl([
    'Prince Aeris wakes, and Lumenwood breathes again.',
    'Morvane has fallen, but the Crystals keep fading.',
    '',
    'Somewhere beneath the world, something is waking.',
    '',
    `Miasma  Lv ${st.party.find(m => m.id === 'miasma').lvl}`,
    `Verai   Lv ${st.party.find(m => m.id === 'verai').lvl}`,
    `Raine   Lv ${st.party.find(m => m.id === 'raine').lvl}`,
    `Play time ${Math.floor(t / 3600)}h ${Math.floor(t / 60) % 60}m   Battles ${st.battles}`,
    '',
    '- END OF CHAPTER I -',
    '',
    'To be continued in Chapter II:',
    'The Warden\'s Key',
    '',
    'Thank you for playing!',
    '(You can keep exploring. Your game has been saved.)',
  ], { title: 'CHAPTER I COMPLETE', speed: 0.6 });
  saveGame();
  await fadeIn(40);
  Audio2.music(Game.field.map.music);
}
