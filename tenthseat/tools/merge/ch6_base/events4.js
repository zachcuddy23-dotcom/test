'use strict';
// ---------------------------------------------------------------------------
// Chapter Four: "The Drowned Sanctuary", the breaking point.
//
// Verai: her goodwill (flags.veraiWill) is built from how she's been treated: the Chapter One bond,
//   whether she's been kept in the party or left on the bench, the Terminus night, coming back on her own,
//   and being trusted at Raine's bedside. While Raine catches up with her parents, Verai looks into the
//   sea and sees her mother smiling back. Low goodwill: she goes with Sonia, gone for the whole chapter.
//   Otherwise three more moments push her; if her goodwill breaks, she leaves mid-chapter.
// Luna: the chapter's heart. Moonhollow, the Cleansing, what she is, why she hid, why she worked
//   eight years as a knight, and the knight who spared her as a cub (Odeaon knew the whole time).
// The Anvil: Ashkar's ally (he holds it) and Ashkar's rival (Raine holds it) play differently.
//
// Flags: ch4start, veraiWill (number), veraiResisted, veraiGone4 (+ flags.veraiGoneWhen), veraiStood,
//   ch4moon, ch4lunaTalk, ch4purge, lunaUnmasked, hallornSpared / hallornKept, ch4dive, ch4mirrors,
//   mirrorLeft / mirrorMiddle / mirrorRight, ch4bloom, anvilSealed / anvilLost, ashkarGuttered,
//   veraiReach, ch4done.  Verai's member data is kept in S().away.verai while she's gone.
// ---------------------------------------------------------------------------
const HESK = 'Grandmother Hesk', ASH = 'Ashkar';
Object.assign(NPC_FACES, { 'Grandmother Hesk': 'face_hesk', 'Hallorn, the Cleanser': 'face_hallorn', 'Pyrewarden Sael': 'face_sael', 'Ysolde': 'face_ysolde', 'Elaris': 'face_elaris', 'Sonia (reflection)': 'face_sonia' });
// Luna's field look changes once she stops hiding
Object.defineProperty(HEROES.luna, 'look', { get: () => (Game.state && S().flags && S().flags.lunaUnmasked) ? 'lunawolf' : 'luna', configurable: true });

function veraiHere() { return !!member('verai') || (S().bench || []).some(m => m.id === 'verai'); }
// Verai travels with the group even from the bench: in scenes she steps forward either way
function vActor(cast) {
  if (cast.verai) return cast.verai;
  if (!veraiHere() || flag('veraiGone4')) return null;
  const st = S();
  return (cast.verai = F().spawn({ id: 'verai', look: 'verai', name: 'Verai', x: st.x + 1, y: st.y + 1, dir: 'up' }));
}
function calcVeraiWill() {
  let w = num('bond');
  if (flag('veraiNight')) w++;
  w += member('verai') ? 1 : -2;              // kept out of the party hurts
  if (flag('veraiReturned')) w++;             // she came back on her own
  if (S().flags.watcher === 'verai') w++;     // trusted with Raine's bedside
  S().flags.veraiWill = w;
  return w;
}
function veraiLeaves(when) {
  const st = S(), m = member('verai') || (st.bench || []).find(b => b.id === 'verai');
  if (!m) return;
  st.party = st.party.filter(x => x !== m); st.bench = (st.bench || []).filter(x => x !== m);
  st.away = st.away || {}; st.away.verai = m;
  setFlag('veraiGone4'); st.flags.veraiGoneWhen = when;
}
function ensureInParty(id) {
  const st = S(); if (member(id)) return member(id);
  const b = (st.bench || []).find(m => m.id === id); if (!b) return null;
  st.bench = st.bench.filter(m => m !== b);
  if (st.party.length >= 4) { const out = [...st.party].reverse().find(m => !['raine', 'miasma', 'odeaon'].includes(m.id)) || st.party[st.party.length - 1]; st.party = st.party.filter(m => m !== out); st.bench.push(out); }
  st.party.push(b); return b;
}
function allyRoute() { return flag('ashkarAlly'); }
function healParty() { for (const m of S().party) { m.status = {}; const s2 = stats(m); m.hp = s2.mhp; m.mp = s2.mmp; } }

// ------------------------------------------------------------------ opening
async function chapter4Opening() {
  if (flag('ch4start')) return;
  setFlag('ch4start');
  const f = F();
  const st = S(); st.onShip = false;
  f.enterMap('wrendeck', 8, 5, 'up'); Game.fade = 1;
  await cinema([
    { dur: 260, bg: 'seats', music: 'title', layers: [
      { text: 'CHAPTER FOUR', x: W / 2, y: 220, size: 30, color: '#ffe070', glow: 'rgba(255,200,80,0.8)', fadeIn: 30 },
      { text: 'THE DROWNED SANCTUARY', x: W / 2, y: 280, size: 20, color: '#9ad8e8', fadeIn: 70 },
    ] },
    { dur: 200, bg: 'river', music: 'sea', sub: 'The Wren, three days out of Solanthia', caption: 'For the first time in twenty years, Raine\'s whole family is in one place. It is extremely awkward.' },
  ], { skipAll: false });
  Game.fade = 0;
  calcVeraiWill();
  await familyScene();
  if (veraiHere()) await veraiReflection();
  await cleansingNews();
  if (allyRoute()) await ashkarArrives(); else if (!(await cinderKnights())) return;   // lost: Game Over takes it from here
  await tip("Moonhollow, Luna's hidden village, lies deep in the Silverleaf, west of Solanthia. After that, the drowned sanctuary waits under the Twin Falls, at Elaris's Embrace in the south.");
  st.ship = { x: 55, y: 19 }; st.onShip = true;
  f.enterMap('world', 55, 19, 'left');
  Audio2.music('sea');
}
async function familyScene() {
  const skip = S().party.map(m => m.id).filter(id => !['raine', 'miasma', 'odeaon'].includes(id));
  await scene(async ({ raine, miasma, odeaon }) => {
    if (!odeaon || !miasma) return;
    await say(null, "The bow of the Wren. A knight, a dragon and their daughter, sharing one bench, all trying very hard to look at the sea.");
    await say(ODE(), "So. Twenty years of lies, three days of silence, and a dragon on the deck.");
    if (flag('raineAnger')) { await say(R(), "I'm still furious, by the way."); await say(MI(), "Noted. It's in the log. Page one. Underlined twice."); }
    else if (flag('raineSilent')) { await say(null, "Raine doesn't say anything. But she sat down on the same bench. Miasma notices. Miasma notices very hard."); }
    else { await say(R(), "I asked why. You told me. I'm still angry. But I'm here."); await say(MI(), "That's all I get to ask for, kid."); }
    raine.face(odeaon);
    await say(R(), "Were you two... married?");
    await say(ODE(), "On the mountain. A goat officiated.");
    await say(MI(), "It was a very respectable goat.");
    await raine.question();
    await say(R(), "Tell me something true. Anything. Something small.");
    await miasma.laugh(1);
    await say(MI(), "You bit me. Teething. Dragon hide and all, you drew blood.");
    await say(ODE(), "She was very proud of you.");
    await say(MI(), "I cried for an hour. Then I was very proud of you.");
    await raine.laugh(1);
  }, { skip, layout: { raine: [8, 4, 'up'], miasma: [7, 4, 'up'], odeaon: [9, 4, 'up'] } });
}
async function veraiReflection() {
  const benched = !member('verai');
  const w = num('veraiWill');
  const skip = S().party.map(m => m.id).filter(id => id !== 'verai');
  const before = { party: [...S().party], bench: [...(S().bench || [])] };
  if (benched) ensureInParty('verai');
  await scene(async ({ verai }) => {
    if (!verai) return;
    await say(null, "At the stern, away from the laughing, Verai watches the wake.");
    await say(VE(), "Listen to them. A family. A real one. A dragon and a knight and their daughter.");
    await say(VE(), "And what am I? The Unseated One's daughter. A piece of Nyxia's stolen night. A godling.");
    if (benched) await say(VE(), "They leave me below deck. Like luggage. Like a weapon in a box: take it out when you need something to bleed.");
    else await say(VE(), "They're kind. They're always kind. But kind is how you treat a weapon you're afraid of.");
    await verai.sad();
    await say(null, "She looks down into the water. The reflection that looks back is not hers.");
    Audio2.music('sonia');
    await say('Sonia (reflection)', "There you are, little night.");
    await say(null, "In the water, Sonia is smiling. Not cruelly. That's the worst part.");
    await say('Sonia (reflection)', "They'll use you up, and call it friendship. I never lied to you about what you are. Come home.");
    await verai.tremble(40);
    if (w < 3) {
      await say(VE(), "...You never lied to me.");
      await say(VE(), "Nobody ever asked me what I wanted. Not once. Not even her.");
      await verai.walk('down', 16);
      Game.flash = 8; Audio2.sfx('dark');
      await verai.fadeOut(50);
      await say(null, "Grey smoke curls off the stern, and drifts away across the water, toward nothing at all.");
    } else {
      await verai.angry();
      await say(VE(), "No.");
      Audio2.sfx('dark'); Game.flash = 6;
      await say(null, "Verai slaps the sea with a fistful of smoke. The reflection shatters.");
      await say(VE(), "I'm not yours. I'm not THEIRS either. I'm mine.");
      setFlag('veraiResisted');
    }
  }, { skip, layout: { verai: [8, 7, 'down'] } });
  if (benched) { S().party = before.party; S().bench = before.bench; }   // the party goes back to how it was
  if (w < 3) veraiLeaves('reflection');
  if (w >= 3 && member('luna')) {
    await scene(async ({ verai, luna }) => {
      await luna.walk('down', 12);
      await say('Luna', "I know that look. It's the look of someone who's just been told what she is.");
      await say(VE(), "...Do you ever want to stop pretending? To just BE the thing, and let them look?");
      await luna.sad();
      await say('Luna', "Every single day.");
    }, { skip: S().party.map(m => m.id).filter(id => !['verai', 'luna'].includes(id)), layout: { verai: [8, 7, 'down'], luna: [8, 5, 'down'] } });
  }
  Audio2.music('sea');
}
async function cleansingNews() {
  await scene(async ({ raine, miasma, odeaon, luna }) => {
    if (flag('veraiGone4')) {
      await say(R(), "Has anyone seen Verai?");
      if (luna) { await luna.walk('down', 14); await say('Luna', "...Captain. This was on the rail."); }
      await say(null, "A strip of grey scarf, knotted twice. Verai's.");
      await raine.tremble(40);
      await say(R(), "Verai? ...VERAI!");
      if (miasma) { await miasma.sad(); await say(MI(), "Her mother. It had to be."); }
      await say(R(), "Then we get her back. However long it takes.");
    }
    Game.shake = 6; Audio2.sfx('bump');
    await say(null, "A raven drops onto the rail with a proclamation nailed to its leg. The same one is being read in every square in Aurelion.");
    await say(null, "\"By order of ACTING LUMINAR HALLORN: The false Luminar was a monster wearing a saint's face. Therefore every monster is a false face. THE CLEANSING begins today. Every beast, every dragon, every godling: bring them to the Light, or be judged beside them.\"");
    if (odeaon) { await odeaon.angry(); await say(ODE(), "Hallorn. He was never faithful. He was only ever obedient. Now there's nobody to obey, so he's obeying his fear."); }
    if (luna) {
      await luna.tremble(60);
      await say('Luna', "...Captain. I need to go to the Silverleaf. Now. Please.");
      if (flag('lunaRevealed')) await say('Luna', "There are more of us. A village. My family. They've hidden there for twelve years. If the Cleansing finds them...");
      else { await say('Luna', "There are... people there. Who need warning. Important people. Very... hairy... people."); if (miasma) { await miasma.question(); await say(MI(), "Hairy."); } await say('Luna', "I'll explain when we get there. I promise. I'll explain EVERYTHING."); }
      await raine.nod();
      await say(R(), "Then we go. Right now.");
    }
  });
}
async function ashkarArrives() {
  await scene(async ({ raine, miasma, brakka }) => {
    Game.flash = 16; Game.shake = 30; Audio2.sfx('fire');
    await say(null, "The sky catches fire. Something crashes onto the deck in a burst of burning feathers, and the Wren's crew runs for buckets.");
    const ash = F().spawn({ id: 'ash', look: 'ashkarman', name: ASH, x: 8, y: 3, dir: 'down' });
    await ash.kneel();
    await say(ASH, "...Hello, little crescent. Don't look at me like that. Gods are allowed to make an entrance.");
    await say(null, "He's bleeding fire. Actual fire, from a wound in his side that won't close.");
    await say(ASH, "Sonia came to my Throne for the Anvil. I burned her shadows for three days. She just... kept... coming.");
    await say(ASH, "I can't keep it. She can smell it on me now. There's one place her night can't follow: underwater, under a goddess's last breath.");
    await say(ASH, "Elaris's sanctuary. The one that sank at the Twin Falls. Take the Anvil down there, and let Elaris hide it.");
    giveKey('anvilshard'); giveKey('phoenixember');
    await notify('Received the Anvil Shard and the Phoenix Ember!', 'levelup');
    await say(ASH, "The ember will keep the sea off you. Don't lose it. It's technically my heart. A small piece. I have spares. Probably.");
    if (miasma) { await miasma.laugh(1); await say(MI(), "You look terrible, Ash."); await say(ASH, "And you look like a DRAGON, finally. Took you long enough."); }
    await say(ASH, "I'll rest in your captain's cabin. Quietly. Magnificently. Quietly magnificent.");
    F().despawn(ash);
  });
}
async function cinderKnights() {
  await scene(async ({ raine, miasma }) => {
    Game.shake = 20; Audio2.sfx('boom');
    await say(null, "Grappling hooks bite into the rail. Knights in blackened, smouldering armor climb aboard, trailing sparks.");
    await say('Pyrewarden Sael', "Raine Cudlar. You told a god NO. The Tenth Flame remembers. Give back the Anvil.");
    await raine.angry();
    await say(R(), "It was never his. It's Grimnar's.");
    await say('Pyrewarden Sael', "Then burn with it.");
  });
  const r = await startBattle({ enemies: ['cinderknight', 'pyrewarden', 'cinderknight'], boss: true, bg: 'sea', music: 'boss', noRun: true });
  if (r !== 'win') return false;
  await scene(async ({ raine, miasma, brakka, odeaon }) => {
    await say('Pyrewarden Sael', "...He said you'd be stubborn. He said it like a compliment. He's not the only one hunting it, you know. The Unseated One can SMELL it.");
    await say(null, "Sael throws himself over the rail in a burst of cinders, and is gone.");
    await say(null, "In Raine's pack, Grimnar's Anvil is hot enough to scorch the leather. Somewhere above the Wren, ravens are circling.");
    await say(ODE(), "Elaris's sanctuary sank at the Twin Falls. Under the sea, under a goddess's last breath. Sonia's night can't follow it there.");
    if (brakka) {
      await brakka.question();
      await say('Brakka', "Underwater. So we need a diving bell. And a diving bell needs heat, or we freeze on the way down. And the hottest thing on this ship is...");
      await Promise.all([raine, miasma].filter(Boolean).map(a => a.question()));
      await say('Brakka', "...the cursed god-anvil in the Captain's pack. PERFECT. Give me a day and a very large hammer.");
    } else await say(MI(), "Brakka's waiting on the bench below deck. She'll build us something. She always builds us something.");
    giveKey('anvilbell');
    await notify('Brakka builds the Anvil Bell!', 'levelup');
  });
  return true;
}

// ------------------------------------------------------------------ Moonhollow
async function moonhollowArrival() {
  setFlag('ch4moon');
  ensureInParty('luna');
  const f = F();
  await scene(async ({ raine, miasma, odeaon, luna, verai, brakka }) => {
    const hesk = npcActor(1);
    await say(null, "Deep in the Silverleaf, the mist parts. Wolf-folk step out from between the birches: silver fur, gold eyes, and spears held very carefully not quite pointed at you.");
    if (!luna) return;
    await luna.walk('up', 12);
    if (!flag('lunaRevealed')) {
      await say(null, "Luna reaches up and, for the first time in front of any of you, takes off her helmet.");
      Game.flash = 6;
      await say(null, "Silver ears. Gold eyes. A face that has been hiding for a very long time.");
      await Promise.all([raine, miasma, brakka].filter(Boolean).map(a => a.surprise()));
      if (miasma) await say(MI(), "...Well. That explains the meat.");
      await say(R(), "Luna...?");
      await say('Luna', "Surprise? I'm sorry. I'm so sorry. I wanted to tell you a hundred times.");
      setFlag('lunaRevealed');
    } else {
      await say(null, "Luna takes off her helmet. Here, of all places, she doesn't have to hide.");
    }
    await say(HESK, "Little Luna. You came home. And you brought humans. And a DRAGON. And a knight of the Light.");
    await say('Luna', "They're my friends, Grandmother. And they're in danger too. The Cleansing is coming.");
    if (odeaon) {
      hesk.face(odeaon);
      await wait(30);
      await say(null, "Grandmother Hesk looks at Odeaon for a very long time.");
      await say(HESK, "...You.");
      await odeaon.kneel();
      await say(ODE(), "Grandmother.");
      luna.face(odeaon); await luna.question();
      await say('Luna', "You... know each other?");
      await say(ODE(), "Twelve years ago, the Temple burned a den in this forest. I was the knight they sent.");
      await say(ODE(), "I found a cub hiding under her mother's body. Silver fur, gold eyes, and she bit me. Hard.");
      await say(ODE(), "I couldn't do it. So I carried her here, to Hesk, and I told the Temple the den was empty.");
      await luna.tremble(60);
      await say('Luna', "...That was you.");
      await say(ODE(), "And four years later, a girl with her helmet on backwards walked into my barracks, lying about her age, asking to be a knight.");
      await say(ODE(), "I've known since the day you walked in, Luna.");
      await luna.surprise();
      await say('Luna', "HOW?! I never took the helmet off! Not ONCE in eight years!");
      if (miasma) {
        await miasma.laugh(2);
        await say(MI(), "Oh, sweetheart. Of course he knew you were a monster. He married a DRAGON. The man has a TYPE.");
        await odeaon.stand(); await odeaon.sweat();
        await say(ODE(), "MIASMA.");
        await raine.sweat();
        await say(R(), "Please never say 'type' about my father again. Ever. In my life.");
        if (brakka) { await brakka.laugh(3); await say('Brakka', "I'm writing that down. I'm putting it on a plaque."); }
      }
      await say(ODE(), "...You also howled in your sleep. Every full moon. The other knights thought we'd adopted a dog.");
      await luna.sweat();
      await say('Luna', "I did NOT— ...I did, didn't I.");
    }
  });
  await moonhollowVeraiMoment();
  await moonhollowNight();
  await cleansingAttack();
}
async function moonhollowVeraiMoment() {
  if (!veraiHere() || flag('veraiGone4')) return;
  await scene(async cast => {
    const { raine } = cast, verai = vActor(cast);
    await say(HESK, "The night-child. She smells of Nyxia. Of the dark before the moon.");
    await say(null, "The moonfangs have gone quiet. A few of them are backing away from Verai.");
    await say(HESK, "If the hunters come, that night of hers could hide the whole village. If she chose to.");
    await verai.stepBack();
    raine.face(verai);
    const c = await ask(R(), "(Everyone is looking at Verai.)", ['"Verai. Could you hide them? Only if you want to."', '"Verai, hide them. Now."', '"Luna, lead them out on foot. Leave Verai out of it."']);
    if (c === 0) { addFlag('veraiWill', 1); await verai.question(); await say(VE(), "...You asked. You actually asked.") ; await say(VE(), "Yes. I'll do it. Because I want to."); await verai.heart(); }
    else if (c === 1) { addFlag('veraiWill', -1); await verai.angry(); await say(VE(), "'Now.' Of course. Point the weapon, pull the trigger."); await say(VE(), "Fine. I'll do it. Don't thank me."); }
    else { addFlag('veraiWill', -1); await verai.sad(); await say(VE(), "Right. Leave the scary one out of it. It's fine. I'm used to it."); }
  });
  await checkVeraiBreak('moonhollow');
}
async function moonhollowNight() {
  const f = F();
  await fadeOut(30); f.nightTint = 'rgba(10,20,70,0.45)'; await fadeIn(30);
  await scene(async ({ raine, luna }) => {
    if (!luna) return;
    await say(null, "Night. The moonlit spring. Luna sits at the edge of the water with her boots off, which none of you have ever seen before.");
    await say('Luna', "Every monster the Temple ever let live was a monster in a helmet. So I wore one.");
    await say('Luna', "I thought if I was the best knight they had ever seen, then one day I could take it off, and they'd have to say: oh. Oh, she was one of THEM. And she was good.");
    await say('Luna', "Every full moon for eight years I wrote a letter to the Luminar. The Two Moons Accord. Let the ones who swear peace live. That's all it asked.");
    await luna.sad();
    await say('Luna', "Nobody ever answered. Of course they didn't. The Luminar was Sonia. My letters went to a woman who wanted every god dead. Why would she care about wolves?");
    await say('Luna', "And every patrol that came near the Silverleaf, I sent the long way round. Eight years of long ways round.");
    const c = await ask(R(), "(Luna won't look at you.)", ['"You ARE good. With or without the helmet."', '"You should have told me, Luna."', '"I would have worn a helmet with you."']);
    if (c === 0) { addFlag('lunaTrust'); await luna.heart(); await say('Luna', "...Say that again tomorrow. When I have my helmet on. So I know it wasn't the moonlight."); }
    else if (c === 1) { await luna.sad(); await say('Luna', "I know. I KNOW. I was so afraid you'd look at me the way the villagers looked at my mother."); await say(R(), "...I'd have looked at you the way I'm looking at you now."); }
    else { addFlag('lunaTrust'); await luna.laugh(2); await say('Luna', "You'd have looked RIDICULOUS."); await say(R(), "I'd have looked ridiculous WITH you."); await luna.heart(); }
    giveKey('accord');
    await say(null, "Luna gives Raine a thick bundle of letters, tied with silver string. Eight years of them. Every one of them unanswered.");
  });
  setFlag('ch4lunaTalk');
  await fadeOut(30); f.nightTint = null; await fadeIn(30);
}
async function cleansingAttack() {
  const f = F();
  await cinema([{ dur: 180, bg: 'dawn', music: 'boss', shake: 6, caption: 'Dawn. Torches on the east road. The Cleansing has found Moonhollow.' }], { skipAll: false });
  healParty();
  await scene(async ({ raine, luna }) => {
    await say('Moonfang Scout', "HUNTERS! Silver and fire! They're at the birch line!");
    if (veraiHere() && !flag('veraiGone4') && num('veraiWill') >= 2) await say(null, "Verai's smoke rolls through the trees, and the smallest moonfangs vanish into it.");
    await raine.lunge();
    await say(R(), "Nobody gets past the spring!");
  });
  let r = await startBattle({ enemies: ['cleanser', 'beasthound', 'cleanser'], bg: 'forest', music: 'boss', noRun: true });
  if (r !== 'win') return;
  await scene(async cast => {
    const { raine, luna } = cast, verai = !flag('veraiGone4') ? vActor(cast) : null;
    await say(null, "More torches. And behind them, a man in white and gold, with a silver net over his shoulder. Something in the net is small, and crying.");
    await say('Hallorn, the Cleanser', "The Luminar was a monster. So now we hunt ALL of them. Starting with the ones hiding behind knights. Hello, Dame Luna.");
    await say(null, "In the net: Pip, the smallest moonfang in Moonhollow.");
    if (luna) { await luna.tremble(60); await say('Luna', "Let him go. He's a CHILD."); }
    await say('Hallorn, the Cleanser', "He's a beast. Beasts grow.");
    if (verai) {
      await say('Hallorn, the Cleanser', "And look: the Unseated One's whelp. Two monsters for the price of one.");
      const c = await ask(R(), "(Hallorn is sneering at Verai.)", ['"She\'s not a monster. She\'s family."', '"Ignore him, Verai."', 'Say nothing.']);
      if (c === 0) { addFlag('veraiWill', 1); await verai.surprise(); await say(VE(), "...Family."); }
      else if (c === 2) { addFlag('veraiWill', -1); await verai.sad(); await say(null, "Verai waits for Raine to say something. Raine doesn't."); }
    }
  });
  if (veraiHere()) await checkVeraiBreak('hallorn');
  healParty();
  r = await startBattle({ enemies: ['cleanser_hallorn'], boss: true, bg: 'forest', music: 'boss', noRun: true });
  if (r !== 'win') return;
  // Luna breaks
  await scene(async ({ raine, luna }) => {
    await say('Hallorn, the Cleanser', "...Fine. FINE. If I can't cleanse this place, I'll burn it clean.");
    await say(null, "Hallorn hurls his torch into the nearest hut. Then he raises a silver knife over the net.");
    if (luna) {
      Game.flash = 20; Game.shake = 30; Audio2.sfx('boom');
      await say('Luna', "NO!");
    }
  });
  if (!member('luna')) { setFlag('ch4purge'); return; }
  await cinema([
    { dur: 170, bg: 'moon', music: 'sonia', flash: 12, caption: 'The moon turns red. Luna\'s armor splits down the back.' },
    { dur: 170, bg: 'moon', shake: 20, sfx: 'boom', caption: 'Silver fur. Gold eyes. Twelve years of holding it in, all at once.', layers: [{ look: 'lunawolf', dir: 'down', x: W / 2, y: 580, s: 7 }] },
    { dur: 170, bg: 'fire', caption: 'She tears the net apart. She throws Hallorn through a wall. And then she turns around, and she doesn\'t know who any of you are.' },
  ], { skipAll: false });
  const st = S(), luna = member('luna'), idx = st.party.indexOf(luna);
  st.party = st.party.filter(m => m !== luna);
  healParty();
  r = await startBattle({ enemies: ['lunaberserk'], boss: true, bg: 'forest', music: 'final', noRun: true });
  st.party.splice(Math.min(idx, st.party.length), 0, luna);
  if (r !== 'win') return;
  luna.hp = Math.max(1, Math.floor(stats(luna).mhp / 2));
  await scene(async ({ raine, luna: lu, odeaon, miasma }) => {
    await say(null, "The red leaves the moon. Luna falls to her knees in the ash, half wolf, half knight, all of her shaking.");
    await lu.kneel();
    await say('Luna', "I... I didn't... Did I hurt anyone? Did I hurt YOU? Please tell me I didn't hurt Pip.");
    const c = await ask(R(), "(Luna is crying.)", ['Hold her.', '"You saved Pip. You did the right thing."', '"...You scared me, Luna."']);
    if (c === 0) { addFlag('lunaTrust'); await raine.walk(raine.x < lu.x ? 'right' : 'left', 12); await say(null, "Raine kneels in the ash and holds her. Luna holds on like she's drowning."); }
    else if (c === 1) { addFlag('lunaTrust'); await say(R(), "You saved him. Pip's fine. Everyone's fine. You did the right thing."); await say('Luna', "The right thing had a lot of teeth."); }
    else { await say(R(), "You scared me. But I'm still here."); await lu.sad(); await say('Luna', "...I scared me too."); }
    if (odeaon) { await say(ODE(), "Twelve years ago you bit me, and I decided you were worth the risk. I have never once been wrong about that."); }
  });
  // Hallorn's fate
  await scene(async ({ raine }) => {
    await say(null, "Hallorn lies in the ash, his arm broken, his torch out. Every moonfang in Moonhollow is watching Raine.");
    const c = await ask(R(), "(What happens to Hallorn?)", ['Let him go, so he can tell the Temple the monsters spared him.', 'Hand him to the moonfangs.']);
    if (c === 0) {
      setFlag('hallornSpared');
      await say(R(), "Go home, Hallorn. Tell them what happened here. Tell them who stopped the fire, and who started it.");
      await say('Hallorn, the Cleanser', "...They won't believe me.");
      await say(R(), "Then you'd better be very convincing.");
    } else {
      setFlag('hallornKept');
      await say(HESK, "We will keep him. He will stay with us until he learns our names. All of them. That may take a while.");
      await say('Hallorn, the Cleanser', "...You're not going to kill me?");
      await say(HESK, "We are not what you say we are. That's rather the point.");
    }
  });
  // Luna stops hiding
  await scene(async ({ raine, luna: lu }) => {
    await say(null, "Luna picks up the pieces of her helmet. She looks at them for a long time.");
    await say('Luna', "I'm done hiding. Whatever the Temple does next, it does it to my face. My ACTUAL face.");
    setFlag('lunaUnmasked');
    lu.face('down');
    lu.look = 'lunawolf';
    const m = member('luna'); m.bonus = [...new Set([...(m.bonus || []), 'silvermane'])];
    await notify('Luna stops hiding. She learns Silvermane!', 'levelup');
    await say(HESK, "Your mother would have howled the roof off. Go on, little Luna. Go and be loud somewhere.");
  });
  setFlag('ch4purge');
  await tip("The ashes of Luna's old den are at the top of Moonhollow. When you're ready, sail south to Elaris's Embrace: the drowned sanctuary is below it.");
}
async function lunaDen() {
  if (!flag('ch4purge')) return say(null, "The ashes of an old den, twelve years cold. Luna won't look at it yet.");
  if (flag('ch4fang')) return say(null, "The old den. Luna has left her broken helmet here, on top of the ashes, like a gravestone.");
  setFlag('ch4fang');
  await scene(async ({ luna }) => {
    await say(null, "In the ashes of the old den, something silver glints: a fang on a cord.");
    if (luna) { await luna.kneel(); await say('Luna', "...Mother's. She wore it every day. For luck."); await say('Luna', "It didn't work. But she was kind anyway. Right to the end."); }
    addItem('mothersfang'); await notify('Received Mother\'s Fang!', 'chest');
  });
}
async function heskTalk() {
  if (flag('ch4purge')) return say(HESK, pick(["Sleep here whenever you like. Wolves are very good at keeping the cold off.", "Luna's mother would have liked you, Captain. She liked anyone who didn't run."]));
  return say(HESK, "Moonhollow has hidden for twelve years. Somebody inside the Temple kept the hunters away. I think I finally know who.");
}

// ------------------------------------------------------------------ Verai's breaking point
async function checkVeraiBreak(where) {
  if (!veraiHere() || flag('veraiGone4')) return false;
  if (num('veraiWill') >= 2) return false;
  await scene(async cast => {
    const { raine } = cast, verai = vActor(cast);
    await say(null, "Verai has stopped moving. The smoke around her hands has gone very still, and very dark.");
    const line = {
      moonhollow: "Even here. Even among MONSTERS, I'm the one they back away from. And you let them.",
      hallorn: "He called me a monster, and you just... stood there. Like he was reading the weather.",
      mirror: "You pulled me away. Like I'm a child. Like I'd break. Like I'm the thing that breaks things.",
    }[where];
    await say(VE(), line);
    await say(VE(), "I'm tired, Raine. I'm tired of being asked to be a weapon and never asked to be a person.");
    raine.face(verai);
    await say(R(), "Verai, wait—");
    await say(VE(), "She never pretended. At least with my mother, I know what I am.");
    Game.flash = 8; Audio2.sfx('dark');
    await verai.fadeOut(50);
    await say(null, "The smoke thins, and there's no one inside it.");
    await raine.kneel();
  });
  veraiLeaves(where);
  return true;
}

// ------------------------------------------------------------------ the drowned sanctuary
async function sanctuaryDive() {
  if (!flag('ch4purge')) {
    if (member('luna')) return say('Luna', "Moonhollow first, Captain. Please. They don't have long.");
    return say(null, "Luna's people are in danger. Moonhollow first.");
  }
  const f = F();
  if (!flag('ch4dive')) {
    setFlag('ch4dive');
    await cinema(allyRoute() ? [
      { dur: 180, bg: 'falls', music: 'drowned', caption: 'At the Twin Falls, the water pours into nothing. Below it, the sea is very deep, and very still.' },
      { dur: 190, bg: 'river', flash: 8, sfx: 'fire', caption: 'Raine holds up the Phoenix Ember. A bubble of warm, golden air swells around all of you, and you walk down into the sea.' },
    ] : [
      { dur: 180, bg: 'falls', music: 'drowned', caption: 'At the Twin Falls, the water pours into nothing. Below it, the sea is very deep, and very still.' },
      { dur: 190, bg: 'forge', sfx: 'boom', caption: 'Brakka\'s Anvil Bell sinks, hissing and glowing, with Grimnar\'s Anvil bolted to its roof like a furnace. Everyone inside is sweating. Nobody complains. Out loud.' },
    ], { skipAll: false });
  }
  f.enterMap('drowned1', 2, 16, 'up');
  Game.fade = 0;
}
async function sanctuaryMoment(n) {
  if (flag('ch4sm' + n)) return;
  setFlag('ch4sm' + n);
  await scene(async cast => {
    const { raine } = cast, verai = flag('veraiGone4') ? null : vActor(cast);
    await say(null, "The sanctuary Raine last saw sliding into the sea. The pillars are furred with coral now, and the currents move like breathing.");
    await say(R(), "Elaris's Embrace. The last time we were here, it was falling.");
    if (allyRoute()) await say(null, "In Raine's hand, the Phoenix Ember keeps a pocket of warm air around you. It pulses, slowly, like a heart that's tired.");
    else await say(null, "In Raine's pack, the Anvil hums. Down here, it sounds almost like it's grieving.");
    if (verai) { await verai.question(); await say(VE(), "Something down here is awake. It's so sad it's hard to breathe."); }
    await tip("Currents push you until you reach still water or hit something. Plan your route.");
  });
}
async function mirrorEvent(which) {
  const key = { left: 'mirrorLeft', middle: 'mirrorMiddle', right: 'mirrorRight' }[which];
  if (flag(key)) return say(null, "The mirror is just a mirror now. Mostly.");
  let ok = true;
  if (which === 'left') {
    await scene(async ({ luna }) => {
      await say(null, "The left mirror shows a silver wolf with blood on its teeth, the way the Temple sees her.");
      if (luna) {
        await luna.walk('up', 14);
        await say('Luna', "That's what they think I am. I used to think so too, some nights.");
        await say('Luna', flag('lunaUnmasked') ? "Not anymore. I know what I am. I'm a knight, and a wolf, and I'm GOOD." : "I don't know yet. But I'm not afraid of you.");
      } else await say(null, "Nobody here recognizes the wolf. The mirror seems disappointed.");
    });
  } else if (which === 'middle') {
    await scene(async ({ raine, miasma }) => {
      await say(null, "The middle mirror shows a red dragon over a burning village, with a woman's body in the ash. The story Raine was told every birthday.");
      await raine.tremble(40);
      await say(R(), "That's not true. It was never true.");
      if (miasma) { await miasma.walk('up', 14); await say(MI(), "It's the lie we told you. It wasn't kind, but it kept you alive."); }
      await say(R(), flag('raineWhy') ? "I know why. It still hurts. Both things are allowed." : "I don't forgive it. But I'm done being afraid of it.");
    });
  } else {
    if (veraiHere() && !flag('veraiGone4')) {
      await scene(async cast => {
        const { raine } = cast, verai = vActor(cast);
        await say(null, "The right mirror shows Sonia, smiling, with her hand held out. The reflection is holding Verai's hand. The real Verai is not.");
        await verai.walk('up', 14);
        await say('Sonia (reflection)', "Come home, little night. This time I'll stay.");
        await verai.tremble(50);
        const c = await ask(R(), "(Verai is staring into the mirror.)", ['Let her face it alone. Trust her.', 'Stand beside her.', 'Pull her away from it.']);
        if (c === 0) { addFlag('veraiWill', 1); await say(null, "Raine stays where she is. Verai notices. Verai notices very much."); await say(VE(), "...You're letting me choose."); }
        else if (c === 1) { addFlag('veraiWill', 1); await raine.walk('up', 12); await say(null, "Raine stands next to Verai and says nothing at all. It's exactly the right amount of nothing."); }
        else { addFlag('veraiWill', -2); await raine.walk('up', 10); await say(null, "Raine grabs Verai's arm and pulls her back from the glass."); await verai.angry(); }
      });
      ok = !(await checkVeraiBreak('mirror'));
      if (ok) await scene(async cast => { vActor(cast); await say(VE(), "No, Mother. Not this time."); Audio2.sfx('dark'); Game.flash = 8; await say(null, "Verai's smoke floods the mirror, and Sonia's reflection goes out like a candle."); setFlag('veraiStood'); });
    } else {
      await scene(async ({ raine }) => {
        await say(null, "The right mirror shows the Wren's deck at night, and Verai on it, laughing at something Raine said. It never happened. It could have.");
        await raine.sad();
        await say(R(), "...We'll get you back. I swear it.");
      });
    }
  }
  setFlag(key);
  if (ok) {
    const r = await startBattle({ enemies: ['mirrorshade', 'mirrorshade'], bg: 'drowned' });
    if (r !== 'win' && r !== 'run') return;
  }
  if (flag('mirrorLeft') && flag('mirrorMiddle') && flag('mirrorRight')) {
    setFlag('ch4mirrors');
    Audio2.sfx('holy');
    await say(null, "The curtain of still water over the far stairs parts. The way down to the heart is open.");
  }
}
async function bloomEvent() {
  if (flag('ch4bloom') || F()._bloomBusy) return;
  const f = F(); f._bloomBusy = true;
  try {
    await scene(async ({ raine }) => {
      await say(null, "At the heart of the drowned sanctuary, a flower the size of a house opens its eyes. Its petals are grey. Its roots are wrapped around something that's barely beating.");
      await card({ img: IMG.b_drownedbloom ? 'b_drownedbloom' : null, caption: 'YSOLDE, THE DROWNED BLOOM: the last guardian of Elaris, who has been watching her goddess die alone.', time: 240 });
      await say('Ysolde', "She is dying. She is DYING. And you came down here to put something heavy in her arms.");
      await raine.lunge();
      await say(R(), "We came because she's the only one who can keep it from Sonia!");
      await say('Ysolde', "EVERYONE wants something from her. Nobody ever came to sit with her.");
    });
    healParty();
    const r = await startBattle({ enemies: ['drownedbloom'], boss: true, bg: 'drowned', music: 'final', noRun: true });
    if (r !== 'win') return;
    setFlag('ch4bloom');
    addItem('bloomheart');
    await elarisHeart();
  } finally { f._bloomBusy = false; }
}
async function elarisHeart() {
  if (!flag('ch4bloom')) return say(null, "Something at the heart of the sanctuary is still, barely, beating.");
  if (flag('ch4done') || flag('ch4elaris')) return say(null, "Elaris's heart is quiet now.");
  setFlag('ch4elaris');
  const f = F();
  await scene(async ({ raine, miasma, luna, verai, odeaon }) => {
    await say(null, "Ysolde folds down into petals. In the roots, a voice like wind in wheat: Elaris, goddess of the Embrace, or what's left of her.");
    await say('Elaris', "Children of the surface. Sonia took my heart. What is left of me is not enough to be a god anymore.");
    await say('Elaris', "But it is enough to be a seed. Take it. Plant it somewhere the faith is honest. Something new might grow.");
    giveKey('elarisseed'); await notify('Received Elaris\'s Last Seed.', 'levelup');
    if (allyRoute()) {
      await say('Elaris', "And the Anvil. Yes. My roots will hold it. Even dying, I can hold one more thing.");
      takeKey('anvilshard'); setFlag('anvilSealed');
      await say(null, "The roots close over Grimnar's Anvil like fingers over a coin.");
    } else {
      await say('Elaris', "That Anvil... it has been stolen twice, and a god is angry at it. My roots will not close over a thing that burns like that. I'm sorry.");
      await say(null, "In Raine's pack, the Anvil throbs, hot enough to hurt.");
    }
    Audio2.music('sonia'); Game.flash = 12; Game.shake = 20; Audio2.sfx('dark');
    await say(null, "Every lamp in the sanctuary goes out at once. Something is coming down through the water, dark as ink, and it isn't swimming. It's being carried by the night itself.");
  });
  // Sonia arrives
  const so = f.spawn({ id: 'sonia', look: 'vesper', name: 'Sonia', x: 9, y: 4, dir: 'down', alpha: 0 });
  let vv = null;
  await scene(async cast => {
    const { raine } = cast, verai = flag('veraiGone4') ? null : vActor(cast);
    await so.fadeIn(40);
    if (flag('veraiGone4')) { vv = f.spawn({ id: 'vv', look: 'verai', name: 'Verai', x: 11, y: 4, dir: 'down', alpha: 0 }); await vv.fadeIn(30); }
    await say('Sonia', allyRoute() ? "Clever. I can't swim. My daughter can, it turns out. Hello again, Captain." : "The Tenth Flame's Anvil, carried right to me in a stolen diving bell. You are VERY thoughtful, Captain.");
    if (vv) {
      await raine.surprise();
      await say(R(), "Verai...");
      await say(VE(), "Hello, Raine.");
    } else if (verai) {
      so.face(verai);
      await say('Sonia', "Still here, little night?");
      await verai.angry();
      await say(VE(), "Still here. Still mine.");
      setFlag('veraiStood');
    }
  });
  if (allyRoute()) {
    // Ashkar fights beside you
    Game.flash = 20; Audio2.sfx('fire');
    await say(null, "The sea above you BOILS. A pillar of fire drives straight down through the water, and inside it, laughing like an idiot, is a god.");
    await say(ASH, "Nobody touches my little crescent's friends in a dead goddess's house. It's RUDE.");
    const st = S(), out = st.party.length >= 4 ? st.party[st.party.length - 1] : null;
    if (out) st.party = st.party.filter(m => m !== out);
    const g = makeMember('ashkar', Math.max(...st.party.map(m => m.lvl)) + 2); st.party.push(g);
    healParty();
    await startBattle({ enemies: ['sonia'], boss: true, bg: 'drowned', music: 'final', noRun: true, cantLose: true, turnLimit: 6 });
    st.party = st.party.filter(m => m !== g); if (out) st.party.push(out);
    await scene(async ({ raine }) => {
      await say('Sonia', "You're guttering, phoenix. I can see it from here. Every flame burns out.");
      await say(ASH, "Then I'll burn out HERE. Go, little crescent. GO!");
      Game.flash = 30; Game.shake = 40; Audio2.sfx('boom');
      await say(null, "Ashkar throws every flame he has left at Sonia at once. The water turns white. When it clears, Sonia is gone, and Ashkar is on his knees, smoking, grey at the edges.");
      await say(ASH, "...Well. That was expensive.");
      setFlag('ashkarGuttered');
    });
  } else {
    healParty();
    await startBattle({ enemies: ['sonia'], boss: true, bg: 'drowned', music: 'final', noRun: true, cantLose: true, turnLimit: 5 });
    await scene(async ({ raine }) => {
      await say(null, "Sonia's shadows pin every one of you to the sanctuary floor. She kneels, unbuckles Raine's pack, and lifts out Grimnar's Anvil like a jewel.");
      takeKey('anvilshard'); setFlag('anvilLost');
      await say('Sonia', "Grimnar's Anvil. Freely stolen, freely given. Three reliquaries, Captain. The Ten are getting very quiet.");
      await say('Sonia', "Give the phoenix my regards. He'll be so upset.");
    });
  }
  if (vv) {
    await scene(async ({ raine }) => {
      const c = await ask(R(), "(Verai is standing beside her mother.)", ['"Verai. Come home."', '"I\'m sorry. We should have asked what you wanted."']);
      setFlag('veraiReach'); S().flags.veraiReachChoice = c;
      if (c === 0) await say(VE(), "Home? I don't know where that is anymore, Raine. Maybe that's what I need to find out.");
      else { await say(VE(), "...Yes. You should have."); await say(null, "For a moment, Verai looks like she might cry. Then she doesn't."); }
      await say(null, "Verai takes her mother's hand. They step back into the dark, and it closes behind them like water.");
    });
    f.despawn(vv);
  }
  so.alpha = 0; f.despawn(so);
  await cinema([
    { dur: 180, bg: 'falls', music: 'sorrow', shake: 12, caption: 'Elaris breathes out one last time. The drowned sanctuary begins to fold in on itself like a closing flower.' },
    { dur: 180, bg: 'river', caption: allyRoute() ? 'Ashkar carries all of you up through the sea in a column of steam, and drops you, gasping, onto the Wren\'s deck.' : 'The Anvil Bell drags all of you back up through the dark. It is cold, now. Nobody says anything.' },
  ], { skipAll: false });
  await chapter4End();
}

// ------------------------------------------------------------------ the end of Chapter Four
async function chapter4End() {
  const f = F();
  f.enterMap('wrendeck', 8, 5, 'up'); f.nightTint = null; Game.fade = 0;
  await scene(async ({ raine, luna, miasma, odeaon }) => {
    if (luna) {
      await say(null, "On the Wren, in the sun, Luna stands at the rail without a helmet. The crew stares for exactly one minute, and then goes back to work.");
      await say('Luna', "It's warm. I forgot sun was warm on your ears.");
    }
    if (flag('veraiGone4')) {
      await say(null, "Raine sits at the stern with a strip of grey scarf, knotted twice. She doesn't untie it.");
      if (miasma) await say(MI(), "We'll get her back, kid. Mothers can be beaten. I'd know.");
    }
    if (allyRoute()) await say(null, "Ashkar leaves at dusk, flying low and slow, like a candle carried through a draft. The Tenth Flame is a little less flame tonight.");
    else await say(null, "At dusk, a burning raven lands on the rail with a message in cinders: 'You told me no, and now SHE has it. I hope it was worth it, little crescent.'");
  });
  Audio2.music(null);
  await fadeOut(60);
  await cinema([
    { dur: 230, bg: 'void', music: 'sonia', caption: allyRoute() ? 'Somewhere between the seats, Sonia counts two reliquaries, and a phoenix that is burning low.' : 'Somewhere between the seats, Sonia sets Grimnar\'s Anvil beside the Heartseed and the Dawnheart. In Draumond, the Book of the Dead stops turning its own pages.', layers: [{ img: 'b_sonia', x: W / 2, y: 610, s: 1.3 }] },
    flag('veraiGone4')
      ? { dur: 220, bg: 'void', caption: 'Beside her, Verai sits on the steps of an empty throne, and does not look at it.', layers: [{ look: 'verai', dir: 'down', x: W / 2, y: 540, s: 5 }] }
      : { dur: 220, bg: 'stars', caption: 'On the Wren, Verai sleeps with her head on her pack, her smoke curled around her like a cat.', layers: [{ look: 'verai', dir: 'down', x: W / 2, y: 540, s: 5 }] },
  ], { skipAll: false });
  await crawl([
    'Elaris of the Embrace is gone. One seed of her remains.',
    flag('anvilSealed') ? 'Grimnar\'s Anvil sleeps in her roots, under the sea.' : 'Grimnar\'s Anvil is in Sonia\'s hands.',
    flag('ashkarGuttered') ? 'The Tenth Flame is burning low.' : 'The Tenth Flame is furious.',
    flag('hallornSpared') ? 'Hallorn has gone home to tell Solanthia who spared him.' : 'Hallorn is learning the names of every wolf in Moonhollow.',
    'Luna walks bareheaded, and the Two Moons Accord is in Raine\'s pack.',
    flag('veraiGone4') ? 'Verai is with her mother. For now.' : 'Verai chose her own name. It is still Verai.',
  ], { speed: 0.7 });
  await cinema([
    { dur: 330, bg: 'seats', sfx: 'holy', flash: 14, layers: [
      { text: 'END OF CHAPTER FOUR', x: W / 2, y: 210, size: 36, color: '#ffe070', glow: 'rgba(255,200,80,0.8)', fadeIn: 40 },
      { text: 'THE DROWNED SANCTUARY', x: W / 2, y: 270, size: 18, color: '#9ad8e8', fadeIn: 80 },
      { text: 'Next: Chapter Five - The Open Sky', x: W / 2, y: 360, size: 12, color: '#a8a8d0', fadeIn: 140 },
    ] },
  ], { skipAll: false });
  setFlag('ch4done');
  await saveScreen(null, Math.floor(S().playTime / 60), 'CHAPTER FOUR COMPLETE', [
    'Luna stopped hiding.',
    flag('anvilSealed') ? 'The Anvil is sealed under the sea.' : 'Sonia took the Anvil.',
    flag('veraiGone4') ? 'Verai left with her mother.' : 'Verai stayed. Her choice.',
    flag('hallornSpared') ? 'You let Hallorn go.' : 'Moonhollow kept Hallorn.',
  ], 'Chapter Five will continue from this file.');
  if (typeof chapter5Opening === 'function') { await chapter5Opening(); return; }
  const st = S(); st.ship = { x: 55, y: 19 }; st.onShip = true;
  f.enterMap('world', 55, 19, 'left');
  await fadeIn(40);
  Audio2.music('sea');
}
