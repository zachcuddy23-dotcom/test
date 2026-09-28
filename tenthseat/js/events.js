'use strict';
// ---------------------------------------------------------------------------
// Story events for Chapter One: "The Unseated"
//
// Secrets the player learns before the party does:
//  - Miasma is Raine's mother. Raine was told by her father, High Knight Odeaon,
//    that her mother was killed by a dragon. Miasma knows, and pretends she's
//    just a hired freelancer.
//  - Verai is a foundling Raine befriended when all of Hollowmere feared her
//    shadow powers. She is Sonia's daughter (revealed at the Twin Falls).
//  - Luna is a monster (a moonfang) disguised as a Dawnguard knight, trying to
//    prove monsters can be good. The party can "catch" her several times.
//
// Tracked choices: flags.bond (Verai), flags.lunaCaught / flags.lunaTrust.
// ---------------------------------------------------------------------------
const R = () => HERO('raine'), MI = () => HERO('miasma'), VE = () => HERO('verai'), LU = () => HERO('luna');
const VESPER = 'High Luminar Vesper', ODEAON = 'High Knight Odeaon';
const F = () => Game.field;
function addFlag(k, n = 1) { S().flags[k] = (S().flags[k] || 0) + n; }
function num(k) { return S().flags[k] || 0; }

async function tip(str) { await say(null, 'Tip: ' + str); }

// Run a staged scene: letterbox bars, the whole party on the map as actors.
async function scene(fn, o = {}) {
  const f = F();
  f.letterbox(true);
  const cast = f.cast(o.layout, o.skip);
  try { await fn(cast, f); }
  finally {
    await f.uncast();
    await f.letterbox(false);
    if (f.cam) await f.panBack(20);
    f.hideNpc = null;
  }
}
// Temporarily turn a map NPC into an actor so it can act.
function npcActor(key) {
  const f = F(), n = f.npcs.find(q => q.key === String(key)); if (!n) return null;
  f.hideNpc = f.hideNpc || new Set(); f.hideNpc.add(n.key);
  return f.spawn({ id: 'npc' + key, look: n.def.look, name: n.def.name, x: n.x, y: n.y, dir: n.dir });
}
function faceAll(actors, target) { for (const a of actors) if (a && a !== target) a.face(target); }

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
    'A phoenix called Ashkar stole the spark meant',
    'for someone else, and became the Tenth Flame.',
    '',
    'The priests called it a miracle.',
    'The scholars called it a warning:',
    '',
    'A god can be replaced.',
  ], { title: 'THE TENTH SEAT', speed: 0.7 });
  await cinema([
    { dur: 260, bg: 'river', music: 'prelude', sub: 'The Aurora River  ·  three nights out from Moonshadow Cove', caption: 'The Lantern Wardens\' barge, the Gilded Wake, sails home in the dark.' },
    { dur: 200, bg: 'river', caption: 'In its hold, a stolen relic burns with a violet flame that never flickers.' },
  ], { skipAll: true });
}
async function bargeOpening() {
  if (flag('intro')) return;
  const f = F();
  Audio2.music('prelude');
  await wait(20);
  await scene(async ({ raine, miasma }) => {
    const tam = npcActor(2), w3 = npcActor(3), w4 = npcActor(4); f.hideNpc.add('5');
    miasma.x = 11; miasma.y = 5; miasma.dir = 'left';
    await tam.walkTo(7, 4); tam.face('down'); raine.face('up');
    await say('Warden Tamsin', "Captain! Lights on the east bank. That's Solanthia. We'll dock by dawn.");
    await raine.nod(1);
    await say(R(), "Good. Double the watch on the cage until then.");
    w3.face(raine);
    await say('Warden', "Captain... the oracles at Moonshadow Cove. They didn't fight. They handed the Lantern over and... thanked us.");
    raine.face('left'); await wait(20); raine.face('up');
    await raine.sad(); await say(R(), "...Double the watch.");
    await miasma.walk(['left', 'left']); miasma.face(raine);
    await say(MI(), "I love a job where nobody fights back. Clean. Efficient. Deeply unsettling.");
    raine.face(miasma);
    await say(R(), "You're paid to be settled.");
    await miasma.shake();
    await say(MI(), "I'm paid to be PRESENT. Settled costs extra.");
    await say(MI(), "Also you haven't slept in three days, kid. Your eyes look like two burnt biscuits.");
    await raine.angry();
    await say(R(), "Don't call me kid.");
    await miasma.laugh(3);
    Game.flash = 12; Audio2.sfx('dark'); Game.shake = 20;
    await Promise.all([raine.surprise(), miasma.surprise(), tam.surprise(), w3.surprise(), w4.surprise()]);
    faceAll([raine, miasma, tam, w3, w4], { x: 7, y: 2 });
    await say(null, "The Veil Lantern's violet flame flares. Something heavy thumps against the hull.");
    await say('Warden Tamsin', "Something's climbing aboard! River Lurkers!");
    await raine.lunge();
    await say(R(), "Wardens, protect the cage! Miasma, with me!");
    await tip("In battle, each hero has a TIME gauge. When it fills, pick a command. Enemies don't wait for you! Press X on the command menu to switch between heroes who are ready.");
    const r = await startBattle({ enemies: ['lurker', 'lurker'], bg: 'river', noRun: true });
    if (r !== 'win') throw new Error('lost');
    await say('Warden Tamsin', "They went straight for the Lantern. Like moths to a flame.");
    raine.face('up');
    await say(R(), "The flame didn't even flicker. Not once.");
    miasma.face(raine);
    await say(MI(), "Great. A haunted lamp. Can we hand it over and get paid, please?");
    miasma.face('up'); await wait(30); miasma.face(raine);
    await say(null, "When Raine isn't looking, Miasma watches her for a long moment. Then she looks away.");
    f.despawn(tam); f.despawn(w3); f.despawn(w4);
  });
  giveKey('veillantern');
  setFlag('intro');
  Audio2.music(null);
  await fadeOut(40);
  await cinema([{ dur: 220, bg: 'dawn', music: 'title', sub: 'Solanthia, the City of Dawn', caption: 'Dawn. The Gilded Wake docks beneath the white walls of Solanthia.' }], { skipAll: true });
  f.enterMap('solanthia', 15, 4, 'up');
  await fadeIn(40);
  await say(R(), "The High Luminar will want the Lantern straight away. The Grand Temple is right in front of us.");
  await tip("Press X or Esc to open the menu. Talk to people and search with Z. Hold Shift to run. If anything ever gets stuck, press F2 or the DEBUG button.");
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
  if (flag('mission')) return F().leaveMap('X');
  return (async () => {
    if (!flag('audience')) await say(R(), "We report to the High Luminar first. The Grand Temple is at the north end of the city.");
    else await say(R(), "We leave at first light. The Warden Quarters are in the south-east of the city.");
    await F().walk('up', 1);
  })();
}
for (let x = 13; x <= 16; x++) MAPS.solanthia.steps = Object.assign(MAPS.solanthia.steps || {}, { [`${x},18`]: leaveSolanthia });
// Miasma refuses to set foot in the temple while Odeaon is inside
MAPS.solanthia.steps['15,3'] = async () => {
  if (flag('audience') || flag('miasmaWaits')) return;
  setFlag('miasmaWaits');
  await scene(async ({ raine, miasma }) => {
    raine.face('up'); miasma.face('up');
    await say(null, "Through the open temple doors: silver armor, a blue cape. A tall knight stands beside the altar.");
    await miasma.surprise();
    await miasma.stepBack();
    await say(MI(), "...You know what? Temples make my scales itch. I'll wait out here.");
    raine.face(miasma); await raine.question();
    await say(R(), "That's my father in there. High Knight Odeaon. You've never met him.");
    await miasma.sweat();
    await say(MI(), "And I'd like to keep my perfect record. Go on. Report. Be dutiful. I'll be... over there. Being furniture.");
    await miasma.walk(['down', 'down']);
  }, {});
};

async function vesperAudience() {
  const f = F();
  if (flag('audience')) return say(VESPER, "Hollowmere, Cudlar. Beyond the Silverleaf Wood. Leave at first light.");
  Audio2.music('sonia');
  await scene(async ({ raine }) => {
    const ves = npcActor(1), ode = npcActor(6);
    raine.face('up');
    await say(VESPER, "Captain Cudlar. And the Veil Lantern. You have done the Light a great service.");
    await raine.nod(1);
    takeKey('veillantern');
    await notify('You hand over the Veil Lantern.', null);
    await say(VESPER, "Nine relics, from nine lesser faiths. Soon it will be ten.");
    ode.face(raine);
    await say(ODEAON, "Raine.");
    raine.face(ode);
    await say(R(), "Father.");
    await wait(30); ode.face('down'); raine.face('up');
    await say(R(), "High Luminar... may I ask what the relics are for? The oracles at the Cove are pacifists. They thanked us.");
    await ode.surprise();
    await say(VESPER, "Of course they did. Nyxia's children have always been grateful for chains, as long as the chains are soft.");
    await say(R(), "With respect, that isn't an answer.");
    await ves.walk('down'); ves.face(raine);
    await raine.stepBack();
    await say(VESPER, "No. It is a warning. A Warden who asks 'why' is a Warden who has begun to doubt. And doubt, Captain, is a door. Something always walks through it.");
    await say(VESPER, "You are relieved of command of the Lantern Wardens. Lieutenant Tamsin will take the Gilded Wake.");
    ode.face(ves); await ode.tremble(20);
    await say(ODEAON, "Luminar, she has served without fault for four years—");
    ves.face(ode);
    await say(VESPER, "And she will serve once more. Carry this Dawn Censer to the village of Hollowmere, beyond the Silverleaf Wood. Set it in their square. It will consecrate their shrine.");
    ves.face(raine); await raine.surprise();
    await say(R(), "...Hollowmere. I grew up there.");
    await say(VESPER, "Then you know the way. Leave at first light.");
    giveKey('censer');
    await notify('Received the Dawn Censer.', null);
    await say(null, "The censer is warm. It hums very softly, like someone singing behind a closed door.");
    await ves.walk('up'); ves.face('down');
    ode.face(raine);
    await say(ODEAON, "The mercenary you travel with. The dragon-blooded one. What does she call herself?");
    await say(R(), "Miasma. Why?");
    await wait(40);
    await say(ODEAON, "...No reason. Be careful with that one, Raine.");
    await ode.walk('up'); ode.face('down');
    f.despawn(ves); f.despawn(ode);
  }, { skip: ['miasma'] });
  setFlag('audience');
  Audio2.music(musicFor(f.map));
}
async function quartersNight() {
  const f = F();
  await scene(async ({ raine, miasma }) => {
    miasma.face(raine); raine.face(miasma);
    await say(MI(), "So. Your father's a High Knight. And you grew up in some village in the woods. In four years you never mentioned any of that.");
    await say(R(), "He was always away on campaign. A nurse raised me in Hollowmere. He visited on my birthday. Some years.");
    await say(MI(), "...And your mother?");
    raine.face('down');
    await say(R(), "Dead. A dragon killed her when I was a baby. That's what Father says. It's all he's ever said.");
    await miasma.tremble(60);
    await say(null, "Miasma's wings twitch. For a moment she doesn't breathe.");
    await say(MI(), "...A dragon. Huh. Well. Dragons are the worst. Famously. Everyone knows that.");
    raine.face(miasma); await raine.question();
    await say(R(), "You're a dragon.");
    await miasma.sweat();
    await say(MI(), "HALF. And I'm the worst half. Go to sleep, Raine.");
    await say(R(), "There was one good thing in Hollowmere. A girl named Verai. Everyone was afraid of her. Her shadows moved on their own. I wasn't afraid.");
    await say(R(), "I promised I'd write when I joined the Wardens. I never did.");
    await miasma.walk('left'); miasma.face(raine);
    await say(MI(), "Well. Tomorrow you get to apologize with your boss's mysterious humming box.");
    await say(MI(), "You know what else hums? Hornets. Bombs. My cousin, right before he explodes at dinner.");
    await raine.laugh(2);
    await say(R(), "Goodnight, Miasma.");
    raine.pose = 'down';
    await wait(40);
  });
  Audio2.music(null);
  await fadeOut(40); healAll();
  // --- Night: Miasma slips out alone; Odeaon finds her ---
  Audio2.music('sorrow');
  f.enterMap('solanthia', 25, 16, 'down'); f.nightTint = 'rgba(10,20,70,0.5)';
  const allButMiasma = S().party.map(m => m.id).filter(id => id !== 'miasma');
  await scene(async ({ miasma }) => {
    f.hideNpc = new Set(['1', '2', '3', '4', '5', '6', '7', '8']);
    f.cam = { x: 20, y: 12 };
    miasma.x = 25; miasma.y = 15; miasma.dir = 'down'; miasma.alpha = 0;
    await fadeIn(40);
    await say(null, "Past midnight. Raine is asleep. The door of the Warden Quarters opens, very quietly.");
    await miasma.fadeIn(20);
    await miasma.walk('down');
    miasma.face('up'); await wait(40);
    await miasma.sad(70);
    await miasma.walk(['left', 'left', 'left', 'left', 'left', 'left', 'left', 'left', 'left'], 16);
    await miasma.walk(['up', 'up', 'up', 'up', 'up', 'up', 'up'], 16);
    miasma.face('left'); await wait(30);
    await miasma.kneel();
    await say(null, "Miasma sits on the edge of the fountain. The water is loud in the empty square.");
    await say(MI(), "...'A dragon killed your mother.' Seventeen years, and she says it like it's the weather.");
    miasma.face('up'); await wait(40);
    await say(MI(), "She has my hair. She has his stubbornness. Gods help everyone.");
    await miasma.sad(60);
    const ode = f.spawn({ id: 'odeaon', look: 'odeaon', name: ODEAON, x: 13, y: 3, dir: 'down', alpha: 0 });
    await ode.fadeIn(20);
    await ode.walk(['down', 'down', 'down', 'down', 'down', 'down'], 18);
    await ode.walk(['right', 'right'], 18); ode.face(miasma);
    await say(ODEAON, "You swore you would stay away from her.");
    await miasma.stand(); miasma.face(ode); await miasma.surprise();
    await say(MI(), "...I swore I'd stay away from YOU. I'm doing great at that part. Look how far away I'm standing.");
    await ode.walk('right'); await miasma.stepBack();
    await say(ODEAON, "She believes her mother is dead.");
    await miasma.angry();
    await say(MI(), "Because you TOLD her so. 'A dragon killed your mother.' Did it feel clever? Hiding the truth inside a true sentence?");
    await ode.sad();
    await say(ODEAON, "If the Temple learned my daughter is half dragon, they would put her on a pyre and call it a blessing. I kept her alive.");
    miasma.face('left'); await wait(20);
    await say(MI(), "And I kept my distance. I watched her grow up from the edge of the Silverleaf. I watched her leave. Then I got myself hired so I could watch her work.");
    await miasma.kneel();
    await say(MI(), "So don't you dare lecture me about staying away, Odeaon.");
    await wait(50);
    await say(ODEAON, "...The censer. I don't know what the Luminar put in it. Watch over her.");
    await miasma.stand(); miasma.face(ode);
    await say(MI(), "I always have.");
    await ode.walk(['left', 'left', 'up', 'up', 'up', 'up', 'up', 'up'], 18); await ode.fadeOut(20); f.despawn(ode);
    miasma.face('right'); await wait(40);
    await say(null, "Miasma looks back toward the Warden Quarters for a long time.");
    await say(MI(), "...Goodnight, little ember.");
    await miasma.fadeOut(40);
  }, { skip: allButMiasma });
  f.cam = null;
  f.nightTint = null;
  Audio2.music('sonia');
  await card({ caption: 'Meanwhile, in the Grand Temple, the Great Lens gathers no light at all.', time: 260, top: '#000000', bot: '#1a0a24' });
  await say('???', "Nine seats sit comfortable. One sits loose.");
  await say('???', "And somewhere in the woods, a little shadow I left behind is still breathing. How sweet.");
  Audio2.music(null);
  await wait(30);
  setFlag('mission');
  f.enterMap('quarters', 5, 2, 'down');
  await fadeIn(40);
  await scene(async ({ raine, miasma }) => {
    miasma.x = 5; miasma.y = 3; miasma.dir = 'up'; raine.face('down');
    await say(MI(), "Rise and shine, ex-Captain. The dawn's dawning. Loudly. In my eyes.");
    await raine.question();
    await say(R(), "You look like you didn't sleep at all.");
    await miasma.shake();
    await say(MI(), "Dragons don't sleep. We brood. It's very glamorous.");
    await say(R(), "Silverleaf Wood is west of the city, past the bend in the mountains. Hollowmere is on the far side.");
  });
  await tip("Walk onto a town or dungeon on the world map to enter it. Save on the world map or beside a Dawn Lantern. Stock up on Tonics first!");
}

// ------------------------------------------------------------------ Silverleaf Wood
async function veilstagEvent() {
  const f = F();
  if (flag('stag') || f._stagBusy) return;
  f._stagBusy = true;
  try {
    Audio2.music('sonia');
    await scene(async ({ raine, miasma }) => {
      faceAll([raine, miasma], { x: 4, y: 4 });
      await f.pan(5, 4, 40);
      await say(null, "A great stag of black bark and glowing teal cracks steps out of the mist. Its eyes shine like old moonlight.");
      await miasma.stepBack();
      await say(MI(), "Is that... normal forest wildlife?");
      await say(R(), "The Veilstag. Verai used to say it walked into her dreams to keep the bad ones out.");
      await say(null, "The Veilstag lowers its antlers and stares straight at the censer. The censer hums louder.");
      await miasma.sweat();
      await say(MI(), "It doesn't like the box. Frankly, neither do I.");
      await raine.walk('left');
      await say(R(), "We have to get through. ...I'm sorry.");
    });
    const r = await startBattle({ enemies: ['veilstag'], boss: true, bg: 'deepwood', music: 'boss', noRun: true });
    if (r !== 'win') return;
    setFlag('stag'); giveKey('stagantler');
    await scene(async ({ raine, miasma }) => {
      await say(null, "The Veilstag staggers, but doesn't fall. It comes apart into smoke, and the smoke drifts west, toward Hollowmere.");
      await raine.kneel();
      await say(R(), "It wasn't attacking us. It was... standing in the road.");
      miasma.face(raine);
      await say(MI(), "Standing in the road to stop what?");
      await raine.stand(); raine.face('down'); await raine.sad();
      await say(null, 'Found a Veilstag Antler.');
    });
    Audio2.music(musicFor(f.map));
  } finally { f._stagBusy = false; }
}

// ------------------------------------------------------------------ Hollowmere
async function hollowmereArrival() {
  const f = F();
  if (!flag('stag') || flag('votary')) return;
  Audio2.music('elf');
  await scene(async ({ raine, miasma }) => {
    const ve = npcActor(3);
    await f.pan(12, 9, 30);
    await ve.walk(['left', 'left', 'left', 'left', 'down', 'down', 'down', 'down']);
    await ve.surprise();
    await say(VE(), "...Raine?");
    raine.face(ve);
    await say(R(), "Hi, Verai.");
    await ve.walk('down');
    await say(VE(), "Four years. Four YEARS. You said you'd write. Every week, you said. I waited by the mill road like an idiot.");
    await say(VE(), "And now you walk in wearing a Warden's coat, with a dragon.");
    miasma.face(ve); await miasma.hop(6);
    await say(MI(), "Hi. Contractor. Pretend I'm furniture.");
    const c = await ask(R(), "(What do you say to her?)", ["I'm sorry I never wrote.", "I've been busy with the Wardens."]);
    if (c === 0) {
      addFlag('bond');
      await raine.nod(1);
      await say(R(), "I'm sorry I never wrote. Every time I started a letter it sounded like an excuse. So I didn't send any.");
      await ve.heart();
      await say(VE(), "...You're still terrible at this. Come inside. I'll make tea. The bad kind, the kind you like.");
    } else {
      await say(R(), "I've been busy with the Wardens.");
      await ve.sad();
      await say(VE(), "Busy. Right. Four years of busy.");
      await miasma.sweat();
    }
    await say(R(), "I can't stay. I'm here on duty. The High Luminar sent a blessing for the shrine.");
    await notify('Raine takes out the Dawn Censer.', null);
    await ve.tremble(40);
    await say(VE(), "Raine... my smoke is hiding from it.");
    takeKey('censer');
    Game.flash = 14; Audio2.sfx('boom'); Game.shake = 30;
    await Promise.all([raine.surprise(), miasma.surprise(), ve.surprise()]);
  });
  // cinematic: the Votary unfolds
  await cinema([
    { dur: 150, bg: 'black', sfx: 'holy', flash: 16, caption: 'The censer cracks open.' },
    { dur: 220, bg: 'fire', music: 'boss', caption: 'Golden light unfolds like a hymn catching fire.', layers: [{ img: 'b_votary', x: W / 2, y: 640, s: 0.8, a: 0, to: { s: 1.5, a: 1, y: 600 } }] },
    { dur: 170, bg: 'fire', shake: 12, sfx: 'fire', caption: '"Rejoice. The Light has come home."', layers: [{ img: 'b_votary', x: W / 2, y: 600, s: 1.5, to: { s: 1.6 } }] },
  ], { skipAll: false });
  await scene(async ({ raine, miasma }) => {
    const ve = f.spawn({ id: 'verai', look: 'verai', name: 'Verai', x: raine.x + 1, y: raine.y - 1, dir: 'up' });
    f.hideNpc = f.hideNpc || new Set(); f.hideNpc.add('3');
    await say(VE(), "No... the houses! Everyone, RUN!");
    raine.face(ve); await raine.lunge();
    await say(R(), "Verai, get back!");
    ve.face(raine); await ve.angry();
    await say(VE(), "This is MY village, Raine. You don't get to leave AND protect it!");
    await ve.walk('up'); ve.face('up');
    f.despawn(ve);
  });
  const v = addMember('verai');
  v.jobs.dawnsinger = { lv: 3, jp: JP_TABLE[3] };
  await notify('Verai joins the party!', 'levelup');
  const r = await startBattle({ enemies: ['votary'], boss: true, bg: 'burning', music: 'boss', noRun: true });
  if (r !== 'win') return;
  await say('Sunscarred Votary', "...The Luminar... will sing... for you... too...");
  setFlag('votary'); setFlag('pass'); setFlag('arrived');
  Audio2.music(null);
  await fadeOut(40);
  f.enterMap('hollowash', 12, 8, 'up');
  await fadeIn(40);
  Audio2.music('sorrow');
  await scene(async ({ raine, miasma, verai }) => {
    const v1 = f.spawn({ id: 'vil1', look: 'hollowman', name: 'Villager', x: 10, y: 5, dir: 'down' });
    const v2 = f.spawn({ id: 'vil2', look: 'hollowwoman', name: 'Villager', x: 14, y: 5, dir: 'down' });
    const v3 = f.spawn({ id: 'vil3', look: 'hollowman', name: 'Villager', x: 12, y: 5, dir: 'down' });
    faceAll([raine, miasma, verai], v3);
    await v3.angry();
    await say('Villager', "It was HER. Her shadows called that thing down on us! Seventeen years we let her live here and THIS is what we get!");
    await verai.stepBack(); await verai.tremble(40);
    await say('Villager', "Monster! We should have left you in the mist where the Elder found you!");
    await v1.walk('down'); await v2.walk('down');
    const c = await ask(R(), "(The villagers close in on Verai.)", ['Stand between them and Verai.', 'Stay quiet.']);
    if (c === 0) {
      addFlag('bond');
      await raine.walk(raine.x < verai.x ? 'right' : 'left'); raine.face('up');
      await raine.angry();
      await say(R(), "That censer came from the Temple. From ME. If you want someone to blame, you're looking at her.");
      await say(R(), "Verai didn't do this. She never hurt anyone in her life. You all just decided she would.");
      verai.face(raine); await verai.heart();
    } else {
      await raine.sad();
      await say(null, "Raine says nothing. Verai looks at her, and then looks away.");
      addFlag('bond', -1);
      await miasma.walk('up'); miasma.face('up');
      await say(MI(), "Alright, that's enough. Anyone who wants to yell at a girl whose house just burned down can yell at the dragon first. Form a line.");
    }
    await v1.walk('up'); await v2.walk('up'); await v3.walk('up');
    f.despawn(v1); f.despawn(v2); f.despawn(v3);
    // Elder Moth recognizes Miasma
    const moth = f.spawn({ id: 'moth', look: 'elder', name: 'Elder Moth', x: 14, y: 6, dir: 'down' });
    await moth.walkTo(13, 7); moth.face(miasma);
    await say('Elder Moth', "You. The dragon lady. I've seen you before... years ago, at the edge of the wood. Watching a little girl with orange hair climb the mill fence.");
    await miasma.surprise();
    await say(MI(), "Nope! Different dragon lady. We're very common. There's loads of us.");
    raine.face(miasma); await raine.question();
    await miasma.sweat();
    moth.face(verai);
    await say('Elder Moth', "Most of the village fled into the Dreamers' Pass, south through the mountains. Verai knows the way.");
    await say('Elder Moth', "I found you in the Silverleaf mist, child. Wrapped in a cloak that smelled of gold and night. I never told you. I think it's time you went and found out why.");
    await verai.surprise();
    await moth.walk('up'); f.despawn(moth);
    verai.face(raine);
    await say(VE(), "The Veilstag. It came to me in a dream while we were fighting. It was hurt. It said a woman in a black coat killed it on the forest road.");
    await say(R(), "...It was blocking the path. I didn't know.");
    await verai.angry();
    await say(VE(), "You never KNOW, Raine! That's the whole problem! You follow orders so you never have to know!");
    await wait(40);
    await say(MI(), "...For the record, I also didn't know. And I'm very sorry about your stag. And your village. That's a lot of sorry. I'm just going to stand over here.");
    await miasma.walk('left');
    await say(R(), "The High Luminar sent that thing. She knew I grew up here. She wanted me to be the one who carried it.");
    await say(VE(), "Then I'm coming with you.");
    await say(R(), "Verai...");
    await say(VE(), "Not because I forgive you. Because someone has to make sure you ask 'why' this time.");
    await miasma.laugh(2);
    await say(MI(), "Oh, I like her. Can she be in charge?");
  });
  await tip("Open the menu and choose Job to change a hero's job at any time. Each job has its own command and learns skills as its rank rises. Each hero also keeps their own command: Raine's Brew, Miasma's Breath and Verai's Smoke.");
}
async function ashShrine() {
  if (flag('reaperJob')) return say(null, "The cracked shrine is cold now. The smell of ash won't leave.");
  await say(null, "The black stone shrine has split in the heat. The crack looks like an anvil broken by an axe: Grimnar's mark.");
  await say(VE(), "Grimnar, the Ash-Father. He says everything has to be reforged through suffering.");
  await say(R(), "Then he'd like it here.");
  openJob('reaper'); setFlag('reaperJob');
  await notify('The Ash Reaper job is now available!', 'levelup');
}

// ------------------------------------------------------------------ Goldengrove: Luna
async function goldengroveArrival() {
  const f = F();
  if (!flag('votary') || flag('lunaJoin')) return;
  await scene(async ({ raine, miasma, verai }) => {
    const luna = f.spawn({ id: 'luna', look: 'luna', name: 'Dame Luna', x: 13, y: 10, dir: 'down' });
    await luna.walk(['down', 'down', 'down']);
    await luna.lunge();
    await say('Dame Luna', "Raine Cudlar! By order of High Knight Odeaon, I am to bring you in!");
    await Promise.all([raine.surprise(), verai.stepBack()]);
    await say(R(), "My father sent you?");
    await say('Dame Luna', "He said to bring you in. He did not say how FAST. Or in which direction.");
    await raine.question();
    await luna.walk('down'); luna.face(miasma);
    await say(null, "The knight leans toward Miasma and sniffs. Twice.");
    await say('Dame Luna', "You smell like smoke and old gold. And... him. The High Knight. How strange.");
    await miasma.sweat();
    await say(MI(), "I smell like a LOT of things. Personal space, madam.");
    luna.face(raine);
    await say('Dame Luna', "I saw what the Luminar's people did at Hollowmere. That is not the Light I swore to. I want to help you find out why it happened.");
    await say(VE(), "Why would a Dawnguard knight help us?");
    await luna.tremble(20);
    await say('Dame Luna', "Because... someone once told me it doesn't matter what you are, only what you do. I'd like to prove it.");
    await say(MI(), "What you ARE? You're a knight. That's a very normal thing to be.");
    await luna.hop(10);
    await say('Dame Luna', "YES. Very normal. Extremely a knight. Call me Luna.");
    f.despawn(luna);
  });
  addMember('luna'); setFlag('lunaJoin');
  await notify('Luna joins the party!', 'levelup');
  await tip("Luna never takes off her helmet. Keep an eye on her. Some choices you make about her will matter later.");
  // Night at Goldengrove: Verai's talk and Luna's first slip
  Audio2.music(null); await fadeOut(40); healAll();
  f.nightTint = 'rgba(10,20,70,0.5)'; Audio2.music('sorrow');
  await fadeIn(40);
  await scene(async ({ raine, verai }) => {
    f.hideNpc = new Set(['1', '2', '3', '4', '5', '6', '7']);
    verai.x = raine.x + 1; verai.y = raine.y; verai.face(raine); raine.face(verai);
    await say(VE(), "Raine. When I was little, the other kids called me the Mist Brat. They'd run when my shadows moved. You were the only one who didn't.");
    await say(VE(), "Why? Weren't you scared?");
    const c = await ask(R(), "(What do you tell her?)", ["You were never a monster to me.", "Honestly? Your shadows ARE a little scary."]);
    if (c === 0) { addFlag('bond'); await say(R(), "You were never a monster to me. You were the only person in that village who told me the truth."); await verai.heart(); await say(VE(), "...Then don't stop now."); }
    else { await say(R(), "Honestly? Your shadows are a little scary. I just liked you more than I was scared of them."); await verai.laugh(2); await say(VE(), "That's... actually kind of sweet. For you."); }
  });
  await scene(async ({ raine, luna }) => {
    if (!luna) return;
    raine.face('up'); luna.x = raine.x + 2; luna.y = raine.y - 2; luna.dir = 'up';
    await say(null, "Later. Everyone is asleep. Outside the inn, something is humming a tune under the full moon.");
    const c = await ask(R(), "(Check on the noise?)", ['Go and look.', 'Roll over and sleep.']);
    if (c === 0) {
      await raine.walk('up');
      luna.look = 'lunawolf';
      await f.pan(luna.x, luna.y, 20);
      await say(null, "Luna sits on the fence with her helmet in her lap. Two tall silver ears stand up out of her hair.");
      luna.face(raine); await luna.surprise();
      luna.look = 'luna'; await luna.hop(12, 2);
      await say('Luna', "AH. Captain! This is... a helmet! I was cleaning it! With my head.");
      const c2 = await ask(R(), "(Did you just see ears?)", ['"Luna. Were those ears?"', 'Pretend you saw nothing.']);
      if (c2 === 0) { addFlag('lunaCaught'); await luna.sweat(); await say('Luna', "Ears? Everyone has ears. Knights have ears. Mine are just... enthusiastic. Goodnight!"); await luna.walk(['right', 'right']); }
      else { addFlag('lunaTrust'); await say(R(), "...Nice night. Get some sleep, Luna."); await luna.nod(2); await say('Luna', "...Thank you, Captain."); }
    } else await say(null, "Raine rolls over. The humming goes on until dawn.");
  });
  f.nightTint = null;
  Audio2.music(musicFor(f.map));
}
MAPS.goldengrove.onEnter = () => goldengroveArrival();

async function bridgeEvent() {
  const P = 'Bridgewarden Pip';
  if (flag('bridge')) return say(P, "Bridge is down and staying down! The Dawnguard can raise it themselves. They'll need a stool. Maybe two.");
  if (!flag('votary')) return say(P, "I'm the Bridgewarden! I look after the Aurora Bridge. The Dawnguard said to keep it raised. Very hush-hush. I'm telling everyone.");
  await scene(async ({ raine, miasma, verai, luna }) => {
    const pip = npcActor(6); faceAll([raine, miasma, verai, luna], pip); pip.face(raine);
    await pip.hop(10);
    await say(P, "Halt! Er, hello! I'm the Bridgewarden. The Dawnguard ordered the Aurora Bridge raised, to keep the heretics from crossing.");
    await say(MI(), "Which heretics?");
    await pip.shake();
    await say(P, "They didn't say! I asked for a description, and they said 'you'll know them when you see them.' Which is a terrible description.");
    if (luna) { await luna.nod(); await say('Luna', "As a Dawnguard knight, I can confirm we are VERY bad at descriptions."); }
    await say(VE(), "Please. Our village burned. Everyone we have left is heading east.");
    await pip.surprise();
    await say(P, "...Burned? By who?");
    await say(R(), "By the Light.");
    await pip.sad(); await wait(30);
    await say(P, "...My gran always said, if the Light needs a raised bridge to stay bright, it isn't much of a light.");
    await pip.laugh(3);
    await say(P, "Lever's going down!");
    Audio2.sfx('boom'); Game.shake = 14;
    f_despawnNpcActor(pip);
  });
  setFlag('bridge');
  await notify('The Aurora Bridge has been lowered!', 'chest');
  await say(P, "Brightwater's straight east, over the river. Tell the harbormaster Pip sent you. He won't know who that is. It'll be funny.");
}
function f_despawnNpcActor(a) { F().despawn(a); }

// ------------------------------------------------------------------ Brightwater
async function grellEvent() {
  const G = 'Harbormaster Grell';
  if (flag('wren')) return say(G, "The Wren's by the eastern pier. South across the Harmony Sea is Elaris's Embrace. Mind the reefs.");
  if (flag('chimera')) return grellReward();
  if (flag('harbor')) return say(G, "Tower of Dawn is on the spit, south-east of town. Bring back my light, and I'll make it worth your while.");
  await scene(async ({ raine, miasma, verai, luna }) => {
    const gr = npcActor(3); faceAll([raine, miasma, verai, luna], gr); gr.face(raine);
    await say(G, "Welcome to Brightwater. Mind the gloom. The Tower of Dawn went dark a month back, right after some Dawnguard carried a crate up there.");
    await gr.nod(1);
    await say(G, "Something's been nesting at the top ever since. Something with three heads, if you believe the gulls. And I do. Gulls don't lie. They steal, but they don't lie.");
    await say(R(), "Dawnguard. From Solanthia?");
    await gr.angry();
    await say(G, "Gold helmets, no manners. No offense, Sir Knight.");
    if (luna) { await luna.sweat(); await say('Luna', "None taken! My manners are excellent. I use a fork. Always a fork."); }
    await say(VE(), "We'll go. If the High Luminar put something up there, we need to see it.");
    await gr.laugh(3);
    await say(G, "Ha! A half-orc, a dragon, a witch and a knight walk into a lighthouse... No punchline. Just a bad day for whatever's up there.");
    F().despawn(gr);
  });
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
  await say(G, "Last week a gilded barge sailed south flying the Luminar's colors, toward the isle of Elaris's Embrace. Pilgrims say the Heartkeeper's reliquary sleeps under the twin falls.");
  await say(VE(), "Elaris's reliquary... that's the Heartseed.");
  await say(R(), "Then that's where Vesper is going next.");
  await tip("Walk onto the Wren on the world map to set sail. Walk onto land to leave her.");
}
async function thalaraShrine() {
  if (flag('tideJob')) return say(null, "A shrine to Thalara, Mistress of Tides. Salt water sits in the basin, perfectly still.");
  await say(null, "A shrine to Thalara, Mistress of Tides: a cresting wave with a serpent in it. The water in the basin ripples, though there is no wind.");
  await say(VE(), "The sea reflects the soul. That's what her priests say.");
  await say(MI(), "Then the sea is looking at me very judgmentally right now.");
  setFlag('tideJob'); openJob('tidecaller');
  await notify('The Tidecaller job is now available!', 'levelup');
}
async function towerGate() {
  if (hasKey('harborpass')) return true;
  await say(null, "The tower door is barred. A notice: CLOSED FOR RECONSECRATION. BY ORDER OF THE HIGH LUMINAR.");
  await say(MI(), "I could kick it in.");
  await say(R(), "Let's ask the harbormaster first. Brightwater's just north-west of here.");
  return false;
}
async function chimeraEvent() {
  const f = F();
  if (flag('chimera') || f._chimBusy) return;
  f._chimBusy = true;
  try {
    await scene(async ({ raine, miasma, verai, luna }) => {
      await f.pan(8, 4, 30);
      await say(null, "The Sunforged Chimera is coiled around the great lamp. Three halos burn above its three heads. Gold stitches hold its body together.");
      await verai.stepBack();
      await say(VE(), "It's been... sewn. Three animals sewn into one.");
      await say(MI(), "Lion, dragon, snake. That's a lot of opinions for one body.");
      if (luna) { await luna.tremble(30); await say('Luna', "...They made a monster out of monsters. Just to prove monsters are monsters."); }
      await say(R(), "The Sunlens is underneath it. That's why the tower is dark.");
    });
    const r = await startBattle({ enemies: ['chimera'], boss: true, bg: 'tower', music: 'boss', noRun: true });
    if (r !== 'win') return;
    setFlag('chimera'); giveKey('sunlens');
    Game.flash = 20; Audio2.sfx('holy');
    await scene(async ({ raine, miasma, verai, luna }) => {
      await say(null, "You set the Sunlens back in its cradle. Light blazes out across the sea.");
      await raine.kneel();
      await say(null, "Raine sways. There's a long burn across her arm from the dragon head's fire.");
      await miasma.walk(raine.x < miasma.x ? 'left' : 'right'); miasma.face(raine);
      await miasma.angry();
      await say(MI(), "Don't you EVER step in front of dragonfire like that again, do you hear me? EVER—");
      await raine.stand(); await raine.question();
      await say(R(), "...Miasma?");
      await miasma.sweat();
      await say(MI(), "—because. Because if you die, who pays me? Exactly. Economics.");
      verai.face(miasma); await verai.question();
      await say(MI(), "...Huh. When I was fighting that dragon head, something in my blood woke up. It's very loud. It wants to JUMP on things.");
      openJob('wyrmblood');
      await notify('The Wyrmblood job is now available!', 'levelup');
      if (luna) {
        luna.face(raine);
        await say(null, "Luna's helmet has a crack down the side. Something silver and furry is poking out of it.");
        const c = await ask(R(), "(Luna hasn't noticed.)", ['Point at it.', 'Quietly hand her a spare helmet.']);
        if (c === 0) { addFlag('lunaCaught'); await raine.idea(); await say(R(), "Luna. Your helmet. There's... fur."); await luna.surprise(); await say('Luna', "That's a plume! Knights have plumes! It's a very small, very fluffy plume that moves when I'm happy!"); await luna.spin(); }
        else { addFlag('lunaTrust'); await say(null, "Raine quietly hands Luna a spare helmet from the tower's armory. Luna stares at her, then swaps it without a word."); await luna.nod(2); }
      }
      await say(R(), "Let's get back to the harbormaster.");
    });
  } finally { f._chimBusy = false; }
}

// ------------------------------------------------------------------ Camp talks at Dawn Lanterns
async function campTalk() {
  const f = F();
  if (flag('lunaJoin') && flag('wren') && !flag('campEmbrace') && f.map.id.startsWith('embrace')) {
    setFlag('campEmbrace');
    await scene(async ({ raine, miasma, verai, luna }) => {
      if (!luna) return;
      await fadeOut(20); f.nightTint = 'rgba(10,20,70,0.45)'; await fadeIn(20);
      luna.pose = 'down'; miasma.pose = 'down'; verai.pose = 'down';
      await say(null, "The party rests by the lantern. Luna has fallen asleep sitting up. One gauntlet has slipped off.");
      await say(null, "Her hand isn't a hand. It's silver-furred, with long black claws.");
      const c = await ask(R(), "(What do you do?)", ['Wake her and ask.', 'Cover her with a blanket.']);
      if (c === 0) { addFlag('lunaCaught'); await luna.stand(); await luna.surprise(); await say('Luna', "I— that's a glove! A furry glove! For the cold! Elaris's Embrace is famously freezing!"); await say(R(), "It's warm here, Luna."); await luna.sweat(); await say('Luna', "...I'm a very cold person."); }
      else { addFlag('lunaTrust'); await say(null, "Raine lays her coat over Luna's hand. In her sleep, Luna smiles."); await luna.heart(); }
      f.nightTint = null;
    });
    return true;
  }
  if (S().party.length > 2 && !flag('campMiasma') && flag('bridge')) {
    setFlag('campMiasma');
    await scene(async ({ raine, miasma }) => {
      miasma.face(raine); raine.face(miasma);
      await say(R(), "Miasma. Where did you learn to fight? Before the Wardens.");
      await say(MI(), "Here and there. Mostly there. There is very dangerous.");
      await say(R(), "Did you ever have a family?");
      await miasma.tremble(30);
      await say(MI(), "...Once. I had a daughter. I had to leave her somewhere safe. With someone who could protect her better than I could.");
      await raine.question();
      await say(R(), "Do you ever see her?");
      await miasma.face('down'); await wait(40); miasma.face(raine);
      await say(MI(), "Every day, kid. Every single day.");
    });
    return true;
  }
  return false;
}

// ------------------------------------------------------------------ Elaris's Embrace
async function colossusEvent() {
  const f = F();
  if (flag('colossus') || f._colBusy) return;
  f._colBusy = true;
  try {
    await scene(async ({ raine, verai }) => {
      await f.pan(12, 6, 30);
      await say(null, "Stone, root and moss, grown into the shape of a giant. A purple bloom opens on its shoulder, and a heartbeat thuds through the valley.");
      await say(VE(), "Elaris's guardian. It's protecting her reliquary, the Heartseed.");
      await say(R(), "Then why is it coming at us?");
      await verai.tremble(30);
      await say(VE(), "Because it's afraid. Someone has already been here.");
    });
    const r = await startBattle({ enemies: ['bloomcolossus'], boss: true, bg: 'vale', music: 'boss', noRun: true });
    if (r !== 'win') return;
    setFlag('colossus');
    await say(null, "The Colossus kneels, then settles into moss and stone. Where its heart was, a seed pulses with a slow, warm beat.");
    await soniaReveal();
  } finally { f._colBusy = false; }
}
async function soniaReveal() {
  const f = F();
  if (flag('ch1end')) return;
  Audio2.music('sonia');
  let result = null;
  await scene(async ({ raine, miasma, verai, luna }) => {
    const ves = f.spawn({ id: 'vesper', look: 'vesper', name: VESPER, x: 12, y: 3, dir: 'down', alpha: 0 });
    await ves.fadeIn(40);
    await Promise.all([raine, miasma, verai, luna].filter(Boolean).map(a => a.surprise()));
    faceAll([raine, miasma, verai, luna], ves);
    await ves.walk(['down', 'down']);
    await say(VESPER, "Beautifully done, Cudlar. I could never have broken its heart. It knew what I was.");
    await say(R(), "High Luminar.");
    await say(VESPER, "Stubborn, loyal, and so easy to aim. Did you never wonder why every order sent you to some other god's shrine?");
    await verai.angry();
    await say(VE(), "You burned my home.");
    await say(VESPER, "I burned a whisper. Every prayer to a dead god is a prayer that might wake her.");
    await say(R(), "Nyxia is gone. The Tenth Flame took her seat.");
    await ves.laugh(3);
    await say(VESPER, "Took it from WHOM, Captain? ...That seat was mine.");
    Game.flash = 20; Audio2.sfx('dark'); Game.shake = 30;
    f.despawn(ves);
  });
  await cinema([
    { dur: 200, bg: 'void', sfx: 'dark', caption: "Vesper's face cracks like old paint.", layers: [{ look: 'vesper', x: W / 2, y: 520, s: 7, to: { a: 0 } }, { img: 'b_sonia', x: W / 2, y: 610, s: 1.4, a: 0, to: { a: 1 } }] },
    { dur: 200, bg: 'void', caption: "Underneath: a woman wearing Sylara's halo and Nyxia's stolen shadows.", layers: [{ img: 'b_sonia', x: W / 2, y: 610, s: 1.4, to: { s: 1.55 } }] },
    { dur: 200, bg: 'void', caption: '"I am Sonia. I was one breath from godhood when a phoenix stole it from my hands."', layers: [{ img: 'b_sonia', x: W / 2, y: 610, s: 1.55 }] },
  ], { skipAll: false });
  await scene(async ({ raine, miasma, verai, luna }) => {
    const so = f.spawn({ id: 'sonia', look: 'vesper', name: 'Sonia', x: 12, y: 5, dir: 'down' });
    faceAll([raine, miasma, verai, luna], so);
    await say('Sonia', "Ten reliquaries anchor the Ten. Take the anchors, and the faithful lose their way. And a god with no faithful...");
    await say(VE(), "...stops.");
    so.face(verai);
    await say('Sonia', "Clever girl. You always were. Even as a baby, you wouldn't stop reaching for the dark.");
    await verai.question();
    await so.walk('down');
    await say('Sonia', "Look at your hands, Verai. That smoke is Nyxia's night. The night I swallowed when I reached for her seat. It went into me... and then into you.");
    await verai.tremble(60);
    await say('Sonia', "Seventeen years ago I left my daughter in the Silverleaf mist, so the Light would never find her. So that one day she could take her seat beside me.");
  });
  await cinema([
    { dur: 230, bg: 'forest', music: 'sorrow', sub: 'Seventeen years ago', caption: 'A woman in gold and shadow walks into the Silverleaf mist, carrying a bundle of smoke.', layers: [{ img: 'b_sonia', x: 300, y: 600, s: 1.1, to: { x: 520 }, silhouette: '#0e1a1a', linear: true }] },
    { dur: 200, bg: 'forest', caption: 'She sets it down at the foot of a birch tree... and does not look back.', layers: [{ look: 'verai', x: 480, y: 540, s: 3, a: 0.8, bob: 2 }] },
  ], { skipAll: false });
  Audio2.music('sonia');
  await scene(async ({ raine, miasma, verai, luna }) => {
    const so = f.spawn({ id: 'sonia', look: 'vesper', name: 'Sonia', x: 12, y: 6, dir: 'down' });
    faceAll([raine, miasma, verai, luna], so);
    await verai.kneel();
    await say(VE(), "...My mother. You're my... mother.");
    await say('Sonia', "They hated you in that village, didn't they? All of them. Every single one.");
    so.face(raine);
    await say('Sonia', "Except her. The Warden who carried the fire to your door.");
    await raine.walk(raine.x < so.x ? 'right' : 'left'); raine.face(so); await raine.angry();
    await say(R(), "Get away from her.");
    await miasma.walk('up'); await miasma.angry();
    await say(MI(), "You heard the girl. Or, one of the girls. Several girls are very angry at you right now.");
  });
  await startBattle({ enemies: ['sonia'], boss: true, bg: 'sanctum', music: 'final', noRun: true, cantLose: true, turnLimit: 5 });
  Audio2.music('sonia');
  await scene(async ({ raine, miasma, verai, luna }) => {
    const so = f.spawn({ id: 'sonia', look: 'vesper', name: 'Sonia', x: 12, y: 5, dir: 'down' });
    for (const a of [raine, miasma, luna].filter(Boolean)) a.pose = 'kneel';
    faceAll([raine, miasma, verai, luna], so);
    await say('Sonia', "Adorable. You fight like people who think the gods are watching.");
    await say(null, "Sonia closes her hand. The Heartseed tears free of the moss and flies into her palm, still beating.");
    so.face(verai);
    await say('Sonia', "Come with me, Verai. Stop pretending to be a girl from a village that spat at you. Come home.");
    await verai.walk('up'); await verai.tremble(40);
    await say(null, "Verai's shadows reach toward Sonia on their own.");
    // --- the party decides ---
    await miasma.stand(); miasma.face(raine);
    await say(MI(), "Raine. She's Sonia's blood. Nyxia's night is IN her. If that woman gets her claws in, we could be fighting Verai next.");
    if (luna) { await luna.stand(); luna.face(miasma); await say('Luna', "Blood doesn't decide what you are. What you DO decides it. ...Trust me on that one."); }
    await raine.stand(); raine.face(verai);
    const c = await ask(R(), "(Everyone looks at Raine.)", ['"Verai stays with us. Always."', '"It\'s your choice, Verai. Whatever you choose."', '"...Maybe you should go with her."']);
    const total = num('bond') + [2, 1, -2][c];
    if (c === 0) await say(R(), "Verai stays with us. I don't care whose daughter she is. I left her once. I'm not doing it again.");
    if (c === 1) await say(R(), "It's your choice, Verai. Nobody gets to decide who you are. Not her. Not me.");
    if (c === 2) await say(R(), "...Maybe you should go with her. She's your mother. Maybe she's the only one who can help you with... that.");
    verai.face(raine); await wait(60);
    if (total >= 3) {
      result = 'stay';
      await verai.walk('down'); verai.face(so); await verai.stand();
      await say(VE(), "You left me in the mist. Raine is the one who came back for me. ...Eventually. Late. With a dragon.");
      await say(VE(), "I don't know what I am. But I know who my family is. And it isn't you.");
      await so.laugh(2);
      await say('Sonia', "Then keep your little family. For now.");
    } else if (total >= 1) {
      result = 'leave';
      await verai.face(raine); await verai.sad(80);
      await say(VE(), "I'm not going with her. But I can't stay with you either, Raine. Not until I know what's inside me.");
      await say(VE(), "If Nyxia's night is in me, I have to find out what that means. Alone.");
      await verai.walk(['left', 'left', 'down', 'down']); await verai.fadeOut(40);
    } else {
      result = 'sonia';
      await verai.face(raine); await verai.sad(80);
      await say(VE(), "...You're right. You were always right, Raine. Everyone was. I don't belong with people.");
      await verai.walk(['up', 'up']); verai.face('down');
      await say('Sonia', "Welcome home, daughter.");
      await Promise.all([verai.fadeOut(60), so.fadeOut(60)]);
    }
    if (result === 'stay') {
      await say('Sonia', "Elaris will dim by the next full moon. Run home, Captain. Oh... that's right. You don't have one anymore.");
      Game.flash = 16; Audio2.sfx('dark'); await so.fadeOut(30);
    } else if (result === 'leave') {
      await say('Sonia', "Well. That was more interesting than I planned. We'll meet again, Cudlar.");
      Game.flash = 16; Audio2.sfx('dark'); await so.fadeOut(30);
    }
    f.despawn(so);
    await say(null, "The twin falls go on roaring, as if nothing happened.");
    for (const a of [raine, miasma, luna].filter(Boolean)) a.pose = '';
  });
  if (result !== 'stay') { S().party = S().party.filter(m => m.id !== 'verai'); setFlag(result === 'sonia' ? 'veraiSonia' : 'veraiLeft'); }
  else setFlag('veraiStayed');
  await lunaResolution();
  await scene(async ({ raine, miasma }) => {
    if (result === 'stay') {
      await say(R(), "Elaris. The goddess of love is going to die. Because I carried a censer and cleared a road.");
      await say(VE(), "Then help me take it back. All of it.");
    } else {
      await raine.kneel();
      await say(R(), "...I did it again. I let her go.");
    }
    miasma.face(raine);
    await say(MI(), "Hey. Kid. Look at me.");
    await raine.stand(); raine.face(miasma);
    await say(MI(), "We get the reliquaries back. We get her back. And then we have a long talk about a lot of things.");
    await say(R(), "What things?");
    await miasma.sweat();
    await say(MI(), "...Things. Later. What's the pay on this job, by the way?");
    await say(R(), "Nothing.");
    await miasma.laugh(2);
    await say(MI(), "Oh, I'm in, obviously. I just like to ask.");
  });
  setFlag('ch1end');
  await chapterEnd(result);
}
async function lunaResolution() {
  const f = F();
  if (!member('luna')) return;
  if (num('lunaCaught') >= 2) {
    await scene(async ({ raine, miasma, luna }) => {
      raine.face(luna); luna.face(raine);
      await say(R(), "Luna. The ears. The fur. The claws. The humming at the full moon.");
      await luna.sweat(); await luna.tremble(40);
      await say('Luna', "...I was hoping the glove thing was working.");
      await say(null, "Luna takes off her helmet. Silver ears. Gold eyes. A moonfang, one of the monsters Aurelion's knights are sworn to hunt.");
      luna.look = 'lunawolf';
      await luna.hop(6);
      await say('Luna', "I joined the Dawnguard to prove a monster could be good. That we could keep an oath like anyone. I just... never got to the part where I tell anyone.");
      const c = await ask(R(), "(What do you say?)", ['"You kept your oath better than any of them."', '"You should have told us."']);
      if (c === 0) { addFlag('lunaTrust'); await luna.heart(); await say('Luna', "...That's the first time anyone's said that to my actual face."); }
      else { await luna.nod(); await say('Luna', "I know. I'm sorry. No more helmets between us. ...Well. I'm keeping the helmet. It's a nice helmet."); }
      miasma.face(luna);
      await say(MI(), "Oh, thank the gods, I'm not the only one keeping a—");
      await miasma.surprise(); raine.face(miasma);
      await say(R(), "Keeping a what?");
      await say(MI(), "—a... a very large collection of spoons. Anyway! Moonfang! Welcome to the team! Again!");
      luna.look = 'luna';
    });
    setFlag('lunaRevealed');
  } else {
    await cinema([
      { dur: 240, bg: 'moon', music: 'sorrow', caption: 'Later that night, far from the others, Luna takes off her helmet.', layers: [{ look: 'lunawolf', x: W / 2, y: 520, s: 7, bob: 2 }] },
      { dur: 220, bg: 'moon', caption: '"One day I\'ll tell them. When they\'re ready. When I am."', layers: [{ look: 'lunawolf', x: W / 2, y: 520, s: 7, dir: 'up' }] },
    ], { skipAll: false });
  }
}
function endingShots(result) {
  const party = S().party.map(m => m.id);
  const walkers = (ids, y = 560) => ids.map((id, i) => ({ look: HEROES[id].look, dir: 'right', walk: true, x: 120 + i * 70, y, s: 3, to: { x: 520 + i * 70 }, linear: true }));
  if (result === 'stay') return [
    { dur: 240, bg: 'falls', music: 'vale', sub: 'Elaris\'s Embrace', caption: 'The twin falls keep roaring. Someone has to take the first step.', layers: walkers(party) },
    { dur: 220, bg: 'dawn', caption: 'Verai walks beside Raine, the way she did when they were small.', layers: [{ look: 'verai', dir: 'right', x: 430, y: 560, s: 5, bob: 2 }, { look: 'raine', dir: 'left', x: 530, y: 560, s: 5, bob: 2 }] },
    { dur: 200, bg: 'dawn', caption: '"Next time you promise to write..."   "I\'ll write. Every week."   "Liar."', layers: [{ look: 'verai', dir: 'right', x: 430, y: 560, s: 5 }, { look: 'raine', dir: 'left', x: 530, y: 560, s: 5 }] },
  ];
  if (result === 'leave') return [
    { dur: 260, bg: 'forest', music: 'sorrow', sub: 'The Silverleaf, the same mist she was left in', caption: 'Verai walks into the mist alone. Her smoke goes with her.', layers: [{ look: 'verai', dir: 'right', walk: true, x: 300, y: 560, s: 4, to: { x: 1000, a: 0.2 }, linear: true }] },
    { dur: 230, bg: 'dawn', caption: 'Raine stands at the edge of the wood until the sun comes up.', layers: [{ look: 'raine', dir: 'up', x: W / 2, y: 560, s: 5 }] },
    { dur: 200, bg: 'dawn', caption: '"I left her once. I won\'t lose her twice."', layers: [{ look: 'raine', dir: 'up', x: W / 2, y: 560, s: 5 }, { look: 'miasma', dir: 'up', x: W / 2 + 110, y: 560, s: 5, fadeIn: 60 }] },
  ];
  return [
    { dur: 240, bg: 'void', music: 'sonia', sub: 'Somewhere between the seats', caption: 'Mother and daughter rise into the dark, hand in hand.', layers: [{ img: 'b_sonia', x: 400, y: 620, s: 1.2, to: { y: 560 } }, { look: 'verai', dir: 'up', x: 620, y: 560, s: 4, to: { y: 480 } }] },
    { dur: 220, bg: 'void', caption: 'Verai\'s smoke burns violet. For the first time, it doesn\'t hide from anything.', layers: [{ look: 'verai', dir: 'down', x: W / 2, y: 560, s: 6, silhouette: '#5a20a0' }] },
    { dur: 200, bg: 'dawn', caption: 'On the shore of the falls, Raine holds a grey scarf that smells of smoke.', layers: [{ look: 'raine', dir: 'down', x: W / 2, y: 560, s: 5 }] },
  ];
}
async function chapterEnd(result) {
  Audio2.music(null);
  await fadeOut(60);
  await cinema([...endingShots(result),
    { dur: 230, bg: 'seats', music: 'title', caption: 'In the ring of the Ten, one flame begins to gutter. Elaris is fading.' },
    { dur: 200, bg: 'moon', caption: 'And far across the sea, in the land of ash and flame, a phoenix god opens one golden eye...', layers: [{ text: '◉', x: W / 2, y: 230, size: 40, color: '#ffb030', glow: 'rgba(255,160,40,0.9)', fadeIn: 60 }] },
  ], { skipAll: false });
  const st = S(), t = Math.floor(st.playTime / 60);
  const veraiLine = result === 'stay' ? ['Verai learned who her mother is,', 'and chose her family anyway.']
    : result === 'leave' ? ['Verai walked into the dark alone,', 'to learn what Nyxia left inside her.']
      : ['Verai took her mother\'s hand.', 'Somewhere, a seat begins to warm.'];
  await crawl([
    'The Heartseed is gone.',
    '',
    ...veraiLine,
    '',
    'Raine Cudlar is a traitor to the Light.',
    'Her father still has not told her the truth.',
    'Miasma is still, technically, unpaid.',
    flag('lunaRevealed') ? 'Luna no longer hides her ears from her friends.' : 'Luna still keeps her helmet on.',
  ], { speed: 0.7 });
  await cinema([
    { dur: 330, bg: 'seats', sfx: 'holy', flash: 14, layers: [
      { text: 'END OF CHAPTER ONE', x: W / 2, y: 210, size: 36, color: '#ffe070', glow: 'rgba(255,200,80,0.8)', fadeIn: 40 },
      { text: 'THE UNSEATED', x: W / 2, y: 270, size: 18, color: '#e8e0ff', fadeIn: 80 },
      { text: 'Next: Chapter Two - The Tenth Flame', x: W / 2, y: 360, size: 12, color: '#a8a8d0', fadeIn: 140 },
    ] },
  ], { skipAll: false });
  setFlag('ch1done');
  await saveScreen(result, t);
  await fadeIn(40);
  Audio2.music(musicFor(F().map));
}
// Chapter-complete save screen
function saveScreen(result, mins) {
  return new Promise(res => Game.push({
    opaque: true, t: 0, saved: null,
    enter() { this._fade = Game.fade; Game.fade = 0; }, leave() { Game.fade = this._fade || 0; },
    menu: new ListMenu([{ text: 'Save' }, { text: 'Continue without saving' }], { x: 300, y: 450, w: 360, rowH: 38 }),
    update() {
      this.t++; if (this.t < 30) return;
      if (this.saved !== null) { if (Input.ok() || Input.cancel()) { Game.pop(this); res(); } return; }
      const r = this.menu.update(); if (!r) return;
      if (r.cancel || r.index === 1) { Game.pop(this); res(); return; }
      this.saved = saveGame(); Audio2.sfx(this.saved ? 'save' : 'error');
    },
    draw() {
      drawStars('#05030c', '#2a1030');
      drawWindow(120, 40, 720, 390);
      text('CHAPTER ONE COMPLETE', W / 2, 66, '#ffe070', 20, 'center');
      text(`Play time ${Math.floor(mins / 60)}h ${mins % 60}m    Battles ${S().battles}    Gold ${S().gold}`, W / 2, 104, '#c8c8e0', 11, 'center');
      S().party.forEach((m, i) => { const y = 136 + i * 56, face = faceImg(HEROES[m.id].face, HEROES[m.id].look); if (face) ctx.drawImage(face, 170, y, 48, 48); text(`${m.name}`, 236, y + 6, '#fff', 14); text(`Lv ${m.lvl}  ${JOBS[m.job].name}`, 236, y + 28, JOBS[m.job].color, 11); });
      const notes = [result === 'stay' ? 'Verai stayed with you.' : result === 'leave' ? 'Verai left to find herself.' : 'Verai went with Sonia.', flag('lunaRevealed') ? 'You know Luna\'s secret.' : 'Luna kept her secret.', 'Miasma\'s secret is still hers.'];
      notes.forEach((n, i) => text(n, 560, 150 + i * 34, '#e8e0ff', 11));
      if (this.saved === null) { text('Save your progress? Chapter Two will continue from this file.', W / 2, 410, '#a8a8d0', 11, 'center'); if (this.t >= 30) this.menu.draw(); }
      else { drawWindow(240, 450, 480, 80); text(this.saved ? 'Saved! Press Z to keep exploring.' : 'Saving is unavailable here. Press Z.', W / 2, 482, this.saved ? '#80ff90' : '#ff9090', 13, 'center'); }
    },
  }));
}

// ------------------------------------------------------------------ map hooks
MAPS.barge.onEnter = () => bargeOpening();
MAPS.hollowmere.onEnter = async () => {
  if (!flag('stag') || flag('votary')) return;
  await wait(30);
  await F().walk('up', 2);
  await hollowmereArrival();
};
