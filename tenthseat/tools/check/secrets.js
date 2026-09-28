// Plays the Chapter Two secrets in headless Chromium: the Athenaeum (Index puzzle, Book Dragon three ways,
// Ink Warden), Hollowgrin's chest (Verai and Luna rewards, no-save rule) and the Bell-Ringer's game.
// usage: NODE_PATH=$(npm root -g) node tools/check/secrets.js [screenshotDir]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const out = process.argv[2];
const AI = fs.readFileSync(path.join(__dirname, 'sim.js'), 'utf8').match(/const AI = `([\s\S]*?)`;/)[1];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message + '\n' + e.stack));
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html'));
  await page.waitForTimeout(1200);
  await page.addScriptTag({ content: AI + '\nwindow.aiPick = aiPick;' });
  await page.evaluate(() => {
    window.__pick = {}; window.__shelf = 'solve'; window.__shots = [];
    setInterval(() => {
      const b = Game.scenes.find(s => s instanceof BattleScene);
      if (b && b.ui && b.ui.kind === 'cmd') { b.setCmd(b.ui.m, aiPick(b, b.ui.m)); return; }
      const top = Game.top();
      if (top instanceof ShelfPuzzle && top.t > 30) {
        if (!window.__shots.includes('puzzle')) { window.__shots.push('puzzle'); return; }
        if (window.__shelf === 'timeout') { top.left = Math.min(top.left, 3); return; }
        if (window.__shelf.startsWith('wrong')) { top.order = [...top.sol].reverse(); window.__shelf = window.__shelf === 'wrong-timeout' ? 'timeout' : 'solve'; }
        else top.order = [...top.sol];
        top.submit(); return;
      }
      if (top instanceof BellGame) { if (top.phase === 'input') top.press(top.seq[top.i]); return; }
      if (top instanceof DialogScene && top.menu) {
        const s = JSON.stringify(top.pages);
        const hit = Object.keys(window.__pick).find(k => s.includes(k));
        top.menu.index = hit ? window.__pick[hit] : 0;
        Input.pressed.a = true; return;
      }
      if (top instanceof DialogScene || top instanceof NotifyScene || top instanceof CrawlScene || top instanceof CardScene || (b && b.waitKey)) Input.pressed.a = true;
    }, 30);
  });
  const until = async (fn, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) return true; await page.waitForTimeout(200); } return false; };
  const idle = () => until(() => Game.field && Game.field.busy === 0 && Game.top() === Game.field, 240000);
  let fails = 0;
  const shot = async name => { if (out) await page.screenshot({ path: path.join(out, 'secret_' + name + '.png') }); };
  const step = async (name, code, check) => {
    await page.evaluate(code);
    await idle();
    const ok = await page.evaluate(check);
    if (!ok) fails++;
    console.log((ok ? 'PASS ' : 'FAIL ') + name);
    await shot(name);
  };
  const cp = n => `Game.scenes = []; applyCheckpoint(CHECKPOINTS.find(c => c.name.includes(${JSON.stringify(n)}))); for (const m of S().party) { gainExp(m, EXP_TABLE[31] - m.exp); }`;
  const gear = `for (const m of S().party) { changeJob(m, { raine: 'reaper', miasma: 'wyrmblood', luna: 'oathblade', verai: 'arcanist', brakka: 'freelancer' }[m.id]); Object.assign(m.equip, m.id === 'verai' ? { weapon: 'emberrod', head: 'embercowl', body: 'ashrobe' } : m.id === 'brakka' ? { weapon: 'handcannon', head: 'embercowl', body: 'salamanderhide' } : { weapon: m.id === 'miasma' ? 'pyreaxe' : 'flamberge', head: 'ashhelm', body: 'obsidianplate' }); const st = stats(m); m.hp = st.mhp; m.mp = st.mmp; } Object.assign(S().items, { megatonic: 6, emberplume: 4, hiether: 4, ashsalve: 4, echomint: 4 });`;
  await until(() => { Input.pressed.a = true; return Game.top() instanceof TitleScene; }, 60000);

  // --- Athenaeum, route A: misfile -> dragon -> re-shelve in time -> later wake it and fight -> Ink Warden
  await step('athenaeum_arrive', `${cp('Athenaeum')} ${gear}`, `flag('athenaeum') && Game.field.map.id === 'athenaeum1'`);
  await step('stairs_blocked', `Game.field.enterMap('athenaeum2', 18, 11, 'right'); Game.field.run(() => MAPS.athenaeum2.steps['19,11']());`, `!flag('archIndex') && S().x === 17`);
  await page.evaluate(() => { window.__shelf = 'wrong'; window.__pick = { 'Book Dragon is waiting': 0 }; });
  await page.evaluate(() => Game.field.run(() => indexLectern()));
  await until(() => Game.top() instanceof CardScene, 60000); await shot('dragon_card');
  await idle();
  let ok = await page.evaluate(() => flag('archIndex') && flag('dragonCalmed') && !flag('dragonBeaten') && !!S().bag.starboundrod && !flag('archDragonUp'));
  console.log((ok ? 'PASS' : 'FAIL') + ' misfile -> dragon -> re-shelved in time'); if (!ok) fails++;
  await step('wake_and_fight', `window.__pick = { 'wake whatever': 0 }; Game.field.run(() => indexLectern());`, `flag('dragonBeaten') && !!S().bag.dragonscript`);
  await step('warden', `Game.field.enterMap('athenaeum3', 10, 3, 'up'); Game.field.run(() => inkWardenEvent());`, `flag('inkWarden') && hasKey('myndrapage') && !!S().bag.wardenmantle`);

  // --- Athenaeum, route B: solved first time (no dragon)
  await step('solve_first_try', `${cp('Athenaeum')} ${gear} window.__shelf = 'solve'; window.__shots = ['puzzle']; Game.field.enterMap('athenaeum2', 10, 6, 'up'); Game.field.run(() => indexLectern());`, `flag('archIndex') && !flag('archDragonUp') && !flag('dragonBeaten') && !!S().bag.starboundrod`);
  // --- route C: misfile -> try again -> run out of time -> forced fight
  await step('timeout_fight', `${cp('Athenaeum')} ${gear} window.__shelf = 'wrong-timeout'; window.__pick = { 'Book Dragon is waiting': 0 }; Game.field.enterMap('athenaeum2', 10, 6, 'up'); Game.field.run(() => indexLectern());`, `flag('archIndex') && flag('dragonBeaten') && !flag('dragonCalmed')`);
  // --- route D: misfile -> choose to fight straight away
  await step('fight_straight_away', `${cp('Athenaeum')} ${gear} window.__shelf = 'wrong'; window.__pick = { 'Book Dragon is waiting': 1 }; Game.field.enterMap('athenaeum2', 10, 6, 'up'); Game.field.run(() => indexLectern());`, `flag('archIndex') && flag('dragonBeaten')`);

  // --- Hollowgrin's chest with Verai in the party
  await page.evaluate(() => { window.__pick = {}; });
  await step('chest_first_open_is_empty_then_fey', `${cp('Hollowgrin')} ${gear} window.__pick = { 'glints': 0, 'save before': 0 }; Game.field.run(() => Game.field.openChest(Game.field.chestAt(23, 13)));`, `Game.field.map.id === 'feychest1' && flag('feySeen') && !canSaveHere() && saveGame() === false && !!localStorage.getItem(SAVE_KEY)`);
  await step('no_exit', `void 0`, `!MAPS.feychest1.rows.join('').includes('X') && !MAPS.feychest2.rows.join('').includes('X') && !MAPS.feychest1.rows.join('').includes('L')`);
  await step('hollowgrin_verai', `Game.field.enterMap('feychest2', 8, 4, 'up'); Game.field.run(() => hollowgrinEvent());`, `flag('feyBeaten') && Game.field.map.id === 'charnoch' && member('verai').bonus.includes('hollownight') && !(member('luna').bonus || []).length && innateSkills(member('verai')).includes('hollownight')`);
  await step('chest_after', `Game.field.run(() => Game.field.openChest(Game.field.chestAt(23, 13)));`, `Game.field.map.id === 'charnoch'`);
  await step('leave_it_alone', `${cp('Hollowgrin')} window.__pick = { 'glints': 1 }; Game.field.run(() => Game.field.openChest(Game.field.chestAt(23, 13)));`, `Game.field.map.id === 'charnoch' && !flag('feySeen')`);
  // --- without Verai: Luna gets the skill
  await step('hollowgrin_luna', `${cp('Hollowgrin')} ${gear} S().party = S().party.filter(m => m.id !== 'verai'); window.__pick = { 'glints': 0, 'save before': 1 }; Game.field.run(async () => { await Game.field.openChest(Game.field.chestAt(23, 13)); Game.field.enterMap('feychest2', 8, 4, 'up'); await hollowgrinEvent(); });`, `flag('feyBeaten') && member('luna').bonus.includes('twinmoon')`);

  // --- Bell-Ringer
  await step('bells', `${cp('Bell-Ringer')} window.__pick = {}; Game.field.run(() => bellGame());`, `flag('bell1') && flag('bell2') && flag('bell3') && !!S().bag.gravecharm`);
  console.log('errors:', errors.length ? errors.join('\n---\n') : 'none');
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  await browser.close();
})();
