# DeAddict Phase 3 Threat Model

Last reviewed: July 29, 2026

This document covers the proposed account and saved-data foundation. It is a design review, not a security certification.

## Protected assets

- Authentication identity and session tokens.
- Habit category, goal, check-ins, urges, triggers, coping actions, and outcome data.
- Consent history, export requests, and deletion requests.
- Operational secrets and service-role credentials.
- User trust, discretion, and physical safety.

## Primary adversaries and failures

1. Another authenticated user attempting horizontal access.
2. A stolen device or leaked browser session.
3. A malicious script introduced through dependency or content injection.
4. A developer, support operator, or service process with excessive privileges.
5. Accidental logging of sensitive request bodies or tokens.
6. Enumeration of account existence through login and recovery responses.
7. Export links or deletion actions used without recent authentication.
8. Backups retaining data longer than product disclosures promise.
9. Third-party analytics, error reporting, email, or AI services receiving recovery content.
10. Misconfiguration of row-level security, storage policies, CORS, redirects, or OAuth providers.

## Required controls

### Identity and sessions

- Prefer passwordless email or a reviewed identity provider.
- Restrict redirect URLs to exact production and approved preview origins.
- Rotate refresh tokens and revoke sessions after sensitive account changes.
- Store browser sessions using provider-supported secure mechanisms; never expose service-role keys to clients.
- Require recent authentication for export, deletion, email change, and recovery changes.
- Use generic responses for sign-in and account recovery requests.

### Authorization

- Enable and force PostgreSQL row-level security on every user-owned table.
- Policies must compare `auth.uid()` with an immutable `user_id` column.
- Prevent ownership transfer through client updates.
- Revoke default table privileges from `anon` and restrict `authenticated` access to explicit policies.
- Test cross-user denial for select, insert, update, and delete.

### Data minimization

- Do not store free-text journals in the first production slice.
- Do not store precise location, contacts, device advertising IDs, or social graphs.
- Do not include sensitive fields in URLs, analytics, notification text, support tickets, or email subject lines.
- Store only fields needed for the stated feature.

### Application and infrastructure

- Maintain a restrictive Content Security Policy.
- Never log authorization headers, magic-link tokens, refresh tokens, or recovery content.
- Redact request bodies from error monitoring by default.
- Separate public static hosting from privileged server-side operations.
- Keep service-role operations behind server-only functions with named purposes.
- Rate-limit authentication, export, and deletion endpoints.

### User control and incident response

- Provide export and deletion with clear status and timestamps.
- Document backup retention and restoration behavior before launch.
- Maintain an incident playbook covering token revocation, credential rotation, user notice, evidence preservation, and regulatory assessment.
- Treat unexpected cross-user access, public exposure, or secret leakage as a release-blocking incident.

## Abuse cases that must fail

- User A requests User B's goal or check-in identifier.
- User A changes the `user_id` on an owned row.
- An unauthenticated client reads any private row.
- A public client calls an export or deletion function for another user.
- An expired or revoked session continues to access data.
- A browser receives a service-role credential.
- Recovery answers appear in logs, analytics payloads, URLs, email content, or push notification previews.

## Release gate

Production storage remains disabled until these controls are implemented, tested in a disposable environment, independently reviewed, and tied to approved privacy, retention, and incident-response procedures.
