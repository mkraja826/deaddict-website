// DeAddict Phase 1 shared behavior.
const CRISIS_SUPPORT_URL = 'https://findahelpline.com/';

// Sticky marketing header.
const siteHeader = document.getElementById('siteHeader');
if (siteHeader) {
  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 12);
  }, { passive: true });
}

// Theme preference for the sample dashboard.
const savedTheme = localStorage.getItem('deaddict-theme');
if (savedTheme === 'dark' || savedTheme === 'light') {
  document.documentElement.setAttribute('data-theme', savedTheme);
}
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const root = document.documentElement;
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', nextTheme);
    localStorage.setItem('deaddict-theme', nextTheme);
  });
}

// Add a mobile navigation entry point to the sample dashboard.
function installDashboardMobileNavigation() {
  if (!document.querySelector('.app-shell') || document.getElementById('mobileNav')) return;

  const style = document.createElement('style');
  style.textContent = `
    .app-mobile-header{display:none;position:sticky;top:0;z-index:60;background:var(--color-surface);border-bottom:1px solid var(--color-border);padding:var(--space-2) var(--space-3);align-items:center;justify-content:space-between}
    .app-mobile-header .logo{font-size:1.1rem}
    .nav-coming-soon{display:flex;justify-content:space-between;align-items:center;gap:var(--space-2);padding:.65rem .85rem;border-radius:var(--radius-sm);color:var(--color-muted);font-size:.92rem}
    .nav-coming-soon small{font-size:.68rem;text-transform:uppercase;letter-spacing:.06em}
    body.nav-open{overflow:hidden}
    @media(max-width:900px){.app-mobile-header{display:flex}.app-main{padding:var(--space-4) var(--space-3) calc(var(--space-7) + 2rem)}}
  `;
  document.head.appendChild(style);

  const header = document.createElement('header');
  header.className = 'app-mobile-header';
  header.innerHTML = `
    <a href="index.html" class="logo">DeAddict</a>
    <button class="icon-btn" id="menuToggle" type="button" aria-label="Open dashboard menu" aria-expanded="false" aria-controls="mobileNav">
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M2 5h16M2 10h16M2 15h16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>`;

  const drawer = document.createElement('nav');
  drawer.className = 'mobile-nav';
  drawer.id = 'mobileNav';
  drawer.setAttribute('aria-label', 'Demo dashboard navigation');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = `
    <div class="mobile-nav-head">
      <span class="logo">DeAddict</span>
      <button class="icon-btn" id="menuClose" type="button" aria-label="Close dashboard menu">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 2l14 14M16 2L2 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
    </div>
    <ul>
      <li><a href="dashboard.html" aria-current="page">Sample dashboard</a></li>
      <li><a href="checkin.html">Demo check-in</a></li>
      <li><span class="nav-coming-soon">Progress <small>Planned</small></span></li>
      <li><span class="nav-coming-soon">Trigger log <small>Planned</small></span></li>
      <li><span class="nav-coming-soon">Journal <small>Planned</small></span></li>
      <li><span class="nav-coming-soon">Goals <small>Planned</small></span></li>
      <li><span class="nav-coming-soon">Settings & privacy <small>Planned</small></span></li>
    </ul>`;

  document.body.prepend(header);
  document.body.appendChild(drawer);
}
installDashboardMobileNavigation();

// Accessible mobile drawer behavior shared by marketing and dashboard pages.
const menuToggle = document.getElementById('menuToggle');
const menuClose = document.getElementById('menuClose');
const mobileNav = document.getElementById('mobileNav');
let lastFocusedElement = null;

function focusableElements(container) {
  if (!container) return [];
  return [...container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')];
}

function openMobileNav() {
  if (!mobileNav || !menuToggle) return;
  lastFocusedElement = document.activeElement;
  mobileNav.classList.add('is-open');
  mobileNav.setAttribute('aria-hidden', 'false');
  menuToggle.setAttribute('aria-expanded', 'true');
  document.body.classList.add('nav-open');
  focusableElements(mobileNav)[0]?.focus();
}

function closeMobileNav({ restoreFocus = true } = {}) {
  if (!mobileNav || !menuToggle) return;
  mobileNav.classList.remove('is-open');
  mobileNav.setAttribute('aria-hidden', 'true');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
  if (restoreFocus && lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

menuToggle?.addEventListener('click', openMobileNav);
menuClose?.addEventListener('click', () => closeMobileNav());
if (mobileNav) {
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMobileNav({ restoreFocus: false }));
  });
  document.addEventListener('keydown', event => {
    if (!mobileNav.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      closeMobileNav();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = focusableElements(mobileNav);
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

// FAQ accordions.
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

// Working category search and filters.
const categorySection = document.getElementById('categories');
if (categorySection) {
  const cards = [...categorySection.querySelectorAll('.category-card')];
  const searchInput = categorySection.querySelector('.search-input');
  const chips = [...categorySection.querySelectorAll('.chip')];
  const categoryGrid = categorySection.querySelector('.grid');
  let activeCategory = 'all';

  cards.forEach(card => {
    card.dataset.search = card.textContent.toLowerCase();
  });

  const noResults = document.createElement('p');
  noResults.className = 'notice';
  noResults.hidden = true;
  noResults.textContent = 'No support categories match this search.';
  categoryGrid?.after(noResults);

  function applyFilters() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const categoryMatches = activeCategory === 'all' || card.dataset.category === activeCategory;
      const queryMatches = !query || card.dataset.search.includes(query);
      card.hidden = !(categoryMatches && queryMatches);
      if (!card.hidden) visible += 1;
    });
    noResults.hidden = visible !== 0;
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(item => item.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      activeCategory = chip.textContent.trim().toLowerCase();
      applyFilters();
    });
  });
  searchInput?.addEventListener('input', applyFilters);
}

// Single-select button groups.
document.querySelectorAll('[data-scale]').forEach(group => {
  group.querySelectorAll('.scale-btn').forEach(button => {
    button.addEventListener('click', () => {
      group.querySelectorAll('.scale-btn').forEach(item => item.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      group.closest('.checkin-step')?.querySelector('.checkin-error')?.remove();
    });
  });
});

// Require explicit answers for the first three check-in steps.
const checkinWrap = document.querySelector('.checkin-wrap');
if (checkinWrap) {
  checkinWrap.querySelectorAll('.next-step').forEach(button => {
    button.addEventListener('click', event => {
      const step = button.closest('.checkin-step');
      const key = step?.dataset.step;
      if (!step || !['1', '2', '3'].includes(key)) return;
      if (step.querySelector('.scale-btn[aria-pressed="true"]')) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      let error = step.querySelector('.checkin-error');
      if (!error) {
        error = document.createElement('p');
        error.className = 'checkin-error field-error';
        error.setAttribute('role', 'alert');
        error.setAttribute('tabindex', '-1');
        step.querySelector('.checkin-nav')?.before(error);
      }
      error.textContent = key === '3'
        ? 'Choose whether the behavior happened before continuing.'
        : 'Choose one option before continuing.';
      error.focus();
    }, true);
  });
}

// Mark purely visual disabled elements consistently.
const utilityStyle = document.createElement('style');
utilityStyle.textContent = `
  body.nav-open{overflow:hidden}
  .is-disabled-link{color:var(--color-muted)!important;cursor:not-allowed;text-decoration:none;opacity:.75}
  .category-card[hidden]{display:none!important}
  .checkin-error{margin-top:var(--space-3)}
`;
document.head.appendChild(utilityStyle);

// Small toast helper retained for future static interactions.
function showToast(message) {
  const existing = document.querySelector('.toast');
  existing?.remove();
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
