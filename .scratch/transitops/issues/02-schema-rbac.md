# 02 — Schema and RBAC foundation

**What to build:** A user can sign in and the system knows their role and permissions. All domain tables exist in Postgres with seeded roles, default permission matrix, and demo data ready for feature modules.

**Blocked by:** 01 — Domain docs

**Status:** ready-for-agent

- [ ] Drizzle schema for roles, permissions, role_permissions, vehicles, drivers, trips, maintenance_records, fuel_logs, expenses, inventory_items
- [ ] Extend Better Auth user table with roleId FK
- [ ] Seed script with 4 roles and default permission matrix matching mockup Settings screen
- [ ] `requirePermission(module, action)` guard helper for Elysia routes
- [ ] `pnpm db:push` succeeds against running Postgres
