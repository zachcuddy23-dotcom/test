'use strict';
// ---------------------------------------------------------------------------
// Dialog, prompts, notifications
// ---------------------------------------------------------------------------
// Portraits for non-party speakers. Drop a PNG named after the value into
// assets/ (e.g. assets/face_vesper.png) and rebuild assets.js to show it.
const NPC_FACES = {
  'High Luminar Vesper': 'face_vesper', 'Sonia': 'face_sonia', 'Vesper': 'face_vesper', 'Sunscarred Votary': 'face_votary',
  'Warden Tamsin': 'face_tamsin', 'Harbormaster Grell': 'face_grell', 'Elder Moth': 'face_moth', 'Oracle Sef': 'face_sef',
};
function HERO(id) { return { name: HEROES[id].name, face: HEROES[id].face, look: HEROES[id].look }; }
// Portrait for a hero, falling back to a close-up of their field sprite.
const _faceFallback = {};
function faceImg(key, look) {
  if (IMG[key]) return IMG[key];
  if (!look) return null;
  if (_faceFallback[look]) return _faceFallback[look];
  const src = chibi(look, 'down', 0), c = mkCanvas(72, 72), x = c.getContext('2d');
  x.imageSmoothingEnabled = false; x.fillStyle = '#1a1e3a'; x.fillRect(0, 0, 72, 72);
  x.drawImage(src, 1, 0, 16, 14, 4, 6, 64, 56);
  return (_faceFallback[look] = c);
}
const PARTY_ROW = () => S().party.length > 3 ? 86 : 110;
class DialogScene {
  constructor(who, str, resolve, choices) {
    this.who = who && typeof who === 'object' ? who : (who ? { name: who, face: NPC_FACES[who] } : null);
    this.face = this.who && this.who.face && faceImg(this.who.face, this.who.look);
    this.tw = this.face ? 700 : 860;
    this.pages = []; const lines = wrapText(str, this.tw);
    for (let i = 0; i < lines.length; i += 4) this.pages.push(lines.slice(i, i + 4));
    this.page = 0; this.chars = 0; this.resolve = resolve; this.choices = choices; this.menu = null;
  }
  get full() { return this.pages[this.page].join('\n'); }
  leave() { Game.speaking = null; }
  update() {
    Game.speaking = this.who && this.chars < this.full.length ? this.who.name : null;
    if (this.menu) {
      const r = this.menu.update();
      if (r && r.select) { Game.pop(this); this.resolve(r.index); }
      else if (r && r.cancel) { Game.pop(this); this.resolve(this.choices.length - 1); }
      return;
    }
    const n = this.full.length;
    if (this.chars < n) { this.chars += Input.held.a ? 4 : 2; if (Input.ok()) this.chars = n; return; }
    const last = this.page >= this.pages.length - 1;
    if (last && this.choices) { this.menu = new ListMenu(this.choices.map(t => ({ text: t })), { x: 660, y: 440 - (this.choices.length * 36 + 40) - 6, w: 280 }); return; }
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
    for (const ln of this.pages[this.page]) { if (left <= 0) break; text(ln.slice(0, left), tx, ty); left -= ln.length + 1; ty += 30; }
    if (this.chars >= this.full.length && !this.menu && Math.floor(Game.frame / 15) % 2) text('▼', W - 60, y + h - 40, '#fff', 14);
    if (this.menu) this.menu.draw();
  }
}
function say(who, str) { if (!str) return Promise.resolve(); return new Promise(res => Game.push(new DialogScene(who, str, res))); }
function ask(who, str, choices) { return new Promise(res => Game.push(new DialogScene(who, str, res, choices))); }
class NotifyScene {
  constructor(str, res) { this.str = str; this.res = res; this.t = 0; }
  update() { this.t++; if (this.t > 10 && (Input.ok() || Input.hit('b'))) { Game.pop(this); this.res(); } }
  draw() { const lines = wrapText(this.str, 820); const w = Math.min(900, Math.max(...lines.map(l => textW(l))) + 80); drawWindow((W - w) / 2, 250, w, 50 + lines.length * 30); lines.forEach((l, i) => text(l, W / 2, 276 + i * 30, '#fff', 16, 'center')); }
}
function notify(str, sfx = 'chest') { if (sfx) Audio2.sfx(sfx); return new Promise(res => Game.push(new NotifyScene(str, res))); }

// ---------------------------------------------------------------------------
// Party panel helper
// ---------------------------------------------------------------------------
function drawMemberRow(m, x, y) {
  const face = faceImg(HEROES[m.id].face, HEROES[m.id].look), st = stats(m), J = JOBS[m.job];
  ctx.fillStyle = '#000'; ctx.fillRect(x - 2, y - 2, 76, 76);
  if (face) { if (!alive(m)) ctx.globalAlpha = 0.35; ctx.drawImage(face, x, y, 72, 72); ctx.globalAlpha = 1; }
  const tx = x + 92;
  text(m.name, tx, y + 2, alive(m) ? '#fff' : '#ff6060');
  text(`${J.name} ${m.jobs[m.job].lv}`, tx + 150, y + 4, J.color, 12);
  text(`Lv ${m.lvl}`, tx, y + 28, '#fff', 14);
  const stl = !alive(m) ? 'KO' : Object.keys(m.status).map(s => (STATUS_LABEL[s] || s).slice(0, 3).toUpperCase()).join(' ');
  if (stl) text(stl, tx, y + 52, '#ff8080', 12);
  text(`HP ${m.hp}/${st.mhp}`, tx + 150, y + 28, m.hp < st.mhp / 4 ? '#ffd040' : '#fff', 14);
  bar(tx + 150, y + 48, 180, 6, m.hp / st.mhp, m.hp < st.mhp / 4 ? '#e0a020' : '#40d060');
  text(`MP ${m.mp}/${st.mmp}`, tx + 370, y + 28, '#c8b0ff', 14);
  bar(tx + 370, y + 48, 100, 6, st.mmp ? m.mp / st.mmp : 0, '#8060ff');
}
function partyPicker(o = {}) {
  const items = S().party.map(m => ({ text: '', m, disabled: o.filter ? !o.filter(m) : false }));
  return new ListMenu(items, { x: 0, y: 0, w: 1, rowH: PARTY_ROW(), window: false, pad: 0 });
}
function canSaveHere() { const f = Game.field; return !!f && (f.map.world || f.nearLantern()); }

// ---------------------------------------------------------------------------
// Main menu (field)
// ---------------------------------------------------------------------------
class MenuScene {
  constructor(res) {
    this.res = res;
    this.root = new ListMenu(['Items', 'Skills', 'Job', 'Equip', 'Status', 'Order', 'Config', 'Save'].map(t => ({ text: t })), { x: 700, y: 12, w: 248, rowH: 36 });
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
    const t = r.select.text; this.msg = '';
    if (t === 'Items') this.sub = new ItemsPanel(this);
    if (t === 'Skills') this.choose(m => { this.sub = new SkillPanel(this, m); });
    if (t === 'Job') this.choose(m => { this.sub = new JobPanel(this, m); });
    if (t === 'Equip') this.choose(m => { this.sub = new EquipPanel(this, m); });
    if (t === 'Status') this.choose(m => { this.sub = new StatusPanel(this, m); });
    if (t === 'Order') this.choose((m, i) => { this.msg = 'Swap with whom?'; this.choose((m2, j) => { const p = S().party;[p[i], p[j]] = [p[j], p[i]]; Audio2.sfx('ok'); this.msg = ''; }); });
    if (t === 'Config') this.sub = new ConfigPanel(this);
    if (t === 'Save') {
      if (!canSaveHere()) { this.msg = Game.field && Game.field.map.noSaveMsg ? Game.field.map.noSaveMsg : 'Save on the world map or beside a Dawn Lantern.'; Audio2.sfx('error'); }
      else { this.msg = saveGame() ? 'Game saved.' : 'Saving is unavailable here.'; if (this.msg === 'Game saved.') Audio2.sfx('save'); }
    }
  }
  choose(cb, filter) { const menu = partyPicker({ filter }); this.pick = { menu, cb }; }
  drawParty(cursorIdx) {
    drawWindow(12, 12, 680, 360);
    S().party.forEach((m, i) => {
      drawMemberRow(m, 40, 30 + i * PARTY_ROW());
      if (cursorIdx === i) drawCursor(40, 54 + i * PARTY_ROW());
    });
  }
  draw() {
    ctx.fillStyle = '#060a24'; ctx.fillRect(0, 0, W, H);
    if (this.sub && this.sub.fullscreen) { this.sub.draw(); return; }
    this.drawParty(this.pick ? this.pick.menu.index : -1);
    this.root.draw(!this.pick && !this.sub);
    drawWindow(700, 324, 248, 116);
    text(`${S().gold} G`, 930, 348, '#ffe070', 16, 'right');
    const t = Math.floor(S().playTime / 60), hh = Math.floor(t / 3600), mm = Math.floor(t / 60) % 60;
    text(`${hh}:${String(mm).padStart(2, '0')}`, 930, 382, '#fff', 16, 'right');
    drawWindow(12, 380, 680, 60);
    const loc = Game.field ? Game.field.map.name : '';
    const msg = this.msg || loc;
    text(msg.length > 40 ? msg.slice(0, 40) : msg, 36, 402, this.msg ? '#ffe070' : '#fff', msg.length > 34 ? 12 : 16);
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
    this.list = new ListMenu(it.concat(keys), { x: 12, y: 448, w: 936, rows: 3, cols: 2, rowH: 34, index: idx, size: 14 });
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
    if (this.list.cur && this.list.cur.id) { const c = this.list.cur; this.menu.msg = c.key ? KEY_ITEMS[c.id].desc : ITEMS[c.id].desc; }
    if (r && r.select && r.select.id) {
      const c = r.select; if (c.key) return false;
      const d = ITEMS[c.id];
      if (d.target === 'none') { this.menu.msg = useItemField(c.id, null) || ''; this.build(); }
      else this.pick = partyPicker();
    }
    return false;
  }
  draw() {
    if (this.pick) drawCursor(40, 54 + this.pick.index * PARTY_ROW());
    this.list.draw(!this.pick);
    if (this.list.cur && this.list.cur.key) { const d = KEY_ITEMS[this.list.cur.id].desc; drawWindow(12, 380, 680, 60); text(d.length > 60 ? d.slice(0, 58) + '…' : d, 30, 404, '#ffe070', 11); }
  }
}
function useItemField(id, m) {
  const d = ITEMS[id]; if (!d || !S().items[id]) return '';
  if (d.kind === 'camp') {
    if (!canSaveHere()) { Audio2.sfx('error'); return 'World map or Dawn Lantern only.'; }
    removeItem(id); healAll(); Audio2.sfx('heal'); return 'You rest a while. HP and MP restored.';
  }
  const r = applyItem(d, m); if (!r.ok) { Audio2.sfx('error'); return r.msg; }
  removeItem(id); Audio2.sfx('heal'); return r.msg;
}
function applyItem(d, m) {
  const st = stats(m);
  if (d.kind === 'heal') { if (!alive(m) || m.hp >= st.mhp) return { ok: false, msg: 'No effect.' }; const v = Math.min(st.mhp - m.hp, d.pow); m.hp += v; return { ok: true, msg: `${m.name} recovers ${v} HP.` }; }
  if (d.kind === 'mp') { if (!alive(m) || m.mp >= st.mmp) return { ok: false, msg: 'No effect.' }; const v = Math.min(st.mmp - m.mp, d.pow); m.mp += v; return { ok: true, msg: `${m.name} recovers ${v} MP.` }; }
  if (d.kind === 'cure') { if (!alive(m) || !d.cures.some(s => m.status[s] != null)) return { ok: false, msg: 'No effect.' }; for (const s of d.cures) delete m.status[s]; return { ok: true, msg: `${m.name} is cured.` }; }
  if (d.kind === 'revive') { if (alive(m)) return { ok: false, msg: 'No effect.' }; m.hp = Math.max(1, Math.floor(st.mhp / 4)); m.status = {}; return { ok: true, msg: `${m.name} is back on their feet!` }; }
  return { ok: false, msg: "Can't use that here." };
}
function healAmount(sk, mag) { return Math.floor(sk.pow * (1 + mag / 22) * (0.9 + Math.random() * 0.2)); }
function castSkillField(caster, sid, target) {
  const sk = SKILLS[sid], st = stats(caster);
  if (caster.mp < sk.mp) return { ok: false, msg: 'Not enough MP.' };
  let res;
  if (sk.kind === 'heal') {
    const ts = sk.target === 'allies' ? S().party.filter(alive) : [target];
    if (!ts.some(t => alive(t) && (t.hp < stats(t).mhp || (sk.cures && sk.cures.some(s => t.status[s] != null))))) return { ok: false, msg: 'No effect.' };
    for (const t of ts) if (alive(t)) { t.hp = Math.min(stats(t).mhp, t.hp + Math.floor(healAmount(sk, st.mag) * (ts.length > 1 ? 0.75 : 1))); if (sk.cures) for (const s of sk.cures) delete t.status[s]; }
    res = { ok: true, msg: 'HP restored.' };
  } else if (sk.kind === 'cure') res = applyItem({ kind: 'cure', cures: sk.cures }, target);
  else if (sk.kind === 'revive') res = applyItem({ kind: 'revive' }, target);
  else res = { ok: false, msg: 'Only usable in battle.' };
  if (res.ok) { caster.mp -= sk.mp; Audio2.sfx('heal'); } else Audio2.sfx('error');
  return res;
}

class SkillPanel {
  constructor(menu, m) { this.menu = menu; this.m = m; this.build(); this.pick = null; }
  build() {
    const m = this.m, J = JOBS[m.job], inn = INNATE[HEROES[m.id].innate];
    const row = (id, tag) => { const s = SKILLS[id]; return { text: s.name, right: s.hpCost ? `${Math.round(s.hpCost * 100)}%` : s.mp, id, tag, disabled: !s.field || !alive(m) || m.mp < s.mp }; };
    const items = [...jobSkills(m).map(id => row(id, J.cmd)), ...innateSkills(m).map(id => row(id, inn.name))];
    const idx = this.list ? this.list.index : 0;
    this.list = new ListMenu(items.length ? items : [{ text: '(no skills)', disabled: true }], { x: 12, y: 448, w: 936, rows: 3, cols: 2, rowH: 34, title: `${m.name}  ${J.cmd || '-'} / ${inn.name}   MP ${m.mp}/${stats(m).mmp}`, index: idx, size: 14 });
    this.list.h = 180;
  }
  update() {
    if (this.pick) {
      const r = this.pick.update();
      if (r && r.cancel) this.pick = null;
      else if (r && r.select) { const res = castSkillField(this.m, this.list.cur.id, r.select.m); this.menu.msg = res.msg; this.build(); }
      return false;
    }
    const r = this.list.update();
    if (this.list.cur && this.list.cur.id) this.menu.msg = SKILLS[this.list.cur.id].desc;
    if (r && r.cancel) { this.menu.msg = ''; return true; }
    if (r && r.select && r.select.id) {
      const sk = SKILLS[r.select.id];
      if (sk.target === 'allies') { const res = castSkillField(this.m, r.select.id, null); this.menu.msg = res.msg; this.build(); }
      else this.pick = partyPicker();
    }
    return false;
  }
  draw() { if (this.pick) drawCursor(40, 54 + this.pick.index * PARTY_ROW()); this.list.draw(!this.pick); }
}

// ---------------------------------------------------------------------------
// Job panel: change a hero's job at any time
// ---------------------------------------------------------------------------
class JobPanel {
  constructor(menu, m) {
    this.menu = menu; this.m = m; this.fullscreen = true; this.note = '';
    const items = S().jobsOpen.slice().sort((a, b) => JOB_ORDER.indexOf(a) - JOB_ORDER.indexOf(b)).map(j => ({ text: JOBS[j].name, right: `${m.jobs[j].lv}`, id: j, color: j === m.job ? '#ffe070' : JOBS[j].color }));
    this.list = new ListMenu(items, { x: 12, y: 150, w: 330, rows: 8, rowH: 36, index: Math.max(0, items.findIndex(i => i.id === m.job)), size: 14 });
  }
  update() {
    const r = this.list.update();
    if (r && r.cancel) return true;
    if (r && r.select) {
      const j = r.select.id;
      if (j === this.m.job) { this.note = `${this.m.name} is already a ${JOBS[j].name}.`; return false; }
      const removed = changeJob(this.m, j); Audio2.sfx('levelup');
      this.note = `${this.m.name} is now a ${JOBS[j].name}!` + (removed.length ? ` Unequipped: ${removed.join(', ')}.` : '');
      this.list.items.forEach(it => it.color = it.id === this.m.job ? '#ffe070' : JOBS[it.id].color);
    }
    return false;
  }
  draw() {
    const m = this.m, j = this.list.cur.id, J = JOBS[j], cur = stats(m), prev = stats(m, j), rec = m.jobs[j];
    drawWindow(12, 12, 936, 130); drawMemberRow(m, 40, 36);
    this.list.draw();
    drawWindow(350, 150, 598, 478);
    text(J.name, 380, 176, J.color, 20); text(`Patron: ${J.god}`, 920, 180, '#c8c8e0', 12, 'right');
    wrapText(J.desc, 540, 12).forEach((l, i) => text(l, 380, 210 + i * 20, '#e8e8ff', 12));
    text(`Rank ${rec.lv}${rec.lv < MAX_JOB_LV ? `   JP ${rec.jp} / ${JP_TABLE[rec.lv + 1]}` : '   MASTERED'}`, 380, 262, '#ffe070', 12);
    text(`Command: ${J.cmd || '(none)'}   Innate: ${INNATE[HEROES[m.id].innate].name}`, 380, 286, '#a8c0ff', 12);
    const rows = [['Max HP', 'mhp'], ['Max MP', 'mmp'], ['Strength', 'str'], ['Speed', 'agi'], ['Magic', 'mag'], ['Spirit', 'spr']];
    rows.forEach(([l, k], i) => {
      const y = 318 + i * 26; text(l, 380, y, '#a8c0ff', 12); text(String(cur[k]), 600, y, '#fff', 12, 'right');
      const d = prev[k] - cur[k]; text(String(prev[k]), 680, y, d > 0 ? '#60ff80' : d < 0 ? '#ff7070' : '#fff', 12, 'right');
    });
    text('Skills', 720, 318, '#a8c0ff', 12);
    J.learn.forEach(([lv, s], i) => text(`${lv} ${SKILLS[s].name}`, 720, 342 + i * 22, rec.lv >= lv ? '#fff' : '#6a6a88', 11));
    text(`Weapons: ${J.weapons.join(', ')}`, 380, 486, '#c8c8e0', 11);
    text(`Armor: ${J.armor.join(', ')}`, 380, 506, '#c8c8e0', 11);
    if (this.note) wrapText(this.note, 540, 12).forEach((l, i) => text(l, 380, 540 + i * 20, '#ffe070', 12));
    else text('Z: change job   X: back', 380, 590, '#8888aa', 12);
  }
}

class EquipPanel {
  constructor(menu, m) { this.menu = menu; this.m = m; this.fullscreen = true; this.slots = new ListMenu(['weapon', 'head', 'body', 'acc'].map(s => ({ text: '', slot: s })), { x: 12, y: 150, w: 600, rowH: 40, rows: 4 }); this.list = null; }
  buildList() {
    const slot = this.slots.cur.slot;
    const items = [{ text: '(remove)', id: null }].concat(Object.entries(S().bag).filter(([id]) => EQUIP[id].slot === slot && canEquip(this.m, id)).map(([id, n]) => ({ text: EQUIP[id].name, right: n, id })));
    if (!items.length) items.push({ text: '(nothing to equip)', disabled: true, none: true });
    this.list = new ListMenu(items, { x: 12, y: 330, w: 600, rows: 6, rowH: 36, size: 14 });
  }
  update() {
    if (this.list) {
      const r = this.list.update();
      if (r && r.cancel) this.list = null;
      else if (r && r.select) {
        const slot = this.slots.cur.slot, old = this.m.equip[slot], nid = r.select.id;
        if (old) addItem(old); if (nid) removeItem(nid);
        this.m.equip[slot] = nid; clampHpMp(this.m); this.list = null;
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
    drawWindow(12, 12, 600, 130); drawMemberRow(m, 40, 36);
    drawWindow(12, 150, 600, 176);
    ['Weapon', 'Head', 'Body', 'Acc.'].forEach((lbl, i) => {
      const id = m.equip[['weapon', 'head', 'body', 'acc'][i]];
      text(lbl, 60, 172 + i * 40, '#a8c0ff', 14); text(id ? EQUIP[id].name : '-', 200, 172 + i * 40, '#fff', 14);
      if (this.slots.index === i) drawCursor(60, 172 + i * 40, !!this.list);
    });
    let prev = null;
    if (this.list && this.list.cur && !this.list.cur.none) { const slot = this.slots.cur.slot; prev = stats({ ...m, equip: { ...m.equip, [slot]: this.list.cur.id } }); }
    drawWindow(620, 12, 328, 616);
    text(JOBS[m.job].name, 648, 36, JOBS[m.job].color, 14);
    const rows = [['Attack', 'atk'], ['Accuracy', 'hit'], ['Defense', 'def'], ['Magic', 'mag'], ['M.Defense', 'mdef'], ['Strength', 'str'], ['Speed', 'agi']];
    rows.forEach(([lbl, k], i) => {
      text(lbl, 648, 76 + i * 36, '#a8c0ff', 12); text(String(st[k]), 850, 76 + i * 36, '#fff', 12, 'right');
      if (prev) { const d = prev[k] - st[k]; text(String(prev[k]), 920, 76 + i * 36, d > 0 ? '#60ff80' : d < 0 ? '#ff6060' : '#fff', 12, 'right'); }
    });
    const cur = this.list ? this.list.cur : null, eid = cur && !cur.none ? cur.id : m.equip[this.slots.cur.slot];
    if (eid && EQUIP[eid]) wrapText(EQUIP[eid].desc || describeEquip(EQUIP[eid]), 270, 12).forEach((l, i) => text(l, 648, 340 + i * 22, '#e0e0e0', 12));
    if (this.list) this.list.draw(); else { drawWindow(12, 330, 600, 298); text('Choose a slot to change.', 40, 360, '#a8a8c8', 14); text('Changing jobs changes what you can wear.', 40, 392, '#8888aa', 12); }
  }
}
function describeEquip(e) {
  const p = []; if (e.atk) p.push(`Atk ${e.atk}`); if (e.def) p.push(`Def ${e.def}`); if (e.mdef) p.push(`MDef ${e.mdef}`); if (e.mag) p.push(`Mag +${e.mag}`); if (e.spr) p.push(`Spr +${e.spr}`); if (e.str) p.push(`Str +${e.str}`); if (e.agi) p.push(`Spd +${e.agi}`); if (e.elem) p.push(`${e.elem} element`);
  const jobs = e.slot === 'acc' ? 'Any job' : JOB_ORDER.filter(j => e.slot === 'weapon' ? JOBS[j].weapons.includes(e.type) : JOBS[j].armor.includes(e.type)).map(j => JOBS[j].name).join(', ');
  return p.join('  ') + `\nType: ${e.type}\nJobs: ${jobs}`;
}
class StatusPanel {
  constructor(menu, m) { this.menu = menu; this.m = m; this.fullscreen = true; }
  update() { if (Input.cancel() || Input.ok()) { Audio2.sfx('cancel'); return true; } const p = S().party, i = p.indexOf(this.m); if (Input.rep('right') || Input.rep('down')) this.m = p[(i + 1) % p.length]; if (Input.rep('left') || Input.rep('up')) this.m = p[(i + p.length - 1) % p.length]; return false; }
  draw() {
    const m = this.m, st = stats(m), img = IMG[`${m.id}_${m.job}`] || IMG[HEROES[m.id].img] || chibiBattle(HEROES[m.id].look), J = JOBS[m.job];
    drawWindow(12, 12, 936, 616);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(40, 40, 320, 560);
    if (img) { const s = 2; ctx.drawImage(img, 40 + (320 - img.width * s) / 2, 60 + (300 - img.height * s) / 2 + 40, img.width * s, img.height * s); }
    text(HEROES[m.id].full, 390, 40, '#ffe070', 20); text(`${J.name}  (rank ${m.jobs[m.job].lv})`, 390, 74, J.color, 14);
    text(`Level ${m.lvl}`, 390, 104, '#fff', 14); text(`EXP ${m.exp}`, 600, 104, '#fff', 14); text(`Next ${nextExp(m)}`, 800, 104, '#c8c8e0', 12);
    text(`HP ${m.hp}/${st.mhp}   MP ${m.mp}/${st.mmp}`, 390, 132, '#fff', 14);
    const base = [['Strength', st.str], ['Speed', st.agi], ['Magic', st.mag], ['Vitality', st.vit], ['Spirit', st.spr]];
    base.forEach(([l, v], i) => { text(l, 390, 170 + i * 30, '#a8c0ff', 12); text(String(v), 560, 170 + i * 30, '#fff', 12, 'right'); });
    const d = [['Attack', st.atk], ['Accuracy', st.hit], ['Defense', st.def], ['M.Defense', st.mdef], ['Evasion', st.eva]];
    d.forEach(([l, v], i) => { text(l, 620, 170 + i * 30, '#a8c0ff', 12); text(String(v), 900, 170 + i * 30, '#fff', 12, 'right'); });
    text('Job ranks', 390, 336, '#ffe070', 12);
    S().jobsOpen.forEach((j, i) => { const r = m.jobs[j]; text(`${JOBS[j].name}`, 390 + (i % 2) * 270, 362 + Math.floor(i / 2) * 26, JOBS[j].color, 11); text(r.lv >= MAX_JOB_LV ? 'MAX' : `${r.lv}`, 600 + (i % 2) * 270, 362 + Math.floor(i / 2) * 26, '#fff', 11, 'right'); });
    wrapText(HEROES[m.id].bio, 520, 11).forEach((l, i) => text(l, 390, 490 + i * 20, '#c8c8e0', 11));
    text('◀ ▶ switch   X back', 390, 590, '#8888aa', 12);
  }
}
class ConfigPanel {
  constructor(menu) { this.menu = menu; this.build(); }
  build() {
    const c = S().cfg, i = this.list ? this.list.index : 0;
    this.list = new ListMenu([
      { text: 'Battle mode', right: c.atb === 'wait' ? 'Wait' : 'Active', k: 'atb' },
      { text: 'Battle speed', right: '●'.repeat(c.speed + 1) + '○'.repeat(5 - c.speed), k: 'speed' },
      { text: 'Sound', right: Audio2.muted ? 'Off' : 'On', k: 'sound' },
    ], { x: 12, y: 448, w: 680, rows: 3, rowH: 36, index: i, size: 14 });
    this.list.h = 180;
  }
  update() {
    const c = S().cfg, cur = this.list.cur;
    const hints = { atb: 'Wait: time stops while you pick a skill, item or target. Active: it never stops.', speed: 'How fast the time gauges fill. Left/right to change.', sound: 'Toggle music and sound effects.' };
    this.menu.msg = hints[cur.k];
    if (cur.k === 'speed' && (Input.rep('left') || Input.rep('right'))) { c.speed = clamp(c.speed + (Input.rep('right') ? 1 : -1), 0, 5); Audio2.sfx('cursor'); this.build(); return false; }
    const r = this.list.update();
    if (r && r.cancel) { this.menu.msg = ''; return true; }
    if (r && r.select) {
      if (r.select.k === 'atb') c.atb = c.atb === 'wait' ? 'active' : 'wait';
      if (r.select.k === 'speed') c.speed = (c.speed + 1) % 6;
      if (r.select.k === 'sound') Audio2.toggleMute();
      this.build();
    }
    return false;
  }
  draw() { this.list.draw(); }
}

// ---------------------------------------------------------------------------
// Shops, inn, chapel
// ---------------------------------------------------------------------------
class ShopScene {
  constructor(kind, list, res) {
    this.kind = kind; this.list = list; this.res = res; this.opaque = false;
    this.top = new ListMenu([{ text: 'Buy' }, { text: 'Sell' }, { text: 'Leave' }], { x: 12, y: 12, w: 240 });
    this.mode = 'top'; this.msg = { weapon: 'Blades, staves and claws. Sharp end goes toward the enemy.', armor: 'Armor for every calling. Check your job can wear it!', item: 'Tonics, cures and bedrolls.' }[kind];
  }
  buyItems() { return this.list.map(id => { const d = ITEMS[id] || EQUIP[id]; return { text: d.name, right: d.price, id }; }); }
  sellItems() {
    const out = [];
    for (const [id, n] of Object.entries(S().items)) if (ITEMS[id].price) out.push({ text: `${ITEMS[id].name} x${n}`, right: `${Math.floor(ITEMS[id].price / 2)}`, id });
    for (const [id, n] of Object.entries(S().bag)) out.push({ text: `${EQUIP[id].name} x${n}`, right: `${Math.floor((EQUIP[id].price || 400) / 2)}`, id });
    return out.length ? out : [{ text: '(nothing to sell)', disabled: true }];
  }
  update() {
    if (this.mode === 'top') {
      const r = this.top.update();
      if (r && r.cancel) return this.leave();
      if (r && r.select) {
        if (r.select.text === 'Leave') return this.leave();
        if (r.select.text === 'Buy') { this.mode = 'buy'; this.menu = new ListMenu(this.buyItems(), { x: 12, y: 150, w: 520, rows: 7, size: 14 }); }
        if (r.select.text === 'Sell') { this.mode = 'sell'; this.menu = new ListMenu(this.sellItems(), { x: 12, y: 150, w: 520, rows: 7, size: 14 }); }
      }
      return;
    }
    const r = this.menu.update();
    if (r && r.cancel) { this.mode = 'top'; return; }
    if (this.mode === 'buy' && r && r.select) this.buy(r.select.id);
    if (this.mode === 'sell' && r && r.select && r.select.id) {
      const id = r.select.id, price = Math.floor(((ITEMS[id] || EQUIP[id]).price || 400) / 2);
      removeItem(id); S().gold += price; Audio2.sfx('buy'); this.msg = `Sold for ${price} G.`;
      const i = this.menu.index; this.menu = new ListMenu(this.sellItems(), { x: 12, y: 150, w: 520, rows: 7, index: i, size: 14 });
    }
  }
  buy(id) {
    const d = ITEMS[id] || EQUIP[id];
    if (S().gold < d.price) { Audio2.sfx('error'); this.msg = "You can't afford that."; return; }
    S().gold -= d.price; addItem(id); Audio2.sfx('buy');
    this.msg = EQUIP[id] ? `Bought ${d.name}. Equip it from the menu.` : `Bought ${d.name}.`;
  }
  leave() { Game.pop(this); this.res(); }
  draw() {
    drawWindow(12, 12, 240, 130);
    this.top.draw(this.mode === 'top');
    drawWindow(260, 12, 688, 130);
    wrapText(this.msg || '', 630, 14).slice(0, 3).forEach((l, i) => text(l, 284, 36 + i * 28, '#fff', 14));
    text(`${S().gold} G`, 920, 104, '#ffe070', 16, 'right');
    if (this.mode === 'top') return;
    this.menu.draw();
    drawWindow(540, 150, 408, 478);
    const cur = this.menu.cur;
    if (!cur || !cur.id) return;
    const id = cur.id, d = ITEMS[id] || EQUIP[id];
    const desc = (d.desc ? d.desc + '\n' : '') + (EQUIP[id] ? describeEquip(EQUIP[id]) : '');
    wrapText(desc, 360, 12).slice(0, 10).forEach((l, i) => text(l, 564, 176 + i * 22, '#e8e8ff', 12));
    S().party.forEach((m, i) => {
      let ok = true, note = '';
      if (EQUIP[id]) { ok = canEquip(m, id); const e = EQUIP[id], c2 = EQUIP[m.equip[e.slot]]; if (ok) { const k = e.slot === 'weapon' ? 'atk' : 'def'; const dv = (e[k] || 0) - ((c2 && c2[k]) || 0); note = dv > 0 ? `▲${dv}` : dv < 0 ? `▼${-dv}` : '='; } }
      const y = 440 + i * 44, face = faceImg(HEROES[m.id].face, HEROES[m.id].look);
      ctx.globalAlpha = ok ? 1 : 0.3; if (face) ctx.drawImage(face, 564, y - 6, 40, 40); text(m.name, 616, y + 6, ok ? '#fff' : '#777', 14); ctx.globalAlpha = 1;
      if (note) text(note, 920, y + 6, note[0] === '▲' ? '#60ff80' : note[0] === '▼' ? '#ff6060' : '#ffe070', 14, 'right');
    });
    if (this.mode === 'buy' && ITEMS[id]) text(`Have: ${S().items[id] || 0}`, 564, 430, '#c8c8e0', 14);
  }
}
function openShop(kind, shopId) {
  const sh = SHOPS[shopId];
  if (kind === 'inn') return innEvent(sh.inn);
  if (kind === 'chapel') return chapelEvent(sh.chapel);
  if (!sh[kind]) return say(null, 'The shop is closed.');
  return new Promise(res => Game.push(new ShopScene(kind, sh[kind], res)));
}
async function innEvent(price) {
  const c = await ask('Innkeeper', `A soft bed and a hot meal for ${price} G. Restores HP and MP, and I'll keep a record of your journey. Stay?`, ['Stay', 'Leave']);
  if (c !== 0) return;
  if (S().gold < price) { Audio2.sfx('error'); return say('Innkeeper', "Sorry, you don't have enough gold."); }
  S().gold -= price;
  Audio2.music(null); await fadeOut(40); healAll(); await wait(40); Audio2.sfx('heal');
  const ok = saveGame(); await fadeIn(40); Audio2.music(Game.field.map.music);
  await say('Innkeeper', ok ? 'Good morning! Your journey has been saved.' : 'Good morning! Take care out there.');
}
async function chapelEvent(price) {
  const dead = S().party.filter(m => !alive(m));
  if (!dead.length) return say('Priest', 'Sylara\'s light is on you all. Come back if one of you falls.');
  for (const m of dead) {
    const cost = price * m.lvl;
    const c = await ask('Priest', `${m.name} has fallen. A dawn prayer will raise them, for an offering of ${cost} G.`, ['Pray', 'Leave']);
    if (c !== 0) return;
    if (S().gold < cost) { Audio2.sfx('error'); return say('Priest', 'The offering is not enough.'); }
    S().gold -= cost; m.hp = 1; m.status = {}; Audio2.sfx('heal');
    await say('Priest', `${m.name} opens their eyes. Every day is a second chance.`);
  }
}
