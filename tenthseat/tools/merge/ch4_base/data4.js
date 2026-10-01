'use strict';
// ---------------------------------------------------------------------------
// Chapter Four data: "The Drowned Sanctuary"
// The Cleansing (the Temple's hunt for monsters after Sonia's unmasking), Moonhollow (Luna's people),
// the drowned sanctuary of Elaris, and the two Anvil routes (Ashkar's ally / Ashkar's rival).
// ---------------------------------------------------------------------------

// ---- Ashkar fights beside you (ally route only): a guest hero for one battle ----
Object.assign(HEROES, {
  ashkar: {
    name: 'Ashkar', full: 'Ashkar, the Tenth Flame', img: 'ashkar', face: 'face_ashkar', look: 'ashkarman', job: 'phoenix', innate: 'tenthflame',
    base: { hp: 120, mp: 60, str: 14, agi: 16, mag: 20, vit: 12, spr: 14 },
    grow: { hp: 16, mp: 3, str: 1.0, agi: 1.0, mag: 1.4, vit: 0.9, spr: 1.0 },
    equip: { weapon: 'emberrod', head: null, body: null, acc: 'phoenixplume' },
    bio: 'The god who stole the Tenth Seat. Smug, dramatic, and, it turns out, loyal to people who are loyal to him.',
  },
});
Object.assign(INNATE, {
  tenthflame: { name: 'Tenth Flame', learn: [[1, 'phoenixrain'], [1, 'godfire'], [1, 'risenflame']] },
});
Object.assign(SKILLS, {
  phoenixrain: { name: 'Phoenix Rain', mp: 16, target: 'enemies', kind: 'dmg', elem: 'fire', pow: 88, fx: 'fire', desc: 'A god\'s feathers, falling as fire.' },
  godfire: { name: 'Godfire', mp: 24, target: 'enemy', kind: 'dmg', elem: 'fire', pow: 150, fx: 'fire', desc: 'The Tenth Flame at full strength, aimed at one very unlucky thing.' },
  // Luna, once she stops hiding
  silvermane: { name: 'Silvermane', mp: 20, target: 'enemies', kind: 'phys', mult: 2.1, elem: 'holy', fx: 'roar', desc: 'No helmet. No lies. Knight and wolf at once, at full strength.' },
});

// ---- Gear (tier 5: Moonhollow) ----
Object.assign(ITEMS, {
  moonwater: { name: 'Moonwater', price: 700, kind: 'heal', pow: 600, target: 'ally', battle: true, field: true, desc: 'Water from the Moonhollow spring. Restores 600 HP.' },
  silverdew: { name: 'Silver Dew', price: 1200, kind: 'mp', pow: 150, target: 'ally', battle: true, field: true, desc: 'Moonlight caught in a leaf. Restores 150 MP.' },
});
Object.assign(EQUIP, {
  moonfangblade: { name: 'Moonfang Blade', slot: 'weapon', type: 'sword', atk: 74, hit: 96, price: 5200 },
  howlspear: { name: 'Howling Spear', slot: 'weapon', type: 'spear', atk: 72, hit: 94, str: 3, price: 5200 },
  silverclaws: { name: 'Silver Claws', slot: 'weapon', type: 'claw', atk: 74, hit: 95, elem: 'holy', price: 5400 },
  eclipseaxe: { name: 'Eclipse Axe', slot: 'weapon', type: 'axe', atk: 80, hit: 86, price: 5600 },
  nightrod: { name: 'Night Rod', slot: 'weapon', type: 'rod', atk: 22, hit: 88, mag: 30, price: 5000 },
  moonstaff: { name: 'Moon Staff', slot: 'weapon', type: 'staff', atk: 24, hit: 88, mag: 22, spr: 12, price: 5000 },
  fangdagger: { name: 'Fang Dagger', slot: 'weapon', type: 'dagger', atk: 64, hit: 99, agi: 6, price: 4800 },
  wolfhelm: { name: 'Wolf Helm', slot: 'head', type: 'helm', def: 21, mdef: 8, price: 3400 },
  moonhood: { name: 'Moon Hood', slot: 'head', type: 'hat', def: 12, mdef: 20, price: 3200 },
  moonmail: { name: 'Moonsilver Mail', slot: 'body', type: 'heavy', def: 50, mdef: 12, price: 7200 },
  silverhide: { name: 'Silverhide', slot: 'body', type: 'light', def: 40, mdef: 22, price: 6400 },
  moonrobe: { name: 'Moonweave Robe', slot: 'body', type: 'robe', def: 24, mdef: 40, price: 6200 },
  packcharm: { name: 'Pack Charm', slot: 'acc', type: 'acc', def: 6, mdef: 6, immune: ['fear', 'sleep'], price: 3000, desc: 'A braid of wolf fur and silver thread. You are never alone. Prevents Fear and Sleep.' },
  // treasures
  mothersfang: { name: 'Mother\'s Fang', slot: 'acc', type: 'acc', str: 8, agi: 4, def: 6, price: 0, desc: 'A silver fang on a cord, left in the ashes of an old den. It belonged to Luna\'s mother.' },
  tidecrown: { name: 'Tide Crown', slot: 'head', type: 'helm', def: 22, mdef: 22, spr: 5, price: 0, desc: 'Coral and pearl, from the drowned sanctuary. It hums like the sea.' },
  bloomheart: { name: 'Bloomheart', slot: 'acc', type: 'acc', mag: 8, spr: 8, mdef: 10, price: 0, desc: 'The last flower from Elaris\'s drowned garden. It will not wilt.' },
});
Object.assign(KEY_ITEMS, {
  phoenixember: { name: 'Phoenix Ember', desc: 'A coal from Ashkar\'s own heart. Held tight, it keeps a bubble of warm air around you, even at the bottom of the sea.' },
  anvilbell: { name: 'The Anvil Bell', desc: 'Brakka\'s diving bell, heated by Grimnar\'s Anvil. It is not safe. It is extremely warm.' },
  elarisseed: { name: 'Elaris\'s Last Seed', desc: 'The last seed of a dying goddess, pressed into Raine\'s hand. It is warm, and it has a heartbeat.' },
  accord: { name: 'The Two Moons Accord', desc: 'Ten years of Luna\'s letters asking the Temple to let peaceful monsters live. Nobody ever answered. Now somebody will.' },
});

// ---- Enemies ----
Object.assign(ENEMIES, {
  // the Cleansing
  cleanser: { name: 'Cleansing Knight', art: 'pirate', tint: { h: 45, s: 0.3, l: 1.7 }, hp: 1250, atk: 120, def: 34, mdef: 24, agi: 22, exp: 330, jp: 12, gold: 260, weak: ['dark'], resist: ['holy'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'strike', name: 'Purge', mult: 1.5, fx: 'holy' }] },
  beasthound: { name: 'Beast Hound', art: 'wolf', tint: { h: -10, s: 1.2, l: 0.9 }, hp: 950, atk: 116, def: 26, mdef: 18, agi: 34, exp: 300, jp: 11, gold: 200, weak: ['fire'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'status', name: 'Hamstring', status: 'stop', chance: 35, frames: 180, fx: 'slash' }] },
  witchfinder: { name: 'Witchfinder', art: 'pirate', tint: { h: 200, s: 0.3, l: 1.2 }, hp: 900, atk: 104, def: 24, mdef: 34, agi: 26, exp: 320, jp: 12, gold: 280, weak: ['dark'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'status', name: 'Silver Dust', target: 'all', status: 'silence', chance: 40, fx: 'light' }, { w: 1, type: 'spell', name: 'Sanctified Bolt', target: 'one', pow: 70, elem: 'holy', fx: 'holy' }] },
  cleanser_hallorn: {
    name: 'Hallorn, the Cleanser', art: 'inquisitor', ph: { art: 'pirate', tint: { h: 45, s: 0.6, l: 1.4 }, scale: 2.3 }, boss: true,
    hp: 7200, atk: 104, def: 32, mdef: 28, agi: 26, actions: 2, exp: 7000, jp: 24, gold: 6000, weak: ['dark'], resist: ['holy'], immune: ['sleep', 'fear', 'doom', 'poison', 'stop', 'silence'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'status', name: 'Silver Chains', status: 'stop', chance: 55, frames: 300, fx: 'slash' }, { w: 2, type: 'spell', name: 'Cleansing Fire', target: 'all', pow: 50, elem: 'holy', fx: 'holy' }, { w: 1, type: 'strike', name: 'Beastbreaker', mult: 1.8, fx: 'boom' }],
    lines: { start: '"The Luminar was a monster. So now we hunt ALL of them. Starting with the ones hiding behind knights."', half: '"The Light doesn\'t need a Luminar. It only needs someone willing to hold the torch."' },
  },
  lunaberserk: {
    name: 'Luna, Moonfang Unbound', art: 'lunaberserk', ph: { look: 'lunawolf', scale: 5 }, boss: true,
    hp: 7600, atk: 100, def: 30, mdef: 26, agi: 32, actions: 2, exp: 0, jp: 0, gold: 0, weak: [], immune: ['sleep', 'fear', 'doom', 'poison', 'stop', 'silence', 'blind'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'strike', name: 'Silver Frenzy', mult: 1.6, fx: 'slash' }, { w: 1, type: 'status', name: 'Blood Moon Howl', target: 'all', status: 'fear', chance: 50, fx: 'roar' }, { w: 1, type: 'spell', name: 'Moonfall', target: 'all', pow: 46, elem: 'holy', fx: 'light' }],
    lines: { start: 'Luna doesn\'t know who you are. Luna doesn\'t know who SHE is.', half: 'Under the fur and the fury, something that sounds like Luna is crying.' },
  },
  // the drowned sanctuary
  drownedsailor: { name: 'Drowned Sailor', art: 'zombie', tint: { h: 150, s: 0.6, l: 0.8 }, hp: 1000, atk: 112, def: 28, mdef: 22, agi: 16, exp: 300, jp: 11, gold: 220, undead: true, weak: ['fire', 'holy', 'bolt'], resist: ['water'] },
  lanternjelly: { name: 'Lantern Jelly', art: 'wisp', tint: { h: 140, s: 1.0, l: 1.3 }, hp: 760, atk: 96, def: 20, mdef: 36, agi: 24, exp: 290, jp: 11, gold: 200, weak: ['bolt'], resist: ['water'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'status', name: 'Lullaby Glow', target: 'all', status: 'sleep', chance: 40, fx: 'light' }, { w: 1, type: 'spell', name: 'Sting Current', target: 'all', pow: 50, elem: 'bolt', fx: 'bolt' }] },
  deeplurker: { name: 'Deep Lurker', art: 'fishman', tint: { h: 120, s: 0.8, l: 0.7 }, hp: 1150, atk: 118, def: 30, mdef: 20, agi: 22, exp: 320, jp: 12, gold: 240, weak: ['bolt'], resist: ['water', 'ice'] },
  bloomspore: { name: 'Grief Bloom', art: 'slime', tint: { h: 300, s: 1.2, l: 1.1 }, hp: 820, atk: 100, def: 24, mdef: 30, agi: 14, exp: 280, jp: 11, gold: 180, weak: ['fire'], touch: { status: 'poison', chance: 35 }, acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'spell', name: 'Weeping Pollen', target: 'all', pow: 46, elem: 'earth', fx: 'poison' }] },
  mirrorshade: { name: 'Mirror Shade', art: 'shade', tint: { h: 0, s: 0.0, l: 1.6 }, hp: 1150, atk: 122, def: 26, mdef: 34, agi: 28, exp: 310, jp: 12, gold: 200, weak: ['holy', 'bolt'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'status', name: 'Your Worst Face', target: 'all', status: 'fear', chance: 40, fx: 'dark' }] },
  drownedbloom: {
    name: 'Ysolde, the Drowned Bloom', art: 'drownedbloom', ph: { art: 'wisp', tint: { h: 300, s: 1.3, l: 1.2 }, scale: 3.4 }, boss: true,
    hp: 10000, atk: 102, def: 32, mdef: 34, agi: 24, actions: 2, exp: 11000, jp: 30, gold: 9000, weak: ['fire'], resist: ['water', 'earth'], immune: ['sleep', 'fear', 'doom', 'poison', 'stop', 'silence', 'blind'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Drowning Grief', target: 'all', pow: 54, elem: 'water', fx: 'water' }, { w: 1, type: 'status', name: 'Petal Tide', target: 'all', status: 'sleep', chance: 40, fx: 'poison' }, { w: 1, type: 'strike', name: 'Thorn Current', mult: 1.7, fx: 'slash' }],
    phase2: [{ w: 2, type: 'attack' }, { w: 2, type: 'spell', name: 'The Last Garden', target: 'all', pow: 62, elem: 'earth', fx: 'poison' }, { w: 1, type: 'heal', name: 'Remembered Spring', pow: 1200, uses: 1, when: 'hurt' }, { w: 1, type: 'status', name: 'Mourning', target: 'all', status: 'fear', chance: 45, fx: 'dark' }],
    lines: { start: '"She is dying. She is DYING. And you came to put something heavy in her arms."', half: 'Ysolde\'s petals fall like tears. Some of them are real tears.' },
  },
  // Ashkar's rival route: the Tenth Flame wants its Anvil back
  cinderknight: { name: 'Cinder Knight', art: 'skeleton', tint: { h: -20, s: 1.6, l: 0.9 }, hp: 850, atk: 100, def: 32, mdef: 20, agi: 22, exp: 320, jp: 12, gold: 260, weak: ['water', 'ice'], resist: ['fire'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'spell', name: 'Ember Burst', target: 'all', pow: 48, elem: 'fire', fx: 'fire' }] },
  pyrewarden: {
    name: 'Pyrewarden Sael', art: 'pyrewarden', ph: { art: 'pirate', tint: { h: -20, s: 1.8, l: 1.0 }, scale: 2.3 }, boss: true,
    hp: 5400, atk: 90, def: 28, mdef: 26, agi: 24, actions: 2, exp: 7000, jp: 24, gold: 6000, weak: ['water', 'ice'], resist: ['fire'], immune: ['sleep', 'fear', 'doom', 'poison', 'stop'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Tenth Flame\'s Judgment', target: 'all', pow: 52, elem: 'fire', fx: 'fire' }, { w: 1, type: 'strike', name: 'Cinder Lance', mult: 1.8, fx: 'fire' }, { w: 1, type: 'heal', name: 'Rising Ash', pow: 800, uses: 1, when: 'hurt' }],
    lines: { start: '"You told a god NO. The Tenth Flame remembers. Give back the Anvil, or burn with it."', half: '"He said you would be stubborn. He said it like a compliment."' },
  },
});
Object.assign(FORMATIONS, {
  cleansing: [{ w: 3, e: [['cleanser', 1, 2], ['beasthound', 1, 1]] }, { w: 2, e: [['beasthound', 2, 3]] }, { w: 2, e: [['witchfinder', 1, 1], ['cleanser', 1, 1]] }],
  drowned: [{ w: 3, e: [['drownedsailor', 1, 2], ['lanternjelly', 1, 1]] }, { w: 3, e: [['deeplurker', 1, 2]] }, { w: 2, e: [['bloomspore', 2, 3]] }, { w: 2, e: [['lanternjelly', 2, 2], ['deeplurker', 1, 1]] }],
  mirrors: [{ w: 1, e: [['mirrorshade', 2, 2]] }, { w: 1, e: [['mirrorshade', 1, 1], ['bloomspore', 1, 2]] }],
});
Object.assign(SHOPS, {
  moonhollow: { weapon: ['moonfangblade', 'howlspear', 'silverclaws', 'eclipseaxe', 'nightrod', 'moonstaff', 'fangdagger'], armor: ['wolfhelm', 'moonhood', 'moonmail', 'silverhide', 'moonrobe', 'packcharm'], item: ['megatonic', 'moonwater', 'hiether', 'silverdew', 'ashsalve', 'echomint', 'emberplume', 'bedroll'], inn: 0, chapel: 0 },
});
