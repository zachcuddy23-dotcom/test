'use strict';
// ---------------------------------------------------------------------------
// Battle system (FF1-style: choose commands for everyone, then a round plays)
// ---------------------------------------------------------------------------
const FIELD_H = 432;
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
class BattleScene {
  constructor(opts, res) {
    this.opts = opts; this.res = res; this.opaque = true; this.bg = opts.bg || 'plains';
    const counts = {}, seen = {};
    for (const id of opts.enemies) counts[id] = (counts[id] || 0) + 1;
    this.enemies = opts.enemies.map(id => {
      const d = ENEMIES[id]; seen[id] = (seen[id] || 0) + 1;
      const name = counts[id] > 1 ? `${d.name} ${String.fromCharCode(64 + seen[id])}` : d.name;
      return { id, d, name, hp: d.hp, mhp: d.hp, status: {}, def: d.def, img: recolored('m_' + d.art, d.tint), x: 0, y: 0, dying: 0, hurt: 0, blink: 0, gone: false, uses: {}, enemy: true };
    });
    this.layout();
    this.pb = new Map(S().party.map(m => [m, { def: 0, haste: false, ox: 0, hurt: 0, act: 0 }]));
    this.msg = ''; this.nums = []; this.parts = []; this.fxList = [];
    this.ui = null; this.phase = 'intro';
    S().battles++;
    this.run();
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
    let x = Math.max(24, 300 - totalW / 2);
    for (const c of cols) {
      let y = (FIELD_H - c.h) / 2 + 20 + 7;
      for (const e of c.items) { e.x = Math.round(x + (c.w - e.img.width) / 2); e.y = Math.round(y); y += e.img.height + 14; }
      x += c.w + 24;
    }
  }
  living() { return this.enemies.filter(e => e.hp > 0); }
  party() { return S().party; }
  partyPos(i) { return { x: 700 + i * 56, y: 215 + i * 105 }; } // bottom-center of sprite
  memberCenter(m) { const i = this.party().indexOf(m), p = this.partyPos(i), img = IMG[HEROES[m.id].img]; return { x: p.x + (this.pb.get(m).ox || 0), y: p.y - (img ? img.height / 2 : 60) }; }
  enemyCenter(e) { return { x: e.x + e.img.width / 2, y: e.y + e.img.height / 2 }; }
  center(t) { return t.enemy ? this.enemyCenter(t) : this.memberCenter(t); }
  // ------------------------------------------------------------------ flow
  async run() {
    await wait(12);
    const names = this.enemies.map(e => e.d.name);
    this.msg = this.opts.boss ? `${this.enemies.find(e => e.d.boss)?.d.name || names[0]} attacks!` : (new Set(names).size === 1 && names.length > 1 ? `${names[0]}s appear!` : `${names[0]} appears!`);
    await wait(50); this.msg = '';
    while (!this.result) {
      const cmds = await this.collect();
      await this.round(cmds);
    }
    await this.finish();
  }
  collect() {
    return new Promise(res => {
      this.cmds = []; this.reserved = {}; this.collectRes = res; this.ci = -1;
      this.nextMember();
    });
  }
  nextMember() {
    const p = this.party();
    let i = this.ci + 1;
    while (i < p.length && !canAct(p[i])) i++;
    if (i >= p.length) { this.ui = null; for (const m of p) this.pb.get(m).ox = 0; const r = this.collectRes; this.collectRes = null; r(this.cmds); return; }
    if (this.ci >= 0 && p[this.ci]) this.pb.get(p[this.ci]).ox = 0;
    this.ci = i; this.pb.get(p[i]).ox = -24;
    this.openCmdMenu();
  }
  prevMember() {
    const p = this.party();
    let i = this.ci - 1;
    while (i >= 0 && !canAct(p[i])) i--;
    if (i < 0) return;
    this.pb.get(p[this.ci]).ox = 0;
    const c = this.cmds[i]; if (c && c.type === 'item') this.reserved[c.item]--;
    this.cmds[i] = null; this.ci = i; this.pb.get(p[i]).ox = -24;
    this.openCmdMenu();
  }
  openCmdMenu() {
    const m = this.party()[this.ci];
    const items = [{ text: 'Fight', k: 'fight' }, { text: CLASSES[m.cls].magic, k: 'magic', disabled: !m.spells.length }, { text: 'Item', k: 'item' }];
    if (m.cls === 'alchemist') items.push({ text: 'Steal', k: 'steal' });
    items.push({ text: 'Run', k: 'run', disabled: !!this.opts.noRun });
    const menu = new ListMenu(items, { x: 12, y: 440, w: 300, rowH: 34, rows: 5, size: 16 });
    menu.h = 190;
    this.ui = { kind: 'cmd', menu };
  }
  setCmd(c) { this.cmds[this.ci] = c; this.nextMember(); }
  target(side, cb, back, o = {}) {
    const list = side === 'enemy' ? this.living() : this.party().filter(m => o.dead ? !alive(m) : alive(m) || o.any);
    if (!list.length) { Audio2.sfx('error'); return; }
    this.ui = { kind: 'target', side, list, index: 0, cb, back };
  }
  update() {
    // numbers & particles
    for (const n of this.nums) n.t++;
    this.nums = this.nums.filter(n => n.t < 60);
    for (const p of this.parts) { p.x += p.vx; p.y += p.vy; p.vy += p.g || 0; p.life--; }
    this.parts = this.parts.filter(p => p.life > 0);
    for (const e of this.enemies) { if (e.hurt > 0) e.hurt--; if (e.blink > 0) e.blink--; if (e.dying > 0) { e.dying--; if (!e.dying) e.gone = true; } }
    for (const [, b] of this.pb) if (b.hurt > 0) b.hurt--;
    if (!this.ui) { if (this.waitKey && (Input.ok() || Input.hit('b'))) { const r = this.waitKey; this.waitKey = null; r(); } return; }
    const u = this.ui;
    if (u.kind === 'cmd') {
      const r = u.menu.update(); if (!r) return;
      if (r.cancel) { this.prevMember(); return; }
      const m = this.party()[this.ci], k = r.select.k;
      if (k === 'fight') this.target('enemy', t => this.setCmd({ type: 'fight', target: t }), () => this.openCmdMenu());
      if (k === 'steal') this.target('enemy', t => this.setCmd({ type: 'steal', target: t }), () => this.openCmdMenu());
      if (k === 'run') this.setCmd({ type: 'run' });
      if (k === 'magic') this.openSpellMenu(m);
      if (k === 'item') this.openItemMenu(m);
    } else if (u.kind === 'list') {
      const r = u.menu.update(); if (!r) return;
      if (r.cancel) { this.openCmdMenu(); return; }
      u.pick(r.select);
    } else if (u.kind === 'target') {
      const n = u.list.length;
      if (Input.rep('down') || Input.rep('right')) { u.index = (u.index + 1) % n; Audio2.sfx('cursor'); }
      if (Input.rep('up') || Input.rep('left')) { u.index = (u.index + n - 1) % n; Audio2.sfx('cursor'); }
      if (Input.ok()) { Audio2.sfx('ok'); u.cb(u.list[u.index]); }
      else if (Input.cancel()) { Audio2.sfx('cancel'); u.back(); }
    }
  }
  openSpellMenu(m) {
    const mc = maxCharges(m);
    const items = m.spells.slice().sort((a, b) => SPELLS[a].tier - SPELLS[b].tier).map(id => { const s = SPELLS[id]; return { text: s.name, right: `${m.charges[s.tier - 1]}/${mc[s.tier - 1]}`, id, disabled: m.charges[s.tier - 1] <= 0 }; });
    const menu = new ListMenu(items, { x: 12, y: 440, w: 936, cols: 2, rows: 4, rowH: 34, title: `${CLASSES[m.cls].magic} - charges per tier: ${m.charges.map((c, i) => `T${i + 1} ${c}`).join('  ')}`, size: 16 });
    menu.h = 190;
    const back = () => this.openSpellMenu(m);
    this.ui = { kind: 'list', menu, pick: it => {
      const sp = SPELLS[it.id], set = t => this.setCmd({ type: 'spell', spell: it.id, target: t });
      if (sp.target === 'enemy') this.target('enemy', set, back);
      else if (sp.target === 'ally') this.target('ally', set, back, sp.kind === 'revive' ? { dead: true } : {});
      else set(null);
    } };
  }
  openItemMenu(m) {
    const items = Object.entries(S().items).filter(([id]) => ITEMS[id].battle).map(([id, n]) => { const left = n - (this.reserved[id] || 0); return { text: ITEMS[id].name, right: left, id, disabled: left <= 0 }; });
    if (!items.length) { Audio2.sfx('error'); this.msg = 'No usable items.'; setTimeout(() => { if (this.msg === 'No usable items.') this.msg = ''; }, 900); return; }
    const menu = new ListMenu(items, { x: 12, y: 440, w: 936, cols: 2, rows: 4, rowH: 34, size: 16 }); menu.h = 190;
    const back = () => this.openItemMenu(m);
    this.ui = { kind: 'list', menu, pick: it => {
      const d = ITEMS[it.id], set = t => { this.reserved[it.id] = (this.reserved[it.id] || 0) + 1; this.setCmd({ type: 'item', item: it.id, target: t }); };
      if (d.target === 'ally') this.target('ally', set, back, d.kind === 'revive' ? { dead: true } : {});
      else set(null);
    } };
  }
  // ------------------------------------------------------------------ round
  async round(cmds) {
    const actors = [];
    this.party().forEach((m, i) => { if (cmds[i]) actors.push({ who: m, cmd: cmds[i], ini: m.agi + rnd(0, 20) }); });
    for (const e of this.living()) for (let k = 0; k < (e.d.actions || 1); k++) actors.push({ who: e, ini: e.d.agi + rnd(0, 20) - k * 15 });
    actors.sort((a, b) => b.ini - a.ini);
    for (const a of actors) {
      if (this.result) break;
      if (a.who.hp <= 0) continue;
      if (a.who.status.sleep) { if (a.who.enemy) { if (Math.random() < 0.3) { delete a.who.status.sleep; await this.say(`${a.who.name} wakes up.`); } } continue; }
      if (a.who.enemy) await this.enemyAct(a.who); else await this.partyAct(a.who, a.cmd);
      this.check();
    }
    if (this.result) return;
    // end of round: poison & sleep recovery
    for (const t of [...this.party(), ...this.living()]) {
      if (t.hp <= 0) continue;
      if (t.status.poison) { const d = Math.max(1, Math.floor((t.mhp) / (t.enemy ? 12 : 10))); t.hp = Math.max(t.enemy ? 0 : 0, t.hp - d); this.num(t, d, '#b0ff70'); if (t.hp <= 0) this.kill(t); }
      if (!t.enemy && t.status.sleep && Math.random() < 0.3) delete t.status.sleep;
    }
    if (this.party().some(m => m.status.poison)) await wait(30);
    this.check();
  }
  check() {
    if (this.result) return;
    if (!this.living().length) this.result = 'win';
    else if (!this.party().some(alive)) this.result = 'lose';
  }
  say(m, n = 36) { this.msg = m; return wait(n); }
  num(t, v, col = '#fff') { const c = this.center(t); this.nums.push({ x: c.x + rnd(-10, 10), y: c.y, v, col, t: 0 }); }
  kill(t) {
    if (t.enemy) { t.dying = t.d.boss ? 70 : 26; Audio2.sfx(t.d.boss ? 'boom' : 'die'); if (t.d.boss) Game.shake = 30; }
    else { t.hp = 0; t.status = {}; }
  }
  retarget(t, side) {
    if (side === 'enemy') { if (t && t.hp > 0) return t; return this.living()[0]; }
    if (t && alive(t)) return t; return this.party().find(alive);
  }
  // ------------------------------------------------------------------ party actions
  async partyAct(m, c) {
    const b = this.pb.get(m), st = stats(m);
    await tween(8, k => b.ox = -40 * k);
    if (c.type === 'fight') {
      const t = this.retarget(c.target, 'enemy'); if (!t) return;
      let hits = st.hits * (b.haste ? 2 : 1), dmg = 0, landed = 0, crit = false;
      const chance = clamp((168 + st.hit - t.d.eva) / 200, 0.05, 0.99) * (m.status.blind ? 0.5 : 1);
      for (let i = 0; i < hits; i++) {
        if (t.status.sleep || Math.random() < chance) {
          let d = rnd(st.atk, st.atk * 2); if (Math.random() * 100 < st.crit) { d += st.atk; crit = true; }
          dmg += Math.max(1, d - t.def); landed++;
        }
      }
      this.msg = landed > 1 ? `${m.name} - ${landed} hits!` : `${m.name} attacks!`;
      this.spawnFx('slash', this.enemyCenter(t));
      await wait(10);
      if (!landed) { Audio2.sfx('miss'); this.num(t, 'Miss', '#c0c0c0'); }
      else { Audio2.sfx(crit ? 'crit' : 'hit'); if (crit) this.msg = 'Critical hit!'; this.damage(t, dmg); }
      await wait(26);
    } else if (c.type === 'spell') {
      const sp = SPELLS[c.spell];
      if (m.charges[sp.tier - 1] <= 0) { await this.say(`${m.name} has no charges left!`); }
      else { m.charges[sp.tier - 1]--; await this.castSpell(m, sp, c.target); }
    } else if (c.type === 'item') {
      this.reserved[c.item] = Math.max(0, (this.reserved[c.item] || 1) - 1);
      if (!S().items[c.item]) { await this.say('Out of that item!'); }
      else await this.useItem(m, c.item, c.target);
    } else if (c.type === 'steal') {
      const t = this.retarget(c.target, 'enemy');
      this.msg = `${m.name} tries to steal...`; this.spawnFx('slash', this.enemyCenter(t)); await wait(24);
      if (t.d.steal && !t.stolen && Math.random() < 0.45 + st.luck / 100) { t.stolen = true; addItem(t.d.steal); Audio2.sfx('chest'); await this.say(`Stole ${ITEMS[t.d.steal].name}!`, 44); }
      else { Audio2.sfx('miss'); await this.say(t.stolen || !t.d.steal ? 'Nothing to steal!' : "Couldn't steal anything.", 40); }
    } else if (c.type === 'run') {
      this.msg = `${m.name} looks for an escape...`; await wait(20);
      const pa = this.party().filter(alive).reduce((s, x) => s + x.agi, 0) / Math.max(1, this.party().filter(alive).length);
      const ea = this.living().reduce((s, e) => s + e.d.agi, 0) / Math.max(1, this.living().length);
      if (Math.random() < clamp(0.55 + (pa - ea) / 40 + m.luck / 200, 0.15, 0.95)) { Audio2.sfx('run'); await this.say('Escaped!', 30); this.result = 'run'; }
      else await this.say("Couldn't escape!", 36);
    }
    await tween(8, k => b.ox = -40 * (1 - k)); b.ox = 0;
    this.msg = '';
  }
  damage(t, d) {
    d = Math.max(0, Math.floor(d));
    t.hp = Math.max(0, t.hp - d); this.num(t, d);
    if (t.enemy) { t.hurt = 14; if (t.status.sleep && Math.random() < 0.5) delete t.status.sleep; }
    else { this.pb.get(t).hurt = 16; if (t.status.sleep && Math.random() < 0.5) delete t.status.sleep; }
    if (t.hp <= 0) this.kill(t);
  }
  heal(t, v) { v = Math.min(t.mhp - t.hp, Math.floor(v)); t.hp += v; this.num(t, v, '#70ff90'); }
  async castSpell(m, sp, target) {
    const st = stats(m), b = this.pb.get(m);
    this.msg = sp.name; b.cast = 30; this.spawnFx('cast', this.memberCenter(m));
    await wait(24);
    let targets;
    if (sp.target === 'enemy') targets = [this.retarget(target, 'enemy')];
    else if (sp.target === 'enemies') targets = this.living();
    else if (sp.target === 'ally') targets = [sp.kind === 'revive' ? target : this.retarget(target, 'ally')];
    else if (sp.target === 'allies') targets = this.party().filter(alive);
    else targets = [m];
    targets = targets.filter(Boolean);
    Audio2.sfx({ fire: 'fire', dark: 'dark', wind: 'wind', heal: 'heal', buff: 'heal', poison: 'status', smoke: 'status', acid: 'hit', roar: 'boom' }[sp.fx] || 'hit');
    for (const t of targets) this.spawnFx(sp.fx, this.center(t));
    if (sp.fx === 'roar') Game.shake = 20;
    await wait(26);
    for (const t of targets) this.applySpell(m, st, sp, t);
    await wait(34);
    this.msg = '';
  }
  applySpell(m, st, sp, t) {
    if (sp.kind === 'dmg' || sp.kind === 'drain') {
      if (t.hp <= 0) return;
      let d = rnd(sp.pow, sp.pow * 2) * (1 + st.mag / 80);
      if (t.d.weak && t.d.weak.includes(sp.elem)) d *= 1.5;
      if (t.d.resist && t.d.resist.includes(sp.elem)) d *= 0.5;
      this.damage(t, d);
      if (sp.kind === 'drain') this.heal(m, d / 2);
      if (sp.status && t.hp > 0 && !(t.d.immune || []).includes(sp.status) && Math.random() * 100 < sp.chance) t.status[sp.status] = true;
    } else if (sp.kind === 'status') {
      if (t.hp <= 0) return;
      if ((t.d.immune || []).includes(sp.status) || Math.random() * 100 > sp.chance - (t.d.boss ? 30 : 0)) this.num(t, 'Miss', '#c0c0c0');
      else { t.status[sp.status] = true; this.num(t, { sleep: 'Sleep', blind: 'Blind', fear: 'Fear', poison: 'Poison' }[sp.status], '#ffd060'); }
    } else if (sp.kind === 'heal') { if (alive(t)) this.heal(t, healAmount(sp, st.mag)); }
    else if (sp.kind === 'cure') { if (alive(t)) { for (const s of sp.cures) delete t.status[s]; this.num(t, 'Cured', '#70ff90'); } }
    else if (sp.kind === 'revive') { if (!alive(t)) { t.hp = Math.max(1, Math.floor(t.mhp / 4)); t.status = {}; this.num(t, t.hp, '#70ff90'); } else this.num(t, 'Miss', '#c0c0c0'); }
    else if (sp.kind === 'buff') {
      const pb = this.pb.get(t);
      if (sp.buff === 'def') { pb.def += sp.pow; this.num(t, 'Def Up', '#ffe070'); }
      if (sp.buff === 'haste') { pb.haste = true; this.num(t, 'Haste', '#ffe070'); }
    }
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
      const before = t.hp, r = applyItem(d, t);
      if (!r.ok) this.num(t, 'Miss', '#c0c0c0');
      else if (d.kind === 'heal' || d.kind === 'revive') this.num(t, t.hp - before, '#70ff90');
      else this.num(t, 'Cured', '#70ff90');
    }
    await wait(34); this.msg = '';
  }
  // ------------------------------------------------------------------ enemy actions
  pickPartyTarget() {
    const al = this.party().map((m, i) => ({ m, w: alive(m) ? [4, 3, 2][i] || 2 : 0 })).filter(x => x.w);
    return wpick(al).m;
  }
  async enemyAct(e) {
    const d = e.d;
    let act = { type: 'attack' };
    if (d.acts) {
      const opts = d.acts.filter(a => !(a.once && e.uses[a.name]) && !(a.uses && (e.uses[a.name] || 0) >= a.uses) && !(a.when === 'hurt' && e.hp > e.mhp / 2));
      act = wpick(opts);
    }
    if (act.name) e.uses[act.name] = (e.uses[act.name] || 0) + 1;
    e.blink = 16; await wait(18);
    const fear = e.status.fear ? 0.6 : 1;
    if (act.type === 'attack' || act.type === 'strike') {
      const t = this.pickPartyTarget(); if (!t) return;
      const ts = stats(t), pb = this.pb.get(t);
      this.msg = act.name || e.name;
      if (act.fx) this.spawnFx(act.fx, this.memberCenter(t));
      let dmg = 0, landed = 0;
      const chance = clamp((168 + d.acc - ts.eva) / 200, 0.08, 0.97) * (e.status.blind ? 0.5 : 1);
      for (let i = 0; i < (d.hits || 1); i++) {
        if (t.status.sleep || Math.random() < chance) { landed++; dmg += Math.max(1, Math.floor(rnd(d.atk, d.atk * 2) * (act.mult || 1) * fear) - ts.def - pb.def); }
      }
      await wait(8);
      if (!landed) { Audio2.sfx('miss'); this.num(t, 'Miss', '#c0c0c0'); }
      else {
        Audio2.sfx(act.mult ? 'crit' : 'hit'); if (act.mult) Game.shake = 12;
        this.damage(t, dmg);
        if (d.touch && alive(t) && Math.random() * 100 < d.touch.chance && !t.status[d.touch.status]) { t.status[d.touch.status] = true; await wait(12); this.num(t, { poison: 'Poison', sleep: 'Sleep', blind: 'Blind' }[d.touch.status], '#ffd060'); Audio2.sfx('status'); }
      }
      await wait(30);
    } else if (act.type === 'spell') {
      this.msg = act.name;
      const ts = act.target === 'all' ? this.party().filter(alive) : [this.pickPartyTarget()];
      Audio2.sfx({ fire: 'fire', dark: 'dark', ice: 'wind', boom: 'boom', light: 'heal' }[act.fx] || 'dark');
      if (act.fx === 'boom') Game.shake = 20;
      for (const t of ts) this.spawnFx(act.fx, this.memberCenter(t));
      await wait(28);
      for (const t of ts) { const md = stats(t).mdef; this.damage(t, rnd(act.pow, act.pow * 2) * (1 - md / 300)); }
      await wait(34);
    } else if (act.type === 'status') {
      const t = this.pickPartyTarget(); this.msg = act.name; this.spawnFx(act.fx || 'smoke', this.memberCenter(t)); Audio2.sfx('status'); await wait(26);
      if (Math.random() * 100 < act.chance - stats(t).mdef / 4) { t.status[act.status] = true; this.num(t, { sleep: 'Sleep', blind: 'Blind', poison: 'Poison' }[act.status], '#ffd060'); }
      else this.num(t, 'Miss', '#c0c0c0');
      await wait(30);
    } else if (act.type === 'drain') {
      const t = this.pickPartyTarget(); this.msg = act.name; this.spawnFx('dark', this.memberCenter(t)); Audio2.sfx('dark'); await wait(24);
      const dmg = rnd(act.pow, act.pow * 2); this.damage(t, dmg); this.heal(e, dmg); await wait(34);
    } else if (act.type === 'heal') {
      this.msg = act.name; this.spawnFx('heal', this.enemyCenter(e)); Audio2.sfx('heal'); await wait(20); this.heal(e, act.pow); await wait(34);
    } else if (act.type === 'buff') {
      this.msg = act.name; this.spawnFx('buff', this.enemyCenter(e)); Audio2.sfx('heal'); await wait(20); e.def += act.pow; this.num(e, 'Def Up', '#ffe070'); await wait(30);
    }
    this.msg = '';
  }
  // ------------------------------------------------------------------ end
  async finish() {
    this.ui = null;
    if (this.result === 'win') {
      await wait(this.enemies.some(e => e.d.boss) ? 60 : 24);
      Audio2.music('victory');
      const exp = this.enemies.reduce((s, e) => s + e.d.exp, 0), gold = this.enemies.reduce((s, e) => s + e.d.gold, 0);
      S().gold += gold;
      for (const m of this.party()) this.pb.get(m).win = true;
      await this.message(`Victory! Each survivor gains ${exp} EXP. Found ${gold} gold.`);
      for (const m of this.party()) { for (const l of gainExp(m, exp)) { Audio2.sfx('levelup'); await this.message(l); } }
      await fadeOut(16); Game.pop(this);
      Audio2.music(S().onShip ? 'sea' : Game.field.map.music);
      await fadeIn(16);
      for (const m of this.party()) { delete m.status.sleep; }
      this.res('win');
    } else if (this.result === 'run') {
      await fadeOut(12); Game.pop(this); Audio2.music(S().onShip ? 'sea' : Game.field.map.music); await fadeIn(12); this.res('run');
    } else {
      Audio2.music(null); await this.message('The party has fallen...');
      await fadeOut(60);
      Game.pop(this); this.res('lose');
      Game.push(new GameOverScene());
      await fadeIn(30);
    }
  }
  message(m) { this.msg = m; return new Promise(r => { this.waitKey = r; }); }
  // ------------------------------------------------------------------ effects
  spawnFx(type, c) {
    const P = (n, f) => { for (let i = 0; i < n; i++) this.parts.push(f(i)); };
    const R = Math.random;
    switch (type) {
      case 'slash': P(3, i => ({ kind: 'line', x: c.x - 40 + i * 20, y: c.y - 40, vx: 0, vy: 0, life: 10, len: 80, col: '#fff' })); Audio2.sfx('slash'); break;
      case 'fire': P(40, () => ({ x: c.x + (R() - 0.5) * 90, y: c.y + 40 - R() * 30, vx: (R() - 0.5) * 1.5, vy: -1.5 - R() * 3, life: 20 + R() * 20, s: 6 + R() * 8, col: pick(['#ff4020', '#ff9020', '#ffe060', '#ffffff']) })); break;
      case 'dark': P(36, i => { const a = i / 36 * Math.PI * 2, r = 70; return { x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r, vx: -Math.cos(a) * 2.4, vy: -Math.sin(a) * 2.4, life: 28, s: 8, col: pick(['#6020a0', '#a040ff', '#200830', '#e0a0ff']) }; }); break;
      case 'ice': P(30, () => ({ x: c.x + (R() - 0.5) * 100, y: c.y - 70 - R() * 40, vx: 0, vy: 3 + R() * 3, life: 26, s: 6, col: pick(['#a0e8ff', '#ffffff', '#60b0ff']) })); break;
      case 'wind': P(30, () => ({ x: c.x + 80 + R() * 40, y: c.y + (R() - 0.5) * 100, vx: -6 - R() * 4, vy: (R() - 0.5), life: 26, s: 5, col: pick(['#ffffff', '#c8f0ff', '#a0d0c0']) })); break;
      case 'poison': P(30, () => ({ x: c.x + (R() - 0.5) * 90, y: c.y + 30, vx: (R() - 0.5), vy: -1 - R() * 2, life: 34, s: 7 + R() * 6, col: pick(['#60c020', '#a0ff40', '#306010']), round: true })); break;
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
    // enemies
    for (const e of this.enemies) {
      if (e.gone) continue;
      let img = e.img, x = e.x, y = e.y;
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
      ctx.drawImage(img, x, y);
      if (e.status.sleep) text('Zz', x + e.img.width - 10, y - 4, '#e0e0ff', 12);
      if (e.status.poison) text('☠', x - 4, y - 4, '#90ff60', 12);
      if (e.status.fear) text('!', x + e.img.width / 2, y - 18, '#ffd040', 14);
    }
    // party
    this.party().forEach((m, i) => {
      const img = IMG[HEROES[m.id].img]; if (!img) return;
      const p = this.partyPos(i), b = this.pb.get(m);
      let x = p.x - img.width / 2 + b.ox, y = p.y - img.height;
      if (b.hurt > 0) x += (b.hurt % 4 < 2 ? -5 : 5);
      if (!alive(m)) {
        const k = 0.62; ctx.save(); ctx.globalAlpha = 0.7; ctx.translate(p.x + 10, p.y - img.width * k / 2); ctx.rotate(-Math.PI / 2); ctx.drawImage(flashed(img, '#4a3a4a'), -img.width * k / 2, -img.height * k / 2, img.width * k, img.height * k); ctx.restore(); return;
      }
      const bob = b.win ? -Math.abs(Math.sin(Game.frame / 8)) * 10 : (Math.floor(Game.frame / 30 + i) % 2 ? 1 : 0);
      let im = img; if (b.hurt > 0 && b.hurt % 4 < 2) im = flashed(img, '#ff5050');
      if (b.cast > 0) { b.cast--; if (b.cast % 6 < 3) im = flashed(img, '#c8b0ff'); }
      if (m.status.poison && Game.frame % 40 < 6) im = flashed(img, '#80ff60');
      ctx.drawImage(im, Math.round(x), Math.round(y + bob));
      if (m.status.sleep) text('Zz', x + img.width - 20, y + 10, '#e0e0ff', 12);
    });
    // particles
    for (const p of this.parts) {
      ctx.globalAlpha = clamp(p.life / 15, 0, 1); ctx.fillStyle = p.col;
      if (p.kind === 'line') { ctx.strokeStyle = p.col; ctx.lineWidth = 4; ctx.beginPath(); const k = 1 - p.life / 10; ctx.moveTo(p.x, p.y + p.len * k * 0.2); ctx.lineTo(p.x + p.len * 0.5 * k + 10, p.y + p.len * k); ctx.stroke(); }
      else if (p.star) { const s = Math.round(p.s); ctx.fillRect(p.x - s, p.y - 1, s * 2, 3); ctx.fillRect(p.x - 1, p.y - s, 3, s * 2); }
      else { const s = Math.round(p.s); ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s); }
    }
    ctx.globalAlpha = 1;
    // numbers
    for (const n of this.nums) {
      const t = n.t, bounce = t < 20 ? -Math.sin(t / 20 * Math.PI) * 30 : 0;
      ctx.globalAlpha = t > 45 ? (60 - t) / 15 : 1;
      text(String(n.v), n.x, n.y - 20 + bounce, n.col, typeof n.v === 'number' ? 22 : 16, 'center');
      ctx.globalAlpha = 1;
    }
    // target cursor
    if (this.ui && this.ui.kind === 'target') {
      const t = this.ui.list[this.ui.index];
      if (t.enemy) { drawCursor(t.x - 6, t.y + t.img.height / 2 - 10); text(t.name, W / 2, 16, '#fff', 16, 'center'); }
      else { const c = this.memberCenter(t); drawCursor(c.x - 50, c.y); }
    }
    this.drawUI();
  }
  drawUI() {
    // message bar
    if (this.msg) { const lines = wrapText(this.msg, 880); const h = 20 + lines.length * 26; drawWindow(12, 4, W - 24, h + 16); lines.forEach((l, i) => text(l, W / 2, 24 + i * 26, '#fff', 16, 'center')); if (this.waitKey && Math.floor(Game.frame / 15) % 2) text('▼', W - 50, h - 6, '#fff', 12); }
    // enemy names
    drawWindow(12, 440, 300, 190);
    const groups = {}; for (const e of this.living()) groups[e.d.name] = (groups[e.d.name] || 0) + 1;
    Object.entries(groups).slice(0, 4).forEach(([n, c], i) => { text(n.length > 13 ? n.slice(0, 13) : n, 36, 466 + i * 38, '#fff', 14); if (c > 1) text(`x${c}`, 290, 466 + i * 38, '#fff', 14, 'right'); });
    // party status
    drawWindow(316, 440, 632, 190);
    this.party().forEach((m, i) => {
      const y = 466 + i * 52, cur = this.ui && this.ci === i;
      text(m.name, 346, y, !alive(m) ? '#ff6060' : cur ? '#ffe070' : '#fff', 16);
      const st = !alive(m) ? 'KO' : m.status.sleep ? 'SLEEP' : m.status.poison ? 'POISON' : m.status.blind ? 'BLIND' : '';
      if (st) text(st, 346, y + 24, '#ff9090', 12);
      text(`${m.hp}`, 660, y, m.hp <= m.mhp / 4 ? '#ffd040' : '#fff', 16, 'right'); text(`/${m.mhp}`, 664, y, '#c0c0d8', 16);
      bar(520, y + 24, 230, 8, m.hp / m.mhp, m.hp <= m.mhp / 4 ? '#e0a020' : '#40d060');
      text(m.charges.join('/'), 924, y, '#c8b0ff', 14, 'right');
    });
    text('Charges', 924, 446, '#8a8ab0', 10, 'right');
    if (this.ui && (this.ui.kind === 'cmd' || this.ui.kind === 'list')) this.ui.menu.draw();
    if (this.ui && this.ui.kind === 'target' && this.ui.back && this.prevUIWasList) { }
  }
}
class GameOverScene {
  constructor() { this.opaque = true; this.t = 0; this.menu = new ListMenu([{ text: 'Load last save', disabled: !hasSave() }, { text: 'Return to title' }], { x: 330, y: 380, w: 300 }); this.menu.index = hasSave() ? 0 : 1; }
  update() { this.t++; if (this.t < 30) return; const r = this.menu.update(); if (r && r.select) { if (r.index === 0) continueGame(); else toTitle(); } }
  draw() { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); text('GAME OVER', W / 2, 220, '#c02030', 36, 'center'); text('The light fades... but not forever.', W / 2, 290, '#a0a0c0', 14, 'center'); if (this.t > 30) this.menu.draw(); }
}

// ---------------------------------------------------------------------------
// Battle backdrops (painted at 1/4 res, scaled up for a pixel look)
// ---------------------------------------------------------------------------
const _bgCache = {};
function battleBg(name) {
  if (_bgCache[name]) return _bgCache[name];
  const w = 240, h = 108, c = mkCanvas(w, h), x = c.getContext('2d');
  const R = srand(name.length * 999 + name.charCodeAt(0));
  const grad = (y0, y1, a, b) => { for (let y = y0; y < y1; y++) { x.fillStyle = mix(a, b, (y - y0) / Math.max(1, y1 - y0 - 1)); x.fillRect(0, y, w, 1); } };
  const hills = (base, amp, col, seed) => { x.fillStyle = col; for (let i = 0; i < w; i++) { const hh = base + Math.sin(i * 0.05 + seed) * amp + Math.sin(i * 0.13 + seed * 2) * amp * 0.4; x.fillRect(i, Math.round(hh), 1, h); } };
  const ground = (y0, a, b, lines) => { grad(y0, h, a, b); if (lines) for (let i = 0; i < 6; i++) { const y = y0 + Math.round(Math.pow(i / 6, 1.6) * (h - y0)); x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(0, y, w, 1); } };
  const tree = (tx, ty, s, col) => { x.fillStyle = '#3a2414'; x.fillRect(tx - 1, ty, 2, s); x.fillStyle = col; for (let j = 0; j < s; j++) { const ww = Math.round((s - j) * 0.6); x.fillRect(tx - ww, ty - j, ww * 2 + 1, 1); } };
  const pillar = (px, top, bot, col) => { x.fillStyle = col; x.fillRect(px, top, 8, bot - top); x.fillStyle = shade(col, 1.3); x.fillRect(px, top, 2, bot - top); x.fillStyle = shade(col, 0.6); x.fillRect(px + 6, top, 2, bot - top); x.fillStyle = shade(col, 1.1); x.fillRect(px - 2, top, 12, 3); x.fillRect(px - 2, bot - 3, 12, 3); };
  switch (name) {
    case 'plains': grad(0, 60, '#5aa0f0', '#bfe4ff'); x.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { const cx = R() * w, cy = 8 + R() * 25; x.fillRect(cx, cy, 20, 4); x.fillRect(cx + 4, cy - 3, 12, 3); } hills(44, 6, '#6a9a7a', 1); hills(54, 4, '#4a8a3a', 3); ground(60, '#5aa83e', '#3a7a2a', true); break;
    case 'beach': grad(0, 50, '#5aa0f0', '#cfeaff'); grad(50, 68, '#3a78c8', '#6aa8e8'); ground(68, '#e2cc8c', '#c8b070', true); break;
    case 'forest': grad(0, 60, '#2a4a3a', '#6a9a7a'); for (let i = 0; i < 26; i++) tree(Math.round(R() * w), 40 + R() * 20, 18 + R() * 16, i % 2 ? '#1e4a24' : '#2a5a2a'); ground(62, '#3e7a2e', '#2a5a1e', true); break;
    case 'sea': grad(0, 46, '#4a88e0', '#c8e4ff'); grad(46, 108, '#2a5ab8', '#1a3a88'); x.fillStyle = '#8ab8f0'; for (let i = 0; i < 40; i++) x.fillRect(R() * w, 48 + R() * 60, 6, 1); x.fillStyle = '#7a4a20'; x.fillRect(0, 92, w, 16); x.fillStyle = '#a0662c'; x.fillRect(0, 90, w, 3); for (let i = 0; i < w; i += 12) { x.fillStyle = '#5a3418'; x.fillRect(i, 93, 1, 15); } break;
    case 'swamp': grad(0, 60, '#3a4a3a', '#8a9a7a'); for (let i = 0; i < 10; i++) { const tx = R() * w; x.fillStyle = '#2a2a1e'; x.fillRect(tx, 20 + R() * 20, 2, 40); x.fillRect(tx - 5, 30 + R() * 10, 12, 1); } ground(60, '#4e5e36', '#2e3e22', true); x.fillStyle = '#2e4a3e'; for (let i = 0; i < 8; i++) x.fillRect(R() * w, 66 + R() * 40, 20 + R() * 20, 3); break;
    case 'temple': grad(0, 70, '#1a0e0c', '#4a2a22'); for (let i = 0; i < 7; i++) pillar(10 + i * 36, 6, 72, '#8a6a5a'); ground(72, '#5e524a', '#3a302a', true); x.fillStyle = 'rgba(255,120,40,0.25)'; x.fillRect(0, 60, w, 12); break;
    case 'cave': grad(0, 70, '#141a10', '#3a4a2e'); x.fillStyle = '#2a3420'; for (let i = 0; i < 16; i++) { const sx = R() * w; x.fillRect(sx, 0, 6, 10 + R() * 20); } ground(66, '#4a4a36', '#2a2a1e', true); x.fillStyle = '#2e5a52'; for (let i = 0; i < 5; i++) x.fillRect(R() * w, 74 + R() * 30, 24, 3); break;
    case 'town': grad(0, 60, '#5aa0f0', '#cfeaff'); for (let i = 0; i < 6; i++) { const bx = i * 42 + 4; x.fillStyle = '#e4d4b4'; x.fillRect(bx, 34, 30, 28); x.fillStyle = '#3a5ab0'; x.fillRect(bx - 3, 26, 36, 9); x.fillStyle = '#5a3a20'; x.fillRect(bx + 12, 48, 6, 14); } ground(62, '#9a9aa4', '#6a6a74', true); break;
    case 'keep': grad(0, 72, '#0a0614', '#2a2040'); const disc = (cx, cy, r, col) => { x.fillStyle = col; for (let j = -r; j <= r; j++) { const ww = Math.round(Math.sqrt(r * r - j * j)); x.fillRect(cx - ww, cy + j, ww * 2 + 1, 1); } }; disc(120, 20, 7, '#e8e8ff'); disc(124, 18, 6, '#0e0a1a'); for (let i = 0; i < 7; i++) pillar(10 + i * 36, 4, 74, '#4e4462'); ground(74, '#524866', '#2a2238', true); x.fillStyle = '#6e1a4e'; x.fillRect(96, 74, 48, 34); break;
    case 'dusk': grad(0, 60, '#2a1840', '#a05070'); hills(40, 8, '#2a2238', 2); hills(52, 4, '#1e1a28', 5); ground(60, '#3e5a36', '#1e2a1a', true); break;
    default: grad(0, h, '#222', '#444');
  }
  const big = mkCanvas(W, FIELD_H + 8), bx = big.getContext('2d'); bx.imageSmoothingEnabled = false; bx.drawImage(c, 0, 0, w, h, 0, 0, W, FIELD_H + 8);
  return (_bgCache[name] = big);
}
function mix(a, b, k) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const r = (pa >> 16) + ((pb >> 16) - (pa >> 16)) * k, g = ((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * k, bb = (pa & 255) + ((pb & 255) - (pa & 255)) * k; return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(bb)})`; }
