'use strict';
// ---------------------------------------------------------------------------
// Secrets and mini-games (Chapter Two)
//   The Ashen Athenaeum  - a hard optional library dungeon in north-east Ashkar.
//                          The Index shelf puzzle: misfile the tomes and the Book Dragon wakes;
//                          then re-shelve against a one-minute clock, or fight it.
//                          The Ink Warden guards the deepest stacks.
//   Hollowgrin's chest   - open the Charnoch chest a SECOND time. You're warned and offered a save,
//                          then shrunk inside. No exits, no saving, until the Chest-Fey is beaten.
//                          Reward: fey loot + a special skill (Verai if she is in the party, else Luna).
//   The Bell-Ringer      - a memory game in Draumond's Gate for grave-goods.
// Flags: athenaeum, archIndex, archDragonUp, dragonBeaten, dragonCalmed, inkWarden,
//        feySeen, feyBeaten, bell1..bell3
// ---------------------------------------------------------------------------

// portraits (drop face_<name>.png into assets/ and they appear)
Object.assign(NPC_FACES, { 'Hollowgrin': 'face_hollowgrin', 'The Book Dragon': 'face_bookdragon', 'The Ink Warden': 'face_inkwarden', 'Bell-Ringer': 'face_bellringer' });

// ------------------------------------------------------------------ look and feel
Object.assign(THEMES, {
  archive: { wall: '#3a2a3a', wallDark: '#1a1020', floor: '#4a3a30', floor2: '#443428', grass: '#3a4a3a', water: '#2a4a6a', wood: '#5a3a20', path: '#5a4a3a', carpet: '#2a6a6a', bwall: '#4a3a4a', timber: '#2a1a14', roof: '#3a2a3a' },
  fey: { wall: '#3a2418', wallDark: '#1a0e08', floor: '#8a5a30', floor2: '#7e522c', grass: '#4a6a3a', water: '#4a3a8a', wood: '#6a4020', path: '#9a6a3a', carpet: '#6a2a6a', bwall: '#5a3a28', timber: '#2a1a10', roof: '#4a2a1a' },
});

// giant sewing-box things for the inside of Hollowgrin's chest
Object.assign(TILE_ART, {
  button(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 0); P.circ(8, 8, 6, '#6a2a6a'); P.circ(8, 8, 5, '#9a4a9a'); P.circ(7, 7, 2, '#c878c8'); for (const [x, y] of [[6, 7], [10, 7], [6, 10], [10, 10]]) P.p(x, y, '#2a0a2a'); },
  spool(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 0); P.r(3, 1, 12, 2, '#c8a060'); P.r(3, 13, 12, 14, '#c8a060'); P.r(5, 3, 10, 12, '#c04040'); for (let y = 4; y < 12; y += 2) P.r(5, y, 10, y, '#e06060'); P.r(3, 15, 12, 15, '#3a2010'); },
  thimble(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 0); P.r(4, 4, 11, 14, '#a8a8b8'); P.r(5, 2, 10, 3, '#c8c8d8'); P.r(4, 4, 5, 14, '#d8d8e8'); for (let y = 5; y < 13; y += 3) for (let x = 6; x < 11; x += 2) P.p(x, y, '#6a6a7a'); },
});
Object.assign(IN_TILES, { E: { art: 'button', solid: true }, M: { art: 'spool', solid: true }, S: { art: 'thimble', solid: true } });

// ------------------------------------------------------------------ items, gear, skills
Object.assign(ITEMS, {
  echomint: { name: 'Echo Mint', price: 80, kind: 'cure', cures: ['silence', 'stop'], target: 'ally', battle: true, field: true, desc: 'A sharp little leaf. Cures Silence and Stop.' },
});
// every cleansing skill and item also cures the two new statuses
for (const t of [...Object.values(SKILLS), ...Object.values(ITEMS)]) if (t.cures && t.cures.includes('sleep') && !t.cures.includes('silence')) t.cures.push('silence', 'stop');
Object.assign(EQUIP, {
  codexblade: { name: 'Codex Blade', slot: 'weapon', type: 'sword', atk: 58, hit: 96, mag: 4, price: 0, desc: 'A sword bound in a spine of vellum. Every nick in the blade is a footnote.' },
  starboundrod: { name: 'Starbound Rod', slot: 'weapon', type: 'rod', atk: 18, hit: 88, mag: 22, price: 0, desc: 'Myndra\'s gift for a perfectly shelved Index.' },
  scholarcirclet: { name: 'Scholar\'s Circlet', slot: 'head', type: 'hat', def: 9, mdef: 15, mag: 4, price: 0 },
  pagemail: { name: 'Page-Mail', slot: 'body', type: 'light', def: 30, mdef: 18, price: 0, desc: 'Thousands of enchanted pages, folded like scales.' },
  dragonscript: { name: 'Dragonscript', slot: 'acc', type: 'acc', str: 5, mag: 5, def: 6, mdef: 6, price: 0, desc: 'A scale of the Book Dragon, written on in a language that bites.' },
  wardenmantle: { name: 'Warden\'s Mantle', slot: 'body', type: 'robe', def: 22, mdef: 32, mag: 4, price: 0, desc: 'Ink-black and never dry.' },
  feyribbon: { name: 'Fey Ribbon', slot: 'acc', type: 'acc', mdef: 8, immune: ['sleep', 'stop', 'silence', 'blind', 'fear'], price: 0, desc: 'Hollowgrin\'s hair ribbon. Blocks Sleep, Stop, Silence, Blind and Fear.' },
  grinblade: { name: 'Grinning Knife', slot: 'weapon', type: 'dagger', atk: 52, hit: 99, agi: 8, price: 0, desc: 'It smiles when it cuts. You get used to it. Mostly.' },
  thimblehelm: { name: 'Thimble Helm', slot: 'head', type: 'helm', def: 16, mdef: 10, price: 0, desc: 'A silver thimble, now helmet-sized. Or you are thimble-sized. Hard to say.' },
});
Object.assign(KEY_ITEMS, {
  myndrapage: { name: 'Ledger of Seats', desc: '"Every seat is held by faith. When faith breaks, a seat can be taken. Nyxia\'s did not break. It was STOLEN, and what is stolen can be stolen back."' },
});
Object.assign(SKILLS, {
  twinmoon: { name: 'Twin Moon Oath', mp: 18, target: 'enemies', kind: 'phys', mult: 1.8, elem: 'holy', fx: 'holy', desc: 'Luna\'s secret technique: the knight\'s blade and the wolf\'s claw together. Hits every foe.' },
  hollownight: { name: 'Hollow Night', mp: 22, target: 'enemies', kind: 'dmg', elem: 'dark', pow: 72, fx: 'dark', desc: 'Verai folds the night the Chest-Fey stole into her smoke. Dark damage to every foe.' },
});
for (const sh of ['kharakyr', 'draumond', 'charnoch']) if (SHOPS[sh] && SHOPS[sh].item && !SHOPS[sh].item.includes('echomint')) SHOPS[sh].item.push('echomint');

// ------------------------------------------------------------------ monsters and bosses
Object.assign(ENEMIES, {
  // The Ashen Athenaeum (harder than anything else in Chapter Two)
  inkwraith: { name: 'Ink Wraith', art: 'shade', tint: { h: 200, s: 0.3, l: 0.35, all: true }, hp: 840, atk: 116, def: 20, mdef: 30, agi: 26, exp: 190, jp: 9, gold: 150, weak: ['holy', 'fire'], resist: ['dark'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'status', name: 'Blot', status: 'blind', chance: 55, fx: 'dark' }] },
  paperwing: { name: 'Paperwing', art: 'bat', tint: { h: 40, s: 0.25, l: 1.4 }, hp: 630, atk: 110, def: 16, mdef: 18, agi: 36, exp: 170, jp: 8, gold: 130, weak: ['fire'], acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'strike', name: 'Papercut', mult: 1.5, fx: 'slash' }] },
  tomemimic: { name: 'Tome Mimic', art: 'toad', tint: { h: -40, s: 0.6, l: 0.7 }, hp: 1140, atk: 124, def: 30, mdef: 24, agi: 14, exp: 240, jp: 10, gold: 260, weak: ['fire'], steal: 'hiether', acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'spell', name: 'Footnote Barrage', target: 'all', pow: 55, fx: 'wind' }, { w: 1, type: 'status', name: 'Dull Lecture', target: 'all', status: 'sleep', chance: 35, fx: 'smoke' }] },
  gargoyle: { name: 'Reading-Room Gargoyle', art: 'ogre', tint: { h: 0, s: 0.1, l: 0.7, all: true }, hp: 1425, atk: 135, def: 38, mdef: 12, agi: 10, exp: 260, jp: 10, gold: 220, weak: ['bolt'], resist: ['fire'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'strike', name: 'SHHHH!', mult: 1.7, fx: 'boom' }] },
  starsage: { name: 'Lost Scholar', art: 'skeleton', tint: { h: 220, s: 0.8, l: 1.0 }, hp: 750, atk: 102, def: 18, mdef: 34, agi: 22, exp: 210, jp: 9, gold: 180, undead: true, weak: ['holy'], acts: [{ w: 2, type: 'spell', name: 'Star Fragment', target: 'all', pow: 57, elem: 'star', fx: 'light' }, { w: 1, type: 'status', name: 'Hush', status: 'silence', chance: 50, fx: 'smoke' }, { w: 1, type: 'attack' }] },
  // Inside Hollowgrin's chest (stats scale with the party's level on the way in)
  thimblepixie: { name: 'Thimble Pixie', art: 'wisp', tint: { h: -60, s: 1.3, l: 1.2 }, hp: 300, atk: 60, def: 14, mdef: 24, agi: 30, exp: 120, jp: 8, gold: 100, weak: ['dark'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'status', name: 'Pixie Dust', target: 'all', status: 'sleep', chance: 35, fx: 'smoke' }] },
  buttonimp: { name: 'Button Imp', art: 'imp', tint: { h: 120, s: 0.9, l: 0.9 }, hp: 340, atk: 64, def: 18, mdef: 16, agi: 22, exp: 120, jp: 8, gold: 110, acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'status', name: 'Button Your Lip', status: 'silence', chance: 50, fx: 'smoke' }] },
  needlesprite: { name: 'Needle Sprite', art: 'bat', tint: { h: -100, s: 1.2, l: 0.9 }, hp: 280, atk: 70, def: 12, mdef: 14, agi: 34, exp: 110, jp: 8, gold: 90, acts: [{ w: 3, type: 'strike', name: 'Stitch', mult: 1.2, fx: 'slash' }, { w: 1, type: 'status', name: 'Pinprick', status: 'stop', chance: 40, frames: 180, fx: 'light' }] },

  bookdragon: {
    name: 'The Book Dragon', art: 'bookdragon', boss: true,
    hp: 6200, atk: 78, def: 26, mdef: 28, agi: 22, actions: 2, exp: 7000, jp: 24, gold: 6000, weak: ['fire'], resist: ['water', 'ice'], immune: ['sleep', 'fear', 'doom', 'poison', 'blind', 'stop', 'silence'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Paper Storm', target: 'all', pow: 42, elem: 'wind', fx: 'wind' }, { w: 2, type: 'strike', name: 'Spine Crush', mult: 1.7, fx: 'boom' }, { w: 1, type: 'status', name: 'Rewrite', target: 'all', status: 'silence', chance: 40, fx: 'dark' }],
    phase2: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Ink Breath', target: 'all', pow: 50, elem: 'dark', fx: 'dark' }, { w: 1, type: 'spell', name: 'Epilogue', target: 'all', pow: 58, fx: 'light' }, { w: 1, type: 'heal', name: 'Errata', pow: 700, uses: 1, when: 'hurt' }],
    lines: { start: '"WRONG. SHELF." Every misfiled book in a thousand years roars at once.', half: 'Its pages burn at the edges. Paper, after all. (Fire!)' },
  },
  inkwarden: {
    name: 'The Ink Warden', art: 'inkwarden', ph: { art: 'skeleton', tint: { h: 200, s: 0.2, l: 0.3, all: true }, scale: 2.4 }, boss: true,
    hp: 5800, atk: 82, def: 30, mdef: 22, agi: 20, actions: 2, exp: 6500, jp: 22, gold: 5000, weak: ['holy'], resist: ['dark'], immune: ['sleep', 'fear', 'doom', 'poison', 'stop', 'silence'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Black Margin', target: 'all', pow: 44, elem: 'dark', fx: 'dark' }, { w: 2, type: 'strike', name: 'Ink Lash', mult: 1.6, fx: 'slash' }, { w: 1, type: 'status', name: 'Blot Out', target: 'all', status: 'blind', chance: 45, fx: 'dark' }],
    phase2: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Black Margin', target: 'all', pow: 50, elem: 'dark', fx: 'dark' }, { w: 1, type: 'status', name: 'Redact', status: 'doom', chance: 35, fx: 'dark' }],
    lines: { start: '"OVERDUE." The Warden\'s quill drips something that is not ink.', half: 'It starts crossing out your names. Hurry.' },
  },
  hollowgrin: {
    name: 'Hollowgrin, the Chest-Fey', art: 'hollowgrin', boss: true,
    hp: 7600, atk: 84, def: 24, mdef: 30, agi: 32, exp: 6000, jp: 24, gold: 5000, weak: ['holy', 'fire'], resist: ['dark'], immune: ['sleep', 'fear', 'doom', 'poison', 'blind', 'stop', 'silence'],
    acts: [{ w: 2, type: 'attack' }, { w: 2, type: 'status', name: 'Giggle Dust', target: 'all', status: 'sleep', chance: 45, fx: 'smoke' }, { w: 2, type: 'status', name: 'Hush Now', target: 'all', status: 'silence', chance: 50, fx: 'dark' }, { w: 2, type: 'status', name: 'Pinch of Stop', status: 'stop', chance: 65, frames: 360, fx: 'light' }, { w: 1, type: 'status', name: 'Thimble in the Eye', target: 'all', status: 'blind', chance: 40, fx: 'smoke' }, { w: 2, type: 'spell', name: 'Needle Rain', target: 'all', pow: 38, fx: 'wind' }],
    phase2: [{ w: 2, type: 'attack' }, { w: 2, type: 'status', name: 'Wrong Way Round', target: 'all', status: 'stop', chance: 35, frames: 240, fx: 'light' }, { w: 1, type: 'status', name: 'Grin', target: 'all', status: 'fear', chance: 50, fx: 'dark' }, { w: 2, type: 'spell', name: 'Needle Rain', target: 'all', pow: 44, fx: 'wind' }, { w: 1, type: 'drain', name: 'Borrowed Dream', pow: 90 }, { w: 1, type: 'status', name: 'Giggle Dust', target: 'all', status: 'sleep', chance: 40, fx: 'smoke' }],
    lines: { start: '"Hee hee! Let\'s play Statues. You go first. Forever."', half: 'Hollowgrin stops grinning for exactly one second. That is somehow worse.' },
  },
});
Object.assign(FORMATIONS, {
  archive: [{ w: 3, e: [['inkwraith', 1, 2], ['paperwing', 1, 1]] }, { w: 3, e: [['paperwing', 2, 3]] }, { w: 2, e: [['tomemimic', 1, 2]] }, { w: 2, e: [['gargoyle', 1, 1], ['starsage', 1, 1]] }, { w: 2, e: [['starsage', 2, 2]] }],
  fey: [{ w: 3, e: [['thimblepixie', 2, 3]] }, { w: 3, e: [['buttonimp', 1, 2], ['needlesprite', 1, 1]] }, { w: 2, e: [['needlesprite', 2, 3]] }, { w: 2, e: [['thimblepixie', 1, 1], ['buttonimp', 1, 1], ['needlesprite', 1, 1]] }],
});
// Hollowgrin and his chest scale to whoever is foolish enough to reach in.
const FEY_BASE = {};
for (const id of ['hollowgrin', 'thimblepixie', 'buttonimp', 'needlesprite']) FEY_BASE[id] = { ...ENEMIES[id] };
function scaleFey(L) {
  const k = L / 25;
  for (const [id, b] of Object.entries(FEY_BASE)) {
    Object.assign(ENEMIES[id], { hp: Math.round(b.hp * k), atk: Math.round(b.atk * (0.55 + 0.45 * k)), def: Math.round(b.def * k), mdef: Math.round(b.mdef * k), exp: Math.round(b.exp * k), gold: Math.round(b.gold * k) });
  }
}
function partyLevel() { return Math.max(1, Math.round(S().party.reduce((s, m) => s + m.lvl, 0) / S().party.length)); }

// ------------------------------------------------------------------ maps
MAPS.ashkar.rows[10] = MAPS.ashkar.rows[10].slice(0, 47) + 'A' + MAPS.ashkar.rows[10].slice(48);
MAPS.ashkar.places['47,10'] = { map: 'athenaeum1' };
Object.assign(MAPS, {
  athenaeum1: {
    name: 'The Ashen Athenaeum', theme: 'archive', music: 'tower', under: '.', exitArt: 'floor', worldId: 'ashkar', back: [47, 11], start: [11, 14, 'up'], enc: 'archive', encRate: 0.07, bg: 'library',
    rows: [
      "########################",
      "#*kkkkkk..*..*..kkkkkk*#",
      "#.kkkkkk........kkkkkk.#",
      "#......................#",
      "#.kk.kk.kk.__.kk.kk.kk.#",
      "#.kk.kk.kk.__.kk.kk.kk.#",
      "#.kk.kk.kk.__.kk.kk.kk.#",
      "#..........__..........#",
      "#kkkkkkk.k.__.k.kkkkkkk#",
      "#Q.......k.__.k.......V#",
      "#kkkkk.kkk.__.kkk.kkkkk#",
      "#..........__..........#",
      "#.$$...L...__......$$..#",
      "#..........__.......>..#",
      "#..........__..........#",
      "###########XX###########",
    ],
    warps: { '>': { map: 'athenaeum2', at: '<' } },
    chests: { Q: { id: 'sx_arch1a', item: 'scholarcirclet' }, V: { id: 'sx_arch1b', item: 'hiether', n: 2 } },
    signs: { '2,12': () => say(null, "A reading desk. Someone left a note: 'Do NOT misfile anything in the Reading Room. We lost a whole wing that way.'"), '3,12': () => say(null, "A reading desk, buried in a snowdrift of ash."), '19,12': () => say(null, "A checkout ledger. The last entry is four hundred years overdue."), '20,12': () => say(null, "A pile of books titled 'Why You Should Not Be Here' (vols. 1 to 12).") },
  },
  athenaeum2: {
    name: 'The Athenaeum - Reading Room', theme: 'archive', music: 'tower', under: '.', exitArt: 'floor', start: [1, 11, 'right'], enc: 'archive', encRate: 0.05, bg: 'library',
    rows: [
      "######################",
      "#kkkkkk*......*kkkkkk#",
      "#k..................k#",
      "#k...e....2.....e...k#",
      "#k..................k#",
      "#k.......kaak.......k#",
      "#k........__........k#",
      "#k..Q.....__.....V..k#",
      "#k........__........k#",
      "#kkkkkkkk.__.kkkkkkkk#",
      "#.........__........k#",
      "#<........__........>#",
      "#.........__........k#",
      "######################",
    ],
    underAt: { '2': '.' },
    warps: { '<': { map: 'athenaeum1', at: '>' }, '>': { map: 'athenaeum3', at: '<' } },
    chests: { Q: { id: 'sx_arch2a', item: 'pagemail' }, V: { id: 'sx_arch2b', item: 'megatonic', n: 3 } },
    npcs: { 2: { enemy: 'bookdragon', scale: 0.55, name: 'The Book Dragon', show: () => flag('archDragonUp'), talk: [async () => indexLectern()] } },
    signs: { '10,5': () => indexLectern(), '11,5': () => indexLectern() },
    steps: { '19,11': async () => { if (flag('archIndex')) return; await say(null, "A curtain of floating pages hangs across the stairs. They are very politely refusing to move."); await say(null, "(The Index on the lectern must be put in order first.)"); await F().walk('left', 1); } },
  },
  athenaeum3: {
    name: 'The Athenaeum - Deep Stacks', theme: 'archive', music: 'grave', under: '.', exitArt: 'floor', start: [1, 13, 'right'], enc: 'archive', encRate: 0.075, bg: 'library',
    rows: [
      "####################",
      "#kkkkkk*....*kkkkkk#",
      "#kkkkk....1...kkkkk#",
      "#k................k#",
      "#k.kkkk.kkkk.kkkk.k#",
      "#k.k..k....k.k..k.k#",
      "#k.k..kkk..k.k..k.k#",
      "#k.......k.......Vk#",
      "#kkkk.kk.k.kk.kkkkk#",
      "#k....k..k..k.....k#",
      "#k.kkkk.kkk.kkkk..k#",
      "#kQ.....L........kk#",
      "#kkkkkkkk.kkkkkkkkk#",
      "#<.................#",
      "####################",
    ],
    underAt: { '1': '.' },
    warps: { '<': { map: 'athenaeum2', at: '>' } },
    chests: { Q: { id: 'sx_arch3a', item: 'codexblade' }, V: { id: 'sx_arch3b', item: 'emberplume', n: 2 } },
    npcs: { 1: { enemy: 'inkwarden', scale: 0.5, name: 'The Ink Warden', show: () => !flag('inkWarden'), talk: [async () => inkWardenEvent()] } },
    signs: { '10,2': () => flag('inkWarden') && say(null, "The Warden's desk. A single page is pinned to it with a quill. You already took it.") },
  },
  feychest1: {
    name: '???', theme: 'fey', music: 'vale', under: '.', exitArt: 'floor', start: [10, 12, 'up'], enc: 'fey', encRate: 0.07, bg: 'fey', noSave: true,
    noSaveMsg: 'A tiny voice giggles: "Saving? In MY chest? Hee hee! No."',
    rows: [
      "######################",
      "#M....S......S.....>M#",
      "#..EE....EE....EE....#",
      "#....................#",
      "#SS.MM.SS.MM.SS.MM.SS#",
      "#....................#",
      "#.__________________.#",
      "#.__Q___________V___.#",
      "#.__________________.#",
      "#....................#",
      "#MM.SS.MM....MM.SS.MM#",
      "#....................#",
      "#....................#",
      "######################",
    ],
    underAt: { Q: '_', V: '_' },
    warps: { '>': { map: 'feychest2', at: '<' } },
    chests: { Q: { id: 'sx_fey1a', item: 'echomint', n: 5 }, V: { id: 'sx_fey1b', item: 'thimblehelm' } },
    signs: { '3,2': () => say(null, "A button the size of a cart wheel. It says 'PRESS ME' in tiny stitched letters. It does nothing. Or it did something very quietly."), '4,2': () => say(null, "A giant button. Somebody's coat is missing it."), '9,2': () => say(null, "A button with a face scratched into it. The face is smiling. You wish it wasn't."), '10,2': () => say(null, "A giant button."), '15,2': () => say(null, "A giant button, still threaded."), '16,2': () => say(null, "A giant button. You hear giggling behind it. When you look, there's nothing.") },
  },
  feychest2: {
    name: '???', theme: 'fey', music: 'vale', under: '.', exitArt: 'floor', start: [1, 9, 'right'], bg: 'fey', noSave: true,
    noSaveMsg: 'A tiny voice giggles: "No saving, no leaving, no NOTHING. Hee hee!"',
    rows: [
      "##################",
      "#M......1.......M#",
      "#................#",
      "#.E............E.#",
      "#.......__.......#",
      "#.......__.......#",
      "#.E.....__.....E.#",
      "#.......__.......#",
      "#.......__.......#",
      "#<......__.......#",
      "#................#",
      "##################",
    ],
    underAt: { '1': '.' },
    warps: { '<': { map: 'feychest1', at: '>' } },
    npcs: { 1: { enemy: 'hollowgrin', scale: 0.5, name: 'Hollowgrin', show: () => !flag('feyBeaten'), talk: [async () => hollowgrinEvent()] } },
    steps: { '7,3': () => hollowgrinEvent(), '8,3': () => hollowgrinEvent(), '9,3': () => hollowgrinEvent(), '10,3': () => hollowgrinEvent() },
  },
});
MAPS.athenaeum1.onEnter = async () => { if (!flag('athenaeum')) await athenaeumArrival(); };
MAPS.feychest1.onEnter = async () => { scaleFey(partyLevel()); };
MAPS.feychest2.onEnter = async () => { scaleFey(partyLevel()); };
MAPS.charnoch.chests.Q.again = () => feyChestAgain();
MAPS.draumond.npcs[7].talk = [async () => bellGame()];

// ------------------------------------------------------------------ the Ashen Athenaeum
async function athenaeumArrival() {
  setFlag('athenaeum');
  await scene(async ({ raine, miasma, luna, verai, brakka }) => {
    await say(null, "Half-buried in ash stands a library of Myndra, Lady of Stars and Secrets. The doors open by themselves. Politely.");
    if (luna) { await luna.hop(6); await say('Luna', "A library! Everyone, indoor voices. It's a knight rule. I'm almost certain it's a knight rule."); }
    await miasma.sweat();
    await say(MI(), "Libraries make me itchy. Too many facts in one place. It's unnatural.");
    if (brakka) await say('Brakka', "Ooh, do they have a section on explosives? Every good library has one. It's usually on fire.");
    if (verai) await say(VE(), "Listen. The books are whispering. ...No, really. Listen.");
    await raine.nod();
    await say(R(), "Stay close. Something this quiet is never empty.");
  });
  await tip("The Athenaeum is optional and dangerous. There's a Dawn Lantern on the first floor. Save there.");
}

// The Index puzzle: five tomes, a handful of clues, exactly one right order.
const TOMES = {
  star: { name: 'Star', col: '#e0c040', rune: '*' }, moon: { name: 'Moon', col: '#c8c8e8', rune: 'C' }, flame: { name: 'Flame', col: '#e05030', rune: 'F' },
  tide: { name: 'Tide', col: '#3a78c8', rune: '~' }, leaf: { name: 'Leaf', col: '#50a040', rune: 'L' },
};
function permutations(a) { if (a.length <= 1) return [a]; return a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p])); }
function makeShelfPuzzle() {
  const keys = Object.keys(TOMES), all = permutations(keys), nm = k => TOMES[k].name;
  for (let tries = 0; tries < 60; tries++) {
    const sol = all[Math.floor(Math.random() * all.length)], pos = k => sol.indexOf(k), pool = [];
    for (const a of keys) {
      const p = pos(a);
      if (p === 0 || p === 4) pool.push({ t: `The ${nm(a)} tome sits at one end of the shelf.`, f: q => q.indexOf(a) === 0 || q.indexOf(a) === 4 });
      else pool.push({ t: `The ${nm(a)} tome is not at either end.`, f: q => q.indexOf(a) > 0 && q.indexOf(a) < 4 });
      if (p === 2) pool.push({ t: `The ${nm(a)} tome stands in the very middle.`, f: q => q.indexOf(a) === 2 });
      for (const b of keys) {
        if (a === b) continue;
        const d = pos(b) - p;
        if (d === 1) pool.push({ t: `${nm(a)} stands directly left of ${nm(b)}.`, f: q => q.indexOf(b) - q.indexOf(a) === 1 });
        else if (d > 1) pool.push({ t: `${nm(a)} is somewhere left of ${nm(b)}.`, f: q => q.indexOf(a) < q.indexOf(b) });
        if (a < b && Math.abs(d) > 1) pool.push({ t: `${nm(a)} and ${nm(b)} are not neighbors.`, f: q => Math.abs(q.indexOf(a) - q.indexOf(b)) > 1 });
      }
    }
    pool.sort(() => Math.random() - 0.5);
    let left = all, chosen = [];
    for (const c of pool) { if (left.length === 1) break; const next = left.filter(c.f); if (next.length < left.length) { chosen.push(c); left = next; } }
    if (left.length !== 1) continue;
    for (let i = chosen.length - 1; i >= 0; i--) { const w = chosen.filter((_, j) => j !== i); if (all.filter(q => w.every(c => c.f(q))).length === 1) chosen = w; }
    if (chosen.length > 6) continue;
    let start; do start = all[Math.floor(Math.random() * all.length)]; while (start.join() === sol.join());
    return { sol, clues: chosen.map(c => c.t), start: [...start] };
  }
  return { sol: keys, clues: ['Star, Moon, Flame, Tide, Leaf. (The Index has given up and is just telling you.)'], start: [...keys].reverse() };
}
class ShelfPuzzle {
  constructor(o, res) {
    this.o = o; this.res = res; this.t = 0; this.opaque = true;
    const p = makeShelfPuzzle(); this.sol = p.sol; this.clues = p.clues; this.order = p.start;
    this.cur = 0; this.held = -1; this.confirm = false; this.left = o.time || 0;
  }
  enter() { this._fade = Game.fade; Game.fade = 0; } leave() { Game.fade = this._fade || 0; }
  submit() { const ok = this.order.join() === this.sol.join(); Game.pop(this); this.res(ok); }
  update() {
    this.t++;
    if (this.o.time) { this.left--; if (this.left % 60 === 0 && this.left <= 600 && this.left > 0) Audio2.sfx('cursor'); if (this.left <= 0) { Audio2.sfx('error'); Game.pop(this); this.res('timeout'); return; } }
    if (this.t < 20) return;
    if (this.confirm) {
      if (Input.ok()) { Audio2.sfx('ok'); this.submit(); } else if (Input.cancel()) { Audio2.sfx('cancel'); this.confirm = false; }
      return;
    }
    if (Input.rep('left')) { this.cur = (this.cur + 4) % 5; Audio2.sfx('cursor'); }
    if (Input.rep('right')) { this.cur = (this.cur + 1) % 5; Audio2.sfx('cursor'); }
    if (Input.ok()) {
      if (this.held < 0) { this.held = this.cur; Audio2.sfx('ok'); }
      else { const o = this.order;[o[this.held], o[this.cur]] = [o[this.cur], o[this.held]]; this.held = -1; Audio2.sfx('chest'); }
    }
    if (Input.cancel()) { if (this.held >= 0) { this.held = -1; Audio2.sfx('cancel'); } else { this.confirm = true; Audio2.sfx('cursor'); } }
  }
  draw() {
    drawStars('#0a0612', '#2a1a2a');
    drawWindow(40, 24, 880, 44 + this.clues.length * 30);
    text('The Index of Myndra', 64, 46, '#80f0e0', 14);
    this.clues.forEach((c, i) => text('- ' + c, 64, 76 + i * 30, '#fff', 13));
    if (this.o.time) { const s = Math.max(0, Math.ceil(this.left / 60)); text(`0:${String(s).padStart(2, '0')}`, 880, 46, s <= 10 ? '#ff7070' : '#ffe070', 18, 'right'); }
    // the shelf
    const sx = 180, sy = 330;
    ctx.fillStyle = '#3a2418'; ctx.fillRect(sx - 30, sy + 180, 660, 20); ctx.fillRect(sx - 30, sy - 30, 20, 230); ctx.fillRect(sx + 610, sy - 30, 20, 230);
    this.order.forEach((k, i) => {
      const T = TOMES[k], x = sx + i * 120, lift = i === this.held ? -30 : 0;
      ctx.fillStyle = shade(T.col, 0.55); ctx.fillRect(x + 6, sy + lift + 6, 96, 170);
      ctx.fillStyle = T.col; ctx.fillRect(x, sy + lift, 96, 170);
      ctx.fillStyle = shade(T.col, 1.25); ctx.fillRect(x, sy + lift, 8, 170);
      ctx.fillStyle = '#ffe070'; ctx.fillRect(x, sy + lift + 24, 96, 4); ctx.fillRect(x, sy + lift + 142, 96, 4);
      text(T.rune, x + 48, sy + lift + 60, '#1a1010', 30, 'center');
      text(T.name, x + 48, sy + lift + 108, '#1a1010', 14, 'center');
      text(String(i + 1), x + 48, sy + 208, '#a8a0b8', 11, 'center');
    });
    const cx = sx + this.cur * 120 + 48; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(cx, sy + 222); ctx.lineTo(cx - 12, sy + 240); ctx.lineTo(cx + 12, sy + 240); ctx.fill();
    text('Left to right = 1 to 5.   Left/Right: move   Z: pick up, then Z again to swap   X: shelve them', W / 2, 610, '#c8c0e0', 11, 'center');
    if (this.confirm) { drawWindow(250, 250, 460, 70); text('Shelve the tomes like this?  Z: yes   X: not yet', W / 2, 290, '#fff', 13, 'center'); }
  }
}
function shelfPuzzle(o = {}) { return new Promise(res => Game.push(new ShelfPuzzle(o, res))); }

async function indexLectern() {
  if (flag('archIndex')) {
    if (flag('dragonBeaten')) return say(null, "The Index rests, perfectly in order. Somewhere in the shelves, something enormous is sulking.");
    await say(null, flag('dragonCalmed') ? "The Index rests in order. Deep in the pages, the Book Dragon is dozing. It dreams of alphabetizing you." : "The Index rests in order. But the shelves hum, as if something enormous is sleeping inside the pages.");
    const c = await ask(R(), "(Misfile a tome on purpose and wake whatever it is?)", ['Wake it (fight the Book Dragon)', 'Leave it sleeping']);
    if (c === 0) await bookDragonFight(true);
    return;
  }
  if (!flag('indexSeen')) {
    setFlag('indexSeen');
    await say(null, "The Index of Myndra: a lectern holding five tomes, and a card in neat silver writing.");
    await say(null, "'Shelve the tomes in their true order, left to right. Read the clues. Do not guess. We are begging you: do not guess.'");
    if (member('miasma')) await say(MI(), "What happens if we guess?");
    await say(null, "A thousand books on a thousand shelves go very, very quiet.");
  }
  const r = await shelfPuzzle();
  if (r === true) return indexSolved(false);
  await bookDragonRises();
}
async function bookDragonRises() {
  Audio2.music(null); Game.shake = 30; Audio2.sfx('boom'); Game.flash = 12;
  await say(null, "WRONG.");
  Game.shake = 40; Audio2.sfx('boom');
  await say(null, "Pages tear loose from every shelf. They swirl, fold, and stack themselves into scales, and wings, and teeth.");
  setFlag('archDragonUp');
  await card({ img: 'b_bookdragon', scale: 1.3, caption: 'THE BOOK DRAGON: every misfiled book in a thousand years, and it remembers all of them.', time: 300 });
  await scene(async ({ raine, miasma, luna, brakka }) => {
    await Promise.all([raine, miasma, luna, brakka].filter(Boolean).map(a => a.surprise()));
    await say('The Book Dragon', "WRONG. SHELF. ONE MINUTE. PUT THEM BACK, OR BECOME A FOOTNOTE.");
    if (brakka) await say('Brakka', "Paper dragon. PAPER. Somebody tell me we have fire. Please tell me we have fire.");
    else if (luna) await say('Luna', "I have never been so afraid of a library fine.");
  });
  const c = await ask(R(), "(The Book Dragon is waiting. Its breath smells like old ink.)", ['Re-shelve them! (1 minute)', 'Fight the Book Dragon']);
  if (c === 0) {
    const r = await shelfPuzzle({ time: 3600 });
    if (r === true) {
      clearFlag('archDragonUp'); setFlag('dragonCalmed');
      await say('The Book Dragon', "...ACCEPTABLE.");
      await say(null, "The dragon unfolds into a thousand pages, and each one flies home to its own shelf.");
      return indexSolved(true);
    }
    await say('The Book Dragon', r === 'timeout' ? "TIME. IS. UP." : "STILL. WRONG.");
  }
  await bookDragonFight(false);
}
async function bookDragonFight(woken) {
  if (woken) { Game.shake = 30; Audio2.sfx('boom'); setFlag('archDragonUp'); await say('The Book Dragon', "WHO. MISFILED. MY. BOOK."); }
  const r = await startBattle({ enemies: ['bookdragon'], boss: true, bg: 'library', music: 'boss', noRun: true });
  if (r !== 'win') return;
  clearFlag('archDragonUp'); setFlag('dragonBeaten');
  await say(null, "The Book Dragon comes apart into drifting pages. One scale stays behind, still warm, covered in tiny angry handwriting.");
  addItem('dragonscript'); await notify('Received Dragonscript!', 'levelup');
  if (!flag('archIndex')) await indexSolved(true);
}
async function indexSolved(afterDragon) {
  setFlag('archIndex');
  if (!afterDragon) { Audio2.sfx('holy'); await say(null, "The tomes click into place. Every shelf in the Athenaeum sighs with relief."); }
  if (!hasItemAnywhere('starboundrod')) { addItem('starboundrod'); await notify('Received the Starbound Rod!', 'levelup'); }
  await say(null, "The curtain of pages over the eastern stairs drifts aside.");
  Audio2.music(musicFor(F().map));
}
function hasItemAnywhere(id) { return !!S().bag[id] || S().party.some(m => Object.values(m.equip).includes(id)) || (S().bench || []).some(m => Object.values(m.equip).includes(id)); }
function clearFlag(k) { delete S().flags[k]; }

async function inkWardenEvent() {
  if (flag('inkWarden')) return;
  await scene(async ({ raine, miasma, luna }) => {
    await say('The Ink Warden', "OVERDUE. OVERDUE. OVERDUE.");
    await say(R(), "We haven't borrowed anything!");
    await say('The Ink Warden', "YOU WILL.");
    await raine.lunge();
  });
  const r = await startBattle({ enemies: ['inkwarden'], boss: true, bg: 'library', music: 'boss', noRun: true });
  if (r !== 'win') return;
  setFlag('inkWarden');
  await say(null, "The Warden dissolves into a puddle of ink that spells, very neatly, 'RETURNED.'");
  addItem('wardenmantle'); await notify('Received the Warden\'s Mantle!', 'levelup');
  giveKey('myndrapage'); await notify('Received the Ledger of Seats!', 'levelup');
  await scene(async ({ raine, miasma, verai }) => {
    await say(null, "The page reads: 'Every seat is held by faith. When faith breaks, a seat can be taken. Nyxia's did not break. It was STOLEN. And what is stolen can be stolen back.'");
    if (verai) { await verai.tremble(30); await say(VE(), "Stolen back. By who, I wonder."); }
    await miasma.sad();
    await say(MI(), "...Put that somewhere safe, kid. That's the kind of page people kill for.");
  });
}

// ------------------------------------------------------------------ Hollowgrin's chest
async function feyChestAgain() {
  if (flag('feyBeaten')) return say(null, "The chest is empty. ...Somewhere very, very small, someone giggles.");
  Audio2.sfx('holy');
  await notify('Hey... it looks like there\'s something in there.', null);
  const c = await ask(R(), "(Something glints at the very bottom. Much deeper than a chest should go.)", ['Reach in', 'Leave it alone']);
  if (c !== 0) { if (member('luna')) await say('Luna', "Good instinct, Captain. Chests that are deeper than they look are how fairy tales start."); return; }
  await say(null, "Careful. Whatever is down there is not an ordinary treasure, and it is looking back at you.");
  const s = await ask(null, "Would you like to save before you reach in?", ['Save first', 'Reach in without saving', 'Back away']);
  if (s === 2) return;
  if (s === 0) { const ok = saveGame(); Audio2.sfx(ok ? 'save' : 'error'); await notify(ok ? 'Game saved.' : 'Saving is unavailable here.', null); }
  setFlag('feySeen');
  await scene(async ({ raine, miasma, luna, verai, brakka }) => {
    raine.face('right');
    await say(null, "Raine reaches in. And in. And IN.");
    await raine.surprise();
    Game.flash = 16; Audio2.sfx('dark');
    for (const a of [raine, miasma, luna, verai, brakka].filter(Boolean)) a.spin && a.spin();
    await wait(30);
  });
  const party = S().party.map(m => HEROES[m.id].look);
  await cinema([
    { dur: 150, bg: 'void', sfx: 'dark', caption: 'The chest yawns open like a mouth, and the world gets VERY big.', layers: party.map((lk, i) => ({ look: lk, x: W / 2 - 180 + i * 120, y: 420, s: 3, to: { x: W / 2, y: 300, s: 0.2, a: 0 } })) },
    { dur: 110, bg: 'black', caption: '(Somewhere, someone giggles.)' },
  ], { skipAll: false });
  F().enterMap('feychest1', 10, 12, 'up');
  Game.fade = 0;
  await scene(async ({ raine, miasma, luna, verai, brakka }) => {
    await Promise.all([raine, miasma, luna, verai, brakka].filter(Boolean).map(a => a.question()));
    await say(MI(), "Why is everything... enormous?");
    if (luna) await say('Luna', "Is that a THIMBLE? That thimble could be a house. I would live in that thimble.");
    if (brakka) await say('Brakka', "Those are BUTTONS. We're inside the chest. We are tiny. I have never wanted a notebook more.");
    await say(null, "A voice giggles from everywhere at once: \"Hee hee! New toys! Come and find me, toys!\"");
    await raine.angry();
    await say(R(), "Okay. We find whoever that is, and we make them put us back.");
  });
}
async function hollowgrinEvent() {
  if (flag('feyBeaten') || F()._feyBusy) return;
  const f = F(); f._feyBusy = true;
  try {
    scaleFey(partyLevel());
    await scene(async ({ raine, miasma, luna, verai }) => {
      await say('Hollowgrin', "Visitors! In MY chest! Nobody visits anymore. They just put things in and forget.");
      await card({ img: 'b_hollowgrin', scale: 1.4, caption: 'HOLLOWGRIN, THE CHEST-FEY: he collects the things people forget. Lately, he collects people.', time: 300 });
      await say('Hollowgrin', "Let's play a game! It's called Statues. I say STOP, and you stop. Forever. Hee hee!");
      if (verai) { await verai.stepBack(); await say(VE(), "His smoke... it's like mine. But hungry."); }
      if (luna) { await luna.angry(); await say('Luna', "I have fought wolves, dragons and my own reflection. I will not lose to a man made of lint."); }
      await raine.lunge();
    });
    const r = await startBattle({ enemies: ['hollowgrin'], boss: true, bg: 'fey', music: 'final', noRun: true });
    if (r !== 'win') return;
    setFlag('feyBeaten');
    await scene(async ({ raine, miasma, luna, verai }) => {
      await say('Hollowgrin', "Hee... hee. Fine. FINE. You win. Take your prizes and go be big somewhere else.");
      addItem('feyribbon'); addItem('grinblade'); S().gold += 5000;
      await notify('Received the Fey Ribbon, the Grinning Knife and 5000 gold!', 'levelup');
      if (verai) {
        const m = member('verai'); m.bonus = [...new Set([...(m.bonus || []), 'hollownight'])];
        await say(null, "The night Hollowgrin stole from a hundred sleepers drifts loose. It curls into Verai's smoke like a cat finding a lap.");
        await verai.surprise();
        await say(VE(), "I can hold it. The night. I can hold it still.");
        await notify('Verai learned Hollow Night!', 'levelup');
      } else {
        const m = member('luna') || (S().bench || []).find(b => b.id === 'luna');
        if (m) {
          m.bonus = [...new Set([...(m.bonus || []), 'twinmoon'])];
          await say(null, "Hollowgrin's last giggle catches in Luna's throat and comes out as a howl: silver, and proud.");
          if (luna) { await luna.hop(8); await say('Luna', "That was... a knight technique. Obviously. The Twin Moon Oath. Knights learn it in... the moon."); }
          await notify('Luna learned Twin Moon Oath!', 'levelup');
        }
      }
      await raine.nod();
    });
    await cinema([{ dur: 140, bg: 'stars', flash: 12, sfx: 'holy', caption: 'The world shrinks back to its proper size. Or you grow. It is hard to tell which.' }], { skipAll: false });
    f.enterMap('charnoch', 22, 13, 'right');
    Game.fade = 0;
    await say(null, "You're standing in front of the chest in Charnoch. Nobody saw anything. The chest looks slightly smug.");
  } finally { f._feyBusy = false; }
}

// ------------------------------------------------------------------ the Bell-Ringer's game
const BELLS = { up: { f: 784, x: W / 2, y: 190, col: '#ffe070' }, left: { f: 523, x: W / 2 - 170, y: 330, col: '#80f0e0' }, right: { f: 659, x: W / 2 + 170, y: 330, col: '#ff90c0' }, down: { f: 392, x: W / 2, y: 470, col: '#a0a0ff' } };
class BellGame {
  constructor(res) { this.res = res; this.opaque = true; this.round = 0; this.lengths = [4, 6, 8]; this.newRound(); }
  enter() { this._fade = Game.fade; Game.fade = 0; } leave() { Game.fade = this._fade || 0; }
  newRound() { const d = Object.keys(BELLS); this.seq = Array.from({ length: this.lengths[this.round] }, () => pick(d)); this.phase = 'show'; this.t = -40; this.i = 0; this.lit = null; }
  ring(d) { const b = BELLS[d]; Audio2.tone(b.f, 0.5, 'triangle', 0.25); Audio2.tone(b.f * 2, 0.3, 'sine', 0.08); this.lit = d; this.litT = 18; }
  press(d) {
    if (this.phase !== 'input') return;
    this.ring(d);
    if (d !== this.seq[this.i]) { Audio2.sfx('error'); this.phase = 'fail'; this.t = 0; return; }
    this.i++;
    if (this.i >= this.seq.length) { this.round++; this.phase = this.round >= this.lengths.length ? 'won' : 'next'; this.t = 0; if (this.phase === 'next') Audio2.sfx('ok'); }
  }
  update() {
    this.t++; if (this.litT > 0 && --this.litT === 0) this.lit = null;
    if (this.phase === 'show') { if (this.t >= 0 && this.t % 34 === 0) { if (this.i < this.seq.length) this.ring(this.seq[this.i++]); else { this.phase = 'input'; this.i = 0; } } return; }
    if (this.phase === 'input') { for (const d of Object.keys(BELLS)) if (Input.hit(d)) this.press(d); if (Input.cancel()) { this.phase = 'fail'; this.t = 0; } return; }
    if (this.phase === 'next' && this.t > 60) { this.newRound(); return; }
    if ((this.phase === 'fail' || this.phase === 'won') && this.t > 70) { Game.pop(this); this.res(this.round); }
  }
  draw() {
    drawStars('#08080e', '#2a2a3a');
    text('The Guiding of Souls', W / 2, 50, '#e8e0ff', 18, 'center');
    text(`Round ${Math.min(this.round + 1, 3)} of 3: ${this.seq.length} bells`, W / 2, 84, '#a8a8d0', 12, 'center');
    for (const [d, b] of Object.entries(BELLS)) {
      const on = this.lit === d;
      ctx.fillStyle = on ? b.col : shade(b.col, 0.35); ctx.beginPath(); ctx.arc(b.x, b.y, on ? 58 : 50, Math.PI, 0); ctx.lineTo(b.x + (on ? 66 : 58), b.y + 40); ctx.lineTo(b.x - (on ? 66 : 58), b.y + 40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1a1a22'; ctx.beginPath(); ctx.arc(b.x, b.y + 46, 10, 0, Math.PI * 2); ctx.fill();
      text({ up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT' }[d], b.x, b.y + 72, '#fff', 11, 'center');
    }
    const msg = { show: 'Listen...', input: `Your turn: ring them back (${this.i}/${this.seq.length})`, next: 'Well rung! Longer now...', fail: 'A sour note. The dead wince politely.', won: 'Perfect! Even the dead are clapping.' }[this.phase];
    text(msg, W / 2, 590, '#ffe070', 14, 'center');
  }
}
function bellMinigame() { return new Promise(res => Game.push(new BellGame(res))); }
async function bellGame() {
  const BR2 = 'Bell-Ringer';
  if (!flag('bellMet')) {
    setFlag('bellMet');
    await say(BR2, "At sunset I ring the Guiding of Souls. Lately, the bell rings back. It has made me... competitive.");
    await say(BR2, "Four bells. I ring a pattern, you ring it back. Three rounds, each longer. Do well, and I'll pay you in grave-goods. The dead don't need them. Mostly.");
  }
  const c = await ask(BR2, "Ring the bells?", ['Play (arrow keys)', 'Not now']);
  if (c !== 0) return;
  const n = await bellMinigame();
  const prizes = [['ashsalve', 3, 'Ash Salve x3'], ['megatonic', 2, 'Mega-Tonic x2'], ['gravecharm', 1, 'Grave Charm']];
  let got = false;
  for (let r = 0; r < n; r++) if (!flag('bell' + (r + 1))) { setFlag('bell' + (r + 1)); addItem(prizes[r][0], prizes[r][1]); await notify(`Round ${r + 1} prize: ${prizes[r][2]}!`, 'chest'); got = true; }
  if (n === 3) await say(BR2, flag('bellPerfect') ? "Perfect again! You'll put me out of a job." : "PERFECT. I have been ringing for forty years and I have never been so jealous.");
  if (n === 3) setFlag('bellPerfect');
  else if (!got) await say(BR2, n ? "Not bad! But you've won that prize already. Go one round further next time." : "The dead are very forgiving. Try again whenever you like.");
}
