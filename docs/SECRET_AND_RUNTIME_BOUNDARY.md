# Secret and Runtime Boundary

This document defines what a future DeAddict deployment may expose publicly and what must remain server-only. It does not authorize deployment.

## Public configuration

A reviewed client bundle may eventually receive only:

- The final public HTTPS origin.
- A reviewed provider URL.
- A provider-designated public client key, when the provider explicitly treats it as public.
- Exact non-sensitive feature flags.
- Approved consent document versions.

Public configuration must never grant cross-user access or administrative privilege. Row-level security remains mandatory even when a key is intended for browser use.

## Server-only configuration

The following must never enter HTML, browser JavaScript, source maps, public artifacts, analytics, logs, screenshots, issue comments, or support tickets:

- Service-role or database-owner credentials.
- JWT signing secrets and private keys.
- SMTP credentials and email-provider API keys.
- Backup credentials.
- Storage signing secrets.
- Incident-response administrative tokens.
- Raw authorization headers, refresh tokens, magic-link tokens, OTP values, or session cookies.

## Environment separation

- DeAddict must use a dedicated backend project.
- Existing MDMS, CapDent, Astro, Horos, or other projects must not be reused.
- Development, staging, and production must have separate credentials and redirect allow-lists.
- Production data must never be copied into development or CI.
- CI may use only disposable fixtures with fictional users and no delivery credentials.

## Logging rules

Allowed logs are limited to structured operational metadata such as a request correlation ID, stable error code, handler name, duration, and redacted status.

Logs must not contain:

- Email addresses.
- Recovery categories, goals, check-ins, consent decisions, or export contents.
- Tokens, cookies, authorization headers, or callback query values.
- Export download locations or signed URLs.
- Database rows or request bodies for sensitive operations.

## Rotation and revocation

Before deployment, every private credential must have:

1. A named owner.
2. A storage location in the deployment platform's secret manager.
3. A rotation procedure.
4. A revocation procedure.
5. An incident-response trigger.
6. Evidence that old credentials stop working after rotation.

## Fail-closed rule

Missing or incomplete runtime configuration must disable authentication, persistence, export, deletion, and session revocation. The application must never guess a project, origin, redirect, credential, or provider setting.