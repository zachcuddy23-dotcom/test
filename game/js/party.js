'use strict';
// ---------------------------------------------------------------------------
// Game state, party stats, inventory, flags, save/load
// ---------------------------------------------------------------------------
function newState() {
  const party = ['miasma', 'verai', 'raine'].map(id => {
    const h = HEROES[id];
    const m = { id, name: h.name, cls: h.cls, lvl: 1, exp: 0, hp: h.hp, mhp: h.hp, str: h.str, agi: h.agi, int: h.int, vit: h.vit, luck: h.luck,
      status: {}, equip: { weapon: h.weapon, body: h.body, acc: h.acc }, spells: [...h.spells], charges: [0, 0, 0] };
    m.charges = maxCharges(m);
    return m;
  });
  return { party, gold: 400, items: { tonic: 4, antidote: 1 }, bag: {}, keys: [], flags: {}, chests: {}, map: 'world', x: 15, y: 21, dir: 'up',
    ship: null, onShip: false, steps: 0, playTime: 0, battles: 0 };
}
const S = () => Game.state;
function flag(k) { return !!S().flags[k]; }
function setFlag(k, v = true) { S().flags[k] = v; }
function hasKey(k) { return S().keys.includes(k); }
function giveKey(k) { if (!hasKey(k)) S().keys.push(k); }
function takeKey(k) { S().keys = S().keys.filter(x => x !== k); }
function addItem(id, n = 1) {
  if (ITEMS[id]) S().items[id] = Math.min(99, (S().items[id] || 0) + n);
  else if (EQUIP[id]) S().bag[id] = (S().bag[id] || 0) + n;
  else if (KEY_ITEMS[id]) giveKey(id);
}
function removeItem(id, n = 1) {
  const store = ITEMS[id] ? S().items : S().bag;
  store[id] = (store[id] || 0) - n; if (store[id] <= 0) delete store[id];
}
function alive(m) { return m.hp > 0; }
function canAct(m) { return m.hp > 0 && !m.status.sleep; }

function eqStat(m, key) { let t = 0; for (const s of ['weapon', 'body', 'acc']) { const e = EQUIP[m.equip[s]]; if (e && e[key]) t += e[key]; } return t; }
function stats(m) {
  const C = CLASSES[m.cls], w = EQUIP[m.equip.weapon] || { atk: 1, hit: 0 };
  const str = m.str + eqStat(m, 'str');
  const hit = C.hitBase + (w.hit || 0) + m.lvl * C.hitGrow;
  return {
    atk: Math.floor(str / 2) + (w.atk || 1), hit, hits: 1 + Math.floor(hit / 32), def: eqStat(m, 'def'), eva: 48 + m.agi,
    mag: m.int + eqStat(m, 'mag'), mdef: C.mdefBase + m.lvl * C.mdefGrow + eqStat(m, 'mdef'), crit: C.crit + eqStat(m, 'crit') + Math.floor((m.luck + eqStat(m, 'luck')) / 8),
    str, luck: m.luck + eqStat(m, 'luck'),
  };
}
function maxCharges(m) {
  return CLASSES[m.cls].charges.map(([start, base, rate]) => m.lvl < start ? 0 : Math.min(9, base + Math.floor((m.lvl - start) * rate)));
}
function canEquip(m, id) { const e = EQUIP[id]; return e && e.cls.includes(CLASSES[m.cls].letter); }
function gainExp(m, n) {
  const msgs = [];
  if (!alive(m)) return msgs;
  m.exp += n;
  while (m.lvl < MAX_LEVEL && m.exp >= EXP_TABLE[m.lvl + 1]) {
    m.lvl++;
    const g = CLASSES[m.cls].grow, oldC = maxCharges({ ...m, lvl: m.lvl - 1 });
    const hpUp = rnd(g.hp[0], g.hp[1]) + Math.floor(m.vit / 4);
    m.mhp += hpUp; m.hp += hpUp;
    const ups = [];
    for (const k of ['str', 'agi', 'int', 'vit', 'luck']) { const v = rnd(g[k][0], g[k][1]); if (v) { m[k] += v; ups.push(`${k.toUpperCase()}+${v}`); } }
    const nc = maxCharges(m);
    for (let t = 0; t < 3; t++) m.charges[t] += Math.max(0, nc[t] - oldC[t]);
    msgs.push(`${m.name} reached level ${m.lvl}! HP+${hpUp} ${ups.join(' ')}`);
  }
  return msgs;
}
function healAll() {
  for (const m of S().party) { if (m.hp <= 0) continue; m.hp = m.mhp; m.status = {}; m.charges = maxCharges(m); }
}
function nextExp(m) { return m.lvl >= MAX_LEVEL ? 0 : EXP_TABLE[m.lvl + 1] - m.exp; }

// ---------------------------------------------------------------------------
// Save / load
// ---------------------------------------------------------------------------
const SAVE_KEY = 'shards-of-dawn-save-v1';
function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S())); return true; } catch (e) { return false; }
}
function loadSave() {
  try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
}
function hasSave() { return !!loadSave(); }
