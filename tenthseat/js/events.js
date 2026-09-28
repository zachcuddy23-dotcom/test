'use strict';
// ---------------------------------------------------------------------------
// Story events for Chapter One: "The Unseated"
// ---------------------------------------------------------------------------
const R = () => HERO('raine'), MI = () => HERO('miasma'), VE = () => HERO('verai');
const VESPER = 'High Luminar Vesper';

async function tip(str) { await say(null, 'Tip: ' + str); }

// ------------------------------------------------------------------ opening
async function openingCrawl() {
  Audio2.music('title');
  await crawl([
    'In the world of Cael\'Brithar, the gods live on worship.',
    '',
    'Only ten may exist at once: the Ascendant Ten.',
    'When a god\'s faithful fade, so does the god,',
    'and a new power rises to take the empty seat.',
    '',
    'One year ago, Nyxia, the Veiled Night, was unseated.',
    'In a single night, a phoenix called Ashkar',
    'stole a divine spark meant for someone else',
    'and took her place as the Tenth Flame.',
    '',
    'The priests called it a miracle.',
    'The scholars called it a warning:',
    '',
    'A god can be replaced.',
    '',
    'Now, in Aurelion, the Bastion of Light,',
    'the Lantern Wardens sail the rivers by night,',
    'gathering the relics of forgotten gods...',
    '',
    '...for reasons they are never told.',
  ], { title: 'THE TENTH SEAT', speed: 0.6 });
}
async function bargeOpening() {
  if (flag('intro')) return;
  const f = Game.field;
  Audio2.music('prelude');
  await wait(20);
  await say('Warden Tamsin', "Captain! Lights on the east bank. That's Solanthia. We'll dock by dawn.");
  await say(R(), "Good. Double the watch on the cage until then.");
  await say('Warden', "Captain... the oracles at Moonshadow Cove. They didn't fight. They handed the Lantern over and... thanked us. For keeping it safe.");
  await say(R(), "...");
  await say(R(), "Double the watch.");
  await say(MI(), "I love a job where nobody fights back. Clean. Efficient. Deeply unsettling.");
  await say(R(), "You're paid to be settled.");
  await say(MI(), "I'm paid to be PRESENT. Settled costs extra.");
  Game.flash = 12; Audio2.sfx('dark'); Game.shake = 16;
  await say(null, "The Veil Lantern's violet flame flares. Something heavy thumps against the hull.");
  await say('Warden Tamsin', "Something's climbing aboard! River Lurkers!");
  await tip("In battle, every fighter has a TIME gauge. When a hero's gauge fills, pick their command. Enemies don't wait for you! Press X on the command menu to switch between heroes who are ready.");
  const r = await startBattle({ enemies: ['lurker', 'lurker'], bg: 'river', noRun: true });
  if (r !== 'win') return;
  await say('Warden Tamsin', "They went straight for the Lantern. Like moths to a flame.");
  await say(R(), "The flame didn't even flicker. Not once.");
  await say(MI(), "Great. A haunted lamp. Can we hand it over and get paid, please?");
  giveKey('veillantern');
  setFlag('intro');
  Audio2.music(null);
  await fadeOut(40);
  await crawl(['Dawn.', '', 'The Gilded Wake docks beneath the white walls', 'of Solanthia, the City of Dawn.'], { speed: 0.9 });
  f.enterMap('solanthia', 15, 4, 'up');
  await fadeIn(40);
  await say(R(), "The High Luminar will want the Lantern straight away. The Grand Temple is right in front of us.");
  await tip("Press X or Esc to open the menu. Talk to people and search with Z. Hold Shift to run.");
}

// ------------------------------------------------------------------ Solanthia
async function solanthiaGate() {
  if (flag('votary') && !flag('ch1end')) {
    await say('Dawnguard', "Halt! By decree of the High Luminar, the traitor Raine Cudlar and her accomplices are to be... detained. Please don't make me. I'm very bad at detaining.");
    await say(MI(), "We could just fly over the wall.");
    await say(R(), "YOU could fly over the wall.");
    await say(MI(), "And I'd think of you fondly the whole time.");
    return false;
  }
  if (flag('ch1end')) { await say('Dawnguard', "The gates are sealed. Orders from the Temple. I'm sorry, Captain."); return false; }
  return true;
}
function leaveSolanthia() {
  if (flag('mission')) return Game.field.leaveMap('X');
  return (async () => {
    if (!flag('audience')) await say(R(), "We report to the High Luminar first. The Grand Temple is at the north end of the city.");
    else await say(R(), "We leave at first light. Warden Quarters are in the south-east of the city.");
    await Game.field.walk('up', 1);
  })();
}
for (let x = 13; x <= 16; x++) MAPS.solanthia.steps = Object.assign(MAPS.solanthia.steps || {}, { [`${x},18`]: leaveSolanthia });

async function vesperAudience() {
  const f = Game.field;
  if (flag('audience')) return say(VESPER, "Hollowmere, Cudlar. Beyond the Silverleaf Wood. Leave at first light.");
  Audio2.music('sonia');
  await say(VESPER, "Captain Cudlar. And the Veil Lantern. You have done the Light a great service.");
  takeKey('veillantern');
  await notify('You hand over the Veil Lantern.', null);
  await say(VESPER, "Nine relics, from nine lesser faiths. Soon it will be ten.");
  await say(R(), "High Luminar... may I ask what they're for? The oracles at the Cove are pacifists. They thanked us.");
  await say(VESPER, "Of course they did. Nyxia's children have always been grateful for chains, as long as the chains are soft.");
  await say(R(), "With respect, that isn't an answer.");
  await say(VESPER, "No. It is a warning. A Warden who asks 'why' is a Warden who has begun to doubt. And doubt, Captain, is a door. Something always walks through it.");
  await say(VESPER, "You are relieved of command of the Lantern Wardens. Lieutenant Tamsin will take the Gilded Wake.");
  await say(MI(), "Whoa, whoa, whoa. She brought back your spooky lamp. Do I still get paid?");
  await say(VESPER, "The dragon's contract transfers. Good. One last errand, Cudlar. Carry this Dawn Censer to the village of Hollowmere, beyond the Silverleaf Wood, and set it in their square. It will consecrate their shrine to the Light.");
  await say(R(), "...Hollowmere.");
  await say(VESPER, "You know it?");
  await say(R(), "...I was born there.");
  await say(VESPER, "Then you know the way. Rest tonight in the Warden Quarters. Leave at first light.");
  giveKey('censer');
  await notify('Received the Dawn Censer.', null);
  await say(null, "The censer is warm in your hands. It hums, very softly, like someone singing behind a closed door.");
  setFlag('audience');
  Audio2.music(f.map.music);
}
async function quartersNight() {
  const f = Game.field;
  await say(MI(), "So. 'Born there.' In four years you've never once mentioned a hometown. I assumed you hatched. Like me.");
  await say(R(), "You didn't hatch.");
  await say(MI(), "Emotionally, I hatched.");
  await say(R(), "...My sister still lives there. Verai. I left to join the Wardens. I told her the gods don't need smoke and candles, they need people who DO things.");
  await say(R(), "I haven't written in four years.");
  await say(MI(), "Oof. Well, nothing says 'I'm sorry' like turning up with your boss's mysterious humming box.");
  await say(R(), "It's a blessing. For their shrine.");
  await say(MI(), "Mm-hm. You know what else hums? Hornets. Bombs. My uncle, right before he explodes at dinner.");
  await say(R(), "Go to sleep, Miasma.");
  await say(MI(), "Ooh, is that an order? You can't give those anymore, Captain.");
  Audio2.music(null);
  await fadeOut(40); healAll();
  // Meanwhile, at the temple...
  Audio2.music('sonia');
  await card({ caption: 'Meanwhile, in the Grand Temple, the Great Lens gathers no light at all.', time: 260, top: '#000000', bot: '#1a0a24' });
  await say('???', "Nine seats sit comfortable. One sits loose.");
  await say('???', "Enjoy it while it lasts, little phoenix. Soon you'll learn what it's like to be a thief who gets robbed.");
  Audio2.music(null);
  await wait(30);
  setFlag('mission');
  f.enterMap('quarters', 5, 2, 'down');
  await fadeIn(40);
  await say(MI(), "Rise and shine, ex-Captain. The dawn's dawning. Loudly. In my eyes.");
  await say(R(), "Silverleaf Wood is west of the city, past the bend in the mountains. Hollowmere is on the far side.");
  await tip("On the world map, walk onto a town or dungeon to enter it. You can save anywhere on the world map, or beside a Dawn Lantern. Stock up on Tonics first!");
}

// ------------------------------------------------------------------ Silverleaf Wood
async function veilstagEvent() {
  if (flag('stag') || Game.field._stagBusy) return;
  Game.field._stagBusy = true;
  try {
    await say(null, "A great stag of black bark and glowing teal cracks steps out of the mist. Its eyes shine like old moonlight.");
    await say(MI(), "Is that... normal forest wildlife?");
    await say(R(), "The Veilstag. When we were little, Verai said it walked into her dreams to keep the bad ones out.");
    await say(null, "The Veilstag lowers its antlers, and looks straight at the censer. The censer hums louder.");
    await say(MI(), "It doesn't like the box. Frankly, neither do I.");
    await say(R(), "We have to get through. ...I'm sorry.");
    const r = await startBattle({ enemies: ['veilstag'], boss: true, bg: 'deepwood', music: 'boss', noRun: true });
    if (r !== 'win') return;
    setFlag('stag'); giveKey('stagantler');
    await say(null, "The Veilstag staggers, but doesn't fall. It comes apart into smoke, and the smoke drifts west, toward Hollowmere.");
    await say(R(), "It wasn't attacking us. It was... standing in the road.");
    await say(MI(), "Standing in the road to stop what?");
    await say(R(), "...");
    await say(null, 'Found a Veilstag Antler.');
  } finally { Game.field._stagBusy = false; }
}

// ------------------------------------------------------------------ Hollowmere
async function hollowmereArrival() {
  const f = Game.field;
  if (!flag('stag')) return say(VE(), "...");
  Audio2.music('elf');
  await say(VE(), "...Raine?");
  await say(R(), "Hi, Verai.");
  await say(VE(), "Four years. Four YEARS. Not a letter, not a word... and now you walk in wearing a Warden's coat, with a dragon.");
  await say(MI(), "Hi. Contractor. Pretend I'm furniture.");
  await say(VE(), "...You look tired. Come inside. I'll make tea. The bad kind, the kind you like.");
  await say(R(), "I can't stay. I'm here on duty. The High Luminar sent a blessing for the shrine.");
  await notify('Raine takes out the Dawn Censer.', null);
  await say(VE(), "Raine... my smoke is hiding from it.");
  takeKey('censer');
  Game.flash = 14; Audio2.sfx('boom'); Game.shake = 30;
  await say(null, "The censer cracks. Golden light pours out of it, and a shape unfolds from the light like a hymn catching fire.");
  Audio2.music('boss');
  await say('Sunscarred Votary', "Rejoice. The Light has come home.");
  await say(null, "Fire leaps from rooftop to rooftop.");
  await say(VE(), "No... the houses! Everyone, RUN!");
  await say(R(), "Verai, get back!");
  await say(VE(), "This is MY village, Raine. You don't get to leave AND protect it!");
  const v = addMember('verai');
  v.jobs.dawnsinger = { lv: 3, jp: JP_TABLE[3] };
  await notify('Verai joins the party!', 'levelup');
  const r = await startBattle({ enemies: ['votary'], boss: true, bg: 'burning', music: 'boss', noRun: true });
  if (r !== 'win') return;
  await say('Sunscarred Votary', "...The Luminar... will sing... for you... too...");
  setFlag('votary'); setFlag('pass');
  Audio2.music(null);
  await fadeOut(40);
  f.enterMap('hollowash', 12, 8, 'up');
  await fadeIn(40);
  Audio2.music('sorrow');
  await say(VE(), "The Veilstag. It just came to me, in a dream, while we were fighting. It was hurt. It said a woman in a black coat killed it on the forest road.");
  await say(R(), "...It was blocking the path. I didn't know.");
  await say(VE(), "You never KNOW, Raine! That's the whole problem! You follow orders so you never have to know!");
  await wait(40);
  await say(MI(), "...For the record, I also didn't know. And I'm very sorry about your stag. And your village. That's a lot of sorry. I'm just going to stand over here.");
  await say(VE(), "...The High Luminar sent that thing. It wasn't a mistake.");
  await say(R(), "No. Not a mistake. She knew I was from here. She wanted me to be the one who carried it.");
  await say(VE(), "Then I'm coming with you.");
  await say(R(), "Verai...");
  await say(VE(), "Not because I forgive you. Because someone has to make sure you ask 'why' this time.");
  await say(MI(), "Oh, I like her. Can she be in charge?");
  await tip("Open the menu and choose Job to change a hero's job at any time. Each job has its own command, and learns new skills as its rank rises from battle JP. Every hero also keeps their own command: Raine's Brew, Miasma's Breath and Verai's Smoke.");
  await say(VE(), "The survivors went south, through the Dreamers' Pass. The mountains opened for them. They'll open for us.");
}
async function ashShrine() {
  if (flag('reaperJob')) return say(null, "The cracked shrine is cold now. The smell of ash won't leave.");
  await say(null, "The black stone shrine has split in the heat. The crack looks like an anvil broken by an axe: Grimnar's mark.");
  await say(VE(), "Grimnar, the Ash-Father. He says everything has to be reforged through suffering.");
  await say(R(), "Then he'd like it here.");
  openJob('reaper'); setFlag('reaperJob');
  await notify('The Ash Reaper job is now available!', 'levelup');
}

// ------------------------------------------------------------------ Goldengrove
async function bridgeEvent() {
  const P = 'Bridgewarden Pip';
  if (flag('bridge')) return say(P, "Bridge is down and staying down! The Dawnguard can raise it themselves. They'll need a stool. Maybe two.");
  if (!flag('votary')) return say(P, "I'm the Bridgewarden! I look after the Aurora Bridge. The Dawnguard said to keep it raised. Very hush-hush. I'm telling everyone.");
  await say(P, "Halt! Er, hello! I'm the Bridgewarden. The Dawnguard ordered the Aurora Bridge raised, to keep the heretics from crossing.");
  await say(MI(), "Which heretics?");
  await say(P, "They didn't say! I asked for a description, and they said 'you'll know them when you see them.' Which is a terrible description.");
  await say(VE(), "Please. Our village burned. Everyone we have left is heading east.");
  await say(P, "...Burned? By who?");
  await say(R(), "By the Light.");
  await wait(40);
  await say(P, "...Well. My gran always said, if the Light needs a raised bridge to stay bright, it isn't much of a light.");
  await say(P, "Lever's going down!");
  Audio2.sfx('boom'); Game.shake = 14;
  setFlag('bridge');
  await notify('The Aurora Bridge has been lowered!', 'chest');
  await say(P, "Brightwater's straight east, over the river. Tell the harbormaster Pip sent you. He won't know who that is. It'll be funny.");
}

// ------------------------------------------------------------------ Brightwater
async function grellEvent() {
  const G = 'Harbormaster Grell';
  if (flag('wren')) return say(G, "The Wren's by the eastern pier. South across the Harmony Sea is Elaris's Embrace. Mind the reefs. The light's back, but the reefs didn't get the message.");
  if (flag('chimera')) return grellReward();
  if (flag('harbor')) return say(G, "Tower of Dawn is on the spit, south-east of town. Bring back my light, and I'll make it worth your while.");
  await say(G, "Welcome to Brightwater. Mind the gloom. The Tower of Dawn went dark a month back, right after some Dawnguard carried a crate up there.");
  await say(G, "Something's been nesting at the top ever since. Something with three heads, if you believe the gulls. And I do. Gulls don't lie. They steal, but they don't lie.");
  await say(R(), "Dawnguard. From Solanthia?");
  await say(G, "Gold helmets, no manners. I asked the Luminar's office to relight the tower. They said it was 'being reconsecrated.' Ships sink while they reconsecrate.");
  await say(VE(), "We'll go. If the High Luminar put something up there, we need to see it.");
  await say(G, "Ha! A half-orc, a dragon, a witch and a Warden walk into a lighthouse... No punchline. Just a bad day for whatever's up there.");
  giveKey('harborpass'); setFlag('harbor');
  await notify('Received the Harbor Pass!', 'chest');
  await say(G, "The tower's on the spit, south-east of town.");
}
async function grellReward() {
  const G = 'Harbormaster Grell';
  await say(G, "The light! Look at it, sweeping the bay like it never left! You did that.");
  await say(G, "You've earned the Wren. She's my old skiff. Patched sail, sound hull. She'll go anywhere the water goes, rivers too.");
  giveKey('wrenkey'); setFlag('wren'); S().ship = { x: 55, y: 24 };
  await notify('Received the Wren! She is moored by the eastern pier.', 'levelup');
  await say(G, "One more thing. Last week a gilded barge sailed south flying the Luminar's colors, toward the isle of Elaris's Embrace. Pilgrims say the Heartkeeper's reliquary sleeps under the twin falls there.");
  await say(VE(), "Elaris's reliquary... Raine, that's the Heartseed.");
  await say(R(), "Then that's where Vesper is going next.");
  await tip("Walk onto the Wren on the world map to set sail. Walk onto land to leave her.");
}
async function thalaraShrine() {
  if (flag('tideJob')) return say(null, "A shrine to Thalara, Mistress of Tides. Salt water sits in the basin, and it's perfectly still.");
  await say(null, "A shrine to Thalara, Mistress of Tides: a cresting wave with a serpent in it. The water in the basin ripples, though there is no wind.");
  await say(VE(), "The sea reflects the soul. That's what her priests say.");
  await say(MI(), "Then the sea is looking at me very judgmentally right now.");
  setFlag('tideJob'); openJob('tidecaller');
  await notify('The Tidecaller job is now available!', 'levelup');
}
async function towerGate() {
  if (hasKey('harborpass')) return true;
  await say(null, "The tower door is barred. A notice is nailed to it: CLOSED FOR RECONSECRATION. BY ORDER OF THE HIGH LUMINAR.");
  await say(MI(), "I could kick it in.");
  await say(R(), "Let's ask the harbormaster first. Brightwater's just north-west of here.");
  return false;
}
async function chimeraEvent() {
  if (flag('chimera') || Game.field._chimBusy) return;
  Game.field._chimBusy = true;
  try {
    await say(null, "The Sunforged Chimera is coiled around the great lamp. Three halos burn above its three heads, and gold stitches hold its body together.");
    await say(VE(), "It's been... sewn. Three animals sewn into one.");
    await say(MI(), "Lion, dragon, snake. That's a lot of opinions for one body.");
    await say(R(), "The Sunlens is underneath it. That's why the tower is dark. It's eating the light.");
    const r = await startBattle({ enemies: ['chimera'], boss: true, bg: 'tower', music: 'boss', noRun: true });
    if (r !== 'win') return;
    setFlag('chimera'); giveKey('sunlens');
    Game.flash = 20; Audio2.sfx('holy');
    await say(null, "You set the Sunlens back in its cradle. Light blazes out across the sea.");
    await say(MI(), "...Huh. When I was fighting that dragon head, something in my blood woke up. It's very loud. It wants to JUMP on things.");
    openJob('wyrmblood');
    await notify('The Wyrmblood job is now available!', 'levelup');
    await say(R(), "Let's get back to the harbormaster.");
  } finally { Game.field._chimBusy = false; }
}

// ------------------------------------------------------------------ Elaris's Embrace
async function colossusEvent() {
  if (flag('colossus') || Game.field._colBusy) return;
  Game.field._colBusy = true;
  try {
    await say(null, "Stone, root and moss, grown into the shape of a giant. A purple bloom opens on its shoulder, and a heartbeat thuds through the valley.");
    await say(VE(), "Elaris's guardian. It's protecting her reliquary, the Heartseed.");
    await say(R(), "Then why is it coming at us?");
    await say(VE(), "Because it's afraid. Someone has already been here.");
    const r = await startBattle({ enemies: ['bloomcolossus'], boss: true, bg: 'vale', music: 'boss', noRun: true });
    if (r !== 'win') return;
    setFlag('colossus');
    await say(null, "The Colossus kneels, then settles into moss and stone. Where its heart was, a seed pulses with a slow, warm beat.");
    await soniaReveal();
  } finally { Game.field._colBusy = false; }
}
async function soniaReveal() {
  if (flag('ch1end')) return;
  Audio2.music('sonia');
  await say(VESPER, "Beautifully done, Cudlar. I could never have broken its heart. It knew what I was.");
  await say(R(), "High Luminar.");
  await say(VESPER, "Stubborn, loyal, and so easy to aim. Did you never wonder why every order you were given sent you to the shrine of some other god?");
  await say(VE(), "You burned my home.");
  await say(VESPER, "I burned a whisper. Nyxia's last whispers, gathered in one little village. Every prayer to a dead god is a prayer that might wake her. I couldn't allow that.");
  await say(R(), "Why? Nyxia is gone. The Tenth Flame took her seat.");
  await say(VESPER, "Took it from WHOM, Captain?");
  await say(VESPER, "...That seat was mine.");
  Game.flash = 20; Audio2.sfx('dark'); Game.shake = 30;
  await card({ img: 'b_sonia', scale: 1.3, caption: "Vesper's face cracks like old paint. Underneath is a woman wearing Sylara's halo and Nyxia's stolen shadows.", time: 420, top: '#000000', bot: '#2a1040' });
  await say('Sonia', "I am Sonia. I was one breath away from godhood when a little phoenix stole it out of my hands.");
  await say('Sonia', "I've learned patience since. Ten reliquaries anchor the Ten. Take away the anchors and the faithful lose their way. And a god with no faithful...");
  await say(VE(), "...stops.");
  await say('Sonia', "Clever girl. First, the Heartseed. Elaris fades, her seat opens... and someone who has waited a very long time sits down.");
  await say(MI(), "Okay, I've heard enough villain speech. Can we hit her now?");
  await startBattle({ enemies: ['sonia'], boss: true, bg: 'sanctum', music: 'final', noRun: true, cantLose: true, turnLimit: 5 });
  Audio2.music('sonia');
  await say('Sonia', "Adorable. You fight like people who think the gods are watching.");
  await say(null, "Sonia closes her hand. The Heartseed tears free of the moss and flies into her palm, still beating.");
  await say('Sonia', "Elaris will dim by the next full moon. Run home, Captain. Oh... that's right. You don't have one anymore.");
  Game.flash = 16; Audio2.sfx('dark');
  await say(null, "Sonia is gone. The twin falls go on roaring, as if nothing happened.");
  await wait(40);
  await say(VE(), "...Elaris. The goddess of love is going to die. Because of a seed.");
  await say(R(), "No. Because of me. I carried the censer. I cleared the road. Every relic she has, I brought to her.");
  await say(VE(), "...Then help me take them back.");
  await say(MI(), "Team Take-Them-Back. I love it. What's the pay?");
  await say(R(), "Nothing.");
  await say(MI(), "...Oh, I'm in, obviously. I just like to ask.");
  setFlag('ch1end');
  await chapterEnd();
}
async function chapterEnd() {
  Audio2.music('title');
  await fadeOut(60);
  const st = S(), t = Math.floor(st.playTime / 60);
  await crawl([
    'The Heartseed is gone.',
    'Somewhere, a goddess of love grows quiet.',
    '',
    'Sonia, the Unseated, holds a goddess\'s heart in her hand,',
    'and the patience of someone who has already lost once.',
    '',
    'Raine Cudlar is a traitor to the Light.',
    'Verai Cudlar has no home.',
    'Miasma is still, technically, unpaid.',
    '',
    'And far across the sea, in the land of ash and flame,',
    'a phoenix god opens one golden eye...',
    '',
    ...st.party.map(m => `${m.name}  Lv ${m.lvl}  ${JOBS[m.job].name}`),
    `Play time ${Math.floor(t / 3600)}h ${Math.floor(t / 60) % 60}m   Battles ${st.battles}`,
    '',
    '- END OF CHAPTER ONE: THE UNSEATED -',
    '',
    'Chapter Two: The Tenth Flame',
    '',
    'Thank you for playing!',
    '(Your game has been saved. You can keep exploring.)',
  ], { title: 'CHAPTER ONE COMPLETE', speed: 0.6 });
  saveGame();
  await fadeIn(40);
  Audio2.music(musicFor(Game.field.map));
}
MAPS.barge.onEnter = () => bargeOpening();
MAPS.hollowmere.onEnter = async () => {
  if (!flag('stag') || flag('votary')) return;
  const f = Game.field;
  await wait(30);
  await f.walk('up', 2);
  await f.npcWalk(3, ['left', 'left', 'left', 'left', 'down', 'down', 'down', 'down', 'down', 'left']);
  f.npcFace(3, 'left'); S().dir = 'right';
  await hollowmereArrival();
};
