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
