'use strict';
// ---------------------------------------------------------------------------
// Chapter Five data: "The Open Sky"
// Every god now has a job:  Sylara Dawnsinger, Thalara Tidecaller, Valerion Oathblade, Myndra Arcanist,
//   Grimnar Ash Reaper, Malakar Masquer, Zariel Chainbearer, Ashkar Phoenix Warlock, and new here:
//   Elaris -> Bloomwarden (Heartbloom Hollow), Kryos -> Timewarden (the Stilled Hourglass),
//   and Nyxia, the erased one -> Nightveil (Ebonport's chapel): a healer whose medicine is shadow.
// Gear tier 6 (Sephara, Ebonport) and tier 7 (Rimward), plus one ultimate weapon per hero, hidden in
// the places only a dragon can reach.
// ---------------------------------------------------------------------------
Object.assign(JOBS, {
  bloomwarden: {
    name: 'Bloomwarden', god: 'Elaris', cmd: 'Bloom', color: '#ff90d0',
    desc: 'Tends what Elaris left behind. Thorns for the cruel, petals for the tired, and a song that brings the fallen back.',
    mult: { hp: 1.05, mp: 1.3, str: 0.8, agi: 1.0, mag: 1.15, vit: 1.0, spr: 1.35 },
    weapons: ['staff', 'rod', 'spear'], armor: ['robe', 'hat', 'light'],
    learn: [[1, 'thornbind'], [2, 'petalveil'], [3, 'lullbloom'], [5, 'heartsong'], [6, 'wildgrowth'], [8, 'embrace']],
  },
  timewarden: {
    name: 'Timewarden', god: 'Kryos', cmd: 'Hour', color: '#c8e0ff',
    desc: 'Keeps the Pale Watcher\'s hours. Freezes foes in a moment, hurries friends through theirs.',
    mult: { hp: 1.0, mp: 1.25, str: 0.95, agi: 1.15, mag: 1.2, vit: 0.95, spr: 1.1 },
    weapons: ['sword', 'staff', 'rod'], armor: ['light', 'robe', 'hat', 'helm'],
    learn: [[1, 'rimeshard'], [2, 'quicken'], [3, 'stillhour'], [5, 'graveclock'], [6, 'palewinter'], [8, 'endofhours']],
  },
  nightveil: {
    name: 'Nightveil', god: 'Nyxia (unseated)', cmd: 'Veil', color: '#a070ff',
    desc: 'The erased goddess of the night still has a few faithful, and they are healers. Shadows close wounds the way night closes a day: gently, and all at once.',
    mult: { hp: 1.0, mp: 1.45, str: 0.75, agi: 1.1, mag: 1.2, vit: 0.95, spr: 1.4 },
    weapons: ['rod', 'staff', 'dagger'], armor: ['robe', 'hat', 'light'],
    learn: [[1, 'shadowmend'], [2, 'duskveil'], [3, 'umbralsalve'], [4, 'nightcradle'], [5, 'starlessbite'], [6, 'shroud'], [7, 'moonlessrebirth'], [8, 'veilednight']],
  },
});
JOB_ORDER.push('bloomwarden', 'timewarden', 'nightveil');

Object.assign(SKILLS, {
  // Bloomwarden (Elaris)
  thornbind: { name: 'Thornbind', mp: 6, target: 'enemy', kind: 'dmg', elem: 'earth', pow: 42, status: 'stop', chance: 30, fx: 'poison', desc: 'Thorns wrap one foe. Sometimes they hold.' },
  petalveil: { name: 'Petal Veil', mp: 12, target: 'allies', kind: 'buff', buff: 'regen', fx: 'heal', desc: 'Falling petals. The whole party regenerates.' },
  lullbloom: { name: 'Lullbloom', mp: 10, target: 'enemies', kind: 'status', status: 'sleep', chance: 60, fx: 'poison', desc: 'A field of sleepy flowers. Puts all foes to sleep.' },
  heartsong: { name: 'Heartsong', mp: 24, target: 'allies', kind: 'heal', pow: 64, cures: ['poison', 'blind', 'sleep', 'fear', 'silence'], fx: 'heal', field: true, desc: 'Elaris\'s lullaby. Heals and cures the whole party.' },
  wildgrowth: { name: 'Wildgrowth', mp: 22, target: 'enemies', kind: 'dmg', elem: 'earth', pow: 72, fx: 'poison', desc: 'The ground remembers it was a forest. Earth on all foes.' },
  embrace: { name: 'Embrace', mp: 36, target: 'dead', kind: 'revive', full: true, fx: 'heal', field: true, desc: 'Brings a fallen ally back with half their HP. Nobody stays down while love is in the room.' },
  // Timewarden (Kryos)
  rimeshard: { name: 'Rime Shard', mp: 6, target: 'enemy', kind: 'dmg', elem: 'ice', pow: 46, fx: 'ice', desc: 'A splinter of frozen time.' },
  quicken: { name: 'Quicken', mp: 10, target: 'ally', kind: 'buff', buff: 'haste', fx: 'buff', desc: 'Lend an ally a few seconds. Haste.' },
  stillhour: { name: 'Still Hour', mp: 14, target: 'enemy', kind: 'status', status: 'stop', chance: 70, fx: 'ice', desc: 'Stop one foe\'s clock. Bosses resist.' },
  graveclock: { name: 'Grave Clock', mp: 18, target: 'enemy', kind: 'status', status: 'doom', chance: 60, fx: 'dark', desc: 'The Pale Watcher counts down from three. Bosses refuse.' },
  palewinter: { name: 'Pale Winter', mp: 26, target: 'enemies', kind: 'dmg', elem: 'ice', pow: 76, status: 'stop', chance: 20, fx: 'ice', desc: 'A winter that lasts one second and forever. Ice on all foes.' },
  endofhours: { name: 'End of Hours', mp: 44, target: 'enemies', kind: 'dmg', elem: 'ice', pow: 118, fx: 'ice', desc: 'Kryos shows every foe the last minute of the world.' },
  // Nightveil (Nyxia): a healer whose medicine is the dark
  shadowmend: { name: 'Shadow Mend', mp: 4, target: 'ally', kind: 'heal', pow: 36, fx: 'smoke', field: true, desc: 'A shadow lays itself over a wound like a cool cloth. Restores HP to one ally.' },
  duskveil: { name: 'Dusk Veil', mp: 12, target: 'allies', kind: 'buff', buff: 'regen', fx: 'smoke', desc: 'The party stands in a kind dusk. Everyone regenerates.' },
  umbralsalve: { name: 'Umbral Salve', mp: 8, target: 'ally', kind: 'heal', pow: 24, cures: ['poison', 'blind', 'sleep', 'fear', 'silence', 'stop', 'doom'], fx: 'smoke', field: true, desc: 'Night takes the sickness away with it. Cures every ailment, even Stop and Doom, and heals a little.' },
  nightcradle: { name: 'Night Cradle', mp: 18, target: 'allies', kind: 'heal', pow: 46, fx: 'smoke', field: true, desc: 'Nyxia\'s lullaby, sung in shadow. Heals the whole party.' },
  starlessbite: { name: 'Starless Bite', mp: 14, target: 'enemy', kind: 'drain', elem: 'dark', pow: 70, fx: 'dark', desc: 'Drink a foe\'s light, and keep half of it for yourself.' },
  shroud: { name: 'Shroud', mp: 16, target: 'allies', kind: 'buff', buff: 'protect', fx: 'smoke', desc: 'Wrap the party in shadow. Defense up for everyone.' },
  moonlessrebirth: { name: 'Moonless Rebirth', mp: 30, target: 'dead', kind: 'revive', full: true, fx: 'smoke', field: true, desc: 'Even the dead sleep. Nyxia knows how to wake them. Revives one ally with half their HP.' },
  veilednight: { name: 'The Veiled Night', mp: 40, target: 'allies', kind: 'heal', pow: 92, buff: 'regen', cures: ['poison', 'blind', 'sleep', 'fear', 'silence'], fx: 'smoke', field: true, desc: 'For one moment, Nyxia is a goddess again, and every wound in the party closes in the dark.' },
  // innate gifts earned in Chapter Five (kept in member.bonus)
  crescentflare: { name: 'Crescent Flare', mp: 24, target: 'enemies', kind: 'phys', mult: 2.0, elem: 'fire', fx: 'fire', desc: 'The coal around Raine\'s neck remembers whose hearth it came from.' },
  emberheart: { name: 'Ember Heart', mp: 30, target: 'allies', kind: 'heal', pow: 70, buff: 'regen', fx: 'fire', field: true, desc: 'A feather Ashkar gave back. Warmth for everyone, and it lingers.' },
  anvilstrike: { name: 'Anvil Strike', mp: 20, target: 'enemy', kind: 'phys', mult: 3.4, elem: 'fire', fx: 'boom', desc: 'A blow struck the way Grimnar strikes the first anvil.' },
  oldskyroar: { name: 'Old Sky Roar', mp: 28, target: 'enemies', kind: 'dmg', elem: 'fire', pow: 104, status: 'fear', chance: 40, fx: 'roar', desc: 'Miasma, at full size, with her whole hoard to defend.' },
  nyxheart: { name: 'Nyx\'s Heart', mp: 34, target: 'enemies', kind: 'drain', elem: 'dark', pow: 96, fx: 'dark', desc: 'Verai carries a goddess\'s night. She does not have to be her.' },
  firstmoon: { name: 'First Moon', mp: 26, target: 'enemies', kind: 'phys', mult: 2.3, elem: 'holy', fx: 'light', desc: 'Every moonfang who ever lived howls at once.' },
  thunderclap: { name: 'Thunderclap', mp: 24, target: 'enemies', kind: 'dmg', elem: 'fire', pow: 110, pierce: true, fx: 'boom', desc: 'Old Gruntle\'s last recipe. Ignores magic defense. Ignores most of physics.' },
  winterward: { name: 'Winter Ward', mp: 22, target: 'allies', kind: 'buff', buff: 'protect', fx: 'ice', desc: 'An oath that kept a father warm for twenty winters. Defense up for all.' },
});

// ---- items and gear ----
Object.assign(ITEMS, {
  inkdraught: { name: 'Ink Draught', price: 1500, kind: 'mp', pow: 220, target: 'ally', battle: true, field: true, desc: 'Myndra\'s scribes drink it to stay awake. Restores 220 MP.' },
  heartdew: { name: 'Heartdew', price: 1400, kind: 'heal', pow: 1400, target: 'ally', battle: true, field: true, desc: 'Dew from Elaris\'s garden. Restores 1400 HP.' },
  megaelixir: { name: 'Mega Elixir', price: 0, kind: 'heal', pow: 9999, target: 'ally', battle: true, field: true, desc: 'Restores all HP.' },
  skyelixir: { name: 'Sky Elixir', price: 0, kind: 'mp', pow: 999, target: 'ally', battle: true, field: true, desc: 'Restores all MP.' },
  phoenixtear: { name: 'Phoenix Tear', price: 900, kind: 'revive', target: 'dead', battle: true, field: true, desc: 'Revives a fallen ally. Ashkar would like it noted that he does NOT cry.' },
  thunderjar: { name: 'Thunder Jar', price: 900, kind: 'bomb', pow: 160, target: 'enemies', battle: true, field: false, desc: 'Gruntle\'s improved recipe. 160-320 damage to all foes.' },
});
Object.assign(EQUIP, {
  // tier 6: Sephara and Ebonport
  tidebrand: { name: 'Tidebrand', slot: 'weapon', type: 'sword', atk: 86, hit: 96, elem: 'water', price: 8400 },
  starlance: { name: 'Star Lance', slot: 'weapon', type: 'spear', atk: 84, hit: 95, str: 4, price: 8400 },
  reefclaws: { name: 'Reef Claws', slot: 'weapon', type: 'claw', atk: 86, hit: 95, agi: 4, price: 8600 },
  tidecleaver: { name: 'Tide Cleaver', slot: 'weapon', type: 'axe', atk: 92, hit: 86, price: 8800 },
  inkrod: { name: 'Ink Rod', slot: 'weapon', type: 'rod', atk: 26, hit: 90, mag: 36, price: 8000 },
  tidestaff: { name: 'Tide Staff', slot: 'weapon', type: 'staff', atk: 28, hit: 90, mag: 26, spr: 14, price: 8000 },
  maskdagger: { name: 'Masquerade Dagger', slot: 'weapon', type: 'dagger', atk: 76, hit: 99, agi: 8, price: 7800 },
  sagehelm: { name: 'Sage\'s Helm', slot: 'head', type: 'helm', def: 26, mdef: 12, price: 5200 },
  seerhat: { name: 'Seer\'s Hat', slot: 'head', type: 'hat', def: 16, mdef: 26, mag: 3, price: 5000 },
  tidemail: { name: 'Tidemail', slot: 'body', type: 'heavy', def: 60, mdef: 16, price: 10400 },
  maskleather: { name: 'Masquer\'s Leathers', slot: 'body', type: 'light', def: 48, mdef: 26, agi: 4, price: 9400 },
  sagerobe: { name: 'Sage\'s Robe', slot: 'body', type: 'robe', def: 30, mdef: 50, price: 9200 },
  masquerade: { name: 'Masquerade Mask', slot: 'acc', type: 'acc', agi: 6, def: 4, mdef: 8, immune: ['blind', 'silence'], price: 5200, desc: 'Ebonport\'s finest. One half smiles, one half burns. Prevents Blind and Silence.' },
  // tier 7: Rimward, at the edge of the Unclaimed Wilds
  wildfang: { name: 'Wildfang', slot: 'weapon', type: 'sword', atk: 96, hit: 96, price: 12400 },
  thornspear: { name: 'Thorn Spear', slot: 'weapon', type: 'spear', atk: 94, hit: 95, str: 5, price: 12400 },
  raptorclaws: { name: 'Raptor Claws', slot: 'weapon', type: 'claw', atk: 96, hit: 96, agi: 5, price: 12600 },
  godsfallaxe: { name: 'Godsfall Axe', slot: 'weapon', type: 'axe', atk: 104, hit: 86, price: 13000 },
  pilgrimrod: { name: 'Pilgrim Rod', slot: 'weapon', type: 'rod', atk: 28, hit: 90, mag: 42, price: 12000 },
  pilgrimstaff: { name: 'Pilgrim Staff', slot: 'weapon', type: 'staff', atk: 30, hit: 90, mag: 30, spr: 18, price: 12000 },
  wildknife: { name: 'Wild Knife', slot: 'weapon', type: 'dagger', atk: 86, hit: 99, agi: 10, price: 11600 },
  skyhelm: { name: 'Sky Helm', slot: 'head', type: 'helm', def: 31, mdef: 15, price: 7600 },
  wildhat: { name: 'Feathered Hat', slot: 'head', type: 'hat', def: 20, mdef: 31, price: 7400 },
  wildplate: { name: 'Wildplate', slot: 'body', type: 'heavy', def: 68, mdef: 20, price: 15200 },
  wildhide: { name: 'Wildhide', slot: 'body', type: 'light', def: 55, mdef: 30, price: 13800 },
  wildrobe: { name: 'Pilgrim\'s Robe', slot: 'body', type: 'robe', def: 35, mdef: 58, price: 13400 },
  pilgrimbead: { name: 'Pilgrim Beads', slot: 'acc', type: 'acc', def: 8, mdef: 12, spr: 6, immune: ['fear', 'doom'], price: 7000, desc: 'Ten beads for ten gods, and an eleventh for whoever is listening. Prevents Fear and Doom.' },
  // treasure: dungeons and hidden places
  starquill: { name: 'Star Quill', slot: 'acc', type: 'acc', mag: 10, spr: 5, price: 0, desc: 'A quill that writes in starlight. Your spells remember to be clever.' },
  sagecirclet: { name: 'Sage\'s Circlet', slot: 'head', type: 'hat', def: 22, mdef: 34, mag: 6, price: 0 },
  starfallrod: { name: 'Starfall Rod', slot: 'weapon', type: 'rod', atk: 30, hit: 92, mag: 48, price: 0, desc: 'Myndra\'s own pointer. Points at things until they explode.' },
  eyeofmyndra: { name: 'Eye of Myndra', slot: 'acc', type: 'acc', mag: 14, spr: 8, immune: ['silence', 'blind'], price: 0, desc: 'A small open eye in a seven-pointed star. It blinks when you lie. Prevents Silence and Blind.' },
  shadowsilk: { name: 'Shadowsilk', slot: 'body', type: 'light', def: 52, mdef: 34, agi: 6, price: 0 },
  veilmantle: { name: 'Veil Mantle', slot: 'body', type: 'robe', def: 38, mdef: 62, mag: 6, price: 0, desc: 'Woven by the Unlit from a night that nobody owns.' },
  astralcharm: { name: 'Astral Charm', slot: 'acc', type: 'acc', def: 10, mdef: 14, mag: 6, str: 6, price: 0 },
  starmail: { name: 'Starmail', slot: 'body', type: 'heavy', def: 70, mdef: 26, price: 0 },
  lunarhelm: { name: 'Lunar Helm', slot: 'head', type: 'helm', def: 32, mdef: 20, price: 0 },
  moonmothermantle: { name: 'Moonmother\'s Mantle', slot: 'body', type: 'light', def: 62, mdef: 38, str: 6, price: 0, desc: 'Silver fur over moonsilver links. The first moonfang wore it. Then she gave it away.' },
  skyscaleclaws: { name: 'Skyscale Claws', slot: 'weapon', type: 'claw', atk: 104, hit: 96, elem: 'wind', price: 0 },
  echoband: { name: 'Echo Band', slot: 'acc', type: 'acc', def: 8, mdef: 16, immune: ['fear', 'silence', 'sleep'], price: 0, desc: 'It hums with voices from the Rift. Prevents Fear, Silence and Sleep.' },
  stormguard: { name: 'Stormguard', slot: 'acc', type: 'acc', def: 16, mdef: 16, vit: 0, price: 0, desc: 'A buckler that has been struck by lightning so often it has stopped minding.' },
  cinderhelm: { name: 'Cinder Helm', slot: 'head', type: 'helm', def: 30, mdef: 18, price: 0 },
  ashenrobe: { name: 'Ashen Robe', slot: 'body', type: 'robe', def: 36, mdef: 60, mag: 5, price: 0 },
  forgemail: { name: 'Forgemail', slot: 'body', type: 'heavy', def: 72, mdef: 18, price: 0 },
  unseatedhelm: { name: 'Unseated Helm', slot: 'head', type: 'helm', def: 33, mdef: 22, price: 0 },
  gunnergoggles: { name: 'Gunner\'s Goggles', slot: 'head', type: 'hat', def: 22, mdef: 28, agi: 4, immune: ['blind'], price: 0 },
  thornmail: { name: 'Thornmail', slot: 'body', type: 'light', def: 56, mdef: 32, price: 0 },
  embracecharm: { name: 'Embrace Charm', slot: 'acc', type: 'acc', def: 10, mdef: 18, spr: 10, immune: ['poison', 'sleep'], price: 0, desc: 'Two vines, wrapped around each other like arms. Prevents Poison and Sleep.' },
  dragonmail: { name: 'Dragonscale Mail', slot: 'body', type: 'heavy', def: 76, mdef: 30, price: 0, desc: 'Scales Miasma shed twenty years ago. She would like them back. She would also like you to stop calling it "dandruff armor".' },
  palecrown: { name: 'Pale Crown', slot: 'head', type: 'helm', def: 30, mdef: 30, spr: 6, price: 0 },
  babyblanket: { name: 'Baby Blanket', slot: 'acc', type: 'acc', def: 6, mdef: 20, spr: 8, immune: ['fear', 'doom'], price: 0, desc: 'Small, red, singed at one corner, and kept for twenty years in a dragon\'s hoard. It still smells a little like Raine. Prevents Fear and Doom.' },
  // ultimate weapons: one per hero
  oldskytalons: { name: 'Old Sky Talons', slot: 'weapon', type: 'claw', atk: 120, hit: 98, str: 8, elem: 'fire', price: 0, desc: 'Miasma\'s own claws, the shed set, kept for "emergencies". This is an emergency.' },
  nyxianrod: { name: 'Nyxian Rod', slot: 'weapon', type: 'rod', atk: 34, hit: 94, mag: 56, spr: 8, price: 0, desc: 'Black wood from the last grove that prayed to Nyxia. Verai\'s smoke curls around it like it knows it.' },
  eclipsefang: { name: 'Eclipse Fang', slot: 'weapon', type: 'sword', atk: 118, hit: 98, str: 6, elem: 'holy', price: 0, desc: 'The first moonfang\'s fang, set in a knight\'s hilt. Luna\'s, and nobody else\'s.' },
  thunderwife: { name: 'Thunderwife', slot: 'weapon', type: 'dagger', atk: 108, hit: 94, agi: 8, elem: 'fire', price: 0, desc: 'Old Gruntle\'s masterpiece. Technically a dagger. Legally, a dagger. Spiritually, a cannon.' },
  winteroath: { name: 'Winter Oath', slot: 'weapon', type: 'sword', atk: 120, hit: 98, vit: 0, elem: 'ice', price: 0, desc: 'A blade frozen the night Odeaon swore to raise his daughter alone. Kryos kept it.' },
  heartwoodstaff: { name: 'Heartwood Staff', slot: 'weapon', type: 'staff', atk: 36, hit: 94, mag: 40, spr: 24, price: 0, desc: 'Grown, not carved, from the root of a sleeping goddess.' },
  phoenixcrescent: { name: 'Phoenix Crescent', slot: 'weapon', type: 'axe', atk: 124, hit: 92, str: 6, elem: 'fire', price: 0, desc: 'Ashkar\'s gift: a crescent axe of living flame, for the girl who carried his coal.' },
  grimnaredge: { name: 'Grimnar\'s Edge', slot: 'weapon', type: 'axe', atk: 128, hit: 90, str: 8, price: 0, desc: 'Brakka forged it from a sliver of the first anvil. It is heavy with every death the Ash-Father ever kept.' },
  kindledge: { name: 'Kindled Edge', slot: 'weapon', type: 'axe', atk: 122, hit: 92, elem: 'fire', price: 0, desc: 'Ashkar re-lit it with his own breath, the day you handed back the Anvil. A god\'s apology, shaped like an axe.' },
});
Object.assign(KEY_ITEMS, {
  skywings: { name: 'Miasma\'s Wings', desc: 'Not an item. Miasma would like that very clear. She is a dragon, and she will fly you anywhere. (World map: Z to take off and land.)' },
  masks: { name: 'Malakar\'s Masks', desc: 'Six masks from Ebonport, one per head. Half smile, half burn. The Gate Warden will let masked folk pass.' },
  starchart: { name: 'Myndra\'s Star Chart', desc: 'The true map of the sky, with the Veilstorm drawn on it as a knot. Myndra marked where it can be untied.' },
  nightlantern: { name: 'Nyxia\'s Lantern', desc: 'A black lantern with no flame. It sheds darkness instead of light, and the Veilstorm recognizes it.' },
  livingflame: { name: 'The Living Flame', desc: 'A flame that will not go out, given by a phoenix who decided not to.' },
  anvilshard2: { name: 'Grimnar\'s Anvil', desc: 'Retaken from Sonia\'s forge. Still warm. Still angry.' },
  crownember: { name: 'The Crown\'s Ember', desc: 'The last coal from the half-made crown. The Veilstorm flinches from it.' },
});

// ---- enemies ----
// hp below is the design figure; HP5 tunes it to the real party (checked with the balance sim)
const HP5 = 0.62;
const T5 = (name, art, tint, hp, atk, def, mdef, agi, o = {}) => ({ name, art, tint, hp: Math.round(hp * HP5 / 10) * 10, atk, def, mdef, agi, exp: o.exp || Math.round(hp * 0.2), jp: 15, gold: o.gold || Math.round(hp * 0.18), ...o });
Object.assign(ENEMIES, {
  // Thalemyr, the coasts and the Library
  reefcrab: T5('Reef Crab', 'toad', { h: -30, s: 1.4, l: 1.1 }, 1900, 132, 48, 26, 22, { weak: ['bolt'], resist: ['water'] }),
  stormgull: T5('Storm Gull', 'bat', { h: 0, s: 0.2, l: 1.8 }, 1500, 128, 30, 30, 40, { weak: ['bolt', 'wind'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'spell', name: 'Squall Dive', target: 'all', pow: 56, elem: 'wind', fx: 'wind' }] }),
  tideserpent: T5('Tide Serpent', 'lizard', { h: 140, s: 1.2, l: 1.0 }, 2100, 136, 36, 32, 30, { weak: ['bolt'], resist: ['water'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'spell', name: 'Riptide', target: 'one', pow: 90, elem: 'water', fx: 'water' }] }),
  inkwraith: T5('Ink Wraith', 'shade', { h: 220, s: 1.0, l: 0.7 }, 1700, 128, 28, 42, 30, { weak: ['holy', 'fire'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'status', name: 'Blot Out', status: 'blind', chance: 50, fx: 'dark' }, { w: 1, type: 'spell', name: 'Ink Tide', target: 'all', pow: 54, elem: 'dark', fx: 'dark' }] }),
  grimoireimp: T5('Grimoire Imp', 'imp', { h: 30, s: 0.5, l: 1.5 }, 1500, 120, 26, 44, 36, { weak: ['fire'], acts: [{ w: 2, type: 'attack' }, { w: 2, type: 'spell', name: 'Misread Spell', target: 'one', pow: 96, elem: 'star', fx: 'light' }, { w: 1, type: 'status', name: 'Footnote', status: 'silence', chance: 45, fx: 'light' }] }),
  orreryguard: T5('Brass Orrery Guard', 'ogre', { h: 30, s: 0.9, l: 1.3 }, 2600, 142, 50, 24, 18, { weak: ['bolt', 'water'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'strike', name: 'Planetary Swing', mult: 1.6, fx: 'boom' }] }),
  maskdancer: T5('Masque Dancer', 'goblin', { h: 270, s: 1.2, l: 1.1 }, 1700, 132, 30, 32, 44, { weak: ['holy'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'status', name: 'Dizzy Waltz', target: 'all', status: 'sleep', chance: 35, fx: 'smoke' }] }),
  maskwarden: T5('Mask Warden', 'pirate', { h: 280, s: 0.6, l: 0.7 }, 2200, 140, 42, 30, 28, { weak: ['holy'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'strike', name: 'Two-Faced Cut', mult: 1.5, fx: 'slash' }] }),
  // Zalakir
  skyraptor: T5('Skyreach Raptor', 'lizard', { h: 60, s: 1.3, l: 1.0 }, 2100, 144, 34, 26, 44, { weak: ['ice'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'strike', name: 'Pounce', mult: 1.6, fx: 'claw' }] }),
  thornback: T5('Thornback', 'wolf', { h: 60, s: 0.8, l: 0.8 }, 2300, 140, 46, 24, 32, { weak: ['fire'], touch: { status: 'poison', chance: 30 } }),
  junglewidow: T5('Jungle Widow', 'spider', { h: 80, s: 1.3, l: 0.9 }, 1800, 134, 32, 30, 36, { weak: ['fire'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'status', name: 'Silk Snare', status: 'stop', chance: 40, frames: 200, fx: 'poison' }, { w: 1, type: 'spell', name: 'Venom Spray', target: 'all', pow: 50, elem: 'poison', fx: 'poison' }] }),
  savannalion: T5('Dust Lion', 'wolf', { h: 30, s: 1.0, l: 1.3 }, 2500, 150, 38, 26, 36, { weak: ['water'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'status', name: 'Roar', target: 'all', status: 'fear', chance: 45, fx: 'roar' }] }),
  riftecho: T5('Rift Echo', 'wisp', { h: 270, s: 1.2, l: 1.2 }, 1600, 124, 24, 48, 34, { weak: ['holy'], resist: ['dark'], acts: [{ w: 2, type: 'attack' }, { w: 2, type: 'spell', name: 'Old Voice', target: 'all', pow: 58, elem: 'dark', fx: 'dark' }] }),
  stormspawn: T5('Stormspawn', 'wisp', { h: 260, s: 1.6, l: 0.9 }, 2000, 140, 30, 44, 38, { weak: ['holy', 'earth'], resist: ['bolt'], acts: [{ w: 2, type: 'attack' }, { w: 2, type: 'spell', name: 'Violet Bolt', target: 'one', pow: 104, elem: 'bolt', fx: 'bolt' }] }),
  unseatedknight: T5('Unseated Knight', 'skeleton', { h: 260, s: 0.8, l: 0.8 }, 2600, 150, 48, 32, 28, { weak: ['holy'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'strike', name: 'Oath Breaker', mult: 1.7, fx: 'dark' }] }),
  // the Ashen Crown
  gutterwraith: T5('Gutterwraith', 'shade', { h: 20, s: 0.4, l: 0.9 }, 1900, 136, 30, 40, 32, { weak: ['water', 'holy'], resist: ['fire'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'spell', name: 'Ash Eater', target: 'one', pow: 92, elem: 'dark', fx: 'dark' }] }),
  cinderling: T5('Cinder Fledgling', 'imp', { h: -20, s: 1.6, l: 1.2 }, 1500, 128, 28, 34, 40, { weak: ['water', 'ice'], resist: ['fire'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'spell', name: 'Feather Flare', target: 'all', pow: 54, elem: 'fire', fx: 'fire' }] }),
  unseatedsmith: T5('Unseated Smith', 'pirate', { h: 260, s: 0.5, l: 0.8 }, 2200, 142, 44, 28, 26, { weak: ['ice', 'water'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'strike', name: 'Red-Hot Tongs', mult: 1.5, fx: 'fire' }] }),
  slaggolem: T5('Slag Golem', 'ogre', { h: -10, s: 1.4, l: 0.7 }, 2900, 146, 54, 22, 16, { weak: ['ice', 'water'], resist: ['fire'] }),
  // Heartbloom Hollow, the Hourglass, the Barrows, the hoard
  blightroot: T5('Blightroot', 'spider', { h: 290, s: 0.6, l: 0.7 }, 2000, 134, 38, 30, 24, { weak: ['fire'], touch: { status: 'poison', chance: 40 } }),
  rotbloom: T5('Rotbloom', 'slime', { h: 300, s: 0.8, l: 0.7 }, 1700, 126, 30, 36, 20, { weak: ['fire', 'holy'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'spell', name: 'Sour Pollen', target: 'all', pow: 52, elem: 'poison', status: 'poison', chance: 40, fx: 'poison' }] }),
  timeshade: T5('Lost Minute', 'shade', { h: 190, s: 0.3, l: 1.7 }, 1700, 130, 26, 44, 46, { weak: ['fire'], resist: ['ice'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'status', name: 'Stopped Clock', status: 'stop', chance: 45, frames: 220, fx: 'ice' }] }),
  frostsentinel: T5('Rime Sentinel', 'ogre', { h: 190, s: 0.6, l: 1.5 }, 2700, 144, 52, 30, 18, { weak: ['fire'], resist: ['ice'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'spell', name: 'Hail of Hours', target: 'all', pow: 56, elem: 'ice', fx: 'ice' }] }),
  barrowwolf: T5('Barrow Wolf', 'wolf', { h: 200, s: 0.4, l: 1.5 }, 2000, 138, 34, 34, 42, { weak: ['fire'], undead: true }),
  hoardtoad: T5('Gilt Toad', 'toad', { h: 20, s: 1.6, l: 1.4 }, 1600, 124, 44, 28, 20, { gold: 1200, steal: 'megaelixir' }),
});
const B5 = (name, art, ph, hp, atk, o) => ({ name, art, ph, boss: true, hp: Math.round(hp * HP5 / 100) * 100, atk, def: o.def || 40, mdef: o.mdef || 36, agi: o.agi || 30, actions: 2, exp: o.exp || Math.round(hp * 0.42), jp: 32, gold: o.gold || Math.round(hp * 0.5), immune: ['sleep', 'fear', 'doom', 'poison', 'stop', 'silence', 'blind'], ...o });
Object.assign(ENEMIES, {
  unwritten: B5('The Unwritten', 'unwritten', { art: 'shade', tint: { h: 0, s: 0, l: 2.2 }, scale: 3.2 }, 19000, 128, {
    weak: ['fire'], resist: ['dark'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Erasure', target: 'all', pow: 66, elem: 'dark', fx: 'dark' }, { w: 1, type: 'status', name: 'Blank Page', target: 'all', status: 'silence', chance: 50, fx: 'light' }, { w: 1, type: 'strike', name: 'Red Pen', mult: 1.8, fx: 'slash' }],
    phase2: [{ w: 2, type: 'attack' }, { w: 2, type: 'spell', name: 'Unwrite', target: 'one', pow: 118, elem: 'dark', fx: 'dark' }, { w: 1, type: 'heal', name: 'Rewrite Itself', pow: 1400, uses: 1, when: 'hurt' }],
    lines: { start: '"Every word about a god is a little piece of the god. I am very, very hungry."', half: 'Whole sentences peel off the Unwritten and drift back to their books.' },
  }),
  maskedregent: B5('The Masked Regent', 'maskedregent', { art: 'pirate', tint: { h: 300, s: 1.0, l: 0.8 }, scale: 2.4 }, 20000, 130, {
    weak: ['holy'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Betrayer Flame', target: 'all', pow: 68, elem: 'fire', fx: 'fire' }, { w: 1, type: 'status', name: 'Masquerade', target: 'all', status: 'blind', chance: 45, fx: 'smoke' }, { w: 1, type: 'strike', name: 'Two Faces, One Knife', mult: 1.9, fx: 'slash' }],
    lines: { start: '"Malakar teaches that every faith can be sold. I simply found a buyer for theirs."', half: 'The Regent\'s smiling half of the mask cracks. The burning half keeps burning.' },
  }),
  veiledherald: B5('Verai, the Veiled Herald', 'veiledverai', { look: 'verai', scale: 5, silhouette: null }, 17000, 118, {
    exp: 0, gold: 0, weak: [], resist: ['dark'],
    acts: [{ w: 2, type: 'spell', name: 'Umbra Storm', target: 'all', pow: 62, elem: 'dark', fx: 'dark' }, { w: 2, type: 'spell', name: 'Soul Drain', target: 'one', pow: 110, elem: 'dark', fx: 'dark' }, { w: 1, type: 'status', name: 'Smoke Veil', target: 'all', status: 'sleep', chance: 40, fx: 'smoke' }],
    lines: { start: '"I\'m not going back to being something you all just KEEP, Raine."', half: 'Verai\'s smoke falters, every time it gets close to Raine.' },
  }),
  gutterqueen: B5('The Gutter Queen', 'gutterqueen', { art: 'shade', tint: { h: 20, s: 0.6, l: 1.0 }, scale: 3.2 }, 18500, 128, {
    weak: ['water', 'holy', 'ice'], resist: ['fire', 'dark'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Choking Ash', target: 'all', pow: 66, elem: 'dark', fx: 'smoke' }, { w: 1, type: 'spell', name: 'Eat the Embers', target: 'one', pow: 112, elem: 'fire', fx: 'fire' }, { w: 1, type: 'heal', name: 'Feed', pow: 1600, uses: 1, when: 'hurt' }],
    lines: { start: '"A dying god smells like woodsmoke. We have been feasting for a week."', half: 'The ash in the nest stirs. Somewhere under it, something still warm is listening.' },
  }),
  anvilcrowned: B5('The Anvil-Crowned', 'anvilcrowned', { art: 'ogre', tint: { h: -15, s: 1.6, l: 0.6 }, scale: 2.6 }, 22000, 138, {
    def: 50, weak: ['ice', 'water'], resist: ['fire'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'strike', name: 'Coronation', mult: 1.8, fx: 'boom' }, { w: 1, type: 'spell', name: 'Slag Rain', target: 'all', pow: 64, elem: 'fire', fx: 'fire' }, { w: 1, type: 'status', name: 'Kneel', target: 'all', status: 'stop', chance: 35, frames: 220, fx: 'dark' }],
    lines: { start: '"She promised me a crown. Grimnar\'s own. I only have to WEAR it until she\'s ready."', half: 'The half-made crown glows white-hot. Its wearer is screaming, and not in triumph.' },
  }),
  blightgraft: B5('The Blight Graft', 'blightgraft', { art: 'spider', tint: { h: 290, s: 1.0, l: 0.7 }, scale: 3.0 }, 17000, 126, {
    weak: ['fire', 'holy'], resist: ['earth', 'poison'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Rot Bloom', target: 'all', pow: 60, elem: 'poison', status: 'poison', chance: 50, fx: 'poison' }, { w: 1, type: 'strike', name: 'Strangle Root', mult: 1.7, fx: 'slash' }, { w: 1, type: 'heal', name: 'Drink the Soil', pow: 1800, uses: 1, when: 'hurt' }],
    lines: { start: 'Sonia\'s rot has grown roots into the valley. It does not want company.', half: 'Where the graft\'s roots tear free, tiny white flowers open.' },
  }),
  hourwarden: B5('The Hourwarden', 'hourwarden', { art: 'skeleton', tint: { h: 190, s: 0.4, l: 1.8 }, scale: 2.6 }, 18000, 124, {
    weak: ['fire'], resist: ['ice'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'status', name: 'Stop Time', status: 'stop', chance: 60, frames: 260, fx: 'ice' }, { w: 1, type: 'spell', name: 'Minute Hand', target: 'all', pow: 64, elem: 'ice', fx: 'ice' }, { w: 1, type: 'strike', name: 'Hour Hand', mult: 2.0, fx: 'slash' }],
    lines: { start: '"The Pale Watcher keeps the last hour of the world in this room. You are early."', half: '"...You are not early. You are exactly on time. How annoying."' },
  }),
  firstmoonfang: B5('The First Moonfang', 'firstmoonfang', { look: 'lunawolf', scale: 6 }, 18000, 130, {
    exp: 7500, weak: ['fire'], resist: ['holy', 'dark'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'strike', name: 'Old Moon Claw', mult: 1.8, fx: 'claw' }, { w: 1, type: 'spell', name: 'Ancestral Howl', target: 'all', pow: 62, elem: 'holy', fx: 'roar' }, { w: 1, type: 'status', name: 'Silver Stare', target: 'all', status: 'fear', chance: 45, fx: 'light' }],
    lines: { start: '"You wore a helmet for eight years, cub. Show me you can stand without it."', half: '"Better. Again. Like you mean it."' },
  }),
  goldscale: B5('Goldscale', 'goldscale', { art: 'lizard', tint: { h: 25, s: 1.8, l: 1.5 }, scale: 3.0 }, 17000, 130, {
    gold: 20000, weak: ['ice', 'water'], resist: ['fire'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Gilded Breath', target: 'all', pow: 64, elem: 'fire', fx: 'fire' }, { w: 1, type: 'strike', name: 'Tail of Coins', mult: 1.8, fx: 'slash' }],
    lines: { start: '"MINE. All of it. Finders keepers. The red one isn\'t coming back."', half: '"...The red one came back."' },
  }),
  vaultcolossus: B5('Vault Colossus', 'vaultcolossus', { art: 'ogre', tint: { h: 30, s: 0.4, l: 1.2 }, scale: 2.6 }, 18000, 132, {
    def: 54, weak: ['water', 'bolt'], resist: ['fire'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Cannonade', target: 'all', pow: 66, elem: 'fire', fx: 'boom' }, { w: 1, type: 'strike', name: 'Ram', mult: 1.9, fx: 'boom' }],
    lines: { start: '"PASSWORD." (It does not wait for one.)', half: 'A plate falls off the Colossus. Behind it, painted inside: "BRAKKA - DON\'T TOUCH."' },
  }),
  stormherald: B5('The Storm Herald', 'stormherald', { art: 'pirate', tint: { h: 260, s: 1.4, l: 0.7 }, scale: 2.6 }, 18000, 128, {
    weak: ['holy', 'earth'], resist: ['bolt', 'dark'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Veilstorm', target: 'all', pow: 62, elem: 'bolt', fx: 'bolt' }, { w: 1, type: 'status', name: 'Lightning Doubt', target: 'all', status: 'silence', chance: 25, fx: 'bolt' }, { w: 1, type: 'strike', name: 'Eye of the Storm', mult: 2.0, fx: 'boom' }],
    phase2: [{ w: 2, type: 'attack' }, { w: 2, type: 'spell', name: 'Thousand Prayers', target: 'all', pow: 68, elem: 'dark', fx: 'dark' }, { w: 1, type: 'heal', name: 'Stolen Faith', pow: 1600, uses: 1, when: 'hurt' }],
    lines: { start: '"She is almost a god of everything. You are almost too late. Almost."', half: 'Thousands of stolen prayers scream out of the Herald\'s armor.' },
  }),
  sonia5: B5('Sonia, the Unseated', 'sonia', null, 60000, 150, {
    exp: 0, gold: 0, def: 60, mdef: 60, weak: [],
    acts: [{ w: 2, type: 'spell', name: 'Heartseed Bloom', target: 'all', pow: 84, elem: 'earth', fx: 'poison' }, { w: 2, type: 'spell', name: 'Dawnheart Lance', target: 'one', pow: 170, elem: 'holy', fx: 'holy' }, { w: 1, type: 'status', name: 'Unmake', target: 'all', status: 'stop', chance: 40, frames: 200, fx: 'dark' }],
    lines: { start: '"Every god can be replaced, Captain. Even all ten of them at once."', half: '"Oh, you\'re GOOD. Mother would have liked you. Well. My mother."' },
  }),
});
Object.assign(FORMATIONS, {
  tides: [{ w: 3, e: [['reefcrab', 1, 2], ['stormgull', 1, 1]] }, { w: 2, e: [['tideserpent', 1, 2]] }, { w: 2, e: [['stormgull', 2, 3]] }],
  masklands: [{ w: 3, e: [['maskdancer', 1, 2], ['tideserpent', 1, 1]] }, { w: 2, e: [['maskwarden', 1, 1], ['maskdancer', 1, 1]] }],
  stacks: [{ w: 3, e: [['inkwraith', 1, 2], ['grimoireimp', 1, 1]] }, { w: 2, e: [['grimoireimp', 2, 3]] }, { w: 2, e: [['orreryguard', 1, 1], ['inkwraith', 1, 1]] }],
  wilds: [{ w: 3, e: [['savannalion', 1, 2]] }, { w: 2, e: [['skyraptor', 2, 2]] }, { w: 2, e: [['savannalion', 1, 1], ['skyraptor', 1, 1]] }],
  skyreach: [{ w: 3, e: [['thornback', 1, 2], ['junglewidow', 1, 1]] }, { w: 2, e: [['skyraptor', 1, 2], ['junglewidow', 1, 1]] }, { w: 1, e: [['barrowwolf', 2, 2]] }],
  stormrim: [{ w: 3, e: [['stormspawn', 1, 2], ['unseatedknight', 1, 1]] }, { w: 2, e: [['riftecho', 2, 3]] }, { w: 2, e: [['unseatedknight', 2, 2]] }],
  cradle: [{ w: 3, e: [['gutterwraith', 1, 2], ['cinderling', 1, 1]] }, { w: 2, e: [['cinderling', 2, 3]] }],
  unseatedforge: [{ w: 3, e: [['unseatedsmith', 1, 2], ['slaggolem', 1, 1]] }, { w: 2, e: [['unseatedknight', 1, 1], ['unseatedsmith', 1, 1]] }],
  blight: [{ w: 3, e: [['blightroot', 1, 2], ['rotbloom', 1, 1]] }, { w: 2, e: [['rotbloom', 2, 3]] }],
  hourglass: [{ w: 3, e: [['timeshade', 1, 2], ['frostsentinel', 1, 1]] }, { w: 2, e: [['timeshade', 2, 3]] }],
});
Object.assign(SHOPS, {
  sephara: { weapon: ['tidebrand', 'starlance', 'reefclaws', 'tidecleaver', 'inkrod', 'tidestaff', 'maskdagger'], armor: ['sagehelm', 'seerhat', 'tidemail', 'maskleather', 'sagerobe'], item: ['megatonic', 'moonwater', 'heartdew', 'hiether', 'inkdraught', 'echomint', 'phoenixtear', 'bedroll'], inn: 0, chapel: 0 },
  ebonport: { weapon: ['maskdagger', 'reefclaws', 'inkrod', 'tidebrand'], armor: ['seerhat', 'maskleather', 'sagerobe', 'masquerade'], item: ['heartdew', 'inkdraught', 'phoenixtear', 'thunderjar', 'echomint', 'bedroll'], inn: 0, chapel: 0 },
  rimward: { weapon: ['wildfang', 'thornspear', 'raptorclaws', 'godsfallaxe', 'pilgrimrod', 'pilgrimstaff', 'wildknife'], armor: ['skyhelm', 'wildhat', 'wildplate', 'wildhide', 'wildrobe', 'pilgrimbead'], item: ['heartdew', 'inkdraught', 'phoenixtear', 'thunderjar', 'moonwater', 'echomint', 'bedroll'], inn: 0, chapel: 0 },
});
