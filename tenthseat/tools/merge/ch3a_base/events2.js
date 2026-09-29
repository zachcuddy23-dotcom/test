'use strict';
// ---------------------------------------------------------------------------
// Chapter Two: "The Tenth Flame"
//
// Carries over from Chapter One (flags):
//   veraiStayed / veraiLeft / veraiSonia  - what Verai chose at the Twin Falls
//   bond                                  - how close Raine and Verai are
//   lunaRevealed, lunaCaught, lunaTrust   - Luna's secret
//   campMiasma                            - Miasma's "I had a daughter" talk
// New Chapter Two choices (flags):
//   bribed / trialWon        - how you got out of Emberport
//   pressedMiasma (count)    - how hard Raine pushed Miasma about her mother
//   tookPowder / blewPowder  - what you did with the Edict's blackpowder
//   veraiRejoined / veraiWaits / veraiDoubt / veraiCold - Verai at Terminus
//   ashkarAlly / ashkarRival - whether you gave Ashkar the Anvil Shard
//   sanctuarySunk            - the Twin Falls sanctuary fell into the sea (Chapter 4)
// ---------------------------------------------------------------------------
const BR = () => HERO('brakka');
// Chapter Two portraits: drop face_<name>.png into assets/ and they appear automatically
Object.assign(NPC_FACES, {
  'Brakka': 'brakka_face', 'Gate Captain Hrask': 'face_hrask', 'Gate Champion Vorsk': 'face_vorsk', 'Mother Coal': 'face_coal',
  'Keeper of the Book': 'face_keeper', 'Ashkar': 'face_ashkar', 'Warlord Kargath': 'face_kargath', 'The Ash Ferryman': 'face_ferryman', 'Legionnaire': 'face_legionnaire',
});
const ASHKAR = 'Ashkar';
function veraiState() { return flag('veraiStayed') ? 'stay' : flag('veraiSonia') ? 'sonia' : flag('veraiLeft') ? 'leave' : 'stay'; }
function bench() { return S().bench || (S().bench = []); }
function hasV() { return !!member('verai') || bench().some(m => m.id === 'verai'); }

// ------------------------------------------------------------------ opening
async function chapter2Opening() {
  if (flag('ch2start')) return;
  const f = F();
  if (f.map.id !== 'embrace2') f.enterMap('embrace2', 12, 9, 'up');
  Game.fade = 1;
  await cinema([
    { dur: 260, bg: 'seats', music: 'title', layers: [
      { text: 'CHAPTER TWO', x: W / 2, y: 220, size: 30, color: '#ffe070', glow: 'rgba(255,200,80,0.8)', fadeIn: 30 },
      { text: 'THE TENTH FLAME', x: W / 2, y: 280, size: 20, color: '#ffb040', fadeIn: 70 },
    ] },
  ], { skipAll: false });
  Game.fade = 0;
  Audio2.music('sonia');
  await scene(async ({ raine, miasma, verai, luna }) => {
    await wait(30);
    Game.shake = 30; Audio2.sfx('boom');
    await Promise.all([raine, miasma, verai, luna].filter(Boolean).map(a => a.surprise()));
    await say(null, "The ground heaves. Stone groans somewhere under the falls.");
    if (verai) { await verai.tremble(30); await say(VE(), "Elaris's sanctuary... it's dying with her. Everything she held up is letting go."); }
    else if (luna) await say('Luna', "Captain, the cliff is splitting! We have to go, NOW!");
    await miasma.lunge();
    await say(MI(), "Everyone to the boat! Run first, feel things later!");
    await Promise.all([raine, miasma, verai, luna].filter(Boolean).map(a => a.walk(['down', 'down', 'down'], 10)));
  });
  await cinema([
    { dur: 150, bg: 'falls', shake: 20, sfx: 'boom', caption: 'The ancient sanctuary of the Twin Falls tears free of the cliff...' },
    { dur: 200, bg: 'falls', shake: 30, sfx: 'boom', flash: 10, caption: '...and slides, slowly and all at once, into the sea.' },
    { dur: 180, bg: 'stars', music: 'sorrow', caption: 'Where it stood, the falls pour into nothing. (It will not stay lost forever.)' },
  ], { skipAll: false });
  setFlag('sanctuarySunk');
  await cinema([
    { dur: 220, bg: 'river', music: 'sea', sub: 'Aboard the Wren, that night', caption: 'Nobody says anything for a long time.' },
  ], { skipAll: false });
  await scene(async ({ raine, miasma, verai, luna }) => {
    for (const a of [raine, miasma, verai, luna].filter(Boolean)) a.face('down');
    const vs = veraiState();
    if (vs === 'sonia') { await say(null, "Raine holds a grey scarf that still smells of smoke."); await raine.sad(); }
    if (vs === 'leave') { await say(null, "Raine keeps looking back at the dark coast, where the mist swallowed Verai."); await raine.sad(); }
    await say(R(), "I need answers. About Sonia. About what she did to Verai. About the reliquaries.");
    await say(R(), "And about my mother. Father never told me anything true. I'm starting to think nobody has.");
    await miasma.tremble(30);
    await say(null, "Raine's crescent pendant is glowing, a faint ember-gold, and it's warm against her skin.");
    await raine.question();
    await say(R(), "It started when that eye opened across the sea. It's pointing somewhere. South and east.");
    if (luna) {
      luna.face(raine);
      if (flag('lunaRevealed')) { await say('Luna', "Ashkar's symbol is a phoenix on a black crescent. Your pendant is the same moon. In the Dominion, nobody hides what they are. ...I think I'd like to see that."); await luna.heart(); }
      else { await say('Luna', "The Tenth Flame's symbol is a phoenix on a black crescent. Your pendant looks... very similar, Captain."); await luna.sweat(); await say('Luna', "Also, I've heard Ashkar is very welcoming to all kinds of... people. Not that it matters to me. Normal knight. Normal."); }
    }
    miasma.face(raine);
    await say(MI(), "Ashkar. The Dominion of Flame and Ash. They burn heretics for fun there, kid.");
    await say(R(), "Then it's a good thing I'm already a traitor. Set a course, Miasma.");
    await miasma.sad();
    await say(MI(), "...Aye aye, Captain.");
  });
  await cinema([
    { dur: 220, bg: 'fire', music: 'ashkar', sub: 'Three days later', caption: 'The sky turns red. Ash falls like snow on the deck.' },
    { dur: 200, bg: 'port2', caption: 'Twin statues of Grimnar and Malakar burn at the harbor mouth of Emberport.' },
  ], { skipAll: false });
  setFlag('ch2start'); S().onShip = false;
  f.enterMap('emberport', 15, 16, 'up');
  await fadeIn(30);
  await emberportArrival();
}
// background for the Emberport shot above
const _cineBg = drawCineBg;
drawCineBg = function (bg, t, k) {
  if (bg === 'port2') {
    const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a0a06'); gr.addColorStop(1, '#c06030'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1a0c08'; ctx.fillRect(0, 380, W, H);
    for (const x of [160, 800]) { ctx.fillStyle = '#140806'; ctx.fillRect(x - 30, 160, 60, 220); ctx.fillRect(x - 40, 140, 80, 30); ctx.fillStyle = '#ff7030'; ctx.beginPath(); ctx.arc(x, 130, 14 + Math.sin(t / 8) * 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,140,60,0.2)'; for (let i = 0; i < 40; i++) ctx.fillRect((i * 97 + t) % W, (i * 53 + t * 0.7) % 380, 2, 2);
    return;
  }
  return _cineBg(bg, t, k);
};

// ------------------------------------------------------------------ Emberport
async function emberportArrival() {
  await scene(async ({ raine, miasma, verai, luna }) => {
    const hr = npcActor(1);
    await hr.walkTo(15, 13); hr.face(raine);
    await say('Gate Captain Hrask', "Foreigners! From Aurelion, by the smell of sunshine on you. State your business.");
    await say(R(), "We're looking for answers.");
    await hr.laugh(2);
    await say('Gate Captain Hrask', "Answers! Ha! In Ashkar you EARN answers. Nobody leaves Emberport for the interior without the Edict's leave.");
    await say('Gate Captain Hrask', "By coin, or by combat. Come to the north gate when you've decided.");
    await hr.walkTo(16, 2); hr.face('down');
    F().despawn(hr);
  });
  await tip("Chapter Two: new jobs, new towns, and your choices from Chapter One matter here. Emberport has shops, an inn, and a shrine to Zariel. The north gate leads inland.");
}
async function emberGateEvent() {
  const HR = 'Gate Captain Hrask';
  if (flag('emberGate')) return say(HR, flag('trialWon') ? "Champion's friends go where they like. The road is yours." : "Paid in full. The road is yours. Try not to die; it makes paperwork.");
  const f = F();
  let choice = -1;
  await scene(async ({ raine, miasma, luna }) => {
    const hr = npcActor(1); hr.face(raine);
    await say(HR, "Well, foreigners? Coin or combat? Three thousand gold, or you face our Gate Champion in the arena. Trial by Combat is holy law here.");
    const opts = ['Pay 3,000 gold.', 'Trial by Combat.', 'Not yet.'];
    choice = await ask(R(), "(How do you get through?)", opts);
    if (choice === 0) {
      if (S().gold < 3000) { await say(HR, "That purse is lighter than your pride, foreigner. Combat, then? Or come back richer."); choice = -1; return; }
      S().gold -= 3000; setFlag('bribed'); setFlag('emberGate');
      await hr.nod(); await say(HR, "Coin speaks. The Edict hears. Go on.");
      await miasma.sweat(); await say(MI(), "That was almost all our money. I want that on record.");
    } else if (choice === 1) {
      await hr.laugh(3); await say(HR, "HA! Good! To the arena! VORSK! Wake up, you've got a fight!");
      if (luna) { await luna.hop(8); await say('Luna', "A duel with honor! I have been waiting my entire life for someone to say that sentence."); }
    }
    f.despawn(hr);
  });
  if (choice !== 1) { if (choice === -1) await f.walk('down', 1); return; }
  const r = await startBattle({ enemies: ['vorsk'], boss: true, bg: 'port2', music: 'boss', noRun: true });
  if (r !== 'win') return;
  setFlag('trialWon'); setFlag('emberGate');
  await scene(async ({ raine, miasma }) => {
    await say('Gate Champion Vorsk', "...Hah. Hah! Strength is truth, and you have plenty. Go, foreigners. Tell them Vorsk fell to people worth falling to.");
    await say('Gate Captain Hrask', "The road is yours, champions. The Edict will hear of this. Not all of them will be happy.");
    await raine.nod();
  });
  await tip("Zariel's shrine in Emberport is waiting for anyone who has bled in the arena.");
}
async function zarielShrine() {
  if (flag('chainJob')) return say(null, "Zariel's shrine: a red-hot chain wrapped around a blade. It never cools.");
  await say(null, "A shrine to Zariel, the Bound Inferno: a burning chain wrapped around a blade. Its heat is almost a voice.");
  if (flag('trialWon')) await say(null, "The chain rattles as you approach. It has heard about the arena.");
  else { await say(null, "The chain stays still. Zariel does not bargain with those who paid their way. ...But it does bargain."); await say(MI(), "Everyone bleeds a little and it gives us the thing? Fine. FINE."); for (const m of S().party) if (alive(m)) m.hp = Math.max(1, Math.floor(m.hp * 0.75)); }
  setFlag('chainJob'); openJob('chainbearer'); addItem('chainlink');
  await notify('The Chainbearer job is now available! Received Zariel\'s Link.', 'levelup');
}
async function lunaEmberport() {
  const LG = 'Legionnaire';
  if (!member('luna')) return say(LG, "Move along, sunshine.");
  if (flag('lunaEmberDone')) return say(LG, flag('lunaRevealed') ? "The moonfang sister! Eat well, fight well." : "Stay strong, tin-can.");
  setFlag('lunaEmberDone');
  await scene(async ({ raine, luna, miasma }) => {
    const lg = npcActor(6); lg.face(luna); luna.face(lg);
    if (flag('lunaRevealed')) {
      await say(LG, "A moonfang! In knight's armor! Ha! Sister, you can take that bucket off here. In Ashkar the strong are welcome, whatever skin they wear.");
      luna.look = 'lunawolf'; await luna.surprise();
      await say('Luna', "...I can? Just like that?");
      await say(LG, "Might makes right. You look mighty. Eat something. You're too thin for a wolf.");
      await luna.tremble(30); await luna.heart();
      await say('Luna', "Captain... nobody has ever looked at me and just... seen me. And said 'eat something.'");
      await raine.nod();
      await say(R(), "Keep the helmet off as long as you like, Luna.");
      luna.look = 'luna';
    } else {
      await say(null, "The hobgoblin sniffs the air around Luna. Then he grins.");
      await say(LG, "Moonfang, under all that tin? Why hide it here, sister? The Dominion doesn't care what you are. Only what you can do.");
      await luna.surprise(); await luna.sweat();
      await say('Luna', "I'm sorry, I don't know what that word means! I'm from... Aurelion! We don't have words there!");
      const c = await ask(R(), "(He called Luna a moonfang.)", ['"Luna. What did he mean?"', 'Change the subject.']);
      if (c === 0) {
        addFlag('lunaCaught');
        if (num('lunaCaught') >= 2) {
          await luna.sad();
          await say('Luna', "...He meant this.");
          luna.look = 'lunawolf'; await luna.hop(6);
          await say(null, "Luna takes off her helmet. Silver ears. Gold eyes. A moonfang, one of the monsters Aurelion's knights are sworn to hunt.");
          await say('Luna', "I joined the Dawnguard to prove a monster could keep an oath. I just never got to the part where I tell anyone.");
          await raine.nod();
          await say(R(), "You kept your oath better than any knight I know. That's what matters.");
          await luna.heart(); setFlag('lunaRevealed');
          luna.look = 'luna';
        } else { await say('Luna', "He meant... that I'm very well armored! It's a compliment! Here! In Ashkar!"); await luna.spin(); }
      } else { addFlag('lunaTrust'); await say(R(), "Is that a bakery? Luna, is that a bakery? Let's go look at the bakery."); await luna.nod(2); await say('Luna', "...Thank you, Captain."); }
    }
    F().despawn(lg);
  });
}
async function sailToAurelion() {
  const c = await ask('Wren Crew', "The Wren's ready when you are. Sail back to Brightwater?", ['Set sail', 'Not now']);
  if (c !== 0) return;
  await cinema([{ dur: 160, bg: 'river', music: 'sea', caption: 'The Wren crosses the Harmony Sea.' }], { skipAll: true });
  F().enterMap('brightwater', 24, 7, 'left');
}
async function sailToAshkar() {
  if (!flag('ch2start')) return false;
  const c = await ask('Harbormaster Grell', "Back to Ashkar? The Wren knows the way now.", ['Set sail', 'Not now']);
  if (c === 0) {
    await cinema([{ dur: 160, bg: 'fire', music: 'ashkar', caption: 'The Wren sails into the red sky of Ashkar.' }], { skipAll: true });
    F().enterMap('emberport', 15, 16, 'up');
  }
  return null;
}
MAPS.brightwater.npcs[3].talk.unshift(sailToAshkar);

// ------------------------------------------------------------------ Charnoch
async function charnochToken() {
  const MC = 'Mother Coal';
  if (flag('coalToken')) return say(MC, "The Throne only opens for those he calls, dearie. Carry that crescent into the fire and see if he answers.");
  setFlag('coalToken');
  await scene(async ({ raine, miasma }) => {
    const mc = npcActor(1); mc.face(raine);
    await say(MC, "Oh, what a pretty thing you're wearing. Come here, come here. Let old Coal see.");
    await mc.surprise();
    await say(MC, "That's a Phoenix token. The old kind, from before he was a god. The Tenth Flame only ever gave three of those away.");
    await say(R(), "Three? To who?");
    await say(MC, "A warlock girl. A priest who burned. And a red dragon who laughed too loud.");
    await miasma.surprise(); await miasma.tremble(40);
    raine.face(miasma); await raine.question();
    const c = await ask(R(), "(Miasma has gone very still.)", ['"Miasma. Do you know something about this?"', 'Let it go for now.']);
    if (c === 0) {
      addFlag('pressedMiasma');
      await miasma.sweat();
      await say(MI(), "Red dragon? Laughing too loud? That describes most red dragons. We're a loud people. It's genetic.");
      await say(R(), "Miasma.");
      await miasma.sad();
      await say(MI(), "...Not here, kid. Please. Not here.");
    } else await say(null, "Raine looks at Miasma for a long moment, then turns back to Mother Coal.");
    mc.face(raine);
    await say(MC, "The Throne of Cinders is north-east, inside the ring of fire. It opens only for those he calls. Carry that crescent close, and he'll call you soon enough.");
    F().despawn(mc);
  });
}

// ------------------------------------------------------------------ Kharak Yr & the Gunworks
async function brakkaEvent() {
  const f = F();
  if (hasKey('gunpass')) return partySwap();
  await scene(async ({ raine, miasma, verai, luna }) => {
    const bk = npcActor(4); bk.face(raine);
    await bk.hop(10, 2);
    await say('Brakka', "Customers! No. Not customers. You don't have the look. You've got the 'we're going to do something stupid' look. I LOVE that look.");
    await say('Brakka', "Brakka Sootfinger. Gunsmith. Or I was, until the Crimson Edict kicked me out of my own Gunworks.");
    await say(R(), "What are they doing in there?");
    await bk.angry();
    await say('Brakka', "They put LEGS on Grimnar's Voice. Our biggest cannon! They're going to march it north and blast open the Final Gate at Mount Terminus.");
    await say('Brakka', "Something behind that Gate is Grimnar's holiest relic. And the one paying the Edict wants it.");
    await say(R(), "Sonia. She's collecting reliquaries.");
    await say('Brakka', "Don't know the name. Know the gold. It smells like night. Here. A Foundry Pass. I forged the signature. It's a very good forgery. I'm very good.");
    giveKey('gunpass');
    await notify('Received the Foundry Pass!', 'chest');
    if (S().party.length < 4) {
      await say('Brakka', "And you look short a person. I'm short a workshop. Let's be short together!");
      if (miasma) { await miasma.laugh(2); await say(MI(), "She's the size of my boot and she already talks more than me. I respect it."); }
      f.despawn(bk);
      addMember('brakka');
      await notify('Brakka joins the party!', 'levelup');
    } else {
      await say('Brakka', "I'd come, but you've got a full wagon. Tell you what: anyone who needs a breather can sit here with me, and I'll take their seat. Talk to me any time.");
      await say('Brakka', "And my Hand Cannon's still in the proving room upstairs. Take it. Use it. Love it.");
      f.despawn(bk);
      bench().push(makeMember('brakka', Math.max(1, Math.round(S().party.reduce((a, m) => a + m.lvl, 0) / S().party.length))));
      setFlag('brakkaWaits');
    }
  });
  if (bench().length) await partySwap();
}
// Kharak Yr's bench: whoever sits out waits here with (or instead of) Brakka.
async function partySwap() {
  const b = bench();
  if (!b.length) return say('Brakka', flag('gunworks') ? "You wrecked the Edict AND my cannon. Mixed feelings! Mostly good ones." : "The Gunworks are just north. Go on, the Pass is a very good forgery.");
  const host = b[0].id === 'brakka' ? 'Brakka' : b[0].name;
  const inIdx = b.length === 1 ? 0 : await ask(host, "Who's coming along?", [...b.map(m => m.name), 'Nobody']);
  if (inIdx >= b.length) return;
  const incoming = b[inIdx];
  if (S().party.length < 4) { b.splice(inIdx, 1); S().party.push(incoming); Audio2.sfx('levelup'); return notify(`${incoming.name} joins the party!`, 'levelup'); }
  const outs = S().party.filter(m => m.id !== 'raine' && m.id !== 'miasma');
  const pick = await ask(host, incoming.id === 'brakka' ? "Room for one more gunsmith? Who takes a breather?" : `${incoming.name} is ready to go. Who sits this one out?`, [...outs.map(m => m.name), 'Nobody']);
  if (pick >= outs.length) return;
  const out = outs[pick];
  S().party = S().party.filter(m => m !== out); b.splice(inIdx, 1, out); S().party.push(incoming);
  Audio2.sfx('levelup');
  await notify(`${incoming.name} joins. ${out.name} waits in Kharak Yr.`, 'levelup');
  if (incoming.id === 'brakka') S().flags.brakkaWaits = false;
}
{ // the bench NPC shows Brakka, or whoever is sitting out in her place
  const n = MAPS.kharakyr.npcs[4], who = () => (!Game.state || !hasKey('gunpass')) ? null : bench()[0];
  n.show = () => !flag('brakkaGone') && (!hasKey('gunpass') ? !member('brakka') : bench().length > 0);
  Object.defineProperty(n, 'look', { get: () => { const w = who(); return w ? HEROES[w.id].look : 'brakka'; }, configurable: true });
  Object.defineProperty(n, 'name', { get: () => { const w = who(); return w ? w.name : 'Brakka'; }, configurable: true });
}
async function enterGunworks() {
  const f = F();
  if (flag('gunworks')) { await f.warp('gunworks1', 6, 14, 'up'); return; }
  if (!hasKey('gunpass')) { await say('Edict Guard', "Gunworks are closed. No Foundry Pass, no entry."); await f.walk('down', 1); return; }
  await say('Edict Guard', "A Foundry Pass. Signed by... 'Definitely The Foreman.' ...Looks legit. Go on.");
  await f.warp('gunworks1', 6, 14, 'up');
}
async function cannonEvent() {
  const f = F();
  if (flag('gunworks') || f._cannonBusy) return;
  f._cannonBusy = true;
  try {
    await scene(async ({ raine, miasma, brakka }) => {
      await f.pan(10, 4, 30);
      await say(null, "Grimnar's Voice: a cannon the size of a house, walking on iron legs. Edict engineers scatter as it turns toward you.");
      if (brakka) { await brakka.angry(); await say('Brakka', "MY cannon! You put LEGS on my CANNON! Do you know how hard it is to balance a cannon on LEGS?!"); }
      await say(MI(), "Big gun. Big legs. Very bad day.");
      await raine.lunge();
    });
    const r = await startBattle({ enemies: ['cannongolem'], boss: true, bg: 'forge', music: 'boss', noRun: true });
    if (r !== 'win') return;
    setFlag('gunworks');
    await scene(async ({ raine, miasma, brakka }) => {
      await say(null, "Grimnar's Voice crashes to its knees, steaming. Among the wreckage: crates of Edict blackpowder, and a sealed letter.");
      await notify('Found a letter: "By order of the Unseated: take the Anvil from the Final Gate. Bring it to me. - K."', null);
      await say(R(), "'K.' Someone in the Edict is working for Sonia.");
      const c = await ask(R(), "(Crates and crates of blackpowder.)", ['Take the powder for ourselves.', 'Blow it up so nobody gets it.']);
      if (c === 0) { setFlag('tookPowder'); addItem('flashbomb', 10); await notify('Took 10 Gunpowder Jars.', 'chest'); if (brakka) { await brakka.sweat(); await say('Brakka', "Practical! Also slightly terrifying. I'll carry it. Nobody else touch it. Seriously."); } }
      else { setFlag('blewPowder'); Game.flash = 16; Game.shake = 30; Audio2.sfx('boom'); await say(null, "BOOM."); if (brakka) { await brakka.laugh(4); await say('Brakka', "Now THAT is a sound! Nobody's marching a cannon anywhere with that lot."); } else await say(MI(), "...I will never get tired of that."); }
      await say(null, "Far off, a great chain groans. The Edict's lava bridge to Draumond's Gate is lowering. The engineers must have fled that way.");
    });
    await notify('The lava bridge to Draumond\'s Gate is open!', 'chest');
  } finally { f._cannonBusy = false; }
}

// ------------------------------------------------------------------ Draumond's Gate
async function bookOfTheDead() {
  const KB = 'Keeper of the Book';
  if (flag('draumond')) return say(KB, "The pass to Mount Terminus is open for you. Go and see what has taken the Ferryman's boat.");
  await scene(async ({ raine, miasma, verai, luna, brakka }) => {
    const kb = npcActor(1); kb.face(raine); raine.face(kb);
    await say(KB, "Welcome to the Hall of the Book. Every soul that passes Grimnar's Final Gate is written here. None is forgotten.");
    await say(R(), "Then I need you to look for someone. My mother. Wife of High Knight Odeaon of Solanthia. She died when I was a baby. A dragon killed her.");
    await miasma.tremble(60);
    await kb.walk('up'); kb.face('up'); await wait(60); await kb.walk('down'); kb.face(raine);
    await say(KB, "...There is no such soul in the Book, child.");
    await raine.surprise();
    await say(KB, "No wife of Odeaon has passed the Final Gate. Not seventeen years ago. Not ever. Either she never had a soul to write...");
    await say(KB, "...or she is not dead.");
    giveKey('deathpage');
    await raine.stepBack(); await raine.tremble(40);
    await say(R(), "Not... dead?");
    const vs = veraiState();
    if (verai) { verai.face(raine); await say(VE(), "Raine... my name is in here. Written seventeen years ago. As a death. Somebody wanted the world to think I was gone."); await verai.sad(); }
    else if (vs === 'leave') await say(KB, "Strange. A girl with smoke in her hair came here three days ago. She asked for her own name. It was here, written as a death. She laughed, and she cried, and she left.");
    else if (vs === 'sonia') await say(KB, "Strange. A woman in gold came here with a girl in violet. The woman tore a page from the Book. The girl looked back at me the whole way out.");
    raine.face(miasma);
    const c = await ask(R(), "(Miasma won't look at anyone.)", ['"Miasma. You knew. Didn\'t you?"', 'Say nothing.']);
    if (c === 0) {
      addFlag('pressedMiasma');
      await miasma.stepBack();
      await say(MI(), "Raine, I...");
      await miasma.sad(80);
      if (num('pressedMiasma') >= 2) {
        await say(MI(), "I knew her. Your mother. Better than anyone alive. And I promised someone I would never say it out loud.");
        await say(MI(), "When the Anvil is safe, I'll tell you everything. I swear it on my wings. Please. Just let me keep that promise one more day.");
        setFlag('miasmaPromise');
      } else await say(MI(), "...When this is over. I'll tell you what I can. Not here. Not with the dead listening.");
      await raine.nod(1);
    } else await say(null, "Raine turns back to the Book. Behind her, Miasma lets out a breath she's been holding for seventeen years.");
    kb.face(raine);
    await say(KB, "Now. The Final Gate at Mount Terminus has gone dark. The Ferryman who guides souls across no longer answers the bell. Something with stolen night in it sits in his boat.");
    await say(KB, "Grimnar's Anvil rests beyond that Gate. If whatever took the Ferryman gets its hands on it... I will open the pass for you. Go.");
    F().despawn(kb);
  });
  setFlag('draumond');
  await notify('The pass to Mount Terminus is open!', 'chest');
}

// ------------------------------------------------------------------ Mount Terminus
async function ferrymanEvent() {
  const f = F();
  if (flag('ferryman') || f._ferryBusy) return;
  f._ferryBusy = true;
  try {
    const vs = veraiState();
    if (vs === 'sonia' && !flag('veraiMet')) {
      setFlag('veraiMet');
      await scene(async ({ raine, miasma }) => {
        await f.pan(10, 4, 30);
        const vv = f.spawn({ id: 'vv', look: 'verai', name: 'Verai', x: 10, y: 4, dir: 'down', alpha: 0 });
        await vv.fadeIn(40);
        await raine.surprise();
        await say(R(), "Verai!");
        await say(VE(), "Go home, Raine. My mother says the Anvil is hers. I'm supposed to make sure you don't take it.");
        await say(R(), "Your mother left you in the mist.");
        await vv.tremble(30);
        await say(VE(), "And YOU left me in Hollowmere. Everyone leaves me somewhere. At least she came back for me.");
        f.despawn(vv);
      });
      await startBattle({ enemies: ['veiledverai'], boss: true, bg: 'volcano', music: 'final', noRun: true, cantLose: true, turnLimit: 5 });
      await scene(async ({ raine }) => {
        const vv = f.spawn({ id: 'vv', look: 'verai', name: 'Verai', x: 10, y: 4, dir: 'down' });
        const c = await ask(R(), "(Verai is shaking. Her smoke flickers between violet and grey.)", ['Reach out your hand.', 'Draw your weapon.']);
        if (c === 0) {
          await raine.walk('up');
          await say(R(), "I'm not leaving this time. I'm right here. Whenever you want to come back, I'll be right here.");
          await vv.sad(80);
          if (num('bond') >= 1) { setFlag('veraiDoubt'); await say(VE(), "...Don't. Don't be kind to me. It makes it so much harder."); await say(null, "Verai drops something as she fades into the smoke: a strip of grey scarf, knotted the way Raine used to knot it."); }
          else { setFlag('veraiCold'); await say(VE(), "You're four years too late, Raine."); }
        } else { setFlag('veraiCold'); await raine.lunge(); await say(VE(), "...So that's who you are now."); }
        await vv.fadeOut(40); f.despawn(vv);
      });
    }
    await scene(async ({ raine, miasma, verai, luna, brakka }) => {
      await f.pan(10, 3, 30);
      await say(null, "The Ash Ferryman stands at the Gate of Eternity. A tall raven-masked figure with a burning oar, leaking violet smoke from every crack.");
      if (verai) { await verai.tremble(40); await say(VE(), "That's HER dark in it. Sonia's. My... my dark. It's hurting him."); }
      await say('The Ash Ferryman', "No living thing crosses the Final Gate.");
      if (luna) { await luna.lunge(); await say('Luna', "Then it's a good thing we're not crossing. We're just knocking."); }
    });
    const r = await startBattle({ enemies: ['ferryman'], boss: true, bg: 'volcano', music: 'boss', noRun: true });
    if (r !== 'win') return;
    setFlag('ferryman');
    await scene(async ({ raine, miasma, verai, luna, brakka }) => {
      await say(null, "The violet smoke pours out of the Ferryman and scatters. The raven mask turns toward you, grey and calm again.");
      await say('The Ash Ferryman', "...The stolen night is gone. Thank you, living ones. The Anvil is safe. Carry it from here. It will not be safe with me until the Gate is mended.");
      giveKey('anvilshard');
      await notify('Received the Anvil Shard, Grimnar\'s reliquary!', 'levelup');
      if (verai) {
        verai.face('up');
        await say(null, "The last of the violet smoke curls toward Verai, and settles into her hair like it's coming home.");
        await verai.surprise();
        await say(VE(), "It... listened to me. Nyxia's night. It listened.");
        setFlag('veraiNight');
      }
      if (veraiState() === 'leave' && !hasV()) {
        const vv = f.spawn({ id: 'vv', look: 'verai', name: 'Verai', x: 12, y: 6, dir: 'left', alpha: 0 });
        await vv.fadeIn(40);
        await raine.surprise();
        await say(VE(), "I followed the smoke here. It's been pulling me toward this place for days. Toward... you, I think.");
        const c = await ask(R(), "(Verai is right here.)", ['"Come back with us."', '"Take the time you need. I\'ll wait."']);
        if (c === 0 && num('bond') >= 1) {
          await vv.heart(); await say(VE(), "...Yes. Okay. Yes. But you're carrying my bag.");
          f.despawn(vv);
          if (S().party.length >= 4 && member('brakka')) { const bk = member('brakka'); S().party = S().party.filter(m => m !== bk); bench().push(bk); setFlag('brakkaWaits'); await say('Brakka', "Four's a crowd! I'll head home and guard the Gunworks. Come visit. Bring explosives."); }
          addMember('verai'); setFlag('veraiRejoined');
          await notify('Verai rejoins the party!', 'levelup');
        } else if (c === 0) {
          await vv.sad(); await say(VE(), "Not yet, Raine. I still don't know what I am. But... I'll find you. I promise. And unlike some people, I keep those."); setFlag('veraiWaits');
          await vv.fadeOut(40); f.despawn(vv);
        } else {
          addFlag('bond'); await vv.heart(); await say(VE(), "...Thank you. For not pulling. I'll come back. I promise."); setFlag('veraiWaits');
          await vv.fadeOut(40); f.despawn(vv);
        }
      }
      await say(null, "A black raven lands on the arch of the Gate, turns one eye on Raine, and speaks with a voice like a forge cooling.");
      await say('Raven', "The Tenth Flame wants to see you, crescent-bearer. The fire around his Throne will part for you now.");
      await miasma.sweat();
    });
    await notify('The path to the Throne of Cinders is open!', 'chest');
  } finally { f._ferryBusy = false; }
}

// ------------------------------------------------------------------ The Throne of Cinders
async function throneEvent() {
  const f = F();
  if (flag('ch2end') || f._throneBusy) return;
  f._throneBusy = true;
  try {
    setFlag('throneMet');
    Audio2.music('phoenix');
    let give = false;
    await scene(async ({ raine, miasma, verai, luna, brakka }) => {
      const ash = npcActor(1);
      await f.pan(10, 3, 30);
      await ash.hop(12); ash.face(raine);
      await say(ASHKAR, "Oh, finally! Do you know how long I've been sitting on this rock looking mysterious? My back hurts. Gods have backs.");
      await say(null, "He looks like a young man with burning hair and golden eyes. The whole caldera leans toward him like flowers toward the sun.");
      await say(R(), "You're Ashkar. The Tenth Flame.");
      await ash.laugh(2);
      await say(ASHKAR, "The Patron Made Divine! The God Who Rose Twice! I have several titles. I'm working on a fourth.");
      await ash.walk('down'); ash.face(raine);
      await say(ASHKAR, "And that. Around your neck. My crescent.");
      await ash.surprise();
      await say(ASHKAR, "I gave that to a red dragon, a long time ago. She laughed too loud and she swore she would never take it off.");
      ash.face(miasma);
      await say(ASHKAR, "Hello, Miasma. You got old.");
      await Promise.all([raine, verai, luna, brakka].filter(Boolean).map(a => a.surprise()));
      faceAll([raine, verai, luna, brakka], miasma);
      await miasma.angry();
      await say(MI(), "I got SENSIBLE. And you got a promotion you didn't earn, you overgrown chicken.");
      raine.face(miasma);
      const pushes = num('pressedMiasma');
      const c = await ask(R(), "(Everyone is staring at Miasma.)", ['"Tell me the truth. Now."', '"...When you\'re ready."']);
      if (c === 0) {
        if (pushes >= 1 || flag('miasmaPromise')) {
          await miasma.sad(80);
          await say(MI(), "I gave that crescent to your father, Raine. For you. The night he took you away to Solanthia.");
          await say(MI(), "I knew your mother better than anyone in the world. That's all I can say today. Everything else... I made a promise to him. And he's the one who has to break it with me.");
          setFlag('miasmaHalfTruth');
          await raine.tremble(30); await say(R(), "...Then we're going to find my father. And you're both going to tell me.");
        } else {
          await miasma.stepBack(); await say(MI(), "Not here, kid. Not in front of HIM."); await say(ASHKAR, "Rude. Accurate, but rude.");
        }
      } else { addFlag('miasmaTrust'); await say(R(), "When you're ready, Miasma. Not before."); await miasma.heart(); await say(MI(), "...Thank you."); }
      ash.face(raine);
      await say(ASHKAR, "Now, business. Sonia stole the Heartseed. Elaris is fading. When a seat empties, Sonia will sit in it. And she won't stop at one seat.");
      await say(ASHKAR, "You carry Grimnar's Anvil. Give it to me. Under my wing it's safe, and I'll fight Sonia beside you. A god as an ally. Imagine!");
      if (verai) { await say(VE(), "He took Nyxia's seat. The last time a god got 'safe keeping', a goddess died."); }
      if (luna) { await say('Luna', "A reliquary isn't a coin, Captain. Whoever holds it holds the faith of a whole people."); }
      const c2 = await ask(R(), "(Give the Anvil Shard to Ashkar?)", ['Give him the Anvil Shard.', 'Refuse.']);
      give = c2 === 0;
      if (give) {
        takeKey('anvilshard'); setFlag('ashkarAlly');
        await ash.laugh(3);
        await say(ASHKAR, "Wise! Generous! Attractive! I'll remember this.");
      } else {
        setFlag('ashkarRival');
        await ash.angry();
        await say(ASHKAR, "No? ...No. Ha! Nobody has told me no since I became a god. It's REFRESHING.");
        await say(ASHKAR, "Then prove you can keep it. Show me you're strong enough to hold a god's heart in your hands.");
      }
    });
    if (give) {
      await scene(async ({ raine }) => {
        const kg = f.spawn({ id: 'kargath', look: 'kargath', name: 'Warlord Kargath', x: 10, y: 13, dir: 'up', alpha: 0 });
        await kg.fadeIn(20);
        Game.shake = 20; Audio2.sfx('boom');
        await raine.surprise(); raine.face(kg);
        await say('Warlord Kargath', "How touching. A god, a traitor and a dragon, sharing secrets. The Unseated One pays better than any god, Cudlar.");
        await say('Warlord Kargath', "'K', from the letter. Yes. I'll take the Anvil from the chicken myself. After I make a pyre of you.");
        f.despawn(kg);
      });
      const r = await startBattle({ enemies: ['kargath'], boss: true, bg: 'caldera', music: 'final', noRun: true });
      if (r !== 'win') return;
    } else {
      const r = await startBattle({ enemies: ['ashkargod'], boss: true, bg: 'caldera', music: 'final', noRun: true });
      if (r !== 'win') return;
      await cinema([
        { dur: 200, bg: 'fire', caption: 'Ashkar lands on his back in the ash, laughing like a boy.', layers: [{ look: 'ashkarman', x: W / 2, y: 540, s: 6, bob: 3 }] },
        { dur: 200, bg: 'fire', shake: 16, sfx: 'boom', caption: 'Behind you, a man in a split mask steps out of the smoke, with a blade drawn... and Ashkar burns him to ash without even standing up.', layers: [{ look: 'kargath', x: W / 2, y: 540, s: 6, to: { a: 0 } }] },
      ], { skipAll: false });
    }
    await chapter2Finale(give);
  } finally { f._throneBusy = false; }
}
async function chapter2Finale(give) {
  const f = F();
  openJob('phoenix'); addItem('phoenixplume');
  await scene(async ({ raine, miasma, verai, luna, brakka }) => {
    const ash = npcActor(1); ash.face(raine);
    if (give) await say(ASHKAR, "Well fought. I'd have helped, but I was busy looking dramatic. Here: the pact of the Phoenix. Anyone who wants my fire can have it.");
    else await say(ASHKAR, "You kept it. You kept it from a GOD. Fine. Keep your Anvil. Take my fire anyway. I want to see what you do with it.");
    await notify('The Phoenix Warlock job is now available! Received a Phoenix Plume.', 'levelup');
    await say(null, "A black raven drops out of the red sky and lands on Raine's shoulder. A letter is tied to its leg, sealed with the silver sword of the Dawnguard.");
    await raine.question();
    await say(null, "\"Raine. They know I helped you. The Luminar's people are coming for me tonight. Don't come back for me. Stay alive. I'm sorry for everything I never told you. - Father.\"");
    await raine.tremble(50);
    await say(R(), "...Father's been arrested. For helping me.");
    await miasma.angry();
    await say(MI(), "That stubborn, noble, IDIOT man.");
    raine.face(miasma);
    await say(R(), "You said you'd tell me everything when the Anvil was safe. Well. We're going to save my father first. And then the two of you are going to sit me down.");
    await miasma.nod(2);
    await say(MI(), "...Deal. Kid.");
    if (verai) { await say(VE(), "Then we go back to Aurelion. Together, this time."); await verai.heart(); }
    else if (flag('veraiWaits')) await say(null, "Somewhere far off, a thread of grey smoke drifts toward Aurelion, as if it knows the way.");
    if (luna) await say('Luna', "The Dawnguard will be guarding him. I know every one of their shifts. And most of their snacks.");
    if (brakka) await say('Brakka', "Prison break?! I have SO many ideas. Most of them explode.");
    ash.face('down');
    await say(ASHKAR, give ? "Go. I'll keep Grimnar's Anvil warm. And when Sonia comes for my seat, I'll remember who stood beside me." : "Go. And when Sonia comes for my seat, I'll remember who told me no.");
    F().despawn(ash);
  });
  setFlag('ch2end');
  await chapter2End(give);
}
async function chapter2End(give) {
  Audio2.music(null);
  await fadeOut(60);
  const vs = veraiState();
  await cinema([
    { dur: 230, bg: 'fire', music: 'phoenix', sub: 'The Throne of Cinders', caption: give ? 'The Tenth Flame holds Grimnar\'s Anvil, and calls Raine a friend.' : 'The Tenth Flame lets them go, and laughs about it for three days.' },
    { dur: 230, bg: 'stars', caption: 'In a cell under the Grand Temple of Solanthia, High Knight Odeaon sits in the dark, and waits.', layers: [{ look: 'odeaon', dir: 'down', x: W / 2, y: 560, s: 5 }] },
    vs === 'sonia' && !hasV()
      ? { dur: 230, bg: 'void', music: 'sonia', caption: flag('veraiDoubt') ? 'In the dark between the seats, Verai unties a strip of grey scarf, and ties it again.' : 'In the dark between the seats, Verai does not look back.', layers: [{ look: 'verai', dir: 'down', x: W / 2, y: 540, s: 5, silhouette: flag('veraiDoubt') ? null : '#5a20a0' }] }
      : { dur: 230, bg: 'void', music: 'sonia', caption: 'Somewhere between the seats, Sonia sets the Heartseed on an empty throne. It is still beating. Slower now.', layers: [{ img: 'b_sonia', x: W / 2, y: 610, s: 1.3 }] },
  ], { skipAll: false });
  await crawl([
    'Elaris is fading. Sonia is waiting.',
    '',
    give ? 'Grimnar\'s Anvil rests with a phoenix god.' : 'Grimnar\'s Anvil rests in Raine\'s pack.',
    flag('miasmaHalfTruth') ? 'Raine knows Miasma knew her mother.' : 'Miasma is still keeping her promise.',
    'Raine\'s mother is not in the Book of the Dead.',
    hasV() ? 'Verai walks beside her.' : flag('veraiWaits') ? 'Verai follows the smoke, somewhere behind.' : 'Verai stands at her mother\'s side.',
    flag('lunaRevealed') ? 'Luna walks bareheaded under a red sky.' : 'Luna keeps her helmet on. For now.',
    member('brakka') ? 'Brakka has already packed too many explosives.' : 'In Kharak Yr, Brakka is rebuilding her Gunworks.',
  ], { speed: 0.7 });
  await cinema([
    { dur: 330, bg: 'seats', sfx: 'holy', flash: 14, layers: [
      { text: 'END OF CHAPTER TWO', x: W / 2, y: 210, size: 36, color: '#ffe070', glow: 'rgba(255,200,80,0.8)', fadeIn: 40 },
      { text: 'THE TENTH FLAME', x: W / 2, y: 270, size: 18, color: '#ffb040', fadeIn: 80 },
      { text: 'Next: Chapter Three - The Knight in the Dark', x: W / 2, y: 360, size: 12, color: '#a8a8d0', fadeIn: 140 },
    ] },
  ], { skipAll: false });
  setFlag('ch2done');
  await saveScreen(vs, Math.floor(S().playTime / 60), 'CHAPTER TWO COMPLETE', [
    give ? 'You gave Ashkar the Anvil.' : 'You refused Ashkar.',
    flag('trialWon') ? 'You won the Trial by Combat.' : 'You paid your way out of Emberport.',
    flag('miasmaHalfTruth') ? 'Miasma told you half the truth.' : 'Miasma kept her secret.',
    hasV() ? 'Verai is with you.' : flag('veraiWaits') ? 'Verai will find you.' : 'Verai is with Sonia.',
  ], 'Chapter Three will continue from this file.');
  if (typeof chapter3Opening === 'function') { await chapter3Opening(); return; }
  await fadeIn(40);
  Audio2.music(musicFor(F().map));
}

// ------------------------------------------------------------------ hooks
MAPS.emberport.onEnter = null;
