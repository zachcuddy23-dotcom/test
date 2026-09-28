// Drives the real game in headless Chromium and saves screenshots.
const { chromium } = require('playwright');
const path = require('path');
const out = process.argv[2] || '.';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html'));
  await page.waitForTimeout(1500);
  const snap = async n => { await page.screenshot({ path: path.join(out, n + '.png') }); };
  const key = async (k, n = 1, gap = 60) => { for (let i = 0; i < n; i++) { await page.keyboard.down(k); await page.waitForTimeout(40); await page.keyboard.up(k); await page.waitForTimeout(gap); } };
  await snap('01_title');
  await key('KeyZ'); await page.waitForTimeout(800); await snap('02_crawl');
  await key('KeyZ'); await page.waitForTimeout(1500); await snap('03_barge');
  // advance dialog until battle
  for (let i = 0; i < 40; i++) { const inBattle = await page.evaluate(() => Game.top() instanceof BattleScene); if (inBattle) break; await key('KeyZ', 1, 150); }
  await page.waitForTimeout(2500); await snap('04_battle');
  // fight: mash Z (attack first enemy)
  for (let i = 0; i < 200; i++) { const inBattle = await page.evaluate(() => Game.scenes.some(s => s instanceof BattleScene)); if (!inBattle) break; await key('KeyZ', 1, 120); if (i === 12) await snap('05_battle_mid'); }
  for (let i = 0; i < 30; i++) { const f = await page.evaluate(() => Game.field && Game.field.map.id === 'solanthia' && Game.top() === Game.field); if (f) break; await key('KeyZ', 1, 150); }
  await page.waitForTimeout(800); await snap('06_solanthia');
  await page.evaluate(() => { Game.state.jobsOpen = JOB_ORDER.slice(); });
  await key('Escape'); await page.waitForTimeout(400); await snap('07_menu');
  await key('ArrowDown', 2); await key('KeyZ'); await key('KeyZ'); await page.waitForTimeout(300); await snap('08_job');
  await key('KeyX'); await key('KeyX'); await key('KeyX');
  // jump to a boss battle for a screenshot
  await page.evaluate(() => { const m = addMember('verai'); startBattle({ enemies: ['votary'], boss: true, bg: 'burning', music: 'boss' }); });
  await page.waitForTimeout(3500); await snap('09_boss');
  for (let i = 0; i < 6; i++) await key('KeyZ', 1, 200);
  await page.waitForTimeout(600); await snap('10_boss2');
  await page.evaluate(() => { Game.scenes = Game.scenes.filter(s => !(s instanceof BattleScene)); Game.fade = 0; Game.state.flags.votary = true; Game.field.enterMap('world', 20, 14, 'down'); });
  await page.waitForTimeout(800); await snap('11_world');
  await page.evaluate(() => { Game.field.enterMap('hollowash', 12, 8, 'up'); });
  await page.waitForTimeout(800); await snap('12_ash');
  await page.evaluate(() => { Game.field.enterMap('embrace2', 12, 10, 'up'); });
  await page.waitForTimeout(800); await snap('13_embrace');
  await page.evaluate(() => { Game.field.enterMap('tower3', 8, 7, 'up'); });
  await page.waitForTimeout(800); await snap('14_tower');
  console.log('errors:', JSON.stringify(errors, null, 1));
  await browser.close();
})();
