# Status transitions enforced in the service layer

All vehicle, driver, and trip status changes are enforced in Elysia service functions (not UI-only). The PRD mandates automatic side-effects on dispatch, completion, cancellation, and maintenance — these rules must hold regardless of which client calls the API. UI may reflect status but cannot be the source of truth for transitions.
