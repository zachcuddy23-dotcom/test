// Plays Chapter Four in headless Chromium, starting from a finished Chapter Three save.
// usage: NODE_PATH=$(npm root -g) node tools/check/story4.js <ally|rival> <stays|bench|push> [screenshotDir]
//   stays: Verai in the party, treated well        -> she stays all chapter
//   bench: Verai left on the bench                  -> she leaves at the reflection
//   push : Verai in the party, but pushed too hard  -> she leaves at the mirror, mid-chapter
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const route = process.argv[2] || 'ally', mode = process.argv[3] || 'stays', out = process.argv[4];
const AI = fs.readFileSync(path.join(__dirname, 'sim.js'), 'utf8').match(/const AI = `([\s\S]*?)`;/)[1];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message + '\n' + e.stack));
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html'));
  await page.waitForTimeout(1200);
  await page.addScriptTag({ content: AI + '\nwindow.aiPick = aiPick;' });
  const picks = mode === 'push' ? { 'Everyone is looking at Verai': 1, 'Hallorn is sneering': 2, 'staring into the mirror': 2 } : { 'Everyone is looking at Verai': 0, 'Hallorn is sneering': 0, 'staring into the mirror': 0 };
  Object.assign(picks, { 'What happens to Hallorn': route === 'ally' ? 0 : 1, "Luna won't look": 2, 'Luna is crying': 0 });
  await page.evaluate(p => {
    chapter5Opening = undefined;   // test Chapter Four on its own; story5.js covers Chapter Five
    window.__pick = p; window.__saveScreen = 0;
    setInterval(() => {
      const b = Game.scenes.find(s => s instanceof BattleScene);
      if (b && b.ui && b.ui.kind === 'cmd') { b.setCmd(b.ui.m, aiPick(b, b.ui.m)); return; }
      const top = Game.top();
      if (top instanceof DialogScene && top.menu) { const s = JSON.stringify(top.pages); const hit = Object.keys(window.__pick).find(k => s.includes(k)); top.menu.index = hit ? window.__pick[hit] : 0; Input.pressed.a = true; return; }
      if (top && top.saved !== undefined && top.menu) { window.__saveScreen++; Input.pressed.a = true; return; }
      if (top instanceof DialogScene || top instanceof NotifyScene || top instanceof CrawlScene || top instanceof CardScene || (b && b.waitKey)) Input.pressed.a = true;
    }, 30);
  }, picks);
  const until = async (fn, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) return true; await page.waitForTimeout(200); } return false; };
  const idle = () => until(() => Game.field && Game.field.busy === 0 && Game.top() === Game.field && !Game.field.moving, 400000);
  let fails = 0;
  const check = async (name, cond) => { const ok = await page.evaluate(cond); if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + name); if (out) await page.screenshot({ path: path.join(out, `story4_${route}_${mode}_${name}.png`) }); };
  const step = async (name, code, cond) => { await page.evaluate(code); await idle(); await check(name, cond); };
  const heal = `for (const m of S().party) { m.status = {}; const s2 = stats(m); m.hp = s2.mhp; m.mp = s2.mmp; } Object.assign(S().items, { megatonic: 8, moonwater: 4, hiether: 5, emberplume: 5, echomint: 4 });`;
  await until(() => { Input.pressed.a = true; return Game.top() instanceof TitleScene; }, 60000);

  // a Chapter Three save, the way Chapter Three left it
  await page.evaluate(([route, mode]) => {
    const st = newState();
    const inParty = mode !== 'bench';
    st.party = (inParty ? ['raine', 'miasma', 'odeaon', 'verai'] : ['raine', 'miasma', 'odeaon', 'luna']).map(id => makeMember(id, 36));
    st.bench = (inParty ? ['luna', 'brakka'] : ['verai', 'brakka']).map(id => makeMember(id, 35));
    const job = { raine: 'reaper', miasma: 'dragon', odeaon: 'oathblade', verai: 'arcanist', luna: 'oathblade', brakka: 'freelancer' };
    const gear = { raine: { weapon: 'eclipseaxe', head: 'wolfhelm', body: 'moonmail' }, miasma: { weapon: 'skyclaws', head: 'wolfhelm', body: 'moonmail' }, odeaon: { weapon: 'dawnbreaker', head: 'wolfhelm', body: 'moonmail' }, luna: { weapon: 'moonfangblade', head: 'wolfhelm', body: 'moonmail' }, verai: { weapon: 'nightrod', head: 'moonhood', body: 'moonrobe' }, brakka: { weapon: 'handcannon', head: 'moonhood', body: 'silverhide' } };
    for (const m of [...st.party, ...st.bench]) { for (const j in m.jobs) m.jobs[j].lv = 8; m.jobs.dragon.lv = 7; m.job = job[m.id]; Object.assign(m.equip, gear[m.id]); const s2 = stats(m); m.hp = s2.mhp; m.mp = s2.mmp; }
    for (const f of ['intro', 'audience', 'mission', 'stag', 'votary', 'pass', 'arrived', 'bridge', 'lunaJoin', 'harbor', 'chimera', 'wren', 'colossus', 'ch1end', 'ch1done', 'lunaRevealed', 'veraiStayed', 'sanctuarySunk', 'ch2start', 'emberGate', 'trialWon', 'chainJob', 'coalToken', 'gunworks', 'draumond', 'ferryman', 'veraiNight', 'ch2end', 'ch2done',
      'ch3start', 'ch3sick', 'ch3doctor', 'ch3confessed', 'ch3cured', 'ch3herb', 'ch3rime', 'leaderUnlocked', 'ch3part1', 'ch3trial', 'raineWhy', 'ch3toyGiven', 'ch3done']) st.flags[f] = true;
    st.flags[route === 'ally' ? 'ashkarAlly' : 'ashkarRival'] = true;
    st.flags.bond = 3; st.keys = ['harborpass', 'wrenkey', 'gunpass', 'dentedhelm', ...(route === 'rival' ? ['anvilshard'] : [])];
    st.jobsOpen.push('reaper', 'tidecaller', 'wyrmblood', 'chainbearer', 'phoenix', 'dragon');
    st.map = 'world'; st.x = 55; st.y = 19; st.dir = 'left'; st.onShip = true; st.ship = { x: 55, y: 19 }; st.gold = 60000;
    Object.assign(st.items, { megatonic: 8, moonwater: 4, hiether: 5, emberplume: 5, echomint: 4 });
    localStorage.setItem(SAVE_KEY, JSON.stringify(st));
  }, [route, mode]);
  await page.evaluate(() => continueGame());
  await until(() => flag('ch4start') && Game.field.map.id === 'world' && Game.field.busy === 0 && Game.top() === Game.field, 400000);
  await check('opening', `flag('ch4start') && S().onShip && ${route === 'ally' ? `hasKey('phoenixember') && hasKey('anvilshard')` : `hasKey('anvilbell') && hasKey('anvilshard')`} && ${mode === 'bench' ? `flag('veraiGone4') && !veraiHere() && S().away.verai` : `!flag('veraiGone4') && flag('veraiResisted') && veraiHere()`}`);
  await step('moonhollow_to_purge', `${heal} S().onShip = false; Game.field.enterMap('world', 17, 17, 'up'); Game.field.run(() => Game.field.enterPlace(WORLD.places['17,16']));`,
    `flag('ch4purge') && flag('ch4lunaTalk') && flag('lunaUnmasked') && HEROES.luna.look === 'lunawolf' && member('luna') && member('luna').bonus.includes('silvermane') && hasKey('accord') && (flag('hallornSpared') || flag('hallornKept'))`);
  await check('verai_after_moonhollow', mode === 'stays' ? `veraiHere() && num('veraiWill') >= 5` : mode === 'push' ? `veraiHere() && num('veraiWill') >= 2 && num('veraiWill') < 5` : `flag('veraiGone4')`);
  await step('mothers_fang', `Game.field.run(() => lunaDen());`, `!!S().bag.mothersfang`);
  await step('dive', `${heal} Game.field.enterMap('world', 40, 38, 'up'); Game.field.run(() => Game.field.enterPlace(WORLD.places['40,37']));`, `Game.field.map.id === 'drowned1' && flag('ch4dive')`);
  await step('currents_push', `Game.field.enterMap('drowned1', 5, 15, 'up'); Game.field.tryMove('up');`, `Game.field.map.id === 'drowned1' && !(S().x === 5 && S().y === 14) && !(S().x === 5 && S().y === 15)`);
  await step('mirrors', `${heal} Game.field.enterMap('drowned2', 10, 5, 'up'); Game.field.run(async () => { await mirrorEvent('left'); await mirrorEvent('middle'); await mirrorEvent('right'); });`,
    `flag('ch4mirrors') && ${mode === 'push' ? `flag('veraiGone4') && S().flags.veraiGoneWhen === 'mirror'` : mode === 'stays' ? `flag('veraiStood') && veraiHere()` : `flag('veraiGone4')`}`);
  await page.evaluate(heal => { eval(heal); window.__saveScreen = 0; Game.field.enterMap('drowned3', 9, 7, 'up'); Game.field.run(() => bloomEvent()); }, heal);
  await until(() => flag('ch4done') && Game.field && Game.field.map.id === 'world' && Game.field.busy === 0 && Game.top() === Game.field, 500000);
  await check('finale', `flag('ch4bloom') && flag('ch4done') && hasKey('elarisseed') && S().onShip && window.__saveScreen > 0 && !hasKey('anvilshard') && ${route === 'ally' ? `flag('anvilSealed') && flag('ashkarGuttered') && !member('ashkar')` : `flag('anvilLost')`} && ${mode === 'stays' ? `!flag('veraiReach')` : `flag('veraiReach')`}`);
  console.log('state:', await page.evaluate(() => JSON.stringify({ party: S().party.map(m => m.id), bench: (S().bench || []).map(m => m.id), will: S().flags.veraiWill, gone: S().flags.veraiGoneWhen || null, luna: S().flags.lunaTrust })));
  console.log('errors:', errors.length ? errors.join('\n---\n') : 'none');
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  await browser.close();
})();
