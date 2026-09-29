// Visits every world place, exit, door and warp through the real game code and
// checks the screen comes back (fade 0, field on top, no errors).
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html'));
  await page.waitForTimeout(1200);
  for (let i = 0; i < 400 && !(await page.evaluate(() => Game.top() instanceof TitleScene)); i++) await page.evaluate(() => { Input.pressed.a = true; }), await page.waitForTimeout(30);
  await page.evaluate(() => { Game.state = newState(); for (const f of ['intro','audience','mission','stag','votary','pass','bridge','harbor','chimera','wren','noEnc','lunaJoin','ch1end','ch1done','ch2start','emberGate','trialWon','gunworks','draumond','ferryman','coalToken','chainJob','lunaEmberDone','athenaeum','ch3start','ch3sick','ch3doctor','ch3cured','ch3herb','ch3summit','ch3confessed']) Game.state.flags[f] = true; Game.state.keys.push('harborpass', 'gunpass', 'deathpage'); const f = new FieldScene(); Game.field = f; Game.replaceAll(f); f.enterMap('world', 20, 14, 'down'); Game.fade = 0;
    setInterval(() => { const t = Game.top(); if (t instanceof DialogScene || t instanceof NotifyScene) Input.pressed.a = true; }, 50); });
  const cases = await page.evaluate(() => {
    const out = [];
    for (const [k, p] of Object.entries(WORLD.places)) out.push({ kind: 'place', k, w: 'world' });
    for (const [id, m] of Object.entries(MAPS)) if (m.world) for (const k of Object.keys(m.places)) out.push({ kind: 'place', k, w: id });
    for (const [id, m] of Object.entries(MAPS)) {
      if (m.world) continue;
      prepMap(id);
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
        const c = m._grid[y][x], t = IN_TILES[c] || {};
        if (t.exit) out.push({ kind: 'exit', id, x, y, c });
        if (t.stairs && m.warps && m.warps[c]) out.push({ kind: 'warp', id, x, y, c });
        if (c === '+' && m.doors && m.doors[x + ',' + y]) out.push({ kind: 'door', id, x, y, c });
      }
    }
    return out;
  });
  let bad = 0;
  for (const cs of cases) {
    await page.evaluate(cs => {
      const f = Game.field; Game.fade = 0;
      if (cs.kind === 'place') { const [x, y] = cs.k.split(',').map(Number); S().onShip = false; f.enterMap(cs.w, x, y + 1, 'up'); S().x = x; S().y = y; f.arrive(); }
      else { f.enterMap(cs.id, cs.x, cs.y, 'down'); f.arrive(); }
    }, cs);
    await page.waitForTimeout(900);
    const st = await page.evaluate(() => ({ fade: Game.fade, top: Game.top() === Game.field, map: Game.field.map.id, busy: Game.field.busy, errs: Game.errors.length }));
    const from = cs.kind === 'place' ? cs.w : cs.id;
    const gated = cs.kind === 'place' && ((cs.w === 'world' && cs.k === '27,11') || (cs.w === 'frostreach' && ['18,4', '11,22', '33,19'].includes(cs.k))); // story-gated on purpose // Solanthia's gate refuses entry after Hollowmere, on purpose
    const ok = st.fade === 0 && st.top && st.busy === 0 && (gated || st.map !== from) && st.errs === 0;
    if (!ok) { bad++; console.log('BAD', JSON.stringify(cs), JSON.stringify(st)); }
  }
  console.log(cases.length, 'transitions,', bad, 'bad; errors:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
