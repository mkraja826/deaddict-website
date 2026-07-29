# DeAddict Website

DeAddict is currently a static front-end prototype for a private, judgment-free habit-change and wellness product.

## Current status

Phase 1 established the honest, responsive static foundation. Phase 2 added trust pages and a non-persistent onboarding demo. Phase 3 now drafts the private account and structured-data architecture, but it does not connect to or modify a live backend.

### Implemented in the repository

- Responsive public landing, plans, educational, dashboard, check-in, onboarding, privacy, terms, and accessibility pages
- Three-step guided onboarding demo with explicit category and approach selection
- Onboarding selections held only in current-page JavaScript memory
- No preselected onboarding or required check-in answers
- Alcohol-specific withdrawal safety notice in onboarding review
- Current prototype Privacy notice, Terms of use, and Accessibility statement
- Sensitive-data handling contract and Phase 3 threat model
- Authentication and session contract
- Export and deletion runbook
- Unapplied PostgreSQL/Supabase migration draft with user ownership, forced row-level security, restricted grants, and structured fields only
- Automated validation for JavaScript, Python, static links, browser rendering, onboarding non-persistence, and Phase 3 SQL safety requirements
- A production sitemap generator for use after the final domain is known

### Deliberately not implemented

- Live authentication or social login
- Any connected database or cloud-storage project
- Saved check-ins, journals, goals, onboarding selections, or reports
- Analytics, advertising pixels, session replay, email capture, or marketing automation
- Billing, subscriptions, trials, or refunds
- Production export, deletion, backup-retention, or incident-response services
- AI processing of recovery information
- Personalized medical advice, diagnosis, treatment, or detox supervision
- Clinical, legal, security, accessibility, and localization certification

No onboarding or check-in answers are intentionally saved or uploaded by the website. The Phase 3 SQL migration is a review artifact and must not be applied to a live project until a separate deployment approval identifies the exact target project and completes security testing.

## Security and data boundary

- `DATA_HANDLING.md` — collection and persistence guardrail
- `SECURITY_THREAT_MODEL.md` — protected assets, abuse cases, and release controls
- `docs/AUTH_AND_SESSION_CONTRACT.md` — authentication and token boundary
- `docs/DATA_EXPORT_DELETION_RUNBOOK.md` — future server-side export and deletion behavior
- `PHASE_3_PLAN.md` — Phase 3 scope, exclusions, and merge gate

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
python -m py_compile scripts/*.py
python scripts/check_static_site.py
python scripts/check_phase3_sql.py
```

The same checks are defined in `.github/workflows/static-site-checks.yml`. `.github/workflows/browser-smoke.yml` also:

- rejects onboarding use of local/session storage, cookies, IndexedDB, network requests, beacons, and WebSockets;
- renders key pages in headless Chrome at desktop and mobile sizes;
- verifies onboarding begins empty;
- exercises Alcohol → Stop completely → Review;
- verifies the withdrawal safety notice and keyboard focus behavior;
- verifies a fresh load returns to an empty state.

## Phase 3 migration draft

`supabase/migrations/20260729160700_phase3_private_foundation.sql` defines:

- `user_profiles`
- `consent_records`
- `goals`
- `checkins`
- `export_requests`
- `deletion_requests`

Every table references `auth.users` with deletion cascades, enables and forces row-level security, revokes default client privileges, and uses explicit owner policies based on `auth.uid()`. The first slice excludes free-text journal content.

The migration remains unapplied. Before applying it anywhere:

1. Confirm the exact disposable test project.
2. Review every table, field, policy, grant, trigger, and cascade.
3. Run cross-user select/insert/update/delete tests.
4. Verify service-role keys never reach browsers.
5. Approve consent wording, retention, backups, export, deletion, and incident response.
6. Complete legal and security review for intended launch regions.

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

Then add the real sitemap URL to `robots.txt`.

## Safety and content sources

DeAddict is presented as a wellness prototype, not medical treatment or an emergency service. See `CONTENT_SOURCES.md` for the official references used during the alcohol-content review.
