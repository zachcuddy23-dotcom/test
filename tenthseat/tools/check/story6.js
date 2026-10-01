// Plays the Final Chapter in headless Chromium, starting from a finished Chapter Five save.
// usage: NODE_PATH=$(npm root -g) node tools/check/story6.js <mode> [screenshotDir]
//   allyBloom  : ally route, Verai carries Nyxia, Ashkar fell (pendant given), every optional done: all 13 banners,
//                Elaris's seed takes the seat
//   rivalEmpty : rival route, Verai lost with low goodwill, Odeaon fell, the wolves kept Hallorn, the gate was bribed:
//                Hallorn must be freed for the Dawnguard, Vorsk must be fought, the Anvil goes to Draumond;
//                Verai fights you and runs to her mother, stays with her at the end; the seat stays empty
//   vesselRaine: ally route, Verai became the vessel and is pulled back by name, pendant kept: Ashkar rides in a pocket,
//                Raine takes the seat
//   rivalSonia : rival route, Verai lost but with a long history, comes home in the night; young Sonia's prayer answered;
//                Sonia gets her second chance
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const mode = process.argv[2] || 'allyBloom', out = process.argv[3];
const ally = mode === 'allyBloom' || mode === 'vesselRaine';
const AI = fs.readFileSync(path.join(__dirname, 'sim.js'), 'utf8').match(/const AI = `([\s\S]*?)`;/)[1];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message + '\n' + e.stack));
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html'));
  await page.waitForTimeout(1200);
  await page.addScriptTag({ content: AI + '\nwindow.aiPick = aiPick;' });
  // dialog picks: a number is the option index, a string picks the option containing it
  const seat = { allyBloom: 'Elaris.', rivalEmpty: 'Nobody', vesselRaine: 'Raine.', rivalSonia: 'Sonia.' }[mode];
  const picks = {
    'Begin the assault': 0, 'Hesk is watching you': 0, 'The Anvil is in your pack': 0, "Ashkar won't look at you": 'Miasma',
    'Accept ': 0, 'Nobody ever answered it': mode === 'rivalSonia' || mode === 'allyBloom' ? 0 : 1,
    'Verai is walking into the night': 0, 'This is the last time you will get to say': mode === 'rivalSonia' ? 1 : 2,
    "It's the last time you'll ask": 1, 'He is going out': 'Keep', 'Everyone is looking at you': seat,
  };
  await page.evaluate(p => {
    window.__pick = p; window.__saveScreen = 0;
    setInterval(() => {
      const b = Game.scenes.find(s => s instanceof BattleScene);
      if (b && b.ui && b.ui.kind === 'cmd') { b.setCmd(b.ui.m, aiPick(b, b.ui.m)); return; }
      const top = Game.top();
      if (top instanceof DialogScene && top.menu) {
        const s = JSON.stringify(top.pages); const hit = Object.keys(window.__pick).find(k => s.includes(k));
        let i = 0; if (hit) { const v = window.__pick[hit]; i = typeof v === 'number' ? v : Math.max(0, top.choices.findIndex(c => c.includes(v))); }
        top.menu.index = i; Input.pressed.a = true; return;
      }
      if (top && top.saved !== undefined && top.menu) { window.__saveScreen++; Input.pressed.a = true; return; }
      if (top instanceof DialogScene || top instanceof NotifyScene || top instanceof CrawlScene || top instanceof CardScene || top instanceof SkyChartScene || (b && b.waitKey)) Input.pressed.a = true;
    }, 30);
  }, picks);
  const until = async (fn, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) return true; await page.waitForTimeout(200); } return false; };
  const idle = () => until(() => Game.field && Game.field.busy === 0 && Game.top() === Game.field && !Game.field.moving, 600000);
  let fails = 0;
  const check = async (name, cond) => { const ok = await page.evaluate(cond); if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + name); if (out) await page.screenshot({ path: path.join(out, `story6_${mode}_${name}.png`) }); };
  const step = async (name, code, cond) => { await page.evaluate(code); await idle(); await check(name, cond); };
  const heal = `for (const m of [...S().party, ...(S().bench || [])]) { m.status = {}; const s2 = stats(m); m.hp = s2.mhp; m.mp = s2.mmp; } Object.assign(S().items, { godsdew: 9, megatonic: 9, hitonic: 20, emberplume: 8, lastlight: 6 });`;
  await until(() => { Input.pressed.a = true; return Game.top() instanceof TitleScene; }, 60000);

  // a finished Chapter Five, the way each route left it
  await page.evaluate(([mode, ally]) => {
    const st = newState(), L = 51;
    const gone = mode === 'rivalEmpty' || mode === 'rivalSonia';
    const party = ally ? ['raine', 'miasma', 'odeaon', 'verai'] : ['raine', 'miasma', 'luna', 'brakka'];
    const bench = ally ? ['luna', 'brakka'] : [];
    st.party = party.map(id => makeMember(id, L)); st.bench = bench.map(id => makeMember(id, L - 1));
    st.away = {};
    if (gone) { st.away.verai = makeMember('verai', L - 3); st.away.odeaon = makeMember('odeaon', L - 1); }
    const job = { raine: 'reaper', miasma: 'dragon', odeaon: 'oathblade', verai: 'nightveil', luna: 'nightveil', brakka: 'freelancer' };
    const gear = { raine: { weapon: 'thronecleaver', head: 'halohelm', body: 'seatplate' }, miasma: { weapon: 'oldskytalons', head: 'halohelm', body: 'seatplate' }, odeaon: { weapon: 'winteroath', head: 'halohelm', body: 'seatplate' }, verai: { weapon: 'nyxianrod', head: 'halocirclet', body: 'seatrobe' }, luna: { weapon: 'laststaff', head: 'halocirclet', body: 'seatrobe' }, brakka: { weapon: 'thunderwife', head: 'halocirclet', body: 'seatleather' } };
    for (const m of [...st.party, ...st.bench, ...Object.values(st.away)]) { for (const j in m.jobs) m.jobs[j].lv = 8; m.job = job[m.id]; Object.assign(m.equip, gear[m.id]); const s2 = stats(m); m.hp = s2.mhp; m.mp = s2.mmp; }
    const F = ['intro', 'audience', 'mission', 'stag', 'votary', 'pass', 'arrived', 'bridge', 'lunaJoin', 'harbor', 'chimera', 'wren', 'colossus', 'ch1end', 'ch1done', 'lunaRevealed', 'veraiStayed', 'sanctuarySunk', 'ch2start', 'emberGate', 'chainJob', 'coalToken', 'gunworks', 'draumond', 'ferryman', 'ch2end', 'ch2done',
      'ch3start', 'ch3sick', 'ch3doctor', 'ch3confessed', 'ch3cured', 'ch3herb', 'ch3rime', 'leaderUnlocked', 'ch3part1', 'ch3trial', 'ch3toyGiven', 'ch3done',
      'ch4start', 'ch4moon', 'ch4lunaTalk', 'ch4purge', 'lunaUnmasked', 'ch4dive', 'ch4mirrors', 'ch4bloom', 'ch4elaris', 'ch4done',
      'ch5start', 'skyWings', 'ch5star', 'ch5orrery', 'ch5unwritten', 'ch5veil', 'ch5regent', 'ch5flame', 'ch5rimOpen', 'ch5rim', 'ch5herald', 'ch5done'];
    for (const f of F) st.flags[f] = true;
    st.flags[ally ? 'ashkarAlly' : 'ashkarRival'] = true;
    st.flags[mode === 'rivalEmpty' ? 'bribed' : 'trialWon'] = true;
    st.flags[mode === 'rivalEmpty' ? 'blewPowder' : 'tookPowder'] = true;
    st.flags[mode === 'vesselRaine' ? 'raineSilent' : 'raineWhy'] = true; st.flags.motherTrust = mode === 'rivalEmpty' ? 0 : 2;
    st.flags.watcher = 'luna'; st.flags.lunaTrust = 2;
    if (ally) { st.flags.anvilSealed = true; st.flags.ashkarGuttered = true; st.flags.hallornSpared = true; st.flags.ashkarFell = true; st.flags.veraiResisted = true; st.flags.veraiStood = true; st.flags.veraiWill = mode === 'allyBloom' ? 7 : 3; }
    if (mode === 'allyBloom') { Object.assign(st.flags, { ashkarRisen: true, pendantGiven: true, veraiNyxia: 'carry', ch5graft: true, ch5seed: true, seedVow: 'elaris', ch5hour: true, kryosGlimpse: true, ch5barrows: true, ch5vault: true }); }
    if (mode === 'vesselRaine') { Object.assign(st.flags, { ashkarDim: true, veraiNyxia: 'vessel', bond: 3, veraiNight: true, veraiHelped: true }); }
    if (gone) { Object.assign(st.flags, { anvilLost: true, hallornKept: true, veraiGone4: true, veraiReach: true, veraiReachChoice: mode === 'rivalSonia' ? 1 : 0, veraiLost5: true, odeaonFell: true, anvilKept: true, veraiWill: mode === 'rivalSonia' ? 3 : 0, bond: mode === 'rivalSonia' ? 3 : 0, veraiNight: mode === 'rivalSonia' }); }
    if (mode === 'rivalSonia') st.flags.ashkarMended = false;
    st.keys = ['harborpass', 'wrenkey', 'gunpass', 'dentedhelm', 'accord', 'skywings', 'masks', 'starchart', 'nightlantern', ally ? 'livingflame' : 'crownember', ...(gone ? ['anvilshard2', 'elarisseed'] : [])];
    st.jobsOpen.push('reaper', 'tidecaller', 'wyrmblood', 'chainbearer', 'phoenix', 'dragon', 'nightveil', 'timewarden', 'bloomwarden');
    st.map = 'zalakir'; st.x = 7; st.y = 12; st.dir = 'down'; st.flying = true; st.ship = { x: 55, y: 19 }; st.gold = 200000;
    Object.assign(st.items, { godsdew: 9, megatonic: 9, hitonic: 20, emberplume: 8, lastlight: 6 });
    localStorage.setItem(SAVE_KEY, JSON.stringify(st));
  }, [mode, ally]);
  await page.evaluate(() => continueGame());
  await until(() => flag('ch6start') && Game.field.map.id === 'zalakir' && Game.field.busy === 0 && Game.top() === Game.field, 400000);
  await check('opening', `flag('ch6start') && S().flying && hasKey('rallyroll') && ${ally ? 'true' : `hasKey('shieldofodeaon')`}`);
  // the Rally: walk into each place and its banner scene plays
  const visit = async (name, map, cond) => step('banner_' + name, `${heal} S().flying = false; Game.field.enterMap('${map}', MAPS['${map}'].start[0], MAPS['${map}'].start[1], 'up');`, cond);
  const plan = {
    allyBloom: ['dawn', 'tide', 'moon', 'hollow', 'bloom', 'star', 'mask', 'hour', 'hearth', 'chain', 'powder', 'grave', 'flame'],
    rivalEmpty: ['dawn', 'moon', 'dawn2', 'chain', 'grave', 'flame', 'tide', 'star'],
    vesselRaine: ['dawn', 'tide', 'moon', 'hollow', 'star', 'mask', 'hearth', 'powder'],
    rivalSonia: ['tide', 'moon', 'hollow', 'star', 'mask', 'hearth', 'chain', 'powder', 'grave', 'flame'],
  }[mode];
  const MAPOF = { dawn: 'solanthia', dawn2: 'solanthia', tide: 'brightwater', moon: 'moonhollow', hollow: 'hollowash', bloom: 'bloom2', star: 'astrilion1', mask: 'ebonport', hour: 'hourglass3', hearth: 'hearthmoor', chain: 'emberport', powder: 'kharakyr', grave: 'draumond', flame: 'cinders' };
  for (const b of plan) {
    const id = b.replace('2', '');
    const expect = mode === 'rivalEmpty' && b === 'dawn' ? `!flag('bn_dawn') && flag('dawnWaiting')` : mode === 'rivalEmpty' && b === 'moon' ? `flag('bn_moon') && flag('ch6hallornFree')` : `flag('bn_${id}')`;
    await visit(b, MAPOF[b], expect);
  }
  const want = { allyBloom: 13, rivalEmpty: 7, vesselRaine: 8, rivalSonia: 10 }[mode];
  await check('banner_count', `bannerCount() === ${want}${mode === 'rivalEmpty' ? ` && flag('anvilHome') && flag('ashkarJoins') && !hasKey('anvilshard2')` : ''}`);
  // the siege: fewer waves with more banners
  await step('siege', `${heal} S().flying = false; Game.field.enterMap('zalakir', 33, 14, 'right'); Game.field.run(() => Game.field.enterPlace(MAPS.zalakir.places['34,14']));`, `flag('ch6siege') && Game.field.map.id === 'gf1'`);
  await step('prayers', `Game.field.enterMap('gf2', 10, 6, 'up'); Game.field.run(async () => { await prayerEcho(0); await prayerEcho(3); await prayerEcho(4); });`, `num('prayersAnswered') === 3 && !Game.field.tileDef('G').solid && ${mode === 'rivalSonia' || mode === 'allyBloom' ? `flag('soniaHeard')` : `!flag('soniaHeard')`}`);
  await step('heartseed', `${heal} Game.field.enterMap('gf3b', 10, 9, 'up'); Game.field.run(() => heartseedEvent());`, `flag('ch6heartseed') && hasKey('heartseed')`);
  await step('dawnheart', `${heal} Game.field.enterMap('gf4b', 10, 9, 'up'); Game.field.run(() => dawnheartEvent());`, `flag('ch6dawnheart') && hasKey('dawnheart')`);
  await step('night', `${heal} Game.field.enterMap('gf5b', 10, 9, 'up'); Game.field.run(() => nightEvent());`, `flag('ch6night') && ${
    mode === 'allyBloom' ? `anyMember('verai').bonus.includes('veilednight')` : mode === 'vesselRaine' ? `flag('veraiFree') && heroHere('verai')` : mode === 'rivalSonia' ? `flag('veraiHome') && heroHere('verai')` : `flag('veraiAtThrone') && !heroHere('verai')`}`);
  await step('deep', `${heal} Game.field.enterMap('gf6', 11, 10, 'up'); Game.field.run(() => deepEvent());`, `flag('ch6rescue') && ${ally ? (mode === 'allyBloom' ? `flag('ashkarRevived')` : `flag('ashkarPocket') && !flag('pendantGiven')`) : `flag('ch6odeaonBack') && heroHere('odeaon')`}`);
  await step('last_camp', `Game.field.enterMap('gf7', 11, 11, 'up'); Game.field.run(() => lastCamp());`, `flag('ch6camp')`);
  if (mode === 'allyBloom') await step('ring_trial', `${heal} S().flying = false; Game.field.enterMap('seatring', 11, 15, 'up'); Game.field.run(() => godTrial(0));`, `flag('ring_sylara') && !!S().bag.sunsigil`);
  await page.evaluate(heal => { eval(heal); window.__saveScreen = 0; Game.field.enterMap('gf8', 11, 10, 'up'); Game.field.run(() => seatThroneEvent()); }, heal);
  await until(() => flag('ch6done') && Game.field && Game.field.map.id === 'zalakir' && Game.field.busy === 0 && Game.top() === Game.field, 900000);
  await check('ending', `flag('ch6sonia') && flag('ch6done') && window.__saveScreen > 0 && S().flags.seat === '${{ allyBloom: 'bloom', rivalEmpty: 'empty', vesselRaine: 'raine', rivalSonia: 'sonia' }[mode]}'${mode === 'rivalEmpty' ? ` && flag('veraiWithMother')` : ''}`);
  await check('postgame_storm_gone', `!Game.field.tileDef('w').noFly && !MAPS.zalakir.places['39,14'].sealed`);
  console.log('state:', await page.evaluate(() => JSON.stringify({ party: S().party.map(m => [m.id, m.lvl]), away: Object.keys(S().away || {}), banners: bannerCount(), seat: S().flags.seat, life: veraiLifetime() })));
  console.log('errors:', errors.length ? errors.join('\n---\n') : 'none');
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  await browser.close();
})();
