'use strict';
// ---------------------------------------------------------------------------
// Cutscene acting (FF4-style): characters on the map walk, turn, hop, shake
// their heads, nod, laugh, tremble, kneel, collapse and pop emote bubbles.
// Plus letterbox bars, camera pans, and full-screen cinematic shots/trailer.
// ---------------------------------------------------------------------------
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
class Actor {
  constructor(o) {
    Object.assign(this, { ox: 0, oy: 0, dir: 'down', frame: 0, pose: '', alpha: 1, emote: null, trem: 0, spinT: 0 }, o);
    if (!this.name && HEROES[this.id]) this.name = HEROES[this.id].name;
  }
  async walk(dirs, speed = 14) {
    if (typeof dirs === 'string') dirs = [dirs];
    for (const d of dirs) {
      this.dir = d; const [dx, dy] = DIRS[d], x0 = this.x, y0 = this.y; this.leg = !this.leg;
      await tween(speed, k => { this.x = x0 + dx * k; this.y = y0 + dy * k; this.frame = k < 0.5 ? (this.leg ? 1 : 2) : 0; });
      this.x = x0 + dx; this.y = y0 + dy; this.frame = 0;
    }
  }
  async walkTo(x, y, speed = 14) {
    const dirs = [];
    const dx = x - Math.round(this.x), dy = y - Math.round(this.y);
    for (let i = 0; i < Math.abs(dx); i++) dirs.push(dx > 0 ? 'right' : 'left');
    for (let i = 0; i < Math.abs(dy); i++) dirs.push(dy > 0 ? 'down' : 'up');
    await this.walk(dirs, speed);
  }
  face(d) { this.dir = typeof d === 'string' ? d : faceToward(this, d); }
  async hop(h = 18, n = 1) { for (let i = 0; i < n; i++) await tween(12, k => this.oy = -Math.sin(k * Math.PI) * h); this.oy = 0; }
  async surprise() { this.emote = { ch: '!', t: 60 }; Audio2.sfx('surprise'); await this.hop(22); await wait(20); }
  async question() { this.emote = { ch: '?', t: 70 }; Audio2.sfx('cursor'); await wait(30); }
  async shake(n = 2) { const d0 = this.dir; for (let i = 0; i < n; i++) { this.dir = 'left'; await wait(7); this.dir = 'right'; await wait(7); } this.dir = d0; }
  async nod(n = 2) { for (let i = 0; i < n; i++) { await tween(6, k => this.oy = k * 4); await tween(6, k => this.oy = 4 - k * 4); } this.oy = 0; }
  async laugh(n = 4) { this.emote = { ch: '♪', t: 60 }; for (let i = 0; i < n; i++) await tween(8, k => this.oy = -Math.sin(k * Math.PI) * 7); this.oy = 0; }
  async tremble(t = 50) { this.trem = t; await wait(t); }
  async spin(n = 1) { const order = ['down', 'left', 'up', 'right']; for (let i = 0; i < n * 4; i++) { this.dir = order[i % 4]; await wait(5); } this.dir = 'down'; }
  async stepBack(dist = 0.6) { const [dx, dy] = DIRS[OPP[this.dir]], x0 = this.x, y0 = this.y; await tween(10, k => { this.x = x0 + dx * dist * k; this.y = y0 + dy * dist * k; this.oy = -Math.sin(k * Math.PI) * 6; }); this.oy = 0; }
  async lunge() { const [dx, dy] = DIRS[this.dir], x0 = this.x, y0 = this.y; await tween(6, k => { this.x = x0 + dx * 0.4 * k; this.y = y0 + dy * 0.4 * k; }); await tween(10, k => { this.x = x0 + dx * 0.4 * (1 - k); this.y = y0 + dy * 0.4 * (1 - k); }); }
  async kneel() { this.pose = 'kneel'; await wait(12); }
  async fall() { Audio2.sfx('bump'); this.pose = 'down'; await wait(20); }
  async stand() { this.pose = ''; await this.hop(6); }
  async sad(t = 60) { this.emote = { ch: '...', t }; await wait(20); }
  async angry() { this.emote = { ch: 'anger', t: 60 }; Audio2.sfx('error'); await this.tremble(20); }
  async sweat() { this.emote = { ch: 'sweat', t: 60 }; await wait(20); }
  async heart() { this.emote = { ch: '♥', t: 60 }; await wait(20); }
  async idea() { this.emote = { ch: 'idea', t: 60 }; Audio2.sfx('ok'); await this.hop(8); }
  async fadeOut(n = 20) { await tween(n, k => this.alpha = 1 - k); }
  async fadeIn(n = 20) { await tween(n, k => this.alpha = k); }
  say(str) { return say(HEROES[this.id] ? HERO(this.id) : this.name, str); }
}
function faceToward(a, b) { const dx = b.x - a.x, dy = b.y - a.y; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }

// ---- FieldScene extensions --------------------------------------------------
Object.assign(FieldScene.prototype, {
  spawn(o) { this.actors = this.actors || []; const a = new Actor(o); this.actors.push(a); return a; },
  actor(key) { return (this.actors || []).find(a => a.id === key || a.name === key); },
  despawn(a) { this.actors = (this.actors || []).filter(x => x !== a && x.id !== a); },
  // Put the whole party on the map as actors, the leader where the player stands.
  cast(layout, skip) {
    const st = S(); this.hidePlayer = true;
    const behind = DIRS[OPP[st.dir]] || [0, 1];
    const side = [behind[1], behind[0]];
    const spots = [[0, 0], [behind[0] + side[0], behind[1] + side[1]], [behind[0] - side[0], behind[1] - side[1]], [behind[0] * 2, behind[1] * 2]];
    const out = {};
    st.party.filter(m => !(skip || []).includes(m.id)).forEach((m, i) => {
      if (this.actor(m.id)) { out[m.id] = this.actor(m.id); return; }
      // a party member already standing on the map as an NPC plays herself (no clone)
      const npc = this.visibleNpcs().find(n => n.def.look === HEROES[m.id].look && !(this.hideNpc && this.hideNpc.has(n.key)));
      if (npc && !(layout && layout[m.id])) {
        this.hideNpc = this.hideNpc || new Set(); this.hideNpc.add(npc.key);
        out[m.id] = this.spawn({ id: m.id, look: HEROES[m.id].look, x: npc.x, y: npc.y, dir: npc.dir });
        return;
      }
      const p = layout && layout[m.id] ? layout[m.id] : [st.x + spots[i % 4][0], st.y + spots[i % 4][1]];
      out[m.id] = this.spawn({ id: m.id, look: HEROES[m.id].look, x: p[0], y: p[1], dir: (layout && layout[m.id] && layout[m.id][2]) || st.dir });
    });
    return out;
  },
  // Party gathers back into the leader and the player sprite returns.
  async uncast() {
    const st = S(), lead = this.actor(st.party[0].id);
    const others = (this.actors || []).filter(a => HEROES[a.id] && a !== lead);
    await Promise.all(others.map(a => tween(14, k => { a.alpha = 1 - k; })));
    if (lead) { st.x = Math.round(lead.x); st.y = Math.round(lead.y); st.dir = lead.dir; }
    this.actors = (this.actors || []).filter(a => !HEROES[a.id]);
    this.hidePlayer = false;
  },
  async letterbox(on = true) { this.cine = this.cine || { bars: 0 }; const b0 = this.cine.bars; await tween(24, k => this.cine.bars = b0 + ((on ? 1 : 0) - b0) * k); if (!on) this.cine = null; },
  async pan(x, y, n = 40) { const st = S(), from = this.cam || { x: st.x, y: st.y }; this.cam = { x: from.x, y: from.y }; await tween(n, k => { const e = k * k * (3 - 2 * k); this.cam.x = from.x + (x - from.x) * e; this.cam.y = from.y + (y - from.y) * e; }); },
  async panBack(n = 30) { if (!this.cam) return; const st = S(); await this.pan(st.x, st.y, n); this.cam = null; },
  drawActor(a, cx, cy) {
    let x = a.x * TS - cx - 3 + a.ox, y = a.y * TS - cy - 24 + a.oy;
    if (a.trem > 0) { a.trem--; x += (a.trem % 4 < 2 ? -2 : 2); }
    if (Game.speaking && Game.speaking === a.name) y -= Math.floor(Game.frame / 6) % 2 ? 2 : 0;
    const img = chibi(a.look, a.pose === 'down' ? 'down' : a.dir, a.frame, a.pose === 'down' ? 'sleep' : '');
    ctx.save(); ctx.globalAlpha = a.alpha;
    if (a.pose === 'kneel') ctx.drawImage(img, 0, 0, img.width, img.height, x, y + 18, 54, 54);
    else if (a.pose === 'down') { ctx.translate(x + 27, y + 54); ctx.rotate(-Math.PI / 2); ctx.drawImage(img, -30, -27, 54, 72); }
    else ctx.drawImage(img, x, y, 54, 72);
    ctx.restore();
    if (a.emote) { drawEmote(a.emote.ch, x + 27, y - 10, a.emote.t); if (--a.emote.t <= 0) a.emote = null; }
  },
  drawCinemaOverlay() {
    if (this.cine && this.cine.bars > 0) { const h = Math.round(64 * this.cine.bars); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h); }
    if (Game.showPos && this.map) text(`${this.map.id} ${S().x},${S().y}`, 8, H - 20, '#ffe070', 10);
  },
});
function drawEmote(ch, x, y, t) {
  const pop = t > 50 ? 1 - (t - 50) / 10 * 0.4 : 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#141016'; ctx.lineWidth = 3;
  roundRect(-18, -36, 36, 30, 8); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-5, -7); ctx.lineTo(0, 2); ctx.lineTo(5, -7); ctx.closePath(); ctx.fill();
  if (ch === 'anger') { ctx.strokeStyle = '#e02020'; ctx.lineWidth = 3; for (const [a, b] of [[-8, -28], [2, -28], [-8, -18], [2, -18]]) { ctx.beginPath(); ctx.arc(a + 3, b + 3, 4, 0, Math.PI / 2 * 3); ctx.stroke(); } }
  else if (ch === 'sweat') { ctx.fillStyle = '#50a0ff'; ctx.beginPath(); ctx.moveTo(0, -32); ctx.quadraticCurveTo(9, -18, 0, -12); ctx.quadraticCurveTo(-9, -18, 0, -32); ctx.fill(); }
  else if (ch === 'idea') { ctx.fillStyle = '#ffd040'; ctx.beginPath(); ctx.arc(0, -24, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#a08020'; ctx.fillRect(-3, -16, 6, 5); }
  else { const col = ch === '♥' ? '#e03060' : ch === '!' ? '#e02020' : '#202040'; setFont(ch.length > 1 ? 10 : 16); ctx.textAlign = 'center'; ctx.fillStyle = col; ctx.fillText(ch, 0, -30); ctx.textAlign = 'left'; }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Full-screen cinematic shots (trailer, story cinematics). Z skips.
// shot: { dur, bg, layers: [{ img | look | text, x, y, s, a, to: {x,y,s,a}, dir, size, color }],
//         caption, sub, flash, shake, sfx, music }
// ---------------------------------------------------------------------------
// Full-screen scenes clear any fade-to-black while they show, and put it back after.
const FULLSCREEN = { enter() { this._fade = Game.fade; Game.fade = 0; }, leave() { Game.fade = this._fade || 0; } };
class CinemaScene {
  constructor(shots, res, o = {}) { this.shots = shots; this.res = res; this.i = 0; this.t = 0; this.opaque = true; this.o = o; this.start(); }
  enter() { FULLSCREEN.enter.call(this); }
  leave() { FULLSCREEN.leave.call(this); }
  start() { const s = this.shots[this.i]; if (!s) return; if (s.music !== undefined) Audio2.music(s.music); if (s.sfx) Audio2.sfx(s.sfx); if (s.flash) Game.flash = s.flash; if (s.shake) Game.shake = s.shake; }
  update() {
    this.t++;
    if (Input.ok() && (this.o.skippable !== false)) { if (this.o.skipAll) return this.end(); this.t = this.shots[this.i].dur; }
    if (this.t >= this.shots[this.i].dur) { this.i++; this.t = 0; if (this.i >= this.shots.length) return this.end(); this.start(); }
  }
  end() { if (this.done) return; this.done = true; Game.pop(this); this.res(); }
  draw() {
    const s = this.shots[Math.min(this.i, this.shots.length - 1)], k = Math.min(1, this.t / s.dur), e = k * k * (3 - 2 * k);
    drawCineBg(s.bg || 'stars', this.t, k);
    for (const L of s.layers || []) {
      const to = L.to || {}, lerp = (a, b) => (b == null ? a : a + (b - a) * (L.linear ? k : e));
      const x = lerp(L.x ?? W / 2, to.x), y = lerp(L.y ?? H / 2, to.y), sc = lerp(L.s ?? 1, to.s), al = lerp(L.a ?? 1, to.a);
      const fade = L.fadeIn ? Math.min(1, this.t / L.fadeIn) : 1;
      ctx.save(); ctx.globalAlpha = clamp(al * fade, 0, 1);
      if (L.text) { ctx.shadowColor = L.glow || 'rgba(0,0,0,0)'; ctx.shadowBlur = L.glow ? 24 : 0; text(L.text, x, y, L.color || '#fff', L.size || 20, 'center'); }
      else {
        let im = L.img ? IMG[L.img] : L.look ? chibi(L.look, L.dir || 'down', L.walk ? (Math.floor(this.t / 8) % 2 ? 1 : 2) : 0) : null;
        if (L.silhouette && im) im = flashed(im, L.silhouette);
        if (im) { const bob = L.bob ? Math.sin(this.t / 20) * L.bob : 0; ctx.drawImage(im, Math.round(x - im.width * sc / 2), Math.round(y - im.height * sc + bob), Math.round(im.width * sc), Math.round(im.height * sc)); }
      }
      ctx.restore();
    }
    const bars = 70; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bars); ctx.fillRect(0, H - bars, W, bars);
    const ca = Math.min(1, this.t / 20, (s.dur - this.t) / 20);
    if (s.caption) { ctx.globalAlpha = clamp(ca, 0, 1); text(s.caption, W / 2, H - 52, '#f4ecd8', 16, 'center'); ctx.globalAlpha = 1; }
    if (s.sub) { ctx.globalAlpha = clamp(ca, 0, 1); text(s.sub, W / 2, 26, '#a8a8d0', 12, 'center'); ctx.globalAlpha = 1; }
    if (this.o.skipAll) text('Z: skip', W - 16, H - 24, '#555577', 10, 'right');
  }
}
function cinema(shots, o) { return new Promise(res => Game.push(new CinemaScene(shots, res, o))); }
const CINE_R = Array.from({ length: 80 }, (_, i) => [Math.random(), Math.random(), Math.random()]);
function drawCineBg(bg, t, k) {
  const g = (a, b) => { const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(1, b); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); };
  if (bg === 'stars') { drawStars(); return; }
  if (bg === 'void') { g('#000000', '#1a0a24'); return; }
  if (bg === 'black') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return; }
  if (bg === 'dawn') { g('#2a1840', '#f0b060'); ctx.fillStyle = 'rgba(255,240,180,0.5)'; ctx.beginPath(); ctx.arc(W / 2, H - 120, 90 + k * 20, 0, Math.PI * 2); ctx.fill(); return; }
  if (bg === 'seats') {
    drawStars('#05030c', '#2a1030');
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i / 10 * Math.PI * 2, x = W / 2 + Math.cos(a) * 300, y = 300 + Math.sin(a) * 120;
      const out = i === 9 && k > 0.5, f = 0.6 + 0.4 * Math.sin(t / 10 + i);
      ctx.fillStyle = out ? `rgba(140,80,255,${0.6 * (1 - (k - 0.5) * 2)})` : `rgba(255,${170 + i * 7},70,${0.7 * f + 0.3})`;
      ctx.fillRect(x - 5, y - 18 * f, 10, 20 * f); ctx.fillRect(x - 2, y - 26 * f, 4, 8 * f);
    }
    return;
  }
  if (bg === 'river') {
    g('#050a24', '#1a2a60');
    ctx.fillStyle = '#e8e8ff'; ctx.beginPath(); ctx.arc(760, 140, 36, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#0a1030'; ctx.beginPath(); ctx.arc(778, 128, 32, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0c1438'; for (let i = 0; i < W; i += 4) ctx.fillRect(i, 330 + Math.sin(i * 0.02) * 12, 4, 60);
    ctx.fillStyle = '#12204e'; ctx.fillRect(0, 380, W, H - 380);
    ctx.fillStyle = 'rgba(160,190,255,0.25)'; for (const [a, b] of CINE_R) ctx.fillRect(((a * W + t * 0.6 * (b + 0.2)) % W), 390 + b * 160, 18, 2);
    // the barge
    const bx = -200 + k * 700, by = 420;
    ctx.fillStyle = '#2a1a0c'; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 360, by); ctx.lineTo(bx + 320, by + 44); ctx.lineTo(bx + 30, by + 44); ctx.fill();
    ctx.fillStyle = '#6a4424'; ctx.fillRect(bx + 20, by - 8, 320, 8);
    for (const lx of [40, 180, 320]) { ctx.fillStyle = '#3a2a1a'; ctx.fillRect(bx + lx, by - 60, 4, 52); ctx.fillStyle = '#ffe070'; ctx.beginPath(); ctx.arc(bx + lx + 2, by - 64, 6 + Math.sin(t / 6 + lx) * 1.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#b080ff'; ctx.beginPath(); ctx.arc(bx + 180, by - 22, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,224,112,0.18)'; ctx.fillRect(bx + 20, by + 44, 320, 90);
    return;
  }
  if (bg === 'fire') {
    g('#1a0400', '#e06020');
    for (let i = 0; i < 9; i++) { const x = i * 120 - 20, h = 90 + (i * 37) % 60; ctx.fillStyle = '#140a06'; ctx.fillRect(x, 440 - h, 90, h); ctx.beginPath(); ctx.moveTo(x - 10, 440 - h); ctx.lineTo(x + 45, 390 - h); ctx.lineTo(x + 100, 440 - h); ctx.fill(); ctx.fillStyle = `rgba(255,${150 + (t * 3 + i * 40) % 80},40,0.9)`; ctx.fillRect(x + 36, 460 - h + 20, 16, 20); }
    ctx.fillStyle = '#140a06'; ctx.fillRect(0, 440, W, H);
    for (const [a, b, c] of CINE_R) { ctx.fillStyle = c > 0.5 ? '#ffd060' : '#ff7020'; ctx.fillRect(a * W + Math.sin(t / 20 + c * 9) * 20, H - ((b * H + t * (1 + c * 2)) % H), 3, 3); }
    return;
  }
  if (bg === 'forest') { g('#0a141e', '#2a4a4a'); for (let i = 0; i < 18; i++) { const x = (i * 71 + t * 0.3 * (i % 3)) % (W + 60) - 30; ctx.fillStyle = i % 2 ? '#c8d8d0' : '#8aa8a0'; ctx.fillRect(x, 60, 10 + i % 3 * 4, H); } ctx.fillStyle = 'rgba(64,224,208,0.6)'; for (const [a, b] of CINE_R) ctx.fillRect(a * W, b * H, 2, 2); return; }
  if (bg === 'falls') { g('#3a2a6a', '#f0a0d0'); ctx.fillStyle = 'rgba(210,235,255,0.9)'; ctx.fillRect(380, 0, 60, H); ctx.fillRect(520, 0, 60, H); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(330, 380, 300, 50); return; }
  if (bg === 'gold') { g('#3a2a10', '#f0d890'); return; }
  if (bg === 'moon') { g('#02040e', '#18204a'); ctx.fillStyle = '#f4f4ff'; ctx.beginPath(); ctx.arc(W / 2, 250, 110, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(200,210,255,0.15)'; ctx.beginPath(); ctx.arc(W / 2, 250, 150 + Math.sin(t / 30) * 6, 0, Math.PI * 2); ctx.fill(); return; }
  g('#000', '#222');
}

// ---------------------------------------------------------------------------
// The trailer (plays before the title screen; also on the title menu)
// ---------------------------------------------------------------------------
function trailerShots() {
  const hero = (img, from, cap, extra = {}) => ({ dur: 170, bg: 'void', caption: cap, layers: [{ img, x: from, y: 470, s: 2.2, to: { x: W / 2 - 120 }, fadeIn: 30 }, { img: img + '_face', x: W / 2 + 220, y: 380, s: 2.4, to: { x: W / 2 + 180 }, fadeIn: 40 }], ...extra });
  return [
    { dur: 220, bg: 'seats', music: 'title', caption: 'In the world of Cael\'Brithar, the gods live on worship.' },
    { dur: 220, bg: 'seats', caption: 'Only ten may exist at once. When their faithful fade...', sfx: 'dark' },
    { dur: 150, bg: 'black', caption: '...so do they.', flash: 10 },
    { dur: 200, bg: 'void', sfx: 'dark', caption: 'One seat was stolen.', layers: [{ img: 'b_sonia', x: W / 2, y: 600, s: 0.6, a: 0, to: { s: 1.5, a: 0.9 }, silhouette: '#1a0a2a' }] },
    { dur: 160, bg: 'void', caption: 'Someone wants it back.', flash: 14, shake: 10, sfx: 'boom', layers: [{ img: 'b_sonia', x: W / 2, y: 600, s: 1.5, to: { s: 1.6 } }] },
    hero('raine', -200, 'A Warden who never asked "why."'),
    hero('miasma', W + 200, 'A dragon with a secret she will never tell.'),
    hero('verai', -200, 'A girl the whole world was afraid of.'),
    { dur: 170, bg: 'moon', caption: 'A knight who is hiding what she really is.', layers: [{ look: 'luna', x: W / 2, y: 520, s: 7, silhouette: '#0a0a1a', bob: 3 }] },
    { dur: 60, bg: 'forest', music: 'boss', flash: 10, shake: 8, sfx: 'boom', layers: [{ img: 'b_veilstag', x: W / 2, y: 610, s: 1.5, to: { s: 1.6 } }] },
    { dur: 60, bg: 'fire', flash: 10, shake: 8, sfx: 'boom', layers: [{ img: 'b_votary', x: W / 2, y: 610, s: 1.5, to: { s: 1.6 } }] },
    { dur: 60, bg: 'gold', flash: 10, shake: 8, sfx: 'boom', layers: [{ img: 'b_chimera', x: W / 2, y: 610, s: 1.5, to: { s: 1.6 } }] },
    { dur: 60, bg: 'falls', flash: 10, shake: 8, sfx: 'boom', layers: [{ img: 'b_bloomcolossus', x: W / 2, y: 610, s: 1.5, to: { s: 1.6 } }] },
    { dur: 200, bg: 'dawn', music: 'title', caption: 'Friends. Family. Lies. Gods.', layers: [{ img: 'miasma', x: 300, y: 500, s: 1.3, fadeIn: 20 }, { img: 'raine', x: 480, y: 500, s: 1.3, fadeIn: 30 }, { img: 'verai', x: 660, y: 500, s: 1.3, fadeIn: 40 }] },
    { dur: 260, bg: 'seats', flash: 16, sfx: 'holy', layers: [{ text: 'THE TENTH SEAT', x: W / 2, y: 250, size: 42, color: '#ffe070', glow: 'rgba(255,200,80,0.8)', s: 1, fadeIn: 30 }, { text: 'Every god can be replaced.', x: W / 2, y: 330, size: 14, color: '#c8c8ff', fadeIn: 60 }] },
  ];
}
function playTrailer() { return cinema(trailerShots(), { skipAll: true }); }
