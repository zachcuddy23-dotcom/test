'use strict';
// ---------------------------------------------------------------------------
// Debug menu: press F2 or ` (backtick), or tap the DEBUG button.
// Unsticks the screen, warps anywhere, jumps to story checkpoints, cheats.
// ---------------------------------------------------------------------------
const CHECKPOINTS = [
  { name: 'Barge (new game)', flags: [], party: ['raine', 'miasma'], lvl: 1, map: ['barge', 7, 6, 'up'] },
  { name: 'Solanthia, before the audience', flags: ['intro'], party: ['raine', 'miasma'], lvl: 2, map: ['solanthia', 15, 4, 'up'], keys: ['veillantern'] },
  { name: 'Leaving for Silverleaf', flags: ['intro', 'audience', 'mission'], party: ['raine', 'miasma'], lvl: 4, map: ['world', 26, 12, 'left'], keys: ['censer'] },
  { name: 'Veilstag (Silverleaf B2)', flags: ['intro', 'audience', 'mission'], party: ['raine', 'miasma'], lvl: 7, map: ['silverleaf2', 12, 4, 'left'], keys: ['censer'] },
  { name: 'Hollowmere arrival', flags: ['intro', 'audience', 'mission', 'stag'], party: ['raine', 'miasma'], lvl: 9, map: ['world', 8, 11, 'up'], keys: ['censer'] },
  { name: 'After Hollowmere burns', flags: ['intro', 'audience', 'mission', 'stag', 'votary', 'pass', 'arrived'], party: ['raine', 'miasma', 'verai'], lvl: 10, map: ['world', 8, 17, 'down'] },
  { name: 'Goldengrove / Luna', flags: ['intro', 'audience', 'mission', 'stag', 'votary', 'pass', 'arrived'], party: ['raine', 'miasma', 'verai'], lvl: 11, map: ['goldengrove', 13, 16, 'up'] },
  { name: 'Brightwater', flags: ['intro', 'audience', 'mission', 'stag', 'votary', 'pass', 'arrived', 'bridge', 'lunaJoin'], party: ['raine', 'miasma', 'verai', 'luna'], lvl: 13, map: ['brightwater', 2, 9, 'right'] },
  { name: 'Tower of Dawn top', flags: ['intro', 'audience', 'mission', 'stag', 'votary', 'pass', 'arrived', 'bridge', 'lunaJoin', 'harbor'], party: ['raine', 'miasma', 'verai', 'luna'], lvl: 16, map: ['tower3', 8, 9, 'up'], keys: ['harborpass'] },
  { name: 'Elaris\'s Embrace', flags: ['intro', 'audience', 'mission', 'stag', 'votary', 'pass', 'arrived', 'bridge', 'lunaJoin', 'harbor', 'chimera', 'wren'], party: ['raine', 'miasma', 'verai', 'luna'], lvl: 19, map: ['embrace1', 12, 13, 'up'], keys: ['harborpass', 'wrenkey'], ship: { x: 40, y: 33 } },
  { name: 'Twin Falls (final boss)', flags: ['intro', 'audience', 'mission', 'stag', 'votary', 'pass', 'arrived', 'bridge', 'lunaJoin', 'harbor', 'chimera', 'wren'], party: ['raine', 'miasma', 'verai', 'luna'], lvl: 20, map: ['embrace2', 12, 10, 'up'], keys: ['harborpass', 'wrenkey'], ship: { x: 40, y: 33 } },
];
function applyCheckpoint(cp) {
  const st = newState();
  st.party = cp.party.map(id => makeMember(id, cp.lvl));
  for (const m of st.party) for (const j of JOB_ORDER) m.jobs[j].lv = Math.max(1, Math.min(MAX_JOB_LV, Math.floor(cp.lvl / 3)));
  for (const f of cp.flags) st.flags[f] = true;
  st.keys = [...(cp.keys || [])];
  if (cp.flags.includes('votary')) st.jobsOpen.push('reaper');
  if (cp.flags.includes('harbor')) st.jobsOpen.push('tidecaller');
  if (cp.flags.includes('chimera')) st.jobsOpen.push('wyrmblood');
  st.gold = 500 + cp.lvl * 300; st.items = { tonic: 8, hitonic: cp.lvl > 10 ? 4 : 0, antidote: 3, emberplume: 2, bedroll: 2 };
  if (cp.ship) st.ship = cp.ship;
  Game.state = st;
  const f = new FieldScene(); Game.field = f; Game.replaceAll(f); Game.fade = 0;
  const [id, x, y, d] = cp.map; f.enterMap(id, x, y, d);
}
function unstick() {
  Game.fade = 0; Game.flash = 0; Game.shake = 0;
  const b = Game.scenes.find(s => s instanceof BattleScene);
  if (b && !b.finishing) { b.result = 'run'; b.finish(); }
  Game.scenes = Game.scenes.filter(s => s instanceof FieldScene || s instanceof BattleScene || s instanceof TitleScene);
  if (!Game.scenes.length) { if (Game.field) Game.scenes.push(Game.field); else Game.scenes.push(new TitleScene()); }
  const f = Game.field;
  if (f) { f.busy = 0; f.scripted = false; f.moving = null; f.hidePlayer = false; f.cine = null; if (f.actors) f.actors = []; }
  Input.clear();
}
class DebugScene {
  constructor() { this.opaque = false; this.stack = []; this.msg = 'F2 / ` / DEBUG button opens this menu.'; this.root(); }
  root() {
    const inGame = !!Game.state;
    this.menu = new ListMenu([
      { text: 'Fix stuck / black screen', k: 'unstick' },
      { text: 'Jump to story point...', k: 'jump' },
      { text: 'Warp to map...', k: 'warp', disabled: !Game.field },
      { text: 'Win this battle', k: 'win', disabled: !Game.scenes.some(s => s instanceof BattleScene) },
      { text: 'Heal party', k: 'heal', disabled: !inGame },
      { text: '+5 levels, jobs +2 ranks', k: 'lvl', disabled: !inGame },
      { text: 'Unlock all jobs, +5000 G', k: 'jobs', disabled: !inGame },
      { text: `Random battles: ${inGame && flag('noEnc') ? 'OFF' : 'ON'}`, k: 'enc', disabled: !inGame },
      { text: `Show position: ${Game.showPos ? 'ON' : 'OFF'}`, k: 'pos' },
      { text: `Error log (${Game.errors.length})`, k: 'log' },
      { text: 'Close', k: 'close' },
    ], { x: 180, y: 60, w: 600, rows: 11, rowH: 34, title: 'DEBUG', size: 14 });
    this.mode = 'root';
  }
  close() { Game.pop(this); Input.clear(); }
  update() {
    if (this.mode === 'log') { if (Input.ok() || Input.cancel()) this.root(); return; }
    const r = this.menu.update(); if (!r) return;
    if (r.cancel) { if (this.mode === 'root') this.close(); else this.root(); return; }
    const k = r.select.k;
    if (this.mode === 'jump') { this.close(); applyCheckpoint(CHECKPOINTS[r.index]); return; }
    if (this.mode === 'warp') { this.close(); const id = r.select.id; if (id === 'world') { S().onShip = false; Game.field.enterMap('world', 27, 12, 'down'); } else { const m = prepMap(id); Game.field.enterMap(id, m.start[0], m.start[1], m.start[2]); } Game.fade = 0; return; }
    if (k === 'unstick') { unstick(); this.close(); return; }
    if (k === 'jump') { this.mode = 'jump'; this.menu = new ListMenu(CHECKPOINTS.map(c => ({ text: c.name })), { x: 180, y: 60, w: 600, rows: 11, rowH: 34, title: 'Jump to story point (resets the save in memory)', size: 14 }); return; }
    if (k === 'warp') { this.mode = 'warp'; this.menu = new ListMenu(['world', ...Object.keys(MAPS)].map(id => ({ text: id === 'world' ? 'World map (Solanthia)' : MAPS[id].name, id })), { x: 180, y: 40, w: 600, rows: 13, rowH: 32, title: 'Warp to map', size: 12 }); return; }
    if (k === 'win') { const b = Game.scenes.find(s => s instanceof BattleScene); for (const e of b.living()) b.kill(e); b.check(); this.close(); return; }
    if (k === 'heal') { for (const m of S().party) { const st = stats(m); m.hp = st.mhp; m.mp = st.mmp; m.status = {}; } this.msg = 'Party healed.'; }
    if (k === 'lvl') { for (const m of S().party) { const n = Math.min(MAX_LEVEL, m.lvl + 5); gainExp(m, EXP_TABLE[n] - m.exp); for (const j of JOB_ORDER) m.jobs[j].lv = Math.min(MAX_JOB_LV, m.jobs[j].lv + 2); } this.msg = 'Levels up.'; }
    if (k === 'jobs') { S().jobsOpen = JOB_ORDER.slice(); S().gold += 5000; this.msg = 'All jobs unlocked.'; }
    if (k === 'enc') { setFlag('noEnc', !flag('noEnc')); }
    if (k === 'pos') Game.showPos = !Game.showPos;
    if (k === 'log') { this.mode = 'log'; return; }
    if (k === 'close') { this.close(); return; }
    const i = this.menu.index; this.root(); this.menu.index = i;
  }
  draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
    if (this.mode === 'log') {
      drawWindow(20, 20, W - 40, H - 40); text('Error log  (Z to go back)', 44, 44, '#ffe070', 14);
      const lines = Game.errors.slice(-14).flatMap(e => wrapText(e.msg, W - 100, 11).slice(0, 2));
      if (!lines.length) text('No errors recorded.', 44, 80, '#fff', 12);
      lines.slice(-24).forEach((l, i) => text(l, 44, 80 + i * 21, '#ffb0b0', 11));
      return;
    }
    this.menu.draw();
    const f = Game.field;
    const info = f && f.map ? `Map: ${f.map.id}  x${S().x} y${S().y}  fade ${Game.fade.toFixed(2)}  busy ${f.busy}` : 'Not in a map';
    drawWindow(180, 480, 600, 90); text(this.msg, 204, 504, '#c8d0ff', 11); text(info, 204, 532, '#fff', 11);
  }
}
function openDebug() { if (!(Game.top() instanceof DebugScene)) Game.push(new DebugScene()); }
window.addEventListener('keydown', e => { if (e.code === 'F2' || e.code === 'Backquote') { e.preventDefault(); openDebug(); } });
