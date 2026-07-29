# Data Export and Account Deletion Runbook

This runbook defines the future server-side behavior. It is not active in the current static prototype.

## Shared requirements

- Require an authenticated session and recent reauthentication.
- Resolve the user only from the verified session, never from a caller-supplied user ID.
- Rate-limit requests and prevent concurrent duplicate jobs.
- Use redacted operational logs containing request IDs and state transitions, not recovery content.
- Keep elevated credentials server-side.
- Return generic failure messages to the client and preserve detailed errors only in protected logs.

## Export flow

1. User confirms an export request after recent authentication.
2. Server inserts or accepts one `export_requests` row owned by the session user.
3. A server-only worker reads only that user's profile, consent, goals, and structured check-ins.
4. The worker creates a versioned JSON package with:
   - schema version;
   - generated timestamp;
   - profile settings;
   - consent history;
   - goals;
   - structured check-ins.
5. The package must not contain access tokens, refresh tokens, provider metadata, internal logs, or other users' information.
6. The encrypted or access-controlled package receives a short expiry.
7. Download authorization is single-user and short-lived.
8. On expiry, the package is removed and the request becomes `expired`.

## Deletion flow

1. User confirms deletion after recent authentication and a clear irreversible-action warning.
2. Server creates one `deletion_requests` row for the session user.
3. New writes are blocked or the account is placed in a deletion-pending state.
4. The server deletes application-owned rows in a transaction or relies on reviewed `on delete cascade` behavior.
5. External packages, queued notifications, cached derived data, and export files are removed.
6. The authentication identity is deleted only after application cleanup succeeds.
7. Active sessions and refresh tokens are revoked.
8. The client receives a completed state without exposing internal identifiers.

## Failure handling

- If cleanup fails before identity deletion, retain the authenticated identity and mark the request `failed` for safe retry.
- Never delete the identity first and leave inaccessible orphaned private rows.
- Never claim complete deletion while active copies remain outside documented backup-retention windows.
- Restore tests must confirm deleted accounts are not silently resurrected into active product data.

## Backup and retention gate

Before production launch, document:

- database backup frequency;
- backup encryption;
- backup access roles;
- maximum retention;
- deletion behavior within backups;
- restore-time suppression of previously deleted accounts;
- legal or fraud-retention exceptions, if any.

## Verification cases

- User A cannot export or delete User B.
- A stale session cannot start export or deletion.
- Duplicate requests do not create uncontrolled jobs.
- Export contains only the documented schema.
- Deletion removes goals and check-ins through verified cascades.
- Failed cleanup can be retried safely.
- Expired export files cannot be downloaded.
