// Flokefama: dependency-free interactions (the 3D hero lives in hero3d.js).
(() => {
  document.documentElement.classList.add('js');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Header turns to frosted glass once the page scrolls
  const header = document.querySelector('[data-header]');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('primary-nav');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) header.classList.add('is-scrolled'); else onScroll();
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // 3D tilt + glare on cards (mouse/trackpad only)
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const max = el.classList.contains('tile') ? 4 : 7;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', `${(x - 0.5) * max}deg`);
        el.style.setProperty('--rx', `${(0.5 - y) * max}deg`);
        el.style.setProperty('--mx', `${x * 100}%`);
        el.style.setProperty('--my', `${y * 100}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  if ('IntersectionObserver' in window && !reduceMotion) {
    // Staggered scroll reveal
    const groups = ['.section-head', '.bento > *', '.impact__copy', '.stat', '.service', '.product', '.news > *', '.news__item', '.contact__copy', '.form', '.branches li'];
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    groups.forEach((sel) => document.querySelectorAll(sel).forEach((el, i) => {
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--delay', `${(i % 6) * 0.08}s`);
      io.observe(el);
    }));

    // Count-up. The HTML already holds the final number, so it never shows "0".
    const counters = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, end = Number(el.dataset.count), t0 = performance.now(), dur = 1600;
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counters.unobserve(el);
    }), { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach((el) => counters.observe(el));
  }

  // Prototype form
  const form = document.querySelector('[data-form]');
  form?.addEventListener('submit', (e) => { e.preventDefault(); form.querySelector('.form__note').hidden = false; });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
