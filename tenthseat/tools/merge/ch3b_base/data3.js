'use strict';
// ---------------------------------------------------------------------------
// Chapter Three data: the Dragon job, Frostreach gear, the Wyrmspire's monsters and bosses.
// Party-of-three fights: the Wyrmspire is climbed by Miasma and two friends while Raine is ill.
// ---------------------------------------------------------------------------

// ---- The Dragon job: Miasma's true power, remembered at the top of the Wyrmspire ----
Object.assign(JOBS, {
  dragon: {
    name: 'Dragon', god: 'The Old Sky', cmd: 'Dragon', color: '#ff5a40',
    desc: 'Not dragon-BLOODED. Dragon. Claws, scales, fire, and wings that remember the whole sky.',
    mult: { hp: 1.25, mp: 1.0, str: 1.3, agi: 1.0, mag: 1.1, vit: 1.2, spr: 1.0 },
    weapons: ['claw', 'axe', 'spear'], armor: ['heavy', 'light', 'helm'],
    learn: [[1, 'dragonclaw'], [2, 'scaleward'], [3, 'crimsonbreath'], [5, 'wingstorm'], [6, 'dragonheart'], [8, 'oldskywrath']],
  },
});
JOB_ORDER.push('dragon');

Object.assign(SKILLS, {
  dragonclaw: { name: 'Dragon Claw', mp: 4, target: 'enemy', kind: 'phys', mult: 1.8, fx: 'slash', desc: 'Four talons, one very bad day. 1.8x damage.' },
  scaleward: { name: 'Scale Ward', mp: 8, target: 'allies', kind: 'buff', buff: 'protect', fx: 'buff', desc: 'Shed scales harden around the whole party. Defense up.' },
  crimsonbreath: { name: 'Crimson Breath', mp: 14, target: 'enemies', kind: 'dmg', elem: 'fire', pow: 46, fx: 'fire', desc: 'Real dragonfire, not the hiccup kind. Fire on all foes.' },
  wingstorm: { name: 'Wingstorm', mp: 12, target: 'enemies', kind: 'phys', mult: 1.3, elem: 'wind', fx: 'wind', desc: 'One beat of the wings flattens everything in front of you.' },
  dragonheart: { name: 'Dragonheart', mp: 10, target: 'self', kind: 'buff', buff: 'might', fx: 'roar', desc: 'Your attacks hit 50% harder for the rest of the battle.' },
  oldskywrath: { name: 'Wrath of the Old Sky', mp: 36, target: 'enemies', kind: 'dmg', elem: 'fire', pow: 92, fx: 'fire', desc: 'The sky remembers when dragons ruled it. So does everything under it.' },
});

// ---- Items and gear (tier 4: Hearthmoor) ----
Object.assign(ITEMS, {
  warmdraught: { name: 'Warming Draught', price: 240, kind: 'heal', pow: 260, cures: ['stop', 'sleep'], target: 'ally', battle: true, field: true, desc: 'Hearthmoor spiced cider. Heals 260 HP and thaws Stop and Sleep.' },
});
Object.assign(EQUIP, {
  frostbrand: { name: 'Frostbrand', slot: 'weapon', type: 'sword', atk: 62, hit: 95, elem: 'ice', price: 3600 },
  rimeaxe: { name: 'Rime Axe', slot: 'weapon', type: 'axe', atk: 68, hit: 85, price: 3900 },
  glacierspear: { name: 'Glacier Spear', slot: 'weapon', type: 'spear', atk: 60, hit: 93, str: 3, elem: 'ice', price: 3700 },
  wyrmtalons: { name: 'Wyrm Talons', slot: 'weapon', type: 'claw', atk: 62, hit: 93, price: 3600 },
  icefang: { name: 'Icefang', slot: 'weapon', type: 'dagger', atk: 54, hit: 99, agi: 5, price: 3200 },
  frostrod: { name: 'Frost Rod', slot: 'weapon', type: 'rod', atk: 20, hit: 88, mag: 25, price: 3400 },
  snowstaff: { name: 'Snowdrift Staff', slot: 'weapon', type: 'staff', atk: 22, hit: 88, mag: 18, spr: 10, price: 3400 },
  frosthelm: { name: 'Frost Helm', slot: 'head', type: 'helm', def: 18, mdef: 6, price: 2400 },
  furhood: { name: 'Fur Hood', slot: 'head', type: 'hat', def: 10, mdef: 16, price: 2200 },
  wyrmmail: { name: 'Wyrmscale Mail', slot: 'body', type: 'heavy', def: 44, mdef: 10, price: 5200 },
  snowcoat: { name: 'Snowcoat', slot: 'body', type: 'light', def: 34, mdef: 18, price: 4600 },
  frostrobe: { name: 'Frost Robe', slot: 'body', type: 'robe', def: 20, mdef: 34, price: 4400 },
  hearthcharm: { name: 'Hearth Charm', slot: 'acc', type: 'acc', def: 5, mdef: 5, immune: ['stop', 'sleep'], price: 2600, desc: 'A little knitted house. Warm hands, awake eyes. Prevents Stop and Sleep.' },
  // treasures of the climb
  oldredscale: { name: 'Old Red Scale', slot: 'acc', type: 'acc', str: 6, def: 8, mdef: 4, price: 0, desc: 'Shed in this nest a long time ago, by a dragon who laughed too loud.' },
  rimeheart: { name: 'Rimeheart', slot: 'acc', type: 'acc', mag: 7, mdef: 10, spr: 4, price: 0, desc: 'Rimeclaw\'s frozen heart-stone. It beats once a minute.' },
  skyclaws: { name: 'Sky-Sunder Claws', slot: 'weapon', type: 'claw', atk: 72, hit: 95, str: 4, elem: 'fire', price: 0, desc: 'Grown, not forged. They were always hers.' },
});
Object.assign(KEY_ITEMS, {
  frostlily: { name: 'Frostheart Lily', desc: 'A blue-white lily that grows only at the top of the Wyrmspire. It is cold enough to cool a god\'s fire.' },
  toydragon: { name: 'Carved Toy Dragon', desc: 'A little red dragon, whittled by clumsy claws. Its tail was glued back on at least twice.' },
  dentedhelm: { name: 'Dented Helm', desc: 'A young knight\'s helm with four claw marks across it. It still smells faintly of sandwiches.' },
});

// ---- The Frostreach and the Wyrmspire ----
Object.assign(ENEMIES, {
  snowwolf: { name: 'Snow Wolf', art: 'wolf', tint: { h: 0, s: 0.1, l: 1.5 }, hp: 644, atk: 100, def: 22, mdef: 14, agi: 30, exp: 190, jp: 9, gold: 140, weak: ['fire'], resist: ['ice'] },
  icebat: { name: 'Icicle Bat', art: 'bat', tint: { h: 170, s: 0.8, l: 1.3 }, hp: 482, atk: 94, def: 16, mdef: 20, agi: 36, exp: 170, jp: 8, gold: 120, weak: ['fire'], resist: ['ice'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'status', name: 'Frost Bite', status: 'stop', chance: 30, frames: 180, fx: 'ice' }] },
  rimewisp: { name: 'Rime Wisp', art: 'wisp', tint: { h: 170, s: 0.6, l: 1.2 }, hp: 436, atk: 78, def: 14, mdef: 34, agi: 26, exp: 180, jp: 9, gold: 130, weak: ['fire'], resist: ['ice'], acts: [{ w: 2, type: 'spell', name: 'Hail', target: 'all', pow: 40, elem: 'ice', fx: 'ice' }, { w: 1, type: 'attack' }] },
  frostgolem: { name: 'Frost Golem', art: 'ogre', tint: { h: 170, s: 0.5, l: 1.2, all: true }, hp: 1127, atk: 112, def: 40, mdef: 12, agi: 8, exp: 280, jp: 11, gold: 220, weak: ['fire'], resist: ['ice'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'strike', name: 'Avalanche Fist', mult: 1.6, fx: 'boom' }] },
  wyrmling: { name: 'Ice Wyrmling', art: 'lizard', tint: { h: 170, s: 0.7, l: 1.4 }, hp: 713, atk: 103, def: 26, mdef: 22, agi: 22, exp: 230, jp: 10, gold: 180, weak: ['fire'], resist: ['ice'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'spell', name: 'Frost Breath', target: 'all', pow: 42, elem: 'ice', fx: 'ice' }] },
  dragonslayer: { name: 'Frozen Dragonslayer', art: 'skeleton', tint: { h: 190, s: 0.4, l: 1.3 }, hp: 804, atk: 109, def: 30, mdef: 16, agi: 18, exp: 250, jp: 10, gold: 260, undead: true, weak: ['holy', 'fire'], steal: 'warmdraught', acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'strike', name: 'Wyrmbane Thrust', mult: 1.7, fx: 'slash' }] },
  yeti: { name: 'Mountain Yeti', art: 'ogre', tint: { h: 0, s: 0.05, l: 1.6 }, hp: 1265, atk: 116, def: 28, mdef: 14, agi: 14, exp: 300, jp: 11, gold: 240, weak: ['fire'], resist: ['ice'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'strike', name: 'Snowball (Big)', mult: 1.5, fx: 'boom' }] },

  yetimother: {
    name: 'Old Mother Yeti', art: 'yetimother', ph: { art: 'ogre', tint: { h: 0, s: 0.05, l: 1.7 }, scale: 2.3 }, boss: true,
    hp: 5600, atk: 96, def: 26, mdef: 18, agi: 16, exp: 4200, jp: 18, gold: 3000, weak: ['fire'], resist: ['ice'], immune: ['sleep', 'fear', 'doom', 'poison', 'stop'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'strike', name: 'Bear Hug', mult: 1.7, fx: 'boom' }, { w: 2, type: 'spell', name: 'Avalanche', target: 'all', pow: 40, elem: 'ice', fx: 'ice' }, { w: 1, type: 'heal', name: 'Snow Nap', pow: 500, uses: 1, when: 'hurt' }],
    lines: { start: 'A yeti the size of a cottage rises from a snowdrift. She looks less angry than woken up.', half: 'She roars, and somewhere above you the snow shifts.' },
  },
  // Rimeclaw: first as the unbeatable Frost Wyrm (scripted), then after Miasma remembers what she is
  rimeclawfull: {
    name: 'Rimeclaw, the Frost Wyrm', art: 'rimeclaw', ph: { art: 'lizard', tint: { h: 170, s: 0.6, l: 1.3 }, scale: 3.2 }, boss: true,
    hp: 30000, atk: 118, def: 40, mdef: 40, agi: 26, actions: 2, exp: 0, jp: 0, gold: 0, immune: ['sleep', 'fear', 'doom', 'poison', 'blind', 'stop', 'silence'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Whiteout', target: 'all', pow: 56, elem: 'ice', fx: 'ice' }, { w: 1, type: 'status', name: 'Frozen Stare', status: 'stop', chance: 60, frames: 300, fx: 'ice' }],
    lines: { start: '"Little ember. You came HOME. You should not have."' },
  },
  rimeclaw: {
    name: 'Rimeclaw, the Frost Wyrm', art: 'rimeclaw', ph: { art: 'lizard', tint: { h: 170, s: 0.6, l: 1.3 }, scale: 3.2 }, boss: true,
    hp: 5600, atk: 80, def: 28, mdef: 26, agi: 22, actions: 2, exp: 8000, jp: 26, gold: 6000, weak: ['fire'], resist: ['ice', 'water'], immune: ['sleep', 'fear', 'doom', 'poison', 'blind', 'stop', 'silence'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Whiteout', target: 'all', pow: 34, elem: 'ice', fx: 'ice' }, { w: 2, type: 'strike', name: 'Glacier Maw', mult: 1.5, fx: 'boom' }, { w: 1, type: 'status', name: 'Frozen Stare', status: 'stop', chance: 45, frames: 240, fx: 'ice' }],
    phase2: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Old Winter', target: 'all', pow: 42, elem: 'ice', fx: 'ice' }, { w: 1, type: 'strike', name: 'Glacier Maw', mult: 1.8, fx: 'boom' }, { w: 1, type: 'heal', name: 'Snowfeed', pow: 800, uses: 1, when: 'hurt' }],
    lines: { start: 'Miasma\'s fire meets Rimeclaw\'s winter. The whole summit steams.', half: 'Rimeclaw\'s ice is cracking. Underneath, it is very, very old.' },
  },
});
Object.assign(FORMATIONS, {
  frostfield: [{ w: 3, e: [['snowwolf', 2, 3]] }, { w: 2, e: [['icebat', 2, 3]] }, { w: 2, e: [['rimewisp', 1, 2], ['snowwolf', 1, 1]] }, { w: 1, e: [['yeti', 1, 1]] }],
  wyrmspire: [{ w: 3, e: [['icebat', 2, 3]] }, { w: 3, e: [['snowwolf', 1, 2], ['rimewisp', 1, 1]] }, { w: 2, e: [['frostgolem', 1, 1]] }, { w: 2, e: [['dragonslayer', 1, 2]] }],
  wyrmspire2: [{ w: 3, e: [['wyrmling', 1, 2]] }, { w: 2, e: [['dragonslayer', 1, 1], ['icebat', 1, 2]] }, { w: 2, e: [['yeti', 1, 1], ['rimewisp', 1, 1]] }, { w: 2, e: [['frostgolem', 1, 1], ['wyrmling', 1, 1]] }],
});
Object.assign(SHOPS, {
  hearthmoor: { weapon: ['frostbrand', 'rimeaxe', 'glacierspear', 'wyrmtalons', 'icefang', 'frostrod', 'snowstaff'], armor: ['frosthelm', 'furhood', 'wyrmmail', 'snowcoat', 'frostrobe', 'hearthcharm'], item: ['hitonic', 'megatonic', 'hiether', 'warmdraught', 'ashsalve', 'emberplume', 'bedroll'], inn: 180, chapel: 120 },
});

// ===========================================================================
// Chapter Three, part two: the Frostfang Pass, the Undercity, and the Grand Tribunal
// ===========================================================================
// ---- Odeaon joins: High Knight of Aurelion, Raine's father ----
Object.assign(HEROES, {
  odeaon: {
    name: 'Odeaon', full: 'High Knight Odeaon Cudlar', img: 'odeaon', face: 'odeaon_face', look: 'odeaon', job: 'oathblade', innate: 'vow',
    base: { hp: 80, mp: 10, str: 14, agi: 9, mag: 7, vit: 14, spr: 10 },
    grow: { hp: 14, mp: 1.2, str: 1.1, agi: 0.6, mag: 0.5, vit: 1.0, spr: 0.8 },
    equip: { weapon: 'frostbrand', head: 'frosthelm', body: 'wyrmmail', acc: null },
    bio: 'High Knight of Aurelion. Once climbed a mountain to slay a dragon, forgot his sword, and shared his sandwich instead. Has told exactly one lie in his life, and has told it every day for twenty years.',
  },
});
Object.assign(INNATE, {
  vow: { name: 'Vow', learn: [[1, 'shieldwall'], [1, 'lionheart'], [20, 'fatherswatch'], [30, 'lastlight']] },
});
Object.assign(SKILLS, {
  shieldwall: { name: 'Shield Wall', mp: 6, target: 'allies', kind: 'buff', buff: 'protect', fx: 'buff', desc: 'Twenty years of standing between the people he loves and everything else.' },
  lionheart: { name: 'Lionheart', mp: 8, target: 'enemy', kind: 'phys', mult: 2.2, elem: 'holy', fx: 'holy', desc: 'A High Knight\'s strike. 2.2x holy damage.' },
  fatherswatch: { name: 'Father\'s Watch', mp: 0, target: 'self', kind: 'guard', fx: 'buff', desc: 'He takes every physical hit meant for the party until his next turn. Of course he does.' },
  lastlight: { name: 'Last Light', mp: 30, target: 'allies', kind: 'heal', pow: 90, cures: ['poison', 'blind', 'sleep', 'fear', 'silence', 'stop'], fx: 'holy', field: true, desc: 'The last of the Light he still believes in. Heals and cleanses everyone.' },
});
Object.assign(EQUIP, {
  dawnbreaker: { name: 'Dawnbreaker', slot: 'weapon', type: 'sword', atk: 70, hit: 97, elem: 'holy', price: 0, desc: 'Odeaon\'s old sword, recovered from the Temple armory. He did not forget it this time.' },
  ashenveil: { name: 'Ashen Veil', slot: 'head', type: 'hat', def: 12, mdef: 18, agi: 3, price: 0, desc: 'An Undercity smuggler\'s hood. Hides your face from wanted posters. Mostly.' },
  sewergrate: { name: 'Grate Shield', slot: 'acc', type: 'acc', def: 12, price: 0, desc: 'Brakka blew this grate off its hinges and nobody had the heart to tell her it isn\'t a shield. It is now.' },
});
Object.assign(KEY_ITEMS, {
  dawnguardkit: { name: 'Dawnguard Tabards', desc: 'Four borrowed Dawnguard tabards. Luna knows which laundry lines are never watched.' },
});
Object.assign(ENEMIES, {
  // Frostfang Pass
  snowharpy: { name: 'Snow Harpy', art: 'bat', tint: { h: 190, s: 0.4, l: 1.5 }, hp: 640, atk: 98, def: 22, mdef: 22, agi: 34, exp: 220, jp: 10, gold: 170, weak: ['fire', 'bolt'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'spell', name: 'Gale Shriek', target: 'all', pow: 42, elem: 'wind', fx: 'wind' }] },
  chainhound: { name: 'Chain Hound', art: 'wolf', tint: { h: 45, s: 0.8, l: 1.2 }, hp: 900, atk: 96, def: 28, mdef: 18, agi: 30, exp: 260, jp: 10, gold: 200, weak: ['dark'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'status', name: 'Snare', status: 'stop', chance: 40, frames: 200, fx: 'slash' }] },
  inquisitor: {
    name: 'Inquisitor Hallorn', art: 'inquisitor', ph: { art: 'pirate', tint: { h: 45, s: 0.6, l: 1.4 }, scale: 2.2 }, boss: true,
    hp: 6000, atk: 94, def: 30, mdef: 26, agi: 24, actions: 2, exp: 5000, jp: 20, gold: 4000, weak: ['dark'], resist: ['holy'], immune: ['sleep', 'fear', 'doom', 'poison', 'stop', 'silence'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'status', name: 'Dragonbane Chains', status: 'stop', chance: 55, frames: 300, fx: 'slash' }, { w: 2, type: 'spell', name: 'Holy Brand', target: 'all', pow: 40, elem: 'holy', fx: 'holy' }, { w: 1, type: 'strike', name: 'Wyrmbreaker', mult: 1.8, fx: 'boom' }],
    lines: { start: '"By order of the High Luminar: the dragon, alive. The rest of you, however you come."', half: '"The Light does not tire. I, however, am having a long day."' },
  },
  // the Undercity
  sewerrat: { name: 'Aqueduct Rat', art: 'wolf', tint: { h: 20, s: 0.3, l: 0.6 }, hp: 520, atk: 92, def: 20, mdef: 14, agi: 32, exp: 200, jp: 9, gold: 120, touch: { status: 'poison', chance: 30 } },
  drowned: { name: 'Drowned Acolyte', art: 'zombie', tint: { h: 190, s: 0.5, l: 0.9 }, hp: 820, atk: 96, def: 24, mdef: 20, agi: 12, exp: 250, jp: 10, gold: 180, undead: true, weak: ['holy', 'fire'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'status', name: 'Waterlogged Prayer', target: 'all', status: 'silence', chance: 35, fx: 'water' }] },
  lampooze: { name: 'Lamp Ooze', art: 'slime', tint: { h: 40, s: 0.8, l: 1.3 }, hp: 700, atk: 88, def: 30, mdef: 30, agi: 14, exp: 230, jp: 10, gold: 150, weak: ['ice', 'dark'], resist: ['holy', 'fire'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'spell', name: 'Oil Flare', target: 'all', pow: 44, elem: 'fire', fx: 'fire' }] },
  sentry: { name: 'Dawnguard Sentry', art: 'pirate', tint: { h: 45, s: 0.5, l: 1.5 }, hp: 980, atk: 108, def: 28, mdef: 22, agi: 22, exp: 240, jp: 10, gold: 220, weak: ['dark'], resist: ['holy'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'strike', name: 'Shield Bash', mult: 1.4, fx: 'slash' }] },
  // the Grand Tribunal
  paladin: { name: 'Temple Paladin', art: 'skeleton', tint: { h: 45, s: 0.6, l: 1.6 }, hp: 1500, atk: 96, def: 32, mdef: 28, agi: 18, exp: 600, jp: 12, gold: 500, weak: ['dark'], resist: ['holy'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'heal', name: 'Lay on Hands', pow: 400, when: 'hurt' }] },
  luminar: {
    name: 'High Luminar Vesper', art: 'luminar', ph: { look: 'vesper', scale: 5 }, boss: true,
    hp: 6600, atk: 86, def: 30, mdef: 34, agi: 26, exp: 8000, jp: 26, gold: 8000, weak: ['dark'], resist: ['holy'], immune: ['sleep', 'fear', 'doom', 'poison', 'blind', 'stop', 'silence'],
    acts: [{ w: 2, type: 'spell', name: 'Judgment', target: 'all', pow: 46, elem: 'holy', fx: 'holy' }, { w: 2, type: 'spell', name: 'Sunspear', target: 'one', pow: 80, elem: 'holy', fx: 'light' }, { w: 1, type: 'status', name: 'Blinding Dawn', target: 'all', status: 'blind', chance: 50, fx: 'light' }, { w: 1, type: 'attack' }],
    phase2: [{ w: 2, type: 'spell', name: 'Sylara\'s Wrath', target: 'all', pow: 56, elem: 'holy', fx: 'holy' }, { w: 1, type: 'status', name: 'Silence the Heretic', target: 'all', status: 'silence', chance: 45, fx: 'light' }, { w: 1, type: 'heal', name: 'Radiant Mend', pow: 900, uses: 1, when: 'hurt' }, { w: 1, type: 'spell', name: 'Sunspear', target: 'one', pow: 84, elem: 'holy', fx: 'light' }],
    lines: { start: '"The Light has judged you. I am merely its hands."', half: 'Vesper\'s halo flickers. For the first time, she looks afraid of the dark.' },
  },
});
Object.assign(FORMATIONS, {
  frostpass: [{ w: 3, e: [['snowharpy', 1, 2], ['snowwolf', 1, 1]] }, { w: 2, e: [['frostgolem', 1, 1], ['icebat', 1, 2]] }, { w: 2, e: [['yeti', 1, 1], ['snowharpy', 1, 1]] }, { w: 2, e: [['chainhound', 1, 2]] }],
  undercity: [{ w: 3, e: [['sewerrat', 2, 3]] }, { w: 3, e: [['drowned', 1, 2]] }, { w: 2, e: [['lampooze', 1, 2], ['sewerrat', 1, 1]] }],
  patrol: [{ w: 1, e: [['sentry', 2, 2]] }],
});
