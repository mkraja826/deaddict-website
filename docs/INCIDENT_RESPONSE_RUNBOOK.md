# Private-Data Incident Response Runbook

This runbook is a pre-production engineering requirement. It does not claim that DeAddict currently operates a production account system.

## Incident examples

Treat the following as security or privacy incidents:

- A user can read or change another user's row.
- A service-role, SMTP, signing, backup, or database credential is exposed.
- Authentication tokens appear in logs, analytics, URLs, screenshots, or support messages.
- Export packages are accessible without recent authentication or to the wrong user.
- Deletion does not remove expected primary records.
- Recovery answers are sent to an unapproved third party.
- A redirect or account-recovery flow can be hijacked.
- A backup, log, or storage location is publicly accessible.

## Severity

### Critical

- Confirmed cross-user data access.
- Confirmed privileged-secret exposure.
- Public exposure of recovery data or export packages.
- Active account takeover affecting more than one user.

### High

- Single-user unauthorized access with no evidence of wider exposure.
- Broken deletion or export authorization.
- Tokens or magic-link contents written to a restricted internal log.

### Medium

- Security control misconfiguration with no evidence of access.
- Excessive non-sensitive metadata retention.
- Failed session revocation affecting a limited test environment.

## Immediate containment

For Critical or High incidents:

1. Disable the affected feature or place the service in a non-persistent maintenance mode.
2. Revoke exposed service credentials and signing material.
3. Revoke affected user sessions and, when scope is uncertain, revoke all sessions.
4. Disable export downloads and privileged functions until authorization is reverified.
5. Preserve minimal technical evidence without copying recovery content into tickets or chat.
6. Record the exact UTC time, affected environment, commit, deployment, and known scope.

## Investigation rules

- Do not paste sensitive rows, tokens, email-link contents, or export payloads into GitHub issues.
- Use record identifiers and redacted timestamps where possible.
- Determine the earliest possible exposure time and the latest confirmed safe time.
- Check authentication logs, database audit evidence, deployment history, function logs, storage access, and secret rotation history.
- Explicitly test whether User A can access User B using direct IDs, filters, RPC calls, storage paths, exports, and cached responses.
- Document uncertainty instead of assuming no access occurred.

## Recovery

Before restoring the affected feature:

1. Patch the root cause on an isolated branch.
2. Add a regression test that fails on the vulnerable behavior.
3. Re-run the full RLS, authentication, export, deletion, and browser suites.
4. Rotate any credential that may have been exposed.
5. Verify session revocation.
6. Verify logs and caches no longer retain prohibited values.
7. Obtain review from the named security owner.

## User and regulatory communication

- A production launch must name the person responsible for incident decisions and communications.
- Notification timing and content depend on the affected users, data, countries, contracts, and applicable law.
- Do not make a categorical statement that no data was accessed unless evidence supports it.
- Communications must explain what happened, what information was involved, what was done, and what users should do next.

## Post-incident work

- Write a timeline and root-cause analysis.
- Record which preventive and detective controls failed.
- Add automated tests, monitoring, and operational checks.
- Review whether collection can be reduced further.
- Review backup, retention, support, and third-party exposure.
- Track every corrective action to closure.

## Pre-production blocker

Accounts and sensitive persistence must remain disabled until the deployment has:

- A named incident owner.
- A private reporting channel.
- Credential-rotation procedures.
- Session-revocation procedures.
- Provider log-access procedures.
- A verified method to disable persistence, exports, and privileged functions quickly.
