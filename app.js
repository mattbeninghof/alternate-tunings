// Alternate Tuning Guide: UI and audio. Depends on data.js (window.TUNING_DATA) and engine.js (window.Engine).
(function () {
  'use strict';
  const D = window.TUNING_DATA;
  const E = window.Engine;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const FRETS = 12;
  const SHORT_IV = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'];
  const PDF = D.SOURCE.url;

  const state = {
    route: 'home', tuning: null, custom: null,
    scaleRoot: null, scaleType: 'major', chordRoot: null, chordType: 'maj', chordTab: 'find', filter: '',
    progression: '', capo: 0
  };
  try {
    state.progression = localStorage.getItem('atg.progression') || '';
    state.capo = Math.max(0, Math.min(9, parseInt(localStorage.getItem('atg.capo') || '0', 10) || 0));
  } catch (e) { /* storage unavailable */ }

  // ---------- helpers ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const h = (strings, ...vals) => strings.reduce((a, s, i) => a + s + (i < vals.length ? vals[i] : ''), '');
  const notesOf = (midi) => midi.map((m) => (m == null ? 'X' : E.noteName(m))).join(' ');
  const compact = (s) => s.replace(/\s+/g, '').toUpperCase();
  const byId = (id) => D.TUNINGS.find((t) => t.id === id);
  const catName = (id) => (id === 'standard' ? 'Reference' : (D.CATEGORIES.find((c) => c.id === id) || {}).name || '');
  function shortInterval(n) {
    if (n == null) return '';
    const a = Math.abs(n);
    if (a <= 12) return SHORT_IV[a] + (n < 0 ? '↓' : '');
    return (a % 12 === 0 ? (a / 12) + 'oct' : 'P8+' + SHORT_IV[a % 12]) + (n < 0 ? '↓' : '');
  }
  function openChordOf(midi) {
    const pcs = midi.filter((m) => m != null).map(E.pc);
    const bass = midi.find((m) => m != null);
    return E.identifyChord(pcs, D.CHORD_TYPES, E.pc(bass));
  }
  const article = (name) => (/^[AEF]/.test(name) ? 'an' : 'a');
  function ordinal(n) { const r = n % 100; if (r >= 11 && r <= 13) return n + 'th'; return n + (['th', 'st', 'nd', 'rd'][n % 10] || 'th'); }
  function chordLabel(rootPc, type) { return E.NOTE_NAMES[rootPc] + ' ' + type.abbr; }
  function customFromPcs(pcs) {
    const midi = pcs.map((p, i) => {
      if (p == null) return null;
      const base = E.STANDARD[i];
      let best = null;
      for (let m = base - 7; m <= base + 7; m++) if (E.pc(m) === p && (best == null || Math.abs(m - base) < Math.abs(best - base))) best = m;
      return best;
    });
    return { id: 'custom', name: 'Custom tuning', category: 'custom', midi, text: '' };
  }

  // ---------- audio ----------
  const Audio = window.GuitarAudio;

  // ---------- SVG builders ----------
  function fretboardSVG(midi, scaleRoot, scaleIntervals, capo) {
    capo = capo | 0;
    const nStr = midi.length;
    const labelW = 44, fretW = 68, rowH = 30, top = 22, bottom = 26;
    const nutX = labelW + fretW;
    const W = nutX + FRETS * fretW + 8, H = top + nStr * rowH + bottom;
    const map = scaleRoot != null ? E.scaleMap(midi, scaleRoot, scaleIntervals, FRETS) : null;
    let s = `<svg class="fretboard" viewBox="0 0 ${W} ${H}" role="img" aria-label="Fretboard note map${capo ? ', capo at fret ' + capo : ''}">`;
    if (capo) s += `<rect class="capo-shade" x="${labelW}" y="${top - 6}" width="${nutX + (capo - 1) * fretW + fretW * 0.55 - labelW}" height="${nStr * rowH + 8}" rx="6"/>`;
    // fret markers
    [3, 5, 7, 9].forEach((f) => { const x = nutX + (f - 0.5) * fretW; s += `<circle class="marker" cx="${x}" cy="${top + nStr * rowH / 2}" r="7"/>`; });
    { const x = nutX + 11.5 * fretW; s += `<circle class="marker" cx="${x}" cy="${top + nStr * rowH / 2 - 26}" r="7"/><circle class="marker" cx="${x}" cy="${top + nStr * rowH / 2 + 26}" r="7"/>`; }
    // wires
    for (let f = 0; f <= FRETS; f++) {
      const x = nutX + f * fretW;
      s += `<line class="${f === 0 ? 'nut' : 'wire'}" x1="${x}" y1="${top}" x2="${x}" y2="${top + (nStr - 1) * rowH + rowH / 2 + 4}"/>`;
    }
    // strings (string 1 on top)
    for (let i = 0; i < nStr; i++) {
      const si = nStr - 1 - i; // index into midi
      const y = top + i * rowH + rowH / 2;
      if (midi[si] == null) {
        s += `<text class="label" x="${labelW - 6}" y="${y + 3}" text-anchor="end">${si === 0 ? '6' : nStr - si}</text><text class="name" x="${labelW + 6}" y="${y + 3}">not used</text>`;
        continue;
      }
      s += `<line class="str" x1="${labelW}" y1="${y}" x2="${W - 8}" y2="${y}" stroke-width="${1 + (si / (nStr - 1)) * 1.6}"/>`;
      s += `<text class="label" x="${labelW - 6}" y="${y + 3}" text-anchor="end">${nStr - si}</text>`;
      for (let f = 0; f <= FRETS; f++) {
        const m = midi[si] + f;
        const x = f === 0 ? labelW + fretW / 2 : nutX + (f - 0.5) * fretW;
        const behindCapo = capo && f < capo;
        if (behindCapo) { s += `<text class="name behind" x="${x}" y="${y + 3}" text-anchor="middle">${E.noteName(m)}</text>`; continue; }
        const hit = map && map[si].find((n) => n.fret === f);
        if (hit) {
          s += `<circle class="dot${hit.isRoot ? ' root' : ''}" cx="${x}" cy="${y}" r="${hit.isRoot ? 12.5 : 11.5}"/><text class="dot-text" x="${x}" y="${y + 3.8}" text-anchor="middle">${E.noteName(m)}</text>`;
        } else {
          s += `<text class="name" x="${x}" y="${y + 3}" text-anchor="middle">${E.noteName(m)}</text>`;
        }
        s += `<rect class="hit" x="${x - fretW / 2}" y="${y - rowH / 2}" width="${fretW}" height="${rowH}" data-midi="${m}" data-string="${nStr - si}" data-fret="${f}"></rect>`;
      }
    }
    if (capo) {
      const cx = nutX + (capo - 1) * fretW + fretW * 0.72;
      s += `<rect class="capo" x="${cx - 5}" y="${top - 8}" width="10" height="${(nStr - 1) * rowH + rowH / 2 + 12}" rx="5"/><text class="capo-label" x="${cx}" y="${top - 11}" text-anchor="middle">capo</text>`;
    }
    // fret numbers
    for (let f = 1; f <= FRETS; f++) s += `<text class="label" x="${nutX + (f - 0.5) * fretW}" y="${H - 8}" text-anchor="middle">${f}</text>`;
    s += `<text class="label" x="${labelW + fretW / 2}" y="${H - 8}" text-anchor="middle">open</text>`;
    s += '</svg>';
    return s;
  }

  function diagramSVG(midi, v, rootPc, capo) {
    capo = capo | 0;
    const n = midi.length, colW = 14, x0 = 18, nutY = 26, fretH = 18, rows = 5;
    const fretted = v.frets.filter((f) => f > 0);
    const minF = fretted.length ? Math.min(...fretted) : 1;
    const maxF = fretted.length ? Math.max(...fretted) : 1;
    const base = maxF <= rows ? 1 : minF;
    const W = 106, H = nutY + rows * fretH + 8;
    let s = `<svg class="diagram" viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
    for (let r = 0; r <= rows; r++) {
      const y = nutY + r * fretH;
      s += `<line class="${r === 0 && base === 1 ? (capo ? 'd-capo' : 'd-nut') : 'd-wire'}" x1="${x0}" y1="${y}" x2="${x0 + (n - 1) * colW}" y2="${y}"/>`;
    }
    if (capo && base === 1) s += `<text class="d-pos" x="${x0 - 5}" y="${nutY + 3}" text-anchor="end">c${capo}</text>`;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * colW;
      s += `<line class="d-str" x1="${x}" y1="${nutY}" x2="${x}" y2="${nutY + rows * fretH}"/>`;
      const f = v.frets[i];
      if (f < 0) s += `<path class="d-mute" d="M${x - 3} ${nutY - 13}l6 6M${x + 3} ${nutY - 13}l-6 6"/>`;
      else if (f === 0) s += `<circle class="d-open" cx="${x}" cy="${nutY - 10}" r="3.2"/>`;
    }
    if (base > 1) s += `<text class="d-pos" x="${x0 - 7}" y="${nutY + fretH / 2 + 3}" text-anchor="end">${base}</text>`;
    if (v.barre) {
      const y = nutY + (v.barre.fret - base + 0.5) * fretH;
      s += `<line class="d-barre" x1="${x0 + v.barre.from * colW}" y1="${y}" x2="${x0 + v.barre.to * colW}" y2="${y}"/>`;
    }
    for (let i = 0; i < n; i++) {
      const f = v.frets[i];
      if (f <= 0) continue;
      const x = x0 + i * colW, y = nutY + (f - base + 0.5) * fretH;
      const isRoot = E.pc(midi[i] + f) === rootPc;
      s += `<circle class="d-dot${isRoot ? ' root' : ''}" cx="${x}" cy="${y}" r="6"/>`;
      if (v.fingers[i]) s += `<text class="d-finger" x="${x}" y="${y + 2.7}" text-anchor="middle">${v.fingers[i]}</text>`;
    }
    s += '</svg>';
    return s;
  }

  function circleSVG() {
    const R = 86, cx = 110, cy = 110;
    let s = `<svg viewBox="0 0 220 220" width="220" height="220" role="img" aria-label="Circle of notes"><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#C2BBAB" stroke-width="1" stroke-dasharray="3 3"/>`;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      const sharp = E.NOTE_NAMES[i].includes('#');
      s += `<circle cx="${x}" cy="${y}" r="15" fill="${sharp ? '#1C1B19' : '#F7F4EC'}" stroke="#1C1B19" stroke-width="1.2"/><text x="${x}" y="${y + 3.5}" text-anchor="middle" font-size="10" font-weight="500" fill="${sharp ? '#F7F4EC' : '#1C1B19'}" font-family="JetBrains Mono, monospace">${E.NOTE_NAMES[i]}</text>`;
    }
    s += `<path d="M${cx + 30} ${cy - 40} A50 50 0 0 1 ${cx + 48} ${cy - 10}" fill="none" stroke="#F04E23" stroke-width="1.5" marker-end="url(#arrow)"/><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="#F04E23"/></marker></defs><text x="${cx}" y="${cy + 3}" text-anchor="middle" font-size="7.5" letter-spacing=".08" fill="#8A867C" font-family="JetBrains Mono, monospace">ONE FRET = ONE STEP CLOCKWISE</text></svg>`;
    return s;
  }

  // ---------- nav ----------
  function renderNav() {
    const nav = $('#sideNav');
    const q = state.filter.trim();
    const qc = compact(q);
    const match = (t) => !q || t.name.toLowerCase().includes(q.toLowerCase()) || compact(notesOf(t.midi)).includes(qc) || compact(notesOf(t.midi).replace(/#/g, 's')).includes(qc.replace(/#/g, 'S'));
    const groups = [{ id: 'standard', name: 'Reference' }].concat(D.CATEGORIES);
    let out = '', any = false;
    for (const g of groups) {
      const all = D.TUNINGS.filter((t) => t.category === g.id);
      const items = all.filter(match);
      if (!items.length) continue;
      any = true;
      out += `<div class="nav-group"><div class="nav-group-title"><span>${esc(g.name)}</span><span>${String(items.length).padStart(2, '0')}/${String(all.length).padStart(2, '0')}</span></div>`;
      for (const t of items) {
        const active = state.route === 'tuning' && state.tuning && state.tuning.id === t.id;
        const idx = String(D.TUNINGS.indexOf(t)).padStart(2, '0');
        out += `<a class="nav-link${active ? ' active' : ''}" href="#t/${t.id}" ${active ? 'aria-current="page"' : ''}><span class="idx">[${idx}]</span><span>${esc(t.name)}</span><span class="notes">${esc(notesOf(t.midi))}</span></a>`;
      }
      out += '</div>';
    }
    if (!any) out = `<div class="nav-empty">No tuning named or spelled like "${esc(q)}". Try the <a href="#find">identifier</a> to find the closest match.</div>`;
    nav.innerHTML = out;
    document.querySelectorAll('.rail-nav .nav-link[data-route]').forEach((a) => a.classList.toggle('active', a.dataset.route === state.route));
  }

  // ---------- views ----------
  function renderHome() {
    const el = $('#view-home');
    const cats = D.CATEGORIES.map((c, i) => {
      const items = D.TUNINGS.filter((t) => t.category === c.id);
      return h`<div class="cat"><h3><span>${esc(c.name)}</span><span class="idx">[0${i + 1}] ${String(items.length).padStart(2, '0')}</span></h3><p>${esc(c.intro.split('. ').slice(0, 2).join('. '))}.</p><ul>${items.map((t) => `<li><a href="#t/${t.id}">${esc(t.name)}<span>${esc(notesOf(t.midi))}</span></a></li>`).join('')}</ul></div>`;
    }).join('');
    el.innerHTML = h`
      <section class="sheet-hero" id="homeHero">
        <span class="cross tl"></span><span class="cross tr"></span><span class="cross bl"></span><span class="cross br"></span><span class="ruler-v l"></span><span class="ruler-v r"></span>
        <div class="hero-art" id="heroArt">
          <svg viewBox="0 0 240 120" aria-hidden="true"><use href="#art-guitar"/></svg>
          <button class="hotspot" style="left:12.9%;top:38.3%" data-title="Retune row" data-tip="How far each string moves from standard, in half steps, string by string." aria-label="Retune row"></button>
          <button class="hotspot" style="left:32.5%;top:40%" data-title="Open chord" data-tip="What the six open strings sound together. Open G rings a G major; Modal D rings a Dsus4." aria-label="Open chord"></button>
          <button class="hotspot" style="left:75%;top:45%" data-title="Capo" data-tip="Clamp any fret: the shapes stay put and every chord is renamed at sounding pitch." aria-label="Capo"></button>
          <button class="hotspot" style="left:90.4%;top:32.5%" data-title="Fret row" data-tip="Tune each string from the one below it: the fret that sounds the next open string." aria-label="Fret row"></button>
          <div class="annot" id="heroAnnot" role="status"></div>
        </div>
        <div class="cursor-tip" id="cursorTip"><span class="xy">X:0000 Y:0000</span><span class="hint">Hover a marker</span></div>
      </section>
      <div class="headline-block">
        <div>
          <div class="eyebrow"><span>After Bill Sethares</span><span>38 tunings</span><span>4 families</span><b>Edition 2001, computed 2026</b></div>
          <h1 class="page-title" style="margin-top:14px">Retune that guitar now</h1>
        </div>
        <div class="desc"><p>${esc(D.GUIDE.whyRetune.split('. ').slice(0, 3).join('. '))}.</p><p class="small">Every tuning in the book with its fretboard, scales, computed chord voicings, a capo, playback and a progression tool. This concept follows the drafting-sheet language of Bearplus' Heron AI site.</p></div>
        <div class="act tick"><a class="cell-cta" href="#t/open-g">Start with Open G</a></div>
      </div>
      <div class="cat-grid">${cats}</div>
      <div class="card reveal">
        <h2>What you get for each tuning</h2>
        <div class="two-col">
          <div><p><b>Tuning strip.</b> Every string with its sounding pitch, MIDI number, how many half steps to retune from standard, and which fret matches the next string, exactly as the book lays it out.</p>
          <p><b>Fretboard and scales.</b> The full note map of the neck with any scale from the book's table highlighted, roots darkened.</p></div>
          <div><p><b>Chord voicings.</b> The book teaches you to build chords from the interval table. The app does that work for any root and chord type, with fingerings, barres and positions, and plays them so you can hear the voicing.</p>
          <p><b>Sethares' commentary.</b> His notes on the feel, history and quirks of each tuning, with the songs that made it famous.</p></div>
        </div>
      </div>`;
    const hero = $('#homeHero'), art = $('#heroArt'), annot = $('#heroAnnot'), tip = $('#cursorTip');
    const showAnnot = (b) => {
      annot.innerHTML = `<b>${esc(b.dataset.title)}</b>${esc(b.dataset.tip)}`;
      const left = parseFloat(b.style.left), top = parseFloat(b.style.top);
      annot.style.left = (left > 60 ? 'auto' : `calc(${left}% + 16px)`); annot.style.right = (left > 60 ? `calc(${100 - left}% + 16px)` : 'auto');
      annot.style.top = `calc(${top}% - 12px)`;
      annot.classList.add('show');
    };
    art.querySelectorAll('.hotspot').forEach((b) => {
      b.addEventListener('mouseenter', () => showAnnot(b));
      b.addEventListener('focus', () => showAnnot(b));
      b.addEventListener('mouseleave', () => annot.classList.remove('show'));
      b.addEventListener('blur', () => annot.classList.remove('show'));
      b.addEventListener('click', () => { Audio.strum(byId('open-g').midi, 0.05); });
    });
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = Math.round(e.clientX - r.left), y = Math.round(e.clientY - r.top);
      tip.querySelector('.xy').textContent = `X:${String(x).padStart(4, '0')} Y:${String(y).padStart(4, '0')}`;
      tip.querySelector('.hint').textContent = e.target.closest('.hotspot') ? 'Click to hear Open G' : 'Hover a marker';
      tip.style.left = (x + 18) + 'px'; tip.style.top = (y + 18) + 'px';
      tip.classList.add('show');
    });
    hero.addEventListener('mouseleave', () => tip.classList.remove('show'));
  }

  function renderTuning() {
    const t = state.tuning;
    const el = $('#view-tuning');
    if (!t) { el.innerHTML = ''; return; }
    const actual = t.midi;
    const capo = state.capo | 0;
    const midi = E.withCapo(actual, capo); // what the strings sound with the capo on; shapes are relative to it
    let progEntries = [];
    const ret = E.retune(actual), frets = E.fretRow(actual), ivs = E.stringIntervals(actual);
    const open = openChordOf(midi);
    const sounding = midi.filter((m) => m != null);
    const lo = Math.min(...sounding), hi = Math.max(...sounding);
    const changed = ret.filter((r) => r != null && r !== 0).length;
    if (state.scaleRoot == null) state.scaleRoot = open ? open.root : E.pc(sounding[0]);
    if (state.chordRoot == null) state.chordRoot = state.scaleRoot;

    const stringCells = actual.map((m, i) => {
      if (m == null) return `<div class="string muted-string"><div class="num">STRING ${6 - i}</div><div class="note">X</div><div class="delta same">not used</div><div class="midi">&nbsp;</div></div>`;
      const r = ret[i];
      const cls = r > 0 ? 'up' : r < 0 ? 'down' : 'same';
      const txt = r > 0 ? `▲ +${r}` : r < 0 ? `▼ ${r}` : '• same';
      const capoLine = capo ? `<div class="capo-note">capo: ${E.noteName(m + capo)}<sub>${E.octave(m + capo)}</sub></div>` : '';
      return `<button class="string" data-midi="${m + capo}" title="Pluck ${E.sciName(m + capo)}"><div class="num">STRING ${6 - i}</div><div class="note">${E.noteName(m)}<sub>${E.octave(m)}</sub></div><div class="delta ${cls}">${txt}</div><div class="midi">MIDI ${m}</div>${capoLine}</button>`;
    }).join('');
    const fretCells = frets.map((f, i) => `<span>${f == null ? '' : `<span class="f" title="String ${6 - i}, fret ${f} matches open string ${5 - i}">fret ${f}</span>`}</span>`).join('') + '<span></span>';

    const facts = [
      [capo ? `Open strings with capo ${capo}` : 'Open strings sound', open ? open.name : 'no single chord (' + E.describePitchSet(sounding.map(E.pc)) + ')'],
      ['Range', `${E.sciName(lo)} to ${E.sciName(hi)}, ${E.intervalName(hi - lo)}`],
      ['Strings retuned', changed === 0 ? 'none' : `${changed} of ${sounding.length}`],
      ['Adjacent intervals', ivs.map(shortInterval).join('  ')]
    ].map(([k, v]) => `<div class="fact"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`).join('');

    const isCustom = t.id === 'custom';
    const pdfPage = t.page ? t.page - 1 : null;
    const related = E.relatedTunings(t, D.TUNINGS).slice(0, 8);
    const relatedHTML = related.length ? related.map((m) => `<a class="chip" href="#t/${m.tuning.id}"><b>${esc(m.tuning.name)}</b> ${esc(E.describeMatch(m).replace(m.tuning.name, '').trim() || 'same notes')}</a>`).join('') : '<span class="muted small">No tuning in the guide is within one string of this one.</span>';

    const scaleRoots = E.NOTE_NAMES.map((n, i) => `<option value="${i}" ${i === state.scaleRoot ? 'selected' : ''}>${n}</option>`).join('');
    const scaleTypes = D.SCALE_TYPES.map((s) => `<option value="${s.id}" ${s.id === state.scaleType ? 'selected' : ''}>${s.name}</option>`).join('');
    const chordRoots = E.NOTE_NAMES.map((n, i) => `<option value="${i}" ${i === state.chordRoot ? 'selected' : ''}>${n}</option>`).join('');
    const chordTypes = D.CHORD_TYPES.map((c) => `<option value="${c.abbr}" ${c.abbr === state.chordType ? 'selected' : ''}>${c.name} (${c.abbr})</option>`).join('');

    const order = D.TUNINGS;
    const pos = order.indexOf(t);
    const prev = pos > 0 ? order[pos - 1] : null, next = pos >= 0 && pos < order.length - 1 ? order[pos + 1] : null;
    el.innerHTML = h`
      <div class="toolbar">
        <div><span class="lbl">Root</span><select id="scaleRoot" aria-label="Scale root">${scaleRoots}</select></div>
        <div><span class="lbl">Scale</span><select id="scaleType" aria-label="Scale type">${scaleTypes}</select></div>
        <div><button class="btn sm ghost" id="scaleClear">${state.scaleType === 'none' ? 'Show scale' : 'Notes only'}</button></div>
        <div><span class="lbl">Capo</span><select id="capo" aria-label="Capo fret">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<option value="${n}" ${n === capo ? 'selected' : ''}>${n === 0 ? 'none' : 'fret ' + n}</option>`).join('')}</select></div>
        <div class="spacer"><span class="readout" id="fbCoord">[hover a note]</span></div>
        <div><button class="btn gold arrow" id="strumBtn">Hear the open strings</button><button class="btn" id="arpBtn">Arpeggio</button></div>
      </div>
      <section class="sheet-hero fb-hero">
        <span class="cross tl"></span><span class="cross tr"></span><span class="cross bl"></span><span class="cross br"></span><span class="ruler-v l"></span><span class="ruler-v r"></span>
        <div class="fretboard-wrap" id="fretboardWrap"></div>
        <div class="legend"><span><i class="root"></i>root</span><span><i class="tone"></i>scale tone</span><span>String 1 on top, as in the book. Click any note to hear it.</span></div>
      </section>
      <div class="headline-block">
        <div>
          <div class="eyebrow"><b>${esc(isCustom ? 'Custom tuning' : catName(t.category))}</b>${pos >= 0 ? `<span>[${String(pos).padStart(2, '0')}/${String(order.length - 1).padStart(2, '0')}]</span>` : ''}${pdfPage ? `<span>page ${t.page} of the guide</span>` : ''}<span>${esc(notesOf(actual))}</span></div>
          <h1 class="page-title" style="margin-top:14px">${esc(isCustom ? notesOf(actual) : t.name)}</h1>
        </div>
        <div class="desc"><p class="lede">${isCustom ? 'A tuning you typed in. Everything below is computed from its notes.' : `${open ? `The open strings sound ${article(open.name)} ${esc(open.name)} chord${capo ? ' with the capo at fret ' + capo : ''}.` : 'The open strings do not form a single named chord.'} ${t.songs && t.songs.length ? 'Heard in ' + esc(t.songs[0]) + '.' : ''}`}</p></div>
        <div class="act">${pos >= 0 ? `<div class="pager" style="display:grid;gap:8px">${prev ? `<a class="btn ghost" href="#t/${prev.id}">← ${esc(prev.name)}</a>` : ''}${next ? `<a class="btn arrow" href="#t/${next.id}">${esc(next.name)}</a>` : ''}</div>` : `<a class="cell-cta" href="#find">Back to the identifier</a>`}</div>
      </div>
      <div class="pad">
      <div class="strings" id="strings">${stringCells}</div>
      <div class="fret-row" aria-label="Fret to match the next string">${fretCells}</div>
      <p class="small muted" style="margin-top:6px">Tune the lowest string first. Then press the shown fret on each string to sound the open note of the next string up.${capo ? ` With the capo at fret ${capo}, every shape below is drawn relative to the capo and every chord is named at sounding pitch: the same fingers, ${capo} half step${capo === 1 ? '' : 's'} higher.` : ''}</p>
      <div class="facts">${facts}</div>
      </div>

      ${isCustom ? '' : h`<div class="section card reveal">
        <h2>About the ${esc(t.name)} tuning</h2>
        <div class="commentary">${t.text.split(/(?<=\.)\s+(?=[A-Z"'(])/).reduce((acc, s, i) => { const k = Math.floor(i / 3); (acc[k] = acc[k] || []).push(s); return acc; }, []).map((p) => `<p>${esc(p.join(' '))}</p>`).join('')}</div>
        ${t.songs ? `<ul class="songs" aria-label="Songs in this tuning">${t.songs.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
        ${t.note ? `<p class="small muted" style="margin-top:var(--s3)">${esc(t.note)}</p>` : ''}
        <p class="cite" style="margin:var(--s3) 0 0">Bill Sethares, Alternate Tuning Guide${pdfPage ? `, <a href="${PDF}#page=${pdfPage}" target="_blank" rel="noopener">page ${t.page}</a>` : ''}. The book's chord chart for this tuning is on the following page.</p>
      </div>`}

      <div class="section card reveal">
        <h2>${isCustom ? 'Closest tunings in the guide' : 'Related tunings'}</h2>
        <p class="small muted">Same notes transposed, or one string away. Chord forms from a related chart carry over with the named adjustment.</p>
        <div class="related">${relatedHTML}</div>
      </div>

      <div class="section card reveal">
        <div class="sheet-head">
          <h2>Chords</h2>
          <div class="controls">
            <button class="btn sm ${state.chordTab === 'find' ? '' : 'ghost'}" data-tab="find">Find a chord</button>
            <button class="btn sm ${state.chordTab === 'chart' ? '' : 'ghost'}" data-tab="chart">Chord chart</button>
            <button class="btn sm ${state.chordTab === 'prog' ? '' : 'ghost'}" data-tab="prog">Progression</button>
          </div>
        </div>
        <div id="chordFind" ${state.chordTab === 'find' ? '' : 'hidden'}>
          <div class="row" style="margin-bottom:var(--s4)">
            <label class="field">Root<select id="chordRoot">${chordRoots}</select></label>
            <label class="field">Type<select id="chordType">${chordTypes}</select></label>
            <span class="small muted grow" id="chordInfo"></span>
          </div>
          <div class="voicings" id="voicings"></div>
        </div>
        <div id="chordChart" ${state.chordTab === 'chart' ? '' : 'hidden'}>
          <p class="small muted" id="chartInfo"></p>
          <div class="voicings" id="chartVoicings"></div>
        </div>
        <div id="chordProg" ${state.chordTab === 'prog' ? '' : 'hidden'}>
          <form class="prog-form" id="progForm">
            <label class="field grow">Chord names, in order<input type="text" id="progInput" placeholder="G  Em7  C  D7/F#  Am9" value="${esc(state.progression)}" autocomplete="off" spellcheck="false"></label>
            <button class="btn" type="submit">Show chords</button>
            <button class="btn gold" type="button" id="progPlay">Play all</button>
            <button class="btn ghost" type="button" id="progCapo">Suggest capo</button>
          </form>
          <p class="small" id="capoSuggest" hidden></p>
          <p class="small muted">Write chords the way a chart does: G, Em, Am7, Dmaj7, A9, Bm7b5, Cdim7, E7#9, F6/9, Gsus4, D7sus4, Cadd9, A13, and slash chords like G/B for a particular bass note. The progression stays put while you switch tunings, so you can compare how the same song falls in each one.</p>
          <div id="progOut"></div>
        </div>
        <p class="small muted" style="margin:var(--s4) 0 0">Fingerings are suggestions, computed from the interval table the way the book describes: a hand span of four frets, at most four fingers with a barre, root or fifth preferred in the bass. Dots in gold are roots. Click a chord to hear it.</p>
      </div>`;

    // wire up
    $('#capo').addEventListener('change', (e) => { setCapo(+e.target.value); renderTuning(); });
    $('#strumBtn').addEventListener('click', () => { Audio.strum(midi, 0.05); flashStrings(); });
    $('#arpBtn').addEventListener('click', () => { Audio.strum(midi, 0.22); flashStrings(0.22); });
    $('#strings').addEventListener('click', (e) => {
      const b = e.target.closest('.string[data-midi]');
      if (!b) return;
      Audio.pluck(+b.dataset.midi);
      b.classList.remove('pluck'); void b.offsetWidth; b.classList.add('pluck');
    });
    $('#scaleRoot').addEventListener('change', (e) => { state.scaleRoot = +e.target.value; drawFretboard(); });
    $('#scaleType').addEventListener('change', (e) => { state.scaleType = e.target.value; drawFretboard(); });
    $('#scaleClear').addEventListener('click', () => { state.scaleType = state.scaleType === 'none' ? 'major' : 'none'; $('#scaleClear').textContent = state.scaleType === 'none' ? 'Show scale' : 'Notes only'; drawFretboard(); });
    $('#fretboardWrap').addEventListener('click', (e) => { const r = e.target.closest('rect[data-midi]'); if (r) Audio.pluck(+r.dataset.midi); });
    const wrap = $('#fretboardWrap');
    const callout = document.createElement('div'); callout.className = 'callout';
    wrap.addEventListener('mousemove', (e) => {
      const r = e.target.closest('rect[data-midi]');
      if (!r) { callout.classList.remove('show'); return; }
      const m = +r.dataset.midi, str = +r.dataset.string, fret = +r.dataset.fret;
      const st = D.SCALE_TYPES.find((x) => x.id === state.scaleType);
      let role = '';
      if (st) { const d = E.mod12(m - state.scaleRoot); const i = st.intervals.indexOf(d); if (i === 0) role = 'root'; else if (i > 0) role = 'degree ' + (i + 1); }
      callout.textContent = `${E.sciName(m)}${role ? ' · ' + role : ''} · string ${str} · fret ${fret}`;
      const rb = r.getBoundingClientRect(), wb = wrap.getBoundingClientRect();
      callout.style.left = (rb.left - wb.left + rb.width / 2 + wrap.scrollLeft) + 'px';
      callout.style.top = (rb.top - wb.top) + 'px';
      callout.classList.add('show');
      $('#fbCoord').textContent = `[string ${str}, fret ${fret}] ${E.sciName(m)} · ${E.freq(m).toFixed(1)} Hz`;
    });
    wrap.addEventListener('mouseleave', () => { callout.classList.remove('show'); $('#fbCoord').textContent = '[hover a note]'; });
    el.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => {
      state.chordTab = b.dataset.tab;
      el.querySelectorAll('[data-tab]').forEach((x) => x.classList.toggle('ghost', x.dataset.tab !== state.chordTab));
      $('#chordFind').hidden = state.chordTab !== 'find';
      $('#chordChart').hidden = state.chordTab !== 'chart';
      $('#chordProg').hidden = state.chordTab !== 'prog';
      if (state.chordTab === 'chart') drawChart();
      if (state.chordTab === 'prog') drawProgression();
    }));
    $('#chordRoot').addEventListener('change', (e) => { state.chordRoot = +e.target.value; drawVoicings(); });
    $('#chordType').addEventListener('change', (e) => { state.chordType = e.target.value; drawVoicings(); });
    const playVoicing = (e) => {
      const card = e.target.closest('.voicing[data-frets]');
      if (!card) return;
      const fr = card.dataset.frets.split(',').map(Number);
      Audio.strum(fr.map((f, i) => (f < 0 ? null : midi[i] + f)), 0.045);
      card.classList.add('playing'); setTimeout(() => card.classList.remove('playing'), 600);
    };
    $('#voicings').addEventListener('click', playVoicing);
    $('#chartVoicings').addEventListener('click', playVoicing);
    $('#progForm').addEventListener('submit', (e) => { e.preventDefault(); setProgression($('#progInput').value); drawProgression(); });
    $('#progInput').addEventListener('change', () => { setProgression($('#progInput').value); drawProgression(); });
    $('#progPlay').addEventListener('click', () => { setProgression($('#progInput').value); drawProgression(); playProgression(); });
    $('#progOut').addEventListener('click', playVoicing);
    $('#progCapo').addEventListener('click', () => {
      setProgression($('#progInput').value);
      const chords = E.parseProgression(state.progression, D.CHORD_TYPES).filter((c) => c.ok);
      const box = $('#capoSuggest');
      box.hidden = false;
      if (!chords.length) { box.textContent = 'Type a progression first.'; return; }
      const ranked = E.suggestCapo(actual, chords, { maxCapo: 7 });
      const best = ranked[0];
      const current = ranked.find((r) => r.capo === capo);
      const name = (n) => (n === 0 ? 'no capo' : 'capo at fret ' + n);
      if (best.capo === capo) {
        box.innerHTML = `Easiest shapes for this progression in ${esc(t.name)}: <b>${name(capo)}</b>, which is what you have now.${best.missing ? ' ' + best.missing + ' chord' + (best.missing === 1 ? ' has' : 's have') + ' no comfortable fingering at any capo position.' : ''}`;
      } else {
        box.innerHTML = `Easiest shapes for this progression in ${esc(t.name)}: <b>${name(best.capo)}</b> <button class="btn sm" type="button" id="applyCapo">Apply</button> <span class="muted">Runner-up: ${name(ranked[1].capo)}.${current ? ' Your current setting ranks ' + (ranked.indexOf(current) + 1) + ' of ' + ranked.length + '.' : ''}</span>`;
        $('#applyCapo').addEventListener('click', () => { setCapo(best.capo); renderTuning(); $('#chordProg').scrollIntoView({ block: 'start' }); });
      }
    });

    drawFretboard();
    drawVoicings();
    if (state.chordTab === 'chart') drawChart();
    if (state.chordTab === 'prog') drawProgression();

    function setCapo(n) {
      state.capo = Math.max(0, Math.min(9, n | 0));
      state.scaleRoot = null; state.chordRoot = null; // follow the new sounding key
      try { localStorage.setItem('atg.capo', String(state.capo)); } catch (e) { /* storage unavailable */ }
    }
    function setProgression(text) {
      state.progression = text;
      try { localStorage.setItem('atg.progression', text); } catch (e) { /* storage unavailable */ }
    }
    function drawProgression() {
      const out = $('#progOut');
      const entries = E.parseProgression(state.progression, D.CHORD_TYPES);
      progEntries = [];
      if (!entries.length) {
        out.innerHTML = `<div class="empty"><svg viewBox="0 0 200 120" width="180" height="108"><use href="#art-slide"/></svg><h3>Type a progression above</h3><p>Try <button class="chip" type="button" data-prog="G Em7 C D7">G Em7 C D7</button> <button class="chip" type="button" data-prog="Dm9 G13 Cmaj9 A7b9">Dm9 G13 Cmaj9 A7b9</button> <button class="chip" type="button" data-prog="D Dsus4 G/B A7sus4">D Dsus4 G/B A7sus4</button></p></div>`;
        out.querySelectorAll('[data-prog]').forEach((b) => b.addEventListener('click', () => { $('#progInput').value = b.dataset.prog; setProgression(b.dataset.prog); drawProgression(); }));
        return;
      }
      const bad = entries.filter((e) => !e.ok);
      let html = bad.length ? `<div style="margin-bottom:var(--s3)">${bad.map((b) => `<span class="prog-bad">Could not read "${esc(b.raw)}"</span>`).join('')}<span class="small muted">Roots are A to G with # or b; see the list above for chord types.</span></div>` : '';
      entries.filter((e) => e.ok).forEach((c, i) => {
        const vs = E.findVoicings(midi, c.root, c.type.intervals, { limit: 4, bassPc: c.bass, optional: c.type.optional });
        progEntries.push({ entry: c, voicings: vs });
        const tones = c.type.intervals.map((iv) => E.NOTE_NAMES[E.mod12(c.root + iv)]).join(' ');
        html += `<section class="prog-chord" data-idx="${i}"><h3>${esc(c.symbol)} <span class="tones">${esc(c.type.name)}: ${esc(tones)}${c.bass != null ? ', ' + esc(E.NOTE_NAMES[c.bass]) + ' in the bass' : ''}</span></h3>`;
        html += vs.length ? `<div class="voicings">${vs.map((v) => voicingCard(c.symbol, v, c.root)).join('')}</div>` : `<p class="small muted" style="margin:0">No comfortable fingering in the first twelve frets of this tuning${c.bass != null ? ' with that bass note' : ''}. Try the voicing finder with a simpler type, or drop the extension.</p>`;
        html += '</section>';
      });
      out.innerHTML = html;
    }
    function playProgression() {
      const ctx = Audio.ensure();
      if (!ctx) return;
      const blocks = $('#progOut').querySelectorAll('.prog-chord');
      let t = ctx.currentTime + 0.05;
      const step = 1.15;
      progEntries.forEach((p, i) => {
        if (!p.voicings.length) return;
        const fr = p.voicings[0].frets;
        Audio.strum(fr.map((f, s) => (f < 0 ? null : midi[s] + f)), 0.04, t);
        const delay = (t - ctx.currentTime) * 1000;
        setTimeout(() => { blocks.forEach((b) => b.classList.remove('playing')); if (blocks[i]) blocks[i].classList.add('playing'); }, delay);
        t += step;
      });
      setTimeout(() => blocks.forEach((b) => b.classList.remove('playing')), (t - ctx.currentTime) * 1000);
    }
    function flashStrings(spacing) {
      const btns = el.querySelectorAll('.string[data-midi]');
      btns.forEach((b, i) => setTimeout(() => { b.classList.remove('pluck'); void b.offsetWidth; b.classList.add('pluck'); }, i * (spacing || 0.05) * 1000));
    }
    function drawFretboard() {
      const st = D.SCALE_TYPES.find((s) => s.id === state.scaleType);
      $('#fretboardWrap').innerHTML = fretboardSVG(actual, st ? state.scaleRoot : null, st ? st.intervals : [], capo);
      $('#fretboardWrap').appendChild(callout); // the SVG redraw replaces the wrap's children
    }
    function voicingCard(label, v, rootPc) {
      const hasOpen = v.frets.some((f) => f === 0);
      const pos = hasOpen || v.position <= 1 ? (capo ? `at the capo` : 'open position') : `${ordinal(v.position + capo)} fret`;
      const notes = v.frets.map((f, i) => (f < 0 ? null : E.noteName(midi[i] + f))).filter(Boolean).join(' ');
      return `<button class="voicing" data-frets="${v.frets.join(',')}" title="${esc(notes)}"><div class="vname">${esc(label)}</div>${diagramSVG(midi, v, rootPc, capo)}<div class="vmeta">${v.barre ? 'barre, ' : ''}${pos}</div></button>`;
    }
    function drawVoicings() {
      const ct = D.CHORD_TYPES.find((c) => c.abbr === state.chordType);
      const vs = E.findVoicings(midi, state.chordRoot, ct.intervals, { limit: 18 });
      const tones = ct.intervals.map((i) => E.NOTE_NAMES[E.mod12(state.chordRoot + i)]).join(' ');
      $('#chordInfo').textContent = `${E.NOTE_NAMES[state.chordRoot]} ${ct.name}: ${tones} (intervals ${ct.intervals.join(', ')}). ${vs.length ? vs.length + ' voicings within the first 12 frets.' : ''}`;
      $('#voicings').innerHTML = vs.length ? vs.map((v) => voicingCard(chordLabel(state.chordRoot, ct), v, state.chordRoot)).join('') :
        `<div class="empty" style="grid-column:1/-1"><svg viewBox="0 0 200 120" width="180" height="108"><use href="#art-slide"/></svg><h3>No comfortable fingering in the first twelve frets</h3><p>This chord needs more hand than this tuning gives in one position. Try a subchord: drop the fifth or the ninth, or look for it with a slide.</p></div>`;
    }
    function drawChart() {
      const chart = E.chordChart(midi, D.CHORD_TYPES, { perChord: 2 });
      $('#chartInfo').textContent = `A chart in the ${capo ? 'capoed ' : ''}tuning's natural key of ${E.NOTE_NAMES[chart.key]}, balancing open position and bar chords across major, minor and seventh types, the way the book's chord pages do.${capo ? ' Chord names are sounding pitch with the capo at fret ' + capo + '.' : ''}`;
      $('#chartVoicings').innerHTML = chart.chords.map((c) => voicingCard(c.label, c.voicing, c.root)).join('');
    }
  }

  function renderFind(prefill) {
    const el = $('#view-find');
    el.innerHTML = h`
      <div class="headline-block">
        <div><div class="eyebrow"><b>What about other tunings?</b><span>cross index, computed</span></div><h1 class="page-title" style="margin-top:14px">Identify a tuning</h1></div>
        <div class="desc"><p class="lede">Type six notes, low string to high. If the tuning is a transposition or a one-string variant of a tuning in the guide, you can use that chart with the adjustment shown. This is the book's cross index, computed for any tuning.</p></div>
        <div class="act tick"><a class="cell-cta" href="#guide">The book's own cross index</a></div>
      </div>
      <div class="card">
        <form class="find-form" id="findForm">
          <label class="field" style="font-size:.78rem">Six notes, low to high (X for an unused string)
            <input type="text" id="findInput" placeholder="B F# B E G# C#" value="${esc(prefill || '')}" autocomplete="off" spellcheck="false" aria-describedby="findHelp">
          </label>
          <button class="btn" type="submit">Find it</button>
        </form>
        <p class="small muted" id="findHelp" style="margin:var(--s3) 0 0">Try: <button class="chip" type="button" data-try="B F# B E G# C#">Louise (Kottke)</button> <button class="chip" type="button" data-try="EBEG#BE">Open E</button> <button class="chip" type="button" data-try="C G D G C D">Orkney</button> <button class="chip" type="button" data-try="E A D G B D">Guinevere</button> <button class="chip" type="button" data-try="F A# D# G# C F">Standard down a half step</button></p>
        <div id="findOut"></div>
      </div>`;
    const input = $('#findInput');
    $('#findForm').addEventListener('submit', (e) => { e.preventDefault(); run(input.value); });
    el.querySelectorAll('[data-try]').forEach((b) => b.addEventListener('click', () => { input.value = b.dataset.try; run(input.value); }));
    if (prefill) run(prefill);

    function run(val) {
      const out = $('#findOut');
      const pcs = E.parseTuningString(val);
      if (!pcs) { out.innerHTML = `<p class="err" style="margin-top:var(--s4)">Enter exactly six notes, like <span class="mono">D A D G A D</span> or <span class="mono">DADF#AD</span>. Use X for a string you do not use.</p>`; return; }
      const matches = E.identifyTuning(pcs, D.TUNINGS).slice(0, 6);
      const label = pcs.map((p) => (p == null ? 'X' : E.NOTE_NAMES[p])).join(' ');
      const customHref = '#c/' + pcs.map((p) => (p == null ? 'X' : E.NOTE_NAMES[p].replace('#', 's'))).join('-');
      if (!matches.length) {
        out.innerHTML = `<div class="empty"><svg viewBox="0 0 200 160" width="160" height="128"><use href="#art-peg"/></svg><h3>${esc(label)} is not within one string of any tuning in the guide</h3><p>You can still explore it: the app will draw its fretboard and build chords from scratch.</p><a class="btn" href="${customHref}">Explore ${esc(label)}</a></div>`;
        return;
      }
      out.innerHTML = `<div class="matches">${matches.map((m) => {
        const exact = m.distance === 0;
        const desc = E.describeMatch(m);
        const chordNote = m.transpose !== 0 ? ` Transpose chord names ${m.transpose > 0 ? 'up' : 'down'} ${Math.abs(m.transpose)} step${Math.abs(m.transpose) === 1 ? '' : 's'} when reading that chart.` : '';
        const diffNote = m.diffs.length ? ` Chords using string ${m.diffs[0].string} move ${m.diffs[0].delta > 0 ? 'down' : 'up'} ${Math.abs(m.diffs[0].delta)} fret${Math.abs(m.diffs[0].delta) === 1 ? '' : 's'} on that string.` : '';
        return `<div class="match${exact ? ' exact' : ''}"><div><div class="mname">${esc(desc)}</div><div class="mdesc">${esc(notesOf(m.tuning.midi))}.${exact && m.transpose === 0 ? ' An exact match.' : chordNote + diffNote}</div></div><a class="btn sm ${exact ? '' : 'ghost'}" href="#t/${m.tuning.id}">Open ${esc(m.tuning.name)}</a></div>`;
      }).join('')}</div>
      <p class="small muted" style="margin:var(--s4) 0 0">Or explore <a href="${customHref}">${esc(label)}</a> directly with its own fretboard and chords.</p>`;
    }
  }

  function renderGuide() {
    const el = $('#view-guide');
    const G = D.GUIDE;
    const chordRows = D.CHORD_TYPES.filter((c) => !c.extra).map((c) => `<tr><td>${esc(c.name)}</td><td class="mono">${esc(c.abbr)}</td><td class="mono">${c.intervals.join(', ')}</td></tr>`).join('');
    const scaleRows = D.SCALE_TYPES.map((s) => `<tr><td>${esc(s.name)}</td><td class="mono">${s.intervals.join(', ')}</td></tr>`).join('');
    const crossRows = D.CROSS_INDEX.map((r) => `<tr><td>${esc(r.name)}</td><td class="mono"><a href="#c/${r.notes.split(' ').map((n) => n.replace('#', 's')).join('-')}">${esc(r.notes)}</a></td><td>${esc(r.relation)}</td></tr>`).join('');
    const instRows = D.OTHER_INSTRUMENTS.map((r) => `<tr><td>${esc(r.instrument)}</td><td class="mono">${esc(r.notes)}</td><td>${esc(r.relation)}</td></tr>`).join('');
    el.innerHTML = h`
      <div class="headline-block">
        <div><div class="eyebrow"><b>How the book works</b><span>method, not charts</span></div><h1 class="page-title" style="margin-top:14px">Four tricks and a circle</h1></div>
        <div class="desc"><p class="lede">The Alternate Tuning Guide gives each tuning two pages: a tuning page with retuning steps, scales and the fretboard, and a chord page with about thirty chords. The rest of the book is a method for turning those seeds into every chord you need. Here is that method.</p></div>
        <div class="act tick"><a class="cell-cta" href="${PDF}" target="_blank" rel="noopener">Read the original PDF</a></div>
      </div>
      <div class="card reveal">
        <h2>Reading a tuning</h2>
        <p>${esc(G.retuning)}</p>
        <p class="small muted" style="margin:0">Sethares lists MIDI numbers an octave above sounding pitch, the written-guitar convention. This app uses sounding pitch (standard low E is 40). Subtract 12 from the app's numbers to match the book, or add 12 to the book's numbers to drive a synth at the right octave.</p>
      </div>
      <div class="card reveal">
        <h2>The circle of notes</h2>
        <div class="two-col" style="align-items:center">
          <p>${esc(G.circleOfNotes)}</p>
          <div class="circle-wrap">${circleSVG()}</div>
        </div>
      </div>
      <div class="card reveal">
        <h2>The four tricks</h2>
        <p class="muted">These techniques, applied judiciously, allow you to play almost any chord in almost any tuning given a few seed chords to start with.</p>
        <div class="tricks">${G.fourTricks.map((t) => `<div class="trick"><h4>${esc(t.title)}</h4><p>${esc(t.body)}</p></div>`).join('')}</div>
      </div>
      <div class="card reveal">
        <h2>The stuff chords are made of</h2>
        <p>${esc(G.buildChords)}</p>
        <div class="two-col">
          <div class="tbl-wrap"><table><caption class="sr-only">Table of chord intervals</caption><thead><tr><th>Chord</th><th>Abbr.</th><th>Intervals</th></tr></thead><tbody>${chordRows}</tbody></table></div>
          <div class="tbl-wrap"><table><caption class="sr-only">Table of scale intervals</caption><thead><tr><th>Scale</th><th>Intervals</th></tr></thead><tbody>${scaleRows}</tbody></table>
            <p class="small muted" style="margin-top:var(--s4)">The book spells everything with sharps for simplicity: C# is also Db, D# is Eb, F# is Gb, G# is Ab, A# is Bb.</p>
            <p class="small muted">The progression tool also understands a few types beyond the book's table: ${esc(D.CHORD_TYPES.filter((c) => c.extra).map((c) => c.name + ' (' + c.abbr + ')').join(', '))}.</p></div>
        </div>
      </div>
      <div class="card reveal">
        <h2>Cross index of tunings</h2>
        <p class="muted">Named tunings from records and songbooks, and how each relates to a tuning in the guide. Click the notes to explore any of them. The <a href="#find">identifier</a> does this for tunings not listed here.</p>
        <div class="tbl-wrap"><table><thead><tr><th>Name</th><th>Notes</th><th>Relation</th></tr></thead><tbody>${crossRows}</tbody></table></div>
      </div>
      <div class="card reveal">
        <h2>Banjo, cittern, oud and friends</h2>
        <p class="muted">Players of other stringed instruments can use the charts by ignoring the extra strings.</p>
        <div class="tbl-wrap"><table><thead><tr><th>Instrument</th><th>Notes</th><th>Chart to use</th></tr></thead><tbody>${instRows}</tbody></table></div>
      </div>
      <div class="card reveal">
        <h2>About this app</h2>
        <p>Bill Sethares wrote the Alternate Tuning Guide and gives it away as a <a href="${PDF}" target="_blank" rel="noopener">free PDF</a>. He is a professor of electrical engineering at the University of Wisconsin and the author of Tuning, Timbre, Spectrum, Scale. This app carries his tuning data and commentary; the fretboards, scale maps and chord fingerings are computed from the interval tables rather than copied from the book, so the chord pages here and in the book will differ and complement each other.</p>
        <p style="margin:0">Pitches shown are sounding pitch. The octaves for the Overtone and Pentatonic tunings are not fixed by the book and were chosen to keep retuning small.</p>
      </div>`;
  }

  // ---------- routing ----------
  function parseHash() {
    const hsh = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    if (!hsh || hsh === 'home') return { route: 'home' };
    if (hsh === 'find') return { route: 'find' };
    if (hsh.startsWith('find/')) return { route: 'find', q: hsh.slice(5) };
    if (hsh === 'guide') return { route: 'guide' };
    if (hsh.startsWith('t/')) return { route: 'tuning', id: hsh.slice(2) };
    if (hsh.startsWith('c/')) return { route: 'custom', notes: hsh.slice(2).replace(/s/g, '#').replace(/-/g, ' ') };
    // legacy or bare id
    if (byId(hsh)) return { route: 'tuning', id: hsh };
    return { route: 'home' };
  }

  function render() {
    const r = parseHash();
    const prevId = state.tuning && state.tuning.id;
    if (r.route === 'tuning') {
      const t = byId(r.id);
      if (!t) { location.hash = '#home'; return; }
      state.route = 'tuning'; state.tuning = t;
    } else if (r.route === 'custom') {
      const pcs = E.parseTuningString(r.notes);
      if (!pcs) { location.hash = '#find'; return; }
      state.route = 'tuning'; state.tuning = customFromPcs(pcs);
    } else {
      state.route = r.route;
    }
    if (state.route === 'tuning' && (state.tuning.id !== prevId || state.tuning.id === 'custom')) {
      state.scaleRoot = null; state.chordRoot = null;
    }
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    if (state.route === 'home') { renderHome(); $('#view-home').classList.add('active'); document.title = 'Alternate Tuning Guide'; }
    else if (state.route === 'tuning') { renderTuning(); $('#view-tuning').classList.add('active'); document.title = `${state.tuning.id === 'custom' ? notesOf(state.tuning.midi) : state.tuning.name} · Alternate Tuning Guide`; }
    else if (state.route === 'find') { renderFind(r.q); $('#view-find').classList.add('active'); document.title = 'Identify a tuning · Alternate Tuning Guide'; }
    else if (state.route === 'guide') { renderGuide(); $('#view-guide').classList.add('active'); document.title = 'How the book works · Alternate Tuning Guide'; }
    renderNav();
    $('#side').classList.remove('open');
    $('#menuBtn').setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: 'auto' });
    requestAnimationFrame(watchReveals);
  }

  // ---------- boot ----------
  $('#search').addEventListener('input', (e) => { state.filter = e.target.value; renderNav(); openPanel(true); });
  function openPanel(open) { $('#side').classList.toggle('open', open); $('#menuBtn').setAttribute('aria-expanded', String(open)); }
  const revealer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); revealer.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }) : null;
  function watchReveals() {
    document.querySelectorAll('.view.active .reveal:not(.in)').forEach((el) => { if (revealer) revealer.observe(el); else el.classList.add('in'); });
  }
  $('#search').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = $('#sideNav .nav-link');
      if (first) location.hash = first.getAttribute('href');
      else location.hash = '#find/' + encodeURIComponent(state.filter);
    }
  });
  $('#menuBtn').addEventListener('click', () => { openPanel(!$('#side').classList.contains('open')); if ($('#side').classList.contains('open')) $('#search').focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') openPanel(false); });
  window.addEventListener('hashchange', render);
  render();
})();
