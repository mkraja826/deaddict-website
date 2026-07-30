# Phase 5 Deployment Guard Test Matrix

The Phase 5 branch must remain safe when cloned, previewed, merged, or deployed as a static site without any external configuration.

## Repository-default tests

| Case | Expected result |
|---|---|
| Load disabled runtime configuration | `deploymentMode` is `disabled` |
| Read public origin | `null` |
| Read redirect allow-list | Empty array |
| Read backend provider and project reference | Both `null` |
| Read capability flags | Every flag is `false` |
| Read approved consent versions | Empty array |
| Call disabled auth callback handler | `DEPLOYMENT_NOT_CONFIGURED` |
| Call disabled export handler | `DEPLOYMENT_NOT_CONFIGURED` |
| Call disabled deletion handler | `DEPLOYMENT_NOT_CONFIGURED` |
| Call disabled all-session revocation handler | `DEPLOYMENT_NOT_CONFIGURED` |
| Attempt to construct configured handlers | Throws `DEPLOYMENT_NOT_CONFIGURED` |

## Static rejection tests

The checker must fail when a reviewed test mutation introduces any of the following:

- A non-null public origin.
- A redirect origin.
- A backend provider or project reference.
- An enabled authentication, persistence, export, deletion, email, migration, session-revocation, key, secret, or incident-owner flag.
- An approved consent version without approval.
- A live URL in disabled server handlers.
- A provider client constructor.
- Service-role wording or JWT-like credential material.
- A network API in disabled server handlers.
- Missing required runtime schema fields.
- Runtime schema acceptance of unknown properties.

## Regression tests

Phase 5 must also preserve:

- Static HTML, metadata, link, and asset integrity.
- Non-persistent onboarding behavior.
- Disabled and non-persistent account preview behavior.
- Phase 4 request/response contract restrictions.
- Phase 3 migration parsing and SQL safety checks.
- Disposable PostgreSQL User A/User B/anonymous RLS isolation.
- Browser rendering and keyboard-focus behavior.

## Deployment-mode tests reserved for a future approved environment

The following are intentionally not executable in Phase 5 because no environment is selected:

- Exact production-origin validation.
- Real redirect rejection and callback completion.
- Email delivery and abuse limits.
- Provider token rotation and replay behavior.
- Secret-manager injection and rotation.
- Server-only export, deletion, and session-revocation functions.
- Backup expiry and deletion verification.

Those tests require a dedicated DeAddict environment and separate deployment approval.