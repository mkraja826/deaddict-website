# Phase 3 — Private Account and Data Foundation

Status: architecture foundation validated in disposable PostgreSQL. No live backend project is connected or changed by this branch.

## Goal

Prepare a security-first foundation for optional personal accounts and saved recovery data without enabling production collection prematurely.

## Phase 3 deliverables

1. Authentication and session contract
   - Passwordless email OTP / magic-link only for the first account slice.
   - No password database maintained by DeAddict.
   - Access tokens limited to no more than 60 minutes.
   - Rotating refresh tokens using provider-supported secure behavior.
   - Authentication no older than 10 minutes for export, deletion, and email change.
   - Generic authentication errors that do not reveal whether an account exists.

2. Private data model
   - Every sensitive row is owned by one authenticated user.
   - PostgreSQL row-level security is enabled and forced.
   - Client roles receive no broad table privileges.
   - Check-ins use structured codes and scores; free-text journals are excluded.
   - No advertising identifiers, contact discovery, public profiles, or social graph.

3. Consent and product boundary
   - Account creation remains optional.
   - The unsaved demonstration remains available without an account.
   - Consent records are versioned, append-only, and auditable.
   - Production persistence fails closed until approved privacy, terms, and sensitive-data versions are configured.
   - Analytics remain disabled for recovery content and sensitive screens.

4. User control
   - Machine-readable export architecture.
   - Immediate user-initiated deletion request architecture.
   - Account deletion removes owned application rows through the authentication identity cascade.
   - Export packages target a maximum 24-hour lifetime.
   - Production remains blocked until backup-retention behavior is verified; the engineering target is no more than 30 days for backup copies of deleted data.

5. Verification
   - Static checks for required RLS and ownership clauses.
   - Migration parsed and applied successfully in disposable PostgreSQL 16.
   - Automated User A/User B/anonymous tests passed.
   - Composite goal/check-in ownership passed.
   - Append-only consent and client job-status restrictions passed.
   - Auth-user cascade deletion passed without affecting another user.
   - Existing browser and onboarding non-persistence tests remain green.

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

This phase may be merged as an **unapplied architecture foundation** after all repository workflows pass and the pull request records the disposable PostgreSQL evidence.

Merging does not authorize deployment. The migration and authentication configuration must remain unapplied until a separate deployment review confirms:

- the dedicated DeAddict project;
- final HTTPS domain and redirect allow-list;
- approved consent documents and legal basis;
- verified backup retention and deletion behavior;
- named incident owner and private reporting channel;
- provider auth, session, abuse, export, deletion, and secret-management controls.
