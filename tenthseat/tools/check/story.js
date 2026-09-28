// Plays every Chapter One story event in headless Chromium, auto-advancing dialog and auto-battling.
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
  // auto-driver: answers menus, dialogs and battles
  await page.evaluate(() => {
    window.__drive = true;
    setInterval(() => {
      if (!window.__drive) return;
      const b = Game.scenes.find(s => s instanceof BattleScene);
      if (b && b.ui && b.ui.kind === 'cmd') { b.setCmd(b.ui.m, aiPick(b, b.ui.m)); return; }
      const top = Game.top();
      if (top instanceof DialogScene && top.menu) { Input.pressed.a = true; return; }
      if (top instanceof DialogScene || top instanceof NotifyScene || top instanceof CrawlScene || top instanceof CardScene || (b && b.waitKey)) Input.pressed.a = true;
    }, 30);
  });
  const until = async (fn, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) return true; await page.waitForTimeout(200); } return false; };
  const idle = () => until(() => Game.field && Game.field.busy === 0 && Game.top() === Game.field, 180000);
  const step = async (name, code, check) => {
    await page.evaluate(code);
    await idle();
    const ok = await page.evaluate(check);
    console.log((ok ? 'PASS ' : 'FAIL ') + name);
    if (out) await page.screenshot({ path: path.join(out, 'story_' + name + '.png') });
  };
  const lv = n => `for (const m of Game.state.party) { m.lvl = ${n}; m.exp = EXP_TABLE[${n}]; for (const j of JOB_ORDER) m.jobs[j].lv = Math.max(m.jobs[j].lv, Math.min(MAX_JOB_LV, Math.floor(${n} / 3))); const st = stats(m); m.hp = st.mhp; m.mp = st.mmp; }`;
  await page.evaluate(() => newGame());
  await until(() => Game.field && Game.field.map && Game.field.map.id === 'solanthia' && Game.top() === Game.field, 120000);
  console.log('PASS opening (barge + battle) ->', await page.evaluate(() => Game.field.map.id));
  await step('audience', `Game.field.enterMap('temple', 10, 3, 'up'); Game.field.run(() => vesperAudience());`, `flag('audience') && hasKey('censer')`);
  await step('leave_blocked', `Game.field.enterMap('solanthia', 14, 17, 'down'); Game.field.run(() => leaveSolanthia());`, `Game.field.map.id === 'solanthia'`);
  await step('night', `Game.field.enterMap('quarters', 5, 4, 'up'); Game.field.run(() => quartersNight());`, `flag('mission')`);
  await step('veilstag', `${lv(8)} Game.field.enterMap('silverleaf2', 10, 4, 'left'); Game.field.run(() => veilstagEvent());`, `flag('stag') && hasKey('stagantler')`);
  await step('hollowmere', `${lv(10)} Game.field.enterPlace({ map: 'hollowmere' });`, `flag('votary') && Game.state.party.length === 3 && Game.field.map.id === 'hollowash'`);
  await step('reaper', `Game.field.run(() => ashShrine());`, `Game.state.jobsOpen.includes('reaper')`);
  await step('solanthia_gate', `Game.field.enterMap('world', 27, 12, 'up'); Game.field.run(() => Game.field.enterPlace(WORLD.places['27,11']));`, `Game.field.map.id === 'world'`);
  await step('bridge', `Game.field.enterMap('goldengrove', 13, 16, 'up'); Game.field.run(() => bridgeEvent());`, `flag('bridge')`);
  await step('harbor', `Game.field.enterMap('brightwater', 2, 9, 'right'); Game.field.run(() => grellEvent());`, `flag('harbor') && hasKey('harborpass')`);
  await step('tidecaller', `Game.field.run(() => thalaraShrine());`, `Game.state.jobsOpen.includes('tidecaller')`);
  const gear = (r, m, v) => `Object.assign(member('raine').equip, ${JSON.stringify(r)}); Object.assign(member('miasma').equip, ${JSON.stringify(m)}); Object.assign(member('verai').equip, ${JSON.stringify(v)}); Game.state.items.hitonic = 4; Game.state.items.emberplume = 2;`;
  await step('chimera', `${gear({ weapon: 'dawnblade', head: 'ironhelm', body: 'chainmail' }, { weapon: 'handaxe', head: 'ironhelm', body: 'brigandine' }, { weapon: 'dawnstaff', head: 'featherhat', body: 'sagerobe' })} ${lv(16)} Game.field.enterMap('tower3', 8, 6, 'up'); Game.field.run(() => chimeraEvent());`, `flag('chimera') && Game.state.jobsOpen.includes('wyrmblood')`);
  await step('wren', `Game.field.enterMap('brightwater', 24, 7, 'right'); Game.field.run(() => grellEvent());`, `flag('wren') && Game.state.ship && Game.state.ship.x === 55`);
  await step('jobchange', `for (const m of Game.state.party) changeJob(m, 'wyrmblood');`, `Game.state.party.every(m => m.job === 'wyrmblood')`);
  await step('colossus', `${gear({ weapon: 'gravecleaver', head: 'sunhelm', body: 'platemail' }, { weapon: 'tidespear', head: 'sunhelm', body: 'platemail' }, { weapon: 'sagerod', head: 'circlet', body: 'sagerobe' })} ${lv(20)} for (const m of Game.state.party) changeJob(m, m.id === 'verai' ? 'arcanist' : 'reaper'); Game.field.enterMap('embrace2', 12, 7, 'up'); Game.field.run(() => colossusEvent());`, `flag('colossus') && flag('ch1end')`);
  console.log('errors:', errors.length ? errors.join('\n---\n') : 'none');
  await browser.close();
})();
