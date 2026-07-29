# Server Function Contracts

These provider-neutral contracts describe future server-only operations. They are not deployed and contain no endpoint hostname, provider project, secret, or service credential.

## Shared rules

- Requests require an authenticated user session unless explicitly stated otherwise.
- The authenticated user is derived from the verified session. A client-supplied `user_id` is never accepted.
- Sensitive operations require authentication within the previous 10 minutes.
- Requests use `Content-Type: application/json` and reject unexpected properties.
- Mutating requests require a bounded idempotency key supplied in an HTTP header.
- Public responses never include provider payloads, tokens, SQL messages, stack traces, storage paths, or another user's identifiers.
- Logs contain a generated correlation ID, operation name, result class, and timing only. Email addresses and recovery content are redacted.
- Rate limits apply by verified user, session, and abuse-resistant network signals.

## Response envelope

Successful response:

```json
{
  "ok": true,
  "data": {},
  "correlationId": "opaque-generated-id"
}
```

Failure response:

```json
{
  "ok": false,
  "error": {
    "code": "RECENT_AUTH_REQUIRED",
    "message": "Please verify your identity again before continuing."
  },
  "correlationId": "opaque-generated-id"
}
```

Public error codes are stable and limited to actionable classes such as:

- `AUTH_REQUIRED`
- `RECENT_AUTH_REQUIRED`
- `INVALID_REQUEST`
- `CONFLICT`
- `RATE_LIMITED`
- `TEMPORARILY_UNAVAILABLE`

## Request data export

Conceptual route: `POST /v1/account/export-requests`

Body:

```json
{
  "format": "json"
}
```

Requirements:

- Recent authentication.
- One active request per user.
- Insert only a `requested` job row.
- Package generation and status updates run with a separate reviewed server capability.
- The response returns an opaque request ID and status, never a storage path.
- A later download grant is short-lived, single-user, and expires within 24 hours.

## Request account deletion

Conceptual route: `POST /v1/account/deletion-requests`

Body:

```json
{
  "confirmation": "DELETE"
}
```

Requirements:

- Recent authentication.
- Exact explicit confirmation.
- One active request per user.
- Revoke active sessions when processing starts.
- Block new writes during processing.
- Delete application-owned rows before deleting the identity.
- Status progression is server-only.
- Completion is reported only after all required deletion steps succeed.

## Revoke all sessions

Conceptual route: `POST /v1/account/sessions/revoke-all`

Body:

```json
{
  "scope": "all"
}
```

Requirements:

- Recent authentication.
- Revoke every refresh session for the verified identity, including the current session.
- Return a generic success response.
- The client clears private cached state and returns to a signed-out screen.

## Complete authentication callback

Conceptual route: `POST /v1/auth/callback/complete`

This route is provider-specific and must be implemented only after the final HTTPS domain and exact redirect allow-list are approved.

Requirements:

- Validate one-time code, expiry, state/nonce, intended origin, and replay protection.
- Exchange provider material server-side where the provider supports it.
- Set secure session material using provider-recommended browser controls.
- Remove one-time credentials from the visible browser URL.
- Use generic errors that do not reveal whether an account existed before the callback.

## Not permitted

- Accepting `user_id`, email address, role, storage path, status, or completion timestamps from the browser for privileged operations.
- Returning service credentials or provider tokens.
- Running deletion or export generation directly from static browser JavaScript.
- Exposing administrative cross-user routes to the normal client.
- Logging request bodies for these operations.