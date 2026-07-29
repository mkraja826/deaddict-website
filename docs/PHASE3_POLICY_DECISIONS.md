# Phase 3 Policy Decisions

These are engineering decisions for the first private-account slice. They do not enable production collection and are not a substitute for legal, clinical, or regional review.

## Initial authentication method

The first account slice will support **passwordless email OTP / magic-link authentication only** through the reviewed identity provider.

Excluded from the first slice:

- Password authentication maintained by DeAddict.
- Phone-number OTP.
- Social OAuth providers.
- Anonymous accounts that later become permanent accounts.
- Administrative impersonation.

Reasons for the narrow first method:

- Reduces credential-handling complexity.
- Avoids collecting a phone number.
- Avoids adding third-party social identity providers before privacy review.
- Keeps redirect and recovery testing small enough to verify thoroughly.

## Redirect and origin rules

- Production redirects must use one exact HTTPS origin after the final domain is selected.
- Wildcard production redirects are forbidden.
- Local development may use only explicit localhost and `127.0.0.1` callback URLs.
- Preview deployments must not be allowed to receive production authentication callbacks.
- The callback must remove provider tokens from the visible URL immediately after session establishment.

## Session targets

These are maximum engineering targets, not evidence that a provider is configured yet:

- Access-token lifetime: no more than 60 minutes.
- Rotating refresh tokens: enabled using provider-supported secure behavior.
- Recent-authentication window for export, deletion, or email change: no more than 10 minutes.
- Current-session sign-out and all-session revocation must both be available.
- Identity recovery, confirmed compromise, and completed account deletion revoke all sessions.

## Consent documents

Persistence must remain disabled unless the deployment configuration names approved, immutable versions for all three required records:

- `privacy`
- `terms`
- `sensitive_data`

Draft repository text is not an approved production consent version. A production release must fail closed when any required version is absent.

Consent behavior:

- Acceptance is an explicit action and must not be preselected.
- Withdrawal is recorded as a new append-only decision.
- Withdrawal stops future optional sensitive-data collection.
- Withdrawal does not silently erase records; deletion remains a separate, clearly explained action.

## Data-retention targets

- User-owned application rows remain only while the account is active or until the user requests deletion.
- Completed export packages must expire and be deleted within 24 hours.
- Failed or abandoned export packages must not be retained indefinitely.
- Application logs must not contain recovery answers, tokens, email-link contents, or export payloads.
- A production launch is blocked until the selected provider's backup retention and deletion behavior is documented.
- The engineering target is that deleted primary data disappears immediately and backup copies age out within no more than 30 days; this is not a public promise until verified against the selected provider and plan.

## Deployment separation

The following must be separate environments:

- Disposable integration test database.
- Development project.
- Production project.

Production service-role credentials must never be used in development, preview builds, browser code, or GitHub pull-request workflows.

## Remaining approval gates

Before any production account or persistence feature is enabled:

1. Final HTTPS domain and exact redirect allow-list.
2. Dedicated DeAddict backend project, explicitly identified as non-MDMS and non-Astro.
3. Approved privacy, terms, and sensitive-data consent versions.
4. Verified backup maximum age and deletion behavior.
5. Named incident owner and secure reporting channel.
6. Authentication abuse, redirect, session-revocation, export, and deletion tests.
7. Regional legal and clinical review for the intended launch locations.
