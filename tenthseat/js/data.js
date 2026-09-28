'use strict';
// ---------------------------------------------------------------------------
// Game data: heroes, jobs, skills, items, equipment, monsters, formations
// World: Cael'Brithar, under the Ascendant Ten.
// ---------------------------------------------------------------------------

// Stat keys: hp, mp, str, agi, mag, vit, spr
// base = level 1 value, grow = gain per level (fractions accumulate)
const HEROES = {
  raine: {
    name: 'Raine', full: 'Raine Cudlar', img: 'raine', face: 'raine_face', look: 'raine', job: 'oathblade', innate: 'brew',
    base: { hp: 64, mp: 12, str: 12, agi: 12, mag: 8, vit: 10, spr: 8 },
    grow: { hp: 11, mp: 1.5, str: 1.0, agi: 0.8, mag: 0.6, vit: 0.8, spr: 0.6 },
    equip: { weapon: 'wardensword', head: null, body: 'wardencoat', acc: 'crescent' },
    bio: 'Captain of the Lantern Wardens. Serious, stubborn, and very good at not saying what she feels. Wears a crescent moon she has never explained.',
  },
  miasma: {
    name: 'Miasma', full: 'Miasma', img: 'miasma', face: 'miasma_face', look: 'miasma', job: 'freelancer', innate: 'breath',
    base: { hp: 72, mp: 8, str: 13, agi: 9, mag: 7, vit: 12, spr: 6 },
    grow: { hp: 13, mp: 1.0, str: 1.1, agi: 0.6, mag: 0.5, vit: 0.9, spr: 0.5 },
    equip: { weapon: 'ironclaws', head: null, body: 'leathervest', acc: null },
    bio: 'Dragon-blooded freelancer on contract with the Wardens. Believes in payment up front and mercy on a sliding scale.',
  },
  verai: {
    name: 'Verai', full: 'Verai Cudlar', img: 'verai', face: 'verai_face', look: 'verai', job: 'dawnsinger', innate: 'smoke',
    base: { hp: 50, mp: 20, str: 6, agi: 11, mag: 14, vit: 7, spr: 12 },
    grow: { hp: 8, mp: 2.4, str: 0.5, agi: 0.7, mag: 1.1, vit: 0.5, spr: 0.9 },
    equip: { weapon: 'ashstaff', head: null, body: 'wovenrobe', acc: 'greyscarf' },
    bio: 'Raine\'s younger sister. Gentle, kind, and followed everywhere by smoke that remembers a goddess nobody else does.',
  },
};
const EXP_TABLE = [0, 0, 24, 70, 140, 240, 380, 560, 800, 1100, 1480, 1950, 2520, 3200, 4000, 4950, 6050, 7300, 8750, 10400, 12300, 14400, 16800, 19500, 22500, 26000, 30000, 34500, 39500, 45000, 9999999];
const MAX_LEVEL = 30;
const JP_TABLE = [0, 0, 10, 28, 56, 96, 150, 220, 310];
const MAX_JOB_LV = 8;

// ---------------------------------------------------------------------------
// Jobs. Change them any time from the field menu.
// mult: stat multipliers. weapons/armor: equipment types allowed.
// learn: [jobLevel, skillId]
// ---------------------------------------------------------------------------
const JOBS = {
  freelancer: {
    name: 'Freelancer', god: 'No patron', cmd: null, color: '#c8c8d8',
    desc: 'Answers to nobody. Equips almost anything and levels up quickly.',
    mult: { hp: 1, mp: 1, str: 1, agi: 1, mag: 1, vit: 1, spr: 1 },
    weapons: ['sword', 'dagger', 'claw', 'axe', 'staff'], armor: ['light', 'robe', 'hat', 'helm'], learn: [], jpRate: 1.5,
  },
  oathblade: {
    name: 'Oathblade', god: 'Valerion', cmd: 'Oath', color: '#a8c8ff',
    desc: 'Valerion\'s sworn knight. High HP and defense. Shields weaker allies.',
    mult: { hp: 1.25, mp: 0.6, str: 1.15, agi: 0.95, mag: 0.7, vit: 1.25, spr: 0.9 },
    weapons: ['sword', 'spear', 'axe'], armor: ['heavy', 'light', 'helm'],
    learn: [[1, 'guard'], [3, 'valor'], [5, 'rally'], [7, 'honorbound']],
  },
  dawnsinger: {
    name: 'Dawnsinger', god: 'Sylara', cmd: 'Dawn', color: '#ffe890',
    desc: 'Sings Sylara\'s dawn-hymns. Healing, protection and holy light.',
    mult: { hp: 0.9, mp: 1.4, str: 0.7, agi: 1, mag: 1.15, vit: 0.9, spr: 1.3 },
    weapons: ['staff', 'rod'], armor: ['robe', 'hat'],
    learn: [[1, 'mend'], [2, 'purge'], [3, 'dawnward'], [4, 'mendall'], [5, 'kindle'], [6, 'mend2'], [7, 'radiance'], [8, 'newdawn']],
  },
  arcanist: {
    name: 'Arcanist', god: 'Myndra', cmd: 'Arcana', color: '#b8a0ff',
    desc: 'Scholar of Myndra\'s seven-pointed star. Elemental destruction.',
    mult: { hp: 0.8, mp: 1.5, str: 0.6, agi: 1, mag: 1.4, vit: 0.8, spr: 1.1 },
    weapons: ['rod', 'staff', 'dagger'], armor: ['robe', 'hat'],
    learn: [[1, 'spark'], [1, 'frost'], [2, 'bolt'], [3, 'lull'], [4, 'blaze'], [5, 'glacier'], [6, 'tempest'], [8, 'starfall']],
  },
  masquer: {
    name: 'Masquer', god: 'Malakar', cmd: 'Trick', color: '#ff9070',
    desc: 'Wears Malakar\'s split mask. Fast hands, faster feet.',
    mult: { hp: 0.95, mp: 0.8, str: 0.95, agi: 1.35, mag: 0.9, vit: 0.9, spr: 0.9 },
    weapons: ['dagger', 'sword'], armor: ['light', 'hat'],
    learn: [[1, 'steal'], [2, 'flee'], [4, 'mug'], [6, 'smokebomb'], [8, 'doublecut']],
  },
  tidecaller: {
    name: 'Tidecaller', god: 'Thalara', cmd: 'Tide', color: '#80d8e8',
    desc: 'Speaks for Thalara\'s sea. Water and wind, ebb and renewal.',
    mult: { hp: 1, mp: 1.2, str: 0.9, agi: 1.05, mag: 1.15, vit: 1, spr: 1.2 },
    weapons: ['staff', 'spear'], armor: ['light', 'robe', 'hat'],
    learn: [[1, 'undertow'], [2, 'regen'], [3, 'squall'], [5, 'riptide'], [6, 'tidalrenew'], [8, 'maelstrom']],
  },
  reaper: {
    name: 'Ash Reaper', god: 'Grimnar', cmd: 'Ash', color: '#e07050',
    desc: 'Grimnar\'s forge-reaper. Pays in blood to strike every foe.',
    mult: { hp: 1.15, mp: 0.6, str: 1.3, agi: 0.95, mag: 0.8, vit: 1.05, spr: 0.8 },
    weapons: ['sword', 'axe'], armor: ['heavy', 'helm'],
    learn: [[1, 'ashblade'], [3, 'pyre'], [5, 'finalgate'], [7, 'soulforge']],
  },
  wyrmblood: {
    name: 'Wyrmblood', god: 'Old blood', cmd: 'Wyrm', color: '#80e090',
    desc: 'Lets the dragon out. Leaps high and dives hard.',
    mult: { hp: 1.1, mp: 0.8, str: 1.2, agi: 1.1, mag: 0.8, vit: 1.1, spr: 0.9 },
    weapons: ['spear', 'claw'], armor: ['heavy', 'light', 'helm'],
    learn: [[1, 'jump'], [3, 'lancet'], [5, 'wyrmcry'], [7, 'skyfall']],
  },
};
const JOB_ORDER = ['freelancer', 'oathblade', 'dawnsinger', 'arcanist', 'masquer', 'tidecaller', 'reaper', 'wyrmblood'];

// Innate commands: each hero keeps theirs in every job. learn: [heroLevel, skillId]
const INNATE = {
  brew: { name: 'Brew', learn: [[1, 'tonicsplash'], [1, 'acidflask'], [5, 'flashpowder'], [10, 'quicksilver'], [15, 'elixirmist']] },
  breath: { name: 'Breath', learn: [[1, 'emberbreath'], [4, 'miasmacloud'], [9, 'winggale'], [14, 'dragonroar']] },
  smoke: { name: 'Smoke', learn: [[1, 'smokeveil'], [1, 'umbrabolt'], [5, 'dreamwisp'], [10, 'souldrain'], [15, 'nightfall']] },
};

// ---------------------------------------------------------------------------
// Skills. kind: dmg | heal | status | buff | cure | revive | drain | phys | steal | flee | mug | guard | jump | lancet | smokebomb
// target: enemy | enemies | ally | allies | self | dead
// ---------------------------------------------------------------------------
const SKILLS = {
  // Oathblade (Valerion)
  guard: { name: 'Guard', mp: 0, target: 'self', kind: 'guard', fx: 'buff', desc: 'Shield your allies. You take their physical hits until your next turn.' },
  valor: { name: 'Valor Strike', mp: 4, target: 'enemy', kind: 'phys', mult: 1.8, fx: 'slash', desc: 'A strike that never misses. 1.8x damage.' },
  rally: { name: 'Rally', mp: 8, target: 'allies', kind: 'buff', buff: 'protect', fx: 'buff', desc: 'Raise the party\'s defense.' },
  honorbound: { name: 'Honorbound', mp: 14, target: 'enemy', kind: 'phys', mult: 3.0, fx: 'holy', elem: 'holy', desc: 'Valerion\'s flame on the blade. 3x holy damage.' },
  // Dawnsinger (Sylara)
  mend: { name: 'Mend', mp: 3, target: 'ally', kind: 'heal', pow: 22, fx: 'heal', field: true, desc: 'Restore HP to one ally.' },
  purge: { name: 'Purge', mp: 4, target: 'ally', kind: 'cure', cures: ['poison', 'blind', 'sleep', 'fear'], fx: 'heal', field: true, desc: 'Cleanse poison, blind, sleep and fear.' },
  dawnward: { name: 'Dawnward', mp: 6, target: 'ally', kind: 'buff', buff: 'protect', fx: 'buff', desc: 'Sylara\'s ward. Defense up.' },
  mendall: { name: 'Mend Chorus', mp: 9, target: 'allies', kind: 'heal', pow: 18, fx: 'heal', field: true, desc: 'Restore HP to all allies.' },
  kindle: { name: 'Kindle', mp: 12, target: 'dead', kind: 'revive', fx: 'heal', field: true, desc: 'Rekindle a fallen ally.' },
  mend2: { name: 'Greater Mend', mp: 10, target: 'ally', kind: 'heal', pow: 70, fx: 'heal', field: true, desc: 'Restore a lot of HP to one ally.' },
  radiance: { name: 'Radiance', mp: 16, target: 'enemy', kind: 'dmg', elem: 'holy', pow: 70, fx: 'holy', desc: 'Pure dawn light on one foe.' },
  newdawn: { name: 'New Dawn', mp: 30, target: 'allies', kind: 'heal', pow: 80, fx: 'heal', field: true, cures: ['poison', 'blind', 'sleep', 'fear'], desc: 'Every day is a second chance. Heals and cleanses all.' },
  // Arcanist (Myndra)
  spark: { name: 'Spark', mp: 4, target: 'enemy', kind: 'dmg', elem: 'fire', pow: 16, fx: 'fire', desc: 'A lick of flame at one foe.' },
  frost: { name: 'Frost', mp: 4, target: 'enemy', kind: 'dmg', elem: 'ice', pow: 16, fx: 'ice', desc: 'Freezing shards at one foe.' },
  bolt: { name: 'Bolt', mp: 5, target: 'enemy', kind: 'dmg', elem: 'bolt', pow: 18, fx: 'bolt', desc: 'Lightning at one foe.' },
  lull: { name: 'Lull', mp: 5, target: 'enemies', kind: 'status', status: 'sleep', chance: 60, fx: 'smoke', desc: 'Put all foes to sleep.' },
  blaze: { name: 'Blaze', mp: 12, target: 'enemies', kind: 'dmg', elem: 'fire', pow: 30, fx: 'fire', desc: 'Fire on all foes.' },
  glacier: { name: 'Glacier', mp: 12, target: 'enemies', kind: 'dmg', elem: 'ice', pow: 30, fx: 'ice', desc: 'Ice on all foes.' },
  tempest: { name: 'Tempest', mp: 14, target: 'enemies', kind: 'dmg', elem: 'bolt', pow: 34, fx: 'bolt', desc: 'Lightning on all foes.' },
  starfall: { name: 'Starfall', mp: 28, target: 'enemies', kind: 'dmg', elem: 'star', pow: 60, fx: 'light', desc: 'Myndra reads your fate in the stars. Theirs is worse.' },
  // Masquer (Malakar)
  steal: { name: 'Steal', mp: 0, target: 'enemy', kind: 'steal', fx: 'slash', desc: 'Lift an item from a foe.' },
  flee: { name: 'Flee', mp: 0, target: 'self', kind: 'flee', fx: 'smoke', desc: 'Escape any non-boss battle.' },
  mug: { name: 'Mug', mp: 0, target: 'enemy', kind: 'mug', fx: 'slash', desc: 'Attack and steal at the same time.' },
  smokebomb: { name: 'Smoke Bomb', mp: 6, target: 'enemies', kind: 'status', status: 'blind', chance: 75, fx: 'smoke', desc: 'Blind all foes.' },
  doublecut: { name: 'Double Cut', mp: 8, target: 'enemy', kind: 'phys', mult: 1.1, hits: 2, fx: 'slash', desc: 'Two quick cuts.' },
  // Tidecaller (Thalara)
  undertow: { name: 'Undertow', mp: 6, target: 'enemies', kind: 'dmg', elem: 'water', pow: 16, fx: 'water', desc: 'Drag all foes under.' },
  regen: { name: 'Regen', mp: 6, target: 'ally', kind: 'buff', buff: 'regen', fx: 'heal', desc: 'The tide restores HP over time.' },
  squall: { name: 'Squall', mp: 9, target: 'enemies', kind: 'dmg', elem: 'wind', pow: 24, fx: 'wind', desc: 'Sea wind cuts all foes.' },
  riptide: { name: 'Riptide', mp: 12, target: 'enemy', kind: 'dmg', elem: 'water', pow: 55, fx: 'water', desc: 'A crushing wave on one foe.' },
  tidalrenew: { name: 'Tidal Renewal', mp: 16, target: 'allies', kind: 'heal', pow: 30, buff: 'regen', fx: 'water', field: true, desc: 'Heal all allies and grant Regen.' },
  maelstrom: { name: 'Maelstrom', mp: 30, target: 'enemies', kind: 'dmg', elem: 'water', pow: 66, fx: 'water', desc: 'Thalara\'s wrath.' },
  // Ash Reaper (Grimnar)
  ashblade: { name: 'Ashblade', mp: 0, hpCost: 0.1, target: 'enemies', kind: 'phys', mult: 1.0, fx: 'dark', elem: 'dark', desc: 'Costs 10% max HP. Cuts every foe.' },
  pyre: { name: 'Funeral Pyre', mp: 8, target: 'enemy', kind: 'drain', elem: 'fire', pow: 34, fx: 'fire', desc: 'Burn a foe and take its warmth.' },
  finalgate: { name: 'Final Gate', mp: 14, target: 'enemy', kind: 'status', status: 'doom', chance: 45, fx: 'dark', desc: 'Show a foe the Final Gate. Bosses refuse.' },
  soulforge: { name: 'Soulforge', mp: 0, hpCost: 0.25, target: 'enemy', kind: 'phys', mult: 3.2, fx: 'fire', elem: 'fire', desc: 'Costs 25% max HP. Reforge a foe in ash.' },
  // Wyrmblood
  jump: { name: 'Jump', mp: 0, target: 'enemy', kind: 'jump', mult: 2.2, fx: 'slash', desc: 'Leap out of reach, then land for 2.2x damage.' },
  lancet: { name: 'Lancet', mp: 0, target: 'enemy', kind: 'lancet', pow: 1.0, fx: 'dark', desc: 'Bite a foe. Drain HP and MP.' },
  wyrmcry: { name: 'Wyrm Cry', mp: 10, target: 'enemies', kind: 'status', status: 'fear', chance: 70, fx: 'roar', desc: 'Terrify every foe. Their attacks weaken.' },
  skyfall: { name: 'Skyfall', mp: 0, target: 'enemy', kind: 'jump', mult: 3.4, fx: 'slash', desc: 'A jump so high it has weather.' },
  // Raine: Brew
  tonicsplash: { name: 'Tonic Splash', mp: 2, target: 'ally', kind: 'heal', pow: 16, fx: 'heal', field: true, desc: 'A splash of home-brewed tonic.' },
  acidflask: { name: 'Acid Flask', mp: 3, target: 'enemy', kind: 'dmg', elem: 'acid', pow: 18, pierce: true, fx: 'acid', desc: 'Ignores magic defense. Eats armor.' },
  flashpowder: { name: 'Flash Powder', mp: 5, target: 'enemies', kind: 'status', status: 'blind', chance: 65, fx: 'light', desc: 'A bright bang. Blinds all foes.' },
  quicksilver: { name: 'Quicksilver', mp: 10, target: 'ally', kind: 'buff', buff: 'haste', fx: 'buff', desc: 'Haste. The ally\'s turns come faster.' },
  elixirmist: { name: 'Elixir Mist', mp: 22, target: 'allies', kind: 'heal', pow: 50, fx: 'heal', field: true, desc: 'A fog of her best recipe. Heals everyone.' },
  // Miasma: Breath
  emberbreath: { name: 'Ember Breath', mp: 5, target: 'enemies', kind: 'dmg', elem: 'fire', pow: 13, fx: 'fire', desc: 'Fire on all foes.' },
  miasmacloud: { name: 'Miasma Cloud', mp: 8, target: 'enemies', kind: 'dmg', elem: 'poison', pow: 14, status: 'poison', chance: 65, fx: 'poison', desc: 'Toxic mist. Damages and poisons.' },
  winggale: { name: 'Wing Gale', mp: 11, target: 'enemies', kind: 'dmg', elem: 'wind', pow: 28, fx: 'wind', desc: 'Beat the wings. Wind on all foes.' },
  dragonroar: { name: 'Dragon Roar', mp: 16, target: 'enemies', kind: 'dmg', elem: 'fire', pow: 46, status: 'fear', chance: 50, fx: 'roar', desc: 'Fire and terror.' },
  // Verai: Smoke
  smokeveil: { name: 'Smoke Veil', mp: 4, target: 'enemies', kind: 'status', status: 'sleep', chance: 55, fx: 'smoke', desc: 'Lull all foes to sleep.' },
  umbrabolt: { name: 'Umbra Bolt', mp: 4, target: 'enemy', kind: 'dmg', elem: 'dark', pow: 18, fx: 'dark', desc: 'A bolt of old night.' },
  dreamwisp: { name: 'Dreamwisp', mp: 6, target: 'ally', kind: 'heal', pow: 30, cures: ['sleep', 'fear'], fx: 'smoke', field: true, desc: 'A kind dream. Heals and calms.' },
  souldrain: { name: 'Soul Drain', mp: 12, target: 'enemy', kind: 'drain', elem: 'dark', pow: 44, fx: 'dark', desc: 'Drink a foe\'s life.' },
  nightfall: { name: 'Nightfall', mp: 20, target: 'enemies', kind: 'dmg', elem: 'dark', pow: 48, fx: 'dark', desc: 'The night that was stolen, returned.' },
};

// ---------------------------------------------------------------------------
// Items & equipment
// ---------------------------------------------------------------------------
const ITEMS = {
  tonic: { name: 'Tonic', price: 40, kind: 'heal', pow: 50, target: 'ally', battle: true, field: true, desc: 'Restores 50 HP.' },
  hitonic: { name: 'Hi-Tonic', price: 180, kind: 'heal', pow: 180, target: 'ally', battle: true, field: true, desc: 'Restores 180 HP.' },
  ether: { name: 'Ether', price: 300, kind: 'mp', pow: 40, target: 'ally', battle: true, field: true, desc: 'Restores 40 MP.' },
  antidote: { name: 'Antidote', price: 30, kind: 'cure', cures: ['poison'], target: 'ally', battle: true, field: true, desc: 'Cures poison.' },
  eyedrop: { name: 'Eye Drops', price: 30, kind: 'cure', cures: ['blind'], target: 'ally', battle: true, field: true, desc: 'Cures blindness.' },
  bellflower: { name: 'Bellflower', price: 50, kind: 'cure', cures: ['sleep', 'fear'], target: 'ally', battle: true, field: true, desc: 'Its scent wakes the sleeping and calms the afraid.' },
  emberplume: { name: 'Emberplume', price: 200, kind: 'revive', target: 'dead', battle: true, field: true, desc: 'A phoenix feather, still warm. Revives a fallen ally.' },
  bedroll: { name: 'Bedroll', price: 120, kind: 'camp', target: 'none', battle: false, field: true, desc: 'World map or Dawn Lantern only. Restores HP and MP.' },
  flashbomb: { name: 'Gunpowder Jar', price: 150, kind: 'bomb', pow: 45, target: 'enemies', battle: true, field: false, desc: 'Kharak Yr blackpowder. 45-90 damage to all foes.' },
  sylarasun: { name: 'Sunsalt', price: 0, kind: 'cure', cures: ['poison', 'blind', 'sleep', 'fear'], target: 'ally', battle: true, field: true, desc: 'Blessed salt. Cures every ailment.' },
};
const KEY_ITEMS = {
  veillantern: { name: 'Veil Lantern', desc: 'A Nyxian relic seized from Moonshadow Cove. Its flame burns violet and does not flicker.' },
  censer: { name: 'Dawn Censer', desc: 'A sealed golden censer from the High Luminar. It is warm. It is humming.' },
  stagantler: { name: 'Veilstag Antler', desc: 'A broken antler from the Veilstag. Smoke still curls from the break.' },
  harborpass: { name: 'Harbor Pass', desc: 'Signed by Brightwater\'s harbormaster. Lets you enter the Tower of Dawn.' },
  wrenkey: { name: 'The Wren', desc: 'A little sailing skiff with a patched red sail. Sail it on seas and rivers.' },
  sunlens: { name: 'Sunlens', desc: 'The Tower of Dawn\'s crystal lens, taken back from the Chimera.' },
  heartseed: { name: 'Heartseed', desc: 'Elaris\'s reliquary. A seed that beats like a heart.' },
};

// Equipment. slot: weapon | head | body | acc. type limits which jobs can equip it.
const EQUIP = {
  // swords
  wardensword: { name: 'Warden Sword', slot: 'weapon', type: 'sword', atk: 12, hit: 90, price: 0, desc: 'Standard issue for the Lantern Wardens.' },
  broadsword: { name: 'Broadsword', slot: 'weapon', type: 'sword', atk: 18, hit: 88, price: 280 },
  dawnblade: { name: 'Dawnblade', slot: 'weapon', type: 'sword', atk: 26, hit: 92, elem: 'holy', price: 900 },
  oathkeeper: { name: 'Oathkeeper', slot: 'weapon', type: 'sword', atk: 36, hit: 95, str: 3, price: 0, desc: 'Valerion\'s sigil burns on the hilt.' },
  // daggers
  knife: { name: 'Knife', slot: 'weapon', type: 'dagger', atk: 8, hit: 98, price: 60 },
  maskdagger: { name: 'Mask Dagger', slot: 'weapon', type: 'dagger', atk: 16, hit: 99, agi: 2, price: 420 },
  twilightdirk: { name: 'Twilight Dirk', slot: 'weapon', type: 'dagger', atk: 24, hit: 99, agi: 3, price: 0, desc: 'Found in the wreck of Nyxia\'s shrine.' },
  // claws
  ironclaws: { name: 'Iron Claws', slot: 'weapon', type: 'claw', atk: 11, hit: 88, price: 90 },
  cinderclaws: { name: 'Cinder Claws', slot: 'weapon', type: 'claw', atk: 19, hit: 88, elem: 'fire', price: 480 },
  wyrmtalons: { name: 'Wyrm Talons', slot: 'weapon', type: 'claw', atk: 30, hit: 90, str: 2, price: 0 },
  // spears
  pike: { name: 'Pike', slot: 'weapon', type: 'spear', atk: 15, hit: 90, price: 220 },
  tidespear: { name: 'Tide Spear', slot: 'weapon', type: 'spear', atk: 22, hit: 92, elem: 'water', price: 700 },
  // axes
  handaxe: { name: 'Hand Axe', slot: 'weapon', type: 'axe', atk: 16, hit: 80, price: 200 },
  gravecleaver: { name: 'Grave Cleaver', slot: 'weapon', type: 'axe', atk: 30, hit: 82, elem: 'dark', price: 1100 },
  // staves & rods
  ashstaff: { name: 'Ash Staff', slot: 'weapon', type: 'staff', atk: 6, hit: 85, mag: 2, price: 50 },
  dawnstaff: { name: 'Dawn Staff', slot: 'weapon', type: 'staff', atk: 9, hit: 85, mag: 5, spr: 3, price: 380 },
  blossomstaff: { name: 'Blossom Staff', slot: 'weapon', type: 'staff', atk: 12, hit: 85, mag: 9, spr: 5, price: 0, desc: 'Grew itself in Elaris\'s valley.' },
  starrod: { name: 'Star Rod', slot: 'weapon', type: 'rod', atk: 7, hit: 85, mag: 6, price: 400 },
  sagerod: { name: 'Sage\'s Rod', slot: 'weapon', type: 'rod', atk: 10, hit: 85, mag: 11, price: 1000 },
  // head
  cap: { name: 'Leather Cap', slot: 'head', type: 'hat', def: 2, price: 50 },
  featherhat: { name: 'Feathered Hat', slot: 'head', type: 'hat', def: 3, mdef: 3, price: 220 },
  ironhelm: { name: 'Iron Helm', slot: 'head', type: 'helm', def: 5, price: 260 },
  sunhelm: { name: 'Sunward Helm', slot: 'head', type: 'helm', def: 8, mdef: 3, price: 800 },
  circlet: { name: 'Circlet', slot: 'head', type: 'hat', def: 4, mdef: 6, mag: 2, price: 700 },
  // body
  wardencoat: { name: 'Warden Coat', slot: 'body', type: 'light', def: 8, mdef: 2, price: 0, desc: 'Black, long, and far too warm for Aurelion.' },
  leathervest: { name: 'Leather Vest', slot: 'body', type: 'light', def: 6, price: 80 },
  wovenrobe: { name: 'Woven Robe', slot: 'body', type: 'robe', def: 3, mdef: 5, price: 70 },
  chainmail: { name: 'Chain Mail', slot: 'body', type: 'heavy', def: 14, price: 400 },
  brigandine: { name: 'Brigandine', slot: 'body', type: 'light', def: 12, mdef: 3, price: 420 },
  sagerobe: { name: 'Sage Robe', slot: 'body', type: 'robe', def: 7, mdef: 10, price: 450 },
  platemail: { name: 'Dawnplate', slot: 'body', type: 'heavy', def: 24, mdef: 4, price: 1300 },
  tidecoat: { name: 'Tidecoat', slot: 'body', type: 'light', def: 18, mdef: 8, price: 1100 },
  dreamsilk: { name: 'Dreamsilk', slot: 'body', type: 'robe', def: 12, mdef: 18, price: 0, desc: 'Woven from smoke that remembers.' },
  // accessories (any job)
  crescent: { name: 'Crescent Pendant', slot: 'acc', type: 'acc', def: 1, mdef: 2, luck: 1, price: 0, desc: 'Raine\'s crescent moon. Old gold. Warm, sometimes.' },
  greyscarf: { name: 'Grey Scarf', slot: 'acc', type: 'acc', mdef: 4, mag: 2, price: 0, desc: 'Soft and warm. Smells of smoke.' },
  bronzering: { name: 'Bronze Ring', slot: 'acc', type: 'acc', def: 2, price: 100 },
  lanternpin: { name: 'Lantern Pin', slot: 'acc', type: 'acc', def: 1, mdef: 6, price: 350 },
  tidecharm: { name: 'Tide Charm', slot: 'acc', type: 'acc', mdef: 4, spr: 4, immune: ['poison'], price: 600, desc: 'Prevents poison.' },
  embercharm: { name: 'Ember Charm', slot: 'acc', type: 'acc', def: 3, str: 4, price: 0, desc: 'Warm to the touch. Str +4.' },
  bellcharm: { name: 'Bell Charm', slot: 'acc', type: 'acc', mdef: 3, immune: ['sleep'], price: 500, desc: 'Prevents sleep.' },
};
function itemInfo(id) { return ITEMS[id] || EQUIP[id] || KEY_ITEMS[id]; }

// ---------------------------------------------------------------------------
// Monsters. art: m_<art> or b_<art> image. tint recolors reused art.
// acts: weighted actions. act types: attack | strike | spell | status | drain | heal | buff | summon | talk
// ---------------------------------------------------------------------------
const ENEMIES = {
  // River & plains near Solanthia
  lurker: { name: 'River Lurker', art: 'fishman', tint: { h: 40, s: 0.8 }, hp: 34, atk: 15, def: 3, mdef: 2, agi: 8, exp: 8, jp: 1, gold: 12, weak: ['bolt'], resist: ['water'], steal: 'tonic' },
  eel: { name: 'Lamp Eel', art: 'slime', tint: { h: 150, s: 1.2 }, hp: 26, atk: 13, def: 1, mdef: 4, agi: 12, exp: 6, jp: 1, gold: 8, weak: ['bolt'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'spell', name: 'Glowspit', target: 'one', pow: 9, elem: 'bolt', fx: 'bolt' }] },
  gel: { name: 'Dew Gel', art: 'slime', hp: 30, atk: 14, def: 1, mdef: 1, agi: 5, exp: 7, jp: 1, gold: 8, weak: ['fire'], steal: 'tonic' },
  hob: { name: 'Hobgoblin Scout', art: 'goblin', tint: { h: -30, s: 1.1 }, hp: 38, atk: 16, def: 3, mdef: 1, agi: 9, exp: 10, jp: 1, gold: 16, steal: 'antidote' },
  wolf: { name: 'Plains Wolf', art: 'wolf', tint: { h: 20, s: 0.6, l: 1.1, all: true }, hp: 44, atk: 17, def: 2, mdef: 1, agi: 14, exp: 12, jp: 1, gold: 12 },
  // Silverleaf Wood
  mothwing: { name: 'Veilmoth', art: 'bat', tint: { h: 200, s: 0.7, l: 1.2 }, hp: 44, atk: 21, def: 2, mdef: 6, agi: 18, exp: 14, jp: 2, gold: 14, weak: ['wind', 'fire'], touch: { status: 'sleep', chance: 20 }, steal: 'bellflower' },
  silverwolf: { name: 'Silverleaf Wolf', art: 'wolf', tint: { h: 0, s: 0.2, l: 1.4, all: true }, hp: 70, atk: 27, def: 4, mdef: 2, agi: 16, exp: 18, jp: 2, gold: 18 },
  wisp: { name: 'Dream Wisp', art: 'wisp', tint: { h: 200 }, hp: 40, atk: 18, def: 2, mdef: 12, agi: 20, exp: 16, jp: 2, gold: 20, weak: ['holy'], resist: ['dark'], acts: [{ w: 2, type: 'attack' }, { w: 2, type: 'spell', name: 'Nightglow', target: 'one', pow: 12, elem: 'dark', fx: 'dark' }] },
  thornling: { name: 'Thornling', art: 'imp', tint: { h: 100, s: 1.2 }, hp: 60, atk: 24, def: 5, mdef: 3, agi: 10, exp: 17, jp: 2, gold: 22, weak: ['fire'], touch: { status: 'poison', chance: 25 }, steal: 'antidote' },
  webber: { name: 'Silkweaver', art: 'spider', tint: { h: 180, s: 0.5, l: 1.3 }, hp: 64, atk: 26, def: 4, mdef: 4, agi: 13, exp: 18, jp: 2, gold: 20, touch: { status: 'poison', chance: 30 }, steal: 'antidote' },
  // Burned Hollowmere & Dreamer's Pass
  cinderimp: { name: 'Gilded Imp', art: 'imp', tint: { h: 20, s: 1.2, l: 1.2 }, hp: 80, atk: 32, def: 6, mdef: 6, agi: 12, exp: 24, jp: 3, gold: 30, resist: ['fire', 'holy'], weak: ['dark', 'water'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'spell', name: 'Sunflick', target: 'one', pow: 14, elem: 'holy', fx: 'holy' }], steal: 'tonic' },
  ashhound: { name: 'Ash Hound', art: 'wolf', tint: { h: 0, s: 0.3, l: 0.6, all: true }, hp: 100, atk: 36, def: 5, mdef: 3, agi: 17, exp: 26, jp: 3, gold: 26, weak: ['water'], resist: ['fire'] },
  // Goldengrove plains & coast
  lizard: { name: 'Sunback Lizard', art: 'lizard', tint: { h: 20, s: 1.1 }, hp: 170, atk: 46, def: 10, mdef: 3, agi: 8, exp: 30, jp: 3, gold: 40, weak: ['ice', 'acid'] },
  toad: { name: 'Meadow Toad', art: 'toad', tint: { h: -40 }, hp: 130, atk: 42, def: 6, mdef: 5, agi: 9, exp: 26, jp: 3, gold: 30, weak: ['ice'], touch: { status: 'poison', chance: 25 }, steal: 'antidote' },
  zealot: { name: 'Lantern Zealot', art: 'pirate', tint: { h: 50, s: 0.8, l: 1.15 }, hp: 140, atk: 44, def: 8, mdef: 6, agi: 12, exp: 34, jp: 3, gold: 50, weak: ['dark'], resist: ['holy'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'heal', name: 'Dawn Prayer', pow: 50, when: 'hurt' }], steal: 'lanternpin' },
  crab: { name: 'Brine Crab', art: 'spider', tint: { h: -30, s: 1.3 }, hp: 170, atk: 50, def: 16, mdef: 4, agi: 7, exp: 32, jp: 3, gold: 38, weak: ['bolt'], resist: ['water'] },
  // Tower of Dawn
  gilder: { name: 'Gilded Sentinel', art: 'skeleton', tint: { h: 30, s: 1.4, l: 1.1 }, hp: 220, atk: 56, def: 14, mdef: 8, agi: 10, exp: 44, jp: 4, gold: 60, weak: ['dark', 'water'], resist: ['holy'], undead: false },
  sunwisp: { name: 'Sunwisp', art: 'wisp', tint: { h: 40, s: 1.4 }, hp: 140, atk: 46, def: 6, mdef: 16, agi: 24, exp: 40, jp: 4, gold: 50, weak: ['dark'], resist: ['holy', 'fire'], acts: [{ w: 2, type: 'attack' }, { w: 2, type: 'spell', name: 'Glare', target: 'one', pow: 20, elem: 'holy', fx: 'holy' }, { w: 1, type: 'status', name: 'Dazzle', status: 'blind', chance: 50, fx: 'light' }] },
  gullharpy: { name: 'Gull Harpy', art: 'bat', tint: { h: 30, s: 0.3, l: 1.5, all: true }, hp: 150, atk: 50, def: 6, mdef: 6, agi: 26, exp: 42, jp: 4, gold: 44, weak: ['bolt', 'wind'] },
  // Sea
  tidelurker: { name: 'Tidelurker', art: 'fishman', hp: 190, atk: 54, def: 9, mdef: 6, agi: 14, exp: 46, jp: 4, gold: 50, weak: ['bolt'], resist: ['water'] },
  // Elaris's Embrace
  bloomling: { name: 'Bloomling', art: 'slime', tint: { h: 230, s: 1.3 }, hp: 200, atk: 60, def: 8, mdef: 10, agi: 12, exp: 50, jp: 5, gold: 50, weak: ['fire', 'ice'], touch: { status: 'sleep', chance: 20 }, steal: 'bellflower' },
  thornwolf: { name: 'Briar Wolf', art: 'wolf', tint: { h: 250, s: 1.5, all: true }, hp: 220, atk: 64, def: 9, mdef: 6, agi: 22, exp: 56, jp: 5, gold: 58, weak: ['fire'] },
  mossogre: { name: 'Moss Ogre', art: 'ogre', tint: { h: 70, s: 1.3 }, hp: 460, atk: 74, def: 12, mdef: 6, agi: 8, exp: 90, jp: 6, gold: 120, weak: ['fire'], steal: 'hitonic' },
  pollenshade: { name: 'Pollen Shade', art: 'shade', tint: { h: 90, s: 1.3, l: 1.2 }, hp: 210, atk: 58, def: 8, mdef: 14, agi: 20, exp: 60, jp: 5, gold: 66, weak: ['fire', 'holy'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'status', name: 'Sleep Pollen', target: 'all', status: 'sleep', chance: 40, fx: 'smoke' }, { w: 1, type: 'spell', name: 'Thornburst', target: 'all', pow: 16, elem: 'earth', fx: 'poison' }] },

  // ------------------------------------------------------------------ bosses
  veilstag: {
    name: 'The Veilstag', art: 'veilstag', boss: true, hp: 720, atk: 26, def: 6, mdef: 10, agi: 14, exp: 400, jp: 8, gold: 400, weak: ['fire', 'holy'], resist: ['dark'],
    immune: ['sleep', 'fear', 'doom', 'blind'],
    acts: [{ w: 4, type: 'attack' }, { w: 2, type: 'strike', name: 'Antler Rake', mult: 1.5, fx: 'slash' }, { w: 2, type: 'spell', name: 'Veil Pulse', target: 'all', pow: 14, elem: 'dark', fx: 'dark' }],
    phase2: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Veil Pulse', target: 'all', pow: 16, elem: 'dark', fx: 'dark' }, { w: 2, type: 'status', name: 'Dream Fog', target: 'all', status: 'sleep', chance: 35, fx: 'smoke' }],
    lines: { half: 'The Veilstag\'s cracks flare teal. Smoke pours from its ribs.' },
  },
  votary: {
    name: 'Sunscarred Votary', art: 'votary', boss: true, hp: 1150, atk: 28, def: 10, mdef: 16, agi: 16, exp: 900, jp: 10, gold: 800, weak: ['dark', 'water'], resist: ['holy', 'fire'],
    immune: ['sleep', 'fear', 'doom', 'poison'],
    acts: [{ w: 3, type: 'attack' }, { w: 3, type: 'spell', name: 'Searing Hymn', target: 'all', pow: 18, elem: 'holy', fx: 'holy' }, { w: 2, type: 'spell', name: 'Gilded Brand', target: 'one', pow: 32, elem: 'fire', fx: 'fire' }, { w: 1, type: 'status', name: 'Blinding Halo', target: 'all', status: 'blind', chance: 45, fx: 'light' }],
    phase2: [{ w: 3, type: 'attack' }, { w: 3, type: 'spell', name: 'Searing Hymn', target: 'all', pow: 22, elem: 'holy', fx: 'holy' }, { w: 2, type: 'spell', name: 'Pyre of Faith', target: 'all', pow: 26, elem: 'fire', fx: 'fire' }, { w: 1, type: 'heal', name: 'Borrowed Prayer', pow: 160, uses: 2 }],
    lines: { start: '"Rejoice, little heretics. The Light has come home."', half: '"Why do you not REJOICE?"' },
  },
  chimera: {
    name: 'Sunforged Chimera', art: 'chimera', boss: true, hp: 2300, atk: 27, def: 14, mdef: 12, agi: 18, exp: 1600, jp: 12, gold: 1500, weak: ['water', 'ice'], resist: ['fire', 'holy'], actions: 2,
    immune: ['sleep', 'fear', 'doom', 'poison'],
    acts: [{ w: 4, type: 'attack' }, { w: 2, type: 'strike', name: 'Lion\'s Maul', mult: 1.6, fx: 'slash' }, { w: 2, type: 'spell', name: 'Dragonhead Flame', target: 'all', pow: 22, elem: 'fire', fx: 'fire' }, { w: 2, type: 'status', name: 'Serpent Fang', target: 'one', status: 'poison', chance: 80, fx: 'poison' }],
    phase2: [{ w: 3, type: 'attack' }, { w: 3, type: 'spell', name: 'Three-Headed Roar', target: 'all', pow: 26, elem: 'fire', fx: 'roar' }, { w: 2, type: 'strike', name: 'Lion\'s Maul', mult: 1.8, fx: 'slash' }],
    lines: { start: 'The stitched beast wears three halos. All three heads are screaming.', half: 'The stitches along its flank split. Gold light bleeds out.' },
  },
  bloomcolossus: {
    name: 'Bloomheart Colossus', art: 'bloomcolossus', boss: true, hp: 3200, atk: 40, def: 18, mdef: 14, agi: 12, exp: 2600, jp: 14, gold: 2200, weak: ['fire'], resist: ['earth', 'water'],
    immune: ['sleep', 'fear', 'doom', 'poison', 'blind'],
    acts: [{ w: 4, type: 'attack' }, { w: 2, type: 'strike', name: 'Stoneroot Slam', mult: 1.7, fx: 'boom' }, { w: 2, type: 'spell', name: 'Petal Storm', target: 'all', pow: 24, elem: 'earth', fx: 'poison' }, { w: 1, type: 'status', name: 'Lullaby Bloom', target: 'all', status: 'sleep', chance: 40, fx: 'smoke' }],
    phase2: [{ w: 3, type: 'attack' }, { w: 2, type: 'strike', name: 'Stoneroot Slam', mult: 2, fx: 'boom' }, { w: 2, type: 'spell', name: 'Petal Storm', target: 'all', pow: 30, elem: 'earth', fx: 'poison' }, { w: 1, type: 'heal', name: 'Rootdrink', pow: 300, uses: 2 }],
    lines: { start: 'The purple bloom on its shoulder opens like an eye.', half: 'It is not angry. It is grieving. That is worse.' },
  },
  sonia: {
    name: 'Sonia, the Unseated', art: 'sonia', boss: true, hp: 99999, atk: 60, def: 50, mdef: 50, agi: 30, exp: 0, jp: 0, gold: 0, immune: ['sleep', 'fear', 'doom', 'poison', 'blind'],
    acts: [{ w: 2, type: 'spell', name: 'Stolen Night', target: 'all', pow: 40, elem: 'dark', fx: 'dark' }, { w: 2, type: 'spell', name: 'Borrowed Dawn', target: 'all', pow: 40, elem: 'holy', fx: 'holy' }, { w: 1, type: 'strike', name: 'Ninefold Claw', mult: 2, fx: 'slash' }],
  },
};

// Encounter formations by zone: [enemyId, min, max]
const FORMATIONS = {
  barge: [{ w: 1, e: [['lurker', 2, 2]] }],
  aurel: [{ w: 3, e: [['gel', 2, 3]] }, { w: 3, e: [['hob', 1, 3]] }, { w: 2, e: [['wolf', 1, 2]] }, { w: 2, e: [['hob', 1, 1], ['gel', 1, 2]] }],
  river: [{ w: 3, e: [['lurker', 1, 3]] }, { w: 2, e: [['eel', 2, 3]] }],
  silverleaf: [{ w: 3, e: [['mothwing', 2, 3]] }, { w: 3, e: [['silverwolf', 1, 2]] }, { w: 2, e: [['wisp', 2, 3]] }, { w: 2, e: [['thornling', 1, 2], ['mothwing', 1, 1]] }, { w: 2, e: [['webber', 1, 3]] }],
  hollow: [{ w: 3, e: [['cinderimp', 1, 3]] }, { w: 3, e: [['ashhound', 1, 2]] }, { w: 1, e: [['cinderimp', 1, 1], ['ashhound', 1, 1]] }],
  meadow: [{ w: 3, e: [['toad', 1, 3]] }, { w: 2, e: [['lizard', 1, 2]] }, { w: 2, e: [['wolf', 2, 3]] }, { w: 2, e: [['zealot', 1, 2]] }],
  coast: [{ w: 3, e: [['crab', 1, 2]] }, { w: 2, e: [['zealot', 1, 2]] }, { w: 2, e: [['gullharpy', 1, 2]] }, { w: 1, e: [['crab', 1, 1], ['gullharpy', 1, 1]] }],
  tower: [{ w: 3, e: [['gilder', 1, 2]] }, { w: 3, e: [['sunwisp', 2, 3]] }, { w: 2, e: [['gullharpy', 2, 3]] }, { w: 1, e: [['gilder', 1, 1], ['sunwisp', 1, 2]] }],
  sea: [{ w: 3, e: [['tidelurker', 1, 3]] }, { w: 1, e: [['crab', 2, 2]] }],
  embrace: [{ w: 3, e: [['bloomling', 2, 3]] }, { w: 3, e: [['thornwolf', 1, 3]] }, { w: 2, e: [['pollenshade', 1, 2]] }, { w: 1, e: [['mossogre', 1, 1]] }, { w: 1, e: [['mossogre', 1, 1], ['bloomling', 1, 2]] }],
};

// Shops ------------------------------------------------------------------------
const SHOPS = {
  solanthia: { weapon: ['knife', 'ironclaws', 'ashstaff', 'broadsword', 'handaxe', 'pike'], armor: ['cap', 'leathervest', 'wovenrobe', 'ironhelm', 'bronzering'], item: ['tonic', 'antidote', 'eyedrop', 'bellflower', 'bedroll', 'emberplume'], inn: 20, chapel: 20 },
  hollowmere: { item: ['tonic', 'antidote', 'bellflower', 'emberplume', 'bedroll'] },
  goldengrove: { weapon: ['broadsword', 'maskdagger', 'pike', 'dawnstaff', 'starrod'], armor: ['featherhat', 'ironhelm', 'chainmail', 'brigandine', 'sagerobe', 'bronzering'], item: ['tonic', 'hitonic', 'antidote', 'eyedrop', 'bellflower', 'emberplume', 'bedroll'], inn: 40, chapel: 40 },
  brightwater: { weapon: ['maskdagger', 'cinderclaws', 'tidespear', 'dawnblade', 'gravecleaver', 'sagerod'], armor: ['sunhelm', 'circlet', 'platemail', 'tidecoat', 'sagerobe', 'lanternpin', 'tidecharm', 'bellcharm'], item: ['tonic', 'hitonic', 'ether', 'antidote', 'eyedrop', 'bellflower', 'emberplume', 'bedroll', 'flashbomb'], inn: 80, chapel: 60 },
};
