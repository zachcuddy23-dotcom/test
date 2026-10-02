'use strict';
// ---------------------------------------------------------------------------
// Chapter Three maps: the Frostreach (a new world map), Hearthmoor and its clinic,
// the Wren's deck, and the Wyrmspire, Miasma's old mountain (5 floors, two ice-slide puzzles).
// Ice ('i' indoors) makes you slide until you hit something. Every ice floor is solvable
// from every spot you can stop on (checked by tools/check/validate.js).
// ---------------------------------------------------------------------------
Object.assign(THEMES, {
  frostworld: { grass: '#eef2f8', path: '#c8d0dc', floor: '#e4eaf2', floor2: '#dae2ec', water: '#4a7ab8' },
  snowtown: { wall: '#8a7a6a', wallDark: '#4a3e34', floor: '#e8eef6', floor2: '#dde5f0', grass: '#eef2f8', path: '#b8c0cc', water: '#6a9ad8', carpet: '#8a2a2a', wood: '#6a4a30', roof: '#7a3a2e', bwall: '#c8bca8', timber: '#4a3a2a' },
  clinic: { wall: '#7a6048', wallDark: '#3e3024', floor: '#b08a60', floor2: '#a88258', grass: '#eef2f8', carpet: '#6a8a6a', wood: '#6a4a30' },
  snowpeak: { wall: '#8aa0b8', wallDark: '#4a5a70', floor: '#e8eef6', floor2: '#dde5f0', grass: '#eef2f8', path: '#c0cad8', water: '#6a9ad8', carpet: '#8a2a2a', wood: '#6a4a30' },
  icecave: { wall: '#4a6a8a', wallDark: '#223448', floor: '#c8d8ea', floor2: '#bccde0', grass: '#dde8f4', path: '#a8bcd4', water: '#4a7ab8' },
  nest: { wall: '#5a3a2a', wallDark: '#2a1812', floor: '#8a6a50', floor2: '#806248', grass: '#6a5a44', path: '#9a7a5a', carpet: '#8a2a1a', wood: '#5a3a20' },
  wrendeck: { wall: '#6a4a28', wallDark: '#2a1a0c', floor: '#a07040', floor2: '#946838', water: '#1a2a60', wood: '#6a4a28' },
});
const snowBase = (P, th, rng) => speckle(P, rng, th.grass || '#eef2f8', 14, ['#d8e0ec', '#ffffff', '#c8d4e4']);
Object.assign(TILE_ART, {
  snowfield(P, th, rng) { snowBase(P, th, rng); for (let i = 0; i < 2; i++) { const x = 1 + Math.floor(rng() * 13), y = 2 + Math.floor(rng() * 12); P.p(x, y, '#b8c8dc'); P.p(x + 1, y, '#b8c8dc'); } },
  pine(P, th, rng) {
    snowBase(P, th, rng);
    for (const [cx, cy] of [[4, 4], [11, 3], [8, 10]]) { P.r(cx, cy + 5, cx, cy + 6, '#4a3020'); for (let j = 0; j < 6; j++) { P.r(cx - Math.floor(j / 2), cy + j, cx + Math.floor(j / 2), cy + j, j % 2 ? '#1e4a34' : '#2a5a40'); } P.p(cx, cy, '#ffffff'); P.p(cx - 1, cy + 2, '#ffffff'); P.p(cx + 1, cy + 2, '#ffffff'); }
  },
  icepeak(P, th, rng) {
    snowBase(P, th, rng);
    for (let j = 0; j < 14; j++) P.r(8 - Math.floor(j / 2), 1 + j, 8 + Math.floor(j / 2), 1 + j, j < 5 ? '#ffffff' : (j % 3 ? '#7a8ca8' : '#6a7c98'));
    P.r(8, 6, 8, 14, '#5a6a84');
  },
  frozenlake(P, th, rng) { P.r(0, 0, 15, 15, '#a8d0ec'); P.r(0, 0, 15, 0, '#c8e4f8'); for (let i = 0; i < 3; i++) { const x = Math.floor(rng() * 12), y = Math.floor(rng() * 14); P.r(x, y, x + 3, y, '#ffffff'); } P.p(Math.floor(rng() * 15), Math.floor(rng() * 15), '#6a9ac0'); },
  spire(P, th, rng) {
    snowBase(P, th, rng);
    P.r(6, 1, 9, 14, '#6a7c98'); P.r(5, 6, 10, 14, '#7a8ca8'); P.r(4, 11, 11, 14, '#8a9cb8'); P.r(7, 0, 8, 3, '#ffffff'); P.r(6, 4, 9, 5, '#ffffff'); P.p(7, 9, '#ff6040'); P.p(8, 9, '#ff9060');
  },
  icefloor(P, th, rng) { P.r(0, 0, 15, 15, '#b4dcf4'); P.r(0, 15, 15, 15, '#94bcd8'); P.r(15, 0, 15, 15, '#94bcd8'); for (let i = 0; i < 3; i++) { const x = Math.floor(rng() * 10) + 1, y = Math.floor(rng() * 12) + 1; P.r(x, y, x + 3, y, '#e8f6ff'); P.p(x + 4, y + 1, '#e8f6ff'); } },
  icerock(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 0); P.r(2, 5, 13, 14, '#5a7090'); P.r(3, 3, 12, 12, '#7a90b0'); P.r(4, 2, 10, 4, '#9ab0cc'); P.r(4, 3, 6, 9, '#b8cce0'); P.r(2, 14, 13, 15, '#3a4a60'); },
  snowpine(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 0); P.r(7, 12, 8, 15, '#4a3020'); for (let j = 0; j < 12; j++) P.r(8 - Math.floor(j / 2), 1 + j, 7 + Math.floor(j / 2) + 1, 1 + j, j % 3 ? '#1e4a34' : '#2a5a40'); P.r(7, 1, 8, 2, '#ffffff'); P.r(5, 5, 6, 5, '#ffffff'); P.r(9, 5, 10, 5, '#ffffff'); P.r(3, 9, 4, 9, '#ffffff'); P.r(11, 9, 12, 9, '#ffffff'); },
  lily(P, th, rng, f) { TILE_ART.floor(P, th, rng, 0, 0); P.r(7, 8, 8, 14, '#3a7a5a'); P.r(4, 11, 7, 11, '#3a7a5a'); const g = f % 2 ? '#e0f8ff' : '#a8e0ff'; P.circ(8, 6, 4, g); P.circ(8, 6, 2, '#ffffff'); P.p(3, 2, g); P.p(13, 4, g); },
  frozenfall(P, th, rng, f) { P.r(0, 0, 15, 15, '#9ac8e8'); for (let x = 1; x < 16; x += 3) P.r(x, 0, x, 15, (x + f) % 2 ? '#e8f8ff' : '#c8e8fa'); P.r(0, 14, 15, 15, '#6a9ac0'); },
});
Object.assign(WORLD_TILES, {
  i: { art: 'snowfield', enc: 1 }, p: { art: 'pine', enc: 1.4 }, y: { art: 'icepeak', solid: true }, l: { art: 'frozenlake', solid: true }, S: { art: 'spire', place: true },
});
Object.assign(IN_TILES, {
  i: { art: 'icefloor', ice: true }, y: { art: 'icerock', solid: true }, '%': { art: 'snowpine', solid: true }, '&': { art: 'lily', solid: true, anim: 2 }, '@': { art: 'frozenfall', solid: true, anim: 4 },
});
Object.assign(MUSIC, {
  frost: { bpm: 84, loop: true, voices: [
    { type: 'triangle', vol: 0.2, seq: mel('E5:4 G5:4 B5:6 A5:2  G5:4 F#5:4 E5:8  D5:4 E5:4 G5:6 E5:2  B4:16  C5:4 E5:4 A5:6 G5:2  F#5:4 E5:4 D5:8  E5:4 G5:4 F#5:4 D5:4  E5:16') },
    { type: 'square', vol: 0.03, seq: pad('Em Em C Em Am D Em Em') },
    { type: 'sine', vol: 0.05, seq: arp('Em Em C Em Am Dm Em Em').map((n, i) => (i % 2 ? '.' : n)) },
  ] },
  hearth: { bpm: 104, loop: true, voices: [
    { type: 'square', vol: 0.08, seq: mel('G4:2 C5:2 E5:2 G5:4 E5:2 D5:2 C5:2  D5:4 G4:2 B4:2 D5:6 r:2  E5:2 F5:2 G5:2 A5:2 G5:2 E5:2 C5:2 E5:2  D5:6 C5:2 C5:8') },
    { type: 'triangle', vol: 0.18, seq: bass('C G Am G') },
  ] },
  wyrm: { bpm: 132, loop: true, voices: [
    { type: 'sawtooth', vol: 0.07, seq: mel('E4:2 E4:2 G4:2 E4:2 A4:4 G4:2 E4:2  D4:2 D4:2 F#4:2 D4:2 G4:4 F#4:2 D4:2  C4:2 C4:2 E4:2 G4:2 C5:4 B4:2 A4:2  B4:4 D#5:4 F#5:4 B5:4') },
    { type: 'triangle', vol: 0.2, seq: bass('Em D C Bm') },
    { type: 'noise', vol: 0.05, seq: drums(4, 'x..xx...x..xx.x.') },
  ] },
});

// ------------------------------------------------------------------ the Frostreach (world map)
MAPS.frostreach = {
  world: true, theme: 'frostworld', music: 'frost', name: 'The Frostreach', home: 'hearthmoor',
  rows: [
      "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~y~~~~~~~~~~~~~~~~~",
      "~~~~~~~~~~~~~~~~~yyyyyy~~~~~~~~~~~~~~~",
      "~~~~~~~~~~~~yyyyyyyyyyyyy~~~~~~~~~~~~~",
      "~~~~~~~~~~yyyyyyiiSiiyyyyyyyy~~~~~~~~~",
      "~~~~~~~~~yyyyyyyiiiiiyyyyyyyyyy~~~~~~~",
      "~~~~~~~yyyyyyyyyiiiiiyyyyyyyyyyy~~~~~~",
      "~~~~~~yyiyiiyiyiiiiiiyiipiiyiyyyy~~~~~",
      "~~~~~iyiiiiyyyiiiiiiiiypipiyiyiiy~~~~~",
      "~~~~~iyiiiiyiiiiiiiiiipppypiyiyyy~~~~~",
      "~~~~~iiiiiiiiiiiiiiiiiipppiiiipiii~~~~",
      "~~~~~iiiiiiiiiiiiiiiiiiipiiiipppii~~~~",
      "~~~~iiiipiiiiiiiiiiiiiillliippiipi~~~~",
      "~~~iiipppipiiiiiiiiiiillllliipppiii~~~",
      "~~~iiippipiiiiiiiiiiiilllllipipiiii~~~",
      "~~~~ipppiippiiiiiiiiiiilllpppipiiii~~~",
      "~~~~~ipppppiiiiiiiiiiiiiiiippppiii~~~~",
      "~~~~~~ppppiiiiiiiiiiiiiiipppppppi~~~~~",
      "~~~~~~iipiiiiiiiiiiiiiiiiipppppii~~~~~",
      "~~~~~~~iiiiiiiiiiiiiiiiiiiipiiiiiD~~~~",
      "~~~~~~~iiiiiiTiiiiiiiiiiiiiipiii~~~~~~",
      "~~~~~~~~iiiiiiiiiiiiiiiiiiiiiii~~~~~~~",
      "~~~~~~~~~ipPiipiiiiiiiiiiiiiii~~~~~~~~",
      "~~~~~~~~~~~pppiiiiiiiiiiii~~~~~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~iiiii~~~~~~~~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
  places: {
    '13,20': { map: 'hearthmoor', at: [14, 14, 'up'] },
    '18,4': { map: 'wyrm1', at: [8, 14, 'up'], check: async () => { if (flag('ch3herb')) { await say(null, "The Wyrmspire. The snow up there looks lighter now, somehow."); return false; } if (!flag('ch3doctor')) { await say(null, "The Wyrmspire. Nobody in their right mind climbs it. (Get Raine to a doctor first!)"); return false; } return true; } },
    '11,22': { map: 'hearthmoor', check: async () => { await wrenDocked(); return false; } },
    '33,19': { map: 'hearthmoor', check: async () => { await southPass(); return false; } },
  },
  zone() { return 'frostfield'; },
  bg() { return 'snowfield'; },
};

Object.assign(MAPS, {
  wrendeck: {
    name: 'The Wren', theme: 'wrendeck', music: 'sea', under: 'd', exitArt: 'deck', start: [8, 5, 'up'],
    rows: [
      "~~~~~~~~~~~~~~~~~~",
      "~~~qqqqqqqqqqqq~~~",
      "~~qddddddddddddq~~",
      "~qdddpd1dddpdddq~~",
      "~qddddddddddddddq~",
      "~qdd$ddddddd$dddq~",
      "~qddddddddddddddq~",
      "~~qddddddddddddq~~",
      "~~~qqqqqqqqqqqq~~~",
      "~~~~~~~~~~~~~~~~~~",
    ],
    npcs: { 1: { look: 'sailor', name: 'Wren Crew', talk: [() => "Hearthmoor's the closest port. We'll make it by dawn. Hold on, Captain."] } },
  },
  hearthmoor: {
    name: 'Hearthmoor', theme: 'snowtown', music: 'hearth', under: '.', exitArt: 'path', worldId: 'frostreach', back: [13, 21], start: [14, 14, 'up'],
    rows: [
      "%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
      "%..........................%",
      "%.RRRRR...RRRRRRR....RRRRR.%",
      "%.RRRRR...RRRRRRR....RRRRR.%",
      "%.bbWbb...bbbb+bb....bbNbb.%",
      "%.............,............%",
      "%,,,,,,,,,,,,,,,,,,,,,,,,,,%",
      "%......1......,.....2......%",
      "%.RRRRR.......,......RRRRR.%",
      "%.RRRRR....O..,..L...RRRRR.%",
      "%.bbAbb.......,......bbIbb.%",
      "%.......3.....,.....4......%",
      "%..RRRRR......,......5.....%",
      "%..bbHbb......,............%",
      "%.......6.....,.......7....%",
      "%%%%%%%%%%%%%XX%%%%%%%%%%%%%",
    ],
    shops: 'hearthmoor',
    doors: { '14,4': { map: 'clinic', x: 6, y: 6, dir: 'up' } },
    npcs: {
      1: { look: 'oldman', move: 'wander', talk: [() => flag('ch3herb') ? "Somebody flew down the Wyrmspire last night. Flew! On a DRAGON! My wife says I'm drunk. I am, but that's not the point." : "Twenty years ago a red dragon lived on the Wyrmspire. Laughed so loud she started avalanches. Then one spring she was gone, and the Frost Wyrm took the peak."] },
      2: { look: 'woman', act: 'sweep', talk: [() => "The snow never stops up here. You learn to love it, or you learn to move."] },
      3: { look: 'child', move: 'wander', talk: [() => flag('ch3herb') ? "I saw a RED DRAGON! Mama says it was a big bird. It was NOT a big bird." : "Are you going up the mountain? My big brother tried. He came back with no eyebrows and a very long story."] },
      4: { look: 'sailor', name: 'Wren Crew', talk: [() => flag('ch3cured') ? "The Wren's ready when you are, Captain. Glad to see you standing." : "The Wren's at the dock. We're not going anywhere without the Captain."] },
      5: { look: 'dwarf', talk: [() => "Hearthmoor steel is quenched in glacier water. Good against things that burn. Bad against things that are already frozen, but you can't win them all."] },
      6: { look: 'priest', talk: [() => "The Temple of Light calls dragons abominations. Up here, we used to leave the red one honey cakes on the solstice. She'd leave us firewood. Good neighbor."] },
      7: { look: 'merchant', talk: [async () => hearthBench()], show: () => !!(S().bench || []).length && flag('ch3cured') },
    },
    signs: { '11,9': () => say(null, "A frozen fountain shaped like a dragon. Someone has knitted it a scarf.") },
  },
  clinic: {
    name: 'Dr. Thistlewood\'s Clinic', theme: 'clinic', music: () => flag('ch3cured') ? 'hearth' : 'sorrow', under: 'P', exitArt: 'floor', back: { map: 'hearthmoor', x: 14, y: 5, dir: 'down' }, start: [6, 6, 'up'],
    rows: [
      "##############",
      "#kk*kk##kk*kk#",
      "#PPPPPPPPPPPP#",
      "#Pu1PPPPPPPPP#",
      "#PPPP2PPP$$PP#",
      "#PPPPPPP3PPPP#",
      "#PPPPPPPPPPPP#",
      "######XX######",
    ],
    underAt: { '1': 'u' },
    npcs: {
      1: { look: 'raine', name: 'Raine', pose: () => 'sleep', show: () => flag('ch3sick') && !flag('ch3cured'), talk: [async () => raineBedside()] },
      2: { look: 'halfling', name: 'Dr. Thistlewood', talk: [async () => doctorTalk()] },
      3: { look: 'luna', name: 'Luna', show: () => false, talk: [async () => watcherTalk()] },
    },
  },
  // ---- the Wyrmspire ----
  wyrm1: {
    name: 'The Wyrmspire - Snowy Trail', theme: 'snowpeak', music: 'frost', under: '.', exitArt: 'path', worldId: 'frostreach', back: [18, 5], start: [8, 14, 'up'], enc: 'wyrmspire', encRate: 0.06, bg: 'snowfield',
    rows: [
      "yyyyyyyyyyyyyyyyyyyyyyyy",
      "yyyyyyyyyyyyyyy>yyyyyyyy",
      "y%%......%%%...,....%%%y",
      "y%.......%%...,,...Q.%%y",
      "y..yy.........,.......%y",
      "y..yy....%%..,,....yy..y",
      "y.......%%%%.,.....yy..y",
      "y%...........,.........y",
      "y%%....yy...,,...%%%...y",
      "y%%....yy...,...%%%%...y",
      "y.........,,,..........y",
      "y..%%.....,.......yy...y",
      "y..%%....,,.......yy..%y",
      "y%......,,............%y",
      "y%%.....,.........V..%%y",
      "yyyyyyyyXXyyyyyyyyyyyyyy",
    ],
    warps: { '>': { map: 'wyrm2', at: '<' } },
    chests: { Q: { id: 'c3_w1a', item: 'warmdraught', n: 3 }, V: { id: 'c3_w1b', item: 'furhood' } },
    steps: { '13,10': () => climbMoment(1), '12,10': () => climbMoment(1), '11,10': () => climbMoment(1) },
  },
  wyrm2: {
    name: 'The Wyrmspire - Frozen Falls', theme: 'icecave', music: 'frost', under: '.', exitArt: 'floor', start: [1, 14, 'right'], enc: 'wyrmspire', encRate: 0.04, bg: 'icecave',
    rows: [
      "yyyyyyyyyyyyyyyyyyyy",
      "yyyyyyyyyy>yyyyyyyyy",
      "yiiiiiiiiiiiiiiiiiiy",
      "yiiyiiyiiyiiyiiiiiiy",
      "yiiiiiiyyiiiiiiyyiiy",
      "yiyiiiiiiyiiiiiiiiiy",
      "yyiiiiiiyyyiyiiiiiyy",
      "yiiiiiiiiiiiiiiiiiiy",
      "yyiiyiiyiiyiiiiiiiiy",
      "yiiiiiiiyiiiiiiiiiiy",
      "yiiiiiiiiiyiiyiiiyiy",
      "yiiiiiiiiiiiiiyiiiiy",
      "yyiiiiiiiiiyiiiiiiiy",
      "y.................Qy",
      "y<.......@@.......Vy",
      "yyyyyyyyyyyyyyyyyyyy",
    ],
    warps: { '<': { map: 'wyrm1', at: '>' }, '>': { map: 'wyrm3', at: '<' } },
    chests: { Q: { id: 'c3_w2a', item: 'megatonic', n: 3 }, V: { id: 'c3_w2b', item: 'glacierspear' } },
    steps: { '2,14': () => climbMoment(2), '2,13': () => climbMoment(2) },
  },
  wyrm3: {
    name: 'The Wyrmspire - The Old Nest', theme: 'nest', music: () => flag('ch3nest') ? 'frost' : 'sorrow', under: '.', exitArt: 'floor', start: [1, 12, 'right'], bg: 'icecave',
    rows: [
      "####################",
      "#@@##..GGGGGG..##@@#",
      "#@..#..GGaGGG..#..@#",
      "#...#..GGGGGG..#...#",
      "#.......GGGG.......#",
      "#..a.............Q.#",
      "#......##..##......#",
      "#......#....#...L..#",
      "#..................#",
      "####...######...####",
      "#......>....#......#",
      "#.......##..#..V...#",
      "#<..........#......#",
      "####################",
    ],
    warps: { '<': { map: 'wyrm2', at: '>' }, '>': { map: 'wyrm4', at: '<' } },
    chests: { Q: { id: 'c3_w3a', item: 'oldredscale' }, V: { id: 'c3_w3b', item: 'hiether', n: 3 } },
    signs: {
      '9,2': () => nestSign('hoard'), '3,5': () => nestSign('helm'),
    },
    steps: { '4,12': () => climbMoment(3), '5,12': () => climbMoment(3), '4,11': () => climbMoment(3) },
  },
  wyrm4: {
    name: 'The Wyrmspire - The Windstair', theme: 'icecave', music: 'wyrm', under: '.', exitArt: 'floor', start: [1, 14, 'right'], enc: 'wyrmspire2', encRate: 0.04, bg: 'icecave',
    rows: [
      "yyyyyyyyyyyyyyyyyyyyyy",
      "yyyyyyyyyyyyyyyy>yyyyy",
      "yiiiiiyiiiiiiyiiiiiyiy",
      "yiiiiiiiiiiyiiiiiiiiiy",
      "yiiiiiiiyiiiyiiiiyiiiy",
      "yiiiiiiiiiiiiiiyiiiiiy",
      "yiiiiiiyiiiiiiyiyiiiiy",
      "yiiiiiiiyiiiiiiiiiyyiy",
      "yiyiiiiiyiiiyiiiiiiiiy",
      "yiiiiiiyiyiiiiyiiyyiiy",
      "yiiiiiiiiiiiiiiiiiiiiy",
      "yiiiiyiiiiiiiiiyiiiiiy",
      "yiiyiiyiiiyiiiiiiiiiiy",
      "y.....1..............y",
      "y<..................Qy",
      "yyyyyyyyyyyyyyyyyyyyyy",
    ],
    underAt: { '1': '.' },
    warps: { '<': { map: 'wyrm3', at: '>' }, '>': { map: 'summit', at: '<' } },
    chests: { Q: { id: 'c3_w4a', item: 'wyrmmail' } },
    npcs: { 1: { enemy: 'yetimother', scale: 0.4, name: 'Old Mother Yeti', show: () => !flag('ch3yeti'), talk: [async () => yetiEvent()] } },
    steps: { '4,13': () => yetiEvent(), '4,14': () => yetiEvent() },
  },
  summit: {
    name: 'The Wyrmspire - Summit', theme: 'snowpeak', music: () => flag('ch3herb') ? 'frost' : 'sorrow', under: '.', exitArt: 'floor', start: [1, 10, 'right'], bg: 'summit',
    rows: [
      "yyyyyyyyyyyyyyyyyy",
      "yyyyyyyy&&yyyyyyyy",
      "yy@.....1......@yy",
      "y................y",
      "y..y..........y..y",
      "y................y",
      "y.......,,.......y",
      "y..%....,,....%..y",
      "y.......,,.......y",
      "y.......,,.......y",
      "y<......,,.......y",
      "yyyyyyyyyyyyyyyyyy",
    ],
    underAt: { '1': '.' },
    warps: { '<': { map: 'wyrm4', at: '>' } },
    npcs: { 1: { enemy: 'rimeclaw', scale: 0.32, name: 'Rimeclaw', show: () => flag('ch3summit') && !flag('ch3herb'), talk: [async () => rimeclawEvent()] } },
    signs: { '9,1': () => lilyEvent() },
    steps: { '8,6': () => rimeclawEvent(), '9,6': () => rimeclawEvent(), '8,5': () => rimeclawEvent(), '9,5': () => rimeclawEvent() },
  },
});

// ===========================================================================
// Chapter Three, part two: the Frostfang Pass, the Solanthia Undercity, the Temple cells and the Grand Tribunal
// ===========================================================================
Object.assign(THEMES, {
  undercity: { wall: '#4a4a52', wallDark: '#1e1e24', floor: '#6a6a70', floor2: '#626268', grass: '#3a4a3a', water: '#2a4a5a', path: '#7a7a80', carpet: '#5a4a2a', wood: '#4a3a2a' },
});
// the Frostreach's south pass now leads somewhere
MAPS.frostreach.places['33,19'] = { map: 'pass1', at: [11, 1, 'down'], check: async () => { if (!flag('ch3part1')) { await southPass(); return false; } if (!flag('ch3pass')) await passDeparture(); return true; } };
// ...and comes out on the Aurelion world map, north of Solanthia
WORLD.rows[5] = WORLD.rows[5].slice(0, 23) + 'M' + WORLD.rows[5].slice(24);
WORLD.places['23,5'] = { map: 'pass2', at: [11, 14, 'up'] };
{ // Solanthia's gate, now that Raine is a wanted woman
  const gate = WORLD.places['27,11'], old = gate.check;
  gate.check = async () => {
    if (flag('ch3part1') && !flag('ch3trial')) { await solanthiaReturn(); return false; }
    if (flag('ch3trial')) { await say('Dawnguard', "The gates are sealed while the Temple... sorts itself out. Also there is a warrant for a dragon. Please go away before I have to be brave."); return false; }
    return old();
  };
}
Object.assign(MAPS, {
  pass1: {
    name: 'Frostfang Pass - North Gorge', theme: 'snowpeak', music: 'frost', under: '.', exitArt: 'path', worldId: 'frostreach', back: [32, 19], start: [11, 1, 'down'], enc: 'frostpass', encRate: 0.06, bg: 'snowfield',
    rows: [
      "yyyyyyyyyyyXXyyyyyyyyyyyyy",
      "y%%......y.,,.y.....%%%%.y",
      "y%.......y..,.y.........%y",
      "y...yy......,.....yy.....y",
      "y...yy....,,,.....yy..%%.y",
      "y%........,..........Q%%.y",
      "y%%...%%..,,,............y",
      "yyyyyy....,..,...yyyyyy..y",
      "y.........,..,,,.......%.y",
      "y..%%...,,,....,...yy....y",
      "y..%%...,.......,..yy....y",
      "y%.....,,.......,,.......y",
      "y%%....,.........,,...%%.y",
      "y.V....,..........,...%%.y",
      "y......,..........,>.....y",
      "yyyyyyyyyyyyyyyyyyyyyyyyyy",
    ],
    warps: { '>': { map: 'pass2', at: '<' } },
    chests: { Q: { id: 'c3_p1a', item: 'megatonic', n: 3 }, V: { id: 'c3_p1b', item: 'hearthcharm' } },
    steps: { '10,6': () => avalancheMoment(), '11,6': () => avalancheMoment(), '12,6': () => avalancheMoment() },
  },
  pass2: {
    name: 'Frostfang Pass - South Mouth', theme: 'snowpeak', music: 'frost', under: '.', exitArt: 'path', worldId: 'world', back: [23, 6], start: [1, 1, 'right'], enc: 'frostpass', encRate: 0.06, bg: 'snowfield',
    rows: [
      "yyyyyyyyyyyyyyyyyyyyyyyy",
      "y<....%%.......%%......y",
      "y.....%%..iiii.%%...Q..y",
      "y..yy.....iiii.........y",
      "y..yy..yy.iiii..yy..%%.y",
      "y......yy.......yy..%%.y",
      "y%.....................y",
      "y%%...%%..,,,,...%%....y",
      "y.....%%..,,,,...%%....y",
      "y..........,,..........y",
      "y..yy......,,......yy..y",
      "y..yy......,,......yy..y",
      "y%.........,,.........%y",
      "y%%........,,.......V%%y",
      "y%%%.......,,........%%y",
      "yyyyyyyyyyyXXyyyyyyyyyyy",
    ],
    warps: { '<': { map: 'pass1', at: '>' } },
    chests: { Q: { id: 'c3_p2a', item: 'hiether', n: 3 }, V: { id: 'c3_p2b', item: 'rimeaxe' } },
    steps: { '11,12': () => inquisitorEvent(), '12,12': () => inquisitorEvent() },
  },
  undercity1: {
    name: 'Solanthia Undercity - The Old Aqueduct', theme: 'undercity', music: 'dungeon', under: '.', exitArt: 'floor', worldId: 'world', back: [27, 12], start: [4, 16, 'right'], enc: 'undercity', encRate: 0.045, bg: 'undercity',
    rows: [
      "##########################",
      "#....#..........#.......>#",
      "#.ww.#.ww..ww...#..www...#",
      "#.ww...ww..ww.......www..#",
      "#.ww.#......1.......www..#",
      "#....#####.######.######.#",
      "#........#.#....#........#",
      "#.www....#.#.ww.#..ww....#",
      "#.www......2.ww.....ww...#",
      "#........###....###......#",
      "#ww......#..........#..Q.#",
      "#ww......#..wwwwww..#....#",
      "#........#..wwwwww..#.ww.#",
      "#..L.....3..........#.ww.#",
      "#........##########.#....#",
      "#.ww.........V...........#",
      "#Xww.....................#",
      "##########################",
    ],
    warps: { '>': { map: 'undercity2', at: '<' } },
    chests: { Q: { id: 'c3_u1a', item: 'ashenveil' }, V: { id: 'c3_u1b', item: 'megatonic', n: 2 } },
    npcs: {
      1: { look: 'dawnguard', name: 'Dawnguard Sentry', patrol: ['right', 'right', 'right', 'right', 'right', 'left', 'left', 'left', 'left', 'left'], sight: 4, pace: 28, onSpot: n => sentrySpotted(n), talk: [] },
      2: { look: 'dawnguard', name: 'Dawnguard Sentry', patrol: ['up', 'up', 'down', 'down'], sight: 3, pace: 40, onSpot: n => sentrySpotted(n), talk: [] },
      3: { look: 'dawnguard', name: 'Dawnguard Sentry', patrol: ['right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'left', 'left', 'left', 'left', 'left', 'left', 'left', 'left', 'left'], sight: 4, pace: 22, onSpot: n => sentrySpotted(n), talk: [] },
    },
    signs: { '3,12': () => say(null, "A wanted poster, soggy but legible: RAINE CUDLAR, TRAITOR. REWARD: 5,000 GOLD. The drawing makes her look like a very angry potato.") },
  },
  undercity2: {
    name: 'Solanthia Undercity - The Cistern of Light', theme: 'undercity', music: 'dungeon', under: '.', exitArt: 'floor', start: [1, 13, 'right'], enc: 'undercity', encRate: 0.04, bg: 'undercity',
    rows: [
      "########################",
      "#..........>...........#",
      "#.oo..............oo...#",
      "#......1...............#",
      "#.oo..............oo...#",
      "#..........2...........#",
      "#ww...ww.......ww...ww.#",
      "#ww...ww.......ww...ww.#",
      "#......................#",
      "#..Q.....3.........V...#",
      "#......................#",
      "###.####....####.#######",
      "#......................#",
      "#<...........L.........#",
      "########################",
    ],
    warps: { '<': { map: 'undercity1', at: '>' }, '>': { map: 'cells', at: '<' } },
    chests: { Q: { id: 'c3_u2a', item: 'sewergrate' }, V: { id: 'c3_u2b', item: 'emberplume', n: 2 } },
    npcs: {
      1: { look: 'dawnguard', name: 'Dawnguard Sentry', patrol: ['right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'left', 'left', 'left', 'left', 'left', 'left', 'left', 'left'], sight: 4, pace: 24, onSpot: n => sentrySpotted(n), talk: [] },
      2: { look: 'dawnguard', name: 'Dawnguard Sentry', patrol: ['left', 'left', 'left', 'left', 'left', 'left', 'right', 'right', 'right', 'right', 'right', 'right'], sight: 4, pace: 30, onSpot: n => sentrySpotted(n), talk: [] },
      3: { look: 'dawnguard', name: 'Dawnguard Sentry', patrol: ['right', 'right', 'right', 'right', 'right', 'right', 'right', 'left', 'left', 'left', 'left', 'left', 'left', 'left'], sight: 3, pace: 26, onSpot: n => sentrySpotted(n), talk: [] },
    },
  },
  cells: {
    name: 'The Temple Cells', theme: 'undercity', music: 'sorrow', under: '.', exitArt: 'floor', start: [9, 8, 'up'], bg: 'undercity',
    rows: [
      "####################",
      "#vvvvv#vvvvv#vvvvv##",
      "#v...v#v.1.v#v...v##",
      "#v...v#v...v#v...v##",
      "#vv+vv#vvvvv#vv+vv##",
      "#..................#",
      "#..................#",
      "#*................*#",
      "#........<.........#",
      "####################",
    ],
    warps: { '<': { map: 'undercity2', at: '>' } },
    npcs: { 1: { look: 'odeaon', name: 'High Knight Odeaon', behind: true, show: () => !flag('ch3trial') } },
    signs: { '9,4': () => cellsReunion(), '3,4': () => say(null, "An empty cell. Someone has scratched a tally of days into the wall, then a very small dragon."), '15,4': () => say(null, "An empty cell. It smells of old incense and older fear.") },
    steps: { '9,6': () => cellsReunion(), '8,6': () => cellsReunion(), '10,6': () => cellsReunion() },
  },
  tribunal: {
    name: 'The Grand Tribunal', theme: 'temple2', music: 'sorrow', under: '_', exitArt: 'floor', start: [10, 13, 'up'], bg: 'temple',
    rows: [
      "######################",
      "#e...*...GaaG...*...e#",
      "#.........1..........#",
      "#...o.....__.....o...#",
      "#.........2..........#",
      "#...o.....__.....o...#",
      "#.$$$$$$..__..$$$$$$.#",
      "#.3.4.5...__...6.7.8.#",
      "#.$$$$$$..__..$$$$$$.#",
      "#.9.......__.........#",
      "#.$$$$$$..__..$$$$$$.#",
      "#.........__.........#",
      "#...o.....__.....o...#",
      "#.........__.........#",
      "######################",
    ],
    underAt: { '1': '.', '2': '_', '3': '.', '4': '.', '5': '.', '6': '.', '7': '.', '8': '.', '9': '.' },
    npcs: {
      1: { look: 'vesper', name: 'High Luminar Vesper', show: () => !flag('ch3trial') },
      2: { look: 'odeaon', name: 'High Knight Odeaon', show: () => !flag('ch3trial') },
      3: { look: 'priest', name: 'Priest', behind: true }, 4: { look: 'woman', name: 'Townswoman', behind: true }, 5: { look: 'man', name: 'Townsman', behind: true },
      6: { look: 'oldman', name: 'Elder', behind: true }, 7: { look: 'dawnguard', name: 'Dawnguard', behind: true }, 8: { look: 'scholar', name: 'Scholar', behind: true }, 9: { look: 'child', name: 'Child', behind: true },
    },
  },
});
MAPS.cells.onEnter = async () => { if (!flag('ch3cells')) { await wait(20); await cellsReunion(); } };
MAPS.tribunal.onEnter = async () => { if (!flag('ch3trial')) { await wait(30); await trialEvent(); } };
