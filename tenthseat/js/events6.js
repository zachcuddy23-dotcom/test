'use strict';
// ---------------------------------------------------------------------------
// The Final Chapter: "The Tenth Seat".
//
// Act One, the Rally. When Sonia sits on her throne, the Veilstorm opens for one hour and every
// prayer in the world is pulled through. If enough people are praying for something else, the door
// holds open. Fly to the peoples of Cael'Brithar and raise their banners. Every banner is shaped by
// something you did, sometimes chapters ago; some can be lost.
// Act Two, Godsfall. The siege of the Rim (fewer waves the more banners fly), then eight floors down:
// the Hall of Unanswered Prayers, the Heartseed Garden, the Drowned Sun, Nyxia's Night (Verai),
// Where the Gods Fell (Odeaon or Ashkar), the Stair of Every Prayer, and the Unseated Throne.
// Act Three. Sonia, twice. Who sits in the Tenth Seat (up to six choices, each needing its own history),
// the ending, and an epilogue that remembers every chapter.
// Optional: the Ring of the Ten, a sky islet east of Zalakir where each god tests you once.
//
// Flags: ch6start, bn_<id> for each banner (see BANNERS), ch6hallornFree, ch6siege, prayer0-5 + prayersAnswered,
//   ch6heartseed, ch6dawnheart, ch6night (+ veraiHome / veraiTaken / veraiAtThrone), ch6warden, ch6rescue,
//   ch6ashkarFree (+ ashkarRevived), ch6camp, ch6sonia, seat (who sits), ch6done; ring_<god>, ringComplete.
// ---------------------------------------------------------------------------
Object.assign(NPC_FACES, { 'Hallorn': 'face_hallorn', 'Keeper Ossa': 'face_ossa', 'Pyrewarden Sael': 'face_sael', 'Gate Champion Vorsk': 'face_vorsk', 'Dr. Thistlewood': 'face_thistlewood' });

// ------------------------------------------------------------------ the banners
const BANNERS = [
  { id: 'dawn', name: 'The Dawnguard', gods: 'Sylara and Valerion', where: 'Solanthia, Aurelion', world: 'world', key: '27,11', map: 'solanthia' },
  { id: 'tide', name: 'The Harmony Fleet', gods: 'Thalara', where: 'Brightwater, Aurelion', world: 'world', key: '46,24', map: 'brightwater' },
  { id: 'moon', name: 'The Moonfangs', gods: 'the Two Moons', where: 'Moonhollow, Aurelion', world: 'world', key: '17,16', map: 'moonhollow' },
  { id: 'hollow', name: 'Hollowmere', gods: 'home', where: 'Hollowmere, Aurelion', world: 'world', key: '8,10', map: 'hollowash' },
  { id: 'bloom', name: 'The Heartbloom Sapling', gods: 'Elaris', where: 'Heartbloom Hollow, Aurelion', world: 'world', key: '27,28', map: 'bloom2' },
  { id: 'star', name: 'The Scholars of Astrilion', gods: 'Myndra', where: 'Astrilion, Thalemyr', world: 'thalemyr', key: '16,4', map: 'astrilion1' },
  { id: 'mask', name: 'Ebonport and the Unlit', gods: 'Malakar and Nyxia', where: 'Ebonport, Thalemyr', world: 'thalemyr', key: '36,21', map: 'ebonport' },
  { id: 'hour', name: 'The Pale Watcher', gods: 'Kryos', where: 'The Stilled Hourglass, the Frostreach', world: 'frostreach', key: '24,13', map: 'hourglass3' },
  { id: 'hearth', name: 'Hearthmoor', gods: 'the red dragon\'s old neighbors', where: 'Hearthmoor, the Frostreach', world: 'frostreach', key: '13,20', map: 'hearthmoor' },
  { id: 'chain', name: 'Zariel\'s Chainbearers', gods: 'Zariel', where: 'Emberport, Ashkar', world: 'ashkar', key: '24,31', map: 'emberport' },
  { id: 'powder', name: 'The Gunsmiths of Kharak Yr', gods: 'blackpowder', where: 'Kharak Yr, Ashkar', world: 'ashkar', key: '36,21', map: 'kharakyr' },
  { id: 'grave', name: 'The Grimnarites', gods: 'Grimnar', where: 'Draumond, Ashkar', world: 'ashkar', key: '20,13', map: 'draumond' },
  { id: 'flame', name: 'The Tenth Flame\'s Faithful', gods: 'Ashkar', where: 'The Throne of Cinders, Ashkar', world: 'ashkar', key: '38,8', map: 'cinders' },
];
function bannerCount() { return BANNERS.filter(b => flag('bn_' + b.id)).length; }
async function raiseBanner(id) {
  if (flag('bn_' + id)) return;
  const b = BANNERS.find(x => x.id === id);
  setFlag('bn_' + id); Audio2.sfx('levelup'); Game.flash = 8;
  await notify(`Banner raised: ${b.name}! (${bannerCount()} of ${BANNERS.length})`, null);
}
async function rallyList() {
  const have = BANNERS.filter(b => flag('bn_' + b.id)), want = BANNERS.filter(b => !flag('bn_' + b.id));
  await say('Cartographer', `${have.length} of ${BANNERS.length} banners promised.` + (have.length ? ' Flying: ' + have.map(b => b.name).join(', ') + '.' : ''));
  if (want.length) await say('Cartographer', 'Still waiting on: ' + want.map(b => `${b.name} (${b.where})`).join('; ') + '.');
  await say('Cartographer', bannerCount() >= 10 ? "That's nearly the whole world. She can't hold the door shut against that." : bannerCount() >= 6 ? "It's a crowd. It's not the whole world yet." : "It's a start. A small one. She's got every prayer that ISN'T yours.");
}
// the Sky Chart marks every place a banner is still waiting
function skyChartExtra(L, t) {
  if (!flag('ch6start') || flag('ch6siege')) return;
  for (const b of BANNERS) {
    if (b.world !== L.id || flag('bn_' + b.id)) continue;
    const [px, py] = b.key.split(',').map(Number), sx = L.x + px * SKY_SCALE + 2, sy = L.y + py * SKY_SCALE + 2;
    ctx.fillStyle = '#ff5a40'; ctx.fillRect(sx, sy - 14, 2, 14); ctx.fillRect(sx + 2, sy - 14 + (Math.floor(t / 10) % 2), 8, 5);
  }
}
const bannerOn = id => flag('bn_' + id);
// "a hero who travels with us" for banner scenes, from events5.js
const withHero = (cast, id) => castHero(cast, id);
function veraiWithUs() { return heroHere('verai'); }

// ------------------------------------------------------------------ opening
async function chapter6Opening() {
  if (flag('ch6start')) return;
  setFlag('ch6start');
  catchUpLevels();
  const f = F(), st = S(); st.flying = false;
  f.enterMap('rimward', 12, 9, 'up'); Game.fade = 1;
  await cinema([
    { dur: 280, bg: 'seats', music: 'title', layers: [
      { text: 'THE FINAL CHAPTER', x: W / 2, y: 220, size: 30, color: '#ffe070', glow: 'rgba(255,200,80,0.8)', fadeIn: 30 },
      { text: 'THE TENTH SEAT', x: W / 2, y: 280, size: 22, color: '#c8a0ff', fadeIn: 70 },
    ] },
    { dur: 200, bg: 'dawn', music: 'sorrow', sub: 'Solanthia', caption: 'At Dawn Prayer, a priest opens her mouth to pray, and the words fly out of her, south, like birds.' },
    { dur: 200, bg: 'fire', sub: 'Kharak Yr', caption: 'A goblin swears by Grimnar\'s beard. The oath leaves him. He feels it go.' },
    { dur: 200, bg: 'moon', sub: 'Moonhollow', caption: 'Pip says goodnight to the moon. The moon does not hear it.' },
    { dur: 240, bg: 'storm', music: 'sonia', caption: 'Every prayer in the world is falling into Godsfall. At the bottom, on a throne made of them, Sonia is getting ready to sit.' },
  ], { skipAll: false });
  Game.fade = 0;
  await scene(async cast => {
    const { raine, miasma } = cast, odeaon = withHero(cast, 'odeaon'), luna = withHero(cast, 'luna'), brakka = withHero(cast, 'brakka');
    const verai = flag('veraiLost5') ? null : withHero(cast, 'verai');
    await say(null, "Rimward, the morning after. The storm over Godsfall is quiet now. Too quiet. It looks like a held breath.");
    if (flag('odeaonFell')) { await say(null, "Raine hasn't put her father's shield down since the Rim. She slept holding it."); if (miasma) await say(MI(), "He's alive. I'd know. I'd KNOW, kid. Twenty years apart and I always knew."); giveKey('shieldofodeaon'); }
    if (flag('ashkarFell')) { await say(null, "The phoenix feather in the fire is still glowing. Not burning. Glowing, the way coals do when someone is breathing on them."); await say(R(), "He isn't dead. He's being USED."); }
    await say(MYN, "(Myndra's voice, from the Star Chart in Raine's pack.) Listen. When she sits, the storm will open for one hour. Every prayer in the world will be pulled through that door.");
    await say(MYN, "If enough people are praying for something ELSE, the door will hold open for you. And everything they pray for, she will have to fight.");
    await say(R(), "So we need the whole world.");
    if (miasma) await say(MI(), "Good thing we've got a dragon.");
    if (luna) await say('Luna', "Moonhollow will come. They'd follow me into a fire now. They might literally have to.");
    if (brakka) await say(BR(), "Kharak Yr owes me. Everyone in Kharak Yr owes me. Mostly money.");
    if (odeaon) await say(ODE(), "The Dawnguard will march if I ask. I think. I've never asked them for anything except to be on time.");
    if (verai) await say(VE(), flag('veraiNyxia') === 'vessel' ? "...I can hear her down there. My mother. She's calling me. I'm not going. I'm NOT." : "Nyxia's faithful in Ebonport. And... Hollowmere. If anyone's left there. Even them.");
    else await say(null, "Raine looks south, toward the crater, for a long time.");
  });
  giveKey('rallyroll');
  await notify('The Final Chapter: raise banners across Cael\'Brithar!', 'levelup');
  await tip("Fly to the peoples of the world and raise their banners. The Sky Chart marks where a banner is still waiting with a red flag. The Rimward cartographer keeps the list. When you are ready, fly to the storm landing east of Rimward. The more banners fly at the Rim, the shorter the siege and the weaker Sonia will be. You can go with none at all, if you are very brave.");
  st.flying = true;
  f.enterMap('zalakir', 7, 12, 'down');
  Audio2.music('sky');
}

// ------------------------------------------------------------------ the banners, one by one
async function bannerScene(id) {
  const f = F();
  if (f._bannerBusy) return; f._bannerBusy = true;
  try { await BANNER_SCENES[id](); } finally { f._bannerBusy = false; }
}
const BANNER_SCENES = {
  // Solanthia: Sylara's Dawnguard and Valerion's knights. Needs Hallorn's word if the wolves kept him.
  async dawn() {
    await scene(async cast => {
      const { raine, miasma } = cast, odeaon = withHero(cast, 'odeaon'), luna = withHero(cast, 'luna');
      const hal = flag('hallornSpared') || flag('ch6hallornFree') ? F().spawn({ id: 'hal', look: 'dawnguard', name: 'Hallorn', x: S().x, y: S().y - 2, dir: 'down' }) : null;
      await say(null, "Solanthia's great square is full. Priests, knights, bakers. Nobody can pray. Everybody keeps trying.");
      if (flag('hallornSpared')) {
        await say('Hallorn', "Captain. The wolf-knight's friends. Before you say anything: yes, I told them everything. The council signed the Accord. And they're ready to sign something else.");
      } else if (flag('ch6hallornFree')) {
        await say('Hallorn', "I rode here on the back of a moonfang named Bram. Do you know how humbling that is? I told the council what I saw in Moonhollow. All of it.");
      } else {
        await say('Dawnguard Captain', "The council is... divided, Captain. Half of them still think the Cleansing was right. They want to hear from Hallorn, who led it. And Hallorn is, ah. With the wolves.");
        if (luna) await say('Luna', "Grandmother Hesk would let him go. If I asked. If he asked.");
        await say(null, "(Hallorn is in Moonhollow. Perhaps he would come, if someone asked him.)");
        setFlag('dawnWaiting');
        return;
      }
      await say('Hallorn', "Sylara teaches that every day is a second chance. I used mine. The Light marches with monsters today, and it's proud to.");
      if (odeaon) {
        odeaon.face(raine);
        await say(ODE(), "Knights of Valerion. I have asked you for nothing in twenty years except to be on time. I'm asking for one more oath.");
        await say(null, "Every knight in the square drops to one knee at once. The sound is like a thunderclap.");
      } else if (flag('odeaonFell')) {
        await say(null, "Raine lifts her father's dented shield above her head. The knights in the square go very still. Then, one by one, they kneel.");
        await say('Dawnguard Captain', "For the High Knight. Wherever he is.");
        await say(R(), "He's in that crater. We're going to get him.");
      }
      if (flag('raineWhy')) await say(R(), "Thank you. I used to just follow orders. Now I'm asking you to follow me, and you can say no.");
      if (hal) await hal.nod();
      if (miasma) await say(MI(), "A whole city of Dawn-folk, marching with a dragon. Somebody pinch me. Not you, Hallorn.");
    });
    if (flag('dawnWaiting') && !flag('hallornSpared') && !flag('ch6hallornFree')) return;
    await raiseBanner('dawn');
  },
  // Brightwater: Thalara's sailors, the Wren and the Tower of Dawn
  async tide() {
    await scene(async cast => {
      const { raine, miasma } = cast, brakka = withHero(cast, 'brakka');
      await say('Harbormaster Grell', "Captain Cudlar. Every ship in the Harmony Sea is tied up in my harbor, because none of them can sail into that storm.");
      await say('Harbormaster Grell', "So here's what sailors do when they can't sail. We'll anchor at the storm's edge, every ship we've got, and SING. Thalara likes a shanty. She'll hear us over anything.");
      if (brakka) await say(BR(), "I could put cannons on the fishing boats. Small cannons. Medium cannons.");
      await say('Harbormaster Grell', "No cannons on the fishing boats.");
      if (miasma) await say(MI(), "Lights on the tower, too. Make it look like the whole sea is on fire. She HATES that.");
    });
    addItem('heartdew', 4); await notify('The fleet sends Heartdew x4.', 'chest');
    await raiseBanner('tide');
  },
  // Moonhollow: the moonfangs. If they kept Hallorn, this is where he can be asked to go.
  async moon() {
    await scene(async cast => {
      const { raine } = cast, luna = withHero(cast, 'luna');
      await say(HESK, "The knight's friends, back again. And I can guess why. Every moonfang in the Silverleaf heard the prayers fall out of the sky last night.");
      if (luna) {
        if (num('lunaTrust') >= 2) await say(HESK, "Luna. You came home with your face showing and your friends behind you. Ask, child. Ask us to march.");
        else await say(HESK, "Luna. You came home a monster and a knight both. Some here still don't know what to make of that. Ask anyway.");
        await say('Luna', "Moonhollow. I hid you for eight years. I'm done hiding you. Will you come and be SEEN?");
        await say(null, "Every moonfang in the village howls at once. Pip howls loudest, and slightly off-key.");
        if (flag('ch5barrows')) await say(HESK, "And the First Moonfang's mantle on your shoulders. Ha! Every wolf who ever lived is marching, then.");
      } else await say(HESK, "Our knight isn't with you. We'll come anyway. She'd want us to.");
      if (flag('hallornKept')) {
        await say(null, "At the edge of the circle stands Hallorn, chopping wood. There is a terrible carved wooden wolf on the chopping block. Pip's, presumably.");
        await say('Hallorn', "...Solanthia's council won't march without my word. I know. I'd tell them, if I were let go. I'd tell them what I saw here.");
        const c = await ask(R(), "(Hesk is watching you. So is Hallorn.)", ['"Hesk... will you let him go speak for you?"', '"Stay here. They don\'t deserve to hear it from you."']);
        if (c === 0) {
          await say(HESK, "He's learned all our names. Even the cubs'. Go on, then, Cleanser. Go and tell them.");
          await say('Hallorn', "I'll ride. Bram, would you... would you mind?");
          setFlag('ch6hallornFree');
          await say(null, "(Hallorn is riding to Solanthia. The Dawnguard will listen to him now.)");
        } else await say('Hallorn', "...Perhaps you're right. I'll keep chopping.");
      }
    });
    await raiseBanner('moon');
  },
  // Hollowmere: Raine and Verai's burned home
  async hollow() {
    await scene(async cast => {
      const { raine } = cast, verai = flag('veraiLost5') ? null : withHero(cast, 'verai');
      await say(null, "Hollowmere is still ash. But there are tents now, and a new mill wheel, half-built. People came back.");
      await say('Elder Moth', "Raine Cudlar. The girl who climbed the mill fence. And the dragon lady who watched her do it.");
      if (verai) {
        await say('Elder Moth', "...And Verai.");
        await say(null, "The whole camp goes quiet. These are the people who were afraid of her shadows. Who called her a curse.");
        await say('Elder Moth', "We were wrong about you, child. We were afraid, and we made you carry it. I'm sorry. We're all sorry.");
        if (num('bond') >= 3) { await say(VE(), "...You fed me sometimes. When nobody was looking. I remember."); await verai.heart(); }
        else { await say(VE(), "...I don't know what to say to you."); await say('Elder Moth', "You don't have to say anything. Just let us stand at the Rim with you."); }
      } else {
        await say('Elder Moth', "Verai isn't with you. ...When you find her, tell her we're sorry. Tell her Hollowmere was wrong about her. Tell her we want her home.");
        setFlag('hollowSorry');
      }
      await say('Elder Moth', "We don't have swords. We have prayers. Hollowmere's prayers are yours.");
    });
    await raiseBanner('hollow');
  },
  // Heartbloom Hollow: Elaris's sapling (only if the seed was planted)
  async bloom() {
    if (!flag('ch5seed')) return;
    await scene(async cast => {
      const { raine } = cast, luna = withHero(cast, 'luna');
      const vow = S().flags.seedVow;
      await say(null, "The sapling is waist-high now. It has three pink flowers, and when the wind blows they all turn toward Godsfall, like a dog hearing its name.");
      if (vow === 'refuge') { await say('Elaris', "You asked me to be a home for the hidden. The hidden are coming. Wolves. Lantern-keepers. People nobody prayed for. I will be their door."); if (luna) await luna.heart(); }
      else if (vow === 'garden') await say('Elaris', "You asked me to be a garden for everyone. Everyone is frightened today. A garden can't fight. But it can be somewhere to come back to.");
      else await say('Elaris', "You asked me to come back. I can't, not yet. But my heart is at the bottom of that crater, beating in a thief's hand. Bring it to me, and we will see.");
      await say('Elaris', "Take a blossom. Where you carry it, the thorns will remember who they used to love.");
    });
    giveKey('elarisblossom'); await notify("Received Elaris's Blossom!", 'levelup');
    await raiseBanner('bloom');
  },
  // Astrilion: Myndra and her scholars
  async star() {
    await scene(async cast => {
      const { raine } = cast, verai = flag('veraiLost5') ? null : withHero(cast, 'verai');
      await say(null, "Every scholar in Astrilion is reading aloud at once. Prayers, histories, recipes, love letters. Anything with words in it. The books are fighting back.");
      await say(MYN, "Every word written about a god is a small prayer. We have a great many words. Let her try to steal ALL of them.");
      if (verai) await say(MYN, verai && flag('veraiNyxia') === 'vessel' ? "Child. You are full of night all the way through. Remember your own name when you get down there. Write it on your hand if you must." : "Child. You carry the night kindly. I have read a great many stories. That is rarer than you know.");
      await say(MYN, "And this. My eye, for one fight. You will see exactly where she is weak.");
    });
    giveKey('starsight'); await notify('Received Starsight!', 'levelup');
    await raiseBanner('star');
  },
  // Ebonport: Malakar's masked city and the Unlit
  async mask() {
    await scene(async cast => {
      const { raine } = cast, verai = flag('veraiLost5') ? null : withHero(cast, 'verai');
      await say('Mask-Seller Quill', "Darlings! Malakar is the Betrayer Flame. He betrays EVERYONE, sooner or later. Today, all of Ebonport has decided to betray HER.");
      await say('Unlit Lantern-Keeper', "The Unlit will come. Our lanterns shed darkness. In the storm, our darkness will look like home to Nyxia's night.");
      if (verai && flag('veraiNyxia') === 'carry') await say('Unlit Lantern-Keeper', "And we'll sing for the one who carries her. So she can hear us down there.");
      else if (verai) await say('Unlit Lantern-Keeper', "The one who is full of her night... we're afraid for you, child. We'll sing loud. Follow the singing back.");
      else await say('Unlit Lantern-Keeper', "She left us one lantern on purpose. We'll keep it lit for her, all the way down.");
    });
    await raiseBanner('mask');
  },
  // The Stilled Hourglass: Kryos (only if you met him in Chapter Five)
  async hour() {
    if (!flag('ch5hour')) return;
    await scene(async cast => {
      const { raine } = cast;
      await say(KRY, "Little crescent. You came back. They always come back, near the end.");
      if (flag('kryosGlimpse')) await say(KRY, "You asked how it ends. I told you I did not see who stands up. That was true. It depends on you. It always did. I hate that about mortals. I also like it.");
      await say(KRY, "I cannot march. I am an hour. But I can give you one minute, stopped. When she raises her hand for the last time, it will come down slower.");
    });
    giveKey('stoppedminute'); await notify('Received One Stopped Minute!', 'levelup');
    await raiseBanner('hour');
  },
  // Hearthmoor: the red dragon's old neighbors
  async hearth() {
    await scene(async cast => {
      const { raine, miasma } = cast;
      await say('Dr. Thistlewood', "Captain! You're on your feet and not on fire. Professionally, I'm thrilled.");
      if (S().flags.watcher) await say('Dr. Thistlewood', `Your ${HEROES[S().flags.watcher] ? HEROES[S().flags.watcher].name : 'friend'} sat by that bed for three days. I've never seen anyone hold a hand that hard.`);
      await say(null, "Half of Hearthmoor is behind her, in their thickest coats, carrying honey cakes.");
      await say('Hearthmoor Elder', "Twenty years we left the red one honey cakes on the solstice. Twenty years she left us firewood. Neighbors look after neighbors.");
      if (miasma) { await say(MI(), "...You kept leaving them? After I left?"); await say('Hearthmoor Elder', "Every year. Just in case."); await miasma.sad(); }
      if (flag('ch3toyGiven')) await say(R(), "(Raine's hand goes to the little toy dragon in her pocket.)");
    });
    await raiseBanner('hearth');
  },
  // Emberport: Zariel's chainbearers. Paid your way in back in Chapter Two? Zariel doesn't take coin.
  async chain() {
    if (flag('trialWon')) {
      await scene(async () => {
        await say('Gate Champion Vorsk', "The foreigners who beat me fair! Strength is truth, and Zariel remembers who paid in blood.");
        await say('Gate Champion Vorsk', "The chainbearers march. Every one. We've been waiting for a war worth losing a hand in.");
      });
      await raiseBanner('chain');
      return;
    }
    await scene(async () => {
      await say('Gate Champion Vorsk', "The foreigners who PAID to get into my city. Three thousand gold. I remember.");
      await say('Gate Champion Vorsk', "Zariel doesn't take coin. Zariel takes suffering, honestly given. You want the chainbearers? Pay what you owe.");
    });
    if (!(await bossFight('zarielchosen', 'port2'))) return;
    await scene(async () => {
      await say('Gate Champion Vorsk', "HAH! THAT is payment! Debt settled! The chainbearers march!");
    });
    await raiseBanner('chain');
  },
  // Kharak Yr: the gunsmiths. Did you take their blackpowder, or blow it up?
  async powder() {
    await scene(async cast => {
      const { raine } = cast, brakka = withHero(cast, 'brakka');
      if (flag('tookPowder')) await say('Gunsmith Foreman', "Every barrel you DIDN'T blow up is on a cart right now. Aimed south.");
      else await say('Gunsmith Foreman', "You blew up our powder, back then. We made more. Out of spite. It's aimed south now. Still spiteful.");
      if (brakka) {
        await say(BR(), "Kharak Yr! You lot owe me for the Gunworks, the cannon golem, AND that time with the goat.");
        if (flag('ch5vault')) { await say('Gunsmith Foreman', "...Is that Gruntle's Thunderwife? On your back?"); await say(BR(), "She's mine now. He left her to me."); await say(null, "Every goblin in the yard takes off their goggles at once."); }
      }
      await say('Gunsmith Foreman', "Here. Prayer jars. Fill one with something you'd scream at a god, seal it, throw it. Don't ask how they work. We don't know either.");
    });
    addItem('prayerjar', flag('tookPowder') ? 6 : 4); await notify(`Received Prayer Jar x${flag('tookPowder') ? 6 : 4}!`, 'chest');
    await raiseBanner('powder');
  },
  // Draumond: Grimnar's faithful only march if Grimnar's Anvil is safe from her
  async grave() {
    let join = true;
    await scene(async cast => {
      const { raine } = cast, brakka = withHero(cast, 'brakka');
      await say('Keeper Ossa', "The Book of the Dead has stopped turning its pages. The Ash-Father is quiet. He wants to know one thing before his faithful march.");
      await say('Keeper Ossa', "Where is his Anvil?");
      if (flag('anvilSealed')) { await say(R(), "Under the sea. In a dead goddess's roots. Sonia couldn't touch it."); await say('Keeper Ossa', "Elaris kept it for him. Then the dead march for Elaris too."); }
      else if (hasKey('anvilshard2')) {
        const c = await ask(R(), "(The Anvil is in your pack. It is very warm.)", ['Give the Anvil back to Grimnar\'s faithful.', 'Keep it. You still need it.']);
        if (c === 0) { takeKey('anvilshard2'); setFlag('anvilHome'); await say(null, "Keeper Ossa takes the Anvil in both hands, and the Book of the Dead turns one page, all by itself."); await say('Keeper Ossa', "Home. Thank you. The dead march at dawn."); if (brakka) await say(BR(), "...Fine. I still have the axe I made out of the bit that fell off."); }
        else { await say('Keeper Ossa', "Then the dead will pray alone. Go, Captain. Use it well, since you will not give it back."); join = false; }
      } else if (flag('ashkarFell')) { await say(R(), "I gave it back to Ashkar. And he fell into Godsfall holding it."); await say('Keeper Ossa', "Then it is down there in the dark. We will march, and bring it home."); }
      else { await say(R(), "...I gave it to the phoenix."); await say('Keeper Ossa', "To the THIEF? The thief who stole our faith's seat? ...Then we pray alone."); join = false; }
    });
    if (join) await raiseBanner('grave');
    else setFlag('graveRefused');
  },
  // The Throne of Cinders: Ashkar's faithful (if he fell), or Ashkar himself (if he didn't)
  async flame() {
    if (flag('ashkarFell')) {
      await scene(async cast => {
        const { raine } = cast;
        await say('Pyrewarden Sael', allyRoute() ? "Little crescent. He told us about you. He told us EVERYTHING about you, for hours." : "You. You told our god no, and then he fell for you anyway. I have questions. They can wait.");
        await say('Pyrewarden Sael', "He threw himself into the seat so it would be empty when she got there. The Tenth Flame's faithful will fly to the crater and burn a road to him.");
        if (flag('pendantGiven')) await say('Pyrewarden Sael', "He carried your pendant with him. His heart. He wouldn't take it off.");
      });
      await raiseBanner('flame');
      return;
    }
    let join = false;
    await scene(async cast => {
      const { raine, miasma } = cast;
      await say(null, "The Throne of Cinders. Ashkar is slumped on it with his chin on his fist, sulking at a volume you can hear.");
      await say(ASH, "Oh. The little crescent who kept my Anvil. Back to say 'the sky fell on me', are we? I DID say.");
      const opts = [], who = [];
      if (hasKey('anvilshard2')) { opts.push('Give him the Anvil.'); who.push('anvil'); }
      if (miasma) { opts.push('(Let Miasma talk to him.)'); who.push('miasma'); }
      opts.push('Leave him to sulk.'); who.push('none');
      const c = who[await ask(R(), "(Ashkar won't look at you.)", opts)];
      if (c === 'anvil') { takeKey('anvilshard2'); setFlag('ashkarMended'); await say(ASH, "...You're giving it to me. Now. After all that. Ugh. FINE. I'm touched. Don't tell anyone a god was touched."); join = true; }
      else if (c === 'miasma') {
        await say(MI(), "You gave me that coal when I was young and stupid. A little piece of your own hearth. I put it around my daughter's neck.");
        await say(MI(), "I'm calling it in, bird. Twenty-two years of interest.");
        await say(ASH, "...You would. You absolutely would. FINE. The Tenth Flame flies. Grudgingly. With MAXIMUM drama.");
        join = true;
      } else await say(ASH, "Good. Go. I'll be here. Sulking. Magnificently.");
    });
    if (join) { setFlag('ashkarJoins'); await raiseBanner('flame'); }
  },
};
// the banners play the moment you walk into each place
for (const b of BANNERS) {
  const m = MAPS[b.map], old = m.onEnter;
  m.onEnter = async () => {
    if (old) await old();
    if (!flag('ch6start') || flag('ch6siege') || bannerOn(b.id) || Game.field.map.id !== b.map) return;
    if (b.id === 'dawn' && flag('dawnWaiting') && !flag('ch6hallornFree')) { await say(null, "The council is still waiting for Hallorn's word."); return; }
    if (b.id === 'grave' && flag('graveRefused')) return;
    if (b.id === 'bloom' && !flag('ch5seed')) { await wait(10); await tip("The sapling isn't planted yet. Beat what's growing over the Seedbed, and plant Elaris's Last Seed."); return; }
    if (b.id === 'hour' && !flag('ch5hour')) return;
    await wait(20);
    await bannerScene(b.id);
  };
}
// planting the seed, or meeting Kryos, during the Rally raises their banner straight away
{
  const _seedbed = seedbed, _hourglass = hourglassEvent;
  seedbed = async () => { await _seedbed(); if (flag('ch6start') && flag('ch5seed') && !bannerOn('bloom')) await bannerScene('bloom'); };
  hourglassEvent = async () => { await _hourglass(); if (flag('ch6start') && flag('ch5hour') && !bannerOn('hour')) await bannerScene('hour'); };
}
// Solanthia opens its gates for the Rally; the Rimward cartographer keeps the list
{
  const gate = WORLD.places['27,11'], old = gate.check;
  gate.check = async () => { if (flag('ch6start')) return true; return old(); };
  MAPS.rimward.npcs[2].talk.unshift(() => flag('ch6start') ? rallyList().then(() => null) : undefined);
}

// ------------------------------------------------------------------ helpers for the end
// a copy of an enemy with some numbers changed, for fights your choices have already softened
function variantEnemy(id, key, fn) {
  const nid = id + '__' + key, d = JSON.parse(JSON.stringify(ENEMIES[id]));
  fn(d); ENEMIES[nid] = d; return nid;
}
// everything that ever happened between Raine and Verai, added up
function veraiLifetime() {
  let L = num('bond');
  for (const f of ['veraiNight', 'veraiHelped', 'veraiReturned', 'veraiReach', 'bn_hollow', 'prayer0', 'bn_mask', 'hollowSorry', 'veraiStood']) if (flag(f)) L++;
  if (flag('veraiDoubt')) L++; if (flag('veraiCold')) L--;
  L += Math.floor(num('veraiWill') / 3);
  return L;
}
function veraiAwayInGodsfall() { return flag('veraiLost5') && !flag('veraiHome'); }
function giveBonusAll(id, skill) { return giveBonus(id, skill); }

// ------------------------------------------------------------------ the siege of the Rim
async function godsfallGate() {
  const f = F();
  if (flag('ch6done')) { await say(null, "The storm is gone. Godsfall is quiet, and full of light."); await f.warp('gf1', 2, 2, 'down'); return; }
  if (flag('ch6siege')) { await f.warp('gf1', 2, 2, 'down'); return; }
  const n = bannerCount();
  await say(null, `The storm landing. ${n} of ${BANNERS.length} banners have promised to stand at the Rim.`);
  const c = await ask(null, "Begin the assault on Godsfall? Once the siege begins, no more banners can be raised.", ['Begin the assault', 'Not yet']);
  if (c !== 0) return;
  await siegeOfTheRim();
}
const SIEGE_LINES = {
  dawn: () => 'The Dawnguard\'s horns. Knights and priests, shoulder to shoulder, with a moonfang at either elbow.',
  tide: () => 'Every ship in the Harmony Sea anchors at the storm\'s edge, singing to Thalara.',
  moon: () => 'Moonhollow howls, and for once nobody is afraid of the sound.',
  hollow: () => 'Hollowmere kneels in the dust and prays, out loud, for the girl they were afraid of.',
  bloom: () => 'Pink petals ride the storm wind. Where they land, the lightning will not.',
  star: () => 'Astrilion\'s scholars read every holy book ever written, all at once, at the top of their lungs.',
  mask: () => 'Ebonport lies to the storm so beautifully that it believes them. The Unlit hold up their black lanterns.',
  hour: () => 'For one stopped minute, the storm forgets how to move.',
  hearth: () => 'Hearthmoor hands out honey cakes on the Rim. Somebody brought firewood. It seemed polite.',
  chain: () => 'Zariel\'s chainbearers march into the lightning on purpose.',
  powder: () => 'Kharak Yr\'s cannons fire prayer jars into the eye of the storm.',
  grave: () => 'The dead of Draumond walk the Rim unafraid. They have already done the hard part.',
  flame: () => flag('ashkarJoins') ? 'The Tenth Flame himself sets the clouds on fire, sulking magnificently.' : 'Ashkar\'s faithful fly into the storm, burning a road to their god.',
};
async function siegeOfTheRim() {
  const n = bannerCount(), raised = BANNERS.filter(b => bannerOn(b.id));
  await cinema([
    { dur: 220, bg: 'storm', music: 'final', shake: 10, caption: 'At the bottom of Godsfall, Sonia sits down. The Veilstorm tears open like a curtain.' },
    ...raised.map(b => ({ dur: 150, bg: b.id === 'tide' ? 'river' : b.id === 'moon' ? 'moon' : b.id === 'bloom' ? 'falls' : b.id === 'powder' || b.id === 'flame' ? 'fire' : 'storm', caption: SIEGE_LINES[b.id]() })),
    n ? { dur: 200, bg: 'storm', caption: `${n} banner${n > 1 ? 's' : ''} at the Rim. Every prayer they make is one Sonia does not get.` }
      : { dur: 220, bg: 'storm', caption: 'Nobody came. It\'s just you, a dragon, and the people you love. It will have to be enough.' },
  ], { skipAll: false });
  const waves = [['thronesworn', 'thronesworn'], ['thronesworn', 'prayerwisp', 'prayerwisp'], ['stormspawn', 'thronesworn', 'prayerwisp'], ['seatwarden', 'thronesworn'], ['fallengod', 'prayerwisp', 'prayerwisp']];
  const count = Math.max(1, 5 - Math.floor(n / 3));
  for (let i = 0; i < count; i++) {
    await say(null, `The storm's soldiers pour up over the Rim. (Wave ${i + 1} of ${count})`);
    const r = await startBattle({ enemies: waves[i], bg: 'stormplain', music: 'final', noRun: true });
    if (r === 'lose') return;
    if (i < count - 1 && (bannerOn('hearth') || bannerOn('tide'))) { healParty(); await say(null, bannerOn('hearth') ? "Between waves, somebody from Hearthmoor presses a honey cake into every hand. Everyone feels better. It's unscientific." : "Between waves, the fleet's healers patch everyone up."); }
  }
  setFlag('ch6siege');
  await cinema([{ dur: 200, bg: 'storm', sfx: 'holy', flash: 16, caption: 'The banners hold. The door stays open. Down you go.' }], { skipAll: false });
  healParty();
  await F().warp('gf1', 2, 2, 'down');
  await tip("Godsfall Crater is eight floors deep. You can climb back out through the Breach to rest or shop, and the Stair of Every Prayer near the bottom has a merchant. There is no way back up from the Unseated Throne once you face her.");
}

// ------------------------------------------------------------------ Godsfall, floor by floor
async function godsfallMoment(n) {
  if (flag('gfm' + n)) return;
  setFlag('gfm' + n);
  await scene(async cast => {
    const { raine, miasma } = cast, luna = withHero(cast, 'luna'), brakka = withHero(cast, 'brakka'), verai = withHero(cast, 'verai'), odeaon = withHero(cast, 'odeaon');
    if (n === 1) {
      await say(null, "Inside the crater, prayers drift down like snow. Each flake is a voice, very small, asking for something.");
      if (miasma) await say(MI(), "I can't fly in here. Too many wishes in the air. It's like swimming through somebody else's birthday candles.");
      if (luna) await say('Luna', "That one's asking for rain. That one wants her son to write. That one... wants the war to end. They're so SMALL.");
    } else if (n === 3) {
      await say(null, "A garden that never saw the sun. Every petal is drifting the same way, like a current, and it pulls at your boots.");
      if (flag('ch5seed')) await say(null, "Elaris's blossom in Raine's pack beats faster. The heart of her goddess is close.");
      if (brakka) await say(BR(), "Flowers that push you. Of course. Why wouldn't they.");
    } else if (n === 4) {
      await say(null, "A sun at the bottom of a lake. The floor is gold glass, slick as ice, and warm.");
      if (odeaon) await say(ODE(), "Sylara's light. Stolen. Even down here it wants to be a morning.");
    } else if (n === 5) {
      await say(null, "Night. Not the dark. A NIGHT, with no stars in it, flowing like a river, and it pushes.");
      if (verai) await say(VE(), flag('veraiNyxia') === 'vessel' ? "...It's me. It's the same as me. Raine, hold onto something. Hold onto ME." : "She's so close now. Nyxia. And so angry. That's not her. That's what my mother did to her.");
      else await say(R(), "Verai's down here somewhere. I can feel it. Like a cold spot.");
    }
  });
}
// the Hall of Unanswered Prayers: answer three to open the way down
const PRAYERS = [
  {
    voice: () => "(A man's voice, frightened.) \"Please, Sylara. Let the shadow girl go away. Let Hollowmere be safe.\"",
    opts: ['"She was never the danger."', '"You were afraid. That isn\'t a crime."'],
    after: c => bannerOn('hollow') ? "(The same voice, older now, very quiet.) \"...We were wrong. We said so. We're still saying it.\"" : "The prayer flickers, as if it had never thought of that.",
  },
  {
    voice: () => flag('tookPowder') ? "(A goblin, cheerful.) \"Grimnar, please let somebody use all this powder for something GOOD.\"" : "(A goblin, grumbling.) \"Grimnar, please let whoever blew up our powder be blown up. Slightly. Not to death.\"",
    opts: ['"We\'re using it on a god-thief. Is that good enough?"', '"Sorry about the powder."'],
    after: () => "(Somewhere far above, a cannon goes off. It sounds pleased.)",
  },
  {
    voice: () => allyRoute() ? "(A soldier of the Crimson Edict.) \"Zariel, please let me be on the winning side for once. Kargath promised us. Kargath lied.\"" : "(A soldier of the Crimson Edict.) \"Please let somebody remember Kargath was a man before he was hers.\"",
    opts: ['"There isn\'t a winning side. There\'s just the side you can live with."', '"We remember."'],
    after: () => "The prayer puts down something heavy, and walks away lighter.",
  },
  {
    voice: () => "(A young Dawnguard, very earnest.) \"Valerion, please let me be brave. Please let me never have to ask why.\"",
    opts: ['"Ask why. Every time."', '"Being brave is asking."'],
    after: () => flag('raineWhy') ? "Raine stares at the echo for a long moment. \"...That was me. That was me, before.\"" : "The echo salutes. It's a very good salute.",
  },
  {
    voice: () => "(A young woman. You know the voice. Sonia, a year ago.) \"Please. I've been faithful. I've done everything right. Give me the seat. I'll be kind with it. I swear I will.\"",
    opts: ['"You\'ll get a chance. Not like this."', '"You lost your chance."'],
    after: c => c === 0 ? (setFlag('soniaHeard'), "(The young Sonia's voice, surprised.) \"...Somebody heard me?\"") : "The prayer goes dark, and stays dark.",
  },
  {
    voice: () => "(A small, sleepy voice. Pip.) \"Two Moons, please let the big shiny knight come home. And bring me a rock. A good one.\"",
    opts: ['"She will. With a rock."', '"Luna\'s right here."'],
    after: () => heroHere('luna') ? "Luna has gone completely red under her fur. \"...I'll find him the best rock in the world.\"" : "The prayer giggles, and fades.",
  },
];
async function prayerEcho(i) {
  if (flag('prayer' + i)) return say(null, "The prayer is quiet now. Answered, or at least heard.");
  const p = PRAYERS[i];
  await say('An Unanswered Prayer', p.voice());
  const c = await ask(R(), "(Nobody ever answered it.)", [...p.opts, 'Leave it.']);
  if (c >= p.opts.length) return;
  setFlag('prayer' + i); addFlag('prayersAnswered'); Audio2.sfx('heal');
  await say(null, p.after(c));
  if (num('prayersAnswered') === 3) { Game.flash = 10; await say(null, "Three prayers answered. The gate of light at the north end of the hall dissolves."); }
}
async function heartseedEvent() {
  if (flag('ch6heartseed')) return;
  const f = F();
  if (f._hsBusy) return; f._hsBusy = true;
  try {
    let foe = 'heartseedthrall';
    await scene(async cast => {
      const { raine } = cast;
      await say(null, "At the heart of the garden, something made of thorns is curled around a beating light. Elaris's Heartseed, stolen in the very first days of all this.");
      if (hasKey('elarisblossom')) {
        await say(null, "Elaris's blossom in Raine's pack opens all at once. The thorns flinch. They REMEMBER.");
        if (S().flags.seedVow === 'elaris') await say('Elaris', "(Faintly, from the blossom.) ...That's mine. That's my heart. Let it go, little thorns. You were never meant to hold anything.");
        foe = variantEnemy('heartseedthrall', 'weak', d => { d.hp = Math.round(d.hp * 0.7); d.lines.start = 'The thorns are already loosening. They remember being loved.'; });
      }
    });
    if (!(await bossFight(foe, 'vale'))) return;
    setFlag('ch6heartseed'); giveKey('heartseed');
    await say(null, "The thorns let go. Elaris's Heartseed drops into Raine's hands, warm as a sleeping bird.");
    await notify('Took back the Heartseed, Elaris\'s reliquary!', 'levelup');
  } finally { f._hsBusy = false; }
}
async function dawnheartEvent() {
  if (flag('ch6dawnheart')) return;
  const f = F();
  if (f._dhBusy) return; f._dhBusy = true;
  try {
    let foe = 'dawnheartseraph';
    await scene(async () => {
      await say(null, "A seraph of molten gold stands guard over a small, stolen sunrise: the Dawnheart, Sylara's reliquary.");
      if (bannerOn('dawn')) {
        await say(null, "Far above, the Dawnguard is praying. You can hear it even down here. The seraph's light wavers toward the sound like a plant toward a window.");
        foe = variantEnemy('dawnheartseraph', 'weak', d => { d.hp = Math.round(d.hp * 0.7); d.lines.start = 'The Seraph keeps glancing upward, toward the Dawnguard\'s prayers.'; });
      }
    });
    if (!(await bossFight(foe, 'temple'))) return;
    setFlag('ch6dawnheart'); giveKey('dawnheart');
    await notify('Took back the Dawnheart, Sylara\'s reliquary!', 'levelup');
  } finally { f._dhBusy = false; }
}
async function nightEvent() {
  if (flag('ch6night')) return;
  const f = F();
  if (f._nightBusy) return; f._nightBusy = true;
  try {
    if (veraiAwayInGodsfall()) await nightVeraiLost();
    else if (heroHere('verai') && S().flags.veraiNyxia === 'vessel') await nightVeraiVessel();
    else await nightVeraiCarries();
  } finally { f._nightBusy = false; }
}
function starlessFoe() { return bannerOn('mask') ? variantEnemy('starless', 'sung', d => { d.hp = Math.round(d.hp * 0.75); d.lines.start = 'Far above, the Unlit are singing. The Starless keeps turning its head toward the sound.'; }) : 'starless'; }
async function nightVeraiCarries() {
  if (heroHere('verai')) ensureInParty('verai');
  await scene(async cast => {
    const { raine } = cast, verai = withHero(cast, 'verai');
    await say(null, "In the heart of the night, the Starless uncoils: Nyxia's stolen dark, twisted into a wall, and it does not remember being kind.");
    if (verai) { await say(VE(), "I know you. I've carried a piece of you my whole life. You're not a wall. You're a NIGHT. You used to let people sleep."); await say(VE(), "Come here. I'll carry you too."); }
  });
  if (!(await bossFight(starlessFoe(), 'chapel'))) return;
  await scene(async cast => {
    const verai = withHero(cast, 'verai');
    if (verai) {
      await say(null, "The Starless folds down and down until it is small enough to hold. Verai holds it. It curls around her shoulders like a scarf, and the stars come out in it, one at a time.");
      await say(VE(), "...There. There you are.");
      if (giveBonus('verai', 'veilednight')) await notify('Verai learned The Veiled Night!', 'levelup');
    } else await say(null, "The Starless breaks apart into ordinary, harmless dark. Somewhere far above, someone is singing a lullaby.");
  });
  setFlag('ch6night');
}
async function nightVeraiVessel() {
  ensureInParty('verai');
  let free = false;
  await scene(async cast => {
    const { raine, miasma } = cast, verai = withHero(cast, 'verai');
    await say(null, "The Starless rises, and Verai's eyes go dark all the way through. She takes a step toward it. Then another.");
    await say(VE(), "It's ME. Raine, it's the rest of me. It's so warm. I could just... stop being so heavy.");
    const c = await ask(R(), "(Verai is walking into the night.)", ['"Verai. Your name is Verai. You chose it."', '"Hold my hand. Just hold on."', '"...Go, if you need to."']);
    let score = veraiLifetime() + [2, 1, -3][c] + (c === 0 && bannerOn('star') ? 1 : 0);
    S().flags.vesselScore = score;
    if (score >= 6) {
      free = true;
      if (verai) await verai.tremble(30);
      await say(VE(), "...Verai. I'm Verai. I CHOSE it.");
      await say(null, "Her eyes clear. Just brown again, and full of tears. The night pours back out of her, into the Starless, and she does not follow it.");
      if (miasma) await say(MI(), "That's my girl. That's... okay, she's not my girl, but she's SOMEBODY's girl and I'm very proud.");
      setFlag('veraiFree'); S().flags.veraiNyxia = 'carry';
    } else {
      await say(null, "Verai smiles, very gently, and lets go of Raine's hand. The night closes around her like water.");
      await say(VE(), "Don't be sad. It doesn't hurt. Nothing hurts.");
      sendAway('verai', 'night'); setFlag('veraiTaken'); setFlag('veraiAtThrone');
    }
  });
  if (!(await bossFight(starlessFoe(), 'chapel'))) return;
  if (!free) await say(null, "The Starless breaks apart. Verai is not inside it. Somewhere further down, toward the throne, a girl-shaped piece of the night is walking.");
  else await say(null, "The Starless folds down small enough to hold. This time Verai holds it at arm's length, gently, like somebody else's baby.");
  setFlag('ch6night');
}
async function nightVeraiLost() {
  const f = F();
  setFlag('ch6nightActor');
  const vv = f.spawn({ id: 'vv', look: 'verai', name: 'Verai', x: 10, y: 3, dir: 'down' });
  let home = false;
  await scene(async cast => {
    const { raine, miasma } = cast;
    await say(null, "In the heart of the night, Verai is standing guard. The Starless is curled at her feet like a huge, dark dog.");
    vv.face(raine);
    await say(VE(), "Of course you came. You always come. Raine, Mother is SITTING. In an hour she'll be everything. If I stop now, she has nobody. Do you understand? NOBODY.");
    if (flag('hollowSorry') || bannerOn('hollow')) await say(R(), "Hollowmere sent a message. They said they were wrong about you. They want you home.");
    const c = await ask(R(), "(This is the last time you will get to say something to her before the throne.)", ['"Come home, Verai."', '"I\'m not here to stop you. I\'m here to stand with you. Whatever you choose."', '"She is going to use you up."']);
    const score = veraiLifetime() + [1 + ((flag('hollowSorry') || bannerOn('hollow')) ? 1 : 0), 2, -1][c];
    S().flags.lostScore = score;
    if (score >= 6) {
      home = true;
      await say(null, "Verai looks down at the Starless. It looks up at her. Neither of them looks like they want to be here.");
      await say(VE(), "...Stand with me, then. Right now. Because I'm going to do something she'll never forgive.");
      await say(VE(), "I'm going home.");
      if (miasma) await say(MI(), "OH thank every single god. Including the bad ones.");
    } else {
      await say(VE(), "...You still don't get it. Fine. Then you'll have to go through me.");
    }
  });
  if (home) {
    f.despawn(vv);
    returnFromAway('verai'); setFlag('veraiHome'); S().flags.veraiNyxia = 'carry';
    await notify('Verai has come home!', 'levelup');
    await nightVeraiCarries();
    return;
  }
  healParty();
  const r = await startBattle({ enemies: ['nightsheir'], boss: true, bg: 'chapel', music: 'sonia', noRun: true });
  if (r === 'lose') return;
  await scene(async cast => {
    await say(null, "Verai is on her knees. The Starless has gone, scattered into ordinary dark. She doesn't look at Raine.");
    await say(VE(), "...I'm still going to her. I have to. She's my MOTHER.");
    await say(null, "She runs, down, toward the throne.");
  });
  f.despawn(vv);
  setFlag('veraiAtThrone'); setFlag('ch6night');
}
async function deepEvent() {
  if (flag('ch6warden')) return;
  const f = F();
  if (f._deepBusy) return; f._deepBusy = true;
  try {
    const captive = flag('odeaonFell') ? 'odeaon' : flag('ashkarFell') ? 'ashkar' : null;
    await scene(async cast => {
      const { raine, miasma } = cast;
      await say(null, "Where the gods fell: a field of broken statues, each one a god nobody remembers. In the middle, a chained figure, and a jailer made of chains.");
      if (captive === 'odeaon') {
        await say(null, "It's Odeaon. Chained to the floor, on one knee, with his sword still raised. Days. He has held it up for DAYS.");
        if (flag('ch5hour')) await say(KRY, "(From very far away.) I stopped one minute around him, little crescent. Only one. He has been living in it.");
        await say(ODE(), "...Raine? Ha. I told the jailer you'd come. It didn't believe me.");
        if (miasma) await say(MI(), "ODEAON!");
      } else if (captive === 'ashkar') {
        await say(null, "It's Ashkar, small and grey, chained to an empty throne by his own feathers. The chains are drinking his fire, a little at a time, and pouring it into the seat.");
        await say(ASH, "...Little crescent. Don't look at me like that. I'm keeping the seat warm. For somebody better.");
      }
      await say('The Chainwarden', "The Seat must be empty when she sits. Whatever falls into it, I keep.");
    });
    if (!(await bossFight('chainwarden', 'grave'))) return;
    setFlag('ch6warden');
    if (captive === 'odeaon') await rescueOdeaon();
    else if (captive === 'ashkar') await rescueAshkar();
    setFlag('ch6rescue');
  } finally { f._deepBusy = false; }
}
async function rescueOdeaon() {
  returnFromAway('odeaon'); takeKey('shieldofodeaon'); setFlag('ch6odeaonBack');
  await notify('Odeaon has returned to the party!', 'levelup');
  await scene(async cast => {
    const { raine, miasma } = cast, odeaon = withHero(cast, 'odeaon');
    await say(null, "The chains fall. Odeaon lowers his sword for the first time in days, and very nearly falls over.");
    await say(R(), "Father. Your shield.");
    await say(ODE(), "You kept it. Of course you kept it.");
    if (miasma) { await say(MI(), "I KNEW. I said. Ask anyone. I said 'he's alive, I'd know.' Did I say that?"); await say(R(), "You said it eleven times."); await miasma.heart(); }
  });
}
async function rescueAshkar() {
  setFlag('ch6ashkarFree');
  await scene(async cast => {
    const { raine, miasma } = cast;
    await say(null, "The chains fall. Ashkar is tiny, grey and shivering, no bigger than a sparrow, cupped in Raine's hands.");
    if (flag('pendantGiven')) {
      await say(ASH, "...Your pendant. I kept it on. It kept me warm the whole way down. Of course it did. It was always half yours.");
      await say(null, "He flares. Not much. Then much more. Then he is a man made of fire again, a little embarrassed about it.");
      setFlag('ashkarRevived');
    } else if (allyRoute()) {
      const c = await ask(R(), "(The pendant around your neck is a coal from his hearth. He is going out.)", ['Give him the pendant now.', 'Keep it. He can rest.']);
      if (c === 0) { setFlag('pendantGiven'); setFlag('ashkarRevived'); await say(null, "Raine presses the pendant against his chest. He blazes up so fast he singes her eyebrows."); await say(ASH, "...TWICE. You did it TWICE. Nobody's ever done it once."); }
      else { await say(ASH, "...Good. Keep it. I'm tired, little crescent. I'll ride in your pocket. It's warm in there."); setFlag('ashkarPocket'); }
    } else {
      await say(ASH, "The Anvil. I fell with it. It's... there. In the corner. Take it home for me. To the corpse-priests, I suppose. They'll be insufferable.");
      giveKey('anvilshard2'); setFlag('anvilFound');
      await say(null, "Raine cups the little grey phoenix in both hands and breathes on him, the way you would on a coal. He glows, a little. Enough.");
      setFlag('ashkarRevived');
    }
    if (miasma && flag('ashkarRevived')) await say(MI(), "There he is. The most dramatic bird in the world.");
  });
}
async function lastMerchant() {
  await say('The Last Merchant', "Even here, there's trade. Especially here. Everybody wants something at the end.");
  const c = await ask(null, "What do you need?", ['Weapons', 'Armor', 'Items', 'Nothing']);
  if (c < 3) await openShop(['weapon', 'armor', 'item'][c], 'lastmerchant');
}
async function lastCamp() {
  if (flag('ch6camp')) return;
  setFlag('ch6camp');
  await scene(async cast => {
    const { raine, miasma } = cast, odeaon = withHero(cast, 'odeaon'), luna = withHero(cast, 'luna'), brakka = withHero(cast, 'brakka'), verai = withHero(cast, 'verai');
    await say(null, "A stair of light, going up into the throne. Prayers drift past like dandelion seeds. Everyone sits down on the steps at once, without anybody saying to.");
    // the family, at last
    if (miasma) {
      if (flag('raineAnger')) await say(R(), "I'm still angry at you. Both of you. I think I'll be angry for a long time. ...I WANT to be angry at you for a long time. That means I want you around for a long time.");
      else if (flag('raineSilent')) await say(null, "Raine doesn't say anything for a while. Then she leans sideways until her shoulder is against Miasma's. She leaves it there.");
      else await say(R(), "I asked you why, back in Solanthia. You told me. I've been thinking about it ever since. I think I understand now.");
      if (flag('miasmaPromise')) await say(MI(), "I promised to tell you everything, back in Draumond. There's one thing left. I was scared every single day of your life. I still am. Right now, especially.");
      if (num('motherTrust') >= 2 || flag('raineWhy')) {
        await say(R(), "...Mom.");
        await miasma.surprise();
        await say(null, "Miasma, Dragon of the Old Sky, terror of the Wyrmspire, bursts into tears so loud that a prayer drifting past changes direction.");
      } else await say(MI(), "...Thanks for letting me come, kid.");
      if (odeaon) { await say(ODE(), "When this is over, we get married again. Properly. With witnesses."); await say(MI(), "Same goat?"); await say(ODE(), "Same goat."); }
      if (flag('ch3toyGiven')) await say(null, "Raine takes the little toy dragon out of her pocket and sets it on the step between them.");
    }
    if (luna) await say('Luna', num('lunaTrust') >= 2 ? "When this is over I'm going to stand in Solanthia's square with no helmet on and eat an entire roast. In public. With my teeth." : "When this is over I think I'll go home for a while. Moonhollow. I want to be somewhere I'm not hiding.");
    if (brakka) await say(BR(), flag('ch5vault') ? "Gruntle would have loved this. He'd have hated it. But he'd have loved it." : "If we live, I'm building a ship that flies. Nobody tell Miasma.");
    if (verai) await say(VE(), flag('veraiHome') ? "Thank you for coming down here for me. Even after everything. Especially after everything." : flag('veraiFree') ? "I almost forgot my name down there. I'm going to say it a lot for a while. Verai. Verai. Okay." : "Whatever's up there, she's still my mother. Whatever happens, I want to be the one who talks to her.");
    else if (flag('veraiAtThrone')) await say(R(), "She's up there. With her mother. ...I'm not finished with her yet.");
    if (flag('ashkarRevived')) await say(ASH, "(From Raine's pocket, or over her shoulder.) Lovely speeches. Very moving. Can we go and stop the woman eating every god in the world now?");
    await say(R(), "Okay. Let's go and finish it.");
  });
  await tip("The Unseated Throne is at the top of the stair. Save at the Dawn Lantern, and buy anything you need from the Last Merchant. There is no going back once the fight begins.");
}

// ------------------------------------------------------------------ the Ring of the Ten (optional)
const RING_INFO = {
  sylara: ['Sylara, the Radiant Dawn', 'sunsigil', "\"Light brings truth. Every day is a second chance. Show me how you spend yours.\""],
  thalara: ['Thalara, Mistress of Tides', 'tidepearl', "\"The sea takes and the sea gives back. Let's see which you are.\""],
  valerion: ['Valerion, the Iron Champion', 'oathring', flag => flag('ch6odeaonBack') || heroHere('odeaon') ? "\"My knight's daughter. And my knight. Good. Both of you, draw.\"" : "\"Draw. Honorably, if you know how.\""],
  myndra: ['Myndra, the Arcane Sage', 'seventhstar', "\"Oh, it's you. I've been looking forward to this chapter.\""],
  grimnar: ['Grimnar, the Ash-Father', 'firstanvil', flag => flag('anvilHome') || flag('anvilSealed') ? "\"You kept my Anvil from her. I will still hit you very hard. It is a form of respect.\"" : "\"Everything ends. Let us see how you end a fight.\""],
  elaris: ['Elaris, the Serene Bloom', 'heartbloom', flag => flag('ch5seed') ? "\"(A memory of a goddess, made of petals.) You planted me. Be gentle with the memory. Or don't.\"" : "\"(A memory of a goddess, made of petals.) I am only what is left. Be gentle.\""],
  malakar: ['Malakar, the Betrayer Flame', 'splitmask', "\"I'm going to help you win. That's the trick. You'll never see it coming.\""],
  kryos: ['Kryos, the Pale Watcher', 'frozenhour', "\"I already know how this ends. Humor an old god.\""],
  zariel: ['Zariel, the Bound Inferno', 'boundchain', flag => flag('trialWon') ? "\"You paid in blood at my gate. Pay again.\"" : "\"You paid in COIN at my gate. I have not forgotten.\""],
  tenth: ['The Tenth Flame', 'tenthfeather', flag => flag('ashkarRevived') || flag('ashkarJoins') ? "(Ashkar, perched on his own pedestal.) \"I get to test you? Oh, this is the best day of my life.\"" : "(An echo of a phoenix, burning on an empty pedestal.) \"Whoever sits here gets the hardest fight.\""],
};
async function godTrial(i) {
  const god = RING_GODS[i], [name, relic, lineOrFn] = RING_INFO[god];
  if (flag('ring_' + god)) return say(null, `${name}'s pedestal is warm. The god inclines their head to you.`);
  await say(name, typeof lineOrFn === 'function' ? lineOrFn(flag) : lineOrFn);
  const c = await ask(null, `Accept ${name.split(',')[0]}'s trial?`, ['Accept the trial', 'Not yet']);
  if (c !== 0) return;
  if (!(await bossFight('av_' + god, 'sanctum', { music: 'boss' }))) return;
  setFlag('ring_' + god); addItem(relic);
  await notify(`${name.split(',')[0]}'s blessing: received ${EQUIP[relic].name}!`, 'levelup');
  if (RING_GODS.every(g => flag('ring_' + g)) && !flag('ringComplete')) {
    setFlag('ringComplete'); addItem('crownoften'); Game.flash = 20; Audio2.sfx('holy');
    await say(null, "All ten pedestals blaze at once. For one moment, every god in the ring agrees about something.");
    await notify('Received the Crown of the Ten! Sonia will not be able to heal herself with stolen faith.', 'levelup');
  }
}
async function ringAltar() {
  const done = RING_GODS.filter(g => flag('ring_' + g)).length;
  await say(null, `The Ring of the Ten. Each pedestal is a god's seat, and each god will test you once. (${done} of 10 trials passed.)`);
  if (!flag('ringComplete')) await say(null, "Pass all ten, and the gods will agree to crown you. It has never happened before.");
}
MAPS.seatring.onEnter = async () => { if (!flag('ringSeen')) { setFlag('ringSeen'); await wait(20); await say(null, "Ten pedestals in a ring of white stone, high above the sea. Each one hums with a different god."); await tip("Every god shrugs off their own element: no fire against the Tenth Flame, Malakar or Grimnar, no ice against Kryos, no holy light against Sylara. Change weapons before you challenge them."); } };

// ------------------------------------------------------------------ the Unseated Throne
function buildSonia() {
  const n = bannerCount();
  const one = variantEnemy('sonia_one', 'final', d => {
    d.hp = Math.round(d.hp * (1.25 - 0.05 * n) / 100) * 100;
    if (bannerOn('mask')) d.acts = d.acts.filter(a => a.name !== 'Unmake');
    if (flag('ringComplete')) d.acts = d.acts.filter(a => a.name !== 'Faith');
    if (bannerOn('hour') || hasKey('stoppedminute')) d.agi -= 14;
    if (bannerOn('star') || hasKey('starsight')) { d.def = Math.round(d.def * 0.82); d.mdef = Math.round(d.mdef * 0.82); }
    if (bannerOn('chain')) d.atk -= 10;
    if (bannerOn('dawn')) d.acts.forEach(a => { if (a.name === 'The Only God') a.pow -= 30; });
    if (bannerOn('bloom')) d.acts.forEach(a => { if (a.name === 'Every Prayer at Once') a.pow -= 8; });
  });
  return one;
}
async function seatThroneEvent() {
  if (flag('ch6sonia')) return;
  const f = F();
  if (f._throneBusy) return; f._throneBusy = true;
  try {
    const so = f.spawn({ id: 'sonia', look: 'vesper', name: 'Sonia', x: 11, y: 3, dir: 'down' });
    const vv = flag('veraiAtThrone') ? f.spawn({ id: 'vv', look: 'verai', name: 'Verai', x: 13, y: 3, dir: 'down' }) : null;
    await scene(async cast => {
      const { raine, miasma } = cast;
      await say(null, "The Unseated Throne. It is made of every prayer nobody answered, and it is beautiful, and it is screaming very quietly.");
      await say('Sonia', "Captain. You're late. I've been sitting for nearly an hour. It's surprisingly uncomfortable.");
      if (hasKey('heartseed') && hasKey('dawnheart')) await say('Sonia', "And you took back my reliquaries. How sweet. I don't NEED them anymore.");
      if (vv) await say('Sonia', "My daughter came home to me. Didn't you, little night?");
      if (vv) await say(VE(), "...Yes, Mother.");
      await say(R(), "Get off the seat, Sonia.");
      await say('Sonia', "It isn't the seat, Captain. It's ALL of them. Every prayer anyone ever said. I'm going to be the only god there is. No more ten. No more fighting over chairs.");
      await say('Sonia', "Nobody will ever be unseated again. Isn't that KIND?");
      if (miasma) await say(MI(), "That's the worst kind of kind I've ever heard.");
    });
    // Ashkar fights beside you, if he got his fire back
    const st = S();
    let guest = null, out = null;
    if (flag('ashkarRevived') || flag('ashkarJoins')) {
      await say(ASH, "Room for one more? I'll be QUIET. ...I won't be quiet.");
      out = st.party.length >= 4 ? st.party[st.party.length - 1] : null;
      if (out) st.party = st.party.filter(m => m !== out);
      guest = makeMember('ashkar', Math.max(...st.party.map(m => m.lvl))); st.party.push(guest);
    }
    const restore = () => { if (guest) { st.party = st.party.filter(m => m !== guest); if (out) st.party.push(out); } };
    healParty();
    const r1 = await startBattle({ enemies: ['sonia_unseated'], boss: true, bg: 'sanctum', music: 'final', noRun: true });
    if (r1 === 'lose') { restore(); return; }
    await scene(async () => {
      Game.shake = 30; Audio2.sfx('dark');
      await say('Sonia', "...Fine. FINE. Then I'll stop being polite.");
      await say(null, "Sonia opens her arms and every prayer in Godsfall rushes into her at once. She is not a woman anymore. She is a sky, and every god you ever heard of is looking out of it.");
      const n = bannerCount();
      if (n >= 10) await say(null, "But far above, the banners are holding, and the prayers of the whole world keep pulling the other way. The sky she has become is full of holes.");
      else if (n >= 5) await say(null, "Far above, the banners are holding. Some of the prayers pull back toward them. Not enough. Not nearly enough. But some.");
      else await say(null, "Almost nobody is praying for anything else. She is whole, and enormous, and terribly calm.");
      if (hasKey('stoppedminute')) await say(KRY, "(From very far away.) Now, little crescent. Her minute is stopped. Make it count.");
      if (hasKey('starsight')) await say(MYN, "(Myndra's eye opens in Raine's pack.) There. And there. The seams where she stitched us together. Strike there.");
    });
    healParty();
    const r2 = await startBattle({ enemies: [buildSonia()], boss: true, bg: 'sanctum', music: 'final', noRun: true });
    restore();
    if (r2 === 'lose') return;
    setFlag('ch6sonia');
    f.despawn(so);
    await soniaFalls(vv);
  } finally { f._throneBusy = false; }
}
async function soniaFalls(vv) {
  const f = F();
  const so = f.spawn({ id: 'sonia2', look: 'vesper', name: 'Sonia', x: 11, y: 5, dir: 'down', pose: 'kneel' });
  await scene(async cast => {
    const { raine, miasma } = cast, verai = withHero(cast, 'verai');
    await say(null, "Every prayer pours out of her at once, up and out of the crater, home to wherever it came from. What's left on the steps of the throne is a woman. Just a woman. Very tired.");
    if (flag('soniaHeard')) await say('Sonia', "...You heard me. Down there, in that hall. That prayer was a year old. Nobody ever heard it.");
    await say('Sonia', "I was going to be the goddess of second chances. That's what I prayed for. Then a bird took the seat out of my hands, and I didn't have any left.");
    if (vv) {
      vv.face(raine);
      await say(null, "Verai is standing between Raine and her mother. She looks at one, and then at the other.");
      const c = await ask(R(), "(It's the last time you'll ask.)", ['"Come home, Verai. You can bring her."', '"Stay with her if you want. I\'ll still be your friend."', '"Please."']);
      const score = veraiLifetime() + [1, 2, 1][c] + (flag('soniaHeard') ? 1 : 0);
      if (score >= 5) {
        await say('Sonia', "...Go on, little night. Go home. I'll still be your mother wherever you are. I think that's how it works. I never actually learned.");
        await say(VE(), "...Okay. Okay.");
        f.despawn(vv); returnFromAway('verai'); setFlag('veraiHome'); setFlag('veraiReturnedAtLast');
      } else {
        await say(VE(), "I'm staying with her, Raine. Not for her. For me. Somebody has to teach her how to be a person again.");
        await say(VE(), "Don't look like that. You can visit. Bring the dragon.");
        setFlag('veraiWithMother');
      }
    } else if (verai) {
      verai.face(so);
      await say(VE(), "...Mother.");
      await say('Sonia', "Little night. You're so tall.");
      if (flag('soniaHeard')) { await say(VE(), "Raine heard your prayer. Down in the hall. I heard it too."); await say('Sonia', "Then somebody did. Finally."); }
    }
    if (miasma) await say(MI(), "So. Ten seats. Nine gods. One very empty chair. Somebody has to sit in it, or every prayer we just set loose has nowhere to go.");
  });
  await chooseSeat();
}

// ------------------------------------------------------------------ who sits in the Tenth Seat
async function chooseSeat() {
  const n = bannerCount(), opts = [], ids = [];
  const add = (id, label) => { ids.push(id); opts.push(label); };
  add('empty', 'Nobody. Let the seat stay empty.');
  if (heroHere('verai') && !flag('veraiWithMother')) add('verai', 'Verai. Let the Veiled Night come back, kinder.');
  if (flag('ashkarRevived') || flag('ashkarJoins') || flag('ashkarPocket')) add('ashkar', 'Ashkar. Give the Tenth Flame back his seat.');
  if (flag('ch5seed') && hasKey('heartseed')) add('bloom', S().flags.seedVow === 'elaris' ? 'Elaris. Give her heart back, and let her grow into it.' : 'The sapling. Let something new grow in the seat.');
  if (!flag('pendantGiven') && n >= 7) add('raine', 'Raine. The people at the Rim are praying for her by name.');
  if (flag('soniaHeard') && (flag('veraiHome') || flag('veraiWithMother') || (heroHere('verai') && num('veraiWill') >= 5))) add('sonia', 'Sonia. The second chance she prayed for. Watched by her daughter.');
  const c = await ask(R(), "(Everyone is looking at you. It's your call. It always was.)", opts);
  S().flags.seat = ids[c];
  await endingScene(ids[c]);
}
async function endingScene(seat) {
  const f = F();
  const pick2 = (a, b) => (a ? a : b);
  if (seat === 'empty') {
    await scene(async () => {
      await say(R(), "Nobody. Let it stay empty.");
      await say('Sonia', "...Every prayer you just set loose will have nowhere to go.");
      await say(R(), "Then they'll go back to the people who prayed them. Let them answer some of their own.");
    });
    await cinema([
      { dur: 220, bg: 'seats', music: 'title', caption: 'For the first time since the world was young, there are nine gods, and an empty chair at the table.' },
      { dur: 220, bg: 'dawn', caption: 'Nobody is unseated. Nobody is crowned. People start, a little at a time, to answer each other\'s prayers.' },
    ], { skipAll: false });
  } else if (seat === 'verai') {
    const vessel = S().flags.veraiNyxia === 'vessel' && !flag('veraiFree');
    await scene(async cast => {
      const verai = withHero(cast, 'verai');
      await say(R(), "Verai.");
      if (verai) await verai.surprise();
      await say(VE(), vessel ? "...She's been in me the whole time. I think I always knew it would end here." : "Me? I... I don't want to be Nyxia. I want to be Verai. Can I be both?");
      await say(MYN, "(From the Star Chart.) Nobody has ever asked a seat that before. I think it will say yes.");
      await say(VE(), "Raine. Visit. Bring the dragon. Bring the goat.");
    });
    await cinema([
      { dur: 240, bg: 'moon', music: 'title', caption: vessel ? 'Verai sits, and the night pours into her, and she becomes it. The Veiled Night returns, and she is very kind. She does not always remember why.' : 'Verai sits. The night comes back to the world, and it is gentle, and it has a name. Two names, actually.' },
      { dur: 220, bg: 'stars', caption: 'People sleep better. Nightmares are rarer. Sometimes, in Hollowmere, the stars rearrange themselves into the shape of a girl waving.' },
    ], { skipAll: false });
  } else if (seat === 'ashkar') {
    await scene(async () => {
      await say(R(), "Ashkar. It's yours. You stole it once. Earn it this time.");
      await say(ASH, "...Me. After everything. You're giving it back to the THIEF.");
      await say(ASH, "I'll be better. I won't be quieter. But I'll be better.");
    });
    await cinema([
      { dur: 220, bg: 'fire', music: 'phoenix', caption: 'The Tenth Flame returns to his seat, and burns a little less brightly, and a little more warmly.' },
      { dur: 220, bg: 'seats', caption: 'Every year on the day he fell, Ashkar visits Hollowmere\'s ashes and plants something. He is terrible at gardening. He keeps at it.' },
    ], { skipAll: false });
  } else if (seat === 'bloom') {
    const vow = S().flags.seedVow;
    await scene(async () => {
      takeKey('heartseed');
      await say(null, "Raine lays Elaris's Heartseed on the empty seat, beside the blossom from the sapling.");
      await say('Elaris', vow === 'elaris' ? "...Oh. Oh, I'm here. I'm HERE. I'm small, and I'm new, and I'm here." : vow === 'refuge' ? "A home for the hidden. I'll be a door that's always open." : "A garden for everyone. Even the ones who don't deserve it. ESPECIALLY them.");
    });
    await cinema([
      { dur: 240, bg: 'falls', music: 'vale', caption: vow === 'elaris' ? 'Elaris, the Serene Bloom, takes her seat again. She is younger now, and she laughs more.' : vow === 'refuge' ? 'A new god takes the Tenth Seat: the Open Door, patron of everyone who ever had to hide.' : 'A new god takes the Tenth Seat: the Last Garden, who grows wherever she is needed.' },
      { dur: 220, bg: 'forest', caption: 'In Heartbloom Hollow the sapling becomes a tree, and the tree becomes a temple, and the temple has no walls.' },
    ], { skipAll: false });
  } else if (seat === 'raine') {
    await scene(async cast => {
      const { raine, miasma } = cast;
      await say(null, "Up on the Rim, the banners are chanting a name. It isn't a god's name. It's hers.");
      await say(R(), "...They're praying for me.");
      await say(MYN, "(From the Star Chart.) That is how gods are made, child. Nobody asked the first ones either.");
      if (miasma) { await say(MI(), num('motherTrust') >= 2 || flag('raineWhy') ? "...Go on, kid. Your mother's a dragon. You can be a god. It runs in the family." : "...I just got you back. I just GOT you back."); await miasma.sad(); }
      await say(R(), "Then I'll be a god who asks why. Every time. Of everyone. Including me.");
    });
    await cinema([
      { dur: 240, bg: 'dawn', music: 'title', caption: 'Raine Cudlar takes the Tenth Seat: the Crescent, patron of everyone who ever asked why.' },
      { dur: 220, bg: 'seats', caption: 'She is a terrible god in all the right ways. She answers every prayer with a question. People seem to find that helpful.' },
    ], { skipAll: false });
  } else if (seat === 'sonia') {
    await scene(async () => {
      await say(R(), "Sonia. You prayed for a second chance. Take it.");
      await say('Sonia', "...You'd give it to ME? After everything I did?");
      await say(R(), "That's what a second chance IS.");
      await say('Sonia', "...I'll try to deserve it. I don't know how. Somebody will have to show me.");
      await say(VE(), "I will, Mother.");
    });
    await cinema([
      { dur: 240, bg: 'dawn', music: 'title', caption: 'Sonia takes the Tenth Seat at last: the goddess of second chances. She is very bad at it at first.' },
      { dur: 220, bg: 'stars', caption: 'Her daughter visits every week, and corrects her. She gets better. Slowly. Like anyone.' },
    ], { skipAll: false });
  }
  await epilogue(seat);
}

// ------------------------------------------------------------------ the epilogue: every chapter remembered
async function epilogue(seat) {
  const st = S(), f = F();
  const shots = [];
  const shot = (bg, caption, layers) => shots.push({ dur: 230, bg, caption, layers });
  // Sonia
  if (seat === 'sonia') shot('dawn', 'Sonia, goddess of second chances, keeps a list of everyone she ever hurt. She works through it. It is a very long list.');
  else if (flag('veraiWithMother')) shot('void', 'Sonia, mortal now, walks out of Godsfall with her daughter\'s hand in hers. They rent a small house in Ebonport, where nobody asks questions.');
  else shot('void', flag('soniaHeard') ? 'Sonia, mortal now, walks out of Godsfall alone. Every spring, somebody leaves fresh flowers in Hollowmere and does not sign them.' : 'Sonia walks out of Godsfall mortal, and alone, and nobody ever learns where she went.');
  // Verai
  if (seat === 'verai') shot('moon', 'Verai, the Veiled Night, visits Raine every new moon. She still brings the scarf.', [{ look: 'verai', x: W / 2, y: 520, s: 5 }]);
  else if (flag('veraiWithMother')) shot('stars', 'Verai teaches her mother how to be a person. It is the hardest job anyone in this story ever took on.', [{ look: 'verai', x: W / 2, y: 520, s: 5 }]);
  else if (heroHere('verai')) shot('stars', flag('veraiHome') ? 'Verai came home. Hollowmere rebuilt her house first, before their own.' : S().flags.veraiNyxia === 'carry' ? 'Verai carries a goddess\'s night around her shoulders like a scarf. It purrs, sometimes.' : 'Verai stayed. Every step of the way. Her choice.', [{ look: 'verai', x: W / 2, y: 520, s: 5 }]);
  // the family
  const wed = (num('motherTrust') >= 2 || flag('raineWhy')) && (heroHere('odeaon'));
  shot('dawn', wed ? 'On the Wyrmspire, a High Knight and a red dragon get married for the second time. The same goat officiates. Their daughter gives a speech. Everybody cries, including the goat.' : heroHere('odeaon') ? 'Odeaon and Miasma take a small house at the foot of the Wyrmspire. Raine visits. She is still angry. She visits anyway.' : 'Miasma waits at the Rim for Odeaon every evening. Every evening, she says she would know.', [{ img: 'miasma', x: 380, y: 560, s: 1.1 }, { img: 'raine', x: 580, y: 560, s: 1.1 }]);
  // Luna and Moonhollow, Hallorn and Solanthia
  const accord = flag('hallornSpared') || flag('ch6hallornFree');
  shot('moon', accord ? `The Two Moons Accord becomes law. Dame Luna is made Captain of the Dawnguard, and refuses to wear a helmet to the ceremony.${num('lunaTrust') >= 2 ? ' Raine knights her personally. She cries into her roast.' : ''}` : 'Moonhollow stays hidden for a while yet. Luna goes home, and is not ashamed, and that is enough to start with.', [{ look: 'lunawolf', x: W / 2, y: 520, s: 5 }]);
  shot('forest', flag('hallornSpared') ? 'Hallorn, who was spared, spends the rest of his life writing apologies. Pip reads every one.' : flag('ch6hallornFree') ? 'Hallorn rides to Solanthia on a moonfang named Bram, and back again every week. He says it is for the council. It is for Pip.' : 'Hallorn still chops wood in Moonhollow. His carvings have improved. Slightly.');
  // Brakka and Ashkar's land
  shot('fire', `${flag('tookPowder') ? 'Kharak Yr' : 'Kharak Yr, rebuilt out of spite,'} names its new cannon foundry after Old Gruntle.${flag('ch5vault') ? ' Brakka keeps the Thunderwife over the door.' : ''} Brakka finally builds a ship that flies. It is in a tree.`, [{ look: 'brakka', x: W / 2, y: 520, s: 5 }]);
  shot('fire', flag('anvilHome') || flag('anvilSealed') || flag('anvilFound') ? 'Grimnar\'s Anvil goes home to Draumond, and the Book of the Dead turns its pages again, slowly, carefully, all the way to the end.' : 'Grimnar\'s Anvil stays with Raine. Draumond grumbles about it for a hundred years. The dead are patient.');
  shot('fire', `${flag('trialWon') ? 'Vorsk still tells everyone about the foreigners who beat him fair.' : 'Vorsk still tells everyone about the foreigners who paid him in blood, eventually.'} ${allyRoute() ? 'Kargath\'s name is carved on a stone in Emberport, under the words "he was a man before he was hers."' : 'The Crimson Edict lays down its arms. Nobody is sure who ordered it.'}`);
  if (seat !== 'ashkar') shot('fire', flag('ashkarRevived') || flag('ashkarJoins') ? 'Ashkar, no longer a god, opens a bakery in Emberport. Everything is slightly burnt. It is the most popular bakery in the Dominion.' : flag('ashkarPocket') ? 'A very small grey phoenix lives in Raine\'s hearth now. He sulks magnificently. On cold nights he glows.' : 'The Tenth Flame\'s faithful keep a fire burning on the Throne of Cinders, in case he ever wants to come home.');
  // the far places
  shot('library', `Myndra writes all of it down. Every word. She gives it the title "The Tenth Seat", then crosses it out, then writes it again.${bannerOn('mask') ? ' In Ebonport, Quill sells masks of every one of you. The Miasma mask is the most popular. It has horns.' : ''}`);
  shot('stars', `${S().flags.watcher ? `In Hearthmoor, Dr. Thistlewood keeps a chair by the clinic bed with a little plaque: "${HEROES[S().flags.watcher] ? HEROES[S().flags.watcher].name : 'A friend'} sat here."` : 'In Hearthmoor, they still leave honey cakes out on the solstice. Now somebody always eats them.'}${flag('kryosGlimpse') ? ' Kryos watches. He was right: he did not see who stood up. He is glad.' : ''}`);
  shot('forest', flag('ch5seed') ? (seat === 'bloom' ? 'Heartbloom Hollow is a temple with no walls now. Anyone can come in. Everyone does.' : 'In Heartbloom Hollow, the sapling grows into a tree. Nobody planted the flowers around it. They just came.') : 'Somewhere in a hidden valley, the earth is still soft, waiting for a seed.');
  shot('falls', bannerOn('hollow') || flag('veraiHome') ? 'Hollowmere is rebuilt. They paint the mill fence orange, for the girl who climbed it, and leave a smoke-coloured stripe along the top, for the girl who sat on it with her.' : 'Hollowmere is rebuilt, slowly. They leave one house empty, with the door unlocked, just in case.');
  shot('river', `The Wren still sails. Harbormaster Grell still complains. ${bannerCount() >= 10 ? 'Every one of the peoples who stood at the Rim sends a ship to the wedding.' : 'Not everyone came to the Rim. Some of them are sorry now. Grell makes sure they know it.'}`);
  // Raine
  shot('dawn', seat === 'raine' ? 'Raine Cudlar, the Crescent, answers prayers with questions. On quiet days she comes down from the seat and climbs the mill fence in Hollowmere, just because she can.' : flag('raineWhy') ? 'Raine Cudlar, who never asked why, asks why every single day now. It drives everyone mad. It is wonderful.' : 'Raine Cudlar puts down her sword, and picks up her mother\'s hand, and learns how to ask why.', [{ img: 'raine', x: W / 2, y: 560, s: 1.4 }]);
  await fadeOut(40);
  f.enterMap('rimward', 12, 9, 'up');
  await cinema(shots, { skipAll: false });
  const castLines = ['THE TENTH SEAT', '', 'Raine Cudlar', 'Miasma, of the Old Sky', 'Verai', 'Dame Luna of Moonhollow', 'Brakka Sootfinger', 'High Knight Odeaon Cudlar', '', 'and', 'Ashkar, the Tenth Flame', 'Sonia, the Unseated', '', 'Myndra · Kryos · Elaris · Sylara · Thalara', 'Valerion · Grimnar · Malakar · Zariel · Nyxia', '', 'Grandmother Hesk · Pip · Hallorn · Elder Moth', 'Dr. Thistlewood · Harbormaster Grell · Mask-Seller Quill', 'Gate Champion Vorsk · Keeper Ossa · Pyrewarden Sael · Old Gruntle', '', 'and one very respectable goat', '', `${bannerCount()} of ${BANNERS.length} banners flew at the Rim.`, `The Tenth Seat: ${({ empty: 'left empty', verai: 'Verai', ashkar: 'Ashkar', bloom: S().flags.seedVow === 'elaris' ? 'Elaris, reborn' : 'a new god from Elaris\'s seed', raine: 'Raine', sonia: 'Sonia' })[seat]}.`, '', 'A tale of Cael\'Brithar.', '', 'Thank you for playing.'];
  await crawl(castLines, { speed: 0.6 });
  await cinema([
    { dur: 400, bg: 'seats', sfx: 'holy', flash: 14, music: 'title', layers: [
      { text: 'THE END', x: W / 2, y: 230, size: 42, color: '#ffe070', glow: 'rgba(255,200,80,0.8)', fadeIn: 40 },
      { text: 'Every god can be replaced. Every person can be forgiven.', x: W / 2, y: 300, size: 13, color: '#c8c8ff', fadeIn: 120 },
    ] },
  ], { skipAll: false });
  setFlag('ch6done');
  await saveScreen(null, Math.floor(st.playTime / 60), 'THE TENTH SEAT: COMPLETE', [
    `The Tenth Seat: ${({ empty: 'left empty', verai: 'Verai', ashkar: 'Ashkar', bloom: 'Elaris\'s seed', raine: 'Raine', sonia: 'Sonia' })[seat]}.`,
    `${bannerCount()} of ${BANNERS.length} banners flew at the Rim.`,
    heroHere('verai') ? 'Verai came home.' : flag('veraiWithMother') ? 'Verai stayed with her mother.' : seat === 'verai' ? 'Verai became the Veiled Night.' : 'Verai is gone.',
    `The Ring of the Ten: ${RING_GODS.filter(g => flag('ring_' + g)).length} of 10.`,
  ], 'The world is still yours to fly around. The Ring of the Ten is waiting, if you haven\'t finished it.');
  st.flying = true;
  f.enterMap('zalakir', 30, 14, 'down');
  await fadeIn(40);
  Audio2.music('sky');
}

// ------------------------------------------------------------------ hooks into the world
{
  const rim = MAPS.zalakir.places['34,14'], oldRim = rim.check;
  rim.check = async () => { if (flag('ch6start')) { await godsfallGate(); return false; } return oldRim(); };
  const crater = MAPS.zalakir.places['39,14'], oldCrater = crater.check;
  Object.defineProperty(crater, 'sealed', { get: () => !(Game.state && Game.state.flags && Game.state.flags.ch6done), configurable: true });
  crater.check = async () => { if (flag('ch6done')) { await say(null, "Godsfall Crater, full of light now. The throne at the bottom is empty, and quiet."); await F().warp('gf8', 11, 12, 'up'); return false; } return oldCrater(); };
  // after the end, the Veilstorm is gone
  const oldOverride = MAPS.zalakir.tileOverride;
  MAPS.zalakir.tileOverride = c => (c === 'w' && Game.state && flag('ch6done')) ? WORLD_TILES.v : (oldOverride ? oldOverride(c) : null);
}
