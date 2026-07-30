# DeAddict Website

DeAddict is currently a static front-end prototype for a private, judgment-free habit-change and wellness product.

## Current status

Phase 1 established the honest, responsive static foundation. Phase 2 added trust pages and non-persistent onboarding. Phase 3 added a validated but **unapplied** private-account and database architecture. Phase 4 adds a disabled account UI and provider-neutral server contracts without connecting a backend.

No live backend project is connected, authentication is not enabled, and the public prototype still does not save onboarding, account-preview, or check-in answers.

### Public prototype implemented

- Responsive landing, plans, educational, dashboard, check-in, onboarding, privacy, terms, and accessibility pages
- Three-step onboarding with explicit selections held only in current-page JavaScript memory
- No preselected onboarding or required check-in answers
- Alcohol-specific withdrawal safety notice
- Mobile navigation, keyboard focus handling, Escape-key drawer support, filters, and accordions
- Structured 0–10 check-in scales
- Clear demo, fictional, planned, and unavailable states
- Global support-directory links
- Favicon, web manifest, crawler policy, and baseline response headers

### Phase 3 architecture implemented

- Passwordless email magic-link contract for the first future account slice
- Security threat model and incident-response runbook
- Consent, retention, export, deletion, authentication, and session decisions
- Unapplied PostgreSQL/Supabase migration with six user-owned tables
- Forced row-level security and explicit authenticated grants
- No anonymous private-table grants
- Immutable `user_id` ownership
- Composite `(goal_id, user_id)` enforcement for check-ins
- Append-only client consent history
- Server-only export and deletion status progression
- Duplicate active export/deletion request prevention
- Structured check-ins only; free-text recovery journals remain excluded

### Phase 4 implementation shell

- `account.html` noindex account, consent, privacy, export, session, and deletion preview
- Generic magic-link confirmation that does not reveal whether an account exists
- Typed email cleared immediately after the local preview transition
- No preselected privacy, terms, or sensitive-data decisions
- Disabled provider-neutral auth adapter returning `AUTH_NOT_CONFIGURED`
- Provider-neutral server-operation contracts for export, deletion, session revocation, and auth callback completion
- Strict JSON request/response schemas that reject extra client-owned properties
- Static and browser checks proving the account preview remains network-free and non-persistent

### Deliberately not implemented

- Live Supabase connection or migration deployment
- Production authentication, callback handling, sessions, or email delivery
- Saved onboarding answers, account-preview inputs, journals, goals, check-ins, or reports
- Analytics, advertising, session replay, email capture, or marketing automation
- Billing, subscriptions, trials, or refunds
- Production export generation, session revocation, or deletion orchestration
- AI processing of recovery content
- Clinician, family, employer, administrator, or community access
- Claims of HIPAA, GDPR, DPDP, medical-device, clinical, legal, or accessibility certification

## Data boundary

`DATA_HANDLING.md` is the primary engineering guardrail. Recovery persistence remains disabled until deployment review approves the exact project, domain, consent documents, authentication settings, retention, backups, incident response, export, deletion, and regional requirements.

Architecture and implementation-shell documents include:

- `PHASE_3_PLAN.md`
- `PHASE_4_PLAN.md`
- `SECURITY_THREAT_MODEL.md`
- `docs/AUTH_AND_SESSION_CONTRACT.md`
- `docs/ACCOUNT_UI_STATE_MACHINE.md`
- `docs/SERVER_FUNCTION_CONTRACTS.md`
- `docs/PHASE3_POLICY_DECISIONS.md`
- `docs/DATA_EXPORT_DELETION_RUNBOOK.md`
- `docs/INCIDENT_RESPONSE_RUNBOOK.md`
- `docs/PHASE3_RLS_TEST_PLAN.md`

## Local preview

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Static validation

```bash
node --check script.js
node --check onboarding.js
node --check account.js
node --check auth-adapter.js
python -m py_compile scripts/*.py
python scripts/check_static_site.py
python scripts/check_phase3_sql.py
python scripts/check_phase4_contracts.py
```

## PostgreSQL integration validation

`.github/workflows/phase3-postgres-integration.yml` starts a temporary PostgreSQL 16 service inside GitHub Actions. It:

1. creates minimal disposable Supabase-compatible auth fixtures;
2. applies the Phase 3 migration;
3. tests User A, User B, and anonymous access;
4. verifies cross-user reads, updates, and deletes are blocked;
5. verifies consent is append-only for clients;
6. verifies clients cannot advance export/deletion status;
7. verifies composite goal ownership;
8. verifies deleting an auth user cascades only that user's records.

The temporary database is destroyed when the workflow job ends. It uses no live Supabase project or production secret.

## Browser validation

`.github/workflows/browser-smoke.yml` renders the public prototype, onboarding flow, and account preview in headless Chrome. The account checks prove:

- initial email and consent fields are empty;
- the auth adapter is disabled;
- the local-only interaction path reaches the fictional signed-in settings screen;
- the typed test email is cleared;
- the export action creates only an explicit preview message and no request.

## Main pages

- `index.html` — public landing page
- `onboarding.html` — non-persistent onboarding demo, `noindex`
- `account.html` — disabled account and privacy-controls preview, `noindex`
- `support-alcohol.html` — educational alcohol guide
- `pricing.html` — current access and planned product status
- `privacy.html` — prototype privacy notice
- `terms.html` — prototype terms
- `accessibility.html` — accessibility approach and known limits
- `dashboard.html` — fictional dashboard, `noindex`
- `checkin.html` — unsaved check-in demo, `noindex`

## Production domain and sitemap

Canonical URLs remain intentionally omitted until the final HTTPS domain is known.

```bash
python scripts/generate_sitemap.py https://example.com
```

Then add the real sitemap URL to `robots.txt`.

## Deployment boundary

Merging Phase 3 or Phase 4 code does not authorize applying the migration or enabling account operations. Before production accounts or persistence are enabled:

1. Create and explicitly identify a dedicated DeAddict backend project that is not MDMS, CapDent, Astro, or another existing project.
2. Select the final HTTPS domain and exact redirect allow-list.
3. Approve privacy, terms, and sensitive-data consent versions.
4. Configure passwordless email delivery and abuse controls.
5. Verify provider token, refresh, session-revocation, backup, and deletion behavior.
6. Name an incident owner and private reporting channel.
7. Implement server-only export, deletion, and all-session-revocation functions with secret management.
8. Test authentication, reauthentication, callbacks, export, deletion, secrets, and cross-user access in the isolated project.
9. Complete regional legal, clinical, security, privacy, and accessibility review.

## Safety and content sources

DeAddict is presented as a wellness prototype, not medical treatment, diagnosis, detox supervision, rehabilitation, crisis support, or emergency care. See `CONTENT_SOURCES.md` for the official references used during the alcohol-content review.