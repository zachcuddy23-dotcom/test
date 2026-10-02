'use strict';
// ---------------------------------------------------------------------------
// The Final Chapter data: "The Tenth Seat"
// Tier 8 gear (the Last Merchant in Godsfall), relics from the Ring of the Ten (one per god),
// Godsfall Crater's monsters, the reliquary guardians, the god avatars, and Sonia.
// Sonia's last form is built in events6.js from what you did: how many banners fly at the Rim,
// which reliquaries you took back, and who is standing beside you.
// ---------------------------------------------------------------------------
Object.assign(ITEMS, {
  godsdew: { name: 'Godsdew', price: 2600, kind: 'heal', pow: 3000, target: 'ally', battle: true, field: true, desc: 'Dew that formed on the Ring of the Ten. Restores 3000 HP.' },
  starmilk: { name: 'Star Milk', price: 3200, kind: 'mp', pow: 400, target: 'ally', battle: true, field: true, desc: 'Myndra\'s scholars won\'t say where it comes from. Restores 400 MP.' },
  prayerjar: { name: 'Prayer Jar', price: 1800, kind: 'bomb', pow: 230, target: 'enemies', battle: true, field: false, desc: 'A jar of loud, angry prayers. 230-460 damage to all foes.' },
  lastlight: { name: 'Last Light', price: 1600, kind: 'revive', target: 'dead', battle: true, field: true, desc: 'A candle from every temple in the world, melted together. Revives a fallen ally.' },
});
Object.assign(EQUIP, {
  // tier 8: the Last Merchant (inside Godsfall, of course)
  seatbreaker: { name: 'Seatbreaker', slot: 'weapon', type: 'sword', atk: 108, hit: 97, price: 18000 },
  prayerlance: { name: 'Prayer Lance', slot: 'weapon', type: 'spear', atk: 106, hit: 96, str: 6, price: 18000 },
  godclaws: { name: 'Godsfall Claws', slot: 'weapon', type: 'claw', atk: 108, hit: 97, agi: 6, price: 18400 },
  thronecleaver: { name: 'Throne Cleaver', slot: 'weapon', type: 'axe', atk: 116, hit: 88, price: 19000 },
  lastrod: { name: 'Rod of Last Words', slot: 'weapon', type: 'rod', atk: 32, hit: 92, mag: 50, price: 17600 },
  laststaff: { name: 'Staff of Last Rites', slot: 'weapon', type: 'staff', atk: 34, hit: 92, mag: 36, spr: 24, price: 17600 },
  lastknife: { name: 'The Last Knife', slot: 'weapon', type: 'dagger', atk: 98, hit: 99, agi: 12, price: 17000 },
  halohelm: { name: 'Halo Helm', slot: 'head', type: 'helm', def: 36, mdef: 20, price: 11000 },
  halocirclet: { name: 'Halo Circlet', slot: 'head', type: 'hat', def: 24, mdef: 38, price: 10600 },
  seatplate: { name: 'Seatplate', slot: 'body', type: 'heavy', def: 80, mdef: 26, price: 22000 },
  seatleather: { name: 'Seat Leathers', slot: 'body', type: 'light', def: 64, mdef: 38, price: 20000 },
  seatrobe: { name: 'Seat Robe', slot: 'body', type: 'robe', def: 42, mdef: 68, price: 19600 },
  // relics from the Ring of the Ten
  sunsigil: { name: 'Sylara\'s Sunsigil', slot: 'acc', type: 'acc', spr: 12, mdef: 20, def: 10, immune: ['blind', 'doom'], price: 0, desc: 'The Radiant Dawn\'s blessing. Every day is a second chance. Prevents Blind and Doom.' },
  tidepearl: { name: 'Thalara\'s Tidepearl', slot: 'acc', type: 'acc', mag: 10, spr: 10, mdef: 18, immune: ['poison', 'sleep'], price: 0, desc: 'It is always high tide inside it. Prevents Poison and Sleep.' },
  oathring: { name: 'Valerion\'s Oathring', slot: 'acc', type: 'acc', str: 10, def: 18, vit: 0, immune: ['fear'], price: 0, desc: 'A ring of silver and flame. Prevents Fear.' },
  seventhstar: { name: 'Myndra\'s Seventh Star', slot: 'acc', type: 'acc', mag: 16, spr: 6, immune: ['silence'], price: 0, desc: 'The point of the star Myndra never drew. Prevents Silence.' },
  firstanvil: { name: 'Grimnar\'s First Nail', slot: 'acc', type: 'acc', str: 14, def: 10, immune: ['doom'], price: 0, desc: 'A nail from the first coffin. The Ash-Father has decided it is not your turn. Prevents Doom.' },
  heartbloom: { name: 'Elaris\'s Heartbloom', slot: 'acc', type: 'acc', spr: 14, mdef: 16, def: 8, immune: ['poison', 'fear'], price: 0, desc: 'A flower that beats. Prevents Poison and Fear.' },
  splitmask: { name: 'Malakar\'s Split Mask', slot: 'acc', type: 'acc', agi: 14, str: 6, immune: ['blind', 'silence'], price: 0, desc: 'Half smiling, half burning, and fully on your side for once. Prevents Blind and Silence.' },
  frozenhour: { name: 'Kryos\'s Frozen Hour', slot: 'acc', type: 'acc', agi: 10, mag: 8, def: 8, mdef: 8, immune: ['stop'], price: 0, desc: 'An hourglass that never empties. Prevents Stop.' },
  boundchain: { name: 'Zariel\'s Bound Chain', slot: 'acc', type: 'acc', str: 12, def: 14, immune: ['stop', 'fear'], price: 0, desc: 'Wrapped around your fist, it hits back. Prevents Stop and Fear.' },
  tenthfeather: { name: 'The Tenth Feather', slot: 'acc', type: 'acc', str: 8, mag: 8, agi: 8, spr: 8, immune: ['doom'], price: 0, desc: 'A phoenix feather that refuses to go out. Prevents Doom.' },
  crownoften: { name: 'Crown of the Ten', slot: 'acc', type: 'acc', str: 10, mag: 10, agi: 10, spr: 10, def: 12, mdef: 12, immune: ['blind', 'silence', 'sleep', 'fear', 'stop', 'doom', 'poison'], price: 0, desc: 'Every god in the ring agreed to let you wear it. That has never happened before. Prevents every ailment.' },
  // treasure in Godsfall
  answeredprayer: { name: 'An Answered Prayer', slot: 'acc', type: 'acc', def: 12, mdef: 20, spr: 10, immune: ['fear', 'silence'], price: 0, desc: 'Somebody, once, prayed that you would come. Prevents Fear and Silence.' },
  starlessmail: { name: 'Starless Mail', slot: 'body', type: 'light', def: 70, mdef: 46, agi: 6, price: 0 },
  sunkenplate: { name: 'Plate of the Drowned Sun', slot: 'body', type: 'heavy', def: 86, mdef: 30, price: 0 },
  gardenrobe: { name: 'Robe of the Last Garden', slot: 'body', type: 'robe', def: 46, mdef: 74, mag: 8, price: 0 },
});
Object.assign(KEY_ITEMS, {
  rallyroll: { name: 'The Rally Roll', desc: 'A long scroll from the Rimward cartographer, listing every people who has promised to stand at the Rim. Ask her for the list at any time.' },
  dawnheart: { name: 'The Dawnheart', desc: 'Sylara\'s reliquary, taken back from the bottom of Godsfall. A small sunrise you can hold.' },
  shieldofodeaon: { name: 'Odeaon\'s Shield', desc: 'Dented, scorched, and still warm. Raine carries it everywhere.' },
  stoppedminute: { name: 'One Stopped Minute', desc: 'Kryos\'s gift. When Sonia raises her hand for the last time, it will not come down quite as fast.' },
  elarisblossom: { name: 'Elaris\'s Blossom', desc: 'The first flower of the sapling in Heartbloom Hollow. It beats like a heart.' },
  starsight: { name: 'Starsight', desc: 'Myndra\'s eye, lent for one fight. You will see exactly where Sonia is weakest.' },
});

// ---- monsters (the same HP tuning as Chapter Five) ----
const HP6 = 0.62;
const T6 = (name, art, tint, hp, atk, def, mdef, agi, o = {}) => ({ name, art, tint, hp: Math.round(hp * HP6 / 10) * 10, atk: atk + 8, def, mdef, agi, exp: o.exp || Math.round(hp * 0.2), jp: 16, gold: o.gold || Math.round(hp * 0.2), ...o });
// the last bosses are meant to be the hardest in the game: more HP and bite than Chapter Five's
const BHP6 = 0.74;
const B6 = (name, art, ph, hp, atk, o) => ({ name, art, ph, boss: true, hp: Math.round(hp * BHP6 / 100) * 100, atk: atk + 12, def: o.def || 44, mdef: o.mdef || 40, agi: o.agi || 32, actions: 2, exp: o.exp || Math.round(hp * 0.4), jp: 36, gold: o.gold || Math.round(hp * 0.5), immune: ['sleep', 'fear', 'doom', 'poison', 'stop', 'silence', 'blind'], ...o });
Object.assign(ENEMIES, {
  // the siege of the Rim and Godsfall
  thronesworn: T6('Thronesworn', 'pirate', { h: 270, s: 1.2, l: 0.6 }, 3000, 156, 50, 34, 30, { weak: ['holy'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'strike', name: 'Kneel', mult: 1.6, fx: 'dark' }] }),
  prayerwisp: T6('Stolen Prayer', 'wisp', { h: 40, s: 0.6, l: 1.6 }, 2300, 140, 28, 52, 42, { weak: ['dark'], resist: ['holy'], acts: [{ w: 2, type: 'attack' }, { w: 2, type: 'spell', name: 'Please', target: 'all', pow: 64, elem: 'holy', fx: 'holy' }] }),
  unansweredshade: T6('Unanswered', 'shade', { h: 210, s: 0.3, l: 1.2 }, 2500, 150, 32, 46, 36, { weak: ['holy', 'fire'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'status', name: 'Silence of the Gods', target: 'all', status: 'silence', chance: 35, fx: 'dark' }, { w: 1, type: 'spell', name: 'Why', target: 'one', pow: 120, elem: 'dark', fx: 'dark' }] }),
  thornthrall: T6('Thorn Thrall', 'spider', { h: 320, s: 1.2, l: 0.9 }, 2700, 152, 44, 34, 30, { weak: ['fire'], touch: { status: 'poison', chance: 35 } }),
  petalwraith: T6('Petal Wraith', 'wisp', { h: 310, s: 1.4, l: 1.2 }, 2200, 142, 30, 50, 40, { weak: ['fire'], acts: [{ w: 2, type: 'attack' }, { w: 1, type: 'spell', name: 'Bloom of Grief', target: 'all', pow: 62, elem: 'earth', status: 'sleep', chance: 30, fx: 'poison' }] }),
  suncinder: T6('Sun Cinder', 'imp', { h: 40, s: 1.8, l: 1.4 }, 2300, 148, 30, 46, 44, { weak: ['ice', 'dark'], resist: ['holy', 'fire'], acts: [{ w: 2, type: 'attack' }, { w: 2, type: 'spell', name: 'Noon', target: 'one', pow: 116, elem: 'holy', fx: 'holy' }] }),
  goldenhusk: T6('Golden Husk', 'ogre', { h: 40, s: 1.2, l: 1.4 }, 3300, 160, 56, 30, 20, { weak: ['dark', 'ice'], resist: ['holy'] }),
  nightling: T6('Nightling', 'bat', { h: 270, s: 0.8, l: 0.6 }, 2100, 146, 30, 44, 50, { weak: ['holy'], resist: ['dark'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'status', name: 'Starless', target: 'all', status: 'blind', chance: 40, fx: 'dark' }] }),
  dreadveil: T6('Dread Veil', 'shade', { h: 260, s: 1.4, l: 0.6 }, 2600, 152, 34, 48, 38, { weak: ['holy'], resist: ['dark'], acts: [{ w: 2, type: 'attack' }, { w: 2, type: 'spell', name: 'Night Without End', target: 'all', pow: 66, elem: 'dark', fx: 'dark' }] }),
  fallengod: T6('Fallen Godling', 'skeleton', { h: 50, s: 0.6, l: 1.6 }, 3200, 162, 50, 40, 30, { weak: ['holy'], acts: [{ w: 3, type: 'attack' }, { w: 1, type: 'spell', name: 'Forgotten Name', target: 'all', pow: 70, elem: 'dark', fx: 'dark' }] }),
  seatwarden: T6('Seat Warden', 'ogre', { h: 260, s: 0.8, l: 0.6 }, 3500, 166, 58, 36, 24, { weak: ['holy', 'bolt'] }),
});
Object.assign(ENEMIES, {
  zarielchosen: B6('Vorsk, Zariel\'s Chosen', 'vorsk', { art: 'goblin', tint: { h: -40, s: 1.4, l: 0.8 }, scale: 2.4 }, 22000, 140, {
    weak: ['ice'], acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'strike', name: 'Chain of Debt', mult: 1.8, fx: 'slash' }, { w: 1, type: 'spell', name: 'Bound Inferno', target: 'all', pow: 68, elem: 'fire', fx: 'fire' }],
    lines: { start: '"You PAID to get into Emberport. Zariel doesn\'t take coin. Zariel takes blood. Let\'s settle the debt."', half: '"HAH! Now THAT is payment!"' },
  }),
  heartseedthrall: B6('The Heartseed Thrall', 'heartseedthrall', { art: 'spider', tint: { h: 320, s: 1.4, l: 1.0 }, scale: 3.2 }, 25500, 146, {
    actions: 3,
    weak: ['fire'], resist: ['earth', 'poison'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Heartseed Bloom', target: 'all', pow: 84, elem: 'earth', status: 'poison', chance: 40, fx: 'poison' }, { w: 1, type: 'strike', name: 'Strangling Love', mult: 2.1, fx: 'slash' }, { w: 1, type: 'heal', name: 'Stolen Spring', pow: 2000, uses: 1, when: 'hurt' }],
    lines: { start: 'A goddess\'s heart, beating inside something that was never meant to love anything.', half: 'The thorns loosen. Something inside the Thrall is trying to let go.' },
  }),
  dawnheartseraph: B6('The Dawnheart Seraph', 'dawnheartseraph', { art: 'wisp', tint: { h: 40, s: 1.8, l: 1.6 }, scale: 3.4 }, 25500, 146, {
    actions: 3,
    weak: ['dark', 'ice'], resist: ['holy'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Dawnheart Lance', target: 'one', pow: 118, elem: 'holy', fx: 'holy' }, { w: 1, type: 'spell', name: 'Noonfall', target: 'all', pow: 62, elem: 'holy', fx: 'light' }, { w: 1, type: 'status', name: 'Blinding Mercy', target: 'all', status: 'blind', chance: 45, fx: 'light' }],
    lines: { start: '"Every day is a second chance. I am the last one. There will be no more after me."', half: 'The Seraph\'s light flickers like a sunset that has forgotten how to end.' },
  }),
  starless: B6('The Starless', 'starless', { art: 'shade', tint: { h: 270, s: 1.8, l: 0.4 }, scale: 3.6 }, 27000, 148, {
    actions: 3,
    weak: ['holy'], resist: ['dark'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'A Stolen Night', target: 'all', pow: 74, elem: 'dark', fx: 'dark' }, { w: 1, type: 'status', name: 'Endless Dark', target: 'all', status: 'sleep', chance: 40, fx: 'smoke' }, { w: 1, type: 'spell', name: 'Unmoon', target: 'one', pow: 140, elem: 'dark', fx: 'dark' }],
    lines: { start: 'Nyxia\'s night, torn out of her and twisted into a wall. It does not remember being kind.', half: 'For one breath, the Starless hesitates, as if it heard a lullaby.' },
  }),
  nightsheir: B6('Verai, Night\'s Heir', 'nightsheir', { look: 'verai', scale: 5, silhouette: '#2a0a4a' }, 25000, 128, {
    exp: 0, gold: 0, resist: ['dark'],
    acts: [{ w: 2, type: 'spell', name: 'Mother\'s Night', target: 'all', pow: 70, elem: 'dark', fx: 'dark' }, { w: 2, type: 'spell', name: 'Soul Drain', target: 'one', pow: 130, elem: 'dark', fx: 'dark' }, { w: 1, type: 'status', name: 'Smoke Veil', target: 'all', status: 'sleep', chance: 40, fx: 'smoke' }],
    lines: { start: '"If I stop, she has nobody. Do you understand? NOBODY."', half: 'Verai\'s smoke keeps curling back toward Raine, like it\'s trying to come home without her.' },
  }),
  chainwarden: B6('The Chainwarden of the Empty Seat', 'chainwarden', { art: 'skeleton', tint: { h: 270, s: 1.0, l: 0.9 }, scale: 2.8 }, 32000, 150, {
    actions: 3,
    def: 54, weak: ['holy', 'fire'], resist: ['dark'],
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'strike', name: 'Bind', mult: 1.8, fx: 'slash' }, { w: 1, type: 'status', name: 'Chains of the Seat', target: 'all', status: 'stop', chance: 35, frames: 220, fx: 'dark' }, { w: 1, type: 'spell', name: 'Gaoler\'s Fire', target: 'all', pow: 72, elem: 'fire', fx: 'fire' }],
    lines: { start: '"The Seat must be empty when she sits. Whatever falls into it, I keep."', half: '"...Let GO of it. Let go!"' },
  }),
  // the Ring of the Ten: each god tests you once
  av_sylara: B6('Sylara, the Radiant Dawn', 'av_sylara', { art: 'wisp', tint: { h: 45, s: 1.6, l: 1.7 }, scale: 3.2 }, 30000, 140, { weak: ['dark'], resist: ['holy'], acts: [{ w: 2, type: 'spell', name: 'Radiance', target: 'one', pow: 130, elem: 'holy', fx: 'holy' }, { w: 2, type: 'spell', name: 'New Dawn', target: 'all', pow: 66, elem: 'holy', fx: 'light' }, { w: 1, type: 'heal', name: 'Second Chance', pow: 2400, uses: 1, when: 'hurt' }], lines: { start: '"Show me you can be the dawn in somebody else\'s life."' } }),
  av_thalara: B6('Thalara, Mistress of Tides', 'av_thalara', { art: 'fishman', tint: { h: 160, s: 1.4, l: 1.2 }, scale: 2.8 }, 30000, 142, { weak: ['bolt'], resist: ['water'], acts: [{ w: 2, type: 'attack' }, { w: 2, type: 'spell', name: 'Maelstrom', target: 'all', pow: 72, elem: 'water', fx: 'water' }, { w: 1, type: 'spell', name: 'Serpent Tide', target: 'one', pow: 130, elem: 'water', fx: 'water' }], lines: { start: '"The sea gives back what it takes. Eventually. Let\'s see how much you can take."' } }),
  av_valerion: B6('Valerion, the Iron Champion', 'av_valerion', { art: 'pirate', tint: { h: 210, s: 0.3, l: 1.5 }, scale: 2.6 }, 32000, 160, { def: 58, weak: ['bolt'], acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'strike', name: 'Honorbound', mult: 2.0, fx: 'holy' }, { w: 1, type: 'strike', name: 'Shield Bash', mult: 1.4, fx: 'boom' }], lines: { start: '"Draw. Honorably, if you know how. Dishonorably, if you must. But DRAW."' } }),
  av_myndra: B6('Myndra, the Arcane Sage', 'av_myndra', { art: 'imp', tint: { h: 240, s: 1.2, l: 1.4 }, scale: 3.0 }, 28000, 138, { mdef: 56, weak: ['dark'], acts: [{ w: 2, type: 'spell', name: 'Starfall', target: 'all', pow: 74, elem: 'star', fx: 'light' }, { w: 2, type: 'spell', name: 'Footnote', target: 'one', pow: 136, elem: 'star', fx: 'light' }, { w: 1, type: 'status', name: 'Spoiler', target: 'all', status: 'silence', chance: 40, fx: 'light' }], lines: { start: '"I have read how this fight ends. Prove the book wrong."' } }),
  av_grimnar: B6('Grimnar, the Ash-Father', 'av_grimnar', { art: 'ogre', tint: { h: 0, s: 0.2, l: 0.5 }, scale: 2.8 }, 28000, 136, { def: 56, weak: ['holy'], resist: ['dark', 'fire'], acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'strike', name: 'The Black Axe', mult: 1.8, fx: 'dark' }, { w: 1, type: 'spell', name: 'Final Gate', target: 'all', pow: 70, elem: 'dark', fx: 'dark' }], lines: { start: '"Everything ends. I only ask that it ends WELL."' } }),
  av_elaris: B6('Elaris, the Serene Bloom', 'av_elaris', { art: 'wisp', tint: { h: 310, s: 1.2, l: 1.4 }, scale: 3.0 }, 28000, 136, { weak: ['fire'], resist: ['earth'], acts: [{ w: 2, type: 'spell', name: 'Last Garden', target: 'all', pow: 68, elem: 'earth', fx: 'poison' }, { w: 1, type: 'status', name: 'Lullaby', target: 'all', status: 'sleep', chance: 45, fx: 'poison' }, { w: 2, type: 'attack' }], lines: { start: '"I am only a memory of me. Be gentle. Or don\'t. I\'ll forgive you either way."' } }),
  av_malakar: B6('Malakar, the Betrayer Flame', 'av_malakar', { art: 'goblin', tint: { h: -20, s: 1.6, l: 1.2 }, scale: 2.6 }, 26000, 136, { agi: 46, weak: ['water'], resist: ['fire'], acts: [{ w: 2, type: 'attack' }, { w: 2, type: 'spell', name: 'Betrayal', target: 'one', pow: 130, elem: 'fire', fx: 'fire' }, { w: 1, type: 'status', name: 'Two Faces', target: 'all', status: 'fear', chance: 45, fx: 'smoke' }], lines: { start: '"I\'m going to help you. That\'s the trick. You\'ll never see it coming."' } }),
  av_kryos: B6('Kryos, the Pale Watcher', 'av_kryos', { art: 'skeleton', tint: { h: 190, s: 0.4, l: 1.8 }, scale: 2.8 }, 30000, 144, { weak: ['fire'], resist: ['ice'], acts: [{ w: 2, type: 'spell', name: 'End of Hours', target: 'all', pow: 72, elem: 'ice', fx: 'ice' }, { w: 1, type: 'status', name: 'Still', target: 'all', status: 'stop', chance: 40, frames: 200, fx: 'ice' }, { w: 2, type: 'attack' }], lines: { start: '"I already know how this ends. Humor an old god."' } }),
  av_zariel: B6('Zariel, the Bound Inferno', 'av_zariel', { art: 'pirate', tint: { h: -10, s: 1.8, l: 0.8 }, scale: 2.6 }, 29000, 140, { weak: ['ice'], resist: ['fire'], acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'strike', name: 'Vengeance', mult: 1.8, fx: 'fire' }, { w: 1, type: 'spell', name: 'Bound Inferno', target: 'all', pow: 72, elem: 'fire', fx: 'fire' }], lines: { start: '"Suffering is payment. Let\'s see what you can afford."' } }),
  av_tenth: B6('The Tenth Flame', 'ashkargod', { art: 'bat', tint: { h: 40, s: 1.6, l: 1.2 }, scale: 3 }, 28000, 134, { weak: ['water', 'ice'], resist: ['fire'], acts: [{ w: 2, type: 'spell', name: 'Phoenix Rain', target: 'all', pow: 74, elem: 'fire', fx: 'fire' }, { w: 2, type: 'spell', name: 'Godfire', target: 'one', pow: 120, elem: 'fire', fx: 'fire' }, { w: 1, type: 'heal', name: 'Rebirth', pow: 2000, uses: 1, when: 'hurt' }], lines: { start: '"The seat at the end of the ring. Whoever sits here gets the hardest fight."' } }),
  // Sonia: the base figures. events6.js copies these and changes them to match your story.
  sonia_unseated: B6('Sonia, the Unseated', 'sonia', null, 36000, 150, {
    exp: 0, gold: 0, def: 52, mdef: 52,
    acts: [{ w: 3, type: 'attack' }, { w: 2, type: 'spell', name: 'Stolen Prayers', target: 'all', pow: 80, elem: 'dark', fx: 'dark' }, { w: 1, type: 'status', name: 'Unmake', target: 'all', status: 'stop', chance: 35, frames: 200, fx: 'dark' }, { w: 1, type: 'spell', name: 'A Mother\'s Reach', target: 'one', pow: 130, elem: 'dark', fx: 'dark' }],
    lines: { start: '"You took back my reliquaries. How sweet. I don\'t NEED them anymore. I have everyone\'s prayers."', half: '"Do you know how long I waited? A YEAR. A year with no seat, no faithful, nothing but a daughter who looked at me like I was a stranger."' },
  }),
  sonia_one: B6('Sonia, the One', 'sonia', null, 46000, 140, {
    exp: 0, gold: 0, def: 56, mdef: 56, agi: 36,
    acts: [{ w: 3, type: 'spell', name: 'Every Prayer at Once', target: 'all', pow: 58, elem: 'star', fx: 'light' }, { w: 2, type: 'attack' }, { w: 1, type: 'spell', name: 'The Only God', target: 'one', pow: 130, elem: 'holy', fx: 'holy' }, { w: 1, type: 'status', name: 'Unmake', target: 'all', status: 'stop', chance: 35, frames: 200, fx: 'dark' }, { w: 1, type: 'heal', name: 'Faith', pow: 3000, uses: 1, when: 'hurt' }],
    lines: { start: '"I am every god you ever prayed to. Bow, Captain. Everyone else already has."', half: 'Somewhere far above, the banners are still flying. The throne shudders.' },
  }),
});
Object.assign(FORMATIONS, {
  siege: [{ w: 3, e: [['thronesworn', 2, 2]] }, { w: 2, e: [['thronesworn', 1, 1], ['prayerwisp', 1, 2]] }, { w: 2, e: [['stormspawn', 1, 2], ['thronesworn', 1, 1]] }],
  godsfall: [{ w: 3, e: [['unansweredshade', 1, 2], ['prayerwisp', 1, 1]] }, { w: 2, e: [['thronesworn', 1, 1], ['unansweredshade', 1, 1]] }, { w: 1, e: [['fallengod', 1, 1], ['prayerwisp', 1, 1]] }],
  heartgarden: [{ w: 3, e: [['thornthrall', 1, 2], ['petalwraith', 1, 1]] }, { w: 2, e: [['petalwraith', 2, 3]] }],
  drownedsun: [{ w: 3, e: [['suncinder', 1, 2], ['goldenhusk', 1, 1]] }, { w: 2, e: [['suncinder', 2, 3]] }],
  starlessnight: [{ w: 3, e: [['nightling', 2, 2], ['dreadveil', 1, 1]] }, { w: 2, e: [['dreadveil', 1, 2]] }],
  godsdeep: [{ w: 3, e: [['fallengod', 1, 2], ['seatwarden', 1, 1]] }, { w: 2, e: [['seatwarden', 1, 1], ['unansweredshade', 1, 1]] }],
});
Object.assign(SHOPS, {
  lastmerchant: { weapon: ['seatbreaker', 'prayerlance', 'godclaws', 'thronecleaver', 'lastrod', 'laststaff', 'lastknife'], armor: ['halohelm', 'halocirclet', 'seatplate', 'seatleather', 'seatrobe'], item: ['godsdew', 'starmilk', 'lastlight', 'prayerjar', 'megatonic', 'heartdew', 'inkdraught', 'echomint', 'bedroll'], inn: 0, chapel: 0 },
});
