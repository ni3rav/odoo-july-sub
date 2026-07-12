# 08 — Fuel, expenses, and inventory

**What to build:** An operator can log fuel purchases, record other expenses, manage inventory items, and see total operational cost aggregated per vehicle and fleet-wide.

**Blocked by:** 04 — Vehicle registry, 06 — Trip lifecycle

**Status:** resolved

- [x] `modules/operations` APIs for fuel logs, expenses, and inventory items
- [x] `/fuel` page with fuel logs table, expenses table, inventory section
- [x] Log Fuel and Add Expense actions
- [x] Inventory CRUD with InStock/LowStock status based on reorder level
- [x] Total operational cost displayed (fuel + maintenance + expenses)

## Answer

Backend in `modules/operations/` (`operations.schema.ts`, `operations.service.ts`, `operations.route.ts`, `index.ts`), mounted at `/api/operations/*` in `app/api/[[...slugs]]/route.ts`. Routes cover fuel logs, expenses, and inventory CRUD, plus a `/cost-summary` endpoint that aggregates fuel + maintenance + expense cost per vehicle and fleet-wide. All routes are gated on the existing `fuel` permission module (view/create/edit/delete) — no new permission module was added.

Frontend in `components/operations/` (`operations-workspace.tsx`, `operations-queries.ts`, `fuel-log-data-table.tsx`, `fuel-log-form-dialog.tsx`, `expense-data-table.tsx`, `expense-form-dialog.tsx`, `inventory-data-table.tsx`, `inventory-form-dialog.tsx`, `inventory-status-badge.tsx`, `cost-summary.tsx`), rendered from `app/(app)/fuel/page.tsx`. Inventory status (`InStock`/`LowStock`) is computed server-side from `quantity` vs `reorderLevel` on every create/update.
