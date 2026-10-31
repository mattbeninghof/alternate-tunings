const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const E = require(path.join(__dirname, '..', 'engine.js'));
global.window = {};
require(path.join(__dirname, '..', 'data.js'));
const D = global.window.TUNING_DATA;

const byId = (id) => D.TUNINGS.find((t) => t.id === id);

test('data: 39 tunings, unique ids, six strings each', () => {
  assert.equal(D.TUNINGS.length, 39);
  const ids = new Set(D.TUNINGS.map((t) => t.id));
  assert.equal(ids.size, 39);
  for (const t of D.TUNINGS) {
    assert.equal(t.midi.length, 6, t.name);
    assert.ok(D.CATEGORIES.some((c) => c.id === t.category) || t.category === 'standard', t.name);
    assert.ok(t.text.length > 40, t.name);
  }
});

test('note names and octaves', () => {
  assert.equal(E.sciName(40), 'E2');
  assert.equal(E.sciName(64), 'E4');
  assert.equal(E.noteName(58), 'A#');
  assert.equal(E.noteName(58, true), 'Bb');
  assert.ok(Math.abs(E.freq(69) - 440) < 1e-9);
});

test('retune and fret rows match the book (Modal G: -2 -2 0 0 +1 -2, frets 5 7 5 5 2)', () => {
  const t = byId('modal-g');
  assert.deepEqual(E.retune(t.midi), [-2, -2, 0, 0, 1, -2]);
  assert.deepEqual(E.fretRow(t.midi), [5, 7, 5, 5, 2]);
  assert.deepEqual(E.fretRow(E.STANDARD), [5, 5, 5, 4, 5]);
  assert.deepEqual(E.fretRow(byId('open-g').midi), [5, 7, 5, 4, 3]);
});

test('lefty and charango have unreachable fret rows where expected', () => {
  assert.deepEqual(E.fretRow(byId('lefty').midi), [null, null, null, null, null]);
  const ch = E.fretRow(byId('charango').midi);
  assert.equal(ch[0], null);
  assert.equal(ch[2], null); // C up to a lower E
});

test('parseTuningString accepts spaced, compact, and muted forms', () => {
  assert.deepEqual(E.parseTuningString('D A D G A D'), [2, 9, 2, 7, 9, 2]);
  assert.deepEqual(E.parseTuningString('DADGAD'), [2, 9, 2, 7, 9, 2]);
  assert.deepEqual(E.parseTuningString('DADF#AD'), [2, 9, 2, 6, 9, 2]);
  assert.deepEqual(E.parseTuningString('x G C E A E'), [null, 7, 0, 4, 9, 4]);
  assert.deepEqual(E.parseTuningString('Bb F Bb D F Bb'), [10, 5, 10, 2, 5, 10]);
  assert.equal(E.parseTuningString('D A D G A'), null);
  assert.equal(E.parseTuningString('H A D G A D'), null);
});

test('identifyChord names open-string chords', () => {
  const name = (id) => {
    const t = byId(id);
    const pcs = t.midi.filter((m) => m != null).map(E.pc);
    const bass = E.pc(t.midi.find((m) => m != null));
    const c = E.identifyChord(pcs, D.CHORD_TYPES, bass);
    return c && c.name;
  };
  assert.equal(name('open-g'), 'G Major');
  assert.equal(name('open-d-minor'), 'D Minor');
  assert.equal(name('modal-d'), 'D Suspended Fourth');
  assert.equal(name('buzzard'), 'C 7 Suspended Fourth');
  assert.equal(name('spirit'), 'A Major Seventh');
  assert.equal(name('minor-third'), 'C Diminished Seventh');
  assert.equal(name('pelican'), 'D Suspended Second');
});

test('identifyTuning reproduces the cross index', () => {
  const find = (s) => E.identifyTuning(E.parseTuningString(s), D.TUNINGS);
  // Louise = Drop D transposed down 3
  let m = find('B F# B E G# C#')[0];
  assert.equal(m.tuning.id, 'drop-d');
  assert.equal(m.transpose, -3);
  assert.equal(E.describeMatch(m), 'Drop D transposed down 3');
  // A tuning = Open G up 2
  m = find('E A E A C# E')[0];
  assert.equal(m.tuning.id, 'open-g');
  assert.equal(m.transpose, 2);
  // Bluebird = Open G with string 5 raised 2
  // Bluebird is one string from both Open G and Modal D; both are listed
  const blue = find('D A D G B D');
  assert.deepEqual(blue.slice(0, 2).map((x) => x.tuning.id).sort(), ['modal-d', 'open-g']);
  m = blue.find((x) => x.tuning.id === 'open-g');
  assert.deepEqual(m.diffs, [{ string: 5, delta: 2 }]);
  assert.equal(E.describeMatch(m), 'Open G with string 5 raised 2');
  // Exact catalog entry comes back with distance 0
  m = find('D A D G A D')[0];
  assert.equal(m.tuning.id, 'modal-d');
  assert.equal(m.distance, 0);
});

test('findVoicings: standard tuning yields the open E major and barred F major', () => {
  const maj = D.CHORD_TYPES.find((c) => c.abbr === 'maj');
  const e = E.findVoicings(E.STANDARD, 4, maj.intervals, { limit: 50 });
  assert.ok(e.some((v) => v.frets.join(',') === '0,2,2,1,0,0'), 'open E shape present');
  const f = E.findVoicings(E.STANDARD, 5, maj.intervals, { limit: 50 });
  const barreF = f.find((v) => v.frets.join(',') === '1,3,3,2,1,1');
  assert.ok(barreF, 'barred F present');
  assert.ok(barreF.barre && barreF.barre.fret === 1);
  assert.deepEqual(barreF.fingers, [1, 3, 4, 2, 1, 1]);
});

test('findVoicings: every voicing contains all required tones and obeys the span', () => {
  for (const t of D.TUNINGS) {
    for (const ct of D.CHORD_TYPES.slice(0, 6)) {
      const vs = E.findVoicings(t.midi, 0, ct.intervals, { limit: 10 });
      for (const v of vs) {
        const fretted = v.frets.filter((f) => f > 0);
        if (fretted.length) assert.ok(Math.max(...fretted) - Math.min(...fretted) < 4, t.name + ' span');
        const pcs = new Set(v.frets.map((f, i) => (f < 0 ? null : E.pc(t.midi[i] + f))).filter((p) => p != null));
        for (const iv of ct.intervals) {
          if (ct.intervals.length >= 5 && iv === 7) continue;
          assert.ok(pcs.has(E.mod12(iv)), `${t.name} ${ct.abbr} missing tone ${iv}`);
        }
        assert.ok(v.fingers.filter((x) => x > 0).length <= 4 || v.barre, 'finger count');
      }
    }
  }
});

test('open-G chord: the all-open voicing is the top result for G major', () => {
  const maj = D.CHORD_TYPES.find((c) => c.abbr === 'maj');
  const v = E.findVoicings(byId('open-g').midi, 7, maj.intervals);
  assert.equal(v[0].frets.join(','), '0,0,0,0,0,0');
});

test('chordChart returns a usable chart for every tuning', () => {
  for (const t of D.TUNINGS) {
    const chart = E.chordChart(t.midi, D.CHORD_TYPES, { perChord: 1 });
    assert.ok(chart.chords.length >= 10, t.name + ' chart has ' + chart.chords.length);
  }
});

test('scaleMap marks roots and degrees', () => {
  const major = D.SCALE_TYPES[0];
  const map = E.scaleMap(byId('open-g').midi, 7, major.intervals, 12);
  // low D string: D(5th) at 0, E at 2, F# at 4, G root at 5
  const low = map[0];
  assert.deepEqual(low.slice(0, 4).map((n) => n.fret), [0, 2, 4, 5]);
  assert.equal(low[3].isRoot, true);
  assert.equal(low[0].degree, 5);
});

test('relatedTunings: Open G neighbors include Modal G and Open G Minor', () => {
  const rel = E.relatedTunings(byId('open-g'), D.TUNINGS).map((m) => m.tuning.id);
  assert.ok(rel.includes('modal-g'));
  assert.ok(rel.includes('open-g-minor'));
});

test('parseChordSymbol reads common chart spellings, extensions and slash basses', () => {
  const p = (s) => E.parseChordSymbol(s, D.CHORD_TYPES);
  assert.equal(p('G').type.abbr, 'maj');
  assert.equal(p('Am7').type.abbr, 'min7');
  assert.equal(p('F#m7b5').type.abbr, 'm7b5');
  assert.equal(p('Bbmaj7').root, 10);
  assert.equal(p('Bbmaj7').symbol, 'Bbmaj7');
  assert.equal(p('C6/9').type.abbr, '6/9');
  assert.equal(p('C6/9').bass, null);
  assert.equal(p('G/B').bass, 11);
  assert.equal(p('A9').type.abbr, '9');
  assert.equal(p('Dm9').type.abbr, 'min9');
  assert.equal(p('E7#9').type.abbr, '7#9');
  assert.equal(p('Cdim7').type.abbr, 'dim7');
  assert.equal(p('E+').type.abbr, 'aug');
  assert.equal(p('Gsus').type.abbr, 'sus4');
  assert.equal(p('F13').type.abbr, '13');
  assert.equal(p('H7'), null);
  assert.equal(p('Gxyz'), null);
  const prog = E.parseProgression('G  Em7 | C, D7/F# Hm', D.CHORD_TYPES);
  assert.deepEqual(prog.map((x) => x.ok), [true, true, true, true, false]);
});

test('findVoicings honors a requested bass note and optional tones', () => {
  const maj = D.CHORD_TYPES.find((c) => c.abbr === 'maj');
  const gOverB = E.findVoicings(E.STANDARD, 7, maj.intervals, { bassPc: 11, limit: 5 });
  assert.ok(gOverB.length > 0);
  assert.equal(gOverB[0].bassPc, 11);
  const thirteen = D.CHORD_TYPES.find((c) => c.abbr === '13');
  const vs = E.findVoicings(E.STANDARD, 7, thirteen.intervals, { optional: thirteen.optional, limit: 5 });
  assert.ok(vs.length > 0, 'a G13 voicing exists in standard tuning');
});
