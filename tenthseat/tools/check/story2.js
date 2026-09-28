// Plays Chapter Two in headless Chromium, starting from a finished Chapter One save file.
// usage: node story2.js <stay|leave|sonia> [alt] [screenshotDir]
//   alt = pick the second option at every choice (bribe instead of combat is always tested separately)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const vs = process.argv[2] || 'stay', alt = process.argv[3] === 'alt', out = process.argv[4];
const AI = fs.readFileSync(path.join(__dirname, 'sim.js'), 'utf8').match(/const AI = `([\s\S]*?)`;/)[1];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message + '\n' + e.stack));
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html'));
  await page.waitForTimeout(1200);
  await page.addScriptTag({ content: AI + '\nwindow.aiPick = aiPick;' });
  await page.evaluate(alt => {
    window.__pick = {}; // dialog text fragment -> choice index
    window.__alt = alt;
    setInterval(() => {
      const b = Game.scenes.find(s => s instanceof BattleScene);
      if (b && b.ui && b.ui.kind === 'cmd') { b.setCmd(b.ui.m, aiPick(b, b.ui.m)); return; }
      const top = Game.top();
      if (top instanceof DialogScene && top.menu) {
        const hit = Object.keys(window.__pick).find(k => JSON.stringify(top).includes(k));
        top.menu.index = hit ? window.__pick[hit] : (window.__alt ? Math.min(1, top.menu.items.length - 1) : 0);
        Input.pressed.a = true; return;
      }
      if (top && top.saved !== undefined && top.menu) { window.__saveScreen = (window.__saveScreen || 0) + 1; Input.pressed.a = true; return; }
      if (top instanceof DialogScene || top instanceof NotifyScene || top instanceof CrawlScene || top instanceof CardScene || (b && b.waitKey)) Input.pressed.a = true;
    }, 30);
  }, alt);
  const until = async (fn, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) return true; await page.waitForTimeout(200); } return false; };
  const idle = () => until(() => Game.field && Game.field.busy === 0 && Game.top() === Game.field, 240000);
  let fails = 0;
  const step = async (name, code, check) => {
    await page.evaluate(code);
    await idle();
    const ok = await page.evaluate(check);
    if (!ok) fails++;
    console.log((ok ? 'PASS ' : 'FAIL ') + name);
    if (out) await page.screenshot({ path: path.join(out, `story2_${vs}_${name}.png`) });
  };
  const lv = n => `for (const m of Game.state.party) { m.lvl = ${n}; m.exp = EXP_TABLE[${n}]; for (const j of JOB_ORDER) if (m.jobs[j]) m.jobs[j].lv = Math.max(m.jobs[j].lv, Math.min(MAX_JOB_LV, Math.floor(${n} / 3))); const st = stats(m); m.hp = st.mhp; m.mp = st.mmp; }`;
  await until(() => { Input.pressed.a = true; return Game.top() instanceof TitleScene; }, 60000);
  // Build a Chapter One save the way Chapter One left it: old job table (no Chapter Two jobs), ch1done set.
  await page.evaluate(vs => {
    const st = newState();
    const ids = vs === 'stay' ? ['raine', 'miasma', 'verai', 'luna'] : ['raine', 'miasma', 'luna'];
    st.party = ids.map(id => makeMember(id, 20));
    const gear = { raine: ['reaper', { weapon: 'gravecleaver', head: 'sunhelm', body: 'platemail' }], miasma: ['wyrmblood', { weapon: 'tidespear', head: 'sunhelm', body: 'platemail' }], luna: ['oathblade', { weapon: 'dawnblade', head: 'sunhelm', body: 'platemail' }], verai: ['arcanist', { weapon: 'sagerod', head: 'circlet', body: 'sagerobe' }] };
    for (const m of st.party) { delete m.jobs.chainbearer; delete m.jobs.phoenix; for (const j in m.jobs) m.jobs[j].lv = 6; m.job = gear[m.id][0]; Object.assign(m.equip, gear[m.id][1]); const s2 = stats(m); m.hp = s2.mhp; m.mp = s2.mmp; }
    st.items = { hitonic: 6, megatonic: 4, emberplume: 3, ether: 3, ashsalve: 3 };
    for (const f of ['intro', 'audience', 'mission', 'stag', 'votary', 'pass', 'arrived', 'bridge', 'lunaJoin', 'harbor', 'chimera', 'wren', 'colossus', 'ch1end', 'ch1done', 'lunaRevealed']) st.flags[f] = true;
    st.flags[{ stay: 'veraiStayed', leave: 'veraiLeft', sonia: 'veraiSonia' }[vs]] = true;
    st.flags.bond = 3; st.flags.lunaCaught = 4;
    st.jobsOpen.push('reaper', 'tidecaller', 'wyrmblood');
    st.keys = ['harborpass', 'wrenkey']; st.ship = { x: 40, y: 33 };
    st.map = 'embrace2'; st.x = 12; st.y = 9; st.dir = 'up'; st.gold = 4000;
    delete st.cfg; // very old saves may not have it
    localStorage.setItem(SAVE_KEY, JSON.stringify(st));
  }, vs);
  await page.evaluate(() => continueGame());
  await until(() => Game.field && Game.field.map && Game.field.map.id === 'emberport' && Game.top() === Game.field, 240000);
  console.log((await page.evaluate(() => flag('ch2start') && flag('sanctuarySunk') && S().party.every(m => m.jobs.phoenix))) ? 'PASS' : 'FAIL', 'ch1 save -> sanctuary falls -> emberport');
  await step('luna_emberport', `Game.field.run(() => lunaEmberport());`, `flag('lunaEmberDone')`);
  await step('gate_not_yet', `window.__pick = { 'How do you get through': 2 }; Game.field.run(() => emberGateEvent());`, `!flag('emberGate')`);
  if (alt) await step('gate_bribe', `window.__pick = { 'How do you get through': 0 }; Game.field.run(() => emberGateEvent());`, `flag('bribed') && flag('emberGate') && S().gold === 1000`);
  else await step('gate_trial', `${lv(21)} window.__pick = { 'How do you get through': 1 }; Game.field.run(() => emberGateEvent());`, `flag('trialWon') && flag('emberGate')`);
  await page.evaluate(() => { window.__pick = {}; });
  await step('zariel', `Game.field.run(() => zarielShrine());`, `flag('chainJob') && Game.state.jobsOpen.includes('chainbearer')`);
  await step('world_exit', `Game.field.enterMap('ashkar', 24, 30, 'down');`, `Game.field.map.id === 'ashkar'`);
  await step('charnoch', `Game.field.enterMap('charnoch', 12, 14, 'up'); Game.field.run(() => charnochToken());`, `flag('coalToken')`);
  await step('brakka', `${lv(23)} Game.field.enterMap('kharakyr', 13, 16, 'up'); Game.field.run(() => brakkaEvent());`, vs === 'stay' ? `hasKey('gunpass') && member('brakka') && S().bench.length === 1 && S().party.length === 4` : `hasKey('gunpass') && member('brakka')`);
  await step('brakka_again', `Game.field.run(() => brakkaEvent());`, vs === 'stay' ? `member('verai') && S().bench.length === 1 && S().party.length === 4 && Game.field.visibleNpcs().some(n => n.key === '4' && n.def.look === HEROES[S().bench[0].id].look)` : `member('brakka') && !Game.field.visibleNpcs().some(n => n.key === '4')`);
  await step('gunworks_enter', `Game.field.run(() => enterGunworks());`, `Game.field.map.id === 'gunworks1'`);
  await step('cannon', `${lv(24)} Game.field.enterMap('gunworks2', 10, 7, 'up'); Game.field.run(() => cannonEvent());`, `flag('gunworks') && (flag('tookPowder') || flag('blewPowder'))`);
  await step('book', `${lv(25)} Game.field.enterMap('draumond', 13, 16, 'up'); Game.field.run(() => bookOfTheDead());`, `flag('draumond') && hasKey('deathpage')`);
  await step('ferryman', `${lv(26)} Game.field.enterMap('terminus2', 10, 7, 'up'); Game.field.run(() => ferrymanEvent());`, `flag('ferryman') && hasKey('anvilshard')`);
  await step('throne', `${lv(28)} Object.assign(Game.state.items, { megatonic: 5, emberplume: 3, hiether: 3 }); window.__saveScreen = 0; Game.field.enterMap('cinders', 10, 7, 'up'); Game.field.run(() => throneEvent());`, `flag('ch2end') && flag('ch2done') && Game.state.jobsOpen.includes('phoenix') && window.__saveScreen > 0`);
  console.log('choices:', await page.evaluate(() => JSON.stringify({ party: S().party.map(m => m.id), flags: Object.keys(S().flags).filter(k => S().flags[k] && !['intro', 'audience', 'mission', 'stag', 'votary', 'pass', 'arrived', 'bridge', 'lunaJoin', 'harbor', 'chimera', 'wren', 'colossus'].includes(k)) })));
  console.log('errors:', errors.length ? errors.join('\n---\n') : 'none');
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  await browser.close();
})();
