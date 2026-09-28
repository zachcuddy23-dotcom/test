// Runs real battles headlessly with a simple auto-player, to check balance.
const c = require('./harness.js');
const vm = require('vm');
const run = code => vm.runInContext(code, c);
function setup(spec) {
  run(`Game.state = newState(); Game.state.party = []; Game.field = null;`);
  for (const [id, lvl, job, jr, eq] of spec.party) {
    run(`(() => { const m = makeMember('${id}', ${lvl}); m.job = '${job}'; m.jobs['${job}'].lv = ${jr}; Object.assign(m.equip, ${JSON.stringify(eq || {})}); const st = stats(m); m.hp = st.mhp; m.mp = st.mmp; Game.state.party.push(m); })()`);
  }
  run(`Game.state.items = ${JSON.stringify(spec.items || { tonic: 6 })}; Game.state.cfg.speed = 3; Game.state.cfg.atb = '${spec.atb || 'wait'}';`);
}
const AI = `
function aiPick(b, m) {
  const st = stats(m), party = b.standing(), en = b.living();
  const hurt = party.filter(p => p.hp < stats(p).mhp * 0.4).sort((a, b2) => a.hp - b2.hp)[0];
  const dead = b.party().find(p => !alive(p));
  const skills = allSkills(m).map(id => [id, SKILLS[id]]).filter(([, s]) => m.mp >= s.mp);
  const heal = skills.find(([, s]) => s.kind === 'heal' && s.target === 'ally');
  const healAll = skills.find(([, s]) => s.kind === 'heal' && s.target === 'allies');
  const revive = skills.find(([, s]) => s.kind === 'revive');
  if (dead && revive) return { type: 'skill', skill: revive[0], target: dead };
  if (dead && (Game.state.items.emberplume || 0) > (b.reserved.emberplume || 0)) return { type: 'item', item: 'emberplume', target: dead };
  if (party.filter(p => p.hp < stats(p).mhp * 0.5).length >= 2 && healAll) return { type: 'skill', skill: healAll[0] };
  if (hurt && heal) return { type: 'skill', skill: heal[0], target: hurt };
  if (hurt && hurt.hp < stats(hurt).mhp * 0.25 && (Game.state.items.hitonic || 0) > (b.reserved.hitonic || 0)) return { type: 'item', item: 'hitonic', target: hurt };
  if (hurt && hurt.hp < stats(hurt).mhp * 0.25 && (Game.state.items.tonic || 0) > (b.reserved.tonic || 0)) return { type: 'item', item: 'tonic', target: hurt };
  const t = en.sort((a, b2) => a.hp - b2.hp)[0];
  let best = null, bestV = st.atk * 1.25 - t.d.def;
  for (const [id, s] of skills) {
    let v = 0;
    if (s.kind === 'dmg' || s.kind === 'drain') v = s.pow * (1 + st.mag / 28) * (s.target === 'enemies' ? 0.75 * en.length : 1) * b.elemMult(t, s.elem) - (s.pierce ? 0 : t.d.mdef * 0.6);
    if (s.kind === 'phys') v = (st.atk * 1.25 - t.d.def) * s.mult * (s.hits || 1) * (s.target === 'enemies' ? en.length : 1) * b.elemMult(t, s.elem) * (s.hpCost ? 0.7 : 1);
    if (s.kind === 'jump') v = (st.atk * 1.25 - t.d.def) * s.mult * 0.8;
    if (s.mp > m.mp * 0.5 && s.mp > 8) v *= 0.7;
    if (v > bestV) { bestV = v; best = id; }
  }
  if (best) { const s = SKILLS[best]; return { type: 'skill', skill: best, target: s.target === 'enemy' ? t : null }; }
  return { type: 'attack', target: t };
}`;
run(AI);
run(`for (const k in ASSETS) IMG[k] = { width: 120, height: 140 };`);
async function fight(spec, enemies, runs = 20) {
  const out = { win: 0, lose: 0, frames: [], hpLeft: [], err: 0 };
  for (let i = 0; i < runs; i++) {
    setup(spec);
    let result = null;
    run(`Game.scenes = []; Game.timers = []; Game.fade = 0;`);
    c.__res = r => { result = r; };
    run(`var __b = new BattleScene(${JSON.stringify({ enemies, boss: true, noRun: true, ...(spec.opts || {}) })}, r => __res(r)); Game.push(__b);`);
    let f = 0;
    try {
      while (!result && f < 60 * 60 * 20) {
        run(`if (__b.ui && __b.ui.kind === 'cmd') __b.setCmd(__b.ui.m, aiPick(__b, __b.ui.m)); if (__b.waitKey) Input.pressed.a = true; update();`);
        f++;
        await new Promise(r => setImmediate(r));
      }
    } catch (e) { out.err++; console.log(e.stack.split('\n').slice(0, 4).join('\n')); break; }
    if (result === 'win') out.win++; else out.lose++;
    out.frames.push(f);
    out.hpLeft.push(run(`Math.round(100 * Game.state.party.reduce((s, m) => s + m.hp, 0) / Game.state.party.reduce((s, m) => s + stats(m).mhp, 0))`));
  }
  const avg = a => Math.round(a.reduce((s, x) => s + x, 0) / a.length);
  return `win ${out.win}/${runs}  avg ${Math.round(avg(out.frames) / 60)}s  hp left ${avg(out.hpLeft)}%` + (out.err ? ` ERRORS ${out.err}` : '');
}
module.exports = { fight, run };
if (require.main === module) {
  const P = {
    start: { party: [['raine', 1, 'oathblade', 1, {}], ['miasma', 1, 'freelancer', 1, {}]] },
    stag: { party: [['raine', 7, 'oathblade', 3, { weapon: 'broadsword', head: 'ironhelm' }], ['miasma', 7, 'freelancer', 3, { weapon: 'handaxe', head: 'cap' }]], items: { tonic: 6 } },
    votary: { party: [['raine', 9, 'oathblade', 4, { weapon: 'broadsword', head: 'ironhelm' }], ['miasma', 9, 'freelancer', 4, { weapon: 'handaxe', head: 'cap' }], ['verai', 9, 'dawnsinger', 3, {}]], items: { tonic: 6, emberplume: 1 } },
    chimera: { party: [['raine', 15, 'oathblade', 6, { weapon: 'dawnblade', head: 'ironhelm', body: 'chainmail' }], ['miasma', 15, 'wyrmblood', 2, { weapon: 'pike', head: 'ironhelm', body: 'chainmail' }], ['verai', 15, 'arcanist', 4, { weapon: 'starrod', head: 'featherhat', body: 'sagerobe' }]], items: { tonic: 6, hitonic: 3, emberplume: 2 } },
    colossus: { party: [['raine', 19, 'reaper', 5, { weapon: 'gravecleaver', head: 'sunhelm', body: 'platemail' }], ['miasma', 19, 'wyrmblood', 5, { weapon: 'tidespear', head: 'sunhelm', body: 'platemail' }], ['verai', 19, 'arcanist', 6, { weapon: 'sagerod', head: 'circlet', body: 'sagerobe' }]], items: { hitonic: 5, emberplume: 2, ether: 2 } },
    // Chapter Two: Chapter One's end gear, then Emberport / Kharak Yr gear
    ember: { party: [['raine', 21, 'reaper', 6, { weapon: 'gravecleaver', head: 'sunhelm', body: 'platemail' }], ['miasma', 21, 'wyrmblood', 6, { weapon: 'tidespear', head: 'sunhelm', body: 'platemail' }], ['luna', 21, 'oathblade', 6, { weapon: 'dawnblade', head: 'sunhelm', body: 'platemail' }], ['verai', 21, 'arcanist', 6, { weapon: 'sagerod', head: 'circlet', body: 'sagerobe' }]], items: { hitonic: 5, emberplume: 2, ether: 2 } },
    ember3: { party: [['raine', 21, 'reaper', 6, { weapon: 'gravecleaver', head: 'sunhelm', body: 'platemail' }], ['miasma', 21, 'wyrmblood', 6, { weapon: 'tidespear', head: 'sunhelm', body: 'platemail' }], ['luna', 21, 'oathblade', 6, { weapon: 'dawnblade', head: 'sunhelm', body: 'platemail' }]], items: { hitonic: 5, emberplume: 2, ether: 2 } },
    grave3: { party: [['raine', 26, 'reaper', 8, { weapon: 'flamberge', head: 'ashhelm', body: 'obsidianplate' }], ['miasma', 26, 'wyrmblood', 8, { weapon: 'dragonlance', head: 'ashhelm', body: 'obsidianplate' }], ['luna', 26, 'oathblade', 8, { weapon: 'flamberge', head: 'ashhelm', body: 'obsidianplate' }], ['brakka', 26, 'freelancer', 7, { weapon: 'handcannon', head: 'embercowl', body: 'salamanderhide' }]], items: { megatonic: 4, emberplume: 3, hiether: 2, ashsalve: 3 } },
    throneOld: { party: [['raine', 28, 'reaper', 7, { weapon: 'gravecleaver', head: 'sunhelm', body: 'platemail' }], ['miasma', 28, 'wyrmblood', 7, { weapon: 'tidespear', head: 'sunhelm', body: 'platemail' }], ['brakka', 28, 'freelancer', 7, { weapon: 'handcannon' }], ['verai', 28, 'arcanist', 7, { weapon: 'sagerod', head: 'circlet', body: 'sagerobe' }]], items: { hitonic: 6, megatonic: 4, emberplume: 3, ether: 3 } },
    forge: { party: [['raine', 24, 'reaper', 7, { weapon: 'flamberge', head: 'ashhelm', body: 'platemail' }], ['miasma', 24, 'wyrmblood', 7, { weapon: 'dragonlance', head: 'ashhelm', body: 'platemail' }], ['luna', 24, 'oathblade', 7, { weapon: 'flamberge', head: 'ashhelm', body: 'platemail' }], ['brakka', 24, 'freelancer', 6, { head: 'embercowl', body: 'salamanderhide' }]], items: { hitonic: 5, megatonic: 2, emberplume: 2, ether: 2 } },
    grave: { party: [['raine', 26, 'reaper', 8, { weapon: 'flamberge', head: 'ashhelm', body: 'obsidianplate' }], ['miasma', 26, 'wyrmblood', 8, { weapon: 'dragonlance', head: 'ashhelm', body: 'obsidianplate' }], ['luna', 26, 'oathblade', 8, { weapon: 'flamberge', head: 'ashhelm', body: 'obsidianplate' }], ['verai', 26, 'arcanist', 8, { weapon: 'emberrod', head: 'embercowl', body: 'ashrobe' }]], items: { megatonic: 4, emberplume: 3, hiether: 2, ashsalve: 3 } },
    throne: { party: [['raine', 28, 'reaper', 9, { weapon: 'gravecleaver', head: 'ashhelm', body: 'obsidianplate' }], ['miasma', 28, 'wyrmblood', 9, { weapon: 'dragonlance', head: 'ashhelm', body: 'obsidianplate' }], ['luna', 28, 'oathblade', 9, { weapon: 'dawnblade', head: 'ashhelm', body: 'obsidianplate' }], ['verai', 28, 'arcanist', 9, { weapon: 'emberrod', head: 'embercowl', body: 'ashrobe' }]], items: { megatonic: 5, emberplume: 3, hiether: 3, ashsalve: 3 } },
  };
  const which = process.argv[2];
  const cases = [
    ['start', ['lurker', 'lurker']], ['start', ['hob', 'hob', 'gel']],
    ['stag', ['silverwolf', 'silverwolf']], ['stag', ['veilstag']],
    ['votary', ['cinderimp', 'cinderimp', 'ashhound']], ['votary', ['votary']],
    ['chimera', ['gilder', 'sunwisp', 'sunwisp']], ['chimera', ['chimera']],
    ['colossus', ['mossogre', 'bloomling', 'bloomling']], ['colossus', ['bloomcolossus']],
    ['ember', ['cinderhound', 'cinderhound']], ['ember', ['ashimp', 'ashimp', 'ashimp']], ['ember', ['legionnaire', 'kobold', 'kobold']], ['ember', ['vorsk']],
    ['ember3', ['legionnaire', 'kobold', 'kobold']], ['ember3', ['vorsk']], ['grave3', ['ferryman']], ['grave3', ['veiledverai']],
    ['throneOld', ['ashkargod']], ['throneOld', ['kargath']],
    ['forge', ['magmagolem']], ['forge', ['kobold', 'kobold', 'kobold']], ['forge', ['cannongolem']],
    ['grave', ['ravenwraith', 'ravenwraith', 'ravenwraith']], ['grave', ['nightshade', 'nightshade']], ['grave', ['ferryman']],
    ['throne', ['cultist', 'cultist', 'cultist']], ['throne', ['crimsonguard', 'crimsonguard']], ['throne', ['ashkargod']], ['throne', ['kargath']],
  ];
  (async () => {
    for (const [p, e] of cases) if (!which || which === p) console.log(p.padEnd(9), e.join('+').padEnd(28), await fight(P[p], e, +process.argv[3] || 12));
    if (!which) console.log('sonia    ', await fight({ ...P.colossus, opts: { cantLose: true, turnLimit: 5 } }, ['sonia'], 4));
  })();
}
