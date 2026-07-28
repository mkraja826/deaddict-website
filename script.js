// ---- Sticky header compact-on-scroll ----
const header = document.getElementById('siteHeader');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }, { passive: true });
}

// ---- Mobile nav ----
const menuToggle = document.getElementById('menuToggle');
const menuClose = document.getElementById('menuClose');
const mobileNav = document.getElementById('mobileNav');
function openMobileNav(){
  mobileNav.classList.add('is-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  const firstLink = mobileNav.querySelector('a');
  if (firstLink) firstLink.focus();
}
function closeMobileNav(){
  mobileNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.focus();
}
if (menuToggle) menuToggle.addEventListener('click', openMobileNav);
if (menuClose) menuClose.addEventListener('click', closeMobileNav);
if (mobileNav) {
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) closeMobileNav();
  });
}

// ---- Accordion (FAQ) ----
document.querySelectorAll('.accordion-trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const panel = btn.nextElementSibling;
    btn.setAttribute('aria-expanded', String(!expanded));
    panel.style.maxHeight = expanded ? '0px' : panel.scrollHeight + 'px';
  });
});

// ---- Filter chips (visual toggle only, single-select demo) ----
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chip.parentElement.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
    chip.setAttribute('aria-pressed', 'true');
  });
});

// ---- Generic single-select scale buttons (mood / urge) ----
document.querySelectorAll('[data-scale]').forEach(group => {
  group.querySelectorAll('.scale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.scale-btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
    });
  });
});

// ---- Theme toggle (persists only in-memory for this session) ----
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
  });
}

// ---- Simple toast helper ----
function showToast(message){
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}
document.querySelectorAll('[data-toast]').forEach(btn => {
  btn.addEventListener('click', () => showToast(btn.getAttribute('data-toast')));
});
