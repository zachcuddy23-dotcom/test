'use strict';
// ---------------------------------------------------------------------------
// Title screen, new game / continue, boot
// ---------------------------------------------------------------------------
class TitleScene {
  constructor() {
    this.opaque = true; this.t = 0;
    const save = hasSave();
    this.menu = new ListMenu([{ text: 'New Game' }, { text: 'Continue', disabled: !save }], { x: 360, y: 430, w: 240, rowH: 40 });
    this.menu.index = save ? 1 : 0;
  }
  enter() { Audio2.music('prelude'); }
  update() {
    this.t++;
    if (this.t < 20) return;
    const r = this.menu.update();
    if (r && r.select) { if (r.index === 0) newGame(); else continueGame(); }
  }
  draw() {
    drawStars();
    const glow = 0.6 + 0.4 * Math.sin(this.t / 40);
    ctx.save(); ctx.shadowColor = `rgba(255,200,80,${glow})`; ctx.shadowBlur = 24;
    text('SHARDS OF THE DAWN', W / 2, 90, '#ffe070', 34, 'center'); ctx.restore();
    text('Chapter I', W / 2, 146, '#c8c8ff', 16, 'center');
    const ids = ['miasma', 'verai', 'raine'];
    ids.forEach((id, i) => { const img = IMG[HEROES[id].img]; if (!img) return; const x = 250 + i * 230, bob = Math.sin(this.t / 30 + i) * 3; ctx.drawImage(img, Math.round(x - img.width / 2), Math.round(390 - img.height + bob)); text(HEROES[id].name, x, 396, '#fff', 12, 'center'); });
    this.menu.draw();
    text('Arrows: move   Z: confirm   X: cancel/menu   Shift: run', W / 2, 600, '#8888aa', 12, 'center');
    if (!Audio2.ac) text('(press any key for sound)', W / 2, 620, '#666688', 10, 'center');
  }
}
function toTitle() { Game.field = null; Game.replaceAll(new TitleScene()); Game.fade = 0; }
async function newGame() {
  Game.state = newState();
  const f = new FieldScene(); Game.field = f;
  Game.replaceAll(f);
  f.busy++;
  f.enterMap('world', 15, 21, 'up');
  Audio2.music('prelude');
  Game.fade = 1;
  await crawl([
    'The world is going dark.',
    '',
    'The four Dawn Crystals, which keep the',
    'wind, sea, earth and fire in balance,',
    'have begun to dim.',
    '',
    'A black miasma creeps across the land.',
    'The seas churn. Monsters walk the roads.',
    '',
    'In the kingdom of Cindral, three travelers',
    'meet on the road outside town...',
  ], { speed: 0.7 });
  Audio2.music('field');
  await fadeIn(40);
  await say(HERO('miasma'), "Cindral. The job board said the king is hiring. Big reward, no questions asked.");
  await say(HERO('raine'), "When a king pays that much, the kingdom is in trouble. And the job's usually worse than the pay.");
  await say(HERO('verai'), "Then someone needs help. Let's at least hear him out. The castle is just north of the town.");
  await say(null, "Tip: Press X or Esc for the menu. Talk to people and open chests with Z. Buy gear in town before you head out!");
  f.busy--;
}
function continueGame() {
  const s = loadSave(); if (!s) return;
  Game.state = s;
  const f = new FieldScene(); Game.field = f;
  Game.replaceAll(f);
  f.enterMap(s.map, s.x, s.y, s.dir);
  Game.fade = 1; fadeIn(30);
}

// ---------------------------------------------------------------------------
// Touch controls
// ---------------------------------------------------------------------------
function setupTouch() {
  const el = document.getElementById('touch'); if (!el) return;
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (coarse) document.body.classList.add('touch');
  el.querySelectorAll('[data-btn]').forEach(b => {
    const btn = b.dataset.btn;
    const on = e => { e.preventDefault(); Audio2.unlock(); Input.down(btn); b.classList.add('on'); };
    const off = e => { e.preventDefault(); Input.up(btn); b.classList.remove('on'); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
  });
  canvas.addEventListener('pointerdown', () => Audio2.unlock());
}

(async function boot() {
  setupTouch();
  try { await Promise.race([document.fonts.load(`16px ${FONT}`), new Promise(r => setTimeout(r, 2500))]); } catch (e) { }
  await loadAssets();
  Game.push(new TitleScene());
  requestAnimationFrame(loop);
})();
