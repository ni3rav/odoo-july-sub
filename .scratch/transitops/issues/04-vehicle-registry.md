# 04 — Vehicle registry

**What to build:** A fleet manager can view, filter, create, edit, and retire vehicles. Registration numbers are unique. Status badges match the mockup color system.

**Blocked by:** 02 — Schema and RBAC foundation, 03 — App shell and protected routes

**Status:** ready-for-agent

- [ ] `modules/fleet` with vehicle CRUD API and Zod schemas
- [ ] `/fleet` page with type/status/region filters, data table, Add Vehicle dialog
- [ ] Status badges: Available (green), OnTrip (blue), InShop (red), Retired (grey)
- [ ] Unique registration number enforced at API and DB level
- [ ] Permission checks: fleet module view/create/edit/delete
