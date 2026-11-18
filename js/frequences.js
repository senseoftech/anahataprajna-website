/* Anahata Prajñā — animations et sons pilotés par les fréquences.
   La fréquence visuelle d'une page est lue sur <body data-freq="639">. */
(() => {
  'use strict';

  const doc = document;
  const root = doc.documentElement;
  root.classList.add('js');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FREQ = Number(doc.body.dataset.freq) || 639;
  const state = { ringing: false };
  const TAU = Math.PI * 2;

  let audio = null;
  function audioContext() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audio = audio || new Ctx();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    return audio;
  }

  /* ---------- Figures de Chladni : le sable migre vers les lignes nodales ---------- */
  function createPlate(canvas, initial) {
    const ctx = canvas.getContext('2d');
    const count = innerWidth < 700 ? 3000 : 5200;
    const grains = new Float32Array(count * 2);
    let { m, n, sign, color } = initial;
    let size = 0;
    let visible = false;
    let raf = 0;
    let energy = 1;

    function seed(i) {
      const r = Math.sqrt(Math.random());
      const a = Math.random() * TAU;
      grains[2 * i] = r * Math.cos(a);
      grains[2 * i + 1] = r * Math.sin(a);
    }

    function scatter() {
      for (let i = 0; i < count; i++) seed(i);
      energy = 3;
    }

    function amplitude(x, y, sway) {
      const px = Math.PI * x;
      const py = Math.PI * y;
      const main = Math.cos(n * px) * Math.cos(m * py) + sign * Math.cos(m * px) * Math.cos(n * py);
      const drift = Math.cos((n + 1) * px) * Math.cos((m + 1) * py) + sign * Math.cos((m + 1) * px) * Math.cos((n + 1) * py);
      return main + sway * drift;
    }

    function step(sway) {
      for (let i = 0; i < count; i++) {
        let x = grains[2 * i];
        let y = grains[2 * i + 1];
        const a = Math.min(Math.abs(amplitude(x, y, sway)), 1.2);
        const d = (0.0011 + 0.021 * a) * energy;
        const dir = Math.random() * TAU;
        x += d * Math.cos(dir);
        y += d * Math.sin(dir);
        if (x * x + y * y > 1) {
          seed(i);
        } else {
          grains[2 * i] = x;
          grains[2 * i + 1] = y;
        }
      }
      if (energy > 1) energy = Math.max(1, energy * 0.985);
    }

    function draw() {
      const r = size / 2;
      const dot = Math.max(1, size / 400);
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.86;
      for (let i = 0; i < count; i++) {
        ctx.fillRect(r + grains[2 * i] * r * 0.97, r + grains[2 * i + 1] * r * 0.97, dot, dot);
      }
    }

    function settle() {
      energy = 1;
      for (let k = 0; k < 420; k++) step(0);
      draw();
    }

    function frame(now) {
      step(0.16 * Math.sin(now / 5200));
      draw();
      raf = requestAnimationFrame(frame);
    }

    function update() {
      const shouldRun = visible && !doc.hidden && !reduce;
      if (shouldRun && !raf) raf = requestAnimationFrame(frame);
      if (!shouldRun && raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const next = Math.round(canvas.clientWidth * dpr);
      if (!next || next === size) return;
      size = next;
      canvas.width = size;
      canvas.height = size;
      if (reduce) settle(); else draw();
    }

    function strike() {
      scatter();
      if (reduce) settle();
    }

    function setMode(next) {
      ({ m, n, sign, color } = next);
      strike();
    }

    scatter();
    energy = 1;
    resize();
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      update();
    }).observe(canvas);
    doc.addEventListener('visibilitychange', update);
    canvas.addEventListener('pointerdown', strike);

    return { strike, setMode };
  }

  /* ---------- Ondes : le nombre de cycles est proportionnel à la fréquence ---------- */
  function initWave(el) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = doc.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1200 80');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const back = doc.createElementNS(NS, 'path');
    const front = doc.createElementNS(NS, 'path');
    back.setAttribute('class', 'onde-back');
    front.setAttribute('class', 'onde-front');
    svg.append(back, front);
    el.append(svg);

    const cycles = FREQ / 55;
    const STEPS = 240;
    let phase = 0;
    let amp = 13;
    let visible = false;
    let raf = 0;

    function trace(height, shift, turns) {
      let d = '';
      for (let i = 0; i <= STEPS; i++) {
        const u = i / STEPS;
        const y = 40 + height * Math.sin(Math.PI * u) * Math.sin(TAU * turns * u + shift);
        d += (i ? 'L' : 'M') + (u * 1200).toFixed(1) + ',' + y.toFixed(1);
      }
      return d;
    }

    function render() {
      front.setAttribute('d', trace(amp, phase, cycles));
      back.setAttribute('d', trace(amp * 0.6, -phase * 0.6, cycles / 2));
    }

    function frame() {
      const target = state.ringing ? 24 : 13;
      amp += (target - amp) * 0.05;
      phase += state.ringing ? 0.05 : 0.022;
      render();
      raf = requestAnimationFrame(frame);
    }

    function update() {
      const shouldRun = visible && !doc.hidden && !reduce;
      if (shouldRun && !raf) raf = requestAnimationFrame(frame);
      if (!shouldRun && raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    render();
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      update();
    }).observe(el);
    doc.addEventListener('visibilitychange', update);
  }

  /* ---------- Curseur de fréquences et bol chantant ----------
     Le curseur choisit la fréquence : le sable se réorganise et le bol change de note.
     Le bol est fait de partiels inharmoniques, chacun doublé pour créer le battement. */
  function initInstrument(section) {
    const items = [...section.querySelectorAll('[data-tones] > li')];
    const range = section.querySelector('[data-tone-range]');
    const slider = section.querySelector('[data-slider]');
    const ticksBox = section.querySelector('[data-ticks]');
    const strikeButton = section.querySelector('[data-bol]');
    const stopButton = section.querySelector('[data-bol-stop]');
    const status = section.querySelector('[data-bol-status]');

    const tones = items.map((li) => ({
      hz: Number(li.dataset.hz),
      m: Number(li.dataset.m),
      n: Number(li.dataset.n),
      sign: li.dataset.sign === '+' ? 1 : -1,
      color: li.dataset.tone,
      name: li.querySelector('h3').firstChild.textContent.trim(),
    }));

    // [rapport au fondamental, niveau, durée d'extinction en secondes]
    const PARTIALS = [[1, 1, 22], [2.71, 0.45, 14], [5.15, 0.2, 8], [8.1, 0.08, 4]];
    const RING_SECONDS = 22;
    const MAX_VOICES = 3;
    let current = Number(range.value);
    let voices = [];
    let timer = 0;

    const plate = createPlate(section.querySelector('[data-instrument-plate]'), tones[current]);

    const ticks = tones.map((tone, index) => {
      const tick = doc.createElement('button');
      tick.type = 'button';
      tick.tabIndex = -1;
      tick.textContent = tone.hz;
      tick.style.left = `calc(13px + (100% - 26px) * ${index / (tones.length - 1)})`;
      tick.addEventListener('click', () => {
        range.value = index;
        select(index);
      });
      ticksBox.append(tick);
      return tick;
    });

    function show(index) {
      const tone = tones[index];
      items.forEach((li, i) => li.classList.toggle('is-active', i === index));
      ticks.forEach((tick, i) => tick.classList.toggle('is-active', i === index));
      section.style.setProperty('--tone', tone.color);
      range.setAttribute('aria-valuetext', `${tone.hz} hertz, ${tone.name}`);
    }

    function select(index) {
      if (index === current) return;
      current = index;
      silence();
      show(index);
      plate.setMode(tones[index]);
    }

    function fade(voice) {
      const now = audio.currentTime;
      voice.out.gain.cancelScheduledValues(now);
      voice.out.gain.setTargetAtTime(0, now, 0.12);
      voice.sources.forEach((source) => {
        try { source.stop(now + 0.8); } catch (e) { /* source déjà terminée */ }
      });
    }

    function rest() {
      clearTimeout(timer);
      state.ringing = false;
      section.classList.remove('is-ringing');
      stopButton.disabled = true;
      status.textContent = '';
    }

    function strike() {
      const ctx = audioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const base = tones[current].hz / 2;
      const out = ctx.createGain();
      out.gain.value = 0.11;
      out.connect(ctx.destination);
      const sources = [];

      PARTIALS.forEach(([ratio, level, decay], index) => {
        const envelope = ctx.createGain();
        envelope.gain.setValueAtTime(0.0001, now);
        envelope.gain.exponentialRampToValueAtTime(level, now + 0.012);
        envelope.gain.exponentialRampToValueAtTime(level * 0.001, now + decay);
        envelope.connect(out);
        const beat = 0.35 + index * 0.4;
        // Deux voix inégales : le battement module le son sans jamais l'éteindre
        [[-beat / 2, 0.62], [beat / 2, 0.38]].forEach(([offset, share]) => {
          const osc = ctx.createOscillator();
          const half = ctx.createGain();
          osc.frequency.value = base * ratio + offset;
          half.gain.value = share;
          osc.connect(half).connect(envelope);
          osc.start(now);
          osc.stop(now + decay + 0.1);
          sources.push(osc);
        });
      });

      // Le « toc » feutré du maillet
      const length = Math.floor(ctx.sampleRate * 0.04);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / length);
      const tap = ctx.createBufferSource();
      const band = ctx.createBiquadFilter();
      const tapGain = ctx.createGain();
      tap.buffer = buffer;
      band.type = 'bandpass';
      band.frequency.value = base * 4;
      band.Q.value = 1.2;
      tapGain.gain.value = 0.3;
      tap.connect(band).connect(tapGain).connect(out);
      tap.start(now);

      voices.push({ out, sources });
      if (voices.length > MAX_VOICES) fade(voices.shift());

      plate.strike();
      state.ringing = true;
      section.classList.add('is-ringing');
      stopButton.disabled = false;
      status.textContent = 'Le bol résonne…';
      clearTimeout(timer);
      timer = setTimeout(() => { voices = []; rest(); }, RING_SECONDS * 1000);
    }

    function silence() {
      if (audio) voices.forEach(fade);
      voices = [];
      rest();
    }

    range.addEventListener('input', () => select(Number(range.value)));
    strikeButton.addEventListener('click', strike);
    stopButton.addEventListener('click', silence);
    addEventListener('pagehide', silence);

    slider.hidden = false;
    show(current);
  }

  /* ---------- Demande de rendez-vous : ouvre la messagerie avec le message rédigé ---------- */
  function initRequestForm(form) {
    const select = form.querySelector('[name="soin"]');
    const wanted = new URLSearchParams(location.search).get('soin');
    if (wanted && [...select.options].some((option) => option.value === wanted)) select.value = wanted;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const soin = select.options[select.selectedIndex].textContent;
      const subject = `Demande de rendez-vous — ${soin}`;
      const body = [
        'Bonjour Mélissa,',
        '',
        data.get('message') || '',
        '',
        `Nom : ${data.get('nom')}`,
        `Me recontacter : ${data.get('contact')}`,
        `Soin souhaité : ${soin}`,
      ].join('\n');
      const link = doc.createElement('a');
      link.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      link.hidden = true;
      form.append(link);
      link.click();
      link.remove();
    });
  }

  /* ---------- Apparition au défilement ---------- */
  function initReveal() {
    const items = doc.querySelectorAll('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Menu mobile ---------- */
  function initNav() {
    const toggle = doc.querySelector('[data-nav-toggle]');
    const menu = doc.querySelector('[data-nav-menu]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  doc.querySelectorAll('canvas[data-chladni]').forEach((canvas) => {
    createPlate(canvas, {
      m: Number(canvas.dataset.m) || 3,
      n: Number(canvas.dataset.n) || 4,
      sign: canvas.dataset.sign === '+' ? 1 : -1,
      color: getComputedStyle(canvas).color,
    });
  });
  doc.querySelectorAll('[data-onde]').forEach(initWave);
  doc.querySelectorAll('[data-instrument]').forEach(initInstrument);
  doc.querySelectorAll('[data-demande]').forEach(initRequestForm);
  initReveal();
  initNav();
})();
