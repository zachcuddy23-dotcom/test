// Static checks: map shapes, reachability, and data references.
const c = require('./harness.js');
const fs = require('fs'), path = require('path');
const assets = new Set(fs.readdirSync(path.join(__dirname, '..', '..', 'assets')).map(f => f.replace('.png', '')));
let errors = 0; const err = m => { errors++; console.log('ERR', m); };
const T = c.IN_TILES;
for (const [id, m] of Object.entries(c.MAPS)) {
  if (m.world) continue; // extra world maps are checked below
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
// ice floors: from every spot you can stop on, the exit ('>') must still be reachable (no softlocks)
for (const [id, m] of Object.entries(c.MAPS)) {
  if (m.world || !m.rows.some(r => r.includes('i'))) continue;
  const g = m.rows, chestKeys = new Set(Object.keys(m.chests || {}));
  const solid = (x, y) => { const ch = g[y] && g[y][x]; if (ch == null) return true; if (chestKeys.has(ch)) return true; if (/[0-9]/.test(ch)) return false; const t = T[ch]; return !t || !!t.solid; };
  const moves = ([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].flatMap(([dx, dy]) => { let nx = x + dx, ny = y + dy; if (solid(nx, ny)) return []; while (g[ny][nx] === 'i' && !solid(nx + dx, ny + dy)) { nx += dx; ny += dy; } return [[nx, ny]]; });
  const goal = ([x, y]) => g[y][x] === '>';
  const reachGoal = s => { const seen = new Set([s + '']), q = [s]; while (q.length) { const a = q.shift(); if (goal(a)) return true; for (const b of moves(a)) if (!seen.has(b + '')) { seen.add(b + ''); q.push(b); } } return false; };
  const start = m.start.slice(0, 2), all = new Map([[start + '', start]]), q = [start];
  while (q.length) { const a = q.shift(); if (goal(a)) continue; for (const b of moves(a)) if (!all.has(b + '')) { all.set(b + '', b); q.push(b); } }
  if (![...all.values()].some(goal)) err(`${id} ice: exit unreachable`);
  for (const s of all.values()) if (!goal(s) && !reachGoal(s)) err(`${id} ice: stuck at ${s}`);
  console.log(`${id.padEnd(12)} ice ok, ${all.size} resting spots`);
}
// extra world maps (Chapter Two's Ashkar): shape, tiles, places, and every place reachable once all gates open
for (const [id, m] of Object.entries(c.MAPS)) {
  if (!m.world) continue;
  const g = m.rows, w = g[0].length, gates = m.gates || {};
  g.forEach((r, i) => { if (r.length !== w) err(`${id} row ${i}`); });
  const tileAt = (x, y) => { const ch = g[y][x]; return gates[ch] ? c.WORLD_TILES[gates[ch][1]] : c.WORLD_TILES[ch]; };
  for (const r of g) for (const ch of r) if (!c.WORLD_TILES[ch] && !gates[ch]) err(`${id} tile ${ch}`);
  for (const [k, p] of Object.entries(m.places)) {
    const [x, y] = k.split(',').map(Number); if (!(tileAt(x, y) || {}).place) err(`${id} place ${k} is on '${g[y][x]}'`);
    if (!c.MAPS[p.map || p]) err(`${id} place ${k} -> missing map`);
  }
  for (const [ch, [fl]] of Object.entries(gates)) if (typeof fl !== 'string') err(`${id} gate ${ch}`);
  const walk = t => t && !t.solid && !t.water && !t.mountain && !t.block;
  const home = (Object.entries(m.places).find(([, p]) => (p.map || p) === (m.home || 'emberport')) || Object.entries(m.places)[0])[0].split(',').map(Number);
  const seen = new Set([home.join(',')]), q = [home];
  while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (nx < 0 || ny < 0 || nx >= w || ny >= g.length || seen.has(k)) continue; const t = tileAt(nx, ny); if (!t || (!t.place && !walk(t))) continue; seen.add(k); if (!t.place) q.push([nx, ny]); } }
  for (const k of Object.keys(m.places)) if (!seen.has(k)) err(`${id} place ${k} unreachable from its home town`);
  console.log(`${id.padEnd(12)} world ${w}x${g.length} reachable ${seen.size}`);
}
// data references
for (const [id, e] of Object.entries(c.ENEMIES)) if (!e.ph && !assets.has('m_' + e.art) && !assets.has('b_' + e.art)) err(`enemy ${id} art ${e.art} missing`);
for (const [z, fs2] of Object.entries(c.FORMATIONS)) for (const f of fs2) for (const [e] of f.e) if (!c.ENEMIES[e]) err(`formation ${z} enemy ${e}`);
for (const [s, sh] of Object.entries(c.SHOPS)) for (const k of ['weapon', 'armor', 'item']) for (const id of sh[k] || []) if (!c.ITEMS[id] && !c.EQUIP[id]) err(`shop ${s} ${id}`);
for (const [j, J] of Object.entries(c.JOBS)) for (const [, s] of J.learn) if (!c.SKILLS[s]) err(`job ${j} skill ${s}`);
for (const [i, I] of Object.entries(c.INNATE)) for (const [, s] of I.learn) if (!c.SKILLS[s]) err(`innate ${i} skill ${s}`);
for (const [h, H] of Object.entries(c.HEROES)) { for (const id of Object.values(H.equip)) if (id && !c.EQUIP[id]) err(`hero ${h} equip ${id}`); if (!c.JOBS[H.job]) err(`hero ${h} job`); }
for (const [id, e] of Object.entries(c.ENEMIES)) if (e.steal && !c.ITEMS[e.steal] && !c.EQUIP[e.steal]) err(`enemy ${id} steal ${e.steal}`);
console.log(errors ? `${errors} errors` : 'ALL OK');
process.exit(errors ? 1 : 0);
