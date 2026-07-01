/* ─────────────────────────────────────────
   Active nav tab on scroll
───────────────────────────────────────── */
const sections = document.querySelectorAll('main section[id]');
const navTabs  = document.querySelectorAll('.nav-tab[data-section]');
const mobileTabs = document.querySelectorAll('.mobile-tab[data-section]');

function setActiveTab(id) {
  [...navTabs, ...mobileTabs].forEach(tab => {
    tab.classList.toggle('active', tab.dataset.section === id);
  });
}

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActiveTab(entry.target.id);
    });
  },
  { rootMargin: `-${56 + 32}px 0px -50% 0px`, threshold: 0 }
);

sections.forEach(sec => sectionObserver.observe(sec));

/* Set initial active state */
setActiveTab('about');

/* ─────────────────────────────────────────
   Smooth scroll on nav click
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
    /* Close mobile menu if open */
    closeMobileMenu();
  });
});

/* ─────────────────────────────────────────
   Mobile menu toggle
───────────────────────────────────────── */
const mobileBtn  = document.querySelector('.nav-mobile-btn');
const mobileMenu = document.getElementById('mobile-menu');

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  mobileBtn.setAttribute('aria-expanded', 'false');
  mobileBtn.setAttribute('aria-label', 'Open navigation');
}

mobileBtn?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  mobileBtn.setAttribute('aria-expanded', String(isOpen));
  mobileBtn.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

/* Close on outside click */
document.addEventListener('click', e => {
  if (!e.target.closest('.nav')) closeMobileMenu();
});

/* ─────────────────────────────────────────
   Scroll reveal (respects prefers-reduced-motion via CSS)
───────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal-hero, .reveal-item');

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.delay ?? '0', 10);
      setTimeout(() => el.classList.add('is-visible'), delay);
      revealObserver.unobserve(el);
    });
  },
  { rootMargin: '0px 0px -60px 0px', threshold: 0.05 }
);

revealEls.forEach(el => revealObserver.observe(el));

/* Immediately reveal hero (above fold) */
const heroEl = document.querySelector('.reveal-hero');
if (heroEl) {
  requestAnimationFrame(() => {
    setTimeout(() => heroEl.classList.add('is-visible'), 80);
  });
}

/* ─────────────────────────────────────────
   Nav scroll state
───────────────────────────────────────── */
const nav = document.getElementById('nav');
let lastY = 0;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.style.setProperty('--scroll-y', y);
  /* Add subtle border emphasis after scrolling past hero */
  nav.classList.toggle('nav--scrolled', y > 80);
  lastY = y;
}, { passive: true });

/* ─────────────────────────────────────────
   Project tag filters
───────────────────────────────────────── */
const filterTags = document.querySelectorAll('.filter-tag');
const projectPanels = document.querySelectorAll('.project-panel[data-tags]');

filterTags.forEach(tag => {
  tag.addEventListener('click', () => {
    filterTags.forEach(t => t.classList.remove('active'));
    tag.classList.add('active');
    const filter = tag.dataset.filter;
    projectPanels.forEach(panel => {
      const tags = (panel.dataset.tags || '').split(' ');
      const match = filter === 'all' || tags.indexOf(filter) !== -1;
      panel.setAttribute('data-filtered', match ? 'true' : 'false');
    });
  });
});

/* ─────────────────────────────────────────
   Project expand/collapse
───────────────────────────────────────── */
document.querySelectorAll('.project-expand-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    const detailId = btn.getAttribute('aria-controls');
    const detail = document.getElementById(detailId);
    btn.setAttribute('aria-expanded', String(!isOpen));
    detail.setAttribute('aria-hidden', String(isOpen));
    btn.querySelector('.expand-text').textContent = isOpen ? 'View Details' : 'Hide Details';
  });
});

/* ─────────────────────────────────────────
   Lightbox
───────────────────────────────────────── */
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lbImg = lightbox.querySelector('img');
  const lbCaption = lightbox.querySelector('.lightbox-caption');
  const lbClose = lightbox.querySelector('.lightbox-close');
  let lbLastFocused = null;

  function openLightbox(src, alt, caption) {
    lbLastFocused = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt;
    lbCaption.textContent = caption || '';
    lightbox.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => lightbox.classList.add('open'));
    lbClose.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      lbImg.src = '';
      if (lbLastFocused) lbLastFocused.focus();
    }, 250);
  }

  document.querySelectorAll('.project-image-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      openLightbox(item.dataset.img, img.alt, item.dataset.caption);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    if (lightbox.classList.contains('open') && e.key === 'Tab') {
      e.preventDefault();
      lbClose.focus();
    }
  });
}
