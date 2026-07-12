# TransitOps — Implementation Spec

Synthesized from [docs/prd.md](../../docs/prd.md), [docs/mockup.png](../../docs/mockup.png), and [docs/plan.md](../../docs/plan.md). Domain language is defined in [CONTEXT.md](../../CONTEXT.md).

## Objective

Build an end-to-end transport operations platform: vehicle and driver registry, trip dispatch with business-rule enforcement, maintenance workflow, fuel/expense/inventory tracking, dashboard KPIs, analytics with CSV export, and RBAC with a permission matrix.

## Resolved Decisions

| Topic | Decision |
|-------|----------|
| Trip lifecycle | `Draft` → `Dispatched` → `InTransit` → `Completed`; `Cancelled` from `Dispatched` or `InTransit` ([ADR-0001](../../docs/adr/0001-trip-five-state-lifecycle.md)) |
| RBAC | DB-stored module × action permission matrix ([ADR-0002](../../docs/adr/0002-rbac-permission-matrix.md)) |
| Status transitions | Enforced in Elysia service layer ([ADR-0003](../../docs/adr/0003-status-transitions-in-service-layer.md)) |
| Roles | `FleetManager`, `Dispatcher`, `SafetyOfficer`, `FinancialAnalyst` (PRD "Driver" user → **Dispatcher**) |
| Issue tracker | Local markdown under `.scratch/transitops/issues/` |

## Screens (match mockup)

| Route | Screen |
|-------|--------|
| `/sign-in` | Split-layout auth with role list |
| `/dashboard` | 7 KPI cards, recent trips table, vehicle status chart |
| `/fleet` | Vehicle registry with filters and CRUD |
| `/drivers` | Driver registry with safety score stars and CRUD |
| `/trips` | Trip dispatcher with 4-step stepper and validation errors |
| `/maintenance` | Service log form + history table |
| `/fuel` | Fuel logs, expenses, inventory, total operational cost |
| `/analytics` | KPI cards, revenue/cost charts, CSV export |
| `/settings` | Profile form + RBAC permission matrix editor |

## Entities

Users, Roles, Permissions, Vehicles, Drivers, Trips, Maintenance Records, Fuel Logs, Expenses, Inventory Items.

## Business Rules

1. Vehicle registration number must be unique.
2. `Retired` or `InShop` vehicles excluded from dispatch selection.
3. Expired license or `Suspended` driver cannot be assigned.
4. Vehicle or driver already `OnTrip` cannot be assigned to another trip.
5. Cargo weight must not exceed vehicle max load capacity.
6. Dispatch → vehicle + driver `OnTrip`, trip `Dispatched`.
7. Start transit → trip `InTransit`.
8. Complete (from `InTransit`, requires odometer + fuel) → vehicle + driver `Available`, trip `Completed`.
9. Cancel (from `Dispatched` or `InTransit`) → vehicle + driver `Available`, trip `Cancelled`.
10. Open maintenance record → vehicle `InShop`.
11. Close maintenance → vehicle `Available` (unless `Retired`).
12. Operational cost per vehicle = sum(fuel) + sum(maintenance) + sum(expenses).

## Demo Scenario (acceptance walkthrough)

1. Register vehicle Van-05, 500 kg capacity, `Available`.
2. Register driver Alex with valid license.
3. Create trip, cargo 450 kg.
4. System validates 450 ≤ 500, allows dispatch.
5. Vehicle and driver become `OnTrip`.
6. Complete trip with final odometer and fuel consumed.
7. Vehicle and driver return to `Available`.
8. Create maintenance record (Oil Change) → vehicle `InShop`, hidden from dispatch.
9. Reports reflect updated operational cost and fuel efficiency.

## Out of Scope (v1)

PDF export, email license reminders, vehicle document management, dark-mode toggle UI.

## Implementation Tickets

See `issues/` — numbered 01–10 in dependency order.
