'use strict';
// ---------------------------------------------------------------------------
// World map + interior maps, NPCs and story events
// ---------------------------------------------------------------------------
const WORLD = {
  id: 'world', name: 'World', world: true, theme: 'world', music: 'field',
  rows: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~..~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~.s..~~~~~~~~~~~.s.~~~~.~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~.s.ff.s.s..~~~~~^^^~~~.s.~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~..ffffAffff~~~~^^^~~~^^^s.~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~sffffffffff.^^^^^^~~~^^^.s~~s.s~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~s.ffffffffff..^^^^^~~^^^.s~~....~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~....fffffffff...^^^s.rs...~~~s..s~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~.s......fffff.........r...s~~~.^^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~s..^^..........ffff...r....s..^^^~~~~s~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~..^^^^........ffffff..r......^^^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~..^^^^^.......ffffff..r......^^^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~s^^^^^^^......fffff...r.....^^^^^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~^^^^^^^.......f.......r....^^^^^^^^^~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~^^^^^^^...............r....^^^^^^^^.~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~.s~~~^^^...............r.....^^^^^^^s~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~..~~~^^......C.........r.........^^..~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~..~~^^^................r..............~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~.s.^^^................r.............s.~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~s.s.^^f......T........r............s.~~.~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~.ffffff.............B.............~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~ffffff.............r............P~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~ffffff.............r...fff......s~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~..................sr..ffffffff...s.~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~..s.s............s~r.fffffffff....s~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~.s............sr...ffffff.s..s.~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~.s..s.s....s..r.s~~~~s..s~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~s..s~s.rs.~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~sr.~~~~~~~~~~~~~~~~~~~.s~~~~s.s.~~.s.~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~r~~~~~~~~~~~~~~~~~~~s..s~s....s..s.s~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~sfff.s.......K...~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~.fffffff^^......s~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~sffffLfff^^^...^^.~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~s.s~~sfffffffff^^^...^^^~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~...s..ffffffff.^^^..^^^^~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~..s...ffffffff.^^^..^^^^s.~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~s.......f...^^^..^^^^..~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~............^^^...^^~s.~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~.......,,...^^^...^~~~s~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~s.,,,,,,,,...^....s~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~.,,,,,,,,,.........s.s~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~.,,,,,M,,,,............~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~s.,,,,,,,,,..s.........s~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~..,,,,,,,,.s~.s.s..s.s..~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~s.....,,,.s~~~.s.~~~~~s~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~s.s....s.~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~..s.~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  // world tile -> interior map entrance
  places: {
    '15,16': { map: 'castle' }, '15,19': { map: 'cindral' }, '11,4': { map: 'temple' }, '37,21': { map: 'brinemoor' },
    '47,32': { map: 'lumenwood' }, '44,41': { map: 'fen1' }, '56,30': { map: 'keep' },
  },
  zone(x, y, t) {
    if (t === '~') return 'sea';
    if (x < 24) return y < 10 ? 'north' : 'cindral';
    if (y < 29) return 'east';
    if (t === ',') return 'fen';
    if (x >= 53) return 'dusk';
    return 'isle';
  },
  bg(x, y, t) {
    if (t === '~') return 'sea';
    if (t === 'f') return 'forest';
    if (t === ',') return 'swamp';
    if (t === 's') return 'beach';
    if (x >= 53 && y >= 28) return 'dusk';
    return 'plains';
  },
};

const MAPS = {
  // =========================================================================
  cindral: {
    name: 'Cindral', theme: 'town', music: 'town', under: 'g', exitArt: 'path', back: [15, 19], start: [14, 19, 'up'],
    rows: [
      "tttttttttttttttttttttttttttttt",
      "tggggggggggggggggggggggggggggt",
      "tgRRRRRgRRRRRggggRRRRRgRRRRRgt",
      "tgRRRRRgRRRRRggggRRRRRgRRRRRgt",
      "tgbbWbbgbbAbbggggbbIbbgbbMbbgt",
      "tg,,,,,,,,,,,,,,,,,,,,,,,,,,gt",
      "tggggg1ggggggg,,gggggggg2ggggt",
      "tgggggggggggg,,,,ggggggggggggt",
      "tgggFFFgggggg,OO,ggggggFFFgggt",
      "tgggFFFgggggg,OO,ggggggFFFgggt",
      "tgggggggggggg,,,,ggggggggggggt",
      "tgRRRRRgggggg,,,,gggggRRRRRggt",
      "tgRRRRRgggggg,,,,gggggRRRRRggt",
      "tgbbNbbgggggg,,,,gggggbbHbbggt",
      "tg,,,,,,,,,,,,,,,,,,,,,,,,,,gt",
      "tggggg4ggggggg,,gggggggggg5ggt",
      "tgRRRgggggggg,,,,ggggggggRRRgt",
      "tgbbbgggggggg,,,,ggggggggbbbgt",
      "tgggggg6ggggg,,,,ggggg7ggggggt",
      "tgggggggggggg,,,,ggggggggggggt",
      "tttttttttttttXXXXttttttttttttt",
    ],
    shops: 'cindral',
    npcs: {
      1: { look: 'man', move: 'wander', talk: [
        () => !flag('vhalen') && "Welcome to Cindral! The castle is just north of town. The king has been in a black mood since the princess vanished.",
        () => "The princess is home! Sir Vhalen won't trouble us again, thanks to you three."] },
      2: { look: 'woman', move: 'wander', talk: [
        () => !flag('vhalen') && "Sir Vhalen was captain of the guard. They say he took Princess Liora to the Ashen Temple, northwest past the woods.",
        () => "The Cinder Bridge is rebuilt! The road east leads to the port of Brinemoor."] },
      4: { look: 'sage', talk: [() => "Each of you walks a different path: Rites, Shadow, Formula. Spells are bought at the magic shop. Casting one uses a charge of its tier, and you get your charges back when you rest at an inn."] },
      5: { look: 'guard', talk: [() => !flag('vhalen') && "The Cinder Bridge east of here collapsed in the spring. The king won't rebuild it while his daughter is missing.", () => "Brinemoor is overrun by pirates, I hear. Captain Rusk and his Blackgull crew."] },
      6: { look: 'child', move: 'wander', talk: [async () => { await say("Child", "Whoa! You've got WINGS! Are you a real dragon?"); await say(HERO('miasma'), "Half of one. The other half's still deciding."); return null; }] },
      7: { look: 'oldman', talk: [() => "Poisoned? Buy an Antidote at the item shop. If a friend has fallen, the clinic can bring them back... for a fee."] },
    },
  },
  // =========================================================================
  castle: {
    name: 'Castle Cindral', theme: 'castle', music: 'castle', under: '.', exitArt: 'carpet', back: [15, 16], start: [10, 11, 'up'],
    rows: [
      "#####################",
      "#kk.....*_1_*.....kk#",
      "#.......o_2_o.......#",
      "#.......o___o.......#",
      "#..3....o___o....4..#",
      "#.......o___o.......#",
      "#######..___..#######",
      "#Q.p.5...___.......p#",
      "#.......o___o......Y#",
      "#.......o___o.......#",
      "#..6....o___o....7..#",
      "#.......o___o.......#",
      "#########___#########",
      "#########XXX#########",
    ],
    underAt: { '1': 'T', '2': '_' },
    chests: { Q: { id: 'c_castle1', item: 'cap' }, Y: { id: 'c_castle2', gold: 150 } },
    npcs: {
      1: { look: 'king', name: 'King Aldric', talk: [async () => kingTalk()] },
      2: { look: 'princess', name: 'Princess Liora', show: () => flag('vhalen'), talk: [() => "Thank you for coming for me. Vhalen was not always cruel... something in that temple changed him. Something dark."] },
      3: { look: 'sage', name: 'Chancellor', talk: [() => !flag('vhalen') && "The Ashen Temple lies northwest, beyond the forest. Be ready: you can rest at the inn in town, and the shops sell supplies.", () => "Four crystals once lit this world. Now they are dim, and the seas are restless. Brinemoor, to the east, may hold answers."] },
      4: { look: 'nun', name: 'Scholar', talk: [() => "An old prophecy: 'When the dark wind blows, three shadows will come, each carrying a shard of night.' Strange... light heroes are usually said to carry light."] },
      5: { look: 'guard', talk: [() => "Halt! ...Oh, you're the ones the king summoned. Go right ahead."] },
      6: { look: 'guard', talk: [() => "I trained under Sir Vhalen. He was the finest sword in Cindral. I can't believe he'd turn traitor."] },
      7: { look: 'woman', talk: [() => "The royal treasury is in the corners of this hall. The king said to let you take what you need."] },
    },
  },
  // =========================================================================
  temple: {
    name: 'Ashen Temple', theme: 'temple', music: 'dungeon', under: '.', exitArt: 'floor', back: [11, 4], start: [13, 17, 'up'], enc: 'temple', encRate: 0.07, bg: 'temple',
    rows: [
      "############################",
      "#Q..^.....#.a1a.#......^..Y#",
      "#...o...o.#.....#.o...o....#",
      "#.........#.o.o.#..........#",
      "#..o...o..#.....#..o...o...#",
      "#.........##...##..........#",
      "#.^.......................^#",
      "#...o....o.....o....o......#",
      "#..........................#",
      "####.######......######.####",
      "#...#.....#......#.....#...#",
      "#.Z.#..o..#......#..o..#.V.#",
      "#...#.....#......#.....#...#",
      "#...###.###......###.###...#",
      "#..........................#",
      "#..o....o....o..o....o....o#",
      "#..........................#",
      "#^^.......^........^.....^^#",
      "############....############",
      "############XXXX############",
    ],
    chests: { Q: { id: 'c_temple1', item: 'moonpend' }, Y: { id: 'c_temple2', gold: 180 }, Z: { id: 'c_temple3', item: 'tonic' }, V: { id: 'c_temple4', item: 'greyscarf' } },
    npcs: { 1: { look: 'vhalen', name: 'Sir Vhalen', show: () => !flag('vhalen'), talk: [async () => vhalenEvent()] } },
  },
  // =========================================================================
  brinemoor: {
    name: 'Brinemoor', theme: 'town', music: 'town2', under: 'g', exitArt: 'path', back: [37, 21], start: [11, 14, 'up'],
    rows: [
      "tttttttttttttttttttttt~~~~~~~~",
      "tggggggggggggggggggggs~~~~~~~~",
      "tgRRRRRgRRRRRgRRRRRggs~~~~~~~~",
      "tgRRRRRgRRRRRgRRRRRggs~~~~~~~~",
      "tgbbWbbgbbAbbgbbIbbggs~~~~~~~~",
      "tg,,,,,,,,,,,,,,,,,,,,===~~~~~",
      "tggggg2gggg,,gggg4gggg===~~~~~",
      "tgRRRRRgggg,,gggRRRRRg===~~~~~",
      "tgRRRRRgggg,,gggRRRRRg===~~~~~",
      "tgbbNbbgggg,,gggbbHbbg=====1=~",
      "tg,,,,,,,,,,,,,3,,,,,,===~~~~~",
      "tgggggggggg,,ggggggggg===~~~~~",
      "tgRRRgggggg,,gggggRRRg===~~~~~",
      "tgbbbg5gggg,,ggg6gbbbg=8=~~~~~",
      "tgggggggggg,,ggggggggss~~~~~~~",
      "ttttttttttXXXXtttttttss~~~~~~~",
    ],
    underAt: { '1': '=', '3': ',', '8': '=' },
    shops: 'brinemoor',
    npcs: {
      1: { look: 'rusk', name: 'Captain Rusk', show: () => !flag('rusk'), talk: [async () => ruskEvent()] },
      2: { look: 'pirate', move: 'wander', show: () => !flag('rusk'), talk: [() => "Arr! This port belongs to Captain Rusk now. You want to buy something? Pay the Blackgull tax first, har har!"] },
      3: { look: 'pirate', move: 'wander', show: () => !flag('rusk'), talk: [() => "The Cap'n's down on the pier admiring his new ship. Stole it fair and square, he did!"] },
      4: { look: 'pirate', move: 'wander', show: () => !flag('rusk'), talk: [() => "Oi, dragon lady! Nice wings. Bet they'd fetch a good price..."] },
      5: { look: 'woman', talk: [() => !flag('rusk') && "Those pirates took over the harbor a month ago. Nobody can sail, and the fishing boats rot at the pier.", () => "The harbor is free again! The fishermen are singing your names."] },
      6: { look: 'sailor', talk: [() => !flag('rusk') && "Rusk's crew stole the finest ship in port, the Gull's Folly. It's tied at the end of the pier.", () => "The Gull's Folly is yours now, fair and square. Sail south-east and you'll find the Verdant Isle. The elves of Lumenwood keep to themselves, but they're in trouble, I hear."] },
      8: { look: 'sailor', show: () => flag('rusk'), talk: [() => "Your ship is anchored just east of town. Walk aboard and she'll carry you over any open water!"] },
    },
  },
  // =========================================================================
  lumenwood: {
    name: 'Lumenwood', theme: 'elf', music: 'elf', under: 'g', exitArt: 'path', back: [47, 32], start: [13, 15, 'up'],
    rows: [
      "tttttttttttttttttttttttttttt",
      "tggFgggtggggggggggggtgggFggt",
      "tgRRRRRgRRRRRgggRRRRRgRRRRRt",
      "tgRRRRRgRRRRRgggRRRRRgRRRRRt",
      "tgbbWbbgbbAbbgggbbMbbgbbIbbt",
      "tg,,,,,,,,,,,,,,,,,,,,,,,,gt",
      "tgggtgggggg1g,,ggg2ggggtgggt",
      "tggggRRRRRRRgg,,ggRRRRRggggt",
      "tggggRRRRRRRgg,,ggRRRRRggggt",
      "tggggbbb+bbbgg,,ggbbNbbggggt",
      "tgggg,,,,,,,,,,,,,,,,,,ggggt",
      "tgtggg3gggggg,,ggggggg4ggtgt",
      "tgggFFggRRRgg,,ggRRRggFFgggt",
      "tgggFFggbHbgg,,ggbbbggFFgggt",
      "tggggggggggg5,,ggggggggggggt",
      "ttttttttttttt,,ttttttttttttt",
      "tttttttttttttXXttttttttttttt",
    ],
    shops: 'lumenwood',
    doors: { '8,9': { map: 'aeris', x: 5, y: 5, dir: 'up' } },
    npcs: {
      1: { look: 'elfman', move: 'wander', talk: [() => !flag('aeris') && "Humans? ...And a dragon. Hmm. The prince would have welcomed you. But he hasn't woken in weeks.", () => "Prince Aeris is awake! The forest itself seems to breathe easier."] },
      2: { look: 'elf', move: 'wander', talk: [() => !flag('morvane') && "A curse of endless sleep lies on Prince Aeris. Only the Dawnseer's Eye can break it, and it was stolen from our shrine.", () => "You've brought back the Dawnseer's Eye? Hurry to the prince's house!"] },
      3: { look: 'elfman', talk: [() => "Duskhold Keep lies to the north-east, past the mountains. King Morrow rules there. He's pale and strange, but he's always been a friend to Lumenwood... or so he claims."] },
      4: { look: 'elf', talk: [() => "The Mirefen Hollow is a cave in the swamp to the south. Dangerous place. Poison everywhere. Bring antidotes!"] },
      5: { look: 'elfman', talk: [() => "The bravest of our scouts went into the Mirefen after a thief wearing a black crown. We never saw him again."] },
    },
  },
  aeris: {
    name: 'Prince\'s House', theme: 'house', music: 'elf', under: '.', exitArt: 'floor', back: null, start: [5, 5, 'up'],
    exitTo: { map: 'lumenwood', x: 8, y: 10, dir: 'down' },
    rows: [
      "###########",
      "#kk.1...pk#",
      "#...2.....#",
      "#.........#",
      "#$$.....$.#",
      "#.........#",
      "#####X#####",
    ],
    underAt: { '1': 'u' },
    npcs: {
      1: { look: 'prince', name: 'Prince Aeris', sleep: () => !flag('aeris'), talk: [async () => aerisEvent()] },
      2: { look: 'elf', name: 'Attendant', talk: [async () => { if (flag('aeris')) return "The prince is awake! I've never been so happy to be ordered around."; if (hasKey('eye')) return aerisEvent(); return "He just sleeps... Only the Dawnseer's Eye could lift this curse. Please, if you find it..."; }] },
    },
  },
  // =========================================================================
  fen1: {
    name: 'Mirefen Hollow B1', theme: 'fen', music: 'cave', under: '.', exitArt: 'floor', back: [44, 41], start: [6, 15, 'up'], enc: 'fendeep', encRate: 0.065, bg: 'cave',
    rows: [
      "########################",
      "#Q..m...#wwww#.......>.#",
      "#..mmm..#wwww#..mm.....#",
      "#...m......mm......#####",
      "#####..#.....mm....#...#",
      "#......#..ww......m#.Z.#",
      "#.mm...#..ww.......#...#",
      "#.mm....www....#####.###",
      "#......mmmm.....m......#",
      "###.####..######..mm...#",
      "#...#..m....ww.#......##",
      "#.V.#..mm...ww.#..m....#",
      "#...#.......ww....mm...#",
      "##.###..m.........######",
      "#.......mm....##.......#",
      "#..........mm..........#",
      "######XX################",
    ],
    warps: { '>': { map: 'fen2', at: '<' } },
    chests: { Q: { id: 'c_fen1a', item: 'tonic' }, Z: { id: 'c_fen1b', gold: 600 }, V: { id: 'c_fen1c', item: 'moonblade' } },
  },
  fen2: {
    name: 'Mirefen Hollow B2', theme: 'fen', music: 'cave', under: '.', exitArt: 'floor', enc: 'fendeep', encRate: 0.07, bg: 'cave',
    rows: [
      "########################",
      "#<.....#......#.......Q#",
      "#......#..mm..#..www...#",
      "#..mm.....mm.....www...#",
      "####.####.....####.#####",
      "#......#..www..#.......#",
      "#.m....#..www..#..mm...#",
      "#.mm......www.....mm...#",
      "#####.######.#######.###",
      "#.....#........#.......#",
      "#.Y...#..mmm...#..m..m.#",
      "#.....#...m....#.......#",
      "###.###...........####.#",
      "#.........mm.........#.#",
      "#..ww...........mm...#>#",
      "########################",
    ],
    warps: { '<': { map: 'fen1', at: '>' }, '>': { map: 'fen3', at: '<' } },
    chests: { Q: { id: 'c_fen2a', item: 'wyrmfang' }, Y: { id: 'c_fen2b', item: 'feather' } },
  },
  fen3: {
    name: 'Mirefen Hollow B3', theme: 'fen', music: 'cave', under: '.', exitArt: 'floor', enc: 'fendeep', encRate: 0.05, bg: 'cave',
    rows: [
      "####################",
      "#......#aaaa#......#",
      "#.mm...#.Q..#...mm.#",
      "#......##..##......#",
      "#..................#",
      "#..ww..........ww..#",
      "#..ww...mmmm...ww..#",
      "#.........Y........#",
      "#..mm..........mm..#",
      "#<.................#",
      "####################",
    ],
    warps: { '<': { map: 'fen2', at: '>' } },
    chests: { Q: { id: 'c_crown', key: 'crown', guard: true }, Y: { id: 'c_fen3b', item: 'smokesilk' } },
  },
  // =========================================================================
  keep: {
    name: 'Duskhold Keep', theme: 'keep', music: 'keep', under: '.', exitArt: 'carpet', back: [56, 30], start: [10, 11, 'up'],
    rows: [
      "#####################",
      "#Q..*....a1a....*..Y#",
      "#........___........#",
      "#...o....___....o...#",
      "#........___........#",
      "#...o....___....o...#",
      "#........___........#",
      "######...___...######",
      "#2.......___.......3#",
      "#...o....___....o...#",
      "#........___........#",
      "#########___#########",
      "#########XXX#########",
    ],
    underAt: { '1': 'T' },
    chests: { Q: { id: 'c_keep1', item: 'umbralrod' }, Y: { id: 'c_keep2', item: 'wyrmscale' } },
    npcs: {
      1: { look: 'morrow', name: 'King Morrow', show: () => !flag('morvane'), talk: [async () => morrowEvent()] },
      2: { look: 'shade', talk: [() => !flag('morvane') && "...The king... awaits... his crown...", () => "..."] , show: () => !flag('morvane') },
      3: { look: 'shade', talk: [() => "...None leave Duskhold... unless the king allows it..."], show: () => !flag('morvane') },
    },
  },
};

// ---------------------------------------------------------------------------
// Story events
// ---------------------------------------------------------------------------
async function kingTalk() {
  const K = 'King Aldric';
  if (!flag('metKing')) {
    await say(K, "So... three wanderers, just as the seers foretold. A dragon-blooded freelancer, a mage wrapped in smoke, and an alchemist with a moon at her throat.");
    await say(K, "I will not waste your time. My daughter, Princess Liora, was taken by Sir Vhalen, once the captain of my guard. He holds her in the Ashen Temple, northwest beyond the forest.");
    await say(K, "Bring her home, and I will rebuild the Cinder Bridge so you may travel east. You have my word as king.");
    await say(HERO('miasma'), "A rescue job. Fine. What's the pay?");
    await say(HERO('raine'), "Miasma. It's a kidnapped princess.");
    await say(HERO('miasma'), "...The pay can be the bridge, then.");
    await say(HERO('verai'), "We'll bring her back safely, Your Majesty. I promise.");
    setFlag('metKing'); return;
  }
  if (!flag('vhalen')) return say(K, "The Ashen Temple lies northwest, beyond the forest. Please... bring Liora home.");
  return say(K, "The Cinder Bridge stands again, to the east of town. Brinemoor lies beyond. May the light go with you.");
}
async function vhalenEvent() {
  const V = 'Sir Vhalen';
  await say(V, "Hmph. So Aldric sends mercenaries now? A dragon, a witch, and a thief.");
  await say(HERO('raine'), "Alchemist. And you're one to talk about thieves.");
  await say(V, "The princess stays with me. The darkness under this temple promised me power beyond any king's... and I, Vhalen, will cut you all down!");
  const r = await startBattle({ enemies: ['vhalen'], boss: true, bg: 'temple', music: 'boss', noRun: true });
  if (r !== 'win') return;
  await say(V, "Im...possible... The dark... it lied to me...");
  setFlag('vhalen');
  await fadeOut(40);
  await warpTo('castle', 10, 3, 'up', true);
  await fadeIn(40);
  const K = 'King Aldric';
  await say('Princess Liora', "Father!");
  await say(K, "Liora! Thank the light... Wanderers, you have my eternal gratitude.");
  await say(K, "As promised, my builders are raising the Cinder Bridge as we speak. The way east is open.");
  await say('Princess Liora', "Please, take this. It was my mother's harp. It sings at dawn... I think it wants to go with you.");
  giveKey('harp'); await notify('Received the Dawnsong Harp!');
  await say(HERO('verai'), "Thank you, Princess. We'll take good care of it.");
}
async function ruskEvent() {
  const R = 'Captain Rusk';
  await say(R, "Ahoy, landlubbers! This port is mine, and so is every coin in it. You want it back? Come and take it, if you dare!");
  await say(HERO('miasma'), "Gladly.");
  const r = await startBattle({ enemies: ['deckhand', 'rusk', 'deckhand'], boss: true, bg: 'town', music: 'boss', noRun: true });
  if (r !== 'win') return;
  await say(R, "Blast it! Alright, alright! I give up! Take the ship, take the port, just let me and me lads go!");
  await say(HERO('raine'), "Get out of here before I change my mind.");
  setFlag('rusk'); giveKey('deed');
  await fadeOut(20); Game.state.ship = { x: 38, y: 21 }; await fadeIn(20);
  await notify('You got the ship, the Gull\'s Folly!');
  await say(HERO('verai'), "A ship... we can cross the sea now. The sailors say the Verdant Isle lies south-east.");
}
async function crownGuard(ch) {
  await say(null, "A black crown rests on a stone plinth... Cold mist rises from the mire!");
  const r = await startBattle({ enemies: ['wight', 'wight', 'wight'], boss: true, bg: 'cave', music: 'boss', noRun: true });
  return r === 'win';
}
async function morrowEvent() {
  const M = 'King Morrow';
  if (!hasKey('crown')) {
    await say(M, "Travelers... welcome to Duskhold. Forgive the gloom. My crown, the Obsidian Crown, was stolen by a thief who fled into the Mirefen Hollow, south of Lumenwood.");
    await say(M, "Bring it back to me, and I will reward you with a treasure beyond price.");
    return;
  }
  await say(M, "Is that... YES. My crown! Give it here... give it to me!");
  await say(HERO('verai'), "Something is wrong... the shadows in this room are moving.");
  takeKey('crown');
  Game.flash = 12; Audio2.sfx('dark');
  await say(M, "Fools! There is no King Morrow. There never was! I am MORVANE, the Hollow King!");
  await say('Morvane', "With the Dawnseer's Eye I put the elf prince to sleep, and with this crown I will rule the Verdant Isle! Now... DIE!");
  const r = await startBattle({ enemies: ['morvane'], boss: true, bg: 'keep', music: 'boss', noRun: true });
  if (r !== 'win') return;
  await say('Morvane', "No... the Crystals... will darken anyway... you are... too late...");
  setFlag('morvane'); giveKey('eye');
  await notify("Morvane dropped the Dawnseer's Eye!");
  await say(HERO('verai'), "It's warm... like morning light. Let's bring it to Prince Aeris in Lumenwood.");
}
async function aerisEvent() {
  if (flag('aeris')) return say('Prince Aeris', "The Crystals are dimming. Go well, shadows of the dawn. The Warden's Key will open the way.");
  if (!hasKey('eye')) return say(null, "The prince is sleeping deeply. Nothing you do can wake him.");
  await say(null, "The Dawnseer's Eye flares with golden light...");
  Game.flash = 12; Audio2.sfx('heal');
  setFlag('aeris'); takeKey('eye');
  await say('Prince Aeris', "...Light? ...I dreamed of three shadows standing against the dark. So it was you.");
  await say('Prince Aeris', "Morvane is only a servant. Something beneath the world is drinking the light from the four Crystals. When they go dark, it will wake.");
  await say('Prince Aeris', "Take this: the Warden's Key. It opens the sealed doors of the old world. Your real journey begins now.");
  giveKey('wardkey'); await notify("Received the Warden's Key!");
  await say(HERO('miasma'), "Beneath the world, huh. I've been paid to go to worse places.");
  await say(HERO('raine'), "Nobody's paying you.");
  await say(HERO('verai'), "...We'll go anyway. Won't we?");
  await chapterEnd();
}
