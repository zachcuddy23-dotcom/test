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
// Chapter Two checkpoints (everything from Chapter One is done)
const CH1_DONE = ['intro', 'audience', 'mission', 'stag', 'votary', 'pass', 'arrived', 'bridge', 'lunaJoin', 'harbor', 'chimera', 'wren', 'colossus', 'ch1end', 'ch1done'];
const CH2 = (name, extra, party, lvl, map, more = {}) => ({ name: 'Ch2: ' + name, flags: [...CH1_DONE, ...extra], party, lvl, map, keys: ['harborpass', 'wrenkey', ...(more.keys || [])], ship: { x: 40, y: 33 }, ...more });
const RMVL = ['raine', 'miasma', 'verai', 'luna'], RML = ['raine', 'miasma', 'luna'];
CHECKPOINTS.push(
  CH2('Sanctuary falls (Verai stayed)', ['veraiStayed'], RMVL, 20, ['embrace2', 12, 9, 'up'], { run: () => chapter2Opening() }),
  CH2('Sanctuary falls (Verai left)', ['veraiLeft'], RML, 20, ['embrace2', 12, 9, 'up'], { run: () => chapter2Opening() }),
  CH2('Sanctuary falls (Verai with Sonia)', ['veraiSonia'], RML, 20, ['embrace2', 12, 9, 'up'], { run: () => chapter2Opening() }),
  CH2('Emberport', ['veraiStayed', 'sanctuarySunk', 'ch2start'], RMVL, 21, ['emberport', 15, 16, 'up']),
  CH2('Kharak Yr / Brakka', ['veraiLeft', 'sanctuarySunk', 'ch2start', 'emberGate', 'trialWon', 'chainJob', 'coalToken'], RML, 23, ['kharakyr', 13, 16, 'up']),
  CH2('Draumond', ['veraiSonia', 'sanctuarySunk', 'ch2start', 'emberGate', 'bribed', 'coalToken', 'gunworks', 'blewPowder'], [...RML, 'brakka'], 25, ['draumond', 13, 16, 'up'], { keys: ['gunpass'] }),
  CH2('Mount Terminus (Verai with Sonia)', ['veraiSonia', 'sanctuarySunk', 'ch2start', 'emberGate', 'trialWon', 'coalToken', 'gunworks', 'tookPowder', 'draumond'], [...RML, 'brakka'], 26, ['terminus2', 1, 11, 'right'], { keys: ['gunpass', 'deathpage'] }),
  CH2('Secret: Ashen Athenaeum', ['veraiLeft', 'sanctuarySunk', 'ch2start', 'emberGate', 'trialWon', 'chainJob', 'coalToken', 'gunworks', 'tookPowder', 'draumond'], [...RML, 'brakka'], 29, ['athenaeum1', 11, 14, 'up'], { keys: ['gunpass'] }),
  CH2('Secret: Hollowgrin\'s chest (Charnoch)', ['veraiStayed', 'sanctuarySunk', 'ch2start', 'emberGate', 'trialWon', 'chainJob', 'coalToken'], RMVL, 25, ['charnoch', 22, 13, 'right'], { run: () => { S().chests.c2_charnoch1 = true; } }),
  CH2('Mini-game: Bell-Ringer (Draumond)', ['veraiSonia', 'sanctuarySunk', 'ch2start', 'emberGate', 'bribed', 'coalToken', 'gunworks', 'blewPowder'], [...RML, 'brakka'], 25, ['draumond', 13, 16, 'up'], { keys: ['gunpass'] }),
  CH2('Throne of Cinders', ['veraiStayed', 'sanctuarySunk', 'ch2start', 'emberGate', 'trialWon', 'chainJob', 'coalToken', 'gunworks', 'tookPowder', 'draumond', 'ferryman'], [...RMVL], 28, ['cinders', 10, 13, 'up'], { keys: ['gunpass', 'anvilshard'] }),
);
// Chapter Three checkpoints (Chapter Two finished: Verai stayed, Brakka waiting on the bench)
const CH2_DONE = ['veraiStayed', 'sanctuarySunk', 'ch2start', 'emberGate', 'trialWon', 'chainJob', 'coalToken', 'gunworks', 'tookPowder', 'draumond', 'ferryman', 'throneMet', 'ashkarAlly', 'ch2end', 'ch2done'];
const CH3 = (name, extra, lvl, map, more = {}) => ({ ...CH2(name, [...CH2_DONE, ...extra], RMVL, lvl, map, { bench: ['brakka'], keys: ['gunpass'], ...more }), name: 'Ch3: ' + name });
const CH3_CLIMB = ['ch3start', 'ch3sick', 'ch3doctor', 'ch3confessed'];
CHECKPOINTS.push(
  CH3('Chapter Two just finished', [], 28, ['cinders', 10, 13, 'up'], { run: () => chapter3Opening() }),
  CH3('Hearthmoor, Raine is ill', CH3_CLIMB, 28, ['hearthmoor', 14, 14, 'up'], { run: () => { raineLeaves(); } }),
  CH3('Wyrmspire: Frozen Falls (ice)', [...CH3_CLIMB, 'ch3m1'], 29, ['wyrm2', 1, 14, 'right'], { run: () => { raineLeaves(); } }),
  CH3('Wyrmspire: the Old Nest', [...CH3_CLIMB, 'ch3m1', 'ch3m2'], 30, ['wyrm3', 1, 12, 'right'], { run: () => { raineLeaves(); } }),
  CH3('Wyrmspire: Summit (Rimeclaw)', [...CH3_CLIMB, 'ch3m1', 'ch3m2', 'ch3m3', 'ch3nest', 'ch3helm', 'ch3toy', 'ch3yeti', 'ch3m4'], 31, ['summit', 1, 10, 'right'], { run: () => { raineLeaves(); } }),
  CH3('Frostfang Pass (after the Wyrmspire)', [...CH3_CLIMB, 'ch3m1', 'ch3m2', 'ch3m3', 'ch3nest', 'ch3yeti', 'ch3m4', 'ch3summit', 'ch3rime', 'ch3herb', 'ch3cured', 'leaderUnlocked', 'ch3part1', 'ch3pass'], 32, ['pass1', 11, 1, 'down']),
  CH3('Solanthia Undercity (sneaking)', [...CH3_CLIMB, 'ch3m1', 'ch3m2', 'ch3m3', 'ch3nest', 'ch3yeti', 'ch3m4', 'ch3summit', 'ch3rime', 'ch3herb', 'ch3cured', 'leaderUnlocked', 'ch3part1', 'ch3pass', 'ch3aval', 'ch3inq', 'ch3undercity', 'ch3underTip'], 33, ['undercity1', 4, 16, 'right']),
  CH3('The Temple cells and the trial', [...CH3_CLIMB, 'ch3m1', 'ch3m2', 'ch3m3', 'ch3nest', 'ch3yeti', 'ch3m4', 'ch3summit', 'ch3rime', 'ch3herb', 'ch3cured', 'leaderUnlocked', 'ch3part1', 'ch3pass', 'ch3aval', 'ch3inq', 'ch3undercity', 'ch3underTip', 'ch3told'], 34, ['cells', 9, 8, 'up'], { keys: ['gunpass', 'toydragon'] }),
  CH3('After the Wyrmspire', [...CH3_CLIMB, 'ch3m1', 'ch3m2', 'ch3m3', 'ch3nest', 'ch3yeti', 'ch3m4', 'ch3summit', 'ch3rime', 'ch3herb', 'ch3cured', 'leaderUnlocked', 'ch3part1'], 32, ['hearthmoor', 14, 14, 'up']),
);
// Chapter Four checkpoints (Chapter Three finished; Raine asked "why"; Verai stayed in Chapter One)
const CH3_DONE = [...CH3_CLIMB, 'ch3m1', 'ch3m2', 'ch3m3', 'ch3m4', 'ch3nest', 'ch3helm', 'ch3toy', 'ch3yeti', 'ch3summit', 'ch3told', 'ch3rime', 'ch3herb', 'ch3cured', 'leaderUnlocked', 'ch3part1', 'ch3pass', 'ch3aval', 'ch3inq', 'ch3undercity', 'ch3underTip', 'ch3cells', 'ch3trial', 'raineWhy', 'ch3toyGiven', 'veraiNight', 'lunaRevealed', 'ch3done'];
const CH4 = (name, route, extra, party, bench, lvl, map, more = {}) => ({ ...CH2(name, [...CH2_DONE.filter(f => f !== 'ashkarAlly'), route, ...CH3_DONE, ...extra], party, lvl, map, { bench, keys: ['gunpass', ...(route === 'ashkarRival' ? ['anvilshard'] : []), ...(more.keys || [])], ...more }), name: 'Ch4: ' + name });
const P4 = ['raine', 'miasma', 'odeaon', 'verai'], B4 = ['luna', 'brakka'], P4b = ['raine', 'miasma', 'odeaon', 'luna'], B4b = ['verai', 'brakka'];
CHECKPOINTS.push(
  CH4('Chapter Three just finished (Ashkar ally, Verai in the party)', 'ashkarAlly', [], P4, B4, 34, ['wrendeck', 8, 5, 'up'], { run: () => chapter4Opening() }),
  CH4('Chapter Three just finished (Ashkar rival, Verai benched: she leaves)', 'ashkarRival', [], P4b, B4b, 34, ['wrendeck', 8, 5, 'up'], { run: () => chapter4Opening() }),
  CH4('Moonhollow (ally route)', 'ashkarAlly', ['ch4start', 'veraiResisted'], P4, B4, 35, ['world', 17, 17, 'up'], { keys: ['anvilshard', 'phoenixember'], run: () => { S().flags.veraiWill = 4; } }),
  CH4('Drowned sanctuary (ally route)', 'ashkarAlly', ['ch4start', 'veraiResisted', 'ch4moon', 'ch4lunaTalk', 'ch4purge', 'lunaUnmasked', 'hallornSpared', 'ch4dive'], P4b, B4b, 37, ['drowned1', 2, 16, 'up'], { keys: ['anvilshard', 'phoenixember', 'accord'], run: () => { S().flags.veraiWill = 4; } }),
  CH4('Drowned sanctuary (rival route, Verai gone)', 'ashkarRival', ['ch4start', 'veraiGone4', 'ch4moon', 'ch4lunaTalk', 'ch4purge', 'lunaUnmasked', 'hallornKept', 'ch4dive'], P4b, ['brakka'], 37, ['drowned1', 2, 16, 'up'], { keys: ['anvilbell', 'accord'] }),
);
// Chapter Five checkpoints (Chapter Four finished)
const CH4_DONE_A = ['ch4start', 'veraiResisted', 'veraiStood', 'ch4moon', 'ch4lunaTalk', 'ch4purge', 'lunaUnmasked', 'hallornSpared', 'ch4dive', 'ch4mirrors', 'ch4bloom', 'ch4elaris', 'anvilSealed', 'ashkarGuttered', 'ch4done'];
const CH4_DONE_R = ['ch4start', 'veraiGone4', 'ch4moon', 'ch4lunaTalk', 'ch4purge', 'lunaUnmasked', 'hallornKept', 'ch4dive', 'ch4mirrors', 'ch4bloom', 'ch4elaris', 'anvilLost', 'veraiReach', 'ch4done'];
const CH5 = (name, route, extra, party, bench, lvl, map, more = {}) => {
  const ally = route === 'ashkarAlly', cp = CH4(name, route, [...(ally ? CH4_DONE_A : CH4_DONE_R), ...extra], party, bench, lvl, map, { ...more, keys: ['elarisseed', 'accord', ...(ally ? ['phoenixember'] : []), ...(more.keys || [])] });
  const run = more.run;
  return { ...cp, name: 'Ch5: ' + name, run: () => {
    takeKey('anvilshard'); S().flags.veraiWill = ally ? 5 : 2; S().flags.lunaTrust = 2;
    for (const j of ['bloomwarden', 'timewarden', 'nightveil']) if (!JOB_ORDER.includes(j)) JOB_ORDER.push(j);
    if (!ally) { S().away = { verai: makeMember('verai', lvl - 1) }; S().flags.veraiReachChoice = 1; }
    if (extra.includes('skyWings')) { giveKey('skywings'); S().flying = true; Audio2.music('sky'); }
    if (run) return run();
  } };
};
const PT5 = ['raine', 'miasma', 'odeaon', 'verai'], BN5 = ['luna', 'brakka'], PT5b = ['raine', 'miasma', 'odeaon', 'luna'], BN5b = ['brakka'];
CHECKPOINTS.push(
  CH5('Chapter Four just finished (Ashkar ally, Verai stayed)', 'ashkarAlly', [], PT5, BN5, 38, ['wrendeck', 8, 5, 'up'], { run: () => chapter5Opening() }),
  CH5('Chapter Four just finished (Ashkar rival, Verai gone)', 'ashkarRival', [], PT5b, BN5b, 38, ['wrendeck', 8, 5, 'up'], { run: () => chapter5Opening() }),
  CH5('Flying over Aurelion (ally route)', 'ashkarAlly', ['ch5start', 'skyWings'], PT5, BN5, 40, ['world', 52, 19, 'left']),
  CH5('Flying over Thalemyr (rival route, Verai gone)', 'ashkarRival', ['ch5start', 'skyWings'], PT5b, BN5b, 40, ['thalemyr', 14, 20, 'up']),
  CH5('Ebonport chapel (rival route, Verai gone)', 'ashkarRival', ['ch5start', 'skyWings', 'ch5star'], PT5b, BN5b, 42, ['ebonport3', 10, 12, 'up'], { keys: ['starchart', 'masks'] }),
  CH5('The Ashen Crown (ally route)', 'ashkarAlly', ['ch5start', 'skyWings', 'ch5star', 'ch5veil'], PT5, BN5, 42, ['cradle1', 10, 14, 'up'], { keys: ['starchart', 'nightlantern'] }),
  CH5('The Rim of Godsfall (ally route, all three keys)', 'ashkarAlly', ['ch5start', 'skyWings', 'ch5star', 'ch5veil', 'ch5flame', 'ashkarRisen', 'ch5rimOpen'], PT5, BN5, 45, ['rim1', 2, 13, 'right'], { keys: ['starchart', 'nightlantern', 'livingflame'] }),
);
// Final Chapter checkpoints (Chapter Five finished)
const CH5_DONE = ['ch5start', 'skyWings', 'ch5star', 'ch5orrery', 'ch5unwritten', 'ch5veil', 'ch5regent', 'ch5flame', 'ch5rimOpen', 'ch5rim', 'ch5herald', 'ch5done'];
const CH6 = (name, route, extra, party, bench, lvl, map, more = {}) => {
  const ally = route === 'ashkarAlly', cp = CH5(name, route, [...CH5_DONE, ...(ally ? ['ashkarRisen', 'pendantGiven', 'ashkarFell'] : ['anvilKept', 'odeaonFell', 'veraiLost5']), ...extra], party, bench, lvl, map, { ...more, keys: ['starchart', 'nightlantern', ally ? 'livingflame' : 'crownember', 'masks', ...(ally ? [] : ['anvilshard2']), ...(more.keys || [])] });
  const run = cp.run;
  return { ...cp, name: name.replace(/^/, 'Final: '), run: () => {
    run(); takeKey('elarisseed'); S().flags.veraiNyxia = ally ? 'carry' : null;
    if (!ally) { S().away.odeaon = makeMember('odeaon', lvl); S().party = S().party.filter(m => m.id !== 'odeaon'); }
    giveKey('skywings'); if (more.after) return more.after();
  } };
};
const PT6 = ['raine', 'miasma', 'odeaon', 'verai'], BN6 = ['luna', 'brakka'], PT6b = ['raine', 'miasma', 'luna', 'brakka'];
CHECKPOINTS.push(
  CH6('Chapter Five just finished (ally route)', 'ashkarAlly', [], PT6, BN6, 48, ['rimward', 12, 9, 'up'], { after: () => chapter6Opening() }),
  CH6('Chapter Five just finished (rival route, Verai lost, Odeaon fell)', 'ashkarRival', [], PT6b, [], 48, ['rimward', 12, 9, 'up'], { after: () => chapter6Opening() }),
  CH6('Godsfall: the Hall of Unanswered Prayers (ally, 8 banners)', 'ashkarAlly', ['ch6start', 'ch6siege', 'bn_dawn', 'bn_tide', 'bn_moon', 'bn_star', 'bn_mask', 'bn_hearth', 'bn_powder', 'bn_flame'], PT6, BN6, 52, ['gf2', 10, 14, 'up']),
  CH6('Godsfall: the Unseated Throne (ally, 8 banners)', 'ashkarAlly', ['ch6start', 'ch6siege', 'bn_dawn', 'bn_tide', 'bn_moon', 'bn_star', 'bn_mask', 'bn_hearth', 'bn_powder', 'bn_flame', 'prayer4', 'soniaHeard', 'ch6heartseed', 'ch6dawnheart', 'ch6night', 'ch6warden', 'ch6rescue', 'ashkarRevived', 'ch6camp'], PT6, BN6, 54, ['gf7', 11, 11, 'up'], { keys: ['heartseed', 'dawnheart'] }),
  CH6('The Ring of the Ten', 'ashkarAlly', ['ch6start'], PT6, BN6, 54, ['seatring', 11, 15, 'up']),
);
function applyCheckpoint(cp) {
  const st = newState();
  st.party = cp.party.map(id => makeMember(id, cp.lvl));
  for (const m of st.party) for (const j of JOB_ORDER) m.jobs[j].lv = Math.max(1, Math.min(MAX_JOB_LV, Math.floor(cp.lvl / 3)));
  for (const f of cp.flags) st.flags[f] = true;
  st.keys = [...(cp.keys || [])];
  if (cp.flags.includes('votary')) st.jobsOpen.push('reaper');
  if (cp.flags.includes('harbor')) st.jobsOpen.push('tidecaller');
  if (cp.flags.includes('chimera')) st.jobsOpen.push('wyrmblood');
  if (cp.flags.includes('chainJob')) st.jobsOpen.push('chainbearer');
  if (cp.flags.includes('ch1done')) st.flags.bond = 2;
  if (cp.flags.includes('ch2end')) st.jobsOpen.push('phoenix');
  if (cp.flags.includes('ch3rime')) { st.jobsOpen.push('dragon'); const mi = st.party.find(m => m.id === 'miasma'); if (mi) { mi.jobs.dragon.lv = 5; mi.job = 'dragon'; mi.equip.weapon = 'skyclaws'; } }
  if (cp.bench) st.bench = cp.bench.map(id => makeMember(id, cp.lvl));
  st.gold = 500 + cp.lvl * 300; st.items = { tonic: 8, hitonic: cp.lvl > 10 ? 4 : 0, antidote: 3, emberplume: 2, bedroll: 2 };
  if (cp.ship) st.ship = cp.ship;
  Game.state = st;
  const f = new FieldScene(); Game.field = f; Game.replaceAll(f); Game.fade = 0;
  const [id, x, y, d] = cp.map; f.enterMap(id, x, y, d);
  if (cp.run) f.run(cp.run);
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
      { text: `Show walk grid: ${Game.showGrid ? 'ON' : 'OFF'}`, k: 'grid' },
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
    if (this.mode === 'warp') { this.close(); const id = r.select.id; if (id === 'world') { S().onShip = false; Game.field.enterMap('world', 27, 12, 'down'); } else { const m = prepMap(id); if (m.world) { S().onShip = false; const p = Object.keys(m.places)[0].split(',').map(Number); Game.field.enterMap(id, p[0], p[1] - 1, 'down'); } else Game.field.enterMap(id, m.start[0], m.start[1], m.start[2]); } Game.fade = 0; return; }
    if (k === 'unstick') { unstick(); this.close(); return; }
    if (k === 'jump') { this.mode = 'jump'; this.menu = new ListMenu(CHECKPOINTS.map(c => ({ text: c.name })), { x: 180, y: 60, w: 600, rows: 11, rowH: 34, title: 'Jump to story point (resets the save in memory)', size: 14 }); return; }
    if (k === 'warp') { this.mode = 'warp'; this.menu = new ListMenu(['world', ...Object.keys(MAPS)].map(id => ({ text: id === 'world' ? 'World map (Solanthia)' : MAPS[id].name, id })), { x: 180, y: 40, w: 600, rows: 13, rowH: 32, title: 'Warp to map', size: 12 }); return; }
    if (k === 'win') { const b = Game.scenes.find(s => s instanceof BattleScene); for (const e of b.living()) b.kill(e); b.check(); this.close(); return; }
    if (k === 'heal') { for (const m of S().party) { const st = stats(m); m.hp = st.mhp; m.mp = st.mmp; m.status = {}; } this.msg = 'Party healed.'; }
    if (k === 'lvl') { for (const m of S().party) { const n = Math.min(MAX_LEVEL, m.lvl + 5); gainExp(m, EXP_TABLE[n] - m.exp); for (const j of JOB_ORDER) m.jobs[j].lv = Math.min(MAX_JOB_LV, m.jobs[j].lv + 2); } this.msg = 'Levels up.'; }
    if (k === 'jobs') { S().jobsOpen = JOB_ORDER.slice(); S().gold += 5000; this.msg = 'All jobs unlocked.'; }
    if (k === 'enc') { setFlag('noEnc', !flag('noEnc')); }
    if (k === 'pos') Game.showPos = !Game.showPos;
    if (k === 'grid') Game.showGrid = !Game.showGrid;
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
// Art tests: the painted Docks of Solanthia, listed first
CHECKPOINTS.unshift(
  { name: '* Art test: Docks of Solanthia (painted map)', flags: ['intro', 'noEnc'], party: ['raine', 'miasma'], lvl: 5, map: ['soldocks', 15, 2, 'down'], run: () => { Game.showPos = true; } },
  { name: '* Art test: walk from Solanthia to the docks', flags: ['intro', 'noEnc'], party: ['raine', 'miasma'], lvl: 5, map: ['solanthia', 27, 12, 'right'] },
  { ...CH5('Art test: Docks with the dragon (Ch5 lines)', 'ashkarAlly', ['ch5start', 'noEnc'], PT5, BN5, 40, ['soldocks', 18, 12, 'down']), name: '* Art test: Docks in Chapter 5 (Captain Orsa\'s dragon lines)' },
);
