# Deployment Approval Checklist

This checklist must be completed before any DeAddict account or persistence capability is enabled.

## Identity and environment

- [ ] A dedicated DeAddict backend project is explicitly identified.
- [ ] The project is not MDMS, CapDent, Astro, Horos, or another existing system.
- [ ] Development, staging, and production environments are separated.
- [ ] The final HTTPS production origin is approved.
- [ ] Redirect origins are exact HTTPS origins with no wildcards.
- [ ] Localhost redirects are absent from production.

## Authentication

- [ ] Passwordless email delivery is verified.
- [ ] Known and unknown accounts receive indistinguishable public responses.
- [ ] Email and IP abuse limits are tested.
- [ ] Access-token lifetime is no more than 60 minutes unless separately reviewed.
- [ ] Refresh-token rotation and replay protection are verified.
- [ ] Current-session and all-session revocation are tested.
- [ ] Sensitive operations require authentication within the previous 10 minutes.

## Data and authorization

- [ ] The Phase 3 migration is reviewed against the target provider version.
- [ ] User A/User B/anonymous RLS tests pass in the isolated target environment.
- [ ] No client-supplied user ID controls ownership.
- [ ] Export and deletion status changes are server-only.
- [ ] Storage paths are user-scoped and authorization tested.
- [ ] Free-text recovery storage remains disabled unless separately approved.

## Consent and privacy

- [ ] Privacy, Terms, and sensitive-data consent documents are approved and versioned.
- [ ] Consent is explicit and not preselected.
- [ ] Withdrawal creates an auditable decision without silently rewriting history.
- [ ] Data inventory and purpose are approved field by field.
- [ ] Retention and inactivity rules are documented.
- [ ] Backup deletion behavior and maximum restoration window are documented.

## Export and deletion

- [ ] Export requires recent authentication.
- [ ] Export packages are machine-readable and contain only the requesting user's data.
- [ ] Download authorization is short-lived and single-user scoped.
- [ ] Deletion revokes sessions before deleting application data and identity.
- [ ] Deletion retry and partial-failure behavior are tested.
- [ ] Backup expiry is disclosed accurately.

## Secrets and operations

- [ ] Public and private configuration are separated.
- [ ] No service credential is present in browser code or build artifacts.
- [ ] Secret owners, rotation, and revocation procedures are documented.
- [ ] Logs are structured and redact tokens, email addresses, sensitive content, and signed URLs.
- [ ] A private security-reporting channel exists.
- [ ] An incident owner and backup owner are named.
- [ ] Incident containment, session revocation, credential rotation, and user-notification procedures are tested.

## Final reviews

- [ ] Security review complete.
- [ ] Privacy and regional legal review complete.
- [ ] Clinical/content review complete.
- [ ] Accessibility review complete on the deployed origin.
- [ ] Keyboard, screen reader, zoom, reduced motion, and mobile behavior verified.
- [ ] Deployment approval recorded with project identifier, domain, approver, date, and rollback plan.

Until every applicable item is complete, `deploymentMode` must remain `disabled` and all account operations must fail closed.