# 07 — Maintenance workflow

**What to build:** A fleet manager can log maintenance records for vehicles. Creating an open record automatically sets the vehicle to InShop; closing it restores Available. The vehicle is hidden from dispatch while in maintenance.

**Blocked by:** 04 — Vehicle registry

**Status:** ready-for-agent

- [ ] `modules/operations` maintenance CRUD API
- [ ] `/maintenance` page with log form and service history table
- [ ] Create maintenance → vehicle status InShop
- [ ] Close maintenance → vehicle status Available (unless Retired)
- [ ] Status flow note visible on page (Available → In Shop → Available)
