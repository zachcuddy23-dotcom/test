'use strict';
// ---------------------------------------------------------------------------
// Chapter Three: "The Knight in the Dark" (part one: the Wyrmspire)
//
// On the way home to save Odeaon, Miasma finally starts to tell Raine the truth, and Raine
// collapses: Ashkar's token (her crescent pendant) has woken and is burning her from inside.
// Raine leaves the party. Miasma leads. Only the Frostheart Lily from the top of the Wyrmspire,
// Miasma's old mountain, can save her. Three climb (Miasma + two friends); the rest keep watch.
// At the summit Miasma remembers what she really is: the Dragon job.
// Afterwards the party can choose its own leader.
//
// Flags: ch3start, ch3sick, ch3doctor, ch3m1..ch3m4, ch3nest, ch3helm, ch3toy, ch3yeti, ch3summit,
//        ch3confessed (Miasma told sleeping Raine), ch3told (Miasma told the climbers),
//        ch3rime, ch3herb, ch3cured, leaderUnlocked, ch3part1
//        flags.watcher = id of the friend who stayed at Raine's bedside
// ---------------------------------------------------------------------------
const DOC = 'Dr. Thistlewood';
Object.assign(NPC_FACES, { 'Dr. Thistlewood': 'face_thistlewood', 'Rimeclaw': 'face_rimeclaw', 'Old Mother Yeti': 'face_yeti' });
const HERO_SAY = id => ({ raine: R, miasma: MI, verai: VE, luna: LU, brakka: () => HERO('brakka') }[id] || (() => HERO(id)))();
function friends() { return S().party.filter(m => m.id !== 'raine' && m.id !== 'miasma').map(m => m.id); }

// ------------------------------------------------------------------ party bookkeeping
function gatherCrew() {
  // Everyone sails north together: anyone waiting on the bench comes aboard.
  const st = S(), all = [...st.party, ...(st.bench || [])];
  const order = ['raine', 'miasma', 'verai', 'luna', 'brakka'];
  all.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  st.party = all.slice(0, 4); st.bench = all.slice(4);
}
function raineLeaves() {
  const st = S(), r = st.party.find(m => m.id === 'raine'); if (!r) return;
  st.resting = r; st.party = st.party.filter(m => m !== r);
  const mi = st.party.find(m => m.id === 'miasma'); if (mi) st.party = [mi, ...st.party.filter(m => m !== mi)];
}
function raineReturns() {
  const st = S(), r = st.resting; if (!r) return;
  st.resting = null;
  const avg = Math.round(st.party.reduce((s, m) => s + m.exp, 0) / Math.max(1, st.party.length));
  if (r.exp < avg) gainExp(r, avg - r.exp);
  r.status = {}; const s2 = stats(r); r.hp = s2.mhp; r.mp = s2.mmp;
  st.party.unshift(r);
  // Anyone who kept watch comes back too; the party can hold four.
  st.bench = st.bench || [];
  while (st.party.length < 4 && st.bench.length) st.party.push(st.bench.shift());
  while (st.party.length > 4) st.bench.push(st.party.pop());
}

// ------------------------------------------------------------------ opening: the Wren, at night
async function chapter3Opening() {
  if (flag('ch3start')) return;
  const f = F();
  gatherCrew();
  setFlag('ch3start');
  f.enterMap('wrendeck', 8, 5, 'up'); f.nightTint = 'rgba(10,20,70,0.45)'; Game.fade = 1;
  await cinema([
    { dur: 260, bg: 'seats', music: 'title', layers: [
      { text: 'CHAPTER THREE', x: W / 2, y: 220, size: 30, color: '#ffe070', glow: 'rgba(255,200,80,0.8)', fadeIn: 30 },
      { text: 'THE KNIGHT IN THE DARK', x: W / 2, y: 280, size: 20, color: '#a8c8ff', fadeIn: 70 },
    ] },
    { dur: 200, bg: 'river', music: 'sea', sub: 'The Wren, four nights out of Emberport', caption: 'North, toward Aurelion. Toward a father in a cell.' },
  ], { skipAll: false });
  Game.fade = 0;
  const others = S().party.filter(m => m.id !== 'raine' && m.id !== 'miasma').map(m => m.id);
  await scene(async ({ raine, miasma }) => {
    await say(null, "Everyone else is asleep below deck. Raine stands at the rail, watching the dark water.");
    await wait(20);
    await miasma.walk(['up', 'up'], 16);
    await say(MI(), "Kid. Can't sleep either?");
    await say(R(), "Every time I close my eyes I see Father in a cell. In the dark. Waiting for me to do something stupid.");
    await raine.sad();
    await say(MI(), "...Raine. I know what I promised. Your father first, and then the truth.");
    await miasma.tremble(30);
    await say(MI(), "But I've been carrying this for twenty years, and I can't carry it one more night.");
    raine.face('down'); await raine.question();
    await say(R(), "Miasma?");
    await say(MI(), "Your mother isn't dead, Raine. Your mother is—");
    Game.flash = 10; Audio2.sfx('fire');
    await say(null, "Raine's crescent pendant flares. Not gold. Black, and red, like a coal.");
    await raine.tremble(40);
    await say(R(), "It's... hot. Miasma, it's so hot, I can't—");
    await raine.fall();
    await miasma.lunge();
    await say(MI(), "RAINE!");
    await miasma.kneel();
    await say(MI(), "No. No no no. Not now. Not NOW. EVERYBODY! UP ON DECK! NOW!");
  }, { skip: others, layout: { raine: [8, 3, 'up'], miasma: [8, 6, 'up'] } });
  await cinema([
    { dur: 170, bg: 'fire', shake: 6, sfx: 'fire', caption: 'The pendant burns against Raine\'s skin like a coal from a forge. Nobody can pull it free.' },
    { dur: 170, bg: 'river', caption: 'The Wren runs north all night under every sail she has.' },
    { dur: 200, bg: 'dawn', music: 'sorrow', sub: 'Dawn', caption: 'Hearthmoor, a snowbound harbor at the foot of the Wyrmspire. Miasma goes very quiet at the sight of the mountain.' },
  ], { skipAll: false });
  f.nightTint = null;
  raineLeaves();
  setFlag('ch3sick');
  f.enterMap('clinic', 6, 5, 'up');
  await fadeIn(30);
  await clinicDiagnosis();
}

// ------------------------------------------------------------------ Hearthmoor: the diagnosis
async function clinicDiagnosis() {
  await scene(async ({ miasma, luna, verai, brakka }) => {
    const doc = npcActor(2);
    doc.face('left');
    await say(null, "Raine lies in the clinic's warmest bed, burning with fever. The pendant pulses on her chest.");
    await doc.question();
    await say(DOC, "I'm Wenna Thistlewood. I've doctored this town for thirty years. I have never seen this. I have only READ about it.");
    await say(DOC, "Cinderblight. Fire in the blood. God-fire. That pendant isn't jewelry. It's a coal from a god's own hearth, and it has woken up.");
    await miasma.tremble(40);
    await say(MI(), "...Ashkar's token. We stood in front of his throne. It heard him. It woke up.");
    if (brakka) { await brakka.angry(); await say('Brakka', "Then TAKE IT OFF her! I have pliers! I have VERY good pliers!"); }
    else if (luna) { await luna.angry(); await say('Luna', "Then we take it off her. I'll do it. Knights have strong hands. And claws. Knight-claws."); }
    doc.face(miasma);
    await say(DOC, "It's fused to her skin. Tear it away, and her heart comes with it.");
    await say(DOC, "There is one thing in the world cold enough to quench god-fire: the Frostheart Lily. It grows at the very top of the Wyrmspire.");
    await say(DOC, "No one has climbed that mountain in twenty years. Not since the red dragon left, and the Frost Wyrm moved in.");
    await say(DOC, "She has three days. Maybe four. She strikes me as stubborn.");
    await wait(20);
    await miasma.stand();
    await say(MI(), "I know the way.");
    faceAll([luna, verai, brakka].filter(Boolean), miasma);
    await Promise.all([luna, verai, brakka].filter(Boolean).map(a => a.surprise()));
    await say(MI(), "I lived up there. Before... before a lot of things.");
    if (brakka) { await say('Brakka', "You LIVED on the haunted death mountain? Was the rent good?"); await say(MI(), "Free. The landlord was me."); }
    if (verai) await say(VE(), "Then you lead. Just get us there.");
    await say(MI(), "Nobody's carrying her up a mountain. Three of us climb, fast and light. We get the lily. We come back.");
  });
  // who stays with Raine?
  // everyone who came north (party and bench) is a candidate; three climb, one stays
  const st = S(), pool = [...st.party.filter(m => m.id !== 'miasma'), ...(st.bench || [])];
  if (pool.length > 2) {
    const i = await ask(MI(), "Somebody stays with her. Somebody she'd want to see if she wakes up. Who stays?", pool.map(m => m.name));
    const m = pool[i], id = m.id, climbers = pool.filter(x => x !== m).slice(0, 2);
    st.party = [member('miasma'), ...climbers]; st.bench = [m, ...pool.filter(x => x !== m && !climbers.includes(x))];
    st.flags.watcher = id;
    await say(HERO_SAY(id), { verai: "I'll stay. I've sat by her bed before. She had the fever when we were eight. She held my hand the whole night and told me I wasn't scary. I'll return the favor.", luna: "I will guard her. Nobody touches her. Not even the doctor, unless the doctor asks very nicely.", brakka: "I'll stay. I'm good at watching things that might explode. Emotionally or otherwise." }[id] || "I'll stay with her.");
  } else { st.party = [member('miasma'), ...pool]; st.bench = []; }
  await notify('Raine has left the party. Miasma is leading now.', null);
  setFlag('ch3doctor');
  await bedsideConfession();
  await tip("Raine can't fight. Miasma leads the climb with two friends. The Wyrmspire is north of Hearthmoor. Buy warm gear in town, and save at the Dawn Lantern in the square.");
}
async function bedsideConfession() {
  if (flag('ch3confessed')) return;
  setFlag('ch3confessed');
  await fadeOut(30);
  const f = F(); f.nightTint = 'rgba(10,20,70,0.4)';
  await fadeIn(30);
  await scene(async ({ miasma }) => {
    await say(null, "Later. The others are packing. Miasma sits alone by the bed.");
    await miasma.kneel();
    await say(MI(), "...I was going to tell you tonight. I had the whole speech. It was a good speech. There was a joke in the middle.");
    await say(MI(), "Your mother isn't dead, Raine.");
    await miasma.tremble(40);
    await say(MI(), "Your mother is a dragon who lived on a mountain, and fell for a knight who forgot his sword, and ran away when the Temple came with chains.");
    await say(MI(), "Your mother is me.");
    await wait(30);
    await say(MI(), "...There. I said it. And you didn't even hear it. Typical.");
    await miasma.sad(80);
    await say(MI(), "Hang on, kid. Mom's going to go get you a flower.");
  }, { skip: friends(), layout: { miasma: [4, 4, 'up'] } });
  await fadeOut(20); f.nightTint = null; await fadeIn(20);
}
async function raineBedside() {
  await say(null, "Raine is burning up. The pendant glows like a coal. She mumbles in her sleep: \"...Father? ...Mom?\"");
  if (member('miasma')) await say(MI(), "...We'll be back soon, kid.");
}
async function doctorTalk() {
  if (flag('ch3cured')) return say(DOC, "Don't you dare put that pendant near another god for a while. Doctor's orders.");
  if (hasKey('frostlily')) return cureEvent();
  await say(DOC, "Three days. Four if she's as stubborn as you lot. The Wyrmspire is north of town. Go.");
}
async function watcherTalk() {
  const id = S().flags.watcher;
  const l = { verai: "She keeps saying 'Mom' in her sleep. Just go. Get the flower.", luna: "I've been counting her breaths. It's a knight thing. Don't worry about it. Go.", brakka: "I tried a cold compress. Then an ice pack. Then I tried snow. The snow melted. On contact. Hurry." }[id];
  await say(HERO_SAY(id), l || "Go. I'll be here.");
}
{ // the friend on watch sits by the bed while the others climb
  const n = MAPS.clinic.npcs[3], who = () => (Game.state && S().flags && S().flags.watcher) || null;
  n.show = () => !!who() && flag('ch3sick') && !flag('ch3cured');
  Object.defineProperty(n, 'look', { get: () => who() ? HEROES[who()].look : 'luna', configurable: true });
  Object.defineProperty(n, 'name', { get: () => who() ? HEROES[who()].name : 'Luna', configurable: true });
}

// ------------------------------------------------------------------ the climb
const BACKSTORY = {
  luna: async (a, mi) => {
    if (flag('lunaRevealed')) {
      await say('Luna', "I was born in a den under the Silverleaf. My first memory is a village throwing stones at my mother. She told me to be kind anyway.");
      await say('Luna', "That's why I wear the armor. So people see the knight first. By the time they see the wolf, they already like me.");
      await mi.nod(); await say(MI(), "...That's the smartest thing anyone's said on this mountain. Including me.");
    } else {
      await say('Luna', "I grew up in the woods. With... very hairy knights. Very hairy. It was cold, like this. We kept warm by, um. Knight hugs.");
      await mi.question(); await say(MI(), "Knight hugs.");
      await say('Luna', "Knight. Hugs.");
      addFlag('lunaCaught');
    }
  },
  verai: async (a, mi) => {
    await say(VE(), "In Hollowmere they hung bells on my door, so they'd hear me coming. Like a cat. Or a plague.");
    await say(VE(), "Raine cut the bells down one night. They put them back. She cut them down again. Every night. For a whole year.");
    await a.sad();
    await say(VE(), "Nobody ever did anything that stubborn for me before. I'm not letting a flower be the thing that beats her.");
  },
  brakka: async (a, mi) => {
    await say('Brakka', "You know why I got kicked out of the Gunsmiths' Guild? 'Goblins are for sweeping.' So they gave me a broom closet.");
    await say('Brakka', "I built my first cannon out of that broom closet. Out of spite. Then out of love. Then out of the broom closet, because the closet was gone.");
    await a.laugh(2);
    await say('Brakka', "Point is: people told me no my whole life. The mountain's just one more person telling me no.");
  },
};
async function climbMoment(n) {
  if (flag('ch3m' + n) || !member('miasma')) return;
  setFlag('ch3m' + n);
  const fr = friends(), A = fr[0], B = fr[1] || fr[0];
  await scene(async cast => {
    const mi = cast.miasma, a = cast[A], b = cast[B];
    if (n === 1) {
      await mi.stepBack();
      await say(MI(), "I used to do this whole trail in three wingbeats. Walking it is humbling. And cold. Mostly cold.");
      if (a && BACKSTORY[A]) await BACKSTORY[A](a, mi);
    } else if (n === 2) {
      if (b) await b.surprise();
      await say(null, "The floor here is solid ice. Step on it, and you won't stop until something stops you.");
      await say(MI(), "The Frozen Falls. I used to slide down this on my belly. Don't look at me like that. I was young.");
      if (b && BACKSTORY[B] && B !== A) await BACKSTORY[B](b, mi);
      else if (b) { await say(HERO_SAY(B), "Race you to the top?"); await say(MI(), "You're on."); }
    } else if (n === 3) {
      Audio2.music('sorrow');
      await mi.question();
      await say(MI(), "...Home. It hasn't changed. It's smaller than I remember. Or I'm bigger. Don't answer that.");
      if (a) await say(HERO_SAY(A), "This was your NEST?");
      await say(MI(), "Nest, hoard, home. The gold's long gone. Adventurers used to climb up, grab a coin and run away screaming. I never even got up.");
      await say(null, "(There are things half-buried in the old hoard. Look around.)");
      setFlag('ch3nest');
    } else if (n === 4) {
      if (a) { await a.laugh(2); await say(HERO_SAY(A), A === 'brakka' ? "We beat a yeti! A MOM yeti! I'm writing a song. It's going to be terrible." : "We beat a yeti. I would like that noted somewhere official."); }
      if (b && B !== A) await say(HERO_SAY(B), "She tucked her cubs in before she fought us. That's more than some parents do.");
      await mi.sad();
      await say(MI(), "...Yeah.");
      await say(MI(), "Rimeclaw will be at the top. He was old when I was young. He never liked me. I was loud, and he liked quiet.");
      await say(MI(), "When I left, he took the peak. And the lily with it.");
    }
  });
}
async function nestSign(what) {
  if (!member('miasma')) return say(null, "An old dragon's hoard, mostly empty.");
  if (what === 'helm') {
    if (flag('ch3helm')) return say(null, "The place where the knight's helm lay.");
    setFlag('ch3helm');
    await scene(async cast => {
      const mi = cast.miasma, fr = friends();
      await say(null, "Under the snow: a small knight's helm, with four long claw marks across it.");
      await mi.surprise();
      await say(MI(), "...Oh, you're kidding me. It's still here.");
      await say(MI(), "A knight came up this mountain to slay me, once. Twenty years old. Shaking so hard his armor sang.");
      await mi.laugh(2);
      await say(MI(), "He'd forgotten his sword. At the BOTTOM of the mountain. So he sat down in my nest and offered me half his sandwich.");
      await say(MI(), "I dented his helmet anyway. On principle.");
      if (fr[0]) { await say(HERO_SAY(fr[0]), "...Odeaon?"); }
      await mi.sad(60);
      await say(MI(), "...Odeaon.");
      giveKey('dentedhelm'); await notify('Took the Dented Helm.', 'chest');
    });
    return;
  }
  if (flag('ch3toy')) return say(null, "The old hoard. The gold is long gone.");
  setFlag('ch3toy');
  await scene(async cast => {
    const mi = cast.miasma, fr = friends();
    await say(null, "In the middle of the old hoard, where the gold was piled highest, sits a little carved toy dragon. Red. Its tail has been glued back on at least twice.");
    await mi.kneel();
    await say(MI(), "I made that. With these claws. You would not believe how many toy dragons I broke making one toy dragon.");
    await say(MI(), "I made it for someone small. She had it for one winter.");
    await mi.tremble(40);
    await say(MI(), "Then the Temple came up the mountain with fire and chains, and I had to choose between keeping her, and keeping her alive.");
    if (fr[0]) { const a = cast[fr[0]]; if (a) await a.sad(); }
    await say(null, "Nobody says anything. Somebody puts a hand on Miasma's shoulder. She lets it stay.");
    giveKey('toydragon'); await notify('Took the Carved Toy Dragon.', 'chest');
    await mi.stand();
  });
}
async function yetiEvent() {
  if (flag('ch3yeti') || F()._yetiBusy) return;
  const f = F(); f._yetiBusy = true;
  try {
    await scene(async cast => {
      await say(null, "A snowdrift the size of a cottage stands up. It has arms. It has a lot of arms' worth of arms.");
      await say('Old Mother Yeti', "HRRRNNNF.");
      await say(null, "Behind her, three little yetis peek out of a cave and are firmly pushed back inside.");
      await cast.miasma.sweat();
      await say(MI(), "She's got cubs. We're between her and them. Okay. Okay! Nobody make any sudden—");
      await say('Old Mother Yeti', "HRRRNNNF!!");
    });
    const r = await startBattle({ enemies: ['yetimother'], boss: true, bg: 'icecave', music: 'boss', noRun: true });
    if (r !== 'win') return;
    setFlag('ch3yeti');
    await say(null, "Old Mother Yeti sits down in the snow, huffs, and waves you past. She has decided you're not worth the trouble. Fair.");
    await climbMoment(4);
  } finally { f._yetiBusy = false; }
}

// ------------------------------------------------------------------ the summit
MAPS.summit.onEnter = async () => {
  if (flag('ch3summit') || !member('miasma')) return;
  setFlag('ch3summit');
  await wait(20);
  const fr = friends();
  // the friend most likely to ask
  const asker = ['luna', 'verai', 'brakka'].find(id => fr.includes(id)) || fr[0];
  await scene(async cast => {
    const mi = cast.miasma, a = asker && cast[asker];
    await say(null, "The top of the world. At the edge of the cliff, something blue-white glows in the snow: the Frostheart Lily.");
    if (!a) return;
    a.face(mi); mi.face(a);
    const line = {
      luna: "Miasma. I know what it looks like when someone hides what they are. I've done it every day for years.",
      verai: "Miasma. My mother left me in a forest and never came back. I know what it looks like when a mother is sorry.",
      brakka: "Miasma. I'm a goblin, not an idiot.",
    }[asker] || "Miasma.";
    await say(HERO_SAY(asker), line);
    await say(HERO_SAY(asker), "The helmet. The toy. The way you look at her when she isn't looking. Raine is your daughter. Isn't she?");
    await wait(40);
    await mi.tremble(30);
    await say(MI(), "...Yes.");
    await a.surprise();
    await say(MI(), "She's my daughter. And I gave her to a knight in a city that burns dragons, and told him to tell her I was dead. Because dead mothers can't be hunted.");
    await mi.sad(80);
    await say(MI(), "Don't tell her. Please. She hears it from me. When she's awake. When she can yell at me properly.");
    const other = fr.find(id => id !== asker), b = other && cast[other];
    if (b) { b.face(mi); await say(HERO_SAY(other), "...We won't."); }
    await a.nod();
    await say(HERO_SAY(asker), asker === 'brakka' ? "Secret's safe. I'm a vault. A loud vault. But a vault." : "Your secret's safe. Now let's get your daughter her flower.");
    setFlag('ch3told');
  });
};
async function lilyEvent() {
  if (flag('ch3herb')) return say(null, "Where the lily grew, a new bud is already pushing up through the snow.");
  if (!flag('ch3rime')) return rimeclawEvent();
}
async function rimeclawEvent() {
  if (flag('ch3rime') || F()._rimeBusy || !member('miasma')) return;
  const f = F(); f._rimeBusy = true;
  try {
    if (!flag('ch3summit')) setFlag('ch3summit');
    Audio2.music(null);
    await scene(async cast => {
      const mi = cast.miasma;
      Game.shake = 30; Audio2.sfx('boom');
      await say(null, "The snow around the lily rises into a shape: white scales, blue eyes, wings like glaciers.");
      await card({ img: IMG.b_rimeclaw ? 'b_rimeclaw' : null, caption: 'RIMECLAW, THE FROST WYRM: he was old when the mountain was young.', time: 240 });
      await say('Rimeclaw', "Little ember. You came HOME. And on two legs, like a goat.");
      await say(MI(), "I'm here for the lily, Rimeclaw. Not for you.");
      await say('Rimeclaw', "You left the sky for a knight. You left your nest for a city that burns our kind. You left.");
      await say('Rimeclaw', "Everything on this peak is mine now. The lily. The wind. And you.");
      await mi.angry();
    });
    // Round one: Rimeclaw at full strength. Nobody wins this.
    await startBattle({ enemies: ['rimeclawfull'], boss: true, bg: 'summit', music: 'final', noRun: true, cantLose: true, turnLimit: 6 });
    await cinema([
      { dur: 170, bg: 'stars', music: 'sorrow', caption: 'Miasma is on her knees in the snow. She can\'t feel her hands. She can\'t feel anything.' },
      { dur: 170, bg: 'dawn', caption: 'She remembers the sky. Every wind over the Frostreach used to know her name.' },
      { dur: 170, bg: 'moon', caption: 'She remembers a boy with no sword, and half a sandwich.', layers: [{ look: 'odeaon', dir: 'down', x: W / 2, y: 560, s: 5 }] },
      { dur: 200, bg: 'void', caption: 'She remembers a baby with a tuft of orange hair, asleep on warm gold, holding a little red dragon.', layers: [{ look: 'raine', dir: 'down', x: W / 2, y: 520, s: 3, a: 0.9 }] },
      { dur: 220, bg: 'fire', flash: 16, shake: 20, sfx: 'boom', caption: '"I am not dragon-BLOODED," Miasma says, standing up. "I am a DRAGON."' },
    ], { skipAll: false });
    // Miasma remembers her true power
    const mi = member('miasma');
    openJob('dragon');
    mi.jobs.dragon = mi.jobs.dragon || { lv: 1, jp: 0 };
    mi.jobs.dragon.lv = Math.max(mi.jobs.dragon.lv, 5); mi.jobs.dragon.jp = Math.max(mi.jobs.dragon.jp, JP_TABLE[5]);
    changeJob(mi, 'dragon');
    if (mi.equip.weapon && mi.equip.weapon !== 'skyclaws') addItem(mi.equip.weapon);
    mi.equip.weapon = 'skyclaws';
    for (const m of S().party) { m.status = {}; const s2 = stats(m); m.hp = s2.mhp; m.mp = s2.mmp; }
    Audio2.sfx('levelup');
    await notify('Miasma remembers her true power! The Dragon job is now open to everyone. Miasma takes up the Sky-Sunder Claws.', 'levelup');
    await scene(async cast => {
      await cast.miasma.lunge();
      await say('Rimeclaw', "...THERE you are, little ember.");
      await say(MI(), "Round two, you overgrown icicle. I've got a daughter waiting.");
    });
    const r = await startBattle({ enemies: ['rimeclaw'], boss: true, bg: 'summit', music: 'final', noRun: true });
    if (r !== 'win') return;
    setFlag('ch3rime'); addItem('rimeheart');
    await scene(async cast => {
      await say('Rimeclaw', "...Go, then. Take your flower. Take your knight, and your daughter, and your loud, loud laugh.");
      await say('Rimeclaw', "The sky is still yours, ember. It always was. You were just too busy being afraid to look up.");
      await say(null, "The Frost Wyrm folds his wings, lies down in the snow, and becomes a hill of ice. Very still. Very peaceful.");
      await say(null, "Miasma kneels at the cliff's edge and lifts the Frostheart Lily out of the snow as gently as anything she has ever held.");
      giveKey('frostlily'); setFlag('ch3herb');
      await notify('Received the Frostheart Lily!', 'levelup');
      await say(MI(), "Everybody hold on to something. Preferably me.");
    });
    await cinema([
      { dur: 190, bg: 'dawn', music: 'title', flash: 10, caption: 'For the first time in twenty years, a red dragon opens her wings over the Wyrmspire.', layers: [{ img: IMG.b_miasmadragon ? 'b_miasmadragon' : null, look: IMG.b_miasmadragon ? null : 'miasma', dir: 'down', x: W / 2, y: 560, s: IMG.b_miasmadragon ? 1.2 : 6, to: { y: 520 } }] },
      { dur: 190, bg: 'stars', caption: 'She still knows every wind in the Frostreach. The whole town of Hearthmoor watches her land.' },
    ], { skipAll: false });
    F().enterMap('clinic', 6, 5, 'up');
    Game.fade = 0;
    await cureEvent();
  } finally { f._rimeBusy = false; }
}

// ------------------------------------------------------------------ the cure, and what comes next
async function cureEvent() {
  if (flag('ch3cured') || !hasKey('frostlily')) return;
  await scene(async cast => {
    const doc = npcActor(2);
    await say(DOC, "You're back. You're ALL back. And one of you was a dragon, apparently, and the whole town saw. Give me that flower.");
    await say(null, "Dr. Thistlewood crushes the petals into cold water. The water turns to frost in the cup. She tips it, a drop at a time, onto the pendant.");
    Audio2.sfx('ice'); Game.flash = 8;
    await say(null, "The pendant hisses. Steam. Then it cools, slowly, back to plain gold.");
    await doc.nod();
  });
  takeKey('frostlily');
  setFlag('ch3cured');
  const watcher = S().flags.watcher;
  raineReturns();
  await scene(async cast => {
    const raine = cast.raine, mi = cast.miasma;
    raine.face('up');
    await raine.question();
    await say(R(), "...Miasma? Why is everyone... staring at me like that?");
    const fr = friends();
    const loud = ['brakka', 'luna', 'verai'].find(id => fr.includes(id));
    if (loud === 'brakka') await say('Brakka', "You were DYING. Miasma turned into a DRAGON. There was a YETI. A MOM yeti!");
    else if (loud === 'luna') await say('Luna', "You were dying, Captain. Then Miasma became a dragon. A real one. Also there was a yeti. I have many feelings.");
    else if (loud) await say(VE(), "You were dying. Miasma turned into a dragon. There was a yeti. It's been a week.");
    await raine.surprise();
    await say(R(), "...I leave you alone for three days.");
    if (watcher && cast[watcher]) { await cast[watcher].heart(); await say(HERO_SAY(watcher), "I stayed. The whole time. You talk in your sleep. It was mostly about sandwiches."); }
    raine.face(mi);
    await say(R(), "I dreamed you were talking to me. You sounded scared. You said something... important.");
    await mi.tremble(30);
    await say(R(), "I can't remember what.");
    await wait(40);
    await say(MI(), "...It'll keep, kid. One more day. It'll keep.");
    await raine.heart();
    await say(null, "Raine throws her arms around Miasma. Miasma, who has fought gods, has no idea where to put her hands. She figures it out.");
    await say(R(), "Thank you. All of you. You climbed a death mountain for me.");
    await say(R(), "And you led them. YOU.");
    await mi.sweat();
    await say(MI(), "Somebody had to. You were busy being on fire.");
    await raine.laugh(2);
    await say(R(), "Then here's a new rule: from now on, whoever's best for the road walks in front. Not just me.");
    setFlag('leaderUnlocked');
    await notify('You can now choose the party leader! (Menu, then Leader)', 'levelup');
    // the news that drives the rest of the chapter
    Game.shake = 8; Audio2.sfx('bump');
    await say(null, "The clinic door bangs open. A Hearthmoor priest, out of breath, holds up a notice with the seal of the Grand Temple.");
    await say('Hearthmoor Priest', "It's posted in every town from here to Solanthia. The trial of High Knight Odeaon. In seven days.");
    await say('Hearthmoor Priest', "The charges: treason against the Light... and the harboring of a DRAGON.");
    await raine.surprise();
    await say(R(), "Harboring a... dragon?");
    await say(null, "Slowly, Raine turns and looks at Miasma. Everybody else suddenly finds the ceiling very interesting.");
    await say(MI(), "...Seven days. The mountain pass south goes straight through to Aurelion. If we leave at dawn, we make it.");
    await say(R(), "You're going to explain that. On the way.");
    await say(MI(), "On the way. I promise.");
  });
  S().bench = S().bench || [];
  if (S().bench.length) await say(null, "Anyone who isn't in the party will wait in Hearthmoor's square. Talk to them there to swap.");
  await cinema([
    { dur: 260, bg: 'dawn', music: 'hearth', layers: [
      { text: 'THE WYRMSPIRE', x: W / 2, y: 230, size: 26, color: '#a8d8ff', glow: 'rgba(160,210,255,0.7)', fadeIn: 30 },
      { text: 'Chapter Three continues...', x: W / 2, y: 290, size: 14, color: '#e8e0ff', fadeIn: 80 },
      { text: 'Next: the pass south, and a trial in Solanthia', x: W / 2, y: 340, size: 12, color: '#a8a8d0', fadeIn: 130 },
    ] },
  ], { skipAll: false });
  setFlag('ch3part1');
  await saveScreen(null, Math.floor(S().playTime / 60), 'THE WYRMSPIRE', [
    'Raine is well again.',
    'Miasma is a Dragon.',
    flag('ch3told') ? 'Your friends know Miasma\'s secret.' : 'Miasma\'s secret is still hers.',
    'Odeaon\'s trial is in seven days.',
  ], 'Chapter Three will continue from this file.');
  await fadeIn(30);
  Audio2.music(musicFor(F().map));
}
async function wrenDocked() {
  if (!flag('ch3cured')) return say('Wren Crew', "We're not sailing anywhere without the Captain.");
  await say('Wren Crew', "Solanthia's inland, Captain. The pass south is the fast way. The Wren will meet you on the Aurelion coast when you need her.");
}
async function southPass() {
  if (!flag('ch3cured')) return say(null, "The pass south, toward Aurelion. Not without Raine.");
  await say(null, "The pass south, toward Aurelion and Solanthia. Hearthmoor's crews are still digging it out of last night's avalanche.");
  await say(null, "(The rest of Chapter Three is coming in the next update. Your save will carry over.)");
}
async function hearthBench() {
  const b = S().bench || [];
  if (!b.length) return;
  const i = b.length === 1 ? 0 : await ask(null, "Who's coming along?", [...b.map(m => m.name), 'Nobody']);
  if (i >= b.length) return;
  const incoming = b[i];
  if (S().party.length < 4) { b.splice(i, 1); S().party.push(incoming); return notify(`${incoming.name} joins the party!`, 'levelup'); }
  const outs = S().party.filter(m => m.id !== 'raine' && m.id !== 'miasma');
  const j = await ask(HERO_SAY(incoming.id), `${incoming.name} is ready to go. Who sits this one out?`, [...outs.map(m => m.name), 'Nobody']);
  if (j >= outs.length) return;
  const out = outs[j];
  S().party = S().party.filter(m => m !== out); b.splice(i, 1, out); S().party.push(incoming);
  await notify(`${incoming.name} joins. ${out.name} waits in Hearthmoor.`, 'levelup');
}
{ // the bench NPC in Hearthmoor's square wears the face of whoever is waiting
  const n = MAPS.hearthmoor.npcs[7], who = () => (Game.state && (S().bench || [])[0]) || null;
  Object.defineProperty(n, 'look', { get: () => who() ? HEROES[who().id].look : 'merchant', configurable: true });
  Object.defineProperty(n, 'name', { get: () => who() ? who().name : 'Friend', configurable: true });
}
