# 05 — Driver management

**What to build:** A safety officer or fleet manager can view, create, edit, and manage driver profiles with license details and safety scores displayed as stars.

**Blocked by:** 02 — Schema and RBAC foundation, 03 — App shell and protected routes

**Status:** resolved

- [x] `modules/fleet` driver CRUD API and Zod schemas
- [x] `/drivers` page with data table, safety score star display, Add Driver dialog
- [x] Status badges: Available, OnTrip, OffDuty, Suspended
- [x] License expiry date stored and available for dispatch validation
- [x] Permission checks: drivers module view/create/edit/delete

## Answer

Driver management is implemented end to end under `/api/fleet/drivers` and
`/drivers`. It supports filtering, sorting, pagination, create/edit dialogs,
license compliance details, safety score stars, status management, and
permission-gated suspension. Active-trip drivers cannot be suspended.
