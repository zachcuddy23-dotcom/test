'use strict';
// ---------------------------------------------------------------------------
// Game data: party, classes, spells, items, equipment, monsters, formations
// ---------------------------------------------------------------------------
const CLASSES = {
  dragon: {
    name: 'Dragon', magic: 'Rites', letter: 'D', hitBase: 10, hitGrow: 3, mdefBase: 15, mdefGrow: 2, crit: 2,
    grow: { hp: [14, 20], str: [2, 3], agi: [1, 1], int: [0, 1], vit: [1, 2], luck: [0, 1] },
    charges: [[1, 1, 0.35], [4, 1, 0.3], [8, 1, 0.3]],
  },
  shadow: {
    name: 'Shadow Mage', magic: 'Shadow', letter: 'S', hitBase: 5, hitGrow: 1, mdefBase: 20, mdefGrow: 3, crit: 0,
    grow: { hp: [5, 9], str: [0, 1], agi: [1, 2], int: [2, 3], vit: [0, 1], luck: [1, 1] },
    charges: [[1, 2, 0.5], [3, 1, 0.5], [5, 1, 0.45]],
  },
  alchemist: {
    name: 'Rogue Alchemist', magic: 'Formula', letter: 'A', hitBase: 10, hitGrow: 2, mdefBase: 18, mdefGrow: 2, crit: 8,
    grow: { hp: [8, 12], str: [1, 2], agi: [2, 3], int: [1, 2], vit: [1, 1], luck: [1, 2] },
    charges: [[1, 2, 0.4], [4, 1, 0.4], [7, 1, 0.35]],
  },
};
const HEROES = {
  miasma: { name: 'Miasma', cls: 'dragon', img: 'miasma', face: 'miasma_face', look: 'miasma', hp: 38, str: 20, agi: 8, int: 7, vit: 16, luck: 6, weapon: 'claws', body: 'clothes', acc: null, spells: ['ember'] },
  verai: { name: 'Verai', cls: 'shadow', img: 'verai', face: 'verai_face', look: 'verai', hp: 24, str: 4, agi: 10, int: 20, vit: 4, luck: 10, weapon: 'staff', body: 'clothes', acc: null, spells: ['umbra'] },
  raine: { name: 'Raine', cls: 'alchemist', img: 'raine', face: 'raine_face', look: 'raine', hp: 30, str: 9, agi: 15, int: 12, vit: 8, luck: 15, weapon: 'knife', body: 'clothes', acc: null, spells: ['mend'] },
};
// cumulative exp needed for each level (index = level)
const EXP_TABLE = [0, 0, 30, 90, 180, 320, 520, 800, 1180, 1700, 2400, 3300, 4450, 5900, 7700, 9900, 12500, 15600, 19200, 23400, 28200, 34000, 41000, 49000, 58000, 99999999];
const MAX_LEVEL = 24;

// Spells ----------------------------------------------------------------------
// kind: dmg | heal | status | buff | cure | revive | drain
const SPELLS = {
  // Dragon rites
  ember: { name: 'Ember Breath', cls: 'dragon', tier: 1, price: 100, target: 'enemies', kind: 'dmg', elem: 'fire', pow: 11, fx: 'fire', desc: 'Breathe fire on all foes.' },
  scale: { name: 'Scaleguard', cls: 'dragon', tier: 1, price: 100, target: 'self', kind: 'buff', buff: 'def', pow: 12, fx: 'buff', desc: 'Harden your scales. Defense up.' },
  gale: { name: 'Wing Gale', cls: 'dragon', tier: 2, price: 600, target: 'enemies', kind: 'dmg', elem: 'wind', pow: 22, fx: 'wind', desc: 'Beat your wings. Wind hits all foes.' },
  miasma: { name: 'Miasma Cloud', cls: 'dragon', tier: 2, price: 600, target: 'enemies', kind: 'dmg', elem: 'poison', pow: 14, status: 'poison', chance: 60, fx: 'poison', desc: 'Toxic mist. Damages and poisons all foes.' },
  roar: { name: 'Dragon Roar', cls: 'dragon', tier: 3, price: 1500, target: 'enemies', kind: 'status', status: 'fear', chance: 70, fx: 'roar', desc: 'Terrify all foes. Lowers their attack.' },
  blaze: { name: 'Blaze Breath', cls: 'dragon', tier: 3, price: 1500, target: 'enemies', kind: 'dmg', elem: 'fire', pow: 44, fx: 'fire', desc: 'Searing dragonfire on all foes.' },
  // Shadow magic
  umbra: { name: 'Umbra Bolt', cls: 'shadow', tier: 1, price: 100, target: 'enemy', kind: 'dmg', elem: 'dark', pow: 16, fx: 'dark', desc: 'A bolt of shadow at one foe.' },
  veil: { name: 'Smoke Veil', cls: 'shadow', tier: 1, price: 100, target: 'enemies', kind: 'status', status: 'sleep', chance: 55, fx: 'smoke', desc: 'Lulls all foes to sleep with smoke.' },
  cinder: { name: 'Cinder', cls: 'shadow', tier: 1, price: 150, target: 'enemy', kind: 'dmg', elem: 'fire', pow: 15, fx: 'fire', desc: 'Smouldering fire at one foe.' },
  nightfall: { name: 'Nightfall', cls: 'shadow', tier: 2, price: 600, target: 'enemies', kind: 'dmg', elem: 'dark', pow: 24, fx: 'dark', desc: 'Darkness falls on all foes.' },
  haze: { name: 'Blinding Haze', cls: 'shadow', tier: 2, price: 500, target: 'enemies', kind: 'status', status: 'blind', chance: 65, fx: 'smoke', desc: 'Blinds all foes. They miss more.' },
  drain: { name: 'Soul Drain', cls: 'shadow', tier: 3, price: 1500, target: 'enemy', kind: 'drain', elem: 'dark', pow: 50, fx: 'dark', desc: 'Steal life from one foe.' },
  ash: { name: 'Ashstorm', cls: 'shadow', tier: 3, price: 1500, target: 'enemies', kind: 'dmg', elem: 'fire', pow: 46, fx: 'fire', desc: 'A storm of burning ash on all foes.' },
  // Alchemist formulas
  mend: { name: 'Mend Tonic', cls: 'alchemist', tier: 1, price: 100, target: 'ally', kind: 'heal', pow: 18, fx: 'heal', field: true, desc: 'Restore HP to one ally.' },
  acid: { name: 'Acid Flask', cls: 'alchemist', tier: 1, price: 100, target: 'enemy', kind: 'dmg', elem: 'acid', pow: 15, pierce: true, fx: 'acid', desc: 'Corrosive flask. Hits one foe.' },
  mist: { name: 'Healing Mist', cls: 'alchemist', tier: 2, price: 600, target: 'allies', kind: 'heal', pow: 16, fx: 'heal', field: true, desc: 'Restore HP to all allies.' },
  purify: { name: 'Purify', cls: 'alchemist', tier: 2, price: 400, target: 'ally', kind: 'cure', cures: ['poison', 'blind', 'sleep'], fx: 'heal', field: true, desc: 'Cures poison, blindness and sleep.' },
  quick: { name: 'Quicksilver', cls: 'alchemist', tier: 3, price: 1500, target: 'ally', kind: 'buff', buff: 'haste', fx: 'buff', desc: 'Doubles an ally\'s attacks.' },
  revive: { name: 'Revival Salts', cls: 'alchemist', tier: 3, price: 1500, target: 'ally', kind: 'revive', fx: 'heal', field: true, desc: 'Revives a fallen ally.' },
};

// Items & equipment -----------------------------------------------------------
const ITEMS = {
  tonic: { name: 'Tonic', price: 60, kind: 'heal', pow: 30, target: 'ally', battle: true, field: true, desc: 'Restores 30 HP.' },
  hitonic: { name: 'Hi-Tonic', price: 250, kind: 'heal', pow: 100, target: 'ally', battle: true, field: true, desc: 'Restores 100 HP.' },
  antidote: { name: 'Antidote', price: 75, kind: 'cure', cures: ['poison'], target: 'ally', battle: true, field: true, desc: 'Cures poison.' },
  eyedrop: { name: 'Eye Drops', price: 40, kind: 'cure', cures: ['blind'], target: 'ally', battle: true, field: true, desc: 'Cures blindness.' },
  feather: { name: 'Phoenix Feather', price: 700, kind: 'revive', target: 'ally', battle: true, field: true, desc: 'Revives a fallen ally.' },
  starwater: { name: 'Starwater', price: 0, kind: 'charges', target: 'ally', battle: true, field: true, desc: 'Restores 1 spell charge of every tier.' },
  campkit: { name: 'Campfire Kit', price: 75, kind: 'camp', pow: 40, target: 'none', battle: false, field: true, desc: 'World map only. Rest: +40 HP to all.' },
  bomb: { name: 'Flash Bomb', price: 120, kind: 'bomb', pow: 30, target: 'enemies', battle: true, field: false, desc: 'Deals 30-60 damage to all foes.' },
};
const KEY_ITEMS = {
  harp: { name: 'Dawnsong Harp', desc: 'Princess Liora\'s gift. It hums faintly at dawn.' },
  deed: { name: 'Ship Deed', desc: 'Proof that the "Gull\'s Folly" is yours.' },
  crown: { name: 'Obsidian Crown', desc: 'A crown of black glass, cold to the touch.' },
  eye: { name: 'Dawnseer\'s Eye', desc: 'A gem that glows like the morning sun.' },
  wardkey: { name: 'Warden\'s Key', desc: 'Opens the sealed doors of the old world.' },
};
// slot: weapon/body/acc; cls: letters of classes that can equip
const EQUIP = {
  // weapons
  claws: { name: 'Iron Claws', slot: 'weapon', cls: 'D', atk: 8, hit: 5, price: 60 },
  knife: { name: 'Knife', slot: 'weapon', cls: 'SA', atk: 5, hit: 10, price: 20 },
  staff: { name: 'Ash Staff', slot: 'weapon', cls: 'S', atk: 5, hit: 0, mag: 3, price: 30 },
  shortsword: { name: 'Short Sword', slot: 'weapon', cls: 'DA', atk: 11, hit: 10, price: 100 },
  axe: { name: 'Hand Axe', slot: 'weapon', cls: 'D', atk: 17, hit: 5, price: 250 },
  rapier: { name: 'Rapier', slot: 'weapon', cls: 'A', atk: 14, hit: 20, crit: 8, price: 220 },
  hollowrod: { name: 'Hollow Rod', slot: 'weapon', cls: 'S', atk: 8, hit: 5, mag: 8, price: 200 },
  cutlass: { name: 'Cutlass', slot: 'weapon', cls: 'DA', atk: 19, hit: 12, price: 400 },
  moonblade: { name: 'Crescent Saber', slot: 'weapon', cls: 'A', atk: 24, hit: 25, crit: 15, price: 0, desc: 'Moonlit steel. Suits Raine.' },
  wyrmfang: { name: 'Wyrmfang', slot: 'weapon', cls: 'D', atk: 28, hit: 15, crit: 5, price: 0, desc: 'A blade carved from a dragon\'s tooth.' },
  elvensaber: { name: 'Elven Saber', slot: 'weapon', cls: 'A', atk: 21, hit: 22, crit: 10, price: 900 },
  nightbloom: { name: 'Nightbloom Staff', slot: 'weapon', cls: 'S', atk: 12, hit: 10, mag: 14, price: 850 },
  greataxe: { name: 'Great Axe', slot: 'weapon', cls: 'D', atk: 30, hit: 5, price: 1200 },
  umbralrod: { name: 'Umbral Rod', slot: 'weapon', cls: 'S', atk: 14, hit: 10, mag: 20, price: 0, desc: 'Shadows coil around it.' },
  // body armor
  clothes: { name: 'Travel Clothes', slot: 'body', cls: 'DSA', def: 1, price: 10 },
  leather: { name: 'Leather Vest', slot: 'body', cls: 'DA', def: 4, price: 60 },
  wrap: { name: 'Mystic Wrap', slot: 'body', cls: 'S', def: 2, mdef: 5, price: 50 },
  chain: { name: 'Chain Mail', slot: 'body', cls: 'D', def: 12, price: 350 },
  longcoat: { name: 'Longcoat', slot: 'body', cls: 'A', def: 8, mdef: 3, price: 240 },
  shawl: { name: 'Shadow Shawl', slot: 'body', cls: 'S', def: 5, mdef: 8, price: 200 },
  scale: { name: 'Scale Mail', slot: 'body', cls: 'D', def: 20, price: 1000 },
  nightcoat: { name: 'Night Coat', slot: 'body', cls: 'A', def: 14, mdef: 6, price: 850 },
  duskrobe: { name: 'Duskweave Robe', slot: 'body', cls: 'S', def: 9, mdef: 14, price: 750 },
  wyrmscale: { name: 'Wyrmscale Mail', slot: 'body', cls: 'D', def: 28, mdef: 6, price: 0, desc: 'Scales shed by an elder wyrm.' },
  smokesilk: { name: 'Smoke-Silk Dress', slot: 'body', cls: 'S', def: 12, mdef: 18, price: 0, desc: 'Woven from living smoke.' },
  // accessories
  cap: { name: 'Leather Cap', slot: 'acc', cls: 'DSA', def: 1, price: 30 },
  bangle: { name: 'Bronze Bangle', slot: 'acc', cls: 'DSA', def: 2, price: 80 },
  moonpend: { name: 'Moon Pendant', slot: 'acc', cls: 'A', def: 2, luck: 5, crit: 6, price: 0, desc: 'A crescent of old gold.' },
  greyscarf: { name: 'Grey Scarf', slot: 'acc', cls: 'S', def: 2, mdef: 6, mag: 4, price: 0, desc: 'Soft and warm. Smells of smoke.' },
  helm: { name: 'Iron Helm', slot: 'acc', cls: 'D', def: 4, price: 180 },
  silverbangle: { name: 'Silver Bangle', slot: 'acc', cls: 'DSA', def: 4, price: 240 },
  wyrmhelm: { name: 'Wyrmbone Helm', slot: 'acc', cls: 'D', def: 7, price: 600 },
  spiritcharm: { name: 'Spirit Charm', slot: 'acc', cls: 'DSA', def: 5, mdef: 10, price: 800 },
  emberring: { name: 'Ember Ring', slot: 'acc', cls: 'DSA', def: 3, mdef: 4, str: 5, price: 0, desc: 'Warm to the touch. Str +5.' },
};
function itemInfo(id) { return ITEMS[id] || EQUIP[id] || KEY_ITEMS[id]; }

// Monsters ---------------------------------------------------------------------
// acts: weighted list of actions. Default basic attack.
const ENEMIES = {
  gel: { name: 'Green Gel', art: 'slime', hp: 14, atk: 5, def: 0, eva: 4, acc: 20, agi: 3, exp: 7, gold: 5, weak: ['fire'], steal: 'tonic' },
  goblin: { name: 'Goblin', art: 'goblin', hp: 11, atk: 6, def: 2, eva: 6, acc: 22, agi: 6, exp: 7, gold: 7, steal: 'tonic' },
  wolf: { name: 'Grey Wolf', art: 'wolf', hp: 20, atk: 8, def: 2, eva: 16, acc: 30, agi: 12, exp: 12, gold: 8 },
  bat: { name: 'Cave Bat', art: 'bat', hp: 13, atk: 6, def: 0, eva: 30, acc: 30, agi: 16, exp: 9, gold: 5, weak: ['wind'] },
  imp: { name: 'Cinder Imp', art: 'imp', hp: 22, atk: 8, def: 3, eva: 12, acc: 28, agi: 10, exp: 18, gold: 20, resist: ['fire'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'spell', name: 'Spark', target: 'one', pow: 8, elem: 'fire', fx: 'fire' }], steal: 'antidote' },
  bones: { name: 'Bone Warden', art: 'skeleton', hp: 30, atk: 10, def: 6, eva: 8, acc: 30, agi: 6, exp: 22, gold: 18, weak: ['fire'], undead: true },
  rotter: { name: 'Rotter', art: 'zombie', hp: 36, atk: 9, def: 4, eva: 4, acc: 26, agi: 4, exp: 24, gold: 15, weak: ['fire'], undead: true, touch: { status: 'poison', chance: 25 }, steal: 'antidote' },
  vhalen: {
    name: 'Sir Vhalen', art: 'vhalen', boss: true, hp: 360, atk: 18, def: 8, eva: 12, acc: 40, agi: 12, exp: 160, gold: 300, immune: ['sleep', 'fear', 'blind', 'poison'],
    acts: [{ w: 5, type: 'attack' }, { w: 2, type: 'strike', name: 'Oathbreaker Slash', mult: 1.6, fx: 'slash' }, { w: 1, type: 'buff', name: 'Iron Resolve', buff: 'def', pow: 8, once: true }],
  },
  chief: { name: 'Goblin Chief', art: 'goblin', tint: { h: -80, s: 1.1 }, hp: 34, atk: 12, def: 6, eva: 10, acc: 32, agi: 10, exp: 26, gold: 30, steal: 'tonic' },
  direwolf: { name: 'Dire Wolf', art: 'wolf', tint: { h: 0, s: 0.8, l: 0.7, all: true }, hp: 42, atk: 14, def: 4, eva: 20, acc: 36, agi: 16, exp: 34, gold: 22 },
  lizard: { name: 'Rock Lizard', art: 'lizard', hp: 52, atk: 13, def: 12, eva: 8, acc: 30, agi: 6, exp: 38, gold: 46, weak: ['acid'] },
  spider: { name: 'Venom Spider', art: 'spider', hp: 34, atk: 11, def: 5, eva: 18, acc: 34, agi: 14, exp: 30, gold: 30, touch: { status: 'poison', chance: 30 }, steal: 'antidote' },
  ogre: { name: 'Ogre', art: 'ogre', hp: 90, atk: 20, def: 8, eva: 6, acc: 36, agi: 6, exp: 80, gold: 100, steal: 'hitonic' },
  deckhand: { name: 'Deckhand', art: 'pirate', hp: 60, atk: 16, def: 6, eva: 14, acc: 36, agi: 12, exp: 36, gold: 50 },
  rusk: {
    name: 'Captain Rusk', art: 'rusk', boss: true, hp: 680, atk: 25, def: 12, eva: 18, acc: 48, agi: 16, hits: 2, exp: 600, gold: 1000, immune: ['sleep', 'fear', 'poison'],
    acts: [{ w: 5, type: 'attack' }, { w: 2, type: 'spell', name: 'Cannon Blast', target: 'all', pow: 22, elem: 'fire', fx: 'boom' }, { w: 2, type: 'heal', name: 'Swig of Grog', pow: 90, when: 'hurt', uses: 2 }],
  },
  brine: { name: 'Brinefiend', art: 'fishman', hp: 66, atk: 18, def: 8, eva: 14, acc: 40, agi: 12, exp: 56, gold: 60, weak: ['wind'], resist: ['fire'] },
  buccaneer: { name: 'Buccaneer', art: 'pirate', tint: { h: 200, l: 0.9 }, hp: 60, atk: 17, def: 8, eva: 16, acc: 40, agi: 14, exp: 52, gold: 80, steal: 'bomb' },
  thornwolf: { name: 'Thorn Wolf', art: 'wolf', tint: { h: 110, s: 2.5, all: true }, hp: 78, atk: 22, def: 8, eva: 24, acc: 46, agi: 20, exp: 82, gold: 62 },
  wisp: { name: 'Will-o-Wisp', art: 'wisp', hp: 48, atk: 12, def: 4, eva: 40, acc: 44, agi: 24, exp: 70, gold: 58, weak: ['dark'], acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Glimmer', target: 'one', pow: 16, elem: 'light', fx: 'light' }] },
  mossogre: { name: 'Moss Ogre', art: 'ogre', tint: { h: 70, s: 1.3 }, hp: 150, atk: 30, def: 12, eva: 8, acc: 44, agi: 8, exp: 150, gold: 170, weak: ['fire'], steal: 'hitonic' },
  thicket: { name: 'Thicket Spider', art: 'spider', tint: { h: 110, s: 1.5 }, hp: 72, atk: 22, def: 8, eva: 24, acc: 46, agi: 18, exp: 84, gold: 72, touch: { status: 'poison', chance: 30 }, steal: 'antidote' },
  toad: { name: 'Bog Toad', art: 'toad', hp: 86, atk: 22, def: 10, eva: 12, acc: 44, agi: 10, exp: 90, gold: 66, touch: { status: 'poison', chance: 30 }, steal: 'antidote' },
  boggel: { name: 'Bog Gel', art: 'slime', tint: { h: 190, s: 0.8, l: 0.8 }, hp: 76, atk: 20, def: 4, eva: 8, acc: 42, agi: 6, exp: 84, gold: 62, weak: ['fire'], resist: ['wind'], touch: { status: 'blind', chance: 20 } },
  ghoul: { name: 'Mire Ghoul', art: 'zombie', tint: { h: 140, l: 0.85 }, hp: 124, atk: 26, def: 10, eva: 8, acc: 46, agi: 8, exp: 122, gold: 98, weak: ['fire'], undead: true, touch: { status: 'sleep', chance: 20 } },
  shade: { name: 'Shade', art: 'shade', hp: 98, atk: 22, def: 8, eva: 36, acc: 50, agi: 22, exp: 128, gold: 110, weak: ['fire', 'light'], resist: ['dark'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'spell', name: 'Dark Pulse', target: 'all', pow: 14, elem: 'dark', fx: 'dark' }] },
  mirespider: { name: 'Mire Spider', art: 'spider', tint: { h: 250, s: 1.2 }, hp: 92, atk: 26, def: 10, eva: 26, acc: 50, agi: 20, exp: 114, gold: 92, touch: { status: 'poison', chance: 35 } },
  wight: { name: 'Mire Wight', art: 'shade', tint: { h: 170, s: 1.6, l: 1.3 }, hp: 280, atk: 30, def: 14, eva: 20, acc: 54, agi: 16, exp: 280, gold: 320, resist: ['dark'], immune: ['sleep', 'fear'], acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Chill Mist', target: 'all', pow: 22, elem: 'ice', fx: 'ice' }] },
  duskknight: { name: 'Dusk Knight', art: 'skeleton', tint: { h: 240, s: 0.8, l: 0.75 }, hp: 150, atk: 32, def: 18, eva: 14, acc: 56, agi: 14, exp: 180, gold: 160, weak: ['fire'], undead: true },
  vampbat: { name: 'Vampire Bat', art: 'bat', tint: { h: 120, s: 1.3 }, hp: 72, atk: 24, def: 6, eva: 44, acc: 54, agi: 30, exp: 110, gold: 80, weak: ['wind'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'drain', name: 'Blood Sip', pow: 18 }] },
  morvane: {
    name: 'Morvane', art: 'morvane', boss: true, hp: 1500, atk: 42, def: 20, eva: 30, acc: 64, agi: 26, actions: 2, exp: 3000, gold: 3000, immune: ['sleep', 'fear', 'blind', 'poison'], resist: ['dark'],
    acts: [{ w: 4, type: 'attack' }, { w: 3, type: 'spell', name: 'Umbral Nova', target: 'all', pow: 26, elem: 'dark', fx: 'dark' }, { w: 1, type: 'status', name: 'Hollow Gaze', status: 'sleep', chance: 60, fx: 'smoke' }, { w: 2, type: 'drain', name: 'Drain Touch', pow: 34 }],
  },
};
const BOSS_ART_SIZE = { vhalen: 1, rusk: 1, morvane: 1 };

// Encounter formations by zone: [enemyId, min, max]
const FORMATIONS = {
  cindral: [{ w: 3, e: [['gel', 1, 3]] }, { w: 3, e: [['goblin', 2, 4]] }, { w: 2, e: [['wolf', 1, 2]] }, { w: 2, e: [['goblin', 1, 2], ['gel', 1, 1]] }],
  north: [{ w: 3, e: [['goblin', 2, 4]] }, { w: 2, e: [['wolf', 2, 3]] }, { w: 2, e: [['bat', 2, 3]] }, { w: 2, e: [['imp', 1, 2], ['goblin', 1, 2]] }],
  temple: [{ w: 3, e: [['bones', 1, 2]] }, { w: 3, e: [['rotter', 1, 2]] }, { w: 2, e: [['bat', 2, 4]] }, { w: 2, e: [['imp', 2, 3]] }, { w: 2, e: [['bones', 1, 1], ['rotter', 1, 1]] }],
  east: [{ w: 3, e: [['chief', 2, 3]] }, { w: 3, e: [['direwolf', 2, 3]] }, { w: 2, e: [['lizard', 1, 2]] }, { w: 3, e: [['spider', 2, 3]] }, { w: 1, e: [['ogre', 1, 1]] }, { w: 2, e: [['chief', 1, 2], ['goblin', 2, 2]] }],
  sea: [{ w: 3, e: [['brine', 1, 3]] }, { w: 1, e: [['buccaneer', 2, 3]] }, { w: 1, e: [['brine', 1, 1], ['buccaneer', 1, 1]] }],
  isle: [{ w: 3, e: [['thornwolf', 2, 3]] }, { w: 2, e: [['wisp', 2, 3]] }, { w: 1, e: [['mossogre', 1, 1]] }, { w: 2, e: [['thicket', 2, 3]] }, { w: 1, e: [['thornwolf', 1, 1], ['wisp', 1, 2]] }],
  fen: [{ w: 3, e: [['toad', 2, 3]] }, { w: 2, e: [['boggel', 2, 3]] }, { w: 2, e: [['ghoul', 1, 2]] }, { w: 1, e: [['thicket', 2, 2]] }],
  fendeep: [{ w: 3, e: [['toad', 2, 3]] }, { w: 2, e: [['boggel', 2, 4]] }, { w: 3, e: [['ghoul', 1, 3]] }, { w: 2, e: [['shade', 1, 2]] }, { w: 2, e: [['mirespider', 2, 3]] }, { w: 1, e: [['toad', 1, 1], ['shade', 1, 1], ['boggel', 1, 1]] }],
  dusk: [{ w: 3, e: [['shade', 1, 2]] }, { w: 2, e: [['duskknight', 1, 2]] }, { w: 3, e: [['vampbat', 2, 3]] }, { w: 1, e: [['duskknight', 1, 1], ['vampbat', 2, 2]] }],
};

// Shops ------------------------------------------------------------------------
const SHOPS = {
  cindral: { weapon: ['knife', 'staff', 'claws', 'shortsword'], armor: ['clothes', 'leather', 'wrap', 'cap', 'bangle'], item: ['tonic', 'antidote', 'eyedrop', 'campkit'], magic: ['ember', 'scale', 'umbra', 'veil', 'cinder', 'mend', 'acid'], inn: 30, clinic: 25 },
  brinemoor: { weapon: ['shortsword', 'axe', 'rapier', 'hollowrod', 'cutlass'], armor: ['leather', 'chain', 'longcoat', 'shawl', 'helm', 'silverbangle'], item: ['tonic', 'antidote', 'eyedrop', 'campkit', 'bomb'], magic: ['gale', 'miasma', 'nightfall', 'haze', 'mist', 'purify'], inn: 80, clinic: 60 },
  lumenwood: { weapon: ['cutlass', 'elvensaber', 'nightbloom', 'greataxe'], armor: ['scale', 'nightcoat', 'duskrobe', 'wyrmhelm', 'spiritcharm'], item: ['tonic', 'hitonic', 'antidote', 'eyedrop', 'feather', 'campkit', 'bomb'], magic: ['roar', 'blaze', 'drain', 'ash', 'quick', 'revive'], inn: 200, clinic: 150 },
};
