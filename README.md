# DeAddict Website

DeAddict is currently a static front-end prototype for a private, judgment-free habit-change and wellness product.

## Phase 1 status

Phase 1 makes the public prototype honest, navigable, responsive, accessible, and ready for static deployment without presenting unfinished systems as live.

Implemented:

- Responsive public landing, plans, educational, dashboard, and check-in pages
- Mobile navigation for the sample dashboard
- Keyboard focus trapping and Escape-key support for mobile drawers
- Working support-category search and filters
- Accordion relationships using `aria-controls`
- Explicit validation for required check-in answers
- A true 0–10 urge range in the demo
- Clear sample/planned labels for dashboard, privacy, storage, and Premium features
- No placeholder canonical domain or pricing tokens in public source
- Global support-directory links for urgent human help
- Favicon, web manifest, robots policy, and baseline static response headers
- Automated JavaScript, Python, local-link, fragment, metadata, and placeholder checks
- A production sitemap generator for use after the final domain is known

Not implemented:

- Authentication
- Database or cloud storage
- Saved check-ins, journals, goals, or reports
- Billing, subscriptions, trials, or refunds
- Production privacy controls and consent flows
- Personalized medical advice or treatment
- Full clinical, legal, security, and localization review

No check-in answers are saved or uploaded by this repository.

## Local preview

Run an HTTP server from the repository root:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Validation

```bash
node --check script.js
python -m py_compile scripts/check_static_site.py scripts/generate_sitemap.py
python scripts/check_static_site.py
```

The same checks are defined in `.github/workflows/static-site-checks.yml`.

## Main pages

- `index.html` — public prototype landing page
- `support-alcohol.html` — educational alcohol-pattern and safety guide
- `pricing.html` — current access and planned product status
- `dashboard.html` — fictional sample dashboard, marked `noindex`
- `checkin.html` — unsaved interactive demo, marked `noindex`

## Production domain and sitemap

Canonical URLs are intentionally omitted until the final production HTTPS domain is known. After connecting the domain, add absolute canonical URLs to the three public pages and generate the sitemap:

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

1. Add real privacy, terms, accessibility, and contact pages.
2. Implement authentication, authorization, encryption, consent, export, and deletion.
3. Complete security, legal, and clinical review.
4. Localize emergency and professional-support pathways.
5. Test keyboard, screen-reader, mobile, and reduced-motion behavior on deployed pages.

## Safety and content sources

DeAddict is presented as a wellness prototype, not medical treatment or an emergency service. See `CONTENT_SOURCES.md` for the official references used during the Phase 1 alcohol-content review.
