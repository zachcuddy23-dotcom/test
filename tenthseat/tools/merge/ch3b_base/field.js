'use strict';
// ---------------------------------------------------------------------------
// Field (map exploration) scene
// ---------------------------------------------------------------------------
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
function prepMap(id) {
  const def = id === 'world' ? WORLD : MAPS[id];
  if (!def) throw new Error('No map ' + id);
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
    Audio2.music(st.onShip ? 'sea' : musicFor(this.map));
    if (this.map.onEnter) this.run(() => this.map.onEnter());
  }
  tileAt(x, y) { if (x < 0 || y < 0 || x >= this.map.w || y >= this.map.h) return null; return this.map._grid[y][x]; }
  tileDef(c) {
    if (this.map.id === 'world') {
      if (c === 'B' && !flag('bridge')) return WORLD_TILES.r;
      if (c === 'G') return flag('pass') ? WORLD_TILES.g : WORLD_TILES['^'];
    }
    if (this.map.gates && this.map.gates[c]) { const [fl, open, closed] = this.map.gates[c]; return WORLD_TILES[flag(fl) ? open : closed]; }
    if (this.map.tileOverride) { const o = this.map.tileOverride(c); if (o) return o; }
    return this.tiles[c] || { solid: true };
  }
  visibleNpcs() { return this.npcs.filter(n => !n.out && (!n.def.show || n.def.show())); }
  // Patrolling guards (def.patrol + def.sight): the tiles they can see, straight ahead until a wall.
  sightTiles(n) {
    const out = [], [dx, dy] = DIRS[n.dir] || [0, 1]; let x = n.x, y = n.y;
    for (let i = 0; i < n.def.sight; i++) { x += dx; y += dy; const c = this.tileAt(x, y); if (c == null || this.tileDef(c).solid || this.chestAt(x, y)) break; out.push([x, y]); }
    return out;
  }
  npcAt(x, y) { return this.visibleNpcs().find(n => n.x === x && n.y === y || (n.mv && n.mv.tx === x && n.mv.ty === y)); }
  chestAt(x, y) { return (this.map._chests || []).find(c => c.x === x && c.y === y); }
  nearLantern() { const st = S(); for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) if (this.tileAt(st.x + dx, st.y + dy) === 'L') return true; return false; }
  blocked(x, y, forNpc) {
    const c = this.tileAt(x, y);
    if (c == null) return !this.map.world && !forNpc ? false : true;
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
    if (!this.busy && !this.scripted && !this.moving) {
      const st = S();
      for (const n of this.visibleNpcs()) {
        if (!n.def.sight || n.mv || !n.def.onSpot) continue;
        const near = Math.abs(n.x - st.x) + Math.abs(n.y - st.y) === 1;
        if (near || this.sightTiles(n).some(([x, y]) => x === st.x && y === st.y)) { Audio2.sfx('error'); this.run(() => n.def.onSpot(n)); return; }
      }
    }
    if (this.moving) { this.stepMove(); return; }
    if (this.busy) return;
    if (Input.hit('menu') || Input.hit('b')) { this.run(async () => { await openMenu(); }); return; }
    if (Input.ok()) { this.interact(); return; }
    const d = Input.dir();
    if (d) this.tryMove(d);
  }
  run(fn) {
    this.busy++; Input.clear();
    Promise.resolve().then(fn).catch(e => { logError('event', e); Game.fade = 0; this.scripted = false; this.moving = null; })
      .finally(() => { this.busy = Math.max(0, this.busy - 1); Input.clear(); });
  }
  tryMove(d) {
    const st = S(); st.dir = d;
    const [dx, dy] = DIRS[d], nx = st.x + dx, ny = st.y + dy;
    const speed = st.onShip ? 6 : (Input.held.run ? 6 : 10);
    if (this.map.world) {
      const c = this.tileAt(nx, ny); if (c == null) return;
      const t = this.tileDef(c);
      if (st.onShip) {
        if (t.sea || c === 'B' || c === 'r') return this.startMove(nx, ny, speed);
        if (!t.solid) { st.ship = { x: st.x, y: st.y }; st.onShip = false; Audio2.music(musicFor(this.map)); return this.startMove(nx, ny, 10); }
        return;
      }
      if (this.map.id === 'world' && st.ship && st.ship.x === nx && st.ship.y === ny) { st.onShip = true; Audio2.music('sea'); return this.startMove(nx, ny, 10); }
      if (t.solid) { if (this.bumpT !== Game.frame - 1) Audio2.sfx('bump'); this.bumpT = Game.frame; return; }
      return this.startMove(nx, ny, speed);
    }
    if (this.blocked(nx, ny)) { this.bumpT = Game.frame; return; }
    this.startMove(nx, ny, speed);
  }
  startMove(nx, ny, speed) { const st = S(); this.moving = { fx: st.x, fy: st.y, tx: nx, ty: ny, t: 0, n: speed }; this.stepCount = (this.stepCount || 0) + 1; }
  stepMove() {
    const m = this.moving; m.t++;
    if (m.t >= m.n) { const st = S(); st.x = m.tx; st.y = m.ty; this.moving = null; if (!this.scripted) this.arrive(); }
  }
  playerPos() { const st = S(); if (this.moving) { const k = this.moving.t / this.moving.n; return [this.moving.fx + (this.moving.tx - this.moving.fx) * k, this.moving.fy + (this.moving.ty - this.moving.fy) * k]; } return [st.x, st.y]; }
  // scripted walking for cutscenes
  async walk(dir, n = 1, speed = 12) {
    this.scripted = true;
    for (let i = 0; i < n; i++) { const st = S(); st.dir = dir; const [dx, dy] = DIRS[dir]; this.startMove(st.x + dx, st.y + dy, speed); while (this.moving) await wait(1); }
    this.scripted = false;
  }
  async npcWalk(key, dirs, speed = 16) {
    const n = this.npcs.find(q => q.key === String(key)); if (!n) return;
    for (const d of dirs) { n.dir = d; const [dx, dy] = DIRS[d]; n.mv = { tx: n.x + dx, ty: n.y + dy, t: 0, n: speed }; while (n.mv) await wait(1); }
  }
  npcFace(key, dir) { const n = this.npcs.find(q => q.key === String(key)); if (n) n.dir = dir; }
  // -------------------------------------------------------------- arrival
  arrive() {
    const st = S(); st.steps++;
    for (const m of st.party) if (alive(m) && m.status.poison && m.hp > 1) m.hp--;
    const c = this.tileAt(st.x, st.y);
    if (this.map.world) {
      const place = this.map.places[st.x + ',' + st.y];
      if (place && !st.onShip) { this.run(() => this.enterPlace(place)); return; }
      this.maybeEncounter(this.map.zone(st.x, st.y, c), this.tileDef(c).enc || (st.onShip ? 0.8 : 0), this.map.bg(st.x, st.y, c));
      return;
    }
    const trig = this.map.steps && this.map.steps[st.x + ',' + st.y];
    if (trig) { this.run(async () => { await trig(); }); return; }
    if (c == null) { const [bx, by] = [clamp(st.x, 0, this.map.w - 1), clamp(st.y, 0, this.map.h - 1)]; this.run(async () => { await this.leaveMap('X'); if (this.map.id === (this._leftFrom || this.map.id) && !this.map.world && (st.x < 0 || st.y < 0 || st.x >= this.map.w || st.y >= this.map.h)) { st.x = bx; st.y = by; } }); return; }
    const t = this.tileDef(c);
    if (t.exit) { this.run(() => this.leaveMap(c)); return; }
    if (t.shop) { this.run(async () => { await openShop(t.shop, this.map.shops); st.y += 1; st.dir = 'down'; }); return; }
    if (c === '+' && this.map.doors && this.map.doors[st.x + ',' + st.y]) { const d = this.map.doors[st.x + ',' + st.y]; this.run(() => this.warp(d.map, d.x, d.y, d.dir)); return; }
    if (t.stairs && this.map.warps && this.map.warps[c]) {
      const w = this.map.warps[c], tm = prepMap(w.map), [tx, ty] = tm._marks[w.at];
      this.run(async () => { Audio2.sfx('stairs'); await this.warp(w.map, tx, ty, st.dir); }); return;
    }
    // ice: keep sliding the same way until something stops you (no random battles mid-slide)
    if (t.ice && !this.scripted) {
      const [dx, dy] = DIRS[st.dir], nx = st.x + dx, ny = st.y + dy;
      if (this.tileAt(nx, ny) != null && !this.blocked(nx, ny)) { if (!this.sliding) Audio2.sfx('cursor'); this.sliding = true; this.startMove(nx, ny, 5); return; }
    }
    const slid = this.sliding; this.sliding = false;
    if (this.map.enc && !slid) this.maybeEncounter(this.map.enc, t.enc == null ? 1 : t.enc, this.map.bg);
  }
  maybeEncounter(zone, mult, bg) {
    if (!mult || !FORMATIONS[zone] || flag('noEnc')) return;
    if (this.encSafe > 0) { this.encSafe--; return; }
    const base = this.map.world ? 0.05 : (this.map.encRate || 0.06);
    if (Math.random() < base * mult) {
      this.encSafe = 4;
      const f = wpick(FORMATIONS[zone]); const ens = [];
      for (const [id, a, b] of f.e) for (let i = rnd(a, b); i > 0; i--) ens.push(id);
      this.run(() => startBattle({ enemies: ens.slice(0, 6), bg }));
    }
  }
  async enterPlace(place) {
    const id = typeof place.map === 'function' ? place.map() : place.map;
    if (place.check) { const ok = await place.check(); if (!ok) return; }
    const m = prepMap(id), at = place.at || m.start; Audio2.sfx('stairs');
    await fadeOut(12); this.enterMap(id, at[0], at[1], at[2]); await fadeIn(12);
  }
  async leaveMap(c) {
    const out = c === 'Y' ? this.map.back2 : this.map.back;
    if (out && !Array.isArray(out)) return this.warp(out.map, out.x, out.y, out.dir);
    const [bx, by] = out || [S().x, S().y];
    await fadeOut(12); this.enterMap(this.map.worldId || 'world', bx, by, 'down'); await fadeIn(12);
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
    if (!this.map.world && this.tileAt(st.x + dx, st.y + dy) === 'L') { this.run(() => lanternEvent()); return; }
    const sign = this.map.signs && this.map.signs[`${tx},${ty}`];
    if (sign) { this.run(() => typeof sign === 'function' ? sign() : say(null, sign)); }
  }
  async talk(npc) {
    const opp = { up: 'down', down: 'up', left: 'right', right: 'left' };
    if (!npc.def.fixed) npc.dir = opp[S().dir];
    const d = npc.def, name = d.name || null;
    for (const t of d.talk) {
      const r = await t(npc);
      if (r === null) return;
      if (typeof r === 'string') { await say(name, r); return; }
      if (r === undefined && t.constructor.name === 'AsyncFunction') return;
    }
  }
  async openChest(ch) {
    if (S().chests[ch.id]) { if (ch.again) { await ch.again(ch); return; } await say(null, 'The chest is empty.'); return; }
    if (ch.guard && !(await ch.guard())) return;
    S().chests[ch.id] = true; Audio2.sfx('chest');
    if (ch.gold) { S().gold += ch.gold; await notify(`Found ${ch.gold} gold!`, null); }
    else if (ch.key) { giveKey(ch.key); await notify(`Found the ${KEY_ITEMS[ch.key].name}!`, null); }
    else { addItem(ch.item, ch.n || 1); await notify(`Found ${itemInfo(ch.item).name}${ch.n > 1 ? ' x' + ch.n : ''}!`, null); }
  }
  updateNpcs() {
    for (const n of this.npcs) {
      if (n.mv) { n.mv.t++; if (n.mv.t >= (n.mv.n || 16)) { n.x = n.mv.tx; n.y = n.mv.ty; n.mv = null; } continue; }
      if (n.def.patrol) {
        if (this.busy) continue;
        if (--n.t > 0) continue;
        n.t = n.def.pace || 26;
        const p = n.def.patrol; n.pi = n.pi || 0;
        const d = p[n.pi % p.length], [dx, dy] = DIRS[d], nx = n.x + dx, ny = n.y + dy, st = S();
        n.dir = d;
        if (nx === st.x && ny === st.y) continue;          // you're in the way: the guard just stares at you
        if (!this.blocked(nx, ny, true)) n.mv = { tx: nx, ty: ny, t: 0, n: 20 };
        n.pi++;
        continue;
      }
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
    const th = this.map.world ? (this.map.theme || 'world') : this.map.theme;
    if (art === 'wall') { const b = this.tileAt(x, y + 1); art = (b == null || b === '#' || b === ' ' || b === '*') ? 'wallTop' : 'wallFace'; }
    else if (art === 'exit') { art = this.map.exitArt || 'path'; }
    if (art === 'roof') { const a = this.tileAt(x, y - 1), b = this.tileAt(x, y + 1); v = (a !== 'R' ? 1 : 0) | (b && b !== 'R' ? 2 : 0); }
    else if (art === 'floor') v = (x + y) % 2;
    else if (['grass', 'path', 'sand', 'forest', 'swamp', 'ash', 'silverwood', 'meadow'].includes(art)) v = (x * 7 + y * 13) % 4;
    else if (art === 'bwall') v = (x % 3 === 1) ? 1 : 0;
    else if (t.v != null) v = t.v;
    const frame = t.anim ? this.animF % t.anim : 0;
    return tileImg(art, th, v, frame);
  }
  draw() {
    const st = S(), [px, py] = this.playerPos();
    const [fx, fy] = this.cam ? [this.cam.x, this.cam.y] : [px, py];
    let cx = fx * TS + TS / 2 - W / 2, cy = fy * TS + TS / 2 - H / 2;
    const mw = this.map.w * TS, mh = this.map.h * TS;
    cx = mw <= W ? (mw - W) / 2 : clamp(cx, 0, mw - W);
    cy = mh <= H ? (mh - H) / 2 : clamp(cy, 0, mh - H);
    cx = Math.round(cx); cy = Math.round(cy);
    const x0 = Math.floor(cx / TS), y0 = Math.floor(cy / TS), x1 = Math.ceil((cx + W) / TS), y1 = Math.ceil((cy + H) / TS);
    ctx.fillStyle = this.map.world ? '#2a5ab8' : '#000'; ctx.fillRect(0, 0, W, H);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const c = this.tileAt(x, y); if (c == null) continue;
      const sx = x * TS - cx, sy = y * TS - cy;
      ctx.drawImage(this.tileArt(c, x, y), sx, sy, TS, TS);
      if (this.map.world && c === '~') this.foam(x, y, sx, sy);
    }
    const objs = [];
    for (const ch of this.map._chests || []) objs.push({ y: ch.y, draw: () => ctx.drawImage(S().chests[ch.id] ? OBJ.chestOpen : OBJ.chest, ch.x * TS - cx, ch.y * TS - cy, TS, TS) });
    if (this.map.id === 'world' && st.ship && !st.onShip) objs.push({ y: st.ship.y, draw: () => ctx.drawImage(OBJ.ship, st.ship.x * TS - cx, st.ship.y * TS - cy + Math.sin(Game.frame / 20) * 2, TS, TS) });
    for (const n of this.visibleNpcs()) {
      if (this.hideNpc && this.hideNpc.has(n.key)) continue;
      let nx = n.x, ny = n.y; if (n.mv) { const k = n.mv.t / (n.mv.n || 16); nx += (n.mv.tx - n.x) * k; ny += (n.mv.ty - n.y) * k; }
      const pose = n.def.pose ? n.def.pose() : '';
      let fr = n.mv ? (Math.floor(n.mv.t / 8) % 2 ? 1 : 2) : 0;
      // idle life: a breath every few seconds, a bob while speaking, looping chores
      let bob = Math.floor((Game.frame + n.hx * 37 + n.hy * 11) / 24) % 8 === 0 ? 2 : 0;
      if (n.def.act && !n.mv) { const ph = Math.floor((Game.frame + n.hx * 13) / 20) % 4; fr = ph % 2 ? 1 : 2; if (n.def.act === 'hammer' || n.def.act === 'pray') bob = ph === 0 ? 3 : 0; if (n.def.act === 'dance') { bob = ph % 2 ? -4 : 0; n.dir = ['down', 'left', 'up', 'right'][ph]; } if (n.def.act === 'sweep') n.dir = ph < 2 ? 'left' : 'right'; }
      if (Game.speaking && n.def.name === Game.speaking) bob = Math.floor(Game.frame / 6) % 2 ? -2 : 0;
      ny += bob / TS;
      objs.push({ y: ny, draw: () => {
        const bigImg = (n.def.img && IMG[n.def.img]) || (n.def.enemy && enemyImg(ENEMIES[n.def.enemy]));
        if (bigImg) { const s = n.def.scale || 0.5; ctx.drawImage(bigImg, nx * TS - cx + TS / 2 - bigImg.width * s / 2, ny * TS - cy + TS - bigImg.height * s, bigImg.width * s, bigImg.height * s); return; }
        const img = chibi(n.def.look, pose === 'sleep' ? 'down' : n.dir, fr, pose);
        if (pose === 'sleep') { ctx.save(); ctx.beginPath(); ctx.rect(nx * TS - cx - 6, ny * TS - cy - 30, TS + 12, 48); ctx.clip(); ctx.drawImage(img, nx * TS - cx - 3, ny * TS - cy - 18, 54, 72); ctx.restore(); if (Math.floor(Game.frame / 30) % 2) text('z', nx * TS - cx + 40, ny * TS - cy - 30, '#fff', 12); }
        else ctx.drawImage(img, nx * TS - cx - 3, ny * TS - cy - 24, 54, 72);
      } });
    }
    const lead = leadMember();
    if (!this.hidePlayer) objs.push({ y: py + 0.01, draw: () => {
      if (st.onShip) { ctx.drawImage(OBJ.ship, px * TS - cx, py * TS - cy + Math.sin(Game.frame / 20) * 2, TS, TS); return; }
      let fr = 0; if (this.moving) { const k = this.moving.t / this.moving.n; fr = k < 0.5 ? ((this.stepCount % 2) ? 1 : 2) : 0; }
      const talk = Game.speaking === HEROES[lead.id].name && Math.floor(Game.frame / 6) % 2 ? 2 : 0;
      ctx.drawImage(chibi(HEROES[lead.id].look, st.dir, fr), px * TS - cx - 3, py * TS - cy - 24 - talk, 54, 72);
    } });
    for (const a of this.actors || []) objs.push({ y: a.y + 0.02, draw: () => this.drawActor(a, cx, cy) });
    objs.sort((a, b) => a.y - b.y).forEach(o => o.draw());
    for (const n of this.visibleNpcs()) if (n.def.sight) { ctx.fillStyle = 'rgba(255,220,90,0.22)'; for (const [x, y] of this.sightTiles(n)) ctx.fillRect(x * TS - cx, y * TS - cy, TS, TS); }
    const tint = this.nightTint || (typeof this.map.tint === 'function' ? this.map.tint() : this.map.tint);
    if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H); }
    if (this.map.embers && this.map.embers()) this.drawEmbers();
    if (this.banner > 0) {
      const a = Math.min(1, this.banner / 30); ctx.globalAlpha = a;
      const w = textW(this.map.name) + 80; drawWindow((W - w) / 2, 24, w, 70); text(this.map.name, W / 2, 50, '#fff', 16, 'center'); ctx.globalAlpha = 1;
    }
    this.drawCinemaOverlay();
  }
  drawEmbers() {
    if (!this.embers) this.embers = Array.from({ length: 60 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 1 + Math.random() * 3, v: 0.5 + Math.random() * 1.5 }));
    for (const e of this.embers) { e.y -= e.v; e.x += Math.sin((Game.frame + e.s * 40) / 30) * 0.6; if (e.y < -10) { e.y = H + 10; e.x = Math.random() * W; } ctx.fillStyle = e.s > 2.5 ? '#fff0a0' : '#ff9030'; ctx.fillRect(e.x, e.y, e.s, e.s); }
    ctx.fillStyle = `rgba(255,120,30,${0.08 + 0.05 * Math.sin(Game.frame / 7)})`; ctx.fillRect(0, 0, W, H);
  }
  foam(x, y, sx, sy) {
    const land = (a, b) => { const c = this.tileAt(a, b); return c != null && c !== '~' && c !== 'r'; };
    ctx.fillStyle = 'rgba(200,230,255,0.55)';
    const f = (Game.frame >> 4) % 2 ? 3 : 4;
    if (land(x, y - 1)) ctx.fillRect(sx, sy, TS, f);
    if (land(x, y + 1)) ctx.fillRect(sx, sy + TS - f, TS, f);
    if (land(x - 1, y)) ctx.fillRect(sx, sy, f, TS);
    if (land(x + 1, y)) ctx.fillRect(sx + TS - f, sy, f, TS);
  }
}
function musicFor(map) { return typeof map.music === 'function' ? map.music() : map.music; }
async function warpTo(id, x, y, dir) { Game.field.enterMap(id, x, y, dir); }
async function lanternEvent() {
  Audio2.sfx('save');
  const c = await ask(null, 'A Dawn Lantern. Its steady flame makes the air feel safe.', ['Save', 'Use Bedroll', 'Talk with the party', 'Leave']);
  if (c === 2) { if (!(await campTalk())) await say(null, 'Everyone sits by the lantern for a while. Miasma complains about her feet. Nobody else has anything to say right now.'); return; }
  if (c === 0) { const ok = saveGame(); await say(null, ok ? 'Your journey has been recorded.' : 'Saving is unavailable here.'); }
  if (c === 1) {
    if (!S().items.bedroll) return say(null, 'You have no Bedroll.');
    removeItem('bedroll'); await fadeOut(30); healAll(); Audio2.sfx('heal'); await wait(30); await fadeIn(30);
    await say(null, 'You rest beside the lantern. HP and MP restored.');
  }
}

// ---------------------------------------------------------------------------
// Crawls, starfield
// ---------------------------------------------------------------------------
class CrawlScene {
  constructor(lines, res, o = {}) { this.lines = lines; this.res = res; this.t = 0; this.opaque = true; this.title = o.title; this.speed = o.speed || 0.5; this.bg = o.bg; }
  enter() { this._fade = Game.fade; Game.fade = 0; }
  leave() { Game.fade = this._fade || 0; }
  update() {
    this.t++;
    const total = this.lines.length * 34 + 700;
    if ((Input.ok() && this.t > 30) || this.t * this.speed > total) { Game.pop(this); this.res(); }
  }
  draw() {
    if (this.bg && IMG[this.bg]) { const im = IMG[this.bg]; ctx.globalAlpha = 0.45; ctx.drawImage(im, W - im.width - 20, H - im.height - 20); ctx.globalAlpha = 1; }
    else drawStars();
    const y0 = H - this.t * this.speed + 40;
    if (this.title) text(this.title, W / 2, y0 - 90, '#ffe070', 28, 'center');
    this.lines.forEach((l, i) => { const y = y0 + i * 34; if (y > -40 && y < H) text(l, W / 2, y, '#e8e8ff', 16, 'center'); });
    text('Z: skip', W - 20, H - 30, '#6a6a8a', 12, 'right');
  }
}
function crawl(lines, o) { return new Promise(res => Game.push(new CrawlScene(lines, res, o))); }
const STARS = Array.from({ length: 120 }, () => [Math.random() * W, Math.random() * H, Math.random()]);
function drawStars(top = '#02030c', bot = '#141040') {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const [x, y, b] of STARS) { const tw = 0.5 + 0.5 * Math.sin(Game.frame / 30 + b * 10); ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * b * tw})`; ctx.fillRect(x, y, b > 0.8 ? 3 : 2, b > 0.8 ? 3 : 2); }
}
// A still "card" scene with a picture and caption, used in cutscenes
class CardScene {
  constructor(o, res) { this.o = o; this.res = res; this.t = 0; this.opaque = true; }
  enter() { this._fade = Game.fade; Game.fade = 0; }
  leave() { Game.fade = this._fade || 0; }
  update() { this.t++; if (this.t > 40 && (Input.ok() || this.t > (this.o.time || 400))) { Game.pop(this); this.res(); } }
  draw() {
    drawStars(this.o.top || '#02030c', this.o.bot || '#141040');
    const im = this.o.img && IMG[this.o.img];
    if (im) { const s = this.o.scale || 1.4; ctx.globalAlpha = Math.min(1, this.t / 40); ctx.drawImage(im, W / 2 - im.width * s / 2, 300 - im.height * s / 2 + Math.sin(this.t / 40) * 4, im.width * s, im.height * s); ctx.globalAlpha = 1; }
    if (this.o.caption) wrapText(this.o.caption, 860, 14).forEach((l, i) => text(l, W / 2, 560 + i * 26, '#fff', 14, 'center'));
  }
}
function card(o) { return new Promise(res => Game.push(new CardScene(o, res))); }
