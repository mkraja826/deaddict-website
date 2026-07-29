# Authentication and Session Contract

This contract defines the minimum acceptable behavior for a future DeAddict account system. It does not enable authentication by itself.

## Account principles

- Accounts are optional; public education and unsaved demos remain accessible without login.
- Authentication must be provided by a reviewed identity system rather than a custom password database.
- The initial account slice supports passwordless email OTP / magic-link authentication only.
- Password authentication, phone OTP, social OAuth, anonymous-to-permanent account conversion, and administrative impersonation are excluded from the first slice.
- No password database is maintained by DeAddict.

## Sign-in behavior

- Sign-in and recovery responses must be generic: they must not confirm whether an address is registered.
- Production magic links must use one exact allow-listed HTTPS origin after the final domain is selected.
- Wildcard production redirects and production callbacks to preview deployments are forbidden.
- Local development may use only explicit localhost and `127.0.0.1` callback URLs.
- Authentication tokens must never be placed in analytics events, application logs, support tickets, or user-visible URLs after the provider callback completes.
- Failed attempts must be rate-limited without permanently locking out legitimate users.

## Session behavior

- Access-token lifetime must be no more than 60 minutes.
- Refresh tokens rotate according to provider-supported secure behavior.
- Sign-out revokes the current session; users must also have an option to revoke all sessions.
- Email change, account deletion, and data export require authentication no older than 10 minutes.
- Sessions must be revoked after identity recovery, suspicious access, confirmed compromise, or completed account deletion.
- Sensitive pages must avoid displaying recovery details in page titles, browser notifications, or lock-screen previews.

## Client boundary

The browser may receive only public configuration and user-scoped tokens. It must never receive:

- Service-role or database-owner credentials.
- SMTP credentials.
- Private signing keys.
- Backup credentials.
- Cross-user administrative APIs.

## Server-only operations

The following operations must execute in reviewed server-side functions:

- Final account deletion orchestration.
- Export package generation and short-lived download authorization.
- Administrative incident response and session revocation.
- Any operation requiring elevated database privileges.

Each privileged function must have one named purpose, structured redacted logging, rate limits, and authorization tests.

## Required tests

1. Unknown and known emails receive indistinguishable public responses.
2. Unapproved redirect origins are rejected.
3. Tokens are removed from the visible callback URL after session establishment.
4. Revoked sessions cannot read private data.
5. Export and deletion fail without authentication from the previous 10 minutes.
6. User A cannot access User B through IDs, filters, RPC calls, storage paths, exports, or caches.
7. No client bundle or response contains privileged secrets.
8. Current-session and all-session revocation both work.

## Deployment blockers

This contract cannot be implemented in production until all of the following are known and reviewed:

- Final HTTPS domain.
- Dedicated DeAddict identity/backend project.
- Exact redirect allow-list.
- Provider token and refresh settings.
- Email delivery provider and abuse controls.
- Approved privacy, terms, and sensitive-data consent versions.
- Named incident owner and private reporting channel.
