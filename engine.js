// Music engine for the Alternate Tuning Guide app.
// Pure functions, no DOM. Works in the browser (window.Engine) and in Node (module.exports).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Engine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const STANDARD = [40, 45, 50, 55, 59, 64];

  const mod12 = (n) => ((n % 12) + 12) % 12;
  const pc = (midi) => mod12(midi);
  const noteName = (midi, flats) => (flats ? FLAT_NAMES : NOTE_NAMES)[mod12(midi)];
  const octave = (midi) => Math.floor(midi / 12) - 1;
  const sciName = (midi, flats) => noteName(midi, flats) + octave(midi);
  const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  function parseNote(str) {
    if (str == null) return null;
    const s = String(str).trim();
    if (!s || /^x$/i.test(s)) return null;
    const m = s.match(/^([A-Ga-g])([#b]?)$/);
    if (!m) return undefined;
    let n = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[m[1].toLowerCase()];
    if (m[2] === '#') n += 1;
    if (m[2] === 'b') n -= 1;
    return mod12(n);
  }

  // Parse "D A D G A D", "DADGAD", "D-A-D-G-A-D", "x G C E A E" into pitch classes (null = muted).
  function parseTuningString(str) {
    if (!str) return null;
    let tokens = str.trim().split(/[\s,\-\/]+/).filter(Boolean);
    if (tokens.length === 1 && tokens[0].length > 1) {
      // compact form like DADGAD or DADF#AD
      tokens = tokens[0].match(/[A-Ga-gXx][#b]?/g) || [];
    }
    if (tokens.length !== 6) return null;
    const out = [];
    for (const t of tokens) {
      const p = parseNote(t);
      if (p === undefined) return null;
      out.push(p);
    }
    return out;
  }

  // Semitone change from standard for each string (null when the string is unused).
  function retune(midi) {
    return midi.map((m, i) => (m == null ? null : m - STANDARD[i]));
  }

  // Fret on string s (6..2) that sounds the open note of the next string up.
  // Returns array of 5 entries (string 6 to string 2). null when not reachable.
  function fretRow(midi) {
    const out = [];
    for (let i = 0; i < 5; i++) {
      const lo = midi[i], hi = midi[i + 1];
      if (lo == null || hi == null) { out.push(null); continue; }
      const f = hi - lo;
      out.push(f >= 0 && f <= 24 ? f : null);
    }
    return out;
  }

  // Intervals between adjacent strings in semitones.
  function stringIntervals(midi) {
    const out = [];
    for (let i = 0; i < midi.length - 1; i++) {
      if (midi[i] == null || midi[i + 1] == null) out.push(null);
      else out.push(midi[i + 1] - midi[i]);
    }
    return out;
  }

  const INTERVAL_NAMES = ['unison', 'minor 2nd', 'major 2nd', 'minor 3rd', 'major 3rd', 'perfect 4th', 'tritone', 'perfect 5th', 'minor 6th', 'major 6th', 'minor 7th', 'major 7th', 'octave'];
  function intervalName(semitones) {
    if (semitones == null) return '';
    const a = Math.abs(semitones);
    if (a <= 12) return INTERVAL_NAMES[a] + (semitones < 0 ? ' down' : '');
    const o = Math.floor(a / 12), r = a % 12;
    return (r === 0 ? o + ' octaves' : o + ' octave' + (o > 1 ? 's' : '') + ' + ' + INTERVAL_NAMES[r]) + (semitones < 0 ? ' down' : '');
  }

  function span(midi) {
    const v = midi.filter((m) => m != null);
    return Math.max(...v) - Math.min(...v);
  }

  // Identify a chord from a set of pitch classes. Returns {root, type, name} or null.
  // Prefers the fewest-interval match; ties go to roots that appear in the bass.
  function identifyChord(pcs, chordTypes, bassPc) {
    const set = new Set(pcs.filter((p) => p != null).map(mod12));
    if (set.size < 2) return null;
    let best = null;
    for (let r = 0; r < 12; r++) {
      for (const ct of chordTypes) {
        const tones = new Set(ct.intervals.map((i) => mod12(r + i)));
        if (tones.size !== set.size) continue;
        let ok = true;
        for (const p of set) if (!tones.has(p)) { ok = false; break; }
        if (!ok) continue;
        const score = (r === bassPc ? 0 : 10) + ct.intervals.length;
        if (!best || score < best.score) best = { root: r, type: ct, score };
      }
    }
    if (!best) return null;
    return { root: best.root, type: best.type, name: NOTE_NAMES[best.root] + ' ' + best.type.name };
  }

  // Describe an interval set loosely when no chord matches (e.g., "D sus4 add 2").
  function describePitchSet(pcs) {
    const set = [...new Set(pcs.filter((p) => p != null).map(mod12))];
    return set.map((p) => NOTE_NAMES[p]).join(' ');
  }

  // Notes on the fretboard: array (per string) of midi values for frets 0..nFrets.
  function fretboard(midi, nFrets) {
    return midi.map((open) => {
      if (open == null) return [];
      const row = [];
      for (let f = 0; f <= nFrets; f++) row.push(open + f);
      return row;
    });
  }

  function pitchSet(rootPc, intervals) {
    return new Set(intervals.map((i) => mod12(rootPc + i)));
  }

  // Chord voicing finder.
  // Returns voicings as { frets: [f6..f1] (-1 = muted), fingers: [..], position, score }.
  function findVoicings(midi, rootPc, intervals, opts) {
    opts = Object.assign({ maxFret: 12, span: 4, maxFingers: 4, limit: 24, allowOmitFifth: true }, opts || {});
    const tones = pitchSet(rootPc, intervals);
    const required = new Set(tones);
    // 9th chords and larger may omit the 5th; 7th chords may not. Types may declare their own optional tones.
    const optional = opts.optional || (opts.allowOmitFifth && intervals.length >= 5 && intervals.includes(7) ? [7] : []);
    for (const o of optional) required.delete(mod12(rootPc + o));
    const minSounding = Math.max(Math.min(2, tones.size), Math.min(required.size, 4), tones.size <= 2 ? 2 : 3);
    const nStr = midi.length;

    // candidate frets per string
    const cands = midi.map((open) => {
      if (open == null) return [-1];
      const c = [-1];
      for (let f = 0; f <= opts.maxFret; f++) if (tones.has(pc(open + f))) c.push(f);
      return c;
    });

    const results = [];
    const seen = new Set();
    const cur = new Array(nStr).fill(-1);

    function evaluate() {
      const sounding = [];
      for (let i = 0; i < nStr; i++) if (cur[i] >= 0) sounding.push(i);
      if (sounding.length < minSounding) return;
      // sounding strings must be contiguous (mute only from the outside)
      if (sounding[sounding.length - 1] - sounding[0] + 1 !== sounding.length) return;
      const pcs = new Set(sounding.map((i) => pc(midi[i] + cur[i])));
      for (const r of required) if (!pcs.has(r)) return;
      const fretted = sounding.filter((i) => cur[i] > 0);
      let fingers = fretted.length;
      let barre = null;
      if (fretted.length > opts.maxFingers) {
        const minF = Math.min(...fretted.map((i) => cur[i]));
        const barreStrings = fretted.filter((i) => cur[i] === minF);
        if (barreStrings.length < 2) return;
        const start = barreStrings[0];
        // no open strings above the barre start
        for (const i of sounding) if (i >= start && cur[i] === 0) return;
        fingers = 1 + fretted.filter((i) => cur[i] > minF).length;
        if (fingers > opts.maxFingers) return;
        barre = { fret: minF, from: start, to: sounding[sounding.length - 1] };
      }
      const key = cur.join(',');
      if (seen.has(key)) return;
      seen.add(key);

      const bassPc = pc(midi[sounding[0]] + cur[sounding[0]]);
      const maxFret = fretted.length ? Math.max(...fretted.map((i) => cur[i])) : 0;
      const minFret = fretted.length ? Math.min(...fretted.map((i) => cur[i])) : 0;
      const midis = sounding.map((i) => midi[i] + cur[i]);
      const distinctMidis = new Set(midis).size;
      // scoring: lower is better
      let score = 0;
      const fifthPc = mod12(rootPc + 7);
      if (opts.bassPc != null) score += bassPc === opts.bassPc ? 0 : 9; // slash chord: asked-for bass note
      else score += bassPc === rootPc ? 0 : (bassPc === fifthPc ? 1.5 : 5); // root (or fifth) in the bass
      score += (nStr - sounding.length) * 2;       // more strings
      score += fingers * 1.5;                      // fewer fingers
      score += minFret * 0.6;                      // lower on the neck
      score += (maxFret - minFret) * 0.5;          // tighter hand
      score += (midis.length - distinctMidis) * 1; // avoid unisons
      score += barre ? 1 : 0;
      // reward each chord tone appearing (fuller harmony)
      score -= pcs.size * 0.5;
      results.push({ frets: cur.slice(), fingers: assignFingers(cur, barre), barre, position: minFret || 0, score, bassPc });
    }

    function dfs(i, lo, hi) {
      if (i === nStr) { evaluate(); return; }
      for (const f of cands[i]) {
        let nlo = lo, nhi = hi;
        if (f > 0) {
          nlo = Math.min(lo, f); nhi = Math.max(hi, f);
          if (nhi - nlo >= opts.span) continue;
        }
        cur[i] = f;
        dfs(i + 1, nlo, nhi);
      }
      cur[i] = -1;
    }
    dfs(0, Infinity, -Infinity);
    results.sort((a, b) => a.score - b.score);
    // drop voicings that are only a muted-down copy of a fuller voicing already kept
    const kept = [];
    for (const c of results) {
      const dup = kept.some((a) => c.frets.every((f, i) => f < 0 || a.frets[i] === f));
      if (!dup) kept.push(c);
      if (kept.length >= opts.limit) break;
    }
    return kept;
  }

  // Assign finger numbers (1-4) to a voicing for display, like the book's charts.
  function assignFingers(frets, barre) {
    const fingers = frets.map(() => 0);
    const fretted = [];
    frets.forEach((f, i) => { if (f > 0) fretted.push(i); });
    let next = 1;
    if (barre) {
      fretted.forEach((i) => { if (frets[i] === barre.fret && i >= barre.from) fingers[i] = 1; });
      next = 2;
    }
    const rest = fretted.filter((i) => fingers[i] === 0).sort((a, b) => frets[a] - frets[b] || a - b);
    for (const i of rest) { fingers[i] = Math.min(next, 4); next++; }
    return fingers;
  }

  // Capo: the open strings sound `capo` semitones higher; shapes are unchanged.
  function withCapo(midi, capo) {
    capo = capo | 0;
    return midi.map((m) => (m == null ? null : m + capo));
  }

  // Which capo fret (0..maxCapo) gives the easiest shapes for a list of parsed chords.
  // Returns [{capo, cost, missing}] sorted easiest first.
  function suggestCapo(midi, chords, opts) {
    opts = Object.assign({ maxCapo: 7 }, opts || {});
    const out = [];
    for (let capo = 0; capo <= opts.maxCapo; capo++) {
      const eff = withCapo(midi, capo);
      let cost = 0, missing = 0;
      for (const c of chords) {
        const vs = findVoicings(eff, c.root, c.type.intervals, { limit: 1, bassPc: c.bass, optional: c.type.optional });
        if (vs.length) cost += vs[0].score; else { cost += 30; missing++; }
      }
      out.push({ capo, cost, missing });
    }
    out.sort((a, b) => a.cost - b.cost || a.capo - b.capo);
    return out;
  }

  // Chord symbol parsing: "G", "Am7", "F#m7b5", "Bbmaj7", "D7sus4", "C6/9", "G/B", "Cdim7", "E+".
  const SUFFIX_ALIASES = {
    '': 'maj', 'maj': 'maj', 'major': 'maj', 'M': 'maj',
    'm': 'min', 'min': 'min', 'minor': 'min', '-': 'min',
    '7': '7', 'dom7': '7',
    'maj7': 'maj7', 'M7': 'maj7', 'Δ': 'maj7', 'Δ7': 'maj7', 'ma7': 'maj7',
    'm7': 'min7', 'min7': 'min7', '-7': 'min7', 'mi7': 'min7',
    '6': '6', 'maj6': '6', 'M6': '6',
    'maj9': 'maj9', 'M9': 'maj9', 'Δ9': 'maj9',
    '9': '9', 'dom9': '9',
    '6/9': '6/9', '69': '6/9', '6add9': '6/9', '6-9': '6/9',
    'm6': 'min6', 'min6': 'min6', '-6': 'min6',
    'm9': 'min9', 'min9': 'min9', '-9': 'min9',
    'm7b5': 'm7b5', 'min7b5': 'm7b5', 'ø': 'm7b5', 'ø7': 'm7b5', 'm7-5': 'm7b5', '-7b5': 'm7b5', 'half-dim': 'm7b5',
    '7b9': '7b9', '7-9': '7b9',
    '7#9': '7#9', '7+9': '7#9',
    'dim': 'dim', 'o': 'dim', '°': 'dim', 'mb5': 'dim',
    'dim7': 'dim7', 'o7': 'dim7', '°7': 'dim7',
    'aug': 'aug', '+': 'aug', '#5': 'aug', 'maj#5': 'aug',
    'aug7': 'aug7', '+7': 'aug7', '7#5': 'aug7', '7+5': 'aug7', '7+': 'aug7',
    'sus4': 'sus4', 'sus': 'sus4',
    '7sus4': '7sus4', '7sus': '7sus4',
    'sus2': 'sus2',
    'add9': 'add9', 'add2': 'add9', '2': 'add9',
    'madd9': 'madd9', 'madd2': 'madd9', 'm2': 'madd9', 'min add9': 'madd9', 'minadd9': 'madd9',
    'mmaj7': 'mmaj7', 'mM7': 'mmaj7', 'm(maj7)': 'mmaj7', 'minmaj7': 'mmaj7', '-Δ7': 'mmaj7', 'mΔ7': 'mmaj7',
    '11': '11', 'm11': 'min11', 'min11': 'min11', '-11': 'min11',
    '13': '13', 'maj13': 'maj13', 'M13': 'maj13',
    '5': '5', 'power': '5'
  };

  function parseChordSymbol(sym, chordTypes) {
    if (!sym) return null;
    let s = String(sym).trim().replace(/\s+/g, '');
    if (!s) return null;
    let bass = null;
    const slash = s.match(/^(.+)\/([A-Ga-g][#b]?)$/); // "G/B"; "C6/9" does not match because 9 is not a note
    if (slash) { s = slash[1]; bass = parseNote(slash[2]); if (bass == null) return null; }
    const m = s.match(/^([A-Ga-g])([#b♯♭]?)(.*)$/);
    if (!m) return null;
    const root = parseNote(m[1] + m[2].replace('♯', '#').replace('♭', 'b'));
    if (root == null) return null;
    let suffix = m[3].replace(/[()]/g, '');
    let abbr = SUFFIX_ALIASES[suffix];
    if (abbr == null) abbr = SUFFIX_ALIASES[suffix.toLowerCase()];
    if (abbr == null) {
      // tolerate "maj" vs "Maj", "Min", "MIN"
      const lower = suffix.toLowerCase().replace(/^maj/, 'maj').replace(/^min/, 'min');
      abbr = SUFFIX_ALIASES[lower];
    }
    if (abbr == null) return null;
    const type = chordTypes.find((c) => c.abbr === abbr);
    if (!type) return null;
    const spelledRoot = m[1].toUpperCase() + m[2].replace('♯', '#').replace('♭', 'b');
    return { root, type, bass, symbol: spelledRoot + (type.abbr === 'maj' ? '' : type.abbr) + (bass != null ? '/' + slash[2][0].toUpperCase() + slash[2].slice(1) : '') };
  }

  // Parse a line like "G  Em7 | C  D7/F#" into chord entries; unknown tokens are kept with ok=false.
  function parseProgression(text, chordTypes) {
    const tokens = String(text || '').split(/[\s|,]+/).filter(Boolean);
    return tokens.map((raw) => {
      const parsed = parseChordSymbol(raw, chordTypes);
      return parsed ? Object.assign({ raw, ok: true }, parsed) : { raw, ok: false };
    });
  }

  // Build a chord chart for a tuning: a balanced set of chords in the tuning's natural key(s),
  // similar in spirit to the book's 30-chord pages.
  function chordChart(midi, chordTypes, opts) {
    opts = Object.assign({ perChord: 2 }, opts || {});
    const openPcs = midi.filter((m) => m != null).map(pc);
    const bass = midi.find((m) => m != null);
    const openChord = identifyChord(openPcs, chordTypes, pc(bass));
    const key = openChord ? openChord.root : pc(bass);
    const byAbbr = Object.fromEntries(chordTypes.map((c) => [c.abbr, c]));
    // I, IV, V, vi, ii, iii plus sevenths and colors
    const plan = [
      [0, 'maj'], [5, 'maj'], [7, 'maj'], [9, 'min'], [2, 'min'], [4, 'min'],
      [0, '7'], [7, '7'], [5, '7'], [9, 'min7'], [2, 'min7'],
      [0, 'maj7'], [5, 'maj7'], [0, 'sus4'], [7, 'sus4'], [0, '7sus4'], [0, '6'], [0, 'sus2'], [9, 'min6'], [2, 'm7b5']
    ];
    const out = [];
    for (const [deg, abbr] of plan) {
      const ct = byAbbr[abbr];
      if (!ct) continue;
      const r = mod12(key + deg);
      const v = findVoicings(midi, r, ct.intervals, { limit: opts.perChord });
      for (const voicing of v) out.push({ root: r, type: ct, label: NOTE_NAMES[r] + ' ' + ct.abbr, voicing });
    }
    return { key, openChord, chords: out };
  }

  // Tuning identifier: compare six pitch classes against the catalog.
  // Returns matches sorted by closeness: exact transposition first, then one-string variants.
  function identifyTuning(inputPcs, tunings) {
    const matches = [];
    for (const t of tunings) {
      const tp = t.midi.map((m) => (m == null ? null : pc(m)));
      for (let k = 0; k < 12; k++) {
        let diffs = [];
        let mutedMismatch = false;
        for (let i = 0; i < 6; i++) {
          const a = inputPcs[i], b = tp[i];
          if (a == null && b == null) continue;
          if (a == null || b == null) { mutedMismatch = true; break; }
          const d = mod12(a - (b + k));
          if (d !== 0) diffs.push({ string: 6 - i, delta: d > 6 ? d - 12 : d });
        }
        if (mutedMismatch) continue;
        if (diffs.length === 0) {
          matches.push({ tuning: t, transpose: k > 6 ? k - 12 : k, diffs: [], distance: 0 });
        } else if (diffs.length === 1) {
          const kk = k > 6 ? k - 12 : k;
          matches.push({ tuning: t, transpose: kk, diffs, distance: 1 + Math.abs(diffs[0].delta) * 0.1 + Math.abs(kk) * 0.01 });
        }
      }
    }
    matches.sort((a, b) => a.distance - b.distance || Math.abs(a.transpose) - Math.abs(b.transpose));
    // keep the best entry per tuning
    const seen = new Set();
    return matches.filter((m) => { if (seen.has(m.tuning.id)) return false; seen.add(m.tuning.id); return true; });
  }

  function describeMatch(m) {
    const parts = [m.tuning.name];
    if (m.transpose !== 0) parts.push('transposed ' + (m.transpose > 0 ? 'up ' : 'down ') + Math.abs(m.transpose));
    for (const d of m.diffs) parts.push('with string ' + d.string + (d.delta > 0 ? ' raised ' : ' lowered ') + Math.abs(d.delta));
    return parts.join(' ');
  }

  // Related tunings within the catalog: transpositions and one-string neighbors.
  function relatedTunings(tuning, tunings) {
    const pcs = tuning.midi.map((m) => (m == null ? null : pc(m)));
    return identifyTuning(pcs, tunings).filter((m) => m.tuning.id !== tuning.id);
  }

  // Scale positions on the fretboard: returns per-string arrays of {fret, pc, isRoot}.
  function scaleMap(midi, rootPc, intervals, nFrets) {
    const set = pitchSet(rootPc, intervals);
    return midi.map((open) => {
      if (open == null) return [];
      const out = [];
      for (let f = 0; f <= nFrets; f++) {
        const p = pc(open + f);
        if (set.has(p)) out.push({ fret: f, pc: p, isRoot: p === rootPc, degree: intervals.indexOf(mod12(p - rootPc)) + 1 });
      }
      return out;
    });
  }

  return {
    NOTE_NAMES, FLAT_NAMES, STANDARD, mod12, pc, noteName, octave, sciName, freq,
    parseNote, parseTuningString, retune, fretRow, stringIntervals, intervalName, span,
    identifyChord, describePitchSet, fretboard, pitchSet, findVoicings, assignFingers,
    chordChart, identifyTuning, describeMatch, relatedTunings, scaleMap,
    parseChordSymbol, parseProgression, SUFFIX_ALIASES, withCapo, suggestCapo
  };
});
