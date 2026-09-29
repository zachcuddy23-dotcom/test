// Plays the second half of Chapter Three (the pass, the Undercity, the trial, the aftermath) in headless
// Chromium, starting from a save made on the "The Wyrmspire" screen.
// usage: NODE_PATH=$(npm root -g) node tools/check/story3b.js <stay|doubt|cold|waits> <0|1|2 = Raine's choice> [screenshotDir]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const vs = process.argv[2] || 'stay', choice = +(process.argv[3] || 0), out = process.argv[4];
const AI = fs.readFileSync(path.join(__dirname, 'sim.js'), 'utf8').match(/const AI = `([\s\S]*?)`;/)[1];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message + '\n' + e.stack));
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html'));
  await page.waitForTimeout(1200);
  await page.addScriptTag({ content: AI + '\nwindow.aiPick = aiPick;' });
  await page.evaluate(c => {
    window.__pick = { 'Miasma is standing there': c }; window.__saveScreen = 0;
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
  }, choice);
  const until = async (fn, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) return true; await page.waitForTimeout(200); } return false; };
  const idle = () => until(() => Game.field && Game.field.busy === 0 && Game.top() === Game.field && !Game.field.moving, 300000);
  let fails = 0;
  const check = async (name, cond) => { const ok = await page.evaluate(cond); if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + name); if (out) await page.screenshot({ path: path.join(out, `story3b_${vs}_${name}.png`) }); };
  const step = async (name, code, cond) => { await page.evaluate(code); await idle(); await check(name, cond); };
  const heal = `for (const m of S().party) { m.status = {}; const s2 = stats(m); m.hp = s2.mhp; m.mp = s2.mmp; } Object.assign(S().items, { megatonic: 6, warmdraught: 5, hiether: 4, emberplume: 4, echomint: 4 });`;
  await until(() => { Input.pressed.a = true; return Game.top() instanceof TitleScene; }, 60000);

  // the save the player made on "The Wyrmspire" screen
  await page.evaluate(vs => {
    const st = newState();
    const ids = vs === 'stay' ? ['raine', 'miasma', 'verai', 'luna'] : ['raine', 'miasma', 'luna', 'brakka'];
    st.party = ids.map(id => makeMember(id, 32));
    st.bench = vs === 'stay' ? [makeMember('brakka', 31)] : [];
    const job = { raine: 'reaper', miasma: 'dragon', verai: 'arcanist', luna: 'oathblade', brakka: 'freelancer' };
    const gear = { raine: { weapon: 'rimeaxe', head: 'frosthelm', body: 'wyrmmail' }, miasma: { weapon: 'skyclaws', head: 'frosthelm', body: 'wyrmmail' }, luna: { weapon: 'frostbrand', head: 'frosthelm', body: 'wyrmmail' }, verai: { weapon: 'frostrod', head: 'furhood', body: 'frostrobe' }, brakka: { weapon: 'handcannon', head: 'furhood', body: 'snowcoat' } };
    for (const m of [...st.party, ...st.bench]) { for (const j in m.jobs) m.jobs[j].lv = 8; m.jobs.dragon.lv = 6; m.job = job[m.id]; Object.assign(m.equip, gear[m.id]); const s2 = stats(m); m.hp = s2.mhp; m.mp = s2.mmp; }
    const base = ['intro', 'audience', 'mission', 'stag', 'votary', 'pass', 'arrived', 'bridge', 'lunaJoin', 'harbor', 'chimera', 'wren', 'colossus', 'ch1end', 'ch1done', 'lunaRevealed', 'sanctuarySunk', 'ch2start', 'emberGate', 'trialWon', 'chainJob', 'coalToken', 'gunworks', 'draumond', 'ferryman', 'ashkarAlly', 'ch2end', 'ch2done',
      'ch3start', 'ch3sick', 'ch3doctor', 'ch3confessed', 'ch3m1', 'ch3m2', 'ch3m3', 'ch3m4', 'ch3nest', 'ch3helm', 'ch3toy', 'ch3yeti', 'ch3summit', 'ch3told', 'ch3rime', 'ch3herb', 'ch3cured', 'leaderUnlocked', 'ch3part1'];
    for (const f of base) st.flags[f] = true;
    Object.assign(st.flags, { stay: { veraiStayed: true }, doubt: { veraiSonia: true, veraiDoubt: true }, cold: { veraiSonia: true, veraiCold: true }, waits: { veraiLeft: true, veraiWaits: true } }[vs]);
    st.flags.bond = 3; st.keys = ['harborpass', 'wrenkey', 'gunpass', 'dentedhelm', 'toydragon'];
    st.jobsOpen.push('reaper', 'tidecaller', 'wyrmblood', 'chainbearer', 'phoenix', 'dragon');
    st.map = 'clinic'; st.x = 6; st.y = 5; st.dir = 'up'; st.gold = 40000;
    localStorage.setItem(SAVE_KEY, JSON.stringify(st));
  }, vs);
  await page.evaluate(() => continueGame());
  await idle();
  await check('continue_from_wyrmspire_save', `Game.field.map.id === 'clinic' && member('raine') && !flag('ch3done')`);
  await step('pass_opens', `${heal} Game.field.enterMap('frostreach', 32, 19, 'right'); Game.field.run(() => Game.field.enterPlace(MAPS.frostreach.places['33,19']));`, `Game.field.map.id === 'pass1' && flag('ch3pass')`);
  await step('avalanche', `Game.field.enterMap('pass1', 11, 5, 'down'); Game.field.run(() => avalancheMoment());`, `flag('ch3aval')`);
  await step('inquisitor', `${heal} Game.field.enterMap('pass2', 11, 11, 'down'); Game.field.run(() => inquisitorEvent());`, `flag('ch3inq')`);
  await step('out_onto_aurelion', `Game.field.enterMap('pass2', 11, 14, 'down'); Game.field.tryMove('down');`, `Game.field.map.id === 'world' && S().x === 23 && S().y === 6`);
  await step('solanthia_sealed_undercity', `S().onShip = false; Game.field.enterMap('world', 27, 12, 'up'); Game.field.run(() => Game.field.enterPlace(WORLD.places['27,11']));`, `Game.field.map.id === 'undercity1' && flag('ch3undercity')`);
  // stand in a sentry's line of sight: the sentries notice, and there's a fight
  await page.evaluate(heal => eval(heal), heal);
  for (let i = 0; i < 400 && !(await page.evaluate(() => Game.field.npcs.some(n => n.out) && Game.field.busy === 0 && Game.top() === Game.field)); i++) {
    await page.evaluate(() => { const f = Game.field; if (f.busy) return; const n = f.visibleNpcs().find(q => q.def.sight && !q.mv && f.sightTiles(q).length); if (n) { const t = f.sightTiles(n)[0]; S().x = t[0]; S().y = t[1]; } });
    await page.waitForTimeout(500);
  }
  await check('spotted_by_sentry', `Game.field.npcs.some(n => n.out) && Game.field.map.id === 'undercity1'`);
  await step('undercity2', `Game.field.enterMap('undercity2', 1, 13, 'right');`, `Game.field.map.id === 'undercity2'`);
  await step('cells_reunion_to_trial', `${heal} Game.field.enterMap('cells', 9, 8, 'up');`, `flag('ch3cells') && hasKey('dawnguardkit')`);
  await until(() => flag('ch3done') && Game.field && Game.field.map.id === 'world' && Game.field.busy === 0 && Game.top() === Game.field, 400000);
  await check('trial_aftermath_end', `flag('ch3trial') && flag('ch3done') && member('odeaon') && S().party.length <= 4 && S().onShip && window.__saveScreen > 0 && flag(['raineAnger', 'raineSilent', 'raineWhy'][${choice}])`);
  await check('verai_outcome', { stay: `!!member('verai') || S().bench.some(m => m.id === 'verai')`, doubt: `flag('veraiHelped') && !member('verai')`, cold: `!flag('veraiHelped') && !member('verai')`, waits: `flag('veraiReturned') && (member('verai') || S().bench.some(m => m.id === 'verai'))` }[vs]);
  await check('toy_dragon_given', `flag('ch3toyGiven') && !hasKey('toydragon')`);
  await check('party_menu_on_world', `S().bench.length === 0 || new MenuScene().root.items.some(i => i.text === 'Party')`);
  console.log('state:', await page.evaluate(() => JSON.stringify({ party: S().party.map(m => [m.id, m.lvl]), bench: S().bench.map(m => m.id), trust: S().flags.motherTrust })));
  console.log('errors:', errors.length ? errors.join('\n---\n') : 'none');
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  await browser.close();
})();
