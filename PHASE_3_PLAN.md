# Phase 3 — Private Account and Data Foundation

Status: architecture and migration draft only. No live backend project is connected or changed by this branch.

## Goal

Prepare a security-first foundation for optional personal accounts and saved recovery data without enabling production collection prematurely.

## Phase 3 deliverables

1. Authentication and session contract
   - Passwordless email or approved identity-provider login.
   - No password database maintained by DeAddict.
   - Short-lived access tokens and rotating refresh tokens.
   - Reauthentication for export, deletion, email change, and other sensitive actions.
   - Generic authentication errors that do not reveal whether an account exists.

2. Private data model
   - Every sensitive row is owned by one authenticated user.
   - PostgreSQL row-level security is enabled and forced.
   - Client roles receive no broad table privileges.
   - Free-text journals are excluded from the first production slice.
   - No advertising identifiers, contact discovery, public profiles, or social graph.

3. Consent and product boundary
   - Account creation is optional.
   - The unsaved demonstration remains available without an account.
   - Consent records are versioned and auditable.
   - Analytics remain disabled for recovery content and sensitive screens.

4. User control
   - Machine-readable export.
   - Immediate user-initiated deletion request.
   - Account deletion removes owned application rows before authentication identity deletion.
   - Backup-retention behavior must be documented before launch.

5. Verification
   - Static checks for required RLS and ownership clauses.
   - Migration tested against a disposable local PostgreSQL/Supabase environment.
   - Automated tests proving User A cannot read, update, or delete User B data.
   - Service-role access reviewed and limited to named server-side operations.

## Explicit exclusions

Phase 3 does not:

- Connect to or modify a live Supabase project.
- Enable authentication in the public website.
- Store current onboarding or check-in answers.
- Add payments, subscriptions, advertising, trackers, or marketing email capture.
- Add AI processing of recovery content.
- Add clinician, family, employer, administrator, or community access to user records.
- Claim HIPAA, GDPR, DPDP, medical-device, or clinical certification.

## Merge gate

This phase can be merged as an architecture foundation after documentation and static checks pass. The SQL migration must remain unapplied until a separate deployment review confirms the target project, legal basis, retention rules, incident response, and production security controls.
