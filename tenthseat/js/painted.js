'use strict';
// ---------------------------------------------------------------------------
// Painted maps: one big picture instead of tiles.
//   map.painted = '<key>'  uses assets/paintings/<key>.jpg (embedded by tools/build_paintings.py)
//   map.rows still decide where you can walk ('.' floor, 'z' blocked, '+' doors, shops, NPCs,
//   chests): the grid is just invisible. 48 px of picture = one tile.
//   map.lights = [[x, y, art], ...] lamps in picture pixels (art from HD_LIGHTS)
//   map.water = true adds sun glints on the blue parts of the picture; map.gulls = n seabirds
// ---------------------------------------------------------------------------
for (const [k, src] of Object.entries(typeof PAINTINGS === 'undefined' ? {} : PAINTINGS)) {
  const im = new Image(); im.onload = () => { IMG['paint_' + k] = im; }; im.src = src;
}
const _paintWater = {};
function paintWaterSpots(key) {
  if (_paintWater[key]) return _paintWater[key];
  const im = IMG['paint_' + key], c = mkCanvas(im.width, im.height), x = c.getContext('2d');
  x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, im.width, im.height).data, out = [], R = srand(key.length * 31 + 7);
  for (let i = 0; i < 6000 && out.length < 260; i++) {
    const px = Math.floor(R() * im.width), py = Math.floor(R() * im.height), o = (py * im.width + px) * 4;
    const r = d[o], g = d[o + 1], b = d[o + 2];
    if (b > 120 && b > r + 50 && b >= g) out.push([px, py, R() * 100, 0.6 + R() * 0.8]);
  }
  return (_paintWater[key] = out);
}
const GULLS = Array.from({ length: 6 }, (_, i) => ({ x: Math.random() * 1600, y: 40 + Math.random() * 300, v: 0.5 + Math.random() * 0.6, s: i * 13 }));
function paintedFx(f, cx, cy, layer) {
  const m = f.map, t = Game.frame;
  if (layer === 'under' && m.water) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [px, py, ph, sz] of paintWaterSpots(m.painted)) {
      const sx = px - cx, sy = py - cy; if (sx < -8 || sy < -8 || sx > W + 8 || sy > H + 8) continue;
      const a = Math.max(0, Math.sin(t / 22 + ph)) ** 6; if (a < 0.05) continue;
      const r = 2 + sz * 3 * a; ctx.fillStyle = `rgba(255,248,220,${0.85 * a})`;
      ctx.fillRect(sx - r, sy - 0.75, r * 2, 1.5); ctx.fillRect(sx - 0.75, sy - r * 0.6, 1.5, r * 1.2);
    }
    ctx.restore();
  }
  if (layer === 'over' && m.gulls) {
    ctx.fillStyle = '#fbfbff'; ctx.strokeStyle = '#fbfbff'; ctx.lineWidth = 2;
    for (const g of GULLS.slice(0, m.gulls)) {
      g.x += g.v; if (g.x > m.w * TS + 40) { g.x = -40; g.y = 40 + Math.random() * 300; }
      const sx = g.x - cx, sy = g.y - cy + Math.sin((t + g.s * 9) / 30) * 6, flap = Math.sin((t + g.s * 7) / 6) * 4;
      ctx.beginPath(); ctx.moveTo(sx - 7, sy - flap); ctx.quadraticCurveTo(sx - 3, sy - 3, sx, sy); ctx.quadraticCurveTo(sx + 3, sy - 3, sx + 7, sy - flap); ctx.stroke();
    }
  }
}

// Debug > Show walk grid: green = walkable, red = blocked, letters mark doors, shops, signs.
function drawWalkGrid(f, x0, y0, x1, y1, cx, cy) {
  ctx.save(); ctx.lineWidth = 1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const c = f.tileAt(x, y); if (c == null) continue;
    const t = f.tileDef(c), sx = x * TS - cx, sy = y * TS - cy;
    const sign = f.map.signs && f.map.signs[x + ',' + y], door = c === '+' || t.exit || t.stairs;
    ctx.fillStyle = door ? 'rgba(80,160,255,0.40)' : t.shop ? 'rgba(255,200,40,0.40)' : t.solid ? 'rgba(255,40,40,0.22)' : 'rgba(40,255,90,0.18)';
    ctx.fillRect(sx, sy, TS, TS); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.strokeRect(sx + 0.5, sy + 0.5, TS - 1, TS - 1);
    const lab = door ? 'DOOR' : t.shop ? 'SHOP' : sign ? 'SIGN' : '';
    if (lab) text(lab, sx + TS / 2, sy + TS / 2 - 5, '#fff', 8, 'center');
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// The Docks of Solanthia (painted pilot map). Reached from the east side of Solanthia.
// ---------------------------------------------------------------------------
MAPS.soldocks = {
  name: 'The Docks of Solanthia', theme: 'solanthia', music: 'town', under: '.', painted: 'soldocks', water: true, gulls: 5,
  start: [15, 2, 'down'],
  rows: [
    "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    "zzzzzzzzzzzzzzz+zzzzzzzzzzzzzzzz",
    "zzzzzzzzzzzzzz....zzzzzzzzzzzzzz",
    "zzzzzzzzzzzzzz.....zzzzzzzzzzzzz",
    "zzzzzzzzzzzzzzz....zzzzzzzzzzzzz",
    "zzzzzzzzzzzzzzz....zzzzzzzzzzzzz",
    "zzzzzzzzzzzzzzz....zzzzzzzzzzzzz",
    "zzzzzzzzzzzzzzz....zzzzzzzzzzzzz",
    "zzzzzzzzzzzzzz.....5zzzzzzzzzzzz",
    "zzzzzzzzzzzzz........zzzzzzzzzzz",
    "zzQ....zzIzzz.......zzzzzzzzzzzz",
    "z.6.......2.........zzzzzzzzzzzz",
    "zzzzz.3.............zzzzzzzzzzzz",
    "zzzzzz......4.....1.zzzzzzzzzzzz",
    "zzzzzzzzzzzzzzz.....zzzzzzzzzzzz",
    "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
  ],
  lights: [[210, 185], [383, 265], [467, 268], [577, 285], [682, 300], [851, 150], [994, 232], [1111, 365], [953, 440], [25, 375], [205, 504], [676, 550], [470, 12], [1259, 135], [980, 735, 'shopdoor'], [1070, 750, 'shopdoor']],
  shops: 'solanthia',
  doors: { '15,1': { map: 'solanthia', x: 28, y: 12, dir: 'left' } },
  chests: { Q: { id: 'c_docks1', item: 'tonic', n: 3 } },
  npcs: {
    1: { look: 'sailor', name: 'Captain Orsa', talk: [async () => {
      await say('Captain Orsa', "The Sunwake. Forty years on the Aurelion run and she's never lost a sail. Lost two cooks. Different story.");
      if (flag('ch5start')) { await say('Captain Orsa', "Word is you've got a dragon now. A DRAGON. And here I am with a boat like a fool."); await say(MI(), "I'm faster AND I don't need wind. Also I bite."); await say('Captain Orsa', "...The boat doesn't bite. Point to the boat."); }
      return null;
    }] },
    2: { look: 'merchant', name: 'Stall Keeper', talk: [() => "Fresh from the morning boats! Step up to the striped stall behind me and see what the tide brought in."] },
    3: { look: 'man', name: 'Dockhand', talk: [() => "That crane's older than the temple. Creaks like a prayer, lifts like a promise. Don't stand under it."] },
    4: { look: 'child', move: 'wander', talk: [async () => { await say('Child', "I'm counting the seagulls. I'm on four hundred. Some of them might be the same seagull."); return null; }] },
    5: { look: 'dawnguard', name: 'Harbor Guard', talk: [() => !flag('ch1done') && "The Dawnguard keeps the harbor stairs. Banners up, lamps lit, smugglers... discouraged.", () => "Ships come in, faith goes out. Sylara's banners on every mast. The Luminars like it tidy."] },
    6: { look: 'oldman', name: 'Old Fisher', talk: [() => "Sun on the water at dawn, every morning for sixty years. Still haven't caught anything worth bragging about. Still come back."] },
  },
  signs: {
    '15,10': () => say(null, "A compass rose is set into the cobbles in blue and gold stone, its north point aimed straight at the Grand Temple."),
    '16,10': () => say(null, "A compass rose is set into the cobbles in blue and gold stone, its north point aimed straight at the Grand Temple."),
    '20,13': () => say(null, "The Sunwake creaks at her moorings, her gold trim catching the light. A gangplank is up. Nobody's sailing today."),
    '19,14': () => say(null, "The Sunwake creaks at her moorings, her gold trim catching the light. A gangplank is up. Nobody's sailing today."),
  },
};
// Solanthia's east gate now leads down to the docks.
{
  const s = MAPS.solanthia, r = s.rows[12];
  s.rows[12] = r.slice(0, 28) + ',+' + r.slice(30);
  s.doors['29,12'] = { map: 'soldocks', x: 15, y: 2, dir: 'down' };
}
