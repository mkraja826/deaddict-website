# Phase 5 — Deployment Readiness Guardrails

Status: disabled deployment preparation only. No live backend, production domain, provider project, secret, migration deployment, authentication, email delivery, export, or deletion operation is enabled by this branch.

## Goal

Prepare a fail-closed deployment boundary so a future dedicated DeAddict environment cannot be enabled accidentally or by partially supplied configuration.

## Deliverables

1. Runtime configuration contract
   - Public and private settings are explicitly separated.
   - No default backend URL, project identifier, redirect origin, anonymous key, service credential, SMTP secret, or signing key.
   - Production mode requires an exact HTTPS origin and an exact redirect allow-list.

2. Secret boundary
   - Browser code may receive only reviewed public configuration.
   - Service credentials remain server-only.
   - Secret values must be supplied by the deployment platform and never committed.
   - Logs must redact tokens, authorization headers, email addresses, magic-link parameters, export locations, and recovery content.

3. Disabled server handler scaffolding
   - Export, deletion, session revocation, and authentication callback handlers expose stable interfaces.
   - Every handler fails with `DEPLOYMENT_NOT_CONFIGURED` until a reviewed runtime adapter is injected.
   - Handlers do not contain provider URLs, keys, storage paths, or live network calls.

4. Deployment gate
   - A validation script rejects missing production requirements, wildcard redirects, HTTP origins, localhost in production, embedded secrets, and enabled handlers without an approved adapter.
   - CI validates the disabled repository configuration.

5. Operational checklist
   - Dedicated DeAddict backend project.
   - Final HTTPS domain.
   - Exact redirect origins.
   - Approved consent documents.
   - Email delivery and abuse controls.
   - Secret rotation and incident ownership.
   - Backup, deletion, export, and session-revocation evidence.

## Explicit exclusions

Phase 5 does not:

- Create or select a Supabase project.
- Apply the Phase 3 migration.
- Add real provider configuration.
- Enable account creation, email links, sessions, persistence, export, deletion, or administrative access.
- Add analytics, advertising, billing, AI processing, or free-text recovery storage.
- Claim production, legal, clinical, security, privacy, or accessibility approval.

## Merge gate

Phase 5 may be merged only as disabled deployment scaffolding after static, browser, PostgreSQL, and deployment-guard checks pass. A separate explicit deployment approval is required before any live configuration or secrets are introduced.