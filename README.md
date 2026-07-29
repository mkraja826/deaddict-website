# DeAddict Website

DeAddict is currently a static front-end prototype for a private, judgment-free habit-change and wellness product.

## Current status

Phase 1 established the honest, responsive, accessible static foundation. Phase 2 adds a trust and onboarding layer without enabling accounts or persistent recovery records.

### Implemented

- Responsive public landing, plans, educational, dashboard, check-in, onboarding, privacy, terms, and accessibility pages
- Three-step guided onboarding demo with explicit category and approach selection
- Onboarding selections held only in current-page JavaScript memory
- No preselected onboarding or required check-in answers
- Alcohol-specific withdrawal safety notice in onboarding review
- Mobile navigation for public pages and the sample dashboard
- Keyboard focus trapping and Escape-key support for mobile drawers
- Working support-category search and filters
- Accordion relationships using `aria-controls`
- A true 0–10 urge range in the check-in demo
- Clear sample/planned labels for dashboard, storage, billing, and Premium features
- Current prototype Privacy notice, Terms of use, and Accessibility statement
- A repository data-handling contract for sensitive recovery information
- Global support-directory links for urgent human help
- Favicon, web manifest, robots policy, and baseline static response headers
- Automated JavaScript, Python, local-link, fragment, metadata, placeholder, and browser-render checks
- A production sitemap generator for use after the final domain is known

### Deliberately not implemented

- Authentication or social login
- Database, cloud storage, cookies, IndexedDB, or browser persistence for recovery answers
- Saved check-ins, journals, goals, onboarding selections, or reports
- Analytics, advertising pixels, session replay, email capture, or marketing automation
- Billing, subscriptions, trials, or refunds
- Production consent, account recovery, export, deletion, or incident-response systems
- Personalized medical advice, diagnosis, treatment, or detox supervision
- Full clinical, legal, security, accessibility, and localization review

No onboarding or check-in answers are intentionally saved or uploaded by this repository.

## Data boundary

`DATA_HANDLING.md` is the current engineering guardrail. It prohibits recovery-related persistence until a future architecture includes explicit consent, minimum collection, encryption, user isolation, export, deletion, session revocation, incident response, retention rules, threat modelling, and cross-user authorization tests.

## Local preview

Run an HTTP server from the repository root:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Validation

```bash
node --check script.js
node --check onboarding.js
python -m py_compile scripts/check_static_site.py scripts/generate_sitemap.py
python scripts/check_static_site.py
```

The same checks are defined in `.github/workflows/static-site-checks.yml`. `.github/workflows/browser-smoke.yml` also:

- rejects onboarding use of local/session storage, cookies, IndexedDB, network requests, beacons, and WebSockets;
- renders key pages in headless Chrome at desktop and mobile sizes;
- verifies the initial onboarding state has no preselected answers and keeps later steps hidden.

## Main pages

- `index.html` — public prototype landing page
- `onboarding.html` — non-persistent guided onboarding demo, marked `noindex`
- `support-alcohol.html` — educational alcohol-pattern and safety guide
- `pricing.html` — current access and planned product status
- `privacy.html` — current prototype privacy notice
- `terms.html` — prototype terms of use
- `accessibility.html` — accessibility approach and known limitations
- `dashboard.html` — fictional sample dashboard, marked `noindex`
- `checkin.html` — unsaved interactive demo, marked `noindex`

## Production domain and sitemap

Canonical URLs are intentionally omitted until the final production HTTPS domain is known. After connecting the domain, add absolute canonical URLs to public pages and generate the sitemap:

```bash
python scripts/generate_sitemap.py https://example.com
```

Then add this line to `robots.txt` using the real domain:

```text
Sitemap: https://example.com/sitemap.xml
```

## Deployment

The repository can be deployed to Cloudflare Pages, GitHub Pages, Netlify, or another static host. The `_headers` file is intended for hosts that support this format.

Before collecting sensitive data:

1. Approve a field-by-field data inventory and purpose.
2. Implement authentication, authorization, encryption, consent, export, and deletion.
3. Prove one user cannot access another user's information.
4. Complete security, legal, clinical, and regional privacy review.
5. Localize emergency and professional-support pathways.
6. Test keyboard, screen-reader, zoom, mobile, and reduced-motion behavior on deployed pages.

## Safety and content sources

DeAddict is presented as a wellness prototype, not medical treatment or an emergency service. See `CONTENT_SOURCES.md` for the official references used during the alcohol-content review.
