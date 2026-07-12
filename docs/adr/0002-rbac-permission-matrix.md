# RBAC permission matrix stored in the database

Access control uses four roles (`FleetManager`, `Dispatcher`, `SafetyOfficer`, `FinancialAnalyst`) with a module × action permission matrix (view, create, edit, delete) persisted in the database and editable via the Settings screen. Route-level role checks alone are insufficient because the mockup requires a granular matrix UI and per-action gating across fleet, drivers, trips, maintenance, fuel, analytics, and settings modules.
