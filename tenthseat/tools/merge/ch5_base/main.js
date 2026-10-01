'use strict';
// ---------------------------------------------------------------------------
// Title screen, new game / continue, boot
// ---------------------------------------------------------------------------
class TitleScene {
  constructor() {
    this.opaque = true; this.t = 0;
    const save = hasSave();
    this.menu = new ListMenu([{ text: 'New Game' }, { text: 'Continue', disabled: !save }, { text: 'Watch Trailer' }], { x: 360, y: 430, w: 240, rowH: 36 });
    this.menu.index = save ? 1 : 0;
  }
  enter() { Audio2.music('title'); }
  update() {
    this.t++;
    if (this.t < 20) return;
    const r = this.menu.update();
    if (r && r.select) { if (r.index === 0) newGame(); else if (r.index === 1) continueGame(); else playTrailer().then(() => Audio2.music('title')); }
  }
  draw() {
    drawStars('#05030c', '#2a1030');
    const son = IMG.b_sonia;
    if (IMG.title_bg) ctx.drawImage(IMG.title_bg, 0, 0, W, H);
    else if (son) { ctx.globalAlpha = 0.18 + 0.05 * Math.sin(this.t / 50); ctx.drawImage(son, W / 2 - son.width * 0.9, 20, son.width * 1.8, son.height * 1.8); ctx.globalAlpha = 1; }
    // the ten seats: a ring of flames, one of them guttering
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i / 10 * Math.PI * 2, x = W / 2 + Math.cos(a) * 250, y = 170 + Math.sin(a) * 80;
      const dim = i === 9, f = 0.6 + 0.4 * Math.sin(this.t / (dim ? 7 : 20) + i);
      ctx.fillStyle = dim ? `rgba(160,90,255,${0.3 * f})` : `rgba(255,${180 + i * 6},80,${0.5 * f + 0.3})`;
      ctx.fillRect(x - 3, y - 8 * f, 6, 10 * f); ctx.fillRect(x - 1, y - 12 * f, 2, 4 * f);
    }
    const glow = 0.6 + 0.4 * Math.sin(this.t / 40);
    ctx.save(); ctx.shadowColor = `rgba(255,200,80,${glow})`; ctx.shadowBlur = 24;
    text('THE TENTH SEAT', W / 2, 140, '#ffe070', 38, 'center'); ctx.restore();
    text('A Tale of Cael\'Brithar', W / 2, 196, '#c8c8ff', 14, 'center');
    text('Chapter One: The Unseated', W / 2, 222, '#a0a0d0', 12, 'center');
    ['miasma', 'raine', 'verai'].forEach((id, i) => { const img = IMG[HEROES[id].img]; if (!img) return; const x = 250 + i * 230, bob = Math.sin(this.t / 30 + i) * 3; ctx.drawImage(img, Math.round(x - img.width / 2), Math.round(420 - img.height + bob)); });
    this.menu.draw();
    text('Arrows: move   Z: confirm   X: cancel/menu   Shift: run', W / 2, 590, '#8888aa', 12, 'center');
    if (!Audio2.ac) text('(press any key for sound)', W / 2, 612, '#666688', 10, 'center');
  }
}
function toTitle() { Game.field = null; Game.replaceAll(new TitleScene()); Game.fade = 0; }
async function newGame() {
  Game.state = newState();
  Game.replaceAll({ opaque: true, draw() { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); } });
  await openingCrawl();
  const f = new FieldScene(); Game.field = f;
  Game.replaceAll(f);
  Game.fade = 1;
  f.enterMap('barge', 7, 6, 'up');
  fadeIn(40);
}
function continueGame() {
  const s = loadSave(); if (!s) return;
  Game.state = migrateSave(s);
  const f = new FieldScene(); Game.field = f;
  Game.replaceAll(f);
  f.enterMap(s.map, s.x, s.y, s.dir);
  Game.fade = 1;
  // A finished Chapter One save rolls straight into Chapter Two
  if (flag('ch1done') && !flag('ch2start') && typeof chapter2Opening === 'function') f.run(() => chapter2Opening());
  else if (flag('ch2done') && !flag('ch3start') && typeof chapter3Opening === 'function') f.run(() => chapter3Opening());
  else if (flag('ch3done') && !flag('ch4start') && typeof chapter4Opening === 'function') f.run(() => chapter4Opening());
  else if (flag('ch4done') && !flag('ch5start') && typeof chapter5Opening === 'function') f.run(() => chapter5Opening());
  else fadeIn(30);
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
  canvas.addEventListener('pointerdown', () => { Audio2.unlock(); Input.down('a'); setTimeout(() => Input.up('a'), 60); });
  const dbg = document.getElementById('dbg'); if (dbg) dbg.addEventListener('click', e => { e.preventDefault(); Audio2.unlock(); openDebug(); dbg.blur(); });
}

(async function boot() {
  setupTouch();
  try { await Promise.race([document.fonts.load(`16px ${FONT}`), new Promise(r => setTimeout(r, 2500))]); } catch (e) { }
  await loadAssets();
  requestAnimationFrame(loop);
  // "Press any key" first, so the trailer can play with sound
  await new Promise(res => Game.push({ opaque: true, t: 0,
    update() { this.t++; if (this.t > 10 && (Input.ok() || Input.hit('b') || Input.hit('menu') || Input.dir())) { Game.pop(this); res(); } },
    draw() { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); if (Math.floor(this.t / 30) % 2 === 0) text('PRESS ANY KEY', W / 2, H / 2 - 10, '#ffe070', 18, 'center'); text('(or tap the screen)', W / 2, H / 2 + 26, '#6a6a8a', 10, 'center'); } }));
  Audio2.unlock();
  await playTrailer();
  Game.replaceAll(new TitleScene());
})();
