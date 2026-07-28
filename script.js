// ---- Phase 1 shared behavior ----
const CRISIS_SUPPORT_URL = 'https://findahelpline.com/';

// Keep placeholder canonical URLs out of rendered pages until a final domain is configured.
const canonical = document.querySelector('link[rel="canonical"]');
if (canonical) {
  const cleanUrl = window.location.href.split('#')[0].replace(/index\.html$/, '');
  canonical.setAttribute('href', cleanUrl);
}

// ---- Sticky header compact-on-scroll ----
const header = document.getElementById('siteHeader');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }, { passive: true });
}

// ---- Mobile navigation ----
let menuToggle = document.getElementById('menuToggle');
let menuClose = document.getElementById('menuClose');
let mobileNav = document.getElementById('mobileNav');
let lastFocusedElement = null;

function installDashboardMobileNav() {
  if (!document.querySelector('.app-shell') || mobileNav) return;

  const style = document.createElement('style');
  style.textContent = `
    .app-mobile-header{display:none;position:sticky;top:0;z-index:60;background:var(--color-surface);border-bottom:1px solid var(--color-border);padding:var(--space-2) var(--space-3);align-items:center;justify-content:space-between}
    .app-mobile-header .logo{font-size:1.1rem}
    @media (max-width:900px){.app-mobile-header{display:flex}.app-main{padding:var(--space-4) var(--space-3) calc(var(--space-7) + 2rem)}}
  `;
  document.head.appendChild(style);

  const mobileHeader = document.createElement('header');
  mobileHeader.className = 'app-mobile-header';
  mobileHeader.innerHTML = `
    <a href="index.html" class="logo">DeAddict</a>
    <button class="icon-btn" id="menuToggle" type="button" aria-label="Open dashboard menu" aria-expanded="false" aria-controls="mobileNav">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>`;

  const drawer = document.createElement('nav');
  drawer.className = 'mobile-nav';
  drawer.id = 'mobileNav';
  drawer.setAttribute('aria-label', 'Dashboard navigation');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = `
    <div class="mobile-nav-head">
      <span class="logo">DeAddict</span>
      <button class="icon-btn" id="menuClose" type="button" aria-label="Close dashboard menu">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
    </div>
    <ul>
      <li><a href="dashboard.html" aria-current="page">Dashboard</a></li>
      <li><a href="checkin.html">Daily check-in</a></li>
      <li><span class="nav-coming-soon">Progress <small>Coming soon</small></span></li>
      <li><span class="nav-coming-soon">Trigger log <small>Coming soon</small></span></li>
      <li><span class="nav-coming-soon">Journal <small>Coming soon</small></span></li>
      <li><span class="nav-coming-soon">Goals <small>Coming soon</small></span></li>
      <li><span class="nav-coming-soon">Settings & privacy <small>Coming soon</small></span></li>
    </ul>`;

  const extraStyle = document.createElement('style');
  extraStyle.textContent = `
    .nav-coming-soon{display:flex;justify-content:space-between;align-items:center;padding:var(--space-3) 0;border-bottom:1px solid var(--color-border);color:var(--color-muted)}
    .nav-coming-soon small{font-size:.7rem;text-transform:uppercase;letter-spacing:.06em}
    body.nav-open{overflow:hidden}
  `;
  document.head.appendChild(extraStyle);

  document.body.prepend(mobileHeader);
  document.body.appendChild(drawer);

  menuToggle = document.getElementById('menuToggle');
  menuClose = document.getElementById('menuClose');
  mobileNav = document.getElementById('mobileNav');
}

installDashboardMobileNav();

function getFocusableElements(container) {
  if (!container) return [];
  return [...container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
}

function openMobileNav() {
  if (!mobileNav || !menuToggle) return;
  lastFocusedElement = document.activeElement;
  mobileNav.classList.add('is-open');
  mobileNav.setAttribute('aria-hidden', 'false');
  menuToggle.setAttribute('aria-expanded', 'true');
  document.body.classList.add('nav-open');
  const firstFocusable = getFocusableElements(mobileNav)[0];
  if (firstFocusable) firstFocusable.focus();
}

function closeMobileNav({ restoreFocus = true } = {}) {
  if (!mobileNav || !menuToggle) return;
  mobileNav.classList.remove('is-open');
  mobileNav.setAttribute('aria-hidden', 'true');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
  if (restoreFocus && lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

if (menuToggle && mobileNav) menuToggle.addEventListener('click', openMobileNav);
if (menuClose && mobileNav) menuClose.addEventListener('click', () => closeMobileNav());
if (mobileNav) {
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMobileNav({ restoreFocus: false })));
  document.addEventListener('keydown', event => {
    if (!mobileNav.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      closeMobileNav();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = getFocusableElements(mobileNav);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

// ---- Accordion (FAQ) ----
document.querySelectorAll('.accordion-trigger').forEach((button, index) => {
  const panel = button.nextElementSibling;
  if (!panel) return;
  const panelId = panel.id || `accordion-panel-${index + 1}`;
  panel.id = panelId;
  button.setAttribute('aria-controls', panelId);

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    panel.style.maxHeight = expanded ? '0px' : `${panel.scrollHeight}px`;
  });
});

// ---- Working support-category search and filters ----
const categorySection = document.getElementById('categories');
if (categorySection) {
  const cards = [...categorySection.querySelectorAll('.category-card')];
  const searchInput = categorySection.querySelector('.search-input');
  const chips = [...categorySection.querySelectorAll('.chip')];
  const categoryGrid = categorySection.querySelector('.grid');
  let activeCategory = 'all';

  const categoryForTitle = title => {
    const value = title.toLowerCase();
    if (value.includes('alcohol') || value.includes('vaping') || value.includes('nicotine')) return 'substance use';
    if (value.includes('social media') || value.includes('scrolling') || value.includes('gaming')) return 'digital habits';
    return 'compulsive habits';
  };

  cards.forEach(card => {
    const title = card.querySelector('h3')?.textContent.trim() || '';
    card.dataset.category = categoryForTitle(title);
    card.dataset.search = card.textContent.toLowerCase();
  });

  const noResults = document.createElement('p');
  noResults.className = 'notice';
  noResults.hidden = true;
  noResults.textContent = 'No support categories match this search yet.';
  categoryGrid?.after(noResults);

  function applyCategoryFilters() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(card => {
      const categoryMatch = activeCategory === 'all' || card.dataset.category === activeCategory;
      const searchMatch = !query || card.dataset.search.includes(query);
      const visible = categoryMatch && searchMatch;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    noResults.hidden = visibleCount !== 0;
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(item => item.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      activeCategory = chip.textContent.trim().toLowerCase();
      applyCategoryFilters();
    });
  });

  searchInput?.addEventListener('input', applyCategoryFilters);
}

// ---- Generic single-select scale buttons ----
document.querySelectorAll('[data-scale]').forEach(group => {
  group.querySelectorAll('.scale-btn').forEach(button => {
    button.addEventListener('click', () => {
      group.querySelectorAll('.scale-btn').forEach(item => item.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
    });
  });
});

// ---- Theme toggle with local persistence ----
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('deaddict-theme');
if (savedTheme === 'dark' || savedTheme === 'light') {
  document.documentElement.setAttribute('data-theme', savedTheme);
}
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const root = document.documentElement;
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', nextTheme);
    localStorage.setItem('deaddict-theme', nextTheme);
  });
}

// ---- Replace demo-only dead links with honest destinations/states ----
document.querySelectorAll('a[href="#"]').forEach(link => {
  const label = link.textContent.trim().toLowerCase();

  if (label.includes('find professional support') || label.includes('get help')) {
    link.href = CRISIS_SUPPORT_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return;
  }

  if (label === 'sign in') {
    link.href = 'dashboard.html';
    link.textContent = 'View Demo';
    return;
  }

  if (label.includes('start your journey') || label.includes('create my private plan') || label.includes('create free account')) {
    link.href = 'checkin.html';
    link.textContent = 'Try Demo Check-In';
    return;
  }

  if (label.includes('see full pricing')) {
    link.href = 'pricing.html';
    return;
  }

  if (link.classList.contains('cat-link')) {
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
    link.classList.add('is-disabled-link');
    link.textContent = 'Coming soon';
    return;
  }

  link.removeAttribute('href');
  link.setAttribute('aria-disabled', 'true');
  link.classList.add('is-disabled-link');
  if (!label.includes('coming soon')) link.title = 'This feature is planned for a later phase.';
});

const disabledStyle = document.createElement('style');
disabledStyle.textContent = '.is-disabled-link{color:var(--color-muted)!important;cursor:not-allowed;text-decoration:none;opacity:.72}.category-card[hidden]{display:none!important}';
document.head.appendChild(disabledStyle);

// ---- Simple toast helper ----
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const element = document.createElement('div');
  element.className = 'toast';
  element.setAttribute('role', 'status');
  element.textContent = message;
  document.body.appendChild(element);
  setTimeout(() => element.remove(), 2600);
}

document.querySelectorAll('[data-toast]').forEach(button => {
  button.addEventListener('click', () => showToast(button.getAttribute('data-toast')));
});
