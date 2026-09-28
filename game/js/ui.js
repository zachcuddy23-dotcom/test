'use strict';
// ---------------------------------------------------------------------------
// Dialog, prompts, notifications
// ---------------------------------------------------------------------------
function HERO(id) { return { name: HEROES[id].name, face: HEROES[id].face }; }
class DialogScene {
  constructor(who, str, resolve, choices) {
    this.who = who && typeof who === 'object' ? who : (who ? { name: who } : null);
    this.face = this.who && this.who.face && IMG[this.who.face];
    this.tw = this.face ? 700 : 860;
    this.pages = []; const lines = wrapText(str, this.tw);
    for (let i = 0; i < lines.length; i += 4) this.pages.push(lines.slice(i, i + 4));
    this.page = 0; this.chars = 0; this.resolve = resolve; this.choices = choices; this.menu = null;
  }
  get full() { return this.pages[this.page].join('\n'); }
  update() {
    if (this.menu) {
      const r = this.menu.update();
      if (r && r.select) { Game.pop(this); this.resolve(r.index); }
      else if (r && r.cancel) { Game.pop(this); this.resolve(this.choices.length - 1); }
      return;
    }
    const n = this.full.length;
    if (this.chars < n) { this.chars += Input.held.a ? 4 : 2; if (Input.ok()) this.chars = n; return; }
    const last = this.page >= this.pages.length - 1;
    if (last && this.choices) { this.menu = new ListMenu(this.choices.map(t => ({ text: t })), { x: 700, y: 440 - (this.choices.length * 36 + 40) - 6, w: 240 }); return; }
    if (Input.ok() || Input.hit('b')) {
      Audio2.sfx('cursor');
      if (last) { Game.pop(this); this.resolve(); } else { this.page++; this.chars = 0; }
    }
  }
  draw() {
    const y = 440, h = 190;
    drawWindow(12, y, W - 24, h);
    let tx = 40;
    if (this.face) { ctx.fillStyle = '#000'; ctx.fillRect(34, y + 28, 132, 132); ctx.drawImage(this.face, 36, y + 30, 128, 128); tx = 190; }
    let ty = y + 26;
    if (this.who && this.who.name) { text(this.who.name, tx, ty, '#ffe070'); ty += 30; }
    let left = Math.floor(this.chars);
    const lines = this.pages[this.page], maxL = this.who && this.who.name ? 4 : 4;
    for (const ln of lines.slice(0, maxL)) { if (left <= 0) break; text(ln.slice(0, left), tx, ty); left -= ln.length + 1; ty += 30; }
    if (this.chars >= this.full.length && !this.menu && Math.floor(Game.frame / 15) % 2) text('▼', W - 60, y + h - 40, '#fff', 14);
    if (this.menu) this.menu.draw();
  }
}
function say(who, str) { if (!str) return Promise.resolve(); return new Promise(res => Game.push(new DialogScene(who, str, res))); }
function ask(who, str, choices) { return new Promise(res => Game.push(new DialogScene(who, str, res, choices))); }
class NotifyScene {
  constructor(str, res) { this.str = str; this.res = res; this.t = 0; }
  update() { this.t++; if (this.t > 10 && (Input.ok() || Input.hit('b'))) { Game.pop(this); this.res(); } }
  draw() { const w = Math.min(900, textW(this.str) + 80); drawWindow((W - w) / 2, 250, w, 80); text(this.str, W / 2, 280, '#fff', 16, 'center'); }
}
function notify(str) { Audio2.sfx('chest'); return new Promise(res => Game.push(new NotifyScene(str, res))); }

// ---------------------------------------------------------------------------
// Party panel helper
// ---------------------------------------------------------------------------
function drawMemberRow(m, x, y, w) {
  const face = IMG[HEROES[m.id].face];
  ctx.fillStyle = '#000'; ctx.fillRect(x - 2, y - 2, 76, 76);
  if (face) { if (!alive(m)) ctx.globalAlpha = 0.35; ctx.drawImage(face, x, y, 72, 72); ctx.globalAlpha = 1; }
  const tx = x + 92;
  text(m.name, tx, y + 2, alive(m) ? '#fff' : '#ff6060');
  text(CLASSES[m.cls].name, tx + 170, y + 2, '#a8c0ff', 12);
  text(`Lv ${m.lvl}`, tx, y + 28, '#fff', 14);
  const st = !alive(m) ? 'KO' : m.status.poison ? 'PSN' : m.status.blind ? 'BLD' : m.status.sleep ? 'SLP' : '';
  if (st) text(st, tx + 90, y + 28, '#ff8080', 14);
  text(`HP ${m.hp}/${m.mhp}`, tx + 170, y + 28, m.hp < m.mhp / 4 ? '#ffd040' : '#fff', 14);
  bar(tx + 170, y + 48, 180, 8, m.hp / m.mhp, m.hp < m.mhp / 4 ? '#e0a020' : '#40d060');
  const mc = maxCharges(m);
  text(`${CLASSES[m.cls].magic.slice(0, 3).toUpperCase()} ${m.charges.map((c, i) => mc[i] ? `${c}/${mc[i]}` : '-').join(' ')}`, tx, y + 52, '#c8b0ff', 12);
}
function partyPicker(o = {}) {
  // returns a ListMenu-like chooser over party members drawn in the left panel
  const items = S().party.map(m => ({ text: '', m, disabled: o.filter ? !o.filter(m) : false }));
  return new ListMenu(items, { x: 0, y: 0, w: 1, rowH: 110, window: false, pad: 0 });
}

// ---------------------------------------------------------------------------
// Main menu (field)
// ---------------------------------------------------------------------------
class MenuScene {
  constructor(res) {
    this.res = res; this.mode = 'root';
    this.root = new ListMenu(['Items', 'Magic', 'Equip', 'Status', 'Order', 'Save', 'Sound'].map(t => ({ text: t })), { x: 700, y: 12, w: 248, rowH: 38 });
    this.pick = null; this.sub = null; this.msg = ''; this.opaque = true;
  }
  close() { Game.pop(this); this.res && this.res(); }
  update() {
    if (this.sub) { const done = this.sub.update(); if (done) this.sub = null; return; }
    if (this.pick) {
      const r = this.pick.menu.update();
      if (r && r.cancel) { this.pick = null; return; }
      if (r && r.select) { const cb = this.pick.cb; this.pick = null; cb(r.select.m, r.index); }
      return;
    }
    const r = this.root.update();
    if (!r) { if (Input.hit('menu')) { Audio2.sfx('cancel'); this.close(); } return; }
    if (r.cancel) return this.close();
    const t = r.select.text;
    if (t === 'Items') this.sub = new ItemsPanel(this);
    if (t === 'Magic') this.choose(m => { this.sub = new MagicPanel(this, m); });
    if (t === 'Equip') this.choose(m => { this.sub = new EquipPanel(this, m); });
    if (t === 'Status') this.choose(m => { this.sub = new StatusPanel(this, m); });
    if (t === 'Order') this.choose((m, i) => { this.choose((m2, j) => { const p = S().party;[p[i], p[j]] = [p[j], p[i]]; Audio2.sfx('ok'); }); });
    if (t === 'Save') {
      const f = Game.field;
      if (f && f.map.enc && !f.map.world) { this.msg = "You can't save inside a dungeon."; Audio2.sfx('error'); }
      else { this.msg = saveGame() ? 'Game saved.' : 'Saving is unavailable here.'; }
    }
    if (t === 'Sound') { this.msg = Audio2.toggleMute() ? 'Sound off.' : 'Sound on.'; }
  }
  choose(cb, filter) { const menu = partyPicker({ filter }); this.pick = { menu, cb }; }
  drawParty(cursorIdx) {
    drawWindow(12, 12, 680, 360 + 0);
    S().party.forEach((m, i) => {
      drawMemberRow(m, 40, 36 + i * 110, 600);
      if (cursorIdx === i) drawCursor(40, 60 + i * 110);
    });
  }
  draw() {
    ctx.fillStyle = '#060a24'; ctx.fillRect(0, 0, W, H);
    if (this.sub && this.sub.fullscreen) { this.sub.draw(); return; }
    this.drawParty(this.pick ? this.pick.menu.index : -1);
    this.root.draw(!this.pick && !this.sub);
    drawWindow(700, 320, 248, 120);
    text(`${S().gold} G`, 930, 346, '#ffe070', 16, 'right');
    const t = Math.floor(S().playTime / 60), hh = Math.floor(t / 3600), mm = Math.floor(t / 60) % 60;
    text(`${hh}:${String(mm).padStart(2, '0')}`, 930, 380, '#fff', 16, 'right');
    drawWindow(12, 380, 680, 60 + 0);
    const loc = Game.field ? Game.field.map.name : '';
    text(this.msg || loc, 36, 402, this.msg ? '#ffe070' : '#fff');
    if (this.sub) this.sub.draw();
  }
}
function openMenu() { return new Promise(res => Game.push(new MenuScene(res))); }

class ItemsPanel {
  constructor(menu) { this.menu = menu; this.build(); this.pick = null; }
  build() {
    const it = Object.entries(S().items).map(([id, n]) => ({ text: ITEMS[id].name, right: n, id, disabled: !ITEMS[id].field }));
    const keys = S().keys.map(id => ({ text: KEY_ITEMS[id].name, id, key: true, color: '#ffe070' }));
    const idx = this.list ? this.list.index : 0;
    this.list = new ListMenu(it.concat(keys), { x: 12, y: 448, w: 936, rows: 3, cols: 2, rowH: 34, index: idx });
    this.list.h = 180;
  }
  update() {
    if (this.pick) {
      const r = this.pick.update();
      if (r && r.cancel) this.pick = null;
      else if (r && r.select) { const msg = useItemField(this.list.cur.id, r.select.m); this.menu.msg = msg || ''; if (!S().items[this.list.cur.id]) this.pick = null; this.build(); }
      return false;
    }
    const r = this.list.update();
    if (r && r.cancel) { this.menu.msg = ''; return true; }
    if (this.list.cur) { const c = this.list.cur; this.menu.msg = c.key ? KEY_ITEMS[c.id].desc : ITEMS[c.id].desc; }
    if (r && r.select) {
      const c = r.select; if (c.key) return false;
      const d = ITEMS[c.id];
      if (d.target === 'none') { this.menu.msg = useItemField(c.id, null) || ''; this.build(); }
      else this.pick = partyPicker();
    }
    return false;
  }
  draw() {
    if (this.pick) S().party.forEach((m, i) => { if (i === this.pick.index) drawCursor(40, 60 + i * 110); });
    this.list.draw(!this.pick);
  }
}
function useItemField(id, m) {
  const d = ITEMS[id]; if (!d || !S().items[id]) return '';
  if (d.kind === 'camp') {
    if (!Game.field || !Game.field.map.world) { Audio2.sfx('error'); return 'Only usable on the world map.'; }
    removeItem(id); for (const p of S().party) if (alive(p)) p.hp = Math.min(p.mhp, p.hp + d.pow);
    Audio2.sfx('heal'); saveGame(); return 'You rest by the fire. HP restored. Game saved.';
  }
  const r = applyItem(d, m); if (!r.ok) { Audio2.sfx('error'); return r.msg; }
  removeItem(id); Audio2.sfx('heal'); return r.msg;
}
function applyItem(d, m) {
  if (d.kind === 'heal') { if (!alive(m) || m.hp >= m.mhp) return { ok: false, msg: 'No effect.' }; const v = Math.min(m.mhp - m.hp, d.pow); m.hp += v; return { ok: true, msg: `${m.name} recovers ${v} HP.`, v }; }
  if (d.kind === 'cure') { if (!alive(m) || !d.cures.some(s => m.status[s])) return { ok: false, msg: 'No effect.' }; for (const s of d.cures) delete m.status[s]; return { ok: true, msg: `${m.name} is cured.` }; }
  if (d.kind === 'revive') { if (alive(m)) return { ok: false, msg: 'No effect.' }; m.hp = Math.max(1, Math.floor(m.mhp / 4)); m.status = {}; return { ok: true, msg: `${m.name} is revived!` }; }
  if (d.kind === 'charges') { if (!alive(m)) return { ok: false, msg: 'No effect.' }; const mc = maxCharges(m); m.charges = m.charges.map((c, i) => Math.min(mc[i], c + 1)); return { ok: true, msg: `${m.name}'s spell charges restored.` }; }
  return { ok: false, msg: "Can't use that here." };
}
function castSpellField(caster, sid, target) {
  const sp = SPELLS[sid];
  if (caster.charges[sp.tier - 1] <= 0) return { ok: false, msg: 'No charges left for that tier.' };
  let res;
  if (sp.kind === 'heal') {
    const ts = sp.target === 'allies' ? S().party.filter(alive) : [target];
    if (!ts.some(t => alive(t) && t.hp < t.mhp)) return { ok: false, msg: 'No effect.' };
    for (const t of ts) if (alive(t)) t.hp = Math.min(t.mhp, t.hp + healAmount(sp, stats(caster).mag));
    res = { ok: true, msg: 'HP restored.' };
  } else res = applyItem(sp.kind === 'cure' ? sp : { kind: sp.kind }, target);
  if (res.ok) { caster.charges[sp.tier - 1]--; Audio2.sfx('heal'); } else Audio2.sfx('error');
  return res;
}
function healAmount(sp, mag) { return Math.floor(rnd(sp.pow, sp.pow * 2) * (1 + mag / 80)); }

class MagicPanel {
  constructor(menu, m) { this.menu = menu; this.m = m; this.build(); this.pick = null; }
  build() {
    const mc = maxCharges(this.m);
    const items = this.m.spells.slice().sort((a, b) => SPELLS[a].tier - SPELLS[b].tier).map(id => { const s = SPELLS[id]; return { text: `${s.name}`, right: `T${s.tier} ${this.m.charges[s.tier - 1]}/${mc[s.tier - 1]}`, id, disabled: !s.field || !alive(this.m) }; });
    const idx = this.list ? this.list.index : 0;
    this.list = new ListMenu(items.length ? items : [{ text: '(no spells)', disabled: true }], { x: 12, y: 448, w: 936, rows: 3, cols: 2, rowH: 34, title: `${this.m.name}'s ${CLASSES[this.m.cls].magic}`, index: idx });
    this.list.h = 180;
  }
  update() {
    if (this.pick) {
      const r = this.pick.update();
      if (r && r.cancel) this.pick = null;
      else if (r && r.select) { const res = castSpellField(this.m, this.list.cur.id, r.select.m); this.menu.msg = res.msg; this.build(); if (SPELLS[this.list.cur.id].target === 'allies') this.pick = null; }
      return false;
    }
    const r = this.list.update();
    if (this.list.cur && this.list.cur.id) this.menu.msg = SPELLS[this.list.cur.id].desc;
    if (r && r.cancel) { this.menu.msg = ''; return true; }
    if (r && r.select && r.select.id) {
      const sp = SPELLS[r.select.id];
      if (sp.target === 'allies') { const res = castSpellField(this.m, r.select.id, null); this.menu.msg = res.msg; this.build(); }
      else this.pick = partyPicker();
    }
    return false;
  }
  draw() { if (this.pick) drawCursor(40, 60 + this.pick.index * 110); this.list.draw(!this.pick); }
}

class EquipPanel {
  constructor(menu, m) { this.menu = menu; this.m = m; this.fullscreen = true; this.slots = new ListMenu(['weapon', 'body', 'acc'].map(s => ({ text: '', slot: s })), { x: 12, y: 150, w: 600, rowH: 44, rows: 3 }); this.list = null; }
  buildList() {
    const slot = this.slots.cur.slot;
    const items = [{ text: '(remove)', id: null }].concat(Object.entries(S().bag).filter(([id]) => EQUIP[id].slot === slot && canEquip(this.m, id)).map(([id, n]) => ({ text: EQUIP[id].name, right: n, id })));
    if (slot === 'weapon') items.shift();
    if (!items.length) items.push({ text: '(nothing to equip)', disabled: true, none: true });
    this.list = new ListMenu(items, { x: 12, y: 330, w: 600, rows: 6, rowH: 36 });
  }
  update() {
    if (this.list) {
      const r = this.list.update();
      if (r && r.cancel) this.list = null;
      else if (r && r.select) {
        const slot = this.slots.cur.slot, old = this.m.equip[slot], nid = r.select.id;
        if (old) addItem(old); if (nid) removeItem(nid);
        this.m.equip[slot] = nid; this.m.hp = Math.min(this.m.hp, this.m.mhp); this.list = null;
      }
      return false;
    }
    const r = this.slots.update();
    if (r && r.cancel) return true;
    if (r && r.select) this.buildList();
    return false;
  }
  draw() {
    const m = this.m, st = stats(m);
    drawWindow(12, 12, 600, 130);
    drawMemberRow(m, 40, 36, 560);
    drawWindow(12, 150, 600, 172);
    ['Weapon', 'Body', 'Acc.'].forEach((lbl, i) => {
      const id = m.equip[['weapon', 'body', 'acc'][i]];
      text(lbl, 60, 174 + i * 44, '#a8c0ff'); text(id ? EQUIP[id].name : '-', 220, 174 + i * 44);
      if (this.slots.index === i) drawCursor(60, 174 + i * 44, !!this.list);
    });
    // stat preview
    let prev = null;
    if (this.list && this.list.cur && !this.list.cur.none) { const slot = this.slots.cur.slot; const clone = { ...m, equip: { ...m.equip, [slot]: this.list.cur.id } }; prev = stats(clone); }
    drawWindow(620, 12, 328, 616);
    const rows = [['Attack', 'atk'], ['Accuracy', 'hit'], ['Hits', 'hits'], ['Defense', 'def'], ['Magic', 'mag'], ['M.Defense', 'mdef'], ['Critical', 'crit']];
    rows.forEach(([lbl, k], i) => {
      text(lbl, 648, 44 + i * 40, '#a8c0ff', 14); text(String(st[k]), 850, 44 + i * 40, '#fff', 14, 'right');
      if (prev) { const d = prev[k] - st[k]; text(String(prev[k]), 920, 44 + i * 40, d > 0 ? '#60ff80' : d < 0 ? '#ff6060' : '#fff', 14, 'right'); }
    });
    const cur = this.list ? this.list.cur : null, eid = cur && !cur.none ? cur.id : m.equip[this.slots.cur.slot];
    if (eid && EQUIP[eid]) { const lines = wrapText(EQUIP[eid].desc || describeEquip(EQUIP[eid]), 270, 12); lines.forEach((l, i) => text(l, 648, 340 + i * 22, '#e0e0e0', 12)); }
    if (this.list) this.list.draw(); else { drawWindow(12, 330, 600, 298); text('Choose a slot to change.', 40, 360, '#a8a8c8', 14); }
  }
}
function describeEquip(e) {
  const p = []; if (e.atk) p.push(`Atk ${e.atk}`); if (e.hit) p.push(`Acc ${e.hit}`); if (e.def) p.push(`Def ${e.def}`); if (e.mdef) p.push(`MDef ${e.mdef}`); if (e.mag) p.push(`Mag +${e.mag}`); if (e.crit) p.push(`Crit +${e.crit}`); if (e.str) p.push(`Str +${e.str}`); if (e.luck) p.push(`Luck +${e.luck}`);
  const who = S().party.filter(m => e.cls.includes(CLASSES[m.cls].letter)).map(m => m.name).join(', ');
  return p.join('  ') + (who ? `\nFor: ${who}` : '');
}
class StatusPanel {
  constructor(menu, m) { this.menu = menu; this.m = m; this.fullscreen = true; }
  update() { if (Input.cancel() || Input.ok()) { Audio2.sfx('cancel'); return true; } const i = S().party.indexOf(this.m); if (Input.rep('right') || Input.rep('down')) this.m = S().party[(i + 1) % S().party.length]; if (Input.rep('left') || Input.rep('up')) this.m = S().party[(i + S().party.length - 1) % S().party.length]; return false; }
  draw() {
    const m = this.m, st = stats(m), img = IMG[HEROES[m.id].img];
    drawWindow(12, 12, 936, 616);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(40, 40, 360, 560);
    if (img) { const s = 2; ctx.drawImage(img, 40 + (360 - img.width * s) / 2, 60 + (300 - img.height * s) / 2 + 40, img.width * s, img.height * s); }
    text(m.name, 440, 44, '#ffe070', 24); text(CLASSES[m.cls].name, 440, 84, '#a8c0ff');
    text(`Level ${m.lvl}`, 440, 124); text(`EXP ${m.exp}`, 640, 124); text(`Next ${nextExp(m)}`, 640, 154, '#c8c8e0', 14);
    text(`HP ${m.hp} / ${m.mhp}`, 440, 184);
    const base = [['STR', st.str], ['AGI', m.agi], ['INT', m.int], ['VIT', m.vit], ['LUCK', st.luck]];
    base.forEach(([l, v], i) => { text(l, 440, 230 + i * 34, '#a8c0ff', 14); text(String(v), 580, 230 + i * 34, '#fff', 14, 'right'); });
    const d = [['Attack', st.atk], ['Accuracy', st.hit], ['Hits', `x${st.hits}`], ['Defense', st.def], ['Evasion', st.eva], ['Magic', st.mag], ['M.Def', st.mdef]];
    d.forEach(([l, v], i) => { text(l, 640, 230 + i * 34, '#a8c0ff', 14); text(String(v), 910, 230 + i * 34, '#fff', 14, 'right'); });
    const mc = maxCharges(m);
    text(`${CLASSES[m.cls].magic} charges`, 440, 490, '#c8b0ff', 14);
    text(m.charges.map((c, i) => `T${i + 1} ${c}/${mc[i]}`).join('   '), 440, 520, '#fff', 14);
    text('◀ ▶ switch   X back', 440, 580, '#8888aa', 12);
  }
}

// ---------------------------------------------------------------------------
// Shops, inn, clinic
// ---------------------------------------------------------------------------
class ShopScene {
  constructor(kind, list, res) {
    this.kind = kind; this.list = list; this.res = res; this.opaque = false;
    this.top = new ListMenu([{ text: 'Buy' }, { text: 'Sell' }, { text: 'Leave' }], { x: 12, y: 12, w: 240 });
    if (kind === 'magic') this.top = new ListMenu([{ text: 'Buy' }, { text: 'Leave' }], { x: 12, y: 12, w: 240 });
    this.mode = 'top'; this.msg = { weapon: 'Weapons! Finest steel in town.', armor: 'Armor to keep your hide intact.', item: 'Potions, cures, supplies.', magic: 'Spells for every path. Charges refill at the inn.' }[kind];
  }
  buyItems() {
    return this.list.map(id => {
      const d = this.kind === 'magic' ? SPELLS[id] : (ITEMS[id] || EQUIP[id]);
      return { text: d.name, right: d.price, id };
    });
  }
  sellItems() {
    const out = [];
    for (const [id, n] of Object.entries(S().items)) if (ITEMS[id].price) out.push({ text: ITEMS[id].name, right: `${Math.floor(ITEMS[id].price / 2)}`, id, n });
    for (const [id, n] of Object.entries(S().bag)) out.push({ text: `${EQUIP[id].name} x${n}`, right: `${Math.floor((EQUIP[id].price || 400) / 2)}`, id, n });
    return out.length ? out : [{ text: '(nothing to sell)', disabled: true }];
  }
  update() {
    if (this.pick) {
      const r = this.pick.update();
      if (r && r.cancel) this.pick = null;
      else if (r && r.select) this.learn(r.select.m);
      return;
    }
    if (this.mode === 'top') {
      const r = this.top.update();
      if (r && r.cancel) return this.leave();
      if (r && r.select) {
        if (r.select.text === 'Leave') return this.leave();
        if (r.select.text === 'Buy') { this.mode = 'buy'; this.menu = new ListMenu(this.buyItems(), { x: 12, y: 150, w: 520, rows: 7 }); }
        if (r.select.text === 'Sell') { this.mode = 'sell'; this.menu = new ListMenu(this.sellItems(), { x: 12, y: 150, w: 520, rows: 7 }); }
      }
      return;
    }
    const r = this.menu.update();
    if (r && r.cancel) { this.mode = 'top'; return; }
    if (this.mode === 'buy' && r && r.select) this.buy(r.select.id);
    if (this.mode === 'sell' && r && r.select && r.select.id) {
      const id = r.select.id, price = Math.floor(((ITEMS[id] || EQUIP[id]).price || 400) / 2);
      removeItem(id); S().gold += price; Audio2.sfx('buy'); this.msg = `Sold for ${price} G.`;
      const i = this.menu.index; this.menu = new ListMenu(this.sellItems(), { x: 12, y: 150, w: 520, rows: 7, index: i });
    }
  }
  buy(id) {
    if (this.kind === 'magic') {
      const sp = SPELLS[id];
      if (S().gold < sp.price) { Audio2.sfx('error'); this.msg = "You can't afford that."; return; }
      this.pick = partyPicker({ filter: m => m.cls === sp.cls && !m.spells.includes(id) }); this.pickId = id;
      if (!S().party.some(m => m.cls === sp.cls && !m.spells.includes(id))) { this.pick = null; Audio2.sfx('error'); this.msg = 'Nobody can learn that, or it\'s already known.'; }
      else this.msg = `Who will learn ${sp.name}? (${CLASSES[sp.cls].name} only)`;
      return;
    }
    const d = ITEMS[id] || EQUIP[id];
    if (S().gold < d.price) { Audio2.sfx('error'); this.msg = "You can't afford that."; return; }
    S().gold -= d.price; addItem(id); Audio2.sfx('buy');
    this.msg = EQUIP[id] ? `Bought ${d.name}. Equip it from the menu.` : `Bought ${d.name}.`;
  }
  learn(m) {
    const sp = SPELLS[this.pickId]; S().gold -= sp.price; m.spells.push(this.pickId); Audio2.sfx('buy');
    this.msg = `${m.name} learned ${sp.name}!`; this.pick = null;
  }
  leave() { Game.pop(this); this.res(); }
  draw() {
    drawWindow(12, 12, 240, 130 + (this.kind === 'magic' ? -36 : 0));
    this.top.draw(this.mode === 'top');
    drawWindow(260, 12, 688, 130);
    const lines = wrapText(this.msg || '', 630, 14); lines.slice(0, 3).forEach((l, i) => text(l, 284, 36 + i * 28, '#fff', 14));
    text(`${S().gold} G`, 920, 100, '#ffe070', 16, 'right');
    if (this.mode !== 'top') {
      this.menu.draw(!this.pick);
      drawWindow(540, 150, 408, 478);
      const cur = this.menu.cur;
      if (cur && cur.id) {
        const id = cur.id, d = this.kind === 'magic' && this.mode === 'buy' ? SPELLS[id] : (ITEMS[id] || EQUIP[id]);
        let desc = d.desc || (EQUIP[id] ? describeEquip(EQUIP[id]) : '');
        if (this.kind === 'magic' && this.mode === 'buy') desc = `${CLASSES[d.cls].name} - Tier ${d.tier}\n${d.desc}`;
        wrapText(desc, 360, 14).forEach((l, i) => text(l, 564, 176 + i * 26, '#e8e8ff', 14));
        // party compatibility
        S().party.forEach((m, i) => {
          let ok, note = '';
          if (this.kind === 'magic') { ok = m.cls === d.cls; if (m.spells.includes(id)) note = 'Known'; }
          else if (EQUIP[id]) { ok = canEquip(m, id); const e = EQUIP[id], cur2 = EQUIP[m.equip[e.slot]]; if (ok) { const k = e.slot === 'weapon' ? 'atk' : 'def'; const dv = (e[k] || 0) - ((cur2 && cur2[k]) || 0); note = dv > 0 ? `▲${dv}` : dv < 0 ? `▼${-dv}` : '='; } }
          else ok = true;
          const y = 470 + i * 50, face = IMG[HEROES[m.id].face];
          ctx.globalAlpha = ok ? 1 : 0.3; if (face) ctx.drawImage(face, 564, y - 6, 40, 40); text(m.name, 616, y + 6, ok ? '#fff' : '#777', 14); ctx.globalAlpha = 1;
          if (note) text(note, 920, y + 6, note[0] === '▲' ? '#60ff80' : note[0] === '▼' ? '#ff6060' : '#ffe070', 14, 'right');
        });
        if (this.mode === 'buy' && ITEMS[id]) text(`Have: ${S().items[id] || 0}`, 564, 430, '#c8c8e0', 14);
      }
    }
    if (this.pick) { drawWindow(260, 150, 688, 360); S().party.forEach((m, i) => { const dis = this.pick.items[i].disabled; ctx.globalAlpha = dis ? 0.4 : 1; drawMemberRow(m, 300, 176 + i * 110, 600); ctx.globalAlpha = 1; if (i === this.pick.index) drawCursor(300, 200 + i * 110); }); }
  }
}
function openShop(kind, shopId) {
  const sh = SHOPS[shopId];
  if (kind === 'inn') return innEvent(sh.inn);
  if (kind === 'clinic') return clinicEvent(sh.clinic);
  return new Promise(res => Game.push(new ShopScene(kind, sh[kind], res)));
}
async function innEvent(price) {
  const c = await ask('Innkeeper', `Welcome, travelers! A night's rest is ${price} G. It restores your HP and spell charges, and saves your journey. Stay?`, ['Stay', 'Leave']);
  if (c !== 0) return;
  if (S().gold < price) { Audio2.sfx('error'); return say('Innkeeper', "Sorry, you don't have enough gold."); }
  S().gold -= price;
  Audio2.music(null); await fadeOut(40); healAll(); await wait(40); Audio2.sfx('heal');
  const ok = saveGame(); await fadeIn(40); Audio2.music(Game.field.map.music);
  await say('Innkeeper', ok ? 'Good morning! Your journey has been saved. Take care out there.' : 'Good morning! Take care out there.');
}
async function clinicEvent(price) {
  const dead = S().party.filter(m => !alive(m));
  if (!dead.length) return say('Healer', 'Everyone looks healthy. Come back if one of you falls in battle.');
  for (const m of dead) {
    const cost = price * m.lvl;
    const c = await ask('Healer', `${m.name} has fallen. I can revive them for ${cost} G.`, ['Revive', 'Leave']);
    if (c !== 0) return;
    if (S().gold < cost) { Audio2.sfx('error'); return say('Healer', 'Sorry, that isn\'t enough gold.'); }
    S().gold -= cost; m.hp = 1; m.status = {}; Audio2.sfx('heal');
    await say('Healer', `${m.name} is back on their feet. Rest at the inn to recover fully.`);
  }
}
