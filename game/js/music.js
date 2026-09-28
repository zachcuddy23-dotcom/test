'use strict';
// ---------------------------------------------------------------------------
// Original chiptune tracks. Each step is a 16th note.
// mel("E5:2 r:2 G5:4") -> note tokens; '-' holds, '.' rests
// ---------------------------------------------------------------------------
function mel(str) {
  const out = [];
  for (const tok of str.trim().split(/\s+/)) {
    const [n, d] = tok.split(':'), dur = +(d || 2);
    out.push(n === 'r' ? '.' : n); for (let i = 1; i < dur; i++) out.push(n === 'r' ? '.' : '-');
  }
  return out;
}
const CH = { // bass figures per chord (4 notes, 8ths, repeated)
  C: 'C3 G3 C4 G3', D: 'D3 A3 D4 A3', Dm: 'D3 A3 D4 A3', E: 'E2 B2 E3 B2', Em: 'E2 B2 E3 B2', F: 'F2 C3 F3 C3', G: 'G2 D3 G3 D3',
  A: 'A2 E3 A3 E3', Am: 'A2 E3 A3 E3', Bm: 'B2 F#3 B3 F#3', Bb: 'A#2 F3 A#3 F3', Gm: 'G2 D3 G3 D3', Cm: 'C3 G3 C4 G3', Ab: 'G#2 D#3 G#3 D#3', Eb: 'D#3 A#3 D#4 A#3', Fm: 'F2 C3 F3 C3',
};
function bass(chords, len = 2) { return mel(chords.split(' ').map(c => CH[c].split(' ').map(n => `${n}:${len}`).join(' ') + (len === 2 ? ' ' + CH[c].split(' ').map(n => `${n}:2`).join(' ') : '')).join(' ')); }
function pad(chords, steps = 16) { return mel(chords.split(' ').map(c => `${CH[c].split(' ')[0].replace(/\d/, m => +m + 1)}:${steps}`).join(' ')); }
const ARP = { Am: ['A3', 'C4', 'E4', 'A4', 'C5', 'E5', 'A5', 'E5'], F: ['F3', 'A3', 'C4', 'F4', 'A4', 'C5', 'F5', 'C5'], C: ['C3', 'E3', 'G3', 'C4', 'E4', 'G4', 'C5', 'G4'], G: ['G3', 'B3', 'D4', 'G4', 'B4', 'D5', 'G5', 'D5'], Em: ['E3', 'G3', 'B3', 'E4', 'G4', 'B4', 'E5', 'B4'], Dm: ['D3', 'F3', 'A3', 'D4', 'F4', 'A4', 'D5', 'A4'] };
function arp(chords) { const o = []; for (const c of chords.split(' ')) { const a = ARP[c]; o.push(...a, ...a.slice().reverse()); } return o; }
function drums(bars, pat = 'x...x...x...x...') { const o = []; for (let i = 0; i < bars; i++) for (const ch of pat) o.push(ch === 'x' ? 'N' : '.'); return o; }

const MUSIC = {
  prelude: { bpm: 100, loop: true, voices: [
    { type: 'triangle', vol: 0.22, seq: arp('Am F C G Am F Em Em') },
    { type: 'square', vol: 0.05, seq: mel('r:16 E5:8 D5:8 C5:8 B4:8 D5:16 C5:8 A4:8 B4:16 G4:16 r:16') },
  ] },
  field: { bpm: 124, loop: true, voices: [
    { type: 'square', vol: 0.09, seq: mel('A4:2 D5:2 F#5:2 A5:4 G5:2 F#5:2 E5:2  D5:4 B4:2 D5:2 G5:6 r:2  E5:2 F#5:2 G5:2 A5:2 B5:2 A5:2 G5:2 E5:2  F#5:6 E5:2 D5:8  B4:2 D5:2 F#5:2 B5:4 A5:2 F#5:2 D5:2  G5:4 F#5:2 E5:2 D5:4 B4:4  C#5:2 E5:2 A5:2 G5:2 F#5:2 E5:2 D5:2 C#5:2  E5:8 A4:8') },
    { type: 'triangle', vol: 0.25, seq: bass('D G A D Bm G A A') },
    { type: 'noise', vol: 0.04, seq: drums(8, 'x...x.x.x...x.x.') },
  ] },
  sea: { bpm: 108, loop: true, voices: [
    { type: 'square', vol: 0.08, seq: mel('D5:6 B4:2 G4:4 B4:4  C5:6 E5:2 G5:4 E5:4  D5:4 F#5:4 A5:4 F#5:4  G5:12 r:4  B4:6 D5:2 G5:4 D5:4  E5:6 C5:2 A4:4 C5:4  D5:4 C5:4 B4:4 A4:4  G4:12 r:4') },
    { type: 'triangle', vol: 0.25, seq: bass('G C D G G C D G') },
  ] },
  town: { bpm: 100, loop: true, voices: [
    { type: 'square', vol: 0.08, seq: mel('A4:4 C5:4 F5:6 E5:2  D5:2 E5:2 G5:4 E5:4 C5:4  D5:4 F5:4 A5:4 G5:2 F5:2  F5:8 D5:8  C5:4 A4:4 C5:4 F5:4  E5:4 G5:4 C6:4 G5:4  F5:4 D5:4 A#4:4 D5:4  C5:8 r:8') },
    { type: 'triangle', vol: 0.22, seq: bass('F C Dm Bb F C Bb C') },
  ] },
  town2: { bpm: 132, loop: true, voices: [
    { type: 'square', vol: 0.08, seq: mel('G4:2 C5:2 E5:2 C5:2 G5:4 E5:4  F5:2 E5:2 D5:2 C5:2 D5:8  G4:2 B4:2 D5:2 B4:2 F5:4 D5:4  E5:2 D5:2 C5:2 B4:2 C5:8') },
    { type: 'triangle', vol: 0.22, seq: bass('C G G C') },
    { type: 'noise', vol: 0.035, seq: drums(4, 'x.x.x.x.x.x.x.x.') },
  ] },
  castle: { bpm: 84, loop: true, voices: [
    { type: 'square', vol: 0.07, seq: mel('C5:8 E5:4 G5:4  F5:6 E5:2 D5:8  E5:4 G5:4 C6:6 B5:2  A5:8 G5:8  F5:4 A5:4 G5:4 E5:4  F5:4 D5:4 E5:4 C5:4  D5:6 E5:2 F5:4 D5:4  C5:16') },
    { type: 'triangle', vol: 0.22, seq: pad('C G C F F C G C') },
  ] },
  elf: { bpm: 88, loop: true, voices: [
    { type: 'triangle', vol: 0.22, seq: mel('E5:4 G5:4 B5:6 A5:2  G5:4 F#5:4 D5:8  C5:4 E5:4 G5:6 F#5:2  E5:8 D5:8  E5:4 B4:4 E5:4 G5:4  A5:6 G5:2 F#5:8  G5:4 E5:4 C5:4 D5:4  E5:16') },
    { type: 'square', vol: 0.04, seq: arp('Em G C G').concat(arp('Em G C Em')).slice(0, 128) },
  ] },
  dungeon: { bpm: 92, loop: true, voices: [
    { type: 'square', vol: 0.06, seq: mel('E4:6 G4:2 F#4:8  E4:6 B3:2 C4:8  E4:6 G4:2 A4:4 G4:4  F#4:8 D#4:8') },
    { type: 'triangle', vol: 0.26, seq: mel('E2:2 E3:2 E2:2 E3:2 E2:2 E3:2 E2:2 E3:2  C2:2 C3:2 C2:2 C3:2 C2:2 C3:2 C2:2 C3:2  A1:2 A2:2 A1:2 A2:2 A1:2 A2:2 A1:2 A2:2  B1:2 B2:2 B1:2 B2:2 B1:2 B2:2 B1:2 B2:2') },
  ] },
  cave: { bpm: 76, loop: true, voices: [
    { type: 'triangle', vol: 0.2, seq: mel('D4:4 F4:4 A4:4 G#4:4  A4:8 r:8  D4:4 F4:4 C5:4 A#4:4  A4:8 E4:8') },
    { type: 'square', vol: 0.04, seq: mel('r:8 D5:2 r:6 r:8 A4:2 r:6 r:8 F5:2 r:6 r:8 E5:2 r:6') },
    { type: 'triangle', vol: 0.2, seq: mel('D2:16 D2:16 A#1:16 A1:16') },
  ] },
  keep: { bpm: 70, loop: true, voices: [
    { type: 'square', vol: 0.06, seq: mel('C5:6 D#5:2 D5:8  G4:8 G#4:8  C5:6 D#5:2 G5:8  F#5:16') },
    { type: 'triangle', vol: 0.24, seq: mel('C2:4 C3:4 C2:4 C3:4 G#1:4 G#2:4 G#1:4 G#2:4 C2:4 C3:4 C2:4 C3:4 D2:4 D3:4 D2:4 D3:4') },
  ] },
  battle: { bpm: 152, loop: true, voices: [
    { type: 'square', vol: 0.08, seq: mel('A4:2 r:1 A4:1 G4:2 A4:2 C5:2 B4:2 A4:2 E4:2  A4:2 r:1 A4:1 G4:2 A4:2 E5:4 D5:2 C5:2  C5:2 A4:2 F4:2 A4:2 C5:4 B4:2 A4:2  B4:4 G4:2 B4:2 D5:4 B4:4  A4:2 r:1 A4:1 G4:2 A4:2 C5:2 B4:2 A4:2 E4:2  A4:2 C5:2 E5:2 A5:4 G5:2 E5:2 C5:2  F5:4 E5:2 D5:2 C5:4 A4:4  B4:4 G#4:4 E4:4 G#4:4') },
    { type: 'triangle', vol: 0.28, seq: bass('Am Am F G Am Am F E') },
    { type: 'noise', vol: 0.05, seq: drums(8, 'x.x.x.x.x.x.xxx.') },
  ] },
  boss: { bpm: 164, loop: true, voices: [
    { type: 'sawtooth', vol: 0.05, seq: mel('D5:2 D5:2 F5:2 D5:2 A5:4 G#5:2 A5:2  A#5:4 A5:2 G5:2 F5:4 E5:4  D5:2 D5:2 F5:2 D5:2 A5:4 C6:2 A#5:2  A5:8 C#5:8  G5:2 G5:2 A#5:2 G5:2 D6:4 C6:2 A#5:2  A5:4 G5:2 F5:2 E5:4 D5:4  F5:2 E5:2 D5:2 C#5:2 D5:2 E5:2 F5:2 G5:2  A5:8 A4:8') },
    { type: 'triangle', vol: 0.3, seq: bass('Dm Dm Bb A Gm Dm Bb A') },
    { type: 'noise', vol: 0.06, seq: drums(8, 'x.xxx.x.x.xxx.xx') },
  ] },
  victory: { bpm: 140, loop: false, voices: [
    { type: 'square', vol: 0.1, seq: mel('G4:2 C5:2 E5:2 G5:6 E5:2 G5:2 C6:12 r:4 A5:2 G5:2 F5:2 E5:2 D5:2 E5:2 F5:2 D5:2 C5:16') },
    { type: 'triangle', vol: 0.26, seq: mel('C3:6 G3:6 C4:12 r:8 F3:8 G3:8 C3:16') },
  ] },
};
