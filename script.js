// ---- Phase 1 shared behavior ----
const CRISIS_SUPPORT_URL = 'https://findahelpline.com/';

function ensureHeadLink(rel, href, attributes = {}) {
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
  Object.entries(attributes).forEach(([name, value]) => link.setAttribute(name, value));
}

ensureHeadLink('icon', 'favicon.svg', { type: 'image/svg+xml' });
ensureHeadLink('manifest', 'site.webmanifest');

// Keep placeholder canonical URLs out of rendered pages until a final domain is configured.
const canonical = document.querySelector('link[rel="canonical"]');
if (canonical) {
  const cleanUrl = window.location.href.split('#')[0].replace(/index\.html$/, '');
  canonical.setAttribute('href', cleanUrl);

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute('content', cleanUrl);
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
  mobileNav.setAttribute('aria-hidden', mobileNav.classList.contains('is-open') ? 'false' : 'true');
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

// ---- Add a real Resources destination to the home page ----
if (!document.getElementById('resources') && document.getElementById('features')) {
  const resources = document.createElement('section');
  resources.id = 'resources';
  resources.className = 'bg-alt';
  resources.innerHTML = `
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Resources</span>
        <h2>Start with practical, low-pressure guidance.</h2>
        <p>These demo resources show the educational direction of DeAddict. They do not replace professional care.</p>
      </div>
      <div class="grid grid-3">
        <a href="support-alcohol.html" class="card" style="text-decoration:none"><span class="eyebrow">Support guide</span><h3 style="font-size:1.05rem">Understanding alcohol patterns</h3><p class="mb-0">Common triggers, warning signs and when to seek medical help.</p></a>
        <a href="checkin.html" class="card" style="text-decoration:none"><span class="eyebrow">Interactive demo</span><h3 style="font-size:1.05rem">Try a daily check-in</h3><p class="mb-0">Walk through the mood, urge and trigger flow without creating an account.</p></a>
        <a href="pricing.html" class="card" style="text-decoration:none"><span class="eyebrow">Product status</span><h3 style="font-size:1.05rem">See planned access</h3><p class="mb-0">Review what is available in the demo and what remains planned.</p></a>
      </div>
    </div>`;
  document.getElementById('pricing-preview')?.before(resources);
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

// ---- Safer demo check-in behavior ----
const checkinWrap = document.querySelector('.checkin-wrap');
if (checkinWrap) {
  checkinWrap.querySelectorAll('[data-scale] .scale-btn').forEach(button => button.setAttribute('aria-pressed', 'false'));

  const urgeButtons = [...checkinWrap.querySelectorAll('[data-step="2"] .scale-btn')];
  const urgeValues = ['0', '2', '4', '6', '8', '10'];
  urgeButtons.forEach((button, index) => {
    if (urgeValues[index]) button.textContent = urgeValues[index];
  });

  function showStepError(step, message) {
    let error = step.querySelector('.checkin-error');
    if (!error) {
      error = document.createElement('p');
      error.className = 'checkin-error field-error';
      error.setAttribute('role', 'alert');
      step.querySelector('.checkin-nav')?.before(error);
    }
    error.textContent = message;
    error.focus?.();
  }

  checkinWrap.querySelectorAll('.next-step').forEach(button => {
    button.addEventListener('click', event => {
      const step = button.closest('.checkin-step');
      const key = step?.dataset.step;
      if (!step || !['1', '2', '3'].includes(key)) return;
      const selected = step.querySelector('.scale-btn[aria-pressed="true"]');
      if (selected) {
        step.querySelector('.checkin-error')?.remove();
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      const message = key === '3'
        ? 'Choose whether the behavior happened today before continuing.'
        : 'Choose one option before continuing.';
      showStepError(step, message);
    }, true);
  });

  const successCopy = checkinWrap.querySelector('[data-step="5-ok"] p');
  if (successCopy) successCopy.textContent = 'Demo check-in complete. This prototype does not save or upload your answers yet.';

  const setbackCopy = checkinWrap.querySelector('[data-step="5-setback"] > p');
  if (setbackCopy) setbackCopy.textContent = 'Thank you for being honest. This demo does not save your answers, and a difficult day does not erase progress.';
}

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

// ---- Honest demo/product status messaging ----
const appMain = document.querySelector('.app-main');
if (appMain) {
  const noticeText = appMain.querySelector('.notice p');
  if (noticeText) noticeText.textContent = 'Interactive front-end demo: the information shown here is sample data and check-ins are not saved yet.';
  const statusTag = appMain.querySelector('.app-topbar .tag');
  if (statusTag) statusTag.textContent = 'Demo data · No account connected';
}

const privacySection = document.getElementById('privacy');
if (privacySection) {
  const intro = privacySection.querySelector('h2 + p');
  if (intro) intro.textContent = 'The current public demo does not create accounts or save check-in data. Authentication, encrypted storage, export and deletion controls must be completed before production use.';
  privacySection.querySelectorAll('.feature-item h3').forEach(heading => {
    if (!heading.textContent.startsWith('Planned:')) heading.textContent = `Planned: ${heading.textContent}`;
  });
  const promiseCard = privacySection.querySelector('.card');
  if (promiseCard) {
    const paragraphs = promiseCard.querySelectorAll('p');
    if (paragraphs[0]) paragraphs[0].textContent = 'Production privacy controls are not live yet.';
    if (paragraphs[1]) paragraphs[1].textContent = 'This phase is a front-end demo. Sensitive data storage will remain disabled until security and consent controls are implemented and reviewed.';
  }
}

document.querySelectorAll('.accordion-trigger').forEach(button => {
  const question = button.textContent.toLowerCase();
  const panelParagraph = button.nextElementSibling?.querySelector('p');
  if (question.includes('use deaddict anonymously') && panelParagraph) {
    panelParagraph.textContent = 'Anonymous mode is planned, but accounts and data storage are not enabled in this front-end demo.';
  }
  if (question.includes('track more than one habit') && panelParagraph) {
    panelParagraph.textContent = 'The current demo shows one sample goal. Multiple-goal support is planned for a later product phase.';
  }
});

const premiumPrice = [...document.querySelectorAll('.price-amount')].find(element => element.textContent.includes('[monthly price]'));
if (premiumPrice) {
  premiumPrice.textContent = 'Coming soon';
  const period = premiumPrice.parentElement?.querySelector('.price-period');
  if (period) period.textContent = '';

  const pricingCard = premiumPrice.closest('.pricing-card');
  const badge = pricingCard?.querySelector('.tag');
  if (badge) badge.textContent = 'Planned';
  const annualCopy = pricingCard?.querySelector('.plan-fineprint.mt-0');
  if (annualCopy) annualCopy.textContent = 'Premium pricing will be announced after the core tracking and privacy foundation is complete.';
  const trialLink = [...(pricingCard?.querySelectorAll('a') || [])].find(link => link.textContent.toLowerCase().includes('premium trial'));
  if (trialLink) {
    trialLink.removeAttribute('href');
    trialLink.setAttribute('aria-disabled', 'true');
    trialLink.classList.add('is-disabled-link');
    trialLink.textContent = 'Premium coming soon';
  }
  const trialFinePrint = [...(pricingCard?.querySelectorAll('.plan-fineprint') || [])].find(element => element !== annualCopy);
  if (trialFinePrint) trialFinePrint.textContent = 'No payment or trial system is active in this demo.';
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
disabledStyle.textContent = '.is-disabled-link{color:var(--color-muted)!important;cursor:not-allowed;text-decoration:none;opacity:.72}.category-card[hidden]{display:none!important}.checkin-error{margin-top:var(--space-3)}';
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
