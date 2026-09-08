/* Kessler Auto Body — behaviour. No dependencies. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- live clock (nav) ---------- */
  const dateEl = $('#navDate'), timeEl = $('#navTime');
  const tick = () => {
    const d = new Date();
    if (dateEl) dateEl.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (timeEl) timeEl.textContent = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  tick(); setInterval(tick, 1000);

  /* ---------- menu ---------- */
  const burger = $('#burger'), menu = $('#menu');
  const setMenu = (open) => {
    burger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('lock', open);
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  $$('.rv, .split').forEach(el => io.observe(el));

  /* ---------- counters ---------- */
  const fmt = (n, dec) => dec ? n.toFixed(dec) : Math.round(n).toLocaleString('en-US');
  const cio = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    cio.unobserve(en.target);
    const el = en.target, to = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0), suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = fmt(to, dec) + suf; return; }
    const t0 = performance.now(), dur = 1900;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(to * e, dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.35 });
  $$('.stat__num').forEach(el => cio.observe(el));

  /* ---------- owner quote: word fill on scroll ---------- */
  const quote = $('#quote');
  let qws = [];
  if (quote) {
    const words = quote.textContent.trim().split(/\s+/);
    quote.innerHTML = words.map(w => `<span class="qw">${w}</span>`).join(' ');
    qws = $$('.qw', quote);
  }
  const quoteScroll = () => {
    if (!quote) return;
    const r = quote.getBoundingClientRect(), vh = innerHeight;
    const start = vh * 0.88, end = vh * 0.38;
    const p = Math.min(1, Math.max(0, (start - r.top) / (r.height + (start - end))));
    const n = Math.round(p * qws.length);
    qws.forEach((s, i) => s.classList.toggle('on', i < n));
  };

  /* ---------- process timeline progress ---------- */
  const tl = $('#timeline'), tlLine = tl && $('.timeline__line', tl);
  const tlScroll = () => {
    if (!tl) return;
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.72 - r.top) / r.height));
    tlLine.style.setProperty('--p', p.toFixed(3));
  };

  let scrollQueued = false;
  const onScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { quoteScroll(); tlScroll(); scrollQueued = false; });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  quoteScroll(); tlScroll();

  /* ---------- drag-to-explore grid ---------- */
  const explore = $('#explore'), canvas = $('#canvas');
  if (explore && canvas) {
    const IMGS = ['hero', 'work-bmw', 'svc-paint', 'work-macan', 'story', 'svc-collision', 'paint-mixing', 'svc-frame', 'shop-wide', 'svc-dent'];
    const COLS = 7, ROWS = 4;
    let html = '';
    for (let c = 0; c < COLS; c++) {
      html += '<div class="explore__col">';
      for (let r = 0; r < ROWS; r++) {
        const n = IMGS[(c * 3 + r * 4 + (c % 2)) % IMGS.length];
        html += `<div class="tile"><img src="assets/${n}-sm.jpg" alt="" loading="lazy" decoding="async" draggable="false"></div>`;
      }
      html += '</div>';
    }
    canvas.innerHTML = html;
    canvas.style.gridTemplateColumns = `repeat(${COLS}, max-content)`;

    let x = 0, y = 0, vx = 0, vy = 0, dragging = false, lx = 0, ly = 0, touched = false, inView = false, dir = 1;
    const bounds = () => ({ minX: Math.min(0, explore.clientWidth - canvas.offsetWidth), minY: Math.min(0, explore.clientHeight - canvas.offsetHeight) });
    const clamp = () => { const b = bounds(); x = Math.max(b.minX, Math.min(0, x)); y = Math.max(b.minY, Math.min(0, y)); };
    const apply = () => { canvas.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`; };
    const center = () => { const b = bounds(); x = b.minX / 2; y = b.minY / 2; apply(); };
    center();
    addEventListener('resize', center);

    explore.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      dragging = true; touched = true;
      explore.classList.add('dragging', 'touched');
      lx = e.clientX; ly = e.clientY; vx = vy = 0;
      try { explore.setPointerCapture(e.pointerId); } catch (_) {}
    });
    explore.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      x += dx; y += dy; vx = dx; vy = dy;
      clamp(); apply();
    });
    const end = () => { if (!dragging) return; dragging = false; explore.classList.remove('dragging'); };
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => explore.addEventListener(ev, end));

    new IntersectionObserver(en => { inView = en[0].isIntersecting; }, { threshold: 0.05 }).observe(explore);

    const loop = () => {
      if (!dragging && inView) {
        if (Math.abs(vx) > 0.15 || Math.abs(vy) > 0.15) { x += vx; y += vy; vx *= 0.93; vy *= 0.93; clamp(); apply(); }
        else if (!touched && !reduce) {
          x -= 0.3 * dir;
          const b = bounds();
          if (x <= b.minX + 1 || x >= -1) dir *= -1;
          clamp(); apply();
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- faq ---------- */
  $$('.qa__q').forEach(btn => btn.addEventListener('click', () => {
    const qa = btn.parentElement, group = qa.parentElement, wasOpen = qa.classList.contains('open');
    $$('.qa', group).forEach(q => { q.classList.remove('open'); $('.qa__q', q).setAttribute('aria-expanded', 'false'); });
    if (!wasOpen) { qa.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  }));

  /* ---------- client stories strip ---------- */
  const T = {
    1: { name: 'Daniel Reyes', role: 'Rear-quarter collision', car: '2022 BMW M340i', img: 'work-bmw',
         q: '"They gave us back a car we couldn’t tell apart from new. Two doors and a quarter panel, blended so well the dealer’s own shop couldn’t find the repair at trade-in."' },
    2: { name: 'Elena Marsh', role: 'Full refinish', car: '2023 Lexus ES', img: 'hero',
         q: '"Sun-faded champagne on a lease return. They matched it, blended it, and texted me photos every other day. The dealer signed off without a single note."' },
    3: { name: 'Marcus Tran', role: 'Fender & door', car: '2020 Honda Accord', img: 'svc-collision',
         q: '"Someone backed into me in a parking lot. Estimate in ten minutes from three photos, rental waiting at drop-off, car back in four days. Zero drama."' },
    4: { name: 'Jordan Kim', role: 'Hail damage, paintless', car: '2018 Audi A4', img: 'svc-dent',
         q: '"Forty-one dents from one hailstorm, gone without a drop of paint. They walked me around the car with a light board so I could check every one myself."' }
  };
  const main = $('#stripMain');
  if (main) {
    let busy = false;
    $$('.strip__side').forEach(btn => btn.addEventListener('click', () => {
      const t = T[btn.dataset.t]; if (!t || busy) return;
      busy = true; main.classList.add('swap');
      setTimeout(() => {
        $('#stripImg').src = `assets/${t.img}-lg.jpg`;
        $('#stripName').textContent = t.name;
        $('#stripRole').textContent = t.role;
        $('#stripCar').textContent = t.car;
        $('#stripQuote').textContent = t.q;
        main.classList.remove('swap');
        busy = false;
      }, 380);
    }));
  }

  /* ---------- letter roll links ---------- */
  $$('.roll').forEach(a => {
    const t = a.textContent.trim();
    a.setAttribute('aria-label', t);
    a.innerHTML = Array.from(t).map((c, i) => {
      const ch = c === ' ' ? ' ' : c;
      return `<span class="ch" data-c="${ch}" style="--i:${i}" aria-hidden="true">${ch}</span>`;
    }).join('');
  });

  /* ---------- forms ---------- */
  $$('form[data-sub]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('input', f);
    if (!input.value || !input.checkValidity()) { input.focus(); return; }
    f.classList.add('done'); input.value = '';
  }));

  /* ---------- hero reel ---------- */
  const reel = $('#reel');
  if (reel) {
    const p = reel.play(); if (p && p.catch) p.catch(() => {});
    reel.addEventListener('error', () => { reel.removeAttribute('autoplay'); }, true);
  }

  /* ---------- fonts ready flag ---------- */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => document.documentElement.classList.add('fonts'));
})();
