# 04 — Vehicle registry

**What to build:** A fleet manager can view, filter, create, edit, and retire vehicles. Registration numbers are unique. Status badges match the mockup color system.

**Blocked by:** 02 — Schema and RBAC foundation, 03 — App shell and protected routes

**Status:** resolved

- [x] `modules/fleet` with vehicle CRUD API and Zod schemas
- [x] `/fleet` page with type/status/region filters, data table, Add Vehicle dialog
- [x] Status badges: Available (green), OnTrip (blue), InShop (red), Retired (grey)
- [x] Unique registration number enforced at API and DB level
- [x] Permission checks: fleet module view/create/edit/delete

## Answer

API/service/schema in `modules/fleet/`, mounted at `/api/fleet` in `app/api/[[...slugs]]/route.ts`. Page at `app/(app)/fleet/page.tsx` (no sidebar yet — ticket 03 is still in progress, so it's reached by direct URL). UI in `components/fleet/`, new shadcn-style primitives in `components/ui/{badge,dialog,select}.tsx`. Retiring is idempotent and enforced in the service layer per ADR 0003. Registration-number uniqueness relies on the existing DB unique constraint, translated to a friendly 409 in the API. No automated tests — skipped by explicit user choice for this ticket; verified via typecheck/lint and manual DB/API checks (browser verification was skipped by the user).
