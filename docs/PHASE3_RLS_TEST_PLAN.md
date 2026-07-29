# Phase 3 Row-Level Security Test Plan

Run this plan only against a disposable local or isolated test project. Never use real recovery information.

## Test identities

- User A
- User B
- Anonymous client
- Reviewed server-side service process

Use synthetic UUIDs and synthetic structured values only.

## Per-table client tests

For each of `user_profiles`, `consent_records`, `goals`, `checkins`, `export_requests`, and `deletion_requests`:

1. Anonymous select returns no private rows or an authorization error.
2. Anonymous insert, update, and delete fail.
3. User A can select permitted rows owned by User A.
4. User A cannot select rows owned by User B, including direct primary-key lookup.
5. User A cannot insert a row with User B's `user_id`.
6. User A cannot update an owned row to User B's `user_id`.
7. User A cannot update or delete User B's rows.
8. User B receives the symmetric result.

## Goal/check-in relationship tests

1. User A can insert a check-in for User A's goal.
2. User A cannot insert a check-in referencing User B's goal even when `checkins.user_id` is User A.
3. User A cannot change an existing check-in to reference User B's goal.
4. Deleting User A's goal cascades only User A's related check-ins.
5. Duplicate `(user_id, goal_id, occurred_on)` entries fail.
6. Mood and urge values outside 0–10 fail.

## Export/deletion request tests

1. Authenticated users may insert only `requested` status rows for themselves.
2. Clients cannot update request status to `ready`, `completed`, or `failed`.
3. Clients cannot set completion or expiry timestamps through updates.
4. User A cannot see User B's request existence or status.
5. Only the reviewed server-side process may advance job states.

## Ownership and cascade tests

1. Deleting a synthetic auth identity removes all application-owned rows for that identity.
2. Deleting User A does not alter User B data.
3. Failed application cleanup prevents identity deletion in the server orchestration layer.
4. Restoring a backup does not reactivate rows for identities recorded as deleted after the backup snapshot.

## Session and secret tests

1. Revoked and expired tokens fail all private operations.
2. Browser bundles and network responses contain no service credential.
3. Authentication and database logs omit tokens and structured recovery values.
4. Public error responses do not reveal another user's record existence.

## Pass condition

Phase 3 deployment cannot proceed unless every cross-user access attempt fails, the expected own-user operations pass, client privilege escalation fails, and the result is recorded with the exact migration SHA and disposable environment identifier.
