# DeAddict Website

DeAddict is currently a static front-end prototype for a private, judgment-free habit change and wellness product.

## Current status

Phase 1 focuses on making the public prototype honest, navigable, responsive and deployable without pretending that unfinished product systems are live.

Implemented in Phase 1:

- Responsive marketing pages
- Mobile dashboard navigation
- Working support-category search and filters
- Keyboard-accessible mobile navigation and accordion improvements
- Safer daily check-in demo validation
- Clear demo/planned labels for data storage, privacy and premium features
- Global crisis-support directory link
- Favicon, web manifest, robots policy and baseline static security headers
- Automated static-site checks

Not implemented yet:

- User authentication
- Database or cloud storage
- Saved check-ins, journals, goals or progress reports
- Billing or subscriptions
- Production privacy controls and consent flows
- Clinical review and localized professional-support directories

No check-in answers are saved or uploaded in the current repository.

## Local preview

Because this is a static site, use any local HTTP server from the repository root.

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Main pages

- `index.html` — public landing page
- `support-alcohol.html` — educational support-category example
- `pricing.html` — current access and planned premium features
- `dashboard.html` — sample dashboard using demo data
- `checkin.html` — interactive check-in prototype

## Deployment

The repository can be deployed as a static site on Cloudflare Pages, GitHub Pages, Netlify or similar hosting.

Before production launch:

1. Connect the final production domain.
2. Replace source canonical URLs with that domain.
3. Generate an absolute `sitemap.xml` and add its URL to `robots.txt`.
4. Add real privacy, terms, accessibility and contact pages.
5. Complete security and clinical review before enabling sensitive data collection.

## Safety

DeAddict is presented as a wellness and self-management prototype, not medical treatment or an emergency service. Crisis-support links open the Find A Helpline global directory in a new tab.
