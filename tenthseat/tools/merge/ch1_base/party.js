'use strict';
// ---------------------------------------------------------------------------
// Game state, party stats, jobs, inventory, flags, save/load
// ---------------------------------------------------------------------------
const STAT_KEYS = ['hp', 'mp', 'str', 'agi', 'mag', 'vit', 'spr'];
const START_JOBS = ['freelancer', 'oathblade', 'dawnsinger', 'arcanist', 'masquer'];

function makeMember(id, lvl = 1) {
  const h = HEROES[id];
  const m = { id, name: h.name, lvl: 1, exp: 0, job: h.job, jobs: {}, hp: 1, mp: 0, status: {}, equip: { ...h.equip } };
  for (const j of JOB_ORDER) m.jobs[j] = { lv: 1, jp: 0 };
  m.lvl = lvl; m.exp = EXP_TABLE[lvl];
  const st = stats(m); m.hp = st.mhp; m.mp = st.mmp;
  return m;
}
function newState() {
  return {
    party: [makeMember('raine', 1), makeMember('miasma', 1)],
    gold: 300, items: { tonic: 5, antidote: 2, bellflower: 1 }, bag: {}, keys: [], flags: {}, chests: {},
    jobsOpen: [...START_JOBS], map: 'barge', x: 7, y: 6, dir: 'up',
    ship: null, onShip: false, steps: 0, playTime: 0, battles: 0, cfg: { atb: 'wait', speed: 3 },
  };
}
const S = () => Game.state;
function flag(k) { return !!S().flags[k]; }
function setFlag(k, v = true) { S().flags[k] = v; }
function hasKey(k) { return S().keys.includes(k); }
function giveKey(k) { if (!hasKey(k)) S().keys.push(k); }
function takeKey(k) { S().keys = S().keys.filter(x => x !== k); }
function member(id) { return S().party.find(m => m.id === id); }
function addMember(id) {
  if (member(id)) return member(id);
  const avg = Math.max(1, Math.round(S().party.reduce((s, m) => s + m.lvl, 0) / S().party.length));
  const m = makeMember(id, avg); S().party.push(m); return m;
}
function openJob(j) { if (!S().jobsOpen.includes(j)) S().jobsOpen.push(j); }
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

// ---------------------------------------------------------------------------
// Stats: hero base + growth, times job multipliers, plus equipment
// ---------------------------------------------------------------------------
function eqStat(m, key) { let t = 0; for (const s of ['weapon', 'head', 'body', 'acc']) { const e = EQUIP[m.equip[s]]; if (e && e[key]) t += e[key]; } return t; }
function baseStat(m, k) { const h = HEROES[m.id]; return h.base[k] + Math.floor(h.grow[k] * (m.lvl - 1)); }
function stats(m, jobOverride) {
  const J = JOBS[jobOverride || m.job], mu = J.mult;
  const b = {}; for (const k of STAT_KEYS) b[k] = Math.max(1, Math.round(baseStat(m, k) * mu[k]));
  const str = b.str + eqStat(m, 'str'), agi = b.agi + eqStat(m, 'agi'), mag = b.mag + eqStat(m, 'mag'), spr = b.spr + eqStat(m, 'spr');
  const w = EQUIP[m.equip.weapon];
  return {
    mhp: Math.min(9999, b.hp), mmp: Math.min(999, b.mp),
    str, agi, mag, vit: b.vit, spr,
    atk: (w ? w.atk : 3) + Math.floor(str * 0.8) + m.lvl,
    hit: w ? w.hit : 80,
    def: eqStat(m, 'def') + Math.floor(b.vit / 3),
    mdef: eqStat(m, 'mdef') + Math.floor(spr / 2),
    eva: Math.floor(agi / 3),
    elem: w && w.elem,
    immune: ['weapon', 'head', 'body', 'acc'].flatMap(s => (EQUIP[m.equip[s]] || {}).immune || []),
  };
}
function clampHpMp(m) { const st = stats(m); m.hp = Math.min(m.hp, st.mhp); m.mp = Math.min(m.mp, st.mmp); }
function canEquip(m, id, job) {
  const e = EQUIP[id]; if (!e) return false;
  if (e.slot === 'acc') return true;
  const J = JOBS[job || m.job];
  return e.slot === 'weapon' ? J.weapons.includes(e.type) : J.armor.includes(e.type);
}
// skills a member can use right now: job skills by job level, innate by hero level
function jobSkills(m, job) { const j = job || m.job, lv = m.jobs[j].lv; return JOBS[j].learn.filter(([l]) => lv >= l).map(([, s]) => s); }
function innateSkills(m) { const inn = INNATE[HEROES[m.id].innate]; return inn.learn.filter(([l]) => m.lvl >= l).map(([, s]) => s); }
function allSkills(m) { return [...jobSkills(m), ...innateSkills(m)]; }

function changeJob(m, job) {
  if (m.job === job) return [];
  const hpFrac = m.hp / stats(m).mhp, mpFrac = stats(m).mmp ? m.mp / stats(m).mmp : 1;
  m.job = job;
  const removed = [];
  for (const slot of ['weapon', 'head', 'body']) {
    const id = m.equip[slot];
    if (id && !canEquip(m, id)) { addItem(id); m.equip[slot] = null; removed.push(EQUIP[id].name); }
  }
  // grab the best thing from the bag for any empty slot
  for (const slot of ['weapon', 'head', 'body']) {
    if (m.equip[slot]) continue;
    const best = Object.keys(S().bag).filter(id => EQUIP[id].slot === slot && canEquip(m, id)).sort((a, b) => equipScore(b) - equipScore(a))[0];
    if (best) { removeItem(best); m.equip[slot] = best; }
  }
  const st = stats(m);
  if (m.hp > 0) m.hp = Math.max(1, Math.round(st.mhp * hpFrac));
  m.mp = Math.round(st.mmp * mpFrac);
  return removed;
}
function equipScore(id) { const e = EQUIP[id]; return (e.atk || 0) * 2 + (e.def || 0) * 2 + (e.mdef || 0) + (e.mag || 0) * 2; }

function gainExp(m, n) {
  const msgs = [];
  if (!alive(m)) return msgs;
  m.exp += n;
  while (m.lvl < MAX_LEVEL && m.exp >= EXP_TABLE[m.lvl + 1]) {
    const before = stats(m), oldInnate = innateSkills(m);
    m.lvl++;
    const after = stats(m);
    m.hp += after.mhp - before.mhp; m.mp += after.mmp - before.mmp;
    let msg = `${m.name} is now level ${m.lvl}! HP+${after.mhp - before.mhp}`;
    const learned = innateSkills(m).filter(s => !oldInnate.includes(s));
    if (learned.length) msg += `  Learned ${learned.map(s => SKILLS[s].name).join(', ')}!`;
    msgs.push(msg);
  }
  return msgs;
}
function gainJp(m, n) {
  const msgs = []; if (!alive(m)) return msgs;
  const rec = m.jobs[m.job], J = JOBS[m.job];
  rec.jp += Math.round(n * (J.jpRate || 1));
  while (rec.lv < MAX_JOB_LV && rec.jp >= JP_TABLE[rec.lv + 1]) {
    rec.lv++;
    const learned = J.learn.filter(([l]) => l === rec.lv).map(([, s]) => SKILLS[s].name);
    msgs.push(`${m.name}'s ${J.name} rank rose to ${rec.lv}!` + (learned.length ? `  Learned ${learned.join(', ')}!` : ''));
  }
  return msgs;
}
function healAll() {
  for (const m of S().party) { if (m.hp <= 0) continue; const st = stats(m); m.hp = st.mhp; m.mp = st.mmp; m.status = {}; }
}
function nextExp(m) { return m.lvl >= MAX_LEVEL ? 0 : EXP_TABLE[m.lvl + 1] - m.exp; }
function nextJp(m) { const r = m.jobs[m.job]; return r.lv >= MAX_JOB_LV ? 0 : JP_TABLE[r.lv + 1] - r.jp; }

// ---------------------------------------------------------------------------
// Save / load
// ---------------------------------------------------------------------------
const SAVE_KEY = 'tenth-seat-save-v1';
function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S())); return true; } catch (e) { return false; }
}
function loadSave() {
  try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
}
function hasSave() { return !!loadSave(); }
