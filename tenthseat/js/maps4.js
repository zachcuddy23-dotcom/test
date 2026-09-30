'use strict';
// ---------------------------------------------------------------------------
// Chapter Four maps: Moonhollow (Luna's people, hidden in the Silverleaf) and the drowned sanctuary of Elaris.
// Currents: '[' pushes you left, ']' right, '{' up, '}' down, until you reach still water or hit something.
// Every current floor is checked by tools/check/validate.js: always solvable, no endless loops.
// ---------------------------------------------------------------------------
Object.assign(THEMES, {
  drowned: { wall: '#2a4a5a', wallDark: '#0e1e28', floor: '#3a6a74', floor2: '#36646e', grass: '#2a5a4a', water: '#1a3a6a', path: '#4a7a84', carpet: '#6a3a6a', wood: '#3a4a4a' },
  moonhollow: { wall: '#6a7a78', wallDark: '#2a3834', floor: '#5a7a5a', floor2: '#527250', grass: '#3e6a4e', mud: '#4a4a36', water: '#3a5a9a', path: '#8a9a88', roof: '#4a5a7a', bwall: '#8a8a78', timber: '#3a3a30', carpet: '#5a6a9a' },
});
const curArt = d => function (P, th, rng, f) {
  P.r(0, 0, 15, 15, shade(th.floor, 1.12)); P.r(0, 15, 15, 15, shade(th.floor, 0.8));
  // two chevrons that drift in the current's direction
  const k = (f % 4) * 2;
  for (const base of [1, 9]) {
    const o = (base + k) % 16;
    for (let t = 0; t < 4; t++) {
      const a = o + (d === 'l' || d === 'u' ? t : -t), b1 = 7 - t, b2 = 8 + t;
      const px = v => Math.max(0, Math.min(15, v));
      if (d === 'r') { P.p(px(o - t), b1, '#e8fbff'); P.p(px(o - t), b2, '#e8fbff'); }
      if (d === 'l') { P.p(px(15 - o + t), b1, '#e8fbff'); P.p(px(15 - o + t), b2, '#e8fbff'); }
      if (d === 'd') { P.p(b1, px(o - t), '#e8fbff'); P.p(b2, px(o - t), '#e8fbff'); }
      if (d === 'u') { P.p(b1, px(15 - o + t), '#e8fbff'); P.p(b2, px(15 - o + t), '#e8fbff'); }
    }
  }
};
Object.assign(TILE_ART, {
  currentL: curArt('l'), currentR: curArt('r'), currentU: curArt('u'), currentD: curArt('d'),
  coral(P, th, rng) { TILE_ART.floor(P, th, rng, 0, 0); for (const [x, y, c] of [[4, 6, '#e06a8a'], [10, 4, '#e8a04a'], [8, 10, '#c04a7a'], [12, 11, '#e06a8a']]) { P.r(x, y, x + 1, y + 5, c); P.p(x - 1, y + 1, c); P.p(x + 2, y + 2, c); } },
  mirror(P, th, rng, f) { TILE_ART.floor(P, th, rng, 0, 0); P.r(2, 0, 13, 14, '#8a7a4a'); P.r(3, 1, 12, 13, f % 2 ? '#a8c8e8' : '#b8d8f4'); P.r(4, 2, 5, 9, '#e8f4ff'); P.r(2, 15, 13, 15, '#4a3a2a'); },
});
Object.assign(IN_TILES, {
  '[': { art: 'currentL', push: 'left', anim: 4 }, ']': { art: 'currentR', push: 'right', anim: 4 },
  '{': { art: 'currentU', push: 'up', anim: 4 }, '}': { art: 'currentD', push: 'down', anim: 4 },
  '|': { art: 'coral', solid: true }, '!': { art: 'mirror', solid: true, anim: 2 },
});
Object.assign(MUSIC, {
  moonhollow: { bpm: 76, loop: true, voices: [
    { type: 'triangle', vol: 0.2, seq: mel('A4:4 C5:4 E5:6 D5:2  C5:4 B4:4 A4:8  G4:4 A4:4 C5:6 B4:2  A4:16  F4:4 A4:4 C5:6 E5:2  D5:4 C5:4 B4:8  C5:4 B4:4 G4:4 E4:4  A4:16') },
    { type: 'sine', vol: 0.06, seq: arp('Am Am F G Am Dm Em Am').map((n, i) => (i % 2 ? '.' : n)) },
  ] },
  drowned: { bpm: 66, loop: true, voices: [
    { type: 'sine', vol: 0.18, seq: mel('D5:8 F5:4 E5:4  C5:8 A4:8  A#4:8 D5:4 C5:4  A4:16  D5:8 A5:4 G5:4  F5:8 E5:8  D5:4 C5:4 A#4:4 A4:4  D5:16') },
    { type: 'triangle', vol: 0.05, seq: pad('Dm Dm Bb Am Dm F C Dm') },
  ] },
});

// Moonhollow on the Aurelion world map: deep in the Silverleaf, where the Temple never looked
WORLD.rows[16] = WORLD.rows[16].slice(0, 17) + 'L' + WORLD.rows[16].slice(18);
WORLD.places['17,16'] = { map: 'moonhollow', at: [13, 16, 'up'], check: async () => { if (!flag('ch4start')) { await say(null, "Deep birch forest. Nothing here but moonlight and wolf tracks."); return false; } return true; } };
// The Embrace: in Chapter Four the way down to the drowned sanctuary
{
  const emb = Object.entries(WORLD.places).find(([, p]) => p.map === 'embrace1');
  if (emb) {
    const p = emb[1], old = p.check;
    p.check = async () => {
      if (flag('ch4start') && !flag('ch4done')) { await sanctuaryDive(); return false; }
      return old ? old() : true;
    };
  }
}

Object.assign(MAPS, {
  moonhollow: {
    name: 'Moonhollow', theme: 'moonhollow', music: 'moonhollow', under: 'g', exitArt: 'path', worldId: 'world', back: [17, 17], start: [13, 16, 'up'],
    rows: [
      "BBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBxxBBBBBBBBBBBBB",
      "BBBBBBggggggL,,gggggggBBBBBB",
      "BgRRRRRgggggg1,ggggggRRRRRgB",
      "BgRRRRRgggggg,,ggggggRRRRRgB",
      "BgbbNbbgg2ggg,,ggg3ggbbWbbgB",
      "BgggggggggggwwwwgggggggggggB",
      "BgggggggggggwwwwgggggggggggB",
      "B,,,,,,,,,,,wwww,,,,,,,,,,,B",
      "BgggggggggggwwwwgggggggggggB",
      "BgRRRRRgggggg,,ggggggRRRRRgB",
      "BgRRRRRgggggg,,g8ggggRRRRRgB",
      "BgbbIbbg4gggg,,ggggggbbAbbgB",
      "Bgggggggggggg,,gggg5gggggggB",
      "Bgggggggggggg,,ggggggggggggB",
      "Bggggggggg6gg,,gg7gggggggggB",
      "Bgggggggggggg,,ggggggggggggB",
      "BBBBBBBBBBBBBXXBBBBBBBBBBBBB",
    ],
    shops: 'moonhollow',
    npcs: {
      1: { look: 'elder', name: 'Grandmother Hesk', talk: [async () => heskTalk()] },
      2: { look: 'lunawolf', name: 'Moonfang', move: 'wander', talk: [() => flag('ch4purge') ? "They came with silver and fire. And a knight in a wolf's skin stopped them. Our knight." : "Dame Luna walks the Temple's roads with her helmet on, so ours don't have to have helmets at all. Did you know that?"] },
      3: { look: 'lunawolf', name: 'Moonfang', act: 'sweep', talk: [() => "The Silverleaf mist hides us. The Dawnguard patrols always turn back at the birch line. Somebody inside keeps sending them the long way round."] },
      4: { look: 'child', name: 'Pip', move: 'wander', talk: [() => flag('ch4purge') ? "Luna was SO BIG. And so shiny. And then she cried. Big wolves can cry, it turns out." : "Luna's my cousin! She's a KNIGHT! She's going to take me to Solanthia one day to see the big shiny temple!"] },
      5: { look: 'lunawolf', name: 'Moonfang Smith', talk: [() => "Moonsilver doesn't burn us. Only the Temple's kind does. Funny, that."] },
      6: { look: 'oldman', name: 'Human Hermit', talk: [() => "I'm human. I came here to hide from my debts. They took me in anyway. Best neighbors I ever had."] },
      7: { look: 'lunawolf', name: 'Moonfang', talk: [() => "Every full moon, a letter comes from Solanthia with no name on it. Always the same handwriting. Always 'Soon.'"] },
      8: { look: 'lunawolf', name: 'Moonfang Scout', talk: [() => flag('ch4purge') ? "The hunters are gone. For now." : "Smoke on the east road this morning. Could be nothing. Could be torches."] },
    },
    signs: { '13,1': () => lunaDen(), '14,1': () => lunaDen() },
  },
  drowned1: {
    name: 'The Drowned Sanctuary - Sunken Cloister', theme: 'drowned', music: 'drowned', under: '.', exitArt: 'floor', worldId: 'world', back: [40, 38], start: [2, 16, 'up'], enc: 'drowned', encRate: 0.045, bg: 'drowned',
    rows: [
      "||||||||||||||||||||||||",
      "||||||||||||>|||||||||||",
      "|..|..]..........[..].]|",
      "|..[[{......|..{.[{||..|",
      "|...[.[.........}...}[||",
      "|.|...{..|......[]}].[.|",
      "|..||{..{[}|{}.].....[[|",
      "|.]|]..|.}|}]...{[}.[..|",
      "|...|.}.|||[.....|}}]..|",
      "|}{....|..[.|[{|].|.[..|",
      "|]]..]}..[..{[.]......[|",
      "|.{}.]..]|......[.|[.|.|",
      "|.]|.{...{.{{.[|]}].{{.|",
      "|.[}......}{..}.....}|.|",
      "|..|}]]..{.[.......}.[.|",
      "|....................Q.|",
      "|....L...............V.|",
      "|X||||||||||||||||||||||",
    ],
    warps: { '>': { map: 'drowned2', at: '<' } },
    chests: { Q: { id: 'c4_d1a', item: 'moonwater', n: 3 }, V: { id: 'c4_d1b', item: 'tidecrown' } },
    steps: { '3,16': () => sanctuaryMoment(1), '2,15': () => sanctuaryMoment(1) },
  },
  drowned2: {
    name: 'The Drowned Sanctuary - Hall of Reflections', theme: 'drowned', music: 'drowned', under: '.', exitArt: 'floor', start: [10, 12, 'up'], enc: 'mirrors', encRate: 0.03, bg: 'drowned',
    rows: [
      "######################",
      "###########>##########",
      "#...!!....!.....!!...#",
      "#....................#",
      "#....................#",
      "#....................#",
      "#wwwwwwww....wwwwwwww#",
      "#....................#",
      "#....................#",
      "#oooooo........oooooo#",
      "#....................#",
      "#.Q................V.#",
      "#.........<..........#",
      "######################",
    ],
    warps: { '<': { map: 'drowned1', at: '>' }, '>': { map: 'drowned3', at: '<' } },
    chests: { Q: { id: 'c4_d2a', item: 'silverdew', n: 3 }, V: { id: 'c4_d2b', item: 'moonrobe' } },
    signs: { '4,2': () => mirrorEvent('left'), '5,2': () => mirrorEvent('left'), '10,2': () => mirrorEvent('middle'), '16,2': () => mirrorEvent('right'), '17,2': () => mirrorEvent('right') },
    steps: { '11,2': async () => { if (!flag('ch4mirrors')) { await say(null, "The way on is closed by a curtain of still water. The three mirrors are waiting."); await F().walk('down', 1); } } },
  },
  drowned3: {
    name: 'The Drowned Sanctuary - Heart of the Embrace', theme: 'drowned', music: () => flag('ch4bloom') ? 'sorrow' : 'drowned', under: '.', exitArt: 'floor', start: [9, 12, 'up'], bg: 'drowned',
    rows: [
      "####################",
      "#kkkkkkk.aa.kkkkkkk#",
      "#kkkkkkk....kkkkkkk#",
      "#........1.........#",
      "#..o....____....o..#",
      "#.......____.......#",
      "#.......____.......#",
      "#.......____.......#",
      "#.......____.......#",
      "#..o....____....o..#",
      "#.......____.......#",
      "#.......____.......#",
      "#.L....._<__.......#",
      "####################",
    ],
    warps: { '<': { map: 'drowned2', at: '>' } },
    npcs: { 1: { enemy: 'drownedbloom', scale: 0.32, name: 'Ysolde', show: () => !flag('ch4bloom'), talk: [async () => bloomEvent()] } },
    signs: { '9,1': () => elarisHeart(), '10,1': () => elarisHeart() },
    steps: { '9,5': () => bloomEvent(), '10,5': () => bloomEvent() },
  },
});
MAPS.moonhollow.onEnter = async () => { if (!flag('ch4moon')) { await wait(20); await moonhollowArrival(); } };
