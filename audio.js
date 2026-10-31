// Guitar audio for the Alternate Tuning Guide.
// Extended Karplus-Strong plucked strings (fractional delay tuning, pick-position comb,
// frequency-dependent decay) played through a small guitar-body EQ, a synthesized room,
// and a gentle compressor. Exposes window.GuitarAudio.
(function () {
  'use strict';
  const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  const GuitarAudio = {
    ctx: null, input: null, cache: new Map(),

    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        const ctx = this.ctx = new AC();

        // body EQ: a little chest at 110 and 230 Hz, trim the boom and the fizz
        const lowShelf = ctx.createBiquadFilter(); lowShelf.type = 'lowshelf'; lowShelf.frequency.value = 90; lowShelf.gain.value = -4;
        const body1 = ctx.createBiquadFilter(); body1.type = 'peaking'; body1.frequency.value = 112; body1.Q.value = 1.4; body1.gain.value = 4.5;
        const body2 = ctx.createBiquadFilter(); body2.type = 'peaking'; body2.frequency.value = 235; body2.Q.value = 1.6; body2.gain.value = 3;
        const air = ctx.createBiquadFilter(); air.type = 'highshelf'; air.frequency.value = 4800; air.gain.value = -5;

        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -20; comp.knee.value = 14; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.18;

        const master = ctx.createGain(); master.gain.value = 0.7;

        const dry = ctx.createGain(); dry.gain.value = 0.9;
        const wet = ctx.createGain(); wet.gain.value = 0.24;
        const verb = ctx.createConvolver(); verb.buffer = this.roomImpulse(ctx, 1.6);

        this.input = ctx.createGain();
        this.input.connect(lowShelf).connect(body1).connect(body2).connect(air);
        air.connect(dry).connect(comp);
        air.connect(verb).connect(wet).connect(comp);
        comp.connect(master).connect(ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },

    // Short stereo room: exponentially decaying noise, darkened over time.
    roomImpulse(ctx, seconds) {
      const sr = ctx.sampleRate, len = Math.floor(sr * seconds);
      const buf = ctx.createBuffer(2, len, sr);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        let lp = 0;
        for (let i = 0; i < len; i++) {
          const t = i / len;
          const env = Math.pow(1 - t, 2.2) * (i < sr * 0.012 ? i / (sr * 0.012) : 1);
          const w = Math.random() * 2 - 1;
          lp += (0.35 - 0.25 * t) * (w - lp);
          d[i] = lp * env * 0.6;
        }
      }
      return buf;
    },

    // Synthesize one plucked string into an AudioBuffer (cached per MIDI note).
    string(midi) {
      if (this.cache.has(midi)) return this.cache.get(midi);
      const ctx = this.ctx, sr = ctx.sampleRate;
      const f = freq(midi);
      const period = sr / f;
      // loop delay = N (ring) + 0.5 (two-point average) + allpass delay (frac)
      let N = Math.floor(period - 0.5);
      let frac = period - 0.5 - N;
      if (frac < 0.2) { N -= 1; frac += 1; }
      const C = (1 - frac) / (1 + frac);

      const dur = Math.min(5, Math.max(2.2, 1.4 + 160 / f));
      const len = Math.floor(sr * dur);
      const buf = ctx.createBuffer(1, len, sr);
      const out = buf.getChannelData(0);

      // excitation: lowpassed noise, then a pick-position comb for a plucky attack
      const ring = new Float32Array(N);
      let lp = 0;
      const tone = Math.min(0.95, 0.45 + f / 900); // brighter excitation for high strings
      for (let i = 0; i < N; i++) { const w = Math.random() * 2 - 1; lp += tone * (w - lp); ring[i] = lp; }
      const pick = Math.max(1, Math.round(N * 0.13));
      for (let i = N - 1; i >= pick; i--) ring[i] -= 0.85 * ring[i - pick];

      // per-period gain so the note falls about 60 dB over 70% of its length; bass rings longer
      const g = Math.pow(10, -3 * N / (sr * dur * 0.7));
      // loop lowpass: plain average for low strings, slightly brighter for high ones
      const b = Math.min(0.62, 0.5 + f / 4000);

      let apX = 0, apY = 0, idx = 0;
      for (let i = 0; i < len; i++) {
        const x0 = ring[idx], x1 = ring[(idx + 1) % N];
        const y = (b * x0 + (1 - b) * x1) * g;
        const ap = C * y + apX - C * apY; // first-order allpass for the fractional delay
        apX = y; apY = ap;
        ring[idx] = ap;
        out[i] = x0;
        idx = (idx + 1) % N;
      }
      // soften the first 2 ms and normalize
      const fade = Math.floor(sr * 0.002);
      for (let i = 0; i < fade; i++) out[i] *= i / fade;
      let peak = 0;
      for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(out[i]));
      if (peak > 0) for (let i = 0; i < len; i++) out[i] = out[i] / peak * 0.7;
      this.cache.set(midi, buf);
      return buf;
    },

    pluck(midi, when, gain, pan) {
      const ctx = this.ensure();
      if (!ctx || midi == null) return;
      const src = ctx.createBufferSource();
      src.buffer = this.string(midi);
      src.detune.value = (Math.random() - 0.5) * 6; // a few cents of human slop
      const g = ctx.createGain();
      g.gain.value = (gain == null ? 1 : gain) * (0.92 + Math.random() * 0.16);
      let node = src.connect(g);
      if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan || 0; node = node.connect(p); }
      node.connect(this.input);
      src.start(when == null ? ctx.currentTime : when);
    },

    // Strum an array of MIDI notes (low string first; null = skipped). spacing in seconds.
    strum(midis, spacing, when) {
      const ctx = this.ensure();
      if (!ctx) return 0;
      const t0 = (when == null ? ctx.currentTime : when) + 0.02;
      const sounding = midis.filter((m) => m != null).length;
      let k = 0;
      midis.forEach((m, i) => {
        if (m == null) return;
        const pan = midis.length > 1 ? -0.4 + 0.8 * (i / (midis.length - 1)) : 0;
        const jitter = (Math.random() - 0.5) * 0.01;
        this.pluck(m, t0 + k * (spacing || 0.05) + jitter, 0.95 - k * 0.03, pan);
        k++;
      });
      return sounding * (spacing || 0.05);
    }
  };

  window.GuitarAudio = GuitarAudio;
})();
