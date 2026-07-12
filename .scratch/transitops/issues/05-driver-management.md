# 05 — Driver management

**What to build:** A safety officer or fleet manager can view, create, edit, and manage driver profiles with license details and safety scores displayed as stars.

**Blocked by:** 02 — Schema and RBAC foundation, 03 — App shell and protected routes

**Status:** ready-for-agent

- [ ] `modules/fleet` driver CRUD API and Zod schemas
- [ ] `/drivers` page with data table, safety score star display, Add Driver dialog
- [ ] Status badges: Available, OnTrip, OffDuty, Suspended
- [ ] License expiry date stored and available for dispatch validation
- [ ] Permission checks: drivers module view/create/edit/delete
