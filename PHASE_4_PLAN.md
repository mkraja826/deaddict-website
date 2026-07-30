# Phase 4 — Account UI and Server Contracts

Status: implementation shell only. No backend project, authentication provider, email delivery, or sensitive-data persistence is connected by this branch.

## Goal

Turn the Phase 3 architecture into reviewable user-interface and server-contract artifacts without enabling production accounts.

## Deliverables

1. **Account preview**
   - Passwordless email sign-in request screen.
   - Explicit privacy, terms, and sensitive-data consent decisions.
   - Generic success and error wording that does not reveal whether an account exists.
   - Signed-in settings preview for discreet mode, session revocation, export, and deletion.
   - All interactions remain page-memory-only and network-disabled.

2. **State machine**
   - Signed out.
   - Validating input.
   - Link-requested confirmation.
   - Callback verification.
   - Signed in.
   - Recent-authentication required.
   - Export requested.
   - Deletion requested.
   - Signed out after revocation.

3. **Provider-neutral client boundary**
   - A disabled auth adapter interface.
   - No Supabase URL, anonymous key, service key, redirect URL, email provider, or production domain embedded in source.
   - No token parsing or storage before a dedicated backend and redirect allow-list are approved.

4. **Server-only contracts**
   - Request export.
   - Request deletion.
   - Revoke all sessions.
   - Complete auth callback.
   - Consistent success/error envelopes.
   - Recent-authentication requirements for sensitive operations.

5. **Verification**
   - JavaScript syntax checks.
   - Static rejection of network APIs and browser persistence in the account preview controller.
   - JSON contract validation.
   - Browser rendering and local-only interaction checks.

## Explicit exclusions

Phase 4 does not:

- Connect to Supabase or another identity/backend provider.
- Apply the Phase 3 migration.
- Send email or magic links.
- Store email addresses, consent decisions, tokens, check-ins, goals, exports, or deletion requests.
- Add analytics, advertising, session replay, billing, AI processing, or marketing capture.
- Add production account recovery, export generation, deletion orchestration, or administrative access.

## Merge gate

This phase may be merged as a disabled implementation shell after the account preview, state machine, schemas, and automated checks pass. Deployment of real accounts remains separately blocked by the Phase 3 deployment boundary.