'use strict';
// ---------------------------------------------------------------------------
// Battle system: Active Time Battle. Every fighter has a gauge that fills with
// speed; a full gauge means it's their turn. In "Wait" mode time pauses while
// you are inside a sub-menu (skills, items, targets).
// ---------------------------------------------------------------------------
const FIELD_H = 432;
const GAUGE_MAX = 1000;
const STATUS_LABEL = { poison: 'Poison', sleep: 'Sleep', blind: 'Blind', fear: 'Fear', doom: 'Doom', stop: 'Stop', silence: 'Silence' };
function startBattle(opts) {
  return new Promise(async res => {
    Audio2.sfx('enc');
    Audio2.music(opts.music || 'battle');
    await battleSwirl();
    const b = new BattleScene(opts, res);
    Game.push(b);
    await fadeIn(10);
  });
}
async function battleSwirl() {
  Game.fadeColor = '#fff';
  for (let i = 0; i < 3; i++) { await tween(5, k => Game.fade = k * 0.8); await tween(5, k => Game.fade = 0.8 * (1 - k)); }
  await fadeOut(14, '#000');
}
// Enemy art: b_<art> (boss) or m_<art>. Chapter bosses without art yet use `ph`, a scaled placeholder.
const _phCache = {};
function enemyImg(d) {
  if (IMG['b_' + d.art]) return recolored('b_' + d.art, IMG['m_' + d.art] ? null : d.tint);
  if (d.ph) {
    const k = d.art; if (_phCache[k]) return _phCache[k];
    let src = d.ph.look ? chibi(d.ph.look, 'right', 0) : recolored('m_' + d.ph.art, d.ph.tint);
    if (d.ph.silhouette) src = flashed(src, d.ph.silhouette);
    const c = mkCanvas(Math.round(src.width * d.ph.scale), Math.round(src.height * d.ph.scale)), x = c.getContext('2d');
    x.imageSmoothingEnabled = false; x.drawImage(src, 0, 0, c.width, c.height);
    return (_phCache[k] = c);
  }
  return recolored('m_' + d.art, d.tint);
}

class BattleScene {
  constructor(opts, res) {
    this.opts = opts; this.res = res; this.opaque = true; this.bg = opts.bg || 'plains';
    const counts = {}, seen = {};
    for (const id of opts.enemies) counts[id] = (counts[id] || 0) + 1;
    this.enemies = opts.enemies.map(id => {
      const d = ENEMIES[id]; seen[id] = (seen[id] || 0) + 1;
      const name = counts[id] > 1 ? `${d.name} ${String.fromCharCode(64 + seen[id])}` : d.name;
      return { id, d, name, hp: d.hp, mhp: d.hp, status: {}, img: enemyImg(d), x: 0, y: 0, dying: 0, hurt: 0, blink: 0, gone: false, uses: {}, enemy: true,
        gauge: rnd(0, 500), buff: {}, acted: 0, saidHalf: false };
    });
    this.layout();
    this.pb = new Map(S().party.map(m => [m, { gauge: rnd(200, 700), ready: false, queued: false, defend: false, guard: false, protect: 0, haste: false, regen: false, jumping: null, ox: 0, oy: 0, hurt: 0, cast: 0, win: false }]));
    for (const m of S().party) if (!alive(m)) this.pb.get(m).gauge = 0;
    this.msg = ''; this.nums = []; this.parts = [];
    this.ui = null; this.readyList = []; this.queue = []; this.busy = false; this.result = null; this.started = false; this.reserved = {};
    S().battles++;
    this.intro();
  }
  layout() {
    const cols = []; let col = { items: [], h: 0, w: 0 };
    for (const e of this.enemies) {
      const h = e.img.height, w = e.img.width;
      if (col.items.length && col.h + h > FIELD_H - 50) { cols.push(col); col = { items: [], h: 0, w: 0 }; }
      col.items.push(e); col.h += h + 14; col.w = Math.max(col.w, w);
    }
    cols.push(col);
    const totalW = cols.reduce((s, c) => s + c.w + 24, -24);
    let x = Math.max(24, 310 - totalW / 2);
    for (const c of cols) {
      let y = (FIELD_H - c.h) / 2 + 20 + 7;
      for (const e of c.items) { e.x = Math.round(x + (c.w - e.img.width) / 2); e.y = Math.round(y); y += e.img.height + 14; }
      x += c.w + 24;
    }
  }
  living() { return this.enemies.filter(e => e.hp > 0); }
  party() { return S().party; }
  standing() { return this.party().filter(m => alive(m) && !this.pb.get(m).jumping); }
  partyPos(i) { const n = this.party().length, sp = n > 3 ? 88 : n === 3 ? 118 : 140; return { x: 710 + i * 56, y: (n > 3 ? 150 : n === 3 ? 172 : 222) + i * sp }; }
  heroImg(m, pose) {
    if (!IMG[`${m.id}_${m.job}_sheet`] && !IMG[`${m.id}_sheet`] && !IMG[`${m.id}_${m.job}`] && !IMG[HEROES[m.id].img]) return chibiBattle(HEROES[m.id].look);
    // Sprite sheet override: assets/<hero>_<job>_sheet.png or assets/<hero>_sheet.png,
    // a single row of 10 equal frames (see HERO_POSES). Otherwise a still image:
    // assets/<hero>_<job>.png, falling back to assets/<hero>.png.
    const sheet = IMG[`${m.id}_${m.job}_sheet`] || IMG[`${m.id}_sheet`];
    if (sheet) return sheetFrame(sheet, HERO_POSES.length, HERO_POSES.indexOf(pose || 'idle1'));
    return IMG[`${m.id}_${m.job}`] || IMG[HEROES[m.id].img];
  }
  heroPose(m, i) {
    const b = this.pb.get(m);
    if (!alive(m)) return 'dead';
    if (b.win) return Math.floor(Game.frame / 12) % 2 ? 'victory' : 'idle1';
    if (b.hurt > 0) return 'hurt';
    if (b.cast > 0) return b.cast % 12 < 6 ? 'cast1' : 'cast2';
    if (b.ox < -10) return b.ox < -30 ? 'attack2' : 'attack1';
    if (b.ready) return 'ready';
    if (m.hp < stats(m).mhp / 4 || m.status.sleep) return 'kneel';
    return Math.floor(Game.frame / 30 + i) % 2 ? 'idle2' : 'idle1';
  }
  memberCenter(m) { const i = this.party().indexOf(m), p = this.partyPos(i), img = this.heroImg(m), b = this.pb.get(m); return { x: p.x + (b.ox || 0), y: p.y - (img ? img.height / 2 : 60) + (b.oy || 0) }; }
  enemyCenter(e) { return { x: e.x + e.img.width / 2, y: e.y + e.img.height / 2 }; }
  center(t) { return t.enemy ? this.enemyCenter(t) : this.memberCenter(t); }
  // ------------------------------------------------------------------ flow
  async intro() {
    await wait(12);
    const names = this.enemies.map(e => e.d.name), boss = this.enemies.find(e => e.d.boss);
    this.msg = boss ? `${boss.d.name}!` : (new Set(names).size === 1 && names.length > 1 ? `${names[0]}s appear!` : `${names[0]} appears!`);
    await wait(45);
    if (boss && boss.d.lines && boss.d.lines.start) { this.msg = boss.d.lines.start; await wait(90); }
    this.msg = '';
    this.started = true;
  }
  rate(agi, haste) { const sp = [0.55, 0.7, 0.85, 1, 1.2, 1.45][S().cfg.speed] || 1; return (agi + 24) * 0.2 * sp * (haste ? 1.5 : 1); }
  timeFlows() {
    if (!this.started || this.result || this.busy) return false;
    if (S().cfg.atb === 'wait' && this.ui && this.ui.kind !== 'cmd') return false;
    return true;
  }
  update() {
    for (const n of this.nums) n.t++;
    this.nums = this.nums.filter(n => n.t < 60);
    for (const p of this.parts) { p.x += p.vx; p.y += p.vy; p.vy += p.g || 0; p.life--; }
    this.parts = this.parts.filter(p => p.life > 0);
    for (const e of this.enemies) { if (e.hurt > 0) e.hurt--; if (e.blink > 0) e.blink--; if (e.dying > 0) { e.dying--; if (!e.dying) e.gone = true; } }
    for (const [, b] of this.pb) { if (b.hurt > 0) b.hurt--; if (b.cast > 0) b.cast--; }
    if (this.waitKey) { if (Input.ok() || Input.hit('b')) { const r = this.waitKey; this.waitKey = null; r(); } return; }
    if (this.result) return;
    if (this.timeFlows()) { this.tick(); this.check(); if (this.result) { this.finish(); return; } }
    if (!this.busy && this.queue.length) this.runNext();
    if (!this.ui && this.readyList.length && !this.result) this.openCmdMenu(this.readyList[0]);
    this.updateUI();
  }
  tick() {
    for (const m of this.party()) {
      const b = this.pb.get(m);
      if (!alive(m) || b.ready || b.queued) continue;
      if (m.status.stop) { if (--m.status.stop <= 0) { delete m.status.stop; this.num(m, 'Moving', '#e0e0ff'); } continue; }
      b.gauge += this.rate(stats(m).agi, b.haste) * (m.status.sleep ? 0.6 : 1);
      if (b.gauge < GAUGE_MAX) continue;
      b.gauge = GAUGE_MAX;
      this.turnStart(m, b);
    }
    for (const e of this.living()) {
      if (e.queued) continue;
      if (e.status.stop) { if (--e.status.stop <= 0) delete e.status.stop; continue; }
      e.gauge += this.rate(e.d.agi, e.buff.haste) * (e.status.sleep ? 0.6 : 1);
      if (e.gauge < GAUGE_MAX) continue;
      e.gauge = GAUGE_MAX;
      this.enemyTurnStart(e);
    }
  }
  turnStart(m, b) {
    b.defend = false; b.guard = false; b.counter = false;
    if (b.jumping) { b.queued = true; this.queue.push({ who: m, cmd: { type: 'land', target: b.jumping.target, mult: b.jumping.mult } }); return; }
    this.statusTick(m);
    if (!alive(m)) return;
    if (m.status.sleep) { b.gauge = 0; if (Math.random() < 0.35) { delete m.status.sleep; this.num(m, 'Awake', '#e0e0ff'); } return; }
    b.ready = true; this.readyList.push(m); Audio2.sfx('ready');
  }
  enemyTurnStart(e) {
    this.statusTick(e);
    if (e.hp <= 0) return;
    if (e.status.sleep) { e.gauge = 0; if (Math.random() < 0.3) { delete e.status.sleep; this.num(e, 'Awake', '#e0e0ff'); } return; }
    for (let k = 0; k < (e.d.actions || 1); k++) this.queue.push({ who: e, enemyAct: true, extra: k > 0 });
    e.queued = true;
  }
  statusTick(t) {
    const mhp = t.enemy ? t.mhp : stats(t).mhp;
    if (t.status.poison) { const d = Math.max(1, Math.floor(mhp / (t.enemy ? 20 : 14))); this.damage(t, d, '#b0ff70'); }
    if (!t.enemy && this.pb.get(t).regen && alive(t)) this.heal(t, Math.max(4, Math.floor(mhp / 14)));
    if (t.status.doom != null) { t.status.doom--; if (t.status.doom <= 0) { delete t.status.doom; this.num(t, 'Gate!', '#ff6060'); this.damage(t, 99999); } else this.num(t, `Doom ${t.status.doom}`, '#ff9090'); }
  }
  async runNext() {
    const a = this.queue.shift();
    if (a.who.enemy ? a.who.hp <= 0 : !alive(a.who)) { if (!a.who.enemy) this.pb.get(a.who).queued = false; return; }
    this.busy = true;
    try {
      if (a.enemyAct) await this.enemyAct(a.who);
      else await this.partyAct(a.who, a.cmd);
    } catch (err) { console.error(err); }
    if (a.who.enemy) { if (!this.queue.some(q => q.who === a.who)) { a.who.gauge = 0; a.who.queued = false; } a.who.acted++; }
    else { const b = this.pb.get(a.who); b.queued = false; if (!b.jumping) b.gauge = 0; }
    this.check();
    if (this.pendingReveal) { this.pendingReveal = false; setFlag('lunaBattleSeen'); addFlag('lunaCaught'); const who = member('miasma') ? 'Miasma' : 'Raine'; this.msg = `${who}: ...Did Luna just GROWL?`; await wait(80); this.msg = 'Luna: Knight technique! Very advanced! They teach it in... knight school.'; await wait(90); this.msg = ''; }
    await this.midLines();
    this.busy = false;
    if (this.result) this.finish();
  }
  async midLines() {
    for (const e of this.living()) {
      if (e.d.boss && !e.saidHalf && e.hp < e.mhp / 2) { e.saidHalf = true; if (e.d.lines && e.d.lines.half) { this.msg = e.d.lines.half; Game.flash = 8; await wait(90); this.msg = ''; } }
    }
    if (this.opts.turnLimit && this.enemies.reduce((s, e) => s + e.acted, 0) >= this.opts.turnLimit && !this.result) this.result = 'scripted';
  }
  check() {
    if (this.result) return;
    if (!this.living().length) this.result = 'win';
    else if (!this.party().some(alive)) this.result = this.opts.cantLose ? 'scripted' : 'lose';
  }
  // ------------------------------------------------------------------ command menus
  openCmdMenu(m) {
    const J = JOBS[m.job], inn = INNATE[HEROES[m.id].innate];
    const items = [{ text: 'Attack', k: 'attack' }];
    const hush = !!m.status.silence;
    if (J.cmd) items.push({ text: J.cmd, k: 'job', disabled: hush || !jobSkills(m).length });
    items.push({ text: inn.name, k: 'innate', disabled: hush || !innateSkills(m).length });
    items.push({ text: 'Item', k: 'item' }, { text: 'Defend', k: 'defend' }, { text: 'Flee', k: 'flee', disabled: !!this.opts.noRun });
    const menu = new ListMenu(items, { x: 12, y: 424, w: 300, rowH: 27, rows: 6, size: 14 });
    menu.h = 206;
    this.ui = { kind: 'cmd', menu, m };
  }
  closeFor(m) {
    const b = this.pb.get(m); b.ready = false;
    this.readyList = this.readyList.filter(x => x !== m);
    this.ui = null;
  }
  setCmd(m, cmd) {
    const b = this.pb.get(m);
    if (cmd.type === 'item') this.reserved[cmd.item] = (this.reserved[cmd.item] || 0) + 1;
    this.closeFor(m); b.queued = true;
    this.queue.push({ who: m, cmd });
  }
  target(side, cb, back, o = {}) {
    let list;
    if (side === 'enemy') list = this.living();
    else list = this.party().filter(m => o.dead ? !alive(m) : alive(m) && !this.pb.get(m).jumping);
    if (!list.length) { Audio2.sfx('error'); return; }
    const prev = this.ui;
    this.ui = { kind: 'target', side, list, index: 0, cb, back, m: prev && prev.m, under: prev && prev.menu };
  }
  updateUI() {
    const u = this.ui; if (!u) return;
    if (!alive(u.m) || (this.result)) { this.closeFor(u.m); return; }
    if (u.kind === 'cmd') {
      if (Input.hit('b') && this.readyList.length > 1) { // switch to the next ready hero
        Audio2.sfx('cursor'); this.readyList.push(this.readyList.shift()); this.ui = null; return;
      }
      const r = u.menu.update(); if (!r || r.cancel) return;
      const m = u.m, k = r.select.k, back = () => this.openCmdMenu(m);
      if (k === 'attack') this.target('enemy', t => this.setCmd(m, { type: 'attack', target: t }), back);
      if (k === 'defend') this.setCmd(m, { type: 'defend' });
      if (k === 'flee') this.setCmd(m, { type: 'flee' });
      if (k === 'job') this.openSkillMenu(m, jobSkills(m), JOBS[m.job].cmd);
      if (k === 'innate') this.openSkillMenu(m, innateSkills(m), INNATE[HEROES[m.id].innate].name);
      if (k === 'item') this.openItemMenu(m);
    } else if (u.kind === 'list') {
      const r = u.menu.update();
      if (u.menu.cur && u.menu.cur.desc) this.hint = u.menu.cur.desc;
      if (!r) return;
      if (r.cancel) { this.hint = ''; this.openCmdMenu(u.m); return; }
      this.hint = '';
      u.pick(r.select);
    } else if (u.kind === 'target') {
      u.list = u.list.filter(t => !t.enemy || t.hp > 0);
      if (!u.list.length) { u.back(); return; }
      const n = u.list.length;
      u.index = Math.min(u.index, u.list.length - 1);
      if (Input.rep('down') || Input.rep('right')) { u.index = (u.index + 1) % n; Audio2.sfx('cursor'); }
      if (Input.rep('up') || Input.rep('left')) { u.index = (u.index + n - 1) % n; Audio2.sfx('cursor'); }
      if (Input.ok()) { Audio2.sfx('ok'); u.cb(u.list[u.index]); }
      else if (Input.cancel()) { Audio2.sfx('cancel'); u.back(); }
    }
  }
  openSkillMenu(m, ids, title) {
    const items = ids.map(id => { const s = SKILLS[id]; const cost = s.hpCost ? `${Math.round(s.hpCost * 100)}%HP` : s.mp; return { text: s.name, right: cost, id, desc: s.desc, disabled: m.mp < s.mp }; });
    const menu = new ListMenu(items, { x: 12, y: 432, w: 936, cols: 2, rows: 4, rowH: 32, title: `${title}   MP ${m.mp}/${stats(m).mmp}`, size: 14 });
    menu.h = 198;
    const back = () => this.openSkillMenu(m, ids, title);
    this.ui = { kind: 'list', menu, m, pick: it => {
      const sk = SKILLS[it.id], set = t => this.setCmd(m, { type: 'skill', skill: it.id, target: t });
      if (sk.target === 'enemy') this.target('enemy', set, back);
      else if (sk.target === 'ally') this.target('ally', set, back);
      else if (sk.target === 'dead') this.target('ally', set, back, { dead: true });
      else set(null);
    } };
  }
  openItemMenu(m) {
    const items = Object.entries(S().items).filter(([id]) => ITEMS[id].battle).map(([id, n]) => { const left = n - (this.reserved[id] || 0); return { text: ITEMS[id].name, right: left, id, desc: ITEMS[id].desc, disabled: left <= 0 }; });
    if (!items.length) { Audio2.sfx('error'); this.flashMsg('No usable items.'); return; }
    const menu = new ListMenu(items, { x: 12, y: 432, w: 936, cols: 2, rows: 4, rowH: 32, size: 14 }); menu.h = 198;
    const back = () => this.openItemMenu(m);
    this.ui = { kind: 'list', menu, m, pick: it => {
      const d = ITEMS[it.id], set = t => this.setCmd(m, { type: 'item', item: it.id, target: t });
      if (d.target === 'ally') this.target('ally', set, back);
      else if (d.target === 'dead') this.target('ally', set, back, { dead: true });
      else set(null);
    } };
  }
  flashMsg(s) { this.msg = s; setTimeout(() => { if (this.msg === s) this.msg = ''; }, 900); }
  say(m, n = 36) { this.msg = m; return wait(n); }
  num(t, v, col = '#fff') { const c = this.center(t); this.nums.push({ x: c.x + rnd(-10, 10), y: c.y, v, col, t: 0 }); }
  kill(t) {
    if (t.enemy) { t.hp = 0; t.dying = t.d.boss ? 70 : 26; Audio2.sfx(t.d.boss ? 'boom' : 'die'); if (t.d.boss) Game.shake = 30; this.queue = this.queue.filter(q => q.who !== t); }
    else {
      const b0 = this.pb.get(t);
      if (b0.reraise) { b0.reraise = false; t.hp = Math.max(1, Math.floor(stats(t).mhp / 4)); t.status = {}; this.num(t, 'Rise!', '#ffd060'); this.spawnFx('holy', this.memberCenter(t)); Audio2.sfx('holy'); return; }
      t.hp = 0; t.status = {}; const b = this.pb.get(t);
      Object.assign(b, { gauge: 0, ready: false, queued: false, defend: false, guard: false, protect: 0, haste: false, regen: false, jumping: null, oy: 0, might: false, counter: false });
      this.readyList = this.readyList.filter(x => x !== t); this.queue = this.queue.filter(q => q.who !== t);
      if (this.ui && this.ui.m === t) this.ui = null;
    }
  }
  retarget(t, side) {
    if (side === 'enemy') { if (t && t.hp > 0) return t; return this.living()[0]; }
    if (t && alive(t) && !this.pb.get(t).jumping) return t; return this.standing()[0];
  }
  damage(t, d, col) {
    d = Math.max(0, Math.floor(d));
    t.hp = Math.max(0, t.hp - d); this.num(t, d, col || '#fff');
    if (t.enemy) t.hurt = 14; else this.pb.get(t).hurt = 16;
    if (t.status.sleep && Math.random() < 0.5) delete t.status.sleep;
    if (t.hp <= 0) this.kill(t);
  }
  heal(t, v) { const mhp = t.enemy ? t.mhp : stats(t).mhp; v = Math.max(0, Math.min(mhp - t.hp, Math.floor(v))); t.hp += v; this.num(t, v, '#70ff90'); }
  elemMult(t, elem) {
    if (!elem || !t.enemy) return 1;
    if (t.d.weak && t.d.weak.includes(elem)) return 1.6;
    if (t.d.resist && t.d.resist.includes(elem)) return 0.4;
    return 1;
  }
  // ------------------------------------------------------------------ party actions
  physDamage(m, t, mult = 1, noMiss = false, elem) {
    const st = stats(m), b = this.pb.get(m);
    const chance = clamp((st.hit - (t.d.eva || Math.floor(t.d.agi / 3))) / 100, 0.1, 0.99) * (m.status.blind ? 0.5 : 1);
    if (!noMiss && !t.status.sleep && Math.random() > chance) return null;
    let d = st.atk * (1 + Math.random() * 0.5) - t.d.def;
    let crit = false; if (Math.random() < (m.job === 'masquer' ? 0.12 : 0.05)) { d = st.atk * 2 - t.d.def / 2; crit = true; }
    d = Math.max(1, d) * mult * this.elemMult(t, elem || st.elem) * (m.status.fear ? 0.6 : 1) * (t.buff.def ? 0.7 : 1) * (b.might ? 1.5 : 1);
    return { d: Math.round(d), crit };
  }
  async lunge(m) { const b = this.pb.get(m); await tween(8, k => b.ox = -40 * k); }
  async unlunge(m) { const b = this.pb.get(m); await tween(8, k => b.ox = -40 * (1 - k)); b.ox = 0; }
  async partyAct(m, c) {
    const b = this.pb.get(m);
    if (c.type === 'item') this.reserved[c.item] = Math.max(0, (this.reserved[c.item] || 1) - 1);
    if (c.type === 'land') return this.land(m, c);
    if (c.type === 'skill' && m.status.silence) { this.msg = `${m.name} is silenced!`; this.num(m, 'Silence', '#c0a0ff'); await wait(40); this.msg = ''; return; }
    if (c.type !== 'defend') await this.lunge(m);
    if (c.type === 'attack') {
      const t = this.retarget(c.target, 'enemy'); if (!t) return this.unlunge(m);
      this.msg = m.name; this.spawnFx('slash', this.enemyCenter(t)); await wait(10);
      const r = this.physDamage(m, t);
      if (!r) { Audio2.sfx('miss'); this.num(t, 'Miss', '#c0c0c0'); }
      else { Audio2.sfx(r.crit ? 'crit' : 'hit'); if (r.crit) this.msg = 'Critical hit!'; this.damage(t, r.d); }
      await wait(26);
    } else if (c.type === 'defend') {
      b.defend = true; this.num(m, 'Defend', '#a8c8ff'); await wait(20);
    } else if (c.type === 'flee') {
      await this.tryFlee(m, false);
    } else if (c.type === 'item') {
      if (!S().items[c.item]) await this.say('Out of that item!');
      else await this.useItem(m, c.item, c.target);
    } else if (c.type === 'skill') {
      await this.useSkill(m, SKILLS[c.skill], c.target);
    }
    if (!b.jumping) await this.unlunge(m);
    this.msg = '';
  }
  async tryFlee(m, sure) {
    this.msg = `${m.name} looks for a way out...`; await wait(20);
    if (this.opts.noRun) { await this.say("Can't escape!", 36); return; }
    const pa = this.standing().reduce((s, x) => s + stats(x).agi, 0) / Math.max(1, this.standing().length);
    const ea = this.living().reduce((s, e) => s + e.d.agi, 0) / Math.max(1, this.living().length);
    if (sure || Math.random() < clamp(0.6 + (pa - ea) / 40, 0.2, 0.95)) { Audio2.sfx('run'); await this.say('Escaped!', 30); this.result = 'run'; }
    else await this.say("Couldn't escape!", 36);
  }
  async useSkill(m, sk, target) {
    const st = stats(m), b = this.pb.get(m);
    if (m.mp < sk.mp) { await this.say(`Not enough MP!`); return; }
    m.mp -= sk.mp;
    if (sk.hpCost) { const cost = Math.max(1, Math.floor(st.mhp * sk.hpCost)); m.hp = Math.max(1, m.hp - cost); this.num(m, cost, '#ff9090'); }
    this.msg = sk.name;
    if (sk.kind === 'guard') { b.guard = true; this.spawnFx('buff', this.memberCenter(m)); Audio2.sfx('heal'); this.num(m, 'Guard', '#a8c8ff'); await wait(30); return; }
    if (sk.kind === 'flee') return this.tryFlee(m, true);
    if (sk.kind === 'jump') {
      const t = this.retarget(target, 'enemy'); if (!t) return;
      Audio2.sfx('run'); await tween(14, k => b.oy = -500 * k * k);
      b.jumping = { target: t, mult: sk.mult }; b.gauge = GAUGE_MAX * 0.35;
      this.msg = ''; return;
    }
    if (sk.kind === 'steal' || sk.kind === 'mug') {
      const t = this.retarget(target, 'enemy'); if (!t) return;
      this.spawnFx('slash', this.enemyCenter(t)); await wait(16);
      if (sk.kind === 'mug') { const r = this.physDamage(m, t, 1, true); Audio2.sfx('hit'); this.damage(t, r.d); await wait(16); }
      if (t.d.steal && !t.stolen && Math.random() < 0.5 + (st.agi - t.d.agi) / 60) { t.stolen = true; addItem(t.d.steal); Audio2.sfx('chest'); await this.say(`Stole ${itemInfo(t.d.steal).name}!`, 44); }
      else { Audio2.sfx('miss'); await this.say(t.stolen || !t.d.steal ? 'Nothing to steal!' : "Couldn't steal anything.", 40); }
      return;
    }
    if (sk.reveal && m.id === 'luna' && !flag('lunaBattleSeen')) this.pendingReveal = true;
    if (sk.kind === 'phys') {
      const ts = sk.target === 'enemies' ? this.living() : [this.retarget(target, 'enemy')].filter(Boolean);
      for (const t of ts) this.spawnFx(sk.fx || 'slash', this.enemyCenter(t));
      Audio2.sfx(sk.fx === 'dark' ? 'dark' : sk.fx === 'fire' ? 'fire' : 'slash'); await wait(18);
      for (let h = 0; h < (sk.hits || 1); h++) {
        const vmult = sk.vengeance ? 1 + 2 * (1 - m.hp / st.mhp) : 1;
        for (const t of ts) { if (t.hp <= 0) continue; const r = this.physDamage(m, t, sk.mult * vmult, true, sk.elem); Audio2.sfx(r.crit ? 'crit' : 'hit'); this.damage(t, r.d); }
        await wait(16);
      }
      await wait(20); return;
    }
    if (sk.kind === 'lancet') {
      const t = this.retarget(target, 'enemy'); if (!t) return;
      this.spawnFx('dark', this.enemyCenter(t)); Audio2.sfx('dark'); await wait(24);
      const r = this.physDamage(m, t, 0.8, true); this.damage(t, r.d); this.heal(m, r.d / 2);
      const mpGain = Math.min(stats(m).mmp - m.mp, rnd(3, 8)); m.mp += mpGain; await wait(34); return;
    }
    if (sk.reveal && m.id === 'luna' && !flag('lunaBattleSeen')) this.pendingReveal = true;
    // magic-like skills
    b.cast = 30; this.spawnFx('cast', this.memberCenter(m)); Audio2.sfx('cast');
    await wait(22);
    let targets;
    if (sk.target === 'enemy') targets = [this.retarget(target, 'enemy')];
    else if (sk.target === 'enemies') targets = this.living();
    else if (sk.target === 'ally') targets = [this.retarget(target, 'ally')];
    else if (sk.target === 'dead') targets = [target];
    else if (sk.target === 'allies') targets = this.standing();
    else targets = [m];
    targets = targets.filter(Boolean);
    Audio2.sfx(FX_SFX[sk.fx] || 'hit');
    for (const t of targets) this.spawnFx(sk.fx, this.center(t));
    if (sk.fx === 'roar') Game.shake = 20;
    await wait(26);
    for (const t of targets) this.applySkill(m, st, sk, t, targets.length);
    await wait(34);
  }
  applySkill(m, st, sk, t, n) {
    const split = n > 1 ? 0.75 : 1;
    if (sk.kind === 'dmg' || sk.kind === 'drain') {
      if (t.hp <= 0) return;
      let d = sk.pow * (1 + st.mag / 28) * (0.9 + Math.random() * 0.25) * split;
      if (!sk.pierce) d -= (t.d.mdef || 0) * 0.6;
      d = Math.max(1, d) * this.elemMult(t, sk.elem);
      this.damage(t, d);
      if (sk.kind === 'drain') this.heal(m, d / 2);
      if (sk.status && t.hp > 0 && !(t.d.immune || []).includes(sk.status) && Math.random() * 100 < sk.chance) { t.status[sk.status] = sk.status === 'doom' ? 3 : true; }
    } else if (sk.kind === 'status') {
      if (t.hp <= 0) return;
      const imm = (t.d.immune || []).includes(sk.status) || (sk.status === 'doom' && t.d.boss);
      if (imm || Math.random() * 100 > sk.chance - (t.d.boss ? 25 : 0)) this.num(t, 'Miss', '#c0c0c0');
      else { t.status[sk.status] = sk.status === 'doom' ? 3 : true; this.num(t, STATUS_LABEL[sk.status], '#ffd060'); }
    } else if (sk.kind === 'heal') {
      if (!alive(t)) return;
      this.heal(t, healAmount(sk, st.mag) * split);
      if (sk.cures) for (const s of sk.cures) delete t.status[s];
      if (sk.buff === 'regen') this.pb.get(t).regen = true;
    } else if (sk.kind === 'cure') { if (alive(t)) { for (const s of sk.cures) delete t.status[s]; this.num(t, 'Cured', '#70ff90'); } }
    else if (sk.kind === 'revive') { if (!alive(t)) { t.hp = Math.max(1, Math.floor(stats(t).mhp / (sk.full ? 2 : 4))); t.status = {}; this.pb.get(t).gauge = 0; this.num(t, t.hp, '#70ff90'); } else this.num(t, 'Miss', '#c0c0c0'); }
    else if (sk.kind === 'buff') {
      const pb = this.pb.get(t); if (!alive(t)) return;
      if (sk.buff === 'protect') { pb.protect = 1; this.num(t, 'Protect', '#ffe070'); }
      if (sk.buff === 'haste') { pb.haste = true; this.num(t, 'Haste', '#ffe070'); }
      if (sk.buff === 'regen') { pb.regen = true; this.num(t, 'Regen', '#70ff90'); }
      if (sk.buff === 'counter') { pb.counter = true; this.num(t, 'Counter', '#ff9070'); }
      if (sk.buff === 'might') { pb.might = true; this.num(t, 'Might', '#ff9070'); }
      if (sk.buff === 'reraise') { pb.reraise = true; this.num(t, 'Reraise', '#ffd060'); }
    }
  }
  async land(m, c) {
    const b = this.pb.get(m), t = this.retarget(c.target, 'enemy');
    b.jumping = null;
    if (!t) { await tween(12, k => b.oy = -500 * (1 - k)); b.oy = 0; return; }
    const ec = this.enemyCenter(t);
    b.ox = ec.x - this.partyPos(this.party().indexOf(m)).x;
    await tween(10, k => b.oy = -500 * (1 - k) * (1 - k));
    b.oy = 0; Game.shake = 10; this.spawnFx('slash', ec); this.spawnFx('boom', ec);
    const r = this.physDamage(m, t, c.mult, true); Audio2.sfx('crit'); this.damage(t, r.d);
    await wait(24); await tween(10, k => b.ox = b.ox * (1 - k)); b.ox = 0;
  }
  async useItem(m, id, target) {
    const d = ITEMS[id]; removeItem(id);
    this.msg = d.name; await wait(16);
    if (d.kind === 'bomb') {
      Audio2.sfx('boom'); Game.shake = 16;
      for (const e of this.living()) this.spawnFx('boom', this.enemyCenter(e));
      await wait(20); for (const e of this.living()) this.damage(e, rnd(d.pow, d.pow * 2));
    } else {
      const t = d.kind === 'revive' ? target : this.retarget(target, 'ally');
      if (!t) { await wait(10); return; }
      this.spawnFx('heal', this.memberCenter(t)); Audio2.sfx('heal'); await wait(20);
      const hp0 = t.hp, mp0 = t.mp, r = applyItem(d, t);
      if (!r.ok) this.num(t, 'Miss', '#c0c0c0');
      else if (d.kind === 'heal' || d.kind === 'revive') { this.num(t, t.hp - hp0, '#70ff90'); if (d.kind === 'revive') this.pb.get(t).gauge = 0; }
      else if (d.kind === 'mp') this.num(t, `${t.mp - mp0} MP`, '#80c0ff');
      else this.num(t, 'Cured', '#70ff90');
    }
    await wait(34); this.msg = '';
  }
  // ------------------------------------------------------------------ enemy actions
  pickPartyTarget() {
    const al = this.standing(); if (!al.length) return null;
    return wpick(al.map((m, i) => ({ m, w: this.pb.get(m).defend ? 2 : 3 }))).m;
  }
  coverFor(t) { // an Oathblade on Guard steps in front of the hit
    if (!t) return t;
    const g = this.standing().find(x => x !== t && this.pb.get(x).guard);
    if (g && t.hp < stats(t).mhp * 0.6) { this.num(g, 'Cover', '#a8c8ff'); return g; }
    return t;
  }
  enemyDefMult(t) { const b = this.pb.get(t); return (b.defend ? 0.5 : 1) * (b.protect ? 0.67 : 1) * (b.guard ? 0.75 : 1); }
  async enemyAct(e) {
    const d = e.d;
    let act = { type: 'attack' };
    const pool = (d.phase2 && e.hp < e.mhp / 2) ? d.phase2 : d.acts;
    if (pool) {
      const opts = pool.filter(a => !(a.once && e.uses[a.name]) && !(a.uses && (e.uses[a.name] || 0) >= a.uses) && !(a.when === 'hurt' && e.hp > e.mhp / 2));
      act = wpick(opts.length ? opts : [{ type: 'attack' }]);
    }
    if (act.name) e.uses[act.name] = (e.uses[act.name] || 0) + 1;
    e.blink = 16; await wait(18);
    const fear = e.status.fear ? 0.6 : 1;
    if (act.type === 'attack' || act.type === 'strike') {
      const t = this.coverFor(this.pickPartyTarget()); if (!t) return;
      const ts = stats(t);
      this.msg = act.name || e.name;
      this.spawnFx(act.fx || 'claw', this.memberCenter(t));
      const chance = clamp((95 - ts.eva) / 100, 0.3, 0.97) * (e.status.blind ? 0.45 : 1);
      await wait(8);
      if (!t.status.sleep && Math.random() > chance) { Audio2.sfx('miss'); this.num(t, 'Miss', '#c0c0c0'); }
      else {
        let dmg = (d.atk * (1 + Math.random() * 0.5) * (act.mult || 1) - ts.def) * fear * this.enemyDefMult(t);
        Audio2.sfx(act.mult ? 'crit' : 'hit'); if (act.mult) Game.shake = 12;
        this.damage(t, Math.max(1, dmg));
        if (alive(t) && this.pb.get(t).counter && e.hp > 0) { await wait(14); this.num(t, 'Counter!', '#ff9070'); this.spawnFx('slash', this.enemyCenter(e)); const cr = this.physDamage(t, e, 1, true); Audio2.sfx('hit'); this.damage(e, cr.d); }
        const tc = d.touch;
        if (tc && alive(t) && Math.random() * 100 < tc.chance && !t.status[tc.status] && !ts.immune.includes(tc.status)) { t.status[tc.status] = true; await wait(12); this.num(t, STATUS_LABEL[tc.status], '#ffd060'); Audio2.sfx('status'); }
      }
      await wait(30);
    } else if (act.type === 'spell') {
      this.msg = act.name;
      const ts = act.target === 'all' ? this.standing() : [this.pickPartyTarget()].filter(Boolean);
      Audio2.sfx(FX_SFX[act.fx] || 'dark');
      if (act.fx === 'boom' || act.fx === 'roar') Game.shake = 20;
      for (const t of ts) this.spawnFx(act.fx, this.memberCenter(t));
      await wait(28);
      for (const t of ts) {
        const md = stats(t).mdef, split = ts.length > 1 ? 0.8 : 1;
        this.damage(t, Math.max(1, (act.pow * (1 + Math.random() * 0.3) + d.atk * 0.4 - md * 0.5) * split * (this.pb.get(t).defend ? 0.75 : 1)));
      }
      await wait(34);
    } else if (act.type === 'status') {
      this.msg = act.name;
      const ts = act.target === 'all' ? this.standing() : [this.pickPartyTarget()].filter(Boolean);
      for (const t of ts) this.spawnFx(act.fx || 'smoke', this.memberCenter(t));
      Audio2.sfx('status'); await wait(26);
      for (const t of ts) {
        const st = stats(t);
        if (!st.immune.includes(act.status) && Math.random() * 100 < act.chance - st.spr / 3) { t.status[act.status] = act.status === 'doom' ? 4 : act.status === 'stop' ? (act.frames || 300) : true; this.num(t, STATUS_LABEL[act.status], '#ffd060'); }
        else this.num(t, 'Miss', '#c0c0c0');
      }
      await wait(30);
    } else if (act.type === 'drain') {
      const t = this.pickPartyTarget(); if (!t) return;
      this.msg = act.name; this.spawnFx('dark', this.memberCenter(t)); Audio2.sfx('dark'); await wait(24);
      const dmg = rnd(act.pow, act.pow * 1.5); this.damage(t, dmg); this.heal(e, dmg); await wait(34);
    } else if (act.type === 'heal') {
      this.msg = act.name; this.spawnFx('heal', this.enemyCenter(e)); Audio2.sfx('heal'); await wait(20); this.heal(e, act.pow); await wait(34);
    } else if (act.type === 'buff') {
      this.msg = act.name; this.spawnFx('buff', this.enemyCenter(e)); Audio2.sfx('heal'); await wait(20); e.buff.def = true; this.num(e, 'Def Up', '#ffe070'); await wait(30);
    }
    this.msg = '';
  }
  // ------------------------------------------------------------------ end
  async finish() {
    if (this.finishing) return; this.finishing = true;
    this.ui = null; this.readyList = []; this.queue = [];
    const done = r => { this.res(r); };
    for (const m of this.party()) { const b = this.pb.get(m); b.oy = 0; b.ox = 0; b.jumping = null; }
    if (this.result === 'win') {
      await wait(this.enemies.some(e => e.d.boss) ? 60 : 24);
      Audio2.music('victory');
      const exp = this.enemies.reduce((s, e) => s + e.d.exp, 0), gold = this.enemies.reduce((s, e) => s + e.d.gold, 0), jp = this.enemies.reduce((s, e) => s + (e.d.jp || 1), 0);
      S().gold += gold;
      for (const m of this.party()) this.pb.get(m).win = true;
      await this.message(`Victory!  ${exp} EXP   ${jp} JP   ${gold} gold`);
      for (const m of this.party()) {
        for (const l of gainExp(m, exp)) { Audio2.sfx('levelup'); await this.message(l); }
        for (const l of gainJp(m, jp)) { Audio2.sfx('levelup'); await this.message(l); }
      }
      for (const m of this.party()) { delete m.status.sleep; delete m.status.fear; delete m.status.doom; delete m.status.stop; delete m.status.silence; }
      await this.leave(); done('win');
    } else if (this.result === 'run') {
      await this.leave(12); done('run');
    } else if (this.result === 'scripted') {
      await wait(30); this.msg = '';
      for (const m of this.party()) if (!alive(m)) m.hp = 1;
      await this.leave(30); done('scripted');
    } else {
      Audio2.music(null); await this.message('The party has fallen...');
      await fadeOut(60);
      Game.pop(this); done('lose');
      Game.push(new GameOverScene());
      await fadeIn(30);
    }
  }
  async leave(n = 16) {
    await fadeOut(n); Game.pop(this);
    if (Game.field) Audio2.music(S().onShip ? 'sea' : musicFor(Game.field.map));
    await fadeIn(n);
  }
  message(m) { this.msg = m; return new Promise(r => { this.waitKey = r; }); }
  // ------------------------------------------------------------------ effects
  spawnFx(type, c) {
    const P = (n, f) => { for (let i = 0; i < n; i++) this.parts.push(f(i)); };
    const R = Math.random;
    switch (type) {
      case 'slash': P(3, i => ({ kind: 'line', x: c.x - 40 + i * 20, y: c.y - 40, vx: 0, vy: 0, life: 10, len: 80, col: '#fff' })); Audio2.sfx('slash'); break;
      case 'claw': P(3, i => ({ kind: 'line', x: c.x - 30 + i * 16, y: c.y - 30, vx: 0, vy: 0, life: 10, len: 60, col: '#ff8080' })); break;
      case 'fire': P(40, () => ({ x: c.x + (R() - 0.5) * 90, y: c.y + 40 - R() * 30, vx: (R() - 0.5) * 1.5, vy: -1.5 - R() * 3, life: 20 + R() * 20, s: 6 + R() * 8, col: pick(['#ff4020', '#ff9020', '#ffe060', '#ffffff']) })); break;
      case 'dark': P(36, i => { const a = i / 36 * Math.PI * 2, r = 70; return { x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r, vx: -Math.cos(a) * 2.4, vy: -Math.sin(a) * 2.4, life: 28, s: 8, col: pick(['#6020a0', '#a040ff', '#200830', '#40e0d0']) }; }); break;
      case 'ice': P(30, () => ({ x: c.x + (R() - 0.5) * 100, y: c.y - 70 - R() * 40, vx: 0, vy: 3 + R() * 3, life: 26, s: 6, col: pick(['#a0e8ff', '#ffffff', '#60b0ff']) })); break;
      case 'bolt': P(6, i => ({ kind: 'bolt', x: c.x + (R() - 0.5) * 60, y: c.y - 120, vx: 0, vy: 0, life: 12, len: 130, col: pick(['#ffffa0', '#ffffff', '#a0c0ff']) })); break;
      case 'water': P(40, i => { const a = i / 40 * Math.PI * 2; return { x: c.x + Math.cos(a) * 20, y: c.y + 30, vx: Math.cos(a) * 3, vy: -3 - R() * 3, g: 0.25, life: 30, s: 6, col: pick(['#40a0ff', '#a0e0ff', '#ffffff']), round: true }; }); break;
      case 'holy': P(30, () => ({ x: c.x + (R() - 0.5) * 80, y: c.y + 50, vx: 0, vy: -4 - R() * 3, life: 28, s: 5, col: pick(['#fff4b0', '#ffffff', '#ffd040']), star: true })); P(1, () => ({ kind: 'ring', x: c.x, y: c.y, vx: 0, vy: 0, life: 24, s: 10, col: '#ffe890' })); break;
      case 'wind': P(30, () => ({ x: c.x + 80 + R() * 40, y: c.y + (R() - 0.5) * 100, vx: -6 - R() * 4, vy: (R() - 0.5), life: 26, s: 5, col: pick(['#ffffff', '#c8f0ff', '#a0d0c0']) })); break;
      case 'poison': P(30, () => ({ x: c.x + (R() - 0.5) * 90, y: c.y + 30, vx: (R() - 0.5), vy: -1 - R() * 2, life: 34, s: 7 + R() * 6, col: pick(['#60c020', '#a0ff40', '#306010', '#b060ff']), round: true })); break;
      case 'smoke': P(26, () => ({ x: c.x + (R() - 0.5) * 100, y: c.y + (R() - 0.5) * 60, vx: (R() - 0.5), vy: -0.6, life: 40, s: 14 + R() * 12, col: pick(['rgba(60,60,70,0.7)', 'rgba(100,100,110,0.6)', 'rgba(30,30,40,0.8)']), round: true })); break;
      case 'heal': P(30, () => ({ x: c.x + (R() - 0.5) * 70, y: c.y + 40 - R() * 60, vx: 0, vy: -1.5 - R(), life: 30, s: 5, col: pick(['#80ffa0', '#ffffff', '#c0ffe0']), star: true })); break;
      case 'buff': P(24, i => { const a = i / 24 * Math.PI * 2; return { x: c.x + Math.cos(a) * 50, y: c.y + Math.sin(a) * 50, vx: 0, vy: -1, life: 30, s: 6, col: '#ffe070', star: true }; }); break;
      case 'acid': P(30, () => ({ x: c.x, y: c.y - 20, vx: (R() - 0.5) * 8, vy: -3 - R() * 3, g: 0.35, life: 30, s: 6, col: pick(['#90ff30', '#40c020', '#e0ff80']), round: true })); break;
      case 'light': P(30, i => { const a = i / 30 * Math.PI * 2; return { x: c.x, y: c.y, vx: Math.cos(a) * 4, vy: Math.sin(a) * 4, life: 20, s: 6, col: pick(['#ffffff', '#fff0a0']) }; }); break;
      case 'boom': P(40, () => { const a = R() * Math.PI * 2, v = 1 + R() * 5; return { x: c.x, y: c.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 20 + R() * 16, s: 8 + R() * 10, col: pick(['#ff6020', '#ffd040', '#ffffff', '#606060']), round: true }; }); break;
      case 'roar': for (const e of this.living()) this.spawnFx('light', this.enemyCenter(e)); break;
      case 'cast': P(20, i => { const a = i / 20 * Math.PI * 2; return { x: c.x + Math.cos(a) * 60, y: c.y + Math.sin(a) * 60, vx: -Math.cos(a) * 2.5, vy: -Math.sin(a) * 2.5, life: 24, s: 5, col: pick(['#ffffff', '#c0a0ff', '#80c0ff']), star: true }; }); break;
    }
  }
  // ------------------------------------------------------------------ draw
  draw() {
    ctx.drawImage(battleBg(this.bg), 0, 0);
    for (const e of this.enemies) {
      if (e.gone) continue;
      let img = e.img; const x = e.x, y = e.y;
      if (e.hurt > 0 && e.hurt % 4 < 2) img = flashed(e.img);
      if (e.blink > 0 && Math.floor(e.blink / 4) % 2) img = flashed(e.img);
      if (e.dying > 0) {
        const tot = e.d.boss ? 70 : 26, k = 1 - e.dying / tot;
        ctx.save(); ctx.globalAlpha = 1 - k;
        const im = flashed(e.img, e.d.boss && e.dying % 6 < 3 ? '#ffffff' : '#c02040');
        const cut = Math.floor(e.img.height * k);
        ctx.drawImage(im, 0, 0, e.img.width, e.img.height - cut, x, y + cut, e.img.width, e.img.height - cut);
        ctx.restore(); continue;
      }
      const breathe = e.d.boss ? Math.sin(Game.frame / 40) * 2 : 0;
      const alt = e.altImg !== undefined ? e.altImg : (e.altImg = IMG[(IMG['b_' + e.d.art] ? 'b_' : 'm_') + e.d.art + '_2'] ? recolored((IMG['b_' + e.d.art] ? 'b_' : 'm_') + e.d.art + '_2', e.d.tint) : null);
      if (alt && img === e.img && Math.floor(Game.frame / 30) % 2) img = alt;
      ctx.drawImage(img, x, y + breathe);
      let sx = x;
      for (const s of Object.keys(e.status)) { text(STATUS_LABEL[s] ? STATUS_LABEL[s].slice(0, 3) : s, sx, y - 12, '#ffd060', 10); sx += 44; }
    }
    this.party().forEach((m, i) => {
      const img = this.heroImg(m, this.heroPose(m, i)); if (!img) return;
      const p = this.partyPos(i), b = this.pb.get(m);
      let x = p.x - img.width / 2 + b.ox, y = p.y - img.height + b.oy;
      if (b.hurt > 0) x += (b.hurt % 4 < 2 ? -5 : 5);
      if (!alive(m) && (IMG[`${m.id}_${m.job}_sheet`] || IMG[`${m.id}_sheet`])) { ctx.drawImage(img, Math.round(x), Math.round(y)); return; }
      if (!alive(m)) {
        const k = 0.62; ctx.save(); ctx.globalAlpha = 0.7; ctx.translate(p.x + 10, p.y - img.width * k / 2); ctx.rotate(-Math.PI / 2); ctx.drawImage(flashed(img, '#4a3a4a'), -img.width * k / 2, -img.height * k / 2, img.width * k, img.height * k); ctx.restore(); return;
      }
      if (b.ready && this.ui && this.ui.m === m) x -= 24;
      const hurtPose = m.hp < stats(m).mhp / 4;
      const bob = b.win ? -Math.abs(Math.sin(Game.frame / 8)) * 10 : (Math.floor(Game.frame / 30 + i) % 2 ? 1 : 0) + (hurtPose ? 6 : 0);
      let im = img; if (b.hurt > 0 && b.hurt % 4 < 2) im = flashed(img, '#ff5050');
      if (b.cast > 0 && b.cast % 6 < 3) im = flashed(img, '#c8b0ff');
      if (m.status.poison && Game.frame % 40 < 6) im = flashed(img, '#80ff60');
      if (b.guard || b.defend) { ctx.fillStyle = 'rgba(160,200,255,0.25)'; ctx.fillRect(Math.round(x) - 8, Math.round(y) + 10, img.width + 16, img.height - 10); }
      ctx.drawImage(im, Math.round(x), Math.round(y + bob));
      if (m.status.sleep) text('Zz', x + img.width - 20, y + 10, '#e0e0ff', 12);
      if (m.status.stop) text('STOP', x + img.width / 2 - 20, y - 4, '#a0e0ff', 11);
      if (m.status.silence) text('...', x + img.width - 24, y + 26, '#c0a0ff', 14);
      if (b.ready && !this.busy && Math.floor(Game.frame / 20) % 2) text('▼', p.x, y - 16, JOBS[m.job].color, 12, 'center');
    });
    for (const p of this.parts) {
      ctx.globalAlpha = clamp(p.life / 15, 0, 1); ctx.fillStyle = p.col;
      if (p.kind === 'line') { ctx.strokeStyle = p.col; ctx.lineWidth = 4; ctx.beginPath(); const k = 1 - p.life / 10; ctx.moveTo(p.x, p.y + p.len * k * 0.2); ctx.lineTo(p.x + p.len * 0.5 * k + 10, p.y + p.len * k); ctx.stroke(); }
      else if (p.kind === 'bolt') { ctx.strokeStyle = p.col; ctx.lineWidth = 3; ctx.beginPath(); let yy = p.y, xx = p.x; ctx.moveTo(xx, yy); while (yy < p.y + p.len) { yy += 14; xx += (Math.random() - 0.5) * 24; ctx.lineTo(xx, yy); } ctx.stroke(); }
      else if (p.kind === 'ring') { ctx.strokeStyle = p.col; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p.x, p.y, (24 - p.life) * 5, 0, Math.PI * 2); ctx.stroke(); }
      else if (p.star) { const s = Math.round(p.s); ctx.fillRect(p.x - s, p.y - 1, s * 2, 3); ctx.fillRect(p.x - 1, p.y - s, 3, s * 2); }
      else { const s = Math.round(p.s); ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s); }
    }
    ctx.globalAlpha = 1;
    for (const n of this.nums) {
      const t = n.t, bounce = t < 20 ? -Math.sin(t / 20 * Math.PI) * 30 : 0;
      ctx.globalAlpha = t > 45 ? (60 - t) / 15 : 1;
      text(String(n.v), n.x, n.y - 20 + bounce, n.col, typeof n.v === 'number' ? 22 : 14, 'center');
      ctx.globalAlpha = 1;
    }
    if (this.ui && this.ui.kind === 'target') {
      const t = this.ui.list[this.ui.index];
      if (t) {
        if (t.enemy) { drawCursor(t.x - 6, t.y + t.img.height / 2 - 10); if (!this.msg) text(t.name, W / 2, 16, '#fff', 16, 'center'); }
        else { const c = this.memberCenter(t); drawCursor(c.x - 50, c.y); }
      }
    }
    this.drawUI();
  }
  drawUI() {
    const top = this.msg || this.hint;
    if (top) { const lines = wrapText(top, 880, 14); const h = 16 + lines.length * 24; drawWindow(12, 4, W - 24, h + 16); lines.forEach((l, i) => text(l, W / 2, 24 + i * 24, this.msg ? '#fff' : '#c8d0ff', 14, 'center')); if (this.waitKey && Math.floor(Game.frame / 15) % 2) text('▼', W - 50, h - 4, '#fff', 12); }
    drawWindow(12, 440, 300, 190);
    const groups = {}; for (const e of this.living()) groups[e.d.name] = (groups[e.d.name] || 0) + 1;
    Object.entries(groups).slice(0, 4).forEach(([n, c], i) => { text(n.length > 19 ? n.slice(0, 19) : n, 30, 466 + i * 38, '#fff', n.length > 16 ? 10 : 12); if (c > 1) text(`x${c}`, 294, 482 + i * 38, '#c8c8e0', 10, 'right'); });
    drawWindow(316, 440, 632, 190);
    const n = this.party().length, rowH = n > 3 ? 40 : 52;
    text('HP', 610, 446, '#8a8ab0', 10, 'right'); text('MP', 720, 446, '#8a8ab0', 10, 'right'); text('TIME', 880, 446, '#8a8ab0', 10, 'right');
    this.party().forEach((m, i) => {
      const y = 464 + i * rowH, st = stats(m), b = this.pb.get(m), cur = this.ui && this.ui.m === m;
      text(m.name, 340, y, !alive(m) ? '#ff6060' : cur ? '#ffe070' : '#fff', 14);
      const stl = !alive(m) ? 'KO' : Object.keys(m.status).map(s => (STATUS_LABEL[s] || s).slice(0, 3).toUpperCase()).join(' ') || (b.jumping ? 'JUMP' : '');
      if (stl) text(stl, 340, y + 20, '#ff9090', 10);
      text(`${m.hp}`, 610, y, m.hp <= st.mhp / 4 ? '#ffd040' : '#fff', 14, 'right');
      text(`${m.mp}`, 720, y, '#c8b0ff', 14, 'right');
      bar(470, y + 20, 140, 6, m.hp / st.mhp, m.hp <= st.mhp / 4 ? '#e0a020' : '#40d060');
      const full = b.ready || b.queued;
      bar(744, y + 4, 136, 12, b.gauge / GAUGE_MAX, full ? (Math.floor(Game.frame / 8) % 2 ? '#ffe070' : '#fff8c0') : '#5080ff');
    });
    if (this.ui && (this.ui.kind === 'cmd' || this.ui.kind === 'list')) this.ui.menu.draw();
    if (this.ui && this.ui.kind === 'target' && this.ui.under) this.ui.under.draw(false);
    if (this.ui && this.ui.kind === 'cmd') text(`${this.ui.m.name} · ${JOBS[this.ui.m.job].name}`, 24, 410, JOBS[this.ui.m.job].color, 12);
  }
}
// Fallback battle sprite for heroes with no art yet: their field sprite, scaled up.
const _chibiBattle = {};
function chibiBattle(look) {
  if (_chibiBattle[look]) return _chibiBattle[look];
  const src = chibi(look, 'left', 0), c = mkCanvas(src.width * 5, src.height * 5), x = c.getContext('2d');
  x.imageSmoothingEnabled = false; x.drawImage(src, 0, 0, c.width, c.height);
  return (_chibiBattle[look] = c);
}
const HERO_POSES = ['idle1', 'idle2', 'ready', 'attack1', 'attack2', 'cast1', 'cast2', 'hurt', 'kneel', 'dead', 'victory'];
const _sheetCache = new Map();
function sheetFrame(sheet, n, i) {
  const k = sheet.src + '#' + i; if (_sheetCache.has(k)) return _sheetCache.get(k);
  const fw = Math.floor(sheet.width / n), c = mkCanvas(fw, sheet.height);
  c.getContext('2d').drawImage(sheet, Math.max(0, i) * fw, 0, fw, sheet.height, 0, 0, fw, sheet.height);
  _sheetCache.set(k, c); return c;
}
const FX_SFX = { fire: 'fire', dark: 'dark', wind: 'wind', heal: 'heal', buff: 'heal', poison: 'status', smoke: 'status', acid: 'hit', roar: 'boom', ice: 'ice', bolt: 'bolt', water: 'water', holy: 'holy', light: 'holy', boom: 'boom' };
class GameOverScene {
  constructor() { this.opaque = true; this.t = 0; this.menu = new ListMenu([{ text: 'Load last save', disabled: !hasSave() }, { text: 'Return to title' }], { x: 330, y: 380, w: 300 }); this.menu.index = hasSave() ? 0 : 1; }
  update() { this.t++; if (this.t < 30) return; const r = this.menu.update(); if (r && r.select) { if (r.index === 0) continueGame(); else toTitle(); } }
  draw() { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); text('GAME OVER', W / 2, 220, '#c02030', 36, 'center'); text('Even a god can be replaced. You can too. Try again.', W / 2, 290, '#a0a0c0', 12, 'center'); if (this.t > 30) this.menu.draw(); }
}

// ---------------------------------------------------------------------------
// Battle backdrops (painted at 1/4 res, scaled up for a pixel look)
// ---------------------------------------------------------------------------
const _bgCache = {};
function battleBg(name) {
  if (_bgCache[name]) return _bgCache[name];
  if (IMG['bg_' + name]) { // painted override: assets/bg_<name>.png (960x440 recommended)
    const big = mkCanvas(W, FIELD_H + 8), bx = big.getContext('2d'); bx.drawImage(IMG['bg_' + name], 0, 0, W, FIELD_H + 8);
    return (_bgCache[name] = big);
  }
  const w = 240, h = 108, c = mkCanvas(w, h), x = c.getContext('2d');
  const R = srand(name.length * 999 + name.charCodeAt(0));
  const grad = (y0, y1, a, b) => { for (let y = y0; y < y1; y++) { x.fillStyle = mix(a, b, (y - y0) / Math.max(1, y1 - y0 - 1)); x.fillRect(0, y, w, 1); } };
  const hills = (base, amp, col, seed) => { x.fillStyle = col; for (let i = 0; i < w; i++) { const hh = base + Math.sin(i * 0.05 + seed) * amp + Math.sin(i * 0.13 + seed * 2) * amp * 0.4; x.fillRect(i, Math.round(hh), 1, h); } };
  const ground = (y0, a, b, lines) => { grad(y0, h, a, b); if (lines) for (let i = 0; i < 6; i++) { const y = y0 + Math.round(Math.pow(i / 6, 1.6) * (h - y0)); x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(0, y, w, 1); } };
  const tree = (tx, ty, s, col, trunk = '#3a2414') => { x.fillStyle = trunk; x.fillRect(tx - 1, ty, 2, s); x.fillStyle = col; for (let j = 0; j < s; j++) { const ww = Math.round((s - j) * 0.6); x.fillRect(tx - ww, ty - j, ww * 2 + 1, 1); } };
  const pillar = (px, top, bot, col) => { x.fillStyle = col; x.fillRect(px, top, 8, bot - top); x.fillStyle = shade(col, 1.3); x.fillRect(px, top, 2, bot - top); x.fillStyle = shade(col, 0.6); x.fillRect(px + 6, top, 2, bot - top); x.fillStyle = shade(col, 1.1); x.fillRect(px - 2, top, 12, 3); x.fillRect(px - 2, bot - 3, 12, 3); };
  const disc = (cx, cy, r, col) => { x.fillStyle = col; for (let j = -r; j <= r; j++) { const ww = Math.round(Math.sqrt(r * r - j * j)); x.fillRect(cx - ww, cy + j, ww * 2 + 1, 1); } };
  switch (name) {
    case 'plains': grad(0, 60, '#5aa0f0', '#ffe8c0'); x.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { const cx = R() * w, cy = 8 + R() * 25; x.fillRect(cx, cy, 20, 4); x.fillRect(cx + 4, cy - 3, 12, 3); } hills(44, 6, '#8aa06a', 1); hills(54, 4, '#6a9a3a', 3); ground(60, '#8ab83e', '#5a8a2a', true); break;
    case 'meadow': grad(0, 60, '#6ab0f0', '#fff0c8'); hills(48, 5, '#b0a040', 2); ground(58, '#d8b848', '#9a8a2a', true); x.fillStyle = '#ffe060'; for (let i = 0; i < 60; i++) x.fillRect(R() * w, 60 + R() * 48, 1, 2); break;
    case 'beach': grad(0, 50, '#5aa0f0', '#cfeaff'); grad(50, 68, '#3a78c8', '#6aa8e8'); ground(68, '#e2cc8c', '#c8b070', true); break;
    case 'forest': grad(0, 60, '#2a4a5a', '#8ab0b0'); for (let i = 0; i < 26; i++) tree(Math.round(R() * w), 40 + R() * 20, 18 + R() * 16, i % 2 ? '#c8d8d0' : '#9ab8a8', '#d8d8e0'); ground(62, '#4e8a4e', '#2a5a2e', true); x.fillStyle = 'rgba(200,220,255,0.18)'; x.fillRect(0, 40, w, 20); break;
    case 'deepwood': grad(0, 70, '#0a141e', '#2a4a4a'); for (let i = 0; i < 30; i++) tree(Math.round(R() * w), 44 + R() * 20, 20 + R() * 20, i % 2 ? '#1e3a34' : '#2a4a40', '#6a7a80'); ground(66, '#2a4a36', '#12241a', true); x.fillStyle = '#40e0d0'; for (let i = 0; i < 16; i++) x.fillRect(R() * w, 20 + R() * 60, 1, 1); break;
    case 'burning': grad(0, 60, '#2a0a0a', '#e08030'); for (let i = 0; i < 7; i++) { const bx = i * 36 + 6; x.fillStyle = '#1a1210'; x.fillRect(bx, 36, 22, 26); x.fillRect(bx - 2, 30, 26, 6); x.fillStyle = '#ffb040'; x.fillRect(bx + 8, 44, 5, 6); } ground(62, '#4a3a2a', '#1e1610', true); x.fillStyle = '#ffd060'; for (let i = 0; i < 30; i++) x.fillRect(R() * w, R() * 60, 1, 1); break;
    case 'sea': grad(0, 46, '#4a88e0', '#c8e4ff'); grad(46, 108, '#2a5ab8', '#1a3a88'); x.fillStyle = '#8ab8f0'; for (let i = 0; i < 40; i++) x.fillRect(R() * w, 48 + R() * 60, 6, 1); x.fillStyle = '#7a4a20'; x.fillRect(0, 92, w, 16); x.fillStyle = '#a0662c'; x.fillRect(0, 90, w, 3); for (let i = 0; i < w; i += 12) { x.fillStyle = '#5a3418'; x.fillRect(i, 93, 1, 15); } break;
    case 'river': grad(0, 50, '#0a1030', '#3a3a70'); disc(190, 16, 6, '#e8e8ff'); disc(193, 14, 5, '#0e1438'); grad(50, 108, '#1a2a60', '#0a1438'); x.fillStyle = '#6a8ad0'; for (let i = 0; i < 30; i++) x.fillRect(R() * w, 52 + R() * 40, 5, 1); x.fillStyle = '#6a4a20'; x.fillRect(0, 90, w, 18); x.fillStyle = '#d0a040'; x.fillRect(0, 88, w, 3); x.fillStyle = '#ffe070'; x.fillRect(30, 70, 2, 18); x.fillRect(200, 70, 2, 18); disc(31, 68, 3, '#fff0a0'); disc(201, 68, 3, '#fff0a0'); break;
    case 'temple': grad(0, 70, '#f0e0b0', '#c0a060'); for (let i = 0; i < 7; i++) pillar(10 + i * 36, 6, 72, '#e8dcc0'); ground(72, '#d8c8a0', '#a08860', true); x.fillStyle = 'rgba(255,240,160,0.35)'; x.fillRect(100, 0, 40, 72); break;
    case 'tower': grad(0, 70, '#3a2a40', '#c09050'); for (let i = 0; i < 5; i++) pillar(20 + i * 50, 4, 74, '#d8c090'); ground(74, '#9a8060', '#5a4a30', true); disc(120, 24, 14, 'rgba(255,230,120,0.5)'); disc(120, 24, 8, '#fff4c0'); break;
    case 'vale': grad(0, 60, '#6a4a9a', '#f0b0d0'); x.fillStyle = '#d0e8ff'; x.fillRect(96, 0, 14, 64); x.fillRect(130, 0, 14, 64); x.fillStyle = 'rgba(255,255,255,0.4)'; x.fillRect(90, 56, 60, 10); hills(46, 6, '#5a3a6a', 1); ground(62, '#6a8a4a', '#3a5a2a', true); x.fillStyle = '#ff90e0'; for (let i = 0; i < 50; i++) x.fillRect(R() * w, 62 + R() * 46, 2, 1); break;
    case 'sanctum': grad(0, 72, '#0a0614', '#3a2050'); disc(120, 26, 18, '#ffe070'); disc(120, 26, 12, '#1a0a24'); for (let i = 0; i < 7; i++) pillar(10 + i * 36, 4, 74, '#6a5a7a'); ground(74, '#4a3a5a', '#1a1024', true); break;
    case 'town': grad(0, 60, '#5aa0f0', '#cfeaff'); for (let i = 0; i < 6; i++) { const bx = i * 42 + 4; x.fillStyle = '#f0e8d8'; x.fillRect(bx, 34, 30, 28); x.fillStyle = '#d0a030'; x.fillRect(bx - 3, 26, 36, 9); x.fillStyle = '#5a3a20'; x.fillRect(bx + 12, 48, 6, 14); } ground(62, '#c8c0a8', '#9a9080', true); break;
    case 'ashplains': grad(0, 60, '#3a1010', '#c06030'); hills(42, 8, '#2a1a18', 2); hills(52, 5, '#1a1210', 4); ground(60, '#5a4a40', '#2a2420', true); x.fillStyle = '#ff8030'; for (let i = 0; i < 30; i++) x.fillRect(R() * w, R() * 60, 1, 1); break;
    case 'lava': grad(0, 60, '#1a0808', '#802010'); hills(46, 8, '#1a1010', 1); ground(60, '#2a1c18', '#120a08', true); x.fillStyle = '#ff6010'; for (let i = 0; i < 6; i++) x.fillRect(R() * w, 70 + R() * 36, 30 + R() * 30, 3); x.fillStyle = '#ffc040'; for (let i = 0; i < 6; i++) x.fillRect(R() * w, 72 + R() * 34, 10, 1); break;
    case 'forge': grad(0, 72, '#140c0a', '#4a2a1a'); for (let i = 0; i < 6; i++) pillar(14 + i * 42, 6, 74, '#3a3a44'); x.fillStyle = 'rgba(255,120,30,0.35)'; x.fillRect(0, 50, w, 24); ground(74, '#3a3030', '#1a1414', true); x.fillStyle = '#ff9030'; for (let i = 0; i < 20; i++) x.fillRect(R() * w, R() * 70, 1, 1); break;
    case 'grave': grad(0, 70, '#0a0a12', '#3a3a4a'); for (let i = 0; i < 12; i++) { const gx = R() * w; x.fillStyle = '#5a5a66'; x.fillRect(gx, 50 + R() * 14, 8, 16); x.fillRect(gx - 2, 54, 12, 3); } ground(70, '#3a3a40', '#1a1a20', true); x.fillStyle = 'rgba(160,160,200,0.2)'; x.fillRect(0, 56, w, 14); break;
    case 'volcano': grad(0, 70, '#200808', '#a03010'); x.fillStyle = '#1a0a08'; x.beginPath(); x.moveTo(60, 72); x.lineTo(120, 10); x.lineTo(180, 72); x.fill(); x.fillStyle = '#ff7020'; x.fillRect(114, 10, 12, 4); x.fillRect(118, 14, 4, 30); ground(72, '#2a1a14', '#100806', true); x.fillStyle = '#8a8aa0'; x.fillRect(104, 40, 32, 34); x.fillStyle = '#100806'; x.fillRect(110, 46, 20, 28); break;
    case 'caldera': grad(0, 72, '#1a0404', '#e06020'); disc(120, 30, 20, 'rgba(255,200,80,0.45)'); disc(120, 30, 12, '#fff0a0'); x.fillStyle = '#140808'; x.fillRect(98, 40, 44, 34); x.fillRect(92, 50, 56, 6); ground(74, '#2a1410', '#0a0404', true); x.fillStyle = '#ffb040'; for (let i = 0; i < 40; i++) x.fillRect(R() * w, R() * 72, 1, 2); break;
    case 'port2': grad(0, 50, '#301010', '#c08060'); grad(50, 68, '#2a2a3a', '#4a4a5a'); x.fillStyle = '#1a1414'; x.fillRect(20, 20, 10, 50); x.fillRect(210, 20, 10, 50); x.fillStyle = '#ff6030'; x.fillRect(22, 18, 6, 4); x.fillRect(212, 18, 6, 4); ground(68, '#4a4040', '#2a2424', true); break;
    case 'snowfield': grad(0, 60, '#6a8ab8', '#dce8f4'); hills(40, 10, '#b8c8dc', 1); hills(50, 6, '#ffffff', 3); ground(62, '#eef2f8', '#c8d4e4', true); x.fillStyle = '#ffffff'; for (let i = 0; i < 40; i++) x.fillRect(R() * w, R() * 60, 1, 1); break;
    case 'icecave': grad(0, 72, '#1a2a44', '#6a9ac0'); for (let i = 0; i < 12; i++) { const ix = R() * w; x.fillStyle = '#b8dcf4'; x.fillRect(ix, 0, 3, 8 + R() * 16); x.fillStyle = '#e8f6ff'; x.fillRect(ix, 0, 1, 6); } ground(72, '#b4d0e8', '#6a8aa8', true); break;
    case 'summit': grad(0, 70, '#1a2040', '#8aa0c8'); x.fillStyle = '#ffffff'; for (let i = 0; i < 50; i++) x.fillRect(R() * w, R() * 50, 1, 1); hills(52, 4, '#dce8f4', 2); ground(66, '#eef2f8', '#b8c8dc', true); x.fillStyle = 'rgba(200,230,255,0.3)'; x.fillRect(0, 30, w, 10); break;
    case 'undercity': grad(0, 72, '#101014', '#3a3a44'); for (let i = 0; i < 6; i++) { const ax = i * 44 + 8; x.fillStyle = '#4a4a52'; x.fillRect(ax, 10, 8, 62); x.fillRect(ax - 4, 8, 44, 6); } x.fillStyle = '#2a4a5a'; x.fillRect(0, 62, w, 10); x.fillStyle = '#4a7a8a'; for (let i = 0; i < 20; i++) x.fillRect(R() * w, 63 + R() * 8, 4, 1); ground(74, '#5a5a60', '#2a2a30', true); x.fillStyle = 'rgba(255,220,120,0.35)'; x.fillRect(110, 0, 20, 60); break;
    case 'library': grad(0, 72, '#140c18', '#3a2a3a'); for (let i = 0; i < 8; i++) { const sx = i * 30 + 2; x.fillStyle = '#3a2418'; x.fillRect(sx, 8, 26, 64); for (let r = 0; r < 5; r++) for (let k = 0; k < 6; k++) { x.fillStyle = pick(['#8a2a20', '#2a6a4a', '#3a4a8a', '#8a6a2a', '#5a2a5a']); x.fillRect(sx + 2 + k * 4, 11 + r * 12, 3, 9); } } x.fillStyle = 'rgba(64,224,208,0.25)'; x.fillRect(0, 60, w, 14); ground(74, '#4a3428', '#1a1010', true); x.fillStyle = '#f0e8d0'; for (let i = 0; i < 16; i++) x.fillRect(R() * w, R() * 70, 3, 2); break;
    case 'fey': grad(0, 72, '#2a1030', '#6a3a4a'); x.fillStyle = '#8a5a30'; x.fillRect(0, 60, w, 14); disc(40, 40, 18, '#c0a060'); disc(40, 40, 12, '#e0c080'); x.fillStyle = '#e8e0f0'; x.fillRect(170, 16, 18, 50); x.fillRect(166, 12, 26, 6); x.fillStyle = '#7a3a8a'; for (let i = 0; i < 4; i++) disc(90 + i * 22, 30 + (i % 2) * 8, 6, i % 2 ? '#c04080' : '#4080c0'); ground(74, '#8a5a30', '#3a2010', true); x.fillStyle = '#ffe080'; for (let i = 0; i < 30; i++) x.fillRect(R() * w, R() * 72, 1, 1); break;
    default: grad(0, h, '#222', '#444');
  }
  const big = mkCanvas(W, FIELD_H + 8), bx = big.getContext('2d'); bx.imageSmoothingEnabled = false; bx.drawImage(c, 0, 0, w, h, 0, 0, W, FIELD_H + 8);
  return (_bgCache[name] = big);
}
function mix(a, b, k) {
  if (a[0] !== '#' || b[0] !== '#') return a;
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = (pa >> 16) + ((pb >> 16) - (pa >> 16)) * k, g = ((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * k, bb = (pa & 255) + ((pb & 255) - (pa & 255)) * k;
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(bb)})`;
}
