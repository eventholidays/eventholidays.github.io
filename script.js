/* ============================================================
   EVENT HOLIDAYS — MAIN SCRIPT
   Features: Theme Toggle, Mobile Menu, Navbar Scroll,
             Counter Animation, Package Filter,
             Testimonials Slider (touch + auto),
             Scroll Reveal, Contact Form, Newsletter
   ============================================================ */

'use strict';

// ── THEME TOGGLE ─────────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const html        = document.documentElement;

const savedTheme = localStorage.getItem('ht-theme') || 'light';
html.setAttribute('data-theme', savedTheme);
applyThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('ht-theme', next);
  applyThemeIcon(next);
});

function applyThemeIcon(theme) {
  themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// ── MOBILE MENU ───────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', open);
});

// Close on nav-link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  }
});

// ── NAVBAR SCROLL BEHAVIOUR ──────────────────────────────────
const navbar    = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

function onScroll() {
  const y = window.scrollY;

  // Sticky style
  navbar.classList.toggle('scrolled', y > 50);

  // Back-to-top visibility
  backToTop.classList.toggle('visible', y > 500);

  // Active nav link
  updateActiveNav();
}
window.addEventListener('scroll', onScroll, { passive: true });

// ── ACTIVE NAV LINK ON SCROLL ────────────────────────────────
function updateActiveNav() {
  const scrollPos = window.scrollY + 90;
  document.querySelectorAll('section[id]').forEach(section => {
    const top   = section.offsetTop;
    const bot   = top + section.offsetHeight;
    const id    = section.getAttribute('id');
    const link  = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) link.classList.toggle('active', scrollPos >= top && scrollPos < bot);
  });
}

// ── BACK TO TOP ───────────────────────────────────────────────
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── SCROLL REVEAL (Intersection Observer) ────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── COUNTER ANIMATION ─────────────────────────────────────────
const counters     = document.querySelectorAll('.stat-num');
let   countersRun  = false;

const counterObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !countersRun) {
    countersRun = true;
    counters.forEach(runCounter);
  }
}, { threshold: 0.6 });

if (counters.length) counterObs.observe(counters[0]);

function runCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const fps      = 60;
  const steps    = Math.ceil(duration / (1000 / fps));
  const inc      = target / steps;
  let   current  = 0;

  const tick = () => {
    current += inc;
    if (current < target) {
      el.textContent = Math.floor(current).toLocaleString('en-IN');
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toLocaleString('en-IN');
    }
  };
  requestAnimationFrame(tick);
}

// ── PACKAGE FILTER ─────────────────────────────────────────────
const filterBtns   = document.querySelectorAll('.filter-btn');
const packageCards = document.querySelectorAll('.package-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    packageCards.forEach(card => {
      const cats = card.dataset.category || '';
      const show = filter === 'all' || cats.split(' ').includes(filter);
      card.classList.toggle('hidden', !show);
    });
  });
});

// ── TESTIMONIALS SLIDER ────────────────────────────────────────
(function initSlider() {
  const sliderWrap = document.getElementById('testimonialsSlider');
  const track      = document.getElementById('testimonialsTrack');
  const prevBtn    = document.getElementById('prevBtn');
  const nextBtn    = document.getElementById('nextBtn');
  const dotsWrap   = document.getElementById('sliderDots');
  const cards      = Array.from(track.querySelectorAll('.testimonial-card'));
  let   current    = 0;
  let   autoTimer  = null;
  const GAP        = 24; // 1.5rem in px

  function slidesPerView() {
    const w = window.innerWidth;
    if (w <= 580) return 1;
    if (w <= 900) return 2;
    return 3;
  }

  function totalSlides() {
    return Math.max(0, cards.length - slidesPerView() + 1);
  }

  function setCardWidths() {
    const spv  = slidesPerView();
    const total = sliderWrap.clientWidth;
    const w    = (total - (spv - 1) * GAP) / spv;
    cards.forEach(c => { c.style.width = w + 'px'; });
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const n = totalSlides();
    for (let i = 0; i < n; i++) {
      const d = document.createElement('button');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function goTo(idx) {
    const n = totalSlides();
    current = Math.max(0, Math.min(idx, n - 1));
    const cardW = cards[0].offsetWidth + GAP;
    track.style.transform = `translateX(-${current * cardW}px)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goTo(current >= totalSlides() - 1 ? 0 : current + 1);
    }, 5000);
  }

  function stopAuto() { clearInterval(autoTimer); }

  // Init
  function init() {
    setCardWidths();
    buildDots();
    goTo(0);
    startAuto();
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  sliderWrap.addEventListener('mouseenter', stopAuto);
  sliderWrap.addEventListener('mouseleave', startAuto);

  // Touch swipe
  let touchX0 = 0;
  sliderWrap.addEventListener('touchstart', e => { touchX0 = e.changedTouches[0].screenX; }, { passive: true });
  sliderWrap.addEventListener('touchend',   e => {
    const diff = touchX0 - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
  }, { passive: true });

  // Keyboard accessibility
  sliderWrap.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  window.addEventListener('resize', debounce(() => { init(); }, 200));
  init();
})();

// ── CONTACT FORM ──────────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    const nameEl  = document.getElementById('cf-name');
    const emailEl = document.getElementById('cf-email');
    const phoneEl = document.getElementById('cf-phone');
    let valid = true;

    // Reset errors
    [nameEl, emailEl, phoneEl].forEach(f => f.classList.remove('error'));

    // Validate presence
    if (!nameEl.value.trim())  { nameEl.classList.add('error');  valid = false; }
    if (!phoneEl.value.trim()) { phoneEl.classList.add('error'); valid = false; }

    // Validate email format
    if (!emailEl.value.trim()) {
      emailEl.classList.add('error'); valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
      emailEl.classList.add('error'); valid = false;
    }

    if (!valid) {
      // Scroll to first error
      const first = contactForm.querySelector('.error');
      if (first) first.scrollIntoView({ behavior:'smooth', block:'center' });
      return;
    }

    // Show loading state
    const submitBtn = contactForm.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    // Simulate async submission (replace with real API call)
    setTimeout(() => {
      contactForm.reset();
      formSuccess.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => { formSuccess.style.display = 'none'; }, 6000);
    }, 1500);
  });

  // Clear error on input
  contactForm.querySelectorAll('input, textarea, select').forEach(f => {
    f.addEventListener('input', () => f.classList.remove('error'));
  });
}

// ── NEWSLETTER FORM ───────────────────────────────────────────
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    const inp = newsletterForm.querySelector('input[type="email"]');
    if (inp && inp.value) {
      inp.value = '';
      inp.placeholder = '✓ Subscribed! Thank you';
      setTimeout(() => { inp.placeholder = 'your@email.com'; }, 3500);
    }
  });
}

// ── SMOOTH HREF SCROLL (native fallback) ─────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── UTILITY: DEBOUNCE ─────────────────────────────────────────
function debounce(fn, wait) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}
