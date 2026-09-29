// Plays Chapter Three (the Wyrmspire) in headless Chromium, starting from a finished Chapter Two save file.
// usage: NODE_PATH=$(npm root -g) node tools/check/story3.js [watcherIndex 0-2] [screenshotDir]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const watcher = +(process.argv[2] || 0), out = process.argv[3];
const AI = fs.readFileSync(path.join(__dirname, 'sim.js'), 'utf8').match(/const AI = `([\s\S]*?)`;/)[1];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message + '\n' + e.stack));
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html'));
  await page.waitForTimeout(1200);
  await page.addScriptTag({ content: AI + '\nwindow.aiPick = aiPick;' });
  await page.evaluate(w => {
    window.__pick = { 'Somebody stays': w }; window.__saveScreen = 0;
    setInterval(() => {
      const b = Game.scenes.find(s => s instanceof BattleScene);
      if (b && b.ui && b.ui.kind === 'cmd') { b.setCmd(b.ui.m, aiPick(b, b.ui.m)); return; }
      const top = Game.top();
      if (top instanceof DialogScene && top.menu) {
        const s = JSON.stringify(top.pages); const hit = Object.keys(window.__pick).find(k => s.includes(k));
        top.menu.index = hit ? window.__pick[hit] : 0; Input.pressed.a = true; return;
      }
      if (top && top.saved !== undefined && top.menu) { window.__saveScreen++; Input.pressed.a = true; return; }
      if (top instanceof DialogScene || top instanceof NotifyScene || top instanceof CrawlScene || top instanceof CardScene || (b && b.waitKey)) Input.pressed.a = true;
    }, 30);
  }, watcher);
  const until = async (fn, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) return true; await page.waitForTimeout(200); } return false; };
  const idle = () => until(() => Game.field && Game.field.busy === 0 && Game.top() === Game.field && !Game.field.moving, 300000);
  let fails = 0;
  const check = async (name, cond) => { const ok = await page.evaluate(cond); if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + name); if (out) await page.screenshot({ path: path.join(out, `story3_${name}.png`) }); };
  const step = async (name, code, cond) => { await page.evaluate(code); await idle(); await check(name, cond); };
  const gear = `for (const m of S().party) { const g = { miasma: { weapon: 'wyrmtalons', head: 'frosthelm', body: 'wyrmmail' }, luna: { weapon: 'flamberge', head: 'frosthelm', body: 'wyrmmail' }, verai: { weapon: 'emberrod', head: 'furhood', body: 'frostrobe' }, brakka: { weapon: 'handcannon', head: 'furhood', body: 'snowcoat' } }[m.id]; if (g) Object.assign(m.equip, g); const st = stats(m); m.hp = st.mhp; m.mp = st.mmp; } Object.assign(S().items, { megatonic: 6, warmdraught: 5, hiether: 4, emberplume: 4 });`;
  await until(() => { Input.pressed.a = true; return Game.top() instanceof TitleScene; }, 60000);

  // A finished Chapter Two save, written the way Chapter Two left it (no Dragon job in the job table yet).
  await page.evaluate(() => {
    const st = newState();
    st.party = ['raine', 'miasma', 'verai', 'luna'].map(id => makeMember(id, 29));
    st.bench = [makeMember('brakka', 28)];
    const job = { raine: 'reaper', miasma: 'wyrmblood', verai: 'arcanist', luna: 'oathblade', brakka: 'freelancer' };
    for (const m of [...st.party, ...st.bench]) { delete m.jobs.dragon; for (const j in m.jobs) m.jobs[j].lv = 8; m.job = job[m.id]; const s2 = stats(m); m.hp = s2.mhp; m.mp = s2.mmp; }
    for (const f of ['intro', 'audience', 'mission', 'stag', 'votary', 'pass', 'arrived', 'bridge', 'lunaJoin', 'harbor', 'chimera', 'wren', 'colossus', 'ch1end', 'ch1done', 'lunaRevealed', 'veraiStayed', 'sanctuarySunk', 'ch2start', 'emberGate', 'trialWon', 'chainJob', 'coalToken', 'gunworks', 'draumond', 'ferryman', 'ashkarAlly', 'ch2end', 'ch2done', 'miasmaHalfTruth']) st.flags[f] = true;
    st.flags.bond = 3; st.jobsOpen.push('reaper', 'tidecaller', 'wyrmblood', 'chainbearer', 'phoenix');
    st.map = 'cinders'; st.x = 10; st.y = 13; st.dir = 'up'; st.gold = 30000;
    delete st.resting; delete st.leader;
    localStorage.setItem(SAVE_KEY, JSON.stringify(st));
  });
  await page.evaluate(() => continueGame());
  await until(() => Game.field && Game.field.map && Game.field.map.id === 'clinic' && flag('ch3doctor') && Game.field.busy === 0 && Game.top() === Game.field, 300000);
  await check('opening_collapse_clinic', `flag('ch3confessed') && !member('raine') && S().resting.id === 'raine' && leadMember().id === 'miasma' && S().party.length === 3 && S().bench.length === 1 && S().bench[0].id === S().flags.watcher && S().party.every(m => m.jobs.dragon)`);
  await check('raine_asleep_in_clinic', `Game.field.visibleNpcs().some(n => n.key === '1' && n.def.look === 'raine') && Game.field.visibleNpcs().some(n => n.key === '3' && n.def.look === HEROES[S().flags.watcher].look)`);
  await check('no_leader_menu_yet', `!new MenuScene().root.items.some(i => i.text === 'Leader')`);
  await page.evaluate(gear);
  await step('world_then_spire_needs_doctor_done', `Game.field.enterMap('frostreach', 18, 5, 'up'); Game.field.run(() => Game.field.enterPlace(MAPS.frostreach.places['18,4']));`, `Game.field.map.id === 'wyrm1'`);
  await step('moment1', `Game.field.enterMap('wyrm1', 12, 11, 'up'); Game.field.run(() => climbMoment(1));`, `flag('ch3m1')`);
  // ice: step from the snow onto the ice and slide until something stops you
  await page.evaluate(() => { Game.field.enterMap('wyrm2', 3, 13, 'up'); });
  await idle();
  await page.evaluate(() => { flag('noEnc') || setFlag('noEnc'); Game.field.tryMove('up'); });
  await until(() => !Game.field.moving && Game.field.busy === 0, 20000); await page.waitForTimeout(400);
  await check('ice_slides', `S().y < 12 && Game.field.map.id === 'wyrm2'`);
  await page.evaluate(() => { delete S().flags.noEnc; });
  await step('moment2', `Game.field.enterMap('wyrm2', 2, 13, 'up'); Game.field.run(() => climbMoment(2));`, `flag('ch3m2')`);
  await step('nest', `Game.field.enterMap('wyrm3', 4, 12, 'up'); Game.field.run(async () => { await climbMoment(3); await nestSign('helm'); await nestSign('hoard'); });`, `flag('ch3nest') && hasKey('dentedhelm') && hasKey('toydragon')`);
  await step('yeti', `${gear} Game.field.enterMap('wyrm4', 3, 13, 'right'); Game.field.run(() => yetiEvent());`, `flag('ch3yeti') && flag('ch3m4')`);
  await step('summit_confession', `Game.field.enterMap('summit', 1, 10, 'right');`, `flag('ch3summit') && flag('ch3told')`);
  await step('rimeclaw_to_cure', `${gear} window.__saveScreen = 0; Game.field.enterMap('summit', 8, 7, 'up'); Game.field.run(() => rimeclawEvent());`,
    `flag('ch3rime') && flag('ch3herb') && flag('ch3cured') && flag('leaderUnlocked') && flag('ch3part1') && S().jobsOpen.includes('dragon') && member('miasma').job === 'dragon' && member('raine') && S().party.length === 4 && !S().resting && window.__saveScreen > 0 && Game.field.map.id === 'clinic'`);
  await check('raine_caught_up', `member('raine').lvl >= 29 && leadMember().id === 'raine'`);
  await check('leader_menu', `new MenuScene().root.items.some(i => i.text === 'Leader')`);
  await check('choose_leader', `(S().leader = 'miasma', leadMember().id === 'miasma')`);
  await step('south_pass_is_next_update', `Game.field.enterMap('frostreach', 32, 19, 'right'); Game.field.run(() => Game.field.enterPlace(MAPS.frostreach.places['33,19']));`, `Game.field.map.id === 'frostreach'`);
  await step('hearthmoor', `Game.field.enterMap('hearthmoor', 14, 14, 'up');`, `Game.field.map.id === 'hearthmoor' && (S().bench.length === 0 || Game.field.visibleNpcs().some(n => n.key === '7'))`);
  console.log('state:', await page.evaluate(() => JSON.stringify({ party: S().party.map(m => [m.id, m.lvl, m.job]), bench: S().bench.map(m => m.id), watcher: S().flags.watcher })));
  console.log('errors:', errors.length ? errors.join('\n---\n') : 'none');
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  await browser.close();
})();
