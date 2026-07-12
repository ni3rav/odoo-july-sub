# 06 — Trip lifecycle

**What to build:** A dispatcher can create trips, dispatch them through the five-state lifecycle, and see inline validation errors (e.g. capacity exceeded). All PRD business rules are enforced server-side with automatic vehicle and driver status transitions.

**Blocked by:** 04 — Vehicle registry, 05 — Driver management

**Status:** resolved

- [x] `modules/trips` with CRUD and transition endpoints: dispatch, start-transit, complete, cancel
- [x] `/trips` page with 4-step stepper (Draft → Dispatched → In Transit → Completed)
- [x] Dispatch validation: capacity, license expiry, suspended driver, OnTrip conflicts, InShop/Retired exclusion
- [x] Inline error display matching mockup (e.g. "Capacity exceeded by X kg — Dispatch blocked")
- [x] Complete requires actual odometer and fuel consumed; restores vehicle + driver to Available
- [x] Cancel from Dispatched or InTransit restores vehicle + driver to Available

## Answer

Trip lifecycle is implemented end to end under `/api/trips` and `/trips`. The
dispatcher workspace supports creating draft trips, a four-step status stepper,
dispatch preview validation with inline errors, start transit, complete with
odometer and fuel capture, and cancel from Dispatched or In Transit. Server-side
rules enforce capacity, license expiry, driver/vehicle availability, and
automatic status transitions for vehicles and drivers.
