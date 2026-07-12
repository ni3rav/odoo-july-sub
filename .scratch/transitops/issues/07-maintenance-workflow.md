# 07 — Maintenance workflow

**What to build:** A fleet manager can log maintenance records for vehicles. Creating an open record automatically sets the vehicle to InShop; closing it restores Available. The vehicle is hidden from dispatch while in maintenance.

**Blocked by:** 04 — Vehicle registry

**Status:** resolved

- [x] `modules/operations` maintenance CRUD API
- [x] `/maintenance` page with log form and service history table
- [x] Create maintenance → vehicle status InShop
- [x] Close maintenance → vehicle status Available (unless Retired)
- [x] Status flow note visible on page (Available → In Shop → Available)

## Answer

Maintenance workflow is implemented end to end under `/api/maintenance` and
`/maintenance`. Fleet managers can log service records, view history with
filters, close open records, and delete draft open records. Creating maintenance
moves the vehicle to In Shop in a transaction; closing restores Available unless
the vehicle is Retired. Available-only vehicles appear in the log form, keeping
In Shop vehicles hidden from dispatch.
