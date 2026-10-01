// Plays Chapter Five in headless Chromium, starting from a finished Chapter Four save.
// usage: NODE_PATH=$(npm root -g) node tools/check/story5.js <mode> [screenshotDir]
//   allyCarry  : Ashkar's ally, Verai stayed;  she carries Nyxia; the pendant goes back -> Ashkar falls at the Rim
//   allyVessel : Ashkar's ally, Verai stayed;  "maybe you should" -> she becomes Nyxia's vessel; pendant kept
//   rivalBack  : Ashkar's rival, Verai left;   she comes home in Ebonport; the Anvil is kept -> Odeaon falls
//   rivalLost  : Ashkar's rival, Verai left;   she stays lost; the Anvil goes back -> Ashkar falls
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const mode = process.argv[2] || 'allyCarry', out = process.argv[3];
const route = mode.startsWith('ally') ? 'ally' : 'rival', gone = mode.startsWith('rival');
const AI = fs.readFileSync(path.join(__dirname, 'sim.js'), 'utf8').match(/const AI = `([\s\S]*?)`;/)[1];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message + '\n' + e.stack));
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html'));
  await page.waitForTimeout(1200);
  await page.addScriptTag({ content: AI + '\nwindow.aiPick = aiPick;' });
  const picks = {
    'Nowhere to land here': 1, 'How do you pay': 1, 'What do you whisper to the seed': 0, 'how this ends': 0,
    'Verai is looking at you': mode === 'allyVessel' ? 1 : 2,
    'What do you say to her': mode === 'rivalBack' ? 1 : 0,
    'The pendant is warm': mode === 'allyCarry' ? 0 : 1,
    'Ashkar is holding out his hand': mode === 'rivalBack' ? 1 : 0,
  };
  await page.evaluate(p => {
    window.__pick = p; window.__saveScreen = 0;
    setInterval(() => {
      const b = Game.scenes.find(s => s instanceof BattleScene);
      if (b && b.ui && b.ui.kind === 'cmd') { b.setCmd(b.ui.m, aiPick(b, b.ui.m)); return; }
      const top = Game.top();
      if (top instanceof DialogScene && top.menu) { const s = JSON.stringify(top.pages); const hit = Object.keys(window.__pick).find(k => s.includes(k)); top.menu.index = hit ? window.__pick[hit] : 0; Input.pressed.a = true; return; }
      if (top && top.saved !== undefined && top.menu) { window.__saveScreen++; Input.pressed.a = true; return; }
      if (top instanceof DialogScene || top instanceof NotifyScene || top instanceof CrawlScene || top instanceof CardScene || top instanceof SkyChartScene || (b && b.waitKey)) Input.pressed.a = true;
    }, 30);
  }, picks);
  const until = async (fn, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) return true; await page.waitForTimeout(200); } return false; };
  const idle = () => until(() => Game.field && Game.field.busy === 0 && Game.top() === Game.field && !Game.field.moving, 500000);
  let fails = 0;
  const shot = async name => { if (out) await page.screenshot({ path: path.join(out, `story5_${mode}_${name}.png`) }); };
  const check = async (name, cond) => { const ok = await page.evaluate(cond); if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + name); await shot(name); };
  const step = async (name, code, cond) => { await page.evaluate(code); await idle(); await check(name, cond); };
  const heal = `for (const m of [...S().party, ...(S().bench || [])]) { m.status = {}; const s2 = stats(m); m.hp = s2.mhp; m.mp = s2.mmp; } Object.assign(S().items, { megatonic: 9, heartdew: 9, inkdraught: 9, phoenixtear: 9, echomint: 6, hitonic: 20, tonic: 20, emberplume: 8 });`;
  await until(() => { Input.pressed.a = true; return Game.top() instanceof TitleScene; }, 60000);

  // a Chapter Four save, the way Chapter Four left it
  await page.evaluate(([route, gone]) => {
    const st = newState(), L = 44;
    const party = gone ? ['raine', 'miasma', 'odeaon', 'luna'] : ['raine', 'miasma', 'odeaon', 'verai'], bench = gone ? ['brakka'] : ['luna', 'brakka'];
    st.party = party.map(id => makeMember(id, L)); st.bench = bench.map(id => makeMember(id, L - 1));
    const job = { raine: 'reaper', miasma: 'dragon', odeaon: 'oathblade', verai: 'arcanist', luna: 'oathblade', brakka: 'freelancer' };
    // the gear a player would have bought in Sephara and Rimward by the end of the chapter
    const gear = { raine: { weapon: 'godsfallaxe', head: 'skyhelm', body: 'wildplate' }, miasma: { weapon: 'raptorclaws', head: 'skyhelm', body: 'wildplate' }, odeaon: { weapon: 'wildfang', head: 'skyhelm', body: 'wildplate' }, luna: { weapon: 'wildfang', head: 'skyhelm', body: 'wildplate' }, verai: { weapon: 'pilgrimrod', head: 'wildhat', body: 'wildrobe' }, brakka: { weapon: 'handcannon', head: 'wildhat', body: 'wildhide' } };
    const all = [...st.party, ...st.bench];
    if (gone) { const v = makeMember('verai', L - 2); v.job = 'arcanist'; st.away = { verai: v }; }
    for (const m of all) { for (const j in m.jobs) m.jobs[j].lv = 8; m.job = job[m.id]; Object.assign(m.equip, gear[m.id]); const s2 = stats(m); m.hp = s2.mhp; m.mp = s2.mmp; }
    for (const f of ['intro', 'audience', 'mission', 'stag', 'votary', 'pass', 'arrived', 'bridge', 'lunaJoin', 'harbor', 'chimera', 'wren', 'colossus', 'ch1end', 'ch1done', 'lunaRevealed', 'veraiStayed', 'sanctuarySunk', 'ch2start', 'emberGate', 'trialWon', 'chainJob', 'coalToken', 'gunworks', 'draumond', 'ferryman', 'veraiNight', 'ch2end', 'ch2done',
      'ch3start', 'ch3sick', 'ch3doctor', 'ch3confessed', 'ch3cured', 'ch3herb', 'ch3rime', 'leaderUnlocked', 'ch3part1', 'ch3trial', 'raineWhy', 'ch3toyGiven', 'ch3done',
      'ch4start', 'ch4moon', 'ch4lunaTalk', 'ch4purge', 'lunaUnmasked', 'ch4dive', 'ch4mirrors', 'ch4bloom', 'ch4elaris', 'ch4done']) st.flags[f] = true;
    st.flags[route === 'ally' ? 'ashkarAlly' : 'ashkarRival'] = true;
    st.flags[route === 'ally' ? 'anvilSealed' : 'anvilLost'] = true;
    if (route === 'ally') st.flags.ashkarGuttered = true;
    st.flags[route === 'ally' ? 'hallornSpared' : 'hallornKept'] = true;
    if (gone) { st.flags.veraiGone4 = true; st.flags.veraiGoneWhen = 'reflection'; st.flags.veraiReach = true; st.flags.veraiReachChoice = 1; st.flags.veraiWill = 2; }
    else { st.flags.veraiResisted = true; st.flags.veraiStood = true; st.flags.veraiWill = 5; }
    st.flags.bond = 3; st.flags.lunaTrust = 2;
    st.keys = ['harborpass', 'wrenkey', 'gunpass', 'dentedhelm', 'elarisseed', 'accord', ...(route === 'ally' ? ['phoenixember'] : [])];
    st.jobsOpen.push('reaper', 'tidecaller', 'wyrmblood', 'chainbearer', 'phoenix', 'dragon');
    st.map = 'world'; st.x = 55; st.y = 19; st.dir = 'left'; st.onShip = true; st.ship = { x: 55, y: 19 }; st.gold = 80000;
    Object.assign(st.items, { megatonic: 9, heartdew: 9, inkdraught: 9, phoenixtear: 9, echomint: 6, hitonic: 20, tonic: 20, emberplume: 8 });
    localStorage.setItem(SAVE_KEY, JSON.stringify(st));
  }, [route, gone]);
  await page.evaluate(() => continueGame());
  await until(() => flag('ch5start') && Game.field.map.id === 'world' && Game.field.busy === 0 && Game.top() === Game.field, 400000);
  await check('opening_flying', `flag('skyWings') && S().flying && hasKey('skywings') && Game.field.map.id === 'world'`);
  // fly over mountains: from the plains north of Solanthia straight up through the northern range, no bumping
  await page.evaluate(() => { S().flying = true; Game.field.enterMap('world', 30, 8, 'up'); });
  for (let i = 0; i < 4; i++) { await page.evaluate(() => Game.field.tryMove('up')); await idle(); }
  await check('flies_over_mountains', `S().y === 4 && Game.field.tileDef(Game.field.tileAt(S().x, S().y)).solid`);
  // land on the open plain: on foot again, on Aurelion
  await step('land_on_plain', `S().flying = true; Game.field.enterMap('world', 30, 8, 'down'); Game.field.run(() => landHere());`, `!S().flying && Game.field.map.id === 'world'`);
  // take off again with Z, fly off the west edge, and the Sky Chart takes you to Thalemyr
  await step('take_off', `Game.field.run(() => takeOff());`, `S().flying`);
  await page.evaluate(() => { window.__pick['Fly to'] = 0; Game.field.enterMap('world', 0, 20, 'left'); });
  await page.evaluate(() => { const orig = SkyChartScene.prototype.update; SkyChartScene.prototype.update = function () { if (this.reveal < 0 && !this._steered) { this._steered = true; this.i = SKY_LANDS.findIndex(l => l.id === 'thalemyr'); } return orig.call(this); }; Game.field.tryMove('left'); });
  await idle();
  await check('sky_chart_to_thalemyr', `Game.field.map.id === 'thalemyr' && S().flying`);
  // Astrilion: the Orrery puzzle, then the Unwritten and Myndra
  await step('astrilion_enter', `Game.field.enterMap('thalemyr', 16, 5, 'up'); S().flying = false; Game.field.run(() => Game.field.enterPlace(MAPS.thalemyr.places['16,4']));`, `Game.field.map.id === 'astrilion1'`);
  await step('orrery_wrong_then_right', `Game.field.enterMap('astrilion2', 12, 14, 'up'); Game.field.run(async () => { await orreryStep(0); await orreryStep(1); for (const i of ORRERY_ORDER) await orreryStep(i); });`, `flag('ch5orrery') && !Game.field.tileDef('G').solid`);
  await step('unwritten_myndra', `${heal} Game.field.enterMap('astrilion3', 10, 9, 'up'); Game.field.run(() => unwrittenEvent());`, `flag('ch5unwritten') && flag('ch5star') && hasKey('starchart')`);
  // Ebonport: masks, then the chapel
  await step('ebonport_masks', `Game.field.enterMap('ebonport', 14, 16, 'up'); Game.field.run(() => maskSeller());`, `hasKey('masks')`);
  await step('chapel', `${heal} Game.field.enterMap('ebonport3', 10, 10, 'up'); Game.field.run(() => chapelEvent());`, `flag('ch5veil') && hasKey('nightlantern') && S().jobsOpen.includes('nightveil') && ${
    mode === 'allyCarry' ? `S().flags.veraiNyxia === 'carry' && member('verai') && member('verai').bonus.includes('nyxheart')` :
    mode === 'allyVessel' ? `S().flags.veraiNyxia === 'vessel'` :
    mode === 'rivalBack' ? `flag('veraiBack') && !!member('verai') && !(S().away || {}).verai` : `flag('veraiLost5') && !flag('veraiBack') && !!(S().away || {}).verai`}`);
  // the route dungeon on the Ashen Crown
  if (route === 'ally') {
    await step('cradle_braziers', `S().flying = true; Game.field.enterMap('ashkar', 6, 3, 'down'); Game.field.run(async () => { await landHere(); for (let i = 0; i < 4; i++) await lightBrazier(i); });`, `Game.field.map.id === 'cradle1' && flag('ch5braziers') && !Game.field.tileDef('G').solid`);
    await step('cradle_ashkar', `${heal} Game.field.enterMap('cradle2', 10, 9, 'up'); Game.field.run(() => cradleEvent());`, `flag('ch5flame') && hasKey('livingflame') && !!S().bag.phoenixcrescent && ${mode === 'allyCarry' ? `flag('ashkarRisen')` : `flag('ashkarDim')`}`);
  } else {
    await step('forge_valves', `S().flying = true; Game.field.enterMap('ashkar', 6, 3, 'down'); Game.field.run(async () => { await landHere(); for (let i = 0; i < 3; i++) await turnValve(i); });`, `Game.field.map.id === 'forge1' && flag('ch5valves')`);
    await step('forge_anvil', `${heal} Game.field.enterMap('forge2', 10, 9, 'up'); Game.field.run(() => forgeEvent());`, `flag('ch5flame') && hasKey('crownember') && ${mode === 'rivalBack' ? `flag('anvilKept') && !!S().bag.grimnaredge` : `flag('ashkarMended') && !!S().bag.kindledge`}`);
  }
  // optional places: reachable only by air
  await step('heartbloom', `${heal} S().flying = true; Game.field.enterMap('world', 27, 28, 'down'); Game.field.run(async () => { await landHere(); });`, `Game.field.map.id === 'bloom1'`);
  await step('elaris_seed', `${heal} Game.field.enterMap('bloom2', 10, 9, 'up'); Game.field.run(async () => { await graftEvent(); await seedbed(); });`, `flag('ch5seed') && S().jobsOpen.includes('bloomwarden') && !hasKey('elarisseed')`);
  await step('hourglass', `${heal} S().flying = true; Game.field.enterMap('frostreach', 24, 13, 'down'); Game.field.run(async () => { await landHere(); });`, `Game.field.map.id === 'hourglass1'`);
  await step('leave_lake_flying', `Game.field.run(() => Game.field.leaveMap('X'));`, `Game.field.map.id === 'frostreach' && S().flying`);
  await step('kryos', `${heal} Game.field.enterMap('hourglass3', 9, 8, 'up'); Game.field.run(() => hourglassEvent());`, `flag('ch5hour') && S().jobsOpen.includes('timewarden')`);
  await step('barrows', `${heal} Game.field.enterMap('barrows2', 11, 9, 'up'); Game.field.run(async () => { await barrowsTrial(); });`, `flag('ch5barrows') && flag('ch5barrowsDone') && anyMember('luna').bonus.includes('firstmoon')`);
  await step('hoard', `${heal} Game.field.enterMap('hoard', 11, 9, 'up'); Game.field.run(() => hoardEvent());`, `flag('ch5hoard') && anyMember('miasma').bonus.includes('oldskyroar')`);
  await step('vault', `${heal} Game.field.enterMap('vault', 10, 8, 'up'); Game.field.run(() => vaultEvent());`, `flag('ch5vault') && anyMember('brakka').bonus.includes('thunderclap')`);
  await step('rimward', `Game.field.enterMap('rimward', 12, 13, 'up'); Game.field.run(async () => { ${route === 'ally' ? 'await hallornRimward();' : 'await scoutRimward();'} });`, `${route === 'ally' ? `flag('ch5hallorn')` : `flag('ch5scout')`}`);
  // the Rim of Godsfall
  await step('rim_gate', `S().flying = false; Game.field.enterMap('zalakir', 33, 14, 'right'); Game.field.run(() => Game.field.enterPlace(MAPS.zalakir.places['34,14']));`, `Game.field.map.id === 'rim1' && flag('ch5rimOpen')`);
  await page.evaluate(heal => { eval(heal); window.__saveScreen = 0; Game.field.enterMap('rim2', 11, 9, 'up'); Game.field.run(() => eyeEvent()); }, heal);
  await until(() => flag('ch5done') && Game.field && Game.field.map.id === 'zalakir' && Game.field.busy === 0 && Game.top() === Game.field, 600000);
  await check('finale', `flag('ch5herald') && flag('ch5done') && window.__saveScreen > 0 && S().flying && ${mode === 'rivalBack' ? `flag('odeaonFell') && !anyMember('odeaon') && !!(S().away || {}).odeaon` : `flag('ashkarFell') && !!anyMember('odeaon')`}`);
  await step('crater_sealed', `Game.field.enterMap('zalakir', 39, 14, 'down'); Game.field.run(() => landHere());`, `Game.field.map.id === 'zalakir'`);
  console.log('state:', await page.evaluate(() => JSON.stringify({ party: S().party.map(m => [m.id, m.lvl]), bench: (S().bench || []).map(m => m.id), away: Object.keys(S().away || {}), will: S().flags.veraiWill, nyx: S().flags.veraiNyxia || null, jobs: S().jobsOpen.slice(-3) })));
  console.log('errors:', errors.length ? errors.join('\n---\n') : 'none');
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  await browser.close();
})();
