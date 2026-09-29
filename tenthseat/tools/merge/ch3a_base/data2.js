'use strict';
// ---------------------------------------------------------------------------
// Chapter Two data: "The Tenth Flame" - the continent of Ashkar.
// Adds to the tables in data.js. Nothing in data.js is replaced.
// ---------------------------------------------------------------------------

// ---- New hero: Brakka Sootfinger, goblin gunsmith of Kharak Yr ----
Object.assign(HEROES, {
  brakka: {
    name: 'Brakka', full: 'Brakka Sootfinger', img: 'brakka', face: 'brakka_face', look: 'brakka', job: 'freelancer', innate: 'powder',
    base: { hp: 58, mp: 12, str: 11, agi: 15, mag: 10, vit: 9, spr: 8 },
    grow: { hp: 10, mp: 1.4, str: 0.9, agi: 1.0, mag: 0.8, vit: 0.7, spr: 0.6 },
    equip: { weapon: 'obsidianfang', head: 'embercowl', body: 'salamanderhide', acc: null },
    bio: 'A goblin gunsmith from Kharak Yr with singed eyebrows and no fear of anything that goes boom. Talks fast, builds faster, and has opinions about every weapon you own.',
  },
});
Object.assign(INNATE, {
  powder: { name: 'Powder', learn: [[1, 'blastshot'], [1, 'smokecharge'], [8, 'flashbang'], [14, 'bigboom']] },
});

// ---- New jobs ----
Object.assign(JOBS, {
  chainbearer: {
    name: 'Chainbearer', god: 'Zariel', cmd: 'Chain', color: '#ff7a5a',
    desc: 'Zariel\'s blood-oathed. Suffering is payment for power: hits back, and hits harder the more it hurts.',
    mult: { hp: 1.2, mp: 0.6, str: 1.25, agi: 0.95, mag: 0.7, vit: 1.15, spr: 0.9 },
    weapons: ['sword', 'axe', 'spear'], armor: ['heavy', 'helm'],
    learn: [[1, 'retaliate'], [2, 'chainlash'], [4, 'bloodoath'], [6, 'vengeance'], [8, 'boundinferno']],
  },
  phoenix: {
    name: 'Phoenix Warlock', god: 'Ashkar', cmd: 'Rebirth', color: '#ffb040',
    desc: 'Pact-bound to the Tenth Flame. Fire that burns foes and brings friends back from the ash.',
    mult: { hp: 0.95, mp: 1.3, str: 0.8, agi: 1.05, mag: 1.3, vit: 0.9, spr: 1.1 },
    weapons: ['rod', 'staff', 'dagger'], armor: ['robe', 'hat', 'light'],
    learn: [[1, 'phoenixfire'], [2, 'cinderward'], [4, 'flamewave'], [5, 'rekindle'], [7, 'ascension'], [8, 'risenflame']],
  },
});
JOB_ORDER.push('chainbearer', 'phoenix');

// ---- New skills ----
Object.assign(SKILLS, {
  // Chainbearer (Zariel)
  retaliate: { name: 'Retaliate', mp: 0, target: 'self', kind: 'buff', buff: 'counter', fx: 'buff', desc: 'Until your next turn, strike back at anyone who hits you.' },
  chainlash: { name: 'Chain Lash', mp: 6, target: 'enemies', kind: 'phys', mult: 0.9, fx: 'slash', desc: 'Whip a burning chain across every foe.' },
  bloodoath: { name: 'Blood Oath', mp: 0, hpCost: 0.15, target: 'self', kind: 'buff', buff: 'might', fx: 'dark', desc: 'Costs 15% max HP. Your attacks hit 50% harder for the rest of the battle.' },
  vengeance: { name: 'Vengeance', mp: 10, target: 'enemy', kind: 'phys', mult: 1, vengeance: true, fx: 'fire', elem: 'fire', desc: 'The more you are hurt, the harder this lands (up to 3x).' },
  boundinferno: { name: 'Bound Inferno', mp: 20, target: 'enemies', kind: 'phys', mult: 1.6, fx: 'fire', elem: 'fire', desc: 'Zariel\'s burning chains coil around every foe.' },
  // Phoenix Warlock (Ashkar)
  phoenixfire: { name: 'Phoenix Fire', mp: 5, target: 'enemy', kind: 'dmg', elem: 'fire', pow: 24, fx: 'fire', desc: 'A burst of the Tenth Flame at one foe.' },
  cinderward: { name: 'Cinder Ward', mp: 12, target: 'ally', kind: 'buff', buff: 'reraise', fx: 'holy', desc: 'If this ally falls, they rise again from the ash.' },
  flamewave: { name: 'Flame Wave', mp: 14, target: 'enemies', kind: 'dmg', elem: 'fire', pow: 36, fx: 'fire', desc: 'A wave of fire over all foes.' },
  rekindle: { name: 'Rekindle', mp: 18, target: 'dead', kind: 'revive', full: true, fx: 'holy', field: true, desc: 'Raise a fallen ally with half their HP.' },
  ascension: { name: 'Ascension', mp: 28, target: 'enemies', kind: 'dmg', elem: 'fire', pow: 70, fx: 'fire', desc: 'What burns may rise. What rises may burn.' },
  risenflame: { name: 'Risen Flame', mp: 40, target: 'allies', kind: 'buff', buff: 'reraise', fx: 'holy', desc: 'Every ally will rise again if they fall.' },
  // Brakka: Powder
  blastshot: { name: 'Blast Shot', mp: 3, target: 'enemy', kind: 'dmg', elem: 'fire', pow: 22, pierce: true, fx: 'boom', desc: 'A hand-cannon shot. Ignores magic defense.' },
  smokecharge: { name: 'Smoke Charge', mp: 4, target: 'enemies', kind: 'status', status: 'blind', chance: 70, fx: 'smoke', desc: 'A cloud of black smoke. Blinds all foes.' },
  flashbang: { name: 'Flashbang', mp: 8, target: 'enemies', kind: 'status', status: 'sleep', chance: 55, fx: 'light', desc: 'So loud it knocks foes out cold.' },
  bigboom: { name: 'Big Boom', mp: 18, target: 'enemies', kind: 'dmg', elem: 'fire', pow: 56, pierce: true, fx: 'boom', desc: 'Brakka\'s masterpiece. Stand back. Further.' },
});

// ---- New items and gear (tier 3) ----
Object.assign(ITEMS, {
  megatonic: { name: 'Mega-Tonic', price: 600, kind: 'heal', pow: 450, target: 'ally', battle: true, field: true, desc: 'Restores 450 HP.' },
  hiether: { name: 'Hi-Ether', price: 900, kind: 'mp', pow: 120, target: 'ally', battle: true, field: true, desc: 'Restores 120 MP.' },
  ashsalve: { name: 'Ash Salve', price: 90, kind: 'cure', cures: ['poison', 'blind', 'sleep', 'fear', 'doom'], target: 'ally', battle: true, field: true, desc: 'Grimnarite burial salve. Cures every ailment, even Doom.' },
});
Object.assign(EQUIP, {
  flamberge: { name: 'Flamberge', slot: 'weapon', type: 'sword', atk: 44, hit: 94, elem: 'fire', price: 2400 },
  obsidianfang: { name: 'Obsidian Fang', slot: 'weapon', type: 'dagger', atk: 36, hit: 99, agi: 5, price: 2100 },
  pyreaxe: { name: 'Pyre Axe', slot: 'weapon', type: 'axe', atk: 50, hit: 84, elem: 'fire', price: 2800 },
  dragonlance: { name: 'Dragon Lance', slot: 'weapon', type: 'spear', atk: 42, hit: 93, str: 3, price: 2600 },
  phoenixtalons: { name: 'Phoenix Talons', slot: 'weapon', type: 'claw', atk: 44, hit: 92, elem: 'fire', price: 2500 },
  emberrod: { name: 'Ember Rod', slot: 'weapon', type: 'rod', atk: 14, hit: 86, mag: 16, price: 2200 },
  gravestaff: { name: 'Grave Staff', slot: 'weapon', type: 'staff', atk: 16, hit: 86, mag: 13, spr: 9, price: 2200 },
  handcannon: { name: 'Hand Cannon', slot: 'weapon', type: 'dagger', atk: 40, hit: 88, elem: 'fire', price: 0, desc: 'Brakka\'s own design. Technically a dagger. Legally a dagger.' },
  ashhelm: { name: 'Ash Helm', slot: 'head', type: 'helm', def: 12, mdef: 4, price: 1600 },
  embercowl: { name: 'Ember Cowl', slot: 'head', type: 'hat', def: 7, mdef: 10, mag: 3, price: 1500 },
  obsidianplate: { name: 'Obsidian Plate', slot: 'body', type: 'heavy', def: 34, mdef: 6, price: 3600 },
  salamanderhide: { name: 'Salamander Hide', slot: 'body', type: 'light', def: 26, mdef: 12, price: 3200 },
  ashrobe: { name: 'Ashen Robe', slot: 'body', type: 'robe', def: 16, mdef: 24, price: 3000 },
  chainlink: { name: 'Zariel\'s Link', slot: 'acc', type: 'acc', def: 4, str: 6, price: 0, desc: 'A red-hot chain link that never cools. Str +6.' },
  gravecharm: { name: 'Grave Charm', slot: 'acc', type: 'acc', mdef: 8, immune: ['doom', 'poison'], price: 1800, desc: 'Prevents Doom and poison.' },
  phoenixplume: { name: 'Phoenix Plume', slot: 'acc', type: 'acc', def: 5, mdef: 8, mag: 5, price: 0, desc: 'One of Ashkar\'s feathers. Warm, and a little smug.' },
});
Object.assign(KEY_ITEMS, {
  anvilshard: { name: 'Anvil Shard', desc: 'Grimnar\'s reliquary: a shard of the first anvil, cracked by a black axe. It is warm like a hearth.' },
  gunpass: { name: 'Foundry Pass', desc: 'Lets you into the Gunworks of Kharak Yr. Brakka forged the signature.' },
  deathpage: { name: 'Page of the Dead', desc: 'A page from the Book of the Dead at Draumond\'s Gate. Your mother\'s name is not on it.' },
});

// ---- Chapter Two enemies. `ph` = placeholder art until b_<art>.png exists ----
Object.assign(ENEMIES, {
  cinderhound: { name: 'Cinder Hound', art: 'wolf', tint: { h: -20, s: 1.4, l: 0.6, all: true }, hp: 300, atk: 66, def: 16, mdef: 12, agi: 26, exp: 96, jp: 6, gold: 90, weak: ['water', 'ice'], resist: ['fire'] },
  ashimp: { name: 'Ash Imp', art: 'imp', tint: { h: -15, s: 0.5, l: 0.8 }, hp: 260, atk: 62, def: 18, mdef: 20, agi: 22, exp: 92, jp: 6, gold: 96, resist: ['fire'], weak: ['water'], acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Cinderbolt', target: 'one', pow: 40, elem: 'fire', fx: 'fire' }], steal: 'megatonic' },
  obsidianlizard: { name: 'Obsidian Lizard', art: 'lizard', tint: { h: 0, s: 0.2, l: 0.45, all: true }, hp: 420, atk: 72, def: 30, mdef: 10, agi: 12, exp: 118, jp: 7, gold: 120, weak: ['water', 'bolt'] },
  kobold: { name: 'Kobold Sapper', art: 'goblin', tint: { h: -60, s: 1.3 }, hp: 240, atk: 60, def: 14, mdef: 12, agi: 24, exp: 90, jp: 6, gold: 110, acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'spell', name: 'Powder Keg', target: 'all', pow: 34, elem: 'fire', fx: 'boom' }], steal: 'flashbomb' },
  legionnaire: { name: 'Hobgoblin Legionnaire', art: 'pirate', tint: { h: -30, s: 1.2, l: 0.8 }, hp: 380, atk: 74, def: 24, mdef: 14, agi: 18, exp: 120, jp: 7, gold: 140, acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'strike', name: 'Shield Bash', mult: 1.4, fx: 'slash' }], steal: 'ashsalve' },
  bugbear: { name: 'Bugbear Enforcer', art: 'ogre', tint: { h: 20, s: 0.7, l: 0.8 }, hp: 620, atk: 88, def: 22, mdef: 10, agi: 10, exp: 170, jp: 8, gold: 170, steal: 'megatonic' },
  lavaslime: { name: 'Lava Gel', art: 'slime', tint: { h: -100, s: 1.5 }, hp: 300, atk: 64, def: 20, mdef: 18, agi: 12, exp: 100, jp: 6, gold: 90, resist: ['fire'], weak: ['ice', 'water'], touch: { status: 'poison', chance: 25 } },
  magmagolem: { name: 'Magma Golem', art: 'ogre', tint: { h: -70, s: 1.2, l: 0.6 }, hp: 700, atk: 92, def: 30, mdef: 14, agi: 8, exp: 190, jp: 9, gold: 190, resist: ['fire'], weak: ['water', 'ice'] },
  ravenwraith: { name: 'Raven Wraith', art: 'bat', tint: { h: 0, s: 0.1, l: 0.35, all: true }, hp: 280, atk: 66, def: 14, mdef: 22, agi: 30, exp: 110, jp: 7, gold: 100, weak: ['holy', 'fire'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'status', name: 'Grave Call', status: 'doom', chance: 25, fx: 'dark' }] },
  gravewight: { name: 'Grave Wight', art: 'zombie', tint: { h: 0, s: 0.2, l: 0.8 }, hp: 420, atk: 72, def: 20, mdef: 16, agi: 12, exp: 124, jp: 7, gold: 110, undead: true, weak: ['fire', 'holy'], touch: { status: 'poison', chance: 25 } },
  ashskeleton: { name: 'Ashbone Soldier', art: 'skeleton', tint: { h: 0, s: 0.2, l: 0.6, all: true }, hp: 380, atk: 76, def: 24, mdef: 12, agi: 16, exp: 122, jp: 7, gold: 120, undead: true, weak: ['holy'] },
  nightshade: { name: 'Stolen Night', art: 'shade', tint: { h: 60, s: 1.4, l: 0.7 }, hp: 380, atk: 70, def: 16, mdef: 26, agi: 24, exp: 140, jp: 8, gold: 120, weak: ['holy', 'fire'], resist: ['dark'], acts: [{ w: 2, type: 'attack' }, { w: 2, type: 'spell', name: 'Borrowed Dark', target: 'all', pow: 38, elem: 'dark', fx: 'dark' }] },
  cultist: { name: 'Phoenix Zealot', art: 'pirate', tint: { h: 20, s: 1.4, l: 1.1 }, hp: 340, atk: 66, def: 18, mdef: 20, agi: 20, exp: 130, jp: 7, gold: 150, resist: ['fire'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'spell', name: 'Phoenix Spark', target: 'one', pow: 46, elem: 'fire', fx: 'fire' }, { w: 1, type: 'heal', name: 'Ember Prayer', pow: 160, when: 'hurt' }], steal: 'hiether' },
  crimsonguard: { name: 'Crimson Edict Guard', art: 'skeleton', tint: { h: -30, s: 1.6, l: 0.8 }, hp: 450, atk: 80, def: 26, mdef: 18, agi: 18, exp: 150, jp: 8, gold: 160, acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'strike', name: 'Edict Blade', mult: 1.6, fx: 'slash' }] },

  // ------------------------------------------------------------------ Chapter Two bosses
  vorsk: {
    name: 'Gate Champion Vorsk', art: 'vorsk', ph: { art: 'goblin', tint: { h: -40, s: 1.4, l: 0.8 }, scale: 2.4 }, boss: true,
    hp: 3200, atk: 76, def: 22, mdef: 14, agi: 18, exp: 2200, jp: 14, gold: 1800, immune: ['sleep', 'fear', 'doom'],
    acts: [{ w: 4, type: 'attack' }, { w: 2, type: 'strike', name: 'Oath of Iron', mult: 1.8, fx: 'slash' }, { w: 1, type: 'buff', name: 'The Crowd Roars', once: true }],
    phase2: [{ w: 3, type: 'attack' }, { w: 3, type: 'strike', name: 'Oath of Iron', mult: 1.9, fx: 'slash' }, { w: 1, type: 'spell', name: 'Arena Dust', target: 'all', pow: 30, elem: 'earth', fx: 'smoke' }],
    lines: { start: '"By the Crimson Edicts! Strength is truth! Show me yours, foreigners!"', half: 'The arena crowd is screaming. Vorsk is grinning.' },
  },
  cannongolem: {
    name: 'Grimnar\'s Voice', art: 'cannongolem', ph: { art: 'ogre', tint: { h: 200, s: 0.3, l: 0.6, all: true }, scale: 2.2 }, boss: true,
    hp: 4600, atk: 82, def: 30, mdef: 16, agi: 10, actions: 2, exp: 3200, jp: 16, gold: 2600, weak: ['water', 'bolt'], resist: ['fire'], immune: ['sleep', 'fear', 'doom', 'poison', 'blind'],
    acts: [{ w: 4, type: 'attack' }, { w: 2, type: 'spell', name: 'Thunder Cannon', target: 'all', pow: 42, elem: 'fire', fx: 'boom' }, { w: 2, type: 'strike', name: 'Iron Crush', mult: 1.6, fx: 'boom' }, { w: 1, type: 'status', name: 'Smoke Vent', target: 'all', status: 'blind', chance: 45, fx: 'smoke' }],
    lines: { start: 'The great cannon on the Gunworks rampart has legs now. Somebody gave it legs.', half: 'Its barrel glows white-hot. The whole foundry shakes with every shot.' },
  },
  ferryman: {
    name: 'The Ash Ferryman', art: 'ferryman', ph: { art: 'shade', tint: { h: 30, s: 0.4, l: 0.8 }, scale: 2.3 }, boss: true,
    hp: 5600, atk: 84, def: 24, mdef: 26, agi: 20, exp: 4200, jp: 18, gold: 3000, weak: ['holy', 'fire'], resist: ['dark'], immune: ['sleep', 'fear', 'doom', 'poison'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Ashen Oar', target: 'all', pow: 46, elem: 'dark', fx: 'dark' }, { w: 1, type: 'status', name: 'Final Toll', status: 'doom', chance: 45, fx: 'dark' }, { w: 1, type: 'drain', name: 'Toll of Souls', pow: 80 }],
    lines: { start: '"No living thing crosses the Final Gate. Not even with stolen night in its veins."', half: 'Violet smoke leaks from the Ferryman\'s cracks. Something has been feeding it.' },
  },
  veiledverai: {
    name: 'Veiled Daughter', art: 'veiledverai', ph: { look: 'verai', silhouette: '#6a2ab0', scale: 5 }, boss: true,
    hp: 3800, atk: 70, def: 20, mdef: 30, agi: 26, exp: 0, jp: 0, gold: 0, immune: ['sleep', 'fear', 'doom', 'poison', 'blind'],
    acts: [{ w: 2, type: 'spell', name: 'Nightfall', target: 'all', pow: 44, elem: 'dark', fx: 'dark' }, { w: 1, type: 'status', name: 'Stolen Dream', target: 'all', status: 'sleep', chance: 40, fx: 'smoke' }, { w: 1, type: 'attack' }],
    lines: { start: 'Verai\'s smoke has gone violet and cold. She won\'t look at Raine.' },
  },
  ashkargod: {
    name: 'Ashkar, the Tenth Flame', art: 'ashkargod', ph: { art: 'bat', tint: { h: 40, s: 1.6, l: 1.2 }, scale: 3.0 }, boss: true,
    hp: 5000, atk: 72, def: 24, mdef: 24, agi: 22, actions: 2, exp: 6000, jp: 22, gold: 5000, weak: ['water', 'ice'], resist: ['fire', 'holy'], immune: ['sleep', 'fear', 'doom', 'poison', 'blind'],
    acts: [{ w: 3, type: 'attack' }, { w: 3, type: 'spell', name: 'Tenth Flame', target: 'all', pow: 42, elem: 'fire', fx: 'fire' }, { w: 2, type: 'strike', name: 'Phoenix Talon', mult: 1.8, fx: 'slash' }, { w: 1, type: 'heal', name: 'Rising Ash', pow: 600, uses: 1, when: 'hurt' }],
    lines: { start: '"A test, little crescent. Burn, and see if you rise. (And no, fire will not work on me. I AM fire.)"', half: 'Ashkar laughs. Feathers of fire fill the caldera.' },
  },
  kargath: {
    name: 'Warlord Kargath', art: 'kargath', ph: { art: 'skeleton', tint: { h: -30, s: 1.8, l: 0.7 }, scale: 2.4 }, boss: true,
    hp: 4600, atk: 76, def: 24, mdef: 20, agi: 18, actions: 2, exp: 6000, jp: 22, gold: 5000, weak: ['holy'], resist: ['fire', 'dark'], immune: ['sleep', 'fear', 'doom', 'poison'],
    acts: [{ w: 4, type: 'attack' }, { w: 2, type: 'strike', name: 'Black Blade', mult: 1.7, fx: 'slash' }, { w: 2, type: 'spell', name: 'Crimson Edict', target: 'all', pow: 40, elem: 'fire', fx: 'fire' }, { w: 1, type: 'buff', name: 'Night of the Black Blade', once: true }],
    lines: { start: '"The Unseated One pays better than any god. Hand over the shard, or be a pyre." His armor is quenched against flame.', half: 'Kargath\'s split mask cracks. One half is smiling.' },
  },
});

Object.assign(FORMATIONS, {
  ashport: [{ w: 3, e: [['cinderhound', 1, 3]] }, { w: 3, e: [['ashimp', 2, 3]] }, { w: 2, e: [['kobold', 2, 3]] }, { w: 2, e: [['legionnaire', 1, 2]] }],
  ashplains: [{ w: 3, e: [['obsidianlizard', 1, 2]] }, { w: 2, e: [['cinderhound', 2, 3]] }, { w: 1, e: [['bugbear', 1, 1]] }, { w: 2, e: [['legionnaire', 1, 1], ['kobold', 1, 2]] }, { w: 2, e: [['lavaslime', 2, 3]] }],
  forge: [{ w: 3, e: [['kobold', 2, 3]] }, { w: 2, e: [['magmagolem', 1, 1]] }, { w: 3, e: [['lavaslime', 2, 3]] }, { w: 2, e: [['legionnaire', 1, 2], ['kobold', 1, 1]] }],
  grave: [{ w: 3, e: [['ravenwraith', 2, 3]] }, { w: 3, e: [['gravewight', 1, 3]] }, { w: 2, e: [['ashskeleton', 2, 2]] }, { w: 2, e: [['nightshade', 1, 2]] }],
  caldera: [{ w: 3, e: [['cultist', 1, 3]] }, { w: 2, e: [['crimsonguard', 1, 2]] }, { w: 2, e: [['magmagolem', 1, 1], ['ashimp', 1, 2]] }, { w: 2, e: [['cinderhound', 2, 3]] }],
});
Object.assign(SHOPS, {
  emberport: { weapon: ['flamberge', 'obsidianfang', 'dragonlance', 'emberrod'], armor: ['ashhelm', 'embercowl', 'salamanderhide', 'ashrobe'], item: ['tonic', 'hitonic', 'megatonic', 'ether', 'ashsalve', 'emberplume', 'bedroll', 'flashbomb'], inn: 150, chapel: 100 },
  charnoch: { item: ['hitonic', 'megatonic', 'ether', 'ashsalve', 'emberplume', 'bedroll'], inn: 120 },
  kharakyr: { weapon: ['flamberge', 'obsidianfang', 'pyreaxe', 'dragonlance', 'phoenixtalons', 'emberrod', 'gravestaff'], armor: ['ashhelm', 'embercowl', 'obsidianplate', 'salamanderhide', 'ashrobe'], item: ['megatonic', 'hiether', 'ashsalve', 'flashbomb', 'bedroll'], inn: 150, chapel: 120 },
  draumond: { armor: ['ashhelm', 'embercowl', 'obsidianplate', 'ashrobe', 'gravecharm'], item: ['megatonic', 'hiether', 'ashsalve', 'emberplume', 'bedroll'], inn: 150, chapel: 60 },
});
