// Static checks: map shapes, reachability, and data references.
const c = require('./harness.js');
const fs = require('fs'), path = require('path');
const assets = new Set(fs.readdirSync(path.join(__dirname, '..', '..', 'assets')).map(f => f.replace('.png', '')));
let errors = 0; const err = m => { errors++; console.log('ERR', m); };
const T = c.IN_TILES;
for (const [id, m] of Object.entries(c.MAPS)) {
  const w = m.rows[0].length;
  m.rows.forEach((r, i) => { if (r.length !== w) err(`${id} row ${i} width ${r.length} != ${w}`); });
  const g = m.rows.map(r => r.split(''));
  const H = g.length, npcKeys = new Set(Object.keys(m.npcs || {})), chestKeys = new Set(Object.keys(m.chests || {}));
  const under = ch => (m.underAt && m.underAt[ch]) || m.under || '.';
  const tileOf = (x, y) => { const ch = g[y][x]; if (npcKeys.has(ch) || chestKeys.has(ch)) return 'OBJ'; return ch; };
  const solid = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= H) return false; const ch = tileOf(x, y); if (ch === 'OBJ') return true; const t = T[ch]; if (!t) { err(`${id} unknown tile '${ch}' at ${x},${y}`); return true; } return !!t.solid; };
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) { const ch = g[y][x]; if (!T[ch] && !npcKeys.has(ch) && !chestKeys.has(ch)) err(`${id} unknown tile '${ch}' at ${x},${y}`); }
  // BFS from start (and from arrival stairs)
  const starts = [m.start];
  for (const ch of '<>') for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) if (g[y][x] === ch) starts.push([x, y]);
  const seen = new Set(), q = [];
  for (const s of starts) if (s) { q.push([s[0], s[1]]); seen.add(s[0] + ',' + s[1]); }
  while (q.length) {
    const [x, y] = q.shift();
    const t = T[g[y][x]];
    if (t && (t.exit || t.shop)) continue; // stepping here leaves the map
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (nx < 0 || ny < 0 || nx >= w || ny >= H || seen.has(k) || solid(nx, ny)) continue;
      seen.add(k); q.push([nx, ny]);
    }
  }
  const reach = (x, y) => seen.has(x + ',' + y);
  const adj = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => reach(x + dx, y + dy) || (T[g[y + dy] && g[y + dy][x + dx]] || {}).counter && reach(x + 2 * dx, y + 2 * dy));
  if (m.start && solid(m.start[0], m.start[1])) err(`${id} start is solid`);
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) {
    const ch = g[y][x], t = T[ch] || {};
    if ((t.exit || t.shop || t.stairs || ch === '+') && !reach(x, y)) err(`${id} ${ch} at ${x},${y} unreachable`);
    if (ch === 'L' && !adj(x, y)) err(`${id} lantern at ${x},${y} unreachable`);
    if (chestKeys.has(ch) && !adj(x, y)) err(`${id} chest ${ch} at ${x},${y} unreachable`);
    if (npcKeys.has(ch) && !adj(x, y) && !m.npcs[ch].img) err(`${id} npc ${ch} at ${x},${y} unreachable`);
    if (npcKeys.has(ch) && m.npcs[ch].img && !adj(x, y)) err(`${id} boss npc ${ch} at ${x},${y} unreachable`);
  }
  for (const k of Object.keys(m.steps || {})) { const [x, y] = k.split(',').map(Number); if (!reach(x, y)) err(`${id} step trigger ${k} unreachable`); }
  for (const k of Object.keys(m.signs || {})) { const [x, y] = k.split(',').map(Number); if (!adj(x, y)) err(`${id} sign ${k} unreachable`); }
  for (const k of Object.keys(m.doors || {})) { const d = m.doors[k]; if (!c.MAPS[d.map]) err(`${id} door to missing ${d.map}`); }
  for (const [k, v] of Object.entries(m.warps || {})) if (!c.MAPS[v.map] || !c.MAPS[v.map].rows.some(r => r.includes(v.at))) err(`${id} warp ${k} bad target`);
  for (const [k, n] of Object.entries(m.npcs || {})) { if (n.look && !c.LOOKS[n.look]) err(`${id} npc ${k} look ${n.look} missing`); if (n.img && !assets.has(n.img)) err(`${id} npc img ${n.img} missing`); if (!m.rows.some(r => r.includes(k)) && id !== 'embrace2') err(`${id} npc ${k} not placed`); }
  for (const [k, ch] of Object.entries(m.chests || {})) { if (ch.item && !c.ITEMS[ch.item] && !c.EQUIP[ch.item]) err(`${id} chest ${k} bad item ${ch.item}`); }
  if (m.shops && !c.SHOPS[m.shops]) err(`${id} bad shop ${m.shops}`);
  if (m.music && typeof m.music === 'string' && !c.MUSIC[m.music]) err(`${id} music ${m.music} missing`);
  if (m.enc && !c.FORMATIONS[m.enc]) err(`${id} bad enc ${m.enc}`);
  console.log(`${id.padEnd(12)} ${w}x${H} reachable ${seen.size}`);
}
// world places land on place tiles
const W = c.WORLD;
for (const [k, p] of Object.entries(W.places)) { const [x, y] = k.split(',').map(Number); const ch = W.rows[y][x]; if (!(c.WORLD_TILES[ch] || {}).place) err(`world place ${k} is on '${ch}'`); }
W.rows.forEach((r, i) => { if (r.length !== W.rows[0].length) err('world row ' + i); });
for (const r of W.rows) for (const ch of r) if (!c.WORLD_TILES[ch] && ch !== 'G') err('world tile ' + ch);
// data references
for (const [id, e] of Object.entries(c.ENEMIES)) if (!assets.has('m_' + e.art) && !assets.has('b_' + e.art)) err(`enemy ${id} art ${e.art} missing`);
for (const [z, fs2] of Object.entries(c.FORMATIONS)) for (const f of fs2) for (const [e] of f.e) if (!c.ENEMIES[e]) err(`formation ${z} enemy ${e}`);
for (const [s, sh] of Object.entries(c.SHOPS)) for (const k of ['weapon', 'armor', 'item']) for (const id of sh[k] || []) if (!c.ITEMS[id] && !c.EQUIP[id]) err(`shop ${s} ${id}`);
for (const [j, J] of Object.entries(c.JOBS)) for (const [, s] of J.learn) if (!c.SKILLS[s]) err(`job ${j} skill ${s}`);
for (const [i, I] of Object.entries(c.INNATE)) for (const [, s] of I.learn) if (!c.SKILLS[s]) err(`innate ${i} skill ${s}`);
for (const [h, H] of Object.entries(c.HEROES)) { for (const id of Object.values(H.equip)) if (id && !c.EQUIP[id]) err(`hero ${h} equip ${id}`); if (!c.JOBS[H.job]) err(`hero ${h} job`); }
for (const [id, e] of Object.entries(c.ENEMIES)) if (e.steal && !c.ITEMS[e.steal] && !c.EQUIP[e.steal]) err(`enemy ${id} steal ${e.steal}`);
console.log(errors ? `${errors} errors` : 'ALL OK');
process.exit(errors ? 1 : 0);
