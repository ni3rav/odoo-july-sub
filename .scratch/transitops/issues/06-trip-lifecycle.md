# 06 — Trip lifecycle

**What to build:** A dispatcher can create trips, dispatch them through the five-state lifecycle, and see inline validation errors (e.g. capacity exceeded). All PRD business rules are enforced server-side with automatic vehicle and driver status transitions.

**Blocked by:** 04 — Vehicle registry, 05 — Driver management

**Status:** ready-for-agent

- [ ] `modules/trips` with CRUD and transition endpoints: dispatch, start-transit, complete, cancel
- [ ] `/trips` page with 4-step stepper (Draft → Dispatched → In Transit → Completed)
- [ ] Dispatch validation: capacity, license expiry, suspended driver, OnTrip conflicts, InShop/Retired exclusion
- [ ] Inline error display matching mockup (e.g. "Capacity exceeded by X kg — Dispatch blocked")
- [ ] Complete requires actual odometer and fuel consumed; restores vehicle + driver to Available
- [ ] Cancel from Dispatched or InTransit restores vehicle + driver to Available
