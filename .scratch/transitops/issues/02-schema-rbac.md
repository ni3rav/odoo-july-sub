# 02 — Schema and RBAC foundation

**What to build:** A user can sign in and the system knows their role and permissions. All domain tables exist in Postgres with seeded roles, default permission matrix, and demo data ready for feature modules.

**Blocked by:** 01 — Domain docs

**Status:** resolved

- [x] Drizzle schema for roles, permissions, role_permissions, vehicles, drivers, trips, maintenance_records, fuel_logs, expenses, inventory_items
- [x] Extend Better Auth user table with roleId FK
- [x] Seed script with 4 roles and default permission matrix matching mockup Settings screen
- [x] `requirePermission(module, action)` guard helper for Elysia routes
- [ ] `pnpm db:push` succeeds against running Postgres (user runs migrations)

## Answer

Schema in `db/schema/`, RBAC helpers in `lib/rbac/` and `middleware/rbac.ts`, seed at `db/seed.ts`. Run `pnpm db:generate` / `pnpm db:push` then `pnpm db:seed`.
