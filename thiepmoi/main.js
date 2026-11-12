(() => {
  'use strict';
  const c = window.WEDDING_CONFIG;
  const $ = id => document.getElementById(id);
  const date = new Date(c.date);
  if (Number.isNaN(date.getTime())) {
    $('cover-date').textContent = 'Vui lòng kiểm tra ngày cưới trong config.js';
    return;
  }
  document.querySelectorAll('[data-bind]').forEach(el => {
    el.textContent = el.dataset.bind.split('.').reduce((obj, key) => obj?.[key], c) ?? '';
  });
  const zone = 'Asia/Ho_Chi_Minh';
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(date).map(p => [p.type, p.value]));
  const title = `${c.bride.name} & ${c.groom.name} | Thiệp mời lễ thành hôn`;
  document.title = title;
  document.querySelector('meta[property="og:title"]').content = title;
  $('cover-date').textContent = new Intl.DateTimeFormat('vi-VN', {
    timeZone: zone, day: 'numeric', month: 'long', year: 'numeric'
  }).format(date);
  const params = new URLSearchParams(location.search);
  $('guest-name').textContent = String(params.get('guest') || c.guestName || '').slice(0, 120);
  $('event-time').textContent = `${Number(parts.hour)}:${parts.minute}`;
  $('event-day').textContent = Number(parts.day);
  $('event-weekday').textContent = new Intl.DateTimeFormat('vi-VN', {
    timeZone: zone, weekday: 'long'
  }).format(date).toUpperCase();
  $('event-month-year').textContent = `THÁNG ${Number(parts.month)}\n${parts.year}`;

  function safeHttpUrl(value) {
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }
  c.timeline.forEach(item => {
    const li = document.createElement('li');
    const time = document.createElement('time');
    const details = document.createElement('div');
    const title = document.createElement('h3');
    const address = document.createElement('p');
    time.textContent = item.time;
    const [hour, minute] = item.time.split(':');
    time.dateTime = `${parts.year}-${parts.month}-${parts.day}T${hour.padStart(2, '0')}:${minute}:00+07:00`;
    title.textContent = item.title;
    address.className = 'timeline-address';
    address.textContent = item.address;
    details.className = 'timeline-details';
    details.append(title, address);
    let mapsUrl = safeHttpUrl(item.mapsUrl);
    if (!mapsUrl && item.mapsQuery) {
      const url = new URL('https://www.google.com/maps/search/');
      url.search = new URLSearchParams({ api: '1', query: item.mapsQuery });
      mapsUrl = url.href;
    }
    if (mapsUrl) {
      const addressLink = document.createElement('a');
      addressLink.href = mapsUrl;
      addressLink.target = '_blank'; addressLink.rel = 'noopener noreferrer';
      addressLink.textContent = item.address;
      addressLink.setAttribute('aria-label', `Mở vị trí ${item.address} trên Google Maps`);
      address.replaceChildren(addressLink);
    }
    li.append(time, details); $('timeline').append(li);
  });

  // Hiện dần từng phần nội dung khi vào khung nhìn.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionTargets = [];
  let revealObserver = null;
  let opened = false;
  let scrollFrame = 0;
  const sections = [...document.querySelectorAll('.floral-section')];
  function markReveal(element, direction = 'up', delay = 0) {
    if (!element) return;
    element.dataset.reveal = direction;
    element.style.setProperty('--reveal-delay', `${delay}ms`);
    motionTargets.push(element);
  }
  document.querySelectorAll('.section-title').forEach(el => markReveal(el));
  document.querySelectorAll('.families > div').forEach((el, n) => markReveal(el, n ? 'right' : 'left', n * 120));
  document.querySelectorAll('.announcement-copy, .couple-name, .ampersand, .eyebrow, .wedding-date, .lunar-date').forEach(el => markReveal(el));
  document.querySelectorAll('.timeline > li').forEach((el, n) => markReveal(el, 'up', n * 100));
  document.querySelectorAll('footer > *').forEach((el, n) => markReveal(el, 'up', n * 100));

  function showAll() {
    motionTargets.forEach(el => el.classList.add('is-visible'));
  }
  function updateParallax() {
    scrollFrame = 0;
    if (!opened || reducedMotion.matches || document.hidden) return;
    const center = innerHeight / 2;
    sections.forEach(el => {
      const rect = el.getBoundingClientRect();
      const offset = Math.max(-32, Math.min(32, (center - rect.top - rect.height / 2) * .055));
      el.style.setProperty('--floral-offset', `${offset.toFixed(2)}px`);
    });
  }
  function requestParallax() {
    if (opened && !reducedMotion.matches && !scrollFrame) scrollFrame = requestAnimationFrame(updateParallax);
  }
  function startReveals() {
    if (reducedMotion.matches || !revealObserver) { showAll(); return; }
    motionTargets.forEach(el => revealObserver.observe(el));
    requestParallax();
  }
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    try {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: .12, rootMargin: '0px 0px -24px 0px' });
      document.documentElement.classList.add('motion-enabled');
    } catch { showAll(); }
  } else showAll();
  addEventListener('scroll', requestParallax, { passive: true });
  addEventListener('resize', requestParallax, { passive: true });
  document.addEventListener('focusin', event => {
    event.target.closest('[data-reveal]')?.classList.add('is-visible');
  });
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('motion-paused', document.hidden);
    if (!document.hidden) requestParallax();
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      revealObserver?.disconnect();
      document.documentElement.classList.remove('motion-enabled');
      showAll();
      if (scrollFrame) { cancelAnimationFrame(scrollFrame); scrollFrame = 0; }
    }
  });

  function openInvitation(skipTransition = false) {
    if (opened) return;
    opened = true;
    if (skipTransition) $('cover').classList.add('skip-transition');
    $('cover').classList.add('is-open'); $('cover').inert = true;
    $('invitation').inert = false; document.body.classList.remove('is-covered');
    scrollTo({ top: 0, behavior: 'instant' });
    $('invitation').setAttribute('tabindex', '-1'); $('invitation').focus({ preventScroll: true });
    if (skipTransition || reducedMotion.matches) startReveals();
    else setTimeout(startReveals, 650);
  }
  $('open-invitation').addEventListener('click', () => openInvitation());
  if (params.get('open') === '1') openInvitation(true);
  if (!reducedMotion.matches) {
    for (const [container, count] of [[$('cover').querySelector('.petals'), 12], [$('ambient-petals'), 8]]) {
      for (let n = 0; n < count; n++) {
        const petal = document.createElement('i'); petal.className = 'petal';
        petal.style.left = `${n * 100 / count}%`;
        petal.style.width = `${6 + n % 4 * 2}px`;
        petal.style.height = `${5 + n % 3 * 2}px`;
        petal.style.animationDuration = `${17 + n % 5 * 3}s`;
        petal.style.animationDelay = `${-n * 3.1}s`;
        container.append(petal);
      }
    }
  }
})();
