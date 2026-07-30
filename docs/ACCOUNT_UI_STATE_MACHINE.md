# Account UI State Machine

This document describes the Phase 4 account preview and the future production transitions. The current browser implementation performs no network or persistence operations.

## States

### `signed_out`

Visible:

- Email input.
- Privacy, terms, and sensitive-data decisions.
- Continue-without-account link.

Rules:

- No decision is preselected.
- The submit action is blocked until the email format and all required decisions are valid.
- The browser must not retain the email after the transition.

### `link_request_pending`

Production-only transient state.

Rules:

- Disable duplicate submission while the provider request is active.
- Never expose whether an account already exists.
- Apply abuse controls without logging the raw address in general application logs.

The Phase 4 preview skips the network operation and enters `link_requested` locally.

### `link_requested`

Visible:

- Generic confirmation.
- Link-expiry and approved-origin explanation.
- Return-to-start action.

Rules:

- Use the same public wording for known and unknown addresses.
- Do not display the submitted address after the transition.
- Do not reveal provider response details.

### `callback_verifying`

Production-only state.

Rules:

- Accept callbacks only on exact approved HTTPS origins.
- Remove provider tokens and one-time codes from the visible URL immediately after verification.
- Reject expired, replayed, malformed, or origin-mismatched callbacks.
- Do not render private account content before verification completes.

### `signed_in`

Visible:

- Discreet-mode preference.
- Session controls.
- Export control.
- Deletion control.

Rules:

- Every data request is scoped by the authenticated identity, never by a client-supplied `user_id`.
- Sensitive values are not placed in titles, notifications, analytics, or logs.
- Export, deletion, email change, and all-session revocation require recent authentication.

### `recent_auth_required`

Visible:

- Neutral explanation.
- Provider reauthentication action.
- Cancel action.

Rules:

- The original sensitive operation must not execute before reauthentication succeeds.
- Reauthentication evidence must expire quickly and be bound to the current user and operation.

### `export_requested`

Visible:

- Request accepted status.
- No immediate download promise.
- Expiry and notification explanation.

Rules:

- Only one active request per user.
- Package generation and status advancement are server-only.
- Download authorization is short-lived and user-bound.

### `deletion_confirmation`

Visible:

- Consequence summary.
- Explicit confirmation phrase.
- Recent-authentication requirement.
- Cancel action.

Rules:

- No dark patterns, hidden alternatives, or preselected confirmation.
- The account remains intact until the final server-side deletion transaction begins.

### `deletion_requested`

Visible:

- Request status.
- Session-revocation notice.
- Support route for failures.

Rules:

- New writes are blocked once processing begins.
- Application rows are removed before identity deletion.
- Completion is not claimed until identity deletion and required provider cleanup succeed.

### `signed_out_after_revocation`

Visible:

- Neutral signed-out confirmation.
- Public demo and education links.

Rules:

- Private cached views must be cleared.
- Revoked tokens must fail on subsequent private-data requests.

## Error principles

- Public authentication errors remain generic.
- Validation errors identify only the field or decision the user can correct.
- Server errors use stable public codes and a private correlation identifier.
- No error response includes tokens, provider payloads, SQL details, stack traces, or another user's identifiers.

## Phase 4 preview mapping

The current `account.html` and `account.js` implement local demonstrations of:

- `signed_out`
- `link_requested`
- `signed_in`
- `export_requested` messaging
- `deletion_confirmation`
- session-revocation messaging

They do not implement provider requests, callbacks, sessions, exports, deletion, or persistence.