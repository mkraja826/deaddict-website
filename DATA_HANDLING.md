# DeAddict Data-Handling Contract

Status: Phase 2 development guardrail

DeAddict deals with information that may reveal habits, substance use, urges, setbacks, mood, health concerns, and other highly sensitive personal details. The repository must treat this information as sensitive even while the product remains a prototype.

## Current repository behavior

- No account system is active.
- No check-in or onboarding answer is intentionally saved or uploaded.
- No analytics, advertising pixel, session replay, billing, email capture, or marketing tracker is included.
- Onboarding selections may exist only in page memory and must disappear on refresh or navigation.

## Prohibited until an approved architecture exists

Recovery-related information must not be written to:

- `localStorage` or `sessionStorage`
- IndexedDB
- cookies
- URL query strings or fragments
- browser logs or analytics events
- third-party forms
- a database, object store, email, webhook, or cloud function

Do not add authentication merely to make the prototype appear complete. Authentication and storage must be introduced together with consent, access control, deletion, export, incident response, and security review.

## Required before persistent storage

A future persistence pull request must document and test:

1. Data inventory and purpose for every field.
2. Explicit consent and a clear non-consent path.
3. Minimum collection and retention periods.
4. Encryption in transit and at rest.
5. Row/user isolation and authorization tests.
6. Export and permanent deletion flows.
7. Account recovery and session-revocation controls.
8. Audit logging that excludes sensitive answers.
9. Backup deletion and incident-response procedures.
10. Regional legal, privacy, and clinical review.
11. A threat model covering shared devices, compromised accounts, browser extensions, and support access.
12. Automated tests proving one user cannot access another user's information.

## Product-language rule

Public copy must describe only controls that are currently implemented. Planned capabilities must be labelled **planned**, **prototype**, or **not active yet**.

## Emergency and medical boundary

DeAddict must not present itself as emergency care, medical treatment, detox supervision, diagnosis, or a substitute for qualified professionals. Urgent-support links must remain clearly separate from product features.
