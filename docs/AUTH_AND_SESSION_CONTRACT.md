# Authentication and Session Contract

This contract defines the minimum acceptable behavior for a future DeAddict account system. It does not enable authentication by itself.

## Account principles

- Accounts are optional; public education and unsaved demos remain accessible without login.
- Authentication must be provided by a reviewed identity system rather than a custom password database.
- Initial supported methods should be limited to passwordless email and, only after review, selected OAuth providers.
- Phone-number authentication is excluded from the first slice because it introduces additional identifier, delivery, abuse, and privacy risks.

## Sign-in behavior

- Sign-in and recovery responses must be generic: they must not confirm whether an address is registered.
- Magic links and OAuth redirects must use exact allow-listed HTTPS origins.
- Authentication tokens must never be placed in analytics events, application logs, support tickets, or user-visible URLs after the provider callback completes.
- Failed attempts must be rate-limited without permanently locking out legitimate users.

## Session behavior

- Access tokens are short-lived.
- Refresh tokens rotate according to provider-supported secure defaults.
- Sign-out revokes the current session; users must also have an option to revoke all sessions.
- Email change, account deletion, and data export require recent authentication.
- Sessions must be revoked after identity recovery, suspicious access, or credential compromise.
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
3. Revoked sessions cannot read private data.
4. Export and deletion fail without recent authentication.
5. User A cannot access User B through IDs, filters, RPC calls, or storage paths.
6. No client bundle or response contains privileged secrets.
