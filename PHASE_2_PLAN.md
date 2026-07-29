# Phase 2 — Trust and Onboarding Foundation

## Goal

Turn the static Phase 1 prototype into a clearer product journey without enabling accounts, cloud storage, billing, medical decision-making, or persistent recovery records.

## Included in this phase

1. **Trust pages**
   - Current prototype privacy notice
   - Prototype terms of use
   - Accessibility statement
   - Clear links from public pages

2. **Guided onboarding demo**
   - Choose a broad support category
   - Choose an approach: understand, reduce, or stop
   - Review a safety and privacy summary
   - Continue into the existing check-in demo
   - Keep selections only in JavaScript memory for the current page session

3. **Data-handling contract**
   - Explicitly prohibit sensitive persistence until architecture review
   - Define which future controls are mandatory before storage is enabled
   - Keep analytics, advertising pixels, authentication, and billing disabled

4. **Verification**
   - Static link, metadata, fragment, and JavaScript checks
   - Desktop and mobile Chrome smoke screenshots
   - Keyboard review of onboarding controls

## Explicitly excluded

- Authentication or social login
- Database, Supabase, Firebase, cookies, localStorage, IndexedDB, or cloud persistence for recovery information
- Personalized medical advice, diagnosis, treatment plans, detox instructions, or crisis triage
- Email collection, marketing automation, analytics, advertising, subscriptions, or payment processing
- Claims that privacy/security controls exist before they are implemented and independently reviewed

## Completion gate

Phase 2 is complete only when:

- Every public promise matches current behavior.
- Onboarding works without preselected answers.
- Leaving or refreshing onboarding removes all selections.
- Trust pages are linked and pass static validation.
- Automated browser screenshots pass on desktop and mobile.
- No persistent storage API is used for recovery-related information.
